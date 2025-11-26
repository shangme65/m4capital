"use client";

import React, { useState } from "react";

interface CryptoIconProps {
  symbol: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
  showNetwork?: boolean; // Show network badge (e.g., ETH badge on USDT)
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

// Map tokens to their network
const networkMap: Record<string, string> = {
  USDT: "ETH", // USDT ERC-20
  USDC: "ETH", // USDC ERC-20
};

export function CryptoIcon({
  symbol,
  size = "md",
  className = "",
  alt,
  showNetwork = false,
}: CryptoIconProps) {
  const [failed, setFailed] = useState(false);
  const iconSize = sizeMap[size];
  const normalizedSymbol = symbol.toLowerCase();
  const iconPath = `/crypto/${normalizedSymbol}.svg`;
  const bgColor = colorMap[symbol] || "#6b7280";

  const networkSymbol = networkMap[symbol];
  const badgeSize = Math.floor(iconSize * 0.4);

  if (failed) {
    // Fallback to colored circle with symbol
    return (
      <div className="relative inline-block">
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
        {showNetwork && networkSymbol && (
          <div
            className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center ring-2 ring-gray-900"
            style={{
              width: `${badgeSize}px`,
              height: `${badgeSize}px`,
              padding: "2px",
              boxShadow: "0 2px 6px rgba(59,130,246,0.5)",
            }}
          >
            <img
              src={`/crypto/${networkSymbol.toLowerCase()}.svg`}
              alt={`${networkSymbol} network`}
              className="rounded-full"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block flex-shrink-0">
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={iconPath}
          alt={alt || `${symbol} icon`}
          className={`block ${className}`}
          onError={() => {
            setFailed(true);
          }}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: `${iconSize}px`,
            maxHeight: `${iconSize}px`,
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      </div>
      {showNetwork && networkSymbol && (
        <div
          className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center ring-2 ring-gray-900"
          style={{
            width: `${badgeSize}px`,
            height: `${badgeSize}px`,
            padding: "2px",
            boxShadow: "0 2px 6px rgba(59,130,246,0.5)",
          }}
        >
          <img
            src={`/crypto/${networkSymbol.toLowerCase()}.svg`}
            alt={`${networkSymbol} network`}
            className="rounded-full"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </div>
  );
}
