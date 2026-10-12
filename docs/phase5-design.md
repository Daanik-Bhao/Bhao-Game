# Phase 5 — Trust, multiplayer authority, progression (BHAO)

Status before Phase 5 (from the audit): every coin/RP change except the stock RPCs is decided by the client;
`save-game-result` trusts `won/placement/finalWealth` and can be replayed; multiplayer clients compute and push the
whole game state (any member can rewrite it, everyone can read every hand); client code uses `daank_coins` but the
column is `daanik_coins`; `claim_daily_reward` and profile columns `last_login_date`, `login_streak`,
`placement_games_done` don't exist; profile/leaderboard UPDATE policies were dropped so several client writes silently fail.

Supabase credentials are not available while building this phase: migrations and edge functions are written and
checked locally (SQL applied to an embedded Postgres via `@electric-sql/pglite` with a stub `auth` schema; pure
TypeScript logic unit-tested with vitest), then deployed by the owner.

## Track L — Economy & results (owner: economy agent)
Migrations `supabase/migrations/20261013000000_*.sql` … `20261013099999_*`.
- Rename client usage to `daanik_coins` everywhere (types + code). Fix `buy_stock`/`sell_stock` to use the real column
  and a **server-side price** `stock_price(ticker, at timestamptz)` (port `src/lib/market.ts` formula to SQL); drop the
  client price parameters. Market UI stays hidden until Phase "later".
- Profiles: add `last_login_date date`, `login_streak int default 0`, `placement_games_done int default 0`.
  A BEFORE INSERT trigger forces server defaults for `rank_points`, `daanik_coins`, `total_xp`, games/streak counters
  (a user can only choose username/avatar). Profile edits only through `update_my_profile` (client switched to it).
- `claim_daily_reward()` RPC: server date (Asia/Kolkata), streak logic, reward table, returns `{reward, streak, already_claimed}`.
- `spend_coins(p_amount int, p_reason text)` RPC for practice/campaign extras (e.g. extra card, 25 coins). **Ranked has no
  coin-bought advantages** (remove buy-extra-card in ranked UI).
- **Matches & results**: table `matches(id uuid pk, user_id, mode text check in ('ranked','practice','campaign','multiplayer'),
  room_id uuid null, level_id text null, started_at, finished_at, result jsonb)`; RLS: owner can SELECT only.
  - `start_match(p_mode, p_level_id)` RPC → match id (single-player). Max 1 open match per user per mode (older open ones expire).
  - `save-game-result` edge function now requires `matchId`; rejects unknown/finished/foreign matches; rejects results
    sooner than a plausible minimum duration (e.g. 90 s) ; daily cap on RP-earning ranked results (e.g. 10/day); forfeits
    are always a loss with last placement. It then calls `apply_match_result`.
  - **Contract** `apply_match_result(p_match_id uuid, p_user_id uuid, p_mode text, p_won bool, p_placement int,
    p_total_players int, p_final_wealth bigint, p_stats jsonb) returns jsonb` — SECURITY DEFINER, EXECUTE granted to
    `service_role` only, idempotent per (match, user) via `match_results` unique key. Updates profile (RP via one SQL RP
    table that matches `calculateRPChange` — single source: the client imports the same table from
    `src/data/rankRules.ts`), XP, leaderboard, contracts progress + rewards. Practice/campaign: XP + capped coins, **no RP**.
- RLS fixes: `room_players` INSERT only into rooms with status `waiting` and fewer than `max_players` seats;
  `protect_room_fields` also blocks changing `host_id`, `code`, `max_players`; `player_contracts` INSERT can't set
  progress/completed; leaderboard read for anon stays.
- `scripts/check-migrations.mjs` (+ `npm run check:migrations`, pglite devDependency): applies all migrations to an
  in-memory Postgres with a stub `auth` schema (`auth.users`, `auth.uid()` reading a session setting) and runs SQL
  assertions for the new RPCs/policies. Added to CI.

## Track M — Server-authoritative multiplayer (owner: multiplayer agent)
Migrations `20261013100000_*` … `20261013199999_*`.
- New pure module `src/lib/multiplayerAuthority.ts` (no browser APIs):
  `applyPlayerAction(full: GameState, actorId: string, action: MpAction, now: number) → { state, error?, events }`
  where `MpAction = {type:'decision', cardId, choice} | {type:'action', cardId, targetIndex?} | {type:'equip', cardId}
  | {type:'pass', cardId} | {type:'tick'} | {type:'forfeit'} | {type:'emote', emoji}`. Validates turn ownership,
  card in hand, phase; `tick` applies server-time turn timeout and heartbeat-based disconnect forfeits.
  `redactForPlayer(full, viewerId)` / `publicState(full)` hide other hands and deck order. Fully unit-tested.
- Storage: full state in `multiplayer_room_state(room_id pk, state jsonb, version int, updated_at)` — service role only.
  Public redacted state stays in `multiplayer_rooms.game_state` (+ `state_version`); each player's hand in
  `room_player_hands(room_id, player_id, hand jsonb)` RLS: own row SELECT only. Members can no longer UPDATE
  `game_state`; only the function writes it. `room_players.last_seen timestamptz` + `heartbeat(p_room_id)` RPC.
- Edge function `supabase/functions/game-action`: verifies JWT + membership, loads full state, runs
  `applyPlayerAction` with server RNG, optimistic concurrency on `version`, writes private/public/hands, and on
  game over calls `apply_match_result` for every human (match id = room id) and sets room `completed`/`winner_id`.
  `start` action (host only) builds the initial state server-side.
- Engine code is shared with the function by bundling: `npm run build:functions` (esbuild, already a transitive dep —
  use the `esbuild` API from node_modules) bundles `src/lib/multiplayerAuthority.ts` + deps into
  `supabase/functions/_shared/engine.js` (committed, CI checks it's up to date).
- Client: `MultiplayerGame.tsx`/`Lobby.tsx`/`multiplayerEngine.ts` send intents via `functions.invoke('game-action')`,
  render from public state + own hand (realtime `postgres_changes` on both rows), send heartbeats, no local engine
  mutation except optimistic UI hints. Remove client coin writes and buy-extra-card from multiplayer.

## Track N — Campaign & progression (owner: campaign agent)
Migrations `20261013200000_*`.
- Signature mechanic per level, implemented as engine **level rules** (optional hooks in the engine driven by
  `state.levelConfig.id`), consistent with the Phase 3 economy, inspired by `docs/level.md` and `docs/corrections.md`:
  L1 Desire Meter, L2 Saving Streak, L3 Lifestyle Creep / investment slots, L4 Grihastha (family goals & insurance).
  Each level must be winnable by sensible play (simulate) and teach its one idea.
- Stars: `computeLevelStars(state, playerId) → { stars: 0..3, criteria: {id, met, label, labelHi}[] }` (1★ reach the target,
  2★ + level-specific habit, 3★ + no forced sales / report-card average ≥ B — final rules by the agent).
- Progress: `campaign_progress(user_id, level_id, stars, best_net_worth, completed_at)` own-row RLS; RPC
  `record_level_result(level_id, stars, net_worth)` keeps best; guests keep localStorage (`campaignProgress.ts`),
  and on sign-in local progress is merged up. No coins from campaign stars (cosmetic), so client-reported is acceptable.
- `Campaign.tsx` shows stars, mechanic intro per level, unlocks by stars; a `LevelIntro` and `LevelStars` component.
  Game.tsx integration is done by the integrator (me) after merge.
