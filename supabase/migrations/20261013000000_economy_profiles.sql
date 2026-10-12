/*
  # Phase 5 / Track L — profiles hardening

  1. Missing profile columns used by the client (`last_login_date`, `login_streak`,
     `placement_games_done`).
  2. BEFORE INSERT trigger on `profiles`: a client may only choose `id` (checked by
     RLS), `username` and `avatar_url`. Every economy/progress column is forced to
     its server default, so `insert({ id, username, daanik_coins: 1e9 })` is harmless.
  3. AFTER INSERT trigger creates the matching `leaderboard` row (with zeroed
     stats); the client no longer inserts leaderboard rows and the INSERT policy
     that let it pick its own wins/losses is dropped.
  4. `update_my_profile(p_username, p_avatar_url)` is the only way to edit a
     profile. NULL means "keep the current value". Validates input and keeps the
     leaderboard username in sync.
*/

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_date date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_streak integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS placement_games_done integer NOT NULL DEFAULT 0;

-- Server "today" for daily rewards and caps. Players are in India.
CREATE OR REPLACE FUNCTION public.ist_today()
RETURNS date
LANGUAGE sql
STABLE
AS $$ SELECT (now() AT TIME ZONE 'Asia/Kolkata')::date $$;

-- ---------------------------------------------------------------------------
-- Force server defaults on profile insert
-- ---------------------------------------------------------------------------
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

DROP TRIGGER IF EXISTS profiles_force_defaults ON public.profiles;
CREATE TRIGGER profiles_force_defaults
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_force_defaults();

-- ---------------------------------------------------------------------------
-- Leaderboard row is created by the server, never by the client
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_create_leaderboard_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, username)
  VALUES (NEW.id, NEW.username)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_create_leaderboard_row ON public.profiles;
CREATE TRIGGER profiles_create_leaderboard_row
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_create_leaderboard_row();

DROP POLICY IF EXISTS "Users can insert own leaderboard entry" ON public.leaderboard;

-- Backfill leaderboard rows for profiles created before this migration.
INSERT INTO public.leaderboard (user_id, username)
SELECT p.id, p.username FROM public.profiles p
ON CONFLICT (user_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Profile edits
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_my_profile(p_username text, p_avatar_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_username text := NULLIF(btrim(p_username), '');
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF v_username IS NOT NULL AND (char_length(v_username) < 3 OR char_length(v_username) > 32
      OR v_username ~ '[[:cntrl:]]') THEN
    RAISE EXCEPTION 'Username must be 3-32 characters' USING ERRCODE = '22023';
  END IF;
  IF p_avatar_url IS NOT NULL AND (char_length(p_avatar_url) > 500
      OR NOT (p_avatar_url ~ '^https://' OR p_avatar_url ~ '^/')) THEN
    RAISE EXCEPTION 'Invalid avatar URL' USING ERRCODE = '22023';
  END IF;

  BEGIN
    UPDATE public.profiles
    SET username = COALESCE(v_username, username),
        avatar_url = COALESCE(p_avatar_url, avatar_url),
        updated_at = now()
    WHERE id = v_uid;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Username is already taken' USING ERRCODE = '23505';
  END;

  IF v_username IS NOT NULL THEN
    UPDATE public.leaderboard SET username = v_username, updated_at = now() WHERE user_id = v_uid;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_my_profile(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_my_profile(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_my_profile(text, text) TO authenticated;
