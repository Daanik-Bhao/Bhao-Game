import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recordLevelResult, progressOwnerKey } from '../lib/campaignProgress'
import { computeLevelStars, type LevelStarsResult } from '../lib/levelRules'
import { LevelStars, LevelRuleHUD } from '../components/campaign'
import { ForfeitModal } from '../components/ForfeitModal'
import { Button } from '../components/ui/Button'
import { GameState, PlayerState, GameCard as GameCardType, formatWealth } from '../types/game'
import { Wealth } from '../components/Wealth'
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
import Confetti from 'react-confetti'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { motion } from 'framer-motion'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { GameReportPanel } from '../components/learning/GameReportPanel'
import { assetName, cardNameFor, localizeEngineText } from '../components/game/economyUi'
import { translateLogEntry } from '../components/game/GameLog'
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



  if (uiPhase === 'setup') {
    return <SetupScreen botCount={botCount} setBotCount={setBotCount} onStart={startGame} onBack={() => navigate(levelId ? '/campaign' : '/dashboard')} levelId={levelId} />
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
    // Near-miss: player was within 20% of the goal but didn't win
    const wealthGap = gameState.wealthGoal - humanPlayer.wealth
    const nearMiss = !isWinner && wealthGap > 0 && wealthGap < gameState.wealthGoal * 0.2

    return (
      <>
      <ResultScreen
        isWinner={isWinner}
        placement={placement}
        finalWealth={humanPlayer.wealth}
        rpChange={rpChange}
        nearMiss={nearMiss}
        wealthGap={wealthGap}
        players={gameState.players}
        mode={mode}
        gameLog={gameState.log}
        report={
          <>
          {levelId && levelStars && (
            <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <LevelStars stars={levelStars.stars} criteria={levelStars.criteria} animate />
            </div>
          )}
          <GameReportPanel
            state={gameState}
            playerId={humanPlayer.id}
            ownerKey={progressOwnerKey(user?.id)}
            onOpenLibrary={() => navigate('/library')}
          />
          </>
        }
        onPlayAgain={() => { setGameState(null); setLevelStars(null); setUiPhase('setup') }}
        onDashboard={() => navigate('/dashboard')}
      />

      </>
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

        {/* Center Opponents HUD */}
        <div style={{
          position: 'absolute', top: 160, left: '50%', transform: 'translateX(-50%)',
          background: 'url("/avatars/player bar.webp") center / 100% 100% no-repeat',
          padding: '24px 64px 16px 64px', display: 'flex', gap: 48, pointerEvents: 'auto',
          minWidth: 400, justifyContent: 'center',
          zIndex: 30
        }}>
          {gameState.players.map((p) => {
            if (p.id === (profile?.id ?? 'human')) return null; // Skip local player
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={p.profile?.avatar_url?.startsWith('/') || p.profile?.avatar_url?.startsWith('http') ? p.profile.avatar_url : 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + p.name} style={{ width: '100%', height: '100%' }} alt="Avatar" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#4b5563', fontSize: 16, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: '#ef4444', fontSize: 14, fontWeight: 700 }}>{formatWealth(p.wealth)}</span>
                </div>
              </div>
            )
          })}
        </div>

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

function SetupScreen({ botCount, setBotCount, onStart, onBack, levelId }: { botCount: number; setBotCount: (n: number) => void; onStart: () => void; onBack: () => void; levelId?: string }) {
  const { t } = useTranslation()
  const levelConfig = levelId ? ARTHA_YATRA_LEVELS.find(l => l.id === levelId) : null;
  const wealthGoalText = levelConfig ? formatWealth(levelConfig.targetCorpus) : t('setup.defaultGoal');
  // Campaign levels have a fixed opponent count; only quick games let the player choose
  const opponents = levelConfig ? levelConfig.botCount : botCount;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#d1fae5', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes float1 { 0%, 100% { transform: translateY(0) rotate(-15deg); } 50% { transform: translateY(-20px) rotate(-12deg); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0) rotate(10deg); } 50% { transform: translateY(-15px) rotate(13deg); } }
        @keyframes float3 { 0%, 100% { transform: translateY(0) rotate(25deg); } 50% { transform: translateY(-25px) rotate(20deg); } }
        @keyframes float4 { 0%, 100% { transform: translateY(0) rotate(-20deg); } 50% { transform: translateY(-18px) rotate(-25deg); } }
      `}</style>

      {/* Subtle Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: 160, opacity: 0.04, animation: 'float1 8s ease-in-out infinite', pointerEvents: 'none' }}>📈</div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', fontSize: 200, opacity: 0.04, animation: 'float2 10s ease-in-out infinite', pointerEvents: 'none' }}>🏦</div>
      <div style={{ position: 'absolute', top: '20%', right: '15%', fontSize: 100, opacity: 0.05, animation: 'float3 7s ease-in-out infinite', pointerEvents: 'none' }}>🪙</div>
      <div style={{ position: 'absolute', bottom: '25%', left: '15%', fontSize: 120, opacity: 0.05, animation: 'float4 9s ease-in-out infinite', pointerEvents: 'none' }}>💰</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '100vw', height: '100vw', background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 60%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}></div>

      <div className="glass-card" style={{ width: '100%', maxWidth: 480, animation: 'slideUp 0.4s ease', background: '#eef8ef', padding: '24px 32px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)', position: 'relative', overflow: 'hidden', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>

        {/* Decorative background elements (Confetti & Coins) */}
        <div style={{ position: 'absolute', top: 30, right: 120, width: 8, height: 8, background: '#3b82f6', transform: 'rotate(45deg)' }}></div>
        <div style={{ position: 'absolute', top: 50, right: 150, width: 8, height: 8, background: '#10b981', transform: 'rotate(15deg)' }}></div>
        <div style={{ position: 'absolute', top: 80, right: 100, width: 10, height: 10, background: '#f59e0b', transform: 'rotate(30deg)' }}></div>
        <div style={{ position: 'absolute', top: 40, right: 80, width: 6, height: 6, background: '#ef4444', transform: 'rotate(60deg)' }}></div>
        <div style={{ position: 'absolute', top: 20, right: 180, width: 8, height: 8, background: '#f59e0b', transform: 'rotate(20deg)' }}></div>

        {/* Small floating coins */}
        <div style={{ position: 'absolute', top: 25, right: 140, width: 28, height: 28, background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', borderRadius: '50%', boxShadow: '0 4px 8px rgba(245,158,11,0.3)', border: '2px solid #FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)' }}>
          <span style={{ fontSize: 14, color: '#D97706', fontWeight: 900 }}>$</span>
        </div>
        <div style={{ position: 'absolute', top: 70, right: 110, width: 18, height: 18, background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', borderRadius: '50%', boxShadow: '0 2px 4px rgba(245,158,11,0.3)', border: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, color: '#D97706', fontWeight: 900 }}>$</span>
        </div>

        {/* Large Gold Coin */}
        <div style={{
          position: 'absolute', top: 20, right: -10,
          width: 90, height: 90,
          background: 'linear-gradient(135deg, #FBBF24, #D97706)',
          borderRadius: '50%',
          boxShadow: '0 8px 16px rgba(217,119,6,0.4), inset 0 4px 8px rgba(255,255,255,0.4), inset 0 -4px 8px rgba(0,0,0,0.2)',
          border: '4px solid #FEF3C7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(-15deg)'
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36, color: '#FEF3C7', fontWeight: 800, textShadow: '0 2px 4px rgba(217,119,6,0.8)' }}>S</span>
          </div>
        </div>

        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 10 }}>
          ← {t('board.back')}
        </button>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#002020', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 28, position: 'relative', zIndex: 10 }}>{t('setup.newGame')}</h1>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 16 }}>{t('setup.aiOpponents')}</h3>
          {!levelConfig && <div style={{ display: 'flex', gap: 10 }}>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setBotCount(n)}
                style={{
                  width: 52, height: 52, borderRadius: 12,
                  border: botCount === n ? '2px solid #3b82f6' : '1px solid rgba(0,0,0,0.08)',
                  background: botCount === n ? '#eff6ff' : '#ffffff',
                  color: botCount === n ? '#1d4ed8' : '#4b5563',
                  fontWeight: 700, fontSize: 20,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                  boxShadow: botCount === n ? '0 2px 8px rgba(59,130,246,0.15)' : 'none'
                }}
              >
                {n}
              </button>
            ))}
          </div>}
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: levelConfig ? 0 : 16 }}>{t('setup.playingAgainst', { n: opponents, total: opponents + 1 })}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span style={{ fontSize: 15, color: '#4b5563', fontWeight: 500 }}>
            {t('setup.raceTo')} <span style={{ color: '#d97706', fontWeight: 800 }}>{wealthGoalText}</span>
          </span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: '20px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>

          {/* Stacked Coins Image */}
          <img src="/avatars/coins bag.webp" alt={t('setup.entryReward')} style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 8px 12px rgba(217,119,6,0.3))', flexShrink: 0 }} />

          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}>{t('setup.entryReward')}</h4>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>{t('setup.winToEarn')}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-bright)' }}>+100 DC</div>
          </div>
        </div>

        <button
          onClick={onStart}
          style={{
            width: '100%',
            background: 'var(--green-forest)',
            color: 'white',
            borderRadius: 12,
            padding: '16px',
            fontSize: 17,
            fontWeight: 700,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,48,32,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,48,32,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,48,32,0.3)' }}
        >
          <div style={{ background: 'white', color: 'var(--green-forest)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>
          {t('setup.startGame')}
        </button>
      </div>
    </div>
  )
}
function ResultScreen({ isWinner, placement, finalWealth, rpChange, players, mode, onPlayAgain, onDashboard, nearMiss, wealthGap, gameLog, report }: { isWinner: boolean; placement: number; finalWealth: number; rpChange: number; players: PlayerState[]; mode: string; onPlayAgain: () => void; onDashboard: () => void; nearMiss?: boolean; wealthGap?: number; gameLog: string[]; report?: ReactNode }) {
  const { t, i18n } = useTranslation()
  const sorted = [...players].sort((a, b) => b.wealth - a.wealth)
  const [showLog, setShowLog] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 24px)', paddingBottom: 0, zIndex: 100, position: 'relative' }}>
      {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f1f5f9']} />}
      <div style={{ width: '100%', maxWidth: 900, textAlign: 'center', zIndex: 10 }}>
        {/* Massive Text Stamp */}
        <motion.div
          initial={{ scale: 3, opacity: 0, rotate: isWinner ? 0 : -15 }}
          animate={{ scale: 1, opacity: 1, rotate: isWinner ? 0 : -5 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{
            fontSize: 'clamp(60px, 15vw, 100px)',
            fontWeight: 900,
            fontFamily: 'Space Grotesk, sans-serif',
            color: isWinner ? '#f59e0b' : '#64748b',
            textTransform: 'uppercase',
            textShadow: isWinner ? '0 0 40px rgba(245,158,11,0.6), 0 0 100px rgba(245,158,11,0.4)' : '0 10px 20px rgba(0,0,0,0.8)',
            lineHeight: 1,
            letterSpacing: '-0.05em'
          }}>
            {isWinner ? t('result.youWin') : t('result.betterLuck')}
          </div>
          {!isWinner && (
            <div style={{ color: '#94a3b8', fontSize: 24, fontWeight: 700, marginTop: 8 }}>
              {nearMiss ? `${t('result.soClose')} 😤` : t('result.place', { n: placement, ordinal: t(`result.ordinal.${Math.min(placement, 4)}`) })}
            </div>
          )}
        </motion.div>
        {nearMiss && wealthGap !== undefined && (
          <p style={{ color: 'var(--orange-primary)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {t('result.justAway', { amount: formatWealth(wealthGap) })}
          </p>
        )}
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 20 }}>{t('game.finalWealth', { amount: formatWealth(finalWealth) })}</p>

        {mode === 'ranked' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: rpChange > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${rpChange > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, marginBottom: 28 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: rpChange > 0 ? 'var(--green-primary)' : 'var(--orange-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {rpChange > 0 ? '+' : ''}{rpChange} RP
            </span>
          </div>
        )}

        {report}

        {/* Final Rankings & Highlights */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: 16, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ flex: '1 1 280px', background: 'var(--green-deep)', border: '1px solid var(--green-primary)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('game.finalRankings')}
            </h3>
            {sorted.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--green-primary)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 25, width: 28 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span style={{
                    fontSize: 18,
                    fontWeight: !p.isBot ? 700 : 500,
                    color: !p.isBot ? 'var(--green-bright)' : 'var(--green-light)',
                  }}>
                    {p.name}
                  </span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-bright)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  <Wealth amount={p.wealth} />
                </span>
              </div>
            ))}
          </div>

          {/* Match Highlights (collapsed by default; the report card above is the summary) */}
          {gameLog && gameLog.length > 0 && (
            <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center' }}>
              <button className="rc-log-toggle" aria-expanded={showLog} onClick={() => setShowLog(v => !v)}>
                {showLog ? `${t('result.hideLog')} ▲` : `${t('result.showLog')} ▼`}
              </button>
            </div>
          )}
          {showLog && gameLog && gameLog.length > 0 && (
            <div style={{ flex: '1 1 280px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, textAlign: 'left', maxHeight: 250, overflowY: 'auto' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray)', marginBottom: 8, textTransform: 'uppercase' }}>{t('result.highlights')}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gameLog.slice(0, 15).map((entry: string, idx: number) => (
                  <li key={idx} style={{ opacity: 1 - (idx * 0.05), lineHeight: 1.4 }}>• {translateLogEntry(entry, i18n.language)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'sticky', bottom: 0, padding: '12px 0 max(16px, env(safe-area-inset-bottom))', background: 'linear-gradient(to bottom, rgba(0,16,16,0), var(--green-black) 35%)', zIndex: 20 }}>
          <div className="btn-rebound" style={{ boxShadow: '0 0 20px rgba(244, 210, 123, 0.4)', borderRadius: 12 }}>
            <Button variant="gold" size="lg" onClick={onPlayAgain} style={{ minWidth: 200 }}>{t('result.playAgain')}</Button>
          </div>
          <div className="btn-rebound">
            <Button variant="secondary" size="lg" onClick={onDashboard} style={{ minWidth: 200 }}>{t('result.dashboard')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
