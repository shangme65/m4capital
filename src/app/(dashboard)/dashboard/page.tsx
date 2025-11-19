"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/contexts/ModalContext";
import { useNotifications, Transaction } from "@/contexts/NotificationContext";
import { useToast } from "@/contexts/ToastContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  CryptoMarketProvider,
  useBitcoinPrice,
  useCryptoPrices,
} from "@/components/client/CryptoMarketProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import TransactionDetailsModal from "@/components/client/TransactionDetailsModal";
import AssetDetailsModal from "@/components/client/AssetDetailsModal";
import AddCryptoModal from "@/components/client/AddCryptoModal";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Dashboard content component with crypto integration
function DashboardContent() {
  const { data: session, status } = useSession();
  const btcPrice = useBitcoinPrice();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();

  // Get portfolio first to know which symbols to fetch
  const {
    portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch,
  } = usePortfolio("all");

  // Get real-time prices for all portfolio assets
  const portfolioSymbols =
    portfolio?.portfolio?.assets?.map((a: any) => a.symbol) || [];
  const cryptoPrices = useCryptoPrices(portfolioSymbols);

  // Debug logging for session
  console.log("🎯 Dashboard Component Rendered");
  console.log("🔐 Session Status:", status);
  console.log(
    "👤 Session Data:",
    session ? { user: session.user } : "No session"
  );

  const {
    openDepositModal,
    openWithdrawModal,
    openBuyModal,
    openTransferModal,
    openConvertModal,
    openSellModal,
  } = useModal();
  const { recentActivity } = useNotifications();
  const { showSuccess, showError } = useToast();
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activeView, setActiveView] = useState<"crypto" | "history">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("dashboardActiveView") as "crypto" | "history") ||
        "crypto"
      );
    }
    return "crypto";
  });
  const [showAddCryptoModal, setShowAddCryptoModal] = useState(false);

  // Persist activeView to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardActiveView", activeView);
    }
  }, [activeView]);

  const handleTransactionClick = (transaction: Transaction) => {
    // Enhance transaction with additional details for the modal
    const enhancedTransaction = {
      ...transaction,
      date: new Date(),
      fee:
        transaction.type === "deposit" ? transaction.value * 0.02 : undefined,
      method: transaction.type === "deposit" ? "Bitcoin (BTC)" : undefined,
      description: `${transaction.type} transaction for ${transaction.asset}`,
      confirmations:
        transaction.status === "pending" ? transaction.confirmations || 0 : 6,
      maxConfirmations: 6,
      hash:
        transaction.status !== "failed"
          ? `0x${Math.random().toString(16).substr(2, 64)}`
          : undefined,
      network:
        transaction.asset === "BTC" ? "Bitcoin Network" : "Ethereum Network",
      address:
        transaction.type === "deposit"
          ? `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
          : undefined,
    };

    setSelectedTransaction(enhancedTransaction);
    setShowTransactionDetails(true);
  };

  // Cryptocurrency metadata helper
  const getCryptoMetadata = (symbol: string) => {
    const cryptoData: Record<
      string,
      { name: string; icon: string; color: string; network?: string }
    > = {
      BTC: {
        name: "Bitcoin",
        icon: "₿",
        color: "from-orange-500 to-orange-600",
      },
      ETH: {
        name: "Ethereum",
        icon: "Ξ",
        color: "from-blue-500 to-purple-600",
      },
      XRP: { name: "Ripple", icon: "✕", color: "from-blue-600 to-blue-700" },
      TRX: { name: "Tron", icon: "T", color: "from-red-500 to-red-600" },
      TON: { name: "Toncoin", icon: "💎", color: "from-blue-500 to-cyan-600" },
      LTC: { name: "Litecoin", icon: "Ł", color: "from-gray-400 to-gray-500" },
      BCH: {
        name: "Bitcoin Cash",
        icon: "₿",
        color: "from-green-500 to-green-600",
      },
      ETC: {
        name: "Ethereum Classic",
        icon: "ᗐ",
        color: "from-green-600 to-teal-700",
      },
      USDC: { name: "USD Coin", icon: "$", color: "from-blue-500 to-blue-600" },
      USDT: {
        name: "Tether",
        icon: "₮",
        color: "from-green-500 to-teal-600",
        network: "Ethereum",
      },
    };
    return (
      cryptoData[symbol] || {
        name: symbol,
        icon: "○",
        color: "from-gray-600 to-gray-700",
      }
    );
  };

  // Dynamic user assets with real-time prices for ALL cryptocurrencies
  // Only show actual portfolio assets - no mock/default data
  const userAssets =
    portfolio?.portfolio.assets && portfolio.portfolio.assets.length > 0
      ? portfolio.portfolio.assets
          .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0)) // Sort by amount highest first
          .map((asset: any) => {
            const metadata = getCryptoMetadata(asset.symbol);

            // Get real-time price from CryptoMarketProvider
            const realtimePrice = cryptoPrices[asset.symbol];
            const currentPrice =
              realtimePrice?.price || asset.averagePrice || 0;
            const priceChange = realtimePrice?.changePercent24h || 0;

            return {
              symbol: asset.symbol,
              name: metadata.name,
              network: metadata.network,
              amount: asset.amount,
              currentPrice: currentPrice,
              value: currentPrice * asset.amount,
              change: priceChange,
              icon: metadata.icon,
              color: metadata.color,
            };
          })
      : [];

  // Calculate dynamic portfolio value based on real-time prices
  // Include both crypto assets AND available balance
  const cryptoAssetsValue = portfolioLoading
    ? 0
    : userAssets.reduce((total, asset) => total + asset.value, 0);

  const availableBalance = portfolio?.portfolio?.balance
    ? parseFloat(portfolio.portfolio.balance.toString())
    : 0;

  const portfolioValue = cryptoAssetsValue + availableBalance;

  // Income percent: measure change of user's money (deposits + received + earnings)
  // Use server-provided periodIncomePercent when available for selected period
  const incomePercent =
    portfolio &&
    portfolio.portfolio &&
    typeof portfolio.portfolio.periodIncomePercent === "number"
      ? portfolio.portfolio.periodIncomePercent
      : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated("Just now");
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdated("Just now");
      showSuccess("Portfolio data refreshed");
    } catch (error) {
      showError("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeposit = () => {
    openDepositModal();
  };

  const handleWithdraw = () => {
    openWithdrawModal();
  };

  const handleBuy = () => {
    openBuyModal();
  };

  const handleSell = () => {
    openSellModal();
  };

  const handleTransfer = () => {
    openTransferModal();
  };

  const handleConvert = () => {
    openConvertModal();
  };

  const handleAssetClick = (asset: any) => {
    setSelectedAsset(asset);
    setShowAssetDetails(true);
  };

  const handleViewAllAssets = () => {
    setShowAllAssets(true);
  };

  const handleAddCrypto = () => {
    setShowAddCryptoModal(true);
  };

  const handleAddCryptoAsset = async (symbol: string, name: string) => {
    try {
      const response = await fetch("/api/portfolio/add-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to add cryptocurrency");
        return;
      }

      // Refresh portfolio data
      await refetch();

      // Close modal
      setShowAddCryptoModal(false);

      // Show success message
      showSuccess(`${name} (${symbol}) added successfully!`);
    } catch (error) {
      console.error("Error adding crypto:", error);
      showError("Failed to add cryptocurrency. Please try again.");
    }
  };

  const handleRemoveCryptoAsset = async (symbol: string) => {
    try {
      const response = await fetch("/api/portfolio/remove-asset", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to remove cryptocurrency");
        return;
      }

      // Refresh portfolio data
      await refetch();

      // Show success message
      showSuccess(`${symbol} removed successfully!`);
    } catch (error) {
      console.error("Error removing crypto:", error);
      showError("Failed to remove cryptocurrency. Please try again.");
    }
  };

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  const getActivityIconData = (type: string) => {
    switch (type) {
      case "buy":
        return {
          bgColor: "bg-green-600",
          path: "M7 11l5-5m0 0l5 5m-5-5v12",
        };
      case "sell":
        return {
          bgColor: "bg-red-600",
          path: "M17 13l-5 5m0 0l-5-5m5 5V6",
        };
      case "deposit":
        return {
          bgColor: "bg-blue-600",
          path: "M12 6v6m0 0v6m0-6h6m-6 0H6",
        };
      case "withdraw":
        return {
          bgColor: "bg-gray-600",
          path: "M18 12H6",
        };
      case "convert":
        return {
          bgColor: "bg-orange-600",
          path: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        };
      default:
        return {
          bgColor: "bg-gray-600",
          path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "buy":
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        );
      case "sell":
        return (
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
        );
      case "deposit":
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        );
      case "withdraw":
        return (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 12H6"
              />
            </svg>
          </div>
        );
      case "convert":
        return (
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Portfolio Value Card */}
      <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-8 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Portfolio Value
          </h1>
          <div className="text-xs sm:text-sm text-gray-400">
            <span className="hidden sm:inline">
              Last updated: {lastUpdated}
            </span>
            <span className="sm:hidden">{lastUpdated}</span>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="text-3xl sm:text-5xl font-bold text-white mb-2">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-12 w-48 rounded"></div>
            ) : (
              <>
                {preferredCurrency === "USD"
                  ? "$"
                  : preferredCurrency === "EUR"
                  ? "€"
                  : preferredCurrency === "GBP"
                  ? "£"
                  : preferredCurrency}
                {(convertAmount(portfolioValue || 0) || 0).toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
            ) : (
              <>
                <span
                  className={`text-base sm:text-lg font-medium ${
                    incomePercent >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {incomePercent >= 0 ? "+" : ""}
                  {incomePercent.toFixed(2)}%
                </span>
                <span className="text-gray-400 text-sm sm:text-base">
                  24hrs
                </span>
                {/* Info icon for tooltip */}
                <div className="group relative">
                  <svg
                    className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-700">
                    <div className="text-center">
                      This percentage measures changes to your account balance
                      from deposits, withdrawals and trading results (not market
                      price movement).
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {portfolioError && (
            <div className="text-red-400 text-sm mt-2">
              Failed to load portfolio data: {portfolioError}
              {status === "unauthenticated" && (
                <div className="text-yellow-400 mt-1">
                  ⚠️ You are not logged in. Please{" "}
                  <a href="/signin" className="underline">
                    sign in
                  </a>{" "}
                  to view your portfolio.
                </div>
              )}
              <button
                onClick={() => refetch()}
                className="ml-2 underline hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
          <button
            onClick={handleDeposit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium border border-gray-600 transition-colors text-sm sm:text-base"
          >
            Withdraw
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-base sm:text-lg">
            {preferredCurrency} Balance
          </span>
          <span className="text-white text-lg sm:text-xl font-medium">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-6 w-20 rounded"></div>
            ) : (
              <>
                {preferredCurrency === "USD"
                  ? "$"
                  : preferredCurrency === "EUR"
                  ? "€"
                  : preferredCurrency === "GBP"
                  ? "£"
                  : preferredCurrency}
                {(convertAmount(availableBalance || 0) || 0).toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </>
            )}
          </span>
        </div>

        {/* Progress bar - Dynamic based on actual balance */}
        <div className="mt-3">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(
                  Math.max(
                    (convertAmount(availableBalance || 0) / 10000) * 100,
                    0
                  ),
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Trading Actions */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={handleBuy}
          className="bg-green-600 hover:bg-green-700 text-white p-2 sm:p-6 rounded-xl font-semibold text-xs sm:text-lg transition-colors flex flex-col items-center gap-1 sm:gap-2"
        >
          <svg
            className="w-3 h-3 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
          Buy
        </button>

        <button
          onClick={handleSell}
          className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-6 rounded-xl font-semibold text-xs sm:text-lg transition-colors flex flex-col items-center gap-1 sm:gap-2"
        >
          <svg
            className="w-3 h-3 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          </svg>
          Sell
        </button>

        <button
          onClick={handleTransfer}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 sm:p-6 rounded-xl font-semibold text-xs sm:text-lg transition-colors flex flex-col items-center gap-1 sm:gap-2"
        >
          <svg
            className="w-3 h-3 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Transfer
        </button>

        <button
          onClick={handleConvert}
          className="bg-orange-600 hover:bg-orange-700 text-white p-2 sm:p-6 rounded-xl font-semibold text-xs sm:text-lg transition-colors flex flex-col items-center gap-1 sm:gap-2"
        >
          <svg
            className="w-3 h-3 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v6a2 2 0 002 2h2m2-6h10m0 0l-4-4m4 4l-4 4m0 0v-5m0 5h2a2 2 0 002-2V7a2 2 0 00-2-2h-2"
            />
          </svg>
          Swap
        </button>
      </div>

      {/* Crypto and History Toggle View */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-6 border border-gray-700/50">
          {/* Header with Toggle and Add Button */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Crypto Tab */}
              <button
                onClick={() => setActiveView("crypto")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                  activeView === "crypto"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Crypto
              </button>

              {/* History Tab */}
              <button
                onClick={() => setActiveView("history")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                  activeView === "history"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                History
              </button>
            </div>

            {/* Add Crypto Button */}
            <button
              onClick={handleAddCrypto}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap flex-shrink-0"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add
            </button>
          </div>

          {/* Crypto View */}
          {activeView === "crypto" && (
            <div className="space-y-4">
              {userAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">No crypto assets yet</p>
                  <button
                    onClick={handleAddCrypto}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Add your first crypto →
                  </button>
                </div>
              ) : (
                userAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => handleAssetClick(asset)}
                    className="flex items-center justify-between p-4 bg-transparent hover:bg-gray-900/30 transition-colors cursor-pointer rounded-lg"
                  >
                    {/* Left side: Icon and Info */}
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={asset.symbol} size="md" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-base">
                            {asset.symbol}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {asset.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-white font-medium text-sm">
                            $
                            {(asset.currentPrice || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              asset.change >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {asset.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Holdings */}
                    <div className="text-right">
                      <div className="text-white font-bold text-base">
                        {(asset.amount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 8,
                        })}
                      </div>
                      <div className="text-gray-400 text-sm mt-0.5">
                        {preferredCurrency === "USD"
                          ? "$"
                          : preferredCurrency === "EUR"
                          ? "€"
                          : preferredCurrency === "GBP"
                          ? "£"
                          : preferredCurrency}
                        {(convertAmount(asset.value || 0) || 0).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History View */}
          {activeView === "history" && (
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400">No transaction history yet</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => handleTransactionClick(activity)}
                    className="flex items-center gap-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:border-orange-500/30"
                  >
                    {getActivityIcon(activity.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-medium capitalize truncate">
                          {activity.type} {activity.asset}
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            activity.status === "completed"
                              ? "bg-green-900/50 text-green-400"
                              : "bg-yellow-900/50 text-yellow-400"
                          }`}
                        >
                          {activity.status}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="text-gray-400 text-sm">
                          {activity.type === "deposit" ||
                          activity.type === "withdraw"
                            ? `$${(activity.amount || 0).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}`
                            : `${activity.amount || 0} ${
                                activity.asset?.split(" ")[0] || ""
                              }`}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {activity.timestamp}
                        </div>
                      </div>

                      {/* Show confirmation progress for pending deposits */}
                      {activity.status === "pending" &&
                        activity.type === "deposit" &&
                        activity.confirmations !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (activity.confirmations /
                                      (activity.maxConfirmations || 6)) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {activity.confirmations}/
                              {activity.maxConfirmations || 6}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Click indicator */}
                    <div className="text-gray-500 hover:text-orange-400 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => setShowTransactionDetails(false)}
        transaction={selectedTransaction}
      />

      {/* Asset Details Modal */}
      <AssetDetailsModal
        isOpen={showAssetDetails}
        onClose={() => setShowAssetDetails(false)}
        asset={selectedAsset}
        userBalance={
          portfolio?.portfolio?.balance
            ? parseFloat(portfolio.portfolio.balance.toString())
            : 0
        }
      />

      {/* Add Crypto Modal */}
      <AddCryptoModal
        isOpen={showAddCryptoModal}
        onClose={() => setShowAddCryptoModal(false)}
        onAdd={handleAddCryptoAsset}
        onRemove={handleRemoveCryptoAsset}
        existingAssets={userAssets.map((asset) => ({
          symbol: asset.symbol,
          amount: asset.amount,
        }))}
      />

      {/* All Assets Modal */}
      <AnimatePresence>
        {showAllAssets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAllAssets(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">All Assets</h2>
                <button
                  onClick={() => setShowAllAssets(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setShowAllAssets(false);
                      handleAssetClick(asset);
                    }}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700/30 cursor-pointer hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-white">
                        {asset.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {asset.symbol}
                          </span>
                          <span
                            className={`text-sm ${
                              asset.change >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {asset.change.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {preferredCurrency === "USD"
                          ? "$"
                          : preferredCurrency === "EUR"
                          ? "€"
                          : preferredCurrency === "GBP"
                          ? "£"
                          : preferredCurrency}
                        {(convertAmount(asset.value || 0) || 0).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {(asset.amount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                        })}{" "}
                        {asset.symbol}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Activity Modal */}
      <AnimatePresence>
        {showAllActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAllActivity(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Transaction History
                </h2>
                <button
                  onClick={() => setShowAllActivity(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => {
                      setShowAllActivity(false);
                      handleTransactionClick(activity);
                    }}
                    className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:border-orange-500/30"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        getActivityIconData(activity.type).bgColor
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={getActivityIconData(activity.type).path}
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">
                          {activity.type} {activity.asset}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === "completed"
                              ? "bg-green-900/30 text-green-400"
                              : activity.status === "pending"
                              ? "bg-orange-900/30 text-orange-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-sm">
                          $
                          {(activity.value || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {activity.timestamp}
                        </span>
                      </div>

                      {/* Show confirmation progress for pending deposits */}
                      {activity.status === "pending" &&
                        activity.type === "deposit" &&
                        activity.confirmations !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (activity.confirmations /
                                      (activity.maxConfirmations || 6)) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {activity.confirmations}/
                              {activity.maxConfirmations || 6}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Dashboard component wrapped with crypto provider
export default function DashboardPage() {
  return (
    <CryptoMarketProvider>
      <DashboardContent />
    </CryptoMarketProvider>
  );
}
