"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { allTestimonials } from "@/lib/testimonials-data";
import { useTheme } from "@/contexts/ThemeContext";

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + allTestimonials.length) % allTestimonials.length);

  return (
    <div className={`absolute bottom-20 right-4 md:bottom-20 md:right-4 z-[7] w-72 backdrop-blur-md border rounded-lg p-3 hidden xl:block shadow-lg ${
      isDark
        ? "bg-white/10 border-white/20 shadow-black/20"
        : "bg-white/90 border-gray-300 shadow-gray-400/40"
    }`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1 mb-2">
            {[...Array(allTestimonials[currentIndex].rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className={`text-xs mb-2 font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>&quot;{allTestimonials[currentIndex].text}&quot;</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Image
                  src={allTestimonials[currentIndex].image}
                  alt={allTestimonials[currentIndex].name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className={`text-xs font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>{allTestimonials[currentIndex].name}</p>
                <p className={`text-xs font-bold ${
                  isDark ? "text-white/60" : "text-gray-600"
                }`}>{allTestimonials[currentIndex].role}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={prev} className={`p-1 rounded ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
              }`}>
                <ChevronLeft className={`w-4 h-4 ${
                  isDark ? "text-white/60" : "text-gray-600"
                }`} />
              </button>
              <button onClick={next} className={`p-1 rounded ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
              }`}>
                <ChevronRight className={`w-4 h-4 ${
                  isDark ? "text-white/60" : "text-gray-600"
                }`} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
