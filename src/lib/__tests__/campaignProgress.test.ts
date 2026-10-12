import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  bestOf, getCompletedLevels, getCurrentLevelId, getLevelResults, getLevelStars, isLevelUnlocked,
  markLevelCompleted, mergeLevelResults, progressOwnerKey, recordLevelResult, rowsToResults,
  syncCampaignProgress, totalStars, STARS_TO_UNLOCK_NEXT,
} from '../campaignProgress'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
    clear: () => map.clear(),
  }
}

const IDS = ['level_1', 'level_2', 'level_3', 'level_4']

describe('campaignProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
  })

  it('keeps the legacy API working', () => {
    expect(progressOwnerKey(null)).toBe('guest')
    expect(progressOwnerKey('abc')).toBe('user:abc')
    markLevelCompleted('guest', 'level_1')
    markLevelCompleted('guest', 'level_1')
    expect(getCompletedLevels('guest')).toEqual(['level_1'])
    expect(getCurrentLevelId(IDS, ['level_1'])).toBe('level_2')
    expect(getCurrentLevelId(IDS, IDS)).toBeNull()
  })

  it('records results keeping the best stars and net worth', () => {
    const t1 = new Date('2026-10-01T00:00:00Z')
    recordLevelResult('guest', 'level_1', 2, 1600000, t1)
    recordLevelResult('guest', 'level_1', 1, 1900000, new Date('2026-10-05T00:00:00Z'))
    recordLevelResult('guest', 'level_1', 0, 300000)
    const r = getLevelResults('guest').level_1
    expect(r).toEqual({ stars: 2, bestNetWorth: 1900000, completedAt: t1.toISOString() })
    expect(getCompletedLevels('guest')).toContain('level_1')
  })

  it('a lost level (0★) is remembered but not completed', () => {
    recordLevelResult('guest', 'level_1', 0, 800000)
    expect(getLevelResults('guest').level_1.stars).toBe(0)
    expect(getLevelResults('guest').level_1.completedAt).toBeNull()
    expect(getCompletedLevels('guest')).toEqual([])
  })

  it('clamps bad input and ignores corrupt storage', () => {
    recordLevelResult('guest', 'level_1', 7, -50)
    expect(getLevelResults('guest').level_1).toMatchObject({ stars: 3, bestNetWorth: 0 })
    localStorage.setItem('bhao_campaign_results:guest', '{not json')
    expect(getLevelResults('guest')).toEqual({})
    localStorage.setItem('bhao_campaign_results:guest', JSON.stringify([1, 2]))
    expect(getLevelResults('guest')).toEqual({})
  })

  it('stars per level: legacy completions count as 1★', () => {
    markLevelCompleted('guest', 'level_1')
    recordLevelResult('guest', 'level_2', 3, 3500000)
    expect(getLevelStars('guest')).toEqual({ level_1: 1, level_2: 3 })
    expect(totalStars(IDS, getLevelStars('guest'))).toBe(4)
  })

  it('unlocks the next level with enough stars on the previous one', () => {
    expect(STARS_TO_UNLOCK_NEXT).toBe(1)
    expect(isLevelUnlocked(IDS, 'level_1', {})).toBe(true)
    expect(isLevelUnlocked(IDS, 'level_2', {})).toBe(false)
    expect(isLevelUnlocked(IDS, 'level_2', { level_1: 0 })).toBe(false)
    expect(isLevelUnlocked(IDS, 'level_2', { level_1: 1 })).toBe(true)
    expect(isLevelUnlocked(IDS, 'level_3', { level_1: 3 })).toBe(false)
    expect(isLevelUnlocked(IDS, 'level_9', { level_1: 3 })).toBe(false)
  })

  it('merges result maps level by level, keeping the best of each field', () => {
    const a = { level_1: { stars: 3, bestNetWorth: 100, completedAt: '2026-10-02T00:00:00.000Z' }, level_2: { stars: 1, bestNetWorth: 900, completedAt: null } }
    const b = { level_1: { stars: 1, bestNetWorth: 500, completedAt: '2026-10-01T00:00:00.000Z' }, level_3: { stars: 2, bestNetWorth: 7, completedAt: null } }
    const m = mergeLevelResults(a, b)
    expect(m.level_1).toEqual({ stars: 3, bestNetWorth: 500, completedAt: '2026-10-01T00:00:00.000Z' })
    expect(m.level_2).toEqual(a.level_2)
    expect(m.level_3).toEqual(b.level_3)
    expect(mergeLevelResults(b, a)).toEqual(m)
    expect(bestOf(undefined, undefined)).toEqual({ stars: 0, bestNetWorth: 0, completedAt: null })
  })

  it('reads server rows (bigint as string, duplicates keep the best)', () => {
    const r = rowsToResults([
      { level_id: 'level_1', stars: 2, best_net_worth: '1500000', completed_at: '2026-10-01T00:00:00Z' },
      { level_id: 'level_1', stars: 3, best_net_worth: 10, completed_at: null },
    ])
    expect(r.level_1).toEqual({ stars: 3, bestNetWorth: 1500000, completedAt: '2026-10-01T00:00:00Z' })
    expect(rowsToResults(null)).toEqual({})
  })

  it('sync is a no-op without Supabase or a user', async () => {
    recordLevelResult('user:abc', 'level_1', 2, 1000)
    await expect(syncCampaignProgress(null)).resolves.toBeNull()
    await expect(syncCampaignProgress('abc')).resolves.toBeNull()
    expect(getLevelResults('user:abc').level_1.stars).toBe(2)
  })
})
