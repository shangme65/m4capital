"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Award,
  Globe,
  Lock,
  Users,
  CheckCircle2,
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
    icon: "",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-32 pb-20 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('/icons/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-2xl shadow-orange-500/50"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Licenses & Safeguards
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Operating under strict regulatory compliance across multiple jurisdictions
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="-mt-10 relative z-20">
        <div className="container mx-auto px-4 pb-12 max-w-5xl">

          {/* Introduction Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12"
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">International Recognition</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <span className="font-bold text-gray-900">M4Capital</span> is an internationally recognized brand operating under a multi-jurisdictional framework.
              </p>
              <p>
                This structure enables seamless operations across global markets while ensuring the highest standards of client protection and operational transparency.
              </p>
              <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-2xl p-6 border border-orange-100">
                <p className="font-semibold text-gray-900 mb-3">Outside the European Economic Area:</p>
                <p>
                  Services are rendered by <span className="font-bold text-orange-600">M4CAPITAL LLC</span>, operating lawfully under its registered jurisdiction in Antigua and Barbuda.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-semibold">Registration:</span> ILLC 004</p>
                  <p><span className="font-semibold">Address:</span> The Colony House, 41 Nevis Street, Saint John's, Antigua and Barbuda</p>
                  <p><span className="font-semibold">LEI:</span> 213800QZTCMYTRLA9F56 (London Stock Exchange LEI Limited)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <p>
                  Operating in strict adherence to local laws and guidance from the Financial Services Regulatory Commission (FSRC).
                </p>
              </div>
            </div>
          </motion.div>

          {/* Legal Framework Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12"
          >
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Legal Framework</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-8">
              Our business is conducted under the comprehensive legal and regulatory framework of Antigua and Barbuda:
            </p>

            {/* Legal Acts with Enhanced Wax Seals */}
            <div className="space-y-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-100 hover:border-red-300 transition-all cursor-pointer"
              >
                <WaxSeal color="red" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    The Money Services Business Act, 2011
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Comprehensive financial services regulation</p>
                </div>
                <Shield className="w-6 h-6 text-red-400" />
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100 hover:border-amber-300 transition-all cursor-pointer"
              >
                <WaxSeal color="gold" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    The Securities Act, 2022
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Modern securities market regulation</p>
                </div>
                <Award className="w-6 h-6 text-amber-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* EEA Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border border-blue-100"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">European Economic Area Services</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                Within the EEA, services are provided exclusively by <span className="font-bold text-blue-600">M4CAPITAL EUROPE LTD</span>
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Registered in Republic of Cyprus</p>
                    <p className="text-gray-600">Company No: HE327751</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Registered Address</p>
                    <p className="text-gray-600">82nd street no.4, 4153 Kato Polemidia, Limassol, Cyprus</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Office Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Global Offices</h3>
              <div className="relative">
                <div className="overflow-hidden rounded-2xl">
                  <div className="flex items-center justify-center gap-4">
                    {/* Previous Image Preview */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="hidden md:block w-24 h-56 overflow-hidden rounded-xl opacity-50 hover:opacity-70 transition-all cursor-pointer shadow-lg"
                      onClick={handlePrevImage}
                    >
                      <Image
                        src={
                          officeImages[
                            (currentImageIndex - 1 + officeImages.length) %
                              officeImages.length
                          ]
                        }
                        alt="Office preview"
                        width={96}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Main Image */}
                    <div className="relative w-full max-w-2xl h-72 md:h-96 overflow-hidden rounded-2xl shadow-2xl">
                      <Image
                        src={officeImages[currentImageIndex]}
                        alt="M4Capital Office"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-sm font-semibold">M4Capital Office {currentImageIndex + 1}</p>
                      </div>
                    </div>

                    {/* Next Image Preview */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="hidden md:block w-24 h-56 overflow-hidden rounded-xl opacity-50 hover:opacity-70 transition-all cursor-pointer shadow-lg"
                      onClick={handleNextImage}
                    >
                      <Image
                        src={
                          officeImages[
                            (currentImageIndex + 1) % officeImages.length
                          ]
                        }
                        alt="Office preview"
                        width={96}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {officeImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`transition-all ${
                        idx === currentImageIndex
                          ? "w-8 h-3 bg-gradient-to-r from-orange-500 to-orange-600"
                          : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                      } rounded-full`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CySEC Authorization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">CySEC Authorization</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-bold text-green-600">M4CAPITAL EUROPE LTD</span> is authorized and operates under the Cyprus Securities and Exchange Commission (CySEC) with <span className="font-semibold">license number 247/14</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-green-700">EEA Residents Only:</span> Services are exclusively offered to residents of the European Economic Area in accordance with CySEC regulations
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Segregated Client Funds
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    All client funds are held in segregated bank accounts, fully separated from the company's operational funds. This ensures that trader deposits are protected and cannot be used for internal or business expenses.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Global Presence Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Global Presence</h2>
                    <div className="h-1 w-20 bg-white/50 rounded-full mt-1"></div>
                  </div>
                </div>
                <p className="text-white/90 max-w-3xl leading-relaxed">
                  Our reach is international. We maintain active representation across key financial jurisdictions worldwide
                </p>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { location: "Antigua and Barbuda", icon: "🏝️", color: "orange" },
                    { location: "European Union", icon: "🇪🇺", color: "blue" },
                    { location: "Latin America (Brazil)", icon: "🇧🇷", color: "green" }
                  ].map((region, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 + idx * 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{region.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-900">{region.location}</h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                  <Image
                    src="/icons/regulation-map.avif"
                    alt="M4Capital Global Presence Map"
                    width={800}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Compliance Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security & Compliance</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Our Commitment</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our commitment to transparency, reliability, and regulatory alignment defines every aspect of our operations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">PCI DSS Compliance</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We operate in full alignment with the Payment Card Industry Data Security Standard (PCI DSS) and have successfully completed the transition to the latest version 4.x.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Cybersecurity Measures</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We implement robust cybersecurity measures, including encryption, firewalls, and access control protocols to prevent unauthorized access or data breaches.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Regulatory Alignment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Regulatory Alignment</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mt-1"></div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                We ensure full regulatory alignment through:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { text: "Collaboration with leading legal firms for independent legal opinions", icon: "⚖️" },
                  { text: "Regular due diligence procedures on operations and partnership", icon: "🔍" },
                  { text: "Periodic compliance reviews and updates based on evolving regulations", icon: "📋" },
                  { text: "Strict adherence to local laws and guidance from the Financial Services Regulatory Commission (FSRC)", icon: "🏛️" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
                    className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-2xl">{item.icon}</div>
                      <p className="text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Client Protection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-cyan-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Client Protection</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mt-1"></div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                We are committed to protecting our clients and partners through:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { text: "Implementation of modern cybersecurity protocols", icon: "🔒" },
                  { text: "Regular internal and external audits of systems and procedures", icon: "🔍" },
                  { text: "Staff training in regulatory compliance and risk management", icon: "👥" },
                  { text: "Continuous improvement of our data protection and operational controls", icon: "🛡️" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 + idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-2xl">{item.icon}</div>
                      <p className="text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trademarks Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Trademarks</h2>
                    <div className="h-1 w-20 bg-white/50 rounded-full mt-1"></div>
                  </div>
                </div>
                <p className="text-white/90 max-w-3xl leading-relaxed">
                  We place great importance on the protection of our intellectual property as part of our long-term global strategy
                </p>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-6 border border-orange-100">
                  <p className="text-gray-700 leading-relaxed">
                    Our brand is officially protected by international and national trademark registrations, including but not limited to:
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Madrid System (WIPO)</h3>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    National registrations in key strategic regions:
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { region: "East Asia and Southeast Asia", icon: "🌏" },
                      { region: "Latin America", icon: "🌎" },
                      { region: "Middle East and North Africa (MENA) region", icon: "🌍" },
                      { region: "Eastern Europe", icon: "🗺️" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 shadow-md border border-orange-100 flex items-center gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <span className="text-gray-700 font-medium">{item.region}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-orange-100">
                  <p className="text-gray-700 leading-relaxed">
                    This extensive trademark portfolio helps protect our brand identity and ensures consistent use of our name, logo, and other visual assets globally. We actively maintain and expand our registrations in response to business development, regulatory requirements, and regional marketing activities.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Industrial Design Protection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-indigo-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Industrial Design Protection</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-gray-700 leading-relaxed">
                        In addition to trademark protection, the visual interface and user experience (UI/UX) of our platform is registered as an industrial design in multiple jurisdictions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-700 leading-relaxed">
                        These protections help us safeguard the unique look and feel of our service environment, prevent unauthorized imitations, and reinforce our commitment to innovation and brand integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mb-12"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Quick Links</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {quickLinks.map((link, idx) => (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.3 + idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`${link.bgColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group relative block h-full hover:scale-105`}
                    >
                      <div className="text-4xl mb-3">{link.icon}</div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {link.title}
                      </h3>
                      <ExternalLink className="w-5 h-5 absolute top-4 right-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  </motion.div>
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
                    href="/site-map"
                    className="text-gray-600 hover:text-orange-500 text-sm"
                  >
                    Sitemap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/licenses-and-safeguards"
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
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
    </div>
  );
}
