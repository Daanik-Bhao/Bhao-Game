import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { CoachMark } from '../components/tutorial/CoachMark'
import { TutorialHook, TutorialSummary } from '../components/tutorial/TutorialScreens'
import { LESSON_COUNT, STEPS, StepCtx, tutorialCardTitle } from '../components/tutorial/steps'
import { TutorialModal } from '../components/TutorialModal'
import { useBackButton, useKeepAwake } from '../hooks/useBackButton'
import {
  advanceTurn, canEquip, doBotTurn, equipDefense, getNetWorth, passTurn, previewDecision, processDecision,
  seededRng, setRng, startDrawPhase,
} from '../lib/gameEngine'
import {
  CARD_IDS, TUTORIAL_BOT_POLICY, TUTORIAL_PLAYER_ID, TUTORIAL_SEED, buildTutorialState, isCard, markTutorialDone,
} from '../data/tutorialScript'
import { playSound } from '../lib/audio'
import { localizeEngineText } from '../components/game/economyUi'
import type { GameCard, GameState } from '../types/game'

type Stage = 'hook' | 'play' | 'summary'

const ME = 0
const BOT_DELAY_MS = 1800
/** Turn timers don't apply in the tutorial: a start time far in the future keeps the ring full. */
const FROZEN_TURN_START = () => Date.now() + 365 * 24 * 60 * 60 * 1000

/**
 * Guided first match on the real engine + real GameBoard (docs/phase4-design.md §5).
 * The script (decks, seed, Rahul's policy) lives in src/data/tutorialScript.ts;
 * coach-mark steps in src/components/tutorial/steps.ts.
 */
export function TutorialGame() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [stage, setStage] = useState<Stage>('hook')
  const [showRules, setShowRules] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [gs, setGs] = useState<GameState>(() => buildTutorialState(t('board.you')))
  const [uiPhase, setUiPhase] = useState<UIPhase>('playing')
  const [stepIdx, setStepIdx] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  /** Android back during the guided match asks before skipping out. */
  const [confirmExit, setConfirmExit] = useState(false)
  const gsRef = useRef(gs)
  gsRef.current = gs

  const step = STEPS[Math.min(stepIdx, STEPS.length - 1)]
  const ctx: StepCtx = useMemo(() => ({ gs, uiPhase }), [gs, uiPhase])

  // Restore the normal random source when leaving the page.
  useEffect(() => () => setRng(), [])

  const nudge = useCallback((msg: string) => {
    setNotice(msg)
  }, [])
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])

  const start = () => {
    // Same seed + same decks = the same story every time.
    setRng(seededRng(TUTORIAL_SEED))
    const fresh = buildTutorialState(t('board.you'))
    setGs({ ...fresh, turnStartTime: FROZEN_TURN_START() })
    setUiPhase('playing')
    setStepIdx(0)
    setSkipped(false)
    setStage('play')
  }

  const finish = useCallback((wasSkipped: boolean) => {
    markTutorialDone()
    setRng()
    setSkipped(wasSkipped)
    setConfirmExit(false)
    setStage('summary')
  }, [])

  // Your turn: draw automatically (the real game has a Draw button; one less thing to explain here).
  useEffect(() => {
    if (stage !== 'play') return
    if (gs.phase === 'game_over') { finish(false); return }
    if (gs.currentPlayerIndex === ME && gs.phase === 'draw') {
      const drawn = startDrawPhase(gs, ME).state
      setGs({ ...drawn, phase: 'play', turnStartTime: FROZEN_TURN_START() })
    }
  }, [gs, stage, finish])

  // Rahul's turn: only while the current step lets him play.
  useEffect(() => {
    if (stage !== 'play' || !step.allowBot) return
    if (gs.phase === 'game_over' || !gs.players[gs.currentPlayerIndex]?.isBot) return
    const t = setTimeout(() => {
      const next = doBotTurn(gsRef.current, TUTORIAL_BOT_POLICY).state
      setGs({ ...next, turnStartTime: FROZEN_TURN_START() })
    }, BOT_DELAY_MS)
    return () => clearTimeout(t)
  }, [gs, stage, step.allowBot])

  // Action / wait steps advance when the board reaches the expected state.
  useEffect(() => {
    if (stage !== 'play') return
    if (step.kind !== 'next' && step.done?.(ctx)) {
      setNotice(null)
      setStepIdx(i => i + 1)
    }
  }, [ctx, step, stage])

  // Backed out of the decision sheet during the invest lesson: go back to "pick the card".
  useEffect(() => {
    if (stage !== 'play') return
    const backedOut = uiPhase !== 'decision' && !gs.pendingDecision && gs.currentPlayerIndex === ME && (gs.round ?? 1) === 1
    if ((step.id === 'preview' || step.id === 'invest') && backedOut) {
      setStepIdx(STEPS.findIndex(s => s.id === 'pickChai'))
    }
  }, [step.id, uiPhase, stage, gs])

  const onNext = () => {
    if (stepIdx >= STEPS.length - 1) finish(false)
    else setStepIdx(i => i + 1)
  }

  // ---------------------------------------------------------------------------
  // Board handlers: the real engine, gated to what the current step teaches.
  // ---------------------------------------------------------------------------
  const myTurn = gs.currentPlayerIndex === ME && gs.phase === 'play'

  const openDecision = (card: GameCard) => {
    setGs({ ...gs, pendingDecision: { card, playerIndex: ME }, pendingTarget: null })
    setUiPhase('decision')
  }

  const handlePlayCard = (card: GameCard) => {
    if (!myTurn) return
    if (card.type === 'defense') { handleEquip(card); return }
    switch (step.id) {
      case 'pickChai':
        if (!isCard(card, CARD_IDS.chai)) return nudge(t('tutorial.nudge.playChai', { card: tutorialCardTitle(CARD_IDS.chai) }))
        return openDecision(card)
      case 'pickSave':
        if (card.type !== 'decision') return nudge(t('tutorial.nudge.decisionSave'))
        return openDecision(card)
      case 'equip':
        return nudge(t('tutorial.nudge.equipFirst'))
      case 'freePlay':
        if (card.type !== 'decision') return nudge(t('tutorial.nudge.decision'))
        return openDecision(card)
      default:
        return nudge(step.kind === 'next' ? t('tutorial.nudge.tapNext') : t('tutorial.nudge.wait'))
    }
  }

  const handleDecision = (choice: 'spend' | 'save' | 'invest') => {
    const pending = gs.pendingDecision
    if (!pending || !myTurn) return
    if (step.id === 'preview') return nudge(t('tutorial.nudge.readTip'))
    if (step.id === 'invest' && choice !== 'invest') return nudge(t('tutorial.nudge.chooseInvest'))
    if (step.id === 'pickSave' && choice !== 'save') return nudge(t('tutorial.nudge.chooseSave'))
    if (step.id !== 'invest' && step.id !== 'pickSave' && step.id !== 'freePlay') return
    const pv = previewDecision(gs, ME, pending.card, choice)
    if (pv.disabled) return nudge(localizeEngineText(pv.disabled))
    const decided = processDecision(gs, ME, choice, pending.card)
    const next = decided.phase === 'game_over' ? decided : advanceTurn(decided)
    setGs({ ...next, pendingDecision: null, turnStartTime: FROZEN_TURN_START() })
    setUiPhase('playing')
    playSound('play')
  }

  const handleEquip = (card: GameCard) => {
    if (!myTurn) return
    if (step.id !== 'equip' && step.id !== 'freePlay') return nudge(t('tutorial.nudge.defenseSoon'))
    if (!canEquip(gs, ME, card)) return nudge(t('tutorial.nudge.oneEquip'))
    setGs(equipDefense(gs, ME, card))
    playSound('play')
  }

  const handlePass = (cardId: string) => {
    if (!myTurn) return
    if (step.id !== 'freePlay') return nudge(t('tutorial.nudge.noPass'))
    const next = passTurn({ ...gs, pendingDecision: null }, ME, cardId)
    setGs({ ...next, turnStartTime: FROZEN_TURN_START() })
    setUiPhase('playing')
  }

  const handleBack = () => {
    setGs({ ...gs, pendingDecision: null, pendingTarget: null })
    setUiPhase('playing')
  }

  // --- Android back button + keep-awake ---
  const playing = stage === 'play'
  useKeepAwake(playing)
  // Never silently leave the match: back out of the decision sheet, else confirm the exit.
  useBackButton(() => {
    if (uiPhase === 'decision' || uiPhase === 'targeting') { handleBack(); return }
    setConfirmExit(true)
  }, playing)
  useBackButton(() => setConfirmExit(false), playing && confirmExit)
  useBackButton(() => setShowRules(false), stage === 'hook' && showRules)

  // ---------------------------------------------------------------------------

  if (stage === 'hook') {
    return (
      <>
        <TutorialHook onStart={start} onSkip={() => finish(true)} onRules={() => setShowRules(true)} />
        {showRules && <TutorialModal onClose={() => setShowRules(false)} onStartTutorial={() => { setShowRules(false); start() }} />}
      </>
    )
  }

  if (stage === 'summary') {
    return (
      <TutorialSummary
        skipped={skipped}
        yourNetWorth={skipped ? undefined : getNetWorth(gs.players[0])}
        rahulNetWorth={skipped ? undefined : getNetWorth(gs.players[1])}
        onPlay={() => navigate('/game?mode=practice')}
        onLibrary={() => navigate('/library')}
        onBack={() => navigate('/dashboard')}
        onReplay={start}
      />
    )
  }

  return (
    <div className="tut-board-page">
      <GameBoard
        gameState={gs}
        myPlayerId={TUTORIAL_PLAYER_ID}
        isMultiplayer={false}
        showOpponents
        uiPhase={uiPhase}
        onDrawCard={() => {}}
        onPlayCard={handlePlayCard}
        onTargetSelect={() => {}}
        onDecision={handleDecision}
        onTimeout={() => {}}
        onCancelTargeting={handleBack}
        daanikCoins={0}
        onBuyExtraCard={() => {}}
        onPass={handlePass}
        onEquip={handleEquip}
      />
      <CoachMark
        stepKey={step.id}
        kind={step.kind}
        title={step.title()}
        body={step.body(ctx)}
        todo={step.todo?.(ctx)}
        target={step.target(ctx)}
        handIds={gs.players[0].hand.map(c => c.id)}
        lesson={step.lesson}
        lessons={LESSON_COUNT}
        notice={notice}
        onNext={onNext}
        onSkip={() => finish(true)}
      />
      {confirmExit && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('common.confirmForfeit')}
          onClick={() => setConfirmExit(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,10,6,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fffdf3', color: '#12261d', borderRadius: 16, border: '2px solid #ffd050', padding: 20, width: '100%', maxWidth: 380, boxShadow: '0 18px 40px rgba(0,0,0,0.45)', fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>{t('common.confirmForfeit')}</div>
            <div className="tut-btn-row">
              <button type="button" className="tut-btn tut-btn-primary" autoFocus onClick={() => setConfirmExit(false)}>{t('common.stayInGame')}</button>
              <button type="button" className="tut-btn tut-btn-ghost" onClick={() => finish(true)}>{t('tutorial.skip')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
