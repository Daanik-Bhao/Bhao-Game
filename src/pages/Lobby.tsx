import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  createRoom, joinRoom, leaveRoom, setReady, startGame,
  subscribeToRoom, getRoomPlayers, broadcastPlayersChanged,
  type Room, type RoomPlayer,
} from '../lib/multiplayerEngine'
import type { MultiplayerMode } from '../types/game'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'

type LobbyView = 'menu' | 'waiting'

type MenuTab = 'choice' | 'create' | 'join'

export function Lobby() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState<LobbyView>('menu')
  const [menuTab, setMenuTab] = useState<MenuTab>('choice')
  const [joinCode, setJoinCode] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(2)
  const [gameMode, setGameMode] = useState<MultiplayerMode>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [room, setRoom] = useState<Room | null>(null)
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  const isHost = room?.host_id === profile?.id
  const myPlayer = roomPlayers.find(p => p.player_id === profile?.id)
  // Host doesn't need to click Ready — their intent to start is enough.
  // All non-host players must be ready, and there must be at least 2 players total.
  const nonHostPlayers = roomPlayers.filter(p => p.player_id !== room?.host_id)
  const allReady = roomPlayers.length >= 2 && nonHostPlayers.length > 0 && nonHostPlayers.every(p => p.is_ready)
  const canStart = isHost && allReady

  useEffect(() => {
    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  // Watch for game start — redirect non-host players too
  useEffect(() => {
    if (room?.status === 'in_progress' && room.game_state) {
      navigate(`/multiplayer/${room.id}`)
    }
  }, [room?.status, room?.id, navigate])  

  const enterRoom = useCallback((newRoom: Room) => {
    setRoom(newRoom)
    setView('waiting')

    // Subscribe to realtime
    if (channelRef.current) channelRef.current.unsubscribe()
    channelRef.current = subscribeToRoom(
      newRoom.id,
      (updatedRoom) => setRoom(updatedRoom as Room),
      (players) => setRoomPlayers(players),
    )
  }, [])

  const handleCreate = async () => {
    if (!profile) {
      setError('Profile not found. If you just signed up, your username might have been taken. Try signing out and signing up again with a different username.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const newRoom = await createRoom(profile.id, profile.username, maxPlayers, gameMode)
      const players = await getRoomPlayers(newRoom.id)
      setRoomPlayers(players)
      enterRoom(newRoom)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!profile) {
      setError('Profile not found. If you just signed up, your username might have been taken. Try signing out and signing up again with a different username.')
      return
    }
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const joinedRoom = await joinRoom(joinCode.trim(), profile.id, profile.username)
      const players = await getRoomPlayers(joinedRoom.id)
      setRoomPlayers(players)
      enterRoom(joinedRoom)
      // After subscribing in enterRoom, broadcast so host sees the new player immediately
      setTimeout(() => broadcastPlayersChanged(joinedRoom.id), 500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleReady = async () => {
    if (!room || !profile) return
    try {
      await setReady(room.id, profile.id, !myPlayer?.is_ready)
      // Broadcast change so everyone updates immediately
      await broadcastPlayersChanged(room.id)
      // Also update local state immediately for responsiveness
      const players = await getRoomPlayers(room.id)
      setRoomPlayers(players)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update ready status')
    }
  }

  const handleStartGame = async () => {
    if (!room || !profile || !canStart) return
    setLoading(true)
    setError('')
    try {
      await startGame(room.id, roomPlayers)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start game')
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!room || !profile) return
    await leaveRoom(room.id, profile.id)
    await broadcastPlayersChanged(room.id)
    channelRef.current?.unsubscribe()
    setRoom(null)
    setRoomPlayers([])
    setView('menu')
  }

  if (view === 'waiting' && room) {
    return (
      <WaitingRoom
        room={room}
        roomPlayers={roomPlayers}
        nonHostPlayers={nonHostPlayers}
        isHost={isHost}
        myPlayer={myPlayer}
        canStart={canStart}
        allReady={allReady}
        loading={loading}
        error={error}
        onToggleReady={handleToggleReady}
        onStart={handleStartGame}
        onLeave={handleLeave}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
      <div style={{ width: '100%', maxWidth: menuTab === 'create' ? 760 : 500, animation: 'slideUp 0.4s ease' }}>
        <button
          onClick={() => {
            if (menuTab !== 'choice') setMenuTab('choice')
            else navigate('/dashboard')
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← {menuTab === 'choice' ? 'Back to Dashboard' : 'Back'}
        </button>

        {menuTab !== 'create' && (
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 50 }}>🌐</div>
            </div>
            <h1 style={{ fontSize: 35, fontWeight: 800, color: '#1A202C', fontFamily: 'var(--font-display)', margin: 0 }}>
              {menuTab === 'choice' ? t('dashboard.playOnline') : t('lobby.joinRoom')}
            </h1>
            {menuTab === 'choice' && (
              <p style={{ color: 'var(--text-muted)', fontSize: 18, marginTop: 8 }}>
                {t('dashboard.playOnlineDesc')}
              </p>
            )}
          </div>
        )}

        {menuTab === 'create' && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1A284D', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.03em' }}>
              Create Room
            </h1>
          </div>
        )}
        
        {menuTab === 'join' && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1A284D', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.03em' }}>
              Join Room
            </h1>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(224,80,32,0.1)', border: '1px solid var(--orange-primary)', borderRadius: 10, padding: '12px 16px', fontSize: 16, color: 'var(--orange-soft)', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {menuTab === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Create Room Button */}
            <div 
              onClick={() => setMenuTab('create')}
              style={{
                background: 'linear-gradient(90deg, #4ADE80 0%, #10B981 100%)',
                borderRadius: 16,
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Plus Icon */}
              <div style={{ fontSize: 40, color: '#0F172A', fontWeight: 300, marginRight: 24, lineHeight: 0.8 }}>+</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#0F172A', letterSpacing: '-1px', marginBottom: 4 }}>Create Room</div>
                <div style={{ fontSize: 18, color: '#0F172A', opacity: 0.8, fontWeight: 500 }}>Host a new private match</div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 24, color: '#0F172A' }}>›</div>
            </div>

            {/* Join Room Button */}
            <div 
              onClick={() => setMenuTab('join')}
              style={{
                background: 'linear-gradient(90deg, #1E3A5F 0%, #0F1C36 100%)',
                borderRadius: 16,
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Gamepad Icon */}
              <div style={{ marginRight: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                  <line x1="6" y1="12" x2="10" y2="12"></line>
                  <line x1="8" y1="10" x2="8" y2="14"></line>
                  <line x1="15" y1="13" x2="15.01" y2="13"></line>
                  <line x1="18" y1="11" x2="18.01" y2="11"></line>
                </svg>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#4ADE80', letterSpacing: '-1px', marginBottom: 4 }}>Join Room</div>
                <div style={{ fontSize: 18, color: '#FFFFFF', opacity: 0.9, fontWeight: 400 }}>Enter an Existing room</div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 24, color: '#4ADE80' }}>›</div>
            </div>
          </div>
        )}

        {menuTab === 'create' && (
          <div style={{ background: '#C2E3D2', borderRadius: 24, padding: '32px', marginBottom: 16, animation: 'slideUp 0.3s ease' }}>
            
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', fontFamily: 'var(--font-display)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Choose Your Room
              </h2>
              <div style={{ fontSize: 18, color: '#4B5563', fontWeight: 500 }}>
                Choose number of opponents
              </div>
            </div>
            
            {/* Max Players / Opponents */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { num: 1, label: 'one', maxP: 2 },
                  { num: 2, label: 'two', maxP: 3 },
                  { num: 3, label: 'three', maxP: 4 }
                ].map(opt => {
                  const isSelected = maxPlayers === opt.maxP;
                  return (
                    <div
                      key={opt.num}
                      onClick={() => setMaxPlayers(opt.maxP)}
                      style={{
                        width: 120, height: 100, borderRadius: 12,
                        background: '#1A284D',
                        opacity: isSelected ? 1 : 0.6,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38D6A3' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span style={{ fontSize: 42, fontWeight: 400, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{opt.num}</span>
                      </div>
                      <div style={{ fontSize: 16, color: '#38D6A3', marginTop: 4 }}>{opt.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: 16, color: '#4B5563', marginBottom: 20, fontWeight: 500, paddingLeft: 8 }}>
              Playing against {maxPlayers - 1} AI opponents
            </div>
            
            {/* Game Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                { id: 'blitz', title: 'BLITZ', desc: '15 minutes', reward: '15 Lakh' },
                { id: 'standard', title: 'STANDARD', desc: '15 minutes', reward: '15 Lakh' },
                { id: 'epic', title: 'EPIC', desc: '15 minutes', reward: '15 Lakh' }
              ].map(m => {
                const isSelected = gameMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setGameMode(m.id as MultiplayerMode)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 24px', borderRadius: 16, cursor: 'pointer',
                      background: '#D9EFE3',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 24, color: '#0F172A', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>{m.title}</div>
                      <div style={{ fontSize: 15, color: '#6B7280', marginTop: 2 }}>{m.desc}</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ 
                        background: '#34D399', color: '#064E3B', 
                        padding: '6px 14px', borderRadius: 20, 
                        fontWeight: 800, fontSize: 15, 
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 2px 4px rgba(52, 211, 153, 0.3)'
                      }}>
                        <span style={{ fontSize: 14 }}>🪙</span> {m.reward}
                      </div>
                      
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', border: `2px solid #111827`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent'
                      }}>
                        {isSelected && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#111827' }} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={handleCreate} 
              disabled={loading}
              style={{ 
                width: '100%', height: 64, padding: '0 24px', borderRadius: 16, border: 'none',
                background: '#1A284D',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: '#4ADE80', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(26, 40, 77, 0.3)', opacity: loading ? 0.8 : 1,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                <line x1="6" y1="12" x2="10" y2="12"></line>
                <line x1="8" y1="10" x2="8" y2="14"></line>
                <line x1="15" y1="13" x2="15.01" y2="13"></line>
                <line x1="18" y1="11" x2="18.01" y2="11"></line>
              </svg>
              
              <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {loading ? 'Creating...' : 'Create Room'}
              </span>
              
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A284D" stroke="#1A284D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </button>
          </div>
        )}

        {menuTab === 'join' && (
          <div style={{ background: '#BCE2CF', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, padding: '32px 40px', marginBottom: 16, animation: 'slideUp 0.3s ease', maxWidth: 540, margin: '0 auto', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111827', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>
                Join an existing room
              </h2>
              <button onClick={() => setMenuTab('choice')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
                Cancel
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                maxLength={6}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                style={{
                  width: '100%', height: 60, padding: '0 20px', 
                  background: '#75CFA3',
                  border: 'none', borderRadius: 8,
                  color: '#064E3B', fontSize: 20, fontWeight: 800,
                  letterSpacing: '0.1em', fontFamily: 'var(--font-display)',
                  outline: 'none', textTransform: 'uppercase',
                  textAlign: 'center'
                }}
              />
              
              <button 
                onClick={handleJoin} 
                disabled={loading || joinCode.length !== 6}
                style={{ 
                  background: '#142145', color: '#4ADE80', border: 'none', borderRadius: 16, 
                  padding: '16px', cursor: (loading || joinCode.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(20, 33, 69, 0.4)', opacity: (loading || joinCode.length !== 6) ? 0.7 : 1
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                  <line x1="6" y1="12" x2="6.01" y2="12"></line>
                  <line x1="10" y1="12" x2="10.01" y2="12"></line>
                  <line x1="15" y1="13" x2="15.01" y2="13"></line>
                  <line x1="18" y1="11" x2="18.01" y2="11"></line>
                </svg>
                
                <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {loading ? 'Joining...' : 'Join Room'}
                </span>
                
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#142145" stroke="#142145" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Start of WaitingRoom function signature
function WaitingRoom({
  room, roomPlayers, isHost, myPlayer, canStart, loading, error,
  onToggleReady, onStart, onLeave,
}: {
  room: Room
  roomPlayers: RoomPlayer[]
  nonHostPlayers: RoomPlayer[] // Keep in interface to match parent passing it, but not used here
  isHost: boolean
  myPlayer: RoomPlayer | undefined
  canStart: boolean
  allReady: boolean // Keep in interface to match parent passing it
  loading: boolean
  error: string
  onToggleReady: () => void
  onStart: () => void
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <button
        onClick={onLeave}
        style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: 'none', color: '#ADB3BD', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← Back to Dashboard
      </button>
      
      <div style={{ width: '100%', maxWidth: 750, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'slideUp 0.4s ease' }}>

        {/* Title */}
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#6A7380', marginBottom: 24 }}>
          Compete with friends in real-time multiplayer
        </div>

        {/* Code Box */}
        <div 
          onClick={copyCode}
          style={{
            width: '100%', maxWidth: 545, height: 103, 
            background: 'rgba(0, 185, 192, 0.1)',
            border: '2px solid rgba(105, 184, 159, 0.3)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
            marginBottom: 40, cursor: 'pointer', position: 'relative',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 400, fontSize: 64, letterSpacing: '0.15em',
            background: 'linear-gradient(180deg, #001733 0%, #163E6F 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            userSelect: 'none'
          }}>
            {room.code}
          </div>
          {/* copy icon */}
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#555353" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          {copied && <div style={{ position: 'absolute', top: -30, color: '#09BC83', fontWeight: 'bold', fontSize: 16 }}>Copied!</div>}
        </div>

        {error && (
          <div style={{ background: 'rgba(224,80,32,0.1)', border: '1px solid var(--orange-primary)', borderRadius: 10, padding: '12px 16px', fontSize: 16, color: 'var(--orange-soft)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Players Box (Rectangle 275) */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(180deg, #001733 0%, #163E6F 100%)',
          borderRadius: 12,
          display: 'flex',
          padding: '40px 0',
          marginBottom: 30,
          position: 'relative'
        }}>
          {/* Render exactly room.max_players slots */}
          {Array.from({ length: room.max_players || 4 }).map((_, i) => {
            const p = roomPlayers[i]
            const pAny = p as any;
            const isHostPlayer = p && p.player_id === room.host_id
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {/* Divider Line (except first) */}
                {i > 0 && (
                  <div style={{ position: 'absolute', left: 0, top: '5%', bottom: '5%', width: 2, background: '#3D6596' }} />
                )}
                
                {/* Avatar */}
                <div style={{
                  width: 118, height: 118, borderRadius: '50%',
                  background: p 
                    ? (pAny.avatar_url?.startsWith('/') || pAny.avatar_url?.startsWith('http') ? `url('${pAny.avatar_url}') center/cover` : '#fff') 
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                  position: 'relative',
                  border: p && !(pAny.avatar_url?.startsWith('/') || pAny.avatar_url?.startsWith('http')) ? '2px solid #ccc' : 'none'
                }}>
                  {!p && <span style={{ color: '#ADB3BD', fontSize: 40, fontWeight: 300 }}>+</span>}
                  {p && !(pAny.avatar_url?.startsWith('/') || pAny.avatar_url?.startsWith('http')) && (
                     <span style={{ fontSize: 40, color: '#000' }}>{p.username[0]?.toUpperCase()}</span>
                  )}

                  {isHostPlayer && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(183.6deg, #FF4332 2.96%, #F4CC00 123.94%)',
                      padding: '4px 16px', borderRadius: 12,
                      fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 16, color: '#E9F2ED',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      host
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <div style={{
                  fontFamily: 'Sora, sans-serif', fontSize: 20, color: '#E9F2ED',
                  height: 25, marginBottom: 14,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%'
                }}>
                  {p ? p.username : 'Waiting...'}
                </div>
                
                {/* Status Pill */}
                {p && (
                  <div style={{
                    background: p.is_ready ? 'linear-gradient(180deg, #66D575 0%, #09BC83 100%)' : '#4B5563',
                    borderRadius: 8, padding: '6px 16px',
                    fontFamily: 'Clash Display Variable, sans-serif', fontWeight: 600, fontSize: 18,
                    color: '#DAF4E3',
                    textAlign: 'center', minWidth: 100
                  }}>
                    {p.is_ready ? 'READY' : 'NOT READY'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer Text */}
        {roomPlayers.length < 2 && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#6A7380', marginBottom: 24 }}>
            need at least 2 player to start
          </div>
        )}

        {/* Bottom Buttons */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', width: '100%' }}>
          {isHost ? (
            <button
              onClick={onStart}
              disabled={!canStart || loading}
              style={{
                background: canStart ? 'linear-gradient(180deg, #66D575 0%, #09BC83 100%)' : '#4B5563',
                borderRadius: 8, padding: '16px 32px', minWidth: 288,
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 24, color: canStart ? '#001733' : '#ADB3BD',
                border: 'none', cursor: canStart ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Starting...' : canStart ? 'Start Game' : `Waiting for player...`}
            </button>
          ) : (
            <button
              onClick={onToggleReady}
              style={{
                background: myPlayer?.is_ready ? '#4B5563' : 'linear-gradient(180deg, #66D575 0%, #09BC83 100%)',
                borderRadius: 8, padding: '16px 32px', minWidth: 288,
                fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 24, color: myPlayer?.is_ready ? '#ADB3BD' : '#001733',
                border: 'none', cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              {myPlayer?.is_ready ? 'Cancel Ready' : 'Ready Up'}
            </button>
          )}

          <button
            onClick={onLeave}
            style={{
              background: 'linear-gradient(180deg, #66D575 0%, #09BC83 100%)',
              borderRadius: 8, padding: '16px 32px', minWidth: 150,
              fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 24,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span style={{
              background: 'linear-gradient(180deg, #001733 0%, #163E6F 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'block'
            }}>
              Leave
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
