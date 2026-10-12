import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import type { ConceptId } from '../types/learning'
import { ALL_CONCEPT_IDS } from '../data/concepts'
import { getUnseenConcepts, markSeen, progressOwnerKey } from '../lib/libraryProgress'
import { ConceptSheet } from '../components/learning/ConceptSheet'
import { conceptView, useIsHindi } from '../components/learning/conceptInfo'
import { useLibraryProgress } from '../components/learning/useLibraryProgress'
import { UNLOCK_HINTS } from '../components/learning/unlockHints'
import '../components/learning/learning.css'

/** Gyaan Library: every money idea the game teaches, unlocked by running into it in play. */
export function Library() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const ownerKey = progressOwnerKey(user?.id)
  const hindi = useIsHindi()
  const tx = (en: string, hi: string) => (hindi ? hi : en)
  const { unlocked } = useLibraryProgress(ownerKey)
  const [params, setParams] = useSearchParams()

  // Which concepts were new when the page opened (badges stay for this visit)
  const [newThisVisit] = useState<ConceptId[]>(() => getUnseenConcepts(ownerKey))
  useEffect(() => { markSeen(ownerKey) }, [ownerKey])

  const requested = params.get('concept') as ConceptId | null
  const openId = requested && unlocked.includes(requested) ? requested : null
  const openConcept = (id: ConceptId) => setParams({ concept: id }, { replace: true })
  const closeConcept = useCallback(() => setParams({}, { replace: true }), [setParams])

  const total = ALL_CONCEPT_IDS.length
  const count = ALL_CONCEPT_IDS.filter(id => unlocked.includes(id)).length
  const pct = total > 0 ? (count / total) * 100 : 0

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f0fdfa, #d1fae5)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'max(10px, env(safe-area-inset-top)) 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/dashboard')}
            aria-label={tx('Back to home', 'होम पर वापस')}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#064e3b', padding: '4px 8px', borderRadius: 8 }}
          >
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 20, color: '#064e3b' }}>📚 {tx('Gyaan Library', 'ज्ञान लाइब्रेरी')}</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#047857' }}>{tx('Money ideas you have met while playing', 'खेलते हुए सीखी पैसे की बातें')}</p>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: '#065f46', fontWeight: 700 }}>{tx(`${count} / ${total} unlocked`, `${count} / ${total} खुले`)}</span>
            {count < total && <span style={{ color: '#047857' }}>{tx('Play games to unlock more', 'और खोलने के लिए खेलें')}</span>}
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={count}
            aria-label={tx('Concepts unlocked', 'खुले विषय')}
            style={{ height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}
          >
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, #10b981, #059669)', borderRadius: 999, transition: 'width 0.6s' }} />
          </div>
        </div>
      </div>

      <main style={{ flex: 1, width: '100%', maxWidth: 1000, margin: '0 auto', padding: '16px 16px 40px' }}>
        {count === 0 && (
          <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }} aria-hidden="true">🎮</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: '#064e3b' }}>{tx('Your library is empty — for now!', 'आपकी लाइब्रेरी अभी खाली है!')}</div>
              <div style={{ fontSize: 14, color: '#4b5563' }}>{tx('Every game unlocks the money ideas you run into. Finish one to fill your first shelf.', 'हर खेल में जिन बातों से आप मिलते हैं, वे यहाँ खुलती हैं। पहला खेल पूरा करें।')}</div>
            </div>
            <button
              onClick={() => navigate('/game?mode=practice')}
              style={{ background: 'var(--green-action)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}
            >
              {tx('Play', 'खेलें')}
            </button>
          </div>
        )}

        <ul className="library-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ALL_CONCEPT_IDS.map((id, i) => {
            const c = conceptView(id, hindi)
            const isUnlocked = unlocked.includes(id)
            const isNew = isUnlocked && newThisVisit.includes(id)
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(i * 0.025, 0.4) }}
                style={{ display: 'flex' }}
              >
                {isUnlocked ? (
                  <button className="library-tile unlocked" style={{ width: '100%' }} onClick={() => openConcept(id)}>
                    {isNew && <span className="library-new-dot">{tx('NEW', 'नया')}</span>}
                    <span className="library-tile-emoji" aria-hidden="true">{c.emoji}</span>
                    <span className="library-tile-title">{c.title}</span>
                    <span className="library-tile-text">{c.oneLiner || tx('Tap to read more.', 'और पढ़ने के लिए टैप करें।')}</span>
                  </button>
                ) : (
                  <div className="library-tile locked" style={{ width: '100%' }} aria-label={tx(`${c.title}: locked`, `${c.title}: बंद`)}>
                    <span className="library-tile-emoji" aria-hidden="true">{c.emoji}</span>
                    <span className="library-tile-title">{c.title}</span>
                    <span className="library-tile-lock">🔒 {tx('Play to unlock', 'खोलने के लिए खेलें')}</span>
                    <span className="library-tile-hint">{tx('How: ', 'कैसे: ')}{hindi ? UNLOCK_HINTS[id].hi : UNLOCK_HINTS[id].en}</span>
                  </div>
                )}
              </motion.li>
            )
          })}
        </ul>
      </main>

      <ConceptSheet conceptId={openId} onClose={closeConcept} />
    </div>
  )
}
