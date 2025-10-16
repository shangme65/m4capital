"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  Percent,
  Filter,
  Search,
  Edit,
  Trash2,
} from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  date: string;
  strategy: string;
  notes: string;
  pnl?: number;
  pnlPercent?: number;
  status: "OPEN" | "CLOSED";
}

export default function TradingJournal() {
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState("ALL");
  const [selectedTimeframe, setSelectedTimeframe] = useState("ALL");

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "1",
      symbol: "AAPL",
      side: "BUY",
      quantity: 10,
      price: 150.0,
      date: "2025-10-15",
      strategy: "Momentum",
      notes: "Breaking above resistance at $149",
      status: "OPEN",
    },
    {
      id: "2",
      symbol: "TSLA",
      side: "SELL",
      quantity: 5,
      price: 320.0,
      date: "2025-10-14",
      strategy: "Mean Reversion",
      notes: "Overextended after earnings",
      pnl: 850.0,
      pnlPercent: 15.2,
      status: "CLOSED",
    },
    {
      id: "3",
      symbol: "BTC",
      side: "BUY",
      quantity: 0.1,
      price: 65000.0,
      date: "2025-10-13",
      strategy: "DCA",
      notes: "Monthly DCA purchase",
      status: "OPEN",
    },
    {
      id: "4",
      symbol: "SPY",
      side: "SELL",
      quantity: 20,
      price: 430.0,
      date: "2025-10-12",
      strategy: "Hedging",
      notes: "Portfolio hedge against volatility",
      pnl: -230.0,
      pnlPercent: -2.1,
      status: "CLOSED",
    },
  ]);

  const strategies = [
    "ALL",
    "Momentum",
    "Mean Reversion",
    "DCA",
    "Hedging",
    "Breakout",
  ];
  const timeframes = ["ALL", "Today", "This Week", "This Month", "This Year"];

  // Calculate performance metrics
  const closedTrades = trades.filter((t) => t.status === "CLOSED");
  const totalPnL = closedTrades.reduce(
    (sum, trade) => sum + (trade.pnl || 0),
    0
  );
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const winRate =
    closedTrades.length > 0
      ? (winningTrades.length / closedTrades.length) * 100
      : 0;
  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
        winningTrades.length
      : 0;
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);
  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(
          losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
            losingTrades.length
        )
      : 0;

  const handleAddTrade = (tradeData: Omit<Trade, "id">) => {
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString(),
    };
    setTrades((prev) => [newTrade, ...prev]);
    setShowAddTrade(false);
  };

  const filteredTrades = trades.filter((trade) => {
    if (selectedStrategy !== "ALL" && trade.strategy !== selectedStrategy)
      return false;
    // Add timeframe filtering logic here
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">Total P&L</span>
          </div>
          <p className="text-lg font-bold text-white">${totalPnL.toFixed(2)}</p>
          <p className="text-xs text-green-400">Realized</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-400">Win Rate</span>
          </div>
          <p className="text-lg font-bold text-white">{winRate.toFixed(1)}%</p>
          <p className="text-xs text-blue-400">
            {winningTrades.length}/{closedTrades.length}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400">Avg Win</span>
          </div>
          <p className="text-lg font-bold text-white">${avgWin.toFixed(2)}</p>
          <p className="text-xs text-purple-400">Per trade</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-400">Avg Loss</span>
          </div>
          <p className="text-lg font-bold text-white">${avgLoss.toFixed(2)}</p>
          <p className="text-xs text-red-400">Per trade</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-yellow-400">Risk/Reward</span>
          </div>
          <p className="text-lg font-bold text-white">
            {avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "N/A"}
          </p>
          <p className="text-xs text-yellow-400">Ratio</p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
            >
              {strategies.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
            >
              {timeframes.map((timeframe) => (
                <option key={timeframe} value={timeframe}>
                  {timeframe}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowAddTrade(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Trades List */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Trade History</h4>
        <div className="space-y-2">
          {filteredTrades.map((trade) => (
            <motion.div
              key={trade.id}
              whileHover={{ scale: 1.01 }}
              className="p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        trade.side === "BUY" ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <div className="text-white font-medium">{trade.symbol}</div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        trade.side === "BUY"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {trade.side}
                    </div>
                  </div>

                  <div className="text-sm text-gray-300">
                    {trade.quantity} @ ${trade.price.toFixed(2)}
                  </div>

                  <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    {trade.strategy}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {trade.pnl !== undefined && (
                    <div className="text-right">
                      <div
                        className={`font-medium ${
                          trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        ${trade.pnl.toFixed(2)}
                      </div>
                      <div
                        className={`text-xs ${
                          trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {trade.pnlPercent?.toFixed(1)}%
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-sm text-gray-300">{trade.date}</div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        trade.status === "OPEN"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {trade.status}
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {trade.notes && (
                <div className="mt-2 text-sm text-gray-400 italic">
                  "{trade.notes}"
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strategy Performance */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Strategy Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {strategies.slice(1).map((strategy) => {
            const strategyTrades = closedTrades.filter(
              (t) => t.strategy === strategy
            );
            const strategyPnL = strategyTrades.reduce(
              (sum, t) => sum + (t.pnl || 0),
              0
            );
            const strategyWinRate =
              strategyTrades.length > 0
                ? (strategyTrades.filter((t) => (t.pnl || 0) > 0).length /
                    strategyTrades.length) *
                  100
                : 0;

            return (
              <div key={strategy} className="p-3 bg-gray-900 rounded">
                <div className="text-white font-medium mb-1">{strategy}</div>
                <div
                  className={`text-sm font-medium ${
                    strategyPnL >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ${strategyPnL.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">
                  {strategyWinRate.toFixed(1)}% win rate (
                  {strategyTrades.length} trades)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add New Trade</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const tradeData = {
                  symbol: formData.get("symbol") as string,
                  side: formData.get("side") as "BUY" | "SELL",
                  quantity: Number(formData.get("quantity")),
                  price: Number(formData.get("price")),
                  date: formData.get("date") as string,
                  strategy: formData.get("strategy") as string,
                  notes: formData.get("notes") as string,
                  status: "OPEN" as const,
                };
                handleAddTrade(tradeData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    name="symbol"
                    placeholder="AAPL"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Side
                  </label>
                  <select
                    name="side"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.01"
                    placeholder="10"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    placeholder="150.00"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Strategy
                  </label>
                  <select
                    name="strategy"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                    required
                  >
                    {strategies.slice(1).map((strategy) => (
                      <option key={strategy} value={strategy}>
                        {strategy}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="Trade rationale, setup, etc..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTrade(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Trade
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
