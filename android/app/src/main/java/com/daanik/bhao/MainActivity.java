package com.daanik.bhao;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applySystemBarInsets();
    }

    /**
     * Android 15+ (targetSdk 35+) always draws apps edge-to-edge. Keep the WebView
     * between the status bar / display cutout and the navigation / gesture bar by
     * padding the decor view, so no page content is hidden under the system bars.
     * The padded strips show the window background (@color/bhao_dark).
     *
     * The insets handed on to the WebView are zeroed, so CSS env(safe-area-inset-*)
     * resolves to 0 and the page does not add a second, duplicate inset.
     * This mirrors Capacitor's SystemBars "padding" mode; SystemBars.insetsHandling
     * is "disable" in capacitor.config.ts so the two listeners do not compete.
     */
    private void applySystemBarInsets() {
        View decorView = getWindow().getDecorView();
        final int barTypes = WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout();

        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {
            Insets bars = insets.getInsets(barTypes);
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            // With the keyboard open, lift the content above it (the IME inset
            // already includes the navigation bar height).
            int bottom = keyboardVisible ? Math.max(ime.bottom, bars.bottom) : bars.bottom;
            v.setPadding(bars.left, bars.top, bars.right, bottom);

            // Returning CONSUMED breaks later safe-area recalculation in the WebView
            // (https://issues.chromium.org/issues/461332423), so pass zero insets instead.
            return new WindowInsetsCompat.Builder(insets).setInsets(barTypes, Insets.NONE).build();
        });
        ViewCompat.requestApplyInsets(decorView);
    }
}
