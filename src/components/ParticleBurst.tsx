import { motion } from 'framer-motion'

interface ParticleBurstProps {
  diff: number;
}

export function ParticleBurst({ diff }: ParticleBurstProps) {
  const isPositive = diff > 0
  const color = isPositive ? '#4ade80' : '#f87171' // Green for gain, Red for loss
  
  // Generate 16 particles in a circle with slight randomness
  const particles = Array.from({ length: 16 }).map((_, i) => {
    const baseAngle = (i / 16) * Math.PI * 2
    const angle = baseAngle + (Math.random() - 0.5) * 0.2
    const speed = Math.random() * 50 + 30
    return {
      id: i,
      angle,
      speed,
      size: Math.random() * 4 + 4,
    }
  })

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 100 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: Math.cos(p.angle) * p.speed, 
            y: Math.sin(p.angle) * p.speed,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.6 + Math.random() * 0.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 10px ${color}`,
            marginLeft: -p.size / 2, // center
            marginTop: -p.size / 2, // center
          }}
        />
      ))}
    </div>
  )
}
