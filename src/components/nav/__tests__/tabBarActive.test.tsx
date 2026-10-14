// @vitest-environment jsdom
/**
 * The bottom tab bar highlights the screen you are on: Leaderboard and Daily contracts are
 * sub-screens of Home (reached from cards on Home), so no tab is highlighted there; each tab
 * destination highlights only itself.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../../i18n/i18n'
import { TabBar, NAV_ITEMS } from '../TabBar'
import { LeaderboardView } from '../../../pages/menus/LeaderboardView'
import { ContractsView } from '../../../pages/menus/ContractsView'

afterEach(cleanup)

const activeTabs = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('.tabbar [aria-current="page"]')).map(a => a.getAttribute('href'))

describe('TabBar active tab', () => {
  it('highlights exactly the given destination', async () => {
    await i18n.changeLanguage('en')
    for (const item of NAV_ITEMS) {
      const { container, unmount } = render(<MemoryRouter><TabBar active={item.key} /></MemoryRouter>)
      expect(activeTabs(container)).toEqual([item.to])
      unmount()
    }
  })

  it('Leaderboard does not highlight Home', async () => {
    await i18n.changeLanguage('en')
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard?tab=leaderboard']}>
        <LeaderboardView rows={[]} loading={false} onRefresh={() => {}} />
      </MemoryRouter>,
    )
    expect(container.querySelector('.tabbar')).toBeTruthy()
    expect(activeTabs(container)).toEqual([])
  })

  it('Daily contracts does not highlight Home', async () => {
    await i18n.changeLanguage('en')
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard?tab=contracts']}>
        <ContractsView contracts={[]} progress={{}} loading={false} />
      </MemoryRouter>,
    )
    expect(container.querySelector('.tabbar')).toBeTruthy()
    expect(activeTabs(container)).toEqual([])
  })
})
