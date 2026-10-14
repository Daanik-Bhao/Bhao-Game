import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import en from '../locales/en.json'
import hi from '../locales/hi.json'
import hinglish from '../locales/hinglish.json'

/**
 * The type label sits in the 128 px full card's band next to the icon and the tier gem: 65 px
 * for the text (12 px Mukta 700, caps with 0.02em tracking). Measured in Chrome: "LIFE EVENT"
 * = 59.5 px, "DECISION" = 51.8 px, "ज़िंदगी" = 27.8 px. Keep new labels within these budgets.
 */
const BUDGET = { en: 10, hinglish: 10, hi: 7 } as const

type Seg = { segment: (s: string) => Iterable<unknown> }
const Segmenter = (Intl as unknown as { Segmenter: new (l?: string, o?: { granularity: string }) => Seg }).Segmenter
const graphemes = (s: string) => Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(s)).length

describe('card type labels fit the full card band', () => {
  for (const [lang, res] of Object.entries({ en, hi, hinglish })) {
    it(`${lang}: every card.type label is within ${BUDGET[lang as keyof typeof BUDGET]} characters`, () => {
      const labels = (res as { card: { type: Record<string, string> } }).card.type
      expect(Object.keys(labels).sort()).toEqual(['attack', 'decision', 'lifeEvent', 'shield'])
      for (const [k, v] of Object.entries(labels)) expect(graphemes(v), `${k}: ${v}`).toBeLessThanOrEqual(BUDGET[lang as keyof typeof BUDGET])
    })
  }

  it('the label uses tight tracking and is hidden on 96 px tablet-hand cards (icon only, spec §D.14)', () => {
    const cardCss = readFileSync(resolve(__dirname, '../../components/GameCard.css'), 'utf8')
    expect(cardCss).toMatch(/\.gcard__type \{[^}]*letter-spacing: min\(var\(--ls-caps\), 0\.02em\)/)
    const boardCss = readFileSync(resolve(__dirname, '../../components/game/board.css'), 'utf8')
    expect(boardCss).toMatch(/\.hand--tablet \.gcard--full \.gcard__type \{ display: none; \}/)
  })
})
