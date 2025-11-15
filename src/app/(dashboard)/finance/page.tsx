"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calculator,
  Shield,
  Target,
  BookOpen,
  FileText,
  BarChart3,
  Briefcase,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Wallet,
  CreditCard,
  Receipt,
  ChevronRight,
  Download,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Plus,
  Filter,
  Search,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { PortfolioAnalytics } from "@/components/finance/PortfolioAnalytics";
import { FinancialReports } from "@/components/finance/FinancialReports";
import { BudgetingCashFlow } from "@/components/finance/BudgetingCashFlow";
import RiskDashboard from "@/components/finance/RiskDashboard";
import InvestmentPlanning from "@/components/finance/InvestmentPlanning";
import TradingJournal from "@/components/finance/TradingJournal";
import TaxOptimization from "@/components/finance/TaxOptimization";
import BitcoinWallet from "@/components/finance/BitcoinWallet";

// Finance Tab Navigation
interface FinanceTab {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const financeTabs: FinanceTab[] = [
  {
    id: "overview",
    name: "Overview",
    icon: <PieChart size={20} />,
    description: "Portfolio summary and quick insights",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: <BarChart3 size={20} />,
    description: "Detailed portfolio analysis and performance",
  },
  {
    id: "reports",
    name: "Reports",
    icon: <FileText size={20} />,
    description: "Financial statements and tax documents",
  },
  {
    id: "budgeting",
    name: "Budgeting",
    icon: <Calculator size={20} />,
    description: "Budget planning and cash flow management",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: <Wallet size={20} />,
    description: "Bitcoin wallet and cryptocurrency management",
  },
  {
    id: "risk",
    name: "Risk",
    icon: <Shield size={20} />,
    description: "Risk assessment and management tools",
  },
  {
    id: "planning",
    name: "Planning",
    icon: <Target size={20} />,
    description: "Investment planning and forecasting",
  },
  {
    id: "trading",
    name: "Trading",
    icon: <Activity size={20} />,
    description: "Trading journal and performance analysis",
  },
  {
    id: "taxes",
    name: "Taxes",
    icon: <Receipt size={20} />,
    description: "Tax optimization and compliance",
  },
];

export default function FinancePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mock data - replace with real API calls
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    todayChange: 0,
    todayChangePercent: 0,
    availableCash: 0,
    totalInvested: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
  });

  useEffect(() => {
    // Fetch portfolio aggregates from API (total balance, deposits, income percent)
    const fetchPortfolio = async () => {
      try {
        const res = await fetch("/api/portfolio", { credentials: "include" });
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        const pf = data.portfolio || {};
        const balance = pf.balance ?? 0;
        const netAdded = pf.netAdded ?? 0;
        const incomePercent = pf.incomePercent ?? 0;

        setPortfolioData({
          totalValue: balance,
          todayChange: balance - netAdded, // monetary change relative to net added
          todayChangePercent: incomePercent,
          availableCash: balance,
          totalInvested: netAdded,
          totalReturn: balance - netAdded,
          totalReturnPercent: incomePercent,
        });
      } catch (e) {
        console.error("Failed to load portfolio for finance page", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const activeTabData = financeTabs.find((tab) => tab.id === activeTab);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400 text-lg">Loading Finance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Finance Center
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm">
                Comprehensive financial management and analytics
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 lg:gap-3">
              <div className="bg-gray-800/50 rounded-md px-3 py-2 min-w-0 flex-1 lg:flex-none lg:min-w-[120px]">
                <p className="text-xs text-gray-400">Portfolio</p>
                <p className="text-sm font-bold text-green-400 truncate">
                  ${portfolioData.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-md px-3 py-2 min-w-0 flex-1 lg:flex-none lg:min-w-[100px]">
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-400">Today</p>
                  {/* Info icon with tooltip */}
                  <div className="group relative">
                    <svg
                      className="w-3 h-3 text-gray-500 hover:text-gray-400 cursor-help"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-700">
                      <div className="text-center">
                        Income from deposits, withdrawals and trading (not
                        market price changes)
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <p
                  className={`text-sm font-bold truncate ${
                    portfolioData.todayChange >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {portfolioData.todayChange >= 0 ? "+" : ""}$
                  {Math.abs(portfolioData.todayChange).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-md px-3 py-2 min-w-0 flex-1 lg:flex-none lg:min-w-[100px]">
                <p className="text-xs text-gray-400">Cash</p>
                <p className="text-sm font-bold text-blue-400 truncate">
                  ${portfolioData.availableCash.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="lg:hidden bg-gray-800 border-b border-gray-600">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full px-4 py-3 flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-3">
            {activeTabData?.icon}
            <span className="font-medium">{activeTabData?.name}</span>
          </div>
          <ChevronRight
            className={`w-5 h-5 transition-transform ${
              showMobileMenu ? "rotate-90" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-600 overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {financeTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? "bg-orange-500 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {tab.icon}
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs opacity-75">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 bg-gray-800 border-r border-gray-600 min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4 text-white">Finance Tools</h2>
            <nav className="space-y-1.5">
              {financeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 group ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 mb-1">
                    <div
                      className={`transition-transform duration-300 ${
                        activeTab === tab.id
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span className="font-medium text-sm">{tab.name}</span>
                  </div>
                  <p
                    className={`text-xs transition-colors duration-300 ${
                      activeTab === tab.id
                        ? "text-orange-100"
                        : "text-gray-400 group-hover:text-gray-300"
                    }`}
                  >
                    {tab.description}
                  </p>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:p-6 p-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Content will be rendered based on active tab */}
              {renderTabContent(activeTab, setActiveTab, portfolioData)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Tab Content Renderer
function renderTabContent(
  activeTab: string,
  setActiveTab: (tab: string) => void,
  portfolioData: any
) {
  switch (activeTab) {
    case "overview":
      return (
        <OverviewTab
          setActiveTab={setActiveTab}
          portfolioData={portfolioData}
        />
      );
    case "analytics":
      return <AnalyticsTab />;
    case "reports":
      return <ReportsTab />;
    case "budgeting":
      return <BudgetingTab />;
    case "bitcoin":
      return <BitcoinTab />;
    case "risk":
      return <RiskTab />;
    case "planning":
      return <PlanningTab />;
    case "trading":
      return <TradingTab />;
    case "taxes":
      return <TaxesTab />;
    default:
      return (
        <OverviewTab
          setActiveTab={setActiveTab}
          portfolioData={portfolioData}
        />
      );
  }
}

// Overview Tab Component
function OverviewTab({
  setActiveTab,
  portfolioData,
}: {
  setActiveTab: (tab: string) => void;
  portfolioData: any;
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  // Function to handle Export Report
  const handleExportReport = () => {
    setShowExportModal(true);
  };

  // Function to handle Budget Planner (navigate to budgeting tab)
  const handleBudgetPlanner = () => {
    setActiveTab("budgeting");
  };

  // Function to handle Risk Analysis (navigate to risk tab)
  const handleRiskAnalysis = () => {
    setActiveTab("risk");
  };

  // Function to handle Set Goals
  const handleSetGoals = () => {
    setShowGoalsModal(true);
  };

  // Function to actually download/export the report
  const downloadReport = (format: string) => {
    // Use actual portfolio data for the report
    const reportData = {
      portfolioValue: portfolioData.totalValue,
      todayChange: portfolioData.todayChange,
      availableCash: portfolioData.availableCash,
      totalInvested: portfolioData.totalInvested,
      totalReturn: portfolioData.totalReturn,
      totalReturnPercent: portfolioData.totalReturnPercent,
      generatedAt: new Date().toISOString(),
    };

    if (format === "json") {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portfolio-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const csvContent =
        `Portfolio Report,${new Date().toISOString().split("T")[0]}\n` +
        `Portfolio Value,${reportData.portfolioValue}\n` +
        `Today's Change,${reportData.todayChange}\n` +
        `Available Cash,${reportData.availableCash}\n` +
        `Total Invested,${reportData.totalInvested}\n` +
        `Total Return,${reportData.totalReturn}\n` +
        `Return Percentage,${reportData.totalReturnPercent}%`;

      const dataBlob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portfolio-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    setShowExportModal(false);
  };

  // Function to save goals
  const saveGoals = (goals: {
    short: string;
    medium: string;
    long: string;
  }) => {
    // In a real app, this would save to a database
    console.log("Saving goals:", goals);
    alert("Goals saved successfully!");
    setShowGoalsModal(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Compact Portfolio Cards */}
        <div className="grid grid-cols-1 gap-3">
          {/* Portfolio Value */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-green-500/20 rounded">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-xs text-green-400 font-medium">
                {portfolioData.todayChangePercent >= 0 ? "+" : ""}
                {portfolioData.todayChangePercent.toFixed(2)}%
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total Portfolio</p>
              <p className="text-lg font-bold text-white">
                $
                {portfolioData.totalValue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-green-400">
                {portfolioData.todayChange >= 0 ? "+" : ""}$
                {Math.abs(portfolioData.todayChange).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                today
              </p>
            </div>
          </motion.div>

          {/* Available Cash */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-blue-500/20 rounded">
                <Wallet className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-blue-400 font-medium">
                Available
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Cash Balance</p>
              <p className="text-lg font-bold text-white">
                $
                {portfolioData.availableCash.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-blue-400">Ready to invest</p>
            </div>
          </motion.div>

          {/* Total Invested */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-purple-500/20 rounded">
                <Briefcase className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-purple-400 font-medium">
                Deployed
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total Invested</p>
              <p className="text-lg font-bold text-white">
                $
                {portfolioData.totalInvested.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-purple-400">Across your assets</p>
            </div>
          </motion.div>

          {/* P&L */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 bg-orange-500/20 rounded">
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs text-orange-400 font-medium">
                Profit
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total Return</p>
              <p className="text-lg font-bold text-white">
                $
                {portfolioData.totalReturn.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-orange-400">
                {portfolioData.totalReturnPercent >= 0 ? "+" : ""}
                {portfolioData.totalReturnPercent.toFixed(2)}% return
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions - More Compact */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-bold mb-3 text-white">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                icon: <Download />,
                label: "Export Report",
                color: "blue",
                onClick: handleExportReport,
              },
              {
                icon: <Calculator />,
                label: "Budget Planner",
                color: "green",
                onClick: handleBudgetPlanner,
              },
              {
                icon: <Shield />,
                label: "Risk Analysis",
                color: "red",
                onClick: handleRiskAnalysis,
              },
              {
                icon: <Target />,
                label: "Set Goals",
                color: "purple",
                onClick: handleSetGoals,
              },
            ].map((action, index) => (
              <motion.button
                key={index}
                onClick={action.onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg border border-${action.color}-500/30 bg-${action.color}-500/10 hover:bg-${action.color}-500/20 transition-colors`}
              >
                <div
                  className={`w-6 h-6 text-${action.color}-400 mx-auto mb-2`}
                >
                  {action.icon}
                </div>
                <p className="text-xs font-medium text-white">{action.label}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity Preview - More Compact */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <button className="text-orange-400 hover:text-orange-300 transition-colors text-xs font-medium">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {[
              {
                type: "buy",
                asset: "AAPL",
                amount: "$2,500",
                time: "2 hours ago",
                color: "green",
              },
              {
                type: "sell",
                asset: "TSLA",
                amount: "$1,200",
                time: "1 day ago",
                color: "red",
              },
              {
                type: "dividend",
                asset: "VOO",
                amount: "$85.50",
                time: "3 days ago",
                color: "blue",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 bg-gray-700/50 rounded-md"
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-${activity.color}-400`}
                  />
                  <div>
                    <p className="text-white font-medium text-sm">
                      {activity.asset}
                    </p>
                    <p className="text-gray-400 text-xs capitalize">
                      {activity.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">
                    {activity.amount}
                  </p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Export Portfolio Report
            </h3>
            <p className="text-gray-300 mb-6">
              Choose the format for your portfolio report:
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => downloadReport("json")}
                className="w-full p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                Download as JSON
              </button>
              <button
                onClick={() => downloadReport("csv")}
                className="w-full p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
              >
                Download as CSV
              </button>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Set Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Set Investment Goals
            </h3>
            <p className="text-gray-300 mb-6">
              Define your short, medium, and long-term financial goals:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const goals = {
                  short: formData.get("short") as string,
                  medium: formData.get("medium") as string,
                  long: formData.get("long") as string,
                };
                saveGoals(goals);
              }}
              className="space-y-4 mb-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short-term Goal (1 year)
                </label>
                <input
                  type="text"
                  name="short"
                  placeholder="e.g., Build emergency fund"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medium-term Goal (3-5 years)
                </label>
                <input
                  type="text"
                  name="medium"
                  placeholder="e.g., House down payment"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Long-term Goal (10+ years)
                </label>
                <input
                  type="text"
                  name="long"
                  placeholder="e.g., Retirement fund"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGoalsModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Placeholder components for other tabs (to be implemented)
function AnalyticsTab() {
  return <PortfolioAnalytics />;
}

function ReportsTab() {
  return <FinancialReports />;
}

function BudgetingTab() {
  return <BudgetingCashFlow />;
}

function RiskTab() {
  return <RiskDashboard />;
}

function BitcoinTab() {
  return <BitcoinWallet />;
}

function PlanningTab() {
  return <InvestmentPlanning />;
}

function TradingTab() {
  return <TradingJournal />;
}

function TaxesTab() {
  return <TaxOptimization />;
}
