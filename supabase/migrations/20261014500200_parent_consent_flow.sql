/*
  # Parental consent flow (server side of supabase/functions/parent-consent)

  The edge function generates the random tokens and sends the emails; the database only
  ever sees SHA-256 hex hashes of the tokens. Every function below except
  my_consent_status() is SECURITY DEFINER with EXECUTE for service_role only.

  Expected outcomes come back as jsonb `{ ok: false, error: <code> }` (codes match the edge
  function's error codes); only programming errors raise.

    consent_create_request(p_child_id uuid, p_parent_email text, p_token_hash text, p_withdraw_hash text) -> jsonb
        child must be 'pending_consent' (else not_pending); rate limits (else rate_limited +
        retry_after_seconds): 60 s cooldown per child (counts every attempt, also failed sends),
        5 per child and 5 per parent address per rolling 24 h (failed sends don't count).
        Stores the request (expires in 7 days, email_status 'pending') and a withdraw token
        linked to it. p_parent_email NULL = resend to the address of the child's latest request
        (bad_request if there is none). -> { ok, request_id, parent_email, expires_at, next_send_at,
        parent_email_masked }
    consent_mark_sent(p_request_id uuid) -> jsonb
        email accepted by the provider: supersedes the child's other open requests and
        revokes the (never approved) withdraw tokens sent with them.
    consent_mark_failed(p_request_id uuid) -> jsonb
        email refused: the request becomes invalid and its withdraw token is revoked; it no
        longer counts against the daily caps (the cooldown still applies).
    consent_lookup(p_token_hash text) -> jsonb
        { status: valid|expired|used|superseded|not_found, age_band, parent_email_masked, expires_at }
    consent_approve(p_token_hash, p_parent_name, p_parent_birth_year, p_declaration, p_notice_version, p_ip_hash) -> jsonb
        single use + expiry checked under a row lock; adult parent (current IST year - year > 18
        and at most 100 years ago, same rule as isAdultBirthYear in src/lib/ageBand.ts),
        declaration true, name 2-100 chars. Inserts parental_consents, profile -> 'active_minor',
        creates the leaderboard row, request -> approved, other open requests superseded.
        -> { ok, child_id, parent_email }
    consent_decline(p_token_hash text) -> jsonb       single use; deletes the child account.
    consent_withdraw_lookup(p_withdraw_hash text) -> jsonb  { status: valid|not_found, consent_status }
    consent_withdraw(p_withdraw_hash text) -> jsonb   revokes the child's withdraw tokens and
                                                      deletes the child account (pending or active).
    consent_issue_withdraw_token(p_child_id uuid, p_parent_email text, p_withdraw_hash text) -> jsonb
        fresh withdraw link for the approval confirmation email (child must be active_minor).

  Authenticated:
    my_consent_status() -> { consent_status, age_band, parent_email_masked, last_sent_at,
                             next_send_at, request_expires_at }
        next_send_at = earliest time the child may ask for another email (child limits only;
        the per-parent cap depends on the address typed) or NULL when a send is allowed now.

  Numbers mirror src/config/consent.ts (checked by scripts/check-migrations.mjs through
  private.consent_config()).
*/

CREATE OR REPLACE FUNCTION private.consent_config()
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'token_ttl_days', 7,
    'resend_cooldown_seconds', 60,
    'max_emails_per_child_per_day', 5,
    'max_emails_per_parent_per_day', 5
  )
$$;

-- Same rule as maskEmail() in src/lib/consentServer.ts: first character of the local part,
-- '***', then the full domain. 'riya.sharma@gmail.com' -> 'r***@gmail.com'.
CREATE OR REPLACE FUNCTION private.mask_email(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_email IS NULL THEN NULL
    WHEN p_email !~ '.@[^@]*$' THEN '***'
    ELSE left(p_email, 1) || '***@' || substring(p_email FROM '@([^@]*)$')
  END
$$;

CREATE OR REPLACE FUNCTION private.ist_year()
RETURNS integer
LANGUAGE sql
STABLE
AS $$ SELECT extract(year FROM now() AT TIME ZONE 'Asia/Kolkata')::integer $$;

-- Earliest time another consent email may be sent for this child (and parent address,
-- when given). <= now() means "now".
CREATE OR REPLACE FUNCTION private.consent_next_send_at(p_child_id uuid, p_parent_email text)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cfg jsonb := private.consent_config();
  v_cooldown interval := make_interval(secs => (v_cfg->>'resend_cooldown_seconds')::integer);
  v_child_cap integer := (v_cfg->>'max_emails_per_child_per_day')::integer;
  v_parent_cap integer := (v_cfg->>'max_emails_per_parent_per_day')::integer;
  v_next timestamptz := now();
  v_last timestamptz;
  v_n integer;
  v_at timestamptz;
BEGIN
  SELECT max(created_at) INTO v_last FROM public.parent_consent_requests WHERE child_id = p_child_id;
  IF v_last IS NOT NULL THEN
    v_next := GREATEST(v_next, v_last + v_cooldown);
  END IF;

  SELECT count(*) INTO v_n FROM public.parent_consent_requests
  WHERE child_id = p_child_id AND email_status <> 'failed' AND created_at > now() - interval '1 day';
  IF v_n >= v_child_cap THEN
    -- Allowed again once enough of the sends in the window have aged out.
    SELECT created_at INTO v_at FROM public.parent_consent_requests
    WHERE child_id = p_child_id AND email_status <> 'failed' AND created_at > now() - interval '1 day'
    ORDER BY created_at OFFSET (v_n - v_child_cap) LIMIT 1;
    v_next := GREATEST(v_next, v_at + interval '1 day');
  END IF;

  IF p_parent_email IS NOT NULL THEN
    SELECT count(*) INTO v_n FROM public.parent_consent_requests
    WHERE parent_email = p_parent_email AND email_status <> 'failed' AND created_at > now() - interval '1 day';
    IF v_n >= v_parent_cap THEN
      SELECT created_at INTO v_at FROM public.parent_consent_requests
      WHERE parent_email = p_parent_email AND email_status <> 'failed' AND created_at > now() - interval '1 day'
      ORDER BY created_at OFFSET (v_n - v_parent_cap) LIMIT 1;
      v_next := GREATEST(v_next, v_at + interval '1 day');
    END IF;
  END IF;
  RETURN v_next;
END;
$$;
REVOKE ALL ON FUNCTION private.consent_next_send_at(uuid, text) FROM PUBLIC, anon, authenticated;

-- State of a consent request row for the parent page.
CREATE OR REPLACE FUNCTION private.consent_request_state(p_req public.parent_consent_requests)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN p_req.id IS NULL OR p_req.email_status = 'failed' THEN 'not_found'
    WHEN p_req.outcome = 'superseded' THEN 'superseded'
    WHEN p_req.used_at IS NOT NULL OR p_req.outcome IS NOT NULL THEN 'used'
    WHEN NOT EXISTS (SELECT 1 FROM public.profiles p
                     WHERE p.id = p_req.child_id AND p.consent_status = 'pending_consent') THEN 'used'
    WHEN p_req.expires_at <= now() THEN 'expired'
    ELSE 'valid'
  END
$$;
REVOKE ALL ON FUNCTION private.consent_request_state(public.parent_consent_requests) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.consent_state_error(p_state text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_state WHEN 'expired' THEN 'expired' WHEN 'used' THEN 'used' ELSE 'invalid_token' END
$$;

-- Supersede the child's open requests other than p_keep and revoke the withdraw tokens
-- that were emailed with them (none of them was approved).
CREATE OR REPLACE FUNCTION private.consent_supersede_others(p_child_id uuid, p_keep uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  WITH sup AS (
    UPDATE public.parent_consent_requests
    SET outcome = 'superseded'
    WHERE child_id = p_child_id AND id <> p_keep AND outcome IS NULL AND used_at IS NULL
    RETURNING id
  )
  UPDATE public.parent_withdraw_tokens t
  SET revoked_at = now()
  FROM sup
  WHERE t.request_id = sup.id AND t.revoked_at IS NULL;
END;
$$;
REVOKE ALL ON FUNCTION private.consent_supersede_others(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Service-role functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consent_create_request(
  p_child_id uuid,
  p_parent_email text,
  p_token_hash text,
  p_withdraw_hash text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email text := lower(btrim(COALESCE(p_parent_email, '')));
  v_status text;
  v_next timestamptz;
  v_req public.parent_consent_requests%ROWTYPE;
BEGIN
  IF p_child_id IS NULL OR p_token_hash IS NULL OR p_withdraw_hash IS NULL THEN
    RAISE EXCEPTION 'child id and token hashes are required' USING ERRCODE = '22023';
  END IF;
  IF p_parent_email IS NULL THEN
    -- Resend: same parent address as the child's latest request (the child only sees it masked).
    SELECT parent_email INTO v_email FROM public.parent_consent_requests
    WHERE child_id = p_child_id ORDER BY created_at DESC LIMIT 1;
    IF v_email IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'bad_request');
    END IF;
  END IF;
  IF char_length(v_email) > 254 OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
  END IF;

  -- One request at a time per child and per parent address (lock order: child, then email).
  PERFORM pg_advisory_xact_lock(hashtext('consent_child'), hashtext(p_child_id::text));
  PERFORM pg_advisory_xact_lock(hashtext('consent_parent'), hashtext(v_email));

  SELECT consent_status INTO v_status FROM public.profiles WHERE id = p_child_id;
  IF v_status IS DISTINCT FROM 'pending_consent' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;

  v_next := private.consent_next_send_at(p_child_id, v_email);
  IF v_next > now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'rate_limited',
      'retry_after_seconds', GREATEST(1, ceil(extract(epoch FROM v_next - now())))::integer,
      'next_send_at', v_next);
  END IF;

  INSERT INTO public.parent_consent_requests (child_id, parent_email, token_hash, expires_at)
  VALUES (p_child_id, v_email, p_token_hash,
          now() + make_interval(days => (private.consent_config()->>'token_ttl_days')::integer))
  RETURNING * INTO v_req;

  INSERT INTO public.parent_withdraw_tokens (child_id, parent_email, token_hash, request_id)
  VALUES (p_child_id, v_email, p_withdraw_hash, v_req.id);

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', v_req.id,
    'parent_email', v_email,
    'expires_at', v_req.expires_at,
    'next_send_at', private.consent_next_send_at(p_child_id, v_email),
    'parent_email_masked', private.mask_email(v_email));
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_mark_sent(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_child uuid;
BEGIN
  UPDATE public.parent_consent_requests SET email_status = 'sent'
  WHERE id = p_request_id AND email_status = 'pending'
  RETURNING child_id INTO v_child;
  IF v_child IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;
  PERFORM private.consent_supersede_others(v_child, p_request_id);
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_mark_failed(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.parent_consent_requests SET email_status = 'failed'
  WHERE id = p_request_id AND email_status = 'pending';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;
  UPDATE public.parent_withdraw_tokens SET revoked_at = now()
  WHERE request_id = p_request_id AND revoked_at IS NULL;
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_lookup(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req public.parent_consent_requests%ROWTYPE;
  v_state text;
BEGIN
  SELECT * INTO v_req FROM public.parent_consent_requests WHERE token_hash = p_token_hash;
  v_state := private.consent_request_state(v_req);
  IF v_state IN ('not_found', 'superseded') THEN
    RETURN jsonb_build_object('status', v_state);
  END IF;
  RETURN jsonb_build_object(
    'status', v_state,
    'age_band', (SELECT age_band FROM public.profiles WHERE id = v_req.child_id),
    'parent_email_masked', private.mask_email(v_req.parent_email),
    'expires_at', v_req.expires_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_approve(
  p_token_hash text,
  p_parent_name text,
  p_parent_birth_year integer,
  p_declaration boolean,
  p_notice_version text,
  p_ip_hash text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req public.parent_consent_requests%ROWTYPE;
  v_state text;
  v_name text := btrim(regexp_replace(COALESCE(p_parent_name, ''), '[[:space:]]+', ' ', 'g'));
  v_year integer := private.ist_year();
  v_username text;
BEGIN
  -- Row lock: a concurrent approve/decline of the same token waits, then sees it used.
  SELECT * INTO v_req FROM public.parent_consent_requests WHERE token_hash = p_token_hash FOR UPDATE;
  v_state := private.consent_request_state(v_req);
  IF v_state <> 'valid' THEN
    RETURN jsonb_build_object('ok', false, 'error', private.consent_state_error(v_state));
  END IF;

  IF p_declaration IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'declaration_required');
  END IF;
  IF char_length(v_name) < 2 OR char_length(v_name) > 100 OR v_name ~ '[[:cntrl:]]' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_name');
  END IF;
  -- isAdultBirthYear: plausible (not in the future, at most 100 years ago) and turning 19+ this year.
  IF p_parent_birth_year IS NULL OR p_parent_birth_year > v_year OR p_parent_birth_year < v_year - 100
     OR v_year - p_parent_birth_year <= 18 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_adult');
  END IF;
  IF p_notice_version IS NULL OR char_length(btrim(p_notice_version)) NOT BETWEEN 1 AND 40 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_request');
  END IF;

  INSERT INTO public.parental_consents (child_id, parent_email, parent_name, parent_declared_adult, method, notice_version, ip_hash)
  VALUES (v_req.child_id, v_req.parent_email, v_name, true, 'email_link_declaration', btrim(p_notice_version),
          CASE WHEN p_ip_hash ~ '^[0-9a-f]{64}$' THEN p_ip_hash END);

  PERFORM set_config('bhao.consent_admin', 'on', true);
  UPDATE public.profiles SET consent_status = 'active_minor', updated_at = now()
  WHERE id = v_req.child_id AND consent_status = 'pending_consent'
  RETURNING username INTO v_username;
  PERFORM set_config('bhao.consent_admin', '', true);

  INSERT INTO public.leaderboard (user_id, username)
  VALUES (v_req.child_id, v_username)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.parent_consent_requests SET used_at = now(), outcome = 'approved' WHERE id = v_req.id;
  PERFORM private.consent_supersede_others(v_req.child_id, v_req.id);

  RETURN jsonb_build_object('ok', true, 'child_id', v_req.child_id, 'parent_email', v_req.parent_email);
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_decline(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req public.parent_consent_requests%ROWTYPE;
  v_state text;
BEGIN
  SELECT * INTO v_req FROM public.parent_consent_requests WHERE token_hash = p_token_hash FOR UPDATE;
  v_state := private.consent_request_state(v_req);
  IF v_state <> 'valid' THEN
    RETURN jsonb_build_object('ok', false, 'error', private.consent_state_error(v_state));
  END IF;
  -- Removes the request rows too, so the token is not found afterwards.
  PERFORM public.delete_account_by_id(v_req.child_id);
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_withdraw_lookup(p_withdraw_hash text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_child uuid;
BEGIN
  SELECT child_id INTO v_child FROM public.parent_withdraw_tokens
  WHERE token_hash = p_withdraw_hash AND revoked_at IS NULL;
  IF v_child IS NULL THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;
  RETURN jsonb_build_object('status', 'valid',
    'consent_status', (SELECT consent_status FROM public.profiles WHERE id = v_child));
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_withdraw(p_withdraw_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_child uuid;
BEGIN
  SELECT child_id INTO v_child FROM public.parent_withdraw_tokens
  WHERE token_hash = p_withdraw_hash AND revoked_at IS NULL
  FOR UPDATE;
  IF v_child IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;
  UPDATE public.parent_withdraw_tokens SET revoked_at = now() WHERE child_id = v_child AND revoked_at IS NULL;
  PERFORM public.delete_account_by_id(v_child);
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.consent_issue_withdraw_token(p_child_id uuid, p_parent_email text, p_withdraw_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_child_id AND consent_status = 'active_minor') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;
  INSERT INTO public.parent_withdraw_tokens (child_id, parent_email, token_hash)
  VALUES (p_child_id, lower(btrim(p_parent_email)), p_withdraw_hash);
  RETURN jsonb_build_object('ok', true);
END;
$$;

DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.consent_create_request(uuid, text, text, text)',
    'public.consent_mark_sent(uuid)',
    'public.consent_mark_failed(uuid)',
    'public.consent_lookup(text)',
    'public.consent_approve(text, text, integer, boolean, text, text)',
    'public.consent_decline(text)',
    'public.consent_withdraw_lookup(text)',
    'public.consent_withdraw(text)',
    'public.consent_issue_withdraw_token(uuid, text, text)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- The child's own view
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.my_consent_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_req public.parent_consent_requests%ROWTYPE;
  v_next timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  SELECT * INTO v_req FROM public.parent_consent_requests
  WHERE child_id = v_uid AND email_status <> 'failed'
  ORDER BY created_at DESC LIMIT 1;
  IF v_profile.consent_status = 'pending_consent' THEN
    v_next := private.consent_next_send_at(v_uid, NULL);
    IF v_next <= now() THEN
      v_next := NULL;
    END IF;
  END IF;
  RETURN jsonb_build_object(
    'consent_status', COALESCE(v_profile.consent_status, 'unknown'),
    'age_band', v_profile.age_band,
    'parent_email_masked', private.mask_email(v_req.parent_email),
    'last_sent_at', v_req.created_at,
    'next_send_at', v_next,
    'request_expires_at', v_req.expires_at);
END;
$$;

REVOKE ALL ON FUNCTION public.my_consent_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_consent_status() TO authenticated;
