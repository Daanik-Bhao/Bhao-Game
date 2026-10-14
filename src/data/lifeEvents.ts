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
  // Lures: the affected player (a bot when there is one, so humans watch it happen) moves
  // |value|% of their cash into a risky asset. A fraud defense blocks it.
  {
    id: 'le_whatsapp_tip', name: 'WhatsApp Stock Tip', nameHi: 'व्हाट्सऐप स्टॉक टिप', type: 'action', tier: 'rare', lifeEvent: true, category: 'fraud', lureAsset: 'scam',
    flavor: '"Guaranteed 30% a month, sir — only for close friends!" Someone forwards a hot tip.',
    flavorHi: '"हर महीने 30% पक्का, सिर्फ़ दोस्तों के लिए!" — एक हॉट टिप आई।',
    mentorInsight: 'Nobody can guarantee high returns. "Guaranteed" + "urgent" + "secret" is the recipe of almost every investment scam.',
    effect: { type: 'wealth_pct', value: -20, target: 'self' },
  },
  {
    id: 'le_chit_fund_scheme', name: 'Double-Your-Money Scheme', nameHi: 'पैसा डबल स्कीम', shortName: 'Money Doubler',type: 'action', tier: 'rare', lifeEvent: true, category: 'fraud', lureAsset: 'scam',
    flavor: 'A neighbour\'s "chit fund" promises to double your money in a year. Everyone in the building has joined.',
    flavorHi: 'पड़ोसी की "चिट फंड" स्कीम एक साल में पैसा डबल करने का वादा करती है।',
    mentorInsight: 'Unregistered schemes paying old investors with new investors\' money collapse sooner or later. Check SEBI/RBI registration before investing.',
    effect: { type: 'wealth_pct', value: -20, target: 'self' },
  },
  {
    id: 'le_crypto_influencer', name: 'Crypto Influencer', nameHi: 'क्रिप्टो इन्फ्लुएंसर', type: 'action', tier: 'rare', lifeEvent: true, category: 'fraud', lureAsset: 'crypto',
    flavor: 'A finfluencer promises the next 100x coin. FOMO kicks in.',
    flavorHi: 'एक फ़िनफ़्लुएंसर ने अगला 100x कॉइन बताया। FOMO हो गया।',
    mentorInsight: 'Speculation is not investing. Only put in money you can afford to lose completely.',
    effect: { type: 'wealth_pct', value: -15, target: 'self' },
  },
  {
    id: 'le_tax_notice', name: 'Tax Notice', nameHi: 'टैक्स नोटिस', type: 'action', tier: 'rare', lifeEvent: true, category: 'tax',
    flavor: 'You forgot to declare interest income. Pay the dues plus interest.',
    flavorHi: 'ब्याज आय बताना भूल गए — बकाया और ब्याज भरें।',
    mentorInsight: 'Declare all income, including FD and savings interest. Penalties cost more than the tax.',
    effect: { type: 'wealth_pct', value: -5, target: 'self' },
  },
]
