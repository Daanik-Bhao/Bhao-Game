import { describe, expect, it } from 'vitest'
import { LOCALE_TREES, type LocaleTree } from '../resources'

/** "a.b.c" → value for every leaf string. */
function leaves(tree: LocaleTree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>()
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out.set(key, v)
    else for (const [kk, vv] of leaves(v, key)) out.set(kk, vv)
  }
  return out
}

const en = leaves(LOCALE_TREES.en)
const hi = leaves(LOCALE_TREES.hi)
const hinglish = leaves(LOCALE_TREES.hinglish)

// Spec §F.4: every key in en exists (non-empty) in hi and hinglish — including the locale parts.
describe('i18n parity (main locale files + parts)', () => {
  it('every en key exists in hi and hinglish with a non-empty value', () => {
    const missing: string[] = []
    for (const key of en.keys()) {
      if (!hi.get(key)?.trim()) missing.push(`hi:${key}`)
      if (!hinglish.get(key)?.trim()) missing.push(`hinglish:${key}`)
    }
    expect(missing).toEqual([])
  })

  it('hi and hinglish have no keys that en lacks', () => {
    const extra = [...hi.keys(), ...hinglish.keys()].filter(k => !en.has(k))
    expect(extra).toEqual([])
  })

  it('translations only use interpolation variables that en provides', () => {
    const vars = (s: string) => (s.match(/{{\s*\w+\s*}}/g) ?? []).map(v => v.replace(/\s/g, ''))
    const bad: string[] = []
    for (const [key, value] of en) {
      const known = new Set(vars(value))
      for (const [lang, tree] of [['hi', hi], ['hinglish', hinglish]] as const) {
        const tr = tree.get(key)
        if (tr && vars(tr).some(v => !known.has(v))) bad.push(`${lang}:${key}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('no banned casino / gambling copy in any language (spec §A.3, §H)', () => {
    const banned = /\b(jackpot|better luck|dominate|entry reward|entry fee)\b/i
    // TODO(Phase 3): these legacy keys are deleted when their screens are migrated; then this list must be empty.
    const pendingRemoval = new Set(['result.betterLuck', 'setup.entryReward', 'landing.hero3'])
    const hits = [...en, ...hi, ...hinglish].filter(([k, v]) => banned.test(v) && !pendingRemoval.has(k)).map(([k]) => k)
    expect(hits).toEqual([])
  })
})
