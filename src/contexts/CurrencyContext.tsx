"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import {
  getExchangeRates,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/currencies";

interface CurrencyContextType {
  preferredCurrency: string;
  exchangeRates: Record<string, number>;
  isLoading: boolean;
  convertAmount: (amountUSD: number) => number;
  formatAmount: (amountUSD: number, decimals?: number) => string;
  refreshRates: () => Promise<void>;
  refreshCurrency: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [preferredCurrency, setPreferredCurrency] = useState(
    session?.user?.preferredCurrency || "USD"
  );
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update preferred currency immediately when session loads
  useEffect(() => {
    if (session?.user?.preferredCurrency) {
      setPreferredCurrency(session.user.preferredCurrency);
    }
  }, [session?.user?.preferredCurrency]);

  // Fetch user's preferred currency
  const fetchPreferredCurrency = useCallback(async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch("/api/user/currency");
        if (response.ok) {
          const data = await response.json();
          setPreferredCurrency(data.currency || "USD");
        }
      } catch (error) {
        console.error("Failed to fetch preferred currency:", error);
      }
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchPreferredCurrency();
  }, [fetchPreferredCurrency]);

  // Listen for currency change events from other tabs/components
  useEffect(() => {
    const handleCurrencyChange = () => {
      fetchPreferredCurrency();
    };

    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () =>
      window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, [fetchPreferredCurrency]);

  // Fetch exchange rates
  const refreshRates = async () => {
    try {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    }
  };

  useEffect(() => {
    refreshRates();
    // Polling disabled - rates will refresh on page reload
  }, []);

  const convertAmount = (amountUSD: number): number => {
    return convertCurrency(amountUSD, preferredCurrency, exchangeRates);
  };

  const formatAmount = (amountUSD: number, decimals: number = 2): string => {
    const converted = convertAmount(amountUSD);
    return formatCurrencyUtil(converted, preferredCurrency, decimals);
  };

  // Expose function to refresh currency (can be called after settings change)
  const refreshCurrency = async () => {
    await fetchPreferredCurrency();
  };

  return (
    <CurrencyContext.Provider
      value={{
        preferredCurrency,
        exchangeRates,
        isLoading,
        convertAmount,
        formatAmount,
        refreshRates,
        refreshCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
