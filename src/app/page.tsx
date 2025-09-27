"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BackgroundSlider from "@/components/client/BackgroundSlider";
import AnimatedButton from "@/components/client/AnimatedButton";
import Features from "@/components/client/Features";
import Testimonials from "@/components/client/Testimonials";
import CryptoPriceTicker from "@/components/client/CryptoPriceTicker";
import FAQ from "@/components/client/FAQ";
import HowItWorks from "@/components/client/HowItWorks";
import Preloader from "@/components/client/Preloader";

type AnimationVariant = {
  initial: { opacity: number; x?: number; y?: number; scale?: number };
  animate: { opacity: number; x?: number; y?: number; scale?: number };
  exit: { opacity: number; x?: number; y?: number; scale?: number };
};

type AnimationVariants = {
  [key: string]: AnimationVariant;
};

function Hero() {
  const images = ["/hero-bg-1.jpg", "/hero-bg-2.jpg", "/hero-bg-3.jpg"];

  const heroContent = [
    {
      title: "Unlock Global Markets",
      description:
        "Trade Forex, stocks, and commodities from a single, powerful platform.",
    },
    {
      title: "Precision Trading Tools",
      description:
        "Leverage advanced charting and analytics for surgical market entry and exit.",
    },
    {
      title: "Institutional-Grade Liquidity",
      description:
        "Experience tight spreads and minimal slippage with our deep liquidity pools.",
    },
    {
      title: "Automate Your Strategies",
      description:
        "Build, backtest, and deploy trading algorithms with our robust API.",
    },
    {
      title: "Blazing-Fast Execution",
      description:
        "Gain a competitive edge with our low-latency infrastructure.",
    },
    {
      title: "Actionable Market Insights",
      description:
        "Receive real-time news and analysis to make informed trading decisions.",
    },
    {
      title: "Your Capital, Secured",
      description:
        "Trade with confidence, knowing your funds are protected by industry-leading security.",
    },
    {
      title: "Master the Markets",
      description:
        "Access exclusive educational content and webinars from seasoned trading experts.",
    },
    {
      title: "Trade on Your Terms",
      description:
        "Customize your trading environment with flexible layouts and powerful tools.",
    },
    {
      title: "24/7 Dedicated Support",
      description:
        "Our expert support team is always available to assist you, day or night.",
    },
    {
      title: "Seamless Mobile Trading",
      description:
        "Trade on-the-go with our full-featured and intuitive mobile application.",
    },
    {
      title: "Social Trading Revolution",
      description:
        "Copy the strategies of top-performing traders and enhance your portfolio.",
    },
    {
      title: "Transparent Fee Structure",
      description:
        "Enjoy competitive pricing with no hidden costs or commissions.",
    },
    {
      title: "Advanced Risk Management",
      description:
        "Protect your investments with sophisticated stop-loss and take-profit orders.",
    },
    {
      title: "Diverse Asset Portfolio",
      description:
        "Explore a wide range of currency pairs, indices, and cryptocurrencies.",
    },
    {
      title: "The Future of Algorithmic Trading",
      description:
        "Harness the power of AI to optimize your trading performance.",
    },
    {
      title: "Join a Global Trading Community",
      description:
        "Connect with and learn from a network of thousands of traders worldwide.",
    },
    {
      title: "Regulated and Trusted Broker",
      description: "Operate in a secure and compliant trading environment.",
    },
    {
      title: "Unleash Your Trading Potential",
      description:
        "We provide the tools, you define the success. Start your journey today.",
    },
    {
      title: "Next-Generation Trading Platform",
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
  const [title, setTitle] = useState(heroContent[0].title);
  const [description, setDescription] = useState(heroContent[0].description);
  const [titleAnimation, setTitleAnimation] = useState(variantNames[0]);
  const [descAnimation, setDescAnimation] = useState(variantNames[1]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (contentIndex + 1) % heroContent.length;

      // Start title change
      setTimeout(() => {
        let newTitleVariantName =
          variantNames[Math.floor(Math.random() * variantNames.length)];
        setTitleAnimation(newTitleVariantName);
        setTitle(heroContent[nextIndex].title);
      }, 0);

      // Start description change after a delay
      setTimeout(() => {
        let newDescVariantName =
          variantNames[Math.floor(Math.random() * variantNames.length)];
        while (newDescVariantName === titleAnimation) {
          newDescVariantName =
            variantNames[Math.floor(Math.random() * variantNames.length)];
        }
        setDescAnimation(newDescVariantName);
        setDescription(heroContent[nextIndex].description);
      }, 1500); // 1.5s delay for description

      setContentIndex(nextIndex);
    }, 5000); // Change content every 5 seconds

    return () => clearInterval(interval);
  }, [contentIndex, heroContent.length, titleAnimation]);

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <BackgroundSlider images={images} />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 text-center text-white p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.h1
            key={title}
            variants={animationVariants[titleAnimation]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.7, ease: "circOut" }}
            className="text-4xl md:text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}
          >
            {title}
          </motion.h1>
        </AnimatePresence>
        <div className="h-28 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={description}
              variants={animationVariants[descAnimation]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.7, ease: "circOut" }}
              className="text-xl md:text-2xl drop-shadow-md max-w-3xl mx-auto"
            >
              {description}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="space-x-4 mt-12">
          <AnimatedButton href="/login" text="Get Started" />
        </div>
      </div>
    </div>
  );
}

function CallToAction() {
  return (
    <div className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to dive in?
          <br />
          Start your trading journey today.
        </h2>
        <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
          <AnimatedButton href="/signup" text="Create an account" />
        </div>
      </div>
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
    <main>
      <Hero />
      <CryptoPriceTicker />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CallToAction />
    </main>
  );
}
