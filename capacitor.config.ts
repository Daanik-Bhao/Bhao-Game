import type { CapacitorConfig } from '@capacitor/cli'

// Dark green used behind the system bars, the splash and the WebView before the
// page paints. Matches --green-black in src/index.css.
const APP_DARK = '#001010'

const config: CapacitorConfig = {
  appId: 'com.daanik.bhao',
  appName: 'BHAO',
  webDir: 'dist',
  backgroundColor: APP_DARK,
  server: {
    // Serve the bundled web app from https://localhost (secure context: needed for
    // getUserMedia / WebRTC voice chat, crypto.subtle, service-worker checks etc.).
    androidScheme: 'https',
    hostname: 'localhost',
  },
  android: {
    allowMixedContent: false,
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      // Hide automatically so the web code does not have to call SplashScreen.hide().
      launchShowDuration: 800,
      launchAutoHide: true,
      launchFadeOutDuration: 200,
      backgroundColor: APP_DARK,
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      // "DARK" = light icons, for a dark bar background.
      style: 'DARK',
      backgroundColor: APP_DARK,
      overlaysWebView: false,
    },
    SystemBars: {
      // Insets are handled natively in MainActivity: the WebView is always laid out
      // between the status bar and the gesture/navigation bar (padding), so pages that
      // don't use env(safe-area-inset-*) are never drawn under the system bars.
      // Capacitor's 'css'/'native' modes would instead pass insets through to the page
      // on WebView >= 140 because index.html has viewport-fit=cover, and several
      // screens do not pad for the top inset.
      insetsHandling: 'disable',
      style: 'DARK',
    },
  },
}

export default config
