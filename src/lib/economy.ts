/**
 * Phase 3 economy helpers (pure): cash / holdings / net worth, losses with
 * forced sales, market tick and inflation. See docs/phase3-design.md §1, §2, §5.
 */
import type { AssetClass, CardTier, GameCard, Holding, PlayerState } from '../types/game'
import { ASSETS, BASE_INFLATION_PCT, LIFESTYLE_INFLATION_STEP_PCT, MAX_LIFESTYLE_LEVEL } from '../data/assets'

// ---------------------------------------------------------------------------
// Randomness — everything random in the engine goes through rand() so tests
// (and the balance simulation) can make it deterministic with setRng().
// ---------------------------------------------------------------------------
let rngImpl: () => number = Math.random

/** Replace the random source (pass nothing to restore Math.random). */
export function setRng(fn?: () => number): void {
  rngImpl = fn ?? Math.random
}

export function rand(): number {
  return rngImpl()
}

/** Small seeded PRNG (mulberry32) for tests and simulations. */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    // crypto.randomUUID is missing on plain-http LAN addresses. Use Math.random, never the
    // game rng, so ids don't consume seeded random numbers (the tutorial story depends on it).
    return `id_${Math.floor(Math.random() * 1e12).toString(36)}_${Date.now().toString(36)}`
  }
}

// ---------------------------------------------------------------------------
// Money model
// ---------------------------------------------------------------------------

/** Cash in hand. Old states without `cash` treat all wealth as cash. */
export function getCash(player: PlayerState): number {
  return player.cash ?? player.wealth
}

export function getHoldings(player: PlayerState): Holding[] {
  return player.holdings ?? []
}

export function getHoldingsValue(player: PlayerState): number {
  return getHoldings(player).reduce((sum, h) => sum + h.value, 0)
}

/** Net worth = cash + Σ holding value. */
export function getNetWorth(player: PlayerState): number {
  return Math.round(getCash(player) + getHoldingsValue(player))
}

/**
 * Materialise cash/holdings and set `wealth` = net worth. Call after every
 * change to cash or holdings so existing UI reading `wealth` stays correct.
 */
export function syncWealth(player: PlayerState): PlayerState {
  const cash = Math.max(0, Math.round(getCash(player)))
  const holdings = getHoldings(player)
  const wealth = Math.round(cash + holdings.reduce((s, h) => s + h.value, 0))
  return { ...player, cash, holdings, lifestyleLevel: player.lifestyleLevel ?? 0, wealth }
}

/** Add (or remove, if negative and covered) cash. Use applyLoss for losses. */
export function addCash(player: PlayerState, amount: number): PlayerState {
  return syncWealth({ ...player, cash: getCash(player) + Math.round(amount) })
}

export interface ForcedSale {
  asset: AssetClass
  name: string
  /** Holding value sold */
  sold: number
  /** Rupees lost to the exit penalty */
  penalty: number
  penaltyPct: number
}

export interface LossResult {
  player: PlayerState
  /** Bankruptcy Shield cards that broke and should go to the discard pile */
  brokenShields: GameCard[]
  forcedSales: ForcedSale[]
  /** Net-worth drop actually suffered (incl. exit penalties, after the shield) */
  netWorthLost: number
  /** Part of the requested amount actually paid out (what a thief can receive) */
  paid: number
  /** Log lines (forced-sale lessons) */
  logs: string[]
}

/**
 * Take a loss: from cash first, then by force-selling holdings (most liquid —
 * lowest exit penalty — first, paying the penalty), then floored at 0.
 * A Bankruptcy Shield (wealthFloor) stops net worth at the floor and breaks.
 */
export function applyLoss(player: PlayerState, amount: number): LossResult {
  const base = syncWealth(player)
  const want = Math.max(0, Math.round(amount))
  const nw0 = base.wealth
  if (want === 0) return { player: base, brokenShields: [], forcedSales: [], netWorthLost: 0, paid: 0, logs: [] }

  let cash = base.cash ?? 0
  let holdings = [...(base.holdings ?? [])]
  const forcedSales: ForcedSale[] = []
  const logs: string[] = []

  if (cash >= want) {
    cash -= want
  } else {
    let shortfall = want - cash
    cash = 0
    const order = [...holdings].sort((a, b) => ASSETS[a.asset].exitPenaltyPct - ASSETS[b.asset].exitPenaltyPct)
    for (const h of order) {
      if (shortfall <= 0) break
      const penPct = ASSETS[h.asset].exitPenaltyPct
      const keep = 1 - penPct / 100
      const grossNeeded = keep > 0 ? shortfall / keep : h.value
      const sold = Math.min(h.value, Math.ceil(grossNeeded))
      const proceeds = sold * keep
      shortfall -= proceeds
      const penalty = Math.round(sold - proceeds)
      forcedSales.push({ asset: h.asset, name: h.name, sold: Math.round(sold), penalty, penaltyPct: penPct })
      holdings = holdings
        .map(x => (x.id === h.id ? { ...x, value: Math.round(x.value - sold) } : x))
        .filter(x => x.value > 0)
    }
    if (shortfall < 0) cash += Math.round(-shortfall) // rounding leftovers
  }

  for (const s of forcedSales) {
    const info = ASSETS[s.asset]
    logs.push(s.penaltyPct > 0
      ? `🚨 ${base.name} had to sell ${info.emoji} ${info.name} at a ${s.penaltyPct}% penalty — an emergency fund would have avoided this.`
      : `🚨 ${base.name} had to sell ${info.emoji} ${info.name} to cover a loss — an emergency fund would have avoided this.`)
  }

  let next = syncWealth({ ...base, cash, holdings })
  let brokenShields: GameCard[] = []
  if (base.wealthFloor > 0 && next.wealth < base.wealthFloor && next.wealth < nw0) {
    // Shield: stop the fall at the floor (never grant money), then break.
    const saved = Math.max(next.wealth, Math.min(nw0, base.wealthFloor))
    brokenShields = base.activeDefenses.filter(c => c.effect?.type === 'wealth_floor')
    next = syncWealth({
      ...next,
      cash: (next.cash ?? 0) + (saved - next.wealth),
      wealthFloor: 0,
      activeDefenses: base.activeDefenses.filter(c => c.effect?.type !== 'wealth_floor'),
    })
    logs.push(`🛡️ ${base.name}'s Bankruptcy Shield held at ₹${saved.toLocaleString('en-IN')} and broke.`)
  }

  const netWorthLost = nw0 - next.wealth
  return { player: next, brokenShields, forcedSales, netWorthLost, paid: Math.min(want, netWorthLost), logs }
}

/** Cut a player's market-linked holdings (index/equity/smallcap/crypto) by pct (negative pct = boost). */
export const MARKET_ASSETS: AssetClass[] = ['index', 'equity', 'smallcap', 'crypto']

export function shiftMarketHoldings(player: PlayerState, pct: number): PlayerState {
  const holdings = getHoldings(player).map(h =>
    MARKET_ASSETS.includes(h.asset) ? { ...h, value: Math.max(0, Math.round(h.value * (1 + pct / 100))) } : h,
  ).filter(h => h.value > 0)
  return syncWealth({ ...player, holdings })
}

// ---------------------------------------------------------------------------
// Investing
// ---------------------------------------------------------------------------

/** Share of CASH moved into the holding by an Invest choice, by card tier. */
export const INVEST_FRACTION: Record<CardTier, number> = {
  common: 0.35,
  rare: 0.5,
  epic: 0.65,
  legendary: 0.75,
}
export const MIN_INVEST_CASH = 1000

/** Add money to a holding of that asset (merging into an existing one). */
export function addHolding(player: PlayerState, asset: AssetClass, name: string, amount: number, round: number): PlayerState {
  const holdings = getHoldings(player)
  const existing = holdings.find(h => h.asset === asset)
  const next = existing
    ? holdings.map(h => (h === existing ? { ...h, principal: h.principal + amount, value: h.value + amount } : h))
    : [...holdings, { id: newId(), asset, name, principal: amount, value: amount, boughtRound: round, lastChangePct: 0 }]
  return syncWealth({ ...player, cash: getCash(player) - amount, holdings: next })
}

// ---------------------------------------------------------------------------
// Market tick + inflation
// ---------------------------------------------------------------------------

/** One shared roll per asset class: crash ? -crashPct : meanPct×boost ± swing. */
export function rollMarket(meanBoost = 1): Record<AssetClass, number> {
  const out = {} as Record<AssetClass, number>
  for (const info of Object.values(ASSETS)) {
    let pct: number
    if (info.crashChance > 0 && rand() < info.crashChance) {
      pct = -info.crashPct
    } else {
      pct = info.meanPct * meanBoost + (rand() * 2 - 1) * info.swingPct
    }
    out[info.id] = Math.round(pct * 10) / 10
  }
  return out
}

/** Apply a market roll to one player's holdings. Holdings worth ≤1% of principal are wiped out. */
export function applyMarketToPlayer(player: PlayerState, changes: Partial<Record<AssetClass, number>>): { player: PlayerState; wiped: Holding[] } {
  const wiped: Holding[] = []
  const holdings: Holding[] = []
  for (const h of getHoldings(player)) {
    const pct = changes[h.asset] ?? 0
    const value = Math.max(0, Math.round(h.value * (1 + pct / 100)))
    if (value <= h.principal * 0.01) {
      wiped.push(h)
      continue
    }
    holdings.push({ ...h, value, lastChangePct: pct })
  }
  return { player: syncWealth({ ...player, holdings }), wiped }
}

export function inflationPct(player: PlayerState): number {
  const level = Math.min(MAX_LIFESTYLE_LEVEL, player.lifestyleLevel ?? 0)
  return BASE_INFLATION_PCT + level * LIFESTYLE_INFLATION_STEP_PCT
}

/** Inflation eats idle cash only. Returns the rupees lost. */
export function applyInflation(player: PlayerState): { player: PlayerState; lost: number } {
  const cash = getCash(player)
  const lost = Math.max(0, Math.round(cash * inflationPct(player) / 100))
  return { player: syncWealth({ ...player, cash: cash - lost }), lost }
}

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}
