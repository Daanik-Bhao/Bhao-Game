import { describe, it, expect } from 'vitest'
import { runTutorial, getCash, getHoldings, getNetWorth } from './tutorialRun'
import {
  CARD_IDS, HOOK_FUTURE_VALUE, HOOK_PAID_IN, TUTORIAL_BOT_ID, TUTORIAL_PLAYER_ID, TUTORIAL_SEED,
  buildTutorialState, sipFutureValue,
} from '../../../data/tutorialScript'
import { BASE_INFLATION_PCT } from '../../../data/assets'
import { rand } from '../../../lib/economy'

/**
 * The guided tutorial runs on the real engine with a seeded rng. If an engine or
 * balance change breaks one of these story beats, the tutorial's coach text would
 * describe something that no longer happens — update the seed/script with it.
 */
describe('tutorial story (seed ' + TUTORIAL_SEED + ')', () => {
  const run = runTutorial(TUTORIAL_SEED)
  const { start, afterInvest, year2, afterSave, year3, afterEquip, year4 } = run.states

  it('starts with you on all cash and Rahul mostly in property', () => {
    const [you, rahul] = start.players
    expect(you.id).toBe(TUTORIAL_PLAYER_ID)
    expect(getCash(you)).toBe(500000)
    expect(getHoldings(you)).toHaveLength(0)
    expect(rahul.id).toBe(TUTORIAL_BOT_ID)
    expect(getHoldings(rahul).map(h => h.asset)).toEqual(['realestate'])
    expect(you.hand.some(c => c.id.startsWith(CARD_IDS.chai))).toBe(true)
  })

  it('Year 1: Invest moves half your cash into an index fund, net worth unchanged', () => {
    const you = afterInvest.players[0]
    const index = getHoldings(you).find(h => h.asset === 'index')
    expect(index?.value).toBe(250000)
    expect(getCash(you)).toBe(250000)
    expect(getNetWorth(you)).toBe(500000)
  })

  it('Year 2: the market moves and inflation eats idle cash; Rahul falls for a scam tip', () => {
    expect(year2.round).toBe(2)
    expect(year2.lastMarketTick?.changes.index).toBeGreaterThan(0)
    const lines = year2.roundNews?.lines ?? []
    expect(lines).toContain(`💸 Inflation ate ₹${(250000 * BASE_INFLATION_PCT / 100).toLocaleString('en-IN')} of You's cash`)
    expect(year2.lastEvent?.card.lureAsset).toBe('scam')
    expect(year2.lastEvent?.affectedPlayerIds).toEqual([TUTORIAL_BOT_ID])
    expect(getHoldings(year2.players[1]).some(h => h.asset === 'scam')).toBe(true)
    // Your index fund grew with the market
    const idx = getHoldings(year2.players[0]).find(h => h.asset === 'index')!
    expect(idx.value).toBeGreaterThan(idx.principal)
  })

  it('Year 2: Save builds a cash buffer', () => {
    expect(getCash(afterSave.players[0])).toBeGreaterThan(getCash(year2.players[0]))
    expect(afterSave.players[0].savingStreak).toBe(1)
  })

  it('Year 3: a medical emergency forces Rahul (no buffer) to sell property at a penalty', () => {
    expect(year3.round).toBe(3)
    expect(year3.lastEvent?.card.category).toBe('medical')
    expect(year3.lastEvent?.affectedPlayerIds).toEqual([TUTORIAL_BOT_ID])
    expect(year3.roundNews?.lines.some(l => l.includes('Rahul AI had to sell') && l.includes('15% penalty'))).toBe(true)
    // You were not hit and still hold a healthy cash buffer
    expect(getCash(year3.players[0])).toBeGreaterThan(150000)
  })

  it('Year 3: you draw Health Insurance and equipping it is free (turn continues)', () => {
    expect(afterEquip.players[0].activeDefenses.map(d => d.blocksCategories)).toEqual([['medical']])
    expect(afterEquip.currentPlayerIndex).toBe(0)
    expect(afterEquip.round).toBe(3)
    expect(afterEquip.equippedThisTurn).toBe(true)
  })

  it('Year 4: the scam holding is wiped out and your insurance blocks a hospital bill', () => {
    expect(year4.round).toBe(4)
    expect(year4.phase).not.toBe('game_over')
    expect(getHoldings(year4.players[1]).some(h => h.asset === 'scam')).toBe(false)
    expect(year4.roundNews?.lines).toContain("☠️ Rahul AI's 🎣 Hot Tip / Scheme was wiped out.")
    expect(year4.roundNews?.lines.some(l => l.includes('Health Insurance blocked Hospital Bill'))).toBe(true)
    expect(year4.players[0].activeDefenses).toHaveLength(0)
    expect(year4.currentPlayerIndex).toBe(0)
  })

  it('the story does not depend on the free choice in Year 3', () => {
    for (const [cardId, choice] of [[CARD_IDS.fire, 'save'], [CARD_IDS.windfall, 'spend'], [CARD_IDS.paycheck, 'invest']] as const) {
      const alt = runTutorial(TUTORIAL_SEED, cardId, choice).states.year4
      expect(alt.roundNews?.lines).toContain("☠️ Rahul AI's 🎣 Hot Tip / Scheme was wiped out.")
      expect(alt.roundNews?.lines.some(l => l.includes('Health Insurance blocked Hospital Bill'))).toBe(true)
    }
  })

  it('restores the default rng afterwards', () => {
    const a = rand(); const b = rand()
    expect(a).not.toBe(b)
  })

  it('builds the starting state without randomness', () => {
    expect(buildTutorialState('X', 1).players[1].hand.map(c => c.id)).toEqual(buildTutorialState('X', 2).players[1].hand.map(c => c.id))
  })
})

describe('chai hook', () => {
  it('₹150 a day = ₹4,500/month → about ₹10 lakh in 10 years at 12%', () => {
    expect(HOOK_PAID_IN).toBe(540000)
    expect(HOOK_FUTURE_VALUE).toBeGreaterThan(1000000)
    expect(HOOK_FUTURE_VALUE).toBeLessThan(1100000)
    expect(Math.round(HOOK_FUTURE_VALUE)).toBe(1045526)
    expect(sipFutureValue(1000, 12, 1)).toBeCloseTo(12809.33, 1)
  })
})
