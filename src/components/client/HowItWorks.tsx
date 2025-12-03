"use client";
import React, { useState } from "react";
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
}: {
  step: (typeof steps)[0];
  index: number;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
          className="relative h-full rounded-2xl p-[1px] overflow-hidden"
          style={{
            background: isHovered
              ? `linear-gradient(135deg, ${step.glowColor}, transparent 50%, ${step.glowColor})`
              : "linear-gradient(135deg, rgba(255,255,255,0.1), transparent 50%, rgba(255,255,255,0.05))",
            transition: "background 0.3s ease",
          }}
        >
          <div
            className="relative h-full rounded-2xl p-8 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1f35 100%)",
              boxShadow: isHovered
                ? `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px -10px ${step.glowColor}`
                : "0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Ambient light reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-32 opacity-30 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
              }}
            />

            {/* Step number - floating badge */}
            <div
              className="absolute -top-1 -right-1 w-16 h-16 flex items-center justify-center"
              style={{
                transform: "translateZ(30px)",
              }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center font-bold text-white text-lg shadow-lg`}
                style={{
                  boxShadow: `0 8px 20px -4px ${step.glowColor}`,
                }}
              >
                {step.number}
              </div>
            </div>

            {/* Icon container with 3D effect */}
            <div className="relative mb-6">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300`}
                style={{
                  boxShadow: `0 10px 30px -8px ${step.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transform: isHovered
                    ? "translateZ(20px) scale(1.05)"
                    : "translateZ(0)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {step.icon}
              </div>
              {/* Icon glow ring */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, ${step.glowColor} 0%, transparent 70%)`,
                  filter: "blur(8px)",
                }}
              />
            </div>

            {/* Title with gradient on hover */}
            <h3
              className="text-xl font-bold text-white mb-4 relative z-10 transition-colors duration-300"
              style={{
                transform: "translateZ(15px)",
              }}
            >
              {step.title}
            </h3>

            {/* Description */}
            <p
              className="text-gray-400 leading-relaxed relative z-10 text-sm"
              style={{
                transform: "translateZ(10px)",
              }}
            >
              {step.description}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
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
  return (
    <div className="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header section with enhanced styling */}
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-sm font-medium text-indigo-400">
              How It Works
            </span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
            Get Started in{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>

          <p className="text-lg leading-8 text-gray-400 max-w-xl mx-auto">
            Our streamlined process makes it easy for you to start trading in no
            time. Join thousands of traders worldwide.
          </p>
        </motion.div>

        {/* 3D Cards Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {steps.map((step, index) => (
            <Card3D key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Connection line between cards (desktop only) */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-2/3 h-px">
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
