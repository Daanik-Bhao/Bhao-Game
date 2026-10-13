import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import './ui.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'spend' | 'save' | 'invest'
export type ButtonSize = 's' | 'm' | 'l'

/** Class list for a button-looking element (e.g. a router <Link>). */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'm', opts: { block?: boolean; icon?: boolean; className?: string } = {}): string {
  return [
    'btn',
    `btn--${variant}`,
    size !== 'm' ? `btn--${size}` : '',
    opts.block ? 'btn--block' : '',
    opts.icon ? 'btn--icon' : '',
    opts.className ?? '',
  ].filter(Boolean).join(' ')
}

interface BaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Full width */
  block?: boolean
  /** Spinner replaces the icon, label stays, not clickable, aria-busy */
  loading?: boolean
  /** Leading icon (lucide element) */
  icon?: ReactNode
  /** Trailing icon */
  iconRight?: ReactNode
  /** Allow the label to wrap onto two lines */
  wrap?: boolean
}

/** Icon-only buttons must have an accessible name (spec §D.1). */
type IconOnlyProps = BaseProps & { icon: ReactNode; children?: undefined; 'aria-label': string }
type LabelledProps = BaseProps & { children: ReactNode }
export type ButtonProps = IconOnlyProps | LabelledProps

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'm', block, loading, icon, iconRight, wrap, className = '', disabled, children, type = 'button', onClick, ...rest },
  ref,
) {
  const iconOnly = children === undefined || children === null
  const cls = [
    buttonClass(variant, size, { block, icon: iconOnly, className }),
    loading ? 'is-loading' : '',
    wrap ? 'btn--wrap' : '',
  ].filter(Boolean).join(' ')
  const inactive = disabled || loading
  return (
    <button
      ref={ref}
      type={type}
      className={cls}
      disabled={disabled}
      aria-disabled={inactive ? true : undefined}
      aria-busy={loading ? true : undefined}
      onClick={inactive ? undefined : onClick}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : icon}
      {!iconOnly && <span className="btn__label">{children}</span>}
      {iconRight}
    </button>
  )
})
