import { useTranslation } from 'react-i18next'

/** Step counter "2 / 9" with a mini progress bar (spec §E.10; replaces the old dots). */
export function ProgressDots({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation()
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0
  return (
    <div className="tut-steps" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={t('tutorial.stepOf', { n: current, total })}>
      <span className="tut-steps__text num" aria-hidden="true">{current} / {total}</span>
      <span className="tut-steps__bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
    </div>
  )
}
