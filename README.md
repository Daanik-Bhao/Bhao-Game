<<<<<<< HEAD
# 💸 BHAO

**BHAO** is a fast-paced, competitive financial card game based on real Indian money decisions. 
Start with ₹5 Lakhs and race your opponents to reach **₹50 Lakhs** by making smart investments, dodging market crashes, and playing attack cards on your rivals!

---

## 🎯 Features

- **Real Indian Financial Scenarios:** Every card puts you in a situation you might face in real life (SIPs, EMIs, Tax Raids, IPOs).
- **Multiplayer & Single-player:** Play against smart AI bots locally, or join a multiplayer lobby to play with friends in real-time.
- **DAANIK Economy & Stock Market:** A fully deterministic in-game stock market that fluctuates based on time. Use your DAANIK coins to buy and sell stocks!
- **Attack & Defend:** Play Action cards to attack rivals with Tax Raids, Market Crashes, and UPI Frauds. Counter them with Defense cards.
- **Mogul Rank Ladder:** Play ranked matches and climb from Rookie to DAANIK Legend through 8 rank tiers. 
- **Engaging Visuals:** Features 3D card tilt effects, screen shake on damage, floating numbers, and a confetti celebration upon victory!

---

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Vanilla CSS, Framer Motion (for animations)
- **Backend & Database:** Supabase (PostgreSQL, Realtime, Auth, RPC)
- **Deployment:** Vercel (Frontend), Supabase (Database/Auth)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/SagarAgarwal2/paisawar.git
cd paisawar
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=            # optional, leave empty to disable Sentry
```
Without the Supabase values the app still runs in **offline guest mode** (tutorial, campaign and practice vs bots); online features are disabled.

### 4. Database Setup (Supabase)
Apply the SQL migrations in `supabase/migrations/` (in filename order) with the Supabase CLI:
```bash
npx supabase db push
```
or paste them into the Supabase SQL editor one by one. `20261012000000_delete_own_account.sql` adds the RPC behind the in-app "Delete my account" button.

### 5. Start the Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

---

## 🃏 How to Play

1. **The Goal:** Start with ₹5 Lakhs and be the first player to reach the **₹50 Lakhs** wealth goal, or have the most wealth when the **15-minute timer** runs out!
2. **Turn Phases:** 
   - **Draw Phase:** Draw cards until you have a full hand of 4.
   - **Play Phase:** Choose a card from your hand to play, or discard a defense card to pass your turn.
3. **Card Types:**
   - **🟢 Decision Cards:** Choose how to spend your money. You can *Spend*, *Save*, or *Invest*.
   - **🔴 Action Cards:** Attack your opponents (e.g., Tax Raid, Steal, Market Crash).
   - **🔵 Defense Cards:** Keep these in your hand to automatically protect yourself against incoming attacks (e.g., Health Insurance, Cyber Shield).
4. **Market & Coins:** Complete matches to earn DAANIK Coins. Visit the Dashboard to invest your coins into the DAANIK Market!

### Guest mode
Tap **Play as Guest** on the landing or sign-in page to play the tutorial, campaign and practice games without an account. Guest name and campaign progress live only in the browser's localStorage. Multiplayer, ranked play, leaderboards and coins need an account.

---

## 🌐 Deployment

This project is configured to be easily deployed on **Vercel**. 
Simply link your GitHub repository to Vercel, and it will automatically detect the Vite build settings. Remember to add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and (optionally) `VITE_SENTRY_DSN` to your Vercel Environment Variables before building!

### PWA / installable app
BHAO ships as a Progressive Web App (via `vite-plugin-pwa`): `npm run build` emits `manifest.webmanifest` and a service worker (`sw.js`) that precaches the app shell, auto-updates on new deploys, and caches `/avatars` images at runtime. Icons and the social preview image are generated from a vector ₹ coin:
```bash
node scripts/generate-icons.js
```

### Legal
`/privacy` and `/terms` are plain-language templates and **must be reviewed by a lawyer** before a wide public launch or app-store submission. Contact: support@daanik.com.

---

## 📜 License
This project is built for entertainment and financial literacy purposes.
=======
# Bhao-Game
>>>>>>> 485f329157967779332d893eff337d8a1d85b412
