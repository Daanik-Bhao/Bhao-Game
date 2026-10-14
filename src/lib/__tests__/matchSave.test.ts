// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MATCH_SAVE_MAX_AGE_MS, MATCH_SAVE_SCHEMA, clearMatch, loadMatch, matchOwnerKey, matchSaveKey, restoredGameState,
  storeMatch, type SavedMatch,
} from '../matchSave'
import { initGame } from '../gameEngine'

const OWNER = 'guest:g-1'

function makeSave(over: Partial<SavedMatch> = {}): SavedMatch {
  const gs = initGame({ id: 'human', name: 'Me' }, 2)
  return {
    schema: MATCH_SAVE_SCHEMA,
    savedAt: Date.now(),
    owner: OWNER,
    mode: 'practice',
    levelId: null,
    route: '/game?mode=practice',
    botCount: 2,
    uiPhase: 'playing',
    popupQueue: [],
    matchId: null,
    turnElapsedMs: 12_000,
    matchElapsedMs: 90_000,
    summary: { round: 2, maxRounds: 10, netWorth: 250000 },
    gameState: gs,
    ...over,
  }
}

beforeEach(() => localStorage.clear())

describe('matchSave', () => {
  it('keys the slot per profile', () => {
    expect(matchOwnerKey('u1', 'g1')).toBe('user:u1')
    expect(matchOwnerKey(null, 'g1')).toBe('guest:g1')
    expect(matchOwnerKey(undefined, undefined)).toBeNull()
    expect(matchSaveKey('user:u1')).toBe('bhao.match.v2:user:u1')
  })

  it('round-trips a save through localStorage', () => {
    const save = makeSave()
    storeMatch(save)
    const back = loadMatch(OWNER)
    expect(back).not.toBeNull()
    expect(back!.gameState.players[0].hand).toEqual(save.gameState.players[0].hand)
    expect(back!.route).toBe('/game?mode=practice')
  })

  it('one profile never sees another profile\'s save', () => {
    storeMatch(makeSave())
    expect(loadMatch('user:someone-else')).toBeNull()
    expect(loadMatch(null)).toBeNull()
    // A save copied into another slot is rejected (owner field mismatch).
    localStorage.setItem(matchSaveKey('user:x'), localStorage.getItem(matchSaveKey(OWNER))!)
    expect(loadMatch('user:x')).toBeNull()
  })

  it('discards saves older than 7 days', () => {
    storeMatch(makeSave({ savedAt: Date.now() - MATCH_SAVE_MAX_AGE_MS - 1000 }))
    expect(loadMatch(OWNER)).toBeNull()
    expect(localStorage.getItem(matchSaveKey(OWNER))).toBeNull()
    storeMatch(makeSave({ savedAt: Date.now() - MATCH_SAVE_MAX_AGE_MS + 60_000 }))
    expect(loadMatch(OWNER)).not.toBeNull()
  })

  it('discards a schema mismatch', () => {
    storeMatch({ ...makeSave(), schema: 1 as unknown as typeof MATCH_SAVE_SCHEMA })
    expect(loadMatch(OWNER)).toBeNull()
  })

  it('never throws on corrupt or wrongly shaped data', () => {
    const key = matchSaveKey(OWNER)
    const bad: unknown[] = [
      'not json{', 'null', '42', '[]', '{}',
      JSON.stringify({ ...makeSave(), gameState: null }),
      JSON.stringify({ ...makeSave(), gameState: { ...makeSave().gameState, players: 'x' } }),
      JSON.stringify({ ...makeSave(), gameState: { ...makeSave().gameState, currentPlayerIndex: 9 } }),
      JSON.stringify({ ...makeSave(), gameState: { ...makeSave().gameState, phase: 'game_over' } }),
      JSON.stringify({ ...makeSave(), mode: 'multiplayer' }),
      JSON.stringify({ ...makeSave(), mode: 'campaign', levelId: null }),
      JSON.stringify({ ...makeSave(), route: 'https://evil.example' }),
      JSON.stringify({ ...makeSave(), turnElapsedMs: 'soon' }),
      JSON.stringify({ ...makeSave(), summary: undefined }),
    ]
    for (const raw of bad) {
      localStorage.setItem(key, raw as string)
      expect(() => loadMatch(OWNER)).not.toThrow()
      localStorage.setItem(key, raw as string)
      expect(loadMatch(OWNER)).toBeNull()
      expect(localStorage.getItem(key)).toBeNull()
    }
  })

  it('restores exactly the time that was left', () => {
    const now = 5_000_000
    const gs = restoredGameState(makeSave(), now)
    expect(now - gs.turnStartTime).toBe(12_000)
    expect(now - gs.startTime).toBe(90_000)
  })

  it('clearMatch removes only that profile\'s slot', () => {
    storeMatch(makeSave())
    storeMatch(makeSave({ owner: 'user:u2' }))
    clearMatch(OWNER)
    expect(loadMatch(OWNER)).toBeNull()
    expect(loadMatch('user:u2')).not.toBeNull()
  })
})
