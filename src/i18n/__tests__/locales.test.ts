import { describe, it, expect } from 'vitest'
import en from '../locales/en.json'
import hi from '../locales/hi.json'
import hinglish from '../locales/hinglish.json'
import { pickLang } from '../lang'

type Tree = { [k: string]: string | Tree }

/** "a.b.c" for every leaf string. */
function leaves(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out.set(key, v)
    else for (const [kk, vv] of leaves(v, key)) out.set(kk, vv)
  }
  return out
}

const LOCALES = { en: leaves(en as Tree), hi: leaves(hi as Tree), hinglish: leaves(hinglish as Tree) }
const vars = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).map(v => v.replace(/\s/g, '')).sort()

describe('locale files', () => {
  it('en, hi and hinglish have exactly the same keys', () => {
    const enKeys = [...LOCALES.en.keys()].sort()
    expect([...LOCALES.hi.keys()].sort()).toEqual(enKeys)
    expect([...LOCALES.hinglish.keys()].sort()).toEqual(enKeys)
  })

  it('no empty strings', () => {
    for (const [lng, map] of Object.entries(LOCALES)) {
      for (const [k, v] of map) expect(v.trim(), `${lng}:${k}`).not.toBe('')
    }
  })

  it('translations use the same {{placeholders}} as English', () => {
    for (const [k, v] of LOCALES.en) {
      const want = vars(v)
      // Hindi may legitimately drop an English-only suffix like the ordinal ("1st")
      const hiVars = vars(LOCALES.hi.get(k) ?? '')
      expect(hiVars.every(x => want.includes(x)), `hi:${k}`).toBe(true)
      expect(vars(LOCALES.hinglish.get(k) ?? ''), `hinglish:${k}`).toEqual(want)
    }
  })

  it('Hindi strings are actually in Devanagari (not copied English)', () => {
    let devanagari = 0
    for (const v of LOCALES.hi.values()) if (/[ऀ-ॿ]/.test(v)) devanagari++
    expect(devanagari / LOCALES.hi.size).toBeGreaterThan(0.85)
  })
})

describe('pickLang', () => {
  it('uses Hindi only for hi, and falls back to English when Hindi is missing', () => {
    expect(pickLang('Gold', 'सोना', 'hi')).toBe('सोना')
    expect(pickLang('Gold', 'सोना', 'en')).toBe('Gold')
    expect(pickLang('Gold', 'सोना', 'hinglish')).toBe('Gold')
    expect(pickLang('Gold', '', 'hi')).toBe('Gold')
    expect(pickLang('Gold', undefined, 'hi')).toBe('Gold')
  })
})
