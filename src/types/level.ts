export interface LevelConfig {
  id: string
  name: string
  lifeStage: string
  ageRange: string
  planet: string
  mainLearning: string
  startingCorpus: number
  targetCorpus: number
  turnLimit: number
  botCount: number
  botDifficulty: 'easy' | 'medium' | 'hard'
  description: string
  mechanicName: string
  mechanicDescription: string
  bossSpecialAttackTrigger?: (state: BossTriggerState) => boolean
  /** Phase 5: which signature rule this level runs (src/lib/levelRules.ts). Optional for old configs. */
  rule?: LevelRuleId
}

/** What a level's boss trigger looks at: the player's corpus (₹) plus the legacy level fields. */
export type BossTriggerState = Pick<LevelState, 'savingStreak' | 'activeInvestments'> & { corpus: number }

/** Phase 5 signature mechanics, one per campaign level (docs/phase5-design.md, Track N). */
export type LevelRuleId = 'desire_meter' | 'saving_streak' | 'lifestyle_creep' | 'grihastha'

/** L1 — wants build up every year and every time you resist; plan a treat or splurge on impulse. */
export interface DesireMeterState {
  /** 0..max */
  value: number
  max: number
  /** A Spend at or above this value is a planned treat (no lifestyle creep, meter resets) */
  plannedThreshold: number
  /** Added at the start of every year */
  yearlyRise: number
  /** Added by every Save / Invest (resisting) */
  resistRise: number
  plannedTreats: number
  impulseSplurges: number
  /** ₹ lost to impulse splurges */
  impulseLost: number
}

/** L2 — pay yourself first: every Save/Invest grows the streak and the yearly Auto-SIP; a Spend breaks it. */
export interface SavingStreakState {
  current: number
  best: number
  /** Streak level at which the Auto-SIP stops growing */
  cap: number
  /** ₹ per streak level paid into the index fund each year */
  sipStep: number
  breaks: number
  /** ₹ paid in by the Auto-SIP so far */
  autoSipTotal: number
}

/** L3 — salary rises every year, lifestyle creeps with it; only a few investment slots. */
export interface LifestyleCreepState {
  /** Yearly take-home salary (₹), paid at the start of each year */
  salary: number
  /** Salary growth per year, % */
  raisePct: number
  /** Share of salary eaten by lifestyle, % (can exceed 100) */
  lifestylePct: number
  /** Lifestyle % added automatically with every raise */
  creepPerYear: number
  /** Lifestyle % added by a Spend */
  spendCreep: number
  /** Lifestyle % removed by a Save ("budget review") */
  saveCut: number
  minLifestylePct: number
  /** Max number of different investments (asset classes) held at once */
  slots: number
  peakLifestylePct: number
  /** ₹ salary left after lifestyle, summed over the game (can be negative) */
  savedFromSalary: number
  /** Invest attempts refused because every slot was full */
  blockedInvests: number
}

export type FamilyGoalId = 'home' | 'education' | 'parents_health'
export type FamilyGoalStatus = 'pending' | 'met' | 'strained' | 'missed'

export interface FamilyGoal {
  id: FamilyGoalId
  /** Year (round) the goal falls due */
  dueRound: number
  /** ₹ needed (parents_health: the bill before insurance, as % of net worth → filled in when due) */
  amount: number
  status: FamilyGoalStatus
  /** ₹ actually paid / lost */
  paid?: number
}

/** L4 — family goals fall due in fixed years; health insurance covers the big hospital bill. */
export interface GrihasthaState {
  goals: FamilyGoal[]
  /** Parents' hospital bill as % of net worth (the boss event) */
  bossPct: number
  /** Share of the bill the player still pays when insured, 0-1 */
  insuredShare: number
  /** Goal due without enough cash: extra cost on the shortfall, % */
  rushPct: number
  /** True if the player had health cover when the boss event hit (null = not yet) */
  insuredAtBoss: boolean | null
}

export interface LevelRuleEvent {
  round: number
  kind: 'impulse_splurge' | 'planned_treat' | 'desire_warning' | 'auto_sip' | 'streak_broken' | 'salary' | 'slots_full' | 'goal_due_soon' | 'goal_met' | 'goal_strained' | 'boss'
  /** i18n key (full path, e.g. campaign.events.impulse_splurge); `text`/`textHi` are plain fallbacks */
  key: string
  params?: Record<string, string | number>
  text: string
  textHi: string
  amount?: number
}

export interface LevelState {
  currentLevelId: string
  // Legacy fields (kept for compatibility; Phase 5 rules live in the typed blocks below)
  savingStreak: number // Level 2
  lifestyleCreep: number // Level 3
  investmentSlots: number // Level 3
  activeInvestments: {
    id: string
    name: string
    cost: number
    turnsRemaining: number
    reward: number | string
    risk: 'Low' | 'Medium' | 'High'
  }[] // Level 3

  bossTriggered: boolean
  starsEarned: number

  // --- Phase 5 level rules (optional: absent in old saves / non-campaign games) ---
  rule?: LevelRuleId
  desire?: DesireMeterState
  streak?: SavingStreakState
  creep?: LifestyleCreepState
  family?: GrihasthaState
  /** Rule events, newest first (max 10), for the HUD / popups */
  ruleEvents?: LevelRuleEvent[]
}

export interface CampaignProgress {
  currentStage: number
  completedStages: number[]
  badges: string[]
  stars: Record<string, number>
  unlockedCards: string[]
}
