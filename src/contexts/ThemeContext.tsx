"use client";

import React, { createContext, useContext, useEffect, useState, useLayoutEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "m4capital-theme";

// Get initial theme synchronously to prevent flash
function getInitialTheme(): { theme: Theme; resolved: "light" | "dark" } {
  if (typeof window === "undefined") {
    return { theme: "system", resolved: "dark" };
  }
  
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  const theme = savedTheme || "system";
  
  let resolved: "light" | "dark";
  if (theme === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } else {
    resolved = theme;
  }
  
  return { theme, resolved };
}

// Apply theme to document immediately
function applyThemeToDocument(resolved: "light" | "dark") {
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return saved || "system";
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const initial = getInitialTheme();
    // Apply immediately during initialization
    applyThemeToDocument(initial.resolved);
    return initial.resolved;
  });

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  };

  // Update the document class and resolved theme
  const updateTheme = (newTheme: Theme) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved);
  };

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    updateTheme(newTheme);
  };

  // Ensure theme is applied on mount (for SSR hydration)
  useLayoutEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialTheme = savedTheme || "system";
    const resolved = initialTheme === "system" ? getSystemTheme() : initialTheme;
    setThemeState(initialTheme);
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        updateTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
