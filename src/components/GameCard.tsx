import { motion } from 'framer-motion'
import type { GameCard as GameCardType } from '../types/game'
import { useTranslation } from 'react-i18next'

interface GameCardProps {
  card: GameCardType
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  compact?: boolean
  faceDown?: boolean
}

const TIER_STYLE: Record<GameCardType['tier'], { bg: string; fg: string }> = {
  common: { bg: 'linear-gradient(180deg, #e5e7eb, #9ca3af)', fg: '#1f2937' },
  rare: { bg: 'linear-gradient(180deg, #93c5fd, #2563eb)', fg: '#fff' },
  epic: { bg: 'linear-gradient(180deg, #d8b4fe, #7c3aed)', fg: '#fff' },
  legendary: { bg: 'linear-gradient(180deg, #fde68a, #d97706)', fg: '#3b2300' },
}

// All card types now use the clean green.png background (no placeholder text).
// The card name and description are placed in the empty areas of the image.

export function GameCard({ card, onClick, selected, disabled, compact, faceDown }: GameCardProps) {
  const { t, i18n } = useTranslation()

  if (faceDown) {
    // Face-down: show the back of the card
    const backImg = card.type === 'decision' ? 'green cards.webp'
      : card.type === 'defense' ? 'blue cards.webp'
      : card.type === 'action' ? 'red cards.webp'
      : 'green cards.webp'
    
    // Blue/red are sprite sheets, just show the first (common) variant for face-down
    const isSpriteSheet = card.type === 'action' || card.type === 'defense'
    
    return (
      <div style={{ 
        width: compact ? 120 : 220, 
        height: compact ? 160 : 320, 
        background: `url('/avatars/${backImg}') ${isSpriteSheet ? '0% 0%/400% auto' : 'center/cover'} no-repeat`,
        borderRadius: 16, 
      }} />
    )
  }

  const title = i18n.language === 'hi' 
    ? (card.shortNameHi || card.nameHi || card.shortName || card.name) 
    : (card.shortName || card.name);
  
  const flavor = i18n.language === 'hi' 
    ? (card.shortFlavorHi || card.flavorHi || card.shortFlavor || card.flavor) 
    : (card.shortFlavor || card.flavor);

  const cardW = compact ? 140 : 220
  const cardH = compact ? 200 : 320

  const frontImg = card.type === 'action' ? 'red.webp'
    : card.type === 'defense' ? 'blue.webp'
    : 'green.webp';

  return (
    <motion.button
      layoutId={card.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled ? { scale: 1.05, y: -5 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={!disabled ? onClick : undefined}
      style={{
        width: cardW,
        height: cardH,
        // Use the appropriate background for the card type
        background: `url('/avatars/${frontImg}') center/cover no-repeat`,
        borderRadius: 16,
        border: 'none',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#fff',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        boxShadow: selected ? '0 0 20px #66D575' : '0 8px 16px rgba(0,0,0,0.4)',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      {/* The card art has a tier ribbon baked in ("LEGENDARY" / "COMMON"); cover it with the real tier. */}
      <div style={{
        position: 'absolute',
        top: compact ? '2.2%' : '2.4%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '50%',
        height: compact ? '6.5%' : '6.5%',
        borderRadius: 4,
        background: TIER_STYLE[card.tier].bg,
        color: TIER_STYLE[card.tier].fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: compact ? 8 : 11,
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        zIndex: 3,
        boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
      }}>
        {t(`card.tier.${card.tier}`)}
      </div>

      {/* 
        Card name — placed in the empty area between the wallet icon and the OPPORTUNITY tag.
        The green.png background has this area clean/empty for us to put text.
      */}
      <div style={{
        position: 'absolute',
        top: compact ? '32%' : '38%',
        left: '8%',
        right: '8%',
        textAlign: 'center',
        zIndex: 2,
      }}>
        <h3 style={{ 
          fontSize: compact ? 14 : 22, 
          fontWeight: 900, 
          textAlign: 'center', 
          lineHeight: 1.1, 
          fontFamily: 'Avengenz, sans-serif', 
          margin: 0,
          color: '#fff',
          textShadow: '0 2px 6px rgba(0,0,0,0.8)',
          letterSpacing: '0.5px',
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden'
        }}>
          {title}
        </h3>
      </div>

      {/* 
        Card description — placed inside the empty description box at the bottom.
        The green.png has an empty bordered box here for description text.
      */}
      {compact ? (
        <div style={{
          position: 'absolute',
          bottom: '9%',
          left: '12%',
          right: '12%',
          height: '20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <p style={{
            fontSize: 9.5,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.92)',
            textAlign: 'center',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}>
            {flavor}
          </p>
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '10%',
          right: '10%',
          height: '24%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          zIndex: 2,
        }}>
          <p style={{ 
            fontSize: 12, 
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)', 
            textAlign: 'center', 
            lineHeight: 1.25,
            display: '-webkit-box', 
            WebkitLineClamp: 4, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden', 
            margin: 0 
          }}>
            {flavor}
          </p>
        </div>
      )}
    </motion.button>
  )
}
