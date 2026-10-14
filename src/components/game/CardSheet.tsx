import { useTranslation } from 'react-i18next'
import { Play, Shield, Swords, X } from 'lucide-react'
import type { GameCard, GameState } from '../../types/game'
import { Button, Chip, Sheet } from '../ui'
import { GameCard as GameCardView, cardFlavor, cardIcon, cardKind, cardTitle, cardFullTitle } from '../GameCard'
import { formatMoney } from '../../lib/format'
import { getCash, getNetWorth } from '../../lib/gameEngine'
import { ChoiceTiles } from './EconomyPanels'
import { cardPlayability } from './economyUi'
import type { BoardModel } from './GameBoard'

const KIND_TONE = { decision: 'risk', attack: 'attack', shield: 'defence', lifeEvent: 'event' } as const

/** Header: sheet-size card + type / tier chips + name + flavor (spec §E.13). */
function CardSheetHeader({ card }: { card: GameCard }) {
  const { t, i18n } = useTranslation()
  const kind = cardKind(card)
  const Icon = cardIcon(card)
  return (
    <div className="cardsheet__head">
      <GameCardView card={card} size="sheet" className="cardsheet__card" />
      <div className="cardsheet__info">
        <div className="cardsheet__chips">
          <Chip tone={KIND_TONE[kind]} icon={<Icon size={13} strokeWidth={2.5} aria-hidden="true" />}>{t(`card.type.${kind}`)}</Chip>
          <Chip icon={<i className={`cardsheet__gem gem--${card.tier}`} aria-hidden="true" />}>{t(`card.tier.${card.tier}`)}</Chip>
        </div>
        <h2 className="cardsheet__title">{cardFullTitle(card, i18n.language)}</h2>
        <p className="cardsheet__flavor">{cardFlavor(card, i18n.language)}</p>
      </div>
    </div>
  )
}

/** Inline "Discard X and end your turn? [Keep card] [Pass]" (first pass per match). */
function PassControl({ m, card, gs }: { m: BoardModel; card: GameCard; gs: GameState }) {
  const { t, i18n } = useTranslation()
  if (!m.p.onPass) return null
  const name = cardTitle(card, i18n.language)
  if (m.passConfirmFor === card.id) {
    return (
      <div className="pass-confirm" role="group" aria-label={t('board.passConfirm', { card: name })}>
        <p>{t('board.passConfirm', { card: name })}</p>
        <div className="pass-confirm__btns">
          <Button variant="outline" size="s" onClick={m.cancelPass} data-autofocus>{t('board.keepCard')}</Button>
          <Button variant="danger" size="s" onClick={() => m.pass(card.id, gs)}>{t('econ.hand.pass')}</Button>
        </div>
      </div>
    )
  }
  return (
    <Button variant="ghost" className="btn--muted pass-btn" icon={<X size={16} strokeWidth={2.5} aria-hidden="true" />} onClick={() => m.pass(card.id, gs)}>
      {t('board.passLine')}
    </Button>
  )
}

/** Card sheet = decision / inspect / equip / pass (spec §E.13). Bottom sheet or side panel by viewport. */
export function CardSheet({ m }: { m: BoardModel }) {
  const { t, i18n } = useTranslation()
  const gs = m.gs
  const card = m.sheetCard
  const open = !!card
  const lang = i18n.language

  let body = null
  let footer = null
  if (card && m.me) {
    const kind = cardKind(card)
    const myPlay = m.state === 'play' || m.state === 'decision'
    const play = cardPlayability(gs, m.meIndex, card, myPlay)
    const inDecision = m.state === 'decision' && gs.pendingDecision?.card.id === card.id
    const readOnlyNote = m.state === 'draw' ? t('board.drawFirst') : !myPlay ? t('board.waitTurn') : null
    const pass = myPlay ? <PassControl m={m} card={card} gs={gs} /> : null

    if (card.type === 'decision') {
      body = (
        <>
          <div className="cardsheet__money">
            <span>{t('econ.cash')} <b className="num">{formatMoney(getCash(m.me), { lang })}</b></span>
            <span>{t('econ.netWorth')} <b className="num">{formatMoney(getNetWorth(m.me), { lang })}</b></span>
          </div>
          <ChoiceTiles state={gs} playerIndex={m.meIndex} card={card} onDecision={m.p.onDecision} disabled={!inDecision} />
        </>
      )
      footer = readOnlyNote
        ? <p className="cardsheet__note">{readOnlyNote}</p>
        : !inDecision
          ? <><Button variant="primary" block onClick={() => m.p.onPlayCard(card)}>{t('board.chooseNow')}</Button>{pass}</>
          : pass
    } else {
      const targeted = card.type === 'action' && card.effect?.target === 'target' && m.targetIndices.length > 1
      let cta = null
      if (!readOnlyNote) {
        if (card.type === 'action') {
          cta = (
            <Button variant="primary" size="l" block icon={targeted ? <Swords size={20} strokeWidth={2.25} aria-hidden="true" /> : <Play size={20} strokeWidth={2.25} aria-hidden="true" />} onClick={() => m.playFromSheet(card)}>
              {targeted ? t('board.playTarget') : t('board.play')}
            </Button>
          )
        } else if (card.type === 'defense') {
          cta = (
            <>
              <Button variant="primary" size="l" block disabled={!play.ok} icon={<Shield size={20} strokeWidth={2.25} aria-hidden="true" />} onClick={() => m.equipFromSheet(card)}>
                {t('board.equipFree')}
              </Button>
              {!play.ok && play.reason && <p className="cardsheet__note">{play.reason}</p>}
            </>
          )
        } else {
          cta = <Button variant="primary" size="l" block onClick={m.closeSheet}>{t('common.ok')}</Button>
        }
      }
      body = kind === 'lifeEvent' ? <p className="cardsheet__note">{t('board.lifeEventInfo')}</p> : null
      footer = readOnlyNote ? <p className="cardsheet__note">{readOnlyNote}</p> : <>{cta}{pass}</>
    }
  }

  return (
    <Sheet
      open={open}
      onClose={m.closeSheet}
      title={card ? cardFullTitle(card, lang) : ''}
      header={card ? <CardSheetHeader card={card} /> : undefined}
      footer={footer}
      className="cardsheet"
    >
      {body}
    </Sheet>
  )
}
