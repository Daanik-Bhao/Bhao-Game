import { useTranslation } from 'react-i18next'

/** "Lesson n of total" dots. */
export function ProgressDots({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation()
  return (
    <div className="tut-dots" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={t('tutorial.stepOf', { n: current, total })}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`tut-dot${i + 1 < current ? ' done' : i + 1 === current ? ' now' : ''}`} />
      ))}
    </div>
  )
}
