"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star } from "lucide-react";
import RealTimeTradingChart from "@/components/client/RealTimeTradingChart";
import BuyCryptoModal from "./BuyCryptoModal";
import AssetSendModal from "./AssetSendModal";
import AssetReceiveModal from "./AssetReceiveModal";
import AssetSwapModal from "./AssetSwapModal";
import AssetSellModal from "./AssetSellModal";
import TransactionDetailsModal, {
  DetailedTransaction,
} from "./TransactionDetailsModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
  icon: string;
}

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  userBalance: number;
  balanceCurrency?: string;
  allAssets?: Asset[];
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
  balanceCurrency = "USD",
  allAssets = [],
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
  const [selectedTransaction, setSelectedTransaction] =
    useState<DetailedTransaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Currency context for user's preferred currency
  const { preferredCurrency, formatAmount, convertAmount } = useCurrency();

  // Helper to format user balance - show directly if currencies match
  const formatUserBalance = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      const symbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        NGN: "₦",
        ZAR: "R",
        KES: "KSh",
        GHS: "₵",
      };
      const symbol = symbols[preferredCurrency] || "$";
      return `${symbol}${balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Different currency - formatAmount converts from USD to preferred
    return formatAmount(balance, 2);
  };

  // Prevent body scroll when modal is open and handle browser back button
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Push a state to handle browser back button
      window.history.pushState({ assetModal: true }, "");

      // Handle browser back button
      const handlePopState = (event: PopStateEvent) => {
        onClose();
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

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
  // ONLY poll when modal is actually open to prevent continuous API calls
  useEffect(() => {
    if (!isOpen || !asset?.symbol) return;

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
    // poll every 30s (only while modal is open)
    interval = setInterval(fetchPrice, 30000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [asset?.symbol, isOpen]);

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
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="fixed inset-0 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto" }}
          >
            <div
              className="bg-gray-900 w-full h-full min-h-screen overflow-y-auto"
              style={{ minHeight: "100dvh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white">
                    {asset.symbol}
                  </h1>
                  <p className="text-sm text-gray-400">COIN | {asset.name}</p>
                </div>
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`transition-colors ${
                    isStarred ? "text-yellow-500" : "text-gray-500"
                  }`}
                  aria-label="Add to favorites"
                >
                  <Star size={24} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Price Section */}
              <div className="p-4 bg-gray-900">
                {/* Network Fee Indicator - Shows estimated transfer fee for this asset */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-400 text-sm">⛽</span>
                  <span className="text-gray-400 text-sm">
                    {(() => {
                      // Estimated network fees per asset (in USD equivalent)
                      const networkFees: { [key: string]: number } = {
                        BTC: 2.5, // Bitcoin average fee
                        ETH: 3.0, // Ethereum gas fee
                        LTC: 0.05, // Litecoin low fee
                        BCH: 0.01, // Bitcoin Cash low fee
                        XRP: 0.001, // Ripple very low
                        TRX: 0.001, // Tron very low
                        TON: 0.01, // Toncoin low
                        SOL: 0.001, // Solana very low
                        DOGE: 0.5, // Dogecoin
                        ADA: 0.2, // Cardano
                        DOT: 0.1, // Polkadot
                        USDT: 1.0, // Tether (depends on network)
                        USDC: 1.0, // USD Coin
                        ETC: 0.1, // Ethereum Classic
                      };
                      const fee = networkFees[asset.symbol] || 0.5; // Default $0.50
                      return formatAmount(convertAmount(fee), 2);
                    })()}
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {formatAmount(convertAmount(currentPrice), 2)}
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
                      {formatAmount(
                        convertAmount(
                          Math.abs((currentPrice * priceChange) / 100)
                        ),
                        2
                      )}{" "}
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
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* Buy Now Section - 3D Card Style */}
                <div
                  className="rounded-xl p-4 mb-6"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                    boxShadow:
                      "0 15px 30px -8px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Buy now
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {formatAmount(convertAmount(selectedBuyAmount), 2)}{" "}
                        <span className="text-gray-400">
                          {preferredCurrency}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {quickBuyAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedBuyAmount(amount)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                              selectedBuyAmount === amount
                                ? "text-white"
                                : "text-gray-300 hover:text-white"
                            }`}
                            style={
                              selectedBuyAmount === amount
                                ? {
                                    background:
                                      "linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)",
                                    boxShadow:
                                      "0 4px 12px -2px rgba(37, 99, 235, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                    border: "1px solid rgba(59, 130, 246, 0.4)",
                                  }
                                : {
                                    background:
                                      "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                                    boxShadow:
                                      "0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.06)",
                                  }
                            }
                          >
                            {formatAmount(convertAmount(amount), 0)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleBuy}
                      className="text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(145deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
                        boxShadow:
                          "0 8px 20px -4px rgba(37, 99, 235, 0.6), 0 4px 10px -2px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(59, 130, 246, 0.5)",
                      }}
                    >
                      Buy
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Buying {(selectedBuyAmount / currentPrice).toFixed(5)}{" "}
                    {asset.symbol} from available balance:{" "}
                    <span
                      className="font-bold bg-gradient-to-r from-green-400 via-white to-green-400 bg-clip-text text-transparent"
                      style={{
                        textShadow:
                          "0 0 15px rgba(34,197,94,0.1), 0 2px 4px rgba(0,0,0,0.8)",
                        WebkitTextStroke: "0.3px rgba(255,255,255,0.1)",
                      }}
                    >
                      {formatUserBalance(userBalance)}
                    </span>
                  </p>
                </div>
              </div>

              {/* 3D Tabs Card */}
              <div
                className="mx-4 rounded-xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 6px 12px -3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="flex">
                  {[
                    { key: "holdings", label: "Holdings" },
                    { key: "history", label: "History" },
                    { key: "about", label: "About" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                        activeTab === tab.key
                          ? "text-blue-400 border-b-2 border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                          : "text-gray-400 hover:text-white"
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
                    <h3 className="text-lg font-semibold text-white mb-4">
                      My Balance
                    </h3>
                    {/* 3D Card with depth effect */}
                    <div
                      className="relative rounded-xl p-3 flex items-center justify-between overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 15px 30px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {/* Subtle glow effect */}
                      <div
                        className="absolute inset-0 opacity-20 rounded-xl"
                        style={{
                          background:
                            "radial-gradient(ellipse at 30% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                        }}
                      />

                      <div className="flex items-center gap-3 relative z-10">
                        {/* 3D Logo matching dashboard style */}
                        <div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                          style={{
                            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255,255,255,0.2)`,
                          }}
                        >
                          {/* Inner glow */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                          <CryptoIcon
                            symbol={asset.symbol}
                            size="md"
                            showNetwork={true}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">
                            {asset.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {asset.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <div className="font-bold text-white text-xl">
                          {formatAmount(convertAmount(asset.value), 2)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {asset.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </div>
                      </div>
                    </div>
                    {/* Bottom margin spacer */}
                    <div className="mb-8"></div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recent Transactions
                    </h3>
                    {history.length > 0 ? (
                      <div className="space-y-4">
                        {history.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => {
                              // Convert to DetailedTransaction format
                              const detailedTx: DetailedTransaction = {
                                id:
                                  tx.id?.toString() ||
                                  tx.paymentId ||
                                  `tx-${Date.now()}`,
                                type: tx.type as
                                  | "buy"
                                  | "sell"
                                  | "deposit"
                                  | "withdraw"
                                  | "convert"
                                  | "transfer",
                                asset: tx.cryptoCurrency || asset.symbol,
                                amount:
                                  typeof tx.amount === "number"
                                    ? tx.amount
                                    : parseFloat(tx.amount) || 0,
                                value:
                                  tx.fiatValue ||
                                  tx.price *
                                    (typeof tx.amount === "number"
                                      ? tx.amount
                                      : parseFloat(tx.amount) || 0),
                                timestamp: new Date(tx.date).toLocaleString(),
                                status: (tx.status?.toLowerCase() ===
                                  "completed" ||
                                tx.status?.toLowerCase() === "closed"
                                  ? "completed"
                                  : tx.status?.toLowerCase() === "pending" ||
                                    tx.status?.toLowerCase() === "confirming"
                                  ? "pending"
                                  : "failed") as
                                  | "completed"
                                  | "pending"
                                  | "failed",
                                fee: tx.fee || undefined,
                                method:
                                  tx.method || tx.paymentMethod || undefined,
                                date: new Date(tx.date),
                                currency: tx.currency || preferredCurrency,
                                rate: tx.price || undefined,
                                hash: tx.hash || tx.txHash || undefined,
                                network: tx.network || undefined,
                                address:
                                  tx.address || tx.payAddress || undefined,
                                confirmations: tx.confirmations,
                                maxConfirmations: tx.maxConfirmations || 6,
                              };
                              setSelectedTransaction(detailedTx);
                              setShowTransactionDetails(true);
                            }}
                            className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer active:scale-[0.99]"
                            style={{
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 6px 12px -3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    tx.type === "buy" || tx.type === "deposit"
                                      ? "bg-green-500/20"
                                      : tx.type === "sell"
                                      ? "bg-red-500/20"
                                      : "bg-blue-500/20"
                                  }`}
                                >
                                  <span
                                    className={`text-lg ${
                                      tx.type === "buy" || tx.type === "deposit"
                                        ? "text-green-400"
                                        : tx.type === "sell"
                                        ? "text-red-400"
                                        : "text-blue-400"
                                    }`}
                                  >
                                    {tx.type === "buy" || tx.type === "deposit"
                                      ? "↓"
                                      : tx.type === "sell"
                                      ? "↑"
                                      : "↔"}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-white capitalize text-base">
                                    {tx.type}{" "}
                                    {tx.cryptoCurrency || asset.symbol}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(tx.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tx.status?.toLowerCase() === "completed" ||
                                    tx.status?.toLowerCase() === "closed"
                                      ? "bg-green-500/20 text-green-400"
                                      : tx.status?.toLowerCase() ===
                                          "pending" ||
                                        tx.status?.toLowerCase() ===
                                          "confirming"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {tx.status || "completed"}
                                </div>
                                {/* Chevron indicator for clickable */}
                                <svg
                                  className="w-4 h-4 text-gray-500"
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

                            <div className="flex items-end justify-between pt-2 border-t border-gray-700/50">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Amount
                                </div>
                                <div
                                  className={`font-bold text-lg ${
                                    tx.type === "buy" || tx.type === "deposit"
                                      ? "text-green-400"
                                      : tx.type === "sell"
                                      ? "text-red-400"
                                      : "text-white"
                                  }`}
                                >
                                  {tx.type === "buy" || tx.type === "deposit"
                                    ? "+"
                                    : tx.type === "sell"
                                    ? "-"
                                    : ""}
                                  {typeof tx.amount === "number"
                                    ? tx.amount.toLocaleString(undefined, {
                                        maximumFractionDigits: 8,
                                      })
                                    : tx.amount}{" "}
                                  {tx.cryptoCurrency || asset.symbol}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 mb-1">
                                  Value
                                </div>
                                <div className="font-semibold text-white">
                                  {tx.fiatValue
                                    ? formatAmount(tx.fiatValue, 2)
                                    : formatAmount(
                                        convertAmount(
                                          tx.price *
                                            (typeof tx.amount === "number"
                                              ? tx.amount
                                              : parseFloat(tx.amount))
                                        ),
                                        2
                                      )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500 mb-2">📱</div>
                        <p className="text-gray-400 mb-2">
                          Transactions will appear here.
                        </p>
                        <p className="text-gray-500 text-sm">
                          Cannot find your transaction?{" "}
                          <button className="text-blue-500 hover:underline">
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
                      <h3 className="text-lg font-semibold text-white mb-2">
                        About {asset.symbol}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {info.description}
                      </p>
                      <button className="text-blue-500 hover:underline mt-2">
                        Read more
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Stats
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-800 rounded-lg p-4 flex justify-between">
                          <span className="text-gray-400">Market cap</span>
                          <span className="font-medium text-white">
                            {info.marketCap}
                          </span>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 flex justify-between">
                          <span className="text-gray-400">
                            Circulating Supply
                          </span>
                          <span className="font-medium text-white">
                            {info.circulatingSupply}
                          </span>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4 flex justify-between">
                          <span className="text-gray-400">Total Supply</span>
                          <span className="font-medium text-white">
                            {info.totalSupply}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Links
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(info.links).map(([key, url]) => (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline capitalize"
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
              <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2">
                <div className="flex justify-center gap-3 max-w-md mx-auto">
                  <button
                    onClick={handleSend}
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-300 bg-gray-700 hover:text-blue-400 hover:bg-gray-600 hover:scale-105 transition-all duration-300 rounded-xl w-14 h-12 transform"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-base">
                      ↑
                    </div>
                    <span className="text-[10px] font-medium">Send</span>
                  </button>
                  <button
                    onClick={handleReceive}
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-300 bg-gray-700 hover:text-blue-400 hover:bg-gray-600 hover:scale-105 transition-all duration-300 rounded-xl w-14 h-12 transform"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-base">
                      ↓
                    </div>
                    <span className="text-[10px] font-medium">Receive</span>
                  </button>
                  <button
                    onClick={handleSwap}
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-300 bg-gray-700 hover:text-blue-400 hover:bg-gray-600 hover:scale-105 transition-all duration-300 rounded-xl w-14 h-12 transform"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-base">
                      ⇄
                    </div>
                    <span className="text-[10px] font-medium">Swap</span>
                  </button>
                  <button
                    onClick={handleBuy}
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-300 bg-gray-700 hover:text-green-400 hover:bg-gray-600 hover:scale-105 transition-all duration-300 rounded-xl w-14 h-12 transform"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-base">
                      ⚡
                    </div>
                    <span className="text-[10px] font-medium">Buy</span>
                  </button>
                  <button
                    onClick={handleSell}
                    className="flex flex-col items-center justify-center gap-0.5 text-gray-300 bg-gray-700 hover:text-orange-400 hover:bg-gray-600 hover:scale-105 transition-all duration-300 rounded-xl w-14 h-12 transform"
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-base">
                      🏛
                    </div>
                    <span className="text-[10px] font-medium">Sell</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Modals */}
          <AssetSendModal
            isOpen={showSendModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
          />

          <AssetReceiveModal
            isOpen={showReceiveModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
          />

          <AssetSwapModal
            isOpen={showSwapModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
            availableAssets={allAssets.map((a) => ({
              symbol: a.symbol,
              name: a.name,
              amount: a.amount,
              price: a.value / a.amount || 0,
            }))}
          />

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

          <AssetSellModal
            isOpen={showSellModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
          />

          {/* Transaction Details Modal */}
          <TransactionDetailsModal
            isOpen={showTransactionDetails}
            onClose={() => {
              setShowTransactionDetails(false);
              setSelectedTransaction(null);
            }}
            transaction={selectedTransaction}
          />
        </>
      )}
    </AnimatePresence>
  );
}
