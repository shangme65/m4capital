"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronUp } from "lucide-react";

// Hook for counting animation
const useCountUp = (
  end: number,
  duration: number = 2000,
  startCounting: boolean = false
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function for smooth count
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (end - startValue) * easeOutQuart
      );

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);

  return count;
};

// Format number with spaces (European style)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Format currency with spaces
const formatCurrency = (num: number): string => {
  return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Swipeable Carousel Component
interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
}

const SwipeCarousel: React.FC<CarouselProps> = ({
  children,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }
    if (touchStart - touchEnd < -75) {
      // Swipe right
      setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {children.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              idx === currentIndex ? "bg-gray-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// User Icon Component (single person)
const SingleUserIcon = () => (
  <svg
    className="w-20 h-20 text-indigo-200"
    viewBox="0 0 80 100"
    fill="currentColor"
  >
    <circle cx="40" cy="20" r="15" />
    <path d="M20 95 Q20 60 40 55 Q60 60 60 95 Z" />
  </svg>
);

// User Icon Component (two people)
const TwoUsersIcon = () => (
  <svg
    className="w-24 h-24 text-indigo-300"
    viewBox="0 0 100 100"
    fill="currentColor"
  >
    <circle cx="35" cy="25" r="12" />
    <path d="M15 90 Q15 60 35 55 Q55 60 55 90 Z" />
    <circle cx="65" cy="25" r="12" />
    <path d="M45 90 Q45 60 65 55 Q85 60 85 90 Z" />
  </svg>
);

// User Icon Component (three people)
const ThreeUsersIcon = () => (
  <svg
    className="w-28 h-28 text-indigo-400"
    viewBox="0 0 120 100"
    fill="currentColor"
  >
    <circle cx="30" cy="25" r="10" />
    <path d="M15 85 Q15 55 30 50 Q45 55 45 85 Z" />
    <circle cx="60" cy="20" r="12" />
    <path d="M40 90 Q40 55 60 50 Q80 55 80 90 Z" />
    <circle cx="90" cy="25" r="10" />
    <path d="M75 85 Q75 55 90 50 Q105 55 105 85 Z" />
  </svg>
);

// Stopwatch Icon
const StopwatchIcon = ({ number }: { number: number }) => (
  <div className="relative w-24 h-24">
    <svg
      className="w-full h-full text-indigo-800"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      {/* Outer circle with notches */}
      <circle cx="50" cy="55" r="40" />
      {/* Top button */}
      <rect x="45" y="5" width="10" height="15" rx="2" fill="currentColor" />
      {/* Side button */}
      <rect
        x="75"
        y="25"
        width="12"
        height="8"
        rx="2"
        fill="currentColor"
        transform="rotate(45 75 25)"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center pt-2">
      <span className="text-3xl font-bold text-indigo-800">{number}</span>
    </div>
  </div>
);

// Stats data for registered accounts
const registeredAccountsData = [
  { year: 2014, users: 965650, icon: "single" },
  { year: 2016, users: 14514300, icon: "double" },
  { year: 2023, users: 140896887, icon: "triple" },
];

// Stats data for trades per day
const tradesPerDayData = [
  { year: 2014, trades: 145150 },
  { year: 2023, trades: 1606705 },
];

// Stats data for withdrawals
const withdrawalData = [
  { year: 2014, amount: 134580 },
  { year: 2016, amount: 6827280 },
  { year: 2020, amount: 20375097 },
];

export default function InNumbersPage() {
  // Refs for scroll-triggered animations
  const heroRef = useRef(null);
  const accountsRef = useRef(null);
  const tradesRef = useRef(null);
  const withdrawalsRef = useRef(null);
  const withdrawalProcessingRef = useRef(null);
  const orderProcessingRef = useRef(null);
  const affiliatesRef = useRef(null);

  // InView hooks
  const heroInView = useInView(heroRef, { once: true });
  const accountsInView = useInView(accountsRef, { once: true });
  const tradesInView = useInView(tradesRef, { once: true });
  const withdrawalsInView = useInView(withdrawalsRef, { once: true });
  const withdrawalProcessingInView = useInView(withdrawalProcessingRef, {
    once: true,
  });
  const orderProcessingInView = useInView(orderProcessingRef, { once: true });
  const affiliatesInView = useInView(affiliatesRef, { once: true });

  // Count up values for accounts
  const accounts2014 = useCountUp(
    registeredAccountsData[0].users,
    2000,
    accountsInView
  );
  const accounts2016 = useCountUp(
    registeredAccountsData[1].users,
    2000,
    accountsInView
  );
  const accounts2023 = useCountUp(
    registeredAccountsData[2].users,
    2000,
    accountsInView
  );

  // Count up values for trades
  const trades2014 = useCountUp(tradesPerDayData[0].trades, 2000, tradesInView);
  const trades2023 = useCountUp(tradesPerDayData[1].trades, 2000, tradesInView);

  // Count up values for withdrawals
  const withdrawal2014 = useCountUp(
    withdrawalData[0].amount,
    2000,
    withdrawalsInView
  );
  const withdrawal2016 = useCountUp(
    withdrawalData[1].amount,
    2000,
    withdrawalsInView
  );
  const withdrawal2020 = useCountUp(
    withdrawalData[2].amount,
    2000,
    withdrawalsInView
  );

  // Count up for withdrawal processing hours
  const processingHours = useCountUp(10, 1500, withdrawalProcessingInView);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Purple Gradient */}
      <section ref={heroRef} className="relative pt-20 pb-24 overflow-hidden">
        {/* Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #6d28d9 60%, #7c3aed 100%)",
          }}
        />

        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='200' fill='none'/%3E%3Ctext x='50' y='100' font-family='Arial' font-size='80' fill='%23ffffff' opacity='0.1'%3EIQOPTION%3C/text%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Our Trading Platform In Numbers
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Trace the history of our company since 2014
            </p>
          </motion.div>
        </div>
      </section>

      {/* Accounts Registered Section */}
      <section ref={accountsRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={accountsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4">
              Accounts Registered
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              The number of active users is growing rapidly from year to year
            </p>
          </motion.div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <SwipeCarousel>
              {/* 2014 */}
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <SingleUserIcon />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                  {formatNumber(accounts2014)}
                </div>
                <div className="text-gray-500 mb-2">registered users</div>
                <div className="text-xl font-bold text-gray-800">2014</div>
              </div>

              {/* 2016 */}
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <TwoUsersIcon />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                  {formatNumber(accounts2016)}
                </div>
                <div className="text-gray-500 mb-2">registered users</div>
                <div className="text-xl font-bold text-gray-800">2016</div>
              </div>

              {/* 2023 */}
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <ThreeUsersIcon />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                  {formatNumber(accounts2023)}
                </div>
                <div className="text-gray-500 mb-2">registered users</div>
                <div className="text-xl font-bold text-gray-800">2023</div>
              </div>
            </SwipeCarousel>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {/* 2014 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={accountsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-8"
            >
              <div className="flex justify-center mb-6">
                <SingleUserIcon />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                {formatNumber(accounts2014)}
              </div>
              <div className="text-gray-500 mb-2">registered users</div>
              <div className="text-xl font-bold text-gray-800">2014</div>
            </motion.div>

            {/* 2016 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={accountsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-8"
            >
              <div className="flex justify-center mb-6">
                <TwoUsersIcon />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                {formatNumber(accounts2016)}
              </div>
              <div className="text-gray-500 mb-2">registered users</div>
              <div className="text-xl font-bold text-gray-800">2016</div>
            </motion.div>

            {/* 2023 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={accountsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center py-8"
            >
              <div className="flex justify-center mb-6">
                <ThreeUsersIcon />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                {formatNumber(accounts2023)}
              </div>
              <div className="text-gray-500 mb-2">registered users</div>
              <div className="text-xl font-bold text-gray-800">2023</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trades Per Day Section */}
      <section ref={tradesRef} className="py-16 relative overflow-hidden">
        {/* Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #3730a3 60%, #312e81 100%)",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tradesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trades Per Day
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              From 2014 to 2020, the number of trades made per day increased by
              more than 800%!
            </p>
          </motion.div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <SwipeCarousel className="text-white">
              {/* 2014 */}
              <div className="text-center py-8">
                <div className="text-orange-400 text-xl mb-2">2014</div>
                <div className="text-5xl font-bold text-white mb-2">
                  {formatNumber(trades2014)}
                </div>
              </div>

              {/* 2023 */}
              <div className="text-center py-8">
                <div className="text-orange-400 text-xl mb-2">2023</div>
                <div className="text-5xl font-bold text-white mb-2">
                  {formatNumber(trades2023)}
                </div>
              </div>
            </SwipeCarousel>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 gap-16 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={tradesInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-8"
            >
              <div className="text-orange-400 text-xl mb-2">2014</div>
              <div className="text-5xl font-bold text-white mb-2">
                {formatNumber(trades2014)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={tradesInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-8"
            >
              <div className="text-orange-400 text-xl mb-2">2023</div>
              <div className="text-5xl font-bold text-white mb-2">
                {formatNumber(trades2023)}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Withdrawn by Traders Section */}
      <section ref={withdrawalsRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={withdrawalsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4">
              Withdrawn by Traders per Month
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Traders withdrew 2.9 times more money from the platform in 2020
              than in 2016
            </p>
          </motion.div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <SwipeCarousel>
              {/* 2014 */}
              <div className="text-center py-8">
                <div className="text-xl font-bold text-gray-800 mb-4">2014</div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                  {formatCurrency(withdrawal2014)}
                </div>
                <div className="text-gray-500">per month</div>
              </div>

              {/* 2016 */}
              <div className="text-center py-8">
                <div className="text-xl font-bold text-gray-800 mb-4">2016</div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                  {formatCurrency(withdrawal2016)}
                </div>
                <div className="text-gray-500">per month</div>
              </div>

              {/* 2020 */}
              <div className="text-center py-8">
                <div className="text-xl font-bold text-gray-800 mb-4">2020</div>
                <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                  {formatCurrency(withdrawal2020)}
                </div>
                <div className="text-gray-500">per month</div>
              </div>
            </SwipeCarousel>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={withdrawalsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center py-8"
            >
              <div className="text-xl font-bold text-gray-800 mb-4">2014</div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                {formatCurrency(withdrawal2014)}
              </div>
              <div className="text-gray-500">per month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={withdrawalsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-8"
            >
              <div className="text-xl font-bold text-gray-800 mb-4">2016</div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                {formatCurrency(withdrawal2016)}
              </div>
              <div className="text-gray-500">per month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={withdrawalsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center py-8"
            >
              <div className="text-xl font-bold text-gray-800 mb-4">2020</div>
              <div className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
                {formatCurrency(withdrawal2020)}
              </div>
              <div className="text-gray-500">per month</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Withdrawal Request Processing Section */}
      <section ref={withdrawalProcessingRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={withdrawalProcessingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6">
              Withdrawal Request Processing
            </h2>
            <p className="text-gray-600 mb-12">
              In 2016, we switched to a quick withdrawal system, which allowed
              us to process 68% of withdrawal requests immediately.
            </p>

            <div className="flex justify-center mb-6">
              <StopwatchIcon number={processingHours} />
            </div>

            <div className="text-2xl font-bold text-indigo-700 mb-2">hours</div>
            <p className="text-gray-600">
              average time to process a withdrawal request
            </p>
          </motion.div>
        </div>
      </section>

      {/* Order Processing Section */}
      <section ref={orderProcessingRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={orderProcessingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6">
              Order Processing
            </h2>

            {/* Animated arrows section */}
            <div className="relative h-32 mb-6 overflow-hidden">
              {/* Background chart line */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg viewBox="0 0 400 80" className="w-full max-w-md h-16">
                  <path
                    d="M0,40 Q50,60 100,35 T200,45 T300,30 T400,50"
                    stroke="#f97316"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Animated falling arrows */}
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-gray-300"
                    style={{ left: `${15 + i * 18}%` }}
                    initial={{ y: -20, opacity: 0 }}
                    animate={
                      orderProcessingInView
                        ? {
                            y: [0, 100],
                            opacity: [0.3, 0],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                        transform="rotate(90 12 12)"
                      />
                    </svg>
                  </motion.div>
                ))}
              </div>

              {/* Center stopwatch */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <div className="text-2xl font-bold text-indigo-700">
                    0.6 <span className="text-sm font-normal">sec</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600">
              We are constantly improving our order processing system, and every
              year we reach new performance milestones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Affiliates Involved Section */}
      <section ref={affiliatesRef} className="py-16 relative overflow-hidden">
        {/* Purple gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #3730a3 60%, #312e81 100%)",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={affiliatesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Affiliates Involved
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Partnering with M4Capital is always an advantage. Thousands of
              affiliates around the world already know this, and every year more
              and more of them join us!
            </p>
          </motion.div>

          {/* Animated Chart */}
          <div className="max-w-lg mx-auto">
            <svg viewBox="0 0 400 200" className="w-full">
              {/* Grid lines */}
              <line
                x1="50"
                y1="150"
                x2="350"
                y2="150"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <line
                x1="50"
                y1="100"
                x2="350"
                y2="100"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <line
                x1="50"
                y1="50"
                x2="350"
                y2="50"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />

              {/* Animated path */}
              <motion.path
                d="M80,130 Q150,120 200,90 Q250,70 320,40"
                stroke="#f97316"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={affiliatesInView ? { pathLength: 1 } : {}}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Data points */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={affiliatesInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {/* 2021 point */}
                <circle
                  cx="80"
                  cy="130"
                  r="8"
                  fill="white"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <text
                  x="80"
                  y="175"
                  fill="white"
                  fontSize="14"
                  textAnchor="middle"
                >
                  2021
                </text>
                <text
                  x="80"
                  y="115"
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  293
                </text>
                <text
                  x="80"
                  y="102"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  K
                </text>
              </motion.g>

              <motion.g
                initial={{ opacity: 0 }}
                animate={affiliatesInView ? { opacity: 1 } : {}}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {/* 2022 point */}
                <circle
                  cx="200"
                  cy="90"
                  r="8"
                  fill="white"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <text
                  x="200"
                  y="175"
                  fill="white"
                  fontSize="14"
                  textAnchor="middle"
                >
                  2022
                </text>
                <text
                  x="200"
                  y="75"
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  324
                </text>
                <text
                  x="200"
                  y="62"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  K
                </text>
              </motion.g>

              <motion.g
                initial={{ opacity: 0 }}
                animate={affiliatesInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                {/* 2023 point */}
                <circle
                  cx="320"
                  cy="40"
                  r="8"
                  fill="white"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <text
                  x="320"
                  y="175"
                  fill="#f97316"
                  fontSize="14"
                  textAnchor="middle"
                >
                  2023
                </text>
                <text
                  x="320"
                  y="25"
                  fill="white"
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  378
                </text>
                <text
                  x="320"
                  y="12"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  K
                </text>
              </motion.g>
            </svg>
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
              <span className="text-gray-700">M4Capital in Numbers</span>
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
                href="/blog"
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
    </div>
  );
}
