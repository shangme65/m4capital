"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingDown, AlertCircle, ArrowUpDown } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import SuccessModal from "@/components/client/SuccessModal";

interface AssetSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    amount: number;
    price: number;
  };
}

export default function AssetSellModal({
  isOpen,
  onClose,
  asset,
}: AssetSellModalProps) {
  const [sellAmount, setSellAmount] = useState("");
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("crypto");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();

  // Currency symbol helper
  const getCurrencySymbol = () => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CHF: "Fr",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
      ZAR: "R",
      MXN: "$",
    };
    return symbols[preferredCurrency] || preferredCurrency;
  };

  // Get crypto amount based on input mode
  const getCryptoAmount = () => {
    if (!sellAmount) return "";
    const value = parseFloat(sellAmount);
    if (isNaN(value)) return "";

    if (inputMode === "crypto") {
      return sellAmount;
    } else {
      // Convert fiat to USD then to crypto
      const usdValue = convertAmount(value, true);
      const cryptoAmount = usdValue / asset.price;
      return cryptoAmount.toString();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSellAmount("");
      setInputMode("crypto");
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateUSDValue = () => {
    if (!sellAmount) return 0;
    const cryptoAmount = parseFloat(getCryptoAmount());
    return cryptoAmount * asset.price;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      newErrors.sellAmount = "Please enter a valid amount";
    }

    const cryptoAmount = parseFloat(getCryptoAmount());
    if (cryptoAmount > asset.amount) {
      newErrors.sellAmount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSell = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const amount = parseFloat(getCryptoAmount());
      const usdValue = calculateUSDValue();

      // Call the sell crypto API - this actually updates the database
      const response = await fetch("/api/crypto/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: asset.symbol,
          amount: amount,
          price: asset.price, // USD price per unit
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sell crypto");
      }

      // API handles email/push notifications, but we add to local context for UI
      const transaction = {
        id: `sell_${Date.now()}`,
        type: "sell" as const,
        asset: asset.symbol,
        amount: amount,
        value: usdValue,
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: usdValue * 0.015,
        method: "Instant Sale",
        description: `Sold ${amount.toFixed(8)} ${
          asset.symbol
        } for ${formatAmount(usdValue, 2)}`,
      };

      addTransaction(transaction);

      addNotification({
        type: "transaction",
        title: `${asset.symbol} Sold`,
        message: `Successfully sold ${amount.toFixed(8)} ${
          asset.symbol
        } for ${formatAmount(usdValue, 2)}`,
        amount: usdValue,
        asset: asset.symbol,
      });

      // Show success with data from API response
      setSuccessData({
        asset: asset.symbol,
        amount: amount,
        value: data.netReceived || usdValue * 0.985, // Use net received after fee
      });
      setShowSuccessModal(true);
      setSellAmount("");
      setErrors({});
    } catch (error) {
      console.error("Error processing sale:", error);
      setErrors({
        sellAmount:
          error instanceof Error ? error.message : "Failed to process sale",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick sell percentages
  const quickSellPercentages = [25, 50, 75, 100];

  if (!isOpen) return null;

  const usdValue = calculateUSDValue();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  background: "rgba(30, 41, 59, 0.5)",
                }}
              >
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                    boxShadow:
                      "0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <CryptoIcon symbol={asset.symbol} size="xs" />
                  <span className="text-lg font-bold text-white">
                    Sell {asset.symbol}
                  </span>
                </div>
                <div className="w-8" /> {/* Spacer for centering */}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Available Balance - Compact */}
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={asset.symbol} size="xs" />
                      <div>
                        <p className="text-xs text-gray-400">Available</p>
                        <p className="text-sm font-bold text-white">
                          {asset.amount.toFixed(8)} <span className="text-gray-400 text-xs">{asset.symbol}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-sm font-semibold text-red-400">{formatAmount(asset.price, 2)}</p>
                    </div>
                  </div>
                </div>

                {/* Amount Input - Compact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Amount to Sell
                  </label>
                  <div className="relative mb-3">
                    <input
                      type="number"
                      step={inputMode === "crypto" ? "0.00000001" : "0.01"}
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      placeholder={
                        inputMode === "crypto"
                          ? "0.00000000"
                          : `${getCurrencySymbol()}0.00`
                      }
                      className="w-full px-3 py-3 pr-20 rounded-xl text-white text-xl font-bold focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{
                        background: "rgba(15, 23, 42, 0.8)",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                        border: errors.sellAmount
                          ? "1px solid rgba(239, 68, 68, 0.5)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentValue = parseFloat(sellAmount);
                        if (!isNaN(currentValue) && currentValue > 0) {
                          if (inputMode === "crypto") {
                            // Convert crypto to fiat
                            const usdValue = currentValue * asset.price;
                            const fiatValue = convertAmount(usdValue);
                            setSellAmount(fiatValue.toFixed(2));
                          } else {
                            // Convert fiat to crypto
                            const usdValue = convertAmount(currentValue, true);
                            const cryptoValue = usdValue / asset.price;
                            setSellAmount(cryptoValue.toFixed(8));
                          }
                        }
                        setInputMode(inputMode === "crypto" ? "fiat" : "crypto");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span>{inputMode === "crypto" ? asset.symbol : preferredCurrency}</span>
                    </button>
                  </div>

                  {/* Quick sell buttons - Compact */}
                  <div className="flex gap-1.5 mb-3">
                    {quickSellPercentages.map((percent) => (
                      <button
                        key={percent}
                        onClick={() => {
                          const cryptoAmount = (asset.amount * percent) / 100;
                          if (inputMode === "fiat") {
                            // Convert crypto to fiat
                            const usdValue = cryptoAmount * asset.price;
                            const fiatValue = convertAmount(usdValue);
                            setSellAmount(fiatValue.toFixed(2));
                          } else {
                            // Set crypto amount directly
                            setSellAmount(cryptoAmount.toFixed(8));
                          }
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background: "rgba(55, 65, 81, 0.5)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "#9ca3af",
                        }}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>

                  {errors.sellAmount && (
                    <p className="text-xs text-red-400 flex items-center gap-1 mb-2">
                      <AlertCircle className="w-3 h-3" />
                      {errors.sellAmount}
                    </p>
                  )}

                  {sellAmount &&
                    parseFloat(sellAmount) > 0 &&
                    !errors.sellAmount && (
                      <p className="text-right text-xs text-gray-400">
                        {inputMode === "crypto"
                          ? `≈ ${formatAmount(parseFloat(sellAmount) * asset.price, 2)}`
                          : `≈ ${parseFloat(getCryptoAmount()).toFixed(8)} ${asset.symbol}`}
                      </p>
                    )}
                </div>

                {/* Preview Card - Compact */}
                {sellAmount &&
                  parseFloat(sellAmount) > 0 &&
                  !errors.sellAmount && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <p className="text-xs text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        Sale Preview
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">You&apos;re selling</span>
                          <span className="font-bold text-white">
                            {parseFloat(getCryptoAmount()).toFixed(8)} {asset.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Rate</span>
                          <span className="text-gray-300">
                            1 {asset.symbol} = {formatAmount(asset.price, 2)}
                          </span>
                        </div>
                        <div className="h-px my-1" style={{ background: "rgba(239, 68, 68, 0.2)" }} />
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-300">
                            You&apos;ll receive
                          </span>
                          <span className="font-bold text-lg text-red-400">
                            {formatAmount(usdValue, 2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
              </div>

              {/* Bottom Action - Compact */}
              <div
                className="px-4 py-3 border-t"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  background: "rgba(15, 23, 42, 0.9)",
                }}
              >
                <button
                  onClick={handleSell}
                  disabled={
                    isProcessing ||
                    !sellAmount ||
                    parseFloat(sellAmount) <= 0 ||
                    !!errors.sellAmount
                  }
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background:
                      isProcessing ||
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      !!errors.sellAmount
                        ? "linear-gradient(145deg, #374151 0%, #1f2937 100%)"
                        : "linear-gradient(145deg, #ef4444 0%, #dc2626 100%)",
                    boxShadow:
                      isProcessing ||
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      !!errors.sellAmount
                        ? "none"
                        : "0 4px 12px -2px rgba(239, 68, 68, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {isProcessing
                    ? "Processing..."
                    : sellAmount && parseFloat(sellAmount) > 0
                    ? `Sell ${parseFloat(getCryptoAmount()).toFixed(8)} ${
                        asset.symbol
                      }`
                    : `Sell ${asset.symbol}`}
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-2">
                  1.5% fee • Instant settlement
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
          window.location.reload();
        }}
        type="sell"
        asset={successData?.asset || ""}
        amount={successData?.amount.toString() || "0"}
        value={successData?.value.toString() || "0"}
      />
    </>
  );
}
