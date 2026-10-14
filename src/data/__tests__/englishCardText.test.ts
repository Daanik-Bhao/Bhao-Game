import { describe, it, expect } from 'vitest'
import { ALL_CARDS } from '../cards'
import { LEVEL_SITUATION_CARDS } from '../levelCards'
import { BUILTIN_LIFE_EVENTS } from '../lifeEvents'
import type { GameCard } from '../../types/game'

/**
 * English card fields are shown in the `en` locale (and reused by `hinglish`), so they must be plain
 * English. A card titled "Borrow Karna Padega" once showed up in English mode; this guards against
 * romanised Hindi / Devanagari creeping back into English text. Indian-English finance terms
 * (Diwali, EMI, SIP, lakh, crore, chit fund, tiffin...) are fine and are not in the list.
 * Words that are also English (to, do, me, par, beta, loot, mama...) are deliberately left out.
 */
const HINDI_WORDS = [
  'aap', 'abhi', 'accha', 'achha', 'apna', 'apne', 'apni', 'arre', 'aur', 'baad', 'baaki', 'bachat', 'bachche',
  'bachao', 'bachata', 'bada', 'badi', 'bahut', 'bhaago', 'bhai', 'bhi', 'bol', 'bolo', 'bologe', 'chakkar', 'chalo',
  'chhod', 'dena', 'diya', 'dost', 'dosto', 'gaya', 'gaye', 'ghar', 'hain', 'hai', 'hisaab', 'hota', 'jaayega',
  'jugaad', 'ka', 'kab', 'kaha', 'kaise', 'karna', 'karo', 'karein', 'karega', 'karte', 'kharcha', 'ke', 'ki',
  'kiya', 'kuch', 'kya', 'kyun', 'lagao', 'lagega', 'lagta', 'liya', 'maa', 'mahine', 'mein', 'mila', 'milega',
  'naukri', 'naya', 'nahi', 'nahin', 'padega', 'padhai', 'paisa', 'paise', 'pehle', 'pehli', 'raha', 'rahe',
  'roz', 'ruko', 'sahara', 'sapna', 'shaadi', 'socha', 'tabiyat', 'toh', 'udhaar', 'wala', 'wale', 'wali',
  'yaar', 'zyada',
]
const HINDI_RE = new RegExp(`\\b(${HINDI_WORDS.join('|')})\\b`, 'i')
const DEVANAGARI = /[ऀ-ॿ]/

const CARDS: GameCard[] = [...ALL_CARDS, ...LEVEL_SITUATION_CARDS, ...BUILTIN_LIFE_EVENTS]

/** Every English-facing text field of a card and its options, as [label, text]. */
function englishFields(c: GameCard): [string, string][] {
  const out: [string, string][] = []
  const add = (k: string, v: string | undefined) => { if (v) out.push([`${c.id}.${k}`, v]) }
  add('name', c.name)
  add('shortName', c.shortName)
  add('flavor', c.flavor)
  add('shortFlavor', c.shortFlavor)
  add('mentorInsight', c.mentorInsight)
  c.options?.forEach((o, i) => {
    add(`options[${i}].label`, o.label)
    add(`options[${i}].shortLabel`, o.shortLabel)
    add(`options[${i}].description`, o.description)
    add(`options[${i}].shortDescription`, o.shortDescription)
    add(`options[${i}].mentorInsight`, o.mentorInsight)
  })
  return out
}

describe('English card text has no romanised Hindi or Devanagari', () => {
  it('scans a non-trivial number of cards', () => {
    expect(CARDS.length).toBeGreaterThan(200)
  })

  it('name / shortName are English', () => {
    const bad = CARDS.flatMap(c => englishFields(c))
      .filter(([k]) => /\.(name|shortName)$/.test(k))
      .filter(([, v]) => HINDI_RE.test(v) || DEVANAGARI.test(v))
      .map(([k, v]) => `${k}: ${v}`)
    expect(bad).toEqual([])
  })

  it('flavor, options and mentor text are English', () => {
    const bad = CARDS.flatMap(c => englishFields(c))
      .filter(([, v]) => HINDI_RE.test(v) || DEVANAGARI.test(v))
      .map(([k, v]) => `${k}: ${v}`)
    expect(bad).toEqual([])
  })

  it('nameHi / shortNameHi are written in Devanagari', () => {
    // An all-caps acronym such as "ESOP" is fine on its own.
    const bad = CARDS.flatMap(c => [[`${c.id}.nameHi`, c.nameHi], [`${c.id}.shortNameHi`, c.shortNameHi]] as const)
      .filter(([, v]) => v && !DEVANAGARI.test(v) && !/^[A-Z0-9]+$/.test(v))
      .map(([k, v]) => `${k}: ${v}`)
    expect(bad).toEqual([])
  })
})
