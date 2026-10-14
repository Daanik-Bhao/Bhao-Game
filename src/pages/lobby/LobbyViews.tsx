import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Copy, LogOut, Play, Plus, Share2, Timer, Users } from 'lucide-react'
import type { MultiplayerMode } from '../../types/game'
import { Avatar, Button, Chip, Input, OfflineBanner, Panel, Segmented } from '../../components/ui'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import './lobby.css'

/** Presentational lobby screens (spec §E.9). Data / Supabase logic lives in pages/Lobby.tsx. */

export const LOBBY_MODES: { id: MultiplayerMode; minutes: number; goal: number }[] = [
  { id: 'blitz', minutes: 15, goal: 1_500_000 },
  { id: 'standard', minutes: 25, goal: 3_500_000 },
  { id: 'epic', minutes: 40, goal: 5_000_000 },
]

export type LobbyTab = 'create' | 'join'

export interface LobbyMenuViewProps {
  tab: LobbyTab
  onTab: (t: LobbyTab) => void
  maxPlayers: number
  onMaxPlayers: (n: number) => void
  mode: MultiplayerMode
  onMode: (m: MultiplayerMode) => void
  joinCode: string
  onJoinCode: (code: string) => void
  loading: boolean
  error: string
  onCreate: () => void
  onJoin: () => void
  onBack: () => void
}

export function LobbyMenuView(p: LobbyMenuViewProps) {
  const { t } = useTranslation()
  const lang = useLang()
  return (
    <div className="page lobby">
      <OfflineBanner />
      <header className="screen-bar">
        <Button variant="ghost" icon={<ArrowLeft size={22} />} aria-label={t('common.back')} onClick={p.onBack} className="screen-bar__back" />
        <h1 className="screen-bar__title">{t('lobby.title')}</h1>
      </header>
      <main className="page__main page__main--list lobby__main">
        <Segmented
          block
          ariaLabel={t('lobby.title')}
          value={p.tab}
          onChange={p.onTab}
          options={[{ value: 'create', label: t('lobby.tabCreate') }, { value: 'join', label: t('lobby.tabJoin') }]}
        />
        {p.error && <p className="lobby__error" role="alert">{p.error}</p>}

        {p.tab === 'create' ? (
          <form className="lobby__form" onSubmit={e => { e.preventDefault(); p.onCreate() }}>
            <section className="lobby__block" aria-labelledby="lobby-mode">
              <h2 id="lobby-mode" className="section-title">{t('lobby.gameMode')}</h2>
              <div className="mode-tiles" role="radiogroup" aria-labelledby="lobby-mode">
                {LOBBY_MODES.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={p.mode === m.id}
                    className="mode-tile"
                    onClick={() => p.onMode(m.id)}
                  >
                    <span className="mode-tile__name">{t(`lobby.modes.${m.id}`)}</span>
                    <span className="mode-tile__meta"><Timer size={16} aria-hidden="true" /> {t('lobby.minutes', { n: m.minutes })}</span>
                    <span className="mode-tile__meta">{t('lobby.goal', { goal: formatMoney(m.goal, { compact: true, lang }) })}</span>
                    {p.mode === m.id && <Check className="mode-tile__check" size={20} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>
            <section className="lobby__block" aria-labelledby="lobby-players">
              <h2 id="lobby-players" className="section-title">{t('lobby.maxPlayers')}</h2>
              <Segmented
                block
                ariaLabel={t('lobby.maxPlayers')}
                value={p.maxPlayers}
                onChange={p.onMaxPlayers}
                options={[2, 3, 4].map(n => ({ value: n, label: <span className="lobby__seg"><Users size={18} aria-hidden="true" /> <span className="num">{n}</span></span>, ariaLabel: t('lobby.playersCount', { n }) }))}
              />
            </section>
            <Button type="submit" size="l" block loading={p.loading} icon={<Plus size={20} aria-hidden="true" />}>{t('lobby.createBtn2')}</Button>
          </form>
        ) : (
          <form className="lobby__form" onSubmit={e => { e.preventDefault(); p.onJoin() }}>
            <Input
              label={t('lobby.roomCodeLabel')}
              code
              value={p.joinCode}
              onChange={e => p.onJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              maxLength={6}
              placeholder="K7Q2MX"
              hint={t('lobby.codeHint')}
              autoComplete="off"
            />
            <Button type="submit" size="l" block loading={p.loading} disabled={p.joinCode.trim().length < 4}>{t('lobby.joinBtn2')}</Button>
          </form>
        )}
      </main>
    </div>
  )
}

export interface WaitingPlayer { id: string; name: string; ready: boolean; host: boolean; me: boolean; seat: number }

export interface WaitingRoomViewProps {
  code: string
  maxPlayers: number
  mode?: MultiplayerMode
  players: WaitingPlayer[]
  isHost: boolean
  myReady: boolean
  canStart: boolean
  loading: boolean
  error: string
  onToggleReady: () => void
  onStart: () => void
  onLeave: () => void
}

export function WaitingRoomView(p: WaitingRoomViewProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const shareText = t('lobby.shareText', { code: p.code })

  const copy = async () => {
    try { await navigator.clipboard.writeText(p.code) } catch { /* clipboard blocked: the code is on screen */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (nav.share) {
      try { await nav.share({ text: shareText }); return } catch { /* cancelled */ return }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener')
  }
  const empty = Math.max(0, p.maxPlayers - p.players.length)

  return (
    <div className="page lobby">
      <OfflineBanner />
      <header className="screen-bar">
        <h1 className="screen-bar__title lobby__wait-title">{t('lobby.waitingRoom')}</h1>
      </header>
      <main className="page__main page__main--list lobby__main">
        <Panel className="room-code">
          <p className="caption">{t('lobby.roomCodeLabel')}</p>
          <p className="room-code__value num" aria-label={t('lobby.codeAria', { code: p.code.split('').join(' ') })}>{p.code}</p>
          <div className="room-code__actions">
            <Button variant="outline" size="s" icon={copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} onClick={copy}>
              {copied ? t('lobby.copied2') : t('lobby.copy')}
            </Button>
            <Button variant="secondary" size="s" icon={<Share2 size={18} aria-hidden="true" />} onClick={share}>{t('lobby.shareWhatsApp')}</Button>
          </div>
          <p className="sr-only" role="status">{copied ? t('lobby.copied2') : ''}</p>
        </Panel>

        <section aria-labelledby="lobby-slots">
          <h2 id="lobby-slots" className="section-title lobby__slots-title">{t('lobby.playersOf', { n: p.players.length, max: p.maxPlayers })}</h2>
          <ul className="slots">
            {p.players.map(pl => (
              <li key={pl.id} className={`slot${pl.me ? ' is-me' : ''}`}>
                <Avatar name={pl.name} seat={pl.seat} />
                <span className="slot__name">{pl.me ? t('lobby.you', { name: pl.name }) : pl.name}</span>
                {pl.host
                  ? <Chip tone="brand">{t('lobby.host')}</Chip>
                  : pl.ready
                    ? <Chip tone="save" icon={<Check size={14} aria-hidden="true" />}>{t('lobby.ready')}</Chip>
                    : <Chip>{t('lobby.notReady')}</Chip>}
              </li>
            ))}
            {Array.from({ length: empty }, (_, i) => (
              <li key={`empty-${i}`} className="slot is-empty">
                <span className="slot__plus" aria-hidden="true"><Plus size={18} /></span>
                <span className="slot__name">{t('lobby.waitingSlot')}</span>
              </li>
            ))}
          </ul>
        </section>

        {p.error && <p className="lobby__error" role="alert">{p.error}</p>}

        <div className="lobby__actions">
          {p.isHost ? (
            <>
              <Button size="l" block icon={<Play size={20} aria-hidden="true" />} onClick={p.onStart} disabled={!p.canStart} loading={p.loading}>
                {t('lobby.startGame2')}
              </Button>
              {!p.canStart && <p className="lobby__hint">{t('lobby.needReady')}</p>}
            </>
          ) : (
            <>
              <p className="lobby__hint">{t('lobby.waitingForHost2')}</p>
              <Button variant={p.myReady ? 'outline' : 'secondary'} size="l" block icon={p.myReady ? undefined : <Check size={20} aria-hidden="true" />} onClick={p.onToggleReady}>
                {p.myReady ? t('lobby.notReadyBtn') : t('lobby.imReady')}
              </Button>
            </>
          )}
          <Button variant="ghost" block icon={<LogOut size={18} aria-hidden="true" />} onClick={p.onLeave}>{t('lobby.leave')}</Button>
        </div>
      </main>
    </div>
  )
}
