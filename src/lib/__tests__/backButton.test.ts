import { describe, expect, it, vi } from 'vitest'
import { createBackStack, decideBackFallback } from '../backButton'

describe('back button stack', () => {
  it('returns false when nothing is registered', () => {
    expect(createBackStack().dispatch()).toBe(false)
  })

  it('runs the most recently registered handler first, and only that one', () => {
    const s = createBackStack()
    const a = vi.fn()
    const b = vi.fn()
    s.register(a)
    s.register(b)
    expect(s.dispatch()).toBe(true)
    expect(b).toHaveBeenCalledTimes(1)
    expect(a).not.toHaveBeenCalled()
  })

  it('passes the press down when a handler returns false', () => {
    const s = createBackStack()
    const a = vi.fn(() => true)
    const b = vi.fn(() => false)
    s.register(a)
    s.register(b)
    expect(s.dispatch()).toBe(true)
    expect(b).toHaveBeenCalled()
    expect(a).toHaveBeenCalled()
  })

  it('reports unhandled when every handler declines', () => {
    const s = createBackStack()
    s.register(() => false)
    s.register(() => false)
    expect(s.dispatch()).toBe(false)
  })

  it('unregister removes only that handler and is idempotent', () => {
    const s = createBackStack()
    const a = vi.fn()
    const b = vi.fn()
    s.register(a)
    const offB = s.register(b)
    offB()
    offB()
    expect(s.size()).toBe(1)
    s.dispatch()
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).not.toHaveBeenCalled()
  })

  it('re-registering moves a handler back on top (modal opened again)', () => {
    const s = createBackStack()
    const calls: string[] = []
    const offModal = s.register(() => { calls.push('modal') })
    s.register(() => { calls.push('page') })
    offModal()
    s.register(() => { calls.push('modal') })
    s.dispatch()
    expect(calls).toEqual(['modal'])
  })

  it('a handler that closes itself lets the next press reach the one below', () => {
    const s = createBackStack()
    const calls: string[] = []
    s.register(() => { calls.push('game') })
    let off: (() => void) | null = null
    off = s.register(() => { calls.push('forfeit'); off?.() })
    s.dispatch()
    s.dispatch()
    expect(calls).toEqual(['forfeit', 'game'])
  })

  it('a throwing handler is skipped', () => {
    const s = createBackStack()
    const a = vi.fn()
    s.register(a)
    s.register(() => { throw new Error('boom') })
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(s.dispatch()).toBe(true)
    expect(a).toHaveBeenCalled()
    err.mockRestore()
  })
})

describe('decideBackFallback', () => {
  it('minimises on root routes even with history', () => {
    expect(decideBackFallback('/', true)).toBe('minimize')
    expect(decideBackFallback('/dashboard', true)).toBe('minimize')
    expect(decideBackFallback('/dashboard/', false)).toBe('minimize')
  })

  it('goes back on other routes when possible, else home', () => {
    expect(decideBackFallback('/library', true)).toBe('back')
    expect(decideBackFallback('/game', true)).toBe('back')
    expect(decideBackFallback('/library', false)).toBe('home')
    expect(decideBackFallback('/multiplayer/abc', false)).toBe('home')
  })
})
