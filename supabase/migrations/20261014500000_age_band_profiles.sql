/*
  # Age band + consent status on profiles (docs/age-policy.md, Option B: 13+ with parental consent)

  Only the BAND is stored, never a birth year. 'under13' is never stored: such an answer
  never creates an account (and deletes one that Google sign-in already created).

  1. Columns on `profiles`:
       age_band        text NULL  ('13to17' | 'adult'; NULL = not asked yet, e.g. old accounts)
       age_recorded_at timestamptz NULL
       consent_status  text NOT NULL DEFAULT 'unknown'
                       ('unknown' | 'not_required' | 'pending_consent' | 'active_minor')
     Clients can never change these directly: `profiles` has no UPDATE policy, and the
     BEFORE UPDATE trigger below also rejects changes made by the anon/authenticated roles.

  2. Consent tables (RLS on; only the child may SELECT its own `parental_consents` row):
       parental_consents, parent_consent_requests, parent_withdraw_tokens.
     Only SHA-256 hashes of tokens are stored. The parent's year of birth is never stored,
     only the `parent_declared_adult` flag after the server checked it.

  3. Helpers (schema `private` is not exposed by the Data API):
       public.can_write_game_data(uuid)  -> consent_status IN ('not_required','active_minor')
       public.is_minor_account(uuid)     -> age_band = '13to17' (pending or active)
     Both are SECURITY DEFINER and executable by service_role only (they would otherwise be
     an oracle for "is this user a child?"). RLS policies use private.* wrappers instead.

  4. public.delete_account_by_id(uuid): deletes every row of a user in every table, then
     the auth user. service_role only; also used by delete_own_account(), set_my_age_band()
     ('under13') and the parent decline / withdraw flow.

  5. Profile INSERT (direct insert or create_my_profile):
       - client can't choose consent_status / age_recorded_at (computed from age_band);
       - '13to17' gets a neutral generated username ('player' + 8 digits) and no avatar
         (data minimisation until a parent consents); the child's chosen name is dropped;
       - the leaderboard row is created only for accounts that may write game data
         (adults at insert; minors when the parent approves).

  6. RPCs (authenticated):
       create_my_profile(p_username text, p_age_band text) -> {consent_status, age_band}
       set_my_age_band(p_age_band text) -> {consent_status, age_band} | {deleted: true}
*/

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
-- RLS policies evaluated for anon/authenticated call private.* helpers.
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 1. Columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_band text NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_recorded_at timestamptz NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_status text NOT NULL DEFAULT 'unknown';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_age_band_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_age_band_check
  CHECK (age_band IS NULL OR age_band IN ('13to17', 'adult'));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_consent_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_consent_status_check
  CHECK (consent_status IN ('unknown', 'not_required', 'pending_consent', 'active_minor'));

-- ---------------------------------------------------------------------------
-- 2. Consent tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parental_consents (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_email          text        NOT NULL,
  parent_name           text        NOT NULL,
  parent_declared_adult boolean     NOT NULL,
  -- Extend with e.g. 'digilocker_token' when a DPDP-accepted verification method is added
  -- (see CONSENT_METHODS in src/config/consent.ts).
  method                text        NOT NULL CHECK (method IN ('email_link_declaration')),
  notice_version        text        NOT NULL,
  consented_at          timestamptz NOT NULL DEFAULT now(),
  -- HMAC-SHA256 of the parent's IP (keyed with a server secret), never the IP itself.
  ip_hash               text        NULL
);
CREATE INDEX IF NOT EXISTS parental_consents_child ON public.parental_consents (child_id);

CREATE TABLE IF NOT EXISTS public.parent_consent_requests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_email text        NOT NULL,
  token_hash   text        UNIQUE NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  used_at      timestamptz NULL,
  outcome      text        NULL CHECK (outcome IN ('approved', 'declined', 'superseded')),
  -- 'failed' = the email provider refused it: the link never reached anyone, the request
  -- is invalid and does not count against the daily caps (it still counts for the cooldown).
  email_status text        NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed'))
);
CREATE INDEX IF NOT EXISTS parent_consent_requests_child ON public.parent_consent_requests (child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS parent_consent_requests_email ON public.parent_consent_requests (parent_email, created_at DESC);

CREATE TABLE IF NOT EXISTS public.parent_withdraw_tokens (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_email text        NOT NULL,
  token_hash   text        UNIQUE NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  -- The consent request this token was emailed with (NULL = sent with the approval confirmation).
  request_id   uuid        NULL REFERENCES public.parent_consent_requests(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  revoked_at   timestamptz NULL
);
CREATE INDEX IF NOT EXISTS parent_withdraw_tokens_child ON public.parent_withdraw_tokens (child_id);

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_withdraw_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.parental_consents FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.parent_consent_requests FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.parent_withdraw_tokens FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.parental_consents TO authenticated;
GRANT ALL ON public.parental_consents, public.parent_consent_requests, public.parent_withdraw_tokens TO service_role;

DROP POLICY IF EXISTS "parental_consents_select_own" ON public.parental_consents;
CREATE POLICY "parental_consents_select_own"
  ON public.parental_consents FOR SELECT
  TO authenticated
  USING (child_id = auth.uid());
-- parent_consent_requests / parent_withdraw_tokens: deliberately no policies (service role only).

-- ---------------------------------------------------------------------------
-- 3. Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_write_game_data(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE((SELECT p.consent_status IN ('not_required', 'active_minor')
                   FROM public.profiles p WHERE p.id = p_user_id), false)
$$;

CREATE OR REPLACE FUNCTION public.is_minor_account(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE((SELECT p.age_band = '13to17' FROM public.profiles p WHERE p.id = p_user_id), false)
$$;

REVOKE ALL ON FUNCTION public.can_write_game_data(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_write_game_data(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.is_minor_account(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_minor_account(uuid) TO service_role;

-- Raises the standard error for accounts that may not write game data yet.
CREATE OR REPLACE FUNCTION private.assert_can_write_game_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.can_write_game_data(p_user_id) THEN
    RAISE EXCEPTION 'consent_required: this account cannot save game data until its age is confirmed and, for under-18s, a parent has given consent'
      USING ERRCODE = '42501';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION private.assert_can_write_game_data(uuid) FROM PUBLIC, anon, authenticated;

-- Neutral username for a child account ('player' + 8 random digits), unique.
CREATE OR REPLACE FUNCTION private.neutral_username()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_name text;
BEGIN
  LOOP
    v_name := 'player' || lpad(floor(random() * 100000000)::bigint::text, 8, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = v_name);
  END LOOP;
  RETURN v_name;
END;
$$;
REVOKE ALL ON FUNCTION private.neutral_username() FROM PUBLIC, anon;
-- profiles_force_defaults (not SECURITY DEFINER) runs as the inserting client.
GRANT EXECUTE ON FUNCTION private.neutral_username() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.consent_status_for_band(p_band text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_band WHEN 'adult' THEN 'not_required' WHEN '13to17' THEN 'pending_consent' ELSE 'unknown' END
$$;

-- ---------------------------------------------------------------------------
-- 4. Shared delete
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_account_by_id(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user id is required' USING ERRCODE = '22023';
  END IF;

  -- Game data owned by the user
  DELETE FROM public.player_contracts WHERE player_id = p_user_id;
  DELETE FROM public.user_stocks      WHERE user_id   = p_user_id;
  DELETE FROM public.leaderboard      WHERE user_id   = p_user_id;
  DELETE FROM public.match_results    WHERE user_id   = p_user_id;
  DELETE FROM public.matches          WHERE user_id   = p_user_id;
  DELETE FROM public.campaign_progress      WHERE user_id = p_user_id;
  DELETE FROM public.campaign_guest_imports WHERE user_id = p_user_id;
  DELETE FROM public.library_progress       WHERE user_id = p_user_id;

  -- Multiplayer: leave any rooms, remove rooms the user hosts (their seats, hands and
  -- server state cascade via multiplayer_rooms).
  DELETE FROM public.room_player_hands WHERE player_id = p_user_id;
  DELETE FROM public.room_players      WHERE player_id = p_user_id;
  DELETE FROM public.multiplayer_rooms WHERE host_id   = p_user_id;

  -- Reports made by AND about the user (same as the ON DELETE CASCADE FKs of
  -- player_reports: a deleted account leaves no personal data behind).
  DELETE FROM public.player_reports WHERE reporter_id = p_user_id OR reported_id = p_user_id;

  -- Parental consent records (withdraw tokens first: they reference requests)
  DELETE FROM public.parent_withdraw_tokens  WHERE child_id = p_user_id;
  DELETE FROM public.parent_consent_requests WHERE child_id = p_user_id;
  DELETE FROM public.parental_consents       WHERE child_id = p_user_id;

  -- Profile, then the auth identity itself (sessions, identities, MFA factors etc.
  -- cascade inside the auth schema).
  DELETE FROM public.profiles WHERE id = p_user_id;
  DELETE FROM auth.users      WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_account_by_id(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_account_by_id(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  PERFORM public.delete_account_by_id(v_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_own_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Profile triggers
-- ---------------------------------------------------------------------------
-- Extends the economy-defaults trigger of 20261013000000 with the age band rules.
CREATE OR REPLACE FUNCTION public.profiles_force_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.rank_points := 0;
  NEW.daanik_coins := 100;
  NEW.total_xp := 0;
  NEW.games_played := 0;
  NEW.games_won := 0;
  NEW.win_streak := 0;
  NEW.max_win_streak := 0;
  NEW.current_season_rank_points := 0;
  NEW.placement_games_done := 0;
  NEW.login_streak := 0;
  NEW.last_login_date := NULL;
  NEW.guild_id := NULL;
  NEW.created_at := now();
  NEW.updated_at := now();

  -- Age band: the client may only pick the band; status and time are the server's.
  IF NEW.age_band = 'under13' THEN
    RAISE EXCEPTION 'under_min_age: BHAO accounts are for players aged 13 and over' USING ERRCODE = '22023';
  END IF;
  NEW.consent_status := private.consent_status_for_band(NEW.age_band);
  NEW.age_recorded_at := CASE WHEN NEW.age_band IS NOT NULL THEN now() END;
  IF NEW.age_band = '13to17' THEN
    -- Data minimisation: nothing the child typed is kept until a parent consents.
    NEW.username := private.neutral_username();
    NEW.avatar_url := NULL;
  END IF;

  NEW.username := btrim(NEW.username);
  IF NEW.username IS NULL OR char_length(NEW.username) < 3 OR char_length(NEW.username) > 32 THEN
    RAISE EXCEPTION 'Username must be 3-32 characters' USING ERRCODE = '22023';
  END IF;
  IF NEW.avatar_url IS NOT NULL AND char_length(NEW.avatar_url) > 500 THEN
    RAISE EXCEPTION 'Avatar URL too long' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

-- Leaderboard row only for accounts that may write game data (adults at insert);
-- minors get theirs when the parent approves (consent_approve).
CREATE OR REPLACE FUNCTION public.profiles_create_leaderboard_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.consent_status IN ('not_required', 'active_minor') THEN
    INSERT INTO public.leaderboard (user_id, username)
    VALUES (NEW.id, NEW.username)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- BEFORE UPDATE on profiles:
--  * age_band / age_recorded_at / consent_status: never by anon/authenticated (only
--    SECURITY DEFINER functions and the service role);
--  * economy / game columns: only while the account may write game data. The consent
--    functions set the transaction-local flag `bhao.consent_admin` to neutralise a
--    child's username while the account is still pending.
CREATE OR REPLACE FUNCTION private.profiles_consent_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_client boolean := current_user IN ('authenticated', 'anon');
BEGIN
  IF v_client AND (NEW.age_band IS DISTINCT FROM OLD.age_band
      OR NEW.age_recorded_at IS DISTINCT FROM OLD.age_recorded_at
      OR NEW.consent_status IS DISTINCT FROM OLD.consent_status) THEN
    RAISE EXCEPTION 'Age band and consent status can only be changed by the server' USING ERRCODE = '42501';
  END IF;

  IF NOT v_client AND current_setting('bhao.consent_admin', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF (NEW.username, NEW.avatar_url, NEW.rank_points, NEW.daanik_coins, NEW.total_xp, NEW.games_played,
      NEW.games_won, NEW.win_streak, NEW.max_win_streak, NEW.current_season_rank_points, NEW.guild_id,
      NEW.last_login_date, NEW.login_streak, NEW.placement_games_done)
     IS DISTINCT FROM
     (OLD.username, OLD.avatar_url, OLD.rank_points, OLD.daanik_coins, OLD.total_xp, OLD.games_played,
      OLD.games_won, OLD.win_streak, OLD.max_win_streak, OLD.current_season_rank_points, OLD.guild_id,
      OLD.last_login_date, OLD.login_streak, OLD.placement_games_done)
     AND NOT (OLD.consent_status IN ('not_required', 'active_minor')
              AND NEW.consent_status IN ('not_required', 'active_minor')) THEN
    RAISE EXCEPTION 'consent_required: this account cannot save game data until its age is confirmed and, for under-18s, a parent has given consent'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_consent_guard ON public.profiles;
CREATE TRIGGER profiles_consent_guard
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION private.profiles_consent_guard();

-- ---------------------------------------------------------------------------
-- 6. Age band RPCs
-- ---------------------------------------------------------------------------
-- Applies a band to an existing profile whose band is NULL. Caller handles 'under13'.
CREATE OR REPLACE FUNCTION private.apply_age_band(p_user_id uuid, p_band text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found: create the profile with create_my_profile first' USING ERRCODE = 'P0002';
  END IF;
  IF v_row.age_band IS NOT NULL THEN
    RAISE EXCEPTION 'age_already_set: the age band of this account cannot be changed' USING ERRCODE = '42501';
  END IF;

  PERFORM set_config('bhao.consent_admin', 'on', true);
  UPDATE public.profiles
  SET age_band = p_band,
      age_recorded_at = now(),
      consent_status = private.consent_status_for_band(p_band),
      -- A child's existing (self-chosen) name and avatar are dropped until a parent consents.
      username = CASE WHEN p_band = '13to17' THEN private.neutral_username() ELSE username END,
      avatar_url = CASE WHEN p_band = '13to17' THEN NULL ELSE avatar_url END,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO v_row;
  PERFORM set_config('bhao.consent_admin', '', true);

  IF p_band = '13to17' THEN
    -- Pending children are not on the leaderboard (old accounts may have a row).
    DELETE FROM public.leaderboard WHERE user_id = p_user_id;
  ELSE
    INSERT INTO public.leaderboard (user_id, username)
    VALUES (p_user_id, v_row.username)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object('consent_status', v_row.consent_status, 'age_band', v_row.age_band);
END;
$$;
REVOKE ALL ON FUNCTION private.apply_age_band(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_my_age_band(p_age_band text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_band text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_age_band IS NULL OR p_age_band NOT IN ('under13', '13to17', 'adult') THEN
    RAISE EXCEPTION 'invalid_age_band' USING ERRCODE = '22023';
  END IF;

  SELECT age_band INTO v_band FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF FOUND AND v_band IS NOT NULL THEN
    RAISE EXCEPTION 'age_already_set: the age band of this account cannot be changed' USING ERRCODE = '42501';
  END IF;

  IF p_age_band = 'under13' THEN
    -- No account for under-13s: remove the auth user (Google sign-in creates it before
    -- the question is asked) and anything attached to it.
    PERFORM public.delete_account_by_id(v_uid);
    RETURN jsonb_build_object('deleted', true);
  END IF;

  RETURN private.apply_age_band(v_uid, p_age_band);
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_age_band(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_age_band(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_my_profile(p_username text, p_age_band text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.profiles%ROWTYPE;
  v_username text := btrim(COALESCE(p_username, ''));
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_age_band IS NULL OR p_age_band NOT IN ('under13', '13to17', 'adult') THEN
    RAISE EXCEPTION 'invalid_age_band' USING ERRCODE = '22023';
  END IF;
  IF p_age_band = 'under13' THEN
    -- Nothing is created. The client then calls set_my_age_band('under13') to remove the
    -- auth user that sign-in created.
    RAISE EXCEPTION 'under_min_age: BHAO accounts are for players aged 13 and over' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_row FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF FOUND THEN
    IF v_row.age_band IS NULL THEN
      RETURN private.apply_age_band(v_uid, p_age_band);
    END IF;
    -- Idempotent: the band is fixed once recorded.
    RETURN jsonb_build_object('consent_status', v_row.consent_status, 'age_band', v_row.age_band);
  END IF;

  IF p_age_band = 'adult' AND (char_length(v_username) < 3 OR char_length(v_username) > 32
      OR v_username ~ '[[:cntrl:]]') THEN
    RAISE EXCEPTION 'Username must be 3-32 characters' USING ERRCODE = '22023';
  END IF;

  BEGIN
    -- '13to17': the trigger replaces the username with a neutral generated one.
    INSERT INTO public.profiles (id, username, age_band)
    VALUES (v_uid, CASE WHEN p_age_band = 'adult' THEN v_username ELSE 'pending' END, p_age_band)
    RETURNING * INTO v_row;
  EXCEPTION WHEN unique_violation THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid) THEN
      -- Lost a race with a concurrent call: return what the other call created.
      SELECT * INTO v_row FROM public.profiles WHERE id = v_uid;
      RETURN jsonb_build_object('consent_status', v_row.consent_status, 'age_band', v_row.age_band);
    END IF;
    RAISE EXCEPTION 'username_taken: Username is already taken' USING ERRCODE = '23505';
  END;

  RETURN jsonb_build_object('consent_status', v_row.consent_status, 'age_band', v_row.age_band);
END;
$$;

REVOKE ALL ON FUNCTION public.create_my_profile(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_my_profile(text, text) TO authenticated;
