import { useTranslation } from 'react-i18next'
import type { Concept, ConceptId } from '../../types/learning'
import { CONCEPTS } from '../../data/concepts'

/** Used when a concept is missing from the catalog (e.g. while the catalog is a stub). */
const FALLBACK_EMOJI: Record<ConceptId, string> = {
  inflation: '💸', compounding: '📈', emergency_fund: '🛟', sip: '🔁', index_funds: '📊',
  diversification: '🧺', asset_risk: '🎢', fd_vs_inflation: '🏦', liquidity: '💧', market_patience: '🧘',
  scams: '🚨', crypto_risk: '🪙', lifestyle_creep: '🛍️', pay_yourself_first: '🐷', health_insurance: '🏥',
  term_insurance: '☂️', credit_card_debt: '💳', good_vs_bad_debt: '⚖️', tax_saving: '🧾', cyber_safety: '🔐',
  real_estate: '🏠', gold: '🥇',
}

/** "fd_vs_inflation" -> "FD vs Inflation" */
export function titleFromId(id: string): string {
  return id
    .split('_')
    .map(w => (w === 'fd' || w === 'sip' ? w.toUpperCase() : w === 'vs' ? 'vs' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

export interface ConceptView {
  id: ConceptId
  emoji: string
  title: string
  oneLiner: string
  explanation: string
  example: string
  actionTip: string
  /** false when the catalog has no entry yet: only emoji + title are meaningful */
  hasDetails: boolean
}

/** Language-resolved view of a concept, safe for ids missing from the catalog. */
export function conceptView(id: ConceptId, hindi: boolean): ConceptView {
  const c: Concept | undefined = CONCEPTS[id]
  if (!c) {
    return { id, emoji: FALLBACK_EMOJI[id] ?? '📘', title: titleFromId(id), oneLiner: '', explanation: '', example: '', actionTip: '', hasDetails: false }
  }
  const pick = (en: string, hi: string) => (hindi && hi ? hi : en)
  return {
    id,
    emoji: c.emoji || FALLBACK_EMOJI[id] || '📘',
    title: pick(c.title, c.titleHi) || titleFromId(id),
    oneLiner: pick(c.oneLiner, c.oneLinerHi),
    explanation: pick(c.explanation, c.explanationHi),
    example: pick(c.example, c.exampleHi),
    actionTip: pick(c.actionTip, c.actionTipHi),
    hasDetails: true,
  }
}

/** True when the UI should show the Hindi text fields. Hinglish uses the English fields. */
export function useIsHindi(): boolean {
  const { i18n } = useTranslation()
  return i18n.language === 'hi'
}

/** Real-money rupees, Indian style: ₹4,500 · ₹1.2 lakh · ₹2.35 crore */
export function formatRupees(amount: number, hindi = false): string {
  const n = Math.round(amount)
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)} ${hindi ? 'करोड़' : 'crore'}`
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)} ${hindi ? 'लाख' : 'lakh'}`
  return `${sign}₹${abs.toLocaleString('en-IN')}`
}

function trim(x: number): string {
  return x.toFixed(2).replace(/\.?0+$/, '')
}
