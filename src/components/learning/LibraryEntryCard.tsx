import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ALL_CONCEPT_IDS } from '../../data/concepts'
import { progressOwnerKey } from '../../lib/libraryProgress'
import { useIsHindi } from './conceptInfo'
import { useLibraryProgress } from './useLibraryProgress'
import './learning.css'

/**
 * Entry point to the Gyaan Library with an unseen-concepts badge.
 * variant "banner": dark-green dashboard banner; "tile": GuestHome-style glass tile.
 */
export function LibraryEntryCard({ variant = 'banner', compact = false }: { variant?: 'banner' | 'tile'; compact?: boolean }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const hindi = useIsHindi()
  const tx = (en: string, hi: string) => (hindi ? hi : en)
  const { unlocked, unseen } = useLibraryProgress(progressOwnerKey(user?.id))
  const total = ALL_CONCEPT_IDS.length
  const count = ALL_CONCEPT_IDS.filter(id => unlocked.includes(id)).length
  const newCount = unseen.length
  const badge = newCount > 0 && (
    <span className="library-badge" aria-label={tx(`${newCount} new`, `${newCount} नए`)}>{newCount > 9 ? '9+' : newCount}</span>
  )
  const subtitle = count === 0
    ? tx('Money ideas unlock as you play.', 'खेलते-खेलते पैसे की बातें खुलती हैं।')
    : tx(`${count} / ${total} money ideas unlocked`, `${count} / ${total} पैसे की बातें खुलीं`)
  const label = `${tx('Gyaan Library', 'ज्ञान लाइब्रेरी')}${newCount > 0 ? tx(`, ${newCount} new`, `, ${newCount} नए`) : ''}`

  if (variant === 'tile') {
    return (
      <button
        onClick={() => navigate('/library')}
        className="glass-panel"
        aria-label={label}
        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, border: '1px solid var(--green-primary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}
      >
        <span style={{ fontSize: 32 }} aria-hidden="true">📚</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontWeight: 700, fontSize: 18, color: 'var(--text-dark)' }}>{tx('Gyaan Library', 'ज्ञान लाइब्रेरी')}</span>
          <span style={{ display: 'block', fontSize: 14, color: 'var(--text-muted)' }}>{subtitle}</span>
        </span>
        {badge}
      </button>
    )
  }

  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <button
      onClick={() => navigate('/library')}
      aria-label={label}
      style={{
        position: 'relative', zIndex: 1, width: '100%', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: compact ? 12 : 20,
        background: 'linear-gradient(135deg, #FFF0C0 0%, #FFE08A 100%)',
        border: '1px solid rgba(176,112,16,0.25)', borderRadius: compact ? 16 : 20,
        padding: compact ? '14px 16px' : '20px 28px',
        boxShadow: '0 8px 20px rgba(176,112,16,0.15)', transition: 'transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
    >
      <span style={{ fontSize: compact ? 32 : 44, lineHeight: 1 }} aria-hidden="true">📚</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: compact ? 17 : 22, color: '#0B4232' }}>
          {tx('Gyaan Library', 'ज्ञान लाइब्रेरी')} {badge}
        </span>
        <span style={{ display: 'block', fontSize: compact ? 13 : 15, color: '#6b4e0e', marginTop: 2 }}>{subtitle}</span>
        <span style={{ display: 'block', height: 6, background: 'rgba(11,66,50,0.12)', borderRadius: 3, marginTop: 8, overflow: 'hidden', maxWidth: 320 }}>
          <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: '#1A5A43', borderRadius: 3 }} />
        </span>
      </span>
      <span style={{ fontSize: compact ? 13 : 16, fontWeight: 700, color: '#0B4232', whiteSpace: 'nowrap' }} aria-hidden="true">
        {tx('Open →', 'खोलें →')}
      </span>
    </button>
  )
}
