import { motion } from 'framer-motion'
import {
  CHAI_PER_DAY, CHAI_PER_MONTH, HOOK_FUTURE_VALUE, HOOK_PAID_IN, HOOK_RATE_PCT, HOOK_YEARS, formatLakh,
} from '../../data/tutorialScript'
import { formatINR } from '../../lib/economy'
import { ProgressDots } from './ProgressDots'
import { LESSON_COUNT } from './steps'
import './tutorial.css'

/** Opening hook: what ₹150 of chai a day becomes as a SIP. */
export function TutorialHook({ onStart, onSkip, onRules }: { onStart: () => void; onSkip: () => void; onRules: () => void }) {
  return (
    <div className="tut-page">
      <motion.div className="tut-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tut-card-head">
          <span className="tut-kicker">BHAO · first match</span>
          <button type="button" className="tut-skip" onClick={onSkip}>Skip tutorial</button>
        </div>
        <h1 className="tut-h1">Your daily chai could be worth {formatLakh(HOOK_FUTURE_VALUE)}.</h1>
        <div className="tut-chain">
          <div className="tut-chain-item">
            <div className="tut-chain-num">₹{CHAI_PER_DAY}</div>
            <div className="tut-chain-label">chai &amp; snacks a day</div>
          </div>
          <div className="tut-chain-arrow" aria-hidden>→</div>
          <div className="tut-chain-item">
            <div className="tut-chain-num">{formatINR(CHAI_PER_MONTH)}</div>
            <div className="tut-chain-label">a month, invested as a SIP</div>
          </div>
          <div className="tut-chain-arrow" aria-hidden>→</div>
          <motion.div
            className="tut-chain-item big"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 1] }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="tut-chain-num">≈ {formatLakh(HOOK_FUTURE_VALUE)}</div>
            <div className="tut-chain-label">after {HOOK_YEARS} years at {HOOK_RATE_PCT}% a year</div>
          </motion.div>
        </div>
        <p className="tut-fine">
          You put in {formatLakh(HOOK_PAID_IN)} of your own money; compounding adds the other {formatLakh(HOOK_FUTURE_VALUE - HOOK_PAID_IN)}.
          {' '}{HOOK_RATE_PCT}% is a long-run average for Indian equity index funds, not a promise — some years fall, some jump.
        </p>
        <p className="tut-lead">Let’s see how money really grows. A 4-year mini match against Rahul — about 5 minutes.</p>
        <div className="tut-btn-row">
          <button type="button" className="tut-btn tut-btn-gold" onClick={onStart} autoFocus>Start the match →</button>
        </div>
        <button type="button" className="tut-link" onClick={onRules}>Just show me the rules (30 sec)</button>
      </motion.div>
    </div>
  )
}

export interface TutorialSummaryProps {
  skipped: boolean
  yourNetWorth?: number
  rahulNetWorth?: number
  onPlay: () => void
  onLibrary: () => void
  onBack: () => void
  onReplay: () => void
}

/** Final screen: the four lessons + where to go next. */
export function TutorialSummary({ skipped, yourNetWorth, rahulNetWorth, onPlay, onLibrary, onBack, onReplay }: TutorialSummaryProps) {
  return (
    <div className="tut-page">
      <motion.div className="tut-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tut-card-head">
          <span className="tut-kicker">{skipped ? 'BHAO in 4 ideas' : 'Tutorial complete'}</span>
          <ProgressDots current={LESSON_COUNT} total={LESSON_COUNT} />
        </div>
        <h1 className="tut-h1">{skipped ? 'The 4 money moves BHAO teaches' : 'You played your first 4 years!'}</h1>
        {!skipped && yourNetWorth !== undefined && rahulNetWorth !== undefined && (
          <div className="tut-scores">
            <div className="tut-score"><small>Your net worth</small><b>{formatINR(yourNetWorth)}</b></div>
            <div className="tut-score"><small>Rahul’s net worth</small><b>{formatINR(rahulNetWorth)}</b></div>
          </div>
        )}
        <ul className="tut-lessons">
          <li>
            <span className="tut-l-emoji" aria-hidden>📈</span>
            <span><strong>Invest early, let years do the work</strong>Idle cash loses ~6% a year to inflation. An index fund grows with the market — bumpy years, strong decades.</span>
          </li>
          <li>
            <span className="tut-l-emoji" aria-hidden>🛟</span>
            <span><strong>Keep an emergency fund</strong>Cash for surprises means you never sell investments in a hurry — Rahul paid a 15% penalty selling his flat.</span>
          </li>
          <li>
            <span className="tut-l-emoji" aria-hidden>🛡️</span>
            <span><strong>Insure the big risks</strong>Health insurance turned a hospital bill into ₹0. In BHAO, equipping a defense is free and doesn’t end your turn.</span>
          </li>
          <li>
            <span className="tut-l-emoji" aria-hidden>🎣</span>
            <span><strong>“Guaranteed returns” = red flag</strong>Hot tips and double-your-money schemes vanish. Check SEBI/RBI registration before you invest.</span>
          </li>
        </ul>
        <div className="tut-btn-row">
          <button type="button" className="tut-btn tut-btn-gold" onClick={onPlay} autoFocus>Play a real game</button>
          <button type="button" className="tut-btn tut-btn-primary" onClick={onLibrary}>Open Gyaan Library</button>
        </div>
        <div className="tut-btn-row" style={{ marginTop: 10 }}>
          <button type="button" className="tut-btn tut-btn-ghost" onClick={onBack}>Back</button>
          <button type="button" className="tut-btn tut-btn-ghost" onClick={onReplay}>{skipped ? 'Play the tutorial' : 'Replay tutorial'}</button>
        </div>
      </motion.div>
    </div>
  )
}
