import { describe, expect, it } from 'vitest'
import { SHY, hyphenateText, hyphenateWord } from '../hyphenate'
import { ALL_CARDS } from '../../data/cards'
import { BUILTIN_LIFE_EVENTS } from '../../data/lifeEvents'

const show = (s: string) => s.split(SHY).join('-')

describe('card-name hyphenation (syllable points only)', () => {
  it('breaks the reported words at syllables, never mid-syllable', () => {
    expect(show(hyphenateText('Diversified Portfolio'))).toBe('Diver-si-fied Port-fo-lio')
    expect(show(hyphenateText('FIRE Movement'))).toBe('FIRE Move-ment')
    expect(show(hyphenateWord('Vacation'))).toBe('Vaca-tion')
    expect(show(hyphenateWord('Equipment'))).toBe('Equip-ment')
    expect(show(hyphenateWord('Performance'))).toBe('Per-for-mance')
    expect(show(hyphenateWord('Subscription'))).toBe('Sub-scrip-tion')
    expect(show(hyphenateWord('Spending'))).toBe('Spend-ing')
    expect(show(hyphenateWord('Planning'))).toBe('Plan-ning')
    expect(show(hyphenateWord('Insurance'))).toBe('Insur-ance')
  })

  it('leaves short words, Devanagari and the plain text intact', () => {
    expect(hyphenateText('Kuber')).toBe('Kuber')
    expect(hyphenateText('दिवाली बोनस')).toBe('दिवाली बोनस')
    expect(hyphenateText('Performance Bonus').split(SHY).join('')).toBe('Performance Bonus')
  })

  it('hyphenates inside punctuated words and allows a break after "/"', () => {
    expect(show(hyphenateText("Colleague's"))).toBe("Col-league's")
    const ZWSP = String.fromCharCode(0x200b)
    expect(hyphenateText('Joining/Signing Bonus')).toBe(`Join${SHY}ing/${ZWSP}Sign${SHY}ing Bonus`)
  })

  it('every card-name word keeps at least 3 letters before the first and after the last break', () => {
    for (const c of [...ALL_CARDS, ...BUILTIN_LIFE_EVENTS]) {
      for (const n of [c.name, c.shortName ?? '']) {
        for (const w of n.match(/[A-Za-z]+/g) ?? []) {
          const parts = hyphenateWord(w).split(SHY)
          expect(parts.join(''), w).toBe(w)
          if (parts.length === 1) continue
          expect(parts[0].length, show(hyphenateWord(w))).toBeGreaterThanOrEqual(3)
          expect(parts[parts.length - 1].length, show(hyphenateWord(w))).toBeGreaterThanOrEqual(3)
        }
      }
    }
  })
})
