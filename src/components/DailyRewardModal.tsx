import { useState } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { playSound } from '../lib/audio'

interface DailyRewardModalProps {
  onClose: () => void
  onClaim: (day: number, rewardAmount: number) => void
  currentStreak: number
}

export function DailyRewardModal({ onClose, onClaim, currentStreak }: DailyRewardModalProps) {
  const [claimed, setClaimed] = useState(false)
  
  const REWARDS = [
    { day: 1, amount: 10 },
    { day: 2, amount: 20 },
    { day: 3, amount: 30 },
    { day: 4, amount: 50 },
    { day: 5, amount: 100 },
    { day: 6, amount: 200 },
    { day: 7, amount: 500 },
  ]

  const todayIndex = Math.min(currentStreak, 6)
  const currentReward = REWARDS[todayIndex]

  const handleClaim = () => {
    playSound('win')
    setClaimed(true)
    setTimeout(() => {
      onClaim(todayIndex + 1, currentReward.amount)
    }, 2500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      {claimed && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(0.83deg, #2D9842 -131.45%, #62B271 -73.88%, #FFFFFF 99.29%)',
          borderRadius: 12, padding: '40px 24px', maxWidth: 695, width: '100%',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}
      >
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#6A7380' }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: '#000000', fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>
            Daily Login reward
          </h2>
          <p style={{ color: '#575D66', fontSize: 16, fontFamily: 'Sora, sans-serif' }}>
            Come back every day to earn more daanik coins
          </p>
        </div>

        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap'
        }}>
          {REWARDS.slice(0, 4).map((r, i) => (
            <RewardBox key={r.day} reward={r} isToday={i === todayIndex} isPast={i < todayIndex} />
          ))}
        </div>
        <div style={{ 
          display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40, flexWrap: 'wrap'
        }}>
          {REWARDS.slice(4).map((r, i) => (
            <RewardBox key={r.day} reward={r} isToday={i + 4 === todayIndex} isPast={i + 4 < todayIndex} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {!claimed ? (
            <button 
              onClick={handleClaim} 
              style={{ 
                width: 322, height: 59,
                background: 'linear-gradient(180deg, #001733 0%, #163E6F 100%)',
                color: '#66D575',
                fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 600,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Claim {currentReward.amount}DC
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{ 
                width: 322, height: 59,
                background: 'linear-gradient(180deg, #66D575 0%, #09BC83 100%)',
                color: '#001733',
                fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700,
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✓ Claimed!
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function RewardBox({ reward, isToday, isPast }: { reward: any, isToday: boolean, isPast: boolean }) {
  const bg = isToday ? '#FEF18B' : isPast ? '#DCFD9C' : '#FFFFFF'
  const border = isToday ? '1px solid #DDB668' : isPast ? '1px solid #66D575' : 'none'
  const opacity = isPast ? 0.67 : 1
  const shadow = isToday ? '0px 0px 4px rgba(0, 0, 0, 0.25), 0px 0px 13.6px rgba(0, 0, 0, 0.29)' : '0px 0px 4px rgba(0, 0, 0, 0.25)'
  
  const width = isToday ? 142 : 127
  const height = isToday ? 164 : 147

  return (
    <div style={{
      background: bg, border: border, borderRadius: 12,
      width: width, height: height,
      padding: '16px 8px', textAlign: 'center',
      position: 'relative', 
      boxShadow: shadow,
      opacity: opacity,
      transition: 'all 0.3s', zIndex: isToday ? 2 : 1,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#575D66' }}>
        DAY {reward.day}
      </div>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%' }}>
        {renderCoins(reward.day, isPast)}
        
        {isPast && (
          <div style={{ 
            position: 'absolute', bottom: -10, right: 0, 
            width: 28, height: 28, borderRadius: '50%', background: '#66D575',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 'bold', zIndex: 10,
          }}>
            ✓
          </div>
        )}
      </div>

      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 20, fontWeight: 600, color: '#575D66' }}>
        {reward.amount} DC
      </div>
    </div>
  )
}

function renderCoins(day: number, isPast: boolean) {
  const isBag = day >= 4;
  
  const src = isBag ? "/avatars/coins bag.webp" : "/avatars/coins.webp";
  const size = isBag ? 65 + (day - 3) * 5 : 55 + (day * 5); // Size increases slightly per day
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <img 
        src={src} 
        style={{ 
          height: size, 
          width: size, 
          objectFit: 'contain',
          filter: isPast ? 'grayscale(100%) opacity(70%)' : 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))'
        }} 
        alt={`reward-${day}`}
      />
    </div>
  )
}
