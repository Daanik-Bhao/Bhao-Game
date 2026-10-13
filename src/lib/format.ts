/**
 * Money formatting for the UI (docs/ux/02-design-spec.md §B.5).
 *
 *   formatMoney(1240500)                          → "₹12,40,500"
 *   formatMoney(1410000, { compact: true })       → "₹14.1 L"     (hi: "₹14.1 लाख")
 *   formatMoney(12000000, { compact: true })      → "₹1.2 Cr"     (hi: "₹1.2 करोड़")
 *   formatMoney(-35000, { compact: true })        → "−₹35K"
 *   formatMoney(50000, { compact: true, signed: true }) → "+₹50K"
 *
 * Negative numbers use the real minus sign U+2212. Compact values keep one decimal
 * ("₹4.2 L") and drop a trailing ".0" ("₹50 L"). A no-break space keeps "L"/"Cr"
 * on the same line as the number. Render the result inside an element with the
 * `.num` class (tabular figures).
 */
export type MoneyLang = 'en' | 'hi' | 'hinglish' | string

export interface MoneyOptions {
  /** Lakh / crore / thousand short form */
  compact?: boolean
  /** Prefix positive values with "+" (zero gets no sign) */
  signed?: boolean
  /** Language for the compact unit words (Hindi uses लाख / करोड़) */
  lang?: MoneyLang
  /** Compact only: always use the short Latin units L / Cr, even in Hindi (tight spots: cards, chips) */
  abbr?: boolean
}

export const MINUS = '−'
const NBSP = ' '

const fullFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

function oneDecimal(n: number): string {
  const s = (Math.round(n * 10) / 10).toFixed(1)
  return s.endsWith('.0') ? s.slice(0, -2) : s
}

function compactBody(abs: number, lang: MoneyLang, abbr: boolean): string {
  const hi = lang === 'hi' && !abbr
  if (abs >= 1e7) return `${oneDecimal(abs / 1e7)}${NBSP}${hi ? 'करोड़' : 'Cr'}`
  if (abs >= 1e5) return `${oneDecimal(abs / 1e5)}${NBSP}${hi ? 'लाख' : 'L'}`
  if (abs >= 1e3) return `${abs >= 1e4 ? String(Math.round(abs / 1e3)) : oneDecimal(abs / 1e3)}K`
  return fullFormatter.format(abs)
}

export function formatMoney(value: number, opts: MoneyOptions = {}): string {
  const { compact = false, signed = false, lang = 'en', abbr = false } = opts
  const safe = Number.isFinite(value) ? value : 0
  const rounded = Math.round(safe)
  const abs = Math.abs(rounded)
  const body = compact ? compactBody(abs, lang, abbr) : fullFormatter.format(abs)
  const sign = rounded < 0 ? MINUS : signed && rounded > 0 ? '+' : ''
  return `${sign}₹${body}`
}

/** Signed percentage with a real minus: "+8%", "−20%". */
export function formatPct(value: number, opts: { signed?: boolean; digits?: number } = {}): string {
  const { signed = true, digits = 0 } = opts
  const factor = 10 ** digits
  const r = Math.round(value * factor) / factor
  const abs = Math.abs(r).toFixed(digits)
  const sign = r < 0 ? MINUS : signed && r > 0 ? '+' : ''
  return `${sign}${abs}%`
}
