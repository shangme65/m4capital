"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingDown, AlertCircle } from "lucide-react";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSellAmount("");
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateUSDValue = () => {
    if (!sellAmount) return 0;
    return parseFloat(sellAmount) * asset.price;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      newErrors.sellAmount = "Please enter a valid amount";
    }

    if (parseFloat(sellAmount) > asset.amount) {
      newErrors.sellAmount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSell = async () => {
    if (validateForm()) {
      try {
        const amount = parseFloat(sellAmount);
        const value = calculateUSDValue();

        const transaction = {
          id: `sell_${Date.now()}`,
          type: "sell" as const,
          asset: asset.symbol,
          amount: amount,
          value: value,
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: 0,
          method: "Instant Sale",
          description: `Sold ${amount.toFixed(8)} ${
            asset.symbol
          } for $${value.toFixed(2)}`,
        };

        addTransaction(transaction);

        const notificationTitle = `${asset.symbol} Sold`;
        const notificationMessage = `Successfully sold ${amount.toFixed(8)} ${
          asset.symbol
        } for $${value.toFixed(2)}`;

        addNotification({
          type: "transaction",
          title: notificationTitle,
          message: notificationMessage,
          amount: value,
          asset: asset.symbol,
        });

        // Send email notification
        await fetch("/api/notifications/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "crypto_sale",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        // Send push notification
        await fetch("/api/notifications/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "crypto_sale",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        setSuccessData({
          asset: asset.symbol,
          amount: amount,
          value: value,
        });
        setShowSuccessModal(true);

        setSellAmount("");
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing sale:", error);
      }
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
            className="fixed inset-0 z-50"
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
                    Sell {asset.symbol}
                  </span>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* Available Balance Card */}
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
                        "radial-gradient(ellipse at 30% 0%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)",
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)",
                            boxShadow:
                              "0 4px 12px -2px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <CryptoIcon symbol={asset.symbol} size="sm" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">
                            Available Balance
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {asset.amount.toFixed(8)}
                            <span className="text-gray-400 text-lg ml-1">
                              {asset.symbol}
                            </span>
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
                      <span className="font-semibold text-red-400">
                        {formatAmount(asset.price, 2)}
                      </span>
                    </div>
                  </div>
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
                    Amount to Sell
                  </label>
                  <div className="relative mb-4">
                    <input
                      type="number"
                      step="0.00000001"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      placeholder="0.00000000"
                      className="w-full px-4 py-4 pr-20 rounded-xl text-white text-2xl font-bold focus:outline-none transition-all"
                      style={{
                        background:
                          "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
                        boxShadow:
                          "inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05)",
                        border: errors.sellAmount
                          ? "1px solid rgba(239, 68, 68, 0.5)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      {asset.symbol}
                    </span>
                  </div>

                  {/* Quick sell buttons */}
                  <div className="flex gap-2 mb-4">
                    {quickSellPercentages.map((percent) => (
                      <button
                        key={percent}
                        onClick={() =>
                          setSellAmount(
                            ((asset.amount * percent) / 100).toString()
                          )
                        }
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          background:
                            "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                          boxShadow:
                            "0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          color:
                            sellAmount ===
                            ((asset.amount * percent) / 100).toString()
                              ? "#f87171"
                              : "#9ca3af",
                        }}
                      >
                        {percent}%
                      </button>
                    ))}
                  </div>

                  {errors.sellAmount && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sellAmount}
                    </p>
                  )}

                  {sellAmount &&
                    parseFloat(sellAmount) > 0 &&
                    !errors.sellAmount && (
                      <div className="text-right text-gray-400">
                        ≈ {formatAmount(usdValue, 2)}
                      </div>
                    )}
                </div>

                {/* Preview Card */}
                {sellAmount &&
                  parseFloat(sellAmount) > 0 &&
                  !errors.sellAmount && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-2xl p-5 overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)",
                        boxShadow:
                          "0 15px 30px -8px rgba(239, 68, 68, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      {/* Glow effect */}
                      <div
                        className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 0%, rgba(239, 68, 68, 0.4) 0%, transparent 60%)",
                        }}
                      />
                      <div className="relative z-10">
                        <p className="text-sm text-gray-300 mb-4 font-semibold flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          Sale Preview
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              You're selling
                            </span>
                            <span className="font-bold text-white">
                              {parseFloat(sellAmount).toFixed(8)} {asset.symbol}
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
                                "linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.3) 50%, transparent 100%)",
                            }}
                          />
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-300">
                              You'll receive
                            </span>
                            <span
                              className="font-bold text-2xl bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                              style={{
                                textShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
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
                  onClick={handleSell}
                  disabled={
                    !sellAmount ||
                    parseFloat(sellAmount) <= 0 ||
                    !!errors.sellAmount
                  }
                  className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background:
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      !!errors.sellAmount
                        ? "linear-gradient(145deg, #374151 0%, #1f2937 100%)"
                        : "linear-gradient(145deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
                    boxShadow:
                      !sellAmount ||
                      parseFloat(sellAmount) <= 0 ||
                      !!errors.sellAmount
                        ? "0 4px 12px -2px rgba(0, 0, 0, 0.4)"
                        : "0 10px 25px -5px rgba(239, 68, 68, 0.5), 0 6px 12px -3px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {sellAmount && parseFloat(sellAmount) > 0
                    ? `Sell ${parseFloat(sellAmount).toFixed(8)} ${
                        asset.symbol
                      }`
                    : `Sell ${asset.symbol}`}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  No fees • Instant settlement to balance
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="sell"
        asset={successData?.asset || ""}
        amount={successData?.amount.toString() || "0"}
        value={successData?.value.toString() || "0"}
      />
    </>
  );
}
