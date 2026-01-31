"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: "dark" | "light";
  height?: number;
}

function TradingViewChart({
  symbol,
  interval = "D",
  theme = "dark",
  height = 400,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Map common crypto symbols to display names
  const getCryptoName = (sym: string): string => {
    const nameMap: Record<string, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      XRP: "Ripple",
      TRX: "Tron",
      TON: "Toncoin",
      LTC: "Litecoin",
      BCH: "Bitcoin Cash",
      ETC: "Ethereum Classic",
      USDC: "USD Coin",
      USDT: "Tether",
      SOL: "Solana",
      ADA: "Cardano",
      DOGE: "Dogecoin",
      DOT: "Polkadot",
      MATIC: "Polygon",
      AVAX: "Avalanche",
      LINK: "Chainlink",
      UNI: "Uniswap",
      SHIB: "Shiba Inu",
      ATOM: "Cosmos",
    };
    return nameMap[sym.toUpperCase()] || sym.toUpperCase();
  };

  // Map common crypto symbols to TradingView format
  const getTradingViewSymbol = (sym: string): string => {
    const symbolMap: Record<string, string> = {
      BTC: "BINANCE:BTCUSDT",
      ETH: "BINANCE:ETHUSDT",
      XRP: "BINANCE:XRPUSDT",
      TRX: "BINANCE:TRXUSDT",
      TON: "OKX:TONUSDT",
      LTC: "BINANCE:LTCUSDT",
      BCH: "BINANCE:BCHUSDT",
      ETC: "BINANCE:ETCUSDT",
      USDC: "BINANCE:USDCUSDT",
      USDT: "BINANCE:USDTUSD",
      SOL: "BINANCE:SOLUSDT",
      ADA: "BINANCE:ADAUSDT",
      DOGE: "BINANCE:DOGEUSDT",
      DOT: "BINANCE:DOTUSDT",
      MATIC: "BINANCE:MATICUSDT",
      AVAX: "BINANCE:AVAXUSDT",
      LINK: "BINANCE:LINKUSDT",
      UNI: "BINANCE:UNIUSDT",
      SHIB: "BINANCE:SHIBUSDT",
      ATOM: "BINANCE:ATOMUSDT",
    };
    return symbolMap[sym.toUpperCase()] || `BINANCE:${sym.toUpperCase()}USDT`;
  };

  // Map UI interval to TradingView interval
  const getTradingViewInterval = (int: string): string => {
    const intervalMap: Record<string, string> = {
      "1m": "1",
      "5m": "5",
      "15m": "15",
      "1h": "60",
      "4h": "240",
      "1d": "D",
      "1w": "W",
      // UI period mappings - these should show appropriate timeframes
      "1H": "1", // 1 hour view = 1 minute candles
      "1D": "5", // 1 day view = 5 minute candles
      "1W": "30", // 1 week view = 30 minute candles
      "1M": "60", // 1 month view = 1 hour candles
      "1Y": "D", // 1 year view = daily candles
      All: "W", // All time = weekly candles
    };
    return intervalMap[int] || "D";
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    widgetContainer.appendChild(widgetDiv);
    containerRef.current.appendChild(widgetContainer);

    // Create and load TradingView script
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const tvSymbol = getTradingViewSymbol(symbol);
    const tvInterval = getTradingViewInterval(interval);
    const displayName = getCryptoName(symbol);

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: tvInterval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor:
        theme === "dark" ? "rgba(17, 24, 39, 1)" : "rgba(255, 255, 255, 1)",
      gridColor:
        theme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 1)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: true,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      withdateranges: false,
      details: false,
      hotlist: false,
      calendar: false,
      studies: [],
      support_host: "https://www.tradingview.com",
      container_id: widgetDiv.id,
    });

    widgetContainer.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, interval, theme]);

  return (
    <>
      <style jsx global>{`
        .tradingview-widget-container iframe + div,
        .tradingview-widget-copyright,
        div[class*="copyright"],
        a[href*="tradingview.com"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      <div
        style={{ height: `${height}px`, width: "100%" }}
        className="rounded-xl overflow-hidden relative"
      >
        {/* Widget container */}
        <div
          ref={containerRef}
          style={{ height: "100%", width: "100%" }}
        />
        
        {/* Overlay to block "/ TetherUS" text - positioned after "Bitcoin" */}
        <div
          className="absolute z-[9999]"
          style={{
            top: "46px",
            left: "90px",
            width: "120px",
            height: "22px",
            background: theme === "dark" ? "#131722" : "#ffffff",
            pointerEvents: "none",
          }}
        />
        
        {/* Overlay to cover bottom-left TradingView logo */}
        <div
          className="absolute z-[9999]"
          style={{
            bottom: "0",
            left: "0",
            width: "96px",
            height: "40px",
            background: theme === "dark" ? "#131722" : "#ffffff",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}

export default memo(TradingViewChart);
