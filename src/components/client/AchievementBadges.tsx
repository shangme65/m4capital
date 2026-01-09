"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Award, CheckCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

const badges = [
  { icon: Shield, text: "SSL Secured", color: "text-green-400" },
  { icon: Award, text: "Best Platform 2025", color: "text-yellow-400" },
  { icon: CheckCircle, text: "Verified", color: "text-blue-400" },
  { icon: TrendingUp, text: "Top Rated", color: "text-orange-400" },
];

export default function AchievementBadges() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % badges.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const badge = badges[currentIndex];
  const Icon = badge.icon;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[7] flex justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-full px-4 py-1 flex items-center gap-2"
        >
          <Icon className={`w-4 h-4 ${badge.color}`} />
          <span className="text-white text-sm font-medium whitespace-nowrap">{badge.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
