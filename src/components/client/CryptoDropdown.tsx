"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { ChevronDown } from "lucide-react";

interface CryptoOption {
  symbol: string;
  name: string;
  price?: number;
}

interface CryptoDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: CryptoOption[];
  label?: string;
  showPrices?: boolean;
  className?: string;
}

export default function CryptoDropdown({
  value,
  onChange,
  options,
  label,
  showPrices = false,
  className = "",
}: CryptoDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.symbol === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Selected Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-gray-800 hover:bg-gray-750 rounded-lg px-4 py-3 text-white transition-colors border border-gray-700 hover:border-gray-600"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CryptoIcon symbol={selectedOption?.symbol || ""} size="sm" />
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-white font-medium truncate">
              {selectedOption?.name || "Select"}
            </span>
            {showPrices && selectedOption?.price && (
              <span className="text-gray-400 text-xs">
                ${selectedOption.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[300px] overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.symbol}
                type="button"
                onClick={() => handleSelect(option.symbol)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0 ${
                  option.symbol === value ? "bg-teal-50" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    option.symbol === value
                      ? "bg-teal-500 ring-2 ring-teal-500 ring-offset-2"
                      : "bg-gray-100"
                  }`}
                >
                  <CryptoIcon
                    symbol={option.symbol}
                    size="sm"
                    className={option.symbol === value ? "text-white" : ""}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium truncate ${
                        option.symbol === value
                          ? "text-teal-700"
                          : "text-gray-900"
                      }`}
                    >
                      {option.name}
                    </span>
                    {option.symbol === value && (
                      <svg
                        className="w-5 h-5 text-teal-500 flex-shrink-0 ml-2"
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
                  </div>
                  {showPrices && option.price && (
                    <span className="text-gray-500 text-sm">
                      ${option.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
