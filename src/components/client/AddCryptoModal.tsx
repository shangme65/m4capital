"use client";

import { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { useToast } from "@/contexts/ToastContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

interface Cryptocurrency {
  symbol: string;
  name: string;
  icon: string;
}

const POPULAR_CRYPTOCURRENCIES: Cryptocurrency[] = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { symbol: "SOL", name: "Solana", icon: "◎" },
  { symbol: "XRP", name: "Ripple", icon: "✕" },
  { symbol: "BNB", name: "BNB", icon: "B" },
  { symbol: "ADA", name: "Cardano", icon: "₳" },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { symbol: "AVAX", name: "Avalanche", icon: "A" },
  { symbol: "TRX", name: "Tron", icon: "Ⓣ" },
  { symbol: "DOT", name: "Polkadot", icon: "●" },
  { symbol: "LINK", name: "Chainlink", icon: "⬡" },
  { symbol: "TON", name: "Toncoin", icon: "💎" },
  { symbol: "SHIB", name: "Shiba Inu", icon: "S" },
  { symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { symbol: "UNI", name: "Uniswap", icon: "🦄" },
  { symbol: "MATIC", name: "Polygon", icon: "M" },
  { symbol: "ATOM", name: "Cosmos", icon: "⚛" },
  { symbol: "NEAR", name: "NEAR Protocol", icon: "N" },
  { symbol: "FIL", name: "Filecoin", icon: "⨎" },
  { symbol: "APT", name: "Aptos", icon: "A" },
  { symbol: "ARB", name: "Arbitrum", icon: "A" },
  { symbol: "OP", name: "Optimism", icon: "O" },
  { symbol: "AAVE", name: "Aave", icon: "A" },
  { symbol: "MKR", name: "Maker", icon: "M" },
  { symbol: "INJ", name: "Injective", icon: "I" },
  { symbol: "SUI", name: "Sui", icon: "S" },
  { symbol: "SEI", name: "Sei", icon: "S" },
  { symbol: "BCH", name: "Bitcoin Cash", icon: "Ƀ" },
  { symbol: "ETC", name: "Ethereum Classic", icon: "Ξ" },
  { symbol: "USDC", name: "USD Coin", icon: "$" },
  { symbol: "USDT", name: "Tether", icon: "₮" },
];

const ALL_SYMBOLS = POPULAR_CRYPTOCURRENCIES.map((c) => c.symbol);

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
  const [isMounted, setIsMounted] = useState(false);
  const { showWarning } = useToast();
  const { preferredCurrency, convertAmount } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Memoize symbols to prevent re-renders
  const cryptoPrices = useCryptoPrices(ALL_SYMBOLS);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const existingSymbols = useMemo(
    () => existingAssets.map((a) => a.symbol),
    [existingAssets]
  );

  const filteredCryptos = useMemo(() => {
    return POPULAR_CRYPTOCURRENCIES.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      const aEnabled = existingSymbols.includes(a.symbol);
      const bEnabled = existingSymbols.includes(b.symbol);
      if (aEnabled && !bEnabled) return -1;
      if (!aEnabled && bEnabled) return 1;
      return 0;
    });
  }, [searchTerm, existingSymbols]);

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

  if (!isMounted || !isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`absolute inset-x-4 top-16 bottom-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm sm:max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Add Cryptocurrency</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className={`px-4 py-2.5 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search cryptocurrency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors ${isDark ? "bg-gray-800 border border-gray-600 text-white placeholder-gray-400" : "bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500"}`}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {filteredCryptos.length === 0 ? (
            <div className="text-center py-8">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No cryptocurrencies found</p>
            </div>
          ) : (
            filteredCryptos.map((crypto) => {
              const isInPortfolio = existingSymbols.includes(crypto.symbol);
              const asset = existingAssets.find((a) => a.symbol === crypto.symbol);
              const hasBalance = asset && asset.amount > 0;
              const priceData = cryptoPrices[crypto.symbol];

              return (
                <div
                  key={crypto.symbol}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-750 border-gray-700" : "bg-gray-50 hover:bg-gray-100 border-gray-200"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                      <CryptoIcon symbol={crypto.symbol} size="md" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{crypto.symbol}</span>
                        <span className={`text-[10px] px-1 py-0.5 rounded ${isDark ? "text-gray-400 bg-gray-700" : "text-gray-600 bg-gray-200"}`}>
                          {crypto.name}
                        </span>
                      </div>
                      {priceData && (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs ${isDark ? "text-white" : "text-gray-900"}`}>
                            {preferredCurrency === "USD" ? "$" : preferredCurrency === "EUR" ? "€" : preferredCurrency === "GBP" ? "£" : "R$"}
                            {convertAmount(priceData.price).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: priceData.price < 1 ? 6 : 2,
                            })}
                          </span>
                          <span className={`text-[10px] ${priceData.changePercent24h >= 0 ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-red-400" : "text-red-600")}`}>
                            {priceData.changePercent24h >= 0 ? "+" : ""}
                            {priceData.changePercent24h.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => {
                      if (isInPortfolio) {
                        handleRemove(crypto.symbol);
                      } else {
                        handleAdd(crypto);
                      }
                    }}
                    disabled={isAdding || isRemoving === crypto.symbol || (isInPortfolio && hasBalance)}
                    className="flex-shrink-0"
                  >
                    <div
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        isInPortfolio
                          ? "bg-blue-600"
                          : isDark ? "bg-gray-600" : "bg-gray-300"
                      } ${hasBalance ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          isInPortfolio ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
