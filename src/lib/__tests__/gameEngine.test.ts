import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  initGame,
  initLevelGame,
  processAction,
  processDecision,
  previewDecision,
  equipDefense,
  setWealthWithFloor,
  chooseBotDecision,
  getStartingWealth,
  startDrawPhase,
  advanceTurn,
  passTurn,
  startNewRound,
  applyLifeEvent,
  doBotTurn,
  getNetWorth,
  getCash,
  getHoldings,
  applyLoss,
  setRng,
  seededRng,
  STARTING_WEALTH,
  HAND_SIZE,
  MAX_ROUNDS,
  SAVE_STREAK_CAP,
} from '../gameEngine'
import { applyInflation, rollMarket, syncWealth } from '../economy'
import { ASSETS, BASE_INFLATION_PCT, LIFESTYLE_INFLATION_STEP_PCT } from '../../data/assets'
import { ALL_CARDS } from '../../data/cards'
import type { GameCard, GameState, Holding, PlayerState } from '../../types/game'
import type { LevelConfig } from '../../types/level'

function newGame(bots = 2): GameState {
  return initGame({ id: 'human', name: 'Human' }, bots)
}

function withPlayer(state: GameState, index: number, patch: Partial<PlayerState>): GameState {
  return { ...state, players: state.players.map((p, i) => (i === index ? syncWealth({ ...p, ...patch }) : p)) }
}

function findCard(id: string): GameCard {
  const card = ALL_CARDS.find(c => c.id === id)
  if (!card) throw new Error(`card ${id} not found`)
  return card
}

function holding(asset: Holding['asset'], value: number, principal = value): Holding {
  return { id: `h_${asset}`, asset, name: asset, principal, value, boughtRound: 1, lastChangePct: 0 }
}

const decisionCard = (tier: GameCard['tier'] = 'common', patch: Partial<GameCard> = {}): GameCard => ({
  id: `test_dec_${tier}`, name: 'Test Decision', type: 'decision', tier, flavor: '',
  options: [
    { type: 'spend', label: 'Spend', description: '', mentorInsight: 'spend lesson', effect: { type: 'wealth_pct', value: -10, target: 'self' } },
    { type: 'save', label: 'Save', description: '', mentorInsight: 'save lesson', effect: { type: 'wealth_pct', value: 10, target: 'self' } },
    { type: 'invest', label: 'Invest', description: '', mentorInsight: 'invest lesson', effect: { type: 'wealth_pct', value: 20, target: 'self' }, investRisk: 30, failEffect: { type: 'wealth_pct', value: -15, target: 'self' } },
  ],
  ...patch,
})

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
  setRng()
})

describe('money model', () => {
  it('new players start with all wealth in cash and no holdings', () => {
    const p = newGame(1).players[0]
    expect(getCash(p)).toBe(STARTING_WEALTH)
    expect(getHoldings(p)).toEqual([])
    expect(getNetWorth(p)).toBe(STARTING_WEALTH)
    expect(p.wealth).toBe(STARTING_WEALTH)
  })

  it('old states without cash/holdings treat wealth as cash', () => {
    const legacy = { ...newGame(1).players[0], cash: undefined, holdings: undefined, wealth: 123456 }
    expect(getCash(legacy)).toBe(123456)
    expect(getNetWorth(legacy)).toBe(123456)
  })

  it('lifeEvent cards never sit in the draw deck', () => {
    const s = newGame(2)
    expect(s.deck.some(c => c.lifeEvent)).toBe(false)
    expect((s.eventDeck ?? []).length).toBeGreaterThan(0)
    expect(s.round).toBe(1)
  })
})

describe('AoE attacks', () => {
  it('Severe Market Crash hits each opponent exactly once and spares the caster', () => {
    // Use the crash's AoE effect as a plain cash attack (the real card is now a 'market' life event that hits holdings)
    const crash: GameCard = { ...findCard('ac_severe_market_crash_165'), category: undefined, lifeEvent: undefined }
    const state = newGame(2) // 3 players → 15% scaled by 0.8 = 12%
    const after = processAction(state, 0, crash, 0)

    expect(after.players[0].wealth).toBe(STARTING_WEALTH)
    expect(after.players[1].wealth).toBe(STARTING_WEALTH - 60000)
    expect(after.players[2].wealth).toBe(STARTING_WEALTH - 60000)
    expect(getCash(after.players[1])).toBe(STARTING_WEALTH - 60000)
  })

  it('applies once when cast by a non-first player too', () => {
    // Use the crash's AoE effect as a plain cash attack (the real card is now a 'market' life event that hits holdings)
    const crash: GameCard = { ...findCard('ac_severe_market_crash_165'), category: undefined, lifeEvent: undefined }
    const after = processAction(newGame(1), 1, crash, 1)
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
    let state = withPlayer(newGame(1), 1, { cash: 100000 })
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
    const p = syncWealth({ ...newGame(1).players[0], cash: 30000, wealthFloor: 50000 })
    const res = setWealthWithFloor(p, 10000)
    expect(res.player.wealth).toBe(30000)
    expect(res.player.wealthFloor).toBe(0)
  })
})

describe('decisions', () => {
  it('applies the save-streak multiplier to rupees, not the percentage', () => {
    const card: GameCard = {
      id: 'test_pct', name: 'FD', type: 'decision', tier: 'common', flavor: '',
      options: [{ type: 'save', label: 'Save', description: '', effect: { type: 'wealth_pct', value: 4, target: 'self' } }],
    }
    const after = processDecision(newGame(1), 0, 'save', card)
    // streak 1 → ×1.05: 500000 × 4% × 1.05 = 21000
    expect(after.players[0].wealth).toBe(STARTING_WEALTH + 21000)
    expect(getCash(after.players[0])).toBe(STARTING_WEALTH + 21000)
  })

  it('rounds the final rupee amount for flat gains', () => {
    const card: GameCard = {
      id: 'test_flat', name: 'RD', type: 'decision', tier: 'common', flavor: '',
      options: [{ type: 'save', label: 'Save', description: '', effect: { type: 'wealth_change', value: 12345, target: 'self' } }],
    }
    const after = processDecision(newGame(1), 0, 'save', card)
    expect(after.players[0].wealth).toBe(STARTING_WEALTH + Math.round(12345 * 1.05))
  })

  it('caps the save streak at 3 (×1.15)', () => {
    let s = withPlayer(newGame(1), 0, { savingStreak: SAVE_STREAK_CAP })
    s = processDecision(s, 0, 'save', decisionCard())
    expect(s.players[0].savingStreak).toBe(SAVE_STREAK_CAP)
    expect(s.players[0].wealth).toBe(STARTING_WEALTH + Math.round(STARTING_WEALTH * 0.1 * 1.15))
  })

  it('invest moves cash into a holding without changing net worth', () => {
    const card = decisionCard('rare')
    const s = processDecision(newGame(1), 0, 'invest', card)
    const p = s.players[0]
    expect(getNetWorth(p)).toBe(STARTING_WEALTH)
    expect(p.wealth).toBe(STARTING_WEALTH)
    expect(getHoldings(p)).toHaveLength(1)
    expect(getHoldings(p)[0].asset).toBe('index') // inferred from investRisk 30
    expect(getHoldings(p)[0].value).toBe(STARTING_WEALTH * 0.5)
    expect(getCash(p)).toBe(STARTING_WEALTH * 0.5)
    expect(p.investChoices).toBe(1)
    expect(s.log[0]).toContain('moved into')
  })

  it('invest uses the option asset when given', () => {
    const card = decisionCard('common')
    card.options![2] = { ...card.options![2], asset: 'gold' }
    const s = processDecision(newGame(1), 0, 'invest', card)
    expect(getHoldings(s.players[0])[0].asset).toBe('gold')
  })

  it('spend takes cash, raises lifestyle and does not touch the greed index', () => {
    const s = processDecision(newGame(1), 0, 'spend', decisionCard())
    const p = s.players[0]
    expect(getCash(p)).toBe(STARTING_WEALTH - 50000)
    expect(p.lifestyleLevel).toBe(1)
    expect(p.greedIndex).toBe(0)
    expect(p.hand.length).toBe(1) // free card
  })

  it('previewDecision matches the real outcome and does not mutate state', () => {
    const state = newGame(1)
    const snapshot = JSON.stringify(state)
    const card = decisionCard('epic')
    const pv = previewDecision(state, 0, card, 'invest')
    expect(pv).toMatchObject({ investAmount: Math.round(STARTING_WEALTH * 0.65), asset: 'index', netWorthDelta: 0, cashDelta: -Math.round(STARTING_WEALTH * 0.65) })
    expect(JSON.stringify(state)).toBe(snapshot)
    const save = previewDecision(state, 0, card, 'save')
    expect(save.netWorthDelta).toBe(getNetWorth(processDecision(state, 0, 'save', card).players[0]) - STARTING_WEALTH)
  })

  it('invest is disabled with under ₹1,000 cash', () => {
    const state = withPlayer(newGame(1), 0, { cash: 500 })
    expect(previewDecision(state, 0, decisionCard(), 'invest').disabled).toBeTruthy()
  })
})

describe('losses and forced sales', () => {
  it('sells the most liquid holding first and pays its exit penalty when cash is short', () => {
    const p = syncWealth({ ...newGame(1).players[0], cash: 10000, holdings: [holding('realestate', 100000), holding('index', 20000)] })
    const res = applyLoss(p, 50000)
    // 10K from cash, then index (1% penalty) fully, then property (15%) for the rest
    expect(getCash(res.player)).toBe(0)
    expect(res.forcedSales.map(s => s.asset)).toEqual(['index', 'realestate'])
    const indexPenalty = 200
    const remainingNeed = 50000 - 10000 - (20000 - indexPenalty)
    const propertySold = Math.ceil(remainingNeed / 0.85)
    expect(getHoldings(res.player).find(h => h.asset === 'realestate')?.value).toBe(100000 - propertySold)
    expect(res.netWorthLost).toBeGreaterThan(50000) // penalties make it hurt more
    expect(res.logs.join(' ')).toContain('emergency fund would have avoided this')
  })

  it('floors net worth at 0 when everything is gone', () => {
    const p = syncWealth({ ...newGame(1).players[0], cash: 1000, holdings: [holding('fd', 1000)] })
    const res = applyLoss(p, 999999)
    expect(res.player.wealth).toBe(0)
    expect(getHoldings(res.player)).toHaveLength(0)
  })
})

describe('turn structure', () => {
  it('hand persists across turns and refills to HAND_SIZE', () => {
    let s = newGame(1)
    s = startDrawPhase(s, 0).state
    expect(s.players[0].hand).toHaveLength(HAND_SIZE)
    const kept = s.players[0].hand.slice(1).map(c => c.id)
    s = passTurn(s, 0, s.players[0].hand[0].id)
    expect(s.players[0].hand.map(c => c.id)).toEqual(kept)
    expect(s.currentPlayerIndex).toBe(1)
    s = advanceTurn(s) // back to player 0, new round
    s = startDrawPhase(s, 0).state
    expect(s.players[0].hand).toHaveLength(HAND_SIZE)
    expect(s.players[0].hand.slice(0, kept.length).map(c => c.id)).toEqual(kept)
  })

  it('equipping a defense does not end the turn and is once per turn (max 3)', () => {
    const d1 = { ...findCard('leg_warren_buffett'), id: 'd1' }
    const d2 = { ...findCard('leg_warren_buffett'), id: 'd2' }
    let s = withPlayer({ ...newGame(1), phase: 'play' }, 0, { hand: [d1, d2] })
    s = equipDefense(s, 0, d1)
    expect(s.currentPlayerIndex).toBe(0)
    expect(s.phase).toBe('play')
    expect(s.players[0].activeDefenses).toHaveLength(1)
    const again = equipDefense(s, 0, d2)
    expect(again.players[0].activeDefenses).toHaveLength(1)
    // next turn the free equip is back, unless 3 are already active
    s = advanceTurn(s)
    expect(s.equippedThisTurn).toBe(false)
    const full = withPlayer({ ...s, currentPlayerIndex: 0 }, 0, { activeDefenses: [d1, { ...d1, id: 'x' }, { ...d1, id: 'y' }], hand: [d2] })
    expect(equipDefense(full, 0, d2).players[0].activeDefenses).toHaveLength(3)
  })

  it('a new round starts when the turn wraps to the first player', () => {
    setRng(seededRng(7))
    let s = newGame(2)
    s = advanceTurn(s)
    s = advanceTurn(s)
    expect(s.round).toBe(1)
    s = advanceTurn(s)
    expect(s.round).toBe(2)
    expect(s.currentPlayerIndex).toBe(0)
    expect(s.lastMarketTick?.round).toBe(2)
    expect(s.roundNews?.lines[0]).toContain('Year 2')
  })

  it('bots play a full turn without discarding their hand', () => {
    setRng(seededRng(3))
    const s = { ...newGame(1), currentPlayerIndex: 1 }
    const after = doBotTurn(s).state
    expect(after.players[1].hand.length).toBeGreaterThanOrEqual(HAND_SIZE - 2) // at most one equip + one play
  })
})

describe('market tick and inflation', () => {
  it('market tick is deterministic with a seeded rng', () => {
    const base = withPlayer(newGame(1), 0, { cash: 100000, holdings: [holding('index', 200000), holding('crypto', 100000)] })
    setRng(seededRng(42))
    const a = startNewRound(base)
    setRng(seededRng(42))
    const b = startNewRound(base)
    expect(a.lastMarketTick).toEqual(b.lastMarketTick)
    expect(a.players[0].holdings).toEqual(b.players[0].holdings)
    const idx = a.players[0].holdings!.find(h => h.asset === 'index')
    if (idx) expect(idx.lastChangePct).toBe(a.lastMarketTick!.changes.index)
  })

  it('crashes apply the crash percentage', () => {
    setRng(() => 0) // always below crashChance → crash where possible
    const changes = rollMarket()
    expect(changes.crypto).toBe(-ASSETS.crypto.crashPct)
    expect(changes.fd).toBe(ASSETS.fd.meanPct - ASSETS.fd.swingPct)
  })

  it('inflation hits cash only and grows with lifestyle', () => {
    const p = syncWealth({ ...newGame(1).players[0], cash: 100000, holdings: [holding('index', 100000)], lifestyleLevel: 0 })
    const r0 = applyInflation(p)
    expect(r0.lost).toBe(100000 * BASE_INFLATION_PCT / 100)
    expect(getHoldings(r0.player)[0].value).toBe(100000)
    const r3 = applyInflation({ ...p, lifestyleLevel: 3 })
    expect(r3.lost).toBe(100000 * (BASE_INFLATION_PCT + 3 * LIFESTYLE_INFLATION_STEP_PCT) / 100)
  })
})

describe('defenses by category', () => {
  const medicalAttack: GameCard = {
    id: 'test_med', name: 'Surprise Surgery', type: 'action', tier: 'rare', flavor: '', category: 'medical',
    effect: { type: 'wealth_pct', value: -10, target: 'target' },
  }
  const healthCover: GameCard = {
    id: 'test_cover', name: 'Health Cover', type: 'defense', tier: 'rare', flavor: '', blocksCategories: ['medical'],
    effect: { type: 'block_card', target: 'self', blocks: [] },
  }

  it('blocks an incoming card whose category is listed', () => {
    const s = withPlayer(newGame(1), 1, { activeDefenses: [healthCover] })
    const after = processAction(s, 0, medicalAttack, 1)
    expect(after.players[1].wealth).toBe(STARTING_WEALTH)
    expect(after.players[1].activeDefenses).toHaveLength(0)
    expect(after.discardPile.some(c => c.id === healthCover.id)).toBe(true)
  })

  it('does not block other categories', () => {
    const s = withPlayer(newGame(1), 1, { activeDefenses: [healthCover] })
    const after = processAction(s, 0, { ...medicalAttack, category: 'tax' }, 1)
    expect(after.players[1].wealth).toBe(STARTING_WEALTH - 50000)
  })

  it('still honours legacy name-based blocks', () => {
    const roof = findCard('ac_roof_leak_159')
    const def = ALL_CARDS.find(c => c.type === 'defense' && c.effect?.blocks?.includes('Roof Leak'))!
    const s = withPlayer(newGame(1), 1, { activeDefenses: [def] })
    expect(processAction(s, 0, roof, 1).players[1].wealth).toBe(STARTING_WEALTH)
  })

  it('applies to life events too', () => {
    setRng(() => 0) // picks the first active player (index 0)
    const s = withPlayer(newGame(1), 0, { activeDefenses: [healthCover] })
    const r = applyLifeEvent(s, { ...medicalAttack, lifeEvent: true })
    expect(r.state.players[0].wealth).toBe(STARTING_WEALTH)
    expect(r.lines.join(' ')).toContain('blocked')
  })

  it('market-category events move market holdings instead of cash', () => {
    setRng(() => 0)
    const s = withPlayer(newGame(1), 0, { cash: 100000, holdings: [holding('index', 100000), holding('fd', 100000)] })
    const crash: GameCard = { id: 'mc', name: 'Crash', type: 'action', tier: 'epic', flavor: '', category: 'market', lifeEvent: true, effect: { type: 'wealth_pct', value: -20, target: 'all' } }
    const p = applyLifeEvent(s, crash).state.players[0]
    expect(getCash(p)).toBe(100000)
    expect(getHoldings(p).find(h => h.asset === 'index')?.value).toBe(80000)
    expect(getHoldings(p).find(h => h.asset === 'fd')?.value).toBe(100000)
  })
})

describe('game end', () => {
  it('round limit ends a quick game with the richest player winning', () => {
    setRng(seededRng(1))
    let s = newGame(1)
    s = withPlayer({ ...s, round: MAX_ROUNDS, currentPlayerIndex: 1 }, 1, { cash: 900000 })
    s = advanceTurn(s)
    expect(s.phase).toBe('game_over')
    expect(s.winner?.id).toBe('bot_0')
  })

  it('reaching the goal wins immediately', () => {
    const s = withPlayer(newGame(1), 0, { cash: 4900000 })
    const after = processDecision(s, 0, 'save', decisionCard())
    expect(after.phase).toBe('game_over')
    expect(after.winner?.id).toBe('human')
  })

  it('campaign requires the target corpus — being richest is not enough', () => {
    setRng(seededRng(1))
    let s = initLevelGame({ id: 'human', name: 'Human' }, level({ turnLimit: 5, botCount: 1 }))
    s = withPlayer({ ...s, round: 5, currentPlayerIndex: 1 }, 0, { cash: 5000000 })
    s = advanceTurn(s)
    expect(s.phase).toBe('game_over')
    expect(s.winner?.id).not.toBe('human')
    expect(s.log.join(' ')).toContain('needed')
  })
})

describe('bot decisions', () => {
  it('saves when cash is below the 15% buffer, invests when comfortably above', () => {
    const state = newGame(1)
    const card = decisionCard('common')
    const poor = syncWealth({ ...state.players[1], cash: 50000, holdings: [holding('index', 950000)] })
    expect(chooseBotDecision(state, poor, card, 0.99)).toBe('save')
    expect(chooseBotDecision(state, state.players[1], card, 0.99)).toBe('invest')
  })

  it('hard bots never fall for scams, easy bots sometimes do', () => {
    const state = newGame(1)
    const card = decisionCard('common')
    card.options![2] = { ...card.options![2], asset: 'scam' }
    const hard = { ...state.players[1], diffMultiplier: 1.2 }
    const easy = { ...state.players[1], diffMultiplier: 0.8 }
    expect(chooseBotDecision(state, hard, card, 0.01)).toBe('save')
    expect(chooseBotDecision(state, easy, card, 0.01)).toBe('invest')
    expect(chooseBotDecision(state, easy, card, 0.99)).toBe('save')
  })

  it('getStartingWealth uses the level starting wealth, else the default', () => {
    expect(getStartingWealth({ ...newGame(1), levelConfig: level({ startingCorpus: 1000000 }) })).toBe(1000000)
    expect(getStartingWealth(newGame(1))).toBe(STARTING_WEALTH)
  })
})
