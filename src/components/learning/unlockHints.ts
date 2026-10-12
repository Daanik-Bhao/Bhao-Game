import type { ConceptId } from '../../types/learning'

/** How a player runs into each concept during a game (shown on locked library tiles). */
export const UNLOCK_HINTS: Record<ConceptId, { en: string; hi: string }> = {
  inflation: { en: 'Keep cash through a year with inflation.', hi: 'महंगाई वाले साल में नकद रखें।' },
  compounding: { en: 'Hold an investment for 3+ years or double it.', hi: 'किसी निवेश को 3+ साल रखें या दोगुना करें।' },
  emergency_fund: { en: 'Get hit by a loss you can’t cover with cash.', hi: 'ऐसा नुकसान झेलें जो नकद से न भर पाए।' },
  sip: { en: 'Invest in an index fund.', hi: 'इंडेक्स फंड में निवेश करें।' },
  index_funds: { en: 'Invest in an index fund.', hi: 'इंडेक्स फंड में निवेश करें।' },
  diversification: { en: 'Hold 3 or more kinds of assets at once.', hi: 'एक साथ 3 या ज़्यादा तरह के निवेश रखें।' },
  asset_risk: { en: 'Watch a risky asset swing up and down.', hi: 'किसी जोखिम वाले निवेश को ऊपर-नीचे होते देखें।' },
  fd_vs_inflation: { en: 'Keep money in an FD while inflation runs high.', hi: 'ऊँची महंगाई के समय FD में पैसा रखें।' },
  liquidity: { en: 'Be forced to sell an investment to pay a bill.', hi: 'बिल भरने के लिए निवेश बेचने पर मजबूर हों।' },
  market_patience: { en: 'Hold on through a market crash.', hi: 'बाज़ार गिरने पर भी निवेश बनाए रखें।' },
  scams: { en: 'Meet a “too good to be true” offer.', hi: '“बहुत अच्छा ऑफ़र” वाले लालच से मिलें।' },
  crypto_risk: { en: 'Hold crypto when it crashes.', hi: 'क्रिप्टो गिरने के समय उसे रखें।' },
  lifestyle_creep: { en: 'Upgrade your lifestyle a couple of times.', hi: 'अपनी लाइफ़स्टाइल दो-तीन बार बढ़ाएँ।' },
  pay_yourself_first: { en: 'Save three turns in a row.', hi: 'लगातार तीन बार बचत करें।' },
  health_insurance: { en: 'Face a medical emergency.', hi: 'किसी मेडिकल इमरजेंसी का सामना करें।' },
  term_insurance: { en: 'Play a life-insurance card.', hi: 'जीवन बीमा वाला कार्ड खेलें।' },
  credit_card_debt: { en: 'Get a credit card bill you can’t fully pay.', hi: 'क्रेडिट कार्ड का ऐसा बिल पाएँ जो पूरा न भर सकें।' },
  good_vs_bad_debt: { en: 'Take on a loan or EMI.', hi: 'कोई लोन या EMI लें।' },
  tax_saving: { en: 'Play a tax card.', hi: 'टैक्स वाला कार्ड खेलें।' },
  cyber_safety: { en: 'Get targeted by a fraud attack.', hi: 'किसी फ्रॉड हमले का निशाना बनें।' },
  real_estate: { en: 'Buy or sell property.', hi: 'प्रॉपर्टी खरीदें या बेचें।' },
  gold: { en: 'Buy gold.', hi: 'सोना खरीदें।' },
}
