import type { ReactNode } from 'react'
import './ui.css'

export interface ProgressProps {
  /** 0..max */
  value: number
  max?: number
  /** 'save' (default green), 'goal' (save → save-on-dark gradient, net-worth goal), 'haldi' (year / campaign) */
  tone?: 'save' | 'goal' | 'haldi'
  /** Text shown next to the bar AND used as aria-valuetext, e.g. "25% of ₹50 L" */
  label?: ReactNode
  /** Accessible name of the bar */
  ariaLabel?: string
  /** aria-valuetext when the visible label is not plain text */
  valueText?: string
  className?: string
  labelPosition?: 'after' | 'none'
}

/** Progress bar (spec §D.9). */
export function Progress({ value, max = 100, tone = 'save', label, ariaLabel, valueText, className = '', labelPosition = 'after' }: ProgressProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const vt = valueText ?? (typeof label === 'string' ? label : undefined)
  const bar = (
    <div
      className={`progress${tone !== 'save' ? ` progress--${tone}` : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(Math.max(0, Math.min(max, value)))}
      aria-valuetext={vt}
      aria-label={ariaLabel}
    >
      <i className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
  if (!label || labelPosition === 'none') return <div className={`progress-row ${className}`.trim()}>{bar}</div>
  return (
    <div className={`progress-row ${className}`.trim()}>
      {bar}
      <span className="progress-row__label" aria-hidden="true">{label}</span>
    </div>
  )
}
