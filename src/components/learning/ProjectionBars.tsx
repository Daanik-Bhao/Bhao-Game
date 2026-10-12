import type { ReportCard } from '../../types/learning'
import { formatRupees } from './conceptInfo'

/** Three-bar comparison: the player's own asset mix vs a plain FD vs an index-fund SIP. */
export function ProjectionBars({ projection, hindi }: { projection: ReportCard['projection']; hindi: boolean }) {
  const invested = projection.monthlyAmount * 12 * projection.years
  const rows = [
    { key: 'mix', label: hindi ? 'आपका तरीका' : 'Your mix', value: projection.yourMixValue, color: '#FFD050', you: true },
    { key: 'fd', label: hindi ? 'FD / बचत खाता' : 'FD / savings', value: projection.fdValue, color: '#94a3b8', you: false },
    { key: 'index', label: hindi ? 'इंडेक्स फंड SIP' : 'Index fund SIP', value: projection.indexValue, color: '#30A060', you: false },
  ]
  const max = Math.max(invested, ...rows.map(r => r.value), 1)

  return (
    <div>
      <p className="rc-proj-sub">
        {hindi
          ? `हर महीने ${formatRupees(projection.monthlyAmount, true)}, ${projection.years} साल तक (कुल जमा ${formatRupees(invested, true)})`
          : `${formatRupees(projection.monthlyAmount)} a month for ${projection.years} years (you put in ${formatRupees(invested)})`}
      </p>
      <ul className="rc-bars">
        {rows.map(r => {
          const pct = Math.max(2, (Math.max(0, r.value) / max) * 100)
          return (
            <li key={r.key} className="rc-bar-row">
              <div className="rc-bar-head">
                <span className={r.you ? 'rc-bar-label you' : 'rc-bar-label'}>{r.label}</span>
                <span className="rc-bar-value">{formatRupees(r.value, hindi)}</span>
              </div>
              <div className="rc-bar-track">
                <div className="rc-bar-fill" style={{ width: `${pct}%`, background: r.color }} />
                {invested > 0 && (
                  <div
                    className="rc-bar-invested"
                    style={{ left: `${(invested / max) * 100}%` }}
                    title={hindi ? 'जमा की गई रकम' : 'Amount you put in'}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {invested > 0 && (
        <div className="rc-bar-legend" aria-hidden="true">
          <span className="rc-bar-legend-tick" /> {hindi ? 'आपकी जमा रकम' : 'what you put in'}
        </div>
      )}
    </div>
  )
}
