"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Target,
  Calendar,
  Plus,
  Minus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowDown,
  Wallet,
  CreditCard,
  Building,
  Home,
  Car,
  ShoppingCart,
  Coffee,
  Plane,
  Heart,
  Gamepad2,
  BookOpen,
  Smartphone,
  Zap,
  ChevronRight,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface SavingsGoal {
  name: string;
  target: number;
  current: number;
  deadline: string;
  monthlyRequired: number;
}

interface CashFlowProjection {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  netFlow: number;
  balance: number;
}

interface BudgetData {
  categories: BudgetCategory[];
  savingsGoals: SavingsGoal[];
  cashFlowProjections: CashFlowProjection[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
}

export function BudgetingCashFlow() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProjections, setShowProjections] = useState(false);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await fetch("/api/finance/budget");
        if (!response.ok) throw new Error("Failed to fetch budget data");
        const data = await response.json();
        setBudgetData(data);
      } catch (error) {
        console.error("Error fetching budget data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="text-center text-gray-400 py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>Unable to load budget data</p>
      </div>
    );
  }

  const totalIncome = budgetData.summary.totalIncome;
  const totalExpenses = budgetData.summary.totalExpenses;
  const netSavings = budgetData.summary.netSavings;
  const savingsRate = budgetData.summary.savingsRate;
  const netCashFlow = totalIncome - totalExpenses;

  const getCategoryProgress = (category: BudgetCategory) => {
    return category.percentage;
  };

  const getCategoryStatus = (category: BudgetCategory) => {
    const progress = category.percentage;
    if (progress <= 75) return { status: "success", color: "text-green-400" };
    if (progress <= 90) return { status: "warning", color: "text-yellow-400" };
    return { status: "danger", color: "text-red-400" };
  };

  const getGoalProgress = (goal: SavingsGoal) => {
    return (goal.current / goal.target) * 100;
  };

  const getMonthsToGoal = (goal: SavingsGoal) => {
    const remaining = goal.target - goal.current;
    return Math.ceil(remaining / (goal.monthlyRequired || 1));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Budget & Cash Flow
            </h2>
            <p className="text-gray-400">
              Track your spending, manage budgets, and plan for the future
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex bg-gray-700 rounded-lg p-1">
              {["monthly", "weekly", "yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 text-sm rounded transition-colors capitalize ${
                    selectedPeriod === period
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowProjections(!showProjections)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Projections</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ArrowUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-medium">Income</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              ${totalIncome.toLocaleString()}
            </p>
            <p className="text-sm text-green-400 mt-1">+2.1% vs last month</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ArrowDown className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs text-red-400 font-medium">Expenses</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              ${totalExpenses.toLocaleString()}
            </p>
            <p className="text-sm text-red-400 mt-1">-1.5% vs last month</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <PiggyBank className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-medium">Savings</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              ${netSavings.toLocaleString()}
            </p>
            <p className="text-sm text-blue-400 mt-1">
              {savingsRate.toFixed(1)}% rate
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`bg-gradient-to-br border rounded-xl p-6 ${
            netCashFlow >= 0
              ? "from-purple-500/20 to-purple-600/20 border-purple-500/30"
              : "from-orange-500/20 to-orange-600/20 border-orange-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-2 rounded-lg ${
                netCashFlow >= 0 ? "bg-purple-500/20" : "bg-orange-500/20"
              }`}
            >
              <DollarSign
                className={`w-6 h-6 ${
                  netCashFlow >= 0 ? "text-purple-400" : "text-orange-400"
                }`}
              />
            </div>
            <span
              className={`text-xs font-medium ${
                netCashFlow >= 0 ? "text-purple-400" : "text-orange-400"
              }`}
            >
              Net Flow
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toLocaleString()}
            </p>
            <p
              className={`text-sm mt-1 ${
                netCashFlow >= 0 ? "text-purple-400" : "text-orange-400"
              }`}
            >
              {netCashFlow >= 0 ? "Surplus" : "Deficit"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Budget Categories */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Budget Categories</h3>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {budgetData.categories.map((category, index) => {
            const progress = getCategoryProgress(category);
            const status = getCategoryStatus(category);

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-600 rounded-lg"></div>
                    <div>
                      <h4 className="text-white font-medium">
                        {category.name}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-medium">
                      ${category.spent.toLocaleString()} / $
                      {category.budgeted.toLocaleString()}
                    </p>
                    <p className={`text-sm ${status.color}`}>
                      {category.remaining > 0
                        ? "$" + category.remaining.toLocaleString() + " left"
                        : "Over budget"}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Savings Goals</h3>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetData.savingsGoals.map((goal, index) => {
            const progress = getGoalProgress(goal);
            const monthsToGo = getMonthsToGoal(goal);

            return (
              <motion.div
                key={goal.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium mb-1">{goal.name}</h4>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{progress.toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      ${goal.current.toLocaleString()} / $
                      {goal.target.toLocaleString()}
                    </span>
                    <span className="text-white">
                      {monthsToGo} months to go
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-600 flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs">
                        Monthly Contribution
                      </p>
                      <p className="text-white font-medium">
                        ${goal.monthlyRequired.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cash Flow Projections */}
      <AnimatePresence>
        {showProjections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Cash Flow Projections
              </h3>
              <div className="flex items-center space-x-3">
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                  <Download className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-3 text-gray-300 font-medium">
                      Month
                    </th>
                    <th className="text-right p-3 text-gray-300 font-medium">
                      Income
                    </th>
                    <th className="text-right p-3 text-gray-300 font-medium">
                      Expenses
                    </th>
                    <th className="text-right p-3 text-gray-300 font-medium">
                      Savings
                    </th>
                    <th className="text-right p-3 text-gray-300 font-medium">
                      Net Flow
                    </th>
                    <th className="text-right p-3 text-gray-300 font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.cashFlowProjections.map((month, index) => (
                    <tr
                      key={month.month}
                      className="border-b border-gray-700 hover:bg-gray-700/30"
                    >
                      <td className="p-3 text-white font-medium">
                        {month.month}
                      </td>
                      <td className="p-3 text-right text-green-400">
                        ${month.income.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-red-400">
                        ${month.expenses.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-blue-400">
                        ${month.savings.toLocaleString()}
                      </td>
                      <td
                        className={`p-3 text-right font-medium ${
                          month.netFlow >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {month.netFlow >= 0 ? "+" : ""}$
                        {month.netFlow.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-white font-medium">
                        ${month.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
