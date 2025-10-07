"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrices, useMarketData } from "./MarketDataProvider";
import { MarketTick } from "@/lib/marketData";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PriceTickerProps {
  symbols?: string[];
  showChange?: boolean;
  showVolume?: boolean;
  scrollSpeed?: number;
  autoScroll?: boolean;
}

const PriceTicker: React.FC<PriceTickerProps> = ({
  symbols = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "BTCUSD",
    "ETHUSD",
    "AAPL",
    "GOOGL",
    "TSLA",
  ],
  showChange = true,
  showVolume = false,
  scrollSpeed = 30,
  autoScroll = true,
}) => {
  const prices = usePrices(symbols);
  const { isConnected, connectionQuality } = useMarketData();
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number, symbol: string) => {
    const isForex = [
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "USDCHF",
      "AUDUSD",
      "USDCAD",
      "NZDUSD",
    ].includes(symbol);
    const isCrypto = [
      "BTCUSD",
      "ETHUSD",
      "ADAUSD",
      "DOTUSD",
      "LINKUSD",
      "SOLUSD",
    ].includes(symbol);

    if (isForex) {
      return price.toFixed(5);
    } else if (isCrypto && price > 1000) {
      return price.toFixed(0);
    } else if (isCrypto) {
      return price.toFixed(2);
    } else {
      return price.toFixed(2);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getPriceChangeColor = (change?: number) => {
    if (!change) return "text-gray-400";
    return change >= 0 ? "text-green-400" : "text-red-400";
  };

  const getPriceChangeIcon = (change?: number) => {
    if (!change) return <Activity className="w-3 h-3" />;
    return change >= 0 ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    );
  };

  const getConnectionStatusColor = () => {
    switch (connectionQuality) {
      case "excellent":
        return "bg-green-400";
      case "good":
        return "bg-yellow-400";
      case "poor":
        return "bg-orange-400";
      default:
        return "bg-red-400";
    }
  };

  return (
    <div className="bg-gray-900 border-y border-gray-700 py-2 overflow-hidden">
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${getConnectionStatusColor()} ${
              isConnected ? "animate-pulse" : ""
            }`}
          ></div>
          <span className="text-xs text-gray-400 uppercase font-medium">
            Live Market Data
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{
            x: autoScroll && !isHovered ? [-1000, 0] : 0,
          }}
          transition={{
            x: {
              repeat: autoScroll && !isHovered ? Infinity : 0,
              repeatType: "loop",
              duration: scrollSpeed,
              ease: "linear",
            },
          }}
        >
          {symbols.map((symbol) => {
            const price = prices[symbol];
            if (!price) {
              return (
                <div
                  key={symbol}
                  className="flex items-center space-x-2 px-4 py-1"
                >
                  <span className="text-gray-400 text-sm font-medium">
                    {symbol}
                  </span>
                  <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              );
            }

            return (
              <motion.div
                key={symbol}
                className="flex items-center space-x-3 px-4 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">
                    {symbol}
                  </span>
                  {showChange && (
                    <div
                      className={`flex items-center space-x-1 ${getPriceChangeColor(
                        price.change
                      )}`}
                    >
                      {getPriceChangeIcon(price.change)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <motion.span
                    className="text-white font-mono text-sm"
                    key={price.price}
                    initial={{ backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                    animate={{ backgroundColor: "transparent" }}
                    transition={{ duration: 0.5 }}
                  >
                    {formatPrice(price.price, symbol)}
                  </motion.span>

                  {showChange && price.change !== undefined && (
                    <div
                      className={`text-xs ${getPriceChangeColor(price.change)}`}
                    >
                      {price.change >= 0 ? "+" : ""}
                      {price.change.toFixed(price.change > 1 ? 2 : 4)}
                      {price.changePercent !== undefined && (
                        <span className="ml-1">
                          ({price.changePercent >= 0 ? "+" : ""}
                          {price.changePercent.toFixed(2)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {showVolume && price.volume && (
                  <div className="text-xs text-gray-400">
                    Vol: {formatVolume(price.volume)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Fade out edges for scrolling effect */}
        <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
      </div>

      {!isConnected && (
        <div className="text-center py-2">
          <span className="text-xs text-red-400">Market data disconnected</span>
        </div>
      )}
    </div>
  );
};

export default PriceTicker;
