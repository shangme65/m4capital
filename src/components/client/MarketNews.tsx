"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketNews, useMarketData } from "./MarketDataProvider";
import { NewsItem } from "@/lib/marketData";
import { formatTimeAgo } from "@/lib/crypto-constants";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface MarketNewsProps {
  maxItems?: number;
  showSentiment?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const MarketNews: React.FC<MarketNewsProps> = ({
  maxItems = 10,
  showSentiment = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}) => {
  const { news, refreshNews } = useMarketNews();
  const { isConnected } = useMarketData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  useEffect(() => {
    if (autoRefresh && isConnected) {
      const interval = setInterval(async () => {
        await handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, isConnected, refreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNews();
    } catch (error) {
      console.error("Failed to refresh news:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case "neutral":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "border-l-green-400 bg-green-400/5";
      case "negative":
        return "border-l-red-400 bg-red-400/5";
      case "neutral":
        return "border-l-yellow-400 bg-yellow-400/5";
      default:
        return "border-l-gray-400 bg-gray-400/5";
    }
  };

  const displayedNews = news.slice(0, maxItems);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Market News
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || !isConnected}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh news"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-400 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {!isConnected && (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">
            Not connected to market data
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {displayedNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`border-l-4 p-3 rounded-r-lg ${getSentimentColor(
                item.sentiment
              )} cursor-pointer hover:bg-gray-700/30 transition-colors`}
              onClick={() =>
                setExpandedNews(expandedNews === item.id ? null : item.id)
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {showSentiment && getSentimentIcon(item.sentiment)}
                    <span className="text-xs text-gray-400 uppercase font-medium">
                      {item.source}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>

                  <h4 className="text-white font-medium text-sm leading-tight mb-1">
                    {item.title}
                  </h4>

                  <AnimatePresence>
                    {expandedNews === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-300 text-xs mt-2 leading-relaxed">
                          {item.summary}
                        </p>

                        {item.symbols && item.symbols.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.symbols.map((symbol) => (
                              <span
                                key={symbol}
                                className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                              >
                                {symbol}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {displayedNews.length === 0 && isConnected && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm mb-2">
            No recent news available
          </div>
          <button
            onClick={handleRefresh}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Try refreshing
          </button>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
};
export default MarketNews;
