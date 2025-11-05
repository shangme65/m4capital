"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  Shield,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function TradingCalculators() {
  const [activeTab, setActiveTab] = useState<
    "profit" | "position" | "risk" | "leverage"
  >("profit");

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold">Trading Calculators</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: "profit", label: "P/L Calculator", icon: DollarSign },
          { id: "position", label: "Position Size", icon: TrendingUp },
          { id: "risk", label: "Risk/Reward", icon: Shield },
          { id: "leverage", label: "Leverage Impact", icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Calculator Content */}
      {activeTab === "profit" && <ProfitLossCalculator />}
      {activeTab === "position" && <PositionSizeCalculator />}
      {activeTab === "risk" && <RiskRewardCalculator />}
      {activeTab === "leverage" && <LeverageCalculator />}
    </div>
  );
}

function ProfitLossCalculator() {
  const [entryPrice, setEntryPrice] = useState("50000");
  const [exitPrice, setExitPrice] = useState("52000");
  const [quantity, setQuantity] = useState("1");
  const [side, setSide] = useState<"long" | "short">("long");

  const calculatePL = () => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const qty = parseFloat(quantity) || 0;

    if (side === "long") {
      return (exit - entry) * qty;
    } else {
      return (entry - exit) * qty;
    }
  };

  const pl = calculatePL();
  const plPercent =
    (pl / (parseFloat(entryPrice) * parseFloat(quantity))) * 100;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide("long")}
          className={`flex-1 py-2 rounded-lg transition ${
            side === "long"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          Long (Buy)
        </button>
        <button
          onClick={() => setSide("short")}
          className={`flex-1 py-2 rounded-lg transition ${
            side === "short"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          Short (Sell)
        </button>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
        <input
          type="number"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="50000"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Exit Price</label>
        <input
          type="number"
          value={exitPrice}
          onChange={(e) => setExitPrice(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="52000"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1"
          step="0.01"
        />
      </div>

      <div
        className={`p-4 rounded-lg ${
          pl >= 0
            ? "bg-green-900/30 border border-green-500"
            : "bg-red-900/30 border border-red-500"
        }`}
      >
        <p className="text-sm text-gray-400 mb-1">Profit/Loss</p>
        <p
          className={`text-3xl font-bold ${
            pl >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {pl >= 0 ? "+" : ""}${pl.toFixed(2)}
        </p>
        <p className={`text-sm ${pl >= 0 ? "text-green-400" : "text-red-400"}`}>
          {plPercent >= 0 ? "+" : ""}
          {plPercent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [entryPrice, setEntryPrice] = useState("50000");
  const [stopLoss, setStopLoss] = useState("48000");

  const calculatePosition = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;

    const riskAmount = balance * (risk / 100);
    const priceRisk = Math.abs(entry - stop);

    if (priceRisk === 0) return 0;

    return riskAmount / priceRisk;
  };

  const positionSize = calculatePosition();
  const riskAmount =
    parseFloat(accountBalance) * (parseFloat(riskPercent) / 100);

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex gap-2">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          Never risk more than 1-2% of your account on a single trade
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Account Balance
        </label>
        <input
          type="number"
          value={accountBalance}
          onChange={(e) => setAccountBalance(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="10000"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Risk Per Trade (%)
        </label>
        <input
          type="number"
          value={riskPercent}
          onChange={(e) => setRiskPercent(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="2"
          min="0.1"
          max="100"
          step="0.1"
        />
        <div className="mt-2">
          <input
            type="range"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full"
            min="0.1"
            max="10"
            step="0.1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
        <input
          type="number"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Stop Loss Price
        </label>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-400">Risk Amount:</span>
          <span className="text-white font-semibold">
            ${riskAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Position Size:</span>
          <span className="text-blue-400 font-semibold text-lg">
            {positionSize.toFixed(4)} units
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Position Value:</span>
          <span className="text-white font-semibold">
            ${(positionSize * parseFloat(entryPrice)).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RiskRewardCalculator() {
  const [entryPrice, setEntryPrice] = useState("50000");
  const [stopLoss, setStopLoss] = useState("48000");
  const [takeProfit, setTakeProfit] = useState("55000");

  const calculateRR = () => {
    const entry = parseFloat(entryPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;

    const risk = Math.abs(entry - stop);
    const reward = Math.abs(tp - entry);

    if (risk === 0) return 0;
    return reward / risk;
  };

  const rrRatio = calculateRR();
  const risk = Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss));
  const reward = Math.abs(parseFloat(takeProfit) - parseFloat(entryPrice));

  return (
    <div className="space-y-4">
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 flex gap-2">
        <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          Aim for a minimum risk/reward ratio of 1:2 (risk $1 to make $2)
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
        <input
          type="number"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Stop Loss</label>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Take Profit</label>
        <input
          type="number"
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="flex justify-between">
          <span className="text-red-400">Risk:</span>
          <span className="text-white">${risk.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-400">Reward:</span>
          <span className="text-white">${reward.toFixed(2)}</span>
        </div>
        <div
          className={`p-4 rounded-lg ${
            rrRatio >= 2
              ? "bg-green-900/30 border border-green-500"
              : rrRatio >= 1
              ? "bg-yellow-900/30 border border-yellow-500"
              : "bg-red-900/30 border border-red-500"
          }`}
        >
          <p className="text-sm text-gray-400 mb-1">Risk/Reward Ratio</p>
          <p
            className={`text-3xl font-bold ${
              rrRatio >= 2
                ? "text-green-500"
                : rrRatio >= 1
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            1:{rrRatio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {rrRatio >= 2
              ? "✓ Excellent risk/reward ratio"
              : rrRatio >= 1
              ? "⚠ Acceptable but could be better"
              : "✗ Poor risk/reward ratio"}
          </p>
        </div>
      </div>
    </div>
  );
}

function LeverageCalculator() {
  const [capital, setCapital] = useState("1000");
  const [leverage, setLeverage] = useState("10");
  const [priceMove, setPriceMove] = useState("5");

  const calculateImpact = () => {
    const cap = parseFloat(capital) || 0;
    const lev = parseFloat(leverage) || 1;
    const move = parseFloat(priceMove) || 0;

    const positionSize = cap * lev;
    const plPercent = move * lev;
    const plAmount = cap * (plPercent / 100);

    return { positionSize, plPercent, plAmount };
  };

  const { positionSize, plPercent, plAmount } = calculateImpact();

  return (
    <div className="space-y-4">
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          High leverage amplifies both profits AND losses. Use with caution!
        </p>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Your Capital</label>
        <input
          type="number"
          value={capital}
          onChange={(e) => setCapital(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Leverage ({leverage}x)
        </label>
        <input
          type="range"
          value={leverage}
          onChange={(e) => setLeverage(e.target.value)}
          className="w-full"
          min="1"
          max="100"
          step="1"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1x (No leverage)</span>
          <span>100x (Extreme)</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Price Movement (%)
        </label>
        <input
          type="number"
          value={priceMove}
          onChange={(e) => setPriceMove(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.1"
        />
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-800">
        <div className="flex justify-between">
          <span className="text-gray-400">Position Size:</span>
          <span className="text-white font-semibold">
            ${positionSize.toFixed(2)}
          </span>
        </div>
        <div
          className={`p-4 rounded-lg ${
            plAmount >= 0
              ? "bg-green-900/30 border border-green-500"
              : "bg-red-900/30 border border-red-500"
          }`}
        >
          <p className="text-sm text-gray-400 mb-1">Profit/Loss Impact</p>
          <p
            className={`text-2xl font-bold ${
              plAmount >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {plAmount >= 0 ? "+" : ""}${plAmount.toFixed(2)}
          </p>
          <p
            className={`text-sm ${
              plAmount >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {plPercent >= 0 ? "+" : ""}
            {plPercent.toFixed(2)}% of your capital
          </p>
        </div>

        {parseFloat(leverage) >= 20 && (
          <div className="bg-red-900/30 p-3 rounded-lg text-sm text-red-300">
            ⚠ Warning: {leverage}x leverage means a{" "}
            {(100 / parseFloat(leverage)).toFixed(2)}% price move against you =
            complete liquidation!
          </div>
        )}
      </div>
    </div>
  );
}
