"use client";

import { useEffect, useRef, useState } from "react";
import { init, dispose } from "klinecharts";
import { useCryptoMarket } from "./CryptoMarketProvider";
import {
  fetchKlineData,
  subscribeToKlineUpdates,
  normalizeInterval,
  type KlineData,
} from "@/lib/api/binance";

interface RealTimeTradingChartProps {
  symbol: string;
  interval?: string;
  // number of candles to fetch for the selected interval (Binance limit up to 1000)
  limit?: number;
}

export default function RealTimeTradingChart({
  symbol,
  interval = "1m",
  limit = 100,
}: RealTimeTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const { cryptoPrices } = useCryptoMarket();
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [showIndicators, setShowIndicators] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chart data when symbol or interval changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;

    // Clean up any existing charts and WebSocket subscriptions
    if (chartRef.current) {
      dispose(chartContainerRef.current);
      chartRef.current = null;
    }

    if (wsUnsubscribeRef.current) {
      wsUnsubscribeRef.current();
      wsUnsubscribeRef.current = null;
    }

    const chart = init(chartContainerRef.current, {
      styles: {
        // Make candles thicker and use clearer colors for up/down movements
        candle: {
          type: "candle_solid" as any,
          bar: {
            upColor: "#16a34a", // green
            downColor: "#ef4444", // red
            upBorderColor: "#16a34a",
            downBorderColor: "#ef4444",
            upWickColor: "#16a34a",
            downWickColor: "#ef4444",
          },
        },
        // Light, subtle grid to match screenshot
        grid: {
          horizontal: { color: "#eef0f2" },
          vertical: { color: "transparent" },
        },
      },
      // Keep layout default; parent container determines card background
    });

    chartRef.current = chart;

    // Make the chart background transparent to show the parent's background
    const chartElement = chartContainerRef.current.querySelector("canvas");
    if (chartElement) {
      (chartElement.parentElement as HTMLElement).style.background =
        "transparent";
    }

    // Fetch historical data from Binance
    const loadChartData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Normalize symbol to Binance format (e.g., "BTC" -> "BTCUSDT")
        const binanceSymbol = symbol.toUpperCase().includes("USDT")
          ? symbol.toUpperCase()
          : `${symbol.toUpperCase()}USDT`;

        const binanceInterval = normalizeInterval(currentInterval);

        console.log(
          `Fetching chart data for ${binanceSymbol} at ${binanceInterval} interval...`
        );

        // Fetch most recent candles (limit adjustable)
        const klineData = await fetchKlineData(
          binanceSymbol,
          binanceInterval,
          limit
        );

        if (!isMounted || !chartRef.current) return;

        console.log(
          `Successfully loaded ${klineData.length} candles for ${binanceSymbol}`
        );

        // Apply data to chart
        chartRef.current.applyNewData(klineData);

        // Subscribe to real-time updates
        try {
          wsUnsubscribeRef.current = subscribeToKlineUpdates(
            binanceSymbol,
            binanceInterval,
            (newKline: KlineData) => {
              if (!isMounted || !chartRef.current) return;

              // Update the chart with new kline data
              chartRef.current.updateData(newKline);
            }
          );
          console.log(`WebSocket subscribed for ${binanceSymbol}`);
        } catch (wsError) {
          console.warn(
            "WebSocket subscription failed, chart will not update in real-time:",
            wsError
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load chart data:", err);
        if (isMounted) {
          setError(
            "Failed to load chart data. Please check your internet connection and try again."
          );
          setIsLoading(false);
        }
      }
    };

    loadChartData();

    return () => {
      isMounted = false;

      if (wsUnsubscribeRef.current) {
        wsUnsubscribeRef.current();
        wsUnsubscribeRef.current = null;
      }

      if (chartRef.current && chartContainerRef.current) {
        dispose(chartContainerRef.current);
        chartRef.current = null;
      }
    };
  }, [symbol, currentInterval]);

  const addIndicator = (type: string) => {
    if (!chartRef.current) return;
    switch (type) {
      case "MA":
        chartRef.current.createIndicator("MA", false, { id: "candle_pane" });
        break;
      case "EMA":
        chartRef.current.createIndicator("EMA", false, { id: "candle_pane" });
        break;
      case "BOLL":
        chartRef.current.createIndicator("BOLL", false, { id: "candle_pane" });
        break;
      case "RSI":
        chartRef.current.createIndicator("RSI", false);
        break;
      case "MACD":
        chartRef.current.createIndicator("MACD", false);
        break;
      case "KDJ":
        chartRef.current.createIndicator("KDJ", false);
        break;
      case "VOL":
        chartRef.current.createIndicator("VOL", false);
        break;
    }
  };

  const clearIndicators = () => {
    if (chartRef.current) chartRef.current.removeIndicator();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Pale card container so chart appears on a soft background like the screenshot */}
      <div className="bg-gray-50/80 rounded-2xl p-3 h-full w-full">
        <div
          ref={chartContainerRef}
          className="w-full h-full rounded-lg overflow-hidden"
        />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1b1817]/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-[#9e9aa7]">Loading chart data...</div>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && !isLoading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex gap-2">
        {["1m", "5m", "15m", "1h", "4h", "1D"].map((int) => (
          <button
            key={int}
            onClick={() => setCurrentInterval(int)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              currentInterval === int
                ? "bg-orange-500 text-white"
                : "bg-[#2a2522] text-[#9e9aa7] hover:bg-[#38312e]"
            }`}
          >
            {int}
          </button>
        ))}
      </div>

      <div className="absolute top-4 left-4">
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className="px-3 py-1 rounded text-xs font-medium bg-[#2a2522] text-[#9e9aa7] hover:bg-[#38312e]"
        >
          Indicators
        </button>
        {showIndicators && (
          <div className="absolute top-10 left-0 bg-[#1b1817] border border-[#38312e] rounded-lg p-2 shadow-xl z-50 min-w-[200px]">
            <div className="text-xs text-[#9e9aa7] mb-2 font-semibold">
              Overlay Indicators
            </div>
            <button
              onClick={() => addIndicator("MA")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              MA - Moving Average
            </button>
            <button
              onClick={() => addIndicator("EMA")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              EMA - Exponential MA
            </button>
            <button
              onClick={() => addIndicator("BOLL")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              BOLL - Bollinger Bands
            </button>
            <div className="text-xs text-[#9e9aa7] mt-3 mb-2 font-semibold border-t border-[#38312e] pt-2">
              Separate Pane
            </div>
            <button
              onClick={() => addIndicator("RSI")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              RSI - Relative Strength
            </button>
            <button
              onClick={() => addIndicator("MACD")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              MACD - Convergence
            </button>
            <button
              onClick={() => addIndicator("KDJ")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              KDJ - Stochastic
            </button>
            <button
              onClick={() => addIndicator("VOL")}
              className="block w-full text-left px-3 py-2 text-xs text-[#9e9aa7] hover:bg-[#2a2522] rounded"
            >
              VOL - Volume
            </button>
            <button
              onClick={clearIndicators}
              className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-[#2a2522] rounded mt-2 border-t border-[#38312e] pt-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 bg-[#1b1817]/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#38312e]">
        <div className="text-sm text-[#9e9aa7]">{symbol}</div>
        <div className="text-2xl font-semibold text-white">
          $
          {(() => {
            const price = cryptoPrices[symbol];
            if (typeof price === "object" && price && "price" in price) {
              return (price as any).price.toFixed(2);
            }
            if (typeof price === "number") {
              return (price as number).toFixed(2);
            }
            return "0.00";
          })()}
        </div>
      </div>
    </div>
  );
}
