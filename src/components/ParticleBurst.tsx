import { motion } from 'framer-motion'
import { useReducedEffects } from '../hooks/useReducedEffects'

interface ParticleBurstProps {
  /** Sign decides the colour (gain = save-on-dark, loss = attack-on-dark) */
  diff: number
  /** Number of dots (spec §B.7 medium tier: 6) */
  count?: number
}

const ANGLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

/**
 * Small particle dots that fly out of a point (spec §B.7 feedback tiers). Deterministic
 * angles (no randomness in render), never rendered with reduced effects.
 */
export function ParticleBurst({ diff, count = 6 }: ParticleBurstProps) {
  const { reduced } = useReducedEffects()
  if (reduced) return null
  const tone = diff >= 0 ? 'gain' : 'loss'
  return (
    <span className={`particles particles--${tone}`} aria-hidden="true">
      {ANGLES.slice(0, count).map(i => {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2
        const dist = 26 + (i % 2) * 10
        return (
          <motion.i
            key={i}
            className="particles__dot"
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 12, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.7, ease: [0.05, 0.7, 0.1, 1] }}
          />
        )
      })}
    </span>
  )
}
