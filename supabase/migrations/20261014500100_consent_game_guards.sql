/*
  # Consent guards on game data + child-safe defaults

  1. Accounts whose consent_status is 'unknown' or 'pending_consent' cannot write game
     data. Enforced with BEFORE INSERT/UPDATE triggers on the tables themselves, so every
     path is covered (direct client writes, SECURITY DEFINER RPCs such as start_match,
     record_level_result, import_guest_campaign_progress, buy_stock/sell_stock, report_player,
     and the service-role apply_match_result). Profiles are covered by
     private.profiles_consent_guard (20261014500000): claim_daily_reward, spend_coins,
     update_my_profile and the market RPCs all update profiles. Error: 'consent_required'.
     Deletes are never blocked (account deletion must always work).

  2. Minors (age_band '13to17') are hidden from everybody else:
       - leaderboard rows: visible when NOT minor OR own row (anon still reads adults);
       - profiles rows: same rule (other users could otherwise find children by age_band).

  3. Multiplayer: `multiplayer_rooms.is_public` (default false; today every room is a private
     invite-code room, this prepares quick match). A minor can't create a public room or take
     a seat in one ('minor_private_rooms_only'); unknown/pending accounts can't create or join
     any room ('consent_required').
     Text chat, quick chat and voice are realtime broadcast / peer-to-peer only and never touch
     the database, so there is no server path to guard here: the client enforces the child
     limits for them.
*/

-- ---------------------------------------------------------------------------
-- 1. Game-data guard triggers
-- ---------------------------------------------------------------------------
-- TG_ARGV[0] = the column holding the owning user id.
CREATE OR REPLACE FUNCTION private.require_game_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := (to_jsonb(NEW) ->> TG_ARGV[0])::uuid;
BEGIN
  PERFORM private.assert_can_write_game_data(v_user);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.require_game_consent() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS require_game_consent ON public.matches;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.match_results;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.match_results
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.campaign_progress;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.campaign_progress
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.campaign_guest_imports;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.campaign_guest_imports
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.library_progress;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.library_progress
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.player_contracts;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.player_contracts
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('player_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.user_stocks;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.user_stocks
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

DROP TRIGGER IF EXISTS require_game_consent ON public.leaderboard;
CREATE TRIGGER require_game_consent BEFORE INSERT OR UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('user_id');

-- Reports: the reporter must be an allowed account (pending children can't play
-- multiplayer, so they have nobody to report).
DROP TRIGGER IF EXISTS require_game_consent ON public.player_reports;
CREATE TRIGGER require_game_consent BEFORE INSERT ON public.player_reports
  FOR EACH ROW EXECUTE FUNCTION private.require_game_consent('reporter_id');

-- ---------------------------------------------------------------------------
-- 2. Minors hidden from other users
-- ---------------------------------------------------------------------------
-- Policy helper: true when `p_user_id`'s rows may be shown to the current caller.
-- Lives in `private` (not exposed by the Data API) so it can't be used as an oracle.
CREATE OR REPLACE FUNCTION private.visible_to_caller(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p_user_id = auth.uid() OR NOT public.is_minor_account(p_user_id)
$$;
REVOKE ALL ON FUNCTION private.visible_to_caller(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.visible_to_caller(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can read leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can read leaderboard except minors" ON public.leaderboard;
CREATE POLICY "Anyone can read leaderboard except minors"
  ON public.leaderboard FOR SELECT
  USING (private.visible_to_caller(user_id));

DROP POLICY IF EXISTS "Authenticated users can read any profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles except minors" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles except minors"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (private.visible_to_caller(id));

-- ---------------------------------------------------------------------------
-- 3. Rooms
-- ---------------------------------------------------------------------------
ALTER TABLE public.multiplayer_rooms ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION private.rooms_consent_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM private.assert_can_write_game_data(NEW.host_id);
  IF NEW.is_public AND public.is_minor_account(NEW.host_id) THEN
    RAISE EXCEPTION 'minor_private_rooms_only: under-18 players can only play in private invite-code rooms'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.rooms_consent_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rooms_consent_guard ON public.multiplayer_rooms;
CREATE TRIGGER rooms_consent_guard BEFORE INSERT ON public.multiplayer_rooms
  FOR EACH ROW EXECUTE FUNCTION private.rooms_consent_guard();

CREATE OR REPLACE FUNCTION private.room_players_consent_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM private.assert_can_write_game_data(NEW.player_id);
  IF public.is_minor_account(NEW.player_id)
     AND EXISTS (SELECT 1 FROM public.multiplayer_rooms r WHERE r.id = NEW.room_id AND r.is_public) THEN
    RAISE EXCEPTION 'minor_private_rooms_only: under-18 players can only play in private invite-code rooms'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.room_players_consent_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS room_players_consent_guard ON public.room_players;
CREATE TRIGGER room_players_consent_guard BEFORE INSERT ON public.room_players
  FOR EACH ROW EXECUTE FUNCTION private.room_players_consent_guard();
