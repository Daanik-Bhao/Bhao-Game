import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '').trim()
const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '').trim()

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * True when both Supabase env vars are present. When false the app still boots:
 * online features (login, multiplayer, leaderboard, economy) are disabled and
 * guests can play offline against bots.
 */
export const isSupabaseConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 0

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[BHAO] Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing). ' +
    'Online features are disabled; guest mode still works. See .env.example.'
  )
}

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  'Online features are not available right now. You can still play as a guest.'

/**
 * Auth options for a configured client.
 *
 * Browsers keep supabase-js defaults (implicit flow, session detected from the
 * redirect URL) so the web Google sign-in and email links behave exactly as before.
 *
 * The Capacitor app uses the PKCE flow: Google sign-in returns to the app through
 * the com.daanik.bhao://login-callback deep link carrying a one-time `code`, which
 * src/lib/nativeAuth.ts exchanges with exchangeCodeForSession(). The WebView URL
 * (https://localhost/...) never carries auth params, so URL detection is off.
 * Sessions persist in the WebView's localStorage (kept across app restarts) and
 * tokens auto-refresh; nativeAuth.ts also pauses/resumes refresh on app state.
 */
const nativeAuthOptions: SupabaseClientOptions<'public'>['auth'] | undefined = Capacitor.isNativePlatform()
  ? { flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true }
  : undefined

// createClient() throws synchronously on an empty URL, which used to white-screen the
// app at import time. Fall back to an inert placeholder so imports never throw; every
// network call against it fails with a normal (handled) error instead. Sessions are not
// persisted or refreshed for the placeholder client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(
  isSupabaseConfigured ? supabaseUrl : 'https://not-configured.invalid',
  isSupabaseConfigured ? supabaseAnonKey : 'not-configured',
  isSupabaseConfigured
    ? (nativeAuthOptions ? { auth: nativeAuthOptions } : undefined)
    : { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
)
