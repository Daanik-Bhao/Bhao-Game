import { useState, useEffect } from 'react'
import { ScrollText, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BASE_CARDS, ACTION_CARDS, LEGENDARY_CARDS } from '../../data/cards'
import { LEVEL_SITUATION_CARDS } from '../../data/levelCards'

const cardTranslationMap: Record<string, string> = {}
;[...BASE_CARDS, ...ACTION_CARDS, ...LEGENDARY_CARDS, ...LEVEL_SITUATION_CARDS].forEach(c => {
  if (c.nameHi) cardTranslationMap[c.name] = c.nameHi
})

function translateLogEntry(text: string, lang: string) {
  if (lang !== 'hi') return text
  
  let translated = text

  // Common phrases
  translated = translated.replace('Game started! First to', 'गेम शुरू! लक्ष्य है')
  translated = translated.replace('wins.', 'बनाना।')
  translated = translated.replace('Deck reshuffled.', 'डेक फिर से मिलाया गया।')
  translated = translated.replace('Fresh deck created.', 'नया डेक तैयार।')
  translated = translated.replace('played', 'ने इस्तेमाल किया')
  translated = translated.replace('is skipping their turn.', 'ने अपनी बारी छोड़ दी।')
  translated = translated.replace('took too long! Turn skipped.', 'का समय खत्म! बारी छूट गई।')
  translated = translated.replace('defended with', 'ने बचाव किया: ')
  translated = translated.replace('Auto-Defended!', 'स्वतः बचाव!')
  translated = translated.replace('Investment Failed!', 'निवेश विफल!')
  translated = translated.replace('Season Boost!', 'सीज़न बूस्ट!')
  translated = translated.replace('Level Complete! Reached', 'लेवल पूरा! हासिल किया')
  translated = translated.replace('in time.', 'समय पर।')
  translated = translated.replace('Turn limit reached! You failed to reach the goal.', 'बारी की सीमा खत्म! आप लक्ष्य तक नहीं पहुँच पाए।')
  translated = translated.replace('reached', 'ने हासिल किया')
  translated = translated.replace('and WINS!', 'और जीत हासिल की!')
  translated = translated.replace('Everyone else forfeited!', 'बाकी सभी ने गेम छोड़ दिया!')
  translated = translated.replace('affects all!', 'सब पर असर!')

  translated = translated.replace('SPEND', 'खर्च')
  translated = translated.replace('SAVE', 'बचत')
  translated = translated.replace('INVEST', 'निवेश')

  // Translate cards
  for (const [en, hi] of Object.entries(cardTranslationMap)) {
    if (translated.includes(en)) {
      translated = translated.replace(en, hi)
    }
  }

  return translated
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("")
  
  useEffect(() => {
    if (typeof text !== 'string') return;
    let index = 0
    setDisplayed("")
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, index + 1))
      index++
      if (index >= text.length) clearInterval(interval)
    }, 20) // 20ms per character for a fast typewriter effect
    
    return () => clearInterval(interval)
  }, [text])
  
  return <>{displayed}</>
}

function parseLogEntry(entry: string) {
  let mainText = entry
  let amountStr = ''
  let isGain = false
  let isLoss = false

  // Match something like (+₹30,000) or (-₹10,000)
  const match = entry.match(/\(([+-]?₹[0-9,.]+L?)\)/)
  if (match) {
    amountStr = match[1]
    mainText = entry.replace(match[0], '').trim()
    if (amountStr.startsWith('+')) isGain = true
    if (amountStr.startsWith('-')) isLoss = true
  }

  return { mainText, amountStr, isGain, isLoss }
}

interface GameLogProps {
  log: string[]
  mobileCompact?: boolean
  playerName?: string
}

export function GameLog({ log, mobileCompact }: GameLogProps) {
  const { t, i18n } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(!mobileCompact)
  const itemsToShow = (!mobileCompact || isExpanded) ? 10 : 3

  return (
    <div style={{
      background: '#0B1020',
      borderRadius: 20,
      padding: '24px',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ScrollText size={20} color="#FFD700" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#FFD700', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            {t('game.gameLog')}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'var(--green-primary)',
            color: 'white',
            width: 28, height: 28,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            border: '2px solid rgba(255,215,0,0.5)'
          }}>
            {log.length}
          </div>
          <div className="mobile-only" style={{ color: 'rgba(255,255,255,0.5)', display: mobileCompact ? 'block' : 'none' }}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      <div className={`game-log-content ${isExpanded ? 'expanded' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingRight: 4, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        {log.length === 0 ? (
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', padding: '16px 0' }}>
            {i18n.language === 'hi' ? 'गेम शुरू हुआ। पहली चाल का इंतज़ार...' : 'Game started. Waiting for first move...'}
          </div>
        ) : (
          log.slice(0, itemsToShow).map((entry, idx) => {
            const translated = translateLogEntry(entry, i18n.language)
            const { mainText, amountStr, isGain, isLoss } = parseLogEntry(translated)
            
            // Choose Icon & Colors based on action type
            let IconComponent = Zap
            let iconBg = 'rgba(255,215,0,0.1)'
            let iconColor = '#FFD700'
            
            if (isGain) {
              IconComponent = ArrowUpRight
              iconBg = 'rgba(16,185,129,0.15)'
              iconColor = '#10B981'
            } else if (isLoss) {
              IconComponent = ArrowDownRight
              iconBg = 'rgba(239,68,68,0.15)'
              iconColor = '#EF4444'
            }

            return (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                padding: '16px 0', 
                borderBottom: idx === (Math.min(log.length, itemsToShow) - 1) ? 'none' : '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComponent size={18} color={iconColor} strokeWidth={3} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
                    {idx === 0 ? <TypewriterText text={mainText} /> : mainText}
                  </div>
                </div>

                {amountStr && (
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    color: isGain ? '#10B981' : isLoss ? '#EF4444' : '#FFD700',
                    whiteSpace: 'nowrap',
                    marginLeft: 8,
                    textAlign: 'right'
                  }}>
                    {amountStr}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {mobileCompact && !isExpanded && log.length > itemsToShow && (
        <button 
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,215,0,0.4)',
            color: '#FFD700',
            borderRadius: 20,
            padding: '12px',
            fontSize: 14,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 8,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            width: '100%'
          }}
        >
          View Full Log <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  )
}
