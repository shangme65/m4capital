"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronUp, Smartphone, Monitor } from "lucide-react";

// Device illustration components
const MobileDevicesIllustration = () => (
  <div className="relative w-full max-w-md mx-auto h-80">
    {/* Tablet */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-gray-300 rounded-lg bg-white shadow-lg">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-300 rounded-full" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 border-2 border-gray-300 rounded-full" />
    </div>

    {/* Phone - right */}
    <div className="absolute right-8 bottom-8 w-24 h-44 border-2 border-gray-300 rounded-xl bg-white shadow-lg">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-200 rounded-full" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 border border-gray-300 rounded-sm" />
    </div>
  </div>
);

const DesktopDevicesIllustration = () => (
  <div className="relative w-full max-w-lg mx-auto h-64">
    {/* Desktop monitor */}
    <div className="absolute right-0 top-0 w-56 h-40 border-2 border-orange-400 rounded-lg bg-white">
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4 h-8 bg-orange-400" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-2 bg-orange-400 rounded" />
    </div>

    {/* Laptop */}
    <div className="absolute left-0 bottom-0 w-48 h-32 border-2 border-orange-400 rounded-t-lg bg-white">
      <div className="absolute -bottom-2 -left-2 -right-2 h-3 bg-orange-400 rounded-b-lg" />
    </div>
  </div>
);

export default function DownloadPage() {
  const handleAndroidDownload = () => {
    // Trigger APK download
    const link = document.createElement("a");
    link.href = "/M4CapitalMobile.apk";
    link.download = "M4CapitalMobile.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        {/* Mobile Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                Download Our #1
              </h1>
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">
                Trading App
              </h2>
              <p className="text-gray-400">(*App Store)</p>
            </motion.div>

            {/* Mobile Devices Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <MobileDevicesIllustration />
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              {/* Android APK Download */}
              <button
                onClick={handleAndroidDownload}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10">
                    {/* Android robot head */}
                    <path
                      d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"
                      fill="#3DDC84"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 group-hover:text-orange-500">
                    DOWNLOAD
                  </div>
                  <div className="text-sm text-gray-500">
                    for Android .apk 4.3 mb
                  </div>
                </div>
              </button>

              {/* App Store */}
              <Link
                href="https://apps.apple.com"
                target="_blank"
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-800">
                    <path
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500">GET IT ON</div>
                  <div className="text-xl font-semibold text-gray-800 group-hover:text-orange-500">
                    App Store
                  </div>
                </div>
              </Link>

              {/* Google Play */}
              <Link
                href="https://play.google.com"
                target="_blank"
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10">
                    <path
                      d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                      fill="url(#playGradient)"
                    />
                    <defs>
                      <linearGradient
                        id="playGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="25%" stopColor="#34A853" />
                        <stop offset="50%" stopColor="#FBBC05" />
                        <stop offset="100%" stopColor="#EA4335" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500">GET IT ON</div>
                  <div className="text-xl font-semibold text-gray-800 group-hover:text-orange-500">
                    Google Play
                  </div>
                </div>
              </Link>

              {/* System Requirements - Mobile */}
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-medium">System requirements</span>
                </div>
                <div className="text-center space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Operating system:
                    </h4>
                    <p className="text-gray-600">iOS 12.1 or later,</p>
                    <p className="text-gray-600">Android 5.1 or later</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Application size:
                    </h4>
                    <p className="text-gray-600">74 Mb</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Desktop Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <p className="text-gray-400 mb-4">Application size:</p>
              <p className="text-2xl font-semibold text-gray-800">74 Mb</p>
            </motion.div>

            {/* Desktop Devices Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <DesktopDevicesIllustration />
            </motion.div>

            {/* Desktop Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {/* macOS Download */}
              <Link
                href="#"
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-800">
                    <path
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 group-hover:text-orange-500">
                    DOWNLOAD
                  </div>
                  <div className="text-sm text-gray-500">for macOS .dmg</div>
                </div>
              </Link>

              {/* Windows Download */}
              <Link
                href="#"
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10">
                    <path
                      d="M3,12V6.75L9,5.43V11.91L3,12M20,3V11.75L10,11.9V5.21L20,3M3,13L9,13.09V19.9L3,18.75V13M20,13.25V22L10,20.09V13.1L20,13.25Z"
                      fill="#00A4EF"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-800 group-hover:text-orange-500">
                    DOWNLOAD
                  </div>
                  <div className="text-sm text-gray-500">for Windows .msi</div>
                </div>
              </Link>

              {/* System Requirements - Desktop */}
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 text-orange-600 mb-4">
                  <Monitor className="w-5 h-5" />
                  <span className="font-medium">System requirements</span>
                </div>
                <div className="text-center space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Operating system:
                    </h4>
                    <p className="text-gray-600">Windows 7, 8, 8.1, 10</p>
                    <p className="text-gray-600">macOS 10.14 Mojave</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">RAM:</h4>
                    <p className="text-gray-600">2 GB (4 GB recommended)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Video card:</h4>
                    <p className="text-gray-600">OpenGL 2.0-friendly (macOS)</p>
                    <p className="text-gray-600">DirectX 9 (Windows)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problems & Solutions Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-light text-gray-800 text-center mb-12"
            >
              Problems & Solutions
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  My antivirus blocks the installed file
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Update the antivirus installed on your computer. Add the
                  M4Capital installer to the exclusions list of your antivirus.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Video driver generates an error (Windows)
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If a window appears during the installation process or when
                  you start the application asking you to update your video card
                  drivers, it means that your current drivers do not support the
                  OpenGL configuration used in the application. To resolve this
                  issue, you need to visit your video card manufacturer&apos;s
                  website (follow the links in the message) and download and
                  install the drivers for your video card. If you do this and
                  the problem persists, it may indicate that your video card
                  does not support the required OpenGL configuration.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Payment Partners */}
        <section className="py-8 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="text-2xl font-bold text-purple-400">Skrill</div>
              <div className="text-2xl font-bold text-gray-400">volet</div>
              <div className="text-2xl font-bold text-green-400">NETELLER</div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === 0 ? "bg-orange-500" : "bg-gray-300"
                  }`}
                />
              ))}
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
                <span className="text-gray-700">Download App</span>
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

        {/* Footer Links */}
        <section className="py-6 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
              <Link
                href="/terms"
                className="text-gray-500 hover:text-orange-500"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/affiliate"
                className="text-gray-500 hover:text-orange-500"
              >
                Affiliate Program
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-gray-500 hover:text-orange-500"
              >
                Contact Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/blog"
                className="text-gray-500 hover:text-orange-500"
              >
                Our Blog
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/vip"
                className="text-gray-500 hover:text-orange-500 flex items-center gap-1"
              >
                <span className="text-yellow-500">👑</span> VIP
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/sitemap"
                className="text-gray-500 hover:text-orange-500"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </section>

        {/* Risk Warning */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-gray-400 rounded"></span>
                RISK WARNING:
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                The Financial Products offered by the company include Contracts
                for Difference (&apos;CFDs&apos;) and other complex financial
                products. Trading CFDs carries a high level of risk, since
                leverage can work both to your advantage and disadvantage. As a
                result, CFDs may not be suitable for all investors because it is
                possible to lose all of your invested capital. You should never
                invest money that you cannot afford to lose. Before trading in
                the complex financial products offered, please ensure you
                understand the risks involved.
              </p>
            </div>
            <p className="text-gray-500 text-sm mt-6 text-center">
              You are granted limited non-exclusive non-transferable rights to
              use the IP provided on this website for personal and
              non-commercial purposes in relation to the services offered on the
              Website only.
            </p>
          </div>
        </section>

        {/* Download App Footer Banner */}
        <section className="py-6 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 max-w-md">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">M4Capital</h4>
                  <p className="text-sm text-gray-500">Full version, 59 MB</p>
                </div>
              </div>

              <Link
                href="https://apps.apple.com"
                target="_blank"
                className="block w-full bg-black text-white rounded-lg py-3 px-4 mb-3 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </div>
              </Link>

              <Link
                href="https://play.google.com"
                target="_blank"
                className="block w-full bg-black text-white rounded-lg py-3 px-4 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">GET IT ON</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
