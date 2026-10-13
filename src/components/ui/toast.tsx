import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { useOpenOverlayCount } from './overlay'
import './ui.css'

export type ToastTone = 'info' | 'gain' | 'loss' | 'success'
export interface ToastOptions {
  tone?: ToastTone
  /** Custom leading icon (lucide element) */
  icon?: ReactNode
  /** ms, default 3000 */
  duration?: number
}
interface ToastItem extends ToastOptions { id: number; message: ReactNode }

/** 'top' = below the match top bar; 'bottom' = above the tab bar (menus); 'bottom-plain' = no tab bar */
export type ToastPlacement = 'top' | 'bottom' | 'bottom-plain'

interface ToastApi {
  show: (message: ReactNode, opts?: ToastOptions) => void
  clear: () => void
}
interface ToastCtx extends ToastApi { pushPlacement: (p: ToastPlacement) => () => void }

const Ctx = createContext<ToastCtx | null>(null)
const MAX_QUEUED = 3

/**
 * Toast queue (spec §D.7): one at a time, FIFO, at most 3 waiting (older ones dropped),
 * 3 s each, and never on top of an open sheet / modal / outcome banner — the queue
 * pauses while one is open.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastItem | null>(null)
  const [queue, setQueue] = useState<ToastItem[]>([])
  const [placements, setPlacements] = useState<ToastPlacement[]>([])
  const idRef = useRef(0)
  const blocked = useOpenOverlayCount() > 0

  const show = useCallback((message: ReactNode, opts: ToastOptions = {}) => {
    idRef.current += 1
    const item: ToastItem = { id: idRef.current, message, ...opts }
    setQueue(q => {
      const next = [...q, item]
      return next.length > MAX_QUEUED ? next.slice(next.length - MAX_QUEUED) : next
    })
  }, [])
  const clear = useCallback(() => { setQueue([]); setCurrent(null) }, [])

  // Promote the next toast when nothing is showing and no overlay blocks the screen.
  useEffect(() => {
    if (current || blocked || queue.length === 0) return
    setCurrent(queue[0])
    setQueue(q => q.slice(1))
  }, [current, blocked, queue])

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(() => setCurrent(null), current.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [current])

  // An overlay opening takes the visible toast off screen; it goes back to the front of the queue.
  const currentRef = useRef(current)
  currentRef.current = current
  useEffect(() => {
    if (!blocked || !currentRef.current) return
    const c = currentRef.current
    setCurrent(null)
    setQueue(q => [c, ...q].slice(0, MAX_QUEUED))
  }, [blocked])

  const pushPlacement = useCallback((p: ToastPlacement) => {
    setPlacements(list => [...list, p])
    return () => setPlacements(list => {
      const i = list.lastIndexOf(p)
      return i < 0 ? list : [...list.slice(0, i), ...list.slice(i + 1)]
    })
  }, [])

  const placement = placements[placements.length - 1] ?? 'bottom-plain'
  const value = useMemo(() => ({ show, clear, pushPlacement }), [show, clear, pushPlacement])

  const icon = current?.icon ?? (current?.tone === 'gain' ? <TrendingUp size={18} aria-hidden="true" />
    : current?.tone === 'loss' ? <TrendingDown size={18} aria-hidden="true" />
    : current?.tone === 'success' ? <Check size={18} aria-hidden="true" />
    : <Info size={18} aria-hidden="true" />)

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        className={`toast-region ${placement === 'top' ? 'toast-region--top' : placement === 'bottom' ? 'toast-region--bottom' : 'toast-region--bottom is-no-tabbar'}`}
        role="status"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              className={`toast toast--${current.tone ?? 'info'}`}
              initial={{ opacity: 0, y: placement === 'top' ? -12 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
              onClick={() => setCurrent(null)}
            >
              {icon}
              <span>{current.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

const NOOP: ToastApi = { show: () => {}, clear: () => {} }

/** `const toast = useToast(); toast.show(t('…'), { tone: 'gain' })`. No-op outside the provider. */
export function useToast(): ToastApi {
  const ctx = useContext(Ctx)
  return useMemo(() => (ctx ? { show: ctx.show, clear: ctx.clear } : NOOP), [ctx])
}

/** Where toasts appear while the calling screen is mounted (match: 'top'; menus with a tab bar: 'bottom'). */
export function useToastPlacement(p: ToastPlacement) {
  const ctx = useContext(Ctx)
  const push = ctx?.pushPlacement
  useEffect(() => (push ? push(p) : undefined), [push, p])
}
