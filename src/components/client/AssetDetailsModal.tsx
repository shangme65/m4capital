"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star } from "lucide-react";
import RealTimeTradingChart from "@/components/client/RealTimeTradingChart";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
  icon: string;
}

import BuyCryptoModal from "./BuyCryptoModal";

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  userBalance: number;
}

interface AssetInfo {
  [key: string]: {
    price: number;
    marketCap: string;
    circulatingSupply: string;
    totalSupply: string;
    description: string;
    links: {
      website?: string;
      explorer?: string;
      github?: string;
      twitter?: string;
    };
  };
}

// Asset info is fetched live where possible. Keep a small fallback info map for descriptions/links.
const assetInfo: AssetInfo = {
  BTC: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Bitcoin is a cryptocurrency and worldwide payment system. It is the first decentralized digital currency.",
    links: {
      website: "https://bitcoin.org",
      explorer: "https://blockchair.com/bitcoin",
    },
  },
  ETH: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description: "Ethereum is a decentralized platform for smart contracts.",
    links: {
      website: "https://ethereum.org",
      explorer: "https://etherscan.io",
    },
  },
};

// TODO: REPLACE WITH REAL TRANSACTION HISTORY FROM DATABASE
// This mock data needs to be replaced with actual user transaction history:
// - Fetch from Prisma: await prisma.transaction.findMany({ where: { userId, symbol } })
// - Include: buy/sell history, amounts, prices, dates, status
// - Calculate real gains/losses from actual trades
// - NEVER use this mock data in production
const mockTransactionHistory = {
  BTC: [
    {
      id: 1,
      type: "buy",
      amount: 0.5,
      price: 65000,
      date: "2024-10-10",
      status: "completed",
    },
    {
      id: 2,
      type: "buy",
      amount: 0.3542,
      price: 68500,
      date: "2024-10-05",
      status: "completed",
    },
    {
      id: 3,
      type: "sell",
      amount: 0.1,
      price: 70000,
      date: "2024-09-28",
      status: "completed",
    },
  ],
  ETH: [
    {
      id: 1,
      type: "buy",
      amount: 5,
      price: 2400,
      date: "2024-10-08",
      status: "completed",
    },
    {
      id: 2,
      type: "buy",
      amount: 7.67,
      price: 2350,
      date: "2024-09-30",
      status: "completed",
    },
  ],
  ADA: [
    {
      id: 1,
      type: "buy",
      amount: 5000,
      price: 0.32,
      date: "2024-10-07",
      status: "completed",
    },
    {
      id: 2,
      type: "buy",
      amount: 3420.15,
      price: 0.35,
      date: "2024-09-25",
      status: "completed",
    },
  ],
  SOL: [
    {
      id: 1,
      type: "buy",
      amount: 25,
      price: 145,
      date: "2024-10-06",
      status: "completed",
    },
    {
      id: 2,
      type: "buy",
      amount: 20.23,
      price: 155,
      date: "2024-09-28",
      status: "completed",
    },
  ],
  USDT: [
    {
      id: 1,
      type: "buy",
      amount: 2000,
      price: 1.0,
      date: "2024-10-05",
      status: "completed",
    },
    {
      id: 2,
      type: "buy",
      amount: 3420,
      price: 1.0,
      date: "2024-09-20",
      status: "completed",
    },
  ],
};

export default function AssetDetailsModal({
  isOpen,
  onClose,
  asset,
  userBalance,
}: AssetDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"holdings" | "history" | "about">(
    "holdings"
  );
  const [isStarred, setIsStarred] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Action handlers
  const handleSend = () => {
    setShowSendModal(true);
    console.log(`Opening send modal for ${asset?.symbol}`);
  };

  const handleReceive = () => {
    setShowReceiveModal(true);
    console.log(`Opening receive modal for ${asset?.symbol}`);
  };

  const handleSwap = () => {
    setShowSwapModal(true);
    console.log(`Opening swap modal for ${asset?.symbol}`);
  };

  const handleBuy = () => {
    setShowBuyModal(true);
    console.log(`Opening buy modal for ${asset?.symbol}`);
  };

  const handleSell = () => {
    setShowSellModal(true);
    console.log(`Opening sell modal for ${asset?.symbol}`);
  };

  const closeAllActionModals = () => {
    setShowSendModal(false);
    setShowReceiveModal(false);
    setShowSwapModal(false);
    setShowBuyModal(false);
    setShowSellModal(false);
  };

  // Live price and history state
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChangePercent, setLiveChangePercent] = useState<number | null>(
    null
  );
  const [txHistory, setTxHistory] = useState<any[]>([]);
  // Chart period state (UI: 1H,1D,1W,1M,1Y,All)
  const [selectedPeriod, setSelectedPeriod] = useState<
    "1H" | "1D" | "1W" | "1M" | "1Y" | "All"
  >("1D");
  // Buy amount state
  const [selectedBuyAmount, setSelectedBuyAmount] = useState<number>(30);

  // Fetch live price for asset.symbol from our prices API
  useEffect(() => {
    let mounted = true;
    let interval: any = null;
    const fetchPrice = async () => {
      if (!asset?.symbol) return;
      try {
        const res = await fetch(`/api/crypto/prices?symbols=${asset.symbol}`);
        const data = await res.json();
        const priceObj = Array.isArray(data.prices) ? data.prices[0] : null;
        if (mounted && priceObj) {
          setLivePrice(priceObj.price ?? null);
          setLiveChangePercent(priceObj.changePercent24h ?? null);
        }
      } catch (e) {
        console.error("Failed to fetch live price", e);
      }
    };

    // initial fetch
    fetchPrice();
    // poll every 30s
    interval = setInterval(fetchPrice, 30000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [asset?.symbol]);

  // Fetch transaction history for this asset (deposits/trades/withdrawals)
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!asset?.symbol) return;
      try {
        const res = await fetch(
          `/api/transactions/by-symbol?symbol=${asset.symbol}`
        );
        const data = await res.json();
        if (mounted)
          setTxHistory(Array.isArray(data.history) ? data.history : []);
      } catch (e) {
        console.error("Failed to fetch history", e);
        if (mounted) setTxHistory([]);
      }
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [asset?.symbol]);

  if (!isOpen || !asset) return null;

  const info = assetInfo[asset.symbol] || null;
  const history = txHistory.length
    ? txHistory
    : mockTransactionHistory[
        asset.symbol as keyof typeof mockTransactionHistory
      ] || [];
  const currentPrice = livePrice ?? info?.price ?? 0;
  const priceChange = liveChangePercent ?? asset.change ?? 0;

  const quickBuyAmounts = [15, 25, 50, 100]; // USD amounts

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="asset-details-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
            style={{ touchAction: "none" }}
          />
          <motion.div
            key="asset-details-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-0 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto" }}
          >
            <div className="bg-white w-full h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    {asset.symbol}
                  </h1>
                  <p className="text-sm text-gray-500">COIN | {asset.name}</p>
                </div>
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`transition-colors ${
                    isStarred ? "text-yellow-500" : "text-gray-400"
                  }`}
                  aria-label="Add to favorites"
                >
                  <Star size={24} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Price Section */}
              <div className="p-4 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">⛽</span>
                  </div>
                  <span className="text-gray-600">$2.23</span>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    $
                    {currentPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`flex items-center justify-center gap-1 ${
                      priceChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <span className="text-lg">
                      {priceChange >= 0 ? "↑" : "↓"}
                    </span>
                    <span className="text-lg font-medium">
                      ${Math.abs((currentPrice * priceChange) / 100).toFixed(2)}{" "}
                      ({priceChange >= 0 ? "+" : ""}
                      {priceChange.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Real-time chart */}
                <div className="h-80 md:h-[420px] mb-4">
                  <RealTimeTradingChart
                    symbol={asset.symbol}
                    // map selectedPeriod to an interval + limit
                    {...(() => {
                      const map: Record<
                        string,
                        { interval: string; limit: number }
                      > = {
                        "1H": { interval: "1m", limit: 60 },
                        "1D": { interval: "15m", limit: 96 },
                        "1W": { interval: "1h", limit: 168 },
                        "1M": { interval: "4h", limit: 180 },
                        "1Y": { interval: "1d", limit: 365 },
                        All: { interval: "1d", limit: 1000 },
                      };
                      return map[selectedPeriod] || map["1D"];
                    })()}
                  />
                </div>

                {/* Time Period Buttons */}
                <div className="flex justify-around mb-6">
                  {[
                    { label: "1H", key: "1H" },
                    { label: "1D", key: "1D" },
                    { label: "1W", key: "1W" },
                    { label: "1M", key: "1M" },
                    { label: "1Y", key: "1Y" },
                    { label: "All", key: "All" },
                  ].map((period) => (
                    <button
                      key={period.key}
                      onClick={() => setSelectedPeriod(period.key as any)}
                      className={`px-3 py-1 text-sm transition-colors rounded ${
                        selectedPeriod === period.key
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* Buy Now Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Buy now
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${selectedBuyAmount.toFixed(2)}{" "}
                        <span className="text-gray-500">USD</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {quickBuyAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedBuyAmount(amount)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedBuyAmount === amount
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleBuy}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                    >
                      Buy
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Buying {(selectedBuyAmount / currentPrice).toFixed(5)}{" "}
                    {asset.symbol} • Bank transfer • Onramp Money
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {[
                    { key: "holdings", label: "Holdings" },
                    { key: "history", label: "History" },
                    { key: "about", label: "About" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === tab.key
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 pb-20">
                {activeTab === "holdings" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      My Balance
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {asset.icon}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {asset.name}
                          </div>
                          <div className="text-gray-600">
                            {asset.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}{" "}
                            {asset.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          $
                          {asset.value.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-gray-500">-</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Transactions
                    </h3>
                    {history.length > 0 ? (
                      <div className="space-y-3">
                        {history.map((tx) => (
                          <div
                            key={tx.id}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 capitalize">
                                  {tx.type} {asset.symbol}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {tx.date}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {tx.amount} {asset.symbol}
                                </div>
                                <div className="text-sm text-gray-600">
                                  ${tx.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">📱</div>
                        <p className="text-gray-600 mb-2">
                          Transactions will appear here.
                        </p>
                        <p className="text-gray-500 text-sm">
                          Cannot find your transaction?{" "}
                          <button className="text-blue-600 hover:underline">
                            Check explorer
                          </button>
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold mt-4 transition-colors">
                          Buy {asset.symbol}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "about" && info && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        About {asset.symbol}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {info.description}
                      </p>
                      <button className="text-blue-600 hover:underline mt-2">
                        Read more
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                          <span className="text-gray-600">Market cap</span>
                          <span className="font-medium text-gray-900">
                            {info.marketCap}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                          <span className="text-gray-600">
                            Circulating Supply
                          </span>
                          <span className="font-medium text-gray-900">
                            {info.circulatingSupply}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                          <span className="text-gray-600">Total Supply</span>
                          <span className="font-medium text-gray-900">
                            {info.totalSupply}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Links
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(info.links).map(([key, url]) => (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline capitalize"
                          >
                            {key === "website" ? "Official website" : key}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-3">
                <div className="flex justify-center gap-4 max-w-md mx-auto">
                  <button
                    onClick={handleSend}
                    className="flex flex-col items-center justify-center gap-1 text-gray-600 bg-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 rounded-xl w-16 h-16 transform"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-lg">
                      ↑
                    </div>
                    <span className="text-xs font-medium">Send</span>
                  </button>
                  <button
                    onClick={handleReceive}
                    className="flex flex-col items-center justify-center gap-1 text-gray-600 bg-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 rounded-xl w-16 h-16 transform"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-lg">
                      ↓
                    </div>
                    <span className="text-xs font-medium">Receive</span>
                  </button>
                  <button
                    onClick={handleSwap}
                    className="flex flex-col items-center justify-center gap-1 text-gray-600 bg-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 rounded-xl w-16 h-16 transform"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-lg">
                      ⇄
                    </div>
                    <span className="text-xs font-medium">Swap</span>
                  </button>
                  <button
                    onClick={handleBuy}
                    className="flex flex-col items-center justify-center gap-1 text-gray-600 bg-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 rounded-xl w-16 h-16 transform"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-lg">
                      ⚡
                    </div>
                    <span className="text-xs font-medium">Buy</span>
                  </button>
                  <button
                    onClick={handleSell}
                    className="flex flex-col items-center justify-center gap-1 text-gray-600 bg-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:scale-110 hover:-translate-y-1 transition-all duration-300 rounded-xl w-16 h-16 transform"
                  >
                    <div className="w-6 h-6 flex items-center justify-center text-lg">
                      🏛
                    </div>
                    <span className="text-xs font-medium">Sell</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Modals */}
          {showSendModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeAllActionModals}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">↑</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Send {asset?.symbol}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Send {asset?.symbol} to another wallet or exchange
                  </p>
                  <button
                    onClick={closeAllActionModals}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Coming Soon
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showReceiveModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeAllActionModals}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">↓</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Receive {asset?.symbol}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Get your wallet address to receive {asset?.symbol}
                  </p>
                  <button
                    onClick={closeAllActionModals}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Coming Soon
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showSwapModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeAllActionModals}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⇄</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Swap {asset?.symbol}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Exchange {asset?.symbol} for other cryptocurrencies
                  </p>
                  <button
                    onClick={closeAllActionModals}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Coming Soon
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <BuyCryptoModal
            isOpen={showBuyModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              price: currentPrice,
            }}
            userBalance={userBalance}
          />

          {showSellModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={closeAllActionModals}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏛</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Sell {asset?.symbol}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Convert {asset?.symbol} to fiat currency
                  </p>
                  <button
                    onClick={closeAllActionModals}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Coming Soon
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
