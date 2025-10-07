"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ProfitLossProps {
  initialAmount: number;
  currentPrice: number;
  entryPrice: number;
  direction: "higher" | "lower";
}

export default function RealTimeProfitLoss({
  initialAmount,
  currentPrice,
  entryPrice,
  direction,
}: ProfitLossProps) {
  const [profit, setProfit] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [isProfit, setIsProfit] = useState(true);

  useEffect(() => {
    // Calculate profit/loss based on direction
    let priceDifference = 0;

    if (direction === "higher") {
      priceDifference = currentPrice - entryPrice;
    } else {
      priceDifference = entryPrice - currentPrice;
    }

    // Binary options profit calculation (simplified)
    const profitMultiplier = priceDifference > 0 ? 0.85 : -1; // 85% profit or 100% loss
    const calculatedProfit = initialAmount * profitMultiplier;
    const calculatedPercentage = profitMultiplier * 100;

    setProfit(calculatedProfit);
    setProfitPercentage(calculatedPercentage);
    setIsProfit(calculatedProfit > 0);
  }, [currentPrice, entryPrice, direction, initialAmount]);

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 text-center"
      animate={{
        boxShadow: isProfit
          ? "0 0 20px rgba(16, 185, 129, 0.3)"
          : "0 0 20px rgba(239, 68, 68, 0.3)",
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-2">
        <span className="text-gray-400 text-sm">Profit</span>
      </div>

      <motion.div
        className={`text-4xl font-bold mb-2 ${
          isProfit ? "text-green-400" : "text-red-400"
        }`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3, repeat: 0 }}
        key={profitPercentage} // Trigger animation on change
      >
        {isProfit ? "+" : ""}
        {profitPercentage.toFixed(0)}%
      </motion.div>

      <motion.div
        className={`text-xl font-semibold ${
          isProfit ? "text-green-400" : "text-red-400"
        }`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3, repeat: 0 }}
        key={profit} // Trigger animation on change
      >
        {isProfit ? "+" : ""}${Math.abs(profit).toLocaleString()}
      </motion.div>

      {/* Profit Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${
              isProfit ? "bg-green-400" : "bg-red-400"
            }`}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(Math.abs(profitPercentage), 100)}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>-100%</span>
          <span>0%</span>
          <span>+85%</span>
        </div>
      </div>

      {/* Current vs Entry Price */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Entry Price</div>
          <div className="font-mono text-white">{entryPrice.toFixed(5)}</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="text-gray-400">Current Price</div>
          <div
            className={`font-mono ${
              isProfit ? "text-green-400" : "text-red-400"
            }`}
          >
            {currentPrice.toFixed(5)}
          </div>
        </div>
      </div>

      {/* Direction Indicator */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <span className="text-gray-400 text-sm">Direction:</span>
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded ${
            direction === "higher"
              ? "bg-green-900 text-green-400"
              : "bg-red-900 text-red-400"
          }`}
        >
          <span>{direction === "higher" ? "📈" : "📉"}</span>
          <span className="text-xs font-semibold uppercase">{direction}</span>
        </div>
      </div>
    </motion.div>
  );
}
