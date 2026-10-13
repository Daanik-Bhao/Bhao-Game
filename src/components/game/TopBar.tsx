import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Menu, ScrollText, Timer } from 'lucide-react'
import { Badge, Button } from '../ui'
import { TURN_TIME_LIMIT_MS } from '../../lib/gameEngine'
import { TurnRing } from './TurnTimer'
import { formatClock, useMatchRemaining, useTurnRemaining } from './boardUtils'
import { yearLabel } from './economyUi'
import type { BoardModel } from './GameBoard'
import { RivalsStrip, DockSlot } from './BoardShared'

export type TopBarVariant = 'portrait' | 'landscape' | 'desktop'

/** Match clock chip: hidden until the last 2:00 (amber), attack-red under 0:30 (spec q9). */
export function MatchClockChip({ m }: { m: BoardModel }) {
  const { t } = useTranslation()
  const remaining = useMatchRemaining(m.gs)
  if (m.gs.phase === 'game_over' || remaining >= 120000) return null
  return (
    <span className={`clock-chip${remaining < 30000 ? ' is-danger' : ''}`} role="status">
      <Timer size={14} strokeWidth={2.5} aria-hidden="true" />
      {t('board.clockLeft', { time: formatClock(remaining) })}
    </span>
  )
}

function YearBox({ m, compact }: { m: BoardModel; compact?: boolean }) {
  const { t } = useTranslation()
  const { round, max } = yearLabel(m.gs)
  const shown = Math.min(round, max)
  const left = Math.max(0, max - shown)
  const pct = max > 0 ? (shown / max) * 100 : 0
  return (
    <button type="button" className="yearbox" onClick={m.openYear} aria-label={t('board.yearAria', { n: shown, max, left })} data-tour="year">
      <span className="yearbox__lbl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={shown}
            className="yearbox__year"
            initial={m.reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={m.reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {t('board.yearOf', { n: shown, max })}
          </motion.span>
        </AnimatePresence>
        {!compact && <span className="yearbox__left">{t('board.yearsLeft', { count: left })}</span>}
      </span>
      <span className="yearbar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
    </button>
  )
}

function LogButton({ m, desktop }: { m: BoardModel; desktop?: boolean }) {
  const { t } = useTranslation()
  const badge = <Badge count={m.unreadLog} float label={t('board.newMoves', { count: m.unreadLog })} />
  if (desktop) {
    return (
      <span className="topbar__btnwrap">
        <Button variant="outline" size="s" icon={<ScrollText size={18} strokeWidth={2.25} aria-hidden="true" />} onClick={m.openLog}>{t('board.gameLog')}</Button>
        {badge}
      </span>
    )
  }
  return (
    <button type="button" className="iconbtn" aria-label={t('game.log')} onClick={m.openLog}>
      <ScrollText size={22} strokeWidth={2.25} aria-hidden="true" />
      {badge}
    </button>
  )
}

function DesktopTurn({ m }: { m: BoardModel }) {
  const { t } = useTranslation()
  const remaining = useTurnRemaining(m.gs.turnStartTime, TURN_TIME_LIMIT_MS)
  return (
    <span className="topbar__turn">
      <b>{m.isMyTurn ? t('board.yourTurn') : t('board.isPlayingShort', { name: m.current?.name ?? '' })}</b>
      <small>{t('board.secondsLeft', { n: Math.ceil(remaining / 1000) })}</small>
    </span>
  )
}

/** Slim match top bar (spec §E.12 / §E.23 / §E.24). */
export function TopBar({ m, variant }: { m: BoardModel; variant: TopBarVariant }) {
  const { t } = useTranslation()
  const running = m.gs.phase !== 'game_over'
  const ring = running && (
    <TurnRing key={m.gs.turnStartTime} turnStartTime={m.gs.turnStartTime} timeLimit={TURN_TIME_LIMIT_MS} announce={m.isMyTurn} />
  )

  if (variant === 'desktop') {
    return (
      <header className="topbar topbar--desktop" data-tour="topbar">
        <Button variant="outline" size="s" icon={<Menu size={18} strokeWidth={2.25} aria-hidden="true" />} onClick={m.openMenu}>{t('common.menu')}</Button>
        <div className="topbar__mode">
          <b>{m.modeTitle}</b>
          {m.modeSubtitle && <small>{m.modeSubtitle}</small>}
        </div>
        <span className="topbar__spacer" />
        <MatchClockChip m={m} />
        <YearBox m={m} />
        <DockSlot m={m} variant="bar" />
        <LogButton m={m} desktop />
        {running && <span className="topbar__ringwrap">{ring}<DesktopTurn m={m} /></span>}
      </header>
    )
  }

  return (
    <header className={`topbar topbar--${variant}`} data-tour="topbar">
      <button type="button" className="iconbtn" aria-label={t('game.menu')} onClick={m.openMenu}>
        <Menu size={22} strokeWidth={2.25} aria-hidden="true" />
      </button>
      <YearBox m={m} compact={variant === 'landscape'} />
      <MatchClockChip m={m} />
      {variant === 'landscape' && <RivalsStrip m={m} inline />}
      {variant === 'landscape' && <DockSlot m={m} variant="bar" />}
      <LogButton m={m} />
      {ring}
    </header>
  )
}
