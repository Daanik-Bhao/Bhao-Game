import { useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useBackButton } from '../../hooks/useBackButton'
import { SIDE_PANEL_QUERY, useEscape, useFocusTrap, useMediaQuery, useOverlayBlocker } from './overlay'
import './ui.css'

export interface SheetProps {
  open: boolean
  onClose: () => void
  /** Visible title (also the dialog's accessible name) */
  title?: ReactNode
  /** Keep the title for screen readers only */
  titleHidden?: boolean
  /** Custom header content shown left of the close button (replaces the title text visually) */
  header?: ReactNode
  /** Sticky footer slot (CTA) */
  footer?: ReactNode
  children?: ReactNode
  /** 'auto' = bottom sheet on phone portrait, right side panel on phone landscape / desktop */
  placement?: 'auto' | 'bottom' | 'side'
  className?: string
  bodyClassName?: string
  /** Accessible name when no visible title is given */
  ariaLabel?: string
  /** Hide the close (X) button (rare: a blocking step) */
  hideClose?: boolean
}

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 40 }

/**
 * Bottom sheet / side panel (spec §D.5). Paper scope, radius 28, grab handle, inner scroll,
 * sticky footer. Closes on X, backdrop tap, swipe-down > 80px, Android back and Esc.
 * Focus is trapped while open and returns to the opener.
 */
export function Sheet(props: SheetProps) {
  // Mount the inner component only while open so hooks (focus trap, back button) are scoped to it.
  return createPortal(
    <AnimatePresence>{props.open && <SheetInner key="sheet" {...props} />}</AnimatePresence>,
    document.body,
  )
}

function SheetInner({ onClose, title, titleHidden, header, footer, children, placement = 'auto', className = '', bodyClassName = '', ariaLabel, hideClose }: SheetProps) {
  const { t } = useTranslation()
  const sidePref = useMediaQuery(SIDE_PANEL_QUERY)
  const side = placement === 'side' || (placement === 'auto' && sidePref)
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const drag = useDragControls()

  useFocusTrap(ref, true)
  useEscape(onClose, true)
  useBackButton(() => { onClose() }, true)
  useOverlayBlocker(true)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 600) onClose()
  }

  const motionProps = side
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%', transition: { duration: 0.15 } } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%', transition: { duration: 0.15 } } }

  return (
    <>
      <motion.div
        className="ui-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={`sheet paper ${side ? 'sheet--side' : 'sheet--bottom'} ${className}`.trim()}
        transition={SPRING}
        drag={side ? false : 'y'}
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        {...motionProps}
      >
        <div className="sheet__grab-zone" onPointerDown={e => { if (!side && !(e.target as HTMLElement).closest('button, a, input')) drag.start(e) }}>
          <div className="sheet__grab" aria-hidden="true" />
          <div className="sheet__head">
            {header ?? null}
            {title && <h2 id={titleId} className={`sheet__title${titleHidden || header ? ' is-hidden' : ''}`}>{title}</h2>}
            {!hideClose && (
              <button type="button" className="btn btn--outline btn--icon btn--s sheet__close" onClick={onClose} aria-label={t('common.close')}>
                <X size={22} strokeWidth={2.25} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className={`sheet__body ${bodyClassName}`.trim()}>{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </motion.div>
    </>
  )
}
