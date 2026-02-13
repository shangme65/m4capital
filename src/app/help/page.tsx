"use client";

import { useState } from "react";
import { Search, ChevronRight, Info } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpSections = [
    {
      title: "General Questions",
      icon: "❓",
      href: "/help/general-questions",
      description: "Common questions about M4Capital",
    },
    {
      title: "Trading",
      icon: "📈",
      href: "/help/trading",
      description: "Learn about trading on our platform",
    },
    {
      title: "Depositing funds",
      icon: "💰",
      href: "/help/depositing-funds",
      description: "How to add funds to your account",
    },
    {
      title: "Withdrawing funds",
      icon: "💸",
      href: "/help/withdrawing-funds",
      description: "How to withdraw your funds",
    },
    {
      title: "Account",
      icon: "👤",
      href: "/help/account",
      description: "Manage your account settings",
    },
    {
      title: "Verification",
      icon: "✓",
      href: "/help/verification",
      description: "Account verification process",
    },
    {
      title: "Tournaments",
      icon: "🏆",
      href: "/help/tournaments",
      description: "Trading tournaments and competitions",
    },
  ];

  const filteredSections = helpSections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Help</h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          We&apos;ll answer your questions quickly and efficiently. What would
          you like to know?
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-white rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
          </div>
        </div>
      </div>

      {/* Login Prompt */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 text-green-800 text-sm">
            Log in to get extra help from our team.
          </div>
          <Link
            href="/dashboard"
            className="text-orange-500 hover:text-orange-600 font-semibold whitespace-nowrap text-sm"
          >
            Log In
          </Link>
        </div>
      </div>

      {/* Help Sections */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto space-y-4">
          {filteredSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="block bg-white hover:bg-gray-50 transition-colors rounded-lg p-3 border border-gray-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.icon}</span>
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Found no answer section */}
        <div className="max-w-2xl mx-auto mt-12 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Found no answer?
          </h2>
          <p className="text-gray-300 mb-4">
            Log in to ask for support.
            <Link
              href="/dashboard"
              className="text-orange-500 hover:text-orange-400 ml-2 font-semibold"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
