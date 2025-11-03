"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/contexts/ModalContext";
import { useNotifications, Transaction } from "@/contexts/NotificationContext";
import {
  CryptoMarketProvider,
  useBitcoinPrice,
} from "@/components/client/CryptoMarketProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import TransactionDetailsModal from "@/components/client/TransactionDetailsModal";
import AssetDetailsModal from "@/components/client/AssetDetailsModal";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Dashboard content component with crypto integration
function DashboardContent() {
  const { data: session } = useSession();
  const btcPrice = useBitcoinPrice();
  const {
    portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch,
  } = usePortfolio();
  const {
    openDepositModal,
    openWithdrawModal,
    openBuyModal,
    openTransferModal,
    openConvertModal,
    openSellModal,
  } = useModal();
  const { recentActivity } = useNotifications();
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    // Enhance transaction with additional details for the modal
    const enhancedTransaction = {
      ...transaction,
      date: new Date(),
      fee:
        transaction.type === "deposit" ? transaction.value * 0.02 : undefined,
      method: transaction.type === "deposit" ? "Bitcoin (BTC)" : undefined,
      description: `${transaction.type} transaction for ${transaction.asset}`,
      confirmations: transaction.status === "pending" ? 3 : 6,
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

  // Get available balance from portfolio
  const availableBalance = portfolio?.portfolio.balance || 0;

  // Dynamic user assets with real-time Bitcoin prices
  // If a user has no portfolio assets yet, don't show demo asset values.
  // Show only the available (fiat) balance (usually 0 until deposit).
  const defaultAssets = [
    {
      symbol: "USDT",
      name: "Tether",
      amount: availableBalance || 0,
      value: availableBalance || 0,
      change: 0,
      icon: "₮",
    },
  ];

  // Use portfolio assets if available, otherwise use default
  const userAssets =
    portfolio?.portfolio.assets && portfolio.portfolio.assets.length > 0
      ? portfolio.portfolio.assets.map((asset: any) => ({
          symbol: asset.symbol,
          name: asset.symbol,
          amount: asset.amount,
          value:
            asset.symbol === "BTC" && btcPrice
              ? btcPrice.price * asset.amount
              : asset.amount * asset.averagePrice,
          change:
            asset.symbol === "BTC" && btcPrice ? btcPrice.changePercent24h : 0,
          icon:
            asset.symbol === "BTC" ? "₿" : asset.symbol === "ETH" ? "Ξ" : "○",
        }))
      : defaultAssets;

  // Calculate dynamic portfolio value based on real-time prices
  const portfolioValue = portfolioLoading
    ? 0
    : userAssets.reduce((total, asset) => total + asset.value, 0);

  const todayChange =
    btcPrice && portfolioValue > 0
      ? ((portfolioValue -
          portfolioValue / (1 + btcPrice.changePercent24h / 100)) /
          portfolioValue) *
        100
      : 2.45;

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated("Just now");
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

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
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <span className="hidden sm:inline">
              Last updated: {lastUpdated}
            </span>
            <span className="sm:hidden">{lastUpdated}</span>
            <button
              onClick={() => setLastUpdated("Just now")}
              className="text-gray-400 hover:text-white transition-colors"
              title="Refresh data"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="text-3xl sm:text-5xl font-bold text-white mb-2">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-12 w-48 rounded"></div>
            ) : (
              <>
                $
                {portfolioValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
            ) : (
              <>
                <span className="text-green-400 text-base sm:text-lg font-medium">
                  +{todayChange.toFixed(2)}%
                </span>
                <span className="text-gray-400 text-sm sm:text-base">
                  Today
                </span>
              </>
            )}
          </div>
          {portfolioError && (
            <div className="text-red-400 text-sm mt-2">
              Failed to load portfolio data.
              <button
                onClick={refetch}
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
          <span className="text-gray-400 text-base sm:text-lg">Available</span>
          <span className="text-white text-lg sm:text-xl font-medium">
            {portfolioLoading ? (
              <div className="animate-pulse bg-gray-700 h-6 w-20 rounded"></div>
            ) : (
              <>
                $
                {availableBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </>
            )}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300 w-[22%]" />
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

      {/* User Assets and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Assets */}
        <div className="xl:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Assets</h2>
              <button
                onClick={handleViewAllAssets}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {userAssets.map((asset) => (
                <div
                  key={asset.symbol}
                  onClick={() => handleAssetClick(asset)}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700/30 cursor-pointer hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-white">
                      {asset.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-white font-semibold">
                          {asset.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            asset.change >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {asset.change >= 0 ? "+" : ""}
                          {asset.change}%
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">{asset.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-semibold">
                      $
                      {asset.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {asset.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 4,
                      })}{" "}
                      {asset.symbol}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-1">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <button
                onClick={handleViewAllActivity}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
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
                          ? `$${activity.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : `${activity.amount} ${
                              activity.asset.split(" ")[0]
                            }`}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {activity.timestamp}
                      </div>
                    </div>
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
              ))}
            </div>

            <button
              onClick={handleViewAllActivity}
              className="w-full mt-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-600"
            >
              View Transaction History
            </button>
          </div>
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
                        $
                        {asset.value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {asset.amount.toLocaleString("en-US", {
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
                          {activity.value.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {activity.timestamp}
                        </span>
                      </div>
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
