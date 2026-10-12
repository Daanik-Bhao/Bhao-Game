/*
  # Campaign progress (Phase 5, Track N)

  One row per (user, campaign level): best stars (0-3), best net worth, first completion time.
  Stars are cosmetic (no coins / RP), so the client-reported result is accepted as-is;
  the RPC only ever keeps the best value, so a replayed or worse result can't lower progress.

  - Table `campaign_progress`, own-row RLS: users can SELECT their own rows only.
    No INSERT/UPDATE/DELETE policies: writes go through `record_level_result`.
  - RPC `record_level_result(p_level_id text, p_stars int, p_net_worth bigint) returns jsonb`
    (SECURITY DEFINER, acts on auth.uid() only) upserts and keeps the best.
  - Rows are removed with the user (FK on auth.users ON DELETE CASCADE).
*/

CREATE TABLE IF NOT EXISTS public.campaign_progress (
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id       text        NOT NULL CHECK (level_id ~ '^level_[0-9]{1,3}$'),
  stars          smallint    NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  best_net_worth bigint      NOT NULL DEFAULT 0 CHECK (best_net_worth >= 0),
  completed_at   timestamptz NULL,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, level_id)
);

ALTER TABLE public.campaign_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_progress_select_own" ON public.campaign_progress;
CREATE POLICY "campaign_progress_select_own"
  ON public.campaign_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON public.campaign_progress FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.campaign_progress FROM authenticated;
GRANT SELECT ON public.campaign_progress TO authenticated;

CREATE OR REPLACE FUNCTION public.record_level_result(
  p_level_id  text,
  p_stars     int,
  p_net_worth bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_stars   smallint;
  v_nw      bigint;
  v_row     public.campaign_progress%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_level_id IS NULL OR p_level_id !~ '^level_[0-9]{1,3}$' THEN
    RAISE EXCEPTION 'Invalid level id' USING ERRCODE = '22023';
  END IF;

  v_stars := GREATEST(0, LEAST(3, COALESCE(p_stars, 0)));
  -- Net worth is cosmetic; cap absurd values instead of rejecting them
  v_nw := GREATEST(0, LEAST(COALESCE(p_net_worth, 0), 1000000000000));

  INSERT INTO public.campaign_progress AS cp (user_id, level_id, stars, best_net_worth, completed_at, updated_at)
  VALUES (v_user_id, p_level_id, v_stars, v_nw, CASE WHEN v_stars >= 1 THEN now() END, now())
  ON CONFLICT (user_id, level_id) DO UPDATE
    SET stars          = GREATEST(cp.stars, EXCLUDED.stars),
        best_net_worth = GREATEST(cp.best_net_worth, EXCLUDED.best_net_worth),
        completed_at   = COALESCE(cp.completed_at, EXCLUDED.completed_at),
        updated_at     = now()
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'level_id', v_row.level_id,
    'stars', v_row.stars,
    'best_net_worth', v_row.best_net_worth,
    'completed_at', v_row.completed_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_level_result(text, int, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_level_result(text, int, bigint) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_level_result(text, int, bigint) TO authenticated;
