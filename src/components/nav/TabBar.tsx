import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, House, Map as MapIcon, User, type LucideIcon } from 'lucide-react'
import './nav.css'

/** The four main destinations of the menu screens (spec §A.2 q8). */
export type NavKey = 'home' | 'campaign' | 'library' | 'profile'

export interface NavItem { key: NavKey; to: string; icon: LucideIcon; labelKey: string }

/** Routes: Home = /dashboard, Campaign = /campaign, Library = /library, Profile = /dashboard?tab=profile. */
export const NAV_ITEMS: NavItem[] = [
  { key: 'home', to: '/dashboard', icon: House, labelKey: 'nav.home' },
  { key: 'campaign', to: '/campaign', icon: MapIcon, labelKey: 'nav.campaign' },
  { key: 'library', to: '/library', icon: BookOpen, labelKey: 'nav.library' },
  { key: 'profile', to: '/dashboard?tab=profile', icon: User, labelKey: 'nav.profile' },
]

export interface TabBarProps {
  /** Highlighted destination (omit on sub-screens such as Leaderboard). */
  active?: NavKey
  className?: string
}

/**
 * Bottom tab bar for menu screens on phones / tablets / phone landscape (hidden on desktop
 * ≥ 1024×600, where AppBar shows the same destinations as pills).
 *
 * Usage: `<div className="page page--tabbar"> <AppBar active="campaign" /> … <TabBar active="campaign" /> </div>`
 * and call `useToastPlacement('bottom')` in the page so toasts sit above the bar.
 * `.page--tabbar` adds the bottom padding (ui.css).
 */
export function TabBar({ active, className = '' }: TabBarProps) {
  const { t } = useTranslation()
  return (
    <nav className={`tabbar ${className}`.trim()} aria-label={t('nav.main')}>
      {NAV_ITEMS.map(({ key, to, icon: Icon, labelKey }) => {
        const on = key === active
        return (
          <Link key={key} to={to} className={`tabbar__item${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined}>
            <span className="tabbar__pill" aria-hidden="true"><Icon size={22} strokeWidth={2.25} /></span>
            <span>{t(labelKey)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
