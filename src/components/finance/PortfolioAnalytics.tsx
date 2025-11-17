"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  PieChart,
  BarChart3,
  Activity,
  DollarSign,
  Percent,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Info,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Globe,
  Building,
  Cpu,
  Lightbulb,
  Heart,
  ShoppingCart,
  Truck,
  Home,
  Briefcase,
  Smartphone,
} from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  value: number;
  shares: number;
  price: number;
  change: number;
  changePercent: number;
  allocation: number;
  sector: string;
  country: string;
  marketCap: string;
  dividend?: number;
  beta?: number;
  pe?: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  description: string;
}

interface AllocationData {
  category: string;
  value: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

// TODO: REPLACE WITH REAL USER PORTFOLIO FROM DATABASE
// This mock data needs to be replaced with actual user portfolio data:
// - Fetch from Prisma: await prisma.portfolio.findMany({ where: { userId } })
// - Include: assets, transactions, historical performance
// - Calculate real-time values using current market prices
// - NEVER use this mock data in production
const mockAssets: Asset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    value: 25650.0,
    shares: 150,
    price: 171.0,
    change: 2.45,
    changePercent: 1.45,
    allocation: 20.5,
    sector: "Technology",
    country: "US",
    marketCap: "2.7T",
    dividend: 0.96,
    beta: 1.25,
    pe: 28.5,
    dayHigh: 172.5,
    dayLow: 169.25,
    volume: 45678900,
    avgVolume: 52000000,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    value: 18900.0,
    shares: 50,
    price: 378.0,
    change: -1.25,
    changePercent: -0.33,
    allocation: 15.1,
    sector: "Technology",
    country: "US",
    marketCap: "2.8T",
    dividend: 3.0,
    beta: 0.89,
    pe: 32.1,
    dayHigh: 380.25,
    dayLow: 376.5,
    volume: 28945600,
    avgVolume: 31000000,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    value: 15750.0,
    shares: 120,
    price: 131.25,
    change: 1.85,
    changePercent: 1.43,
    allocation: 12.6,
    sector: "Technology",
    country: "US",
    marketCap: "1.6T",
    beta: 1.05,
    pe: 25.8,
    dayHigh: 132.75,
    dayLow: 129.8,
    volume: 33456780,
    avgVolume: 28000000,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    value: 12400.0,
    shares: 80,
    price: 155.0,
    change: 4.25,
    changePercent: 2.82,
    allocation: 9.9,
    sector: "Consumer Cyclical",
    country: "US",
    marketCap: "493B",
    beta: 2.01,
    pe: 45.2,
    dayHigh: 157.2,
    dayLow: 152.3,
    volume: 89234560,
    avgVolume: 95000000,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    value: 10800.0,
    shares: 25,
    price: 432.0,
    change: 8.75,
    changePercent: 2.07,
    allocation: 8.6,
    sector: "Technology",
    country: "US",
    marketCap: "1.1T",
    beta: 1.75,
    pe: 65.3,
    dayHigh: 438.5,
    dayLow: 428.75,
    volume: 67890123,
    avgVolume: 55000000,
  },
  {
    symbol: "VOO",
    name: "Vanguard S&P 500 ETF",
    value: 8500.0,
    shares: 25,
    price: 340.0,
    change: 1.15,
    changePercent: 0.34,
    allocation: 6.8,
    sector: "Diversified",
    country: "US",
    marketCap: "N/A",
    dividend: 5.8,
    beta: 1.0,
    dayHigh: 341.25,
    dayLow: 338.9,
    volume: 3456789,
    avgVolume: 4200000,
  },
];

const performanceMetrics: PerformanceMetric[] = [
  {
    label: "Total Return",
    value: "+13.54%",
    change: "+2.1%",
    isPositive: true,
    description: "Overall portfolio performance since inception",
  },
  {
    label: "Annual Return",
    value: "+18.7%",
    change: "+3.2%",
    isPositive: true,
    description: "Annualized return over the past year",
  },
  {
    label: "Sharpe Ratio",
    value: "1.85",
    change: "+0.15",
    isPositive: true,
    description: "Risk-adjusted return measure",
  },
  {
    label: "Max Drawdown",
    value: "-8.2%",
    change: "-1.1%",
    isPositive: false,
    description: "Largest peak-to-trough decline",
  },
  {
    label: "Alpha",
    value: "+2.8%",
    change: "+0.5%",
    isPositive: true,
    description: "Excess return vs benchmark",
  },
  {
    label: "Beta",
    value: "1.12",
    change: "+0.02",
    isPositive: true,
    description: "Portfolio correlation to market",
  },
  {
    label: "Win Rate",
    value: "68%",
    change: "+5%",
    isPositive: true,
    description: "Percentage of profitable trades",
  },
  {
    label: "Volatility",
    value: "12.4%",
    change: "-0.8%",
    isPositive: true,
    description: "Standard deviation of returns",
  },
];

const sectorAllocations: AllocationData[] = [
  {
    category: "Technology",
    value: 72100,
    percentage: 57.7,
    color: "#3B82F6",
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    category: "Consumer Cyclical",
    value: 12400,
    percentage: 9.9,
    color: "#10B981",
    icon: <ShoppingCart className="w-4 h-4" />,
  },
  {
    category: "Diversified ETFs",
    value: 8500,
    percentage: 6.8,
    color: "#8B5CF6",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    category: "Healthcare",
    value: 15200,
    percentage: 12.2,
    color: "#EF4444",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    category: "Financial",
    value: 10450,
    percentage: 8.4,
    color: "#F59E0B",
    icon: <Building className="w-4 h-4" />,
  },
  {
    category: "Energy",
    value: 6241,
    percentage: 5.0,
    color: "#06B6D4",
    icon: <Zap className="w-4 h-4" />,
  },
];

const regionAllocations: AllocationData[] = [
  {
    category: "United States",
    value: 98750,
    percentage: 79.1,
    color: "#3B82F6",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    category: "Europe",
    value: 15200,
    percentage: 12.2,
    color: "#10B981",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    category: "Asia Pacific",
    value: 8450,
    percentage: 6.8,
    color: "#8B5CF6",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    category: "Emerging Markets",
    value: 2491,
    percentage: 1.9,
    color: "#F59E0B",
    icon: <Globe className="w-4 h-4" />,
  },
];

interface PortfolioAnalyticsProps {
  portfolioData?: {
    totalValue: number;
    todayChange: number;
    todayChangePercent: number;
    availableCash: number;
    totalInvested: number;
    totalReturn: number;
    totalReturnPercent: number;
    assets?: any[];
    portfolio?: {
      assets?: any[];
    };
  };
}

export function PortfolioAnalytics({
  portfolioData: propPortfolioData,
}: PortfolioAnalyticsProps = {}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1Y");
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview");
  const [sortBy, setSortBy] = useState<"value" | "change" | "allocation">(
    "value"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [portfolioData, setPortfolioData] = useState<any>(
    propPortfolioData || null
  );
  const [isLoading, setIsLoading] = useState(!propPortfolioData);

  const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

  // Fetch real user portfolio data only if not provided via props
  useEffect(() => {
    if (propPortfolioData) {
      setPortfolioData(propPortfolioData);
      setIsLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/portfolio?timeframe=${selectedTimeframe}`
        );
        if (response.ok) {
          const data = await response.json();
          setPortfolioData(data);
        }
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [selectedTimeframe, propPortfolioData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Convert user crypto assets to Asset format for display
  const userCryptoAssets: Asset[] = (
    portfolioData?.portfolio?.assets ||
    propPortfolioData?.assets ||
    []
  ).map((asset: any) => ({
    symbol: asset.symbol || asset.asset,
    name: asset.name || asset.symbol,
    value: asset.value || asset.amount * asset.price || 0,
    shares: asset.amount || asset.quantity || 0,
    price: asset.price || asset.currentPrice || 0,
    change: 0,
    changePercent: 0,
    allocation: 0,
    sector: "Cryptocurrency",
    country: "Global",
    marketCap: "N/A",
    dayHigh: asset.price || 0,
    dayLow: asset.price || 0,
    volume: 0,
    avgVolume: 0,
  }));

  const sortedAssets = [
    ...(userCryptoAssets.length > 0 ? userCryptoAssets : mockAssets),
  ].sort((a, b) => {
    const multiplier = sortOrder === "desc" ? -1 : 1;
    if (sortBy === "value") return (a.value - b.value) * multiplier;
    if (sortBy === "change")
      return (a.changePercent - b.changePercent) * multiplier;
    if (sortBy === "allocation")
      return (a.allocation - b.allocation) * multiplier;
    return 0;
  });

  // Use real portfolio data if available, otherwise use mock data
  const totalValue =
    portfolioData?.totalValue ??
    propPortfolioData?.totalValue ??
    mockAssets.reduce((sum, asset) => sum + asset.value, 0);

  const totalChange =
    portfolioData?.todayChange ??
    propPortfolioData?.todayChange ??
    mockAssets.reduce(
      (sum, asset) => sum + (asset.value * asset.changePercent) / 100,
      0
    );

  const totalChangePercent =
    portfolioData?.todayChangePercent ??
    propPortfolioData?.todayChangePercent ??
    (totalValue > 0 ? (totalChange / totalValue) * 100 : 0);

  const totalReturn =
    propPortfolioData?.totalReturn ??
    totalValue - (propPortfolioData?.totalInvested ?? 0);

  const totalReturnPercent =
    propPortfolioData?.totalReturnPercent ??
    (propPortfolioData?.totalInvested && propPortfolioData.totalInvested > 0
      ? ((totalValue - propPortfolioData.totalInvested) /
          propPortfolioData.totalInvested) *
        100
      : 0);

  // Create performance metrics with real data
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: "Total Return",
      value: `${totalReturnPercent >= 0 ? "+" : ""}${totalReturnPercent.toFixed(
        2
      )}%`,
      change:
        totalChangePercent >= 0
          ? `+${totalChangePercent.toFixed(1)}%`
          : `${totalChangePercent.toFixed(1)}%`,
      isPositive: totalChangePercent >= 0,
      description: "Overall portfolio performance since inception",
    },
    {
      label: "Available Cash",
      value: `$${(propPortfolioData?.availableCash ?? 0).toLocaleString()}`,
      description: "Cash available for investment",
    },
    {
      label: "Total Invested",
      value: `$${(propPortfolioData?.totalInvested ?? 0).toLocaleString()}`,
      description: "Total capital deployed",
    },
    {
      label: "Today's P&L",
      value: `${totalChange >= 0 ? "+" : ""}$${Math.abs(
        totalChange
      ).toLocaleString()}`,
      change: `${
        totalChangePercent >= 0 ? "+" : ""
      }${totalChangePercent.toFixed(1)}%`,
      isPositive: totalChange >= 0,
      description: "Today's profit or loss",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Total Portfolio Value
            </h3>
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1 ${
                  totalChangePercent >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {totalChangePercent >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(totalChangePercent).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">
              ${totalValue.toLocaleString()}
            </p>
            <p
              className={`text-lg ${
                totalChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)} today
            </p>
            <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
              <span>Last updated: 2 minutes ago</span>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Performance Metrics
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  setSelectedMetric(Math.max(0, selectedMetric - 1))
                }
                className="p-1 text-gray-400 hover:text-white transition-colors"
                disabled={selectedMetric === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400">
                {selectedMetric + 1} / {performanceMetrics.length}
              </span>
              <button
                onClick={() =>
                  setSelectedMetric(
                    Math.min(performanceMetrics.length - 1, selectedMetric + 1)
                  )
                }
                className="p-1 text-gray-400 hover:text-white transition-colors"
                disabled={selectedMetric === performanceMetrics.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMetric}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <p className="text-2xl font-bold text-white">
                  {performanceMetrics[selectedMetric].value}
                </p>
                <p className="text-gray-400 text-sm">
                  {performanceMetrics[selectedMetric].label}
                </p>
              </div>

              {performanceMetrics[selectedMetric].change && (
                <div
                  className={`flex items-center space-x-1 ${
                    performanceMetrics[selectedMetric].isPositive
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {performanceMetrics[selectedMetric].isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {performanceMetrics[selectedMetric].change} vs last period
                  </span>
                </div>
              )}

              <p className="text-sm text-gray-400">
                {performanceMetrics[selectedMetric].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
