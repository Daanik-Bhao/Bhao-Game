import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Clock } from 'lucide-react'
import { Button, Chip, DCoin, EmptyState, Panel, Progress, Skeleton, buttonClass, useToastPlacement, type ChipTone } from '../../components/ui'
import { TabBar } from '../../components/nav/TabBar'
import '../menus.css'

/** `daily_contracts` row (fields the screen uses). */
export interface ContractRow {
  id: string
  title: string
  description?: string | null
  difficulty: string
  is_weekly?: boolean | null
  requirement_value: number
  reward_dc: number
  reward_card_tier?: string | null
}

export type ContractProgress = Record<string, { progress: number; completed: boolean }>

const DIFFICULTY_TONE: Record<string, ChipTone> = { easy: 'save', medium: 'risk', hard: 'attack' }

/** "5h 12m" until local midnight (same rule as before). */
function untilMidnight(now = new Date()): { h: number; m: number } {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  const diff = next.getTime() - now.getTime()
  return { h: Math.floor((diff / 3_600_000) % 24), m: Math.floor((diff / 60_000) % 60) }
}

export interface ContractsViewProps {
  contracts: ContractRow[]
  progress: ContractProgress
  loading: boolean
  onBack?: () => void
}

/** Full Daily contracts screen (opened from the Home card; Dashboard tab state `contracts`). */
export function ContractsView({ contracts, progress, loading, onBack }: ContractsViewProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [left, setLeft] = useState(() => untilMidnight())
  useToastPlacement('bottom')

  useEffect(() => {
    const id = setInterval(() => setLeft(untilMidnight()), 60_000)
    return () => clearInterval(id)
  }, [])

  const started = Object.keys(progress).length > 0

  return (
    <div className="page page--tabbar">
      <header className="screen-bar">
        <Button variant="ghost" className="screen-bar__back" icon={<ArrowLeft size={22} aria-hidden="true" />} aria-label={t('common.back')} onClick={onBack ?? (() => navigate('/dashboard'))} />
        <h1 className="screen-bar__title">{t('contracts.title')}</h1>
      </header>
      <main className="page__main page__main--list ct">
        <p className="ct__reset"><Clock size={18} strokeWidth={2.25} aria-hidden="true" />{t('contracts.resetsInTime', { h: left.h, m: left.m })}</p>

        {loading ? (
          <div className="ct__list" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} height={120} className="lb__skeleton" />)}
          </div>
        ) : contracts.length === 0 ? (
          <EmptyState title={t('contracts.emptyTitle')} body={t('contracts.empty')} />
        ) : (
          <>
            {!started && (
              <Panel className="ct__start">
                <p className="ct__start-title">{t('contracts.startTitle')}</p>
                <p className="ct__start-body">{t('contracts.startDesc')}</p>
                <Link to="/game?mode=practice" className={buttonClass('primary', 's')}>{t('leaderboard.playNow')}</Link>
              </Panel>
            )}
            <ul className="ct__list">
              {contracts.map(c => {
                const p = progress[c.id]?.progress ?? 0
                const done = progress[c.id]?.completed ?? false
                const need = Math.max(1, c.requirement_value)
                const shown = Math.min(p, need)
                return (
                  <li key={c.id} className={`panel ct-row${done ? ' is-done' : ''}`}>
                    <div className="ct-row__chips">
                      <Chip tone={DIFFICULTY_TONE[c.difficulty] ?? 'neutral'}>{t(`contracts.difficulty.${c.difficulty}`, { defaultValue: c.difficulty })}</Chip>
                      {c.is_weekly && <Chip tone="brand">{t('contracts.weekly')}</Chip>}
                      {done && <Chip tone="solid-save" icon={<Check size={14} strokeWidth={3} aria-hidden="true" />}>{t('contracts.complete')}</Chip>}
                    </div>
                    <h2 className="ct-row__title">{c.title}</h2>
                    {c.description && <p className="ct-row__desc">{c.description}</p>}
                    <Progress
                      value={shown}
                      max={need}
                      tone={done ? 'save' : 'haldi'}
                      label={<span className="num">{shown}/{need}</span>}
                      valueText={`${shown}/${need}`}
                      ariaLabel={c.title}
                    />
                    <p className="ct-row__reward">
                      <DCoin />
                      <span>{t('contracts.reward', { n: c.reward_dc })}</span>
                      {c.reward_card_tier && <span className="ct-row__card">{t('contracts.cardReward', { tier: t(`card.tier.${c.reward_card_tier}`, { defaultValue: c.reward_card_tier }) })}</span>}
                    </p>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </main>
      <TabBar />
    </div>
  )
}
