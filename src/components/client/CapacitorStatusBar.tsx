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

        // Detect current theme
        const isDarkMode = document.documentElement.classList.contains("dark");

        if (isDarkMode) {
          // Dark mode: Dark background (#0f172a) with light/white icons
          await StatusBar.setBackgroundColor({ color: "#0f172a" });
          await StatusBar.setStyle({ style: Style.Dark }); // Light icons
        } else {
          // Light mode: Light background (#f8fafc - slate-50) with dark icons
          await StatusBar.setBackgroundColor({ color: "#f8fafc" });
          await StatusBar.setStyle({ style: Style.Light }); // Dark icons
        }
        await StatusBar.setOverlaysWebView({ overlay: false });

        // Listen for theme changes
        const observer = new MutationObserver(async (mutations) => {
          for (const mutation of mutations) {
            if (
              mutation.type === "attributes" &&
              mutation.attributeName === "class"
            ) {
              const isDark =
                document.documentElement.classList.contains("dark");
              if (isDark) {
                await StatusBar.setBackgroundColor({ color: "#0f172a" });
                await StatusBar.setStyle({ style: Style.Dark });
              } else {
                await StatusBar.setBackgroundColor({ color: "#f8fafc" });
                await StatusBar.setStyle({ style: Style.Light });
              }
            }
          }
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        });

        return () => observer.disconnect();
      } catch (error) {
        // Not in Capacitor or StatusBar plugin not available
        console.log("StatusBar plugin not available:", error);
      }
    };

    initStatusBar();
  }, []);

  return null;
}
