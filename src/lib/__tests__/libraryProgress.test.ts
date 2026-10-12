import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getUnlockedConcepts, unlockConcepts, getUnseenCount, getUnseenConcepts, markSeen } from '../libraryProgress'
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
})
