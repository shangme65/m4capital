"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  Search,
} from "lucide-react";

// Quote data interface
interface Quote {
  id: string;
  date: string;
  time: string;
  milliseconds?: string;
  bid: string;
  ask: string;
  quote: string;
  hasDetails?: boolean;
  details?: QuoteDetail[];
}

interface QuoteDetail {
  time: string;
  milliseconds: string;
  bid: string;
  ask: string;
  quote: string;
}

// Instrument interface
interface Instrument {
  id: string;
  name: string;
  symbol: string;
}

// Sample instruments
const instruments: Instrument[] = [
  { id: "eurusd", name: "EUR/USD", symbol: "EURUSD" },
  { id: "gbpusd", name: "GBP/USD", symbol: "GBPUSD" },
  { id: "usdjpy", name: "USD/JPY", symbol: "USDJPY" },
  { id: "btcusd", name: "BTC/USD", symbol: "BTCUSD" },
  { id: "ethusd", name: "ETH/USD", symbol: "ETHUSD" },
  { id: "xauusd", name: "XAU/USD (Gold)", symbol: "XAUUSD" },
  { id: "aapl", name: "Apple Inc.", symbol: "AAPL" },
  { id: "googl", name: "Alphabet Inc.", symbol: "GOOGL" },
  { id: "tsla", name: "Tesla Inc.", symbol: "TSLA" },
];

// Generate sample quote data
const generateSampleQuotes = (): Quote[] => {
  const quotes: Quote[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 1); // Yesterday

  for (let i = 0; i < 30; i++) {
    const time = new Date(baseDate);
    time.setSeconds(time.getSeconds() - i);

    const basePrice = 1.16255 + (Math.random() - 0.5) * 0.0005;
    const spread = 0.00001;

    const hasDetails = Math.random() > 0.5;
    const details: QuoteDetail[] = [];

    if (hasDetails) {
      // Generate sub-second details
      for (let j = 0; j < 3 + Math.floor(Math.random() * 4); j++) {
        const detailPrice = basePrice + (Math.random() - 0.5) * 0.0002;
        details.push({
          time: time.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          milliseconds: `.${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
          bid: detailPrice.toFixed(6),
          ask: (detailPrice + spread).toFixed(6),
          quote: (detailPrice + spread / 2).toFixed(6),
        });
      }
    }

    quotes.push({
      id: `quote-${i}`,
      date: time.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: time.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      bid: basePrice.toFixed(6),
      ask: (basePrice + spread).toFixed(6),
      quote: (basePrice + spread / 2).toFixed(6),
      hasDetails,
      details,
    });
  }

  return quotes;
};

export default function HistoricalQuotesPage() {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(
    instruments[0]
  );
  const [isInstrumentOpen, setIsInstrumentOpen] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());
  const [quotes] = useState<Quote[]>(generateSampleQuotes());
  const [isLoading, setIsLoading] = useState(false);

  const toggleQuoteExpand = (quoteId: string) => {
    const newExpanded = new Set(expandedQuotes);
    if (newExpanded.has(quoteId)) {
      newExpanded.delete(quoteId);
    } else {
      newExpanded.add(quoteId);
    }
    setExpandedQuotes(newExpanded);
  };

  const handleInstrumentSelect = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setIsInstrumentOpen(false);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  // Calculate date range for display
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const dateRangeStart = sevenDaysAgo.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Hero Section with Dark Purple/Gray Gradient */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Dark gradient background with chart pattern */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1f2937 0%, #374151 30%, #4b5563 60%, #374151 100%)",
          }}
        />

        {/* Chart pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='50' viewBox='0 0 100 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 L10 35 L20 38 L30 25 L40 30 L50 20 L60 25 L70 15 L80 22 L90 10 L100 18' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 100px",
          }}
        />

        {/* Currency symbols scattered */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute top-10 left-10 text-6xl text-white font-bold">
            €
          </div>
          <div className="absolute top-20 right-20 text-5xl text-white font-bold">
            $
          </div>
          <div className="absolute bottom-10 left-1/4 text-4xl text-white font-bold">
            £
          </div>
          <div className="absolute top-1/3 right-1/3 text-3xl text-white font-bold">
            ¥
          </div>
          <div className="absolute bottom-20 right-10 text-5xl text-white font-bold">
            ₿
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
              Historical Quotes
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Here you can find information about exchange rates of currency
              pairs and other financial instruments in different periods of
              time. You can view information about the quotes you need and use
              them when testing different strategies or applying technical
              analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          {/* Instrument Selector */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Instrument
            </label>
            <div className="flex items-center gap-2">
              {/* Dropdown */}
              <div className="relative flex-1 max-w-md">
                <button
                  onClick={() => setIsInstrumentOpen(!isInstrumentOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-left hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <span className="text-gray-900">
                    {isLoading ? "Loading..." : selectedInstrument.name}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-orange-500 transition-transform ${
                      isInstrumentOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isInstrumentOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {/* Search */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search instruments..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                      {instruments.map((instrument) => (
                        <button
                          key={instrument.id}
                          onClick={() => handleInstrumentSelect(instrument)}
                          className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                            selectedInstrument.id === instrument.id
                              ? "bg-orange-50 text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="font-medium">{instrument.name}</span>
                          <span className="text-gray-400 text-sm ml-2">
                            ({instrument.symbol})
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Calendar Button */}
              <button className="p-3 bg-white border border-gray-300 rounded-lg hover:border-orange-400 transition-colors">
                <Calendar className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Info Notice */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm leading-relaxed">
              Please note that the tick-by-tick quotes displayed in this section
              are relevant only for option contracts, so this section contains
              only information about trades executed on this trading instrument.
              Tick-by-tick quotes are only available for the past 7 days (from{" "}
              {dateRangeStart}). If you would like to receive data for a longer
              period, please contact{" "}
              <Link
                href="/contact"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Support
              </Link>
              .
            </p>
          </div>

          {/* Quotes Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="text-gray-500 text-sm font-medium">Date</div>
              <div className="text-gray-500 text-sm font-medium">Bid, Ask</div>
              <div className="text-gray-500 text-sm font-medium">Quotes</div>
              <div></div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  Loading quotes...
                </div>
              ) : (
                quotes.map((quote) => (
                  <div key={quote.id}>
                    {/* Main Quote Row */}
                    <div
                      className={`grid grid-cols-4 gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
                        quote.hasDetails ? "cursor-pointer" : ""
                      }`}
                      onClick={() =>
                        quote.hasDetails && toggleQuoteExpand(quote.id)
                      }
                    >
                      <div className="text-gray-600 text-sm">
                        <div>{quote.date},</div>
                        <div>{quote.time}</div>
                      </div>
                      <div className="text-gray-900 text-sm">
                        <div>{quote.bid}</div>
                        <div>{quote.ask}</div>
                      </div>
                      <div className="text-gray-900 text-sm font-medium">
                        {quote.quote}
                      </div>
                      <div className="flex justify-end">
                        {quote.hasDetails && (
                          <button className="p-1 text-orange-500 hover:bg-orange-50 rounded transition-colors">
                            {expandedQuotes.has(quote.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {quote.hasDetails && expandedQuotes.has(quote.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-gray-50/50"
                        >
                          {quote.details?.map((detail, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-4 gap-4 px-4 py-3 border-t border-gray-100"
                            >
                              <div className="text-gray-500 text-sm">
                                <span>{detail.time}</span>
                                <span className="text-orange-500 font-medium">
                                  {detail.milliseconds}
                                </span>
                              </div>
                              <div className="text-gray-700 text-sm">
                                <div>{detail.bid}</div>
                                <div>{detail.ask}</div>
                              </div>
                              <div className="text-gray-700 text-sm">
                                {detail.quote}
                              </div>
                              <div></div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="mt-6 text-gray-500 text-sm">
            <p>
              Financial quotes for the last <strong>30 minutes</strong> are not
              displayed. The quotes presented here apply only to Option
              contracts.
            </p>
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
              <span className="text-gray-700">Historical Quotes</span>
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
