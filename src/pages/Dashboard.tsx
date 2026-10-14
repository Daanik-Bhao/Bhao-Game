import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { DailyRewardModal } from '../components/DailyRewardModal'
import { claimDailyReward, updateMyProfile } from '../lib/auth'
import type { DailyRewardResult, Profile } from '../types/database'
import { DeleteAccountButton } from '../components/DeleteAccountButton'
import { progressOwnerKey } from '../lib/campaignProgress'
import { HomeView } from './menus/HomeView'
import { ProfileView } from './menus/ProfileView'
import { LeaderboardView, rankLeaderboard, type LeaderboardRow } from './menus/LeaderboardView'
import { ContractsView, type ContractProgress, type ContractRow } from './menus/ContractsView'
import { useHomeHero, useLibraryCount } from './menus/homeData'
import { AVATAR_OPTIONS } from '../components/ui'
import { ContinueMatchPrompt } from '../components/ContinueMatchPrompt'
import { matchOwnerKey } from '../lib/matchSave'

/** YYYY-MM-DD in Asia/Kolkata, offset by `days` (the server's reward calendar). */
function istDate(days: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Date.now() + days * 86_400_000))
}

/** Dashboard "tabs" are URL state: /dashboard (home), ?tab=profile | leaderboard | contracts. */
type Tab = 'home' | 'leaderboard' | 'contracts' | 'profile'
const TABS: Tab[] = ['home', 'leaderboard', 'contracts', 'profile']

/** Leaderboard (top 50 by wins), fetched for the Home card and the full screen. */
function useLeaderboard(enabled: boolean) {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(enabled)
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(50)
    setRows((data as LeaderboardRow[] | null) ?? [])
    setLoading(false)
  }, [])
  useEffect(() => {
    if (enabled) void fetchLeaderboard()
  }, [enabled, fetchLeaderboard])
  return { rows, loading, refresh: fetchLeaderboard }
}

/** Today's contracts + this player's progress (RPC with a direct-table fallback, as before). */
function useContracts(profile: Profile | null) {
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [progress, setProgress] = useState<ContractProgress>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContracts() {
      if (!profile) return
      try {
        const rpcResult = await supabase.rpc('get_active_contracts')
        const { error } = rpcResult
        let activeContracts = rpcResult.data as ContractRow[] | null

        // Fallback if RPC is not yet applied to the database
        if (error) {
          console.warn('get_active_contracts RPC not found, falling back to direct table query.')
          const res = await supabase
            .from('daily_contracts')
            .select('*')
            .gte('contract_date', new Date().toISOString().split('T')[0])
          activeContracts = res.data as ContractRow[] | null
        }

        if (activeContracts) {
          setContracts(activeContracts)
          if (activeContracts.length > 0) {
            const contractIds = activeContracts.map(c => c.id)
            const { data: pContracts } = await supabase
              .from('player_contracts')
              .select('*')
              .eq('player_id', profile.id)
              .in('contract_id', contractIds)

            if (pContracts) {
              const pMap: ContractProgress = {}
              for (const pc of pContracts as { contract_id: string; progress: number; completed: boolean }[]) {
                pMap[pc.contract_id] = { progress: pc.progress, completed: pc.completed }
              }
              setProgress(pMap)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching contracts:', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchContracts()
  }, [profile])

  return { contracts, progress, loading }
}

/** Signed-in home (`/dashboard`): Home, Profile, and the Leaderboard / Contracts screens. */
export function Dashboard() {
  const { user, profile, refreshProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab') as Tab | null
  const tab: Tab = tabParam && TABS.includes(tabParam) ? tabParam : 'home'
  const goHome = () => setParams({})
  const openTab = (next: Tab) => setParams(next === 'home' ? {} : { tab: next })

  const ownerKey = progressOwnerKey(user?.id)
  const hero = useHomeHero(ownerKey)
  const library = useLibraryCount(ownerKey)
  const leaderboard = useLeaderboard(true)
  const contracts = useContracts(profile)

  const [showDailyReward, setShowDailyReward] = useState(false)
  const [dailyStreak, setDailyStreak] = useState(0)

  useEffect(() => {
    if (profile) {
      // The reward day is decided by the server (Asia/Kolkata); this only decides
      // whether to offer the modal and which day to highlight.
      const today = istDate(0)
      if (profile.last_login_date !== today) {
        const currentStreak = profile.last_login_date === istDate(-1) ? (profile.login_streak || 0) : 0
        setDailyStreak(currentStreak)
        setShowDailyReward(true)
      }
    }
  }, [profile])

  const handleClaimDaily = async (): Promise<DailyRewardResult | null> => {
    if (!profile) return null
    try {
      return await claimDailyReward()
    } catch (error) {
      console.error('Error claiming reward:', error)
      return null
    }
  }

  const handleDailyDone = async () => {
    setShowDailyReward(false)
    if (refreshProfile) await refreshProfile()
  }

  useEffect(() => {
    if (localStorage.getItem('justRegistered') === 'true') {
      navigate('/tutorial')
      localStorage.removeItem('justRegistered')
    }
  }, [navigate])

  const handleUpdateAvatar = async (newAvatar: string) => {
    if (!profile) return
    try {
      await updateMyProfile({ avatarUrl: newAvatar })
    } catch (e) {
      console.error(e)
    }
    await refreshProfile()
  }

  const handleUpdateName = async (newName: string) => {
    if (!profile || !newName.trim() || newName === profile.username) return
    try {
      // Also renames the leaderboard entry (server-side).
      await updateMyProfile({ username: newName.trim() })
    } catch (e) {
      console.error(e)
    }
    await refreshProfile()
  }

  const name = profile?.username ?? ''
  const ranked = rankLeaderboard(leaderboard.rows, 'highest_net_worth')
  const myRank = ranked.find(p => p.user_id === profile?.id)?.rank ?? null
  const contractsDone = contracts.contracts.filter(c => contracts.progress[c.id]?.completed).length

  let screen
  if (tab === 'leaderboard') {
    screen = (
      <LeaderboardView
        rows={leaderboard.rows}
        loading={leaderboard.loading}
        meId={profile?.id}
        meName={profile?.username}
        onRefresh={() => void leaderboard.refresh()}
        onBack={goHome}
      />
    )
  } else if (tab === 'contracts') {
    screen = <ContractsView contracts={contracts.contracts} progress={contracts.progress} loading={contracts.loading} onBack={goHome} />
  } else if (tab === 'profile' && profile) {
    screen = (
      <ProfileView
        profile={profile}
        avatars={AVATAR_OPTIONS}
        onSaveName={handleUpdateName}
        onPickAvatar={handleUpdateAvatar}
        onSignOut={async () => { await logout(); navigate('/') }}
        dangerZone={<DeleteAccountButton />}
      />
    )
  } else {
    screen = (
      <HomeView
        name={name}
        signedIn
        hero={hero}
        library={library}
        streak={profile?.login_streak ?? 0}
        coins={profile?.daanik_coins ?? 0}
        leaderboard={{
          loading: leaderboard.loading,
          myRank,
          top: ranked.slice(0, 3).map(p => ({
            id: p.id,
            name: p.user_id === profile?.id && profile?.username ? profile.username : p.username,
            value: p.highest_net_worth,
            isMe: p.user_id === profile?.id,
          })),
        }}
        contracts={{ loading: contracts.loading && !!profile, done: contractsDone, total: contracts.contracts.length }}
        onOpenLeaderboard={() => openTab('leaderboard')}
        onOpenContracts={() => openTab('contracts')}
      />
    )
  }

  return (
    <>
      {screen}
      {/* Saved single-player match: offered on Home, after the daily reward. */}
      {tab === 'home' && profile && <ContinueMatchPrompt key={profile.id} owner={matchOwnerKey(profile.id, null)} hold={showDailyReward} />}
      {showDailyReward && (
        <DailyRewardModal
          onClose={() => setShowDailyReward(false)}
          onClaim={handleClaimDaily}
          onDone={handleDailyDone}
          currentStreak={dailyStreak}
        />
      )}
    </>
  )
}
