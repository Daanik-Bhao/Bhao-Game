import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { OLDEST_BIRTH_YEAR_OFFSET } from '../../lib/ageBand'
import './age.css'

/** Years offered, newest first: this year back to OLDEST_BIRTH_YEAR_OFFSET years ago. */
export function birthYears(currentYear: number): number[] {
  return Array.from({ length: OLDEST_BIRTH_YEAR_OFFSET + 1 }, (_, i) => currentYear - i)
}

/**
 * Neutral year-of-birth picker (native <select>: accessible, 48 px, works with every
 * keyboard and screen reader). No age hint is shown next to the years on purpose.
 */
export function YearSelect({ value, onChange, label, hint, id, currentYear = new Date().getFullYear(), error }: {
  value: number | null
  onChange: (year: number | null) => void
  label: string
  hint?: string
  id?: string
  currentYear?: number
  error?: string
}) {
  const { t } = useTranslation()
  const autoId = useId()
  const selectId = id ?? `year-${autoId}`
  const hintId = `${selectId}-hint`
  return (
    <div className="field">
      <label className="field__label" htmlFor={selectId}>{label}</label>
      <select
        id={selectId}
        className="field__input age-select"
        value={value ?? ''}
        aria-describedby={error || hint ? hintId : undefined}
        aria-invalid={error ? true : undefined}
        required
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">{t('age.choose')}</option>
        {birthYears(currentYear).map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      {error ? <span id={hintId} className="field__hint field__hint--error">{error}</span>
        : hint ? <span id={hintId} className="field__hint">{hint}</span> : null}
    </div>
  )
}
