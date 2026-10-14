import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen, Bot, ChevronRight, ClipboardCheck, Flame, GraduationCap, Lock, Play, Star, Trophy, Users,
} from 'lucide-react'
import { Avatar, Button, DCoin, Progress, Sheet, Skeleton, buttonClass, useToastPlacement } from '../../components/ui'
import { Gullu } from '../../components/mascot/Gullu'
import { GameCard } from '../../components/GameCard'
import { AppBar, type AppBarProps } from '../../components/nav/AppBar'
import { TabBar } from '../../components/nav/TabBar'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import type { GameCard as GameCardType } from '../../types/game'
import { levelInfo, type HomeHero, type LibraryCount } from './homeData'
import '../menus.css'

export interface LeaderboardSummary {
  loading: boolean
  /** Your position in the fetched ranking, null when you are not on it yet */
  myRank: number | null
  top: { id: string; name: string; value: number; isMe?: boolean }[]
}

export interface ContractsSummary {
  loading: boolean
  done: number
  total: number
}

export interface HomeViewProps {
  /** Greeting name (username / guest name) */
  name: string
  signedIn: boolean
  hero: HomeHero
  library: LibraryCount
  /** Signed-in only: daily login streak (days) and Daanik Coins */
  streak?: number
  coins?: number
  leaderboard?: LeaderboardSummary
  contracts?: ContractsSummary
  onOpenLeaderboard?: () => void
  onOpenContracts?: () => void
  /** Guests: show the "Sign in" button only when online sign-in works */
  onlineAvailable?: boolean
  /** Dev gallery: identity for the app bar avatar */
  viewer?: AppBarProps['viewer']
  /**
   * A 13–17 account waiting for a parent's consent: 'notice' (the consent card) replaces the
   * "keep your progress safe" sign-in nudge and the Friends tile says it needs a parent's OK.
   */
  consentPending?: boolean
  notice?: ReactNode
}

const fmtCount = (n: number) => new Intl.NumberFormat('en-IN').format(n)

/**
 * Home (spec §E.4, mockup home.html) — one layout for guests (GuestHome) and signed-in players
 * (Dashboard HomeTab). Presentational: all data comes in as props.
 */
export function HomeView({
  name, signedIn, hero, library, streak = 0, coins = 0, leaderboard, contracts,
  onOpenLeaderboard, onOpenContracts, onlineAvailable = true, viewer, consentPending = false, notice,
}: HomeViewProps) {
  const { t } = useTranslation()
  const [coinInfo, setCoinInfo] = useState(false)
  useToastPlacement('bottom')

  return (
    <div className="page page--tabbar home">
      <AppBar active="home" viewer={viewer} />
      <main className="page__main home__main">
        <div className="home-greet">
          <Gullu mood="happy" size={60} bob />
          <div className="home-greet__text">
            <h1 className="home-greet__title">{t('home.greeting', { name })}</h1>
            {signedIn ? (
              <div className="home-chips">
                <span className="home-chip"><Flame size={16} strokeWidth={2.25} aria-hidden="true" />{t('home.streak', { count: streak })}</span>
                <button type="button" className="home-chip home-chip--button" onClick={() => setCoinInfo(true)} aria-haspopup="dialog">
                  <DCoin />
                  <span>{t('common.coinsCount', { n: fmtCount(coins) })}</span>
                </button>
              </div>
            ) : (
              <p className="home-greet__sub">{consentPending ? t('consent.home.sub') : t('home.guestSaved')}</p>
            )}
          </div>
        </div>

        <div className="home__col home__col--hero">
          <HeroCard hero={hero} />
        </div>

        <div className="home__col">
          <h2 className="home-sec">{t('home.quickPlay')}</h2>
          <div className="home-grid">
            <Link to="/game?mode=practice" className="panel home-tile">
              <span className="icon-box icon-box--invest"><Bot size={24} strokeWidth={2.25} aria-hidden="true" /></span>
              <span className="home-tile__title">{t('home.tile.practice.title')}</span>
              <span className="home-tile__body">{t('home.tile.practice.body')}</span>
            </Link>
            <Link to="/library" className="panel home-tile">
              <span className="icon-box icon-box--save"><BookOpen size={24} strokeWidth={2.25} aria-hidden="true" /></span>
              <span className="home-tile__title">{t('home.tile.library.title')}</span>
              <span className="home-tile__body">{t('home.tile.library.body')}</span>
              <LibraryRing unlocked={library.unlocked} total={library.total} />
            </Link>
            <Link to="/tutorial" className="panel home-tile">
              <span className="icon-box icon-box--risk"><GraduationCap size={24} strokeWidth={2.25} aria-hidden="true" /></span>
              <span className="home-tile__title">{t('home.tile.tutorial.title')}</span>
              <span className="home-tile__body">{t('home.tile.tutorial.body')}</span>
            </Link>
            {signedIn ? (
              <Link to="/multiplayer" className="panel home-tile">
                <span className="icon-box icon-box--brand"><Users size={24} strokeWidth={2.25} aria-hidden="true" /></span>
                <span className="home-tile__title">{t('home.tile.friends.title')}</span>
                <span className="home-tile__body">{t('home.tile.friends.bodySignedIn')}</span>
              </Link>
            ) : (
              <Link to={consentPending ? '/multiplayer' : '/auth'} className="panel home-tile">
                <span className="icon-box icon-box--muted"><Users size={24} strokeWidth={2.25} aria-hidden="true" /></span>
                <span className="home-tile__title">{t('home.tile.friends.title')}</span>
                <span className="home-tile__body">{consentPending ? t('consent.home.friendsBody') : t('home.tile.friends.body')}</span>
                <span className="chip home-tile__corner"><Lock size={12} strokeWidth={2.5} aria-hidden="true" />{consentPending ? t('consent.home.friendsLock') : t('home.signIn')}</span>
              </Link>
            )}
          </div>

          {signedIn ? (
            <div className="home-cards">
              {leaderboard && <LeaderboardCard data={leaderboard} onOpen={onOpenLeaderboard} />}
              {contracts && <ContractsCard data={contracts} onOpen={onOpenContracts} />}
            </div>
          ) : notice ? notice : (
            <div className="panel home-keep">
              <Gullu mood="wow" size={52} />
              <div className="home-keep__text">
                <h2 className="home-keep__title">{t('home.keepSafe')}</h2>
                <p>{onlineAvailable ? t('home.keepSafeBody') : t('guest.onlineUnavailable')}</p>
              </div>
              {onlineAvailable && <Link to="/auth" className={buttonClass('secondary', 's')}>{t('home.signIn')}</Link>}
            </div>
          )}
        </div>
      </main>
      <TabBar active="home" />

      <Sheet
        open={coinInfo}
        onClose={() => setCoinInfo(false)}
        title={t('common.coins')}
        footer={<Button block onClick={() => setCoinInfo(false)}>{t('common.gotIt')}</Button>}
      >
        <div className="coin-info">
          <span className="coin-info__count"><DCoin className="dcoin--l" /><span className="num">{fmtCount(coins)}</span></span>
          <p>{t('common.coinsInfo')}</p>
        </div>
      </Sheet>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */

/** Decorative fan of two small cards on the hero (text from the locale files). */
function HeroArt() {
  const { t, i18n } = useTranslation()
  const mk = (id: string, base: Omit<GameCardType, 'id' | 'name' | 'flavor'>): GameCardType => {
    const name = t(`home.art.${id}`)
    return { id: `home-art-${id}-${i18n.language}`, name, nameHi: name, flavor: '', ...base }
  }
  const choice = { label: '', description: '', effect: { type: 'wealth_change' as const, value: 0 } }
  const desire = mk('desire', { type: 'action', tier: 'common', effect: { type: 'wealth_change', value: -20000, target: 'self' } })
  const pocket = mk('pocket', {
    type: 'decision', tier: 'common',
    options: [{ type: 'spend', ...choice }, { type: 'save', ...choice }, { type: 'invest', ...choice }],
  })
  return (
    <div className="home-hero__art" aria-hidden="true">
      <GameCard card={desire} size="mini" className="home-hero__card home-hero__card--back" />
      <GameCard card={pocket} size="mini" className="home-hero__card home-hero__card--front" />
    </div>
  )
}

function HeroCard({ hero }: { hero: HomeHero }) {
  const { t } = useTranslation()
  let caption: string
  let title: string
  let body: string
  let cta: string
  let to: string
  let stars: number | null = null

  if (hero.kind === 'level') {
    const info = levelInfo(hero.levelId)
    caption = t('home.hero.levelCaption', { n: hero.number, total: info.total })
    title = t([`campaign.levels.${hero.levelId}.name`, `home.level.${hero.levelId}.name`], { defaultValue: info.name })
    const idea = t([`campaign.levels.${hero.levelId}.idea`, `home.level.${hero.levelId}.idea`])
    body = t('home.hero.levelBody', { age: info.age, idea })
    cta = t('home.hero.levelCta', { n: hero.number })
    to = `/campaign?level=${hero.levelId}`
    stars = hero.stars
  } else if (hero.kind === 'tutorial') {
    caption = t('home.hero.tutorialCaption')
    title = t('home.hero.tutorialTitle')
    body = t('home.hero.tutorialBody')
    cta = t('home.hero.tutorialCta')
    to = '/tutorial'
  } else {
    caption = t('home.hero.practiceCaption')
    title = t('home.hero.practiceTitle')
    body = t('home.hero.practiceBody')
    cta = t('home.hero.practiceCta')
    to = '/game?mode=practice'
  }

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <p className="home-hero__cap caps">{caption}</p>
      <h2 id="home-hero-title" className="home-hero__title">{title}</h2>
      <p className="home-hero__body">{body}</p>
      {stars !== null && (
        <div className="home-hero__stars" role="img" aria-label={t('home.hero.starsAria', { n: stars })}>
          {[0, 1, 2].map(i => (
            <Star key={i} size={22} strokeWidth={2.25} className={i < stars ? 'is-on' : undefined} aria-hidden="true" />
          ))}
        </div>
      )}
      <Link to={to} className={buttonClass('primary', 'l', { className: 'home-hero__cta' })}>
        <Play size={20} strokeWidth={2.25} aria-hidden="true" />
        <span className="btn__label">{cta}</span>
      </Link>
      <HeroArt />
    </section>
  )
}

/** Progress ring "4/22" (real Gyaan Library progress). */
export function LibraryRing({ unlocked, total }: { unlocked: number; total: number }) {
  const { t } = useTranslation()
  const r = 16
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(1, unlocked / total) : 0
  return (
    <span className="home-ring home-tile__corner" role="img" aria-label={t('home.libraryAria', { n: unlocked, total })}>
      <svg width="48" height="48" viewBox="0 0 40 40" aria-hidden="true">
        <circle className="home-ring__track" cx="20" cy="20" r={r} fill="none" strokeWidth="5" />
        <circle
          className="home-ring__fill" cx="20" cy="20" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="home-ring__text num" aria-hidden="true">{unlocked}/{total}</span>
    </span>
  )
}

function LeaderboardCard({ data, onOpen }: { data: LeaderboardSummary; onOpen?: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  return (
    <section className="panel home-card" aria-labelledby="home-lb-title">
      <div className="home-card__head">
        <span className="icon-box icon-box--risk"><Trophy size={22} strokeWidth={2.25} aria-hidden="true" /></span>
        <div className="home-card__titles">
          <h2 id="home-lb-title" className="home-card__title">{t('leaderboard.title')}</h2>
          <p className="home-card__sub">
            {data.loading ? t('common.loading')
              : data.myRank ? <>{t('home.yourRank')} <b className="num">#{data.myRank}</b></>
              : t('home.notRanked')}
          </p>
        </div>
        <Button variant="ghost" size="s" iconRight={<ChevronRight size={18} aria-hidden="true" />} onClick={onOpen} aria-label={t('home.seeAllOf', { what: t('leaderboard.title') })}>
          {t('home.seeAll')}
        </Button>
      </div>
      {data.loading ? (
        <div className="home-lb__skeleton"><Skeleton height={36} /><Skeleton height={36} /><Skeleton height={36} /></div>
      ) : data.top.length > 0 ? (
        <ol className="home-lb">
          {data.top.slice(0, 3).map((p, i) => (
            <li key={p.id} className={`home-lb__row${p.isMe ? ' is-me' : ''}`}>
              <span className="home-lb__rank num">{i + 1}</span>
              <Avatar name={p.name} seat={i} size="s" />
              <span className="home-lb__name">{p.name}</span>
              <span className="home-lb__value num">{formatMoney(p.value, { compact: true, lang })}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="home-card__empty">{t('leaderboard.empty')}</p>
      )}
    </section>
  )
}

function ContractsCard({ data, onOpen }: { data: ContractsSummary; onOpen?: () => void }) {
  const { t } = useTranslation()
  return (
    <section className="panel home-card" aria-labelledby="home-ct-title">
      <div className="home-card__head">
        <span className="icon-box icon-box--save"><ClipboardCheck size={22} strokeWidth={2.25} aria-hidden="true" /></span>
        <div className="home-card__titles">
          <h2 id="home-ct-title" className="home-card__title">{t('contracts.title')}</h2>
          <p className="home-card__sub">
            {data.loading ? t('common.loading')
              : data.total > 0 ? t('home.contractsDone', { done: data.done, total: data.total })
              : t('contracts.emptyShort')}
          </p>
        </div>
        <Button variant="ghost" size="s" iconRight={<ChevronRight size={18} aria-hidden="true" />} onClick={onOpen} aria-label={t('home.seeAllOf', { what: t('contracts.title') })}>
          {t('home.seeAll')}
        </Button>
      </div>
      {!data.loading && data.total > 0 && (
        <Progress value={data.done} max={data.total} tone="haldi" labelPosition="none" ariaLabel={t('contracts.title')} valueText={t('home.contractsDone', { done: data.done, total: data.total })} />
      )}
    </section>
  )
}
