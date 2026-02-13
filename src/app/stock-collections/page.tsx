"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Grid3X3, List, ChevronRight } from "lucide-react";

// Stock Collection interface
interface StockCollection {
  id: string;
  title: string;
  description?: string;
  image: string;
  stockCount: number;
  type: string;
  companyLogos: string[];
}

// Sample stock collections data (matching IQ Option style)
const stockCollections: StockCollection[] = [
  {
    id: "it-internet-blue-chips",
    title: "IT & Internet Blue Chips",
    description:
      "Internet companies are the greatest venues of opportunities for the investors and now you can choose your own unicorn.",
    image: "/stock-collections/it-internet.jpg",
    stockCount: 12,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/google.png",
      "/stock-collections/logos/amazon.png",
      "/stock-collections/logos/meta.png",
      "/stock-collections/logos/apple.png",
      "/stock-collections/logos/microsoft.png",
    ],
  },
  {
    id: "dividend-kings",
    title: "10 Dividend Kings",
    description: "",
    image: "/stock-collections/dividend-kings.jpg",
    stockCount: 11,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/cisco.png",
      "/stock-collections/logos/coca-cola.png",
      "/stock-collections/logos/microsoft.png",
      "/stock-collections/logos/capgemini.png",
      "/stock-collections/logos/exxon.png",
    ],
  },
  {
    id: "big-game-of-money",
    title: "Big Game of Money",
    description: "",
    image: "/stock-collections/banks.jpg",
    stockCount: 15,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/citi.png",
      "/stock-collections/logos/goldman.png",
      "/stock-collections/logos/jpmorgan.png",
      "/stock-collections/logos/amex.png",
      "/stock-collections/logos/bofa.png",
    ],
  },
  {
    id: "top-10-traded-2024",
    title: "Top 10 Traded Companies of 2024",
    description: "",
    image: "/stock-collections/stock-exchange.jpg",
    stockCount: 10,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/nvidia.png",
      "/stock-collections/logos/ge.png",
      "/stock-collections/logos/tesla.png",
      "/stock-collections/logos/apple.png",
      "/stock-collections/logos/amazon.png",
    ],
  },
  {
    id: "top-10-value-brands",
    title: "Top 10 Value Brands",
    description: "",
    image: "/stock-collections/times-square.jpg",
    stockCount: 10,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/lufthansa.png",
      "/stock-collections/logos/home-depot.png",
      "/stock-collections/logos/att.png",
      "/stock-collections/logos/costco.png",
      "/stock-collections/logos/lowes.png",
    ],
  },
  {
    id: "artificial-intelligence",
    title: "Artificial Intelligence Bets",
    description: "",
    image: "/stock-collections/ai.jpg",
    stockCount: 36,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/amazon.png",
      "/stock-collections/logos/apple.png",
      "/stock-collections/logos/adobe.png",
      "/stock-collections/logos/meta.png",
      "/stock-collections/logos/google.png",
    ],
  },
  {
    id: "top-10-revenue",
    title: "Top 10 Highest Revenue Earning Companies",
    description: "",
    image: "/stock-collections/revenue.jpg",
    stockCount: 18,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/amazon.png",
      "/stock-collections/logos/apple.png",
      "/stock-collections/logos/google.png",
      "/stock-collections/logos/berkshire.png",
      "/stock-collections/logos/costco.png",
    ],
  },
  {
    id: "top-10-rated",
    title: "Top 10 Rated Companies",
    description: "",
    image: "/stock-collections/rated.jpg",
    stockCount: 17,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/amazon.png",
      "/stock-collections/logos/meta.png",
      "/stock-collections/logos/microsoft.png",
      "/stock-collections/logos/salesforce.png",
      "/stock-collections/logos/mastercard.png",
    ],
  },
  {
    id: "revenue-boom",
    title: "Top 10 Revenue Boom Companies",
    description: "",
    image: "/stock-collections/revenue-boom.jpg",
    stockCount: 4,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/spotify.png",
      "/stock-collections/logos/grubhub.png",
      "/stock-collections/logos/monday.png",
      "/stock-collections/logos/uber.png",
    ],
  },
  {
    id: "most-shorted",
    title: "Most Shorted Stocks",
    description:
      "Stocks within the S&P 500 with highest percentage of shorted float.",
    image: "/stock-collections/shorted.jpg",
    stockCount: 8,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/tesla.png",
      "/stock-collections/logos/amc.png",
      "/stock-collections/logos/gamestop.png",
      "/stock-collections/logos/nvidia.png",
    ],
  },
  {
    id: "goldman-sachs-picks",
    title: "Top 5 Goldman Sachs Stock Picks 2024",
    description: "",
    image: "/stock-collections/goldman-picks.jpg",
    stockCount: 19,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/amazon.png",
      "/stock-collections/logos/apple.png",
      "/stock-collections/logos/google.png",
      "/stock-collections/logos/microsoft.png",
      "/stock-collections/logos/spotify.png",
    ],
  },
  {
    id: "top-10-performing-2024",
    title: "Top 10 Performing US Stocks 2024",
    description: "",
    image: "/stock-collections/performing.jpg",
    stockCount: 10,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/meta.png",
      "/stock-collections/logos/ge.png",
      "/stock-collections/logos/3m.png",
      "/stock-collections/logos/walmart.png",
      "/stock-collections/logos/caterpillar.png",
    ],
  },
  {
    id: "electric-vehicles",
    title: "Electric Vehicles Revolution",
    description: "",
    image: "/stock-collections/ev.jpg",
    stockCount: 8,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/tesla.png",
      "/stock-collections/logos/rivian.png",
      "/stock-collections/logos/nio.png",
      "/stock-collections/logos/ford.png",
      "/stock-collections/logos/gm.png",
    ],
  },
  {
    id: "healthcare-giants",
    title: "Healthcare Giants",
    description: "",
    image: "/stock-collections/healthcare.jpg",
    stockCount: 12,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/pfizer.png",
      "/stock-collections/logos/jnj.png",
      "/stock-collections/logos/merck.png",
      "/stock-collections/logos/unitedhealth.png",
      "/stock-collections/logos/abbvie.png",
    ],
  },
  {
    id: "energy-sector",
    title: "Energy Sector Leaders",
    description: "",
    image: "/stock-collections/energy.jpg",
    stockCount: 10,
    type: "Stocks (CFD)",
    companyLogos: [
      "/stock-collections/logos/exxon.png",
      "/stock-collections/logos/chevron.png",
      "/stock-collections/logos/shell.png",
      "/stock-collections/logos/conocophillips.png",
      "/stock-collections/logos/bp.png",
    ],
  },
];

// Placeholder images for collections without actual images
const placeholderImages: Record<string, string> = {
  "it-internet-blue-chips":
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
  "dividend-kings":
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  "big-game-of-money":
    "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&q=80",
  "top-10-traded-2024":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  "top-10-value-brands":
    "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&q=80",
  "artificial-intelligence":
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
  "top-10-revenue":
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  "top-10-rated":
    "https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800&q=80",
  "revenue-boom":
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  "most-shorted":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  "goldman-sachs-picks":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  "top-10-performing-2024":
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
  "electric-vehicles":
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
  "healthcare-giants":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&q=80",
  "energy-sector":
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
};

// Company logo placeholders using text
const getLogoPlaceholder = (index: number) => {
  const colors = [
    "bg-blue-600",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  const letters = ["A", "M", "G", "T", "N"];
  return { color: colors[index % 5], letter: letters[index % 5] };
};

// Collection Card Component
const CollectionCard = ({ collection }: { collection: StockCollection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = placeholderImages[collection.id] || collection.image;

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ aspectRatio: "1/1.2" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={collection.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Top - Empty for spacing */}
        <div />

        {/* Bottom Content */}
        <div>
          {/* Title */}
          <h3 className="text-white text-xl font-bold mb-2 leading-tight">
            {collection.title}
          </h3>

          {/* Description (if exists) */}
          {collection.description && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {collection.description}
            </p>
          )}

          {/* Company Logos & Stock Count */}
          <div className="flex items-center justify-between mt-4">
            {/* Company Logos */}
            <div className="flex items-center -space-x-2">
              {[0, 1, 2, 3, 4]
                .slice(0, Math.min(5, collection.stockCount))
                .map((index) => {
                  const logo = getLogoPlaceholder(index);
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full ${logo.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white/20`}
                    >
                      {logo.letter}
                    </div>
                  );
                })}
            </div>

            {/* Stock Count */}
            <div className="text-right">
              <div className="text-white font-bold text-lg">
                {collection.stockCount}
              </div>
              <div className="text-gray-400 text-xs">{collection.type}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-orange-500/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Bottom Gradient Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60" />
    </motion.div>
  );
};

export default function StockCollectionsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900" />

        <div className="relative container mx-auto max-w-6xl text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Stock Collections
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Pick from over a dozen different routes to smart investing. From big
            banks to the biggest IT companies: our Stock Collections have you
            covered.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header with count and view toggle */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-xl font-semibold">
              {stockCollections.length} collections
            </h2>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Collections Grid */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {stockCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CollectionCard collection={collection} />
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              * Information regarding past performance is not a reliable
              indicator of future performance.
            </p>
            <p className="text-gray-500 text-sm">
              ** Forecasts are not a reliable indicator of future performance
            </p>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="py-6 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-orange-500">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Stock Collections</span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Terms & Conditions
            </a>
            <span>{"|"}</span>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Contact Us
            </a>
            <span>{"|"}</span>
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Our Blog
            </a>
            <span>{"|"}</span>
            <a
              href="/vip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 flex items-center gap-1"
            >
              <span className="text-yellow-500">👑</span> VIP
            </a>
            <span>{"|"}</span>
            <a
              href="/site-map"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Sitemap
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
