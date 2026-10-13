/* Dev-only mock data for the /__ux gallery (never imported by production code). */
import { doBotTurn, initGame } from '../lib/gameEngine'
import type { GameState } from '../types/game'

/** A finished practice game played out by the real engine (the human is driven by the bot AI). */
export function makeFinishedGame(botCount = 2, humanName = 'Tester'): GameState {
  let state = initGame({ id: 'human', name: humanName }, botCount)
  state = { ...state, players: state.players.map((p, i) => (i === 0 ? { ...p, isBot: true } : p)) }
  for (let i = 0; i < 2000 && state.phase !== 'game_over'; i++) {
    state = doBotTurn(state).state
  }
  return { ...state, phase: 'game_over', players: state.players.map((p, i) => (i === 0 ? { ...p, isBot: false } : p)) }
}
