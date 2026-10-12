-- Create RPC to auto-generate and fetch today's contracts
CREATE OR REPLACE FUNCTION get_active_contracts()
RETURNS SETOF daily_contracts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_count INTEGER;
BEGIN
  -- Check if any non-weekly contracts exist for today
  SELECT count(*) INTO today_count FROM daily_contracts WHERE contract_date = CURRENT_DATE AND is_weekly = false;

  -- If none exist, auto-generate them
  IF today_count = 0 THEN
    INSERT INTO daily_contracts (id, title, description, difficulty, reward_dc, reward_card_tier, requirement_type, requirement_value, contract_date, is_weekly)
    VALUES
      (replace(gen_random_uuid()::text, '-', ''), 'First Win', 'Win 1 game at any level', 'easy', 15, null, 'wins', 1, CURRENT_DATE, false),
      (replace(gen_random_uuid()::text, '-', ''), 'Investor Mindset', 'Make 5 INVEST choices in one game', 'medium', 40, 'common', 'invest_choices', 5, CURRENT_DATE, false),
      (replace(gen_random_uuid()::text, '-', ''), 'Unbreakable', 'Win a game without taking EMI damage', 'hard', 100, 'rare', 'no_emi_win', 1, CURRENT_DATE, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Return today's contracts (and any active weekly contracts)
  RETURN QUERY 
    SELECT * FROM daily_contracts 
    WHERE contract_date = CURRENT_DATE OR (is_weekly = true AND contract_date >= CURRENT_DATE - INTERVAL '7 days');
END;
$$;
