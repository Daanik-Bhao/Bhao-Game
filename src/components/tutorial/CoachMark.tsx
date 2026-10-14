import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Hand } from 'lucide-react'
import type { StepTarget } from './steps'
import { ProgressDots } from './ProgressDots'
import { Button } from '../ui'
import { Gullu } from '../mascot/Gullu'
import './tutorial.css'

export interface Box { top: number; left: number; width: number; height: number }
export type Side = 'above' | 'below' | 'right' | 'left' | 'none'

function visibleRect(el: Element | null): DOMRect | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  if (r.bottom < 0 || r.right < 0 || r.top > window.innerHeight || r.left > window.innerWidth) return null
  return r
}

function union(rects: DOMRect[]): Box | null {
  if (!rects.length) return null
  const top = Math.min(...rects.map(r => r.top))
  const left = Math.min(...rects.map(r => r.left))
  const bottom = Math.max(...rects.map(r => r.bottom))
  const right = Math.max(...rects.map(r => r.right))
  return { top, left, width: right - left, height: bottom - top }
}

/** Hand cards in hand order (board data attribute, with the old class as a fallback). */
const HAND_CARD_SELECTORS = ['[data-tour="hand-card"]', '.econ-hand-card']

/** Find what to spotlight. A hand card is matched by its position in your hand. */
function resolveTarget(target: StepTarget, handIds: string[]): { box: Box | null; el: Element | null } {
  if (!target) return { box: null, el: null }
  if ('card' in target) {
    // Once the card's sheet is open, point at the sheet's control instead of the hidden card
    for (const sel of target.preferSelectors ?? []) {
      for (const el of Array.from(document.querySelectorAll(sel))) {
        const r = visibleRect(el)
        if (r) return { box: union([r]), el }
      }
    }
    const i = handIds.indexOf(target.card)
    let cards: Element[] = []
    for (const sel of HAND_CARD_SELECTORS) {
      cards = Array.from(document.querySelectorAll(sel)).filter(el => el.getBoundingClientRect().width > 1)
      if (cards.length) break
    }
    const el = i >= 0 ? cards[i] ?? null : null
    const r = visibleRect(el)
    return { box: r ? union([r]) : null, el }
  }
  for (const sel of target.selectors) {
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const r = visibleRect(el)
      if (r) return { box: union([r]), el }
    }
  }
  return { box: null, el: null }
}

const sameViewport = (a: Viewport, b: Viewport) =>
  a.w === b.w && a.h === b.h && (['top', 'right', 'bottom', 'left'] as const).every(k => (a.safe?.[k] ?? 0) === (b.safe?.[k] ?? 0))

/** Safe-area insets in px, read from a fixed probe padded with env(safe-area-inset-*). */
function safeInsets(probe: HTMLElement | null): Viewport['safe'] {
  if (!probe) return undefined
  const cs = getComputedStyle(probe)
  const px = (v: string) => parseFloat(v) || 0
  return { top: px(cs.paddingTop), right: px(cs.paddingRight), bottom: px(cs.paddingBottom), left: px(cs.paddingLeft) }
}

const sameBox = (a: Box | null, b: Box | null) =>
  a === b || (!!a && !!b && Math.abs(a.top - b.top) < 1 && Math.abs(a.left - b.left) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1)

export interface CoachMarkProps {
  stepKey: string
  kind: 'next' | 'action' | 'wait'
  title: string
  body: string
  todo?: string
  target: StepTarget
  handIds: string[]
  lesson: number
  lessons: number
  notice?: string | null
  onNext: () => void
  onSkip: () => void
}

const RING = 4      // haldi ring around the target
const GAP = 14      // bubble ↔ target (room for the 12 px arrow)
const MARGIN = 12   // bubble ↔ screen edge
const MAX_W = 300

export interface Placement { side: Side; top: number; left: number; width: number; maxHeight: number; arrow: number }

/** Viewport size plus the safe-area insets (env(safe-area-inset-*)) the bubble must stay inside. */
export interface Viewport { w: number; h: number; safe?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>> }

/**
 * Bubble placement (spec §E.10): prefer above the target, else below, else beside it.
 * The bubble NEVER overlaps the target box: when no side fits the natural height, the
 * roomiest side is used and the bubble gets a max-height (it scrolls inside).
 * Pure (exported for tests).
 */
export function placeBubble(spot: Box | null, size: { w: number; h: number }, vp: Viewport): Placement {
  const safe = { top: 0, right: 0, bottom: 0, left: 0, ...vp.safe }
  // Usable area: the viewport minus the safe-area insets (notch, gesture bar) minus MARGIN.
  const minX = safe.left + MARGIN
  const maxX = vp.w - safe.right - MARGIN
  const minY = safe.top + MARGIN
  const maxY = vp.h - safe.bottom - MARGIN
  const width = Math.min(MAX_W, maxX - minX)
  const h = size.h
  if (!spot) {
    const maxHeight = maxY - minY
    return { side: 'none', top: Math.max(minY, maxY + MARGIN - Math.min(h, maxHeight) - 24), left: minX + (maxX - minX - width) / 2, width, maxHeight, arrow: 0 }
  }
  const clampX = (l: number) => Math.max(minX, Math.min(maxX - width, l))
  const clampY = (t: number, hh: number) => Math.max(minY, Math.min(maxY - hh, t))
  const cx = spot.left + spot.width / 2
  const cy = spot.top + spot.height / 2
  const room = {
    above: spot.top - GAP - minY,
    below: maxY - (spot.top + spot.height) - GAP,
    right: maxX - (spot.left + spot.width) - GAP,
    left: spot.left - GAP - minX,
  }
  const make = (side: Side, maxHeight: number): Placement => {
    const hh = Math.min(h, maxHeight)
    if (side === 'above' || side === 'below') {
      const left = clampX(cx - width / 2)
      const top = side === 'above' ? spot.top - GAP - hh : spot.top + spot.height + GAP
      return { side, top, left, width, maxHeight, arrow: Math.max(16, Math.min(width - 16, cx - left)) }
    }
    const top = clampY(cy - hh / 2, hh)
    const left = side === 'right' ? spot.left + spot.width + GAP : spot.left - GAP - width
    return { side, top, left, width, maxHeight, arrow: Math.max(16, Math.min(hh - 16, cy - top)) }
  }
  if (room.above >= h) return make('above', room.above)
  if (room.below >= h) return make('below', room.below)
  const sideH = maxY - minY
  if (room.right >= width && sideH >= h) return make('right', sideH)
  if (room.left >= width && sideH >= h) return make('left', sideH)
  // Nothing fits the natural height: take the roomiest side and scroll inside.
  const vertical = room.above >= room.below ? 'above' : 'below'
  const vRoom = Math.max(room.above, room.below)
  if (room.right >= width && sideH > vRoom) return make('right', sideH)
  if (room.left >= width && sideH > vRoom) return make('left', sideH)
  return make(vertical, Math.max(80, vRoom))
}

/** Coach mark (spec §E.10): paper bubble with Gullu, step counter, Next + Skip, arrow to the target. */
export function CoachMark({ stepKey, kind, title, body, todo, target, handIds, lesson, lessons, notice, onNext, onSkip }: CoachMarkProps) {
  const { t } = useTranslation()
  const [box, setBox] = useState<Box | null>(null)
  const [vp, setVp] = useState<Viewport>({ w: window.innerWidth, h: window.innerHeight })
  const bubbleRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const footRef = useRef<HTMLDivElement>(null)
  const probeRef = useRef<HTMLDivElement>(null)
  const [bubbleH, setBubbleH] = useState(180)
  const targetRef = useRef(target)
  targetRef.current = target
  const handRef = useRef(handIds)
  handRef.current = handIds
  const scrolledFor = useRef<string | null>(null)

  // Track the target's position (the board animates and re-lays out, so poll lightly).
  useEffect(() => {
    const measure = () => {
      const { box: next, el } = resolveTarget(targetRef.current, handRef.current)
      if (el && scrolledFor.current !== stepKey && 'card' in (targetRef.current ?? {})) {
        scrolledFor.current = stepKey
        try { el.scrollIntoView({ block: 'nearest', inline: 'center' }) } catch { /* old browsers */ }
      }
      setBox(prev => (sameBox(prev, next) ? prev : next))
      const next2 = { w: window.innerWidth, h: window.innerHeight, safe: safeInsets(probeRef.current) }
      setVp(prev => (sameViewport(prev, next2) ? prev : next2))
    }
    measure()
    const id = window.setInterval(measure, 150)
    window.addEventListener('resize', measure)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('resize', measure)
    }
  }, [stepKey])

  // Natural height of the content (independent of any max-height applied) + the action row.
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const h = el.scrollHeight + (footRef.current?.offsetHeight ?? 0) + 2 // + bubble border
    setBubbleH(prev => (Math.abs(prev - h) < 1 ? prev : h))
  })

  const spot = box ? { top: box.top - RING, left: box.left - RING, width: box.width + RING * 2, height: box.height + RING * 2 } : null
  const pos = placeBubble(spot, { w: MAX_W, h: bubbleH }, vp)
  const scrolls = bubbleH > pos.maxHeight + 1

  return (
    <div className={`tut-layer tut-${kind}`} role="dialog" aria-live="polite" aria-label={title}>
      <div ref={probeRef} className="tut-safe-probe" aria-hidden="true" />
      {kind === 'next' && <div className="tut-blocker" onClick={e => e.stopPropagation()} />}
      {spot ? <div className="tut-spot" style={spot} /> : kind !== 'wait' && <div className="tut-dim" />}
      <div
        ref={bubbleRef}
        className={`tut-bubble paper tut-bubble--${pos.side}${scrolls ? ' is-scrolling' : ''}`}
        style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight, '--arrow': `${pos.arrow}px` } as CSSProperties}
        data-side={pos.side}
      >
        <div ref={innerRef} className="tut-bubble__scroll">
          <motion.div key={stepKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="tut-bubble__inner">
            <Gullu mood={kind === 'wait' ? 'think' : 'happy'} size={48} className="tut-bubble__gullu" />
            <div className="tut-bubble__content">
              <div className="tut-bubble__head">
                <ProgressDots current={lesson} total={lessons} />
              </div>
              <p className="tut-title">{title}</p>
              <p className="tut-body">{body}</p>
              {notice && <p className="tut-notice" role="alert">{notice}</p>}
              {kind === 'action' && todo && <p className="tut-todo"><Hand size={16} aria-hidden="true" /> {todo}</p>}
              {kind === 'wait' && <p className="tut-wait"><span className="tut-spinner" aria-hidden="true" /> {t('tutorial.watching')}</p>}
            </div>
          </motion.div>
        </div>
        {/* Outside the scroll area: Next / Skip stay visible when the text has to scroll. */}
        <div ref={footRef} className="tut-actions">
          {kind === 'next' && <Button size="s" onClick={onNext} autoFocus>{t('tutorial.next')}</Button>}
          <Button variant="ghost" size="s" onClick={onSkip} className="btn--muted">{t('tutorial.skipTutorial')}</Button>
        </div>
      </div>
    </div>
  )
}
