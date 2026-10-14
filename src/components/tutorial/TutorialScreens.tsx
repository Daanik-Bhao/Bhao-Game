import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BookOpen, ChartLine, House, LifeBuoy, Play, RotateCcw, ShieldAlert, ShieldCheck, type LucideIcon } from 'lucide-react'
import {
  CHAI_PER_DAY, CHAI_PER_MONTH, HOOK_FUTURE_VALUE, HOOK_PAID_IN, HOOK_RATE_PCT, HOOK_YEARS,
} from '../../data/tutorialScript'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { Button } from '../ui'
import { Gullu } from '../mascot/Gullu'
import { ProgressDots } from './ProgressDots'
import { LESSON_COUNT } from './steps'
import './tutorial.css'

/** Opening hook (spec §E.10): what ₹150 of chai a day becomes as a SIP. Dark table background. */
export function TutorialHook({ onStart, onSkip, onRules }: { onStart: () => void; onSkip: () => void; onRules: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  const lakh = (n: number) => formatMoney(n, { compact: true, lang })
  return (
    <div className="tut-page surface-table">
      <header className="tut-page__bar">
        <Button variant="ghost" size="s" onClick={onSkip} className="tut-page__skip">{t('tutorial.skip')}</Button>
        <LanguageSwitcher />
      </header>
      <motion.main className="tut-hook" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Gullu mood="cheer" size={96} />
        <p className="caption tut-hook__kicker">{t('tutorial.hook.kicker')}</p>
        <h1 className="tut-hook__title">{t('tutorial.hook.title', { amount: lakh(HOOK_FUTURE_VALUE) })}</h1>
        <div className="tut-chain" role="img" aria-label={`${formatMoney(CHAI_PER_DAY)} ${t('tutorial.hook.perDay')} → ${formatMoney(CHAI_PER_MONTH)} ${t('tutorial.hook.perMonth')} → ${lakh(HOOK_FUTURE_VALUE)}`}>
          <span className="tut-chain__item"><b className="num">{formatMoney(CHAI_PER_DAY)}</b><small>{t('tutorial.hook.perDay')}</small></span>
          <ArrowRight className="tut-chain__arrow" size={20} aria-hidden="true" />
          <span className="tut-chain__item"><b className="num">{formatMoney(CHAI_PER_MONTH)}</b><small>{t('tutorial.hook.perMonth')}</small></span>
        </div>
        <p className="tut-hook__big num">{lakh(HOOK_FUTURE_VALUE)}</p>
        <p className="tut-hook__after">{t('tutorial.hook.after', { years: HOOK_YEARS, rate: HOOK_RATE_PCT })}</p>
        <p className="tut-hook__fine">{t('tutorial.hook.fine', { paidIn: lakh(HOOK_PAID_IN), growth: lakh(HOOK_FUTURE_VALUE - HOOK_PAID_IN), rate: HOOK_RATE_PCT })}</p>
        <p className="tut-hook__lead">{t('tutorial.hook.lead')}</p>
        <Button size="l" icon={<Play size={20} aria-hidden="true" />} onClick={onStart} data-autofocus className="tut-hook__cta">{t('tutorial.hook.showMe')}</Button>
        <Button variant="ghost" onClick={onRules}>{t('tutorial.hook.rules')}</Button>
      </motion.main>
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

const LESSONS: { icon: LucideIcon; key: string }[] = [
  { icon: ChartLine, key: 'invest' },
  { icon: LifeBuoy, key: 'emergency' },
  { icon: ShieldCheck, key: 'insure' },
  { icon: ShieldAlert, key: 'scam' },
]

/** Final screen: the four lessons + where to go next (light paper page). */
export function TutorialSummary({ skipped, yourNetWorth, rahulNetWorth, onPlay, onLibrary, onBack, onReplay }: TutorialSummaryProps) {
  const { t } = useTranslation()
  const lang = useLang()
  return (
    <div className="page tut-summary">
      <main className="page__main page__main--list">
        <motion.div className="tut-summary__top" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Gullu mood={skipped ? 'happy' : 'cheer'} size={88} />
          <p className="caption">{skipped ? t('tutorial.summary.kickerSkipped') : t('tutorial.summary.kickerDone')}</p>
          {!skipped && <ProgressDots current={LESSON_COUNT} total={LESSON_COUNT} />}
          <h1 className="page-title">{skipped ? t('tutorial.summary.titleSkipped') : t('tutorial.summary.titleDone')}</h1>
        </motion.div>
        {!skipped && yourNetWorth !== undefined && rahulNetWorth !== undefined && (
          <div className="tut-scores">
            <div className="panel tut-score"><small>{t('tutorial.summary.yourNetWorth')}</small><b className="num">{formatMoney(yourNetWorth, { compact: true, lang })}</b></div>
            <div className="panel tut-score"><small>{t('tutorial.summary.rahulNetWorth')}</small><b className="num">{formatMoney(rahulNetWorth, { compact: true, lang })}</b></div>
          </div>
        )}
        <ul className="tut-lessons">
          {LESSONS.map(({ icon: Icon, key }) => (
            <li key={key} className="panel">
              <span className="tut-lessons__icon" aria-hidden="true"><Icon size={22} /></span>
              <span><strong>{t(`tutorial.summary.lesson.${key}.title`)}</strong> {t(`tutorial.summary.lesson.${key}.body`)}</span>
            </li>
          ))}
        </ul>
        <div className="tut-summary__more">
          <Button variant="outline" icon={<BookOpen size={18} aria-hidden="true" />} onClick={onLibrary}>{t('report.openLibrary')}</Button>
          <Button variant="ghost" icon={<RotateCcw size={18} aria-hidden="true" />} onClick={onReplay}>{skipped ? t('tutorial.summary.playTutorial') : t('tutorial.summary.replay')}</Button>
        </div>
      </main>
      <div className="sticky-cta">
        <div className="sticky-cta__inner">
          <Button variant="outline" icon={<House size={20} aria-hidden="true" />} onClick={onBack}>{t('common.home')}</Button>
          <Button icon={<Play size={20} aria-hidden="true" />} onClick={onPlay} data-autofocus>{t('tutorial.summary.play')}</Button>
        </div>
      </div>
    </div>
  )
}
