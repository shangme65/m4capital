import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "online.m4capital.app",
  appName: "M4Capital",
  webDir: "out",
  server: {
    // Load from your live website URL inside the app's WebView
    url: "https://m4capital.online",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
    // This ensures the app uses its internal WebView, not external browser
    webContentsDebuggingEnabled: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: false,
      androidSpinnerStyle: "small",
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: "default",
      backgroundColor: "#ffffff",
      overlaysWebView: false,
    },
  },
};

export default config;
