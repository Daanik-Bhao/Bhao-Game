import { useState, useEffect } from 'react'
import { GameCard as GameCardComponent } from '../GameCard'
import { Button } from '../ui/Button'
import { GameLog } from './GameLog'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import type { GameCard } from '../../types/game'
import type { InnerBoardProps } from './GameBoard'
import { HAND_SIZE, TURN_TIME_LIMIT_MS } from '../../lib/gameEngine'
import { getTargetableIndices } from './boardUtils'
import { EmoteButton, PlayersStrip, TurnCountdown } from './BoardShared'
import { DecisionOptions, HandActionBar, HandCardFrame, PortfolioPanel, YearNewsStrip, YearPill, useYearNews } from './EconomyPanels'
import { cardPlayability, rupees } from './economyUi'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useBackButton } from '../../hooks/useBackButton'
import './GameBoardDesktop.css'

function PlayerTimerRing({ turnStartTime, timeLimit }: { turnStartTime: number, timeLimit: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let frame: number
    const loop = () => {
      setNow(Date.now())
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  const elapsed = Math.max(0, now - turnStartTime)
  const remaining = Math.max(0, timeLimit - elapsed)
  const pct = Math.max(0, Math.min(100, (remaining / timeLimit) * 100))
  const isDanger = remaining < 10000

  const r = 30
  const dash = 2 * Math.PI * r

  return (
    <>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'rotate(-90deg)', zIndex: 10 }}>
        <circle cx="50%" cy="50%" r={r} fill="none"
          stroke={isDanger ? '#ef4444' : '#10b981'}
          strokeWidth="4"
          strokeDasharray={dash}
          strokeDashoffset={dash * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <motion.div
        animate={isDanger ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : { scale: 1, opacity: 1 }}
        transition={{ repeat: isDanger ? Infinity : 0, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          x: '-50%',
          background: isDanger ? '#ef4444' : '#10b981',
          color: '#fff',
          padding: '1px 8px',
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 800,
          zIndex: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap'
        }}
      >
        {Math.ceil(remaining / 1000)}s
      </motion.div>
    </>
  )
}

export function GameBoardDesktop({
  gameState,
  myPlayerId,
  uiPhase,
  isMultiplayer,
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
  showOpponents,
  highlightPlayerId,
  narrowViewport,
}: InnerBoardProps) {
  const { t, i18n } = useTranslation()
  const hi = i18n.language === 'hi'
  const [showGameLog, setShowGameLog] = useState(false)
  useBackButton(() => setShowGameLog(false), showGameLog)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const yearNews = useYearNews(gameState)
  const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId)
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
  const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const targetIndices = getTargetableIndices(gameState, myPlayerId)
  const hand = myPlayer?.hand ?? []
  const isPlayPhase = isMyTurn && gameState.phase === 'play' && uiPhase === 'playing'
  /** Phase 3 pages pass onPass: pick a card first, then Play / Equip / Pass. Older pages: a click plays. */
  const selectMode = !!onPass
  const selectedCard = isPlayPhase ? hand.find(c => c.id === selectedId) ?? null : null

  useEffect(() => {
    if (!isPlayPhase) setSelectedId(null)
  }, [isPlayPhase])

  const cardName = (c: GameCard) => (hi ? (c.shortNameHi || c.nameHi || c.shortName || c.name) : (c.shortName || c.name))

  const primary = (card: GameCard) => {
    setSelectedId(null)
    if (card.type === 'defense' && onEquip) onEquip(card)
    else onPlayCard(card)
  }
  const onCardClick = (card: GameCard) => {
    if (!selectMode) { onPlayCard(card); return }
    if (selectedId === card.id) {
      // Second click on the selected card = its primary action
      if (cardPlayability(gameState, myPlayerIndex, card, true).ok) primary(card)
      return
    }
    setSelectedId(card.id)
  }

  const dense = hand.length > 5
  const renderHand = (interactive: boolean) => (
    <div className={`dk-hand${dense ? ' dense' : ''}${interactive ? '' : ' preview'}`} role="listbox" aria-label={t('board.yourHand')}>
      <AnimatePresence>
        {hand.map(card => (
          <HandCardFrame
            key={card.id}
            play={cardPlayability(gameState, myPlayerIndex, card, interactive)}
            selected={selectedCard?.id === card.id}
            isNew={interactive && gameState.drawnCard?.id === card.id}
          >
            <GameCardComponent card={card} compact onClick={interactive ? () => onCardClick(card) : undefined} disabled={!interactive} />
          </HandCardFrame>
        ))}
      </AnimatePresence>
    </div>
  )

  const pending = gameState.pendingDecision

  return (
    <div className="dk-root">
      <div className="game-stage-bg dk-stage">
        <div className="dk-frame">
          {/* LEFT RAIL: your money */}
          <aside className="dk-rail">
            {myPlayer && (
              <PortfolioPanel
                player={myPlayer}
                goal={gameState.wealthGoal}
                variant="desktop"
                header={(
                  <div className="econ-id">
                    <div className="econ-id-avatar">
                      {isMyTurn && gameState.phase !== 'game_over' && (
                        <PlayerTimerRing turnStartTime={gameState.turnStartTime} timeLimit={TURN_TIME_LIMIT_MS} />
                      )}
                      <img src={myPlayer.profile?.avatar_url || ('https://api.dicebear.com/9.x/avataaars/svg?seed=' + myPlayer.name)} alt="" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="econ-id-name">{myPlayer.name}</div>
                      <div className="econ-id-sub">{isMyTurn ? t('board.yourTurn') : t('board.isPlaying', { name: currentPlayer?.name ?? '' })} · {t('board.cardsInHand', { n: hand.length, max: HAND_SIZE })}</div>
                    </div>
                  </div>
                )}
              />
            )}
          </aside>

          {/* MAIN STAGE */}
          <main className="dk-main">
            <YearNewsStrip state={gameState} myPlayerId={myPlayerId} open={yearNews.open} onClose={yearNews.hide} variant="desktop" />

            {/* Not my turn: wait, but show the hand so you can plan */}
            {!isMyTurn && uiPhase === 'playing' && (
              <div className="dk-wait">
                <div className="dk-wait-emoji" aria-hidden>⏳</div>
                <div className="dk-wait-title">{t('game.waitingFor', { name: currentPlayer?.name })}</div>
                <div className="dk-wait-sub">{t('game.theirTurnToPlay')}</div>
                {gameState.phase !== 'game_over' && (
                  <TurnCountdown key={gameState.turnStartTime} turnStartTime={gameState.turnStartTime} timeLimit={TURN_TIME_LIMIT_MS} />
                )}
                {hand.length > 0 && (
                  <>
                    <div className="dk-hand-label">{t('board.planNext')}</div>
                    {renderHand(false)}
                  </>
                )}
              </div>
            )}

            {/* Draw phase: refill the hand */}
            {isMyTurn && gameState.phase === 'draw' && (
              <div className="dk-draw">
                <div className="dk-draw-title">{t('board.yourTurn')}</div>
                <div className="dk-draw-inner">
                  <div className="dk-draw-sub">
                    {hand.length < HAND_SIZE ? t('board.drawRefill', { max: HAND_SIZE }) : t('board.drawStart')}
                  </div>
                  <img src="/avatars/cards in hand.png" alt="" className="dk-draw-fan" />
                  <button type="button" className="btn-rebound dk-draw-btn" onClick={onDrawCard}>{t('board.drawCard')}</button>
                </div>
              </div>
            )}

            {/* Play phase: pick a card */}
            {isPlayPhase && (
              <div className="dk-play">
                <div className="dk-hand-label">
                  {selectMode ? t('board.pickThenAct') : t('board.pickToPlay')}
                  {gameState.equippedThisTurn && <span className="dk-equipped-note">🛡️ {t('board.equippedThisTurn')}</span>}
                </div>
                {renderHand(true)}
                {selectMode && (
                  <HandActionBar
                    state={gameState}
                    playerIndex={myPlayerIndex}
                    card={selectedCard}
                    onPlay={primary}
                    onEquip={primary}
                    onPass={id => { setSelectedId(null); onPass?.(id) }}
                    variant="desktop"
                    cardName={cardName}
                  />
                )}
              </div>
            )}

            {/* Decision */}
            {uiPhase === 'decision' && pending && (
              <motion.div className="dk-decision" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="dk-decision-card">
                  <GameCardComponent card={pending.card} compact />
                </div>
                <div className="dk-decision-panel">
                  <div className="dk-decision-head">
                    <h3>{cardName(pending.card)}</h3>
                    {myPlayer && <span className="dk-decision-cash">💵 {t('econ.cash')} <strong>{rupees(myPlayer.cash ?? myPlayer.wealth)}</strong></span>}
                  </div>
                  <p>{hi ? (pending.card.shortFlavorHi || pending.card.flavorHi || pending.card.shortFlavor || pending.card.flavor) : (pending.card.shortFlavor || pending.card.flavor)}</p>
                  <DecisionOptions state={gameState} playerIndex={myPlayerIndex} card={pending.card} onDecision={onDecision} hi={hi} variant="desktop" />
                  {onPass && (
                    <div className="econ-decision-foot">
                      <button type="button" className="econ-btn econ-btn-pass" onClick={onCancelTargeting}><span>← {t('board.backToHand')}</span></button>
                      <button type="button" className="econ-btn econ-btn-pass" onClick={() => onPass(pending.card.id)}>
                        <span>{t('econ.hand.pass')}</span><small>{t('board.passThisCard')}</small>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Targeting */}
            {uiPhase === 'targeting' && gameState.pendingTarget && (
              <div className="dk-target">
                <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
                <div className="dk-wait-title">{t('game.selectTarget', { card: cardName(gameState.pendingTarget.card) })}</div>
                <div className="dk-wait-sub" style={{ marginBottom: 20 }}>{t('board.pickRival')}</div>
                <div className="dk-target-list">
                  {targetIndices.map(i => {
                    const p = gameState.players[i]
                    return (
                      <button key={p.id} type="button" className="dk-target-btn" onClick={() => onTargetSelect(i)}>
                        <span>{t('board.target', { name: p.name })}</span>
                        <small>{t('board.targetSub', { amount: rupees(p.wealth), n: (p.holdings ?? []).length })}</small>
                      </button>
                    )
                  })}
                  {targetIndices.length === 0 && <div style={{ fontSize: 16, color: '#fca5a5' }}>{t('board.noTargets')}</div>}
                </div>
                <Button variant="secondary" onClick={onCancelTargeting}>{t('common.cancel')}</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* TOP LEFT: year */}
      <div className="dk-year">
        <YearPill state={gameState} onClick={yearNews.show} />
        <LanguageSwitcher variant="cycle" tone="dark" />
      </div>

      {/* TOP CENTER: players strip (multiplayer / when the page has no opponent HUD) */}
      {(showOpponents ?? (isMultiplayer || narrowViewport)) && (
        <PlayersStrip
          className="desktop-players-strip"
          gameState={gameState}
          myPlayerId={myPlayerId}
          isMultiplayer={isMultiplayer}
          onlinePlayers={onlinePlayers}
          targeting={uiPhase === 'targeting'}
          onTargetSelect={onTargetSelect}
          activeEmotes={activeEmotes}
          voiceBadges={voiceBadges}
          highlightPlayerId={highlightPlayerId}
          includeMe={false}
        />
      )}

      {/* BOTTOM RIGHT: Game Log Toggle Button (+ emotes) */}
      <div className="dk-log-btns">
        {extraControls}
        {onSendEmote && <EmoteButton onSendEmote={onSendEmote} direction="up" />}
        <button
          type="button"
          aria-label={t('game.gameLog')}
          onClick={() => setShowGameLog(!showGameLog)}
          className="dk-log-btn"
        />
      </div>

      {showGameLog && (
        <div className="dk-log-overlay" onClick={() => setShowGameLog(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 600, maxHeight: 620, overflowY: 'auto' }}>
            <GameLog log={gameState.log} playerName={myPlayer?.name} />
          </div>
        </div>
      )}
    </div>
  )
}
