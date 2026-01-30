"use client";
import { useState, useEffect } from "react";

interface SignalStrengthProps {
  className?: string;
}

export default function SignalStrength({ className = "" }: SignalStrengthProps) {
  const [strength, setStrength] = useState(75); // Default 75% signal strength
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch signal strength from API
  useEffect(() => {
    const fetchSignalStrength = async () => {
      try {
        const response = await fetch("/api/admin/signal-strength");
        if (response.ok) {
          const data = await response.json();
          setStrength(data.signalStrength);
        }
      } catch (error) {
        console.error("Failed to fetch signal strength:", error);
      }
    };

    fetchSignalStrength();

    // Poll for updates every 10 seconds
    const pollInterval = setInterval(fetchSignalStrength, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  // Simulate small fluctuations for visual effect (optional)
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 300);
    }, 5000); // Visual update every 5 seconds

    return () => clearInterval(updateInterval);
  }, []);

  // Determine color based on signal strength
  const getSignalColor = () => {
    if (strength >= 75) return "from-green-500 to-green-600";
    if (strength >= 50) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const getSignalText = () => {
    if (strength >= 75) return "Strong";
    if (strength >= 50) return "Moderate";
    return "Weak";
  };

  return (
    <div className={`${className}`}>
      <div
        className="relative rounded-2xl p-4 sm:p-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(31, 41, 55, 0.4) 0%, rgba(17, 24, 39, 0.6) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow:
            "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${getSignalColor()} bg-clip-text text-transparent`}
              >
                {Math.round(strength)}%
              </span>
              <span className="text-gray-300 text-xs sm:text-sm font-semibold">
                SIGNAL STRENGTH
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{getSignalText()}</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  strength >= 75
                    ? "bg-green-400"
                    : strength >= 50
                    ? "bg-yellow-400"
                    : "bg-red-400"
                } ${isUpdating ? "animate-pulse" : ""}`}
              />
            </div>
          </div>

          {/* Signal Strength Bar */}
          <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getSignalColor()} rounded-full transition-all duration-700 ease-out relative`}
              style={{ width: `${strength}%` }}
            >
              {/* Animated shine effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                style={{
                  animation: "shimmer 2s infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
