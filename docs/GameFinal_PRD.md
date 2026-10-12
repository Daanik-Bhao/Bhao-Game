# Product Requirements Document (PRD): GameFinal (Paisa War)

## 1. Product Overview
GameFinal (Paisa War) is a turn-based multiplayer strategy card game designed for both mobile and desktop platforms. Players compete to accumulate wealth and reach a specific wealth goal while utilizing various cards to gain advantages, defend against attacks, or navigate game situations.

## 2. Target Audience
Gamers who enjoy strategy, resource management, and competitive multiplayer card games. 

## 3. Core Technologies
- **Frontend:** React, TypeScript, Vite
- **Backend & Database:** Supabase (PostgreSQL)
- **Real-time Sync:** Supabase Realtime / WebSockets
- **Styling:** Vanilla CSS, Framer Motion for animations
- **Localization:** i18next (English & Hindi support)

## 4. Key Features & Workflows

### 4.1 Authentication & User Management
- Users can sign up, log in, and manage their profiles.
- Handled securely via Supabase Auth.
- Tracks player stats, Daanik Coins, and current rank.

### 4.2 Game Lobby & Matchmaking
- Players can create new rooms or join existing ones.
- Displays list of available rooms.
- Real-time updates when players join/leave a waiting room.

### 4.3 Multiplayer Game Mechanics
- **Turn-based system:** Players take turns drawing and playing cards. Time limits are enforced per turn.
- **Card Types:**
  - *Action Cards:* Used to attack or gain an immediate advantage.
  - *Defense Cards:* Used to block or mitigate incoming attacks.
  - *Opportunity/Decision Cards:* Present choices to the player (e.g., Save, Spend, Invest).
  - *Situation Cards:* Apply board-wide effects.
- **Wealth Tracking:** The core objective is to reach a designated Wealth Goal. Wealth is updated in real-time as cards are played.
- **Card Actions:** Players can draw extra cards (by spending Daanik coins), target opponents, and make financial decisions based on card effects.

### 4.4 User Interface
- **Responsive Design:** Dedicated views for Mobile (`GameBoardMobile.tsx`) and Desktop (`GameBoardDesktop.tsx`).
- **Mobile Layout:** Features a horizontal scrollable row of opponents, a dynamic display area for the drawn/selected card, a 2x2 grid for the player's hand, and action buttons locked to the bottom.
- **Game Log:** A real-time running log of all actions taken in the game.

## 5. Non-Functional Requirements
- **Performance:** Fast, lightweight rendering with minimal layout shifts. Animations powered by Framer Motion.
- **Real-time Latency:** Must sync turns, card draws, and wealth updates instantly across clients.
- **Security:** Row Level Security (RLS) configured in Supabase to prevent cheating and unauthorized state modification.

## 6. Testing Requirements (For TestSprite)
- Ensure authentication flows work (Login/Signup).
- Verify real-time room creation and joining syncs properly.
- Test game logic: Turn progression, drawing cards, targeting opponents, and wealth math calculation.
- Test mobile vs. desktop responsiveness.
