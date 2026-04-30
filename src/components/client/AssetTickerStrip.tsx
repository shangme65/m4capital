"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useCryptoPrices } from "./CryptoMarketProvider";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";

// Generate a mini sparkline SVG path
function MiniSparkline({ isPositive }: { isPositive: boolean }) {
  const points = useRef<number[]>([]);

  if (points.current.length === 0) {
    const base = 10;
    const pts: number[] = [];
    for (let i = 0; i < 8; i++) {
      const trend = isPositive ? -0.3 * i : 0.3 * i;
      const wave = Math.sin(i * 1.2) * 3;
      pts.push(base + trend + wave);
    }
    points.current = pts;
  }

  const pts = points.current;
  const width = 32;
  const height = 16;
  const stepX = width / (pts.length - 1);
  const minY = Math.min(...pts);
  const maxY = Math.max(...pts);
  const range = maxY - minY || 1;

  const pathData = pts
    .map((y, i) => {
      const nx = i * stepX;
      const ny = 2 + ((y - minY) / range) * (height - 4);
      return `${i === 0 ? "M" : "L"}${nx.toFixed(1)},${ny.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="flex-shrink-0"
    >
      <path
        d={pathData}
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

interface AssetTickerStripProps {
  symbols?: string[];
  className?: string;
  interval?: number;
}

export default function AssetTickerStrip({
  symbols = [
    "BTC",
    "ETH",
    "SOL",
    "XRP",
    "BNB",
    "ADA",
    "DOGE",
    "AVAX",
    "TRX",
    "DOT",
    "LINK",
    "TON",
    "SHIB",
    "LTC",
    "UNI",
    "MATIC",
    "ATOM",
    "NEAR",
    "FIL",
    "APT",
    "ARB",
    "OP",
    "AAVE",
    "MKR",
    "INJ",
    "SUI",
    "SEI",
    "BCH",
    "ETC",
  ],
  className = "",
  interval = 3000,
}: AssetTickerStripProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const prices = useCryptoPrices(symbols);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate through assets one at a time with fade transition
  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out
      setIsVisible(false);
      // After fade out, switch asset and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % symbols.length);
        setIsVisible(true);
      }, 400);
    }, interval);

    return () => clearInterval(timer);
  }, [symbols.length, interval]);

  const handleClick = useCallback(() => {
    router.push(`/traderoom?symbol=${symbols[currentIndex]}`);
  }, [router, symbols, currentIndex]);

  const currentSymbol = symbols[currentIndex];
  const price = prices[currentSymbol];
  const changePercent = price?.changePercent24h ?? 0;
  const isPositive = changePercent >= 0;

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Theme-aware styling matching IQ Option's pill badge
  const badgeBg = isDark
    ? "rgba(30, 26, 22, 0.85)"
    : "rgba(243, 244, 246, 0.9)";
  const badgeBorder = isDark
    ? "rgba(55, 48, 42, 0.6)"
    : "rgba(209, 213, 219, 0.8)";
  const nameColor = isDark ? "#ffffff" : "#111827";

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 rounded-full px-4 py-2 cursor-pointer group"
        style={{
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          backdropFilter: "blur(8px)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.4s ease-in-out",
        }}
      >
        {/* Icon */}
        <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          <CryptoIcon
            symbol={currentSymbol}
            size="sm"
            className="inline-block"
          />
        </div>

        {/* Name */}
        <span
          className="text-sm font-semibold whitespace-nowrap"
          style={{ color: nameColor }}
        >
          {currentSymbol}
        </span>

        {/* Percentage Change */}
        <span
          className="text-sm font-medium whitespace-nowrap"
          style={{
            color: isPositive
              ? isDark
                ? "#f87171"
                : "#dc2626"
              : isDark
                ? "#f87171"
                : "#dc2626",
            ...(isPositive && {
              color: isDark ? "#4ade80" : "#15803d",
            }),
          }}
        >
          {formatChange(changePercent)}
        </span>

        {/* Mini Sparkline */}
        <MiniSparkline isPositive={isPositive} />

        {/* Chevron Arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0 opacity-50 group-hover:opacity-90 transition-opacity"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke={isDark ? "#ffffff" : "#6b7280"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
