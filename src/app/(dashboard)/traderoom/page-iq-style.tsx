"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  RefreshCw,
  Plus,
  Bell,
  Settings,
  Search,
  Star,
  ChevronDown,
  Activity,
  Zap,
} from "lucide-react";
import {
  TradingProvider,
  useTradingContext,
} from "@/components/client/EnhancedTradingProvider";

function TradingInterface() {
  const [amount, setAmount] = useState(10000);
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
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [openTabs, setOpenTabs] = useState([
    { symbol: "USD/CAD", type: "Binary" },
    { symbol: "EUR/USD", type: "Binary" },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

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
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1b1817", color: "#eceae9" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-32 w-32 border-b-2 mb-4"
            style={{ borderColor: "#ff8516" }}
          ></div>
          <p>Loading Trading Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        backgroundColor: "#1b1817",
        color: "#eceae9",
        fontFamily: '"Inter", Arial, sans-serif',
      }}
    >
      {/* IQ Option Header */}
      <header
        style={{
          backgroundColor: "#26211f",
          borderBottom: "1px solid #38312e",
        }}
      >
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <Image
                src="/m4capitallogo2.png"
                alt="M4Capital"
                width={32}
                height={32}
              />
              <span
                className="text-lg font-semibold"
                style={{ color: "#eceae9" }}
              >
                M4Capital
              </span>
            </div>

            <nav className="flex items-center space-x-1">
              <button
                className="px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
                style={{ backgroundColor: "#ff8516", color: "#ffffff" }}
              >
                Trading
              </button>
              <button
                className="px-4 py-2 text-sm hover:opacity-75 transition-opacity"
                style={{ color: "#afadac" }}
              >
                Portfolio
              </button>
              <button
                className="px-4 py-2 text-sm hover:opacity-75 transition-opacity"
                style={{ color: "#afadac" }}
              >
                History
              </button>
              <button
                className="px-4 py-2 text-sm hover:opacity-75 transition-opacity"
                style={{ color: "#afadac" }}
              >
                Tournaments
              </button>
            </nav>
          </div>

          {/* Right: Balance and Controls */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:opacity-75 transition-opacity">
              <Bell className="w-5 h-5" style={{ color: "#afadac" }} />
            </button>
            <button className="p-2 hover:opacity-75 transition-opacity">
              <Settings className="w-5 h-5" style={{ color: "#afadac" }} />
            </button>
            <div
              className="px-4 py-2 rounded-lg flex items-center space-x-2"
              style={{ backgroundColor: "#38312e" }}
            >
              <span
                style={{
                  color: "#5ddf38",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                $50,000.00
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: "#afadac" }} />
            </div>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ backgroundColor: "#ff8516", color: "#ffffff" }}
            >
              Deposit
            </button>
          </div>
        </div>
      </header>

      {/* Asset Selection Bar */}
      <div
        style={{
          backgroundColor: "#1b1817",
          borderBottom: "1px solid #38312e",
        }}
      >
        <div className="flex items-center px-6 py-3">
          <div className="flex items-center space-x-2 flex-1">
            {openTabs.map((tab, index) => (
              <button
                key={`tab-${index}-${tab.symbol}`}
                onClick={() => {
                  setActiveTab(index);
                  setSelectedSymbol(tab.symbol);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: activeTab === index ? "#ff8516" : "#38312e",
                  color: activeTab === index ? "#ffffff" : "#afadac",
                }}
              >
                <span className="text-sm">
                  {symbols.find((s) => s.symbol === tab.symbol)?.flag || "💱"}
                </span>
                <span className="text-sm font-medium">{tab.symbol}</span>
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
                    className="ml-1 hover:opacity-75 transition-opacity"
                    style={{
                      color: activeTab === index ? "#ffffff" : "#afadac",
                      fontSize: "16px",
                    }}
                  >
                    ×
                  </button>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="p-2 rounded-lg hover:opacity-75 transition-all duration-200"
              style={{ backgroundColor: "#38312e", color: "#afadac" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel: Assets */}
        <div
          className="w-80 flex-col border-r hidden lg:flex"
          style={{ backgroundColor: "#26211f", borderColor: "#38312e" }}
        >
          {/* Search */}
          <div className="p-4 border-b" style={{ borderColor: "#38312e" }}>
            <div
              className="flex items-center space-x-2 mb-3 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "#38312e" }}
            >
              <Search className="w-4 h-4" style={{ color: "#827e7d" }} />
              <input
                type="text"
                placeholder="Search assets..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "#eceae9" }}
              />
            </div>
            <div className="flex space-x-1">
              {["All", "Forex", "Crypto", "Stocks"].map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1 rounded-lg text-xs transition-all duration-200"
                  style={{
                    backgroundColor:
                      filter === "All" ? "#ff8516" : "transparent",
                    color: filter === "All" ? "#ffffff" : "#afadac",
                    border: filter !== "All" ? "1px solid #38312e" : "none",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Assets List */}
          <div className="flex-1 overflow-y-auto">
            {symbols.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => setSelectedSymbol(asset.symbol)}
                className="w-full p-3 hover:bg-opacity-50 transition-all duration-200 border-b"
                style={{
                  backgroundColor:
                    selectedSymbol === asset.symbol ? "#38312e" : "transparent",
                  borderColor: "#38312e",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{asset.flag}</span>
                    <div className="text-left">
                      <div
                        className="font-medium text-sm"
                        style={{ color: "#eceae9" }}
                      >
                        {asset.symbol}
                      </div>
                      <div className="text-xs" style={{ color: "#827e7d" }}>
                        Binary Option
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="font-medium text-sm"
                      style={{ color: "#eceae9" }}
                    >
                      {asset.price}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: asset.change.startsWith("+")
                          ? "#5ddf38"
                          : "#ff4747",
                      }}
                    >
                      {asset.change} ({asset.percentage})
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Chart and Controls */}
        <div className="flex-1 flex flex-col">
          {/* Chart Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: "#38312e" }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  {symbols.find((s) => s.symbol === selectedSymbol)?.flag ||
                    "💱"}
                </span>
                <h2 className="text-2xl font-bold" style={{ color: "#eceae9" }}>
                  {selectedSymbol}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#5ddf38" }}
                >
                  {symbols.find((s) => s.symbol === selectedSymbol)?.price ||
                    "1.35742"}
                </span>
                <div className="flex items-center" style={{ color: "#5ddf38" }}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {symbols.find((s) => s.symbol === selectedSymbol)?.change ||
                      "+0.0015"}{" "}
                    (
                    {symbols.find((s) => s.symbol === selectedSymbol)
                      ?.percentage || "+0.11%"}
                    )
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {["1M", "5M", "15M", "1H", "1D"].map((timeframe) => (
                <button
                  key={timeframe}
                  className="px-3 py-1 rounded-lg text-sm transition-all duration-200"
                  style={{
                    backgroundColor: timeframe === "5M" ? "#ff8516" : "#38312e",
                    color: timeframe === "5M" ? "#ffffff" : "#afadac",
                  }}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: "#1b1817" }}
          >
            <div className="text-center">
              <BarChart3
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "#827e7d" }}
              />
              <p style={{ color: "#afadac" }}>Advanced Trading Chart</p>
              <p className="text-sm" style={{ color: "#827e7d" }}>
                Real-time price visualization
              </p>
            </div>
          </div>

          {/* Trading Controls */}
          <div className="p-4 border-t" style={{ borderColor: "#38312e" }}>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                onClick={() => executeTrade("higher")}
                disabled={isExecutingTrade}
                className="h-16 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: "#5ddf38", color: "#ffffff" }}
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
                className="h-16 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: "#ff4747", color: "#ffffff" }}
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

        {/* Right Panel: Trading Options */}
        <div
          className="w-80 flex-col border-l hidden xl:flex"
          style={{ backgroundColor: "#26211f", borderColor: "#38312e" }}
        >
          {/* Amount */}
          <div className="p-4 border-b" style={{ borderColor: "#38312e" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold" style={{ color: "#eceae9" }}>
                Investment
              </h3>
              <button
                onClick={() => setShowQuickAmounts(!showQuickAmounts)}
                className="text-xs px-2 py-1 rounded transition-all duration-200"
                style={{ backgroundColor: "#38312e", color: "#afadac" }}
              >
                Quick
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl" style={{ color: "#eceae9" }}>
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg outline-none text-lg font-semibold"
                style={{
                  backgroundColor: "#38312e",
                  color: "#eceae9",
                  border: "1px solid #403935",
                }}
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
                      className="p-2 rounded-lg text-sm transition-all duration-200"
                      style={{
                        backgroundColor: "#38312e",
                        color: "#afadac",
                        border: "1px solid #403935",
                      }}
                    >
                      ${quickAmount.toLocaleString()}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Expiration */}
          <div className="p-4 border-b" style={{ borderColor: "#38312e" }}>
            <h3 className="font-semibold mb-3" style={{ color: "#eceae9" }}>
              Expiration Time
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4" style={{ color: "#827e7d" }} />
              <select
                value={expirationSeconds}
                onChange={(e) => setExpirationSeconds(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-lg outline-none"
                style={{
                  backgroundColor: "#38312e",
                  color: "#eceae9",
                  border: "1px solid #403935",
                }}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
                <option value={3600}>1 hour</option>
              </select>
            </div>
            <div className="text-sm" style={{ color: "#827e7d" }}>
              Current time:{" "}
              {currentTime ? currentTime.toLocaleTimeString() : "--:--:--"}
            </div>
          </div>

          {/* Payout */}
          <div className="p-4 border-b" style={{ borderColor: "#38312e" }}>
            <h3 className="font-semibold mb-3" style={{ color: "#eceae9" }}>
              Payout
            </h3>
            <div className="flex items-center justify-between">
              <span style={{ color: "#afadac" }}>Success Rate:</span>
              <span className="font-semibold" style={{ color: "#5ddf38" }}>
                85%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span style={{ color: "#afadac" }}>Potential Profit:</span>
              <span className="font-semibold" style={{ color: "#5ddf38" }}>
                ${(amount * 0.85).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Risk Level */}
          <div className="p-4">
            <h3 className="font-semibold mb-3" style={{ color: "#eceae9" }}>
              Market Sentiment
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span style={{ color: "#afadac" }}>Higher</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-16 h-1 rounded"
                    style={{ backgroundColor: "#38312e" }}
                  >
                    <div
                      className="w-3/5 h-1 rounded"
                      style={{ backgroundColor: "#5ddf38" }}
                    ></div>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#5ddf38" }}
                  >
                    60%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "#afadac" }}>Lower</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-16 h-1 rounded"
                    style={{ backgroundColor: "#38312e" }}
                  >
                    <div
                      className="w-2/5 h-1 rounded"
                      style={{ backgroundColor: "#ff4747" }}
                    ></div>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#ff4747" }}
                  >
                    40%
                  </span>
                </div>
              </div>
            </div>
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
              className="rounded-lg p-6 w-96 max-h-96 overflow-y-auto"
              style={{ backgroundColor: "#26211f" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "#eceae9" }}
                >
                  Add Asset
                </h3>
                <button
                  onClick={() => setShowAddAssetModal(false)}
                  className="hover:opacity-75 transition-opacity"
                  style={{ color: "#afadac" }}
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
                      className="w-full p-3 rounded-lg text-left transition-all duration-200"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{symbol.flag}</span>
                          <div>
                            <div
                              className="font-medium"
                              style={{ color: "#eceae9" }}
                            >
                              {symbol.symbol}
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "#827e7d" }}
                            >
                              Binary Option
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="font-bold"
                            style={{ color: "#eceae9" }}
                          >
                            {symbol.price}
                          </div>
                          <div
                            className="text-xs"
                            style={{
                              color: symbol.change.startsWith("+")
                                ? "#5ddf38"
                                : "#ff4747",
                            }}
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

      {/* Trade Execution Indicator */}
      <AnimatePresence>
        {isExecutingTrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 p-4 rounded-lg shadow-lg"
            style={{
              backgroundColor:
                tradeDirection === "higher" ? "#5ddf38" : "#ff4747",
              color: "#ffffff",
            }}
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Executing {tradeDirection} trade...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TraderoomPage() {
  return (
    <TradingProvider>
      <TradingInterface />
    </TradingProvider>
  );
}
