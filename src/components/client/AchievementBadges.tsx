"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Award, CheckCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const badges = [
  { icon: Shield, text: "SSL Secured", color: "text-green-400" },
  { icon: Award, text: "Best Platform 2025", color: "text-yellow-400" },
  { icon: CheckCircle, text: "Verified", color: "text-blue-400" },
  { icon: TrendingUp, text: "Top Rated", color: "text-orange-400" },
];

export default function AchievementBadges() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % badges.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const badge = badges[currentIndex];
  const Icon = badge.icon;

  // Enhanced icon colors for better visibility in light mode
  const getIconColor = (baseColor: string) => {
    if (!isDark) {
      // Darker, more saturated versions for light mode
      const lightModeColors: { [key: string]: string } = {
        "text-green-400": "text-green-600",
        "text-yellow-400": "text-yellow-600",
        "text-blue-400": "text-blue-600",
        "text-orange-400": "text-orange-600",
      };
      return lightModeColors[baseColor] || baseColor;
    }
    return baseColor;
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[7] flex justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className={`backdrop-blur-sm rounded-full px-4 py-1 flex items-center gap-2 shadow-lg ${
            isDark 
              ? "bg-white/5 shadow-black/20" 
              : "bg-gray-800/10 border border-gray-300/40 shadow-gray-400/30"
          }`}
        >
          <Icon className={`w-4 h-4 ${getIconColor(badge.color)}`} />
          <span className={`text-sm font-medium whitespace-nowrap ${
            isDark ? "text-white" : "text-gray-900"
          }`}>{badge.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
