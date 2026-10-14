import { describe, expect, it } from 'vitest'
import { formatMoney, formatPct, MINUS } from '../format'

const NBSP = ' '

describe('formatMoney', () => {
  it('uses Indian grouping', () => {
    expect(formatMoney(1240500)).toBe('₹12,40,500')
    expect(formatMoney(500000)).toBe('₹5,00,000')
    expect(formatMoney(999)).toBe('₹999')
    expect(formatMoney(0)).toBe('₹0')
  })

  it('puts a real minus sign before ₹', () => {
    expect(formatMoney(-35000)).toBe(`${MINUS}₹35,000`)
    expect(formatMoney(-35000)).not.toContain('-')
  })

  it('signed adds + to positive values only', () => {
    expect(formatMoney(50000, { signed: true })).toBe('+₹50,000')
    expect(formatMoney(0, { signed: true })).toBe('₹0')
    expect(formatMoney(-1, { signed: true })).toBe(`${MINUS}₹1`)
  })

  it('compact: lakh / crore / thousand with one decimal, trailing .0 dropped', () => {
    expect(formatMoney(1410000, { compact: true })).toBe(`₹14.1${NBSP}L`)
    expect(formatMoney(5000000, { compact: true })).toBe(`₹50${NBSP}L`)
    expect(formatMoney(12000000, { compact: true })).toBe(`₹1.2${NBSP}Cr`)
    expect(formatMoney(35000, { compact: true })).toBe('₹35K')
    expect(formatMoney(1500, { compact: true })).toBe('₹1.5K')
    expect(formatMoney(-35000, { compact: true })).toBe(`${MINUS}₹35K`)
    expect(formatMoney(10000, { compact: true, signed: true })).toBe('+₹10K')
    expect(formatMoney(420, { compact: true })).toBe('₹420')
  })

  it('compact Hindi uses लाख / करोड़ unless abbr is set', () => {
    expect(formatMoney(1410000, { compact: true, lang: 'hi' })).toBe(`₹14.1${NBSP}लाख`)
    expect(formatMoney(12000000, { compact: true, lang: 'hi' })).toBe(`₹1.2${NBSP}करोड़`)
    expect(formatMoney(1410000, { compact: true, lang: 'hi', abbr: true })).toBe(`₹14.1${NBSP}L`)
    expect(formatMoney(1410000, { compact: true, lang: 'hinglish' })).toBe(`₹14.1${NBSP}L`)
  })

  it('survives NaN / Infinity', () => {
    expect(formatMoney(Number.NaN)).toBe('₹0')
  })
})

describe('formatPct', () => {
  it('signs with + and U+2212', () => {
    expect(formatPct(8)).toBe('+8%')
    expect(formatPct(-20)).toBe(`${MINUS}20%`)
    expect(formatPct(0)).toBe('0%')
    expect(formatPct(5, { signed: false })).toBe('5%')
  })
})
