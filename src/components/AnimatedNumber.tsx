import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '../lib/format'
import { useReducedEffects } from '../hooks/useReducedEffects'

interface AnimatedNumberProps {
  value: number
  /** ms, default 700 (--dur-ceremony) */
  duration?: number
  formatFn?: (val: number) => string
}

/**
 * ₹ roll-up (spec §B.7): counts to the new value over 700 ms (ease-out), tabular figures so
 * nothing jitters. With reduced effects it jumps straight to the final value.
 */
export function AnimatedNumber({ value, duration = 700, formatFn = n => formatMoney(n) }: AnimatedNumberProps) {
  const { reduced } = useReducedEffects()
  const [displayValue, setDisplayValue] = useState(value)
  const displayRef = useRef(value)

  useEffect(() => {
    const start = displayRef.current
    const end = value
    if (start === end) return
    if (reduced || duration <= 0) {
      displayRef.current = end
      setDisplayValue(end)
      return
    }
    let startTime: number | null = null
    let frame = 0
    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const p = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      const current = p === 1 ? end : Math.round(start + (end - start) * ease)
      displayRef.current = current
      setDisplayValue(current)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      // A new target arrives mid-roll: continue from where we are.
    }
  }, [value, duration, reduced])

  return <>{formatFn(displayValue)}</>
}
