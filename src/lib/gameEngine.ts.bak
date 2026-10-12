import type { GameState, PlayerState, GameCard, CardEffect, DecisionChoice } from '../types/game'
import type { LevelConfig } from '../types/level'
import { createGameDeck, createLevelDeck } from '../data/cards'
import { SEASONS } from '../data/mockData'

export const STARTING_WEALTH = 500000   // ₹5 Lakhs
export const WEALTH_GOAL = 5000000      // ₹50 Lakhs
export const TIME_LIMIT_MS = 15 * 60 * 1000  // 15 minutes per game limit
export const TURN_TIME_LIMIT_MS = 60000 // 60 seconds per turn

const BOT_NAMES = ['Rahul AI', 'Priya Bot', 'Arjun AI', 'Sneha Bot', 'Vikram AI']

function createPlayer(id: string, name: string, isBot: boolean, rankPoints?: number, avatarUrl?: string | null, diffMultiplier?: number): PlayerState {
  return {
    id,
    name,
    isBot,
    wealth: STARTING_WEALTH,
    hand: [],
    activeDefenses: [],
    skippedTurns: 0,
    pendingGains: [],
    wealthFloor: 0,
    doubleInvestActive: false,
    investChoices: 0,
    emiDamageTaken: false,
    diffMultiplier,
    profile: isBot ? { rank_points: rankPoints ?? 1500, avatar_url: null } : { rank_points: 0, avatar_url: avatarUrl ?? null },
  }
}

export function initGame(humanPlayer: { id: string; name: string; avatar_url?: string | null }, botCount: number): GameState {
  const deck = createGameDeck()
  const players: PlayerState[] = [createPlayer(humanPlayer.id, humanPlayer.name, false, undefined, humanPlayer.avatar_url)]
  for (let i = 0; i < botCount; i++) {
    players.push(createPlayer(`bot_${i}`, BOT_NAMES[i] ?? `Bot ${i + 1}`, true, 1000 + i * 500))
  }

  const hands: GameCard[][] = players.map(() => [])
  const remaining = [...deck]

  const newPlayers = players.map((p, i) => ({ ...p, hand: hands[i] }))

  return {
    id: crypto.randomUUID(),
    players: newPlayers,
    deck: remaining,
    discardPile: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: ['Game started! First to ₹50 Lakhs wins.'],
    wealthGoal: WEALTH_GOAL,
    timeLimit: TIME_LIMIT_MS,
    startTime: Date.now(),
    turnStartTime: Date.now(),
  }
}

export function initLevelGame(humanPlayer: { id: string; name: string; avatar_url?: string | null }, level: LevelConfig): GameState {
  const levelIndex = parseInt(level.id.replace('level_', '')) - 1
  const deck = createLevelDeck(levelIndex, level.botDifficulty)
  const players: PlayerState[] = [createPlayer(humanPlayer.id, humanPlayer.name, false, undefined, humanPlayer.avatar_url)]
  for (let i = 0; i < level.botCount; i++) {
    const diffMap: Record<string, number> = { easy: 1000, medium: 2000, hard: 3000 }
    const multMap: Record<string, number> = { easy: 0.8, medium: 1.0, hard: 1.2 }
    players.push(createPlayer(`bot_${i}`, BOT_NAMES[i] ?? `Bot ${i + 1}`, true, diffMap[level.botDifficulty], null, multMap[level.botDifficulty]))
  }
  
  players.forEach(p => p.wealth = level.startingCorpus)

  const hands: GameCard[][] = players.map(() => [])
  const remaining = [...deck]

  const newPlayers = players.map((p, i) => ({ ...p, hand: hands[i] }))

  return {
    id: crypto.randomUUID(),
    players: newPlayers,
    deck: remaining,
    discardPile: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [`Artha Yatra: ${level.name} started! Goal: ${level.targetCorpus}`],
    wealthGoal: level.targetCorpus,
    timeLimit: TIME_LIMIT_MS,
    startTime: Date.now(),
    turnStartTime: Date.now(),
    levelConfig: level,
    levelState: {
      currentLevelId: level.id,
      savingStreak: 0,
      lifestyleCreep: 0,
      investmentSlots: 0,
      activeInvestments: [],
      bossTriggered: false,
      starsEarned: 0
    }
  }
}

function refillDeck(state: GameState): GameState {
  const onlyDefenseLeftInDeck = state.deck.length > 0 && state.deck.every(c => c.type === 'defense')
  
  if (state.deck.length > 0 && !onlyDefenseLeftInDeck) return state

  if (state.discardPile.length > 0) {
    const shuffled = [...state.deck, ...state.discardPile]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    // Check if the reshuffled deck still only has defense cards
    const stillOnlyDefense = shuffled.every(c => c.type === 'defense')
    if (!stillOnlyDefense) {
      return { ...state, deck: shuffled, discardPile: [], log: ['Deck reshuffled.', ...state.log].slice(0, 20) }
    }
  }
  
  // Create a completely fresh deck to guarantee action/decision cards
  return { ...state, deck: createGameDeck(), discardPile: [], log: ['Fresh deck created.', ...state.log].slice(0, 20) }
}

function drawCard(state: GameState, playerIndex: number): { state: GameState; card: GameCard | null } {
  const ready = refillDeck(state)
  const deck = [...ready.deck]
  const card = deck.shift() ?? null
  const players = ready.players.map((p, i) => {
    if (i !== playerIndex || !card) return p
    return { ...p, hand: [...p.hand, card] }
  })
  return {
    state: { ...ready, players, deck, drawnCard: card },
    card,
  }
}

function clampWealth(wealth: number, floor: number): number {
  return Math.max(floor, Math.max(0, wealth))
}

function applyEffect(state: GameState, effect: CardEffect, sourcePlayerIndex: number, targetPlayerIndex: number): GameState {
  let players = [...state.players]
  const source = players[sourcePlayerIndex]
  const target = players[targetPlayerIndex]

  switch (effect.type) {
    case 'wealth_change': {
      const val = effect.value ?? 0
      // If it's a gain, doubleInvestActive applies
      const doubled = (source.doubleInvestActive && effect.target === 'self' && val > 0) ? val * 2 : val
      const targetP = effect.target === 'self' ? source : target
      let newWealth = targetP.wealth + doubled
      let newFloor = targetP.wealthFloor
      if (newWealth < newFloor) {
        newWealth = newFloor
        newFloor = 0 // Shield breaks!
      }
      if (effect.target === 'self') {
        players[sourcePlayerIndex] = { ...source, wealth: Math.max(0, newWealth), wealthFloor: newFloor }
      } else {
        players[targetPlayerIndex] = { ...target, wealth: Math.max(0, newWealth), wealthFloor: newFloor }
      }
      break
    }
    case 'wealth_pct': {
      const pct = (effect.value ?? 0) / 100
      if (effect.target === 'self') {
        players[sourcePlayerIndex] = { ...source, wealth: clampWealth(Math.floor(source.wealth * (1 + pct)), source.wealthFloor) }
      } else {
        players[targetPlayerIndex] = { ...target, wealth: clampWealth(Math.floor(target.wealth * (1 + pct)), target.wealthFloor) }
      }
      break
    }
    case 'wealth_next_turn': {
      const pending = { amount: effect.value ?? 0, triggerAt: 'next_turn' as const, cardId: crypto.randomUUID() }
      players[sourcePlayerIndex] = { ...source, pendingGains: [...source.pendingGains, pending] }
      break
    }
    case 'wealth_end_game': {
      // Apply immediately — "long-term investment" pays out now
      const val = effect.value ?? 0
      const doubled = (source.doubleInvestActive && val > 0) ? val * 2 : val
      players[sourcePlayerIndex] = { ...source, wealth: clampWealth(source.wealth + doubled, source.wealthFloor) }
      break
    }
    case 'steal': {
      const amount = Math.min(effect.value ?? 0, target.wealth)
      let newWealth = target.wealth - amount
      let newFloor = target.wealthFloor
      if (newWealth < newFloor) {
        newWealth = newFloor
        newFloor = 0 // Shield breaks!
      }
      const actualLoss = target.wealth - newWealth
      players[targetPlayerIndex] = { ...target, wealth: Math.max(0, newWealth), wealthFloor: newFloor }
      players[sourcePlayerIndex] = { ...source, wealth: source.wealth + actualLoss }
      break
    }
    case 'attack_all_pct': {
      // Scale AoE damage down with more players to prevent runaway dominance
      const rawPct = (effect.value ?? 0) / 100
      const scaleFactor = players.length <= 2 ? 1.0 : players.length === 3 ? 0.8 : 0.65
      const scaledPct = rawPct * scaleFactor
      players = players.map((p, i) => {
        if (effect.target === 'others' && i === sourcePlayerIndex) return p
        const loss = Math.floor(p.wealth * scaledPct)
        let newWealth = p.wealth - loss
        let newFloor = p.wealthFloor
        if (p.wealthFloor !== undefined && newWealth < p.wealthFloor) {
          newWealth = p.wealthFloor
          newFloor = 0 // The shield breaks after saving them!
        }
        return { ...p, wealth: Math.max(0, newWealth), wealthFloor: newFloor }
      })
      break
    }
    case 'skip_turn': {
      players[targetPlayerIndex] = { ...target, skippedTurns: target.skippedTurns + (effect.value ?? 1) }
      break
    }
    case 'market_crash_player': {
      const pct = (effect.value ?? 50) / 100
      const loss = Math.floor(target.wealth * pct)
      let newWealth = target.wealth - loss
      let newFloor = target.wealthFloor
      if (newWealth < newFloor) {
        newWealth = newFloor
        newFloor = 0 // Shield breaks!
      }
      players[targetPlayerIndex] = { ...target, wealth: Math.max(0, newWealth), wealthFloor: newFloor }
      break
    }
    case 'wealth_floor': {
      players[sourcePlayerIndex] = { ...source, wealthFloor: Math.max(source.wealthFloor, effect.value ?? 0) }
      break
    }
    case 'double_invest': {
      players[sourcePlayerIndex] = { ...source, doubleInvestActive: true }
      break
    }
  }

  return { ...state, players }
}

export function processDecision(state: GameState, playerIndex: number, choice: DecisionChoice, card: GameCard): GameState {
  const option = card.options?.find(o => o.type === choice)
  if (!option) return state

  // --- Invest Risk mechanic ---
  // If the chosen option has a risk chance, roll the dice.
  // On failure, apply the failEffect instead (e.g., loss).
  let effectToApply = option.effect
  let riskFired = false
  if (choice === 'invest' && option.investRisk && option.failEffect) {
    if (Math.random() * 100 < option.investRisk) {
      effectToApply = option.failEffect
      riskFired = true
    }
  }

  // --- Season multiplier ---
  // If the active season boosts invest gains, apply it when the invest SUCCEEDS
  const activeSeason = SEASONS.find(s => s.is_active)
  let seasonBoost = 1.0
  if (!riskFired && choice === 'invest' && activeSeason?.special_rule?.includes('INVEST gains')) {
    const match = activeSeason.special_rule.match(/(\d+)%/)
    if (match) seasonBoost = 1 + parseInt(match[1]) / 100 // e.g. +40% → 1.4
  }

  // Apply season boost by temporarily scaling the effect value
  let scaledEffect = effectToApply
  if (seasonBoost !== 1.0 && effectToApply.value && effectToApply.value > 0) {
    scaledEffect = { ...effectToApply, value: Math.floor(effectToApply.value * seasonBoost) }
  }

  // applyEffect handles doubleInvestActive bonus internally
  const oldWealth = state.players[playerIndex].wealth
  let newState = applyEffect(state, scaledEffect, playerIndex, playerIndex)
  const newWealth = newState.players[playerIndex].wealth
  const diff = newWealth - oldWealth
  const diffStr = diff > 0 ? ` (+₹${Math.abs(diff).toLocaleString()})` : diff < 0 ? ` (-₹${Math.abs(diff).toLocaleString()})` : ''
  
  // Clear doubleInvestActive after use, and increment investChoices if choice was invest
  const players = newState.players.map((p, i) =>
    i === playerIndex ? { 
      ...p, 
      doubleInvestActive: false,
      investChoices: p.investChoices + (choice === 'invest' ? 1 : 0)
    } : p
  )
  newState = { ...newState, players }

  const discard = [...newState.discardPile, card]
  const hand = newState.players[playerIndex].hand.filter(c => c.id !== card.id)
  const updatedPlayers = newState.players.map((p, i) =>
    i === playerIndex ? { ...p, hand } : p
  )

  let logEntry = `${state.players[playerIndex].name} played ${card.name} → ${choice.toUpperCase()}${diffStr}`
  if (riskFired) logEntry += ' 📉 (Investment Failed!)'
  if (seasonBoost !== 1.0 && !riskFired) logEntry += ' ⚡ (Season Boost!)'

  // Update level state if active
  if (newState.levelState) {
    const ls = { ...newState.levelState }
    if (newState.levelConfig?.id === 'level_2') {
      if (choice === 'save') ls.savingStreak += 1
      else ls.savingStreak = 0
    }
    newState.levelState = ls
  }

  return checkWinCondition({
    ...newState,
    players: updatedPlayers,
    discardPile: discard,
    playedCard: card,
    pendingDecision: null,
    log: [logEntry, ...newState.log].slice(0, 20),
  })
}

export function processAction(state: GameState, playerIndex: number, card: GameCard, targetIndex: number): GameState {
  if (!card.effect) return state

  // --- Auto-Defense Mechanic (Single Player) ---
  // In single player, there is no async reaction phase. We auto-defend if the target has a defense card.
  let isDefended = false
  let updatedPlayersForDefense = [...state.players]
  let discardPile = [...state.discardPile]

  if (card.effect.target === 'target') {
    const target = state.players[targetIndex]
    const defCard = target.activeDefenses.find(c => {
      if (c.type !== 'defense') return false
      const effect = c.effect
      if (!effect || effect.type !== 'block_card') return false
      return !!(effect.blocks?.includes('any') || effect.blocks?.includes(card.name))
    })
    if (defCard) {
      isDefended = true
      // Consume the defense card
      discardPile.push(defCard)
      const newDefenses = target.activeDefenses.filter(c => c.id !== defCard.id)
      updatedPlayersForDefense[targetIndex] = { ...target, activeDefenses: newDefenses }
    }
  }

  // Only apply the attack effect if it was NOT defended
  const oldSourceWealth = state.players[playerIndex].wealth
  const oldTargetWealth = state.players[targetIndex].wealth

  let newState = { ...state, players: updatedPlayersForDefense, discardPile }
  
  if (card.effect.target === 'all' || card.effect.target === 'others') {
    // AoE targets affect multiple players
    for (let i = 0; i < newState.players.length; i++) {
      if (card.effect.target === 'others' && i === playerIndex) continue;
      // Note: Auto-defense is skipped for AoE in this version
      newState = applyEffect(newState, card.effect, playerIndex, i)
      if (card.id === 'ac_emi_bomb') {
        const p = newState.players[i]
        newState.players[i] = { ...p, emiDamageTaken: true }
      }
    }
  } else if (!isDefended) {
    // Single target attack
    newState = applyEffect(newState, card.effect, playerIndex, targetIndex)
    // If it was an EMI bomb, mark target as having taken EMI damage
    if (card.id === 'ac_emi_bomb') {
      const p = newState.players[targetIndex]
      newState.players[targetIndex] = { ...p, emiDamageTaken: true }
    }
  }

  const newSourceWealth = newState.players[playerIndex].wealth
  const newTargetWealth = newState.players[targetIndex].wealth
  const targetDiff = newTargetWealth - oldTargetWealth
  const sourceDiff = newSourceWealth - oldSourceWealth

  const targetDiffStr = targetDiff < 0 ? ` (-₹${Math.abs(targetDiff).toLocaleString()})` : targetDiff > 0 ? ` (+₹${Math.abs(targetDiff).toLocaleString()})` : ''
  const sourceDiffStr = sourceDiff > 0 ? ` (+₹${Math.abs(sourceDiff).toLocaleString()})` : ''


  // Now process the played action card
  const finalDiscard = [...newState.discardPile, card]
  const sourceHand = newState.players[playerIndex].hand.filter(c => c.id !== card.id)
  const finalPlayers = newState.players.map((p, i) =>
    i === playerIndex ? { ...p, hand: sourceHand } : p
  )

  const targetName = state.players[targetIndex].name
  let logEntry = card.effect.target === 'all' || card.effect.target === 'others'
    ? `${state.players[playerIndex].name} played ${card.name} — affects all!`
    : `${state.players[playerIndex].name} played ${card.name} → ${targetName}${targetDiffStr}${sourceDiffStr}`

  if (isDefended) {
    logEntry += ` 🛡️ (${targetName} Auto-Defended!)`
  }

  return checkWinCondition({
    ...newState,
    players: finalPlayers,
    discardPile: finalDiscard,
    playedCard: card,
    pendingTarget: null,
    log: [logEntry, ...newState.log].slice(0, 20),
  })
}

export function processDefense(state: GameState, defenderIndex: number, defenseCard: GameCard, _attackCard: GameCard): GameState {
  const discard = [...state.discardPile, defenseCard]
  const hand = state.players[defenderIndex].hand.filter(c => c.id !== defenseCard.id)
  const updatedPlayers = state.players.map((p, i) =>
    i === defenderIndex ? { ...p, hand } : p
  )

  const logEntry = `${state.players[defenderIndex].name} defended with ${defenseCard.name}!`
  return {
    ...state,
    players: updatedPlayers,
    discardPile: discard,
    pendingTarget: null,
    log: [logEntry, ...state.log].slice(0, 20),
  }
}

function processPendingGains(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex]
  let wealth = player.wealth
  const remaining = player.pendingGains.filter(g => {
    if (g.triggerAt === 'next_turn') {
      wealth += g.amount
      return false
    }
    return true
  })
  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, wealth: Math.max(0, wealth), pendingGains: remaining } : p
  )
  return { ...state, players: updatedPlayers }
}

export function advanceTurn(state: GameState): GameState {
  // Discard all cards from the current player's hand since they have finished their play phase
  const currentPlayer = state.players[state.currentPlayerIndex]
  if (!currentPlayer.hasForfeited) {
    const unplayedCards = [...currentPlayer.hand]
    
    const updatedCurrentPlayer = { ...currentPlayer, hand: [] }
    state = { 
      ...state, 
      players: state.players.map((p, i) => i === state.currentPlayerIndex ? updatedCurrentPlayer : p),
      discardPile: [...state.discardPile, ...unplayedCards]
    }
  }

  // FIND NEXT ACTIVE PLAYER FIRST
  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  let loopCount = 0
  let newState = state
  while ((newState.players[nextIndex].hasForfeited || newState.players[nextIndex].skippedTurns > 0) && loopCount < newState.players.length) {
    const p = newState.players[nextIndex]
    if (!p.hasForfeited) {
      const updatedPlayers = newState.players.map((pl, i) =>
        i === nextIndex ? { ...pl, skippedTurns: pl.skippedTurns - 1 } : pl
      )
      newState = { ...newState, players: updatedPlayers }
      const logEntry = `${p.name} is skipping their turn.`
      newState = { ...newState, log: [logEntry, ...newState.log].slice(0, 20) }
    }
    nextIndex = (nextIndex + 1) % newState.players.length
    loopCount++
  }

  // PROCESS PENDING GAINS FOR THE NEXT PLAYER
  newState = processPendingGains(newState, nextIndex)

  const checked = checkWinCondition(newState)
  if (checked.winner) return checked

  const elapsed = Date.now() - state.startTime
  if (elapsed >= state.timeLimit) {
    const winner = [...newState.players].sort((a, b) => b.wealth - a.wealth)[0]
    return { ...checked, winner, phase: 'game_over', log: ['Time up! Highest wealth wins.', ...checked.log].slice(0, 20) }
  }

  return {
    ...newState,
    currentPlayerIndex: nextIndex,
    turn: newState.turn + 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    turnStartTime: Date.now(),
  }
}

export function forceSkipTurn(state: GameState): GameState {
  const p = state.players[state.currentPlayerIndex]
  const logEntry = `⏱️ ${p.name} took too long! Turn skipped.`
  const skippedState = { ...state, log: [logEntry, ...state.log].slice(0, 20) }
  return advanceTurn(skippedState)
}

export function checkWinCondition(state: GameState): GameState {
  const winner = state.players.find(p => p.wealth >= state.wealthGoal)
  if (winner) {
    return {
      ...state,
      winner,
      phase: 'game_over',
      log: [`🏆 ${winner.name} reached ₹50 Lakhs and WINS!`, ...state.log].slice(0, 20),
    }
  }
  const activePlayers = state.players.filter(p => !p.hasForfeited)
  if (activePlayers.length === 1 && state.players.length > 1) {
    const remainingWinner = activePlayers[0]
    return {
      ...state,
      winner: remainingWinner,
      phase: 'game_over',
      log: [`🏆 Everyone else forfeited! ${remainingWinner.name} WINS!`, ...state.log].slice(0, 20),
    }
  }
  if (state.levelConfig && state.turn > state.levelConfig.turnLimit * state.players.length) {
    // Campaign time/turn out - Did human reach the goal?
    const human = state.players[0]
    if (human.wealth >= state.wealthGoal) {
      return {
        ...state,
        winner: human,
        phase: 'game_over',
        log: [`🏆 Level Complete! Reached ${state.wealthGoal} in time.`, ...state.log].slice(0, 20),
      }
    } else {
       return {
        ...state,
        winner: state.players.find(p => p.isBot) || null, // Human lost
        phase: 'game_over',
        log: [`❌ Turn limit reached! You failed to reach the goal.`, ...state.log].slice(0, 20),
      }
    }
  }

  return state
}

export function doBotTurn(state: GameState): { state: GameState; delay: number } {
  const botIndex = state.currentPlayerIndex
  const bot = state.players[botIndex]

  const { state: drawnState } = startDrawPhase(state, botIndex)
  const hand = drawnState.players[botIndex].hand

  if (!hand.length) {
    return { state: advanceTurn(drawnState), delay: 800 }
  }

  // --- Improved Bot AI ---
  // Priority: targeted action > decision > AoE action > defense discard > discard
  // Randomize to be less predictable
  const rand = Math.random()
  const diffMult = bot.diffMultiplier ?? 1.0

  const targetedAction = hand.find(c => c.type === 'action' && c.effect?.target === 'target')
  const aoeAction = hand.find(c => c.type === 'action' && c.effect?.target === 'others')
  const decision = hand.find(c => c.type === 'decision')
  const defenseCard = hand.find(c => c.type === 'defense')

  // Attack the player closest to winning (most dangerous), not just richest
  const mostDangerousOtherIndex = drawnState.players
    .map((p, i) => ({ wealth: p.wealth, i }))
    .filter(x => x.i !== botIndex)
    .sort((a, b) => b.wealth - a.wealth)[0]?.i ?? ((botIndex + 1) % drawnState.players.length)

  let finalState: GameState

  if (targetedAction && rand > (0.25 / diffMult)) {
    // 75% chance to use a targeted attack when available
    finalState = processAction(drawnState, botIndex, targetedAction, mostDangerousOtherIndex)
  } else if (decision) {
    // Bot makes a smarter choice based on wealth position
    const wealthRatio = bot.wealth / STARTING_WEALTH
    let choice: DecisionChoice
    if (wealthRatio < 0.5) {
      // Low on funds: always save (bot is risk-averse when losing)
      choice = 'save'
    } else if (wealthRatio > 2.0 && rand > (0.3 / diffMult)) {
      // Doing well: invest with 70% probability, otherwise save
      choice = rand > (0.3 / diffMult) ? 'invest' : 'save'
    } else {
      // Middle ground: 50/50 invest vs save
      choice = rand > (0.5 / diffMult) ? 'invest' : 'save'
    }
    finalState = processDecision(drawnState, botIndex, choice, decision)
  } else if (aoeAction && rand > 0.4) {
    finalState = processAction(drawnState, botIndex, aoeAction, botIndex)
  } else if (defenseCard && rand > 0.6) {
    // Equip a defense card
    const updatedDefenses = [...drawnState.players[botIndex].activeDefenses, defenseCard]
    const updatedHand = hand.filter(c => c.id !== defenseCard.id)
    const updatedPlayers = drawnState.players.map((p, i) =>
      i === botIndex ? { ...p, hand: updatedHand, activeDefenses: updatedDefenses } : p,
    )
    finalState = { ...drawnState, players: updatedPlayers }
  } else {
    // If they have no good moves, just discard a card (which advanceTurn does anyway)
    // But since the old logic explicitly discarded something, we can just play nothing and let advanceTurn clean up.
    // Or we can equip a defense card if they have one.
    if (defenseCard) {
      const updatedDefenses = [...drawnState.players[botIndex].activeDefenses, defenseCard]
      const updatedHand = hand.filter(c => c.id !== defenseCard.id)
      const updatedPlayers = drawnState.players.map((p, i) =>
        i === botIndex ? { ...p, hand: updatedHand, activeDefenses: updatedDefenses } : p,
      )
      finalState = { ...drawnState, players: updatedPlayers }
    } else {
      finalState = drawnState
    }
  }

  if (finalState.phase === 'game_over') return { state: finalState, delay: 800 }
  return { state: advanceTurn(finalState), delay: 1200 }
}

export function startDrawPhase(state: GameState, playerIndex: number): { state: GameState; card: GameCard | null } {
  let currentState = state;
  let lastDrawnCard = null;
  
  // Draw exactly 4 new cards every turn, ignoring what is currently stored in hand
  for (let i = 0; i < 4; i++) {
    const res = drawCard(currentState, playerIndex);
    currentState = res.state;
    if (!res.card) break;
    lastDrawnCard = res.card;
  }
  
  return { state: currentState, card: lastDrawnCard };
}

export function calculateRPChange(placement: number, totalPlayers: number, winStreak: number): number {
  const baseGain = [15, 30, 50, 80, 100, 120]
  const baseLoss = [0, 0, -15, -25, -30, -35]
  const base = placement === 1 ? (baseGain[Math.min(totalPlayers - 1, 5)] ?? 30) : (baseLoss[Math.min(placement - 1, 5)] ?? -15)
  const streakMultiplier = placement === 1 ? Math.min(1 + winStreak * 0.2, 2.0) : 1.0
  return Math.round(base * streakMultiplier)
}
