"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function AnimatedGradientBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  // Light mode uses darker, more saturated colors for visibility
  // Dark mode uses lighter, more transparent colors
  const lightModeGradients1 = [
    "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.5) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 0%, rgba(147,51,234,0.5) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 100%, rgba(249,115,22,0.5) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 100%, rgba(147,51,234,0.5) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.5) 0%, transparent 50%)",
  ];

  const darkModeGradients1 = [
    "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 0%, rgba(59,130,246,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 100%, rgba(249,115,22,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 100%, rgba(59,130,246,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.3) 0%, transparent 50%)",
  ];

  const lightModeGradients2 = [
    "radial-gradient(circle at 100% 100%, rgba(236,72,153,0.4) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 100%, rgba(251,146,60,0.4) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 0%, rgba(236,72,153,0.4) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 0%, rgba(251,146,60,0.4) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 100%, rgba(236,72,153,0.4) 0%, transparent 50%)",
  ];

  const darkModeGradients2 = [
    "radial-gradient(circle at 100% 100%, rgba(168,85,247,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 100%, rgba(34,197,94,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 0% 0%, rgba(168,85,247,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 0%, rgba(34,197,94,0.3) 0%, transparent 50%)",
    "radial-gradient(circle at 100% 100%, rgba(168,85,247,0.3) 0%, transparent 50%)",
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30 dark:opacity-30"
        animate={{
          background: isDark ? darkModeGradients1 : lightModeGradients1,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-20 dark:opacity-20"
        animate={{
          background: isDark ? darkModeGradients2 : lightModeGradients2,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
