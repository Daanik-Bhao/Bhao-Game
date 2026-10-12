import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import { Card } from '../components/ui/Card'


import { Wealth } from '../components/Wealth'
import { supabase } from '../lib/supabase'
import { isSoundEnabled, toggleSound } from '../lib/audio'
import { useTranslation } from 'react-i18next'
import { DailyRewardModal } from '../components/DailyRewardModal'


type Tab = 'home' | 'leaderboard' | 'contracts' | 'profile'


interface LeaderboardEntry {
  id: string
  user_id: string
  username: string
  wins: number
  losses: number
  total_games: number
  highest_net_worth: number
}

export function Dashboard() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('home')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState(() => Math.floor(Math.random() * 301) + 200)
  const [soundOn, setSoundOn] = useState(isSoundEnabled)
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(nextLng)
    localStorage.setItem('language', nextLng)
  }

  const [showDailyReward, setShowDailyReward] = useState(false)
  const [dailyStreak, setDailyStreak] = useState(0)

  useEffect(() => {
    if (profile) {
      const today = new Date().toISOString().split('T')[0]
      if (profile.last_login_date !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yStr = yesterday.toISOString().split('T')[0]

        let currentStreak = 0;
        if (profile.last_login_date === yStr) {
          currentStreak = profile.login_streak || 0;
        }

        setDailyStreak(currentStreak)
        setShowDailyReward(true)
      }
    }
  }, [profile])

  const handleClaimDaily = async (_day: number, _amount: number) => {
    if (!profile) return

    // Call the secure backend function
    const { error } = await supabase.rpc('claim_daily_reward')

    if (error) {
      console.error("Error claiming reward:", error)
      return
    }

    setShowDailyReward(false)
    if (refreshProfile) await refreshProfile()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const diff = Math.random() > 0.5 ? 1 : -1
        const changeAmount = Math.floor(Math.random() * 4) + 1
        return Math.max(200, Math.min(500, prev + (diff * changeAmount)))
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (localStorage.getItem('justRegistered') === 'true') {
      navigate('/tutorial')
      localStorage.removeItem('justRegistered')
    }
  }, [navigate])



  useEffect(() => {
    if (tab === 'leaderboard') fetchLeaderboard()
  }, [tab])

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true)
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(50)
    setLeaderboard(data ?? [])
    setLeaderboardLoading(false)
  }

  const coins = profile?.daank_coins ?? 100


  return (
    <div style={{ height: '100vh', background: 'transparent', display: 'flex', color: 'var(--text-dark)', overflow: 'hidden' }}>
      {showDailyReward && <DailyRewardModal onClose={() => setShowDailyReward(false)} onClaim={handleClaimDaily} currentStreak={dailyStreak} />}

      {/* Sidebar (Desktop) */}
      <aside className="desktop-flex" style={{
        width: isSidebarOpen ? 260 : 80,
        flexShrink: 0,
        background: '#0B4232', // Dark green from mockup
        padding: isSidebarOpen ? '32px 24px' : '32px 12px',
        flexDirection: 'column', gap: 6,
        height: '100vh',
        overflowY: 'auto', overflowX: 'hidden',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
      }}>
        {/* Logo and Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
          <button
            className="desktop-only"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'transparent', border: 'none', color: '#C6ED3E', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center' }}
          >
            ☰
          </button>
          {isSidebarOpen && (
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 36, color: '#C6ED3E', letterSpacing: '1px' }}>BHAO</div>
          )}
        </div>

        {([
          {
            id: 'home', label: t('dashboard.home'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            )
          },
          {
            id: 'leaderboard', label: t('dashboard.leaderboard'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M12 12v-8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8M18 12V6a2 2 0 0 0-2-2h-2"></path><circle cx="12" cy="6" r="1"></circle></svg>
            )
          },
          {
            id: 'contracts', label: t('dashboard.contracts'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            )
          },
          {
            id: 'profile', label: t('dashboard.profile'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
            )
          },
        ] as const).map(item => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              title={item.label}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                gap: 16,
                padding: '14px 20px', borderRadius: '0 24px 24px 0', border: 'none',
                background: isActive ? '#E5F6E3' : 'transparent', // Light green for active
                color: isActive ? '#0B4232' : '#FFFFFF', // Dark text if active, white if inactive
                cursor: 'pointer', fontSize: 18, fontWeight: 500, fontFamily: 'var(--font-body)',
                textAlign: 'left', width: isSidebarOpen ? 'calc(100% + 24px)' : '100%',
                marginLeft: isSidebarOpen ? '-24px' : 0, // Pull left to attach to edge
                transition: 'all 0.2s',
                marginBottom: 8
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', opacity: isActive ? 1 : 0.8 }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          )
        })}

        {/* How to Play Card */}
        {isSidebarOpen && (
          <div style={{
            background: 'linear-gradient(135deg, #2D9842 0%, #66D575 100%)',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }} onClick={() => navigate('/tutorial')} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>How to Play?</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>Learn the basics<br />and start winning &gt;</div>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Player Compact Profile */}
          {profile && isSidebarOpen && tab !== 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#66D575', fontSize: 13, fontWeight: 700 }}>Rookie Investor</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Level 3</span>
                <span style={{ color: '#FBBF24', fontSize: 11, fontWeight: 700 }}>150 XP</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: '37.5%', height: '100%', background: '#66D575', borderRadius: 3 }} />
              </div>
              <div style={{ color: '#fff', fontSize: 11, textAlign: 'right', marginTop: 2, opacity: 0.8 }}>150/400 XP</div>
            </div>
          )}

          {/* Settings Button (and toggles) */}
          {isSidebarOpen && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={toggleLanguage}
                style={{ flex: 1, padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
              >
                {i18n.language === 'en' ? 'हिंदी' : 'EN'}
              </button>
            </div>
          )}

          <button
            onClick={() => setSoundOn(toggleSound())} // Simple action for now, we'll keep it as a button
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', borderRadius: 8,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600,
              width: '100%', transition: 'background 0.2s', opacity: soundOn ? 1 : 0.5
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            {isSidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1, minWidth: 0,
        background: 'linear-gradient(to right, #E2FBE8 0%, #F5FFF7 100%)', // Match mockup background
        position: 'relative',
        overflowY: 'auto', overflowX: 'hidden'
      }}>

        {/* Absolute Coins Pill (Desktop Only) */}
        <div className="desktop-only" style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderRadius: 20, padding: '6px 16px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            <span style={{ fontSize: 18 }}>🪙</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{coins.toLocaleString()}DC</span>
          </div>
        </div>

        {/* Content Tabs */}
        <div style={{ padding: 'clamp(16px, 4vw, 40px)', paddingBottom: '90px' }}>
          {tab === 'home' && <HomeTab navigate={navigate} profile={profile} onlineUsers={onlineUsers} />}
          {tab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} loading={leaderboardLoading} profile={profile} onRefresh={fetchLeaderboard} />}
          {tab === 'contracts' && <ContractsTab />}
          {tab === 'profile' && <ProfileTab />}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="mobile-flex bottom-nav" style={{
        position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 50,
        padding: '12px 24px',
        justifyContent: 'space-between', alignItems: 'center',
        background: '#0B4232', // Dark green pill
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 40,
        flexWrap: 'nowrap',
        display: 'none', // Hidden by default, shown by .mobile-flex
        boxShadow: '0 12px 24px rgba(0,0,0,0.3)'
      }}>
        {([
          {
            id: 'home', label: t('dashboard.home'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            )
          },
          {
            id: 'leaderboard', label: t('dashboard.leaderboard'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M12 12v-8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8M18 12V6a2 2 0 0 0-2-2h-2"></path><circle cx="12" cy="6" r="1"></circle></svg>
            )
          },
          {
            id: 'contracts', label: t('dashboard.contracts'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            )
          },
          {
            id: 'profile', label: t('dashboard.profile'), icon: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
            )
          },
        ] as const).map(item => (
          <button
            key={item.id}
            className="bottom-nav-btn"
            onClick={() => setTab(item.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '4px', border: 'none', background: 'transparent',
              color: tab === item.id ? '#4ADE80' : '#FFFFFF',
              cursor: 'pointer', fontSize: 12, fontWeight: 400, fontFamily: 'inherit',
              transition: 'all 0.15s',
              opacity: tab === item.id ? 1 : 0.6
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function HomeTab({ navigate, profile, onlineUsers }: { navigate: (path: string) => void; profile: ReturnType<typeof useAuth>['profile']; onlineUsers: number }) {
  const { t } = useTranslation()
  const winRate = profile && profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, width: '100%', margin: '0 auto', position: 'relative' }}>

      {/* DESKTOP LAYOUT */}
      <div className="desktop-flex" style={{ width: '100%', flexDirection: 'column', gap: 24, position: 'relative' }}>
        {/* Candlestick faded background layer */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: '70%', height: 350,
          background: 'url("/avatars/dashboard design.webp") no-repeat right top / cover',
          opacity: 0.1, pointerEvents: 'none', zIndex: 0
        }} />

        {/* Top Header & Buttons */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 48, fontWeight: 500, color: '#1E1E1E', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
              {t('dashboard.welcome')},<br />
              <strong>{profile?.username ?? 'Tanishka'}</strong>
            </h1>
            <p style={{ color: '#6B7280', fontSize: 22, fontWeight: 400 }}>{t('dashboard.readyToBuild')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: '#10b981', fontWeight: 700, marginTop: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)', animation: 'pulse 2s infinite' }} />
              {onlineUsers} {t('dashboard.onlineNow')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginTop: 16 }}>
            {/* Companion Mode Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => navigate('/campaign')} // Change to appropriate route later
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <img src="/avatars/companion button.webp" alt="Companion Mode" style={{ height: 64, width: 'auto' }} />
              </button>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Play against AI bots</div>
            </div>

            {/* Play Online Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => navigate('/multiplayer')}
                style={{
                  background: 'linear-gradient(180deg, #1A284D 0%, #0F1832 100%)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: '0 32px', height: 64, width: 220,
                  color: '#4ADE80', fontSize: 24, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <span>🌐</span> Play Online
              </button>
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Play with real people</div>
            </div>
          </div>
        </div>

        {/* Career Journey Banner - New Dark Green Design */}
        <div style={{
          background: '#1A5A43', borderRadius: 20, padding: '24px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Avatar Circle */}
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#fff', border: '4px solid #fff', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <img src={profile?.avatar_url || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#E5E7EB', fontSize: 16, fontWeight: 700 }}>Rookie Investor</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
                  Level 3
                </h2>
                <span style={{ color: '#FBBF24', fontSize: 14, fontWeight: 700 }}>150 XP</span>
              </div>

              {/* Progress Bar Container */}
              <div style={{ width: 300, marginTop: 8 }}>
                <div style={{ width: '100%', height: 10, background: '#114030', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: '37.5%', height: '100%', background: '#66D575', borderRadius: 5 }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Playing Button */}
          <button onClick={() => navigate('/campaign')} style={{
            background: 'linear-gradient(180deg, #86EFAC 0%, #4ADE80 100%)',
            border: 'none', borderRadius: 12, padding: '16px 32px',
            color: '#064E3B', fontSize: 20, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(74, 222, 128, 0.4)',
            transition: 'transform 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Continue Playing
          </button>
        </div>

        {/* Season Banner (Mocking IPO Boom) */}
        <div style={{
          position: 'relative', zIndex: 1,
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }} onClick={() => navigate('/multiplayer')}>
          <img src="/avatars/eventbanner.webp" alt="Season 1: IPO Boom" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Bottom Stats Pill */}
        <div style={{
          background: '#1A284D', borderRadius: 20, padding: '24px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {[
            { label: 'Total Win', value: (profile?.games_won ?? 0).toString(), icon: '🏅', color: '#3B82F6' },
            { label: 'Win Rate', value: `${winRate}%`, icon: '🏆', color: '#F59E0B' },
            { label: 'Win Streak', value: (profile?.win_streak ?? 0).toString(), icon: '🔥', color: '#EF4444' },
            { label: 'Games Played', value: (profile?.games_played ?? 0).toString(), icon: '🎮', color: '#8B5CF6' },
          ].map((stat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Stat Icon container */}
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '1px solid rgba(255,255,255,0.1)' }}>
                {stat.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#9CA3AF', fontSize: 16 }}>{stat.label}</span>
                <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="mobile-flex" style={{ display: 'none', flexDirection: 'column', gap: 16, width: '100%' }}>
        {/* Mobile Welcome Card */}
        <div style={{ background: '#E2F4ED', borderRadius: 16, padding: '24px 20px', position: 'relative', border: '1px solid rgba(0,0,0,0.05)' }}>
          {/* Mobile Coins Pill inside card */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 4, background: '#10B981', borderRadius: 8, padding: '4px 10px', boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: 12 }}>🪙</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>200DC</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 500, color: '#000', fontFamily: 'var(--font-display)', marginBottom: 8, lineHeight: 1.2, paddingRight: 70 }}>
            Welcome back,<br />
            <strong>{profile?.username ?? 'Tanishka'}</strong>
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, fontWeight: 400, marginBottom: 24 }}>Ready to build your empire?</p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/campaign')} style={{ flex: 1, background: '#66D575', color: '#0B4232', borderRadius: 20, padding: '12px 8px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Companion Mode</div>
              <div style={{ fontSize: 10, color: 'rgba(11,66,50,0.6)', fontWeight: 500 }}>Play against AI bots</div>
            </button>
            <button onClick={() => navigate('/multiplayer')} style={{ flex: 1, background: '#1A284D', color: '#66D575', borderRadius: 20, padding: '12px 8px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}><span>🌐</span> Play Online</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Play with real people</div>
            </button>
          </div>
        </div>

        {/* Mobile Level Card */}
        <div style={{ background: '#0B4232', borderRadius: 16, padding: 20, border: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff', overflow: 'hidden', border: '2px solid #fff', flexShrink: 0 }}>
              <img src={profile?.avatar_url || 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>Level 3</h2>
                <span style={{ color: '#FBBF24', fontSize: 13, fontWeight: 700 }}>150 XP</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#114030', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '37.5%', height: '100%', background: '#66D575', borderRadius: 4 }}></div>
              </div>
              <div style={{ color: '#fff', fontSize: 11, textAlign: 'right', marginTop: 4, opacity: 0.9 }}>150/400 XP</div>
            </div>
          </div>
          <button onClick={() => navigate('/campaign')} style={{ width: '100%', background: '#86EFAC', border: 'none', borderRadius: 12, padding: '16px', color: '#064E3B', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>
            Continue Playing
          </button>
        </div>

        {/* Mobile Season Banner */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', background: '#F0F0E0' }} onClick={() => navigate('/multiplayer')}>
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#1A284D', color: '#4ADE80', fontSize: 10, fontWeight: 800, padding: '6px 10px', borderRadius: 8, zIndex: 2 }}>ACTIVE SEASON</div>
          <img src="/avatars/eventbanner.webp" alt="Season 1" style={{ width: '100%', height: 'auto', display: 'block', borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A5A43' }}>Season 1: IPO Boom</div>
              <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4, maxWidth: '90%', lineHeight: 1.3 }}>Tech IPOs Flooding Dalal Street</div>
            </div>
            <button style={{ background: '#1A284D', color: '#4ADE80', border: 'none', padding: '12px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
              View Reward
            </button>
          </div>
        </div>
      </div>


    </div>
  )
}

const PodiumStep = ({ rank, player, profile }: { rank: 1 | 2 | 3; player?: any; profile?: any }) => {
  if (!player) return <div style={{ width: '30%', minWidth: 100 }} />

  const isMe = player.user_id === profile?.id;
  const displayUsername = isMe && profile?.username ? profile.username : player.username;

  // Podium dimensions
  const W = rank === 1 ? 130 : 110;
  const H = rank === 1 ? 160 : rank === 2 ? 120 : 90;
  const D = 30; // Depth of 3D effect

  // SVG Paths
  const topFace = `M 0,${D} L ${W},${D} L ${W + D},0 L ${D},0 Z`;
  const frontFace = `M 0,${D} L ${W},${D} L ${W},${H + D} L 0,${H + D} Z`;
  const rightFace = `M ${W},${D} L ${W + D},0 L ${W + D},${H} L ${W},${H + D} Z`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      zIndex: rank === 1 ? 10 : 1,
      position: 'relative',
      marginTop: rank === 1 ? 0 : rank === 2 ? 40 : 70,
    }}>
      {/* Player Info Above Pillar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12, zIndex: 2 }}>
        {/* Avatar */}
        <div style={{
          width: rank === 1 ? 72 : 64, height: rank === 1 ? 72 : 64, borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid #ffffff', overflow: 'hidden'
        }}>
          <img
            src={isMe && profile?.avatar_url ? profile.avatar_url : player?.avatar_url || ('https://api.dicebear.com/9.x/avataaars/svg?seed=' + displayUsername)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="Avatar"
          />
        </div>

        {/* Name */}
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginTop: 8, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displayUsername}
        </div>

        {/* Score Pill */}
        <div style={{
          background: '#065f46', color: '#ffffff', fontWeight: 800, fontSize: 12,
          padding: '4px 16px', borderRadius: 20, marginTop: 4,
          boxShadow: '0 2px 5px rgba(6, 95, 70, 0.3)'
        }}>
          <Wealth amount={player.highest_net_worth} />
        </div>
      </div>

      {/* 3D Pillar */}
      <svg width={W + D} height={H + D} viewBox={`0 0 ${W + D} ${H + D}`} style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
        <defs>
          <linearGradient id={`front-grad-${rank}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <path d={topFace} fill="#6ee7b7" />
        <path d={frontFace} fill={`url(#front-grad-${rank})`} />
        <path d={rightFace} fill="#10b981" />
        <text x={W / 2} y={D + H / 2 + 25} fontSize={rank === 1 ? "80" : "64"} fontWeight="900" fill="#ffffff" textAnchor="middle" style={{ fontFamily: 'var(--font-display)' }}>
          {rank}
        </text>
      </svg>
    </div>
  )
}

function LeaderboardTab({ leaderboard, loading, profile, onRefresh }: { leaderboard: LeaderboardEntry[]; loading: boolean; profile: ReturnType<typeof useAuth>['profile']; onRefresh: () => void }) {
  const [showAll, setShowAll] = useState(false)
  const [sortField, setSortField] = useState<'wins' | 'winRate' | 'highest_net_worth'>('highest_net_worth')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (field: 'wins' | 'winRate' | 'highest_net_worth') => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(false) }
  }

  const enrichedLeaderboard = leaderboard.map(p => ({
    ...p,
    winRate: p.total_games > 0 ? Math.round((p.wins / p.total_games) * 100) : 0
  }))

  const sortedLeaderboard = [...enrichedLeaderboard].sort((a, b) => {
    let diff = 0
    if (sortField === 'wins') diff = a.wins - b.wins
    if (sortField === 'winRate') diff = a.winRate - b.winRate
    if (sortField === 'highest_net_worth') diff = a.highest_net_worth - b.highest_net_worth
    return sortAsc ? diff : -diff
  })

  // Pre-calculate ranks before pinning
  const rankedLeaderboard = sortedLeaderboard.map((p, index) => ({ ...p, rank: index + 1 }))

  const top3 = rankedLeaderboard.slice(0, 3)
  const remaining = rankedLeaderboard

  const displayData = showAll ? remaining : remaining.slice(0, 10)

  return (
    <>
      {/* DESKTOP LAYOUT */}
      <div className="desktop-flex" style={{ width: '100%', minHeight: '100%', padding: '30px 40px', flexDirection: 'column' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              Leader Board
            </h2>
            <button onClick={onRefresh} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '8px 20px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ width: 40, height: 40, border: '3px solid rgba(0,0,0,0.1)', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              Loading Leaders...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              No players found on the leaderboard yet.
            </div>
          ) : (
            <div style={{ width: '100%' }}>

              {/* Podium */}
              {top3.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 24, padding: '0 20px 0' }}>
                  <PodiumStep rank={2} player={top3[1]} profile={profile} />
                  <PodiumStep rank={1} player={top3[0]} profile={profile} />
                  <PodiumStep rank={3} player={top3[2]} profile={profile} />
                </div>
              )}

              {/* List Wrapper */}
              <div style={{
                position: 'relative', background: 'linear-gradient(180deg, #FAF4FF 0%, #BFC3E8 120.45%)', borderRadius: 40, padding: '32px 24px',
                marginTop: top3.length > 0 ? 0 : 40,
                boxShadow: '0px 0px 6.6px rgba(0, 0, 0, 0.29)'
              }}>

                {/* Smooth Notch at top */}
                {top3.length > 0 && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 0,
                    filter: 'drop-shadow(0px -2px 3px rgba(0,0,0,0.06))'
                  }}>
                    <svg width="100" height="12" viewBox="0 0 100 12" fill="none">
                      <path d="M0 12 C 30 12, 40 0, 50 0 C 60 0, 70 12, 100 12 Z" fill="#FAF4FF" />
                    </svg>
                  </div>
                )}

                {/* List Header/Sort Options */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginBottom: 16, position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sort by:</span>
                  <button onClick={() => handleSort('highest_net_worth')} style={{ background: 'none', border: 'none', color: sortField === 'highest_net_worth' ? '#8b5cf6' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase' }}>Wealth {sortField === 'highest_net_worth' && (sortAsc ? '↑' : '↓')}</button>
                  <button onClick={() => handleSort('wins')} style={{ background: 'none', border: 'none', color: sortField === 'wins' ? '#8b5cf6' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase' }}>Wins {sortField === 'wins' && (sortAsc ? '↑' : '↓')}</button>
                </div>

                {/* Player Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
                  {displayData.map((player) => {
                    const isMe = player.user_id === profile?.id
                    const displayUsername = isMe && profile?.username ? profile.username : player.username

                    // Medals based on exact Figma CSS
                    let rankBackground = 'linear-gradient(135deg, #f3f4f6, #d1d5db)'
                    let rankBorderColor = '#e5e7eb'
                    let rankTextColor = '#4b5563'

                    if (player.rank === 1) {
                      rankBackground = 'linear-gradient(138.77deg, #C7A83B 16.96%, #FFEDAC 50.54%, #C1990A 100%)'
                      rankBorderColor = '#C2AA6E'
                      rankTextColor = '#ffffff'
                    } else if (player.rank === 2) {
                      rankBackground = 'linear-gradient(139.23deg, #504F4F -2.47%, #EAEAEA 50.16%, #5C5C5C 99.85%)'
                      rankBorderColor = '#767676'
                      rankTextColor = '#ffffff'
                    } else if (player.rank === 3) {
                      rankBackground = 'linear-gradient(146.56deg, #D27E18 7.71%, #DFA763 58.54%, #6C410C 92.29%)'
                      rankBorderColor = '#9E6F4A'
                      rankTextColor = '#ffffff'
                    }

                    return (
                      <div key={player.id} style={{
                        display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 16, padding: '16px 24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: isMe ? '2px solid #059669' : '2px solid transparent',
                        transition: 'transform 0.2s',
                      }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>

                        {/* Rank Badge */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', background: rankBackground, border: `3px solid ${rankBorderColor}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: rankTextColor, fontWeight: 900, fontSize: 18,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                          {player.rank}
                        </div>

                        {/* Avatar */}
                        <div style={{
                          width: 48, height: 48, borderRadius: '50%', marginLeft: 16,
                          background: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #e5e7eb', overflow: 'hidden'
                        }}>
                          <img
                            src={isMe && profile?.avatar_url ? profile.avatar_url : (player as any)?.avatar_url || ('https://api.dicebear.com/9.x/avataaars/svg?seed=' + displayUsername)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            alt="Avatar"
                          />
                        </div>

                        {/* Details */}
                        <div style={{ marginLeft: 16, flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: '#1f2937' }}>
                            {displayUsername} {isMe && <span style={{ fontSize: 12, color: '#059669', marginLeft: 8 }}>(You)</span>}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                            <Wealth amount={player.highest_net_worth} /> <span style={{ opacity: 0.5 }}>• {player.wins} wins</span>
                          </div>
                        </div>

                        {/* Right side Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22L2 9L7 2H17L22 9L12 22Z" fill="#FBBF24" />
                            <path d="M2 9L12 13L22 9L17 2H7L2 9Z" fill="#F59E0B" />
                            <path d="M12 22L12 13L2 9L12 22Z" fill="#D97706" />
                            <path d="M12 22L12 13L22 9L12 22Z" fill="#B45309" />
                            <path d="M12 13L7 2L17 2L12 13Z" fill="#FDE68A" />
                          </svg>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {!showAll && remaining.length > 10 && (
                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <button
                      onClick={() => setShowAll(true)}
                      style={{
                        background: '#10b981', color: '#ffffff', border: 'none', borderRadius: 12,
                        padding: '12px 32px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                      onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                    >
                      View All Players
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="mobile-flex" style={{ width: '100%', flexDirection: 'column' }}>
        <div style={{ padding: '24px 16px 0' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: 32, fontFamily: 'var(--font-display)' }}>
            Leader Board
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No players found.</div>
          ) : (
            <div style={{ width: '100%' }}>
              {/* Podium */}
              {top3.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, transform: 'scale(0.85)', transformOrigin: 'bottom center', marginBottom: -10 }}>
                  <PodiumStep rank={2} player={top3[1]} profile={profile} />
                  <PodiumStep rank={1} player={top3[0]} profile={profile} />
                  <PodiumStep rank={3} player={top3[2]} profile={profile} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* List Wrapper - Dark Blue */}
        <div style={{
          background: '#0B1B3D', borderTopLeftRadius: 32, borderTopRightRadius: 32,
          padding: '40px 20px 20px', position: 'relative', zIndex: 5, flex: 1
        }}>
          {/* Smooth Notch at top */}
          <div style={{
            position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', zIndex: -1
          }}>
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none">
              <path d="M0 12 C 18 12, 24 0, 30 0 C 36 0, 42 12, 60 12 Z" fill="#0B1B3D" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayData.map((player) => {
              const isMe = player.user_id === profile?.id
              const displayUsername = isMe && profile?.username ? profile.username : player.username

              let rankBg = 'linear-gradient(135deg, #f3f4f6, #d1d5db)'
              let rankBorder = '#e5e7eb'
              if (player.rank === 1) {
                rankBg = 'linear-gradient(135deg, #FCD34D, #D97706)'; rankBorder = '#B45309'
              } else if (player.rank === 2) {
                rankBg = 'linear-gradient(135deg, #E5E7EB, #9CA3AF)'; rankBorder = '#6B7280'
              } else if (player.rank === 3) {
                rankBg = 'linear-gradient(135deg, #FDBA74, #C2410C)'; rankBorder = '#9A3412'
              }

              return (
                <div key={player.id} style={{
                  display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 16, padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {/* Rank Badge */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: rankBg, border: `2px solid ${rankBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 14, flexShrink: 0
                  }}>
                    {player.rank}
                  </div>

                  {/* Avatar Placeholder */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', marginLeft: 12,
                    background: 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 25% 50%) 50% / 10px 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #e5e7eb', flexShrink: 0
                  }}></div>

                  {/* Details */}
                  <div style={{ marginLeft: 16, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 18, color: '#1E293B' }}>{displayUsername}</div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: '#64748B' }}><Wealth amount={player.highest_net_worth} /></div>
                  </div>

                  {/* Gem Icon */}
                  <div style={{ flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22L2 9L7 2H17L22 9L12 22Z" fill="#FBBF24" />
                      <path d="M2 9L12 13L22 9L17 2H7L2 9Z" fill="#F59E0B" />
                      <path d="M12 22L12 13L2 9L12 22Z" fill="#D97706" />
                      <path d="M12 22L12 13L22 9L12 22Z" fill="#B45309" />
                      <path d="M12 13L7 2L17 2L12 13Z" fill="#FDE68A" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>

          {!showAll && remaining.length > 10 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button onClick={() => setShowAll(true)} style={{ background: 'transparent', border: '1px solid #4ADE80', color: '#4ADE80', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                View All
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ContractsTab() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const [contracts, setContracts] = useState<any[]>([])
  const [progressData, setProgressData] = useState<Record<string, { progress: number, completed: boolean }>>({})
  const [resetTime, setResetTime] = useState('Calculating...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContracts() {
      if (!profile) return
      try {
        let { data: activeContracts, error } = await supabase.rpc('get_active_contracts')
        
        // Fallback if RPC is not yet applied to the database
        if (error) {
          console.warn("get_active_contracts RPC not found, falling back to direct table query.");
          const res = await supabase
            .from('daily_contracts')
            .select('*')
            .gte('contract_date', new Date().toISOString().split('T')[0])
          activeContracts = res.data;
        }

        if (activeContracts) {
          setContracts(activeContracts)
          if (activeContracts.length > 0) {
            const contractIds = activeContracts.map((c: any) => c.id)
            const { data: pContracts } = await supabase
              .from('player_contracts')
              .select('*')
              .eq('player_id', profile.id)
              .in('contract_id', contractIds)

            if (pContracts) {
              const pMap: Record<string, { progress: number, completed: boolean }> = {}
              for (const pc of pContracts) {
                pMap[pc.contract_id] = { progress: pc.progress, completed: pc.completed }
              }
              setProgressData(pMap)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching contracts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchContracts()
  }, [profile])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / 1000 / 60) % 60)
      setResetTime(`${h}h ${m}m`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [])

  const difficultyColors: Record<string, string> = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }

  return (
    <>
      <div className="desktop-flex" style={{ maxWidth: 900, width: '100%', margin: '0 auto', paddingBottom: 60, flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'Space Grotesk, sans-serif' }}>{t('contracts.title')}</h2>
          <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{t('contracts.resetsIn')} <span style={{ color: 'var(--orange-dark)', fontWeight: 700 }}>{resetTime}</span></div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>{t('contracts.loading')}</div>
        ) : contracts.length === 0 ? (
          <Card style={{ padding: 24, textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.05)' }}>
            <div style={{ color: 'var(--text-muted)' }}>{t('contracts.empty')}</div>
          </Card>
        ) : (
          <>
            {Object.keys(progressData).length === 0 && (
              <Card style={{ padding: 24, textAlign: 'center', marginBottom: 20, background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🎮</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue-deep)', marginBottom: 4 }}>{t('contracts.startTitle')}</h3>
                <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>{t('contracts.startDesc')}</p>
              </Card>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contracts.map(contract => {
                const progress = progressData[contract.id]?.progress ?? 0
                const completed = progressData[contract.id]?.completed ?? false
                const pct = Math.min(100, (progress / contract.requirement_value) * 100)
                const color = difficultyColors[contract.difficulty] || '#3b82f6'

                return (
                  <Card key={contract.id} style={{ padding: 20, borderColor: completed ? 'rgba(16,185,129,0.5)' : contract.is_weekly ? 'rgba(245,158,11,0.4)' : 'rgba(0,0,0,0.1)', background: completed ? 'rgba(16,185,129,0.05)' : contract.is_weekly ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${color}22`, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t(`difficulty.${contract.difficulty}`)}
                          </span>
                          {contract.is_weekly && <span style={{ fontSize: 14, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.2)', color: '#d97706' }}>{t('contracts.weekly')}</span>}
                          {completed && <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>✓ {t('contracts.complete')}</span>}
                        </div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4, fontFamily: 'Space Grotesk, sans-serif' }}>{contract.title}</div>
                        <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 10 }}>{contract.description}</div>

                        <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: completed ? '#10b981' : color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{Math.min(progress, contract.requirement_value)}/{contract.requirement_value}</div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--orange-dark)', fontFamily: 'Space Grotesk, sans-serif' }}>🪙 {contract.reward_dc}</div>
                        {contract.reward_card_tier && (
                          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>+ 1 {contract.reward_card_tier} {t('contracts.card')}</div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* MOBILE LAYOUT */}
      <div className="mobile-flex" style={{ width: '100%', flexDirection: 'column', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#000', fontFamily: 'var(--font-display)', margin: 0 }}>Daily Contracts</h2>
          <span style={{ fontSize: 13, color: '#6B7280' }}>Resets in {resetTime}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>{t('contracts.loading')}</div>
        ) : contracts.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#4B5563', fontSize: 16, lineHeight: 1.4 }}>
              No active contracts for today.<br />Check back tomorrow
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contracts.map(contract => {
              const progress = progressData[contract.id]?.progress ?? 0
              const completed = progressData[contract.id]?.completed ?? false
              const pct = Math.min(100, (progress / contract.requirement_value) * 100)
              const color = difficultyColors[contract.difficulty] || '#3b82f6'

              return (
                <Card key={contract.id} style={{ padding: 16, borderRadius: 16, borderColor: completed ? 'rgba(16,185,129,0.5)' : 'rgba(0,0,0,0.05)', background: completed ? 'rgba(16,185,129,0.05)' : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${color}22`, color, textTransform: 'uppercase' }}>
                          {t(`difficulty.${contract.difficulty}`)}
                        </span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>{contract.title}</div>

                      <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden', marginTop: 12 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: completed ? '#10b981' : color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{Math.min(progress, contract.requirement_value)}/{contract.requirement_value}</div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange-dark)' }}>🪙 {contract.reward_dc}</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function ProfileTab() {
  const { t } = useTranslation()
  const { profile, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(profile?.username || '')
  const [updating, setUpdating] = useState(false)

  const winRate = profile && profile.games_played > 0 ? Math.round((profile.games_won / profile.games_played) * 100) : 0

  // Use first character of username if no avatar is set, or generic fallback
  const fallbackAvatar = profile?.username ? profile.username[0].toUpperCase() : '👤'
  const avatar = profile?.avatar_url || fallbackAvatar

  const AVATARS = [
    'https://i.postimg.cc/htzdfgq1/avatar1.jpg',
    'https://i.postimg.cc/D8PF88vR/avatar2.jpg',
    'https://i.postimg.cc/MvmxvvZy/avatar3.jpg',
    'https://i.postimg.cc/VJswMm5v/avatar4.jpg',
    'https://i.postimg.cc/Ln3Rnn4j/avatar5.jpg',
    'https://i.postimg.cc/sMfzSs11/avatar6.jpg',
    'https://i.postimg.cc/4Y4Gtsnz/avatar7.jpg',
    'https://i.postimg.cc/21jYvr3h/avatar8.jpg',
  ]

  const handleUpdateAvatar = async (newAvatar: string) => {
    if (!profile) return
    setUpdating(true)
    try {
      await supabase.from('profiles').update({ avatar_url: newAvatar }).eq('id', profile.id)
    } catch (e) {
      console.error(e)
    }
    await refreshProfile()
    setIsEditingAvatar(false)
    setUpdating(false)
  }

  const handleUpdateName = async () => {
    if (!profile || !newName.trim() || newName === profile.username) {
      setIsEditingName(false)
      return
    }
    setUpdating(true)
    try {
      const updatedName = newName.trim()
      await supabase.from('profiles').update({ username: updatedName }).eq('id', profile.id)
      await supabase.from('leaderboard').update({ username: updatedName }).eq('user_id', profile.id)
    } catch (e) {
      console.error(e)
    }
    await refreshProfile()
    setIsEditingName(false)
    setUpdating(false)
  }

  // Update local input state if profile updates externally
  useEffect(() => {
    if (profile?.username && !isEditingName) {
      setNewName(profile.username)
    }
  }, [profile?.username, isEditingName])

  return (
    <>
      <div className="desktop-flex" style={{ maxWidth: 900, width: '100%', margin: '0 auto', paddingBottom: 60, flexDirection: 'column' }}>
        {/* Banner & Avatar section */}
        <div style={{ position: 'relative', marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Top Banner */}
          <div style={{ width: '100%', height: 220, borderRadius: 24, overflow: 'hidden', backgroundImage: 'url("/avatars/dashboard design.webp")', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          </div>

          {/* Avatar overlapping banner */}
          <div style={{ marginTop: -70, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              style={{
                width: 140, height: 140, borderRadius: '50%', background: 'var(--card-paper)',
                border: '6px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 50, cursor: 'pointer', position: 'relative',
                boxShadow: '0 8px 24px rgba(252, 211, 77, 0.4)', zIndex: 10,

                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {(avatar.startsWith('/') || avatar.startsWith('http')) ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : avatar}
            </div>

            {/* Name & Edit Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              {isEditingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdateName()}
                    style={{ fontSize: 24, fontWeight: 800, padding: '4px 12px', borderRadius: 8, border: '2px solid var(--green-primary)', outline: 'none', fontFamily: 'Space Grotesk, sans-serif' }}
                  />
                  <button onClick={handleUpdateName} disabled={updating} style={{ background: 'var(--green-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>
                    {updating ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              ) : (
                <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1A202C', fontFamily: 'Space Grotesk, sans-serif', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {profile?.username ?? 'Name'}
                  <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A202C', fontSize: 20, display: 'flex', alignItems: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </h2>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Selector Modal */}
        {isEditingAvatar && (
          <div style={{ marginBottom: 40, padding: 24, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 16, color: '#64748B', marginBottom: 16, fontWeight: 700 }}>Choose your avatar:</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => handleUpdateAvatar(a)}
                  disabled={updating}
                  style={{
                    width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.05)',
                    border: avatar === a ? '3px solid #3b82f6' : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s', padding: 0, overflow: 'hidden'
                  }}
                >
                  {(a.startsWith('/') || a.startsWith('http')) ? <img src={a} alt="Avatar option" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : a}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* XP Progress Bar (Matching Mockup) */}
        <div style={{
          background: '#0F1E3A', borderRadius: 16, padding: '24px 32px', marginBottom: 40,
          boxShadow: '0 8px 24px rgba(15, 30, 58, 0.2)', position: 'relative'
        }}>
          <div style={{ color: '#FCD34D', fontSize: 16, fontWeight: 800, marginBottom: 8, letterSpacing: '0.02em' }}>
            Rookie Investor
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif' }}>Level 3</div>
            <div style={{ color: '#FCD34D', fontSize: 16, fontWeight: 700 }}>150 XP</div>
          </div>
          <div style={{ width: '100%', height: 16, background: '#2D4A3E', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ width: '37.5%', height: '100%', background: '#4ADE80', borderRadius: 8 }}></div>
          </div>
          <div style={{ textAlign: 'right', color: '#FCD34D', fontSize: 16, fontWeight: 700 }}>
            150/400 XP
          </div>
        </div>

        {/* Career Stats Grid */}
        <h3 style={{ fontSize: 32, fontWeight: 800, color: '#64748B', marginBottom: 24, fontFamily: 'Space Grotesk, sans-serif' }}>Career Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Daanik Coins', value: `${(profile?.daank_coins ?? 0).toLocaleString()}` },
            { label: 'Win Rate', value: `${winRate}%` },
            { label: 'Game won', value: (profile?.games_won ?? 0).toString() },
            { label: 'Best Win Streak', value: `${profile?.max_win_streak ?? 0}` },
            { label: 'Game Played', value: (profile?.games_played ?? 0).toString() },
            { label: 'Current Streak', value: `${profile?.win_streak ?? 0}` },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#FFFFFF', borderRadius: 16, padding: '24px',
              display: 'flex', alignItems: 'center', gap: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)'
            }}>
              {/* Coin Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: '#FFFBEB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                boxShadow: '0 4px 8px rgba(252, 211, 77, 0.2)'
              }}>
                🪙
              </div>
              <div>
                <div style={{ fontSize: 16, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1A202C' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 32, display: 'flex', justifyContent: 'center', paddingBottom: 40 }}>
          <button onClick={async () => { await logout(); navigate('/'); }} style={{
            background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8,
            padding: '16px 32px', fontSize: 18, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
          >
            Sign Out of Account
          </button>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="mobile-flex" style={{ width: '100%', flexDirection: 'column' }}>
        {/* Cover Image */}
        <div style={{ width: '100%', height: 160, backgroundImage: 'url("/avatars/dashboard design.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

        {/* Avatar & Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -50 }}>
          <div
            onClick={() => setIsEditingAvatar(!isEditingAvatar)}
            style={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer' }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              {(avatar.startsWith('/') || avatar.startsWith('http')) ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: '#f1f5f9' }}>{avatar}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUpdateName()}
                  style={{ fontSize: 20, fontWeight: 700, padding: '4px 8px', borderRadius: 8, border: '2px solid var(--green-primary)', outline: 'none', fontFamily: 'Space Grotesk, sans-serif', width: 140 }}
                />
                <button onClick={handleUpdateName} disabled={updating} style={{ background: 'var(--green-primary)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>
                  {updating ? t('common.saving') : 'Save'}
                </button>
              </div>
            ) : (
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {profile?.username ?? 'Name'}
                <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827', fontSize: 18, display: 'flex', alignItems: 'center', padding: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
              </h1>
            )}
          </div>
        </div>

        {/* Avatar Selector Modal for Mobile */}
        {isEditingAvatar && (
          <div style={{ margin: '16px 16px 0', padding: 16, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 12, fontWeight: 700 }}>Choose your avatar:</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => handleUpdateAvatar(a)}
                  disabled={updating}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.05)',
                    border: avatar === a ? '3px solid #3b82f6' : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s', padding: 0, overflow: 'hidden'
                  }}
                >
                  {(a.startsWith('/') || a.startsWith('http')) ? <img src={a} alt="Avatar option" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : a}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dark Blue Level Card */}
        <div style={{ background: '#0F1E3A', borderRadius: 16, padding: '20px 24px', margin: '24px 16px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
          <div style={{ color: '#FCD34D', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Rookie Investor</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>Level 3</div>
            <div style={{ color: '#FCD34D', fontSize: 13, fontWeight: 700 }}>150 XP</div>
          </div>
          <div style={{ width: '100%', height: 16, background: '#2D4A3E', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: '37.5%', height: '100%', background: '#4ADE80', borderRadius: 8 }}></div>
          </div>
          <div style={{ textAlign: 'right', color: '#FCD34D', fontSize: 12, fontWeight: 600, marginTop: 4 }}>150/400 XP</div>
        </div>

        {/* Career Stats Grid */}
        <div style={{ padding: '0 16px 40px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#64748B', marginBottom: 16 }}>Career Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Daanik Coins', value: `${(profile?.daank_coins ?? 0).toLocaleString()}` },
              { label: 'Win Rate', value: `${winRate}` },
              { label: 'Game won', value: (profile?.games_won ?? 0).toString() },
              { label: 'Game Played', value: (profile?.games_played ?? 0).toString() },
              { label: 'Best Win Streak', value: `${profile?.max_win_streak ?? 0}` },
              { label: 'Current Streak', value: `${profile?.win_streak ?? 0}` },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#FFFFFF', borderRadius: 12, padding: '16px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#FFFBEB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                }}>
                  🪙
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
