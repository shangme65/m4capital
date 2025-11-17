"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
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
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's preferred currency
  useEffect(() => {
    const fetchPreferredCurrency = async () => {
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
    };
    fetchPreferredCurrency();
  }, [session]);

  // Fetch exchange rates
  const refreshRates = async () => {
    try {
      const rates = await getExchangeRates();
      setExchangeRates(rates);
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRates();
    // Refresh rates every hour
    const interval = setInterval(refreshRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = (amountUSD: number): number => {
    return convertCurrency(amountUSD, preferredCurrency, exchangeRates);
  };

  const formatAmount = (amountUSD: number, decimals: number = 2): string => {
    const converted = convertAmount(amountUSD);
    return formatCurrencyUtil(converted, preferredCurrency, decimals);
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
