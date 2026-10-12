/**
 * Phase 5 Track M: server-authoritative multiplayer types, shared by the client,
 * `src/lib/multiplayerAuthority.ts` and the `game-action` edge function.
 */
import type { DecisionChoice, GameCard, GameState, MultiplayerMode, PlayerState } from './game'

/** Intents a player can send. The server validates and applies them. */
export type MpAction =
  | { type: 'draw' }
  | { type: 'decision'; cardId: string; choice: DecisionChoice }
  | { type: 'action'; cardId: string; targetIndex?: number }
  | { type: 'equip'; cardId: string }
  | { type: 'pass'; cardId?: string }
  /**
   * Ask the server to apply time-based rules (turn timeout, disconnect forfeits).
   * `lastSeen` (epoch ms per player id) is filled in by the server from heartbeats;
   * anything a client sends there is ignored.
   */
  | { type: 'tick'; lastSeen?: Record<string, number> }
  | { type: 'forfeit' }
  | { type: 'emote'; emoji: string }

/** Everything the `game-action` function accepts. `start` is host-only and builds the game. */
export type MpRequestAction = MpAction | { type: 'start' }

export interface MpRequest {
  roomId: string
  action: MpRequestAction
}

export type MpEventType =
  | 'start' | 'draw' | 'decision' | 'action' | 'equip' | 'pass'
  | 'timeout' | 'forfeit' | 'disconnect' | 'emote' | 'game_over'

/** What happened during one accepted action (drives sounds / toasts on every client). */
export interface MpEvent {
  type: MpEventType
  playerId?: string
  targetId?: string
  cardName?: string
  choice?: DecisionChoice
  emoji?: string
  winnerId?: string | null
}

/** Full authoritative state: lives only in `multiplayer_room_state` (service role). */
export interface MpFullState extends GameState {
  /** Increments on every accepted state change; mirrors `multiplayer_room_state.version`. */
  version: number
  multiplayerMode: MultiplayerMode
  /** Events produced by the action that created this version. */
  lastEvents?: MpEvent[]
}

export type MpPublicPlayer = PlayerState & { handCount: number }

/**
 * Redacted state stored in `multiplayer_rooms.game_state`: no hands, no deck order,
 * no upcoming life events — only counts.
 */
export interface MpPublicState extends Omit<MpFullState, 'players' | 'winner'> {
  players: MpPublicPlayer[]
  winner: MpPublicPlayer | null
  deckCount: number
  eventDeckCount: number
  discardCount: number
}

/** Row of `room_player_hands` (readable only by its owner). */
export interface MpHandRow {
  room_id: string
  player_id: string
  hand: GameCard[]
  version: number
  updated_at: string
}

export type MpErrorCode =
  | 'game_over' | 'not_in_game' | 'forfeited' | 'not_your_turn' | 'wrong_phase'
  | 'card_not_in_hand' | 'invalid_card' | 'invalid_target' | 'cannot_equip'
  | 'decision_disabled' | 'bad_emote' | 'invalid_action'
  // edge function only
  | 'unauthorized' | 'not_found' | 'not_host' | 'not_waiting' | 'not_enough_players'
  | 'not_ready' | 'conflict' | 'server_error' | 'bad_request'

export interface MpActionResponse {
  ok: boolean
  error?: MpErrorCode
  message?: string
  version?: number
  /** The caller's own view (public state + own hand) after the action. */
  view?: MpPublicState
  events?: MpEvent[]
  /** Server clock (epoch ms) when the response was produced. */
  serverNow?: number
}
