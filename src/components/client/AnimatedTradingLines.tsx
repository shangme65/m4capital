"use client";

import { motion } from "framer-motion";

const tradingLines = [
  { path: "M0,80 Q100,40 200,60 T400,50", delay: 0, color: "rgba(34,197,94,0.3)" },
  { path: "M0,120 Q100,100 200,110 T400,100", delay: 0.5, color: "rgba(249,115,22,0.3)" },
  { path: "M0,160 Q100,140 200,150 T400,145", delay: 1, color: "rgba(59,130,246,0.3)" },
];

export default function AnimatedTradingLines() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        {tradingLines.map((line, index) => (
          <motion.path
            key={index}
            d={line.path}
            stroke={line.color}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 3,
              delay: line.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Animated candlesticks */}
        {[50, 150, 250, 350].map((x, i) => (
          <g key={`candle-${i}`}>
            <motion.line
              x1={x}
              y1={60}
              x2={x}
              y2={140}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
            <motion.rect
              x={x - 5}
              y={80}
              width={10}
              height={40}
              fill={i % 2 === 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: [0, 0.7, 0], scaleY: [0, 1, 1] }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
