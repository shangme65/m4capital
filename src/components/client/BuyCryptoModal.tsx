"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
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
}

export default function BuyCryptoModal({
  isOpen,
  onClose,
  asset,
  userBalance,
}: BuyCryptoModalProps) {
  const [amount, setAmount] = useState("");
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [inputMode, setInputMode] = useState<"crypto" | "usd">("crypto");
  const { addTransaction, addNotification } = useNotifications();

  const cryptoAmount =
    inputMode === "crypto"
      ? amount
        ? parseFloat(amount)
        : 0
      : amount
      ? parseFloat(amount) / asset.price
      : 0;
  const usdValue =
    inputMode === "usd"
      ? amount
        ? parseFloat(amount)
        : 0
      : cryptoAmount * asset.price;

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
      } for $${usdValue.toFixed(2)}`,
    };

    addTransaction(transaction);

    // Add notification (UI only - API would send email/push if actual purchase)
    addNotification({
      type: "transaction",
      title: `${asset.symbol} Purchase Successful`,
      message: `You have successfully purchased ${cryptoAmount.toFixed(8)} ${
        asset.symbol
      } for $${usdValue.toFixed(2)}`,
      amount: usdValue,
      asset: asset.symbol,
    });

    // Note: Email and push notifications would be sent by the actual purchase API endpoint
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Buy {asset.symbol}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Asset Info */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">{asset.name}</span>
              <span className="text-white font-bold">{asset.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Price</span>
              <span className="text-green-400 font-bold text-lg">
                ${asset.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => {
                setInputMode("crypto");
                setAmount("");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                inputMode === "crypto"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {asset.symbol}
            </button>
            <button
              onClick={() => {
                setInputMode("usd");
                setAmount("");
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                inputMode === "usd"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              USD
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-2 block">
              Amount ({inputMode === "crypto" ? asset.symbol : "USD"})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={
                inputMode === "crypto" ? `0.00 ${asset.symbol}` : "$0.00"
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-2 text-right">
                <span className="text-gray-400 text-sm">≈ </span>
                <span className="text-white font-medium">
                  {inputMode === "crypto"
                    ? `$${usdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `${cryptoAmount.toFixed(8)} ${asset.symbol}`}
                </span>
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[100, 250, 500, 1000].map((value) => (
              <button
                key={value}
                onClick={() =>
                  setAmount(
                    inputMode === "crypto"
                      ? (value / asset.price).toFixed(8)
                      : value.toString()
                  )
                }
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ${value}
              </button>
            ))}
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleProceedToPayment}
            disabled={cryptoAmount <= 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all"
          >
            Proceed to Payment
          </button>

          <p className="text-gray-500 text-xs text-center mt-4">
            By proceeding, you agree to our terms and conditions
          </p>
        </motion.div>
      </motion.div>

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
        />
      )}
    </>
  );
}
