"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, AlertCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCryptoMarket } from "@/components/client/CryptoMarketProvider";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import CryptoDropdown from "@/components/client/CryptoDropdown";
import SuccessModal from "@/components/client/SuccessModal";

interface AssetSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    amount: number;
    price: number;
  };
  availableAssets: Array<{
    symbol: string;
    name: string;
    amount: number;
    price: number;
  }>;
}

export default function AssetSwapModal({
  isOpen,
  onClose,
  asset,
  availableAssets,
}: AssetSwapModalProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAsset, setToAsset] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    toAmount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount } = useCurrency();
  const { cryptoPrices } = useCryptoMarket();

  const toAssetData = availableAssets.find((a) => a.symbol === toAsset);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setFromAmount("");
      setToAsset("");
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateToAmount = () => {
    if (!fromAmount || !toAsset || !toAssetData) return 0;
    const amount = parseFloat(fromAmount);
    const fromValue = amount * asset.price;
    const toPrice = toAssetData.price;
    return fromValue / toPrice;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      newErrors.fromAmount = "Please enter a valid amount";
    }

    if (parseFloat(fromAmount) > asset.amount) {
      newErrors.fromAmount = "Insufficient balance";
    }

    if (!toAsset) {
      newErrors.toAsset = "Please select an asset to swap to";
    }

    if (toAsset === asset.symbol) {
      newErrors.toAsset = "Cannot swap to the same asset";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSwap = async () => {
    if (validateForm()) {
      try {
        const fromAmt = parseFloat(fromAmount);
        const toAmt = calculateToAmount();
        const value = fromAmt * asset.price;

        const transaction = {
          id: `swap_${Date.now()}`,
          type: "convert" as const,
          asset: asset.symbol,
          amount: fromAmt,
          value: value,
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: 0,
          method: "Crypto Swap",
          description: `Swap ${fromAmt.toFixed(8)} ${
            asset.symbol
          } to ${toAmt.toFixed(8)} ${toAsset}`,
          toAsset: toAsset,
          toAmount: toAmt,
        };

        addTransaction(transaction);

        const notificationTitle = `Swap Initiated`;
        const notificationMessage = `Swapping ${fromAmt.toFixed(8)} ${
          asset.symbol
        } to ${toAmt.toFixed(8)} ${toAsset} is being processed`;

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
            type: "crypto_conversion",
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
            type: "crypto_conversion",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        setSuccessData({
          fromAsset: asset.symbol,
          toAsset: toAsset,
          fromAmount: fromAmt,
          toAmount: toAmt,
          value: value,
        });
        setShowSuccessModal(true);

        setFromAmount("");
        setToAsset("");
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing swap:", error);
      }
    }
  };

  if (!isOpen) return null;

  const toAmount = calculateToAmount();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)",
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Mobile back button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all z-50 md:hidden"
              style={{
                background:
                  "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Close button - desktop */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 hidden md:flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all z-50"
              style={{
                background:
                  "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-full overflow-y-auto">
              <div className="min-h-full flex flex-col items-center justify-start py-16 px-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="w-full max-w-md"
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background:
                          "linear-gradient(145deg, #9333ea 0%, #ec4899 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(147, 51, 234, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <RefreshCw className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Swap Crypto
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Exchange between assets
                    </p>
                  </div>

                  {/* Main Card */}
                  <div
                    className="rounded-2xl p-5 space-y-5"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {/* From Asset */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        From
                      </label>
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
                          border: "1px solid rgba(147, 51, 234, 0.2)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <CryptoIcon symbol={asset.symbol} size="sm" />
                            <div>
                              <p className="font-bold text-white">
                                {asset.symbol}
                              </p>
                              <p className="text-xs text-gray-400">
                                {asset.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Balance</p>
                            <p className="text-sm font-medium text-white">
                              {asset.amount.toFixed(8)}
                            </p>
                          </div>
                        </div>

                        <input
                          type="number"
                          step="0.00000001"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          placeholder="0.00000000"
                          className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        />

                        <button
                          onClick={() => setFromAmount(asset.amount.toString())}
                          className="text-sm text-purple-400 hover:text-purple-300 font-medium mt-2"
                        >
                          Use Max
                        </button>

                        {fromAmount && parseFloat(fromAmount) > 0 && (
                          <p className="text-sm text-gray-400 mt-2">
                            ≈{" "}
                            {preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency}
                            {convertAmount(
                              parseFloat(fromAmount) * asset.price
                            ).toFixed(2)}
                          </p>
                        )}

                        {errors.fromAmount && (
                          <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.fromAmount}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Swap Arrow */}
                    <div className="flex justify-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          background:
                            "linear-gradient(145deg, #9333ea 0%, #ec4899 100%)",
                        }}
                      >
                        <RefreshCw className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* To Asset */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        To
                      </label>
                      <CryptoDropdown
                        value={toAsset}
                        onChange={setToAsset}
                        options={availableAssets
                          .filter((a) => a.symbol !== asset.symbol)
                          .map((a) => ({
                            symbol: a.symbol,
                            name: a.name,
                            price: a.price,
                          }))}
                        showPrices={true}
                      />

                      {toAsset && toAmount > 0 && (
                        <div
                          className="rounded-xl p-4 mt-3"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
                            border: "1px solid rgba(147, 51, 234, 0.2)",
                          }}
                        >
                          <p className="text-sm text-gray-400 mb-1">
                            You will receive
                          </p>
                          <p className="text-2xl font-bold text-purple-400">
                            {toAmount.toFixed(8)} {toAsset}
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            ≈{" "}
                            {preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency}
                            {convertAmount(
                              toAmount * (toAssetData?.price || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}

                      {errors.toAsset && (
                        <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.toAsset}
                        </p>
                      )}
                    </div>

                    {/* Swap Button */}
                    <button
                      onClick={handleSwap}
                      disabled={!fromAmount || !toAsset}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #9333ea 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(147, 51, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Swap Now
                    </button>

                    <p className="text-xs text-center text-gray-500">
                      No fees for crypto swaps
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="swap"
        asset={successData?.fromAsset || ""}
        amount={successData?.fromAmount.toString() || "0"}
        value={successData?.value.toString() || "0"}
        toAsset={successData?.toAsset}
        toAmount={successData?.toAmount.toString()}
      />
    </>
  );
}
