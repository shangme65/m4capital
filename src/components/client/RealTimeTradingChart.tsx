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
import {
  fetchForexCandles,
  subscribeToForexUpdates,
  normalizeForexSymbol,
  type CandleData,
} from "@/lib/api/forex-chart";

// Check if symbol is a forex pair (contains / or is known forex)
const FOREX_PAIRS = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "NZD"];
function isForexSymbol(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  // Contains slash like "USD/CAD" or "EUR/USD (OTC)"
  if (upper.includes("/")) return true;
  // Has two forex currency codes
  const normalized = upper.replace(/[^A-Z]/g, "");
  const hasForex =
    FOREX_PAIRS.filter((pair) => normalized.includes(pair)).length >= 2;
  return hasForex;
}

interface RealTimeTradingChartProps {
  symbol: string;
  interval?: string;
  // number of candles to fetch for the selected interval
  limit?: number;
}

export default function RealTimeTradingChart({
  symbol,
  interval = "1m",
  limit = 3000, // Maximum candles for full chart coverage
}: RealTimeTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const { cryptoPrices } = useCryptoMarket();
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [showIndicators, setShowIndicators] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<{
    price: number;
    direction: "up" | "down" | "neutral";
  } | null>(null);

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
      // Enable scrolling and zooming for historical data viewing
      locale: "en-US",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Limit scroll to data range - no empty areas
      customApi: {
        formatDate: (
          dateTimeFormat: any,
          timestamp: number,
          format: string
        ) => {
          const date = new Date(timestamp);
          if (format === "YYYY-MM-DD") {
            return date.toLocaleDateString();
          }
          if (format === "HH:mm") {
            return date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return date.toLocaleString();
        },
      },
      styles: {
        // IQ Option style candles - THICK, solid, clear GREEN/RED colors
        candle: {
          type: "candle_solid" as any,
          bar: {
            upColor: "#00c853", // Bright green for UP candles (close > open)
            downColor: "#ff1744", // Bright red for DOWN candles (close < open)
            upBorderColor: "#00c853",
            downBorderColor: "#ff1744",
            upWickColor: "#00c853",
            downWickColor: "#ff1744",
          },
          priceMark: {
            show: true,
            high: { show: true, color: "#00c853", textFamily: "Arial" },
            low: { show: true, color: "#ff1744", textFamily: "Arial" },
            last: {
              show: true,
              upColor: "#00c853",
              downColor: "#ff1744",
              noChangeColor: "#888888",
              line: { show: true, style: "dashed" as any, dashedValue: [4, 4] },
              text: {
                show: true,
                paddingLeft: 4,
                paddingRight: 4,
                paddingTop: 2,
                paddingBottom: 2,
                color: "#ffffff",
                family: "Arial",
                size: 12,
                borderRadius: 2,
              },
            },
          },
        },
        // Subtle grid for dark theme
        grid: {
          horizontal: {
            color: "rgba(100, 100, 100, 0.2)",
            style: "dashed" as any,
          },
          vertical: {
            color: "rgba(100, 100, 100, 0.1)",
            style: "dashed" as any,
          },
        },
        // Y-axis styling - enable scroll zooming on Y-axis
        yAxis: {
          type: "normal" as any,
          position: "right" as any,
          inside: false,
          reverse: false,
          axisLine: { show: true, color: "rgba(150, 150, 150, 0.3)" },
          tickLine: { show: true, color: "rgba(150, 150, 150, 0.3)" },
          tickText: { show: true, color: "#9e9aa7", size: 11 },
        },
        // X-axis styling
        xAxis: {
          axisLine: { color: "rgba(150, 150, 150, 0.3)" },
          tickLine: { color: "rgba(150, 150, 150, 0.3)" },
          tickText: { color: "#9e9aa7", size: 11 },
        },
        // Crosshair styling - more visible
        crosshair: {
          show: true,
          horizontal: {
            show: true,
            line: {
              show: true,
              style: "dashed" as any,
              color: "rgba(255, 165, 0, 0.6)",
              size: 1,
            },
            text: {
              show: true,
              color: "#ffffff",
              borderColor: "#f7931a",
              backgroundColor: "#f7931a",
            },
          },
          vertical: {
            show: true,
            line: {
              show: true,
              style: "dashed" as any,
              color: "rgba(255, 165, 0, 0.6)",
              size: 1,
            },
            text: {
              show: true,
              color: "#ffffff",
              borderColor: "#f7931a",
              backgroundColor: "#f7931a",
            },
          },
        },
        // Indicator styling
        indicator: {
          lineColors: ["#f7931a", "#26a69a", "#ef5350", "#7b68ee", "#00bcd4"],
        },
      },
    });

    chartRef.current = chart;

    // Make the chart background transparent to show the world map
    // klinecharts uses internal div containers, we need to make them all transparent
    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      // Set all child divs to transparent
      const allDivs = chartContainer.querySelectorAll("div");
      allDivs.forEach((div) => {
        (div as HTMLElement).style.backgroundColor = "transparent";
      });
      // Also try to set the chart's internal background via the API
      if (chart && typeof chart.setStyles === "function") {
        chart.setStyles({
          grid: {
            horizontal: { color: "rgba(100, 100, 100, 0.2)" },
            vertical: { color: "rgba(100, 100, 100, 0.1)" },
          },
        });
      }
    }

    // Fetch historical data - use forex API for forex pairs, Binance for crypto
    const loadChartData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        const isForex = isForexSymbol(symbol);

        if (isForex) {
          // Use forex data provider for forex pairs
          console.log(
            `Fetching FOREX chart data for ${symbol} at ${currentInterval} interval...`
          );

          const forexData = await fetchForexCandles(
            symbol,
            currentInterval,
            limit
          );

          if (!isMounted || !chartRef.current) return;

          console.log(
            `Successfully loaded ${forexData.length} candles for ${symbol}`
          );

          // Apply data to chart
          chartRef.current.applyNewData(forexData);

          // Set scroll limit to data range - position current price in middle like IQ Option
          if (forexData.length > 0) {
            // Large right offset to position current price in the middle of the screen
            chartRef.current.setOffsetRightDistance(300); // Increased to center current price
            chartRef.current.setLeftMinVisibleBarCount(10); // Minimum visible bars when scrolled left
            chartRef.current.setRightMinVisibleBarCount(5); // Fewer bars needed on right with larger offset
            chartRef.current.setBarSpace(12); // Default zoom level - more zoomed in
            // Scroll to show latest/current price
            chartRef.current.scrollToRealTime();
          }

          // Set initial live price from last candle
          if (forexData.length > 0) {
            const lastCandle = forexData[forexData.length - 1];
            setLivePrice({ price: lastCandle.close, direction: "neutral" });
          }

          // Subscribe to real-time forex updates with tick callback for live price
          wsUnsubscribeRef.current = subscribeToForexUpdates(
            symbol,
            currentInterval,
            (newCandle: CandleData) => {
              if (!isMounted || !chartRef.current) return;
              chartRef.current.updateData(newCandle);
            },
            (price: number, direction: "up" | "down" | "neutral") => {
              if (!isMounted) return;
              setLivePrice({ price, direction });
            }
          );
          console.log(`Live updates started for ${symbol}`);
        } else {
          // Use Binance for crypto pairs
          const binanceSymbol = symbol.toUpperCase().includes("USDT")
            ? symbol.toUpperCase()
            : `${symbol.toUpperCase()}USDT`;

          const binanceInterval = normalizeInterval(currentInterval);

          console.log(
            `Fetching CRYPTO chart data for ${binanceSymbol} at ${binanceInterval} interval...`
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

          // Set scroll limit to data range - position current price in middle like IQ Option
          if (klineData.length > 0) {
            // Large right offset to position current price in the middle of the screen
            chartRef.current.setOffsetRightDistance(300); // Increased to center current price
            chartRef.current.setLeftMinVisibleBarCount(10); // Minimum visible bars when scrolled left
            chartRef.current.setRightMinVisibleBarCount(5); // Fewer bars needed on right with larger offset
            chartRef.current.setBarSpace(12); // Default zoom level - more zoomed in
            // Scroll to show latest/current price
            chartRef.current.scrollToRealTime();
          }

          // Subscribe to real-time updates
          try {
            wsUnsubscribeRef.current = subscribeToKlineUpdates(
              binanceSymbol,
              binanceInterval,
              (newKline: KlineData) => {
                if (!isMounted || !chartRef.current) return;
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

  // Focus on current price - scroll to latest candle
  const focusOnCurrentPrice = () => {
    if (chartRef.current) {
      chartRef.current.scrollToRealTime();
    }
  };

  // Zoom in - increase bar space (make candles wider/bigger)
  const zoomIn = () => {
    if (chartRef.current) {
      const currentBarSpace = chartRef.current.getBarSpace() || 8;
      chartRef.current.setBarSpace(Math.min(currentBarSpace + 2, 50)); // Max zoom
    }
  };

  // Zoom out - decrease bar space (make candles narrower/smaller)
  const zoomOut = () => {
    if (chartRef.current) {
      const currentBarSpace = chartRef.current.getBarSpace() || 8;
      chartRef.current.setBarSpace(Math.max(currentBarSpace - 2, 3)); // Min zoom
    }
  };

  // Y-axis zoom state for vertical price scaling
  const [priceScaleMultiplier, setPriceScaleMultiplier] = useState(1);

  // Handle Y-axis scroll for vertical price zoom
  const handleYAxisWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!chartRef.current) return;

    // Calculate zoom factor based on scroll direction
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // Scroll down = zoom out, scroll up = zoom in
    const newMultiplier = Math.max(
      0.3,
      Math.min(3, priceScaleMultiplier * zoomFactor)
    );

    setPriceScaleMultiplier(newMultiplier);

    // Use klinecharts API to adjust the price scale
    // executeAction allows zooming at the Y-axis
    try {
      if (e.deltaY > 0) {
        // Zoom out vertically (increase price range visible)
        chartRef.current.executeAction("zoomOut" as any, {
          paneId: "candle_pane",
        });
      } else {
        // Zoom in vertically (decrease price range visible)
        chartRef.current.executeAction("zoomIn" as any, {
          paneId: "candle_pane",
        });
      }
    } catch {
      // Fallback: adjust bar space slightly to give visual feedback
      const currentBarSpace = chartRef.current.getBarSpace() || 12;
      if (e.deltaY > 0) {
        chartRef.current.setBarSpace(Math.max(currentBarSpace - 0.5, 3));
      } else {
        chartRef.current.setBarSpace(Math.min(currentBarSpace + 0.5, 50));
      }
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ maxHeight: "100%" }}
    >
      {/* Chart container - klinecharts will render here */}
      <div className="h-full w-full flex flex-col">
        <div
          ref={chartContainerRef}
          className="flex-1 w-full overflow-hidden"
          style={{
            minHeight: 0, // Allow flex shrinking
          }}
        />
      </div>

      {/* Y-axis scroll zone - invisible overlay on right side for vertical zoom */}
      <div
        className="absolute top-0 right-0 w-16 h-full cursor-ns-resize z-10"
        onWheel={handleYAxisWheel}
        title="Scroll to adjust price scale"
        style={{ background: "transparent" }}
      />

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

      {/* Chart controls - Bottom left */}
      <div className="absolute bottom-2 left-4 flex items-center gap-4 z-10">
        {/* Time interval buttons */}
        <div className="flex gap-1">
          {["1m", "5m", "15m", "1h", "4h", "1D"].map((int) => (
            <button
              key={int}
              onClick={() => setCurrentInterval(int)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                currentInterval === int
                  ? "bg-orange-500 text-white"
                  : "bg-[#2a2522]/80 text-[#9e9aa7] hover:bg-[#38312e]"
              }`}
            >
              {int}
            </button>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="text-[10px] text-[#666] flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
          Scroll to view history
        </div>
      </div>

      {/* Zoom & Focus Controls - Bottom center */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
        {/* Zoom out button */}
        <button
          onClick={zoomOut}
          className="w-8 h-8 flex items-center justify-center rounded bg-[#2a2522]/90 text-[#9e9aa7] hover:bg-[#38312e] hover:text-white transition-colors border border-[#38312e]"
          title="Zoom Out"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        {/* Focus on current price button */}
        <button
          onClick={focusOnCurrentPrice}
          className="w-8 h-8 flex items-center justify-center rounded bg-[#2a2522]/90 text-[#9e9aa7] hover:bg-[#38312e] hover:text-white transition-colors border border-[#38312e]"
          title="Focus on current price"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 0v4m0-4h4m-4 0H8"
            />
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
          </svg>
        </button>

        {/* Zoom in button */}
        <button
          onClick={zoomIn}
          className="w-8 h-8 flex items-center justify-center rounded bg-[#2a2522]/90 text-[#9e9aa7] hover:bg-[#38312e] hover:text-white transition-colors border border-[#38312e]"
          title="Zoom In"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
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

      {/* Live Price Display - IQ Option Style floating on right side */}
      {livePrice && (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-20">
          <div
            className={`px-3 py-1.5 rounded-md font-mono text-lg font-bold transition-all duration-100 ${
              livePrice.direction === "up"
                ? "bg-[#00c853] text-white shadow-[0_0_10px_rgba(0,200,83,0.5)]"
                : livePrice.direction === "down"
                ? "bg-[#ff1744] text-white shadow-[0_0_10px_rgba(255,23,68,0.5)]"
                : "bg-[#1b1817] text-white border border-[#38312e]"
            }`}
          >
            {livePrice.price.toFixed(5)}
          </div>
          {/* Price direction arrow */}
          <div
            className={`absolute -left-4 top-1/2 -translate-y-1/2 transition-all duration-100 ${
              livePrice.direction === "up"
                ? "text-[#00c853]"
                : livePrice.direction === "down"
                ? "text-[#ff1744]"
                : "text-gray-500"
            }`}
          >
            {livePrice.direction === "up" && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {livePrice.direction === "down" && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
