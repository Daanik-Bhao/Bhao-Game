import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Lock, Play, Star } from 'lucide-react'
import { ARTHA_YATRA_LEVELS } from '../data/levels'
import { useAuth } from '../hooks/useAuth'
import {
  CAMPAIGN_PROGRESS_EVENT,
  STARS_TO_UNLOCK_NEXT,
  getCompletedLevels,
  getLevelResults,
  getLevelStars,
  isLevelUnlocked,
  progressOwnerKey,
  syncCampaignProgress,
  totalStars,
} from '../lib/campaignProgress'
import type { LevelResults } from '../lib/campaignProgress'
import { LevelIntro, levelIcon, useLevelText } from '../components/campaign'
import { Button, Panel, Progress, useToastPlacement } from '../components/ui'
import { Gullu } from '../components/mascot/Gullu'
import { TabBar } from '../components/nav/TabBar'
import type { LevelConfig } from '../types/level'
import '../components/campaign/campaign.css'

type Status = 'done' | 'current' | 'open' | 'locked'

/**
 * Artha Yatra campaign map (spec §E.5): four life stages on a dashed trail, alternating
 * left/right. The current level has the only primary button; locked levels say exactly
 * what unlocks them. Tapping an unlocked node or card opens the level intro (§E.6).
 */
export function Campaign() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const ownerKey = progressOwnerKey(user?.id)
  useToastPlacement('bottom')

  const [completedLevels, setCompletedLevels] = useState<string[]>(() => getCompletedLevels(ownerKey))
  const [stars, setStars] = useState<Record<string, number>>(() => getLevelStars(ownerKey))
  const [results, setResults] = useState<LevelResults>(() => getLevelResults(ownerKey))

  useEffect(() => {
    const reload = () => {
      setCompletedLevels(getCompletedLevels(ownerKey))
      setStars(getLevelStars(ownerKey))
      setResults(getLevelResults(ownerKey))
    }
    reload()
    window.addEventListener(CAMPAIGN_PROGRESS_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(CAMPAIGN_PROGRESS_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [ownerKey])

  // Signed in: merge this device's progress up and the server's best down (no-op offline)
  useEffect(() => {
    if (user?.id) void syncCampaignProgress(user.id)
  }, [user?.id])

  const levelIds = ARTHA_YATRA_LEVELS.map(l => l.id)
  const unlocked = (id: string) => isLevelUnlocked(levelIds, id, stars)
  const currentLevelId = levelIds.find(id => unlocked(id) && !completedLevels.includes(id)) ?? null
  const totalLevels = ARTHA_YATRA_LEVELS.length
  const doneCount = levelIds.filter(id => completedLevels.includes(id)).length
  const starCount = totalStars(levelIds, stars)

  // ?level=level_N opens that level's intro (home hero links here)
  const introLevelId = params.get('level')
  const introIndex = introLevelId && unlocked(introLevelId) ? levelIds.indexOf(introLevelId) : -1
  const introLevel = introIndex >= 0 ? ARTHA_YATRA_LEVELS[introIndex] : null
  const openIntro = (id: string) => setParams(p => { p.set('level', id); return p })
  const closeIntro = () => setParams(p => { p.delete('level'); return p }, { replace: true })

  const statusOf = (id: string): Status =>
    !unlocked(id) ? 'locked' : completedLevels.includes(id) ? 'done' : id === currentLevelId ? 'current' : 'open'

  return (
    <div className="page page--tabbar campaign">
      <header className="screen-bar">
        <Button variant="ghost" icon={<ArrowLeft size={22} />} aria-label={t('common.back')} onClick={() => navigate('/dashboard')} className="screen-bar__back" />
        <h1 className="screen-bar__title">{t('campaign.mapTitle')}</h1>
        <div className="screen-bar__actions">
          <span className="chip chip--risk campaign__stars-chip" aria-label={t('campaign.starsAria', { n: starCount, total: totalLevels * 3 })}>
            <Star size={16} aria-hidden="true" /> <span className="num">{starCount} / {totalLevels * 3}</span>
          </span>
        </div>
      </header>

      <main className="page__main page__main--list campaign__main">
        <h2 className="page-title">{t('campaign.headline')}</h2>
        <p className="lede campaign__lede">{t('campaign.lede')}</p>
        <Progress
          value={doneCount}
          max={totalLevels}
          tone="haldi"
          ariaLabel={t('campaign.progress')}
          label={t('campaign.doneOf', { n: doneCount, total: totalLevels })}
          className="campaign__progress"
        />

        <div className="trail">
          <svg className="trail__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M12 6 C 12 30, 88 20, 88 40 S 12 56, 12 74 S 88 86, 88 98" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="trail__stops">
          {ARTHA_YATRA_LEVELS.map((level, index) => (
            <Stop
              key={level.id}
              level={level}
              index={index}
              status={statusOf(level.id)}
              stars={stars[level.id] ?? 0}
              bestNetWorth={results[level.id]?.bestNetWorth ?? 0}
              onOpen={() => openIntro(level.id)}
            />
          ))}
          </ol>
        </div>
      </main>

      <TabBar active="campaign" />

      {introLevel && (
        <LevelIntro
          level={introLevel}
          levelNumber={introIndex + 1}
          best={results[introLevel.id] ?? null}
          onClose={closeIntro}
          onStart={() => navigate(`/game/level/${introLevel.id}`, { replace: false })}
        />
      )}
    </div>
  )
}

function Stop({ level, index, status, stars, onOpen }: {
  level: LevelConfig; index: number; status: Status; stars: number; bestNetWorth: number; onOpen: () => void
}) {
  const { t } = useTranslation()
  const text = useLevelText(level)
  const Icon = levelIcon(index)
  const right = index % 2 === 1
  const locked = status === 'locked'
  const current = status === 'current'
  const n = index + 1

  return (
    <li className={`stop stop--${status}${right ? ' stop--right' : ''}`}>
      <button
        type="button"
        className="stop__node"
        onClick={locked ? undefined : onOpen}
        disabled={locked}
        aria-label={locked ? t('campaign.lockedAria', { name: text.name }) : t('campaign.openAria', { name: text.name })}
      >
        <span className="stop__n num" aria-hidden="true">{n}</span>
        <Icon size={36} strokeWidth={2.25} aria-hidden="true" />
        {current && <Gullu mood="cheer" size={56} className="stop__gullu" />}
      </button>
      <Panel
        className={`stop__card${locked ? '' : ' is-tappable'}`}
        onClick={locked || current ? undefined : onOpen}
      >
        <p className="caption">{t('campaign.ageStage', { age: text.age, stage: text.stage })}</p>
        <h3 className="stop__name">{text.name}</h3>
        <p className="stop__idea">{text.idea}</p>
        {locked ? (
          <p className="stop__lock"><Lock size={15} aria-hidden="true" /> {t('campaign.unlockNeed', { count: STARS_TO_UNLOCK_NEXT, n: index })}</p>
        ) : current ? (
          <Button block icon={<Play size={18} aria-hidden="true" />} onClick={onOpen} className="stop__play">{t('campaign.play')}</Button>
        ) : (
          <div className="stop__stars" role="img" aria-label={t('campaign.stars.earned', { n: stars })}>
            {[0, 1, 2].map(i => <Star key={i} size={20} aria-hidden="true" className={i < stars ? 'is-on' : ''} />)}
          </div>
        )}
      </Panel>
    </li>
  )
}
