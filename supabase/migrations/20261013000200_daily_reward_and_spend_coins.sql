/*
  # Phase 5 / Track L — daily reward and coin spending

  claim_daily_reward(): server date (Asia/Kolkata). Claiming on consecutive days
  grows `login_streak`; a missed day resets it to 1. Reward by streak day
  (same table as DAILY_REWARDS in src/data/rankRules.ts):
    day 1..7 = 10, 20, 30, 50, 100, 200, 500; day 8+ = 500.
  Returns {reward, streak, already_claimed}. A second call on the same day
  returns already_claimed = true and reward 0.

  spend_coins(p_amount, p_reason): atomic deduction for practice/campaign extras
  (e.g. 'extra_card' = 25). Never goes below zero. Returns the new balance.
  Ranked games have no coin-bought advantages (enforced in the client; ranked
  results are validated server-side either way).
*/

CREATE OR REPLACE FUNCTION public.daily_reward_amount(p_streak integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (ARRAY[10, 20, 30, 50, 100, 200, 500])[LEAST(GREATEST(COALESCE(p_streak, 1), 1), 7)]
$$;

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := public.ist_today();
  v_last date;
  v_streak integer;
  v_reward integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT last_login_date, login_streak INTO v_last, v_streak
  FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_last = v_today THEN
    RETURN jsonb_build_object('reward', 0, 'streak', v_streak, 'already_claimed', true);
  END IF;

  IF v_last = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;
  v_reward := public.daily_reward_amount(v_streak);

  UPDATE public.profiles
  SET daanik_coins = daanik_coins + v_reward,
      login_streak = v_streak,
      last_login_date = v_today,
      updated_at = now()
  WHERE id = v_uid;

  RETURN jsonb_build_object('reward', v_reward, 'streak', v_streak, 'already_claimed', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_coins(p_amount integer, p_reason text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid amount' USING ERRCODE = '22023';
  END IF;
  IF p_reason IS NULL OR p_reason NOT IN ('extra_card') THEN
    RAISE EXCEPTION 'Invalid reason' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET daanik_coins = daanik_coins - p_amount, updated_at = now()
  WHERE id = v_uid AND daanik_coins >= p_amount
  RETURNING daanik_coins INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Not enough DAANIK coins' USING ERRCODE = 'P0001';
  END IF;
  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;
REVOKE ALL ON FUNCTION public.spend_coins(integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spend_coins(integer, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.spend_coins(integer, text) TO authenticated;
