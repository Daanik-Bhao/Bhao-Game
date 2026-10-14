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

## Track N results

### Level rules (`src/lib/levelRules.ts`, hooks in `gameEngine.ts`)
Rules apply to the human learner only (bots play normal BHAO) and run only when `state.levelState.rule` is set
(campaign levels), so quick/ranked/multiplayer/tutorial games are unchanged. In a campaign only the human can end the
level by reaching the target (bots are rivals, not racers). Engine hooks: `createLevelState` / `withLevelExtras`
(init), `levelDecisionBlock` (preview + process), `applyLevelDecision` (after a decision), `applyLevelRoundStart`
(each new year, after market + inflation, before the life event; forced sales go into stats), `canWinByTarget`.
UI state lives in `state.levelState.{desire|streak|creep|family}` + `ruleEvents` (newest first, i18n key + params).

| Level | Rule (one sentence) | ★★ habit |
|---|---|---|
| L1 Brahmacharya (5L → 15L, 14 yrs, 1 easy bot) | **Desire Meter**: wants rise +20 every year and +10 each time you Save/Invest; a Spend at 50+ is a *planned treat* (meter → 0, no lifestyle creep); if the meter hits 100 you *splurge on impulse* next year (−15% net worth, lifestyle +1). | ≥1 planned treat and 0 impulse splurges |
| L2 Vidyarthi→Yuva (7L → 32L, 12 yrs, 2 medium) | **Saving Streak**: every Save/Invest year grows the streak, and each new year an Auto-SIP of streak × 2% of the starting corpus (max ×5) lands in your index fund; one Spend breaks it. | best streak ≥ 6 |
| L3 Aarambh Grihastha (10L → 55L, 14 yrs, 2 medium) | **Lifestyle Creep & slots**: salary (12% of corpus) arrives yearly with a 10% raise, but lifestyle eats 5% more of it each year (+12% per Spend, −10% per Save, floor 30%); only 3 different investments allowed. | lifestyle ≤ 60% of salary at the end |
| L4 Grihastha Dharma (15L → 65L, 16 yrs, 2 hard) | **Family goals & insurance**: home down payment (yr 4, 25% of corpus → becomes property) and kids' education (yr 7, 20%) are paid from *ready money* (cash, FD, debt fund), otherwise forced sales + a 20% rush cost on the shortfall; boss yr 9: parents' hospital bill (20% of net worth) — with health insurance equipped you pay a fifth. The learner's opening hand includes Health Insurance (+2 copies in the deck); goals are announced 2 years ahead. | every goal `met` (both from ready money, insured at the boss) |

**Stars** (`computeLevelStars(state, playerId)`): ★ = reach the target within the limit (and win); then +★ habit (table)
and +★ clean finish = no forced sales all game **and** report-card average ≥ B (A=4…D=1, avg ≥ 3). Habit/clean stars only
count once the target is reached. Criteria carry `labelKey` (+`params`) for i18n plus `label`/`labelHi` fallbacks.

**Progress**: `recordLevelResult(ownerKey, levelId, stars, netWorth)` keeps the best per level in localStorage (≥1★ also
marks completed) and pushes signed-in results to `record_level_result`; `syncCampaignProgress(userId)` merges this
device's user progress up and the server's best down (no-op without Supabase). Guest progress is no longer merged
silently — see "Guest progress merge" below. Unlock rule: the next level needs
≥1★ on the previous one (`isLevelUnlocked`). Migration `20261013200000_campaign_progress.sql`.

### Balance (throwaway simulation, not committed)
Method: full games through the real engine (`doBotTurn` with a decision override for the learner's seat, same
equip/attack/pass policy for everyone; seeded rng per game, 500 games per row, shipped levels and bots). Strategies:
**smart** = level-aware sensible play (shipped bot logic + L1 spends when desire ≥ 70, L3 saves when lifestyle ≥ 55% and
respects slots, L4 parks goal money in FD/debt or saves in the 3 years before a goal); **bot** = shipped balanced bot
(15% cash buffer, then invest; level-unaware); **save** / **spend** / **invest** = always that choice.

| Level | strategy | win | median final NW | median win year | ≥2★ | 3★ |
|---|---|---|---|---|---|---|
| L1 | smart | **71%** | ₹15.5L | 11 | 52% | 24% |
| L1 | bot (never spends) | 60% | ₹15.2L | 12 | 2% | 0% |
| L1 | always invest | 33% | ₹11.5L | 12 | 0% | 0% |
| L1 | always save | 0% | ₹1.6L | – | 0% | 0% |
| L1 | always spend | 0% | ₹0.3L | – | 0% | 0% |
| L2 | smart | **71%** | ₹33.0L | 11 | 71% | 48% |
| L2 | bot | 72% | ₹33.0L | 11 | 72% | 50% |
| L2 | always invest | 53% | ₹32.2L | 12 | 45% | 16% |
| L2 | always save | 0% | ₹20.7L | – | 0% | 0% |
| L2 | always spend | 0% | ₹1.0L | – | 0% | 0% |
| L3 | smart | **75%** | ₹56.9L | 13 | 74% | 59% |
| L3 | bot | 71% | ₹56.5L | 13 | 70% | 47% |
| L3 | always invest | 48% | ₹54.0L | 14 | 11% | 0% |
| L3 | always save | 0% | ₹23.6L | – | 0% | 0% |
| L3 | always spend | 0% | ₹0.0L | – | 0% | 0% |
| L4 | smart | **71%** | ₹67.2L | 14 | 16% | 8% |
| L4 | bot | 72% | ₹66.8L | 14 | 18% | 10% |
| L4 | always invest | 51% | ₹65.2L | 15 | 0% | 0% |
| L4 | always save | 0% | ₹21.2L | – | 0% | 0% |
| L4 | always spend | 0% | ₹4.8L | – | 0% | 0% |

Takeaways and tuning:
- The original limits (40–60 years) were winnable by everyone, incl. always-save. Limits are now 12–16 years and targets
  3–4.3× the starting corpus (L2 7L→32L, L3 10L→55L, L4 15L→65L), so a level lasts ~11–14 years.
- L1: the never-spending bot wins less (60%) and almost never earns ★★ — repressed wants become impulse splurges and
  forced sales; planned treats are the winning habit. Always-invest suffers the same (33%).
- L2: the shipped bot already pays itself first, so smart ≈ bot; one Spend costs the Auto-SIP and spenders never win.
  Always-save only reaches ~₹21L: saving without investing loses to inflation even with the Auto-SIP.
- L3: always-invest never reviews the budget, lifestyle creeps past 100% and eats the salary (48%, ★★ 11%).
- L4: a first version (cash-only goals) rewarded ignoring the goals because selling an index fund costs only 1%. Goals now
  count FD/debt funds as ready money and charge a 20% rush cost on any shortfall; planning then wins as often as ignoring
  and earns the goal star. ★★ stays hard (~16–25%) because it needs both goals met *and* insurance at year 9; 3★ is rare on
  L4 (hard bots attack, ~3.6 forced sales per game).

## Guest progress merge & Library sync (follow-up)

### Guest → account merge (`src/lib/guestMerge.ts`, `src/components/GuestMergePrompt.tsx`)
When a signed-in account opens the app on a device whose guest progress (owner key `guest`: campaign results, legacy
completions, Gyaan Library unlocks) would add something to the account, a D.6 modal offers once: *Add to my account* /
*No thanks*. The account's server progress is synced first, so "would add something" means "beats the account", not just
this device's copy. The offer waits while a match/tutorial route is open.

**Trust choice.** Campaign stars are cosmetic, and `record_level_result` already trusts a signed-in client's own result.
Guest results are different: the server never saw them, and a merge is a bulk claim. So the merge does **not** go through
`record_level_result`; it uses `import_guest_campaign_progress(p_levels jsonb)` (migration
`20261014000000_guest_campaign_import.sql`), which:
- runs **once per account** (`campaign_guest_imports` row = lock; a second call changes nothing, `already_imported: true`);
- accepts ≤ 50 entries, valid `level_N` ids only, clamps stars to 0..3 and net worth to the same cap, ignores 0★ entries;
- enforces the **unlock chain** (level N only if level N-1 already has ≥1★ on the account or earlier in the same import),
  so a forged payload can't jump to late levels;
- keeps the best per level (never lowers progress), uses server `now()` for completion, and flags raised rows
  `campaign_progress.imported = true`. A later signed-in result with ≥ that many stars clears the flag
  (`record_level_result` updated). **Anything that ever gives stars value (rewards, leaderboards) must ignore `imported`
  stars** — and should first move `record_level_result` behind `start_match` like the other modes.
- The client stores exactly the progress the server returns (no local-only stars).

Library unlocks are cosmetic and own-row writable, so they are simply unioned locally into the account (and pushed).

**Never twice / no nagging.** Per account: `bhao_guest_merge:<userId>` = `merged` | `declined` (dismissing the dialog =
decline). Per device: `bhao_guest_merge_claimed` = the account that took this device's guest progress; no other account
is offered it. Server: once per account, checked before showing (`campaign_guest_imports`) so an account that already
imported on another device isn't asked. A failed merge (offline, server error) remembers nothing and shows a toast; it is
offered again on the next app start. Guest data itself stays on the device. `syncCampaignProgress` no longer includes
guest progress.

### Library server copy (`src/lib/libraryProgress.ts`)
Migration `20261014000100_library_progress.sql`: `library_progress(user_id, concept_id, seen, unlocked_at, updated_at)`,
own-row RLS (SELECT/INSERT/UPDATE, no DELETE), a BEFORE UPDATE trigger that keeps rows monotonic (`seen` only turns true,
earliest `unlocked_at`), and a 200-concepts-per-player cap. Client: `syncLibraryProgress(userId)` on sign-in (from
`AuthProvider`, lazily imported) pulls, unions with localStorage and pushes back what the server lacks; every
`unlockConcepts` / `markSeen` for a `user:` owner schedules a debounced (1.5 s) fire-and-forget upsert of the whole
library. Everything is skipped silently without Supabase or when offline; local data is never replaced, only unioned.
