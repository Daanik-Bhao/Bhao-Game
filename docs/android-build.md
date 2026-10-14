# Android app (Capacitor)

The Android app wraps the same web build (`dist/`) in a Capacitor WebView.
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
| `npm run android:bundle` | sync + signed release AAB → `android/app/build/outputs/bundle/release/app-release.aab` (needs the keystore, see 3) |
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

## Notes

- The service worker (PWA offline cache) is not registered inside the app; the web files
  ship in the APK, so a new app version always shows the new web build.
- System bars: the WebView is kept between the status bar and the navigation/gesture bar
  (see `MainActivity.java`); those strips use the app's dark green `#001010`.
- Microphone permission is asked the first time voice chat starts.
