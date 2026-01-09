"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import ReactDOM from "react-dom";
import CountdownTimer from "./CountdownTimer";
import GlassmorphismCards from "./GlassmorphismCards";
import TestimonialSlider from "./TestimonialSlider";

export default function MobileHeroInfoButton() {
  const [isOpen, setIsOpen] = useState(false);

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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />

              {/* Sliding Panel from Right */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-[#0a0806] z-[101] overflow-y-auto shadow-2xl"
              >
                {/* Header with Close Button */}
                <div className="sticky top-0 z-10 bg-gradient-to-b from-[#2d1f1a] to-[#1a1410] border-b border-white/10 px-4 py-3 flex items-center justify-between">
                  <h2 className="text-white text-base font-bold">Live Dashboard</h2>
                  <button
                    onClick={togglePanel}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4 text-white" />
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
