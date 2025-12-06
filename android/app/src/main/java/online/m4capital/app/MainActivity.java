package online.m4capital.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.FrameLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // CRITICAL: Clear fullscreen flags first
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        
        // Set status bar to be visible with our color
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#0f172a"));
        
        // CRITICAL: Tell system to fit content within system bars
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(true);
        } else {
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }
    
    @Override
    public void onStart() {
        super.onStart();
        
        // Get the WebView that Capacitor created
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Get the parent container
            ViewGroup parent = (ViewGroup) webView.getParent();
            if (parent != null) {
                // CRITICAL: Enable fitsSystemWindows on parent container
                parent.setFitsSystemWindows(true);
                parent.requestApplyInsets();
            }
            
            // Also set on WebView itself
            webView.setFitsSystemWindows(true);
            webView.requestApplyInsets();
        }
    }
}
