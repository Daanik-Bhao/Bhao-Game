import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { pickLang } from '../../i18n/lang'
import type { ConceptId, Grade, PlayerGameStats, ReportCard as ReportCardData } from '../../types/learning'
import { Gullu } from '../mascot/Gullu'
import { Button } from '../ui'
import { ConceptSheet } from './ConceptSheet'
import { RupeeText } from './RupeeText'
import { ProjectionBars } from './ProjectionBars'
import { CONCEPT_ICON, conceptView } from './conceptInfo'
import './learning.css'

export interface ReportCardProps {
  report: ReportCardData
  /** Kept for API compatibility (the net-worth sparkline now lives on the result screen) */
  stats?: PlayerGameStats
  /** Concepts that were unlocked for the first time by this game; undefined = unknown */
  newlyUnlocked?: ConceptId[]
  /** Shows an "Open Gyaan Library" button when given */
  onOpenLibrary?: () => void
}

const GRADE_TONE: Record<Grade, string> = { A: 'a', B: 'b', C: 'c', D: 'd' }

/**
 * Money report card (spec §E.20 (5)–(7)): the "certificate" (money style, lesson with ₹, five
 * grade tiles, expandable reasons), the real-life projection, and new Gyaan Library ideas.
 */
export function ReportCard({ report, newlyUnlocked, onOpenLibrary }: ReportCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [openConcept, setOpenConcept] = useState<ConceptId | null>(null)
  const [showWhy, setShowWhy] = useState(false)
  const whyId = useId()

  const persona = t(`report.persona.${report.personaId}`, { defaultValue: pickLang(report.personaTitle, report.personaTitleHi, lang) })
  const headline = pickLang(report.headline, report.headlineHi, lang)
  const p = report.projection
  const hasProjection = p && (p.yourMixValue > 0 || p.fdValue > 0 || p.indexValue > 0)
  const lessons = report.lessons.slice(0, 3)
  const unlocked = Array.from(new Set(report.conceptsUnlocked))
  const newOnes = newlyUnlocked ? unlocked.filter(id => newlyUnlocked.includes(id)) : []
  const metAgain = newlyUnlocked ? unlocked.filter(id => !newlyUnlocked.includes(id)) : unlocked
  const explanation = hasProjection ? pickLang(p.explanation, p.explanationHi, lang) : ''

  return (
    <>
      <section className="certificate" aria-label={t('report.aria')}>
        <div className="certificate__head">
          <Gullu mood="think" size={64} />
          <div>
            <p className="caption">{t('report.moneyStyle')}</p>
            <h2 className="certificate__persona">{persona}</h2>
          </div>
        </div>
        {headline && <p className="certificate__lesson"><RupeeText text={headline} tone="loss" /></p>}
        {report.grades.length > 0 && (
          <ul className="grades" aria-label={t('report.grades')}>
            {report.grades.map(g => (
              <li key={g.area} className={`grade grade--${GRADE_TONE[g.grade] ?? 'c'}`}>
                <b className="grade__letter" aria-label={t('report.gradeAria', { grade: g.grade })}>{g.grade}</b>
                <span className="grade__area">{t(`report.areaShort.${g.area}`, { defaultValue: pickLang(g.label, g.labelHi, lang) })}</span>
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="outline"
          size="s"
          block
          aria-expanded={showWhy}
          aria-controls={whyId}
          iconRight={showWhy ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
          onClick={() => setShowWhy(v => !v)}
          className="certificate__why-btn"
        >
          {showWhy ? t('report.hideWhy') : t('report.seeWhy')}
        </Button>
        {showWhy && (
          <div id={whyId} className="certificate__why">
            <ul className="why-list">
              {report.grades.map(g => (
                <li key={g.area} className="why-list__item">
                  <span className={`grade-dot grade--${GRADE_TONE[g.grade] ?? 'c'}`} aria-hidden="true">{g.grade}</span>
                  <span>
                    <b>{t(`report.area.${g.area}`, { defaultValue: pickLang(g.label, g.labelHi, lang) })}</b>{' '}
                    <RupeeText text={pickLang(g.reason, g.reasonHi, lang)} />
                  </span>
                </li>
              ))}
            </ul>
            {lessons.length > 0 && (
              <>
                <h3 className="section-title certificate__sub">{t('report.remember')}</h3>
                <div className="lessons">
                  {lessons.map((l, i) => {
                    const c = conceptView(l.conceptId, lang)
                    const Icon = CONCEPT_ICON[l.conceptId] ?? BookOpen
                    return (
                      <button key={`${l.conceptId}-${i}`} type="button" className="lesson" onClick={() => setOpenConcept(l.conceptId)}>
                        <span className="lesson__title"><Icon size={18} aria-hidden="true" /> {c.title}</span>
                        <span className="lesson__text"><RupeeText text={pickLang(l.text, l.textHi, lang)} /></span>
                        <span className="lesson__more">{t('report.learnMore')} <ChevronRight size={16} aria-hidden="true" /></span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {hasProjection && (
        <section className="panel panel--pad result-card" aria-labelledby={`${whyId}-proj`}>
          <h2 id={`${whyId}-proj`} className="section-title">{t('report.forReal', { years: p.years })}</h2>
          <ProjectionBars projection={p} />
          {explanation && <p className="proj__note">{explanation}</p>}
          <p className="proj__note">{t('report.proj.disclaimer')}</p>
        </section>
      )}

      {unlocked.length > 0 && (
        <section className="panel panel--pad result-card" aria-labelledby={`${whyId}-lib`}>
          <h2 id={`${whyId}-lib`} className="section-title">
            {newOnes.length > 0 ? t('report.newInLibrary') : newlyUnlocked ? t('report.metAgain') : t('report.metThisGame')}
          </h2>
          <div className="concept-chips">
            {(newOnes.length > 0 ? newOnes : metAgain).map(id => <ConceptChip key={id} id={id} onClick={() => setOpenConcept(id)} />)}
          </div>
          {newOnes.length > 0 && metAgain.length > 0 && (
            <>
              <p className="caption concept-chips__sub">{t('report.metAgain')}</p>
              <div className="concept-chips">
                {metAgain.map(id => <ConceptChip key={id} id={id} muted onClick={() => setOpenConcept(id)} />)}
              </div>
            </>
          )}
          {onOpenLibrary && (
            <Button variant="ghost" icon={<BookOpen size={18} aria-hidden="true" />} onClick={onOpenLibrary} className="concept-chips__open">
              {t('report.openLibrary')}
            </Button>
          )}
        </section>
      )}

      <ConceptSheet conceptId={openConcept} onClose={() => setOpenConcept(null)} />
    </>
  )
}

function ConceptChip({ id, muted, onClick }: { id: ConceptId; muted?: boolean; onClick: () => void }) {
  const { i18n } = useTranslation()
  const c = conceptView(id, i18n.language)
  const Icon = CONCEPT_ICON[id] ?? BookOpen
  return (
    <button type="button" className={`concept-chip${muted ? ' is-muted' : ''}`} onClick={onClick}>
      <Icon size={16} aria-hidden="true" /> {c.title}
    </button>
  )
}
