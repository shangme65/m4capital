"use client";

import { useEffect, useRef, useState } from "react";
import { init, dispose, registerYAxis } from "klinecharts";
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
  setLastHistoricalClose,
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

// Register custom Y-axis that shows fewer tick labels (wider spacing like IQ Option)
registerYAxis({
  name: "spacedYAxis",
  createTicks: ({ defaultTicks }) => {
    // Show at most ~4 ticks for wide spacing (IQ Option style)
    if (defaultTicks.length <= 4) return defaultTicks;
    const step = Math.ceil(defaultTicks.length / 4);
    return defaultTicks.filter((_, i) => i % step === 0);
  },
});

interface RealTimeTradingChartProps {
  symbol: string;
  interval?: string;
  // number of candles to fetch for the selected interval
  limit?: number;
  // Callback with the Y position percentage (0-100) of the current price on the chart
  onPriceYPosition?: (yPercent: number) => void;
  // Callback with the actual live price number
  onLivePriceUpdate?: (price: number) => void;
  // Expiration time in seconds (for binary options - IQ Option style)
  expirationSeconds?: number;
  // Countdown to next expiration (seconds remaining)
  expirationCountdown?: number;
  // Whether there are active trades
  hasActiveTrades?: boolean;
  // Actual active trade timestamps (ms) for end time line
  activeTradeExpirationTime?: number;
  activeTradeEntryTime?: number;
  // Callback that provides a function to convert price -> Y percentage
  onPriceToYConverter?: (converter: (price: number) => number) => void;
  // Callback that provides a function to convert timestamp -> X percentage
  onTimeToXConverter?: (converter: (timestamp: number) => number) => void;
  // Hovered trade button for dynamic price line color
  hoveredButton?: "higher" | "lower" | null;
  // Callback with the timestamp of the latest candle on the chart
  onLastCandleTimestamp?: (timestamp: number) => void;
  // Suppress the dark overlay after the entry line (e.g. on mobile)
  hideTradeOverlay?: boolean;
  // Disable crosshair entirely (e.g. on mobile touch)
  disableCrosshair?: boolean;
  // Entry arrow: price where the trade was opened + which direction
  activeTradeEntryPrice?: number;
  activeTradeDirection?: "higher" | "lower";
  // Full list of active trades for per-trade IQ Option style popups
  activeTradesForChart?: Array<{
    id: string;
    symbol: string;
    direction: "higher" | "lower";
    amount: number;
    entryPrice: number;
    status: string;
  }>;
}

export default function RealTimeTradingChart({
  symbol,
  interval = "1m",
  limit = 3000, // Maximum candles for full chart coverage
  onPriceYPosition,
  onLivePriceUpdate,
  expirationSeconds = 60,
  expirationCountdown,
  hasActiveTrades = false,
  activeTradeExpirationTime,
  activeTradeEntryTime,
  onPriceToYConverter,
  onTimeToXConverter,
  hoveredButton,
  onLastCandleTimestamp,
  hideTradeOverlay = false,
  disableCrosshair = false,
  activeTradeEntryPrice,
  activeTradeDirection,
  activeTradesForChart = [],
}: RealTimeTradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const wsUnsubscribeRef = useRef<(() => void) | null>(null);
  const onLivePriceUpdateRef = useRef(onLivePriceUpdate);
  const onLastCandleTimestampRef = useRef(onLastCandleTimestamp);
  const { cryptoPrices } = useCryptoMarket();
  const [currentInterval, setCurrentInterval] = useState(interval);
  const [showIndicators, setShowIndicators] = useState(false);
  const [showCandleTimePeriod, setShowCandleTimePeriod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Y position (0-100%) of the active trade entry price on the chart (legacy single-trade)
  const [entryArrowY, setEntryArrowY] = useState<number | null>(null);
  // Per-trade Y positions: Map<tradeId, yPercent>
  const [tradeYPositions, setTradeYPositions] = useState<
    Record<string, number>
  >({});
  const [livePrice, setLivePrice] = useState<{
    price: number;
    direction: "up" | "down" | "neutral";
  } | null>(null);

  // Stable expiration target timestamp — only recalculated when countdown ticks,
  // NOT on every render (prevents flicker caused by Date.now() drift between renders)
  const expirationTargetMsRef = useRef<number>(
    Date.now() + (expirationCountdown ?? expirationSeconds) * 1000,
  );
  useEffect(() => {
    if (expirationCountdown !== undefined) {
      expirationTargetMsRef.current = Date.now() + expirationCountdown * 1000;
    }
  }, [expirationCountdown]);

  // Keep the ref updated with latest callback without triggering re-renders
  useEffect(() => {
    onLivePriceUpdateRef.current = onLivePriceUpdate;
  }, [onLivePriceUpdate]);

  useEffect(() => {
    onLastCandleTimestampRef.current = onLastCandleTimestamp;
  }, [onLastCandleTimestamp]);

  // Enforce axis text size based on mobile (disableCrosshair) — runs after chart init
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || typeof chart.setStyles !== "function") return;
    const textSize = disableCrosshair ? 7 : 12;
    chart.setStyles({
      yAxis: { tickText: { size: textSize } },
      xAxis: { tickText: { size: disableCrosshair ? 7 : 11 } },
    } as any);
  }, [disableCrosshair]);

  // Dynamically update price line color based on hovered button
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || typeof chart.setStyles !== "function") return;
    const greenColor = "#00c853";
    const redColor = "#ff1744";
    const lineColor =
      hoveredButton === "higher"
        ? greenColor
        : hoveredButton === "lower"
          ? redColor
          : undefined; // keep natural up/down coloring when no hover
    // priceMark.last is disabled — custom overlays handle the dashed line & badge.
    // Nothing to update here for hovered button color.
  }, [hoveredButton]);

  // Candle time period options like IQ Option
  const candleTimePeriods = [
    { label: "5 seconds", value: "5s" },
    { label: "10 seconds", value: "10s" },
    { label: "30 seconds", value: "30s" },
    { label: "1 minute", value: "1m" },
    { label: "2 minutes", value: "2m" },
    { label: "5 minutes", value: "5m" },
    { label: "10 minutes", value: "10m" },
    { label: "30 minutes", value: "30m" },
    { label: "1 hour", value: "1h" },
    { label: "2 hours", value: "2h" },
    { label: "4 hours", value: "4h" },
    { label: "8 hours", value: "8h" },
    { label: "1 day", value: "1D" },
    { label: "1 week", value: "1W" },
    { label: "1 month", value: "1M" },
  ];

  // Get display label for current interval
  const getCurrentIntervalLabel = () => {
    const period = candleTimePeriods.find((p) => p.value === currentInterval);
    return period ? period.label : currentInterval;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCandleTimePeriod) {
        const target = e.target as HTMLElement;
        if (!target.closest(".candle-time-dropdown")) {
          setShowCandleTimePeriod(false);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showCandleTimePeriod]);

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
          format: string,
        ) => {
          const date = new Date(timestamp);
          // Always show only time (HH:mm:ss) for x-axis like IQ Option
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });
        },
        formatBigNumber: (value: string | number) => {
          const num = typeof value === "string" ? parseFloat(value) : value;
          // IQ Option shows 5 decimal places for forex pairs
          return num.toFixed(5);
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
            high: { show: false },
            low: { show: false },
            // Disabled — custom overlays in MobileTradingView and desktop panel
            // render the dashed line and price badge themselves.
            last: {
              show: false,
            },
          },
        },
        // Subtle grid for dark theme
        grid: {
          horizontal: {
            show: true,
            color: "rgba(255, 255, 255, 0.04)",
            style: "solid" as any,
            size: 1,
          },
          vertical: {
            show: true,
            color: "rgba(255, 255, 255, 0.04)",
            style: "solid" as any,
            size: 1,
          },
        },
        // Y-axis styling - enable scroll zooming on Y-axis
        yAxis: {
          type: "normal" as any,
          position: "right" as any,
          inside: true,
          reverse: false,
          axisLine: { show: false }, // Hide Y-axis line
          tickLine: { show: true, color: "rgba(150, 150, 150, 0.3)" },
          tickText: {
            show: true,
            color: "#9e9aa7",
            size: disableCrosshair ? 8 : 12,
          },
        },
        // X-axis styling
        xAxis: {
          axisLine: { show: false }, // Hide X-axis line
          tickLine: { color: "rgba(150, 150, 150, 0.3)" },
          tickText: { color: "#9e9aa7", size: disableCrosshair ? 8 : 11 },
        },
        // Crosshair styling
        crosshair: {
          show: !disableCrosshair,
          horizontal: {
            show: !disableCrosshair,
            line: {
              show: !disableCrosshair,
              style: "dashed" as any,
              color: "rgba(255, 165, 0, 0.4)",
              size: 1,
            },
            text: {
              show: !disableCrosshair,
              color: "#ffffff",
              borderColor: "#f7931a",
              backgroundColor: "#f7931a",
            },
          },
          vertical: {
            show: !disableCrosshair,
            line: {
              show: !disableCrosshair,
              style: "dashed" as any,
              color: "rgba(255, 165, 0, 0.4)",
              size: 1,
            },
            text: {
              show: !disableCrosshair,
              color: "#ffffff",
              borderColor: "#f7931a",
              backgroundColor: "#f7931a",
            },
          },
        },
        // Indicator styling
        indicator: {
          lineColors: ["#f7931a", "#26a69a", "#ef5350", "#7b68ee", "#00bcd4"],
          tooltip: {
            showRule: "none" as any, // Hide indicator tooltip
          },
        },
      },
    });

    chartRef.current = chart;

    // Set price precision to show more decimal places (IQ Option style)
    if (chart) {
      chart.setPriceVolumePrecision(5, 0); // 5 decimal places for price, 0 for volume
    }

    // Apply custom Y-axis with wider tick spacing (IQ Option style)
    if (chart) {
      chart.setPaneOptions({
        id: "candle_pane",
        gap: { top: 0.3, bottom: 0.3 },
        axisOptions: { name: "spacedYAxis" },
      });
    }

    // Zoom out the chart to create more space
    if (chart) {
      chart.setBarSpace(8); // Reduce bar spacing to zoom out (default is ~12)
      chart.setOffsetRightDistance(200); // Add more space on the right for price indicator

      // Hide candle tooltip after chart initialization
      chart.setStyles({
        candle: {
          tooltip: {
            showRule: "none" as any, // Don't show candle OHLC data
          } as any,
        },
      });
    }

    // Make the chart background transparent to show the world map
    // Be selective - only make the main canvas container transparent, not the price badge
    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      // Set only the immediate chart wrapper to transparent, preserve price axis styling
      chartContainer.style.backgroundColor = "transparent";
      // Also try to set the chart's internal background via the API
      if (chart && typeof chart.setStyles === "function") {
        chart.setStyles({
          grid: {
            horizontal: { color: "rgba(100, 100, 100, 0.2)" },
            vertical: { color: "rgba(100, 100, 100, 0.1)" },
          },
        });
      }

      // Override klinecharts crosshair cursor on all canvases
      const canvases = chartContainer.querySelectorAll("canvas");
      canvases.forEach((canvas: HTMLCanvasElement) => {
        canvas.style.cursor = "default";
      });
      // Observe for dynamically added canvases
      const observer = new MutationObserver(() => {
        chartContainer
          .querySelectorAll("canvas")
          .forEach((canvas: HTMLCanvasElement) => {
            canvas.style.cursor = "default";
          });
      });
      observer.observe(chartContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style"],
      });
      // Store observer for cleanup
      (chartContainerRef.current as any).__cursorObserver = observer;
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
            `Fetching FOREX chart data for ${symbol} at ${currentInterval} interval...`,
          );

          const forexData = await fetchForexCandles(
            symbol,
            currentInterval,
            limit,
          );

          if (!isMounted || !chartRef.current) return;

          console.log(
            `Successfully loaded ${forexData.length} candles for ${symbol}`,
          );

          // Apply data to chart
          chartRef.current.applyNewData(forexData);

          // Set scroll limit to data range - position current price in middle like IQ Option
          if (forexData.length > 0) {
            // Responsive right offset: mobile needs much less than desktop
            // 600px on a 360px mobile screen pushes all candles completely off-screen
            const containerWidth =
              chartContainerRef.current?.clientWidth ?? 800;
            const isMobileView = containerWidth < 540;
            // Increase right offset to push current price more toward center
            const rightOffset = isMobileView
              ? Math.round(containerWidth * 0.35)
              : 300;
            const barSpacing = isMobileView ? 7 : 12;
            chartRef.current.setOffsetRightDistance(rightOffset);
            chartRef.current.setLeftMinVisibleBarCount(10);
            chartRef.current.setRightMinVisibleBarCount(5);
            chartRef.current.setBarSpace(barSpacing);
            // Scroll to show latest/current price
            chartRef.current.scrollToRealTime();
          }

          // Set initial live price from last candle and store for live updates continuity
          if (forexData.length > 0) {
            const lastCandle = forexData[forexData.length - 1];
            setLivePrice({ price: lastCandle.close, direction: "neutral" });
            // Store the last historical close so live updates continue from this price
            setLastHistoricalClose(symbol, lastCandle.close);
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
            },
          );
          console.log(`Live updates started for ${symbol}`);
        } else {
          // Use Binance for crypto pairs
          const binanceSymbol = symbol.toUpperCase().includes("USDT")
            ? symbol.toUpperCase()
            : `${symbol.toUpperCase()}USDT`;

          const binanceInterval = normalizeInterval(currentInterval);

          console.log(
            `Fetching CRYPTO chart data for ${binanceSymbol} at ${binanceInterval} interval...`,
          );

          // Fetch most recent candles (limit adjustable)
          const klineData = await fetchKlineData(
            binanceSymbol,
            binanceInterval,
            limit,
          );

          if (!isMounted || !chartRef.current) return;

          console.log(
            `Successfully loaded ${klineData.length} candles for ${binanceSymbol}`,
          );

          // Apply data to chart
          chartRef.current.applyNewData(klineData);

          // Set scroll limit to data range - position current price in middle like IQ Option
          if (klineData.length > 0) {
            // Responsive right offset: mobile needs much less than desktop
            const containerWidth =
              chartContainerRef.current?.clientWidth ?? 800;
            const isMobileView = containerWidth < 540;
            // Increase right offset to push current price more toward center
            const rightOffset = isMobileView
              ? Math.round(containerWidth * 0.35)
              : 300;
            const barSpacing = isMobileView ? 7 : 12;
            chartRef.current.setOffsetRightDistance(rightOffset);
            chartRef.current.setLeftMinVisibleBarCount(10);
            chartRef.current.setRightMinVisibleBarCount(5);
            chartRef.current.setBarSpace(barSpacing);
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
              },
            );
            console.log(`WebSocket subscribed for ${binanceSymbol}`);
          } catch (wsError) {
            console.warn(
              "WebSocket subscription failed, chart will not update in real-time:",
              wsError,
            );
          }
        }

        setIsLoading(false);

        // Enforce axis text size after data loads (overrides any default from klinecharts)
        if (disableCrosshair && chartRef.current) {
          (chartRef.current as any).setStyles?.({
            yAxis: { tickText: { size: 7 } },
            xAxis: { tickText: { size: 7 } },
          });
        }
      } catch (err) {
        console.error("Failed to load chart data:", err);
        if (isMounted) {
          setError(
            "Failed to load chart data. Please check your internet connection and try again.",
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

      // Clean up cursor observer
      if (
        chartContainerRef.current &&
        (chartContainerRef.current as any).__cursorObserver
      ) {
        (chartContainerRef.current as any).__cursorObserver.disconnect();
      }

      if (chartRef.current && chartContainerRef.current) {
        dispose(chartContainerRef.current);
        chartRef.current = null;
      }
    };
  }, [symbol, currentInterval]);

  // Report live price to parent whenever it changes
  useEffect(() => {
    if (onLivePriceUpdateRef.current && livePrice) {
      onLivePriceUpdateRef.current(livePrice.price);
    }
  }, [livePrice]);

  // Report Y position of current price to parent
  useEffect(() => {
    if (!livePrice || !chartRef.current || !chartContainerRef.current) return;

    try {
      const chart = chartRef.current;
      const container = chartContainerRef.current;
      const containerHeight = container.clientHeight;

      // Report the latest candle timestamp to parent
      if (
        onLastCandleTimestampRef.current &&
        typeof chart.getDataList === "function"
      ) {
        const dataList = chart.getDataList();
        if (dataList && dataList.length > 0) {
          const lastCandle = dataList[dataList.length - 1];
          if (lastCandle && lastCandle.timestamp) {
            onLastCandleTimestampRef.current(lastCandle.timestamp);
          }
        }
      }

      // Use klinecharts convertToPixel to get Y position of current price
      if (typeof chart.convertToPixel === "function") {
        const point = chart.convertToPixel(
          { value: livePrice.price },
          { paneId: "candle_pane" },
        );
        if (point && typeof point.y === "number" && containerHeight > 0) {
          const yPercent = (point.y / containerHeight) * 100;
          // Clamp between 10% and 90% for reasonable display
          const clampedPercent = Math.max(10, Math.min(90, yPercent));
          if (onPriceYPosition) onPriceYPosition(clampedPercent);
        }

        // Provide price-to-Y converter function to parent
        if (onPriceToYConverter) {
          onPriceToYConverter((price: number) => {
            try {
              const pt = chart.convertToPixel(
                { value: price },
                { paneId: "candle_pane" },
              );
              if (pt && typeof pt.y === "number" && containerHeight > 0) {
                const pct = (pt.y / containerHeight) * 100;
                return Math.max(5, Math.min(95, pct));
              }
            } catch {}
            return 50;
          });
        }

        // Provide timestamp-to-X converter function to parent
        if (onTimeToXConverter) {
          const containerWidth = container.clientWidth;
          onTimeToXConverter((timestamp: number) => {
            try {
              const pt = chart.convertToPixel(
                { timestamp },
                { paneId: "candle_pane" },
              );
              if (pt && typeof pt.x === "number" && containerWidth > 0) {
                const pct = (pt.x / containerWidth) * 100;
                return pct;
              }
            } catch {}
            return -100;
          });
        }

        // Compute entry arrow Y position when there is an active trade entry price (legacy)
        if (activeTradeEntryPrice) {
          try {
            const entryPt = chart.convertToPixel(
              { value: activeTradeEntryPrice },
              { paneId: "candle_pane" },
            );
            if (
              entryPt &&
              typeof entryPt.y === "number" &&
              containerHeight > 0
            ) {
              const pct = Math.max(
                5,
                Math.min(95, (entryPt.y / containerHeight) * 100),
              );
              setEntryArrowY(pct);
            }
          } catch {}
        } else {
          setEntryArrowY(null);
        }

        // Compute per-trade Y positions for IQ Option style popups
        if (
          activeTradesForChart &&
          activeTradesForChart.length > 0 &&
          containerHeight > 0
        ) {
          const newPositions: Record<string, number> = {};
          for (const trade of activeTradesForChart) {
            if (trade.status !== "active") continue;
            try {
              const pt = chart.convertToPixel(
                { value: trade.entryPrice },
                { paneId: "candle_pane" },
              );
              if (pt && typeof pt.y === "number") {
                newPositions[trade.id] = Math.max(
                  5,
                  Math.min(92, (pt.y / containerHeight) * 100),
                );
              }
            } catch {}
          }
          setTradeYPositions(newPositions);
        }
      }
    } catch (e) {
      // Fallback to center if conversion fails
      if (onPriceYPosition) onPriceYPosition(50);
    }
  }, [
    livePrice,
    onPriceYPosition,
    onPriceToYConverter,
    onTimeToXConverter,
    activeTradeEntryPrice,
    activeTradesForChart,
  ]);

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

  // Focus on current price - scroll to latest candle AND center vertically (IQ Option style)
  const focusOnCurrentPrice = () => {
    if (chartRef.current) {
      // Horizontal: scroll to show latest candle (current price)
      chartRef.current.scrollToRealTime();

      // Vertical: reset/auto-fit the price scale to center current price
      try {
        // Get current visible data range
        const dataList = chartRef.current.getDataList();
        if (dataList && dataList.length > 0) {
          // Get the last ~50 candles to calculate a reasonable price range
          const visibleCount = Math.min(50, dataList.length);
          const recentCandles = dataList.slice(-visibleCount);

          // Find highest and lowest prices in recent visible range
          let highestPrice = -Infinity;
          let lowestPrice = Infinity;

          recentCandles.forEach((candle: any) => {
            if (candle.high > highestPrice) highestPrice = candle.high;
            if (candle.low < lowestPrice) lowestPrice = candle.low;
          });

          // Add 10% padding above and below to keep price centered with breathing room
          const priceRange = highestPrice - lowestPrice;
          const padding = priceRange * 0.1;
          const paddedHigh = highestPrice + padding;
          const paddedLow = lowestPrice - padding;

          // Set the Y-axis range to center the current price
          chartRef.current.setPriceVolumePrecision(5, 0);

          // Force chart to re-render with new scale
          chartRef.current.setOffsetRightDistance(
            chartRef.current.getOffsetRightDistance() || 200,
          );
        }
      } catch (error) {
        console.warn("Failed to reset vertical scale:", error);
      }
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

  // Y-axis zoom state for vertical price scaling (IQ Option style)
  // Start with higher zoom (2.5) to show more price labels like IQ Option
  const [priceScaleZoom, setPriceScaleZoom] = useState(2.5);
  const [isDraggingYAxis, setIsDraggingYAxis] = useState(false);
  const yAxisDragStartRef = useRef<{ y: number; zoom: number } | null>(null);

  // Handle Y-axis drag for vertical price zoom (like IQ Option)
  const handleYAxisMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingYAxis(true);
    yAxisDragStartRef.current = { y: e.clientY, zoom: priceScaleZoom };
    document.body.style.cursor = "ns-resize";
  };

  // Global mouse move/up handlers for Y-axis drag
  useEffect(() => {
    if (!isDraggingYAxis) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!yAxisDragStartRef.current || !chartRef.current) return;

      const deltaY = e.clientY - yAxisDragStartRef.current.y;
      // Dragging down = flatten (zoom out), dragging up = exaggerate (zoom in)
      const sensitivity = 0.005;
      const newZoom = Math.max(
        0.2,
        Math.min(5, yAxisDragStartRef.current.zoom - deltaY * sensitivity),
      );

      setPriceScaleZoom(newZoom);

      // Apply zoom to chart by adjusting the price precision display
      // Klinecharts uses setPriceVolumePrecision but we can simulate Y-axis zoom
      // by scrolling the visible data range
      try {
        const chart = chartRef.current;
        if (chart && typeof chart.setStyles === "function") {
          // Adjust the candle visual size based on zoom
          const candleWidth = Math.max(1, Math.min(10, 4 * newZoom));
          chart.setStyles({
            candle: {
              bar: {
                width: candleWidth,
              },
            },
          });
        }
      } catch {
        // Ignore styling errors
      }
    };

    const handleMouseUp = () => {
      setIsDraggingYAxis(false);
      yAxisDragStartRef.current = null;
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingYAxis]);

  // Handle Y-axis scroll for vertical price zoom
  const handleYAxisWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!chartRef.current) return;

    // Scroll up = exaggerate (zoom in on Y), Scroll down = flatten (zoom out on Y)
    const zoomChange = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.2, Math.min(5, priceScaleZoom + zoomChange));
    setPriceScaleZoom(newZoom);

    // Adjust bar space as visual feedback (affects how spread out candles look)
    const currentBarSpace = chartRef.current.getBarSpace() || 12;
    if (e.deltaY > 0) {
      // Flatten - make candles look flatter by adjusting space
      chartRef.current.setBarSpace(Math.min(currentBarSpace + 1, 30));
    } else {
      // Exaggerate - reduce spacing to make price swings more visible
      chartRef.current.setBarSpace(Math.max(currentBarSpace - 1, 4));
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-visible"
      style={{ maxHeight: "100%", zIndex: 100 }}
    >
      {/* Chart container - klinecharts will render here */}
      <div className="h-full w-full flex flex-col">
        <div
          ref={chartContainerRef}
          className="flex-1 w-full overflow-visible [&_canvas]:!cursor-default"
          style={{
            minHeight: 0, // Allow flex shrinking
            cursor: "default",
          }}
        />
      </div>

      {/* Y-axis drag/scroll zone - IQ Option style price scale control on right side */}
      <div
        className="absolute top-0 right-0 w-20 h-full cursor-ns-resize z-10"
        onWheel={handleYAxisWheel}
        onMouseDown={handleYAxisMouseDown}
        title="Drag up/down to adjust price scale"
      ></div>

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

      {/* IQ Option Style Expiration Lines - Purchase time (white) and End time (red) */}
      {expirationCountdown !== undefined &&
        (() => {
          const purchaseLinePos = 60; // current time at 60%

          // Compute end line position from countdown (simpler & always works)
          const totalSecs = expirationSeconds || 60;
          const remaining = Math.max(0, expirationCountdown);
          const progress = totalSecs > 0 ? remaining / totalSecs : 0;
          const endLinePos =
            purchaseLinePos + (95 - purchaseLinePos) * progress;

          // Real clock time when trade expires — use stable ref (updated only on countdown tick)
          // to prevent label flickering caused by Date.now() varying between renders
          const endClockTime = new Date(expirationTargetMsRef.current);
          const endTimeDisplay = `${String(endClockTime.getHours()).padStart(2, "0")}:${String(endClockTime.getMinutes()).padStart(2, "0")}:${String(endClockTime.getSeconds()).padStart(2, "0")}`;

          return (
            <>
              {/* Dark overlay covering the RIGHT side of purchase time line - only during active trade, not on mobile */}
              {hasActiveTrades && !hideTradeOverlay && (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: `${purchaseLinePos}%`,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    zIndex: 10,
                  }}
                />
              )}

              {/* Purchase Time Line (White dashed) */}
              <div
                className="absolute top-0 pointer-events-none"
                style={{
                  bottom: 0,
                  left: `${purchaseLinePos}%`,
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                }}
              >
                {/* Thin dashed line - stops at the x-axis area (bottom-8) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: "32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "1px",
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 50%, transparent 50%)",
                    backgroundSize: "1px 5px",
                  }}
                />

                {/* PURCHASE + countdown label at top */}
                <div
                  className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0"
                  style={{ color: "rgba(255, 255, 255, 0.45)" }}
                >
                  <span className="text-[7px] tracking-wider whitespace-nowrap uppercase leading-tight">
                    Purchase
                  </span>
                  <span
                    className="text-[10px] font-bold font-mono leading-none"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {String(
                      Math.floor((expirationCountdown || 0) / 60),
                    ).padStart(2, "0")}
                    :{String((expirationCountdown || 0) % 60).padStart(2, "0")}
                  </span>
                </div>

                {/* Time label at bottom — sits in the x-axis area, always shows live current time */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                  style={{
                    bottom: "4px",
                    color: "rgba(255, 255, 255, 0.55)",
                  }}
                >
                  <span className="text-[9px] font-mono whitespace-nowrap tabular-nums">
                    {(() => {
                      const t = new Date();
                      return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}:${String(t.getSeconds()).padStart(2, "0")}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Trade End Time Line (Solid Red) - Always visible */}
              <div
                className="absolute top-0 pointer-events-none"
                style={{
                  bottom: 0,
                  left: `${endLinePos}%`,
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  transition: "left 1s linear",
                }}
              >
                {/* Solid red vertical line — stops at x-axis area */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: "32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "1px",
                    backgroundColor: "rgba(239,68,68,0.85)",
                  }}
                />

                {/* Expiration time label in x-axis area */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                  style={{ bottom: "4px" }}
                >
                  <span
                    className="text-[9px] font-mono whitespace-nowrap tabular-nums px-1 rounded"
                    style={{
                      color: "rgba(239,68,68,1)",
                      backgroundColor: "rgba(239,68,68,0.15)",
                    }}
                  >
                    {endTimeDisplay}
                  </span>
                </div>
              </div>
            </>
          );
        })()}

      {/* IQ Option style per-trade entry popups */}
      {activeTradesForChart
        .filter(
          (t) => t.status === "active" && tradeYPositions[t.id] !== undefined,
        )
        .map((trade) => {
          const yPct = tradeYPositions[trade.id];
          const isUp = trade.direction === "higher";
          const mainColor = isUp ? "#30A46C" : "#E5484D";
          const darkColor = isUp ? "#1B4931" : "#62181B";
          const glowColor = isUp
            ? "rgba(48,164,108,0.3)"
            : "rgba(229,72,77,0.3)";
          const dashColor = isUp
            ? "rgba(48,164,108,0.6)"
            : "rgba(229,72,77,0.6)";

          return (
            <div
              key={`iq-popup-${trade.id}`}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1003 }}
            >
              {/* Dashed horizontal line from left edge to the popup (at 60% purchase line) */}
              <div
                style={{
                  position: "absolute",
                  top: `${yPct}%`,
                  left: 0,
                  width: "60%",
                  height: "1px",
                  backgroundImage: `repeating-linear-gradient(to right, ${dashColor} 0px, ${dashColor} 5px, transparent 5px, transparent 10px)`,
                  transform: "translateY(-0.5px)",
                }}
              />

              {/* Popup badge anchored at the 60% purchase line X, at the trade's Y price level */}
              <div
                style={{
                  position: "absolute",
                  left: "60%",
                  top: `${yPct}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                {/* Glow circle behind arrow */}
                <div
                  style={{
                    position: "absolute",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: glowColor,
                    boxShadow: `0 0 8px 3px ${glowColor}`,
                    left: "-2px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />

                {/* Direction arrow triangle */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    marginRight: "3px",
                  }}
                >
                  {isUp ? (
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderBottom: `9px solid ${mainColor}`,
                        filter: `drop-shadow(0 0 3px ${mainColor})`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `9px solid ${mainColor}`,
                        filter: `drop-shadow(0 0 3px ${mainColor})`,
                      }}
                    />
                  )}
                </div>

                {/* Amount pill badge — IQ Option compact style */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    borderRadius: "6px",
                    overflow: "hidden",
                    boxShadow: `0 1px 6px 0 ${glowColor}`,
                    border: `1px solid ${mainColor}`,
                  }}
                >
                  {/* Amount text */}
                  <div
                    style={{
                      backgroundColor: mainColor,
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "Inter, sans-serif",
                      letterSpacing: "-0.3px",
                      padding: "2px 5px",
                      whiteSpace: "nowrap",
                      lineHeight: 1.4,
                    }}
                  >
                    ${trade.amount.toLocaleString()}
                  </div>
                  {/* Dark direction icon section */}
                  <div
                    style={{
                      backgroundColor: darkColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "2px 4px",
                      borderLeft: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                      {isUp ? (
                        <path d="M12 4l8 8H4z" />
                      ) : (
                        <path d="M12 20l-8-8h16z" />
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Legacy single-trade entry arrow (desktop only, when no activeTradesForChart) */}
      {activeTradesForChart.length === 0 &&
        hasActiveTrades &&
        activeTradeEntryPrice &&
        activeTradeDirection &&
        entryArrowY !== null && (
          <>
            {/* Horizontal dashed entry price line */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: `${entryArrowY}%`,
                height: "1px",
                backgroundImage:
                  activeTradeDirection === "higher"
                    ? "repeating-linear-gradient(to right, rgba(34,197,94,0.55) 0px, rgba(34,197,94,0.55) 6px, transparent 6px, transparent 12px)"
                    : "repeating-linear-gradient(to right, rgba(239,68,68,0.55) 0px, rgba(239,68,68,0.55) 6px, transparent 6px, transparent 12px)",
                zIndex: 1002,
              }}
            />
            {/* Arrow at purchase line */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: "60%",
                top: `${entryArrowY}%`,
                transform: "translateX(-50%) translateY(-50%)",
                zIndex: 1003,
              }}
            >
              {activeTradeDirection === "higher" ? (
                <div style={{ position: "relative", width: 0, height: 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(34,197,94,0.25)",
                      boxShadow: "0 0 6px 2px rgba(34,197,94,0.35)",
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderBottom: "11px solid #22c55e",
                      filter: "drop-shadow(0 0 2px rgba(34,197,94,0.8))",
                      position: "relative",
                      top: "-5px",
                    }}
                  />
                </div>
              ) : (
                <div style={{ position: "relative", width: 0, height: 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(239,68,68,0.25)",
                      boxShadow: "0 0 6px 2px rgba(239,68,68,0.35)",
                    }}
                  />
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: "11px solid #ef4444",
                      filter: "drop-shadow(0 0 2px rgba(239,68,68,0.8))",
                      position: "relative",
                      top: "5px",
                    }}
                  />
                </div>
              )}
            </div>
            {/* Entry price badge */}
            <div
              className="absolute pointer-events-none flex items-center"
              style={{
                right: "64px",
                top: `${entryArrowY}%`,
                transform: "translateY(-50%)",
                zIndex: 1003,
              }}
            >
              <div
                className="text-white text-[10px] font-bold font-mono px-1 py-0.5 rounded"
                style={{
                  backgroundColor:
                    activeTradeDirection === "higher"
                      ? "rgba(34,197,94,0.85)"
                      : "rgba(239,68,68,0.85)",
                  border: `1px solid ${activeTradeDirection === "higher" ? "#22c55e" : "#ef4444"}`,
                  whiteSpace: "nowrap",
                }}
              >
                {activeTradeEntryPrice.toFixed(
                  activeTradeEntryPrice >= 100
                    ? 2
                    : activeTradeEntryPrice >= 1
                      ? 4
                      : 6,
                )}
              </div>
            </div>
          </>
        )}

      {/* Live Price Display - Hidden */}
    </div>
  );
}
