import { useEffect, useState } from 'react'
import { ARTHA_YATRA_LEVELS } from '../../data/levels'
import { ALL_CONCEPT_IDS } from '../../data/concepts'
import { CAMPAIGN_PROGRESS_EVENT, getLevelStars, isLevelUnlocked } from '../../lib/campaignProgress'
import { useLibraryProgress } from '../../components/learning/useLibraryProgress'

/**
 * Same key as `TUTORIAL_DONE_KEY` in src/data/tutorialScript.ts (written by markTutorialDone()
 * when the tutorial ends). Duplicated here so Home does not pull the whole card catalogue into
 * its chunk; src/pages/menus/__tests__/homeData.test.ts keeps the two in sync.
 */
export const TUTORIAL_DONE_STORAGE_KEY = 'bhao_tutorial_done'

export function readTutorialDone(): boolean {
  try {
    return !!localStorage.getItem(TUTORIAL_DONE_STORAGE_KEY)
  } catch {
    return false
  }
}

/** What the teal hero card on Home offers next (spec §E.4 "Hero logic"). */
export type HomeHero =
  | { kind: 'tutorial' }
  | { kind: 'level'; levelId: string; /** 1-based */ number: number; stars: number }
  | { kind: 'practice' }

export const LEVEL_IDS = ARTHA_YATRA_LEVELS.map(l => l.id)

/**
 * Tutorial never completed → tutorial. Otherwise the next campaign level that is unlocked but
 * not yet 3-starred: a never-played unlocked level first (the newest step), else the first
 * unlocked level that still misses stars. All levels 3-starred → Practice.
 */
export function computeHero(tutorialDone: boolean, levelIds: string[], stars: Record<string, number>): HomeHero {
  if (!tutorialDone) return { kind: 'tutorial' }
  const open = levelIds
    .map((id, i) => ({ id, number: i + 1, stars: Math.min(3, stars[id] ?? 0) }))
    .filter(l => isLevelUnlocked(levelIds, l.id, stars) && l.stars < 3)
  const next = open.find(l => l.stars === 0) ?? open[0]
  return next ? { kind: 'level', levelId: next.id, number: next.number, stars: next.stars } : { kind: 'practice' }
}

/** Live hero for a progress owner (re-reads on campaign progress / storage changes). */
export function useHomeHero(ownerKey: string): HomeHero {
  const read = () => computeHero(readTutorialDone(), LEVEL_IDS, getLevelStars(ownerKey))
  const [hero, setHero] = useState<HomeHero>(read)
  useEffect(() => {
    const reload = () => setHero(computeHero(readTutorialDone(), LEVEL_IDS, getLevelStars(ownerKey)))
    reload()
    window.addEventListener(CAMPAIGN_PROGRESS_EVENT, reload)
    window.addEventListener('storage', reload)
    window.addEventListener('focus', reload)
    return () => {
      window.removeEventListener(CAMPAIGN_PROGRESS_EVENT, reload)
      window.removeEventListener('storage', reload)
      window.removeEventListener('focus', reload)
    }
  }, [ownerKey])
  return hero
}

export interface LibraryCount { unlocked: number; total: number; unseen: number }

/** Gyaan Library progress for the Home ring ("4/22"), from the real library progress. */
export function useLibraryCount(ownerKey: string): LibraryCount {
  const { unlocked, unseen } = useLibraryProgress(ownerKey)
  return {
    unlocked: ALL_CONCEPT_IDS.filter(id => unlocked.includes(id)).length,
    total: ALL_CONCEPT_IDS.length,
    unseen: unseen.length,
  }
}

/** Campaign level facts for the hero card. */
export function levelInfo(levelId: string) {
  const level = ARTHA_YATRA_LEVELS.find(l => l.id === levelId) ?? ARTHA_YATRA_LEVELS[0]
  return { name: level.name, age: level.ageRange.replace('-', '–'), rule: level.rule as string, total: ARTHA_YATRA_LEVELS.length }
}
