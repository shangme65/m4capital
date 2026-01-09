"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { allTestimonials } from "@/lib/testimonials-data";

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % allTestimonials.length);
  const prev = () => setCurrentIndex((p) => (p - 1 + allTestimonials.length) % allTestimonials.length);

  return (
    <div className="absolute bottom-20 right-4 md:bottom-20 md:right-4 z-[7] w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 hidden xl:block">
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
          <p className="text-white text-xs mb-2 font-bold">&quot;{allTestimonials[currentIndex].text}&quot;</p>
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
                <p className="text-white text-xs font-bold">{allTestimonials[currentIndex].name}</p>
                <p className="text-white/60 text-xs font-bold">{allTestimonials[currentIndex].role}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={prev} className="p-1 hover:bg-white/10 rounded">
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <button onClick={next} className="p-1 hover:bg-white/10 rounded">
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
