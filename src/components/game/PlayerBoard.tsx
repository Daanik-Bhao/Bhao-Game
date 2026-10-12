import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlayerState } from '../../types/game'
import { formatWealth } from '../../types/game'
import { AnimatedNumber } from '../AnimatedNumber'
import { ParticleBurst } from '../ParticleBurst'
import { useTranslation } from 'react-i18next'

interface PlayerBoardProps {
  player: PlayerState
  isCurrent: boolean
  isMe: boolean
  isTarget: boolean
  isOffline?: boolean
  wealthGoal: number
  seatIndex?: number
  onClick?: () => void
  compact?: boolean
  turnStartTime?: number
  timeLimit?: number
  activeEmote?: string
  onSendEmote?: (emoji: string) => void
}

// Distinct color themes per seat — matching the screenshot's green, purple, red, gold palette
const SEAT_THEMES = [
  { bg: 'linear-gradient(145deg, #1a4a2e, #0d2b1a)', border: '#2d7a4a', glow: 'rgba(34,197,94,0.35)', accent: '#4ade80', nameBg: '#166534' },
  { bg: 'linear-gradient(145deg, #2e1a4a, #1a0d2b)', border: '#6d4a9e', glow: 'rgba(139,92,246,0.35)', accent: '#a78bfa', nameBg: '#4c1d95' },
  { bg: 'linear-gradient(145deg, #4a1a1a, #2b0d0d)', border: '#9e4a4a', glow: 'rgba(239,68,68,0.35)', accent: '#f87171', nameBg: '#7f1d1d' },
  { bg: 'linear-gradient(145deg, #3a2e0a, #221a04)', border: '#b8860b', glow: 'rgba(245,158,11,0.4)', accent: '#fbbf24', nameBg: '#78350f' },
]

// Avatar pool — assigned by name initial for consistency
const AVATARS = ['👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🦱', '👩‍🦱', '🧔', '👩‍🦰', '👨‍🦰']

function getAvatar(player: PlayerState, seatIndex: number): string {
  if (player.profile?.avatar_url) return player.profile.avatar_url
  if (player.isBot) return '🤖'
  return AVATARS[seatIndex % AVATARS.length]
}

function CardTimer({ turnStartTime, timeLimit, type }: { turnStartTime: number; timeLimit: number; type: 'ring' | 'card-border' }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, timeLimit - (Date.now() - turnStartTime)))
    }, 1000)
    setTimeLeft(Math.max(0, timeLimit - (Date.now() - turnStartTime)))
    return () => clearInterval(timer)
  }, [turnStartTime, timeLimit])

  const pct = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100))
  const isDanger = timeLeft <= 10000
  const isWarning = timeLeft <= 30000 && !isDanger
  
  let neonColor = "#eab308" // Yellow (60s - 30s)
  if (isWarning) neonColor = "#f97316" // Orange (30s - 10s)
  if (isDanger) neonColor = "#ef4444" // Red (10s - 0s)

  if (type === 'ring') {
    const dash = 2 * Math.PI * 25 // r=25
    return (
      <>
        <svg style={{ position: 'absolute', top: -4, left: -4, width: 'calc(100% + 8px)', height: 'calc(100% + 8px)', pointerEvents: 'none', transform: 'rotate(-90deg)', zIndex: 10 }}>
          <circle cx="50%" cy="50%" r="25" fill="none" 
            stroke={isDanger ? '#ef4444' : isWarning ? '#f97316' : '#22c55e'} 
            strokeWidth="4" 
            strokeDasharray={dash} 
            strokeDashoffset={dash * (1 - pct/100)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <motion.div 
          animate={isDanger ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : { scale: 1, opacity: 1 }}
          transition={{ repeat: isDanger ? Infinity : 0, duration: 0.5 }}
          style={{ 
            position: 'absolute', 
            bottom: -12, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: isDanger ? '#ef4444' : isWarning ? '#f97316' : '#10b981', 
            color: '#fff', 
            padding: '2px 8px', 
            borderRadius: 12, 
            fontSize: 12, 
            fontWeight: 800, 
            zIndex: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.3s ease'
          }}
        >
          {Math.ceil(timeLeft / 1000)}s
        </motion.div>
      </>
    )
  }

  if (type === 'card-border') {
    return (
      <motion.svg 
        animate={isDanger ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        style={{ position: 'absolute', top: -3, left: -3, width: 'calc(100% + 6px)', height: 'calc(100% + 6px)', pointerEvents: 'none', zIndex: 20 }}
      >
        <defs>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/> {/* Double blur for intense glow */}
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background faint track */}
        <rect x="3" y="3" width="calc(100% - 6px)" height="calc(100% - 6px)" rx="16" fill="none" 
          stroke={isDanger ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.15)"}
          strokeWidth="2" 
        />
        
        {/* Neon Aura (Thick, blurred, colored) */}
        <rect x="3" y="3" width="calc(100% - 6px)" height="calc(100% - 6px)" rx="16" fill="none" 
          stroke={neonColor}
          strokeWidth="8" 
          filter="url(#neonGlow)"
          pathLength="100"
          strokeDasharray="100" 
          strokeDashoffset={100 * (1 - pct/100)}
          style={{ 
            transition: 'stroke-dashoffset 1s linear',
            strokeLinecap: 'round',
            opacity: 0.9
          }}
        />

        {/* Neon Core (Thin, sharp, pure white) */}
        <rect x="3" y="3" width="calc(100% - 6px)" height="calc(100% - 6px)" rx="16" fill="none" 
          stroke="#ffffff"
          strokeWidth="2" 
          pathLength="100"
          strokeDasharray="100" 
          strokeDashoffset={100 * (1 - pct/100)}
          style={{ 
            transition: 'stroke-dashoffset 1s linear',
            strokeLinecap: 'round'
          }}
        />
      </motion.svg>
    )
  }

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.2)' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: isDanger ? '#ef4444' : '#22c55e',
        transition: 'width 1s linear, background-color 0.3s'
      }} />
    </div>
  )
}



export function PlayerBoard({ player, isCurrent, isMe, isTarget, isOffline, wealthGoal, seatIndex = 0, onClick, compact, turnStartTime, timeLimit, activeEmote, onSendEmote }: PlayerBoardProps) {
  const { t } = useTranslation()
  const wealthPct = Math.min(100, (player.wealth / wealthGoal) * 100)
  const theme = SEAT_THEMES[seatIndex % SEAT_THEMES.length]
  const avatar = getAvatar(player, seatIndex)

  const prevWealthRef = useRef(player.wealth)
  const [floatingText, setFloatingText] = useState<{ id: string; diff: number }[]>([])
  const [isShaking, setIsShaking] = useState(false)
  const [showEmotePicker, setShowEmotePicker] = useState(false)

  const EMOTES = ['💰', '😭', '📉', '🚀', '😡']

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (player.wealth !== prevWealthRef.current) {
      const diff = player.wealth - prevWealthRef.current
      prevWealthRef.current = player.wealth
      if (diff !== 0) {
        setFloatingText(prev => [...prev, { id: Math.random().toString(), diff }])
        if (diff < 0) {
          setIsShaking(true)
          timeoutId = setTimeout(() => setIsShaking(false), 500)
        }
      }
    }
    return () => { if (timeoutId) clearTimeout(timeoutId) }
  }, [player.wealth])

  if (compact) {
    return (
      <div 
        onClick={isTarget ? onClick : undefined}
        style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          opacity: isOffline ? 0.55 : 1, cursor: isTarget ? 'pointer' : 'default',
          position: 'relative'
        }}
      >
        {/* Floating wealth change text */}
        <AnimatePresence>
          {floatingText.map(ft => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: -20, left: '50%', x: '-50%', zIndex: 50,
                fontSize: 16, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
                color: ft.diff > 0 ? '#4ade80' : '#f87171',
                pointerEvents: 'none',
                textShadow: '0 2px 8px rgba(0,0,0,0.7)',
              }}
              onAnimationComplete={() => setFloatingText(prev => prev.filter(item => item.id !== ft.id))}
            >
              {ft.diff > 0 ? '+' : ''}₹{Math.abs(ft.diff).toLocaleString()}
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div 
          animate={isTarget ? { scale: [1, 1.1, 1], boxShadow: ['0 0 10px rgba(239,68,68,0.5)', '0 0 20px rgba(239,68,68,0.8)', '0 0 10px rgba(239,68,68,0.5)'] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: isTarget ? 'rgba(239, 68, 68, 0.2)' : theme.nameBg, 
            border: `2px solid ${isTarget ? '#ef4444' : isCurrent ? '#fef08a' : theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
            overflow: 'hidden', flexShrink: 0, zIndex: 2
          }}
        >
          {isTarget ? (
            <span style={{ fontSize: 24 }}>🎯</span>
          ) : (
            (avatar.startsWith('/') || avatar.startsWith('http')) ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>{avatar}</span>
          )}
        </motion.div>
        
        {/* Money Pill */}
        <div style={{
          marginTop: -6, zIndex: 3,
          background: '#0f172a', borderRadius: 12, padding: '2px 8px',
          border: `1px solid ${isCurrent ? '#fef08a' : theme.accent}`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.5)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: isCurrent ? '#fef08a' : theme.accent, lineHeight: 1 }}>
            <AnimatedNumber value={player.wealth} formatFn={formatWealth} duration={1200} />
          </span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: 1, scale: 1, y: 0,
        x: isShaking ? [-5, 5, -5, 5, -2, 2, 0] : 0,
      }}
      transition={{ x: { duration: 0.35 }, default: { duration: 0.4, ease: 'easeOut' } }}
      whileHover={isTarget ? { scale: 1.05, y: -5 } : { y: -2 }}
      whileTap={isTarget ? { scale: 0.95 } : {}}
      onClick={isTarget ? onClick : undefined}
      className="player-board-wrapper"
      style={{
        background: theme.bg,
        border: `2px solid ${isCurrent ? '#fef08a' : theme.border}`,
        borderRadius: 16,
        cursor: isTarget ? 'pointer' : 'default',
        position: 'relative',
        opacity: isOffline ? 0.55 : 1,
        boxShadow: isCurrent
          ? `0 0 0 2px #fef08a, 0 8px 24px ${theme.glow}`
          : isTarget
          ? '0 0 0 2px #ef4444, 0 8px 24px rgba(239, 68, 68, 0.4)'
          : '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        flexShrink: 0,
        userSelect: 'none',
        backdropFilter: 'blur(8px)',
        overflow: 'visible',
        display: 'flex',
        flexDirection: compact ? 'column' : 'column',
        alignItems: compact ? 'center' : 'initial',
      }}
    >
      {/* FULL CARD BORDER TIMER */}
      {isCurrent && turnStartTime && timeLimit && (
        <CardTimer turnStartTime={turnStartTime} timeLimit={timeLimit} type="card-border" />
      )}

      {/* Floating wealth change text */}
      <AnimatePresence>
        {floatingText.map(ft => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 20, right: 12, zIndex: 50,
              fontSize: 28, fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif',
              color: ft.diff > 0 ? '#4ade80' : '#f87171',
              pointerEvents: 'none',
              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            }}
            onAnimationComplete={() => setFloatingText(prev => prev.filter(item => item.id !== ft.id))}
          >
            {ft.diff > 0 ? '+' : ''}₹{Math.abs(ft.diff).toLocaleString()}
            <ParticleBurst diff={ft.diff} />
          </motion.div>
        ))}
      </AnimatePresence>


      {/* Absolutely positioned inner badges */}

      {activeEmote && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.5 }}
          animate={{ opacity: 1, y: -20, scale: 1.5 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', top: -30, right: -10, zIndex: 100,
            fontSize: 40, pointerEvents: 'none',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
          }}
        >
          {activeEmote}
        </motion.div>
      )}

      <div style={{ position: 'absolute', top: 6, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
        {/* Status badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
          {isCurrent && !isOffline && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: theme.nameBg, border: `1px solid ${theme.accent}`,
                borderRadius: 20, padding: '2px 6px',
                fontSize: 8, fontWeight: 800, color: theme.accent,
                letterSpacing: '0.08em', pointerEvents: 'auto'
              }}
            >
              PLAYING
            </motion.div>
          )}
          {isOffline && (
            <div style={{
              background: '#1e293b', border: '1px solid #475569',
              borderRadius: 20, padding: '2px 6px',
              fontSize: 8, fontWeight: 800, color: '#64748b',
              letterSpacing: '0.08em', pointerEvents: 'auto'
            }}>
              OFFLINE
            </div>
          )}
        </div>

        {/* DEFENSE BADGES REMOVED */}

        {/* Seat number badge */}
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: theme.nameBg,
          border: `1px solid ${theme.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: theme.accent,
          fontFamily: 'Space Grotesk, sans-serif',
          boxShadow: `0 2px 4px rgba(0,0,0,0.3)`, pointerEvents: 'auto'
        }}>
          {seatIndex + 1}
        </div>
      </div>

      {/* Avatar + Name row */}
      <div style={{ display: 'flex', flexDirection: compact ? 'column' : 'row', alignItems: 'center', gap: compact ? 2 : 10, marginBottom: compact ? 6 : 10, textAlign: compact ? 'center' : 'left' }}>
        {!compact && (
          <div style={{ position: 'relative' }}>
            <motion.div 
              animate={isTarget ? { scale: [1, 1.1, 1], boxShadow: ['0 0 10px rgba(239,68,68,0.5)', '0 0 20px rgba(239,68,68,0.8)', '0 0 10px rgba(239,68,68,0.5)'] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className="player-board-avatar" style={{
              width: '2.5em', height: '2.5em', borderRadius: '50%',
              background: isTarget ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', 
              border: `2px solid ${isTarget ? '#ef4444' : theme.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {isTarget ? (
                <span style={{ fontSize: 24 }}>🎯</span>
              ) : (
                (avatar.startsWith('/') || avatar.startsWith('http')) ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : avatar
              )}
            </motion.div>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <div style={{ fontSize: compact ? 'clamp(15px, 4vw, 17px)' : 'clamp(14px, 3.5vw, 16px)', fontWeight: 800, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {player.name} {isMe && <span style={{ opacity: 0.7, fontSize: '0.85em' }}>({t('common.you')})</span>}
          </div>
          {player.skippedTurns > 0 && (
            <div style={{
              fontSize: 11, color: '#f59e0b', fontWeight: 700,
              background: 'rgba(245,158,11,0.15)', borderRadius: 4,
              padding: '1px 6px', display: 'inline-block', marginTop: 2,
            }}>
              SKIP ×{player.skippedTurns}
            </div>
          )}
        </div>
      </div>

      {/* Wealth Row */}
      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 'clamp(6px, 2vw, 10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: theme.accent, lineHeight: 1 }}>
            <AnimatedNumber value={player.wealth} formatFn={formatWealth} duration={1200} />
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {!compact && (
        <div style={{
          height: 4, background: 'rgba(255,255,255,0.08)',
          borderRadius: 2, overflow: 'hidden', marginBottom: 10, marginTop: 10,
        }}>
          <motion.div
            animate={{ width: `${wealthPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${theme.accent}88, ${theme.accent})`,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      {/* Defense card count */}
      {!compact && (
        <div style={{ 
          fontSize: 12, fontWeight: 700, color: theme.accent, 
          textAlign: 'center', opacity: 0.9, marginTop: 4 
        }}>
          {t('game.defenseCards')}: {player.activeDefenses?.length || 0}
        </div>
      )}

      {/* New Stats Row */}
      {!compact && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
            🤑 Greed: {player.greedIndex || 0}/3
          </div>
          <div style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
            💎 Lifestyle: Tier {Math.min(3, 1 + Math.floor((player.spendChoices || 0) / 2))}
          </div>
          {(player.savingStreak || 0) > 0 && (
            <div style={{ fontSize: 10, background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
              🔥 Save Streak: {player.savingStreak}
            </div>
          )}
        </div>
      )}

      {/* Emote Picker Button (Only for me) */}
      {isMe && onSendEmote && !compact && (
        <div style={{ position: 'absolute', bottom: -16, right: 12, zIndex: 110 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowEmotePicker(!showEmotePicker); }}
            style={{
              background: '#1e293b', border: `1px solid ${theme.border}`,
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              fontSize: 16, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            💬
          </button>

          <AnimatePresence>
            {showEmotePicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                style={{
                  position: 'absolute', bottom: 40, right: 0,
                  background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  padding: 8, display: 'flex', gap: 6,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                }}
              >
                {EMOTES.map(emoji => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendEmote(emoji);
                      setShowEmotePicker(false);
                    }}
                    style={{
                      background: 'none', border: 'none', fontSize: 24,
                      cursor: 'pointer', padding: 4, transition: 'transform 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </motion.div>
  )
}
