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
            className="fixed inset-0 z-[10000]"
            style={{
              background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-4 border-b"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  background:
                    "linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
                }}
              >
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                    boxShadow:
                      "0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <CryptoIcon symbol={asset.symbol} size="sm" />
                  <span className="text-xl font-bold text-white">
                    Buy {asset.symbol}
                  </span>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Asset Info Card */}
                <div
                  className="relative rounded-2xl p-5 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                    boxShadow:
                      "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 10px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-30 rounded-2xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)",
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)",
                            boxShadow:
                              "0 4px 12px -2px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <CryptoIcon symbol={asset.symbol} size="sm" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{asset.name}</p>
                          <p className="text-xl font-bold text-white">
                            {asset.symbol}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between pt-3 border-t"
                      style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                    >
                      <span className="text-sm text-gray-400">
                        Current Price
                      </span>
                      <span className="font-semibold text-green-400">
                        {formatAmount(asset.price, 2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div
                  className="flex items-center justify-center gap-2 p-2 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <button
                    onClick={() => {
                      setInputMode("crypto");
                      setAmount("");
                    }}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      background:
                        inputMode === "crypto"
                          ? "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)"
                          : "transparent",
                      color: inputMode === "crypto" ? "#ffffff" : "#9ca3af",
                      boxShadow:
                        inputMode === "crypto"
                          ? "0 4px 12px -2px rgba(34, 197, 94, 0.4)"
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
                    className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200"
                    style={{
                      background:
                        inputMode === "fiat"
                          ? "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)"
                          : "transparent",
                      color: inputMode === "fiat" ? "#ffffff" : "#9ca3af",
                      boxShadow:
                        inputMode === "fiat"
                          ? "0 4px 12px -2px rgba(34, 197, 94, 0.4)"
                          : "none",
                    }}
                  >
                    {preferredCurrency}
                  </button>
                </div>

                {/* Amount Input Card */}
                <div
                  className="relative rounded-2xl p-5 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                    boxShadow:
                      "0 15px 30px -8px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Amount (
                    {inputMode === "crypto" ? asset.symbol : preferredCurrency})
                  </label>
                  <div className="relative mb-4">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={
                        inputMode === "crypto"
                          ? `0.00 ${asset.symbol}`
                          : `${currencySymbol}0.00`
                      }
                      className="w-full px-4 py-4 pr-20 rounded-xl text-white text-2xl font-bold focus:outline-none transition-all"
                      style={{
                        background:
                          "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
                        boxShadow:
                          "inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      {inputMode === "crypto"
                        ? asset.symbol
                        : preferredCurrency}
                    </span>
                  </div>

                  {/* Quick Amount Buttons - amounts are in user's preferred currency */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[100, 250, 500, 1000].map((value) => (
                      <button
                        key={value}
                        onClick={() =>
                          setAmount(
                            inputMode === "crypto"
                              ? (
                                  convertAmount(value, true) / asset.price
                                ).toFixed(8) // Convert user currency to USD, then to crypto
                              : value.toString() // In fiat mode, user enters in their currency
                          )
                        }
                        className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background:
                            "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                          boxShadow:
                            "0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color: "#9ca3af",
                        }}
                      >
                        {currencySymbol}
                        {value}
                      </button>
                    ))}
                  </div>

                  {amount && parseFloat(amount) > 0 && (
                    <div className="text-right text-gray-400">
                      ≈{" "}
                      {inputMode === "crypto"
                        ? formatAmount(usdValue, 2)
                        : `${cryptoAmount.toFixed(8)} ${asset.symbol}`}
                    </div>
                  )}
                </div>

                {/* Preview Card */}
                {amount && parseFloat(amount) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl p-5 overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)",
                      boxShadow:
                        "0 15px 30px -8px rgba(34, 197, 94, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.4) 0%, transparent 60%)",
                      }}
                    />
                    <div className="relative z-10">
                      <p className="text-sm text-gray-300 mb-4 font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Purchase Preview
                      </p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">You're buying</span>
                          <span className="font-bold text-white">
                            {cryptoAmount.toFixed(8)} {asset.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Exchange rate</span>
                          <span className="font-medium text-gray-300">
                            1 {asset.symbol} = {formatAmount(asset.price, 2)}
                          </span>
                        </div>
                        <div
                          className="h-px my-3"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.3) 50%, transparent 100%)",
                          }}
                        />
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-300">
                            Total Cost
                          </span>
                          <span
                            className="font-bold text-2xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                            style={{
                              textShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
                            }}
                          >
                            {formatAmount(usdValue, 2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bottom Action */}
              <div
                className="px-4 py-6 border-t"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  background:
                    "linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, #0f172a 100%)",
                }}
              >
                <button
                  onClick={handleProceedToPayment}
                  disabled={cryptoAmount <= 0}
                  className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background:
                      cryptoAmount <= 0
                        ? "linear-gradient(145deg, #374151 0%, #1f2937 100%)"
                        : "linear-gradient(145deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                    boxShadow:
                      cryptoAmount <= 0
                        ? "0 4px 12px -2px rgba(0, 0, 0, 0.4)"
                        : "0 10px 25px -5px rgba(34, 197, 94, 0.5), 0 6px 12px -3px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {cryptoAmount > 0
                    ? `Buy ${cryptoAmount.toFixed(8)} ${asset.symbol}`
                    : `Buy ${asset.symbol}`}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  By proceeding, you agree to our terms and conditions
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
