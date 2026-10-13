import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './ui.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  /** Helper text under the field */
  hint?: ReactNode
  /** Error text: red border + message, aria-invalid */
  error?: ReactNode
  /** Room-code style: Baloo 20px, wide tracking, uppercase */
  code?: boolean
  /** Extra class on the wrapper */
  fieldClassName?: string
}

/** Text input (spec §D.2): 48px, 16px text (no iOS zoom), label above, hint/error below. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, code, id, className = '', fieldClassName = '', ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? `in-${autoId}`
  const hintId = `${inputId}-hint`
  const describedBy = error || hint ? hintId : undefined
  const codeProps = code ? { autoCapitalize: 'characters', autoCorrect: 'off', spellCheck: false, inputMode: 'text' as const } : {}
  return (
    <div className={`field ${fieldClassName}`.trim()}>
      {label && <label className="field__label" htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={`field__input${code ? ' field__input--code' : ''} ${className}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...codeProps}
        {...rest}
      />
      {error ? <span id={hintId} className="field__hint field__hint--error">{error}</span>
        : hint ? <span id={hintId} className="field__hint">{hint}</span> : null}
    </div>
  )
})
