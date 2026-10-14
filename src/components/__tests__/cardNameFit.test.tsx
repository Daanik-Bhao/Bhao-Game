// @vitest-environment jsdom
/**
 * The card sheet's small preview card (72×104 on short phones) used to clip the last line of a
 * 3-line Hindi name: it never stepped down a font size. Sheet-size names now use the same fit
 * step as hand cards (12 px when the name overflows), and on short phones the preview uses
 * hand-card metrics (board.css). Measured in Chrome at 360×640 for all cards in en/hi/hinglish.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import i18n from '../../i18n/i18n'
import { GameCard } from '../GameCard'
import { ALL_CARDS } from '../../data/cards'

afterEach(cleanup)

describe('card name fit step', () => {
  it('a sheet-size name that overflows drops to the 12 px step', async () => {
    await i18n.changeLanguage('hi')
    const card = ALL_CARDS.find(c => c.type === 'decision')!
    const sh = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
    const ch = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    try {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get() { return this.classList?.contains('gcard__name') ? 60 : 0 } })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return this.classList?.contains('gcard__name') ? 40 : 0 } })
      const { container } = render(<GameCard card={card} size="sheet" />)
      await waitFor(() => expect(container.querySelector('.gcard__name')!.className).toContain('is-fit'))
    } finally {
      if (sh) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', sh)
      if (ch) Object.defineProperty(HTMLElement.prototype, 'clientHeight', ch)
      await i18n.changeLanguage('en')
    }
  })

  it('CSS: the fit step applies to sheet cards and the short-phone preview uses hand metrics', () => {
    const cardCss = readFileSync(resolve(__dirname, '../GameCard.css'), 'utf8')
    expect(cardCss).toContain('.gcard--sheet .gcard__name.is-fit { font-size: 12px; }')
    const boardCss = readFileSync(resolve(__dirname, '../game/board.css'), 'utf8')
    const shortPhone = boardCss.slice(boardCss.indexOf('@media (max-height: 760px) and (max-width: 599px)'))
    expect(shortPhone).toContain('.cardsheet .gcard--sheet .gcard__name { font-size: 13px; padding: 4px 5px 0; }')
    expect(shortPhone).toContain('.cardsheet .gcard--sheet .gcard__name.is-fit { font-size: 12px; }')
  })
})
