"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HeroTitleProps {
  title: string;
  contentIndex: number;
  animation: {
    initial: { opacity: number; x?: number; y?: number; scale?: number };
    animate: { opacity: number; x?: number; y?: number; scale?: number };
    exit: { opacity: number; x?: number; y?: number; scale?: number };
  };
}

export default function HeroTitle({ title, contentIndex, animation }: HeroTitleProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.h1
        key={`title-${contentIndex}`}
        variants={animation}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.7, ease: "circOut" }}
        className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 xs:mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-500 to-white leading-tight"
        style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
      >
        {title}
      </motion.h1>
    </AnimatePresence>
  );
}
