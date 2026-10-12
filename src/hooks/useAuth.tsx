import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getProfile, signIn, signOut, signUp, signInWithGoogle } from '../lib/auth'
import type { Profile } from '../types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })

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
    await signOut()
  }

  const refreshProfile = async () => {
    if (state.user) {
      const profile = await getProfile(state.user.id)
      setState(s => ({ ...s, profile }))
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
