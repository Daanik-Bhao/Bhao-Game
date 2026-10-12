/*
  # Phase 5 / Track L — RLS fixes

  1. room_players INSERT: only your own seat, only into a room that is still
     `waiting` and has a free seat (checked under a row lock on the room).
     room_players UPDATE can no longer move a seat to another room/player.
  2. protect_room_fields: nobody but the server may change `host_id`, `code`,
     `max_players`; only the (current) host may change status/winner. The old
     version compared against NEW.host_id, so a member could take over the room
     by rewriting host_id in the same UPDATE.
  3. player_contracts INSERT cannot set progress/completed (progress is only
     written by apply_match_result).
  4. leaderboard: public read stays (policy without role restriction).
*/

-- ---------------------------------------------------------------------------
-- 1. room_players
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.room_has_free_seat(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.multiplayer_rooms r
    WHERE r.id = p_room_id
      AND r.status = 'waiting'
      AND (SELECT count(*) FROM public.room_players rp WHERE rp.room_id = r.id) < r.max_players
  )
$$;

DROP POLICY IF EXISTS "Players can insert own seat" ON public.room_players;
CREATE POLICY "Players can insert own seat"
  ON public.room_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id AND public.room_has_free_seat(room_id));

-- Serialise concurrent joins so two players cannot both take the last seat.
CREATE OR REPLACE FUNCTION public.room_players_check_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_status text;
  v_max integer;
  v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW; -- service role / maintenance
  END IF;
  SELECT status, max_players INTO v_status, v_max
  FROM public.multiplayer_rooms WHERE id = NEW.room_id FOR UPDATE;
  IF v_status IS DISTINCT FROM 'waiting' THEN
    RAISE EXCEPTION 'Room is not accepting players' USING ERRCODE = '42501';
  END IF;
  SELECT count(*) INTO v_count FROM public.room_players WHERE room_id = NEW.room_id;
  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Room is full' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS room_players_check_capacity ON public.room_players;
CREATE TRIGGER room_players_check_capacity
  BEFORE INSERT ON public.room_players
  FOR EACH ROW
  EXECUTE FUNCTION public.room_players_check_capacity();

CREATE OR REPLACE FUNCTION public.room_players_protect_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.room_id IS DISTINCT FROM OLD.room_id OR NEW.player_id IS DISTINCT FROM OLD.player_id THEN
    RAISE EXCEPTION 'A seat cannot be moved to another room or player' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS room_players_protect_fields ON public.room_players;
CREATE TRIGGER room_players_protect_fields
  BEFORE UPDATE ON public.room_players
  FOR EACH ROW
  EXECUTE FUNCTION public.room_players_protect_fields();

-- ---------------------------------------------------------------------------
-- 2. protect_room_fields
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_room_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Requests without a user (service role, edge functions, SQL editor) are trusted.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.host_id IS DISTINCT FROM OLD.host_id
     OR NEW.code IS DISTINCT FROM OLD.code
     OR NEW.max_players IS DISTINCT FROM OLD.max_players THEN
    RAISE EXCEPTION 'Room id, host, code and size cannot be changed' USING ERRCODE = '42501';
  END IF;

  IF auth.uid() IS DISTINCT FROM OLD.host_id THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.winner_id IS DISTINCT FROM OLD.winner_id THEN
      RAISE EXCEPTION 'Only the host can update the room status and winner' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_room_protection ON public.multiplayer_rooms;
CREATE TRIGGER enforce_room_protection
  BEFORE UPDATE ON public.multiplayer_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_room_fields();

-- ---------------------------------------------------------------------------
-- 3. player_contracts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own contracts" ON public.player_contracts;
CREATE POLICY "Users can insert own contracts"
  ON public.player_contracts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id AND progress = 0 AND completed = false AND completed_at IS NULL);

-- ---------------------------------------------------------------------------
-- 4. leaderboard read for everyone (anon included) — unchanged, asserted here
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON public.leaderboard;
CREATE POLICY "Anyone can read leaderboard"
  ON public.leaderboard FOR SELECT
  USING (true);
