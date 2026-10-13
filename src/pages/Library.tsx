import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, Lock, Play } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import type { ConceptId } from '../types/learning'
import { ALL_CONCEPT_IDS } from '../data/concepts'
import { getUnseenConcepts, markSeen, progressOwnerKey } from '../lib/libraryProgress'
import { ConceptSheet } from '../components/learning/ConceptSheet'
import { CONCEPT_ICON, CONCEPT_TOPIC, CONCEPT_TOPICS, conceptView, type ConceptTopic } from '../components/learning/conceptInfo'
import { useLibraryProgress } from '../components/learning/useLibraryProgress'
import { Button, EmptyState, ToggleChip, useToastPlacement } from '../components/ui'
import { TabBar } from '../components/nav/TabBar'
import '../components/learning/learning.css'

/** Small progress ring with "4 / 22" inside (spec §E.8 header). */
function ProgressRing({ value, total, label }: { value: number; total: number; label: string }) {
  const r = 19
  const c = 2 * Math.PI * r
  const k = total > 0 ? value / total : 0
  return (
    <span className="lib-ring" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} className="lib-ring__track" />
        <circle cx="24" cy="24" r={r} className="lib-ring__fill" strokeDasharray={c} strokeDashoffset={c * (1 - k)} />
      </svg>
      <span className="lib-ring__text num" aria-hidden="true">{value}/{total}</span>
    </span>
  )
}

/** Gyaan Library (spec §E.8): every money idea the game teaches, unlocked by running into it in play. */
export function Library() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const ownerKey = progressOwnerKey(user?.id)
  const { t, i18n } = useTranslation()
  const { unlocked } = useLibraryProgress(ownerKey)
  const [params, setParams] = useSearchParams()
  const [topic, setTopic] = useState<ConceptTopic | 'all'>('all')
  useToastPlacement('bottom')

  // Which concepts were new when the page opened (badges stay for this visit)
  const [newThisVisit] = useState<ConceptId[]>(() => getUnseenConcepts(ownerKey))
  useEffect(() => { markSeen(ownerKey) }, [ownerKey])

  const requested = params.get('concept') as ConceptId | null
  const openId = requested && unlocked.includes(requested) ? requested : null
  const openConcept = (id: ConceptId) => setParams({ concept: id })
  const closeConcept = useCallback(() => setParams({}, { replace: true }), [setParams])

  const total = ALL_CONCEPT_IDS.length
  const count = ALL_CONCEPT_IDS.filter(id => unlocked.includes(id)).length
  const ids = ALL_CONCEPT_IDS.filter(id => topic === 'all' || CONCEPT_TOPIC[id] === topic)

  return (
    <div className="page page--tabbar library">
      <header className="screen-bar">
        <Button variant="ghost" icon={<ArrowLeft size={22} />} aria-label={t('common.back')} onClick={() => navigate('/dashboard')} className="screen-bar__back" />
        <h1 className="screen-bar__title">{t('library.title')}</h1>
        <div className="screen-bar__actions">
          <ProgressRing value={count} total={total} label={t('library.unlocked', { count, total })} />
        </div>
      </header>

      <main className="page__main library__main">
        {count === 0 ? (
          <EmptyState
            className="library__empty"
            title={t('library.emptyTitle2')}
            body={t('library.emptyBody2')}
            action={<Button size="s" icon={<Play size={16} aria-hidden="true" />} onClick={() => navigate('/game?mode=practice')}>{t('library.playNow')}</Button>}
          />
        ) : (
          <p className="lede library__lede">{t('library.subtitle')}</p>
        )}

        <div className="library__filters" role="group" aria-label={t('library.filterAria')}>
          <ToggleChip pressed={topic === 'all'} onPressedChange={() => setTopic('all')}>{t('library.topic.all')}</ToggleChip>
          {CONCEPT_TOPICS.map(tp => (
            <ToggleChip key={tp} pressed={topic === tp} onPressedChange={() => setTopic(tp)}>{t(`library.topic.${tp}`)}</ToggleChip>
          ))}
        </div>

        <ul className="library-grid">
          {ids.map(id => {
            const c = conceptView(id, i18n.language)
            const isUnlocked = unlocked.includes(id)
            const isNew = isUnlocked && newThisVisit.includes(id)
            const Icon = CONCEPT_ICON[id] ?? BookOpen
            const tp = CONCEPT_TOPIC[id]
            return (
              <li key={id} className="library-grid__item">
                {isUnlocked ? (
                  <button type="button" className={`lib-tile topic-band--${tp}`} onClick={() => openConcept(id)}>
                    <span className="lib-tile__band" aria-hidden="true">
                      <Icon size={18} strokeWidth={2.25} />
                      <span className="lib-tile__topic">{t(`library.topic.${tp}`)}</span>
                    </span>
                    {isNew && <span className="lib-tile__new">{t('library.new')}</span>}
                    <span className="lib-tile__title">{c.title}</span>
                    <span className="lib-tile__text">{c.oneLiner || t('library.tapToRead')}</span>
                  </button>
                ) : (
                  <div className="lib-tile is-locked" role="group" aria-label={t('library.lockedAria', { title: c.title })}>
                    <span className="lib-tile__lock" aria-hidden="true"><Lock size={18} strokeWidth={2.25} /></span>
                    <span className="lib-tile__title">{c.title}</span>
                    <span className="lib-tile__locked-label">{t('library.playToUnlock')}</span>
                    <span className="lib-tile__text">{t(`library.hint.${id}`)}</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </main>

      <TabBar active="library" />
      <ConceptSheet conceptId={openId} onClose={closeConcept} />
    </div>
  )
}
