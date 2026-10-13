import { useState, useEffect } from 'react'
import { GameCard as GameCardComponent } from '../GameCard'
import { GameLog, translateLogEntry } from './GameLog'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollText, X } from 'lucide-react'

import type { GameCard } from '../../types/game'
import { HAND_SIZE, TURN_TIME_LIMIT_MS } from '../../lib/gameEngine'
import type { InnerBoardProps } from './GameBoard'
import { LevelHUD } from './LevelHUD'
import { EmoteButton, PlayersStrip, TurnCountdown } from './BoardShared'
import { getTargetableIndices } from './boardUtils'
import {
  DecisionOptions, HandActionBar, HandCardFrame, PortfolioPanel, WalletChip, YearNewsStrip, YearPill, useYearNews,
} from './EconomyPanels'
import { cardPlayability, rupees } from './economyUi'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useBackButton } from '../../hooks/useBackButton'
import './GameBoardMobile.css'

interface GameBoardMobileProps extends InnerBoardProps {
  orientation: 'portrait' | 'landscape'
  /** Usable board height in px, used to size the hand cards. */
  areaHeight: number
}

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
  extraControls,
  voiceBadges,
  onPass,
  onEquip,
  highlightPlayerId,
  orientation,
  areaHeight,
}: GameBoardMobileProps) {
  const { t, i18n } = useTranslation()
  const hi = i18n.language === 'hi'
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showLog, setShowLog] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const yearNews = useYearNews(gameState)
  // Android back closes these sheets first (they register on top of the page's handler).
  useBackButton(() => setShowPortfolio(false), showPortfolio)
  useBackButton(() => setShowLog(false), showLog)

  const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId)
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
  const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const targetIndices = getTargetableIndices(gameState, myPlayerId)
  const isPlayPhase = isMyTurn && gameState.phase === 'play' && uiPhase === 'playing'
  const hand = myPlayer?.hand ?? []
  const selectedCard = isPlayPhase ? hand.find(c => c.id === selectedId) ?? null : null
  /** Phase 3 pages pass onPass → Play / Equip / Pass action bar. */
  const phase3 = !!onPass
  const landscape = orientation === 'landscape'

  // Clear the selection when it is no longer valid
  useEffect(() => {
    if (!isPlayPhase) setSelectedId(null)
  }, [isPlayPhase])

  // Card size: fill the available space without overflowing short landscape screens
  const cardH = landscape
    ? clamp(Math.floor(areaHeight - 186), 112, 200)
    : clamp(Math.floor((areaHeight - 60) * 0.3), 140, 210)
  const cardW = Math.round(cardH * 0.7)

  const cardName = (c: GameCard) => (hi ? (c.shortNameHi || c.nameHi || c.shortName || c.name) : (c.shortName || c.name))
  const cardFlavor = (c: GameCard) => (hi ? (c.shortFlavorHi || c.flavorHi || c.shortFlavor || c.flavor) : (c.shortFlavor || c.flavor))
  const latestLog = gameState.log[0]

  const primary = (card: GameCard) => {
    setSelectedId(null)
    if (card.type === 'defense' && onEquip) onEquip(card)
    else onPlayCard(card)
  }

  const renderHand = (interactive: boolean) => (
    <div className={`mb-hand${interactive ? '' : ' preview'}`} role="listbox" aria-label={t('board.yourHand')}>
      <AnimatePresence>
        {hand.map(card => (
          <HandCardFrame
            key={card.id}
            className="mb-card"
            play={cardPlayability(gameState, myPlayerIndex, card, interactive)}
            selected={selectedCard?.id === card.id}
            isNew={interactive && gameState.drawnCard?.id === card.id}
          >
            <GameCardComponent
              card={card}
              compact
              disabled={!interactive}
              selected={selectedCard?.id === card.id}
              onClick={interactive ? () => setSelectedId(prev => (prev === card.id ? null : card.id)) : undefined}
            />
          </HandCardFrame>
        ))}
      </AnimatePresence>
    </div>
  )

  const pending = gameState.pendingDecision

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
        voiceBadges={voiceBadges}
        highlightPlayerId={highlightPlayerId}
      />

      {/* Status bar: year, timer, latest log line, wallet (landscape), log + emote buttons */}
      <div className="mb-statusbar">
        <YearPill state={gameState} onClick={yearNews.show} short />
        {gameState.phase !== 'game_over' && (
          <TurnCountdown
            key={gameState.turnStartTime}
            turnStartTime={gameState.turnStartTime}
            timeLimit={TURN_TIME_LIMIT_MS}
            label={landscape ? (isMyTurn ? t('board.you') : currentPlayer?.name) : undefined}
          />
        )}
        <button type="button" className="mb-ticker" onClick={() => setShowLog(true)}>
          {latestLog ? translateLogEntry(latestLog, i18n.language) : t('game.gameLog')}
        </button>
        {landscape && myPlayer && <WalletChip player={myPlayer} goal={gameState.wealthGoal} onClick={() => setShowPortfolio(true)} />}
        <button type="button" className="board-icon-btn" aria-label={t('game.gameLog')} onClick={() => setShowLog(true)}>
          <ScrollText size={20} />
        </button>
        <LanguageSwitcher variant="cycle" tone="dark" short />
        {landscape && extraControls}
        {onSendEmote && <EmoteButton onSendEmote={onSendEmote} direction="down" />}
      </div>
      {/* Portrait has no room in the status bar: chat / mic float on the right edge */}
      {!landscape && extraControls && <div className="mb-comms-dock">{extraControls}</div>}

      {/* Portrait: wallet summary row */}
      {!landscape && myPlayer && (
        <div className="mb-wallet">
          <WalletChip player={myPlayer} goal={gameState.wealthGoal} onClick={() => setShowPortfolio(true)} wide />
        </div>
      )}

      <div className="mb-main">
        {gameState.levelState && <LevelHUD levelState={gameState.levelState} />}

        {/* Not my turn */}
        {!isMyTurn && uiPhase === 'playing' && (
          <>
            <div className="mb-panel mb-center mb-wait">
              <div className="mb-title">⏳ {t('game.waitingFor', { name: currentPlayer?.name })}</div>
              <div className="mb-sub">{t('game.theirTurnToPlay')}</div>
            </div>
            {hand.length > 0 && (
              <>
                <div className="mb-section-head"><span>{t('board.planAhead')}</span></div>
                {renderHand(false)}
              </>
            )}
          </>
        )}

        {/* Draw */}
        {isMyTurn && gameState.phase === 'draw' && (
          <div className="mb-panel mb-center">
            <div className="mb-title">{t('game.yourTurnDraw')}</div>
            <div className="mb-sub">
              {hand.length < HAND_SIZE ? `${t('board.refill', { max: HAND_SIZE })} · ` : ''}{t('board.deckLeft', { n: gameState.deck.length })}
            </div>
          </div>
        )}

        {/* Play: hand */}
        {isPlayPhase && (
          <>
            <div className="mb-section-head">
              <span>{phase3 ? t('board.pickCard') : t('board.pickToPlay')}</span>
              {gameState.equippedThisTurn
                ? <span className="mb-drawn-chip equip">🛡️ {t('board.equippedShort')}</span>
                : gameState.drawnCard && <span className="mb-drawn-chip">{t('board.newCard', { card: cardName(gameState.drawnCard) })}</span>}
            </div>
            {renderHand(true)}
            <div className="mb-selected-info" aria-live="polite">
              {selectedCard ? (
                <>
                  <strong>{cardName(selectedCard)}</strong>
                  <span> — {cardFlavor(selectedCard)}</span>
                </>
              ) : (
                <span className="mb-muted">{t('board.tapCard')} <span className="mb-glow-word">{t('econ.hand.glowing')}</span> {t('board.playableNow')}</span>
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
                    <span className="mb-target-wealth">{rupees(p.wealth)}</span>
                  </button>
                )
              })}
              {targetIndices.length === 0 && <div className="mb-sub">{t('board.noTargets')}</div>}
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
          {phase3 ? (
            <HandActionBar
              state={gameState}
              playerIndex={myPlayerIndex}
              card={selectedCard}
              onPlay={primary}
              onEquip={primary}
              onPass={id => { setSelectedId(null); onPass?.(id) }}
              variant="compact"
              cardName={cardName}
            />
          ) : (
            <button type="button" className="mb-primary-btn gold" disabled={!selectedCard} onClick={() => selectedCard && primary(selectedCard)}>
              {selectedCard ? t('econ.hand.playCard', { card: cardName(selectedCard) }) : t('board.selectCard')}
            </button>
          )}
        </div>
      )}
      {uiPhase === 'targeting' && gameState.pendingTarget && (
        <div className="mb-footer">
          <button type="button" className="mb-primary-btn secondary" onClick={onCancelTargeting}>
            {t('common.cancel')}
          </button>
        </div>
      )}

      <YearNewsStrip state={gameState} myPlayerId={myPlayerId} open={yearNews.open} onClose={yearNews.hide} variant="compact" />

      {/* Decision sheet */}
      <AnimatePresence>
        {uiPhase === 'decision' && pending && (
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
                <h3>{cardName(pending.card)}</h3>
                <p>{cardFlavor(pending.card)}</p>
                {myPlayer && <div className="mb-decision-cash">💵 {t('econ.cash')} {rupees(myPlayer.cash ?? myPlayer.wealth)} · {t('econ.netWorth')} {rupees(myPlayer.wealth)}</div>}
              </div>
              <DecisionOptions state={gameState} playerIndex={myPlayerIndex} card={pending.card} onDecision={onDecision} hi={hi} variant="compact" />
              {phase3 && (
                <div className="econ-decision-foot">
                  <button type="button" className="econ-btn econ-btn-pass" onClick={onCancelTargeting}><span>← {t('board.back')}</span></button>
                  <button type="button" className="econ-btn econ-btn-pass" onClick={() => onPass?.(pending.card.id)}>
                    <span>{t('econ.hand.pass')}</span><small>{t('econ.hand.passSub')}</small>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio sheet */}
      <AnimatePresence>
        {showPortfolio && myPlayer && (
          <motion.div
            className="mb-overlay mb-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPortfolio(false)}
          >
            <motion.div
              className="econ-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={t('board.yourPortfolio')}
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="econ-sheet-head">
                <span className="econ-sheet-title">💼 {t('board.yourMoney')}</span>
                <button type="button" className="board-icon-btn" aria-label={t('common.close')} onClick={() => setShowPortfolio(false)}>
                  <X size={20} />
                </button>
              </div>
              <PortfolioPanel player={myPlayer} goal={gameState.wealthGoal} variant="compact" />
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
              <button type="button" className="board-icon-btn mb-log-close" aria-label={t('common.close')} onClick={() => setShowLog(false)}>
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
