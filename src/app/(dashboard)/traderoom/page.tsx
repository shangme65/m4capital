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
  Briefcase,
  History,
  MessageCircle,
  MessagesSquare,
  Gift,
  Handshake,
  BookOpen,
  MoreHorizontal,
  PieChart,
  TrendingUpIcon,
  Target,
  Users,
  Headphones,
  Grid3X3,
  Grid2X2,
  Info,
  CircleHelp,
} from "lucide-react";
import {
  TradingProvider,
  useTradingContext,
} from "@/components/client/EnhancedTradingProvider";
import {
  CryptoMarketProvider,
  useCryptoMarket,
} from "@/components/client/CryptoMarketProvider";
import {
  BitcoinPriceWidget,
  CryptoPriceTicker,
} from "@/components/client/CryptoPriceTicker";
import ErrorBoundary from "@/components/client/ErrorBoundary";

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
  const [showChartGrids, setShowChartGrids] = useState(false);
  const [selectedChartGrid, setSelectedChartGrid] = useState(1);
  const [showTradingHistory, setShowTradingHistory] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [historyFilter, setHistoryFilter] = useState("All Positions");
  const [showMoreItems, setShowMoreItems] = useState(false);

  // Get trading context for history data
  const { tradeHistory, openPositions } = useTradingContext();

  // Get crypto market data
  const {
    cryptoPrices,
    getCryptoPrice,
    isConnected: cryptoConnected,
  } = useCryptoMarket();

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
      price:
        getCryptoPrice("BTC")?.price?.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        }) || "67890.45",
      change: getCryptoPrice("BTC")?.change24h?.toFixed(2) || "+1234.56",
      percentage: `${
        (getCryptoPrice("BTC")?.changePercent24h || 0) >= 0 ? "+" : ""
      }${getCryptoPrice("BTC")?.changePercent24h?.toFixed(2) || "1.85"}%`,
      flag: "₿💵",
    },
    {
      symbol: "ETH/USD",
      price:
        getCryptoPrice("ETH")?.price?.toLocaleString("en-US", {
          maximumFractionDigits: 2,
        }) || "2456.78",
      change: getCryptoPrice("ETH")?.change24h?.toFixed(2) || "-23.45",
      percentage: `${
        (getCryptoPrice("ETH")?.changePercent24h || 0) >= 0 ? "+" : ""
      }${getCryptoPrice("ETH")?.changePercent24h?.toFixed(2) || "0.95"}%`,
      flag: "⟠💵",
    },
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const tradingHistory = [
    {
      id: 1,
      time: "19:06",
      date: "17 Oct",
      symbol: "USD/CAD",
      type: "Binary",
      direction: "higher",
      amount: 10000,
      result: "win",
      profit: 8600,
      percentage: "+86.00%",
      flag: "🇺🇸🇨🇦",
      closePrice: "1.385575",
      openPrice: "1.383925",
    },
    {
      id: 2,
      time: "02:38",
      date: "6 Oct",
      symbol: "USD/CAD",
      type: "Binary",
      direction: "higher",
      amount: 10000,
      result: "loss",
      profit: -10000,
      percentage: "-100%",
      flag: "🇺🇸🇨🇦",
      closePrice: "1.383925",
      openPrice: "1.385575",
    },
    {
      id: 3,
      time: "21:51",
      date: "11 Sep",
      symbol: "USD/CAD",
      type: "10 Binary",
      direction: "higher",
      amount: 100000,
      result: "loss",
      profit: -98140,
      percentage: "-98.14%",
      flag: "🇺🇸🇨🇦",
      closePrice: "1.385575",
      openPrice: "1.390000",
    },
    {
      id: 4,
      time: "21:50",
      date: "11 Sep",
      symbol: "USD/CAD",
      type: "10 Binary",
      direction: "lower",
      amount: 100000,
      result: "win",
      profit: 86000,
      percentage: "+86.00%",
      flag: "🇺🇸🇨🇦",
      closePrice: "1.383925",
      openPrice: "1.385575",
    },
    {
      id: 5,
      time: "21:35",
      date: "11 Sep",
      symbol: "USD/CAD",
      type: "8 Binary",
      direction: "lower",
      amount: 80000,
      result: "loss",
      profit: -65120,
      percentage: "-81.40%",
      flag: "🇺🇸🇨🇦",
      closePrice: "1.385575",
      openPrice: "1.383925",
    },
  ];

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
        className="h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: "#1b1817", color: "#eceae9" }}
      >
        <div className="text-center space-y-6">
          {/* Logo */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-8"
          >
            <Image
              src="/m4capitallogo2.png"
              alt="M4Capital"
              width={120}
              height={120}
              className="mx-auto object-contain"
            />
          </motion.div>

          {/* Loading Bar */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "#ff8516" }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-lg font-medium"
            style={{ color: "#ff8516" }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Preparing Your Trading Experience...
          </motion.p>

          {/* Subtext */}
          <p className="text-sm" style={{ color: "#827e7d" }}>
            Setting up markets, charts, and real-time data
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100%;
          width: 100%;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        className="h-screen w-screen m-0 p-0"
        style={{
          backgroundColor: "#1b1817",
          color: "#eceae9",
          fontFamily: '"Inter", Arial, sans-serif',
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zoom: 0.95,
          overflow: "hidden",
        }}
      >
      {/* IQ Option Header */}
      <header
        style={{
          backgroundColor: "#26211f",
          borderBottom: "1px solid #38312e",
        }}
      >
        <div className="flex items-center justify-between h-32 md:h-14 px-4">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              {/* Desktop: logo1, Mobile: logo2 */}
              <div className="hidden md:block">
                <Image
                  src="/m4capitallogo1.png"
                  alt="M4Capital"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              <div className="block md:hidden w-14 h-14 relative">
                <Image
                  src="/m4capitallogo2.png"
                  alt="M4Capital"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Chart Grid Icon */}
            <button
              onClick={() => setShowChartGrids(!showChartGrids)}
              className="rounded transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: "transparent",
                padding: "6px",
                border: "1px solid rgba(139, 133, 131, 0.3)",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Top-left box */}
                <rect x="4" y="4" width="7" height="7" fill="#8b8583" rx="1" />
                {/* Top-right box */}
                <rect x="13" y="4" width="7" height="7" fill="#8b8583" rx="1" />
                {/* Bottom-left box */}
                <rect x="4" y="13" width="7" height="7" fill="#8b8583" rx="1" />
                {/* Bottom-right box */}
                <rect
                  x="13"
                  y="13"
                  width="7"
                  height="7"
                  fill="#8b8583"
                  rx="1"
                />
              </svg>
            </button>

            {/* Trading Pair Tabs */}
            <div className="flex items-center space-x-2">
              {openTabs.map((tab, index) => (
                <button
                  key={`header-tab-${index}-${tab.symbol}`}
                  onClick={() => {
                    setActiveTab(index);
                    setSelectedSymbol(tab.symbol);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor:
                      activeTab === index ? "#ff8516" : "#38312e",
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

      {/* Main Trading Interface */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* IQ Option Style Sidebar */}
        <div
          className="flex-col border-r flex"
          style={{
            backgroundColor: "#1b1817",
            borderColor: "#38312e",
            width: "76px",
          }}
        >
          {/* Sidebar Icons */}
          <div className="flex flex-col items-center py-4 space-y-6">
            {/* Total Portfolio */}
            <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                <Briefcase
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  TOTAL
                </div>
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  PORTFOLIO
                </div>
              </div>
            </div>

            {/* Trading History */}
            <div
              className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300"
              onClick={() => setShowTradingHistory(!showTradingHistory)}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: showTradingHistory
                    ? "#4a4a4a"
                    : "transparent",
                }}
              >
                <History
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{
                    color: showTradingHistory ? "#ffffff" : "#827e7d",
                  }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{
                    color: showTradingHistory ? "#4a4a4a" : "#827e7d",
                  }}
                >
                  TRADING
                </div>
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{
                    color: showTradingHistory ? "#4a4a4a" : "#827e7d",
                  }}
                >
                  HISTORY
                </div>
              </div>
            </div>

            {/* Chats & Support */}
            <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                <MessageCircle
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  CHATS &
                </div>
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  SUPPORT
                </div>
              </div>
            </div>

            {/* Promo */}
            <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                <Gift
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  PROMO
                </div>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                <BarChart3
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  MARKET
                </div>
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  ANALYSIS
                </div>
              </div>
            </div>

            {/* Tutorials */}
            <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                <BookOpen
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{ color: "#827e7d" }}
                >
                  TUTORIALS
                </div>
              </div>
            </div>

            {/* More */}
            <div
              className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300"
              onClick={() => setShowMoreItems(!showMoreItems)}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  backgroundColor: showMoreItems ? "#4a4a4a" : "transparent",
                }}
              >
                <MoreHorizontal
                  className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                  style={{
                    color: showMoreItems ? "#ffffff" : "#827e7d",
                  }}
                />
              </div>
              <div className="mt-1 text-center">
                <div
                  className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                  style={{
                    color: showMoreItems ? "#4a4a4a" : "#827e7d",
                  }}
                >
                  MORE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Items Popup Panel */}
        <AnimatePresence>
          {showMoreItems && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-64 flex-col border-r z-10"
              style={{ backgroundColor: "#26211f", borderColor: "#38312e" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: "#38312e" }}
              >
                <h3
                  className="font-semibold text-lg"
                  style={{ color: "#eceae9" }}
                >
                  More Items
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    className="hover:opacity-75 transition-opacity"
                    style={{ color: "#afadac" }}
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowMoreItems(false)}
                    className="hover:opacity-75 transition-opacity"
                    style={{ color: "#afadac", fontSize: "20px" }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* More Items List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Leaderboard */}
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#38312e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <Target
                        className="w-4 h-4"
                        style={{ color: "#afadac" }}
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#eceae9" }}
                    >
                      LEADERBOARD
                    </span>
                  </div>

                  {/* Partnership */}
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#38312e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <Handshake
                        className="w-4 h-4"
                        style={{ color: "#afadac" }}
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#eceae9" }}
                    >
                      PARTNERSHIP
                    </span>
                  </div>

                  {/* Tournaments */}
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#38312e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <Target
                        className="w-4 h-4"
                        style={{ color: "#afadac" }}
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#eceae9" }}
                    >
                      TOURNAMENTS
                    </span>
                  </div>

                  {/* Help */}
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#38312e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#afadac" }}
                      >
                        ?
                      </span>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#eceae9" }}
                    >
                      HELP
                    </span>
                  </div>

                  {/* Alerts */}
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#38312e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <Bell className="w-4 h-4" style={{ color: "#afadac" }} />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#eceae9" }}
                    >
                      ALERTS
                    </span>
                  </div>

                  {/* Tutorials */}
                  <div
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#38312e")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#38312e" }}
                    >
                      <BookOpen
                        className="w-4 h-4"
                        style={{ color: "#afadac" }}
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#eceae9" }}
                    >
                      TUTORIALS
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Chart and Controls */}
        <div className="flex-1 flex flex-col">
          {/* Chart Header 
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
          </div> */}

          {/* Chart Grids Panel */}
          <AnimatePresence>
            {showChartGrids && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b overflow-hidden"
                style={{ backgroundColor: "#26211f", borderColor: "#38312e" }}
              >
                <div className="p-4">
                  <h3
                    className="text-sm font-semibold mb-4"
                    style={{ color: "#eceae9" }}
                  >
                    CHART GRIDS
                  </h3>

                  {/* 1 Chart */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: "#afadac" }}>
                        1 chart
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedChartGrid(1)}
                      className="p-2 rounded transition-all duration-200"
                      style={{
                        backgroundColor:
                          selectedChartGrid === 1 ? "#ff8516" : "#38312e",
                        border: `1px solid ${
                          selectedChartGrid === 1 ? "#ff8516" : "#38312e"
                        }`,
                      }}
                    >
                      <div
                        className="w-8 h-6 rounded-sm"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 1 ? "#ffffff" : "#827e7d",
                        }}
                      />
                    </button>
                  </div>

                  {/* 2 Charts */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: "#afadac" }}>
                        2 charts
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedChartGrid(2)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 2 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 2 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="flex space-x-1">
                          <div
                            className="w-4 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 2 ? "#ffffff" : "#827e7d",
                            }}
                          />
                          <div
                            className="w-4 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 2 ? "#ffffff" : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(22)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 22 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 22 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="flex flex-col space-y-1">
                          <div
                            className="w-8 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 22
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-8 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 22
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 3 Charts */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: "#afadac" }}>
                        3 charts
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedChartGrid(3)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 3 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 3 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 3 ? "#ffffff" : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 3 ? "#ffffff" : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 3 ? "#ffffff" : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(32)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 32 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 32 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-1">
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 32
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 32
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-6 h-2 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 32
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(33)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 33 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 33 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-1">
                          <div
                            className="w-6 h-2 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 33
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 33
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 33
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(34)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 34 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 34 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-1">
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 34
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-sm row-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 34
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 34
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(35)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 35 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 35 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-1">
                          <div
                            className="w-2 h-4 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 35
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-4 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 35
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-4 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 35
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 4 Charts */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: "#afadac" }}>
                        4 charts
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedChartGrid(4)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 4 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 4 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-1">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 4 ? "#ffffff" : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 4 ? "#ffffff" : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 4 ? "#ffffff" : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 4 ? "#ffffff" : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(42)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 42 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 42 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 42
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 42
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 42
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-6 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 42
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(43)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 43 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 43 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-1">
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 43
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 43
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 43
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-6 h-2 rounded-sm col-span-3"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 43
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(44)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 44 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 44 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-1">
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 44
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-2 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 44
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-6 h-2 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 44
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-6 h-2 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 44
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(45)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 45 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 45 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="flex flex-col space-y-1">
                          <div
                            className="w-8 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 45
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-8 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 45
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-8 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 45
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-8 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 45
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* More Grids */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: "#afadac" }}>
                        More grids
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {/* Row 1 */}
                      <button
                        onClick={() => setSelectedChartGrid(51)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 51 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 51 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-px">
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 51
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 51
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 51
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 51
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 51
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 51
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(52)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 52 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 52 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-px">
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 52
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 52
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 52
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 52
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 52
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 52
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(53)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 53 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 53 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-px">
                          <div
                            className="w-4 h-1 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 53
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 53
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 53
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 53
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 53
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(54)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 54 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 54 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-px">
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 54
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 54
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 54
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-1 rounded-sm col-span-3"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 54
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-3 h-1 rounded-sm col-span-3"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 54
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(55)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 55 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 55 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-px">
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 55
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 55
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 55
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 55
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 55
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 55
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>

                      {/* Row 2 */}
                      <button
                        onClick={() => setSelectedChartGrid(56)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 56 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 56 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-px">
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 56
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 56
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 56
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 56
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-4 h-1 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 56
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(57)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 57 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 57 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-px">
                          <div
                            className="w-4 h-1 rounded-sm col-span-2"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 57
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 57
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 57
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 57
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-2 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 57
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(58)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 58 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 58 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-px">
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 58
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 58
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 58
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 58
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 58
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 58
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(59)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 59 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 59 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-px">
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 59
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 59
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 59
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 59
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 59
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 59
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedChartGrid(60)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 60 ? "#ff8516" : "#38312e",
                          border: `1px solid ${
                            selectedChartGrid === 60 ? "#ff8516" : "#38312e"
                          }`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-px">
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 60
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 60
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 60
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 60
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 60
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                          <div
                            className="w-1 h-1 rounded-sm"
                            style={{
                              backgroundColor:
                                selectedChartGrid === 60
                                  ? "#ffffff"
                                  : "#827e7d",
                            }}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Remember checkbox */}
                  <div
                    className="flex items-center space-x-2 pt-2 border-t"
                    style={{ borderColor: "#38312e" }}
                  >
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded"
                      style={{ accentColor: "#ff8516" }}
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs"
                      style={{ color: "#afadac" }}
                    >
                      Remember the number of charts (the first chart will be
                      active)
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chart Area */}
          <div
            className="flex-1 flex items-center justify-center relative"
            style={{
              backgroundColor: "#1b1817",
              backgroundImage: "url(/traderoom/backgrounds/m4capital1.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              minHeight: "500px",
              opacity: 0.15,
            }}
          ></div>
        </div>

        {/* Trade Details Panel */}
        {selectedTrade && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-col border-l border-r overflow-hidden"
            style={{ backgroundColor: "#26211f", borderColor: "#38312e" }}
          >
            {/* Trade Details Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: "#38312e" }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedTrade.flag}</span>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: "#eceae9" }}
                >
                  {selectedTrade.symbol} ({selectedTrade.type})
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrade(null)}
                className="hover:opacity-75 transition-opacity"
                style={{ color: "#afadac", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            {/* Chart Area - Simplified */}
            <div
              className="h-48 border-b flex items-center justify-center relative"
              style={{
                backgroundColor: "#1b1817",
                borderColor: "#38312e",
                backgroundImage: "url(/traderoom/backgrounds/world-map.webp)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* World map overlay for opacity control */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: "#1b1817",
                  opacity: 0.9,
                }}
              />
              <div className="text-center relative z-10">
                <div className="mb-4 relative">
                  {/* Simple price line visualization */}
                  <div
                    className="w-64 h-1 rounded"
                    style={{ backgroundColor: "#38312e" }}
                  >
                    <div
                      className="h-1 rounded transition-all duration-1000"
                      style={{
                        width: "70%",
                        backgroundColor:
                          selectedTrade.result === "win"
                            ? "#5ddf38"
                            : "#ff4747",
                      }}
                    />
                  </div>
                  <div className="absolute top-2 right-0 text-right">
                    <div
                      className="text-sm font-bold"
                      style={{ color: "#eceae9" }}
                    >
                      {selectedTrade.closePrice}
                    </div>
                  </div>
                  <div className="absolute top-2 left-0">
                    <div className="text-sm" style={{ color: "#827e7d" }}>
                      {selectedTrade.openPrice}
                    </div>
                  </div>
                </div>
                <div className="text-xs" style={{ color: "#827e7d" }}>
                  Trade executed based on tick-by-tick quotes
                </div>
                <div
                  className="text-xs font-semibold mt-1"
                  style={{ color: "#ff8516" }}
                >
                  Historical Quotes
                </div>
              </div>
            </div>

            {/* Trade Summary */}
            <div className="p-4 space-y-4">
              {/* Net P/L */}
              <div>
                <div className="text-sm mb-2" style={{ color: "#827e7d" }}>
                  NET P/L
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color:
                        selectedTrade.result === "win" ? "#5ddf38" : "#ff4747",
                    }}
                  >
                    {selectedTrade.result === "win" ? "+" : ""}$
                    {Math.abs(selectedTrade.profit).toLocaleString()} (
                    {selectedTrade.percentage})
                  </div>
                  <div className="text-right">
                    <div className="text-sm" style={{ color: "#827e7d" }}>
                      INVEST
                    </div>
                    <div
                      className="text-lg font-semibold"
                      style={{ color: "#eceae9" }}
                    >
                      ${selectedTrade.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Position Status */}
              <div className="text-center py-2">
                <div className="text-sm mb-1" style={{ color: "#827e7d" }}>
                  Position closed automatically
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="w-4 h-4" style={{ color: "#827e7d" }} />
                  <span className="text-xs" style={{ color: "#827e7d" }}>
                    {selectedTrade.date} {selectedTrade.time}
                  </span>
                </div>
              </div>

              {/* Trade Details Table */}
              <div className="border-t pt-4" style={{ borderColor: "#38312e" }}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: "#827e7d" }}>Time</span>
                  <span style={{ color: "#827e7d" }}>Value</span>
                  <span style={{ color: "#827e7d" }}>Amount</span>
                  <span style={{ color: "#827e7d" }}>Result (P/L)</span>
                </div>

                {/* Trade Entry */}
                <div
                  className="flex items-center justify-between text-sm py-2 border-b"
                  style={{ borderColor: "#38312e" }}
                >
                  <span style={{ color: "#eceae9" }}>{selectedTrade.date}</span>
                  <div className="flex items-center space-x-1">
                    {selectedTrade.direction === "higher" ? (
                      <TrendingUp
                        className="w-3 h-3"
                        style={{ color: "#5ddf38" }}
                      />
                    ) : (
                      <TrendingDown
                        className="w-3 h-3"
                        style={{ color: "#ff4747" }}
                      />
                    )}
                    <span style={{ color: "#eceae9" }}>
                      {selectedTrade.openPrice}
                    </span>
                  </div>
                  <span style={{ color: "#eceae9" }}>
                    ${selectedTrade.amount.toFixed(2)}
                  </span>
                  <span
                    style={{
                      color:
                        selectedTrade.result === "win" ? "#5ddf38" : "#ff4747",
                    }}
                  >
                    {selectedTrade.result === "win" ? "+" : ""}$
                    {Math.abs(selectedTrade.profit).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right Panel: IQ Option Style Trading Panel */}
        <div
          className="w-64 flex-col border-l hidden xl:flex"
          style={{ 
            backgroundColor: "#2b2a3e", 
            borderColor: "#38312e",
            overflow: "hidden"
          }}
        >
          <div className="p-3 space-y-2 h-full overflow-hidden">
            {/* Live Bitcoin Price Widget with red border */}
            <div
              className="rounded-lg border-2 p-3"
              style={{
                backgroundColor: "#1a1a2e",
                borderColor: "#e74c3c",
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#ff8516" }}
                >
                  <span className="text-white font-bold text-sm">₿</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold text-base">
                      Bitcoin
                    </span>
                    <span className="text-red-500 font-bold text-base">
                      $107
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">BTC</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="text-gray-400 text-xs mb-1">Market Cap</div>
                  <div className="text-white font-semibold text-xs">$2.15T</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">24h Volume</div>
                  <div className="text-white font-semibold text-xs">
                    $60.22B
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-400 text-xs">
                  Live Price Updated: 07:32:18
                </span>
              </div>
            </div>

            {/* Amount Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "#9e9aa7" }}>
                  Amount
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    className="w-4 h-4 rounded text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#3d3c4f", color: "#9e9aa7" }}
                  >
                    ?
                  </button>
                  <button
                    className="w-4 h-4 rounded text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#3d3c4f", color: "#9e9aa7" }}
                  >
                    +
                  </button>
                  <button
                    className="w-4 h-4 rounded text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#3d3c4f", color: "#9e9aa7" }}
                  >
                    -
                  </button>
                </div>
              </div>
              <div
                className="flex items-center px-3 py-2 rounded"
                style={{ backgroundColor: "#3d3c4f" }}
              >
                <span
                  className="text-lg font-semibold"
                  style={{ color: "#ffffff" }}
                >
                  $ {amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Expiration Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "#9e9aa7" }}>
                  Expiration
                </span>
                <button
                  className="w-4 h-4 rounded text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#3d3c4f", color: "#9e9aa7" }}
                >
                  ?
                </button>
              </div>
              <div
                className="flex items-center px-3 py-2 rounded"
                style={{ backgroundColor: "#3d3c4f" }}
              >
                <Clock className="w-3 h-3 mr-2" style={{ color: "#9e9aa7" }} />
                <span
                  className="text-sm font-medium"
                  style={{ color: "#ffffff" }}
                >
                  {expirationSeconds < 60
                    ? `${expirationSeconds} sec`
                    : expirationSeconds < 3600
                    ? `${expirationSeconds / 60} min`
                    : `${expirationSeconds / 3600} hr`}
                </span>
              </div>
            </div>

            {/* Profit Display */}
            <div className="py-2">
              <div className="flex items-center justify-center mb-1">
                <span className="text-xs" style={{ color: "#9e9aa7" }}>
                  Profit
                </span>
                <button
                  className="w-4 h-4 rounded text-xs flex items-center justify-center ml-1 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#3d3c4f", color: "#9e9aa7" }}
                >
                  ?
                </button>
              </div>
              <div
                className="text-3xl font-bold mb-1 text-center"
                style={{ color: "#22c55e" }}
              >
                +86%
              </div>
              <div
                className="text-lg font-semibold text-center"
                style={{ color: "#22c55e" }}
              >
                +${" "}
                {(amount * 0.86)
                  .toFixed(0)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>

            {/* Trading Buttons */}
            <div className="space-y-2">
              {/* Higher Button */}
              <motion.button
                onClick={() => executeTrade("higher")}
                disabled={isExecutingTrade}
                className="w-full transition-all duration-200 disabled:opacity-50 border-0 p-0 bg-transparent cursor-pointer block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src="/traderoom/icons/higher-button.png"
                  alt="HIGHER"
                  width={240}
                  height={50}
                  className="w-full h-auto rounded"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </motion.button>

              {/* Lower Button */}
              <motion.button
                onClick={() => executeTrade("lower")}
                disabled={isExecutingTrade}
                className="w-full transition-all duration-200 disabled:opacity-50 border-0 p-0 bg-transparent cursor-pointer block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src="/traderoom/icons/lower-button.png"
                  alt="LOWER"
                  width={240}
                  height={50}
                  className="w-full h-auto rounded"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </motion.button>
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

      {/* Trading History Modal */}
      <AnimatePresence>
        {showTradingHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTradingHistory(false)}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[80vh] rounded-lg overflow-hidden"
              style={{ backgroundColor: "#1b1817" }}
            >
              {/* Header */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: "#38312e" }}
              >
                <div className="flex items-center space-x-3">
                  <History className="w-6 h-6" style={{ color: "#ff8516" }} />
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "#ffffff" }}
                  >
                    Trading History
                  </h2>
                </div>
                <button
                  onClick={() => setShowTradingHistory(false)}
                  className="p-2 hover:opacity-75 transition-opacity"
                  style={{ color: "#afadac" }}
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: "#38312e" }}
              >
                <div className="flex items-center space-x-4">
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm border"
                    style={{
                      backgroundColor: "#38312e",
                      borderColor: "#4a4540",
                      color: "#afadac",
                    }}
                  >
                    <option value="All Positions">All Positions</option>
                    <option value="Win">Wins Only</option>
                    <option value="Loss">Losses Only</option>
                    <option value="Open">Open Positions</option>
                  </select>
                </div>
                <div className="text-sm" style={{ color: "#afadac" }}>
                  Total Trades: {tradeHistory.length + openPositions.length}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-96">
                {/* Open Positions */}
                {openPositions.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-lg font-medium mb-3"
                      style={{ color: "#ff8516" }}
                    >
                      Open Positions ({openPositions.length})
                    </h3>
                    <div className="space-y-2">
                      {openPositions.map((position) => (
                        <div
                          key={position.id}
                          className="p-3 rounded-lg border flex items-center justify-between"
                          style={{
                            backgroundColor: "#252320",
                            borderColor: "#38312e",
                          }}
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className="font-medium"
                                style={{ color: "#ffffff" }}
                              >
                                {position.symbol}
                              </span>
                              <span
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor:
                                    position.direction === "HIGHER"
                                      ? "#5ddf38"
                                      : "#ff4747",
                                  color: "#ffffff",
                                }}
                              >
                                {position.direction}
                              </span>
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "#afadac" }}
                            >
                              Amount: ${position.amount} • Entry: $
                              {position.entryPrice}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-sm"
                              style={{ color: "#afadac" }}
                            >
                              {new Date(
                                position.entryTime
                              ).toLocaleTimeString()}
                            </div>
                            <div
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: "#ffa500",
                                color: "#ffffff",
                              }}
                            >
                              ACTIVE
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trade History */}
                {tradeHistory.length > 0 ? (
                  <div>
                    <h3
                      className="text-lg font-medium mb-3"
                      style={{ color: "#ff8516" }}
                    >
                      Completed Trades ({tradeHistory.length})
                    </h3>
                    <div className="space-y-2">
                      {tradeHistory
                        .filter((trade) => {
                          if (historyFilter === "All Positions") return true;
                          if (historyFilter === "Win")
                            return trade.status === "WIN";
                          if (historyFilter === "Loss")
                            return trade.status === "LOSS";
                          return false;
                        })
                        .map((trade) => (
                          <div
                            key={trade.id}
                            className="p-3 rounded-lg border flex items-center justify-between"
                            style={{
                              backgroundColor: "#252320",
                              borderColor: "#38312e",
                            }}
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className="font-medium"
                                  style={{ color: "#ffffff" }}
                                >
                                  {trade.symbol}
                                </span>
                                <span
                                  className="px-2 py-1 rounded text-xs"
                                  style={{
                                    backgroundColor:
                                      trade.direction === "HIGHER"
                                        ? "#5ddf38"
                                        : "#ff4747",
                                    color: "#ffffff",
                                  }}
                                >
                                  {trade.direction}
                                </span>
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#afadac" }}
                              >
                                Amount: ${trade.amount} • Entry: $
                                {trade.entryPrice}
                                {trade.exitPrice &&
                                  ` • Exit: $${trade.exitPrice}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-medium ${
                                  trade.profit >= 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {trade.profit >= 0 ? "+" : ""}$
                                {trade.profit.toFixed(2)}
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#afadac" }}
                              >
                                {new Date(trade.entryTime).toLocaleString()}
                              </div>
                              <div
                                className={`text-xs px-2 py-1 rounded ${
                                  trade.status === "WIN"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {trade.status}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      style={{ color: "#827e7d" }}
                    />
                    <p
                      className="text-lg font-medium mb-2"
                      style={{ color: "#afadac" }}
                    >
                      No Trading History
                    </p>
                    <p className="text-sm" style={{ color: "#827e7d" }}>
                      Execute some trades to see your history here
                    </p>
                  </div>
                )}
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

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between text-xs z-50"
        style={{
          backgroundColor: "#2c3e50",
          color: "#95a5a6",
          height: "40px",
        }}
      >
        <div className="flex items-center pl-3 space-x-3">
          {/* Double-round support button: outer ring + inner red button with icon and text */}
          <div className="relative flex items-center justify-center">
            <div
              className="w-[80px] h-[32px] rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <button
                className="h-[28px] px-3 rounded-md flex items-center space-x-1.5 transition-opacity duration-200 hover:opacity-90"
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#ffffff",
                }}
              >
                <MessagesSquare className="w-3.5 h-3.5" />
                <span className="font-semibold text-[10px] tracking-wide">
                  SUPPORT
                </span>
              </button>
            </div>
          </div>

          <CircleHelp className="w-4 h-4" style={{ color: "#95a5a6" }} />

          <a
            href="mailto:support@m4capital.online"
            className="text-[13px] hover:text-orange-500 transition-colors duration-150"
            style={{ color: "#ffffff" }}
          >
            support@m4capital.online
          </a>

          <div className="text-[12px] font-bold text-gray-400 ml-2">
            EVERY DAY, AROUND THE CLOCK
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span>Powered by</span>
            <Image
              src="/m4capitallogo2.png"
              alt="M4Capital"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <button className="hover:text-orange-500 transition-colors duration-200">
            <Settings className="w-4 h-4" />
          </button>
          <button className="hover:text-orange-500 transition-colors duration-200">
            <Bell className="w-4 h-4" />
          </button>
          {currentTime && (
            <span className="font-mono">
              CURRENT TIME:{" "}
              {currentTime
                .toLocaleString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
                .toUpperCase()
                .replace(",", ",")}{" "}
              (UTC+1)
            </span>
          )}
        </div>
      </footer>
    </div>
    </>
  );
}

export default function TraderoomPage() {
  return (
    <ErrorBoundary>
      <CryptoMarketProvider>
        <TradingProvider>
          <TradingInterface />
        </TradingProvider>
      </CryptoMarketProvider>
    </ErrorBoundary>
  );
}
