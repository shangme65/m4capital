"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, X, LogIn, ChevronDown, LayoutDashboard } from "lucide-react";
import ForTradersDropdown from "../client/ForTradersDropdown";
import AboutUsDropdown from "../client/AboutUsDropdown";
import LanguageDropdown from "../client/LanguageDropdown";

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

export function Header({ onLoginClick, onSignupClick }: HeaderProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDropdownLocked, setIsDropdownLocked] = useState(false);
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-0 text-white">
      <nav className="container mx-auto px-4 sm:px-12 md:px-20 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center group">
          <Image
            src="/m4capitallogo1.png"
            alt="M4 Capital Logo"
            width={120}
            height={40}
            className="transition-transform duration-300 group-hover:scale-110 group-hover:animate-bounce object-contain w-28 md:w-auto"
            priority
          />
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
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2 bg-orange-600 px-8 py-2.5 rounded-xl hover:bg-orange-700 hover:scale-105 transition-all duration-300 transform text-sm font-bold"
                aria-label="Go to Dashboard"
              >
                <LayoutDashboard size={18} />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-2 bg-gray-800/70 px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:scale-105 active:bg-blue-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform text-sm font-bold"
                  aria-label="Login"
                >
                  <LogIn size={18} />
                  <span>Log in</span>
                </button>
                <button
                  onClick={onSignupClick}
                  className="bg-orange-600 px-5 py-2.5 text-sm font-bold rounded-xl hover:bg-green-600 hover:scale-105 active:bg-green-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform whitespace-nowrap"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2 sm:space-x-3">
            {session ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-1 bg-orange-600 px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-300"
                aria-label="Go to Dashboard"
              >
                <LayoutDashboard size={16} />
                <span className="text-xs font-bold">Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-1 bg-gray-800/70 px-2 sm:px-3 py-2 sm:py-2 rounded-lg sm:rounded-xl hover:bg-blue-600 hover:scale-105 active:bg-blue-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform text-xs font-bold"
                  aria-label="Login"
                >
                  <LogIn size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Log in</span>
                  <span className="xs:hidden">Login</span>
                </button>
                <button
                  onClick={onSignupClick}
                  className="bg-orange-600 px-2 sm:px-3 py-2 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl hover:bg-green-600 hover:scale-105 active:bg-green-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform whitespace-nowrap"
                >
                  Sign Up
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-gray-800/50 px-2 sm:px-3 py-2 sm:py-2 rounded-lg sm:rounded-xl hover:bg-gray-800/50 hover:scale-105 hover:rotate-180 active:bg-purple-800 active:scale-90 active:text-yellow-300 transition-all duration-300 transform"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? (
                <X size={14} className="sm:w-4 sm:h-4" />
              ) : (
                <Menu size={14} className="sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-30 flex flex-col items-center justify-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-white"
            aria-label="Close menu"
          >
            <X size={30} />
          </button>
          <nav className="flex flex-col items-center space-y-8">
            <ul className="flex flex-col items-center space-y-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-2xl font-semibold hover:text-indigo-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-center space-y-4">
              {session ? (
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 bg-orange-600 px-8 py-3 rounded-2xl hover:bg-orange-700 hover:scale-105 transition-all duration-300 transform w-full"
                  aria-label="Go to Dashboard"
                >
                  <LayoutDashboard size={20} />
                  <span className="font-bold">Go to Dashboard</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLoginClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 bg-gray-800/70 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:scale-105 active:bg-blue-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform w-full"
                    aria-label="Login"
                  >
                    <LogIn size={18} />
                    <span>Log in</span>
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-orange-600 px-6 py-3 text-sm font-bold rounded-2xl hover:bg-green-600 hover:scale-105 active:bg-green-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform w-full whitespace-nowrap"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
