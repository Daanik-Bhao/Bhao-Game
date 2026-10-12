# Artha Yatra — Game Logic Improvement Guide

> **Purpose:** This document is a working reference for improving the current card & level logic before commercial launch. Every section maps directly to an existing system in the codebase. Work through it top-to-bottom or jump to any section using the Table of Contents.

---

## Table of Contents

1. [Core Decision Engine](#1-core-decision-engine)
2. [investRisk — Replacing RNG with Skill](#2-investrisk--replacing-rng-with-skill)
3. [Debt System — Red Cards](#3-debt-system--red-cards)
4. [Level 1 — Desire Meter Fixes](#4-level-1--desire-meter-fixes)
5. [Level 2 — Saving Streak Fixes](#5-level-2--saving-streak-fixes)
6. [Level 3 — Lifestyle Creep Enhancements](#6-level-3--lifestyle-creep-enhancements)
7. [Level 4 — Complete Design (Grihastha Dharma)](#7-level-4--complete-design-grihastha-dharma)
8. [Game Economy & Inflation](#8-game-economy--inflation)
9. [Bot AI Improvements](#9-bot-ai-improvements)
10. [Retention Systems](#10-retention-systems)
11. [Exploit Patches](#11-exploit-patches)
12. [New Card Categories](#12-new-card-categories)
13. [Card Schema Reference](#13-card-schema-reference)
14. [Implementation Priority Checklist](#14-implementation-priority-checklist)

---

## 1. Core Decision Engine

### Current State
Every card resolves to a single three-way choice: **Spend → Save → Invest**. There is no hand management, no sequencing, no combo logic. A player who plays for 10 minutes has seen the entire decision space.

### Problem
This is a reaction loop, not a strategy loop. Players are not making decisions — they are answering a quiz. There is no planning horizon, no consequence chaining, and no reason to think more than one turn ahead.

### What to Build

#### 1.1 Hand System
Give players a hand of **3 cards** drawn at the start of each round. They must play one and discard one; the third carries forward.

```
Round Start:
  → Draw 3 cards from level deck
  → Player sees all 3 simultaneously
  → Player chooses: PLAY one, HOLD one, DISCARD one
  → Held card stays in hand next round (max 1 held card)
  → Discarded card goes to bottom of deck

Why this matters:
  - Forces trade-off between immediate best play and future setup
  - Teaches opportunity cost (choosing one thing = giving up another)
  - Creates planning 1-2 turns ahead without being overwhelming
```

#### 1.2 Card Combo Triggers
Some cards should reference each other's state. Define a `triggerCondition` field on cards (see Card Schema in Section 13).

**Examples:**

| Trigger Condition | Card | Bonus Effect |
|---|---|---|
| Saving Streak ≥ 3 | "Market Dip" event | Unlocks a bonus "Buy the Dip" action with 0% risk |
| Active Investments ≥ 2 | "Dividend Payout" | +8% bonus on all investments this round |
| Lifestyle Creep ≥ 40% | "Surprise Bonus" | Bonus is negated entirely (teaches: high spend = no resilience) |
| Emergency Fund ≥ 6 months | Any shock card | Auto-block triggers instead of penalty |
| Desire Meter ≥ 60 | "Friend's New iPhone" | Spend penalty doubles (peer pressure amplification) |

#### 1.3 Consequence Chaining
High-stakes cards should unlock follow-on decisions instead of resolving immediately.

```
Card: "Job Offer — Higher Salary, New City"
  First decision: Accept / Decline
    → If Accept:
        Second decision: Rent apartment (Spend) / Live with relatives (Save) / Negotiate joining bonus to invest (Invest)
        → Each second-level choice has different net worth impact
    → If Decline:
        Net worth unchanged, but unlock "Promotion Path" bonus card next round

Why this matters:
  Teaches that big financial decisions have downstream consequences,
  not just a single outcome value.
```

---

## 2. investRisk — Replacing RNG with Skill

### Current State
`investRisk` is a hidden percentage. The engine rolls against it. Players have no agency over the outcome.

### Problem
This teaches that investing is gambling. A player who makes an excellent, well-reasoned investment decision and loses due to a bad roll will associate investing with bad luck. This is **the most educationally harmful mechanic in the game** as currently designed.

### New investRisk Architecture

#### 2.1 Base Risk Values by Asset Type

```
Asset Type              Base investRisk    Real-world parallel
────────────────────────────────────────────────────────────────
Savings Account         0%                 Fixed deposit / savings
Debt Mutual Fund        8%                 Low-risk debt fund
Index Fund SIP          22%                Nifty 50 index
Equity Mutual Fund      35%                Actively managed fund
Direct Stock            52%                Single stock
Crypto / Speculative    75%                High-risk assets
```

#### 2.2 Player-Modifiable Risk Reducers

Players can reduce investRisk through active decisions. Stack modifiers:

```
Modifier                        Risk Reduction   How to earn
──────────────────────────────────────────────────────────────────────
Saving Streak ≥ 3               -10%             Maintain streak
Saving Streak ≥ 7               -18%             Extended streak
Research Action used            -15%             Spend 1 turn to research
Diversification (3+ asset types) -10%            Hold different assets
Emergency Fund ≥ 3 months       -5%              Prior save decisions
Financial Knowledge badge       -8%              Complete mini-quiz
────────────────────────────────────────────────────────────────────────
Maximum possible reduction:     -55%             (highly prepared player)

Example:
  Index Fund SIP base risk:     22%
  + Saving Streak 5:           -10%  →  12%
  + Research Action:           -15%  →   0% (guaranteed return)

  Teaches: informed + consistent investors don't gamble, they manage risk.
```

#### 2.3 Research Action
Add a new player action available once per round:

```
RESEARCH ACTION
─────────────────
Cost:    Skip your card play this turn (you draw but don't play)
Reward:  -15% investRisk on next Invest decision
Visual:  Show a "Reading Financial Reports" animation
Limit:   Once per round, cannot be used two turns in a row

Edge case: If player uses Research and then chooses Spend/Save (not Invest),
           the -15% modifier carries forward to the next Invest card only.
```

#### 2.4 Diversification Counter
Track how many distinct asset types the player holds:

```
diversificationBonus = {
  1 asset type:  +0% risk reduction
  2 asset types: +5% risk reduction
  3 asset types: +10% risk reduction
  4+ asset types: +12% risk reduction (capped)
}

Display: Small portfolio bar on HUD showing held asset types as coloured segments.
```

---

## 3. Debt System — Red Cards

### Current State
Debt does not exist. No credit cards, no EMIs, no loans, no BNPL.

### Problem
For the 18–28 demographic, debt traps are the primary financial danger. A financial education game that doesn't model debt is teaching people to swim in a pool, then sending them into the ocean.

### Red Card System Design

#### 3.1 What Red Cards Are
Red Cards are **debt instruments** that appear in the card pool from Level 2 onwards. They always offer a tempting immediate benefit with a hidden compounding cost.

```
RED CARD RULES:
  - Visually distinct: red border, ₹ symbol with downward arrow
  - Always optional (player can choose not to take the debt)
  - Debt compounds at a fixed rate each turn it is unpaid
  - Unpaid debt beyond 5 turns triggers a Credit Score Penalty debuff
  - Paying off debt in full gives a "Debt Free" XP bonus
```

#### 3.2 Red Card Examples

**Level 2 Red Cards**

```
Card: "BNPL Phone Upgrade"
─────────────────────────
Flavor: "Buy the ₹25,000 phone now. Pay later in 6 easy installments!"

Option A — Take the Debt:
  Immediate: Desire Meter -20 (satisfied), +₹25,000 asset (depreciating)
  Each turn unpaid: -₹1,800 interest drain from net worth
  After 6 turns: Total paid = ₹35,800 (₹10,800 extra for "convenience")
  Credit Score: -10 if any installment missed

Option B — Decline:
  No cost. Desire Meter +5 (mild frustration)
  Unlock "Disciplined Buyer" badge after declining 3 Red Cards total

Mentor Insight (shown after resolution):
  "BNPL products charge 24–36% effective annual interest.
   The phone costs ₹10,800 more than its sticker price."
```

```
Card: "Credit Card Cashback Trap"
─────────────────────────────────
Flavor: "Apply now! Get ₹2,000 cashback on first spend of ₹5,000."

Option A — Apply and spend:
  Immediate: +₹2,000 cashback received
  Hidden: ₹5,000 minimum spend committed
  If balance unpaid at month-end: 3.5%/month interest = 42% annual rate
  If only minimum payment made: Debt doubles in 26 turns

Option B — Decline:
  No effect.

Mentor Insight:
  "Credit cards are free money only if paid in full every month.
   The 3.5% monthly interest rate is 42% per year — far above any investment return."
```

**Level 3 Red Cards**

```
Card: "Car on EMI — Status Symbol"
───────────────────────────────────
Flavor: "Your colleague just bought a new car. ₹8L on road, ₹12,000 EMI/month."

Option A — Buy on EMI:
  Asset: +₹8,00,000 (depreciating 15%/year)
  Monthly drain: -₹12,000 from net worth every turn
  If Lifestyle Creep already ≥ 30%: EMI triggers additional +8% Creep
  Total interest paid over 5 years: ₹2.16L extra

Option B — Save for 12 turns, buy with cash:
  Net worth after 12 turns: ₹1.44L saved, invested at 8% = ₹1.56L
  Buy car: -₹8L. Net cost: ₹8L (no interest paid)
  Lifestyle Creep: unchanged

Option C — Invest instead, use public transport:
  ₹12,000/month invested at 12% for 5 years = ₹9.8L corpus
  No car asset, but significantly higher net worth

Mentor Insight:
  "EMI makes expensive things feel cheap by hiding the true cost in monthly amounts.
   The same ₹12,000/month invested builds ₹9.8L in 5 years."
```

#### 3.3 Credit Score System (Level 2 onwards)

```
CREDIT SCORE MECHANIC
─────────────────────────────────────────────────────
Starting Score:  750 (good)
Range:           300 (terrible) to 900 (excellent)

Score goes DOWN when:
  - Red Card debt goes unpaid for 3+ turns: -30 per turn
  - Any EMI missed: -50
  - Spending exceeds income for 2 consecutive turns: -20

Score goes UP when:
  - Red Card debt paid in full: +25
  - Saving Streak ≥ 5: +15
  - No debt held for 5 consecutive turns: +20

Score affects investRisk:
  Score 750–900:  -5% risk modifier (lenders trust you)
  Score 600–749:  No modifier
  Score 450–599:  +10% risk (poor credit = higher borrowing costs)
  Score < 450:    +25% risk + lock out of some investment cards

Display: Credit score gauge on HUD from Level 2 onwards.
```

---

## 4. Level 1 — Desire Meter Fixes

### Current Issues
- Threshold of 70 is arbitrary and invisible
- Punishment is sudden, not warned
- Reduction per Save is too fast (exploitable)
- "AI Boss Special Attack" is thematically disconnected from finance

### Fixed Desire Meter Logic

#### 4.1 Visual Zones

```
0–39:   Green zone    — "You're in control"
40–59:  Amber zone    — "Peer pressure rising"
60–69:  Red zone      — "Danger: one more Spend triggers a spiral"
70+:    Overflow      — "Peer Pressure Spiral" triggered

At 60+: Show a warning card BEFORE the player's next decision:
  "Your friends are heading to the mall. Your Desire Meter is high.
   The next Spend decision will trigger a Peer Pressure Spiral."
```

#### 4.2 Adjusted Meter Values

```
Current (broken):
  Spend  → +20 to meter
  Save   → -15 to meter
  Invest → -10 to meter

Fixed:
  Spend on low-value card (₹100–500)  → +8
  Spend on mid-value card (₹500–2000) → +15
  Spend on high-value card (₹2000+)   → +25
  Save                                → -5  (slow recovery, not instant fix)
  Invest                              → -3
  Complete a mini-quiz correctly       → -10 (knowledge as self-control)

Why: Spending should feel sticky. One Save should not undo three Spends.
     This models the psychological reality of impulsive habits.
```

#### 4.3 Willpower Token
Each Level 1 session, the player gets **1 Willpower Token**:

```
WILLPOWER TOKEN
───────────────
Use: Before resolving a Spend card, spend the token to "resist" it
     The card is declined, Desire Meter does not increase
     Player earns +50 XP for using the token wisely
Limit: 1 per level, cannot be refilled
Visual: Token displayed prominently in HUD — players feel the weight of using it
```

#### 4.4 Peer Pressure Spiral (replacing "Boss Special Attack")

```
PEER PRESSURE SPIRAL (triggered at Desire Meter ≥ 70)
────────────────────────────────────────────────────────
Effect: Player is forced to draw 2 Spend cards back-to-back
        Cannot choose Save or Invest for those 2 turns
        Net worth takes two direct hits
        Desire Meter resets to 50 after spiral completes

Narrative: "You've been swept up in social pressure.
            Your friends dragged you to a concert and then a restaurant.
            No savings this weekend."

Recovery path: Player must get 3 consecutive Save decisions
               to exit "recovery mode" and unlock Invest cards again.
```

---

## 5. Level 2 — Saving Streak Fixes

### Current Issues
- Streak resets to zero on one Spend decision
- Binary unlock (streak ≥ 3 = full bonus, else 0) is not motivating
- No protection against accidental loss

### Fixed Streak System

#### 5.1 Streak Shield

```
STREAK SHIELD
──────────────
A consumable protection item earned by completing educational mini-quizzes.

How to earn:
  - Complete a 3-question financial quiz after any card: +1 shield
  - Max shields held at once: 2

How to use:
  - When player chooses Spend on a card, automatically consumes 1 shield
  - Streak counter is preserved (streak does NOT break)
  - Player sees: "Your financial knowledge saved your streak!"

Without a shield:
  - Spend decision breaks the streak, counter resets to 0
  - Player must rebuild from 0
```

#### 5.2 Tiered Streak Multiplier (replace binary unlock)

```
Streak Count    Multiplier    Bonus Effect
──────────────────────────────────────────────────────
1–2             1.0x          No bonus
3–4             1.3x          investRisk -5%
5–6             1.6x          investRisk -10%, Boss cannot attack
7–9             1.9x          investRisk -15%, +10% save interest rate
10+             2.5x          investRisk -20%, Boss skips their turn

Why tiered: Players feel continuous progress, not cliff-edge unlock.
            Every save feels meaningful even at streak = 2.
```

#### 5.3 Subscription Trap Cards (Level 2 exclusive)

```
These cards model the most common college-age financial trap:
automatic recurring payments that drain accounts invisibly.

Card: "Free Trial — Auto Renews"
  Option A — Subscribe: -₹199/month every turn automatically (no reminder)
                         Player must actively notice and cancel
  Option B — Decline:   No effect
  Option C — Cancel existing sub (if held): +₹199/turn restored, +25 XP

Mechanic: Subscriptions are "passive drain" cards that stay in effect
          until explicitly cancelled. Player must use their card action to cancel.
          If 3 subscriptions accumulate simultaneously: -10% to Saving Streak multiplier.

Teaches: Subscription fatigue is a major wealth drain.
         Audit your recurring expenses regularly.
```

---

## 6. Level 3 — Lifestyle Creep Enhancements

### Current State
Lifestyle Creep is the best mechanic in the game. It needs to be richer, not replaced.

### Enhancements

#### 6.1 Creep Tiers with Visual Feedback

```
Creep %     HUD State       Passive Drain     Warning Text
─────────────────────────────────────────────────────────────────
0–19%       Normal          0%                —
20–39%      HUD yellows     1.5%/turn         "Lifestyle inflation beginning"
40–59%      HUD oranges     3.5%/turn         "Your expenses are eating your income"
60–79%      HUD turns red   6%/turn           "You are income-rich but wealth-poor"
80%+        HUD flashes     10%/turn          "Golden handcuffs: you need this salary just to survive"
```

#### 6.2 Creep Sources (what increases it)

```
Action                              Creep Increase
────────────────────────────────────────────────────
Spend on a Luxury card              +8%
Taking a Car EMI Red Card           +10%
Upgrading apartment (Rent card)     +12%
Subscribing to premium service      +3%
Buying branded items consecutively  +5% per consecutive buy

Creep Reducers:
  Choosing budget option             -5%
  Cancelling a subscription          -3%
  Choosing "Invest" over a Luxury    -4%
  Emergency Fund card played         -6%
```

#### 6.3 "Golden Handcuffs" Event
Triggered when Lifestyle Creep ≥ 70%:

```
GOLDEN HANDCUFFS EVENT
────────────────────────────────────────────────────────────────────
Trigger: Creep ≥ 70% for 3+ consecutive turns

Effect: Player is "locked in" — they cannot reduce their lifestyle
        without taking a temporary net worth hit.
        For the next 4 turns, any Spend card gives +2% Creep automatically
        (downward spiral mechanic).

Resolution:
  Option A — Accept lifestyle reset: take -₹2L net worth hit immediately,
             Creep drops to 30%. Models: downsizing, moving cities, etc.
  Option B — Keep earning more: unlock high-risk Invest cards with
             +15% return but +30% risk (chasing salary to maintain lifestyle)

Teaches: Lifestyle creep is a trap that becomes harder to escape over time.
         The best time to address it is early.
```

#### 6.4 Active Investment Conversion Mechanic (clarified)

The current doc mentions "converting income to Active Investments" but doesn't define it clearly. Here is the spec:

```
ACTIVE INVESTMENT SYSTEM
──────────────────────────────────────────────────────────────────────
Definition:
  "Active Investments" = portfolio of investment cards the player holds.
  Distinct from one-time invest decisions on decision cards.

How it works:
  When player chooses Invest on a card, the invested amount is added
  to their Active Investment portfolio.

  Each subsequent turn, the portfolio grows or declines:
    Growth = base_return_rate × (1 - current_investRisk_modifier)
    If Lifestyle Creep ≥ 50%: portfolio growth rate halved
    (models: less investable income due to high expenses)

Portfolio Display:
  Small bar chart on HUD showing: Savings | Investments | Debt
  Updates every turn. Makes compound growth visible in real time.
```

---

## 7. Level 4 — Complete Design (Grihastha Dharma)

> **Status: Must be built before launch.**

### Level Overview

```
Level 4: Grihastha Dharma
──────────────────────────
Ages:           28–38
Theme:          Risk Mitigation, Family Protection, Wealth Building
Card IDs:       dc_s-059 through dc_s-083 (25 cards)
Financial Scale: ₹Multi-Lakhs to ₹Crores
New Mechanics:  Emergency Fund Blocks, Insurance Cards, Tax Optimisation
```

### 7.1 Emergency Fund Block Mechanic (full spec)

```
EMERGENCY FUND BLOCK
─────────────────────────────────────────────────────────────────────
Build phase:
  Certain cards allow investment in "Emergency Fund" (separate from portfolio).
  Target: 6 months of expense coverage.
  At L3/L4 scale: ₹3,00,000–₹6,00,000 fund.

Block mechanic:
  When a Shock Card is drawn (see 7.3), the game checks:
    emergencyFundMonths = emergencyFundAmount / monthlyExpenses

  emergencyFundMonths ≥ 6: Full Block — shock dealt 0 damage
  emergencyFundMonths 3–5: Partial Block — shock damage reduced by 60%
  emergencyFundMonths 1–2: Minimal Block — shock damage reduced by 20%
  emergencyFundMonths = 0: No Block — full shock damage applied

Visual: Shield icon on HUD with fill level (empty → full).
        Fills up as player makes emergency fund decisions.
        Cracks appear when blocks are used (fund is depleted by shocks).
```

### 7.2 Insurance Card System

```
INSURANCE CARDS (new card type, Level 4)
──────────────────────────────────────────────────────────────────────
Types:
  Term Insurance:
    Cost: -₹15,000/year (small recurring drain)
    Effect: If "Job Loss" shock card drawn → net worth protected for 12 turns
    No payout: Considered a "waste" by some players → teach sunk cost fallacy

  Health Insurance:
    Cost: -₹20,000/year
    Effect: "Medical Emergency" shock cards → 80% cost absorbed by insurance

  Home Insurance:
    Cost: -₹8,000/year
    Effect: "Natural Disaster" shock card → property damage absorbed

Trap card:
  "Insurance Misselling" Red Card:
    A bot or event offers unnecessary insurance with high premium.
    Player must evaluate: Do I need this? What does it actually cover?
    Wrong choice: -₹80,000 in premiums for a product with no real benefit.
```

### 7.3 Shock Deck (Level 4)

A **separate 15-card deck** drawn randomly 1–2 times per level. Cannot be avoided, only mitigated.

```
Card ID    Shock Event                  Base Damage        Blocked By
─────────────────────────────────────────────────────────────────────────────
shk-001    Medical Emergency            -₹3,00,000         Health Insurance
shk-002    Job Loss (3 turns no income) -₹1,80,000 equiv.  Term Insurance
shk-003    Market Crash (-30%)          -30% portfolio      Debt fund diversification
shk-004    Parent's Medical Expense     -₹1,50,000         Emergency Fund
shk-005    Car Accident                 -₹80,000           Motor Insurance
shk-006    Roof Collapse / Repair       -₹1,20,000         Home Insurance / E-Fund
shk-007    Family Loan Request          -₹2,00,000         Player choice (no block)
shk-008    Business Failure (if chosen) -50% invested amt   Diversification
shk-009    Legal Dispute               -₹1,00,000          Legal fund / E-Fund
shk-010    Natural Disaster            -₹2,50,000          Home Insurance
shk-011    Interest Rate Hike (+2%)     EMI cost increases  Fixed rate loan card
shk-012    Inflation Spike              Real value -15%     Equity investments
shk-013    Layoff (company downsizing)  No income 2 turns   Emergency Fund
shk-014    Child's School Fee Hike      -₹60,000/year       Education fund card
shk-015    Elderly Parent Care          -₹40,000/turn       Family planning card
```

### 7.4 Level 4 Card Set — 25 Cards

```
DECISION CARDS (dc_s-059 to dc_s-083)

ID          Card Name                       Core Decision
────────────────────────────────────────────────────────────────────────────────
dc_s-059    Home Loan — 80% LTV             Rent vs. Buy vs. Buy smaller house
dc_s-060    Prepay EMI or Invest?           Prepay home loan vs. SIP in equity
dc_s-061    Term Insurance Purchase         Buy term vs. skip vs. buy ULIP (trap)
dc_s-062    Health Insurance — Family Plan  Self only vs. family floater vs. none
dc_s-063    Emergency Fund — Start Now      Contribute 10% income vs. invest instead
dc_s-064    Children's Education Fund       Start SIP now vs. wait vs. spend today
dc_s-065    NPS Contribution                Invest in NPS vs. PPF vs. equity
dc_s-066    Stock Options (ESOP)            Hold vs. vest and sell vs. diversify
dc_s-067    Side Income Opportunity         Invest time in startup vs. stay stable
dc_s-068    Market Crash — Stay or Exit?    Hold investments vs. sell in panic
dc_s-069    Inheritance — Windfall          Invest vs. spend vs. pay off debt
dc_s-070    Joint Home Loan with Spouse     Take it vs. single applicant vs. rent
dc_s-071    Early Retirement Math           FIRE calculation decision card
dc_s-072    Gold — Physical vs. SGB         Allocate to gold or skip
dc_s-073    Tax Planning — Section 80C      Maximize deductions vs. ignore
dc_s-074    Business Idea — Quit Job?       Start business vs. moonlight vs. stay
dc_s-075    Credit Score — Repair Action    Pay off old debt vs. ignore
dc_s-076    Portfolio Rebalancing           Rebalance or ride momentum
dc_s-077    Salary Hike — Upgrade Lifestyle? Keep lifestyle flat vs. inflate
dc_s-078    Retirement Corpus Calculation   Start planning now vs. "I'm young"
dc_s-079    Parent's Retirement Support     Contribute to parents vs. invest for self
dc_s-080    Real Estate Investment          Buy second property vs. equity SIP
dc_s-081    Will and Nomination Update      Do it now vs. "I'll do it later"
dc_s-082    Angel Investment Opportunity    Invest ₹5L in startup vs. safer option
dc_s-083    Child's Health Emergency        Use insurance vs. use emergency fund
```

### 7.5 Level 4 Mechanic — "Corpus Clock"

```
CORPUS CLOCK
─────────────────────────────────────────────────────────────────────
A new HUD element at Level 4 only.

Shows: Projected retirement corpus at current saving/investing rate,
       compared to the target corpus needed for retirement at 60.

Updates: Every turn, in real time.

Below target: Clock shown in red, ticking down. Creates urgency.
On target:    Clock shown in green, counting up to retirement milestone.
Above target: "Early retirement possible!" message unlocks FIRE cards.

Why: Makes the abstract concept of retirement savings viscerally real.
     Players can see exactly what each decision costs in retirement years.
```

---

## 8. Game Economy & Inflation

### 8.1 Inflation Tick (Level 3 onwards)

```
INFLATION MECHANIC
─────────────────────────────────────────────────────────────────────
From Level 3, apply an inflation tick each round:

  Inflation Rate: 6% per year (modelled as ~0.5% per turn)

  Effect on different asset types:
    Cash / Savings Account (4% return):
      Nominal value: grows at 4%
      Real value:    shrinks at -2% (inflation adjusted)
      HUD shows BOTH values, clearly labelled

    Fixed Deposit (6.5% return):
      Nominal: +6.5%
      Real:    +0.5% (barely beating inflation)

    Equity / Index Fund (12% return):
      Nominal: +12%
      Real:    +6% (strong inflation-beating return)

    Cash under mattress (0% return):
      Nominal: unchanged
      Real:    -6% (losing purchasing power visibly each turn)

Display: Dual-line net worth graph — "Nominal Net Worth" (solid) vs
         "Real Net Worth" (dashed). Gap widens visually over time.

Teaches: Saving in low-return instruments is a guaranteed slow loss.
         Only equity beats inflation significantly over time.
```

### 8.2 Savings Cap (exploit prevention)

```
SAVINGS CAP
───────────────────────────────────────────────────────────────────
Problem: Players can always choose Save and trivially win.

Fix: Diminishing returns on consecutive saves.

  Save streak 1–3:    Full save bonus applied
  Save streak 4–5:    Save bonus at 70% (mild diminishment)
  Save streak 6–7:    Save bonus at 50%
  Save streak 8+:     Save bonus at 30% + inflation starts eroding it
                       + Mentor hint: "Your money is idle. Consider investing."

Why: Forces players out of "always save" comfort zone.
     Models real-world truth: pure saving underperforms over time.
```

### 8.3 Income Scaling Table

```
Level    Age Range    Starting Income/Turn    Scale of Financial Decisions
──────────────────────────────────────────────────────────────────────────
L1       13–18        ₹500–2,000 allowance    ₹100–5,000 decisions
L2       18–22        ₹2,000–8,000 stipend    ₹1,000–30,000 decisions
L3       22–28        ₹30,000–80,000 salary   ₹10,000–5,00,000 decisions
L4       28–38        ₹80,000–3,00,000 salary ₹50,000–2,00,00,000 decisions
```

---

## 9. Bot AI Improvements

### Current Issue
Hard bots "aggressively invest always" — exploitable because they'll take predictable losses on bad rolls.

### Fixed Bot Decision Logic

#### 9.1 Bot Personality System

```
Bot Type        Level Used    Decision Logic
────────────────────────────────────────────────────────────────────────────
The Spender     L1 (Easy)     70% Spend, 20% Save, 10% Invest
                              Naturally poor. Player's learning foil.

The Saver       L2 (Med)      10% Spend, 70% Save, 20% Invest
                              Slow steady growth. Consistent competition.

The Analyst     L3–L4 (Hard)  15% Spend, 25% Save, 60% Invest
                              BUT: will not invest if investRisk > 45%
                              Uses Research Action when risk is high
                              Diversifies across 3+ asset types

The Gambler     L3 variant    5% Spend, 10% Save, 85% Invest
                              Ignores risk modifiers. Sometimes wins big,
                              sometimes collapses. Shows players the
                              volatility of undiversified speculation.

The Planner     L4 exclusive  Builds Emergency Fund before investing
                              Buys insurance. Takes no Red Card debt.
                              Models "perfect" financial behaviour for comparison.
```

#### 9.2 Bot Memory System

```
Bots should track their own state and adapt:

  if (bot.lifestyleCreep > 50):
    → shift decision weights toward Save/Invest
    → avoid Luxury cards for next 3 turns

  if (bot.savingStreak >= 5):
    → increase Invest weight by 20%
    → take Research Action before next Invest card

  if (bot.emergencyFundMonths < 3):
    → prioritise Emergency Fund cards over pure investment

Why: Removes exploitable predictability.
     Bots that adapt to their own financial state teach players
     to do the same.
```

---

## 10. Retention Systems

### 10.1 Daily Dilemma

```
DAILY DILEMMA SYSTEM
──────────────────────────────────────────────────────────────────────
Format: One real-world inspired financial scenario per day.
        Drawn from recent financial events, RBI decisions, budget news.

Examples:
  "RBI raised repo rate to 6.75% today. What do you do with your FD?"
  "Budget 2025: LTCG tax raised to 12.5%. Rebalance or hold?"
  "Sensex down 8% this week. Your SIP is in loss. Continue or stop?"

Structure:
  - 3 decision cards (Spend/Save/Invest variants relevant to the scenario)
  - 2-minute play session maximum
  - Reward: 200 XP + 1 Financial Insight collectible

Retention hook: Resets at midnight IST. Miss a day = lose streak bonus.
                Streak of 7 days: unlock special "Market Expert" card in main game.
```

### 10.2 Financial Wisdom Library

```
MENTOR INSIGHT COLLECTION
──────────────────────────────────────────────────────────────────────
Every card outcome shows a 2-sentence Mentor Insight.
These are saved automatically to the player's "Wisdom Library."

Display: Accessible from main menu as "My Financial Learnings"
Purpose: Gives players a tangible, growing asset from playing.
         Can be shared on WhatsApp as image cards.

Example entries:
  💡 "Rupee-Cost Averaging: Investing fixed amounts regularly
      means you buy more units when prices fall and fewer when they rise.
      Over time, your average cost is always below the peak."

  💡 "The 50-30-20 Rule: 50% of income on needs, 30% on wants,
      20% on savings and investments. Simple. Rarely followed."

  💡 "Emergency fund first, investing second. Without a financial
      buffer, one bad event forces you to sell investments at a loss."
```

### 10.3 Net Worth Share Card

```
END-OF-LEVEL SHARE CARD
──────────────────────────────────────────────────────────────────────
At the end of each level, generate a shareable image card showing:

  [Artha Yatra logo]
  "I completed Aarambh Grihastha at age 28"
  Final Net Worth: ₹24,50,000
  Best Decision: "Chose index SIP over car EMI — saved ₹9.8L"
  Mistakes Made: 3
  [Personalized tagline based on playstyle]

Share to: WhatsApp, Instagram Story, LinkedIn (for older players)

Why: Organic user acquisition. Players who share bring new players.
     Financial achievement = social status signal in Indian context.
```

---

## 11. Exploit Patches

### 11.1 Always-Save Exploit
**Problem:** Save is always safe, so rational players never invest.
**Fix:** See Section 8.2 — Savings Cap with diminishing returns.

### 11.2 Desire Meter Oscillation Exploit
**Problem:** Player inflates meter to 65, chains 3 saves to drop it, repeats forever.
**Fix:** Save only reduces meter by 5 (not 15). Meter decay is non-linear — harder to reduce above 50.

### 11.3 Bot Timing Exploit (Hard bots)
**Problem:** Hard bots always invest → predictable losses → player times safe-save rounds to coincide with bot failures.
**Fix:** See Section 9 — Analyst bot evaluates risk before investing. Not predictably aggressive.

### 11.4 Runaway Leader Problem
**Problem:** Early corpus lead compounds faster — game decided by turn 8.
**Fix:**

```
MARKET CORRECTION EVENT
──────────────────────────────────────────────────────────────────────
Triggered: Twice per level, at fixed turn numbers (turn 10 and turn 18)
Effect:    Proportional wealth reduction applied to ALL players
           Leader takes the largest hit. Trailer takes the smallest.

Formula:
  correctionAmount = (playerNetWorth / maxPlayerNetWorth) × 0.15
  Each player loses: correctionAmount × their net worth

Example at turn 10:
  Player A: ₹5,00,000 → loses 15% → ₹4,25,000
  Player B: ₹3,00,000 → loses 9%  → ₹2,73,000
  Player C: ₹1,50,000 → loses 4.5% → ₹1,43,250

Gap narrows without punishing skill.
Models: Market cycles and bear markets affect all investors.
Teaches: Never time the market. Stay invested through corrections.
```

### 11.5 Level 2 Streak Shield Abuse
**Problem:** If quizzes are too easy, players farm unlimited shields.
**Fix:**

```
Shield limits:
  Max shields held: 2 at any time
  Quiz cooldown: 1 quiz per 2 turns (not spammable)
  Quiz difficulty scales with level progression:
    Early L2 turns: 1-answer questions
    Later L2 turns: multi-step calculation questions
    Shields earned per quiz: always 1 (no bonus shields)
```

---

## 12. New Card Categories

### 12.1 Opportunity Cards (Green Cards)

```
GREEN CARDS — Time-sensitive opportunities
────────────────────────────────────────────────────────────────────
These are positive events that require active action to capture.
If player doesn't act (chooses no action / wrong action), opportunity passes.

Examples:
  "Bonus Declared — 2 months salary"
    Act: Invest immediately → +2x return (first-mover advantage)
    Wait: Invest next turn → +1x return only
    Spend: Immediately consumed, no wealth gain

  "Friend's Startup — Early Investment"
    Invest ₹1L: 40% chance → 5x return, 60% chance → total loss
    No invest: Opportunity gone
    Teaches: High risk = high reward, but concentrated bets are dangerous

  "Tax Deadline — Invest in ELSS to Save Tax"
    Invest before deadline: ₹1.5L tax deduction under 80C
    Miss deadline: Full tax applicable, permanent loss
    Teaches: Tax planning is time-sensitive and financially significant
```

### 12.2 Event Cards (drawn separately from decision deck)

```
MARKET EVENT CARDS (affect all players)
────────────────────────────────────────────────────────────────────
"Bull Market" (positive):
  All equity investments +15% this turn
  Dividend Payout: All players with mutual funds receive ₹X

"Bear Market" (negative):
  All equity investments -20% this turn
  Players with Emergency Fund: no panic-sell forced
  Players without: must sell one investment at a loss (forced liquidation)

"Budget Announcement":
  New tax rule announced — affects all investment decisions this turn
  Players who read the Budget card first get a 1-turn advantage

"Festive Season" (context-dependent):
  Spend decisions give +5% cashback
  But also: 3 extra Desire Meter on all Spend decisions
  Desire Meter is harder to control during Diwali/Holi spending
```

### 12.3 Life Goal Cards

```
LIFE GOAL CARDS (player-chosen objectives)
────────────────────────────────────────────────────────────────────
At the start of each level, player chooses 1 Life Goal card:
  "Buy a home by age 30"
  "Reach ₹1 Crore corpus by 35"
  "Retire by 50 — FIRE goal"
  "Fund child's education abroad"

Each goal has specific milestone checkpoints.
Achieving milestones → large XP bonuses + narrative flavour text.
Failing milestones → no punishment, but shows the gap clearly.

Why: Personalises the game. Players are not just optimising abstract numbers —
     they are pursuing a life they chose. This creates emotional investment.
```

---

## 13. Card Schema Reference

Full JSON schema for all card types. Use this as your data model.

```json
{
  "id": "dc_s-067",
  "level": 3,
  "type": "decision",
  "category": "income",
  "title": "Side Income Opportunity",
  "flavor": "A friend wants you to co-found a startup. It's exciting, but risky.",
  "financialScale": "₹Lakhs",
  "triggerCondition": null,
  "comboWith": ["dc_s-074"],

  "options": [
    {
      "type": "spend",
      "label": "Quit job, go full-time",
      "immediateEffect": {
        "netWorthDelta": -200000,
        "lifestyleCreepDelta": 0,
        "desireMeterDelta": -10
      },
      "investRisk": 65,
      "successEffect": { "netWorthDelta": 1500000 },
      "failEffect": { "netWorthDelta": -500000 },
      "riskModifiers": ["diversification", "researchAction", "savingStreak"]
    },
    {
      "type": "save",
      "label": "Stay at job, decline",
      "immediateEffect": {
        "netWorthDelta": 0,
        "lifestyleCreepDelta": -2
      },
      "investRisk": 0,
      "successEffect": { "netWorthDelta": 5000 }
    },
    {
      "type": "invest",
      "label": "Moonlight — keep job, invest evenings",
      "immediateEffect": {
        "netWorthDelta": -50000,
        "actionCost": "researchAction"
      },
      "investRisk": 30,
      "successEffect": { "netWorthDelta": 300000 },
      "failEffect": { "netWorthDelta": -50000 }
    }
  ],

  "mentorInsight": "Moonlighting reduces risk by keeping salary income stable while testing a business idea. Most successful founders validated their idea on the side before quitting.",
  "wisdomTag": "entrepreneurship",
  "xpReward": 150,
  "unlocks": null
}
```

```json
{
  "id": "shk-001",
  "type": "shock",
  "title": "Medical Emergency",
  "flavor": "Your spouse is hospitalised. Bills arrive immediately.",
  "baseDamage": 300000,
  "blockConditions": [
    { "condition": "healthInsuranceHeld", "damageReduction": 0.80 },
    { "condition": "emergencyFundMonths >= 3", "damageReduction": 0.60 },
    { "condition": "emergencyFundMonths >= 6", "damageReduction": 1.00 }
  ],
  "mentorInsight": "A single hospitalisation can cost ₹3–10 lakhs without insurance. A ₹20,000/year family floater plan is the highest-ROI financial product most Indians ignore.",
  "xpReward": 200
}
```

```json
{
  "id": "rc_s-003",
  "type": "red",
  "title": "Car on EMI — Status Symbol",
  "flavor": "Your colleague just bought a new car. ₹8L on-road, ₹12,000 EMI/month.",
  "debtAmount": 800000,
  "interestRate": 0.085,
  "tenorMonths": 60,
  "totalInterestPaid": 216000,
  "immediateGratification": {
    "desireMeterDelta": -25,
    "lifestyleCreepDelta": 10
  },
  "ongoingEffect": {
    "netWorthDrainPerTurn": 12000,
    "lifestyleCreepDelta": 0
  },
  "creditScoreEffect": {
    "onTime": +5,
    "onMiss": -50
  },
  "mentorInsight": "₹12,000/month in an equity SIP for 5 years = ₹9.8 lakhs corpus. The same money spent on a car EMI = ₹7.16 lakhs total outflow for a depreciating asset.",
  "xpRewardOnFullRepayment": 300
}
```

---

## 14. Implementation Priority Checklist

Use this as your sprint planning reference. Items marked 🔴 are launch blockers.

### Phase 1 — Foundation (build before anything else)

- [ ] 🔴 Complete Level 4 card set (25 cards, see Section 7.4)
- [ ] 🔴 Replace investRisk RNG with player-modifiable system (Section 2)
- [ ] 🔴 Implement Red Card / Debt system (Section 3)
- [ ] 🔴 Add Research Action mechanic (Section 2.3)
- [ ] 🔴 Fix Desire Meter — visual zones + adjusted values (Section 4.1–4.2)
- [ ] 🔴 Replace Saving Streak hard reset with Streak Shield (Section 5.1)
- [ ] 🔴 Add Savings Cap diminishing returns (Section 8.2)
- [ ] 🔴 Implement post-card Mentor Insight feedback (Section 10.2)
- [ ] 🔴 Define multiplayer round rules (simultaneous reveal)
- [ ] 🔴 Implement Guru Mode onboarding (guided first 5 cards)

### Phase 2 — Depth (v1.1, within 3 months of launch)

- [ ] 🟡 Inflation tick mechanic from Level 3 (Section 8.1)
- [ ] 🟡 Life Event Shock Deck — 15 cards (Section 7.3)
- [ ] 🟡 Hand system — 3 cards drawn, 1 held (Section 1.1)
- [ ] 🟡 Card combo trigger conditions (Section 1.2)
- [ ] 🟡 Credit Score system (Section 3.3)
- [ ] 🟡 Corpus Clock HUD element at L4 (Section 7.5)
- [ ] 🟡 Market Correction catch-up event (Section 11.4)
- [ ] 🟡 Bot personality system with 5 types (Section 9.1)
- [ ] 🟡 Bot memory/adaptation system (Section 9.2)
- [ ] 🟡 Daily Dilemma retention system (Section 10.1)

### Phase 3 — Polish and Social (v2.0)

- [ ] 🟢 Net Worth Share Card generator (Section 10.3)
- [ ] 🟢 Life Goal card system (Section 12.3)
- [ ] 🟢 Seasonal event cards (Budget, Diwali, Tax Season)
- [ ] 🟢 Golden Handcuffs event (Section 6.3)
- [ ] 🟢 FIRE / Early Retirement path unlocks
- [ ] 🟢 Financial Wisdom Library collectible UI
- [ ] 🟢 NISM-aligned mini-certification quiz path
- [ ] 🟢 Level 5 design (Vanaprastha, Ages 38–55, NPS/retirement)
- [ ] 🟢 Regional language support (Hindi, Kannada minimum)

---

> **Document version:** 1.0
> **Last updated:** June 2026
> **Next review:** After Phase 1 completion
>
> *All card IDs, financial amounts, and risk values in this document are design targets. Adjust after playtesting with real users in the 13–35 age bracket. Prioritise data from 18–25 year olds — they are the primary addressable market and the most financially under-served demographic in India.*