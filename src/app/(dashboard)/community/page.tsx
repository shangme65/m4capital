"use client";

import { useState } from "react";
import {
  TrendingUp,
  MessageCircle,
  Heart,
  Eye,
  Plus,
  Filter,
  Search,
  Award,
  Clock,
  User,
} from "lucide-react";

interface Strategy {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  difficulty: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPremium: boolean;
}

export default function CommunityPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock strategies data
  const strategies: Strategy[] = [
    {
      id: "1",
      title: "Breakout Trading Strategy for Bitcoin",
      description:
        "This strategy focuses on identifying key resistance levels and entering positions when price breaks through with volume confirmation.",
      author: {
        name: "CryptoMaster",
        avatar: "👤",
        verified: true,
      },
      category: "Day Trading",
      difficulty: "Intermediate",
      viewCount: 1234,
      likeCount: 89,
      commentCount: 23,
      createdAt: "2 days ago",
      isPremium: false,
    },
    {
      id: "2",
      title: "RSI Divergence Scalping Method",
      description:
        "Learn how to spot RSI divergences on lower timeframes for quick scalp trades with high win rate.",
      author: {
        name: "TraderPro",
        avatar: "👤",
        verified: true,
      },
      category: "Scalping",
      difficulty: "Advanced",
      viewCount: 892,
      likeCount: 67,
      commentCount: 15,
      createdAt: "1 week ago",
      isPremium: true,
    },
    {
      id: "3",
      title: "Swing Trading with Moving Averages",
      description:
        "Simple yet effective strategy using 50 and 200 EMA crossovers for medium-term trades.",
      author: {
        name: "SwingKing",
        avatar: "👤",
        verified: false,
      },
      category: "Swing Trading",
      difficulty: "Beginner",
      viewCount: 2103,
      likeCount: 145,
      commentCount: 42,
      createdAt: "3 days ago",
      isPremium: false,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-500 bg-green-500/10";
      case "Intermediate":
        return "text-yellow-500 bg-yellow-500/10";
      case "Advanced":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-10 h-10 text-purple-400" />
                <h1 className="text-4xl font-bold">Strategy Community</h1>
              </div>
              <p className="text-xl text-gray-300">
                Share and discover winning trading strategies
              </p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <Plus className="w-5 h-5" />
              Share Strategy
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              "all",
              "day-trading",
              "swing-trading",
              "scalping",
              "long-term",
            ].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-3 rounded-lg transition whitespace-nowrap ${
                  filter === category
                    ? "bg-purple-600 text-white"
                    : "bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800"
                }`}
              >
                {category
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Strategies</p>
            <p className="text-2xl font-bold">{strategies.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Contributors</p>
            <p className="text-2xl font-bold">127</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Views</p>
            <p className="text-2xl font-bold">
              {strategies
                .reduce((sum, s) => sum + s.viewCount, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Likes</p>
            <p className="text-2xl font-bold">
              {strategies.reduce((sum, s) => sum + s.likeCount, 0)}
            </p>
          </div>
        </div>

        {/* Strategy Cards */}
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{strategy.title}</h3>
                    {strategy.isPremium && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-xs font-semibold rounded">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    {strategy.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">
                        {strategy.author.avatar}
                      </span>
                      <span className="text-gray-300">
                        {strategy.author.name}
                      </span>
                      {strategy.author.verified && (
                        <Award className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(
                        strategy.difficulty
                      )}`}
                    >
                      {strategy.difficulty}
                    </span>

                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                      {strategy.category}
                    </span>

                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{strategy.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition">
                  <Heart className="w-5 h-5" />
                  <span>{strategy.likeCount}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition">
                  <MessageCircle className="w-5 h-5" />
                  <span>{strategy.commentCount}</span>
                </button>

                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-5 h-5" />
                  <span>{strategy.viewCount.toLocaleString()}</span>
                </div>

                <button className="ml-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                  View Strategy →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white px-8 py-3 rounded-lg transition">
            Load More Strategies
          </button>
        </div>
      </div>
    </div>
  );
}
