"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/contexts/ToastContext";

interface Cryptocurrency {
  symbol: string;
  name: string;
  icon: string;
}

const POPULAR_CRYPTOCURRENCIES: Cryptocurrency[] = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "USDT", name: "Tether", icon: "₮" },
  { symbol: "BNB", name: "Binance Coin", icon: "◈" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "XRP", name: "Ripple", icon: "✕" },
  { symbol: "USDC", name: "USD Coin", icon: "$" },
  { symbol: "ADA", name: "Cardano", icon: "₳" },
  { symbol: "AVAX", name: "Avalanche", icon: "▲" },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { symbol: "DOT", name: "Polkadot", icon: "●" },
  { symbol: "MATIC", name: "Polygon", icon: "⬡" },
  { symbol: "LINK", name: "Chainlink", icon: "⬢" },
  { symbol: "UNI", name: "Uniswap", icon: "🦄" },
  { symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { symbol: "ATOM", name: "Cosmos", icon: "⚛" },
  { symbol: "XLM", name: "Stellar", icon: "✱" },
  { symbol: "ALGO", name: "Algorand", icon: "△" },
  { symbol: "VET", name: "VeChain", icon: "⚡" },
  { symbol: "TRX", name: "TRON", icon: "Ⓣ" },
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

  const existingSymbols = existingAssets.map((a) => a.symbol);

  const filteredCryptos = POPULAR_CRYPTOCURRENCIES.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
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
            <div className="p-4 sm:p-6 border-b border-gray-700">
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
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>{" "}
            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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

                    return (
                      <button
                        key={crypto.symbol}
                        onClick={() =>
                          isInPortfolio
                            ? handleRemove(crypto.symbol)
                            : handleAdd(crypto)
                        }
                        disabled={
                          isAdding ||
                          isRemoving === crypto.symbol ||
                          (isInPortfolio && hasBalance)
                        }
                        className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-900 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white group-hover:bg-gray-600 transition-colors ${
                              isInPortfolio
                                ? "bg-green-600 group-hover:bg-green-700"
                                : "bg-gray-700"
                            }`}
                          >
                            {crypto.icon}
                          </div>
                          <div className="text-left">
                            <div className="text-white font-semibold flex items-center gap-2">
                              {crypto.symbol}
                              {isInPortfolio && hasBalance && (
                                <span className="text-xs text-orange-400">
                                  (has balance)
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {crypto.name}
                            </div>
                          </div>
                        </div>
                        {isInPortfolio ? (
                          <svg
                            className={`w-5 h-5 transition-colors ${
                              hasBalance
                                ? "text-gray-600"
                                : "text-gray-400 group-hover:text-red-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        )}
                      </button>
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
