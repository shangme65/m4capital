"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronUp, Clock, ArrowRight, Search } from "lucide-react";

// Blog categories
const categories = [
  { id: "all", name: "All", count: 24 },
  { id: "trading", name: "Trading", count: 8 },
  { id: "education", name: "Education", count: 6 },
  { id: "market-analysis", name: "Market Analysis", count: 5 },
  { id: "crypto", name: "Cryptocurrency", count: 3 },
  { id: "news", name: "News", count: 2 },
];

// Featured article
const featuredArticle = {
  id: "featured-1",
  slug: "mastering-technical-analysis-complete-guide",
  title: "Mastering Technical Analysis: A Complete Guide for Traders",
  excerpt:
    "Learn the essential techniques of technical analysis that professional traders use to identify market trends and make informed trading decisions.",
  category: "Education",
  readTime: "12 min read",
  date: "December 8, 2024",
  image: "/traderoom/trading-chart-1.jpg",
  author: {
    name: "M4Capital Team",
    avatar: "/avatars/default.png",
  },
};

// Blog posts data
const blogPosts = [
  {
    id: "1",
    slug: "understanding-forex-market-basics",
    title: "Understanding Forex Market Basics: Your First Steps",
    excerpt:
      "Discover the fundamentals of forex trading, including currency pairs, pips, and how the foreign exchange market operates 24/5.",
    category: "Trading",
    readTime: "8 min read",
    date: "December 5, 2024",
    image: "/traderoom/forex-trading.jpg",
  },
  {
    id: "2",
    slug: "top-5-cryptocurrency-trends-2024",
    title: "Top 5 Cryptocurrency Trends Shaping 2024",
    excerpt:
      "Explore the most significant cryptocurrency trends that are defining the digital asset landscape this year.",
    category: "Cryptocurrency",
    readTime: "6 min read",
    date: "December 3, 2024",
    image: "/traderoom/crypto-trading.jpg",
  },
  {
    id: "3",
    slug: "risk-management-strategies-beginners",
    title: "Risk Management Strategies Every Beginner Should Know",
    excerpt:
      "Learn essential risk management techniques to protect your capital and trade with confidence in volatile markets.",
    category: "Education",
    readTime: "10 min read",
    date: "December 1, 2024",
    image: "/traderoom/risk-management.jpg",
  },
  {
    id: "4",
    slug: "weekly-market-analysis-december",
    title: "Weekly Market Analysis: What to Expect This December",
    excerpt:
      "Our analysts break down the key market movements and provide insights on what traders should watch this month.",
    category: "Market Analysis",
    readTime: "7 min read",
    date: "November 28, 2024",
    image: "/traderoom/market-analysis.jpg",
  },
  {
    id: "5",
    slug: "psychology-of-successful-trading",
    title: "The Psychology of Successful Trading",
    excerpt:
      "Understanding your emotions and developing the right mindset is crucial for long-term trading success.",
    category: "Education",
    readTime: "9 min read",
    date: "November 25, 2024",
    image: "/traderoom/trading-psychology.jpg",
  },
  {
    id: "6",
    slug: "introduction-to-options-trading",
    title: "Introduction to Options Trading: Getting Started",
    excerpt:
      "A beginner-friendly guide to understanding options contracts, strategies, and how to start trading options.",
    category: "Trading",
    readTime: "11 min read",
    date: "November 22, 2024",
    image: "/traderoom/options-trading.jpg",
  },
  {
    id: "7",
    slug: "bitcoin-halving-impact-analysis",
    title: "Bitcoin Halving: Impact Analysis and Price Predictions",
    excerpt:
      "Analyzing the historical impact of Bitcoin halvings and what it could mean for future price movements.",
    category: "Cryptocurrency",
    readTime: "8 min read",
    date: "November 20, 2024",
    image: "/traderoom/bitcoin-analysis.jpg",
  },
  {
    id: "8",
    slug: "candlestick-patterns-every-trader-needs",
    title: "15 Candlestick Patterns Every Trader Needs to Know",
    excerpt:
      "Master the most important candlestick patterns that can help you identify potential market reversals and continuations.",
    category: "Trading",
    readTime: "14 min read",
    date: "November 18, 2024",
    image: "/traderoom/candlestick-patterns.jpg",
  },
];

// Category badge colors
const categoryColors: Record<string, string> = {
  Trading: "bg-blue-100 text-blue-700",
  Education: "bg-green-100 text-green-700",
  "Market Analysis": "bg-purple-100 text-purple-700",
  Cryptocurrency: "bg-orange-100 text-orange-700",
  News: "bg-red-100 text-red-700",
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on category and search
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" ||
      post.category.toLowerCase().replace(" ", "-") === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
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

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              M4Capital Blog
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
              Insights, analysis, and education to help you become a better
              trader
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 pl-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Article Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Article
            </h2>

            <Link href={`/blog/${featuredArticle.slug}`}>
              <div className="group relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-2xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Side */}
                  <div className="relative h-64 md:h-96">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-indigo-900/80 z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%234c1d95" width="400" height="300"/%3E%3Cpath d="M0,150 Q100,100 200,150 T400,150" stroke="%23f97316" stroke-width="3" fill="none" opacity="0.5"/%3E%3Cpath d="M0,180 Q100,130 200,180 T400,180" stroke="%2322c55e" stroke-width="2" fill="none" opacity="0.3"/%3E%3C/svg%3E')`,
                      }}
                    />
                    {/* Trading chart decorative overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                      <svg
                        viewBox="0 0 200 100"
                        className="w-3/4 h-auto opacity-30"
                      >
                        <path
                          d="M10,80 L30,60 L50,70 L70,40 L90,50 L110,30 L130,45 L150,20 L170,35 L190,15"
                          stroke="#f97316"
                          strokeWidth="2"
                          fill="none"
                        />
                        <path
                          d="M10,90 L30,75 L50,85 L70,55 L90,65 L110,45 L130,60 L150,35 L170,50 L190,30"
                          stroke="#22c55e"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full w-fit mb-4">
                      {featuredArticle.category}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-orange-300 transition-colors">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-white/80 mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-white/60 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredArticle.readTime}
                      </span>
                      <span>•</span>
                      <span>{featuredArticle.date}</span>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 text-orange-400 font-medium group-hover:gap-3 transition-all">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-6 bg-gray-50 border-y border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category.name}
                <span
                  className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    selectedCategory === category.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Articles
            </h2>
            <span className="text-gray-500 text-sm">
              {filteredPosts.length} article
              {filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <article className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20" />
                        {/* Decorative trading chart */}
                        <svg
                          viewBox="0 0 200 100"
                          className="absolute inset-0 w-full h-full opacity-20"
                        >
                          <path
                            d={`M0,${50 + Math.random() * 30} Q50,${
                              30 + Math.random() * 40
                            } 100,${40 + Math.random() * 30} T200,${
                              30 + Math.random() * 40
                            }`}
                            stroke="#6d28d9"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                        {/* Category Badge */}
                        <span
                          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                            categoryColors[post.category] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                          <span className="text-gray-400">{post.date}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter to find what you&apos;re
                looking for.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More Button */}
          {filteredPosts.length > 0 && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-colors">
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Stay Updated with Market Insights
            </h2>
            <p className="text-white/80 mb-8">
              Subscribe to our newsletter and get the latest trading tips,
              market analysis, and educational content delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-white/50 text-sm mt-4">
              By subscribing, you agree to receive marketing communications from
              M4Capital.
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
              <span className="text-gray-700">Blog</span>
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
              <Link
                href="/contact"
                className="text-gray-600 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/in-numbers"
                className="text-gray-600 hover:text-orange-500"
              >
                In Numbers
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="#"
                className="text-gray-600 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
