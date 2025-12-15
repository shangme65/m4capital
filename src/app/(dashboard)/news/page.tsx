"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeAgo } from "@/lib/crypto-constants";
import {
  NewsFeedSkeleton,
  NewsCardSkeleton,
} from "@/components/ui/LoadingSkeletons";
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
  Zap,
  Bookmark,
  Share2,
  ExternalLink,
  AlertTriangle,
  BookmarkCheck,
  X,
  Calendar,
  Filter,
  Sparkles,
  Activity,
  BarChart3,
  ChevronRight,
} from "lucide-react";

// NewsItem interface
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url?: string;
  category?: string;
  sentiment?: "positive" | "negative" | "neutral";
  impact?: "high" | "medium" | "low";
}

const NewsPage = () => {
  // Core state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  // Modal state
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination and loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [loading, setLoading] = useState(true);

  // Enhanced state
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [liveStats, setLiveStats] = useState({
    total: 0,
    breaking: 0,
    trending: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load saved articles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedArticles");
    if (saved) {
      setSavedArticles(new Set(JSON.parse(saved)));
    }
  }, []);

  // Fetch real news from API
  const fetchRealNews = async (page: number = 1) => {
    try {
      setIsLoadingMore(page > 1);
      setLoading(page === 1);

      const response = await fetch(
        `/api/news?category=${selectedCategory}&page=${page}`
      );
      const data = await response.json();

      if (data.success && data.news) {
        if (page === 1) {
          setAllNews(data.news);
        } else {
          setAllNews((prev) => [...prev, ...data.news]);
        }

        setHasMoreNews(data.news.length >= data.pageSize);
        setLastUpdate(new Date());

        // Update stats
        setLiveStats({
          total: data.total || data.news.length,
          breaking: data.news.filter((n: NewsItem) => n.impact === "high")
            .length,
          trending: data.news.filter(
            (n: NewsItem) => n.sentiment === "positive"
          ).length,
        });
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch on mount and when category changes
  useEffect(() => {
    setCurrentPage(1);
    fetchRealNews(1);
  }, [selectedCategory]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRealNews(1);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedCategory]);

  // Filter news
  const filteredNews = allNews.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || news.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchRealNews(1);
      setCurrentPage(1);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("News Updated", {
          body: `Latest market news refreshed`,
          icon: "/m4capitallogo1.png",
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
      await fetchRealNews(nextPage);
      setCurrentPage(nextPage);
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
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSentimentColor = (sentiment?: string, priority?: string) => {
    if (priority === "high" || priority === "breaking") {
      return "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/50 shadow-lg shadow-red-500/10";
    }

    switch (sentiment) {
      case "positive":
        return "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30";
      case "negative":
        return "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30";
      default:
        return "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-gray-600/30";
    }
  };

  const toggleSaveArticle = (articleId: string) => {
    const newSaved = new Set(savedArticles);
    if (newSaved.has(articleId)) {
      newSaved.delete(articleId);
    } else {
      newSaved.add(articleId);
    }
    setSavedArticles(newSaved);
    localStorage.setItem("savedArticles", JSON.stringify(Array.from(newSaved)));
  };

  const shareArticle = async (article: NewsItem) => {
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
      navigator.clipboard.writeText(
        `${article.title}\n${article.summary}\n${
          article.url || window.location.href
        }`
      );
    }
  };

  const handleArticleClick = (article: NewsItem) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    document.body.style.overflow = "unset";
  };

  const visitOriginalSite = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

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

  const categories = [
    { id: "all", label: "All News", icon: Globe },
    { id: "crypto", label: "Crypto", icon: Sparkles },
    { id: "forex", label: "Forex", icon: TrendingUp },
    { id: "banking", label: "Banking", icon: BarChart3 },
    { id: "breaking", label: "Breaking", icon: AlertTriangle },
    { id: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl mobile:rounded-xl p-4 sm:p-6 border border-white/10 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                <Newspaper className="w-7 h-7 text-blue-400" />
                Market News
              </h1>
              <p className="text-sm text-gray-300">
                Real-time financial & crypto updates
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all disabled:opacity-50 backdrop-blur-sm border border-white/10"
              title="Refresh News"
            >
              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Live Stats Grid */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {liveStats.total}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">Breaking</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-400">
                {liveStats.breaking}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Trending</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-orange-400">
                {liveStats.trending}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Updated</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                {Math.floor(
                  (Date.now() - (lastUpdate?.getTime() || Date.now())) / 60000
                )}
                m
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl mobile:rounded-xl p-4 border border-gray-700/50">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search breaking news, crypto, forex..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-600/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="mobile:hidden sm:inline">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* News Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <Newspaper className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-400 mt-4 text-sm">
            Loading real-time market news...
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-700/50">
          <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No news articles found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 font-medium"
          >
            Refresh News Feed
          </button>
        </div>
      ) : (
        <>
          {/* News Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            }
          >
            {filteredNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group relative backdrop-blur-xl border rounded-2xl mobile:rounded-xl p-4 sm:p-5 hover:shadow-xl transition-all duration-300 cursor-pointer ${getSentimentColor(
                  article.sentiment,
                  article.impact
                )} hover:scale-[1.02]`}
                onClick={() => handleArticleClick(article)}
              >
                {/* Breaking Badge */}
                {article.impact === "high" && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse shadow-lg">
                      BREAKING
                    </div>
                  </div>
                )}

                {/* Article Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(article.sentiment)}
                    <span className="text-xs font-medium text-gray-400">
                      {article.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(article.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Article Title */}
                <h3
                  className={`font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors ${
                    viewMode === "grid"
                      ? "text-sm line-clamp-2"
                      : "text-base line-clamp-1"
                  }`}
                >
                  {article.title}
                </h3>

                {/* Article Summary */}
                <p
                  className={`text-gray-300 mb-3 leading-relaxed ${
                    viewMode === "grid"
                      ? "text-xs line-clamp-2"
                      : "text-sm line-clamp-1"
                  }`}
                >
                  {article.summary}
                </p>

                {/* Article Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {article.category && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg font-medium">
                        {article.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveArticle(article.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        savedArticles.has(article.id)
                          ? "text-yellow-400 bg-yellow-500/20"
                          : "text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {savedArticles.has(article.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareArticle(article);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Section */}
          {hasMoreNews && (
            <div className="text-center">
              <button
                onClick={loadMoreNews}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 text-white rounded-xl transition-all font-medium border border-gray-600/50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading more news...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5" />
                    Load More Articles
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Real-time updates from Forex, Banking & Crypto markets
              </p>
            </div>
          )}

          {!hasMoreNews && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">
                You've reached the end
              </p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 font-medium"
              >
                Refresh for Latest News
              </button>
            </div>
          )}
        </>
      )}

      {/* Article Modal */}
      <AnimatePresence>
        {isModalOpen && selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(selectedArticle.sentiment)}
                    <span className="text-sm font-medium text-gray-400">
                      {selectedArticle.source}
                    </span>
                  </div>
                  {selectedArticle.impact === "high" && (
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                      HIGH IMPACT
                    </div>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
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
                  {selectedArticle.category && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-medium">
                      {selectedArticle.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-6 leading-tight">
                  {selectedArticle.title}
                </h1>

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {selectedArticle.summary}
                  </p>

                  <div className="space-y-4 text-gray-300 leading-relaxed">
                    <p>
                      This comprehensive analysis provides detailed insights
                      into the latest market developments. Our team of experts
                      has analyzed the key factors driving current trends and
                      what investors should watch for in the coming weeks.
                    </p>
                    <p>
                      Market dynamics are showing significant changes as
                      institutional investors adjust their positions. Recent
                      data indicates evolving sentiment patterns that could
                      influence market direction in both traditional and
                      cryptocurrency markets.
                    </p>
                    <p>
                      Looking ahead, several key indicators will be crucial for
                      determining market trajectory. Investors are advised to
                      monitor these developments closely and consider their risk
                      tolerance when making strategic decisions.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={() => toggleSaveArticle(selectedArticle.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-gray-300 hover:bg-white/20 rounded-xl transition-all font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>

                  {selectedArticle.url && (
                    <button
                      onClick={() => visitOriginalSite(selectedArticle.url)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/30 rounded-xl transition-all font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read Full Article
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsPage;
