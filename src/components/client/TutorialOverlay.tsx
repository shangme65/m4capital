"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTutorial } from "@/contexts/TutorialContext";

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    goNext,
    goPrevious,
    completeTutorial,
  } = useTutorial();

  const [spotlightPos, setSpotlightPos] = useState<SpotlightPosition | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find and highlight the target element
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updateSpotlight = () => {
      const isMobile = window.innerWidth < 640;
      const tooltipWidth = isMobile
        ? Math.min(window.innerWidth - 32, 400)
        : 400;
      const tooltipHeight = isMobile ? 220 : 200;
      const margin = isMobile ? 12 : 16;

      // Center position for welcome/complete steps
      if (
        currentStepData.target === "center" ||
        currentStepData.id === "welcome" ||
        currentStepData.id === "complete" ||
        currentStepData.id === "asset-actions"
      ) {
        setSpotlightPos(null);
        // Center the tooltip
        setTooltipPosition({
          top: Math.max(margin, (window.innerHeight - tooltipHeight) / 2),
          left: Math.max(margin, (window.innerWidth - tooltipWidth) / 2),
        });
        return;
      }

      // Find the target element
      const element = document.querySelector(currentStepData.target);
      if (!element) {
        console.warn(`Tutorial target not found: ${currentStepData.target}`);
        setSpotlightPos(null);
        setTooltipPosition({
          top: Math.max(margin, (window.innerHeight - tooltipHeight) / 2),
          left: Math.max(margin, (window.innerWidth - tooltipWidth) / 2),
        });
        return;
      }

      const rect = element.getBoundingClientRect();
      const padding = currentStepData.highlightPadding || 8;

      setSpotlightPos({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position based on preferred position
      let tooltipTop = 0;
      let tooltipLeft = 0;

      switch (currentStepData.position) {
        case "top":
          tooltipTop = rect.top - tooltipHeight - margin - padding;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          tooltipTop = rect.bottom + margin + padding;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left - tooltipWidth - margin - padding;
          break;
        case "right":
          tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.right + margin + padding;
          break;
        default:
          tooltipTop = rect.bottom + margin + padding;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      // Keep tooltip within viewport
      tooltipTop = Math.max(
        margin,
        Math.min(tooltipTop, window.innerHeight - tooltipHeight - margin)
      );
      tooltipLeft = Math.max(
        margin,
        Math.min(tooltipLeft, window.innerWidth - tooltipWidth - margin)
      );

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    };

    // Initial update
    updateSpotlight();

    // Update on resize/scroll
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    // Also update after a short delay to handle dynamic content
    const timeout = setTimeout(updateSpotlight, 100);

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
      clearTimeout(timeout);
    };
  }, [isActive, currentStepData, currentStep]);

  // Prevent scrolling and interactions when tutorial is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  if (!isActive || !currentStepData) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isCenterStep =
    currentStepData.target === "center" ||
    currentStepData.id === "welcome" ||
    currentStepData.id === "complete" ||
    currentStepData.id === "asset-actions";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] pointer-events-none">
        {/* Dark overlay with spotlight cutout */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ cursor: 'default' }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White = visible, black = hidden */}
              <rect width="100%" height="100%" fill="white" />
              {spotlightPos && (
                <rect
                  x={spotlightPos.left}
                  y={spotlightPos.top}
                  width={spotlightPos.width}
                  height={spotlightPos.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.85)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border glow */}
        {spotlightPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: spotlightPos.top,
              left: spotlightPos.left,
              width: spotlightPos.width,
              height: spotlightPos.height,
              boxShadow:
                "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)",
              border: "2px solid rgba(59, 130, 246, 0.8)",
            }}
          />
        )}

        {/* Tooltip card */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: "min(400px, calc(100vw - 32px))",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <div className="bg-gradient-to-br from-gray-800/98 to-gray-900/98 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(59,130,246,0.4)] border border-gray-700/50">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.5)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-400 text-sm font-medium">
                  Step {currentStep + 1} of {totalSteps}
                </span>
              </div>
              {/* Progress bar */}
              <div className="flex-1 mx-4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              {currentStepData.description}
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <button
                onClick={goPrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base ${
                  isFirstStep
                    ? "bg-gray-700/30 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700/50 text-white hover:bg-gray-600/50 border border-gray-600/50"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Previous</span>
              </button>

              {isLastStep ? (
                <button
                  onClick={completeTutorial}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-[0_4px_16px_rgba(34,197,94,0.4)] text-sm sm:text-base"
                >
                  <span className="hidden xs:inline">Complete &</span> Verify
                  <Sparkles className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-[0_4px_16px_rgba(59,130,246,0.4)] text-sm sm:text-base"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-blue-500 w-4"
                      : index < currentStep
                      ? "bg-blue-500/50"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
