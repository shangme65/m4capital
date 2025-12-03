"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useModal } from "@/contexts/ModalContext";
import {
  Search,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Globe,
  Eye,
  ThumbsUp,
  ChevronDown,
  ExternalLink,
  Loader2,
} from "lucide-react";

// NewsItem interface matching API
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceIcon?: string;
  timestamp: string;
  url: string;
  category?: string;
  sentiment?: "positive" | "negative" | "neutral";
  impact?: "high" | "medium" | "low";
  imageUrl?: string;
  views?: number;
  likes?: number;
}

// Source logo mapping
const sourceLogos: Record<string, string> = {
  CoinDesk: "/news-sources/coindesk.png",
  "Yahoo Finance": "/news-sources/yahoo.png",
  CoinTelegraph: "/news-sources/cointelegraph.png",
  "Investing.com": "/news-sources/investing.png",
  Reuters: "/news-sources/reuters.png",
  Bloomberg: "/news-sources/bloomberg.png",
};

// Generate pseudo-random but consistent values based on ID
const getStableStats = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const absHash = Math.abs(hash);
  return {
    views: (absHash % 900) + 100,
    likes: (absHash % 150) + 20,
  };
};

// Format time ago
const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// News Card Component
const NewsCard = ({ article }: { article: NewsItem }) => {
  const stats = getStableStats(article.id);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(article.url, "_blank", "noopener,noreferrer");
  };

  // Get placeholder image based on category
  const getPlaceholderImage = () => {
    switch (article.category) {
      case "crypto":
        return "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80";
      case "forex":
        return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80";
      case "market":
        return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80";
      default:
        return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80";
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-750"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Source Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {sourceLogos[article.source] ? (
            <Image
              src={sourceLogos[article.source]}
              alt={article.source}
              width={24}
              height={24}
              className="object-contain"
            />
          ) : (
            <Globe className="w-4 h-4 text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            {article.source.toLowerCase().replace(/\s/g, "") + ".com"}
          </span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-gray-500 text-sm">
            {formatTimeAgo(article.timestamp)}
          </span>
        </div>
        {article.impact === "high" && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
            TRENDING
          </span>
        )}
      </div>

      {/* Article Image */}
      <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <Image
          src={article.imageUrl || getPlaceholderImage()}
          alt={article.title}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
          unoptimized
        />
        {/* Source badge overlay */}
        <div className="absolute top-3 right-3">
          <div className="px-3 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {article.source}
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="p-4">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
          {article.title}
        </h2>

        {/* Summary */}
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {article.summary}
        </p>

        {/* Country Flags (for forex/market related) */}
        {(article.category === "forex" || article.category === "market") && (
          <div className="flex gap-2 mb-4">
            <Image
              src="https://flagcdn.com/w40/us.png"
              alt="USA"
              width={28}
              height={20}
              className="rounded shadow-sm"
            />
            <Image
              src="https://flagcdn.com/w40/gb.png"
              alt="UK"
              width={28}
              height={20}
              className="rounded shadow-sm"
            />
            <Image
              src="https://flagcdn.com/w40/ch.png"
              alt="Switzerland"
              width={28}
              height={20}
              className="rounded shadow-sm"
            />
            <Image
              src="https://flagcdn.com/w40/ca.png"
              alt="Canada"
              width={28}
              height={20}
              className="rounded shadow-sm"
            />
            <Image
              src="https://flagcdn.com/w40/no.png"
              alt="Norway"
              width={28}
              height={20}
              className="rounded shadow-sm"
            />
          </div>
        )}

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-500">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{stats.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{stats.views}</span>
            </div>
          </div>
          <ExternalLink
            className={`w-4 h-4 text-gray-400 transition-all ${
              isHovered ? "text-orange-500 translate-x-1" : ""
            }`}
          />
        </div>
      </div>
    </motion.article>
  );
};

// Main News Feed Page
export default function NewsFeedPage() {
  const { openLoginModal, openSignupModal } = useModal();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: "all", label: "All instruments", icon: Globe },
    { id: "crypto", label: "Crypto", icon: TrendingUp },
    { id: "forex", label: "Forex", icon: TrendingDown },
    { id: "market", label: "Stocks", icon: Globe },
  ];

  // Fetch news
  const fetchNews = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const response = await fetch(
          `/api/news?category=${selectedCategory}&page=${pageNum}`
        );
        const data = await response.json();

        if (data.success && data.news) {
          if (append) {
            setNews((prev) => [...prev, ...data.news]);
          } else {
            setNews(data.news);
          }
          setHasMore(data.news.length >= data.pageSize);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory]
  );

  // Initial fetch and category change
  useEffect(() => {
    setPage(1);
    fetchNews(1, false);
  }, [selectedCategory, fetchNews]);

  // Load more
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage, true);
  };

  // Filter by search
  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header onLoginClick={openLoginModal} onSignupClick={openSignupModal} />

      {/* Hero Section */}
      <div
        className="relative pt-20 pb-8"
        style={{
          background:
            "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)",
        }}
      >
        {/* World map pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cpath fill='%23fff' d='M150 80c20-10 40-5 60 10s30 40 20 60-30 30-50 20-30-40-30-60 0-20 0-30zm200 50c15-5 35 5 45 25s5 45-15 55-40-5-50-25-5-45 20-55zm300 20c25-15 55-5 75 20s20 55-5 75-55 5-75-20-20-55 5-75zm-400 150c10-20 35-30 55-20s30 35 20 55-35 30-55 20-30-35-20-55z'/%3E%3C/svg%3E")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            News Feed
          </h1>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 pl-12 bg-white rounded-xl shadow-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Trending
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="space-y-1">
              {/* First trending item - compact */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all"
                onClick={() =>
                  window.open(
                    filteredNews[0].url,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 text-sm">
                  {formatTimeAgo(filteredNews[0].timestamp)}
                </span>
                <h3 className="flex-1 font-medium text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-orange-500">
                  {filteredNews[0].title}
                </h3>
                <div className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">
                    {getStableStats(filteredNews[0].id).views}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No trending news</p>
          )}
        </div>
      </div>

      {/* News Feed */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading latest news...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800">
            <Globe className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No news found
            </h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {filteredNews.map((article, index) => (
                <NewsCard key={`${article.id}-${index}`} article={article} />
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <div className="bg-white dark:bg-gray-800 p-6 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5" />
                      Load More News
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
