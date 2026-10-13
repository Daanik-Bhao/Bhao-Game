import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Google sign-in for the Capacitor Android app.
 *
 * Inside the app the WebView origin is https://localhost, so the web redirect
 * flow (redirectTo = window.location.origin) cannot work. Instead:
 *   1. signInWithOAuth (PKCE, see supabase.ts) with a custom-scheme redirect and
 *      skipBrowserRedirect, so supabase-js only returns the provider URL;
 *   2. that URL is opened in a Custom Tab (@capacitor/browser);
 *   3. Supabase redirects to com.daanik.bhao://login-callback?code=..., Android
 *      routes the deep link back to the app (intent-filter in AndroidManifest)
 *      and @capacitor/app emits 'appUrlOpen' (or getLaunchUrl() on cold start);
 *   4. the code is exchanged for a session (exchangeCodeForSession), which fires
 *      SIGNED_IN through onAuthStateChange exactly like the web flow.
 *
 * In a normal browser none of this runs: isNativeApp() is false.
 */

/** Deep link Supabase redirects to after Google sign-in in the Android app. */
export const NATIVE_AUTH_SCHEME = 'com.daanik.bhao'
export const NATIVE_AUTH_HOST = 'login-callback'
export const NATIVE_AUTH_REDIRECT = `${NATIVE_AUTH_SCHEME}://${NATIVE_AUTH_HOST}`

/**
 * After the Custom Tab reports it was closed, wait this long for the deep link
 * before treating the sign-in as cancelled. Android can report the tab hidden
 * before or after delivering the deep link, so both orders must work.
 */
const CANCEL_GRACE_MS = 2000

export type AuthCallbackResult =
  | { type: 'code'; code: string }
  | { type: 'error'; message: string }

/**
 * Parses a deep link. Returns null for URLs that are not the login callback
 * (other deep links must be ignored), otherwise the PKCE code or an error.
 * Pure: no side effects, safe to unit-test.
 */
export function parseAuthCallbackUrl(rawUrl: string | null | undefined): AuthCallbackResult | null {
  if (!rawUrl) return null
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  if (url.protocol.toLowerCase() !== `${NATIVE_AUTH_SCHEME}:`) return null
  // WHATWG URL parses "scheme://login-callback" with host "login-callback"; be
  // lenient about a host-less "scheme:///login-callback" form too.
  const target = (url.host || url.pathname.replace(/^\/+/, '')).replace(/\/+$/, '').toLowerCase()
  if (target !== NATIVE_AUTH_HOST) return null

  // Supabase puts PKCE results in the query string, but errors can also arrive
  // in the fragment. Query values win.
  const params = new URLSearchParams(url.hash.replace(/^#/, ''))
  url.searchParams.forEach((value, key) => params.set(key, value))

  const errorMessage = params.get('error_description') || params.get('error') || params.get('error_code')
  if (errorMessage) return { type: 'error', message: errorMessage }

  const code = params.get('code')
  if (code) return { type: 'code', code }

  return { type: 'error', message: 'Sign-in did not complete. Please try again.' }
}

/** True inside the Capacitor Android/iOS app, false in any browser. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

export type NativeSignInOutcome = 'signed-in' | 'cancelled'

interface PendingSignIn {
  resolve: (outcome: NativeSignInOutcome) => void
  reject: (error: Error) => void
  callbackReceived: boolean
  cancelTimer: ReturnType<typeof setTimeout> | null
  browserListener: PluginListenerHandle | null
}

let pending: PendingSignIn | null = null
let initialized = false
let onSignedInCallback: (() => void) | null = null
/** Codes already exchanged: getLaunchUrl() and appUrlOpen can both report the same link. */
const handledCodes = new Set<string>()

function settle(outcome: NativeSignInOutcome | Error) {
  const current = pending
  if (!current) return
  pending = null
  if (current.cancelTimer) clearTimeout(current.cancelTimer)
  current.browserListener?.remove().catch(() => undefined)
  if (outcome instanceof Error) current.reject(outcome)
  else current.resolve(outcome)
}

async function closeBrowser() {
  try {
    const { Browser } = await import('@capacitor/browser')
    await Browser.close()
  } catch {
    /* the tab may already be gone */
  }
}

/**
 * Handles a deep link. Returns true when it was the login callback (whether it
 * succeeded or not), false for unrelated URLs.
 */
export async function handleAuthCallbackUrl(rawUrl: string): Promise<boolean> {
  const result = parseAuthCallbackUrl(rawUrl)
  if (!result) return false
  if (pending) pending.callbackReceived = true

  if (result.type === 'error') {
    await closeBrowser()
    if (pending) settle(new Error(result.message))
    else console.warn('[BHAO] Google sign-in failed:', result.message)
    return true
  }

  if (handledCodes.has(result.code)) return true
  handledCodes.add(result.code)
  await closeBrowser()

  const { error } = await supabase.auth.exchangeCodeForSession(result.code)
  if (error) {
    if (pending) settle(error)
    else console.warn('[BHAO] Google sign-in failed:', error.message)
    return true
  }
  settle('signed-in')
  onSignedInCallback?.()
  return true
}

/**
 * Registers the deep-link and app-state listeners once for the app's lifetime
 * and processes a cold-start launch URL. `onSignedIn` runs after a successful
 * native sign-in (the latest registered callback wins). No-op in browsers.
 * Returns a function that unregisters `onSignedIn` (listeners stay attached).
 */
export function initNativeAuth(onSignedIn: () => void): () => void {
  if (!isNativeApp() || !isSupabaseConfigured) return () => undefined
  onSignedInCallback = onSignedIn
  const unregister = () => {
    if (onSignedInCallback === onSignedIn) onSignedInCallback = null
  }
  if (initialized) return unregister
  initialized = true

  void (async () => {
    try {
      const { App } = await import('@capacitor/app')

      await App.addListener('appUrlOpen', ({ url }) => {
        handleAuthCallbackUrl(url).catch(err => console.error('[BHAO] auth callback failed:', err))
      })

      // The WebView may not emit visibilitychange when the app is backgrounded,
      // so drive supabase-js token refresh from the native app state as well.
      await App.addListener('appStateChange', ({ isActive }) => {
        const action = isActive ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
        action.catch(() => undefined)
      })

      // Cold start: the app was launched (or relaunched after being killed while
      // the Custom Tab was open) by the callback link itself.
      const launch = await App.getLaunchUrl()
      if (launch?.url) await handleAuthCallbackUrl(launch.url)
    } catch (err) {
      console.error('[BHAO] native auth init failed:', err)
    }
  })()

  return unregister
}

/**
 * Starts Google sign-in in a Custom Tab. Resolves 'signed-in' once the session
 * is stored, 'cancelled' when the user closes the tab without finishing, and
 * rejects with the provider/Supabase error otherwise.
 */
export async function startNativeGoogleSignIn(): Promise<NativeSignInOutcome> {
  // A previous attempt that never came back is abandoned.
  settle('cancelled')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true },
  })
  if (error) throw error
  if (!data?.url) throw new Error('Google sign-in is not available right now.')

  const { Browser } = await import('@capacitor/browser')

  const outcome = new Promise<NativeSignInOutcome>((resolve, reject) => {
    pending = { resolve, reject, callbackReceived: false, cancelTimer: null, browserListener: null }
  })
  const attempt = pending as PendingSignIn | null

  try {
    const handle = await Browser.addListener('browserFinished', () => {
      if (!attempt || pending !== attempt || attempt.callbackReceived) return
      if (attempt.cancelTimer) clearTimeout(attempt.cancelTimer)
      attempt.cancelTimer = setTimeout(() => {
        if (pending === attempt && !attempt.callbackReceived) settle('cancelled')
      }, CANCEL_GRACE_MS)
    })
    if (attempt && pending === attempt) attempt.browserListener = handle
    else await handle.remove()

    await Browser.open({ url: data.url, windowName: '_self' })
  } catch (err) {
    settle(err instanceof Error ? err : new Error('Could not open Google sign-in.'))
  }

  return outcome
}
