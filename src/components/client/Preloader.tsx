"use client";
import { motion } from "framer-motion";

const Preloader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3, duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          duration: 1.4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-32 h-32"
      >
        <img src="/m4capitallogo2.png" alt="Loading..." />
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
