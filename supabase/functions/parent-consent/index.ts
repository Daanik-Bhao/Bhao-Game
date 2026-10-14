/**
 * parent-consent — verifiable parental consent for 13-17 year olds (docs/age-policy.md, Option B).
 *
 * POST JSON { action, ... }. Success: 200 { ok: true, ... }. Errors: non-2xx
 * { ok: false, error: <code>, message, retryAfterSeconds? } (codes in src/lib/consentServer.ts).
 *
 *   request        (child's JWT)  { parentEmail, lang } or { resend: true, lang }
 *                  -> { ok, parentEmailMasked, nextSendAt, expiresAt }
 *                  `resend: true` re-sends to the address of the child's latest request.
 *   view           { token }                    -> { ok, ageBand, parentEmailMasked, expiresAt }
 *   approve        { token, parentName, parentBirthYear, declaration: true, noticeVersion, lang } -> { ok }
 *   decline        { token }                    -> { ok }   (deletes the child account)
 *   withdraw_view  { token }                    -> { ok, status: 'active_minor' | 'pending_consent' }
 *   withdraw       { token, confirm: true }     -> { ok }   (deletes the child account)
 *
 * Tokens are 256-bit random values; the database only stores their SHA-256 (SQL functions
 * consent_* in supabase/migrations/20261014500200_parent_consent_flow.sql, service role only).
 * If an email can't be sent the new request is marked failed: its links die and it does not
 * use up the daily caps, but the 60 s cooldown still applies.
 *
 * TODO(dpdp): consent today = single-use email link + the parent's declaration (name, adult year
 * of birth, "I am the parent/guardian"). The DPDP Rules may require a stronger verifiable method
 * (e.g. DigiLocker virtual token); add it as a new `parental_consents.method`.
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (provided by Supabase);
 *      RESEND_API_KEY, CONSENT_FROM_EMAIL, PUBLIC_SITE_URL (secrets, see .env.example);
 *      CONSENT_DEV_LOG_LINKS=true logs the links to the function console (local testing only).
 *
 * The pure logic is bundled from src/lib/consentServer.ts into ../_shared/consent.js by
 * `node scripts/build-functions.mjs` — never edit consent.js by hand.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  CONSENT_ERROR_STATUS, CONSENT_NOTICE_VERSION, MAX_BODY_BYTES, SUPPORT_EMAIL,
  buildApproveUrl, buildConsentConfirmationEmail, buildConsentRequestEmail, buildWithdrawUrl, consentError,
  firstForwardedIp, generateToken, hmacSha256Hex, isConsentAction, isConsentLang, isDevSupabaseUrl, isTokenFormat,
  istYear, normalizeEmail, sha256Hex, siteBase, tokenStateError, validateApproveBody,
} from '../_shared/consent.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any

class HttpError extends Error {
  constructor(public code: string, message?: string, public retryAfterSeconds?: number) {
    super(message ?? code)
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

function errorResponse(e: HttpError): Response {
  const { status, body } = consentError(e.code, e.message === e.code ? undefined : e.message, e.retryAfterSeconds)
  return json(body, status)
}

const env = (k: string) => (Deno.env.get(k) ?? '').trim()

function devMode(): boolean {
  return env('CONSENT_DEV_LOG_LINKS') === 'true' || isDevSupabaseUrl(env('SUPABASE_URL'))
}

interface EmailConfig {
  apiKey: string
  from: string
  site: string
}

function emailConfig(): EmailConfig | null {
  const apiKey = env('RESEND_API_KEY')
  const from = env('CONSENT_FROM_EMAIL')
  const site = siteBase(env('PUBLIC_SITE_URL'))
  return apiKey && from && site ? { apiKey, from, site } : null
}

async function sendEmail(cfg: EmailConfig, to: string, mail: { subject: string; html: string; text: string }): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: cfg.from, to: [to], reply_to: SUPPORT_EMAIL, ...mail }),
    })
    if (!res.ok) {
      console.error('parent-consent: email provider answered', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (e) {
    console.error('parent-consent: email provider unreachable', e)
    return false
  }
}

async function rpc(admin: SupabaseClient, fn: string, args: Record<string, unknown>): Promise<Json> {
  const { data, error } = await admin.rpc(fn, args)
  if (error) {
    console.error(`parent-consent: ${fn} failed`, error)
    throw new HttpError('server_error')
  }
  return data
}

/** Throws the SQL function's `{ ok: false, error }` as an HttpError. */
function check(result: Json): Json {
  if (result && result.ok === false) {
    const code = typeof result.error === 'string' && result.error in CONSENT_ERROR_STATUS ? result.error : 'server_error'
    throw new HttpError(code, undefined, result.retry_after_seconds ?? undefined)
  }
  return result
}

async function tokenHash(token: unknown): Promise<string> {
  if (!isTokenFormat(token)) throw new HttpError('invalid_token')
  return sha256Hex(token)
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
async function handleRequest(req: Request, body: Json, admin: SupabaseClient): Promise<Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) throw new HttpError('unauthorized')
  const userClient = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) throw new HttpError('unauthorized')

  if (body.lang !== undefined && !isConsentLang(body.lang)) throw new HttpError('bad_request')
  const resend = body.resend === true
  let parentEmail: string | null = null
  if (!resend) {
    parentEmail = normalizeEmail(body.parentEmail)
    if (!parentEmail) throw new HttpError('invalid_email')
    if (user.email && parentEmail === user.email.trim().toLowerCase()) {
      throw new HttpError('invalid_email', `Please enter your parent's or guardian's email, not your own.`)
    }
  }

  const cfg = emailConfig()
  const dev = devMode()
  if (!cfg && !dev) {
    throw new HttpError('email_not_configured',
      'Parent emails are not set up on this server yet (RESEND_API_KEY, CONSENT_FROM_EMAIL and PUBLIC_SITE_URL are needed).')
  }

  const consentToken = generateToken()
  const withdrawToken = generateToken()
  const created = check(await rpc(admin, 'consent_create_request', {
    p_child_id: user.id,
    p_parent_email: parentEmail,
    p_token_hash: await sha256Hex(consentToken),
    p_withdraw_hash: await sha256Hex(withdrawToken),
  }))

  const site = cfg?.site ?? siteBase(env('PUBLIC_SITE_URL')) ?? 'http://localhost:5173'
  const approveUrl = buildApproveUrl(site, consentToken)
  const withdrawUrl = buildWithdrawUrl(site, withdrawToken)

  if (!cfg) {
    // Dev only: keep the request usable and print the links instead of emailing them.
    console.log(`parent-consent (dev): approve link ${approveUrl}`)
    console.log(`parent-consent (dev): withdraw link ${withdrawUrl}`)
    await rpc(admin, 'consent_mark_sent', { p_request_id: created.request_id })
    throw new HttpError('email_not_configured',
      'Parent emails are not set up on this server (dev: the links were written to the function log).')
  }

  const mail = buildConsentRequestEmail({ approveUrl, withdrawUrl, expiresAt: new Date(created.expires_at) })
  if (!(await sendEmail(cfg, created.parent_email, mail))) {
    await rpc(admin, 'consent_mark_failed', { p_request_id: created.request_id })
    throw new HttpError('email_failed')
  }
  await rpc(admin, 'consent_mark_sent', { p_request_id: created.request_id })
  if (dev) {
    console.log(`parent-consent (dev): approve link ${approveUrl}`)
    console.log(`parent-consent (dev): withdraw link ${withdrawUrl}`)
  }

  return json({
    ok: true,
    parentEmailMasked: created.parent_email_masked,
    nextSendAt: created.next_send_at,
    expiresAt: created.expires_at,
  })
}

async function handleView(body: Json, admin: SupabaseClient): Promise<Response> {
  const r = await rpc(admin, 'consent_lookup', { p_token_hash: await tokenHash(body.token) })
  const err = tokenStateError(r?.status)
  if (err) throw new HttpError(err)
  return json({ ok: true, ageBand: r.age_band, parentEmailMasked: r.parent_email_masked, expiresAt: r.expires_at })
}

async function handleApprove(req: Request, body: Json, admin: SupabaseClient): Promise<Response> {
  const v = validateApproveBody(body, istYear(new Date()))
  if (!v.ok) throw new HttpError(v.error, v.message)
  const { token, parentName, parentBirthYear, noticeVersion } = v.value
  if (noticeVersion !== CONSENT_NOTICE_VERSION) throw new HttpError('bad_request')

  const ip = firstForwardedIp(req.headers.get('x-forwarded-for'))
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY')
  const ipHash = ip && serviceKey ? await hmacSha256Hex(serviceKey, ip) : null

  const approved = check(await rpc(admin, 'consent_approve', {
    p_token_hash: await sha256Hex(token),
    p_parent_name: parentName,
    p_parent_birth_year: parentBirthYear,
    p_declaration: true,
    p_notice_version: noticeVersion,
    p_ip_hash: ipHash,
  }))

  // Best effort: confirmation with a fresh withdraw link. Consent is already recorded.
  try {
    const cfg = emailConfig()
    const site = cfg?.site ?? (devMode() ? siteBase(env('PUBLIC_SITE_URL')) ?? 'http://localhost:5173' : null)
    if (site) {
      const withdrawToken = generateToken()
      const issued = await rpc(admin, 'consent_issue_withdraw_token', {
        p_child_id: approved.child_id,
        p_parent_email: approved.parent_email,
        p_withdraw_hash: await sha256Hex(withdrawToken),
      })
      if (issued?.ok) {
        const withdrawUrl = buildWithdrawUrl(site, withdrawToken)
        if (cfg) {
          await sendEmail(cfg, approved.parent_email, buildConsentConfirmationEmail({ withdrawUrl, consentedAt: new Date() }))
        }
        if (devMode()) console.log(`parent-consent (dev): withdraw link ${withdrawUrl}`)
      }
    }
  } catch (e) {
    console.error('parent-consent: confirmation email failed', e)
  }

  return json({ ok: true })
}

async function handleDecline(body: Json, admin: SupabaseClient): Promise<Response> {
  check(await rpc(admin, 'consent_decline', { p_token_hash: await tokenHash(body.token) }))
  return json({ ok: true })
}

async function handleWithdrawView(body: Json, admin: SupabaseClient): Promise<Response> {
  const r = await rpc(admin, 'consent_withdraw_lookup', { p_withdraw_hash: await tokenHash(body.token) })
  if (r?.status !== 'valid') throw new HttpError('invalid_token')
  return json({ ok: true, status: r.consent_status })
}

async function handleWithdraw(body: Json, admin: SupabaseClient): Promise<Response> {
  if (body.confirm !== true) throw new HttpError('bad_request', 'Please confirm that the account should be deleted.')
  check(await rpc(admin, 'consent_withdraw', { p_withdraw_hash: await tokenHash(body.token) }))
  return json({ ok: true })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') throw new HttpError('bad_request', 'Method not allowed')

    const raw = await req.text()
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) throw new HttpError('bad_request', 'Request too large')
    let body: Json
    try {
      body = JSON.parse(raw)
    } catch {
      throw new HttpError('bad_request', 'Invalid JSON body')
    }
    if (!body || typeof body !== 'object' || Array.isArray(body) || !isConsentAction(body.action)) {
      throw new HttpError('bad_request')
    }

    const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    switch (body.action) {
      case 'request': return await handleRequest(req, body, admin)
      case 'view': return await handleView(body, admin)
      case 'approve': return await handleApprove(req, body, admin)
      case 'decline': return await handleDecline(body, admin)
      case 'withdraw_view': return await handleWithdrawView(body, admin)
      case 'withdraw': return await handleWithdraw(body, admin)
    }
    throw new HttpError('bad_request')
  } catch (error) {
    if (error instanceof HttpError) return errorResponse(error)
    console.error('parent-consent failed', error)
    return errorResponse(new HttpError('server_error'))
  }
})
