/*
  # Phase 5 Track M — atomic state commit for the game-action edge function

  `mp_commit_state` writes the full state, the changed hands and the public room row in ONE
  transaction, guarded by optimistic concurrency on `multiplayer_room_state.version`.

  - p_expected_version = 0  → start: the room must still be 'waiting' (it becomes 'in_progress'),
    the state row must not exist yet, every member's last_seen is reset to now().
  - p_expected_version > 0  → the stored version must equal it, otherwise nothing is written
    and the function returns false (the caller reloads and retries).
  - The new version is read from p_state->>'version' and must be greater than the expected one.
  - p_hands: {"<player uuid>": [cards...], ...} — only the hands that changed.
  - p_game_over: room becomes 'completed' with p_winner_id.

  EXECUTE is granted to service_role only.
*/

CREATE OR REPLACE FUNCTION mp_commit_state(
  p_room_id uuid,
  p_expected_version integer,
  p_state jsonb,
  p_public jsonb,
  p_hands jsonb,
  p_current_player_id uuid,
  p_winner_id uuid,
  p_game_over boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new integer := (p_state->>'version')::integer;
BEGIN
  IF v_new IS NULL OR v_new <= p_expected_version THEN
    RAISE EXCEPTION 'state version must increase (expected %, got %)', p_expected_version, v_new;
  END IF;

  IF p_expected_version = 0 THEN
    UPDATE multiplayer_rooms
       SET status = 'in_progress'
     WHERE id = p_room_id
       AND status = 'waiting';
    IF NOT FOUND THEN
      RETURN false;
    END IF;

    INSERT INTO multiplayer_room_state (room_id, state, version, updated_at)
    VALUES (p_room_id, p_state, v_new, now())
    ON CONFLICT (room_id) DO NOTHING;
    IF NOT FOUND THEN
      -- Raising rolls back the status change above.
      RAISE EXCEPTION 'room % already has a game state', p_room_id;
    END IF;

    DELETE FROM room_player_hands WHERE room_id = p_room_id;
    UPDATE room_players SET last_seen = now() WHERE room_id = p_room_id;
  ELSE
    UPDATE multiplayer_room_state
       SET state = p_state,
           version = v_new,
           updated_at = now()
     WHERE room_id = p_room_id
       AND version = p_expected_version;
    IF NOT FOUND THEN
      RETURN false;
    END IF;
  END IF;

  INSERT INTO room_player_hands (room_id, player_id, hand, version, updated_at)
  SELECT p_room_id, h.key::uuid, h.value, v_new, now()
    FROM jsonb_each(COALESCE(p_hands, '{}'::jsonb)) AS h(key, value)
  ON CONFLICT (room_id, player_id) DO UPDATE
    SET hand = EXCLUDED.hand,
        version = EXCLUDED.version,
        updated_at = EXCLUDED.updated_at;

  UPDATE multiplayer_rooms
     SET game_state = p_public,
         state_version = v_new,
         current_player_id = p_current_player_id,
         winner_id = CASE WHEN p_game_over THEN p_winner_id ELSE NULL END,
         status = CASE WHEN p_game_over THEN 'completed' ELSE 'in_progress' END,
         updated_at = now()
   WHERE id = p_room_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION mp_commit_state(uuid, integer, jsonb, jsonb, jsonb, uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION mp_commit_state(uuid, integer, jsonb, jsonb, jsonb, uuid, uuid, boolean) TO service_role;
