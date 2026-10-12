import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ARTHA_YATRA_LEVELS } from '../data/levels'
import type { LevelConfig } from '../types/level'
import { formatWealth } from '../types/game'
import { useAuth } from '../hooks/useAuth'
import {
  CAMPAIGN_PROGRESS_EVENT,
  getCompletedLevels,
  getLevelResults,
  getLevelStars,
  isLevelUnlocked,
  progressOwnerKey,
  syncCampaignProgress,
  totalStars,
} from '../lib/campaignProgress'
import type { LevelResults } from '../lib/campaignProgress'
import { getLevelRule } from '../lib/levelRules'
import { LevelIntro, LevelStars, RULE_ICONS } from '../components/campaign'


export function Campaign() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const ownerKey = progressOwnerKey(user?.id)

  // Progress per player: localStorage, merged up to Supabase for signed-in players (lib/campaignProgress.ts)
  const [completedLevels, setCompletedLevels] = useState<string[]>(() => getCompletedLevels(ownerKey))
  const [stars, setStars] = useState<Record<string, number>>(() => getLevelStars(ownerKey))
  const [results, setResults] = useState<LevelResults>(() => getLevelResults(ownerKey))
  const [introLevelId, setIntroLevelId] = useState<string | null>(null)

  useEffect(() => {
    const reload = () => {
      setCompletedLevels(getCompletedLevels(ownerKey))
      setStars(getLevelStars(ownerKey))
      setResults(getLevelResults(ownerKey))
    }
    reload()
    window.addEventListener(CAMPAIGN_PROGRESS_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(CAMPAIGN_PROGRESS_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [ownerKey])

  // Signed in: merge this device's progress up and the server's best down (no-op offline)
  useEffect(() => {
    if (user?.id) void syncCampaignProgress(user.id)
  }, [user?.id])

  const levelIds = ARTHA_YATRA_LEVELS.map(l => l.id)
  const unlocked = (id: string) => isLevelUnlocked(levelIds, id, stars)
  const currentLevelId = levelIds.find(id => unlocked(id) && !completedLevels.includes(id)) ?? null

  const totalLevels = ARTHA_YATRA_LEVELS.length
  const completedCount = levelIds.filter(id => completedLevels.includes(id)).length
  const starCount = totalStars(levelIds, stars)
  const progressPercentage = totalLevels > 0 ? (starCount / (totalLevels * 3)) * 100 : 0
  const introIndex = introLevelId ? levelIds.indexOf(introLevelId) : -1
  const introLevel = introIndex >= 0 ? ARTHA_YATRA_LEVELS[introIndex] : null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f0fdfa, #d1fae5)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", system-ui, sans-serif'
    }}>
      {/* Mountain Silhouettes Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg style={{ position: 'absolute', bottom: -40, left: 0, right: 0, width: '100%', height: 256, opacity: 0.2 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#10b981" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,122.7C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg style={{ position: 'absolute', bottom: -10, left: 0, right: 0, width: '100%', height: 192, opacity: 0.15 }} viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#14b8a6" d="M0,224L48,208C96,192,192,160,288,154.7C384,149,480,171,576,165.3C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', fontSize: 20, color: '#064e3b', cursor: 'pointer', padding: '4px 8px' }}
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>💰</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 700, color: '#064e3b', fontSize: 14 }}>BHAO</h1>
              <p style={{ margin: 0, fontSize: 10, color: '#047857' }}>{t('campaign.yourTurn')}</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#ccfbf1', padding: '4px 12px', borderRadius: 9999, border: '1px solid #5eead4' }}>
          <span style={{ color: '#115e59', fontWeight: 700, fontSize: 12 }}>{currentLevelId ? t('campaign.level', { n: completedCount + 1 }) : t('campaign.allComplete')}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#065f46', fontSize: 12, fontWeight: 600 }}>{t('campaign.progress')}</span>
          <span style={{ color: '#047857', fontSize: 12 }}>
            {t('campaign.complete', { n: completedCount, total: totalLevels })} · <span style={{ color: '#b45309', fontWeight: 700 }}>{t('campaign.starsTotal', { n: starCount, total: totalLevels * 3 })}</span>
          </span>
        </div>
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 9999, overflow: 'hidden' }}>
          <div
            style={{ height: '100%', background: 'linear-gradient(to right, #10b981, #059669)', borderRadius: 9999, transition: 'all 1s', width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content - Leaderboard Style */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ maxWidth: 448, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ARTHA_YATRA_LEVELS.map((level, index) => {
            const isCompleted = completedLevels.includes(level.id)
            const isUnlocked = unlocked(level.id)
            const status = !isUnlocked ? 'locked' : isCompleted ? 'completed' : 'current'

            return (
              <LeaderboardCard
                key={level.id}
                level={level}
                position={index + 1}
                status={status}
                stars={stars[level.id] ?? 0}
                bestNetWorth={results[level.id]?.bestNetWorth ?? 0}
                onClick={status !== 'locked' ? () => setIntroLevelId(level.id) : undefined}
              />
            )
          })}
        </div>
      </div>

      {introLevel && (
        <LevelIntro
          level={introLevel}
          levelNumber={introIndex + 1}
          best={results[introLevel.id] ?? null}
          onClose={() => setIntroLevelId(null)}
          onStart={() => {
            setIntroLevelId(null)
            navigate(`/game/level/${introLevel.id}`)
          }}
        />
      )}
    </div>
  )
}

interface LeaderboardCardProps {
  level: LevelConfig
  position: number
  status: 'current' | 'completed' | 'locked'
  stars: number
  bestNetWorth: number
  onClick?: () => void
}

function LeaderboardCard({ level, position, status, stars, bestNetWorth, onClick }: LeaderboardCardProps) {
  const { t } = useTranslation()
  const getCardStyle = () => {
    if (status === 'current') {
      return {
        bg: 'linear-gradient(to right, #ffedd5, #fef3c7)',
        border: '#fdba74',
        positionBg: '#f97316',
        avatarBg: '#fed7aa',
        buttonBg: '#f97316',
        textColor: '#7c2d12',
      }
    } else if (status === 'completed') {
      return {
        bg: 'linear-gradient(to right, #ecfeff, #f0fdfa)',
        border: '#67e8f9',
        positionBg: '#0891b2',
        avatarBg: '#cffafe',
        buttonBg: '#06b6d4',
        textColor: '#164e63',
      }
    } else {
      return {
        bg: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
        border: '#d1d5db',
        positionBg: '#6b7280',
        avatarBg: '#f3f4f6',
        buttonBg: '#9ca3af',
        textColor: '#374151',
      }
    }
  }

  const style = getCardStyle()
  const isClickable = onClick !== undefined
  
  const rule = getLevelRule(level)
  const getIcon = () => {
    if (rule) return RULE_ICONS[rule]
    if (position === 1) return "📚"
    if (position === 2) return "💼"
    if (position === 3) return "📊"
    if (position === 4) return "🏦"
    return "🏛️"
  }

  const reqText = status === 'current'
    ? t('campaign.current', { n: position })
    : status === 'completed'
    ? t('campaign.completed', { n: position })
    : t('campaign.unlockHint', { n: position - 1 })

  return (
    <div 
      onClick={isClickable ? onClick : undefined}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16,
        background: style.bg, border: `2px solid ${style.border}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.1s',
        opacity: status === 'locked' ? 0.8 : 1
      }}
      onMouseDown={e => { if (isClickable) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={e => { if (isClickable) e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={e => { if (isClickable) e.currentTarget.style.transform = 'scale(1)' }}
    >
      {/* Position Badge */}
      <div style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, borderRadius: '50%', backgroundColor: style.positionBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1, marginTop: 1 }}>{position}</span>
      </div>

      {/* Avatar */}
      <div style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: 12, backgroundColor: style.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, lineHeight: 1 }}>
        {getIcon()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontWeight: 800, fontSize: 16, color: style.textColor, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{level.name}</h3>
        <p style={{ fontSize: 13, fontWeight: 600, color: style.textColor, opacity: 0.8, margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {reqText}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 6 }}>
            <span style={{ fontSize: 11 }}>📈</span>
            <span style={{ fontSize: 11, color: style.textColor, fontWeight: 700 }}>{t(`campaign.learning.${level.id}`, { defaultValue: level.mainLearning || t('campaign.learningFallback') })}</span>
          </div>
          {rule && (
            <span style={{ fontSize: 11, color: style.textColor, fontWeight: 600, opacity: 0.85 }}>
              {t(`campaign.rules.${rule}.name`)}
            </span>
          )}
        </div>
        {status !== 'locked' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <LevelStars stars={stars} size={16} />
            {bestNetWorth > 0 && (
              <span style={{ fontSize: 11, color: style.textColor, opacity: 0.75 }}>{t('campaign.best', { nw: `₹${formatWealth(bestNetWorth)}` })}</span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        disabled={!isClickable}
        style={{ 
          height: 38, borderRadius: 19, backgroundColor: style.buttonBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0,
          border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          cursor: isClickable ? 'pointer' : 'not-allowed',
          opacity: isClickable ? 1 : 0.6,
          padding: '0 16px',
          fontWeight: 700, color: '#fff', fontSize: 14
        }}
      >
        <span style={{ fontSize: 14, marginLeft: -4 }}>{isClickable ? '▶️' : '🔒'}</span>
        {isClickable ? (status === 'completed' ? t('campaign.replay') : t('campaign.play')) : t('campaign.locked')}
      </button>
    </div>
  )
}
