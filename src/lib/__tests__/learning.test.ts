import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  initGame,
  processDecision,
  processAction,
  previewDecision,
  equipDefense,
  advanceTurn,
  startNewRound,
  applyLifeEvent,
  doBotTurn,
  ensureStats,
  getNetWorth,
  getCash,
  setRng,
  seededRng,
  STARTING_WEALTH,
} from '../gameEngine'
import { syncWealth } from '../economy'
import { buildReportCard, sipFutureValue, emptyStats } from '../learning'
import { CONCEPTS, ALL_CONCEPT_IDS } from '../../data/concepts'
import { ASSETS } from '../../data/assets'
import { BUILTIN_LIFE_EVENTS } from '../../data/lifeEvents'
import type { AssetClass, DecisionChoice, GameCard, GameState, Holding, PlayerState } from '../../types/game'
import type { ConceptId } from '../../types/learning'

afterEach(() => setRng())

function withPlayer(state: GameState, index: number, patch: Partial<PlayerState>): GameState {
  return { ...state, players: state.players.map((p, i) => (i === index ? syncWealth({ ...p, ...patch }) : p)) }
}

function holding(asset: AssetClass, value: number, principal = value, boughtRound = 1): Holding {
  return { id: `h_${asset}`, asset, name: asset, principal, value, boughtRound, lastChangePct: 0 }
}

const decision = (asset: AssetClass = 'index', tier: GameCard['tier'] = 'rare'): GameCard => ({
  id: `t_dec_${asset}_${tier}`, name: 'Test Decision', type: 'decision', tier, flavor: '',
  options: [
    { type: 'spend', label: 'Spend', description: '', effect: { type: 'wealth_pct', value: -10, target: 'self' } },
    { type: 'save', label: 'Save', description: '', effect: { type: 'wealth_pct', value: 6, target: 'self' } },
    { type: 'invest', label: 'Invest', description: '', asset, effect: { type: 'wealth_pct', value: 10, target: 'self' } },
  ],
})

const lifeEvent = (id: string): GameCard => {
  const c = BUILTIN_LIFE_EVENTS.find(e => e.id === id)
  if (!c) throw new Error(id)
  return c
}

const healthDefense: GameCard = {
  id: 'def_health', name: 'Comprehensive Health Insurance', type: 'defense', tier: 'rare', flavor: '',
  blocksCategories: ['medical'], effect: { type: 'block_card', blocks: [] },
}

const stats = (s: GameState, i = 0) => s.players[i].stats!

type Strategy = (s: GameState, me: PlayerState) => { choice: DecisionChoice; card: GameCard }

const alwaysSave: Strategy = () => ({ choice: 'save', card: decision('index') })
const scamChaser: Strategy = (_s, me) => (getCash(me) >= 1000 ? { choice: 'invest', card: decision('scam') } : { choice: 'save', card: decision('index') })
/** Keep ~20% of net worth in cash, invest the rest across index / equity / debt. */
const balanced: Strategy = (_s, me) => {
  const cashShare = getCash(me) / Math.max(1, getNetWorth(me))
  if (cashShare < 0.3) return { choice: 'save', card: decision('index') }
  const assets: AssetClass[] = ['index', 'equity', 'index', 'debt']
  return { choice: 'invest', card: decision(assets[(me.stats?.invests ?? 0) % assets.length], 'common') }
}

/** Play a whole quick game (1 human + 2 bots) with a seeded rng; the human follows `strategy`. */
function playGame(strategy: Strategy, seed: number, maxRounds = 12): { state: GameState; humanDecisions: number } {
  setRng(seededRng(seed))
  // The card deck shuffles with Math.random — seed it too so the whole game is reproducible
  const spy = vi.spyOn(Math, 'random').mockImplementation(seededRng(seed + 1))
  let s: GameState = { ...initGame({ id: 'human', name: 'Human' }, 2), maxRounds, wealthGoal: 1e12 }
  let humanDecisions = 0
  let guard = 0
  while (s.phase !== 'game_over' && guard++ < 500) {
    if (s.currentPlayerIndex === 0) {
      const me = s.players[0]
      const { choice, card } = strategy(s, me)
      const next = processDecision(s, 0, choice, card)
      if (next.players[0].stats!.saves + next.players[0].stats!.spends + next.players[0].stats!.invests > humanDecisions) humanDecisions++
      s = next.phase === 'game_over' ? next : advanceTurn(next)
    } else {
      s = doBotTurn(s).state
    }
  }
  setRng()
  spy.mockRestore()
  return { state: s, humanDecisions }
}

describe('stats: lazy creation', () => {
  it('new players start with stats; old states get them lazily', () => {
    const s = initGame({ id: 'h', name: 'H' }, 1)
    expect(stats(s).netWorthByRound).toEqual([STARTING_WEALTH])
    expect(stats(s).peakNetWorth).toBe(STARTING_WEALTH)

    const old: GameState = { ...s, players: s.players.map(p => ({ ...p, stats: undefined })) }
    const p = ensureStats(old.players[0], old)
    expect(p.stats).toBeDefined()
    expect(p.stats!.netWorthByRound[0]).toBe(STARTING_WEALTH)
    // and the engine fills them on first touch
    const after = processDecision(old, 0, 'save', decision())
    expect(stats(after).saves).toBe(1)
  })
})

describe('stats: decisions', () => {
  it('counts saves / spends / invests, tracks an uncapped save streak, records invested ₹ per asset', () => {
    let s = initGame({ id: 'h', name: 'H' }, 1)
    for (let i = 0; i < 4; i++) s = processDecision(s, 0, 'save', decision())
    expect(stats(s).saves).toBe(4)
    expect(stats(s).maxSaveStreak).toBe(4)
    expect(stats(s).conceptsTriggered).toContain('pay_yourself_first')

    const card = decision('index')
    const pv = previewDecision(s, 0, card, 'invest')
    s = processDecision(s, 0, 'invest', card)
    expect(stats(s).invests).toBe(1)
    expect(stats(s).investedByAsset.index).toBe(pv.investAmount)
    expect(stats(s).currentSaveStreak).toBe(0)
    expect(stats(s).conceptsTriggered).toEqual(expect.arrayContaining(['index_funds', 'sip']))

    s = processDecision(s, 0, 'spend', decision())
    s = processDecision(s, 0, 'spend', decision())
    expect(stats(s).spends).toBe(2)
    expect(stats(s).conceptsTriggered).toContain('lifestyle_creep')
    expect(stats(s).maxSaveStreak).toBe(4)
  })

  it('3+ asset classes held triggers diversification; card text triggers debt / tax concepts', () => {
    let s = initGame({ id: 'h', name: 'H' }, 1)
    for (const a of ['index', 'gold', 'debt'] as AssetClass[]) s = processDecision(s, 0, 'invest', decision(a))
    expect(stats(s).conceptsTriggered).toEqual(expect.arrayContaining(['diversification', 'gold', 'tax_saving']))
    const cc: GameCard = { ...decision(), id: 'cc', name: 'Weekend Trip', flavor: 'Swipe your credit card or take a personal loan?' }
    s = processDecision(s, 0, 'spend', cc)
    expect(stats(s).conceptsTriggered).toEqual(expect.arrayContaining(['credit_card_debt', 'good_vs_bad_debt']))
  })

  it('never lists a concept twice', () => {
    let s = initGame({ id: 'h', name: 'H' }, 1)
    for (let i = 0; i < 3; i++) s = processDecision(s, 0, 'invest', decision('index'))
    const ids = stats(s).conceptsTriggered
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('stats: rounds', () => {
  it('records inflation lost, net worth per round and peak', () => {
    setRng(seededRng(3))
    const s0 = initGame({ id: 'h', name: 'H' }, 1)
    const cash = getCash(s0.players[0])
    const s = startNewRound({ ...s0, eventDeck: [] })
    const st = stats(s)
    expect(st.inflationLost).toBe(Math.round(cash * 0.06))
    expect(st.conceptsTriggered[0]).toBe('inflation')
    expect(st.netWorthByRound).toHaveLength(2)
    expect(st.netWorthByRound[0]).toBe(STARTING_WEALTH)
    expect(st.netWorthByRound[1]).toBe(cash - Math.round(cash * 0.06))
  })

  it('a crash on crypto / scam counts as a speculative loss and teaches crypto risk', () => {
    let s = withPlayer(initGame({ id: 'h', name: 'H' }, 1), 0, { cash: 100000, holdings: [holding('crypto', 200000), holding('index', 100000)] })
    // rng 0 → every asset with a crash chance crashes
    setRng(() => 0)
    s = startNewRound({ ...s, eventDeck: [] })
    const st = stats(s)
    expect(st.speculativeLosses).toBe(Math.round(200000 * ASSETS.crypto.crashPct / 100))
    expect(st.conceptsTriggered).toEqual(expect.arrayContaining(['crypto_risk', 'market_patience', 'asset_risk']))
    expect(st.worstMarketDrop).toEqual({ round: 2, asset: 'crypto', pct: -ASSETS.crypto.crashPct })
  })
})

describe('stats: losses, attacks and defenses', () => {
  it('a hospital bill with no cash forces a sale: forced sale, penalty, loss before penalty, concepts', () => {
    let s = withPlayer(initGame({ id: 'h', name: 'H' }, 1), 0, { cash: 0, holdings: [holding('realestate', 1000000)] })
    s = { ...s, round: 7 }
    setRng(() => 0) // pick player 0
    const before = getNetWorth(s.players[0])
    s = applyLifeEvent(s, lifeEvent('le_hospital_bill')).state
    const st = stats(s)
    const loss = Math.round(before * 0.08)
    expect(st.forcedSales).toBe(1)
    expect(st.exitPenaltiesPaid).toBeGreaterThan(0)
    expect(st.forcedSaleLog![0]).toMatchObject({ asset: 'realestate', round: 7, penaltyPct: 15 })
    expect(st.lossesTaken).toBe(before - getNetWorth(s.players[0]) - st.exitPenaltiesPaid)
    expect(Math.abs(st.lossesTaken - loss)).toBeLessThanOrEqual(2)
    expect(st.attacksTaken).toBe(1)
    expect(st.conceptsTriggered).toEqual(expect.arrayContaining(['health_insurance', 'emergency_fund', 'liquidity', 'real_estate']))
  })

  it('an equipped defense that blocks a life event counts as blocked', () => {
    let s = initGame({ id: 'h', name: 'H' }, 1)
    s = { ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, hand: [healthDefense] } : p)) }
    s = equipDefense(s, 0, healthDefense)
    expect(stats(s).defensesEquipped).toBe(1)
    setRng(() => 0)
    s = applyLifeEvent(s, lifeEvent('le_hospital_bill')).state
    expect(stats(s).attacksBlocked).toBe(1)
    expect(stats(s).attacksTaken).toBe(0)
    expect(stats(s).hits![0]).toMatchObject({ blocked: true, category: 'medical' })
  })

  it('a rival attack counts for the target, not the attacker', () => {
    const s0 = initGame({ id: 'h', name: 'H' }, 1)
    const attack: GameCard = { id: 'atk', name: 'Phishing Link', type: 'action', tier: 'rare', flavor: '', category: 'fraud', effect: { type: 'wealth_pct', value: -10, target: 'target' } }
    const s = processAction(s0, 1, attack, 0)
    expect(stats(s, 0).attacksTaken).toBe(1)
    expect(stats(s, 0).lossesTaken).toBe(Math.round(STARTING_WEALTH * 0.1))
    expect(stats(s, 0).conceptsTriggered).toContain('cyber_safety')
    expect(stats(s, 1).attacksTaken).toBe(0)
  })

  it('a scam lure records the money moved and the scam concept', () => {
    let s = initGame({ id: 'h', name: 'H' }, 1)
    setRng(() => 0)
    s = applyLifeEvent(s, lifeEvent('le_whatsapp_tip')).state // lures pick the bot
    const bot = stats(s, 1)
    expect(bot.investedByAsset.scam).toBe(Math.round(STARTING_WEALTH * 0.2))
    expect(bot.attacksTaken).toBe(1)
    expect(bot.conceptsTriggered).toEqual(expect.arrayContaining(['scams', 'cyber_safety']))
  })
})

describe('stats: a full scripted game', () => {
  it('accumulates consistently and deterministically', () => {
    const a = playGame(balanced, 42)
    const b = playGame(balanced, 42)
    expect(a.state.phase).toBe('game_over')
    const st = stats(a.state)
    expect(stats(b.state)).toEqual(st)
    expect(st.saves + st.spends + st.invests).toBe(a.humanDecisions)
    expect(st.netWorthByRound[0]).toBe(STARTING_WEALTH)
    expect(st.netWorthByRound.length).toBe(13) // start + 12 years
    expect(st.peakNetWorth).toBeGreaterThanOrEqual(Math.max(...st.netWorthByRound))
    expect(st.netWorthByRound[st.netWorthByRound.length - 1]).toBe(getNetWorth(a.state.players[0]))
    expect(st.inflationLost).toBeGreaterThan(0)
    expect(new Set(st.conceptsTriggered).size).toBe(st.conceptsTriggered.length)
    const invested = Object.values(st.investedByAsset).reduce((x, y) => x + (y ?? 0), 0)
    expect(invested).toBeGreaterThan(0)
    // every player (bots too) has stats
    a.state.players.forEach(p => expect(p.stats!.netWorthByRound.length).toBe(13))
  })
})

describe('report card', () => {
  const saveGame = playGame(alwaysSave, 7)
  const balancedGame = playGame(balanced, 7)
  const scamGame = playGame(scamChaser, 7)
  const card = (g: { state: GameState }) => buildReportCard(g.state, 'human')
  const gradeOf = (c: ReturnType<typeof buildReportCard>, area: string) => c.grades.find(g => g.area === area)!.grade

  it('is pure and deterministic', () => {
    expect(card(balancedGame)).toEqual(card(balancedGame))
  })

  it('reacts to behaviour: saver, balanced and scam-chaser get different personas and grades', () => {
    const save = card(saveGame)
    const bal = card(balancedGame)
    const scam = card(scamGame)
    expect(save.personaId).toBe('inflation_favourite')
    expect(scam.personaId).toBe('thrill_seeker')
    expect(['steady_builder', 'emergency_pro', 'growth_hunter']).toContain(bal.personaId)
    expect(new Set([save.personaTitle, bal.personaTitle, scam.personaTitle]).size).toBe(3)

    expect(gradeOf(save, 'saving')).toBe('A')
    expect(gradeOf(save, 'investing')).toBe('D')
    expect(['A', 'B']).toContain(gradeOf(bal, 'investing'))
    expect(['C', 'D']).toContain(gradeOf(scam, 'investing'))
    expect(['C', 'D']).toContain(gradeOf(scam, 'risk'))
    expect(gradeOf(bal, 'risk') < gradeOf(scam, 'risk')).toBe(true) // 'A' < 'C' alphabetically = better

    for (const c of [save, bal, scam]) {
      expect(c.grades.map(g => g.area)).toEqual(['saving', 'investing', 'risk', 'emergency', 'protection'])
      c.grades.forEach(g => {
        expect(g.reason.length).toBeGreaterThan(10)
        expect(g.reasonHi.length).toBeGreaterThan(10)
      })
      expect(c.headline).toBeTruthy()
      expect(c.headlineHi).toBeTruthy()
      expect(c.conceptsUnlocked).toEqual(c.conceptsUnlocked.filter((x, i, arr) => arr.indexOf(x) === i))
    }
    // reasons quote the player's real numbers
    expect(save.grades[1].reason).toContain(`₹${saveGame.state.players[0].stats!.inflationLost.toLocaleString('en-IN')}`)
  })

  it('projection matches a hand-calculated monthly SIP future value', () => {
    // ₹5,000/month, 10 years, instalment at the start of each month
    const fv = (rate: number) => {
      const i = rate / 12
      return 5000 * ((Math.pow(1 + i, 120) - 1) / i) * (1 + i)
    }
    expect(sipFutureValue(5000, 12, 10)).toBe(Math.round(fv(0.12))) // ≈ ₹11,61,695
    expect(sipFutureValue(5000, 12, 10)).toBe(1161695)
    expect(sipFutureValue(5000, 7, 10)).toBe(870472)
    expect(sipFutureValue(5000, 0, 10)).toBe(600000)

    const p = card(balancedGame).projection
    expect(p).toMatchObject({ years: 10, monthlyAmount: 5000, fdValue: 870472, indexValue: 1161695 })
    expect(p.yourMixValue).toBeGreaterThan(p.fdValue * 0.9)
    expect(p.explanation).toContain('₹')
    expect(p.explanationHi).toContain('₹')

    // Always-save: cash in a savings account at 3%
    expect(card(saveGame).projection.yourMixValue).toBe(sipFutureValue(5000, 3, 10))
    // Scam-chaser: −80% assumption leaves a fraction of the ₹6 lakh
    expect(card(scamGame).projection.yourMixValue).toBeLessThan(150000)
  })

  it('a pure index mix projects exactly to the index value', () => {
    const s = initGame({ id: 'h', name: 'H' }, 1)
    const st = { ...emptyStats(STARTING_WEALTH), invests: 1, investedByAsset: { index: 100000 } }
    const c = buildReportCard({ ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, stats: st } : p)) }, 'h')
    expect(c.projection.yourMixValue).toBe(c.projection.indexValue)
  })

  it('emergency grade is capped at C when most of the money was lost, even without forced sales', () => {
    // The scam-chaser never sells in a hurry, but loses most of their money
    expect(['C', 'D']).toContain(gradeOf(card(scamGame), 'emergency'))

    const s = initGame({ id: 'h', name: 'H' }, 1)
    const st = { ...emptyStats(STARTING_WEALTH), invests: 2, investedByAsset: { scam: STARTING_WEALTH * 0.5 }, speculativeLosses: STARTING_WEALTH * 0.45 }
    const c = buildReportCard({ ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, stats: st } : p)) }, 'h')
    const g = c.grades.find(x => x.area === 'emergency')!
    expect(g.grade).toBe('C')
    expect(g.reason).toContain('45%')
    expect(g.reasonHi).toContain('45%')
    expect(c.personaId).not.toBe('emergency_pro')

    // Small losses keep the A
    const ok = { ...emptyStats(STARTING_WEALTH), speculativeLosses: STARTING_WEALTH * 0.1 }
    const c2 = buildReportCard({ ...s, players: s.players.map((p, i) => (i === 0 ? { ...p, stats: ok } : p)) }, 'h')
    expect(c2.grades.find(x => x.area === 'emergency')!.grade).toBe('A')
  })

  it('lessons: at most 3, tied to concepts, and quote real events', () => {
    for (const g of [saveGame, balancedGame, scamGame]) {
      const c = card(g)
      expect(c.lessons.length).toBeGreaterThan(0)
      expect(c.lessons.length).toBeLessThanOrEqual(3)
      c.lessons.forEach(l => {
        expect(ALL_CONCEPT_IDS).toContain(l.conceptId)
        expect(l.text).toBeTruthy()
        expect(l.textHi).toBeTruthy()
      })
    }
    expect(card(saveGame).lessons[0].conceptId).toBe('inflation')
    expect(card(scamGame).lessons.map(l => l.conceptId)).toContain('scams')

    // A forced sale of property in Year 7 becomes the top lesson, with the real numbers
    let s = withPlayer(initGame({ id: 'h', name: 'H' }, 1), 0, { cash: 0, holdings: [holding('realestate', 1000000)] })
    s = { ...s, round: 7 }
    setRng(() => 0)
    s = applyLifeEvent(s, lifeEvent('le_hospital_bill')).state
    const c = buildReportCard(s, 'h')
    expect(c.lessons[0].conceptId).toBe('emergency_fund')
    expect(c.lessons[0].text).toContain('Property at a 15% penalty in Year 7')
    expect(c.lessons[0].textHi).toContain('साल 7')
    expect(c.lessons.map(l => l.conceptId)).toContain('health_insurance')
    expect(gradeOf(c, 'emergency')).not.toBe('A')
  })

  it('falls back to a generic lesson when nothing notable happened', () => {
    const s = initGame({ id: 'h', name: 'H' }, 1)
    const c = buildReportCard(s, 'h')
    expect(c.lessons.length).toBeGreaterThanOrEqual(1)
    expect(c.lessons.some(l => l.conceptId === 'compounding')).toBe(true)
  })

  it('works for an old state without stats', () => {
    const s = initGame({ id: 'h', name: 'H' }, 1)
    const old: GameState = { ...s, players: s.players.map(p => ({ ...p, stats: undefined })) }
    const c = buildReportCard(old, 'h')
    expect(c.grades).toHaveLength(5)
    expect(c.lessons.length).toBeLessThanOrEqual(3)
  })
})

describe('concept catalog', () => {
  it('has a complete entry for every ConceptId', () => {
    const fields = ['emoji', 'title', 'titleHi', 'oneLiner', 'oneLinerHi', 'explanation', 'explanationHi', 'example', 'exampleHi', 'actionTip', 'actionTipHi'] as const
    expect(ALL_CONCEPT_IDS).toHaveLength(22)
    expect(Object.keys(CONCEPTS).sort()).toEqual([...ALL_CONCEPT_IDS].sort())
    for (const id of ALL_CONCEPT_IDS as ConceptId[]) {
      const c = CONCEPTS[id]
      expect(c.id).toBe(id)
      for (const f of fields) expect(c[f].trim().length, `${id}.${f}`).toBeGreaterThan(0)
      // Hindi fields are actually in Devanagari
      for (const f of ['titleHi', 'oneLinerHi', 'explanationHi', 'exampleHi', 'actionTipHi'] as const) {
        expect(/[ऀ-ॿ]/.test(c[f]), `${id}.${f}`).toBe(true)
      }
      expect(c.example).toMatch(/₹/)
    }
  })
})
