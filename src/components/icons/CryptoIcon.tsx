"use client";

import React, { useState } from "react";
import { getCurrencyFlagUrl } from "@/lib/currency-flags";

interface CryptoIconProps {
  symbol: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  alt?: string;
  showNetwork?: boolean;
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

// Comprehensive list of cryptocurrencies
export const CRYPTO_CURRENCIES = [
  "BTC", "ETH", "XRP", "TRX", "TON", "LTC", "BCH", "ETC", "USDC", "USDT",
  "SOL", "DOGE", "BNB", "ADA", "DOT", "MATIC", "SHIB", "AVAX", "LINK", "UNI",
  "ATOM", "FIL", "APT", "ARB", "OP", "NEAR", "ICP", "HBAR", "VET", "ALGO",
  "FTM", "MANA", "SAND", "AXS", "AAVE", "MKR", "CRV", "SNX", "COMP", "SUSHI",
  "POL", "PEPE", "WIF", "BONK", "FLOKI", "RENDER", "INJ", "SEI", "SUI", "TIA",
];

const colorMap: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  XRP: "#23292f",
  TRX: "#ff0013",
  TON: "#0098ea",
  LTC: "#345d9d",
  BCH: "#8dc351",
  ETC: "#3ab83a",
  USDC: "#2775ca",
  USDT: "#26a17b",
  SOL: "#9945ff",
  DOGE: "#c2a633",
  BNB: "#f3ba2f",
  ADA: "#0033ad",
  DOT: "#e6007a",
  MATIC: "#8247e5",
  SHIB: "#ffa409",
  AVAX: "#e84142",
  LINK: "#2a5ada",
  UNI: "#ff007a",
  ATOM: "#2e3148",
  FIL: "#0090ff",
  APT: "#000000",
  ARB: "#28a0f0",
  OP: "#ff0420",
  NEAR: "#000000",
  ICP: "#29abe2",
  HBAR: "#000000",
  VET: "#15bdff",
  ALGO: "#000000",
  FTM: "#1969ff",
  MANA: "#ff2d55",
  SAND: "#04adef",
  AXS: "#0055d5",
  AAVE: "#b6509e",
  MKR: "#1aab9b",
  CRV: "#ff3a3a",
  SNX: "#170659",
  COMP: "#00d395",
  SUSHI: "#fa52a0",
  POL: "#8247e5",
  PEPE: "#3d7b30",
  WIF: "#c4893b",
  BONK: "#f7a600",
  FLOKI: "#f9a825",
  RENDER: "#000000",
  INJ: "#0082ff",
  SEI: "#9b1c2e",
  SUI: "#4da2ff",
  TIA: "#7b2bf9",
  USD: "#ffd700",
  // Commodities
  XAUUSD: "#ffd700",
  XAGUSD: "#c0c0c0",
  XPTUSD: "#e5e4e2",
  XPDUSD: "#ced0dd",
  USOIL: "#2d2d2d",
  UKOIL: "#1a1a2e",
  NATGAS: "#4a90d9",
  COPPER: "#b87333",
  // Indices
  US30: "#1e3a8a",
  US100: "#7c3aed",
  SPX500: "#dc2626",
  UK100: "#1e40af",
  GER40: "#facc15",
  JPN225: "#dc2626",
  FRA40: "#1e3a8a",
  AUS200: "#15803d",
};

// CDN URL for crypto icons (cryptocurrency-icons repo)
function getCryptoIconCdnUrl(symbol: string): string {
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${symbol.toLowerCase()}.svg`;
}

export function CryptoIcon({
  symbol,
  size = "md",
  className = "",
  alt,
}: CryptoIconProps) {
  // 0 = local, 1 = CDN, 2 = local fiat (for fiat only), 3 = fallback circle
  const [stage, setStage] = useState(0);
  const iconSize = sizeMap[size];
  const upperSymbol = symbol.toUpperCase();
  const normalizedSymbol = symbol.toLowerCase();

  const isCrypto = CRYPTO_CURRENCIES.includes(upperSymbol);

  const bgColor = colorMap[upperSymbol] || "#6b7280";

  // Determine the icon source based on current stage
  let iconSrc: string;
  if (isCrypto) {
    if (stage === 0) {
      iconSrc = `/crypto/${normalizedSymbol}.svg`;
    } else if (stage === 1) {
      iconSrc = getCryptoIconCdnUrl(normalizedSymbol);
    } else {
      iconSrc = "";
    }
  } else {
    // Fiat currency - try CDN first, then local, then fallback
    if (stage === 0) {
      iconSrc = getCurrencyFlagUrl(upperSymbol);
    } else if (stage === 1) {
      iconSrc = `/currencies/${normalizedSymbol}.svg`;
    } else {
      iconSrc = "";
    }
  }

  if ((isCrypto && stage >= 2) || (!isCrypto && stage >= 2)) {
    // Fallback to colored circle with symbol letter
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
          src={iconSrc}
          alt={alt || `${symbol} icon`}
          className={`block ${className}`}
          onError={() => {
            setStage((prev) => prev + 1);
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
    </div>
  );
}
