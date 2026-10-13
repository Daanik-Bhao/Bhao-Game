/**
 * The one big value printed on a game card (spec §D.14 "Headline value").
 * Pure: depends only on the card and the language. Texts come from the locale
 * files (`card.headline.*`, `card.spoken.*`).
 */
import type { GameCard } from '../types/game'
import { LOCALE_TREES, type LocaleTree } from '../i18n/resources'
import { formatMoney, formatPct } from './format'

export type HeadlineTone = 'gain' | 'loss' | 'defence' | 'neutral'

export interface CardHeadline {
  /** 'choose' = decision card: render three dots (spend / save / invest) instead of text */
  kind: 'value' | 'choose'
  /** Visible text ('' for kind 'choose') */
  text: string
  tone: HeadlineTone
  /** Words for the accessible name, e.g. "every rival loses 20 percent" */
  spoken: string
}

type Lang = 'en' | 'hi' | 'hinglish'

function lookup(lang: Lang, key: string): string {
  const read = (tree: LocaleTree) => key.split('.').reduce<string | LocaleTree | undefined>(
    (node, part) => (node && typeof node === 'object' ? node[part] : undefined), tree)
  const v = read(LOCALE_TREES[lang]) ?? read(LOCALE_TREES.en)
  return typeof v === 'string' ? v : key
}

function tr(lang: Lang, key: string, vars: Record<string, string | number> = {}): string {
  return lookup(lang, key).replace(/{{\s*(\w+)\s*}}/g, (_, k: string) => String(vars[k] ?? ''))
}

function asLang(lang: string | undefined): Lang {
  return lang === 'hi' || lang === 'hinglish' ? lang : 'en'
}

const money = (n: number, lang: Lang, signed = false) => formatMoney(n, { compact: true, abbr: true, signed, lang })

export function cardHeadline(card: GameCard, langIn?: string): CardHeadline {
  const lang = asLang(langIn)
  if (card.options && card.options.length > 0) {
    return { kind: 'choose', text: '', tone: 'neutral', spoken: tr(lang, 'card.spoken.choose') }
  }
  const e = card.effect
  const v = e?.value ?? 0
  const value = (text: string, tone: HeadlineTone, spoken: string): CardHeadline => ({ kind: 'value', text, tone, spoken })

  switch (e?.type) {
    case 'wealth_change': {
      const tone = v < 0 ? 'loss' : v > 0 ? 'gain' : 'neutral'
      const amount = money(Math.abs(v), lang)
      const target = e.target === 'target' || e.target === 'others' || e.target === 'all'
      const spoken = target
        ? tr(lang, v < 0 ? 'card.spoken.rivalLosesAmount' : 'card.spoken.everyoneGainsAmount', { amount })
        : tr(lang, v < 0 ? 'card.spoken.youLoseAmount' : 'card.spoken.youGainAmount', { amount })
      return value(money(v, lang, true), tone, spoken)
    }
    case 'wealth_pct': {
      const tone = v < 0 ? 'loss' : v > 0 ? 'gain' : 'neutral'
      const n = Math.abs(v)
      const spokenKey = e.target === 'target' ? (v < 0 ? 'rivalLosesPct' : 'rivalGainsPct')
        : e.target === 'all' ? (v < 0 ? 'everyoneLosesPct' : 'everyoneGainsPct')
        : e.target === 'others' ? (v < 0 ? 'allRivalsLosePct' : 'allRivalsGainPct')
        : (v < 0 ? 'youLosePct' : 'youGainPct')
      return value(formatPct(v), tone, tr(lang, `card.spoken.${spokenKey}`, { n }))
    }
    case 'steal_pct':
      return value(formatPct(-Math.abs(v)), 'loss', tr(lang, 'card.spoken.stealPct', { n: Math.abs(v) }))
    case 'attack_all_pct':
      return value(formatPct(-Math.abs(v)), 'loss', tr(lang, 'card.spoken.allRivalsLosePct', { n: Math.abs(v) }))
    case 'market_crash_player':
      return value(formatPct(-Math.abs(v)), 'loss', tr(lang, 'card.spoken.rivalInvestLosesPct', { n: Math.abs(v) }))
    case 'reduce_attack_pct':
      return value(tr(lang, 'card.headline.hit', { pct: formatPct(-Math.abs(v)) }), 'defence', tr(lang, 'card.spoken.reduceHit', { n: Math.abs(v) }))
    case 'steal': {
      const amount = money(Math.abs(v), lang)
      return value(tr(lang, 'card.headline.steal', { amount }), 'loss', tr(lang, 'card.spoken.steal', { amount }))
    }
    case 'skip_turn':
      return value(tr(lang, 'card.headline.skipTurn'), 'loss', tr(lang, 'card.spoken.skipTurn'))
    case 'block_card':
      return value(tr(lang, 'card.headline.block'), 'defence', tr(lang, 'card.spoken.block'))
    case 'wealth_next_turn': {
      const amount = money(v, lang, true)
      return value(tr(lang, 'card.headline.nextYear', { amount }), v < 0 ? 'loss' : 'gain', tr(lang, 'card.spoken.nextYear', { amount: money(Math.abs(v), lang) }))
    }
    case 'wealth_end_game': {
      const amount = money(v, lang, true)
      return value(tr(lang, 'card.headline.atEnd', { amount }), v < 0 ? 'loss' : 'gain', tr(lang, 'card.spoken.atEnd', { amount: money(Math.abs(v), lang) }))
    }
    case 'wealth_floor': {
      const amount = money(v, lang)
      return value(tr(lang, 'card.headline.floor', { amount }), 'defence', tr(lang, 'card.spoken.floor', { amount }))
    }
    case 'double_invest':
      return value(tr(lang, 'card.headline.doubleInvest'), 'gain', tr(lang, 'card.spoken.doubleInvest'))
    case 'copy_card':
      return value(tr(lang, 'card.headline.copy'), 'neutral', tr(lang, 'card.spoken.copy'))
    case 'set_goal':
      return value(tr(lang, 'card.headline.newGoal'), 'neutral', tr(lang, 'card.spoken.newGoal'))
    default:
      if (card.type === 'defense') return value(tr(lang, 'card.headline.block'), 'defence', tr(lang, 'card.spoken.block'))
      return value('', 'neutral', '')
  }
}
