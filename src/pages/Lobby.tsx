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
import { LobbyMenuView, WaitingRoomView, type LobbyTab } from './lobby/LobbyViews'

type LobbyView = 'menu' | 'waiting'



export function Lobby() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState<LobbyView>('menu')
  const [menuTab, setMenuTab] = useState<LobbyTab>('create')
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
      setError(t('lobby.noProfile'))
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
      setError(e instanceof Error ? e.message : t('lobby.errCreate'))
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!profile) {
      setError(t('lobby.noProfile'))
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
      setError(e instanceof Error ? e.message : t('lobby.errJoin'))
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
      setError(e instanceof Error ? e.message : t('lobby.errReady'))
    }
  }

  const handleStartGame = async () => {
    if (!room || !profile || !canStart) return
    setLoading(true)
    setError('')
    try {
      // The server deals the cards and flips the room to in_progress (realtime moves the guests).
      await startGame(room.id)
      navigate(`/multiplayer/${room.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('lobby.errStart'))
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
    const mode = (room.game_state && 'multiplayerMode' in room.game_state ? room.game_state.multiplayerMode : undefined) as MultiplayerMode | undefined
    return (
      <WaitingRoomView
        code={room.code}
        maxPlayers={room.max_players}
        mode={mode}
        players={[...roomPlayers].sort((a, b) => a.seat_order - b.seat_order).map((p, i) => ({
          id: p.player_id,
          name: p.username,
          ready: p.is_ready,
          host: p.player_id === room.host_id,
          me: p.player_id === profile?.id,
          seat: i,
        }))}
        isHost={isHost}
        myReady={!!myPlayer?.is_ready}
        canStart={canStart}
        loading={loading}
        error={error}
        onToggleReady={handleToggleReady}
        onStart={handleStartGame}
        onLeave={handleLeave}
      />
    )
  }

  return (
    <LobbyMenuView
      tab={menuTab}
      onTab={tab => { setMenuTab(tab); setError('') }}
      maxPlayers={maxPlayers}
      onMaxPlayers={setMaxPlayers}
      mode={gameMode}
      onMode={setGameMode}
      joinCode={joinCode}
      onJoinCode={setJoinCode}
      loading={loading}
      error={error}
      onCreate={handleCreate}
      onJoin={handleJoin}
      onBack={() => navigate('/dashboard')}
    />
  )
}
