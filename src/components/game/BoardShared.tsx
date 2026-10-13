import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Layers, Smile, TrendingUp } from 'lucide-react'
import { GameCard as GameCardView } from '../GameCard'
import { Avatar, Button } from '../ui'
import { HAND_SIZE, inflationPct } from '../../lib/gameEngine'
import { formatMoney } from '../../lib/format'
import { RivalChip, StandingsRow } from './PlayerBoard'
import { FeedList } from './GameLog'
import { LevelRulePill } from './LevelHUD'
import { EMOTES } from './boardUtils'
import { cardPlayability } from './economyUi'
import type { BoardModel } from './GameBoard'

// ---------------------------------------------------------------------------
// Rivals
// ---------------------------------------------------------------------------

/** Rival chips (spec §E.12): up to 3 equal chips; 4+ rivals scroll horizontally with snap. */
export function RivalsStrip({ m, inline }: { m: BoardModel; inline?: boolean }) {
  const { t } = useTranslation()
  const p = m.p
  return (
    <div
      className={`rivals mb-players${inline ? ' rivals--inline' : ''}${m.rivals.length > 3 ? ' is-scroll' : ''}`}
      role="group"
      aria-label={t('board.rivals')}
      data-tour="rivals"
    >
      {m.rivals.map(({ player, index }) => (
        <RivalChip
          key={player.id}
          player={player}
          seat={index}
          rank={m.ranks.get(player.id) ?? index + 1}
          isTurn={index === m.gs.currentPlayerIndex}
          targetable={m.state === 'targeting' && m.targetIndices.includes(index)}
          offline={p.isMultiplayer && !!p.onlinePlayers && !p.onlinePlayers.has(player.id)}
          voice={p.voiceBadges?.[player.id]}
          emote={p.activeEmotes?.[player.id]}
          onClick={() => m.onRivalTap(index)}
          inline={inline}
        />
      ))}
    </div>
  )
}

/** Desktop standings: everyone ranked, you highlighted (spec §E.24). */
export function Standings({ m }: { m: BoardModel }) {
  const { t } = useTranslation()
  const p = m.p
  const rows = m.gs.players.map((player, index) => ({ player, index })).sort((a, b) => (m.ranks.get(a.player.id) ?? 9) - (m.ranks.get(b.player.id) ?? 9))
  return (
    <ol className="standings desktop-players-strip" aria-label={t('board.standings')} data-tour="rivals">
      {rows.map(({ player, index }) => {
        const isMe = index === m.meIndex
        return (
          <StandingsRow
            key={player.id}
            player={player}
            seat={index}
            rank={m.ranks.get(player.id) ?? index + 1}
            isMe={isMe}
            meLabel={player.name}
            isTurn={index === m.gs.currentPlayerIndex}
            targetable={m.state === 'targeting' && m.targetIndices.includes(index)}
            voice={p.voiceBadges?.[player.id]}
            emote={p.activeEmotes?.[player.id]}
            onClick={isMe ? undefined : () => m.onRivalTap(index)}
          />
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Table centre: deck, last played card, rule pill, headline, feed
// ---------------------------------------------------------------------------

export function Deck({ m, size }: { m: BoardModel; size: 'mini' | 'full' }) {
  const { t } = useTranslation()
  const canDraw = m.state === 'draw'
  const n = m.gs.deck.length
  const inner = (
    <>
      <span className="deck__back deck__back--3" aria-hidden="true" />
      <span className="deck__back deck__back--2" aria-hidden="true" />
      <span className="deck__back" aria-hidden="true"><span>BHAO</span></span>
      <span className="deck__count">{size === 'full' || !m.landscapeCompact ? t('board.deckCount', { count: n }) : n}</span>
    </>
  )
  if (canDraw) {
    return (
      <button type="button" className={`deck deck--${size} is-drawable`} onClick={m.p.onDrawCard} aria-label={t('board.drawAria', { count: n })} data-tour="deck">
        {inner}
      </button>
    )
  }
  return <div className={`deck deck--${size}`} role="img" aria-label={t('board.deckAria', { count: n })} data-tour="deck">{inner}</div>
}

function LastPlayed({ m, size }: { m: BoardModel; size: 'mini' | 'full' }) {
  const { t } = useTranslation()
  const card = m.lastPlayed
  if (!card) return <div className={`lastplay lastplay--${size} is-empty`} aria-hidden="true" />
  const wobble = m.fx?.tier === 'large' && !m.reduced
  return (
    <motion.div
      key={`${card.id}-${m.fx?.key ?? 0}`}
      className={`lastplay lastplay--${size}`}
      initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
      animate={wobble ? { opacity: 1, y: 0, scale: 1, rotate: [0, -3, 3, -3, 3, 0] } : { opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ duration: 0.32, ease: [0.05, 0.7, 0.1, 1], rotate: { duration: 0.6, delay: 0.3 } }}
    >
      <GameCardView card={card} size={size} noFlavor={size === 'mini'} />
      {m.lastPlayedBy && (
        <span className="lastplay__by">{m.lastPlayedBy === 'me' ? t('board.youPlayed') : t('board.playedBy', { name: m.lastPlayedBy })}</span>
      )}
    </motion.div>
  )
}

/** Headline + line for the current board state (spec §E.12 table). */
export function useTurnMessage(m: BoardModel): { title: string; line: string } {
  const { t, i18n } = useTranslation()
  const hi = i18n.language === 'hi'
  switch (m.state) {
    case 'draw': return { title: t('board.yourTurn'), line: t('board.drawLine') }
    case 'play':
    case 'decision': return { title: t('board.yourTurn'), line: t('board.playLine') }
    case 'targeting': {
      const c = m.gs.pendingTarget?.card
      const name = c ? (hi ? (c.shortNameHi || c.nameHi || c.shortName || c.name) : (c.shortName || c.name)) : ''
      return { title: t('board.chooseRival', { card: name }), line: t('board.chooseRivalLine') }
    }
    case 'over': return { title: t('board.gameOver'), line: '' }
    default: return {
      title: t('board.isPlaying', { name: m.current?.name ?? '' }),
      line: (m.me?.skippedTurns ?? 0) > 0 ? t('board.youSkip') : t('board.waitLine'),
    }
  }
}

export function TurnMessage({ m, inlineAction }: { m: BoardModel; inlineAction?: boolean }) {
  const { t } = useTranslation()
  const msg = useTurnMessage(m)
  const infl = m.me ? inflationPct(m.me) : null
  return (
    <div className={`turnmsg${inlineAction ? ' turnmsg--inline' : ''}`} aria-live="polite">
      {infl !== null && (
        <span className="eventchip">
          <TrendingUp size={14} strokeWidth={2.5} aria-hidden="true" />
          {m.landscapeCompact ? t('board.inflationShort', { pct: infl }) : t('board.inflationChip', { pct: infl })}
        </span>
      )}
      <h2 className="turnmsg__title">
        {m.state === 'wait' && m.current && <Avatar name={m.current.name} seat={m.gs.currentPlayerIndex} size="s" />}
        <span>{msg.title}</span>
      </h2>
      {inlineAction
        ? <ActionBar m={m} inline />
        : msg.line && <p className="turnmsg__line">{msg.line}</p>}
      {!inlineAction && m.state !== 'over' && m.showFeed && <FeedList log={m.gs.log} n={2} meName={m.me?.name} />}
      {inlineAction && m.state === 'targeting' && <p className="turnmsg__line">{t('board.chooseRivalLine')}</p>}
    </div>
  )
}

/** Table centre for compact layouts. */
export function TableCentre({ m, landscape }: { m: BoardModel; landscape?: boolean }) {
  return (
    <div className={`table-centre${landscape ? ' table-centre--landscape' : ''}`}>
      <LevelRulePill gameState={m.gs} onOpen={m.openRule} className="table-centre__pill" />
      <div className="table-centre__cards">
        <Deck m={m} size="mini" />
        <LastPlayed m={m} size="mini" />
      </div>
      <TurnMessage m={m} inlineAction={landscape} />
    </div>
  )
}

/** Desktop table zone: full-size deck + last played card + headline. */
export function TableZone({ m }: { m: BoardModel }) {
  return (
    <div className="tablezone">
      <LevelRulePill gameState={m.gs} onOpen={m.openRule} className="table-centre__pill" />
      <Deck m={m} size="full" />
      <LastPlayed m={m} size="full" />
      <TurnMessage m={m} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hand (toolbar) + action bar
// ---------------------------------------------------------------------------

export type HandSize = 'hand' | 'tablet' | 'full'

/** Your 5 cards (spec §E.12 / §D.14): role="toolbar", arrow keys move, Enter opens the card sheet. */
export function Hand({ m, size }: { m: BoardModel; size: HandSize }) {
  const { t } = useTranslation()
  const [focusIdx, setFocusIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hand = m.hand
  const myPlay = m.state === 'play' || m.state === 'decision'
  const empties = Math.max(0, HAND_SIZE - hand.length)

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const n = hand.length
    if (!n) return
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (focusIdx + (e.key === 'ArrowRight' ? 1 : n - 1)) % n
    setFocusIdx(next)
    ref.current?.querySelectorAll<HTMLButtonElement>('button.gcard')[next]?.focus()
  }

  const cardSize = size === 'hand' ? 'hand' : 'full'
  return (
    <div
      ref={ref}
      className={`hand hand--${size} ${size === 'full' ? 'dk-hand' : 'mb-hand'}`}
      role="toolbar"
      aria-label={t('board.yourHandCount', { count: hand.length })}
      data-tour="hand"
      onKeyDown={onKey}
    >
      <AnimatePresence initial={false}>
        {hand.map((card, i) => {
          const play = cardPlayability(m.gs, m.meIndex, card, myPlay)
          const selected = m.sheetCardId === card.id || m.gs.pendingTarget?.card.id === card.id
          const locked = !play.ok && !selected
          return (
            <motion.div
              key={card.id}
              className="hand__slot econ-hand-card"
              data-tour="hand-card"
              layout={!m.reduced}
              initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: -90, scale: 0.9, transition: { duration: 0.32 } }}
              transition={{ duration: 0.22, delay: m.reduced ? 0 : i * 0.04 }}
            >
              <GameCardView
                card={card}
                size={cardSize}
                noFlavor={size !== 'full'}
                state={selected ? 'selected' : locked ? 'locked' : 'idle'}
                lockedReason={play.reason}
                onClick={() => { setFocusIdx(i); m.openCard(card.id) }}
                tabIndex={i === Math.min(focusIdx, hand.length - 1) ? 0 : -1}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
      {Array.from({ length: empties }, (_, i) => <span key={`empty-${i}`} className="hand__empty" aria-hidden="true" />)}
    </div>
  )
}

/** State-dependent action bar (spec §E.12). Only the draw state has a primary button. */
export function ActionBar({ m, inline }: { m: BoardModel; inline?: boolean }) {
  const { t } = useTranslation()
  let content
  switch (m.state) {
    case 'draw':
      content = (
        <Button variant="primary" size={inline ? 'm' : 'l'} block={!inline} icon={<Layers size={22} strokeWidth={2.25} aria-hidden="true" />} onClick={m.p.onDrawCard}>
          {t('board.drawCard')}
        </Button>
      )
      break
    case 'play':
    case 'decision':
      content = <span className="hint">{m.desktop ? t('board.hintDesktop') : t('board.hint')}</span>
      break
    case 'targeting':
      content = <Button variant="outline" size={inline ? 's' : 'm'} onClick={m.p.onCancelTargeting}>{t('common.cancel')}</Button>
      break
    case 'wait':
      content = <span className="hint">{t('board.waitTurn')}</span>
      break
    default:
      content = null
  }
  return <div className={inline ? 'actionbar actionbar--inline' : 'actionbar'} data-tour="action-bar">{content}</div>
}

// ---------------------------------------------------------------------------
// Comms dock slot (spec §E.18) + emote button
// ---------------------------------------------------------------------------

/** Tap-to-open emote picker, as a 48 px round dock button. */
export function EmoteButton({ onSendEmote, direction = 'up' }: { onSendEmote: (emoji: string) => void; direction?: 'up' | 'down' | 'left' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <div className="emote-wrap">
      <button type="button" className="dockbtn" aria-label={t('board.sendEmote')} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Smile size={22} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {open && (
        <div className={`emote-picker paper emote-picker--${direction}`} role="menu" aria-label={t('board.sendEmote')}>
          {EMOTES.map(emoji => (
            <button key={emoji} type="button" role="menuitem" className="emote-picker__opt emoji" onClick={() => { onSendEmote(emoji); setOpen(false) }}>
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Where the page's comms controls go: a right-edge stack on phones, inline in the top bar elsewhere. */
export function DockSlot({ m, variant }: { m: BoardModel; variant: 'stack' | 'bar' }) {
  const { p } = m
  if (!p.extraControls && !p.onSendEmote) return null
  return (
    <div className={`dock dock--${variant}`} data-tour="dock">
      {p.onSendEmote && <EmoteButton onSendEmote={p.onSendEmote} direction={variant === 'stack' ? 'left' : 'down'} />}
      {p.extraControls}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Year change banner (spec §E.16): 1.2 s over the table centre
// ---------------------------------------------------------------------------

export function YearBanner({ m }: { m: BoardModel }) {
  const { t, i18n } = useTranslation()
  const b = m.yearBanner
  return (
    <AnimatePresence>
      {b && (
        <motion.div
          key={b.round}
          className="year-banner"
          role="status"
          initial={m.reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <b>{t('board.yearBanner', { n: b.round })}</b>
          <span>{t('board.yearBannerInflation', { pct: b.inflation })}</span>
          {b.investChange !== 0 && (
            <span>{t('board.yearBannerInvest', { amount: formatMoney(b.investChange, { signed: true, lang: i18n.language }) })}</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
