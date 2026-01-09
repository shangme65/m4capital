"use client";

import { useState, useEffect, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Features from "@/components/client/Features";
import Testimonials from "@/components/client/Testimonials";
import CryptoPriceTicker from "@/components/client/CryptoPriceTicker";
import { CryptoMarketProvider } from "@/components/client/CryptoMarketProvider";
import FAQ from "@/components/client/FAQ";
import HowItWorks from "@/components/client/HowItWorks";
import Preloader from "@/components/client/Preloader";
import HeroButtons from "@/components/client/HeroButtons";
import HeroTitle from "@/components/client/HeroTitle";
import HeroDescription from "@/components/client/HeroDescription";
import FloatingCryptoIcons from "@/components/client/FloatingCryptoIcons";
import HeroStats from "@/components/client/HeroStats";
import ScrollDownIndicator from "@/components/client/ScrollDownIndicator";
import MouseParallax from "@/components/client/MouseParallax";
import AnimatedTradingLines from "@/components/client/AnimatedTradingLines";
import CursorSpotlight from "@/components/client/CursorSpotlight";
import ParticleSystem from "@/components/client/ParticleSystem";
import AnimatedGradientBackground from "@/components/client/AnimatedGradientBackground";
import GlassmorphismCards from "@/components/client/GlassmorphismCards";
// import { default as dynamicImport } from "next/dynamic";
import TestimonialSlider from "@/components/client/TestimonialSlider";
import CountdownTimer from "@/components/client/CountdownTimer";
import { useModal } from "@/contexts/ModalContext";
import React from "react";
import MobileHeroInfoButton from "@/components/client/MobileHeroInfoButton";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Dynamically import InteractiveGlobe with no SSR (Disabled due to React 19 compatibility)
// const InteractiveGlobe = dynamicImport(
//   () => import("@/components/client/InteractiveGlobe"),
//   { ssr: false }
// );

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

  const handleTryDemo = () => {
    // Set practice mode in localStorage before navigation
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedAccountType", "practice");
    }
    router.push("/traderoom");
  };

  const heroContent = [
    {
      title: "Unlock Global Markets",
      description:
        "Trade Forex, stocks, and commodities from a single, powerful platform.",
      titleAnimation: "slideLeft",
      descAnimation: "slideRight",
    },
    {
      title: "Precision Trading Tools",
      description:
        "Leverage advanced charting and analytics for surgical market entry and exit.",
      titleAnimation: "slideRight",
      descAnimation: "fadeInUp",
    },
    {
      title: "Blazing Fast Execution",
      description:
        "Gain a competitive edge with our low-latency infrastructure.",
      titleAnimation: "fadeInDown",
      descAnimation: "scaleUp",
    },
    {
      title: "Your Capital Secured",
      description:
        "Trade with confidence, knowing your funds are protected by industry-leading security.",
      titleAnimation: "scaleUp",
      descAnimation: "slideLeft",
    },
    {
      title: "Next Generation Trading Platform",
      description:
        "Experience the pinnacle of trading technology, designed for performance and reliability.",
      titleAnimation: "fadeInUp",
      descAnimation: "fadeInDown",
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
  const [descriptionIndex, setDescriptionIndex] = useState(0);
  const [title, setTitle] = useState<React.ReactNode>(heroContent[0].title);
  const [description, setDescription] = useState(heroContent[0].description);
  const [titleAnimation, setTitleAnimation] = useState(heroContent[0].titleAnimation);
  const [descAnimation, setDescAnimation] = useState(heroContent[0].descAnimation);

  useEffect(() => {
    // Title changes immediately on mount and every 10 seconds
    const titleInterval = setInterval(() => {
      setContentIndex((prev) => {
        const nextIndex = (prev + 1) % heroContent.length;
        setTitleAnimation(heroContent[nextIndex].titleAnimation);
        setTitle(heroContent[nextIndex].title);
        return nextIndex;
      });
    }, 10000);

    // Description changes 5 seconds after mount and every 10 seconds
    const descriptionTimeout = setTimeout(() => {
      setDescriptionIndex((prev) => {
        const nextIndex = (prev + 1) % heroContent.length;
        setDescAnimation(heroContent[nextIndex].descAnimation);
        setDescription(heroContent[nextIndex].description);
        return nextIndex;
      });

      const descInterval = setInterval(() => {
        setDescriptionIndex((prev) => {
          const nextIndex = (prev + 1) % heroContent.length;
          setDescAnimation(heroContent[nextIndex].descAnimation);
          setDescription(heroContent[nextIndex].description);
          return nextIndex;
        });
      }, 10000);

      return () => clearInterval(descInterval);
    }, 5000);

    return () => {
      clearInterval(titleInterval);
      clearTimeout(descriptionTimeout);
    };
  }, []);

  return (
    <div className="relative h-[calc(100vh-60px)] sm:h-screen w-full overflow-hidden bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-[#0a0806]">
      {/* Animated Gradient Background */}
      <AnimatedGradientBackground />

      {/* Video Background (Optional - requires video file) */}
      {/* <VideoBackground /> */}

      {/* Cursor Spotlight Effect */}
      <CursorSpotlight />

      {/* Optional subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Particle System */}
      <div className="absolute inset-0 z-[2]">
        <ParticleSystem />
      </div>

      {/* Interactive Globe - Disabled due to React 19 compatibility issues */}
      {/* <InteractiveGlobe /> */}

      {/* Animated Trading Lines */}
      <div className="absolute inset-0 z-[3]">
        <AnimatedTradingLines />
      </div>

      {/* Floating Crypto Icons with Parallax */}
      <div className="absolute inset-0 z-[4]">
        <MouseParallax>
          <FloatingCryptoIcons />
        </MouseParallax>
      </div>

      {/* Hero Title - independent sliding */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center text-white px-4 sm:px-6 md:px-8 w-full max-w-7xl -mt-36">
        <HeroTitle
          title={title as string}
          contentIndex={contentIndex}
          animation={animationVariants[titleAnimation]}
        />
      </div>

      {/* Hero Description - independent sliding */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center text-white px-4 sm:px-6 md:px-8 w-full max-w-7xl -mt-8 sm:-mt-4">
        <HeroDescription
          description={description}
          contentIndex={descriptionIndex}
          animation={animationVariants[descAnimation]}
        />
      </div>

      {/* Floating Hero Buttons - fixed position */}
      <HeroButtons />

      {/* Achievement Badges - Below Market Pulse */}
      <AchievementBadges />

      {/* Countdown Timer - Top Left */}
      <CountdownTimer />

      {/* Glassmorphism Cards - Left and Right Sides */}
      <GlassmorphismCards />

      {/* Testimonial Slider - Bottom Right */}
      <TestimonialSlider />

      {/* Trustpilot Badge - separate positioning */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-end justify-center pb-44">
        <a
          href="https://www.trustpilot.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-1 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer pointer-events-auto"
        >
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">★</span>
          </div>
          <span className="text-white text-sm font-medium">4.5 ★ on Trustpilot</span>
        </a>
      </div>

      {/* Crypto Price Ticker at bottom - fixed position */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full pb-4">
        <CryptoPriceTicker />
      </div>

      {/* Scroll Down Indicator */}
      <ScrollDownIndicator />

      {/* Mobile Hero Info Button - edge positioned */}
      <MobileHeroInfoButton />
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

// Component to handle auth query params and open modals
function AuthHandler() {
  const searchParams = useSearchParams();
  const { openLoginModal, openSignupModal } = useModal();
  const [hasHandled, setHasHandled] = useState(false);

  useEffect(() => {
    // Only run once and only if not already handled
    if (hasHandled) return;

    const auth = searchParams.get("auth");

    if (auth === "login") {
      setHasHandled(true);
      // Clean up URL first
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("callbackUrl");
      window.history.replaceState({}, "", url.pathname);
      // Then open modal
      openLoginModal();
    } else if (auth === "signup") {
      setHasHandled(true);
      // Clean up URL first
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("callbackUrl");
      window.history.replaceState({}, "", url.pathname);
      // Then open modal
      openSignupModal();
    }
  }, [searchParams, openLoginModal, openSignupModal, hasHandled]);

  return null;
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
        <Suspense fallback={null}>
          <AuthHandler />
        </Suspense>
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
