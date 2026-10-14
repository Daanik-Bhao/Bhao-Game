import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useBackButton } from '../../hooks/useBackButton'
import { Gullu, type GulluMood } from '../mascot/Gullu'
import { useEscape, useFocusTrap, useOverlayBlocker } from './overlay'
import './ui.css'

export interface ModalProps {
  open: boolean
  /** Backdrop tap, Esc and Android back call this (omit for a modal that must be answered) */
  onClose?: () => void
  title: ReactNode
  /** Short body text (muted) */
  body?: ReactNode
  /** Extra content between body and actions */
  children?: ReactNode
  /** Buttons: primary first (stacked on phones, side by side ≥ 600px) */
  actions?: ReactNode
  gullu?: GulluMood
  gulluSize?: number
  className?: string
}

/** Centred dialog (spec §D.6): max-width 420, paper, radius 28, padding 24. */
export function Modal(props: ModalProps) {
  return createPortal(
    <AnimatePresence>{props.open && <ModalInner key="modal" {...props} />}</AnimatePresence>,
    document.body,
  )
}

function ModalInner({ onClose, title, body, children, actions, gullu, gulluSize = 88, className = '' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const bodyId = useId()
  const close = () => onClose?.()
  useFocusTrap(ref, true)
  useEscape(close, !!onClose)
  useBackButton(() => { close() }, true)
  useOverlayBlocker(true)

  return (
    <div className="modal-wrap">
      <motion.div
        className="ui-backdrop"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={body ? bodyId : undefined}
        tabIndex={-1}
        className={`modal paper ${className}`.trim()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
        transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
      >
        {gullu && <Gullu mood={gullu} size={gulluSize} className="modal__gullu" />}
        <h2 id={titleId} className="modal__title">{title}</h2>
        {body && <div id={bodyId} className="modal__body">{body}</div>}
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </motion.div>
    </div>
  )
}
