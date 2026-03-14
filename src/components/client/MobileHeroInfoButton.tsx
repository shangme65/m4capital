"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import ReactDOM from "react-dom";
import CountdownTimer from "./CountdownTimer";
import GlassmorphismCards from "./GlassmorphismCards";
import TestimonialSlider from "./TestimonialSlider";
import { useTheme } from "@/contexts/ThemeContext";

export default function MobileHeroInfoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Edge Button - visible only on mobile, half hidden */}
      <motion.button
        onClick={togglePanel}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="fixed top-1/2 -translate-y-1/2 -right-3 z-50 xl:hidden bg-gradient-to-l from-orange-500 to-orange-700 px-2 py-3 rounded-l-full shadow-[-4px_0_12px_rgba(249,115,22,0.4)] hover:shadow-[-6px_0_18px_rgba(249,115,22,0.6)] transition-all duration-300"
        aria-label="Show hero info"
      >
        <motion.div
          animate={{ x: isOpen ? 0 : [-2, 1, -2] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </motion.div>
      </motion.button>

      {/* Sliding Panel */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={togglePanel}
                className={`fixed inset-0 backdrop-blur-sm z-[100] ${
                  isDark ? "bg-black/60" : "bg-black/30"
                }`}
              />

              {/* Sliding Panel from Right */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 z-[101] overflow-y-auto shadow-2xl ${
                  isDark
                    ? "bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-[#0a0806]"
                    : "bg-gradient-to-b from-purple-50 via-white to-pink-50"
                }`}
              >
                {/* Header with Close Button */}
                <div
                  className={`sticky top-0 z-10 border-b px-4 py-3 flex items-center justify-between ${
                    isDark
                      ? "bg-gradient-to-b from-[#2d1f1a] to-[#1a1410] border-white/10"
                      : "bg-gradient-to-b from-purple-100 to-white border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-base font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Live Dashboard
                  </h2>
                  <button
                    onClick={togglePanel}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDark
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label="Close panel"
                  >
                    <X
                      className={`w-4 h-4 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-3">
                  {/* Stats Cards Only (3 in a row) */}
                  <div className="[&_>div:first-child]:!hidden [&_>div:last-child]:!block [&_>div:last-child]:!relative [&_>div:last-child]:!left-0 [&_>div:last-child]:!top-0 [&_.grid]:!grid-cols-3 [&_.grid]:!gap-2 [&_>div:last-child]:!space-y-0 [&_.grid>div]:!w-auto [&_.grid>div_p]:!text-xs [&_.grid>div_p]:!font-bold [&_.grid>div_p:last-child]:!text-sm [&_.grid>div_p:last-child]:!font-bold scale-95 -mx-2">
                    <GlassmorphismCards />
                  </div>

                  {/* Recent Activity Only */}
                  <div className="[&_>div:first-child]:!block [&_>div:first-child]:!relative [&_>div:first-child]:!left-0 [&_>div:first-child]:!top-0 [&_>div:last-child]:!hidden [&_span]:!font-bold scale-95 -mx-2">
                    <GlassmorphismCards />
                  </div>

                  {/* Testimonials */}
                  <div className="[&_>div]:!block [&_>div]:!relative [&_>div]:!left-0 [&_>div]:!bottom-0 [&_>div]:!right-0 [&_>div]:!w-full [&_*]:!font-bold w-full">
                    <TestimonialSlider />
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex justify-center w-full [&_>div]:!block [&_>div]:!relative [&_>div]:!left-0 [&_>div]:!top-0 [&_>div]:!w-full [&_*]:!font-bold">
                    <CountdownTimer />
                  </div>

                  {/* Bottom Padding */}
                  <div className="h-4"></div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
