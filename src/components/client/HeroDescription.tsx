"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HeroDescriptionProps {
  description: string;
  contentIndex: number;
  animation: {
    initial: { opacity: number; x?: number; y?: number; scale?: number };
    animate: { opacity: number; x?: number; y?: number; scale?: number };
    exit: { opacity: number; x?: number; y?: number; scale?: number };
  };
}

export default function HeroDescription({
  description,
  contentIndex,
  animation,
}: HeroDescriptionProps) {
  return (
    <div className="h-16 xs:h-20 sm:h-28 md:h-32 flex items-center justify-center mb-4 xs:mb-6 sm:mb-8">
      <AnimatePresence mode="wait">
        <motion.p
          key={`desc-${contentIndex}`}
          variants={animation}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.7, ease: "circOut" }}
          className="text-base xs:text-lg sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-orange-500 to-gray-900 dark:from-white dark:via-gray-500 dark:to-white drop-shadow-md max-w-xs xs:max-w-md sm:max-w-2xl md:max-w-3xl mx-auto px-2"
        >
          {description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
