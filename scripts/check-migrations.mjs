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
  await asUser(U1, `INSERT INTO profiles (id, username, daanik_coins, rank_points, total_xp, games_won, login_streak)
                    VALUES ($1, 'alice', 999999, 5000, 9999, 77, 30)`, [U1])
  const p = await one(su(`SELECT daanik_coins, rank_points, total_xp, games_won, login_streak FROM profiles WHERE id = $1`, [U1]))
  eq(p.daanik_coins, 100, 'coins'); eq(p.rank_points, 0, 'rp'); eq(p.total_xp, 0, 'xp'); eq(p.games_won, 0, 'games_won'); eq(p.login_streak, 0, 'login_streak')
  await asUser(U2, `INSERT INTO profiles (id, username) VALUES ($1, 'bob')`, [U2])
  await asUser(U3, `INSERT INTO profiles (id, username) VALUES ($1, 'carol')`, [U3])
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

await db.close()
console.log(`\n${files.length} migrations applied, ${passed} checks passed, ${failures.length} failed`)
if (failures.length) process.exit(1)
