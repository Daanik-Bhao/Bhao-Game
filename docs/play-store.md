# BHAO on Google Play: Play Console checklist and copy

Ready-to-paste material for the Play Console listing, content rating, Data safety form and
User Generated Content (UGC) declarations. Everything here was checked against the code at the
time of writing (October 2026): `src/lib/supabase.ts`, `src/lib/auth.ts`, `src/main.tsx` (Sentry),
`supabase/migrations/*`, `src/lib/roomChat.ts`, `src/lib/voiceChat.ts`, `src/lib/reports.ts`,
`src/lib/guestMerge.ts`, `src/lib/libraryProgress.ts`, `src/components/ui/avatarPresets.ts` and the
`localStorage` keys in `src/`. Last re-checked 14 October 2026. If the code changes (new SDK, analytics, ads, purchases), update this
file and the Data safety form together.

Play policies change. Anything marked **(verify)** should be checked in Play Console before you submit.

---

## 1. Store listing

### App name (max 30 characters)

```
BHAO: Money Decision Card Game
```
(30 characters. Shorter option: `BHAO – Money Card Game`.)

### Short description (max 80 characters)

English (77):
```
Learn money skills in a fast card game. Beat scams, invest smart, reach ₹50L!
```

Hindi (75):
```
तेज़ कार्ड गेम में पैसे की समझ सीखें। स्कैम से बचें, समझदारी से निवेश करें!
```

### Full description (max 4000 characters)

English:
```
BHAO is a fast, fun card game that teaches real money skills for life in India.

Every turn you face a money decision: start a SIP or splurge on a new phone? Buy that hot crypto tip or build an emergency fund? Spot the UPI scam before it empties your wallet. Smart choices grow your net worth; bad ones cost you. First to ₹50 Lakhs wins!

HOW TO PLAY
• Draw cards for salary, expenses, investments, market crashes, tax raids and scams
• Make decisions and see how they change your money
• Use action cards to protect yourself or slow your rivals down
• Every card comes with a short tip from a mentor, so you learn while you play

GAME MODES
• Tutorial – learn the basics in a few minutes
• Campaign – level by level, from your first salary to big investment decisions
• Practice – play against bots, no account needed
• Ranked – climb the ranks and the leaderboard
• Multiplayer – create a room and play with friends, with text chat, quick chat, pokes and voice chat

WHAT YOU LEARN
• Budgeting, saving and emergency funds
• SIPs, mutual funds, stocks, gold and the risk of "get rich quick" tips
• Loans, EMIs, credit cards and BNPL traps
• Taxes and insurance basics
• How to recognise common money scams (fake KYC calls, OTP fraud, Ponzi schemes)

PLAY YOUR WAY
• English, हिन्दी and Hinglish
• Works offline for single-player modes
• Play as a guest, or sign in to save progress, rank up and play online

SAFE AND FAIR
• No real-money purchases. Coins are earned by playing and have no cash value.
• No ads.
• Chat filters hide links, phone numbers and swear words.
• Mute or report any player from the room chat.
• Voice chat is peer-to-peer and never recorded.
• Delete your account any time from your profile.

BHAO is for players 13 and older. It is an educational game and not financial advice.
```

(The age line must match `MIN_AGE` in `src/config/age.ts`; see `docs/age-policy.md`.)

Hindi:
```
BHAO एक तेज़ और मज़ेदार कार्ड गेम है जो भारत की असली ज़िंदगी के लिए पैसों की समझ सिखाता है।

हर चाल में आपको पैसों से जुड़ा फ़ैसला लेना होता है: SIP शुरू करें या नया फ़ोन खरीदें? क्रिप्टो की "पक्की टिप" पर दांव लगाएँ या इमरजेंसी फ़ंड बनाएँ? UPI स्कैम को पहचानें, इससे पहले कि वह आपकी जेब खाली कर दे। सही फ़ैसले आपकी संपत्ति बढ़ाते हैं, ग़लत फ़ैसले नुकसान कराते हैं। सबसे पहले ₹50 लाख तक पहुँचने वाला जीतता है!

कैसे खेलें
• सैलरी, ख़र्च, निवेश, मार्केट क्रैश, टैक्स रेड और स्कैम वाले कार्ड निकालें
• फ़ैसले लें और देखें कि आपके पैसों पर क्या असर होता है
• एक्शन कार्ड से खुद को बचाएँ या विरोधियों को धीमा करें
• हर कार्ड के साथ एक छोटी सीख मिलती है, ताकि खेलते-खेलते सीखें

गेम मोड
• ट्यूटोरियल – कुछ ही मिनटों में बेसिक्स सीखें
• कैंपेन – पहली सैलरी से बड़े निवेश फ़ैसलों तक, लेवल दर लेवल
• प्रैक्टिस – बॉट्स के साथ खेलें, अकाउंट की ज़रूरत नहीं
• रैंक्ड – रैंक और लीडरबोर्ड में ऊपर चढ़ें
• मल्टीप्लेयर – रूम बनाएँ और दोस्तों के साथ खेलें, टेक्स्ट चैट, झटपट चैट, पोक और वॉइस चैट के साथ

आप क्या सीखेंगे
• बजट, बचत और इमरजेंसी फ़ंड
• SIP, म्यूचुअल फ़ंड, शेयर, सोना और "जल्दी अमीर बनो" टिप्स का जोखिम
• लोन, EMI, क्रेडिट कार्ड और BNPL के जाल
• टैक्स और बीमा की बुनियादी बातें
• आम पैसों के स्कैम पहचानना (फ़र्ज़ी KYC कॉल, OTP धोखा, पोंज़ी स्कीम)

अपने तरीके से खेलें
• English, हिन्दी और Hinglish
• सिंगल-प्लेयर मोड बिना इंटरनेट भी चलते हैं
• मेहमान बनकर खेलें, या साइन इन करके प्रोग्रेस सेव करें, रैंक बढ़ाएँ और ऑनलाइन खेलें

सुरक्षित और निष्पक्ष
• असली पैसे से कोई ख़रीदारी नहीं। कॉइन्स खेलकर मिलते हैं और उनकी कोई नकद कीमत नहीं है।
• कोई विज्ञापन नहीं।
• चैट फ़िल्टर लिंक, फ़ोन नंबर और गालियाँ छिपा देता है।
• रूम चैट से किसी भी खिलाड़ी को म्यूट या रिपोर्ट करें।
• वॉइस चैट सीधे खिलाड़ियों के बीच चलती है और कभी रिकॉर्ड नहीं होती।
• प्रोफ़ाइल से कभी भी अपना अकाउंट मिटाएँ।

BHAO 13 साल और उससे बड़े खिलाड़ियों के लिए है। यह एक शैक्षिक गेम है, वित्तीय सलाह नहीं।
```

Before pasting, re-check the claims against the build you ship (offline single-player, "no ads", the
mode list). Don't promise features that are behind a flag.

---

## 2. Category and tags

**Recommendation: App type = Game, Category = Educational.**

- BHAO's purpose and every card's mentor tip are about financial literacy, so Educational is the
  honest fit and the listing matches what reviewers see.
- "Card" would also fit the mechanics, but the Card category sits next to casino and rummy apps.
  With coins, a stock-market screen and "crypto/lottery" cards, a Card listing invites a closer
  gambling review (and real-money rummy/poker apps in India are a sensitive area). Educational avoids
  that confusion.
- Tags (Play lets you pick up to 5): Card, Educational, Strategy, Multiplayer, Casual
  (use whatever closest tags Play Console offers).
- Do **not** opt into the "Designed for Families" / Teacher Approved programme: the app has chat and
  voice with strangers and targets 13+, which does not meet the Families policy.

---

## 3. Content rating (IARC questionnaire)

Category to choose: **Game**. Suggested answers (questions are paraphrased; Play's wording changes):

| Topic | Answer | Why |
|---|---|---|
| Violence, blood, gore | No | No violent content. |
| Fear / horror | No | |
| Sexuality, nudity | No | |
| Crude humour | No | |
| Language (profanity) in the app's own content | No | Card text is clean. |
| Controlled substances | **Yes, references** (mild) | One card option mentions spending on alcohol "to cope" (as a bad choice). If the questionnaire separates "references" from "depictions/use", pick references only. Remove that line if you want a lower rating. |
| Gambling: real-money gambling | **No** | Nothing can be bought or cashed out. Coins are earned only by playing and have no cash value. |
| Gambling: simulated gambling (casino-style betting, slots, poker, roulette, loot boxes) | **No** | You can't stake coins on a chance outcome. The market screen is a simulated stock market (buy/sell virtual stocks with coins at server-set prices), presented as investing education, not a casino game. |
| Gambling themes / references | **Yes** | Cards like "Lottery Ticket Temptation" and "Leveraged Trading Gamble" mention gambling to warn against it. Say so if asked. |
| Users can interact or exchange content | **Yes** | Multiplayer text chat, quick chat, pokes and voice chat with other players (possibly strangers). |
| Shares user's current physical location with other users | **No** | No location access at all. |
| Allows users to purchase digital goods | **No** | No in-app purchases. |
| Unrestricted internet / web browser | No | |
| Is the app a "miscellaneous", news, or educational reference? | No (it's a game) | |

Expected result: roughly **Teen / PEGI 12 / IARC 12+** because of gambling references and user
interaction, with "Users Interact" as an interactive element. That is consistent with the 13+
target audience. **(verify)** the actual certificate after submitting.

Also in **App content**:
- **Ads:** No, the app contains no ads.
- **In-app purchases:** none.
- **Financial features declaration:** BHAO provides no financial services (no trading, loans, payments,
  crypto wallets). Answer "My app doesn't provide any financial features". Being an educational game
  about money is not a financial feature, but the store text says "not financial advice" anyway.
- **News app:** No. **Government app:** No. **Health:** No.

---

## 4. Target audience and content

- The minimum age lives in one place, `MIN_AGE` in `src/config/age.ts` (currently **13**); the in-app
  legal text and Landing footer read it. **The owner has not decided** between "18+ only" and
  "13+ with verifiable parental consent" (DPDP Act 2023): see `docs/age-policy.md`. The answers below are
  for today's `MIN_AGE = 13`; if it becomes 18, select only "18 and over" and update section 1.
- **Target age groups: 13–15, 16–17, 18 and over.** Do **not** select any group under 13.
- Why 13+: multiplayer has real-time text chat and peer-to-peer voice chat with other players,
  including strangers. Apps that target children under 13 must meet the Families policy, which
  restricts open chat with strangers. The in-app policy states the minimum age from `MIN_AGE`
  (Privacy Policy section 11, Terms section 3).
- "Could your store listing unintentionally appeal to children?" Answer honestly. The art is cartoony,
  so Play may ask; explain the money-management theme, the 13+ minimum, chat moderation (filters,
  mute, report) and that there are no ads or purchases.
- **(verify)** If Play flags the app as appealing to children, it may require the Families policy
  anyway; the fallback is a neutral age gate before multiplayer.

---

## 5. Data safety form

Re-checked against the code on 14 October 2026, including the guest-progress import
(`20261014000000_guest_campaign_import.sql`, `src/lib/guestMerge.ts`), server-side Gyaan Library progress
(`20261014000100_library_progress.sql`, `src/lib/libraryProgress.ts`) and in-app avatar presets
(`src/components/ui/avatarPresets.ts`).

### What the app actually does with data

| Where | What | Source in code |
|---|---|---|
| Supabase Auth | Email + password (hashed by Supabase), or Google sign-in. With Google, Supabase stores the identity data Google returns (email, name, profile-picture URL, Google account id); the app itself only uses the email. | `src/lib/auth.ts`, `src/lib/nativeAuth.ts` |
| `profiles`, `leaderboard` | Username, avatar **preset id** (`/avatar/<id>`, a built-in picture: nothing is uploaded), coins, XP, rank points, games played/won, win streaks, last login date + login streak, placement games | `create_profiles_table`, `economy_profiles`, `create_leaderboard` |
| `matches`, `match_results` | Per match: mode, room or level id, start/finish time, result, placement, final net worth, coins/XP/RP gained, choice statistics (`stats` jsonb) | `20261013000300_matches_and_results.sql` |
| `campaign_progress` | Per level: stars, best net worth, completion time, `imported` flag (stars that came from a guest import) | `20261013200000_campaign_progress.sql`, `20261014000000_guest_campaign_import.sql` |
| `campaign_guest_imports` | One row per account **only if the player accepts** the "bring your guest progress" offer: import time, levels offered, levels accepted. The guest's completed levels (id, stars, net worth) are sent once through `import_guest_campaign_progress`. Declining sends nothing. | `20261014000000_guest_campaign_import.sql`, `src/lib/guestMerge.ts`, `src/components/GuestMergePrompt.tsx` |
| `library_progress` | Gyaan Library: concept ids unlocked / opened, unlock time, update time (signed-in players; guest unlocks are added on the same accepted import) | `20261014000100_library_progress.sql`, `src/lib/libraryProgress.ts` |
| `player_contracts`, `user_stocks` | Daily contract progress, virtual stock holdings | contracts / market migrations |
| `multiplayer_rooms`, `room_players`, `multiplayer_room_state`, `room_player_hands` | Room membership, seat, last-seen heartbeat, game state, cards in hand | multiplayer migrations |
| `player_reports` | Reporter id, reported id, room id, time, reason, optional details text (≤ 500 chars), reported player's last ≤ 10 chat lines | `20261013300000_player_reports.sql`, `src/lib/reports.ts` |
| Supabase Realtime broadcast | Text chat, quick chat, pokes, voice signalling. **Not stored.** | `src/lib/roomChat.ts`, `src/hooks/useRoomComms.ts` |
| WebRTC peer-to-peer | Voice audio between players' devices, encrypted (DTLS-SRTP). **Not recorded, never reaches our servers.** A TURN relay is used only if `VITE_TURN_URL` is set; it forwards encrypted packets only. Peers and Google STUN see the IP address. | `src/lib/voiceChat.ts` |
| Sentry (only if `VITE_SENTRY_DSN` is set) | Crash/error events, 10% performance traces, Session Replay **only on error** (all text and inputs masked, media blocked: SDK defaults). `sendDefaultPii: false`; no user id, username or email is attached. | `src/main.tsx`, `src/App.tsx` |
| Hosting / API request logs | Supabase and Vercel see the request IP address and user agent in their infrastructure logs (service providers, not used by the app) | n/a |
| On device (`localStorage`) | Supabase session, `language`, sound and `bhao.reduceMotion` settings, `bhao_guest_profile` (guest name), `bhao_tutorial_done`, `bhao_campaign_*` and `bhao_library_progress:*` (guest and signed-in copies), `bhao_guest_merge:*` / `bhao_guest_merge_claimed` (import offer answered), `justRegistered` | various |
| Third-party loads | **None** for content: fonts are self-hosted (`public/fonts`, `src/styles/fonts.css`) and avatars are in-app presets. (Google Fonts and DiceBear are gone.) The WhatsApp invite button opens `wa.me` with the invite text only when the player taps it. | `src/styles/fonts.css`, `avatarPresets.ts`, `src/pages/lobby/LobbyViews.tsx` |

No location, contacts, photos, files, SMS, call logs, calendar, advertising ID, payment info, or health
data. No ads SDK. No analytics SDK besides Sentry. Android permissions: `INTERNET`, `RECORD_AUDIO`
(voice chat, requested only on "Join voice"), `MODIFY_AUDIO_SETTINGS`, `VIBRATE`.

### Form answers

**Does your app collect or share any of the required user data types?** Yes.

**Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS/WSS to Supabase and
Sentry; WebRTC voice is always encrypted).

**Do you provide a way for users to request that their data be deleted?** Yes.
- In-app: **Profile → Danger zone → Delete account**, type `DELETE`, **Delete forever**.
  The `delete_own_account` RPC deletes the auth user; every user table cascades from `auth.users`
  (profiles, leaderboard, matches, match results, campaign progress, `campaign_guest_imports`,
  `library_progress`, contracts, stocks, rooms the user hosts, room seats and hands, reports made by
  or about the user). Takes effect immediately.
- By email: support@daanik.com, completed within 30 days (the public page promises this: someone must
  own the inbox and do it, via Supabase → Authentication → Users → Delete user).
- **Web deletion link (required by Play):** `https://game-final-xi.vercel.app/delete-account`
  (replace the domain if production moves). Public, no sign-in, served by the SPA rewrite in
  `vercel.json`. It explains the in-app steps (labels taken from the real UI strings), the email option,
  what is deleted, the timelines, and what stays on the device.

Data types to declare (all: **Collected = Yes, Shared = No**, processed by service providers on your
behalf, which Play does not count as "sharing"):

| Data type (Play name) | Required or optional | Purposes | Notes |
|---|---|---|---|
| Personal info → **Email address** | Optional (only if you create an account) | Account management | Supabase Auth. |
| Personal info → **Name** | Optional | App functionality, Account management | The username shown to other players, and the name Google returns at Google sign-in (stored by Supabase Auth, not shown in the game). |
| Personal info → **User IDs** | Optional | Account management, App functionality | Supabase user id; Google account id when signing in with Google. |
| Messages → **Other in-app messages** | Optional | App functionality (safety and moderation) | Only stored when someone **reports** a player: the reported player's last ≤ 10 chat lines. Normal chat is relayed, not stored (ephemeral). |
| App activity → **App interactions** | Optional (account) | App functionality | Match results, campaign stars (incl. imported guest progress), Gyaan Library unlocked/seen concepts, contracts, rank points, coins, login streak. |
| App activity → **Other user-generated content** | Optional | App functionality (safety and moderation) | The optional free-text "details" of a report. Usernames could also go here; don't double-count with Name. |
| App info and performance → **Crash logs** | Required (automatic) when Sentry is enabled | Analytics (app stability) | Sentry error events. Users can't opt out in the app. |
| App info and performance → **Diagnostics** | Required (automatic) when Sentry is enabled | Analytics | Sentry performance traces (10%) and on-error replays. |
| Audio → **Voice or sound recordings** | **Do not declare** | | Voice is peer-to-peer and never sent to or stored by us. Explained in the privacy policy. **(verify)**: a TURN relay only forwards encrypted packets in memory; that is not collection. |
| Photos and videos | **Do not declare** | | No photo access or upload. Avatars are built-in presets. (Google sign-in's profile-picture URL sits in Supabase Auth metadata; it is a link, unused by the app.) **(verify)** |
| Location | **Do not declare** | | No location permission. IP addresses in provider logs are not used to derive location. **(verify)** Play's current wording on IP addresses. |
| Device or other IDs | **Do not declare** | | No advertising ID, no Android ID read. Sentry's random session/replay id is not a device id. **(verify)** against Sentry's current Play guidance. |

If Sentry is not enabled in the production build (no DSN), drop the two Sentry rows.

**Ephemeral processing:** chat, quick chat, pokes and voice signalling travel over Supabase Realtime
in memory and are not stored, so they don't need declaring; the report flow is what stores message
content.

**Security practices to tick:** Data is encrypted in transit ✔. Users can request deletion ✔ (with the
web link above). Do not claim "independent security review" unless you have one.

**Recommended changes before submitting** (small, privacy-positive):
1. In Sentry project settings, turn on "Prevent storing of IP addresses" (the SDK already sends no PII,
   but Sentry's ingest still sees the request IP).
2. Keep the privacy policy, `/delete-account` and this table in sync whenever a table or SDK is added.

---

## 6. User Generated Content (UGC) policy summary

What Play requires for apps with UGC, and where BHAO does it:

| Requirement | How BHAO meets it |
|---|---|
| Terms/policy that define objectionable content and ban it | Terms of Service section 5 "Chat, voice and reporting" (abuse, sexual content, scams, spam, personal info). Users accept the Terms by playing. |
| In-app way to **report** users / content | Room chat → people list → flag button next to each player → reason + optional details → `report_player` RPC. Includes recent chat lines as evidence. Reporting needs sign-in; multiplayer already requires an account. |
| In-app way to **block** users | Mute button per player: hides their chat and pokes and silences their voice for the reporter. A report also auto-mutes. |
| Moderation of UGC | Proactive: chat is filtered on the receiving client (swear words masked, links and phone/OTP-like numbers hidden, length and rate limits). Reactive: reports are reviewed by the team in Supabase (`player_reports`, status `open → reviewing → actioned/dismissed`) and accounts can be banned. |
| Safeguards against abuse of the report tool | Server-side: sign-in required, no self-reports, 10 reports/day per reporter, 1 per reporter/player/room, size limits. |
| Voice | Not recorded. Mute any player; leave voice at any time. Microphone permission is requested only when the player taps "Join voice". |

**You must actually review reports.** Set a routine (e.g. daily) to run in the Supabase SQL editor:
```sql
select id, created_at, reason, reported_id, room_id, details, evidence
from public.player_reports where status = 'open' order by created_at;
-- after handling:
update public.player_reports set status = 'actioned' where id = '...';
```
There is no ban mechanism in the app yet; banning today means deleting the account or blocking the
user in Supabase Auth (Authentication → Users → Ban user). Write that procedure down for the team.

---

## 7. Graphics to prepare

### App icon
512 × 512 px, 32-bit PNG (with alpha), max 1 MB. Use `public/icons/` artwork.

### Feature graphic (required)
- **1024 × 500 px**, JPG or 24-bit PNG (**no alpha**), max 15 MB.
- Keep the logo and any text in the centre ~70%; Play may crop edges or overlay a play button.
- Suggested: BHAO logo + three fanned cards (SIP, Scam Alert, Market Crash) + tagline
  "Money decisions. Real lessons." on the brand green. Little text; no "Free!" or ranking claims.

### Phone screenshots (2–8, recommended 4–8)
- 16:9 or 9:16, each side 320–3840 px, the long side at most 2× the short side. Use
  **1080 × 1920 px (portrait)**. JPG or 24-bit PNG.
- To be featured in some game surfaces Play recommends at least 4 landscape or portrait screenshots at
  1080p or higher. **(verify)** current recommendations.

Screens to capture (real gameplay, no mockups that show features that don't exist):
1. Main game board mid-turn with a decision card open (shows the core loop).
2. A scam card with the mentor tip ("Spot the scam").
3. Campaign level map / level select with stars.
4. Multiplayer room with chat panel open (show the safety line and mute/report buttons).
5. Ranked / leaderboard screen.
6. Game result screen (net worth, ₹50L win).
7. Tutorial step in Hindi or Hinglish (shows language support).
8. Market screen (virtual stocks, clearly "coins").

Use guest or test accounts with neutral names. Don't show real people's names or chat.

### Tablet screenshots
- **7-inch tablet:** e.g. 1200 × 1920 px (portrait) or 1920 × 1200 (landscape).
- **10-inch tablet:** e.g. 1600 × 2560 px or 2560 × 1600.
- Same 2:1 aspect limit; up to 8 each. Capture the desktop/tablet board layout (the game has a
  dedicated wide layout). Required only if you want the app highlighted for tablets, but recommended.

### Optional
- Promo video: a YouTube link (unlisted is fine), 30–60 s of real gameplay.

---

## 8. Testing track rules (new developer accounts)

- **Personal developer accounts created after 13 November 2023** must run a **closed test with at
  least 12 testers who stay opted in for at least 14 consecutive days** before they can apply for
  production access. After that, you answer a short questionnaire about the test and Google reviews
  the production access request (can take about a week).
- **Organization developer accounts** (registered as a company, with a D-U-N-S number) do **not**
  have the 12-testers/14-days requirement and can publish to production directly after review.
- This is current Play policy as of writing; **(verify)** the exact numbers in Play Console →
  Dashboard ("Set up your app" / "Production access") because Google has changed them before
  (it was 20 testers at launch, lowered to 12 in December 2024).

Practical plan for a personal account:
1. Upload the AAB to **Internal testing** first (up to 100 testers, no review wait) to smoke-test.
2. Create a **Closed testing** track; add testers by Google Group or email list (get 15–20 people so
   that 12 remain opted-in for the full 14 days).
3. Share the opt-in link; testers must accept it **and** install the app from Play.
4. Ask testers to actually play (Google looks at engagement) and send feedback; ship at least one
   update during the 14 days.
5. After 14 days, apply for production access from the Dashboard.

---

## 9. Pre-submission checklist

- [ ] Privacy policy URL entered in Play Console and reachable without login:
      `https://game-final-xi.vercel.app/privacy` (replace the domain if production moves).
- [ ] Account deletion URL entered (Data safety → "Delete account URL"):
      `https://game-final-xi.vercel.app/delete-account`. Open it in a private window to confirm it loads
      without signing in.
- [ ] Account deletion works in-app on the Android build (Profile → Danger zone → Delete account), and
      someone owns support@daanik.com deletion requests (the public page promises 30 days).
- [ ] Data safety form filled from section 5 (Email, Name, User IDs, Other in-app messages, App
      interactions, Other user-generated content, plus Crash logs and Diagnostics if Sentry is on).
- [ ] Production Supabase has every migration applied, including `player_reports`,
      `guest_campaign_import` and `library_progress`; someone owns report review (section 6).
- [ ] Minimum age decided (`docs/age-policy.md`), `MIN_AGE` in `src/config/age.ts` set to match, and
      the target audience (section 4), store text (section 1) and content rating (section 3) agree with it.
- [ ] Content rating questionnaire done (section 3).
- [ ] Ads: No. App access: provide a test account (email + password) for reviewers, since multiplayer
      and ranked need sign-in. Note that voice/chat need a second player; mention that in the notes.
- [ ] Microphone permission (`RECORD_AUDIO`) is only requested when joining voice; Play may ask why
      the app needs the microphone: "Optional in-game voice chat between players in a multiplayer room.
      Audio is peer-to-peer and not recorded."
- [ ] Sentry "Prevent storing of IP addresses" turned on (if Sentry is enabled).
- [ ] Graphics from section 7 uploaded.
