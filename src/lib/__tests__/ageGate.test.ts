// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { ageBandFromBirthYear, isAdultBirthYear, isPlausibleBirthYear } from '../ageBand'
import {
  ACCOUNT_AGE_KEY, DEVICE_AGE_KEY, UNDER_AGE_BLOCK_KEY, allowsFullTelemetry, blockUnderAge, getDeviceAge,
  getUnderAgeBlock, recordDeviceAge, rememberAccountAgeBand, savePendingSignup, takePendingSignup,
} from '../ageGate'
import { UNDER_AGE_COOLDOWN_MS } from '../../config/consent'
import { deriveConsentStatus } from '../../hooks/useAuth'

const Y = 2026

describe('age bands from a year of birth', () => {
  it('maps years to under13 / 13to17 / adult', () => {
    expect(ageBandFromBirthYear(2020, Y)).toBe('under13')
    expect(ageBandFromBirthYear(2014, Y)).toBe('under13') // turns 12 this year
    expect(ageBandFromBirthYear(2013, Y)).toBe('13to17') // turns 13 this year: lenient lower edge
    expect(ageBandFromBirthYear(2010, Y)).toBe('13to17')
    expect(ageBandFromBirthYear(2008, Y)).toBe('13to17') // turns 18 this year: may still be 17 today
    expect(ageBandFromBirthYear(2007, Y)).toBe('adult')
    expect(ageBandFromBirthYear(1980, Y)).toBe('adult')
  })

  it('accepts only plausible years and an adult-for-sure parent', () => {
    expect(isPlausibleBirthYear(Y + 1, Y)).toBe(false)
    expect(isPlausibleBirthYear(1900, Y)).toBe(false)
    expect(isPlausibleBirthYear('1990', Y)).toBe(false)
    expect(isAdultBirthYear(1985, Y)).toBe(true)
    expect(isAdultBirthYear(2007, Y)).toBe(true)
    expect(isAdultBirthYear(2008, Y)).toBe(false)
    expect(isAdultBirthYear(2015, Y)).toBe(false)
    expect(isAdultBirthYear(null, Y)).toBe(false)
  })
})

describe('device age record', () => {
  beforeEach(() => localStorage.clear())

  it('stores only the band and a timestamp, never the year', () => {
    expect(getDeviceAge()).toBeNull()
    expect(recordDeviceAge('13to17', new Date('2026-10-14T10:00:00Z'))).toBe('13to17')
    const raw = localStorage.getItem(DEVICE_AGE_KEY) ?? ''
    expect(JSON.parse(raw)).toEqual({ band: '13to17', at: '2026-10-14T10:00:00.000Z' })
    expect(raw).not.toMatch(/20(0|1)\d"/) // no birth year anywhere
    expect(getDeviceAge()?.band).toBe('13to17')
  })

  it('under 13 starts a 24h cooldown and forgets any earlier answer', () => {
    recordDeviceAge('adult')
    const now = Date.now()
    expect(recordDeviceAge('under13', new Date(now))).toBe('blocked')
    expect(getDeviceAge()).toBeNull()
    expect(getUnderAgeBlock(now + 1000)).toBe(now + UNDER_AGE_COOLDOWN_MS)
    // Still blocked just before the end, free afterwards (and the record is cleaned up).
    expect(getUnderAgeBlock(now + UNDER_AGE_COOLDOWN_MS - 1)).not.toBeNull()
    expect(getUnderAgeBlock(now + UNDER_AGE_COOLDOWN_MS + 1)).toBeNull()
    expect(localStorage.getItem(UNDER_AGE_BLOCK_KEY)).toBeNull()
  })

  it('a far-future (edited) block is capped at one cooldown', () => {
    const now = Date.now()
    localStorage.setItem(UNDER_AGE_BLOCK_KEY, JSON.stringify({ until: now + 10 * UNDER_AGE_COOLDOWN_MS }))
    expect(getUnderAgeBlock(now)).toBe(now + UNDER_AGE_COOLDOWN_MS)
  })

  it('an adult answer after the cooldown clears the block', () => {
    blockUnderAge(0)
    recordDeviceAge('adult')
    expect(getUnderAgeBlock()).toBeNull()
  })

  it('tolerates corrupted storage', () => {
    localStorage.setItem(DEVICE_AGE_KEY, '{nope')
    localStorage.setItem(UNDER_AGE_BLOCK_KEY, '"x"')
    expect(getDeviceAge()).toBeNull()
    expect(getUnderAgeBlock()).toBeNull()
  })
})

describe('pending email sign-up', () => {
  beforeEach(() => localStorage.clear())

  it('is found by email (case-insensitive) while fresh', () => {
    savePendingSignup('Kid@Example.com', '13to17', 'rocket', 1000)
    expect(takePendingSignup('kid@example.com', 2000)).toMatchObject({ band: '13to17', username: 'rocket' })
    expect(takePendingSignup('other@example.com', 2000)).toBeNull()
    expect(takePendingSignup('kid@example.com', 1000 + 8 * 24 * 3600 * 1000)).toBeNull()
  })
})

describe('telemetry permission (Sentry replay / tracing)', () => {
  beforeEach(() => localStorage.clear())

  it('is allowed only for a known adult', () => {
    expect(allowsFullTelemetry()).toBe(false) // age unknown
    recordDeviceAge('13to17')
    expect(allowsFullTelemetry()).toBe(false)
    recordDeviceAge('adult')
    expect(allowsFullTelemetry()).toBe(true)
  })

  it('the signed-in account band wins over the device answer', () => {
    recordDeviceAge('adult')
    rememberAccountAgeBand('13to17')
    expect(localStorage.getItem(ACCOUNT_AGE_KEY)).toBe('"13to17"')
    expect(allowsFullTelemetry()).toBe(false)
    rememberAccountAgeBand(null)
    expect(allowsFullTelemetry()).toBe(true)
  })
})

describe('consent status of a signed-in account', () => {
  const user = { id: 'u1' } as never
  const base = { user, profile: null, profileMissing: false, profileError: false }

  it('signed out → null; no profile yet → unknown (ask the age first)', () => {
    expect(deriveConsentStatus({ ...base, user: null }, null)).toBeNull()
    expect(deriveConsentStatus({ ...base, profileMissing: true }, null)).toBe('unknown')
  })

  it('reads the server status, missing column → unknown', () => {
    expect(deriveConsentStatus({ ...base, profile: { consent_status: 'pending_consent' } as never }, null)).toBe('pending_consent')
    expect(deriveConsentStatus({ ...base, profile: {} as never }, null)).toBe('unknown')
  })

  it('offline: a remembered 13–17 band keeps the account local-only', () => {
    expect(deriveConsentStatus({ ...base, profileError: true }, '13to17')).toBe('pending_consent')
    expect(deriveConsentStatus({ ...base, profileError: true }, 'adult')).toBe('not_required')
  })
})
