import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  applyPlayerAction, applyTick, buildInitialMultiplayerState, publicState, redactForPlayer, withOwnHand,
  toBoardState, changedHands, computePlacements, DISCONNECT_MS, TURN_TIME_LIMIT_MS, MP_MODES,
} from '../multiplayerAuthority'
import { setRng, seededRng } from '../economy'
import type { GameCard } from '../../types/game'
import type { MpFullState } from '../../types/multiplayer'

const SEATS = [
  { id: 'p1', name: 'Asha', avatar_url: null, rank_points: 100 },
  { id: 'p2', name: 'Bilal' },
  { id: 'p3', name: 'Chitra' },
]

const decisionCard = (id: string): GameCard => ({
  id, name: `Decision ${id}`, type: 'decision', tier: 'common', flavor: '',
  options: [
    { type: 'save', label: 'Save', description: '', effect: { type: 'wealth_pct', value: 5, target: 'self' } },
    { type: 'spend', label: 'Spend', description: '', effect: { type: 'wealth_pct', value: -5, target: 'self' } },
    { type: 'invest', label: 'Invest', description: '', effect: { type: 'wealth_pct', value: 10, target: 'self' }, asset: 'index' },
  ],
})
const attackCard = (id: string): GameCard => ({
  id, name: `Attack ${id}`, type: 'action', tier: 'common', flavor: '',
  effect: { type: 'wealth_pct', value: -10, target: 'target' }, category: 'personal',
})
const defenseCard = (id: string): GameCard => ({
  id, name: `Shield ${id}`, type: 'defense', tier: 'common', flavor: '', blocksCategories: ['medical'],
  effect: { type: 'block_card', blocks: [] },
})

let NOW: number

function fresh(): MpFullState {
  return buildInitialMultiplayerState(SEATS, 'standard', NOW)
}

/** A state in the play phase for p1 with a known hand. */
function playState(hand: GameCard[] = [decisionCard('d1'), attackCard('a1'), defenseCard('s1')]): MpFullState {
  const s = fresh()
  return {
    ...s,
    phase: 'play',
    players: s.players.map((p, i) => (i === 0 ? { ...p, hand } : { ...p, hand: [decisionCard(`x${i}`)] })),
  }
}

beforeEach(() => {
  NOW = Date.now()
  setRng(seededRng(42))
})
afterEach(() => setRng())

describe('buildInitialMultiplayerState', () => {
  it('creates seats in order with a shuffled server deck and version 1', () => {
    const s = fresh()
    expect(s.players.map(p => p.id)).toEqual(['p1', 'p2', 'p3'])
    expect(s.players.every(p => p.hand.length === 0 && !p.isBot)).toBe(true)
    expect(s.deck.length).toBeGreaterThan(50)
    expect(s.deck.some(c => c.lifeEvent)).toBe(false)
    expect(s.version).toBe(1)
    expect(s.phase).toBe('draw')
    expect(s.wealthGoal).toBe(MP_MODES.standard.wealthGoal)
    expect(s.startTime).toBe(NOW)
    const other = buildInitialMultiplayerState(SEATS, 'standard', NOW)
    expect(other.deck.map(c => c.id)).not.toEqual(s.deck.map(c => c.id))
  })

  it('applies the mode and rejects bad player counts', () => {
    expect(buildInitialMultiplayerState(SEATS, 'blitz', NOW).wealthGoal).toBe(1_500_000)
    expect(buildInitialMultiplayerState(SEATS, 'epic', NOW).timeLimit).toBe(30 * 60 * 1000)
    expect(() => buildInitialMultiplayerState([SEATS[0]], 'standard', NOW)).toThrow()
  })
})

describe('applyPlayerAction validation', () => {
  it('rejects actions when it is not your turn', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p2', { type: 'pass', cardId: 'x1' }, NOW)
    expect(r.error).toBe('not_your_turn')
    expect(r.changed).toBe(false)
    expect(r.state).toBe(s)
  })

  it('rejects cards that are not in the hand', () => {
    const s = playState()
    expect(applyPlayerAction(s, 'p1', { type: 'decision', cardId: 'x1', choice: 'save' }, NOW).error).toBe('card_not_in_hand')
    expect(applyPlayerAction(s, 'p1', { type: 'action', cardId: 'nope', targetIndex: 1 }, NOW).error).toBe('card_not_in_hand')
    expect(applyPlayerAction(s, 'p1', { type: 'equip', cardId: 'nope' }, NOW).error).toBe('card_not_in_hand')
    expect(applyPlayerAction(s, 'p1', { type: 'pass', cardId: 'nope' }, NOW).error).toBe('card_not_in_hand')
  })

  it('rejects unknown players, wrong phases, wrong card types and bad targets', () => {
    const s = playState()
    expect(applyPlayerAction(s, 'zz', { type: 'forfeit' }, NOW).error).toBe('not_in_game')
    expect(applyPlayerAction(s, 'p1', { type: 'draw' }, NOW).error).toBe('wrong_phase')
    expect(applyPlayerAction(fresh(), 'p1', { type: 'pass', cardId: 'd1' }, NOW).error).toBe('wrong_phase')
    expect(applyPlayerAction(s, 'p1', { type: 'decision', cardId: 'a1', choice: 'save' }, NOW).error).toBe('invalid_card')
    expect(applyPlayerAction(s, 'p1', { type: 'action', cardId: 'd1' }, NOW).error).toBe('invalid_card')
    expect(applyPlayerAction(s, 'p1', { type: 'equip', cardId: 'd1' }, NOW).error).toBe('invalid_card')
    expect(applyPlayerAction(s, 'p1', { type: 'action', cardId: 'a1' }, NOW).error).toBe('invalid_target')
    expect(applyPlayerAction(s, 'p1', { type: 'action', cardId: 'a1', targetIndex: 0 }, NOW).error).toBe('invalid_target')
    expect(applyPlayerAction(s, 'p1', { type: 'action', cardId: 'a1', targetIndex: 9 }, NOW).error).toBe('invalid_target')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(applyPlayerAction(s, 'p1', { type: 'hack' } as any, NOW).error).toBe('invalid_action')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(applyPlayerAction(s, 'p1', { type: 'decision', cardId: 'd1', choice: 'yolo' } as any, NOW).error).toBe('invalid_action')
  })

  it('rejects targeting a forfeited opponent', () => {
    const s = playState()
    const withGone = { ...s, players: s.players.map((p, i) => (i === 1 ? { ...p, hasForfeited: true } : p)) }
    expect(applyPlayerAction(withGone, 'p1', { type: 'action', cardId: 'a1', targetIndex: 1 }, NOW).error).toBe('invalid_target')
  })

  it('rejects everything once the game is over', () => {
    const s = { ...playState(), phase: 'game_over' as const }
    expect(applyPlayerAction(s, 'p1', { type: 'pass', cardId: 'd1' }, NOW).error).toBe('game_over')
    expect(applyPlayerAction(s, 'p1', { type: 'tick' }, NOW + 10 * TURN_TIME_LIMIT_MS).error).toBe('game_over')
  })
})

describe('applyPlayerAction happy paths', () => {
  it('draw refills the hand and moves to the play phase', () => {
    const s = fresh()
    const r = applyPlayerAction(s, 'p1', { type: 'draw' }, NOW)
    expect(r.error).toBeUndefined()
    expect(r.state.phase).toBe('play')
    expect(r.state.players[0].hand.length).toBe(5)
    expect(r.state.deck.length).toBe(s.deck.length - 5)
    expect(r.state.version).toBe(s.version + 1)
    expect(r.events[0]).toMatchObject({ type: 'draw', playerId: 'p1' })
  })

  it('decision resolves the card and passes the turn', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p1', { type: 'decision', cardId: 'd1', choice: 'save' }, NOW + 1000)
    expect(r.error).toBeUndefined()
    expect(r.state.players[0].hand.map(c => c.id)).toEqual(['a1', 's1'])
    expect(r.state.players[0].wealth).toBeGreaterThan(s.players[0].wealth)
    expect(r.state.currentPlayerIndex).toBe(1)
    expect(r.state.phase).toBe('draw')
    expect(r.state.turnStartTime).toBe(NOW + 1000)
    expect(r.state.pendingDecision).toBeNull()
    expect(r.events[0]).toMatchObject({ type: 'decision', choice: 'save', playerId: 'p1' })
    expect(r.state.lastEvents).toEqual(r.events)
  })

  it('action hits the chosen target', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p1', { type: 'action', cardId: 'a1', targetIndex: 2 }, NOW)
    expect(r.error).toBeUndefined()
    expect(r.state.players[2].wealth).toBeLessThan(s.players[2].wealth)
    expect(r.state.players[1].wealth).toBe(s.players[1].wealth)
    expect(r.state.players[0].hand.some(c => c.id === 'a1')).toBe(false)
    expect(r.events[0]).toMatchObject({ type: 'action', targetId: 'p3' })
    expect(r.state.currentPlayerIndex).toBe(1)
  })

  it('equip is free and keeps the turn; only once per turn', () => {
    const s = playState([defenseCard('s1'), defenseCard('s2'), decisionCard('d1')])
    const r = applyPlayerAction(s, 'p1', { type: 'equip', cardId: 's1' }, NOW)
    expect(r.error).toBeUndefined()
    expect(r.state.players[0].activeDefenses.map(c => c.id)).toEqual(['s1'])
    expect(r.state.currentPlayerIndex).toBe(0)
    expect(r.state.phase).toBe('play')
    const again = applyPlayerAction(r.state, 'p1', { type: 'equip', cardId: 's2' }, NOW)
    expect(again.error).toBe('cannot_equip')
  })

  it('pass discards the chosen card and ends the turn', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p1', { type: 'pass', cardId: 'd1' }, NOW)
    expect(r.error).toBeUndefined()
    expect(r.state.players[0].hand.map(c => c.id)).toEqual(['a1', 's1'])
    expect(r.state.discardPile.some(c => c.id === 'd1')).toBe(true)
    expect(r.state.currentPlayerIndex).toBe(1)
  })

  it('emote is validated but does not change the state', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p2', { type: 'emote', emoji: '🚀' }, NOW)
    expect(r.changed).toBe(false)
    expect(r.state).toBe(s)
    expect(r.events).toEqual([{ type: 'emote', playerId: 'p2', emoji: '🚀' }])
    expect(applyPlayerAction(s, 'p2', { type: 'emote', emoji: '<script>' }, NOW).error).toBe('bad_emote')
  })

  it('forfeit zeroes the player, discards the hand and moves the turn on', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p1', { type: 'forfeit' }, NOW)
    expect(r.state.players[0]).toMatchObject({ hasForfeited: true, wealth: 0, hand: [] })
    expect(r.state.currentPlayerIndex).toBe(1)
    expect(r.state.phase).toBe('draw')
    expect(applyPlayerAction(r.state, 'p1', { type: 'emote', emoji: '💰' }, NOW).error).toBe('forfeited')
  })

  it('version increments on every accepted change only', () => {
    let s = fresh()
    const v0 = s.version
    s = applyPlayerAction(s, 'p1', { type: 'draw' }, NOW).state
    expect(s.version).toBe(v0 + 1)
    const rejected = applyPlayerAction(s, 'p2', { type: 'draw' }, NOW)
    expect(rejected.state.version).toBe(v0 + 1)
    const card = s.players[0].hand[0]
    s = applyPlayerAction(s, 'p1', { type: 'pass', cardId: card.id }, NOW).state
    expect(s.version).toBe(v0 + 2)
  })
})

describe('tick', () => {
  it('is a no-op before the turn timeout', () => {
    const s = playState()
    const r = applyPlayerAction(s, 'p2', { type: 'tick' }, NOW + TURN_TIME_LIMIT_MS - 1)
    expect(r.changed).toBe(false)
    expect(r.error).toBeUndefined()
    expect(r.state).toBe(s)
  })

  it('skips the turn after the timeout', () => {
    const s = playState()
    const later = NOW + TURN_TIME_LIMIT_MS + 1
    const r = applyPlayerAction(s, 'p2', { type: 'tick' }, later)
    expect(r.changed).toBe(true)
    expect(r.state.currentPlayerIndex).toBe(1)
    expect(r.state.turnStartTime).toBe(later)
    expect(r.state.version).toBe(s.version + 1)
    expect(r.events).toEqual([{ type: 'timeout', playerId: 'p1' }])
    // A second tick right after is a no-op
    expect(applyTick(r.state, undefined, later + 10).changed).toBe(false)
  })

  it('forfeits a player whose heartbeat is stale', () => {
    const s = playState()
    const now = NOW + DISCONNECT_MS + 5000
    const lastSeen = { p1: now - 1000, p2: now - 1000, p3: now - DISCONNECT_MS - 1 }
    const r = applyPlayerAction(s, 'p1', { type: 'tick', lastSeen }, now)
    expect(r.changed).toBe(true)
    expect(r.state.players[2].hasForfeited).toBe(true)
    expect(r.state.players[0].hasForfeited).toBeFalsy()
    expect(r.state.currentPlayerIndex).toBe(0) // p1 still has time
    expect(r.events).toEqual([{ type: 'disconnect', playerId: 'p3' }])
  })

  it('a stale current player is forfeited and the turn moves on; missing heartbeat counts from game start', () => {
    const s = playState()
    const now = NOW + DISCONNECT_MS + 1
    const r = applyTick(s, { p2: now, p3: now }, now) // p1 never sent a heartbeat
    expect(r.state.players[0].hasForfeited).toBe(true)
    expect(r.state.currentPlayerIndex).toBe(1)
    expect(r.events.map(e => e.type)).toEqual(['disconnect'])
  })

  it('fresh heartbeats keep everyone in', () => {
    const s = playState()
    const now = NOW + 30_000
    expect(applyTick(s, { p1: now, p2: now, p3: now }, now).changed).toBe(false)
  })
})

describe('game over', () => {
  it('last player standing wins when the others forfeit / disconnect', () => {
    const s = playState()
    const now = NOW + DISCONNECT_MS + 1
    const r = applyTick(s, { p1: now }, now)
    expect(r.state.phase).toBe('game_over')
    expect(r.state.winner?.id).toBe('p1')
    expect(r.events[r.events.length - 1]).toEqual({ type: 'game_over', winnerId: 'p1' })
    const places = computePlacements(r.state)
    expect(places[0]).toMatchObject({ playerId: 'p1', placement: 1, won: true })
    expect(places.slice(1).every(p => p.forfeited && !p.won)).toBe(true)
  })

  it('reaching the wealth goal ends the game', () => {
    const s = playState()
    const rich = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, wealth: s.wealthGoal, cash: s.wealthGoal } : p)) }
    const r = applyPlayerAction(rich, 'p1', { type: 'decision', cardId: 'd1', choice: 'save' }, NOW)
    expect(r.state.phase).toBe('game_over')
    expect(r.state.winner?.id).toBe('p1')
    expect(r.events.map(e => e.type)).toEqual(['decision', 'game_over'])
  })

  it('an off-turn forfeit that leaves one player ends the game', () => {
    const s = playState()
    const two = { ...s, players: s.players.map((p, i) => (i === 2 ? { ...p, hasForfeited: true } : p)) }
    const r1 = applyPlayerAction(two, 'p2', { type: 'forfeit' }, NOW)
    expect(r1.state.phase).toBe('game_over')
    expect(r1.state.winner?.id).toBe('p1')
  })

  it('everyone disconnecting ends the game without a winner', () => {
    const now = NOW + DISCONNECT_MS + 1
    const r = applyTick(playState(), {}, now)
    expect(r.state.phase).toBe('game_over')
    expect(r.state.winner).toBeNull()
    expect(computePlacements(r.state).every(p => !p.won)).toBe(true)
  })

  it('placements order active players by net worth', () => {
    const s = playState()
    const st = {
      ...s,
      phase: 'game_over' as const,
      players: s.players.map((p, i) => ({ ...p, wealth: [100, 300, 200][i], cash: [100, 300, 200][i] })),
    }
    st.winner = st.players[1]
    expect(computePlacements(st).map(p => p.playerId)).toEqual(['p2', 'p3', 'p1'])
  })
})

describe('redaction', () => {
  it('publicState hides hands, deck order, life events and the drawn card but keeps counts', () => {
    const s0 = applyPlayerAction(fresh(), 'p1', { type: 'draw' }, NOW).state
    const pub = publicState(s0)
    expect(pub.players.every(p => p.hand.length === 0)).toBe(true)
    expect(pub.players[0].handCount).toBe(5)
    expect(pub.deck).toEqual([])
    expect(pub.eventDeck).toEqual([])
    expect(pub.deckCount).toBe(s0.deck.length)
    expect(pub.eventDeckCount).toBe(s0.eventDeck?.length)
    expect(pub.drawnCard).toBeNull()
    expect(pub.version).toBe(s0.version)
    const json = JSON.stringify(pub)
    for (const c of s0.players[0].hand) expect(json).not.toContain(`"${c.id}"`)
    for (const c of s0.deck.slice(0, 10)) expect(json).not.toContain(`"${c.id}"`)
  })

  it('winner is redacted too', () => {
    const s = playState()
    const over = applyTick(s, { p1: NOW + DISCONNECT_MS + 1 }, NOW + DISCONNECT_MS + 1).state
    const withHand = { ...over, winner: { ...over.winner!, hand: [decisionCard('secret')] } }
    expect(JSON.stringify(publicState(withHand))).not.toContain('secret')
  })

  it('redactForPlayer shows only the viewer hand', () => {
    const s = playState()
    const v1 = redactForPlayer(s, 'p1')
    expect(v1.players[0].hand.map(c => c.id)).toEqual(['d1', 'a1', 's1'])
    expect(v1.players[1].hand).toEqual([])
    expect(v1.players[1].handCount).toBe(1)
    const v2 = redactForPlayer(s, 'p2')
    expect(v2.players[0].hand).toEqual([])
    expect(v2.players[1].hand.map(c => c.id)).toEqual(['x1'])
    expect(JSON.stringify(v2)).not.toContain('"d1"')
  })

  it('withOwnHand + toBoardState rebuild a renderable state on the client', () => {
    const s = playState()
    const pub = publicState(s)
    const merged = withOwnHand(pub, 'p2', s.players[1].hand)
    expect(merged).toEqual(redactForPlayer(s, 'p2'))
    const board = toBoardState(merged)
    expect(board.deck.length).toBe(s.deck.length)
    expect(withOwnHand(pub, 'p2', null)).toBe(pub)
  })

  it('changedHands lists only hands that changed', () => {
    const s = playState()
    expect(Object.keys(changedHands(null, s)).sort()).toEqual(['p1', 'p2', 'p3'])
    const r = applyPlayerAction(s, 'p1', { type: 'pass', cardId: 'd1' }, NOW).state
    expect(Object.keys(changedHands(s, r))).toEqual(['p1'])
  })
})

describe('full game simulation', () => {
  it('random legal play always terminates in game_over with consistent versions', () => {
    let s = buildInitialMultiplayerState(SEATS.slice(0, 2), 'blitz', NOW)
    let guard = 0
    while (s.phase !== 'game_over' && guard++ < 2000) {
      const cur = s.players[s.currentPlayerIndex]
      const before = s.version
      let r
      if (s.phase === 'draw') r = applyPlayerAction(s, cur.id, { type: 'draw' }, NOW)
      else {
        const card = cur.hand.find(c => c.type === 'decision') ?? cur.hand[0]
        if (card?.type === 'decision') r = applyPlayerAction(s, cur.id, { type: 'decision', cardId: card.id, choice: 'invest' }, NOW)
        if (!r || r.error) r = applyPlayerAction(s, cur.id, { type: 'pass', cardId: card?.id }, NOW)
      }
      expect(r.error).toBeUndefined()
      expect(r.state.version).toBe(before + 1)
      s = r.state
    }
    expect(s.phase).toBe('game_over')
  })
})
