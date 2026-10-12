import { LevelConfig } from '../types/level'

/**
 * Artha Yatra campaign. Each level runs one signature rule (src/lib/levelRules.ts);
 * corpus / limits are tuned by simulation (docs/phase5-design.md "Track N results").
 * One round = one year.
 */
export const ARTHA_YATRA_LEVELS: LevelConfig[] = [
  {
    id: 'level_1',
    name: 'Brahmacharya',
    lifeStage: 'Brahmacharya',
    ageRange: '13-18',
    planet: 'Chandra',
    mainLearning: 'Spending Control',
    startingCorpus: 500000,
    targetCorpus: 1500000,
    turnLimit: 14,
    botCount: 1,
    botDifficulty: 'easy',
    description: 'You are starting your financial journey as a student. Control unnecessary spending and learn the value of money.',
    mechanicName: 'Desire Meter',
    mechanicDescription: 'Wants build up every year and every time you resist them. Spend on a planned treat when the meter is high — if it hits 100 you splurge on impulse, which costs far more.',
    rule: 'desire_meter',
    bossSpecialAttackTrigger: (state: any) => state.corpus >= 1000000
  },
  {
    id: 'level_2',
    name: 'Vidyarthi to Yuva',
    lifeStage: 'Vidyarthi to Yuva',
    ageRange: '18-22',
    planet: 'Budh',
    mainLearning: 'Saving',
    startingCorpus: 700000,
    targetCorpus: 3200000,
    turnLimit: 12,
    botCount: 2,
    botDifficulty: 'medium',
    description: 'College life begins. Build saving habits while avoiding confusion, subscriptions, and fake offers.',
    mechanicName: 'Saving Streak',
    mechanicDescription: 'Pay yourself first: every year you Save or Invest grows your streak, and a bigger Auto-SIP lands in your index fund. One Spend breaks the streak and the bonus.',
    rule: 'saving_streak',
    bossSpecialAttackTrigger: (state: any) => state.savingStreak >= 3 || state.corpus >= 1800000
  },
  {
    id: 'level_3',
    name: 'Aarambh Grihastha',
    lifeStage: 'Aarambh Grihastha',
    ageRange: '22-28',
    planet: 'Surya',
    mainLearning: 'Investing',
    startingCorpus: 1000000,
    targetCorpus: 5500000,
    turnLimit: 14,
    botCount: 2,
    botDifficulty: 'medium',
    description: 'Your first job! Income arrives, but so does lifestyle creep and ego. Convert income into investments before it disappears.',
    mechanicName: 'Lifestyle Creep & Investment Slots',
    mechanicDescription: 'Your salary rises every year, but your lifestyle quietly eats a bigger share — Save to review your budget, Spend makes it worse. You only have 3 investment slots, so choose quality assets.',
    rule: 'lifestyle_creep',
    bossSpecialAttackTrigger: (state: any) => state.corpus >= 3000000 || state.activeInvestments?.length >= 2
  },
  {
    id: 'level_4',
    name: 'Grihastha Dharma',
    lifeStage: 'Grihastha Dharma',
    ageRange: '28-38',
    planet: 'Mangal',
    mainLearning: 'Risk & Protection',
    startingCorpus: 1500000,
    targetCorpus: 6500000,
    turnLimit: 16,
    botCount: 2,
    botDifficulty: 'hard',
    description: 'Family life brings new responsibilities: a home loan, your children\'s education, your parents\' health and your own retirement. Protect your wealth from sudden shocks while keeping it growing.',
    mechanicName: 'Family Goals & Insurance',
    mechanicDescription: 'Family goals fall due in fixed years: the home down payment and the kids\' education need cash ready, or investments get sold at a loss. Keep health insurance equipped for your parents\' hospital bill.',
    rule: 'grihastha',
    bossSpecialAttackTrigger: () => false
  }
]
