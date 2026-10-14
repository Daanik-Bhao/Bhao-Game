import { useTranslation } from 'react-i18next'
import type { ReportCard } from '../../types/learning'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'

/** "If you did this for real" — the player's own mix vs an FD vs an index-fund SIP (spec §E.20 (6)). */
export function ProjectionBars({ projection }: { projection: ReportCard['projection']; hindi?: boolean }) {
  const { t } = useTranslation()
  const lang = useLang()
  const invested = projection.monthlyAmount * 12 * projection.years
  const money = (v: number) => formatMoney(v, { compact: v >= 100000, lang })
  const rows = [
    { key: 'mix', label: t('report.proj.yourMix'), value: projection.yourMixValue, tone: 'spend' },
    { key: 'fd', label: t('report.proj.fd'), value: projection.fdValue, tone: 'defence' },
    { key: 'index', label: t('report.proj.index'), value: projection.indexValue, tone: 'save' },
  ]
  const max = Math.max(invested, ...rows.map(r => r.value), 1)

  return (
    <div className="proj">
      <p className="proj__sub">{t('report.proj.sub', { monthly: money(projection.monthlyAmount), years: projection.years, total: money(invested) })}</p>
      <ul className="proj__rows">
        {rows.map(r => {
          const pct = Math.max(2, (Math.max(0, r.value) / max) * 100)
          return (
            <li key={r.key} className="proj__row">
              <div className="proj__head">
                <span className={r.key === 'mix' ? 'proj__label is-you' : 'proj__label'}>{r.label}</span>
                <b className="num proj__value">{money(r.value)}</b>
              </div>
              <div className="proj__track" role="img" aria-label={`${r.label}: ${money(r.value)}`}>
                <i className={`proj__fill tone-${r.tone}`} style={{ width: `${pct}%` }} />
                {invested > 0 && <span className="proj__putin" style={{ left: `${(invested / max) * 100}%` }} aria-hidden="true" />}
              </div>
            </li>
          )
        })}
      </ul>
      {invested > 0 && (
        <p className="proj__legend" aria-hidden="true"><span className="proj__putin-key" /> {t('report.proj.legend')}</p>
      )}
    </div>
  )
}
