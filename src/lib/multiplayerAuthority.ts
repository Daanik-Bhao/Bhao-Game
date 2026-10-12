/**
 * Phase 5 Track M — server-authoritative multiplayer rules.
 *
 * Pure module (no browser / Node / Deno APIs besides `crypto.randomUUID` via newId):
 * it is unit-tested here and bundled into `supabase/functions/_shared/engine.js`
 * (`node scripts/build-functions.mjs`) for the `game-action` edge function.
 *
 * The full state (hands, deck order, upcoming life events) only ever exists on the
 * server. Clients get `publicState` (counts only) plus their own hand row.
 */
import type { GameCard, GameState, MultiplayerMode, PlayerState } from '../types/game'
import type {
  MpAction, MpErrorCode, MpEvent, MpFullState, MpPublicPlayer, MpPublicState,
} from '../types/multiplayer'
import { createGameDeck } from '../data/cards'
import {
  advanceTurn, canEquip, checkWinCondition, equipDefense, forceSkipTurn, getNetWorth, newEconomyState,
  passTurn, previewDecision, processAction, processDecision, startDrawPhase, MAX_ROUNDS,
  STARTING_WEALTH, TURN_TIME_LIMIT_MS,
} from './gameEngine'
import { newId, setRng, shuffle } from './economy'

export { setRng, TURN_TIME_LIMIT_MS }

/** A player whose last heartbeat is older than this is forfeited by the next tick. */
export const DISCONNECT_MS = 45_000
/** Clients send a heartbeat this often. */
export const HEARTBEAT_MS = 10_000
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 6
export const MP_EMOTES = ['💰', '😭', '📉', '🚀', '😡'] as const

const LOG_MAX = 20

export interface MpModeConfig { wealthGoal: number; timeLimitMs: number; goalLabel: string }

export const MP_MODES: Record<MultiplayerMode, MpModeConfig> = {
  blitz: { wealthGoal: 1_500_000, timeLimitMs: 15 * 60 * 1000, goalLabel: '₹15 Lakhs' },
  standard: { wealthGoal: 3_500_000, timeLimitMs: 20 * 60 * 1000, goalLabel: '₹35 Lakhs' },
  epic: { wealthGoal: 5_000_000, timeLimitMs: 30 * 60 * 1000, goalLabel: '₹50 Lakhs' },
}

export function isMultiplayerMode(v: unknown): v is MultiplayerMode {
  return v === 'blitz' || v === 'standard' || v === 'epic'
}

export interface MpSeat {
  id: string
  name: string
  avatar_url?: string | null
  rank_points?: number | null
}

/**
 * Build the starting state on the server. The deck is (re)shuffled with the engine rng,
 * which the edge function points at crypto.getRandomValues.
 */
export function buildInitialMultiplayerState(seats: MpSeat[], mode: MultiplayerMode, now: number): MpFullState {
  if (seats.length < MIN_PLAYERS || seats.length > MAX_PLAYERS) {
    throw new Error(`A multiplayer game needs ${MIN_PLAYERS}-${MAX_PLAYERS} players`)
  }
  const cfg = MP_MODES[isMultiplayerMode(mode) ? mode : 'standard']
  const players: PlayerState[] = seats.map(s => ({
    id: s.id,
    name: s.name,
    isBot: false,
    profile: s.avatar_url != null || s.rank_points != null
      ? { avatar_url: s.avatar_url ?? null, rank_points: s.rank_points ?? 0 }
      : undefined,
    wealth: STARTING_WEALTH,
    cash: STARTING_WEALTH,
    holdings: [],
    lifestyleLevel: 0,
    hand: [],
    activeDefenses: [],
    skippedTurns: 0,
    pendingGains: [],
    wealthFloor: 0,
    doubleInvestActive: false,
    investChoices: 0,
    spendChoices: 0,
    savingStreak: 0,
    greedIndex: 0,
    emiDamageTaken: false,
  }))

  return {
    id: newId(),
    version: 1,
    players,
    ...newEconomyState(shuffle(createGameDeck()), false),
    discardPile: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [`Game started! First to ${cfg.goalLabel} wins — or richest after ${MAX_ROUNDS} years.`],
    wealthGoal: cfg.wealthGoal,
    timeLimit: cfg.timeLimitMs,
    startTime: now,
    turnStartTime: now,
    multiplayerMode: isMultiplayerMode(mode) ? mode : 'standard',
    lastEvents: [{ type: 'start' }],
  }
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface MpResult {
  state: MpFullState
  /** Set when the action was rejected; `state` is then the unchanged input. */
  error?: MpErrorCode
  message?: string
  events: MpEvent[]
  /** True when `state` differs from the input (and `version` was bumped). */
  changed: boolean
}

function pushLog(log: string[], ...newestFirst: string[]): string[] {
  return [...newestFirst, ...log].slice(0, LOG_MAX)
}

function reject(full: MpFullState, error: MpErrorCode, message: string): MpResult {
  return { state: full, error, message, events: [], changed: false }
}

const activeCount = (s: GameState) => s.players.filter(p => !p.hasForfeited).length

/** Mark players as forfeited (net worth zeroed, hand discarded) without advancing the turn. */
function markForfeited(s: GameState, indices: number[], reason: 'forfeit' | 'disconnect'): GameState {
  if (!indices.length) return s
  const discarded: GameCard[] = []
  const logs: string[] = []
  const players = s.players.map((p, i) => {
    if (!indices.includes(i) || p.hasForfeited) return p
    discarded.push(...p.hand)
    logs.push(reason === 'forfeit' ? `🏳️ ${p.name} forfeited.` : `📡 ${p.name} disconnected and forfeited.`)
    return { ...p, hand: [], wealth: 0, cash: 0, holdings: [], pendingGains: [], hasForfeited: true }
  })
  return { ...s, players, discardPile: [...s.discardPile, ...discarded], log: pushLog(s.log, ...logs) }
}

/** After forfeits: move the turn on if needed, then settle the win condition. */
function settleAfterForfeit(s: GameState, currentWasForfeited: boolean): GameState {
  if (activeCount(s) === 0) {
    return { ...s, phase: 'game_over', winner: null, log: pushLog(s.log, 'Everyone left — no winner.') }
  }
  if (activeCount(s) === 1) return checkWinCondition(s)
  if (currentWasForfeited) return advanceTurn({ ...s, pendingDecision: null, pendingTarget: null })
  return checkWinCondition(s)
}

function endTurn(s: GameState): GameState {
  return s.phase === 'game_over' ? s : advanceTurn(s)
}

/** Stamp a new version; reset per-turn transient fields; use server time for the turn clock. */
function finalize(prev: MpFullState, next: GameState, events: MpEvent[], now: number): MpResult {
  const turnChanged = next.turn !== prev.turn || next.currentPlayerIndex !== prev.currentPlayerIndex
  const out: MpFullState = {
    ...(next as MpFullState),
    multiplayerMode: prev.multiplayerMode,
    pendingDecision: null,
    pendingTarget: null,
    turnStartTime: turnChanged ? now : next.turnStartTime,
    version: prev.version + 1,
    lastEvents: [] as MpEvent[],
  }
  const allEvents = [...events]
  if (out.phase === 'game_over' && prev.phase !== 'game_over') {
    allEvents.push({ type: 'game_over', winnerId: out.winner?.id ?? null })
  }
  out.lastEvents = allEvents
  return { state: out, events: allEvents, changed: true }
}

/**
 * Validate and apply one player intent. Never throws for bad input — returns `error`.
 * `now` is the server clock (epoch ms).
 */
export function applyPlayerAction(full: MpFullState, actorId: string, action: MpAction, now: number): MpResult {
  if (!action || typeof action !== 'object' || typeof (action as { type?: unknown }).type !== 'string') {
    return reject(full, 'invalid_action', 'Unknown action')
  }
  if (full.phase === 'game_over') return reject(full, 'game_over', 'The game is over')

  // Ticks may be sent by any member (or the server itself).
  if (action.type === 'tick') return applyTick(full, action.lastSeen, now)

  const actorIndex = full.players.findIndex(p => p.id === actorId)
  if (actorIndex < 0) return reject(full, 'not_in_game', 'You are not in this game')
  const actor = full.players[actorIndex]
  if (actor.hasForfeited) return reject(full, 'forfeited', 'You have left this game')

  if (action.type === 'emote') {
    if (!(MP_EMOTES as readonly string[]).includes(action.emoji)) return reject(full, 'bad_emote', 'Unknown emote')
    return { state: full, events: [{ type: 'emote', playerId: actorId, emoji: action.emoji }], changed: false }
  }

  if (action.type === 'forfeit') {
    const wasCurrent = full.currentPlayerIndex === actorIndex
    const s = settleAfterForfeit(markForfeited(full, [actorIndex], 'forfeit'), wasCurrent)
    return finalize(full, s, [{ type: 'forfeit', playerId: actorId }], now)
  }

  if (full.currentPlayerIndex !== actorIndex) return reject(full, 'not_your_turn', "It's not your turn")

  switch (action.type) {
    case 'draw': {
      if (full.phase !== 'draw') return reject(full, 'wrong_phase', 'You already drew this turn')
      const { state } = startDrawPhase(full, actorIndex)
      return finalize(full, { ...state, phase: 'play' }, [{ type: 'draw', playerId: actorId }], now)
    }
    case 'decision':
    case 'action':
    case 'equip':
    case 'pass': {
      if (full.phase !== 'play') return reject(full, 'wrong_phase', 'Draw your cards first')
      const cardId = (action as { cardId?: unknown }).cardId
      const card = typeof cardId === 'string' ? actor.hand.find(c => c.id === cardId) : undefined

      if (action.type === 'pass') {
        if (!card && actor.hand.length > 0) return reject(full, 'card_not_in_hand', 'Pick a card from your hand to discard')
        const s = passTurn(full, actorIndex, card?.id ?? '')
        return finalize(full, s, [{ type: 'pass', playerId: actorId, cardName: card?.name }], now)
      }
      if (!card) return reject(full, 'card_not_in_hand', 'That card is not in your hand')

      if (action.type === 'equip') {
        if (card.type !== 'defense') return reject(full, 'invalid_card', 'Only defense cards can be equipped')
        if (!canEquip(full, actorIndex, card)) {
          return reject(full, 'cannot_equip', full.equippedThisTurn
            ? 'You can equip one defense per turn'
            : 'Defense slots full (3)')
        }
        const s = equipDefense(full, actorIndex, card)
        return finalize(full, s, [{ type: 'equip', playerId: actorId, cardName: card.name }], now)
      }

      if (action.type === 'decision') {
        if (card.type !== 'decision') return reject(full, 'invalid_card', 'That is not a decision card')
        const choice = action.choice
        if (!card.options?.some(o => o.type === choice)) return reject(full, 'invalid_action', 'That choice is not on this card')
        const preview = previewDecision(full, actorIndex, card, choice)
        if (preview.disabled) return reject(full, 'decision_disabled', preview.disabled)
        const s = endTurn(processDecision(full, actorIndex, choice, card))
        return finalize(full, s, [{ type: 'decision', playerId: actorId, cardName: card.name, choice }], now)
      }

      // action card
      if (card.type !== 'action' || !card.effect) return reject(full, 'invalid_card', 'That is not an action card')
      let targetIndex = actorIndex
      if (card.effect.target === 'target') {
        const t = action.targetIndex
        const target = typeof t === 'number' && Number.isInteger(t) ? full.players[t] : undefined
        if (!target || t === actorIndex || target.hasForfeited) {
          return reject(full, 'invalid_target', 'Pick an opponent who is still playing')
        }
        targetIndex = t as number
      }
      const s = endTurn(processAction(full, actorIndex, card, targetIndex))
      return finalize(full, s, [{
        type: 'action',
        playerId: actorId,
        cardName: card.name,
        targetId: card.effect.target === 'target' ? full.players[targetIndex].id : undefined,
      }], now)
    }
    default:
      return reject(full, 'invalid_action', 'Unknown action')
  }
}

/**
 * Time-based rules, decided purely on server time:
 * 1. every active player whose last heartbeat is older than DISCONNECT_MS is forfeited
 *    (players without a heartbeat count from the game start);
 * 2. if the current turn is older than TURN_TIME_LIMIT_MS it is skipped.
 * Nothing due → no change (no version bump).
 */
export function applyTick(full: MpFullState, lastSeen: Record<string, number> | undefined, now: number): MpResult {
  if (full.phase === 'game_over') return reject(full, 'game_over', 'The game is over')
  const events: MpEvent[] = []
  let s: GameState = full

  if (lastSeen) {
    const stale = full.players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.hasForfeited && now - (lastSeen[p.id] ?? full.startTime) > DISCONNECT_MS)
    if (stale.length) {
      const currentWasForfeited = stale.some(x => x.i === full.currentPlayerIndex)
      s = settleAfterForfeit(markForfeited(s, stale.map(x => x.i), 'disconnect'), currentWasForfeited)
      stale.forEach(({ p }) => events.push({ type: 'disconnect', playerId: p.id }))
    }
  }

  const turnMoved = s.turn !== full.turn || s.currentPlayerIndex !== full.currentPlayerIndex
  if (s.phase !== 'game_over' && !turnMoved && now - full.turnStartTime >= TURN_TIME_LIMIT_MS) {
    const timedOut = s.players[s.currentPlayerIndex]
    s = forceSkipTurn(s)
    events.push({ type: 'timeout', playerId: timedOut.id })
  }

  if (!events.length) return { state: full, events: [], changed: false }
  return finalize(full, s, events, now)
}

// ---------------------------------------------------------------------------
// Hidden information
// ---------------------------------------------------------------------------

function publicPlayer(p: PlayerState): MpPublicPlayer {
  return { ...p, hand: [], handCount: p.hand.length }
}

/** State every member may see: no hands, no deck / life-event order, no drawn card. */
export function publicState(full: MpFullState): MpPublicState {
  return {
    ...full,
    players: full.players.map(publicPlayer),
    winner: full.winner ? publicPlayer(full.winner) : null,
    deck: [],
    eventDeck: [],
    discardPile: [],
    drawnCard: null,
    pendingDecision: null,
    pendingTarget: null,
    deckCount: full.deck.length,
    eventDeckCount: full.eventDeck?.length ?? 0,
    discardCount: full.discardPile.length,
  }
}

/** Public state plus the viewer's own hand (and their own drawn card). */
export function redactForPlayer(full: MpFullState, viewerId: string): MpPublicState {
  const pub = publicState(full)
  const me = full.players.find(p => p.id === viewerId)
  const isCurrent = full.players[full.currentPlayerIndex]?.id === viewerId
  return withOwnHand({ ...pub, drawnCard: isCurrent ? full.drawnCard : null }, viewerId, me?.hand ?? null)
}

/** Client side: merge the viewer's hand row into a public state. */
export function withOwnHand(pub: MpPublicState, viewerId: string, hand: GameCard[] | null): MpPublicState {
  if (!hand) return pub
  return { ...pub, players: pub.players.map(p => (p.id === viewerId ? { ...p, hand, handCount: hand.length } : p)) }
}

const HIDDEN_CARD: GameCard = { id: 'hidden', name: '', type: 'situation', tier: 'common', flavor: '' }

/**
 * A GameState the existing board components can render: `deck` becomes a placeholder
 * array of the right length (the UI only reads `deck.length`).
 */
export function toBoardState(view: MpPublicState): GameState {
  return {
    ...view,
    deck: Array.from({ length: view.deckCount }, () => HIDDEN_CARD),
  } as GameState
}

/** Per-player hands keyed by id (for `room_player_hands`). Only changed hands unless `all`. */
export function changedHands(prev: MpFullState | null, next: MpFullState): Record<string, GameCard[]> {
  const out: Record<string, GameCard[]> = {}
  for (const p of next.players) {
    const before = prev?.players.find(q => q.id === p.id)
    if (!before || JSON.stringify(before.hand) !== JSON.stringify(p.hand)) out[p.id] = p.hand
  }
  return out
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export interface MpPlacement {
  playerId: string
  placement: number
  won: boolean
  finalWealth: number
  forfeited: boolean
  stats: { investChoices: number; emiDamageTaken: boolean; forfeited: boolean }
}

/** Final placements: winner first, then active players by net worth, forfeited players last. */
export function computePlacements(state: GameState): MpPlacement[] {
  const winnerId = state.winner?.id ?? null
  const ordered = [...state.players].sort((a, b) => {
    if (a.id === winnerId) return -1
    if (b.id === winnerId) return 1
    if (!!a.hasForfeited !== !!b.hasForfeited) return a.hasForfeited ? 1 : -1
    return getNetWorth(b) - getNetWorth(a)
  })
  return ordered.map((p, i) => ({
    playerId: p.id,
    placement: i + 1,
    won: p.id === winnerId,
    finalWealth: Math.max(0, Math.round(getNetWorth(p))),
    forfeited: !!p.hasForfeited,
    stats: { investChoices: p.investChoices ?? 0, emiDamageTaken: !!p.emiDamageTaken, forfeited: !!p.hasForfeited },
  }))
}

export function isGameOver(state: GameState): boolean {
  return state.phase === 'game_over'
}
