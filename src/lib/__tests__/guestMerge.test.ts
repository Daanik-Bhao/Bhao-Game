import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  acceptGuestMerge, capToUnlockChain, computeGuestMergeOffer, declineGuestMerge, getGuestMergeDecision,
  getGuestMergeOffer, guestProgressClaimedBy, levelNumber, toImportPayload, MAX_IMPORT_LEVELS,
} from '../guestMerge'
import { getLevelResults, markLevelCompleted, recordLevelResult, type LevelResults } from '../campaignProgress'
import { getUnlockedConcepts, unlockConcepts, type LibraryProgress } from '../libraryProgress'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
    clear: () => map.clear(),
  }
}

const r = (stars: number, bestNetWorth = 0): LevelResults[string] => ({ stars, bestNetWorth, completedAt: null })
const lib = (unlocked: LibraryProgress['unlocked'] = [], seen: LibraryProgress['seen'] = []): LibraryProgress => ({ unlocked, seen })

describe('guestMerge (pure)', () => {
  it('parses level numbers like the server', () => {
    expect(levelNumber('level_1')).toBe(1)
    expect(levelNumber('level_120')).toBe(120)
    expect(levelNumber('level_1000')).toBeNull()
    expect(levelNumber('Level_1')).toBeNull()
    expect(levelNumber('level_x')).toBeNull()
  })

  it('caps claims to the unlock chain, lowest level first', () => {
    // guest has L1..L2 and L4 (gap at L3) — L4 can't be imported
    const out = capToUnlockChain({}, { level_4: r(3), level_2: r(2), level_1: r(1) })
    expect(Object.keys(out)).toEqual(['level_1', 'level_2'])
    // the account's own progress counts for the chain
    expect(Object.keys(capToUnlockChain({ level_3: r(1) }, { level_4: r(2) }))).toEqual(['level_4'])
    // 0-star claims never unlock anything
    expect(capToUnlockChain({}, { level_1: r(0), level_2: r(3) })).toEqual({})
  })

  it('clamps stars and drops invalid ids', () => {
    const out = capToUnlockChain({}, { level_1: r(9), bogus: r(3) })
    expect(out).toEqual({ level_1: r(3) })
  })

  it('offers only what improves the account (best stars per level)', () => {
    const offer = computeGuestMergeOffer(
      { level_1: r(3), level_2: r(1), level_3: r(2) },
      { level_1: r(1), level_2: r(2) },
      lib(), lib(),
    )
    expect(offer).toEqual({ levels: ['level_1', 'level_3'], stars: 2 + 2, concepts: 0 })
  })

  it('offers nothing when the account already has at least as much', () => {
    expect(computeGuestMergeOffer({ level_1: r(2) }, { level_1: r(3) }, lib(['sip']), lib(['sip', 'inflation']))).toBeNull()
    expect(computeGuestMergeOffer({}, {}, lib(), lib())).toBeNull()
  })

  it('counts library concepts the account lacks (union of unlocks)', () => {
    expect(computeGuestMergeOffer({}, {}, lib(['sip', 'inflation']), lib(['sip']))).toEqual({ levels: [], stars: 0, concepts: 1 })
  })

  it('builds the RPC payload: completed levels only, sorted, capped', () => {
    expect(toImportPayload({ level_2: r(2, 500), level_1: r(1, 100), level_3: r(0, 9), x: r(3) })).toEqual([
      { level_id: 'level_1', stars: 1, net_worth: 100 },
      { level_id: 'level_2', stars: 2, net_worth: 500 },
    ])
    const many: LevelResults = Object.fromEntries(Array.from({ length: 80 }, (_, i) => [`level_${i + 1}`, r(1)]))
    expect(toImportPayload(many)).toHaveLength(MAX_IMPORT_LEVELS)
  })
})

describe('guestMerge (storage)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
  })

  it('offers guest progress (incl. legacy completions) to an account with less', () => {
    markLevelCompleted('guest', 'level_1')
    recordLevelResult('guest', 'level_2', 2, 3000000)
    expect(getGuestMergeOffer('u1')).toEqual({ levels: ['level_1', 'level_2'], stars: 3, concepts: 0 })
    expect(getGuestMergeOffer(null)).toBeNull()
  })

  it('never asks again after a decline, and only per account', () => {
    recordLevelResult('guest', 'level_1', 1, 100)
    declineGuestMerge('u1')
    expect(getGuestMergeDecision('u1')).toBe('declined')
    expect(getGuestMergeOffer('u1')).toBeNull()
    expect(getGuestMergeOffer('u2')).not.toBeNull()
  })

  it('without Supabase a campaign merge fails and remembers nothing (asked again later)', async () => {
    recordLevelResult('guest', 'level_1', 3, 100)
    await expect(acceptGuestMerge('u1')).resolves.toEqual({ status: 'failed', accepted: 0 })
    expect(getGuestMergeDecision('u1')).toBeNull()
    expect(guestProgressClaimedBy()).toBeNull()
    expect(getLevelResults('user:u1')).toEqual({})
  })

  it('library-only merge is a local union and is never offered twice (any account)', async () => {
    unlockConcepts('guest', ['sip', 'inflation'])
    unlockConcepts('user:u1', ['compounding', 'sip'])
    await expect(acceptGuestMerge('u1')).resolves.toEqual({ status: 'merged', accepted: 0 })
    expect(getUnlockedConcepts('user:u1')).toEqual(['compounding', 'sip', 'inflation'])
    expect(getUnlockedConcepts('guest')).toEqual(['sip', 'inflation']) // guest copy untouched
    expect(getGuestMergeDecision('u1')).toBe('merged')
    expect(guestProgressClaimedBy()).toBe('u1')
    expect(getGuestMergeOffer('u1')).toBeNull()
    expect(getGuestMergeOffer('u2')).toBeNull()
  })
})
