import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { signIn, signOut, signUp, signInWithGoogle, deleteOwnAccount, createMyProfile, setMyAgeBand, updateMyProfile } from '../lib/auth'
import { initNativeAuth, type NativeSignInOutcome } from '../lib/nativeAuth'
import {
  blockUnderAge, clearPendingSignup, clearPendingUsername, getAccountAgeBand, rememberAccountAgeBand,
  takePendingSignup, takePendingUsername,
} from '../lib/ageGate'
import { applyChildSafeTelemetry } from '../lib/telemetry'
import type { AccountAgeBand, AgeBand } from '../lib/ageBand'
import type { ConsentStatus } from '../config/consent'
import type { Profile } from '../types/database'

/**
 * Local-only identity for players who have not signed in. Guests can play
 * offline modes (bots, campaign, tutorial). Nothing about a guest is sent to
 * the server. Deliberately NOT a `Profile`: `profile` stays null for guests so
 * pages that write to Supabase (coins, results) skip those calls.
 *
 * A 13–17 account that is still waiting for a parent's consent also plays as a guest
 * (see `pendingConsent` below): same local-only storage, so nothing reaches the server.
 */
export interface GuestProfile {
  isGuest: true
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

const GUEST_STORAGE_KEY = 'bhao_guest_profile'

/** While a 13–17 account waits for its parent, the app re-checks the consent this often. */
const CONSENT_POLL_MS = 60_000

function loadGuest(): GuestProfile | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GuestProfile>
    if (parsed && parsed.isGuest === true && typeof parsed.id === 'string' && typeof parsed.username === 'string') {
      return {
        isGuest: true,
        id: parsed.id,
        username: parsed.username,
        avatar_url: typeof parsed.avatar_url === 'string' ? parsed.avatar_url : null,
        created_at: typeof parsed.created_at === 'string' ? parsed.created_at : new Date().toISOString(),
      }
    }
  } catch {
    /* corrupted or unavailable storage: treat as no guest */
  }
  return null
}

function saveGuest(guest: GuestProfile | null) {
  try {
    if (guest) localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest))
    else localStorage.removeItem(GUEST_STORAGE_KEY)
  } catch {
    /* storage unavailable (e.g. private mode): guest lives for this session only */
  }
}

function createGuest(name?: string): GuestProfile {
  const suffix = Math.floor(1000 + Math.random() * 9000)
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return {
    isGuest: true,
    id: `guest-${random}`,
    username: name?.trim() || `Guest${suffix}`,
    avatar_url: null,
    created_at: new Date().toISOString(),
  }
}

/** Username for a profile created without a typed one (Google sign-in). Usernames are 3–32 chars. */
function defaultUsername(user: User): string {
  const baseName = (user.email?.split('@')[0] || 'player').slice(0, 24)
  return `${baseName}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
}

interface AuthState {
  /** The real Supabase session user (also while the age question / consent is pending). */
  user: User | null
  profile: Profile | null
  loading: boolean
  /** Signed in, but the account has no profile yet (first Google sign-in): the age question comes first. */
  profileMissing: boolean
  /** The profile could not be loaded (offline / server error). */
  profileError: boolean
}

export type AgeAnswerOutcome = 'ok' | 'blocked'

interface AuthContextValue {
  /**
   * The signed-in user for everything online. Null for guests AND for an account that may
   * not use online features yet (age not answered, or waiting for a parent's consent).
   */
  user: User | null
  /** Same rule as `user`: null unless the account may use online features. */
  profile: Profile | null
  /** The real session user, whatever its consent state (sign out, delete, consent screens). */
  authUser: User | null
  loading: boolean
  /** Guest identity when playing without an (active) account. */
  guestProfile: GuestProfile | null
  /** True when the player is playing locally as a guest (incl. an account waiting for consent). */
  isGuest: boolean
  /** False when Supabase env vars are missing; online features are unavailable. */
  isOnlineAvailable: boolean
  /** Server consent state of the signed-in account (null when signed out). */
  consentStatus: ConsentStatus | null
  /** Signed in, but the age question has not been answered for this account yet. */
  needsAgeAnswer: boolean
  /** 13–17 account waiting for a parent's OK: local play only. */
  pendingConsent: boolean
  /** 13–17 account (pending or approved): child-safe limits apply. */
  isMinor: boolean
  login: (email: string, password: string) => Promise<void>
  /**
   * Web: redirects to Google (resolves before the page unloads).
   * Android app: resolves 'signed-in' or 'cancelled' when the Custom Tab flow ends.
   */
  loginWithGoogle: () => Promise<NativeSignInOutcome | void>
  register: (email: string, password: string, username: string, band: AccountAgeBand) => Promise<void>
  /** Answer the age question for the signed-in account (once). Under 13 deletes it and signs out. */
  submitAccountAge: (band: AgeBand) => Promise<AgeAnswerOutcome>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  playAsGuest: (name?: string) => GuestProfile
  exitGuest: () => void
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SIGNED_OUT: AuthState = { user: null, profile: null, loading: false, profileMissing: false, profileError: false }

async function fetchProfile(userId: string): Promise<{ profile: Profile | null; failed: boolean }> {
  if (!isSupabaseConfigured) return { profile: null, failed: true }
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) return { profile: null, failed: true }
    return { profile: (data as Profile | null) ?? null, failed: false }
  } catch {
    return { profile: null, failed: true }
  }
}

/** Consent state of a signed-in account from what we could load. */
export function deriveConsentStatus(s: Pick<AuthState, 'user' | 'profile' | 'profileMissing' | 'profileError'>, cachedBand: AccountAgeBand | null): ConsentStatus | null {
  if (!s.user) return null
  if (s.profile) return s.profile.consent_status ?? 'unknown'
  if (s.profileMissing) return 'unknown'
  // Profile could not be loaded (offline): fall back to the band remembered on this device.
  // A 13–17 account then plays locally; anything else keeps the old behaviour (the server
  // still enforces the consent rules on every write).
  return cachedBand === '13to17' ? 'pending_consent' : 'not_required'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ ...SIGNED_OUT, loading: isSupabaseConfigured })
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(() => loadGuest())

  const applyProfile = useCallback((user: User, profile: Profile | null, failed: boolean) => {
    if (profile) {
      rememberAccountAgeBand(profile.age_band ?? null)
      applyChildSafeTelemetry()
    }
    setState({ user, profile, loading: false, profileMissing: !failed && !profile, profileError: failed })
  }, [])

  const loadProfile = useCallback(async (user: User) => {
    let { profile, failed } = await fetchProfile(user.id)
    // An email sign-up that needed confirmation: create the profile with the age band
    // answered at sign-up (stored on this device), now that there is a session.
    if (!profile && !failed) {
      const pending = takePendingSignup(user.email)
      if (pending) {
        try {
          await createMyProfile(pending.username, pending.band)
          clearPendingSignup()
          ;({ profile, failed } = await fetchProfile(user.id))
        } catch (e) {
          console.error('Failed to create the profile after sign-up:', e)
        }
      }
    }
    applyProfile(user, profile, failed)
  }, [applyProfile])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState(s => ({ ...s, loading: false }))
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        loadProfile(data.session.user)
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    }).catch(err => {
      console.error('Failed to get session:', err)
      setState(s => ({ ...s, loading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            await loadProfile(session.user)
          } else if (event === 'SIGNED_OUT') {
            setState(SIGNED_OUT)
          }
        } catch (e) {
          console.error('onAuthStateChange callback error:', e)
          setState(s => ({ ...s, loading: false }))
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const consentStatus = deriveConsentStatus(state, state.user && !state.profile ? getAccountAgeBand() : null)
  const canUseOnline = consentStatus === 'not_required' || consentStatus === 'active_minor'
  const pendingConsent = consentStatus === 'pending_consent'
  const needsAgeAnswer = !state.loading && consentStatus === 'unknown'
  const isMinor = pendingConsent || state.profile?.age_band === '13to17'
  const onlineUser = canUseOnline ? state.user : null

  // Android app only (no-op in browsers): listen for the Google sign-in deep link,
  // including a cold start launched by it, and land on /dashboard afterwards just
  // like the web redirect (redirectTo .../dashboard) does.
  // Navigation waits until the profile has loaded so /dashboard doesn't bounce to /auth.
  const navigate = useNavigate()
  const [nativeSignInDone, setNativeSignInDone] = useState(false)
  useEffect(() => initNativeAuth(() => setNativeSignInDone(true)), [])
  useEffect(() => {
    if (nativeSignInDone && state.user && !state.loading) {
      setNativeSignInDone(false)
      navigate('/dashboard', { replace: true })
    }
  }, [nativeSignInDone, state.user, state.loading, navigate])

  // A real (active) account always wins over guest mode. Guest progress itself stays on the
  // device (owner key 'guest'); <GuestMergePrompt> (rendered by App for signed-in
  // users, src/lib/guestMerge.ts) offers once per account to bring it in.
  useEffect(() => {
    if (onlineUser && guestProfile) {
      setGuestProfile(null)
      saveGuest(null)
    }
  }, [onlineUser, guestProfile])

  // Waiting for a parent: play locally as this device's guest (created if needed), so every
  // game, campaign star and library unlock stays on the device until the parent says yes.
  useEffect(() => {
    if (pendingConsent && !guestProfile) {
      const guest = createGuest()
      setGuestProfile(guest)
      saveGuest(guest)
    }
  }, [pendingConsent, guestProfile])

  const userId = state.user?.id
  const refreshProfile = useCallback(async () => {
    if (!state.user) return
    const { profile, failed } = await fetchProfile(state.user.id)
    if (failed) return
    applyProfile(state.user, profile, false)
  }, [state.user, applyProfile])

  // While waiting for consent, notice the parent's OK without a restart.
  const refreshRef = useRef(refreshProfile)
  refreshRef.current = refreshProfile
  useEffect(() => {
    if (!pendingConsent) return
    const check = () => { if (document.visibilityState === 'visible') void refreshRef.current() }
    const timer = setInterval(check, CONSENT_POLL_MS)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [pendingConsent])

  // Parent said yes: the name the child picked at sign-up (kept on this device) is applied now.
  const activeMinor = consentStatus === 'active_minor'
  useEffect(() => {
    if (!activeMinor || !userId) return
    const name = takePendingUsername(userId)
    if (!name) return
    updateMyProfile({ username: name })
      .then(() => { clearPendingUsername(userId); return refreshRef.current() })
      .catch(() => { /* name taken / offline: keep the server name; the player can rename in Profile */ clearPendingUsername(userId) })
  }, [activeMinor, userId])

  // Gyaan Library follows the account across devices: pull + union on sign-in.
  // Lazy import keeps the concept data out of the main bundle; never blocks the UI.
  const onlineUserId = onlineUser?.id
  useEffect(() => {
    if (!onlineUserId || !isSupabaseConfigured) return
    import('../lib/libraryProgress')
      .then(m => m.syncLibraryProgress(onlineUserId))
      .catch(() => { /* offline / chunk error: the next sign-in catches up */ })
  }, [onlineUserId])

  const login = async (email: string, password: string) => {
    await signIn(email, password)
  }

  const loginWithGoogle = () => signInWithGoogle()

  const register = async (email: string, password: string, username: string, band: AccountAgeBand) => {
    await signUp(email, password, username, band)
  }

  const submitAccountAge = async (band: AgeBand): Promise<AgeAnswerOutcome> => {
    const user = state.user
    if (!user) return 'ok'
    if (band === 'under13') {
      // No account for under-13s: the server deletes it (incl. a Google sign-in that has no
      // profile yet). Even if that call fails, this device signs out and blocks a retry.
      try { await setMyAgeBand('under13') } catch (e) { console.error('Failed to close the under-13 account:', e) }
      blockUnderAge()
      rememberAccountAgeBand(null)
      await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
      setState(SIGNED_OUT)
      return 'blocked'
    }
    if (state.profileMissing) await createMyProfile(defaultUsername(user), band)
    else await setMyAgeBand(band)
    rememberAccountAgeBand(band)
    applyChildSafeTelemetry()
    await loadProfile(user)
    return 'ok'
  }

  const logout = async () => {
    if (!state.user) {
      // Guest "sign out" just ends guest mode.
      setGuestProfile(null)
      saveGuest(null)
      return
    }
    await signOut()
    rememberAccountAgeBand(null)
  }

  const playAsGuest = (name?: string) => {
    const guest = guestProfile ?? createGuest(name)
    setGuestProfile(guest)
    saveGuest(guest)
    return guest
  }

  const exitGuest = () => {
    setGuestProfile(null)
    saveGuest(null)
  }

  const deleteAccount = async () => {
    await deleteOwnAccount()
    rememberAccountAgeBand(null)
    setState(SIGNED_OUT)
  }

  const isGuest = !onlineUser && !needsAgeAnswer && guestProfile !== null

  return (
    <AuthContext.Provider value={{
      user: onlineUser,
      profile: canUseOnline ? state.profile : null,
      authUser: state.user,
      loading: state.loading,
      guestProfile: onlineUser ? null : guestProfile,
      isGuest,
      isOnlineAvailable: isSupabaseConfigured,
      consentStatus,
      needsAgeAnswer,
      pendingConsent,
      isMinor,
      login, loginWithGoogle, register, submitAccountAge, logout, refreshProfile,
      playAsGuest, exitGuest, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
