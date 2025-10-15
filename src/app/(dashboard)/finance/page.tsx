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
    totalValue: 124891.42,
    todayChange: 2847.63,
    todayChangePercent: 2.33,
    availableCash: 15420.5,
    totalInvested: 110000.0,
    totalReturn: 14891.42,
    totalReturnPercent: 13.54,
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                Finance Center
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                Comprehensive financial management and analytics
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 lg:mt-0 grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
                <p className="text-lg font-bold text-green-400">
                  ${portfolioData.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Today's Change</p>
                <p
                  className={`text-lg font-bold ${
                    portfolioData.todayChange >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {portfolioData.todayChange >= 0 ? "+" : ""}$
                  {Math.abs(portfolioData.todayChange).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center col-span-2 lg:col-span-1">
                <p className="text-xs text-gray-400 mb-1">Available Cash</p>
                <p className="text-lg font-bold text-blue-400">
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
        <div className="hidden lg:block w-80 bg-gray-800 border-r border-gray-600 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-white">Finance Tools</h2>
            <nav className="space-y-2">
              {financeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 group ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className={`transition-transform duration-300 ${
                        activeTab === tab.id
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span className="font-medium">{tab.name}</span>
                  </div>
                  <p
                    className={`text-sm transition-colors duration-300 ${
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
        <div className="flex-1 lg:p-8 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Content will be rendered based on active tab */}
              {renderTabContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Tab Content Renderer
function renderTabContent(activeTab: string) {
  switch (activeTab) {
    case "overview":
      return <OverviewTab />;
    case "analytics":
      return <AnalyticsTab />;
    case "reports":
      return <ReportsTab />;
    case "budgeting":
      return <BudgetingTab />;
    case "risk":
      return <RiskTab />;
    case "planning":
      return <PlanningTab />;
    case "trading":
      return <TradingTab />;
    case "taxes":
      return <TaxesTab />;
    default:
      return <OverviewTab />;
  }
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portfolio Value */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-medium">+13.54%</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Portfolio</p>
            <p className="text-2xl font-bold text-white">$124,891.42</p>
            <p className="text-sm text-green-400 mt-1">+$2,847.63 today</p>
          </div>
        </motion.div>

        {/* Available Cash */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-medium">Available</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Cash Balance</p>
            <p className="text-2xl font-bold text-white">$15,420.50</p>
            <p className="text-sm text-blue-400 mt-1">Ready to invest</p>
          </div>
        </motion.div>

        {/* Total Invested */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-purple-400 font-medium">
              Deployed
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-white">$110,000.00</p>
            <p className="text-sm text-purple-400 mt-1">Across 12 assets</p>
          </div>
        </motion.div>

        {/* P&L */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400 font-medium">Profit</span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Return</p>
            <p className="text-2xl font-bold text-white">$14,891.42</p>
            <p className="text-sm text-orange-400 mt-1">+13.54% return</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Download />, label: "Export Report", color: "blue" },
            { icon: <Calculator />, label: "Budget Planner", color: "green" },
            { icon: <Shield />, label: "Risk Analysis", color: "red" },
            { icon: <Target />, label: "Set Goals", color: "purple" },
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-lg border border-${action.color}-500/30 bg-${action.color}-500/10 hover:bg-${action.color}-500/20 transition-colors`}
            >
              <div className={`w-8 h-8 text-${action.color}-400 mx-auto mb-2`}>
                {action.icon}
              </div>
              <p className="text-sm font-medium text-white">{action.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          <button className="text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
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
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full bg-${activity.color}-400`}
                />
                <div>
                  <p className="text-white font-medium">{activity.asset}</p>
                  <p className="text-gray-400 text-sm capitalize">
                    {activity.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{activity.amount}</p>
                <p className="text-gray-400 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
  return (
    <div className="text-center py-20">
      <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Risk Management</h3>
      <p className="text-gray-400">
        Advanced risk assessment tools coming soon...
      </p>
    </div>
  );
}

function PlanningTab() {
  return (
    <div className="text-center py-20">
      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Investment Planning</h3>
      <p className="text-gray-400">
        Goal-based planning and forecasting coming soon...
      </p>
    </div>
  );
}

function TradingTab() {
  return (
    <div className="text-center py-20">
      <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Trading Analytics</h3>
      <p className="text-gray-400">
        Trading journal and performance analysis coming soon...
      </p>
    </div>
  );
}

function TaxesTab() {
  return (
    <div className="text-center py-20">
      <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Tax Optimization</h3>
      <p className="text-gray-400">
        Tax planning and compliance tools coming soon...
      </p>
    </div>
  );
}
