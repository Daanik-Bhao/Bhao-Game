// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  stop: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
  replayIntegration: vi.fn(() => ({ name: 'Replay' })),
}))

vi.mock('@sentry/react', () => ({
  init: sentry.init,
  browserTracingIntegration: sentry.browserTracingIntegration,
  replayIntegration: sentry.replayIntegration,
  getReplay: () => ({ stop: sentry.stop }),
}))

import { applyChildSafeTelemetry, buildSentryOptions, initSentry } from '../telemetry'
import { recordDeviceAge, rememberAccountAgeBand } from '../ageGate'

type Opts = { integrations?: { name: string }[]; tracesSampler?: () => number; replaysOnErrorSampleRate?: number; replaysSessionSampleRate?: number }
const names = (o: Opts) => (o.integrations ?? []).map(i => i.name)

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('Sentry child-safe defaults', () => {
  it('a 13–17 player gets error reports only: no replay, no tracing', () => {
    rememberAccountAgeBand('13to17')
    expect(initSentry('https://key@sentry.example/1', 'production', true)).toBe(true)
    const opts = sentry.init.mock.calls[0][0] as Opts
    expect(names(opts)).toEqual([])
    expect(opts.tracesSampler).toBeUndefined()
    expect(opts.replaysOnErrorSampleRate).toBe(0)
    expect(opts.replaysSessionSampleRate).toBe(0)
    expect(sentry.replayIntegration).not.toHaveBeenCalled()
    expect(sentry.browserTracingIntegration).not.toHaveBeenCalled()
  })

  it('an unknown age is treated like a child (no replay / tracing before the question)', () => {
    initSentry('https://key@sentry.example/1', 'production', true)
    expect(names(sentry.init.mock.calls[0][0] as Opts)).toEqual([])
  })

  it('a known adult keeps replay-on-error and sampled tracing', () => {
    recordDeviceAge('adult')
    initSentry('https://key@sentry.example/1', 'production', true)
    const opts = sentry.init.mock.calls[0][0] as Opts
    expect(names(opts)).toEqual(['BrowserTracing', 'Replay'])
    expect(opts.replaysOnErrorSampleRate).toBe(1)
    expect(opts.tracesSampler?.()).toBe(0.1)
  })

  it('a child signing in mid-session stops replay and new traces', () => {
    recordDeviceAge('adult')
    const opts = buildSentryOptions({ dsn: 'x', environment: 'production', prod: true, full: true }) as Opts
    rememberAccountAgeBand('13to17')
    expect(opts.tracesSampler?.()).toBe(0)
    applyChildSafeTelemetry()
    expect(sentry.stop).toHaveBeenCalled()
  })

  it('no DSN → nothing initialised', () => {
    expect(initSentry('  ', 'production', true)).toBe(false)
    expect(sentry.init).not.toHaveBeenCalled()
  })
})
