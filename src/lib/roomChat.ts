/**
 * In-game social layer for multiplayer rooms: text chat, quick chat and pokes.
 *
 * Everything here is cosmetic and ephemeral: it travels as realtime broadcast on the
 * room's game channel and is never stored or part of the game state. Because any client
 * can send anything on a broadcast channel, every message is cleaned and rate limited
 * again on the receiving side.
 */

export const CHAT_MAX_LEN = 200
/** Feed keeps only the most recent items. */
export const CHAT_FEED_LIMIT = 80

/** Pre-written messages (sent as an id, shown in the reader's own language). */
export const QUICK_CHAT_IDS = ['gg', 'niceMove', 'hurry', 'scam', 'invest', 'oops', 'thanks', 'bye'] as const
export type QuickChatId = typeof QUICK_CHAT_IDS[number]

/** Emojis you can throw at one specific player. */
export const POKE_EMOJIS = ['👉', '🍅', '⏰', '😂', '💸', '🔥', '🫡', '😴'] as const

export type ChatWire =
  | { id: string; from: string; kind: 'text'; text: string }
  | { id: string; from: string; kind: 'quick'; quickId: QuickChatId }

export interface PokeWire { id: string; from: string; to: string; emoji: string }

export type FeedItem =
  | { id: string; at: number; from: string; kind: 'text'; text: string }
  | { id: string; at: number; from: string; kind: 'quick'; quickId: QuickChatId }
  | { id: string; at: number; from: string; kind: 'poke'; to: string; emoji: string }

export function makeCommsId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// Kept short on purpose: the game is for young players, so the common English and
// Hindi/Hinglish swear words are masked. Matching is on whole words, case-insensitive.
const BLOCKED_WORDS = [
  'fuck', 'fucker', 'fucking', 'motherfucker', 'shit', 'bitch', 'bastard', 'asshole', 'dick', 'cunt', 'slut', 'whore',
  'chutiya', 'chutiye', 'chutia', 'madarchod', 'mc', 'bhenchod', 'behenchod', 'bc', 'bsdk', 'bhosdike', 'bhosdi',
  'gandu', 'gaandu', 'lund', 'lauda', 'loda', 'lavde', 'randi', 'harami', 'haramkhor', 'kamina', 'kutta', 'kutiya', 'saala', 'saale',
  'चूतिया', 'मादरचोद', 'बहनचोद', 'भोसड़ी', 'गांडू', 'लौड़ा', 'रंडी', 'हरामी', 'कमीना', 'कुत्ता', 'साला',
]
const BLOCKED_RE = new RegExp(
  `(^|[^\\p{L}\\p{M}\\p{N}])(${BLOCKED_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=$|[^\\p{L}\\p{M}\\p{N}])`,
  'giu',
)
const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|in|net|org|io|me|xyz|app|link|ly)\b\S*/gi
// 8+ digits, allowing spaces / dashes / dots between them (phone numbers, UPI handles' numbers, OTPs).
const LONG_NUMBER_RE = /(?:\+?\d[\s.-]?){8,}/g

/**
 * Clean a chat message: trim, collapse whitespace, cap length, mask swear words,
 * and hide links and phone-number-like digit runs (nobody should be sharing those
 * with strangers in a game). Returns '' if nothing is left.
 */
export function sanitizeChatText(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  // Drop control characters, then collapse whitespace.
  // eslint-disable-next-line no-control-regex
  let text = raw.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  text = Array.from(text).slice(0, CHAT_MAX_LEN).join('')
  text = text.replace(URL_RE, '🔗✖')
  text = text.replace(LONG_NUMBER_RE, '📵 ')
  text = text.replace(BLOCKED_RE, (_m, pre: string, word: string) => pre + '*'.repeat(Array.from(word).length))
  return text.trim()
}

export function isQuickChatId(v: unknown): v is QuickChatId {
  return typeof v === 'string' && (QUICK_CHAT_IDS as readonly string[]).includes(v)
}

export function isPokeEmoji(v: unknown): v is string {
  return typeof v === 'string' && (POKE_EMOJIS as readonly string[]).includes(v)
}

const ID_RE = /^[\w-]{1,64}$/

/** Validate + clean an incoming chat payload. Returns null for anything malformed. */
export function parseChatWire(payload: unknown): ChatWire | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  if (typeof p.id !== 'string' || !ID_RE.test(p.id) || typeof p.from !== 'string' || !p.from) return null
  if (p.kind === 'quick') return isQuickChatId(p.quickId) ? { id: p.id, from: p.from, kind: 'quick', quickId: p.quickId } : null
  if (p.kind === 'text') {
    const text = sanitizeChatText(p.text)
    return text ? { id: p.id, from: p.from, kind: 'text', text } : null
  }
  return null
}

export function parsePokeWire(payload: unknown): PokeWire | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  if (typeof p.id !== 'string' || !ID_RE.test(p.id)) return null
  if (typeof p.from !== 'string' || typeof p.to !== 'string' || !p.from || !p.to || p.from === p.to) return null
  if (!isPokeEmoji(p.emoji)) return null
  return { id: p.id, from: p.from, to: p.to, emoji: p.emoji }
}

/** Sliding-window limiter: at most `max` events per `windowMs`, tracked per key. */
export class RateLimiter {
  private hits = new Map<string, number[]>()
  constructor(private max: number, private windowMs: number) {}

  allow(key = '', now = Date.now()): boolean {
    const list = (this.hits.get(key) ?? []).filter(t => now - t < this.windowMs)
    if (list.length >= this.max) {
      this.hits.set(key, list)
      return false
    }
    list.push(now)
    this.hits.set(key, list)
    return true
  }
}

/** Append to the feed, ignoring duplicate ids and keeping the newest CHAT_FEED_LIMIT items. */
export function appendFeed(feed: FeedItem[], item: FeedItem): FeedItem[] {
  if (feed.some(f => f.id === item.id)) return feed
  const next = [...feed, item]
  return next.length > CHAT_FEED_LIMIT ? next.slice(next.length - CHAT_FEED_LIMIT) : next
}
