/*
  # Phase 5 Track M — server-authoritative multiplayer (storage + RLS)

  - `multiplayer_room_state`: the full game state (hands, deck order). Service role only.
  - `multiplayer_rooms.game_state` keeps only the REDACTED public state; `state_version` mirrors
    the authoritative version. Members can no longer UPDATE rooms at all — the `game-action`
    edge function (service role) writes game_state / status / winner_id / current_player_id.
  - `room_player_hands`: one row per player with their hand; each player can SELECT only their
    own row. Added to the `supabase_realtime` publication.
  - `room_players.last_seen` + `heartbeat(p_room_id)` RPC. Clients may only update `is_ready`.
  - Room INSERT by a client is normalised (status waiting, no winner, only `multiplayerMode`
    in game_state).
*/

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------
ALTER TABLE multiplayer_rooms ADD COLUMN IF NOT EXISTS state_version integer NOT NULL DEFAULT 0;
ALTER TABLE room_players ADD COLUMN IF NOT EXISTS last_seen timestamptz NOT NULL DEFAULT now();

-- ---------------------------------------------------------------------------
-- Full authoritative state (service role only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS multiplayer_room_state (
  room_id uuid PRIMARY KEY REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  state jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE multiplayer_room_state ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role (which bypasses RLS) may touch it.
REVOKE ALL ON multiplayer_room_state FROM anon, authenticated;
GRANT ALL ON multiplayer_room_state TO service_role;

-- ---------------------------------------------------------------------------
-- Private hands
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_player_hands (
  room_id uuid NOT NULL REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hand jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_room_player_hands_player ON room_player_hands(player_id);

ALTER TABLE room_player_hands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can read own hand" ON room_player_hands;
CREATE POLICY "Players can read own hand"
  ON room_player_hands FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

REVOKE ALL ON room_player_hands FROM anon, authenticated;
GRANT SELECT ON room_player_hands TO authenticated;
GRANT ALL ON room_player_hands TO service_role;

-- ---------------------------------------------------------------------------
-- multiplayer_rooms: no client UPDATE any more
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Room members can update room" ON multiplayer_rooms;
DROP POLICY IF EXISTS "Host can update room" ON multiplayer_rooms;
REVOKE UPDATE ON multiplayer_rooms FROM anon, authenticated;

-- Client-created rooms always start clean; the server owns every game field.
CREATE OR REPLACE FUNCTION normalize_new_room()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_mode text;
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    v_mode := COALESCE(NEW.game_state->>'multiplayerMode', 'standard');
    IF v_mode NOT IN ('blitz', 'standard', 'epic') THEN
      v_mode := 'standard';
    END IF;
    IF NEW.max_players IS NULL OR NEW.max_players < 2 OR NEW.max_players > 6 THEN
      RAISE EXCEPTION 'max_players must be between 2 and 6';
    END IF;
    NEW.status := 'waiting';
    NEW.winner_id := NULL;
    NEW.current_player_id := NULL;
    NEW.state_version := 0;
    NEW.game_state := jsonb_build_object('multiplayerMode', v_mode);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_new_room ON multiplayer_rooms;
CREATE TRIGGER normalize_new_room
  BEFORE INSERT ON multiplayer_rooms
  FOR EACH ROW
  EXECUTE FUNCTION normalize_new_room();

-- ---------------------------------------------------------------------------
-- room_players: clients may only flip is_ready; last_seen goes through heartbeat()
-- ---------------------------------------------------------------------------
REVOKE UPDATE ON room_players FROM anon, authenticated;
GRANT UPDATE (is_ready) ON room_players TO authenticated;

-- Server-owned column on INSERT too.
CREATE OR REPLACE FUNCTION normalize_new_room_player()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    NEW.last_seen := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_new_room_player ON room_players;
CREATE TRIGGER normalize_new_room_player
  BEFORE INSERT ON room_players
  FOR EACH ROW
  EXECUTE FUNCTION normalize_new_room_player();

CREATE OR REPLACE FUNCTION heartbeat(p_room_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  UPDATE room_players
     SET last_seen = v_now
   WHERE room_id = p_room_id
     AND player_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not a member of this room';
  END IF;
  RETURN v_now;
END;
$$;

REVOKE ALL ON FUNCTION heartbeat(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION heartbeat(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Legacy client-authoritative games cannot continue under the new rules: close them
-- and drop their unredacted state (which contained every hand).
-- ---------------------------------------------------------------------------
UPDATE multiplayer_rooms
   SET status = 'completed',
       game_state = jsonb_build_object('multiplayerMode', COALESCE(game_state->>'multiplayerMode', 'standard')),
       updated_at = now()
 WHERE status = 'in_progress'
   AND NOT EXISTS (SELECT 1 FROM multiplayer_room_state s WHERE s.room_id = multiplayer_rooms.id);

-- ---------------------------------------------------------------------------
-- Realtime: public room row + private hand rows (RLS applies to postgres_changes)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'multiplayer_rooms'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'room_player_hands'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.room_player_hands;
    END IF;
  END IF;
END;
$$;
