/*
  Double Payout Prevention & Profile Sync

  1. Drop the `on_room_completed` trigger from `multiplayer_rooms` table.
     This trigger gave duplicate rewards (XP/coins) for multiplayer matches
     since the edge function `save-game-result` also processes match payouts.
  
  2. Modify `update_my_profile` to sync the username to the leaderboard table.
*/

-- 1. Drop redundant multiplayer reward trigger
DROP TRIGGER IF EXISTS on_room_completed ON multiplayer_rooms;

-- The function can optionally be dropped if not needed elsewhere
DROP FUNCTION IF EXISTS handle_room_completion();

-- 2. Update the RPC so changing username also updates the leaderboard
CREATE OR REPLACE FUNCTION update_my_profile(p_username text, p_avatar_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the profiles table
  UPDATE profiles 
  SET username = p_username, avatar_url = p_avatar_url, updated_at = now()
  WHERE id = auth.uid();

  -- Sync the leaderboard username as well
  UPDATE leaderboard
  SET username = p_username
  WHERE user_id = auth.uid();
END;
$$;
