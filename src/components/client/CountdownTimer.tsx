"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSession } from "next-auth/react";

export const COUNTDOWN_STORAGE_KEY = "m4capital-promo-end-date";
export const PROMO_DURATION_DAYS = 7;
export const PROMO_BONUS_PERCENT = 50;

// Helper to check if promo is active (can be used by other components)
export function isPromoActive(): boolean {
  if (typeof window === "undefined") return false;
  const storedEndDate = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
  if (!storedEndDate) return false;
  const targetDate = new Date(storedEndDate);
  return targetDate.getTime() > Date.now();
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const { resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user has already claimed first deposit bonus
  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/user/bonus-status")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasClaimedFirstDepositBonus) {
            setHasClaimed(true);
            setIsExpired(true);
          }
        })
        .catch((error) => {
          console.error("Failed to check bonus status:", error);
        });
    }
  }, [session]);

  useEffect(() => {
    // If user has already claimed the bonus, don't show the countdown
    if (hasClaimed) {
      setIsExpired(true);
      setIsInitialized(true);
      return;
    }
    // Get or create the target date from localStorage
    let targetDate: Date;
    const storedEndDate = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    
    if (storedEndDate) {
      targetDate = new Date(storedEndDate);
      // If the stored date has passed, the promo is expired
      if (targetDate.getTime() <= Date.now()) {
        setIsExpired(true);
        setIsInitialized(true);
        return;
      }
    } else {
      // First visit - set target date to 7 days from now
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + PROMO_DURATION_DAYS);
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, targetDate.toISOString());
    }

    setIsInitialized(true);

    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        // Timer expired - don't reset
        setIsExpired(true);
      }
    };

    // Initial update
    updateCountdown();
    
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render until initialized
  if (!isInitialized) {
    return null;
  }

  // Show "Offer Expired" badge when user has claimed or timer ran out
  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className={`absolute bottom-20 left-4 md:bottom-20 md:left-4 z-[7] backdrop-blur-md border rounded-lg p-3 min-w-[260px] hidden lg:block shadow-lg ${
          isDark
            ? "bg-gray-800/80 border-gray-600/40 shadow-gray-900/40"
            : "bg-gray-100/90 border-gray-300 shadow-gray-400/20"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Clock className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Limited Time Offer
          </p>
        </div>
        <p className={`text-xs font-bold mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          50% Deposit Bonus
        </p>
        <div className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 ${
          isDark ? "bg-red-900/20 border border-red-800/30" : "bg-red-50 border border-red-200"
        }`}>
          <span className="text-red-500 text-sm">✕</span>
          <p className={`text-sm font-bold ${isDark ? "text-red-400" : "text-red-500"}`}>
            Offer Expired
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className={`absolute bottom-20 left-4 md:bottom-20 md:left-4 z-[7] backdrop-blur-md border rounded-lg p-3 min-w-[260px] hidden lg:block shadow-lg ${
        isDark
          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 shadow-orange-500/20"
          : "bg-gradient-to-r from-orange-100 to-red-100 border-orange-300 shadow-orange-400/40"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`w-4 h-4 ${
          isDark ? "text-orange-400" : "text-orange-600"
        }`} />
        <p className={`text-xs font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>Limited Time Offer</p>
      </div>
      <p className={`text-xs mb-3 font-bold ${
        isDark ? "text-white/80" : "text-gray-700"
      }`}>50% Deposit Bonus Ends In:</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className={`rounded px-2 py-1 mb-1 ${
              isDark ? "bg-white/10" : "bg-white/60"
            }`}>
              <p className={`text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>{item.value.toString().padStart(2, "0")}</p>
            </div>
            <p className={`text-xs ${
              isDark ? "text-white/60" : "text-gray-600"
            }`}>{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
