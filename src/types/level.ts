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
  bossSpecialAttackTrigger?: (state: any) => boolean
}

export interface LevelState {
  currentLevelId: string
  // Mechanics
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
}

export interface CampaignProgress {
  currentStage: number
  completedStages: number[]
  badges: string[]
  stars: Record<string, number>
  unlockedCards: string[]
}
