import { describe, expect, it } from 'vitest'
import i18n from '../../../i18n/i18n'
import { feedEntries, logView } from '../GameLog'
import { feedbackTier, formatClock, standings } from '../boardUtils'
import { initGame } from '../../../lib/gameEngine'

const t = i18n.getFixedT('en')
const tHi = i18n.getFixedT('hi')

describe('logView — engine log lines become localized sentences', () => {
  it('decision lines', () => {
    expect(logView('Priya AI played Diwali Bonus → SAVE (+₹26,000)', t, 'en').text).toBe('Priya AI saved with Diwali Bonus: +⁠₹26,000')
    const inv = logView('Rahul AI played Gold Rush → INVEST — ₹40,000 moved into 🪙 Gold', t, 'en')
    expect(inv.text).toBe('Rahul AI put ₹40,000 into Gold (Gold Rush)')
    expect(inv.actor).toBe('Rahul AI')
  })
  it('attacks, blocks and year lines', () => {
    expect(logView('Rahul AI played Tax Raid → Tester (-₹30,000) (+₹30,000)', t, 'en').text).toBe('Rahul AI hit Tester with Tax Raid: −⁠₹30,000')
    expect(logView('Rahul AI played Tax Raid → Tester 🛡️ (Tester Auto-Defended!)', t, 'en').tone).toBe('neutral')
    expect(logView('📅 Year 4', t, 'en').yearHeader).toBe(4)
    expect(logView("💸 Inflation ate ₹26,430 of Tester's cash", t, 'en').text).toBe("Inflation ate ₹26,430 of Tester's cash")
  })
  it('Hindi uses Hindi templates (no English verbs)', () => {
    const v = logView('Priya AI played Diwali Bonus → SAVE (+₹26,000)', tHi, 'hi')
    expect(v.text).toMatch(/बचत की/)
    expect(v.text).not.toMatch(/saved|played/)
  })
  it('feed skips the year header and deck noise', () => {
    expect(feedEntries(['📅 Year 2', 'Deck reshuffled.', 'Priya AI passed.'], 2)).toEqual(['Priya AI passed.'])
  })
})

describe('board helpers', () => {
  it('feedback tiers (spec §B.7)', () => {
    expect(feedbackTier(49_999)).toBe('small')
    expect(feedbackTier(-50_000)).toBe('medium')
    expect(feedbackTier(200_000)).toBe('large')
    expect(feedbackTier(-1_000, true)).toBe('large')
  })
  it('match clock text', () => {
    expect(formatClock(118_000)).toBe('1:58')
    expect(formatClock(14 * 60_000 + 21_000)).toBe('14:21')
  })
  it('standings rank by net worth', () => {
    const gs = initGame({ id: 'me', name: 'Tester' }, 2)
    gs.players[1] = { ...gs.players[1], cash: 900_000, wealth: 900_000 }
    const r = standings(gs)
    expect(r.get(gs.players[1].id)).toBe(1)
    expect(r.get('me')).toBe(2)
  })
})
