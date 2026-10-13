import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Confetti from 'react-confetti'
import { ArrowRight, House, Play, RotateCcw, TrendingDown, TrendingUp, Users } from 'lucide-react'
import type { GameState } from '../../types/game'
import type { LevelStarsResult } from '../../lib/levelRules'
import { LevelStars } from '../../components/campaign'
import { GameReportPanel } from '../../components/learning/GameReportPanel'
import { NetWorthSparkline } from '../../components/learning/NetWorthSparkline'
import { Avatar, Button, Chip, Panel, useToast, useToastPlacement } from '../../components/ui'
import { Gullu } from '../../components/mascot/Gullu'
import { formatMoney, formatPct } from '../../lib/format'
import { resultHeadline } from '../../lib/resultHeadline'
import { getNetWorth, getRoundLimit, STARTING_WEALTH } from '../../lib/gameEngine'
import { useLang } from '../../i18n/lang'
import { useReducedEffects } from '../../hooks/useReducedEffects'
import './game-screens.css'

export interface ResultScreenProps {
  gameState: GameState
  humanIndex: number
  /** 'practice' | 'ranked' | 'campaign' | 'multiplayer' */
  mode: string
  levelId?: string
  levelStars: LevelStarsResult | null
  /** Ranked only (0 otherwise) */
  rpChange: number
  ownerKey: string
  onPlayAgain?: () => void
  onHome: () => void
  /** Campaign: set when the next level is unlocked */
  onNextLevel?: () => void
  /** Multiplayer: back to the lobby (primary action) */
  onBackToLobby?: () => void
  onOpenLibrary: () => void
  /** Final order of player ids (multiplayer: the server placements); default = by net worth */
  order?: string[]
}

/** Rolls a number up to `target` in 700 ms (instant with reduced effects). */
function useRollUp(target: number, from: number, reduced: boolean) {
  const [value, setValue] = useState(reduced ? target : from)
  useEffect(() => {
    if (reduced) { setValue(target); return }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 700)
      const eased = 1 - Math.pow(1 - k, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, from, reduced])
  return value
}

/**
 * Result + report card (spec §E.20): light page; headline by rules; net-worth card; campaign
 * stars; final standings; money report card; real-life projection; new Gyaan Library ideas;
 * sticky bottom bar (Home + one primary).
 */
export function ResultScreen({
  gameState, humanIndex, mode, levelStars, rpChange, ownerKey, onPlayAgain, onHome, onNextLevel, onBackToLobby, onOpenLibrary, order,
}: ResultScreenProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const { reduced } = useReducedEffects()
  useToastPlacement('bottom-plain')
  // In-match toasts (bot moves) must not spill over the result page.
  const toast = useToast()
  useEffect(() => { toast.clear() }, [toast])

  const human = gameState.players[humanIndex]
  const stats = human.stats
  const series = stats?.netWorthByRound ?? []
  const start = series[0] ?? gameState.levelConfig?.startingCorpus ?? STARTING_WEALTH
  const final = getNetWorth(human)
  const won = gameState.winner?.id === human.id
  const head = resultHeadline({ won, start, final, goal: gameState.wealthGoal })
  const years = Math.min(gameState.round ?? getRoundLimit(gameState), getRoundLimit(gameState))
  const shown = useRollUp(final, start, reduced)
  const changePct = start > 0 ? ((final - start) / start) * 100 : 0

  const standings = useMemo(() => gameState.players
    .map((p, seat) => ({ p, seat, nw: getNetWorth(p) }))
    .sort((a, b) => (order ? order.indexOf(a.p.id) - order.indexOf(b.p.id) : b.nw - a.nw)), [gameState.players, order])
  const place = standings.findIndex(s => s.p.id === human.id) + 1
  const winner = gameState.winner ?? standings[0]?.p
  const winnerReachedGoal = !!winner && getNetWorth(winner) >= gameState.wealthGoal
  const goal = formatMoney(gameState.wealthGoal, { compact: true, lang })

  // Headline from the locale template; the number part is emphasised wherever the language puts it.
  const headlineText = (() => {
    const MARK = '\u0000'
    const split = (key: string, varName: string, value: string) => {
      const [pre, post = ''] = t(key, { [varName]: MARK }).split(MARK)
      return { pre, em: value, post }
    }
    switch (head.kind) {
      case 'won': return split('result.headline.won', 'nw', formatMoney(final, { compact: true, lang }))
      case 'grew2x': return split('result.headline.grew2x', 'x', lang === 'hi' ? `${head.multiple}` : `${head.multiple}×`)
      case 'grew': return split('result.headline.grew', 'pct', `${head.pct}%`)
      case 'nearMiss': return split('result.headline.nearMiss', 'gap', formatMoney(head.gap ?? 0, { compact: true, lang }))
      default: return { pre: t('result.headline.shrank'), em: '', post: '' }
    }
  })()

  const ordinal = t(`result.ordinalWord.${Math.min(place, 6)}`)
  const sub = won
    ? (winnerReachedGoal ? t('result.youReached', { goal }) : t('result.youMost'))
    : `${t('result.finished', { ordinal, n: gameState.players.length })} ${winner ? (winnerReachedGoal ? t('result.winnerReached', { winner: winner.name, goal }) : t('result.winnerMost', { winner: winner.name })) : ''}`

  const primary = mode === 'multiplayer' && onBackToLobby
    ? { label: t('result.backToLobby'), icon: <Users size={20} aria-hidden="true" />, onClick: onBackToLobby }
    : mode === 'campaign'
      ? (onNextLevel
        ? { label: t('result.nextLevel'), icon: <ArrowRight size={20} aria-hidden="true" />, onClick: onNextLevel }
        : { label: t('result.tryAgain'), icon: <RotateCcw size={20} aria-hidden="true" />, onClick: onPlayAgain ?? onHome })
      : { label: t('result.playAgain'), icon: <Play size={20} aria-hidden="true" />, onClick: onPlayAgain ?? onHome }

  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="page result">
      {head.confetti && !reduced && (
        <Confetti className="result__confetti" width={size.w} height={size.h} recycle={false} numberOfPieces={120} />
      )}
      <main className="page__main page__main--list result__main">
        <section className="result__top" aria-live="polite">
          <Gullu mood={head.mood} size={88} />
          <p className="caption">{t('result.caption', { years })}</p>
          <h1 className="result__headline">
            {headlineText.pre}
            {headlineText.em && <span className={`num result__em ${head.kind === 'nearMiss' ? '' : final >= start ? 'gain' : 'loss'}`}>{headlineText.em}</span>}
            {headlineText.post}
          </h1>
          <p className="result__sub">{sub}</p>
          {mode === 'ranked' && rpChange !== 0 && (
            <Chip tone={rpChange > 0 ? 'save' : 'attack'} className="result__rp">{t('result.rp', { rp: `${rpChange > 0 ? '+' : '−'}${Math.abs(rpChange)}` })}</Chip>
          )}
        </section>

        <Panel className="result-card result__nw" aria-label={t('result.netWorthAria')}>
          <div className="result__nw-row">
            <span className="result__from">{t('result.start', { amount: formatMoney(start) })}</span>
            <span className={`result__pct ${final >= start ? 'gain' : 'loss'}`}>
              {final >= start ? <TrendingUp size={16} aria-hidden="true" /> : <TrendingDown size={16} aria-hidden="true" />}
              <span className="num">{formatPct(changePct)}</span>
            </span>
          </div>
          <p className="num result__big">{formatMoney(shown)}</p>
          <NetWorthSparkline values={series.length >= 2 ? series : [start, final]} />
        </Panel>

        {levelStars && (
          <Panel className="result-card" aria-label={t('campaign.stars.title')}>
            <h2 className="section-title result-card__title">{t('campaign.stars.title')}</h2>
            <LevelStars stars={levelStars.stars} criteria={levelStars.criteria} animate={!reduced} />
          </Panel>
        )}

        <Panel className="result-card result-card--flush" pad="none" aria-labelledby="result-standings">
          <h2 id="result-standings" className="section-title result-card__title result-card__pad">{t('result.standings')}</h2>
          <ol className="standings">
            {standings.map((s, i) => {
              const me = s.p.id === human.id
              return (
                <li key={s.p.id} className={`standings__row${me ? ' is-me' : ''}`}>
                  <span className="standings__rank num">{i + 1}</span>
                  <Avatar name={s.p.name} seat={s.seat} size="m" bot={s.p.isBot} />
                  <span className="standings__name">{me ? <b>{t('result.you')}</b> : s.p.name}</span>
                  <span className="standings__nw num">{formatMoney(s.nw)}</span>
                </li>
              )
            })}
          </ol>
        </Panel>

        <GameReportPanel state={gameState} playerId={human.id} ownerKey={ownerKey} onOpenLibrary={onOpenLibrary} />
      </main>

      <div className="sticky-cta result__bar">
        <div className="sticky-cta__inner">
          <Button variant="outline" icon={<House size={20} aria-hidden="true" />} onClick={onHome}>{t('common.home')}</Button>
          <Button icon={primary.icon} onClick={primary.onClick} className="result__primary">{primary.label}</Button>
        </div>
      </div>
    </div>
  )
}
