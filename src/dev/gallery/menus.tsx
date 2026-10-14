import { useState } from 'react'
import { HomeView, type HomeViewProps } from '../../pages/menus/HomeView'
import { GuestProfileView, ProfileView, type ProfileStats } from '../../pages/menus/ProfileView'
import { LeaderboardView, type LeaderboardRow } from '../../pages/menus/LeaderboardView'
import { ContractsView, type ContractProgress, type ContractRow } from '../../pages/menus/ContractsView'
import { DailyRewardModal } from '../../components/DailyRewardModal'
import { DeleteAccountButton } from '../../components/DeleteAccountButton'
import type { DailyRewardResult } from '../../types/database'
import type { GalleryScreen } from './types'
import { AVATAR_OPTIONS } from '../../components/ui'

/* Mock data for the signed-in menu screens (no Supabase needed). */
const ME = { name: 'Tester', signedIn: true, avatar: null }
const GUEST = { name: 'Tester', signedIn: false, avatar: null }
const NAMES = ['Priya', 'Rahul', 'Aman', 'Tester', 'Sneha', 'Kabir', 'Isha', 'Arjun', 'Meera', 'Dev', 'Zoya', 'Neel', 'Tara', 'Vikram']

const LB_ROWS: LeaderboardRow[] = NAMES.map((n, i) => ({
  id: `lb-${i}`,
  user_id: n === 'Tester' ? 'me' : `u-${i}`,
  username: n,
  wins: 40 - i * 3,
  losses: 10 + i,
  total_games: 50 + i * 2,
  highest_net_worth: 9_850_000 - i * 520_000,
}))

const CONTRACTS: ContractRow[] = [
  { id: 'c1', title: 'Save three times', description: 'Choose Save on 3 decision cards in any game.', difficulty: 'easy', requirement_value: 3, reward_dc: 20 },
  { id: 'c2', title: 'Win a practice game', description: 'Finish first against bots.', difficulty: 'medium', requirement_value: 1, reward_dc: 50 },
  { id: 'c3', title: 'Block two attacks', description: 'Use shields to block 2 attacks this week.', difficulty: 'hard', is_weekly: true, requirement_value: 2, reward_dc: 100, reward_card_tier: 'rare' },
]
const CT_PROGRESS: ContractProgress = { c1: { progress: 3, completed: true }, c2: { progress: 1, completed: true }, c3: { progress: 1, completed: false } }

const PROFILE: ProfileStats = {
  username: 'Tester', avatar_url: null, rank_points: 820, daanik_coins: 240,
  games_played: 27, games_won: 11, win_streak: 2, max_win_streak: 5,
}

const signedInHome: HomeViewProps = {
  name: 'Tester',
  signedIn: true,
  hero: { kind: 'level', levelId: 'level_2', number: 2, stars: 1 },
  library: { unlocked: 4, total: 22, unseen: 1 },
  streak: 3,
  coins: 240,
  leaderboard: {
    loading: false,
    myRank: 4,
    top: LB_ROWS.slice(0, 3).map(r => ({ id: r.id, name: r.username, value: r.highest_net_worth })),
  },
  contracts: { loading: false, done: 2, total: 3 },
  viewer: ME,
}

const noop = () => {}
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

function SignedInProfile({ openDelete = false }: { openDelete?: boolean }) {
  const [p, setP] = useState(PROFILE)
  return (
    <ProfileView
      profile={p}
      avatars={AVATAR_OPTIONS}
      onSaveName={async name => { await wait(400); setP(x => ({ ...x, username: name.trim() || x.username })) }}
      onPickAvatar={async avatar => { await wait(300); setP(x => ({ ...x, avatar_url: avatar })) }}
      onSignOut={noop}
      dangerZone={<DeleteAccountButton initialOpen={openDelete} onDelete={async () => { await wait(800); throw new Error('mock') }} />}
      viewer={ME}
    />
  )
}

function DailyRewardDemo() {
  const [open, setOpen] = useState(true)
  const claim = async (): Promise<DailyRewardResult> => { await wait(600); return { reward: 30, streak: 3, already_claimed: false } }
  return (
    <>
      <HomeView {...signedInHome} />
      {open && <DailyRewardModal currentStreak={2} onClaim={claim} onClose={() => setOpen(false)} onDone={() => setOpen(false)} />}
    </>
  )
}

/** Owned by helper A (menu screens): Dashboard Home/Profile/Leaderboard/Contracts, guest Home/Profile, Daily reward, Delete account. */
export const MENU_SCREENS: GalleryScreen[] = [
  { path: 'home-signed-in', group: 'Menus', title: 'Home (signed-in)', note: 'Dashboard HomeTab: coins, streak, leaderboard + contracts cards', render: () => <HomeView {...signedInHome} /> },
  { path: 'home-signed-in-loading', group: 'Menus', title: 'Home (signed-in, loading cards)', render: () => <HomeView {...signedInHome} leaderboard={{ loading: true, myRank: null, top: [] }} contracts={{ loading: true, done: 0, total: 0 }} /> },
  { path: 'home-guest', group: 'Menus', title: 'Home (guest, level hero)', render: () => <HomeView name="Tester" signedIn={false} hero={{ kind: 'level', levelId: 'level_1', number: 1, stars: 0 }} library={{ unlocked: 4, total: 22, unseen: 0 }} viewer={GUEST} /> },
  { path: 'home-guest-tutorial', group: 'Menus', title: 'Home (guest, tutorial hero)', render: () => <HomeView name="Tester" signedIn={false} hero={{ kind: 'tutorial' }} library={{ unlocked: 0, total: 22, unseen: 0 }} viewer={GUEST} /> },
  { path: 'home-practice-hero', group: 'Menus', title: 'Home (campaign complete → practice hero)', render: () => <HomeView {...signedInHome} hero={{ kind: 'practice' }} /> },
  { path: 'leaderboard', group: 'Menus', title: 'Leaderboard screen', render: () => <LeaderboardView rows={LB_ROWS} loading={false} meId="me" meName="Tester" onRefresh={noop} /> },
  { path: 'leaderboard-empty', group: 'Menus', title: 'Leaderboard (empty)', render: () => <LeaderboardView rows={[]} loading={false} onRefresh={noop} /> },
  { path: 'contracts', group: 'Menus', title: 'Daily contracts screen', render: () => <ContractsView contracts={CONTRACTS} progress={CT_PROGRESS} loading={false} /> },
  { path: 'contracts-new', group: 'Menus', title: 'Daily contracts (not started)', render: () => <ContractsView contracts={CONTRACTS} progress={{}} loading={false} /> },
  { path: 'profile', group: 'Menus', title: 'Profile (signed-in)', note: 'settings + Danger zone', render: () => <SignedInProfile /> },
  { path: 'profile-guest', group: 'Menus', title: 'Profile (guest)', render: () => <GuestProfileView name="Tester" onlineAvailable onExitGuest={noop} viewer={GUEST} /> },
  { path: 'daily-reward', group: 'Menus', title: 'Daily reward modal', render: () => <DailyRewardDemo /> },
  { path: 'delete-account', group: 'Menus', title: 'Delete account dialog', note: 'mock delete fails after 0.8 s', render: () => <SignedInProfile openDelete /> },
]
