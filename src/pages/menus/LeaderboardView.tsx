import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react'
import { Avatar, Button, EmptyState, Segmented, Skeleton, buttonClass, useToastPlacement } from '../../components/ui'
import { TabBar } from '../../components/nav/TabBar'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import '../menus.css'

export interface LeaderboardRow {
  id: string
  user_id: string
  username: string
  wins: number
  losses: number
  total_games: number
  highest_net_worth: number
}

type SortField = 'highest_net_worth' | 'wins'

/** Sorted + ranked rows (same rules as before: wealth or wins, ranks assigned after sorting). */
export function rankLeaderboard(rows: LeaderboardRow[], field: SortField) {
  return [...rows]
    .sort((a, b) => (field === 'wins' ? b.wins - a.wins : b.highest_net_worth - a.highest_net_worth))
    .map((p, i) => ({ ...p, rank: i + 1, winRate: p.total_games > 0 ? Math.round((p.wins / p.total_games) * 100) : 0 }))
}

export interface LeaderboardViewProps {
  rows: LeaderboardRow[]
  loading: boolean
  /** Signed-in player's id and name (their row is highlighted and shows their current name) */
  meId?: string
  meName?: string
  onRefresh: () => void
  /** Back to Home (default: /dashboard) */
  onBack?: () => void
}

/** Full Leaderboard screen (opened from the Home card; Dashboard tab state `leaderboard`). */
export function LeaderboardView({ rows, loading, meId, meName, onRefresh, onBack }: LeaderboardViewProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const navigate = useNavigate()
  const [field, setField] = useState<SortField>('highest_net_worth')
  const [showAll, setShowAll] = useState(false)
  useToastPlacement('bottom')

  const ranked = rankLeaderboard(rows, field)
  const visible = showAll ? ranked : ranked.slice(0, 10)
  const me = ranked.find(p => p.user_id === meId)

  return (
    <div className="page page--tabbar">
      <header className="screen-bar">
        <Button variant="ghost" className="screen-bar__back" icon={<ArrowLeft size={22} aria-hidden="true" />} aria-label={t('common.back')} onClick={onBack ?? (() => navigate('/dashboard'))} />
        <h1 className="screen-bar__title">{t('leaderboard.title')}</h1>
        <div className="screen-bar__actions">
          <Button variant="outline" size="s" icon={<RefreshCw size={18} aria-hidden="true" />} aria-label={t('common.refresh')} onClick={onRefresh} loading={loading} />
        </div>
      </header>
      <main className="page__main page__main--list lb">
        <Segmented
          block
          ariaLabel={t('leaderboard.sortBy')}
          value={field}
          onChange={setField}
          options={[
            { value: 'highest_net_worth', label: t('leaderboard.bestWealth') },
            { value: 'wins', label: t('leaderboard.wins') },
          ]}
        />

        {!loading && me && (
          <p className="lb__me">{t('home.yourRank')} <b className="num">#{me.rank}</b></p>
        )}

        {loading ? (
          <div className="lb__list" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} height={64} className="lb__skeleton" />)}
          </div>
        ) : ranked.length === 0 ? (
          <EmptyState
            title={t('leaderboard.empty')}
            body={t('leaderboard.emptyBody')}
            action={<Link to="/game?mode=practice" className={buttonClass('primary', 's')}>{t('leaderboard.playNow')}</Link>}
          />
        ) : (
          <>
            <ol className="lb__list">
              {visible.map((p, i) => {
                const isMe = p.user_id === meId
                const name = isMe && meName ? meName : p.username
                return (
                  <li key={p.id} className={`panel lb-row${isMe ? ' is-me' : ''}`}>
                    <span className={`lb-row__rank num${p.rank <= 3 ? ` is-top is-top-${p.rank}` : ''}`}>
                      {p.rank <= 3 && <Trophy size={14} strokeWidth={2.5} aria-hidden="true" />}
                      <span>{p.rank}</span>
                    </span>
                    <Avatar name={name} seat={i} />
                    <span className="lb-row__main">
                      <span className="lb-row__name">{name}{isMe && <span className="lb-row__you"> · {t('leaderboard.you')}</span>}</span>
                      <span className="lb-row__meta">{t('leaderboard.winsCount', { count: p.wins })}</span>
                    </span>
                    <span className="lb-row__value num">{formatMoney(p.highest_net_worth, { compact: true, lang })}</span>
                  </li>
                )
              })}
            </ol>
            {!showAll && ranked.length > 10 && (
              <Button variant="outline" block onClick={() => setShowAll(true)}>{t('leaderboard.showAll')}</Button>
            )}
          </>
        )}
      </main>
      <TabBar active="home" />
    </div>
  )
}
