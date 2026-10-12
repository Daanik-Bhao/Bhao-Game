import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { translateLogEntry } from './GameLog'
import { PlayerBoard } from './PlayerBoard'
import type { GameState } from '../../types/game'
import { EMOTES, isTargetable, useTurnRemaining, type OpponentPlayEvent } from './boardUtils'

/** Non-blocking toast announcing the latest opponent move. */
export function OpponentPlayToast({ event }: { event: OpponentPlayEvent | null }) {
  const { i18n } = useTranslation()
  return (
    <div className="board-toast-layer" aria-live="polite">
      <AnimatePresence>
        {event && (
          <motion.div
            key={event.key}
            className="board-toast"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <span className="board-toast-icon" aria-hidden>🃏</span>
            <span className="board-toast-text">{translateLogEntry(event.entry, i18n.language)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Seconds left in the current turn; turns red under 10s. */
export function TurnCountdown({ turnStartTime, timeLimit, label }: { turnStartTime: number; timeLimit: number; label?: string }) {
  const remaining = useTurnRemaining(turnStartTime, timeLimit)
  const danger = remaining < 10000
  return (
    <motion.div
      className={`turn-countdown${danger ? ' danger' : ''}`}
      animate={danger ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={danger ? { repeat: Infinity, duration: 0.6 } : { duration: 0.2 }}
      role="timer"
    >
      {label && <span className="turn-countdown-label">{label}</span>}
      <span>{Math.ceil(remaining / 1000)}s</span>
    </motion.div>
  )
}

/** Tap-to-open emote picker (no hover needed). */
export function EmoteButton({ onSendEmote, direction = 'down' }: { onSendEmote: (emoji: string) => void; direction?: 'up' | 'down' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="emote-button-wrap">
      <button
        type="button"
        className="board-icon-btn"
        aria-label="Send emote"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        😊
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`emote-picker ${direction}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {EMOTES.map(emoji => (
              <button
                key={emoji}
                type="button"
                className="emote-option"
                onClick={() => { onSendEmote(emoji); setOpen(false) }}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PlayersStripProps {
  gameState: GameState
  myPlayerId: string
  isMultiplayer: boolean
  onlinePlayers?: Set<string>
  targeting: boolean
  onTargetSelect: (index: number) => void
  activeEmotes?: Record<string, string>
  highlightPlayerId?: string
  /** Include the local player (shown first) in the strip. */
  includeMe?: boolean
  className?: string
}

/** Row/column of compact player chips. Tapping an eligible opponent while targeting selects it. */
export function PlayersStrip({
  gameState, myPlayerId, isMultiplayer, onlinePlayers, targeting, onTargetSelect,
  activeEmotes, highlightPlayerId, includeMe = true, className = '',
}: PlayersStripProps) {
  const ordered = gameState.players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => includeMe || player.id !== myPlayerId)
  const meAt = ordered.findIndex(o => o.player.id === myPlayerId)
  if (meAt > 0) ordered.unshift(ordered.splice(meAt, 1)[0])

  return (
    <div className={className}>
      {ordered.map(({ player, index }) => {
        const isMe = player.id === myPlayerId
        const canTarget = targeting && isTargetable(player, myPlayerId)
        const highlighted = highlightPlayerId === player.id
        return (
          <motion.div
            key={player.id}
            className={`board-player-chip${player.hasForfeited ? ' forfeited' : ''}`}
            animate={highlighted
              ? { boxShadow: ['0 0 0 0px rgba(250,204,21,0)', '0 0 0 3px rgba(250,204,21,0.9)', '0 0 0 0px rgba(250,204,21,0)'] }
              : { boxShadow: '0 0 0 0px rgba(250,204,21,0)' }}
            transition={highlighted ? { duration: 1.1, repeat: 2 } : { duration: 0.2 }}
          >
            <PlayerBoard
              player={player}
              isCurrent={index === gameState.currentPlayerIndex}
              isMe={isMe}
              isTarget={canTarget}
              isOffline={isMultiplayer && !!onlinePlayers && !onlinePlayers.has(player.id)}
              wealthGoal={gameState.wealthGoal}
              seatIndex={index}
              onClick={() => onTargetSelect(index)}
              compact
            />
            <div className="chip-name">{isMe ? 'You' : player.name}{player.hasForfeited ? ' (left)' : ''}</div>
            <AnimatePresence>
              {activeEmotes?.[player.id] && (
                <motion.span
                  key={activeEmotes[player.id]}
                  className="chip-emote"
                  initial={{ scale: 0, y: 6 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  {activeEmotes[player.id]}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
