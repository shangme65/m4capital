"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { CURRENCIES } from "@/lib/currencies";
import { sellCryptoAction } from "@/actions/crypto-actions";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling functions - RED theme for Sell
const getCard3DStyle = (isDark: boolean) => ({
  background: isDark
    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
    : "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
  boxShadow: isDark
    ? "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)"
    : "0 8px 30px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
});

const getInputStyle = (isDark: boolean) => ({
  background: isDark
    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)"
    : "linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)",
  boxShadow: isDark
    ? "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.05)"
    : "inset 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 1)",
  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
});

// Crypto gradient colors
const cryptoGradients: Record<string, string> = {
  BTC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  ETH: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  USDT: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  LTC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  XRP: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  TRX: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  TON: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  BCH: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  ETC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  USDC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
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
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const { addTransaction } = useNotifications();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const card3DStyle = getCard3DStyle(isDark);
  const inputStyle = getInputStyle(isDark);

  const availableBalance = portfolio?.portfolio?.balance || 0;
  const [optimisticBalance, setOptimisticBalance] =
    useOptimistic(availableBalance);

  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";

  // Get list of assets user actually owns
  const userAssets = portfolio?.portfolio?.assets || [];
  const availableAssets = userAssets.filter(
    (a: { symbol: string; amount: number }) => (a.amount || 0) > 0
  );

  const cryptoSymbols = availableAssets.map((a: { symbol: string }) => a.symbol);
  const cryptoPrices = useCryptoPrices(cryptoSymbols);

  // Initialize first asset on load
  useEffect(() => {
    if (availableAssets.length > 0 && !sellData.asset) {
      setSellData((prev) => ({ ...prev, asset: availableAssets[0].symbol }));
    }
  }, [availableAssets, sellData.asset]);

  const currentAsset = availableAssets.find(
    (a: { symbol: string }) => a.symbol === sellData.asset
  );
  const currentPrice = cryptoPrices[sellData.asset]?.price || 0;
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

  // Refetch portfolio when modal opens to get latest balance
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

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
    // Validate one more time before sell to prevent bypass
    if (!validateAmount()) {
      setStep(2);
      return;
    }

    // Check if price is valid
    if (!currentPrice || currentPrice <= 0) {
      setErrors({ amount: "Price not available. Please wait for prices to load." });
      setStep(2);
      return;
    }

    const cryptoAmount = getCryptoAmountFromCurrency();
    
    // Validate calculated values
    if (!Number.isFinite(cryptoAmount) || cryptoAmount <= 0) {
      setErrors({ amount: "Invalid calculation. Please try again." });
      setStep(2);
      return;
    }

    const currencyValue = parseFloat(sellData.amount);
    const fee = currencyValue * 0.015;
    const receivedValue = currencyValue - fee; // Amount after fee in preferred currency
    // Convert the received amount to USD for storage
    const usdValue = convertAmount(receivedValue, true); // true = convert FROM preferred TO USD

    startTransition(async () => {
      // Optimistic update: add the received amount to balance (value in preferred currency)
      // Note: This is approximate since balance might be in different currency
      setOptimisticBalance(availableBalance + receivedValue);

      const result = await sellCryptoAction(
        sellData.asset,
        cryptoAmount,
        currentPrice
      );

      if (result.success && result.data) {
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
        await refetch(); // Refresh portfolio data
      } else {
        // Handle error inside transition - set state, don't throw
        setErrors({
          amount: result.error || "Failed to process sale",
        });
        setOptimisticBalance(availableBalance); // Reset optimistic update
        setStep(2);
      }
    });
  };

  const handleDone = () => {
    setSellData({ asset: availableAssets[0]?.symbol || "", amount: "" });
    setErrors({});
    setStep(1);
    onClose();
    refetch();
    window.location.href = "/dashboard";
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
          className="fixed inset-0 z-[10000] overflow-hidden"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #450a0a 50%, #0f172a 75%, #0a0a0f 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #ffffff 25%, #fef2f2 50%, #ffffff 75%, #f8fafc 100%)",
          }}
        >
          {/* Animated background elements - RED theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? "bg-red-500/10" : "bg-red-200/30"} rounded-full blur-3xl animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? "bg-rose-500/10" : "bg-rose-200/30"} rounded-full blur-3xl animate-pulse delay-1000`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? "bg-red-500/5" : "bg-red-100/40"} rounded-full blur-3xl`} />
          </div>

          {/* Back button - top left (hidden on success) */}
          {step !== 4 && (
            <button
              onClick={handleBack}
              className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} rounded-xl transition-all z-50`}
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
                className="rounded-2xl p-3 mb-3"
                style={card3DStyle}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(145deg, #ef4444 0%, #dc2626 100%)",
                      boxShadow: "0 6px 15px -4px rgba(239, 68, 68, 0.5)",
                    }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
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
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Sell Crypto</h2>
                </div>

                {/* Progress Steps */}
                {step < 4 && (
                  <>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] transition-all ${
                              step >= s
                                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm shadow-red-500/30"
                                : isDark ? "bg-gray-800/50 text-gray-500" : "bg-gray-200 text-gray-400"
                            }`}
                            style={step >= s ? {} : inputStyle}
                          >
                            {step > s ? (
                              <svg
                                className="w-3 h-3"
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
                              className={`w-6 h-0.5 rounded-full ${
                                step > s
                                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                                  : isDark ? "bg-gray-700" : "bg-gray-300"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-1">
                      <span className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                          No crypto assets to sell
                        </p>
                        <button
                          onClick={onClose}
                          className={`mt-4 ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"}`}
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <>
                        <label className={`block text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Select Asset to Sell
                        </label>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                          {availableAssets.map(
                            (asset: { symbol: string; amount: number }) => {
                              const price = cryptoPrices[asset.symbol]?.price || 0;
                              const value = asset.amount * price;
                              const changePercent = cryptoPrices[asset.symbol]?.changePercent24h;
                              const isSelected = sellData.asset === asset.symbol;
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
                                  className="w-full text-left transition-all duration-300 rounded-xl px-3 py-1"
                                  style={{
                                    background: isSelected
                                      ? isDark
                                        ? "linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)"
                                        : "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)"
                                      : isDark
                                        ? "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)"
                                        : "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                                    boxShadow: isDark
                                      ? "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                                      : "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                                    border: isSelected
                                      ? "1px solid rgba(239, 68, 68, 0.3)"
                                      : isDark
                                        ? "1px solid rgba(255, 255, 255, 0.05)"
                                        : "1px solid rgba(0, 0, 0, 0.08)",
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Logo */}
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                                      style={{
                                        background: isDark
                                          ? cryptoGradients[asset.symbol] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                                          : "#ffffff",
                                        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                                      }}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={`/crypto/${asset.symbol.toLowerCase()}.svg`}
                                        alt={asset.symbol}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8"
                                      />
                                    </div>

                                    {/* Left text: amount on top, symbol + % on bottom */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                      <div className={`text-base font-bold leading-none ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {asset.amount.toFixed(8)}
                                      </div>
                                      <div className="flex items-baseline gap-1 leading-none mt-0.5">
                                        <span className={`text-xs font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                          {asset.symbol}
                                        </span>
                                        {changePercent !== undefined && (
                                          <span className={`text-xs font-semibold ${changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right: tick on top, fiat value on bottom */}
                                    <div className="flex flex-col items-end justify-between flex-shrink-0" style={{ minHeight: '2.5rem' }}>
                                      <div className="h-4 flex items-center">
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <div className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {formatAmount(value, 2)}
                                      </div>
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
                          className="w-full py-2 text-white rounded-xl font-bold transition-all text-xs disabled:opacity-50"
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
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: isDark
                            ? cryptoGradients[sellData.asset] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                            : "#ffffff",
                          boxShadow: isDark
                            ? "0 4px 12px rgba(0,0,0,0.4)"
                            : "0 3px 10px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                      >
                        <CryptoIcon
                          symbol={sellData.asset}
                          size="lg"
                        />
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          Selling {sellData.asset}
                        </div>
                        <div className={`text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          Price: {formatAmount(currentPrice, 2)}
                        </div>
                      </div>
                    </div>

                    {/* Amount Input - in user's preferred currency */}
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                        className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
                        style={inputStyle}
                        placeholder={`Enter ${preferredCurrency} amount`}
                      />
                      {/* Preset amounts */}
                      <div className="flex gap-1.5 mt-2">
                        {[50, 100, 250, 500].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              setSellData((prev) => ({
                                ...prev,
                                amount: amount.toString(),
                              }))
                            }
                            className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                            style={{
                              background: isDark
                                ? "linear-gradient(145deg, #374151 0%, #1f2937 100%)"
                                : "linear-gradient(145deg, #f3f4f6 0%, #e5e7eb 100%)",
                              boxShadow: isDark
                                ? "0 2px 8px -2px rgba(0, 0, 0, 0.4)"
                                : "0 2px 6px -2px rgba(0, 0, 0, 0.1)",
                              border: isDark
                                ? "1px solid rgba(255, 255, 255, 0.06)"
                                : "1px solid rgba(0, 0, 0, 0.06)",
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
                        className={`text-sm mt-2 font-semibold ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"}`}
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
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            You will sell:
                          </span>
                          <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {getCryptoAmountFromCurrency().toFixed(8)}{" "}
                            {sellData.asset}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            You will receive (after 1.5% fee):
                          </span>
                          <span className={`font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                            {currencySymbol}
                            {(getEstimatedValue() * 0.985).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs ${isDark ? "text-white" : "text-gray-700"}`}
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleContinue}
                        disabled={!sellData.amount}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-white text-xs disabled:opacity-50"
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
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden"
                        style={{
                          background: isDark
                            ? cryptoGradients[sellData.asset] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                            : "#ffffff",
                          boxShadow: isDark
                            ? "0 10px 30px -5px rgba(0, 0, 0, 0.5)"
                            : "0 6px 18px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                      >
                        <CryptoIcon
                          symbol={sellData.asset}
                          size="xl"
                        />
                      </div>
                      <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        You&apos;re selling
                      </p>
                      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {getCryptoAmountFromCurrency().toFixed(8)}
                      </p>
                      <p className={`font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {sellData.asset}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={{
                        background: isDark
                          ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                          : "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                        boxShadow: isDark
                          ? "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                          : "0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                          Price per {sellData.asset}:
                        </span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {formatAmount(currentPrice, 2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Amount:</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {getCryptoAmountFromCurrency().toFixed(8)}{" "}
                          {sellData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Fee (1.5%):</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {currencySymbol}
                          {(getEstimatedValue() * 0.015).toFixed(2)}
                        </span>
                      </div>
                      <hr className={isDark ? "border-gray-700" : "border-gray-200"} />
                      <div className="flex justify-between font-bold">
                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                          You&apos;ll receive:
                        </span>
                        <span className={isDark ? "text-red-400" : "text-red-600"}>
                          {currencySymbol}
                          {(getEstimatedValue() * 0.985).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        disabled={isPending}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs disabled:opacity-50 ${isDark ? "text-white" : "text-gray-700"}`}
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmSell}
                        disabled={isPending}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-white text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {isPending ? (
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

                    <h3 className={`text-xl font-bold text-center ${isDark ? "text-white" : "text-gray-900"}`}>
                      Sale Successful!
                    </h3>
                    <p className={`text-sm text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Asset Sold:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Amount Sold:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {successData.amount.toFixed(8)} {successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Amount Received:</span>
                        <span className={`font-bold ${isDark ? "text-red-400" : "text-red-600"}`}>
                          {currencySymbol}
                          {successData.value.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Date:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Time:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDone}
                      className="w-full py-2 text-xs rounded-xl font-bold text-white"
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
