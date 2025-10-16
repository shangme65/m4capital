"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  PieChart,
  Zap,
  Shield,
  TrendingDown,
  BarChart3,
  Calculator,
  Target,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function RiskDashboard() {
  const [selectedAsset, setSelectedAsset] = useState("AAPL");
  const [riskTolerance, setRiskTolerance] = useState("MODERATE");

  const riskMetrics = {
    portfolioVaR: 15420.5,
    maxDrawdown: -12.4,
    volatility: 8.6,
    beta: 0.92,
    sharpeRatio: 1.34,
    sortinoRatio: 1.89,
  };

  const assets = [
    { symbol: "AAPL", allocation: 25, risk: "LOW", correlation: 0.65 },
    { symbol: "TSLA", allocation: 15, risk: "HIGH", correlation: 0.45 },
    { symbol: "BTC", allocation: 10, risk: "VERY_HIGH", correlation: 0.12 },
    { symbol: "SPY", allocation: 30, risk: "MODERATE", correlation: 0.89 },
    { symbol: "BONDS", allocation: 20, risk: "LOW", correlation: -0.25 },
  ];

  const stressScenarios = [
    { name: "2008 Financial Crisis", impact: -34.5, probability: "5%" },
    { name: "COVID-19 Market Crash", impact: -28.2, probability: "3%" },
    { name: "Tech Bubble Burst", impact: -41.8, probability: "2%" },
    { name: "Interest Rate Shock", impact: -18.6, probability: "15%" },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-400";
      case "MODERATE":
        return "text-yellow-400";
      case "HIGH":
        return "text-orange-400";
      case "VERY_HIGH":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-400">Daily VaR</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${riskMetrics.portfolioVaR.toLocaleString()}
          </p>
          <p className="text-xs text-red-400">95% confidence</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-yellow-400">Max DD</span>
          </div>
          <p className="text-lg font-bold text-white">
            {riskMetrics.maxDrawdown}%
          </p>
          <p className="text-xs text-yellow-400">Historical</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-400">Volatility</span>
          </div>
          <p className="text-lg font-bold text-white">
            {riskMetrics.volatility}%
          </p>
          <p className="text-xs text-blue-400">Annualized</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400">Beta</span>
          </div>
          <p className="text-lg font-bold text-white">{riskMetrics.beta}</p>
          <p className="text-xs text-purple-400">vs S&P 500</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">Sharpe</span>
          </div>
          <p className="text-lg font-bold text-white">
            {riskMetrics.sharpeRatio}
          </p>
          <p className="text-xs text-green-400">Risk-adj return</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <span className="text-xs text-indigo-400">Sortino</span>
          </div>
          <p className="text-lg font-bold text-white">
            {riskMetrics.sortinoRatio}
          </p>
          <p className="text-xs text-indigo-400">Downside focus</p>
        </motion.div>
      </div>

      {/* Asset Allocation & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-medium mb-3">Asset Risk Breakdown</h4>
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-2 bg-gray-900 rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-white font-medium">{asset.symbol}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${getRiskColor(
                      asset.risk
                    )} bg-gray-700`}
                  >
                    {asset.risk.replace("_", " ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {asset.allocation}%
                  </div>
                  <div className="text-xs text-gray-400">
                    ρ: {asset.correlation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-medium mb-3">Stress Test Scenarios</h4>
          <div className="space-y-2">
            {stressScenarios.map((scenario) => (
              <div key={scenario.name} className="p-3 bg-gray-900 rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-white font-medium">
                    {scenario.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {scenario.probability}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowDown className="w-4 h-4 text-red-400" />
                  <div className="text-red-400 font-medium">
                    {scenario.impact}%
                  </div>
                  <div className="text-xs text-gray-400">portfolio impact</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Position Sizing Calculator */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">
          Position Sizing Calculator
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              {assets.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Risk Tolerance
            </label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="CONSERVATIVE">Conservative (1-2%)</option>
              <option value="MODERATE">Moderate (2-3%)</option>
              <option value="AGGRESSIVE">Aggressive (3-5%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Recommended Size
            </label>
            <div className="p-2 bg-gray-700 rounded text-white">
              2.5% ($3,122)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
