"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

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

  useEffect(() => {
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

  // Don't render if expired or not initialized
  if (!isInitialized || isExpired) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="absolute bottom-20 left-4 md:bottom-20 md:left-4 z-[7] bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border border-orange-500/40 rounded-lg p-3 min-w-[260px] hidden lg:block"
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-orange-400" />
        <p className="text-white text-xs font-bold">Limited Time Offer</p>
      </div>
      <p className="text-white/80 text-xs mb-3 font-bold">50% Deposit Bonus Ends In:</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="bg-white/10 rounded px-2 py-1 mb-1">
              <p className="text-white text-lg font-bold">{item.value.toString().padStart(2, "0")}</p>
            </div>
            <p className="text-white/60 text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
