import { describe, it, expect, vi, beforeEach } from 'vitest'

const { exchangeCodeForSession, signInWithOAuth, browserClose } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  signInWithOAuth: vi.fn(),
  browserClose: vi.fn(async () => undefined),
}))

vi.mock('../supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { exchangeCodeForSession, signInWithOAuth } },
}))
vi.mock('@capacitor/browser', () => ({
  Browser: { close: browserClose, open: vi.fn(), addListener: vi.fn() },
}))

import { parseAuthCallbackUrl, handleAuthCallbackUrl, NATIVE_AUTH_REDIRECT } from '../nativeAuth'

describe('parseAuthCallbackUrl', () => {
  it('uses the agreed deep link', () => {
    expect(NATIVE_AUTH_REDIRECT).toBe('com.daanik.bhao://login-callback')
  })

  it('extracts the PKCE code', () => {
    expect(parseAuthCallbackUrl('com.daanik.bhao://login-callback?code=abc-123')).toEqual({ type: 'code', code: 'abc-123' })
  })

  it('accepts a trailing slash, extra params and scheme/host in any case', () => {
    expect(parseAuthCallbackUrl('com.daanik.bhao://login-callback/?code=xyz&state=1')).toEqual({ type: 'code', code: 'xyz' })
    expect(parseAuthCallbackUrl('COM.DAANIK.BHAO://Login-Callback?code=xyz')).toEqual({ type: 'code', code: 'xyz' })
  })

  it('accepts the host-less triple-slash form', () => {
    expect(parseAuthCallbackUrl('com.daanik.bhao:///login-callback?code=q')).toEqual({ type: 'code', code: 'q' })
  })

  it('returns the decoded error_description from the query', () => {
    expect(parseAuthCallbackUrl(
      'com.daanik.bhao://login-callback?error=access_denied&error_code=403&error_description=User+denied%20access',
    )).toEqual({ type: 'error', message: 'User denied access' })
  })

  it('reads errors from the fragment too', () => {
    expect(parseAuthCallbackUrl('com.daanik.bhao://login-callback#error=server_error&error_description=Boom'))
      .toEqual({ type: 'error', message: 'Boom' })
  })

  it('falls back to error / error_code when there is no description', () => {
    expect(parseAuthCallbackUrl('com.daanik.bhao://login-callback?error=access_denied')).toEqual({ type: 'error', message: 'access_denied' })
    expect(parseAuthCallbackUrl('com.daanik.bhao://login-callback?error_code=bad_oauth_state')).toEqual({ type: 'error', message: 'bad_oauth_state' })
  })

  it('prefers an error over a code', () => {
    expect(parseAuthCallbackUrl('com.daanik.bhao://login-callback?code=a&error_description=nope')).toEqual({ type: 'error', message: 'nope' })
  })

  it('treats a callback without code or error as an error', () => {
    const result = parseAuthCallbackUrl('com.daanik.bhao://login-callback')
    expect(result?.type).toBe('error')
  })

  it('ignores unrelated URLs', () => {
    for (const url of [
      'https://localhost/dashboard?code=abc',
      'https://bhao.daanik.com/login-callback?code=abc',
      'com.daanik.bhao://other-path?code=abc',
      'com.daanik.other://login-callback?code=abc',
      'com.daanik.bhao://login-callback-x?code=abc',
      'not a url',
      '',
      null,
      undefined,
    ]) {
      expect(parseAuthCallbackUrl(url)).toBeNull()
    }
  })
})

describe('handleAuthCallbackUrl', () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset()
    browserClose.mockClear()
  })

  it('ignores unrelated URLs without touching Supabase', async () => {
    expect(await handleAuthCallbackUrl('https://example.com/?code=1')).toBe(false)
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(browserClose).not.toHaveBeenCalled()
  })

  it('closes the browser and exchanges a code once', async () => {
    exchangeCodeForSession.mockResolvedValue({ data: {}, error: null })
    expect(await handleAuthCallbackUrl('com.daanik.bhao://login-callback?code=once')).toBe(true)
    expect(await handleAuthCallbackUrl('com.daanik.bhao://login-callback?code=once')).toBe(true)
    expect(exchangeCodeForSession).toHaveBeenCalledTimes(1)
    expect(exchangeCodeForSession).toHaveBeenCalledWith('once')
    expect(browserClose).toHaveBeenCalled()
  })

  it('does not exchange when the callback carries an error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    expect(await handleAuthCallbackUrl('com.daanik.bhao://login-callback?error_description=denied')).toBe(true)
    expect(exchangeCodeForSession).not.toHaveBeenCalled()
    expect(browserClose).toHaveBeenCalled()
    warn.mockRestore()
  })
})
