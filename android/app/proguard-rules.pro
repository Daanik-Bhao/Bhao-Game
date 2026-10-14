# R8 rules for the release build (minifyEnabled true in build.gradle).
# The app is a Capacitor WebView: native code is AndroidX + Capacitor + its plugins.
# Capacitor's own consumer rules (node_modules/@capacitor/android/capacitor/proguard-rules.pro)
# already keep plugins; the rules below repeat them for this app so a plugin that ships
# without consumer rules still works, and keep the JS bridge.

# Readable crash stack traces (line numbers) in Play Console / Sentry, with the
# mapping.txt uploaded to Play Console.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
# Plugin discovery reads annotations at runtime.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Capacitor core + bridge: the WebView calls into it by name (@JavascriptInterface),
# and plugins are instantiated from capacitor.plugins.json by class name.
-keep class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Every Capacitor plugin (official @capacitor/* and @capacitor-community/*).
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.getcapacitor.community.** { *; }

# Cordova compatibility layer (capacitor-cordova-android-plugins).
-keep class org.apache.cordova.** { *; }
-keep public class * extends org.apache.cordova.CordovaPlugin { *; }

# App activity (also referenced from the manifest).
-keep class com.daanik.bhao.** { *; }
