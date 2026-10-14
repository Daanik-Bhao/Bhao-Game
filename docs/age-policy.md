# Minimum age: decision note

**Status (2026-10-14): owner chose Option B, keep 13+ and add verifiable parental consent for 13–17.
Implemented in code (see "Option B as built" at the end); not deployed yet (Supabase keys pending), and the
open legal questions listed there still need a lawyer.** The comparison below is kept for the record.
This note compares the two realistic options and what each one
needs in code, in Play Console and in the legal text. It is an engineering summary, **not legal advice**:
have a lawyer who knows India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the DPDP
Rules review the choice before the wider launch.

## Where we were before Option B (kept for context)

- `src/config/age.ts` → `MIN_AGE = 13`. It is the only place the number lives: the Landing footer, the
  Privacy Policy, the Terms and the "In short" box read it through i18n (`{{age}}`).
  `ADMITS_MINORS` (`MIN_AGE < 18`) switches the extra "if you are under 18" sentences on or off.
- Play Console plan (docs/play-store.md §4): target audience 13–15, 16–17, 18+.
- The legal text asks under-18s to "use BHAO with the consent of a parent or guardian", but the app
  **does not ask for or verify** that consent. There is no age question anywhere in the app.
- An account stores personal data on our servers (email, username, game history, reports; see
  docs/play-store.md §5). Guest play keeps data on the device only.

The DPDP Act treats **everyone under 18 as a child**. Section 9 says that before processing a child's
personal data we must get **verifiable consent of a parent or lawful guardian**, must not process it in
a way likely to harm the child's well-being, and must not track or behaviourally monitor children or
target ads at them. The DPDP Rules describe how verifiable consent can be obtained (for example using
reliable age/identity details already held, or a virtual token from an authorised entity such as
DigiLocker) and phase most obligations in after notification. **(verify)** the dates that apply to us.

So "13+ and a polite sentence" is the one option that does not hold up once those obligations apply.
The real choice is between the two options below.

## Option A: 18+ only

| Area | What it takes |
|---|---|
| Code | Set `MIN_AGE = 18` (legal text and footer update themselves; the under-18 sentences disappear). Add a **neutral age question** (year of birth, not "Are you 18+? Yes/No") before creating an account: email sign-up and first Google sign-in. If the answer is under 18, don't create the account and say why. Store only the fact that the check passed (e.g. `profiles.age_confirmed_at`), not the birth year. Decide whether offline guest play also gets the question (recommended: yes, once per device, so the app's message is consistent). |
| Play Console | Target audience: **18 and over only**. Store listing: "BHAO is for players 18 and older." Expect the "could appeal to children" question (cartoony art, mascot): answer that it is a money-skills game for adults with a sign-up age check. |
| Legal text | Mostly automatic via `MIN_AGE`. Privacy §11 "Children" then says we don't knowingly collect data from anyone under 18 and delete such accounts when we learn of them. |
| Effort | Small: about 1–2 days (age question UI in 3 languages, one column or flag, tests, store copy). |
| Trade-off | Shuts out school students (13–17), which is a big part of the intended audience (Campaign level 1 is the 13–18 life stage). Self-declared age is a common practice for adult-only services but is not proof; ask the lawyer whether it is enough. |

## Option B: 13+ with verifiable parental consent

| Area | What it takes |
|---|---|
| Code | **Age question** at account creation (as in A). For under-18s: an account in a *pending* state that stores nothing server-side beyond what the consent flow needs, a **parent consent flow** (parent's email or phone, a consent link, verification of the parent through a mechanism the DPDP Rules accept), a `parental_consents` record (child account, parent contact, method, time, notice version), **withdrawal** by the parent (which deletes the account) and a way for parents to contact us. Child-safe defaults: no Sentry Session Replay or performance tracing for child accounts (likely "behavioural monitoring"), consider hiding minors from public leaderboards, and consider limiting text/voice chat with strangers (friends-only rooms) for under-18s. Needs an email/SMS sender (Supabase Edge Function + provider) and possibly a paid verification provider. |
| Play Console | Target audience 13–15, 16–17, 18+ (never under 13, so the Families policy does not apply). Teen-directed apps with chat get closer review: keep the UGC controls in §6 and the report review routine working. |
| Legal text | New sections: how parental consent works, what a parent can see or delete, the child-specific limits above, and a grievance contact. Update Terms §3 ("you need a parent's consent and we will verify it"). |
| Effort | Large: roughly 2–4 weeks of design, build, translation and testing, plus an ongoing support process for parents and a verification cost. |
| Trade-off | Keeps the student audience, but every consent step loses players, and the exact verification standard is still settling. |

## Recommendation

1. **Launch as 18+ only (Option A)**: the smallest change that is consistent with the DPDP Act, and
   honest in the store listing. Do it before the production release: `MIN_AGE = 18`, the neutral age
   question, Play target audience "18 and over".
2. **Plan Option B as a follow-up** if school students are the target market: build the consent flow and
   child-safe defaults first, then lower `MIN_AGE` to 13, update the Play target audience and the store
   text in the same release.
3. Whatever is chosen, don't stay on today's "13+ with no consent check" once the DPDP obligations apply.

Again: this is a product/engineering comparison, not legal advice. **Consult a lawyer** before deciding.

## Checklist when the decision is made

- [x] `src/config/age.ts` → `MIN_AGE` stays 13 (Option B).
- [x] Age question / consent flow built and translated (en, hi, hinglish).
- [x] Privacy Policy §11–12 and Terms §3 updated (new section on parental consent, child limits,
      grievance contact). **Still needs the lawyer's review.**
- [x] docs/play-store.md: store listing age line (§1), target audience (§4), Data safety (§5: parent
      email/name, age band), UGC notes for minors (§6), checklist (§9).
- [ ] Play Console: Target audience and content, and the store listing text, updated in the same release.
- [ ] Resend set up and the three function secrets deployed (docs/launch-steps.md Step 3b).
- [ ] Lawyer review of the open questions below.

## Option B as built (2026-10-14)

### Flows

**Age question** (`src/components/age/*`, `src/lib/ageBand.ts`, `src/lib/ageGate.ts`). A neutral year-of-birth
picker (no "Are you 13+?" yes/no). Asked once per device before the first guest game, inside the email
sign-up form, after the first Google sign-in (before any profile is written: the profile is created by the
`create_my_profile` RPC with the band) and once for older accounts with no age record (`set_my_age_band`).
Only the band (`under13` / `13to17` / `adult`) and a timestamp are kept; the year never leaves the picker.
Edges: turning 13 this year counts as 13 (lenient); turning 18 this year still counts as a child
(conservative). Legal pages, `/delete-account`, `/parent-consent*`, Landing and Auth are never behind the gate.

**Under 13**: no account (an account that answers under 13 is deleted by `set_my_age_band('under13')`, after a
confirm step), a friendly "come back when you're 13" page, and a 24-hour cooldown on the device
(`bhao_age_block`) that also blocks the sign-up page and signs out new unanswered accounts. Soft measure only:
clearing the app's data resets it.

**13–17, pending** (`profiles.consent_status = 'pending_consent'`). The server stores only the account (auth
email), age band, a neutral `player########` username and the parent email the child enters. The app treats
the account as this device's guest: Practice, Campaign, Tutorial and Library run on local storage only. Every
online feature (ranked, multiplayer, leaderboard, sync, guest-merge import) shows "Waiting for your parent's
OK" with send / resend (cooldown) / change email / check again. Server triggers reject game-data writes for
`unknown` and `pending_consent` accounts (`consent_required`). The name the child typed at sign-up stays on the
device and is applied after consent.

**Parent** (`supabase/functions/parent-consent`, `/parent-consent?token=…`). The child's request creates a
single-use consent token (7 days) and a long-lived withdraw token; only SHA-256 hashes are stored; one
bilingual (English + Hindi) email is sent through Resend. Rate limits on the server: 60 s between sends, 5 per
child per day, 5 per parent address per day. The public page (en / hi / hinglish) explains BHAO, exactly what
is collected, the child limits and the parent's choices, then asks for the parent's full name, year of birth
(must show 18+; checked, not stored) and a declaration checkbox. **Approve** → `parental_consents` row (child,
parent email, name, method `email_link_declaration`, notice version, time, optional IP HMAC) and
`active_minor`; a confirmation email with a fresh withdraw link follows. **Decline** → the child account is
deleted (shared `delete_account_by_id`).

**Withdraw** (`/parent-consent/withdraw?token=…`, link in every consent and confirmation email): confirm →
the child account and its data are deleted and the child's withdraw tokens revoked. Parents can also write to
support@daanik.com (`src/config/contact.ts`), named as grievance contact on the page, in the emails and in the
Privacy Policy.

### Child-safe defaults for `active_minor`

| Limit | Where enforced |
|---|---|
| No Sentry Session Replay / performance tracing | `src/lib/telemetry.ts` decides before `Sentry.init` from the stored band: only a known adult gets them (unknown age = off). A minor signing in mid-session stops replay and new traces. |
| Hidden from the public leaderboard | Server RLS (minors' leaderboard and profile rows visible only to themselves); UI note. |
| Multiplayer only in private invite-code rooms | Server: `multiplayer_rooms.is_public` (all rooms are private today) + guard rejecting minors creating/joining public rooms. No public/quick match exists in the UI. |
| No voice chat | Client only (`useRoomComms` childSafe: no voice mesh, no mic button). Voice signalling is Realtime broadcast, which has no server hook today. |
| Quick-chat presets only | Client only: no typing box, typed messages from others dropped on the minor's device. Same reason. |

### Open legal questions (for the lawyer)

1. **Is "email link + declaration" verifiable enough?** The DPDP Rules describe verifiable consent (e.g. using
   reliable identity/age details already held, or a virtual token from an authorised entity such as
   DigiLocker). Ours proves control of an email inbox plus a self-declared name and adult year of birth.
   `TODO(dpdp)` in `src/config/consent.ts` and the function: add a stronger method as a new
   `parental_consents.method` value if required. **(verify)** which Rules apply to us and from when.
2. **Self-declared age.** A child can enter a false year. Is a neutral self-declared age question, with no
   proof, acceptable for the "under 13 = no account" and "18+ = no consent" decisions?
3. **Retention of consent proof.** When a parent withdraws or declines, the consent record is deleted with
   the account (data minimisation). Do we need to keep proof of consent (and of withdrawal) for some period?
4. **Existing accounts that turn out to be 13–17** keep their earlier game data while waiting for consent
   (writes are blocked). Should it be deleted if no consent arrives within some time? No automatic expiry yet.
5. **Pending data**: we store the child's auth email and the parent email before consent, which the flow needs.
   Confirm this is allowed, and how long an unanswered pending account may be kept.
6. **Chat/voice limits are client-enforced** (Realtime broadcast). Is that an adequate safeguard, or must the
   server enforce them (Realtime Authorization / a relay)?
7. **Grievance officer**: the DPDP Act expects a contact for grievances; we name support@daanik.com. Does it
   need a named person / response timeline in the policy?
8. **Behavioural monitoring**: we turned off replay/tracing for minors. Are plain crash reports for minors fine?
9. The parent's IP is stored only as an HMAC (optional). Keep or drop?
