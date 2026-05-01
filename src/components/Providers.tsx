"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SessionExpiryGuard from "@/components/client/SessionExpiryGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <SessionExpiryGuard />
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
