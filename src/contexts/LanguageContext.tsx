"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// Only include languages that have full translations available
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fil", name: "Filipino", nativeName: "Filipino", flag: "🇵🇭" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "fj", name: "Fijian", nativeName: "Vosa Vakaviti", flag: "🇫🇯" },
];

// Map browser locale codes to our supported languages
const LOCALE_LANGUAGE_MAP: Record<string, string> = {
  // English variants
  en: "en",
  "en-US": "en",
  "en-GB": "en",
  "en-AU": "en",
  "en-CA": "en",
  "en-NZ": "en",
  // Spanish variants
  es: "es",
  "es-ES": "es",
  "es-MX": "es",
  "es-AR": "es",
  "es-CO": "es",
  // Portuguese variants
  pt: "pt",
  "pt-BR": "pt",
  "pt-PT": "pt",
  // French variants
  fr: "fr",
  "fr-FR": "fr",
  "fr-CA": "fr",
  "fr-BE": "fr",
  // German variants
  de: "de",
  "de-DE": "de",
  "de-AT": "de",
  "de-CH": "de",
  // Filipino/Tagalog
  fil: "fil",
  tl: "fil",
  // Hindi
  hi: "hi",
  "hi-IN": "hi",
  // Japanese
  ja: "ja",
  "ja-JP": "ja",
  // Polish
  pl: "pl",
  "pl-PL": "pl",
  // Czech
  cs: "cs",
  "cs-CZ": "cs",
  // Turkish
  tr: "tr",
  "tr-TR": "tr",
  // Russian
  ru: "ru",
  "ru-RU": "ru",
  // Korean
  ko: "ko",
  "ko-KR": "ko",
  // Italian
  it: "it",
  "it-IT": "it",
  // Fijian
  fj: "fj",
  "fj-FJ": "fj",
};

// Function to detect browser language
function detectBrowserLanguage(): string {
  if (typeof window === "undefined") return "en";

  try {
    // Try navigator.languages first (ordered list of preferences)
    if (navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        const mapped = LOCALE_LANGUAGE_MAP[lang];
        if (mapped) return mapped;

        // Try base language code (e.g., "es" from "es-MX")
        const baseLang = lang.split("-")[0];
        const baseMapped = LOCALE_LANGUAGE_MAP[baseLang];
        if (baseMapped) return baseMapped;
      }
    }

    // Fallback to navigator.language
    if (navigator.language) {
      const mapped = LOCALE_LANGUAGE_MAP[navigator.language];
      if (mapped) return mapped;

      const baseLang = navigator.language.split("-")[0];
      const baseMapped = LOCALE_LANGUAGE_MAP[baseLang];
      if (baseMapped) return baseMapped;
    }
  } catch (error) {
    console.error("Error detecting browser language:", error);
  }

  return "en"; // Default fallback
}

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  languages: Language[];
  currentLanguage: Language;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [language, setLanguageState] = useState<string>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Get current language object
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === language) ||
    SUPPORTED_LANGUAGES[0];

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch user's preferred language on mount
  useEffect(() => {
    if (!isMounted) return;

    const fetchLanguage = async () => {
      if (status === "loading") return;

      if (session?.user) {
        try {
          const response = await fetch("/api/user/preferences");
          if (response.ok) {
            const data = await response.json();
            if (data.preferredLanguage) {
              setLanguageState(data.preferredLanguage);
            }
          }
        } catch (error) {
          console.error("Error fetching language preference:", error);
        }
      } else {
        // Check localStorage for non-logged-in users
        try {
          const savedLanguage = localStorage.getItem("preferredLanguage");
          if (savedLanguage && SUPPORTED_LANGUAGES.find((l) => l.code === savedLanguage)) {
            setLanguageState(savedLanguage);
          } else {
            // Auto-detect from browser language
            const detectedLanguage = detectBrowserLanguage();
            setLanguageState(detectedLanguage);
            // Save detected language to localStorage
            localStorage.setItem("preferredLanguage", detectedLanguage);
          }
        } catch {
          // localStorage not available (SSR), use detected language
          const detectedLanguage = detectBrowserLanguage();
          setLanguageState(detectedLanguage);
        }
      }
      setIsLoading(false);
    };

    fetchLanguage();
  }, [session, status, isMounted]);

  // Function to update language
  const setLanguage = async (code: string) => {
    setLanguageState(code);

    // Save to localStorage for non-logged-in users
    try {
      localStorage.setItem("preferredLanguage", code);
    } catch {
      // localStorage not available
    }

    // If user is logged in, save to database
    if (session?.user) {
      try {
        await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferredLanguage: code }),
        });
      } catch (error) {
        console.error("Error saving language preference:", error);
      }
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        currentLanguage,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
