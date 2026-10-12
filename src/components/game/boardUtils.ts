import { useEffect, useRef, useState } from 'react'
import type { DecisionOption, GameState, PlayerState } from '../../types/game'

export const DECISION_ORDER: Record<string, number> = { spend: 1, save: 2, invest: 3 }

export function sortDecisionOptions(options: DecisionOption[] | undefined): DecisionOption[] {
  return [...(options || [])].sort((a, b) => (DECISION_ORDER[a.type] || 0) - (DECISION_ORDER[b.type] || 0))
}

/** Players that may be targeted: not me, and still in the game (not forfeited). */
export function isTargetable(player: PlayerState, myPlayerId: string): boolean {
  return player.id !== myPlayerId && !player.hasForfeited
}

export function getTargetableIndices(gameState: GameState, myPlayerId: string): number[] {
  return gameState.players.flatMap((p, i) => (isTargetable(p, myPlayerId) ? [i] : []))
}

export const EMOTES = ['💰', '😭', '📉', '🚀', '😡']

export interface OpponentPlayEvent {
  key: number
  playerId: string
  name: string
  entry: string
}

const OPPONENT_ACTION_RE = / (played|defended|is skipping|took too long)/

/**
 * Watches the (newest-first) game log and reports the latest entry describing
 * an opponent's move. Clears itself after `durationMs`.
 */
export function useOpponentPlayFeed(gameState: GameState, myPlayerId: string, durationMs = 3200) {
  const { log, players } = gameState
  const prevHead = useRef<string | undefined>(log[0])
  const counter = useRef(0)
  const [event, setEvent] = useState<OpponentPlayEvent | null>(null)

  useEffect(() => {
    const head = log[0]
    if (head === prevHead.current) return
    const prevIdx = prevHead.current === undefined ? log.length : log.indexOf(prevHead.current)
    prevHead.current = head
    const fresh = log.slice(0, prevIdx < 0 ? Math.min(3, log.length) : prevIdx)
    const opponents = players
      .filter(p => p.id !== myPlayerId)
      .sort((a, b) => b.name.length - a.name.length)
    for (const entry of fresh) {
      if (!OPPONENT_ACTION_RE.test(entry)) continue
      const actor = opponents.find(p => entry.startsWith(p.name + ' '))
      if (actor) {
        counter.current += 1
        setEvent({ key: counter.current, playerId: actor.id, name: actor.name, entry })
        return
      }
    }
  }, [log, players, myPlayerId])

  useEffect(() => {
    if (!event) return
    const timer = setTimeout(() => setEvent(null), durationMs)
    return () => clearTimeout(timer)
  }, [event, durationMs])

  return event
}

/** Remaining milliseconds of the current turn, ticking every 250ms. */
export function useTurnRemaining(turnStartTime: number, timeLimit: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])
  return Math.max(0, timeLimit - Math.max(0, now - turnStartTime))
}
