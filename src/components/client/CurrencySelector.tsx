"use client";
import { useState } from "react";
import { CURRENCIES } from "@/lib/currencies";
import { COUNTRY_CURRENCY_MAP } from "@/lib/country-currencies";
import { Search, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

// Map currency codes to their primary country codes for flag display
const CURRENCY_TO_FLAG: Record<string, string> = {
  AED: "AE",
  AFN: "AF",
  ALL: "AL",
  AMD: "AM",
  ANG: "CW",
  AOA: "AO",
  ARS: "AR",
  AUD: "AU",
  AWG: "AW",
  AZN: "AZ",
  BAM: "BA",
  BBD: "BB",
  BDT: "BD",
  BGN: "BG",
  BHD: "BH",
  BIF: "BI",
  BMD: "BM",
  BND: "BN",
  BOB: "BO",
  BRL: "BR",
  BSD: "BS",
  BTN: "BT",
  BWP: "BW",
  BYN: "BY",
  BZD: "BZ",
  CAD: "CA",
  CDF: "CD",
  CHF: "CH",
  CLP: "CL",
  CNY: "CN",
  COP: "CO",
  CRC: "CR",
  CUP: "CU",
  CVE: "CV",
  CZK: "CZ",
  DJF: "DJ",
  DKK: "DK",
  DOP: "DO",
  DZD: "DZ",
  EGP: "EG",
  ERN: "ER",
  ETB: "ET",
  EUR: "EU",
  FJD: "FJ",
  FKP: "FK",
  GBP: "GB",
  GEL: "GE",
  GHS: "GH",
  GIP: "GI",
  GMD: "GM",
  GNF: "GN",
  GTQ: "GT",
  GYD: "GY",
  HKD: "HK",
  HNL: "HN",
  HTG: "HT",
  HUF: "HU",
  IDR: "ID",
  ILS: "IL",
  INR: "IN",
  IQD: "IQ",
  IRR: "IR",
  ISK: "IS",
  JMD: "JM",
  JOD: "JO",
  JPY: "JP",
  KES: "KE",
  KGS: "KG",
  KHR: "KH",
  KMF: "KM",
  KPW: "KP",
  KRW: "KR",
  KWD: "KW",
  KYD: "KY",
  KZT: "KZ",
  LAK: "LA",
  LBP: "LB",
  LKR: "LK",
  LRD: "LR",
  LSL: "LS",
  LYD: "LY",
  MAD: "MA",
  MDL: "MD",
  MGA: "MG",
  MKD: "MK",
  MMK: "MM",
  MNT: "MN",
  MOP: "MO",
  MRU: "MR",
  MUR: "MU",
  MVR: "MV",
  MWK: "MW",
  MXN: "MX",
  MYR: "MY",
  MZN: "MZ",
  NAD: "NA",
  NGN: "NG",
  NIO: "NI",
  NOK: "NO",
  NPR: "NP",
  NZD: "NZ",
  OMR: "OM",
  PAB: "PA",
  PEN: "PE",
  PGK: "PG",
  PHP: "PH",
  PKR: "PK",
  PLN: "PL",
  PYG: "PY",
  QAR: "QA",
  RON: "RO",
  RSD: "RS",
  RUB: "RU",
  RWF: "RW",
  SAR: "SA",
  SBD: "SB",
  SCR: "SC",
  SDG: "SD",
  SEK: "SE",
  SGD: "SG",
  SHP: "SH",
  SLL: "SL",
  SOS: "SO",
  SRD: "SR",
  SSP: "SS",
  STN: "ST",
  SYP: "SY",
  SZL: "SZ",
  THB: "TH",
  TJS: "TJ",
  TMT: "TM",
  TND: "TN",
  TOP: "TO",
  TRY: "TR",
  TTD: "TT",
  TWD: "TW",
  TZS: "TZ",
  UAH: "UA",
  UGX: "UG",
  USD: "US",
  UYU: "UY",
  UZS: "UZ",
  VES: "VE",
  VND: "VN",
  VUV: "VU",
  WST: "WS",
  XAF: "CM",
  XCD: "AG",
  XOF: "SN",
  XPF: "PF",
  YER: "YE",
  ZAR: "ZA",
  ZMW: "ZM",
  ZWL: "ZW",
};

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

  const getFlagEmoji = (currencyCode: string) => {
    const countryCode = CURRENCY_TO_FLAG[currencyCode];
    if (!countryCode) return "🌐";

    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
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
          <span className="text-2xl">{getFlagEmoji(value)}</span>
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
                        <span className="text-2xl flex-shrink-0">
                          {getFlagEmoji(currency.code)}
                        </span>
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
