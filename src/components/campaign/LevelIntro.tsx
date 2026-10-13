import { useTranslation } from 'react-i18next'
import { Briefcase, GraduationCap, House, Play, Sprout, Target, type LucideIcon } from 'lucide-react'
import type { LevelConfig } from '../../types/level'
import { getLevelRule, levelStarCriteria } from '../../lib/levelRules'
import type { LevelResult } from '../../lib/campaignProgress'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import { Button, Sheet } from '../ui'
import { Gullu } from '../mascot/Gullu'
import { LevelStars } from './LevelStars'
import './campaign.css'

/** Node icon per level (spec §E.5): sprout, graduation-cap, briefcase, house. */
export const LEVEL_ICONS: LucideIcon[] = [Sprout, GraduationCap, Briefcase, House]
export function levelIcon(index: number): LucideIcon {
  return LEVEL_ICONS[index] ?? Target
}

/** @deprecated emoji icons were replaced by lucide (LEVEL_ICONS); kept for old imports. */
export const RULE_ICONS: Record<string, string> = {}

export interface LevelIntroProps {
  level: LevelConfig
  /** 1-based level number */
  levelNumber: number
  /** Best result so far (shows stars earned + best net worth) */
  best?: LevelResult | null
  onStart: () => void
  onClose: () => void
  /** Controlled visibility (default true: mount = open) */
  open?: boolean
}

/** Level name / age / stage / idea from i18n (campaign.levels.level_N.*), falling back to the level data. */
export function useLevelText(level: LevelConfig) {
  const { t } = useTranslation()
  return {
    name: t(`campaign.levels.${level.id}.name`, { defaultValue: level.name }),
    age: t(`campaign.levels.${level.id}.age`, { defaultValue: level.ageRange }),
    stage: t(`campaign.levels.${level.id}.stage`, { defaultValue: level.lifeStage }),
    idea: t(`campaign.levels.${level.id}.idea`, { defaultValue: level.mainLearning }),
  }
}

/**
 * Level intro (spec §E.6): bottom sheet on phone portrait, centred dialog elsewhere.
 * Caption, title, "the one idea" callout with Gullu, goal, rule card, stars checklist,
 * sticky footer with Start (primary L) + Not now.
 */
export function LevelIntro({ level, levelNumber, best, onStart, onClose, open = true }: LevelIntroProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const text = useLevelText(level)
  const rule = getLevelRule(level)
  const criteria = levelStarCriteria(level)
  const ruleText = (k: string, fallback: string) => (rule ? t(`campaign.rules.${rule}.${k}`, { defaultValue: fallback }) : fallback)
  const Icon = levelIcon(levelNumber - 1)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      placement="auto-center"
      title={text.name}
      className="level-intro"
      header={
        <div className="level-intro__head">
          <span className="level-intro__icon" aria-hidden="true"><Icon size={28} strokeWidth={2.25} /></span>
          <div className="level-intro__titles">
            <p className="caption">{t('campaign.intro.levelOf', { n: levelNumber, age: text.age })}</p>
            <p className="level-intro__title" aria-hidden="true">{text.name}</p>
          </div>
        </div>
      }
      footer={
        <>
          <Button size="l" block icon={<Play size={20} aria-hidden="true" />} onClick={onStart} data-autofocus>{t('campaign.intro.start')}</Button>
          <Button variant="ghost" block onClick={onClose}>{t('campaign.intro.notNow')}</Button>
        </>
      }
    >
      <div className="level-intro__body">
        <section className="level-intro__idea">
          <Gullu mood="think" size={56} />
          <div>
            <h3 className="caption level-intro__idea-label">{t('campaign.intro.oneIdea')}</h3>
            <p className="level-intro__idea-text">{ruleText('idea', level.mechanicDescription)}</p>
          </div>
        </section>

        <p className="level-intro__goal">
          <Target size={20} aria-hidden="true" />
          <span>{t('campaign.intro.goalShort', { target: formatMoney(level.targetCorpus, { compact: true, lang }), years: level.turnLimit })}</span>
        </p>
        <p className="level-intro__rivals">{t('campaign.intro.rivalsLine', { count: level.botCount })}</p>

        <section className="panel level-intro__rule">
          <h3 className="section-title">{ruleText('name', level.mechanicName)}</h3>
          <ol className="level-intro__how">
            {rule
              ? (['how1', 'how2', 'how3'] as const).map(k => <li key={k}>{t(`campaign.rules.${rule}.${k}`)}</li>)
              : <li>{level.mechanicDescription}</li>}
          </ol>
        </section>

        <section>
          <h3 className="section-title level-intro__stars-title">{t('campaign.intro.earnStars')}</h3>
          <LevelStars stars={best?.stars ?? 0} size={24} criteria={criteria} align="start" />
          {best && best.bestNetWorth > 0 && (
            <p className="level-intro__best">{t('campaign.intro.yourBest', { nw: formatMoney(best.bestNetWorth, { compact: true, lang }) })}</p>
          )}
        </section>
      </div>
    </Sheet>
  )
}
