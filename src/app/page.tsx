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
            key={`title-${contentIndex}`}
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
              key={`desc-${contentIndex}`}
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
          {session ? (
            // Logged in - Show "Go to Traderoom" button
            <button
              onClick={() => router.push("/dashboard/traderoom")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Go to Traderoom
            </button>
          ) : (
            // Not logged in - Show "Get Started" and "Try Free Demo" buttons
            <>
              <button
                onClick={openSignupModal}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={openLoginModal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 border border-gray-600"
              >
                Try Free Demo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CallToAction() {
  const { openSignupModal } = useModal();
  const { data: session } = useSession();

  // Hide CallToAction section when user is logged in
  if (session) {
    return null;
  }

  return (
    <div className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to dive in?
          <br />
          Start your trading journey today.
        </h2>
        <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
          <button
            onClick={openSignupModal}
            className="rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all duration-200 transform hover:scale-105"
          >
            Create an account
          </button>
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
    <CryptoMarketProvider>
      <main>
        <Hero />
        <CryptoPriceTicker />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>
    </CryptoMarketProvider>
  );
}
