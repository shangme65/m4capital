"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  LogIn,
  ChevronDown,
  LayoutDashboard,
  Check,
  Globe,
} from "lucide-react";
import ForTradersDropdown from "../client/ForTradersDropdown";
import AboutUsDropdown from "../client/AboutUsDropdown";
import LanguageDropdown from "../client/LanguageDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDropdownLocked, setIsDropdownLocked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const navLinks = [
    { href: "#features", text: "Features" },
    { href: "/about", text: "About" },
    { href: "/contact", text: "Contact" },
  ];

  const toggleDropdown = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
      setIsDropdownLocked(false);
    } else {
      setActiveDropdown(dropdown);
      setIsDropdownLocked(true);
    }
  };

  const handleMouseEnter = (dropdown: string) => {
    if (!isDropdownLocked) {
      setActiveDropdown(dropdown);
    }
  };

  const handleMouseLeave = () => {
    if (!isDropdownLocked) {
      setActiveDropdown(null);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
        setIsDropdownLocked(false);
      }
    };

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  // Scroll detection for header background
  useEffect(() => {
    const handleScroll = () => {
      // Only return to transparent when scrolled back to the very top
      if (window.scrollY === 0) {
        setIsScrolled(false);
      } else {
        // Turn black on any scroll down
        setIsScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-black text-gray-900 dark:text-white shadow-md dark:shadow-none"
          : "bg-transparent text-white"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-8 md:px-16 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <div
            className="rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{
              background:
                "linear-gradient(145deg, #1f2937 0%, #111827 50%, #1f2937 100%)",
              boxShadow:
                "0 8px 20px -5px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.05), inset 0 -2px 0 rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              padding: "4px 6px",
            }}
          >
            <Image
              src="/m4capitallogo1.png"
              alt="M4 Capital Logo"
              width={100}
              height={34}
              className="object-contain w-20 md:w-auto"
              priority
            />
          </div>
        </Link>

        {/* Widescreen Menu */}
        <div
          className="hidden md:flex items-center space-x-6"
          ref={dropdownRef}
        >
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("download")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("download")}
              className={`flex items-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:scale-105 text-sm font-bold ${
                activeDropdown === "download"
                  ? "text-orange-500 bg-gray-700"
                  : ""
              } hover:text-orange-500`}
            >
              Download App
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-300 ${
                  activeDropdown === "download" ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Add dropdown component if needed */}
          </div>
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("traders")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("traders")}
              className={`flex items-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:scale-105 text-sm font-bold ${
                activeDropdown === "traders"
                  ? "text-orange-500 bg-gray-700"
                  : ""
              } hover:text-orange-500`}
            >
              For Traders
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-300 ${
                  activeDropdown === "traders" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeDropdown === "traders" && <ForTradersDropdown />}
          </div>
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("about")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => toggleDropdown("about")}
              className={`flex items-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:scale-105 text-sm font-bold ${
                activeDropdown === "about" ? "text-orange-500 bg-gray-700" : ""
              } hover:text-orange-500`}
            >
              About Us
              <ChevronDown
                size={14}
                className={`ml-1 transition-transform duration-300 ${
                  activeDropdown === "about" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeDropdown === "about" && <AboutUsDropdown />}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Widescreen right side */}
          <div className="hidden md:flex items-center space-x-4">
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("lang")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => toggleDropdown("lang")}
                className={`flex items-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:scale-105 text-sm font-bold ${
                  activeDropdown === "lang" ? "text-orange-500 bg-gray-700" : ""
                } hover:text-orange-500`}
              >
                EN
                <ChevronDown
                  size={14}
                  className={`ml-1 transition-transform duration-300 ${
                    activeDropdown === "lang" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === "lang" && <LanguageDropdown />}
            </div>
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 hover:scale-105 transition-all duration-300 transform text-sm font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #f97316 0%, #c2410c 50%, #f97316 100%)",
                  boxShadow:
                    "0 10px 25px -5px rgba(249, 115, 22, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -3px 0 rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "10px 20px",
                  borderRadius: "12px",
                }}
                aria-label="Go to Dashboard"
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Button
                  onClick={onLoginClick}
                  variant="outline"
                  size="sm"
                  aria-label="Login"
                >
                  <LogIn size={16} />
                  <span>Log in</span>
                </Button>
                <Button onClick={onSignupClick} variant="primary" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2 sm:space-x-3">
            {session ? (
              <Link
                href="/dashboard"
                className="flex items-center space-x-1 hover:scale-105 transition-all duration-300 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #f97316 0%, #c2410c 50%, #f97316 100%)",
                  boxShadow:
                    "0 6px 16px -4px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "6px 12px",
                  borderRadius: "10px",
                }}
                aria-label="Go to Dashboard"
              >
                <LayoutDashboard size={16} />
                <span className="text-xs font-bold">Dashboard</span>
              </Link>
            ) : (
              <>
                <Button
                  onClick={onLoginClick}
                  variant="primary"
                  size="sm"
                  aria-label="Login"
                  className="!bg-gradient-to-b !from-gray-500 !via-gray-500 !via-40% !to-gray-700 !shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_#374151,0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)] hover:!shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(107,114,128,0.8),0_10px_8px_-2px_rgba(107,114,128,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(107,114,128,0.5)]"
                >
                  <LogIn size={12} />
                  <span className="hidden xs:inline">Log in</span>
                  <span className="xs:hidden">Login</span>
                </Button>
                <Button
                  onClick={onSignupClick}
                  variant="primary"
                  size="sm"
                  className="!bg-gradient-to-r !from-orange-400 !via-orange-600 !to-orange-500 !shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(194,65,12,0.8),0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)] hover:!shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(249,115,22,0.8),0_10px_8px_-2px_rgba(249,115,22,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(249,115,22,0.5)]"
                >
                  <span>Sign Up</span>
                </Button>
              </>
            )}
            <Button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              variant="primary"
              size="sm"
              className="!h-[24px] !px-3 !bg-gradient-to-b !from-gray-500 !via-gray-500 !via-40% !to-gray-700 !shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_#374151,0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)] hover:!shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(107,114,128,0.8),0_10px_8px_-2px_rgba(107,114,128,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(107,114,128,0.5)]"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X size={12} /> : <Menu size={12} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Full-screen Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-30 flex flex-col md:hidden overflow-y-auto">
          {/* Header with logo and close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                className="rounded-lg"
                style={{
                  background:
                    "linear-gradient(145deg, #1f2937 0%, #111827 50%, #1f2937 100%)",
                  padding: "4px 6px",
                }}
              >
                <Image
                  src="/m4capitallogo1.png"
                  alt="M4 Capital Logo"
                  width={80}
                  height={27}
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-bold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #fb923c 0%, #c2410c 50%, #f97316 100%)",
                      padding: "8px 14px",
                      borderRadius: "10px",
                    }}
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={onLoginClick}
                    variant="primary"
                    size="sm"
                    className="!bg-gradient-to-b !from-gray-500 !via-gray-500 !via-40% !to-gray-700 !shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_#374151,0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)] hover:!shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(107,114,128,0.8),0_10px_8px_-2px_rgba(107,114,128,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(107,114,128,0.5)]"
                  >
                    <LogIn size={12} />
                  </Button>
                  <Button
                    onClick={onSignupClick}
                    variant="primary"
                    size="sm"
                    className="!bg-gradient-to-r !from-orange-400 !via-orange-600 !to-orange-500 !shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(194,65,12,0.8),0_10px_8px_-2px_rgba(0,0,0,0.4),0_15px_25px_-5px_rgba(0,0,0,0.3)] hover:!shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(249,115,22,0.8),0_10px_8px_-2px_rgba(249,115,22,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(249,115,22,0.5)]"
                  >
                    <span>Sign Up</span>
                  </Button>
                </>
              )}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
                style={{
                  background:
                    "linear-gradient(145deg, #4b5563 0%, #1f2937 50%, #374151 100%)",
                  borderRadius: "10px",
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex-1 px-4 py-6 space-y-8">
            {/* Choose Language */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                {t("common.chooseLanguage").toUpperCase()}
              </h3>
              <div className="relative">
                <button
                  onClick={() =>
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                  }
                  className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <span>{currentLanguage.flag}</span>
                    <span>{currentLanguage.name}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-orange-500 transition-transform duration-200 ${
                      isLanguageDropdownOpen ? "rotate-180" : "-rotate-90"
                    }`}
                  />
                </button>
                {isLanguageDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg z-50 max-h-64 overflow-y-auto border border-gray-200 dark:border-transparent">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          language === lang.code
                            ? "bg-gray-100 dark:bg-gray-700"
                            : ""
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-gray-900 dark:text-white">
                            {lang.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            ({lang.nativeName})
                          </span>
                        </span>
                        {language === lang.code && (
                          <Check size={16} className="text-orange-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Download App */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                {t("common.downloadApp").toUpperCase()}
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">
                      Get it on Google Play
                    </p>
                    <p className="text-gray-500 text-xs">
                      74 MB · Android 7.0 or later
                    </p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6,18c0,0.55 0.45,1 1,1h1v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5-0.67 1.5-1.5V19h2v3.5c0,0.83 0.67,1.5 1.5,1.5s1.5-0.67 1.5-1.5V19h1c0.55,0 1-0.45 1-1V8H6v10zM3.5,8C2.67,8 2,8.67 2,9.5v7c0,0.83 0.67,1.5 1.5,1.5S5,17.33 5,16.5v-7C5,8.67 4.33,8 3.5,8zM20.5,8c-0.83,0-1.5,0.67-1.5,1.5v7c0,0.83 0.67,1.5 1.5,1.5s1.5-0.67 1.5-1.5v-7C22,8.67 21.33,8 20.5,8zM15.53,2.16l1.3-1.3c0.2-0.2 0.2-0.51 0-0.71s-0.51-0.2-0.71,0l-1.48,1.48C13.85,1.23 12.95,1 12,1c-0.96,0-1.86,0.23-2.66,0.63L7.85,0.15c-0.2-0.2-0.51-0.2-0.71,0s-0.2,0.51 0,0.71l1.31,1.31C6.97,3.26 6,5.01 6,7h12C18,5.01 17.03,3.25 15.53,2.16zM10,5H9V4h1V5zM15,5h-1V4h1V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">
                      Android APK
                    </p>
                    <p className="text-gray-500 text-xs">
                      74 MB · Android 5.1 or later
                    </p>
                  </div>
                </a>
              </div>
              <button className="mt-3 text-orange-500 font-semibold text-sm flex items-center gap-1">
                All available apps
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>

            {/* Markets & Assets */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                {t("common.marketsAssets").toUpperCase()}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Link
                  href="/crypto"
                  className="text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.crypto")}
                </Link>
                <Link
                  href="/etfs"
                  className="text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.etfs")}
                </Link>
                <Link
                  href="/commodities"
                  className="text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.commodities")}
                </Link>
                <Link
                  href="/forex"
                  className="text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.forex")}
                </Link>
                <Link
                  href="/indices"
                  className="text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.indices")}
                </Link>
                <Link
                  href="/stocks"
                  className="text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.stocks")}
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Analytics Column */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                    {t("nav.analytics").toUpperCase()}
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/historical-quotes"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.historicalQuotes")}
                    </Link>
                    <Link
                      href="/calendars"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.calendars")}
                    </Link>
                    <Link
                      href="/trading-specifications"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.tradingSpecs")}
                    </Link>
                  </div>
                </div>
                {/* Education Column */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                    {t("nav.education").toUpperCase()}
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/video-tutorials"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.videoTutorials")}
                    </Link>
                    <Link
                      href="/margin-trading-basics"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.marginTrading")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Community Column */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                    {t("nav.community").toUpperCase()}
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/tournaments"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.tournaments")}
                    </Link>
                    <Link
                      href="/blog"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.blog")}
                    </Link>
                  </div>
                </div>
                {/* Services Column */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                    {t("nav.services").toUpperCase()}
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href="/help"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("nav.help")}
                    </Link>
                    <Link
                      href="/deposits-withdrawals"
                      className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("menu.depositsWithdrawals")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
                {t("nav.about").toUpperCase()}
              </h3>
              <div className="space-y-3">
                <Link
                  href="/in-numbers"
                  className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("menu.inNumbers")}
                </Link>
                <Link
                  href="/press"
                  className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("menu.press")}
                </Link>
                <Link
                  href="/contact"
                  className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("nav.contact")}
                </Link>
                <Link
                  href="/awards"
                  className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("menu.awards")}
                </Link>
                <Link
                  href="/licenses-and-safeguards"
                  className="block text-gray-900 dark:text-white font-semibold hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("menu.licenses")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
