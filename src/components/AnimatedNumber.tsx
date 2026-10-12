import { useEffect, useState, useRef } from 'react'
import { formatWealth } from '../types/game'
import { Wealth } from './Wealth'

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (val: number) => string;
}

export function AnimatedNumber({ value, duration = 1000, formatFn }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const displayRef = useRef(value)
  
  useEffect(() => {
    const start = displayRef.current
    const end = value
    if (start === end) return
    
    let startTime: number | null = null
    let animationFrameId: number
    
    const tick = (now: number) => {
      if (!startTime) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // easeOutExpo for dramatic slowdown at the end
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      const current = Math.floor(start + (end - start) * ease)
      displayRef.current = current
      setDisplayValue(current)
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick)
      } else {
        setDisplayValue(end)
      }
    }
    
    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value, duration])
  
  
  return <>{formatFn === formatWealth ? <Wealth amount={displayValue} /> : formatFn ? formatFn(displayValue) : displayValue.toLocaleString('en-IN')}</>
}
