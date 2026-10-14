/*
  # Gyaan Library progress (server copy for signed-in players)

  Which library concepts a player has unlocked and which of those they have opened.
  Purely cosmetic (no coins / RP), so clients write their own rows directly.
  Sync is a union: the client pulls on sign-in, unions with its localStorage copy and
  upserts everything it has; nothing is ever removed or "un-seen".

  - Table `library_progress(user_id, concept_id, seen, unlocked_at, updated_at)`,
    PK (user_id, concept_id). Own-row RLS: authenticated users can SELECT / INSERT /
    UPDATE only rows with user_id = auth.uid(). No DELETE (union semantics); rows go
    with the account (FK on auth.users ON DELETE CASCADE).
  - BEFORE UPDATE trigger keeps updates monotonic: `seen` can only turn true,
    `unlocked_at` keeps the earliest time, user_id / concept_id can't change.
  - BEFORE INSERT trigger caps a player at 200 concepts (the game has far fewer) so the
    table can't be used as free storage.
*/

CREATE TABLE IF NOT EXISTS public.library_progress (
  user_id     uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id  text        NOT NULL CHECK (concept_id ~ '^[a-z0-9_]{1,64}$'),
  seen        boolean     NOT NULL DEFAULT false,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, concept_id)
);

ALTER TABLE public.library_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_progress_select_own" ON public.library_progress;
CREATE POLICY "library_progress_select_own"
  ON public.library_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "library_progress_insert_own" ON public.library_progress;
CREATE POLICY "library_progress_insert_own"
  ON public.library_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "library_progress_update_own" ON public.library_progress;
CREATE POLICY "library_progress_update_own"
  ON public.library_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.library_progress FROM anon;
REVOKE ALL ON public.library_progress FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.library_progress TO authenticated;

CREATE OR REPLACE FUNCTION public.library_progress_monotonic()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.user_id     := OLD.user_id;
  NEW.concept_id  := OLD.concept_id;
  NEW.seen        := OLD.seen OR COALESCE(NEW.seen, false);
  NEW.unlocked_at := LEAST(OLD.unlocked_at, COALESCE(NEW.unlocked_at, OLD.unlocked_at));
  NEW.updated_at  := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS library_progress_monotonic ON public.library_progress;
CREATE TRIGGER library_progress_monotonic
  BEFORE UPDATE ON public.library_progress
  FOR EACH ROW EXECUTE FUNCTION public.library_progress_monotonic();

CREATE OR REPLACE FUNCTION public.library_progress_cap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Upserts of existing rows also fire BEFORE INSERT: only count genuinely new concepts.
  IF NOT EXISTS (SELECT 1 FROM public.library_progress WHERE user_id = NEW.user_id AND concept_id = NEW.concept_id)
     AND (SELECT count(*) FROM public.library_progress WHERE user_id = NEW.user_id) >= 200 THEN
    RAISE EXCEPTION 'Too many library concepts' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS library_progress_cap ON public.library_progress;
CREATE TRIGGER library_progress_cap
  BEFORE INSERT ON public.library_progress
  FOR EACH ROW EXECUTE FUNCTION public.library_progress_cap();
