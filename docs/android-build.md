# Android app (Capacitor)

The Android app wraps the same web build (`dist/`) in a Capacitor WebView.
Owner checklist from zero to Play Store (Hinglish): [launch-steps.md](launch-steps.md).

App id: `com.daanik.bhao` · name: BHAO · config: `capacitor.config.ts` · native project: `android/`.

## 1. One-time setup (no admin rights needed)

Toolchain lives in `C:\Users\Administrator\AndroidDev`:

| What | Path |
| --- | --- |
| JDK 21 (Temurin) | `C:\Users\Administrator\AndroidDev\jdk21` |
| Android SDK (platform-tools, platforms;android-36, build-tools 35.0.0 + 36.0.0) | `C:\Users\Administrator\AndroidDev\sdk` |

To (re)install it, run in Git Bash: `bash /c/Users/Administrator/AndroidDev/setup.sh`
(downloads about 1 GB and accepts the SDK licences). Nothing is added to the system PATH;
the npm scripts set `JAVA_HOME` / `ANDROID_HOME` themselves. If your toolchain is elsewhere,
set `JAVA_HOME` and `ANDROID_HOME` (or `BHAO_ANDROID_TOOLCHAIN`) before running them.

Then `npm ci` in the repo.

## 2. Everyday commands

| Command | What it does |
| --- | --- |
| `npm run android:sync` | `npm run build` + copy `dist/` and plugins into `android/` |
| `npm run android:apk` | sync + debug APK → `android/app/build/outputs/apk/debug/app-debug.apk` |
| `npm run android:bundle` | release pre-checks (keystore, versionCode, `npm run env:check`) + sync + signed release AAB → `android/app/build/outputs/bundle/release/app-release.aab` (needs the keystore, see 3) |
| `npm run env:check` | validates `.env` (required `VITE_SUPABASE_*`, warns for optional Sentry/TURN; refuses a service_role key) |
| `npm run supabase:deploy` | dry run of the backend deploy (migrations, edge functions, secrets); add `-- --apply` to really deploy |
| `npm run android:assets` | regenerate launcher icons + splash from the coin art (`resources/`, `android/app/src/main/res/`) |

Install a debug APK on a phone: enable USB debugging, then
`C:\Users\Administrator\AndroidDev\sdk\platform-tools\adb.exe install -r android\app\build\outputs\apk\debug\app-debug.apk`
(or copy the APK to the phone and open it).

Android Studio is optional: open the `android/` folder in it to run on an emulator.

## 3. Release signing (do this once, keep the key safe)

Google Play needs every upload signed with your **upload key**. Create it yourself and
back it up (password manager + an offline copy). If you lose it you must ask Google to reset it.

```bash
npm run android:keystore
```

It asks for a path (default `C:\Users\Administrator\AndroidDev\keys\bhao-upload.jks`, outside
the repo), an alias (default `bhao-upload`), your name/organisation and a password (typed twice,
hidden), runs the JDK's `keytool` (RSA 4096, PKCS12, one password for store and key) and writes
`android/keystore.properties`. It never overwrites an existing keystore or properties file.
(Manual alternative: create a keystore with `keytool -genkeypair` and copy
`android/keystore.properties.example` to `android/keystore.properties`.)

`keystore.properties`, `*.jks`, `*.keystore` and `*.p12` are git-ignored; never commit them.
Without that file debug builds still work; `npm run android:bundle` refuses to run.

## 4. Upload to Google Play

1. Before each release run `npm run version:bump` (patch; or `npm run version:bump -- minor`).
   The version lives only in `package.json`; `android/app/build.gradle` derives
   `versionName` from it and `versionCode = major*1000000 + minor*1000 + patch`
   (0.1.0 → 1000, 1.2.3 → 1002003). `npm run version:show` prints both.
2. `npm run android:bundle`. It refuses to build if the versionCode is not higher than the
   last AAB recorded in `android/release-builds.json` (git-tracked; the bundle step updates it,
   commit it together with `package.json`). Only if that last AAB was never uploaded may you
   rebuild the same version with `BHAO_ALLOW_SAME_VERSION=1`.
3. Play Console → create the app (package `com.daanik.bhao`) → enrol in **Play App Signing**
   (Google keeps the app signing key; your keystore is the upload key).
4. Testing → Internal testing → Create release → upload `app-release.aab` → roll out.
5. Fill in the store listing, content rating, data safety (the app records audio only for
   in-game voice chat) and privacy policy URL before promoting to production.

The app targets Android API 36 (minimum Android 7.0 / API 24), which meets Play's current
target-API requirement.

## 5. Supabase auth redirect

Social login in the app returns via a deep link. In Supabase Dashboard →
Authentication → URL Configuration → **Redirect URLs**, add:

```
com.daanik.bhao://login-callback
```

(The `AndroidManifest.xml` intent filter for this scheme/host is already in place.)

`npm run android:sha1` prints the SHA-1 / SHA-256 of the debug and upload keys and explains
where each is used. The Custom Tab login above uses Google's **Web** OAuth client (configured
in Supabase → Authentication → Providers → Google), so it needs no SHA-1. An Android OAuth
client (package + SHA-1) is only required if the app later switches to native Google Sign-In;
then register the Play App Signing SHA-1 (Play Console → Test and release → App integrity),
the upload SHA-1 and the debug SHA-1.

## Release build config (checked 2026-10)

- **R8 on** (`minifyEnabled true`, `shrinkResources true`, `proguard-android-optimize.txt`).
  It only shrinks the Java side (AndroidX + Capacitor, release APK ~2.3 MB vs 5.3 MB debug);
  the web game in `assets/public` is untouched. Plugins are loaded by reflection, so
  `android/app/proguard-rules.pro` keeps `com.getcapacitor.**`, every `@CapacitorPlugin` /
  `Plugin` subclass, the `@JavascriptInterface` bridge and Cordova classes. Verified on an
  emulator: all plugins registered, navigation and the back button (App plugin) work.
  After each bundle upload `app/build/outputs/mapping/release/mapping.txt` to Play Console
  (App bundle explorer → the version → Downloads → ReTrace mapping file) for readable crashes.
  If a new plugin misbehaves only in release builds, add a `-keep class <its package>.** { *; }`.
- **16 KB page size**: the app ships **no native `.so` libraries** (Capacitor and all plugins
  are pure Java/Kotlin; the WebView comes from the system), so Play's 16 KB requirement is met
  automatically. `zipalign -c -P 16 4` passes on the APK. Re-check if a plugin with native code
  is added: `C:\Users\Administrator\AndroidDev\sdk\build-tools\36.0.0\zipalign.exe -c -P 16 -v 4 app.apk`.
- **targetSdk 36 / compileSdk 36, minSdk 24**: meets Play's target-API rule (35+ required
  for new apps and updates since 31 Aug 2025).
- **Edge-to-edge**: Android 15+ forces edge-to-edge for targetSdk 35+; `MainActivity` pads the
  WebView by the system-bar/cutout insets, so nothing is hidden under the bars. Play Console may
  still show an advisory "uses deprecated APIs for edge-to-edge" (`statusBarColor` /
  `navigationBarColor` in `styles.xml` and Capacitor's StatusBar plugin); those calls are no-ops on
  Android 15+ and only used on older versions. It is a warning, not a rejection.

## Notes

- The service worker (PWA offline cache) is not registered inside the app; the web files
  ship in the APK, so a new app version always shows the new web build.
- System bars: the WebView is kept between the status bar and the navigation/gesture bar
  (see `MainActivity.java`); those strips use the app's dark green `#001010`.
- Microphone permission is asked the first time voice chat starts.
