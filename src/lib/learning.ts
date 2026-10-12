/**
 * Phase 4 learning (docs/phase4-design.md): stat helpers used by the engine,
 * and the end-of-game report card. Everything here is pure and deterministic.
 */
import type { AssetClass, EventCategory, GameState, PlayerState } from '../types/game'
import type { ConceptId, Grade, PlayerGameStats, ReportCard } from '../types/learning'
import { ASSETS } from '../data/assets'
import { formatINR, getCash, getHoldings, getNetWorth } from './economy'

// ---------------------------------------------------------------------------
// Stat helpers (used by gameEngine)
// ---------------------------------------------------------------------------

export function emptyStats(startNetWorth: number): PlayerGameStats {
  const start = Math.round(startNetWorth)
  return {
    saves: 0,
    spends: 0,
    invests: 0,
    investedByAsset: {},
    inflationLost: 0,
    forcedSales: 0,
    exitPenaltiesPaid: 0,
    attacksBlocked: 0,
    attacksTaken: 0,
    lossesTaken: 0,
    speculativeLosses: 0,
    maxSaveStreak: 0,
    peakNetWorth: start,
    netWorthByRound: [start],
    conceptsTriggered: [],
    currentSaveStreak: 0,
    defensesEquipped: 0,
    forcedSaleLog: [],
    hits: [],
    cashShareByRound: [1],
    worstMarketDrop: null,
  }
}

/** Append concepts in order, skipping ones already met. */
export function addConcepts(stats: PlayerGameStats, ids: ConceptId[]): PlayerGameStats {
  const seen = new Set(stats.conceptsTriggered)
  const added = ids.filter(id => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  return added.length ? { ...stats, conceptsTriggered: [...stats.conceptsTriggered, ...added] } : stats
}

const TEXT_CONCEPTS: [RegExp, ConceptId][] = [
  [/credit card/i, 'credit_card_debt'],
  [/\btax|80C|ELSS/i, 'tax_saving'],
  [/\bloans?\b|\bEMIs?\b|BNPL|\bborrow|\bdebt\b(?! fund)/i, 'good_vs_bad_debt'],
  [/term (life )?(insurance|plan|cover)|life insurance|life cover/i, 'term_insurance'],
  [/health insurance|mediclaim|health cover/i, 'health_insurance'],
  [/\bscam|ponzi|chit fund|double[- ]your[- ]money/i, 'scams'],
  [/phishing|\bOTP\b|hack|cyber|UPI fraud|2FA|two-factor/i, 'cyber_safety'],
  [/\bSIP\b/, 'sip'],
]

/** Concepts named by a card's text (tax, debt, credit cards, insurance...). Defense names also teach the emergency fund. */
export function conceptsFromText(text: string, isDefense = false): ConceptId[] {
  const out = TEXT_CONCEPTS.filter(([re]) => re.test(text)).map(([, id]) => id)
  if (isDefense && /emergency/i.test(text)) out.push('emergency_fund')
  return out
}

/** Concepts met by putting money into an asset class. */
export function assetConcepts(asset: AssetClass): ConceptId[] {
  switch (asset) {
    case 'index': return ['index_funds', 'sip']
    case 'equity': return ['sip']
    case 'smallcap': return ['asset_risk']
    case 'crypto': return ['crypto_risk', 'asset_risk']
    case 'scam': return ['scams']
    case 'gold': return ['gold']
    case 'realestate': return ['real_estate']
    case 'fd': return ['fd_vs_inflation']
    case 'debt': return ['tax_saving'] // PPF is the classic Section 80C option
  }
}

/** Concepts met when a card of this category reaches a player (blocked or not). */
export function categoryConcepts(card: { category?: EventCategory }): ConceptId[] {
  switch (card.category) {
    case 'medical': return ['health_insurance']
    case 'fraud': return ['cyber_safety']
    case 'tax': return ['tax_saving']
    case 'debt': return ['good_vs_bad_debt']
    default: return []
  }
}

/** ₹ held in crypto + scam holdings. */
export function speculativeValue(player: PlayerState): number {
  return getHoldings(player).filter(h => h.asset === 'crypto' || h.asset === 'scam').reduce((s, h) => s + h.value, 0)
}

/** Cash ÷ net worth (0–1). */
export function cashShare(player: PlayerState): number {
  const nw = getNetWorth(player)
  return nw > 0 ? Math.round((getCash(player) / nw) * 1000) / 1000 : 0
}

// ---------------------------------------------------------------------------
// Projection maths
// ---------------------------------------------------------------------------

/**
 * Future value of a monthly SIP (instalment at the start of each month):
 * FV = P × [((1 + i)^n − 1) / i] × (1 + i), i = annual% / 12, n = months.
 */
export function sipFutureValue(monthly: number, annualPct: number, years: number): number {
  const i = annualPct / 100 / 12
  const n = years * 12
  if (i === 0) return Math.round(monthly * n)
  return Math.round(monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i))
}

export const PROJECTION_YEARS = 10
export const PROJECTION_MONTHLY = 5000
export const FD_RATE_PCT = 7
export const INDEX_RATE_PCT = 12
/** Idle cash: a savings account */
export const SAVINGS_RATE_PCT = 3

/**
 * Long-run yearly return assumed for the projection. Game means from assets.ts,
 * but stocks capped at 12% for prudence, crypto counted at 0% (too unpredictable
 * to plan on) and "hot tip" schemes at −80% (most of the money vanishes).
 */
export function projectionRatePct(asset: AssetClass): number {
  if (asset === 'scam') return -80
  if (asset === 'crypto') return 0
  return Math.min(ASSETS[asset].meanPct, INDEX_RATE_PCT)
}

// ---------------------------------------------------------------------------
// Report card
// ---------------------------------------------------------------------------

type Area = ReportCard['grades'][number]['area']
type Lesson = ReportCard['lessons'][number]

const GRADES: Grade[] = ['D', 'C', 'B', 'A']
const toGrade = (score: number): Grade => GRADES[Math.max(0, Math.min(3, Math.round(score)))]
const gradeValue = (g: Grade) => GRADES.indexOf(g)
const pct = (x: number) => Math.round(x * 100)
const inr = formatINR
const SPECULATIVE: AssetClass[] = ['crypto', 'scam']
const GROWTH: AssetClass[] = ['index', 'equity', 'smallcap']
const SAFE: AssetClass[] = ['fd', 'debt']

const AREA_LABELS: Record<Area, [string, string]> = {
  saving: ['Saving', 'बचत'],
  investing: ['Investing', 'निवेश'],
  risk: ['Risk', 'जोखिम'],
  emergency: ['Emergency fund', 'इमरजेंसी फंड'],
  protection: ['Protection', 'सुरक्षा'],
}

interface Metrics {
  s: PlayerGameStats
  start: number
  final: number
  decisions: number
  spendRatio: number
  lifestyle: number
  totalInvested: number
  share: (assets: AssetClass[]) => number
  specShare: number
  safeShare: number
  growthShare: number
  classes: AssetClass[]
  topAsset: AssetClass | null
  /** Average share of net worth invested across the years played */
  avgInvested: number
  minCash: number
  avgCash: number
  years: number
}

function metrics(player: PlayerState, s: PlayerGameStats): Metrics {
  const final = getNetWorth(player)
  const start = s.netWorthByRound[0] ?? final
  const decisions = s.saves + s.spends + s.invests
  const entries = (Object.entries(s.investedByAsset) as [AssetClass, number][]).filter(([, v]) => v > 0)
  const totalInvested = entries.reduce((sum, [, v]) => sum + v, 0)
  const share = (assets: AssetClass[]) =>
    totalInvested > 0 ? entries.filter(([a]) => assets.includes(a)).reduce((sum, [, v]) => sum + v, 0) / totalInvested : 0
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  // Cash share after each year (skip index 0 = the all-cash start) plus right now
  const cashShares = [...(s.cashShareByRound ?? []).slice(1), cashShare(player)]
  const avgCash = cashShares.reduce((a, b) => a + b, 0) / cashShares.length
  return {
    s,
    start,
    final,
    decisions,
    spendRatio: decisions ? s.spends / decisions : 0,
    lifestyle: player.lifestyleLevel ?? 0,
    totalInvested,
    share,
    specShare: share(SPECULATIVE),
    safeShare: share(SAFE),
    growthShare: share(GROWTH),
    classes: sorted.map(([a]) => a),
    topAsset: sorted[0]?.[0] ?? null,
    avgInvested: 1 - avgCash,
    minCash: Math.min(...cashShares),
    avgCash,
    years: Math.max(1, s.netWorthByRound.length - 1),
  }
}

function grade(area: Area, g: Grade, reason: string, reasonHi: string): ReportCard['grades'][number] {
  return { area, label: AREA_LABELS[area][0], labelHi: AREA_LABELS[area][1], grade: g, reason, reasonHi }
}

function gradeSaving(m: Metrics): ReportCard['grades'][number] {
  const { s, decisions, lifestyle } = m
  if (!decisions) {
    return grade('saving', 'C', 'You made no save / spend / invest choices this game — try a few next time.',
      'इस खेल में आपने बचत, ख़र्च या निवेश का कोई फ़ैसला नहीं लिया — अगली बार ज़रूर आज़माइए।')
  }
  let score = 3
  if (m.spendRatio > 0.15) score--
  if (m.spendRatio > 0.35) score--
  if (m.spendRatio > 0.55) score--
  if (lifestyle >= 3) score--
  if (s.maxSaveStreak >= 3) score++
  const g = toGrade(Math.min(3, score))
  if (g === 'A') {
    if (s.spends === 0) {
      return grade('saving', g,
        `You never chose Spend in ${decisions} choices${s.maxSaveStreak >= 2 ? `, with a best saving streak of ${s.maxSaveStreak}` : ''} — you paid yourself first.`,
        `${decisions} फ़ैसलों में आपने एक बार भी ख़र्च नहीं चुना${s.maxSaveStreak >= 2 ? `, और लगातार ${s.maxSaveStreak} बार बचत की` : ''} — आपने पहले ख़ुद को भुगतान किया।`)
    }
    return grade('saving', g,
      `Only ${s.spends} of your ${decisions} choices were Spend${s.maxSaveStreak >= 2 ? `, with a best saving streak of ${s.maxSaveStreak}` : ''} — you paid yourself first.`,
      `आपके ${decisions} फ़ैसलों में से सिर्फ़ ${s.spends} बार ख़र्च चुना${s.maxSaveStreak >= 2 ? `, और लगातार ${s.maxSaveStreak} बार बचत की` : ''} — आपने पहले ख़ुद को भुगतान किया।`)
  }
  if (g === 'B') {
    return grade('saving', g,
      `You spent on ${s.spends} of ${decisions} choices — mostly disciplined, with a few treats.`,
      `${decisions} में से ${s.spends} फ़ैसलों में आपने ख़र्च किया — ज़्यादातर अनुशासन, थोड़े-बहुत शौक़ के साथ।`)
  }
  return grade('saving', g,
    `You chose Spend ${s.spends} times out of ${decisions}; your lifestyle level reached ${lifestyle}, which also made inflation bite harder.`,
    `${decisions} में से ${s.spends} बार आपने ख़र्च चुना; आपका लाइफ़स्टाइल लेवल ${lifestyle} तक पहुँचा, जिससे महंगाई की मार भी बढ़ी।`)
}

function gradeInvesting(m: Metrics): ReportCard['grades'][number] {
  const { s, totalInvested } = m
  if (totalInvested <= 0) {
    return grade('investing', 'D',
      `You never invested — your money sat in cash, and inflation took ${inr(s.inflationLost)} of it.`,
      `आपने कभी निवेश नहीं किया — पैसा नकद में पड़ा रहा और महंगाई ने उसमें से ${inr(s.inflationLost)} खा लिए।`)
  }
  const inv = m.avgInvested
  let score = inv >= 0.6 ? 3 : inv >= 0.4 ? 2 : inv >= 0.2 ? 1 : 0
  if (m.specShare > 0.3) score -= 2
  else if (m.specShare > 0.1) score -= 1
  if (m.safeShare > 0.7) score -= 1
  const g = toGrade(score)
  const top = m.topAsset ? ASSETS[m.topAsset] : null
  if (m.specShare > 0.1) {
    return grade('investing', g,
      `${pct(m.specShare)}% of what you invested went into crypto or "hot tip" schemes — that's betting, not investing.`,
      `आपके निवेश का ${pct(m.specShare)}% क्रिप्टो या "हॉट टिप" स्कीमों में गया — यह निवेश नहीं, सट्टा है।`)
  }
  if (m.safeShare > 0.7) {
    return grade('investing', g,
      `${pct(m.safeShare)}% of your investing went to FD / PPF-type options — safe, but they only just beat inflation.`,
      `आपके निवेश का ${pct(m.safeShare)}% FD / PPF जैसे विकल्पों में गया — सुरक्षित, पर महंगाई से बस थोड़ा ही आगे।`)
  }
  if (inv < 0.4) {
    return grade('investing', g,
      `On average only ${pct(Math.max(0, inv))}% of your money was invested — the rest sat in cash losing value.`,
      `औसतन आपके पैसे का सिर्फ़ ${pct(Math.max(0, inv))}% ही निवेश में था — बाकी नकद में पड़ा-पड़ा घटता रहा।`)
  }
  return grade('investing', g,
    `About ${pct(inv)}% of your money stayed invested, mostly in ${top?.name ?? 'growth assets'} — that's how wealth compounds.`,
    `आपके पैसे का लगभग ${pct(inv)}% निवेश में रहा, ज़्यादातर ${top?.nameHi ?? 'ग्रोथ एसेट'} में — दौलत ऐसे ही बढ़ती है।`)
}

function gradeRisk(m: Metrics): ReportCard['grades'][number] {
  const { s, totalInvested, start } = m
  if (totalInvested <= 0) {
    return grade('risk', 'B', 'You took no market risk at all — but cash has its own risk: inflation shrinks it every year.',
      'आपने बाज़ार का कोई जोखिम नहीं लिया — पर नकद का भी अपना जोखिम है: महंगाई हर साल उसे घटाती है।')
  }
  let score = 3
  if (m.specShare > 0.3) score -= 2
  else if (m.specShare > 0.1) score -= 1
  if (start > 0 && s.speculativeLosses > start * 0.1) score -= 1
  const oneBasket = s.invests >= 2 && m.classes.length === 1
  if (oneBasket) score -= 1
  const g = toGrade(score)
  if (s.speculativeLosses > 0) {
    return grade('risk', g,
      `You lost ${inr(s.speculativeLosses)} in crypto / scheme holdings — only bet money you can afford to lose completely.`,
      `क्रिप्टो / स्कीम में आपने ${inr(s.speculativeLosses)} गँवाए — सट्टे में सिर्फ़ उतना ही लगाइए जितना पूरा डूब जाए तो भी चल जाए।`)
  }
  if (m.specShare > 0.1) {
    return grade('risk', g,
      `${pct(m.specShare)}% of your investing was speculative — it didn't blow up this time, but it often does.`,
      `आपके निवेश का ${pct(m.specShare)}% सट्टे वाला था — इस बार बच गए, पर अक्सर ऐसा पैसा डूब जाता है।`)
  }
  if (oneBasket) {
    const a = ASSETS[m.classes[0]]
    return grade('risk', g,
      `Everything went into ${a.name} — spreading across 3+ asset types smooths out bad years.`,
      `सारा पैसा ${a.nameHi} में गया — 3 या ज़्यादा तरह के निवेश में बाँटने से बुरे साल का असर कम होता है।`)
  }
  if (m.classes.length === 1) {
    const a = ASSETS[m.classes[0]]
    return grade('risk', g,
      `No gambles — everything sat in ${a.name}. Next step: spread across 3+ asset types.`,
      `कोई सट्टा नहीं — सारा पैसा ${a.nameHi} में रहा। अगला क़दम: 3 या ज़्यादा तरह के निवेश में बाँटिए।`)
  }
  return grade('risk', g,
    `No gambles, and your money was spread over ${m.classes.length} asset type${m.classes.length === 1 ? '' : 's'} — sensible risk.`,
    `कोई सट्टा नहीं, और पैसा ${m.classes.length} तरह के निवेश में बँटा रहा — समझदारी भरा जोखिम।`)
}

/** Share of the starting net worth lost to speculation / hits that makes an "emergency-ready" grade untrue. */
const BIG_LOSS_SHARE = 0.4

function gradeEmergency(m: Metrics): ReportCard['grades'][number] {
  const g = gradeEmergencyBase(m)
  const { s, start } = m
  const bigLoss = Math.max(s.speculativeLosses, s.lossesTaken)
  // Never selling in a hurry is not "emergency-ready" if most of the money vanished anyway.
  if (start > 0 && bigLoss > start * BIG_LOSS_SHARE && (g.grade === 'A' || g.grade === 'B')) {
    return grade('emergency', 'C',
      `You never had to sell in a hurry, but you lost ${inr(bigLoss)} (${pct(bigLoss / start)}% of what you started with) — a safety net only works if the money survives.`,
      `आपको जल्दबाज़ी में कुछ नहीं बेचना पड़ा, पर ${inr(bigLoss)} (शुरुआती पैसे का ${pct(bigLoss / start)}%) डूब गए — सुरक्षा तभी काम आती है जब पैसा बचा रहे।`)
  }
  return g
}

function gradeEmergencyBase(m: Metrics): ReportCard['grades'][number] {
  const { s, start } = m
  const buffer = m.minCash >= 0.05 && m.avgCash >= 0.1
  if (s.forcedSales === 0) {
    if (m.minCash >= 0.99) {
      return grade('emergency', 'A', 'You never had to sell anything in a hurry — all your money was cash (safe for emergencies, but see Investing).',
        'आपको कभी जल्दबाज़ी में कुछ नहीं बेचना पड़ा — सारा पैसा नकद में था (मुसीबत के लिए सुरक्षित, पर निवेश वाला हिस्सा देखिए)।')
    }
    return buffer
      ? grade('emergency', 'A', `You never had to sell investments in a hurry, and kept a cash cushion (at least ${pct(m.minCash)}% of net worth) all game.`,
        `आपको कभी जल्दबाज़ी में निवेश नहीं बेचना पड़ा, और पूरे खेल में नकद का सहारा (नेट वर्थ का कम से कम ${pct(m.minCash)}%) बना रहा।`)
      : grade('emergency', 'B', `No forced sales — but your cash cushion fell to ${pct(m.minCash)}% of net worth. One big bill could have hurt.`,
        `कोई मजबूरी की बिक्री नहीं हुई — पर आपका नकद सहारा नेट वर्थ के ${pct(m.minCash)}% तक गिर गया। एक बड़ा बिल भारी पड़ सकता था।`)
  }
  const worst = [...(s.forcedSaleLog ?? [])].sort((a, b) => b.penalty - a.penalty)[0]
  const g: Grade = s.forcedSales <= 2 && s.exitPenaltiesPaid <= start * 0.02 ? 'C' : 'D'
  const what = worst ? ASSETS[worst.asset] : null
  return grade('emergency', g,
    `You had to sell investments ${s.forcedSales} time${s.forcedSales === 1 ? '' : 's'} to cover losses${what ? ` (e.g. ${what.name} in Year ${worst!.round})` : ''}, paying ${inr(s.exitPenaltiesPaid)} in penalties.`,
    `नुकसान भरने के लिए आपको ${s.forcedSales} बार निवेश बेचना पड़ा${what ? ` (जैसे साल ${worst!.round} में ${what.nameHi})` : ''}, और ${inr(s.exitPenaltiesPaid)} पेनल्टी में गए।`)
}

function gradeProtection(m: Metrics): ReportCard['grades'][number] {
  const { s } = m
  const b = s.attacksBlocked
  const t = s.attacksTaken
  const eq = s.defensesEquipped ?? 0
  if (b + t === 0) {
    return eq > 0
      ? grade('protection', 'A', `You kept ${eq} defense${eq === 1 ? '' : 's'} ready and nothing got through.`,
        `आपने ${eq} सुरक्षा कार्ड तैयार रखे और कोई भी वार आप तक नहीं पहुँचा।`)
      : grade('protection', 'B', 'Nothing hit you this time — but you had no defenses equipped. Luck is not a plan.',
        'इस बार कुछ नहीं बिगड़ा — पर आपके पास कोई सुरक्षा कार्ड नहीं था। क़िस्मत कोई योजना नहीं है।')
  }
  const ratio = b / (b + t)
  const g: Grade = ratio >= 0.5 ? 'A' : ratio >= 0.25 ? 'B' : b > 0 || eq > 0 ? 'C' : 'D'
  if (b > 0) {
    return grade('protection', g,
      `You blocked ${b} of ${b + t} attacks and setbacks; the rest cost you ${inr(s.lossesTaken)}.`,
      `${b + t} में से ${b} वार और मुसीबतें आपने रोक लीं; बाकी से ${inr(s.lossesTaken)} का नुकसान हुआ।`)
  }
  return grade('protection', g,
    `${t} attack${t === 1 ? '' : 's'} and setbacks got through and cost you ${inr(s.lossesTaken)}${eq ? '' : ' — with no defense equipped'}. Insurance and 2FA cards exist for exactly this.`,
    `${t} वार और मुसीबतें आप तक पहुँचीं और ${inr(s.lossesTaken)} का नुकसान हुआ${eq ? '' : ' — कोई सुरक्षा कार्ड लगा ही नहीं था'}। बीमा और 2FA कार्ड इसी के लिए हैं।`)
}

/** Persona ids, in priority order. */
export type PersonaId =
  | 'thrill_seeker' | 'lifestyle_lover' | 'inflation_favourite' | 'firefighter'
  | 'emergency_pro' | 'steady_builder' | 'safety_first' | 'growth_hunter' | 'money_learner'

export const PERSONAS: Record<PersonaId, { title: string; titleHi: string }> = {
  thrill_seeker: { title: 'Thrill Seeker', titleHi: 'रोमांच का शौक़ीन' },
  lifestyle_lover: { title: 'Lifestyle Lover', titleHi: 'शौक़ पहले वाला' },
  inflation_favourite: { title: "Inflation's Favourite Customer", titleHi: 'महंगाई का पसंदीदा ग्राहक' },
  firefighter: { title: 'Always Firefighting', titleHi: 'हमेशा आग बुझाने वाला' },
  emergency_pro: { title: 'Emergency-Ready Pro', titleHi: 'हर मुसीबत के लिए तैयार' },
  steady_builder: { title: 'Steady Builder', titleHi: 'मज़बूत नींव बनाने वाला' },
  safety_first: { title: 'Safety-First Saver', titleHi: 'सुरक्षा पहले वाला बचतकर्ता' },
  growth_hunter: { title: 'Growth Hunter', titleHi: 'ग्रोथ का शिकारी' },
  money_learner: { title: 'Money Learner', titleHi: 'पैसे का विद्यार्थी' },
}

function pickPersona(m: Metrics, grades: Record<Area, Grade>): { id: PersonaId; headline: string; headlineHi: string } {
  const { s } = m
  const ok = (a: Area) => gradeValue(grades[a]) >= gradeValue('B')
  if (m.specShare >= 0.25 || (m.start > 0 && s.speculativeLosses >= m.start * 0.15)) {
    return { id: 'thrill_seeker',
      headline: `Big bets, big swings — and ${inr(s.speculativeLosses)} went up in smoke on crypto and "hot tips".`,
      headlineHi: `बड़े दाँव, बड़े झटके — क्रिप्टो और "हॉट टिप" में ${inr(s.speculativeLosses)} धुएँ में उड़ गए।` }
  }
  if (m.decisions >= 3 && m.spendRatio >= 0.4) {
    return { id: 'lifestyle_lover',
      headline: `You enjoyed the ride — ${s.spends} Spend choices kept your wealth from growing.`,
      headlineHi: `आपने ज़िंदगी के मज़े लिए — ${s.spends} बार के ख़र्च ने दौलत को बढ़ने नहीं दिया।` }
  }
  if (m.avgInvested < 0.2) {
    return { id: 'inflation_favourite',
      headline: `You saved hard, but cash just sat there — inflation quietly took ${inr(s.inflationLost)}.`,
      headlineHi: `आपने ख़ूब बचाया, पर पैसा नकद में पड़ा रहा — महंगाई चुपचाप ${inr(s.inflationLost)} ले गई।` }
  }
  if (s.forcedSales >= 2) {
    return { id: 'firefighter',
      headline: `Emergencies forced you to sell investments ${s.forcedSales} times — a cash cushion would have saved ${inr(s.exitPenaltiesPaid)}.`,
      headlineHi: `मुसीबतों ने आपको ${s.forcedSales} बार निवेश बेचने पर मजबूर किया — नकद का सहारा होता तो ${inr(s.exitPenaltiesPaid)} बच जाते।` }
  }
  if (grades.emergency === 'A' && grades.protection === 'A' && ok('investing') && ok('risk')) {
    return { id: 'emergency_pro',
      headline: 'Invested, protected and ready for surprises — this is how real-life money should work.',
      headlineHi: 'निवेश भी, सुरक्षा भी, और अचानक की मुसीबत की तैयारी भी — असली ज़िंदगी में पैसा ऐसे ही संभालना चाहिए।' }
  }
  if (ok('investing') && ok('risk') && ok('saving')) {
    return { id: 'steady_builder',
      headline: `Save, invest, stay calm — you grew ${inr(m.start)} to ${inr(m.final)} without drama.`,
      headlineHi: `बचाओ, निवेश करो, शांत रहो — आपने बिना हड़बड़ी ${inr(m.start)} को ${inr(m.final)} बना दिया।` }
  }
  if (m.safeShare >= 0.6) {
    return { id: 'safety_first',
      headline: 'Your money was safe — but FDs and PPF barely outran inflation.',
      headlineHi: 'आपका पैसा सुरक्षित रहा — पर FD और PPF महंगाई से बस थोड़ा ही आगे निकल पाए।' }
  }
  if (m.growthShare >= 0.5) {
    return { id: 'growth_hunter',
      headline: 'You backed growth — now add a safety net so one bad year cannot knock you down.',
      headlineHi: 'आपने ग्रोथ पर भरोसा किया — अब एक सुरक्षा जाल भी बनाइए ताकि एक बुरा साल आपको गिरा न सके।' }
  }
  return { id: 'money_learner',
    headline: 'Every game teaches something — the lessons below are yours from this one.',
    headlineHi: 'हर खेल कुछ सिखाता है — नीचे इस खेल के आपके सबक हैं।' }
}

function buildProjection(m: Metrics): ReportCard['projection'] {
  const P = PROJECTION_MONTHLY
  const Y = PROJECTION_YEARS
  const fdValue = sipFutureValue(P, FD_RATE_PCT, Y)
  const indexValue = sipFutureValue(P, INDEX_RATE_PCT, Y)
  const total = inr(P * 12 * Y)
  const assumptions = 'Assumes long-run averages: stocks capped at 12% a year, crypto counted at 0% (too unpredictable to plan on), "hot tip" schemes at −80%. Real returns vary every year and are never guaranteed.'
  const assumptionsHi = 'यह लंबे समय के औसत पर आधारित है: शेयरों पर ज़्यादा से ज़्यादा 12% सालाना, क्रिप्टो पर 0% (इतना अनिश्चित कि उस पर योजना नहीं बन सकती), और "हॉट टिप" स्कीमों पर −80%। असली रिटर्न हर साल बदलते हैं और कभी पक्के नहीं होते।'

  if (m.totalInvested <= 0) {
    const yourMixValue = sipFutureValue(P, SAVINGS_RATE_PCT, Y)
    return {
      years: Y, monthlyAmount: P, yourMixValue, fdValue, indexValue,
      explanation: `You kept everything in cash, so picture ₹5,000 a month in a savings account at about ${SAVINGS_RATE_PCT}% for ${Y} years (${total} in total): about ${inr(yourMixValue)}. The same money in an FD at ${FD_RATE_PCT}% grows to about ${inr(fdValue)}, and in a plain index fund SIP at ${INDEX_RATE_PCT}% to about ${inr(indexValue)}. ${assumptions}`,
      explanationHi: `आपने सब कुछ नकद में रखा, तो मान लीजिए ${Y} साल तक हर महीने ₹5,000 (कुल ${total}) लगभग ${SAVINGS_RATE_PCT}% वाले बचत खाते में: लगभग ${inr(yourMixValue)}। यही पैसा ${FD_RATE_PCT}% वाली FD में लगभग ${inr(fdValue)}, और ${INDEX_RATE_PCT}% वाले सीधे-सादे इंडेक्स फंड SIP में लगभग ${inr(indexValue)} हो जाता। ${assumptionsHi}`,
    }
  }

  const weights = m.classes.map(a => ({ a, w: m.share([a]) }))
  const yourMixValue = Math.round(weights.reduce((sum, { a, w }) => sum + w * sipFutureValue(P, projectionRatePct(a), Y), 0))
  const mix = weights.slice(0, 3).map(({ a, w }) => `${pct(w)}% ${ASSETS[a].name}`).join(', ') + (weights.length > 3 ? ', …' : '')
  const mixHi = weights.slice(0, 3).map(({ a, w }) => `${pct(w)}% ${ASSETS[a].nameHi}`).join(', ') + (weights.length > 3 ? ', …' : '')
  return {
    years: Y, monthlyAmount: P, yourMixValue, fdValue, indexValue,
    explanation: `If you put ₹5,000 a month for ${Y} years (${total} in total) into the same mix you chose here (${mix}), it could grow to about ${inr(yourMixValue)}. In an FD at ${FD_RATE_PCT}% it would be about ${inr(fdValue)}; in a plain index fund SIP at ${INDEX_RATE_PCT}%, about ${inr(indexValue)}. ${assumptions}`,
    explanationHi: `अगर आप ${Y} साल तक हर महीने ₹5,000 (कुल ${total}) उसी मिक्स में लगाएँ जो आपने यहाँ चुना (${mixHi}), तो यह लगभग ${inr(yourMixValue)} हो सकता है। ${FD_RATE_PCT}% वाली FD में यह लगभग ${inr(fdValue)} होता; ${INDEX_RATE_PCT}% वाले सीधे-सादे इंडेक्स फंड SIP में लगभग ${inr(indexValue)}। ${assumptionsHi}`,
  }
}

function buildLessons(m: Metrics, player: PlayerState): Lesson[] {
  const { s, start } = m
  const out: (Lesson & { pri: number })[] = []
  const add = (pri: number, conceptId: ConceptId, text: string, textHi: string) => out.push({ pri, conceptId, text, textHi })
  const hits = s.hits ?? []

  const sales = s.forcedSaleLog ?? []
  if (sales.length) {
    const w = [...sales].sort((a, b) => b.penalty - a.penalty)[0]
    const a = ASSETS[w.asset]
    const more = sales.length - 1
    add(100, 'emergency_fund',
      `You had to sell ${a.name} at a ${w.penaltyPct}% penalty in Year ${w.round} (${inr(w.penalty)} lost)${more ? ` and made ${more} more forced sale${more === 1 ? '' : 's'}` : ''} — an emergency fund of ~6 months' expenses avoids this.`,
      `साल ${w.round} में आपको ${a.nameHi} ${w.penaltyPct}% पेनल्टी पर बेचना पड़ा (${inr(w.penalty)} का नुकसान)${more ? `, और ${more} बार और मजबूरी में बेचना पड़ा` : ''} — लगभग 6 महीने के ख़र्च जितना इमरजेंसी फंड हो तो ऐसा नहीं करना पड़ता।`)
  }

  const scamIn = s.investedByAsset.scam ?? 0
  if (scamIn > 0) {
    const lure = hits.find(h => h.lureAsset === 'scam' && !h.blocked)
    add(98, 'scams',
      `${inr(scamIn)} went into ${lure ? `the "${lure.name}" in Year ${lure.round}` : 'a "guaranteed returns" scheme'}${s.speculativeLosses > 0 ? ` and ${inr(s.speculativeLosses)} of speculative money vanished` : ''} — "guaranteed + urgent + secret" is the classic scam recipe. Check SEBI / RBI registration first.`,
      `${lure ? `साल ${lure.round} में "${lure.nameHi ?? lure.name}" में` : 'एक "पक्के रिटर्न" वाली स्कीम में'} ${inr(scamIn)} चले गए${s.speculativeLosses > 0 ? `, और सट्टे का ${inr(s.speculativeLosses)} डूब गया` : ''} — "पक्का + जल्दी करो + सिर्फ़ आपके लिए" हर स्कैम का नुस्ख़ा है। पहले SEBI / RBI रजिस्ट्रेशन जाँचिए।`)
  } else if (hits.some(h => h.lureAsset === 'scam' && h.blocked)) {
    const h = hits.find(x => x.lureAsset === 'scam' && x.blocked)!
    add(35, 'scams',
      `Your defense stopped the "${h.name}" in Year ${h.round} — in real life, "guaranteed" high returns are the biggest red flag.`,
      `साल ${h.round} में आपकी सुरक्षा ने "${h.nameHi ?? h.name}" को रोक दिया — असल ज़िंदगी में "पक्का" ऊँचा रिटर्न सबसे बड़ा ख़तरे का निशान है।`)
  }

  if (m.avgInvested < 0.3 && s.inflationLost >= start * 0.05) {
    add(90, 'inflation',
      `Inflation quietly ate ${inr(s.inflationLost)} of your cash over ${m.years} year${m.years === 1 ? '' : 's'} — beyond your emergency fund, money needs to grow faster than prices.`,
      `${m.years} साल में महंगाई ने चुपचाप आपकी नकदी से ${inr(s.inflationLost)} खा लिए — इमरजेंसी फंड के अलावा बाकी पैसे को दामों से तेज़ बढ़ना चाहिए।`)
  }

  const cryptoIn = s.investedByAsset.crypto ?? 0
  if (cryptoIn > 0) {
    const crash = s.worstMarketDrop?.asset === 'crypto' ? s.worstMarketDrop : null
    add(85, 'crypto_risk',
      `You put ${inr(cryptoIn)} into crypto${crash ? `, which fell ${Math.abs(crash.pct)}% in Year ${crash.round}` : ''} — it is speculation, so only use money you can afford to lose completely.`,
      `आपने क्रिप्टो में ${inr(cryptoIn)} लगाए${crash ? `, जो साल ${crash.round} में ${Math.abs(crash.pct)}% गिर गया` : ''} — यह सट्टा है, इसमें सिर्फ़ उतना पैसा लगाइए जितना पूरा डूब जाए तो भी चल जाए।`)
  }

  const medical = hits.find(h => h.category === 'medical' && !h.blocked && h.amount > 0)
  const medicalBlocked = hits.find(h => h.category === 'medical' && h.blocked)
  if (medical) {
    add(80, 'health_insurance',
      `A ${medical.name} cost you ${inr(medical.amount)} in Year ${medical.round} — a health cover of ₹5–10 lakh keeps hospital bills away from your savings.`,
      `साल ${medical.round} में ${medical.nameHi ?? medical.name} से ${inr(medical.amount)} का झटका लगा — ₹5–10 लाख का हेल्थ इंश्योरेंस अस्पताल के बिल को आपकी बचत से दूर रखता है।`)
  } else if (medicalBlocked) {
    add(30, 'health_insurance',
      `Your cover blocked a ${medicalBlocked.name} in Year ${medicalBlocked.round} — that is insurance doing its job.`,
      `साल ${medicalBlocked.round} में आपके कवर ने ${medicalBlocked.nameHi ?? medicalBlocked.name} को रोक दिया — बीमा ठीक यही काम करता है।`)
  }

  if (s.spends >= 3 && (m.spendRatio >= 0.4 || m.lifestyle >= 3)) {
    add(75, 'lifestyle_creep',
      `You chose Spend ${s.spends} times; each upgrade raised your lifestyle level (now ${m.lifestyle}) and made inflation bite harder. Let spending grow slower than income.`,
      `आपने ${s.spends} बार ख़र्च चुना; हर बार लाइफ़स्टाइल लेवल बढ़ा (अब ${m.lifestyle}) और महंगाई की मार भी। ख़र्च को कमाई से धीमे बढ़ने दीजिए।`)
  }

  const fraud = hits.find(h => h.category === 'fraud' && !h.blocked && !h.lureAsset && h.amount > 0)
  if (fraud) {
    add(70, 'cyber_safety',
      `"${fraud.name}" cost you ${inr(fraud.amount)} in Year ${fraud.round} — never share OTPs or PINs, and turn on two-factor login everywhere.`,
      `साल ${fraud.round} में "${fraud.nameHi ?? fraud.name}" से ${inr(fraud.amount)} का नुकसान हुआ — OTP या PIN कभी किसी को न बताएँ, और हर जगह टू-फ़ैक्टर लॉगिन चालू रखें।`)
  }

  if (m.totalInvested > 0 && m.safeShare >= 0.6) {
    add(65, 'fd_vs_inflation',
      `${pct(m.safeShare)}% of your investing sat in FD / PPF-type options at about 7% — after ~6% inflation that is only ~1% real growth. Long-term goals need some equity too.`,
      `आपके निवेश का ${pct(m.safeShare)}% FD / PPF जैसे विकल्पों में लगभग 7% पर रहा — ~6% महंगाई के बाद असली बढ़त सिर्फ़ ~1% है। लंबे लक्ष्यों के लिए कुछ इक्विटी भी चाहिए।`)
  }

  if (s.invests >= 3 && m.classes.length === 1) {
    const a = ASSETS[m.classes[0]]
    add(60, 'diversification',
      `All ${s.invests} of your investments went into ${a.name} — spreading money across 3+ asset types means one bad year can't sink you.`,
      `आपके सभी ${s.invests} निवेश ${a.nameHi} में गए — पैसे को 3 या ज़्यादा तरह के निवेश में बाँटिए, ताकि एक बुरा साल सब न डुबो दे।`)
  }

  const drop = s.worstMarketDrop
  if (drop && drop.asset !== 'crypto' && drop.asset !== 'scam' && getHoldings(player).some(h => h.asset === drop.asset)) {
    const a = ASSETS[drop.asset]
    add(55, 'market_patience',
      `Your ${a.name} fell ${Math.abs(drop.pct)}% in Year ${drop.round}, but you stayed invested — patience is how long-term investors recover from crashes.`,
      `साल ${drop.round} में आपका ${a.nameHi} ${Math.abs(drop.pct)}% गिरा, पर आप टिके रहे — धैर्य से ही लंबे समय के निवेशक गिरावट से उबरते हैं।`)
  }

  // The biggest setback that got through, as a lesson for its category
  const worstHit = [...hits].filter(h => !h.blocked && h.amount > 0).sort((a, b) => b.amount - a.amount)[0]
  if (worstHit) {
    const HIT: Partial<Record<EventCategory, [ConceptId, string, string]>> = {
      market: ['market_patience', 'markets recover over time for patient, diversified investors, so never sell in panic.', 'धैर्य रखने वाले, बँटे हुए निवेशकों के लिए बाज़ार समय के साथ संभलता है, इसलिए घबराकर न बेचें।'],
      tax: ['tax_saving', 'declare all income (FD and savings interest too) — penalties cost more than the tax.', 'सारी आय बताइए (FD और बचत खाते का ब्याज भी) — पेनल्टी टैक्स से महंगी पड़ती है।'],
    }
    const [conceptId, tip, tipHi] = HIT[worstHit.category ?? 'personal'] ?? ['emergency_fund',
      'a cash cushion of about 6 months of expenses (and the right insurance) absorbs shocks like this.',
      'लगभग 6 महीने के ख़र्च जितना नकद सहारा (और सही बीमा) ऐसे झटके झेल लेता है।']
    add(50, conceptId,
      `"${worstHit.name}" cost you ${inr(worstHit.amount)} in Year ${worstHit.round} — ${tip}`,
      `साल ${worstHit.round} में "${worstHit.nameHi ?? worstHit.name}" से ${inr(worstHit.amount)} का नुकसान हुआ — ${tipHi}`)
  }

  const indexIn = s.investedByAsset.index ?? 0
  if (indexIn > 0) {
    add(45, 'index_funds',
      `You put ${inr(indexIn)} into index funds — low-cost, whole-market investing through a monthly SIP is the backbone of long-term wealth.`,
      `आपने इंडेक्स फंड में ${inr(indexIn)} लगाए — कम ख़र्च वाला, पूरे बाज़ार में हर महीने SIP से निवेश लंबे समय की दौलत की रीढ़ है।`)
  }

  if (s.maxSaveStreak >= 3) {
    add(40, 'pay_yourself_first',
      `You saved ${s.maxSaveStreak} turns in a row — paying yourself first, before spending, is the habit that builds wealth.`,
      `आपने लगातार ${s.maxSaveStreak} बार बचत की — ख़र्च से पहले ख़ुद को भुगतान करना ही दौलत बनाने की आदत है।`)
  }

  add(10, 'compounding',
    'Money invested early grows on its own growth — ₹5,000 a month at 12% a year becomes about ₹11.6 lakh in 10 years.',
    'जल्दी लगाया पैसा अपनी बढ़त पर भी बढ़ता है — 12% सालाना पर हर महीने ₹5,000 दस साल में लगभग ₹11.6 लाख बन जाते हैं।')

  const seen = new Set<ConceptId>()
  return out
    .sort((a, b) => b.pri - a.pri)
    .filter(l => (seen.has(l.conceptId) ? false : (seen.add(l.conceptId), true)))
    .slice(0, 3)
    .map(({ conceptId, text, textHi }) => ({ conceptId, text, textHi }))
}

/**
 * Build the end-of-game report card for one player. Pure and deterministic:
 * the same state always gives the same card.
 */
export function buildReportCard(state: GameState, playerId: string): ReportCard {
  const player = state.players.find(p => p.id === playerId) ?? state.players[0]
  const stats = player.stats ?? emptyStats(state.levelConfig?.startingCorpus ?? getNetWorth(player))
  const m = metrics(player, stats)

  const grades = [gradeSaving(m), gradeInvesting(m), gradeRisk(m), gradeEmergency(m), gradeProtection(m)]
  const byArea = Object.fromEntries(grades.map(g => [g.area, g.grade])) as Record<Area, Grade>
  const persona = pickPersona(m, byArea)

  return {
    playerId: player.id,
    personaId: persona.id,
    startNetWorth: m.start,
    finalNetWorth: m.final,
    personaTitle: PERSONAS[persona.id].title,
    personaTitleHi: PERSONAS[persona.id].titleHi,
    headline: persona.headline,
    headlineHi: persona.headlineHi,
    grades,
    projection: buildProjection(m),
    lessons: buildLessons(m, player),
    conceptsUnlocked: [...stats.conceptsTriggered],
  }
}
