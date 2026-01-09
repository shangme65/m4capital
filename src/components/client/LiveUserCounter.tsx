"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AnimatedCounter from "./AnimatedCounter";

export default function LiveUserCounter() {
  const [onlineUsers, setOnlineUsers] = useState(2847);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10 - 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 z-[7] bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 hidden"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div>
          <p className="text-white/60 text-xs">Traders Online</p>
          <p className="text-white text-lg font-bold">
            <AnimatedCounter value={onlineUsers.toString()} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
