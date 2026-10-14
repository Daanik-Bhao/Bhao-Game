import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getUnlockedConcepts, unlockConcepts, getUnseenCount, getUnseenConcepts, markSeen, getLibraryProgress,
  unionLibraryProgress, mergeLibraryProgress, rowsToLibraryProgress, libraryProgressToRows, libraryNeedsPush,
  syncLibraryProgress, pushLibraryProgress, scheduleLibraryPush,
} from '../libraryProgress'
import type { ConceptId } from '../../types/learning'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v) },
    removeItem: (k: string) => { map.delete(k) },
    clear: () => map.clear(),
  }
}

describe('libraryProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
  })

  it('starts empty', () => {
    expect(getUnlockedConcepts('guest')).toEqual([])
    expect(getUnseenCount('guest')).toBe(0)
  })

  it('unlocks concepts and reports only new ones', () => {
    expect(unlockConcepts('guest', ['inflation', 'compounding'])).toEqual(['inflation', 'compounding'])
    expect(unlockConcepts('guest', ['compounding', 'sip', 'sip'])).toEqual(['sip'])
    expect(getUnlockedConcepts('guest')).toEqual(['inflation', 'compounding', 'sip'])
  })

  it('keeps owners separate', () => {
    unlockConcepts('user:a', ['gold'])
    expect(getUnlockedConcepts('user:b')).toEqual([])
    expect(getUnlockedConcepts('user:a')).toEqual(['gold'])
  })

  it('ignores unknown ids', () => {
    expect(unlockConcepts('guest', ['not_a_concept' as ConceptId, 'gold'])).toEqual(['gold'])
  })

  it('tracks unseen concepts', () => {
    unlockConcepts('guest', ['inflation', 'gold', 'sip'])
    expect(getUnseenCount('guest')).toBe(3)
    markSeen('guest', ['gold'])
    expect(getUnseenConcepts('guest')).toEqual(['inflation', 'sip'])
    markSeen('guest')
    expect(getUnseenCount('guest')).toBe(0)
  })

  it('survives broken storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
    })
    expect(getUnlockedConcepts('guest')).toEqual([])
    expect(unlockConcepts('guest', ['inflation'])).toEqual(['inflation'])
    expect(() => markSeen('guest')).not.toThrow()
  })

  it('survives corrupt data', () => {
    localStorage.setItem('bhao_library_progress:guest', '{not json')
    expect(getUnlockedConcepts('guest')).toEqual([])
    localStorage.setItem('bhao_library_progress:guest', JSON.stringify({ unlocked: 'x', seen: 5 }))
    expect(getUnlockedConcepts('guest')).toEqual([])
  })

  it('union keeps every unlock (a first, then b extras) and every seen mark', () => {
    const a = { unlocked: ['inflation', 'sip'] as ConceptId[], seen: ['sip'] as ConceptId[] }
    const b = { unlocked: ['gold', 'sip'] as ConceptId[], seen: ['gold', 'inflation'] as ConceptId[] }
    expect(unionLibraryProgress(a, b)).toEqual({ unlocked: ['inflation', 'sip', 'gold'], seen: ['inflation', 'sip', 'gold'] })
    // commutative as a set, idempotent, never loses anything
    const ba = unionLibraryProgress(b, a)
    expect(new Set(ba.unlocked)).toEqual(new Set(['inflation', 'sip', 'gold']))
    expect(unionLibraryProgress(a, a)).toEqual(a)
    expect(unionLibraryProgress(a, { unlocked: [], seen: [] })).toEqual(a)
  })

  it('union drops seen marks for concepts not unlocked and unknown ids', () => {
    const out = unionLibraryProgress(
      { unlocked: ['sip'] as ConceptId[], seen: ['gold'] as ConceptId[] },
      { unlocked: ['nope' as ConceptId], seen: [] },
    )
    expect(out).toEqual({ unlocked: ['sip'], seen: [] })
  })

  it('mergeLibraryProgress unions into storage without losing local data', () => {
    unlockConcepts('user:a', ['inflation', 'sip'])
    markSeen('user:a', ['inflation'])
    const merged = mergeLibraryProgress('user:a', { unlocked: ['gold', 'inflation'] as ConceptId[], seen: ['gold'] as ConceptId[] })
    expect(merged).toEqual({ unlocked: ['inflation', 'sip', 'gold'], seen: ['inflation', 'gold'] })
    expect(getLibraryProgress('user:a')).toEqual(merged)
    expect(getUnseenConcepts('user:a')).toEqual(['sip'])
  })

  it('maps server rows both ways', () => {
    const p = rowsToLibraryProgress([
      { concept_id: 'sip', seen: true },
      { concept_id: 'gold', seen: false },
      { concept_id: 'sip', seen: null },
      { concept_id: 'nope', seen: true },
    ])
    expect(p).toEqual({ unlocked: ['sip', 'gold'], seen: ['sip'] })
    expect(rowsToLibraryProgress(null)).toEqual({ unlocked: [], seen: [] })
    expect(libraryProgressToRows('u1', p)).toEqual([
      { user_id: 'u1', concept_id: 'sip', seen: true },
      { user_id: 'u1', concept_id: 'gold', seen: false },
    ])
  })

  it('knows when the server is missing something', () => {
    const server = { unlocked: ['sip', 'gold'] as ConceptId[], seen: ['sip'] as ConceptId[] }
    expect(libraryNeedsPush(server, server)).toBe(false)
    expect(libraryNeedsPush({ unlocked: ['sip'] as ConceptId[], seen: [] }, server)).toBe(false)
    expect(libraryNeedsPush({ unlocked: ['sip', 'gold'] as ConceptId[], seen: ['gold'] as ConceptId[] }, server)).toBe(true)
    expect(libraryNeedsPush({ unlocked: ['inflation'] as ConceptId[], seen: [] }, server)).toBe(true)
  })

  it('server sync and push are silent no-ops without Supabase', async () => {
    unlockConcepts('user:a', ['sip'])
    await expect(syncLibraryProgress('a')).resolves.toBeNull()
    await expect(syncLibraryProgress(null)).resolves.toBeNull()
    await expect(pushLibraryProgress('a')).resolves.toBe(false)
    expect(getUnlockedConcepts('user:a')).toEqual(['sip'])
  })

  it('debounces pushes for signed-in players and never schedules for guests', () => {
    vi.useFakeTimers()
    try {
      scheduleLibraryPush('guest')
      expect(vi.getTimerCount()).toBe(0)
      unlockConcepts('user:a', ['sip'])
      markSeen('user:a')
      scheduleLibraryPush('user:a')
      expect(vi.getTimerCount()).toBe(1)
    } finally {
      vi.clearAllTimers()
      vi.useRealTimers()
    }
  })
})
