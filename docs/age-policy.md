# Minimum age: decision note

**Status: open. The owner decides.** This note compares the two realistic options and what each one
needs in code, in Play Console and in the legal text. It is an engineering summary, **not legal advice**:
have a lawyer who knows India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the DPDP
Rules review the choice before the wider launch.

## Where we are today

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

- [ ] `src/config/age.ts` → `MIN_AGE` (and nothing else; grep for a hard-coded age before shipping).
- [ ] Age question / consent flow built and translated (en, hi, hinglish).
- [ ] Privacy Policy §11 and Terms §3 reviewed (they read `MIN_AGE`; Option B needs new sections).
- [ ] docs/play-store.md: store listing age line (§1), target audience (§4), Data safety (§5) if new data
      (birth year, parent contact) is stored.
- [ ] Play Console: Target audience and content, and the store listing text, updated in the same release.
