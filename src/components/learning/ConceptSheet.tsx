import { useTranslation } from 'react-i18next'
import { BookOpen, Lightbulb } from 'lucide-react'
import type { ConceptId } from '../../types/learning'
import { Sheet } from '../ui'
import { RupeeText } from './RupeeText'
import { CONCEPT_ICON, CONCEPT_TOPIC, conceptView } from './conceptInfo'
import './learning.css'

/**
 * One Gyaan Library idea (spec §E.8): title, "In one line", explanation, ₹ example,
 * "Try in real life" callout. Uses the shared Sheet (bottom sheet / side panel).
 * Pass conceptId=null to close.
 */
export function ConceptSheet({ conceptId, onClose }: { conceptId: ConceptId | null; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const c = conceptId ? conceptView(conceptId, i18n.language) : null
  const Icon = conceptId ? CONCEPT_ICON[conceptId] ?? BookOpen : BookOpen
  const topic = conceptId ? CONCEPT_TOPIC[conceptId] : 'saving'

  return (
    <Sheet
      open={!!c}
      onClose={onClose}
      title={c?.title}
      header={c ? (
        <div className="concept__head">
          <span className={`concept__icon topic--${topic}`} aria-hidden="true"><Icon size={26} strokeWidth={2.25} /></span>
          <div className="concept__titles">
            <p className="caption">{t('library.title')}</p>
            <p className="concept__title" aria-hidden="true">{c.title}</p>
          </div>
        </div>
      ) : undefined}
    >
      {c && (c.hasDetails ? (
        <div className="concept">
          {c.oneLiner && (
            <section>
              <h3 className="concept__label caption">{t('concept.inOneLine')}</h3>
              <p className="concept__oneliner">{c.oneLiner}</p>
            </section>
          )}
          {c.explanation && <p className="concept__body">{c.explanation}</p>}
          {c.example && (
            <section className="concept__box concept__box--example">
              <h3 className="concept__label caption">{t('concept.example')}</h3>
              <p className="concept__body"><RupeeText text={c.example} /></p>
            </section>
          )}
          {c.actionTip && (
            <section className="concept__box concept__box--tip">
              <h3 className="concept__label caption"><Lightbulb size={16} aria-hidden="true" /> {t('concept.tryThis')}</h3>
              <p className="concept__body">{c.actionTip}</p>
            </section>
          )}
        </div>
      ) : (
        <p className="concept__body muted">{t('concept.comingSoon')}</p>
      ))}
    </Sheet>
  )
}
