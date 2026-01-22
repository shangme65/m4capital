"use client";

import { useEffect, useRef, useState, memo } from "react";

interface LightweightChartProps {
  symbol: string;
  interval?: "1H" | "1D" | "1W" | "1M" | "1Y" | "All";
  height?: number;
}

// Map crypto symbols to TradingView format (BINANCE exchange)
function getTradingViewSymbol(symbol: string): string {
  const symbolUpper = symbol.toUpperCase();
  // TradingView uses EXCHANGE:PAIR format
  return `BINANCE:${symbolUpper}USDT`;
}

// Map interval to TradingView interval format
function getTradingViewInterval(interval: string): string {
  switch (interval) {
    case "1H":
      return "60"; // 60 minutes
    case "1D":
      return "D"; // Daily
    case "1W":
      return "W"; // Weekly
    case "1M":
      return "M"; // Monthly
    case "1Y":
      return "12M"; // 12 months
    case "All":
      return "M"; // Monthly for all-time view
    default:
      return "D";
  }
}

function LightweightChart({
  symbol,
  interval = "1D",
  height = 320,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const widgetIdRef = useRef<string>(
    `tradingview_${Math.random().toString(36).substring(7)}`
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const tvSymbol = getTradingViewSymbol(symbol);
    const tvInterval = getTradingViewInterval(interval);

    // Clear any existing content
    containerRef.current.innerHTML = "";

    // Create container for the widget
    const widgetContainer = document.createElement("div");
    widgetContainer.id = widgetIdRef.current;
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    // Widget configuration
    const widgetConfig = {
      container_id: widgetIdRef.current,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1", // Candlestick
      locale: "en",
      toolbar_bg: "#0f172a",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      allow_symbol_change: false,
      backgroundColor: "#0f172a",
      autosize: true,
      withdateranges: true,
      details: false,
      hotlist: false,
      calendar: false,
      overrides: {
        "paneProperties.background": "#0f172a",
        "paneProperties.backgroundType": "solid",
        "paneProperties.vertGridProperties.color": "rgba(75, 85, 99, 0.2)",
        "paneProperties.horzGridProperties.color": "rgba(75, 85, 99, 0.2)",
        "scalesProperties.textColor": "#9ca3af",
        "scalesProperties.lineColor": "rgba(75, 85, 99, 0.3)",
        "mainSeriesProperties.candleStyle.upColor": "#22c55e",
        "mainSeriesProperties.candleStyle.downColor": "#ef4444",
        "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
        "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
      },
    };

    // Create widget function
    const createWidget = () => {
      // @ts-expect-error - TradingView is loaded globally
      if (typeof TradingView !== "undefined" && widgetContainer) {
        // @ts-expect-error - TradingView widget constructor
        new TradingView.widget(widgetConfig);
        setIsLoading(false);
      }
    };

    // Load TradingView widget script
    const existingScript = document.querySelector(
      'script[src="https://s3.tradingview.com/tv.js"]'
    );

    if (existingScript) {
      // Script already loaded, just create widget
      createWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        createWidget();
      };
      script.onerror = () => {
        console.error("Failed to load TradingView widget script");
        setIsLoading(false);
      };
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, interval]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: `${height}px`,
        background:
          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
      }}
    >
      {/* TradingView widget container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-400">Loading chart...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LightweightChart);
