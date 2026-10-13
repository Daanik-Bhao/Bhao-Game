import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Mic, MicOff, Shield, TrendingDown, TrendingUp } from 'lucide-react'
import type { PlayerState } from '../../types/game'
import { Avatar } from '../ui'
import { getNetWorth } from '../../lib/gameEngine'
import { formatMoney, formatPct } from '../../lib/format'
import { yearDelta } from './boardUtils'

export type VoiceState = 'on' | 'muted' | 'speaking'

/** "▲ 8%" / "▼ 3%" with an icon (never colour alone). */
export function DeltaPct({ pct, className = '' }: { pct: number; className?: string }) {
  const up = pct >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`delta ${up ? 'delta--up' : 'delta--down'} ${className}`.trim()}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {formatPct(Math.abs(pct) < 0.5 ? 0 : pct, { signed: false }).replace('−', '')}
    </span>
  )
}

interface RivalChipProps {
  player: PlayerState
  seat: number
  rank: number
  isTurn: boolean
  /** Targeting: this rival can be hit */
  targetable?: boolean
  offline?: boolean
  voice?: VoiceState
  emote?: string
  onClick: () => void
  /** Landscape top bar: one-line value + delta */
  inline?: boolean
}

/** Rival chip (spec §D.16 / §E.12): avatar + rank, name, ₹ compact, yearly delta, shields, voice badge. */
export function RivalChip({ player, seat, rank, isTurn, targetable, offline, voice, emote, onClick, inline }: RivalChipProps) {
  const { t, i18n } = useTranslation()
  const nw = getNetWorth(player)
  const delta = yearDelta(player)
  const shields = player.activeDefenses?.length ?? 0
  const value = formatMoney(nw, { compact: true, abbr: true, lang: i18n.language })
  const label = targetable
    ? t('board.targetAria', { name: player.name, amount: value })
    : t('board.rivalAria', { name: player.name, amount: value, rank })

  return (
    <button
      type="button"
      className={[
        'rival',
        isTurn ? 'is-turn' : '',
        targetable ? 'is-target' : '',
        offline || player.hasForfeited ? 'is-offline' : '',
        inline ? 'rival--inline' : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-label={label}
    >
      <span className="rival__av">
        <Avatar name={player.name} seat={seat} size="s" rank={rank} />
        {voice && (
          <span className={`rival__voice is-${voice}`} aria-hidden="true">
            {voice === 'muted' ? <MicOff size={11} strokeWidth={2.5} /> : <Mic size={11} strokeWidth={2.5} />}
          </span>
        )}
      </span>
      <span className="rival__meta">
        <span className="rival__name">{player.name}{player.hasForfeited ? ` ${t('board.left')}` : ''}</span>
        <span className="rival__nw num">
          {value}
          {inline && delta && !targetable && <DeltaPct pct={delta.pct} />}
        </span>
        {targetable
          ? <span className="rival__target">{t('board.tapToTarget')}</span>
          : !inline && (
            <span className="rival__sub">
              {delta && <DeltaPct pct={delta.pct} />}
              {shields > 0 && <span className="rival__shields"><Shield size={12} strokeWidth={2.5} aria-hidden="true" />{shields}</span>}
            </span>
          )}
      </span>
      <AnimatePresence>
        {emote && (
          <motion.span
            key={emote}
            className="rival__emote emoji"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            {emote}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

interface StandingsRowProps {
  player: PlayerState
  seat: number
  rank: number
  isMe: boolean
  isTurn: boolean
  meLabel: string
  targetable?: boolean
  voice?: VoiceState
  emote?: string
  onClick?: () => void
}

/** Desktop standings row (spec §E.24): rank, avatar, name + status, ₹ compact + yearly delta. */
export function StandingsRow({ player, seat, rank, isMe, isTurn, meLabel, targetable, voice, emote, onClick }: StandingsRowProps) {
  const { t, i18n } = useTranslation()
  const nw = getNetWorth(player)
  const delta = yearDelta(player)
  const shields = player.activeDefenses?.length ?? 0
  const value = formatMoney(nw, { compact: true, abbr: true, lang: i18n.language })
  const status = targetable ? t('board.tapToTarget')
    : isTurn ? t('board.playingNow')
    : player.hasForfeited ? t('board.leftGame')
    : shields > 0 ? t('board.shieldsCount', { count: shields })
    : isMe ? meLabel : ''
  const content = (
    <>
      <span className="standing__rank num">{rank}</span>
      <span className="rival__av">
        <Avatar name={isMe ? meLabel : player.name} seat={seat} size="m" />
        {voice && (
          <span className={`rival__voice is-${voice}`} aria-hidden="true">
            {voice === 'muted' ? <MicOff size={11} strokeWidth={2.5} /> : <Mic size={11} strokeWidth={2.5} />}
          </span>
        )}
      </span>
      <span className="standing__name">
        {isMe ? t('board.you') : player.name}
        {status && <small className={targetable ? 'is-target' : ''}>{status}</small>}
      </span>
      <span className="standing__value">
        <span className="num">{value}</span>
        {delta && <DeltaPct pct={delta.pct} />}
      </span>
      {emote && <span className="rival__emote emoji" aria-hidden="true">{emote}</span>}
    </>
  )
  const cls = ['standing', isMe ? 'is-me' : '', isTurn ? 'is-turn' : '', targetable ? 'is-target' : ''].filter(Boolean).join(' ')
  if (!onClick) return <li className={cls}>{content}</li>
  return (
    <li className="standing-li">
      <button type="button" className={cls} onClick={onClick} aria-label={targetable ? t('board.targetAria', { name: player.name, amount: value }) : t('board.rivalAria', { name: player.name, amount: value, rank })}>
        {content}
      </button>
    </li>
  )
}
