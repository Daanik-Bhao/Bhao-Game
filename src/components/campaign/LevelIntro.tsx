import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { LevelConfig } from '../../types/level'
import { getLevelRule, levelStarCriteria } from '../../lib/levelRules'
import type { LevelResult } from '../../lib/campaignProgress'
import { formatWealth } from '../../types/game'
import { LevelStars } from './LevelStars'

export const RULE_ICONS: Record<string, string> = {
  desire_meter: '🌙',
  saving_streak: '🔥',
  lifestyle_creep: '📈',
  grihastha: '🏡',
}

export interface LevelIntroProps {
  level: LevelConfig
  /** 1-based level number */
  levelNumber: number
  /** Best result so far (shows stars earned + best net worth) */
  best?: LevelResult | null
  onStart: () => void
  onClose: () => void
}

/**
 * Shown before a level starts: the one idea this level teaches, its rule in three lines,
 * the target and how to earn each star. Bottom sheet on phones, centred card on desktop.
 */
export function LevelIntro({ level, levelNumber, best, onStart, onClose }: LevelIntroProps) {
  const { t } = useTranslation()
  const rule = getLevelRule(level)
  const criteria = levelStarCriteria(level)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ruleText = (k: string, fallback: string) => (rule ? t(`campaign.rules.${rule}.${k}`, { defaultValue: fallback }) : fallback)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-intro-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto',
          background: '#ffffff', borderRadius: '20px 20px 0 0', padding: '18px 16px calc(16px + env(safe-area-inset-bottom))',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.25)', fontFamily: '"Inter", system-ui, sans-serif',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0, fontSize: 28,
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rule ? RULE_ICONS[rule] : '🎯'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#047857' }}>
              {t('campaign.intro.levelOf', { n: levelNumber, age: level.ageRange })}
            </p>
            <h2 id="level-intro-title" style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#064e3b' }}>{level.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t('campaign.intro.close')}
            style={{ background: '#f3f4f6', border: 'none', borderRadius: 999, width: 36, height: 36, fontSize: 18, cursor: 'pointer', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <section style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 14, padding: 12 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#047857' }}>
            💡 {t('campaign.intro.oneIdea')}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 600, color: '#064e3b', lineHeight: 1.4 }}>
            {ruleText('idea', level.mechanicDescription)}
          </p>
        </section>

        <section>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#92400e' }}>
            {t('campaign.intro.rule')}: {ruleText('name', level.mechanicName)}
          </p>
          <ol style={{ margin: '8px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rule
              ? (['how1', 'how2', 'how3'] as const).map(k => (
                  <li key={k} style={{ fontSize: 14, color: '#374151', lineHeight: 1.4 }}>{t(`campaign.rules.${rule}.${k}`)}</li>
                ))
              : <li style={{ fontSize: 14, color: '#374151' }}>{level.mechanicDescription}</li>}
          </ol>
        </section>

        <section style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#7c2d12' }}>
            🎯 {t('campaign.intro.goal', { target: `₹${formatWealth(level.targetCorpus)}`, years: level.turnLimit })}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#9a3412' }}>
            {t('campaign.intro.rivals', { n: level.botCount })}
          </p>
        </section>

        <section>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: '#92400e' }}>
            ⭐ {t('campaign.intro.earnStars')}
          </p>
          <LevelStars
            stars={best?.stars ?? 0}
            size={24}
            criteria={criteria}
          />
          {best && best.bestNetWorth > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
              {t('campaign.intro.yourBest', { nw: `₹${formatWealth(best.bestNetWorth)}` })}
            </p>
          )}
        </section>

        <button
          onClick={onStart}
          autoFocus
          style={{
            height: 50, borderRadius: 25, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(to right, #f97316, #f59e0b)', color: '#fff', fontWeight: 800, fontSize: 16,
            boxShadow: '0 6px 14px rgba(249, 115, 22, 0.35)',
          }}
        >
          ▶ {t('campaign.intro.start')}
        </button>
      </div>
    </div>
  )
}
