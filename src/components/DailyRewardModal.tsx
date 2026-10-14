import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { playSound } from '../lib/audio'
import { DAILY_REWARDS } from '../data/rankRules'
import type { DailyRewardResult } from '../types/database'
import { Button, DCoin, Modal } from './ui'
import { useReducedEffects } from '../hooks/useReducedEffects'
import '../pages/menus.css'

interface DailyRewardModalProps {
  onClose: () => void
  /** Calls the claim_daily_reward RPC; resolves null on network/server error. */
  onClaim: () => Promise<DailyRewardResult | null>
  /** Called after the claim animation (refresh the profile and close). */
  onDone: () => void
  /** Streak before today's claim (0 when broken). Display hint only; the server decides. */
  currentStreak: number
}

type ClaimState = 'idle' | 'claiming' | 'claimed' | 'already' | 'error'

const REWARDS = DAILY_REWARDS.map((amount, i) => ({ day: i + 1, amount }))

/** Small coin-count roll-up (700 ms); jumps straight to the value when effects are reduced. */
function useRollUp(target: number, run: boolean, reduced: boolean): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!run) return
    if (reduced) { setValue(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 700)
      setValue(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, reduced])
  return run ? value : target
}

/** Daily streak bonus (spec §E.21): Gullu cheer, 7 day tiles, "+20 Daanik Coins", [Collect]. No confetti, no spin. */
export function DailyRewardModal({ onClose, onClaim, onDone, currentStreak }: DailyRewardModalProps) {
  const { t } = useTranslation()
  const { reduced } = useReducedEffects()
  const [state, setState] = useState<ClaimState>('idle')
  const [result, setResult] = useState<DailyRewardResult | null>(null)

  // After a claim, highlight the day the server actually paid.
  const paidIndex = result && !result.already_claimed ? result.streak - 1 : currentStreak
  const todayIndex = Math.max(0, Math.min(paidIndex, REWARDS.length - 1))
  const currentReward = REWARDS[todayIndex]
  const claimed = state === 'claimed'
  const amount = result?.reward ?? currentReward.amount
  const shown = useRollUp(amount, claimed, reduced)

  const handleClaim = async () => {
    if (state !== 'idle' && state !== 'error') return
    setState('claiming')
    const res = await onClaim()
    if (!res) {
      setState('error')
      return
    }
    setResult(res)
    if (res.already_claimed) {
      setState('already')
      setTimeout(onDone, 1800)
      return
    }
    playSound('win')
    setState('claimed')
    setTimeout(onDone, 2500)
  }

  const busy = state === 'claiming'
  const finished = state === 'claimed' || state === 'already'

  return (
    <Modal
      open
      onClose={busy ? undefined : onClose}
      gullu="cheer"
      gulluSize={80}
      title={t('daily.title')}
      body={t('daily.body')}
      className="daily"
      actions={finished ? (
        <Button variant="outline" onClick={onDone}>{t('common.close')}</Button>
      ) : (
        <Button size="l" block loading={busy} onClick={handleClaim}>
          {state === 'error' ? t('daily.retry') : t('daily.collect')}
        </Button>
      )}
    >
      <ol className="daily__days" aria-label={t('daily.daysLabel')}>
        {REWARDS.map((r, i) => {
          const status = i < todayIndex ? 'past' : i === todayIndex ? 'today' : 'future'
          return (
            <li key={r.day} className={`daily__day is-${status}`} aria-current={status === 'today' ? 'step' : undefined}>
              <span className="daily__dayname">{t('daily.day', { n: r.day })}</span>
              {status === 'past'
                ? <Check size={18} strokeWidth={3} aria-label={t('daily.collected')} />
                : <span className="daily__dayamt num">{r.amount}</span>}
            </li>
          )
        })}
      </ol>
      <p className="daily__amount" aria-live="polite">
        <DCoin className="dcoin--l" />
        <span className="num">+{claimed ? shown : amount}</span>
        <span>{t('common.coins')}</span>
      </p>
      {state === 'already' && <p className="daily__note">{t('daily.already')}</p>}
      {state === 'error' && <p className="daily__note daily__note--error" role="alert">{t('daily.error')}</p>}
      {claimed && <p className="daily__note">{t('daily.collectedNote')}</p>}
    </Modal>
  )
}
