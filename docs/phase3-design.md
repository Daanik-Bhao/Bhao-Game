# Phase 3 — Gameplay redesign (BHAO)

Goal: real choices every turn, and mechanics that teach the *right* money lessons.
Shared types: `src/types/game.ts` (AssetClass, EventCategory, Holding, new optional fields).
Asset table + inflation constants: `src/data/assets.ts`.

## 1. Money model
- Each player has **cash** and **holdings** (investments). `wealth` = net worth = cash + Σ holding.value.
  The engine keeps `wealth` in sync after every change, so existing UI keeps working.
- New fields are optional for backward compatibility (tutorial, saved multiplayer state):
  missing `cash` ⇒ treat as `wealth`, missing `holdings` ⇒ `[]`.
- **One round = one year** = every active player has had one turn. `state.round` starts at 1.

## 2. Start of each round (when the turn wraps to the first active player)
1. **Market tick** — every holding of every player moves:
   `crash (crashChance) ? -crashPct : meanPct ± random(swingPct)`. One shared roll per asset class
   per round (all players' index funds move together). Store in `state.lastMarketTick`.
   Holdings that hit ≤ 1% of principal are removed (log it).
2. **Inflation** — every player's cash loses `BASE_INFLATION_PCT + lifestyleLevel × LIFESTYLE_INFLATION_STEP_PCT` %.
   Log e.g. "💸 Inflation ate ₹12,000 of Priya's cash".
3. **Life event** — 50% chance: draw from `state.eventDeck` (cards with `lifeEvent: true`, removed from
   the normal draw deck at init) and apply to one random active player (`target: 'self'`-like),
   or to all players if its effect target is `all`/`others`. A few built-in positive/market events
   (Diwali bonus, bull run, market crash on equity holdings, salary hike) live in `src/data/lifeEvents.ts`.
   Defenses apply. Store in `state.lastEvent`.

## 3. A turn
1. **Draw**: refill hand up to `HAND_SIZE = 5`. Unplayed cards **stay** in hand (no more discard-all).
2. **Equip**: the player may equip **one** defense card per turn for free (doesn't end the turn). Max 3 active.
3. **Play exactly one** decision or action card, **or Pass** (discard one chosen card). Then the turn ends.

## 4. Decisions (all % are of NET WORTH unless stated)
- **Save**: cash += netWorth × value% × streakBonus. Streak bonus +5% per consecutive save, **capped at 3** (×1.15).
- **Spend**: cash −= netWorth × |value|%; `lifestyleLevel` +1 (cap `MAX_LIFESTYLE_LEVEL`); draw 1 free card.
  Spend no longer resets anything and never boosts investing.
- **Invest**: moves money from cash into a new Holding. Asset = `option.asset ?? inferAsset(option.investRisk)`.
  Amount = cash × (common 25% | rare 35% | epic/legendary 50%). Not allowed if cash < ₹1,000.
  No instant gain: it grows (or crashes) at each market tick. The old `investRisk`/`failEffect` are ignored
  for invest; risk now comes from the asset class.
- Removed: greed index / market correction, lifestyle-tier invest multiplier, spend greed reset.
- Season boost (if active) multiplies `meanPct` in the market tick instead.

## 5. Losses and the emergency fund lesson
- Any loss is taken from **cash**. If cash is not enough, holdings are **sold automatically** to cover it,
  most liquid first (lowest `exitPenaltyPct`), paying the exit penalty. Log:
  "Had to sell Property at a 15% penalty — an emergency fund would have avoided this."
- If everything is gone, net worth floors at 0. Bankruptcy Shield (`wealthFloor`) still applies to net worth.

## 6. Attacks and defenses
- Rival attack cards (action, not lifeEvent): % of the target's net worth, paid via §5.
  Cards with `category: 'market'` instead cut the target's market holdings (index/equity/smallcap/crypto) by the %.
- A defense blocks an incoming card if its legacy `effect.blocks` names match **or** its
  `blocksCategories` includes the incoming card's `category`.

## 7. Winning
- Net worth ≥ goal wins immediately.
- Quick game: 20 minutes **or** 20 rounds, then highest net worth wins.
- Campaign: you must reach the level's target corpus within its turn limit; "most wealth" is no longer a level win.

## 8. Bots
- Keep a cash buffer of ~15% of net worth (they "know" about emergency funds) — save when below it.
- Invest when cash is comfortably above the buffer; prefer index/equity/debt; avoid scam always on hard,
  ~50% of the time fall for it on easy (so players can see the lesson happen to others).
- Attack the leader with targeted actions; equip defenses for free when they have them.

## 9. Teaching hooks (UI)
- After every decision, the outcome popup shows the option's `mentorInsight`.
- Each round shows "Year N": market moves per asset, inflation hit, life event.
- Decision sheet shows for invest: asset emoji/name, risk badge, avg yearly return, amount moved.
