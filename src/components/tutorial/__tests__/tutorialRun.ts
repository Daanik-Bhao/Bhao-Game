/**
 * Headless run of the tutorial story through the real engine (pure functions only).
 * Mirrors what src/pages/TutorialGame.tsx does when the player follows the coach.
 */
import {
  advanceTurn, doBotTurn, equipDefense, getCash, getHoldings, getNetWorth, processDecision,
  seededRng, setRng, startDrawPhase,
} from '../../../lib/gameEngine'
import type { DecisionChoice, GameCard, GameState } from '../../../types/game'
import { CARD_IDS, TUTORIAL_BOT_POLICY, buildTutorialState, isCard } from '../../../data/tutorialScript'

export interface TutorialRun {
  states: Record<string, GameState>
  log: string[]
}

function humanDraw(s: GameState): GameState {
  return { ...startDrawPhase(s, 0).state, phase: 'play' }
}

function decide(s: GameState, id: string, choice: DecisionChoice): GameState {
  const c = s.players[0].hand.find(h => isCard(h, id))
  if (!c) throw new Error(`card ${id} not in hand: ${s.players[0].hand.map(h => h.id).join(', ')}`)
  const next = processDecision(s, 0, choice, c)
  return advanceTurn({ ...next, pendingDecision: null })
}

function bot(s: GameState): GameState {
  return doBotTurn(s, TUTORIAL_BOT_POLICY).state
}

/** Year 3 free play: `freeCard` + `freeChoice` lets tests try different player choices. */
export function runTutorial(seed: number, freeCard: string = CARD_IDS.fire, freeChoice: DecisionChoice = 'invest'): TutorialRun {
  setRng(seededRng(seed))
  try {
    const states: Record<string, GameState> = {}
    let s = buildTutorialState('You')
    s = humanDraw(s)
    states.start = s
    // Year 1
    s = decide(s, CARD_IDS.chai, 'invest')
    states.afterInvest = s
    s = bot(s) // Rahul plays, the year wraps
    states.year2 = s
    // Year 2
    s = humanDraw(s)
    s = decide(s, CARD_IDS.buffer, 'save')
    states.afterSave = s
    s = bot(s)
    states.year3 = s
    // Year 3
    s = humanDraw(s)
    const ins = s.players[0].hand.find((h: GameCard) => isCard(h, CARD_IDS.insurance))
    if (!ins) throw new Error(`Health Insurance was not drawn in Year 3: hand ${s.players[0].hand.map(h => h.id).join(', ')} deck ${s.deck.map(h => h.id).join(', ')} log ${s.log.join(' / ')}`)
    s = equipDefense(s, 0, ins)
    states.afterEquip = s
    s = decide(s, freeCard, freeChoice)
    s = bot(s)
    states.year4 = s
    return { states, log: s.log }
  } finally {
    setRng()
  }
}

export { getCash, getHoldings, getNetWorth }
