import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Check, Star, X } from 'lucide-react'
import type { StarCriterion } from '../../lib/levelRules'
import './campaign.css'

export interface LevelStarsProps {
  /** 0..3 earned (pass 0 to show empty stars) */
  stars: number
  /** Criteria to list under the stars. `met` undefined = not played yet (shown neutral). */
  criteria?: (Omit<StarCriterion, 'met'> & { met?: boolean })[]
  /** Star size in px (default 32 on the result screen) */
  size?: number
  /** Stars pop in one after another (result screen) */
  animate?: boolean
  /** Left-aligned row instead of centred (intro sheet, campaign card) */
  align?: 'center' | 'start'
  className?: string
}

/** Three stars + optional criteria checklist (spec §E.7). Haldi filled / sand empty, check or cross per criterion. */
export function LevelStars({ stars, criteria, size = 32, animate = false, align = 'center', className = '' }: LevelStarsProps) {
  const { t } = useTranslation()
  const n = Math.max(0, Math.min(3, Math.floor(stars)))
  return (
    <div className={`lvl-stars lvl-stars--${align} ${className}`.trim()}>
      <div className="lvl-stars__row" role="img" aria-label={t('campaign.stars.earned', { n })}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className={`lvl-star${i < n ? ' is-on' : ''}`}
            aria-hidden="true"
            initial={animate && i < n ? { scale: 0.3, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animate ? 0.2 + i * 0.15 : 0, duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Star size={size} strokeWidth={2} />
          </motion.span>
        ))}
      </div>
      {criteria && criteria.length > 0 && (
        <ul className="lvl-criteria">
          {criteria.map((c, i) => (
            <li key={c.id} className={`lvl-criterion${c.met === false ? ' is-missed' : ''}${c.met ? ' is-met' : ''}`}>
              <span className="lvl-criterion__mark" aria-hidden="true">
                {c.met === undefined ? <Star size={18} strokeWidth={2.25} /> : c.met ? <Check size={18} strokeWidth={2.75} /> : <X size={18} strokeWidth={2.75} />}
              </span>
              <span className="lvl-criterion__text">
                <span className="sr-only">
                  {c.met === undefined ? '' : c.met ? t('campaign.stars.met') : t('campaign.stars.missed')}
                </span>
                <span className="lvl-criterion__n" aria-hidden="true">{t('campaign.stars.nth', { n: i + 1 })}</span>
                {t(c.labelKey, { ...(c.params ?? {}), defaultValue: c.label })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
