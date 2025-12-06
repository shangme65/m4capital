"use client";

import { useEffect } from "react";

export default function CapacitorStatusBar() {
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        // Only run in Capacitor native app
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");

        // Set dark background with light (white) icons
        await StatusBar.setBackgroundColor({ color: "#0f172a" });
        await StatusBar.setStyle({ style: Style.Dark }); // Dark style = light/white icons
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        // Not in Capacitor or StatusBar plugin not available
        console.log("StatusBar plugin not available:", error);
      }
    };

    initStatusBar();
  }, []);

  return null;
}
