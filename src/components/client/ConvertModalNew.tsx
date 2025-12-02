"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";

interface ConvertModalNewProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling constants - CYAN theme for Convert/Swap
const card3DStyle = {
  background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
  boxShadow:
    "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const inputStyle = {
  background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
  boxShadow:
    "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

// Crypto gradient colors
const cryptoGradients: Record<string, string> = {
  BTC: "linear-gradient(145deg, #f7931a 0%, #c77800 100%)",
  ETH: "linear-gradient(145deg, #627eea 0%, #3c4f9a 100%)",
  USDT: "linear-gradient(145deg, #26a17b 0%, #1a7555 100%)",
  LTC: "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
  XRP: "linear-gradient(145deg, #23292f 0%, #1a1e23 100%)",
  TRX: "linear-gradient(145deg, #ff0013 0%, #b3000d 100%)",
  TON: "linear-gradient(145deg, #0098ea 0%, #006bb3 100%)",
  BCH: "linear-gradient(145deg, #8dc351 0%, #5a8033 100%)",
  ETC: "linear-gradient(145deg, #328332 0%, #1f511f 100%)",
  USDC: "linear-gradient(145deg, #2775ca 0%, #1a4d8a 100%)",
};

const cryptoNames: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  XRP: "Ripple",
  TRX: "Tron",
  TON: "Toncoin",
  LTC: "Litecoin",
  BCH: "Bitcoin Cash",
  ETC: "Ethereum Classic",
  USDC: "USD Coin",
  USDT: "Tether",
};

export default function ConvertModalNew({
  isOpen,
  onClose,
}: ConvertModalNewProps) {
  const [convertData, setConvertData] = useState({
    fromAsset: "BTC",
    toAsset: "ETH",
    amount: "",
  });
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    toAsset: string;
    toAmount: number;
    timestamp?: Date;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionFee] = useState(0.5); // 0.5% fee

  const { portfolio, refetch } = usePortfolio();
  const { formatAmount } = useCurrency();
  const { addTransaction, addNotification } = useNotifications();

  // Fetch real-time crypto prices
  const cryptoSymbols = [
    "BTC",
    "ETH",
    "XRP",
    "TRX",
    "TON",
    "LTC",
    "BCH",
    "ETC",
    "USDC",
    "USDT",
  ];
  const cryptoPrices = useCryptoPrices(cryptoSymbols);

  // Calculate available balances from portfolio assets
  const availableBalances =
    portfolio?.portfolio?.assets?.reduce(
      (
        acc: Record<string, number>,
        asset: { symbol: string; amount: number }
      ) => {
        acc[asset.symbol] = asset.amount || 0;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // Handle back button navigation
  const handleBack = useCallback(() => {
    if (step > 1 && step < 4) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      onClose();
    }
  }, [step, onClose]);

  // Handle done function
  const handleDone = useCallback(() => {
    setConvertData({ fromAsset: "BTC", toAsset: "ETH", amount: "" });
    setErrors({});
    setStep(1);
    onClose();
    refetch();
  }, [onClose, refetch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset on close
      setStep(1);
      setConvertData({ fromAsset: "BTC", toAsset: "ETH", amount: "" });
      setSuccessData(null);
      setErrors({});
    }

    // Add mobile back button handler
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      if (step === 4) {
        handleDone();
      } else if (step > 1) {
        setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
        window.history.pushState({ modal: true }, "");
      } else {
        onClose();
      }
    };

    if (isOpen) {
      window.history.pushState({ modal: true }, "");
      window.addEventListener("popstate", handleBackButton);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, step, onClose, handleDone]);

  // Calculate conversion rate
  const getConversionRate = () => {
    const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
    const toPrice = cryptoPrices[convertData.toAsset]?.price || 0;
    if (fromPrice === 0 || toPrice === 0) return 0;
    return fromPrice / toPrice;
  };

  // Calculate receive amount
  const getReceiveAmount = () => {
    if (!convertData.amount) return 0;
    const inputAmount = parseFloat(convertData.amount);
    const rate = getConversionRate();
    const feePercent = conversionFee / 100;
    return inputAmount * rate * (1 - feePercent);
  };

  // Get USD value of the from amount
  const getUsdValue = () => {
    if (!convertData.amount) return 0;
    const inputAmount = parseFloat(convertData.amount);
    const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
    return inputAmount * fromPrice;
  };

  // Swap from and to assets
  const handleSwapAssets = () => {
    setConvertData((prev) => ({
      ...prev,
      fromAsset: prev.toAsset,
      toAsset: prev.fromAsset,
      amount: "",
    }));
  };

  // Validate form
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (convertData.fromAsset === convertData.toAsset) {
        newErrors.general = "Please select different assets to swap";
      }
    } else if (step === 2) {
      const amount = parseFloat(convertData.amount);
      const available = availableBalances[convertData.fromAsset] || 0;

      if (!convertData.amount || amount <= 0) {
        newErrors.amount = "Please enter a valid amount";
      } else if (amount > available) {
        newErrors.amount = `Insufficient ${convertData.fromAsset} balance`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3 | 4);
    }
  };

  // Process conversion
  const handleConvert = async () => {
    if (!validateStep()) return;

    setIsProcessing(true);
    try {
      const cryptoAmount = parseFloat(convertData.amount);
      const receiveAmount = getReceiveAmount();
      const usdValue = getUsdValue();
      const rate = getConversionRate();
      const feeAmount = cryptoAmount * rate * (conversionFee / 100);

      const response = await fetch("/api/crypto/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset: convertData.fromAsset,
          toAsset: convertData.toAsset,
          fromAmount: cryptoAmount,
          toAmount: receiveAmount,
          rate: rate,
          fee: feeAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert assets");
      }

      const transaction = {
        id: `convert_${Date.now()}`,
        type: "convert" as const,
        asset: `${convertData.fromAsset} → ${convertData.toAsset}`,
        amount: cryptoAmount,
        value: usdValue,
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: feeAmount,
        method: "Instant Convert",
        description: `Convert ${cryptoAmount.toFixed(8)} ${
          convertData.fromAsset
        } to ${receiveAmount.toFixed(8)} ${convertData.toAsset}`,
        fromAsset: convertData.fromAsset,
        toAsset: convertData.toAsset,
        rate: rate,
      };

      addTransaction(transaction);

      addNotification({
        type: "transaction",
        title: "Swap Completed",
        message: `Successfully swapped ${cryptoAmount.toFixed(8)} ${
          convertData.fromAsset
        } to ${receiveAmount.toFixed(8)} ${convertData.toAsset}`,
        amount: usdValue,
        asset: convertData.fromAsset,
      });

      setSuccessData({
        asset: convertData.fromAsset,
        amount: cryptoAmount,
        value: usdValue,
        toAsset: convertData.toAsset,
        toAmount: receiveAmount,
        timestamp: new Date(),
      });
      setStep(4);
    } catch (error) {
      console.error("Error processing conversion:", error);
      addNotification({
        type: "warning",
        title: "Swap Failed",
        message:
          error instanceof Error ? error.message : "Failed to process swap",
      });
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const setMaxAmount = () => {
    const maxAvailable = availableBalances[convertData.fromAsset] || 0;
    setConvertData((prev) => ({
      ...prev,
      amount: maxAvailable.toFixed(8),
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="convert-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #0a0f1a 0%, #0d1929 30%, #0f2235 50%, #0d1929 70%, #0a0f1a 100%)",
        }}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        {/* Back Button - Fixed at top left */}
        {step < 4 && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-white/80 hover:text-white transition-all"
            style={{
              background:
                "linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
        )}

        {/* Main content container */}
        <div className="h-full w-full overflow-y-auto py-4 px-3 md:px-6">
          <div className="max-w-lg mx-auto relative z-10">
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-4 mb-4"
              style={card3DStyle}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(145deg, #06b6d4 0%, #14b8a6 100%)",
                    boxShadow: "0 8px 20px -5px rgba(6, 182, 212, 0.5)",
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Swap Crypto</h2>
              </div>

              {/* Progress Steps */}
              {step < 4 && (
                <>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                            step >= s
                              ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/30"
                              : "bg-gray-800/50 text-gray-500"
                          }`}
                          style={step >= s ? {} : inputStyle}
                        >
                          {step > s ? (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            s
                          )}
                        </div>
                        {s < 3 && (
                          <div
                            className={`w-8 h-0.5 rounded-full ${
                              step > s
                                ? "bg-gradient-to-r from-cyan-500 to-teal-500"
                                : "bg-gray-700"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-gray-400 text-xs">
                      {step === 1 && "Select Assets"}
                      {step === 2 && "Enter Amount"}
                      {step === 3 && "Confirm Swap"}
                    </span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Form Content Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4"
              style={card3DStyle}
            >
              {/* Step 1: Select Assets */}
              {step === 1 && (
                <div className="space-y-4">
                  {errors.general && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-red-400 text-sm text-center">
                        {errors.general}
                      </p>
                    </div>
                  )}

                  {/* From Asset Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      From
                    </label>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {cryptoSymbols.map((symbol) => {
                        const balance = availableBalances[symbol] || 0;
                        const price = cryptoPrices[symbol]?.price || 0;
                        return (
                          <button
                            key={symbol}
                            type="button"
                            onClick={() =>
                              setConvertData((prev) => ({
                                ...prev,
                                fromAsset: symbol,
                              }))
                            }
                            className="w-full text-left transition-all duration-300 rounded-xl p-3"
                            style={{
                              background:
                                convertData.fromAsset === symbol
                                  ? "linear-gradient(145deg, rgba(6, 182, 212, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)"
                                  : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                              boxShadow:
                                "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                              border:
                                convertData.fromAsset === symbol
                                  ? "1px solid rgba(6, 182, 212, 0.3)"
                                  : "1px solid rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{
                                    background:
                                      cryptoGradients[symbol] ||
                                      "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                    boxShadow:
                                      "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                                  }}
                                >
                                  <CryptoIcon
                                    symbol={symbol}
                                    className="w-6 h-6 text-white"
                                  />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-white">
                                    {symbol}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    Balance: {balance.toFixed(8)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-gray-400">
                                  {formatAmount(price, 2)}
                                </div>
                                {convertData.fromAsset === symbol && (
                                  <svg
                                    className="w-5 h-5 text-cyan-400 ml-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center py-2">
                    <button
                      onClick={handleSwapAssets}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(145deg, #06b6d4 0%, #14b8a6 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(6, 182, 212, 0.5), inset 0 2px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* To Asset Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      To
                    </label>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {cryptoSymbols
                        .filter((s) => s !== convertData.fromAsset)
                        .map((symbol) => {
                          const price = cryptoPrices[symbol]?.price || 0;
                          return (
                            <button
                              key={symbol}
                              type="button"
                              onClick={() =>
                                setConvertData((prev) => ({
                                  ...prev,
                                  toAsset: symbol,
                                }))
                              }
                              className="w-full text-left transition-all duration-300 rounded-xl p-3"
                              style={{
                                background:
                                  convertData.toAsset === symbol
                                    ? "linear-gradient(145deg, rgba(6, 182, 212, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)"
                                    : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                border:
                                  convertData.toAsset === symbol
                                    ? "1px solid rgba(6, 182, 212, 0.3)"
                                    : "1px solid rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                      background:
                                        cryptoGradients[symbol] ||
                                        "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                      boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                                    }}
                                  >
                                    <CryptoIcon
                                      symbol={symbol}
                                      className="w-6 h-6 text-white"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-white">
                                      {symbol}
                                    </div>
                                    <div className="text-[10px] text-cyan-400">
                                      You will receive
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] text-gray-400">
                                    {formatAmount(price, 2)}
                                  </div>
                                  {convertData.toAsset === symbol && (
                                    <svg
                                      className="w-5 h-5 text-cyan-400 ml-auto"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Exchange Rate Display */}
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          Exchange Rate
                        </div>
                        <div className="text-sm font-bold text-white">
                          1 {convertData.fromAsset} ={" "}
                          {getConversionRate().toFixed(8)} {convertData.toAsset}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(145deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(6, 182, 212, 0.5), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Enter Amount */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Selected Assets Display */}
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              cryptoGradients[convertData.fromAsset] ||
                              "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          }}
                        >
                          <CryptoIcon
                            symbol={convertData.fromAsset}
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <span className="text-white font-medium">
                          {convertData.fromAsset}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              cryptoGradients[convertData.toAsset] ||
                              "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          }}
                        >
                          <CryptoIcon
                            symbol={convertData.toAsset}
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <span className="text-white font-medium">
                          {convertData.toAsset}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Available Balance */}
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs font-medium">
                        Available {convertData.fromAsset}:
                      </span>
                      <span className="text-lg font-bold text-white">
                        {(
                          availableBalances[convertData.fromAsset] || 0
                        ).toFixed(8)}
                      </span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Amount to Swap
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={convertData.amount}
                        onChange={(e) =>
                          setConvertData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="0.00000000"
                        className="w-full rounded-xl p-4 pr-20 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                        style={inputStyle}
                      />
                      <button
                        onClick={setMaxAmount}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                    {errors.amount && (
                      <p className="text-red-400 text-xs mt-2">
                        {errors.amount}
                      </p>
                    )}
                  </div>

                  {/* You Will Receive */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">
                        You Will Receive
                      </span>
                      <span className="text-xs text-gray-500">
                        Fee: {conversionFee}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            cryptoGradients[convertData.toAsset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                        }}
                      >
                        <CryptoIcon
                          symbol={convertData.toAsset}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {getReceiveAmount().toFixed(8)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {convertData.toAsset} ≈{" "}
                          {formatAmount(getUsdValue(), 2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <button
                    onClick={handleNext}
                    disabled={
                      !convertData.amount || parseFloat(convertData.amount) <= 0
                    }
                    className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(145deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(6, 182, 212, 0.5), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    Review Swap
                  </button>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Confirm Swap
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Review your transaction details
                    </p>
                  </div>

                  {/* Swap Summary */}
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                          style={{
                            background:
                              cryptoGradients[convertData.fromAsset] ||
                              "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          }}
                        >
                          <CryptoIcon
                            symbol={convertData.fromAsset}
                            className="w-7 h-7 text-white"
                          />
                        </div>
                        <div className="text-white font-bold">
                          {parseFloat(convertData.amount).toFixed(8)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {convertData.fromAsset}
                        </div>
                      </div>
                      <div className="flex-shrink-0 px-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                          }}
                        >
                          <svg
                            className="w-5 h-5 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                          style={{
                            background:
                              cryptoGradients[convertData.toAsset] ||
                              "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          }}
                        >
                          <CryptoIcon
                            symbol={convertData.toAsset}
                            className="w-7 h-7 text-white"
                          />
                        </div>
                        <div className="text-cyan-400 font-bold">
                          {getReceiveAmount().toFixed(8)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {convertData.toAsset}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 pt-3 border-t border-gray-700/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Exchange Rate</span>
                        <span className="text-white">
                          1 {convertData.fromAsset} ={" "}
                          {getConversionRate().toFixed(8)} {convertData.toAsset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Network Fee</span>
                        <span className="text-white">{conversionFee}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">USD Value</span>
                        <span className="text-white">
                          {formatAmount(getUsdValue(), 2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(145deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(6, 182, 212, 0.5), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Confirm Swap"
                    )}
                  </button>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && successData && (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(145deg, #06b6d4 0%, #14b8a6 100%)",
                      boxShadow: "0 10px 40px rgba(6, 182, 212, 0.5)",
                    }}
                  >
                    <svg
                      className="w-10 h-10 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    Swap Successful!
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Your assets have been exchanged
                  </p>

                  <div
                    className="rounded-xl p-4 mb-6"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              cryptoGradients[successData.asset] ||
                              "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          }}
                        >
                          <CryptoIcon
                            symbol={successData.asset}
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <span className="text-gray-400 text-sm">Sold</span>
                      </div>
                      <span className="text-white font-bold">
                        -{successData.amount.toFixed(8)} {successData.asset}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              cryptoGradients[successData.toAsset] ||
                              "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          }}
                        >
                          <CryptoIcon
                            symbol={successData.toAsset}
                            className="w-5 h-5 text-white"
                          />
                        </div>
                        <span className="text-gray-400 text-sm">Received</span>
                      </div>
                      <span className="text-cyan-400 font-bold">
                        +{successData.toAmount.toFixed(8)} {successData.toAsset}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDone}
                    className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(145deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(6, 182, 212, 0.5), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
