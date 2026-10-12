import { getRankForRP } from '../types/game'

interface RankBadgeProps {
  rp: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function RankBadge({ rp, showProgress, size = 'md' }: RankBadgeProps) {
  const rank = getRankForRP(rp)
  const nextRank = rank.maxRP === Infinity ? null : { minRP: rank.maxRP + 1 }
  const progress = rank.maxRP === Infinity ? 100 : ((rp - rank.minRP) / (rank.maxRP - rank.minRP)) * 100

  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14
  const emojiSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 18

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: emojiSize }}>{rank.emoji}</span>
        <span style={{ fontSize, fontWeight: 700, color: rank.color, fontFamily: 'Space Grotesk, sans-serif' }}>
          {rank.name}
        </span>
        <span style={{ fontSize: fontSize - 2, color: 'var(--text-muted)' }}>{rp.toLocaleString()} RP</span>
      </div>
      {showProgress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
            <div style={{
              height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${rank.color}, #10b981)`,
              width: `${Math.max(2, Math.min(100, progress))}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: rank.color }}>{Math.round(progress)}%</span>
        </div>
      )}
      {showProgress && nextRank && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{rank.maxRP - rp + 1} RP to next rank</div>
      )}
    </div>
  )
}
