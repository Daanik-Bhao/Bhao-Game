/**
 * Client side of the parental-consent flow (docs/age-policy.md, Option B).
 *
 * - The child (a signed-in 13–17 account in `pending_consent`) reads its status with the
 *   `my_consent_status` RPC and asks for the parent email through the `parent-consent`
 *   edge function (`request`); the function rate-limits and sends the email.
 * - The parent (no account, no login) uses the link in that email: the public
 *   /parent-consent page calls `view` / `approve` / `decline`, and the withdraw link calls
 *   `withdraw_view` / `withdraw`.
 *
 * Nothing here throws: every call resolves to `{ ok: true, ... }` or `{ ok: false, error }`.
 */
import { supabase, isSupabaseConfigured } from './supabase'
import type { AccountAgeBand } from './ageBand'
import type { ConsentStatus } from '../config/consent'
import { CONSENT_NOTICE_VERSION } from '../config/consent'
import type { Lang } from '../i18n/lang'

export type ConsentErrorCode =
  | 'unauthorized' | 'bad_request' | 'invalid_email' | 'not_pending' | 'rate_limited'
  | 'email_not_configured' | 'email_failed' | 'invalid_token' | 'expired' | 'used'
  | 'not_adult' | 'declaration_required' | 'invalid_name' | 'server_error'
  | 'not_configured' | 'network'

export type ConsentResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: ConsentErrorCode; message?: string; retryAfterSeconds?: number }

const KNOWN_ERRORS = new Set<string>([
  'unauthorized', 'bad_request', 'invalid_email', 'not_pending', 'rate_limited', 'email_not_configured',
  'email_failed', 'invalid_token', 'expired', 'used', 'not_adult', 'declaration_required', 'invalid_name',
  'server_error', 'not_configured', 'network',
])

function failure(error: unknown, message?: string, retryAfterSeconds?: unknown): ConsentResult<never> {
  const code = typeof error === 'string' && KNOWN_ERRORS.has(error) ? error as ConsentErrorCode : 'server_error'
  return {
    ok: false,
    error: code,
    ...(message ? { message } : {}),
    ...(typeof retryAfterSeconds === 'number' && retryAfterSeconds > 0 ? { retryAfterSeconds: Math.ceil(retryAfterSeconds) } : {}),
  }
}

/** POST to the parent-consent function; the function answers JSON for errors too. */
async function invokeConsent<T extends object>(body: Record<string, unknown>): Promise<ConsentResult<T>> {
  if (!isSupabaseConfigured) return failure('not_configured')
  try {
    const { data, error } = await supabase.functions.invoke('parent-consent', { body })
    if (error) {
      const ctx = (error as { context?: Response }).context
      if (ctx && typeof ctx.json === 'function') {
        try {
          const b = await ctx.json() as { error?: unknown; message?: string; retryAfterSeconds?: unknown }
          if (b && typeof b === 'object') return failure(b.error, b.message, b.retryAfterSeconds)
        } catch { /* not JSON */ }
      }
      return failure(ctx ? 'server_error' : 'network', error.message)
    }
    if (data && typeof data === 'object' && (data as { ok?: unknown }).ok === true) return data as ConsentResult<T>
    const d = data as { error?: unknown; message?: string; retryAfterSeconds?: unknown } | null
    return failure(d?.error, d?.message, d?.retryAfterSeconds)
  } catch (e) {
    return failure('network', e instanceof Error ? e.message : undefined)
  }
}

/* ------------------------------------------------------------------ child (signed in) */

export interface MyConsentStatus {
  consentStatus: ConsentStatus
  ageBand: AccountAgeBand | null
  /** e.g. "p***@g***.com"; null until a parent email was given */
  parentEmailMasked: string | null
  lastSentAt: string | null
  /** When another email may be sent (cooldown / daily cap), null = now */
  nextSendAt: string | null
  requestExpiresAt: string | null
}

export async function getMyConsentStatus(): Promise<ConsentResult<{ status: MyConsentStatus }>> {
  if (!isSupabaseConfigured) return failure('not_configured')
  try {
    const { data, error } = await supabase.rpc('my_consent_status')
    if (error) return failure('server_error', error.message)
    const d = (data ?? {}) as Record<string, unknown>
    const str = (v: unknown) => (typeof v === 'string' && v ? v : null)
    return {
      ok: true,
      status: {
        consentStatus: (str(d.consent_status) ?? 'unknown') as ConsentStatus,
        ageBand: (str(d.age_band) as AccountAgeBand | null),
        parentEmailMasked: str(d.parent_email_masked),
        lastSentAt: str(d.last_sent_at),
        nextSendAt: str(d.next_send_at),
        requestExpiresAt: str(d.request_expires_at),
      },
    }
  } catch (e) {
    return failure('network', e instanceof Error ? e.message : undefined)
  }
}

type RequestResult = { parentEmailMasked?: string; nextSendAt?: string; expiresAt?: string }

/** Child: email a parent a consent link. A new email supersedes the earlier link. */
export function requestParentConsent(parentEmail: string, lang: Lang) {
  return invokeConsent<RequestResult>({ action: 'request', parentEmail: parentEmail.trim(), lang })
}

/** Child: send the link again to the parent address given last time (the app only knows it masked). */
export function resendParentConsent(lang: Lang) {
  return invokeConsent<RequestResult>({ action: 'request', resend: true, lang })
}

/* ------------------------------------------------------------------ parent (public, token) */

export interface ConsentTokenInfo {
  ageBand?: AccountAgeBand
  parentEmailMasked?: string
  expiresAt?: string
}

export function viewConsentRequest(token: string) {
  return invokeConsent<ConsentTokenInfo>({ action: 'view', token })
}

export interface ApproveInput {
  token: string
  parentName: string
  parentBirthYear: number
  declaration: boolean
  lang: Lang
}

export function approveConsent(input: ApproveInput) {
  return invokeConsent({
    action: 'approve',
    token: input.token,
    parentName: input.parentName.trim(),
    parentBirthYear: input.parentBirthYear,
    declaration: input.declaration,
    noticeVersion: CONSENT_NOTICE_VERSION,
    lang: input.lang,
  })
}

export function declineConsent(token: string) {
  return invokeConsent({ action: 'decline', token })
}

export function viewWithdrawToken(token: string) {
  return invokeConsent<{ status?: ConsentStatus }>({ action: 'withdraw_view', token })
}

export function withdrawConsent(token: string) {
  return invokeConsent({ action: 'withdraw', token, confirm: true })
}

/** Basic shape check before calling the server (the server validates again). */
export function looksLikeEmail(v: string): boolean {
  const s = v.trim()
  return s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
}
