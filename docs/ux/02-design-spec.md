# BHAO Design Spec v1 (Agent 2 → Agent 3 builds, Agent 4 verifies)

Date: 2026-10-13 · Author: Agent 2 (Designer / decision-maker) · Input: `docs/ux/01-research.md`
Status: **FINAL for this build cycle.** Where this spec and the research disagree, this spec wins. Where this spec is silent, follow the tokens and the closest mockup; do not invent new colours, sizes or fonts.

Visual targets (open the HTML in Chrome, or look at the PNGs):

| Mockup | HTML | PNG (viewport) |
|---|---|---|
| Style guide | `mockups/styleguide.html` | `mockups/styleguide.png` (1366 wide, full page) |
| Landing | `mockups/landing.html` | `landing-phone.png`, `landing-phone-full.png` (390×844), `landing-desktop.png` (1366×768) |
| Home (guest + signed-in) | `mockups/home.html` | `home-phone.png` (390×844), `home-desktop.png` (1366×768) |
| Campaign map | `mockups/campaign.html` | `campaign-phone.png` (390×844) |
| Board, phone portrait | `mockups/board-phone.html?state=play / draw / sheet / outcome` (`&lang=hi`) | `board-phone-play.png`, `board-phone-sheet.png`, `board-phone-outcome.png`, `board-phone-hi.png` (390×844), `board-phone-360.png` (360×740) |
| Board, phone landscape | `mockups/board-landscape.html?state=play / sheet` | `board-landscape-play.png`, `board-landscape-sheet.png` (844×390) |
| Board, desktop | `mockups/board-desktop.html` | `board-desktop.png` (1366×768) |
| Result + report card | `mockups/result.html` | `result-phone.png`, `result-phone-full.png` (390×844) |

Shared mockup sources that are **normative** (Agent 3 ports them): `mockups/tokens.css` (all tokens + base components + @font-face), `mockups/mock.css` (board/sheet/tabbar layout reference), `mockups/gullu.js` (mascot drawing, 5 moods), `mockups/fonts/*.woff2` (the exact font files to ship).

---

## A. Decision log

### A.1 Direction and fonts
| # | Decision | Why |
|---|---|---|
| D1 | **Direction 1 "Chai & Chips"**: light warm-paper menus (`#FFF8EC`), deep teal "table" only inside a match (`#0E4D3F`), haldi-yellow primary (`#FFC530`, dark text). | Readable for long Hindi text, Indian without clichés, keeps brand green, clearly not a casino (no felt texture, no gold coins, no neon). |
| D2 | **Fonts: Option A — Baloo 2 (display, buttons, numbers, `tnum`) + Mukta (body/UI)**, self-hosted woff2. | Most game-like personality with sober body text; both Ek Type, matched Latin + Devanagari; both have tabular figures. Card-name width risk is solved by the new card layout (70 px cards, 2–3 line names, 12 px fallback for long words), verified in mockups. |
| D3 | **Cards are cream "paper" objects** drawn in CSS (no raster frames). Type = coloured band + lucide icon (+ label on full cards); tier = small corner gem. Art = per-category lucide icon (icon-led), no per-card illustrations this cycle. | Fixes "same purple wallet on every card", removes baked English, 3 MB of raster, works offline. |
| D4 | **Mascot: "Gullu", a clay gullak (piggy-bank pot)**, inline SVG, 5 moods (happy, cheer, think, worried, wow). Used on home greeting, coach marks, outcome banner, result, empty states. MentorDialog uses Gullu instead of the avatar image. | Very Indian, about saving, non-gambling, emotional range. Drawing: `mockups/gullu.js`. |
| D5 | Sheets, modals, banners and toasts that appear on the dark table use the **light paper token scope** (`.paper`). Cards are also light. Only the table background, HUD panels, top bar and rival chips are dark. | Long decision text gets 6–16:1 contrast; continuity with menus. |
| D6 | Result screen is **light** (menu mode). | Celebration + long report text readability. |

### A.2 Answers to the 12 open questions (01-research §9)
1. **Light menus + dark table confirmed.** Result screen = light.
2. **Option A (Baloo 2 + Mukta).** Hand cards are 70×104 on phones (68×100 at 360 px); names wrap to max 3 lines; words of ≥ 9 characters switch the name to 12 px. Content: any card whose `shortName` still needs > 3 lines at 12 px gets a shorter `shortName` (P2 content task, list them in a test).
3. **Icon-led art.** Replace `public/avatars/{green,red,blue}*.webp`, `exit button.webp`, `gamelogbutton.webp`, `level bar.webp`, `coins bag.webp`, `image copy.webp` (board bg) usage with CSS/SVG. Files may stay on disk this cycle but must not be referenced by any rendered screen (Agent 4 checks network: no request to `/avatars/*.webp|png` except player avatar images, if any remain).
4. **Drop the "LEVEL - 1" crest/dome.** Slim top bar (§E.12). Mode/level name is text inside the pause menu and (desktop) top bar.
5. **Mascot = Gullu the gullak** (object, not a person).
6. **Coins: keep "Daanik Coins" only for signed-in users**, always written in full ("Daanik Coins", never "DC"), with a flat haldi coin icon showing a "D" — never `$`, never `₹`, never coin bags/piles. Guests never see coins (remove from Practice setup and guest home). Signed-in setup shows one line "Win to earn 100 Daanik Coins" + info button → "Daanik Coins buy an extra card in practice games. They have no cash value and cannot be bought." "Entry Reward" wording is deleted.
7. **Copy tone approved**: no "Attack/Dominate/Better luck/Entry reward/jackpot/luck". Attack *cards* keep the game term "Attack" as a card type (it is a mechanic, not a slogan). See §E copy tables.
8. **Bottom tab bar on phones (< 1024 px) for menu screens**: Home · Campaign · Library · Profile. Desktop (≥ 1024): the same 3 destinations as pills in the app bar + avatar menu for Profile. Signed-in Dashboard's Leaderboard and Contracts become cards on Home that open full screens (Dashboard internal tab state `leaderboard` / `contracts` with a back button). Tab bar is hidden on: Landing, Auth, Legal, Tutorial, any match, Result, Lobby waiting room.
9. **Match clock hidden** until the last 2:00; then an amber chip "1:58 left" appears in the top bar next to the year; under 0:30 it turns attack-red. The full clock is always visible inside the pause menu. Only the **turn timer ring** is permanently visible.
10. **Token naming is semantic now** (`--bg`, `--surface`, `--text`, …) and remapped per scope (`.surface-table`, `.paper`). A menu dark mode is **later (P2)**: it will be a third scope; no work now.
11. **Desktop is first-class for the board and Landing/Home** (good layouts per mockups); other menu screens are "works well": single centred column max 560 px (lists) / 720 px (reading) on desktop.
12. **Unscreenshottable screens** (Dashboard signed-in, Lobby, MultiplayerGame, RoomComms, DailyReward): Agent 3 adds a **dev-only gallery route `/__ux`** (registered only when `import.meta.env.DEV`; lazy import inside that branch so it is tree-shaken from production) that renders, with mock props: Dashboard HomeTab, LeaderboardTab, ProfileTab, Lobby menu + WaitingRoom, `GameBoard` with `isMultiplayer` + `CommsControls` + `ChatPanel` + report sheet, DailyRewardModal, ForfeitModal, DeleteAccountButton dialog, all button/chip/card states. Agent 4 verifies those there. If extracting props for a screen is not feasible without refactoring logic, render the presentational sub-component only and note it.

### A.3 What we will NOT do (this cycle)
- No per-card illustrations, no holo/foil animation (legendary gets a static gold border only).
- No menu dark mode, no new game mechanics, no sound redesign (only hook existing sounds to new feedback tiers).
- No `backdrop-filter`/blur anywhere in a match; no animated background "laser lines"/swirls; no confetti on losses; no screen shake (gentle 2-cycle wobble max).
- No spin wheels, loot boxes, "jackpot", "luck", "entry fee/reward", `$` symbols, casino green felt, gold coin piles, crowns/VIP.
- No Google Fonts or any font CDN; no other font families.
- Not rewriting game logic/engine; UI only (plus the state-preservation fix §F.5).

---

## B. Design tokens (exact)

Implementation: create `src/styles/tokens.css` (copy the `:root`, `.surface-table`, `html.lang-hi`, base, button/chip/panel/progress/gcard rules from `docs/ux/mockups/tokens.css`) and `src/styles/fonts.css` (the @font-face block, paths changed to the bundled files, §C). Import both at the top of `src/main.tsx` before `index.css`. Add `.paper` scope from `mock.css`.

### B.1 Colour — raw palette
| Token | Hex | Use |
|---|---|---|
| `--cream-50` | `#FFFCF6` | highlight |
| `--cream-100` | `#FFF8EC` | **paper (page bg), card face** |
| `--cream-200` | `#FCEFD9` | sunken areas, skeleton |
| `--cream-300` | `#F3E4C8` | skeleton shimmer |
| `--sand-400` | `#EADFCB` | hairlines |
| `--sand-500` | `#D6C7AC` | strong lines, outline-button edge |
| `--ink-900` | `#1E1A14` | text |
| `--ink-700` | `#5E5548` | muted text |
| `--ink-500` | `#7A6F5F` | subtle text (≥ 4.5 on paper) |
| `--ink-300` | `#9A8F7E` | disabled text only (exempt from contrast) |
| `--teal-950` | `#062A22` | brand press-edge, HUD sunken chips |
| `--teal-900` | `#0A3329` | table panels |
| `--teal-850` | `#0A3A30` | table vignette edge |
| `--teal-800` | `#0E4D3F` | **brand, table**, secondary button |
| `--teal-700` | `#12463A` | raised table surface |
| `--teal-600` | `#1B6352` | gradient highlight |
| `--teal-100` | `#DCEFE8` | brand-soft |
| `--haldi-300` | `#FFD45E` | primary hover, link on table |
| `--haldi-400` | `#FFC530` | **primary CTA**, current-turn highlight |
| `--haldi-600` | `#C98A00` | primary press-edge |
| `--haldi-ink` | `#2A1B00` | text on primary |

### B.2 Semantic colours (same meaning everywhere)
| Meaning | base (fills, bars, icons) | strong (white-text fills; text on light) | soft (tint bg on light) | on-dark (text/icons on table) |
|---|---|---|---|---|
| Spend | `#E2572B` | `#B83F18` | `#FDE7DE` | `#FF9B7A` |
| Save | `#1E9E5A` | `#157A45` | `#E3F4EA` | `#5EE08F` |
| Invest | `#3D5AFE` | `#2E47D1` | `#E6EBFF` | `#8FA6FF` |
| Defence / Shield | `#11A3A3` | `#0A6E6E` | `#DDF3F3` | `#4FD1C5` |
| Attack / Danger | `#D93636` | `#B42318` | `#FDE4E1` | `#FF8A80` |
| Risk / Warning | `#F59E0B` | `#8A5A00` (text) | `#FFF1CC` | `#FFC530` |
| Life event | `#46607A` | `#46607A` | `#E4EAF1` | `#A8B9CC` |
| Decision (card type) | `#F2A900` (band, ink text/icon) | – | `#FFF1CC` | – |
| Gain text | – | `#157A3E` | – | `#5EE08F` |
| Loss text | – | `#B42318` | – | `#FF8A80` |

Aliases: `--success = save-strong`, `--danger = attack-strong`, `--warning = risk-strong`, `--info = invest-strong`, `--focus-ring = #3D5AFE` (light) / `#FFD45E` (table).
Rules: gain/loss always paired with a sign (`+`/`−` U+2212) and an up/down icon; never colour alone. Spend/Save/Invest always paired with icon (wallet / piggy-bank / chart-line) + label.

Tier gems (graphics only, never text): common `#7B8594`, rare `#2F80ED`, epic `#8B5CF6`, legendary gradient `#F5C542 → #B8860B`. Gem = 10 px (hand) / 12 px (full) rotated square, 1.5 px outline `rgba(30,26,20,.55)` (hand) / white 85% (on band). Legendary card: border `#F5C542` + 1 px outer `#B8860B`.

### B.3 Surface scopes
| Scope | `--bg` | `--surface` | `--surface-raised` | `--line` | `--text` | `--text-muted` | `--link` |
|---|---|---|---|---|---|---|---|
| default (menus) | `#FFF8EC` | `#FFFFFF` | `#FFFFFF` | `#EADFCB` | `#1E1A14` | `#5E5548` | `#0E4D3F` |
| `.surface-table` (match root) | `#0E4D3F` (+ radial `#0F5545`→`#0E4D3F`→`#0A3A30`) | `#0A3329` | `#12463A` | `#2A5E51` | `#F6F1E7` | `#B9CFC6` | `#FFD45E` |
| `.paper` (sheets/modals/banners on table) | same as default | | | | | | |

### B.4 Contrast (computed, WCAG 2.1)
| Pair | Ratio | Pass |
|---|---|---|
| ink `#1E1A14` on paper `#FFF8EC` / white / paper-2 | 16.4 / 17.3 / 15.2 | AAA |
| muted `#5E5548` on paper / paper-2 / white | 6.9 / 6.4 / 7.3 | AA |
| subtle `#7A6F5F` on paper | 4.66 | AA |
| brand/link `#0E4D3F` on paper | 9.2 | AA |
| haldi-ink `#2A1B00` on `#FFC530` | 10.6 | AA |
| white on brand `#0E4D3F` | 9.8 | AA |
| white on spend-strong / save-strong / invest-strong / defence-strong / attack-strong / event | 5.6 / 5.4 / 7.2 / 6.1 / 6.6 / 6.5 | AA |
| ink on decision band `#F2A900` | 8.6 | AA |
| spend-strong on spend-soft · save-strong on save-soft · invest-strong on invest-soft · defence-strong on defence-soft · attack-strong on attack-soft · risk-strong on risk-soft | 4.69 · 4.71 · 6.0 · 5.2 · 5.4 · 5.3 | AA |
| gain `#157A3E` / loss `#B42318` on paper | 5.1 / 6.2 | AA |
| table text `#F6F1E7` on `#0E4D3F` / `#0A3329` / `#12463A` | 8.7 / 12.3 / 9.5 | AA |
| table muted `#B9CFC6` on `#0E4D3F` / `#0A3329` / `#12463A` | 6.0 / 8.4 / 6.5 | AA |
| on-dark gain/loss/risk/spend/invest/defence on `#0A3329` | 8.3 / 6.1 / 8.8 / 6.7 / 6.0 / 7.4 | AA |
| tier gems vs paper (non-text ≥ 3:1): common/rare/epic/legendary-edge | 3.5 / 3.7 / 4.0 / 3.1 | AA (graphics) |
Forbidden: white text on base spend/save/defence (3.1–3.7), `#E0E0F0` anywhere on light, grey-on-green outcome text.

### B.5 Typography
Families:
```
--font-display: 'Baloo 2', 'Noto Sans Devanagari', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-body:    'Mukta',   'Noto Sans Devanagari', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-num:     var(--font-display);  /* always with font-variant-numeric: tabular-nums lining-nums */
```
Emoji are only allowed in quick-chat/emotes (system emoji font); never as UI icons (replace 🎓 ⛰ 🤖 📚 🎯 🪙 with lucide).

Scale (mobile < 1024 → desktop ≥ 1024). `rem` assumes root 16 px (the `html {font-size:14px}` mobile rule is deleted).
| Role | Token | Mobile | Desktop | Family / weight | Line-height (en) | Hindi (`html.lang-hi`) |
|---|---|---|---|---|---|---|
| Display XL (hero) | `--fs-display-xl` | 40 px | 64 px | Baloo 800 | 1.05 / 1.02 | lh 1.25 |
| Display L (page title) | `--fs-display-l` | 30 | 40 | Baloo 800 | 1.1 | 1.3 |
| Title (section, sheet title) | `--fs-title` | 22 | 26 | Baloo 700 | 1.15 | 1.3 |
| Subtitle (card/tile title) | `--fs-subtitle` | 18 | 20 | Baloo 700 | 1.2 | 1.35 |
| Body L (lede) | `--fs-body-l` | 17 | 18 | Mukta 400 | 1.5 | 1.65 |
| Body (reading) | `--fs-body` | 16 | 16 | Mukta 400 | 1.5 | 1.65 |
| UI (labels, buttons-secondary text, hints) | `--fs-ui` | 14 | 14 | Mukta 400/600 | 1.4 | **15 px**, 1.55 |
| Caption / meta | `--fs-caption` | 12 | 12 | Mukta 600, caps + 0.06em (Latin only) | 1.35 | **13 px**, 1.5, no caps, ls 0 |
| Button L / M / S | `--fs-btn-*` | 18 / 16 / 14 | same | Baloo 700 | 1 | 1.2 |
| Number XL (net worth hero) | `--fs-num-xl` | 36 | 44 | Baloo 800 tnum | 1.05 | 1.15 |
| Number L | `--fs-num-l` | 24 | 28 | Baloo 800 tnum | 1.05 | 1.15 |
| Number M | `--fs-num-m` | 18 | 18 | Baloo 700 tnum | 1.05 | 1.15 |
| Number S (tables) | `--fs-num-s` | 14 | 14 | Mukta 600 tnum | 1.4 | 1.55 |
| Hand-card name | – | 13 (12 if a word ≥ 9 chars) | full card 18 | Baloo 700 | 1.05 | 1.2 |
| Hand-card value | – | 16 | full card 22 | Baloo 800 tnum | 1 | 1.1 |

Hard minimums: no rendered text < 12 px anywhere (Agent 4 scans computed `font-size`); reading text ≥ 16 px; Baloo never below 12 px and never letter-spaced; Devanagari never uppercase/letter-spaced (via tokens, not `!important`). Hinglish uses en metrics.
Money format: Indian grouping via `Intl.NumberFormat('en-IN')`: `₹12,40,500`; compact `₹14.1 L` / `₹1.2 Cr` / `₹35K` (one decimal, thin no-break space U+202F before L/Cr optional), Hindi compact `₹14.1 लाख` / `₹1.2 करोड़`. Negative uses U+2212 `−`. All ₹ numbers use `.num` (tabular). One formatter `formatMoney(value, {compact, signed, lang})` in `src/lib/format.ts` replaces ad-hoc `formatWealth` call sites in UI (keep the old export as a wrapper).

### B.6 Spacing, radii, elevation, z-index
- Spacing (4-pt): `--sp-1 2 · --sp-2 4 · --sp-3 8 · --sp-4 12 · --sp-5 16 · --sp-6 20 · --sp-7 24 · --sp-8 32 · --sp-9 40 · --sp-10 48 · --sp-11 64`. Page gutter `--gutter` 16 px mobile / 32 px desktop. Gap between tappables ≥ 8 px.
- Radii: `--r-xs 6` (gems, tiny), `--r-sm 10` (inputs, small buttons), `--r-md 14` (buttons, tiles, choice tiles), `--r-lg 20` (panels, large buttons), `--r-xl 28` (sheet top corners, hero cards), `--r-pill 999`; cards: hand 10, full 16. No other radii.
- Elevation (light only): `--e-1` (panels), `--e-2` (toasts, popovers), `--e-3` (sheets, `0 -8px 24px rgba(30,20,5,.18)`). On the table: cards use a hard edge `0 4px 0 rgba(0,0,0,.28)`; lifted card `0 10px 18px rgba(0,0,0,.35)`; no other shadows in a match. Buttons: hard 4 px edge (3 px small), no blur.
- z-index: base 0 · raised 10 · sticky header 100 · tab bar 110 · board HUD 200 · comms dock 300 · toast 400 · backdrop 500 · sheet 510 · modal 600 · coach mark 700 · system (loader/offline) 900. No literal z-index > 900 or ad-hoc values (current `zIndex: 1000` in MentorDialog → `--z-coach`).

### B.7 Motion
| Token | Value | Used for |
|---|---|---|
| `--dur-press` | 80 ms | button press-down |
| `--dur-fast` | 150 ms | hover, chip toggle, fades |
| `--dur-base` | 220 ms | sheet open (enter), card lift, toast in |
| `--dur-slow` | 320 ms | card fly to table, outcome banner, page transitions |
| `--dur-ceremony` | 700 ms | ₹ roll-up, year change, result reveal |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | most |
| `--ease-enter` | `cubic-bezier(.05,.7,.1,1)` | things appearing |
| `--ease-exit` | `cubic-bezier(.3,0,.8,.15)` | things leaving (exit = 0.7× enter duration) |
| `--ease-overshoot` | `cubic-bezier(.34,1.56,.64,1)` | ₹ roll-up end, star pop |
framer-motion springs: card lift/select `{type:'spring', stiffness:500, damping:32}`; sheet `{stiffness:420, damping:40}`.

What animates: button press; card deal on hand refill (stagger 40 ms, 220 ms each); card lift on select (−14 px, scale 1.06); card fly from hand to table (320 ms); ₹ counters roll (700 ms, digits change, tabular so no jitter); goal bar fill; outcome banner slide-up; toast slide-down from top; year change (top-bar year flips + "Year 4" banner 1.2 s); stars pop on result (stagger 150 ms); Gullu bob (2 px, only on the home greeting, 3 s loop).
Feedback tiers: small gain < ₹50K = roll-up + soft chime; medium ₹50K–₹2L = + 6 particle dots fly to HUD + haptic light (Capacitor Haptics `ImpactStyle.Light`); large ≥ ₹2L or attack on you = + card wobble (2 cycles ±3°) + haptic medium. Losses never shake the screen.
Reduced motion: if `prefers-reduced-motion: reduce` **or** in-app "Reduce effects" (pause menu + Profile; stored in `localStorage` key `bhao.reduceMotion`; sets `html[data-reduce-motion="true"]` and wraps the app in `<MotionConfig reducedMotion="always">`): all transforms become 150 ms opacity fades or instant; roll-ups jump to the final value; no particles, wobble, confetti, Gullu bob, pulsing rings; `react-confetti` not rendered. Remove the infinite `floatCard`/`glow` keyframes from `index.css`. Nothing flashes > 3 times/s.

### B.8 Breakpoints and layout modes
| Name | Condition | Menus | Board |
|---|---|---|---|
| Phone portrait | width < 600 and height ≥ 500 | single column, gutter 16, bottom tab bar | compact-portrait |
| Phone landscape | height < 500 (any width) | single column max 560 centred, tab bar becomes 56 px tall | compact-landscape |
| Tablet | 600 ≤ width < 1024, height ≥ 500 | single column max 560 (Home: 2-col tiles), tab bar | compact-portrait if portrait; desktop canvas if the fit scale ≥ 0.7 |
| Desktop | width ≥ 1024 and height ≥ 600 | app bar nav, 2-col Home/Landing, container 1120 | desktop canvas |
Board selection keeps the existing logic in `src/components/game/GameBoard.tsx`: desktop canvas 1280×700 scaled uniformly, compact when scale < 0.7 (`MIN_DESKTOP_SCALE`), max scale 1.35; orientation = area h > w. CSS media queries for menus use `(min-width: 600px)`, `(min-width: 1024px)`, `(max-height: 499px)` only (delete the 414/640/768/850/950 ad-hoc queries as their rules are migrated).
Safe areas: all fixed bars pad with `env(safe-area-inset-*)`; `viewport-fit=cover` stays.

---

## C. Fonts — implementation

Files (already prepared — copy from `docs/ux/mockups/fonts/` to **`public/fonts/`** with the same names; the PWA precache `globPatterns` already includes `**/*.woff2`):
| File | Content | Size |
|---|---|---|
| `baloo2-var-latin.woff2` | Baloo 2 variable wght 400–800, Latin (Fontsource) | 33.2 KB |
| `baloo2-var-rupee.woff2` | ₹ only (U+20B9), cut from the Devanagari file, variable | 1.0 KB |
| `baloo2-var-devanagari.woff2` | Baloo 2 variable, Devanagari | 115.1 KB |
| `mukta-400-latin.woff2` / `mukta-600-latin.woff2` | Mukta Latin | 20.5 / 21.2 KB |
| `mukta-400-rupee.woff2` / `mukta-600-rupee.woff2` | ₹ only | 2.5 / 2.4 KB |
| `mukta-400-devanagari.woff2` / `mukta-600-devanagari.woff2` | Mukta Devanagari | 99.4 / 102.6 KB |
| **Total** | | **≈ 398 KB** (budget ≤ 420 KB). English first paint loads only Latin + rupee files ≈ 81 KB. |
The rupee files were made with `pyftsubset <family>-devanagari.woff2 --unicodes=U+20B9 --flavor=woff2 --layout-features='*'`. Licence: SIL OFL 1.1 — add `public/fonts/OFL.txt` noting Baloo 2 (Ek Type) and Mukta (Ek Type).

@font-face: copy verbatim from `docs/ux/mockups/tokens.css` (top block) into `src/styles/fonts.css`, changing `url('fonts/…')` to `url('/fonts/…')`. Key points: `font-display: swap`; Latin range = Fontsource latin range; **Devanagari range excludes U+20B9** (it is served by the tiny rupee face) so English pages with ₹ never download the 100 KB Devanagari files; Baloo declared once as `font-weight: 400 800`.
Preload: in `index.html` add `<link rel="preload" as="font" type="font/woff2" href="/fonts/baloo2-var-latin.woff2" crossorigin>` and the same for `/fonts/mukta-400-latin.woff2` — only these two.
Remove:
- `index.html`: both `fonts.googleapis.com`/`gstatic` preconnects, the preload and the stylesheet link. Change `<meta name="theme-color">` to `#0E4D3F`.
- `vite.config.ts`: the two Google Fonts `runtimeCaching` entries; `THEME_COLOR` → `#0E4D3F`, `BACKGROUND_COLOR` → `#FFF8EC`.
- `src/pages/Auth.tsx` Playfair `@import` and `fontFamily` usage.
- Every reference to `Outfit`, `Inter`, `Space Grotesk`, `Avengenz`, `Clash Display`, `Sora`, `Playfair Display`, `Plus Jakarta Sans` in `src/**` (grep must return 0). All inline `fontFamily:` removed; use `var(--font-display|body|num)` or classes.
Fallback: `Noto Sans Devanagari` in the stack is a *local* fallback name only (not downloaded).

---

## D. Component library

Location: `src/components/ui/` (rewrite existing `Button.tsx`, `Card.tsx`, `Input.tsx`; delete `GlassPanel.tsx` usages and the file). All components take `className` and forward `aria-*`. Styles live in `src/components/ui/ui.css` (port from `tokens.css`/`mock.css`); no inline colour styles.

D.1 **Button** `<Button variant size block loading icon iconRight>`
- Variants: `primary` (haldi, ink text, edge `#C98A00`), `secondary` (brand teal, white, edge `#062A22`), `outline` (white on light / transparent on table; brand text; edge `--sand-500`), `ghost` (text-only link style, no edge), `danger` (attack-strong, white, edge `#7E180F`), `spend` / `save` / `invest` (strong colours, white, darker edges `#7A2A10` / `#0D4F2D` / `#1D2F96`).
- Sizes: `l` 56 px tall, radius 20, 18 px text, padding 24; `m` 48 px, radius 14, 16 px, padding 20; `s` 40 px visual, radius 10, 14 px, padding 14, **hit area extended to 44 px** (transparent `::after` inset −2 px). Icon-only: square, `aria-label` required (TS-enforced: `icon && !children` ⇒ `aria-label: string`).
- 3D press: `box-shadow: 0 4px 0 edge`, `margin-bottom: 4px`; `:active` → `translateY(4px)` and shadow 0 over 80 ms. Hover (pointer devices): primary bg `#FFD45E`, others brightness 1.05.
- States: disabled = paper-2 bg, `--ink-300` text, `--sand-400` edge, `aria-disabled`, no press; loading = spinner (20 px ring) replaces icon, label kept, `aria-busy="true"`, not clickable; focus-visible = 3 px ring `--focus-ring`, offset 2.
- One `primary` per screen state (Agent 4: count visible `.btn--primary` ≤ 1 per state, except style guide/gallery).

D.2 **Input** 48 px, radius 10, 2 px `--sand-500` border, white bg, 16 px text (prevents iOS zoom), label above (14 px 600), hint below (13 px muted), error = border + hint in `--attack-strong` + `aria-invalid` + `aria-describedby`. Room code input: Baloo 700 20 px, letter-spacing 0.12em, uppercase, `inputmode="text" autocapitalize="characters"`.

D.3 **Chip** 28 px tall, pill, Mukta 600 12 px (13 hi). Variants: neutral, spend/save/invest/defence/attack/risk (soft bg + strong text), `solid-*` (strong bg + white). Chips are not buttons; a tappable chip (filter) is a `ToggleChip` 40 px tall with 44 px hit area and `aria-pressed`.

D.4 **Panel / Card container** light: white, 1 px `--line`, radius 20, `--e-1`. On table: `--surface` (`#0A3329`), 1 px `#2A5E51`, no shadow. Tiles (home grid): panel + 14 px padding, min-height 118.

D.5 **Bottom sheet** (`<Sheet>`; used for decision, card inspect, portfolio, log, opponent detail, level intro on phones, pause menu): paper scope; radius 28 top; grab handle 40×5; max-height 90 dvh; inner scroll; sticky footer slot for the CTA; backdrop `rgba(6,20,16,.55)` (no blur); open 220 ms enter, close 150 ms; close by: X button (44 px, top-right), backdrop tap, swipe-down > 80 px, Android back (via existing `useBackButton`), Esc. Focus trapped, returns to opener; `role="dialog" aria-modal="true" aria-labelledby`. In **phone landscape and desktop** the same component renders as a **right side panel** 392 px (landscape) / 440 px (desktop), full height, radius 28 on the left.

D.6 **Modal** (forfeit, confirm delete, daily reward): centred, max-width 420, paper, radius 28, padding 24, Gullu at top optional, actions stacked on phones (primary on top), side by side ≥ 600 px.

D.7 **Toast / snackbar**: dark ink `#1E1A14` bg, white Mukta 600 14 px, radius 14, `--e-2`, icon left; appears top-centre below the top bar (match) or above the tab bar (menus); 3 s; `role="status"`. **Queue**: one at a time, FIFO, max 3 queued (older dropped), never overlapping a sheet/outcome banner (toasts wait while one is open). Implement `src/components/ui/toast.tsx` (`useToast()` provider) and route `notify()` in Game.tsx, `OpponentPlayToast`, equip messages through it.

D.8 **Tabs**: underline tabs 44 px, Baloo 700 16, active brand + 3 px underline, `role="tablist"`. **Segmented control** (language, bot count, mode): pill container paper-2, buttons ≥ 44 px tall (40 visual + hit area), active = brand bg white text, `aria-pressed`.

D.9 **Progress bar**: 10 px (8 px on table), pill, track paper-2 / `#062A22`, fill save→save-on-dark gradient for the net-worth goal, haldi for year/campaign progress; label text always next to it ("25% of ₹50 L"); `role="progressbar" aria-valuenow/min/max aria-valuetext`.

D.10 **Badge / count**: 20 px min, attack bg, white 12 px 700 — unread chat, log count (never overlaps the close button: badge sits on the opener only).

D.11 **Avatar**: 40 (menus) / 34 (rival chip) / 36 (standings) px circle, initial in Baloo 800 white on a player colour from `['#7C4DCC','#C2431A','#2E7D6B','#B8860B','#2E47D1','#46607A']` by seat; 2 px white ring + 2 px colour outer ring; rank badge (`#1`) bottom-right on the table. Bot avatars use the same style with a small `bot` icon badge (no robot images).

D.12 **Empty / loading / error**:
- Empty: Gullu (think) 72 px, title 18 Baloo, one line 15 px, one primary small button. Copy in §E.
- Loading: route-level `PageLoader` = paper bg + Gullu (happy) 72 px + 3 dots pulsing (opacity only), shows only after 300 ms delay; list screens use skeletons (paper-2 → paper-3 shimmer, 1.2 s, static in reduced motion). Delete `WalletLoader` visuals (keep the export name delegating to the new loader).
- Error (Sentry fallback in `App.tsx`): paper page, Gullu worried 96, title "Oops, BHAO hit a snag." body unchanged, buttons primary "Reload", outline "Go home". Offline notice (no network in multiplayer): top banner risk-soft "You're offline. Practice, campaign and the library still work."

D.13 **Language switcher** (`LanguageSwitcher.tsx`): in app bars a pill button 44 px: globe icon + current code ("EN" / "हिं" / "HG") → opens a small popover/sheet with 3 options as 48 px rows: "English", "हिंदी", "Hinglish" (each in its own script, `lang` attr set), check icon on current. On Profile/settings and Auth it renders as the segmented control. **Not shown inside a match** (it moves to the pause menu as a row "Language"). Switching sets `<html lang>` (`en`, `hi`, `en` for Hinglish with class `lang-hinglish`) and `html.lang-hi` for Hindi.

D.14 **Game card** — one component `src/components/GameCard.tsx` (rewritten; `GameCard.css` rewritten), props `{card, size: 'hand'|'full'|'sheet'|'mini', state: 'idle'|'selected'|'locked'|'played'|'faceDown', onClick}`.
- Face: cream `#FFF8EC`, 2 px border `#E7D7B9`, radius 10 (hand) / 16 (full), hard shadow `0 4px 0 rgba(0,0,0,.28)`; light token scope inside the card.
- **Type → band**: `decision` band `#F2A900` with ink icon/label "Decision" (हिं "फ़ैसला"); `action` band `#B42318` white, label "Attack" (हिं "हमला"); `defense` band `#0A6E6E` white, label "Shield" (हिं "बचाव"); `situation` and any `lifeEvent` card band `#46607A` white, label "Life event" (हिं "ज़िंदगी"). Band height: hand 26, full 36, mini/sheet 26–28. Hand/mini/narrow (< 110 px) cards show icon only (label is in the accessible name).
- **Icon**: if `card.category` → medical `heart-pulse`, job `briefcase`, market `trending-down`, fraud `shield-alert`, tax `landmark`, property `house`, legal `scale`, personal `user`, travel `plane`, debt `credit-card`; else by type: decision `indian-rupee`, action `swords`, defense `shield`, situation `calendar-days`. (lucide-react, 16 px hand / 18 full.)
- **Tier**: gem top-right (B.2). Tier name appears only in the inspect/decision sheet header chip and the accessible name. Remove `TIER_STYLE` ribbon overlay entirely (no raster under it any more).
- **Name**: `shortName`/`shortNameHi` (fallback name), Baloo 700, hand 13 px (12 px if any word ≥ 9 chars), max 3 lines, `overflow-wrap: break-word; hyphens: auto`, never ellipsis; full 18 px max 2 lines.
- **Headline value** (new pure helper `cardHeadline(card, lang)` in `src/lib/cardHeadline.ts`, unit-tested): `wealth_change` → signed compact ₹ (`+₹50K`, `−₹35K`); `wealth_pct`/`steal_pct`/`attack_all_pct`/`market_crash_player` → signed % (`−20%`); `reduce_attack_pct` → `−N% hit`; `steal` → `Steal ₹X`; `skip_turn` → `Skip turn`; `block_card` / defense → `Block` (हिं "बचाव"); `wealth_next_turn` → `+₹X next yr`; `wealth_end_game` → `+₹X at end`; `wealth_floor` → `Floor ₹X`; `double_invest` → `2× invest`; `copy_card` → `Copy`; `set_goal` → `New goal`; decision cards (with `options`) → **three dots** (spend/save/invest colours, 9 px) meaning "choose". Colour: negative → loss text, positive → gain text, defence → defence-strong, neutral → ink. Hand 16 px Baloo 800 tnum, full 22 px.
- **Flavor**: only on `full` size (13 px, 3 lines). Hand cards never show description (it is in the sheet).
- **States**: playable = normal; `locked` (not playable now) = `filter: saturate(.25); opacity:.72` + 12 px lock icon + `aria-disabled` + accessible reason; `selected` = lift −14 px, scale 1.06, 3 px haldi ring; `legendary` = gold border; `faceDown` = card back: `#062A22` with 1.5 px dashed haldi inner border and "BHAO" Baloo 800 haldi rotated −12°.
- **Sizes**: hand 70×104 (68×100 when viewport < 375 px wide); landscape hand 70×104; desktop hand (full) 128×184 in the 1280×700 canvas; sheet header 84×120; table "last played" 92×132 (phone) / 128×184 (desktop); library grid uses full size scaled to column width (aspect 128:184).
- **A11y**: `<button>` with `aria-label="{name}, {type label}, {tier}, {headline in words}. {locked reason}"`, e.g. "Market Crash, Attack card, Epic, every rival loses 20 percent". Keyboard: hand is a toolbar (`role="toolbar"`, arrow keys move focus, Enter opens sheet, keys 1–5 on desktop).

D.15 **Gullu** `src/components/mascot/Gullu.tsx`: `<Gullu mood size label?>` — port the SVG from `docs/ux/mockups/gullu.js` 1:1 (paths, colours). Decorative by default (`aria-hidden`), `role="img"` + label when meaningful. Moods: happy (default/home), cheer (good outcome, win, star), think (tips, report, empty), worried (attack on you, loss), wow (big gain, sign-in prompt).

D.16 **Rival chip / standings row / HUD / turn ring** — see §E.12 and `mock.css` (`.rival`, `.hud`, `.ring`). Turn ring: 44 px, 4 px stroke, track white 14%, haldi; ≤ 10 s → attack-on-dark + number pulses opacity (no scale); `role="timer"` with `aria-label="{n} seconds left in your turn"` announced only at 10 s and 5 s via the live region.

D.17 **Icons**: lucide-react only, stroke 2.25, sizes 16/18/20/22/24. Every icon-only control has `aria-label`; decorative icons `aria-hidden`.

---

## E. Screen-by-screen spec

Conventions: wireframes are 390×844 portrait unless noted. "AC" = acceptance criteria for Agent 4. Copy keys: add/replace in all three locale files `src/i18n/locales/{en,hi,hinglish}.json`; Hinglish = Roman-script Hindi-English mix. Global AC for every screen: no horizontal overflow (`scrollWidth ≤ clientWidth`) at all 6 viewports; every interactive element ≥ 44×44 hit box; no text < 12 px; no console errors; only tokens' colours (§G.3).

### E.1 Landing `/` (Landing.tsx) — mockup `landing.html`
Purpose: in 5 s, "fun card game that makes you smarter with money — play free now".
```
[₹ BHAO]                 [🌐 EN] [Sign in]      app bar 60
(✦ Free money card game · Made in India)        eyebrow chip
Make smart money moves.                          H1 display-xl, "money moves." brand + haldi highlight
Have fun doing it.
Every card is a real-life money choice...        body-l muted
[ ▶ Play free, no sign-up ]                      primary L (→ guest login → /dashboard, or /dashboard if signed in)
[ I have an account ]                            outline L (→ /auth)
🎓 Learn SIP, inflation, insurance  🌐 EN·हिंदी·Hinglish
┌ teal showcase: Gullu + bubble, fan of 3 real cards ┐
[benefit tile ×3]  Real money ideas / Play friends or bots / Get a money report card
footer: BHAO · Privacy · Terms · support@daanik.com · "For ages 13+. No real money is used."
```
Desktop: 2 columns (copy left, showcase right), benefits 3-up. Remove floating ₹ background (`FloatingBackground`) from Landing.
Copy (replace keys `landing.badge/hero1/hero2/hero3/heroSub/startFree/playGuest/signIn`; new keys `landing.heroA`, `landing.heroB`, `landing.heroC`, `landing.haveAccount`, `landing.trust1`, `landing.trust2`, `landing.benefit{1..3}.{title,body}`, `landing.footerAge`, `landing.gulluHi`):
| key | en | hi | hinglish |
|---|---|---|---|
| badge | Free money card game · Made in India | मुफ़्त पैसों का कार्ड गेम · भारत में बना | Free money card game · Made in India |
| heroA/B/C | Make smart / money moves. / Have fun doing it. | पैसों के / सही फ़ैसले लो। / मज़े-मज़े में। | Paisa banao. / Smart bano. / Mazze se khelo. |
| heroSub | Every card is a real-life money choice: Diwali bonus, a medical bill, a market crash. Spend, save or invest, and watch 20 years of your life play out in 15 minutes. | हर कार्ड असली ज़िंदगी का पैसों वाला फ़ैसला है: दिवाली बोनस, अस्पताल का बिल, बाज़ार में गिरावट। खर्च करो, बचाओ या निवेश करो — और 15 मिनट में अपनी ज़िंदगी के 20 साल देखो। | Har card ek real money decision hai: Diwali bonus, hospital ka bill, market crash. Spend karo, save karo ya invest karo — aur 15 minute mein 20 saal ki life dekho. |
| startFree | Play free, no sign-up | मुफ़्त खेलें, साइन-अप नहीं | Free khelo, sign-up nahi |
| haveAccount | I have an account | मेरा अकाउंट है | Mera account hai |
| footerAge | For ages 13+. No real money is used. | 13+ उम्र के लिए। असली पैसे का इस्तेमाल नहीं होता। | 13+ ke liye. Asli paisa use nahi hota. |
| gulluHi | Hi, I am Gullu. Let me show you! | नमस्ते, मैं गुल्लू हूँ। चलो दिखाता हूँ! | Hi, main Gullu hoon. Chalo dikhata hoon! |
Also update `index.html` title/description to "BHAO — The money decision card game" (no "Stock Simulator").
AC: H1 computed font-size = 40 px at 390 and 64 px at 1366; H1 font-family Baloo 2; primary CTA visible above the fold at 390×844 and 844×390 (scroll allowed in landscape but CTA within first 390 px? → in landscape the CTA must be visible without scrolling: reduce H1 to `--fs-display-l` when `max-height: 499px`); footer links ≥ 44 px tall and colour `#0E4D3F`; strings "Dominate", "Attack." absent; showcase cards are DOM (not images).

### E.2 Auth `/auth` (Auth.tsx)
```
[←]                         [🌐]
 Gullu (wow) 88
 Welcome to BHAO              display-l
 Save progress and play with friends.
 [ G  Continue with Google ]  outline L (Google mark per brand guidelines, white bg)
 [ ▶ Play as guest ]          primary L  (equal size, BELOW Google? → ABOVE: guest first)
 ── or sign in with email ──  (if the email form exists keep it: inputs D.2, secondary button)
 (i) Online sign-in is unavailable right now.   slim risk-soft banner, only when service down, placed under the buttons
 Privacy · Terms
```
Decision: order = "Play as guest" (primary) then "Continue with Google" (outline). Wordmark uses `.wordmark` (Baloo), Playfair removed. AC: no Playfair request; guest button height 56; warning banner not the first element.

### E.3 Legal `/privacy`, `/terms` (Legal.tsx)
Paper page, app bar with back, content max-width 680, body 16/1.6 (hi 1.7), headings title/subtitle, links brand underlined. AC: support email link colour contrast ≥ 4.5 (fix of P0-5), line length ≤ 75ch.

### E.4 Home `/dashboard` — guest (GuestHome.tsx) and signed-in (Dashboard.tsx HomeTab) — mockup `home.html`
One layout for both; signed-in adds coins/streak and Leaderboard/Contracts cards.
```
[₹ BHAO]            [🌐 EN] (T)                 app bar; desktop adds Home·Campaign·Library pills
 Gullu  Namaste, Tester!                          greeting; sub: "Guest · progress is saved on this phone" | signed-in: "🔥 3-day streak · ◉ 240 Daanik Coins" (chips, tappable → info sheet)
┌──────── teal hero card (r-xl) ────────┐
│ CAMPAIGN · LEVEL 2 OF 4               │ caption
│ Vidyarthi to Yuva                     │ title (hi: विद्यार्थी से युवा)
│ Age 18–22. The one idea: ...          │
│ ☆☆☆                                   │ stars of that level
│ [ ▶ Play level 2 ]          (cards)   │ primary L
└───────────────────────────────────────┘
 Quick play
 [Practice vs bots] [Gyaan Library 4/22 ring]
 [How to play     ] [Play friends 🔒Sign in]      signed-in: Play friends unlocked → /multiplayer
 signed-in only: [Leaderboard card: your rank #128, top 3 mini list, "See all"] [Daily contracts: 2/3 done → "See all"]
 guest only: dashed card "Keep your progress safe" + [Sign in] secondary S
[ Home | Campaign | Library | Profile ]           tab bar 68
```
Hero logic: tutorial never completed → hero = "Start here: How to play (3 min)" + Play → `/tutorial`; else next unlocked-but-not-3-starred campaign level; all done → Practice.
Daily reward: on first home visit of the day for signed-in users, the DailyRewardModal (E.21) opens once.
Copy: `home.greeting` "Namaste, {{name}}!" / "नमस्ते, {{name}}!" / "Namaste, {{name}}!"; `home.guestSaved` "Guest · progress is saved on this phone" / "मेहमान · प्रगति इसी फ़ोन में सेव है" / "Guest · progress isi phone mein save hai"; `home.quickPlay` "Quick play" / "जल्दी खेलें" / "Quick play"; tiles: "Practice vs bots — A quick 15-minute game." / "बॉट्स के साथ अभ्यास — 15 मिनट का खेल।"; "Gyaan Library — Money ideas you unlocked." / "ज्ञान लाइब्रेरी — आपके खोले हुए पैसों के आइडिया।"; "How to play — 3-minute tutorial." / "कैसे खेलें — 3 मिनट का ट्यूटोरियल।"; "Play friends — Needs a free account." / "दोस्तों के साथ — मुफ़्त अकाउंट चाहिए।"; `home.keepSafe` "Keep your progress safe" / "अपनी प्रगति सुरक्षित रखें" / "Apni progress safe rakho".
Profile tab (guest): Gullu + "Sign in to save progress" + Sign in button, then settings list: Language (segmented), Sound on/off, Reduce effects, Privacy, Terms, "Exit guest mode" (outline danger-text). Signed-in Profile = existing ProfileTab restyled + same settings + DeleteAccountButton (E.22).
AC: exactly one primary button visible at load; tab bar present on phone, hidden ≥ 1024; Library ring text "4/22" matches progress; "Exit guest mode" moved to Profile; emoji icons gone.

### E.5 Campaign `/campaign` (Campaign.tsx) — mockup `campaign.html`
```
[←] Artha Yatra                  [★ 2/12]
 Your money life                  display-l
 Four life stages, from school to family. Earn stars to unlock the next.
 [====      ] 1 of 4 done
 (1)sprout  ┌Age 13–18 · Student ┐            path alternates left/right, dashed trail
            │Brahmacharya        │
            │Control your Desire meter. ★★☆ │
            └────────────────────┘
 ┌Age 18–22 · College ┐  (2)grad-cap + Gullu   current node: haldi, ring glow, card has haldi border + [▶ Play] primary
 │Vidyarthi to Yuva   │
 │[ ▶ Play ]          │
 (3)briefcase  locked: grey node; "🔒 Get 1 star on Level 2 to unlock" (full text, wraps, never truncated)
 (4)house      locked
[tab bar]
```
Tap any unlocked node/card → Level intro sheet (E.6). Remove header "It's your turn" and the "Level 1" pill. Level names come from i18n `campaign.levels.level_N.{name,age,stage,idea}`; Hindi names: ब्रह्मचर्य, विद्यार्थी से युवा, आरंभ गृहस्थ, गृहस्थ धर्म; stages: छात्र, कॉलेज, पहली नौकरी, परिवार. Node icons: sprout, graduation-cap, briefcase, house.
AC: no truncated title/lock text at 360 px (no `text-overflow: ellipsis` computed on these nodes); Hindi mode shows Devanagari names; current level has the only primary button.

### E.6 Level intro (components/campaign/LevelIntro.tsx)
Phone: bottom sheet (D.5) full-height-capable; landscape/desktop: centred modal max 520 with internal scroll. Content order: caption "Level 2 · Age 18–22", title, "The one idea" callout (Gullu think + 1 sentence, save-soft bg), Goal: "Reach ₹32 lakh in 12 years" (num font), rule card (mechanic name + description), stars checklist (3 rows with star icon + criterion text), sticky footer: [▶ Start level] primary L full width + "Not now" ghost. AC: at 844×390 the Start button is fully visible without scrolling (sticky footer) — fixes P1-8.

### E.7 Level rule HUD + stars (LevelRuleHUD.tsx, LevelStars.tsx)
In match: the rule is a 44 px pill button in the top-left of the table centre ("🎯" replaced by `target` icon + mechanic short name, e.g. "Desire 62%") on the dark table; tap → paper popover/sheet with LevelRuleHUD content. Desire/streak meters render as D.9 progress bars with label + value. Stars on result: 3 star icons 32 px, filled haldi `#FFC530` with `#C98A00` outline, empty `--sand-500`; each with criterion text and check/cross; pop animation stagger 150 ms. AC: the rule pill never overlaps the hand or action bar at 390×844 and 844×390.

### E.8 Library `/library` (Library.tsx, LibraryEntryCard.tsx) + Concept sheet (ConceptSheet.tsx)
```
[←] Gyaan Library                 4 / 22 ◔
 Filter chips (ToggleChip): All · Saving · Investing · Risk · Tax · Protection
 grid 2 cols (phone) / 3 (tablet) / 4 (desktop) of concept cards using the full-card frame:
   unlocked: band in topic colour (save/invest/risk/defence/event), icon, title 18, one-line summary
   locked: cream-200 face, dashed sand border, lock icon, "Play to unlock" + hint text (e.g. "Get hit by inflation once")
```
Empty (0 unlocked): D.12 empty state "No money ideas yet" / "Play your first game to unlock them." + [Play now] → practice. Concept sheet: D.5 sheet; sections Title, "In one line", Example (₹ numbers in num font), "Try in real life" callout (save-soft), close. AC: locked vs unlocked distinguishable in greyscale (lock icon + text); progress ring value correct; concept sheet text ≥ 16 px.

### E.9 Multiplayer — sign-in wall (SignInRequired.tsx) and Lobby (Lobby.tsx)
Sign-in wall: Gullu wow, title "Play with friends", 3 benefit rows (icons users / trophy / message-circle), [Sign in] primary, [Back to home] outline (visible, fixes P2-6).
Lobby menu: segmented "Create room | Join room"; Create: mode cards (Blitz/Standard/Epic) as selectable tiles with duration text, [Create room] primary. Join: room code input (D.2) + [Join] primary. Remove Sora/Clash/navy palette.
Waiting room:
```
 Room code
 ┌ K 7 Q 2 M ┐  Baloo 800 40px tnum, letter-spacing .12em   [Copy] outline S  [Share on WhatsApp] secondary S (uses navigator.share / Capacitor share; text "Join my BHAO game: code K7Q2M")
 Players 2/4
 (R) Rahul ✓ Ready     (T) You  host
 ( + ) Waiting…        ( + ) Waiting…          slots as 64px rows
 [ ▶ Start game ] primary (host, ≥2 players)  | non-host: "Waiting for host to start" text + [I'm ready] secondary
 [Leave room] ghost
```
AC (via `/__ux`): code is copyable; slots readable at 360 px; no Sora/Clash fonts.

### E.10 Tutorial `/tutorial` (TutorialGame.tsx, TutorialScreens.tsx, CoachMark.tsx, ProgressDots.tsx)
Keep the chai hook screen content; restyle: dark table bg, Gullu cheer, the "₹150 → ₹10.5 lakh" number in num-xl haldi, primary "Show me how". Coach marks: paper bubble (radius 20, `--e-2`, max-width 300) with Gullu (happy/think) 48 px at the left, text 16 px, [Next] primary S + "Skip tutorial" ghost; an arrow (12 px triangle) points at the target; placement algorithm: prefer above the target, else below, else side; **never overlaps the target's bounding box** (target gets a 4 px haldi ring cut-out highlight). Step counter "2 / 9" replaces dots (`ProgressDots` renders text + mini bar). AC: for each step at 390×844 and 844×390, coach bubble rect ∩ target rect = ∅.

### E.11 Practice setup (Game.tsx `SetupScreen`)
Full page (not a floating modal), paper, no confetti/coins bag:
```
[←] New practice game
 Gullu think  "Race to ₹50 lakh in 20 years."
 Opponents   [ 1 ][ 2 ][ 3 ]   segmented, 56px tall, each with bot avatar stack
 Bot level   [Easy][Normal][Hard]  (only if supported; else omit)
 Summary card: "You + 2 bots · about 15 minutes · start with ₹5 lakh"
 signed-in only: "Win to earn 100 Daanik Coins ⓘ"
 [ ▶ Start game ] primary L, sticky bottom
```
Campaign-level setup: skip this screen entirely (Level intro already confirmed) — `/game/level/:id` starts directly after the intro. Copy: delete `setup.entryReward`, `setup.winToEarn` usage for guests; new `setup.coinsWin` "Win to earn {{n}} Daanik Coins" / "जीतने पर {{n}} दानिक कॉइन" / "Jeetne par {{n}} Daanik Coins"; `setup.summary` "You + {{n}} bots · about {{min}} minutes · start with {{start}}". AC: no element with `$`, no `coins bag.webp`, buttons ≥ 44 px.

### E.12 Game board — phone portrait (compact-portrait) — mockups `board-phone*.png`
Root gets `.surface-table`. Remove `image copy.webp` background, laser lines, level crest, EXIT image, GAME LOG image, in-match LanguageSwitcher, duplicate helper texts, WalletChip dropdown.
```
y=0   [≡]  Year 3 of 20 ▬▬▭▭  17 years left  [📜] (42)        TOP BAR 52: pause menu · year+progress · log · turn ring
           (+ amber chip "1:58 left" when match clock < 2:00)
y=52  [R #1 ₹14.1 L ▲8%] [P #3 ₹9.8 L ▼3%] [A #4 ₹7.2 L ▲1%]   RIVALS 60: equal chips; current turn = haldi border; tap → opponent sheet
      ┌ deck (38 cards) ┐ ┌ last played card ┐                  TABLE CENTRE (flex)
      (↗ Inflation 6% this year)                                year/event chip
      Your turn                                                 state headline (title 22)
      Pick a card. Spend it, save it or invest it.              state line (14 muted)
      [≋ Priya saved ₹26,000 (streak ×2)]                       recent moves feed, last 2 events (14 px)
      [↗ Aman's index fund grew 8% this year]
      ┌ NET WORTH            You are #2 ┐                       MY MONEY HUD ~120: tap → portfolio sheet
      │ ₹12,40,500     ▲ ₹48,200 this yr│
      │ ▬▬▬▭▭▭▭▭▭ Goal ₹50 L           │
      │ Cash ₹4.2 L | Invested ₹8.2 L | Lifestyle ▮▮▯▯▯ │
      [card][card][card][card][card]                            HAND 5 × 70×104, gap 5, all visible
      Tap a card to play, equip or pass | [▤ Draw a card]       ACTION BAR 66 (state-dependent)
```
States:
| State | Table centre headline/line | Action bar |
|---|---|---|
| draw (your turn, before draw) | "Your turn" / "Draw a card to start." Deck pulses glow ring (opacity) and is tappable | primary L block "Draw a card" (deck tap = same) |
| play | "Your turn" / "Pick a card. Spend it, save it or invest it." | hint text only: "Tap a card to play, equip or pass" (the ONLY place for this hint) |
| card tapped | opens Card sheet (E.13) | – |
| targeting | "Choose a rival to hit with Market Crash"; rival chips get attack-red 2 px border + "Tap to target" | outline "Cancel" |
| rival's turn | "Rahul is playing…" with his avatar; his chip highlighted; hand cards locked-looking but still inspectable (tap opens read-only sheet) | text "Wait for your turn" |
| year change | full-width banner over table centre for 1.2 s: "Year 4 · inflation 6% · your investments +₹38,000" | unchanged |
| skipped turn | "You skip this year (Tax Raid)" | – |
Pause menu (≡ → sheet): title = mode ("Practice" / "Level 2 · Vidyarthi to Yuva" / "Ranked"), match clock "14:21 left", rows: Resume (primary), How to play (opens rules sheet), Game log, Sound on/off, Reduce effects, Language, Quit game (danger text → Forfeit modal E.19).
Opponent chip: avatar (seat colour, initial), rank badge, name (13 px, ellipsis allowed for names only), ₹ compact (15 px Baloo tnum), delta this year (▲/▼ icon + %, gain/loss on-dark), shield count icon if > 0, voice badge (multiplayer, D.18). Show up to 3 rivals; with 4+ rivals in multiplayer the strip scrolls horizontally with snap (only place horizontal scroll is allowed).
HUD: net worth num 30 px (roll-up animation on change), rank "You are #2" haldi-300, yearly delta, goal bar + "Goal ₹50 L", three chips Cash / Invested / Lifestyle (5-segment meter, spend-on-dark). Campaign levels add the level meter (Desire/Streak) as a 4th chip.
Hand: 5 slots; empty slots dashed outline. Cards that cannot be played now: `locked` style + reason in sheet ("Equip limit reached this turn"). No horizontal scroll.
Feed: last 2 entries from the game log rendered as sentences (translated via existing `translateLogEntry`), icon by event type.
AC (390×844, en + hi): all 5 hand cards fully inside the viewport (each `getBoundingClientRect` within 0..390 and above the action bar), card name ≥ 12 px and not clipped (`scrollHeight ≤ clientHeight` of the name box), values ≥ 16 px; top bar height ≤ 56; exactly one clock visible (turn ring) unless match < 2:00; no LanguageSwitcher in match DOM; HUD shows ₹ net worth without any tap; rivals show "₹" values; same AC at 360×740 with 68 px cards.

### E.13 Card sheet = decision sheet / inspect / equip / pass — mockup `board-phone-sheet.png`
Opens on tapping a hand card (phone portrait: bottom sheet; landscape/desktop: right side panel, hand reflows to the remaining width and the left HUD collapses — see `board-landscape-sheet.png`).
```
 ─── grab
 [mini card 84×120] (₹ Decision)(◆ Rare)          [X]
                    Diwali Bonus                     title 24
                    Your company pays a ₹50,000 festival bonus. What will you do with it?
 Cash ₹4,20,000                    Net worth ₹12,40,500
 ┃ (Spend) New phone                        +₹10K   choice tile: 6px stripe, chip, title Baloo 17, amount num 20 coloured
 ┃ Keep ₹10K. Lifestyle +1, so inflation bites harder every year.
 ┃ (Save) Emergency fund                    +₹50K
 ┃ Safe cash for bad days. Save again next turn for a streak bonus.
 ┃ (Invest) Index fund SIP                 ~12%/yr
 ┃ Grows with the market. Can fall in a crash year.  (Medium risk)(Locks ₹50K)
          ✕ Pass: discard this card (ends turn)      ghost, muted
```
Per card type: decision → the 3 choice tiles (data from `DecisionOptions` / `options`, use `shortLabel`, `shortDescription`, mentor insight as the consequence line, `RiskBadge` as a risk chip, asset name). Action/attack → one primary "Play: choose a rival" (→ targeting) or "Play" if untargeted, plus Pass. Defence → primary "Equip shield (free)" + Pass; if equip not allowed: disabled with reason. Life event / situation → info + "OK". Rival's turn (read-only) → no actions, "Wait for your turn". Pass: first time per match shows an inline confirm row "Discard Diwali Bonus and end your turn? [Keep card] [Pass]"; afterwards immediate.
Choice tile = `<button>` 2 px `--line` border, 3 px bottom edge, radius 14, press-down like buttons; `aria-label="Spend: New phone, plus 10 thousand rupees. Keep 10K..."`.
Copy chips: Spend/Save/Invest = "खर्च" / "बचत" / "निवेश" (hi), "Spend/Save/Invest" (hinglish). Pass line: "Pass: discard this card (ends turn)" / "पास: यह कार्ड छोड़ें (बारी खत्म)" / "Pass: ye card chhodo (turn khatam)".
AC: at 390×844 all three choice tiles and the Pass control are visible without scrolling the sheet (en and hi); the sheet does not cover the top bar; X, backdrop, swipe-down and Android back all close it and return focus to the card; at 844×390 the panel is ≤ 392 px wide and all 5 hand cards remain visible to its left.

### E.14 Outcome banner (replaces EventPopup outcome cards) — mockup `board-phone-outcome.png`
After a choice resolves: paper banner slides up from the bottom (over hand/action bar), radius 28 top, 4 px top border in result colour; Gullu (cheer for good, think for neutral/treat, worried for loss/attack); title Baloo 22 coloured (save-strong / risk-strong / attack-strong) with the ₹ delta in num; one lesson sentence 15 px ink-700 (from `mentorInsight` / existing outcome copy, translated; English fallback text is forbidden in hi mode — show nothing rather than English); buttons: "Learn more" outline (→ concept sheet for the related concept, only if one exists) + "Next" in the matching semantic button (save/invest/spend) or primary. Auto-dismiss: never (player taps Next) — except bot turns, which use toasts. Tone: Spend outcomes are amber "Treat yourself: −₹35K", never red; red only for attacks/losses from events.
Attacks on you: same banner in attack-soft with "Rahul hit you with Tax Raid: −₹30,000" + if you hold a matching shield: primary "Use Health insurance" else "Got it".
AC: banner text contrast ≥ 4.5; no English sentence in hi mode outcome (Agent 4 checks Latin-letter ratio < 30% excluding ₹/numbers/names); banner doesn't overlap a toast.

### E.15 Wallet / portfolio sheet (PortfolioPanel)
Tap HUD → sheet: Net worth num-xl + goal bar; "Cash" row with "loses ~6%/yr to inflation" note; Investments list (name, asset risk chip, value num, ▲▼ last change); Shields (equipped defence cards as chips, 0/3); Lifestyle meter explained ("Each Spend raises it; inflation on your cash rises with it"); Info icons open 1-line definitions (SIP, FD, Inflation, Net worth). Desktop: this content is always visible in the left column (mockup `board-desktop.png`).

### E.16 Year / market news (YearNewsStrip, useYearNews)
Year change ceremony = top-bar year flip + 1.2 s centre banner, then the summary appears as the first two feed lines (not an overlapping panel). Tapping the year in the top bar opens a sheet with the full year summary (inflation, market % per asset, your change). Remove the toast-over-summary overlap (P1-13) by the toast queue (D.7).

### E.17 Game log (GameLog.tsx)
Sheet titled "Game log" with entries grouped by year ("Year 3"), each entry a full sentence wrapping (never truncated), icon by type, newest first; count badge only on the opener. Empty: "Moves will appear here." AC: no `text-overflow: ellipsis` in log entries.

### E.18 Multiplayer in-match controls (RoomComms.tsx/.css, BoardShared `EmoteButton`)
Comms dock: phone portrait = vertical stack of 48 px round buttons at right edge, bottom = 12 px above the HUD (never over hand/action bar); landscape = in the top bar right before the log icon; desktop = in the top bar. Buttons: Emote (smile icon), Chat (message-circle + unread badge), Mic (3 states: off = `mic-off` outline "Voice off"; live = `mic` save-on-dark ring "Mic on"; muted = `mic-off` attack-on-dark "Muted"; tooltip/label text visible on desktop, `aria-label` always). Emote picker: popover above the button, 6 emoji 48 px + quick-chat chips first ("Nice move!", "Bachke!", "GG", "Well saved!") then free text. Chat panel: right side panel (all sizes; phone portrait = bottom sheet 70 dvh); top: players row with poke / mute / report per player (keep functionality), messages, input 48 px + send. Report sheet: existing flow restyled with D.2/D.6. Voice badges on rival chips: 16 px mic icon bottom-left of avatar (speaking = save-on-dark ring pulse opacity).
AC (in `/__ux`): dock does not intersect hand or action bar rects at 390×844 and 844×390; all controls ≥ 44 px with accessible names; unread badge visible.

### E.19 Forfeit modal (ForfeitModal.tsx)
D.6 modal: Gullu worried, title "Quit this game?", body "Your progress in this game will be lost." (ranked: "This counts as a loss."), buttons [Keep playing] primary, [Quit game] danger. Android back while open closes it (existing).

### E.20 Result + report card (Game.tsx `ResultScreen`, MultiplayerGame result, ResultModal.tsx, GameReportPanel/ReportCard/ProjectionBars) — mockup `result.html`
Light page, sticky bottom bar: [Home] outline + [Play again] primary (campaign: "Next level" primary when unlocked, else "Try again"; multiplayer: "Back to lobby").
Order: (1) Gullu + caption "Game over · 20 years played" + **headline** + sub; (2) net-worth card: start → end, roll-up, sparkline (NetWorthSparkline restyled), % change; (3) campaign: stars block (E.7); (4) Final standings (compact rows, you highlighted risk-soft); (5) Report card (2 px ink border + 5 px hard ink shadow — "certificate" look): money style title, lesson with ₹, 5 grade tiles, "See why for each grade" expands the existing per-grade explanations; (6) "If you did this for real for 10 years" bars; (7) New in Gyaan Library chips → library; ranked: RP change chip in (1).
Headline rules (key `result.headline.*`), evaluated in order:
| Condition | en | hi | hinglish | Gullu |
|---|---|---|---|---|
| won (placement 1) | You won! ₹{{nw}} | आप जीते! ₹{{nw}} | Aap jeete! ₹{{nw}} | cheer + confetti (≤ 120 pieces, not in reduced motion) |
| grew ≥ 2× | Your money grew {{x}}× | आपका पैसा {{x}} गुना बढ़ा | Aapka paisa {{x}}× badha | cheer |
| grew > 0 | Your money grew {{pct}}% | आपका पैसा {{pct}}% बढ़ा | Aapka paisa {{pct}}% badha | happy |
| near miss (within 20% of goal) | So close! Only ₹{{gap}} short | बस ₹{{gap}} कम रह गए! | Bas ₹{{gap}} kam reh gaye! | wow |
| shrank | Tough game. Here's what to try next | मुश्किल खेल। अगली बार ये आज़माएँ | Tough game. Agli baar ye try karo | think |
Sub: "You finished {{ordinal}} of {{n}}. {{winner}} reached ₹50 lakh first." Delete keys/usages `result.betterLuck`, rotated grey banner, coin icons for wealth (use ₹ compact).
AC: with a player who grew money and lost, the page shows "Your money grew…" and never "Better luck"; at 390×844 headline + net worth card visible in the first viewport; sticky bar always visible while scrolling; all ₹ values use ₹ glyph, no coin images.

### E.21 Daily reward (DailyRewardModal.tsx)
D.6 modal: Gullu cheer, title "Daily streak bonus", 7-day row of 44 px day tiles (past = save-soft check, today = haldi, future = paper-2), amount "+20 Daanik Coins" with the D-coin icon; [Collect] primary → small coin-count roll-up (no confetti, no spin). Copy: remove any "reward chest"/"jackpot" words.

### E.22 Delete account (DeleteAccountButton.tsx)
In Profile under "Danger zone": outline button with danger text "Delete account" → D.6 modal: title "Delete your account?", body lists what is deleted, input "Type DELETE to confirm" (D.2), [Cancel] outline, [Delete forever] danger (disabled until matched, loading state).

### E.23 Phone landscape board (compact-landscape) — mockup `board-landscape-play.png`
```
[≡] Year 3 of 20 ▬▭ [R ₹14.1L ▲8%][P ₹9.8L ▼3%][A ₹7.2L ▲1%] [📜] (42)   top bar 52 incl. rivals
┌ HUD 196w ┐   deck  last-played  (Inflation 6%) Your turn / hint
│net worth │
│goal      │        [c][c][c][c][c]   hand 70×104
│cash/inv/ │
│lifestyle │
```
Draw state: the "Draw a card" primary appears where the hint is (right of the deck). Card sheet = right panel 392 (E.13). AC at 844×390: 5 cards fully visible; nothing clipped vertically; panel open keeps 5 cards visible.

### E.24 Desktop board — mockup `board-desktop.png`
Within the 1280×700 canvas: top bar (Menu outline button, mode title + sub, year bar 280 px, "Game log" outline button, ring + "Your turn / 42 s left"); left column 300: My money, Investments, Shields; centre: table zone (deck 128×184, last played full card, event chip, headline) and hand of 5 full cards 128×184 + hint "Click a card to play, equip or pass · keys 1–5 select a card"; right column 290: Standings (ranked, you highlighted), Recent moves (last 4). Decision/inspect = right side panel 440 over the right column. Opponent play toasts appear top-centre under the top bar.

### E.25 Tablet (768×1024)
Board: compact-portrait layout with hand cards scaled to 96×140 (`full` card style without flavor) when width ≥ 600; menus single column 560.

---

## F. UI bug fixes (required behaviour)

F.1 **Invisible links**: delete `a { color: var(--color-primary-light) }`; base rule `a { color: var(--link); text-decoration: underline; text-underline-offset: 2px }`. AC: every `<a>` on Legal, SignInRequired, GuestHome, Landing footer has contrast ≥ 4.5 with its background.
F.2 **Global mobile overrides**: delete in `src/index.css` the `@media (max-width:768px)` block rules that set `html {font-size:14px}`, `* {max-width:100%}`, `h1/h2/h3 … !important`, `p, span, button {font-size: … !important}`, `button {min-height:48px !important}`, and the 414 px block's type overrides. Replace with tokens (§B.5) and component min-heights. AC: `grep -c "!important" src/index.css` ≤ 10 (only reduced-motion and utility `display` helpers that are still referenced); Landing H1 spans render at 40 px on phones.
F.3 **EXIT / GAME LOG / LEVEL images**: removed; replaced by lucide icon buttons with translated `aria-label` (`game.menu` "Pause menu", `game.log` "Game log") and the pause menu title showing the correct mode. AC: Practice never shows "LEVEL"; Hindi shows Hindi labels; no request for `exit button.webp`, `gamelogbutton.webp`, `level bar.webp`.
F.4 **Untranslated strings**: all strings seen in English in hi mode in `docs/ux/current/p-hi-*` (OPPORTUNITY, COMMON/EPIC, GAME LOG, EXIT, LEVEL - 1, outcome tips, level names) get keys in all 3 locales. Add a vitest `src/i18n/__tests__/parity.test.ts`: every key in `en.json` exists in `hi.json` and `hinglish.json` (non-empty). Hard-coded user-facing English literals in TSX touched by this redesign are moved to i18n (Dashboard profile labels "Daanik Coins" etc.).
F.5 **Breakpoint crossing must not reset the match**: resizing/rotating/folding between compact and desktop layouts (and between portrait/landscape) keeps the same `gameState`, `uiPhase`, open sheet, timer and selection. Requirement: game state lives in the page (`Game.tsx`, `MultiplayerGame.tsx`, `TutorialGame.tsx`) and is never re-initialised by a layout change; nothing keyed on viewport may remount the page or call `setUiPhase('setup')`. Agent 3 must find the actual cause (reproduce with `scratchpad/e2e/rot2.mjs` from Agent 1: start practice at 1366 px, resize to 700 px) and add a regression test (vitest + RTL: render `Game` with mocked matchMedia/ResizeObserver, start a game, change size, assert board still present and hand unchanged). AC: Agent 4 repeats the resize in Chrome: 1366→700→1366 and 390×844→844×390→390×844 mid-turn; hand, year, net worth unchanged, no Setup screen.

F.5a **Pause really pauses (single player: Practice, Ranked vs bots, Campaign, Tutorial)**: while the pause menu, the rules opened from it, the quit dialog, an outcome banner or the app is in the background, the turn timer, the bots and the match clock are frozen (one freeze in `Game.tsx`: both clocks shift forward by the paused time on resume). The turn ring and clocks stop visibly (`.turn-ring.is-paused`, dimmed, no pulse). The pause menu says "Game paused…". Multiplayer is server-authoritative and never pauses; its pause menu says the game keeps running (`board.pauseLive`).

F.5b **Saved match survives Android killing the app**: the running single-player match (not multiplayer, not the tutorial) is saved to `localStorage` key `bhao.match.v2:<user:id | guest:id>` (one slot per profile; `src/lib/matchSave.ts`: schema version, `savedAt`, mode, level id, route, elapsed turn / match time) after every committed change (debounced 300 ms) and immediately when the app goes to the background. Cleared on match end, forfeit/quit, Play again, Home. Discarded if older than 7 days, another schema or invalid. Home (signed-in and guest) offers "Continue your match?" (Continue / Start new); Continue reopens the match paused with the pause menu open.
F.6 Toast/summary overlap: fixed by toast queue (D.7) + year summary in feed (E.16).
F.7 Log modal text cut/badge overlap: fixed by E.17.
F.8 `FallbackComponent` and any other inline hex colours in `App.tsx` move to tokens.

---

## G. Implementation plan for Agent 3 (+ helper A, helper B)

### G.1 Phases and file ownership
**Phase 1 — Foundation (Agent 3 alone; nobody else edits these files ever after without asking Agent 3)**
1. `public/fonts/*` (9 files from `docs/ux/mockups/fonts/` + `OFL.txt`), `index.html`, `vite.config.ts` (fonts, theme colours).
2. `src/styles/fonts.css`, `src/styles/tokens.css` (from mockup tokens.css incl. `.surface-table`, `.paper`, `html.lang-hi`), import in `src/main.tsx`.
3. `src/index.css` cleanup (F.1, F.2, delete unused legacy vars only after grep shows no users; map old vars `--green-primary`→`var(--teal-800)` etc. as temporary aliases at the bottom with comment `/* legacy alias — remove after Phase 2 */`).
4. `src/components/ui/*` (Button, Input, Chip/ToggleChip, Panel, Sheet (bottom+side), Modal, Toast provider, Tabs, Segmented, Progress, Avatar, Badge, EmptyState, Skeleton, `ui.css`), `src/components/mascot/Gullu.tsx`, `src/lib/format.ts` (`formatMoney`), `src/lib/cardHeadline.ts` (+ tests), `src/components/GameCard.tsx`/`.css` (D.14), `src/components/LanguageSwitcher.*`, `src/components/WalletLoader.*` → PageLoader, `src/hooks/useReducedEffects.ts` + `MotionConfig` in `App.tsx`, `src/App.tsx` (PageLoader, fallback, `/__ux` dev route skeleton `src/dev/UxGallery.tsx`), i18n parity test.
Gate before Phase 2: `tsc`, `vitest`, `eslint`, `build` green; `/__ux` shows all base components.

**Phase 2 — parallel**
- **Helper A — menu screens**: `src/pages/Landing.tsx`, `Auth.tsx`, `Legal.tsx`, `GuestHome.tsx`, `SignInRequired.tsx`, `Dashboard.tsx` (HomeTab, ProfileTab, Leaderboard/Contracts screens, tab bar), new `src/components/nav/AppBar.tsx` + `TabBar.tsx`, `src/components/DailyRewardModal.tsx`, `DeleteAccountButton.tsx`, `FloatingBackground.tsx` (delete usages), `RankBadge.tsx`. Locale keys: prefixes `landing.*`, `auth.*`, `home.*`, `dashboard.*`, `profile.*`, `legal.*`, `signin.*`, `daily.*`.
- **Helper B — game board + cards**: `src/components/game/GameBoard.tsx/.css`, `GameBoardMobile.tsx/.css`, `GameBoardDesktop.tsx/.css`, `PlayerBoard.tsx`, `BoardShared.tsx`, `EconomyPanels.tsx/.css`, `GameLog.tsx`, `TurnTimer.tsx`, `MentorDialog.tsx`, `src/components/ParticleBurst.tsx`, `AnimatedNumber.tsx`, `ForfeitModal.tsx`, and the match-rendering parts of `src/pages/Game.tsx` (HUD, top bar, EventPopup → outcome banner, notifications → toast queue, F.5 fix). Locale prefixes `game.*`, `econ.*`, `card.*`, `board.*`, `outcome.*`.
- **Agent 3**: `Game.tsx` `SetupScreen` + `ResultScreen` (coordinate: Agent 3 owns lines of those two functions; Helper B owns the rest of Game.tsx — Agent 3 extracts them first into `src/pages/game/SetupScreen.tsx` and `src/pages/game/ResultScreen.tsx` at the start of Phase 2 so there is no shared-file editing), `ResultModal.tsx`, `src/components/learning/*` (report, projection, library entry, concept sheet, `learning.css`), `src/pages/Library.tsx`, `src/pages/Campaign.tsx` + `src/components/campaign/*`, `src/pages/TutorialGame.tsx` + `src/components/tutorial/*`, `src/pages/Lobby.tsx`, `src/pages/MultiplayerGame.tsx` (non-board parts; board via Helper B's components), `src/components/game/RoomComms.tsx/.css`, `TutorialModal.tsx`, `/__ux` gallery content. Locale prefixes `result.*`, `report.*`, `library.*`, `campaign.*`, `tutorial.*`, `lobby.*`, `comms.*`, `setup.*`.
- Locale files are shared: each owner edits only its prefixes; merge conflicts resolved by Agent 3. New common keys (`common.*`) only by Agent 3.

**Phase 3 — Integration (Agent 3)**: remove legacy aliases and unused CSS/assets references, run full QA script §H on all viewports/langs, fix, run regression gates, `android:apk`.

### G.2 Inline style migration (~989 `style={{}}`)
- Convert (must): every inline style with a colour, font-family, font-size, font-weight, border-radius, box-shadow, background, z-index, or `position: fixed/absolute` layout in files touched → classes in the owning CSS file using tokens.
- May stay inline: truly dynamic values (computed widths/percentages for progress bars, transforms from layout math such as the desktop canvas scale, CSS custom-property injection like `style={{'--seat': color}}`, framer-motion `animate` props).
- Target: inline `style=` count in `src/` reduced by ≥ 70% (≤ 300); 0 inline `fontFamily`; 0 hex literals in `.tsx` except `Gullu.tsx` and the seat-colour constant array.
### G.3 Rules (enforced in review; Agent 4 greps)
1. No hex/rgb colour literal outside `src/styles/tokens.css`, `Gullu.tsx`, the seat palette constant. (`rgba(…)` only for overlays/shadows already defined as tokens.)
2. No font family other than the three tokens; no `@import` of fonts; no CDN URLs.
3. No `!important` in new CSS (except reduced-motion block).
4. Radii, spacing, z-index, durations only from tokens.
5. Every text string via i18n; no text inside images.
6. Every icon-only button has an `aria-label`; every new interactive ≥ 44×44.
7. One primary button per screen state.
8. No `backdrop-filter`, no `filter: blur`, no infinite animations in a match except the turn ring.
9. Reduced motion respected everywhere (CSS + framer).
10. Use `formatMoney` for every ₹ value displayed.

### G.4 Later (P2, not this cycle)
Menu dark mode; per-card illustrations / legendary foil shimmer; shortName rewrites for very long cards; streak flame animation; drag-to-play gesture; card deal sound design; deleting unused files in `public/avatars/` (after confirming no avatar images are used); skeletons for Leaderboard beyond basic; Lobby WhatsApp deep-link on web fallback polish.

---

## H. QA checklist for Agent 4

Viewports: 360×740, 390×844, 844×390, 768×1024, 1366×768, 1920×1080. Languages: en, hi, hinglish (switch via the language switcher, then also via `localStorage` reload). Run against `npm run build && npm run preview` (production) and `npm run dev` for `/__ux`.

Flows (each in en + hi at 390×844, plus en at 844×390 and 1366×768):
1. Landing → "Play free" → guest home → hero "How to play" → tutorial to the end → home.
2. Home → Practice → setup (2 bots) → draw → open each card type sheet → Save/Invest/Spend → targeting → equip shield → pass (confirm) → finish game (use dev shortcuts if any, else play) → result → Play again → Home.
3. Home → Campaign → Level 1 intro → Start → play to end → stars shown → campaign shows stars/unlock.
4. Library: empty state (fresh storage), after a game: unlocked tiles, filter chips, concept sheet open/close (back button too).
5. Mid-match resize/rotation (F.5) and Android back on: card sheet, outcome banner, pause menu, forfeit modal.
6. `/__ux`: Dashboard tabs, Lobby menu + waiting room, multiplayer board with comms dock, chat panel, report sheet, daily reward, delete account, all component states.

Checks (automate with puppeteer where possible):
- Console: 0 errors/warnings from app code; no failed requests.
- Overflow: `document.documentElement.scrollWidth <= clientWidth` on every screen/viewport (except the rival strip's own scroller with 4+ rivals).
- Fonts: `document.fonts.check('700 16px "Baloo 2"')` and `'400 16px Mukta'` true; in hi mode `[...document.fonts].some(f => f.family==='Mukta' && f.status==='loaded')` with Devanagari file requested; computed `font-family` of body starts with `Mukta`, h1 with `"Baloo 2"`; network shows **0 requests** to `fonts.googleapis.com`/`gstatic.com`; English pages request no `*-devanagari.woff2`; ₹ renders from `*-rupee.woff2`.
- Offline: load once, go offline (DevTools / `page.setOfflineMode(true)`), reload: fonts still Baloo/Mukta (PWA precache); in the APK (airplane mode) fonts render correctly (screenshot).
- No references: grep `src/` for `Outfit|Avengenz|Space Grotesk|Sora|Clash Display|Playfair|Plus Jakarta|Inter'` = 0; grep for `#E0E0F0` = 0; `!important` count in `index.css` ≤ 10.
- Text size: no visible text node with computed font-size < 12 px (scan all elements with text).
- Targets: every `button, a, [role=button], input, select` visible has rect ≥ 44×44 (or a hit-area pseudo-element; check with `elementFromPoint` at the 44 px box edges).
- Contrast: for text elements, compute contrast of color vs resolved background ≥ 4.5 (≥ 3 for ≥ 24 px or ≥ 18.66 px bold). Spot-check pairs in §B.4.
- Board ACs: E.12, E.13, E.14, E.23, E.24 (5 cards visible, ≥ 12 px names, one clock, no LanguageSwitcher in match, choice tiles visible without scroll).
- Copy: no occurrences in DOM (all langs) of: "Dominate", "BETTER LUCK", "Better luck", "Entry Reward", "$", "DC " as currency, "jackpot", "luck"; result headline correct per §E.20 table (test a grew-but-lost game).
- Hindi: no English UI labels in hi mode on board/result/campaign (names of players/cards with no Hindi data excluded); Devanagari body line-height ≥ 1.6; no uppercase transform on Devanagari.
- Reduced motion: with `prefers-reduced-motion: reduce` emulated and with the in-app toggle: no confetti canvas, no transform animations > 150 ms (check `getAnimations()`), roll-ups end immediately.
- Screen reader: hand cards have descriptive `aria-label`; sheets have `role=dialog` + label; live region announces net-worth changes and outcome titles; icon buttons named.
- Visual comparison: screenshot each mockup screen at the same viewport and compare side by side with the PNGs in `docs/ux/mockups/` — layout, hierarchy, colours, fonts must match; data/copy may differ. List deviations; ≥ 1 major deviation = fail.
- Raster: no rendered requests to `/avatars/{green,red,blue}*.webp`, `exit button.webp`, `gamelogbutton.webp`, `level bar.webp`, `coins bag.webp`, `image copy.webp`.
Regression gates (all must pass): `npx tsc --noEmit` (and `npm run build`), `npm test` (vitest), `npm run lint` with 0 errors, `npm run check:migrations`, `npm run android:apk` builds an APK.
Loop: Agent 4 reports failures with screenshot + selector + spec section; Agent 3 fixes; repeat until the whole checklist passes.
