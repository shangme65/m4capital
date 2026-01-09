"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  { label: "Active Traders", value: "2M+", position: "top-16 left-8 sm:left-16 md:top-24 md:left-20" },
  { label: "Trading Volume", value: "$5B+", position: "top-16 right-8 sm:right-16 md:top-24 md:right-20" },
  { label: "Uptime", value: "99.9%", position: "bottom-48 left-8 sm:left-16 md:bottom-56 md:left-20" },
  { label: "Assets", value: "500+", position: "bottom-48 right-8 sm:right-16 md:bottom-56 md:right-20" },
];

export default function HeroStats() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
            className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl px-4 py-3 shadow-xl"
            whileHover={{ scale: 1.05, borderColor: "rgba(249, 115, 22, 0.5)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedCounter value={stat.value} duration={2.5} />
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
