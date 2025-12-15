import { useState, useEffect, useCallback, useRef } from "react";

interface PortfolioAsset {
  symbol: string;
  amount: number;
  averagePrice: number;
}

interface Portfolio {
  balance: number;
  balanceCurrency?: string;
  assets: PortfolioAsset[];
  recentDeposits: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  recentWithdrawals: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  // optional aggregates provided by the API
  totalDeposited?: number;
  totalWithdrawn?: number;
  netAdded?: number;
  incomePercent?: number;
  // period-specific aggregates
  period?: string; // 'all' | 'today' | '7d' | '30d'
  periodDeposits?: number;
  periodWithdrawals?: number;
  periodTradeEarnings?: number;
  periodNetChange?: number;
  periodIncomePercent?: number;
}

interface PortfolioUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accountType: string;
}

interface PortfolioData {
  user: PortfolioUser;
  portfolio: Portfolio;
}

export const usePortfolio = (period: string = "all") => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null); // Track last fetched period to prevent duplicate calls

  const fetchPortfolio = useCallback(
    async (fetchPeriod?: string) => {
      try {
        const queryPeriod = fetchPeriod || period;
        setIsLoading(true);
        const response = await fetch(`/api/portfolio?period=${queryPeriod}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for NextAuth session cookies
        });

        if (!response.ok) {
          // Handle authentication errors gracefully
          if (response.status === 401) {
            setError("Authentication required");
            setIsLoading(false);
            return; // Don't throw error for auth issues
          }

          // Try to parse JSON, but handle cases where it's not JSON
          let errorMessage = `Failed to fetch portfolio (${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
          setError(errorMessage);
          setIsLoading(false);
          return; // Don't throw, just set error state
        }

        const data = await response.json();
        setPortfolio(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty dependencies - period is captured in closure
  );

  useEffect(() => {
    // Only fetch if period actually changed or we haven't fetched yet
    if (hasFetchedRef.current !== period) {
      hasFetchedRef.current = period;
      fetchPortfolio(period);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]); // Only re-fetch when period actually changes

  // Polling for portfolio updates every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Only poll if document is visible
      if (document.visibilityState === "visible") {
        fetchPortfolio(period);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [period, fetchPortfolio]);

  // Refetch on window focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPortfolio(period);
      }
    };

    const handleFocus = () => {
      fetchPortfolio(period);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [period, fetchPortfolio]);

  return {
    portfolio,
    isLoading,
    error,
    refetch: fetchPortfolio,
  };
};
