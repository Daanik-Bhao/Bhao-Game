import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { Button } from '../ui/Button'

const FUN_FACTS = [
  "You order food 3 times a week (7,200/month).",
  "A daily ₹200 coffee costs you ₹73,000 a year.",
  "Investing ₹5,000 monthly can make you a crorepati in 20 years.",
  "Paying minimum balance on credit cards keeps you in debt longer."
]

interface ResultModalProps {
  isWinner: boolean;
  finalWealth: number;
  onPlayAgain: () => void;
  onDashboard: () => void;
}

export function ResultModal({ isWinner, finalWealth, onPlayAgain, onDashboard }: ResultModalProps) {
  // Pick random fact deterministically based on wealth
  const randomFact = FUN_FACTS[Math.floor(finalWealth % FUN_FACTS.length)]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} gravity={0.15} initialVelocityY={20} colors={['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f1f5f9']} />}
      
      <div style={{ position: 'relative' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: '100%', maxWidth: 621, height: 501,
            background: 'linear-gradient(180.64deg, #0B7F4C 0.55%, #91C650 57.12%, #FCE894 131.53%)',
            borderRadius: 24,
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{
            marginTop: 40,
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 32,
            letterSpacing: '0.09em', textTransform: 'uppercase', color: '#FFFFFF',
            textShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            {isWinner ? 'Wealth Gained' : 'Final Wealth'}
          </div>

          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 392, height: 392,
            background: 'url("/avatars/coins bag.webp") center / contain no-repeat',
            opacity: 0.2, zIndex: 1, pointerEvents: 'none'
          }} />

          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2, width: '100%'
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(60px, 8vw, 96px)',
              letterSpacing: '0.04em',
              background: 'linear-gradient(0deg, #18372E 0%, #007A54 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', color: 'transparent',
              filter: 'drop-shadow(0px 2px 4px rgba(255,255,255,0.4))'
            }}>
              {finalWealth.toLocaleString()}
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 40,
            fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 'clamp(18px, 4vw, 24px)',
            color: '#4B5563', textAlign: 'center', width: '90%',
            padding: '0 20px'
          }}>
            "{randomFact}"
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'absolute', bottom: -80, left: 0, right: 0,
            display: 'flex', gap: 16, justifyContent: 'center'
          }}
        >
          <Button variant="gold" size="lg" onClick={onPlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={onDashboard}>Dashboard</Button>
        </motion.div>
      </div>
    </div>
  )
}
