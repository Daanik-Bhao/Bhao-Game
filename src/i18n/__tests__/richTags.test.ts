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

/** Sorted list of <tag> / </tag> tokens used by <Trans> (e.g. the legal pages' <strong>, <mail>). */
const tags = (s: string) => (s.match(/<\/?[a-zA-Z]+>/g) ?? []).sort()

const en = leaves(LOCALE_TREES.en)
const others = { hi: leaves(LOCALE_TREES.hi), hinglish: leaves(LOCALE_TREES.hinglish) }

describe('i18n rich-text tags', () => {
  it('hi and hinglish use exactly the same <tags> as en, so <Trans> renders every link and highlight', () => {
    const bad: string[] = []
    for (const [key, value] of en) {
      const want = tags(value)
      for (const [lang, map] of Object.entries(others)) {
        const got = tags(map.get(key) ?? '')
        if (got.join() !== want.join()) bad.push(`${lang}:${key}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('every opened tag is closed in en', () => {
    const bad = [...en].filter(([, v]) => {
      const t = tags(v)
      return t.filter(x => !x.startsWith('</')).length !== t.filter(x => x.startsWith('</')).length
    }).map(([k]) => k)
    expect(bad).toEqual([])
  })
})
