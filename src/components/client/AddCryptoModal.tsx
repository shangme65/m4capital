"use client";

import { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
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
      <div className="absolute inset-x-4 top-20 bottom-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[85vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl font-bold text-white">Add Cryptocurrency</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredCryptos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No cryptocurrencies found</p>
            </div>
          ) : (
            filteredCryptos.map((crypto) => {
              const isInPortfolio = existingSymbols.includes(crypto.symbol);
              const asset = existingAssets.find((a) => a.symbol === crypto.symbol);
              const hasBalance = asset && asset.amount > 0;
              const metadata = getCryptoMetadata(crypto.symbol);
              const priceData = cryptoPrices[crypto.symbol];

              return (
                <div
                  key={crypto.symbol}
                  className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 rounded-xl border border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metadata.gradient} flex items-center justify-center`}
                    >
                      <CryptoIcon symbol={crypto.symbol} size="md" showNetwork={true} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{crypto.symbol}</span>
                        <span className="text-xs text-gray-400 bg-gray-700 px-1.5 py-0.5 rounded">
                          {crypto.name}
                        </span>
                      </div>
                      {priceData && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-white text-sm">
                            {preferredCurrency === "USD" ? "$" : preferredCurrency === "EUR" ? "€" : preferredCurrency === "GBP" ? "£" : "R$"}
                            {convertAmount(priceData.price).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: priceData.price < 1 ? 6 : 2,
                            })}
                          </span>
                          <span className={`text-xs ${priceData.changePercent24h >= 0 ? "text-green-400" : "text-red-400"}`}>
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
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isInPortfolio
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      } ${hasBalance ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          isInPortfolio ? "translate-x-6" : "translate-x-1"
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
