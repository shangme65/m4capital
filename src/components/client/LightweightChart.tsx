"use client";

import { useState, memo } from "react";

interface LightweightChartProps {
  symbol: string;
  interval?: "1H" | "1D" | "1W" | "1M" | "1Y" | "All";
  height?: number;
}

function getTradingViewSymbol(symbol: string): string {
  return `BINANCE:${symbol.toUpperCase()}USDT`;
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

  const tvSymbol = encodeURIComponent(getTradingViewSymbol(symbol));
  const tvInterval = getTradingViewInterval(interval);

  const src =
    `https://s.tradingview.com/widgetembed/` +
    `?frameElementId=tv_embed_${symbol}` +
    `&symbol=${tvSymbol}` +
    `&interval=${tvInterval}` +
    `&hidesidetoolbar=1` +
    `&hidetoptoolbar=0` +
    `&symboledit=0` +
    `&saveimage=0` +
    `&toolbarbg=0f172a` +
    `&theme=dark` +
    `&style=1` +
    `&timezone=Etc%2FUTC` +
    `&withdateranges=1` +
    `&locale=en` +
    `&allow_symbol_change=0`;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        height: `${height}px`,
        background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
      }}
    >
      <iframe
        src={src}
        className="w-full h-full border-0"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />

      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl"
          style={{ zIndex: 10000 }}
        >
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
