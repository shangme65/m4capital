"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Info, ChevronRight } from "lucide-react";

// Help categories with their articles
const helpCategories = [
  {
    id: "general",
    title: "General Questions",
    articles: [
      { id: "what-is-m4capital", title: "What is M4Capital?" },
      { id: "how-to-start", title: "How do I start trading?" },
      { id: "supported-countries", title: "Which countries are supported?" },
      { id: "trading-hours", title: "What are the trading hours?" },
      { id: "demo-account", title: "What is a demo account?" },
    ],
  },
  {
    id: "trading",
    title: "Trading",
    articles: [
      { id: "how-to-trade", title: "How do I place a trade?" },
      { id: "order-types", title: "What order types are available?" },
      { id: "leverage", title: "What is leverage?" },
      { id: "margin-trading", title: "How does margin trading work?" },
      { id: "stop-loss", title: "How do I set a stop loss?" },
      { id: "take-profit", title: "How do I set a take profit?" },
    ],
  },
  {
    id: "deposits",
    title: "Depositing funds",
    articles: [
      { id: "how-to-deposit", title: "How do I make a deposit?" },
      { id: "deposit-methods", title: "What deposit methods are available?" },
      { id: "min-deposit", title: "What is the minimum deposit amount?" },
      { id: "deposit-fees", title: "Are there any deposit fees?" },
      { id: "deposit-time", title: "How long do deposits take?" },
      { id: "crypto-deposits", title: "How do I deposit with cryptocurrency?" },
    ],
  },
  {
    id: "withdrawals",
    title: "Withdrawing funds",
    articles: [
      { id: "how-to-withdraw", title: "How do I withdraw funds?" },
      {
        id: "withdrawal-methods",
        title: "What withdrawal methods are available?",
      },
      { id: "withdrawal-time", title: "How long do withdrawals take?" },
      { id: "withdrawal-fees", title: "Are there any withdrawal fees?" },
      { id: "min-withdrawal", title: "What is the minimum withdrawal amount?" },
    ],
  },
  {
    id: "account",
    title: "Account",
    articles: [
      { id: "create-account", title: "How do I create an account?" },
      { id: "change-password", title: "How do I change my password?" },
      { id: "two-factor", title: "How do I enable two-factor authentication?" },
      { id: "close-account", title: "How do I close my account?" },
      { id: "account-settings", title: "How do I update my account settings?" },
    ],
  },
  {
    id: "verification",
    title: "Verification",
    articles: [
      { id: "why-verify", title: "Why do I need to verify my account?" },
      { id: "how-to-verify", title: "How do I verify my account?" },
      { id: "documents-needed", title: "What documents do I need?" },
      { id: "verification-time", title: "How long does verification take?" },
      {
        id: "verification-rejected",
        title: "What if my verification is rejected?",
      },
    ],
  },
  {
    id: "tournaments",
    title: "Tournaments",
    articles: [
      { id: "what-tournaments", title: "What are trading tournaments?" },
      { id: "how-to-join", title: "How do I join a tournament?" },
      { id: "tournament-prizes", title: "What prizes are available?" },
      { id: "tournament-rules", title: "What are the tournament rules?" },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? helpCategories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.articles.some((article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : helpCategories;

  // Get selected category data
  const categoryData = selectedCategory
    ? helpCategories.find((cat) => cat.id === selectedCategory)
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Dark Header Section */}
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.95)), url('/traderoom/trading-bg.jpg')",
        }}
      >
        {/* Navigation */}
        <nav className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button className="text-white p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icons/icon-72x72.png"
                alt="M4Capital"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg">M4Capital</span>
                <span className="text-gray-400 text-xs">
                  Ultimate trading experience
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              <Image
                src="/icons/uk-flag.svg"
                alt="Language"
                width={24}
                height={24}
                className="rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </button>
            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </Link>
          </div>
        </nav>

        {/* Help Title Section */}
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl font-light text-white mb-3">Help</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            We&apos;ll answer your questions quickly and efficiently. What would
            you like to know?
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-8">
          <div className="max-w-xl mx-auto">
            <div className="relative bg-white rounded-xl shadow-lg">
              <div className="flex items-center px-4 py-4">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Login prompt */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <Info className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 text-sm">
              Log in to get extra help from our team.
            </p>
            <Link href="/login" className="text-orange-500 text-sm font-medium">
              Log In
            </Link>
          </div>
        </div>

        {/* Category List or Article List */}
        {selectedCategory && categoryData ? (
          <div>
            {/* Back button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-gray-500 py-4 hover:text-orange-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="text-sm">Back to categories</span>
            </button>

            {/* Category title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {categoryData.title}
            </h2>

            {/* Articles list */}
            <div className="divide-y divide-gray-200">
              {categoryData.articles.map((article) => (
                <button
                  key={article.id}
                  className="w-full py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">{article.title}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="w-full py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-800 font-semibold text-lg">
                  {category.title}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}

        {/* Found no answer section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-gray-800 font-semibold text-lg mb-1">
            Found no answer?
          </h3>
          <p className="text-gray-600 text-sm">
            Log in to ask for support.
            <Link href="/login" className="text-orange-500 font-medium ml-1">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
