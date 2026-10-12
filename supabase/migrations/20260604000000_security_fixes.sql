/*
  Security Fixes
*/

-- Fix 1: Profiles IDOR (Remove broad UPDATE policy)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE OR REPLACE FUNCTION update_my_profile(p_username text, p_avatar_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET username = p_username, avatar_url = p_avatar_url, updated_at = now()
  WHERE id = auth.uid();
END;
$$;

-- Fix 2: Leaderboard IDOR
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON leaderboard;

-- Fix 3: Player Contracts IDOR
DROP POLICY IF EXISTS "Users can update own contracts" ON player_contracts;

-- Fix 4: Room Status Modification IDOR
CREATE OR REPLACE FUNCTION protect_room_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only the host can finalize the room status or change the winner
  IF auth.uid() != NEW.host_id THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR NEW.winner_id IS DISTINCT FROM OLD.winner_id THEN
      RAISE EXCEPTION 'Only the host can update the room status and winner';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_room_protection ON multiplayer_rooms;
CREATE TRIGGER enforce_room_protection
  BEFORE UPDATE ON multiplayer_rooms
  FOR EACH ROW
  EXECUTE FUNCTION protect_room_fields();

-- Fix 5: Market Transaction IDOR Mitigation
CREATE OR REPLACE FUNCTION buy_stock(p_ticker text, p_shares integer, p_total_cost integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_current_coins integer;
  v_current_shares integer;
  v_avg_price numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_shares <= 0 THEN
    RAISE EXCEPTION 'Shares must be positive';
  END IF;

  IF p_total_cost <= 0 THEN
    RAISE EXCEPTION 'Total cost must be strictly positive';
  END IF;
  
  IF (p_total_cost / p_shares) < 100 THEN
    RAISE EXCEPTION 'Price per share is suspiciously low';
  END IF;

  -- Check if user has enough coins
  SELECT daank_coins INTO v_current_coins FROM profiles WHERE id = v_user_id;
  
  IF v_current_coins < p_total_cost THEN
    RAISE EXCEPTION 'Not enough DAANIK coins';
  END IF;

  -- Deduct DAANIK coins (transactional safety)
  UPDATE profiles SET daank_coins = daank_coins - p_total_cost WHERE id = v_user_id;

  -- Upsert stock holding
  INSERT INTO user_stocks (user_id, ticker, shares, avg_buy_price)
  VALUES (v_user_id, p_ticker, p_shares, p_total_cost::numeric / p_shares)
  ON CONFLICT (user_id, ticker) DO UPDATE
  SET 
    avg_buy_price = ((user_stocks.shares * user_stocks.avg_buy_price) + p_total_cost) / (user_stocks.shares + p_shares),
    shares = user_stocks.shares + p_shares,
    updated_at = now();
END;
$$;


CREATE OR REPLACE FUNCTION sell_stock(p_ticker text, p_shares integer, p_total_revenue integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_current_shares integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_shares <= 0 THEN
    RAISE EXCEPTION 'Shares must be positive';
  END IF;

  IF (p_total_revenue / p_shares) > 10000 THEN
    RAISE EXCEPTION 'Price per share is suspiciously high';
  END IF;

  -- Check if user has enough shares
  SELECT shares INTO v_current_shares FROM user_stocks WHERE user_id = v_user_id AND ticker = p_ticker;
  IF v_current_shares IS NULL OR v_current_shares < p_shares THEN
    RAISE EXCEPTION 'Not enough shares';
  END IF;

  -- 1. Add revenue to DAANIK coins
  UPDATE profiles SET daank_coins = daank_coins + p_total_revenue WHERE id = v_user_id;

  -- Deduct shares
  IF v_current_shares = p_shares THEN
    DELETE FROM user_stocks WHERE user_id = v_user_id AND ticker = p_ticker;
  ELSE
    UPDATE user_stocks SET shares = shares - p_shares, updated_at = now() WHERE user_id = v_user_id AND ticker = p_ticker;
  END IF;
END;
$$;
