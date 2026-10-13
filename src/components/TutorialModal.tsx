import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, CalendarDays, Shield, Target, Wallet, type LucideIcon } from 'lucide-react'
import { BASE_INFLATION_PCT } from '../data/assets'
import { HAND_SIZE, MAX_ACTIVE_DEFENSES } from '../lib/gameEngine'
import { ProgressDots } from './tutorial/ProgressDots'
import { Button, Sheet } from './ui'
import './tutorial/tutorial.css'

interface TutorialModalProps {
  onClose: () => void
  /** Optional: show a "Play the guided match" button on the last slide */
  onStartTutorial?: () => void
}

interface Slide {
  icon: LucideIcon
  key: string
  /** number of bullet points under tutorial.rules.<key>.p1..pN */
  points: number
}

/** The rules in four slides — kept in sync with docs/phase3-design.md. Text: tutorial.rules.* */
const SLIDES: Slide[] = [
  { icon: Target, key: 'goal', points: 2 },
  { icon: Wallet, key: 'cash', points: 3 },
  { icon: CalendarDays, key: 'year', points: 3 },
  { icon: Shield, key: 'events', points: 3 },
]

const RULE_VALUES = { hand: HAND_SIZE, maxDefenses: MAX_ACTIVE_DEFENSES, inflation: BASE_INFLATION_PCT }

/** "How BHAO works" in four slides, on the shared Sheet (rules sheet from the pause menu / tutorial hook). */
export function TutorialModal({ onClose, onStartTutorial }: TutorialModalProps) {
  const { t } = useTranslation()
  const [i, setI] = useState(0)
  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1
  const Icon = slide.icon

  return (
    <Sheet
      open
      onClose={onClose}
      title={t('tutorial.rules.kicker')}
      ariaLabel={t('tutorial.rules.aria')}
      footer={
        <div className="rules__nav">
          <ProgressDots current={i + 1} total={SLIDES.length} />
          <div className="rules__btns">
            {i > 0 && <Button variant="ghost" size="s" icon={<ArrowLeft size={18} aria-hidden="true" />} onClick={() => setI(i - 1)}>{t('common.back')}</Button>}
            {!last && <Button size="s" iconRight={<ArrowRight size={18} aria-hidden="true" />} onClick={() => setI(i + 1)}>{t('tutorial.next')}</Button>}
            {last && onStartTutorial && <Button size="s" onClick={onStartTutorial}>{t('tutorial.rules.playGuided')}</Button>}
            {last && !onStartTutorial && <Button size="s" onClick={onClose}>{t('tutorial.rules.gotIt')}</Button>}
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={i} className="rules" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          <span className="rules__icon" aria-hidden="true"><Icon size={28} strokeWidth={2.25} /></span>
          <h3 className="rules__title">{t(`tutorial.rules.${slide.key}.title`)}</h3>
          <ul className="rules__points">
            {Array.from({ length: slide.points }, (_, n) => t(`tutorial.rules.${slide.key}.p${n + 1}`, RULE_VALUES)).map(p => <li key={p}>{p}</li>)}
          </ul>
        </motion.div>
      </AnimatePresence>
    </Sheet>
  )
}
