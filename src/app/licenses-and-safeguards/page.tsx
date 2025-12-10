"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// Office images for the carousel (User provided images)
const officeImages = [
  "/uploads/m4capital-office-1.jpg",
  "/uploads/m4capital-office-2.jpg",
  "/uploads/m4capital-office-3.jpg",
  "/uploads/m4capital-office-4.jpg",
  "/uploads/m4capital-office-5.jpg",
  "/uploads/m4capital-office-6.jpg",
];

// Wax seal component for legal acts
const WaxSeal = ({ color }: { color: "red" | "gold" }) => {
  const fillColor = color === "red" ? "#8B4513" : "#DAA520";
  const shadowColor = color === "red" ? "#5D2E0C" : "#B8860B";

  return (
    <svg viewBox="0 0 60 60" className="w-14 h-14 flex-shrink-0">
      <defs>
        <radialGradient id={`sealGradient-${color}`} cx="30%" cy="30%">
          <stop
            offset="0%"
            stopColor={color === "red" ? "#CD853F" : "#FFD700"}
          />
          <stop offset="50%" stopColor={fillColor} />
          <stop offset="100%" stopColor={shadowColor} />
        </radialGradient>
      </defs>
      {/* Drip effect */}
      <ellipse cx="30" cy="48" rx="8" ry="6" fill={shadowColor} opacity="0.7" />
      <ellipse cx="42" cy="38" rx="5" ry="4" fill={shadowColor} opacity="0.6" />
      <ellipse cx="18" cy="40" rx="6" ry="5" fill={shadowColor} opacity="0.6" />
      {/* Main seal */}
      <circle cx="30" cy="30" r="22" fill={`url(#sealGradient-${color})`} />
      <circle
        cx="30"
        cy="30"
        r="18"
        fill="none"
        stroke={shadowColor}
        strokeWidth="1"
        opacity="0.5"
      />
      <circle
        cx="30"
        cy="30"
        r="14"
        fill="none"
        stroke={shadowColor}
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Center emblem */}
      <circle cx="30" cy="30" r="10" fill={shadowColor} opacity="0.3" />
      <text
        x="30"
        y="34"
        textAnchor="middle"
        fontSize="8"
        fill={color === "red" ? "#FFF5E6" : "#FFF8DC"}
        fontWeight="bold"
      >
        M4
      </text>
    </svg>
  );
};

// Quick link cards data
const quickLinks = [
  {
    icon: "🔗",
    title: "Affiliate Program",
    href: "/affiliate",
    bgColor: "bg-gray-100",
  },
  {
    icon: "👑",
    title: "VIP",
    href: "/vip",
    bgColor: "bg-amber-50",
  },
  {
    icon: "🏆",
    title: "Elite Club",
    href: "/elite-club",
    bgColor: "bg-amber-50",
  },
];

export default function LicensesAndSafeguardsPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + officeImages.length) % officeImages.length
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % officeImages.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12"
          >
            M4Capital Licenses and Safeguards
          </motion.h1>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6 mb-12"
          >
            <p className="text-gray-700 leading-relaxed">
              M4Capital is an internationally recognized brand.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This multi-jurisdictional framework enables the brand to operate
              seamlessly across global markets, ensuring high standards of
              client protection and operational transparency.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our services in jurisdictions outside the European Economic Area
              are rendered by{" "}
              <span className="font-semibold">M4CAPITAL LLC.</span> which
              operates lawfully under its registered jurisdiction, Antigua and
              Barbuda (registration no. ILLC 004, registered address: The Colony
              House, 41 Nevis Street, Saint John&apos;s, Antigua and Barbuda)
              following internationally recognized standards in corporate
              governance, compliance, and data security.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">M4CAPITAL LLC.</span> operates in
              strict adherence to local laws and guidance from the Financial
              Services Regulatory Commission (FSRC), LEI number:
              213800QZTCMYTRLA9F56, issued by London Stock Exchange LEI Limited
              (London Stock Exchange).
            </p>
          </motion.div>

          {/* Legal Framework Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <p className="text-gray-700 leading-relaxed mb-6">
              Our business is conducted under the legal and regulatory framework
              of Antigua and Barbuda, including without limitation:
            </p>

            {/* Legal Acts with Wax Seals */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <WaxSeal color="red" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    The Money Services Business Act, 2011
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                <WaxSeal color="gold" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    The Securities Act, 2022
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>

          {/* EEA Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <p className="text-gray-700 leading-relaxed mb-6">
              Within the EEA, services are provided exclusively by{" "}
              <span className="font-semibold">M4CAPITAL EUROPE LTD</span>, which
              is registered in the Republic of Cyprus with company registration
              number HE327751 with a registered address at 82nd street no.4,
              4153 Kato Polemidia, Limassol, Cyprus
            </p>
          </motion.div>

          {/* Office Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-12"
          >
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <div className="flex items-center justify-center gap-4">
                  {/* Previous Image Preview */}
                  <div className="hidden md:block w-20 h-48 overflow-hidden rounded-lg opacity-50">
                    <Image
                      src={
                        officeImages[
                          (currentImageIndex - 1 + officeImages.length) %
                            officeImages.length
                        ]
                      }
                      alt="Office preview"
                      width={80}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main Image */}
                  <div className="relative w-full max-w-md h-64 md:h-80 overflow-hidden rounded-xl">
                    <Image
                      src={officeImages[currentImageIndex]}
                      alt="M4Capital Office"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Next Image Preview */}
                  <div className="hidden md:block w-20 h-48 overflow-hidden rounded-lg opacity-50">
                    <Image
                      src={
                        officeImages[
                          (currentImageIndex + 1) % officeImages.length
                        ]
                      }
                      alt="Office preview"
                      width={80}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {officeImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentImageIndex
                        ? "bg-orange-500"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* CySEC Authorization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 space-y-6"
          >
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">M4CAPITAL EUROPE LTD</span> is
              authorized and operates under the Cyprus Securities and Exchange
              Commission (CySEC) with license number 247/14 and is permitted to
              offer services only to{" "}
              <span className="font-semibold">residents of the EEA</span> in
              accordance with CySEC regulations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              In accordance with applicable financial regulations and best
              practices, all client funds are held in segregated bank accounts,
              fully separated from the company&apos;s own operational funds.
              This structure ensures that trader deposits are protected and
              cannot be used by the company for any internal or business-related
              expenses.
            </p>
          </motion.div>

          {/* Global Presence Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Global Presence
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our reach is international. We maintain active representation in:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Antigua and Barbuda
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                European Union
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Latin America (Brazil)
              </li>
            </ul>

            {/* Map Image */}
            <div className="rounded-xl overflow-hidden">
              <Image
                src="/icons/regulation-map.avif"
                alt="M4Capital Global Presence Map"
                width={800}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Compliance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-12 space-y-6"
          >
            <p className="text-gray-700 leading-relaxed">
              Our commitment to transparency, reliability, and regulatory
              alignment defines every aspect of our operations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We operate in full alignment with the Payment Card Industry Data
              Security Standard (PCI DSS) and have successfully completed the
              transition to the latest version 4.x.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We implement robust cybersecurity measures, including encryption,
              firewalls, and access control protocols to prevent unauthorized
              access or data breaches.
            </p>
          </motion.div>

          {/* Regulatory Alignment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mb-12"
          >
            <p className="text-gray-700 leading-relaxed mb-4">
              We ensure full regulatory alignment through:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Collaboration with leading legal firms for independent legal
                  opinions
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Regular due diligence procedures on operations and partnership
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Periodic compliance reviews and updates based on evolving
                  regulations
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Strict adherence to local laws and guidance from the Financial
                  Services Regulatory Commission (FSRC).
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Client Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to protecting our clients and partners through:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Implementation of modern cybersecurity protocols</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Regular internal and external audits of systems and procedures
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Staff training in regulatory compliance and risk management
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  Continuous improvement of our data protection and operational
                  controls
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Trademarks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trademarks
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We place great importance on the protection of our intellectual
              property as part of our long-term global strategy.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our brand is officially protected by international and national
              trademark registrations, including but not limited to:
            </p>

            <h3 className="font-bold text-gray-900 mb-2">
              Madrid System (WIPO);
            </h3>
            <h3 className="font-bold text-gray-900 mb-4">
              National registrations in key strategic regions:
            </h3>

            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>East Asia and Southeast Asia</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Latin America</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Middle East and North Africa (MENA) region</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Eastern Europe</span>
              </li>
            </ul>

            <p className="text-gray-700 leading-relaxed">
              This extensive trademark portfolio helps protect our brand
              identity and ensures consistent use of our name, logo, and other
              visual assets globally. We actively maintain and expand our
              registrations in response to business development, regulatory
              requirements, and regional marketing activities.
            </p>
          </motion.div>

          {/* Industrial Design Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Industrial Design Protection
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In addition to trademark protection, the visual interface and user
              experience (UI/UX) of our platform is registered as an industrial
              design in multiple jurisdictions.
            </p>
            <p className="text-gray-700 leading-relaxed">
              These protections help us safeguard the unique look and feel of
              our service environment, prevent unauthorized imitations, and
              reinforce our commitment to innovation and brand integrity.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mb-12"
          >
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className={`${link.bgColor} rounded-xl p-6 hover:shadow-md transition-shadow group relative`}
                  >
                    <div className="text-3xl mb-2">{link.icon}</div>
                    <h3 className="font-semibold text-gray-900">
                      {link.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 absolute top-4 right-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Links Section */}
      <section className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {/* Markets & Assets */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                MARKETS & ASSETS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/news-feed"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    News feed
                  </Link>
                </li>
                <li>
                  <Link
                    href="/assets"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Assets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stock-collections"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Stock collections
                  </Link>
                </li>
                <li>
                  <Link
                    href="/industries"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Industries
                  </Link>
                </li>
              </ul>
            </div>

            {/* Analytics & Tools */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                ANALYTICS & TOOLS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/historical-quotes"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Historical quotes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calendars"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Calendars
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trading-specifications"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Trading specifications
                  </Link>
                </li>
              </ul>
            </div>

            {/* Education & Learning */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                EDUCATION & LEARNING
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/video-tutorials"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Video tutorials
                  </Link>
                </li>
                <li>
                  <Link
                    href="/margin-trading-basics"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    The basics of margin trading
                  </Link>
                </li>
              </ul>
            </div>

            {/* Events & Community */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                EVENTS & COMMUNITY
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Our blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                ABOUT US
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/in-numbers"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    In Numbers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    In the Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="/awards"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Awards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sitemap"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Sitemap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/licenses-and-safeguards"
                    className="text-gray-600 hover:text-orange-500 text-sm font-medium text-orange-500"
                  >
                    Licenses and Safeguards
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Services */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                SUPPORT & SERVICES
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/download"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Download app
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Help
                  </Link>
                </li>
                <li>
                  <Link
                    href="/finance"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Deposits & withdrawals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-start gap-6 mt-8 pt-8 border-t border-gray-200">
            <Link
              href="https://facebook.com"
              target="_blank"
              className="text-gray-500 hover:text-orange-500 flex items-center gap-2 text-sm"
            >
              <span>📘</span> Facebook <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              className="text-gray-500 hover:text-orange-500 flex items-center gap-2 text-sm"
            >
              <span>▶️</span> Youtube <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* AI Bot Help */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-gray-500 text-sm">Got questions?</span>
            <span className="font-medium text-gray-900 text-sm">
              AI Bot will help
            </span>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✈️</span>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Warning */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h3 className="font-bold text-gray-900 mb-4">Risk Warning</h3>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              The Financial Products offered by the company include Contracts
              for Difference (&apos;CFDs&apos;) and other complex financial
              products. Trading CFDs carries a high level of risk since leverage
              can work both to your advantage and disadvantage. As a result,
              CFDs may not be suitable for all investors because it is possible
              to lose all of your invested capital. You should never invest
              money that you cannot afford to lose. Before trading in the
              complex financial products offered, please ensure you understand
              the risks involved.
            </p>
            <p>
              You are granted limited non-exclusive non-transferable rights to
              use the IP provided on this website for personal and
              non-commercial purposes in relation to the services offered on the
              Website only.
            </p>
            <p>
              The information on this website is not directed at residents of
              certain jurisdictions, including, without limitation, EU/EEA
              member states, and is not intended for distribution to any person
              in any country or jurisdiction where such distribution or use
              would be contrary to local law or regulation.
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-4 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-orange-500">
                Home
              </Link>
              <span className="text-orange-500">▸</span>
              <span className="text-gray-700">Licenses and Safeguards</span>
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

      <Footer />
    </div>
  );
}
