/*
  # Player reports (Google Play User Generated Content policy)

  Multiplayer has text chat, quick chat, pokes and voice. Chat is an ephemeral realtime
  broadcast and is never stored, so a report carries its own evidence: the reporter's
  client sends the reported player's last few chat lines (max 10, already cleaned by
  the receiving client). Voice is peer-to-peer and never recorded, so it is never evidence.

  - Table `player_reports`. RLS on with NO policies and no table privileges for
    anon/authenticated: clients can't read, insert, update or delete rows directly.
    Moderators read it with the service role (Supabase dashboard / SQL editor).
  - RPC `report_player(p_reported uuid, p_room uuid, p_reason text, p_details text,
    p_evidence jsonb) returns uuid` (SECURITY DEFINER) is the only way in. It:
      * requires a signed-in user (auth.uid()), forbids reporting yourself,
      * checks the reason against a fixed list, details <= 500 chars,
        evidence = JSON array of <= 10 items and <= 4000 bytes,
      * rate limits: max 10 reports per reporter per rolling 24 hours, and one report
        per (reporter, reported player, room).
  - Rows are removed when either the reporter's or the reported player's account is
    deleted (FKs on auth.users ON DELETE CASCADE), so `delete_own_account` keeps working.
*/

CREATE TABLE IF NOT EXISTS public.player_reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- No FK: rooms are deleted when the host leaves, the report must outlive the room.
  room_id     uuid        NULL,
  reason      text        NOT NULL CHECK (reason IN ('abuse', 'spam', 'sexual', 'scam', 'personal_info', 'other')),
  details     text        NULL CHECK (details IS NULL OR char_length(details) <= 500),
  evidence    jsonb       NOT NULL DEFAULT '[]'::jsonb
                          CHECK (jsonb_typeof(evidence) = 'array' AND octet_length(evidence::text) <= 4000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  status      text        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'actioned', 'dismissed')),
  CONSTRAINT player_reports_not_self CHECK (reporter_id <> reported_id)
);

-- One report per reporter / reported player / room (NULL room counts as one "room").
CREATE UNIQUE INDEX IF NOT EXISTS player_reports_once_per_room
  ON public.player_reports (reporter_id, reported_id, COALESCE(room_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE INDEX IF NOT EXISTS player_reports_reporter_recent ON public.player_reports (reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS player_reports_reported ON public.player_reports (reported_id, created_at DESC);
CREATE INDEX IF NOT EXISTS player_reports_open ON public.player_reports (created_at) WHERE status = 'open';

ALTER TABLE public.player_reports ENABLE ROW LEVEL SECURITY;
-- Deliberately no policies: nothing is visible or writable to anon / authenticated.
REVOKE ALL ON public.player_reports FROM PUBLIC;
REVOKE ALL ON public.player_reports FROM anon;
REVOKE ALL ON public.player_reports FROM authenticated;
GRANT ALL ON public.player_reports TO service_role;

CREATE OR REPLACE FUNCTION public.report_player(
  p_reported uuid,
  p_room     uuid,
  p_reason   text,
  p_details  text,
  p_evidence jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid      uuid := auth.uid();
  v_details  text := NULLIF(btrim(COALESCE(p_details, '')), '');
  v_evidence jsonb := COALESCE(p_evidence, '[]'::jsonb);
  v_recent   integer;
  v_id       uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_reported IS NULL THEN
    RAISE EXCEPTION 'Unknown player' USING ERRCODE = '22023';
  END IF;
  IF p_reported = v_uid THEN
    RAISE EXCEPTION 'You cannot report yourself' USING ERRCODE = '22023';
  END IF;
  IF p_reason IS NULL OR p_reason NOT IN ('abuse', 'spam', 'sexual', 'scam', 'personal_info', 'other') THEN
    RAISE EXCEPTION 'Invalid reason' USING ERRCODE = '22023';
  END IF;
  IF v_details IS NOT NULL AND char_length(v_details) > 500 THEN
    RAISE EXCEPTION 'Details too long' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(v_evidence) <> 'array'
     OR jsonb_array_length(v_evidence) > 10
     OR octet_length(v_evidence::text) > 4000 THEN
    RAISE EXCEPTION 'Invalid evidence' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_reported) THEN
    RAISE EXCEPTION 'Unknown player' USING ERRCODE = '22023';
  END IF;

  -- Serialise this reporter's calls so the daily count can't be raced past.
  PERFORM pg_advisory_xact_lock(hashtext('report_player'), hashtext(v_uid::text));

  SELECT count(*) INTO v_recent
  FROM public.player_reports
  WHERE reporter_id = v_uid AND created_at > now() - interval '24 hours';
  IF v_recent >= 10 THEN
    RAISE EXCEPTION 'Report limit reached, try again tomorrow' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.player_reports
    WHERE reporter_id = v_uid
      AND reported_id = p_reported
      AND room_id IS NOT DISTINCT FROM p_room
  ) THEN
    RAISE EXCEPTION 'Already reported' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.player_reports (reporter_id, reported_id, room_id, reason, details, evidence)
  VALUES (v_uid, p_reported, p_room, p_reason, v_details, v_evidence)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.report_player(uuid, uuid, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_player(uuid, uuid, text, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.report_player(uuid, uuid, text, text, jsonb) TO authenticated;
