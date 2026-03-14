"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedCounter from "./AnimatedCounter";
import { useTheme } from "@/contexts/ThemeContext";

const stats = [
  { label: "Active Traders", value: "2M+", position: "top-16 left-8 sm:left-16 md:top-24 md:left-20" },
  { label: "Trading Volume", value: "$5B+", position: "top-16 right-8 sm:right-16 md:top-24 md:right-20" },
  { label: "Uptime", value: "99.9%", position: "bottom-48 left-8 sm:left-16 md:bottom-56 md:left-20" },
  { label: "Assets", value: "500+", position: "bottom-48 right-8 sm:right-16 md:bottom-56 md:right-20" },
];

export default function HeroStats() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className={`absolute ${stat.position}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{
            duration: 0.8,
            delay: index * 0.2,
            ease: "backOut",
          }}
        >
          <motion.div
            className={`backdrop-blur-sm border rounded-xl px-4 py-3 shadow-xl ${
              isDark 
                ? "bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/30" 
                : "bg-gradient-to-br from-white/60 to-gray-100/60 border-gray-300/40"
            }`}
            whileHover={{ 
              scale: 1.05, 
              borderColor: isDark ? "rgba(249, 115, 22, 0.5)" : "rgba(249, 115, 22, 0.7)" 
            }}
            transition={{ duration: 0.2 }}
          >
            <div className={`text-2xl font-bold mb-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <AnimatedCounter value={stat.value} duration={2.5} />
            </div>
            <div className={`text-xs uppercase tracking-wider ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>{stat.label}</div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
