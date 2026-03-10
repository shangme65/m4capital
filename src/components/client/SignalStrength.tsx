"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface SignalStrengthProps {
  className?: string;
}

export default function SignalStrength({ className = "" }: SignalStrengthProps) {
  const [strength, setStrength] = useState(75);
  const [isUpdating, setIsUpdating] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
    const pollInterval = setInterval(fetchSignalStrength, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  // Generate particles for animation
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Visual update effect
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 300);
    }, 5000);
    return () => clearInterval(updateInterval);
  }, []);

  // Colors based on strength
  const getColors = () => {
    if (strength >= 75) return {
      primary: "#10b981",
      secondary: "#059669",
      glow: "rgba(16, 185, 129, 0.5)",
      text: "Strong",
      gradient: "from-emerald-400 via-green-500 to-emerald-600",
    };
    if (strength >= 50) return {
      primary: "#f59e0b",
      secondary: "#d97706",
      glow: "rgba(245, 158, 11, 0.5)",
      text: "Moderate",
      gradient: "from-amber-400 via-yellow-500 to-orange-500",
    };
    return {
      primary: "#ef4444",
      secondary: "#dc2626",
      glow: "rgba(239, 68, 68, 0.5)",
      text: "Weak",
      gradient: "from-red-400 via-red-500 to-rose-600",
    };
  };

  const colors = getColors();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (strength / 100) * circumference;

  return (
    <div className={`${className}`}>
      <div
        className={`relative rounded-xl p-2.5 sm:p-3 overflow-hidden transition-all duration-500 ${
          isDark 
            ? "bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90" 
            : "bg-gradient-to-br from-white/95 via-gray-50/90 to-gray-100/95"
        }`}
        style={{
          backdropFilter: "blur(20px)",
          border: isDark 
            ? "1px solid rgba(255, 255, 255, 0.08)" 
            : "1px solid rgba(0, 0, 0, 0.15)",
          boxShadow: isDark
            ? `0 20px 60px -15px rgba(0, 0, 0, 0.6), 
               0 0 40px -10px ${colors.glow},
               inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`
            : `0 8px 30px -4px rgba(0, 0, 0, 0.25), 
               0 12px 40px -8px rgba(0, 0, 0, 0.15), 
               0 0 40px -10px ${colors.glow},
               inset 0 1px 0 rgba(255, 255, 255, 1), 
               inset 0 -2px 6px rgba(0, 0, 0, 0.12), 
               inset 3px 0 6px rgba(0, 0, 0, 0.08), 
               inset -3px 0 6px rgba(0, 0, 0, 0.08)`,
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full opacity-30"
              style={{
                background: colors.primary,
                left: `${particle.x}%`,
                animation: `floatParticle 4s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div
          className={`absolute inset-0 ${isDark ? "opacity-5" : "opacity-[0.03]"}`}
          style={{
            backgroundImage: `
              linear-gradient(${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ 
                  background: colors.primary,
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
              />
              <span className={`text-xs font-bold tracking-wider uppercase ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Signal Strength
              </span>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isDark ? "bg-gray-800/80" : "bg-gray-200/80"
            }`} style={{ color: colors.primary }}>
              {colors.text}
            </div>
          </div>

          {/* 3D Gauge Container */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Circular 3D Gauge */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 180deg, ${colors.primary}20, transparent, ${colors.primary}20)`,
                  filter: "blur(8px)",
                  transform: "scale(1.1)",
                }}
              />
              
              {/* 3D Shadow base */}
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, rgba(0,0,0,0.4), rgba(30,30,30,0.2))"
                    : "linear-gradient(145deg, rgba(0,0,0,0.1), rgba(150,150,150,0.1))",
                  boxShadow: isDark
                    ? "inset 4px 4px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(60,60,60,0.2)"
                    : "inset 4px 4px 8px rgba(0,0,0,0.15), inset -2px -2px 6px rgba(255,255,255,0.8)",
                }}
              />

              {/* SVG Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                
                {/* Animated gradient progress */}
                <defs>
                  <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.primary} />
                    <stop offset="50%" stopColor={colors.secondary} />
                    <stop offset="100%" stopColor={colors.primary} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#signalGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  filter="url(#glow)"
                  className="transition-all duration-700 ease-out"
                />

                {/* Glowing endpoint */}
                <circle
                  cx={50 + 45 * Math.cos((Math.PI * 2 * strength / 100) - Math.PI / 2)}
                  cy={50 + 45 * Math.sin((Math.PI * 2 * strength / 100) - Math.PI / 2)}
                  r="4"
                  fill={colors.primary}
                  className={isUpdating ? "animate-ping" : ""}
                  style={{
                    filter: `drop-shadow(0 0 6px ${colors.glow})`,
                  }}
                />
              </svg>

              {/* Center display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: isDark
                      ? "linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.9))"
                      : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,240,240,0.9))",
                    boxShadow: isDark
                      ? "4px 4px 12px rgba(0,0,0,0.5), -2px -2px 8px rgba(60,60,60,0.1)"
                      : "4px 4px 12px rgba(0,0,0,0.1), -2px -2px 8px rgba(255,255,255,0.9)",
                  }}
                >
                  <span
                    className="text-base sm:text-lg font-black"
                    style={{ color: colors.primary }}
                  >
                    {Math.round(strength)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="flex-1 space-y-1.5">
              {/* Signal bars visualization */}
              <div className="flex items-end gap-1 h-7">
                {[20, 40, 60, 80, 100].map((threshold, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-300"
                    style={{
                      height: `${40 + i * 15}%`,
                      background: strength >= threshold
                        ? `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`
                        : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      boxShadow: strength >= threshold
                        ? `0 0 8px ${colors.glow}`
                        : "none",
                    }}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="relative h-1 rounded-full overflow-hidden"
                style={{
                  background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                }}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-700 ease-out relative overflow-hidden`}
                  style={{ width: `${strength}%` }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{ animation: "shimmer 2s infinite" }}
                  />
                </div>
              </div>

              {/* Mini stats */}
              <div className="flex justify-between text-[10px]">
                <span className={isDark ? "text-gray-500" : "text-gray-400"}>Min: 0%</span>
                <span className={isDark ? "text-gray-500" : "text-gray-400"}>Max: 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div
          className="absolute top-0 right-0 w-20 h-20 opacity-30"
          style={{
            background: `radial-gradient(circle at top right, ${colors.glow}, transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle at bottom left, ${colors.glow}, transparent 70%)`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(100px); opacity: 0; }
          50% { transform: translateY(-20px); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
