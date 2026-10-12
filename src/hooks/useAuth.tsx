import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getProfile, signIn, signOut, signUp, signInWithGoogle, deleteOwnAccount } from '../lib/auth'
import type { Profile } from '../types/database'

/**
 * Local-only identity for players who have not signed in. Guests can play
 * offline modes (bots, campaign, tutorial). Nothing about a guest is sent to
 * the server. Deliberately NOT a `Profile`: `profile` stays null for guests so
 * pages that write to Supabase (coins, results) skip those calls.
 */
export interface GuestProfile {
  isGuest: true
  id: string
  username: string
  avatar_url: string | null
  created_at: string
}

const GUEST_STORAGE_KEY = 'bhao_guest_profile'

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

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  /** Guest identity when playing without an account (null when signed in). */
  guestProfile: GuestProfile | null
  /** True when the player is using guest mode and is not signed in. */
  isGuest: boolean
  /** False when Supabase env vars are missing; online features are unavailable. */
  isOnlineAvailable: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  playAsGuest: (name?: string) => GuestProfile
  exitGuest: () => void
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: isSupabaseConfigured })
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(() => loadGuest())

  const loadProfile = useCallback(async (user: User) => {
    let profile: Profile | null = null
    try {
      profile = await getProfile(user.id)

      // Auto-create missing profile (e.g. if signup failed halfway or email confirmations were required)
      if (!profile) {
        const baseName = user.email?.split('@')[0] || 'player'
        const username = `${baseName}${Math.floor(Math.random() * 10000)}`

        await supabase.from('profiles').insert({ id: user.id, username })
        await supabase.from('leaderboard').insert({ user_id: user.id, username })

        profile = await getProfile(user.id)
      }
    } catch (e) {
      console.error('Failed to load or auto-create profile:', e)
    } finally {
      setState(s => ({ ...s, user, profile, loading: false }))
    }
  }, [])

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
            setState({ user: null, profile: null, loading: false })
          }
        } catch (e) {
          console.error('onAuthStateChange callback error:', e)
          setState(s => ({ ...s, loading: false }))
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  // A real account always wins over guest mode.
  // TODO: offer to merge guest campaign progress into the account on first sign-in.
  useEffect(() => {
    if (state.user && guestProfile) {
      setGuestProfile(null)
      saveGuest(null)
    }
  }, [state.user, guestProfile])

  const login = async (email: string, password: string) => {
    await signIn(email, password)
  }

  const loginWithGoogle = async () => {
    await signInWithGoogle()
  }

  const register = async (email: string, password: string, username: string) => {
    await signUp(email, password, username)
  }

  const logout = async () => {
    if (!state.user) {
      // Guest "sign out" just ends guest mode.
      setGuestProfile(null)
      saveGuest(null)
      return
    }
    await signOut()
  }

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await getProfile(state.user.id)
      setState(s => ({ ...s, profile }))
    }
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
    setState({ user: null, profile: null, loading: false })
  }

  const isGuest = !state.user && guestProfile !== null

  return (
    <AuthContext.Provider value={{
      ...state,
      guestProfile: state.user ? null : guestProfile,
      isGuest,
      isOnlineAvailable: isSupabaseConfigured,
      login, loginWithGoogle, register, logout, refreshProfile,
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
