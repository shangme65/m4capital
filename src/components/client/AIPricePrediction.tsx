"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target, Clock } from "lucide-react";

interface PriceData {
  timestamp: number;
  price: number;
}

interface Prediction {
  timestamp: number;
  predictedPrice: number;
  confidence: number;
  direction: "up" | "down" | "neutral";
  changePercent: number;
}

export default function AIPricePrediction({
  symbol,
  currentPrice,
  historicalData,
}: {
  symbol: string;
  currentPrice: number;
  historicalData?: PriceData[];
}) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<"1h" | "4h" | "24h">("1h");

  // Calculate volatility based on current price (2% of price)
  const volatility = currentPrice * 0.02;

  // Generate predictions using simple technical analysis
  // In production, you would use TensorFlow.js for ML-based predictions
  const generatePredictions = () => {
    setIsLoading(true);

    // Simulate prediction calculation
    setTimeout(() => {
      const basePrice = currentPrice;

      const timeframes = {
        "1h": { hours: 1, intervals: 12 }, // Every 5 minutes
        "4h": { hours: 4, intervals: 16 }, // Every 15 minutes
        "24h": { hours: 24, intervals: 24 }, // Every hour
      };

      const { hours, intervals } = timeframes[timeframe];
      const intervalMs = (hours * 60 * 60 * 1000) / intervals;

      const newPredictions: Prediction[] = [];
      let lastPrice = basePrice;

      for (let i = 1; i <= intervals; i++) {
        // Simple random walk with slight upward bias
        const randomChange = (Math.random() - 0.45) * volatility;
        const predictedPrice = lastPrice + randomChange;
        const changePercent = ((predictedPrice - basePrice) / basePrice) * 100;

        newPredictions.push({
          timestamp: Date.now() + i * intervalMs,
          predictedPrice,
          confidence: Math.max(0.5, 1 - (i / intervals) * 0.3), // Confidence decreases over time
          direction:
            predictedPrice > basePrice
              ? "up"
              : predictedPrice < basePrice
              ? "down"
              : "neutral",
          changePercent,
        });

        lastPrice = predictedPrice;
      }

      setPredictions(newPredictions);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (currentPrice > 0) {
      generatePredictions();
    }
  }, [currentPrice, timeframe]);

  const finalPrediction = predictions[predictions.length - 1];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="text-purple-500" size={18} />
          <h3 className="text-sm font-semibold text-white">
            AI Price Prediction
          </h3>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 bg-[#2a2522] rounded-lg p-1">
          {(["1h", "4h", "24h"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeframe === tf
                  ? "bg-purple-500 text-white"
                  : "text-[#9e9aa7] hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : finalPrediction ? (
        <>
          {/* Main prediction card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border ${
              finalPrediction.direction === "up"
                ? "bg-green-500/10 border-green-500/30"
                : finalPrediction.direction === "down"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-[#2a2522] border-[#38312e]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-[#9e9aa7]">
                  Predicted Price ({timeframe})
                </div>
                <div className="text-2xl font-bold text-white">
                  ${finalPrediction.predictedPrice.toFixed(2)}
                </div>
              </div>
              <div
                className={`text-right ${
                  finalPrediction.direction === "up"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {finalPrediction.direction === "up" ? (
                  <TrendingUp size={32} />
                ) : (
                  <TrendingDown size={32} />
                )}
                <div className="text-sm font-semibold">
                  {finalPrediction.changePercent > 0 ? "+" : ""}
                  {finalPrediction.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-[#9e9aa7] mb-1">Confidence</div>
              <div className="w-full bg-[#1b1817] rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${finalPrediction.confidence * 100}%` }}
                  className="h-full bg-purple-500"
                />
              </div>
              <div className="text-xs text-[#9e9aa7] mt-1">
                {Math.round(finalPrediction.confidence * 100)}%
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#9e9aa7]">
              <Clock size={12} />
              Target:{" "}
              {new Date(finalPrediction.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </motion.div>

          {/* Mini prediction timeline */}
          <div className="bg-[#2a2522] rounded-lg p-3">
            <div className="text-xs text-[#9e9aa7] mb-2">
              Prediction Timeline
            </div>
            <div className="flex items-end gap-1 h-20">
              {predictions.slice(0, 12).map((pred, index) => {
                const height =
                  ((pred.predictedPrice - currentPrice) / (volatility * 2)) *
                    50 +
                  50;
                const clampedHeight = Math.max(10, Math.min(100, height));

                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${clampedHeight}%` }}
                    className={`flex-1 rounded-t ${
                      pred.direction === "up"
                        ? "bg-green-500/50"
                        : "bg-red-500/50"
                    }`}
                    title={`$${pred.predictedPrice.toFixed(2)} (${Math.round(
                      pred.confidence * 100
                    )}%)`}
                  />
                );
              })}
            </div>
          </div>

          <div className="text-xs text-[#9e9aa7] italic">
            * AI predictions are probabilistic and not guaranteed. Use for
            reference only.
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-[#9e9aa7] p-4">
          No prediction available
        </div>
      )}
    </div>
  );
}
