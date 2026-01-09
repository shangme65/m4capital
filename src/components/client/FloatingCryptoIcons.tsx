"use client";

import { motion } from "framer-motion";

const cryptoIcons = [
  { symbol: "₿", color: "#F7931A", size: "text-6xl", position: "top-20 left-[10%]", delay: 0 },
  { symbol: "Ξ", color: "#627EEA", size: "text-5xl", position: "top-40 right-[15%]", delay: 0.5 },
  { symbol: "₮", color: "#26A17B", size: "text-4xl", position: "bottom-40 left-[20%]", delay: 1 },
  { symbol: "₿", color: "#F7931A", size: "text-4xl", position: "top-60 right-[25%]", delay: 1.5 },
  { symbol: "Ξ", color: "#627EEA", size: "text-5xl", position: "bottom-60 right-[10%]", delay: 2 },
  { symbol: "₮", color: "#26A17B", size: "text-3xl", position: "top-[30%] left-[5%]", delay: 2.5 },
  { symbol: "₿", color: "#F7931A", size: "text-3xl", position: "bottom-[30%] right-[5%]", delay: 3 },
];

export default function FloatingCryptoIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cryptoIcons.map((icon, index) => (
        <motion.div
          key={index}
          className={`absolute ${icon.position} ${icon.size} font-bold opacity-15`}
          style={{ color: icon.color }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.08, 0.2, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: icon.delay,
            ease: "easeInOut",
          }}
        >
          {icon.symbol}
        </motion.div>
      ))}
    </div>
  );
}
