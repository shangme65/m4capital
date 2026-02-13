"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronUp,
  Calendar,
  Filter,
  FileText,
  Volume2,
  Sun,
  Moon,
} from "lucide-react";

// Economic Event interface
interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  countryCode: string;
  countryFlag: string;
  event: string;
  volatility: 1 | 2 | 3; // 1 = low, 2 = medium, 3 = high
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  isSpeech?: boolean;
}

// Earnings Event interface
interface EarningsEvent {
  id: string;
  company: string;
  ticker: string;
  logo: string;
  period: string;
  marketTiming: "before" | "after";
  actual: string | null;
  forecast: string | null;
  previous: string | null;
}

// Country flags mapping
const countryFlags: Record<string, string> = {
  CNH: "🇨🇳",
  CNY: "🇨🇳",
  EUR: "🇩🇪",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  NZD: "🇳🇿",
  BRL: "🇧🇷",
  MXN: "🇲🇽",
};

// Sample economic events data (realistic data based on images)
const economicEventsData: Record<string, EconomicEvent[]> = {
  "2025-12-08": [
    {
      id: "e1",
      time: "00:00",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "Balance of Trade",
      volatility: 3,
      actual: "$111.68B",
      forecast: "$100.2B",
      previous: "$90.07B",
    },
    {
      id: "e2",
      time: "00:00",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "Exports YoY",
      volatility: 3,
      actual: "5.9%",
      forecast: "3.8%",
      previous: "-1.1%",
    },
    {
      id: "e3",
      time: "00:00",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "Imports YoY",
      volatility: 3,
      actual: "1.9%",
      forecast: "2.8%",
      previous: "1%",
    },
    {
      id: "e4",
      time: "00:00",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "Balance of Trade (Yuan)",
      volatility: 3,
      actual: "792.58 B",
      forecast: "-",
      previous: "640.49 B",
    },
    {
      id: "e5",
      time: "04:00",
      currency: "EUR",
      countryCode: "DE",
      countryFlag: "🇩🇪",
      event: "Industrial Production MoM",
      volatility: 2,
      actual: "1.8%",
      forecast: "-0.4%",
      previous: "1.1%",
    },
    {
      id: "e6",
      time: "05:00",
      currency: "CHF",
      countryCode: "CH",
      countryFlag: "🇨🇭",
      event: "Consumer Confidence",
      volatility: 2,
      actual: "-34",
      forecast: "-34",
      previous: "-37",
    },
    {
      id: "e7",
      time: "08:30",
      currency: "BRL",
      countryCode: "BR",
      countryFlag: "🇧🇷",
      event: "BCB Focus Market Readout",
      volatility: 2,
      actual: "-",
      forecast: "-",
      previous: "-",
    },
    {
      id: "e8",
      time: "21:01",
      currency: "GBP",
      countryCode: "GB",
      countryFlag: "🇬🇧",
      event: "BRC Retail Sales Monitor YoY",
      volatility: 2,
      actual: "1.2%",
      forecast: "2.4%",
      previous: "1.5%",
    },
    {
      id: "e9",
      time: "21:30",
      currency: "AUD",
      countryCode: "AU",
      countryFlag: "🇦🇺",
      event: "NAB Business Confidence",
      volatility: 3,
      actual: "1",
      forecast: "-",
      previous: "6",
    },
  ],
  "2025-12-09": [
    {
      id: "e10",
      time: "00:30",
      currency: "AUD",
      countryCode: "AU",
      countryFlag: "🇦🇺",
      event: "RBA Interest Rate Decision",
      volatility: 3,
      actual: "3.6%",
      forecast: "3.6%",
      previous: "3.6%",
    },
    {
      id: "e11",
      time: "01:30",
      currency: "AUD",
      countryCode: "AU",
      countryFlag: "🇦🇺",
      event: "RBA Press Conference",
      volatility: 2,
      actual: "-",
      forecast: "-",
      previous: "-",
      isSpeech: true,
    },
    {
      id: "e12",
      time: "04:00",
      currency: "EUR",
      countryCode: "DE",
      countryFlag: "🇩🇪",
      event: "Balance of Trade",
      volatility: 3,
      actual: "€16.9B",
      forecast: "€15.2B",
      previous: "€15.3B",
    },
    {
      id: "e13",
      time: "04:00",
      currency: "EUR",
      countryCode: "DE",
      countryFlag: "🇩🇪",
      event: "Exports MoM",
      volatility: 2,
      actual: "0.1%",
      forecast: "-0.2%",
      previous: "1.5%",
    },
    {
      id: "e14",
      time: "06:00",
      currency: "JPY",
      countryCode: "JP",
      countryFlag: "🇯🇵",
      event: "BOJ Gov Ueda Speech",
      volatility: 2,
      actual: "-",
      forecast: "-",
      previous: "-",
      isSpeech: true,
    },
    {
      id: "e15",
      time: "07:45",
      currency: "GBP",
      countryCode: "GB",
      countryFlag: "🇬🇧",
      event: "BOE Gov Bailey Speech",
      volatility: 2,
      actual: "-",
      forecast: "-",
      previous: "-",
      isSpeech: true,
    },
    {
      id: "e16",
      time: "09:00",
      currency: "MXN",
      countryCode: "MX",
      countryFlag: "🇲🇽",
      event: "Inflation Rate MoM",
      volatility: 2,
      actual: "0.66%",
      forecast: "0.56%",
      previous: "0.36%",
    },
    {
      id: "e17",
      time: "09:00",
      currency: "MXN",
      countryCode: "MX",
      countryFlag: "🇲🇽",
      event: "Inflation Rate YoY",
      volatility: 2,
      actual: "3.8%",
      forecast: "3.69%",
      previous: "3.57%",
    },
    {
      id: "e18",
      time: "10:15",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "ADP Employment Change Weekly",
      volatility: 2,
      actual: "4.75K",
      forecast: "-",
      previous: "-13.5K",
    },
    {
      id: "e19",
      time: "10:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "Unit Labour Costs QoQ Prel",
      volatility: 2,
      actual: "-",
      forecast: "1%",
      previous: "1%",
    },
    {
      id: "e20",
      time: "10:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "Nonfarm Productivity QoQ Prel",
      volatility: 2,
      actual: "-",
      forecast: "3%",
      previous: "3.3%",
    },
    {
      id: "e21",
      time: "12:00",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "JOLTs Job Openings",
      volatility: 3,
      actual: "7.658M",
      forecast: "7.2M",
      previous: "7.227M",
    },
    {
      id: "e22",
      time: "18:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "API Crude Oil Stock Change",
      volatility: 2,
      actual: "-4.8M",
      forecast: "-1.7M",
      previous: "-2.48M",
    },
    {
      id: "e23",
      time: "22:30",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "Inflation Rate MoM",
      volatility: 2,
      actual: "-",
      forecast: "0.2%",
      previous: "0.2%",
    },
    {
      id: "e24",
      time: "22:30",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "Inflation Rate YoY",
      volatility: 3,
      actual: "-",
      forecast: "0.7%",
      previous: "0.2%",
    },
    {
      id: "e25",
      time: "22:30",
      currency: "CNH",
      countryCode: "CN",
      countryFlag: "🇨🇳",
      event: "PPI YoY",
      volatility: 2,
      actual: "-",
      forecast: "-2%",
      previous: "-2.1%",
    },
  ],
  "2025-12-10": [
    {
      id: "e26",
      time: "07:00",
      currency: "EUR",
      countryCode: "DE",
      countryFlag: "🇩🇪",
      event: "CPI Final YoY",
      volatility: 3,
      actual: "-",
      forecast: "2.2%",
      previous: "2.0%",
    },
    {
      id: "e27",
      time: "10:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "CPI MoM",
      volatility: 3,
      actual: "-",
      forecast: "0.3%",
      previous: "0.2%",
    },
    {
      id: "e28",
      time: "10:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "Core CPI MoM",
      volatility: 3,
      actual: "-",
      forecast: "0.3%",
      previous: "0.3%",
    },
  ],
  "2025-12-11": [
    {
      id: "e29",
      time: "09:15",
      currency: "EUR",
      countryCode: "EU",
      countryFlag: "🇪🇺",
      event: "ECB Interest Rate Decision",
      volatility: 3,
      actual: "-",
      forecast: "3.15%",
      previous: "3.4%",
    },
    {
      id: "e30",
      time: "10:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "Initial Jobless Claims",
      volatility: 2,
      actual: "-",
      forecast: "220K",
      previous: "224K",
    },
  ],
  "2025-12-12": [
    {
      id: "e31",
      time: "10:30",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "PPI MoM",
      volatility: 2,
      actual: "-",
      forecast: "0.2%",
      previous: "0.2%",
    },
  ],
  "2025-12-13": [
    {
      id: "e32",
      time: "10:00",
      currency: "USD",
      countryCode: "US",
      countryFlag: "🇺🇸",
      event: "Michigan Consumer Sentiment Prel",
      volatility: 2,
      actual: "-",
      forecast: "73.0",
      previous: "71.8",
    },
  ],
};

// Sample earnings data
const earningsEventsData: Record<string, EarningsEvent[]> = {
  "2025-12-09": [
    {
      id: "earn1",
      company: "Adobe Inc.",
      ticker: "ADBE:US",
      logo: "/earnings/adobe.png",
      period: "11/2025",
      marketTiming: "after",
      actual: "-",
      forecast: "5.40",
      previous: "4.81",
    },
  ],
  "2025-12-10": [
    {
      id: "earn2",
      company: "GameStop Corp.",
      ticker: "GME:US",
      logo: "/earnings/gamestop.png",
      period: "10/2025",
      marketTiming: "after",
      actual: "-",
      forecast: "-0.03",
      previous: "0.06",
    },
  ],
  "2025-12-11": [
    {
      id: "earn3",
      company: "Broadcom Inc.",
      ticker: "AVGO:US",
      logo: "/earnings/broadcom.png",
      period: "10/2025",
      marketTiming: "after",
      actual: "-",
      forecast: "1.39",
      previous: "1.24",
    },
    {
      id: "earn4",
      company: "Costco Wholesale",
      ticker: "COST:US",
      logo: "/earnings/costco.png",
      period: "11/2025",
      marketTiming: "after",
      actual: "-",
      forecast: "3.79",
      previous: "3.58",
    },
  ],
  "2025-12-12": [
    {
      id: "earn5",
      company: "Oracle Corporation",
      ticker: "ORCL:US",
      logo: "/earnings/oracle.png",
      period: "11/2025",
      marketTiming: "after",
      actual: "-",
      forecast: "1.48",
      previous: "1.41",
    },
  ],
};

// Generate date range
const generateDateRange = () => {
  const dates = [];
  const today = new Date();
  // Start from 2 days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 2);

  for (let i = 0; i < 6; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push({
      date: date,
      dayNum: date.getDate(),
      month: date.toLocaleString("en-US", { month: "short" }),
      dayName: date.toLocaleString("en-US", { weekday: "long" }),
      fullDate: date.toISOString().split("T")[0],
    });
  }
  return dates;
};

export default function CalendarsPage() {
  const [activeTab, setActiveTab] = useState<"economic" | "earnings">(
    "economic"
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const dates = useMemo(() => generateDateRange(), []);

  // Get current time string
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Get timezone offset
  const getTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const sign = offset > 0 ? "-" : "+";
    return `UTC ${sign}${hours.toString().padStart(2, "0")}:00`;
  };

  // Get date range display
  const getDateRangeDisplay = () => {
    const startDate = dates[0].date;
    const endDate = dates[dates.length - 1].date;
    return `${startDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })} - ${endDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  // Get events for selected date
  const selectedDate = dates[selectedDateIndex];
  const economicEvents = economicEventsData[selectedDate.fullDate] || [];
  const earningsEvents = earningsEventsData[selectedDate.fullDate] || [];

  // Render volatility flames
  const renderVolatility = (level: 1 | 2 | 3) => {
    return (
      <span className="flex items-center gap-0.5">
        <span className={level >= 1 ? "text-orange-500" : "text-gray-300"}>
          🔥
        </span>
        <span className={level >= 2 ? "text-orange-500" : "text-gray-300"}>
          🔥
        </span>
        <span className={level >= 3 ? "text-orange-500" : "text-gray-300"}>
          🔥
        </span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Purple Gradient */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #7c3aed 0%, #6d28d9 30%, #5b21b6 60%, #4c1d95 100%)",
          }}
        />

        {/* Calendar pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Crect x='10' y='10' width='15' height='15' rx='2'/%3E%3Crect x='32' y='10' width='15' height='15' rx='2'/%3E%3Crect x='54' y='10' width='15' height='15' rx='2'/%3E%3Crect x='10' y='32' width='15' height='15' rx='2'/%3E%3Crect x='32' y='32' width='15' height='15' rx='2'/%3E%3Crect x='54' y='32' width='15' height='15' rx='2'/%3E%3Crect x='10' y='54' width='15' height='15' rx='2'/%3E%3Crect x='32' y='54' width='15' height='15' rx='2'/%3E%3Crect x='54' y='54' width='15' height='15' rx='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Calendar numbers scattered */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-10 left-10 text-6xl text-white font-bold">
            7
          </div>
          <div className="absolute top-20 right-20 text-5xl text-white font-bold">
            14
          </div>
          <div className="absolute bottom-10 left-1/4 text-4xl text-white font-bold">
            TODAY
          </div>
          <div className="absolute top-1/3 right-1/3 text-3xl text-white font-bold">
            23
          </div>
          <div className="absolute bottom-20 right-10 text-5xl text-white font-bold">
            MORE
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Calendars
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Stay on top of things by tracking upcoming economic events and
              earnings forecasts with our Calendar.
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
              onClick={() => setActiveTab("economic")}
              className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "economic"
                  ? "text-gray-900 border-orange-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              Economic
            </button>
            <button
              onClick={() => setActiveTab("earnings")}
              className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
                activeTab === "earnings"
                  ? "text-gray-900 border-orange-500"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              Earnings
            </button>
          </div>

          {/* Current Time */}
          <div className="text-center mb-6">
            <span className="text-gray-500">Current time: </span>
            <span className="font-medium text-gray-900">
              {getCurrentTime()}
            </span>
            <span className="text-gray-500 ml-1">({getTimezoneOffset()})</span>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg">
              <span className="text-gray-700">{getDateRangeDisplay()}</span>
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <button className="p-3 bg-white border border-gray-300 rounded-lg hover:border-orange-400 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Date Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {dates.map((date, index) => (
              <button
                key={date.fullDate}
                onClick={() => setSelectedDateIndex(index)}
                className={`px-4 py-3 rounded-lg border whitespace-nowrap transition-all ${
                  selectedDateIndex === index
                    ? "bg-white border-gray-300 shadow-md font-medium"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-white"
                }`}
              >
                {date.dayNum} {date.month}
              </button>
            ))}
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="col-span-2 text-gray-500 text-sm font-medium">
                Time
              </div>
              <div className="col-span-6 text-gray-500 text-sm font-medium">
                {activeTab === "economic" ? "Event" : "Company"}
              </div>
              <div className="col-span-4 text-gray-500 text-sm font-medium text-right">
                Data
              </div>
            </div>

            {/* Date Header */}
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
              <span className="font-medium text-gray-900">
                {selectedDate.dayName},{" "}
                {selectedDate.date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Events */}
            {activeTab === "economic" ? (
              economicEvents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {economicEvents.map((event) => (
                    <div
                      key={event.id}
                      className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Time */}
                      <div className="col-span-2 text-gray-500 text-sm">
                        {event.time}
                      </div>

                      {/* Event Details */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{event.countryFlag}</span>
                          <span className="font-medium text-gray-900">
                            {event.currency}
                          </span>
                          {renderVolatility(event.volatility)}
                        </div>
                        <div className="text-gray-700 flex items-center gap-2">
                          {event.event}
                          {event.isSpeech && (
                            <Volume2 className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                      </div>

                      {/* Data */}
                      <div className="col-span-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">A:</span>
                          <span className="font-medium text-gray-900 min-w-[60px]">
                            {event.actual || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">F:</span>
                          <span
                            className={`font-medium min-w-[60px] ${
                              event.forecast && event.forecast !== "-"
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
                            {event.forecast || "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">P:</span>
                          <span className="font-medium text-gray-900 min-w-[60px]">
                            {event.previous || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center text-gray-500">
                  No economic events scheduled for this date.
                </div>
              )
            ) : earningsEvents.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {earningsEvents.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Company Logo */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold">
                        {event.company[0]}
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="col-span-6">
                      <div className="font-medium text-gray-900">
                        {event.company}{" "}
                        <span className="text-gray-500 font-normal">
                          {event.ticker}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm flex items-center gap-2">
                        {event.period}
                        {event.marketTiming === "before" ? (
                          <Sun className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Moon className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>

                    {/* Data */}
                    <div className="col-span-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-500">A:</span>
                        <span className="font-medium text-gray-900 min-w-[60px]">
                          {event.actual || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-500">F:</span>
                        <span className="font-medium text-green-500 min-w-[60px]">
                          {event.forecast || "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-500">P:</span>
                        <span className="font-medium text-gray-900 min-w-[60px]">
                          {event.previous || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-12 text-center text-gray-500">
                No earnings reports scheduled for this date.
              </div>
            )}
          </div>

          {/* Legend Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Symbols</h3>

            {/* Volatility Legend */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <span className="flex">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-gray-300">🔥</span>
                  <span className="text-gray-300">🔥</span>
                </span>
                <span className="text-gray-600">Low Volatility Expected</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-orange-500">🔥</span>
                  <span className="text-gray-300">🔥</span>
                </span>
                <span className="text-gray-600">
                  Medium Volatility Expected
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-orange-500">🔥</span>
                  <span className="text-orange-500">🔥</span>
                </span>
                <span className="text-gray-600">High Volatility Expected</span>
              </div>
            </div>

            {/* Icon Legend */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Report</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600">Speech</span>
              </div>
            </div>

            {/* Data Legend */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">A:</span>
                <span className="text-gray-600">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">F:</span>
                <span className="text-gray-600">Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">P:</span>
                <span className="text-gray-600">Previous</span>
              </div>
            </div>

            {/* Earnings timing legend (only for earnings tab) */}
            {activeTab === "earnings" && (
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-600">Before Market Opens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-600">After Market Closes</span>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mt-6">
              <strong>The economic calendar</strong> is a chronology of all
              major events in the financial world: news that helps us understand
              how the market is moving at any given moment. Speeches from heads
              of state of Great Britain and Japan, reports on unemployment in
              the USA and Europe, inflation indices, GDP and oil resource
              forecasts — all of it influences the attitudes of market
              participants. That is why a sound economic calendar is a primary
              need for every trader.
            </p>
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
              <span className="text-gray-700">Calendars</span>
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
              <span className="text-gray-300">{"|"}</span>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-300">{"|"}</span>
              <Link
                href="/news"
                className="text-gray-600 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-300">{"|"}</span>
              <Link
                href="#"
                className="text-gray-600 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-300">{"|"}</span>
              <Link href="/site-map" className="text-gray-600 hover:text-orange-500">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
