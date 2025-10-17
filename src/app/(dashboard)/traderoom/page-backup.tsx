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

  // Add mounted state to prevent hydration mismatches
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
    {
      symbol: "USD/BRL",
      price: "5.27535",
      change: "+0.0523",
      percentage: "+1.00%",
      flag: "🇺🇸🇧🇷",
    },
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  // Single class that controls the edge offset for the trade page.
  // Set to a negative margin utility to cancel parent padding, for example:
  //  - No offset (default): ""
  //  - Small offset: "-m-2"
  //  - Medium offset: "-m-4"
  //  - Large offset: "-m-8"
  // To adjust all four edges manually, change the value of EDGE_OFFSET_CLASS below.
  const EDGE_OFFSET_CLASS = "-m-0"; // <-- edit this line to adjust top/right/bottom/left offsets

  useEffect(() => {
    // set mounted to true to prevent hydration mismatches
    setMounted(true);
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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="h-screen bg-slate-900 text-white overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="mt-4">Loading Trading Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden" style={{
      backgroundColor: '#1b1817',
      color: '#eceae9',
      fontFamily: '"Inter", Arial, sans-serif'
    }}>
      {/* Wrapper that cancels outer layout padding — change EDGE_OFFSET_CLASS above to adjust */}
      <div className={EDGE_OFFSET_CLASS}>
        {/* IQ Option Style Header */}
        <div style={{ backgroundColor: '#26211f', borderBottom: '1px solid #38312e' }}>
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left: Logo and Navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Image
                  src="/m4capitallogo2.png"
                  alt="M4Capital"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-lg font-semibold" style={{ color: '#eceae9' }}>
                  M4Capital
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1">
                <button 
                  className="px-4 py-2 rounded-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: '#ff8516', 
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Trading
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
                  style={{ 
                    color: '#afadac',
                    fontSize: '14px'
                  }}
                >
                  Portfolio
                </button>
                <button 
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-10"
                  style={{ 
                    color: '#afadac',
                    fontSize: '14px'
                  }}
                >
                  History
                </button>
              </div>
            </div>

            {/* Right: User Controls */}
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-opacity-10 transition-all duration-200">
                <Bell className="w-5 h-5" style={{ color: '#afadac' }} />
              </button>
              <button className="p-2 rounded-lg hover:bg-opacity-10 transition-all duration-200">
                <Settings className="w-5 h-5" style={{ color: '#afadac' }} />
              </button>
              <div 
                className="px-4 py-2 rounded-lg flex items-center space-x-2"
                style={{ backgroundColor: '#38312e' }}
              >
                <span style={{ color: '#eceae9', fontSize: '14px', fontWeight: '500' }}>
                  $50,000.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Selection Bar */}
        <div style={{ backgroundColor: '#1b1817', borderBottom: '1px solid #38312e' }}>
          <div className="flex items-center px-4 py-3">
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
                    backgroundColor: activeTab === index ? '#ff8516' : '#38312e',
                    color: activeTab === index ? '#ffffff' : '#afadac'
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
                      className="ml-2 hover:opacity-75 transition-opacity"
                      style={{ 
                        color: activeTab === index ? '#ffffff' : '#afadac',
                        fontSize: '16px'
                      }}
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
                className="p-2 rounded-lg hover:opacity-75 transition-all duration-200"
                style={{ 
                  backgroundColor: '#38312e',
                  color: '#afadac'
                }}
                title="Add new asset"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Asset Panel */}
          <div 
            className="hidden md:flex w-80 flex-col border-r"
            style={{ 
              backgroundColor: '#26211f',
              borderColor: '#38312e'
            }}
          >
            {/* Asset Search & Filter */}
            <div className="p-4 border-b" style={{ borderColor: '#38312e' }}>
              <div className="flex items-center space-x-2 mb-3">
                <Search className="w-4 h-4" style={{ color: '#827e7d' }} />
                <input 
                  type="text" 
                  placeholder="Search assets..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ 
                    color: '#eceae9',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div className="flex space-x-1">
                {['All', 'Forex', 'Crypto', 'Stocks'].map((filter) => (
                  <button 
                    key={filter}
                    className="px-3 py-1 rounded-lg text-xs transition-all duration-200"
                    style={{
                      backgroundColor: filter === 'All' ? '#ff8516' : 'transparent',
                      color: filter === 'All' ? '#ffffff' : '#afadac',
                      border: filter !== 'All' ? '1px solid #38312e' : 'none'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto">
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
                        {symbols.find((s) => s.symbol === selectedSymbol)
                          ?.flag || "💱"}
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
                    aria-label="Toggle quick amounts"
                    title="Toggle quick amounts"
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
                    onChange={(e) =>
                      setExpirationSeconds(Number(e.target.value))
                    }
                    className="flex-1 bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                    aria-label="Expiration time"
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
                      tradeDirection === "higher"
                        ? "bg-green-600"
                        : "bg-red-600"
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
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-600 rounded flex items-center justify-center">
                              <span className="text-xs">{symbol.flag}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {symbol.symbol}
                              </span>
                              <div className="text-sm text-slate-400">
                                Binary Option
                              </div>
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

        {/* Close EDGE_OFFSET wrapper */}
      </div>
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
