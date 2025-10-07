"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TradingAppLoaderProps {
  onComplete: () => void;
}

type LoadingPhase = "downloading" | "initializing" | "connecting" | "complete";

const TradingAppLoader: React.FC<TradingAppLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<LoadingPhase>("downloading");
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(
    "Downloading trading platform..."
  );

  useEffect(() => {
    const phases = [
      {
        phase: "downloading" as LoadingPhase,
        text: "Downloading trading platform...",
        duration: 3000,
      },
      {
        phase: "initializing" as LoadingPhase,
        text: "Initializing market data...",
        duration: 2000,
      },
      {
        phase: "connecting" as LoadingPhase,
        text: "Connecting to trading servers...",
        duration: 2500,
      },
      {
        phase: "complete" as LoadingPhase,
        text: "Ready to trade!",
        duration: 500,
      },
    ];

    let currentPhaseIndex = 0;
    let progressInterval: NodeJS.Timeout;
    let phaseTimeout: NodeJS.Timeout;

    const startPhase = () => {
      if (currentPhaseIndex >= phases.length) {
        onComplete();
        return;
      }

      const currentPhase = phases[currentPhaseIndex];
      setPhase(currentPhase.phase);
      setLoadingText(currentPhase.text);
      setProgress(0);

      // Animate progress bar
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const increment = 100 / (currentPhase.duration / 50);
          return Math.min(prev + increment, 100);
        });
      }, 50);

      // Move to next phase
      phaseTimeout = setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          currentPhaseIndex++;
          startPhase();
        }, 300);
      }, currentPhase.duration);
    };

    startPhase();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(phaseTimeout);
    };
  }, [onComplete]);

  const getPhaseIcon = () => {
    switch (phase) {
      case "downloading":
        return "⬇️";
      case "initializing":
        return "⚙️";
      case "connecting":
        return "🔌";
      case "complete":
        return "✅";
      default:
        return "⏳";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
            M4
          </div>
          <h1 className="text-white text-2xl font-bold mt-4">M4Capital</h1>
          <p className="text-gray-400 text-sm">Professional Trading Platform</p>
        </motion.div>

        {/* Loading Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="text-4xl mb-4">{getPhaseIcon()}</div>
            <p className="text-white text-lg font-medium mb-2">{loadingText}</p>
            <p className="text-gray-400 text-sm">
              {phase === "downloading" &&
                "Loading market interface and trading tools..."}
              {phase === "initializing" &&
                "Setting up real-time charts and indicators..."}
              {phase === "connecting" &&
                "Establishing secure connection to exchanges..."}
              {phase === "complete" && "Welcome to professional trading!"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <motion.div
            className="bg-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Progress Text */}
        <p className="text-gray-400 text-sm">
          {Math.round(progress)}% Complete
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-8 space-y-2 text-xs text-gray-500">
          <div
            className={`flex items-center justify-center space-x-2 ${
              ["downloading", "initializing", "connecting", "complete"].indexOf(
                phase
              ) >= 0
                ? "text-green-400"
                : ""
            }`}
          >
            <span>✓</span>
            <span>Security protocols validated</span>
          </div>
          <div
            className={`flex items-center justify-center space-x-2 ${
              ["initializing", "connecting", "complete"].indexOf(phase) >= 0
                ? "text-green-400"
                : ""
            }`}
          >
            <span>✓</span>
            <span>Market data streams ready</span>
          </div>
          <div
            className={`flex items-center justify-center space-x-2 ${
              ["connecting", "complete"].indexOf(phase) >= 0
                ? "text-green-400"
                : ""
            }`}
          >
            <span>✓</span>
            <span>Trading engine online</span>
          </div>
          <div
            className={`flex items-center justify-center space-x-2 ${
              phase === "complete" ? "text-green-400" : ""
            }`}
          >
            <span>✓</span>
            <span>Real-time execution ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingAppLoader;
