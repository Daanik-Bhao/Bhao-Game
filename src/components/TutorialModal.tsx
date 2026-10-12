import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
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
  key: string
  /** number of bullet points under tutorial.rules.<key>.p1..pN */
  points: number
}

/** The rules in four slides — kept in sync with docs/phase3-design.md. Text: tutorial.rules.* */
const SLIDES: Slide[] = [
  { emoji: '🎯', key: 'goal', points: 2 },
  { emoji: '💵', key: 'cash', points: 3 },
  { emoji: '📅', key: 'year', points: 3 },
  { emoji: '🛡️', key: 'events', points: 3 },
]

const RULE_VALUES = { hand: HAND_SIZE, maxDefenses: MAX_ACTIVE_DEFENSES, inflation: BASE_INFLATION_PCT }

/** Short "How BHAO works" intro (4 slides). */
export function TutorialModal({ onClose, onStartTutorial }: TutorialModalProps) {
  const { t } = useTranslation()
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
      aria-label={t('tutorial.rules.aria')}
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
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: '#0b5d3f' }}>{t('tutorial.rules.kicker')} · {i + 1}/{SLIDES.length}</span>
          <button type="button" className="tut-skip" onClick={onClose} aria-label={t('common.close')}>{t('common.close')} ✕</button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
            <div style={{ fontSize: 44, lineHeight: 1, margin: '4px 0 8px' }} aria-hidden>{slide.emoji}</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0b3d2a', marginBottom: 10 }}>{t(`tutorial.rules.${slide.key}.title`)}</h2>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 8, marginBottom: 16 }}>
              {Array.from({ length: slide.points }, (_, n) => t(`tutorial.rules.${slide.key}.p${n + 1}`, RULE_VALUES)).map(p => (
                <li key={p} style={{ fontSize: 15, lineHeight: 1.45, background: '#f0f6ef', borderRadius: 12, padding: '10px 12px' }}>{p}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <ProgressDots current={i + 1} total={SLIDES.length} />
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {i > 0 && <button type="button" className="tut-btn tut-btn-ghost" onClick={() => setI(i - 1)}>{t('board.back')}</button>}
            {!last && <button type="button" className="tut-btn tut-btn-primary" onClick={() => setI(i + 1)}>{t('tutorial.next')} →</button>}
            {last && onStartTutorial && <button type="button" className="tut-btn tut-btn-gold" onClick={onStartTutorial}>{t('tutorial.rules.playGuided')}</button>}
            {last && !onStartTutorial && <button type="button" className="tut-btn tut-btn-gold" onClick={onClose}>{t('tutorial.rules.gotIt')}</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
