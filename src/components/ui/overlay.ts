import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

/* ---------------------------------------------------------------------------
   Overlay registry: sheets, modals and the outcome banner register while open,
   so toasts can wait until nothing covers the screen (spec §D.7).
   --------------------------------------------------------------------------- */
let openOverlays = 0
const listeners = new Set<() => void>()
function emit() { listeners.forEach(l => l()) }

export const overlayStore = {
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l) } },
  getSnapshot() { return openOverlays },
}

/** Marks a blocking overlay as open while `open` is true. */
export function useOverlayBlocker(open: boolean) {
  useEffect(() => {
    if (!open) return
    openOverlays += 1
    emit()
    return () => { openOverlays -= 1; emit() }
  }, [open])
}

export function useOpenOverlayCount() {
  return useSyncExternalStore(overlayStore.subscribe, overlayStore.getSnapshot, overlayStore.getSnapshot)
}

/* ---------------------------------------------------------------------------
   Media queries
   --------------------------------------------------------------------------- */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [query])
  return matches
}

/** Phone landscape (height < 500) or desktop (≥ 1024 wide): sheets become a right side panel. */
export const SIDE_PANEL_QUERY = '(max-height: 499px), (min-width: 1024px)'

/* ---------------------------------------------------------------------------
   Focus trap: focus moves into `ref` when active, Tab cycles inside it, and
   focus returns to the previously focused element (the opener) afterwards.
   --------------------------------------------------------------------------- */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean) {
  const openerRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!active) return
    openerRef.current = document.activeElement as HTMLElement | null
    const node = ref.current
    const focusFirst = () => {
      const el = ref.current
      if (!el) return
      const auto = el.querySelector<HTMLElement>('[data-autofocus]')
      ;(auto ?? el).focus({ preventScroll: true })
    }
    const raf = requestAnimationFrame(focusFirst)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !ref.current) return
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null)
      if (items.length === 0) { e.preventDefault(); return }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      const opener = openerRef.current
      // Return focus to the opener if it is still in the page.
      if (opener && document.contains(opener) && (!node || !node.contains(opener))) opener.focus({ preventScroll: true })
    }
  }, [active, ref])
}

/* Esc closes the most recently opened overlay only. */
const escStack: { current: () => void }[] = []
let escListening = false
function onEscKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || escStack.length === 0) return
  e.stopPropagation()
  escStack[escStack.length - 1].current()
}

export function useEscape(handler: () => void, active: boolean) {
  const h = useRef(handler)
  h.current = handler
  useEffect(() => {
    if (!active) return
    const entry = h
    escStack.push(entry)
    if (!escListening) { document.addEventListener('keydown', onEscKey); escListening = true }
    return () => {
      const i = escStack.lastIndexOf(entry)
      if (i >= 0) escStack.splice(i, 1)
      if (escStack.length === 0 && escListening) { document.removeEventListener('keydown', onEscKey); escListening = false }
    }
  }, [active])
}
