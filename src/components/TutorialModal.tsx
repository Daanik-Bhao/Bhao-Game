import { useState } from 'react'

interface TutorialModalProps {
  onClose: () => void
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [step, setStep] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setIsAnimating(false)
    }, 150)
  }

  const handlePrev = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setStep(s => s - 1)
      setIsAnimating(false)
    }, 150)
  }

  // --- Reusable Sub-components ---

  const ProgressBar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#0D5C46', letterSpacing: '0.05em', marginBottom: 8 }}>
        STEP {step} OF 4
      </div>
      <div style={{ display: 'flex', gap: 8, width: 200 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ 
            height: 6, 
            borderRadius: 3, 
            background: '#e5e7eb', 
            flex: 1, 
            position: 'relative', 
            overflow: 'hidden' 
          }}>
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 0,
              width: step >= i ? '100%' : '0%',
              background: '#16A34A',
              transition: 'width 500ms ease'
            }} />
          </div>
        ))}
      </div>
    </div>
  )

  const HoverCard = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => (
    <div 
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        cursor: 'default',
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.03)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'
      }}
    >
      {children}
    </div>
  )

  const AnimatedButton = ({ onClick, variant = 'primary', children }: { onClick: () => void, variant?: 'primary' | 'secondary' | 'gold', children: React.ReactNode }) => {
    let bg = '#16A34A'
    let color = '#fff'
    let border = 'none'

    if (variant === 'secondary') {
      bg = '#fff'
      color = '#0D5C46'
      border = '2px solid #e5e7eb'
    } else if (variant === 'gold') {
      bg = '#FBBF24'
      color = '#78350f'
      border = 'none'
    }

    return (
      <button 
        onClick={onClick}
        style={{
          background: bg,
          color,
          border,
          borderRadius: 16,
          padding: '16px 32px',
          fontSize: 18,
          fontWeight: 800,
          fontFamily: 'var(--font-display)',
          cursor: 'pointer',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          boxShadow: variant === 'secondary' ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          flex: 1
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = variant === 'secondary' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 8px 20px rgba(0,0,0,0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = variant === 'secondary' ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16, animation: 'fadeIn 0.3s ease',
      fontFamily: '"Inter", "Plus Jakarta Sans", system-ui, sans-serif'
    }}>
      <div style={{
        background: '#FFFDF7',
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
        borderRadius: 24, padding: '40px 32px',
        width: '90vw', maxWidth: 750,
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflowY: 'auto',
        maxHeight: '90vh',
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateY(20px)' : 'translateY(0)',
        transition: 'opacity 300ms ease, transform 300ms ease'
      }}>
        
        <ProgressBar />

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Hero Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24, width: '100%' }}>
              <img src="/assets/welcome-hero.png" alt="Welcome to BHAO" style={{ width: '100%', maxWidth: 450, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.1))' }} />
            </div>

            <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, color: '#0D5C46', marginBottom: 8, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              WELCOME TO BHAO!
            </h2>
            <p style={{ textAlign: 'center', fontSize: 18, color: '#4b5563', marginBottom: 32, fontWeight: 500 }}>
              Build Wealth. Make Smart Decisions. Become A Tycoon.
            </p>

            <div style={{ display: 'flex', gap: 20, width: '100%', marginBottom: 32, flexWrap: 'wrap' }}>
              {/* Goal Card */}
              <HoverCard style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 48, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>🎯</div>
                <div>
                  <div style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.4, fontWeight: 500 }}>
                    Reach your <strong style={{color: '#0D5C46'}}>Wealth Goal</strong> before time runs out.
                  </div>
                </div>
              </HoverCard>

              {/* Rewards Card */}
              <HoverCard style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🏆</div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#4b5563' }}>RANK POINTS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🪙</div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#4b5563' }}>DAANIK COINS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>⭐</div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#4b5563' }}>XP</span>
                  </div>
                </div>
              </HoverCard>
            </div>

            <div style={{ width: '100%', maxWidth: 400 }}>
              <AnimatedButton onClick={handleNext}>
                Start Journey <span>→</span>
              </AnimatedButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, color: '#0D5C46', marginBottom: 32, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              KNOW YOUR CARDS
            </h2>
            
            <div style={{ display: 'flex', gap: 20, width: '100%', marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              
              {/* Decision Card */}
              <HoverCard style={{ flex: '1 1 200px', maxWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', background: 'linear-gradient(to bottom, #ffffff, #f0fdf4)', border: '2px solid #bbf7d0' }}>
                <div style={{ width: 80, height: 100, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #166534)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FBBF24', boxShadow: '0 8px 16px rgba(22,163,74,0.3)', marginBottom: 20 }}>
                  <span style={{ fontSize: 40 }}>📈</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#16A34A', marginBottom: 8 }}>DECISION</div>
                <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.4, fontWeight: 500 }}>
                  Choose to Spend, Save, or Invest.
                </div>
              </HoverCard>

              {/* Action Card */}
              <HoverCard style={{ flex: '1 1 200px', maxWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', background: 'linear-gradient(to bottom, #ffffff, #fef2f2)', border: '2px solid #fecaca' }}>
                <div style={{ width: 80, height: 100, borderRadius: 12, background: 'linear-gradient(135deg, #ef4444, #991b1b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FBBF24', boxShadow: '0 8px 16px rgba(239,68,68,0.3)', marginBottom: 20 }}>
                  <span style={{ fontSize: 40 }}>⚔️</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#dc2626', marginBottom: 8 }}>ACTION</div>
                <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.4, fontWeight: 500 }}>
                  Attack opponents and reduce their wealth.
                </div>
              </HoverCard>

              {/* Defense Card */}
              <HoverCard style={{ flex: '1 1 200px', maxWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', background: 'linear-gradient(to bottom, #ffffff, #eff6ff)', border: '2px solid #bfdbfe' }}>
                <div style={{ width: 80, height: 100, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FBBF24', boxShadow: '0 8px 16px rgba(59,130,246,0.3)', marginBottom: 20 }}>
                  <span style={{ fontSize: 40 }}>🛡️</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#2563eb', marginBottom: 8 }}>DEFENSE</div>
                <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.4, fontWeight: 500 }}>
                  Block incoming attacks.
                </div>
              </HoverCard>

            </div>

            {/* Tip */}
            <div style={{ background: '#FFF7ED', borderRadius: 16, padding: '16px 24px', marginBottom: 32, border: '1px solid #fed7aa', display: 'flex', gap: 16, alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: 32 }}>💡</span>
              <div style={{ fontSize: 16, color: '#9a3412', fontWeight: 600 }}>
                The right card at the right time can change the game.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 500 }}>
              <AnimatedButton variant="secondary" onClick={handlePrev}>
                Back
              </AnimatedButton>
              <AnimatedButton onClick={handleNext}>
                Next <span>→</span>
              </AnimatedButton>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, color: '#0D5C46', marginBottom: 8, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              HOW TO WIN
            </h2>
            <p style={{ textAlign: 'center', fontSize: 18, color: '#4b5563', marginBottom: 32, fontWeight: 500 }}>
              Grow your wealth and outperform your rivals.
            </p>

            {/* Illustration Podium */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 160, marginBottom: 32, gap: 16 }}>
              <div style={{ fontSize: 60, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))', transform: 'translateY(-10px)' }}>🥈</div>
              <div style={{ fontSize: 90, filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.2))', zIndex: 2 }}>🏆</div>
              <div style={{ fontSize: 60, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))', transform: 'translateY(-10px)' }}>🥉</div>
            </div>

            <div style={{ display: 'flex', gap: 20, width: '100%', marginBottom: 32, flexWrap: 'wrap' }}>
              {/* Leaderboard Box */}
              <HoverCard style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ fontSize: 18, color: '#4b5563', lineHeight: 1.5, fontWeight: 500, textAlign: 'center' }}>
                  Climb the leaderboard and become the ultimate <strong style={{color: '#0D5C46', fontWeight: 800}}>Tycoon</strong>.
                </div>
              </HoverCard>

              {/* Rewards Box */}
              <HoverCard style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🏆</div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4b5563', textAlign: 'center' }}>ACHIEVEMENTS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>⭐</div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4b5563', textAlign: 'center' }}>BADGES</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🎁</div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4b5563', textAlign: 'center' }}>REWARDS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>👑</div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#4b5563', textAlign: 'center' }}>TOP RANKS</span>
                  </div>
                </div>
              </HoverCard>
            </div>

            <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 500 }}>
              <AnimatedButton variant="secondary" onClick={handlePrev}>
                Back
              </AnimatedButton>
              <AnimatedButton variant="gold" onClick={onClose}>
                Let's Play BHAO <span>→</span>
              </AnimatedButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, color: '#0D5C46', marginBottom: 8, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              CHOOSE YOUR MODE
            </h2>
            <p style={{ textAlign: 'center', fontSize: 18, color: '#4b5563', marginBottom: 32, fontWeight: 500 }}>
              Two ways to play, endless ways to win.
            </p>

            <div style={{ display: 'flex', gap: 20, width: '100%', marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
              
              {/* Campaign Mode */}
              <HoverCard style={{ flex: '1 1 200px', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', background: 'linear-gradient(to bottom, #ffffff, #fefce8)', border: '2px solid #fef08a' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #eab308, #a16207)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fef08a', boxShadow: '0 8px 16px rgba(234,179,8,0.3)', marginBottom: 20 }}>
                  <span style={{ fontSize: 40 }}>🗺️</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ca8a04', marginBottom: 8 }}>YOUR JOURNEY MODE</div>
                <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5, fontWeight: 500 }}>
                  Progress through increasingly challenging levels, complete life stages, and master financial objectives.
                </div>
              </HoverCard>

              {/* Multiplayer Mode */}
              <HoverCard style={{ flex: '1 1 200px', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', background: 'linear-gradient(to bottom, #ffffff, #eff6ff)', border: '2px solid #bfdbfe' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #bfdbfe', boxShadow: '0 8px 16px rgba(59,130,246,0.3)', marginBottom: 20 }}>
                  <span style={{ fontSize: 40 }}>🌍</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', marginBottom: 8 }}>PLAY ONLINE</div>
                <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.5, fontWeight: 500 }}>
                  Compete with friends in real-time matches. Sabotage rivals and prove who the real Tycoon is!
                </div>
              </HoverCard>

            </div>

            <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 500 }}>
              <AnimatedButton variant="secondary" onClick={handlePrev}>
                Back
              </AnimatedButton>
              <AnimatedButton onClick={handleNext}>
                Next <span>→</span>
              </AnimatedButton>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
