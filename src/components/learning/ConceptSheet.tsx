import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ConceptId } from '../../types/learning'
import { conceptView, useIsHindi } from './conceptInfo'
import './learning.css'

/**
 * Detail view for one Gyaan Library concept: explanation, ₹ example, action tip.
 * Bottom sheet on phones, centred dialog on wider screens. Pass conceptId=null to close.
 */
export function ConceptSheet({ conceptId, onClose }: { conceptId: ConceptId | null; onClose: () => void }) {
  const hindi = useIsHindi()
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!conceptId) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [conceptId])

  const c = conceptId ? conceptView(conceptId, hindi) : null

  return (
    <AnimatePresence>
      {c && (
        <motion.div
          key="concept-overlay"
          className="concept-sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="concept-sheet-title"
            className="concept-sheet"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 40, lineHeight: 1 }} aria-hidden="true">{c.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green-bright)' }}>
                  {hindi ? 'ज्ञान लाइब्रेरी' : 'Gyaan Library'}
                </div>
                <h2 id="concept-sheet-title" style={{ fontSize: 24, color: 'var(--green-primary)', margin: '2px 0 0' }}>{c.title}</h2>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label={hindi ? 'बंद करें' : 'Close'}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-soft)', background: '#fff', fontSize: 18, color: 'var(--text-soft-black)', flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {c.hasDetails ? (
              <>
                {c.oneLiner && <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 10px', lineHeight: 1.4 }}>{c.oneLiner}</p>}
                {c.explanation && <p style={{ fontSize: 15, color: 'var(--text-soft-black)', margin: '0 0 14px', lineHeight: 1.55 }}>{c.explanation}</p>}
                {c.example && (
                  <div style={{ background: 'var(--gold-light)', border: '1px solid #f3d27a', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--coin-shadow)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      ₹ {hindi ? 'उदाहरण' : 'Example'}
                    </div>
                    <div style={{ fontSize: 15, color: '#3b2a05', lineHeight: 1.5 }}>{c.example}</div>
                  </div>
                )}
                {c.actionTip && (
                  <div style={{ background: 'var(--green-light)', border: '1px solid #b7dcb7', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green-action)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      ✅ {hindi ? 'असल ज़िंदगी में करें' : 'Try this in real life'}
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--green-primary)', lineHeight: 1.5 }}>{c.actionTip}</div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
                {hindi ? 'इस विषय की पूरी जानकारी जल्द आ रही है।' : 'The full write-up for this idea is coming soon.'}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
