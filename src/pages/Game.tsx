import { useState, useEffect, useCallback, useRef } from 'react'
import { useBackButton, useKeepAwake } from '../hooks/useBackButton'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recordLevelResult, progressOwnerKey, STARS_TO_UNLOCK_NEXT } from '../lib/campaignProgress'
import { SetupScreen } from './game/SetupScreen'
import { ResultScreen } from './game/ResultScreen'
import { PageLoader, useToast } from '../components/ui'
import { computeLevelStars, type LevelStarsResult } from '../lib/levelRules'
import { ForfeitModal } from '../components/ForfeitModal'
import { GameState, GameCard as GameCardType } from '../types/game'
import type { ConceptId } from '../types/learning'
import {
  initGame, initLevelGame, startDrawPhase, processDecision, processAction,
  advanceTurn, doBotTurn, forceSkipTurn, drawCard, equipDefense, TURN_TIME_LIMIT_MS,
  canEquip, passTurn, previewDecision, getNetWorth, getRoundLimit, getInvestAsset,
} from '../lib/gameEngine'
import { assetConcepts, categoryConcepts, conceptsFromText } from '../lib/learning'
import { ARTHA_YATRA_LEVELS } from '../data/levels'
import { startMatch, saveMatchResult, spendCoins, type SinglePlayerMode } from '../lib/auth'
import { calculateRankRP, EXTRA_CARD_COST } from '../data/rankRules'
import type { MatchResultSummary } from '../types/database'
import { useTranslation } from 'react-i18next'
import { ALL_CARDS } from '../data/cards'
import { playSound } from '../lib/audio'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { OutcomeBanner, type OutcomeInfo } from '../components/game/OutcomeBanner'
import { cardNameFor, localizeEngineText } from '../components/game/economyUi'
import { formatMoney } from '../lib/format'

type GamePhaseUI = 'setup' | UIPhase | 'result'

/**
 * Placement reported to the server: the winner is always 1st, and a non-winner is
 * never 1st (the winner can differ from the richest player, e.g. by reaching the
 * target net worth first or when the richest player went bankrupt).
 */
function rankedPlacement(isWinner: boolean, wealthPlacement: number): number {
  return isWinner ? 1 : Math.max(2, wealthPlacement)
}

// ---------------------------------------------------------------------------
// Match snapshot (spec §F.5): a reload / app kill / remount must not throw the
// player back to Setup. The running single-player match is kept in
// sessionStorage and restored when it is younger than 30 minutes.
// ---------------------------------------------------------------------------

const SNAPSHOT_VERSION = 1
const SNAPSHOT_MAX_AGE_MS = 30 * 60 * 1000
export const matchSnapshotKey = (pathAndSearch: string) => `bhao.match.v1:${pathAndSearch}`

interface MatchSnapshot {
  v: number
  savedAt: number
  gameState: GameState
  uiPhase: UIPhase
  mode: string
  levelId: string | null
  botCount: number
  popupQueue: OutcomeInfo[]
  /** Resolved server match id (signed-in players), null = none / failed, undefined = still opening */
  matchId?: string | null
}

function readSnapshot(key: string, mode: string, levelId: string | null): MatchSnapshot | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const s = JSON.parse(raw) as MatchSnapshot
    if (s.v !== SNAPSHOT_VERSION || Date.now() - s.savedAt > SNAPSHOT_MAX_AGE_MS) { sessionStorage.removeItem(key); return null }
    if (s.mode !== mode || s.levelId !== levelId || !s.gameState || s.gameState.phase === 'game_over') return null
    // Time spent away does not count against the turn or the match clock.
    const gap = Math.max(0, Date.now() - s.savedAt)
    s.gameState = { ...s.gameState, turnStartTime: s.gameState.turnStartTime + gap, startTime: s.gameState.startTime + gap }
    return s
  } catch {
    return null
  }
}

function clearSnapshot(key: string) {
  try { sessionStorage.removeItem(key) } catch { /* storage unavailable */ }
}

/** Learn-more concept for a decision (card text first, then the choice itself). */
function decisionConcept(card: GameCardType, choice: 'spend' | 'save' | 'invest'): ConceptId | undefined {
  const option = card.options?.find(o => o.type === choice)
  const fromText = conceptsFromText(`${card.name} ${card.flavor ?? ''} ${option?.label ?? ''} ${option?.description ?? ''}`)
  if (choice === 'invest' && option) return assetConcepts(getInvestAsset(option))[0] ?? fromText[0]
  return fromText[0] ?? (choice === 'save' ? 'emergency_fund' : 'lifestyle_creep')
}

export function Game() {
  const { t, i18n } = useTranslation()
  const { levelId } = useParams()
  const [params] = useSearchParams()
  const location = useLocation()
  const mode = levelId ? 'campaign' : (params.get('mode') ?? 'ranked')
  // Server match mode for signed-in games (unknown query modes count as practice).
  const matchMode: SinglePlayerMode = mode === 'campaign' ? 'campaign' : mode === 'ranked' ? 'ranked' : 'practice'
  const navigate = useNavigate()
  const toast = useToast()
  const { user, profile, guestProfile, refreshProfile } = useAuth()
  const snapKey = matchSnapshotKey(location.pathname + location.search)
  const [restored] = useState(() => readSnapshot(snapKey, mode, levelId ?? null))

  // Server match for this game (signed-in only). Resolves to null if it could not be opened.
  const matchIdRef = useRef<Promise<string | null> | null>(restored?.matchId ? Promise.resolve(restored.matchId) : null)
  const [matchId, setMatchId] = useState<string | null | undefined>(restored?.matchId)
  const gameSeqRef = useRef(0)
  const [serverResult, setServerResult] = useState<MatchResultSummary | null>(null)

  const [gameState, setGameState] = useState<GameState | null>(restored?.gameState ?? null)
  const [levelStars, setLevelStars] = useState<LevelStarsResult | null>(null)
  const gameStateRef = useRef<GameState | null>(restored?.gameState ?? null)
  const [uiPhase, setUiPhase] = useState<GamePhaseUI>(restored?.uiPhase ?? 'setup')

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])
  const [botCount, setBotCount] = useState(restored?.botCount ?? 2)
  const [animating, setAnimating] = useState(false)
  const [showForfeitModal, setShowForfeitModal] = useState(false)
  // Outcome banners are queued so a decision result and an attack can both be shown.
  const [popupQueue, setPopupQueue] = useState<OutcomeInfo[]>(restored?.popupQueue ?? [])
  const popupInfo = popupQueue[0] ?? null
  // When the outcome banner opens we remember when, so the human's turn timer can be
  // paused (turnStartTime shifted forward) for as long as the banner blocks the board.
  const popupOpenedAtRef = useRef<number | null>(restored?.popupQueue?.length ? Date.now() : null)
  const enqueuePopup = useCallback((info: OutcomeInfo) => {
    if (popupOpenedAtRef.current === null) popupOpenedAtRef.current = Date.now()
    setPopupQueue(q => [...q, info])
  }, [])
  const handlePopupContinue = useCallback(() => {
    if (popupQueue.length > 1) {
      setPopupQueue(q => q.slice(1))
      return
    }
    const openedAt = popupOpenedAtRef.current
    popupOpenedAtRef.current = null
    setPopupQueue([])
    if (openedAt === null) return
    const pausedFor = Date.now() - openedAt
    setGameState(gs => {
      if (!gs || gs.phase === 'game_over' || gs.currentPlayerIndex !== 0) return gs
      return { ...gs, turnStartTime: gs.turnStartTime + pausedFor }
    })
  }, [popupQueue.length])
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevWealthRef = useRef(restored ? restored.gameState.players[0]?.wealth ?? 0 : 0)
  const prevRoundRef = useRef(restored?.gameState.round ?? 1)

  const humanPlayerIndex = 0

  const notify = useCallback((msg: string, tone: 'info' | 'gain' | 'loss' | 'success' = 'info') => {
    toast.show(msg, { tone })
  }, [toast])

  // ---- snapshot: save while a match runs, drop it otherwise ----
  useEffect(() => {
    const running = !!gameState && gameState.phase !== 'game_over' && (uiPhase === 'playing' || uiPhase === 'decision' || uiPhase === 'targeting')
    if (!running) {
      if (uiPhase === 'result') clearSnapshot(snapKey)
      return
    }
    const snap: MatchSnapshot = {
      v: SNAPSHOT_VERSION, savedAt: Date.now(), gameState: gameState!, uiPhase: uiPhase as UIPhase,
      mode, levelId: levelId ?? null, botCount, popupQueue, matchId,
    }
    try { sessionStorage.setItem(snapKey, JSON.stringify(snap)) } catch { /* quota / private mode: no snapshot */ }
  }, [gameState, uiPhase, popupQueue, matchId, mode, levelId, botCount, snapKey])

  const leaveToHome = useCallback(() => {
    clearSnapshot(snapKey)
    navigate('/dashboard')
  }, [navigate, snapKey])

  const startGame = useCallback(() => {
    const humanName = profile?.username ?? guestProfile?.username ?? 'You'
    const humanAvatar = profile?.avatar_url ?? guestProfile?.avatar_url ?? undefined
    let state: GameState
    const level = levelId ? ARTHA_YATRA_LEVELS.find(l => l.id === levelId) : undefined
    if (level) {
      // Campaign levels define their own opponent count
      state = initLevelGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: humanAvatar }, level)
    } else {
      state = initGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: humanAvatar }, botCount)
    }
    // Baseline for the wealth-change banner is the actual starting wealth of this game
    prevWealthRef.current = state.players[humanPlayerIndex].wealth
    prevRoundRef.current = state.round ?? 1
    popupOpenedAtRef.current = null
    setPopupQueue([])
    setServerResult(null)
    gameSeqRef.current += 1
    const seq = gameSeqRef.current
    // Signed-in games open a server match; guests skip all server calls.
    if (profile?.id) {
      setMatchId(undefined)
      const pending = startMatch(matchMode, levelId ?? null, state.players.length).catch(err => {
        console.error('Failed to start match:', err)
        return null
      })
      matchIdRef.current = pending
      void pending.then(id => { if (seq === gameSeqRef.current) setMatchId(id) })
    } else {
      matchIdRef.current = null
      setMatchId(null)
    }
    setGameState(state)
    setUiPhase('playing')
  }, [profile, guestProfile, botCount, levelId, matchMode])

  /** Reports the result of the current server match (no-op for guests or if start_match failed). */
  const reportResult = useCallback(async (result: { won: boolean; placement: number; totalPlayers: number; finalWealth: number; forfeit?: boolean; stats?: { investChoices: number; emiDamageTaken: boolean } }) => {
    const pending = matchIdRef.current
    const seq = gameSeqRef.current
    matchIdRef.current = null
    const id = pending ? await pending : null
    if (!id) return
    try {
      const saved = await saveMatchResult({ matchId: id, ...result })
      // Ignore a late answer if another game has started meanwhile.
      if (saved && seq === gameSeqRef.current) setServerResult(saved)
    } catch {
      /* logged in saveMatchResult; the result screen falls back to the local estimate */
    }
    await refreshProfile()
  }, [refreshProfile])

  const handleGameOver = useCallback((finalState: GameState) => {
    clearSnapshot(snapKey)
    setGameState(finalState)
    setUiPhase('result')
    if (levelId) {
      const human = finalState.players[humanPlayerIndex]
      if (human) {
        const result = computeLevelStars(finalState, human.id)
        setLevelStars(result)
        recordLevelResult(progressOwnerKey(user?.id), levelId, result.stars, getNetWorth(human))
      }
    }
    if (profile?.id && profile?.username) {
      const humanPlayer = finalState.players[humanPlayerIndex]
      const isWinner = finalState.winner?.id === humanPlayer.id
      const placement = [...finalState.players]
        .sort((a, b) => b.wealth - a.wealth)
        .findIndex(p => p.id === humanPlayer.id) + 1
      if (isWinner) playSound('win')
      else playSound('lose')
      void reportResult({
        won: isWinner,
        placement: rankedPlacement(isWinner, placement),
        totalPlayers: finalState.players.length,
        finalWealth: humanPlayer.wealth,
        stats: { investChoices: humanPlayer.investChoices, emiDamageTaken: humanPlayer.emiDamageTaken },
      })
    }
  }, [profile, user, levelId, humanPlayerIndex, reportResult, snapKey])

  const handleForfeit = () => {
    setShowForfeitModal(false)
    clearSnapshot(snapKey)
    if (!gameState) {
      navigate('/dashboard')
      return
    }
    // Record a loss automatically
    const forfeitState = { ...gameState, phase: 'game_over' as const }
    setGameState(forfeitState)
    setUiPhase('result')
    if (profile?.id && profile?.username) {
      const humanPlayer = forfeitState.players[humanPlayerIndex]
      playSound('lose')
      // A forfeit is recorded server-side as a loss in last place (no XP/coins).
      const total = forfeitState.players.length
      reportResult({ won: false, placement: total, totalPlayers: total, finalWealth: humanPlayer.wealth, forfeit: true })
        .finally(() => navigate('/dashboard'))
    } else {
      navigate('/dashboard')
    }
  }

  // Wealth changes that were not your own decision (attacks, life events on your turn,
  // your own action cards) → outcome banner. Year changes go to the board's year banner.
  useEffect(() => {
    if (!gameState) return
    const humanPlayer = gameState.players[humanPlayerIndex]
    if (!humanPlayer) return

    const wealthDiff = humanPlayer.wealth - prevWealthRef.current
    const round = gameState.round ?? 1
    const newYear = round > prevRoundRef.current && !!gameState.roundNews
    prevRoundRef.current = round
    const inPlay = uiPhase !== 'setup' && uiPhase !== 'result' && gameState.phase !== 'game_over'

    if (!newYear && wealthDiff !== 0 && inPlay) {
      const head = gameState.log.find(l => / played /.test(l)) ?? ''
      const m = head.match(/^(?:\P{L}*)(.+?) played (.+?)(?: →| —|$)/u)
      const sourceName = m?.[1]
      const cardName = m?.[2] && ALL_CARDS.some(c => c.name === m[2]) ? m[2] : undefined
      const isSelf = !sourceName || sourceName === humanPlayer.name
      const card = cardName ? ALL_CARDS.find(c => c.name === cardName) : undefined
      const concept = card ? (categoryConcepts(card)[0] ?? conceptsFromText(`${card.name} ${card.flavor}`)[0]) : undefined
      enqueuePopup({
        kind: !isSelf && wealthDiff < 0 ? 'attack' : wealthDiff > 0 ? 'gain' : 'loss',
        delta: wealthDiff,
        cardName,
        sourceName: isSelf ? undefined : sourceName,
        concept,
      })
    }

    prevWealthRef.current = humanPlayer.wealth
  }, [gameState, uiPhase, enqueuePopup])

  // Bot turn handler
  useEffect(() => {
    if (!gameState || uiPhase !== 'playing' || gameState.phase === 'game_over' || popupInfo !== null) return
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer.isBot) return

    setAnimating(true)
    botTimerRef.current = setTimeout(() => {
      const { state: newState } = doBotTurn(gameState)
      setAnimating(false)
      if (newState.phase === 'game_over') {
        handleGameOver(newState)
      } else {
        setGameState(newState)
      }
    }, 2500)

    return () => { if (botTimerRef.current) clearTimeout(botTimerRef.current) }
  }, [gameState, uiPhase, handleGameOver, popupInfo])

  const handleTimeout = useCallback(() => {
    const gs = gameStateRef.current
    if (!gs || gs.phase === 'game_over' || gs.currentPlayerIndex !== humanPlayerIndex) return
    const newState = forceSkipTurn(gs)
    if (newState.phase === 'game_over') { handleGameOver(newState) } else { setGameState(newState); setUiPhase('playing') }
    playSound('lose')
    notify(t('board.toast.timeUp'), 'loss')
  }, [humanPlayerIndex, handleGameOver, notify, t])

  // Human player turn timer
  useEffect(() => {
    if (!gameState || gameState.phase === 'game_over' || popupInfo !== null) return
    if (gameState.currentPlayerIndex !== humanPlayerIndex) return

    const elapsed = Date.now() - gameState.turnStartTime
    const remaining = Math.max(0, TURN_TIME_LIMIT_MS - elapsed)

    const timer = setTimeout(() => {
      handleTimeout()
    }, remaining)

    return () => clearTimeout(timer)
  }, [gameState, handleTimeout, popupInfo])

  const handleDrawCard = () => {
    if (!gameState || animating) return
    if (gameState.phase !== 'draw') return
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.isBot || gameState.currentPlayerIndex !== humanPlayerIndex) return

    const { state: newState } = startDrawPhase(gameState, humanPlayerIndex)
    setGameState({ ...newState, phase: 'play' })
    playSound('draw')
  }

  const handleBuyExtraCard = async () => {
    if (!gameState || animating) return
    if (gameState.phase !== 'play') return
    if (gameState.currentPlayerIndex !== humanPlayerIndex) return
    // Ranked has no coin-bought advantages; guests have no coins.
    if (mode === 'ranked' || !profile?.id) return
    if ((profile.daanik_coins ?? 0) < EXTRA_CARD_COST) return

    try {
      await spendCoins(EXTRA_CARD_COST, 'extra_card')
    } catch {
      notify(t('board.toast.notEnoughCoins'))
      return
    }
    void refreshProfile()

    const { state: newState } = drawCard(gameState, humanPlayerIndex)
    setGameState(newState)
    playSound('draw')
    notify(t('board.toast.extraCard', { n: EXTRA_CARD_COST }), 'success')
  }

  const handlePlayCard = (card: GameCardType) => {
    if (!gameState || animating) return
    if (gameState.phase !== 'play') return
    if (gameState.currentPlayerIndex !== humanPlayerIndex) return

    // If the user selects a new card while in the middle of a decision/targeting,
    // cancel the old pending action before processing the new card.
    let currentState = gameState
    if (uiPhase !== 'playing') {
      currentState = { ...gameState, pendingDecision: null, pendingTarget: null }
      setUiPhase('playing')
    }

    if (card.type === 'decision') {
      setGameState({ ...currentState, pendingDecision: { card, playerIndex: humanPlayerIndex } })
      setUiPhase('decision')
    } else if (card.type === 'action') {
      const needsTarget = card.effect?.target === 'target'
      if (needsTarget) {
        const activeOpponents = currentState.players.map((p, i) => ({ p, i })).filter(x => x.i !== humanPlayerIndex && !x.p.hasForfeited)
        if (activeOpponents.length === 1) {
          const targetIndex = activeOpponents[0].i
          const newState = processAction(currentState, humanPlayerIndex, card, targetIndex)
          const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
          if (finalState.phase === 'game_over') { handleGameOver(finalState) } else { setGameState(finalState) }
          playSound('attack')
          notify(t('game.hitTarget', { card: cardNameFor(card.name), name: currentState.players[targetIndex].name }))
        } else {
          setGameState({ ...currentState, pendingTarget: { card, playerIndex: humanPlayerIndex, effect: card.effect! } })
          setUiPhase('targeting')
        }
      } else {
        const newState = processAction(currentState, humanPlayerIndex, card, humanPlayerIndex)
        const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
        if (finalState.phase === 'game_over') { handleGameOver(finalState) } else { setGameState(finalState) }
        playSound('play')
        notify(t('game.playedCard', { card: cardNameFor(card.name) }))
      }
    } else if (card.type === 'defense') {
      handleEquip(card, currentState)
    }
  }

  /** Free equip: does not end the turn. Once per turn, max 3 active. */
  const handleEquip = (card: GameCardType, base?: GameState) => {
    const gs = base ?? gameState
    if (!gs || animating || gs.phase !== 'play' || gs.currentPlayerIndex !== humanPlayerIndex) return
    if (canEquip(gs, humanPlayerIndex, card)) {
      setGameState(equipDefense(gs, humanPlayerIndex, card))
      playSound('play')
      notify(t('board.toast.equipped', { card: cardNameFor(card.name) }), 'success')
      return
    }
    const hand = gs.players[humanPlayerIndex].hand
    if (hand.some(c => c.type !== 'defense')) {
      notify(gs.equippedThisTurn ? t('result.oneDefense') : t('result.slotsFull', { max: 3 }))
      return
    }
    // Only defenses left and none can be equipped: discard this one as a Pass (no soft-lock)
    handlePass(card.id, gs)
    notify(t('result.passed', { card: cardNameFor(card.name) }))
  }

  /** Pass: discard one card and end the turn. */
  const handlePass = (cardId: string, base?: GameState) => {
    const gs = base ?? gameState
    if (!gs || animating || gs.phase !== 'play' || gs.currentPlayerIndex !== humanPlayerIndex) return
    const newState = passTurn({ ...gs, pendingDecision: null, pendingTarget: null }, humanPlayerIndex, cardId)
    if (newState.phase === 'game_over') { handleGameOver(newState) } else { setGameState(newState); setUiPhase('playing') }
    playSound('play')
  }

  const handleDecision = (choice: 'spend' | 'save' | 'invest') => {
    if (!gameState?.pendingDecision) return
    const { card } = gameState.pendingDecision
    const preview = previewDecision(gameState, humanPlayerIndex, card, choice)
    if (preview.disabled) {
      notify(localizeEngineText(preview.disabled))
      return
    }
    const newState = processDecision(gameState, humanPlayerIndex, choice, card)
    // Outcome banner: what happened + the mentor's lesson for this option
    const option = card.options?.find(o => o.type === choice)
    const nwDiff = getNetWorth(newState.players[humanPlayerIndex]) - getNetWorth(gameState.players[humanPlayerIndex])
    prevWealthRef.current = newState.players[humanPlayerIndex].wealth
    if (newState.phase !== 'game_over') {
      enqueuePopup({
        kind: choice,
        delta: nwDiff,
        investAmount: choice === 'invest' ? preview.investAmount : undefined,
        asset: choice === 'invest' ? preview.asset : undefined,
        cardName: card.name,
        insight: option?.mentorInsight ?? card.mentorInsight,
        concept: decisionConcept(card, choice),
      })
    }
    const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
    const withClear = { ...finalState, pendingDecision: null }
    if (finalState.phase === 'game_over') { handleGameOver(withClear) } else { setGameState(withClear); setUiPhase('playing') }
    playSound('play')
  }

  const handleTargetSelect = (targetIndex: number) => {
    if (!gameState?.pendingTarget) return
    const { card } = gameState.pendingTarget
    const newState = processAction(gameState, humanPlayerIndex, card, targetIndex)
    const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
    const withClear = { ...finalState, pendingTarget: null }
    if (finalState.phase === 'game_over') { handleGameOver(withClear) } else { setGameState(withClear); setUiPhase('playing') }
    playSound('attack')
    notify(t('game.hitTarget', { card: cardNameFor(card.name), name: gameState.players[targetIndex].name }))
  }

  const cancelPending = () => {
    const gs = gameStateRef.current
    if (gs) setGameState({ ...gs, pendingTarget: null, pendingDecision: null })
    setUiPhase('playing')
  }

  // Campaign levels start straight away (spec §E.11): the level intro was the confirmation.
  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (!levelId || uiPhase !== 'setup' || gameState || autoStartedRef.current) return
    autoStartedRef.current = true // StrictMode runs effects twice: open only one server match
    startGame()
  }, [levelId, uiPhase, gameState, startGame])

  // --- Android back button + keep-awake while a game is running ---
  const gameInProgress = !!gameState && uiPhase !== 'setup' && uiPhase !== 'result' && gameState.phase !== 'game_over'
  useKeepAwake(gameInProgress)
  // Back never silently leaves a running game: it backs out of a pick, closes the outcome
  // banner, or else asks for the forfeit confirmation.
  useBackButton(() => {
    if (popupInfo) { handlePopupContinue(); return }
    if (uiPhase === 'targeting' || uiPhase === 'decision') { cancelPending(); return }
    setShowForfeitModal(true)
  }, gameInProgress)

  if (uiPhase === 'setup') {
    // Campaign levels skip setup: the level intro already confirmed the start (auto-start effect above).
    if (levelId) return <PageLoader />
    return <SetupScreen botCount={botCount} setBotCount={setBotCount} onStart={startGame} onBack={() => navigate('/dashboard')} signedIn={!!profile?.id} />
  }

  if (uiPhase === 'result' && gameState) {
    const humanPlayer = gameState.players[humanPlayerIndex]
    const isWinner = gameState.winner?.id === humanPlayer.id
    const placement = [...gameState.players]
      .sort((a, b) => b.wealth - a.wealth)
      .findIndex(p => p.id === humanPlayer.id) + 1
    // Prefer the RP the server actually applied; before it answers, show the local estimate
    // (same table as the server: src/data/rankRules.ts).
    const rpChange = mode !== 'ranked' ? 0
      : serverResult ? serverResult.rp_change
      : calculateRankRP(rankedPlacement(isWinner, placement), gameState.players.length, profile?.win_streak ?? 0)
    // Campaign: "Next level" when this result unlocked it.
    const levelIdx = levelId ? ARTHA_YATRA_LEVELS.findIndex(l => l.id === levelId) : -1
    const nextLevel = levelIdx >= 0 && (levelStars?.stars ?? 0) >= STARS_TO_UNLOCK_NEXT ? ARTHA_YATRA_LEVELS[levelIdx + 1] : undefined

    return (
      <ResultScreen
        gameState={gameState}
        humanIndex={humanPlayerIndex}
        mode={mode}
        levelId={levelId}
        levelStars={levelStars}
        rpChange={rpChange}
        ownerKey={progressOwnerKey(user?.id)}
        onPlayAgain={() => {
          setLevelStars(null)
          clearSnapshot(snapKey)
          // Campaign levels restart straight away (the level intro was already confirmed).
          if (levelId) startGame()
          else { setGameState(null); setUiPhase('setup') }
        }}
        onHome={leaveToHome}
        onNextLevel={nextLevel ? () => { clearSnapshot(snapKey); navigate(`/game/level/${nextLevel.id}`) } : undefined}
        onOpenLibrary={() => { clearSnapshot(snapKey); navigate('/library') }}
      />
    )
  }

  if (!gameState) return null

  // Pause-menu title / desktop top-bar title (spec §E.12, q4: no level crest)
  const level = levelId ? ARTHA_YATRA_LEVELS.find(l => l.id === levelId) : undefined
  const goal = formatMoney(gameState.wealthGoal, { compact: true, lang: i18n.language })
  const bots = gameState.players.length - 1
  const modeTitle = level
    ? t('board.mode.level', { n: ARTHA_YATRA_LEVELS.indexOf(level) + 1, name: t(`campaign.levels.${level.id}.name`, { defaultValue: level.name }) })
    : mode === 'ranked' ? t('board.mode.ranked') : t('board.mode.practice')
  const modeSubtitle = level
    ? t('board.mode.levelSub', { goal, years: getRoundLimit(gameState) })
    : t('board.mode.botsSub', { count: bots, goal })

  return (
    <div className="game-page">
      <GameBoard
        gameState={gameState}
        myPlayerId={profile?.id ?? 'human'}
        isMultiplayer={false}
        uiPhase={uiPhase as UIPhase}
        onDrawCard={handleDrawCard}
        onPlayCard={handlePlayCard}
        onTargetSelect={handleTargetSelect}
        onDecision={handleDecision}
        onTimeout={handleTimeout}
        onCancelTargeting={cancelPending}
        daanikCoins={mode === 'ranked' ? 0 : profile?.daanik_coins ?? 0}
        onBuyExtraCard={handleBuyExtraCard}
        onPass={(cardId: string) => handlePass(cardId)}
        onEquip={(card: GameCardType) => handleEquip(card)}
        modeTitle={modeTitle}
        modeSubtitle={modeSubtitle}
        onQuit={() => setShowForfeitModal(true)}
      />
      <OutcomeBanner info={popupInfo} onNext={handlePopupContinue} />
      <ForfeitModal
        open={showForfeitModal}
        ranked={mode === 'ranked'}
        onCancel={() => setShowForfeitModal(false)}
        onConfirm={handleForfeit}
      />
    </div>
  )
}
