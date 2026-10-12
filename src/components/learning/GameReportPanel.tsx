import { useEffect, useMemo, useState } from 'react'
import type { GameState } from '../../types/game'
import type { ReportCard as ReportCardData } from '../../types/learning'
import { buildReportCard } from '../../lib/learning'
import { getUnlockedConcepts, unlockConcepts } from '../../lib/libraryProgress'
import { ReportCard } from './ReportCard'

/**
 * Builds the report card for one player of a finished game, saves the concepts it
 * unlocked to the Gyaan Library, and shows which of them are new.
 * Mount it only on the result screen.
 */
export function GameReportPanel({ state, playerId, ownerKey, onOpenLibrary }: {
  state: GameState
  playerId: string
  ownerKey: string
  onOpenLibrary?: () => void
}) {
  const report = useMemo<ReportCardData | null>(() => {
    try {
      return buildReportCard(state, playerId)
    } catch (err) {
      console.error('Report card failed', err)
      return null
    }
  }, [state, playerId])

  // What was unlocked before this result screen appeared (pure read, StrictMode-safe)
  const [unlockedBefore] = useState(() => getUnlockedConcepts(ownerKey))

  const unlockedKey = report?.conceptsUnlocked.join(',') ?? ''
  useEffect(() => {
    if (report && report.conceptsUnlocked.length > 0) unlockConcepts(ownerKey, report.conceptsUnlocked)
  }, [ownerKey, unlockedKey]) // re-run only when the unlocked list changes

  if (!report) return null
  const newlyUnlocked = report.conceptsUnlocked.filter(id => !unlockedBefore.includes(id))
  const stats = state.players.find(p => p.id === playerId)?.stats

  return <ReportCard report={report} stats={stats} newlyUnlocked={newlyUnlocked} onOpenLibrary={onOpenLibrary} />
}
