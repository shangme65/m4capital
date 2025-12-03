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

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
];

// Map countries to default languages
export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  US: "en",
  GB: "en",
  AU: "en",
  CA: "en",
  NZ: "en",
  IE: "en",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  BR: "pt",
  PT: "pt",
  FR: "fr",
  BE: "fr",
  CH: "fr",
  DE: "de",
  AT: "de",
  IT: "it",
  RU: "ru",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  JP: "ja",
  KR: "ko",
  SA: "ar",
  AE: "ar",
  EG: "ar",
  IN: "hi",
  TR: "tr",
  NL: "nl",
  PL: "pl",
};

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
          if (savedLanguage) {
            setLanguageState(savedLanguage);
          } else {
            // Try to detect from browser
            const browserLang = navigator.language.split("-")[0];
            if (SUPPORTED_LANGUAGES.find((l) => l.code === browserLang)) {
              setLanguageState(browserLang);
            }
          }
        } catch {
          // localStorage not available (SSR)
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
