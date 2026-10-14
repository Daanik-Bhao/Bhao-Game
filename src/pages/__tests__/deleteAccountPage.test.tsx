// @vitest-environment jsdom
/**
 * Google Play needs a public web link for account deletion: `/delete-account` must render for a
 * signed-out visitor (no sign-in wall) and show both deletion paths.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import i18n from '../../i18n/i18n'
import App from '../../App'

afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

describe('/delete-account', () => {
  it('renders for a signed-out visitor with the in-app steps and the email option', async () => {
    await i18n.changeLanguage('en')
    window.history.pushState({}, '', '/delete-account')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Delete your BHAO account' })).toBeTruthy()
    // In-app steps use the real Profile labels
    expect(screen.getByText('Delete account', { selector: 'strong' })).toBeTruthy()
    expect(screen.getByText('Danger zone', { selector: 'strong' })).toBeTruthy()
    // Email option
    const mail = screen.getAllByRole('link', { name: 'support@daanik.com' })[0]
    expect(mail.getAttribute('href')).toBe('mailto:support@daanik.com')
    // Still on the page: not redirected to sign-in or home
    expect(window.location.pathname).toBe('/delete-account')
  })

  it('renders in Hindi too', async () => {
    await i18n.changeLanguage('hi')
    window.history.pushState({}, '', '/delete-account')
    render(<App />)
    const h1 = await screen.findByRole('heading', { level: 1 })
    expect(h1.textContent).toMatch(/[ऀ-ॿ]/)
    await i18n.changeLanguage('en')
  })
})
