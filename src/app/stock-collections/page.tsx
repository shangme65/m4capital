"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
      <Header />

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

      {/* Payment Partners */}
      <section className="py-8 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-60">
            <div className="text-2xl font-bold text-purple-500">Skrill</div>
            <div className="text-2xl font-bold text-gray-400">volet</div>
            <div className="text-2xl font-bold text-green-500">NETELLER</div>
            <div className="text-2xl font-bold text-blue-500">VISA</div>
            <div className="text-2xl font-bold text-red-500">Mastercard</div>
          </div>
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? "bg-white" : "bg-gray-600"
                }`}
              />
            ))}
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
            <span>|</span>
            <a
              href="/affiliate"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Affiliate Program
            </a>
            <span>|</span>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Contact Us
            </a>
            <span>|</span>
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Our Blog
            </a>
            <span>|</span>
            <a
              href="/vip"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500 flex items-center gap-1"
            >
              <span className="text-yellow-500">👑</span> VIP
            </a>
            <span>|</span>
            <a
              href="/sitemap"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-500"
            >
              Sitemap
            </a>
          </div>
        </div>
      </section>

      {/* Risk Warning */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="border border-gray-700 rounded-lg p-6">
            <h4 className="text-orange-500 font-bold text-sm mb-3 flex items-center gap-2">
              <span className="border border-orange-500 px-2 py-0.5 rounded text-xs">
                RISK WARNING:
              </span>
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              The Financial Products offered by the company include Contracts
              for Difference (&apos;CFDs&apos;) and other complex financial
              products. Trading CFDs carries a high level of risk since leverage
              can work both to your advantage and disadvantage. As a result,
              CFDs may not be suitable for all investors because it is possible
              to lose all of your invested capital. You should never invest
              money that you cannot afford to lose. Before trading in the
              complex financial products offered, please ensure you understand
              the risks involved.
            </p>
          </div>

          <p className="text-gray-500 text-sm mt-4 leading-relaxed">
            You are granted limited non-exclusive non-transferable rights to use
            the IP provided on this website for personal and non-commercial
            purposes in relation to the services offered on the Website only.
          </p>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-6 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-4xl">
          <div className="border border-gray-700 rounded-lg p-6">
            <h4 className="text-gray-400 font-bold text-sm mb-4 flex items-center gap-2">
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs">
                DOWNLOAD APP
              </span>
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/m4capitallogo2.png"
                alt="M4Capital"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <div className="text-white font-semibold">M4Capital</div>
                <div className="text-gray-500 text-sm">Full version, 59 MB</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center gap-4">
            <a
              href="https://facebook.com/m4capital"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/m4capital"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/m4capital"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://youtube.com/m4capital"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
