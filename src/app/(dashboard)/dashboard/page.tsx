"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/contexts/ModalContext";
import { useNotifications, Transaction } from "@/contexts/NotificationContext";
import { useToast } from "@/contexts/ToastContext";
import {
  CryptoMarketProvider,
  useCryptoPrices,
} from "@/components/client/CryptoMarketProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import TransactionDetailsModal from "@/components/client/TransactionDetailsModal";
import AssetDetailsModal from "@/components/client/AssetDetailsModal";
import AddCryptoModal from "@/components/client/AddCryptoModal";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCurrency } from "@/contexts/CurrencyContext";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Dashboard content component with crypto integration
function DashboardContent() {
  const { data: session, status } = useSession();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();

  // Get portfolio first to know which symbols to fetch
  const {
    portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch,
  } = usePortfolio("all");

  // Memoize portfolio symbols to prevent unnecessary re-subscriptions
  const portfolioSymbols = useMemo(
    () => portfolio?.portfolio?.assets?.map((a: any) => a.symbol) || [],
    [portfolio?.portfolio?.assets]
  );

  // Re-enabled: Fetch real-time crypto prices for portfolio assets
  const cryptoPrices = useCryptoPrices(portfolioSymbols);

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
  const [activeView, setActiveView] = useState<"crypto" | "history">("crypto");
  const [showAddCryptoModal, setShowAddCryptoModal] = useState(false);

  // Load activeView from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedView = localStorage.getItem("dashboardActiveView") as
      | "crypto"
      | "history";
    if (savedView) {
      setActiveView(savedView);
    }
  }, []);

  // Persist activeView to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardActiveView", activeView);
    }
  }, [activeView]);

  // Removed "Just now" timer to prevent unnecessary re-renders

  // Wait for session to fully load before rendering dashboard
  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
          .sort((a: any, b: any) => b.value - a.value) // Sort by asset value highest first
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
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="text-3xl sm:text-5xl font-bold text-white mb-2">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-12 w-48 rounded"></div>
            ) : (
              formatAmount(portfolioValue || 0, 2)
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
              formatAmount(availableBalance || 0, 2)
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
                  Math.max((availableBalance / 10000) * 100, 0),
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
                            {formatAmount(asset.currentPrice || 0, 2)}
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
                        {formatAmount(asset.value || 0, 2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History View */}
          {activeView === "history" && (
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <svg
                      className="w-10 h-10 text-gray-400"
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
                  <p className="text-gray-400 text-lg font-medium">
                    No transaction history yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Your transactions will appear here
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => {
                  // Format transaction type text
                  const getTransactionText = () => {
                    if (activity.type === "buy")
                      return `${activity.asset} Bought`;
                    if (activity.type === "sell")
                      return `${activity.asset} Sold`;
                    if (activity.type === "transfer")
                      return `${activity.asset} Transferred`;
                    if (activity.type === "convert")
                      return `${activity.asset} Swapped`;
                    return `${activity.type} ${activity.asset}`;
                  };

                  // Get transaction type icon and color
                  const getTransactionIcon = () => {
                    const baseClasses =
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0";
                    if (activity.type === "buy")
                      return (
                        <div
                          className={`${baseClasses} bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30`}
                        >
                          <svg
                            className="w-5 h-5 text-green-400"
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
                    if (activity.type === "sell")
                      return (
                        <div
                          className={`${baseClasses} bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30`}
                        >
                          <svg
                            className="w-5 h-5 text-red-400"
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
                    if (activity.type === "transfer")
                      return (
                        <div
                          className={`${baseClasses} bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30`}
                        >
                          <svg
                            className="w-5 h-5 text-blue-400"
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
                    if (activity.type === "convert")
                      return (
                        <div
                          className={`${baseClasses} bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30`}
                        >
                          <svg
                            className="w-5 h-5 text-purple-400"
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
                    return (
                      <div
                        className={`${baseClasses} bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30`}
                      >
                        <CryptoIcon symbol={activity.asset} size="sm" />
                      </div>
                    );
                  };

                  // Format amount with 8 decimals for crypto
                  const formatCryptoAmount = (
                    amount: number,
                    asset: string
                  ) => {
                    if (
                      activity.type === "deposit" ||
                      activity.type === "withdraw"
                    ) {
                      return `${amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                    }
                    return amount.toLocaleString("en-US", {
                      minimumFractionDigits: 8,
                      maximumFractionDigits: 8,
                    });
                  };

                  // Get crypto price and calculate fiat value
                  const getCryptoPrice = () => {
                    const assetSymbol = activity.asset?.split(" ")[0];
                    return cryptoPrices[assetSymbol]?.price || 0;
                  };

                  const getFiatValue = () => {
                    if (
                      activity.type === "deposit" ||
                      activity.type === "withdraw"
                    ) {
                      return convertAmount(activity.amount || 0);
                    }
                    const price = getCryptoPrice();
                    const usdValue = (activity.amount || 0) * price;
                    return convertAmount(usdValue);
                  };

                  // Format date and time
                  const formatDateTime = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return "Just now";
                      if (diffMins < 60) return `${diffMins}m ago`;
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays < 7) return `${diffDays}d ago`;

                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    } catch {
                      return timestamp;
                    }
                  };

                  const formatFullDateTime = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      return date.toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {
                      return timestamp;
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      onClick={() => handleTransactionClick(activity)}
                      className="group relative p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl border border-gray-700/50 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-3">
                        {/* Transaction Icon */}
                        {getTransactionIcon()}

                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-sm sm:text-base mb-0.5 truncate">
                                {getTransactionText()}
                              </h3>
                              <p className="text-gray-400 text-xs truncate">
                                {formatFullDateTime(activity.timestamp)}
                              </p>
                            </div>
                            <div
                              className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide flex-shrink-0 ${
                                activity.status === "completed"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : activity.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {activity.status}
                            </div>
                          </div>

                          {/* Amount Row - Crypto and Fiat */}
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-white font-bold text-base sm:text-lg">
                                {formatCryptoAmount(
                                  activity.amount || 0,
                                  activity.asset?.split(" ")[0] || ""
                                )}
                              </span>
                              <span className="text-gray-400 font-medium text-sm">
                                {activity.asset?.split(" ")[0]}
                              </span>
                            </div>
                            <span className="text-gray-500 hidden sm:inline">
                              •
                            </span>
                            <span className="text-gray-400 font-medium text-sm">
                              ≈ {formatAmount(getFiatValue(), 2)}
                            </span>
                          </div>

                          {/* Show confirmation progress for pending deposits */}
                          {activity.status === "pending" &&
                            activity.type === "deposit" &&
                            activity.confirmations !== undefined && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
                                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
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
                                <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                                  {activity.confirmations}/
                                  {activity.maxConfirmations || 6} confirmations
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-2">
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
                    </div>
                  );
                })
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
        allAssets={userAssets}
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
                        {formatAmount(asset.value || 0, 2)}
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
                {recentActivity.map((activity) => {
                  // Format transaction type text
                  const getTransactionText = () => {
                    if (activity.type === "buy")
                      return `${activity.asset} Bought`;
                    if (activity.type === "sell")
                      return `${activity.asset} Sold`;
                    if (activity.type === "transfer")
                      return `${activity.asset} Transferred`;
                    if (activity.type === "convert")
                      return `${activity.asset} Swapped`;
                    return `${activity.type} ${activity.asset}`;
                  };

                  // Format amount with 8 decimals for crypto
                  const formatCryptoAmount = (
                    amount: number,
                    asset: string
                  ) => {
                    if (
                      activity.type === "deposit" ||
                      activity.type === "withdraw"
                    ) {
                      return `$${amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                    }
                    return `${amount.toFixed(8)} ${asset}`;
                  };

                  // Format date and time
                  const formatDateTime = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
                      const timeStr = date.toTimeString().split(" ")[0]; // HH:MM:SS
                      return `${dateStr} ${timeStr}`;
                    } catch {
                      return timestamp;
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      onClick={() => {
                        setShowAllActivity(false);
                        handleTransactionClick(activity);
                      }}
                      className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:border-orange-500/30"
                    >
                      <CryptoIcon symbol={activity.asset} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">
                            {getTransactionText()}
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
                            {formatCryptoAmount(
                              activity.amount,
                              activity.asset
                            )}{" "}
                            (${formatAmount(activity.value || 0, 2)})
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDateTime(activity.timestamp)}
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
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Dashboard component with real-time crypto prices
export default function DashboardPage() {
  return (
    <CryptoMarketProvider>
      <DashboardContent />
    </CryptoMarketProvider>
  );
}
