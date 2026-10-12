import { supabase } from './supabase'
import { DAANIK_STOCKS_DATA } from '../data/cards'

/**
 * DAANIK stock market (UI hidden until a later phase).
 *
 * Prices are deterministic per hour of the Asia/Kolkata clock. The server is
 * authoritative: SQL `stock_price(ticker, at)` (migration
 * 20261013000100_market_server_prices.sql) is a port of `stockPriceAt` below and
 * `buy_stock` / `sell_stock` charge that server price — the client never sends a
 * price. `fetchMarketPrices()` reads prices from the server (`get_market_prices`);
 * `getDeterministicMarketPrices()` is the identical local formula, used only as a
 * display fallback. `npm run check:migrations` asserts both agree.
 */

export interface MarketStock {
  ticker: string
  name: string
  description: string
  base_price: number
  current_price: number
  price_change_pct: number
  trend: 'up' | 'down' | 'stable'
}

export const MARKET_TIME_ZONE = 'Asia/Kolkata'

// A simple deterministic pseudo-random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/** Wall-clock parts in the market time zone (independent of the device time zone). */
function marketClock(date: Date): { year: number; month: number; day: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MARKET_TIME_ZONE,
    year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') % 24 }
}

/** Volatility in [-0.15, 0.15) for stock #index at `date`. */
function volatilityAt(index: number, date: Date): number {
  const { year, month, day, hour } = marketClock(date)
  // Note: `day * 24` (not `day * 100`) is the historical formula; keep it identical to SQL.
  const seedBase = year * 10000 + month * 100 + day * 24 + hour
  return (seededRandom(seedBase + index * 1337) * 0.3) - 0.15
}

/** Price of one share of `ticker` at `date`, or null for an unknown ticker. Mirrors SQL `stock_price`. */
export function stockPriceAt(ticker: string, date: Date = new Date()): number | null {
  const index = DAANIK_STOCKS_DATA.findIndex(s => s.ticker === ticker)
  if (index < 0) return null
  return Math.round(DAANIK_STOCKS_DATA[index].base_price * (1 + volatilityAt(index, date)))
}

function toMarketStock(index: number, currentPrice: number): MarketStock {
  const stock = DAANIK_STOCKS_DATA[index]
  const priceChangePct = ((currentPrice - stock.base_price) / stock.base_price) * 100
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (priceChangePct > 2) trend = 'up'
  else if (priceChangePct < -2) trend = 'down'
  return { ...stock, current_price: currentPrice, price_change_pct: priceChangePct, trend }
}

/** Local copy of the server price formula (display fallback only). */
export function getDeterministicMarketPrices(date: Date = new Date()): MarketStock[] {
  return DAANIK_STOCKS_DATA.map((_stock, i) => toMarketStock(i, stockPriceAt(DAANIK_STOCKS_DATA[i].ticker, date) ?? 0))
}

/** Authoritative prices from the server; falls back to the identical local formula. */
export async function fetchMarketPrices(): Promise<MarketStock[]> {
  const { data, error } = await supabase.rpc('get_market_prices')
  if (error || !Array.isArray(data)) return getDeterministicMarketPrices()
  const byTicker = new Map<string, number>(
    (data as { ticker: string; current_price: number }[]).map(r => [r.ticker, r.current_price])
  )
  return DAANIK_STOCKS_DATA.map((s, i) => toMarketStock(i, byTicker.get(s.ticker) ?? stockPriceAt(s.ticker) ?? s.base_price))
}

export async function fetchUserHoldings(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('user_stocks').select('ticker, shares')
  if (error) {
    console.error('Failed to fetch holdings:', error)
    return {}
  }

  const holdings: Record<string, number> = {}
  for (const row of data) {
    holdings[row.ticker] = row.shares
  }
  return holdings
}

export interface StockTradeResult {
  /** Server price per share used for the trade */
  price: number
  /** Total coins charged (buy) or credited (sell) */
  total: number
  /** New coin balance */
  coins: number
}

/** Buys at the current server price. */
export async function buyStock(ticker: string, shares: number): Promise<StockTradeResult> {
  const { data, error } = await supabase.rpc('buy_stock', { p_ticker: ticker, p_shares: shares })
  if (error) throw error
  return data as StockTradeResult
}

/** Sells at the current server price. */
export async function sellStock(ticker: string, shares: number): Promise<StockTradeResult> {
  const { data, error } = await supabase.rpc('sell_stock', { p_ticker: ticker, p_shares: shares })
  if (error) throw error
  return data as StockTradeResult
}
