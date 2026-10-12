import { describe, expect, it } from 'vitest'
import {
  RP_TABLE, MIN_PLAYERS, MAX_PLAYERS, calculateRankRP, isCompetitiveMode,
  MATCH_REWARDS, DAILY_REWARDS, dailyRewardForStreak, WIN_STREAK_MAX_MULTIPLIER,
} from '../rankRules'

describe('RP_TABLE', () => {
  it('has one row per lobby size with one entry per placement', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      expect(RP_TABLE[n]).toHaveLength(n)
    }
  })

  it('is strictly decreasing by placement within a lobby', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      const row = RP_TABLE[n]
      for (let p = 1; p < n; p++) expect(row[p]).toBeLessThan(row[p - 1])
    }
  })

  it('gives more RP for 1st place in bigger lobbies', () => {
    for (let n = MIN_PLAYERS + 1; n <= MAX_PLAYERS; n++) {
      expect(RP_TABLE[n][0]).toBeGreaterThan(RP_TABLE[n - 1][0])
    }
  })

  it('costs less RP for last place in bigger lobbies', () => {
    for (let n = MIN_PLAYERS + 1; n <= MAX_PLAYERS; n++) {
      expect(RP_TABLE[n][n - 1]).toBeLessThan(0)
      expect(Math.abs(RP_TABLE[n][n - 1])).toBeLessThan(Math.abs(RP_TABLE[n - 1][n - 2]))
    }
  })

  it('always rewards 1st place and always penalises last place', () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      expect(RP_TABLE[n][0]).toBeGreaterThan(0)
      expect(RP_TABLE[n][n - 1]).toBeLessThan(0)
    }
  })
})

describe('calculateRankRP', () => {
  it('returns the table value without a streak', () => {
    expect(calculateRankRP(1, 4, 0)).toBe(80)
    expect(calculateRankRP(2, 4, 0)).toBe(20)
    expect(calculateRankRP(4, 4, 0)).toBe(-20)
    expect(calculateRankRP(2, 2, 0)).toBe(-25)
    expect(calculateRankRP(6, 6, 0)).toBe(-15)
  })

  it('applies the win streak bonus to 1st place only, capped at x2', () => {
    expect(calculateRankRP(1, 2, 1)).toBe(36)
    expect(calculateRankRP(1, 4, 3)).toBe(128)
    expect(calculateRankRP(1, 4, 5)).toBe(80 * WIN_STREAK_MAX_MULTIPLIER)
    expect(calculateRankRP(1, 4, 50)).toBe(80 * WIN_STREAK_MAX_MULTIPLIER)
    expect(calculateRankRP(2, 4, 5)).toBe(20)
    expect(calculateRankRP(4, 4, 5)).toBe(-20)
  })

  it('returns 0 for invalid input', () => {
    expect(calculateRankRP(0, 4, 0)).toBe(0)
    expect(calculateRankRP(5, 4, 0)).toBe(0)
    expect(calculateRankRP(1, 1, 0)).toBe(0)
    expect(calculateRankRP(1, 7, 0)).toBe(0)
    expect(calculateRankRP(1.5, 4, 0)).toBe(0)
  })

  it('treats a negative streak as no streak', () => {
    expect(calculateRankRP(1, 3, -4)).toBe(50)
  })
})

describe('modes and rewards', () => {
  it('only ranked and multiplayer are competitive', () => {
    expect(isCompetitiveMode('ranked')).toBe(true)
    expect(isCompetitiveMode('multiplayer')).toBe(true)
    expect(isCompetitiveMode('practice')).toBe(false)
    expect(isCompetitiveMode('campaign')).toBe(false)
  })

  it('casual games pay less than competitive ones', () => {
    expect(MATCH_REWARDS.casual.coinsWin).toBeLessThan(MATCH_REWARDS.competitive.coinsWin)
    expect(MATCH_REWARDS.casual.xpWin).toBeLessThan(MATCH_REWARDS.competitive.xpWin)
  })
})

describe('daily rewards', () => {
  it('follows the 7-day table and repeats the last day', () => {
    expect(DAILY_REWARDS).toEqual([10, 20, 30, 50, 100, 200, 500])
    expect(dailyRewardForStreak(1)).toBe(10)
    expect(dailyRewardForStreak(7)).toBe(500)
    expect(dailyRewardForStreak(30)).toBe(500)
    expect(dailyRewardForStreak(0)).toBe(10)
  })
})
