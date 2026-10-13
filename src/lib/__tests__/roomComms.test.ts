import { describe, it, expect } from 'vitest'
import {
  CHAT_FEED_LIMIT, CHAT_MAX_LEN, RateLimiter, appendFeed, parseChatWire, parsePokeWire, sanitizeChatText, type FeedItem,
} from '../roomChat'
import { VoiceMesh, parseVoiceSignal, type VoiceSignal, type VoiceSnapshot } from '../voiceChat'

describe('sanitizeChatText', () => {
  it('trims, collapses whitespace and caps length', () => {
    expect(sanitizeChatText('  hello   \n  world  ')).toBe('hello world')
    expect(Array.from(sanitizeChatText('a'.repeat(500))).length).toBe(CHAT_MAX_LEN)
    expect(sanitizeChatText('   ')).toBe('')
    expect(sanitizeChatText(42)).toBe('')
  })

  it('masks swear words as whole words only', () => {
    expect(sanitizeChatText('you are a chutiya bro')).toBe('you are a ******* bro')
    expect(sanitizeChatText('SHIT happens')).toBe('**** happens')
    expect(sanitizeChatText('हरामी है')).toBe('***** है')
    // Not inside other words
    expect(sanitizeChatText('scunthorpe classic')).toBe('scunthorpe classic')
    expect(sanitizeChatText('mcdonalds')).toBe('mcdonalds')
    expect(sanitizeChatText('सालाना ब्याज')).toBe('सालाना ब्याज')
    expect(sanitizeChatText('masala chai')).toBe('masala chai')
  })

  it('hides links and phone-number-like digit runs', () => {
    expect(sanitizeChatText('free money at https://evil.example/x')).toBe('free money at 🔗✖')
    expect(sanitizeChatText('visit scam.in now')).not.toContain('scam.in')
    expect(sanitizeChatText('call 98765 43210')).not.toMatch(/\d{5}/)
    expect(sanitizeChatText('otp 12345678')).not.toContain('12345678')
    // Short numbers (₹ amounts) are fine
    expect(sanitizeChatText('I lost ₹5000 lol')).toBe('I lost ₹5000 lol')
  })
})

describe('wire parsing', () => {
  it('accepts valid chat and cleans text', () => {
    expect(parseChatWire({ id: 'x1', from: 'p1', kind: 'text', text: ' hi  there ' }))
      .toEqual({ id: 'x1', from: 'p1', kind: 'text', text: 'hi there' })
    expect(parseChatWire({ id: 'x2', from: 'p1', kind: 'quick', quickId: 'gg' }))
      .toEqual({ id: 'x2', from: 'p1', kind: 'quick', quickId: 'gg' })
  })

  it('rejects malformed chat', () => {
    expect(parseChatWire(null)).toBeNull()
    expect(parseChatWire({ id: 'x', from: 'p1', kind: 'quick', quickId: 'nope' })).toBeNull()
    expect(parseChatWire({ id: 'x', from: 'p1', kind: 'text', text: '   ' })).toBeNull()
    expect(parseChatWire({ id: 'bad id!', from: 'p1', kind: 'text', text: 'hi' })).toBeNull()
    expect(parseChatWire({ id: 'x', from: '', kind: 'text', text: 'hi' })).toBeNull()
  })

  it('only allows listed poke emojis and never self-pokes', () => {
    expect(parsePokeWire({ id: 'a', from: 'p1', to: 'p2', emoji: '🍅' })).not.toBeNull()
    expect(parsePokeWire({ id: 'a', from: 'p1', to: 'p2', emoji: '<img>' })).toBeNull()
    expect(parsePokeWire({ id: 'a', from: 'p1', to: 'p1', emoji: '🍅' })).toBeNull()
  })

  it('validates voice signals', () => {
    expect(parseVoiceSignal({ kind: 'join', from: 'a' })).toMatchObject({ kind: 'join', from: 'a' })
    expect(parseVoiceSignal({ kind: 'offer', from: 'a', to: 'b', sdp: 'v=0' })).not.toBeNull()
    expect(parseVoiceSignal({ kind: 'offer', from: 'a', sdp: 'v=0' })).toBeNull() // offers must be addressed
    expect(parseVoiceSignal({ kind: 'hack', from: 'a' })).toBeNull()
    expect(parseVoiceSignal({ kind: 'answer', from: 'a', to: 'b', sdp: 'x'.repeat(30000) })).toBeNull()
  })
})

describe('RateLimiter', () => {
  it('allows max events per window, per key', () => {
    const rl = new RateLimiter(2, 1000)
    expect(rl.allow('a', 0)).toBe(true)
    expect(rl.allow('a', 10)).toBe(true)
    expect(rl.allow('a', 20)).toBe(false)
    expect(rl.allow('b', 20)).toBe(true)
    expect(rl.allow('a', 1005)).toBe(true)
  })
})

describe('appendFeed', () => {
  it('dedupes by id and keeps the newest items', () => {
    const item = (i: number): FeedItem => ({ id: `m${i}`, at: i, from: 'p', kind: 'text', text: String(i) })
    let feed: FeedItem[] = []
    feed = appendFeed(feed, item(1))
    expect(appendFeed(feed, item(1))).toBe(feed)
    for (let i = 2; i <= CHAT_FEED_LIMIT + 5; i++) feed = appendFeed(feed, item(i))
    expect(feed.length).toBe(CHAT_FEED_LIMIT)
    expect(feed[feed.length - 1].id).toBe(`m${CHAT_FEED_LIMIT + 5}`)
  })
})

// --- Voice mesh protocol with fake WebRTC -----------------------------------------

class FakePc {
  static all: FakePc[] = []
  signalingState: RTCSignalingState = 'stable'
  iceGatheringState: RTCIceGatheringState = 'complete'
  connectionState: RTCPeerConnectionState = 'new'
  localDescription: RTCSessionDescriptionInit | null = null
  remoteDescription: RTCSessionDescriptionInit | null = null
  closed = false
  tracks = 0
  ontrack: unknown = null
  onconnectionstatechange: (() => void) | null = null
  constructor() { FakePc.all.push(this) }
  addTrack() { this.tracks++ }
  addTransceiver() { /* recvonly */ }
  async createOffer() { return { type: 'offer' as const, sdp: 'offer-sdp' } }
  async createAnswer() { return { type: 'answer' as const, sdp: 'answer-sdp' } }
  async setLocalDescription(d: RTCSessionDescriptionInit) {
    this.localDescription = d
    this.signalingState = d.type === 'offer' ? 'have-local-offer' : 'stable'
  }
  async setRemoteDescription(d: RTCSessionDescriptionInit) {
    this.remoteDescription = d
    this.signalingState = d.type === 'offer' ? 'have-remote-offer' : 'stable'
  }
  addEventListener() { /* ice is already complete */ }
  removeEventListener() { /* noop */ }
  close() { this.closed = true }
}

function fakeMic() {
  const track = { enabled: true, stopped: false, stop() { this.stopped = true } }
  return { track, stream: { getAudioTracks: () => [track], getTracks: () => [track] } as unknown as MediaStream }
}

/** In-memory "channel": every signal reaches every other mesh asynchronously. */
function makeRoom(ids: string[]) {
  const meshes = new Map<string, VoiceMesh>()
  const snaps = new Map<string, VoiceSnapshot>()
  const sent: VoiceSignal[] = []
  const mics = new Map<string, ReturnType<typeof fakeMic>>()
  ids.forEach(id => {
    const mic = fakeMic()
    mics.set(id, mic)
    meshes.set(id, new VoiceMesh({
      selfId: id,
      iceServers: [],
      detectSpeaking: false,
      getMicrophone: async () => mic.stream,
      createPeerConnection: () => new FakePc() as unknown as RTCPeerConnection,
      onChange: s => snaps.set(id, s),
      transport: {
        send: sig => {
          sent.push(sig)
          meshes.forEach((m, otherId) => { if (otherId !== id) queueMicrotask(() => void m.handleSignal(sig)) })
        },
      },
    }))
  })
  return { meshes, snaps, sent, mics }
}

const settle = async () => { for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0)) }

describe('VoiceMesh', () => {
  it('connects members, smaller id offers, mute and leave propagate', async () => {
    FakePc.all = []
    const { meshes, snaps, sent, mics } = makeRoom(['a', 'b', 'c'])
    await meshes.get('b')!.join()
    await settle()
    // c is not in voice but still sees b in the roster
    expect(Object.keys(snaps.get('c')!.members)).toEqual(['b'])

    await meshes.get('a')!.join()
    await settle()
    const offers = sent.filter(s => s.kind === 'offer')
    expect(offers).toEqual([expect.objectContaining({ from: 'a', to: 'b' })])
    expect(sent.filter(s => s.kind === 'answer')).toEqual([expect.objectContaining({ from: 'b', to: 'a' })])
    expect(Object.keys(snaps.get('a')!.members).sort()).toEqual(['a', 'b'])
    expect(Object.keys(snaps.get('b')!.members).sort()).toEqual(['a', 'b'])

    meshes.get('b')!.setMuted(true)
    await settle()
    expect(mics.get('b')!.track.enabled).toBe(false)
    expect(snaps.get('a')!.members.b.muted).toBe(true)
    expect(snaps.get('c')!.members.b.muted).toBe(true)

    meshes.get('a')!.leave()
    await settle()
    expect(mics.get('a')!.track.stopped).toBe(true)
    expect(Object.keys(snaps.get('b')!.members)).toEqual(['b'])
    expect(FakePc.all.every(pc => pc.closed)).toBe(true)
  })

  it('a late arrival learns who is in voice via ping', async () => {
    const { meshes, snaps } = makeRoom(['x', 'y'])
    await meshes.get('y')!.join()
    await settle()
    snaps.delete('x')
    meshes.get('x')!.announce()
    await settle()
    expect(Object.keys(snaps.get('x')!.members)).toEqual(['y'])
  })

  it('ignores signals addressed to someone else and its own echoes', async () => {
    const { meshes, sent } = makeRoom(['a', 'b'])
    const a = meshes.get('a')!
    await a.join()
    const before = sent.length
    await a.handleSignal({ kind: 'offer', from: 'b', to: 'z', sdp: 'x' })
    await a.handleSignal({ kind: 'ping', from: 'a' })
    expect(sent.length).toBe(before)
  })

  it('reports a blocked microphone', async () => {
    const mesh = new VoiceMesh({
      selfId: 'a', iceServers: [], detectSpeaking: false, onChange: () => {},
      transport: { send: () => {} },
      getMicrophone: async () => { throw Object.assign(new Error('no'), { name: 'NotAllowedError' }) },
    })
    await expect(mesh.join()).rejects.toMatchObject({ code: 'mic_denied' })
    expect(mesh.snapshot().joined).toBe(false)
  })
})
