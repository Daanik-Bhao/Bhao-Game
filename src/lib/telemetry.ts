import * as Sentry from '@sentry/react'
import { allowsFullTelemetry } from './ageGate'

/**
 * Sentry set-up with child-safe defaults (docs/age-policy.md, Option B).
 *
 * Session Replay and performance tracing count as "behavioural monitoring" of a child
 * under India's DPDP Act, so they run only when the player on this device is a known adult
 * (decided from the age band stored on the device, before anything is initialised).
 * Everyone else (13–17, or age not answered yet) gets plain error reports only.
 */
export interface SentrySetup {
  dsn: string
  environment: string
  prod: boolean
  /** True only for a known adult (see allowsFullTelemetry). */
  full: boolean
}

export function buildSentryOptions({ dsn, environment, prod, full }: SentrySetup): Sentry.BrowserOptions {
  const base: Sentry.BrowserOptions = {
    dsn,
    environment,
    // Don't attach IP addresses, cookies or request headers to events.
    sendDefaultPii: false,
  }
  if (!full) {
    // Errors only: no tracing integration, no replay integration, nothing sampled.
    return { ...base, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0 }
  }
  const rate = prod ? 0.1 : 1.0
  return {
    ...base,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Re-checked for every trace: a child signing in mid-session stops new traces at once.
    tracesSampler: () => (allowsFullTelemetry() ? rate : 0),
    // Session Replay: never record normal sessions, only the lead-up to an error.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  }
}

/** Initialise Sentry (no-op without a DSN). Call before the app renders. */
export function initSentry(dsn: string | undefined, environment: string, prod: boolean): boolean {
  const clean = dsn?.trim()
  if (!clean) return false
  Sentry.init(buildSentryOptions({ dsn: clean, environment, prod, full: allowsFullTelemetry() }))
  return true
}

/**
 * Call whenever the account's age band becomes known. If the player is not a known adult
 * any more (a 13–17 account signed in after an adult's session started), stop the replay
 * buffer now; tracing already stops through the sampler. The full set-up comes back only
 * on the next app start.
 */
export function applyChildSafeTelemetry(): void {
  if (allowsFullTelemetry()) return
  try {
    void Sentry.getReplay()?.stop()
  } catch {
    /* Sentry not initialised */
  }
}
