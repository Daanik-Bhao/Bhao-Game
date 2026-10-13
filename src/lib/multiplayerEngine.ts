import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { GameCard, MultiplayerMode } from '../types/game'
import type { MpActionResponse, MpHandRow, MpPublicState, MpRequestAction } from '../types/multiplayer'

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const array = new Uint32Array(6)
  crypto.getRandomValues(array)
  for (let i = 0; i < 6; i++) {
    code += chars[array[i] % chars.length]
  }
  return code
}

export interface RoomPlayer {
  id: string
  room_id: string
  player_id: string
  username: string
  seat_order: number
  is_ready: boolean
  joined_at: string
  last_seen?: string
}

export interface Room {
  id: string
  code: string
  host_id: string
  host_username: string
  status: 'waiting' | 'in_progress' | 'completed'
  max_players: number
  /** Lobby: `{ multiplayerMode }`. In game: the server's redacted public state. */
  game_state: MpPublicState | { multiplayerMode?: MultiplayerMode } | null
  state_version?: number
  current_player_id: string | null
  winner_id: string | null
  created_at: string
  updated_at: string
}

export async function createRoom(hostId: string, hostUsername: string, maxPlayers: number, mode: MultiplayerMode = 'standard'): Promise<Room> {
  let code = generateRoomCode()
  let tries = 0
  while (tries < 10) {
    const { data } = await supabase.from('multiplayer_rooms').select('id').eq('code', code).maybeSingle()
    if (!data) break
    code = generateRoomCode()
    tries++
  }

  const { data, error } = await supabase
    .from('multiplayer_rooms')
    .insert({ host_id: hostId, host_username: hostUsername, code, max_players: maxPlayers, status: 'waiting', game_state: { multiplayerMode: mode } })
    .select()
    .single()
  if (error) throw error

  const { error: playerError } = await supabase.from('room_players').insert({
    room_id: data.id, player_id: hostId, username: hostUsername, seat_order: 0, is_ready: false,
  })
  if (playerError) throw playerError

  return data
}

export async function joinRoom(code: string, playerId: string, username: string): Promise<Room> {
  const { data: room, error } = await supabase
    .from('multiplayer_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle()

  if (error) throw error
  if (!room) throw new Error('Room not found. Check the code and try again.')
  if (room.status !== 'waiting') throw new Error('This game has already started.')

  const { data: existingPlayers } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', room.id)

  const players = existingPlayers ?? []
  if (players.length >= room.max_players) throw new Error('Room is full.')

  const alreadyIn = players.find((p: RoomPlayer) => p.player_id === playerId)
  if (!alreadyIn) {
    const seat = players.reduce((m: number, p: RoomPlayer) => Math.max(m, p.seat_order + 1), 0)
    const { error: insertError } = await supabase.from('room_players').insert({
      room_id: room.id, player_id: playerId, username, seat_order: seat, is_ready: false,
    })
    if (insertError) throw insertError
  }

  return room
}

export async function setReady(roomId: string, playerId: string, ready: boolean): Promise<void> {
  const { error } = await supabase
    .from('room_players')
    .update({ is_ready: ready })
    .eq('room_id', roomId)
    .eq('player_id', playerId)
  if (error) throw error
}

export async function leaveRoom(roomId: string, playerId: string): Promise<void> {
  await supabase
    .from('room_players')
    .delete()
    .eq('room_id', roomId)
    .eq('player_id', playerId)
}

export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
  const { data } = await supabase
    .from('room_players')
    .select(`
      *,
      profiles:player_id(avatar_url)
    `)
    .eq('room_id', roomId)
    .order('seat_order', { ascending: true })

  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map(p => ({ ...p, avatar_url: (p as any).profiles?.avatar_url })) as RoomPlayer[]
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const { data } = await supabase
    .from('multiplayer_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle()
  return data
}

// ---------------------------------------------------------------------------
// Server-authoritative game (Phase 5): every move goes through the game-action function
// ---------------------------------------------------------------------------

/** True when the room's game_state is the server's public game state (not the lobby stub). */
export function isPublicGameState(gs: Room['game_state']): gs is MpPublicState {
  return !!gs && typeof gs === 'object' && Array.isArray((gs as MpPublicState).players) && typeof (gs as MpPublicState).version === 'number'
}

/** Send an intent. Never throws: network / server problems come back as `{ ok: false }`. */
export async function invokeGameAction(roomId: string, action: MpRequestAction): Promise<MpActionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke<MpActionResponse>('game-action', { body: { roomId, action } })
    if (error) {
      // FunctionsHttpError carries the Response; our function always answers JSON.
      const ctx = (error as { context?: Response }).context
      if (ctx && typeof ctx.json === 'function') {
        try {
          const body = (await ctx.json()) as MpActionResponse
          if (body && typeof body === 'object') return { ...body, ok: false }
        } catch { /* fall through */ }
      }
      return { ok: false, error: 'server_error', message: error.message || 'Could not reach the game server' }
    }
    return data ?? { ok: false, error: 'server_error', message: 'Empty response from the game server' }
  } catch (e) {
    return { ok: false, error: 'server_error', message: e instanceof Error ? e.message : 'Could not reach the game server' }
  }
}

/** Host only: the server deals the cards and moves the room to in_progress. */
export async function startGame(roomId: string): Promise<void> {
  const res = await invokeGameAction(roomId, { type: 'start' })
  if (!res.ok) throw new Error(res.message ?? 'Failed to start game')
}

export async function sendHeartbeat(roomId: string): Promise<void> {
  const { error } = await supabase.rpc('heartbeat', { p_room_id: roomId })
  if (error) throw error
}

export async function fetchMyHand(roomId: string, playerId: string): Promise<{ hand: GameCard[]; version: number } | null> {
  const { data } = await supabase
    .from('room_player_hands')
    .select('hand, version')
    .eq('room_id', roomId)
    .eq('player_id', playerId)
    .maybeSingle()
  return data ? { hand: (data.hand ?? []) as GameCard[], version: data.version ?? 0 } : null
}

/**
 * Fresh copy of the public room state + the viewer's hand (same reads as the initial
 * fetch in `subscribeToGame`). Used to resync after the app was in the background.
 */
export async function fetchGameSnapshot(
  roomId: string,
  playerId: string,
): Promise<{ publicState: MpPublicState | null; hand: { hand: GameCard[]; version: number } | null }> {
  const [room, hand] = await Promise.all([getRoom(roomId), fetchMyHand(roomId, playerId)])
  return { publicState: room && isPublicGameState(room.game_state) ? room.game_state : null, hand }
}

/** Cosmetic broadcast events on the game channel (never part of the game state). */
export const COMMS_EVENTS = ['chat', 'poke', 'voice'] as const
export type CommsEvent = typeof COMMS_EVENTS[number]

/** Send a cosmetic broadcast on a subscribed game channel. */
export function sendComms(channel: RealtimeChannel | null, event: CommsEvent, payload: object) {
  return channel?.send({ type: 'broadcast', event, payload })
}

/**
 * Realtime for the game screen: the public room row and the viewer's own hand row
 * (RLS limits `room_player_hands` changes to the owner). Also carries presence, emotes and
 * the social layer (chat, pokes, voice signalling — see `lib/roomChat.ts` / `lib/voiceChat.ts`).
 */
export function subscribeToGame(
  roomId: string,
  playerId: string,
  handlers: {
    onPublic: (state: MpPublicState) => void
    onHand: (hand: GameCard[], version: number) => void
    onPresence: (onlineIds: Set<string>) => void
    onEmote: (playerId: string, emoji: string) => void
    onStatus: (status: 'connected' | 'disconnected') => void
    onComms?: (event: CommsEvent, payload: unknown) => void
  },
) {
  const channel = supabase
    .channel(`game-${roomId}`, { config: { presence: { key: playerId } } })
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'multiplayer_rooms', filter: `id=eq.${roomId}` },
      (payload) => {
        const gs = (payload.new as Room).game_state
        if (isPublicGameState(gs)) handlers.onPublic(gs)
      },
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_player_hands', filter: `room_id=eq.${roomId}` },
      (payload) => {
        const row = payload.new as Partial<MpHandRow>
        if (row && row.player_id === playerId && Array.isArray(row.hand)) handlers.onHand(row.hand, row.version ?? 0)
      },
    )
    .on('presence', { event: 'sync' }, () => {
      const ids = new Set<string>()
      Object.values(channel.presenceState()).forEach(list => {
        (list as { player_id?: string }[]).forEach(p => { if (p.player_id) ids.add(p.player_id) })
      })
      handlers.onPresence(ids)
    })
    .on('broadcast', { event: 'emote' }, (payload) => {
      const data = payload.payload as { playerId?: string; emoji?: string }
      if (data?.playerId && data.emoji) handlers.onEmote(data.playerId, data.emoji)
    })
  COMMS_EVENTS.forEach(event => {
    channel.on('broadcast', { event }, (payload) => handlers.onComms?.(event, payload.payload))
  })
  channel
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        handlers.onStatus('connected')
        await channel.track({ player_id: playerId })
        // Initial fetch after the subscription is live, so no update is missed.
        const room = await getRoom(roomId)
        if (room && isPublicGameState(room.game_state)) handlers.onPublic(room.game_state)
        const mine = await fetchMyHand(roomId, playerId)
        if (mine) handlers.onHand(mine.hand, mine.version)
      } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
        handlers.onStatus('disconnected')
      }
    })

  return channel
}

// Single unified subscription. Uses a named broadcast channel on the room so that
// postgres_changes for room_players (which can't reliably filter by room_id on
// non-PK columns) are supplemented by broadcast events the clients emit themselves.
export function subscribeToRoom(
  roomId: string,
  onRoomUpdate: (room: Room) => void,
  onPlayersUpdate: (players: RoomPlayer[]) => void,
) {
  const channelName = `room-${roomId}`

  const channel = supabase
    .channel(channelName, { config: { broadcast: { self: true } } })
    // Listen for room row updates (game_state, status)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'multiplayer_rooms', filter: `id=eq.${roomId}` },
      (payload) => {
        onRoomUpdate(payload.new as Room)
      },
    )
    // Broadcast events: when a player joins/leaves/readies, they broadcast to the channel
    // so everyone gets a fresh player list fetch
    .on('broadcast', { event: 'players_changed' }, () => {
      getRoomPlayers(roomId).then(onPlayersUpdate)
    })
    .subscribe((status) => {
      // Once subscribed, fetch current state immediately
      if (status === 'SUBSCRIBED') {
        getRoomPlayers(roomId).then(onPlayersUpdate)
        getRoom(roomId).then(room => { if (room) onRoomUpdate(room) })
      }
    })

  return channel
}

// Call this after any room_players mutation so all subscribers get a fresh list
export async function broadcastPlayersChanged(roomId: string): Promise<void> {
  const channels = supabase.getChannels()
  const existing = channels.find(c => c.topic === `realtime:room-${roomId}`)

  if (existing) {
    await existing.send({ type: 'broadcast', event: 'players_changed', payload: {} })
  } else {
    const channel = supabase.channel(`room-broadcast-${roomId}`, { config: { broadcast: { self: true } } })
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({ type: 'broadcast', event: 'players_changed', payload: {} })
        supabase.removeChannel(channel)
      }
    })
  }
}
