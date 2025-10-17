"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  Shield,
  RefreshCw,
  Settings,
  Plus,
  User,
  Bell,
  Search,
  Calendar,
  Briefcase,
  History,
  MessageCircle,
  Gift,
  Handshake,
  TrendingUpIcon,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";
import {
  TradingProvider,
  useTradingContext,
} from "@/components/client/EnhancedTradingProvider";

function TradingInterface() {
  const [amount, setAmount] = useState(10000);
  // avoid server/client hydration mismatch by initializing as null
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("USD/CAD");
  const [expirationSeconds, setExpirationSeconds] = useState(30);
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<
    "higher" | "lower" | null
  >(null);
  const [showQuickAmounts, setShowQuickAmounts] = useState(false);
  const [tradingMode, setTradingMode] = useState<"binary" | "forex" | "crypto">(
    "binary"
  );
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [openTabs, setOpenTabs] = useState([
    { symbol: "USD/CAD", type: "Binary" },
    { symbol: "EUR/USD", type: "Binary" },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  const symbols = [
    {
      symbol: "USD/CAD",
      price: "1.35742",
      change: "+0.0015",
      percentage: "+0.11%",
      flag: "🇺🇸🇨🇦",
    },
    {
      symbol: "EUR/USD",
      price: "1.08532",
      change: "-0.0023",
      percentage: "-0.21%",
      flag: "🇪🇺🇺🇸",
    },
    {
      symbol: "GBP/USD",
      price: "1.27854",
      change: "+0.0045",
      percentage: "+0.35%",
      flag: "🇬🇧🇺🇸",
    },
    {
      symbol: "USD/JPY",
      price: "149.235",
      change: "+0.125",
      percentage: "+0.08%",
      flag: "🇺🇸🇯🇵",
    },
    {
      symbol: "AUD/USD",
      price: "0.67321",
      change: "-0.0012",
      percentage: "-0.18%",
      flag: "🇦🇺🇺🇸",
    },
    {
      symbol: "BTC/USD",
      price: "67890.45",
      change: "+1234.56",
      percentage: "+1.85%",
      flag: "₿💵",
    },
    {
      symbol: "ETH/USD",
      price: "2456.78",
      change: "-23.45",
      percentage: "-0.95%",
      flag: "⟠💵",
    },
    {
      symbol: "USD/BRL",
      price: "5.27535",
      change: "+0.0523",
      percentage: "+1.00%",
      flag: "🇺🇸🇧🇷",
    },
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  useEffect(() => {
    // set initial time on client only and update every second
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const executeTrade = async (direction: "higher" | "lower") => {
    setIsExecutingTrade(true);
    setTradeDirection(direction);

    setTimeout(() => {
      setIsExecutingTrade(false);
      setTradeDirection(null);
    }, 2000);
  };

  return (
    <div className="h-screen bg-slate-900 text-white overflow-hidden">
      {/* Top Header with Logo and Asset Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center h-14 px-2">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-2 mr-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/m4capitallogo2.png"
                alt="M4Capital"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-xl font-bold text-white">capital</span>
            </div>
          </div>

          {/* Asset Tabs */}
          <div className="flex items-center space-x-1 flex-1">
            {openTabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(index);
                  setSelectedSymbol(tab.symbol);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === index
                    ? "bg-orange-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center">
                  <span className="text-xs">
                    {symbols.find((s) => s.symbol === tab.symbol)?.flag || "💱"}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{tab.symbol}</span>
                  <span className="text-xs opacity-75">{tab.type}</span>
                </div>
                {openTabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTabs = openTabs.filter((_, i) => i !== index);
                      setOpenTabs(newTabs);
                      if (activeTab === index && newTabs.length > 0) {
                        setActiveTab(0);
                        setSelectedSymbol(newTabs[0].symbol);
                      }
                    }}
                    className="ml-2 text-slate-400 hover:text-white"
                    title="Close tab"
                  >
                    ×
                  </button>
                )}
              </button>
            ))}

            {/* Add Asset Button */}
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
              title="Add new asset"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Sidebar - hidden on small screens */}
        <div className="hidden md:flex w-48 bg-slate-800 border-r border-slate-700 flex-col">
          <div className="space-y-1">
            {/* Total Portfolio */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  TOTAL
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  PORTFOLIO
                </span>
              </div>
            </div>

            {/* Trading History */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <History className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  TRADING
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  HISTORY
                </span>
              </div>
            </div>

            {/* Chats & Support */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  CHATS &
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  SUPPORT
                </span>
              </div>
            </div>

            {/* Promo */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <Gift className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  PROMO
                </span>
              </div>
            </div>

            {/* Partnership */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  PARTNERSHIP
                </span>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  MARKET
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  ANALYSIS
                </span>
              </div>
            </div>

            {/* Tutorials */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  TUTORIALS
                </span>
              </div>
            </div>

            {/* More */}
            <div className="flex items-center space-x-3 p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 flex items-center justify-center">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  MORE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - stack on small screens */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Chart Area */}
          <div className="flex-1 bg-slate-800">
            <div className="h-full p-2">
              {/* Symbol Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {symbols.find((s) => s.symbol === selectedSymbol)?.flag ||
                        "💱"}
                    </span>
                    <h2 className="text-2xl font-bold">{selectedSymbol}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-400">
                      {symbols.find((s) => s.symbol === selectedSymbol)
                        ?.price || "1.35742"}
                    </span>
                    <div className="flex items-center text-green-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>
                        {symbols.find((s) => s.symbol === selectedSymbol)
                          ?.change || "+0.0015"}{" "}
                        (
                        {symbols.find((s) => s.symbol === selectedSymbol)
                          ?.percentage || "+0.11%"}
                        )
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-slate-700 rounded text-sm">
                    1m
                  </button>
                  <button className="px-3 py-1 bg-emerald-600 rounded text-sm">
                    5m
                  </button>
                  <button className="px-3 py-1 bg-slate-700 rounded text-sm">
                    15m
                  </button>
                  <button className="px-3 py-1 bg-slate-700 rounded text-sm">
                    1h
                  </button>
                  <button className="px-3 py-1 bg-slate-700 rounded text-sm">
                    1d
                  </button>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-60 sm:h-72 md:h-96 bg-slate-700 flex items-center justify-center mb-2">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">Trading Chart</p>
                  <p className="text-sm text-slate-500">
                    Real-time price visualization
                  </p>
                </div>
              </div>

              {/* Trading Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <motion.button
                  onClick={() => executeTrade("higher")}
                  disabled={isExecutingTrade}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-4 font-bold text-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Higher</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => executeTrade("lower")}
                  disabled={isExecutingTrade}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-4 font-bold text-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingDown className="w-6 h-6" />
                    <span>Lower</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Trading Panel - becomes full width on small screens and stacks below chart */}
          <div className="w-full md:w-80 bg-slate-800 border-t md:border-t-0 md:border-l border-slate-700 p-2 space-y-2">
            {/* Trading Mode */}
            <div className="bg-slate-700 rounded-lg p-2">
              <h3 className="font-semibold mb-2">Trading Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTradingMode("binary")}
                  className={`p-2 rounded text-sm transition-colors ${
                    tradingMode === "binary"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                >
                  Binary
                </button>
                <button
                  onClick={() => setTradingMode("forex")}
                  className={`p-2 rounded text-sm transition-colors ${
                    tradingMode === "forex"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                >
                  Forex
                </button>
                <button
                  onClick={() => setTradingMode("crypto")}
                  className={`p-2 rounded text-sm transition-colors ${
                    tradingMode === "crypto"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                >
                  Crypto
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="bg-slate-700 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Amount</h3>
                <button
                  onClick={() => setShowQuickAmounts(!showQuickAmounts)}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xl">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                  placeholder="Enter amount"
                />
              </div>

              <AnimatePresence>
                {showQuickAmounts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {quickAmounts.map((quickAmount) => (
                      <button
                        key={quickAmount}
                        onClick={() => setAmount(quickAmount)}
                        className="p-2 bg-slate-600 hover:bg-slate-500 rounded text-sm transition-colors"
                      >
                        ${quickAmount.toLocaleString()}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expiration */}
            <div className="bg-slate-700 rounded-lg p-2">
              <h3 className="font-semibold mb-2">Expiration</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <select
                  value={expirationSeconds}
                  onChange={(e) => setExpirationSeconds(Number(e.target.value))}
                  className="flex-1 bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={900}>15 minutes</option>
                  <option value={3600}>1 hour</option>
                </select>
              </div>
              <div className="text-sm text-slate-400">
                Current time:{" "}
                {currentTime ? currentTime.toLocaleTimeString() : "--:--:--"}
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-slate-700 rounded-lg p-2">
              <h3 className="font-semibold mb-2">Risk Level</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setRiskLevel("low")}
                  className={`p-2 rounded text-sm transition-colors ${
                    riskLevel === "low"
                      ? "bg-green-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                >
                  Low
                </button>
                <button
                  onClick={() => setRiskLevel("medium")}
                  className={`p-2 rounded text-sm transition-colors ${
                    riskLevel === "medium"
                      ? "bg-yellow-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setRiskLevel("high")}
                  className={`p-2 rounded text-sm transition-colors ${
                    riskLevel === "high"
                      ? "bg-red-600 text-white"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Market Symbols */}
            <div className="bg-slate-700 rounded-lg p-2">
              <h3 className="font-semibold mb-2">Markets</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {symbols.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`w-full p-2 rounded-lg text-left transition-colors ${
                      selectedSymbol === item.symbol
                        ? "bg-emerald-600"
                        : "bg-slate-600 hover:bg-slate-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.symbol}</span>
                      <div className="text-right">
                        <div className="font-bold">{item.price}</div>
                        <div
                          className={`text-xs ${
                            item.change.startsWith("+")
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.change} ({item.percentage})
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Execution Indicator */}
            <AnimatePresence>
              {isExecutingTrade && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`fixed top-20 right-4 p-4 rounded-lg ${
                    tradeDirection === "higher" ? "bg-green-600" : "bg-red-600"
                  } text-white shadow-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Executing {tradeDirection} trade...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {showAddAssetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddAssetModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add Asset</h3>
                <button
                  onClick={() => setShowAddAssetModal(false)}
                  className="text-slate-400 hover:text-white"
                  title="Close modal"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {symbols
                  .filter(
                    (symbol) =>
                      !openTabs.some((tab) => tab.symbol === symbol.symbol)
                  )
                  .map((symbol) => (
                    <button
                      key={symbol.symbol}
                      onClick={() => {
                        const newTab = {
                          symbol: symbol.symbol,
                          type: "Binary",
                        };
                        setOpenTabs([...openTabs, newTab]);
                        setActiveTab(openTabs.length);
                        setSelectedSymbol(symbol.symbol);
                        setShowAddAssetModal(false);
                      }}
                      className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{symbol.symbol}</span>
                          <div className="text-sm text-slate-400">
                            Binary Option
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{symbol.price}</div>
                          <div
                            className={`text-xs ${
                              symbol.change.startsWith("+")
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {symbol.change} ({symbol.percentage})
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TradePage() {
  return (
    <TradingProvider>
      <TradingInterface />
    </TradingProvider>
  );
}
