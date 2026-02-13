"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Grid3X3,
  List,
  TrendingUp,
  TrendingDown,
  Zap,
  Box,
  Factory,
  ShoppingCart,
  ShoppingBag,
  Heart,
  Landmark,
  Cpu,
  Wifi,
  Lightbulb,
  Home,
} from "lucide-react";

// Industry interface
interface Industry {
  id: string;
  name: string;
  icon: React.ReactNode;
  monthlyChange: number;
  stockCount: number;
  companyAbbreviations: string[];
  gradient: string;
}

// Industries data matching IQ Option's categories
const industries: Industry[] = [
  {
    id: "energy",
    name: "Energy",
    icon: <Zap className="w-8 h-8" />,
    monthlyChange: -0.54,
    stockCount: 17,
    companyAbbreviations: ["CVX", "COP", "SLB", "EQT", "XOM"],
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0a1628 100%)",
  },
  {
    id: "materials",
    name: "Materials",
    icon: <Box className="w-8 h-8" />,
    monthlyChange: -0.3,
    stockCount: 10,
    companyAbbreviations: ["AA", "AXTA", "LIN", "FMC", "FCX"],
    gradient: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
  },
  {
    id: "industrials",
    name: "Industrials",
    icon: <Factory className="w-8 h-8" />,
    monthlyChange: 1.3,
    stockCount: 30,
    companyAbbreviations: ["GE", "3M", "LMT", "BA", "CAT"],
    gradient: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
  },
  {
    id: "consumer-discretionary",
    name: "Consumer Discretionary",
    icon: <ShoppingCart className="w-8 h-8" />,
    monthlyChange: -2.0,
    stockCount: 64,
    companyAbbreviations: ["AMZN", "GM", "MCD", "NKE", "SBUX"],
    gradient: "linear-gradient(135deg, #7c2d12 0%, #451a03 100%)",
  },
  {
    id: "consumer-staples",
    name: "Consumer Staples",
    icon: <ShoppingBag className="w-8 h-8" />,
    monthlyChange: -0.44,
    stockCount: 18,
    companyAbbreviations: ["KO", "PEP", "TGT", "COST", "HSY"],
    gradient: "linear-gradient(135deg, #9d174d 0%, #831843 100%)",
  },
  {
    id: "health-care",
    name: "Health Care",
    icon: <Heart className="w-8 h-8" />,
    monthlyChange: -0.8,
    stockCount: 28,
    companyAbbreviations: ["ABBV", "DGX", "A", "GEHC", "CVS"],
    gradient: "linear-gradient(135deg, #be185d 0%, #9d174d 100%)",
  },
  {
    id: "financials",
    name: "Financials",
    icon: <Landmark className="w-8 h-8" />,
    monthlyChange: -0.1,
    stockCount: 43,
    companyAbbreviations: ["C", "GS", "JPM", "MET", "AXP"],
    gradient: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
  },
  {
    id: "information-technology",
    name: "Information Technology",
    icon: <Cpu className="w-8 h-8" />,
    monthlyChange: 0.0,
    stockCount: 55,
    companyAbbreviations: ["AAPL", "CRM", "CSCO", "META", "GOOG"],
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",
  },
  {
    id: "communication-services",
    name: "Communication Services",
    icon: <Wifi className="w-8 h-8" />,
    monthlyChange: -1.24,
    stockCount: 8,
    companyAbbreviations: ["T", "VZ", "TMUS", "DTE", "TEF"],
    gradient: "linear-gradient(135deg, #0369a1 0%, #075985 100%)",
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: <Lightbulb className="w-8 h-8" />,
    monthlyChange: 0.0,
    stockCount: 13,
    companyAbbreviations: ["CEG", "DUK", "SO", "ETR", "FE"],
    gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  },
  {
    id: "real-estate",
    name: "Real Estate",
    icon: <Home className="w-8 h-8" />,
    monthlyChange: 2.55,
    stockCount: 9,
    companyAbbreviations: ["BXP", "DLR", "EQR", "ESS", "CBRE"],
    gradient: "linear-gradient(135deg, #166534 0%, #14532d 100%)",
  },
];

export default function IndustriesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-gray-900">
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

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              Industries
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              From established industries to booming new age up-and-comers —
              we&apos;ve gathered all of them to help you make smart investment
              decisions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industries Grid Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Header with count and view toggle */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              {industries.length} industries
            </h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Industries Grid */}
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }`}
          >
            {industries.map((industry, index) => (
              <motion.div
                key={industry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/industries/${industry.id}`}>
                  <div
                    className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                      viewMode === "list" ? "flex items-center" : ""
                    }`}
                  >
                    {/* Background with gradient */}
                    <div
                      className={`relative ${
                        viewMode === "grid" ? "h-64" : "w-48 h-32 flex-shrink-0"
                      }`}
                      style={{ background: industry.gradient }}
                    >
                      {/* Overlay pattern */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Icon in top right */}
                      <div className="absolute top-4 right-4 text-white/30 z-10 group-hover:text-white/50 transition-colors">
                        {industry.icon}
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {industry.name}
                        </h3>
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            industry.monthlyChange >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {industry.monthlyChange >= 0 ? "+" : ""}
                          {industry.monthlyChange}% per 1M
                        </div>

                        {/* Company Abbreviations and Stock Count */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center -space-x-1">
                            {industry.companyAbbreviations
                              .slice(0, 5)
                              .map((abbr, abbrIndex) => (
                                <div
                                  key={abbrIndex}
                                  className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-white flex items-center justify-center"
                                >
                                  <span className="text-[10px] font-bold text-gray-700">
                                    {abbr.slice(0, 2)}
                                  </span>
                                </div>
                              ))}
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-lg">
                              {industry.stockCount}
                            </div>
                            <div className="text-white/70 text-xs">
                              Stocks (CFD)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* List view additional content */}
                    {viewMode === "list" && (
                      <div className="flex-1 p-4 bg-white">
                        <h3 className="text-lg font-bold text-gray-900">
                          {industry.name}
                        </h3>
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            industry.monthlyChange >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {industry.monthlyChange >= 0 ? "+" : ""}
                          {industry.monthlyChange}% per 1M
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {industry.stockCount} Stocks (CFD)
                        </div>
                      </div>
                    )}

                    {/* Progress bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/30">
                      <div
                        className={`h-full ${
                          industry.monthlyChange >= 0
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.abs(industry.monthlyChange) * 20,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
