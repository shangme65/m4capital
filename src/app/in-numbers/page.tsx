"use client";
import { Users, Clock, Timer, TrendingUp } from "lucide-react";
import Image from "next/image";

export default function InNumbersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      {/* Hero Section */}
      <div className="relative py-12 xs:py-16 sm:py-20 px-4 xs:px-5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">
            Our Trading Platform In Numbers
          </h1>
          <p className="text-lg xs:text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto">
            Trace the history of our company since 2014
          </p>
        </div>
      </div>

      {/* Accounts Registered Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-6">
              Accounts Registered
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              The number of active users is growing rapidly from year to year
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {/* 2014 Stats */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <Users className="w-20 h-20 text-blue-300" strokeWidth={1} />
              </div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-900">
                965,650
              </div>
              <div className="text-lg text-gray-600">registered users</div>
              <div className="text-2xl font-bold text-gray-800">2014</div>
            </div>

            {/* 2016 Stats */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Users className="w-20 h-20 text-blue-400" strokeWidth={1} />
                  <Users
                    className="w-20 h-20 text-blue-500 absolute top-0 left-4"
                    strokeWidth={1}
                  />
                </div>
              </div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-900">
                14,514,300
              </div>
              <div className="text-lg text-gray-600">registered users</div>
              <div className="text-2xl font-bold text-gray-800">2016</div>
            </div>

            {/* 2023 Stats */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Users className="w-20 h-20 text-blue-500" strokeWidth={1} />
                  <Users
                    className="w-20 h-20 text-blue-600 absolute top-0 left-3"
                    strokeWidth={1}
                  />
                  <Users
                    className="w-20 h-20 text-blue-700 absolute top-0 left-6"
                    strokeWidth={1}
                  />
                </div>
              </div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-900">
                140,896,887
              </div>
              <div className="text-lg text-gray-600">registered users</div>
              <div className="text-2xl font-bold text-gray-800">2023</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trades Per Day Section */}
      <div className="py-12 xs:py-16 sm:py-20 px-4 xs:px-5 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Trades Per Day
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto">
              From 2014 to 2020, the number of trades made per day increased by
              more than 800%!
            </p>
          </div>

          {/* Trade Comparison */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl mx-auto">
            {/* 2014 */}
            <div className="text-center flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-4">
                2014
              </div>
              <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
                145,150
              </div>
            </div>

            {/* Divider/Arrow */}
            <div className="hidden md:block w-32 h-1 bg-gradient-to-r from-orange-500 to-orange-300"></div>
            <div className="md:hidden h-16 w-1 bg-gradient-to-b from-orange-500 to-orange-300"></div>

            {/* 2023 */}
            <div className="text-center flex-1">
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-4">
                2023
              </div>
              <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
                1,606,705
              </div>
            </div>
          </div>

          {/* Growth Indicator */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-orange-500/20 border-2 border-orange-500 rounded-full px-8 py-4">
              <span className="text-2xl sm:text-3xl font-bold text-orange-300">
                +800% Growth
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawn by Traders per Month Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-6">
              Withdrawn by Traders per Month
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              Traders withdrew 2.9 times more money from the platform in 2020
              than in 2016
            </p>
          </div>

          {/* Withdrawal Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {/* 2014 */}
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-gray-600 mb-2">2014</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-900">
                $134,580
              </div>
              <div className="text-lg text-gray-600">per month</div>
            </div>

            {/* 2016 */}
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-gray-600 mb-2">2016</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-900">
                $6,827,280
              </div>
              <div className="text-lg text-gray-600">per month</div>
            </div>

            {/* 2020 */}
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-gray-600 mb-2">2020</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-900">
                $20,375,097
              </div>
              <div className="text-lg text-gray-600">per month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Request Processing Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-6">
              Withdrawal Request Processing
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto">
              In 2016, we switched to a quick withdrawal system, which allowed
              us to process 68% of withdrawal requests immediately.
            </p>
          </div>

          {/* Processing Time Display */}
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-blue-900 flex items-center justify-center bg-blue-50">
                <div className="text-center">
                  <div className="text-7xl font-bold text-orange-500">10</div>
                </div>
              </div>
              <Clock className="absolute -top-4 -right-4 w-16 h-16 text-blue-900" />
            </div>
            <div className="text-3xl font-bold text-blue-900">hours</div>
            <div className="text-xl text-gray-600 text-center max-w-md">
              average time to process a withdrawal request
            </div>
          </div>
        </div>
      </div>

      {/* Order Processing Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-6">
              Order Processing
            </h2>
          </div>

          {/* Processing Speed Display */}
          <div className="flex flex-col items-center space-y-8 mb-12">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-blue-500 flex items-center justify-center bg-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-7xl font-bold text-blue-900">0.6</div>
                  </div>
                </div>
                <Timer className="absolute -top-2 -right-2 w-12 h-12 text-blue-900 opacity-30" />
              </div>
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-700">
                sec
              </div>
            </div>
            <div className="text-xl text-gray-600 text-center max-w-2xl">
              We are constantly improving our order processing system, and every
              year we reach new performance milestones.
            </div>
          </div>

          {/* Chart visualization placeholder */}
          <div className="max-w-4xl mx-auto h-32 relative">
            <svg className="w-full h-full" viewBox="0 0 800 150">
              {/* Wavy line chart */}
              <path
                d="M 50 100 Q 150 80, 250 90 T 450 70 T 650 60 T 750 50"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFA500" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Affiliates Involved Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-blue-800 to-blue-900 relative overflow-hidden">
        {/* Background numbers */}
        <div className="absolute top-10 right-10 text-9xl font-bold text-white opacity-5">
          2023
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Affiliates Involved
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto">
              Partnering with M4 Capital is always an advantage. Thousands of
              affiliates around the world already know this, and every year more
              and more of them join us!
            </p>
          </div>

          {/* Affiliate Growth Chart */}
          <div className="relative h-64 mb-8">
            <svg className="w-full h-full" viewBox="0 0 1000 300">
              {/* Grid lines */}
              <line
                x1="100"
                y1="50"
                x2="100"
                y2="250"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <line
                x1="100"
                y1="250"
                x2="900"
                y2="250"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />

              {/* Growth line */}
              <path
                d="M 200 230 Q 350 180, 500 150 Q 650 120, 800 80"
                fill="none"
                stroke="#FF6B47"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="200" cy="230" r="8" fill="#FF6B47" />
              <circle cx="500" cy="150" r="8" fill="#FF6B47" />
              <circle cx="800" cy="80" r="8" fill="#FF6B47" />

              {/* Labels */}
              <text
                x="200"
                y="270"
                fill="white"
                fontSize="16"
                textAnchor="middle"
              >
                2021
              </text>
              <text
                x="500"
                y="270"
                fill="white"
                fontSize="16"
                textAnchor="middle"
              >
                2022
              </text>
              <text
                x="800"
                y="270"
                fill="white"
                fontSize="16"
                textAnchor="middle"
              >
                2023
              </text>

              {/* Values */}
              <text
                x="200"
                y="210"
                fill="white"
                fontSize="20"
                textAnchor="middle"
                fontWeight="bold"
              >
                293K
              </text>
              <text
                x="500"
                y="130"
                fill="white"
                fontSize="20"
                textAnchor="middle"
                fontWeight="bold"
              >
                324K
              </text>
              <text
                x="800"
                y="60"
                fill="white"
                fontSize="20"
                textAnchor="middle"
                fontWeight="bold"
              >
                378K
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center justify-center p-4">
              <span className="text-3xl font-bold text-blue-900">VISA</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-3xl font-bold text-green-600">
                NETELLER
              </span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-3xl font-bold text-gray-800">volet</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-3xl font-bold text-purple-600">Skrill</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-2xl font-bold text-gray-900">
                Apple Pay
              </span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-2xl font-bold text-blue-600">G Pay</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-2xl font-bold text-red-600">
                Mastercard
              </span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="text-2xl font-bold text-blue-500">CARDANO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join Millions of Traders Worldwide
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-8">
            Start your trading journey with M4 Capital today
          </p>
          <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}
