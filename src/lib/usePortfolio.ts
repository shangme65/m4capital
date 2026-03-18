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
  const periodRef = useRef(period); // Track period in ref to avoid recreating fetchPortfolio

  // Update period ref when it changes
  useEffect(() => {
    periodRef.current = period;
  }, [period]);

  const fetchPortfolio = useCallback(
    async (fetchPeriod?: string, skipLoadingState = false) => {
      try {
        const queryPeriod = fetchPeriod || periodRef.current;
        
        // Only show loading state on initial fetch
        if (!skipLoadingState) {
          setIsLoading(true);
        }
        
        const response = await fetch(`/api/portfolio?period=${queryPeriod}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for NextAuth session cookies
          // Use cache: 'force-cache' with revalidation for faster loads
          cache: 'no-store',
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
        
        // Cache in localStorage for instant loading next time
        try {
          localStorage.setItem(`portfolio_${queryPeriod}`, JSON.stringify(data));
          localStorage.setItem(`portfolio_${queryPeriod}_timestamp`, Date.now().toString());
        } catch (e) {
          // Ignore localStorage errors (quota exceeded, etc.)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [] // No dependencies - use periodRef.current instead
  );

  useEffect(() => {
    // Only fetch if period actually changed or we haven't fetched yet
    if (hasFetchedRef.current !== period) {
      hasFetchedRef.current = period;
      
      // Try to load from localStorage cache first for instant display
      try {
        const cached = localStorage.getItem(`portfolio_${period}`);
        const timestamp = localStorage.getItem(`portfolio_${period}_timestamp`);
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          // Use cached data if less than 10 seconds old
          if (age < 10000) {
            setPortfolio(JSON.parse(cached));
            setIsLoading(false);
            // Still fetch fresh data in background
            fetchPortfolio(period, true);
            return;
          }
        }
      } catch (e) {
        // Ignore cache errors, proceed with normal fetch
      }
      
      fetchPortfolio(period);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]); // Only re-fetch when period actually changes

  // Polling for portfolio updates every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Only poll if document is visible
      if (document.visibilityState === "visible") {
        fetchPortfolio(periodRef.current, true); // Skip loading state for background updates
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [fetchPortfolio]); // fetchPortfolio is now stable

  // Refetch on window focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchPortfolio(periodRef.current, true); // Skip loading state for background updates
      }
    };

    const handleFocus = () => {
      fetchPortfolio(periodRef.current, true); // Skip loading state for background updates
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
