"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  Clock,
} from "lucide-react";
import { useBitcoinPrice, useCryptoPrices } from "./CryptoMarketProvider";

interface CryptoPriceTickerProps {
  symbols?: string[];
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

// Individual crypto price card component
const CryptoPriceCard: React.FC<{
  symbol: string;
  showDetails?: boolean;
  compact?: boolean;
}> = ({ symbol, showDetails = true, compact = false }) => {
  const prices = useCryptoPrices([symbol]);
  const price = prices[symbol];
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<
    "up" | "down" | "neutral"
  >("neutral");

  useEffect(() => {
    if (price && previousPrice !== null) {
      if (price.price > previousPrice) {
        setPriceDirection("up");
      } else if (price.price < previousPrice) {
        setPriceDirection("down");
      }
    }
    if (price) {
      setPreviousPrice(price.price);
    }
  }, [price, previousPrice]);

  if (!price) {
    return (
      <div
        className={`${compact ? "p-2" : "p-4"} rounded-lg animate-pulse`}
        style={{ backgroundColor: "#252320" }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-600 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = price.changePercent24h >= 0;
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(price < 1 ? 6 : 4)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        compact ? "p-3" : "p-4"
      } rounded-lg border transition-all duration-300 hover:border-opacity-75`}
      style={{
        backgroundColor: "#252320",
        borderColor: isPositive ? "#10b981" : "#ef4444",
        borderWidth: "1px",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Crypto Icon */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor:
                symbol === "BTC"
                  ? "#f7931a"
                  : symbol === "ETH"
                  ? "#627eea"
                  : "#6b7280",
              color: "#ffffff",
            }}
          >
            {symbol}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white">{price.name}</h3>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: "#38312e", color: "#afadac" }}
              >
                {symbol}
              </span>
            </div>

            {/* Price */}
            <motion.div
              className="flex items-center space-x-2"
              animate={{
                color:
                  priceDirection === "up"
                    ? "#10b981"
                    : priceDirection === "down"
                    ? "#ef4444"
                    : "#ffffff",
              }}
              transition={{ duration: 0.3 }}
            >
              <span className={`${compact ? "text-lg" : "text-xl"} font-bold`}>
                {formatPrice(price.price)}
              </span>
              {priceDirection !== "neutral" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {priceDirection === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Change Indicator */}
        <div className="text-right">
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm font-medium ${
              isPositive
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{formatChange(price.changePercent24h)}</span>
          </div>

          {showDetails && (
            <div className="mt-1 text-xs" style={{ color: "#827e7d" }}>
              24h: {formatChange(price.changePercent24h)}
            </div>
          )}
        </div>
      </div>

      {/* Additional Details */}
      {showDetails && !compact && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#38312e" }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: "#827e7d" }}>Market Cap</span>
              <p className="font-medium text-white">
                {formatMarketCap(price.marketCap)}
              </p>
            </div>
            <div>
              <span style={{ color: "#827e7d" }}>24h Volume</span>
              <p className="font-medium text-white">
                {price.volume24h ? formatMarketCap(price.volume24h) : "N/A"}
              </p>
            </div>
          </div>

          <div
            className="mt-2 flex items-center justify-between text-xs"
            style={{ color: "#827e7d" }}
          >
            <span>
              Last updated: {new Date(price.timestamp).toLocaleTimeString()}
            </span>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Main ticker component
export const CryptoPriceTicker: React.FC<CryptoPriceTickerProps> = ({
  symbols = ["BTC", "ETH", "ADA", "DOT"],
  showDetails = true,
  compact = false,
  className = "",
}) => {
  const prices = useCryptoPrices(symbols);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The provider will automatically refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-orange-500" />
          <span>Live Crypto Prices</span>
        </h2>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg transition-all duration-200 hover:opacity-75"
          style={{ backgroundColor: "#38312e", color: "#afadac" }}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Price Cards */}
      <div
        className={`grid gap-4 ${
          compact
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {symbols.map((symbol) => (
          <CryptoPriceCard
            key={symbol}
            symbol={symbol}
            showDetails={showDetails}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

// Bitcoin-specific component
export const BitcoinPriceWidget: React.FC<{
  compact?: boolean;
  showChart?: boolean;
}> = ({ compact = false, showChart = false }) => {
  const btcPrice = useBitcoinPrice();
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    if (btcPrice) {
      setPriceHistory((prev) => [...prev.slice(-50), btcPrice.price]);
    }
  }, [btcPrice]);

  if (!btcPrice) {
    return (
      <div
        className="p-4 rounded-lg animate-pulse"
        style={{ backgroundColor: "#252320" }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-600 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = btcPrice.changePercent24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${
        compact ? "p-3" : "p-6"
      } rounded-lg border-2 transition-all duration-300`}
      style={{
        backgroundColor: "#1b1817",
        borderColor: isPositive ? "#10b981" : "#ef4444",
        boxShadow: `0 4px 20px ${
          isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"
        }`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: "#f7931a" }}
          >
            ₿
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">Bitcoin</h3>
            <p className="text-sm" style={{ color: "#827e7d" }}>
              BTC
            </p>
          </div>
        </div>

        <div className="text-right">
          <motion.p
            className="text-3xl font-bold text-white"
            animate={{
              color: isPositive ? "#10b981" : "#ef4444",
            }}
          >
            $
            {btcPrice.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.p>

          <div
            className={`flex items-center justify-end space-x-2 mt-1 ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isPositive ? "+" : ""}
              {btcPrice.changePercent24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm" style={{ color: "#827e7d" }}>
              Market Cap
            </p>
            <p className="text-lg font-semibold text-white">
              {btcPrice.marketCap
                ? `$${(btcPrice.marketCap / 1e12).toFixed(2)}T`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: "#827e7d" }}>
              24h Volume
            </p>
            <p className="text-lg font-semibold text-white">
              {btcPrice.volume24h
                ? `$${(btcPrice.volume24h / 1e9).toFixed(2)}B`
                : "N/A"}
            </p>
          </div>
        </div>
      )}

      <div
        className="mt-4 flex items-center justify-between text-xs"
        style={{ color: "#827e7d" }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Price</span>
        </div>
        <span>
          Updated: {new Date(btcPrice.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
};

export default CryptoPriceTicker;
