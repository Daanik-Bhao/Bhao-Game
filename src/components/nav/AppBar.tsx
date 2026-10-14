import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { Avatar, Wordmark } from '../ui'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { NAV_ITEMS, type NavKey } from './TabBar'
import './nav.css'

export interface AppBarProps {
  /** Highlighted destination: desktop pill (home/campaign/library) or the avatar (profile). */
  active?: NavKey
  /** Show the Home · Campaign · Library pills on desktop (default true). */
  nav?: boolean
  /**
   * 'auto' (default): avatar → Profile for a signed-in player or guest; nothing when signed out.
   * 'none': no avatar (e.g. Landing, which shows a "Sign in" link via `actions`).
   */
  account?: 'auto' | 'none'
  /** Extra controls shown after the language pill (e.g. Landing's "Sign in"). */
  actions?: ReactNode
  /** Where the ₹ BHAO wordmark links (default: /dashboard when signed in or guest, else /). */
  homeTo?: string
  /** Override the signed-in / guest identity (dev gallery mocks); default comes from useAuth(). */
  viewer?: { name: string; signedIn: boolean; imageUrl?: string | null }
  className?: string
}

/**
 * Sticky 60px app bar for menu screens (spec §E.4, mockups home.html / landing.html):
 * ₹ BHAO wordmark · spacer · (desktop: nav pills) · language pill · avatar → Profile.
 *
 * Usage: `<AppBar active="library" />`. Pair with `<TabBar active="library" />` for phones.
 */
export function AppBar({ active, nav = true, account = 'auto', actions, homeTo, viewer, className = '' }: AppBarProps) {
  const { t } = useTranslation()
  const { user, profile, guestProfile, isGuest } = useAuth()
  const signedIn = viewer ? viewer.signedIn : !!user
  const known = viewer ? true : signedIn || isGuest
  const name = viewer?.name ?? profile?.username ?? guestProfile?.username ?? ''
  const imageUrl = viewer ? viewer.imageUrl : profile?.avatar_url
  const home = homeTo ?? (known ? '/dashboard' : '/')
  const showAvatar = account === 'auto' && known
  const profileItem = NAV_ITEMS.find(i => i.key === 'profile')

  return (
    <header className={`appbar ${className}`.trim()}>
      <span className="appbar__home"><Wordmark to={home} /></span>
      {nav && (
        <nav className="appbar__nav" aria-label={t('nav.main')}>
          {NAV_ITEMS.filter(i => i.key !== 'profile').map(({ key, to, icon: Icon, labelKey }) => {
            const on = key === active
            return (
              <Link key={key} to={to} className={`appbar__pill${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined}>
                <Icon size={18} strokeWidth={2.25} aria-hidden="true" />
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>
      )}
      <span className="appbar__spacer" />
      <div className="appbar__actions">
        <LanguageSwitcher variant="pill" />
        {actions}
        {showAvatar && profileItem && (
          <Link
            to={profileItem.to}
            className={`appbar__me${active === 'profile' ? ' is-active' : ''}`}
            aria-label={signedIn ? t('nav.profileOf', { name }) : t('nav.profileGuest', { name })}
            aria-current={active === 'profile' ? 'page' : undefined}
          >
            <Avatar name={name || t('guest.guest')} me imageUrl={signedIn ? imageUrl : null} />
          </Link>
        )}
      </div>
    </header>
  )
}
