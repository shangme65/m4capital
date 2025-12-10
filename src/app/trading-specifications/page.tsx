"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronUp, Search, HelpCircle } from "lucide-react";

// Asset type definitions
type AssetType = "stocks" | "forex" | "cryptocurrencies";

interface TradingHours {
  days: string;
  hours: string[];
}

interface StockAsset {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  bgColor: string;
  textColor: string;
  tradingHours: TradingHours[];
  minSpread: string;
  maxLeverage: string;
  minMarginRequirement: string;
  longShortSwap: string;
}

interface ForexAsset {
  id: string;
  pair: string;
  ticker: string;
  flags: string[];
  tradingHours: TradingHours[];
  minSpreadPips: string;
  maxLeverage: string;
  minMarginRequirement: string;
  longShortSwap: string;
}

interface CryptoAsset {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  bgColor: string;
  textColor: string;
  tradingHours: TradingHours[];
  minSpread: string;
  maxLeverage: string;
  minMarginRequirement: string;
  longShortSwap: string;
}

// Sample Stocks data (based on IQ Option images)
const stocksData: StockAsset[] = [
  {
    id: "amzn",
    name: "Amazon.com, Inc.",
    ticker: "AMZN",
    logo: "a",
    bgColor: "bg-gray-900",
    textColor: "text-white",
    tradingHours: [
      {
        days: "Mon",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      {
        days: "Tue",
        hours: ["00:00 - 05:55", "06:05 - 21:00", "22:05 - 00:00"],
      },
      {
        days: "Wed - Thu",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      { days: "Fri", hours: ["00:00 - 05:55", "06:05 - 21:00"] },
      { days: "Sun", hours: ["22:05 - 00:00"] },
    ],
    minSpread: "0.043%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "aapl",
    name: "Apple Inc.",
    ticker: "AAPL",
    logo: "",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    tradingHours: [
      {
        days: "Mon",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      {
        days: "Tue",
        hours: ["00:00 - 05:55", "06:05 - 21:00", "22:05 - 00:00"],
      },
      {
        days: "Wed - Thu",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      { days: "Fri", hours: ["00:00 - 05:55", "06:05 - 21:00"] },
      { days: "Sun", hours: ["22:05 - 00:00"] },
    ],
    minSpread: "0.043%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "bidu",
    name: "Baidu, Inc. ADR",
    ticker: "BIDU",
    logo: "du",
    bgColor: "bg-gray-100",
    textColor: "text-blue-600",
    tradingHours: [{ days: "Mon - Fri", hours: ["11:30 - 18:00"] }],
    minSpread: "0.016%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "csco",
    name: "Cisco Systems, Inc.",
    ticker: "CSCO",
    logo: "cisco",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    tradingHours: [{ days: "Mon - Fri", hours: ["11:30 - 18:00"] }],
    minSpread: "0.013%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "meta",
    name: "Meta",
    ticker: "META",
    logo: "∞",
    bgColor: "bg-blue-500",
    textColor: "text-white",
    tradingHours: [
      {
        days: "Mon",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      {
        days: "Tue",
        hours: ["00:00 - 05:55", "06:05 - 21:00", "22:05 - 00:00"],
      },
      {
        days: "Wed - Thu",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      { days: "Fri", hours: ["00:00 - 05:55", "06:05 - 21:00"] },
      { days: "Sun", hours: ["22:05 - 00:00"] },
    ],
    minSpread: "0.029%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "googl",
    name: "Alphabet Inc. Class A",
    ticker: "GOOGL",
    logo: "G",
    bgColor: "bg-white",
    textColor: "text-blue-500",
    tradingHours: [{ days: "Mon - Fri", hours: ["11:30 - 18:00"] }],
    minSpread: "0.003%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "intc",
    name: "Intel Corporation",
    ticker: "INTC",
    logo: "intel",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    tradingHours: [{ days: "Mon - Fri", hours: ["11:30 - 18:00"] }],
    minSpread: "0.025%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "msft",
    name: "Microsoft Corporation",
    ticker: "MSFT",
    logo: "⊞",
    bgColor: "bg-white",
    textColor: "text-orange-500",
    tradingHours: [
      {
        days: "Mon",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      {
        days: "Tue",
        hours: ["00:00 - 05:55", "06:05 - 21:00", "22:05 - 00:00"],
      },
      {
        days: "Wed - Thu",
        hours: [
          "00:00 - 05:55",
          "06:05 - 21:00",
          "21:00 - 21:55",
          "22:05 - 00:00",
        ],
      },
      { days: "Fri", hours: ["00:00 - 05:55", "06:05 - 21:00"] },
      { days: "Sun", hours: ["22:05 - 00:00"] },
    ],
    minSpread: "0.098%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "c",
    name: "Citigroup, Inc.",
    ticker: "C",
    logo: "citi",
    bgColor: "bg-blue-700",
    textColor: "text-white",
    tradingHours: [{ days: "Mon - Fri", hours: ["11:30 - 18:00"] }],
    minSpread: "0.027%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
  {
    id: "ko",
    name: "Coca-Cola Company",
    ticker: "KO",
    logo: "🥤",
    bgColor: "bg-red-600",
    textColor: "text-white",
    tradingHours: [{ days: "Mon - Fri", hours: ["11:30 - 18:00"] }],
    minSpread: "0.014%",
    maxLeverage: "1:20",
    minMarginRequirement: "5%",
    longShortSwap: "-0.0438% / -0.0301%",
  },
];

// Sample Forex data
const forexData: ForexAsset[] = [
  {
    id: "eurusd",
    pair: "EUR/USD",
    ticker: "EURUSD",
    flags: ["🇪🇺", "🇺🇸"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "0.8",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0024% / -0.0027%",
  },
  {
    id: "eurgbp",
    pair: "EUR/GBP",
    ticker: "EURGBP",
    flags: ["🇪🇺", "🇬🇧"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0026% / -0.0030%",
  },
  {
    id: "gbpjpy",
    pair: "GBP/JPY",
    ticker: "GBPJPY",
    flags: ["🇬🇧", "🇯🇵"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "2.1",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0024% / -0.0032%",
  },
  {
    id: "eurjpy",
    pair: "EUR/JPY",
    ticker: "EURJPY",
    flags: ["🇪🇺", "🇯🇵"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1.3",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0026% / -0.0033%",
  },
  {
    id: "gbpusd",
    pair: "GBP/USD",
    ticker: "GBPUSD",
    flags: ["🇬🇧", "🇺🇸"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1.2",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0026% / -0.0032%",
  },
  {
    id: "usdjpy",
    pair: "USD/JPY",
    ticker: "USDJPY",
    flags: ["🇺🇸", "🇯🇵"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1.6",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0047% / -0.0063%",
  },
  {
    id: "usdchf",
    pair: "USD/CHF",
    ticker: "USDCHF",
    flags: ["🇺🇸", "🇨🇭"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1.1",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0028% / -0.0042%",
  },
  {
    id: "audusd",
    pair: "AUD/USD",
    ticker: "AUDUSD",
    flags: ["🇦🇺", "🇺🇸"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0044% / -0.0051%",
  },
  {
    id: "audcad",
    pair: "AUD/CAD",
    ticker: "AUDCAD",
    flags: ["🇦🇺", "🇨🇦"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "2.8",
    maxLeverage: "500",
    minMarginRequirement: "0.2%",
    longShortSwap: "-0.0044% / -0.0059%",
  },
  {
    id: "nzdusd",
    pair: "NZD/USD",
    ticker: "NZDUSD",
    flags: ["🇳🇿", "🇺🇸"],
    tradingHours: [
      { days: "Mon - Thu", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
      { days: "Fri", hours: ["00:00 - 19:00"] },
      { days: "Sun", hours: ["19:01 - 21:00", "21:00 - 00:00"] },
    ],
    minSpreadPips: "1.5",
    maxLeverage: "5000",
    minMarginRequirement: "0.02%",
    longShortSwap: "-0.0031% / -0.0042%",
  },
];

// Sample Crypto data
const cryptoData: CryptoAsset[] = [
  {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
    logo: "₿",
    bgColor: "bg-orange-500",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0%",
    maxLeverage: "1:5",
    minMarginRequirement: "20%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "xrp",
    name: "Ripple",
    ticker: "XRP",
    logo: "✕",
    bgColor: "bg-blue-400",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0.005%",
    maxLeverage: "1:5",
    minMarginRequirement: "20%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    logo: "◆",
    bgColor: "bg-gray-600",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0%",
    maxLeverage: "1:5",
    minMarginRequirement: "20%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "ltc",
    name: "Litecoin",
    ticker: "LTC",
    logo: "Ł",
    bgColor: "bg-gray-400",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0.012%",
    maxLeverage: "1:3",
    minMarginRequirement: "33.33%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "dash",
    name: "Dash",
    ticker: "DASH",
    logo: "D",
    bgColor: "bg-blue-500",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0.018%",
    maxLeverage: "1:3",
    minMarginRequirement: "33.33%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "ada",
    name: "Cardano",
    ticker: "ADA",
    logo: "₳",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0.02%",
    maxLeverage: "1:3",
    minMarginRequirement: "33.33%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "sol",
    name: "Solana",
    ticker: "SOL",
    logo: "◎",
    bgColor: "bg-gradient-to-r from-purple-500 to-green-400",
    textColor: "text-white",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0.01%",
    maxLeverage: "1:3",
    minMarginRequirement: "33.33%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
  {
    id: "doge",
    name: "Dogecoin",
    ticker: "DOGE",
    logo: "Ð",
    bgColor: "bg-yellow-400",
    textColor: "text-gray-800",
    tradingHours: [
      { days: "Mon - Sun", hours: ["00:00 - 21:00", "21:00 - 00:00"] },
    ],
    minSpread: "0.015%",
    maxLeverage: "1:3",
    minMarginRequirement: "33.33%",
    longShortSwap: "-0.2493% / -0.1397%",
  },
];

// Generate date range for schedule display
const getScheduleDateRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Get Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return `${monday.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} - ${sunday.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
};

export default function TradingSpecificationsPage() {
  const [activeTab, setActiveTab] = useState<AssetType>("stocks");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Filter assets based on search
  const filteredStocks = useMemo(() => {
    return stocksData.filter(
      (stock) =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredForex = useMemo(() => {
    return forexData.filter(
      (forex) =>
        forex.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forex.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredCrypto = useMemo(() => {
    return cryptoData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Get display count based on showAll
  const getDisplayData = () => {
    switch (activeTab) {
      case "stocks":
        return showAll ? filteredStocks : filteredStocks.slice(0, 10);
      case "forex":
        return showAll ? filteredForex : filteredForex.slice(0, 10);
      case "cryptocurrencies":
        return showAll ? filteredCrypto : filteredCrypto.slice(0, 10);
    }
  };

  const getTotalCount = () => {
    switch (activeTab) {
      case "stocks":
        return filteredStocks.length;
      case "forex":
        return filteredForex.length;
      case "cryptocurrencies":
        return filteredCrypto.length;
    }
  };

  const getRemainingCount = () => {
    const total = getTotalCount();
    const displayed = getDisplayData().length;
    return total - displayed;
  };

  // Render Stock Card
  const renderStockCard = (stock: StockAsset) => (
    <div
      key={stock.id}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div
          className={`w-10 h-10 rounded-lg ${stock.bgColor} ${stock.textColor} flex items-center justify-center text-sm font-bold`}
        >
          {stock.logo === "" ? "🍎" : stock.logo}
        </div>
        <div>
          <div className="font-medium text-gray-900">{stock.name}</div>
          <div className="text-gray-500 text-sm">{stock.ticker}</div>
        </div>
      </div>

      {/* Trading Hours */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex items-start">
          <span className="text-gray-500 text-sm w-32 flex-shrink-0">
            Trading hours
          </span>
          <div className="flex-1">
            {stock.tradingHours.map((schedule, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span className="text-gray-700 text-sm">{schedule.days}</span>
                <span className="text-gray-900 text-sm text-right">
                  {schedule.hours.map((h, i) => (
                    <span key={i} className="block">
                      {h}
                      {i < schedule.hours.length - 1 ? "," : ""}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="py-2 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Min spread <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{stock.minSpread}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Max leverage <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{stock.maxLeverage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Min Margin Requirement</span>
          <span className="text-gray-900 text-sm">
            {stock.minMarginRequirement}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Long/Short swap <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{stock.longShortSwap}</span>
        </div>
      </div>
    </div>
  );

  // Render Forex Card
  const renderForexCard = (forex: ForexAsset) => (
    <div
      key={forex.id}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div className="flex items-center -space-x-1">
          {forex.flags.map((flag, idx) => (
            <span key={idx} className="text-2xl">
              {flag}
            </span>
          ))}
        </div>
        <div>
          <div className="font-medium text-gray-900">{forex.pair}</div>
          <div className="text-gray-500 text-sm">{forex.ticker}</div>
        </div>
      </div>

      {/* Trading Hours */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex items-start">
          <span className="text-gray-500 text-sm w-32 flex-shrink-0">
            Trading hours
          </span>
          <div className="flex-1">
            {forex.tradingHours.map((schedule, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span className="text-gray-700 text-sm">{schedule.days}</span>
                <span className="text-gray-900 text-sm text-right">
                  {schedule.hours.map((h, i) => (
                    <span key={i} className="block">
                      {h}
                      {i < schedule.hours.length - 1 ? "," : ""}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="py-2 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Min spread (pips) <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{forex.minSpreadPips}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Max leverage <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{forex.maxLeverage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Min Margin Requirement</span>
          <span className="text-gray-900 text-sm">
            {forex.minMarginRequirement}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Long/Short swap <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{forex.longShortSwap}</span>
        </div>
      </div>
    </div>
  );

  // Render Crypto Card
  const renderCryptoCard = (crypto: CryptoAsset) => (
    <div
      key={crypto.id}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div
          className={`w-10 h-10 rounded-full ${crypto.bgColor} ${crypto.textColor} flex items-center justify-center text-lg font-bold`}
        >
          {crypto.logo}
        </div>
        <div>
          <div className="font-medium text-gray-900">{crypto.name}</div>
          <div className="text-gray-500 text-sm">{crypto.ticker}</div>
        </div>
      </div>

      {/* Trading Hours */}
      <div className="py-3 border-b border-gray-100">
        <div className="flex items-start">
          <span className="text-gray-500 text-sm w-32 flex-shrink-0">
            Trading hours
          </span>
          <div className="flex-1">
            {crypto.tradingHours.map((schedule, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span className="text-gray-700 text-sm">{schedule.days}</span>
                <span className="text-gray-900 text-sm text-right">
                  {schedule.hours.map((h, i) => (
                    <span key={i} className="block">
                      {h}
                      {i < schedule.hours.length - 1 ? "," : ""}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="py-2 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Min spread <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{crypto.minSpread}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Max leverage <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{crypto.maxLeverage}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Min Margin Requirement</span>
          <span className="text-gray-900 text-sm">
            {crypto.minMarginRequirement}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            Long/Short swap <HelpCircle className="w-3 h-3 text-gray-400" />
          </span>
          <span className="text-gray-900 text-sm">{crypto.longShortSwap}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Hero Section with Purple Gradient */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #6d28d9 60%, #7c3aed 100%)",
          }}
        />

        {/* Numbers pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='40' font-family='Arial' font-size='24' fill='%23ffffff'%3E24088%3C/text%3E%3Ctext x='120' y='30' font-family='Arial' font-size='20' fill='%23ffffff'%3E934%3C/text%3E%3Ctext x='60' y='80' font-family='Arial' font-size='28' fill='%23ffffff'%3E5125%3C/text%3E%3Ctext x='20' y='120' font-family='Arial' font-size='18' fill='%23ffffff'%3E8572%3C/text%3E%3Ctext x='140' y='100' font-family='Arial' font-size='22' fill='%23ffffff'%3E026%3C/text%3E%3Ctext x='80' y='150' font-family='Arial' font-size='26' fill='%23ffffff'%3E0726%3C/text%3E%3Ctext x='150' y='170' font-family='Arial' font-size='20' fill='%23ffffff'%3E19%3C/text%3E%3Ctext x='30' y='180' font-family='Arial' font-size='16' fill='%23ffffff'%3E69%3C/text%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trading Specifications
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Below are all the fees charged for using our financial
              instruments,
              <br className="hidden md:block" />
              as well as a detailed trading schedule.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <button
              onClick={() => {
                setActiveTab("stocks");
                setShowAll(false);
              }}
              className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "stocks"
                  ? "text-gray-900 border-orange-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => {
                setActiveTab("forex");
                setShowAll(false);
              }}
              className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "forex"
                  ? "text-gray-900 border-orange-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              Forex
            </button>
            <button
              onClick={() => {
                setActiveTab("cryptocurrencies");
                setShowAll(false);
              }}
              className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "cryptocurrencies"
                  ? "text-gray-900 border-orange-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              Cryptocurrencies
            </button>
          </div>

          {/* Asset Count */}
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === "stocks" && `${stocksData.length} Stocks (CFD)`}
              {activeTab === "forex" && `${forexData.length} Forex Pairs (CFD)`}
              {activeTab === "cryptocurrencies" &&
                `${cryptoData.length} Cryptocurrencies (CFD)`}
            </h2>
            {activeTab === "forex" && (
              <Link
                href="/for-traders/forex"
                className="text-orange-500 hover:underline text-sm"
              >
                Learn more about forex basics
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by name or ticker"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Schedule Note */}
          <p className="text-gray-500 text-sm mb-6">
            This schedule covers the period {getScheduleDateRange()}. The
            trading schedule is automatically updated every Monday.
          </p>

          {/* Asset Cards */}
          <div>
            {activeTab === "stocks" && (
              <>{(getDisplayData() as StockAsset[]).map(renderStockCard)}</>
            )}
            {activeTab === "forex" && (
              <>{(getDisplayData() as ForexAsset[]).map(renderForexCard)}</>
            )}
            {activeTab === "cryptocurrencies" && (
              <>{(getDisplayData() as CryptoAsset[]).map(renderCryptoCard)}</>
            )}
          </div>

          {/* Show More Button */}
          {!showAll && getRemainingCount() > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-orange-500 font-medium hover:bg-orange-50 transition-colors border border-gray-200 rounded-lg"
            >
              Show More ({getRemainingCount()})
            </button>
          )}

          {/* Disclaimer Text */}
          <div className="mt-8 space-y-6 text-gray-600 text-sm">
            <p>
              The spread may vary depending on market conditions and liquidity.
              Under certain circumstances, the spread may be higher or lower
              than the level shown in our table. Please also note that overnight
              funding may be charged for holding open positions.
            </p>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Other Fees</h3>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">
                Inactive Account Fee
              </h4>
              <p>
                If for 90 (Ninety) consecutive calendar days or more the Client
                does not place orders to make trades/transactions
                (&quot;Inactive Account&quot;), the Company reserves the right
                to charge an Inactive Account fee of EUR 10, which will be
                deducted monthly from the Client&apos;s account balance until
                the Account becomes active again (&quot;Fee&quot;). The Fee
                shall not exceed the total balance of the Client&apos;s Account.
              </p>

              <h4 className="font-bold text-gray-800 mt-4 mb-2">
                Termination fees
              </h4>
              <p>
                In cases where the remaining balance in the client&apos;s
                account is equal to or less than €5, the Company reserves the
                right to charge up to €5* (five euros or its equivalent amount
                in another currency on the day of the deduction of the fee) for
                closing the account due to lack of verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Partners Section */}
      <section className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-2xl font-bold text-purple-600">Skrill</div>
            <div className="text-2xl font-bold text-gray-700">volet</div>
            <div className="text-2xl font-bold text-green-600">NETELLER</div>
          </div>
          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-orange-500">
                Home
              </Link>
              <span className="text-orange-500">▸</span>
              <span className="text-gray-700">Trading Specifications</span>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-2 border border-orange-500 rounded-full text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Risk Warning Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Links */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6 text-sm">
              <Link
                href="/terms"
                className="text-gray-600 hover:text-orange-500"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="text-gray-600 hover:text-orange-500">
                Affiliate Program
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/news"
                className="text-gray-600 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="#"
                className="text-gray-600 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="text-gray-600 hover:text-orange-500">
                Sitemap
              </Link>
            </div>

            {/* Risk Warning Box */}
            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-700 rounded-full"></span>
                RISK WARNING:
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The Financial Products offered by the company include Contracts
                for Difference (&apos;CFDs&apos;) and other complex financial
                products. Trading CFDs carries a high level of risk, since
                leverage can work both to your advantage and disadvantage. As a
                result, CFDs may not be suitable for all investors because it is
                possible to lose all of your invested capital. You should never
                invest money that you cannot afford to lose. Before trading in
                the complex financial products offered, please ensure you
                understand the risks involved.
              </p>
            </div>

            <p className="text-gray-500 text-sm mt-6 text-center">
              You are granted limited non-exclusive non-transferable rights to
              use the IP provided on this website for personal and
              non-commercial purposes in relation to the services offered on the
              Website only.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
