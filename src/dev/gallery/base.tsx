import { useEffect, useState } from 'react'
import { BookOpen, ChartLine, Layers, Menu, PiggyBank, Play, Timer, Wallet, X } from 'lucide-react'
import {
  Avatar, Badge, Button, Chip, DCoin, EmptyState, Input, Modal, PageLoader, Panel, Progress, Segmented, SettingRow,
  Sheet, Skeleton, Switch, Tabs, ToggleChip, Wordmark, useToast,
} from '../../components/ui'
import { Gullu, type GulluMood } from '../../components/mascot/Gullu'
import { GameCard } from '../../components/GameCard'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'
import { ALL_CARDS } from '../../data/cards'
import { BUILTIN_LIFE_EVENTS } from '../../data/lifeEvents'
import type { GameCard as Card } from '../../types/game'
import { formatMoney } from '../../lib/format'
import type { GalleryScreen } from './types'

/** A spread of real cards: decision (rare), attack, shield, life event, legendary, plus long names. */
export function sampleCards(): Card[] {
  const find = (pred: (c: Card) => boolean) => ALL_CARDS.find(pred) ?? BUILTIN_LIFE_EVENTS.find(pred)
  const picks = [
    find(c => c.type === 'decision' && c.tier === 'rare'),
    find(c => c.type === 'action' && !c.lifeEvent && c.category === 'market'),
    find(c => c.type === 'defense' && c.tier === 'rare'),
    BUILTIN_LIFE_EVENTS.find(c => c.category === 'property') ?? BUILTIN_LIFE_EVENTS[0],
    find(c => c.tier === 'legendary' && c.type === 'decision'),
    find(c => c.type === 'action' && c.category === 'tax'),
  ]
  return picks.filter((c): c is Card => !!c)
}

const MOODS: GulluMood[] = ['happy', 'cheer', 'think', 'worried', 'wow']
const SWATCHES = ['--cream-100', '--cream-200', '--sand-400', '--ink-900', '--ink-700', '--teal-800', '--teal-900', '--haldi-400',
  '--spend', '--save', '--invest', '--defence', '--attack', '--risk', '--event', '--opportunity']

function ComponentsPage() {
  const toast = useToast()
  const [sheet, setSheet] = useState<null | 'bottom' | 'side'>(null)
  const [modal, setModal] = useState(false)
  const [seg, setSeg] = useState(2)
  const [tab, setTab] = useState<'home' | 'leaderboard' | 'contracts'>('home')
  const [chip, setChip] = useState(true)
  const [sw, setSw] = useState(true)
  const [code, setCode] = useState('K7Q2M')
  const [showLoader, setShowLoader] = useState(false)
  const cards = sampleCards()

  if (showLoader) return <div onClick={() => setShowLoader(false)}><PageLoader delay={0} /></div>

  return (
    <div className="page">
      <main className="page__main">
        <h1 className="page-title"><Wordmark large /> components</h1>

        <section className="uxg-section"><h2>Colour</h2>
          <div className="uxg-swatches">
            {SWATCHES.map(v => <div key={v} className="uxg-swatch"><i style={{ background: `var(${v})` }} /><span>{v}</span></div>)}
          </div>
        </section>

        <section className="uxg-section"><h2>Buttons</h2>
          <div className="uxg-row">
            <Button size="l" icon={<Play size={20} />}>Play free</Button>
            <Button>Primary</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost link</Button>
            <Button variant="danger">Quit game</Button>
            <Button variant="outline" icon={<X size={22} />} aria-label="Close" />
            <Button size="s">Small</Button>
          </div>
          <div className="uxg-row">
            <Button variant="spend" icon={<Wallet size={18} />}>Spend</Button>
            <Button variant="save" icon={<PiggyBank size={18} />}>Save</Button>
            <Button variant="invest" icon={<ChartLine size={18} />}>Invest</Button>
          </div>
          <div className="surface-table uxg-table uxg-row">
            <Button size="l" icon={<Layers size={20} />}>Draw a card</Button>
            <Button variant="outline">Outline on table</Button>
            <button className="iconbtn" aria-label="Menu"><Menu size={22} /></button>
            <Chip tone="on-dark-risk" icon={<Timer size={14} />}>1:58 left</Chip>
          </div>
        </section>

        <div className="uxg-grid2">
          <section className="uxg-section"><h2>Chips, inputs, tabs</h2>
            <div className="uxg-row">
              <Chip tone="spend">Spend</Chip><Chip tone="save">Save</Chip><Chip tone="invest">Invest</Chip>
              <Chip tone="defence">Shield</Chip><Chip tone="attack">Attack</Chip><Chip tone="risk">Medium risk</Chip><Chip>Locks ₹50K</Chip>
              <ToggleChip pressed={chip} onPressedChange={setChip}>Saving</ToggleChip>
            </div>
            <div className="uxg-row">
              <Input label="Room code" code value={code} onChange={e => setCode(e.target.value.toUpperCase())} hint="Ask your friend for the 5-letter code" maxLength={6} />
              <Input label="Your name" defaultValue="Te" error="Use at least 3 letters" />
            </div>
            <div className="uxg-row">
              <LanguageSwitcher variant="segmented" />
              <LanguageSwitcher />
              <Segmented ariaLabel="Opponents" value={seg} onChange={setSeg} options={[1, 2, 3].map(n => ({ value: n, label: String(n) }))} />
            </div>
            <Tabs ariaLabel="Dashboard" value={tab} onChange={setTab} items={[{ value: 'home', label: 'Home' }, { value: 'leaderboard', label: 'Leaderboard' }, { value: 'contracts', label: 'Contracts' }]} />
            <div className="uxg-row" style={{ marginTop: 16 }}>
              <Progress value={12.4} max={50} tone="goal" label={`${formatMoney(1240000, { compact: true })} of ${formatMoney(5000000, { compact: true })}`} ariaLabel="Goal" />
            </div>
            <div className="uxg-row">
              <Avatar name="Tester" me /><Avatar name="Rahul" seat={0} /><Avatar name="Priya" seat={1} size="s" rank={3} /><Avatar name="Bot Aman" seat={2} bot />
              <span style={{ position: 'relative', display: 'inline-block' }}><button className="iconbtn" aria-label="Chat, 3 unread"><BookOpen size={20} /></button><Badge count={3} float /></span>
              <span className="chip"><DCoin /> 240 Daanik Coins</span>
            </div>
            <div className="uxg-row">
              <Button variant="outline" onClick={() => toast.show('Shield equipped: Health insurance', { tone: 'success' })}>Show toast</Button>
              <Button variant="outline" onClick={() => setSheet('bottom')}>Bottom sheet</Button>
              <Button variant="outline" onClick={() => setSheet('side')}>Side panel</Button>
              <Button variant="outline" onClick={() => setModal(true)}>Modal</Button>
              <Button variant="outline" onClick={() => setShowLoader(true)}>Page loader</Button>
            </div>
            <Panel>
              <SettingRow label="Sound"><Switch checked={sw} onChange={setSw} label="Sound" /></SettingRow>
              <SettingRow label="Reduce effects"><Switch checked={!sw} onChange={v => setSw(!v)} label="Reduce effects" /></SettingRow>
            </Panel>
          </section>

          <section className="uxg-section"><h2>Gullu</h2>
            <div className="uxg-moods">
              {MOODS.map(m => <figure key={m}><Gullu mood={m} size={84} /><figcaption>{m}</figcaption></figure>)}
            </div>
            <div className="uxg-row" style={{ marginTop: 16, alignItems: 'stretch' }}>
              <Panel><EmptyState title="No money ideas yet" body="Play your first game to unlock them." action={<Button size="s">Play now</Button>} /></Panel>
              <Panel style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton width="60%" /><Skeleton height={64} /><Skeleton height={64} />
              </Panel>
            </div>
          </section>
        </div>

        <section className="uxg-section"><h2>Game cards</h2>
          <div className="surface-table uxg-table">
            <div className="uxg-row">{cards.map(c => <GameCard key={c.id} card={c} size="full" />)}</div>
            <div className="uxg-row">
              {cards.map((c, i) => (
                <GameCard key={c.id} card={c} size="hand" onClick={() => {}} state={i === 0 ? 'selected' : i === 2 ? 'locked' : 'idle'} />
              ))}
              {cards[0] && <GameCard card={cards[0]} size="sheet" />}
              {cards[1] && <GameCard card={cards[1]} size="mini" />}
              {cards[0] && <GameCard card={cards[0]} size="mini" state="faceDown" />}
            </div>
          </div>
        </section>
      </main>

      <Sheet open={sheet !== null} onClose={() => setSheet(null)} placement={sheet ?? 'auto'} title="Diwali Bonus"
        footer={<Button block size="l" onClick={() => setSheet(null)}>Start level</Button>}>
        <p className="lede">Your company pays a ₹50,000 festival bonus. What will you do with it?</p>
        {Array.from({ length: 6 }, (_, i) => <p key={i} style={{ marginTop: 12 }}>Scrollable sheet body line {i + 1}.</p>)}
      </Sheet>
      <Modal open={modal} onClose={() => setModal(false)} gullu="worried" title="Quit this game?" body="Your progress in this game will be lost."
        actions={<><Button onClick={() => setModal(false)}>Keep playing</Button><Button variant="danger" onClick={() => setModal(false)}>Quit game</Button></>} />
    </div>
  )
}

/** Every card at hand size. Names that need more than 3 lines get data-overflow="true" (spec §A.2 q2 content list). */
function AllCardsPage() {
  const all = [...ALL_CARDS, ...BUILTIN_LIFE_EVENTS]
  const [size, setSize] = useState<'hand' | 'full'>('hand')
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('.uxg-cards .gcard__name').forEach(el => {
        el.closest('.gcard')?.setAttribute('data-overflow', String(el.scrollHeight > el.clientHeight + 1))
      })
    })
    return () => cancelAnimationFrame(id)
  })
  return (
    <div className="page">
      <main className="page__main">
        <h1 className="page-title">All cards ({all.length})</h1>
        <Segmented ariaLabel="Size" value={size} onChange={setSize} options={[{ value: 'hand', label: 'Hand' }, { value: 'full', label: 'Full' }]} />
        <div className="surface-table uxg-table uxg-row uxg-cards" style={{ marginTop: 16 }}>
          {all.map(c => <GameCard key={c.id} card={c} size={size} />)}
        </div>
      </main>
    </div>
  )
}

export const BASE_SCREENS: GalleryScreen[] = [
  { path: 'components', title: 'Base components', group: 'Foundation', render: () => <ComponentsPage /> },
  { path: 'cards', title: 'All cards (hand / full)', group: 'Foundation', note: 'overflowing names get data-overflow="true"', render: () => <AllCardsPage /> },
]
