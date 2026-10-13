import type { ReactNode } from 'react'
import './ui.css'

export interface SegmentedOption<V extends string | number> {
  value: V
  label: ReactNode
  /** Accessible name if the label is not text */
  ariaLabel?: string
  /** `lang` attribute for the label (e.g. 'hi' for हिंदी) */
  lang?: string
}

export interface SegmentedProps<V extends string | number> {
  options: SegmentedOption<V>[]
  value: V
  onChange: (v: V) => void
  /** Group label for screen readers */
  ariaLabel: string
  block?: boolean
  /** 56px tall options (practice setup) */
  tall?: boolean
  className?: string
}

/** Segmented control (spec §D.8): pill track, ≥ 44px hit targets, active = brand, aria-pressed. */
export function Segmented<V extends string | number>({ options, value, onChange, ariaLabel, block, tall, className = '' }: SegmentedProps<V>) {
  return (
    <div role="group" aria-label={ariaLabel} className={`seg${block ? ' seg--block' : ''}${tall ? ' seg--tall' : ''} ${className}`.trim()}>
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          className="seg__btn"
          aria-pressed={o.value === value}
          aria-label={o.ariaLabel}
          lang={o.lang}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
