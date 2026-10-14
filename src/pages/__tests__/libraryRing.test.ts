import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Gyaan Library header ring: the widest label "22/22" (12 px Baloo 2 800) measures 33.2 × 12 px
 * in Chrome (same in Hindi: the count uses Latin digits), half-diagonal 17.7 px. It touched the
 * old 48 px ring (inner radius 17). Keep the inner radius ≥ 20 px so it always clears.
 */
describe('Library progress ring fits "22/22"', () => {
  const tsx = readFileSync(resolve(__dirname, '../Library.tsx'), 'utf8')
  const css = readFileSync(resolve(__dirname, '../../components/learning/learning.css'), 'utf8')

  it('inner radius leaves room for the widest label', () => {
    const size = Number(tsx.match(/<svg width="(\d+)" height="\1" viewBox="0 0 \1 \1"/)?.[1])
    const r = Number(tsx.match(/function ProgressRing[\s\S]*?const r = (\d+)/)?.[1])
    const stroke = Number(css.match(/\.lib-ring__track \{[^}]*stroke-width: (\d+)/)?.[1])
    expect(size).toBeGreaterThan(0)
    expect(r + stroke / 2).toBeLessThanOrEqual(size / 2)
    const halfDiagonal = Math.hypot(33.2 / 2, 12 / 2)
    expect(r - stroke / 2).toBeGreaterThanOrEqual(Math.ceil(halfDiagonal) + 2)
    expect(css).toMatch(new RegExp(`\\.lib-ring \\{[^}]*width: ${size}px; height: ${size}px`))
    expect(css).toMatch(/\.lib-ring__text \{[^}]*font-size: 12px[^}]*line-height: 1;/)
  })
})
