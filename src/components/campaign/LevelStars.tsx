import { useTranslation } from 'react-i18next'
import type { StarCriterion } from '../../lib/levelRules'

export interface LevelStarsProps {
  /** 0..3 earned (pass 0 to show empty stars) */
  stars: number
  /** Criteria to list under the stars. `met` undefined = not played yet (shown neutral). */
  criteria?: (Omit<StarCriterion, 'met'> & { met?: boolean })[]
  /** Star size in px (default 28) */
  size?: number
  /** Animate the earned stars popping in (result screen) */
  animate?: boolean
  /** Text colour for the checklist (default dark) */
  color?: string
}

const STAR_ON = '#f59e0b'
const STAR_OFF = '#d1d5db'

/** Three stars + optional criteria checklist. Reusable on the campaign map, intro and result screen. */
export function LevelStars({ stars, criteria, size = 28, animate = false, color = '#1f2937' }: LevelStarsProps) {
  const { t } = useTranslation()
  const n = Math.max(0, Math.min(3, Math.floor(stars)))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
      <div
        role="img"
        aria-label={t('campaign.stars.earned', { n })}
        style={{ display: 'flex', justifyContent: 'center', gap: Math.round(size / 5) }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              fontSize: size,
              lineHeight: 1,
              color: i < n ? STAR_ON : STAR_OFF,
              textShadow: i < n ? '0 2px 6px rgba(245, 158, 11, 0.45)' : 'none',
              transform: i === 1 ? `translateY(-${Math.round(size / 6)}px)` : undefined,
              animation: animate && i < n ? `bhaoStarPop 0.45s ${0.25 + i * 0.3}s both` : undefined,
            }}
          >
            ★
          </span>
        ))}
      </div>
      {criteria && criteria.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {criteria.map((c, i) => {
            const mark = c.met === undefined ? '☆' : c.met ? '✅' : '⬜'
            return (
              <li key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color, lineHeight: 1.35 }}>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 20, textAlign: 'center' }}>{mark}</span>
                <span style={{ flex: 1, opacity: c.met === false ? 0.7 : 1 }}>
                  <strong style={{ marginRight: 4 }}>{'★'.repeat(i + 1)}</strong>
                  {t(c.labelKey, { ...(c.params ?? {}), defaultValue: c.label })}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {animate && (
        <style>{'@keyframes bhaoStarPop{0%{opacity:0;transform:scale(0.2) rotate(-30deg)}70%{opacity:1;transform:scale(1.25)}100%{opacity:1;transform:scale(1)}}'}</style>
      )}
    </div>
  )
}
