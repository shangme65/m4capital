"use client";

import { motion } from "framer-motion";

export default function AnimatedGradientBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(59,130,246,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(249,115,22,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(59,130,246,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, rgba(249,115,22,0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 100% 100%, rgba(168,85,247,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(34,197,94,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, rgba(168,85,247,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(34,197,94,0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(168,85,247,0.3) 0%, transparent 50%)",
          ],
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
