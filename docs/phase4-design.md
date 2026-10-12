# Phase 4 — Learning (BHAO)

Goal: after every game the player knows *what they did*, *what it would mean in real life*, and *one or two ideas to remember*.

Contract files (already in main): `src/types/learning.ts` (ConceptId, Concept, PlayerGameStats, ReportCard),
`src/lib/learning.ts` (`buildReportCard(state, playerId)` — stub), `src/data/concepts.ts` (catalog — stub),
`PlayerState.stats?: PlayerGameStats`.

## Pieces
1. **Stats** — the engine records `PlayerGameStats` for every player during play (optional-safe for old states).
2. **Concept triggers** — the engine appends to `stats.conceptsTriggered` when a player meets an idea, e.g.
   inflation hit → `inflation`; holding doubles or 3+ rounds of growth → `compounding`; forced sale → `emergency_fund` + `liquidity`;
   invest in index → `index_funds`/`sip`; 3+ asset classes held → `diversification`; scam lure or scam holding → `scams`;
   crypto crash → `crypto_risk`; lifestyleLevel ≥ 2 → `lifestyle_creep`; save streak 3 → `pay_yourself_first`;
   medical event (blocked or not) → `health_insurance`; fraud attack → `cyber_safety`; property bought/sold → `real_estate`;
   gold bought → `gold`; market crash while holding → `market_patience`; holding FD/cash while inflation > FD real return → `fd_vs_inflation`;
   card names/categories for tax, debt, credit cards → `tax_saving`, `credit_card_debt`, `good_vs_bad_debt`, `term_insurance`.
3. **Report card** — `buildReportCard`: persona title, headline, 5 grades (saving, investing, risk, emergency, protection)
   with one-line reasons, a 10-year real-life projection (monthly ₹5,000 at the player's own asset mix vs FD vs index SIP),
   max 3 lessons tied to concepts, and the concepts unlocked. English + Hindi strings.
4. **Gyaan Library** — `/library` page: every concept as a tile (locked/unlocked), detail view with explanation, ₹ example,
   action tip. Unlocked concepts persist per player (localStorage like campaign progress, TODO server).
5. **New tutorial** — a guided first match on the real engine (scripted deck + seeded rng), coach marks for: cash vs investments,
   save/spend/invest preview, a year passing (inflation + market), a life event and the emergency-fund lesson, equip a defense.
   Opening hook: "₹150 chai a day = ₹4,500/month → ~₹10 lakh in 10 years at 12%".
6. **i18n** — after the above land: Hindi + Hinglish for the new UI strings.
