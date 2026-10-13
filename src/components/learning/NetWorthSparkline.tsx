import { useTranslation } from 'react-i18next'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'

const W = 300
const H = 54
const PAD = 4

/** Net worth over the years (index 0 = start of game, then one value per year). Result screen, light. */
export function NetWorthSparkline({ values }: { values: number[] }) {
  const { t } = useTranslation()
  const lang = useLang()
  const clean = values.map(v => (Number.isFinite(v) ? v : 0))
  const n = clean.length
  if (n < 2) return null

  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const span = max - min || Math.max(1, Math.abs(max))
  const x = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2)
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2)
  const points = clean.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const start = clean[0]
  const end = clean[n - 1]
  const money = (v: number) => formatMoney(v, { compact: true, lang })
  const label = t('report.spark.label', { years: n - 1, start: money(start), end: money(end), peak: money(max) })

  return (
    <figure className="spark">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} className="spark__svg">
        <line x1={PAD} x2={W - PAD} y1={y(start)} y2={y(start)} className="spark__base" vectorEffect="non-scaling-stroke" />
        <polyline points={points} className={`spark__line ${end >= start ? 'is-up' : 'is-down'}`} vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="spark__axis" aria-hidden="true">
        <span>{t('report.spark.start')}</span>
        <span>{t('report.spark.yearN', { n: n - 1 })}</span>
      </figcaption>
    </figure>
  )
}
