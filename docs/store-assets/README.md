# Play Store graphics

All assets for the Google Play listing (see `docs/play-store.md` §7). Every screenshot is a real
screen of the app, rendered in headless Chrome from a production build (`vite preview`) or, for
screens that need an account / live room (leaderboard, multiplayer chat), from the dev-only
`/__ux` gallery, which renders the real components with mock data. The player is a guest
named "Asha"; other names are the generic bot / mock names (Rahul, Priya, Aman, Sneha).
Screenshots have no alpha channel (24-bit PNG).

## Store listing graphics

| File | Size | Format | Play Console slot |
|---|---|---|---|
| `icon-512.png` | 512 × 512 | 32-bit PNG with alpha, 29 KB | Main store listing → App icon |
| `feature-graphic-1024x500.png` | 1024 × 500 | 24-bit PNG, no alpha, 141 KB | Main store listing → Feature graphic |

The icon is the Android launcher art (`resources/icon-only.png`): the ₹ coin on the brand teal.
The feature graphic uses the app's tokens, fonts, wordmark, Gullu and three real cards
(Prepay or SIP, Phishing Scam shown as "Fake Message", Market Crash), with the tagline
"Money decisions. Real lessons." The logo and text sit inside the centre ~70%.

## Phone screenshots: 1080 × 1920 portrait (360 × 640 CSS px at 3×)

Upload `phone/en/` to the default (English) listing and `phone/hi/` to the Hindi (hi-IN)
translation. Slot: Main store listing → Phone screenshots (8 maximum). Upload them in this order.

| # | File | Screen |
|---|---|---|
| 1 | `01-board-decision.png` | Practice game, year 5–6, decision card sheet open (Spend / Save / Invest) |
| 2 | `02-scam-lesson.png` | Tutorial lesson 8: the "guaranteed" hot tip turns out to be a scam (Gullu explains it) |
| 3 | `03-campaign-map.png` | Artha Yatra campaign map with stars (5/12, 2 of 4 levels done) |
| 4 | `04-multiplayer-chat.png` | Multiplayer room chat: voice, poke, mute and report buttons, quick chat, safety line |
| 5 | `05-leaderboard.png` | Leaderboard (Best Wealth) |
| 6 | `06-result-win.png` | Result screen: "You won!", reached ₹50 L first, net-worth chart |
| 7 | `07-tutorial-hindi.png` | Tutorial in Hindi (en set: the Hindi intro; hi set: the "hot tip" life-event step) |
| 8 | `08-gyaan-library.png` | Gyaan Library (11/22 money ideas unlocked) |

All 16 files are 1080 × 1920, 3 channels, 100–265 KB each.

## Tablet screenshots (landscape, the wide desktop board layout)

| Folder | Size | Play Console slot |
|---|---|---|
| `tablet/7in/` | 1920 × 1200 (960 × 600 CSS px at 2×) | 7-inch tablet screenshots |
| `tablet/10in/` | 2560 × 1600 (1280 × 800 CSS px at 2×) | 10-inch tablet screenshots |

Each folder holds the same four screens: `01-board-decision.png` (decision card open: a bottom sheet
on 7", a side panel on 10"), `02-board.png` (the full wide board: money, investments, shields,
hand, standings, recent moves), `03-campaign-map.png` and `04-gyaan-library.png`. All are 3 channels.
