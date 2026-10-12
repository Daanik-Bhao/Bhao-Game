import { useState, useEffect } from 'react'
import { GameCard as GameCardComponent } from '../GameCard'
import { GameLog, translateLogEntry } from './GameLog'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollText, X } from 'lucide-react'

import { formatWealth } from '../../types/game'
import type { GameCard } from '../../types/game'
import { TURN_TIME_LIMIT_MS } from '../../lib/gameEngine'
import type { InnerBoardProps } from './GameBoard'
import { LevelHUD } from './LevelHUD'
import { EmoteButton, PlayersStrip, TurnCountdown } from './BoardShared'
import { formatSignedWealth, getDecisionPreview, getTargetableIndices, sortDecisionOptions } from './boardUtils'
import './GameBoardMobile.css'

interface GameBoardMobileProps extends InnerBoardProps {
  orientation: 'portrait' | 'landscape'
  /** Usable board height in px, used to size the hand cards. */
  areaHeight: number
}

const DECISION_COLORS = {
  spend: { bg: '#fff1f2', border: '#fda4af', labelColor: '#e11d48', labelBg: '#ffe4e6' },
  save: { bg: '#f0fdf4', border: '#86efac', labelColor: '#16a34a', labelBg: '#dcfce7' },
  invest: { bg: '#eff6ff', border: '#93c5fd', labelColor: '#2563eb', labelBg: '#dbeafe' },
}

const HI_DECISION_LABELS: Record<string, string> = { Spend: 'खर्च करें', Save: 'बचत करें', Invest: 'निवेश करें' }

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function GameBoardMobile({
  gameState,
  myPlayerId,
  isMultiplayer,
  uiPhase,
  onlinePlayers,
  onDrawCard,
  onPlayCard,
  onTargetSelect,
  onDecision,
  onCancelTargeting,
  activeEmotes,
  onSendEmote,
  highlightPlayerId,
  orientation,
  areaHeight,
}: GameBoardMobileProps) {
  const { t, i18n } = useTranslation()
  const hi = i18n.language === 'hi'
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null)
  const [showLog, setShowLog] = useState(false)

  const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId)
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
  const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const targetIndices = getTargetableIndices(gameState, myPlayerId)
  const isPlayPhase = isMyTurn && gameState.phase === 'play' && uiPhase === 'playing'

  // Clear the selection when it is no longer valid
  useEffect(() => {
    if (!isPlayPhase) setSelectedCard(null)
  }, [isPlayPhase])
  useEffect(() => {
    if (selectedCard && !myPlayer?.hand.some(c => c.id === selectedCard.id)) setSelectedCard(null)
  }, [myPlayer?.hand, selectedCard])

  // Card size: fill the available space without overflowing short landscape screens
  const cardH = orientation === 'landscape'
    ? clamp(Math.floor(areaHeight - 170), 118, 200)
    : clamp(Math.floor(areaHeight * 0.3), 150, 220)
  const cardW = Math.round(cardH * 0.7)

  const cardName = (c: GameCard) => (hi ? (c.shortNameHi || c.nameHi || c.shortName || c.name) : (c.shortName || c.name))
  const cardFlavor = (c: GameCard) => (hi ? (c.shortFlavorHi || c.flavorHi || c.shortFlavor || c.flavor) : (c.shortFlavor || c.flavor))
  const latestLog = gameState.log[0]

  const confirmPlay = () => {
    if (!selectedCard) return
    onPlayCard(selectedCard)
    setSelectedCard(null)
  }

  return (
    <div
      className={`mb-board mb-${orientation}`}
      style={{ ['--mb-card-w' as string]: `${cardW}px`, ['--mb-card-h' as string]: `${cardH}px` }}
    >
      {/* Players */}
      <PlayersStrip
        className="mb-players"
        gameState={gameState}
        myPlayerId={myPlayerId}
        isMultiplayer={isMultiplayer}
        onlinePlayers={onlinePlayers}
        targeting={uiPhase === 'targeting'}
        onTargetSelect={onTargetSelect}
        activeEmotes={activeEmotes}
        highlightPlayerId={highlightPlayerId}
      />

      {/* Status bar: timer, latest log line, log + emote buttons */}
      <div className="mb-statusbar">
        {gameState.phase !== 'game_over' && (
          <TurnCountdown
            key={gameState.turnStartTime}
            turnStartTime={gameState.turnStartTime}
            timeLimit={TURN_TIME_LIMIT_MS}
            label={isMyTurn ? 'You' : currentPlayer?.name}
          />
        )}
        <button type="button" className="mb-ticker" onClick={() => setShowLog(true)}>
          {latestLog ? translateLogEntry(latestLog, i18n.language) : t('game.gameLog')}
        </button>
        <button type="button" className="board-icon-btn" aria-label={t('game.gameLog')} onClick={() => setShowLog(true)}>
          <ScrollText size={20} />
        </button>
        {onSendEmote && <EmoteButton onSendEmote={onSendEmote} direction="down" />}
      </div>

      <div className="mb-main">
        {gameState.levelState && <LevelHUD levelState={gameState.levelState} />}

        {/* Not my turn */}
        {!isMyTurn && uiPhase === 'playing' && (
          <div className="mb-panel mb-center">
            <div className="mb-big-emoji" aria-hidden>⏳</div>
            <div className="mb-title">{t('game.waitingFor', { name: currentPlayer?.name })}</div>
            <div className="mb-sub">{t('game.theirTurnToPlay')}</div>
          </div>
        )}

        {/* Draw */}
        {isMyTurn && gameState.phase === 'draw' && (
          <div className="mb-panel mb-center">
            <div className="mb-title">{t('game.yourTurnDraw')}</div>
            <div className="mb-sub">{gameState.deck.length} cards left in deck</div>
          </div>
        )}

        {/* Play: hand */}
        {isPlayPhase && (
          <>
            <div className="mb-section-head">
              <span>Pick a card to play</span>
              {gameState.drawnCard && <span className="mb-drawn-chip">New: {cardName(gameState.drawnCard)}</span>}
            </div>
            <div className="mb-hand" role="listbox" aria-label="Your hand">
              <AnimatePresence>
                {myPlayer?.hand.map(card => (
                  <div
                    key={card.id}
                    className={`mb-card${selectedCard?.id === card.id ? ' selected' : ''}`}
                    role="option"
                    aria-selected={selectedCard?.id === card.id}
                  >
                    {gameState.drawnCard?.id === card.id && <span className="mb-new-badge">NEW</span>}
                    <GameCardComponent
                      card={card}
                      compact
                      selected={selectedCard?.id === card.id}
                      onClick={() => setSelectedCard(prev => (prev?.id === card.id ? null : card))}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mb-selected-info" aria-live="polite">
              {selectedCard ? (
                <>
                  <strong>{cardName(selectedCard)}</strong>
                  <span> — {cardFlavor(selectedCard)}</span>
                </>
              ) : (
                <span className="mb-muted">Tap a card to see what it does.</span>
              )}
            </div>
          </>
        )}

        {/* Targeting */}
        {uiPhase === 'targeting' && gameState.pendingTarget && (
          <div className="mb-panel mb-target">
            <div className="mb-title">🎯 {t('game.selectTarget', { card: cardName(gameState.pendingTarget.card) })}</div>
            <div className="mb-target-list">
              {targetIndices.map(i => {
                const p = gameState.players[i]
                return (
                  <button key={p.id} type="button" className="mb-target-btn" onClick={() => onTargetSelect(i)}>
                    <span className="mb-target-name">{p.name}</span>
                    <span className="mb-target-wealth">{formatWealth(p.wealth)}</span>
                  </button>
                )
              })}
              {targetIndices.length === 0 && <div className="mb-sub">No opponents left to target.</div>}
            </div>
          </div>
        )}
      </div>

      {/* Primary action footer */}
      {isMyTurn && gameState.phase === 'draw' && (
        <div className="mb-footer">
          <button type="button" className="mb-primary-btn gold" onClick={onDrawCard}>
            {t('game.drawCardBtn', { count: gameState.deck.length })}
          </button>
        </div>
      )}
      {isPlayPhase && (
        <div className="mb-footer">
          <button type="button" className="mb-primary-btn gold" disabled={!selectedCard} onClick={confirmPlay}>
            {selectedCard ? `Play ${cardName(selectedCard)}` : 'Select a card'}
          </button>
        </div>
      )}
      {uiPhase === 'targeting' && gameState.pendingTarget && (
        <div className="mb-footer">
          <button type="button" className="mb-primary-btn secondary" onClick={onCancelTargeting}>
            {t('common.cancel')}
          </button>
        </div>
      )}

      {/* Decision sheet (mandatory choice — no close button) */}
      <AnimatePresence>
        {uiPhase === 'decision' && gameState.pendingDecision && (
          <motion.div
            className="mb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mb-decision-modal"
              role="dialog"
              aria-modal="true"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
            >
              <div className="mb-decision-header">
                <h3>{cardName(gameState.pendingDecision.card)}</h3>
                <p>{cardFlavor(gameState.pendingDecision.card)}</p>
              </div>
              <div className="mb-decision-options">
                {sortDecisionOptions(gameState.pendingDecision.card.options).map(opt => {
                  const c = DECISION_COLORS[opt.type] || DECISION_COLORS.save
                  const preview = getDecisionPreview(opt, myPlayer)
                  const label = hi ? (opt.labelHi || HI_DECISION_LABELS[opt.label] || opt.label) : opt.label
                  const desc = opt.shortDescription
                    ? (hi ? (opt.shortDescriptionHi || opt.shortDescription) : opt.shortDescription)
                    : (hi && opt.descriptionHi ? opt.descriptionHi : opt.description)
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => onDecision(opt.type)}
                      className="mb-decision-btn"
                      style={{ background: c.bg, borderColor: c.border }}
                    >
                      <div className="mb-decision-text">
                        <span className="mb-decision-badge" style={{ color: c.labelColor, background: c.labelBg }}>{label}</span>
                        <span className="mb-decision-desc">{desc}</span>
                        {!!opt.investRisk && opt.failEffect && (
                          <span className="mb-decision-risk">⚠️ {opt.investRisk}% risk: {formatSignedWealth(preview.failValue)}</span>
                        )}
                      </div>
                      <div className="mb-decision-value" style={{ color: preview.value >= 0 ? '#16a34a' : '#e11d48' }}>
                        {formatSignedWealth(preview.value)}
                        {preview.multiplier !== 1 && <span className="decision-mult">×{preview.multiplier.toFixed(2)}</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full log sheet */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            className="mb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLog(false)}
          >
            <div className="mb-log-sheet" onClick={e => e.stopPropagation()}>
              <button type="button" className="board-icon-btn mb-log-close" aria-label={t('common.close', { defaultValue: 'Close' })} onClick={() => setShowLog(false)}>
                <X size={20} />
              </button>
              <GameLog log={gameState.log} playerName={myPlayer?.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
