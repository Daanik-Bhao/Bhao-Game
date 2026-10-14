import { describe, it, expect } from 'vitest'
import {
  CONSENT_ERROR_STATUS, buildApproveUrl, buildConsentConfirmationEmail, buildConsentRequestEmail, buildWithdrawUrl,
  consentError, escapeHtml, firstForwardedIp, formatIstDate, generateToken, hmacSha256Hex, isConsentAction,
  isConsentLang, isDevSupabaseUrl, isTokenFormat, istYear, maskEmail, normalizeEmail, normalizeParentName,
  sha256Hex, siteBase, tokenStateError, validateApproveBody,
} from '../consentServer'
import { CONSENT_NOTICE_VERSION } from '../../config/consent'
import { SUPPORT_EMAIL } from '../../config/contact'

const TOKEN = 'A'.repeat(43)

describe('emails', () => {
  it('normalizes and validates addresses', () => {
    expect(normalizeEmail('  Riya.Sharma@Gmail.COM ')).toBe('riya.sharma@gmail.com')
    expect(normalizeEmail('a+b@sub.example.in')).toBe('a+b@sub.example.in')
    for (const bad of ['', 'x', 'a@b', 'a@@b.com', 'a b@c.com', '.a@b.com', 'a..b@c.com', 'a@-b.com', 'a@b.c', 42, null, `${'a'.repeat(65)}@b.com`]) {
      expect(normalizeEmail(bad)).toBeNull()
    }
  })

  it('masks addresses like the SQL mask_email', () => {
    expect(maskEmail('riya.sharma@gmail.com')).toBe('r***@gmail.com')
    expect(maskEmail('a@b.in')).toBe('a***@b.in')
    expect(maskEmail('nope')).toBe('***')
    expect(maskEmail('@x.com')).toBe('***')
  })
})

describe('tokens and hashes', () => {
  it('generates distinct 256-bit base64url tokens', () => {
    const a = generateToken()
    const b = generateToken()
    expect(isTokenFormat(a)).toBe(true)
    expect(a).toHaveLength(43)
    expect(a).not.toBe(b)
    expect(isTokenFormat('short')).toBe(false)
    expect(isTokenFormat(`${'A'.repeat(42)}=`)).toBe(false)
    expect(isTokenFormat(123)).toBe(false)
  })

  it('sha256Hex / hmacSha256Hex match known vectors', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    // RFC 4231 test case 2
    expect(await hmacSha256Hex('Jefe', 'what do ya want for nothing?'))
      .toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843')
  })

  it('takes the first forwarded IP only', () => {
    expect(firstForwardedIp('203.0.113.7, 10.0.0.1')).toBe('203.0.113.7')
    expect(firstForwardedIp('2001:db8::1')).toBe('2001:db8::1')
    expect(firstForwardedIp('<script>')).toBeNull()
    expect(firstForwardedIp(null)).toBeNull()
  })
})

describe('links and environment', () => {
  it('builds links from the site URL without a trailing slash', () => {
    expect(siteBase('https://bhao.daanik.com/')).toBe('https://bhao.daanik.com')
    expect(siteBase('http://localhost:5173')).toBe('http://localhost:5173')
    expect(siteBase('bhao.daanik.com')).toBeNull()
    expect(siteBase('')).toBeNull()
    expect(buildApproveUrl('https://x.in', 'ab-_c')).toBe('https://x.in/parent-consent?token=ab-_c')
    expect(buildWithdrawUrl('https://x.in', 'ab')).toBe('https://x.in/parent-consent/withdraw?token=ab')
  })

  it('detects a local Supabase stack', () => {
    expect(isDevSupabaseUrl('http://127.0.0.1:54321')).toBe(true)
    expect(isDevSupabaseUrl('http://kong:8000')).toBe(true)
    expect(isDevSupabaseUrl('https://abcdefghijklmnopqrst.supabase.co')).toBe(false)
    expect(isDevSupabaseUrl('')).toBe(false)
  })
})

describe('input validation', () => {
  const year = 2026
  const good = { token: TOKEN, parentName: '  Sunita   Sharma ', parentBirthYear: 1980, declaration: true, noticeVersion: CONSENT_NOTICE_VERSION, lang: 'hi' }

  it('accepts a valid approve body and normalizes the name', () => {
    const r = validateApproveBody(good, year)
    expect(r).toEqual({ ok: true, value: { token: TOKEN, parentName: 'Sunita Sharma', parentBirthYear: 1980, noticeVersion: CONSENT_NOTICE_VERSION, lang: 'hi' } })
  })

  it('rejects each bad field with its own code', () => {
    const err = (patch: Record<string, unknown>) => {
      const r = validateApproveBody({ ...good, ...patch }, year)
      return r.ok ? null : r.error
    }
    expect(err({ token: 'x' })).toBe('invalid_token')
    expect(err({ parentName: 5 })).toBe('bad_request')
    expect(err({ noticeVersion: '2000-01-01' })).toBe('bad_request')
    expect(err({ lang: 'fr' })).toBe('bad_request')
    expect(err({ declaration: 'true' })).toBe('declaration_required')
    expect(err({ declaration: false })).toBe('declaration_required')
    expect(err({ parentName: ' a ' })).toBe('invalid_name')
    expect(err({ parentName: 'x'.repeat(101) })).toBe('invalid_name')
    expect(err({ parentName: 'Ab\u0007c' })).toBe('invalid_name')
    // isAdultBirthYear: turning 19+ this year and at most 100 years ago
    expect(err({ parentBirthYear: year - 18 })).toBe('not_adult')
    expect(err({ parentBirthYear: year - 19 })).toBeNull()
    expect(err({ parentBirthYear: year - 101 })).toBe('not_adult')
    expect(err({ parentBirthYear: '1980' })).toBe('not_adult')
    expect(err({ parentBirthYear: 1980.5 })).toBe('not_adult')
  })

  it('validates names, langs and actions', () => {
    expect(normalizeParentName('Al')).toBe('Al')
    expect(normalizeParentName(null)).toBeNull()
    expect(isConsentLang('hinglish')).toBe(true)
    expect(isConsentLang('HI')).toBe(false)
    expect(isConsentAction('withdraw_view')).toBe(true)
    expect(isConsentAction('delete_everything')).toBe(false)
  })

  it('uses the India calendar year', () => {
    expect(istYear(new Date('2026-12-31T19:00:00Z'))).toBe(2027)
    expect(istYear(new Date('2026-12-31T18:00:00Z'))).toBe(2026)
  })
})

describe('errors', () => {
  it('maps codes to statuses and bodies', () => {
    expect(consentError('rate_limited', undefined, 12.2)).toEqual({
      status: 429, body: { ok: false, error: 'rate_limited', message: expect.any(String), retryAfterSeconds: 13 },
    })
    expect(consentError('invalid_token', 'x').body).toEqual({ ok: false, error: 'invalid_token', message: 'x' })
    for (const status of Object.values(CONSENT_ERROR_STATUS)) expect(status).toBeGreaterThanOrEqual(400)
    expect(tokenStateError('valid')).toBeNull()
    expect(tokenStateError('expired')).toBe('expired')
    expect(tokenStateError('used')).toBe('used')
    expect(tokenStateError('superseded')).toBe('invalid_token')
    expect(tokenStateError('not_found')).toBe('invalid_token')
  })
})

describe('email content', () => {
  const approveUrl = buildApproveUrl('https://bhao.daanik.com', TOKEN)
  const withdrawUrl = buildWithdrawUrl('https://bhao.daanik.com', 'B'.repeat(43))

  it('request email: English then Hindi, both links, expiry, grievance contact', () => {
    const e = buildConsentRequestEmail({ approveUrl, withdrawUrl, expiresAt: new Date('2026-10-21T10:00:00Z') })
    expect(e.subject).toMatch(/BHAO/)
    expect(e.subject).toMatch(/[ऀ-ॿ]/)
    for (const body of [e.html, e.text]) {
      expect(body).toContain(approveUrl)
      expect(body).toContain(withdrawUrl)
      expect(body).toContain(SUPPORT_EMAIL)
      expect(body).toContain('21 October 2026')
      expect(body).toContain('21 अक्टूबर 2026')
      expect(body).toMatch(/ignore this email/)
      expect(body.indexOf('Hello')).toBeLessThan(body.indexOf('नमस्ते'))
    }
    expect(e.html).toContain('lang="hi"')
  })

  it('confirmation email carries the new withdraw link', () => {
    const e = buildConsentConfirmationEmail({ withdrawUrl, consentedAt: new Date('2026-10-14T05:00:00Z') })
    expect(e.html).toContain(withdrawUrl)
    expect(e.text).toContain('14 October 2026')
    expect(e.text).toContain(SUPPORT_EMAIL)
  })

  it('escapes HTML', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
    const e = buildConsentRequestEmail({ approveUrl: 'https://x.in/?a="><script>', withdrawUrl, expiresAt: new Date() })
    expect(e.html).not.toContain('"><script>')
    expect(formatIstDate(new Date('2026-01-31T20:00:00Z'), 'en')).toBe('1 February 2026')
  })
})

describe('supabase/functions/_shared/consent.js', () => {
  it('is the bundled module (run `npm run build:functions` after changing consentServer.ts)', async () => {
    const BUNDLE = '../../../supabase/functions/_shared/consent.js'
    const mod = await import(/* @vite-ignore */ BUNDLE)
    expect(mod.maskEmail('riya@gmail.com')).toBe('r***@gmail.com')
    expect(await mod.sha256Hex('abc')).toBe(await sha256Hex('abc'))
    expect(mod.CONSENT_NOTICE_VERSION).toBe(CONSENT_NOTICE_VERSION)
  })
})
