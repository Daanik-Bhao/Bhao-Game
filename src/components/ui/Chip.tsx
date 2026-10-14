import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import './ui.css'

export type ChipTone =
  | 'neutral' | 'spend' | 'save' | 'invest' | 'defence' | 'attack' | 'risk' | 'event' | 'brand'
  | 'solid-spend' | 'solid-save' | 'solid-invest' | 'solid-attack' | 'solid-defence' | 'on-dark-risk'

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone
  icon?: ReactNode
  children: ReactNode
}

/** Non-interactive label, 28px tall (spec §D.3). */
export function Chip({ tone = 'neutral', icon, children, className = '', ...rest }: ChipProps) {
  return (
    <span className={`chip${tone !== 'neutral' ? ` chip--${tone}` : ''} ${className}`.trim()} {...rest}>
      {icon}
      {children}
    </span>
  )
}

export interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed: boolean
  onPressedChange?: (next: boolean) => void
  icon?: ReactNode
  children: ReactNode
}

/** Tappable filter chip: 40px visual, 44px hit area, aria-pressed. */
export function ToggleChip({ pressed, onPressedChange, icon, children, className = '', onClick, ...rest }: ToggleChipProps) {
  return (
    <button
      type="button"
      className={`togglechip ${className}`.trim()}
      aria-pressed={pressed}
      onClick={e => { onClick?.(e); onPressedChange?.(!pressed) }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
