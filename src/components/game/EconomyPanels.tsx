import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AssetClass, DecisionChoice, GameCard, GameState, PlayerState } from '../../types/game'
import { AnimatedNumber } from '../AnimatedNumber'
import { ASSETS } from '../../data/assets'
import { sortDecisionOptions } from './boardUtils'
import {
  RISK_META, cardPlayability, defenseBlurb, describeDecision, portfolioView, rupees, signedPct, signedRupees, yearLabel,
  type CardPlayability,
} from './economyUi'
import './EconomyPanels.css'

type Variant = 'desktop' | 'compact'

const HI_DECISION_LABELS: Record<string, string> = { spend: 'खर्च', save: 'बचत', invest: 'निवेश' }
const EN_DECISION_LABELS: Record<string, string> = { spend: 'Spend', save: 'Save', invest: 'Invest' }

// ---------------------------------------------------------------------------
// Risk badge
// ---------------------------------------------------------------------------

export function RiskBadge({ asset }: { asset: AssetClass }) {
  const info = ASSETS[asset]
  const meta = RISK_META[info.risk]
  return (
    <span className="econ-risk" style={{ color: meta.color, background: meta.bg }} title={info.crashChance ? `${Math.round(info.crashChance * 100)}% yearly crash chance` : 'No crash risk'}>
      {meta.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Decision options with engine previews
// ---------------------------------------------------------------------------

interface DecisionOptionsProps {
  state: GameState
  playerIndex: number
  card: GameCard
  onDecision: (choice: DecisionChoice) => void
  hi?: boolean
  variant: Variant
}

export function DecisionOptions({ state, playerIndex, card, onDecision, hi, variant }: DecisionOptionsProps) {
  return (
    <div className={`econ-dopts econ-${variant}`}>
      {sortDecisionOptions(card.options).map((opt, i) => {
        const view = describeDecision(state, playerIndex, card, opt)
        const badge = hi ? HI_DECISION_LABELS[opt.type] : EN_DECISION_LABELS[opt.type]
        const label = hi ? (opt.labelHi || opt.label) : opt.label
        const desc = opt.shortDescription
          ? (hi ? (opt.shortDescriptionHi || opt.shortDescription) : opt.shortDescription)
          : (hi && opt.descriptionHi ? opt.descriptionHi : opt.description)
        const showLabel = label && label.toLowerCase() !== badge.toLowerCase()
        return (
          <motion.button
            key={opt.type}
            type="button"
            className={`econ-dopt econ-dopt-${opt.type}${view.disabled ? ' is-disabled' : ''}`}
            disabled={!!view.disabled}
            aria-disabled={!!view.disabled}
            onClick={() => !view.disabled && onDecision(opt.type)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            whileHover={view.disabled ? undefined : { scale: 1.01 }}
            whileTap={view.disabled ? undefined : { scale: 0.98 }}
          >
            <div className="econ-dopt-top">
              <span className="econ-dopt-badge">{badge}</span>
              {showLabel && <span className="econ-dopt-label">{label}</span>}
              <span className={`econ-dopt-value tone-${view.headlineTone}`}>{view.headline}</span>
            </div>
            {view.asset && (
              <div className="econ-dopt-asset">
                <span className="econ-asset-emoji" aria-hidden>{view.asset.emoji}</span>
                <span className="econ-asset-name">{hi ? view.asset.nameHi : view.asset.name}</span>
                <RiskBadge asset={view.asset.id} />
              </div>
            )}
            {desc && <div className="econ-dopt-desc">{desc}</div>}
            {view.details.length > 0 && <div className="econ-dopt-details">{view.details.join(' · ')}</div>}
            {view.disabled
              ? <div className="econ-dopt-disabled">🚫 {view.disabled}</div>
              : view.hint && <div className={`econ-dopt-hint${view.forcedSale ? ' warn' : ''}`}>{view.forcedSale ? '' : '💡 '}{view.hint}</div>}
          </motion.button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

interface PortfolioPanelProps {
  player: PlayerState
  goal: number
  variant: Variant
  /** Optional identity header (avatar, name) rendered above the numbers */
  header?: ReactNode
}

export function PortfolioPanel({ player, goal, variant, header }: PortfolioPanelProps) {
  const v = portfolioView(player, goal)
  return (
    <div className={`econ-portfolio econ-${variant}`}>
      {header}
      <div className="econ-nw-row">
        <span className="econ-nw-label">Net worth</span>
        <span className="econ-nw-value"><AnimatedNumber value={v.netWorth} formatFn={rupees} duration={900} /></span>
      </div>
      <div className="econ-goal" aria-label={`${Math.round(v.progress * 100)}% of goal`}>
        <div className="econ-goal-track">
          <motion.div className="econ-goal-fill" animate={{ width: `${v.progress * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
        <span className="econ-goal-text">{Math.round(v.progress * 100)}% of {rupees(v.goal)}</span>
      </div>

      <div className="econ-cash-row">
        <span className="econ-row-icon" aria-hidden>💵</span>
        <span className="econ-row-main">
          <span className="econ-row-name">Cash</span>
          <span className="econ-row-sub">Inflation −{v.inflation}%/yr</span>
        </span>
        <span className="econ-row-value"><AnimatedNumber value={v.cash} formatFn={rupees} duration={900} /></span>
      </div>

      <div className="econ-holdings" role="list" aria-label="Investments">
        {v.holdings.length === 0 && <div className="econ-empty">No investments yet — Invest to make money work for you.</div>}
        <AnimatePresence initial={false}>
          {v.holdings.map(h => {
            const info = ASSETS[h.asset]
            const gainPct = h.principal > 0 ? ((h.value - h.principal) / h.principal) * 100 : 0
            const up = h.lastChangePct > 0
            const down = h.lastChangePct < 0
            return (
              <motion.div
                key={h.id}
                role="listitem"
                className="econ-holding"
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className="econ-row-icon" aria-hidden>{info.emoji}</span>
                <span className="econ-row-main">
                  <span className="econ-row-name">{h.name}</span>
                  <span className="econ-row-sub">
                    {info.name}
                    {h.lastChangePct !== 0 && (
                      <span className={`econ-tick ${up ? 'up' : down ? 'down' : ''}`}> {up ? '▲' : '▼'} {signedPct(h.lastChangePct)} last yr</span>
                    )}
                  </span>
                </span>
                <span className="econ-row-value">
                  {rupees(h.value)}
                  <span className={`econ-gain ${gainPct >= 0 ? 'up' : 'down'}`}>{signedRupees(h.value - h.principal)}</span>
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="econ-tags">
        <span className="econ-tag" title="Each Spend raises lifestyle: +1% inflation on cash">🛍️ Lifestyle {v.lifestyleLevel}</span>
        {v.savingStreak > 0 && <span className="econ-tag good">🔥 Save streak {v.savingStreak}</span>}
        <span className="econ-tag">📊 {rupees(v.invested)} invested</span>
      </div>
      <div className="econ-defenses">
        <span className="econ-def-title">🛡️ Defenses {v.defenses.length}/3</span>
        {v.defenses.length === 0
          ? <span className="econ-def-empty">None — equip defense cards for free</span>
          : v.defenses.map(d => (
            <span key={d.id} className="econ-def" title={defenseBlurb(d)}>
              <strong>{d.shortName || d.name}</strong>
              <span>{defenseBlurb(d)}</span>
            </span>
          ))}
      </div>
    </div>
  )
}

/** Compact one-line wallet summary (opens the portfolio sheet). */
export function WalletChip({ player, goal, onClick, wide }: { player: PlayerState; goal: number; onClick: () => void; wide?: boolean }) {
  const v = portfolioView(player, goal)
  return (
    <button type="button" className={`econ-wallet-chip${wide ? ' wide' : ''}`} onClick={onClick} aria-label="Open your portfolio">
      <span className="econ-wallet-icon" aria-hidden>💼</span>
      {wide ? (
        <>
          <span className="econ-wallet-part"><small>Cash</small>{rupees(v.cash)}</span>
          <span className="econ-wallet-part"><small>Invested</small>{rupees(v.invested)}</span>
          <span className="econ-wallet-part nw"><small>Net worth</small>{rupees(v.netWorth)}</span>
          <span className="econ-wallet-bar" aria-hidden><span style={{ width: `${v.progress * 100}%` }} /></span>
        </>
      ) : (
        <span className="econ-wallet-part nw">{rupees(v.netWorth)}</span>
      )}
      <span className="econ-wallet-caret" aria-hidden>▾</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Year
// ---------------------------------------------------------------------------

export function YearPill({ state, onClick, short }: { state: GameState; onClick?: () => void; short?: boolean }) {
  const { round, max } = yearLabel(state)
  const shown = Math.min(round, max)
  return (
    <button type="button" className="econ-year-pill" onClick={onClick} disabled={!onClick || !state.roundNews} aria-label={`Year ${shown} of ${max}`}>
      <span aria-hidden>📅</span>
      <span>{short ? `Y${shown}/${max}` : `Year ${shown} / ${max}`}</span>
    </button>
  )
}

/** Shows the strip for a few seconds whenever a new round's news arrives; can be reopened. */
export function useYearNews(state: GameState, durationMs = 8000) {
  const round = state.roundNews?.round
  const seen = useRef(round)
  const [openRound, setOpenRound] = useState<number | null>(null)

  useEffect(() => {
    if (round === undefined || round === seen.current) return
    seen.current = round
    if (state.phase !== 'game_over') setOpenRound(round)
  }, [round, state.phase])

  useEffect(() => {
    if (openRound === null) return
    const t = setTimeout(() => setOpenRound(null), durationMs)
    return () => clearTimeout(t)
  }, [openRound, durationMs])

  return {
    open: openRound !== null && openRound === round,
    show: () => { if (round !== undefined) setOpenRound(round) },
    hide: () => setOpenRound(null),
  }
}

const DEFAULT_MARKET: AssetClass[] = ['fd', 'gold', 'index', 'equity']

interface YearSummary {
  round: number
  market: { asset: AssetClass; pct: number; mine: boolean; crash: boolean }[]
  inflation?: string
  wiped: string[]
  event?: { card: GameCard; who: string; blockedBy: string[]; myDelta?: string; good: boolean }
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function summarize(state: GameState, me: PlayerState | null): YearSummary | null {
  const news = state.roundNews
  if (!news) return null
  const lines = news.lines
  const tick = state.lastMarketTick && state.lastMarketTick.round === news.round ? state.lastMarketTick.changes : null
  const mine = new Set((me?.holdings ?? []).map(h => h.asset))
  const assets = mine.size ? [...mine] : DEFAULT_MARKET
  const market = tick
    ? assets.filter(a => tick[a] !== undefined).map(a => {
      const pct = tick[a] ?? 0
      return { asset: a, pct, mine: mine.has(a), crash: ASSETS[a].crashPct > 0 && pct <= -ASSETS[a].crashPct }
    })
    : []

  let inflation: string | undefined
  const wiped: string[] = []
  if (me) {
    const infRe = new RegExp(`Inflation ate (₹[\\d,]+) of ${escapeRe(me.name)}'s cash`)
    for (const l of lines) {
      const m = l.match(infRe)
      if (m) inflation = m[1]
      if (l.startsWith(`☠️ ${me.name}'s `)) wiped.push(l.replace(`☠️ ${me.name}'s `, '').replace(' was wiped out.', ''))
    }
  }

  let event: YearSummary['event']
  const ev = state.lastEvent
  if (ev && ev.round === news.round) {
    const names = ev.affectedPlayerIds.map(id => (id === me?.id ? 'you' : state.players.find(p => p.id === id)?.name ?? '?'))
    const everyone = ev.affectedPlayerIds.length > 1 && ev.affectedPlayerIds.length >= state.players.filter(p => !p.hasForfeited).length
    const blockedBy: string[] = []
    for (const l of lines) {
      if (!l.includes(`blocked ${ev.card.name}`)) continue
      const m = l.match(/^🛡️ (.+?)'s (.+?) blocked /)
      if (m) blockedBy.push(`${m[1] === me?.name ? 'Your' : `${m[1]}'s`} ${m[2]}`)
    }
    let myDelta: string | undefined
    if (me) {
      const m = lines.find(l => l.match(new RegExp(`^(🎉|💥) ${escapeRe(me.name)}: `)))
      if (m) myDelta = m.split(': ').pop()?.replace('-', '−')
    }
    const good = (ev.card.effect?.value ?? 0) > 0
    event = { card: ev.card, who: everyone ? 'everyone' : names.join(', '), blockedBy, myDelta, good }
  }

  return { round: news.round, market, inflation, wiped, event }
}

interface YearNewsStripProps {
  state: GameState
  myPlayerId: string
  open: boolean
  onClose: () => void
  variant: Variant
}

export function YearNewsStrip({ state, myPlayerId, open, onClose, variant }: YearNewsStripProps) {
  const me = state.players.find(p => p.id === myPlayerId) ?? null
  const summary = useMemo(() => summarize(state, me), [state, me])
  const max = yearLabel(state).max
  return (
    <div className={`econ-year-layer econ-${variant}`} aria-live="polite">
      <AnimatePresence>
        {open && summary && (
          <motion.div
            key={summary.round}
            className="econ-year-strip"
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={onClose}
          >
            <div className="econ-year-head">
              <span className="econ-year-title">📅 Year {Math.min(summary.round, max)} / {max}</span>
              <span className="econ-year-sub">A year passed</span>
              <button type="button" className="econ-year-close" aria-label="Dismiss" onClick={e => { e.stopPropagation(); onClose() }}>✕</button>
            </div>
            {summary.market.length > 0 && (
              <div className="econ-year-market">
                {summary.market.map((m, i) => (
                  <motion.span
                    key={m.asset}
                    className={`econ-mkt ${m.pct >= 0 ? 'up' : 'down'}${m.mine ? ' mine' : ''}${m.crash ? ' crash' : ''}`}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    title={ASSETS[m.asset].name}
                  >
                    {ASSETS[m.asset].emoji} {m.crash ? '💥 ' : ''}{signedPct(m.pct)}
                  </motion.span>
                ))}
                {!summary.market.some(m => m.mine) && <span className="econ-year-note">market this year</span>}
              </div>
            )}
            <div className="econ-year-lines">
              {summary.inflation && <span className="econ-year-line loss">💸 Inflation ate {summary.inflation} of your cash</span>}
              {summary.wiped.map(w => <span key={w} className="econ-year-line loss">☠️ Your {w} was wiped out</span>)}
              {summary.event && (
                <span className={`econ-year-line event ${summary.event.good ? 'good' : 'bad'}`}>
                  🎲 <strong>{summary.event.card.name}</strong> → {summary.event.who}
                  {summary.event.blockedBy.length > 0 && <> · 🛡️ blocked by {summary.event.blockedBy.join(', ')}</>}
                  {summary.event.myDelta && <> · you {summary.event.myDelta}</>}
                </span>
              )}
              {!summary.inflation && !summary.event && summary.wiped.length === 0 && (
                <span className="econ-year-line">Quiet year — no life event.</span>
              )}
            </div>
            <motion.div className="econ-year-timer" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 8, ease: 'linear' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hand: playable frame + action bar
// ---------------------------------------------------------------------------

export function HandCardFrame({
  play, selected, isNew, children, className = '',
}: { play: CardPlayability; selected: boolean; isNew?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`econ-hand-card ${play.ok ? 'is-playable' : 'is-locked'}${selected ? ' is-selected' : ''} ${className}`}>
      {isNew && <span className="econ-hand-new">NEW</span>}
      {children}
      <span className={`econ-hand-tag ${play.action}${play.ok ? '' : ' off'}`}>
        {play.action === 'equip' ? (play.ok ? '🛡️ Free' : '🔒') : (play.ok ? '▶ Play' : '🔒')}
      </span>
    </div>
  )
}

interface HandActionBarProps {
  state: GameState
  playerIndex: number
  card: GameCard | null
  onPlay: (card: GameCard) => void
  onEquip?: (card: GameCard) => void
  onPass?: (cardId: string) => void
  variant: Variant
  cardName: (c: GameCard) => string
}

/** Buttons for the selected card: Play / Equip (free) + Pass (discard & end turn). */
export function HandActionBar({ state, playerIndex, card, onPlay, onEquip, onPass, variant, cardName }: HandActionBarProps) {
  const play = card ? cardPlayability(state, playerIndex, card, true) : null
  const equipsLeft = !state.equippedThisTurn
  return (
    <div className={`econ-actions econ-${variant}`}>
      {!card && (
        <div className="econ-actions-hint">
          👆 Pick a card. <span className="glow-word">Glowing</span> cards can be played now
          {equipsLeft ? ' · equipping a defense is free' : ''}
          {onPass ? ' · or Pass to discard one' : ''}
        </div>
      )}
      {card && play && (
        <>
          {onPass && (
            <button type="button" className="econ-btn econ-btn-pass" onClick={() => onPass(card.id)} title="Discard this card and end your turn">
              <span>Pass</span>
              <small>discard · ends turn</small>
            </button>
          )}
          {play.action === 'equip' ? (
            <button
              type="button"
              className="econ-btn econ-btn-equip"
              disabled={!play.ok}
              onClick={() => (onEquip ? onEquip(card) : onPlay(card))}
            >
              <span>🛡️ Equip {cardName(card)}</span>
              <small>{play.ok ? 'free · doesn’t end turn' : play.reason}</small>
            </button>
          ) : (
            <button type="button" className="econ-btn econ-btn-play" disabled={!play.ok} onClick={() => onPlay(card)}>
              <span>▶ Play {cardName(card)}</span>
              <small>{play.ok ? (card.type === 'decision' ? 'choose Save / Spend / Invest' : 'ends your turn') : play.reason}</small>
            </button>
          )}
        </>
      )}
    </div>
  )
}
