import type { GameCard } from '../types/game'

/**
 * Built-in Life Events (docs/phase3-design.md §2.3). They are shuffled into
 * the shared event deck together with every card marked `lifeEvent: true`.
 *
 * Conventions used by the engine:
 * - `effect.target: 'all'` hits every active player, anything else hits one random player.
 * - `wealth_pct` > 0 adds cash, < 0 is a loss paid from cash (then forced sales).
 * - `category: 'market'` + `wealth_pct` moves market holdings (index/equity/smallcap/crypto) instead of cash.
 */
export const BUILTIN_LIFE_EVENTS: GameCard[] = [
  {
    id: 'le_diwali_bonus', name: 'Diwali Bonus', nameHi: 'दिवाली बोनस', type: 'action', tier: 'common', lifeEvent: true, category: 'job',
    flavor: 'Festive season! Everyone gets a bonus from work.',
    flavorHi: 'त्योहार का मौसम! सबको काम से बोनस मिला।',
    mentorInsight: 'A bonus is a great moment to top up your emergency fund or SIP before lifestyle eats it.',
    effect: { type: 'wealth_pct', value: 4, target: 'all' },
  },
  {
    id: 'le_salary_hike', name: 'Salary Hike', nameHi: 'वेतन वृद्धि', type: 'action', tier: 'rare', lifeEvent: true, category: 'job',
    flavor: 'Your appraisal went well — a solid raise lands in your account.',
    flavorHi: 'आपका अप्रेज़ल अच्छा रहा — अच्छी बढ़ोतरी मिली।',
    mentorInsight: 'Raise your savings with every raise, not just your spending.',
    effect: { type: 'wealth_pct', value: 8, target: 'self' },
  },
  {
    id: 'le_bull_run', name: 'Bull Run', nameHi: 'तेज़ी का दौर', type: 'action', tier: 'rare', lifeEvent: true, category: 'market',
    flavor: 'Markets rally on strong earnings. Equity holders smile.',
    flavorHi: 'मज़बूत नतीजों पर बाज़ार में तेज़ी।',
    mentorInsight: 'Only money that is already invested catches a rally. Timing the market rarely works; time in the market does.',
    effect: { type: 'wealth_pct', value: 10, target: 'all' },
  },
  {
    id: 'le_market_crash', name: 'Market Crash', nameHi: 'बाज़ार में गिरावट', type: 'action', tier: 'epic', lifeEvent: true, category: 'market',
    flavor: 'A global sell-off hits stocks hard.',
    flavorHi: 'वैश्विक बिकवाली से शेयर बुरी तरह गिरे।',
    mentorInsight: 'Crashes are temporary for diversified, long-term investors. Selling in panic makes the loss permanent.',
    effect: { type: 'wealth_pct', value: -15, target: 'all' },
  },
  {
    id: 'le_hospital_bill', name: 'Hospital Bill', nameHi: 'अस्पताल का बिल', type: 'action', tier: 'rare', lifeEvent: true, category: 'medical',
    flavor: 'A family member needs surgery. The bill arrives before the insurance does.',
    flavorHi: 'परिवार में सर्जरी — बिल पहले आया, बीमा बाद में।',
    mentorInsight: 'Health insurance plus 6 months of expenses in cash means a hospital bill never forces you to sell investments.',
    effect: { type: 'wealth_pct', value: -8, target: 'self' },
  },
  {
    id: 'le_job_gap', name: 'Job Gap', nameHi: 'नौकरी में अंतराल', type: 'action', tier: 'epic', lifeEvent: true, category: 'job',
    flavor: 'Your company downsizes. Three months between jobs.',
    flavorHi: 'कंपनी में छंटनी — तीन महीने बिना नौकरी।',
    mentorInsight: 'This is exactly what an emergency fund is for: rent and EMIs keep getting paid while you find the next job.',
    effect: { type: 'wealth_pct', value: -10, target: 'self' },
  },
  {
    id: 'le_car_repair', name: 'Car Breakdown', nameHi: 'गाड़ी खराब', type: 'action', tier: 'common', lifeEvent: true, category: 'personal',
    flavor: 'The engine gives up on the highway.',
    flavorHi: 'हाईवे पर इंजन ने जवाब दे दिया।',
    mentorInsight: 'Small surprises are certain — budget a little every month for repairs.',
    effect: { type: 'wealth_pct', value: -4, target: 'self' },
  },
  {
    id: 'le_tax_notice', name: 'Tax Notice', nameHi: 'टैक्स नोटिस', type: 'action', tier: 'rare', lifeEvent: true, category: 'tax',
    flavor: 'You forgot to declare interest income. Pay the dues plus interest.',
    flavorHi: 'ब्याज आय बताना भूल गए — बकाया और ब्याज भरें।',
    mentorInsight: 'Declare all income, including FD and savings interest. Penalties cost more than the tax.',
    effect: { type: 'wealth_pct', value: -5, target: 'self' },
  },
]
