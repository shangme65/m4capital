"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  X,
  HelpCircle,
  Building2,
  Scale,
  BarChart3,
  Calendar,
  Building,
  MessageCircle,
} from "lucide-react";

// Video category interface
interface VideoCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  videoCount: number;
}

// Video interface
interface Video {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  viewed?: boolean;
}

// Categories data
const categories: VideoCategory[] = [
  {
    id: "basics",
    name: "Basics",
    icon: <MessageCircle className="w-6 h-6" />,
    videoCount: 10,
  },
  {
    id: "cfd-trading",
    name: "CFD Trading",
    icon: <Building2 className="w-6 h-6" />,
    videoCount: 11,
  },
  {
    id: "margin-trading",
    name: "Margin Trading",
    icon: <Scale className="w-6 h-6" />,
    videoCount: 2,
  },
  {
    id: "technical-analysis",
    name: "Technical Analysis",
    icon: <BarChart3 className="w-6 h-6" />,
    videoCount: 11,
  },
  {
    id: "fundamental-analysis",
    name: "Fundamental Analysis",
    icon: <Calendar className="w-6 h-6" />,
    videoCount: 5,
  },
  {
    id: "about-us",
    name: "About Us",
    icon: <Building className="w-6 h-6" />,
    videoCount: 2,
  },
];

// Sample videos data - Using placeholder thumbnails (you'll replace with actual video content later)
const videosData: Video[] = [
  // CFD Trading
  {
    id: "v1",
    title: "Forex. How to start?",
    category: "cfd-trading",
    categoryLabel: "CFD TRADING",
    duration: "01:01",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v2",
    title: "What is CFD Trading?",
    category: "cfd-trading",
    categoryLabel: "CFD TRADING",
    duration: "02:15",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v3",
    title: "Understanding Leverage",
    category: "cfd-trading",
    categoryLabel: "CFD TRADING",
    duration: "01:45",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  // Basics
  {
    id: "v4",
    title: "Deposit with PromptPay",
    category: "basics",
    categoryLabel: "BASICS",
    duration: "01:09",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v5",
    title: "How to Create an Account",
    category: "basics",
    categoryLabel: "BASICS",
    duration: "01:30",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v6",
    title: "Platform Overview",
    category: "basics",
    categoryLabel: "BASICS",
    duration: "02:00",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v7",
    title: "Making Your First Trade",
    category: "basics",
    categoryLabel: "BASICS",
    duration: "01:45",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  // Technical Analysis
  {
    id: "v8",
    title: "Types of charts. How do they work?",
    category: "technical-analysis",
    categoryLabel: "TECHNICAL ANALYSIS",
    duration: "01:21",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v9",
    title: "Reading Candlestick Patterns",
    category: "technical-analysis",
    categoryLabel: "TECHNICAL ANALYSIS",
    duration: "02:30",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v10",
    title: "Support and Resistance Levels",
    category: "technical-analysis",
    categoryLabel: "TECHNICAL ANALYSIS",
    duration: "01:55",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  // Fundamental Analysis
  {
    id: "v11",
    title: "How to use the news in trading",
    category: "fundamental-analysis",
    categoryLabel: "FUNDAMENTAL ANALYSIS",
    duration: "02:05",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v12",
    title: "Economic Calendar Explained",
    category: "fundamental-analysis",
    categoryLabel: "FUNDAMENTAL ANALYSIS",
    duration: "01:50",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  // Margin Trading
  {
    id: "v13",
    title: "Introduction to Margin Trading",
    category: "margin-trading",
    categoryLabel: "MARGIN TRADING",
    duration: "02:20",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v14",
    title: "Managing Margin Requirements",
    category: "margin-trading",
    categoryLabel: "MARGIN TRADING",
    duration: "01:40",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  // About Us
  {
    id: "v15",
    title: "About M4Capital",
    category: "about-us",
    categoryLabel: "ABOUT US",
    duration: "01:30",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
  {
    id: "v16",
    title: "Our Trading Platform",
    category: "about-us",
    categoryLabel: "ABOUT US",
    duration: "02:00",
    thumbnail: "/traderoom/chart-bg.png",
    videoUrl: "",
  },
];

// Get category badge color
const getCategoryColor = (category: string) => {
  switch (category) {
    case "cfd-trading":
      return "bg-purple-500";
    case "basics":
      return "bg-orange-500";
    case "technical-analysis":
      return "bg-red-500";
    case "fundamental-analysis":
      return "bg-red-600";
    case "margin-trading":
      return "bg-blue-500";
    case "about-us":
      return "bg-gray-600";
    default:
      return "bg-gray-500";
  }
};

export default function VideoTutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [viewedVideos, setViewedVideos] = useState<Set<string>>(new Set());
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  // Load viewed videos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("viewedVideos");
    if (stored) {
      setViewedVideos(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save viewed videos to localStorage
  const markAsViewed = (videoId: string) => {
    setViewedVideos((prev) => {
      const newSet = new Set(prev);
      newSet.add(videoId);
      localStorage.setItem("viewedVideos", JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Filter videos by category
  const filteredVideos = useMemo(() => {
    if (!selectedCategory) return videosData;
    return videosData.filter((v) => v.category === selectedCategory);
  }, [selectedCategory]);

  // Featured videos (for carousel)
  const featuredVideos = videosData.slice(0, 5);

  // Navigate featured carousel
  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredVideos.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex(
      (prev) => (prev - 1 + featuredVideos.length) % featuredVideos.length
    );
  };

  // Play video handler
  const handlePlayVideo = (video: Video) => {
    markAsViewed(video.id);
    setPlayingVideo(video);
  };

  // Close video modal
  const closeVideoModal = () => {
    setPlayingVideo(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      {/* Hero Section with Dark Gradient */}
      <section className="relative pt-20 pb-8 overflow-hidden bg-gray-900">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trading tutorials and top market news
            </h1>
          </motion.div>

          {/* Featured Video Carousel */}
          <div className="relative max-w-2xl mx-auto">
            {/* Category Badge */}
            <div className="flex justify-center mb-4">
              <span
                className={`${getCategoryColor(
                  featuredVideos[featuredIndex].category
                )} text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider`}
              >
                {featuredVideos[featuredIndex].categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
              {featuredVideos[featuredIndex].title}
            </h2>

            {/* Video Thumbnail with Play Button */}
            <div className="relative mx-auto w-32 h-32 mb-4">
              <button
                onClick={() => handlePlayVideo(featuredVideos[featuredIndex])}
                className="w-full h-full rounded-full bg-gray-700/50 flex items-center justify-center hover:bg-gray-600/50 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play
                    className="w-8 h-8 text-gray-700 ml-1"
                    fill="currentColor"
                  />
                </div>
              </button>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
              <Clock className="w-4 h-4" />
              <span>{featuredVideos[featuredIndex].duration}</span>
            </div>

            {/* More Videos Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 px-6 py-2 border border-gray-600 rounded-full text-white hover:bg-gray-800 transition-colors"
              >
                More videos
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevFeatured}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={nextFeatured}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-2">
              {featuredVideos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFeaturedIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === featuredIndex ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6">All categories</h2>

          <div className="space-y-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )
                }
                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? "bg-gray-700"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="w-14 h-14 rounded-full border-2 border-gray-600 flex items-center justify-center text-gray-400">
                  {category.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium">{category.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {category.videoCount} videos
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos List Section */}
      <section className="py-8 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🔥 Last added new videos
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
              >
                All categories
              </button>
            )}
          </div>

          {/* Video Grid */}
          <div className="space-y-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-900 rounded-lg overflow-hidden"
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-video bg-gray-800 cursor-pointer group"
                  onClick={() => handlePlayVideo(video)}
                >
                  {/* Placeholder background with chart pattern */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    }}
                  >
                    {/* Chart-like visual */}
                    <div className="absolute inset-0 flex items-end justify-center p-4 opacity-30">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 mx-0.5 ${
                            Math.random() > 0.5 ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{
                            height: `${20 + Math.random() * 60}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`${getCategoryColor(
                        video.category
                      )} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
                    >
                      {video.categoryLabel}
                    </span>
                  </div>

                  {/* Viewed Badge */}
                  {viewedVideos.has(video.id) && (
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-gray-800/80 text-white text-xs px-3 py-1 rounded">
                        VIEWED
                      </span>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play
                        className="w-8 h-8 text-gray-700 ml-1"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2">{video.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{video.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Partners Section */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-2xl font-bold text-purple-600">Skrill</div>
            <div className="text-2xl font-bold text-gray-700">volet</div>
            <div className="text-2xl font-bold text-green-600">NETELLER</div>
          </div>
          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
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
              <span className="text-gray-700">Video Tutorials</span>
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
              <Link href="#" className="text-gray-600 hover:text-orange-500">
                Affiliate Program
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
                href="/news"
                className="text-gray-600 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="#"
                className="text-gray-600 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="#" className="text-gray-600 hover:text-orange-500">
                Sitemap
              </Link>
            </div>

            {/* Risk Warning Box */}
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
                invest money that you cannot afford to lose. Before trading in
                the complex financial products offered, please ensure you
                understand the risks involved.
              </p>
            </div>

            <p className="text-gray-500 text-sm mt-6 text-center">
              You are granted limited non-exclusive non-transferable rights to
              use the IP provided on this website for personal and
              non-commercial purposes in relation to the services offered on the
              Website only.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* Video Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeVideoModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeVideoModal}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-800 flex flex-col items-center justify-center p-8">
                {/* Placeholder content when no video URL */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {playingVideo.title}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Video content coming soon
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    This is a placeholder for the video tutorial. Upload your
                    video content to the server and update the videoUrl in the
                    code to enable playback.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{playingVideo.duration}</span>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 bg-gray-900">
                <span
                  className={`${getCategoryColor(
                    playingVideo.category
                  )} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
                >
                  {playingVideo.categoryLabel}
                </span>
                <h3 className="text-white font-medium mt-3">
                  {playingVideo.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
