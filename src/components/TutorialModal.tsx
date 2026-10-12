import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BASE_INFLATION_PCT } from '../data/assets'
import { HAND_SIZE, MAX_ACTIVE_DEFENSES } from '../lib/gameEngine'
import { ProgressDots } from './tutorial/ProgressDots'
import './tutorial/tutorial.css'

interface TutorialModalProps {
  onClose: () => void
  /** Optional: show a "Play the guided match" button on the last slide */
  onStartTutorial?: () => void
}

interface Slide {
  emoji: string
  title: string
  points: string[]
}

/** The rules in four slides — kept in sync with docs/phase3-design.md. */
const SLIDES: Slide[] = [
  {
    emoji: '🎯',
    title: 'The goal',
    points: [
      'Grow your net worth to the goal before your rivals — or be the richest when the years run out.',
      'One round = one year of your life. Everyone plays one turn per year.',
    ],
  },
  {
    emoji: '💵',
    title: 'Cash vs investments',
    points: [
      'Net worth = cash + investments.',
      `You hold ${HAND_SIZE} cards. Each turn play one card: Save (adds cash), Spend (costs cash, raises your lifestyle) or Invest (moves cash into an index fund, gold, property…).`,
      `Equipping a defense is free (up to ${MAX_ACTIVE_DEFENSES}). Or Pass: discard one card and end your turn.`,
    ],
  },
  {
    emoji: '📅',
    title: 'A year passes',
    points: [
      'Every investment moves with the market: steady ones a little, risky ones a lot — crashes happen.',
      `Inflation eats about ${BASE_INFLATION_PCT}% of idle cash each year (more if you keep spending on lifestyle).`,
      'So invest what you won’t need — but keep some cash.',
    ],
  },
  {
    emoji: '🛡️',
    title: 'Life events & defenses',
    points: [
      'Most years bring a life event: a bonus, a hospital bill, a job gap, a “guaranteed” scam tip…',
      'Bills are paid from cash. No cash? Your investments get sold in a hurry, at a penalty. That’s why you keep an emergency fund.',
      'Defense cards like Health Insurance block whole kinds of trouble.',
    ],
  },
]

/** Short "How BHAO works" intro (4 slides). */
export function TutorialModal({ onClose, onStartTutorial }: TutorialModalProps) {
  const [i, setI] = useState(0)
  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI(n => Math.min(SLIDES.length - 1, n + 1))
      if (e.key === 'ArrowLeft') setI(n => Math.max(0, n - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How BHAO works"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10050, background: 'rgba(0, 12, 6, 0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto',
          background: '#fffdf3', color: '#12261d', borderRadius: 20, padding: '16px 18px 18px',
          border: '2px solid #ffd050', boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#0b5d3f' }}>HOW BHAO WORKS · {i + 1}/{SLIDES.length}</span>
          <button type="button" className="tut-skip" onClick={onClose} aria-label="Close">Close ✕</button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
            <div style={{ fontSize: 44, lineHeight: 1, margin: '4px 0 8px' }} aria-hidden>{slide.emoji}</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0b3d2a', marginBottom: 10 }}>{slide.title}</h2>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8, marginBottom: 16 }}>
              {slide.points.map(p => (
                <li key={p} style={{ fontSize: 15, lineHeight: 1.45, background: '#f0f6ef', borderRadius: 12, padding: '10px 12px' }}>{p}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <ProgressDots current={i + 1} total={SLIDES.length} />
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {i > 0 && <button type="button" className="tut-btn tut-btn-ghost" onClick={() => setI(i - 1)}>Back</button>}
            {!last && <button type="button" className="tut-btn tut-btn-primary" onClick={() => setI(i + 1)}>Next →</button>}
            {last && onStartTutorial && <button type="button" className="tut-btn tut-btn-gold" onClick={onStartTutorial}>Play the guided match</button>}
            {last && !onStartTutorial && <button type="button" className="tut-btn tut-btn-gold" onClick={onClose}>Got it</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
