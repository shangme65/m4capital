"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, ChevronUp, Calendar } from "lucide-react";

// Press/News articles data
const pressArticles = [
  {
    id: "1",
    source: {
      name: "Management Today",
      logo: "MT",
      logoStyle: "font-black text-2xl",
    },
    title: "M4Capital: Sponsoring the Mobile News Awards",
    date: "03.07.2017",
    excerpt: "7 advantages of the M4Capital mobile app.",
    externalUrl: "#",
  },
  {
    id: "2",
    source: {
      name: "Daily Sportscar",
      logo: "dailysportscar",
      logoStyle: "text-lg font-medium",
      logoColor: "text-green-600",
    },
    title: "Aston Martin Racing, Introducing M4Capital",
    date: "22.02.2016",
    excerpt:
      "«Our decision was between motor racing and football, all of our major competitors are in football but we found more synergy with motorsport, our products are about excellence, efficiency, speed and great design and this is a sport that gave us some real parallels.»",
    externalUrl: "#",
  },
  {
    id: "3",
    source: {
      name: "Express",
      logo: "EXPRESS",
      logoStyle: "text-xl font-black tracking-tight",
      hasIcon: true,
    },
    title: "What does 'speed' mean to you? Sponsored by M4Capital",
    date: "30.06.2015",
    excerpt:
      "«A rushing movement, aimed at achieving a particular result? A chaotic inclination of moving particles? A gust of wind, a conscious obedience to a vector? Inert or aspiring?»",
    externalUrl: "#",
  },
  {
    id: "4",
    source: {
      name: "Digital Journal",
      logo: "DIGITAL JOURNAL",
      logoStyle: "text-lg font-bold tracking-wide",
      hasBar: true,
    },
    title: "New version of M4Capital: Advanced technologies for your success",
    date: "04.05.2015",
    excerpt:
      "«An updated interface of the system became much more interesting, more functional and more comfortable. New tools were provided to improve the efficiency of the trader appeared in this version. So, let's check out the details.»",
    externalUrl: "#",
  },
  {
    id: "5",
    source: {
      name: "Finance Magnates",
      logo: "FM",
      logoStyle: "text-2xl font-black text-blue-600",
    },
    title: "M4Capital Launches Revolutionary Trading Platform",
    date: "15.03.2015",
    excerpt:
      "«The new platform brings cutting-edge technology to retail traders, offering advanced charting tools and lightning-fast execution speeds.»",
    externalUrl: "#",
  },
  {
    id: "6",
    source: {
      name: "TechCrunch",
      logo: "TC",
      logoStyle: "text-2xl font-black text-green-500",
    },
    title: "How M4Capital is Disrupting Online Trading",
    date: "28.01.2015",
    excerpt:
      "«With a focus on user experience and accessibility, M4Capital is making trading available to millions of new users worldwide.»",
    externalUrl: "#",
  },
];

// News source logo component
const SourceLogo = ({
  source,
}: {
  source: (typeof pressArticles)[0]["source"];
}) => {
  if (source.name === "Management Today") {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className="text-3xl font-black text-gray-900">MT</span>
        <div className="text-left leading-tight">
          <div className="text-xs font-medium text-gray-700">Management</div>
          <div className="text-xs font-medium text-gray-700">Today</div>
        </div>
      </div>
    );
  }

  if (source.name === "Daily Sportscar") {
    return (
      <div className="flex items-center gap-1">
        <svg
          className="w-6 h-6 text-green-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span className="text-lg">
          daily<span className="text-green-500 font-semibold">sportscar</span>
          .com
        </span>
      </div>
    );
  }

  if (source.name === "Express") {
    return (
      <div className="flex items-center gap-2">
        <svg
          className="w-6 h-6 text-red-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <div>
          <span className="text-xl font-black text-gray-900 tracking-tight">
            EXPRESS
          </span>
          <div className="text-[8px] text-gray-500 leading-none">
            Home of the Daily and Sunday Express
          </div>
        </div>
      </div>
    );
  }

  if (source.name === "Digital Journal") {
    return (
      <div className="flex items-center gap-1">
        <div className="w-1 h-6 bg-red-600"></div>
        <span className="text-lg font-bold text-gray-900 tracking-wide">
          DIGITAL JOURNAL
        </span>
      </div>
    );
  }

  if (source.name === "Finance Magnates") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">FM</span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          Finance Magnates
        </span>
      </div>
    );
  }

  if (source.name === "TechCrunch") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">TC</span>
        </div>
        <span className="text-lg font-bold text-green-600">TechCrunch</span>
      </div>
    );
  }

  return <span className={source.logoStyle}>{source.logo}</span>;
};

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Dark Gradient */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Dark gradient background with subtle pattern */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #1a202c 100%)",
          }}
        />

        {/* Background pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              Our Online Trading Platform In The News
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Press Articles Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {pressArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="py-10 border-b border-gray-200 last:border-b-0"
              >
                {/* Source Logo */}
                <div className="flex justify-center mb-6">
                  <SourceLogo source={article.source} />
                </div>

                {/* Article Title */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
                  {article.title}
                </h2>

                {/* Date */}
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                </div>

                {/* Excerpt */}
                <p className="text-gray-600 text-center leading-relaxed mb-6 max-w-2xl mx-auto">
                  {article.excerpt}
                </p>

                {/* Read More Link */}
                <div className="text-center">
                  <a
                    href={article.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    Read more
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.article>
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
              <span className="text-gray-700">M4Capital in the Press</span>
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
              <span className="text-gray-300">{"|"}</span>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-300">{"|"}</span>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-300">{"|"}</span>
              <Link
                href="#"
                className="text-gray-600 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-300">{"|"}</span>
              <Link href="/site-map" className="text-gray-600 hover:text-orange-500">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
