/**
 * save-game-result — records the end of a signed-in single-player game.
 *
 * Request (POST, user JWT in Authorization):
 *   { matchId: uuid, won: boolean, placement: int, totalPlayers: int,
 *     finalWealth: number, forfeit?: boolean,
 *     stats?: { investChoices: number, emiDamageTaken: boolean } }
 *
 * The match must have been opened with the `start_match` RPC by the same user.
 * Rules (numbers mirror MATCH_LIMITS in src/data/rankRules.ts):
 *   - unknown / foreign / multiplayer matches are rejected;
 *   - a match that is already finished returns its stored result (idempotent retry)
 *     or 409 if it was closed without a result;
 *   - matches older than MAX_MATCH_HOURS are rejected (410);
 *   - non-forfeit results sooner than the minimum duration are rejected (422);
 *   - a forfeit is always a loss in last place;
 *   - RP/XP/coins/leaderboard/contracts are applied by SQL `apply_match_result`
 *     (service_role only), which also enforces the daily ranked RP cap and the
 *     daily coin caps.
 *
 * Multiplayer results are written by the `game-action` function, not here.
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (provided by Supabase).
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MIN_DURATION_SECONDS: Record<string, number> = { ranked: 90, practice: 45, campaign: 45 }
const MAX_MATCH_HOURS = 6
const MAX_ABS_WEALTH = 1_000_000_000
const MAX_INVEST_CHOICES = 50
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

function isInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new HttpError(401, 'Unauthorized')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) throw new HttpError(401, 'Unauthorized')

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      throw new HttpError(400, 'Invalid JSON body')
    }

    const matchId = body.matchId
    if (typeof matchId !== 'string' || !UUID_RE.test(matchId)) {
      throw new HttpError(400, 'matchId is required')
    }

    const { data: match, error: matchError } = await admin
      .from('matches')
      .select('id, user_id, mode, total_players, started_at, finished_at')
      .eq('id', matchId)
      .maybeSingle()
    if (matchError) throw new HttpError(500, 'Could not load match')
    if (!match || match.user_id !== user.id) throw new HttpError(404, 'Unknown match')
    if (match.mode === 'multiplayer') throw new HttpError(400, 'Multiplayer results are recorded by the server')

    if (match.finished_at) {
      // Idempotent retry: return the stored result if this match already has one.
      const { data: existing } = await admin
        .from('match_results')
        .select('match_id, mode, won, placement, total_players, forfeit, rp_change, rp_capped, xp_gained, coins_gained, contract_coins')
        .eq('match_id', matchId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (existing) return json({ success: true, result: { ...existing, already_applied: true } })
      throw new HttpError(409, 'Match already finished')
    }

    const ageSeconds = (Date.now() - new Date(match.started_at).getTime()) / 1000
    if (ageSeconds > MAX_MATCH_HOURS * 3600) throw new HttpError(410, 'Match expired')

    const forfeit = body.forfeit === true
    const totalPlayers = body.totalPlayers
    if (!isInt(totalPlayers) || totalPlayers < 1 || totalPlayers > 6 || (match.mode === 'ranked' && totalPlayers < 2)) {
      throw new HttpError(400, 'Invalid totalPlayers')
    }
    if (match.total_players != null && match.total_players !== totalPlayers) {
      throw new HttpError(400, 'totalPlayers does not match the started game')
    }

    let won = body.won === true
    let placement = body.placement
    if (forfeit) {
      won = false
      placement = totalPlayers
    } else {
      if (typeof body.won !== 'boolean') throw new HttpError(400, 'Invalid won')
      if (!isInt(placement) || placement < 1 || placement > totalPlayers) throw new HttpError(400, 'Invalid placement')
      if (won && placement !== 1) throw new HttpError(400, 'A win must be 1st place')
      const minSeconds = MIN_DURATION_SECONDS[match.mode] ?? 90
      if (ageSeconds < minSeconds) throw new HttpError(422, 'Game finished too quickly')
    }

    const finalWealth = body.finalWealth
    if (typeof finalWealth !== 'number' || !Number.isFinite(finalWealth) || Math.abs(finalWealth) > MAX_ABS_WEALTH) {
      throw new HttpError(400, 'Invalid finalWealth')
    }

    const rawStats = (body.stats && typeof body.stats === 'object') ? body.stats as Record<string, unknown> : {}
    const investChoices = isInt(rawStats.investChoices)
      ? Math.min(Math.max(rawStats.investChoices, 0), MAX_INVEST_CHOICES)
      : 0
    const stats = {
      investChoices,
      emiDamageTaken: rawStats.emiDamageTaken === true,
      forfeit,
    }

    const { data: result, error: applyError } = await admin.rpc('apply_match_result', {
      p_match_id: matchId,
      p_user_id: user.id,
      p_mode: match.mode,
      p_won: won,
      p_placement: placement,
      p_total_players: totalPlayers,
      p_final_wealth: Math.round(finalWealth),
      p_stats: stats,
    })
    if (applyError) throw new HttpError(400, applyError.message)

    return json({ success: true, result })
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unexpected error'
    if (status >= 500) console.error('save-game-result failed', error)
    return json({ error: message }, status)
  }
})
