"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCurrencySymbol } from "@/lib/currencies";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import PaymentMethodSelector from "./PaymentMethodSelector";

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    price: number;
  };
  userBalance: number;
  balanceCurrency?: string;
  defaultAmount?: number;
}

export default function BuyCryptoModal({
  isOpen,
  onClose,
  asset,
  userBalance,
  balanceCurrency = "USD",
  defaultAmount,
}: BuyCryptoModalProps) {
  const [amount, setAmount] = useState(
    defaultAmount ? defaultAmount.toString() : ""
  );
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("fiat");
  const { addTransaction, addNotification } = useNotifications();
  const { formatAmount, preferredCurrency, convertAmount } = useCurrency();
  const currencySymbol = getCurrencySymbol(preferredCurrency);

  // Update amount when defaultAmount changes or modal opens
  useEffect(() => {
    if (isOpen && defaultAmount) {
      setAmount(defaultAmount.toString());
      setInputMode("fiat");
    }
  }, [isOpen, defaultAmount]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setAmount("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // In fiat mode, user enters amount in their preferred currency
  // asset.price is always in USD from the market API
  // We need to convert user's currency to USD first, then calculate crypto amount
  const userInputAmount = amount ? parseFloat(amount) : 0;

  const cryptoAmount =
    inputMode === "crypto"
      ? userInputAmount
      : userInputAmount > 0
      ? convertAmount(userInputAmount, true) / asset.price // Convert user currency → USD, then divide by USD price
      : 0;

  // usdValue should ALWAYS be in USD for API calls and storage
  const usdValue =
    inputMode === "fiat"
      ? convertAmount(userInputAmount, true) // Convert user's currency to USD
      : cryptoAmount * asset.price; // Crypto mode: amount × USD price

  const handleProceedToPayment = () => {
    if (cryptoAmount > 0) {
      setShowPaymentSelector(true);
    }
  };

  const handlePaymentSuccess = async () => {
    // Add transaction to notification context (UI only - actual purchase would be via API)
    const transaction = {
      id: `buy_${Date.now()}`,
      type: "buy" as const,
      asset: asset.symbol,
      amount: cryptoAmount,
      value: usdValue,
      timestamp: new Date().toLocaleString(),
      status: "pending" as const,
      fee: 0,
      method: "Crypto Purchase",
      description: `Purchased ${cryptoAmount.toFixed(8)} ${
        asset.symbol
      } for ${formatAmount(usdValue, 2)}`,
    };

    addTransaction(transaction);

    // Add notification (UI only - API would send email/push if actual purchase)
    addNotification({
      type: "transaction",
      title: `${asset.symbol} Purchase Successful`,
      message: `You have successfully purchased ${cryptoAmount.toFixed(8)} ${
        asset.symbol
      } for ${formatAmount(usdValue, 2)}`,
      amount: usdValue,
      asset: asset.symbol,
    });

    // Note: Email and push notifications would be sent by the actual purchase API endpoint
  };

  if (!isOpen) return null;

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
                    Buy {asset.symbol}
                  </span>
                </div>
                <div className="w-8" /> {/* Spacer for centering */}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Asset Info - Compact */}
                <div
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CryptoIcon symbol={asset.symbol} size="xs" />
                    <div>
                      <p className="text-xs text-gray-400">{asset.name}</p>
                      <p className="text-sm font-bold text-white">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-sm font-semibold text-green-400">{formatAmount(asset.price, 2)}</p>
                  </div>
                </div>

                {/* Toggle Switch - Compact */}
                <div
                  className="flex items-center gap-1 p-1 rounded-lg"
                  style={{
                    background: "rgba(30, 41, 59, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <button
                    onClick={() => {
                      setInputMode("crypto");
                      setAmount("");
                    }}
                    className="flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200"
                    style={{
                      background:
                        inputMode === "crypto"
                          ? "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)"
                          : "transparent",
                      color: inputMode === "crypto" ? "#ffffff" : "#9ca3af",
                      boxShadow:
                        inputMode === "crypto"
                          ? "0 2px 8px -2px rgba(34, 197, 94, 0.4)"
                          : "none",
                    }}
                  >
                    {asset.symbol}
                  </button>
                  <button
                    onClick={() => {
                      setInputMode("fiat");
                      setAmount("");
                    }}
                    className="flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200"
                    style={{
                      background:
                        inputMode === "fiat"
                          ? "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)"
                          : "transparent",
                      color: inputMode === "fiat" ? "#ffffff" : "#9ca3af",
                      boxShadow:
                        inputMode === "fiat"
                          ? "0 2px 8px -2px rgba(34, 197, 94, 0.4)"
                          : "none",
                    }}
                  >
                    {preferredCurrency}
                  </button>
                </div>

                {/* Amount Input - Compact */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Amount ({inputMode === "crypto" ? asset.symbol : preferredCurrency})
                  </label>
                  <div className="relative mb-3">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={
                        inputMode === "crypto"
                          ? `0.00 ${asset.symbol}`
                          : `${currencySymbol}0.00`
                      }
                      className="w-full px-3 py-3 pr-16 rounded-xl text-white text-xl font-bold focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{
                        background: "rgba(15, 23, 42, 0.8)",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {inputMode === "crypto" ? asset.symbol : preferredCurrency}
                    </span>
                  </div>

                  {/* Quick Amount Buttons - Compact */}
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[100, 250, 500, 1000].map((value) => (
                      <button
                        key={value}
                        onClick={() =>
                          setAmount(
                            inputMode === "crypto"
                              ? (convertAmount(value, true) / asset.price).toFixed(8)
                              : value.toString()
                          )
                        }
                        className="py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background: "rgba(55, 65, 81, 0.5)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "#9ca3af",
                        }}
                      >
                        {currencySymbol}{value}
                      </button>
                    ))}
                  </div>

                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-right text-xs text-gray-400">
                      ≈ {inputMode === "crypto"
                        ? formatAmount(usdValue, 2)
                        : `${cryptoAmount.toFixed(8)} ${asset.symbol}`}
                    </p>
                  )}
                </div>

                {/* Preview Card - Compact */}
                {amount && parseFloat(amount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <p className="text-xs text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      Purchase Preview
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">You&apos;re buying</span>
                        <span className="font-bold text-white">{cryptoAmount.toFixed(8)} {asset.symbol}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-gray-300">1 {asset.symbol} = {formatAmount(asset.price, 2)}</span>
                      </div>
                      <div className="h-px my-1" style={{ background: "rgba(34, 197, 94, 0.2)" }} />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-300">Total</span>
                        <span className="font-bold text-lg text-green-400">{formatAmount(usdValue, 2)}</span>
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
                  onClick={handleProceedToPayment}
                  disabled={cryptoAmount <= 0}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background:
                      cryptoAmount <= 0
                        ? "linear-gradient(145deg, #374151 0%, #1f2937 100%)"
                        : "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)",
                    boxShadow:
                      cryptoAmount <= 0
                        ? "none"
                        : "0 4px 12px -2px rgba(34, 197, 94, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {cryptoAmount > 0
                    ? `Buy ${cryptoAmount.toFixed(8)} ${asset.symbol}`
                    : `Buy ${asset.symbol}`}
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-2">
                  By proceeding, you agree to our terms
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Selector */}
      {showPaymentSelector && (
        <PaymentMethodSelector
          isOpen={showPaymentSelector}
          onClose={() => {
            setShowPaymentSelector(false);
            onClose();
          }}
          onSuccess={handlePaymentSuccess}
          asset={asset.symbol}
          amount={cryptoAmount}
          usdValue={usdValue}
          userBalance={userBalance}
          balanceCurrency={balanceCurrency}
        />
      )}
    </>
  );
}
