"use client";

import React from "react";
import Image from "next/image";

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

export function CryptoIcon({
  symbol,
  size = "md",
  className = "",
  alt,
}: CryptoIconProps) {
  const iconSize = sizeMap[size];
  const normalizedSymbol = symbol.toLowerCase();
  const iconPath = `/crypto/${normalizedSymbol}.svg`;

  return (
    <img
      src={iconPath}
      alt={alt || `${symbol} icon`}
      width={iconSize}
      height={iconSize}
      className={`inline-block ${className}`}
      onError={(e) => {
        // Fallback to generic icon if specific icon not found
        (e.currentTarget as HTMLImageElement).src = "/crypto/generic.svg";
      }}
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
      }}
    />
  );
}
