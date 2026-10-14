import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTurnRemaining } from './boardUtils'

interface TurnRingProps {
  turnStartTime: number
  timeLimit: number
  /** Announce 10 s / 5 s warnings (only on your own turn) */
  announce?: boolean
  className?: string
}

const R = 20
const C = 2 * Math.PI * R

/**
 * Turn timer ring (spec §D.16): 44 px, 4 px stroke, haldi; ≤ 10 s turns attack-on-dark and the
 * number pulses (opacity only — the one infinite animation allowed in a match). role="timer";
 * the live region speaks only at 10 s and 5 s.
 */
export function TurnRing({ turnStartTime, timeLimit, announce = false, className = '' }: TurnRingProps) {
  const { t } = useTranslation()
  const remaining = useTurnRemaining(turnStartTime, timeLimit)
  const secs = Math.ceil(remaining / 1000)
  const danger = remaining <= 10000
  const frac = timeLimit > 0 ? Math.max(0, Math.min(1, remaining / timeLimit)) : 0

  const [spoken, setSpoken] = useState('')
  const said = useRef<Set<number>>(new Set())
  useEffect(() => { said.current = new Set() }, [turnStartTime])
  useEffect(() => {
    if (!announce) return
    for (const mark of [10, 5]) {
      if (secs === mark && !said.current.has(mark)) {
        said.current.add(mark)
        setSpoken(t('board.timerAria', { n: mark }))
      }
    }
  }, [secs, announce, t])

  return (
    <div className={`turn-ring${danger ? ' is-danger' : ''} ${className}`.trim()} role="timer" aria-label={t('board.timerAria', { n: secs })}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="turn-ring__track" cx="22" cy="22" r={R} />
        <circle className="turn-ring__arc" cx="22" cy="22" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
      </svg>
      <b className="turn-ring__num" aria-hidden="true">{secs}</b>
      <span className="sr-only" aria-live="polite">{spoken}</span>
    </div>
  )
}
