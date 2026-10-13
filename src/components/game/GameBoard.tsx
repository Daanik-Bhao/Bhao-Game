import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
// Shared component styles first so the layout files can override them.
import './board.css'
import './GameBoard.css'
import type { GameState, GameCard, PlayerState } from '../../types/game'
import { GameBoardDesktop } from './GameBoardDesktop'
import { GameBoardMobile } from './GameBoardMobile'
import { CardSheet } from './CardSheet'
import { PauseMenu } from './PauseMenu'
import { GameLog, logView } from './GameLog'
import { PortfolioPanel, YearSummaryView, summarizeYear } from './EconomyPanels'
import { feedbackTier, getTargetableIndices, standings, useOpponentPlayFeed, type FeedbackTier } from './boardUtils'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useReducedEffects } from '../../hooks/useReducedEffects'
import { SIDE_PANEL_QUERY, Sheet, useMediaQuery, useToast, useToastPlacement } from '../ui'
import { useOpenOverlayCount } from '../ui/overlay'
import { LevelRuleHUD } from '../campaign'
import { TutorialModal } from '../TutorialModal'
import { getNetWorth, inflationPct } from '../../lib/gameEngine'
import { hapticImpact } from '../../lib/native'
import { yearLabel } from './economyUi'

export type UIPhase = 'playing' | 'decision' | 'targeting'

export interface GameBoardProps {
  gameState: GameState
  myPlayerId: string
  isMultiplayer: boolean
  uiPhase: UIPhase
  onlinePlayers?: Set<string>
  onDrawCard: () => void
  onPlayCard: (card: GameCard) => void
  onTargetSelect: (targetIndex: number) => void
  onDecision: (type: 'spend' | 'save' | 'invest') => void
  onTimeout: () => void
  onCancelTargeting: () => void
  daanikCoins: number
  onBuyExtraCard: () => void
  activeEmotes?: Record<string, string>
  onSendEmote?: (emoji: string) => void
  /** Comms dock buttons (multiplayer chat + mic): right-edge stack on phones, top bar elsewhere. */
  extraControls?: ReactNode
  /** Voice-chat state per player id, shown as a mic badge on the rival chips. */
  voiceBadges?: Record<string, 'on' | 'muted' | 'speaking'>
  /** Pass discards a card and ends the turn; Equip is free (once per turn). */
  onPass?: (cardId: string) => void
  onEquip?: (card: GameCard) => void
  /** @deprecated rivals are always shown */
  showOpponents?: boolean
  /** Force a layout instead of picking one from the available space. */
  layout?: 'auto' | 'desktop' | 'compact'
  /** Pause-menu title and desktop top-bar title, e.g. "Practice" / "Level 2 · Vidyarthi to Yuva" / "Ranked" */
  modeTitle?: string
  /** Desktop top-bar subtitle, e.g. "vs 3 bots · race to ₹50 lakh" */
  modeSubtitle?: string
  /** "Quit game" in the pause menu (the page opens its ForfeitModal). Hidden when omitted. */
  onQuit?: () => void
  /** "How to play" in the pause menu; defaults to the built-in rules modal. */
  onHowToPlay?: () => void
  /** Dev / gallery: open the card sheet for this hand card on mount */
  initialOpenCardId?: string
  /** Dev / gallery: open one of the board sheets on mount */
  initialSheet?: BoardSheet
}

export type BoardSheet = 'menu' | 'log' | 'portfolio' | 'year' | 'rule' | 'rules'

export type BoardState = 'draw' | 'play' | 'decision' | 'targeting' | 'wait' | 'over'

/** Everything the layouts render, computed once above the layout switch (spec §F.5). */
export interface BoardModel {
  p: GameBoardProps
  gs: GameState
  me: PlayerState | null
  meIndex: number
  isMyTurn: boolean
  current: PlayerState | undefined
  state: BoardState
  ranks: Map<string, number>
  myRank: number
  rivals: { player: PlayerState; index: number }[]
  hand: GameCard[]
  targetIndices: number[]
  modeTitle: string
  modeSubtitle?: string
  reduced: boolean
  desktop: boolean
  landscapeCompact: boolean
  showFeed: boolean
  /** Card shown in the card sheet (null = closed) */
  sheetCard: GameCard | null
  sheetCardId: string | null
  /** A side panel (landscape / desktop sheet) is open: layouts collapse the HUD / reflow the hand */
  sidePanelOpen: boolean
  unreadLog: number
  /** Card on the table (the engine clears playedCard at the end of each turn) */
  lastPlayed: GameCard | null
  lastPlayedBy: string | null
  fx: { key: number; tier: FeedbackTier; delta: number } | null
  yearBanner: { round: number; inflation: number; investChange: number } | null
  passConfirmFor: string | null
  openCard: (id: string) => void
  closeSheet: () => void
  playFromSheet: (card: GameCard) => void
  equipFromSheet: (card: GameCard) => void
  pass: (cardId: string, gs: GameState) => void
  cancelPass: () => void
  onRivalTap: (index: number) => void
  openMenu: () => void
  openLog: () => void
  openPortfolio: () => void
  openYear: () => void
  openRule: () => void
  openRules: () => void
}

/** Design size of the desktop board; it is scaled uniformly to fit. */
export const DESKTOP_DESIGN_W = 1280
export const DESKTOP_DESIGN_H = 700
/** Below this scale the desktop board gets too small to tap — use the compact layout. */
const MIN_DESKTOP_SCALE = 0.7
const MAX_DESKTOP_SCALE = 1.35

interface FitBox { w: number; h: number; top: number }

/** Sizes the board to the space between its top edge and the bottom of the visual viewport. */
function useBoardFit() {
  const rootRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<FitBox | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const area = areaRef.current
    if (!root || !area) return
    let raf = 0
    const measure = () => {
      const rect = root.getBoundingClientRect()
      const vh = window.visualViewport?.height ?? window.innerHeight
      const top = Math.max(0, Math.round(rect.top))
      root.style.height = `${Math.max(240, Math.floor(vh - top))}px`
      root.dataset.atTop = top < 8 ? 'true' : 'false'
      const next: FitBox = { w: area.clientWidth, h: area.clientHeight, top }
      setFit(prev => (prev && prev.w === next.w && prev.h === next.h && prev.top === next.top ? prev : next))
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    ro?.observe(root)
    ro?.observe(area)
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [])

  return { rootRef, areaRef, fit }
}

/** Who played the card now on the table (from the newest matching log line). */
function lastPlayedBy(gs: GameState, card: GameCard | null, meName: string | undefined): string | null {
  if (!card) return null
  for (const entry of gs.log) {
    const m = entry.match(/^(?:\P{L}*)(.+?) played (.+?)(?: →| —|$)/u)
    if (m && m[2] === card.name) return m[1] === meName ? 'me' : m[1]
  }
  return null
}

export function GameBoard(props: GameBoardProps) {
  const { layout = 'auto', gameState: gs, myPlayerId, uiPhase } = props
  const { t, i18n } = useTranslation()
  const { rootRef, areaRef, fit } = useBoardFit()
  const fallbackCompact = useIsMobile()
  const { reduced } = useReducedEffects()
  const sidePref = useMediaQuery(SIDE_PANEL_QUERY)
  const toast = useToast()
  useToastPlacement('top')
  const overlays = useOpenOverlayCount()

  // ---- layout selection (unchanged logic: desktop canvas unless it would scale below 0.7) ----
  const scale = fit ? Math.min(fit.w / DESKTOP_DESIGN_W, fit.h / DESKTOP_DESIGN_H) : 1
  const compact =
    layout === 'compact' ? true :
    layout === 'desktop' ? false :
    fit ? scale < MIN_DESKTOP_SCALE : fallbackCompact
  const orientation: 'portrait' | 'landscape' = fit && fit.h > fit.w && fit.h >= 500 ? 'portrait' : 'landscape'

  // ---- derived game data ----
  const meIndex = gs.players.findIndex(p => p.id === myPlayerId)
  const me = meIndex >= 0 ? gs.players[meIndex] : null
  const current = gs.players[gs.currentPlayerIndex]
  const isMyTurn = current?.id === myPlayerId
  const ranks = useMemo(() => standings(gs), [gs])
  const targetIndices = useMemo(() => getTargetableIndices(gs, myPlayerId), [gs, myPlayerId])
  const state: BoardState =
    gs.phase === 'game_over' ? 'over'
    : uiPhase === 'targeting' && gs.pendingTarget ? 'targeting'
    : uiPhase === 'decision' && gs.pendingDecision && isMyTurn ? 'decision'
    : isMyTurn && gs.phase === 'draw' ? 'draw'
    : isMyTurn && gs.phase === 'play' ? 'play'
    : 'wait'
  const hand = me?.hand ?? []

  // ---- board UI state (lives here, above the layout switch, so a resize never loses it) ----
  const [inspectId, setInspectId] = useState<string | null>(props.initialOpenCardId ?? null)
  const [sheet, setSheet] = useState<BoardSheet | null>(props.initialSheet ?? null)
  const [rivalSheet, setRivalSheet] = useState<number | null>(null)
  const [passConfirmFor, setPassConfirmFor] = useState<string | null>(null)
  const passedOnce = useRef(false)
  useEffect(() => { passedOnce.current = false }, [gs.id])

  // The decision sheet follows the page's pending decision (tutorial / restored sessions too).
  const decisionId = state === 'decision' ? gs.pendingDecision?.card.id ?? null : null
  const sheetCardId = decisionId ?? (inspectId && hand.some(c => c.id === inspectId) ? inspectId : null)
  const sheetCard = sheetCardId ? hand.find(c => c.id === sheetCardId) ?? gs.pendingDecision?.card ?? null : null
  // Close the inspect sheet when its card leaves the hand (played / discarded).
  useEffect(() => { if (inspectId && !hand.some(c => c.id === inspectId)) setInspectId(null) }, [hand, inspectId])
  useEffect(() => { if (!sheetCardId) setPassConfirmFor(null) }, [sheetCardId])

  const anySheetOpen = !!sheetCard || sheet !== null || rivalSheet !== null
  const sidePanelOpen = anySheetOpen && sidePref

  const openCard = useCallback((id: string) => {
    const card = hand.find(c => c.id === id)
    if (!card) return
    setSheet(null)
    setPassConfirmFor(null)
    const myPlay = state === 'play' || state === 'decision'
    if (myPlay && card.type === 'decision') {
      setInspectId(id)
      if (!(state === 'decision' && gs.pendingDecision?.card.id === id)) props.onPlayCard(card)
      return
    }
    // Another card while a decision is pending: back out of that decision first.
    if (state === 'decision') props.onCancelTargeting()
    setInspectId(id)
  }, [hand, state, gs.pendingDecision, props])

  const closeSheet = useCallback(() => {
    setInspectId(null)
    setPassConfirmFor(null)
    if (state === 'decision') props.onCancelTargeting()
  }, [state, props])

  const playFromSheet = useCallback((card: GameCard) => {
    setInspectId(null)
    props.onPlayCard(card)
  }, [props])
  const equipFromSheet = useCallback((card: GameCard) => {
    setInspectId(null)
    if (props.onEquip) props.onEquip(card)
    else props.onPlayCard(card)
  }, [props])
  const pass = useCallback((cardId: string) => {
    if (!props.onPass) return
    if (!passedOnce.current && passConfirmFor !== cardId) { setPassConfirmFor(cardId); return }
    passedOnce.current = true
    setPassConfirmFor(null)
    setInspectId(null)
    props.onPass(cardId)
  }, [props, passConfirmFor])

  const onRivalTap = useCallback((index: number) => {
    if (state === 'targeting') {
      if (targetIndices.includes(index)) props.onTargetSelect(index)
      return
    }
    setRivalSheet(index)
  }, [state, targetIndices, props])

  // ---- keys 1–5 open a hand card (desktop keyboards) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overlays > 0 || e.altKey || e.ctrlKey || e.metaKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || n > 5) return
      const card = hand[n - 1]
      if (!card) return
      e.preventDefault()
      openCard(card.id)
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-card-id="${card.id}"]`)?.focus())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hand, openCard, overlays])

  // ---- game log: unread count on the opener only ----
  const [seenLogHead, setSeenLogHead] = useState<string | undefined>(gs.log[0])
  const unreadLog = sheet === 'log' ? 0 : Math.max(0, seenLogHead === undefined ? gs.log.length : gs.log.indexOf(seenLogHead) < 0 ? gs.log.length : gs.log.indexOf(seenLogHead))
  useEffect(() => { if (sheet === 'log') setSeenLogHead(gs.log[0]) }, [sheet, gs.log])

  // ---- opponent moves → toasts (bot / rival turns never open a banner) ----
  const opponentEvent = useOpponentPlayFeed(gs, myPlayerId)
  useEffect(() => {
    if (!opponentEvent) return
    // Attacks on you get the outcome banner in single player.
    if (!props.isMultiplayer && me && opponentEvent.entry.includes(`→ ${me.name}`)) return
    const v = logView(opponentEvent.entry, t, i18n.language)
    toast.show(v.text, { tone: v.tone === 'gain' ? 'gain' : v.tone === 'loss' ? 'loss' : 'info' })
  }, [opponentEvent?.key])

  // ---- feedback tiers on my net-worth changes (spec §B.7) ----
  const myNw = me ? getNetWorth(me) : 0
  const prevNw = useRef(myNw)
  const prevRound = useRef(gs.round ?? 1)
  const fxKey = useRef(0)
  const [fx, setFx] = useState<BoardModel['fx']>(null)
  const [srMoney, setSrMoney] = useState('')
  useEffect(() => {
    const delta = myNw - prevNw.current
    prevNw.current = myNw
    if (!me || delta === 0 || gs.phase === 'game_over') return
    const yearTick = (gs.round ?? 1) !== prevRound.current
    const head = gs.log[0] ?? ''
    const attackOnMe = delta < 0 && head.includes(`→ ${me.name}`) && !head.startsWith(`${me.name} `)
    const tier = feedbackTier(delta, attackOnMe)
    fxKey.current += 1
    setFx({ key: fxKey.current, tier, delta })
    setSrMoney(t('board.netWorthNow', { amount: Math.round(myNw).toLocaleString('en-IN') }))
    if (!yearTick && tier === 'medium') hapticImpact('light')
    if (!yearTick && tier === 'large') hapticImpact('medium')
  }, [myNw])

  // ---- year change: top-bar flip + 1.2 s banner; the summary lands in the feed ----
  const [yearBanner, setYearBanner] = useState<BoardModel['yearBanner']>(null)
  useEffect(() => {
    const round = gs.round ?? 1
    if (round === prevRound.current) return
    const grew = round > prevRound.current
    prevRound.current = round
    if (!grew || gs.phase === 'game_over' || !me || round > yearLabel(gs).max) return
    const s = summarizeYear(gs, me)
    setYearBanner({ round, inflation: inflationPct(me), investChange: s?.investChange ?? 0 })
    const id = setTimeout(() => setYearBanner(null), 1200)
    return () => clearTimeout(id)
  }, [gs.round])

  // ---- the card on the table survives the engine clearing playedCard at end of turn ----
  const [lastPlayed, setLastPlayed] = useState<GameCard | null>(gs.playedCard)
  useEffect(() => { if (gs.playedCard) setLastPlayed(gs.playedCard) }, [gs.playedCard])
  // Pages usually advance the turn in the same update, so playedCard is already cleared:
  // the newest card on the discard pile is the one that was just played.
  const discardLen = gs.discardPile.length
  const prevDiscardLen = useRef(discardLen)
  useEffect(() => {
    if (discardLen > prevDiscardLen.current) {
      const top = gs.discardPile[discardLen - 1]
      if (top && top.type !== 'defense') setLastPlayed(top)
    }
    prevDiscardLen.current = discardLen
  }, [discardLen, gs.discardPile])
  const matchIdSeen = useRef(gs.id)
  useEffect(() => {
    if (gs.id !== matchIdSeen.current) { matchIdSeen.current = gs.id; setLastPlayed(null) }
  }, [gs.id])

  const modeTitle = props.modeTitle ?? (props.isMultiplayer ? t('board.mode.multiplayer') : t('board.mode.practice'))
  const desktop = !compact
  const canvasScale = Math.min(MAX_DESKTOP_SCALE, scale)
  const m: BoardModel = {
    p: props,
    gs,
    me,
    meIndex,
    isMyTurn,
    current,
    state,
    ranks,
    myRank: me ? ranks.get(me.id) ?? 1 : 1,
    rivals: gs.players.map((player, index) => ({ player, index })).filter(x => x.index !== meIndex),
    hand,
    targetIndices,
    modeTitle,
    modeSubtitle: props.modeSubtitle,
    reduced,
    desktop,
    landscapeCompact: compact && orientation === 'landscape',
    showFeed: compact,
    sheetCard,
    sheetCardId,
    sidePanelOpen,
    unreadLog,
    lastPlayed,
    lastPlayedBy: lastPlayedBy(gs, lastPlayed, me?.name),
    fx,
    yearBanner,
    passConfirmFor,
    openCard,
    closeSheet,
    playFromSheet,
    equipFromSheet,
    pass,
    cancelPass: () => setPassConfirmFor(null),
    onRivalTap,
    openMenu: () => setSheet('menu'),
    openLog: () => setSheet('log'),
    openPortfolio: () => setSheet('portfolio'),
    openYear: () => setSheet('year'),
    openRule: () => setSheet('rule'),
    openRules: () => (props.onHowToPlay ? props.onHowToPlay() : setSheet('rules')),
  }

  const closeBoardSheet = () => setSheet(null)
  const rival = rivalSheet !== null ? gs.players[rivalSheet] : null

  return (
    <div
      ref={rootRef}
      className={`game-board-root surface-table ${compact ? 'is-compact' : 'is-desktop'}${sidePanelOpen ? ' has-panel' : ''}`}
    >
      <div ref={areaRef} className="game-board-area">
        {fit && (compact ? (
          <GameBoardMobile m={m} orientation={orientation} width={fit.w} />
        ) : (
          <div
            className="game-board-canvas"
            style={{
              width: DESKTOP_DESIGN_W,
              height: DESKTOP_DESIGN_H,
              transform: `translate(-50%, -50%) scale(${Math.min(MAX_DESKTOP_SCALE, scale)})`,
              ['--panel-w' as string]: `${Math.max(0, Math.round((440 - (fit.w - DESKTOP_DESIGN_W * canvasScale) / 2) / canvasScale))}px`,
            }}
          >
            <GameBoardDesktop m={m} />
          </div>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">{srMoney}</span>

      <CardSheet m={m} />
      <PauseMenu m={m} open={sheet === 'menu'} onClose={closeBoardSheet} />
      <Sheet open={sheet === 'log'} onClose={closeBoardSheet} title={t('board.gameLog')} className="logsheet">
        <GameLog log={gs.log} round={gs.round ?? 1} />
      </Sheet>
      <Sheet open={sheet === 'portfolio'} onClose={closeBoardSheet} title={t('board.yourMoney')}>
        {me && <PortfolioPanel player={me} goal={gs.wealthGoal} />}
      </Sheet>
      <Sheet open={sheet === 'year'} onClose={closeBoardSheet} title={t('board.yearSummary')}>
        <YearSummaryView state={gs} me={me} />
      </Sheet>
      <Sheet open={sheet === 'rule'} onClose={closeBoardSheet} title={t('board.levelRule')}>
        <LevelRuleHUD state={gs} />
      </Sheet>
      <Sheet open={rival !== null} onClose={() => setRivalSheet(null)} title={rival?.name ?? ''}>
        {rival && <PortfolioPanel player={rival} goal={gs.wealthGoal} />}
      </Sheet>
      {sheet === 'rules' && <TutorialModal onClose={closeBoardSheet} />}
    </div>
  )
}
