"use client";
import React, { useState, useEffect } from "react";
import {
  FaShieldAlt,
  FaTachometerAlt,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    name: "Secure Transactions",
    description:
      "Your funds and data are protected by industry-leading security protocols.",
    icon: FaShieldAlt,
    gradient: "from-indigo-600 to-purple-600",
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
  {
    number: "02",
    name: "Real-Time Analytics",
    description:
      "Access up-to-the-minute market data and powerful analytics tools.",
    icon: FaChartLine,
    gradient: "from-orange-500 to-red-500",
    glowColor: "rgba(249, 115, 22, 0.4)",
  },
  {
    number: "03",
    name: "Blazing-Fast Execution",
    description:
      "Execute trades in milliseconds with our high-performance infrastructure.",
    icon: FaTachometerAlt,
    gradient: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    number: "04",
    name: "Community Driven",
    description:
      "Join a thriving community of traders and share insights and strategies.",
    icon: FaUsers,
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
];

const Feature3DCard = ({
  feature,
  index,
  isDarkMode,
}: {
  feature: (typeof features)[0];
  index: number;
  isDarkMode: boolean;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDarkMode) return; // Only 3D tilt in dark mode
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -8;
    const rotateYValue = (mouseX / (rect.width / 2)) * 8;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Light mode card style
  if (!isDarkMode) {
    return (
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div
          className="relative h-full cursor-pointer rounded-2xl bg-white p-4 overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            boxShadow: isHovered
              ? "0 35px 60px -15px rgba(0, 0, 0, 0.4), 0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.2)"
              : "0 20px 50px -15px rgba(0, 0, 0, 0.2), 0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 4px 15px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Step number - small badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center font-bold text-white text-xs shadow-lg`}
            >
              {feature.number}
            </div>
          </div>

          {/* Icon + Title row */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-lg`}
            >
              <feature.icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {feature.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-gray-500 leading-relaxed text-xs pl-[56px]">
            {feature.description}
          </p>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
            <div
              className={`h-full bg-gradient-to-r ${feature.gradient} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Dark mode card style (existing 3D style)
  return (
    <motion.div
      className="relative group"
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div
        className="relative h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Glow effect behind card */}
        <div
          className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${feature.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Main card with gradient border */}
        <div
          className="relative h-full rounded-xl p-[1px] overflow-hidden"
          style={{
            background: isHovered
              ? `linear-gradient(135deg, ${feature.glowColor}, transparent 50%, ${feature.glowColor})`
              : "linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%, rgba(255,255,255,0.05))",
            transition: "background 0.3s ease",
          }}
        >
          <div
            className="relative h-full rounded-xl p-4 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1f35 100%)",
              boxShadow: isHovered
                ? `0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 15px 30px -10px rgba(0, 0, 0, 0.7), 0 0 40px -10px ${feature.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                : "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 12px 25px -8px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Ambient light reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-16 opacity-30 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
              }}
            />

            {/* Step number - small floating badge */}
            <div className="absolute top-2 right-2">
              <div
                className={`w-7 h-7 rounded-md bg-gradient-to-br ${feature.gradient} flex items-center justify-center font-bold text-white text-xs shadow-lg`}
                style={{
                  boxShadow: `0 4px 12px -4px ${feature.glowColor}`,
                }}
              >
                {feature.number}
              </div>
            </div>

            {/* Icon + Title row */}
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300`}
                  style={{
                    boxShadow: `0 6px 18px -6px ${feature.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${feature.glowColor} 0%, transparent 70%)`,
                    filter: "blur(4px)",
                  }}
                />
              </div>
              <h3 className="text-base font-bold text-white transition-colors duration-300">
                {feature.name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed relative z-10 text-xs pl-[52px]">
              {feature.description}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
              <div
                className={`h-full bg-gradient-to-r ${feature.gradient} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}
              />
            </div>

            {/* Floating particles effect on hover */}
            {isHovered && (
              <>
                <div
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: feature.glowColor,
                    top: "25%",
                    right: "25%",
                    filter: "blur(1px)",
                    animation: "float 2s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: feature.glowColor,
                    bottom: "35%",
                    left: "20%",
                    filter: "blur(1px)",
                    animation: "float 2.5s ease-in-out infinite 0.5s",
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-gray-100 dark:bg-slate-900 py-8 sm:py-12 overflow-hidden">
      {/* Background gradient orbs - only visible in dark mode */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-500/0 dark:bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/0 dark:bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs font-medium text-orange-500 dark:text-orange-400">
              Trade Smarter
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              succeed in the market
            </span>
          </h2>

          <p className="text-base leading-7 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Our platform is designed from the ground up to provide you with the
            tools, speed, and security required for modern Forex trading.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map((feature, index) => (
            <Feature3DCard
              key={feature.name}
              feature={feature}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </div>

      {/* Custom keyframes for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
