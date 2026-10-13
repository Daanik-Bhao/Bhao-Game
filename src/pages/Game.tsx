import { useState, useEffect, useCallback, useRef } from 'react'
import { useBackButton, useKeepAwake } from '../hooks/useBackButton'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recordLevelResult, progressOwnerKey, STARS_TO_UNLOCK_NEXT } from '../lib/campaignProgress'
import { SetupScreen } from './game/SetupScreen'
import { ResultScreen } from './game/ResultScreen'
import { PageLoader } from '../components/ui'
import { computeLevelStars, type LevelStarsResult } from '../lib/levelRules'
import { LevelRuleHUD } from '../components/campaign'
import { ForfeitModal } from '../components/ForfeitModal'
import { GameState, GameCard as GameCardType } from '../types/game'
import {
  initGame, initLevelGame, startDrawPhase, processDecision, processAction,
  advanceTurn, doBotTurn, forceSkipTurn, drawCard, equipDefense, TURN_TIME_LIMIT_MS,
  STARTING_WEALTH, canEquip, passTurn, previewDecision, getNetWorth, getRoundLimit
} from '../lib/gameEngine'
import { ARTHA_YATRA_LEVELS } from '../data/levels'
import { startMatch, saveMatchResult, spendCoins, type SinglePlayerMode } from '../lib/auth'
import { calculateRankRP, EXTRA_CARD_COST } from '../data/rankRules'
import type { MatchResultSummary } from '../types/database'
import { useTranslation } from 'react-i18next'
import { ALL_CARDS } from '../data/cards'
import { playSound } from '../lib/audio'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { motion } from 'framer-motion'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { assetName, cardNameFor, localizeEngineText } from '../components/game/economyUi'
import { ASSETS } from '../data/assets'
import { pickLang } from '../i18n/lang'

type GamePhaseUI = 'setup' | UIPhase | 'result'

interface PopupInfo {
  reason: string
  reasonHi?: string
  sourceName?: string
  isSelf?: boolean
  description?: string
  descriptionHi?: string
  amountStr: string
  isGain: boolean
  /** Overrides the computed title (e.g. "YEAR 3 / 20") */
  title?: string
  /** Mentor lesson for the choice just made */
  insight?: string
  /** Extra lines (round news, "₹X moved into ...") */
  lines?: string[]
}

/**
 * Placement reported to the server: the winner is always 1st, and a non-winner is
 * never 1st (the winner can differ from the richest player, e.g. by reaching the
 * target net worth first or when the richest player went bankrupt).
 */
function rankedPlacement(isWinner: boolean, wealthPlacement: number): number {
  return isWinner ? 1 : Math.max(2, wealthPlacement)
}

function GameClock({ startTime, timeLimit }: { startTime: number; timeLimit: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const elapsed = now - startTime
  const remaining = Math.max(0, timeLimit - elapsed)
  const minutesLeft = Math.floor(remaining / 60000)
  const secondsLeft = Math.floor((remaining % 60000) / 1000)

  return (
    <div style={{ fontSize: 16, color: minutesLeft < 5 ? '#ef4444' : '#fff', fontWeight: 700 }}>
      ⏱ {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
    </div>
  )
}

export function Game() {
  const { t, i18n } = useTranslation()
  const { levelId } = useParams()
  const [params] = useSearchParams()
  const mode = levelId ? 'campaign' : (params.get('mode') ?? 'ranked')
  // Server match mode for signed-in games (unknown query modes count as practice).
  const matchMode: SinglePlayerMode = mode === 'campaign' ? 'campaign' : mode === 'ranked' ? 'ranked' : 'practice'
  const navigate = useNavigate()
  const { user, profile, guestProfile, refreshProfile } = useAuth()
  usePreloadImages()
  // Server match for this game (signed-in only). Resolves to null if it could not be opened.
  const matchIdRef = useRef<Promise<string | null> | null>(null)
  const gameSeqRef = useRef(0)
  const [serverResult, setServerResult] = useState<MatchResultSummary | null>(null)

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [levelStars, setLevelStars] = useState<LevelStarsResult | null>(null)
  const [showLevelRule, setShowLevelRule] = useState(false)
  const gameStateRef = useRef<GameState | null>(null)
  const [uiPhase, setUiPhase] = useState<GamePhaseUI>('setup')

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])
  const [botCount, setBotCount] = useState(2)
  const [animating, setAnimating] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [showForfeitModal, setShowForfeitModal] = useState(false)
  // Outcome popups are queued so a decision result and a "new year" summary can both be shown.
  const [popupQueue, setPopupQueue] = useState<PopupInfo[]>([])
  const popupInfo = popupQueue[0] ?? null
  // When the outcome popup opens we remember when, so the human's turn timer can be
  // paused (turnStartTime shifted forward) for as long as the popup blocks the board.
  const popupOpenedAtRef = useRef<number | null>(null)
  const enqueuePopup = useCallback((info: PopupInfo) => {
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
  const prevWealthRef = useRef(STARTING_WEALTH)
  const prevRoundRef = useRef(1)

  const humanPlayerIndex = 0

  const notify = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const startGame = useCallback(() => {
    const humanName = profile?.username ?? guestProfile?.username ?? 'You'
    const humanAvatar = profile?.avatar_url ?? guestProfile?.avatar_url ?? undefined
    let state: GameState
    if (levelId) {
      const level = ARTHA_YATRA_LEVELS.find(l => l.id === levelId)
      if (level) {
        // Campaign levels define their own opponent count
        state = initLevelGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: humanAvatar }, level)
      } else {
        state = initGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: humanAvatar }, botCount)
      }
    } else {
      state = initGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: humanAvatar }, botCount)
    }
    // Baseline for the wealth-change popup is the actual starting wealth of this game
    prevWealthRef.current = state.players[humanPlayerIndex].wealth
    prevRoundRef.current = state.round ?? 1
    popupOpenedAtRef.current = null
    setPopupQueue([])
    setServerResult(null)
    gameSeqRef.current += 1
    // Signed-in games open a server match; guests skip all server calls.
    matchIdRef.current = profile?.id
      ? startMatch(matchMode, levelId ?? null, state.players.length).catch(err => {
          console.error('Failed to start match:', err)
          return null
        })
      : null
    setGameState(state)
    setUiPhase('playing')
  }, [profile, guestProfile, botCount, levelId, matchMode])

  /** Reports the result of the current server match (no-op for guests or if start_match failed). */
  const reportResult = useCallback(async (result: { won: boolean; placement: number; totalPlayers: number; finalWealth: number; forfeit?: boolean; stats?: { investChoices: number; emiDamageTaken: boolean } }) => {
    const pending = matchIdRef.current
    const seq = gameSeqRef.current
    matchIdRef.current = null
    const matchId = pending ? await pending : null
    if (!matchId) return
    try {
      const saved = await saveMatchResult({ matchId, ...result })
      // Ignore a late answer if another game has started meanwhile.
      if (saved && seq === gameSeqRef.current) setServerResult(saved)
    } catch {
      /* logged in saveMatchResult; the result screen falls back to the local estimate */
    }
    await refreshProfile()
  }, [refreshProfile])



  const handleGameOver = useCallback((finalState: GameState) => {
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
  }, [profile, user, levelId, humanPlayerIndex, reportResult])

  const handleForfeit = () => {
    setShowForfeitModal(false)
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

  // Check for wealth changes to show popup
  useEffect(() => {
    if (!gameState) return
    const humanPlayer = gameState.players[humanPlayerIndex]
    if (!humanPlayer) return

    const wealthDiff = humanPlayer.wealth - prevWealthRef.current
    const round = gameState.round ?? 1
    const newYear = round > prevRoundRef.current && !!gameState.roundNews
    prevRoundRef.current = round
    const inPlay = uiPhase !== 'setup' && uiPhase !== 'result' && gameState.phase !== 'game_over'

    if (newYear && inPlay) {
      // The board's non-blocking Year strip shows the market / inflation / life-event news
    } else if (wealthDiff !== 0 && inPlay) {
      let reason = gameState.log[0] || 'Wealth updated'
      let description = ''
      let sourceName = ''
      let isSelf = false

      const sourceMatch = gameState.log[0]?.match(/^(.*?) played/)
      if (sourceMatch && sourceMatch[1]) {
        sourceName = sourceMatch[1]
        isSelf = sourceName === humanPlayer.name
      }

      let reasonHi: string | undefined
      let descriptionHi: string | undefined
      const match = reason.match(/played (.*?) (?:→|—)/)
      if (match && match[1]) {
        reason = match[1]
        const card = ALL_CARDS.find(c => c.name === reason)
        if (card) {
          description = card.flavor
          reasonHi = card.nameHi
          descriptionHi = card.flavorHi
        }
      }

      enqueuePopup({
        reason,
        reasonHi,
        sourceName,
        isSelf,
        description,
        descriptionHi,
        amountStr: wealthDiff > 0 ? `+₹${Math.abs(wealthDiff).toLocaleString()}` : `-₹${Math.abs(wealthDiff).toLocaleString()}`,
        isGain: wealthDiff > 0
      })
    }

    prevWealthRef.current = humanPlayer.wealth
  }, [gameState, uiPhase, enqueuePopup, i18n.language])

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
    notify('Time ran out! Turn skipped.')
  }, [humanPlayerIndex, handleGameOver])

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
      notify(t('game.notEnoughCoins', { defaultValue: 'Not enough DAANIK coins' }))
      return
    }
    void refreshProfile()

    // Draw card
    const { state: newState } = drawCard(gameState, humanPlayerIndex)
    setGameState(newState)
    playSound('draw')
    notify('Extra card drawn! -25 🪙')
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
      notify(t('result.defenseEquipped'))
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
    // Outcome popup: what happened + the mentor's lesson for this option
    const option = card.options?.find(o => o.type === choice)
    const nwDiff = getNetWorth(newState.players[humanPlayerIndex]) - getNetWorth(gameState.players[humanPlayerIndex])
    prevWealthRef.current = newState.players[humanPlayerIndex].wealth
    if (newState.phase !== 'game_over') {
      const invested = choice === 'invest' && preview.asset
      enqueuePopup({
        title: invested ? t('popup.invested') : undefined,
        reason: pickLang(card.name, card.nameHi, i18n.language),
        sourceName: newState.players[humanPlayerIndex].name,
        isSelf: true,
        description: option?.description,
        descriptionHi: option?.descriptionHi,
        insight: option?.mentorInsight ?? card.mentorInsight,
        lines: invested
          ? [t('popup.movedInto', { amount: `₹${preview.investAmount.toLocaleString('en-IN')}`, asset: `${ASSETS[preview.asset!].emoji} ${assetName(ASSETS[preview.asset!])}` })]
          : newState.log.slice(1, 4).filter(l => /Streak|had to sell|Shield/.test(l)),
        amountStr: invested ? `₹${preview.investAmount.toLocaleString()}` : `${nwDiff >= 0 ? '+' : '-'}₹${Math.abs(nwDiff).toLocaleString()}`,
        isGain: nwDiff >= 0,
      })
    }
    const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
    const withClear = { ...finalState, pendingDecision: null }
    if (finalState.phase === 'game_over') { handleGameOver(withClear) } else { setGameState(withClear); setUiPhase('playing') }
    playSound('play')
    notify(t('result.choiceMade', { choice: t(`econ.choice.${choice}`) }))
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
  // popup, or else asks for the forfeit confirmation.
  useBackButton(() => {
    if (popupInfo) { handlePopupContinue(); return }
    const gs = gameStateRef.current
    if ((uiPhase === 'targeting' || uiPhase === 'decision') && gs) {
      setGameState({ ...gs, pendingTarget: null })
      setUiPhase('playing')
      return
    }
    setShowForfeitModal(true)
  }, gameInProgress)
  // Pushed on top when the modal opens, so a second back press closes it.
  useBackButton(() => setShowForfeitModal(false), showForfeitModal)

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
          // Campaign levels restart straight away (the level intro was already confirmed).
          if (levelId) startGame()
          else { setGameState(null); setUiPhase('setup') }
        }}
        onHome={() => navigate('/dashboard')}
        onNextLevel={nextLevel ? () => navigate(`/game/level/${nextLevel.id}`) : undefined}
        onOpenLibrary={() => navigate('/library')}
      />
    )
  }

  if (!gameState) return null

  const themeClass = levelId === 'level_2' ? 'theme-level2' : levelId === 'level_3' ? 'theme-level3' : ''
  return (
    <div className={themeClass} style={{ minHeight: '100dvh', background: 'url("/avatars/image copy.webp") center / cover no-repeat', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Background Laser Lines Overlay (Approximation of image.png) */}

      {/* --- DESKTOP GAME HUD --- */}
      <div className="desktop-game-flex" style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40,
        height: 100, pointerEvents: 'none', display: 'flex', justifyContent: 'center'
      }}>
        {/* Level Indicator */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 80,
          background: 'url("/avatars/level bar.webp") center top / contain no-repeat',
          zIndex: 60,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 16
        }}>
          {/* Hack to cover baked-in "LEVEL - 1" text with dynamic text */}
          <div style={{ background: '#08170D', padding: '0 24px', color: '#E8F5E9', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: 1, borderRadius: 4 }}>
            {mode === 'campaign' && levelId ? t('result.levelBanner', { n: levelId.split('_')[1] }) : t(`result.mode.${mode}`, { defaultValue: mode.toUpperCase() })}
          </div>
        </div>

        {/* EXIT Button */}
        <button onClick={() => setShowForfeitModal(true)} style={{
          position: 'absolute', left: 40, top: 24,
          background: 'url("/avatars/exit button.webp") center / contain no-repeat',
          width: 140, height: 48,
          border: 'none', cursor: 'pointer', pointerEvents: 'auto',
          backgroundColor: 'transparent'
        }}>
        </button>

        {/* TIMER */}
        <div style={{
          position: 'absolute', right: 40, top: 24,
          background: 'rgba(12, 108, 78, 0.55)', borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 24, fontWeight: 700,
          fontFamily: 'Avengenz, sans-serif', padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <GameClock startTime={gameState.startTime} timeLimit={gameState.timeLimit} />
          <span style={{ fontSize: 16, opacity: 0.85 }}>{t('econ.year.long', { n: gameState.round ?? 1, max: getRoundLimit(gameState) })}</span>
        </div>
      </div>

      {/* --- MOBILE LANDSCAPE HUD --- */}
      <div className="mobile-landscape-flex" style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40,
        height: 80, pointerEvents: 'none', justifyContent: 'center'
      }}>
        {/* Level Indicator */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 50,
          background: 'url("/avatars/level bar.webp") center top / contain no-repeat',
          zIndex: 60
        }} />

        {/* EXIT Button */}
        <button onClick={() => setShowForfeitModal(true)} style={{
          position: 'absolute', left: 16, top: 12,
          background: 'url("/avatars/exit button.webp") center / contain no-repeat',
          width: 100, height: 36,
          border: 'none', cursor: 'pointer', pointerEvents: 'auto',
          backgroundColor: 'transparent'
        }} />

        {/* TIMER */}
        <div style={{
          position: 'absolute', right: 16, top: 12,
          background: 'rgba(12, 108, 78, 0.55)', borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 700,
          fontFamily: 'Avengenz, sans-serif', padding: '6px 12px',
          display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'auto'
        }}>
          <GameClock startTime={gameState.startTime} timeLimit={gameState.timeLimit} />
        </div>
      </div>



      {showForfeitModal && (
        <ForfeitModal
          onCancel={() => setShowForfeitModal(false)}
          onConfirm={handleForfeit}
        />
      )}

      {notification && (
        <div style={{
          position: 'fixed', top: 100, right: 40,
          background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, padding: '11px 18px',
          fontSize: 18, color: '#f1f5f9', zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {notification}
        </div>
      )}

      <div className="game-content-wrapper" style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {levelId && gameState.levelState?.rule && (
          <div style={{ position: 'absolute', left: 8, bottom: 8, zIndex: 60, maxWidth: 'min(320px, calc(100vw - 16px))' }}>
            {showLevelRule && (
              <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 10, marginBottom: 6, boxShadow: '0 6px 20px rgba(0,0,0,0.25)', color: '#1f2937' }}>
                <LevelRuleHUD state={gameState} />
              </div>
            )}
            <button
              onClick={() => setShowLevelRule(v => !v)}
              aria-expanded={showLevelRule}
              style={{ minHeight: 44, padding: '8px 14px', borderRadius: 999, border: 'none', background: '#0f5132', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
            >
              🎯 {t('campaign.hud.toggle')}
            </button>
          </div>
        )}
        <GameBoard
          showOpponents
          gameState={gameState}
          myPlayerId={profile?.id ?? 'human'}
          isMultiplayer={false}
          uiPhase={uiPhase as UIPhase}
          onDrawCard={handleDrawCard}
          onPlayCard={handlePlayCard}
          onTargetSelect={handleTargetSelect}
          onDecision={handleDecision}
          onTimeout={handleTimeout}
          onCancelTargeting={() => {
            setGameState({ ...gameState, pendingTarget: null })
            setUiPhase('playing')
          }}
          daanikCoins={mode === 'ranked' ? 0 : profile?.daanik_coins ?? 0}
          onBuyExtraCard={handleBuyExtraCard}
          onPass={(cardId: string) => handlePass(cardId)}
          onEquip={(card: GameCardType) => handleEquip(card)}
        />
      </div>

      {popupInfo && (
        <EventPopup info={popupInfo} onContinue={handlePopupContinue} />
      )}

    </div>
  )
}

function EventPopup({ info, onContinue }: { info: PopupInfo, onContinue: () => void }) {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    // Lessons and year summaries need a little longer to read
    const timer = setTimeout(() => {
      onContinue()
    }, info.insight || info.lines?.length ? 7000 : 4000)
    return () => clearTimeout(timer)
  }, [onContinue, info])

  const title = info.title ?? (info.isGain
    ? t('popup.gained')
    : (info.sourceName && !info.isSelf && info.sourceName !== 'Game'
      ? t('popup.attacked', { name: info.sourceName })
      : t('popup.lost')));

  const reason = pickLang(info.reason, info.reasonHi, i18n.language)
  const description = info.description ? pickLang(info.description, info.descriptionHi, i18n.language) : ''

  return (
    <div
      onClick={onContinue}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 10, 5, 0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, cursor: 'pointer'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          width: '90%', maxWidth: 621, minHeight: 400,
          background: info.isGain 
            ? 'linear-gradient(180.64deg, #0B7F4C 0.55%, #91C650 57.12%, #FCE894 131.53%)'
            : 'linear-gradient(180.64deg, #7F0B24 0.55%, #C65050 57.12%, #FC9494 131.53%)',
          borderRadius: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          padding: '40px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 32,
          letterSpacing: '0.09em', textTransform: 'uppercase', color: '#FFFFFF',
          textShadow: '0 4px 10px rgba(0,0,0,0.2)', marginBottom: 24, textAlign: 'center', zIndex: 2
        }}>
          {title}
        </div>

        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          opacity: 0.15, zIndex: 1, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {info.isGain ? (
            <TrendingUp size={300} color="#000000" strokeWidth={1.5} />
          ) : (
            <TrendingDown size={300} color="#000000" strokeWidth={1.5} />
          )}
        </div>

        <div style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 28,
          color: info.isGain ? '#0d4026' : '#400d14', textAlign: 'center', width: '90%',
          marginBottom: 16, zIndex: 2
        }}>
          {reason}
        </div>

        {description && (
          <div style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 20,
            color: '#4B5563', textAlign: 'center', width: '90%', zIndex: 2, marginBottom: 24
          }}>
            "{description}"
          </div>
        )}

        <div style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(50px, 8vw, 80px)',
          letterSpacing: '0.04em',
          background: info.isGain 
            ? 'linear-gradient(0deg, #18372E 0%, #007A54 100%)'
            : 'linear-gradient(0deg, #371818 0%, #7A0000 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', color: 'transparent',
          filter: 'drop-shadow(0px 2px 4px rgba(255,255,255,0.4))',
          textAlign: 'center', zIndex: 2
        }}>
          {info.amountStr}
        </div>

        {info.lines && info.lines.length > 0 && (
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, zIndex: 2, width: '90%', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#ffffff', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {info.lines.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}

        {info.insight && (
          <div style={{ marginTop: 16, zIndex: 2, width: '90%', background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '12px 16px', fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#ffffff', textAlign: 'center' }}>
            💡 {info.insight}
          </div>
        )}
      </motion.div>
    </div>
  )
}
