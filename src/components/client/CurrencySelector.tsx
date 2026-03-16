"use client";
import { useState } from "react";
import { CURRENCIES } from "@/lib/currencies";
import { COUNTRY_CURRENCY_MAP } from "@/lib/country-currencies";
import { Search, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

// Currency icon component using SVG logos from /public/currencies/
const CurrencyLogo = ({ code, size = 28 }: { code: string; size?: number }) => (
  <Image
    src={`/currencies/${code.toLowerCase()}.svg`}
    alt={`${code} currency`}
    width={size}
    height={size}
    className="rounded-sm object-contain flex-shrink-0"
    onError={(e) => {
      // Fallback to a colored circle with the first letter
      const target = e.currentTarget;
      target.style.display = "none";
      const fallback = document.createElement("div");
      fallback.className = "inline-flex items-center justify-center rounded-full bg-gray-500 text-white font-bold";
      fallback.style.width = `${size}px`;
      fallback.style.height = `${size}px`;
      fallback.style.fontSize = `${size * 0.4}px`;
      fallback.textContent = code.charAt(0);
      target.parentNode?.appendChild(fallback);
    }}
  />
);

export default function CurrencySelector({
  value,
  onChange,
  disabled = false,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // React Compiler automatically optimizes these - no need for useMemo
  const selectedCurrency = CURRENCIES.find((c) => c.code === value);

  const filteredCurrencies = !searchQuery
    ? CURRENCIES
    : CURRENCIES.filter((currency) => {
        const query = searchQuery.toLowerCase();
        return (
          currency.code.toLowerCase().includes(query) ||
          currency.name.toLowerCase().includes(query)
        );
      });

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      {/* Selected Currency Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-300"}`}
      >
        <div className="flex items-center gap-3">
          <CurrencyLogo code={value} size={28} />
          <div className="text-left">
            <div className="font-medium">{value}</div>
            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {selectedCurrency?.name || value}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${
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

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col ${isDark ? "bg-gray-900" : "bg-white"}`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Select Currency
                </h2>
                <div className="w-6" /> {/* Spacer for centering */}
              </div>

              {/* Search */}
              <div className={`p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className={`w-full rounded-lg pl-10 pr-4 py-2.5 border focus:outline-none focus:border-blue-500 ${isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-300"}`}
                    autoFocus
                  />
                </div>
              </div>

              {/* Currency List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Currencies
                  </h3>
                  <div className="space-y-1">
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleSelect(currency.code)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                      >
                        <CurrencyLogo code={currency.code} size={28} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                            {currency.code}
                          </div>
                          <div className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {currency.name}
                          </div>
                        </div>
                        {value === currency.code && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {filteredCurrencies.length === 0 && (
                    <div className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      No currencies found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
