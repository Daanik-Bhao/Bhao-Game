import { beforeEach, describe, expect, it, vi } from 'vitest'

const sb = vi.hoisted(() => ({ invoke: vi.fn(), rpc: vi.fn() }))
vi.mock('../supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { functions: { invoke: sb.invoke }, rpc: sb.rpc },
}))

import { approveConsent, getMyConsentStatus, looksLikeEmail, requestParentConsent, resendParentConsent } from '../parentConsent'
import { CONSENT_NOTICE_VERSION } from '../../config/consent'

beforeEach(() => vi.clearAllMocks())

describe('parent-consent client', () => {
  it('sends the request / resend bodies the function expects', async () => {
    sb.invoke.mockResolvedValue({ data: { ok: true, parentEmailMasked: 'p***@e***.com' }, error: null })
    expect(await requestParentConsent('  mom@example.com ', 'hi')).toMatchObject({ ok: true, parentEmailMasked: 'p***@e***.com' })
    expect(sb.invoke).toHaveBeenLastCalledWith('parent-consent', { body: { action: 'request', parentEmail: 'mom@example.com', lang: 'hi' } })
    await resendParentConsent('en')
    expect(sb.invoke).toHaveBeenLastCalledWith('parent-consent', { body: { action: 'request', resend: true, lang: 'en' } })
  })

  it('approve carries the notice version and trims the name', async () => {
    sb.invoke.mockResolvedValue({ data: { ok: true }, error: null })
    await approveConsent({ token: 't', parentName: ' Asha ', parentBirthYear: 1980, declaration: true, lang: 'en' })
    expect(sb.invoke.mock.calls[0][1].body).toEqual({
      action: 'approve', token: 't', parentName: 'Asha', parentBirthYear: 1980, declaration: true, noticeVersion: CONSENT_NOTICE_VERSION, lang: 'en',
    })
  })

  it('reads the JSON error of a non-2xx answer (FunctionsHttpError.context)', async () => {
    const context = new Response(JSON.stringify({ ok: false, error: 'rate_limited', retryAfterSeconds: 42.2 }), { status: 429 })
    sb.invoke.mockResolvedValue({ data: null, error: Object.assign(new Error('non-2xx'), { context }) })
    expect(await requestParentConsent('mom@example.com', 'en')).toEqual({ ok: false, error: 'rate_limited', message: undefined, retryAfterSeconds: 43 })
  })

  it('network failures and unknown codes never throw', async () => {
    sb.invoke.mockRejectedValue(new Error('offline'))
    expect(await requestParentConsent('mom@example.com', 'en')).toMatchObject({ ok: false, error: 'network' })
    sb.invoke.mockResolvedValue({ data: { ok: false, error: 'weird' }, error: null })
    expect(await requestParentConsent('mom@example.com', 'en')).toMatchObject({ ok: false, error: 'server_error' })
  })

  it('maps my_consent_status', async () => {
    sb.rpc.mockResolvedValue({ data: { consent_status: 'pending_consent', age_band: '13to17', parent_email_masked: 'p***@e***.com', next_send_at: null }, error: null })
    const res = await getMyConsentStatus()
    expect(res.ok && res.status).toMatchObject({ consentStatus: 'pending_consent', parentEmailMasked: 'p***@e***.com', nextSendAt: null })
  })

  it('basic email check', () => {
    expect(looksLikeEmail('a@b.in')).toBe(true)
    expect(looksLikeEmail('a@b')).toBe(false)
    expect(looksLikeEmail('a b@c.com')).toBe(false)
  })
})
