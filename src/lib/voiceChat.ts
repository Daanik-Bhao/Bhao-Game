/**
 * Peer-to-peer voice chat for a multiplayer room (WebRTC full mesh, audio only).
 *
 * Rooms have at most 6 players, so every voice participant connects directly to every
 * other one (≤ 5 audio peers each). Signalling goes over the room's realtime channel
 * through a small `VoiceTransport`, so this class has no Supabase dependency and can be
 * tested with a fake transport.
 *
 * Protocol (all messages carry `from`; `to` = only for that player):
 *   ping   — "I just arrived, who is in voice?"   → members reply `hello`
 *   join   — "I joined voice"                     → members reply `hello`
 *   hello  — "I am in voice"
 *   leave  — "I left voice"
 *   state  — mute flag changed
 *   offer / answer — full SDP (ICE gathered up-front, no trickle)
 * Of any two members, the one with the smaller id makes the offer, so there is no glare.
 */

export type VoiceSignalKind = 'ping' | 'join' | 'hello' | 'leave' | 'state' | 'offer' | 'answer'

export interface VoiceSignal {
  kind: VoiceSignalKind
  from: string
  to?: string
  sdp?: string
  muted?: boolean
}

export interface VoiceTransport {
  send(signal: VoiceSignal): void
}

export interface VoiceMember {
  id: string
  muted: boolean
  /** Audio is flowing (peer connection is up). Always true for yourself once joined. */
  connected: boolean
}

export interface VoiceSnapshot {
  joined: boolean
  joining: boolean
  muted: boolean
  /** Everyone known to be in voice, including you. */
  members: Record<string, VoiceMember>
  /** Ids currently talking (you included). */
  speaking: string[]
}

export type VoiceErrorCode = 'unsupported' | 'insecure' | 'mic_denied' | 'mic_missing'

export class VoiceError extends Error {
  constructor(public code: VoiceErrorCode) {
    super(code)
  }
}

export interface VoiceMeshOptions {
  selfId: string
  transport: VoiceTransport
  onChange: (snapshot: VoiceSnapshot) => void
  iceServers?: RTCIceServer[]
  /** Overridable for tests. */
  getMicrophone?: () => Promise<MediaStream>
  createPeerConnection?: (config: RTCConfiguration) => RTCPeerConnection
  /** Set false to skip AudioContext-based talk detection (tests). */
  detectSpeaking?: boolean
}

const ICE_GATHER_TIMEOUT_MS = 2500
const RECONNECT_DELAY_MS = 2000
const SPEAK_POLL_MS = 150
const SPEAK_THRESHOLD = 0.035
/** Keep the talking light on this long after the last loud sample (no flicker between words). */
const SPEAK_HOLD_MS = 400

/** STUN only by default; add a TURN server through env for players behind strict NATs. */
export function defaultIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}
  if (env.VITE_TURN_URL) {
    servers.push({
      urls: env.VITE_TURN_URL.split(',').map(s => s.trim()).filter(Boolean),
      username: env.VITE_TURN_USERNAME,
      credential: env.VITE_TURN_CREDENTIAL,
    })
  }
  return servers
}

/** Why voice can't start on this device/page, or null if it can. */
export function voiceUnsupportedReason(): VoiceErrorCode | null {
  if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') return 'unsupported'
  if (!window.isSecureContext) return 'insecure'
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'
  return null
}

interface Peer {
  pc: RTCPeerConnection
  audio?: HTMLAudioElement
  stream?: MediaStream
  connected: boolean
}

export class VoiceMesh {
  private selfId: string
  private transport: VoiceTransport
  private onChange: (s: VoiceSnapshot) => void
  private iceServers: RTCIceServer[]
  private getMic: () => Promise<MediaStream>
  private createPc: (config: RTCConfiguration) => RTCPeerConnection
  private detectSpeaking: boolean

  private joined = false
  private joining = false
  private muted = false
  private destroyed = false
  private local: MediaStream | null = null
  private peers = new Map<string, Peer>()
  /** Remote members in voice → their mute flag */
  private roster = new Map<string, boolean>()
  private silenced = new Set<string>()
  private speaking = new Set<string>()
  private audioCtx: AudioContext | null = null
  private analysers = new Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode; buf: Uint8Array<ArrayBuffer> }>()
  private speakTimer: ReturnType<typeof setInterval> | null = null
  private lastLoud = new Map<string, number>()

  constructor(opts: VoiceMeshOptions) {
    this.selfId = opts.selfId
    this.transport = opts.transport
    this.onChange = opts.onChange
    this.iceServers = opts.iceServers ?? defaultIceServers()
    this.getMic = opts.getMicrophone ?? (() => navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false,
    }))
    this.createPc = opts.createPeerConnection ?? (config => new RTCPeerConnection(config))
    this.detectSpeaking = opts.detectSpeaking ?? true
  }

  snapshot(): VoiceSnapshot {
    const members: Record<string, VoiceMember> = {}
    this.roster.forEach((muted, id) => {
      members[id] = { id, muted, connected: !!this.peers.get(id)?.connected }
    })
    if (this.joined) members[this.selfId] = { id: this.selfId, muted: this.muted, connected: true }
    return { joined: this.joined, joining: this.joining, muted: this.muted, members, speaking: [...this.speaking] }
  }

  /** Ask who is already in voice (call once the channel is live). */
  announce() {
    this.transport.send({ kind: 'ping', from: this.selfId })
  }

  async join(): Promise<void> {
    if (this.joined || this.joining || this.destroyed) return
    this.joining = true
    // Create/resume the AudioContext now, while we are still inside the user's tap.
    this.ensureAudioContext()
    this.emit()
    try {
      let stream: MediaStream
      try {
        stream = await this.getMic()
      } catch (e) {
        const name = (e as { name?: string })?.name
        throw new VoiceError(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'mic_missing' : 'mic_denied')
      }
      if (this.destroyed) {
        stream.getTracks().forEach(t => t.stop())
        return
      }
      this.local = stream
      this.muted = false
      this.joined = true
      this.watchSpeaking(this.selfId, stream)
      this.transport.send({ kind: 'join', from: this.selfId, muted: false })
      // Connect to everyone we already know is in voice.
      this.roster.forEach((_m, id) => this.maybeConnect(id))
    } finally {
      this.joining = false
      this.emit()
    }
  }

  leave() {
    if (!this.joined) return
    this.transport.send({ kind: 'leave', from: this.selfId })
    this.teardownLocal()
    this.emit()
  }

  setMuted(muted: boolean) {
    if (!this.joined) return
    this.muted = muted
    this.local?.getAudioTracks().forEach(t => { t.enabled = !muted })
    if (muted) this.speaking.delete(this.selfId)
    this.transport.send({ kind: 'state', from: this.selfId, muted })
    this.emit()
  }

  /** Locally silence (or un-silence) one player's voice. */
  setPeerSilenced(id: string, silenced: boolean) {
    if (silenced) this.silenced.add(id)
    else this.silenced.delete(id)
    const audio = this.peers.get(id)?.audio
    if (audio) audio.muted = silenced
  }

  /** A player left the room: forget them. */
  removeMember(id: string) {
    if (!this.roster.has(id) && !this.peers.has(id)) return
    this.roster.delete(id)
    this.closePeer(id)
    this.emit()
  }

  destroy() {
    if (this.destroyed) return
    if (this.joined) this.transport.send({ kind: 'leave', from: this.selfId })
    this.teardownLocal()
    this.destroyed = true
    this.audioCtx?.close().catch(() => { /* ignore */ })
    this.audioCtx = null
  }

  async handleSignal(sig: VoiceSignal): Promise<void> {
    if (this.destroyed || !sig || sig.from === this.selfId) return
    if (sig.to && sig.to !== this.selfId) return
    switch (sig.kind) {
      case 'ping':
        if (this.joined) this.transport.send({ kind: 'hello', from: this.selfId, to: sig.from, muted: this.muted })
        return
      case 'join':
        this.roster.set(sig.from, !!sig.muted)
        // A rejoin replaces any stale connection.
        this.closePeer(sig.from)
        if (this.joined) {
          this.transport.send({ kind: 'hello', from: this.selfId, to: sig.from, muted: this.muted })
          this.maybeConnect(sig.from)
        }
        this.emit()
        return
      case 'hello':
        this.roster.set(sig.from, !!sig.muted)
        if (this.joined) this.maybeConnect(sig.from)
        this.emit()
        return
      case 'leave':
        this.removeMember(sig.from)
        return
      case 'state':
        if (this.roster.has(sig.from)) {
          this.roster.set(sig.from, !!sig.muted)
          if (sig.muted) this.speaking.delete(sig.from)
          this.emit()
        }
        return
      case 'offer':
        if (this.joined && sig.to === this.selfId && typeof sig.sdp === 'string') await this.acceptOffer(sig.from, sig.sdp)
        return
      case 'answer': {
        const peer = this.peers.get(sig.from)
        if (peer && sig.to === this.selfId && typeof sig.sdp === 'string' && peer.pc.signalingState === 'have-local-offer') {
          try {
            await peer.pc.setRemoteDescription({ type: 'answer', sdp: sig.sdp })
          } catch {
            this.closePeer(sig.from)
          }
        }
        return
      }
    }
  }

  // ---------------------------------------------------------------------------

  private emit() {
    if (!this.destroyed) this.onChange(this.snapshot())
  }

  private teardownLocal() {
    this.joined = false
    this.joining = false
    this.muted = false
    ;[...this.peers.keys()].forEach(id => this.closePeer(id))
    this.unwatchSpeaking(this.selfId)
    this.local?.getTracks().forEach(t => t.stop())
    this.local = null
    this.speaking.clear()
  }

  /** The smaller id offers; the other side waits for the offer. */
  private maybeConnect(peerId: string) {
    if (!this.joined || this.peers.has(peerId) || !(this.selfId < peerId)) return
    const peer = this.newPeer(peerId)
    void (async () => {
      try {
        const offer = await peer.pc.createOffer()
        await peer.pc.setLocalDescription(offer)
        await waitForIce(peer.pc)
        if (this.peers.get(peerId) !== peer) return
        this.transport.send({ kind: 'offer', from: this.selfId, to: peerId, sdp: peer.pc.localDescription?.sdp ?? offer.sdp })
      } catch {
        this.closePeer(peerId)
      }
    })()
  }

  private async acceptOffer(peerId: string, sdp: string) {
    this.roster.set(peerId, this.roster.get(peerId) ?? false)
    this.closePeer(peerId)
    const peer = this.newPeer(peerId)
    try {
      await peer.pc.setRemoteDescription({ type: 'offer', sdp })
      const answer = await peer.pc.createAnswer()
      await peer.pc.setLocalDescription(answer)
      await waitForIce(peer.pc)
      if (this.peers.get(peerId) !== peer) return
      this.transport.send({ kind: 'answer', from: this.selfId, to: peerId, sdp: peer.pc.localDescription?.sdp ?? answer.sdp })
    } catch {
      this.closePeer(peerId)
    }
    this.emit()
  }

  private newPeer(peerId: string): Peer {
    const pc = this.createPc({ iceServers: this.iceServers })
    const peer: Peer = { pc, connected: false }
    this.peers.set(peerId, peer)
    if (this.local) this.local.getAudioTracks().forEach(track => pc.addTrack(track, this.local as MediaStream))
    else pc.addTransceiver('audio', { direction: 'recvonly' })

    pc.ontrack = (ev) => {
      const stream = ev.streams[0] ?? new MediaStream([ev.track])
      peer.stream = stream
      if (typeof document !== 'undefined' && !peer.audio) {
        const audio = document.createElement('audio')
        audio.autoplay = true
        audio.setAttribute('playsinline', '')
        audio.dataset.voicePeer = peerId
        audio.style.display = 'none'
        document.body.appendChild(audio)
        peer.audio = audio
      }
      if (peer.audio) {
        peer.audio.srcObject = stream
        peer.audio.muted = this.silenced.has(peerId)
        peer.audio.play().catch(() => { /* autoplay blocked until the next tap; the element keeps trying */ })
      }
      this.watchSpeaking(peerId, stream)
    }
    pc.onconnectionstatechange = () => {
      if (this.peers.get(peerId) !== peer) return
      const state = pc.connectionState
      if (state === 'connected') {
        peer.connected = true
        this.emit()
      } else if (state === 'failed' || state === 'closed') {
        this.closePeer(peerId)
        this.emit()
        // The offerer retries once in a while as long as both are still in voice.
        if (state === 'failed' && this.joined && this.roster.has(peerId) && this.selfId < peerId) {
          setTimeout(() => this.maybeConnect(peerId), RECONNECT_DELAY_MS)
        }
      } else if (state === 'disconnected') {
        peer.connected = false
        this.emit()
      }
    }
    return peer
  }

  private closePeer(peerId: string) {
    const peer = this.peers.get(peerId)
    if (!peer) return
    this.peers.delete(peerId)
    peer.pc.ontrack = null
    peer.pc.onconnectionstatechange = null
    try { peer.pc.close() } catch { /* already closed */ }
    if (peer.audio) {
      peer.audio.srcObject = null
      peer.audio.remove()
    }
    this.unwatchSpeaking(peerId)
    this.speaking.delete(peerId)
  }

  // --- talk detection --------------------------------------------------------

  private watchSpeaking(id: string, stream: MediaStream) {
    if (!this.detectSpeaking) return
    try {
      if (!this.ensureAudioContext() || !this.audioCtx) return
      this.unwatchSpeaking(id)
      const source = this.audioCtx.createMediaStreamSource(stream)
      const analyser = this.audioCtx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      this.analysers.set(id, { analyser, source, buf: new Uint8Array(analyser.fftSize) })
      if (!this.speakTimer) this.speakTimer = setInterval(() => this.pollSpeaking(), SPEAK_POLL_MS)
    } catch {
      /* talk detection is a nice-to-have */
    }
  }

  private ensureAudioContext(): boolean {
    if (!this.detectSpeaking || typeof window === 'undefined') return false
    try {
      if (!this.audioCtx) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!Ctor) return false
        this.audioCtx = new Ctor()
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => { /* needs a tap */ })
      return true
    } catch {
      return false
    }
  }

  private unwatchSpeaking(id: string) {
    const a = this.analysers.get(id)
    if (a) {
      try { a.source.disconnect() } catch { /* ignore */ }
      this.analysers.delete(id)
    }
    this.lastLoud.delete(id)
    if (this.analysers.size === 0 && this.speakTimer) {
      clearInterval(this.speakTimer)
      this.speakTimer = null
    }
  }

  private pollSpeaking() {
    let changed = false
    const now = Date.now()
    this.analysers.forEach(({ analyser, buf }, id) => {
      analyser.getByteTimeDomainData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128
        sum += v * v
      }
      const muted = id === this.selfId ? this.muted : !!this.roster.get(id)
      if (!muted && Math.sqrt(sum / buf.length) > SPEAK_THRESHOLD) this.lastLoud.set(id, now)
      const talking = !muted && now - (this.lastLoud.get(id) ?? 0) < SPEAK_HOLD_MS
      if (talking !== this.speaking.has(id)) {
        if (talking) this.speaking.add(id)
        else this.speaking.delete(id)
        changed = true
      }
    })
    if (changed) this.emit()
  }
}

function waitForIce(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise(resolve => {
    const done = () => {
      clearTimeout(timer)
      pc.removeEventListener('icegatheringstatechange', check)
      resolve()
    }
    const check = () => { if (pc.iceGatheringState === 'complete') done() }
    const timer = setTimeout(done, ICE_GATHER_TIMEOUT_MS)
    pc.addEventListener('icegatheringstatechange', check)
  })
}

/** Validate an incoming voice payload from the channel. */
export function parseVoiceSignal(payload: unknown): VoiceSignal | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  const kinds: VoiceSignalKind[] = ['ping', 'join', 'hello', 'leave', 'state', 'offer', 'answer']
  if (!kinds.includes(p.kind as VoiceSignalKind) || typeof p.from !== 'string' || !p.from) return null
  if (p.to !== undefined && typeof p.to !== 'string') return null
  if (p.sdp !== undefined && (typeof p.sdp !== 'string' || p.sdp.length > 20000)) return null
  if ((p.kind === 'offer' || p.kind === 'answer') && (typeof p.sdp !== 'string' || typeof p.to !== 'string')) return null
  return {
    kind: p.kind as VoiceSignalKind,
    from: p.from,
    to: p.to as string | undefined,
    sdp: p.sdp as string | undefined,
    muted: typeof p.muted === 'boolean' ? p.muted : undefined,
  }
}
