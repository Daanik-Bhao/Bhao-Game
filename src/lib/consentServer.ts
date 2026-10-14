/**
 * Pure logic of the `parent-consent` edge function (docs/age-policy.md, Option B), bundled
 * into supabase/functions/_shared/consent.js by `npm run build:functions`.
 *
 * No browser or Deno APIs here other than `globalThis.crypto` (WebCrypto works in Deno,
 * Node 20+ and browsers), so the same code is unit-tested with vitest and runs in the function.
 */
import { CONSENT_NOTICE_VERSION, CONSENT_TOKEN_TTL_DAYS } from '../config/consent'
import { SUPPORT_EMAIL } from '../config/contact'
import { isAdultBirthYear } from './ageBand'

// Re-exported for the edge function (it only imports the bundle).
export { CONSENT_NOTICE_VERSION, CONSENT_TOKEN_TTL_DAYS, SUPPORT_EMAIL }

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------
export type ConsentErrorCode =
  | 'unauthorized' | 'bad_request' | 'invalid_email' | 'not_pending' | 'rate_limited'
  | 'email_not_configured' | 'email_failed' | 'invalid_token' | 'expired' | 'used'
  | 'not_adult' | 'declaration_required' | 'invalid_name' | 'server_error'

/** HTTP status for each error code (the body is always `{ ok: false, error, message }`). */
export const CONSENT_ERROR_STATUS: Record<ConsentErrorCode, number> = {
  unauthorized: 401,
  bad_request: 400,
  invalid_email: 400,
  not_pending: 409,
  rate_limited: 429,
  email_not_configured: 503,
  email_failed: 502,
  invalid_token: 404,
  expired: 410,
  used: 409,
  not_adult: 422,
  declaration_required: 422,
  invalid_name: 422,
  server_error: 500,
}

export interface ConsentErrorBody {
  ok: false
  error: ConsentErrorCode
  message: string
  retryAfterSeconds?: number
}

const DEFAULT_MESSAGES: Record<ConsentErrorCode, string> = {
  unauthorized: 'Please sign in again.',
  bad_request: 'The request was not understood.',
  invalid_email: 'Please enter a valid parent or guardian email address.',
  not_pending: 'This account is not waiting for parental consent.',
  rate_limited: 'Please wait a little before sending another email.',
  email_not_configured: 'Parent emails are not set up on this server yet.',
  email_failed: 'The email could not be sent. Please try again later.',
  invalid_token: 'This link is not valid any more. Please use the newest email from BHAO.',
  expired: 'This link has expired. Ask your child to send a new request from the app.',
  used: 'This link has already been used.',
  not_adult: 'The parent or guardian must be an adult (18 or older).',
  declaration_required: 'Please confirm that you are the parent or lawful guardian.',
  invalid_name: 'Please enter your full name (2-100 characters).',
  server_error: 'Something went wrong. Please try again.',
}

export function consentError(code: ConsentErrorCode, message?: string, retryAfterSeconds?: number): { status: number; body: ConsentErrorBody } {
  const body: ConsentErrorBody = { ok: false, error: code, message: message ?? DEFAULT_MESSAGES[code] }
  if (retryAfterSeconds !== undefined) body.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds))
  return { status: CONSENT_ERROR_STATUS[code], body }
}

/** Maps a token state from the SQL lookup functions to an error code (null when valid). */
export function tokenStateError(state: unknown): ConsentErrorCode | null {
  if (state === 'valid') return null
  if (state === 'expired') return 'expired'
  if (state === 'used') return 'used'
  return 'invalid_token'
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
/** Request bodies larger than this are rejected before parsing. */
export const MAX_BODY_BYTES = 4096

export const CONSENT_LANGS = ['en', 'hi', 'hinglish'] as const
export type ConsentLang = typeof CONSENT_LANGS[number]
export function isConsentLang(v: unknown): v is ConsentLang {
  return typeof v === 'string' && (CONSENT_LANGS as readonly string[]).includes(v)
}

export const CONSENT_ACTIONS = ['request', 'view', 'approve', 'decline', 'withdraw_view', 'withdraw'] as const
export type ConsentAction = typeof CONSENT_ACTIONS[number]
export function isConsentAction(v: unknown): v is ConsentAction {
  return typeof v === 'string' && (CONSENT_ACTIONS as readonly string[]).includes(v)
}

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,63}$/

/** Trimmed, lower-cased address, or null when it is not a valid email. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const email = raw.trim().toLowerCase()
  if (email.length > 254 || !EMAIL_RE.test(email)) return null
  const local = email.slice(0, email.lastIndexOf('@'))
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null
  return email
}

/**
 * 'riya.sharma@gmail.com' -> 'r***@gmail.com'. Same rule as SQL private.mask_email()
 * (checked by scripts/check-migrations.mjs).
 */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@')
  if (at < 1) return '***'
  return `${email.charAt(0)}***@${email.slice(at + 1)}`
}

function hasControlChars(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c < 0x20 || c === 0x7f) return true
  }
  return false
}

/** Parent name with whitespace collapsed, or null unless 2-100 characters. */
export function normalizeParentName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.replace(/\s+/g, ' ').trim()
  if (name.length < 2 || name.length > 100 || hasControlChars(name)) return null
  return name
}

/** Calendar year in India (the SQL side uses Asia/Kolkata too). */
export function istYear(now: Date): number {
  return new Date(now.getTime() + 330 * 60_000).getUTCFullYear()
}

export interface ApproveInput {
  token: string
  parentName: string
  parentBirthYear: number
  noticeVersion: string
  lang: ConsentLang
}

export type ApproveValidation =
  | { ok: true; value: ApproveInput }
  | { ok: false; error: ConsentErrorCode; message?: string }

/** Validates the `approve` body (the SQL function re-checks everything it stores). */
export function validateApproveBody(body: Record<string, unknown>, currentYear: number): ApproveValidation {
  if (!isTokenFormat(body.token)) return { ok: false, error: 'invalid_token' }
  if (typeof body.parentName !== 'string' || typeof body.noticeVersion !== 'string'
      || (body.lang !== undefined && !isConsentLang(body.lang))) {
    return { ok: false, error: 'bad_request' }
  }
  if (body.noticeVersion !== CONSENT_NOTICE_VERSION) {
    return { ok: false, error: 'bad_request', message: 'The consent notice has changed. Please reload the page.' }
  }
  if (body.declaration !== true) return { ok: false, error: 'declaration_required' }
  const parentName = normalizeParentName(body.parentName)
  if (!parentName) return { ok: false, error: 'invalid_name' }
  if (!isAdultBirthYear(body.parentBirthYear, currentYear)) return { ok: false, error: 'not_adult' }
  return {
    ok: true,
    value: {
      token: body.token,
      parentName,
      parentBirthYear: body.parentBirthYear as number,
      noticeVersion: body.noticeVersion,
      lang: isConsentLang(body.lang) ? body.lang : 'en',
    },
  }
}

// ---------------------------------------------------------------------------
// Tokens and hashing
// ---------------------------------------------------------------------------
function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('')
}

/** 256-bit random token, base64url without padding (43 characters). */
export function generateToken(): string {
  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)
  return bytesToBase64Url(bytes)
}

export function isTokenFormat(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Za-z0-9_-]{43}$/.test(v)
}

/** SHA-256 hex of a UTF-8 string (what the database stores instead of a token). */
export async function sha256Hex(text: string): Promise<string> {
  return bytesToHex(await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
}

/** HMAC-SHA256 hex of `text` keyed with `key`. */
export async function hmacSha256Hex(key: string, text: string): Promise<string> {
  const k = await globalThis.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return bytesToHex(await globalThis.crypto.subtle.sign('HMAC', k, new TextEncoder().encode(text)))
}

/** First address of an `x-forwarded-for` header (the client), or null. */
export function firstForwardedIp(header: string | null | undefined): string | null {
  if (!header) return null
  const ip = header.split(',')[0].trim()
  return ip && ip.length <= 64 && /^[0-9A-Fa-f:.]+$/.test(ip) ? ip : null
}

// ---------------------------------------------------------------------------
// Links and environment
// ---------------------------------------------------------------------------
/** `https://bhao.daanik.com/` -> `https://bhao.daanik.com`; null unless an http(s) URL. */
export function siteBase(url: string | null | undefined): string | null {
  const s = (url ?? '').trim().replace(/\/+$/, '')
  return /^https?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/.test(s) ? s : null
}

export function buildApproveUrl(site: string, token: string): string {
  return `${site}/parent-consent?token=${encodeURIComponent(token)}`
}

export function buildWithdrawUrl(site: string, token: string): string {
  return `${site}/parent-consent/withdraw?token=${encodeURIComponent(token)}`
}

/** True for a local Supabase stack (links may be logged to the console there). */
export function isDevSupabaseUrl(url: string | null | undefined): boolean {
  try {
    const host = new URL(url ?? '').hostname
    return host === 'localhost' || host === '127.0.0.1' || host === 'kong' || host === 'host.docker.internal'
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Emails (always English first, then Hindi)
// ---------------------------------------------------------------------------
export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']

/** Date in India time, e.g. '21 October 2026' / '21 अक्टूबर 2026'. */
export function formatIstDate(date: Date, lang: 'en' | 'hi'): string {
  const d = new Date(date.getTime() + 330 * 60_000)
  const months = lang === 'hi' ? MONTHS_HI : MONTHS_EN
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export interface EmailContent {
  subject: string
  html: string
  text: string
}

/** A paragraph is plain text; `{link}` paragraphs become a button / bare URL. */
type Block = { p: string } | { link: string; label: string }

function render(sections: { lang: 'en' | 'hi'; blocks: Block[] }[]): { html: string; text: string } {
  const html = sections.map(({ lang, blocks }) => {
    const inner = blocks.map(b => ('p' in b
      ? `<p style="margin:0 0 14px;line-height:1.5">${escapeHtml(b.p)}</p>`
      : `<p style="margin:0 0 14px"><a href="${escapeHtml(b.link)}" style="display:inline-block;background:#1f6f43;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">${escapeHtml(b.label)}</a><br><span style="font-size:12px;color:#555;word-break:break-all">${escapeHtml(b.link)}</span></p>`
    )).join('\n')
    return `<div lang="${lang}" style="margin:0 0 24px">\n${inner}\n</div>`
  }).join('\n<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">\n')
  const text = sections.map(({ blocks }) => blocks.map(b => ('p' in b ? b.p : `${b.label}: ${b.link}`)).join('\n\n'))
    .join('\n\n----------------------------------------\n\n')
  return {
    html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:600px;margin:0 auto;padding:16px">\n${html}\n</body></html>`,
    text: text + '\n',
  }
}

export interface ConsentRequestEmailInput {
  approveUrl: string
  withdrawUrl: string
  expiresAt: Date
}

/** The email a child's parent receives when the child asks for consent. */
export function buildConsentRequestEmail({ approveUrl, withdrawUrl, expiresAt }: ConsentRequestEmailInput): EmailContent {
  const en = formatIstDate(expiresAt, 'en')
  const hi = formatIstDate(expiresAt, 'hi')
  const { html, text } = render([
    {
      lang: 'en',
      blocks: [
        { p: 'Hello,' },
        { p: 'BHAO is a card game that teaches young Indians how money works: saving, investing, loans and avoiding debt traps. A player who says they are your child (aged 13 to 17) has created a BHAO account and asked for your permission to use it.' },
        { p: `India's Digital Personal Data Protection Act, 2023 asks us to get a parent's or guardian's consent before we keep a child's data. Until you agree, the account is paused: nothing they play is saved and their chosen name is not stored.` },
        { p: `To allow the account, open this link and fill in the short form. The link works once and expires on ${en} (${CONSENT_TOKEN_TTL_DAYS} days).` },
        { link: approveUrl, label: 'Review and give consent' },
        { p: 'You can delete the account and its data at any time, now or later, with this link:' },
        { link: withdrawUrl, label: 'Delete the account' },
        { p: `If you don't know this child, please ignore this email. Without your consent the account stays paused.` },
        { p: `Questions or complaints (grievance contact): ${SUPPORT_EMAIL}` },
      ],
    },
    {
      lang: 'hi',
      blocks: [
        { p: 'नमस्ते,' },
        { p: 'BHAO एक कार्ड गेम है जो युवा भारतीयों को पैसे की समझ सिखाता है: बचत, निवेश, लोन और कर्ज़ के जाल से बचना। एक खिलाड़ी ने, जो कहता है कि वह आपका बच्चा है (उम्र 13 से 17 साल), BHAO पर खाता बनाया है और उसे इस्तेमाल करने के लिए आपकी अनुमति माँगी है।' },
        { p: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के अनुसार किसी बच्चे का डेटा रखने से पहले हमें माता-पिता या अभिभावक की सहमति लेनी होती है। आपकी सहमति तक खाता रुका रहेगा: खेल का कुछ भी सेव नहीं होगा और बच्चे का चुना हुआ नाम नहीं रखा जाएगा।' },
        { p: `खाते की अनुमति देने के लिए यह लिंक खोलें और छोटा सा फ़ॉर्म भरें। लिंक एक ही बार काम करेगा और ${hi} को (${CONSENT_TOKEN_TTL_DAYS} दिन में) समाप्त हो जाएगा।` },
        { link: approveUrl, label: 'देखें और सहमति दें' },
        { p: 'आप कभी भी, अभी या बाद में, इस लिंक से खाता और उसका डेटा मिटा सकते हैं:' },
        { link: withdrawUrl, label: 'खाता मिटाएँ' },
        { p: 'अगर आप इस बच्चे को नहीं जानते, तो कृपया इस ईमेल को अनदेखा करें। आपकी सहमति के बिना खाता रुका ही रहेगा।' },
        { p: `सवाल या शिकायत (शिकायत अधिकारी): ${SUPPORT_EMAIL}` },
      ],
    },
  ])
  return {
    subject: 'BHAO: your child asks for your consent | आपका बच्चा आपकी सहमति माँग रहा है',
    html,
    text,
  }
}

export interface ConsentConfirmationEmailInput {
  withdrawUrl: string
  consentedAt: Date
}

/** Sent to the parent after they gave consent, with a fresh delete link. */
export function buildConsentConfirmationEmail({ withdrawUrl, consentedAt }: ConsentConfirmationEmailInput): EmailContent {
  const { html, text } = render([
    {
      lang: 'en',
      blocks: [
        { p: 'Hello,' },
        { p: `Thank you. You gave consent for your child's BHAO account on ${formatIstDate(consentedAt, 'en')}. The account is now active.` },
        { p: 'For players under 18, BHAO keeps child-safe limits: they are not shown on the public leaderboard, they can only play in private invite-code rooms, and we do not track or profile them for advertising.' },
        { p: 'You can withdraw your consent at any time. This deletes the account and its data:' },
        { link: withdrawUrl, label: 'Withdraw consent and delete the account' },
        { p: `Questions or complaints (grievance contact): ${SUPPORT_EMAIL}` },
      ],
    },
    {
      lang: 'hi',
      blocks: [
        { p: 'नमस्ते,' },
        { p: `धन्यवाद। आपने ${formatIstDate(consentedAt, 'hi')} को अपने बच्चे के BHAO खाते के लिए सहमति दी। खाता अब चालू है।` },
        { p: '18 साल से कम उम्र के खिलाड़ियों के लिए BHAO सुरक्षित सीमाएँ रखता है: वे सार्वजनिक लीडरबोर्ड पर नहीं दिखते, केवल निजी इनवाइट-कोड रूम में खेल सकते हैं, और हम विज्ञापन के लिए उन्हें ट्रैक या प्रोफ़ाइल नहीं करते।' },
        { p: 'आप कभी भी अपनी सहमति वापस ले सकते हैं। इससे खाता और उसका डेटा मिट जाएगा:' },
        { link: withdrawUrl, label: 'सहमति वापस लें और खाता मिटाएँ' },
        { p: `सवाल या शिकायत (शिकायत अधिकारी): ${SUPPORT_EMAIL}` },
      ],
    },
  ])
  return {
    subject: 'BHAO: consent recorded | सहमति दर्ज हो गई',
    html,
    text,
  }
}
