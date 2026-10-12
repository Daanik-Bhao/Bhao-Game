Decision Card Balancing Plan (V3)

You raised two excellent questions about how this will actually feel for the user and whether it requires massive rewrites to the cards. Here are the answers:

1. Do we need to change or add new cards for Lifestyle?
NO, we don't! We can build this cleanly into the game engine so you don't have to rewrite the 100+ existing cards. 

Instead of locking cards, Lifestyle Tier acts as a Multiplier for your investments. When a player clicks "Invest", the game engine checks their Lifestyle Tier before calculating the money:
  Tier 1 (Frugal): 0.75x Multiplier. (You get lower returns because you don't have access to premium brokers or VIP networks).
  Tier 2 (Comfortable): 1.0x Multiplier. (Normal returns as printed on the card).
  Tier 3 (Luxury): 1.5x Multiplier. (Massive returns because you have high-society access).

This means the existing cards stay exactly the same, but the math changes dynamically behind the scenes! (Of course, you can always add custom "Luxury Only" cards in the future if you want to expand the game).

2. What are the "Cons" (Drawbacks) for the user?
These new features introduce heavy strategic penalties if the user plays poorly:

  The Con of Stress (Burnout): If a user gets greedy and just spams Save and Invest over and over, their Stress will hit 3. The penalty is severe: They will suffer a "Burnout" event that instantly deducts 20% of their total wealth. They must manage this.
  
  The Con of Lifestyle (Upkeep): To reach Tier 3 Luxury, the user is forced to choose Spend at least 3 or 4 times. The penalty: Every time you click Spend, you take an immediate, guaranteed wealth loss. The user is sacrificing their short-term cash hoping that the long-term Tier 3 multipliers pay off. 
  
  The Con of Investing (High Risk): Right now, investing is too safe. We are increasing the failure rate to 30%. The con is that 1 out of every 3 investments will blow up in their face and trigger the failEffect (losing money instead of gaining it).
  
  The Con of Saving (Broken Streaks): Saving gives you a massive compounding bonus, but the moment you get greedy and try to Invest, or if you are forced to Spend to relieve stress, your Saving Streak resets to 0 and you lose your bonus multiplier.

Summary of Player Choice
With these changes, every decision card forces a tough choice:
"Do I Save to build my safe streak? Do I Invest to try and get rich quick, knowing there's a 30% chance I lose it all? Or do I Spend because my Stress is too high and I want to level up my Lifestyle, even though it costs me money right now?"

If this perfectly answers your concerns, click Proceed and I will finish updating the engine and UI!

Decision Card Balancing Plan (V2)

Based on your feedback, we need a bulletproof mechanic that strictly forces players to weave Spend into their strategy, rather than just relying on Save and Invest. 

To accomplish this, we will introduce a global "Stress Meter" (or Desire Meter) that players must manage.

Proposed Mechanics

1. The "Stress & Burnout" Mechanic (Forcing the 'Spend' Choice)
  The Problem: Players will never choose Spend if it only has a negative wealth impact.
  The Solution: We introduce a stressLevel to every player (from 0 to 3).
  Every time a player chooses Invest or Save, their stressLevel increases by 1.
  If stressLevel reaches 3 (MAX), they suffer a Burnout Breakdown. This triggers a massive, unblockable penalty (e.g., 20% wealth due to medical bills or a massive impulse purchase) AND they skip their next turn.
  How to prevent Burnout? Choosing Spend (treating yourself) resets your stressLevel back to 0. 
  The Result: Players must periodically choose the lesser evil (Spend) to relieve stress, preventing the devastating Burnout penalty. 

(Optional Bonus for Spend: We can still keep the "Draw 1 Card" utility on top of resetting stress, so it feels tactically rewarding rather than just a punishment avoidance).

2. Increase 'Invest' Risk
We will run a script across all cards to increase investRisk universally to 25% to 40%. This turns Invest into a true gamble, meaning it cannot be spammed safely.

3. Buff 'Save' (The Consistency Multiplier)
We will add savingStreak: number to the player.
Every consecutive Save increases the streak. (Choosing Spend/Invest resets it).
We will boost the passive bonus: Each active streak stack adds an additional +5% bonus to your base Save wealth gains. Building a long saving habit will snowball into massive, safe returns.

Verification Plan
1. Update types/game.ts to include stressLevel: number and savingStreak: number in PlayerState.
2. Update gameEngine.ts inside processDecision:
   If choice is Save/Invest: increment stressLevel. Check for Burnout (apply penalty if MAX).
   If choice is Spend: reset stressLevel = 0.
   Apply savingStreak logic.
3. Update the frontend UI in GameBoardDesktop.tsx and Mobile to visually display the Stress Meter so players know when they are about to burn out.
4. Run background script to bump Invest risks.
