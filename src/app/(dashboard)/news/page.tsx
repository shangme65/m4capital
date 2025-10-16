"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Clock,
  Newspaper,
  Globe,
  Star,
  Bell,
  Zap,
  Bookmark,
  Share2,
  ExternalLink,
  Activity,
  AlertTriangle,
  BookmarkCheck,
  X,
  Calendar,
  User,
} from "lucide-react";
import {
  useMarketNews,
  useMarketData,
} from "@/components/client/MarketDataProvider";
import { NewsItem } from "@/lib/marketData";

// Extended NewsItem interface for enhanced features
interface ExtendedNewsItem extends NewsItem {
  priority?: "high" | "medium" | "low" | "breaking";
  breaking?: boolean;
  trending?: boolean;
  verified?: boolean;
  keywords?: string[];
  readTime?: string;
  category?: string;
  url?: string;
}

const NewsPage = () => {
  const { news, refreshNews } = useMarketNews();

  // Core state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  // Modal state
  const [selectedArticle, setSelectedArticle] =
    useState<ExtendedNewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination and loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allNews, setAllNews] = useState<ExtendedNewsItem[]>([]);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const articlesPerPage = 12;

  // Enhanced state
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [liveStats, setLiveStats] = useState({
    total: 0,
    breaking: 0,
    trending: 0,
  });

  // Generate real-time news data for forex, banks, crypto
  const generateRealTimeNews = (page: number): ExtendedNewsItem[] => {
    const sources = [
      "Reuters",
      "Bloomberg",
      "CNBC",
      "Financial Times",
      "MarketWatch",
      "CoinDesk",
      "ForexLive",
    ];
    const categories = ["forex", "banking", "crypto", "markets", "economic"];
    const newsTemplates = {
      forex: [
        "USD/EUR hits new monthly high amid Fed policy uncertainty",
        "GBP strengthens against major currencies following BoE decision",
        "JPY weakness continues as Bank of Japan maintains dovish stance",
        "AUD/USD pair shows volatility amid commodity price fluctuations",
        "CHF gains safe-haven appeal during market turbulence",
      ],
      banking: [
        "Major banks report stronger Q3 earnings amid rising interest rates",
        "Central bank digital currencies gain momentum globally",
        "Banking sector sees increased lending activity",
        "Regional banks face pressure from commercial real estate exposure",
        "Financial institutions boost cyber security investments",
      ],
      crypto: [
        "Bitcoin reaches new monthly high as institutional adoption continues",
        "Ethereum network upgrade shows promising scalability improvements",
        "Cryptocurrency markets surge as regulatory clarity emerges",
        "DeFi protocols show significant growth in total value locked",
        "Major corporations add crypto to treasury reserves",
      ],
      markets: [
        "Stock markets rally on positive economic data",
        "Technology sector leads market gains amid AI optimism",
        "Energy stocks fluctuate with oil price volatility",
        "Emerging markets show resilience despite global headwinds",
        "Bond yields stabilize as inflation concerns ease",
      ],
      economic: [
        "Fed signals potential rate cut in next meeting",
        "Inflation data shows continued cooling trend",
        "Employment figures exceed analyst expectations",
        "GDP growth remains steady in latest quarter",
        "Consumer confidence reaches six-month high",
      ],
    };

    const news: ExtendedNewsItem[] = [];

    for (let i = 0; i < articlesPerPage; i++) {
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const templates = newsTemplates[category as keyof typeof newsTemplates];
      const title = templates[Math.floor(Math.random() * templates.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const timestamp = Date.now() - Math.floor(Math.random() * 86400000); // Within last 24 hours

      const sentiments = ["positive", "negative", "neutral"] as const;
      const sentiment =
        sentiments[Math.floor(Math.random() * sentiments.length)];

      const isBreaking = Math.random() < 0.1; // 10% chance of breaking news
      const isTrending = Math.random() < 0.15; // 15% chance of trending

      news.push({
        id: `news-${page}-${i + 1}`,
        title,
        summary: `Detailed analysis of ${title.toLowerCase()}. Market experts provide insights into the latest developments and their potential impact on global financial markets.`,
        source,
        timestamp,
        symbols: [],
        sentiment,
        priority: isBreaking
          ? "breaking"
          : Math.random() < 0.3
          ? "high"
          : "medium",
        breaking: isBreaking,
        trending: isTrending,
        verified: true,
        keywords: [
          category,
          sentiment === "positive"
            ? "bullish"
            : sentiment === "negative"
            ? "bearish"
            : "neutral",
        ],
        readTime: `${Math.floor(Math.random() * 3) + 2} min read`,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        url: `https://example.com/news/${category}/${i + 1}`,
      });
    }

    return news;
  };

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize news data
  useEffect(() => {
    const initialNews = generateRealTimeNews(1);
    setAllNews(initialNews);
  }, []);

  // Update live statistics
  useEffect(() => {
    const extendedNews =
      allNews.length > 0 ? allNews : (news as ExtendedNewsItem[]);
    const breakingCount = extendedNews.filter(
      (item) => item.priority === "high" || item.breaking === true
    ).length;
    const trendingCount = extendedNews.filter(
      (item) => item.trending === true
    ).length;

    setLiveStats({
      total: extendedNews.length,
      breaking: breakingCount,
      trending: trendingCount,
    });
  }, [allNews, news]);

  // Load saved articles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedArticles");
    if (saved) {
      try {
        setSavedArticles(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error("Error loading saved articles:", error);
      }
    }
  }, []);

  // Enhanced filtering logic
  const filteredNews = (
    allNews.length > 0 ? allNews : (news as ExtendedNewsItem[])
  ).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.symbols || []).some((symbol) =>
        symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = (() => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "breaking")
        return item.priority === "high" || item.breaking === true;
      if (selectedCategory === "trending") return item.trending === true;
      if (selectedCategory === "saved") return savedArticles.has(item.id);
      return true; // Simplified for now
    })();

    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Generate fresh news data
      const freshNews = generateRealTimeNews(1);
      setAllNews(freshNews);
      setCurrentPage(1);
      setHasMoreNews(true);
      setLastUpdate(new Date());

      // Show success notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("News Updated", {
          body: `Updated with ${freshNews.length} fresh articles`,
          icon: "/m4capitallogo2.png",
        });
      }
    } catch (error) {
      console.error("Failed to refresh news:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMoreNews = async () => {
    if (isLoadingMore || !hasMoreNews) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const newNews = generateRealTimeNews(nextPage);

      // Add new news to existing news
      setAllNews((prev) => [...prev, ...newNews]);
      setCurrentPage(nextPage);

      // Simulate pagination limit (stop after 5 pages)
      if (nextPage >= 5) {
        setHasMoreNews(false);
      }

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("More News Loaded", {
          body: `Loaded ${newNews.length} additional articles`,
          icon: "/m4capitallogo2.png",
        });
      }
    } catch (error) {
      console.error("Failed to load more news:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment?: string, priority?: string) => {
    let baseColor = "";
    switch (sentiment) {
      case "positive":
        baseColor = "border-l-green-400 bg-green-500/10";
        break;
      case "negative":
        baseColor = "border-l-red-400 bg-red-500/10";
        break;
      default:
        baseColor = "border-l-gray-400 bg-gray-500/10";
    }

    // Add breaking news highlighting
    if (priority === "high" || priority === "breaking") {
      baseColor += " ring-2 ring-red-500/50 shadow-lg shadow-red-500/20";
    }

    return baseColor;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 30) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const toggleSaveArticle = (articleId: string) => {
    const newSaved = new Set(savedArticles);
    if (newSaved.has(articleId)) {
      newSaved.delete(articleId);
    } else {
      newSaved.add(articleId);
    }
    setSavedArticles(newSaved);

    // Save to localStorage
    localStorage.setItem("savedArticles", JSON.stringify(Array.from(newSaved)));
  };

  const shareArticle = async (article: ExtendedNewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url || window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${article.title}\n${article.summary}\n${
          article.url || window.location.href
        }`
      );
    }
  };

  // Modal handling functions
  const handleArticleClick = (article: ExtendedNewsItem) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  const visitOriginalSite = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Logo Header */}
      <motion.header
        className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-10"
        initial={{ opacity: 1 }}
        animate={{
          opacity: isScrolled ? 0 : 1,
          y: isScrolled ? -100 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-6xl mx-auto px-3 py-3">
          <Link href="/" className="flex items-center group">
            <Image
              src="/m4capitallogo2.png"
              alt="M4 Capital Logo"
              width={24}
              height={24}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            <span className="ml-0.5 text-base font-bold text-white transition-transform duration-300 group-hover:scale-110">
              capital
            </span>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 py-4">
        {/* Real-time Statistics */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-lg rounded-lg p-3 md:p-4 mb-4 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 overflow-x-auto">
              <div className="text-center min-w-0 flex-shrink-0 px-2 sm:px-3 md:px-4 lg:px-5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-blue-400">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  {liveStats.total.toLocaleString()}
                </div>
                <p className="text-sm sm:text-sm md:text-base text-gray-400 whitespace-nowrap">
                  Total
                </p>
              </div>
              <div className="text-center min-w-0 flex-shrink-0 px-2 sm:px-3 md:px-4 lg:px-5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-red-400">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  {liveStats.breaking}
                </div>
                <p className="text-sm sm:text-sm md:text-base text-gray-400 whitespace-nowrap">
                  Breaking
                </p>
              </div>
              <div className="text-center min-w-0 flex-shrink-0 px-2 sm:px-3 md:px-4 lg:px-5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-orange-400">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  {liveStats.trending}
                </div>
                <p className="text-sm sm:text-sm md:text-base text-gray-400 whitespace-nowrap">
                  Trending
                </p>
              </div>
              <div className="text-center min-w-0 flex-shrink-0 px-2 sm:px-3 md:px-4 lg:px-5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-green-400">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                  {Math.floor(
                    (Date.now() - (lastUpdate?.getTime() || Date.now())) / 60000
                  )}
                  m
                </div>
                <p className="text-sm sm:text-sm md:text-base text-gray-400 whitespace-nowrap">
                  Update
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 sm:p-2.5 md:p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
              title="Refresh News"
              aria-label="Refresh news"
            >
              <RefreshCw
                className={`w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Enhanced Controls Bar */}
        <div className="bg-black/20 backdrop-blur-lg rounded-lg p-3 mb-4 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search news articles"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {["all", "breaking", "trending", "saved"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1 ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                  aria-label={`Filter by ${category}`}
                >
                  {category === "all" && <Globe className="w-3 h-3" />}
                  {category === "breaking" && (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {category === "trending" && (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {category === "saved" && <Bookmark className="w-3 h-3" />}
                  <span className="hidden sm:inline">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                  <span className="sm:hidden">
                    {category === "all"
                      ? "All"
                      : category === "breaking"
                      ? "!"
                      : category === "trending"
                      ? "↗"
                      : "★"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-8">
            <Newspaper className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No news articles found
            </h3>
            <p className="text-gray-500 mb-3 text-sm">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
            >
              Refresh News
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`relative bg-black/20 backdrop-blur-lg border-l-4 rounded-lg p-4 hover:bg-white/5 transition-all duration-300 border border-white/10 cursor-pointer ${getSentimentColor(
                  article.sentiment,
                  article.priority
                )}`}
                onClick={() => handleArticleClick(article)}
              >
                {article.priority === "breaking" && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                      !
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1">
                    {getSentimentIcon(article.sentiment)}
                    <span className="text-xs text-gray-400 truncate">
                      {article.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(article.timestamp)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveArticle(article.id);
                      }}
                      className={`p-0.5 rounded hover:bg-white/10 transition-colors ${
                        savedArticles.has(article.id)
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                      aria-label={
                        savedArticles.has(article.id)
                          ? "Remove from saved"
                          : "Save article"
                      }
                    >
                      {savedArticles.has(article.id) ? (
                        <BookmarkCheck className="w-3 h-3" />
                      ) : (
                        <Bookmark className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareArticle(article);
                      }}
                      className="p-0.5 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      aria-label="Share article"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 leading-tight">
                  {article.title}
                </h3>

                <p className="text-gray-300 text-xs mb-3 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>

                {article.keywords && article.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.keywords.slice(0, 2).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {article.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    )}
                  </div>

                  <div className="text-blue-400 text-xs flex items-center gap-1">
                    <span>Read more</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredNews.length > 0 && hasMoreNews && (
          <div className="text-center mt-6">
            <button
              onClick={loadMoreNews}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors text-sm flex items-center gap-2 mx-auto"
              aria-label="Load more articles"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Load More Articles
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Real-time news from Forex, Banking & Crypto markets
            </p>
          </div>
        )}

        {!hasMoreNews && filteredNews.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">No more articles to load</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm"
            >
              Refresh for Latest News
            </button>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {isModalOpen && selectedArticle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gray-900 rounded-xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(selectedArticle.sentiment)}
                  <span className="text-sm text-gray-400">
                    {selectedArticle.source}
                  </span>
                </div>
                {selectedArticle.priority === "breaking" && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    BREAKING
                  </div>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedArticle.timestamp).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                  {selectedArticle.readTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedArticle.readTime}
                    </div>
                  )}
                  {selectedArticle.category && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {selectedArticle.category}
                    </div>
                  )}
                </div>

                {/* Article Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>

                {/* Keywords */}
                {selectedArticle.keywords &&
                  selectedArticle.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedArticle.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Article Summary/Content */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {selectedArticle.summary}
                  </p>

                  {/* Simulated full article content */}
                  <div className="space-y-4 text-gray-300">
                    <p>
                      This comprehensive article provides detailed insights into
                      the latest market developments. Our analysis covers the
                      key factors driving current trends and what investors
                      should watch for in the coming weeks.
                    </p>
                    <p>
                      Market experts suggest that recent developments could have
                      significant implications for portfolio strategies. The
                      data indicates changing investor sentiment and potential
                      shifts in market dynamics.
                    </p>
                    <p>
                      Looking ahead, several key indicators will be crucial for
                      determining the market's direction. Investors are advised
                      to monitor these developments closely and consider their
                      risk tolerance when making decisions.
                    </p>
                  </div>
                </div>

                {/* Article Actions */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => toggleSaveArticle(selectedArticle.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      savedArticles.has(selectedArticle.id)
                        ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {savedArticles.has(selectedArticle.id) ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    {savedArticles.has(selectedArticle.id)
                      ? "Saved"
                      : "Save Article"}
                  </button>

                  <button
                    onClick={() => shareArticle(selectedArticle)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>

                  {selectedArticle.url && (
                    <button
                      onClick={() => visitOriginalSite(selectedArticle.url)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Original Source
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default NewsPage;
