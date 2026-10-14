#!/usr/bin/env node
/* eslint-env node */
/**
 * Applies every migration in supabase/migrations (in order) to an in-memory
 * Postgres (@electric-sql/pglite) with a stub Supabase `auth` schema, then runs
 * assertions against the economy RPCs and RLS policies.
 *
 *   npm run check:migrations
 *
 * Stubs (what Supabase provides and pglite does not):
 *   - roles anon / authenticated / service_role (service_role BYPASSRLS)
 *   - default privileges: ALL on public tables/sequences/functions to those roles
 *   - auth.users table and auth.uid() / auth.role() reading the
 *     `request.jwt.claim.sub` / `request.jwt.claim.role` settings
 *
 * Old migrations are never edited; if one needs something pglite lacks, stub it
 * in SETUP_SQL below.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { build } from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = join(root, 'supabase', 'migrations')

const SETUP_SQL = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('request.jwt.claim.role', true), '') $$;

GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
`

/** Bundle a TS module (with optional stubbed imports) and import it. */
async function importTs(entry, stubs = {}) {
  const result = await build({
    entryPoints: [join(root, entry)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
    plugins: [{
      name: 'stubs',
      setup(b) {
        for (const [filter, contents] of Object.entries(stubs)) {
          const re = new RegExp(filter)
          b.onResolve({ filter: re }, args => ({ path: args.path, namespace: 'stub' }))
          b.onLoad({ filter: re, namespace: 'stub' }, () => ({ contents, loader: 'js' }))
        }
      },
    }],
  })
  const code = result.outputFiles[0].text
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
}

let passed = 0
const failures = []
async function check(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ok   ${name}`)
  } catch (e) {
    failures.push(name)
    console.log(`  FAIL ${name}\n       ${e && e.message ? e.message : e}`)
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg) }
function eq(actual, expected, msg) {
  if (actual !== expected) throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

const db = new PGlite()

async function asRole(role, uid, sql, params = []) {
  await db.exec('RESET ROLE')
  await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false), set_config('request.jwt.claim.role', $2, false)`, [uid ?? '', role])
  if (role !== 'postgres') await db.exec(`SET ROLE ${role}`)
  try {
    return await db.query(sql, params)
  } finally {
    await db.exec('RESET ROLE')
    await db.query(`SELECT set_config('request.jwt.claim.sub', '', false), set_config('request.jwt.claim.role', '', false)`)
  }
}
const asUser = (uid, sql, params) => asRole('authenticated', uid, sql, params)
const asService = (sql, params) => asRole('service_role', null, sql, params)
const asAnon = (sql, params) => asRole('anon', null, sql, params)
const su = (sql, params) => asRole('postgres', null, sql, params)

async function expectError(promise, pattern, msg) {
  try {
    await promise
  } catch (e) {
    if (pattern && !pattern.test(e.message)) throw new Error(`${msg}: wrong error "${e.message}"`)
    return
  }
  throw new Error(`${msg}: expected an error`)
}

async function one(promise) {
  const r = await promise
  return r.rows[0]
}

// ---------------------------------------------------------------------------
console.log('Applying migrations to in-memory Postgres (pglite)')
await db.exec(SETUP_SQL)
const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
for (const f of files) {
  try {
    await db.exec(readFileSync(join(migrationsDir, f), 'utf8'))
    console.log(`  applied ${f}`)
  } catch (e) {
    console.log(`  FAILED  ${f}: ${e.message}`)
    process.exit(1)
  }
}

const rankRules = await importTs('src/data/rankRules.ts')
const market = await importTs('src/lib/market.ts', { '^\\./supabase$': 'export const supabase = {}' })

const U1 = '00000000-0000-4000-8000-000000000001'
const U2 = '00000000-0000-4000-8000-000000000002'
const U3 = '00000000-0000-4000-8000-000000000003'
await su(`INSERT INTO auth.users (id, email) VALUES ($1, 'a@x.test'), ($2, 'b@x.test'), ($3, 'c@x.test')`, [U1, U2, U3])

console.log('\nAssertions')

// --- profiles ---------------------------------------------------------------
await check('profile insert cannot set coins/RP/XP (forced defaults)', async () => {
  // age_band 'adult' -> consent_status 'not_required' (20261014500000): may write game data
  await asUser(U1, `INSERT INTO profiles (id, username, daanik_coins, rank_points, total_xp, games_won, login_streak, age_band)
                    VALUES ($1, 'alice', 999999, 5000, 9999, 77, 30, 'adult')`, [U1])
  const p = await one(su(`SELECT daanik_coins, rank_points, total_xp, games_won, login_streak FROM profiles WHERE id = $1`, [U1]))
  eq(p.daanik_coins, 100, 'coins'); eq(p.rank_points, 0, 'rp'); eq(p.total_xp, 0, 'xp'); eq(p.games_won, 0, 'games_won'); eq(p.login_streak, 0, 'login_streak')
  await asUser(U2, `INSERT INTO profiles (id, username, age_band) VALUES ($1, 'bob', 'adult')`, [U2])
  await asUser(U3, `INSERT INTO profiles (id, username, age_band) VALUES ($1, 'carol', 'adult')`, [U3])
})

await check('profile insert creates a zeroed leaderboard row; client cannot insert leaderboard rows', async () => {
  const lb = await one(su(`SELECT username, wins, total_games FROM leaderboard WHERE user_id = $1`, [U1]))
  eq(lb?.username, 'alice', 'leaderboard username'); eq(lb.wins, 0, 'wins')
  await expectError(asUser(U1, `INSERT INTO leaderboard (user_id, username, wins) VALUES ($1, 'x', 999)`, [U1]), /row-level security|duplicate/, 'leaderboard insert')
})

await check('cannot insert a profile for someone else', async () => {
  const U4 = '00000000-0000-4000-8000-000000000004'
  await su(`INSERT INTO auth.users (id) VALUES ($1)`, [U4])
  await expectError(asUser(U1, `INSERT INTO profiles (id, username) VALUES ($1, 'mallory')`, [U4]), /row-level security/, 'foreign profile insert')
})

await check('direct profile UPDATE is blocked; update_my_profile works and syncs leaderboard', async () => {
  const r = await asUser(U1, `UPDATE profiles SET daanik_coins = 1000000 WHERE id = $1`, [U1])
  eq(r.affectedRows ?? 0, 0, 'rows updated directly')
  eq((await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U1]))).daanik_coins, 100, 'coins after direct update')
  await asUser(U1, `SELECT update_my_profile('alice_2', NULL)`)
  const p = await one(su(`SELECT username, avatar_url FROM profiles WHERE id = $1`, [U1]))
  eq(p.username, 'alice_2', 'username'); eq(p.avatar_url, null, 'avatar kept')
  await asUser(U1, `SELECT update_my_profile(NULL, 'https://example.com/a.png')`)
  eq((await one(su(`SELECT username, avatar_url FROM profiles WHERE id = $1`, [U1]))).username, 'alice_2', 'username kept')
  eq((await one(su(`SELECT username FROM leaderboard WHERE user_id = $1`, [U1]))).username, 'alice_2', 'leaderboard synced')
  await expectError(asUser(U1, `SELECT update_my_profile('bob', NULL)`), /taken/, 'duplicate username')
  await expectError(asUser(U1, `SELECT update_my_profile(NULL, 'javascript:alert(1)')`), /avatar/i, 'bad avatar')
})

// --- daily reward -------------------------------------------------------------
await check('claim_daily_reward: first claim pays, second claim same day -> already_claimed', async () => {
  const a = (await one(asUser(U1, `SELECT claim_daily_reward() AS r`))).r
  eq(a.reward, 10, 'reward'); eq(a.streak, 1, 'streak'); eq(a.already_claimed, false, 'already_claimed')
  const b = (await one(asUser(U1, `SELECT claim_daily_reward() AS r`))).r
  eq(b.already_claimed, true, 'second already_claimed'); eq(b.reward, 0, 'second reward')
  eq((await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U1]))).daanik_coins, 110, 'coins')
})

await check('claim_daily_reward: consecutive day grows streak, gap resets it', async () => {
  await su(`UPDATE profiles SET last_login_date = ist_today() - 1, login_streak = 3 WHERE id = $1`, [U1])
  const a = (await one(asUser(U1, `SELECT claim_daily_reward() AS r`))).r
  eq(a.streak, 4, 'streak'); eq(a.reward, rankRules.dailyRewardForStreak(4), 'reward day 4')
  await su(`UPDATE profiles SET last_login_date = ist_today() - 3, login_streak = 6 WHERE id = $1`, [U1])
  const b = (await one(asUser(U1, `SELECT claim_daily_reward() AS r`))).r
  eq(b.streak, 1, 'reset streak'); eq(b.reward, 10, 'reset reward')
  await expectError(asAnon(`SELECT claim_daily_reward()`), /permission denied/, 'anon claim')
})

await check('daily_reward_amount matches rankRules.dailyRewardForStreak', async () => {
  for (let s = 0; s <= 12; s++) {
    eq((await one(su(`SELECT daily_reward_amount($1) AS v`, [s]))).v, rankRules.dailyRewardForStreak(s), `streak ${s}`)
  }
})

// --- spend_coins --------------------------------------------------------------
await check('spend_coins deducts atomically and never goes negative', async () => {
  await su(`UPDATE profiles SET daanik_coins = 60 WHERE id = $1`, [U2])
  eq((await one(asUser(U2, `SELECT spend_coins(25, 'extra_card') AS b`))).b, 35, 'balance after 1st')
  eq((await one(asUser(U2, `SELECT spend_coins(25, 'extra_card') AS b`))).b, 10, 'balance after 2nd')
  await expectError(asUser(U2, `SELECT spend_coins(25, 'extra_card')`), /Not enough/, 'overspend')
  await expectError(asUser(U2, `SELECT spend_coins(-50, 'extra_card')`), /Invalid amount/, 'negative amount')
  await expectError(asUser(U2, `SELECT spend_coins(5, 'gift')`), /Invalid reason/, 'unknown reason')
  eq((await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U2]))).daanik_coins, 10, 'final balance')
})

// --- RP table parity ------------------------------------------------------------
await check('rank_rp_change (SQL) matches calculateRankRP (src/data/rankRules.ts)', async () => {
  const { rows } = await su(`
    SELECT n, p, s, rank_rp_change(p, n, s) AS v
    FROM generate_series(0, 7) n, generate_series(0, 7) p, generate_series(0, 8) s`)
  for (const r of rows) {
    eq(r.v, rankRules.calculateRankRP(r.p, r.n, r.s), `n=${r.n} p=${r.p} streak=${r.s}`)
  }
})

await check('RP table: bigger lobbies pay more for 1st and cost less for last', async () => {
  for (let n = 3; n <= 6; n++) {
    assert(rankRules.calculateRankRP(1, n, 0) > rankRules.calculateRankRP(1, n - 1, 0), `1st place n=${n}`)
    assert(rankRules.calculateRankRP(n, n, 0) > rankRules.calculateRankRP(n - 1, n - 1, 0), `last place n=${n}`)
  }
})

// --- matches / apply_match_result ------------------------------------------------
let rankedMatch
await check('start_match creates an owned open match; clients cannot write matches', async () => {
  rankedMatch = (await one(asUser(U1, `SELECT start_match('ranked', NULL, 4) AS id`))).id
  const m = await one(asUser(U1, `SELECT user_id, mode, total_players, finished_at FROM matches WHERE id = $1`, [rankedMatch]))
  eq(m.user_id, U1, 'owner'); eq(m.total_players, 4, 'players'); eq(m.finished_at, null, 'open')
  eq((await asUser(U2, `SELECT * FROM matches WHERE id = $1`, [rankedMatch])).rows.length, 0, 'other user sees match')
  await expectError(asUser(U1, `INSERT INTO matches (user_id, mode) VALUES ($1, 'ranked')`, [U1]), /permission denied|row-level/, 'direct insert')
  await expectError(asUser(U1, `UPDATE matches SET finished_at = now() WHERE id = $1`, [rankedMatch]), /permission denied/, 'direct update')
  await expectError(asUser(U1, `SELECT start_match('multiplayer', NULL, 4)`), /Invalid mode/, 'multiplayer start')
  await expectError(asUser(U1, `SELECT start_match('ranked', NULL, NULL)`), /player count/, 'ranked without count')
})

const applySql = `SELECT apply_match_result($1, $2, $3, $4, $5, $6, $7, $8::jsonb) AS r`

await check('apply_match_result is not executable by authenticated or anon', async () => {
  await expectError(asUser(U1, applySql, [rankedMatch, U1, 'ranked', true, 1, 4, 6000000, '{}']), /permission denied/, 'authenticated')
  await expectError(asAnon(applySql, [rankedMatch, U1, 'ranked', true, 1, 4, 6000000, '{}']), /permission denied/, 'anon')
})

await check('apply_match_result (service_role) applies RP/XP/coins/leaderboard once (idempotent)', async () => {
  const before = await one(su(`SELECT daanik_coins, rank_points, total_xp, games_played FROM profiles WHERE id = $1`, [U1]))
  const a = (await one(asService(applySql, [rankedMatch, U1, 'ranked', true, 1, 4, 6000000, '{"investChoices": 2}']))).r
  eq(a.already_applied, false, 'first already_applied')
  eq(a.rp_change, rankRules.calculateRankRP(1, 4, 0), 'rp_change')
  eq(a.xp_gained, rankRules.MATCH_REWARDS.competitive.xpWin, 'xp')
  eq(a.coins_gained, rankRules.MATCH_REWARDS.competitive.coinsWin, 'coins')
  const b = (await one(asService(applySql, [rankedMatch, U1, 'ranked', true, 1, 4, 6000000, '{}']))).r
  eq(b.already_applied, true, 'second already_applied'); eq(b.rp_change, a.rp_change, 'second rp_change')
  const after = await one(su(`SELECT daanik_coins, rank_points, total_xp, games_played, win_streak FROM profiles WHERE id = $1`, [U1]))
  eq(after.rank_points, before.rank_points + a.rp_change, 'rank points applied once')
  eq(after.total_xp, before.total_xp + a.xp_gained, 'xp applied once')
  eq(after.games_played, before.games_played + 1, 'games_played once')
  eq(after.daanik_coins, before.daanik_coins + a.coins_gained + a.contract_coins, 'coins once')
  eq(after.win_streak, 1, 'win streak')
  const lb = await one(su(`SELECT wins, total_games, highest_net_worth FROM leaderboard WHERE user_id = $1`, [U1]))
  eq(lb.wins, 1, 'lb wins'); eq(lb.total_games, 1, 'lb games'); eq(Number(lb.highest_net_worth), 6000000, 'lb net worth')
  eq((await one(su(`SELECT finished_at IS NOT NULL AS f FROM matches WHERE id = $1`, [rankedMatch]))).f, true, 'match finished')
  eq((await one(su(`SELECT count(*)::int AS c FROM match_results WHERE match_id = $1`, [rankedMatch]))).c, 1, 'one result row')
})

await check('apply_match_result validates input and ownership', async () => {
  const m = (await one(asUser(U1, `SELECT start_match('ranked', NULL, 3) AS id`))).id
  await expectError(asService(applySql, [m, U2, 'ranked', true, 1, 3, 0, '{}']), /Unknown match/, 'foreign match')
  await expectError(asService(applySql, [m, U1, 'ranked', true, 2, 3, 0, '{}']), /1st place/, 'win not 1st')
  await expectError(asService(applySql, [m, U1, 'ranked', false, 4, 3, 0, '{}']), /placement/, 'placement > players')
  await expectError(asService(applySql, [m, U1, 'ranked', false, 2, 5, 0, '{}']), /Player count/, 'lobby size differs')
  await expectError(asService(applySql, [m, U1, 'practice', false, 2, 3, 0, '{}']), /mode mismatch/, 'mode mismatch')
})

await check('starting a new ranked match forfeits the abandoned one (loss, last place)', async () => {
  const open = (await one(su(`SELECT id FROM matches WHERE user_id = $1 AND mode = 'ranked' AND finished_at IS NULL`, [U1]))).id
  await asUser(U1, `SELECT start_match('ranked', NULL, 2)`)
  const r = await one(su(`SELECT won, placement, total_players, forfeit, rp_change, xp_gained FROM match_results WHERE match_id = $1`, [open]))
  eq(r.forfeit, true, 'forfeit'); eq(r.won, false, 'won'); eq(r.placement, 3, 'last place'); eq(r.xp_gained, 0, 'no xp')
  eq((await one(su(`SELECT win_streak FROM profiles WHERE id = $1`, [U1]))).win_streak, 0, 'streak reset')
})

await check('forfeit flag forces loss + last place', async () => {
  const m = (await one(asUser(U1, `SELECT start_match('ranked', NULL, 4) AS id`))).id
  const r = (await one(asService(applySql, [m, U1, 'ranked', true, 1, 4, 9999999, '{"forfeit": true}']))).r
  eq(r.won, false, 'won'); eq(r.placement, 4, 'placement'); eq(r.forfeit, true, 'forfeit'); eq(r.coins_gained, 0, 'coins')
})

await check('practice/campaign: XP + capped coins, no RP, no leaderboard', async () => {
  const before = await one(su(`SELECT rank_points, win_streak FROM profiles WHERE id = $1`, [U3]))
  const lbBefore = await one(su(`SELECT total_games FROM leaderboard WHERE user_id = $1`, [U3]))
  let totalCoins = 0
  for (let i = 0; i < 12; i++) {
    const mode = i % 2 ? 'campaign' : 'practice'
    const m = (await one(asUser(U3, `SELECT start_match($1, $2, 3) AS id`, [mode, mode === 'campaign' ? 'level_1' : null]))).id
    const r = (await one(asService(applySql, [m, U3, mode, true, 1, 3, 5000000, '{}']))).r
    eq(r.rp_change, 0, `rp ${i}`)
    eq(r.xp_gained, rankRules.MATCH_REWARDS.casual.xpWin, `xp ${i}`)
    totalCoins += r.coins_gained
  }
  eq(totalCoins, rankRules.MATCH_REWARDS.casual.dailyCoinCap, 'coins capped per day')
  const after = await one(su(`SELECT rank_points, win_streak FROM profiles WHERE id = $1`, [U3]))
  eq(after.rank_points, before.rank_points, 'rp unchanged'); eq(after.win_streak, before.win_streak, 'streak unchanged')
  eq((await one(su(`SELECT total_games FROM leaderboard WHERE user_id = $1`, [U3]))).total_games, lbBefore.total_games, 'leaderboard unchanged')
})

await check(`ranked RP stops after ${rankRules.MATCH_LIMITS.rankedRpResultsPerDay} results per day; coins capped`, async () => {
  const cap = rankRules.MATCH_LIMITS.rankedRpResultsPerDay
  let coins = 0
  let last
  for (let i = 0; i <= cap; i++) {
    const m = (await one(asUser(U2, `SELECT start_match('ranked', NULL, 2) AS id`))).id
    last = (await one(asService(applySql, [m, U2, 'ranked', true, 1, 2, 100, '{}']))).r
    coins += last.coins_gained
    if (i < cap) assert(last.rp_change > 0 && !last.rp_capped, `result ${i} should earn RP`)
  }
  eq(last.rp_capped, true, 'capped'); eq(last.rp_change, 0, 'capped rp')
  eq(coins, Math.min(rankRules.MATCH_REWARDS.competitive.dailyCoinCap, (cap + 1) * rankRules.MATCH_REWARDS.competitive.coinsWin), 'coin cap')
})

await check('multiplayer results (match id = room id, no matches row) are idempotent', async () => {
  const room = 'aaaaaaaa-0000-4000-8000-000000000001'
  const a = (await one(asService(applySql, [room, U3, 'multiplayer', false, 2, 3, 100, '{}']))).r
  const b = (await one(asService(applySql, [room, U3, 'multiplayer', false, 2, 3, 100, '{}']))).r
  eq(a.already_applied, false, 'first'); eq(b.already_applied, true, 'second')
  eq(a.rp_change, rankRules.calculateRankRP(2, 3, 0), 'rp')
})

await check('contracts progress via apply_match_result; client cannot insert progress', async () => {
  await su(`INSERT INTO daily_contracts (id, title, description, difficulty, reward_dc, requirement_type, requirement_value, contract_date)
            VALUES ('t-wins', 'Win', 'Win 1', 'easy', 15, 'wins', 1, CURRENT_DATE) ON CONFLICT (id) DO NOTHING`)
  const coins0 = (await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U1]))).daanik_coins
  const m = (await one(asUser(U1, `SELECT start_match('ranked', NULL, 2) AS id`))).id
  const r = (await one(asService(applySql, [m, U1, 'ranked', true, 1, 2, 100, '{}']))).r
  assert(r.contract_coins >= 15, 'contract reward paid')
  const pc = await one(su(`SELECT completed FROM player_contracts WHERE player_id = $1 AND contract_id = 't-wins'`, [U1]))
  eq(pc.completed, true, 'contract completed')
  eq((await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U1]))).daanik_coins, coins0 + r.coins_gained + r.contract_coins, 'coins')
  await expectError(asUser(U2, `INSERT INTO player_contracts (player_id, contract_id, progress, completed) VALUES ($1, 't-wins', 1, true)`, [U2]), /row-level security/, 'insert completed')
  await asUser(U2, `INSERT INTO player_contracts (player_id, contract_id) VALUES ($1, 't-wins')`, [U2])
  const upd = await asUser(U2, `UPDATE player_contracts SET completed = true WHERE player_id = $1`, [U2])
  eq(upd.affectedRows ?? 0, 0, 'update own contract')
})

// --- rooms --------------------------------------------------------------------------
await check('room_players: cannot join a full or in-progress room', async () => {
  const room = (await one(asUser(U1, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('AAA111', $1, 2) RETURNING id`, [U1]))).id
  await asUser(U1, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 0)`, [room, U1])
  await asUser(U2, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 1)`, [room, U2])
  await expectError(asUser(U3, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 2)`, [room, U3]), /row-level security|full/, 'full room')
  const room2 = (await one(asUser(U1, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('BBB222', $1, 4) RETURNING id`, [U1]))).id
  await asUser(U1, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 0)`, [room2, U1])
  // Rooms are started by the game-action edge function (service role); members can't UPDATE rooms any more
  const started = await su(`UPDATE multiplayer_rooms SET status = 'in_progress' WHERE id = $1`, [room2])
  eq(started.affectedRows, 1, 'server starts room')
  await expectError(asUser(U3, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 1)`, [room2, U3]), /row-level security|not accepting/, 'in-progress room')
  const room3 = (await one(asUser(U1, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('CCC333', $1, 4) RETURNING id`, [U1]))).id
  await expectError(asUser(U2, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 1)`, [room3, U3]), /row-level security/, 'seat for someone else')
  await asUser(U3, `INSERT INTO room_players (room_id, player_id, seat_order) VALUES ($1, $2, 1)`, [room3, U3])
})

await check('protect_room_fields: members cannot change host/code/size/status', async () => {
  const room = (await one(su(`SELECT id FROM multiplayer_rooms WHERE code = 'AAA111'`))).id
  await expectError(asUser(U2, `UPDATE multiplayer_rooms SET host_id = $2 WHERE id = $1`, [room, U2]), /cannot be changed|permission denied/, 'member takes host')
  await expectError(asUser(U2, `UPDATE multiplayer_rooms SET host_id = $2, status = 'completed', winner_id = $2 WHERE id = $1`, [room, U2]), /cannot be changed|permission denied/, 'host takeover + status')
  await expectError(asUser(U1, `UPDATE multiplayer_rooms SET max_players = 6 WHERE id = $1`, [room]), /cannot be changed|permission denied/, 'host changes size')
  await expectError(asUser(U1, `UPDATE multiplayer_rooms SET code = 'ZZZ999' WHERE id = $1`, [room]), /cannot be changed|permission denied/, 'host changes code')
  await expectError(asUser(U2, `UPDATE multiplayer_rooms SET status = 'completed' WHERE id = $1`, [room]), /Only the host|permission denied/, 'member changes status')
  const seat = (await one(su(`SELECT id FROM room_players WHERE room_id = $1 AND player_id = $2`, [room, U2]))).id
  const other = (await one(su(`SELECT id FROM multiplayer_rooms WHERE code = 'BBB222'`))).id
  await expectError(asUser(U2, `UPDATE room_players SET room_id = $2 WHERE id = $1`, [seat, other]), /cannot be moved|permission denied/, 'move seat')
})

await check('service role (game-action) can still finish a room', async () => {
  const room = (await one(su(`SELECT id FROM multiplayer_rooms WHERE code = 'BBB222'`))).id
  const r = await asService(`UPDATE multiplayer_rooms SET status = 'completed', winner_id = $2 WHERE id = $1`, [room, U1])
  eq(r.affectedRows, 1, 'service role completes room despite protect_room_fields')
})

await check('leaderboard is readable by anon', async () => {
  assert((await asAnon(`SELECT * FROM leaderboard`)).rows.length >= 3, 'anon leaderboard rows')
})

// --- market ------------------------------------------------------------------------
await check('stock_price (SQL) matches market.ts stockPriceAt across hours/time zones', async () => {
  const start = Date.UTC(2026, 0, 1, 0, 30)
  for (let h = 0; h < 24 * 40; h += 7) {
    const at = new Date(start + h * 3600_000)
    for (const ticker of ['MSIP', 'CSHLD', 'EMIF', 'BNPL', 'GLDR', 'CRPT', 'TAXR', 'SIPA']) {
      const sql = (await one(su(`SELECT stock_price($1, $2::timestamptz) AS p`, [ticker, at.toISOString()]))).p
      eq(sql, market.stockPriceAt(ticker, at), `${ticker} @ ${at.toISOString()}`)
    }
  }
  eq((await one(su(`SELECT stock_price('NOPE', now()) AS p`))).p, null, 'unknown ticker')
})

await check('buy_stock/sell_stock charge the server price; client price params are gone', async () => {
  await su(`UPDATE profiles SET daanik_coins = 100000 WHERE id = $1`, [U1])
  const buy = (await one(asUser(U1, `SELECT buy_stock('MSIP', 3) AS r`))).r
  const serverPrice = (await one(su(`SELECT stock_price('MSIP', now()) AS p`))).p
  eq(buy.price, serverPrice, 'buy price'); eq(buy.total, serverPrice * 3, 'buy total')
  eq((await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U1]))).daanik_coins, 100000 - serverPrice * 3, 'coins after buy')
  const sell = (await one(asUser(U1, `SELECT sell_stock('MSIP', 1) AS r`))).r
  eq(sell.total, serverPrice, 'sell revenue')
  eq((await one(su(`SELECT shares FROM user_stocks WHERE user_id = $1 AND ticker = 'MSIP'`, [U1]))).shares, 2, 'shares left')
  await expectError(asUser(U1, `SELECT buy_stock('MSIP', 1, 1)`), /does not exist/, 'old 3-arg buy_stock')
  await expectError(asUser(U1, `SELECT sell_stock('MSIP', 1, 99999999)`), /does not exist/, 'old 3-arg sell_stock')
  await expectError(asUser(U1, `SELECT sell_stock('MSIP', 5)`), /Not enough shares/, 'oversell')
  await expectError(asUser(U1, `SELECT buy_stock('NOPE', 1)`), /Unknown ticker/, 'unknown ticker')
  await su(`UPDATE profiles SET daanik_coins = 10 WHERE id = $1`, [U1])
  await expectError(asUser(U1, `SELECT buy_stock('GLDR', 1)`), /Not enough/, 'cannot afford')
  eq((await one(su(`SELECT daanik_coins FROM profiles WHERE id = $1`, [U1]))).daanik_coins, 10, 'coins unchanged')
})

// --- player reports ------------------------------------------------------------------
const reportSql = `SELECT report_player($1, $2, $3, $4, $5::jsonb) AS id`
const REPORT_ROOM = 'bbbbbbbb-0000-4000-8000-000000000001'

await check('report_player inserts a report owned by the caller and returns its id', async () => {
  const evidence = JSON.stringify([{ at: '2026-10-13T10:00:00.000Z', kind: 'text', text: 'give me your UPI pin' }])
  const id = (await one(asUser(U1, reportSql, [U2, REPORT_ROOM, 'scam', '  asked for my PIN  ', evidence]))).id
  assert(id, 'returned id')
  const r = await one(su(`SELECT reporter_id, reported_id, room_id, reason, details, status, jsonb_array_length(evidence) AS n FROM player_reports WHERE id = $1`, [id]))
  eq(r.reporter_id, U1, 'reporter'); eq(r.reported_id, U2, 'reported'); eq(r.room_id, REPORT_ROOM, 'room')
  eq(r.reason, 'scam', 'reason'); eq(r.details, 'asked for my PIN', 'details trimmed'); eq(r.status, 'open', 'status'); eq(r.n, 1, 'evidence lines')
  const noRoom = (await one(asUser(U1, reportSql, [U3, null, 'spam', null, null]))).id
  eq((await one(su(`SELECT evidence::text AS e, details FROM player_reports WHERE id = $1`, [noRoom]))).e, '[]', 'null evidence -> []')
})

await check('report_player rejects self-report, bad input, duplicates, anon', async () => {
  await expectError(asUser(U1, reportSql, [U1, REPORT_ROOM, 'abuse', null, '[]']), /yourself/, 'self report')
  await expectError(asUser(U1, reportSql, [U3, REPORT_ROOM, 'rude', null, '[]']), /Invalid reason/, 'unknown reason')
  await expectError(asUser(U1, reportSql, [U3, REPORT_ROOM, 'abuse', 'x'.repeat(501), '[]']), /too long/, 'long details')
  await expectError(asUser(U1, reportSql, [U3, REPORT_ROOM, 'abuse', null, '{"a":1}']), /Invalid evidence/, 'evidence not array')
  await expectError(asUser(U1, reportSql, [U3, REPORT_ROOM, 'abuse', null, JSON.stringify(Array.from({ length: 11 }, () => 'x'))]), /Invalid evidence/, '11 evidence lines')
  await expectError(asUser(U1, reportSql, [U3, REPORT_ROOM, 'abuse', null, JSON.stringify(['x'.repeat(4100)])]), /Invalid evidence/, 'evidence too big')
  await expectError(asUser(U1, reportSql, ['00000000-0000-4000-8000-0000000000ff', REPORT_ROOM, 'abuse', null, '[]']), /Unknown player/, 'unknown player')
  await expectError(asUser(U1, reportSql, [U2, REPORT_ROOM, 'abuse', null, '[]']), /Already reported/, 'same player same room')
  await expectError(asUser(U1, reportSql, [U3, null, 'abuse', null, '[]']), /Already reported/, 'same player, no room')
  await expectError(asAnon(reportSql, [U2, REPORT_ROOM, 'abuse', null, '[]']), /permission denied/, 'anon')
})

await check('player_reports: no direct insert/select/update/delete for authenticated or anon', async () => {
  await expectError(asUser(U1, `INSERT INTO player_reports (reported_id, reason) VALUES ($1, 'abuse')`, [U3]), /permission denied|row-level/, 'direct insert')
  await expectError(asUser(U1, `SELECT * FROM player_reports`), /permission denied/, 'select own reports')
  await expectError(asUser(U2, `SELECT * FROM player_reports`), /permission denied/, 'reported user reads reports')
  await expectError(asUser(U1, `UPDATE player_reports SET status = 'dismissed'`), /permission denied/, 'update')
  await expectError(asUser(U2, `DELETE FROM player_reports`), /permission denied/, 'delete')
  await expectError(asAnon(`SELECT * FROM player_reports`), /permission denied/, 'anon select')
  eq((await one(su(`SELECT count(*)::int AS c FROM player_reports`))).c, 2, 'rows untouched')
})

await check('report_player: max 10 reports per reporter per day', async () => {
  // U3 reports U2 in 10 different rooms, the 11th is refused
  for (let i = 0; i < 10; i++) {
    await asUser(U3, reportSql, [U2, `cccccccc-0000-4000-8000-0000000000${String(i).padStart(2, '0')}`, 'spam', null, '[]'])
  }
  await expectError(asUser(U3, reportSql, [U2, 'cccccccc-0000-4000-8000-000000000099', 'spam', null, '[]']), /limit/, '11th report')
  // reports older than 24h don't count
  await su(`UPDATE player_reports SET created_at = now() - interval '25 hours' WHERE reporter_id = $1`, [U3])
  assert((await one(asUser(U3, reportSql, [U2, 'cccccccc-0000-4000-8000-000000000099', 'spam', null, '[]']))).id, 'allowed again next day')
})

await check('deleting an account removes reports made by and about it', async () => {
  const U5 = '00000000-0000-4000-8000-000000000005'
  await su(`INSERT INTO auth.users (id) VALUES ($1)`, [U5])
  await su(`INSERT INTO profiles (id, username, age_band) VALUES ($1, 'user5', 'adult')`, [U5])
  await asUser(U5, reportSql, [U1, null, 'abuse', null, '[]'])
  await asUser(U1, reportSql, [U5, null, 'abuse', null, '[]'])
  await su(`DELETE FROM auth.users WHERE id = $1`, [U5])
  eq((await one(su(`SELECT count(*)::int AS c FROM player_reports WHERE reporter_id = $1 OR reported_id = $1`, [U5]))).c, 0, 'reports left')
})

// ---------------------------------------------------------------------------
// Guest campaign import + library progress (20261014*)
// ---------------------------------------------------------------------------
const importSql = `SELECT import_guest_campaign_progress($1::jsonb) AS r`
const levelsOf = async uid => Object.fromEntries((await su(
  `SELECT level_id, stars, imported FROM campaign_progress WHERE user_id = $1`, [uid])).rows.map(r => [r.level_id, r]))

await check('import_guest_campaign_progress: caps, unlock chain, best kept, once per account', async () => {
  const U6 = '00000000-0000-4000-8000-000000000006'
  await su(`INSERT INTO auth.users (id) VALUES ($1)`, [U6])
  await su(`INSERT INTO profiles (id, username, age_band) VALUES ($1, 'user6', 'adult')`, [U6])
  // existing signed-in result on level_1 (2 stars)
  await asUser(U6, `SELECT record_level_result('level_1', 2, 1500000)`)
  const claim = [
    { level_id: 'level_1', stars: 1, net_worth: 900000 },     // worse than the account: kept at 2
    { level_id: 'level_2', stars: 9, net_worth: 1e20 },       // clamped to 3, net worth capped
    { level_id: 'level_4', stars: 3, net_worth: 6500000 },    // level_3 missing → rejected (chain)
    { level_id: 'level_3', stars: 0, net_worth: 100 },        // 0 stars → ignored
    { level_id: 'nope', stars: 3 }, 'junk', 42,               // invalid entries skipped
  ]
  const r = (await one(asUser(U6, importSql, [JSON.stringify(claim)]))).r
  eq(r.already_imported, false, 'first import')
  eq(r.accepted, 1, 'accepted count')
  const lv = await levelsOf(U6)
  eq(lv.level_1.stars, 2, 'level_1 keeps the better account result')
  eq(lv.level_1.imported, false, 'level_1 not marked imported')
  eq(lv.level_2.stars, 3, 'level_2 stars clamped')
  eq(lv.level_2.imported, true, 'level_2 marked imported')
  assert(!lv.level_3 && !lv.level_4, 'level_3/level_4 not imported')
  eq((await one(su(`SELECT best_net_worth::text AS n FROM campaign_progress WHERE user_id = $1 AND level_id = 'level_2'`, [U6]))).n, '1000000000000', 'net worth cap')
  eq(r.progress.length, 2, 'returns the account progress')

  // second import: no changes at all
  const again = (await one(asUser(U6, importSql, [JSON.stringify([{ level_id: 'level_3', stars: 3, net_worth: 1 }])]))).r
  eq(again.already_imported, true, 'second import refused')
  eq(again.accepted, 0, 'nothing accepted twice')
  assert(!(await levelsOf(U6)).level_3, 'level_3 still absent')

  // a signed-in result with as many stars verifies the level
  await asUser(U6, `SELECT record_level_result('level_2', 3, 100)`)
  eq((await levelsOf(U6)).level_2.imported, false, 'verified by play')

  // chain inside one import + limits + auth
  const U7 = '00000000-0000-4000-8000-000000000007'
  await su(`INSERT INTO auth.users (id) VALUES ($1)`, [U7])
  await su(`INSERT INTO profiles (id, username, age_band) VALUES ($1, 'user7', 'adult')`, [U7])
  const chain = (await one(asUser(U7, importSql, [JSON.stringify([
    { level_id: 'level_2', stars: 1, net_worth: 1 }, { level_id: 'level_1', stars: 3, net_worth: 1 },
  ])]))).r
  eq(chain.accepted, 2, 'level_1 then level_2 in one import')
  await expectError(asUser(U3, importSql, [JSON.stringify(Array.from({ length: 51 }, () => ({})))]), /Too many/, '51 entries')
  await expectError(asUser(U3, importSql, ['{"a":1}']), /Invalid levels/, 'not an array')
  await expectError(asAnon(importSql, ['[]']), /permission denied|Not authenticated/, 'anon')
  // import table: own row readable, not writable
  eq((await asUser(U6, `SELECT user_id FROM campaign_guest_imports`)).rows.length, 1, 'own import row')
  eq((await asUser(U7, `SELECT user_id FROM campaign_guest_imports WHERE user_id = $1`, [U6])).rows.length, 0, 'foreign import row hidden')
  await expectError(asUser(U3, `INSERT INTO campaign_guest_imports (user_id) VALUES ($1)`, [U3]), /permission denied/, 'direct insert')
  await expectError(asUser(U6, `DELETE FROM campaign_guest_imports`), /permission denied/, 'delete own import row')
  await expectError(asUser(U6, `UPDATE campaign_progress SET stars = 3`), /permission denied/, 'direct progress update')
})

const libUpsert = `INSERT INTO library_progress (user_id, concept_id, seen) VALUES ($1, $2, $3)
  ON CONFLICT (user_id, concept_id) DO UPDATE SET seen = EXCLUDED.seen, unlocked_at = EXCLUDED.unlocked_at`

await check('library_progress: own rows only, monotonic union, no delete', async () => {
  await asUser(U1, libUpsert, [U1, 'inflation', true])
  await asUser(U1, libUpsert, [U1, 'sip', false])
  // re-upsert with seen=false must not un-see; unlocked_at keeps the earliest
  const before = (await one(su(`SELECT unlocked_at FROM library_progress WHERE user_id = $1 AND concept_id = 'inflation'`, [U1]))).unlocked_at
  await asUser(U1, libUpsert, [U1, 'inflation', false])
  const row = await one(su(`SELECT seen, unlocked_at FROM library_progress WHERE user_id = $1 AND concept_id = 'inflation'`, [U1]))
  eq(row.seen, true, 'seen stays true')
  eq(row.unlocked_at.getTime(), before.getTime(), 'unlocked_at kept')
  await asUser(U1, libUpsert, [U1, 'sip', true])
  eq((await one(su(`SELECT seen FROM library_progress WHERE user_id = $1 AND concept_id = 'sip'`, [U1]))).seen, true, 'seen can turn true')
  await asUser(U1, `UPDATE library_progress SET user_id = $1, concept_id = 'x' WHERE concept_id = 'sip'`, [U2])
  eq((await one(su(`SELECT count(*)::int AS c FROM library_progress WHERE user_id = $1 AND concept_id = 'sip'`, [U1]))).c, 1, 'keys immutable')

  eq((await asUser(U2, `SELECT * FROM library_progress`)).rows.length, 0, 'other user sees nothing')
  await expectError(asUser(U2, libUpsert, [U1, 'scams', true]), /row-level|permission denied/, 'insert for another user')
  await asUser(U2, `UPDATE library_progress SET seen = false WHERE user_id = $1`, [U1])
  await expectError(asUser(U1, `DELETE FROM library_progress`), /permission denied/, 'delete')
  await expectError(asAnon(`SELECT * FROM library_progress`), /permission denied/, 'anon select')
  await expectError(asUser(U1, libUpsert, [U1, 'Bad Id!', false]), /check constraint/, 'invalid concept id')
  eq((await one(su(`SELECT count(*)::int AS c FROM library_progress WHERE user_id = $1`, [U1]))).c, 2, 'rows intact')
})

await check('library_progress: 200 concepts per player cap (existing rows still upsert)', async () => {
  await su(`INSERT INTO library_progress (user_id, concept_id) SELECT $1, 'c_' || g FROM generate_series(1, 198) g`, [U2])
  await asUser(U2, libUpsert, [U2, 'inflation', false])
  await asUser(U2, libUpsert, [U2, 'sip', false])
  await expectError(asUser(U2, libUpsert, [U2, 'scams', false]), /Too many/, '201st concept')
  await asUser(U2, libUpsert, [U2, 'sip', true])
  eq((await one(su(`SELECT seen FROM library_progress WHERE user_id = $1 AND concept_id = 'sip'`, [U2]))).seen, true, 'existing row upserted at cap')
})

// ---------------------------------------------------------------------------
// Age bands + parental consent (20261014500*)
// ---------------------------------------------------------------------------
const consentCfg = await importTs('src/config/consent.ts')
const consentServer = await importTs('src/lib/consentServer.ts')
const sha = s => createHash('sha256').update(s).digest('hex')
let kidSeq = 0
const kidId = () => `00000000-0000-4000-9000-${String(++kidSeq).padStart(12, '0')}`
async function newAuthUser(email) {
  const id = kidId()
  await su(`INSERT INTO auth.users (id, email) VALUES ($1, $2)`, [id, email ?? null])
  return id
}
const createProfile = (uid, name, band) => one(asUser(uid, `SELECT create_my_profile($1, $2) AS r`, [name, band])).then(r => r.r)
async function newChild() {
  const id = await newAuthUser()
  await createProfile(id, 'Child Name', '13to17')
  return id
}
const profileOf = uid => one(su(`SELECT * FROM profiles WHERE id = $1`, [uid]))
const exists = async (sql, params) => (await one(su(`SELECT EXISTS (${sql}) AS e`, params))).e
const svc = async (fn, args) => (await one(asService(`SELECT ${fn}(${args.map((_, i) => `$${i + 1}`).join(', ')}) AS r`, args))).r
const createReq = (child, email, tok, wtok) => svc('consent_create_request', [child, email, sha(tok), sha(wtok)])
/** Moves the child's requests back in time so the 60 s cooldown has passed. */
const pastCooldown = child => su(`UPDATE parent_consent_requests SET created_at = created_at - interval '61 seconds' WHERE child_id = $1`, [child])
const thisYear = () => (new Date(Date.now() + 330 * 60_000)).getUTCFullYear()
const approve = (tok, o = {}) => {
  const a = { name: 'Sunita Sharma', year: thisYear() - 40, decl: true, notice: consentCfg.CONSENT_NOTICE_VERSION, ...o }
  return svc('consent_approve', [sha(tok), a.name, a.year, a.decl, a.notice, null])
}
const NEW_TABLES = ['auth.users WHERE id', 'profiles WHERE id', 'parental_consents WHERE child_id', 'parent_consent_requests WHERE child_id',
  'parent_withdraw_tokens WHERE child_id', 'leaderboard WHERE user_id', 'campaign_progress WHERE user_id']

await check('consent numbers and email masking match src/config/consent.ts / consentServer.ts', async () => {
  const cfg = (await one(su(`SELECT private.consent_config() AS c`))).c
  eq(cfg.token_ttl_days, consentCfg.CONSENT_TOKEN_TTL_DAYS, 'ttl days')
  eq(cfg.resend_cooldown_seconds, consentCfg.CONSENT_RESEND_COOLDOWN_SECONDS, 'cooldown')
  eq(cfg.max_emails_per_child_per_day, consentCfg.CONSENT_MAX_EMAILS_PER_CHILD_PER_DAY, 'child cap')
  eq(cfg.max_emails_per_parent_per_day, consentCfg.CONSENT_MAX_EMAILS_PER_PARENT_PER_DAY, 'parent cap')
  for (const e of ['riya.sharma@gmail.com', 'a@b.in', 'x.y+z@sub.example.co.in', 'nope', '@x.com']) {
    eq((await one(su(`SELECT private.mask_email($1) AS m`, [e]))).m, consentServer.maskEmail(e), `mask ${e}`)
  }
})

await check('create_my_profile: adult keeps the name, 13to17 gets a neutral name, under13 creates nothing', async () => {
  const adult = await newAuthUser()
  const a = await createProfile(adult, '  grown_up ', 'adult')
  eq(a.consent_status, 'not_required', 'adult status'); eq(a.age_band, 'adult', 'adult band')
  const pa = await profileOf(adult)
  eq(pa.username, 'grown_up', 'adult username'); assert(pa.age_recorded_at, 'age_recorded_at set')
  assert(await exists(`SELECT 1 FROM leaderboard WHERE user_id = $1`, [adult]), 'adult leaderboard row')

  const kid = await newAuthUser()
  const k = await createProfile(kid, 'Riya Sharma', '13to17')
  eq(k.consent_status, 'pending_consent', 'child status'); eq(k.age_band, '13to17', 'child band')
  const pk = await profileOf(kid)
  assert(/^player[0-9]{8}$/.test(pk.username), `neutral username, got ${pk.username}`)
  assert(!(await exists(`SELECT 1 FROM leaderboard WHERE user_id = $1`, [kid])), 'no leaderboard row while pending')
  // idempotent; the band can't be changed this way
  const again = await createProfile(kid, 'x', 'adult')
  eq(again.consent_status, 'pending_consent', 'idempotent status'); eq(again.age_band, '13to17', 'idempotent band')

  const young = await newAuthUser()
  await expectError(createProfile(young, 'tiny', 'under13'), /under_min_age/, 'under13')
  assert(!(await exists(`SELECT 1 FROM profiles WHERE id = $1`, [young])), 'no profile for under13')
  await expectError(createProfile(young, 'x', 'teen'), /invalid_age_band/, 'unknown band')
  await expectError(createProfile(await newAuthUser(), 'alice_2', 'adult'), /username_taken/, 'taken username')
  await expectError(createProfile(await newAuthUser(), 'ab', 'adult'), /3-32/, 'short username')
  await expectError(asAnon(`SELECT create_my_profile('x', 'adult')`), /permission denied/, 'anon')
})

await check('profile insert/update cannot choose consent_status or age columns', async () => {
  const u = await newAuthUser()
  await asUser(u, `INSERT INTO profiles (id, username, consent_status, age_recorded_at) VALUES ($1, 'sneaky', 'active_minor', '2000-01-01')`, [u])
  const p = await profileOf(u)
  eq(p.consent_status, 'unknown', 'status forced'); eq(p.age_recorded_at, null, 'age_recorded_at forced')
  const c = await newAuthUser()
  await asUser(c, `INSERT INTO profiles (id, username, age_band, avatar_url) VALUES ($1, 'Real Name', '13to17', 'https://x/y.png')`, [c])
  const pc = await profileOf(c)
  eq(pc.consent_status, 'pending_consent', 'direct child insert'); assert(pc.username.startsWith('player'), 'neutral name'); eq(pc.avatar_url, null, 'avatar dropped')
  await expectError(asUser(await newAuthUser(), `INSERT INTO profiles (id, username, age_band) VALUES (auth.uid(), 'kid', 'under13')`), /under_min_age/, 'under13 insert')
  const r = await asUser(c, `UPDATE profiles SET consent_status = 'active_minor', age_band = 'adult' WHERE id = $1`, [c])
  eq(r.affectedRows ?? 0, 0, 'client update')
  eq((await profileOf(c)).consent_status, 'pending_consent', 'status unchanged')
})

await check('set_my_age_band: once only; under13 deletes the account', async () => {
  const u = await newAuthUser()
  await asUser(u, `INSERT INTO profiles (id, username) VALUES ($1, 'oldaccount')`, [u])
  assert(!(await exists(`SELECT 1 FROM leaderboard WHERE user_id = $1`, [u])), 'unknown account has no leaderboard row')
  const r = (await one(asUser(u, `SELECT set_my_age_band('adult') AS r`))).r
  eq(r.consent_status, 'not_required', 'status'); eq(r.age_band, 'adult', 'band')
  assert(await exists(`SELECT 1 FROM leaderboard WHERE user_id = $1`, [u]), 'leaderboard row created')
  await expectError(asUser(u, `SELECT set_my_age_band('13to17')`), /age_already_set/, 'second call')
  await expectError(asUser(u, `SELECT set_my_age_band('under13')`), /age_already_set/, 'under13 after adult')
  eq((await createProfile(u, 'x', '13to17')).age_band, 'adult', 'create_my_profile cannot change the band')

  const v = await newAuthUser()
  await asUser(v, `INSERT INTO profiles (id, username) VALUES ($1, 'Teen Real Name')`, [v])
  eq((await one(asUser(v, `SELECT set_my_age_band('13to17') AS r`))).r.consent_status, 'pending_consent', 'teen pending')
  assert((await profileOf(v)).username.startsWith('player'), 'teen name neutralised')

  const w = await newAuthUser()
  await asUser(w, `INSERT INTO profiles (id, username) VALUES ($1, 'little_one')`, [w])
  eq((await one(asUser(w, `SELECT set_my_age_band('under13') AS r`))).r.deleted, true, 'deleted flag')
  assert(!(await exists(`SELECT 1 FROM auth.users WHERE id = $1`, [w])), 'auth user gone')
  assert(!(await exists(`SELECT 1 FROM profiles WHERE id = $1`, [w])), 'profile gone')
  // Google sign-in: auth user without a profile yet
  const g = await newAuthUser()
  eq((await one(asUser(g, `SELECT set_my_age_band('under13') AS r`))).r.deleted, true, 'no-profile delete')
  assert(!(await exists(`SELECT 1 FROM auth.users WHERE id = $1`, [g])), 'no-profile auth user gone')
  await expectError(asUser(await newAuthUser(), `SELECT set_my_age_band('adult')`), /profile_not_found/, 'no profile')
})

let pendingKid
await check('pending / unknown accounts cannot write game data (adults can)', async () => {
  pendingKid = await newChild()
  const k = pendingKid
  const blocked = [
    [`SELECT start_match('practice', NULL, 2)`, 'start_match'],
    [`SELECT record_level_result('level_1', 3, 100)`, 'record_level_result'],
    [`SELECT import_guest_campaign_progress('[{"level_id":"level_1","stars":3,"net_worth":1}]'::jsonb)`, 'import'],
    [`INSERT INTO library_progress (user_id, concept_id) VALUES (auth.uid(), 'sip')`, 'library insert'],
    [`SELECT claim_daily_reward()`, 'claim_daily_reward'],
    [`SELECT spend_coins(5, 'extra_card')`, 'spend_coins'],
    [`SELECT update_my_profile('My Real Name', NULL)`, 'update_my_profile'],
    [`SELECT report_player('${U1}', NULL, 'spam', NULL, '[]')`, 'report_player'],
    [`INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('PND001', auth.uid(), 2)`, 'create room'],
    [`INSERT INTO player_contracts (player_id, contract_id) VALUES (auth.uid(), 't-wins')`, 'contract insert'],
  ]
  for (const [sql, name] of blocked) await expectError(asUser(k, sql), /consent_required/, name)
  // buy_stock/sell_stock write user_stocks and profiles: both guarded, even for the database owner
  await expectError(su(`INSERT INTO user_stocks (user_id, ticker, shares) VALUES ($1, 'MSIP', 1)`, [k]), /consent_required/, 'user_stocks insert')
  await expectError(su(`UPDATE profiles SET daanik_coins = 99999 WHERE id = $1`, [k]), /consent_required/, 'coins update')
  const room = (await one(asUser(U1, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('ADL001', $1, 4) RETURNING id`, [U1]))).id
  await expectError(asUser(k, `INSERT INTO room_players (room_id, player_id) VALUES ($1, $2)`, [room, k]), /consent_required/, 'join room')
  await expectError(asService(applySql, ['aaaaaaaa-0000-4000-8000-0000000000aa', k, 'multiplayer', false, 2, 2, 0, '{}']), /consent_required/, 'apply_match_result')
  eq((await profileOf(k)).daanik_coins, 100, 'coins untouched')
  // an account that never answered the age question ('unknown') is blocked too
  const u = await newAuthUser()
  await asUser(u, `INSERT INTO profiles (id, username) VALUES ($1, 'noanswer')`, [u])
  await expectError(asUser(u, `SELECT start_match('practice', NULL, 2)`), /consent_required/, 'unknown start_match')
  await expectError(asUser(u, `SELECT claim_daily_reward()`), /consent_required/, 'unknown claim')
  // and an auth user without any profile
  await expectError(asUser(await newAuthUser(), `SELECT record_level_result('level_1', 3, 100)`), /consent_required/, 'no profile')
  // adults still can (the checks above cover the rest)
  await asUser(U3, `SELECT record_level_result('level_1', 1, 100)`)
  await asUser(U3, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('ADL002', $1, 2)`, [U3])
})

await check('consent tables: clients cannot read/write requests or tokens, nor call consent functions', async () => {
  await expectError(asUser(U1, `INSERT INTO parental_consents (child_id, parent_email, parent_name, parent_declared_adult, method, notice_version) VALUES ($1, 'a@b.in', 'X Y', true, 'email_link_declaration', 'v')`, [U1]), /permission denied/, 'insert consent')
  await expectError(asUser(U1, `UPDATE parental_consents SET parent_name = 'x'`), /permission denied/, 'update consent')
  await expectError(asUser(U1, `SELECT * FROM parent_consent_requests`), /permission denied/, 'read requests')
  await expectError(asUser(U1, `INSERT INTO parent_consent_requests (child_id, parent_email, token_hash, expires_at) VALUES ($1, 'a@b.in', $2, now())`, [U1, sha('x')]), /permission denied/, 'insert request')
  await expectError(asUser(U1, `SELECT * FROM parent_withdraw_tokens`), /permission denied/, 'read withdraw tokens')
  await expectError(asAnon(`SELECT * FROM parental_consents`), /permission denied/, 'anon consents')
  await expectError(asUser(pendingKid, `SELECT consent_create_request($1, 'p@x.in', $2, $3)`, [pendingKid, sha('a'), sha('b')]), /permission denied/, 'authenticated create_request')
  await expectError(asAnon(`SELECT consent_approve($1, 'X Y', 1980, true, 'v', NULL)`, [sha('a')]), /permission denied/, 'anon approve')
  await expectError(asUser(U1, `SELECT delete_account_by_id($1)`, [U2]), /permission denied/, 'delete_account_by_id')
  await expectError(asUser(U1, `SELECT can_write_game_data($1)`, [U2]), /permission denied/, 'can_write_game_data oracle')
  await expectError(asAnon(`SELECT is_minor_account($1)`, [U2]), /permission denied/, 'is_minor_account oracle')
})

let activeKid
const activeKidWithdraw = 'wd-confirm'
await check('consent approve: single use, expiry, adult parent, declaration, name; own consent row only', async () => {
  const k = pendingKid
  const r1 = await createReq(k, '  Parent@Example.com ', 'tok-1', 'wd-1')
  eq(r1.ok, true, 'created'); eq(r1.parent_email_masked, 'p***@example.com', 'masked'); eq(r1.parent_email, 'parent@example.com', 'normalised email')
  await svc('consent_mark_sent', [r1.request_id])
  const view = await svc('consent_lookup', [sha('tok-1')])
  eq(view.status, 'valid', 'lookup valid'); eq(view.age_band, '13to17', 'age band'); eq(view.parent_email_masked, 'p***@example.com', 'lookup masked')
  eq((await svc('consent_lookup', [sha('nope')])).status, 'not_found', 'unknown token')

  eq((await approve('tok-1', { year: thisYear() - 18 })).error, 'not_adult', 'turning 18 this year is not enough')
  eq((await approve('tok-1', { year: thisYear() + 1 })).error, 'not_adult', 'future year')
  eq((await approve('tok-1', { year: thisYear() - 101 })).error, 'not_adult', 'implausible year')
  eq((await approve('tok-1', { year: null })).error, 'not_adult', 'no year')
  eq((await approve('tok-1', { decl: false })).error, 'declaration_required', 'declaration')
  eq((await approve('tok-1', { name: ' a ' })).error, 'invalid_name', 'short name')
  eq((await approve('tok-1', { name: 'x'.repeat(101) })).error, 'invalid_name', 'long name')
  eq((await profileOf(k)).consent_status, 'pending_consent', 'still pending after rejected attempts')

  const ok = await approve('tok-1', { name: '  Sunita   Sharma ', year: thisYear() - 19 })
  eq(ok.ok, true, 'approved'); eq(ok.child_id, k, 'child id'); eq(ok.parent_email, 'parent@example.com', 'parent email')
  eq((await profileOf(k)).consent_status, 'active_minor', 'active_minor')
  const c = await one(su(`SELECT parent_name, parent_declared_adult, method, notice_version FROM parental_consents WHERE child_id = $1`, [k]))
  eq(c.parent_name, 'Sunita Sharma', 'name stored'); eq(c.parent_declared_adult, true, 'declared adult'); eq(c.method, 'email_link_declaration', 'method')
  eq(c.notice_version, consentCfg.CONSENT_NOTICE_VERSION, 'notice version')
  assert(await exists(`SELECT 1 FROM leaderboard WHERE user_id = $1`, [k]), 'leaderboard row created on approval')
  eq((await approve('tok-1')).error, 'used', 'second approve')
  eq((await svc('consent_decline', [sha('tok-1')])).error, 'used', 'decline after approve')
  eq((await svc('consent_lookup', [sha('tok-1')])).status, 'used', 'lookup used')
  eq((await one(su(`SELECT count(*)::int AS c FROM parental_consents WHERE child_id = $1`, [k]))).c, 1, 'one consent row')
  eq((await svc('consent_create_request', [k, 'p@x.in', sha('t-x'), sha('w-x')])).error, 'not_pending', 'no request once active')

  eq((await asUser(k, `SELECT parent_name FROM parental_consents`)).rows.length, 1, 'child sees own consent')
  eq((await asUser(U1, `SELECT * FROM parental_consents`)).rows.length, 0, 'other user sees none')
  const st = (await one(asUser(k, `SELECT my_consent_status() AS r`))).r
  eq(st.consent_status, 'active_minor', 'my status'); eq(st.parent_email_masked, 'p***@example.com', 'my masked email')

  // active minors can play now
  await asUser(k, `SELECT record_level_result('level_1', 2, 100)`)
  eq((await svc('consent_issue_withdraw_token', [k, 'parent@example.com', sha(activeKidWithdraw)])).ok, true, 'withdraw token issued')
  eq((await svc('consent_issue_withdraw_token', [U1, 'x@example.com', sha('wd-adult')])).ok, false, 'no withdraw token for adults')
  activeKid = k

  // expiry
  const k2 = await newChild()
  const r2 = await createReq(k2, 'mum@example.in', 'tok-exp', 'wd-exp')
  await svc('consent_mark_sent', [r2.request_id])
  const s2 = (await one(asUser(k2, `SELECT my_consent_status() AS r`))).r
  eq(s2.consent_status, 'pending_consent', 'pending status'); eq(s2.parent_email_masked, 'm***@example.in', 'pending masked')
  assert(s2.last_sent_at && s2.request_expires_at, 'request times'); assert(s2.next_send_at, 'cooldown running')
  await su(`UPDATE parent_consent_requests SET expires_at = now() - interval '1 second' WHERE id = $1`, [r2.request_id])
  eq((await svc('consent_lookup', [sha('tok-exp')])).status, 'expired', 'lookup expired')
  eq((await approve('tok-exp')).error, 'expired', 'approve expired')
  eq((await svc('consent_decline', [sha('tok-exp')])).error, 'expired', 'decline expired')
  eq((await profileOf(k2)).consent_status, 'pending_consent', 'still pending')
})

await check('new request supersedes the old link and its withdraw link; resend reuses the address', async () => {
  const k = await newChild()
  const r1 = await createReq(k, 'dad@example.com', 'sup-1', 'sup-w1')
  await svc('consent_mark_sent', [r1.request_id])
  const limited = await createReq(k, 'dad@example.com', 'sup-2', 'sup-w2')
  eq(limited.ok, false, 'cooldown'); eq(limited.error, 'rate_limited', 'cooldown code')
  assert(limited.retry_after_seconds >= 1 && limited.retry_after_seconds <= consentCfg.CONSENT_RESEND_COOLDOWN_SECONDS, `retry ${limited.retry_after_seconds}`)
  await pastCooldown(k)
  const r2 = await svc('consent_create_request', [k, null, sha('sup-2'), sha('sup-w2')])
  eq(r2.ok, true, 'resend ok'); eq(r2.parent_email, 'dad@example.com', 'resend uses the latest address')
  eq((await svc('consent_lookup', [sha('sup-1')])).status, 'valid', 'old link valid until the new email is sent')
  await svc('consent_mark_sent', [r2.request_id])
  eq((await svc('consent_lookup', [sha('sup-1')])).status, 'superseded', 'old link superseded')
  eq((await approve('sup-1')).error, 'invalid_token', 'approve superseded')
  eq((await svc('consent_withdraw_lookup', [sha('sup-w1')])).status, 'not_found', 'old withdraw link revoked')
  eq((await svc('consent_withdraw_lookup', [sha('sup-w2')])).status, 'valid', 'new withdraw link valid')
  eq((await approve('sup-2')).ok, true, 'new link works')
  eq((await svc('consent_withdraw_lookup', [sha('sup-w2')])).consent_status, 'active_minor', 'approved request keeps its withdraw link')
  const fresh = await newChild()
  eq((await svc('consent_create_request', [fresh, null, sha('nr-1'), sha('nr-w1')])).error, 'bad_request', 'resend without earlier request')
  eq((await svc('consent_create_request', [fresh, 'not an email', sha('nr-1'), sha('nr-w1')])).error, 'invalid_email', 'bad email')
  eq((await svc('consent_create_request', [U1, 'p@x.in', sha('nr-1'), sha('nr-w1')])).error, 'not_pending', 'adult cannot request')
})

await check('rate limits: per child per day, per parent address per day, failed sends do not count', async () => {
  const cap = consentCfg.CONSENT_MAX_EMAILS_PER_CHILD_PER_DAY
  const k = await newChild()
  let last
  for (let i = 0; i < cap; i++) {
    last = await createReq(k, `p${i}@example.org`, `cap-${i}`, `cap-w${i}`)
    eq(last.ok, true, `send ${i + 1}`)
    await pastCooldown(k)
  }
  const over = await createReq(k, 'p9@example.org', 'cap-x', 'cap-wx')
  eq(over.error, 'rate_limited', 'child daily cap')
  assert(over.retry_after_seconds > 3600, `retry is about a day, got ${over.retry_after_seconds}`)
  await svc('consent_mark_failed', [last.request_id])
  eq((await svc('consent_lookup', [sha(`cap-${cap - 1}`)])).status, 'not_found', 'failed request link is dead')
  eq((await svc('consent_withdraw_lookup', [sha(`cap-w${cap - 1}`)])).status, 'not_found', 'failed request withdraw link is dead')
  eq((await createReq(k, 'p9@example.org', 'cap-x', 'cap-wx')).ok, true, 'failed send freed a slot')
  eq((await createReq(k, 'p9@example.org', 'cap-y', 'cap-wy')).error, 'rate_limited', 'cooldown counts every attempt')
  // sends older than a day no longer count
  await su(`UPDATE parent_consent_requests SET created_at = now() - interval '25 hours' WHERE child_id = $1`, [k])
  eq((await createReq(k, 'p8@example.org', 'cap-y', 'cap-wy')).ok, true, 'next day')

  const pcap = consentCfg.CONSENT_MAX_EMAILS_PER_PARENT_PER_DAY
  for (let i = 0; i < pcap; i++) {
    eq((await createReq(await newChild(), 'busy.parent@example.net', `par-${i}`, `par-w${i}`)).ok, true, `parent send ${i + 1}`)
  }
  eq((await createReq(await newChild(), 'Busy.Parent@example.net', 'par-x', 'par-wx')).error, 'rate_limited', 'parent daily cap (case-insensitive)')
})

await check('decline and withdraw delete the child account', async () => {
  const k = await newChild()
  const r = await createReq(k, 'no@example.com', 'dec-1', 'dec-w1')
  await svc('consent_mark_sent', [r.request_id])
  eq((await svc('consent_decline', [sha('dec-1')])).ok, true, 'declined')
  assert(!(await exists(`SELECT 1 FROM auth.users WHERE id = $1`, [k])), 'auth user gone')
  assert(!(await exists(`SELECT 1 FROM profiles WHERE id = $1`, [k])), 'profile gone')
  eq((await svc('consent_lookup', [sha('dec-1')])).status, 'not_found', 'token gone')
  eq((await svc('consent_decline', [sha('dec-1')])).error, 'invalid_token', 'second decline')

  // withdraw while still pending
  const p = await newChild()
  await createReq(p, 'mom@example.com', 'wp-1', 'wp-w1')
  eq((await svc('consent_withdraw_lookup', [sha('wp-w1')])).consent_status, 'pending_consent', 'withdraw view pending')
  eq((await svc('consent_withdraw', [sha('wp-w1')])).ok, true, 'withdraw pending')
  assert(!(await exists(`SELECT 1 FROM auth.users WHERE id = $1`, [p])), 'pending child deleted')

  // withdraw after consent (link from the confirmation email)
  eq((await svc('consent_withdraw_lookup', [sha(activeKidWithdraw)])).consent_status, 'active_minor', 'withdraw view active')
  eq((await svc('consent_withdraw', [sha(activeKidWithdraw)])).ok, true, 'withdraw active')
  for (const t of NEW_TABLES) assert(!(await exists(`SELECT 1 FROM ${t} = $1`, [activeKid])), `${t} cleared`)
  eq((await svc('consent_withdraw', [sha(activeKidWithdraw)])).error, 'invalid_token', 'second withdraw')
})

let minorKid
await check('minors: hidden from leaderboard / profiles of others, own row visible', async () => {
  const k = await newChild()
  const r = await createReq(k, 'guardian@example.com', 'min-1', 'min-w1')
  await svc('consent_mark_sent', [r.request_id])
  eq((await approve('min-1')).ok, true, 'approved')
  minorKid = k
  assert(await exists(`SELECT 1 FROM leaderboard WHERE user_id = $1`, [k]), 'row exists')
  eq((await asAnon(`SELECT * FROM leaderboard WHERE user_id = $1`, [k])).rows.length, 0, 'anon cannot see minor')
  eq((await asUser(U1, `SELECT * FROM leaderboard WHERE user_id = $1`, [k])).rows.length, 0, 'other user cannot see minor')
  eq((await asUser(k, `SELECT * FROM leaderboard WHERE user_id = $1`, [k])).rows.length, 1, 'minor sees own row')
  eq((await asAnon(`SELECT * FROM leaderboard WHERE user_id = $1`, [U1])).rows.length, 1, 'anon still sees adults')
  eq((await asUser(U1, `SELECT * FROM profiles WHERE id = $1`, [k])).rows.length, 0, 'other user cannot read minor profile')
  eq((await asUser(k, `SELECT * FROM profiles WHERE id = $1`, [k])).rows.length, 1, 'minor reads own profile')
  eq((await asUser(k, `SELECT * FROM profiles WHERE id = $1`, [U1])).rows.length, 1, 'adult profiles still readable')
})

await check('minors: private rooms only', async () => {
  const k = minorKid
  const pub = (await one(asUser(U1, `INSERT INTO multiplayer_rooms (code, host_id, max_players, is_public) VALUES ('PUB001', $1, 4, true) RETURNING id`, [U1]))).id
  await expectError(asUser(k, `INSERT INTO room_players (room_id, player_id) VALUES ($1, $2)`, [pub, k]), /minor_private_rooms_only/, 'minor joins public room')
  await asUser(U2, `INSERT INTO room_players (room_id, player_id) VALUES ($1, $2)`, [pub, U2])
  await expectError(asUser(k, `INSERT INTO multiplayer_rooms (code, host_id, max_players, is_public) VALUES ('PUB002', $1, 4, true)`, [k]), /minor_private_rooms_only/, 'minor creates public room')
  const priv = await one(asUser(k, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('PRV001', $1, 4) RETURNING id, is_public`, [k]))
  eq(priv.is_public, false, 'rooms are private by default')
  await asUser(k, `INSERT INTO room_players (room_id, player_id) VALUES ($1, $2)`, [priv.id, k])
  const adultRoom = (await one(asUser(U1, `INSERT INTO multiplayer_rooms (code, host_id, max_players) VALUES ('PRV002', $1, 4) RETURNING id`, [U1]))).id
  await asUser(k, `INSERT INTO room_players (room_id, player_id) VALUES ($1, $2)`, [adultRoom, k])
})

await check('delete_own_account still works and clears the new tables', async () => {
  const k = minorKid
  await asUser(k, `SELECT record_level_result('level_1', 1, 10)`)
  await asUser(k, `INSERT INTO library_progress (user_id, concept_id) VALUES ($1, 'sip')`, [k])
  await asUser(k, `SELECT start_match('practice', NULL, 2)`)
  await asUser(k, `SELECT delete_own_account()`)
  for (const t of [...NEW_TABLES, 'library_progress WHERE user_id', 'matches WHERE user_id', 'room_players WHERE player_id', 'multiplayer_rooms WHERE host_id']) {
    assert(!(await exists(`SELECT 1 FROM ${t} = $1`, [k])), `${t} cleared`)
  }
  await expectError(asAnon(`SELECT delete_own_account()`), /permission denied/, 'anon')
})

await db.close()
console.log(`\n${files.length} migrations applied, ${passed} checks passed, ${failures.length} failed`)
if (failures.length) process.exit(1)
