import {
  Bitcoin, CalendarClock, ChartLine, ChartPie, CreditCard, Droplets, Gauge, Gem, HeartPulse, Hourglass, House, Landmark,
  LifeBuoy, LockKeyhole, PiggyBank, Receipt, Scale, ShieldAlert, ShoppingBag, Sprout, TrendingUp, Umbrella, type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Concept, ConceptId } from '../../types/learning'
import { CONCEPTS } from '../../data/concepts'
import { pickLang } from '../../i18n/lang'

/** Used when a concept is missing from the catalog (e.g. while the catalog is a stub). */
const FALLBACK_EMOJI: Record<ConceptId, string> = {
  inflation: '💸', compounding: '📈', emergency_fund: '🛟', sip: '🔁', index_funds: '📊',
  diversification: '🧺', asset_risk: '🎢', fd_vs_inflation: '🏦', liquidity: '💧', market_patience: '🧘',
  scams: '🚨', crypto_risk: '🪙', lifestyle_creep: '🛍️', pay_yourself_first: '🐷', health_insurance: '🏥',
  term_insurance: '☂️', credit_card_debt: '💳', good_vs_bad_debt: '⚖️', tax_saving: '🧾', cyber_safety: '🔐',
  real_estate: '🏠', gold: '🥇',
}

/** Library filter topics (spec §E.8). Each topic has a semantic colour (band, chip). */
export type ConceptTopic = 'saving' | 'investing' | 'risk' | 'tax' | 'protection'
export const CONCEPT_TOPICS: ConceptTopic[] = ['saving', 'investing', 'risk', 'tax', 'protection']

export const CONCEPT_TOPIC: Record<ConceptId, ConceptTopic> = {
  inflation: 'saving', emergency_fund: 'saving', fd_vs_inflation: 'saving', liquidity: 'saving',
  lifestyle_creep: 'saving', pay_yourself_first: 'saving',
  compounding: 'investing', sip: 'investing', index_funds: 'investing', diversification: 'investing',
  market_patience: 'investing', real_estate: 'investing', gold: 'investing',
  asset_risk: 'risk', scams: 'risk', crypto_risk: 'risk', credit_card_debt: 'risk', good_vs_bad_debt: 'risk',
  tax_saving: 'tax',
  health_insurance: 'protection', term_insurance: 'protection', cyber_safety: 'protection',
}

/** Lucide icon per concept (replaces the catalog emoji in the UI). */
export const CONCEPT_ICON: Record<ConceptId, LucideIcon> = {
  inflation: TrendingUp, compounding: Sprout, emergency_fund: LifeBuoy, sip: CalendarClock, index_funds: ChartLine,
  diversification: ChartPie, asset_risk: Gauge, fd_vs_inflation: Landmark, liquidity: Droplets, market_patience: Hourglass,
  scams: ShieldAlert, crypto_risk: Bitcoin, lifestyle_creep: ShoppingBag, pay_yourself_first: PiggyBank,
  health_insurance: HeartPulse, term_insurance: Umbrella, credit_card_debt: CreditCard, good_vs_bad_debt: Scale,
  tax_saving: Receipt, cyber_safety: LockKeyhole, real_estate: House, gold: Gem,
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

/**
 * Language-resolved view of a concept, safe for ids missing from the catalog.
 * Hindi uses the *Hi fields; English and Hinglish use the English write-up.
 */
export function conceptView(id: ConceptId, lang: string): ConceptView {
  const c: Concept | undefined = CONCEPTS[id]
  if (!c) {
    return { id, emoji: FALLBACK_EMOJI[id] ?? '📘', title: titleFromId(id), oneLiner: '', explanation: '', example: '', actionTip: '', hasDetails: false }
  }
  const pick = (en: string, hi: string) => pickLang(en, hi, lang)
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
