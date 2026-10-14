# BHAO launch steps (simple Hinglish guide)

Ye guide aapko step-by-step le jaayegi: **Supabase project banane se lekar Play Store par app live
karne tak**. Har step mein likha hai **kya karna hai** (exact command ya exact menu) aur
**kya check karna hai** (step sahi hua ya nahi).

Commands repo folder mein chalani hain (PowerShell ya Git Bash):
`C:\Users\Administrator\Downloads\GameFinal-main` — pehli baar `npm ci` chala lo.

> Golden rules
> - Passwords, keys, `.jks` file **kabhi bhi** git mein commit mat karna, WhatsApp/email par mat bhejna.
> - `service_role` key **kabhi bhi** `.env` mein mat daalna (app ke andar sab log padh sakte hain).
> - Har naye Play upload se pehle `npm run version:bump` zaroor chalana.

---

## Part A — Backend (Supabase)

### Step 1. Supabase project banao
1. https://supabase.com/dashboard par login karo → **New project**.
2. Name: `bhao`, Region: **South Asia (Mumbai)**, **Database password** ek strong password rakho
   aur password manager mein save karo (deploy mein chahiye hoga).
3. Plan: shuru mein Free chalega; real launch ke liye Pro lena behtar (Free project 7 din idle
   rehne par pause ho jaata hai).

**Kya check karna hai:** Dashboard par project "Healthy" / green dikhe. Browser URL mein
`https://supabase.com/dashboard/project/<ref>` — ye 20 letters ka `<ref>` aapka **project ref** hai.

### Step 2. Keys `.env` mein daalo
1. Repo folder mein `.env.example` ki copy banao, naam `.env` rakho.
2. Supabase → **Project Settings → API Keys** (purane UI mein **Project Settings → API**):
   - **Project URL** → `VITE_SUPABASE_URL=https://<ref>.supabase.co`
   - **anon / publishable** key → `VITE_SUPABASE_ANON_KEY=...`
   - `service_role` / `secret` key **mat** daalna.
3. Optional: Sentry DSN (`VITE_SENTRY_DSN`), TURN server (`VITE_TURN_URL`, `VITE_TURN_USERNAME`,
   `VITE_TURN_CREDENTIAL`) — abhi khali chhod sakte ho.
4. Check chalao:
   ```
   npm run env:check
   ```

**Kya check karna hai:** Last line mein `OK` aaye (errors 0). Sentry/TURN ke `warn` theek hain.
Agar `SERVICE_ROLE` ka error aaye to galat key daali hai — anon/publishable key daalo.

### Step 3. Database + functions deploy karo (`supabase:deploy`)
1. Access token banao: https://supabase.com/dashboard/account/tokens → **Generate new token**.
2. Isi PowerShell window mein (file mein save mat karo):
   ```
   $env:SUPABASE_ACCESS_TOKEN = "sbp_...."
   $env:SUPABASE_DB_PASSWORD  = "step 1 wala database password"
   ```
3. Pehle **dry run** (kuch change nahi hota, sirf plan dikhata hai):
   ```
   npm run supabase:deploy
   ```
   Check karo: project ref sahi hai, ~23 migrations aur 2 functions (`game-action`,
   `save-game-result`) list mein hain, `missing:` line nahi hai.
4. Ab asli deploy:
   ```
   npm run supabase:deploy -- --apply
   ```
   `db push` confirm maange to `Y` dabao.

**Kya check karna hai:**
- Last line: `Done: project <ref> is up to date (2 function(s) deployed)`.
- Supabase → **Table Editor** mein `profiles`, `leaderboard`, `matches`, `player_reports` jaisi tables dikhein.
- Supabase → **Edge Functions** mein `game-action` aur `save-game-result` dono "Active" dikhein.
- Error aaye to message padho: "password" wala error = galat DB password; "older than remote"
  wala = `npm run supabase:deploy -- --apply --include-all`.

### Step 4. Email login settings
1. Supabase → **Authentication → Sign In / Providers → Email**: Enabled rakho. "Confirm email"
   on rakhna hai to theek, bas test karte waqt inbox check karna.
2. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: aapki website ka URL (jaise `https://bhao.app`; abhi nahi hai to Vercel wala URL).
   - **Redirect URLs** mein add karo: `com.daanik.bhao://login-callback`
     (aur website ke liye `https://<aapki-site>/dashboard`).

**Kya check karna hai:** Redirect URLs list mein `com.daanik.bhao://login-callback` exact
spelling ke saath dikhe (koi space ya `/` extra nahi).

---

## Part B — Google login (OAuth) + SHA-1

App mein Google login Chrome Custom Tab mein khulta hai aur `com.daanik.bhao://login-callback`
par wapas aata hai. Iske liye **Web** type ka OAuth client chahiye. **SHA-1 is login ke liye
zaroori nahi hai** — par neeche diya gaya command chala ke fingerprints save kar lo, aage kaam aayenge.

### Step 5. Google Cloud mein OAuth client banao
1. https://console.cloud.google.com → naya project `BHAO` banao.
2. **Google Auth Platform → Branding** (purane UI mein **APIs & Services → OAuth consent screen**):
   App name `BHAO`, support email, logo, privacy policy URL (`https://<aapki-site>/privacy`).
   **Audience** → User type **External** → **Publish app** (Testing mode mein sirf test users login kar paate hain).
3. **Google Auth Platform → Clients → Create client** (ya **APIs & Services → Credentials →
   Create credentials → OAuth client ID**):
   - Application type: **Web application**
   - Authorized redirect URIs: `https://<ref>.supabase.co/auth/v1/callback`
   - **Create** → Client ID + Client Secret copy karo.
4. Supabase → **Authentication → Sign In / Providers → Google** → Enable → Client ID + Client
   Secret paste → **Save**.

**Kya check karna hai:** Website par (ya `npm run dev` mein) "Continue with Google" dabao →
Google account choose karo → wapas app mein logged-in dikhna chahiye.

### Step 6. SHA-1 / SHA-256 nikaalo (save karke rakho)
```
npm run android:sha1
```
Ye debug key aur upload key (Step 7 ke baad) ke SHA-1 / SHA-256 dikhata hai, aur batata hai kaun
sa kahaan lagta hai. Play App Signing key ka SHA-1 pehle upload ke baad milega:
**Play Console → Test and release → App integrity → App signing**.

**Kya check karna hai:** Teeno fingerprints (debug, upload, Play App Signing) ek note mein save
ho gaye. Abhi kahin paste karna zaroori nahi; future mein native Google Sign-In ya App Links
lagaye to Google Cloud mein **Android** OAuth client (package `com.daanik.bhao` + SHA-1) banana hoga.

---

## Part C — Android app build

### Step 7. Upload keystore banao (sirf EK baar, zindagi bhar ke liye)
```
npm run android:keystore
```
- Path default rehne do: `C:\Users\Administrator\AndroidDev\keys\bhao-upload.jks`
- Alias default: `bhao-upload`
- Naam / company / country (`IN`) daalo, phir **password** do baar (screen par dikhega nahi).

Script `android/keystore.properties` khud likh deti hai.

**BACKUP abhi karo:**
1. `bhao-upload.jks` file ki **2 copies**: password manager attachment + USB drive / encrypted cloud.
2. Password + alias password manager mein.

**Kya check karna hai:** Screen par bada "BACK UP YOUR UPLOAD KEY NOW" box aaya, aur
`npm run android:sha1` ab "Upload key" ka SHA-1 bhi dikhata hai. Key kho gayi to Google se
reset karwana padega (kai din lagte hain).

### Step 8. Version badhao + AAB banao
1. Har upload se pehle:
   ```
   npm run version:bump
   ```
   (bada update ho to `npm run version:bump -- minor`). Pehle upload ke liye 0.1.0 bhi chalega —
   `npm run version:show` se dekh lo.
2. Bundle banao:
   ```
   npm run android:bundle
   ```
   Ye pehle keystore, version aur `.env` check karta hai, phir web build + signed AAB banata hai.

**Kya check karna hai:**
- End mein `[android] built android\app\build\outputs\bundle\release\app-release.aab (.. MB)`.
- "STOP: version ... was already built" aaye → `npm run version:bump` chalao, dobara build karo.
- "CANNOT BUILD THE PLAY STORE BUNDLE" aaye → Step 7 nahi hua / `.jks` file missing hai.
- Build ke baad `package.json` aur `android/release-builds.json` **git commit** karo.
- Pehle phone par test: `npm run android:apk` → APK phone par install karke login + ek game khelo.

---

## Part D — Google Play Console

### Step 9. App banao
1. https://play.google.com/console → **Home → Create app**: name `BHAO`, language English (India) /
   Hindi, **Game**, **Free**, declarations tick → **Create app**.
2. **Policy → App content** mein sab bharo (details `docs/play-store.md` mein hain):
   Privacy policy URL, App access (reviewer ke liye test email + password), Ads = No,
   Content rating questionnaire, Target audience 13+, Data safety, Government app = No.
3. **Grow users → Store presence → Main store listing**: short/long description, icon 512x512,
   feature graphic 1024x500, kam se kam 2 phone screenshots (`docs/play-store.md` section 1 aur 7).

**Kya check karna hai:** **Home (Dashboard)** par "Set up your app" ke saare tasks green tick.

### Step 10. Internal testing (sabse pehle, khud ke liye)
1. **Test and release → Testing → Internal testing → Testers** tab → email list banao (apna + team) → Save.
2. **Create new release** → Play App Signing ke liye **"Use Google-generated key"** (default) accept karo.
3. `app-release.aab` upload karo → release name automatic → **Next → Save and publish**.
4. Testers tab se **"Copy link"** → phone par kholo → **Accept invite** → Play Store se install.
5. Ab **Test and release → App integrity → App signing** se Play App Signing ka SHA-1 / SHA-256 save karo (Step 6).
6. Mapping file: **Test and release → App bundle explorer** → is version → **Downloads** →
   "ReTrace mapping file" upload karo (`android\app\build\outputs\mapping\release\mapping.txt`).

**Kya check karna hai:** Play Store se install hua app khulta hai, Google + email login chalta hai,
ek practice game aur ek multiplayer room chalta hai. Pre-launch report (**Test and release →
Testing → Pre-launch report**) mein koi crash nahi.

### Step 11. Closed testing — 12 testers, 14 din (personal account ke liye zaroori)
Personal developer account (Nov 2023 ke baad bana) ko production se pehle ye karna padta hai.
1. **Test and release → Testing → Closed testing → Create track** (ya default "Closed testing - Alpha") → **Manage track**.
2. **Testers** tab: Google Group ya email list mein **15–20 log** daalo (taaki kam se kam 12 poore
   14 din tak bane rahein).
3. **Create new release** → wahi ya naya AAB (naye ke liye `npm run version:bump` + `npm run android:bundle`)
   → **Save → Send for review**.
4. Review pass hone ke baad testers ko **opt-in link** bhejo: link accept + Play Store se install, dono zaroori.
5. 14 din tak testers ko roz khelne bolo, feedback lo, aur beech mein **kam se kam ek update** bhejo.

**Kya check karna hai:** **Home (Dashboard)** par "Apply for production" card mein count dikhta hai:
"12 testers opted-in for 14 days" poora hone tak wait karo. Koi tester bich mein opt-out kare to
naya add karo (14 din usi din se count nahi hote — isliye extra testers rakho).

### Step 12. Production
1. 14 din poore → **Home → Apply for production** → questionnaire bharo (test kaisa gaya, kya
   feedback aaya, kya fix kiya) → Submit. Google ka review ~7 din tak le sakta hai.
2. Approve hone ke baad: **Test and release → Production → Countries/regions** → India (aur
   baaki jahan chahiye) add karo.
3. **Create new release** → "Add from library" se closed testing wala AAB choose karo (ya naya bump karke)
   → Release notes (English + Hindi) → **Next → Save → Send for review**.
4. Rollout: pehle **staged rollout 20%** rakho, 2–3 din crash/ratings dekho, phir 100%.

**Kya check karna hai:** **Publishing overview** mein status "Changes in review" → "Published".
Play Store par `com.daanik.bhao` search ya link se app dikhe. **Quality → Android vitals** mein
crash rate 1% se kam.

---

## Har update ka chhota checklist

1. Code merge → `npm test`, `npm run lint`, `npm run build` sab green.
2. Naya migration hai? → `npm run supabase:deploy` (dry run) → `npm run supabase:deploy -- --apply`.
3. `npm run version:bump`
4. `npm run android:bundle`
5. `package.json` + `android/release-builds.json` commit karo.
6. Play Console → pehle **Internal testing** mein upload → khud test → phir **Production** mein promote.
7. `mapping.txt` upload karo (Step 10.6).
