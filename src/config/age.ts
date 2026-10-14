/**
 * Minimum age to use BHAO: the single source of truth for every place the age is shown
 * (Landing footer, Privacy Policy, Terms, key points). Locale strings take it as {{age}}.
 *
 * Owner decision (2026-10-14): keep 13+ with an age question and verifiable parental consent
 * for 13–17 (India's DPDP Act 2023 treats everyone under 18 as a child; Option B in
 * docs/age-policy.md, see src/lib/ageBand.ts and src/config/consent.ts). Read docs/age-policy.md
 * before changing it, and update the Play Console target audience and
 * docs/play-store.md in the same release.
 */
export const MIN_AGE = 13

/** Age of majority (DPDP Act 2023: a "child" is anyone under 18). */
export const ADULT_AGE = 18

/** True while the app admits players younger than ADULT_AGE (the under-18 wording is shown). */
export const ADMITS_MINORS = MIN_AGE < ADULT_AGE
