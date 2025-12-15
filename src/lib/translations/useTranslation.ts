"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, TranslationKey } from "./translations";

/**
 * Hook for translating text in components
 * @returns t function that translates keys to current language
 *
 * Usage:
 * const { t } = useTranslation();
 * <h1>{t("hero.title1")}</h1>
 */
export function useTranslation() {
  const { language } = useLanguage();

  // React 19: No useCallback needed - React Compiler handles memoization
  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  return { t, language };
}

/**
 * Helper function for translating text outside of React components
 * Note: This requires the language to be passed manually
 *
 * Usage:
 * translate("en", "hero.title1")
 */
export function translate(language: string, key: TranslationKey): string {
  return getTranslation(language, key);
}
