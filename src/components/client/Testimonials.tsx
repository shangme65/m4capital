"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";
import { VscVerifiedFilled } from "react-icons/vsc";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "This platform has completely changed the way I trade. The insights and tools are top-notch.",
    author: "Liam Johnson",
    title: "Full-time Trader",
    country: "USA",
    rating: 5,
    image: "/avatars/avatar-1.jpg",
  },
  {
    quote:
      "An essential tool for any serious forex trader. The real-time data is incredibly accurate.",
    author: "Sophie Müller",
    title: "Financial Analyst",
    country: "Germany",
    rating: 5,
    image: "/avatars/avatar-2.jpg",
  },
  {
    quote:
      "I've seen a significant improvement in my trading performance since I started using this service.",
    author: "Kenji Tanaka",
    title: "Hobbyist Investor",
    country: "Japan",
    rating: 4,
    image: "/avatars/avatar-3.jpg",
  },
  {
    quote:
      "The user interface is so intuitive. I was able to get started in minutes.",
    author: "Olivia Smith",
    title: "Beginner Trader",
    country: "United Kingdom",
    rating: 5,
    image: "/avatars/avatar-4.jpg",
  },
  {
    quote:
      "Customer support is fantastic. They are always quick to respond and very helpful.",
    author: "Lucas Costa",
    title: "Portfolio Manager",
    country: "Brazil",
    rating: 5,
    image: "/avatars/avatar-5.jpg",
  },
  {
    quote: "The low latency execution has saved me a lot of money on slippage.",
    author: "Noah Tremblay",
    title: "Day Trader",
    country: "Canada",
    rating: 5,
    image: "/avatars/avatar-6.jpg",
  },
  {
    quote:
      "I love the community features. It's great to be able to share strategies with other traders.",
    author: "Priya Sharma",
    title: "Social Trader",
    country: "India",
    rating: 4,
    image: "/avatars/avatar-7.jpg",
  },
  {
    quote:
      "The analytics are powerful yet easy to understand. A game-changer for my strategy.",
    author: "David Okoro",
    title: "Technical Analyst",
    country: "Nigeria",
    rating: 5,
    image: "/avatars/avatar-8.jpg",
  },
  {
    quote:
      "Secure, fast, and reliable. Everything I need in a trading platform.",
    author: "Chloe Williams",
    title: "Long-term Investor",
    country: "Australia",
    rating: 5,
    image: "/avatars/avatar-9.jpg",
  },
  {
    quote:
      "The mobile app is just as powerful as the desktop version. I can trade on the go.",
    author: "Mateo Garcia",
    title: "Remote Trader",
    country: "Mexico",
    rating: 4,
    image: "/avatars/avatar-10.jpg",
  },
  {
    quote: "Finally, a platform that puts the user first. Highly recommended.",
    author: "Léa Dubois",
    title: "Financial Advisor",
    country: "France",
    rating: 5,
    image: "/avatars/avatar-11.jpg",
  },
  {
    quote:
      "The educational resources helped me get up to speed with advanced trading concepts.",
    author: "Min-jun Kim",
    title: "New Investor",
    country: "South Korea",
    rating: 5,
    image: "/avatars/avatar-12.jpg",
  },
  {
    quote:
      "I've tried many platforms, and this is by far the best. The execution speed is unmatched.",
    author: "Sofia Rossi",
    title: "Scalper",
    country: "Italy",
    rating: 5,
    image: "/avatars/avatar-13.jpg",
  },
  {
    quote: "The variety of available currency pairs is impressive.",
    author: "Carlos Fernández",
    title: "Global Macro Trader",
    country: "Spain",
    rating: 4,
    image: "/avatars/avatar-14.jpg",
  },
  {
    quote: "A trustworthy platform with transparent pricing. No hidden fees.",
    author: "Thabo Zulu",
    title: "Retail Investor",
    country: "South Africa",
    rating: 5,
    image: "/avatars/avatar-15.jpg",
  },
  {
    quote: "The charting tools are incredibly advanced and customizable.",
    author: "Ivan Petrov",
    title: "Chartist",
    country: "Russia",
    rating: 5,
    image: "/avatars/avatar-16.jpg",
  },
  {
    quote:
      "This platform has given me the confidence to take my trading to the next level.",
    author: "Emma Johansson",
    title: "Growth Investor",
    country: "Sweden",
    rating: 5,
    image: "/avatars/avatar-17.jpg",
  },
  {
    quote:
      "The withdrawal process is fast and hassle-free. I got my funds in less than a day.",
    author: "Pablo Torres",
    title: "FX Trader",
    country: "Argentina",
    rating: 5,
    image: "/avatars/avatar-18.jpg",
  },
  {
    quote: "I appreciate the focus on security. I feel safe trading here.",
    author: "Anna de Vries",
    title: "Risk Manager",
    country: "Netherlands",
    rating: 5,
    image: "/avatars/avatar-19.jpg",
  },
  {
    quote:
      "The best platform for automated trading strategies. The API is robust and well-documented.",
    author: "Wei Chen",
    title: "Algo Trader",
    country: "China",
    rating: 5,
    image: "/avatars/avatar-20.jpg",
  },
];

// Deterministic pseudo-random rating in [4.5, 5.0] based on index
const seededRating = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  const frac = x - Math.floor(x);
  return Math.round((4.5 + frac * 0.5) * 10) / 10;
};

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  country: string;
  rating: number;
  image: string;
}

const TestimonialCard3D = ({
  testimonialIndex,
  cardPosition,
  isDarkMode,
  isPaused,
  onPause,
  onResume,
  onNext,
  onPrev,
}: {
  testimonialIndex: number;
  cardPosition: "left" | "right" | "center";
  isDarkMode: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);

  const testimonial = testimonials[testimonialIndex % testimonials.length];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDarkMode || dragStartX !== null) return; // Only 3D tilt in dark mode, not while dragging
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
    onResume();
    setDragStartX(null);
    setDragDelta(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onPause();
  };

  // Touch/drag handlers for swipe navigation
  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    onPause();
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX !== null) {
      setDragDelta(clientX - dragStartX);
    }
  };

  const handleDragEnd = () => {
    if (dragStartX !== null) {
      if (dragDelta > 50) {
        onPrev();
      } else if (dragDelta < -50) {
        onNext();
      }
    }
    setDragStartX(null);
    setDragDelta(0);
  };

  const rating = seededRating(testimonialIndex);
  const gradientColors =
    cardPosition === "left"
      ? {
          from: "from-blue-500",
          to: "to-cyan-400",
          glow: "rgba(59, 130, 246, 0.3)",
        }
      : cardPosition === "right"
      ? {
          from: "from-purple-500",
          to: "to-pink-400",
          glow: "rgba(168, 85, 247, 0.3)",
        }
      : {
          from: "from-emerald-500",
          to: "to-teal-400",
          glow: "rgba(16, 185, 129, 0.3)",
        };

  // Light mode card
  if (!isDarkMode) {
    return (
      <motion.div
        className="relative w-full group select-none"
        key={testimonialIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: dragDelta * 0.5,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div
          className="relative cursor-grab active:cursor-grabbing rounded-2xl bg-white p-5 overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          style={{
            boxShadow: isHovered
              ? "0 35px 60px -15px rgba(0, 0, 0, 0.4), 0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.2)"
              : "0 20px 50px -15px rgba(0, 0, 0, 0.2), 0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 4px 15px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Swipe hint indicators */}
          <div className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
            <div className="text-gray-400 text-lg">‹</div>
          </div>
          <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
            <div className="text-gray-400 text-lg">›</div>
          </div>

          {/* Rating badge */}
          <div className="absolute top-3 right-3">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} text-white text-xs font-semibold`}
              style={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 6px 15px -3px rgba(0, 0, 0, 0.25)",
              }}
            >
              <SiTrustpilot size={12} />
              <span>{rating}</span>
            </div>
          </div>

          {/* Profile section */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div
                className={`absolute -inset-1 rounded-full bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} opacity-60 blur-sm`}
              />
              <Image
                src={testimonial.image}
                alt={testimonial.author}
                width={48}
                height={48}
                className="relative rounded-full border-2 border-white shadow-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-900 font-semibold text-sm truncate">
                  {testimonial.author}
                </span>
                <VscVerifiedFilled
                  className="text-blue-500 flex-shrink-0"
                  size={14}
                />
              </div>
              <span className="text-gray-500 text-xs block truncate">
                {testimonial.title}, {testimonial.country}
              </span>
            </div>
          </div>

          {/* Stars */}
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={12}
                className={
                  i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                }
              />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
            <div
              className={`h-full bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Dark mode card (existing 3D style)

  return (
    <motion.div
      className="relative w-full select-none"
      style={{ perspective: "1000px" }}
      key={testimonialIndex}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: dragDelta * 0.5,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="relative cursor-grab active:cursor-grabbing group"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseUp={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${gradientColors.glow} 0%, transparent 70%)`,
          }}
        />

        {/* Card border gradient */}
        <div
          className="relative rounded-2xl p-[1px] overflow-hidden"
          style={{
            background: isHovered
              ? `linear-gradient(135deg, ${gradientColors.glow}, transparent 50%, ${gradientColors.glow})`
              : "linear-gradient(135deg, rgba(255,255,255,0.08), transparent 50%, rgba(255,255,255,0.04))",
            transition: "background 0.3s ease",
          }}
        >
          {/* Card content */}
          <div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1f35 100%)",
              boxShadow: isHovered
                ? `0 20px 40px -12px rgba(0, 0, 0, 0.7), 0 0 30px -8px ${gradientColors.glow}`
                : "0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            {/* Light reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-20 opacity-20 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
              }}
            />

            {/* Rating badge */}
            <div
              className="absolute -top-1 -right-1"
              style={{ transform: "translateZ(25px)" }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} text-white text-xs font-semibold shadow-lg`}
              >
                <SiTrustpilot size={12} />
                <span>{rating}</span>
              </div>
            </div>

            {/* Profile section */}
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div
                className="relative"
                style={{
                  transform: isHovered ? "translateZ(15px)" : "translateZ(0)",
                  transition: "transform 0.3s ease",
                }}
              >
                <div
                  className={`absolute -inset-1 rounded-full bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} opacity-60 blur-sm`}
                />
                <Image
                  src={testimonial.image}
                  alt={testimonial.author}
                  width={48}
                  height={48}
                  className="relative rounded-full border-2 border-white/20 shadow-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold text-sm truncate">
                    {testimonial.author}
                  </span>
                  <VscVerifiedFilled
                    className="text-blue-400 flex-shrink-0"
                    size={14}
                  />
                </div>
                <span className="text-gray-400 text-xs block truncate">
                  {testimonial.title}, {testimonial.country}
                </span>
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-0.5 mb-2 relative z-10">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={12}
                  className={
                    i < testimonial.rating ? "text-yellow-400" : "text-gray-600"
                  }
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote
              className="text-gray-300 text-sm leading-relaxed relative z-10 line-clamp-3"
              style={{ transform: "translateZ(10px)" }}
            >
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-2xl">
              <div
                className={`h-full bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}
              />
            </div>

            {/* Floating particles on hover */}
            {isHovered && (
              <>
                <div
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: gradientColors.glow,
                    top: "25%",
                    right: "15%",
                    filter: "blur(1px)",
                    animation: "float 2s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: gradientColors.glow,
                    bottom: "20%",
                    left: "10%",
                    filter: "blur(1px)",
                    animation: "float 2.5s ease-in-out infinite 0.3s",
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

const Testimonials: React.FC = () => {
  // Independent indices for each card position
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(1);
  const [centerIndex, setCenterIndex] = useState(2);

  // Pause states for each card
  const [leftPaused, setLeftPaused] = useState(false);
  const [rightPaused, setRightPaused] = useState(false);
  const [centerPaused, setCenterPaused] = useState(false);

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

  // Independent auto-rotation for each card
  useEffect(() => {
    const interval = setInterval(() => {
      if (!leftPaused) {
        setLeftIndex((prev) => (prev + 3) % testimonials.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [leftPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!rightPaused) {
        setRightIndex((prev) => (prev + 3) % testimonials.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [rightPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!centerPaused) {
        setCenterIndex((prev) => (prev + 3) % testimonials.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [centerPaused]);

  return (
    <div className="relative bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-12 sm:py-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4"
            style={{
              boxShadow: isDarkMode
                ? "0 8px 20px -5px rgba(34, 197, 94, 0.3), 0 4px 12px -2px rgba(0, 0, 0, 0.2)"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 6px 15px -3px rgba(0, 0, 0, 0.15)",
            }}
          >
            <SiTrustpilot className="text-green-500" size={14} />
            <span className="text-xs font-medium text-green-400">
              4.8 Rating on Trustpilot
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            What Our{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Traders Say
            </span>
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Join thousands of satisfied traders worldwide
          </p>
        </motion.div>

        {/* Top row - 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <AnimatePresence mode="wait">
            <TestimonialCard3D
              key={`left-${leftIndex}`}
              testimonialIndex={leftIndex}
              cardPosition="left"
              isDarkMode={isDarkMode}
              isPaused={leftPaused}
              onPause={() => setLeftPaused(true)}
              onResume={() => setLeftPaused(false)}
              onNext={() =>
                setLeftIndex((prev) => (prev + 1) % testimonials.length)
              }
              onPrev={() =>
                setLeftIndex(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
            />
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <TestimonialCard3D
              key={`right-${rightIndex}`}
              testimonialIndex={rightIndex}
              cardPosition="right"
              isDarkMode={isDarkMode}
              isPaused={rightPaused}
              onPause={() => setRightPaused(true)}
              onResume={() => setRightPaused(false)}
              onNext={() =>
                setRightIndex((prev) => (prev + 1) % testimonials.length)
              }
              onPrev={() =>
                setRightIndex(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
            />
          </AnimatePresence>
        </div>

        {/* Bottom row - 1 centered card */}
        <div className="flex justify-center">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <AnimatePresence mode="wait">
              <TestimonialCard3D
                key={`center-${centerIndex}`}
                testimonialIndex={centerIndex}
                cardPosition="center"
                isDarkMode={isDarkMode}
                isPaused={centerPaused}
                onPause={() => setCenterPaused(true)}
                onResume={() => setCenterPaused(false)}
                onNext={() =>
                  setCenterIndex((prev) => (prev + 1) % testimonials.length)
                }
                onPrev={() =>
                  setCenterIndex(
                    (prev) =>
                      (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Float animation keyframes */}
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
};

export default Testimonials;
