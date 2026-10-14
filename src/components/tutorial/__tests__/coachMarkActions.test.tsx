// @vitest-environment jsdom
/**
 * On short phones (360×640) the "Save, Spend or Invest?" bubble is taller than the room above
 * the choices, so its text scrolls. The Next / Skip row must not scroll away with it: it is a
 * fixed footer of the bubble, outside the scroll area.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import i18n from '../../../i18n/i18n'
import { CoachMark } from '../CoachMark'

afterEach(cleanup)

describe('coach mark actions', () => {
  it('Next and Skip sit outside the scrolling text', async () => {
    await i18n.changeLanguage('en')
    render(
      <CoachMark stepKey="preview" kind="next" title="Save, Spend or Invest?" body={'Long text. '.repeat(60)}
        target={null} handIds={[]} lesson={2} lessons={9} onNext={() => {}} onSkip={() => {}} />,
    )
    const next = screen.getByRole('button', { name: 'Next' })
    const skip = screen.getByRole('button', { name: 'Skip tutorial' })
    for (const b of [next, skip]) {
      expect(b.closest('.tut-bubble')).toBeTruthy()
      expect(b.closest('.tut-bubble__scroll')).toBeNull()
    }
    expect(screen.getByText(/Long text/).closest('.tut-bubble__scroll')).toBeTruthy()
  })
})
