import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  initGame,
  processAction,
  processDecision,
  equipDefense,
  setWealthWithFloor,
  chooseBotDecision,
  getStartingWealth,
  STARTING_WEALTH,
} from '../gameEngine'
import { ALL_CARDS } from '../../data/cards'
import type { GameCard, GameState, PlayerState } from '../../types/game'
import type { LevelConfig } from '../../types/level'

function newGame(bots = 2): GameState {
  return initGame({ id: 'human', name: 'Human' }, bots)
}

function withPlayer(state: GameState, index: number, patch: Partial<PlayerState>): GameState {
  return { ...state, players: state.players.map((p, i) => (i === index ? { ...p, ...patch } : p)) }
}

function findCard(id: string): GameCard {
  const card = ALL_CARDS.find(c => c.id === id)
  if (!card) throw new Error(`card ${id} not found`)
  return card
}

const level = (overrides: Partial<LevelConfig>): LevelConfig => ({
  id: 'level_4',
  name: 'Test Level',
  lifeStage: '',
  ageRange: '',
  planet: '',
  mainLearning: '',
  startingCorpus: 1000000,
  targetCorpus: 10000000,
  turnLimit: 20,
  botCount: 2,
  botDifficulty: 'medium',
  description: '',
  mechanicName: '',
  mechanicDescription: '',
  ...overrides,
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AoE attacks', () => {
  it('Severe Market Crash hits each opponent exactly once and spares the caster', () => {
    const crash = findCard('ac_severe_market_crash_165')
    const state = newGame(2) // 3 players → 15% scaled by 0.8 = 12%
    const after = processAction(state, 0, crash, 0)

    expect(after.players[0].wealth).toBe(STARTING_WEALTH)
    expect(after.players[1].wealth).toBe(STARTING_WEALTH - 60000)
    expect(after.players[2].wealth).toBe(STARTING_WEALTH - 60000)
  })

  it('applies once when cast by a non-first player too', () => {
    const crash = findCard('ac_severe_market_crash_165')
    const state = newGame(1) // 2 players → full 15%
    const after = processAction(state, 1, crash, 1)
    expect(after.players[1].wealth).toBe(STARTING_WEALTH)
    expect(after.players[0].wealth).toBe(STARTING_WEALTH - 75000)
  })

  it('hits the caster only when the card explicitly includes self', () => {
    const card: GameCard = {
      id: 'test_aoe_self', name: 'Self AoE', type: 'action', tier: 'epic', flavor: '',
      effect: { type: 'attack_all_pct', value: 10, target: 'all', includeSelf: true },
    }
    const after = processAction(newGame(1), 0, card, 0)
    expect(after.players[0].wealth).toBe(STARTING_WEALTH - 50000)
    expect(after.players[1].wealth).toBe(STARTING_WEALTH - 50000)
  })

  it('per-target AoE (skip_turn on others) affects each opponent once', () => {
    const pause = findCard('ac_time_warp')
    const after = processAction(newGame(2), 0, pause, 0)
    expect(after.players.map(p => p.skippedTurns)).toEqual([0, 1, 1])
  })
})

describe('Bankruptcy Shield / wealth floor', () => {
  const shield = findCard('leg_bankruptcy_shield')

  it('equipping the shield arms the wealth floor', () => {
    let state = newGame(1)
    state = withPlayer(state, 1, { hand: [shield] })
    const after = equipDefense(state, 1, shield)
    expect(after.players[1].wealthFloor).toBe(50000)
    expect(after.players[1].activeDefenses.map(c => c.id)).toContain(shield.id)
    expect(after.players[1].hand).toHaveLength(0)
  })

  it('stops a big attack at the floor, then breaks', () => {
    let state = withPlayer(newGame(1), 1, { wealth: 100000 })
    state = equipDefense(state, 1, shield)
    const heist: GameCard = {
      id: 'test_steal', name: 'Heist', type: 'action', tier: 'rare', flavor: '',
      effect: { type: 'steal', value: 90000, target: 'target' },
    }
    const after = processAction(state, 0, heist, 1)
    expect(after.players[1].wealth).toBe(50000)
    expect(after.players[1].wealthFloor).toBe(0)
    expect(after.players[1].activeDefenses.some(c => c.id === shield.id)).toBe(false)
    expect(after.discardPile.some(c => c.id === shield.id)).toBe(true)
    // Thief only gains what was actually lost
    expect(after.players[0].wealth).toBe(STARTING_WEALTH + 50000)
  })

  it('never grants money when already below the floor', () => {
    const p = { ...newGame(1).players[0], wealth: 30000, wealthFloor: 50000 }
    const res = setWealthWithFloor(p, 10000)
    expect(res.player.wealth).toBe(30000)
    expect(res.player.wealthFloor).toBe(0)
  })

  it('greed market-correction respects the floor and does not mutate input state', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const card: GameCard = {
      id: 'test_decision', name: 'Test Decision', type: 'decision', tier: 'common', flavor: '',
      options: [
        { type: 'invest', label: 'Invest', description: '', effect: { type: 'wealth_change', value: 0, target: 'self' } },
      ],
    }
    const state = withPlayer(newGame(1), 0, { wealth: 55000, wealthFloor: 50000, greedIndex: 2, hand: [card] })
    const snapshot = JSON.stringify(state)
    const after = processDecision(state, 0, 'invest', card)

    expect(after.players[0].wealth).toBe(50000) // 20% of 55K would be 44K
    expect(after.players[0].wealthFloor).toBe(0)
    expect(after.players[0].greedIndex).toBe(0)
    expect(JSON.stringify(state)).toBe(snapshot)
  })
})

describe('decision multipliers', () => {
  it('applies the save-streak multiplier to rupees, not the percentage', () => {
    const card: GameCard = {
      id: 'test_pct', name: 'FD', type: 'decision', tier: 'common', flavor: '',
      options: [{ type: 'save', label: 'Save', description: '', effect: { type: 'wealth_pct', value: 4, target: 'self' } }],
    }
    const after = processDecision(newGame(1), 0, 'save', card)
    // streak 1 → ×1.05: 500000 × 4% × 1.05 = 21000 (old bug: floor(4 × 1.05) = 4% → 20000)
    expect(after.players[0].wealth).toBe(STARTING_WEALTH + 21000)
  })

  it('rounds the final rupee amount for flat gains', () => {
    const card: GameCard = {
      id: 'test_flat', name: 'RD', type: 'decision', tier: 'common', flavor: '',
      options: [{ type: 'save', label: 'Save', description: '', effect: { type: 'wealth_change', value: 12345, target: 'self' } }],
    }
    const after = processDecision(newGame(1), 0, 'save', card)
    expect(after.players[0].wealth).toBe(STARTING_WEALTH + Math.round(12345 * 1.05))
  })
})

describe('bot decision wealth ratio', () => {
  it('uses the level starting wealth, not the default', () => {
    const state: GameState = { ...newGame(1), levelConfig: level({ startingCorpus: 1000000 }) }
    expect(getStartingWealth(state)).toBe(1000000)

    // 4L in a 10L level is < 50% → always save (default ratio would be 0.8 → may invest)
    const poorBot = { ...state.players[1], wealth: 400000 }
    expect(chooseBotDecision(state, poorBot, 0.99)).toBe('save')

    // 12L in a 10L level is middle ground (ratio 1.2), so rand 0.35 → save.
    // With the default 5L baseline the ratio would be 2.4 and the bot would invest.
    const okBot = { ...state.players[1], wealth: 1200000 }
    expect(chooseBotDecision(state, okBot, 0.35)).toBe('save')
    expect(chooseBotDecision(newGame(1), okBot, 0.35)).toBe('invest')
  })

  it('falls back to STARTING_WEALTH outside campaign', () => {
    expect(getStartingWealth(newGame(1))).toBe(STARTING_WEALTH)
  })
})
