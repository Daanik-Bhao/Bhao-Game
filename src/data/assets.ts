import type { AssetClass } from '../types/game'

/**
 * Phase 3 economy: one round = one year of life.
 * Every round each holding moves by `meanPct` ± a random swing up to `swingPct`,
 * and with `crashChance` it instead loses `crashPct`. Numbers are deliberately
 * close to long-run Indian averages so the game teaches real intuition.
 */
export interface AssetInfo {
  id: AssetClass
  name: string
  nameHi: string
  emoji: string
  /** Average yearly return, % */
  meanPct: number
  /** Max random swing either side of the mean, % (uniform) */
  swingPct: number
  /** Chance per round of a crash instead of the normal move, 0-1 */
  crashChance: number
  /** Loss on a crash, % (positive number) */
  crashPct: number
  /** Penalty when this holding is sold early to cover a cash shortfall, % */
  exitPenaltyPct: number
  risk: 'none' | 'low' | 'medium' | 'high' | 'extreme'
  /** One line shown in the UI and the mentor explanation */
  lesson: string
}

export const ASSETS: Record<AssetClass, AssetInfo> = {
  fd: { id: 'fd', name: 'Fixed Deposit', nameHi: 'एफडी', emoji: '🏦', meanPct: 7, swingPct: 0, crashChance: 0, crashPct: 0, exitPenaltyPct: 1, risk: 'none', lesson: 'Safe and steady, but barely beats inflation.' },
  debt: { id: 'debt', name: 'PPF / Debt Fund', nameHi: 'पीपीएफ / डेट फंड', emoji: '📜', meanPct: 7.5, swingPct: 1, crashChance: 0, crashPct: 0, exitPenaltyPct: 5, risk: 'low', lesson: 'Low risk, tax-friendly, locked for long-term goals.' },
  gold: { id: 'gold', name: 'Gold', nameHi: 'सोना', emoji: '🪙', meanPct: 8, swingPct: 10, crashChance: 0, crashPct: 0, exitPenaltyPct: 2, risk: 'low', lesson: 'A hedge, not a growth engine. Keep it to a small slice.' },
  index: { id: 'index', name: 'Index Fund SIP', nameHi: 'इंडेक्स फंड एसआईपी', emoji: '📈', meanPct: 12, swingPct: 15, crashChance: 0.05, crashPct: 20, exitPenaltyPct: 1, risk: 'medium', lesson: 'Owns the whole market. Bumpy years, strong decades.' },
  equity: { id: 'equity', name: 'Stocks / Equity MF', nameHi: 'शेयर / इक्विटी फंड', emoji: '💹', meanPct: 13, swingPct: 22, crashChance: 0.07, crashPct: 25, exitPenaltyPct: 1, risk: 'high', lesson: 'Higher return, bigger swings. Needs patience.' },
  smallcap: { id: 'smallcap', name: 'Small-cap Stocks', nameHi: 'स्मॉल-कैप शेयर', emoji: '🚀', meanPct: 16, swingPct: 35, crashChance: 0.12, crashPct: 40, exitPenaltyPct: 2, risk: 'high', lesson: 'Can double fast, can halve faster.' },
  realestate: { id: 'realestate', name: 'Property', nameHi: 'प्रॉपर्टी', emoji: '🏠', meanPct: 8, swingPct: 5, crashChance: 0.03, crashPct: 15, exitPenaltyPct: 15, risk: 'medium', lesson: 'Steady but illiquid: selling in a hurry costs a lot.' },
  crypto: { id: 'crypto', name: 'Crypto', nameHi: 'क्रिप्टो', emoji: '₿', meanPct: 15, swingPct: 60, crashChance: 0.2, crashPct: 70, exitPenaltyPct: 3, risk: 'extreme', lesson: 'Pure speculation. Only money you can afford to lose.' },
  scam: { id: 'scam', name: 'Hot Tip / Scheme', nameHi: 'टिप / स्कीम', emoji: '🎣', meanPct: 25, swingPct: 10, crashChance: 0.65, crashPct: 95, exitPenaltyPct: 50, risk: 'extreme', lesson: 'Guaranteed-return tips are how scams work. Most of it vanishes.' },
}

/** Fallback when a card's invest option has no `asset`: infer from its old investRisk. */
export function inferAsset(investRisk: number | undefined): AssetClass {
  if (!investRisk) return 'index'
  if (investRisk <= 10) return 'debt'
  if (investRisk <= 30) return 'index'
  if (investRisk <= 40) return 'equity'
  return 'smallcap'
}

/** Base yearly inflation hit on idle cash, %. Lifestyle creep adds on top. */
export const BASE_INFLATION_PCT = 6
/** Extra inflation on cash per lifestyle level (each Spend raises lifestyle by 1, capped). */
export const LIFESTYLE_INFLATION_STEP_PCT = 1
export const MAX_LIFESTYLE_LEVEL = 5
