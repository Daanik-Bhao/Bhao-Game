import { describe, expect, it } from 'vitest'
import { cardHeadline } from '../cardHeadline'
import { MINUS } from '../format'
import { ALL_CARDS } from '../../data/cards'
import { BUILTIN_LIFE_EVENTS } from '../../data/lifeEvents'
import type { CardEffect, GameCard } from '../../types/game'

function card(type: GameCard['type'], effect?: CardEffect, extra: Partial<GameCard> = {}): GameCard {
  return { id: 'x', name: 'Test', type, tier: 'common', flavor: '', effect, ...extra }
}

describe('softHyphenate (long card-name words)', () => {
  it('adds soft hyphens only inside long Latin words', async () => {
    const { softHyphenate } = await import('../../components/GameCard')
    const SHY = String.fromCharCode(0xad)
    expect(softHyphenate('Performance Bonus')).toBe(`Per${SHY}for${SHY}mance Bonus`)
    expect(softHyphenate('Kuber')).toBe('Kuber')
    expect(softHyphenate('Compound')).toBe(`Com${SHY}pound`)
    expect(softHyphenate('दिवाली बोनस')).toBe('दिवाली बोनस')
    expect(softHyphenate('Performance').split(SHY).join('')).toBe('Performance')
  })
})

describe('cardHeadline', () => {
  it('decision cards with options are "choose" (three dots)', () => {
    const c = ALL_CARDS.find(x => x.type === 'decision' && x.options?.length)!
    const h = cardHeadline(c, 'en')
    expect(h.kind).toBe('choose')
    expect(h.text).toBe('')
    expect(h.spoken).toBe('choose spend, save or invest')
  })

  it('wealth_change → signed compact ₹', () => {
    expect(cardHeadline(card('action', { type: 'wealth_change', value: 50000, target: 'self' })).text).toBe('+₹50K')
    const loss = cardHeadline(card('action', { type: 'wealth_change', value: -35000, target: 'self' }))
    expect(loss.text).toBe(`${MINUS}₹35K`)
    expect(loss.tone).toBe('loss')
  })

  it('percent effects → signed %', () => {
    const h = cardHeadline(card('action', { type: 'wealth_pct', value: -20, target: 'target' }))
    expect(h.text).toBe(`${MINUS}20%`)
    expect(h.tone).toBe('loss')
    expect(h.spoken).toBe('a rival loses 20 percent')
    expect(cardHeadline(card('action', { type: 'attack_all_pct', value: 15, target: 'all' })).text).toBe(`${MINUS}15%`)
    expect(cardHeadline(card('action', { type: 'attack_all_pct', value: 20, target: 'all' })).spoken).toBe('every rival loses 20 percent')
    expect(cardHeadline(card('action', { type: 'market_crash_player', value: 25, target: 'target' })).text).toBe(`${MINUS}25%`)
    expect(cardHeadline(card('action', { type: 'steal_pct', value: 25, target: 'target' })).text).toBe(`${MINUS}25%`)
    const gain = cardHeadline(card('action', { type: 'wealth_pct', value: 8, target: 'self' }))
    expect(gain.text).toBe('+8%')
    expect(gain.tone).toBe('gain')
  })

  it('named effects', () => {
    expect(cardHeadline(card('action', { type: 'skip_turn', value: 1, target: 'others' })).text).toBe('Skip turn')
    expect(cardHeadline(card('action', { type: 'steal', value: 30000, target: 'target' })).text).toBe('Steal ₹30K')
    expect(cardHeadline(card('defense', { type: 'reduce_attack_pct', value: 50 })).text).toBe(`${MINUS}50% hit`)
    expect(cardHeadline(card('decision', { type: 'wealth_next_turn', value: 40000 })).text).toBe('+₹40K next yr')
    expect(cardHeadline(card('decision', { type: 'wealth_end_game', value: 100000 })).text).toBe(`+₹1${' '}L at end`)
    expect(cardHeadline(card('defense', { type: 'wealth_floor', value: 50000 })).text).toBe('Floor ₹50K')
    expect(cardHeadline(card('decision', { type: 'double_invest' })).text).toBe('2× invest')
    expect(cardHeadline(card('decision', { type: 'copy_card' })).text).toBe('Copy')
    expect(cardHeadline(card('decision', { type: 'set_goal' })).text).toBe('New goal')
  })

  it('defence cards say Block (Hindi: बचाव) in defence tone', () => {
    const shield = ALL_CARDS.find(x => x.type === 'defense' && x.effect?.type === 'block_card')!
    expect(cardHeadline(shield, 'en')).toMatchObject({ text: 'Block', tone: 'defence' })
    expect(cardHeadline(shield, 'hi').text).toBe('बचाव')
    expect(cardHeadline(card('defense'), 'en').text).toBe('Block')
  })

  it('translates the words in Hindi and Hinglish', () => {
    expect(cardHeadline(card('action', { type: 'skip_turn', value: 1 }), 'hi').text).toBe('बारी छोड़ो')
    expect(cardHeadline(card('action', { type: 'skip_turn', value: 1 }), 'hinglish').text).toBe('Turn skip')
    expect(cardHeadline(card('action', { type: 'wealth_pct', value: -20, target: 'target' }), 'hi').spoken).toBe('एक विरोधी को 20 प्रतिशत नुकसान')
  })

  it('every real card gets a non-empty headline', () => {
    for (const c of [...ALL_CARDS, ...BUILTIN_LIFE_EVENTS]) {
      const h = cardHeadline(c, 'en')
      expect(h.kind === 'choose' || h.text.length > 0, `${c.name}`).toBe(true)
      expect(h.text).not.toContain('$')
      // Fits a 70 px hand card at 16 px Baloo (≈ 8 characters)
      expect(h.text.length, `${c.name}: ${h.text}`).toBeLessThanOrEqual(10)
    }
  })
})
