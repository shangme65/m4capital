"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  amount?: number;
  percentage: number;
  price?: number;
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

interface PortfolioAnalyticsData {
  totalValue: number;
  balance: number;
  assetAllocation: Asset[];
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    totalCommission: number;
    netProfit: number;
  };
  recentActivity: {
    deposits: number;
    withdrawals: number;
    tradingPnL: number;
    netChange: number;
  };
  performanceHistory: Array<{
    date: string;
    value: number;
    deposits: number;
    withdrawals: number;
  }>;
}

interface PortfolioAnalyticsProps {
  portfolioData?: PortfolioAnalyticsData;
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
  const [portfolioData, setPortfolioData] =
    useState<PortfolioAnalyticsData | null>(propPortfolioData || null);
  const [isLoading, setIsLoading] = useState(!propPortfolioData);

  const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

  // Fetch real user portfolio analytics data
  useEffect(() => {
    if (propPortfolioData) {
      setPortfolioData(propPortfolioData);
      setIsLoading(false);
      return;
    }

    const fetchPortfolioAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/finance/portfolio-analytics");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.analytics) {
            setPortfolioData(data.analytics);
          }
        }
      } catch (error) {
        console.error("Failed to fetch portfolio analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioAnalytics();
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
  const userCryptoAssets: Asset[] = (portfolioData?.assetAllocation || []).map(
    (asset: Asset) => ({
      symbol: asset.symbol,
      name: asset.name || asset.symbol,
      value: asset.value || 0,
      amount: asset.amount || 0,
      percentage: asset.percentage || 0,
      price: asset.price || 0,
    })
  );

  const sortedAssets = [...userCryptoAssets].sort((a, b) => {
    const multiplier = sortOrder === "desc" ? -1 : 1;
    if (sortBy === "value") return (a.value - b.value) * multiplier;
    if (sortBy === "allocation")
      return (a.percentage - b.percentage) * multiplier;
    return 0;
  });

  // Use real portfolio data
  const totalValue = portfolioData?.totalValue ?? 0;
  const cashBalance = portfolioData?.balance ?? 0;
  const netProfit = portfolioData?.performance?.netProfit ?? 0;
  const totalTrades = portfolioData?.performance?.totalTrades ?? 0;
  const winRate = portfolioData?.performance?.winRate ?? 0;
  const totalChangePercent = portfolioData?.recentActivity?.netChange
    ? (portfolioData.recentActivity.netChange / (totalValue || 1)) * 100
    : 0;

  // Get currency formatting
  const { formatAmount } = useCurrency();

  // Create performance metrics with real data
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: "Total Value",
      value: formatAmount(totalValue, 2),
      change:
        totalChangePercent >= 0
          ? `+${totalChangePercent.toFixed(1)}%`
          : `${totalChangePercent.toFixed(1)}%`,
      isPositive: totalChangePercent >= 0,
      description: "Total portfolio value including cash and assets",
    },
    {
      label: "Cash Balance",
      value: formatAmount(cashBalance, 2),
      description: "Available cash balance",
    },
    {
      label: "Net Trading Profit",
      value: `${netProfit >= 0 ? "+" : "-"}${formatAmount(
        Math.abs(netProfit),
        2
      )}`,
      isPositive: netProfit >= 0,
      description: "Total trading profit after fees",
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: `${totalTrades} trades`,
      isPositive: winRate >= 50,
      description: "Percentage of profitable trades",
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
              $
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              className={`text-lg ${
                netProfit >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {netProfit >= 0 ? "+" : ""}$
              {Math.abs(netProfit).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              net profit
            </p>
            <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
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
