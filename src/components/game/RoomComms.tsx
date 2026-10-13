import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check, Flag, Headphones, MessageCircle, Mic, MicOff, PhoneOff, Send, Volume2, VolumeX, X } from 'lucide-react'
import type { RoomComms } from '../../hooks/useRoomComms'
import { CHAT_MAX_LEN, POKE_EMOJIS, QUICK_CHAT_IDS, type FeedItem } from '../../lib/roomChat'
import { REPORT_DETAILS_MAX, REPORT_REASONS, ReportError, type ReportErrorCode, type ReportReason } from '../../lib/reports'
import './RoomComms.css'

/**
 * Sends a report (the page wires this to `reportPlayer` with the room id and comms feed).
 * Leave it undefined when the user can't report (not signed in): the sheet then explains
 * that and still offers mute.
 */
export type ReportHandler = (playerId: string, reason: ReportReason, details: string) => Promise<unknown>

export interface CommsPlayer { id: string; name: string; left?: boolean }

/** Per-player voice badge for the board's player chips. */
export type VoiceBadge = 'on' | 'muted' | 'speaking'

export function voiceBadges(comms: RoomComms): Record<string, VoiceBadge> {
  const out: Record<string, VoiceBadge> = {}
  Object.values(comms.voice.members).forEach(m => {
    out[m.id] = comms.voice.speaking.includes(m.id) ? 'speaking' : m.muted ? 'muted' : 'on'
  })
  return out
}

/** Chat + mic buttons that sit in the board's toolbar next to the emote button. */
export function CommsControls({ comms, myId }: { comms: RoomComms; myId: string }) {
  const { t } = useTranslation()
  const { voice } = comms
  const iAmSpeaking = voice.joined && !voice.muted && voice.speaking.includes(myId)
  return (
    <>
      <button
        type="button"
        className="board-icon-btn comms-btn"
        aria-label={comms.unread ? t('comms.openChatUnread', { n: comms.unread }) : t('comms.openChat')}
        onClick={() => comms.setPanelOpen(!comms.panelOpen)}
      >
        <MessageCircle size={20} />
        {comms.unread > 0 && <span className="comms-badge">{comms.unread > 9 ? '9+' : comms.unread}</span>}
      </button>
      <button
        type="button"
        className={`board-icon-btn comms-btn mic-btn ${!voice.joined ? 'off' : voice.muted ? 'muted' : 'live'}${iAmSpeaking ? ' speaking' : ''}`}
        aria-label={!voice.joined ? t('comms.voiceJoin') : voice.muted ? t('comms.micUnmute') : t('comms.micMute')}
        aria-pressed={voice.joined && !voice.muted}
        disabled={voice.joining}
        onClick={() => { if (voice.joined) comms.toggleMic(); else void comms.joinVoice() }}
      >
        {!voice.joined ? <Headphones size={20} /> : voice.muted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>
    </>
  )
}

function feedText(item: FeedItem, t: (k: string, o?: Record<string, unknown>) => string, nameOf: (id: string) => string, myId?: string): string {
  if (item.kind === 'text') return item.text
  if (item.kind === 'quick') return t(`comms.quick.${item.quickId}`)
  if (item.to === myId) return t('comms.pokedYou', { name: nameOf(item.from), emoji: item.emoji })
  return t('comms.pokeLine', { from: nameOf(item.from), to: nameOf(item.to), emoji: item.emoji })
}

/** Bottom sheet inside the chat panel: pick a reason, optional details, send; then auto-mute. */
function ReportSheet({ player, onReport, silenced, onMute, onReported, onClose }: {
  player: CommsPlayer
  onReport?: ReportHandler
  silenced: boolean
  onMute: () => void
  onReported: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form')
  const [error, setError] = useState<ReportErrorCode | null>(null)
  const firstRef = useRef<HTMLButtonElement>(null)
  const titleId = `comms-report-title-${player.id}`

  useEffect(() => { firstRef.current?.focus() }, [phase])

  const submit = async () => {
    if (!onReport || !reason || phase === 'sending') return
    setPhase('sending')
    setError(null)
    try {
      await onReport(player.id, reason, details.trim())
      if (!silenced) onMute()
      onReported()
      setPhase('done')
    } catch (e) {
      setError(e instanceof ReportError ? e.code : 'failed')
      setPhase('form')
    }
  }

  return (
    <>
      <motion.div className="comms-sheet-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="comms-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
      >
        <header className="comms-sheet-head">
          <h3 id={titleId}><Flag size={17} aria-hidden /> {t('comms.report.title', { name: player.name })}</h3>
          <button type="button" className="comms-icon" aria-label={t('common.close')} onClick={onClose}><X size={20} /></button>
        </header>

        {phase === 'done' ? (
          <div className="comms-sheet-done" role="status">
            <span className="comms-sheet-check" aria-hidden><Check size={26} /></span>
            <p>{t('comms.report.thanks', { name: player.name })}</p>
            <button ref={firstRef} type="button" className="comms-sheet-submit" onClick={onClose}>{t('comms.report.done')}</button>
          </div>
        ) : !onReport ? (
          <div className="comms-sheet-body">
            <p className="comms-sheet-note">{t('comms.report.signIn', { name: player.name })}</p>
            {!silenced && (
              <button ref={firstRef} type="button" className="comms-sheet-submit" onClick={() => { onMute(); onClose() }}>
                <VolumeX size={18} aria-hidden /> {t('comms.report.muteNow', { name: player.name })}
              </button>
            )}
            <button ref={silenced ? firstRef : undefined} type="button" className="comms-sheet-cancel" onClick={onClose}>{t('comms.report.cancel')}</button>
          </div>
        ) : (
          <form className="comms-sheet-body" onSubmit={e => { e.preventDefault(); void submit() }}>
            <fieldset className="comms-sheet-reasons">
              <legend>{t('comms.report.why')}</legend>
              {REPORT_REASONS.map((r, i) => (
                <button
                  key={r}
                  ref={i === 0 ? firstRef : undefined}
                  type="button"
                  className={`comms-reason${reason === r ? ' active' : ''}`}
                  aria-pressed={reason === r}
                  onClick={() => setReason(r)}
                >
                  {t(`comms.report.reasons.${r}`)}
                </button>
              ))}
            </fieldset>
            <label className="comms-sheet-label">
              {t('comms.report.details')}
              <textarea
                value={details}
                maxLength={REPORT_DETAILS_MAX}
                rows={2}
                placeholder={t('comms.report.detailsPlaceholder')}
                onChange={e => setDetails(e.target.value)}
              />
            </label>
            <p className="comms-sheet-note">{t('comms.report.evidenceNote')} {!silenced && t('comms.report.muteNote')}</p>
            {error && <div className="comms-error" role="alert">{t(`comms.report.err.${error}`)}</div>}
            <div className="comms-sheet-actions">
              <button type="button" className="comms-sheet-cancel" onClick={onClose}>{t('comms.report.cancel')}</button>
              <button type="submit" className="comms-sheet-submit danger" disabled={!reason || phase === 'sending'}>
                {phase === 'sending' ? t('comms.report.sending') : t('comms.report.submit')}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </>
  )
}

/** Slide-in chat panel: who's here (poke / mute / report / voice), messages, quick chat, input. */
export function ChatPanel({ comms, players, myId, onReport }: {
  comms: RoomComms
  players: CommsPlayer[]
  myId: string
  /** Omit when the user isn't signed in; the report sheet then offers mute and asks them to sign in. */
  onReport?: ReportHandler
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [pokeFor, setPokeFor] = useState<string | null>(null)
  const [reportFor, setReportFor] = useState<string | null>(null)
  const [reported, setReported] = useState<Set<string>>(() => new Set())
  const reportOpenRef = useRef(false)
  reportOpenRef.current = reportFor !== null
  const listRef = useRef<HTMLDivElement>(null)
  const nameOf = (id: string) => id === myId ? t('board.you') : (players.find(p => p.id === id)?.name ?? '?')

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [comms.feed.length, comms.panelOpen])

  // A closed panel also closes the report sheet (it lives inside the panel).
  useEffect(() => { if (!comms.panelOpen) setReportFor(null) }, [comms.panelOpen])

  useEffect(() => {
    if (!hint) return
    const timer = setTimeout(() => setHint(null), 2500)
    return () => clearTimeout(timer)
  }, [hint])

  useEffect(() => {
    if (!comms.panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (reportOpenRef.current) setReportFor(null)
      else comms.setPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [comms])

  const send = () => {
    const res = comms.sendText(draft)
    if (res === 'ok') setDraft('')
    else if (res === 'limited') setHint(t('comms.slowDown'))
  }

  const others = players.filter(p => p.id !== myId)
  const reportPlayer = reportFor ? others.find(p => p.id === reportFor) ?? null : null
  const { voice } = comms

  return (
    <AnimatePresence>
      {comms.panelOpen && (
        <>
          <motion.div
            className="comms-scrim"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => comms.setPanelOpen(false)}
          />
          <motion.aside
            className="comms-panel"
            role="dialog"
            aria-label={t('comms.title')}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <header className="comms-head">
              <h2>{t('comms.title')}</h2>
              <button type="button" className="comms-icon" aria-label={t('common.close')} onClick={() => comms.setPanelOpen(false)}>
                <X size={20} />
              </button>
            </header>

            {/* Voice bar */}
            <div className="comms-voice">
              {!voice.joined ? (
                <button type="button" className="comms-voice-join" disabled={voice.joining} onClick={() => void comms.joinVoice()}>
                  <Headphones size={18} /> {voice.joining ? t('comms.voiceJoining') : t('comms.voiceJoin')}
                </button>
              ) : (
                <>
                  <button type="button" className={`comms-voice-mic ${voice.muted ? 'muted' : 'live'}`} onClick={comms.toggleMic}>
                    {voice.muted ? <MicOff size={18} /> : <Mic size={18} />} {voice.muted ? t('comms.micUnmute') : t('comms.micMute')}
                  </button>
                  <button type="button" className="comms-voice-leave" onClick={comms.leaveVoice}>
                    <PhoneOff size={18} /> {t('comms.voiceLeave')}
                  </button>
                </>
              )}
              <span className="comms-voice-count">
                {t('comms.inVoice', { n: Object.keys(voice.members).length })}
              </span>
            </div>
            {comms.voiceError && (
              <div className="comms-error" role="alert">
                {t(`comms.err.${comms.voiceError}`)}
                <button type="button" className="comms-icon small" aria-label={t('common.close')} onClick={comms.clearVoiceError}><X size={14} /></button>
              </div>
            )}

            {/* People: poke / mute / voice state */}
            <ul className="comms-people">
              {others.map(p => {
                const member = voice.members[p.id]
                const speaking = voice.speaking.includes(p.id)
                const silenced = comms.silenced.has(p.id)
                return (
                  <li key={p.id} className={`comms-person${p.left ? ' left' : ''}`}>
                    <span className={`comms-avatar${speaking ? ' speaking' : ''}`} aria-hidden>{p.name.slice(0, 1).toUpperCase()}</span>
                    <span className="comms-person-name">
                      {p.name}
                      {member && (
                        <span className="comms-person-voice" title={member.muted ? t('comms.isMuted') : t('comms.isInVoice')}>
                          {member.muted ? <MicOff size={13} /> : <Mic size={13} />}
                        </span>
                      )}
                    </span>
                    {!p.left && (
                      <button
                        type="button"
                        className={`comms-chip-btn${pokeFor === p.id ? ' active' : ''}`}
                        aria-expanded={pokeFor === p.id}
                        onClick={() => setPokeFor(pokeFor === p.id ? null : p.id)}
                      >
                        👉 {t('comms.poke')}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`comms-icon${silenced ? ' on' : ''}`}
                      aria-pressed={silenced}
                      aria-label={silenced ? t('comms.unmutePlayer', { name: p.name }) : t('comms.mutePlayer', { name: p.name })}
                      title={silenced ? t('comms.unmutePlayer', { name: p.name }) : t('comms.mutePlayer', { name: p.name })}
                      onClick={() => comms.toggleSilenced(p.id)}
                    >
                      {silenced ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button
                      type="button"
                      className={`comms-icon report${reported.has(p.id) ? ' done' : ''}`}
                      aria-haspopup="dialog"
                      aria-label={reported.has(p.id) ? `${t('comms.report.reported')}: ${p.name}` : t('comms.report.button', { name: p.name })}
                      title={reported.has(p.id) ? t('comms.report.reported') : t('comms.report.button', { name: p.name })}
                      disabled={reported.has(p.id)}
                      onClick={() => { setPokeFor(null); setReportFor(p.id) }}
                    >
                      {reported.has(p.id) ? <Check size={18} /> : <Flag size={18} />}
                    </button>
                    {pokeFor === p.id && (
                      <div className="comms-poke-row" role="group" aria-label={t('comms.pokeWho', { name: p.name })}>
                        {POKE_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            className="comms-poke-emoji"
                            onClick={() => {
                              if (comms.poke(p.id, emoji)) setPokeFor(null)
                              else setHint(t('comms.slowDown'))
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Messages */}
            <div className="comms-feed" ref={listRef} aria-live="polite">
              {comms.feed.length === 0 && <p className="comms-empty">{t('comms.empty')}</p>}
              {comms.feed.map(item => item.kind === 'poke' ? (
                <div key={item.id} className="comms-line poke">{feedText(item, t, nameOf, myId)}</div>
              ) : (
                <div key={item.id} className={`comms-msg${item.from === myId ? ' mine' : ''}`}>
                  {item.from !== myId && <span className="comms-msg-from">{nameOf(item.from)}</span>}
                  <span className={`comms-msg-text${item.kind === 'quick' ? ' quick' : ''}`}>{feedText(item, t, nameOf)}</span>
                </div>
              ))}
            </div>

            {/* Quick chat */}
            <div className="comms-quick" role="group" aria-label={t('comms.quickTitle')}>
              {QUICK_CHAT_IDS.map(id => (
                <button key={id} type="button" className="comms-quick-btn" onClick={() => { if (!comms.sendQuick(id)) setHint(t('comms.slowDown')) }}>
                  {t(`comms.quick.${id}`)}
                </button>
              ))}
            </div>

            {hint && <div className="comms-hint" role="status">{hint}</div>}
            <form className="comms-input" onSubmit={e => { e.preventDefault(); send() }}>
              <input
                type="text"
                value={draft}
                maxLength={CHAT_MAX_LEN}
                placeholder={t('comms.placeholder')}
                aria-label={t('comms.placeholder')}
                enterKeyHint="send"
                autoComplete="off"
                onChange={e => setDraft(e.target.value)}
              />
              <button type="submit" className="comms-send" aria-label={t('comms.send')} disabled={!draft.trim()}>
                <Send size={18} />
              </button>
            </form>
            <p className="comms-safety">{t('comms.safety')}</p>

            <AnimatePresence>
              {reportPlayer && (
                <ReportSheet
                  key={reportPlayer.id}
                  player={reportPlayer}
                  onReport={onReport}
                  silenced={comms.silenced.has(reportPlayer.id)}
                  onMute={() => comms.toggleSilenced(reportPlayer.id)}
                  onReported={() => setReported(prev => new Set(prev).add(reportPlayer.id))}
                  onClose={() => setReportFor(null)}
                />
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/** Short-lived bubble for a new message while the panel is closed; tap opens chat. */
export function ChatBubble({ comms, nameOf, myId }: { comms: RoomComms; nameOf: (id: string) => string; myId: string }) {
  const { t } = useTranslation()
  const item = comms.bubble
  return (
    <AnimatePresence>
      {item && !comms.panelOpen && (
        <motion.button
          key={item.id}
          type="button"
          className="comms-bubble"
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          onClick={() => comms.setPanelOpen(true)}
        >
          <MessageCircle size={16} aria-hidden />
          {item.kind === 'poke'
            ? <span>{feedText(item, t, nameOf, myId)}</span>
            : <span><b>{nameOf(item.from)}:</b> {feedText(item, t, nameOf)}</span>}
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/** Full-screen "you got poked" moment: emoji flies in and wobbles, edges flash (the hook buzzes the phone). */
export function PokeOverlay({ comms, nameOf }: { comms: RoomComms; nameOf: (id: string) => string }) {
  const { t } = useTranslation()
  const hit = comms.pokeHit
  return (
    <AnimatePresence>
      {hit && (
        <motion.div key={hit.id} className="comms-poke-overlay" aria-live="assertive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.span
            className="comms-poke-big"
            initial={{ scale: 0.2, y: -260, rotate: -30 }}
            animate={{ scale: [0.2, 1.5, 1, 1.1, 1], y: 0, rotate: [-30, 12, -8, 6, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {hit.emoji}
          </motion.span>
          <motion.span className="comms-poke-text" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            {t('comms.pokedYou', { name: nameOf(hit.from), emoji: hit.emoji })}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
