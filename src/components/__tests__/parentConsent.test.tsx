// @vitest-environment jsdom
/**
 * Parental consent UI: the child's "waiting for your parent's OK" card, the public parent page
 * (approve / decline) and the withdraw page. The edge function is mocked.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import i18n from '../../i18n/i18n'

const api = vi.hoisted(() => ({
  getMyConsentStatus: vi.fn(),
  requestParentConsent: vi.fn(),
  resendParentConsent: vi.fn(),
  viewConsentRequest: vi.fn(),
  approveConsent: vi.fn(),
  declineConsent: vi.fn(),
  viewWithdrawToken: vi.fn(),
  withdrawConsent: vi.fn(),
}))

vi.mock('../../lib/parentConsent', async importOriginal => ({
  ...(await importOriginal<typeof import('../../lib/parentConsent')>()),
  ...api,
}))

import * as authHook from '../../hooks/useAuth'
import { ParentConsentCard } from '../age/ParentConsentCard'
import { ParentConsent, ParentWithdraw } from '../../pages/ParentConsent'
import { GuestHome } from '../../pages/GuestHome'

const YEAR = new Date().getFullYear()
const refreshProfile = vi.fn(async () => undefined)

function mockAuth(over: Partial<ReturnType<typeof authHook.useAuth>> = {}) {
  vi.spyOn(authHook, 'useAuth').mockReturnValue({
    user: null, profile: null, authUser: { id: 'kid' } as never, loading: false,
    guestProfile: { isGuest: true, id: 'guest-1', username: 'Guest1', avatar_url: null, created_at: '' },
    isGuest: true, isOnlineAvailable: true, consentStatus: 'pending_consent', needsAgeAnswer: false,
    pendingConsent: true, isMinor: true, login: vi.fn(), loginWithGoogle: vi.fn(), register: vi.fn(),
    submitAccountAge: vi.fn(), logout: vi.fn(), refreshProfile, playAsGuest: vi.fn(), exitGuest: vi.fn(), deleteAccount: vi.fn(),
    ...over,
  } as ReturnType<typeof authHook.useAuth>)
}

const status = (over: Record<string, unknown> = {}) => ({
  ok: true,
  status: { consentStatus: 'pending_consent', ageBand: '13to17', parentEmailMasked: null, lastSentAt: null, nextSendAt: null, requestExpiresAt: null, ...over },
})

beforeEach(async () => {
  localStorage.clear()
  vi.clearAllMocks()
  await i18n.changeLanguage('en')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('child: waiting for a parent', () => {
  it('asks for a parent email, sends it, then shows the masked address', async () => {
    mockAuth()
    api.getMyConsentStatus.mockResolvedValueOnce(status()).mockResolvedValue(status({ parentEmailMasked: 'p***@e***.com', nextSendAt: new Date(Date.now() + 60_000).toISOString() }))
    api.requestParentConsent.mockResolvedValue({ ok: true })
    render(<MemoryRouter><ParentConsentCard /></MemoryRouter>)
    const input = await screen.findByLabelText("Parent's or guardian's email")
    fireEvent.change(input, { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send to my parent' }))
    expect(screen.getByRole('alert').textContent).toMatch(/doesn't look like an email/)
    expect(api.requestParentConsent).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: 'parent@example.com' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Send to my parent' })) })
    expect(api.requestParentConsent).toHaveBeenCalledWith('parent@example.com', 'en')
    expect(await screen.findByText(/Sent! We emailed p\*\*\*@e\*\*\*\.com/)).toBeTruthy()
    // Resend is rate-limited: disabled with a countdown.
    const resend = screen.getByRole('button', { name: /Resend in/ }) as HTMLButtonElement
    expect(resend.disabled).toBe(true)
  })

  it('resend, change email and check again', async () => {
    mockAuth()
    api.getMyConsentStatus.mockResolvedValue(status({ parentEmailMasked: 'p***@e***.com' }))
    api.resendParentConsent.mockResolvedValue({ ok: false, error: 'rate_limited', retryAfterSeconds: 3600 })
    render(<MemoryRouter><ParentConsentCard /></MemoryRouter>)
    await screen.findByText(/We emailed p\*\*\*@e\*\*\*\.com/)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Resend email' })) })
    expect(api.resendParentConsent).toHaveBeenCalledWith('en')
    expect(screen.getByRole('alert').textContent).toMatch(/Please wait 1 h/)

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'My parent said yes, check again' })) })
    expect(refreshProfile).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Change email' }))
    expect(screen.getByLabelText("Parent's or guardian's email")).toBeTruthy()
  })

  it('Home shows the consent card instead of the sign-in nudge; Friends needs the OK', async () => {
    mockAuth()
    api.getMyConsentStatus.mockResolvedValue(status())
    render(<MemoryRouter initialEntries={['/dashboard']}><GuestHome /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: "Waiting for your parent's OK" })).toBeTruthy()
    expect(screen.getByText("Parent's OK")).toBeTruthy()
    expect(screen.queryByText('Keep your progress safe')).toBeNull()
  })

  it('Profile of a waiting account offers sign out and delete, not "exit guest mode"', () => {
    mockAuth()
    render(<MemoryRouter initialEntries={['/dashboard?tab=profile']}><GuestHome /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Delete account/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /exit guest/i })).toBeNull()
  })
})

function renderParent(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/parent-consent" element={<ParentConsent />} />
        <Route path="/parent-consent/withdraw" element={<ParentWithdraw />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('parent consent page', () => {
  it('shows the notice (data + child limits) and approves with a valid declaration', async () => {
    api.viewConsentRequest.mockResolvedValue({ ok: true, ageBand: '13to17' })
    api.approveConsent.mockResolvedValue({ ok: true })
    renderParent('/parent-consent?token=tok123')
    expect(await screen.findByRole('heading', { name: 'Your child wants to play BHAO' })).toBeTruthy()
    expect(api.viewConsentRequest).toHaveBeenCalledWith('tok123')
    expect(screen.getByText(/never keep the year of birth/)).toBeTruthy()
    expect(screen.getByText('Voice chat is turned off.')).toBeTruthy()
    expect(screen.getByText(/not shown on the public leaderboard/)).toBeTruthy()

    // Nothing filled in: three errors, no call.
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(screen.getByText('Please enter your full name.')).toBeTruthy()
    expect(screen.getByText('Please tick the box to confirm.')).toBeTruthy()
    expect(api.approveConsent).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Your full name'), { target: { value: 'Sunita Sharma' } })
    fireEvent.change(screen.getByLabelText('Your year of birth'), { target: { value: String(YEAR - 15) } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(screen.getByText('Only an adult (18 or older) can give consent.')).toBeTruthy()
    expect(api.approveConsent).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Your year of birth'), { target: { value: String(YEAR - 40) } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Approve' })) })
    expect(api.approveConsent).toHaveBeenCalledWith({ token: 'tok123', parentName: 'Sunita Sharma', parentBirthYear: YEAR - 40, declaration: true, lang: 'en' })
    expect(await screen.findByRole('heading', { name: 'Thank you!' })).toBeTruthy()
  })

  it('decline asks to confirm, then deletes the account', async () => {
    api.viewConsentRequest.mockResolvedValue({ ok: true })
    api.declineConsent.mockResolvedValue({ ok: true })
    renderParent('/parent-consent?token=tok9')
    await screen.findByRole('heading', { name: 'Your child wants to play BHAO' })
    fireEvent.click(screen.getByRole('button', { name: 'Decline and delete the account' }))
    expect(api.declineConsent).not.toHaveBeenCalled()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Yes, delete it' })) })
    expect(api.declineConsent).toHaveBeenCalledWith('tok9')
    expect(await screen.findByRole('heading', { name: 'Done' })).toBeTruthy()
  })

  it.each([
    ['expired', 'This link has expired'],
    ['used', 'This link was already used'],
    ['invalid_token', "This link doesn't work"],
  ])('a %s token shows a friendly message', async (error, title) => {
    api.viewConsentRequest.mockResolvedValue({ ok: false, error })
    renderParent('/parent-consent?token=x')
    expect(await screen.findByRole('heading', { name: title })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'support@daanik.com' }).length).toBeGreaterThan(0)
  })

  it('no token → invalid link, no server call', () => {
    renderParent('/parent-consent')
    expect(screen.getByRole('heading', { name: "This link doesn't work" })).toBeTruthy()
    expect(api.viewConsentRequest).not.toHaveBeenCalled()
  })

  it('works in Hindi', async () => {
    await i18n.changeLanguage('hi')
    api.viewConsentRequest.mockResolvedValue({ ok: true })
    renderParent('/parent-consent?token=t')
    expect(await screen.findByRole('heading', { name: 'आपका बच्चा BHAO खेलना चाहता है' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'मंज़ूर करें' })).toBeTruthy()
  })
})

describe('parent withdraw page', () => {
  it('confirms, then deletes the child account', async () => {
    api.viewWithdrawToken.mockResolvedValue({ ok: true, status: 'active_minor' })
    api.withdrawConsent.mockResolvedValue({ ok: true })
    renderParent('/parent-consent/withdraw?token=w1')
    await screen.findByRole('heading', { name: "Withdraw consent and delete your child's account" })
    fireEvent.click(screen.getByRole('button', { name: "Delete my child's account" }))
    expect(api.withdrawConsent).not.toHaveBeenCalled()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Yes, delete it' })) })
    expect(api.withdrawConsent).toHaveBeenCalledWith('w1')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Account deleted' })).toBeTruthy())
  })

  it('a revoked / unknown withdraw link explains and offers the contact', async () => {
    api.viewWithdrawToken.mockResolvedValue({ ok: false, error: 'invalid_token' })
    renderParent('/parent-consent/withdraw?token=old')
    expect(await screen.findByText(/doesn't work any more/)).toBeTruthy()
  })
})
