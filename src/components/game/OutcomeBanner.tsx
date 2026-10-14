import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BookOpen } from 'lucide-react'
import type { AssetClass } from '../../types/game'
import type { ConceptId } from '../../types/learning'
import { ASSETS } from '../../data/assets'
import { Button, useOverlayBlocker, type ButtonVariant } from '../ui'
import { Gullu, type GulluMood } from '../mascot/Gullu'
import { ConceptSheet } from '../learning/ConceptSheet'
import { formatMoney } from '../../lib/format'
import { pickLang } from '../../i18n/lang'
import { useReducedEffects } from '../../hooks/useReducedEffects'
import { cardNameFor } from './economyUi'

export type OutcomeKind = 'save' | 'invest' | 'spend' | 'gain' | 'loss' | 'attack'

/** What happened (raw data; translated at render time so a language switch still works). */
export interface OutcomeInfo {
  kind: OutcomeKind
  /** Net-worth change in ₹ */
  delta: number
  /** Invest: ₹ moved into the asset */
  investAmount?: number
  asset?: AssetClass
  /** Engine (English) card name */
  cardName?: string
  /** Attacker's name */
  sourceName?: string
  /** Mentor lesson (English only in the card data → hidden in Hindi) */
  insight?: string
  /** Related Gyaan Library concept for "Learn more" */
  concept?: ConceptId
}

const TONE: Record<OutcomeKind, 'save' | 'invest' | 'risk' | 'attack'> = {
  save: 'save', invest: 'invest', spend: 'risk', gain: 'save', loss: 'attack', attack: 'attack',
}
const MOOD: Record<OutcomeKind, GulluMood> = {
  save: 'cheer', invest: 'cheer', spend: 'think', gain: 'cheer', loss: 'worried', attack: 'worried',
}
const NEXT_VARIANT: Record<OutcomeKind, ButtonVariant> = {
  save: 'save', invest: 'invest', spend: 'spend', gain: 'primary', loss: 'primary', attack: 'primary',
}

/** Title (with the ₹ delta) for an outcome. */
export function outcomeTitle(info: OutcomeInfo, t: (k: string, o?: Record<string, unknown>) => string, lang: string): { text: string; amount: string } {
  const amount = formatMoney(info.kind === 'invest' ? (info.investAmount ?? 0) : info.delta, { signed: info.kind !== 'invest', lang })
  const card = info.cardName ? cardNameFor(info.cardName) : ''
  switch (info.kind) {
    case 'save': return { text: t('outcome.save'), amount }
    case 'invest': return {
      text: info.asset ? t('outcome.investInto', { asset: pickLang(ASSETS[info.asset].name, ASSETS[info.asset].nameHi, lang) }) : t('outcome.invest'),
      amount,
    }
    case 'spend': return { text: t('outcome.spend'), amount }
    case 'gain': return { text: card ? t('outcome.gainCard', { card }) : t('outcome.gain'), amount }
    case 'attack': return { text: t('outcome.attack', { name: info.sourceName ?? '', card }), amount }
    default: return { text: card ? t('outcome.lossCard', { card }) : t('outcome.loss'), amount }
  }
}

/**
 * Outcome banner (spec §E.14): paper banner sliding up over the hand / action bar after a
 * choice resolves or when a rival hits you. Never auto-dismisses; "Next" closes it. Toasts wait
 * while it is open.
 */
export function OutcomeBanner({ info, onNext }: { info: OutcomeInfo | null; onNext: () => void }) {
  const { t, i18n } = useTranslation()
  const { reduced } = useReducedEffects()
  const [concept, setConcept] = useState<ConceptId | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  useOverlayBlocker(!!info)
  useEffect(() => { if (info) requestAnimationFrame(() => nextRef.current?.focus({ preventScroll: true })) }, [info])

  const lang = i18n.language
  const title = info ? outcomeTitle(info, t, lang) : null
  const lesson = !info ? null
    : info.kind === 'attack' || info.kind === 'loss' ? t('outcome.tipShield')
    : info.kind === 'gain' ? null
    : lang === 'hi' ? null
    : info.insight ?? null

  return createPortal(
    <>
      <AnimatePresence>
        {info && title && (
          <motion.section
            key="outcome"
            className={`outcome paper outcome--${TONE[info.kind]}`}
            role="dialog"
            aria-modal="false"
            aria-labelledby="outcome-title"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%', transition: { duration: 0.22 } }}
            transition={{ duration: 0.32, ease: [0.05, 0.7, 0.1, 1] }}
          >
            <div className="outcome__row">
              <Gullu mood={MOOD[info.kind]} size={64} />
              <div className="outcome__text">
                <h2 id="outcome-title" className="outcome__title" aria-live="polite">
                  {title.text} <span className="num">{title.amount}</span>
                </h2>
                {lesson && <p className="outcome__lesson">{lesson}</p>}
              </div>
            </div>
            <div className="outcome__btns">
              {info.concept && (
                <Button variant="outline" icon={<BookOpen size={18} strokeWidth={2.25} aria-hidden="true" />} onClick={() => setConcept(info.concept ?? null)}>
                  {t('outcome.learnMore')}
                </Button>
              )}
              <Button ref={nextRef} variant={NEXT_VARIANT[info.kind]} className="outcome__next" iconRight={<ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />} onClick={onNext}>
                {info.kind === 'attack' || info.kind === 'loss' ? t('common.gotIt') : t('common.next')}
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <ConceptSheet conceptId={concept} onClose={() => setConcept(null)} />
    </>,
    document.body,
  )
}
