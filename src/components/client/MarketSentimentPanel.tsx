"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface SentimentData {
  symbol: string;
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  reasoning?: string;
  timestamp: number;
}

export default function MarketSentimentPanel({
  symbols,
}: {
  symbols: string[];
}) {
  const [sentiments, setSentiments] = useState<Record<string, SentimentData>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0] || "BTC");

  // Fetch sentiment for a symbol
  const fetchSentiment = async (symbol: string) => {
    try {
      const response = await fetch(
        `/api/ai/trading-signal?symbol=${symbol}USDT`
      );
      const data = await response.json();

      if (data.success) {
        setSentiments((prev) => ({
          ...prev,
          [symbol]: {
            symbol,
            sentiment:
              data.action === "BUY"
                ? "bullish"
                : data.action === "SELL"
                ? "bearish"
                : "neutral",
            confidence: data.confidence,
            reasoning: data.reasoning,
            timestamp: Date.now(),
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch sentiment for ${symbol}:`, error);
    }
  };

  // Fetch all sentiments on mount
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      for (const symbol of symbols.slice(0, 5)) {
        await fetchSentiment(symbol);
      }
      setIsLoading(false);
    };

    fetchAll();

    // Refresh every 5 minutes
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbols]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="text-green-400" size={20} />;
      case "bearish":
        return <TrendingDown className="text-red-400" size={20} />;
      default:
        return <Minus className="text-[#9e9aa7]" size={20} />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-400";
      case "bearish":
        return "text-red-400";
      default:
        return "text-[#9e9aa7]";
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "bg-green-500/10 border-green-500/30";
      case "bearish":
        return "bg-red-500/10 border-red-500/30";
      default:
        return "bg-[#2a2522] border-[#38312e]";
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-orange-500" size={18} />
          <h3 className="text-sm font-semibold text-white">
            AI Market Sentiment
          </h3>
        </div>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {symbols.slice(0, 5).map((symbol) => {
          const sentiment = sentiments[symbol];

          return (
            <motion.button
              key={symbol}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSymbol(symbol)}
              className={`p-2 rounded-lg border transition-all ${
                selectedSymbol === symbol
                  ? "border-orange-500 bg-orange-500/10"
                  : sentiment
                  ? getSentimentBg(sentiment.sentiment)
                  : "bg-[#2a2522] border-[#38312e]"
              }`}
            >
              <div className="text-xs text-[#9e9aa7] mb-1">{symbol}</div>
              {sentiment ? (
                <>
                  <div className="flex items-center justify-center gap-1">
                    {getSentimentIcon(sentiment.sentiment)}
                    <span
                      className={`text-xs font-semibold ${getSentimentColor(
                        sentiment.sentiment
                      )}`}
                    >
                      {Math.round(sentiment.confidence * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-[#9e9aa7]">...</div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Detailed view for selected symbol */}
      {sentiments[selectedSymbol] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${getSentimentBg(
            sentiments[selectedSymbol].sentiment
          )}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getSentimentIcon(sentiments[selectedSymbol].sentiment)}
              <span className="font-semibold text-white">{selectedSymbol}</span>
            </div>
            <span
              className={`text-sm font-semibold ${getSentimentColor(
                sentiments[selectedSymbol].sentiment
              )}`}
            >
              {sentiments[selectedSymbol].sentiment.toUpperCase()}
            </span>
          </div>

          <div className="mb-3">
            <div className="text-xs text-[#9e9aa7] mb-1">Confidence</div>
            <div className="w-full bg-[#1b1817] rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${sentiments[selectedSymbol].confidence * 100}%`,
                }}
                className={`h-full ${
                  sentiments[selectedSymbol].sentiment === "bullish"
                    ? "bg-green-500"
                    : sentiments[selectedSymbol].sentiment === "bearish"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              />
            </div>
            <div className="text-xs text-[#9e9aa7] mt-1">
              {Math.round(sentiments[selectedSymbol].confidence * 100)}%
            </div>
          </div>

          {sentiments[selectedSymbol].reasoning && (
            <div>
              <div className="text-xs text-[#9e9aa7] mb-1">Analysis</div>
              <div className="text-xs text-white leading-relaxed">
                {sentiments[selectedSymbol].reasoning}
              </div>
            </div>
          )}

          <div className="text-xs text-[#9e9aa7] mt-3">
            Updated:{" "}
            {new Date(
              sentiments[selectedSymbol].timestamp
            ).toLocaleTimeString()}
          </div>
        </motion.div>
      )}

      <div className="text-xs text-[#9e9aa7] italic">
        * AI-powered sentiment analysis. Not financial advice.
      </div>
    </div>
  );
}
