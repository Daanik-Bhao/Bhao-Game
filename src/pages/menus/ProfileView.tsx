import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Check, ChevronRight, FileText, Flame, Gamepad2, Globe, LogOut, Medal, Pencil, Percent, Shield, Sparkles, Trophy, Volume2,
} from 'lucide-react'
import { Avatar, Button, DCoin, Input, Switch, buttonClass, resolveAvatar, useToastPlacement } from '../../components/ui'
import { Gullu } from '../../components/mascot/Gullu'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { RankBadge } from '../../components/RankBadge'
import { AppBar, type AppBarProps } from '../../components/nav/AppBar'
import { TabBar } from '../../components/nav/TabBar'
import { useReducedEffects, useSoundSetting } from '../../hooks/useReducedEffects'
import '../menus.css'

/* ------------------------------------------------------------------------------------------------
   Settings list shared by guest + signed-in Profile (spec §E.4 end).
   ------------------------------------------------------------------------------------------------ */
export function SettingsList() {
  const { t } = useTranslation()
  const { soundOn, setSoundOn } = useSoundSetting()
  const { setting: reduceOn, setReduceEffects } = useReducedEffects()
  return (
    <section className="profile-sec" aria-labelledby="settings-title">
      <h2 id="settings-title" className="section-title profile-sec__title">{t('common.settings.title')}</h2>
      <div className="panel settings">
        <div className="settings__lang">
          <span className="setting-row__label"><Globe size={20} strokeWidth={2.25} aria-hidden="true" />{t('common.settings.language')}</span>
          <LanguageSwitcher variant="segmented" className="seg--block" />
        </div>
        <div className="setting-row">
          <span className="setting-row__label"><Volume2 size={20} strokeWidth={2.25} aria-hidden="true" />{t('common.settings.sound')}</span>
          <Switch checked={soundOn} onChange={setSoundOn} label={t('common.settings.sound')} />
        </div>
        <div className="setting-row">
          <span className="setting-row__label settings__stack">
            <span className="settings__labelrow"><Sparkles size={20} strokeWidth={2.25} aria-hidden="true" />{t('common.settings.reduceEffects')}</span>
            <span className="settings__hint">{t('common.settings.reduceEffectsHint')}</span>
          </span>
          <Switch checked={reduceOn} onChange={setReduceEffects} label={t('common.settings.reduceEffects')} />
        </div>
        <Link to="/privacy" className="setting-row settings__link">
          <span className="setting-row__label"><Shield size={20} strokeWidth={2.25} aria-hidden="true" />{t('legal.privacy')}</span>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
        <Link to="/terms" className="setting-row settings__link">
          <span className="setting-row__label"><FileText size={20} strokeWidth={2.25} aria-hidden="true" />{t('legal.terms')}</span>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------------------------------------
   Guest profile
   ------------------------------------------------------------------------------------------------ */
export interface GuestProfileViewProps {
  name: string
  onlineAvailable: boolean
  /** Existing "Exit guest mode" logic (clears the guest and goes to the landing page) */
  onExitGuest: () => void
  viewer?: AppBarProps['viewer']
  /**
   * A 13–17 account waiting for a parent's consent (it plays locally like a guest): shows
   * "waiting for your parent" instead of the sign-in card, and Sign out + Delete account.
   */
  pendingAccount?: { onSignOut: () => void; dangerZone: ReactNode }
}

export function GuestProfileView({ name, onlineAvailable, onExitGuest, viewer, pendingAccount }: GuestProfileViewProps) {
  const { t } = useTranslation()
  useToastPlacement('bottom')
  return (
    <div className="page page--tabbar profile">
      <AppBar active="profile" viewer={viewer} />
      <main className="page__main page__main--list">
        <h1 className="page-title profile__title">{t('profile.title')}</h1>
        {pendingAccount ? (
          <section className="panel profile-guest">
            <Gullu mood="think" size={72} />
            <h2 className="profile-guest__title">{t('consent.profile.title')}</h2>
            <p className="profile-guest__body">{t('consent.profile.body')}</p>
            <Link to="/dashboard" className={buttonClass('primary', 'm', { block: true })}>{t('consent.profile.open')}</Link>
          </section>
        ) : (
          <section className="panel profile-guest">
            <Gullu mood="wow" size={72} />
            <h2 className="profile-guest__title">{t('profile.guestTitle')}</h2>
            <p className="profile-guest__body">{t('profile.guestBody', { name })}</p>
            {onlineAvailable
              ? <Link to="/auth" className={buttonClass('primary', 'm', { block: true })}>{t('home.signIn')}</Link>
              : <p className="caption-text">{t('guest.onlineUnavailable')}</p>}
          </section>
        )}

        <SettingsList />

        {pendingAccount ? (
          <>
            <section className="profile-sec">
              <Button variant="outline" block icon={<LogOut size={20} aria-hidden="true" />} onClick={pendingAccount.onSignOut}>{t('dashboard.signOut')}</Button>
            </section>
            <section className="profile-sec" aria-labelledby="danger-title">
              <h2 id="danger-title" className="section-title profile-sec__title">{t('profile.dangerZone')}</h2>
              <div className="panel profile-danger">
                <p className="profile-danger__text">{t('profile.dangerBody')}</p>
                {pendingAccount.dangerZone}
              </div>
            </section>
          </>
        ) : (
          <section className="profile-sec">
            <Button variant="outline" block className="btn--danger-text" icon={<LogOut size={20} aria-hidden="true" />} onClick={onExitGuest}>
              {t('guest.exit')}
            </Button>
            <p className="caption-text profile-sec__note">{t('profile.exitGuestNote')}</p>
          </section>
        )}
      </main>
      <TabBar active="profile" />
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
   Signed-in profile
   ------------------------------------------------------------------------------------------------ */
export interface ProfileStats {
  username: string
  avatar_url: string | null
  rank_points: number
  daanik_coins: number
  games_played: number
  games_won: number
  win_streak: number
  max_win_streak: number
}

export interface ProfileViewProps {
  profile: ProfileStats
  /** Avatar preset values (`/avatar/<id>`) the player can choose from */
  avatars: readonly string[]
  onSaveName: (name: string) => Promise<void>
  onPickAvatar: (url: string) => Promise<void>
  onSignOut: () => void
  /** The Danger zone control (DeleteAccountButton) */
  dangerZone: ReactNode
  viewer?: AppBarProps['viewer']
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n)

export function ProfileView({ profile, avatars, onSaveName, onPickAvatar, onSignOut, dangerZone, viewer }: ProfileViewProps) {
  const { t } = useTranslation()
  useToastPlacement('bottom')
  const [editingName, setEditingName] = useState(false)
  const [pickingAvatar, setPickingAvatar] = useState(false)
  const current = resolveAvatar(profile.avatar_url)
  const [newName, setNewName] = useState(profile.username)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!editingName) setNewName(profile.username)
  }, [profile.username, editingName])

  const winRate = profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0

  const saveName = async () => {
    setBusy(true)
    try { await onSaveName(newName) } finally {
      setBusy(false)
      setEditingName(false)
    }
  }
  const pickAvatar = async (url: string) => {
    setBusy(true)
    try { await onPickAvatar(url) } finally {
      setBusy(false)
      setPickingAvatar(false)
    }
  }

  const stats: { key: string; icon: ReactNode; value: string }[] = [
    { key: 'coins', icon: <DCoin />, value: fmt(profile.daanik_coins) },
    { key: 'played', icon: <Gamepad2 size={20} strokeWidth={2.25} />, value: fmt(profile.games_played) },
    { key: 'won', icon: <Trophy size={20} strokeWidth={2.25} />, value: fmt(profile.games_won) },
    { key: 'winRate', icon: <Percent size={20} strokeWidth={2.25} />, value: `${winRate}%` },
    { key: 'streak', icon: <Flame size={20} strokeWidth={2.25} />, value: fmt(profile.win_streak) },
    { key: 'bestStreak', icon: <Medal size={20} strokeWidth={2.25} />, value: fmt(profile.max_win_streak) },
  ]

  return (
    <div className="page page--tabbar profile">
      <AppBar active="profile" viewer={viewer} />
      <main className="page__main page__main--list">
        <h1 className="page-title profile__title">{t('profile.title')}</h1>

        <section className="panel profile-head" aria-label={t('profile.title')}>
          <Avatar name={profile.username} me size="l" avatar={profile.avatar_url} />
          <div className="profile-head__main">
            {editingName ? (
              <form className="profile-head__edit" onSubmit={e => { e.preventDefault(); void saveName() }}>
                <Input
                  label={t('profile.editUsername')}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  autoFocus
                  maxLength={24}
                  autoComplete="nickname"
                />
                <div className="profile-head__actions">
                  <Button type="submit" variant="secondary" size="s" loading={busy}>{busy ? t('common.saving') : t('common.save')}</Button>
                  <Button variant="ghost" size="s" onClick={() => setEditingName(false)} disabled={busy}>{t('common.cancel')}</Button>
                </div>
              </form>
            ) : (
              <div className="profile-head__name">
                <span className="profile-head__username">{profile.username}</span>
                <Button variant="ghost" size="s" icon={<Pencil size={18} aria-hidden="true" />} aria-label={t('profile.editUsername')} onClick={() => setEditingName(true)} />
              </div>
            )}
            <RankBadge rp={profile.rank_points} showProgress />
          </div>
        </section>

        <div className="profile-avatar-toggle">
          <Button variant="ghost" size="s" aria-expanded={pickingAvatar} onClick={() => setPickingAvatar(v => !v)}>
            {t('profile.changeAvatar')}
          </Button>
        </div>
        {pickingAvatar && (
          <div className="panel profile-avatars" role="group" aria-label={t('profile.chooseAvatar')}>
            {avatars.map((a, i) => {
              const on = !!current && resolveAvatar(a) === current
              return (
                <button
                  key={a}
                  type="button"
                  className="profile-avatars__opt"
                  aria-pressed={on}
                  aria-label={t('profile.avatarN', { n: i + 1 })}
                  disabled={busy}
                  onClick={() => void pickAvatar(a)}
                >
                  <Avatar name={profile.username} size="l" avatar={a} />
                  {on && <span className="profile-avatars__check"><Check size={14} strokeWidth={3} aria-hidden="true" /></span>}
                </button>
              )
            })}
          </div>
        )}

        <section className="profile-sec" aria-labelledby="stats-title">
          <h2 id="stats-title" className="section-title profile-sec__title">{t('profile.statsTitle')}</h2>
          <div className="profile-stats">
            {stats.map(s => (
              <div key={s.key} className="panel profile-stat">
                <span className="profile-stat__icon" aria-hidden="true">{s.icon}</span>
                <span className="profile-stat__text">
                  <span className="profile-stat__label">{t(`profile.stats.${s.key}`)}</span>
                  <span className="profile-stat__value num">{s.value}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <SettingsList />

        <section className="profile-sec">
          <Button variant="outline" block icon={<LogOut size={20} aria-hidden="true" />} onClick={onSignOut}>{t('dashboard.signOut')}</Button>
        </section>

        <section className="profile-sec" aria-labelledby="danger-title">
          <h2 id="danger-title" className="section-title profile-sec__title">{t('profile.dangerZone')}</h2>
          <div className="panel profile-danger">
            <p className="profile-danger__text">{t('profile.dangerBody')}</p>
            {dangerZone}
          </div>
        </section>
      </main>
      <TabBar active="profile" />
    </div>
  )
}
