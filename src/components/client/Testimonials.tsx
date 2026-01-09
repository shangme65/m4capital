"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";
import { VscVerifiedFilled } from "react-icons/vsc";
import { AnimatePresence, motion } from "framer-motion";
import { allTestimonials } from "@/lib/testimonials-data";

// Convert shared testimonials to the format used in this component
const testimonials = allTestimonials.map((t) => ({
  quote: t.text,
  author: t.name,
  title: t.role,
  country: t.country || "USA",
  rating: t.rating,
  image: t.image,
}));

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

  const rating = testimonial.rating;
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

function Testimonials() {
  // Independent indices for each card position (4 cards for desktop)
  const [card1Index, setCard1Index] = useState(0);
  const [card2Index, setCard2Index] = useState(1);
  const [card3Index, setCard3Index] = useState(2);
  const [card4Index, setCard4Index] = useState(3);

  // Pause states for each card
  const [card1Paused, setCard1Paused] = useState(false);
  const [card2Paused, setCard2Paused] = useState(false);
  const [card3Paused, setCard3Paused] = useState(false);
  const [card4Paused, setCard4Paused] = useState(false);

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
      if (!card1Paused) {
        setCard1Index((prev) => (prev + 4) % testimonials.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [card1Paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!card2Paused) {
        setCard2Index((prev) => (prev + 4) % testimonials.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [card2Paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!card3Paused) {
        setCard3Index((prev) => (prev + 4) % testimonials.length);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [card3Paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!card4Paused) {
        setCard4Index((prev) => (prev + 4) % testimonials.length);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [card4Paused]);

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

        {/* 4 cards grid - 1 column on mobile, 2x2 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AnimatePresence mode="wait">
            <TestimonialCard3D
              key={`card1-${card1Index}`}
              testimonialIndex={card1Index}
              cardPosition="left"
              isDarkMode={isDarkMode}
              isPaused={card1Paused}
              onPause={() => setCard1Paused(true)}
              onResume={() => setCard1Paused(false)}
              onNext={() =>
                setCard1Index((prev) => (prev + 1) % testimonials.length)
              }
              onPrev={() =>
                setCard1Index(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
            />
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <TestimonialCard3D
              key={`card2-${card2Index}`}
              testimonialIndex={card2Index}
              cardPosition="right"
              isDarkMode={isDarkMode}
              isPaused={card2Paused}
              onPause={() => setCard2Paused(true)}
              onResume={() => setCard2Paused(false)}
              onNext={() =>
                setCard2Index((prev) => (prev + 1) % testimonials.length)
              }
              onPrev={() =>
                setCard2Index(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
            />
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <TestimonialCard3D
              key={`card3-${card3Index}`}
              testimonialIndex={card3Index}
              cardPosition="center"
              isDarkMode={isDarkMode}
              isPaused={card3Paused}
              onPause={() => setCard3Paused(true)}
              onResume={() => setCard3Paused(false)}
              onNext={() =>
                setCard3Index((prev) => (prev + 1) % testimonials.length)
              }
              onPrev={() =>
                setCard3Index(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
            />
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <TestimonialCard3D
              key={`card4-${card4Index}`}
              testimonialIndex={card4Index}
              cardPosition="left"
              isDarkMode={isDarkMode}
              isPaused={card4Paused}
              onPause={() => setCard4Paused(true)}
              onResume={() => setCard4Paused(false)}
              onNext={() =>
                setCard4Index((prev) => (prev + 1) % testimonials.length)
              }
              onPrev={() =>
                setCard4Index(
                  (prev) =>
                    (prev - 1 + testimonials.length) % testimonials.length
                )
              }
            />
          </AnimatePresence>
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
}

export default Testimonials;
