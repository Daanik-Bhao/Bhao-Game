import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  CalendarDays, ChartLine, Flame, Fish, Layers, PiggyBank, ScrollText, Shield, Skull, SkipForward,
  Swords, Timer, TrendingDown, TrendingUp, Trophy, TriangleAlert, Wallet, type LucideIcon,
} from 'lucide-react'
import { BASE_CARDS, ACTION_CARDS, LEGENDARY_CARDS } from '../../data/cards'
import { LEVEL_SITUATION_CARDS } from '../../data/levelCards'
import { ASSETS } from '../../data/assets'
import type { AssetClass } from '../../types/game'
import { formatMoney } from '../../lib/format'
import { pickLang } from '../../i18n/lang'
import { cardNameFor } from './economyUi'

const cardTranslationMap: Record<string, string> = {}
;[...BASE_CARDS, ...ACTION_CARDS, ...LEGENDARY_CARDS, ...LEVEL_SITUATION_CARDS].forEach(c => {
  if (c.nameHi) cardTranslationMap[c.name] = c.nameHi
})

/** Word-level Hindi fallback for engine log lines that have no sentence template. */
export function translateLogEntry(text: string, lang: string) {
  if (lang !== 'hi') return text

  let translated = text
  translated = translated.replace('Game started! First to', 'गेम शुरू! लक्ष्य है')
  translated = translated.replace('wins.', 'बनाना।')
  translated = translated.replace('Deck reshuffled.', 'डेक फिर से मिलाया गया।')
  translated = translated.replace('Fresh deck created.', 'नया डेक तैयार।')
  translated = translated.replace('played', 'ने इस्तेमाल किया')
  translated = translated.replace('is skipping their turn.', 'ने अपनी बारी छोड़ दी।')
  translated = translated.replace('took too long! Turn skipped.', 'का समय खत्म! बारी छूट गई।')
  translated = translated.replace('defended with', 'ने बचाव किया: ')
  translated = translated.replace('Auto-Defended!', 'स्वतः बचाव!')
  translated = translated.replace('Investment Failed!', 'निवेश विफल!')
  translated = translated.replace('Season Boost!', 'सीज़न बूस्ट!')
  translated = translated.replace('Level Complete! Reached', 'लेवल पूरा! हासिल किया')
  translated = translated.replace('in time.', 'समय पर।')
  translated = translated.replace('Turn limit reached! You failed to reach the goal.', 'बारी की सीमा खत्म! आप लक्ष्य तक नहीं पहुँच पाए।')
  translated = translated.replace('reached', 'ने हासिल किया')
  translated = translated.replace('and WINS!', 'और जीत हासिल की!')
  translated = translated.replace('Everyone else forfeited!', 'बाकी सभी ने गेम छोड़ दिया!')
  translated = translated.replace('affects all!', 'सब पर असर!')
  translated = translated.replace('SPEND', 'खर्च')
  translated = translated.replace('SAVE', 'बचत')
  translated = translated.replace('INVEST', 'निवेश')
  for (const [en, hi] of Object.entries(cardTranslationMap)) {
    if (translated.includes(en)) translated = translated.replace(en, hi)
  }
  return translated
}

export type LogTone = 'gain' | 'loss' | 'neutral'

export interface LogView {
  /** Full sentence in the current language */
  text: string
  /** Player name to emphasise (sentence starts with it) */
  actor?: string
  icon: LucideIcon
  tone: LogTone
  /** '📅 Year N' header line */
  yearHeader?: number
}

const EMOJI_ASSET = new Map<string, AssetClass>(Object.values(ASSETS).map(a => [a.emoji, a.id]))

/** Leading emoji / symbols stripped. */
function stripLead(s: string): string {
  return s.replace(/^[^\p{L}\p{N}₹(]+/u, '').trim()
}

function parseRupees(s: string | undefined): number | null {
  if (!s) return null
  const m = s.match(/([+-])?₹([\d,]+)/)
  if (!m) return null
  const n = Number(m[2].replace(/,/g, ''))
  return m[1] === '-' ? -n : n
}

/** "📈 Index Fund SIP" (engine assetLabel) → localized asset name. */
function assetFromLabel(label: string, lang: string): string {
  const trimmed = label.trim()
  const emoji = Array.from(trimmed)[0]
  const id = EMOJI_ASSET.get(emoji)
  if (id) return pickLang(ASSETS[id].name, ASSETS[id].nameHi, lang)
  return stripLead(trimmed)
}

/** Word joiner keeps the sign glued to the ₹ when a feed line wraps. */
const money = (n: number, lang: string, signed = true) => formatMoney(n, { signed, lang }).replace(/^([+−])₹/, '$1⁠₹')

/** Turns one engine log line into a localized sentence + icon (spec §E.12 feed, §E.17 log). */
export function logView(entry: string, t: TFunction, lang: string): LogView {
  const raw = entry.trim()
  let m: RegExpMatchArray | null

  if ((m = raw.match(/^📅 Year (\d+)/))) {
    const n = Number(m[1])
    return { text: t('log.yearBegan', { n }), icon: CalendarDays, tone: 'neutral', yearHeader: n }
  }
  // Decision: "Priya played Diwali Bonus → SAVE (+₹26,000) — ₹50,000 moved into 📈 Index Fund SIP"
  if ((m = raw.match(/^(.+?) played (.+?) → (SPEND|SAVE|INVEST)(?: \(([+-]₹[\d,]+)\))?(?: — (₹[\d,]+) moved into (.+))?$/))) {
    const [, name, card, choice, diff, moved, asset] = m
    const amount = parseRupees(diff)
    const c = cardNameFor(card)
    if (choice === 'INVEST') {
      const amt = parseRupees(moved)
      return {
        text: amt !== null && asset
          ? t('log.invested', { name, card: c, amount: money(amt, lang, false), asset: assetFromLabel(asset, lang) })
          : t('log.investedPlain', { name, card: c }),
        actor: name, icon: ChartLine, tone: 'neutral',
      }
    }
    const key = choice === 'SAVE' ? 'log.saved' : 'log.spent'
    return {
      text: t(amount !== null ? key : `${key}Plain`, { name, card: c, amount: amount !== null ? money(amount, lang) : '' }),
      actor: name,
      icon: choice === 'SAVE' ? PiggyBank : Wallet,
      tone: amount === null ? 'neutral' : amount > 0 ? 'gain' : 'loss',
    }
  }
  // AoE action: "Rahul played Market Crash — affects all!"
  if ((m = raw.match(/^(.+?) played (.+?) — affects all!$/))) {
    return { text: t('log.hitAll', { name: m[1], card: cardNameFor(m[2]) }), actor: m[1], icon: Swords, tone: 'loss' }
  }
  // Targeted action: "Rahul played Tax Raid → Priya (-₹30,000) (+₹30,000) 🛡️ (Priya Auto-Defended!)"
  if ((m = raw.match(/^(.+?) played (.+?) → (.+?)(?: \(([+-]₹[\d,]+)\))?(?: \(([+-]₹[\d,]+)\))?( 🛡️ \(.+ Auto-Defended!\))?$/))) {
    const [, name, card, target, d1, , blocked] = m
    const c = cardNameFor(card)
    if (blocked) return { text: t('log.hitBlocked', { name, card: c, target }), actor: name, icon: Shield, tone: 'neutral' }
    const amount = parseRupees(d1)
    return {
      text: amount !== null && amount < 0
        ? t('log.hit', { name, card: c, target, amount: money(amount, lang) })
        : t('log.playedOn', { name, card: c, target }),
      actor: name, icon: Swords, tone: amount !== null && amount < 0 ? 'loss' : 'neutral',
    }
  }
  if ((m = raw.match(/^(.+?) passed \(discarded (.+?)\)\.$/))) {
    return { text: t('log.passedCard', { name: m[1], card: cardNameFor(m[2]) }), actor: m[1], icon: SkipForward, tone: 'neutral' }
  }
  if ((m = raw.match(/^(.+?) passed\.$/))) return { text: t('log.passed', { name: m[1] }), actor: m[1], icon: SkipForward, tone: 'neutral' }
  if ((m = raw.match(/^🛡️ (.+?) equipped (.+)$/))) {
    return { text: t('log.equipped', { name: m[1], card: cardNameFor(m[2]) }), actor: m[1], icon: Shield, tone: 'neutral' }
  }
  if ((m = raw.match(/^🛡️ (.+?)'s (.+?) blocked (.+?)!$/))) {
    return { text: t('log.blocked', { name: m[1], shield: cardNameFor(m[2]), card: cardNameFor(m[3]) }), actor: m[1], icon: Shield, tone: 'gain' }
  }
  if ((m = raw.match(/^⏱️ (.+?) took too long! Turn skipped\.$/))) {
    return { text: t('log.timeUp', { name: m[1] }), actor: m[1], icon: Timer, tone: 'neutral' }
  }
  if ((m = raw.match(/^(.+?) is skipping their turn\.$/))) {
    return { text: t('log.skipping', { name: m[1] }), actor: m[1], icon: SkipForward, tone: 'neutral' }
  }
  if ((m = raw.match(/^💸 Inflation ate (₹[\d,]+) of (.+?)'s cash$/))) {
    return { text: t('log.inflation', { name: m[2], amount: money(parseRupees(m[1]) ?? 0, lang, false) }), icon: TrendingDown, tone: 'loss' }
  }
  if ((m = raw.match(/^📊 Market: (.+)$/))) {
    const moves = m[1].split(/\s{2,}/).map(part => {
      const mm = part.trim().match(/^(\S+)\s*([+-]?[\d.]+)%$/u)
      if (!mm) return part
      const id = EMOJI_ASSET.get(mm[1])
      const n = Number(mm[2])
      const label = id ? pickLang(ASSETS[id].name, ASSETS[id].nameHi, lang) : mm[1]
      return `${label} ${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}%`
    }).join(' · ')
    return { text: t('log.market', { moves }), icon: TrendingUp, tone: 'neutral' }
  }
  if ((m = raw.match(/^☠️ (.+?)'s (.+) was wiped out\.$/))) {
    return { text: t('log.wiped', { name: m[1], asset: assetFromLabel(m[2], lang) }), actor: m[1], icon: Skull, tone: 'loss' }
  }
  // Forced sale (economy.ts): "🚨 Rahul had to sell 🏠 Property at a 15% penalty — an emergency fund…"
  if ((m = raw.match(/^🚨 (.+?) had to sell (.+?) (?:at a (\d+)% penalty|to cover a loss) — /))) {
    const [, name, asset, pct] = m
    const a = assetFromLabel(asset, lang)
    return { text: pct ? t('log.forcedSale', { name, asset: a, pct }) : t('log.forcedSaleNoPenalty', { name, asset: a }), actor: name, icon: TriangleAlert, tone: 'loss' }
  }
  if ((m = raw.match(/^🎲 Life event: (.+?)(?: \(everyone\)| — (.+))?$/))) {
    const card = cardNameFor(m[1])
    return { text: m[2] ? t('log.lifeEventFor', { card, name: m[2] }) : t('log.lifeEventAll', { card }), icon: CalendarDays, tone: 'neutral' }
  }
  if ((m = raw.match(/^(🎉|💥) (.+?): ([+-])(₹[\d,]+)$/))) {
    const n = (parseRupees(m[4]) ?? 0) * (m[3] === '-' ? -1 : 1)
    return { text: t('log.change', { name: m[2], amount: money(n, lang) }), actor: m[2], icon: n >= 0 ? TrendingUp : TrendingDown, tone: n >= 0 ? 'gain' : 'loss' }
  }
  if ((m = raw.match(/^🎣 (.+?) fell for it: (₹[\d,]+) moved into (.+)$/))) {
    return { text: t('log.lure', { name: m[1], amount: money(parseRupees(m[2]) ?? 0, lang, false), asset: assetFromLabel(m[3], lang) }), actor: m[1], icon: Fish, tone: 'loss' }
  }
  if ((m = raw.match(/^🔥 Saving Streak x(\d+)!$/))) return { text: t('log.streak', { n: Number(m[1]) }), icon: Flame, tone: 'gain' }
  if (/^🃏 Drew a free card!$/.test(raw)) return { text: t('log.freeCard'), icon: Layers, tone: 'neutral' }
  if (/^Deck reshuffled\.$|^Fresh deck created\.$/.test(raw)) return { text: t('log.reshuffled'), icon: Layers, tone: 'neutral' }
  if (/^Game started!/.test(raw) || /^BHAO: .+ started!/.test(raw)) return { text: t('log.started'), icon: CalendarDays, tone: 'neutral' }
  if ((m = raw.match(/^🏆 (.+?) reached the wealth goal and WINS!$/))) return { text: t('log.won', { name: m[1] }), actor: m[1], icon: Trophy, tone: 'gain' }
  if (/^🏆|^⌛/.test(raw)) return { text: translateLogEntry(stripLead(raw), lang), icon: Trophy, tone: 'neutral' }
  if (/^⚠️/.test(raw)) return { text: translateLogEntry(stripLead(raw), lang), icon: TriangleAlert, tone: 'neutral' }

  // Fallback: engine text (Hindi word replacements), no leading emoji.
  const amount = parseRupees(raw.match(/\(([+-]₹[\d,]+)\)/)?.[1])
  return {
    text: translateLogEntry(stripLead(raw), lang),
    icon: ScrollText,
    tone: amount === null ? 'neutral' : amount > 0 ? 'gain' : 'loss',
  }
}

/** Sentence with the actor's name in bold. */
export function LogSentence({ view }: { view: LogView }) {
  if (view.actor && view.text.startsWith(view.actor)) {
    return <span><b>{view.actor}</b>{view.text.slice(view.actor.length)}</span>
  }
  return <span>{view.text}</span>
}

/** Entries that make the table feed noisy (year header is shown by the banner, deck shuffles). */
const FEED_SKIP = /^📅 Year|^Deck reshuffled|^Fresh deck created|^Game started!|^BHAO: /

/** The newest `n` entries for the table feed / desktop "Recent moves". */
export function feedEntries(log: string[], n: number, meName?: string): string[] {
  // Other players' inflation lines are noise on the table; yours stay.
  const otherInflation = (e: string) => {
    const m = e.match(/^💸 Inflation ate .+ of (.+?)'s cash$/)
    return !!m && m[1] !== meName
  }
  return log.filter(e => !FEED_SKIP.test(e.trim()) && !otherInflation(e.trim())).slice(0, n)
}

export function FeedList({ log, n, meName, className = '' }: { log: string[]; n: number; meName?: string; className?: string }) {
  const { t, i18n } = useTranslation()
  const items = feedEntries(log, n, meName)
  if (!items.length) return null
  return (
    <ul className={`board-feed ${className}`.trim()} aria-label={t('board.recentMoves')}>
      {items.map((entry, i) => {
        const v = logView(entry, t, i18n.language)
        const Icon = v.icon
        return (
          <li key={`${i}-${entry}`} className={`board-feed__item tone-${v.tone}`}>
            <Icon size={16} strokeWidth={2.25} aria-hidden="true" />
            <LogSentence view={v} />
          </li>
        )
      })}
    </ul>
  )
}

interface GameLogProps {
  log: string[]
  /** Current year (round), to group entries newest first */
  round?: number
}

/** Full game log (spec §E.17): grouped by year, newest first, full sentences that wrap. */
export function GameLog({ log, round = 1 }: GameLogProps) {
  const { t, i18n } = useTranslation()
  if (log.length === 0) return <p className="game-log__empty">{t('log.empty')}</p>

  const groups: { year: number; items: LogView[] }[] = []
  let year = round
  let current: { year: number; items: LogView[] } | null = null
  for (const entry of log) {
    const v = logView(entry, t, i18n.language)
    if (!current || current.year !== year) {
      current = { year, items: [] }
      groups.push(current)
    }
    if (v.yearHeader !== undefined) {
      year = Math.max(1, v.yearHeader - 1)
      continue
    }
    current.items.push(v)
  }
  const visible = groups.filter(g => g.items.length)

  return (
    <div className="game-log">
      {visible.map((g, gi) => (
        <section key={`${g.year}-${gi}`}className="game-log__group" aria-label={t('log.year', { n: g.year })}>
          <h3 className="game-log__year">{t('log.year', { n: g.year })}</h3>
          <ul className="game-log__list">
            {g.items.map((v, i) => {
              const Icon = v.icon
              return (
                <li key={i} className={`game-log__item tone-${v.tone}`}>
                  <span className="game-log__icon" aria-hidden="true"><Icon size={18} strokeWidth={2.25} /></span>
                  <LogSentence view={v} />
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
