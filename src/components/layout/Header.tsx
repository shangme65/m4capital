"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, LogIn, ChevronDown } from "lucide-react";
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

  const navLinks = [
    { href: "#features", text: "Features" },
    { href: "/about", text: "About" },
    { href: "/contact", text: "Contact" },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-0 text-white">
      <nav className="container mx-auto px-8 sm:px-12 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/m4capitallogo2.png"
            alt="m4capital Logo"
            width={40}
            height={40}
          />
          <span className="ml-0 text-xl font-bold">capital</span>
        </Link>

        {/* Widescreen Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("download")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center hover:text-orange-500">
              Download App <ChevronDown size={16} className="ml-1" />
            </button>
            {/* Add dropdown component if needed */}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("traders")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={`flex items-center ${
                activeDropdown === "traders" ? "text-orange-500" : ""
              } hover:text-orange-500`}
            >
              For Traders <ChevronDown size={16} className="ml-1" />
            </button>
            {activeDropdown === "traders" && <ForTradersDropdown />}
          </div>
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("about")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={`flex items-center ${
                activeDropdown === "about" ? "text-orange-500" : ""
              } hover:text-orange-500`}
            >
              About Us <ChevronDown size={16} className="ml-1" />
            </button>
            {activeDropdown === "about" && <AboutUsDropdown />}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Widescreen right side */}
          <div className="hidden md:flex items-center space-x-4">
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("lang")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center hover:text-orange-500">
                EN <ChevronDown size={16} className="ml-1" />
              </button>
              {activeDropdown === "lang" && <LanguageDropdown />}
            </div>
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-1.5 bg-gray-800/70 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:scale-105 active:bg-blue-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform text-xs"
              aria-label="Login"
            >
              <LogIn size={16} />
              <span>Log in</span>
            </button>
            <button
              onClick={onSignupClick}
              className="bg-orange-600 px-3 py-1.5 text-xs font-bold rounded-xl hover:bg-green-600 hover:scale-105 active:bg-green-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform whitespace-nowrap"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-1.5 bg-gray-800/70 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:scale-105 active:bg-blue-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform text-xs"
              aria-label="Login"
            >
              <LogIn size={16} />
              <span>Log in</span>
            </button>
            <button
              onClick={onSignupClick}
              className="bg-orange-600 px-3 py-1.5 text-xs font-bold rounded-xl hover:bg-green-600 hover:scale-105 active:bg-green-800 active:scale-95 active:text-yellow-300 transition-all duration-300 transform whitespace-nowrap"
            >
              Sign Up
            </button>
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-gray-800/50 px-3 py-1.5 rounded-xl hover:bg-gray-800/50 hover:scale-105 hover:rotate-180 active:bg-purple-800 active:scale-90 active:text-yellow-300 transition-all duration-300 transform"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
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
              <button
                onClick={() => {
                  onLoginClick?.();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 bg-gray-800/70 px-6 py-3 rounded-2xl hover:bg-gray-700 transition-colors w-full text-center"
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
                className="bg-orange-600 px-6 py-3 text-sm font-bold rounded-2xl hover:bg-orange-700 transition-colors w-full text-center whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
