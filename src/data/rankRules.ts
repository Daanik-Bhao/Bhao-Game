/**
 * Single source of truth for ranked points (RP) and match/daily economy numbers.
 *
 * The server applies the same numbers in SQL (supabase/migrations/
 * 20261013000300_matches_and_results.sql: `rank_rp_change`, `apply_match_result`,
 * `daily_reward_amount`). `npm run check:migrations` compares the SQL functions
 * with this module, so change both together.
 *
 * Pure module: no browser or Supabase imports.
 */

/**
 * Base RP by lobby size (2..6 players) and finishing place (index 0 = 1st).
 * More players => more RP for top placements; losses cost less in bigger lobbies.
 */
export const RP_TABLE: Readonly<Record<number, readonly number[]>> = {
  2: [30, -25],
  3: [50, 0, -22],
  4: [80, 20, -8, -20],
  5: [100, 35, 5, -10, -18],
  6: [120, 50, 15, 0, -8, -15],
}

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6

/** Win streak bonus applied to a 1st place only: +20% per prior consecutive win, capped at x2. */
export const WIN_STREAK_STEP = 0.2
export const WIN_STREAK_MAX_MULTIPLIER = 2

/**
 * RP change for one result. `winStreak` is the streak *before* this game.
 * Returns 0 for invalid input (unknown lobby size, placement out of range).
 */
export function calculateRankRP(placement: number, totalPlayers: number, winStreak: number): number {
  const row = RP_TABLE[totalPlayers]
  if (!row || !Number.isInteger(placement) || placement < 1 || placement > row.length) return 0
  const base = row[placement - 1]
  const streak = Math.max(0, Math.floor(winStreak || 0))
  const multiplier = placement === 1 ? Math.min(1 + streak * WIN_STREAK_STEP, WIN_STREAK_MAX_MULTIPLIER) : 1
  return Math.round(base * multiplier)
}

/** Modes a finished game can be recorded under. */
export type MatchMode = 'ranked' | 'practice' | 'campaign' | 'multiplayer'

/** Modes that move RP, win streak and the public leaderboard. */
export function isCompetitiveMode(mode: MatchMode): boolean {
  return mode === 'ranked' || mode === 'multiplayer'
}

/** XP and coins per finished (non-forfeited) game. Forfeits earn nothing. */
export const MATCH_REWARDS: Readonly<Record<'competitive' | 'casual', { xpWin: number; xpLoss: number; coinsWin: number; coinsLoss: number; dailyCoinCap: number }>> = {
  /** ranked + multiplayer */
  competitive: { xpWin: 100, xpLoss: 25, coinsWin: 20, coinsLoss: 5, dailyCoinCap: 200 },
  /** practice + campaign: XP and capped coins, never RP */
  casual: { xpWin: 60, xpLoss: 15, coinsWin: 10, coinsLoss: 2, dailyCoinCap: 100 },
}

/** Anti-cheat limits enforced by save-game-result / apply_match_result. */
export const MATCH_LIMITS = {
  /** After this many ranked results in one (IST) day, further ranked results move no RP. */
  rankedRpResultsPerDay: 10,
  /** Results reported sooner than this after start_match are rejected (forfeits excepted). */
  minDurationSeconds: { ranked: 90, practice: 45, campaign: 45 },
  /** Open matches older than this can no longer be reported. */
  maxDurationHours: 6,
  /** Max starts per user per hour. */
  maxStartsPerHour: 60,
} as const

/** Daily login reward by streak day (day 8+ repeats the last value). */
export const DAILY_REWARDS: readonly number[] = [10, 20, 30, 50, 100, 200, 500]

export function dailyRewardForStreak(streakDay: number): number {
  const day = Math.min(Math.max(Math.floor(streakDay || 1), 1), DAILY_REWARDS.length)
  return DAILY_REWARDS[day - 1]
}

/** Coins spent on an extra card in practice/campaign (never available in ranked). */
export const EXTRA_CARD_COST = 25
