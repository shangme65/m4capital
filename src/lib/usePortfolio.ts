import { useState, useEffect } from "react";

interface PortfolioAsset {
  symbol: string;
  amount: number;
  averagePrice: number;
}

interface Portfolio {
  balance: number;
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

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🎯 usePortfolio hook initialized");

  const fetchPortfolio = async () => {
    try {
      console.log("🔄 Fetching portfolio data...");
      setIsLoading(true);
      const response = await fetch("/api/portfolio", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for NextAuth session cookies
      });

      console.log(
        "📡 Portfolio API response:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        // Handle authentication errors gracefully
        if (response.status === 401) {
          console.log("⚠️ Not authenticated - user needs to login");
          setError("Authentication required");
          setIsLoading(false);
          return; // Don't throw error for auth issues
        }

        // Try to parse JSON, but handle cases where it's not JSON
        let errorMessage = `Failed to fetch portfolio (${response.status})`;
        try {
          const errorData = await response.json();
          console.log("⚠️ Portfolio API error:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const textError = await response.text();
          console.log("⚠️ Non-JSON error response:", textError);
          errorMessage = textError || errorMessage;
        }
        setError(errorMessage);
        setIsLoading(false);
        return; // Don't throw, just set error state
      }

      const data = await response.json();
      console.log("✅ Portfolio data received:", data);
      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.log("⚠️ Portfolio fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 usePortfolio useEffect running");
    fetchPortfolio();
  }, []);

  return {
    portfolio,
    isLoading,
    error,
    refetch: fetchPortfolio,
  };
};
