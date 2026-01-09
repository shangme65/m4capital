"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function InteractiveDemoPreview() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const lineOffset = useTransform(mouseX, [0, 500], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById("demo-preview")?.getBoundingClientRect();
      if (rect) {
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      id="demo-preview"
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[7] w-64 h-32 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden hidden md:block"
    >
      <svg className="w-full h-full">
        <motion.path
          d="M0 80 Q 64 60, 128 70 T 256 80"
          fill="none"
          stroke="rgba(34,197,94,0.6)"
          strokeWidth="2"
          style={{ x: lineOffset }}
        />
        <motion.path
          d="M0 100 Q 64 120, 128 110 T 256 100"
          fill="none"
          stroke="rgba(249,115,22,0.6)"
          strokeWidth="2"
          style={{ x: useTransform(lineOffset, (x) => -x * 0.5) }}
        />
        {[...Array(20)].map((_, i) => (
          <motion.rect
            key={i}
            x={i * 13}
            y={Math.random() * 60 + 40}
            width="8"
            height={Math.random() * 40 + 10}
            fill="rgba(249,115,22,0.3)"
            style={{
              y: useTransform(mouseX, [0, 500], [0, Math.random() * 10 - 5]),
            }}
          />
        ))}
      </svg>
      <p className="absolute bottom-2 left-2 text-white/60 text-xs">Live Market Preview</p>
    </div>
  );
}
