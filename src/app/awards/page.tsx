"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

// Awards data matching the IQ Option screenshots
const awards = [
  {
    id: 1,
    year: "2024",
    title: "Best Crypto and Forex Broker Thailand 2024",
    description:
      'Thanks to our outstanding service and products, we have been awarded as the "Best Crypto and Forex Broker Thailand" by FX Awards, a globally recognized authority in the forex and crypto trading industry.',
    awardedBy: "Forex Awards",
    type: "laurel", // laurel wreath trophy
  },
  {
    id: 2,
    year: "2024",
    title: "Best Trading Platform Global 2024",
    description:
      "Being the leading online trading platform, we continue to innovate and expand our offerings, so traders can expect even more exciting features and benefits in the future.",
    awardedBy: "World Business Outlook",
    type: "shield", // shield with laurel
  },
  {
    id: 3,
    year: "2024",
    title: "Best Mobile Trading App APAC 2024",
    description:
      "We have excelled in this respective category, demonstrating extraordinary aptness and agility to respond to market shifts, echoing through our ability to maintain our dominance in a highly competitive marketplace.",
    awardedBy: "UF Awards",
    type: "crystal", // crystal circular award
  },
  {
    id: 4,
    year: "2023",
    title: "Most Innovative Trading Platform Global 2023",
    description:
      "Our platform has been recognized as the most innovative by INTLBM, a global media platform that monitors the business landscape worldwide and honors companies that excel in customer service, innovation, leadership, and sustainability.",
    awardedBy: "International Business Magazine",
    type: "crystal-hex", // hexagonal crystal
  },
  {
    id: 5,
    year: "2023",
    title: "Best Mobile Trading App Global 2023",
    description:
      "The M4Capital mobile app has cemented its position as the benchmark for online trading platforms by receiving a top-tier award from World Business Outlook. The renowned business publication recognized the app's intuitive UI and powerful technology, which made it a top pick among traders worldwide.",
    awardedBy: "World Business Outlook",
    type: "shield",
  },
  {
    id: 6,
    year: "2022",
    title: "Best Trading Experience 2022",
    description:
      "This award highlights top brokers from around the world, celebrating innovators and ground-breakers in their respective niches. The M4Capital platform was recognized as the most elaborate and user-friendly, which got it to the top 20 best brokers according to Forex Awards.",
    awardedBy: "WorldForexAward",
    type: "laurel",
  },
  {
    id: 7,
    year: "2022",
    title: "Best Trading Platform 2022",
    description:
      "Our platform was rated the best in the Brokerage category by a well-known investor portal. Its mission is to compare brokers by different parameters and regions to highlight the best trading environments and award the best performers.",
    awardedBy: "FX Daily Info",
    type: "plaque", // rectangular plaque
  },
  {
    id: 8,
    year: "2022",
    title: "Excellence In Forex Platform Global 2022",
    description:
      "This award is a recognition that we make outstanding achievements visible to a broad public. In the year of a volatile landscape in the FX market, our platform was voted best for Forex trading in the Global category.",
    awardedBy: "Global Business Review Magazine",
    type: "multi-crystal", // multiple crystal awards
  },
];

// Award Trophy Components
const LaurelWreathTrophy = ({
  year,
  title,
}: {
  year: string;
  title: string;
}) => (
  <div className="relative w-64 h-72">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl" />

    {/* Main trophy */}
    <svg viewBox="0 0 200 220" className="w-full h-full">
      {/* Left laurel branch */}
      <g className="text-amber-600/80">
        <path
          d="M40,180 Q30,150 35,120 Q25,130 30,100 Q20,110 28,80 Q18,90 30,60 Q25,70 40,50 Q38,60 55,45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {[180, 150, 120, 90, 60].map((y, i) => (
          <ellipse
            key={`left-${i}`}
            cx={35 - i * 2}
            cy={y - i * 30}
            rx="12"
            ry="6"
            fill="currentColor"
            transform={`rotate(-30 ${35 - i * 2} ${y - i * 30})`}
          />
        ))}
      </g>

      {/* Right laurel branch */}
      <g className="text-amber-600/80">
        <path
          d="M160,180 Q170,150 165,120 Q175,130 170,100 Q180,110 172,80 Q182,90 170,60 Q175,70 160,50 Q162,60 145,45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {[180, 150, 120, 90, 60].map((y, i) => (
          <ellipse
            key={`right-${i}`}
            cx={165 + i * 2}
            cy={y - i * 30}
            rx="12"
            ry="6"
            fill="currentColor"
            transform={`rotate(30 ${165 + i * 2} ${y - i * 30})`}
          />
        ))}
      </g>

      {/* Center circle badge */}
      <circle
        cx="100"
        cy="110"
        r="55"
        fill="#1a1a2e"
        stroke="#3d3d5c"
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="110"
        r="48"
        fill="none"
        stroke="#4a4a6a"
        strokeWidth="1"
      />

      {/* M4Capital Logo */}
      <g transform="translate(75, 70)">
        <rect x="0" y="0" width="50" height="20" rx="3" fill="#f97316" />
        <text
          x="25"
          y="14"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="white"
        >
          M4Capital
        </text>
      </g>

      {/* Year */}
      <text
        x="100"
        y="110"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill="white"
      >
        {year}
      </text>

      {/* Award name */}
      <text
        x="100"
        y="130"
        textAnchor="middle"
        fontSize="8"
        fill="white"
        className="font-medium"
      >
        {title.split(" ").slice(0, 2).join(" ")}
      </text>
      <text x="100" y="142" textAnchor="middle" fontSize="8" fill="white">
        {title.split(" ").slice(2, 4).join(" ")}
      </text>

      {/* FOREX AWARDS text */}
      <text
        x="100"
        y="160"
        textAnchor="middle"
        fontSize="7"
        fill="#888"
        letterSpacing="1"
      >
        FOREX AWARDS
      </text>
    </svg>
  </div>
);

const ShieldTrophy = ({ year, title }: { year: string; title: string }) => (
  <div className="relative w-64 h-72">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-400/20 via-transparent to-transparent rounded-full blur-3xl" />

    <svg viewBox="0 0 200 240" className="w-full h-full">
      {/* Left laurel */}
      <g className="text-slate-500/60">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={`sl-${i}`}
            cx={45 - i * 3}
            cy={200 - i * 35}
            rx="10"
            ry="5"
            fill="currentColor"
            transform={`rotate(-25 ${45 - i * 3} ${200 - i * 35})`}
          />
        ))}
      </g>

      {/* Right laurel */}
      <g className="text-slate-500/60">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={`sr-${i}`}
            cx={155 + i * 3}
            cy={200 - i * 35}
            rx="10"
            ry="5"
            fill="currentColor"
            transform={`rotate(25 ${155 + i * 3} ${200 - i * 35})`}
          />
        ))}
      </g>

      {/* Shield shape */}
      <path
        d="M100,30 L160,50 L160,130 Q160,180 100,210 Q40,180 40,130 L40,50 Z"
        fill="url(#shieldGradient)"
        stroke="#4a4a6a"
        strokeWidth="2"
      />

      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d2d3d" />
          <stop offset="50%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#2d2d3d" />
        </linearGradient>
      </defs>

      {/* M4Capital Logo */}
      <g transform="translate(70, 50)">
        <rect x="0" y="0" width="60" height="22" rx="3" fill="#f97316" />
        <text
          x="30"
          y="15"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="white"
        >
          M4Capital
        </text>
      </g>

      {/* Award text */}
      <text
        x="100"
        y="95"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="bold"
      >
        {title.split(" ").slice(0, 2).join(" ")}
      </text>
      <text
        x="100"
        y="110"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="bold"
      >
        {title.split(" ").slice(2, 4).join(" ")}
      </text>
      <text
        x="100"
        y="125"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="bold"
      >
        {title.split(" ").slice(4).join(" ")}
      </text>

      {/* Award organization */}
      <text x="100" y="165" textAnchor="middle" fontSize="7" fill="#888">
        WORLD BUSINESS
      </text>
      <text x="100" y="175" textAnchor="middle" fontSize="7" fill="#888">
        OUTLOOK
      </text>
    </svg>
  </div>
);

const CrystalTrophy = ({ year, title }: { year: string; title: string }) => (
  <div className="relative w-64 h-72">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-transparent rounded-full blur-3xl" />

    <svg viewBox="0 0 200 240" className="w-full h-full">
      {/* Left laurel */}
      <g className="text-slate-500/50">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={`cl-${i}`}
            cx={40 - i * 2}
            cy={190 - i * 30}
            rx="10"
            ry="5"
            fill="currentColor"
            transform={`rotate(-30 ${40 - i * 2} ${190 - i * 30})`}
          />
        ))}
      </g>

      {/* Right laurel */}
      <g className="text-slate-500/50">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={`cr-${i}`}
            cx={160 + i * 2}
            cy={190 - i * 30}
            rx="10"
            ry="5"
            fill="currentColor"
            transform={`rotate(30 ${160 + i * 2} ${190 - i * 30})`}
          />
        ))}
      </g>

      {/* Crystal circle */}
      <circle
        cx="100"
        cy="110"
        r="60"
        fill="none"
        stroke="url(#crystalGradient)"
        strokeWidth="3"
      />
      <circle cx="100" cy="110" r="55" fill="rgba(20,20,40,0.8)" />
      <circle
        cx="100"
        cy="110"
        r="50"
        fill="none"
        stroke="rgba(100,150,200,0.3)"
        strokeWidth="1"
      />

      <defs>
        <linearGradient
          id="crystalGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="rgba(150,200,255,0.8)" />
          <stop offset="50%" stopColor="rgba(100,150,200,0.4)" />
          <stop offset="100%" stopColor="rgba(150,200,255,0.8)" />
        </linearGradient>
      </defs>

      {/* M4Capital Logo */}
      <g transform="translate(70, 70)">
        <rect x="0" y="0" width="60" height="20" rx="3" fill="#f97316" />
        <text
          x="30"
          y="14"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="white"
        >
          M4Capital
        </text>
      </g>

      {/* Year */}
      <text
        x="100"
        y="115"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="white"
      >
        {year}
      </text>

      {/* Award name */}
      <text x="100" y="132" textAnchor="middle" fontSize="7" fill="white">
        {title.split(" ").slice(0, 3).join(" ")}
      </text>
      <text x="100" y="143" textAnchor="middle" fontSize="7" fill="white">
        {title.split(" ").slice(3).join(" ")}
      </text>

      {/* UFAWARDS text */}
      <text
        x="100"
        y="158"
        textAnchor="middle"
        fontSize="6"
        fill="#888"
        letterSpacing="1"
      >
        UFAWARDS
      </text>
    </svg>
  </div>
);

const HexCrystalTrophy = ({ year, title }: { year: string; title: string }) => (
  <div className="relative w-64 h-72">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-300/10 via-transparent to-transparent rounded-full blur-3xl" />

    <svg viewBox="0 0 200 240" className="w-full h-full">
      {/* Hexagonal crystal shape */}
      <polygon
        points="100,30 160,60 160,160 100,190 40,160 40,60"
        fill="rgba(40,40,60,0.9)"
        stroke="rgba(150,180,200,0.5)"
        strokeWidth="2"
      />
      <polygon
        points="100,40 150,65 150,150 100,175 50,150 50,65"
        fill="none"
        stroke="rgba(100,130,160,0.3)"
        strokeWidth="1"
      />

      {/* M4Capital Logo */}
      <g transform="translate(65, 55)">
        <rect x="0" y="0" width="70" height="22" rx="3" fill="#f97316" />
        <text
          x="35"
          y="15"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="white"
        >
          M4Capital
        </text>
      </g>

      {/* Award text */}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        fontSize="9"
        fill="white"
        fontWeight="bold"
      >
        {title.split(" ").slice(0, 2).join(" ")}
      </text>
      <text
        x="100"
        y="115"
        textAnchor="middle"
        fontSize="9"
        fill="white"
        fontWeight="bold"
      >
        {title.split(" ").slice(2, 4).join(" ")}
      </text>
      <text
        x="100"
        y="130"
        textAnchor="middle"
        fontSize="9"
        fill="white"
        fontWeight="bold"
      >
        {title.split(" ").slice(4).join(" ")}
      </text>

      {/* Organization */}
      <text x="100" y="160" textAnchor="middle" fontSize="6" fill="#888">
        INTERNATIONAL
      </text>
      <text x="100" y="170" textAnchor="middle" fontSize="6" fill="#888">
        BUSINESS MAGAZINE
      </text>
    </svg>
  </div>
);

const PlaqueTrophy = ({ year, title }: { year: string; title: string }) => (
  <div className="relative w-64 h-72">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 via-transparent to-transparent rounded-full blur-3xl" />

    <svg viewBox="0 0 200 240" className="w-full h-full">
      {/* Plaque shape */}
      <rect
        x="35"
        y="40"
        width="130"
        height="160"
        rx="8"
        fill="url(#plaqueGradient)"
        stroke="#5a4a3a"
        strokeWidth="2"
      />
      <rect
        x="45"
        y="50"
        width="110"
        height="140"
        rx="4"
        fill="rgba(30,25,20,0.9)"
      />

      <defs>
        <linearGradient id="plaqueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b6914" />
          <stop offset="50%" stopColor="#5a4a3a" />
          <stop offset="100%" stopColor="#8b6914" />
        </linearGradient>
      </defs>

      {/* M4Capital Logo */}
      <g transform="translate(65, 65)">
        <rect x="0" y="0" width="70" height="20" rx="3" fill="#f97316" />
        <text
          x="35"
          y="14"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="white"
        >
          M4Capital
        </text>
      </g>

      {/* Stars */}
      <text x="100" y="105" textAnchor="middle" fontSize="14" fill="#c9a227">
        ★★★
      </text>

      {/* Award text */}
      <text
        x="100"
        y="125"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="bold"
      >
        Best Trading
      </text>
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="bold"
      >
        Platform
      </text>

      {/* Year */}
      <text x="100" y="160" textAnchor="middle" fontSize="8" fill="#c9a227">
        AWARD {year}
      </text>

      {/* Organization */}
      <text x="100" y="180" textAnchor="middle" fontSize="6" fill="#888">
        Forexdailyinfo.com
      </text>
    </svg>
  </div>
);

const MultiCrystalTrophy = ({
  year,
  title,
}: {
  year: string;
  title: string;
}) => (
  <div className="relative w-64 h-72">
    {/* Glow effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-pink-400/10 via-transparent to-transparent rounded-full blur-3xl" />

    <svg viewBox="0 0 200 240" className="w-full h-full">
      {/* Back crystal */}
      <polygon
        points="130,60 170,85 170,165 130,190 90,165 90,85"
        fill="rgba(60,50,70,0.7)"
        stroke="rgba(180,150,200,0.4)"
        strokeWidth="1"
      />

      {/* Front crystal */}
      <polygon
        points="80,50 140,50 160,80 160,160 140,190 80,190 60,160 60,80"
        fill="rgba(40,35,50,0.95)"
        stroke="rgba(200,180,220,0.5)"
        strokeWidth="2"
      />

      {/* Inner glow line */}
      <polygon
        points="85,58 135,58 152,83 152,155 135,180 85,180 68,155 68,83"
        fill="none"
        stroke="rgba(150,130,170,0.3)"
        strokeWidth="1"
      />

      {/* Content */}
      <text x="110" y="85" textAnchor="middle" fontSize="8" fill="white">
        Excellence
      </text>
      <text x="110" y="98" textAnchor="middle" fontSize="8" fill="white">
        In Forex Trading
      </text>
      <text x="110" y="111" textAnchor="middle" fontSize="8" fill="white">
        Platform Global
      </text>

      {/* Stars */}
      <text x="110" y="130" textAnchor="middle" fontSize="10" fill="#d4af37">
        ★★★★★
      </text>

      {/* Year */}
      <text
        x="110"
        y="148"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="white"
      >
        {year}
      </text>
      <text x="110" y="162" textAnchor="middle" fontSize="7" fill="#888">
        AWARD WINNING
      </text>

      {/* M4Capital Logo */}
      <g transform="translate(80, 168)">
        <rect x="0" y="0" width="60" height="16" rx="2" fill="#f97316" />
        <text
          x="30"
          y="11"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="white"
        >
          M4Capital
        </text>
      </g>
    </svg>
  </div>
);

// Trophy renderer based on type
const AwardTrophy = ({ award }: { award: (typeof awards)[0] }) => {
  const { type, year, title } = award;

  switch (type) {
    case "laurel":
      return <LaurelWreathTrophy year={year} title={title} />;
    case "shield":
      return <ShieldTrophy year={year} title={title} />;
    case "crystal":
      return <CrystalTrophy year={year} title={title} />;
    case "crystal-hex":
      return <HexCrystalTrophy year={year} title={title} />;
    case "plaque":
      return <PlaqueTrophy year={year} title={title} />;
    case "multi-crystal":
      return <MultiCrystalTrophy year={year} title={title} />;
    default:
      return <LaurelWreathTrophy year={year} title={title} />;
  }
};

// Laurel decoration icon
const LaurelIcon = () => (
  <svg viewBox="0 0 60 30" className="w-12 h-6 text-gray-500">
    <g fill="currentColor" opacity="0.5">
      {/* Left branch */}
      <ellipse cx="12" cy="15" rx="5" ry="3" transform="rotate(-30 12 15)" />
      <ellipse cx="18" cy="10" rx="5" ry="3" transform="rotate(-20 18 10)" />
      <ellipse cx="25" cy="8" rx="4" ry="2" transform="rotate(-10 25 8)" />
      {/* Right branch */}
      <ellipse cx="48" cy="15" rx="5" ry="3" transform="rotate(30 48 15)" />
      <ellipse cx="42" cy="10" rx="5" ry="3" transform="rotate(20 42 10)" />
      <ellipse cx="35" cy="8" rx="4" ry="2" transform="rotate(10 35 8)" />
    </g>
  </svg>
);

export default function AwardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + awards.length) % awards.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % awards.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      handleNext();
    }
    if (touchStart - touchEnd < -75) {
      handlePrev();
    }
  };

  const currentAward = awards[currentIndex];

  return (
    <div className="min-h-screen bg-[#0d0d15]">
      {/* Main Content - Full dark background */}
      <section
        className="relative min-h-screen pt-20 pb-16 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(180,130,50,0.15) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(180,130,50,0.1) 0%, transparent 50%), linear-gradient(180deg, #0d0d15 0%, #151520 50%, #0d0d15 100%)",
        }}
      >
        {/* Particle/sparkle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16"
          >
            The Award-Winning Software
          </motion.h1>

          {/* Award Carousel */}
          <div
            className="relative max-w-lg mx-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Navigation Arrows - Desktop */}
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-10 h-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Trophy Display */}
                <div className="flex justify-center mb-8">
                  <AwardTrophy award={currentAward} />
                </div>

                {/* Laurel decoration */}
                <div className="flex justify-center mb-4">
                  <LaurelIcon />
                </div>

                {/* Award Title */}
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                  {currentAward.title}
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-center leading-relaxed mb-6 max-w-md mx-auto px-4">
                  {currentAward.description}
                </p>

                {/* Awarded By */}
                <p className="text-gray-500 text-sm">
                  {currentAward.awardedBy}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-12">
              {awards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    idx === currentIndex ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      <section className="py-4 bg-[#0d0d15] border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-orange-500">
                Home
              </Link>
              <span className="text-orange-500">▸</span>
              <span className="text-gray-400">Awards</span>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-2 border border-orange-500 rounded-full text-orange-500 hover:bg-orange-500/10 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-[#0d0d15]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Links */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6 text-sm">
              <Link
                href="/terms"
                className="text-gray-500 hover:text-orange-500"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-700">{"|"}</span>
              <Link
                href="/contact"
                className="text-gray-500 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-700">{"|"}</span>
              <Link
                href="/blog"
                className="text-gray-500 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-700">{"|"}</span>
              <Link
                href="#"
                className="text-gray-500 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-700">{"|"}</span>
              <Link href="/site-map" className="text-gray-500 hover:text-orange-500">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
