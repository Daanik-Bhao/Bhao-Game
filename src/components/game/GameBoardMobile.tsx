import { useState, useEffect } from 'react'
import { GameCard as GameCardComponent } from '../GameCard'
import { Button } from '../ui/Button'
import { PlayerBoard } from './PlayerBoard'
import { GameLog } from './GameLog'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import { Zap, Shield, FileWarning } from 'lucide-react'

import { formatWealth } from '../../types/game'
import { TURN_TIME_LIMIT_MS } from '../../lib/gameEngine'
import type { GameBoardProps } from './GameBoard'
import { LevelHUD } from './LevelHUD'
import './GameBoardMobile.css'

export function GameBoardMobile({
  gameState,
  myPlayerId,
  isMultiplayer,
  uiPhase,
  onlinePlayers = new Set(),
  onDrawCard,
  onPlayCard,
  onTargetSelect,
  onDecision,
  onCancelTargeting,
  activeEmotes,
  onSendEmote,
}: GameBoardProps) {
  const { t, i18n } = useTranslation()
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [previewCard, setPreviewCard] = useState<any>(null)

  const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId)
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
  const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]

  // Clear selected card when phase changes
  useEffect(() => {
    if (!isMyTurn || gameState.phase !== 'play' || uiPhase !== 'playing') {
      setSelectedCard(null)
    }
  }, [isMyTurn, gameState.phase, uiPhase])

  // Rearrange players for display so local player is always first
  const displayPlayers = [...gameState.players]
  if (myPlayerIndex > 0) {
    const me = displayPlayers.splice(myPlayerIndex, 1)[0]
    displayPlayers.unshift(me)
  }

  return (
    <div className="mobile-board-wrapper">
      
      {/* Horizontal Players Row */}
      <div className="mobile-players-row">
        {displayPlayers.map((player) => {
          const originalIndex = gameState.players.findIndex(p => p.id === player.id)
          return (
            <div key={player.id} className="mobile-player-item">
              <PlayerBoard
                player={player}
                isCurrent={originalIndex === gameState.currentPlayerIndex}
                isMe={player.id === myPlayerId}
                isTarget={uiPhase === 'targeting' && player.id !== myPlayerId}
                isOffline={isMultiplayer && !onlinePlayers.has(player.id)}
                wealthGoal={gameState.wealthGoal}
                seatIndex={originalIndex}
                onClick={() => onTargetSelect(originalIndex)}
                compact={true}
                turnStartTime={gameState.turnStartTime}
                timeLimit={TURN_TIME_LIMIT_MS}
                activeEmote={activeEmotes?.[player.id]}
                onSendEmote={onSendEmote}
              />
            </div>
          )
        })}
      </div>

      <div className="mobile-main-content">
        {/* Level HUD (if campaign level is active) */}
        {gameState.levelState && (
          <LevelHUD levelState={gameState.levelState} />
        )}

        {/* Not my turn */}
        {!isMyTurn && uiPhase === 'playing' && (
          <div className="mobile-wait-state glass-panel">
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 19, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
              {t('game.waitingFor', { name: currentPlayer?.name })}
            </div>
            <div style={{ fontSize: 16, color: '#475569' }}>{t('game.theirTurnToPlay')}</div>
          </div>
        )}

        {isMyTurn && gameState.phase === 'draw' && (
          <div className="mobile-draw-state glass-panel">
            <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 18 }}>
              {t('game.yourTurnDraw')}
            </div>
            <Button size="lg" variant="gold" onClick={onDrawCard}>
              {t('game.drawCardBtn', { count: gameState.deck.length })}
            </Button>
          </div>
        )}

        {/* Play phase */}
        {isMyTurn && gameState.phase === 'play' && uiPhase === 'playing' && (
          <div className="mobile-play-phase-container">
            
            {/* DRAWN OR SELECTED CARD SECTION */}
            {(selectedCard || gameState.drawnCard) && (() => {
              const activeCard = selectedCard || gameState.drawnCard;
              return (
                <div className="mobile-drawn-card-section glass-panel">
                  <div className="mobile-drawn-header">{selectedCard ? 'SELECTED CARD' : 'DRAWN CARD'}</div>
                  <div className="mobile-drawn-content">
                    <div className="mobile-drawn-text">
                      <h3>{i18n.language === 'hi' && activeCard.nameHi ? activeCard.nameHi : activeCard.name}</h3>
                      <span className="mobile-drawn-category">
                        {activeCard.type === 'action' || activeCard.type === 'decision' 
                          ? 'Opportunity' 
                          : activeCard.type}
                      </span>
                      <p>{i18n.language === 'hi' && activeCard.flavorHi ? activeCard.flavorHi : activeCard.flavor}</p>
                    </div>
                    <div className="mobile-drawn-image">
                      {activeCard.type === 'action' ? (
                        <Zap size={48} strokeWidth={1.5} color="#94a3b8" />
                      ) : activeCard.type === 'defense' ? (
                        <Shield size={48} strokeWidth={1.5} color="#94a3b8" />
                      ) : (
                        <FileWarning size={48} strokeWidth={1.5} color="#94a3b8" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* PICK ACTION HEADER */}
            <div className="mobile-pick-action-header">
              <span className="mobile-pick-title">PICK ONE ACTION CARD TO PLAY</span>
            </div>

            {/* HAND GRID */}
            <div className="mobile-hand-grid">
              <AnimatePresence>
                {myPlayer?.hand.map(card => (
                  <GameCardComponent 
                    key={card.id} 
                    card={card} 
                    selected={selectedCard?.id === card.id}
                    onClick={() => setSelectedCard(card)} 
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* ACTION BUTTONS BAR */}
            <div className="mobile-action-buttons-bar">
              <button 
                className="action-bar-btn confirm" 
                disabled={!selectedCard}
                onClick={() => {
                  if (selectedCard) {
                    onPlayCard(selectedCard);
                    setSelectedCard(null);
                  }
                }}
              >
                Confirm Choice
              </button>
            </div>
          </div>
        )}

        {uiPhase === 'targeting' && gameState.pendingTarget && (
          <div className="mobile-targeting-state">
            <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 16, color: '#f1f5f9', fontWeight: 700, marginBottom: 4 }}>
              {t('game.selectTarget', { card: gameState.pendingTarget.card.name })}
            </div>
            <div style={{ fontSize: 15, color: '#94a3b8', marginBottom: 20 }}>
              {t('game.clickOpponentTarget')}
            </div>
            <Button variant="secondary" onClick={onCancelTargeting}>{t('common.cancel')}</Button>
          </div>
        )}
      </div>

      {/* GAME LOG AT BOTTOM */}
      <div className="mobile-log-section">
        <GameLog log={gameState.log} mobileCompact={true} playerName={myPlayer?.name} />
      </div>

      {/* Decision card POPUP */}
      {uiPhase === 'decision' && gameState.pendingDecision && (
        <div className="mobile-decision-overlay">
          <div className="mobile-decision-modal">
            {/* Close button */}
            <button 
              onClick={onCancelTargeting}
              className="mobile-decision-close"
            >
              ✕
            </button>

            <div className="mobile-decision-header">
              <h3 className="mobile-decision-title">
                {i18n.language === 'hi' 
                  ? (gameState.pendingDecision.card.shortNameHi || gameState.pendingDecision.card.nameHi || gameState.pendingDecision.card.shortName || gameState.pendingDecision.card.name)
                  : (gameState.pendingDecision.card.shortName || gameState.pendingDecision.card.name)}
              </h3>
              <p style={{ color: '#0ea5e9', fontSize: 15, fontWeight: 600 }}>
                {i18n.language === 'hi' 
                  ? (gameState.pendingDecision.card.shortFlavorHi || gameState.pendingDecision.card.flavorHi || gameState.pendingDecision.card.shortFlavor || gameState.pendingDecision.card.flavor)
                  : (gameState.pendingDecision.card.shortFlavor || gameState.pendingDecision.card.flavor)}
              </p>
            </div>
            
            <div className="mobile-decision-options">
              {[...(gameState.pendingDecision.card.options || [])].sort((a, b) => {
                const order = { spend: 1, save: 2, invest: 3 };
                return (order[a.type as keyof typeof order] || 0) - (order[b.type as keyof typeof order] || 0);
              }).map(opt => {
                const colors = {
                  spend: { bg: '#fff1f2', border: '#fda4af', labelColor: '#e11d48', labelBg: '#ffe4e6' },
                  save: { bg: '#f0fdf4', border: '#86efac', labelColor: '#16a34a', labelBg: '#dcfce7' },
                  invest: { bg: '#eff6ff', border: '#93c5fd', labelColor: '#2563eb', labelBg: '#dbeafe' }
                }
                const c = colors[opt.type as keyof typeof colors] || colors.save
                let effectVal = opt.effect.value ?? 0
                if (opt.effect.type === 'wealth_pct' && myPlayer) {
                  effectVal = Math.floor(myPlayer.wealth * (effectVal / 100))
                }
                const sign = effectVal >= 0 ? '+' : ''
                
                let failVal = opt.failEffect?.value ?? 0
                if (opt.failEffect?.type === 'wealth_pct' && myPlayer) {
                  failVal = Math.floor(myPlayer.wealth * (failVal / 100))
                }
                
                return (
                  <button
                    key={opt.type}
                    onClick={() => onDecision(opt.type as any)}
                    className="mobile-decision-btn"
                    style={{
                      background: c.bg, border: `2px solid ${c.border}`
                    }}
                  >
                    <div>
                      <div className="mobile-decision-badge" style={{ 
                        color: c.labelColor, background: c.labelBg 
                      }}>
                        {i18n.language === 'hi' && opt.labelHi ? opt.labelHi : (i18n.language === 'hi' && opt.label === 'Spend' ? 'खर्च करें' : i18n.language === 'hi' && opt.label === 'Save' ? 'बचत करें' : i18n.language === 'hi' && opt.label === 'Invest' ? 'निवेश करें' : opt.label)}
                      </div>
                      <div style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>
                        {opt.shortDescription ? (
                          i18n.language === 'hi' ? (opt.shortDescriptionHi || opt.shortDescription) : opt.shortDescription
                        ) : (
                          i18n.language === 'hi' && opt.descriptionHi ? opt.descriptionHi : opt.description
                        )}
                      </div>
                      {opt.investRisk && opt.failEffect && (
                        <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginTop: 4, background: 'rgba(220, 38, 38, 0.1)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                        ⚠️ {opt.investRisk}% Risk: {failVal < 0 ? '-' : '+'}{formatWealth(Math.abs(failVal))}
                      </div>
                      )}
                    </div>
                    
                    <div style={{ fontSize: 22, fontWeight: 800, color: effectVal >= 0 ? '#16a34a' : '#e11d48', fontFamily: 'var(--font-display)', textAlign: 'right' }}>
                      {sign}{formatWealth(Math.abs(effectVal))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preview Card POPUP */}
      {previewCard && (
        <div className="mobile-preview-overlay">
          <div className="mobile-preview-modal">
            {/* Close button */}
            <button 
              onClick={() => setPreviewCard(null)}
              className="mobile-decision-close"
            >
              ✕
            </button>
            <div className="mobile-preview-title">{t('game.previewCard')}</div>
            <div className="mobile-preview-card-wrapper">
              <GameCardComponent card={previewCard} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <Button variant="secondary" onClick={() => setPreviewCard(null)} style={{ flex: 1 }}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
