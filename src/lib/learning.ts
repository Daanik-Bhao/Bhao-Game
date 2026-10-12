import type { GameState } from '../types/game'
import type { ReportCard } from '../types/learning'
import { getNetWorth } from './economy'

/**
 * Build the end-of-game report card for one player.
 * STUB — the Phase 4 engine agent replaces this with the real grading,
 * projection and lesson selection. Signature is the contract the UI uses.
 */
export function buildReportCard(state: GameState, playerId: string): ReportCard {
  const player = state.players.find(p => p.id === playerId) ?? state.players[0]
  const finalNetWorth = getNetWorth(player)
  return {
    playerId: player.id,
    startNetWorth: player.stats?.netWorthByRound[0] ?? finalNetWorth,
    finalNetWorth,
    personaTitle: 'Money Learner',
    personaTitleHi: 'पैसे का विद्यार्थी',
    headline: 'Every game teaches something.',
    headlineHi: 'हर खेल कुछ सिखाता है।',
    grades: [],
    projection: { years: 10, monthlyAmount: 5000, yourMixValue: 0, fdValue: 0, indexValue: 0, explanation: '', explanationHi: '' },
    lessons: [],
    conceptsUnlocked: player.stats?.conceptsTriggered ?? [],
  }
}
