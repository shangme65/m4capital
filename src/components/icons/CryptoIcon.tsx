"use client";

import React, { useState } from "react";

interface CryptoIconProps {
  symbol: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

const colorMap: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  XRP: "#23292f",
  TRX: "#eb0029",
  TON: "#0098ea",
  LTC: "#345d9d",
  BCH: "#f7931a",
  ETC: "#328335",
  USDC: "#2775ca",
  USDT: "#26a17b",
  USD: "#ffd700",
};

export function CryptoIcon({
  symbol,
  size = "md",
  className = "",
  alt,
}: CryptoIconProps) {
  const [failed, setFailed] = useState(false);
  const iconSize = sizeMap[size];
  const normalizedSymbol = symbol.toLowerCase();
  const iconPath = `/${normalizedSymbol}.svg`;
  const bgColor = colorMap[symbol] || "#6b7280";

  if (failed) {
    // Fallback to colored circle with symbol
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full text-white font-bold flex-shrink-0 ${className}`}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          backgroundColor: bgColor,
          fontSize: `${iconSize * 0.4}px`,
        }}
      >
        {symbol.substring(0, 1)}
      </div>
    );
  }

  return (
    <img
      src={iconPath}
      alt={alt || `${symbol} icon`}
      width={iconSize}
      height={iconSize}
      className={`inline-block ${className}`}
      onError={() => {
        setFailed(true);
      }}
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
      }}
    />
  );
}
