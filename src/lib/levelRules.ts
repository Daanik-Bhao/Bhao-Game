/**
 * Phase 5 Track N — campaign level rules (docs/phase5-design.md).
 *
 * One signature mechanic per level, each teaching ONE idea, on top of the Phase 3
 * cash / holdings / rounds economy. The engine calls these hooks only when
 * `state.levelConfig` names a level with a rule, so quick / ranked / multiplayer /
 * tutorial games are untouched. Rules apply to the human player (the learner);
 * bots are rivals that play normal BHAO.
 *
 *  L1 Desire Meter   — wants build up every year and every time you resist; spend on a
 *                      planned treat when the meter is high, or at 100 you splurge on impulse.
 *  L2 Saving Streak  — pay yourself first: every Save/Invest grows a yearly Auto-SIP into your
 *                      index fund; one Spend breaks the streak and the bonus.
 *  L3 Lifestyle Creep — your salary rises every year but your lifestyle eats a bigger share;
 *                      only 3 investment slots, so pick quality assets.
 *  L4 Grihastha      — family goals fall due in fixed years (home, education); keep cash ready,
 *                      and keep health insurance for the parents' hospital bill (the boss).
 *
 * Pure: no browser APIs, randomness only via the engine's rand() (unused here).
 */
import type { AssetClass, DecisionChoice, DecisionOption, GameCard, GameState, PlayerState } from '../types/game'
import type {
  FamilyGoal, FamilyGoalId, LevelConfig, LevelRuleEvent, LevelRuleId, LevelState,
} from '../types/level'
import type { Grade } from '../types/learning'
import { MAX_LIFESTYLE_LEVEL, inferAsset } from '../data/assets'
import { addCash, addHolding, applyLoss, formatINR, getCash, getHoldings, getNetWorth, shuffle } from './economy'
import type { ForcedSale } from './economy'
import { buildReportCard } from './learning'

// ---------------------------------------------------------------------------
// Tuning (balance: docs/phase5-design.md "Track N results")
// ---------------------------------------------------------------------------

export const LEVEL_RULE_BY_ID: Record<string, LevelRuleId> = {
  level_1: 'desire_meter',
  level_2: 'saving_streak',
  level_3: 'lifestyle_creep',
  level_4: 'grihastha',
}

export const RULE_TUNING = {
  desire: {
    max: 100,
    plannedThreshold: 50,
    yearlyRise: 20,
    resistRise: 10,
    /** A whim (Spend below the planned threshold) only lowers the meter this much */
    whimDrop: 30,
    /** Impulse splurge: % of net worth lost, meter falls back to this */
    impulsePct: 15,
    afterImpulse: 40,
  },
  streak: {
    cap: 5,
    /** Auto-SIP per streak level, as a share of the starting corpus */
    sipStepShare: 0.02,
  },
  creep: {
    /** Yearly take-home salary as a share of the starting corpus */
    salaryShare: 0.12,
    raisePct: 10,
    startLifestylePct: 45,
    creepPerYear: 5,
    spendCreep: 12,
    saveCut: 10,
    minLifestylePct: 30,
    slots: 3,
  },
  grihastha: {
    /** [goal, due year, amount as share of starting corpus] */
    goals: [
      ['home', 4, 0.25],
      ['education', 7, 0.2],
      ['parents_health', 9, 0],
    ] as [FamilyGoalId, number, number][],
    /** Parents' hospital bill, % of net worth */
    bossPct: 20,
    insuredShare: 0.2,
    /** Goal due without enough cash: extra cost on the shortfall, % (rushed sale / stop-gap loan) */
    rushPct: 20,
    /** Health-insurance cards added to the level deck so cover is always findable */
    extraInsuranceCards: 3,
  },
  stars: {
    /** L2 habit: best streak at least this long */
    streakBest: 6,
    /** L3 habit: lifestyle share of salary at or below this at the end */
    lifestyleMaxPct: 60,
    /** Report-card average (A=4 … D=1) needed for the 3rd star */
    reportAverage: 3,
  },
}

const MAX_RULE_EVENTS = 10
/** L4: goals are announced this many years ahead */
const GOAL_WARNING_YEARS = 2

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export function getLevelRule(level: Pick<LevelConfig, 'id' | 'rule'> | null | undefined): LevelRuleId | null {
  if (!level) return null
  return level.rule ?? LEVEL_RULE_BY_ID[level.id] ?? null
}

/** Rule of a running game (null for non-campaign games and old saves without rule state). */
export function activeRule(state: GameState): LevelRuleId | null {
  if (!state.levelConfig || !state.levelState) return null
  return state.levelState.rule ?? null
}

/** Initial level state, including the rule block for this level. */
export function createLevelState(level: LevelConfig): LevelState {
  const rule = getLevelRule(level)
  const base: LevelState = {
    currentLevelId: level.id,
    savingStreak: 0,
    lifestyleCreep: 0,
    investmentSlots: 0,
    activeInvestments: [],
    bossTriggered: false,
    starsEarned: 0,
    ruleEvents: [],
  }
  if (!rule) return base
  const T = RULE_TUNING
  switch (rule) {
    case 'desire_meter':
      return {
        ...base, rule,
        desire: {
          value: 0, max: T.desire.max, plannedThreshold: T.desire.plannedThreshold,
          yearlyRise: T.desire.yearlyRise, resistRise: T.desire.resistRise,
          plannedTreats: 0, impulseSplurges: 0, impulseLost: 0,
        },
      }
    case 'saving_streak':
      return {
        ...base, rule,
        streak: {
          current: 0, best: 0, cap: T.streak.cap,
          sipStep: Math.round(level.startingCorpus * T.streak.sipStepShare), breaks: 0, autoSipTotal: 0,
        },
      }
    case 'lifestyle_creep':
      return {
        ...base, rule,
        investmentSlots: T.creep.slots,
        creep: {
          salary: Math.round(level.startingCorpus * T.creep.salaryShare),
          raisePct: T.creep.raisePct,
          lifestylePct: T.creep.startLifestylePct,
          creepPerYear: T.creep.creepPerYear,
          spendCreep: T.creep.spendCreep,
          saveCut: T.creep.saveCut,
          minLifestylePct: T.creep.minLifestylePct,
          slots: T.creep.slots,
          peakLifestylePct: T.creep.startLifestylePct,
          savedFromSalary: 0,
          blockedInvests: 0,
        },
      }
    case 'grihastha':
      return {
        ...base, rule,
        family: {
          goals: T.grihastha.goals.map(([id, dueRound, share]): FamilyGoal => ({
            id, dueRound, amount: Math.round(level.startingCorpus * share), status: 'pending',
          })),
          bossPct: T.grihastha.bossPct,
          insuredShare: T.grihastha.insuredShare,
          rushPct: T.grihastha.rushPct,
          insuredAtBoss: null,
        },
      }
  }
}

/** Extra cards a level adds to its draw deck (L4: health insurance, so cover is findable). */
export function levelExtraCards(level: LevelConfig, defensePool: GameCard[]): GameCard[] {
  if (getLevelRule(level) !== 'grihastha') return []
  const ins = defensePool.find(c => c.blocksCategories?.length === 1 && c.blocksCategories[0] === 'medical')
  if (!ins) return []
  return Array.from({ length: RULE_TUNING.grihastha.extraInsuranceCards }, (_, i) => ({ ...ins, id: `${ins.id}_l4_${i}` }))
}

/**
 * The level's draw deck with its extra cards. L4: the first insurance card goes on top so the
 * learner (who draws first) starts with health cover in hand; the rest are shuffled in.
 * Levels without extras get the deck back unchanged (no rng used).
 */
export function withLevelExtras(deck: GameCard[], level: LevelConfig, defensePool: GameCard[]): GameCard[] {
  const extras = levelExtraCards(level, defensePool)
  if (!extras.length) return deck
  const [opening, ...rest] = extras
  return [opening, ...shuffle([...deck, ...rest])]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export interface LevelRuleResult {
  state: GameState
  /** Log / "Year N" news lines */
  lines: string[]
  /** Forced sales the rule caused for the human (the engine records them in stats) */
  forcedSales: ForcedSale[]
  /** Index of the player the rule acted on (-1 if none) */
  playerIndex: number
}

/** The learner: the first non-bot player. */
export function ruleHumanIndex(state: GameState): number {
  return state.players.findIndex(p => !p.isBot && !p.hasForfeited)
}

function pushEvent(ls: LevelState, ev: LevelRuleEvent): LevelState {
  return { ...ls, ruleEvents: [ev, ...(ls.ruleEvents ?? [])].slice(0, MAX_RULE_EVENTS) }
}

function setPlayer(state: GameState, idx: number, p: PlayerState): GameState {
  return { ...state, players: state.players.map((x, i) => (i === idx ? p : x)) }
}

function optionAsset(option: DecisionOption): AssetClass {
  return option.asset ?? inferAsset(option.investRisk)
}

/** Distinct investments (asset classes) the player holds — each uses one L3 slot. */
export function slotsUsed(player: PlayerState): AssetClass[] {
  return [...new Set(getHoldings(player).map(h => h.asset))]
}

/** Assets that count as "ready money" for a family goal (besides cash): safe and liquid. */
export const GOAL_SAFE_ASSETS: AssetClass[] = ['fd', 'debt']

/** Cash + FD + debt funds: money you can use for a goal without selling risky assets in a hurry. */
export function readyMoney(player: PlayerState): number {
  return getCash(player) + getHoldings(player).filter(h => GOAL_SAFE_ASSETS.includes(h.asset)).reduce((s, h) => s + h.value, 0)
}

/** Take up to `amount` from cash, then FD, then debt funds (planned withdrawal: no penalty). */
function withdrawSafe(player: PlayerState, amount: number): PlayerState {
  let left = amount
  const cash = getCash(player)
  const fromCash = Math.min(cash, left)
  left -= fromCash
  const take: Record<string, number> = {}
  for (const asset of GOAL_SAFE_ASSETS) {
    for (const h of getHoldings(player)) {
      if (h.asset !== asset || left <= 0) continue
      take[h.id] = Math.min(h.value, left)
      left -= take[h.id]
    }
  }
  const holdings = getHoldings(player)
    .map(h => (take[h.id] ? { ...h, value: h.value - take[h.id], principal: Math.max(0, h.principal - take[h.id]) } : h))
    .filter(h => h.value > 0)
  return addCash({ ...player, cash: cash - fromCash, holdings }, 0)
}

export function hasHealthCover(player: PlayerState): boolean {
  return player.activeDefenses.some(d => d.type === 'defense' && !!d.blocksCategories?.includes('medical'))
}

const GOAL_NAMES: Record<FamilyGoalId, { en: string; hi: string }> = {
  home: { en: 'Home down payment', hi: 'घर का डाउन पेमेंट' },
  education: { en: "Kids' education fund", hi: 'बच्चों की पढ़ाई का फंड' },
  parents_health: { en: "Parents' health", hi: 'माता-पिता का स्वास्थ्य' },
}

export function familyGoalName(id: FamilyGoalId, hindi = false): string {
  return hindi ? GOAL_NAMES[id].hi : GOAL_NAMES[id].en
}

// ---------------------------------------------------------------------------
// Hooks called by the engine
// ---------------------------------------------------------------------------

/** Reason an option can't be chosen right now under the level rule (L3 slots), else undefined. */
export function levelDecisionBlock(state: GameState, playerIndex: number, option: DecisionOption): string | undefined {
  if (activeRule(state) !== 'lifestyle_creep' || option.type !== 'invest') return undefined
  const player = state.players[playerIndex]
  if (!player || player.isBot || playerIndex !== ruleHumanIndex(state)) return undefined
  const slots = state.levelState?.creep?.slots ?? RULE_TUNING.creep.slots
  const used = slotsUsed(player)
  const asset = optionAsset(option)
  if (used.includes(asset) || used.length < slots) return undefined
  return `All ${slots} investment slots are full — add to an investment you already hold`
}

/** Count a refused invest (L3) for the HUD. */
export function noteBlockedDecision(state: GameState): GameState {
  const ls = state.levelState
  if (!ls?.creep) return state
  const round = state.round ?? 1
  const next = pushEvent({ ...ls, creep: { ...ls.creep, blockedInvests: ls.creep.blockedInvests + 1 } }, {
    round, kind: 'slots_full', key: 'campaign.events.slots_full', params: { n: ls.creep.slots },
    text: `All ${ls.creep.slots} investment slots are full.`,
    textHi: `सभी ${ls.creep.slots} निवेश स्लॉट भरे हैं।`,
  })
  return { ...state, levelState: next }
}

/**
 * After a decision is applied. `before` = the player before the decision.
 * The engine has already moved the money; rules only adjust level state (and L1 lifestyle).
 */
export function applyLevelDecision(state: GameState, playerIndex: number, choice: DecisionChoice, before: PlayerState): LevelRuleResult {
  const none: LevelRuleResult = { state, lines: [], forcedSales: [], playerIndex: -1 }
  const rule = activeRule(state)
  if (!rule || playerIndex !== ruleHumanIndex(state)) return none
  let ls = state.levelState!
  let s = state
  const lines: string[] = []
  const round = state.round ?? 1
  const resist = choice === 'save' || choice === 'invest'

  if (rule === 'desire_meter' && ls.desire) {
    const d = ls.desire
    if (resist) {
      const value = Math.min(d.max, d.value + d.resistRise)
      ls = { ...ls, desire: { ...d, value } }
      if (value >= d.max) {
        lines.push(`🌙 Desire Meter full (${value}) — plan a treat now or you'll splurge on impulse next year.`)
        ls = pushEvent(ls, {
          round, kind: 'desire_warning', key: 'campaign.events.desire_warning',
          text: 'Desire Meter is full — plan a treat now, or next year you splurge on impulse.',
          textHi: 'इच्छा मीटर भर गया — अभी सोच-समझकर खर्च करें, वरना अगले साल अचानक फिज़ूलखर्ची होगी।',
        })
      }
    } else if (choice === 'spend') {
      if (d.value >= d.plannedThreshold) {
        // Planned treat: a want you saw coming — no lifestyle creep, meter resets
        const p = s.players[playerIndex]
        s = setPlayer(s, playerIndex, { ...p, lifestyleLevel: before.lifestyleLevel ?? 0 })
        ls = pushEvent({ ...ls, desire: { ...d, value: 0, plannedTreats: d.plannedTreats + 1 } }, {
          round, kind: 'planned_treat', key: 'campaign.events.planned_treat',
          text: 'Planned treat! You enjoyed it without guilt — the Desire Meter is back to 0.',
          textHi: 'योजना वाला खर्च! बिना पछतावे के मज़ा लिया — इच्छा मीटर फिर 0 पर।',
        })
        lines.push('🎁 Planned treat — Desire Meter back to 0, no lifestyle creep.')
      } else {
        ls = { ...ls, desire: { ...d, value: Math.max(0, d.value - RULE_TUNING.desire.whimDrop) } }
        lines.push('🛍️ A whim, not a plan — the Desire Meter only dropped a little.')
      }
    }
  } else if (rule === 'saving_streak' && ls.streak) {
    const st = ls.streak
    if (resist) {
      const current = st.current + 1
      ls = { ...ls, savingStreak: current, streak: { ...st, current, best: Math.max(st.best, current) } }
      lines.push(`🔥 Pay-yourself-first streak: ${current} year${current > 1 ? 's' : ''}`)
    } else if (choice === 'spend' && st.current > 0) {
      ls = pushEvent({ ...ls, savingStreak: 0, streak: { ...st, current: 0, breaks: st.breaks + 1 } }, {
        round, kind: 'streak_broken', key: 'campaign.events.streak_broken', params: { n: st.current },
        text: `Streak of ${st.current} broken — your Auto-SIP bonus is gone.`,
        textHi: `${st.current} की लय टूट गई — ऑटो-SIP बोनस गया।`,
      })
      lines.push(`💔 Streak of ${st.current} broken — the Auto-SIP bonus resets.`)
    }
  } else if (rule === 'lifestyle_creep' && ls.creep) {
    const c = ls.creep
    if (choice === 'spend') {
      const pct = c.lifestylePct + c.spendCreep
      ls = { ...ls, lifestyleCreep: pct, creep: { ...c, lifestylePct: pct, peakLifestylePct: Math.max(c.peakLifestylePct, pct) } }
      lines.push(`📈 Lifestyle now eats ${pct}% of your salary.`)
    } else if (choice === 'save') {
      const pct = Math.max(c.minLifestylePct, c.lifestylePct - c.saveCut)
      ls = { ...ls, lifestyleCreep: pct, creep: { ...c, lifestylePct: pct } }
      lines.push(`✂️ Budget review: lifestyle down to ${pct}% of salary.`)
    }
  }
  return { state: { ...s, levelState: ls }, lines, forcedSales: [], playerIndex }
}

/** Start of a new year (after market + inflation, only when the game continues). */
export function applyLevelRoundStart(state: GameState): LevelRuleResult {
  const rule = activeRule(state)
  const idx = ruleHumanIndex(state)
  if (!rule || idx < 0) return { state, lines: [], forcedSales: [], playerIndex: -1 }
  const round = state.round ?? 1
  let ls = state.levelState!
  let p = state.players[idx]
  const lines: string[] = []
  const forcedSales: ForcedSale[] = []
  const brokenShields: GameCard[] = []
  const loss = (amount: number) => {
    const res = applyLoss(p, amount)
    p = res.player
    forcedSales.push(...res.forcedSales)
    brokenShields.push(...res.brokenShields)
    lines.push(...res.logs)
    return res
  }

  if (rule === 'desire_meter' && ls.desire) {
    const d = ls.desire
    const value = d.value + d.yearlyRise
    if (value >= d.max) {
      const want = Math.round(getNetWorth(p) * RULE_TUNING.desire.impulsePct / 100)
      const res = loss(want)
      p = { ...p, lifestyleLevel: Math.min(MAX_LIFESTYLE_LEVEL, (p.lifestyleLevel ?? 0) + 1) }
      ls = pushEvent({
        ...ls,
        desire: { ...d, value: RULE_TUNING.desire.afterImpulse, impulseSplurges: d.impulseSplurges + 1, impulseLost: d.impulseLost + res.netWorthLost },
      }, {
        round, kind: 'impulse_splurge', key: 'campaign.events.impulse_splurge', params: { amount: formatINR(res.netWorthLost) },
        text: `Impulse splurge! Bottled-up wants burst out: ${formatINR(res.netWorthLost)} gone, and your lifestyle crept up.`,
        textHi: `अचानक फिज़ूलखर्ची! दबी इच्छाएँ फूट पड़ीं: ${formatINR(res.netWorthLost)} गए, और खर्च की आदत बढ़ गई।`,
        amount: res.netWorthLost,
      })
      lines.push(`🌕 Impulse splurge! The Desire Meter maxed out — ${p.name} lost ${formatINR(res.netWorthLost)}.`)
    } else {
      ls = { ...ls, desire: { ...d, value } }
      if (value >= d.max - d.yearlyRise) {
        lines.push(`🌙 Desire Meter at ${value} — a planned treat now beats a splurge later.`)
        ls = pushEvent(ls, {
          round, kind: 'desire_warning', key: 'campaign.events.desire_warning',
          text: 'Desire Meter is high — plan a treat now, or next year you splurge on impulse.',
          textHi: 'इच्छा मीटर ऊँचा है — अभी सोच-समझकर खर्च करें, वरना अगले साल अचानक फिज़ूलखर्ची होगी।',
        })
      }
    }
  } else if (rule === 'saving_streak' && ls.streak) {
    const st = ls.streak
    if (st.current > 0) {
      const sip = Math.min(st.current, st.cap) * st.sipStep
      p = addHolding(addCash(p, sip), 'index', 'Auto-SIP', sip, round)
      ls = pushEvent({ ...ls, streak: { ...st, autoSipTotal: st.autoSipTotal + sip } }, {
        round, kind: 'auto_sip', key: 'campaign.events.auto_sip', params: { amount: formatINR(sip), n: st.current },
        text: `Auto-SIP: ${formatINR(sip)} went into your index fund (streak ${st.current}).`,
        textHi: `ऑटो-SIP: ${formatINR(sip)} आपके इंडेक्स फंड में गए (लय ${st.current})।`,
        amount: sip,
      })
      lines.push(`🔁 Auto-SIP: ${formatINR(sip)} into ${p.name}'s index fund (streak ${st.current}).`)
    }
  } else if (rule === 'lifestyle_creep' && ls.creep) {
    const c = ls.creep
    // A raise every year — and lifestyle quietly grows with it
    const salary = Math.round(c.salary * (1 + c.raisePct / 100))
    const pct = c.lifestylePct + c.creepPerYear
    const left = Math.round(salary * (1 - pct / 100))
    if (left >= 0) p = addCash(p, left)
    else loss(-left)
    ls = pushEvent({
      ...ls,
      lifestyleCreep: pct,
      creep: { ...c, salary, lifestylePct: pct, peakLifestylePct: Math.max(c.peakLifestylePct, pct), savedFromSalary: c.savedFromSalary + left },
    }, {
      round, kind: 'salary', key: 'campaign.events.salary', params: { salary: formatINR(salary), pct, left: formatINR(left) },
      text: `Raise! Salary ${formatINR(salary)}, lifestyle takes ${pct}% — ${formatINR(left)} left for you.`,
      textHi: `इन्क्रीमेंट! वेतन ${formatINR(salary)}, खर्च ${pct}% — आपके लिए ${formatINR(left)} बचे।`,
      amount: left,
    })
    lines.push(`💼 Salary ${formatINR(salary)} (+${c.raisePct}%), lifestyle ${pct}% → ${left >= 0 ? '+' : '-'}${formatINR(Math.abs(left))} for ${p.name}`)
  } else if (rule === 'grihastha' && ls.family) {
    const fam = ls.family
    let insuredAtBoss = fam.insuredAtBoss
    const goals = fam.goals.map(g => {
      if (g.status !== 'pending' || g.dueRound !== round) return g
      const name = familyGoalName(g.id)
      if (g.id === 'parents_health') {
        const insured = hasHealthCover(p)
        insuredAtBoss = insured
        const bill = Math.round(getNetWorth(p) * fam.bossPct / 100)
        const pay = insured ? Math.round(bill * fam.insuredShare) : bill
        const sold = forcedSales.length
        const res = loss(pay)
        const status = insured && forcedSales.length === sold ? 'met' as const : 'strained' as const
        lines.push(insured
          ? `🏥 Boss event: parents in hospital — insurance paid most of the ${formatINR(bill)} bill; you paid ${formatINR(res.netWorthLost)}.`
          : `🏥 Boss event: parents in hospital — no health cover, you paid ${formatINR(res.netWorthLost)}.`)
        ls = pushEvent(ls, {
          round, kind: 'boss', key: insured ? 'campaign.events.boss_insured' : 'campaign.events.boss_uninsured',
          params: { bill: formatINR(bill), paid: formatINR(res.netWorthLost) },
          text: insured
            ? `Parents in hospital: the bill was ${formatINR(bill)}, insurance paid most — you paid ${formatINR(res.netWorthLost)}.`
            : `Parents in hospital with no health cover: you paid the full ${formatINR(res.netWorthLost)}.`,
          textHi: insured
            ? `माता-पिता अस्पताल में: बिल ${formatINR(bill)}, ज़्यादातर बीमे ने भरा — आपने ${formatINR(res.netWorthLost)} दिए।`
            : `माता-पिता अस्पताल में, कोई स्वास्थ्य बीमा नहीं: पूरे ${formatINR(res.netWorthLost)} आपने भरे।`,
          amount: res.netWorthLost,
        })
        return { ...g, amount: bill, paid: res.netWorthLost, status }
      }
      // Goal money comes from "ready money" first: cash, then FD / debt funds (a planned withdrawal)
      const readyBefore = readyMoney(p)
      p = withdrawSafe(p, g.amount)
      const fromReady = Math.min(g.amount, readyBefore)
      const shortfall = g.amount - fromReady
      let paid = fromReady
      if (shortfall > 0) {
        // Not ready: the rest comes from forced sales, and rushing costs extra on the shortfall
        const res = loss(shortfall)
        paid += res.paid
        const rush = loss(Math.round(shortfall * fam.rushPct / 100))
        if (rush.netWorthLost > 0) lines.push(`💸 Rushing to raise ${formatINR(shortfall)} cost an extra ${formatINR(rush.netWorthLost)}.`)
      }
      if (g.id === 'home' && paid > 0) {
        // The down payment buys the family home: money becomes (illiquid) property
        p = addHolding(addCash(p, paid), 'realestate', 'Family Home', paid, round)
      }
      const status = paid < g.amount ? 'missed' as const : shortfall === 0 ? 'met' as const : 'strained' as const
      const key = status === 'met' ? 'goal_met' as const : 'goal_strained' as const
      ls = pushEvent(ls, {
        round, kind: key, key: `campaign.events.${key}_${g.id}`, params: { amount: formatINR(g.amount) },
        text: status === 'met'
          ? `${name} paid from ready money: ${formatINR(g.amount)}. Well planned!`
          : `${name} due and not enough ready money — investments were sold in a hurry.`,
        textHi: status === 'met'
          ? `${familyGoalName(g.id, true)} तैयार पैसे से भरा: ${formatINR(g.amount)}। बढ़िया योजना!`
          : `${familyGoalName(g.id, true)} का समय आया पर तैयार पैसा कम था — निवेश जल्दबाज़ी में बेचने पड़े।`,
        amount: g.amount,
      })
      lines.push(status === 'met'
        ? `🏡 ${name}: ${formatINR(g.amount)} paid from cash / FD / debt fund.`
        : `⚠️ ${name}: ${formatINR(g.amount)} due — not enough ready money, investments sold.`)
      return { ...g, paid, status }
    })
    // Heads-up two years and one year before each goal
    for (const g of goals) {
      const n = g.dueRound - round
      if (g.status !== 'pending' || n < 1 || n > GOAL_WARNING_YEARS) continue
      const amountText = g.id === 'parents_health' ? `${fam.bossPct}%` : formatINR(g.amount)
      const when = n === 1 ? 'Next year' : `In ${n} years`
      const whenHi = n === 1 ? 'अगले साल' : `${n} साल में`
      lines.push(`📌 ${when}: ${familyGoalName(g.id)} (${amountText}) — ${g.id === 'parents_health' ? 'keep health insurance equipped' : 'keep cash / FD / debt fund ready'}.`)
      ls = pushEvent(ls, {
        round, kind: 'goal_due_soon', key: `campaign.events.due_soon_${g.id}`, params: { amount: amountText, n },
        text: `${when}: ${familyGoalName(g.id)} (${amountText}).`,
        textHi: `${whenHi}: ${familyGoalName(g.id, true)} (${amountText})।`,
      })
    }
    ls = { ...ls, bossTriggered: ls.bossTriggered || insuredAtBoss !== null, family: { ...fam, goals, insuredAtBoss } }
  }

  let s = setPlayer({ ...state, levelState: ls }, idx, p)
  if (brokenShields.length) s = { ...s, discardPile: [...s.discardPile, ...brokenShields] }
  return { state: s, lines, forcedSales, playerIndex: idx }
}

/** Campaign: only the learner can end a level by reaching the target (bots are rivals, not racers). */
export function canWinByTarget(state: GameState, player: PlayerState): boolean {
  return !state.levelConfig || !player.isBot
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

export interface StarCriterion {
  id: 'reach_target' | 'habit' | 'clean'
  met: boolean
  /** i18n key for the label (UI) + its params; label / labelHi are plain fallbacks */
  labelKey: string
  params?: Record<string, string | number>
  label: string
  labelHi: string
}

export interface LevelStarsResult {
  stars: 0 | 1 | 2 | 3
  criteria: StarCriterion[]
}

const HABIT_LABELS: Record<LevelRuleId, { label: string; labelHi: string }> = {
  desire_meter: {
    label: 'Enjoy at least one planned treat and never splurge on impulse',
    labelHi: 'कम से कम एक योजना वाला खर्च करें और कभी अचानक फिज़ूलखर्ची न हो',
  },
  saving_streak: {
    label: `Reach a pay-yourself-first streak of ${RULE_TUNING.stars.streakBest} years`,
    labelHi: `${RULE_TUNING.stars.streakBest} साल की "पहले खुद को भुगतान" लय बनाएँ`,
  },
  lifestyle_creep: {
    label: `Finish with lifestyle at or below ${RULE_TUNING.stars.lifestyleMaxPct}% of salary`,
    labelHi: `अंत में खर्च वेतन के ${RULE_TUNING.stars.lifestyleMaxPct}% या कम रखें`,
  },
  grihastha: {
    label: 'Meet every family goal: home and education from cash, parents insured',
    labelHi: 'हर पारिवारिक लक्ष्य पूरा करें: घर और पढ़ाई नकद से, माता-पिता बीमित',
  },
}

/** Star criteria for a level, without results (for the level intro). */
export function levelStarCriteria(level: Pick<LevelConfig, 'id' | 'rule' | 'targetCorpus' | 'turnLimit'>): Omit<StarCriterion, 'met'>[] {
  const rule = getLevelRule(level)
  const habit = rule ? HABIT_LABELS[rule] : { label: 'Play smart', labelHi: 'समझदारी से खेलें' }
  return [
    {
      id: 'reach_target', labelKey: 'campaign.stars.reachTarget',
      params: { target: formatINR(level.targetCorpus), years: level.turnLimit },
      label: `Reach ${formatINR(level.targetCorpus)} within ${level.turnLimit} years`,
      labelHi: `${level.turnLimit} साल में ${formatINR(level.targetCorpus)} तक पहुँचें`,
    },
    {
      id: 'habit', labelKey: `campaign.stars.habit.${rule ?? 'none'}`,
      params: { n: RULE_TUNING.stars.streakBest, pct: RULE_TUNING.stars.lifestyleMaxPct },
      ...habit,
    },
    {
      id: 'clean', labelKey: 'campaign.stars.clean',
      label: 'No forced sales, and a report-card average of B or better',
      labelHi: 'कोई मजबूरी की बिक्री नहीं, और रिपोर्ट कार्ड औसत B या बेहतर',
    },
  ]
}

const GRADE_POINTS: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1 }

/** Report-card average on a 4-point scale (A=4 … D=1). */
export function reportCardAverage(state: GameState, playerId: string): number {
  const grades = buildReportCard(state, playerId).grades
  return grades.length ? grades.reduce((s, g) => s + GRADE_POINTS[g.grade], 0) / grades.length : 0
}

function habitMet(state: GameState, rule: LevelRuleId | null): boolean {
  const ls = state.levelState
  switch (rule) {
    case 'desire_meter':
      return !!ls?.desire && ls.desire.plannedTreats >= 1 && ls.desire.impulseSplurges === 0
    case 'saving_streak':
      return (ls?.streak?.best ?? 0) >= RULE_TUNING.stars.streakBest
    case 'lifestyle_creep':
      return !!ls?.creep && ls.creep.lifestylePct <= RULE_TUNING.stars.lifestyleMaxPct
    case 'grihastha':
      return !!ls?.family && ls.family.goals.every(g => g.status === 'met')
    default:
      return false
  }
}

/**
 * Stars for a campaign result. 1★ = reached the target within the limit; then +1★ for the
 * level's habit and +1★ for a clean finish (no forced sales, report-card average ≥ B).
 * Habit/clean stars only count once the target is reached.
 */
export function computeLevelStars(state: GameState, playerId: string): LevelStarsResult {
  const player = state.players.find(p => p.id === playerId)
  const level = state.levelConfig
  const labels = level ? levelStarCriteria(level) : levelStarCriteria({ id: '', targetCorpus: state.wealthGoal, turnLimit: state.maxRounds ?? 0 })
  if (!player) return { stars: 0, criteria: labels.map(l => ({ ...l, met: false })) }
  const reached = getNetWorth(player) >= state.wealthGoal
    && (state.phase !== 'game_over' || state.winner?.id === playerId)
  const habit = habitMet(state, level ? getLevelRule(level) : null)
  const clean = (player.stats?.forcedSales ?? 0) === 0 && reportCardAverage(state, playerId) >= RULE_TUNING.stars.reportAverage
  const met = [reached, habit, clean]
  const criteria = labels.map((l, i) => ({ ...l, met: met[i] }))
  const stars = (reached ? 1 + (habit ? 1 : 0) + (clean ? 1 : 0) : 0) as LevelStarsResult['stars']
  return { stars, criteria }
}
