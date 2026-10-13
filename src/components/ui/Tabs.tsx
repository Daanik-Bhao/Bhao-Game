import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import './ui.css'

export interface TabItem<V extends string> { value: V; label: ReactNode; id?: string; controls?: string }

export interface TabsProps<V extends string> {
  items: TabItem<V>[]
  value: V
  onChange: (v: V) => void
  ariaLabel: string
  className?: string
}

/** Underline tabs (spec §D.8): 44px, Baloo 700 16, active brand + 3px underline. Arrow keys move. */
export function Tabs<V extends string>({ items, value, onChange, ariaLabel, className = '' }: TabsProps<V>) {
  const ref = useRef<HTMLDivElement>(null)
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = items.findIndex(it => it.value === value)
    const next = items[(i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length]
    onChange(next.value)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus())
  }
  return (
    <div ref={ref} role="tablist" aria-label={ariaLabel} className={`tabs ${className}`.trim()} onKeyDown={onKey}>
      {items.map(it => (
        <button
          key={it.value}
          id={it.id}
          type="button"
          role="tab"
          className="tabs__btn"
          aria-selected={it.value === value}
          aria-controls={it.controls}
          tabIndex={it.value === value ? 0 : -1}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}
