import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import type { ConceptId, Grade, PlayerGameStats, ReportCard as ReportCardData } from '../../types/learning'
import { Wealth } from '../Wealth'
import { ConceptSheet } from './ConceptSheet'
import { NetWorthSparkline } from './NetWorthSparkline'
import { ProjectionBars } from './ProjectionBars'
import { conceptView, useIsHindi } from './conceptInfo'
import './learning.css'

const GRADE_COLORS: Record<Grade, { fg: string; bg: string; border: string }> = {
  A: { fg: '#4ade80', bg: 'rgba(34,197,94,0.14)', border: 'rgba(74,222,128,0.45)' },
  B: { fg: '#a3e635', bg: 'rgba(132,204,22,0.12)', border: 'rgba(163,230,53,0.4)' },
  C: { fg: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(251,191,36,0.4)' },
  D: { fg: '#f87171', bg: 'rgba(239,68,68,0.13)', border: 'rgba(248,113,113,0.45)' },
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

export interface ReportCardProps {
  report: ReportCardData
  /** The player's game stats, for the net-worth sparkline (optional) */
  stats?: PlayerGameStats
  /** Concepts that were unlocked for the first time by this game; undefined = unknown */
  newlyUnlocked?: ConceptId[]
  /** Shows an "Open Gyaan Library" button when given */
  onOpenLibrary?: () => void
}

/** End-of-game "what you did / what it means in real life / what to remember" card. Dark theme. */
export function ReportCard({ report, stats, newlyUnlocked, onOpenLibrary }: ReportCardProps) {
  const hindi = useIsHindi()
  const tx = (en: string, hi: string) => (hindi ? hi : en)
  const [openConcept, setOpenConcept] = useState<ConceptId | null>(null)

  const persona = (hindi && report.personaTitleHi) || report.personaTitle
  const headline = (hindi && report.headlineHi) || report.headline
  const change = report.finalNetWorth - report.startNetWorth
  const changePct = report.startNetWorth > 0 ? Math.round((change / report.startNetWorth) * 100) : null

  const p = report.projection
  const hasProjection = p && (p.yourMixValue > 0 || p.fdValue > 0 || p.indexValue > 0)
  const lessons = report.lessons.slice(0, 3)
  const unlocked = Array.from(new Set(report.conceptsUnlocked))
  const newOnes = newlyUnlocked ? unlocked.filter(id => newlyUnlocked.includes(id)) : []
  const metAgain = newlyUnlocked ? unlocked.filter(id => !newlyUnlocked.includes(id)) : unlocked
  const series = stats?.netWorthByRound ?? []

  return (
    <motion.section
      className="report-card"
      aria-label={tx('Your money report card', 'आपका पैसा रिपोर्ट कार्ड')}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Persona + headline */}
      <motion.div variants={item} className="rc-hero">
        <div className="rc-eyebrow">📋 {tx('Your money report', 'आपकी पैसा रिपोर्ट')}</div>
        <div className="rc-persona">{persona}</div>
        {headline && <p className="rc-headline">{headline}</p>}
      </motion.div>

      {/* Net worth start -> final + sparkline */}
      <motion.div variants={item} className="rc-panel">
        <div className="rc-networth">
          <div>
            <div className="rc-label">{tx('Started with', 'शुरुआत')}</div>
            <div className="rc-nw-value"><Wealth amount={report.startNetWorth} /></div>
          </div>
          <div className="rc-arrow" aria-hidden="true">→</div>
          <div>
            <div className="rc-label">{tx('Ended with', 'अंत में')}</div>
            <div className="rc-nw-value rc-nw-final"><Wealth amount={report.finalNetWorth} /></div>
          </div>
          <div className={`rc-delta ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? '▲' : '▼'} {changePct !== null ? `${Math.abs(changePct)}%` : <Wealth amount={Math.abs(change)} />}
          </div>
        </div>
        {series.length >= 2 && <NetWorthSparkline values={series} hindi={hindi} />}
      </motion.div>

      {/* Grades */}
      {report.grades.length > 0 && (
        <motion.div variants={item}>
          <h3 className="rc-section-title">{tx('Your grades', 'आपके ग्रेड')}</h3>
          <ul className="rc-grades">
            {report.grades.map(g => {
              const col = GRADE_COLORS[g.grade] ?? GRADE_COLORS.C
              return (
                <li key={g.area} className="rc-grade" style={{ background: col.bg, borderColor: col.border }}>
                  <span className="rc-grade-letter" style={{ color: col.fg, borderColor: col.border }} aria-label={tx(`Grade ${g.grade}`, `ग्रेड ${g.grade}`)}>
                    {g.grade}
                  </span>
                  <span className="rc-grade-text">
                    <span className="rc-grade-label">{(hindi && g.labelHi) || g.label}</span>
                    <span className="rc-grade-reason">{(hindi && g.reasonHi) || g.reason}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </motion.div>
      )}

      {/* 10-year projection */}
      {hasProjection && (
        <motion.div variants={item} className="rc-panel">
          <h3 className="rc-section-title" style={{ marginTop: 0 }}>
            {tx(`If you did this for real for ${p.years} years`, `अगर आप असल में ${p.years} साल ऐसा करें`)}
          </h3>
          <ProjectionBars projection={p} hindi={hindi} />
          {((hindi && p.explanationHi) || p.explanation) && (
            <p className="rc-note">{(hindi && p.explanationHi) || p.explanation}</p>
          )}
        </motion.div>
      )}

      {/* Lessons */}
      {lessons.length > 0 && (
        <motion.div variants={item}>
          <h3 className="rc-section-title">{tx('Remember this', 'यह याद रखें')}</h3>
          <div className="rc-lessons">
            {lessons.map((l, i) => {
              const c = conceptView(l.conceptId, hindi)
              return (
                <button key={`${l.conceptId}-${i}`} className="rc-lesson" onClick={() => setOpenConcept(l.conceptId)}>
                  <span className="rc-lesson-head">
                    <span aria-hidden="true" style={{ fontSize: 22 }}>{c.emoji}</span>
                    <span className="rc-lesson-title">{c.title}</span>
                  </span>
                  <span className="rc-lesson-text">{(hindi && l.textHi) || l.text}</span>
                  <span className="rc-lesson-more">{tx('Learn more →', 'और जानें →')}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Concepts unlocked */}
      {unlocked.length > 0 && (
        <motion.div variants={item} className="rc-panel rc-unlocks">
          {newOnes.length > 0 && (
            <>
              <div className="rc-unlock-title">✨ {tx('New in your Gyaan Library', 'आपकी ज्ञान लाइब्रेरी में नया')}</div>
              <div className="rc-chips">
                {newOnes.map(id => <ConceptChip key={id} id={id} hindi={hindi} isNew onClick={() => setOpenConcept(id)} />)}
              </div>
            </>
          )}
          {metAgain.length > 0 && (
            <>
              <div className="rc-unlock-title rc-muted" style={{ marginTop: newOnes.length > 0 ? 12 : 0 }}>
                {newOnes.length > 0 || newlyUnlocked ? tx('Ideas you met again', 'जिन बातों से फिर मिले') : tx('Ideas you met this game', 'इस खेल में मिली बातें')}
              </div>
              <div className="rc-chips">
                {metAgain.map(id => <ConceptChip key={id} id={id} hindi={hindi} onClick={() => setOpenConcept(id)} />)}
              </div>
            </>
          )}
          {onOpenLibrary && (
            <button className="rc-library-btn" onClick={onOpenLibrary}>
              📚 {tx('Open Gyaan Library', 'ज्ञान लाइब्रेरी खोलें')}
            </button>
          )}
        </motion.div>
      )}

      <ConceptSheet conceptId={openConcept} onClose={() => setOpenConcept(null)} />
    </motion.section>
  )
}

function ConceptChip({ id, hindi, isNew, onClick }: { id: ConceptId; hindi: boolean; isNew?: boolean; onClick: () => void }) {
  const c = conceptView(id, hindi)
  return (
    <button className={`rc-chip${isNew ? ' is-new' : ''}`} onClick={onClick}>
      <span aria-hidden="true">{c.emoji}</span> {c.title}
      {isNew && <span className="rc-chip-new">{hindi ? 'नया' : 'NEW'}</span>}
    </button>
  )
}
