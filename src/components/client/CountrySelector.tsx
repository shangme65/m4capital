"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { countriesSorted } from "@/lib/countries";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className={`w-full px-4 py-3 bg-[#2a2a2a] border ${
          error ? "border-red-500" : "border-gray-600"
        } rounded-lg text-white focus:outline-none focus:border-orange-400 text-left flex items-center justify-between transition-colors`}
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2">
            <span className="text-xl">{selectedCountry.flag}</span>
            <span>{selectedCountry.name}</span>
          </span>
        ) : (
          <span className="text-gray-400">Select country</span>
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
            className="absolute z-50 w-full mt-2 bg-[#1f1f1f] border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-700 sticky top-0 bg-[#1f1f1f]">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-400"
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
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#2a2a2a] transition-colors ${
                      value === country.name
                        ? "bg-orange-500/10 text-orange-400"
                        : "text-white"
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
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
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
