import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { formatWealth } from '../../types/game'

// Drawn in a stretchable box (preserveAspectRatio="none"); dots are HTML so they stay round.
const W = 320
const H = 100
const PAD_X = 4
const PAD_Y = 10

/** Small net-worth-over-years line. Index 0 = start of game, then one point per year. */
export function NetWorthSparkline({ values }: { values: number[] }) {
  const { t } = useTranslation()
  const gradId = useId().replace(/:/g, '')
  const clean = values.map(v => (Number.isFinite(v) ? v : 0))
  const n = clean.length
  if (n < 2) return null

  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const span = max - min || Math.max(1, Math.abs(max))
  const x = (i: number) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2)
  const y = (v: number) => PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2)

  const points = clean.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
  const line = `M${points.join(' L')}`
  const area = `${line} L${x(n - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`
  const start = clean[0]
  const end = clean[n - 1]
  const peakIdx = clean.indexOf(max)
  const up = end >= start
  const stroke = up ? '#4ade80' : '#f87171'
  const years = n - 1

  const label = t('report.spark.label', { years, start: formatWealth(start), end: formatWealth(end), peak: formatWealth(max) })

  return (
    <figure className="rc-spark">
      <div className="rc-spark-plot">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        <title>{label}</title>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* starting level, so "above/below where I began" is visible */}
        <line x1={PAD_X} x2={W - PAD_X} y1={y(start)} y2={y(start)} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {/* hover targets: native tooltip per year */}
        {clean.map((v, i) => (
          <rect key={i} x={x(i) - (W / n) / 2} y={0} width={W / n} height={H} fill="transparent">
            <title>{t('report.spark.year', { n: i, amount: formatWealth(v) })}</title>
          </rect>
        ))}
      </svg>
      {peakIdx > 0 && peakIdx < n - 1 && (
        <span className="rc-spark-dot" style={{ left: `${(x(peakIdx) / W) * 100}%`, top: `${(y(max) / H) * 100}%`, width: 7, height: 7, background: '#FFD050' }} aria-hidden="true" />
      )}
      <span className="rc-spark-dot" style={{ left: `${(x(n - 1) / W) * 100}%`, top: `${(y(end) / H) * 100}%`, width: 10, height: 10, background: stroke }} aria-hidden="true" />
      </div>
      <figcaption className="rc-spark-axis" aria-hidden="true">
        <span>{t('report.spark.start')}</span>
        <span>{t('report.spark.yearN', { n: years })}</span>
      </figcaption>
    </figure>
  )
}
