"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Grid3X3,
  List,
  ChevronDown,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

// Types
interface ForexPair {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  weekChange: number;
  base: string;
  quote: string;
  baseFlag: string;
  quoteFlag: string;
}

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  weekChange: number;
  icon: string;
}

interface StockAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  weekChange: number;
  logo?: string;
  country: string;
  countryFlag: string;
}

// Forex pairs data
const forexPairs: ForexPair[] = [
  {
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    price: 0.658845,
    change: 0.0043,
    changePercent: 0.65,
    weekChange: 1.41,
    base: "AUD",
    quote: "USD",
    baseFlag: "au",
    quoteFlag: "us",
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    price: 1.3285,
    change: 0.0103,
    changePercent: 0.78,
    weekChange: 0.89,
    base: "GBP",
    quote: "USD",
    baseFlag: "gb",
    quoteFlag: "us",
  },
  {
    symbol: "AUD/JPY",
    name: "Australian Dollar / Japanese Yen",
    price: 102.4735,
    change: 0.36,
    changePercent: 0.35,
    weekChange: 0.88,
    base: "AUD",
    quote: "JPY",
    baseFlag: "au",
    quoteFlag: "jp",
  },
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    price: 1.166195,
    change: 0.0058,
    changePercent: 0.5,
    weekChange: 0.71,
    base: "EUR",
    quote: "USD",
    baseFlag: "eu",
    quoteFlag: "us",
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    price: 155.42,
    change: -0.32,
    changePercent: -0.21,
    weekChange: -0.45,
    base: "USD",
    quote: "JPY",
    baseFlag: "us",
    quoteFlag: "jp",
  },
  {
    symbol: "GBP/JPY",
    name: "British Pound / Japanese Yen",
    price: 206.535,
    change: 0.89,
    changePercent: 0.43,
    weekChange: 0.92,
    base: "GBP",
    quote: "JPY",
    baseFlag: "gb",
    quoteFlag: "jp",
  },
  {
    symbol: "EUR/GBP",
    name: "Euro / British Pound",
    price: 0.87765,
    change: -0.0012,
    changePercent: -0.14,
    weekChange: -0.23,
    base: "EUR",
    quote: "GBP",
    baseFlag: "eu",
    quoteFlag: "gb",
  },
  {
    symbol: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    price: 0.90325,
    change: -0.0028,
    changePercent: -0.31,
    weekChange: -0.58,
    base: "USD",
    quote: "CHF",
    baseFlag: "us",
    quoteFlag: "ch",
  },
  {
    symbol: "AUD/CHF",
    name: "Australian Dollar / Swiss Franc",
    price: 0.52754,
    change: 0.00095,
    changePercent: 0.18,
    weekChange: 0.77,
    base: "AUD",
    quote: "CHF",
    baseFlag: "au",
    quoteFlag: "ch",
  },
  {
    symbol: "NZD/JPY",
    name: "New Zealand Dollar / Japanese Yen",
    price: 89.4095,
    change: 0.23,
    changePercent: 0.26,
    weekChange: 0.74,
    base: "NZD",
    quote: "JPY",
    baseFlag: "nz",
    quoteFlag: "jp",
  },
  {
    symbol: "EUR/JPY",
    name: "Euro / Japanese Yen",
    price: 181.235,
    change: 0.45,
    changePercent: 0.25,
    weekChange: 0.62,
    base: "EUR",
    quote: "JPY",
    baseFlag: "eu",
    quoteFlag: "jp",
  },
  {
    symbol: "USD/CAD",
    name: "US Dollar / Canadian Dollar",
    price: 1.3582,
    change: 0.0032,
    changePercent: 0.24,
    weekChange: 0.51,
    base: "USD",
    quote: "CAD",
    baseFlag: "us",
    quoteFlag: "ca",
  },
  {
    symbol: "NZD/USD",
    name: "New Zealand Dollar / US Dollar",
    price: 0.57532,
    change: 0.0018,
    changePercent: 0.31,
    weekChange: 0.68,
    base: "NZD",
    quote: "USD",
    baseFlag: "nz",
    quoteFlag: "us",
  },
  {
    symbol: "EUR/CHF",
    name: "Euro / Swiss Franc",
    price: 1.05345,
    change: -0.0015,
    changePercent: -0.14,
    weekChange: -0.32,
    base: "EUR",
    quote: "CHF",
    baseFlag: "eu",
    quoteFlag: "ch",
  },
  {
    symbol: "GBP/CHF",
    name: "British Pound / Swiss Franc",
    price: 1.20025,
    change: 0.0021,
    changePercent: 0.18,
    weekChange: 0.45,
    base: "GBP",
    quote: "CHF",
    baseFlag: "gb",
    quoteFlag: "ch",
  },
  {
    symbol: "NOK/JPY",
    name: "Norwegian Krone / Japanese Yen",
    price: 13.895,
    change: 0.042,
    changePercent: 0.3,
    weekChange: 0.65,
    base: "NOK",
    quote: "JPY",
    baseFlag: "no",
    quoteFlag: "jp",
  },
];

// Crypto assets data
const cryptoAssets: CryptoAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 97500,
    change: 1250,
    changePercent: 1.3,
    weekChange: 4.2,
    icon: "/crypto/btc.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3650,
    change: 85,
    changePercent: 2.38,
    weekChange: 5.1,
    icon: "/crypto/eth.png",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 2.45,
    change: 0.12,
    changePercent: 5.15,
    weekChange: 12.3,
    icon: "/crypto/xrp.png",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 235,
    change: 8.5,
    changePercent: 3.75,
    weekChange: 8.9,
    icon: "/crypto/sol.png",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 645,
    change: -12,
    changePercent: -1.83,
    weekChange: -2.1,
    icon: "/crypto/bnb.png",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    price: 0.425,
    change: 0.015,
    changePercent: 3.66,
    weekChange: 7.8,
    icon: "/crypto/doge.png",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    price: 1.05,
    change: 0.035,
    changePercent: 3.45,
    weekChange: 6.2,
    icon: "/crypto/ada.png",
  },
  {
    symbol: "TRX",
    name: "TRON",
    price: 0.285,
    change: 0.008,
    changePercent: 2.89,
    weekChange: 4.5,
    icon: "/crypto/trx.png",
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    price: 115,
    change: 3.2,
    changePercent: 2.86,
    weekChange: 5.8,
    icon: "/crypto/ltc.png",
  },
  {
    symbol: "DOT",
    name: "Polkadot",
    price: 9.85,
    change: 0.42,
    changePercent: 4.45,
    weekChange: 9.1,
    icon: "/crypto/dot.png",
  },
];

// Stock assets data
const stockAssets: StockAsset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 195.5,
    change: 2.35,
    changePercent: 1.22,
    weekChange: 3.1,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.25,
    change: 4.8,
    changePercent: 1.29,
    weekChange: 2.8,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.85,
    change: 1.95,
    changePercent: 1.38,
    weekChange: 4.2,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 185.6,
    change: 3.25,
    changePercent: 1.78,
    weekChange: 5.5,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 352.4,
    change: -8.5,
    changePercent: -2.35,
    weekChange: -4.1,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 142.3,
    change: 5.2,
    changePercent: 3.79,
    weekChange: 8.2,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    price: 565.8,
    change: 12.4,
    changePercent: 2.24,
    weekChange: 4.8,
    country: "USA",
    countryFlag: "us",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase",
    price: 198.45,
    change: 1.85,
    changePercent: 0.94,
    weekChange: 2.1,
    country: "USA",
    countryFlag: "us",
  },
];

// Commodities data
const commodities = [
  {
    symbol: "GOLD",
    name: "Gold",
    price: 2650.5,
    change: 15.2,
    changePercent: 0.58,
    weekChange: 1.8,
    icon: "🪙",
  },
  {
    symbol: "SILVER",
    name: "Silver",
    price: 31.25,
    change: 0.42,
    changePercent: 1.36,
    weekChange: 3.2,
    icon: "🥈",
  },
  {
    symbol: "OIL",
    name: "Crude Oil WTI",
    price: 72.85,
    change: -0.95,
    changePercent: -1.29,
    weekChange: -2.4,
    icon: "🛢️",
  },
  {
    symbol: "NATGAS",
    name: "Natural Gas",
    price: 3.25,
    change: 0.08,
    changePercent: 2.52,
    weekChange: 5.1,
    icon: "🔥",
  },
  {
    symbol: "COPPER",
    name: "Copper",
    price: 4.15,
    change: 0.05,
    changePercent: 1.22,
    weekChange: 2.8,
    icon: "🔶",
  },
  {
    symbol: "PLATINUM",
    name: "Platinum",
    price: 985.5,
    change: 8.3,
    changePercent: 0.85,
    weekChange: 1.5,
    icon: "💎",
  },
];

// Mini chart SVG component
const MiniChart = ({ positive }: { positive: boolean }) => (
  <svg viewBox="0 0 100 40" className="w-24 h-10">
    <path
      d={
        positive
          ? "M0,35 Q15,30 25,28 T50,20 T75,15 T100,8"
          : "M0,8 Q15,12 25,18 T50,25 T75,32 T100,35"
      }
      fill="none"
      stroke={positive ? "#22c55e" : "#ef4444"}
      strokeWidth="2"
    />
  </svg>
);

// Forex Card Component
const ForexCard = ({ pair }: { pair: ForexPair }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = pair.changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Flag Banner */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full relative">
            <Image
              src={`https://flagcdn.com/w640/${pair.baseFlag}.png`}
              alt={pair.base}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              unoptimized
            />
          </div>
          <div className="w-1/2 h-full relative">
            <Image
              src={`https://flagcdn.com/w640/${pair.quoteFlag}.png`}
              alt={pair.quote}
              fill
              className={`object-cover transition-transform duration-500 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              unoptimized
            />
          </div>
        </div>
        {/* Center badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-800 overflow-hidden">
            <Image
              src={`https://flagcdn.com/w80/${pair.quoteFlag}.png`}
              alt={pair.quote}
              width={40}
              height={40}
              className="object-cover rounded-full"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {pair.symbol}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            {pair.price.toFixed(pair.price < 10 ? 6 : 4)}
          </span>
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {pair.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Chart and Week Change */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <MiniChart positive={pair.weekChange >= 0} />
          <div className="text-right">
            <span
              className={`text-lg font-bold ${
                pair.weekChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {pair.weekChange >= 0 ? "+" : ""}
              {pair.weekChange.toFixed(2)}%
            </span>
            <p className="text-xs text-gray-500">1W change</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Crypto Card Component
const CryptoCard = ({ asset }: { asset: CryptoAsset }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = asset.changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Banner */}
      <div className="relative h-32 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 overflow-hidden">
        <div
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        >
          <div className="text-8xl opacity-20">₿</div>
        </div>
        {/* Center badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-800">
            <Image
              src={asset.icon}
              alt={asset.symbol}
              width={32}
              height={32}
              className="object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {asset.symbol}/USD
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            $
            {asset.price.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {asset.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Chart and Week Change */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <MiniChart positive={asset.weekChange >= 0} />
          <div className="text-right">
            <span
              className={`text-lg font-bold ${
                asset.weekChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {asset.weekChange >= 0 ? "+" : ""}
              {asset.weekChange.toFixed(2)}%
            </span>
            <p className="text-xs text-gray-500">1W change</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stock Card Component
const StockCard = ({ asset }: { asset: StockAsset }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isPositive = asset.changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Flag Banner */}
      <div className="relative h-32 overflow-hidden">
        <Image
          src={`https://flagcdn.com/w640/${asset.countryFlag}.png`}
          alt={asset.country}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          unoptimized
        />
        {/* Center badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-800">
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {asset.symbol.slice(0, 2)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {asset.symbol}
        </h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{asset.name}</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            ${asset.price.toFixed(2)}
          </span>
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {asset.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Chart and Week Change */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <MiniChart positive={asset.weekChange >= 0} />
          <div className="text-right">
            <span
              className={`text-lg font-bold ${
                asset.weekChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {asset.weekChange >= 0 ? "+" : ""}
              {asset.weekChange.toFixed(2)}%
            </span>
            <p className="text-xs text-gray-500">1W change</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Commodity Card Component
const CommodityCard = ({ asset }: { asset: (typeof commodities)[0] }) => {
  const isPositive = asset.changePercent >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Gradient Banner */}
      <div className="relative h-32 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-400 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">{asset.icon}</span>
        </div>
        {/* Center badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-800">
            <span className="text-2xl">{asset.icon}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10 text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {asset.symbol}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            $
            {asset.price.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {asset.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Chart and Week Change */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <MiniChart positive={asset.weekChange >= 0} />
          <div className="text-right">
            <span
              className={`text-lg font-bold ${
                asset.weekChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {asset.weekChange >= 0 ? "+" : ""}
              {asset.weekChange.toFixed(2)}%
            </span>
            <p className="text-xs text-gray-500">1W change</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Assets Page
export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<
    "forex" | "stocks" | "crypto" | "commodities"
  >("forex");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("1W change");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "forex" as const, label: "Forex", count: forexPairs.length },
    { id: "stocks" as const, label: "Stocks", count: stockAssets.length },
    { id: "crypto" as const, label: "Crypto", count: cryptoAssets.length },
    {
      id: "commodities" as const,
      label: "Commodities",
      count: commodities.length,
    },
  ];

  // Filter data based on search
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case "forex":
        return forexPairs.filter(
          (p) =>
            p.symbol.toLowerCase().includes(term) ||
            p.name.toLowerCase().includes(term)
        );
      case "stocks":
        return stockAssets.filter(
          (s) =>
            s.symbol.toLowerCase().includes(term) ||
            s.name.toLowerCase().includes(term)
        );
      case "crypto":
        return cryptoAssets.filter(
          (c) =>
            c.symbol.toLowerCase().includes(term) ||
            c.name.toLowerCase().includes(term)
        );
      case "commodities":
        return commodities.filter(
          (c) =>
            c.symbol.toLowerCase().includes(term) ||
            c.name.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  // Get count label
  const getCountLabel = () => {
    switch (activeTab) {
      case "forex":
        return `${filteredData.length} Forex pairs (CFD)`;
      case "stocks":
        return `${filteredData.length} Stock CFDs`;
      case "crypto":
        return `${filteredData.length} Cryptocurrencies`;
      case "commodities":
        return `${filteredData.length} Commodities`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Section */}
      <div
        className="relative pt-20 pb-8"
        style={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-6xl text-white/20">
            BMW
          </div>
          <div className="absolute top-20 right-20 text-4xl text-white/20">
            Hertz
          </div>
          <div className="absolute bottom-10 left-1/4 text-5xl text-white/20">
            ₿
          </div>
          <div className="absolute bottom-20 right-1/4 text-4xl text-white/20">
            Ł
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Assets
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search by name or ticker"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-white rounded-xl shadow-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "text-gray-900 dark:text-white border-gray-900 dark:border-white"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getCountLabel()}
            </span>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                {sortBy}
                <ChevronDown className="w-4 h-4 text-orange-500" />
              </button>
            </div>
            <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              No assets found matching your search
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            <AnimatePresence>
              {activeTab === "forex" &&
                (filteredData as ForexPair[]).map((pair, i) => (
                  <ForexCard key={pair.symbol} pair={pair} />
                ))}
              {activeTab === "stocks" &&
                (filteredData as StockAsset[]).map((asset, i) => (
                  <StockCard key={asset.symbol} asset={asset} />
                ))}
              {activeTab === "crypto" &&
                (filteredData as CryptoAsset[]).map((asset, i) => (
                  <CryptoCard key={asset.symbol} asset={asset} />
                ))}
              {activeTab === "commodities" &&
                (filteredData as typeof commodities).map((asset, i) => (
                  <CommodityCard key={asset.symbol} asset={asset} />
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
