"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackgroundSlider from "@/components/client/BackgroundSlider";
import AnimatedButton from "@/components/client/AnimatedButton";
import Features from "@/components/client/Features";
import Testimonials from "@/components/client/Testimonials";
import CryptoPriceTicker from "@/components/client/CryptoPriceTicker";
import { CryptoMarketProvider } from "@/components/client/CryptoMarketProvider";
import FAQ from "@/components/client/FAQ";
import HowItWorks from "@/components/client/HowItWorks";
import Preloader from "@/components/client/Preloader";
import { useModal } from "@/contexts/ModalContext";
import React from "react";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

type AnimationVariant = {
  initial: { opacity: number; x?: number; y?: number; scale?: number };
  animate: { opacity: number; x?: number; y?: number; scale?: number };
  exit: { opacity: number; x?: number; y?: number; scale?: number };
};

type AnimationVariants = {
  [key: string]: AnimationVariant;
};

function Hero() {
  const { openLoginModal, openSignupModal } = useModal();
  const { data: session } = useSession();
  const router = useRouter();
  const images = ["/hero-bg-1.jpg", "/hero-bg-2.jpg", "/hero-bg-3.jpg"];

  const handleTryDemo = () => {
    // Set practice mode in localStorage before navigation
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedAccountType", "practice");
    }
    router.push("/traderoom");
  };

  const heroContent = [
    {
      title: (
        <>
          <span className="text-blue-400">Unlock</span>{" "}
          <span className="text-purple-400">Global</span>{" "}
          <span className="text-green-400">Markets</span>
        </>
      ),
      description:
        "Trade Forex, stocks, and commodities from a single, powerful platform.",
    },
    {
      title: (
        <>
          <span className="text-orange-400">Precision</span>{" "}
          <span className="text-pink-400">Trading</span>{" "}
          <span className="text-cyan-400">Tools</span>
        </>
      ),
      description:
        "Leverage advanced charting and analytics for surgical market entry and exit.",
    },
    {
      title: (
        <>
          <span className="text-emerald-400">Institutional</span>{" "}
          <span className="text-yellow-400">Grade</span>{" "}
          <span className="text-red-400">Liquidity</span>
        </>
      ),
      description:
        "Experience tight spreads and minimal slippage with our deep liquidity pools.",
    },
    {
      title: (
        <>
          <span className="text-indigo-400">Automate</span>{" "}
          <span className="text-rose-400">Your</span>{" "}
          <span className="text-lime-400">Strategies</span>
        </>
      ),
      description:
        "Build, backtest, and deploy trading algorithms with our robust API.",
    },
    {
      title: (
        <>
          <span className="text-violet-400">Blazing</span>{" "}
          <span className="text-teal-400">Fast</span>{" "}
          <span className="text-amber-400">Execution</span>
        </>
      ),
      description:
        "Gain a competitive edge with our low-latency infrastructure.",
    },
    {
      title: (
        <>
          <span className="text-sky-400">Actionable</span>{" "}
          <span className="text-fuchsia-400">Market</span>{" "}
          <span className="text-green-400">Insights</span>
        </>
      ),
      description:
        "Receive real-time news and analysis to make informed trading decisions.",
    },
    {
      title: (
        <>
          <span className="text-purple-400">Your</span>{" "}
          <span className="text-orange-400">Capital</span>{" "}
          <span className="text-blue-400">Secured</span>
        </>
      ),
      description:
        "Trade with confidence, knowing your funds are protected by industry-leading security.",
    },
    {
      title: (
        <>
          <span className="text-cyan-400">Master</span>{" "}
          <span className="text-pink-400">the</span>{" "}
          <span className="text-yellow-400">Markets</span>
        </>
      ),
      description:
        "Access exclusive educational content and webinars from seasoned trading experts.",
    },
    {
      title: (
        <>
          <span className="text-emerald-400">Trade</span>{" "}
          <span className="text-red-400">on</span>{" "}
          <span className="text-indigo-400">Your</span>{" "}
          <span className="text-lime-400">Terms</span>
        </>
      ),
      description:
        "Customize your trading environment with flexible layouts and powerful tools.",
    },
    {
      title: (
        <>
          <span className="text-rose-400">24/7</span>{" "}
          <span className="text-teal-400">Dedicated</span>{" "}
          <span className="text-violet-400">Support</span>
        </>
      ),
      description:
        "Our expert support team is always available to assist you, day or night.",
    },
    {
      title: (
        <>
          <span className="text-amber-400">Seamless</span>{" "}
          <span className="text-sky-400">Mobile</span>{" "}
          <span className="text-fuchsia-400">Trading</span>
        </>
      ),
      description:
        "Trade on-the-go with our full-featured and intuitive mobile application.",
    },
    {
      title: (
        <>
          <span className="text-green-400">Social</span>{" "}
          <span className="text-purple-400">Trading</span>{" "}
          <span className="text-orange-400">Revolution</span>
        </>
      ),
      description:
        "Copy the strategies of top-performing traders and enhance your portfolio.",
    },
    {
      title: (
        <>
          <span className="text-blue-400">Transparent</span>{" "}
          <span className="text-pink-400">Fee</span>{" "}
          <span className="text-cyan-400">Structure</span>
        </>
      ),
      description:
        "Enjoy competitive pricing with no hidden costs or commissions.",
    },
    {
      title: (
        <>
          <span className="text-yellow-400">Advanced</span>{" "}
          <span className="text-red-400">Risk</span>{" "}
          <span className="text-emerald-400">Management</span>
        </>
      ),
      description:
        "Protect your investments with sophisticated stop-loss and take-profit orders.",
    },
    {
      title: (
        <>
          <span className="text-indigo-400">Diverse</span>{" "}
          <span className="text-rose-400">Asset</span>{" "}
          <span className="text-lime-400">Portfolio</span>
        </>
      ),
      description:
        "Explore a wide range of currency pairs, indices, and cryptocurrencies.",
    },
    {
      title: (
        <>
          <span className="text-violet-400">The</span>{" "}
          <span className="text-teal-400">Future</span>{" "}
          <span className="text-amber-400">of</span>{" "}
          <span className="text-sky-400">Algorithmic</span>{" "}
          <span className="text-fuchsia-400">Trading</span>
        </>
      ),
      description:
        "Harness the power of AI to optimize your trading performance.",
    },
    {
      title: (
        <>
          <span className="text-green-400">Join</span>{" "}
          <span className="text-purple-400">a</span>{" "}
          <span className="text-orange-400">Global</span>{" "}
          <span className="text-blue-400">Trading</span>{" "}
          <span className="text-pink-400">Community</span>
        </>
      ),
      description:
        "Connect with and learn from a network of thousands of traders worldwide.",
    },
    {
      title: (
        <>
          <span className="text-cyan-400">Regulated</span>{" "}
          <span className="text-yellow-400">and</span>{" "}
          <span className="text-red-400">Trusted</span>{" "}
          <span className="text-emerald-400">Broker</span>
        </>
      ),
      description: "Operate in a secure and compliant trading environment.",
    },
    {
      title: (
        <>
          <span className="text-indigo-400">Unleash</span>{" "}
          <span className="text-rose-400">Your</span>{" "}
          <span className="text-lime-400">Trading</span>{" "}
          <span className="text-violet-400">Potential</span>
        </>
      ),
      description:
        "We provide the tools, you define the success. Start your journey today.",
    },
    {
      title: (
        <>
          <span className="text-teal-400">Next</span>{" "}
          <span className="text-amber-400">Generation</span>{" "}
          <span className="text-sky-400">Trading</span>{" "}
          <span className="text-fuchsia-400">Platform</span>
        </>
      ),
      description:
        "Experience the pinnacle of trading technology, designed for performance and reliability.",
    },
  ];

  const animationVariants: AnimationVariants = {
    slideLeft: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
    },
    slideRight: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
    },
    fadeInUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 },
    },
    fadeInDown: {
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    },
    scaleUp: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  };
  const variantNames = Object.keys(animationVariants);

  const [contentIndex, setContentIndex] = useState(0);
  const [title, setTitle] = useState<React.ReactNode>(heroContent[0].title);
  const [description, setDescription] = useState(heroContent[0].description);
  const [titleAnimation, setTitleAnimation] = useState(variantNames[0]);
  const [descAnimation, setDescAnimation] = useState(variantNames[1]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (contentIndex + 1) % heroContent.length;

      // Start title change - cycle through variants deterministically
      setTimeout(() => {
        const titleVariantIndex = nextIndex % variantNames.length;
        setTitleAnimation(variantNames[titleVariantIndex]);
        setTitle(heroContent[nextIndex].title);
      }, 0);

      // Start description change after a delay - use different variant
      setTimeout(() => {
        const descVariantIndex = (nextIndex + 1) % variantNames.length;
        setDescAnimation(variantNames[descVariantIndex]);
        setDescription(heroContent[nextIndex].description);
      }, 1500); // 1.5s delay for description

      setContentIndex(nextIndex);
    }, 5000); // Change content every 5 seconds

    return () => clearInterval(interval);
  }, [contentIndex, heroContent.length, titleAnimation]);

  return (
    <div className="relative h-[calc(100vh-60px)] sm:h-screen w-full flex flex-col overflow-hidden">
      <BackgroundSlider images={images} />
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Main content - centered */}
      <div className="relative z-10 flex-1 flex items-center justify-center text-center text-white px-4 sm:px-6 md:px-8 overflow-hidden max-w-7xl mx-auto w-full">
        <div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${contentIndex}`}
              variants={animationVariants[titleAnimation]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.7, ease: "circOut" }}
              className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 xs:mb-6 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight"
              style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
            >
              {title}
            </motion.h1>
          </AnimatePresence>
          <div className="h-16 xs:h-20 sm:h-28 md:h-32 flex items-center justify-center mb-4 xs:mb-6 sm:mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${contentIndex}`}
                variants={animationVariants[descAnimation]}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.7, ease: "circOut" }}
                className="text-sm xs:text-base sm:text-xl md:text-2xl drop-shadow-md max-w-xs xs:max-w-md sm:max-w-2xl md:max-w-3xl mx-auto px-2"
              >
                {description}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mt-6 sm:mt-12 items-center justify-center px-4">
            {session ? (
              // Logged in - Show "Go to Traderoom" button (defaults to real account)
              <button
                onClick={() => {
                  // Ensure real account is selected when logged in user clicks
                  if (typeof window !== "undefined") {
                    localStorage.setItem("selectedAccountType", "real");
                  }
                  router.push("/traderoom");
                }}
                className="w-full xs:w-auto text-white font-bold text-sm xs:text-base transition-all duration-200 transform hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #fb923c 0%, #c2410c 50%, #f97316 100%)",
                  boxShadow:
                    "0 12px 30px -6px rgba(249, 115, 22, 0.6), inset 0 3px 0 rgba(255, 255, 255, 0.25), inset 0 -4px 0 rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  padding: "12px 24px",
                  borderRadius: "12px",
                }}
              >
                Go to Traderoom
              </button>
            ) : (
              // Not logged in - Show "Get Started" and "Try Free Demo" buttons
              <>
                <button
                  onClick={openSignupModal}
                  className="text-white font-bold text-xs xs:text-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                  style={{
                    background:
                      "linear-gradient(135deg, #fb923c 0%, #c2410c 50%, #f97316 100%)",
                    boxShadow:
                      "0 12px 30px -6px rgba(249, 115, 22, 0.6), inset 0 3px 0 rgba(255, 255, 255, 0.25), inset 0 -4px 0 rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    padding: "10px 20px",
                    borderRadius: "10px",
                  }}
                >
                  Get Started
                </button>
                <button
                  onClick={handleTryDemo}
                  className="text-white font-bold text-xs xs:text-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                  style={{
                    background:
                      "linear-gradient(145deg, #4b5563 0%, #1f2937 50%, #374151 100%)",
                    boxShadow:
                      "0 12px 30px -6px rgba(0, 0, 0, 0.6), inset 0 3px 0 rgba(255, 255, 255, 0.15), inset 0 -4px 0 rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    padding: "10px 20px",
                    borderRadius: "10px",
                  }}
                >
                  Try Free Demo
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Crypto Price Ticker at bottom of hero */}
      <div className="relative z-10 w-full pb-4">
        <CryptoPriceTicker />
      </div>
    </div>
  );
}

function CallToAction() {
  const { openSignupModal } = useModal();
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Hide CallToAction section when user is logged in
  if (session) {
    return null;
  }

  // Light mode card
  if (!isDarkMode) {
    return (
      <div className="relative bg-gray-100 py-12 sm:py-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Card */}
            <div
              className="relative rounded-2xl bg-white p-6 sm:p-8 overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
              style={{
                boxShadow: isHovered
                  ? "0 30px 50px -15px rgba(0, 0, 0, 0.25), 0 15px 30px -10px rgba(0, 0, 0, 0.15)"
                  : "0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Decorative icon */}
              <div className="absolute -top-2 -right-2 w-20 h-20 opacity-10">
                <svg
                  className="w-full h-full text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* Text content */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-medium text-orange-600">
                      Get Started
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                    Ready to dive in?
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Start your trading journey today with M4Capital
                  </p>
                </div>

                {/* CTA Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={openSignupModal}
                    className="relative group/btn w-full sm:w-auto"
                  >
                    <div
                      className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{
                        boxShadow:
                          "0 8px 20px -4px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <span>Create an account</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
                <div
                  className={`h-full bg-gradient-to-r from-orange-500 to-amber-500 transform transition-transform duration-700 ${
                    isHovered ? "translate-x-0" : "-translate-x-full"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dark mode card
  return (
    <div className="relative bg-gray-900 py-12 sm:py-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        {/* 3D Card */}
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glow effect */}
          <div
            className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.2) 0%, transparent 70%)",
            }}
          />

          {/* Card border gradient */}
          <div
            className="relative rounded-2xl p-[1px] overflow-hidden transition-all duration-300"
            style={{
              background: isHovered
                ? "linear-gradient(135deg, rgba(249, 115, 22, 0.4), transparent 50%, rgba(251, 191, 36, 0.4))"
                : "linear-gradient(135deg, rgba(255,255,255,0.08), transparent 50%, rgba(255,255,255,0.04))",
            }}
          >
            {/* Card content */}
            <div
              className="relative rounded-2xl p-6 sm:p-8 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1f35 100%)",
                boxShadow: isHovered
                  ? "0 20px 40px -12px rgba(0, 0, 0, 0.7), 0 0 30px -8px rgba(249, 115, 22, 0.2)"
                  : "0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                transition: "box-shadow 0.3s ease",
              }}
            >
              {/* Light reflection */}
              <div
                className="absolute top-0 left-0 right-0 h-24 opacity-20 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                }}
              />

              {/* Decorative icon */}
              <div className="absolute -top-2 -right-2 w-20 h-20 opacity-10">
                <svg
                  className="w-full h-full text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                {/* Text content */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <span className="text-xs font-medium text-orange-400">
                      Get Started
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Ready to dive in?
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Start your trading journey today with M4Capital
                  </p>
                </div>

                {/* CTA Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={openSignupModal}
                    className="relative group/btn w-full sm:w-auto"
                  >
                    {/* Button glow */}
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-50 blur group-hover/btn:opacity-75 transition-opacity duration-300" />
                    <div
                      className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{
                        boxShadow:
                          "0 8px 20px -4px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <span>Create an account</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
                <div
                  className={`h-full bg-gradient-to-r from-orange-500 to-amber-500 transform transition-transform duration-700 ${
                    isHovered ? "translate-x-0" : "-translate-x-full"
                  }`}
                />
              </div>

              {/* Floating particles */}
              {isHovered && (
                <>
                  <div
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: "rgba(249, 115, 22, 0.4)",
                      top: "20%",
                      right: "25%",
                      filter: "blur(1px)",
                      animation: "float 2s ease-in-out infinite",
                    }}
                  />
                  <div
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "rgba(251, 191, 36, 0.4)",
                      bottom: "30%",
                      left: "20%",
                      filter: "blur(1px)",
                      animation: "float 2.5s ease-in-out infinite 0.3s",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Float animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
            opacity: 0.5;
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

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500); // Corresponds to preloader animation
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <CryptoMarketProvider>
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <HowItWorks />
        <FAQ />
        <CallToAction />
      </main>
    </CryptoMarketProvider>
  );
}
