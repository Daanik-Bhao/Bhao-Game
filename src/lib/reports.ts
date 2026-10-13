/**
 * Reporting a player in a multiplayer room (Google Play UGC policy).
 *
 * Chat is never stored on the server, so a report carries its own evidence: the
 * reported player's last few chat / quick-chat lines from this client's feed (already
 * cleaned on receipt). Voice is peer-to-peer and not recorded, so it is never included.
 * Writes go through the `report_player` RPC (see supabase/migrations/*_player_reports.sql);
 * clients can't read reports back.
 */
import { supabase } from './supabase'
import type { FeedItem } from './roomChat'

export const REPORT_REASONS = ['abuse', 'spam', 'sexual', 'scam', 'personal_info', 'other'] as const
export type ReportReason = typeof REPORT_REASONS[number]

export const REPORT_DETAILS_MAX = 500
export const REPORT_EVIDENCE_MAX_LINES = 10
/** Mirrors the server's 4000-byte cap with some headroom for JSON overhead. */
const EVIDENCE_MAX_BYTES = 3800

export interface EvidenceLine {
  /** ISO time the line arrived on this device. */
  at: string
  kind: 'text' | 'quick'
  /** Message text, or the quick-chat id for quick lines. */
  text: string
}

export type ReportErrorCode = 'not_signed_in' | 'self' | 'duplicate' | 'limited' | 'invalid' | 'failed'

export class ReportError extends Error {
  constructor(public code: ReportErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'ReportError'
  }
}

export function isReportReason(v: unknown): v is ReportReason {
  return typeof v === 'string' && (REPORT_REASONS as readonly string[]).includes(v)
}

/** Last ≤10 text/quick lines sent by `playerId`, oldest first, within the server's size cap. */
export function buildEvidence(feed: readonly FeedItem[], playerId: string, maxLines = REPORT_EVIDENCE_MAX_LINES): EvidenceLine[] {
  const lines: EvidenceLine[] = []
  for (const item of feed) {
    if (item.from !== playerId) continue
    if (item.kind === 'text') lines.push({ at: new Date(item.at).toISOString(), kind: 'text', text: item.text })
    else if (item.kind === 'quick') lines.push({ at: new Date(item.at).toISOString(), kind: 'quick', text: item.quickId })
  }
  let out = lines.slice(-Math.max(0, Math.min(maxLines, REPORT_EVIDENCE_MAX_LINES)))
  while (out.length && new TextEncoder().encode(JSON.stringify(out)).length > EVIDENCE_MAX_BYTES) out = out.slice(1)
  return out
}

/** Map a PostgREST / Postgres error from `report_player` to a UI code. */
export function reportErrorCode(err: { code?: string; message?: string } | null | undefined): ReportErrorCode {
  const msg = err?.message ?? ''
  if (err?.code === '28000' || /not authenticated|JWT/i.test(msg)) return 'not_signed_in'
  if (/yourself/i.test(msg)) return 'self'
  if (err?.code === '23505' || /already reported/i.test(msg)) return 'duplicate'
  if (/limit/i.test(msg)) return 'limited'
  if (err?.code === '22023' || /invalid|too long|unknown player/i.test(msg)) return 'invalid'
  return 'failed'
}

export interface ReportInput {
  reportedId: string
  roomId?: string | null
  reason: ReportReason
  details?: string
  /** The room's comms feed; evidence is built from it. */
  feed?: readonly FeedItem[]
}

/** Send a report. Resolves with the report id; throws ReportError on failure. */
export async function reportPlayer({ reportedId, roomId, reason, details, feed = [] }: ReportInput): Promise<string> {
  if (!isReportReason(reason)) throw new ReportError('invalid')
  const text = (details ?? '').trim().slice(0, REPORT_DETAILS_MAX)
  const { data, error } = await supabase.rpc('report_player', {
    p_reported: reportedId,
    p_room: roomId || null,
    p_reason: reason,
    p_details: text || null,
    p_evidence: buildEvidence(feed, reportedId),
  })
  if (error) throw new ReportError(reportErrorCode(error), error.message)
  return String(data)
}
