import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Check, Flag, Hand, Headphones, MessageCircle, Mic, MicOff, PhoneOff, Send, Volume2, VolumeX, X } from 'lucide-react'
import type { RoomComms } from '../../hooks/useRoomComms'
import { CHAT_MAX_LEN, POKE_EMOJIS, QUICK_CHAT_IDS, type FeedItem } from '../../lib/roomChat'
import { REPORT_DETAILS_MAX, REPORT_REASONS, ReportError, type ReportErrorCode, type ReportReason } from '../../lib/reports'
import { Avatar, Badge, Button, Modal, Sheet, ToggleChip } from '../ui'
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

/**
 * Chat + mic dock buttons (spec §E.18): 48 px round buttons that the board places in its
 * comms dock (phone portrait: right-edge stack; landscape / desktop: top bar).
 * Mic has three states: voice off, mic on (live), muted. Labels show on desktop.
 */
export function CommsControls({ comms, myId }: { comms: RoomComms; myId: string }) {
  const { t } = useTranslation()
  const { voice } = comms
  const iAmSpeaking = voice.joined && !voice.muted && voice.speaking.includes(myId)
  const micState = !voice.joined ? 'off' : voice.muted ? 'muted' : 'live'
  const micLabel = micState === 'off' ? t('comms.voiceOff') : micState === 'muted' ? t('comms.muted') : t('comms.micOn')
  const micAction = micState === 'off' ? t('comms.voiceJoin') : micState === 'muted' ? t('comms.micUnmute') : t('comms.micMute')
  return (
    <>
      <button
        type="button"
        className="dockbtn"
        aria-label={comms.unread ? t('comms.openChatUnread', { n: comms.unread }) : t('comms.openChat')}
        onClick={() => comms.setPanelOpen(!comms.panelOpen)}
      >
        <MessageCircle size={22} strokeWidth={2.25} aria-hidden="true" />
        <span className="dockbtn__label" aria-hidden="true">{t('comms.chat')}</span>
        <Badge count={comms.unread} float />
      </button>
      {/* Child-safe rooms (13–17 player): no voice, so no mic button. */}
      {!comms.childSafe && <button
        type="button"
        className={`dockbtn dockbtn--mic is-${micState}${iAmSpeaking ? ' is-speaking' : ''}`}
        aria-label={`${micLabel}. ${micAction}`}
        aria-pressed={voice.joined && !voice.muted}
        disabled={voice.joining}
        onClick={() => { if (voice.joined) comms.toggleMic(); else void comms.joinVoice() }}
      >
        {micState === 'live' ? <Mic size={22} strokeWidth={2.25} aria-hidden="true" /> : <MicOff size={22} strokeWidth={2.25} aria-hidden="true" />}
        <span className="dockbtn__label" aria-hidden="true">{micLabel}</span>
      </button>}
    </>
  )
}

function feedText(item: FeedItem, t: (k: string, o?: Record<string, unknown>) => string, nameOf: (id: string) => string, myId?: string): string {
  if (item.kind === 'text') return item.text
  if (item.kind === 'quick') return t(`comms.quick.${item.quickId}`)
  if (item.to === myId) return t('comms.pokedYou', { name: nameOf(item.from), emoji: item.emoji })
  return t('comms.pokeLine', { from: nameOf(item.from), to: nameOf(item.to), emoji: item.emoji })
}

/** Report dialog (spec §E.18 / D.6): pick a reason, optional details, send; then auto-mute. */
function ReportDialog({ player, onReport, silenced, onMute, onReported, onClose }: {
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

  if (phase === 'done') {
    return (
      <Modal open onClose={onClose} title={t('comms.report.title', { name: player.name })} body={t('comms.report.thanks', { name: player.name })}
        actions={<Button onClick={onClose} data-autofocus>{t('comms.report.done')}</Button>} />
    )
  }
  if (!onReport) {
    return (
      <Modal open onClose={onClose} title={t('comms.report.title', { name: player.name })} body={t('comms.report.signIn', { name: player.name })}
        actions={<>
          {!silenced && <Button variant="danger" icon={<VolumeX size={18} aria-hidden="true" />} onClick={() => { onMute(); onClose() }}>{t('comms.report.muteNow', { name: player.name })}</Button>}
          <Button variant="outline" onClick={onClose}>{t('comms.report.cancel')}</Button>
        </>} />
    )
  }
  return (
    <Modal open onClose={onClose} title={t('comms.report.title', { name: player.name })} className="report-modal"
      actions={<>
        <Button variant="danger" onClick={() => void submit()} disabled={!reason} loading={phase === 'sending'}>
          {phase === 'sending' ? t('comms.report.sending') : t('comms.report.submit')}
        </Button>
        <Button variant="outline" onClick={onClose}>{t('comms.report.cancel')}</Button>
      </>}
    >
      <form className="report-form" onSubmit={e => { e.preventDefault(); void submit() }}>
        <fieldset className="report-reasons">
          <legend className="field__label">{t('comms.report.why')}</legend>
          <div className="report-reasons__list">
            {REPORT_REASONS.map(r => (
              <ToggleChip key={r} pressed={reason === r} onPressedChange={() => setReason(r)}>{t(`comms.report.reasons.${r}`)}</ToggleChip>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span className="field__label">{t('comms.report.details')}</span>
          <textarea
            className="field__input"
            value={details}
            maxLength={REPORT_DETAILS_MAX}
            rows={2}
            placeholder={t('comms.report.detailsPlaceholder')}
            onChange={e => setDetails(e.target.value)}
          />
        </label>
        <p className="report-note">{t('comms.report.evidenceNote')} {!silenced && t('comms.report.muteNote')}</p>
        {error && <p className="comms-error" role="alert">{t(`comms.report.err.${error}`)}</p>}
      </form>
    </Modal>
  )
}

/** Chat panel (spec §E.18): side panel (phone portrait: bottom sheet 70 dvh) with voice bar, people, messages, quick chat, input. */
export function ChatPanel({ comms, players, myId, onReport }: {
  comms: RoomComms
  players: CommsPlayer[]
  myId: string
  /** Omit when the user isn't signed in; the report dialog then offers mute and asks them to sign in. */
  onReport?: ReportHandler
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [pokeFor, setPokeFor] = useState<string | null>(null)
  const [reportFor, setReportFor] = useState<string | null>(null)
  const [reported, setReported] = useState<Set<string>>(() => new Set())
  const listRef = useRef<HTMLDivElement>(null)
  const nameOf = (id: string) => id === myId ? t('board.you') : (players.find(p => p.id === id)?.name ?? '?')

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [comms.feed.length, comms.panelOpen])

  // A closed panel also closes the report dialog.
  useEffect(() => { if (!comms.panelOpen) setReportFor(null) }, [comms.panelOpen])

  useEffect(() => {
    if (!hint) return
    const timer = setTimeout(() => setHint(null), 2500)
    return () => clearTimeout(timer)
  }, [hint])

  const send = () => {
    const res = comms.sendText(draft)
    if (res === 'ok') setDraft('')
    else if (res === 'limited') setHint(t('comms.slowDown'))
  }

  const others = players.filter(p => p.id !== myId)
  const reportPlayer = reportFor ? others.find(p => p.id === reportFor) ?? null : null
  const { voice } = comms
  const seatOf = (id: string) => Math.max(0, players.findIndex(p => p.id === id))

  return (
    <>
      <Sheet
        open={comms.panelOpen}
        onClose={() => { if (!reportFor) comms.setPanelOpen(false) }}
        title={t('comms.title')}
        className="chat-sheet"
        bodyClassName="chat-sheet__body"
        footer={
          <>
            <div className="chat-quick" role="group" aria-label={t('comms.quickTitle')}>
              {QUICK_CHAT_IDS.map(id => (
                <button key={id} type="button" className="chat-quick__btn" onClick={() => { if (!comms.sendQuick(id)) setHint(t('comms.slowDown')) }}>
                  {t(`comms.quick.${id}`)}
                </button>
              ))}
            </div>
            {hint && <p className="chat-hint" role="status">{hint}</p>}
            {comms.childSafe ? (
              <p className="chat-safety" data-testid="child-safe-chat">{t('comms.childSafe')}</p>
            ) : <>
            <form className="chat-input" onSubmit={e => { e.preventDefault(); send() }}>
              <input
                className="field__input"
                type="text"
                value={draft}
                maxLength={CHAT_MAX_LEN}
                placeholder={t('comms.placeholder')}
                aria-label={t('comms.placeholder')}
                enterKeyHint="send"
                autoComplete="off"
                onChange={e => setDraft(e.target.value)}
              />
              <Button type="submit" variant="secondary" icon={<Send size={20} aria-hidden="true" />} aria-label={t('comms.send')} disabled={!draft.trim()} />
            </form>
            <p className="chat-safety">{t('comms.safety')}</p>
            </>}
          </>
        }
      >
        {/* Voice bar (none in child-safe rooms) */}
        {!comms.childSafe && <div className="chat-voice">
          {!voice.joined ? (
            <Button variant="secondary" size="s" icon={<Headphones size={18} aria-hidden="true" />} loading={voice.joining} onClick={() => void comms.joinVoice()}>
              {voice.joining ? t('comms.voiceJoining') : t('comms.voiceJoin')}
            </Button>
          ) : (
            <>
              <Button variant={voice.muted ? 'outline' : 'save'} size="s" icon={voice.muted ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />} onClick={comms.toggleMic}>
                {voice.muted ? t('comms.micUnmute') : t('comms.micMute')}
              </Button>
              <Button variant="ghost" size="s" icon={<PhoneOff size={18} aria-hidden="true" />} onClick={comms.leaveVoice}>{t('comms.voiceLeave')}</Button>
            </>
          )}
          <span className="chat-voice__count">{t('comms.inVoice', { n: Object.keys(voice.members).length })}</span>
        </div>}
        {comms.voiceError && (
          <div className="comms-error" role="alert">
            <span>{t(`comms.err.${comms.voiceError}`)}</span>
            <Button variant="ghost" size="s" icon={<X size={16} aria-hidden="true" />} aria-label={t('common.close')} onClick={comms.clearVoiceError} />
          </div>
        )}

        {/* People: poke / mute / report */}
        <ul className="chat-people">
          {others.map(p => {
            const member = voice.members[p.id]
            const speaking = voice.speaking.includes(p.id)
            const silenced = comms.silenced.has(p.id)
            return (
              <li key={p.id} className={`chat-person${p.left ? ' is-left' : ''}`}>
                <span className={`chat-person__av${speaking ? ' is-speaking' : ''}`}><Avatar name={p.name} seat={seatOf(p.id)} size="m" /></span>
                <span className="chat-person__name">
                  {p.name}
                  {member && (member.muted
                    ? <MicOff size={14} aria-label={t('comms.isMuted')} />
                    : <Mic size={14} aria-label={t('comms.isInVoice')} />)}
                </span>
                {!p.left && (
                  <Button
                    variant="outline"
                    size="s"
                    icon={<Hand size={16} aria-hidden="true" />}
                    aria-expanded={pokeFor === p.id}
                    onClick={() => setPokeFor(pokeFor === p.id ? null : p.id)}
                  >
                    {t('comms.poke')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="s"
                  icon={silenced ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
                  aria-pressed={silenced}
                  aria-label={silenced ? t('comms.unmutePlayer', { name: p.name }) : t('comms.mutePlayer', { name: p.name })}
                  onClick={() => comms.toggleSilenced(p.id)}
                  className={silenced ? 'is-on' : ''}
                />
                <Button
                  variant="ghost"
                  size="s"
                  icon={reported.has(p.id) ? <Check size={20} aria-hidden="true" /> : <Flag size={20} aria-hidden="true" />}
                  aria-haspopup="dialog"
                  aria-label={reported.has(p.id) ? `${t('comms.report.reported')}: ${p.name}` : t('comms.report.button', { name: p.name })}
                  disabled={reported.has(p.id)}
                  onClick={() => { setPokeFor(null); setReportFor(p.id) }}
                  className="btn--danger-text"
                />
                {pokeFor === p.id && (
                  <div className="chat-poke" role="group" aria-label={t('comms.pokeWho', { name: p.name })}>
                    {POKE_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className="chat-poke__emoji emoji"
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
        <div className="chat-feed" ref={listRef} aria-live="polite">
          {comms.feed.length === 0 && <p className="chat-empty">{t('comms.empty')}</p>}
          {comms.feed.map(item => item.kind === 'poke' ? (
            <p key={item.id} className="chat-line">{feedText(item, t, nameOf, myId)}</p>
          ) : (
            <div key={item.id} className={`chat-msg${item.from === myId ? ' is-mine' : ''}`}>
              {item.from !== myId && <span className="chat-msg__from">{nameOf(item.from)}</span>}
              <span className={`chat-msg__text${item.kind === 'quick' ? ' is-quick' : ''}`}>{feedText(item, t, nameOf)}</span>
            </div>
          ))}
        </div>
      </Sheet>

      {reportPlayer && (
        <ReportDialog
          key={reportPlayer.id}
          player={reportPlayer}
          onReport={onReport}
          silenced={comms.silenced.has(reportPlayer.id)}
          onMute={() => comms.toggleSilenced(reportPlayer.id)}
          onReported={() => setReported(prev => new Set(prev).add(reportPlayer.id))}
          onClose={() => setReportFor(null)}
        />
      )}
    </>
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
          className="chat-bubble"
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          onClick={() => comms.setPanelOpen(true)}
        >
          <MessageCircle size={16} aria-hidden="true" />
          {item.kind === 'poke'
            ? <span>{feedText(item, t, nameOf, myId)}</span>
            : <span><b>{nameOf(item.from)}:</b> {feedText(item, t, nameOf)}</span>}
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/** "You got poked" moment: the emoji drops in with a gentle wobble (the hook buzzes the phone). No screen flashing. */
export function PokeOverlay({ comms, nameOf }: { comms: RoomComms; nameOf: (id: string) => string }) {
  const { t } = useTranslation()
  const hit = comms.pokeHit
  return (
    <AnimatePresence>
      {hit && (
        <motion.div key={hit.id} className="poke-overlay" aria-live="assertive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.span
            className="poke-overlay__emoji emoji"
            initial={{ scale: 0.4, y: -120 }}
            animate={{ scale: 1, y: 0, rotate: [0, 6, -6, 3, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {hit.emoji}
          </motion.span>
          <motion.span className="poke-overlay__text" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            {t('comms.pokedYou', { name: nameOf(hit.from), emoji: hit.emoji })}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
