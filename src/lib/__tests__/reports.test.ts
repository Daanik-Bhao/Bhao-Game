import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FeedItem } from '../roomChat'

const rpc = vi.fn()
vi.mock('../supabase', () => ({ supabase: { rpc: (...args: unknown[]) => rpc(...args) } }))

const { buildEvidence, reportErrorCode, reportPlayer, ReportError, REPORT_REASONS } = await import('../reports')

const BAD = 'bad-player'
const at = (s: number) => Date.UTC(2026, 9, 13, 10, 0, s)

function feed(): FeedItem[] {
  const items: FeedItem[] = []
  for (let i = 0; i < 14; i++) items.push({ id: `t${i}`, at: at(i), from: BAD, kind: 'text', text: `msg ${i}` })
  items.push({ id: 'q1', at: at(20), from: BAD, kind: 'quick', quickId: 'scam' })
  items.push({ id: 'p1', at: at(21), from: BAD, kind: 'poke', to: 'me', emoji: '🍅' })
  items.push({ id: 'o1', at: at(22), from: 'someone-else', kind: 'text', text: 'not them' })
  return items
}

describe('buildEvidence', () => {
  it('keeps only the last 10 text/quick lines from that player, oldest first, with ISO times', () => {
    const ev = buildEvidence(feed(), BAD)
    expect(ev).toHaveLength(10)
    expect(ev[0]).toEqual({ at: new Date(at(5)).toISOString(), kind: 'text', text: 'msg 5' })
    expect(ev[9]).toEqual({ at: new Date(at(20)).toISOString(), kind: 'quick', text: 'scam' })
    expect(ev.some(l => l.text === 'not them')).toBe(false)
  })

  it('is empty when the player said nothing', () => {
    expect(buildEvidence(feed(), 'quiet')).toEqual([])
  })

  it('stays under the server size cap', () => {
    const long: FeedItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: `l${i}`, at: at(i), from: BAD, kind: 'text' as const, text: 'अ'.repeat(200),
    }))
    const ev = buildEvidence(long, BAD)
    expect(new TextEncoder().encode(JSON.stringify(ev)).length).toBeLessThanOrEqual(3800)
    expect(ev.length).toBeGreaterThan(0)
    expect(ev[ev.length - 1].at).toBe(new Date(at(9)).toISOString())
  })
})

describe('reportErrorCode', () => {
  it('maps server errors to UI codes', () => {
    expect(reportErrorCode({ code: '28000', message: 'Not authenticated' })).toBe('not_signed_in')
    expect(reportErrorCode({ code: '22023', message: 'You cannot report yourself' })).toBe('self')
    expect(reportErrorCode({ code: '23505', message: 'Already reported' })).toBe('duplicate')
    expect(reportErrorCode({ code: 'P0001', message: 'Report limit reached, try again tomorrow' })).toBe('limited')
    expect(reportErrorCode({ code: '22023', message: 'Invalid evidence' })).toBe('invalid')
    expect(reportErrorCode({ message: 'Failed to fetch' })).toBe('failed')
  })
})

describe('reportPlayer', () => {
  beforeEach(() => rpc.mockReset())

  it('calls report_player with trimmed details and evidence', async () => {
    rpc.mockResolvedValue({ data: 'report-id', error: null })
    const id = await reportPlayer({ reportedId: BAD, roomId: 'room-1', reason: 'scam', details: '  asked for OTP ', feed: feed() })
    expect(id).toBe('report-id')
    expect(rpc).toHaveBeenCalledTimes(1)
    const [fn, args] = rpc.mock.calls[0]
    expect(fn).toBe('report_player')
    expect(args).toMatchObject({ p_reported: BAD, p_room: 'room-1', p_reason: 'scam', p_details: 'asked for OTP' })
    expect(args.p_evidence).toHaveLength(10)
  })

  it('sends null room/details when missing', async () => {
    rpc.mockResolvedValue({ data: 'x', error: null })
    await reportPlayer({ reportedId: BAD, reason: 'other', details: '   ' })
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_room: null, p_details: null, p_evidence: [] })
  })

  it('throws a ReportError with a code', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '23505', message: 'Already reported' } })
    await expect(reportPlayer({ reportedId: BAD, reason: 'spam' })).rejects.toMatchObject({ name: 'ReportError', code: 'duplicate' })
    await expect(reportPlayer({ reportedId: BAD, reason: 'nope' as never })).rejects.toBeInstanceOf(ReportError)
  })

  it('reason list matches the SQL check constraint', () => {
    expect([...REPORT_REASONS]).toEqual(['abuse', 'spam', 'sexual', 'scam', 'personal_info', 'other'])
  })
})
