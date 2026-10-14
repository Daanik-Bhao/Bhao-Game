/**
 * Minimum age to use BHAO: the single source of truth for every place the age is shown
 * (Landing footer, Privacy Policy, Terms, key points). Locale strings take it as {{age}}.
 *
 * The owner has not yet chosen between "18+ only" and "13+ with parental consent"
 * (India's DPDP Act 2023 treats everyone under 18 as a child). Read docs/age-policy.md
 * before changing it, and update the Play Console target audience and
 * docs/play-store.md in the same release.
 */
export const MIN_AGE = 13

/** Age of majority (DPDP Act 2023: a "child" is anyone under 18). */
export const ADULT_AGE = 18

/** True while the app admits players younger than ADULT_AGE (the under-18 wording is shown). */
export const ADMITS_MINORS = MIN_AGE < ADULT_AGE
