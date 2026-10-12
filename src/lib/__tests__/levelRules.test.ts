import { describe, it, expect, afterEach } from 'vitest'
import {
  initGame, initLevelGame, processDecision, previewDecision, startNewRound, startDrawPhase, checkWinCondition,
  getNetWorth, getCash, getHoldings, setRng, seededRng,
} from '../gameEngine'
import { syncWealth } from '../economy'
import {
  applyLevelRoundStart, computeLevelStars, createLevelState, levelStarCriteria, readyMoney, RULE_TUNING,
} from '../levelRules'
import { ARTHA_YATRA_LEVELS } from '../../data/levels'
import { ALL_CARDS } from '../../data/cards'
import en from '../../i18n/locales/en.json'
import type { GameCard, GameState, Holding, PlayerState } from '../../types/game'
import type { LevelState } from '../../types/level'

const LEVEL = (n: number) => ARTHA_YATRA_LEVELS[n - 1]

function game(n: number): GameState {
  return initLevelGame({ id: 'human', name: 'Human' }, LEVEL(n))
}

function withPlayer(state: GameState, index: number, patch: Partial<PlayerState>): GameState {
  return { ...state, players: state.players.map((p, i) => (i === index ? syncWealth({ ...p, ...patch }) : p)) }
}

function withLevel(state: GameState, patch: Partial<LevelState>): GameState {
  return { ...state, levelState: { ...state.levelState!, ...patch } }
}

function holding(asset: Holding['asset'], value: number): Holding {
  return { id: `h_${asset}`, asset, name: asset, principal: value, value, boughtRound: 1, lastChangePct: 0 }
}

const card = (asset: Holding['asset'] = 'index'): GameCard => ({
  id: 'test_dec', name: 'Test Decision', type: 'decision', tier: 'common', flavor: '',
  options: [
    { type: 'spend', label: 'Spend', description: '', effect: { type: 'wealth_pct', value: -10, target: 'self' } },
    { type: 'save', label: 'Save', description: '', effect: { type: 'wealth_pct', value: 5, target: 'self' } },
    { type: 'invest', label: 'Invest', description: '', asset, effect: { type: 'wealth_pct', value: 20, target: 'self' } },
  ],
})

/** Resolve "campaign.x.y" in the English locale. */
function hasKey(key: string): boolean {
  let node: unknown = en
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object') return false
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string'
}

afterEach(() => setRng())

describe('level setup', () => {
  it('every campaign level has a rule and its rule block', () => {
    expect(game(1).levelState?.desire?.value).toBe(0)
    expect(game(2).levelState?.streak?.current).toBe(0)
    expect(game(3).levelState?.creep?.slots).toBe(RULE_TUNING.creep.slots)
    expect(game(4).levelState?.family?.goals.map(g => g.id)).toEqual(['home', 'education', 'parents_health'])
  })

  it('non-campaign games have no level state (rules never run)', () => {
    const s = initGame({ id: 'human', name: 'Human' }, 2)
    expect(s.levelState).toBeUndefined()
    expect(applyLevelRoundStart(s).playerIndex).toBe(-1)
  })

  it('level configs without a rule get the legacy level state only', () => {
    const ls = createLevelState({ ...LEVEL(1), id: 'level_99', rule: undefined })
    expect(ls.rule).toBeUndefined()
    expect(ls.desire).toBeUndefined()
  })

  it('in a campaign only the human can win by reaching the target', () => {
    let s = game(2)
    s = withPlayer(s, 1, { cash: LEVEL(2).targetCorpus * 2 })
    expect(checkWinCondition(s).phase).not.toBe('game_over')
    s = withPlayer(s, 0, { cash: LEVEL(2).targetCorpus })
    const done = checkWinCondition(s)
    expect(done.phase).toBe('game_over')
    expect(done.winner?.id).toBe('human')
  })
})

describe('L1 Desire Meter', () => {
  it('resisting (save / invest) fills the meter; bots are not affected', () => {
    let s = game(1)
    s = processDecision(s, 0, 'save', card())
    expect(s.levelState!.desire!.value).toBe(RULE_TUNING.desire.resistRise)
    s = processDecision(s, 0, 'invest', card())
    expect(s.levelState!.desire!.value).toBe(2 * RULE_TUNING.desire.resistRise)
    s = processDecision(s, 1, 'save', card())
    expect(s.levelState!.desire!.value).toBe(2 * RULE_TUNING.desire.resistRise)
  })

  it('wants build up every year', () => {
    const s = applyLevelRoundStart({ ...game(1), round: 2 }).state
    expect(s.levelState!.desire!.value).toBe(RULE_TUNING.desire.yearlyRise)
  })

  it('a Spend when the meter is high is a planned treat: meter to 0, no lifestyle creep', () => {
    let s = withLevel(game(1), { desire: { ...game(1).levelState!.desire!, value: 60 } })
    s = processDecision(s, 0, 'spend', card())
    expect(s.levelState!.desire!.value).toBe(0)
    expect(s.levelState!.desire!.plannedTreats).toBe(1)
    expect(s.players[0].lifestyleLevel).toBe(0)
    expect(s.levelState!.ruleEvents![0].kind).toBe('planned_treat')
  })

  it('a Spend on a whim only lowers the meter a little and still creeps lifestyle', () => {
    let s = withLevel(game(1), { desire: { ...game(1).levelState!.desire!, value: 40 } })
    s = processDecision(s, 0, 'spend', card())
    expect(s.levelState!.desire!.value).toBe(40 - RULE_TUNING.desire.whimDrop)
    expect(s.levelState!.desire!.plannedTreats).toBe(0)
    expect(s.players[0].lifestyleLevel).toBe(1)
  })

  it('a maxed meter forces an impulse splurge at the next year', () => {
    let s = withLevel({ ...game(1), round: 5 }, { desire: { ...game(1).levelState!.desire!, value: 90 } })
    const before = getNetWorth(s.players[0])
    s = applyLevelRoundStart(s).state
    const d = s.levelState!.desire!
    expect(d.impulseSplurges).toBe(1)
    expect(d.value).toBe(RULE_TUNING.desire.afterImpulse)
    expect(getNetWorth(s.players[0])).toBe(Math.round(before * (1 - RULE_TUNING.desire.impulsePct / 100)))
    expect(s.players[0].lifestyleLevel).toBe(1)
    expect(s.levelState!.ruleEvents![0].kind).toBe('impulse_splurge')
  })
})

describe('L2 Saving Streak', () => {
  it('save and invest grow the streak, a spend breaks it', () => {
    let s = game(2)
    s = processDecision(s, 0, 'save', card())
    s = processDecision(s, 0, 'invest', card())
    expect(s.levelState!.streak!.current).toBe(2)
    expect(s.levelState!.streak!.best).toBe(2)
    s = processDecision(s, 0, 'spend', card())
    expect(s.levelState!.streak!.current).toBe(0)
    expect(s.levelState!.streak!.best).toBe(2)
    expect(s.levelState!.streak!.breaks).toBe(1)
    expect(s.levelState!.ruleEvents![0].kind).toBe('streak_broken')
  })

  it('the yearly Auto-SIP grows with the streak (capped) and goes into the index fund', () => {
    const base = game(2)
    const st = base.levelState!.streak!
    const run = (current: number) => {
      const s = applyLevelRoundStart(withLevel({ ...base, round: 3 }, { streak: { ...st, current } })).state
      const idx = getHoldings(s.players[0]).find(h => h.asset === 'index')
      return { sip: idx?.value ?? 0, nw: getNetWorth(s.players[0]), cash: getCash(s.players[0]) }
    }
    expect(run(0).sip).toBe(0)
    expect(run(3).sip).toBe(3 * st.sipStep)
    expect(run(9).sip).toBe(st.cap * st.sipStep)
    expect(run(3).nw).toBe(LEVEL(2).startingCorpus + 3 * st.sipStep)
    expect(run(3).cash).toBe(LEVEL(2).startingCorpus)
  })
})

describe('L3 Lifestyle Creep & slots', () => {
  it('a raise every year, lifestyle creeps with it, the rest lands in cash', () => {
    const s0 = { ...game(3), round: 2 }
    const c = s0.levelState!.creep!
    const s = applyLevelRoundStart(s0).state
    const salary = Math.round(c.salary * 1.1)
    const pct = c.lifestylePct + c.creepPerYear
    expect(s.levelState!.creep!.salary).toBe(salary)
    expect(s.levelState!.creep!.lifestylePct).toBe(pct)
    expect(getCash(s.players[0])).toBe(LEVEL(3).startingCorpus + Math.round(salary * (1 - pct / 100)))
  })

  it('lifestyle above 100% of salary costs money', () => {
    const s0 = withLevel({ ...game(3), round: 2 }, { creep: { ...game(3).levelState!.creep!, lifestylePct: 120 } })
    const s = applyLevelRoundStart(s0).state
    expect(getNetWorth(s.players[0])).toBeLessThan(LEVEL(3).startingCorpus)
  })

  it('spend creeps lifestyle up, save (budget review) brings it down to a floor', () => {
    let s = processDecision(game(3), 0, 'spend', card())
    const start = RULE_TUNING.creep.startLifestylePct
    expect(s.levelState!.creep!.lifestylePct).toBe(start + RULE_TUNING.creep.spendCreep)
    s = processDecision(s, 0, 'save', card())
    s = processDecision(s, 0, 'save', card())
    s = processDecision(s, 0, 'save', card())
    expect(s.levelState!.creep!.lifestylePct).toBe(RULE_TUNING.creep.minLifestylePct)
  })

  it('only 3 different investments: a 4th asset is refused, adding to a held one is fine', () => {
    const full = withPlayer(game(3), 0, { cash: 500000, holdings: [holding('index', 1), holding('equity', 1), holding('debt', 1)].map(h => ({ ...h, value: 100000, principal: 100000 })) })
    expect(previewDecision(full, 0, card('gold'), 'invest').disabled).toMatch(/slots/)
    const refused = processDecision(full, 0, 'invest', card('gold'))
    expect(getHoldings(refused.players[0])).toHaveLength(3)
    expect(getCash(refused.players[0])).toBe(500000)
    expect(refused.levelState!.creep!.blockedInvests).toBe(1)
    expect(previewDecision(full, 0, card('index'), 'invest').disabled).toBeUndefined()
    const added = processDecision(full, 0, 'invest', card('index'))
    expect(getHoldings(added.players[0]).find(h => h.asset === 'index')!.value).toBeGreaterThan(100000)
    // bots play normal BHAO
    const botFull = withPlayer(full, 1, { holdings: full.players[0].holdings })
    expect(previewDecision(botFull, 1, card('gold'), 'invest').disabled).toBeUndefined()
  })
})

describe('L4 Grihastha', () => {
  const goalsAt = (s: GameState) => s.levelState!.family!.goals

  it('the learner starts with health insurance in the opening hand', () => {
    setRng(seededRng(3))
    const s = startDrawPhase(game(4), 0).state
    expect(s.players[0].hand.some(c => c.type === 'defense' && c.blocksCategories?.includes('medical'))).toBe(true)
  })

  it('a goal paid from cash / FD is met; the down payment becomes the family home', () => {
    const home = goalsAt(game(4))[0]
    let s = withPlayer({ ...game(4), round: home.dueRound }, 0, { cash: home.amount / 2, holdings: [holding('fd', home.amount), holding('index', 500000)] })
    const nw = getNetWorth(s.players[0])
    const r = applyLevelRoundStart(s)
    s = r.state
    expect(goalsAt(s)[0].status).toBe('met')
    expect(r.forcedSales).toHaveLength(0)
    expect(getNetWorth(s.players[0])).toBe(nw)
    expect(getHoldings(s.players[0]).find(h => h.asset === 'realestate')?.value).toBe(home.amount)
    expect(getHoldings(s.players[0]).find(h => h.asset === 'index')?.value).toBe(500000)
    expect(readyMoney(s.players[0])).toBe(home.amount / 2)
  })

  it('a goal without ready money forces sales and costs a rush premium', () => {
    const edu = goalsAt(game(4))[1]
    const s0 = withPlayer({ ...game(4), round: edu.dueRound }, 0, { cash: 0, holdings: [holding('index', edu.amount * 3)] })
    const r = applyLevelRoundStart(s0)
    expect(goalsAt(r.state)[1].status).toBe('strained')
    expect(r.forcedSales.length).toBeGreaterThan(0)
    const lost = getNetWorth(s0.players[0]) - getNetWorth(r.state.players[0])
    expect(lost).toBeGreaterThan(edu.amount * (1 + RULE_TUNING.grihastha.rushPct / 100) - 1)
  })

  it('the forced sales show up in the learner\'s stats through the round hook', () => {
    setRng(() => 0.99) // no life event, no crash
    const edu = goalsAt(game(4))[1]
    const s0 = withPlayer({ ...game(4), round: edu.dueRound - 1, currentPlayerIndex: 2 }, 0, { cash: 0, holdings: [holding('index', edu.amount * 3)] })
    const s = startNewRound(s0)
    expect(goalsAt(s)[1].status).toBe('strained')
    expect(s.players[0].stats!.forcedSales).toBeGreaterThan(0)
  })

  it('boss: health insurance pays most of the parents\' hospital bill', () => {
    const boss = goalsAt(game(4))[2]
    const ins = ALL_CARDS.find(c => c.type === 'defense' && c.blocksCategories?.length === 1 && c.blocksCategories[0] === 'medical')!
    const base = withPlayer({ ...game(4), round: boss.dueRound }, 0, { cash: 2000000 })
    const insured = applyLevelRoundStart(withPlayer(base, 0, { activeDefenses: [ins] })).state
    const uninsured = applyLevelRoundStart(base).state
    const bill = 2000000 * RULE_TUNING.grihastha.bossPct / 100
    expect(getNetWorth(uninsured.players[0])).toBe(2000000 - bill)
    expect(getNetWorth(insured.players[0])).toBe(2000000 - bill * RULE_TUNING.grihastha.insuredShare)
    expect(goalsAt(insured)[2].status).toBe('met')
    expect(goalsAt(uninsured)[2].status).toBe('strained')
    expect(insured.levelState!.family!.insuredAtBoss).toBe(true)
    expect(insured.players[0].activeDefenses).toHaveLength(1)
  })

  it('warns two years and one year before a goal', () => {
    const home = goalsAt(game(4))[0]
    const r = applyLevelRoundStart({ ...game(4), round: home.dueRound - 2 })
    expect(r.state.levelState!.ruleEvents![0].kind).toBe('goal_due_soon')
    expect(r.lines.join(' ')).toMatch(/In 2 years/)
  })
})

describe('stars', () => {
  function finished(n: number, patch: Partial<LevelState> = {}, player: Partial<PlayerState> = {}): GameState {
    let s = withLevel(game(n), patch)
    s = withPlayer(s, 0, { cash: LEVEL(n).targetCorpus * 0.3, holdings: [holding('index', LEVEL(n).targetCorpus * 0.8)], ...player })
    return { ...s, phase: 'game_over', winner: s.players[0] }
  }

  it('no target, no stars — even with the habit', () => {
    const s = withLevel(game(2), { streak: { ...game(2).levelState!.streak!, best: 9 } })
    const r = computeLevelStars(s, 'human')
    expect(r.stars).toBe(0)
    expect(r.criteria.map(c => c.met)).toEqual([false, true, expect.any(Boolean)])
  })

  it('1★ target, +1★ habit, +1★ clean finish', () => {
    const l2 = game(2).levelState!.streak!
    expect(computeLevelStars(finished(2), 'human').criteria[0].met).toBe(true)
    expect(computeLevelStars(finished(2), 'human').criteria[1].met).toBe(false)
    const habit = finished(2, { streak: { ...l2, best: RULE_TUNING.stars.streakBest } })
    expect(computeLevelStars(habit, 'human').criteria[1].met).toBe(true)
    const dirty = finished(2, { streak: { ...l2, best: RULE_TUNING.stars.streakBest } }, {
      stats: { ...habit.players[0].stats!, forcedSales: 2 },
    })
    const r = computeLevelStars(dirty, 'human')
    expect(r.criteria[2].met).toBe(false)
    expect(r.stars).toBe(2)
  })

  it('habit criteria per level', () => {
    const d = game(1).levelState!.desire!
    expect(computeLevelStars(finished(1, { desire: { ...d, plannedTreats: 1 } }), 'human').criteria[1].met).toBe(true)
    expect(computeLevelStars(finished(1, { desire: { ...d, plannedTreats: 1, impulseSplurges: 1 } }), 'human').criteria[1].met).toBe(false)
    expect(computeLevelStars(finished(1, { desire: { ...d, plannedTreats: 0 } }), 'human').criteria[1].met).toBe(false)
    const c = game(3).levelState!.creep!
    expect(computeLevelStars(finished(3, { creep: { ...c, lifestylePct: 60 } }), 'human').criteria[1].met).toBe(true)
    expect(computeLevelStars(finished(3, { creep: { ...c, lifestylePct: 75 } }), 'human').criteria[1].met).toBe(false)
    const f = game(4).levelState!.family!
    const allMet = { ...f, goals: f.goals.map(g => ({ ...g, status: 'met' as const })) }
    expect(computeLevelStars(finished(4, { family: allMet }), 'human').criteria[1].met).toBe(true)
    const oneStrained = { ...f, goals: allMet.goals.map((g, i) => (i === 1 ? { ...g, status: 'strained' as const } : g)) }
    expect(computeLevelStars(finished(4, { family: oneStrained }), 'human').criteria[1].met).toBe(false)
  })

  it('a lost game (a bot was declared winner) earns no stars', () => {
    const s = { ...finished(1), winner: game(1).players[1] }
    expect(computeLevelStars(s, 'human').stars).toBe(0)
  })

  it('every criterion has EN + HI labels and an i18n key that exists', () => {
    for (const level of ARTHA_YATRA_LEVELS) {
      const crit = levelStarCriteria(level)
      expect(crit).toHaveLength(3)
      for (const c of crit) {
        expect(c.label.length).toBeGreaterThan(5)
        expect(c.labelHi).toMatch(/[ऀ-ॿ]/)
        expect(hasKey(c.labelKey), c.labelKey).toBe(true)
      }
    }
  })

  it('every rule event key used by the engine exists in the locale', () => {
    const keys = [
      'impulse_splurge', 'planned_treat', 'desire_warning', 'auto_sip', 'streak_broken', 'salary', 'slots_full',
      'goal_met_home', 'goal_met_education', 'goal_strained_home', 'goal_strained_education',
      'due_soon_home', 'due_soon_education', 'due_soon_parents_health', 'boss_insured', 'boss_uninsured',
    ]
    for (const k of keys) expect(hasKey(`campaign.events.${k}`), k).toBe(true)
    for (const rule of ['desire_meter', 'saving_streak', 'lifestyle_creep', 'grihastha']) {
      for (const k of ['name', 'idea', 'how1', 'how2', 'how3']) expect(hasKey(`campaign.rules.${rule}.${k}`)).toBe(true)
    }
  })
})
