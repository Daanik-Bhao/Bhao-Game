import { supabase, isSupabaseConfigured, SUPABASE_NOT_CONFIGURED_MESSAGE } from './supabase'
import type { Profile, DailyRewardResult, MatchResultSummary } from '../types/database'

function requireSupabase(): void {
  if (!isSupabaseConfigured) throw new Error(SUPABASE_NOT_CONFIGURED_MESSAGE)
}

export async function signUp(email: string, password: string, username: string): Promise<void> {
  requireSupabase()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('No user returned')

  // Only id/username are taken from the client: a database trigger forces every
  // economy column to its default and creates the leaderboard row.
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: data.user.id, username })

  if (profileError) throw profileError
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

/**
 * Edits the signed-in user's profile via the `update_my_profile` RPC (direct
 * UPDATEs on `profiles` are not allowed). Omitted fields are kept. Changing the
 * username also renames the leaderboard entry.
 */
export async function updateMyProfile(updates: { username?: string; avatarUrl?: string }): Promise<void> {
  requireSupabase()
  const { error } = await supabase.rpc('update_my_profile', {
    p_username: updates.username ?? null,
    p_avatar_url: updates.avatarUrl ?? null,
  })
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

/** Single-player modes that can be started with `start_match`. */
export type SinglePlayerMode = 'ranked' | 'practice' | 'campaign'

/**
 * Opens a server-side match for a signed-in single-player game and returns its id.
 * Starting a new match closes the previous open one of the same mode (an open
 * ranked match counts as a forfeit). Guests never call this.
 */
export async function startMatch(mode: SinglePlayerMode, levelId: string | null, totalPlayers: number): Promise<string> {
  requireSupabase()
  const { data, error } = await supabase.rpc('start_match', {
    p_mode: mode,
    p_level_id: levelId,
    p_total_players: totalPlayers,
  })
  if (error) throw error
  return data as string
}

export interface MatchResultInput {
  matchId: string
  won: boolean
  placement: number
  totalPlayers: number
  finalWealth: number
  /** A forfeit is always recorded as a loss in last place. */
  forfeit?: boolean
  stats?: GameStats
}

/**
 * Reports the end of a match started with `startMatch` to the `save-game-result`
 * edge function, which validates it and applies RP/XP/coins server-side.
 */
export async function saveMatchResult(input: MatchResultInput): Promise<MatchResultSummary | null> {
  requireSupabase()
  const { data, error } = await supabase.functions.invoke('save-game-result', {
    body: {
      matchId: input.matchId,
      won: input.won,
      placement: input.placement,
      totalPlayers: input.totalPlayers,
      finalWealth: input.finalWealth,
      forfeit: input.forfeit === true,
      stats: input.stats ?? { investChoices: 0, emiDamageTaken: false },
    },
  })
  if (error) {
    console.error('Failed to save game result:', error)
    throw error
  }
  return (data as { result?: MatchResultSummary } | null)?.result ?? null
}

/** Atomically spends coins on a practice/campaign extra (never in ranked). Returns the new balance. */
export async function spendCoins(amount: number, reason: 'extra_card'): Promise<number> {
  requireSupabase()
  const { data, error } = await supabase.rpc('spend_coins', { p_amount: amount, p_reason: reason })
  if (error) throw error
  return data as number
}

/** Claims today's login reward (server date, Asia/Kolkata). */
export async function claimDailyReward(): Promise<DailyRewardResult> {
  requireSupabase()
  const { data, error } = await supabase.rpc('claim_daily_reward')
  if (error) throw error
  return data as DailyRewardResult
}
