import { useState, useEffect } from 'react'
import { GameCard as GameCardComponent } from '../GameCard'
import { Button } from '../ui/Button'
import { GameLog } from './GameLog'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { formatWealth } from '../../types/game'
import type { GameBoardProps } from './GameBoard'
import { TURN_TIME_LIMIT_MS } from '../../lib/gameEngine'

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

  const dash = 2 * Math.PI * 40 // r=40
  
  return (
    <>
      <svg style={{ position: 'absolute', top: -10, left: -10, width: 'calc(100% + 20px)', height: 'calc(100% + 20px)', pointerEvents: 'none', transform: 'rotate(-90deg)', zIndex: 10 }}>
        <circle cx="50%" cy="50%" r="40" fill="none" 
          stroke={isDanger ? '#ef4444' : '#10b981'} 
          strokeWidth="4" 
          strokeDasharray={dash} 
          strokeDashoffset={dash * (1 - pct/100)}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <motion.div 
        animate={isDanger ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : { scale: 1, opacity: 1 }}
        transition={{ repeat: isDanger ? Infinity : 0, duration: 0.5 }}
        style={{ 
          position: 'absolute', 
          bottom: -16, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: isDanger ? '#ef4444' : '#10b981', 
          color: '#fff', 
          padding: '2px 10px', 
          borderRadius: 12, 
          fontSize: 14, 
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
  onDrawCard,
  onPlayCard,
  onTargetSelect,
  onDecision,
  onCancelTargeting,
}: GameBoardProps) {
  const { t, i18n } = useTranslation()
  const [showGameLog, setShowGameLog] = useState(false)
  const myPlayerIndex = gameState.players.findIndex(p => p.id === myPlayerId)
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
  const myPlayer = myPlayerIndex >= 0 ? gameState.players[myPlayerIndex] : null
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]

  // const [scale, setScale] = useState(1);


  const progressRatio = myPlayer ? Math.min(1, myPlayer.wealth / gameState.wealthGoal) : 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Central Glass Panel Stage - Fluid */}
      <div className="game-stage-bg" style={{
        width: '100%', height: '100%',
        background: 'url("/avatars/most outher.png") center / 100% 100% no-repeat',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
          {/* Second Outer Layer */}
          <div style={{
            width: 1205, height: 577,
            background: 'url("/avatars/seocnd outer.png") center / 100% 100% no-repeat',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 40
          }}>
            
          {/* Not my turn */}
        {!isMyTurn && uiPhase === 'playing' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {t('game.waitingFor', { name: currentPlayer?.name })}
            </div>
            <div style={{ fontSize: 18, color: '#94a3b8' }}>{t('game.theirTurnToPlay')}</div>
          </div>
        )}

        {/* Draw phase */}
        {isMyTurn && gameState.phase === 'draw' && (
          <div style={{
            width: 1013,
            height: 486,
            background: 'url("/avatars/second inner.png") center / 100% 100% no-repeat',
            borderRadius: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 20,
            position: 'relative'
          }}>
            {/* Title */}
            <div style={{
              fontFamily: 'Clash Display Variable, sans-serif',
              fontWeight: 600,
              fontSize: 48,
              color: '#B4FFBE',
              marginBottom: 20
            }}>
              Your Turn
            </div>

            {/* Inner Container */}
            <div style={{
              width: 945,
              height: 375,
              background: 'url("/avatars/most inner.png") center / 100% 100% no-repeat',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 14,
              position: 'relative'
            }}>
              {/* Subtitle */}
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 20,
                color: '#FFFFFF',
                marginTop: 20,
                marginBottom: 20
              }}>
                your turn! draw a card to start.
              </div>
              
              {/* Cards Fan */}
              <img 
                src="/avatars/cards in hand.png" 
                alt="Card Fan" 
                style={{ 
                  width: 517, 
                  position: 'absolute',
                  top: '52%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'contain',
                  zIndex: 10,
                  pointerEvents: 'none'
                }} 
              />

              {/* Draw Button */}
              <button
                className="btn-rebound"
                onClick={onDrawCard}
                style={{
                  width: 250,
                  height: 60,
                  background: 'linear-gradient(180deg, #F4D27B 0%, #DDA20C 100%)',
                  borderRadius: 8,
                  border: 'none',
                  color: '#4B3602',
                  fontSize: 22,
                  fontWeight: 800,
                  cursor: 'pointer',
                  position: 'absolute',
                  bottom: -15,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.2)',
                  fontFamily: 'Space Grotesk, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
              >
                Draw Card
              </button>
            </div>
          </div>
        )}

        {/* Play phase — show full hand, pick one to play */}
        {isMyTurn && gameState.phase === 'play' && uiPhase === 'playing' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="grid grid-cols-4 gap-4" style={{ justifyItems: 'center', marginBottom: 40 }}>
              <AnimatePresence>
                {myPlayer?.hand.map(card => (
                  <GameCardComponent key={card.id} card={card} onClick={() => onPlayCard(card)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Decision card */}
        {uiPhase === 'decision' && gameState.pendingDecision && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
            <div style={{
              background: 'rgba(11, 40, 40, 0.8)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 20,
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 40,
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
            }}>
              
              <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>
                {/* Left Side: Selected Card */}
                <div>
                  <GameCardComponent card={gameState.pendingDecision.card} compact={false} />
                </div>

                {/* Right Side: Decision Options */}
                <div style={{ 
                  width: 480, 
                  background: '#0F2A24', 
                  border: '1px solid #10B981', 
                  borderRadius: 16, 
                  padding: '32px 24px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 16 
                }}>
                  <h3 style={{ fontSize: 28, fontWeight: 600, color: '#34D399', margin: '0 0 4px', fontFamily: 'system-ui, sans-serif' }}>
                    {i18n.language === 'hi' 
                      ? (gameState.pendingDecision.card.shortNameHi || gameState.pendingDecision.card.nameHi || gameState.pendingDecision.card.shortName || gameState.pendingDecision.card.name)
                      : (gameState.pendingDecision.card.shortName || gameState.pendingDecision.card.name)}
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: 14, margin: '0 0 24px', lineHeight: 1.4 }}>
                    {i18n.language === 'hi' 
                      ? (gameState.pendingDecision.card.shortFlavorHi || gameState.pendingDecision.card.flavorHi || gameState.pendingDecision.card.shortFlavor || gameState.pendingDecision.card.flavor)
                      : (gameState.pendingDecision.card.shortFlavor || gameState.pendingDecision.card.flavor)}
                  </p>
                  
                  {[...(gameState.pendingDecision.card.options || [])].sort((a, b) => {
                    const order = { spend: 1, save: 2, invest: 3 };
                    return (order[a.type as keyof typeof order] || 0) - (order[b.type as keyof typeof order] || 0);
                  }).map(opt => {
                    const effectValBase = opt.effect.value ?? 0;
                    let effectVal = effectValBase;
                    if (opt.effect.type === 'wealth_pct' && myPlayer) {
                      effectVal = Math.floor(myPlayer.wealth * (effectVal / 100));
                    }

                    let failVal = opt.failEffect?.value ?? 0;
                    if (opt.failEffect?.type === 'wealth_pct' && myPlayer) {
                      failVal = Math.floor(myPlayer.wealth * (failVal / 100));
                    }

                    const optColor = opt.type === 'spend' ? '#EF4444' : opt.type === 'save' ? '#10B981' : '#06B6D4';
                    const optBg = opt.type === 'spend' ? '#FEE2E2' : opt.type === 'save' ? '#D1FAE5' : '#CFFAFE';

                    return (
                      <div key={opt.type} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div
                          onClick={() => onDecision(opt.type as any)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            border: `1px solid ${optColor}`,
                            background: 'transparent',
                            padding: '12px 16px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: 'none'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = `${optColor}11`;
                            e.currentTarget.style.boxShadow = `0 0 0 1px ${optColor}`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ background: optBg, color: optColor, padding: '4px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, minWidth: 80, textAlign: 'center', textTransform: 'capitalize' }}>
                              {opt.type}
                            </div>
                            <div style={{ color: '#fff', fontSize: 15, fontWeight: 400 }}>
                              {opt.label}
                            </div>
                          </div>
                          <div style={{ color: optColor, fontSize: 15, fontWeight: 700 }}>
                            {effectVal >= 0 ? '+' : ''}{formatWealth(Math.abs(effectVal))}
                          </div>
                        </div>
                        {opt.investRisk && (
                          <div style={{ marginLeft: 16, background: '#fff', color: '#EF4444', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 4, alignSelf: 'flex-start' }}>
                            {opt.investRisk}% Risk: {failVal < 0 ? '-' : '+'}{formatWealth(Math.abs(failVal))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>


            </div>
          </div>
        )}

        {/* Action card targeting phase (Select opponent) */}
        {uiPhase === 'targeting' && gameState.pendingTarget && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
            <div style={{ fontSize: 24, color: '#fff', fontWeight: 800, marginBottom: 12 }}>
              {t('game.selectTarget', { card: gameState.pendingTarget.card.name })}
            </div>
            <div style={{ fontSize: 18, color: '#94a3b8', marginBottom: 30 }}>
              {t('game.clickOpponentTarget')}
            </div>
            {/* Render buttons for opponents */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 30 }}>
               {gameState.players.map((p, i) => {
                 if (i === myPlayerIndex) return null;
                 return (
                   <button key={p.id} onClick={() => onTargetSelect(i)} style={{
                     padding: '16px 32px', background: 'rgba(239, 68, 68, 0.2)', border: '2px solid #EF4444',
                     borderRadius: 8, color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer'
                   }}>
                     Target {p.name}
                   </button>
                 )
               })}
            </div>
            <Button variant="secondary" onClick={onCancelTargeting}>{t('common.cancel')}</Button>
          </div>
        )}

          </div> {/* End Second Outer Layer */}
      </div>
      {/* END CENTRAL STAGE */}

      {/* BOTTOM LEFT: Local Player HUD */}
      {myPlayer && (
        <div style={{ 
          position: 'absolute', bottom: 40, left: 40, 
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'url("/avatars/mainplayercard.webp") center / 100% 100% no-repeat',
          padding: '16px 20px', width: 340, height: 110
        }}>
          {/* Avatar Area */}
          <div style={{ 
            width: 78, height: 78, 
            background: 'url("/avatars/player avatar holder.webp") center / contain no-repeat',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            position: 'relative'
          }}>
            {/* SVG Timer Ring */}
            {isMyTurn && gameState.phase !== 'game_over' && (
              <PlayerTimerRing 
                turnStartTime={gameState.turnStartTime} 
                timeLimit={TURN_TIME_LIMIT_MS} 
              />
            )}
            
            <img 
              src={myPlayer.profile?.avatar_url || ('https://api.dicebear.com/9.x/avataaars/svg?seed=' + myPlayer.name)} 
              style={{ width: 62, height: 62, borderRadius: '50%', objectFit: 'cover' }} 
              alt="Avatar" 
            />
          </div>

          {/* Info Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, paddingRight: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#6ee7b7', fontFamily: 'Inter, sans-serif' }}>
              {myPlayer.name}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Inter, sans-serif', marginTop: -4 }}>
              {formatWealth(myPlayer.wealth)}
            </div>
            
            {/* Real Progress Bar */}
            <div style={{ position: 'relative', height: 12, width: '100%', marginTop: 6, display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: 6, overflow: 'hidden' }}>
              {/* Fill */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, bottom: 0, 
                width: `${Math.max(0, Math.min(100, progressRatio * 100))}%`, 
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.5s ease-in-out'
              }} />
              
              {/* Stars Overlay (Optional visual flair) */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                {[0.33, 0.66, 1].map((threshold, idx) => (
                  <img 
                    key={idx} 
                    src="/avatars/star.webp" 
                    alt="star"
                    style={{ 
                      width: 14, 
                      height: 14, 
                      opacity: progressRatio >= threshold ? 1 : 0.2, 
                      filter: progressRatio >= threshold ? 'drop-shadow(0 0 5px #FBBF24)' : 'none',
                      zIndex: 2,
                      transform: 'translateY(-1px)'
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT: Game Log Toggle Button */}
      <div style={{ position: 'absolute', bottom: 40, right: 40 }}>
        <button
          onClick={() => setShowGameLog(!showGameLog)}
          style={{
            background: 'url("/avatars/gamelogbutton.webp") center / contain no-repeat',
            width: 200, height: 60, border: 'none', cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
        >
        </button>
      </div>

      {/* Game Log Modal Overlay */}
      {showGameLog && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={() => setShowGameLog(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 600, maxHeight: '80vh', overflowY: 'auto' }}>
            <GameLog log={gameState.log} playerName={myPlayer?.name} />
          </div>
        </div>
      )}

    </div>
  )
}
