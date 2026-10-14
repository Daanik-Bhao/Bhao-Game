import { describe, expect, it } from 'vitest'
import { placeBubble, type Box } from '../CoachMark'

const overlaps = (a: Box, b: Box) =>
  a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height

function bubbleBox(p: ReturnType<typeof placeBubble>, h: number): Box {
  return { top: p.top, left: p.left, width: p.width, height: Math.min(h, p.maxHeight) }
}

const VIEWPORTS = [{ w: 390, h: 844 }, { w: 844, h: 390 }, { w: 360, h: 740 }, { w: 360, h: 640 }, { w: 1366, h: 768 }]
const SAFE = { top: 24, bottom: 48, left: 0, right: 0 }

describe('coach mark placement (spec §E.10: bubble ∩ target = ∅)', () => {
  it('prefers above the target', () => {
    const p = placeBubble({ top: 600, left: 100, width: 70, height: 104 }, { w: 300, h: 180 }, { w: 390, h: 844 })
    expect(p.side).toBe('above')
  })

  it('never overlaps the target for targets anywhere on screen', () => {
    for (const vp of VIEWPORTS) {
      for (const h of [140, 220, 320]) {
        for (let y = 0; y < vp.h - 40; y += 37) {
          for (let x = 0; x < vp.w - 60; x += 53) {
            const target: Box = { top: y, left: x, width: Math.min(120, vp.w - x), height: Math.min(110, vp.h - y) }
            const p = placeBubble(target, { w: 300, h }, vp)
            const b = bubbleBox(p, h)
            expect(overlaps(b, target), `${vp.w}x${vp.h} target ${JSON.stringify(target)} bubble ${JSON.stringify(b)}`).toBe(false)
          }
        }
      }
    }
  })

  it('stays inside the viewport and the safe area (short phones included)', () => {
    for (const vp of VIEWPORTS) {
      for (const safe of [undefined, SAFE]) {
        const top = (safe?.top ?? 0) + 12
        const bottom = vp.h - (safe?.bottom ?? 0) - 12
        for (const h of [140, 220, 320, 480]) {
          for (let y = 0; y < vp.h - 40; y += 37) {
            for (let x = 0; x < vp.w - 60; x += 53) {
              const target: Box = { top: y, left: x, width: Math.min(120, vp.w - x), height: Math.min(110, vp.h - y) }
              const p = placeBubble(target, { w: 300, h }, { ...vp, safe })
              const b = bubbleBox(p, h)
              // Placement only falls back to a forced 80 px bubble when no side has 80 px of room.
              if (p.maxHeight <= 80) continue
              const msg = `${vp.w}x${vp.h} safe=${!!safe} target ${JSON.stringify(target)} bubble ${JSON.stringify(b)}`
              expect(b.top, msg).toBeGreaterThanOrEqual(top - 0.01)
              expect(b.top + b.height, msg).toBeLessThanOrEqual(bottom + 0.01)
              expect(overlaps(b, target), msg).toBe(false)
            }
          }
        }
      }
    }
  })

  it('step "Save, Spend or Invest?" at 360×640: the bubble fits above the choices and scrolls inside', () => {
    // Choices block measured in Chrome (spot incl. ring): top 297, bottom 615; natural bubble 311 px.
    const p = placeBubble({ top: 297, left: 8, width: 344, height: 318 }, { w: 300, h: 311 }, { w: 360, h: 640, safe: { top: 24 } })
    expect(p.side).toBe('above')
    expect(p.top).toBeGreaterThanOrEqual(36)
    expect(p.top + Math.min(311, p.maxHeight)).toBeLessThanOrEqual(297 - 14 + 0.01)
  })

  it('stays inside the viewport horizontally', () => {
    const p = placeBubble({ top: 400, left: 330, width: 50, height: 50 }, { w: 300, h: 150 }, { w: 390, h: 844 })
    expect(p.left).toBeGreaterThanOrEqual(12)
    expect(p.left + p.width).toBeLessThanOrEqual(390 - 12)
  })

  it('no target → centred near the bottom', () => {
    expect(placeBubble(null, { w: 300, h: 150 }, { w: 390, h: 844 }).side).toBe('none')
  })
})
