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

  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const paddingX = 40;
        const paddingY = 80;
        const scaleX = (window.innerWidth - paddingX) / 1246;
        const scaleY = (window.innerHeight - paddingY) / 614;
        setScale(Math.min(1, scaleX, scaleY));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressRatio = myPlayer ? Math.min(1, myPlayer.wealth / gameState.wealthGoal) : 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Wrapper to maintain physical footprint of scaled element */}
      <div style={{ width: 1246 * scale, height: 614 * scale, position: 'relative' }}>
        
        {/* Central Glass Panel Stage */}
        <div className="game-stage-bg" style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute', top: 0, left: 0,
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
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 24, color: '#fff', marginBottom: 16, fontWeight: 700 }}>
              {t('game.yourTurnDraw')}
            </div>
            
            <img src="/avatars/card sshower.webp" style={{ height: 260, objectFit: 'contain', marginBottom: -40, zIndex: 10, pointerEvents: 'none' }} alt="Card shower" />

            <button
              onClick={onDrawCard}
              style={{
                background: 'url("/avatars/confirmchoice.webp") center / 100% 100% no-repeat', color: '#fff',
                border: 'none', width: 340, height: 80,
                fontSize: 28, fontWeight: 700, zIndex: 20,
                cursor: 'pointer', fontFamily: 'Avengenz, sans-serif'
              }}
            >
              DRAW CARD
            </button>
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
          <div style={{ display: 'flex', gap: 60, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
            {/* Left Side: Selected Card */}
            <div>
              <GameCardComponent card={gameState.pendingDecision.card} compact={false} />
            </div>

            {/* Right Side: Decision Options */}
            <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: 'Avengenz, sans-serif' }}>
                {i18n.language === 'hi' 
                  ? (gameState.pendingDecision.card.shortNameHi || gameState.pendingDecision.card.nameHi || gameState.pendingDecision.card.shortName || gameState.pendingDecision.card.name)
                  : (gameState.pendingDecision.card.shortName || gameState.pendingDecision.card.name)}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 24, lineHeight: 1.4 }}>
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

                return (
                  <button
                    key={opt.type}
                    className={`decision-btn ${opt.type}`}
                    onClick={() => onDecision(opt.type as any)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className={`decision-badge ${opt.type}`}>
                        {opt.type}
                      </div>
                      <div className="decision-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 800 }}>{opt.label}</div>
                        {opt.shortDescription && (
                          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginTop: 2, textAlign: 'left', lineHeight: 1.2 }}>
                            {i18n.language === 'hi' ? (opt.shortDescriptionHi || opt.shortDescription) : opt.shortDescription}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="decision-amount" style={{ color: effectVal >= 0 ? '#10B981' : '#EF4444' }}>
                        {effectVal >= 0 ? '+' : ''}{formatWealth(Math.abs(effectVal))}
                      </div>
                      {opt.investRisk && (
                        <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>
                          {opt.investRisk}% Risk: {failVal < 0 ? '-' : '+'}{formatWealth(Math.abs(failVal))}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
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

      </div>
      {/* END CENTRAL STAGE */}
      </div> {/* End Wrapper for Scaling */}

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
