"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BackgroundSliderProps {
  images: string[];
}

export default function BackgroundSlider({ images }: BackgroundSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <AnimatePresence>
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          backgroundImage: `url(${images[index]})`,
        }}
        className="absolute inset-0 w-full h-full bg-cover bg-center"
      />
    </AnimatePresence>
  );
}