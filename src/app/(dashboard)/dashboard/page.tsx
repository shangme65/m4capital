"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { useNotifications, Transaction } from "@/contexts/NotificationContext";
import TransactionDetailsModal from "@/components/client/TransactionDetailsModal";
import AssetDetailsModal from "@/components/client/AssetDetailsModal";

export default function DashboardPage() {
  const { data: session } = useSession();
  const {
    openDepositModal,
    openWithdrawModal,
    openBuyModal,
    openTransferModal,
    openConvertModal,
    openSellModal,
  } = useModal();
  const { recentActivity } = useNotifications();
  const [portfolioValue] = useState(24891.42);
  const [todayChange] = useState(2.45);
  const [availableBalance] = useState(5420.0);
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAssetDetails, setShowAssetDetails] = useState(false);

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

  // Mock data for user assets
  const [userAssets] = useState([
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.8542,
      value: 52847.32,
      change: 3.24,
      icon: "₿",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: 12.67,
      value: 31245.89,
      change: -1.45,
      icon: "Ξ",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      amount: 8420.15,
      value: 2847.21,
      change: 5.67,
      icon: "₳",
    },
    {
      symbol: "SOL",
      name: "Solana",
      amount: 45.23,
      value: 6789.43,
      change: 2.81,
      icon: "◎",
    },
    {
      symbol: "USDT",
      name: "Tether",
      amount: 5420.0,
      value: 5420.0,
      change: 0.01,
      icon: "₮",
    },
  ]);

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
            $
            {portfolioValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-base sm:text-lg font-medium">
              +{todayChange}%
            </span>
            <span className="text-gray-400 text-sm sm:text-base">Today</span>
          </div>
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
            $
            {availableBalance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
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
          Convert
        </button>
      </div>

      {/* User Assets and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Assets */}
        <div className="xl:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Assets</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
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
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
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

            <button className="w-full mt-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-gray-600">
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
    </div>
  );
}
