import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { StepTarget } from './steps'
import { ProgressDots } from './ProgressDots'
import './tutorial.css'

interface Box { top: number; left: number; width: number; height: number }

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

/** Find what to spotlight. A hand card is matched by its position in your hand. */
function resolveTarget(target: StepTarget, handIds: string[]): { box: Box | null; el: Element | null } {
  if (!target) return { box: null, el: null }
  if ('card' in target) {
    const i = handIds.indexOf(target.card)
    const cards = Array.from(document.querySelectorAll('.econ-hand-card')).filter(el => el.getBoundingClientRect().width > 1)
    const el = i >= 0 ? cards[i] ?? null : null
    const rects: DOMRect[] = []
    const r = visibleRect(el)
    if (r) rects.push(r)
    // Once the card is selected, the Play / Equip button belongs to the same move
    const bar = document.querySelector('.econ-actions')
    if (r && bar && bar.querySelector('button')) {
      const br = visibleRect(bar)
      if (br) rects.push(br)
    }
    return { box: union(rects), el }
  }
  for (const sel of target.selectors) {
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const r = visibleRect(el)
      if (r) return { box: union([r]), el }
    }
  }
  return { box: null, el: null }
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

const PAD = 6
const MARGIN = 12

export function CoachMark({ stepKey, kind, title, body, todo, target, handIds, lesson, lessons, notice, onNext, onSkip }: CoachMarkProps) {
  const { t } = useTranslation()
  const [box, setBox] = useState<Box | null>(null)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const bubbleRef = useRef<HTMLDivElement>(null)
  const [bubbleSize, setBubbleSize] = useState({ w: 360, h: 180 })
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
        try { el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }) } catch { /* old browsers */ }
      }
      setBox(prev => (sameBox(prev, next) ? prev : next))
      setVp(prev => (prev.w === window.innerWidth && prev.h === window.innerHeight ? prev : { w: window.innerWidth, h: window.innerHeight }))
    }
    measure()
    const id = window.setInterval(measure, 150)
    window.addEventListener('resize', measure)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('resize', measure)
    }
  }, [stepKey])

  useLayoutEffect(() => {
    const el = bubbleRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setBubbleSize(prev => (Math.abs(prev.w - r.width) < 1 && Math.abs(prev.h - r.height) < 1 ? prev : { w: r.width, h: r.height }))
  })

  const spot = box ? { top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 } : null
  // Cards sit in a row: put the tip above/below so it never hides the neighbours
  const pos = placeBubble(spot, bubbleSize, vp, !!target && 'card' in target)

  return (
    <div className={`tut-layer tut-${kind}`} role="dialog" aria-live="polite" aria-label={title}>
      {kind === 'next' && <div className="tut-blocker" onClick={e => e.stopPropagation()} />}
      {spot ? (
        <div className="tut-spot" style={spot} />
      ) : (
        kind !== 'wait' && <div className="tut-dim" />
      )}
      <div ref={bubbleRef} className="tut-bubble" style={{ top: pos.top, left: pos.left, width: pos.width }}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="tut-bubble-head">
            <ProgressDots current={lesson} total={lessons} />
            <button type="button" className="tut-skip" onClick={onSkip}>{t('tutorial.skip')}</button>
          </div>
          <div className="tut-title">{title}</div>
          <p className="tut-body">{body}</p>
          {notice && <div className="tut-notice" role="alert">{notice}</div>}
          {kind === 'next' && (
            <div className="tut-actions">
              <button type="button" className="tut-btn tut-btn-primary" onClick={onNext} autoFocus>{t('tutorial.next')} →</button>
            </div>
          )}
          {kind === 'action' && todo && <div className="tut-todo"><span aria-hidden>👆</span> {todo}</div>}
          {kind === 'wait' && <div className="tut-wait"><span className="tut-spinner" aria-hidden /> {t('tutorial.watching')}</div>}
        </motion.div>
      </div>
    </div>
  )
}

/** Put the bubble next to the spotlight: beside it on wide screens, above/below on phones. */
function placeBubble(spot: Box | null, size: { w: number; h: number }, vp: { w: number; h: number }, vertical = false): { top: number; left: number; width: number } {
  const narrow = vp.w < 700
  const width = narrow ? vp.w - MARGIN * 2 : Math.min(400, vp.w - MARGIN * 2)
  const h = size.h
  const clampTop = (t: number) => Math.max(MARGIN, Math.min(vp.h - h - MARGIN, t))
  const clampLeft = (l: number) => Math.max(MARGIN, Math.min(vp.w - width - MARGIN, l))
  if (!spot) return { top: clampTop(vp.h - h - 24), left: clampLeft((vp.w - width) / 2), width }

  if (!narrow && !vertical) {
    const midY = spot.top + spot.height / 2 - h / 2
    if (spot.left + spot.width + 16 + width <= vp.w - MARGIN) return { top: clampTop(midY), left: spot.left + spot.width + 16, width }
    if (spot.left - 16 - width >= MARGIN) return { top: clampTop(midY), left: spot.left - 16 - width, width }
  }
  const above = spot.top - MARGIN
  const below = vp.h - (spot.top + spot.height) - MARGIN
  const left = narrow ? MARGIN : clampLeft(spot.left + spot.width / 2 - width / 2)
  if (below >= h + 8 && (below >= above || above < h + 8)) return { top: spot.top + spot.height + 10, left, width }
  if (above >= h + 8) return { top: spot.top - h - 10, left, width }
  // Neither side fits: use the roomier edge of the screen (may overlap the spotlight's edge)
  return { top: below >= above ? vp.h - h - MARGIN : MARGIN, left, width }
}
