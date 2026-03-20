"use client";

import { useState, memo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface LightweightChartProps {
  symbol: string;
  interval?: "1H" | "1D" | "1W" | "1M" | "1Y" | "All";
  height?: number;
}

function getTradingViewSymbol(symbol: string): string {
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
    USDT: "BITSTAMP:USDTUSD",
    SOL: "BINANCE:SOLUSDT",
    ADA: "BINANCE:ADAUSDT",
    DOGE: "BINANCE:DOGEUSDT",
    DOT: "BINANCE:DOTUSDT",
    MATIC: "BINANCE:POLUSDT",
    AVAX: "BINANCE:AVAXUSDT",
    LINK: "BINANCE:LINKUSDT",
    BNB: "BINANCE:BNBUSDT",
    UNI: "BINANCE:UNIUSDT",
    SHIB: "BINANCE:SHIBUSDT",
    ATOM: "BINANCE:ATOMUSDT",
    NEAR: "BINANCE:NEARUSDT",
    FIL: "BINANCE:FILUSDT",
    APT: "BINANCE:APTUSDT",
    ARB: "BINANCE:ARBUSDT",
    OP: "BINANCE:OPUSDT",
    AAVE: "BINANCE:AAVEUSDT",
    MKR: "BINANCE:MKRUSDT",
    INJ: "BINANCE:INJUSDT",
    SUI: "BINANCE:SUIUSDT",
    SEI: "BINANCE:SEIUSDT",
  };
  return symbolMap[symbol.toUpperCase()] || `BINANCE:${symbol.toUpperCase()}USDT`;
}

function getTradingViewInterval(interval: string): string {
  switch (interval) {
    case "1H": return "60";
    case "1D": return "D";
    case "1W": return "W";
    case "1M": return "M";
    case "1Y": return "12M";
    case "All": return "M";
    default: return "D";
  }
}

function LightweightChart({
  symbol,
  interval = "1D",
  height = 320,
}: LightweightChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const tvSymbol = encodeURIComponent(getTradingViewSymbol(symbol));
  const tvInterval = getTradingViewInterval(interval);

  // Theme-aware colors
  const theme = isDark ? "dark" : "light";
  const toolbarBg = isDark ? "0f172a" : "ffffff";
  const backgroundGradient = isDark
    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
    : "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)";

  const src =
    `https://s.tradingview.com/widgetembed/` +
    `?frameElementId=tv_embed_${symbol}` +
    `&symbol=${tvSymbol}` +
    `&interval=${tvInterval}` +
    `&hidesidetoolbar=1` +
    `&hidetoptoolbar=0` +
    `&symboledit=0` +
    `&saveimage=0` +
    `&toolbarbg=${toolbarBg}` +
    `&theme=${theme}` +
    `&style=1` +
    `&timezone=Etc%2FUTC` +
    `&withdateranges=1` +
    `&locale=en` +
    `&allow_symbol_change=0` +
    `&hide_legend=1`;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: `${height}px`,
        background: backgroundGradient,
      }}
    >
      <iframe
        key={`${symbol}-${interval}-${theme}`}
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />

      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl ${
            isDark ? "bg-gray-900/80" : "bg-white/80"
          }`}
          style={{ zIndex: 10000 }}
        >
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading chart...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LightweightChart);
