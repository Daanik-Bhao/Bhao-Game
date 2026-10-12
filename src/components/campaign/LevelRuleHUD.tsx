import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { GameState } from '../../types/game'
import { formatWealth } from '../../types/game'
import { ASSETS } from '../../data/assets'
import { activeRule, hasHealthCover, ruleHumanIndex, slotsUsed } from '../../lib/levelRules'
import { RULE_ICONS } from './LevelIntro'

const rupees = (n: number) => `₹${formatWealth(Math.max(0, Math.round(n)))}`

function Bar({ pct, color, marker }: { pct: number; color: string; marker?: number }) {
  return (
    <div style={{ position: 'relative', height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.5s' }} />
      {marker !== undefined && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${marker}%`, width: 2, background: '#111827', opacity: 0.35 }} />
      )}
    </div>
  )
}

const chip: CSSProperties = {
  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.06)', whiteSpace: 'nowrap',
}

/**
 * Compact in-game panel for the level's signature rule (campaign only; renders nothing
 * otherwise). Drop-in replacement for the empty `LevelHUD` in the game board.
 */
export function LevelRuleHUD({ state, compact = false }: { state: GameState; compact?: boolean }) {
  const { t } = useTranslation()
  const rule = activeRule(state)
  const ls = state.levelState
  const idx = ruleHumanIndex(state)
  if (!rule || !ls || idx < 0) return null
  const player = state.players[idx]
  const round = state.round ?? 1
  const latest = ls.ruleEvents?.[0]
  const showLatest = !compact && latest && latest.round >= round - 1

  let body: ReactNode = null
  if (rule === 'desire_meter' && ls.desire) {
    const d = ls.desire
    const pct = (d.value / d.max) * 100
    const color = d.value >= d.max - d.yearlyRise ? '#dc2626' : d.value >= d.plannedThreshold ? '#f59e0b' : '#10b981'
    body = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
          <span>{t('campaign.hud.desire')} {d.value}/{d.max}</span>
          {d.value >= d.plannedThreshold && <span style={{ color: '#b45309' }}>🎁 {t('campaign.hud.plannedZone')}</span>}
        </div>
        <Bar pct={pct} color={color} marker={(d.plannedThreshold / d.max) * 100} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={chip}>🎁 {t('campaign.hud.treats', { n: d.plannedTreats })}</span>
          <span style={{ ...chip, color: d.impulseSplurges ? '#b91c1c' : undefined }}>🌕 {t('campaign.hud.splurges', { n: d.impulseSplurges })}</span>
        </div>
      </>
    )
  } else if (rule === 'saving_streak' && ls.streak) {
    const s = ls.streak
    const sip = Math.min(s.current, s.cap) * s.sipStep
    body = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 18 }} aria-label={t('campaign.hud.streak', { n: s.current })}>
          {Array.from({ length: s.cap }, (_, i) => (
            <span key={i} style={{ opacity: i < s.current ? 1 : 0.2 }}>🔥</span>
          ))}
          {s.current > s.cap && <span style={{ fontSize: 12, fontWeight: 800 }}>+{s.current - s.cap}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={chip}>{t('campaign.hud.streak', { n: s.current })}</span>
          <span style={chip}>{t('campaign.hud.bestStreak', { n: s.best })}</span>
          {sip > 0 && <span style={{ ...chip, color: '#047857' }}>🔁 {t('campaign.hud.nextSip', { amount: rupees(sip) })}</span>}
        </div>
      </>
    )
  } else if (rule === 'lifestyle_creep' && ls.creep) {
    const c = ls.creep
    const used = slotsUsed(player)
    body = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, gap: 8 }}>
          <span>💼 {t('campaign.hud.salary', { amount: rupees(c.salary) })}</span>
          <span style={{ color: c.lifestylePct > 60 ? '#b91c1c' : '#374151' }}>{t('campaign.hud.lifestyle', { pct: c.lifestylePct })}</span>
        </div>
        <Bar pct={c.lifestylePct} color={c.lifestylePct > 80 ? '#dc2626' : c.lifestylePct > 60 ? '#f59e0b' : '#10b981'} marker={60} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={chip}>{t('campaign.hud.slots', { used: used.length, total: c.slots })}</span>
          {Array.from({ length: c.slots }, (_, i) => (
            <span key={i} title={used[i] ? ASSETS[used[i]].name : ''} style={{
              width: 26, height: 26, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: used[i] ? '1px solid #a7f3d0' : '1px dashed #9ca3af', background: used[i] ? '#ecfdf5' : 'transparent', fontSize: 14,
            }}>
              {used[i] ? ASSETS[used[i]].emoji : ''}
            </span>
          ))}
        </div>
      </>
    )
  } else if (rule === 'grihastha' && ls.family) {
    const insured = hasHealthCover(player)
    body = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ls.family.goals.map(g => {
            const icon = g.id === 'home' ? '🏡' : g.id === 'education' ? '🎓' : '🏥'
            const color = g.status === 'met' ? '#047857' : g.status === 'pending' ? (g.dueRound - round <= 2 ? '#b45309' : '#374151') : '#b91c1c'
            return (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
                <span>{icon} {t(`campaign.goals.${g.id}`)}{g.id !== 'parents_health' && g.status === 'pending' ? ` · ${rupees(g.amount)}` : ''}</span>
                <span style={{ fontWeight: 700, color, whiteSpace: 'nowrap' }}>{t(`campaign.goals.status.${g.status}`, { year: g.dueRound })}</span>
              </div>
            )
          })}
        </div>
        <span style={{ ...chip, alignSelf: 'flex-start', color: insured ? '#047857' : '#b91c1c' }}>
          {insured ? '🛡️ ' + t('campaign.hud.insured') : '⚠️ ' + t('campaign.hud.notInsured')}
        </span>
      </>
    )
  }
  if (!body) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.92)', border: '1px solid #e5e7eb', borderRadius: 12, padding: compact ? 8 : 10,
      display: 'flex', flexDirection: 'column', gap: 6, color: '#1f2937', fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4, color: '#92400e' }}>
        {RULE_ICONS[rule]} {t(`campaign.rules.${rule}.name`)}
      </div>
      {body}
      {showLatest && latest && (
        <div style={{ fontSize: 12, color: '#4b5563', borderTop: '1px solid #f3f4f6', paddingTop: 6 }}>
          {t(latest.key, { ...(latest.params ?? {}), defaultValue: latest.text })}
        </div>
      )}
    </div>
  )
}
