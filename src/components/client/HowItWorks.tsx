"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description:
      "Sign up in minutes with our simple and secure registration process. Your data is protected with industry-standard encryption.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-400",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    number: "02",
    title: "Fund Your Account",
    description:
      "Deposit funds using PIX, crypto, or bank transfer. Multiple secure payment options for your convenience.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    number: "03",
    title: "Start Trading",
    description:
      "Access global crypto markets and start trading BTC, ETH, and more with real-time data and advanced tools.",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-400",
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
];

const Card3D = ({
  step,
  index,
  isDarkMode,
}: {
  step: (typeof steps)[0];
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

    const rotateXValue = (mouseY / (rect.height / 2)) * -10;
    const rotateYValue = (mouseX / (rect.width / 2)) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Light mode card style - white card with soft shadows
  if (!isDarkMode) {
    return (
      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
      >
        <div
          className="relative h-full cursor-pointer rounded-2xl bg-white p-4 sm:p-5 overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
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
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-white text-xs shadow-lg`}
            >
              {step.number}
            </div>
          </div>

          {/* Icon + Title row */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-lg`}
            >
              <span className="scale-[0.6]">{step.icon}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
          </div>

          {/* Description */}
          <p className="text-gray-500 leading-relaxed text-xs pl-[56px]">
            {step.description}
          </p>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
            <div
              className={`h-full bg-gradient-to-r ${step.gradient} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Dark mode card style (existing 3D glow style)
  return (
    <motion.div
      className="relative group"
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
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
          className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${step.glowColor} 0%, transparent 70%)`,
          }}
        />

        {/* Main card */}
        <div
          className="relative h-full rounded-xl p-[1px] overflow-hidden"
          style={{
            background: isHovered
              ? `linear-gradient(135deg, ${step.glowColor}, transparent 50%, ${step.glowColor})`
              : "linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%, rgba(255,255,255,0.05))",
            transition: "background 0.3s ease",
          }}
        >
          <div
            className="relative h-full rounded-xl p-4 sm:p-5 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1f35 100%)",
              boxShadow: isHovered
                ? `0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 15px 30px -10px rgba(0, 0, 0, 0.7), 0 0 40px -10px ${step.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                : "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 12px 25px -8px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Ambient light reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-20 opacity-30 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
              }}
            />

            {/* Step number - small floating badge */}
            <div
              className="absolute top-2 right-2"
              style={{
                transform: "translateZ(30px)",
              }}
            >
              <div
                className={`w-7 h-7 rounded-md bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-white text-xs shadow-lg`}
                style={{
                  boxShadow: `0 4px 12px -4px ${step.glowColor}`,
                }}
              >
                {step.number}
              </div>
            </div>

            {/* Icon + Title row */}
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="relative flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300`}
                  style={{
                    boxShadow: `0 6px 18px -6px ${step.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    transform: isHovered
                      ? "translateZ(20px) scale(1.05)"
                      : "translateZ(0)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <span className="scale-[0.6]">{step.icon}</span>
                </div>
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle, ${step.glowColor} 0%, transparent 70%)`,
                    filter: "blur(4px)",
                  }}
                />
              </div>
              <h3
                className="text-base font-bold text-white transition-colors duration-300"
                style={{
                  transform: "translateZ(15px)",
                }}
              >
                {step.title}
              </h3>
            </div>

            {/* Description */}
            <p
              className="text-gray-400 leading-relaxed relative z-10 text-xs pl-[52px]"
              style={{
                transform: "translateZ(10px)",
              }}
            >
              {step.description}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
              <div
                className={`h-full bg-gradient-to-r ${step.gradient} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}
              />
            </div>

            {/* Floating particles effect on hover */}
            {isHovered && (
              <>
                <div
                  className="absolute w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: step.glowColor,
                    top: "20%",
                    right: "20%",
                    filter: "blur(2px)",
                    animation: "float 2s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: step.glowColor,
                    bottom: "30%",
                    left: "15%",
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

const HowItWorks = () => {
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
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/0 dark:bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/0 dark:bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header section with enhanced styling */}
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
              How It Works
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Get Started in{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>

          <p className="text-base leading-7 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Our streamlined process makes it easy for you to start trading in no
            time. Join thousands of traders worldwide.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, index) => (
            <Card3D
              key={step.number}
              step={step}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* Connection line between cards (desktop only) - only in dark mode */}
        <div className="hidden lg:dark:block absolute top-1/2 left-1/2 -translate-x-1/2 w-2/3 h-px">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
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
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HowItWorks;
