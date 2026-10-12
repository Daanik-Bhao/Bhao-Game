# Paisa War: Artha Yatra

## Implementation Plan for First 3 Levels

---

# 1. Core Concept

**Paisa War: Artha Yatra** is a financial literacy game mode inspired by Indian life stages, Navagraha symbolism, and real-life money decisions.

The player moves through life stages and learns one major financial skill at each level.

## Learning Path

```text
Spending Control → Saving → Investing → Risk → Compounding → Assets → Debt → Financial Freedom
```

This document covers the first 3 levels:

| Level   | Life Stage        |   Age | Planet Hurdle | Main Learning    |
| ------- | ----------------- | ----: | ------------- | ---------------- |
| Level 1 | Brahmacharya      | 13–18 | Chandra       | Spending Control |
| Level 2 | Vidyarthi to Yuva | 18–22 | Budh          | Saving           |
| Level 3 | Aarambh Grihastha | 22–28 | Surya         | Investing        |

---

# 2. Global Level Rules

These rules should apply to all 3 levels.

## Basic Turn Flow

```text
Start Turn
→ Draw 1 Situation Card
→ Player chooses SAVE / INVEST / SPEND
→ Apply effect
→ Player may play 1 Action / Defense / Wild Card
→ Check milestone
→ Check win/loss condition
→ Next turn
```

## Basic Player Stats

Each player should have:

```text
corpus
handCards
activeEffects
completedMilestones
currentLevel
financialScore
learningBadges
```

## Core Choice System

Every Situation Card gives the player 3 choices:

| Choice | Meaning                                                          |
| ------ | ---------------------------------------------------------------- |
| SAVE   | Safe decision. Usually gives small gain or avoids loss.          |
| INVEST | Growth decision. Gives higher reward but may have delay or risk. |
| SPEND  | Lifestyle decision. Usually reduces corpus or creates penalty.   |

## Recommended Starting Corpus

For digital gameplay, use higher values than the physical card game so the game feels exciting.

| Level   | Starting Corpus | Target Corpus |
| ------- | --------------: | ------------: |
| Level 1 |       ₹5,00,000 |    ₹15,00,000 |
| Level 2 |       ₹7,00,000 |    ₹25,00,000 |
| Level 3 |      ₹10,00,000 |    ₹50,00,000 |

## Level Completion Stars

| Stars   | Condition                                                                 |
| ------- | ------------------------------------------------------------------------- |
| 3 Stars | Complete level before 70% of turn limit and make strong financial choices |
| 2 Stars | Complete level normally                                                   |
| 1 Star  | Complete level near the end or with too many bad choices                  |

## Financial Score Formula

```text
financialScore =
  corpus
  + savingsBonus
  + investmentBonus
  + protectionBonus
  - badSpendingPenalty
  - debtPenalty
```

---

# 3. Level 1 — Brahmacharya: The Chandra Challenge

## Level Identity

```text
Level Name: Brahmacharya
Age Range: 13–18
Planet Hurdle: Chandra
Main Skill: Spending Control
Theme: Student life, pocket money, peer pressure, temptation
Difficulty: Easy
```

## Story Intro

You are starting your financial journey as a student. You do not earn much yet, but your habits are being formed. Chandra represents emotions, mood, desire, and peer pressure. Your challenge is to control unnecessary spending and learn the value of money.

## Learning Objective

By the end of this level, the player should understand:

* Spending is not always bad, but uncontrolled spending is dangerous.
* Small daily expenses become big losses over time.
* Peer pressure can damage money habits.
* Planning before spending is better than borrowing later.

## Level Goal

```text
Starting Corpus: ₹5,00,000
Target Corpus: ₹15,00,000
Turn Limit: 15 turns
AI Opponents: 1 easy bot
```

## Main Level Mechanic: Desire Meter

The Desire Meter increases when the player repeatedly chooses SPEND.

### Desire Meter Rules

```text
Initial Desire Meter: 0
Maximum Desire Meter: 100
SAVE choice: -10 Desire
INVEST choice: -5 Desire
SPEND choice: +20 Desire
```

### Desire Meter Penalties

| Desire Meter | Effect                                                      |
| -----------: | ----------------------------------------------------------- |
|           40 | Minor temptation warning                                    |
|           60 | Next SPEND loss increases by 20%                            |
|           80 | Random expense event triggers                               |
|          100 | Chandra Strike: lose ₹1,00,000 and reset Desire Meter to 50 |

## Level 1 Card Pool

Use mostly School Life cards.

### Situation Cards

| Card ID | Card Name              | Main Lesson                        |
| ------- | ---------------------- | ---------------------------------- |
| S-001   | Pocket Money Dilemma   | Save first, spend later            |
| S-002   | School Trip ka Chakkar | Planning beats panic               |
| S-003   | Birthday Bonanza       | Gift money is seed money           |
| S-004   | Canteen Temptation     | Small daily habits matter          |
| S-005   | Second-Hand Cycle Deal | Value over vanity                  |
| S-006   | Merit Scholarship      | Reward learning with more learning |
| S-007   | Group Food Pressure    | Peer pressure is costly            |
| S-008   | Neighbour Uncle’s Job  | Respect first earned income        |
| S-009   | Lost ₹200              | Losing money teaches control       |
| S-010   | Stationery Sale Trap   | Cheap bulk can cost more           |
| S-011   | Find Money on Road     | Found money is not free money      |
| S-012   | Borrow Karna Padega    | Generosity needs boundaries        |
| S-013   | Gaming Credit Offer    | Virtual spending is real spending  |
| S-014   | Tiffin vs Canteen      | Avoid peer pressure spending       |
| S-015   | Garage Sale Find       | Old things can create value        |

### Action Cards for Level 1

Use only simple attack cards.

| Card Name          | Effect               |
| ------------------ | -------------------- |
| UPI Scam           | Target loses ₹50,000 |
| Peer Pressure      | Target loses ₹60,000 |
| Social Media Spend | Target loses ₹50,000 |
| Minor Illness      | Target loses ₹30,000 |

### Defense Cards for Level 1

| Card Name       | Effect                         |
| --------------- | ------------------------------ |
| Emergency Fund  | Blocks one small drain         |
| Discipline Card | Blocks FOMO or lifestyle drain |
| Negotiator      | Reduces one expense by 40%     |
| Health Shield   | Blocks minor medical expense   |

## Level 1 Boss: Chandra

### Boss Personality

Chandra attacks the player with emotional spending and peer pressure.

### Boss Special Attack

```text
Chandra Temptation
Effect: Forces player to draw 2 temptation cards and choose one.
Penalty: If player chooses SPEND, Desire Meter +30.
```

### Boss Trigger

Chandra Special Attack activates when:

```text
player corpus >= ₹10,00,000
OR
Desire Meter >= 70
```

## Level 1 Milestones

|     Corpus | Reward                             |
| ---------: | ---------------------------------- |
|  ₹7,00,000 | Unlock Emergency Fund              |
| ₹10,00,000 | Desire Meter maximum reduced by 10 |
| ₹12,00,000 | Draw 1 extra Defense Card          |
| ₹15,00,000 | Level Complete                     |

## Level 1 Learning Popups

### When player chooses SAVE

```text
Good choice. Spending control starts with keeping money before using it.
```

### When player chooses INVEST

```text
Smart move. Even small money can grow when used wisely.
```

### When player chooses SPEND

```text
Careful. Small spending feels harmless, but repeated spending slows your journey.
```

### When Desire Meter crosses 80

```text
Your Desire Meter is high. Emotional spending can create money problems.
```

## Level 1 Completion Summary

```text
Level Complete: Brahmacharya

You learned:
- Control spending before it controls you.
- Small daily expenses become large yearly losses.
- Peer pressure is not a financial plan.
- Saving small amounts builds discipline.

New Skill Unlocked:
Spending Control

Next Stage:
Vidyarthi to Yuva — Saving
```

---

# 4. Level 2 — Vidyarthi to Yuva: The Budh Challenge

## Level Identity

```text
Level Name: Vidyarthi to Yuva
Age Range: 18–22
Planet Hurdle: Budh
Main Skill: Saving
Theme: College life, first income, subscriptions, credit card traps
Difficulty: Easy-Medium
```

## Story Intro

You have entered college life. You now face more freedom, more choices, and more distractions. Budh represents intelligence, planning, and decision-making. Your challenge is to build saving habits while avoiding confusion and traps.

## Learning Objective

By the end of this level, the player should understand:

* Saving is a habit, not a one-time action.
* First income should not be fully spent.
* Credit cards and subscriptions can silently drain money.
* Emergency funds protect future choices.
* Skill investment can improve future income.

## Level Goal

```text
Starting Corpus: ₹7,00,000
Target Corpus: ₹25,00,000
Turn Limit: 18 turns
AI Opponents: 2 easy-medium bots
```

## Main Level Mechanic: Saving Streak

The player is rewarded for making repeated smart saving decisions.

### Saving Streak Rules

```text
SAVE choice: +1 Saving Streak
INVEST choice: Saving Streak remains same
SPEND choice: Saving Streak resets to 0
```

### Saving Streak Rewards

| Streak | Reward                                     |
| -----: | ------------------------------------------ |
|      2 | Gain ₹50,000 bonus                         |
|      3 | Unlock Emergency Fund                      |
|      4 | Reduce next expense by 30%                 |
|      5 | Gain Smart Saver Badge and ₹1,50,000 bonus |

## Level 2 Card Pool

Use mostly College Days cards.

### Situation Cards

| Card ID | Card Name             | Main Lesson                                 |
| ------- | --------------------- | ------------------------------------------- |
| S-016   | Zomato Zombie         | Convenience has a monthly cost              |
| S-017   | First Internship Pay  | First salary should create first investment |
| S-018   | Semester Fee Panic    | Fee dates require planning                  |
| S-019   | Used Textbook Deal    | Knowledge matters more than ownership       |
| S-020   | Crypto Bro Advice     | Avoid FOMO                                  |
| S-021   | Skill Up or Chill     | Skills compound like money                  |
| S-022   | Freelance Windfall    | Side income creates freedom                 |
| S-023   | Credit Card Trap      | Free credit card is not free money          |
| S-024   | Group Project Bill    | Money agreements should be clear            |
| S-025   | Subscription Overload | Audit subscriptions regularly               |
| S-026   | Café Study Habit      | Ambience spending can become waste          |
| S-027   | Placement Bonus       | Bonus should build future security          |
| S-028   | Peer Pressure Trip    | FOMO trips hurt finances                    |
| S-029   | Library vs Amazon     | Access can be better than ownership         |
| S-030   | Won an Olympiad Prize | Celebrate smartly                           |
| S-031   | Laptop Breakdown      | Repair before replace                       |
| S-032   | Part-Time Job Offer   | Earning is step 1, saving is step 2         |
| S-033   | Mess Fee Hike         | Budget must be adjusted                     |
| S-034   | Cheat Code Scam       | Too-good-to-be-true offers are risky        |
| S-035   | Knowledge is Power    | Learning is the best investment             |

### Action Cards for Level 2

| Card Name          | Effect                                                 |
| ------------------ | ------------------------------------------------------ |
| FOMO Force         | Target loses money in fake scheme                      |
| UPI Scam           | Target loses ₹50,000                                   |
| Jugaad Blocker     | Target skips one turn                                  |
| Peer Pressure      | Target loses ₹60,000                                   |
| Social Media Spend | Target loses ₹50,000                                   |
| FOMO Strike        | Target draws 2 Situation Cards and keeps the worse one |

### Defense Cards for Level 2

| Card Name       | Effect                           |
| --------------- | -------------------------------- |
| Emergency Fund  | Blocks one drain up to ₹2,00,000 |
| Discipline Card | Blocks lifestyle or FOMO drain   |
| Education Fund  | Blocks education-related drain   |
| Negotiator      | Reduces any expense by 40%       |
| Gadget Cover    | Blocks laptop or phone damage    |
| SIP Auto-Pilot  | Gives passive income for 3 turns |

## Level 2 Boss: Budh

### Boss Personality

Budh creates confusing choices, fake offers, subscriptions, and decision pressure.

### Boss Special Attack

```text
Budh Confusion
Effect: Player draws 2 Situation Cards.
Rule: One card is good, one card is a trap.
Player must choose one without seeing full outcome.
```

### Boss Trigger

Budh Special Attack activates when:

```text
player Saving Streak >= 3
OR
player corpus >= ₹18,00,000
```

## Level 2 Milestones

|     Corpus | Reward                                    |
| ---------: | ----------------------------------------- |
| ₹10,00,000 | Unlock Saving Streak bonus                |
| ₹15,00,000 | Unlock SIP Auto-Pilot Defense Card        |
| ₹20,00,000 | Gain ₹30,000 passive income every 2 turns |
| ₹25,00,000 | Level Complete                            |

## Level 2 Learning Popups

### When player chooses SAVE

```text
Good habit. Saving gives you control over future problems.
```

### When player chooses INVEST

```text
Great choice. Investing your first income can create long-term growth.
```

### When player chooses SPEND

```text
Think again. College spending can become a habit that follows you into your job life.
```

### When player avoids Credit Card Trap

```text
Smart decision. Credit cards are useful only when you can control repayment.
```

### When Saving Streak reaches 5

```text
You built a saving habit. Repeated small decisions create strong financial discipline.
```

## Level 2 Completion Summary

```text
Level Complete: Vidyarthi to Yuva

You learned:
- Saving is a repeated habit.
- First income should not be fully spent.
- Subscriptions and credit cards can silently drain money.
- Skills and emergency funds protect your future.

New Skill Unlocked:
Saving

Next Stage:
Aarambh Grihastha — Investing
```

---

# 5. Level 3 — Aarambh Grihastha: The Surya Challenge

## Level Identity

```text
Level Name: Aarambh Grihastha
Age Range: 22–28
Planet Hurdle: Surya
Main Skill: Investing
Theme: First job, salary, SIP, PF, bonus, lifestyle creep
Difficulty: Medium
```

## Story Intro

You have started your first job. Income has arrived, but so has ego, lifestyle pressure, and the desire to upgrade everything. Surya represents ambition, identity, pride, and growth. Your challenge is to convert income into investments before lifestyle consumes it.

## Learning Objective

By the end of this level, the player should understand:

* Income is not wealth.
* SIP and PF create long-term discipline.
* Bonus money should not be fully spent.
* Lifestyle creep can destroy salary growth.
* Investing early gives time for growth.

## Level Goal

```text
Starting Corpus: ₹10,00,000
Target Corpus: ₹50,00,000
Turn Limit: 22 turns
AI Opponents: 2 medium bots
```

## Main Level Mechanic: Investment Slot

The player unlocks investment slots.

### Investment Slot Rules

```text
Level starts with 1 Investment Slot.
More slots unlock through milestones.
Each slot can hold 1 active investment.
Investments grow after fixed turns.
Some investments have risk.
```

## Investment Types

| Investment       |      Cost | Growth Time |              Reward | Risk   |
| ---------------- | --------: | ----------: | ------------------: | ------ |
| SIP              | ₹1,00,000 |     3 turns |           ₹1,80,000 | Low    |
| Mutual Fund      | ₹2,00,000 |     4 turns |           ₹3,50,000 | Medium |
| PF Contribution  | ₹1,50,000 |     5 turns |           ₹3,00,000 | Low    |
| ELSS             | ₹2,50,000 |     5 turns |           ₹4,50,000 | Medium |
| Skill Investment | ₹2,00,000 |     4 turns | Salary bonus effect | Low    |
| Risky Startup    | ₹3,00,000 |     3 turns |           ₹7,00,000 | High   |

## Level 3 Card Pool

Use mostly First Job cards.

### Situation Cards

| Card ID | Card Name                  | Main Lesson                             |
| ------- | -------------------------- | --------------------------------------- |
| S-036   | Pehli Salary               | 50-30-20 rule starts from salary one    |
| S-037   | PF Opt In or Out           | PF is future self’s protection          |
| S-038   | Phone Snatch               | Think before gadget spending            |
| S-039   | Salary Hike Time           | Negotiation matters                     |
| S-040   | Lifestyle Creep            | Savings rate should rise with income    |
| S-041   | Year-End Bonus             | Bonus should work harder than you       |
| S-042   | Dinner with Seniors        | Money boundaries matter                 |
| S-043   | Work From Home Savings     | Redirect savings into investments       |
| S-044   | EMI Bombarded              | Too many EMIs crush wealth              |
| S-045   | Job Switch ka Mania        | Hikes should increase savings           |
| S-046   | Office Lunch Trap          | Convenience spending is sneaky          |
| S-047   | Side Hustle Win            | Side income accelerates wealth          |
| S-048   | MBA Decision               | Education loans need ROI                |
| S-049   | Telegram Stock Tip         | Free tips are expensive advice          |
| S-050   | Gym vs YouTube             | Pay for habits after proving them       |
| S-051   | Tax Refund Surprise        | Unexpected income should build security |
| S-052   | FOMO Investment            | FOMO is not a strategy                  |
| S-053   | Rent Negotiation           | Negotiation saves money                 |
| S-054   | Referral Bonus             | Bonus should advance goals              |
| S-055   | Forgotten Subscriptions    | Audit expenses regularly                |
| S-056   | Health Insurance Confusion | Health is wealth                        |
| S-057   | Invest or Travel?          | Balance enjoyment and compounding       |
| S-058   | Upskilling Payoff          | Skills compound income                  |

### Action Cards for Level 3

| Card Name           | Effect                                  |
| ------------------- | --------------------------------------- |
| EMI Bomb            | Target loses money for 3 turns          |
| Market Dhamaka      | Equity investors lose corpus percentage |
| FOMO Force          | Target invests in fake scheme           |
| Tax Notice          | Target pays penalty                     |
| Credit Score Damage | Target pays extra on next loan          |
| Card Thief          | Steal one Defense Card                  |
| Income Tax Raid     | Target discards one Defense Card        |
| Inflation Fire      | Everyone loses money                    |

### Defense Cards for Level 3

| Card Name           | Effect                          |
| ------------------- | ------------------------------- |
| Emergency Fund      | Blocks one drain                |
| Discipline Card     | Blocks lifestyle or FOMO drain  |
| SIP Auto-Pilot      | Passive income for 3 turns      |
| Stop Loss Card      | Caps market loss                |
| Debt Slayer         | Blocks EMI Bomb                 |
| Job Security Bond   | Blocks job loss effect          |
| Gadget Cover        | Blocks gadget loss              |
| Corporate Allowance | Blocks relocation-related drain |

## Level 3 Boss: Surya

### Boss Personality

Surya attacks through ego, lifestyle pressure, and ambition traps.

### Boss Special Attack

```text
Surya Ego Burn
Effect: Forces one lifestyle upgrade event.
Player must choose between:
1. Spend for status
2. Save for stability
3. Invest for growth
```

### Boss Trigger

Surya Special Attack activates when:

```text
player corpus >= ₹30,00,000
OR
player receives a bonus card
OR
player has 2 active investments
```

## Level 3 Milestones

|     Corpus | Reward                                     |
| ---------: | ------------------------------------------ |
| ₹15,00,000 | Unlock second Investment Slot              |
| ₹25,00,000 | Unlock SIP Auto-Pilot                      |
| ₹35,00,000 | Unlock Stop Loss Card                      |
| ₹45,00,000 | Investment growth speed improves by 1 turn |
| ₹50,00,000 | Level Complete                             |

## Investment Resolution Rules

### Low Risk Investment

```text
Success Chance: 90%
Failure Result: No gain, original amount returned
```

### Medium Risk Investment

```text
Success Chance: 70%
Failure Result: Lose 20% of investment amount
```

### High Risk Investment

```text
Success Chance: 45%
Failure Result: Lose 50% of investment amount
```

## Lifestyle Creep System

Level 3 should introduce lifestyle creep.

### Lifestyle Creep Rules

```text
Whenever player chooses SPEND after income gain:
Lifestyle Creep +1

If Lifestyle Creep reaches 3:
Player loses ₹50,000 every 2 turns as recurring lifestyle cost.

If Lifestyle Creep reaches 5:
Player loses ₹1,00,000 every 2 turns.
```

### How to Reduce Lifestyle Creep

```text
Choose SAVE: -1 Lifestyle Creep
Use Discipline Card: Reset Lifestyle Creep by 2
Use Budget Review Event: Reset Lifestyle Creep to 0
```

## Level 3 Learning Popups

### When player starts SIP

```text
SIP means investing regularly. Small amounts can grow strongly when given time.
```

### When player chooses PF

```text
PF is forced long-term saving. It protects your future self.
```

### When player spends bonus

```text
A bonus can disappear in one weekend, or it can build long-term wealth.
```

### When player suffers lifestyle creep

```text
Lifestyle creep happens when spending rises as income rises. It silently eats wealth.
```

### When player completes an investment

```text
Your money worked while you waited. This is the power of investing early.
```

## Level 3 Completion Summary

```text
Level Complete: Aarambh Grihastha

You learned:
- Income is not wealth.
- SIP and PF create disciplined growth.
- Bonuses should be invested before they are spent.
- Lifestyle creep can destroy salary growth.
- Early investing gives money more time to grow.

New Skill Unlocked:
Investing

Next Stage:
Grihastha Dharma — Risk and Protection
```

---

# 6. First 3 Level Unlock Flow

```text
Start Game
→ Level 1: Brahmacharya
→ Unlock Spending Control Badge
→ Level 2: Vidyarthi to Yuva
→ Unlock Saving Badge
→ Level 3: Aarambh Grihastha
→ Unlock Investing Badge
→ Next: Risk and Protection
```

## Badge System

| Badge                  | Unlock Condition |
| ---------------------- | ---------------- |
| Spending Control Badge | Complete Level 1 |
| Smart Saver Badge      | Complete Level 2 |
| First Investor Badge   | Complete Level 3 |

## Player Progress Save Data

Recommended structure:

```json
{
  "currentStage": 1,
  "completedStages": [1],
  "badges": ["Spending Control"],
  "stars": {
    "level1": 3,
    "level2": 0,
    "level3": 0
  },
  "unlockedCards": [
    "Emergency Fund",
    "Discipline Card"
  ]
}
```

---

# 7. Suggested Implementation Order

## Step 1: Create Level Config

Create a level config file:

```text
levels.ts
```

Each level should store:

```text
id
name
lifeStage
ageRange
planet
mainLearning
startingCorpus
targetCorpus
turnLimit
cardPool
specialMechanic
milestones
boss
completionSummary
```

## Step 2: Add Level Selection Screen

Show:

```text
Level Name
Age Range
Planet Hurdle
Main Learning
Lock / Unlock Status
Stars Earned
```

## Step 3: Add Level Intro Screen

Before starting each level, show:

```text
Story Intro
What You Will Learn
Main Mechanic
Win Condition
```

## Step 4: Filter Cards by Level

Do not give all cards at once.

Use:

```text
Level 1 → School Life cards
Level 2 → College Days cards
Level 3 → First Job cards
```

## Step 5: Add Special Mechanics

Add only one new mechanic per level:

| Level   | Mechanic         |
| ------- | ---------------- |
| Level 1 | Desire Meter     |
| Level 2 | Saving Streak    |
| Level 3 | Investment Slots |

## Step 6: Add Completion Screen

Show:

```text
Level completed
Stars earned
Main lessons learned
New badge unlocked
Next level preview
```

---

# 8. Final Design Principle

Do not teach finance like a textbook.

Teach through:

```text
Choice → Consequence → Feedback → Reward
```

Example:

```text
Player chooses SPEND
→ Corpus decreases
→ Desire Meter increases
→ Popup explains why
→ Player learns naturally
```

This will make Paisa War educational, but still feel like a real game.