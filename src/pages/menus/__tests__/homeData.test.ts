import { describe, expect, it } from 'vitest'
import { TUTORIAL_DONE_KEY } from '../../../data/tutorialScript'
import { TUTORIAL_DONE_STORAGE_KEY, computeHero } from '../homeData'

const IDS = ['level_1', 'level_2', 'level_3', 'level_4']

describe('Home hero (spec §E.4 hero logic)', () => {
  it('uses the same storage key as the tutorial', () => {
    expect(TUTORIAL_DONE_STORAGE_KEY).toBe(TUTORIAL_DONE_KEY)
  })

  it('tutorial never completed → tutorial', () => {
    expect(computeHero(false, IDS, { level_1: 3 })).toEqual({ kind: 'tutorial' })
  })

  it('fresh player after the tutorial → level 1', () => {
    expect(computeHero(true, IDS, {})).toEqual({ kind: 'level', levelId: 'level_1', number: 1, stars: 0 })
  })

  it('prefers the newly unlocked level over replaying a 1-star level', () => {
    expect(computeHero(true, IDS, { level_1: 1 })).toEqual({ kind: 'level', levelId: 'level_2', number: 2, stars: 0 })
  })

  it('all unlocked levels played but not 3-starred → first one missing stars', () => {
    expect(computeHero(true, IDS, { level_1: 3, level_2: 2, level_3: 1, level_4: 1 })).toEqual({ kind: 'level', levelId: 'level_2', number: 2, stars: 2 })
  })

  it('everything 3-starred → practice', () => {
    expect(computeHero(true, IDS, { level_1: 3, level_2: 3, level_3: 3, level_4: 3 })).toEqual({ kind: 'practice' })
  })
})
