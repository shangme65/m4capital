"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollDownIndicator() {
  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
      <motion.button
        onClick={handleScrollDown}
        className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className="text-xs uppercase tracking-wider">Scroll</span>
        <ChevronDown className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
