import { useEffect, useState } from 'react'
import type { ConceptId } from '../../types/learning'
import { LIBRARY_PROGRESS_EVENT, getUnlockedConcepts, getUnseenConcepts } from '../../lib/libraryProgress'

interface Snapshot {
  unlocked: ConceptId[]
  unseen: ConceptId[]
}

function snapshot(ownerKey: string): Snapshot {
  return { unlocked: getUnlockedConcepts(ownerKey), unseen: getUnseenConcepts(ownerKey) }
}

/** Live view of a player's Gyaan Library progress (updates on unlock / markSeen / other tabs). */
export function useLibraryProgress(ownerKey: string): Snapshot {
  const [state, setState] = useState<Snapshot>(() => snapshot(ownerKey))

  useEffect(() => {
    const reload = () => setState(snapshot(ownerKey))
    reload()
    window.addEventListener(LIBRARY_PROGRESS_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(LIBRARY_PROGRESS_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [ownerKey])

  return state
}
