"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronUp,
  Clock,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  BookOpen,
  TrendingUp,
} from "lucide-react";

// Sample blog post content (in a real app, this would come from a CMS or database)
const blogPostsData: Record<string, BlogPost> = {
  "mastering-technical-analysis-complete-guide": {
    id: "featured-1",
    slug: "mastering-technical-analysis-complete-guide",
    title: "Mastering Technical Analysis: A Complete Guide for Traders",
    excerpt:
      "Learn the essential techniques of technical analysis that professional traders use to identify market trends and make informed trading decisions.",
    category: "Education",
    readTime: "12 min read",
    date: "December 8, 2024",
    author: {
      name: "M4Capital Team",
      avatar: "/avatars/default.png",
    },
    content: `
      <h2>What is Technical Analysis?</h2>
      <p>Technical analysis is a trading discipline employed to evaluate investments and identify trading opportunities by analyzing statistical trends gathered from trading activity, such as price movement and volume. Unlike fundamental analysis, which attempts to evaluate a security's value based on business results, technical analysis focuses on the study of price and volume.</p>
      
      <p>Technical analysis tools are used to scrutinize the ways supply and demand for a security will affect changes in price, volume, and implied volatility. It operates from the assumption that past trading activity and price changes of a security can be valuable indicators of the security's future price movements when paired with appropriate investing or trading rules.</p>

      <h2>Key Principles of Technical Analysis</h2>
      
      <h3>1. Price Discounts Everything</h3>
      <p>Technical analysts believe that everything from a company's fundamentals to broad market factors to market psychology is already priced into the stock. This means that all known information is already reflected in the price, making it unnecessary to consider these factors separately.</p>

      <h3>2. Price Moves in Trends</h3>
      <p>Technical analysts believe that prices move in short, medium, and long-term trends. A stock price is more likely to continue a past trend than move erratically. Most technical trading strategies are based on this assumption.</p>

      <h3>3. History Tends to Repeat Itself</h3>
      <p>Technical analysts believe that history tends to repeat itself. The repetitive nature of price movements is often attributed to market psychology, which tends to be predictable based on emotions like fear or excitement. Technical analysis uses chart patterns to analyze these emotions and subsequent market movements to understand trends.</p>

      <h2>Essential Chart Patterns</h2>
      
      <h3>Head and Shoulders</h3>
      <p>The head and shoulders pattern is a chart pattern that appears as a baseline with three peaks, where the outside two are close in height and the middle peak is highest. In technical analysis, a head and shoulders pattern describes a specific chart formation that predicts a bullish-to-bearish trend reversal.</p>

      <h3>Double Top and Double Bottom</h3>
      <p>Double top and double bottom patterns are technical chart patterns used to trade breakouts. A double top forms after an asset reaches a high price two times with a moderate decline between the two highs. A double bottom is the opposite: it occurs after an asset reaches a low price twice with a moderate recovery between the lows.</p>

      <h3>Support and Resistance</h3>
      <p>Support and resistance levels are horizontal price levels that typically connect price bar highs to other price bar highs or lows to lows, forming horizontal levels on a price chart. A support level is a level where the price tends to find support as it falls, meaning the price is more likely to "bounce" off this level rather than break through it.</p>

      <h2>Popular Technical Indicators</h2>

      <h3>Moving Averages</h3>
      <p>Moving averages are one of the most commonly used technical indicators. They help smooth price action by filtering out "noise" from random short-term price fluctuations. The most common types are Simple Moving Average (SMA) and Exponential Moving Average (EMA).</p>

      <h3>Relative Strength Index (RSI)</h3>
      <p>The RSI is a momentum indicator that measures the magnitude of recent price changes to evaluate overbought or oversold conditions in the price of a stock. RSI values range from 0 to 100, with readings above 70 indicating overbought conditions and readings below 30 indicating oversold conditions.</p>

      <h3>MACD (Moving Average Convergence Divergence)</h3>
      <p>MACD is a trend-following momentum indicator that shows the relationship between two moving averages of a security's price. The MACD is calculated by subtracting the 26-period EMA from the 12-period EMA. A signal line (9-day EMA of the MACD) is then plotted on top of the MACD line.</p>

      <h2>Putting It All Together</h2>
      <p>Successful technical analysis requires practice and discipline. Start by focusing on a few key indicators and chart patterns. As you gain experience, you can expand your toolkit. Remember that no indicator is perfect, and it's important to use multiple indicators in conjunction to confirm signals.</p>

      <p>Always combine technical analysis with proper risk management. Set stop-loss orders to limit potential losses and never risk more than you can afford to lose on a single trade.</p>

      <h2>Conclusion</h2>
      <p>Technical analysis is a powerful tool for traders, but it requires time and practice to master. By understanding the key principles, chart patterns, and indicators discussed in this guide, you'll be well on your way to making more informed trading decisions. Remember, the goal of technical analysis is not to predict the future with certainty but to identify high-probability trading opportunities.</p>
    `,
    relatedPosts: [
      "understanding-forex-market-basics",
      "candlestick-patterns-every-trader-needs",
      "risk-management-strategies-beginners",
    ],
  },
  "understanding-forex-market-basics": {
    id: "1",
    slug: "understanding-forex-market-basics",
    title: "Understanding Forex Market Basics: Your First Steps",
    excerpt:
      "Discover the fundamentals of forex trading, including currency pairs, pips, and how the foreign exchange market operates 24/5.",
    category: "Trading",
    readTime: "8 min read",
    date: "December 5, 2024",
    author: {
      name: "M4Capital Team",
      avatar: "/avatars/default.png",
    },
    content: `
      <h2>Introduction to Forex Trading</h2>
      <p>The foreign exchange market, commonly known as forex or FX, is the largest and most liquid financial market in the world. With an average daily trading volume exceeding $6 trillion, forex dwarfs other markets like stocks and commodities.</p>

      <h2>What Makes Forex Unique?</h2>
      <p>Unlike stock markets that operate during specific hours, the forex market operates 24 hours a day, five days a week. This continuous operation is possible because the market spans across different time zones, from Sydney to Tokyo, London, and New York.</p>

      <h2>Understanding Currency Pairs</h2>
      <p>In forex trading, currencies are always traded in pairs. The first currency in the pair is the base currency, and the second is the quote currency. For example, in EUR/USD, EUR is the base currency and USD is the quote currency.</p>

      <h3>Major Currency Pairs</h3>
      <p>The most traded currency pairs, known as majors, include EUR/USD, USD/JPY, GBP/USD, and USD/CHF. These pairs offer the highest liquidity and typically have the tightest spreads.</p>

      <h2>What is a Pip?</h2>
      <p>A pip is the smallest price move that a given exchange rate can make. For most currency pairs, a pip is 0.0001 of the quote currency. For pairs involving the Japanese Yen, a pip is 0.01.</p>

      <h2>Getting Started</h2>
      <p>Before diving into live trading, it's crucial to practice with a demo account, develop a trading strategy, and understand risk management principles. The forex market offers tremendous opportunities, but it also carries significant risks.</p>
    `,
    relatedPosts: [
      "mastering-technical-analysis-complete-guide",
      "risk-management-strategies-beginners",
    ],
  },
};

// Default content for posts without full content
const defaultContent = `
  <h2>Coming Soon</h2>
  <p>This article is currently being written. Please check back soon for the full content.</p>
  <p>In the meantime, explore our other articles for valuable trading insights and education.</p>
`;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  relatedPosts?: string[];
}

// Category badge colors
const categoryColors: Record<string, string> = {
  Trading: "bg-blue-100 text-blue-700",
  Education: "bg-green-100 text-green-700",
  "Market Analysis": "bg-purple-100 text-purple-700",
  Cryptocurrency: "bg-orange-100 text-orange-700",
  News: "bg-red-100 text-red-700",
};

// Related posts data
const relatedPostsData: Record<string, { title: string; category: string }> = {
  "understanding-forex-market-basics": {
    title: "Understanding Forex Market Basics",
    category: "Trading",
  },
  "candlestick-patterns-every-trader-needs": {
    title: "15 Candlestick Patterns Every Trader Needs",
    category: "Trading",
  },
  "risk-management-strategies-beginners": {
    title: "Risk Management Strategies for Beginners",
    category: "Education",
  },
  "mastering-technical-analysis-complete-guide": {
    title: "Mastering Technical Analysis",
    category: "Education",
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [copied, setCopied] = React.useState(false);

  // Get post data or create a placeholder
  const post = blogPostsData[slug] || {
    id: slug,
    slug: slug,
    title: slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    excerpt: "Article content coming soon.",
    category: "Trading",
    readTime: "5 min read",
    date: "December 2024",
    author: {
      name: "M4Capital Team",
      avatar: "/avatars/default.png",
    },
    content: defaultContent,
    relatedPosts: [],
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="min-h-screen bg-white">
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

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                categoryColors[post.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>
            <p className="text-lg text-white/80 mb-8">{post.excerpt}</p>

            <div className="flex items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span>{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span>{post.date}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Technical Analysis",
                    "Trading",
                    "Charts",
                    "Indicators",
                    "Education",
                  ].map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${tag.toLowerCase().replace(" ", "-")}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Share this article
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShare("facebook")}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                    aria-label="Copy link"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Table of Contents */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    In This Article
                  </h3>
                  <nav className="space-y-2">
                    {[
                      "Introduction",
                      "Key Principles",
                      "Chart Patterns",
                      "Indicators",
                      "Conclusion",
                    ].map((item) => (
                      <a
                        key={item}
                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                        className="block text-sm text-gray-600 hover:text-purple-700 transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Related Posts */}
                {post.relatedPosts && post.relatedPosts.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Related Articles
                    </h3>
                    <div className="space-y-4">
                      {post.relatedPosts.map((relatedSlug) => {
                        const relatedPost = relatedPostsData[relatedSlug];
                        if (!relatedPost) return null;
                        return (
                          <Link
                            key={relatedSlug}
                            href={`/blog/${relatedSlug}`}
                            className="block group"
                          >
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                                categoryColors[relatedPost.category] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {relatedPost.category}
                            </span>
                            <h4 className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                              {relatedPost.title}
                            </h4>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
                  <h3 className="font-bold mb-2">Ready to Start Trading?</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Put your knowledge into practice with M4Capital&apos;s
                    trading platform.
                  </p>
                  <Link
                    href="/signup"
                    className="block w-full py-2 bg-white text-purple-700 text-center rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Open Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Articles Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">More Articles</h2>
            <Link
              href="/blog"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.values(blogPostsData)
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <article className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
                    <div className="relative h-40 bg-gradient-to-br from-purple-100 to-indigo-100">
                      <span
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                          categoryColors[relatedPost.category] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {relatedPost.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{relatedPost.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
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
              <Link
                href="/blog"
                className="text-gray-500 hover:text-orange-500"
              >
                Blog
              </Link>
              <span className="text-orange-500">▸</span>
              <span className="text-gray-700 truncate max-w-[200px]">
                {post.title}
              </span>
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
                invest money that you cannot afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
