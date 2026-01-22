"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { getCryptoMetadata } from "@/lib/crypto-constants";

interface Cryptocurrency {
  symbol: string;
  name: string;
  icon: string;
}

const POPULAR_CRYPTOCURRENCIES: Cryptocurrency[] = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "XRP", name: "Ripple", icon: "✕" },
  { symbol: "TRX", name: "Tron", icon: "Ⓣ" },
  { symbol: "TON", name: "Toncoin", icon: "◎" },
  { symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { symbol: "BCH", name: "Bitcoin Cash", icon: "Ƀ" },
  { symbol: "ETC", name: "Ethereum Classic", icon: "Ξ" },
  { symbol: "USDC", name: "Ethereum", icon: "$" },
  { symbol: "USDT", name: "Ethereum", icon: "₮" },
];

interface AddCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbol: string, name: string) => void;
  onRemove: (symbol: string) => void;
  existingAssets: Array<{ symbol: string; amount: number }>;
}

export default function AddCryptoModal({
  isOpen,
  onClose,
  onAdd,
  onRemove,
  existingAssets,
}: AddCryptoModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const { showWarning } = useToast();
  const { preferredCurrency, convertAmount } = useCurrency();

  // Handle mobile back button to close modal
  useEffect(() => {
    if (isOpen) {
      const handlePopState = () => {
        onClose();
      };

      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.href);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen, onClose]);

  // Get real-time prices for all cryptocurrencies
  const allSymbols = POPULAR_CRYPTOCURRENCIES.map((c) => c.symbol);
  const cryptoPrices = useCryptoPrices(allSymbols);

  const existingSymbols = existingAssets.map((a) => a.symbol);

  const filteredCryptos = POPULAR_CRYPTOCURRENCIES.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort enabled assets to the top
    const aEnabled = existingSymbols.includes(a.symbol);
    const bEnabled = existingSymbols.includes(b.symbol);
    if (aEnabled && !bEnabled) return -1;
    if (!aEnabled && bEnabled) return 1;
    return 0;
  });

  const handleAdd = async (crypto: Cryptocurrency) => {
    setIsAdding(true);
    await onAdd(crypto.symbol, crypto.name);
    setIsAdding(false);
  };

  const handleRemove = async (symbol: string) => {
    const asset = existingAssets.find((a) => a.symbol === symbol);
    if (asset && asset.amount > 0) {
      showWarning(
        `Cannot remove ${symbol} because you have a balance of ${asset.amount}. Please sell or transfer your holdings first.`
      );
      return;
    }
    setIsRemoving(symbol);
    await onRemove(symbol);
    setIsRemoving(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-2 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-gradient-to-br from-gray-800/95 to-gray-900/95 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.4)] border border-gray-700/50 hover:border-blue-500/50 z-50 overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-xl transition-all duration-300"
            style={{
              transform: "perspective(1000px) rotateX(2deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-900/80 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <h2 className="text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
                Add Cryptocurrency
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Search */}
            <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gray-900/30">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search cryptocurrency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all shadow-inner"
                />
              </div>
            </div>{" "}
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filteredCryptos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400">No cryptocurrencies found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCryptos.map((crypto) => {
                    const isInPortfolio = existingSymbols.includes(
                      crypto.symbol
                    );
                    const asset = existingAssets.find(
                      (a) => a.symbol === crypto.symbol
                    );
                    const hasBalance = asset && asset.amount > 0;

                    const metadata = getCryptoMetadata(crypto.symbol);

                    return (
                      <div
                        key={crypto.symbol}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 hover:from-gray-800/90 hover:to-gray-900/90 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        style={{
                          transform: "translateZ(10px)",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {/* 3D Crypto Icon Container */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metadata.gradient} flex items-center justify-center relative transition-all duration-300 group-hover:scale-110`}
                              style={{
                                boxShadow: `0 4px 16px ${metadata.iconBg}40, 0 2px 8px ${metadata.iconBg}60, inset 0 1px 2px rgba(255,255,255,0.2)`,
                              }}
                            >
                              {/* Inner glow overlay */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                              <CryptoIcon
                                symbol={crypto.symbol}
                                size="md"
                                showNetwork={true}
                                className="relative z-10 drop-shadow-lg"
                              />
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-white font-semibold flex items-center gap-2">
                              <span>{crypto.symbol}</span>
                              <span className="text-[10px] font-normal text-gray-300 bg-gray-700/50 px-1 py-[1px] rounded-md leading-tight border border-blue-400/30 shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                                {crypto.name}
                              </span>
                            </div>
                            {/* Real-time price display */}
                            {cryptoPrices[crypto.symbol] && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-white text-xs font-medium">
                                  {preferredCurrency === "USD"
                                    ? "$"
                                    : preferredCurrency === "EUR"
                                    ? "€"
                                    : preferredCurrency === "GBP"
                                    ? "£"
                                    : preferredCurrency}
                                  {convertAmount(
                                    cryptoPrices[crypto.symbol].price
                                  ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits:
                                      cryptoPrices[crypto.symbol].price < 1
                                        ? 6
                                        : 2,
                                  })}
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    cryptoPrices[crypto.symbol]
                                      .changePercent24h >= 0
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {cryptoPrices[crypto.symbol]
                                    .changePercent24h >= 0
                                    ? "+"
                                    : ""}
                                  {cryptoPrices[
                                    crypto.symbol
                                  ].changePercent24h.toFixed(2)}
                                  %
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInPortfolio) {
                              handleRemove(crypto.symbol);
                            } else {
                              handleAdd(crypto);
                            }
                          }}
                          disabled={
                            isAdding ||
                            isRemoving === crypto.symbol ||
                            (isInPortfolio && hasBalance)
                          }
                          className="flex-shrink-0"
                        >
                          <div
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                              isInPortfolio
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                                : "bg-gray-600"
                            } ${
                              hasBalance
                                ? "cursor-not-allowed opacity-30 bg-gray-800"
                                : "cursor-pointer"
                            }`}
                            style={{
                              transform: "translateZ(5px)",
                            }}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform ${
                                isInPortfolio
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
