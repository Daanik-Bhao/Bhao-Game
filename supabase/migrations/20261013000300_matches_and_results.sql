/*
  # Phase 5 / Track L — matches, match results, server-side RP

  - `matches`: one row per single-player game, created by `start_match` when a
    signed-in game starts. Owner can SELECT only.
  - `match_results`: one row per (match, user); the unique key makes
    `apply_match_result` idempotent. Multiplayer results use the room id as
    match id (no `matches` row). Owner can SELECT only.
  - `rank_rp_change`: the RP table. MUST match src/data/rankRules.ts
    (RP_TABLE, WIN_STREAK_*), checked by scripts/check-migrations.mjs.
  - `start_match(p_mode, p_level_id, p_total_players)`: max one open match per
    user per mode. Starting a new one closes the previous open one; an open
    *ranked* match is recorded as a forfeit (abandoning a losing game is a loss).
  - `apply_match_result(...)`: SECURITY DEFINER, EXECUTE for service_role only
    (called by the save-game-result and game-action edge functions).
    ranked/multiplayer: RP (+ win streak, leaderboard), XP, capped coins.
    practice/campaign: XP + capped coins, NO RP. Contracts progress for all
    non-forfeit results. Ranked RP stops after 10 ranked results per IST day.
*/

-- ---------------------------------------------------------------------------
-- RP table
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rank_rp_change(p_placement integer, p_total_players integer, p_win_streak integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_row integer[];
  v_mult double precision := 1;
BEGIN
  v_row := CASE p_total_players
    WHEN 2 THEN ARRAY[30, -25]
    WHEN 3 THEN ARRAY[50, 0, -22]
    WHEN 4 THEN ARRAY[80, 20, -8, -20]
    WHEN 5 THEN ARRAY[100, 35, 5, -10, -18]
    WHEN 6 THEN ARRAY[120, 50, 15, 0, -8, -15]
    ELSE NULL
  END;
  IF v_row IS NULL OR p_placement IS NULL OR p_placement < 1 OR p_placement > array_length(v_row, 1) THEN
    RETURN 0;
  END IF;
  IF p_placement = 1 THEN
    v_mult := LEAST(1 + GREATEST(COALESCE(p_win_streak, 0), 0) * 0.2::double precision, 2::double precision);
  END IF;
  RETURN floor(v_row[p_placement] * v_mult + 0.5)::integer;
END;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('ranked', 'practice', 'campaign', 'multiplayer')),
  room_id uuid,
  level_id text,
  total_players integer CHECK (total_players BETWEEN 1 AND 6),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  result jsonb
);

CREATE INDEX IF NOT EXISTS idx_matches_user_open ON public.matches(user_id, mode) WHERE finished_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_matches_user_started ON public.matches(user_id, started_at DESC);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own matches" ON public.matches;
CREATE POLICY "Users can read own matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('ranked', 'practice', 'campaign', 'multiplayer')),
  won boolean NOT NULL,
  placement integer NOT NULL,
  total_players integer NOT NULL,
  final_wealth bigint NOT NULL DEFAULT 0,
  forfeit boolean NOT NULL DEFAULT false,
  rp_change integer NOT NULL DEFAULT 0,
  rp_capped boolean NOT NULL DEFAULT false,
  xp_gained integer NOT NULL DEFAULT 0,
  coins_gained integer NOT NULL DEFAULT 0,
  contract_coins integer NOT NULL DEFAULT 0,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_results_user_created ON public.match_results(user_id, created_at DESC);

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own match results" ON public.match_results;
CREATE POLICY "Users can read own match results"
  ON public.match_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.matches FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.match_results FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- apply_match_result (service_role only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_match_result(
  p_match_id uuid,
  p_user_id uuid,
  p_mode text,
  p_won boolean,
  p_placement integer,
  p_total_players integer,
  p_final_wealth bigint,
  p_stats jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_stats jsonb := COALESCE(p_stats, '{}'::jsonb);
  v_competitive boolean := p_mode IN ('ranked', 'multiplayer');
  v_forfeit boolean;
  v_won boolean := COALESCE(p_won, false);
  v_placement integer := p_placement;
  v_wealth bigint := COALESCE(p_final_wealth, 0);
  v_match public.matches%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_existing public.match_results%ROWTYPE;
  v_result_id uuid;
  v_today date := public.ist_today();
  v_count integer;
  v_rp integer := 0;
  v_rp_capped boolean := false;
  v_new_rp integer;
  v_new_streak integer;
  v_xp integer := 0;
  v_coins integer := 0;
  v_coin_cap integer;
  v_coins_today integer;
  v_contract_coins integer := 0;
  v_invest integer := 0;
  v_emi boolean := false;
  v_inc integer;
  v_pc public.player_contracts%ROWTYPE;
  c record;
  v_out jsonb;
BEGIN
  IF p_mode IS NULL OR p_mode NOT IN ('ranked', 'practice', 'campaign', 'multiplayer') THEN
    RAISE EXCEPTION 'Invalid mode' USING ERRCODE = '22023';
  END IF;
  IF p_match_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'match id and user id are required' USING ERRCODE = '22023';
  END IF;
  IF p_total_players IS NULL OR p_total_players < 1 OR p_total_players > 6
     OR (v_competitive AND p_total_players < 2) THEN
    RAISE EXCEPTION 'Invalid total players' USING ERRCODE = '22023';
  END IF;

  v_forfeit := COALESCE((v_stats->>'forfeit') = 'true', false);
  IF v_forfeit THEN
    v_won := false;
    v_placement := p_total_players;
  END IF;
  IF v_placement IS NULL OR v_placement < 1 OR v_placement > p_total_players THEN
    RAISE EXCEPTION 'Invalid placement' USING ERRCODE = '22023';
  END IF;
  IF v_won AND v_placement <> 1 THEN
    RAISE EXCEPTION 'A win must be 1st place' USING ERRCODE = '22023';
  END IF;

  -- Idempotency: the same (match, user) is only ever applied once.
  SELECT * INTO v_existing FROM public.match_results WHERE match_id = p_match_id AND user_id = p_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'match_id', v_existing.match_id, 'mode', v_existing.mode, 'won', v_existing.won,
      'placement', v_existing.placement, 'total_players', v_existing.total_players,
      'forfeit', v_existing.forfeit, 'rp_change', v_existing.rp_change, 'rp_capped', v_existing.rp_capped,
      'xp_gained', v_existing.xp_gained, 'coins_gained', v_existing.coins_gained,
      'contract_coins', v_existing.contract_coins,
      'rank_points', (SELECT rank_points FROM public.profiles WHERE id = p_user_id),
      'already_applied', true);
  END IF;

  IF p_mode <> 'multiplayer' THEN
    SELECT * INTO v_match FROM public.matches WHERE id = p_match_id FOR UPDATE;
    IF NOT FOUND OR v_match.user_id <> p_user_id THEN
      RAISE EXCEPTION 'Unknown match' USING ERRCODE = 'P0002';
    END IF;
    IF v_match.mode <> p_mode THEN
      RAISE EXCEPTION 'Match mode mismatch' USING ERRCODE = '22023';
    END IF;
    IF v_match.finished_at IS NOT NULL THEN
      RAISE EXCEPTION 'Match already finished' USING ERRCODE = '22023';
    END IF;
    IF v_match.total_players IS NOT NULL AND v_match.total_players <> p_total_players THEN
      RAISE EXCEPTION 'Player count does not match the started game' USING ERRCODE = '22023';
    END IF;
  END IF;

  INSERT INTO public.match_results (match_id, user_id, mode, won, placement, total_players, final_wealth, forfeit, stats)
  VALUES (p_match_id, p_user_id, p_mode, v_won, v_placement, p_total_players, v_wealth, v_forfeit, v_stats)
  ON CONFLICT (match_id, user_id) DO NOTHING
  RETURNING id INTO v_result_id;
  IF v_result_id IS NULL THEN
    -- Lost a race with a concurrent call for the same (match, user).
    RETURN public.apply_match_result(p_match_id, p_user_id, p_mode, p_won, p_placement, p_total_players, p_final_wealth, p_stats);
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;

  -- RP (competitive modes only; ranked capped per day)
  IF v_competitive THEN
    IF p_mode = 'ranked' THEN
      SELECT count(*) INTO v_count FROM public.match_results
      WHERE user_id = p_user_id AND mode = 'ranked' AND NOT rp_capped AND id <> v_result_id
        AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = v_today;
      v_rp_capped := v_count >= 10;
    END IF;
    IF NOT v_rp_capped THEN
      v_rp := public.rank_rp_change(v_placement, p_total_players, v_profile.win_streak);
    END IF;
  END IF;
  v_new_rp := GREATEST(0, v_profile.rank_points + v_rp);
  v_rp := v_new_rp - v_profile.rank_points;

  -- XP and coins (forfeits earn nothing), coins capped per IST day
  IF NOT v_forfeit THEN
    IF v_competitive THEN
      v_xp := CASE WHEN v_won THEN 100 ELSE 25 END;
      v_coins := CASE WHEN v_won THEN 20 ELSE 5 END;
      v_coin_cap := 200;
    ELSE
      v_xp := CASE WHEN v_won THEN 60 ELSE 15 END;
      v_coins := CASE WHEN v_won THEN 10 ELSE 2 END;
      v_coin_cap := 100;
    END IF;
    SELECT COALESCE(sum(coins_gained), 0) INTO v_coins_today FROM public.match_results
    WHERE user_id = p_user_id AND id <> v_result_id
      AND ((v_competitive AND mode IN ('ranked', 'multiplayer')) OR (NOT v_competitive AND mode IN ('practice', 'campaign')))
      AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = v_today;
    v_coins := GREATEST(0, LEAST(v_coins, v_coin_cap - v_coins_today));
  END IF;

  v_new_streak := CASE WHEN v_won THEN v_profile.win_streak + 1 ELSE 0 END;

  UPDATE public.profiles SET
    total_xp = total_xp + v_xp,
    daanik_coins = daanik_coins + v_coins,
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN v_won THEN 1 ELSE 0 END,
    win_streak = CASE WHEN v_competitive THEN v_new_streak ELSE win_streak END,
    max_win_streak = CASE WHEN v_competitive THEN GREATEST(max_win_streak, v_new_streak) ELSE max_win_streak END,
    rank_points = v_new_rp,
    current_season_rank_points = GREATEST(0, current_season_rank_points + v_rp),
    placement_games_done = CASE WHEN v_competitive THEN LEAST(placement_games_done + 1, 10) ELSE placement_games_done END,
    updated_at = now()
  WHERE id = p_user_id;

  -- Public leaderboard counts competitive games only
  IF v_competitive THEN
    INSERT INTO public.leaderboard (user_id, username)
    VALUES (p_user_id, v_profile.username)
    ON CONFLICT (user_id) DO NOTHING;
    UPDATE public.leaderboard SET
      wins = wins + CASE WHEN v_won THEN 1 ELSE 0 END,
      losses = losses + CASE WHEN v_won THEN 0 ELSE 1 END,
      total_games = total_games + 1,
      highest_net_worth = GREATEST(highest_net_worth, v_wealth),
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Contracts
  IF NOT v_forfeit THEN
    IF jsonb_typeof(v_stats->'investChoices') = 'number' THEN
      v_invest := LEAST(GREATEST(floor((v_stats->>'investChoices')::numeric)::integer, 0), 50);
    END IF;
    v_emi := COALESCE((v_stats->>'emiDamageTaken') = 'true', false);

    FOR c IN
      SELECT * FROM public.daily_contracts
      WHERE contract_date = CURRENT_DATE OR (is_weekly AND contract_date >= CURRENT_DATE - 7)
    LOOP
      v_inc := CASE c.requirement_type
        WHEN 'wins' THEN CASE WHEN v_won THEN 1 ELSE 0 END
        WHEN 'weekly_wins' THEN CASE WHEN v_won THEN 1 ELSE 0 END
        WHEN 'invest_choices' THEN v_invest
        WHEN 'no_emi_win' THEN CASE WHEN v_won AND NOT v_emi THEN 1 ELSE 0 END
        ELSE 0
      END;
      CONTINUE WHEN v_inc <= 0;

      INSERT INTO public.player_contracts (player_id, contract_id)
      VALUES (p_user_id, c.id)
      ON CONFLICT (player_id, contract_id) DO NOTHING;
      SELECT * INTO v_pc FROM public.player_contracts
      WHERE player_id = p_user_id AND contract_id = c.id FOR UPDATE;
      CONTINUE WHEN v_pc.completed;

      IF v_pc.progress + v_inc >= c.requirement_value THEN
        UPDATE public.player_contracts
        SET progress = c.requirement_value, completed = true, completed_at = now()
        WHERE id = v_pc.id;
        v_contract_coins := v_contract_coins + c.reward_dc;
      ELSE
        UPDATE public.player_contracts SET progress = progress + v_inc WHERE id = v_pc.id;
      END IF;
    END LOOP;

    IF v_contract_coins > 0 THEN
      UPDATE public.profiles SET daanik_coins = daanik_coins + v_contract_coins WHERE id = p_user_id;
    END IF;
  END IF;

  UPDATE public.match_results SET
    rp_change = v_rp, rp_capped = v_rp_capped, xp_gained = v_xp,
    coins_gained = v_coins, contract_coins = v_contract_coins
  WHERE id = v_result_id;

  v_out := jsonb_build_object(
    'match_id', p_match_id, 'mode', p_mode, 'won', v_won, 'placement', v_placement,
    'total_players', p_total_players, 'forfeit', v_forfeit, 'rp_change', v_rp, 'rp_capped', v_rp_capped,
    'xp_gained', v_xp, 'coins_gained', v_coins, 'contract_coins', v_contract_coins,
    'rank_points', v_new_rp, 'already_applied', false);

  IF p_mode <> 'multiplayer' THEN
    UPDATE public.matches SET finished_at = now(), result = v_out WHERE id = p_match_id;
  END IF;

  RETURN v_out;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_match_result(uuid, uuid, text, boolean, integer, integer, bigint, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_match_result(uuid, uuid, text, boolean, integer, integer, bigint, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.apply_match_result(uuid, uuid, text, boolean, integer, integer, bigint, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.apply_match_result(uuid, uuid, text, boolean, integer, integer, bigint, jsonb) TO service_role;

-- ---------------------------------------------------------------------------
-- start_match (signed-in single-player games)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.start_match(p_mode text, p_level_id text DEFAULT NULL, p_total_players integer DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_old public.matches%ROWTYPE;
  v_recent integer;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('ranked', 'practice', 'campaign') THEN
    RAISE EXCEPTION 'Invalid mode' USING ERRCODE = '22023';
  END IF;
  IF p_mode = 'campaign' AND (p_level_id IS NULL OR char_length(p_level_id) > 64) THEN
    RAISE EXCEPTION 'Campaign matches need a level id' USING ERRCODE = '22023';
  END IF;
  IF p_total_players IS NOT NULL AND (p_total_players < 1 OR p_total_players > 6
      OR (p_mode = 'ranked' AND p_total_players < 2)) THEN
    RAISE EXCEPTION 'Invalid total players' USING ERRCODE = '22023';
  END IF;
  IF p_mode = 'ranked' AND p_total_players IS NULL THEN
    RAISE EXCEPTION 'Ranked matches need the player count' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid) THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT count(*) INTO v_recent FROM public.matches
  WHERE user_id = v_uid AND started_at > now() - interval '1 hour';
  IF v_recent >= 60 THEN
    RAISE EXCEPTION 'Too many games started, try again later' USING ERRCODE = 'P0001';
  END IF;

  -- One open match per user per mode. Abandoned ranked matches count as forfeits.
  FOR v_old IN
    SELECT * FROM public.matches
    WHERE user_id = v_uid AND mode = p_mode AND finished_at IS NULL
    ORDER BY started_at
    FOR UPDATE
  LOOP
    IF v_old.mode = 'ranked' THEN
      PERFORM public.apply_match_result(v_old.id, v_uid, 'ranked', false,
        COALESCE(v_old.total_players, 2), COALESCE(v_old.total_players, 2), 0,
        '{"forfeit": true, "abandoned": true}'::jsonb);
    ELSE
      UPDATE public.matches SET finished_at = now(), result = '{"expired": true}'::jsonb WHERE id = v_old.id;
    END IF;
  END LOOP;

  INSERT INTO public.matches (user_id, mode, level_id, total_players)
  VALUES (v_uid, p_mode, p_level_id, p_total_players)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_match(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_match(text, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.start_match(text, text, integer) TO authenticated;
