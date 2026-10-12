import { supabase, isSupabaseConfigured, SUPABASE_NOT_CONFIGURED_MESSAGE } from './supabase'
import type { Profile } from '../types/database'

function requireSupabase(): void {
  if (!isSupabaseConfigured) throw new Error(SUPABASE_NOT_CONFIGURED_MESSAGE)
}

export async function signUp(email: string, password: string, username: string): Promise<void> {
  requireSupabase()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('No user returned')

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: data.user.id, username })

  if (profileError) throw profileError

  // Also create a leaderboard entry
  await supabase
    .from('leaderboard')
    .insert({ user_id: data.user.id, username })
}

export async function signIn(email: string, password: string): Promise<void> {
  requireSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signInWithGoogle(): Promise<void> {
  requireSupabase()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard'
    }
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  requireSupabase()
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

/**
 * Permanently deletes the signed-in user's account and game data via the
 * `delete_own_account` RPC (see supabase/migrations/*_delete_own_account.sql),
 * then clears the local session.
 */
export async function deleteOwnAccount(): Promise<void> {
  requireSupabase()
  const { error } = await supabase.rpc('delete_own_account')
  if (error) throw error
  // The auth user no longer exists server-side; drop the local session only.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
}

export interface GameStats {
  investChoices: number;
  emiDamageTaken: boolean;
}

export async function saveGameResult(
  _userId: string,
  username: string,
  won: boolean,
  finalWealth: number,
  placement: number = 1,
  totalPlayers: number = 2,
  winStreak: number = 0,
  stats: GameStats = { investChoices: 0, emiDamageTaken: false }
): Promise<void> {
  requireSupabase()
  // We now call the secure Edge Function instead of trusting the client to update stats directly!
  const { error } = await supabase.functions.invoke('save-game-result', {
    body: {
      username,
      won,
      finalWealth,
      placement,
      totalPlayers,
      winStreak,
      stats
    }
  })

  if (error) {
    console.error('Failed to save game result securely:', error)
    throw error
  }
}
