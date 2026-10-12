import type { AssetClass, EventCategory } from './game'

/** Every money idea the game can teach. The Gyaan Library has one entry per id. */
export type ConceptId =
  | 'inflation'
  | 'compounding'
  | 'emergency_fund'
  | 'sip'
  | 'index_funds'
  | 'diversification'
  | 'asset_risk'
  | 'fd_vs_inflation'
  | 'liquidity'
  | 'market_patience'
  | 'scams'
  | 'crypto_risk'
  | 'lifestyle_creep'
  | 'pay_yourself_first'
  | 'health_insurance'
  | 'term_insurance'
  | 'credit_card_debt'
  | 'good_vs_bad_debt'
  | 'tax_saving'
  | 'cyber_safety'
  | 'real_estate'
  | 'gold'

export interface Concept {
  id: ConceptId
  emoji: string
  title: string
  titleHi: string
  /** One sentence, shown on the library tile and in the report card */
  oneLiner: string
  oneLinerHi: string
  /** 3–5 short sentences, plain language, Indian context */
  explanation: string
  explanationHi: string
  /** A worked ₹ example with real-ish numbers */
  example: string
  exampleHi: string
  /** One concrete thing to do in real life */
  actionTip: string
  actionTipHi: string
}

/** Per-player numbers the engine records during a game (all optional-safe). */
export interface PlayerGameStats {
  saves: number
  spends: number
  invests: number
  /** ₹ moved into each asset class over the game */
  investedByAsset: Partial<Record<AssetClass, number>>
  /** ₹ of cash lost to inflation over the game */
  inflationLost: number
  /** Number of holdings that had to be sold to cover a loss (one per holding sold) */
  forcedSales: number
  /** ₹ paid in exit penalties on forced sales */
  exitPenaltiesPaid: number
  /** Harmful rival attacks + life events stopped by an equipped defense */
  attacksBlocked: number
  /** Harmful rival attacks + life events that landed and cost something (or skipped a turn / lured cash) */
  attacksTaken: number
  /** ₹ lost to attacks and life events (before forced-sale penalties) */
  lossesTaken: number
  /** ₹ lost in scam / crypto holdings that were wiped or crashed */
  speculativeLosses: number
  maxSaveStreak: number
  peakNetWorth: number
  /** Net worth at the end of each round, index 0 = start of game */
  netWorthByRound: number[]
  /** Concepts this player ran into during the game, in order, no duplicates */
  conceptsTriggered: ConceptId[]
  // --- Additive detail (optional; filled by the engine, used for specific lessons) ---
  /** Current run of consecutive Save choices (uncapped, unlike PlayerState.savingStreak) */
  currentSaveStreak?: number
  /** Defense cards equipped over the game */
  defensesEquipped?: number
  /** Every forced sale, in order */
  forcedSaleLog?: { asset: AssetClass; round: number; sold: number; penalty: number; penaltyPct: number }[]
  /** Harmful rival attacks and life events that reached this player (blocked or not), in order */
  hits?: StatHit[]
  /** Cash ÷ net worth recorded alongside netWorthByRound (index 0 = start) */
  cashShareByRound?: number[]
  /** Biggest one-year drop of a held asset class in a market tick */
  worstMarketDrop?: { round: number; asset: AssetClass; pct: number } | null
}

/** One harmful card that reached a player. `amount` = ₹ lost before forced-sale penalties (0 if blocked). */
export interface StatHit {
  name: string
  nameHi?: string
  round: number
  amount: number
  category?: EventCategory
  blocked: boolean
  lifeEvent: boolean
  /** Lure events: the asset the player was talked into */
  lureAsset?: AssetClass
}

export type Grade = 'A' | 'B' | 'C' | 'D'

export interface ReportCard {
  playerId: string
  /** Stable persona key (e.g. 'steady_builder'), for UI art / analytics. Optional (additive). */
  personaId?: string
  startNetWorth: number
  finalNetWorth: number
  /** e.g. "Steady Builder", "Risk Taker", "Inflation's Favourite Customer" */
  personaTitle: string
  personaTitleHi: string
  headline: string
  headlineHi: string
  grades: { area: 'saving' | 'investing' | 'risk' | 'emergency' | 'protection'; label: string; labelHi: string; grade: Grade; reason: string; reasonHi: string }[]
  /** "If you did this for real for 10 years" */
  projection: {
    years: number
    monthlyAmount: number
    /** Value using the player's own asset mix */
    yourMixValue: number
    /** Same money in a savings account / FD, for comparison */
    fdValue: number
    /** Same money in a plain index fund SIP, for comparison */
    indexValue: number
    explanation: string
    explanationHi: string
  }
  /** At most 3, most important first */
  lessons: { conceptId: ConceptId; text: string; textHi: string }[]
  conceptsUnlocked: ConceptId[]
}
