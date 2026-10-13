import { describe, expect, it } from 'vitest'
import { resultHeadline } from '../resultHeadline'

const base = { won: false, start: 500000, goal: 5000000 }

describe('resultHeadline (spec §E.20)', () => {
  it('a win beats every other rule', () => {
    expect(resultHeadline({ ...base, won: true, final: 100 })).toMatchObject({ kind: 'won', mood: 'cheer', confetti: true })
  })
  it('grew at least 2× → multiple with one decimal', () => {
    expect(resultHeadline({ ...base, final: 1430000 })).toMatchObject({ kind: 'grew2x', multiple: '2.9' })
    expect(resultHeadline({ ...base, final: 1000000 })).toMatchObject({ kind: 'grew2x', multiple: '2' })
  })
  it('grew but lost the game says "grew", never "better luck"', () => {
    expect(resultHeadline({ ...base, final: 650000 })).toMatchObject({ kind: 'grew', pct: 30, mood: 'happy', confetti: false })
  })
  it('near miss when within 20% of the goal without growth', () => {
    expect(resultHeadline({ won: false, start: 4500000, goal: 5000000, final: 4200000 })).toMatchObject({ kind: 'nearMiss', gap: 800000, mood: 'wow' })
  })
  it('shrank otherwise', () => {
    expect(resultHeadline({ ...base, final: 300000 })).toMatchObject({ kind: 'shrank', mood: 'think' })
    expect(resultHeadline({ ...base, final: 500000 })).toMatchObject({ kind: 'shrank' })
  })
})
