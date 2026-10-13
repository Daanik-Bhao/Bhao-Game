import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartLine, Flame, Info, PiggyBank, Shield, TrendingDown, TrendingUp, Wallet, type LucideIcon } from 'lucide-react'
import type { AssetClass, DecisionChoice, GameCard, GameState, PlayerState } from '../../types/game'
import { ASSETS, MAX_LIFESTYLE_LEVEL } from '../../data/assets'
import { Chip, Progress } from '../ui'
import { formatMoney, formatPct } from '../../lib/format'
import { MAX_ACTIVE_DEFENSES } from '../../lib/gameEngine'
import { pickLang } from '../../i18n/lang'
import { sortDecisionOptions } from './boardUtils'
import {
  RISK_TONE, assetName, cardNameFor, defenseBlurb, describeDecision, portfolioView, riskLabel, rupees, signedRupees, yearLabel,
} from './economyUi'
import { AnimatedNumber } from '../AnimatedNumber'
import './EconomyPanels.css'

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

export function RiskChip({ asset }: { asset: AssetClass }) {
  const info = ASSETS[asset]
  return <Chip tone={RISK_TONE[info.risk]}>{riskLabel(info.risk)}</Chip>
}

/** Lifestyle 5-segment meter (spend-on-dark on the table, spend on paper). */
export function LifestyleMeter({ level, className = '' }: { level: number; className?: string }) {
  const { t } = useTranslation()
  return (
    <span className={`life-meter ${className}`.trim()} role="img" aria-label={t('econ.lifestyle', { level })}>
      {Array.from({ length: MAX_LIFESTYLE_LEVEL }, (_, i) => <i key={i} className={i < level ? 'is-on' : ''} />)}
    </span>
  )
}

const CHOICE_ICON: Record<DecisionChoice, LucideIcon> = { spend: Wallet, save: PiggyBank, invest: ChartLine }
export function choiceIcon(c: DecisionChoice): LucideIcon { return CHOICE_ICON[c] }

// ---------------------------------------------------------------------------
// Choice tiles (decision sheet, spec §E.13)
// ---------------------------------------------------------------------------

interface ChoiceTilesProps {
  state: GameState
  playerIndex: number
  card: GameCard
  onDecision: (choice: DecisionChoice) => void
  /** Read-only preview (not your turn / not chosen yet) */
  disabled?: boolean
}

export function ChoiceTiles({ state, playerIndex, card, onDecision, disabled }: ChoiceTilesProps) {
  const { t, i18n } = useTranslation()
  const hi = i18n.language === 'hi'
  return (
    <div className="choices econ-dopts" data-tour="choices" role="group" aria-label={t('board.choicesAria')}>
      {sortDecisionOptions(card.options).map(opt => {
        const view = describeDecision(state, playerIndex, card, opt)
        const Icon = CHOICE_ICON[opt.type]
        const chip = t(`econ.choice.${opt.type}`)
        const generic = !opt.label || ['spend', 'save', 'invest'].includes(opt.label.toLowerCase())
        const label = pickLang(opt.shortLabel || opt.label, opt.shortLabelHi || opt.labelHi, i18n.language)
        const title = !generic
          ? label
          : opt.type === 'invest' && view.asset ? assetName(view.asset) : t(`board.choiceTitle.${opt.type}`)
        const desc = pickLang(opt.shortDescription || opt.description, opt.shortDescriptionHi || opt.descriptionHi, i18n.language)
        // Hindi has no option text in the card data: use the translated consequence instead of English.
        const why = view.disabled ?? (hi && !(opt.shortDescriptionHi || opt.descriptionHi) ? view.hint : desc || view.hint)
        const amount = opt.type === 'invest'
          ? (view.asset ? t('board.perYear', { pct: view.asset.meanPct }) : '—')
          : view.headline
        const investAmount = opt.type === 'invest' && view.details.length ? view.details[view.details.length - 1] : null
        const off = disabled || !!view.disabled
        return (
          <button
            key={opt.type}
            type="button"
            className={`choice choice--${opt.type} econ-dopt-${opt.type}${view.disabled ? ' is-disabled' : ''}`}
            data-tour={`choice-${opt.type}`}
            disabled={off}
            aria-disabled={off || undefined}
            aria-label={`${chip}: ${title}, ${amount}. ${why ?? ''}`}
            onClick={() => !off && onDecision(opt.type)}
          >
            <span className="choice__stripe" aria-hidden="true" />
            <span className="choice__top">
              <span className={`chip chip--solid-${opt.type}`}><Icon size={13} strokeWidth={2.5} aria-hidden="true" />{chip}</span>
              <span className="choice__title">{title}</span>
            </span>
            <span className="choice__amt num">{amount}</span>
            {why && <span className={`choice__why${view.disabled ? ' is-warn' : ''}`}>{why}</span>}
            {opt.type === 'invest' && view.asset && !view.disabled && (
              <span className="choice__tags">
                <RiskChip asset={view.asset.id} />
                {investAmount && <Chip>{investAmount}</Chip>}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Portfolio (sheet E.15 and desktop left column E.24)
// ---------------------------------------------------------------------------

function InfoTip({ term }: { term: 'netWorth' | 'inflation' | 'sip' | 'fd' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <span className="info-tip">
      <button type="button" className="info-tip__btn" aria-expanded={open} aria-label={t('board.define', { term: t(`board.term.${term}`) })} onClick={() => setOpen(o => !o)}>
        <Info size={16} strokeWidth={2.25} aria-hidden="true" />
      </button>
      {open && <span className="info-tip__text" role="note">{t(`board.termDef.${term}`)}</span>}
    </span>
  )
}

/** Net worth + goal bar + cash / invested / lifestyle rows. */
export function MoneySummary({ player, goal, rank, total, variant }: { player: PlayerState; goal: number; rank?: number; total?: number; variant: 'sheet' | 'column' }) {
  const { t, i18n } = useTranslation()
  const v = portfolioView(player, goal)
  const lang = i18n.language
  const pct = Math.round(v.progress * 100)
  const goalText = t('board.goalPct', { pct, goal: formatMoney(goal, { compact: true, lang }) })
  return (
    <div className={`money money--${variant}`}>
      <div className="money__nw">
        <span className="money__cap caps">{t('econ.netWorth')}{variant === 'sheet' && <InfoTip term="netWorth" />}</span>
        <span className="money__big num"><AnimatedNumber value={v.netWorth} formatFn={n => formatMoney(n, { lang })} /></span>
      </div>
      {variant === 'column' && rank !== undefined && total !== undefined && (
        <div className="money__rankrow">
          <YearDeltaText player={player} />
          <span className="money__rank">{t('board.rankOf', { rank, total })}</span>
        </div>
      )}
      <Progress value={pct} max={100} tone="goal" label={goalText} ariaLabel={t('board.goalAria')} />
      <ul className="money__rows">
        <li>
          <span className="money__row-label"><Wallet size={16} strokeWidth={2.25} aria-hidden="true" />{t('econ.cash')}</span>
          <b className="num">{formatMoney(v.cash, { lang })}</b>
          {variant === 'sheet' && <small className="money__note">{t('board.cashNote', { pct: v.inflation })}<InfoTip term="inflation" /></small>}
        </li>
        <li>
          <span className="money__row-label"><ChartLine size={16} strokeWidth={2.25} aria-hidden="true" />{t('econ.invested')}</span>
          <b className="num">{formatMoney(v.invested, { lang })}</b>
        </li>
        <li>
          <span className="money__row-label"><Flame size={16} strokeWidth={2.25} aria-hidden="true" />{t('board.lifestyle')}</span>
          <LifestyleMeter level={v.lifestyleLevel} />
          {variant === 'sheet' && <small className="money__note">{t('board.lifestyleNote')}</small>}
        </li>
      </ul>
    </div>
  )
}

export function YearDeltaText({ player }: { player: PlayerState }) {
  const { t, i18n } = useTranslation()
  const hist = player.stats?.netWorthByRound
  const start = hist && hist.length ? hist[hist.length - 1] : null
  if (start === null) return <span />
  const diff = portfolioView(player, 1).netWorth - start
  const up = diff >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}>
      <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
      {t('board.thisYear', { amount: formatMoney(Math.abs(diff), { lang: i18n.language }) })}
    </span>
  )
}

export function InvestmentsList({ player, max }: { player: PlayerState; max?: number }) {
  const { t, i18n } = useTranslation()
  const v = portfolioView(player, 1)
  const list = max ? v.holdings.slice(0, max) : v.holdings
  if (list.length === 0) return <p className="invest-empty">{t('econ.noInvestments')}</p>
  return (
    <ul className="invest-list" aria-label={t('econ.investments')}>
      {list.map(h => {
        const info = ASSETS[h.asset]
        const up = h.lastChangePct >= 0
        const Icon = up ? TrendingUp : TrendingDown
        return (
          <li key={h.id}>
            <span className="invest-list__name">
              {cardNameFor(h.name)}
              <small>{assetName(info)} · {riskLabel(info.risk)}</small>
            </span>
            <span className="invest-list__value">
              <b className="num">{formatMoney(h.value, { lang: i18n.language })}</b>
              {h.lastChangePct !== 0 && (
                <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}>
                  <Icon size={12} strokeWidth={2.5} aria-hidden="true" />{formatPct(Math.abs(h.lastChangePct), { signed: false, digits: 0 })}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function ShieldsList({ player, showBlurb }: { player: PlayerState; showBlurb?: boolean }) {
  const { t, i18n } = useTranslation()
  const shields = player.activeDefenses ?? []
  if (shields.length === 0) return <p className="invest-empty">{t('econ.noDefenses')}</p>
  return (
    <ul className="shield-list">
      {shields.map(d => (
        <li key={d.id}>
          <span className="shield-chip"><Shield size={14} strokeWidth={2.5} aria-hidden="true" />{i18n.language === 'hi' ? (d.shortNameHi || d.nameHi || d.shortName || d.name) : (d.shortName || d.name)}</span>
          {showBlurb && <small>{defenseBlurb(d)}</small>}
        </li>
      ))}
    </ul>
  )
}

/** Portfolio sheet body (spec §E.15). */
export function PortfolioPanel({ player, goal }: { player: PlayerState; goal: number }) {
  const { t } = useTranslation()
  return (
    <div className="portfolio econ-portfolio">
      <MoneySummary player={player} goal={goal} variant="sheet" />
      <section className="portfolio__section">
        <h3 className="portfolio__h caps">{t('econ.investments')}<InfoTip term="sip" /></h3>
        <InvestmentsList player={player} />
      </section>
      <section className="portfolio__section econ-defenses" data-tour="shields">
        <h3 className="portfolio__h caps">{t('board.shieldsOf', { n: player.activeDefenses?.length ?? 0, max: MAX_ACTIVE_DEFENSES })}</h3>
        <ShieldsList player={player} showBlurb />
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Year summary (sheet, spec §E.16)
// ---------------------------------------------------------------------------

export interface YearSummary {
  round: number
  market: { asset: AssetClass; pct: number; mine: boolean }[]
  inflationLost?: number
  inflationPct?: number
  investChange: number
  event?: { card: GameCard; good: boolean; myDelta?: number }
}

const DEFAULT_MARKET: AssetClass[] = ['fd', 'gold', 'index', 'equity']

export function summarizeYear(state: GameState, me: PlayerState | null): YearSummary | null {
  const news = state.roundNews
  if (!news) return null
  const tick = state.lastMarketTick && state.lastMarketTick.round === news.round ? state.lastMarketTick.changes : null
  const mine = new Set((me?.holdings ?? []).map(h => h.asset))
  const assets = [...new Set([...mine, ...DEFAULT_MARKET])]
  const market = tick ? assets.filter(a => tick[a] !== undefined).map(a => ({ asset: a, pct: tick[a] ?? 0, mine: mine.has(a) })) : []
  let inflationLost: number | undefined
  let investChange = 0
  if (me) {
    for (const l of news.lines) {
      const m = l.match(/^💸 Inflation ate ₹([\d,]+) of (.+?)'s cash$/)
      if (m && m[2] === me.name) inflationLost = Number(m[1].replace(/,/g, ''))
    }
    for (const h of me.holdings ?? []) {
      if (h.boughtRound >= news.round || !h.lastChangePct) continue
      investChange += h.value - h.value / (1 + h.lastChangePct / 100)
    }
  }
  let event: YearSummary['event']
  const ev = state.lastEvent
  if (ev && ev.round === news.round) {
    let myDelta: number | undefined
    if (me) {
      const line = news.lines.find(l => l.startsWith('🎉 ' + me.name + ': ') || l.startsWith('💥 ' + me.name + ': '))
      const m = line?.match(/: ([+-])₹([\d,]+)$/)
      if (m) myDelta = Number(m[2].replace(/,/g, '')) * (m[1] === '-' ? -1 : 1)
    }
    event = { card: ev.card, good: (ev.card.effect?.value ?? 0) > 0, myDelta }
  }
  return { round: news.round, market, inflationLost, investChange: Math.round(investChange), event }
}

export function YearSummaryView({ state, me }: { state: GameState; me: PlayerState | null }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const s = useMemo(() => summarizeYear(state, me), [state, me])
  const { max } = yearLabel(state)
  if (!s) return <p className="invest-empty">{t('board.yearNothing')}</p>
  return (
    <div className="year-summary">
      <p className="year-summary__lead">{t('board.yearOf', { n: Math.min(s.round, max), max })}</p>
      {s.market.length > 0 && (
        <section className="portfolio__section">
          <h3 className="portfolio__h caps">{t('board.marketThisYear')}</h3>
          <ul className="invest-list">
            {s.market.map(m => {
              const up = m.pct >= 0
              const Icon = up ? TrendingUp : TrendingDown
              return (
                <li key={m.asset}>
                  <span className="invest-list__name">{assetName(ASSETS[m.asset])}{m.mine && <small>{t('board.youHoldThis')}</small>}</span>
                  <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}><Icon size={14} strokeWidth={2.5} aria-hidden="true" />{formatPct(m.pct)}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      <section className="portfolio__section">
        <h3 className="portfolio__h caps">{t('board.yourChange')}</h3>
        <ul className="invest-list">
          <li>
            <span className="invest-list__name">{t('board.inflationOnCash')}</span>
            <b className="num loss">{s.inflationLost ? formatMoney(-s.inflationLost, { lang }) : formatMoney(0, { lang })}</b>
          </li>
          <li>
            <span className="invest-list__name">{t('board.investmentsChange')}</span>
            <b className={`num ${s.investChange >= 0 ? 'gain' : 'loss'}`}>{formatMoney(s.investChange, { signed: true, lang })}</b>
          </li>
          {s.event && (
            <li>
              <span className="invest-list__name">{t('board.lifeEvent', { card: cardNameFor(s.event.card.name) })}</span>
              {s.event.myDelta !== undefined
                ? <b className={`num ${s.event.myDelta >= 0 ? 'gain' : 'loss'}`}>{formatMoney(s.event.myDelta, { signed: true, lang })}</b>
                : <small>{t('board.notYou')}</small>}
            </li>
          )}
        </ul>
      </section>
    </div>
  )
}

export { rupees, signedRupees }
