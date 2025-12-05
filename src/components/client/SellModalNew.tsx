"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { CURRENCIES } from "@/lib/currencies";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling constants - RED theme for Sell
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

export default function SellModal({ isOpen, onClose }: SellModalProps) {
  const [step, setStep] = useState(1); // 1 = select asset, 2 = enter amount, 3 = confirm, 4 = success
  const [sellData, setSellData] = useState({
    asset: "",
    amount: "",
  });
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [assetPrices, setAssetPrices] = useState<Record<string, number>>({});

  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const { addTransaction } = useNotifications();

  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";

  // Get list of assets user actually owns
  const userAssets = portfolio?.portfolio?.assets || [];
  const availableAssets = userAssets.filter(
    (a: { symbol: string; amount: number }) => (a.amount || 0) > 0
  );

  // Initialize first asset on load
  useEffect(() => {
    if (availableAssets.length > 0 && !sellData.asset) {
      setSellData((prev) => ({ ...prev, asset: availableAssets[0].symbol }));
    }
  }, [availableAssets, sellData.asset]);

  // Fetch real-time prices
  useEffect(() => {
    if (!isOpen || availableAssets.length === 0) return;

    const fetchPrices = async () => {
      try {
        const symbols = availableAssets
          .map((a: { symbol: string }) => a.symbol)
          .join(",");
        const response = await fetch(`/api/crypto/prices?symbols=${symbols}`);
        const data = await response.json();
        const priceMap: Record<string, number> = {};
        if (data.prices && Array.isArray(data.prices)) {
          data.prices.forEach(
            (priceData: { symbol: string; price: number }) => {
              priceMap[priceData.symbol] = priceData.price;
            }
          );
        }
        setAssetPrices(priceMap);
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [availableAssets, isOpen]);

  const currentAsset = availableAssets.find(
    (a: { symbol: string }) => a.symbol === sellData.asset
  );
  const currentPrice = assetPrices[sellData.asset] || 0;
  const currentBalance = currentAsset?.amount || 0;

  // Amount input is now in user's preferred currency
  // This calculates how much crypto they will sell based on EUR/USD input
  const getCryptoAmountFromCurrency = () => {
    if (!sellData.amount || !currentPrice) return 0;
    const currencyAmount = parseFloat(sellData.amount);
    // Convert from preferred currency to USD, then to crypto
    const usdAmount = convertAmount(currencyAmount, true); // true = convert FROM preferred TO USD
    return usdAmount / currentPrice;
  };

  const getEstimatedValue = () => {
    if (!sellData.amount) return 0;
    // The input is already in preferred currency, so just return it
    return parseFloat(sellData.amount);
  };

  // Handle back button navigation
  const handleBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset on close
      setStep(1);
      setSellData((prev) => ({
        asset: prev.asset || "",
        amount: "",
      }));
      setSuccessData(null);
      setErrors({});
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle mobile back button separately
  useEffect(() => {
    if (!isOpen) return;

    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      if (step === 4) {
        handleDone();
      } else if (step > 1) {
        setStep((prev) => prev - 1);
        window.history.pushState({ modal: true }, "");
      } else {
        onClose();
      }
    };

    window.history.pushState({ modal: true }, "");
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, step, onClose]);

  const validateAmount = () => {
    const newErrors: { [key: string]: string } = {};
    const inputAmount = parseFloat(sellData.amount);
    const cryptoAmount = getCryptoAmountFromCurrency();

    if (!sellData.amount || inputAmount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (cryptoAmount > currentBalance) {
      newErrors.amount = `Insufficient balance. Max: ${currencySymbol}${convertAmount(
        currentBalance * currentPrice
      ).toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateAmount()) {
        setStep(3);
      }
    }
  };

  const confirmSell = async () => {
    setLoading(true);
    try {
      const cryptoAmount = getCryptoAmountFromCurrency();
      const currencyValue = parseFloat(sellData.amount);
      const fee = currencyValue * 0.015;
      const receivedValue = currencyValue - fee; // Amount after fee in preferred currency
      // Convert the received amount to USD for storage
      const usdValue = convertAmount(receivedValue, true); // true = convert FROM preferred TO USD

      const response = await fetch("/api/crypto/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sellData.asset,
          amount: cryptoAmount,
          price: currentPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process sale");
      }

      // Store the received value (after fee) in USD
      addTransaction({
        type: "sell" as const,
        asset: sellData.asset,
        amount: cryptoAmount,
        value: usdValue, // This is the received amount after fee in USD
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: convertAmount(fee, true), // Store fee in USD
        method: `${preferredCurrency} Balance`,
        description: `Market sell order for ${sellData.asset}`,
        rate: currentPrice,
      });

      setSuccessData({
        asset: sellData.asset,
        amount: cryptoAmount,
        value: receivedValue, // Store in preferred currency for display
      });
      setStep(4);
    } catch (error) {
      setErrors({
        amount: error instanceof Error ? error.message : "Sale failed",
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSellData({ asset: availableAssets[0]?.symbol || "", amount: "" });
    setErrors({});
    setStep(1);
    onClose();
    refetch();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sell-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #450a0a 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background elements - RED theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
          </div>

          {/* Back button - top left (hidden on success) */}
          {step !== 4 && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all z-50"
              style={card3DStyle}
              aria-label="Back"
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
                        "linear-gradient(145deg, #ef4444 0%, #dc2626 100%)",
                      boxShadow: "0 8px 20px -5px rgba(239, 68, 68, 0.5)",
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
                        d="M17 13l-5 5m0 0l-5-5m5 5V6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Sell Crypto</h2>
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
                                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
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
                                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                                  : "bg-gray-700"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-2">
                      <span className="text-gray-400 text-xs">
                        {step === 1 && "Select Asset"}
                        {step === 2 && "Enter Amount"}
                        {step === 3 && "Confirm"}
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
                {/* Step 1: Select Asset */}
                {step === 1 && (
                  <div className="space-y-4">
                    {availableAssets.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">
                          No crypto assets to sell
                        </p>
                        <button
                          onClick={onClose}
                          className="mt-4 text-red-400 hover:text-red-300"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Select Asset to Sell
                        </label>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                          {availableAssets.map(
                            (asset: { symbol: string; amount: number }) => {
                              const price = assetPrices[asset.symbol] || 0;
                              const value = asset.amount * price;
                              return (
                                <button
                                  key={asset.symbol}
                                  type="button"
                                  onClick={() =>
                                    setSellData((prev) => ({
                                      ...prev,
                                      asset: asset.symbol,
                                    }))
                                  }
                                  className="w-full text-left transition-all duration-300 rounded-xl p-3"
                                  style={{
                                    background:
                                      sellData.asset === asset.symbol
                                        ? "linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)"
                                        : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                    boxShadow:
                                      "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                    border:
                                      sellData.asset === asset.symbol
                                        ? "1px solid rgba(239, 68, 68, 0.3)"
                                        : "1px solid rgba(255, 255, 255, 0.05)",
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                          background:
                                            cryptoGradients[asset.symbol] ||
                                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                          boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                                        }}
                                      >
                                        <CryptoIcon
                                          symbol={asset.symbol}
                                          className="w-6 h-6 text-white"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-white">
                                          {asset.symbol}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                          {asset.amount.toFixed(6)} available
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-right">
                                        <div className="text-sm font-semibold text-white">
                                          {formatAmount(value, 2)}
                                        </div>
                                      </div>
                                      {sellData.asset === asset.symbol && (
                                        <svg
                                          className="w-5 h-5 text-red-400"
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
                            }
                          )}
                        </div>

                        <button
                          onClick={handleContinue}
                          disabled={!sellData.asset}
                          className="w-full py-3 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50"
                          style={{
                            background:
                              "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          Continue
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Enter Amount */}
                {step === 2 && (
                  <div className="space-y-4">
                    {errors.amount && (
                      <div
                        className="rounded-xl p-3 text-red-400 text-sm"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        {errors.amount}
                      </div>
                    )}

                    {/* Selected Asset Display */}
                    <div
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            cryptoGradients[sellData.asset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        }}
                      >
                        <CryptoIcon
                          symbol={sellData.asset}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Selling {sellData.asset}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Price: {formatAmount(currentPrice, 2)}
                        </div>
                      </div>
                    </div>

                    {/* Amount Input - in user's preferred currency */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        Amount ({preferredCurrency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={sellData.amount}
                        onChange={(e) =>
                          setSellData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        style={inputStyle}
                        placeholder={`Enter ${preferredCurrency} amount`}
                      />
                      {/* Preset amounts */}
                      <div className="flex gap-2 mt-2">
                        {[50, 100, 250, 500].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              setSellData((prev) => ({
                                ...prev,
                                amount: amount.toString(),
                              }))
                            }
                            className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 hover:text-white transition-all"
                            style={{
                              background:
                                "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                              boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            {currencySymbol}
                            {amount}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          // Calculate max value in preferred currency
                          const maxValue = convertAmount(
                            currentBalance * currentPrice
                          );
                          setSellData((prev) => ({
                            ...prev,
                            amount: maxValue.toFixed(2),
                          }));
                        }}
                        className="text-red-400 text-sm mt-2 hover:text-red-300 font-semibold"
                      >
                        Sell All ({currentBalance.toFixed(6)} {sellData.asset})
                      </button>
                    </div>

                    {/* Crypto amount and You will receive */}
                    {sellData.amount && parseFloat(sellData.amount) > 0 && (
                      <div
                        className="rounded-xl p-3 space-y-2"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            You will sell:
                          </span>
                          <span className="text-white font-bold">
                            {getCryptoAmountFromCurrency().toFixed(8)}{" "}
                            {sellData.asset}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            You will receive (after 1.5% fee):
                          </span>
                          <span className="text-red-400 font-bold">
                            {currencySymbol}
                            {(getEstimatedValue() * 0.985).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        className="flex-1 py-3 px-3 rounded-xl font-semibold text-white text-sm"
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleContinue}
                        disabled={!sellData.amount}
                        className="flex-1 py-3 px-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{
                          background:
                            cryptoGradients[sellData.asset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        <CryptoIcon
                          symbol={sellData.asset}
                          className="w-8 h-8 text-white"
                        />
                      </div>
                      <p className="text-gray-400 text-xs mb-1">
                        You&apos;re selling
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {getCryptoAmountFromCurrency().toFixed(8)}
                      </p>
                      <p className="text-red-400 font-semibold">
                        {sellData.asset}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          Price per {sellData.asset}:
                        </span>
                        <span className="text-white font-medium">
                          {formatAmount(currentPrice, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-medium">
                          {getCryptoAmountFromCurrency().toFixed(8)}{" "}
                          {sellData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Fee (1.5%):</span>
                        <span className="text-white font-medium">
                          {currencySymbol}
                          {(getEstimatedValue() * 0.015).toFixed(2)}
                        </span>
                      </div>
                      <hr className="border-gray-700" />
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-300">
                          You&apos;ll receive:
                        </span>
                        <span className="text-red-400">
                          {currencySymbol}
                          {(getEstimatedValue() * 0.985).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        disabled={loading}
                        className="flex-1 py-3 px-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmSell}
                        disabled={loading}
                        className="flex-1 py-3 px-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          "Confirm Sale"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && successData && (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(145deg, #ef4444 0%, #dc2626 100%)",
                          boxShadow: "0 10px 40px -10px rgba(239, 68, 68, 0.6)",
                        }}
                      >
                        <motion.svg
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      </motion.div>
                    </div>

                    <h3 className="text-xl font-bold text-white text-center">
                      Sale Successful!
                    </h3>
                    <p className="text-gray-400 text-sm text-center">
                      Your order has been completed
                    </p>

                    <div
                      className="rounded-xl p-4 space-y-2"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Asset Sold:</span>
                        <span className="text-white font-semibold">
                          {successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount Sold:</span>
                        <span className="text-white font-semibold">
                          {successData.amount.toFixed(8)} {successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount Received:</span>
                        <span className="text-red-400 font-bold">
                          {currencySymbol}
                          {successData.value.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white font-semibold">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white font-semibold">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDone}
                      className="w-full py-3 rounded-xl font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
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
      )}
    </AnimatePresence>
  );
}
