import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Briefcase, CalendarDays, CreditCard, HeartPulse, House, IndianRupee, Landmark, Lock, Plane, Scale,
  Shield, ShieldAlert, Swords, TrendingDown, User, type LucideIcon,
} from 'lucide-react'
import type { EventCategory, GameCard as GameCardType } from '../types/game'
import { cardHeadline } from '../lib/cardHeadline'
import { asLang } from '../i18n/lang'
import { hyphenateText } from '../lib/hyphenate'
import './GameCard.css'

export type CardSize = 'hand' | 'full' | 'sheet' | 'mini'
export type CardState = 'idle' | 'selected' | 'locked' | 'played' | 'faceDown'
/** Visual family: decides band colour, icon and label (spec §D.14). */
export type CardKind = 'decision' | 'attack' | 'shield' | 'lifeEvent'

const CATEGORY_ICON: Record<EventCategory, LucideIcon> = {
  medical: HeartPulse, job: Briefcase, market: TrendingDown, fraud: ShieldAlert, tax: Landmark,
  property: House, legal: Scale, personal: User, travel: Plane, debt: CreditCard,
}
const KIND_ICON: Record<CardKind, LucideIcon> = { decision: IndianRupee, attack: Swords, shield: Shield, lifeEvent: CalendarDays }

export function cardKind(card: GameCardType): CardKind {
  if (card.lifeEvent || card.type === 'situation') return 'lifeEvent'
  if (card.type === 'action') return 'attack'
  if (card.type === 'defense') return 'shield'
  return 'decision'
}

export function cardIcon(card: GameCardType): LucideIcon {
  return card.category ? CATEGORY_ICON[card.category] : KIND_ICON[cardKind(card)]
}

/** Card name for the current language (short name first). Hinglish uses the English data. */
export function cardTitle(card: GameCardType, lang: string): string {
  return lang === 'hi'
    ? (card.shortNameHi || card.nameHi || card.shortName || card.name)
    : (card.shortName || card.name)
}

/**
 * Full card name for the current language (ignores shortName). Used where there is room or
 * nothing is visual: the card sheet / inspect header and the card's accessible name.
 */
export function cardFullTitle(card: GameCardType, lang: string): string {
  return lang === 'hi' ? (card.nameHi || card.name) : card.name
}

export function cardFlavor(card: GameCardType, lang: string): string {
  return lang === 'hi'
    ? (card.shortFlavorHi || card.flavorHi || card.shortFlavor || card.flavor)
    : (card.shortFlavor || card.flavor)
}

/** Longest word length in user-perceived characters (Devanagari matras don't count separately). */
export function longestWordLength(text: string): number {
  const Seg = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => { segment: (s: string) => Iterable<unknown> } }).Segmenter
  const count = (w: string) => (Seg ? Array.from(new Seg(undefined, { granularity: 'grapheme' }).segment(w)).length : Array.from(w).length)
  return text.split(/\s+/).reduce((m, w) => Math.max(m, count(w)), 0)
}

export interface GameCardProps {
  card: GameCardType
  size?: CardSize
  state?: CardState
  onClick?: () => void
  /** Why a locked card can't be played (added to the accessible name) */
  lockedReason?: string
  /** Full size only: stretch to the container width (aspect 128:184), e.g. library grid */
  fluid?: boolean
  /** Hide the flavor text on a full card (tablet hand) */
  noFlavor?: boolean
  className?: string
  style?: CSSProperties
  /** Extra content (e.g. a "Rahul played" caption) rendered after the card */
  children?: ReactNode
  /** Override the accessible name */
  ariaLabel?: string
  /** Hand toolbar: roving tabindex */
  tabIndex?: number
  /** data-* hooks for tests / coach marks */
  dataTarget?: string
}

/** True when a word of the element's text wraps across lines (hyphenated or broken). */
function splitsAWord(el: HTMLElement): boolean {
  const node = el.firstChild
  if (!node || node.nodeType !== Node.TEXT_NODE || typeof document.createRange !== 'function') return false
  const text = node.textContent ?? ''
  const range = document.createRange()
  if (typeof range.getClientRects !== 'function') return false
  for (const m of text.matchAll(/[^\s/\u200B]+/g)) {
    range.setStart(node, m.index ?? 0)
    range.setEnd(node, (m.index ?? 0) + m[0].length)
    const tops = new Set(Array.from(range.getClientRects()).filter(r => r.width > 0).map(r => Math.round(r.top)))
    if (tops.size > 1) return true
  }
  return false
}

/**
 * Card name. Hand cards that would need more than 3 lines at 13 px, or would split a word
 * across lines, drop to 12 px (same rule as long words, spec §D.14). Long words break only at
 * syllable points (lib/hyphenate). Names that still don't fit are a content task (shortName).
 */
function CardName({ title, className, fit }: { title: string; className: string; fit: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [small, setSmall] = useState(false)
  useLayoutEffect(() => {
    if (!fit) return
    setSmall(false)
    const check = () => {
      const el = ref.current
      if (el && (el.scrollHeight > el.clientHeight + 1 || splitsAWord(el))) setSmall(true)
    }
    const raf = requestAnimationFrame(check)
    document.fonts?.ready.then(() => requestAnimationFrame(check)).catch(() => {})
    return () => cancelAnimationFrame(raf)
  }, [title, fit])
  return <span ref={ref} className={`${className}${small ? ' is-fit' : ''}`} aria-hidden="true">{hyphenateText(title)}</span>
}

/**
 * Headline value ("−10%", "Floor ₹2 L", "कम से कम ₹50K"). On narrow cards a value wider than the
 * card drops to 13 px and may wrap to two lines instead of being clipped at the card edge.
 */
function CardValue({ text, className, fit }: { text: string; className: string; fit: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [small, setSmall] = useState(false)
  useLayoutEffect(() => {
    if (!fit) return
    setSmall(false)
    const check = () => {
      const el = ref.current
      if (el && el.scrollWidth > el.clientWidth + 1) setSmall(true)
    }
    const raf = requestAnimationFrame(check)
    document.fonts?.ready.then(() => requestAnimationFrame(check)).catch(() => {})
    return () => cancelAnimationFrame(raf)
  }, [text, fit])
  return <span ref={ref} className={`${className}${small ? ' is-fit' : ''}`} aria-hidden="true">{text}</span>
}

const LIFT = { type: 'spring' as const, stiffness: 500, damping: 32 }

/**
 * The one game-card component (spec §D.14): cream "paper" card, coloured type band with a
 * lucide icon, tier gem, name, and one headline value. Hand cards never show flavor text.
 */
export function GameCard({
  card, size = 'hand', state = 'idle', onClick, lockedReason, fluid, noFlavor, className = '', style, children,
  ariaLabel, tabIndex, dataTarget,
}: GameCardProps) {
  const { t, i18n } = useTranslation()
  const lang = asLang(i18n.language)

  if (state === 'faceDown') {
    return (
      <div className={`gcard gcard--${size} gcard--back ${className}`.trim()} style={style} role="img" aria-label={t('card.back')}>
        <span className="gcard__back-mark" aria-hidden="true">BHAO</span>
        {children}
      </div>
    )
  }

  const kind = cardKind(card)
  const Icon = cardIcon(card)
  const title = cardTitle(card, lang)
  const headline = cardHeadline(card, lang)
  const narrow = size !== 'full'
  const isLong = size === 'hand' && longestWordLength(title) >= 9
  const typeLabel = t(`card.type.${kind}`)
  const tierLabel = t(`card.tier.${card.tier}`)
  const label = ariaLabel ?? [
    t('card.aria', { name: cardFullTitle(card, lang), type: typeLabel, tier: tierLabel, headline: headline.spoken }),
    state === 'locked' ? (lockedReason ?? t('card.locked')) : '',
  ].filter(Boolean).join(' ')

  const cls = [
    'gcard', `gcard--${size}`, `gcard--${kind}`,
    narrow ? 'is-narrow' : '',
    fluid ? 'gcard--fluid' : '',
    card.tier === 'legendary' ? 'is-legendary' : '',
    state === 'locked' ? 'is-locked' : '',
    state === 'selected' ? 'is-selected' : '',
    onClick ? 'is-interactive' : '',
    className,
  ].filter(Boolean).join(' ')

  const body = (
    <>
      <span className="gcard__band" aria-hidden="true">
        <Icon size={size === 'full' ? 18 : 16} strokeWidth={2.25} />
        {!narrow && <span className="gcard__type">{typeLabel}</span>}
      </span>
      <i className={`gcard__gem gem--${card.tier}`} aria-hidden="true" />
      {state === 'locked' && <Lock className="gcard__lock" size={12} strokeWidth={2.5} aria-hidden="true" />}
      <CardName title={title} className={`gcard__name${isLong ? ' is-long' : ''}${size === 'full' && title.length > 18 ? ' is-long-name' : ''}`} fit={(size === 'hand' && !isLong) || size === 'sheet'} />
      {size === 'full' && !noFlavor && <span className="gcard__flavor" aria-hidden="true">{cardFlavor(card, lang)}</span>}
      {headline.kind === 'choose'
        ? <span className={`gcard__value tone-${headline.tone}`} aria-hidden="true"><span className="gcard__dots"><i className="dot-spend" /><i className="dot-save" /><i className="dot-invest" /></span></span>
        : <CardValue text={headline.text} className={`gcard__value tone-${headline.tone}`} fit={narrow} />}
      {children}
    </>
  )

  if (!onClick) {
    return (
      <div className={cls} style={style} role="img" aria-label={label} data-target={dataTarget}>
        {body}
      </div>
    )
  }

  const selected = state === 'selected'
  return (
    <motion.button
      type="button"
      className={cls}
      style={style}
      onClick={onClick}
      aria-label={label}
      aria-disabled={state === 'locked' ? true : undefined}
      aria-pressed={selected ? true : undefined}
      tabIndex={tabIndex}
      data-target={dataTarget}
      data-card-id={card.id}
      initial={false}
      animate={{ y: selected ? (size === 'full' ? -18 : -14) : 0, scale: selected && size !== 'full' ? 1.06 : 1 }}
      transition={LIFT}
    >
      {body}
    </motion.button>
  )
}
