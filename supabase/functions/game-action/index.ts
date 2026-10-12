/**
 * game-action — server-authoritative multiplayer (Phase 5 Track M).
 *
 * POST { roomId: uuid, action: MpAction | { type: 'start' } } with the user's JWT.
 * Game-rule rejections come back as 200 { ok: false, error, message } so the client can
 * show them; auth / membership problems are 401 / 403; version conflicts after a retry 409.
 *
 * The rules live in src/lib/multiplayerAuthority.ts, bundled into ../_shared/engine.js by
 * `node scripts/build-functions.mjs` — never edit engine.js by hand.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  applyPlayerAction, buildInitialMultiplayerState, changedHands, computePlacements, isMultiplayerMode,
  publicState, redactForPlayer, setRng, MAX_PLAYERS, MIN_PLAYERS,
} from '../_shared/engine.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ACTION_TYPES = new Set(['start', 'draw', 'decision', 'action', 'equip', 'pass', 'tick', 'forfeit', 'emote'])

// Server randomness for deck shuffles, draws, market rolls and life events.
setRng(() => {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 4294967296
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any

function respond(body: Json, status = 200): Response {
  return new Response(JSON.stringify({ serverNow: Date.now(), ...body }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

interface RoomRow {
  id: string
  host_id: string
  status: 'waiting' | 'in_progress' | 'completed'
  max_players: number
  game_state: Json
}

async function loadRoom(admin: SupabaseClient, roomId: string): Promise<RoomRow> {
  const { data, error } = await admin
    .from('multiplayer_rooms')
    .select('id, host_id, status, max_players, game_state')
    .eq('id', roomId)
    .maybeSingle()
  if (error) throw new HttpError(500, 'server_error', error.message)
  if (!data) throw new HttpError(404, 'not_found', 'Room not found')
  return data as RoomRow
}

async function loadState(admin: SupabaseClient, roomId: string): Promise<{ state: Json; version: number } | null> {
  const { data, error } = await admin
    .from('multiplayer_room_state')
    .select('state, version')
    .eq('room_id', roomId)
    .maybeSingle()
  if (error) throw new HttpError(500, 'server_error', error.message)
  return data ? { state: data.state, version: data.version } : null
}

async function commit(admin: SupabaseClient, roomId: string, expectedVersion: number, prev: Json | null, next: Json): Promise<boolean> {
  const current = next.players[next.currentPlayerIndex]
  const { data, error } = await admin.rpc('mp_commit_state', {
    p_room_id: roomId,
    p_expected_version: expectedVersion,
    p_state: next,
    p_public: publicState(next),
    p_hands: changedHands(prev, next),
    p_current_player_id: current?.id ?? null,
    p_winner_id: next.winner?.id ?? null,
    p_game_over: next.phase === 'game_over',
  })
  if (error) throw new HttpError(500, 'server_error', error.message)
  return data === true
}

/** Report every human's result. apply_match_result is idempotent per (match, user). */
async function settle(admin: SupabaseClient, roomId: string, state: Json): Promise<void> {
  const placements = computePlacements(state)
  const total = state.players.length
  for (const p of placements) {
    const player = state.players.find((x: Json) => x.id === p.playerId)
    if (!player || player.isBot) continue
    const { error } = await admin.rpc('apply_match_result', {
      p_match_id: roomId,
      p_user_id: p.playerId,
      p_mode: 'multiplayer',
      p_won: p.won,
      p_placement: p.placement,
      p_total_players: total,
      p_final_wealth: p.finalWealth,
      p_stats: p.stats,
    })
    if (error) console.error(`apply_match_result failed for ${p.playerId} in ${roomId}:`, error.message)
  }
}

async function handleStart(admin: SupabaseClient, room: RoomRow, userId: string): Promise<Response> {
  if (room.host_id !== userId) throw new HttpError(403, 'not_host', 'Only the host can start the game')
  if (room.status !== 'waiting') return respond({ ok: false, error: 'not_waiting', message: 'This game has already started' })

  const { data: seats, error } = await admin
    .from('room_players')
    .select('player_id, username, seat_order, is_ready, joined_at')
    .eq('room_id', room.id)
    .order('seat_order', { ascending: true })
    .order('joined_at', { ascending: true })
  if (error) throw new HttpError(500, 'server_error', error.message)
  const players = seats ?? []
  if (players.length < MIN_PLAYERS) return respond({ ok: false, error: 'not_enough_players', message: 'Need at least 2 players' })
  if (players.length > Math.min(room.max_players, MAX_PLAYERS)) {
    return respond({ ok: false, error: 'bad_request', message: 'Too many players in this room' })
  }
  if (players.some((p: Json) => p.player_id !== room.host_id && !p.is_ready)) {
    return respond({ ok: false, error: 'not_ready', message: 'Everyone must be ready' })
  }

  const ids = players.map((p: Json) => p.player_id)
  const { data: profiles } = await admin.from('profiles').select('id, avatar_url, rank_points').in('id', ids)
  const mode = isMultiplayerMode(room.game_state?.multiplayerMode) ? room.game_state.multiplayerMode : 'standard'
  const state = buildInitialMultiplayerState(
    players.map((p: Json) => {
      const prof = (profiles ?? []).find((x: Json) => x.id === p.player_id)
      return { id: p.player_id, name: p.username, avatar_url: prof?.avatar_url ?? null, rank_points: prof?.rank_points ?? 0 }
    }),
    mode,
    Date.now(),
  )

  const ok = await commit(admin, room.id, 0, null, state)
  if (!ok) return respond({ ok: false, error: 'not_waiting', message: 'This game has already started' })
  return respond({ ok: true, version: state.version, view: redactForPlayer(state, userId), events: state.lastEvents })
}

async function lastSeenMap(admin: SupabaseClient, roomId: string): Promise<Record<string, number>> {
  const { data, error } = await admin.from('room_players').select('player_id, last_seen').eq('room_id', roomId)
  if (error) throw new HttpError(500, 'server_error', error.message)
  const out: Record<string, number> = {}
  for (const r of data ?? []) out[r.player_id] = new Date(r.last_seen).getTime()
  return out
}

async function handleAction(admin: SupabaseClient, room: RoomRow, userId: string, action: Json): Promise<Response> {
  if (room.status === 'waiting') return respond({ ok: false, error: 'wrong_phase', message: 'The game has not started yet' })

  for (let attempt = 0; attempt < 2; attempt++) {
    const loaded = await loadState(admin, room.id)
    if (!loaded) throw new HttpError(404, 'not_found', 'No game state for this room')
    const full = loaded.state
    if (!full.players.some((p: Json) => p.id === userId)) {
      throw new HttpError(403, 'not_in_game', 'You are not in this game')
    }

    if (full.phase === 'game_over') {
      // Idempotent re-settlement in case a previous settle call failed half-way.
      await settle(admin, room.id, full)
      return respond({ ok: false, error: 'game_over', message: 'The game is over', version: loaded.version, view: redactForPlayer(full, userId) })
    }

    // Heartbeats come from the database, never from the client.
    const intent = action.type === 'tick' ? { type: 'tick', lastSeen: await lastSeenMap(admin, room.id) } : action
    const result = applyPlayerAction(full, userId, intent, Date.now())
    if (result.error) {
      return respond({ ok: false, error: result.error, message: result.message, version: loaded.version, view: redactForPlayer(full, userId) })
    }
    if (!result.changed) {
      return respond({ ok: true, version: loaded.version, view: redactForPlayer(full, userId), events: result.events })
    }

    const next = result.state
    if (await commit(admin, room.id, loaded.version, full, next)) {
      if (next.phase === 'game_over') await settle(admin, room.id, next)
      return respond({ ok: true, version: next.version, view: redactForPlayer(next, userId), events: result.events })
    }
    // Someone else committed first: reload and re-validate once.
  }
  return respond({ ok: false, error: 'conflict', message: 'The game moved on — please try again' }, 409)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return respond({ ok: false, error: 'bad_request', message: 'POST only' }, 405)

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new HttpError(401, 'unauthorized', 'Sign in to play')
    const userClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) throw new HttpError(401, 'unauthorized', 'Sign in to play')

    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    let body: Json
    try {
      body = await req.json()
    } catch {
      throw new HttpError(400, 'bad_request', 'Invalid JSON')
    }
    const roomId = body?.roomId
    const action = body?.action
    if (typeof roomId !== 'string' || !UUID_RE.test(roomId)) throw new HttpError(400, 'bad_request', 'Invalid roomId')
    if (!action || typeof action !== 'object' || !ACTION_TYPES.has(action.type)) {
      throw new HttpError(400, 'bad_request', 'Invalid action')
    }

    const room = await loadRoom(admin, roomId)
    if (action.type === 'start') return await handleStart(admin, room, user.id)
    return await handleAction(admin, room, user.id, action)
  } catch (err) {
    if (err instanceof HttpError) return respond({ ok: false, error: err.code, message: err.message }, err.status)
    console.error('game-action failed', err)
    return respond({ ok: false, error: 'server_error', message: 'Something went wrong' }, 500)
  }
})
