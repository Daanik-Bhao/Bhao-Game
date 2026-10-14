/*
  # Guest campaign progress import (Phase 5, Track N follow-up)

  A guest plays campaign levels with progress in localStorage only. When they sign in,
  the app offers to bring that progress into the account (once). Guest results were
  never seen by the server, so they are accepted only as *imported* claims, through a
  dedicated RPC with caps — not through `record_level_result`.

  - `campaign_progress.imported boolean` — true while a level's best stars came from a
    guest import (not from a result recorded while signed in). A later signed-in result
    with at least as many stars clears it (see the updated `record_level_result`).
    Future features that give stars value (rewards, leaderboards) must ignore imported stars.
  - Table `campaign_guest_imports(user_id pk, imported_at, levels_offered, levels_accepted)`:
    one row per account = the import happened. Own-row SELECT only; written by the RPC.
  - RPC `import_guest_campaign_progress(p_levels jsonb) returns jsonb`
    (SECURITY DEFINER, acts on auth.uid() only):
      * at most ONCE per account (second call: `already_imported: true`, nothing changes),
      * at most 50 entries, ids must match `level_N`, stars clamped 0..3, net worth capped,
        entries with 0 stars are ignored (only completed levels are imported),
      * unlock chain: level N is accepted only if level N-1 already has >= 1 star on the
        account (or was accepted earlier in this same import); level 1 is always allowed,
      * keeps the best per level (never lowers progress), completion time = server now(),
      * returns `{ already_imported, accepted, progress: [{level_id, stars, best_net_worth,
        completed_at, imported}] }` so the client can store exactly what the server kept.
*/

ALTER TABLE public.campaign_progress
  ADD COLUMN IF NOT EXISTS imported boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.campaign_guest_imports (
  user_id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  imported_at     timestamptz NOT NULL DEFAULT now(),
  levels_offered  integer     NOT NULL DEFAULT 0 CHECK (levels_offered >= 0),
  levels_accepted integer     NOT NULL DEFAULT 0 CHECK (levels_accepted >= 0)
);

ALTER TABLE public.campaign_guest_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaign_guest_imports_select_own" ON public.campaign_guest_imports;
CREATE POLICY "campaign_guest_imports_select_own"
  ON public.campaign_guest_imports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON public.campaign_guest_imports FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.campaign_guest_imports FROM authenticated;
GRANT SELECT ON public.campaign_guest_imports TO authenticated;

-- A signed-in result that reaches the imported star count "verifies" the level.
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

  INSERT INTO public.campaign_progress AS cp (user_id, level_id, stars, best_net_worth, completed_at, updated_at, imported)
  VALUES (v_user_id, p_level_id, v_stars, v_nw, CASE WHEN v_stars >= 1 THEN now() END, now(), false)
  ON CONFLICT (user_id, level_id) DO UPDATE
    SET stars          = GREATEST(cp.stars, EXCLUDED.stars),
        best_net_worth = GREATEST(cp.best_net_worth, EXCLUDED.best_net_worth),
        completed_at   = COALESCE(cp.completed_at, EXCLUDED.completed_at),
        imported       = cp.imported AND EXCLUDED.stars < cp.stars,
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

CREATE OR REPLACE FUNCTION public.import_guest_campaign_progress(p_levels jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id  uuid := auth.uid();
  v_offered  integer;
  v_accepted integer := 0;
  v_item     record;
  v_stars    smallint;
  v_nw       bigint;
  v_prev     smallint;
  v_old      smallint;
  v_progress jsonb;
  v_fresh    boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_levels IS NULL OR jsonb_typeof(p_levels) <> 'array' THEN
    RAISE EXCEPTION 'Invalid levels' USING ERRCODE = '22023';
  END IF;
  v_offered := jsonb_array_length(p_levels);
  IF v_offered > 50 THEN
    RAISE EXCEPTION 'Too many levels' USING ERRCODE = '22023';
  END IF;

  -- Once per account: the import row is the lock.
  INSERT INTO public.campaign_guest_imports (user_id, levels_offered)
  VALUES (v_user_id, v_offered)
  ON CONFLICT (user_id) DO NOTHING;

  v_fresh := FOUND;

  IF v_fresh THEN
    -- Valid entries, lowest level first so the unlock chain can build up within one import.
    FOR v_item IN
      SELECT e->>'level_id' AS level_id,
             substring(e->>'level_id' FROM '^level_([0-9]{1,3})$')::int AS n,
             CASE WHEN jsonb_typeof(e->'stars') = 'number' THEN floor((e->>'stars')::numeric) ELSE 0 END AS stars,
             CASE WHEN jsonb_typeof(e->'net_worth') = 'number' THEN floor((e->>'net_worth')::numeric) ELSE 0 END AS nw
      FROM jsonb_array_elements(p_levels) AS e
      WHERE jsonb_typeof(e) = 'object'
        AND jsonb_typeof(e->'level_id') = 'string'
        AND e->>'level_id' ~ '^level_[0-9]{1,3}$'
      ORDER BY 2
    LOOP
      v_stars := GREATEST(0, LEAST(3, v_item.stars))::smallint;
      CONTINUE WHEN v_stars < 1;
      v_nw := GREATEST(0, LEAST(v_item.nw, 1000000000000))::bigint;

      IF v_item.n > 1 THEN
        SELECT stars INTO v_prev FROM public.campaign_progress
        WHERE user_id = v_user_id AND level_id = 'level_' || (v_item.n - 1);
        CONTINUE WHEN COALESCE(v_prev, 0) < 1;
      END IF;

      SELECT stars INTO v_old FROM public.campaign_progress
      WHERE user_id = v_user_id AND level_id = v_item.level_id;

      INSERT INTO public.campaign_progress AS cp (user_id, level_id, stars, best_net_worth, completed_at, updated_at, imported)
      VALUES (v_user_id, v_item.level_id, v_stars, v_nw, now(), now(), true)
      ON CONFLICT (user_id, level_id) DO UPDATE
        SET stars          = GREATEST(cp.stars, EXCLUDED.stars),
            best_net_worth = GREATEST(cp.best_net_worth, EXCLUDED.best_net_worth),
            completed_at   = COALESCE(cp.completed_at, EXCLUDED.completed_at),
            imported       = CASE WHEN EXCLUDED.stars > cp.stars THEN true ELSE cp.imported END,
            updated_at     = now();

      IF v_old IS NULL OR v_stars > v_old THEN
        v_accepted := v_accepted + 1;
      END IF;
      v_old := NULL;
      v_prev := NULL;
    END LOOP;

    UPDATE public.campaign_guest_imports SET levels_accepted = v_accepted WHERE user_id = v_user_id;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'level_id', level_id,
           'stars', stars,
           'best_net_worth', best_net_worth,
           'completed_at', completed_at,
           'imported', imported
         ) ORDER BY level_id), '[]'::jsonb)
  INTO v_progress
  FROM public.campaign_progress
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'already_imported', NOT v_fresh,
    'accepted', v_accepted,
    'progress', v_progress
  );
END;
$$;

REVOKE ALL ON FUNCTION public.import_guest_campaign_progress(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.import_guest_campaign_progress(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_guest_campaign_progress(jsonb) TO authenticated;
