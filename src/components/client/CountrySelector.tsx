"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { countriesSorted } from "@/lib/countries";
import { useTheme } from "@/contexts/ThemeContext";

interface Country {
  name: string;
  flag: string;
  code: string;
}

// Convert country code to flag emoji
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Transform the countries from countries.ts to include flag emojis
const COUNTRIES: Country[] = countriesSorted.map((country) => ({
  name: country.name,
  code: country.code,
  flag: getFlagEmoji(country.code),
}));

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function CountrySelector({
  value,
  onChange,
  error,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.name === value);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelect = (country: Country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-400 text-left flex items-center justify-between transition-colors ${
          isDark
            ? "bg-[#2a2a2a] border-gray-600 text-white"
            : "bg-gray-50 border-gray-300 text-gray-900"
        } ${error ? "border-red-500" : ""}`}
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <span className="text-xl">{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
          </span>
        ) : (
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>
            Select country
          </span>
        )}
        <svg
          className={`w-5 h-5 text-orange-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 w-full mt-2 border rounded-lg shadow-2xl overflow-hidden ${
              isDark
                ? "bg-[#1f1f1f] border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            {/* Search Input */}
            <div className={`p-3 border-b sticky top-0 ${
              isDark
                ? "bg-[#1f1f1f] border-gray-700"
                : "bg-white border-gray-300"
            }`}>
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400 ${
                  isDark
                    ? "bg-[#2a2a2a] border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
                autoFocus
              />
            </div>

            {/* Country List */}
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                      value === country.name
                        ? "bg-orange-500/10 text-orange-400"
                        : isDark
                        ? "text-white hover:bg-[#2a2a2a]"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                    {value === country.name && (
                      <svg
                        className="w-5 h-5 ml-auto text-orange-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className={`px-4 py-8 text-center text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  No countries found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
