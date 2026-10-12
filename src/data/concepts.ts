import type { Concept, ConceptId } from '../types/learning'

/**
 * Gyaan Library catalog. STUB — the Phase 4 engine agent fills in every ConceptId.
 * Keep entries short, accurate, Indian context, no product recommendations.
 */
export const CONCEPTS: Partial<Record<ConceptId, Concept>> = {
  inflation: {
    id: 'inflation',
    emoji: '💸',
    title: 'Inflation',
    titleHi: 'महंगाई',
    oneLiner: 'Prices rise every year, so idle cash quietly loses value.',
    oneLinerHi: 'हर साल दाम बढ़ते हैं, इसलिए पड़ा हुआ पैसा चुपचाप घटता है।',
    explanation: 'In India prices have risen about 5–6% a year on average. ₹1 lakh kept in cash buys less every year.',
    explanationHi: 'भारत में दाम औसतन हर साल 5–6% बढ़े हैं। नकद रखा ₹1 लाख हर साल कम चीज़ें खरीद पाता है।',
    example: 'At 6% inflation, ₹1,00,000 today buys what about ₹56,000 buys in 10 years.',
    exampleHi: '6% महंगाई पर, आज के ₹1,00,000 की कीमत 10 साल बाद लगभग ₹56,000 जितनी रह जाती है।',
    actionTip: 'Keep only your emergency fund in cash; let the rest grow faster than inflation.',
    actionTipHi: 'नकद में सिर्फ़ इमरजेंसी फंड रखें; बाकी को महंगाई से तेज़ बढ़ने दें।',
  },
}

export const ALL_CONCEPT_IDS: ConceptId[] = [
  'inflation', 'compounding', 'emergency_fund', 'sip', 'index_funds', 'diversification', 'asset_risk',
  'fd_vs_inflation', 'liquidity', 'market_patience', 'scams', 'crypto_risk', 'lifestyle_creep',
  'pay_yourself_first', 'health_insurance', 'term_insurance', 'credit_card_debt', 'good_vs_bad_debt',
  'tax_saving', 'cyber_safety', 'real_estate', 'gold',
]
