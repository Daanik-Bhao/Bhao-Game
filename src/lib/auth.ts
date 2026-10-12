import { supabase } from './supabase'
import type { Profile } from '../types/database'

export async function signUp(email: string, password: string, username: string): Promise<void> {
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
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard'
    }
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
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
