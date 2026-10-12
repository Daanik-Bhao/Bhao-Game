import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  CHAI_PER_DAY, CHAI_PER_MONTH, HOOK_FUTURE_VALUE, HOOK_PAID_IN, HOOK_RATE_PCT, HOOK_YEARS,
} from '../../data/tutorialScript'
import { formatINR } from '../../lib/economy'
import { formatLakhIn } from '../../i18n/lang'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { ProgressDots } from './ProgressDots'
import { LESSON_COUNT } from './steps'
import './tutorial.css'

/** Opening hook: what ₹150 of chai a day becomes as a SIP. */
export function TutorialHook({ onStart, onSkip, onRules }: { onStart: () => void; onSkip: () => void; onRules: () => void }) {
  const { t, i18n } = useTranslation()
  const lakh = (n: number) => formatLakhIn(n, i18n.language)
  return (
    <div className="tut-page">
      <motion.div className="tut-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tut-card-head">
          <span className="tut-kicker">{t('tutorial.hook.kicker')}</span>
          <span className="tut-head-actions">
            <LanguageSwitcher variant="cycle" tone="dark" />
            <button type="button" className="tut-skip" onClick={onSkip}>{t('tutorial.skip')}</button>
          </span>
        </div>
        <h1 className="tut-h1">{t('tutorial.hook.title', { amount: lakh(HOOK_FUTURE_VALUE) })}</h1>
        <div className="tut-chain">
          <div className="tut-chain-item">
            <div className="tut-chain-num">₹{CHAI_PER_DAY}</div>
            <div className="tut-chain-label">{t('tutorial.hook.perDay')}</div>
          </div>
          <div className="tut-chain-arrow" aria-hidden>→</div>
          <div className="tut-chain-item">
            <div className="tut-chain-num">{formatINR(CHAI_PER_MONTH)}</div>
            <div className="tut-chain-label">{t('tutorial.hook.perMonth')}</div>
          </div>
          <div className="tut-chain-arrow" aria-hidden>→</div>
          <motion.div
            className="tut-chain-item big"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 1] }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="tut-chain-num">≈ {lakh(HOOK_FUTURE_VALUE)}</div>
            <div className="tut-chain-label">{t('tutorial.hook.after', { years: HOOK_YEARS, rate: HOOK_RATE_PCT })}</div>
          </motion.div>
        </div>
        <p className="tut-fine">
          {t('tutorial.hook.fine', { paidIn: lakh(HOOK_PAID_IN), growth: lakh(HOOK_FUTURE_VALUE - HOOK_PAID_IN), rate: HOOK_RATE_PCT })}
        </p>
        <p className="tut-lead">{t('tutorial.hook.lead')}</p>
        <div className="tut-btn-row">
          <button type="button" className="tut-btn tut-btn-gold" onClick={onStart} autoFocus>{t('tutorial.hook.start')} →</button>
        </div>
        <button type="button" className="tut-link" onClick={onRules}>{t('tutorial.hook.rules')}</button>
      </motion.div>
    </div>
  )
}

export interface TutorialSummaryProps {
  skipped: boolean
  yourNetWorth?: number
  rahulNetWorth?: number
  onPlay: () => void
  onLibrary: () => void
  onBack: () => void
  onReplay: () => void
}

const LESSONS: { emoji: string; key: string }[] = [
  { emoji: '📈', key: 'invest' },
  { emoji: '🛟', key: 'emergency' },
  { emoji: '🛡️', key: 'insure' },
  { emoji: '🎣', key: 'scam' },
]

/** Final screen: the four lessons + where to go next. */
export function TutorialSummary({ skipped, yourNetWorth, rahulNetWorth, onPlay, onLibrary, onBack, onReplay }: TutorialSummaryProps) {
  const { t } = useTranslation()
  return (
    <div className="tut-page">
      <motion.div className="tut-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tut-card-head">
          <span className="tut-kicker">{skipped ? t('tutorial.summary.kickerSkipped') : t('tutorial.summary.kickerDone')}</span>
          <ProgressDots current={LESSON_COUNT} total={LESSON_COUNT} />
        </div>
        <h1 className="tut-h1">{skipped ? t('tutorial.summary.titleSkipped') : t('tutorial.summary.titleDone')}</h1>
        {!skipped && yourNetWorth !== undefined && rahulNetWorth !== undefined && (
          <div className="tut-scores">
            <div className="tut-score"><small>{t('tutorial.summary.yourNetWorth')}</small><b>{formatINR(yourNetWorth)}</b></div>
            <div className="tut-score"><small>{t('tutorial.summary.rahulNetWorth')}</small><b>{formatINR(rahulNetWorth)}</b></div>
          </div>
        )}
        <ul className="tut-lessons">
          {LESSONS.map(l => (
            <li key={l.key}>
              <span className="tut-l-emoji" aria-hidden>{l.emoji}</span>
              <span><strong>{t(`tutorial.summary.lesson.${l.key}.title`)}</strong>{t(`tutorial.summary.lesson.${l.key}.body`)}</span>
            </li>
          ))}
        </ul>
        <div className="tut-btn-row">
          <button type="button" className="tut-btn tut-btn-gold" onClick={onPlay} autoFocus>{t('tutorial.summary.play')}</button>
          <button type="button" className="tut-btn tut-btn-primary" onClick={onLibrary}>{t('report.openLibrary')}</button>
        </div>
        <div className="tut-btn-row" style={{ marginTop: 10 }}>
          <button type="button" className="tut-btn tut-btn-ghost" onClick={onBack}>{t('board.back')}</button>
          <button type="button" className="tut-btn tut-btn-ghost" onClick={onReplay}>{skipped ? t('tutorial.summary.playTutorial') : t('tutorial.summary.replay')}</button>
        </div>
      </motion.div>
    </div>
  )
}
