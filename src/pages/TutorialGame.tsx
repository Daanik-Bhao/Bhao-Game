import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { MentorDialog } from '../components/game/MentorDialog'
import type { GameState, GameCard as GameCardType } from '../types/game'

export function TutorialGame() {
  const navigate = useNavigate()
  const myPlayerId = 'tutorial-player'
  const botPlayerId = 'tutorial-bot'

  const [step, setStep] = useState(0)
  const [uiPhase, setUiPhase] = useState<UIPhase>('playing')
  
  // Initial Mock State
  const [gameState, setGameState] = useState<GameState>({
    id: 'tutorial',
    turn: 1,
    phase: 'draw',
    currentPlayerIndex: 0,
    players: [
      { id: myPlayerId, name: 'You', isBot: false, wealth: 50000, wealthFloor: 0, hand: [], activeDefenses: [], skippedTurns: 0, pendingGains: [], doubleInvestActive: false, investChoices: 0, spendChoices: 0, savingStreak: 0, greedIndex: 0, emiDamageTaken: false },
      { id: botPlayerId, name: 'Rival CEO', isBot: true, wealth: 50000, wealthFloor: 0, hand: [], activeDefenses: [], skippedTurns: 0, pendingGains: [], doubleInvestActive: false, investChoices: 0, spendChoices: 0, savingStreak: 0, greedIndex: 0, emiDamageTaken: false }
    ],
    deck: [],
    discardPile: [],
    wealthGoal: 1500000,
    turnStartTime: Date.now(),
    startTime: Date.now(),
    timeLimit: 900000,
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [],
    multiplayerMode: 'blitz'
  })

  // Tutorial Steps Logic
  const tutorialSteps = [
    {
      message: "Welcome to BHAO! The goal is to reach ₹15 Lakhs. It's your turn. Click your player card or the deck to DRAW your first card.",
      action: 'draw'
    },
    {
      message: "This is a Decision Card. You can Spend, Save, or Invest. Saving builds your 'Wealth Floor' so you can't drop below it. Click SAVE.",
      action: 'save'
    },
    {
      message: "Great! Notice your Wealth Floor increased. Now it's the Rival's turn.",
      action: 'next'
    },
    {
      message: "Your turn again! Draw a card.",
      action: 'draw'
    },
    {
      message: "Let's learn a pro strategy. Click SPEND. It costs money, but gives you the 'Clarity Buff', which guarantees and boosts your NEXT investment!",
      action: 'spend'
    },
    {
      message: "Awesome. You now have the 🧠 Clarity Buff. Draw your next card.",
      action: 'draw'
    },
    {
      message: "Now click INVEST. Since you have the Clarity Buff, it is 100% safe from Risk and you get 1.3x returns!",
      action: 'invest'
    },
    {
      message: "Now let's try an Action Card! Draw your next card.",
      action: 'draw'
    },
    {
      message: "This is 'Cyber Heist'. Action cards let you attack rivals or steal money! Click the card to play it.",
      action: 'play_action'
    },
    {
      message: "Select the Rival CEO to steal some cash.",
      action: 'target'
    },
    {
      message: "Great! You stole the cash! Now let's learn how to protect yourself! Draw your next card.",
      action: 'draw'
    },
    {
      message: "This is a Defense Card! They protect you from rival attacks. Click the card to EQUIP it to your profile.",
      action: 'play_defense'
    },
    {
      message: "Great! You now have an active defense. Let's see what the Rival does on their turn.",
      action: 'next'
    },
    {
      message: "Oh no! The Rival launched a Cyber Attack! But your Defense Card automatically blocked it! You're ready for the real market. You can access this tutorial anytime from the Dashboard.",
      action: 'finish'
    }
  ]

  const currentStep = tutorialSteps[step]

  // Handlers
  const handleDrawCard = () => {
    if (currentStep?.action !== 'draw') return
    
    if (step === 7) {
      const actionCard: GameCardType = { id: `mock-${step}`, name: 'Cyber Heist', flavor: 'Steal cash from a rival.', type: 'action', tier: 'epic', effect: { type: 'steal', value: 10000, target: 'target' } }
      setGameState(prev => ({
        ...prev,
        phase: 'play',
        players: prev.players.map((p, i) => i === 0 ? { ...p, hand: [actionCard] } : p),
      }))
      setUiPhase('playing')
    } else if (step === 10) {
      const defCard: GameCardType = { id: `mock-${step}`, name: 'Firewall', flavor: 'Blocks 1 attack.', type: 'defense', tier: 'common', blocksCardTypes: ['action'] }
      setGameState(prev => ({
        ...prev,
        phase: 'play',
        players: prev.players.map((p, i) => i === 0 ? { ...p, hand: [defCard] } : p),
      }))
      setUiPhase('playing')
    } else {
      const mockCard: GameCardType = {
        id: `mock-${step}`, name: 'Monthly Salary', flavor: 'Make a choice.', type: 'decision', tier: 'common',
        options: [
          { type: 'spend', label: 'Spend', description: 'Gain Clarity', effect: { type: 'wealth_change', value: -5000, target: 'self' } },
          { type: 'save', label: 'Save', description: 'Build Floor', effect: { type: 'wealth_floor', value: 10000, target: 'self' } },
          { type: 'invest', label: 'Invest', description: 'High Risk', investRisk: 25, effect: { type: 'wealth_pct', value: 20, target: 'self' } }
        ]
      }
      setGameState(prev => ({
        ...prev,
        phase: 'play',
        players: prev.players.map((p, i) => i === 0 ? { ...p, hand: [mockCard] } : p),
        pendingDecision: { card: mockCard, playerIndex: 0 }
      }))
      setUiPhase('decision')
    }
    setStep(s => s + 1)
  }

  const handlePlayCard = (card: GameCardType) => {
    if (currentStep?.action === 'play_action' && card.type === 'action') {
      setGameState(prev => ({ 
        ...prev, 
        phase: 'effect', 
        pendingTarget: { card, playerIndex: 0, effect: card.effect! },
        log: [`You played ${card.name}. Choose target!`, ...prev.log]
      }))
      setUiPhase('targeting')
      setStep(s => s + 1)
    } else if (currentStep?.action === 'play_defense' && card.type === 'defense') {
      // Equip defense
      const newState = { ...gameState }
      newState.players[0].hand = []
      newState.players[0].activeDefenses = [card]
      newState.phase = 'draw'
      newState.log = [`You equipped ${card.name}!`, ...newState.log]
      setGameState(newState)
      setStep(s => s + 1)
      
      // Simulate bot turn and attack
      setTimeout(() => {
        const finalState = { ...newState }
        finalState.currentPlayerIndex = 1
        finalState.log = [`Rival CEO played Cyber Attack! Your Firewall blocked it!`, ...finalState.log]
        finalState.players[0].activeDefenses = [] // consumed
        setGameState(finalState)
        setStep(s => s + 1)
      }, 3000)
    }
  }

  const handleTargetSelect = (targetIndex: number) => {
    if (currentStep?.action === 'target' && targetIndex === 1) {
      // Steal money
      const newState = { ...gameState }
      newState.players[0].wealth += 10000
      newState.players[1].wealth -= 10000
      newState.pendingTarget = null
      newState.phase = 'draw'
      newState.players[0].hand = []
      newState.log = [`You stole ₹10,000 from Rival CEO!`, ...newState.log]
      
      setGameState(newState)
      setUiPhase('playing')
      setStep(s => s + 1)
    }
  }

  const handleCancelTargeting = () => {
    if (currentStep?.action === 'target') {
      const actionCard: GameCardType = { id: `mock-7`, name: 'Cyber Heist', flavor: 'Steal cash from a rival.', type: 'action', tier: 'epic', effect: { type: 'steal', value: 10000, target: 'target' } }
      setGameState(prev => ({
        ...prev,
        phase: 'play',
        pendingTarget: null,
        players: prev.players.map((p, i) => i === 0 ? { ...p, hand: [actionCard] } : p)
      }))
      setUiPhase('playing')
      setStep(s => s - 1)
    }
  }

  const handleDecision = (choice: 'spend' | 'save' | 'invest') => {
    if (currentStep?.action !== choice) return
    
    const newState = { ...gameState, phase: 'draw' as const, pendingDecision: null }
    const player = newState.players[0]
    
    if (choice === 'save') {
      player.wealth += 10000
      player.wealthFloor = Math.max(player.wealthFloor, player.wealth)
      newState.log = [`You decided to Save. Wealth floor increased!`, ...newState.log]
    } else if (choice === 'spend') {
      player.wealth -= 5000
      player.doubleInvestActive = true
      newState.log = [`You Spent cash and gained the Clarity Buff!`, ...newState.log]
    } else if (choice === 'invest') {
      const profit = Math.floor(player.wealth * (player.doubleInvestActive ? 0.56 : 0.2))
      player.wealth += profit
      player.doubleInvestActive = false
      newState.log = [`You Invested safely with Clarity Buff! +₹${profit}`, ...newState.log]
    }
    
    player.hand = [] // discard
    newState.players[0] = player

    if (choice === 'save') {
      // Advance to bot turn
      newState.currentPlayerIndex = 1
      setGameState(newState)
      setUiPhase('playing')
      setStep(s => s + 1)
      
      // Simulate bot turn
      setTimeout(() => {
        setGameState(prev => ({ ...prev, currentPlayerIndex: 0, turn: 2 }))
        setStep(s => s + 1)
      }, 3000)
    } else {
      setGameState(newState)
      setUiPhase('playing')
      setStep(s => s + 1)
    }
  }

  return (
    <div style={{ background: 'url("/avatars/image copy.webp") center / cover no-repeat', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <MentorDialog 
        message={currentStep?.message || ''} 
        onNext={currentStep?.action === 'finish' ? () => navigate('/dashboard') : undefined} 
        position="bottom-right"
      />
      
      <GameBoard
        gameState={gameState}
        myPlayerId={myPlayerId}
        isMultiplayer={false}
        uiPhase={uiPhase}
        onlinePlayers={new Set([myPlayerId, botPlayerId])}
        onDrawCard={handleDrawCard}
        onPlayCard={handlePlayCard}
        onTargetSelect={handleTargetSelect}
        onDecision={handleDecision}
        onTimeout={() => {}}
        onCancelTargeting={handleCancelTargeting}
        daanikCoins={100}
        onBuyExtraCard={() => {}}
      />
    </div>
  )
}
