/**
 * The guided first match (docs/phase4-design.md §5).
 *
 * Everything here is data + pure helpers: the tutorial page builds the
 * starting GameState with `buildTutorialState`, installs
 * `setRng(seededRng(TUTORIAL_SEED))` and then drives the REAL engine
 * (startDrawPhase / processDecision / equipDefense / advanceTurn / doBotTurn).
 *
 * With the scripted decks below and this seed the story is the same every time:
 *  Year 1  you invest the ₹150-a-day chai money in an index fund; Rahul buys more property
 *  Year 2  market + inflation; Rahul falls for a WhatsApp stock tip; you Save a buffer
 *  Year 3  a medical emergency hits Rahul — no cash buffer, so he sells property at a 15% penalty;
 *          you draw and equip Health Insurance
 *  Year 4  the "hot tip" is wiped out; a hospital bill hits you and your insurance blocks it
 *
 * The player's own choices never consume random numbers, so the seeded story holds
 * even when they play freely in Year 3. src/components/tutorial/__tests__ checks it.
 */
import type { DecisionChoice, GameCard, GameState, Holding, PlayerState } from '../types/game'
import type { BotPolicy } from '../lib/gameEngine'
import { ALL_CARDS } from './cards'
import { BUILTIN_LIFE_EVENTS } from './lifeEvents'

/** Found by searching seeds against the scripted decks (see the tutorial test). */
export const TUTORIAL_SEED = 1358
export const TUTORIAL_DONE_KEY = 'bhao_tutorial_done'

export const TUTORIAL_PLAYER_ID = 'tutorial-you'
export const TUTORIAL_BOT_ID = 'tutorial-rahul'
export const TUTORIAL_BOT_NAME = 'Rahul AI'

export const TUTORIAL_START_CASH = 500000
export const TUTORIAL_GOAL = 800000
export const TUTORIAL_MAX_ROUNDS = 6
/** Rahul already owns a flat and keeps very little cash: the "no emergency fund" player. */
export const TUTORIAL_BOT_CASH = 150000
export const TUTORIAL_BOT_PROPERTY = 350000

/** Cards (real ids from src/data/cards.ts) */
export const CARD_IDS = {
  /** "₹150 every day on outside coffee/food" — invest goes into an index fund SIP (rare: 50% of cash) */
  chai: 'dc_daily_convenience_habit_4',
  /** Save = "keep it as a dedicated emergency fund" */
  buffer: 'dc_travel_vs_savings_dilemma_57',
  paycheck: 'dc_first_major_paycheck_17',
  diversified: 'dc_diversified_portfolio_183',
  windfall: 'dc_small_windfall_dilemma_1',
  fire: 'dc_fire_movement_choice_90',
  cashGift: 'dc_unexpected_cash_gift_3',
  /** Health insurance: blocks the `medical` category */
  insurance: 'def_comprehensive_health_insurance_173',
  /** Rahul's favourite: invest = property (15% penalty if sold in a hurry) */
  property: 'dc_lifestyle_inflation_temptation_40',
  /** Life events, in the order they come out of the event deck */
  medical: 'ac_medical_emergency_trigger_153',
} as const

export const EVENT_IDS = {
  lure: 'le_whatsapp_tip',
  hospital: 'le_hospital_bill',
  diwali: 'le_diwali_bonus',
  salary: 'le_salary_hike',
  car: 'le_car_repair',
} as const

const POOL: GameCard[] = [...ALL_CARDS, ...BUILTIN_LIFE_EVENTS]

function card(id: string, copy = 't'): GameCard {
  const c = POOL.find(x => x.id === id)
  if (!c) throw new Error(`Tutorial card ${id} not found`)
  return { ...c, id: `${id}_${copy}` }
}

/** Instance id of a scripted card (cards get a suffix so copies stay distinct). */
export function isCard(c: GameCard | null | undefined, id: string): boolean {
  return !!c && (c.id === id || c.id.startsWith(`${id}_`))
}

function player(id: string, name: string, isBot: boolean, cash: number, holdings: Holding[], hand: GameCard[]): PlayerState {
  const wealth = cash + holdings.reduce((s, h) => s + h.value, 0)
  return {
    id, name, isBot, wealth, cash, holdings, lifestyleLevel: 0, hand,
    activeDefenses: [], skippedTurns: 0, pendingGains: [], wealthFloor: 0, doubleInvestActive: false,
    investChoices: 0, spendChoices: 0, savingStreak: 0, greedIndex: 0, emiDamageTaken: false,
    diffMultiplier: 1,
    profile: isBot ? { rank_points: 1000, avatar_url: null } : { rank_points: 0, avatar_url: null },
  }
}

/**
 * Starting state: you (₹5L cash) vs Rahul (₹1.5L cash + ₹3.5L flat). Fixed hands,
 * fixed draw deck and fixed life-event deck. No randomness is used here.
 */
export function buildTutorialState(playerName = 'You', now = Date.now()): GameState {
  const you = player(TUTORIAL_PLAYER_ID, playerName, false, TUTORIAL_START_CASH, [], [
    card(CARD_IDS.chai),
    card(CARD_IDS.buffer),
    card(CARD_IDS.paycheck),
    card(CARD_IDS.diversified),
    card(CARD_IDS.windfall),
  ])
  const flat: Holding = {
    id: 'tutorial-rahul-flat', asset: 'realestate', name: 'Family flat',
    principal: TUTORIAL_BOT_PROPERTY, value: TUTORIAL_BOT_PROPERTY, boughtRound: 1, lastChangePct: 0,
  }
  const rahul = player(TUTORIAL_BOT_ID, TUTORIAL_BOT_NAME, true, TUTORIAL_BOT_CASH, [flat],
    [1, 2, 3, 4, 5].map(n => card(CARD_IDS.property, `r${n}`)))

  // Draw order: you (Y2), Rahul (Y2), you (Y3) = Health Insurance, Rahul (Y3), ...
  const deck: GameCard[] = [
    card(CARD_IDS.fire),
    card(CARD_IDS.property, 'r6'),
    card(CARD_IDS.insurance),
    card(CARD_IDS.property, 'r7'),
    card(CARD_IDS.cashGift),
    card(CARD_IDS.property, 'r8'),
    card(CARD_IDS.windfall, 't2'),
    card(CARD_IDS.property, 'r9'),
    card(CARD_IDS.paycheck, 't2'),
    card(CARD_IDS.property, 'r10'),
    card(CARD_IDS.buffer, 't2'),
    card(CARD_IDS.property, 'r11'),
  ]
  const eventDeck: GameCard[] = [
    card(EVENT_IDS.lure, 'ev'),
    card(CARD_IDS.medical, 'ev'),
    card(EVENT_IDS.hospital, 'ev'),
    card(EVENT_IDS.diwali, 'ev'),
    card(EVENT_IDS.salary, 'ev'),
    card(EVENT_IDS.car, 'ev'),
  ]

  return {
    id: 'tutorial',
    players: [you, rahul],
    deck,
    discardPile: [],
    eventDeck,
    currentPlayerIndex: 0,
    turn: 1,
    round: 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [`Tutorial started! Grow ₹5 lakh towards ₹8 lakh.`],
    wealthGoal: TUTORIAL_GOAL,
    // The tutorial has no clock: a long limit, and turn timers are frozen by the page.
    timeLimit: 24 * 60 * 60 * 1000,
    startTime: now,
    turnStartTime: now,
    maxRounds: TUTORIAL_MAX_ROUNDS,
    lastEvent: null,
    lastMarketTick: null,
    equippedThisTurn: false,
    roundNews: null,
  }
}

/** Rahul invests every rupee he can (in property) and never keeps a buffer. */
export const TUTORIAL_BOT_POLICY: BotPolicy = {
  chooseDecision: (_state, _bot, c): DecisionChoice =>
    c.options?.some(o => o.type === 'invest') ? 'invest' : (c.options?.[0]?.type ?? 'save'),
}

// ---------------------------------------------------------------------------
// Opening hook: ₹150 chai a day as a monthly SIP
// ---------------------------------------------------------------------------

export const CHAI_PER_DAY = 150
export const CHAI_PER_MONTH = CHAI_PER_DAY * 30
export const HOOK_YEARS = 10
export const HOOK_RATE_PCT = 12

/**
 * Future value of a monthly SIP (payment at the start of each month, like a real SIP):
 * FV = P × [((1 + i)^n − 1) / i] × (1 + i), i = yearly rate / 12, n = months.
 */
export function sipFutureValue(monthly: number, yearlyRatePct: number, years: number): number {
  const i = yearlyRatePct / 100 / 12
  const n = years * 12
  return monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
}

/** ₹4,500 × 120 months at 12% ≈ ₹10.45 lakh (₹5.4 lakh of it is your own money). */
export const HOOK_FUTURE_VALUE = sipFutureValue(CHAI_PER_MONTH, HOOK_RATE_PCT, HOOK_YEARS)
export const HOOK_PAID_IN = CHAI_PER_MONTH * 12 * HOOK_YEARS

export function formatLakh(amount: number, digits = 1): string {
  return `₹${(amount / 100000).toFixed(digits)} lakh`
}

export function markTutorialDone(): void {
  try {
    localStorage.setItem(TUTORIAL_DONE_KEY, String(Date.now()))
  } catch {
    // storage blocked (private mode): nothing to remember
  }
}

export function isTutorialDone(): boolean {
  try {
    return !!localStorage.getItem(TUTORIAL_DONE_KEY)
  } catch {
    return false
  }
}
