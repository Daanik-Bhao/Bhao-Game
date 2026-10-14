import { describe, it, expect } from 'vitest'
import { ALL_CARDS } from '../cards'
import { BUILTIN_LIFE_EVENTS } from '../lifeEvents'
import { cardTitle, cardFullTitle } from '../../components/GameCard'

/**
 * Spec §A.2 q2 (P2 content task): hand cards are 70×104 (68×100 under 375 px) and names wrap
 * to at most 3 lines (12 px for long words / long names). Card names measured in Chrome
 * (/__ux/cards, Baloo 2) that needed more than 3 lines got a shorter `shortName` /
 * `shortNameHi`; the full name stays in `name` / `nameHi` (card sheet header, aria-label).
 * Add a name here (with a todo) only while it still waits for a short name.
 */
export const NEEDS_SHORTER_NAME_EN: string[] = []
export const NEEDS_SHORTER_NAME_HI: string[] = []

/**
 * Text-only stand-in for the Chrome measurement. A short name must stay within
 * SHORT_NAME_LIMIT (grapheme count, so Devanagari matras don't count separately) and no word may
 * be longer than one hand-card line (~9 Latin letters / ~6 Devanagari graphemes at 12 px).
 */
export const SHORT_NAME_LIMIT = {
  en: { total: 16, word: 9 },
  hi: { total: 14, word: 6 },
} as const

/** Rough hand-card line widths (characters per line) used for the all-cards wrap check. */
const LINE_CHARS = { en: 10, hi: 7 } as const
const MAX_LINES = 3

// Intl.Segmenter isn't in the project's TS lib (same cast as longestWordLength in GameCard.tsx).
type Segmenter = { segment: (s: string) => Iterable<unknown> }
const Seg = (Intl as unknown as { Segmenter: new (l?: string, o?: { granularity: string }) => Segmenter }).Segmenter
const seg = new Seg(undefined, { granularity: 'grapheme' })
const graphemes = (s: string) => Array.from(seg.segment(s)).length
const longestWord = (s: string) => s.split(/\s+/).reduce((m, w) => Math.max(m, graphemes(w)), 0)

/** Greedy word wrap at `width` characters per line; words longer than a line break across lines. */
function wrappedLines(text: string, width: number): number {
  let lines = 0
  let cur = 0
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const len = graphemes(w)
    if (cur > 0 && cur + 1 + len <= width) { cur += 1 + len; continue }
    lines += Math.ceil(len / width)
    cur = len % width || width
  }
  return lines
}

const CARDS = [...ALL_CARDS, ...BUILTIN_LIFE_EVENTS]

describe('card names that need a shorter shortName (content task)', () => {
  it('the list only names real cards', () => {
    const titles = new Set(CARDS.flatMap(c => [c.shortName || c.name, c.shortNameHi || c.nameHi || '']))
    for (const n of [...NEEDS_SHORTER_NAME_EN, ...NEEDS_SHORTER_NAME_HI]) expect(titles.has(n), n).toBe(true)
  })
  for (const n of NEEDS_SHORTER_NAME_EN) it.todo(`en: shorter shortName for "${n}"`)
  for (const n of NEEDS_SHORTER_NAME_HI) it.todo(`hi: shorter shortNameHi for "${n}"`)
})

/**
 * Cards whose names were measured as too long (the former NEEDS_SHORTER_NAME_* lists, by id).
 * Their displayed name must now meet SHORT_NAME_LIMIT.
 */
const SHORTENED_EN = [
  'dc_food_delivery_dependency_16', 'dc_speculative_investment_tip_20', 'dc_paid_upskilling_opportunity_21',
  'dc_fronting_money_for_a_group_24', 'dc_paying_for_ambience_26', 'dc_negotiation_opportunity_39',
  'dc_lifestyle_inflation_temptation_40', 'dc_social_media_investment_tip_49', 'dc_rent_increase_notification_53',
  'dc_major_social_event_expense_59', 'dc_late_night_online_shopping_69', 'dc_missed_credit_card_payment_71',
  'dc_destination_wedding_invite_78', 'dc_professional_certification_81', 'dc_leaky_roof_emergency_97',
  'dc_hidden_app_subscriptions_98', 'dc_lottery_ticket_temptation_100', 'dc_flight_upgrade_temptation_102',
  'dc_expensive_city_relocation_112', 'dc_unpaid_mental_health_break_120', 'dc_bank_minimum_balance_penalty_131',
  'dc_bottle_service_peer_pressure_132', 'dc_high_interest_payday_loan_136', 'dc_skipping_routine_maintenance_138',
  'dc_premium_cybersecurity_software_171', 'dc_extended_manufacturer_warranty_186',
  'def_the_ultimate_shield_emergency_bailout_200', 'leg_compound_machine', 'le_chit_fund_scheme',
]
/** The 14 measured Hindi names, plus the other cards above (their literal Hindi names were long too). */
const SHORTENED_HI = [
  ...SHORTENED_EN,
  'dc_joining_signing_bonus_27', 'dc_out_of_budget_social_trip_28', 'dc_daily_lunch_ordering_46',
  'dc_annual_insurance_renewal_77', 'dc_emergency_vet_bill_87', 'dc_underpaid_tax_surprise_101',
  'dc_family_emergency_support_126', 'dc_bootstrapping_a_business_140', 'leg_bankruptcy_shield',
]

const byId = new Map(CARDS.map(c => [c.id, c]))

describe('short card names fit a hand card', () => {
  for (const id of SHORTENED_EN) {
    const c = byId.get(id)
    it(`en/hinglish: ${id} → "${c?.shortName}"`, () => {
      expect(c, id).toBeDefined()
      const s = cardTitle(c!, 'en')
      expect(c!.shortName, 'has a shortName').toBeTruthy()
      expect(cardTitle(c!, 'hinglish'), 'hinglish shows the English short name').toBe(s)
      expect(graphemes(s), s).toBeLessThanOrEqual(SHORT_NAME_LIMIT.en.total)
      expect(longestWord(s), s).toBeLessThanOrEqual(SHORT_NAME_LIMIT.en.word)
      expect(s.length, 'shorter than the full name').toBeLessThan(c!.name.length)
    })
  }
  for (const id of SHORTENED_HI) {
    const c = byId.get(id)
    it(`hi: ${id} → "${c ? cardTitle(c, 'hi') : ''}"`, () => {
      expect(c, id).toBeDefined()
      const s = cardTitle(c!, 'hi')
      expect(/[ऀ-ॿ]/.test(s), 'Devanagari').toBe(true)
      expect(graphemes(s), s).toBeLessThanOrEqual(SHORT_NAME_LIMIT.hi.total)
      expect(longestWord(s), s).toBeLessThanOrEqual(SHORT_NAME_LIMIT.hi.word)
    })
  }

  it('every displayed hand-card name wraps to at most 3 lines (en, hinglish, hi)', () => {
    const tooLong: string[] = []
    for (const c of CARDS) {
      const en = cardTitle(c, 'en')
      const hi = cardTitle(c, 'hi')
      if (wrappedLines(en, LINE_CHARS.en) > MAX_LINES) tooLong.push(`en: ${en}`)
      if (wrappedLines(cardTitle(c, 'hinglish'), LINE_CHARS.en) > MAX_LINES) tooLong.push(`hinglish: ${en}`)
      if (wrappedLines(hi, LINE_CHARS.hi) > MAX_LINES) tooLong.push(`hi: ${hi}`)
    }
    expect(tooLong).toEqual([])
  })

  it('no hand-card word joined by "/" is wider than one line (it can only break mid-letter)', () => {
    // softHyphenate only splits plain Latin words; "Joining/Signing" overflowed on the Android build.
    const bad: string[] = []
    for (const c of CARDS) {
      for (const [lang, limit] of [['en', SHORT_NAME_LIMIT.en.word], ['hi', SHORT_NAME_LIMIT.hi.word]] as const) {
        const title = cardTitle(c, lang)
        for (const w of title.split(/\s+/)) if (w.includes('/') && graphemes(w) > limit) bad.push(`${lang}: ${title}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('the full name is still available for the card sheet and aria-label', () => {
    for (const c of CARDS) {
      expect(cardFullTitle(c, 'en')).toBe(c.name)
      expect(cardFullTitle(c, 'hinglish')).toBe(c.name)
      expect(cardFullTitle(c, 'hi')).toBe(c.nameHi || c.name)
    }
  })
})
