import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Flame, Gift, GraduationCap, House, HeartPulse, Briefcase, ShieldCheck, ShieldAlert, Zap, Target } from 'lucide-react'
import type { GameState } from '../../types/game'
import { ASSETS } from '../../data/assets'
import { activeRule, hasHealthCover, ruleHumanIndex, slotsUsed } from '../../lib/levelRules'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import { assetName } from '../game/economyUi'
import { Chip, Progress } from '../ui'
import './campaign.css'

/**
 * Short text for the level-rule pill on the table (spec §E.7), e.g. "Desire 62%", "Streak 3",
 * "Lifestyle 45%", "Goals 1/3". null outside campaign levels.
 */
export function levelRulePillText(state: GameState, t: TFunction): string | null {
  const rule = activeRule(state)
  const ls = state.levelState
  if (!rule || !ls) return null
  if (rule === 'desire_meter' && ls.desire) return t('campaign.pill.desire', { pct: Math.round((ls.desire.value / ls.desire.max) * 100) })
  if (rule === 'saving_streak' && ls.streak) return t('campaign.pill.streak', { n: ls.streak.current })
  if (rule === 'lifestyle_creep' && ls.creep) return t('campaign.pill.lifestyle', { pct: ls.creep.lifestylePct })
  if (rule === 'grihastha' && ls.family) {
    const done = ls.family.goals.filter(g => g.status === 'met').length
    return t('campaign.pill.goals', { done, total: ls.family.goals.length })
  }
  return t(`campaign.rules.${rule}.name`)
}

/**
 * The level's signature rule (campaign only; renders nothing otherwise). Shown in a paper
 * popover / sheet from the rule pill on the table. Meters are D.9 progress bars with labels.
 */
export function LevelRuleHUD({ state, compact = false }: { state: GameState; compact?: boolean }) {
  const { t } = useTranslation()
  const lang = useLang()
  const rule = activeRule(state)
  const ls = state.levelState
  const idx = ruleHumanIndex(state)
  if (!rule || !ls || idx < 0) return null
  const player = state.players[idx]
  const round = state.round ?? 1
  const latest = ls.ruleEvents?.[0]
  const showLatest = !compact && latest && latest.round >= round - 1
  const money = (n: number) => formatMoney(Math.max(0, n), { compact: true, lang })

  let body: ReactNode = null
  if (rule === 'desire_meter' && ls.desire) {
    const d = ls.desire
    const hot = d.value >= d.max - d.yearlyRise
    const treat = d.value >= d.plannedThreshold
    body = (
      <>
        <Progress
          value={d.value}
          max={d.max}
          tone={hot ? 'haldi' : 'save'}
          ariaLabel={t('campaign.hud.desire')}
          label={`${t('campaign.hud.desire')} ${d.value}/${d.max}`}
          className={hot ? 'rule-meter is-hot' : 'rule-meter'}
        />
        <div className="rule-chips">
          {treat && <Chip tone="risk" icon={<Gift size={14} aria-hidden="true" />}>{t('campaign.hud.plannedZone')}</Chip>}
          <Chip icon={<Gift size={14} aria-hidden="true" />}>{t('campaign.hud.treats', { n: d.plannedTreats })}</Chip>
          <Chip tone={d.impulseSplurges ? 'attack' : 'neutral'} icon={<Zap size={14} aria-hidden="true" />}>{t('campaign.hud.splurges', { n: d.impulseSplurges })}</Chip>
        </div>
      </>
    )
  } else if (rule === 'saving_streak' && ls.streak) {
    const s = ls.streak
    const sip = Math.min(s.current, s.cap) * s.sipStep
    body = (
      <>
        <div className="rule-flames" role="img" aria-label={t('campaign.hud.streak', { n: s.current })}>
          {Array.from({ length: s.cap }, (_, i) => (
            <Flame key={i} size={22} aria-hidden="true" className={i < s.current ? 'is-on' : ''} />
          ))}
          {s.current > s.cap && <b className="num">+{s.current - s.cap}</b>}
        </div>
        <div className="rule-chips">
          <Chip>{t('campaign.hud.streak', { n: s.current })}</Chip>
          <Chip>{t('campaign.hud.bestStreak', { n: s.best })}</Chip>
          {sip > 0 && <Chip tone="save">{t('campaign.hud.nextSip', { amount: money(sip) })}</Chip>}
        </div>
      </>
    )
  } else if (rule === 'lifestyle_creep' && ls.creep) {
    const c = ls.creep
    const used = slotsUsed(player)
    body = (
      <>
        <p className="rule-line"><Briefcase size={16} aria-hidden="true" /> {t('campaign.hud.salary', { amount: money(c.salary) })}</p>
        <Progress
          value={c.lifestylePct}
          max={100}
          tone={c.lifestylePct > 60 ? 'haldi' : 'save'}
          ariaLabel={t('campaign.hud.lifestyle', { pct: c.lifestylePct })}
          label={t('campaign.hud.lifestyle', { pct: c.lifestylePct })}
        />
        <div className="rule-chips">
          <Chip>{t('campaign.hud.slots', { used: used.length, total: c.slots })}</Chip>
          {Array.from({ length: c.slots }, (_, i) => (
            <span key={i} className={`rule-slot${used[i] ? ' is-used' : ''}`}>{used[i] ? assetName(ASSETS[used[i]]) : '—'}</span>
          ))}
        </div>
      </>
    )
  } else if (rule === 'grihastha' && ls.family) {
    const insured = hasHealthCover(player)
    body = (
      <>
        <ul className="rule-goals">
          {ls.family.goals.map(g => {
            const Icon = g.id === 'home' ? House : g.id === 'education' ? GraduationCap : HeartPulse
            const tone = g.status === 'met' ? 'is-met' : g.status === 'pending' ? (g.dueRound - round <= 2 ? 'is-soon' : '') : 'is-missed'
            return (
              <li key={g.id} className="rule-goal">
                <span><Icon size={16} aria-hidden="true" /> {t(`campaign.goals.${g.id}`)}{g.id !== 'parents_health' && g.status === 'pending' ? ` · ${money(g.amount)}` : ''}</span>
                <b className={tone}>{t(`campaign.goals.status.${g.status}`, { year: g.dueRound })}</b>
              </li>
            )
          })}
        </ul>
        <Chip tone={insured ? 'defence' : 'attack'} icon={insured ? <ShieldCheck size={14} aria-hidden="true" /> : <ShieldAlert size={14} aria-hidden="true" />}>
          {insured ? t('campaign.hud.insured') : t('campaign.hud.notInsured')}
        </Chip>
      </>
    )
  }
  if (!body) return null

  return (
    <div className={`rule-hud paper${compact ? ' is-compact' : ''}`}>
      <p className="rule-hud__title"><Target size={16} aria-hidden="true" /> {t(`campaign.rules.${rule}.name`)}</p>
      {body}
      {showLatest && latest && <p className="rule-hud__latest">{t(latest.key, { ...(latest.params ?? {}), defaultValue: latest.text })}</p>}
    </div>
  )
}
