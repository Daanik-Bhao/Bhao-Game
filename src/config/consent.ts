/**
 * Parental consent settings (docs/age-policy.md, Option B). Shared by the app and the
 * `parent-consent` edge function bundle, so keep this file free of browser/Deno APIs.
 */

/**
 * Version of the notice shown to parents on /parent-consent. Bump it whenever the
 * parent page's "what we collect / child limits" text changes; it is stored with each
 * consent record so we can tell which notice a parent agreed to.
 */
export const CONSENT_NOTICE_VERSION = '2026-10-14'

/** Consent links expire after this many days. */
export const CONSENT_TOKEN_TTL_DAYS = 7

/** A child can ask for a consent email at most this often (seconds between sends). */
export const CONSENT_RESEND_COOLDOWN_SECONDS = 60

/** Per child: at most this many consent emails per rolling day. */
export const CONSENT_MAX_EMAILS_PER_CHILD_PER_DAY = 5

/** Per parent address: at most this many consent emails per rolling day (all children). */
export const CONSENT_MAX_EMAILS_PER_PARENT_PER_DAY = 5

/**
 * How the parent's consent was obtained. Today only an emailed single-use link plus the
 * parent's declaration (name + adult year of birth + "I am the parent/guardian").
 * TODO(dpdp): the DPDP Rules may require a stronger, verifiable method (e.g. a DigiLocker
 * virtual token or reliable age/identity details already held). Add it here and to the
 * `parental_consents.method` CHECK constraint; see docs/age-policy.md.
 */
export const CONSENT_METHODS = ['email_link_declaration'] as const
export type ConsentMethod = typeof CONSENT_METHODS[number]

/** Account states on the server (`profiles.consent_status`). */
export type ConsentStatus = 'unknown' | 'not_required' | 'pending_consent' | 'active_minor'

/** Under-13 answer on a device: guest play is blocked for this long before the question is asked again. */
export const UNDER_AGE_COOLDOWN_MS = 24 * 60 * 60 * 1000
