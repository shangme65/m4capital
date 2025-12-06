package online.m4capital.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // Clear fullscreen flags
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        
        // Set status bar color to dark (matching app theme)
        window.setStatusBarColor(Color.parseColor("#0f172a"));
        
        // Don't let content go behind status bar
        window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
        
        // Ensure content doesn't overlap with status bar
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(true);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        // Ensure all links open within the app's WebView, not external browser
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    // Load all URLs within the WebView
                    if (url.startsWith("https://m4capital.online") || 
                        url.startsWith("https://m4capital.com")) {
                        view.loadUrl(url);
                        return true;
                    }
                    // Allow external URLs to open in browser
                    return false;
                }
            });
        }
    }
}
