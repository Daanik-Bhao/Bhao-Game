/**
 * Age bands (docs/age-policy.md, Option B). Pure helpers shared by the app and the
 * `parent-consent` edge function bundle: no browser or Deno APIs here.
 *
 * Only the band is ever stored (on the device or on the server), never the birth year.
 *
 * The question asks for a year of birth only, so the age is known to within one year:
 * someone born in year Y turns (currentYear - Y) at some point this year. The two edges
 * are read differently on purpose:
 *  - lower edge (MIN_AGE): turning 13 this year counts as 13 (lenient; self-declared);
 *  - adult edge (ADULT_AGE): turning 18 this year still counts as a child, so consent is
 *    asked for (conservative; the DPDP Act treats everyone under 18 as a child).
 */
import { ADULT_AGE, MIN_AGE } from '../config/age'

export type AgeBand = 'under13' | '13to17' | 'adult'
/** Bands that may have an account (an under-13 answer never creates one). */
export type AccountAgeBand = Exclude<AgeBand, 'under13'>

export const AGE_BANDS: readonly AgeBand[] = ['under13', '13to17', 'adult']

/** Oldest year offered in the year-of-birth picker (years before the current one). */
export const OLDEST_BIRTH_YEAR_OFFSET = 100

export function isAgeBand(v: unknown): v is AgeBand {
  return typeof v === 'string' && (AGE_BANDS as readonly string[]).includes(v)
}

/** Age (in whole years) someone born in `birthYear` reaches during `currentYear`. */
export function ageInYear(birthYear: number, currentYear: number): number {
  return currentYear - birthYear
}

/** True when `birthYear` is a plausible year of birth (not in the future, not > 100 years ago). */
export function isPlausibleBirthYear(birthYear: unknown, currentYear: number): birthYear is number {
  return typeof birthYear === 'number' && Number.isInteger(birthYear)
    && birthYear <= currentYear && birthYear >= currentYear - OLDEST_BIRTH_YEAR_OFFSET
}

/** Band for a year of birth (see the edge rules above). */
export function ageBandFromBirthYear(birthYear: number, currentYear: number): AgeBand {
  const age = ageInYear(birthYear, currentYear)
  if (age < MIN_AGE) return 'under13'
  if (age <= ADULT_AGE) return '13to17'
  return 'adult'
}

/**
 * Parent check on the consent page: the parent's year of birth must show they are an
 * adult for sure (they turn 19 or more this year, so they are at least 18 today).
 */
export function isAdultBirthYear(birthYear: unknown, currentYear: number): boolean {
  return isPlausibleBirthYear(birthYear, currentYear) && ageInYear(birthYear, currentYear) > ADULT_AGE
}
