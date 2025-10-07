"use client";

import { useTradingContext } from "./TradingProvider";
import { motion } from "framer-motion";

export default function LivePositions() {
  const { openPositions, tradeHistory, marketData } = useTradingContext();

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
        Live Positions ({openPositions.length})
      </h3>

      {openPositions.length === 0 && tradeHistory.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-500 text-sm">No positions yet</div>
          <div className="text-xs text-gray-600">
            Execute a trade to see live positions
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Open Positions */}
          {openPositions.map((position) => {
            const currentPrice =
              marketData[position.symbol]?.price || position.entryPrice;
            const isProfit =
              position.direction === "HIGHER"
                ? currentPrice > position.entryPrice
                : currentPrice < position.entryPrice;
            const pnlPercent =
              ((currentPrice - position.entryPrice) / position.entryPrice) *
              100;
            const adjustedPnl =
              position.direction === "LOWER" ? -pnlPercent : pnlPercent;

            return (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 rounded p-3 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {position.symbol}
                    </div>
                    <div className="text-xs text-gray-400">
                      {position.direction} • ${position.amount}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        isProfit ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {adjustedPnl > 0 ? "+" : ""}
                      {adjustedPnl.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.ceil(
                        (position.expiration * 1000 -
                          (Date.now() - position.timestamp)) /
                          1000
                      )}
                      s
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Entry: {position.entryPrice.toFixed(5)}</span>
                  <span>Current: {currentPrice.toFixed(5)}</span>
                </div>
              </motion.div>
            );
          })}

          {/* Recent History */}
          {tradeHistory.slice(0, 5).map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-gray-700 rounded p-3 border-l-4 ${
                trade.status === "WIN" ? "border-green-500" : "border-red-500"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-white text-sm">
                    {trade.symbol}
                  </div>
                  <div className="text-xs text-gray-400">
                    {trade.direction} • ${trade.amount}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${
                      trade.status === "WIN" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {trade.status === "WIN" ? "+" : ""}
                    {trade.profit > 0 ? "+" : ""}${trade.profit}
                  </div>
                  <div className="text-xs text-gray-400">{trade.status}</div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Entry: {trade.entryPrice.toFixed(5)}</span>
                <span>Exit: {trade.exitPrice?.toFixed(5)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
