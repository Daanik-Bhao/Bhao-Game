// @vitest-environment jsdom
/**
 * The age question (docs/age-policy.md, Option B): asked once per device before guest play,
 * once for accounts without an age record; under 13 → friendly block + cooldown; legal and
 * parent pages are never behind it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../i18n/i18n'
import App from '../../App'
import { AgeGate } from '../age/AgeGate'
import { DEVICE_AGE_KEY, UNDER_AGE_BLOCK_KEY, getDeviceAge, getUnderAgeBlock } from '../../lib/ageGate'
import * as authHook from '../../hooks/useAuth'

const YEAR = new Date().getFullYear()

function chooseYear(year: number) {
  fireEvent.change(screen.getByLabelText('Year of birth'), { target: { value: String(year) } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

function setGuest() {
  localStorage.setItem('bhao_guest_profile', JSON.stringify({ isGuest: true, id: 'guest-1', username: 'Guest1', avatar_url: null, created_at: new Date().toISOString() }))
}

beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('en')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  window.history.pushState({}, '', '/')
})

describe('device age question (guest play, real App)', () => {
  it('asks before the first guest game; an answer goes straight to Home and is not asked again', async () => {
    setGuest()
    window.history.pushState({}, '', '/dashboard')
    const { unmount } = render(<App />)
    expect(await screen.findByRole('heading', { name: 'When were you born?' }, { timeout: 10000 })).toBeTruthy()
    // Neutral picker: years only, no "Are you 13+?" yes/no.
    expect(screen.queryByRole('button', { name: /yes/i })).toBeNull()
    chooseYear(YEAR - 15)
    expect(getDeviceAge()?.band).toBe('13to17')
    expect(localStorage.getItem(DEVICE_AGE_KEY)).not.toContain(String(YEAR - 15))
    expect(await screen.findByText(/Namaste|Guest1/, {}, { timeout: 10000 })).toBeTruthy()
    unmount()

    // Next launch: straight home.
    render(<App />)
    await screen.findByText(/Guest1/, {}, { timeout: 10000 })
    expect(screen.queryByRole('heading', { name: 'When were you born?' })).toBeNull()
  })

  it('under 13: friendly block, guest ended, and the block survives a reload (cooldown)', async () => {
    setGuest()
    window.history.pushState({}, '', '/campaign')
    const { unmount } = render(<App />)
    await screen.findByRole('heading', { name: 'When were you born?' }, { timeout: 10000 })
    chooseYear(YEAR - 9)
    expect(await screen.findByRole('heading', { name: 'BHAO is for ages 13+' })).toBeTruthy()
    expect(localStorage.getItem('bhao_guest_profile')).toBeNull()
    expect(getUnderAgeBlock()).not.toBeNull()
    unmount()

    setGuest() // trying again with a fresh guest
    window.history.pushState({}, '', '/dashboard')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'BHAO is for ages 13+' }, { timeout: 10000 })).toBeTruthy()
    expect(screen.queryByLabelText('Year of birth')).toBeNull()
  })

  it('the sign-up form is blocked during the cooldown too', async () => {
    localStorage.setItem(UNDER_AGE_BLOCK_KEY, JSON.stringify({ until: Date.now() + 60_000 }))
    window.history.pushState({}, '', '/auth?mode=register')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'BHAO is for ages 13+' }, { timeout: 10000 })).toBeTruthy()
  })

  it.each([
    ['/privacy', 'Privacy Policy'],
    ['/terms', 'Terms of Service'],
    ['/delete-account', 'Delete your BHAO account'],
  ])('%s stays reachable without answering (and during a block)', async (path, heading) => {
    setGuest()
    localStorage.setItem(UNDER_AGE_BLOCK_KEY, JSON.stringify({ until: Date.now() + 60_000 }))
    window.history.pushState({}, '', path)
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: heading }, { timeout: 10000 })).toBeTruthy()
    expect(screen.queryByLabelText('Year of birth')).toBeNull()
  })

  it.each(['/parent-consent?token=abc', '/parent-consent/withdraw?token=abc'])('%s is public and ungated', async path => {
    setGuest()
    localStorage.setItem(UNDER_AGE_BLOCK_KEY, JSON.stringify({ until: Date.now() + 60_000 }))
    window.history.pushState({}, '', path)
    render(<App />)
    // Supabase is not configured in tests: the page says so instead of a sign-in or age wall.
    expect(await screen.findByRole('heading', { name: 'Not available right now' }, { timeout: 10000 })).toBeTruthy()
    expect(screen.queryByLabelText('Year of birth')).toBeNull()
  })
})

type AuthValue = ReturnType<typeof authHook.useAuth>

function mockAuth(over: Partial<AuthValue>) {
  const value = {
    user: null, profile: null, authUser: null, loading: false, guestProfile: null, isGuest: false,
    isOnlineAvailable: true, consentStatus: null, needsAgeAnswer: false, pendingConsent: false, isMinor: false,
    login: vi.fn(), loginWithGoogle: vi.fn(), register: vi.fn(), submitAccountAge: vi.fn(async () => 'ok' as const),
    logout: vi.fn(async () => undefined), refreshProfile: vi.fn(), playAsGuest: vi.fn(), exitGuest: vi.fn(), deleteAccount: vi.fn(),
    ...over,
  } as AuthValue
  vi.spyOn(authHook, 'useAuth').mockReturnValue(value)
  return value
}

function renderGate() {
  return render(<MemoryRouter><AgeGate><p>Home content</p></AgeGate></MemoryRouter>)
}

describe('account age question (existing accounts / first Google sign-in)', () => {
  it('asks an account without an age record once, then lets it through', async () => {
    const auth = mockAuth({ authUser: { id: 'u1' } as never, needsAgeAnswer: true, consentStatus: 'unknown' })
    const { rerender } = renderGate()
    expect(screen.getByRole('heading', { name: 'One quick question' })).toBeTruthy()
    expect(screen.queryByText('Home content')).toBeNull()
    await act(async () => chooseYear(YEAR - 16))
    expect(auth.submitAccountAge).toHaveBeenCalledWith('13to17')

    // Server now has the band: no question any more.
    mockAuth({ authUser: { id: 'u1' } as never, needsAgeAnswer: false, consentStatus: 'pending_consent' })
    rerender(<MemoryRouter><AgeGate><p>Home content</p></AgeGate></MemoryRouter>)
    expect(screen.getByText('Home content')).toBeTruthy()
  })

  it('under 13 asks to confirm before the account is closed', async () => {
    const auth = mockAuth({ authUser: { id: 'u1' } as never, needsAgeAnswer: true, consentStatus: 'unknown', submitAccountAge: vi.fn(async () => 'blocked' as const) })
    renderGate()
    chooseYear(YEAR - 10)
    expect(auth.submitAccountAge).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeTruthy()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: "Yes, that's right" })) })
    expect(auth.submitAccountAge).toHaveBeenCalledWith('under13')
  })

  it('an answered account and a 13–17 account waiting for consent go straight through', () => {
    mockAuth({ authUser: { id: 'u1' } as never, consentStatus: 'not_required' })
    renderGate()
    expect(screen.getByText('Home content')).toBeTruthy()
    cleanup()
    mockAuth({ authUser: { id: 'u1' } as never, consentStatus: 'pending_consent', pendingConsent: true, isGuest: true })
    renderGate()
    expect(screen.getByText('Home content')).toBeTruthy()
  })

  it('a device in the under-13 cooldown signs a new, unanswered account out', () => {
    localStorage.setItem(UNDER_AGE_BLOCK_KEY, JSON.stringify({ until: Date.now() + 60_000 }))
    const auth = mockAuth({ authUser: { id: 'u1' } as never, needsAgeAnswer: true, consentStatus: 'unknown' })
    renderGate()
    expect(screen.getByRole('heading', { name: 'BHAO is for ages 13+' })).toBeTruthy()
    expect(auth.logout).toHaveBeenCalledTimes(1)
    expect(auth.submitAccountAge).not.toHaveBeenCalled()
  })
})
