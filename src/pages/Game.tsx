import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ForfeitModal } from '../components/ForfeitModal'
import { Button } from '../components/ui/Button'
import { GameState, PlayerState, GameCard as GameCardType, formatWealth } from '../types/game'
import { Wealth } from '../components/Wealth'
import {
  initGame, initLevelGame, startDrawPhase, processDecision, processAction,
  advanceTurn, doBotTurn, forceSkipTurn, drawCard, TURN_TIME_LIMIT_MS, calculateRPChange
} from '../lib/gameEngine'
import { ARTHA_YATRA_LEVELS } from '../data/levels'
import { saveGameResult } from '../lib/auth'
import { useTranslation } from 'react-i18next'
import { ALL_CARDS } from '../data/cards'
import { playSound } from '../lib/audio'
import Confetti from 'react-confetti'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { TrendingUp, TrendingDown } from 'lucide-react'

type GamePhaseUI = 'setup' | UIPhase | 'result'

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
  const { i18n } = useTranslation()
  const { levelId } = useParams()
  const [params] = useSearchParams()
  const mode = levelId ? 'campaign' : (params.get('mode') ?? 'ranked')
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  usePreloadImages()

  const [gameState, setGameState] = useState<GameState | null>(null)
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
  const [popupInfo, setPopupInfo] = useState<{ reason: string, reasonHi?: string, sourceName?: string, isSelf?: boolean, description?: string, descriptionHi?: string, amountStr: string, isGain: boolean } | null>(null)
  const handlePopupContinue = useCallback(() => setPopupInfo(null), [])
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevWealthRef = useRef(500000)

  const humanPlayerIndex = 0

  const notify = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const startGame = useCallback(() => {
    const humanName = profile?.username ?? 'You'
    let state: GameState
    if (levelId) {
      const level = ARTHA_YATRA_LEVELS.find(l => l.id === levelId)
      if (level) {
        state = initLevelGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: profile?.avatar_url }, { ...level, botCount })
      } else {
        state = initGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: profile?.avatar_url }, botCount)
      }
    } else {
      state = initGame({ id: profile?.id ?? 'human', name: humanName, avatar_url: profile?.avatar_url }, botCount)
    }
    setGameState(state)
    setUiPhase('playing')
  }, [profile, botCount, levelId])



  const handleGameOver = useCallback((finalState: GameState) => {
    setGameState(finalState)
    setUiPhase('result')
    if (profile?.id && profile?.username) {
      const humanPlayer = finalState.players[humanPlayerIndex]
      const isWinner = finalState.winner?.id === humanPlayer.id
      const placement = [...finalState.players]
        .sort((a, b) => b.wealth - a.wealth)
        .findIndex(p => p.id === humanPlayer.id) + 1
      if (isWinner) playSound('win')
      else playSound('lose')
      saveGameResult(
        profile.id, profile.username, isWinner, humanPlayer.wealth,
        placement, finalState.players.length, profile.win_streak ?? 0,
        { investChoices: humanPlayer.investChoices, emiDamageTaken: humanPlayer.emiDamageTaken }
      ).then(() => { refreshProfile() })
    }
  }, [profile, humanPlayerIndex, refreshProfile])

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
      saveGameResult(profile.id, profile.username, false, humanPlayer.wealth).then(async () => {
        await supabase.from('profiles').update({ daank_coins: Math.max(0, (profile.daank_coins || 0) - 25) }).eq('id', profile.id)
        await refreshProfile()
        navigate('/dashboard')
      })
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

    // Only show popup during active gameplay
    if (wealthDiff !== 0 && uiPhase !== 'setup' && uiPhase !== 'result' && gameState.phase !== 'game_over') {
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

      setPopupInfo({
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
  }, [gameState, uiPhase])

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

    const currentCoins = profile?.daank_coins ?? 0
    if (currentCoins < 25) return

    // Deduct coins locally first for immediate feedback
    if (profile) {
      profile.daank_coins = currentCoins - 25
    }

    // Call Supabase to deduct
    if (profile?.id) {
      await supabase.from('profiles').update({ daank_coins: Math.max(0, currentCoins - 25) }).eq('id', profile.id)
      await refreshProfile()
    }

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
          notify(`${card.name} hit ${currentState.players[targetIndex].name}!`)
        } else {
          setGameState({ ...currentState, pendingTarget: { card, playerIndex: humanPlayerIndex, effect: card.effect! } })
          setUiPhase('targeting')
        }
      } else {
        const newState = processAction(currentState, humanPlayerIndex, card, humanPlayerIndex)
        const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
        if (finalState.phase === 'game_over') { handleGameOver(finalState) } else { setGameState(finalState) }
        playSound('play')
        notify(`Played ${card.name}!`)
      }
    } else if (card.type === 'defense') {
      const activeDefenses = [...currentState.players[humanPlayerIndex].activeDefenses, card]
      const hand = currentState.players[humanPlayerIndex].hand.filter(c => c.id !== card.id)
      const updatedPlayers = currentState.players.map((p, i) => i === humanPlayerIndex ? { ...p, hand, activeDefenses } : p)
      const newState = advanceTurn({ ...currentState, players: updatedPlayers })
      if (newState.phase === 'game_over') { handleGameOver(newState) } else { setGameState(newState) }
      playSound('play')
      if (newState.players[humanPlayerIndex].activeDefenses.length > currentState.players[humanPlayerIndex].activeDefenses.length) {
        notify(i18n.language === 'hi' ? 'रक्षा कार्ड सुसज्जित!' : 'Equipped defense card!')
      }
    }
  }

  const handleDecision = (choice: 'spend' | 'save' | 'invest') => {
    if (!gameState?.pendingDecision) return
    const { card } = gameState.pendingDecision
    const newState = processDecision(gameState, humanPlayerIndex, choice, card)
    const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
    const withClear = { ...finalState, pendingDecision: null }
    if (finalState.phase === 'game_over') { handleGameOver(withClear) } else { setGameState(withClear); setUiPhase('playing') }
    playSound('play')
    notify(`${choice.charAt(0).toUpperCase() + choice.slice(1)} choice made!`)
  }

  const handleTargetSelect = (targetIndex: number) => {
    if (!gameState?.pendingTarget) return
    const { card } = gameState.pendingTarget
    const newState = processAction(gameState, humanPlayerIndex, card, targetIndex)
    const finalState = newState.phase !== 'game_over' ? advanceTurn(newState) : newState
    const withClear = { ...finalState, pendingTarget: null }
    if (finalState.phase === 'game_over') { handleGameOver(withClear) } else { setGameState(withClear); setUiPhase('playing') }
    playSound('attack')
    notify(`${card.name} hit ${gameState.players[targetIndex].name}!`)
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
    const rpChange = mode === 'ranked' ? calculateRPChange(placement, gameState.players.length, profile?.win_streak ?? 0) : 0
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
        players={gameState.players.filter(p => !p.isBot)}
        mode={mode}
        gameLog={gameState.log}
        onPlayAgain={() => { setGameState(null); setUiPhase('setup') }}
        onDashboard={() => navigate('/dashboard')}
      />
      
      {/* LANDSCAPE OVERLAY (Rotate Back to Portrait) - Only visible on Result screen in landscape */}
      <div className="mobile-landscape-overlay">
        <div style={{
          width: 80, height: 80,
          background: 'url("/avatars/rotate screen.webp") center / contain no-repeat',
          marginBottom: 24
        }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
          Rotate back to Portrait view
        </h2>
      </div>
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
            {mode === 'campaign' && levelId ? `LEVEL - ${levelId.split('_')[1]}` : (mode === 'ranked' ? 'RANKED' : mode.toUpperCase())}
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

        {/* Center Opponents HUD */}
        <div style={{
          marginTop: 45,
          background: 'url("/avatars/player bar.webp") center / 100% 100% no-repeat',
          padding: '16px 40px 12px 40px', display: 'flex', gap: 24, pointerEvents: 'auto',
          justifyContent: 'center', position: 'relative', zIndex: 30, transform: 'scale(0.8)', transformOrigin: 'top center'
        }}>
          {gameState.players.map((p) => {
            if (p.id === (profile?.id ?? 'human')) return null; // Skip local player
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={'https://api.dicebear.com/9.x/avataaars/svg?seed=' + p.name} style={{ width: '100%', height: '100%' }} alt="Avatar" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#4b5563', fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>{formatWealth(p.wealth)}</span>
                </div>
              </div>
            )
          })}
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
          daanikCoins={profile?.daank_coins ?? 0}
          onBuyExtraCard={handleBuyExtraCard}
        />
      </div>

      {popupInfo && (
        <EventPopup info={popupInfo} onContinue={handlePopupContinue} />
      )}

      {/* PORTRAIT OVERLAY (Rotate Screen) */}
      <div className="mobile-portrait-overlay">
        <div style={{
          width: 80, height: 80,
          background: 'url("/avatars/rotate screen.webp") center / contain no-repeat',
          marginBottom: 24
        }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
          Rotate Your Screen
        </h2>
      </div>
    </div>
  )
}

function EventPopup({ info, onContinue }: { info: { reason: string, reasonHi?: string, sourceName?: string, isSelf?: boolean, description?: string, descriptionHi?: string, amountStr: string, isGain: boolean }, onContinue: () => void }) {
  const { i18n } = useTranslation()
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue()
    }, 4000) // Shorter duration so they don't have to wait 7s
    return () => clearTimeout(timer)
  }, [onContinue])

  const title = info.isGain
    ? (i18n.language === 'hi' ? 'धन प्राप्त हुआ!' : 'WEALTH GAINED')
    : (info.sourceName && !info.isSelf && info.sourceName !== 'Game'
      ? (i18n.language === 'hi' ? `${info.sourceName} ने हमला किया!` : `${info.sourceName} ATTACKED!`)
      : (i18n.language === 'hi' ? 'धन की हानि!' : 'WEALTH LOST'));

  const reason = i18n.language === 'hi' && info.reasonHi ? info.reasonHi : info.reason;
  const description = info.description ? (i18n.language === 'hi' && info.descriptionHi ? info.descriptionHi : info.description) : '';

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
      </motion.div>
    </div>
  )
}

function SetupScreen({ botCount, setBotCount, onStart, onBack, levelId }: { botCount: number; setBotCount: (n: number) => void; onStart: () => void; onBack: () => void; levelId?: string }) {
  const levelConfig = levelId ? ARTHA_YATRA_LEVELS.find(l => l.id === levelId) : null;
  const wealthGoalText = levelConfig ? formatWealth(levelConfig.targetCorpus) : '₹50 Lakhs';
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
          ← Back
        </button>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#002020', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 28, position: 'relative', zIndex: 10 }}>New Game</h1>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 24, marginBottom: 16, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 16 }}>AI Opponents</h3>
          <div style={{ display: 'flex', gap: 10 }}>
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
          </div>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>Playing against {botCount} AI opponent{botCount > 1 ? 's' : ''} ({botCount + 1} players total)</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span style={{ fontSize: 15, color: '#4b5563', fontWeight: 500 }}>
            Race to <span style={{ color: '#d97706', fontWeight: 800 }}>{wealthGoalText}</span>
          </span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: '20px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>

          {/* Stacked Coins Image */}
          <img src="/avatars/WhatsApp_Image_2026-06-05_at_12.31.06-removebg-preview.png" alt="Entry Reward Coins" style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 8px 12px rgba(217,119,6,0.3))', flexShrink: 0 }} />

          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-deep)', marginBottom: 4 }}>Entry Reward</h4>
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Win the game to earn</div>
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
          Start Game
        </button>
      </div>
    </div>
  )
}
function ResultScreen({ isWinner, placement, finalWealth, rpChange, players, mode, onPlayAgain, onDashboard, nearMiss, wealthGap, gameLog }: { isWinner: boolean; placement: number; finalWealth: number; rpChange: number; players: PlayerState[]; mode: string; onPlayAgain: () => void; onDashboard: () => void; nearMiss?: boolean; wealthGap?: number; gameLog: string[] }) {
  const sorted = [...players].sort((a, b) => b.wealth - a.wealth)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--green-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100, position: 'relative' }}>
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
            {isWinner ? 'YOU WIN' : 'BETTER LUCK NEXT TIME'}
          </div>
          {!isWinner && (
            <div style={{ color: '#94a3b8', fontSize: 24, fontWeight: 700, marginTop: 8 }}>
              {nearMiss ? 'So Close! 😤' : `${placement === 1 ? '1st' : placement === 2 ? '2nd' : placement === 3 ? '3rd' : `${placement}th`} Place`}
            </div>
          )}
        </motion.div>
        {nearMiss && wealthGap !== undefined && (
          <p style={{ color: 'var(--orange-primary)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            You were just {formatWealth(wealthGap)} away from winning!
          </p>
        )}
        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 20 }}>Final wealth: {formatWealth(finalWealth)}</p>

        {mode === 'ranked' && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 12, background: rpChange > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${rpChange > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, marginBottom: 28 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: rpChange > 0 ? 'var(--green-primary)' : 'var(--orange-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {rpChange > 0 ? '+' : ''}{rpChange} RP
            </span>
          </div>
        )}

        {/* Final Rankings & Highlights */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: 24 }}>
          <div style={{ flex: '1 1 300px', background: 'var(--green-deep)', border: '1px solid var(--green-primary)', borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Final Rankings
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

          {/* Match Highlights */}
          {gameLog && gameLog.length > 0 && (
            <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, textAlign: 'left', maxHeight: 250, overflowY: 'auto' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray)', marginBottom: 8, textTransform: 'uppercase' }}>Match Highlights</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gameLog.slice(0, 15).map((entry: string, idx: number) => (
                  <li key={idx} style={{ opacity: 1 - (idx * 0.05), lineHeight: 1.4 }}>• {entry}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 12 }}>
          <div className="btn-rebound" style={{ boxShadow: '0 0 20px rgba(244, 210, 123, 0.4)', borderRadius: 12 }}>
            <Button variant="gold" size="lg" onClick={onPlayAgain} style={{ minWidth: 200 }}>PLAY AGAIN</Button>
          </div>
          <div className="btn-rebound">
            <Button variant="secondary" size="lg" onClick={onDashboard} style={{ minWidth: 200 }}>DASHBOARD</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
