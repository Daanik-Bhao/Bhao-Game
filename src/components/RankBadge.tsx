import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'
import { getRankForRP } from '../types/game'
import { Progress } from './ui'
import '../pages/menus.css'

interface RankBadgeProps {
  rp: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const rankKey = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')

/** Rank ladder badge: lucide trophy + rank name + RP (no emoji crowns), optional progress to the next rank. */
export function RankBadge({ rp, showProgress, size = 'md' }: RankBadgeProps) {
  const { t } = useTranslation()
  const rank = getRankForRP(rp)
  const isTop = rank.maxRP === Infinity
  const progress = isTop ? 100 : ((rp - rank.minRP) / (rank.maxRP - rank.minRP + 1)) * 100
  const name = t(`profile.rank.${rankKey(rank.name)}`, { defaultValue: rank.name })
  const rpText = t('profile.rankPoints', { n: new Intl.NumberFormat('en-IN').format(rp) })

  return (
    <div className={`rank-badge rank-badge--${size}`}>
      <div className="rank-badge__row">
        <span className="rank-badge__icon" aria-hidden="true"><Trophy size={size === 'lg' ? 20 : 16} strokeWidth={2.25} /></span>
        <span className="rank-badge__name">{name}</span>
        <span className="rank-badge__rp num">{rpText}</span>
      </div>
      {showProgress && (
        <Progress
          className="rank-badge__bar"
          value={Math.max(0, Math.min(100, progress))}
          tone="haldi"
          ariaLabel={t('profile.rankProgress')}
          label={isTop ? t('profile.rankTop') : t('profile.rankNext', { n: new Intl.NumberFormat('en-IN').format(rank.maxRP - rp + 1) })}
        />
      )}
    </div>
  )
}
