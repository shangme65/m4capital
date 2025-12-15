"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CURRENCIES } from "@/lib/currencies";
import { buyCryptoAction } from "@/actions/crypto-actions";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling constants - GREEN theme for Buy
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

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const [step, setStep] = useState(1); // 1 = select asset, 2 = enter amount, 3 = confirm, 4 = success
  const [buyData, setBuyData] = useState({
    asset: "BTC",
    amount: "",
  });
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // React 19: useOptimistic for instant UI updates
  const [isPending, startTransition] = useTransition();
  const [optimisticBalance, setOptimisticBalance] = useOptimistic(0);

  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const { addTransaction } = useNotifications();

  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";
  const availableBalance = portfolio?.portfolio?.balance
    ? parseFloat(portfolio.portfolio.balance.toString())
    : 0;
  const balanceCurrency = portfolio?.portfolio?.balanceCurrency || "USD";

  // Format balance display - only convert if currencies don't match
  const formatBalanceDisplay = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      return `${currencySymbol}${balance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Different currencies - convert using formatAmount (USD to preferred)
    return formatAmount(balance, 2);
  };

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

  const getCurrentPrice = () => cryptoPrices[buyData.asset]?.price || 0;

  const getEstimatedCrypto = () => {
    if (!buyData.amount) return 0;
    const inputAmount = parseFloat(buyData.amount);
    const price = getCurrentPrice();
    const usdAmount = convertAmount(inputAmount, true);
    return usdAmount / price;
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
      setBuyData({ asset: "BTC", amount: "" });
      setSuccessData(null);
      setErrors({});
    }

    // Add mobile back button handler
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

    if (isOpen) {
      window.history.pushState({ modal: true }, "");
      window.addEventListener("popstate", handleBackButton);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, onClose, step]);

  const validateAmount = () => {
    const newErrors: { [key: string]: string } = {};
    const inputAmount = parseFloat(buyData.amount);
    const price = getCurrentPrice();
    const usdCost = convertAmount(inputAmount, true);
    const totalCost = usdCost * 1.015;

    if (!buyData.amount || inputAmount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (totalCost > availableBalance) {
      newErrors.amount = "Insufficient balance";
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

  const confirmBuy = async () => {
    try {
      const price = getCurrentPrice();
      const inputAmount = parseFloat(buyData.amount);
      const usdValue = convertAmount(inputAmount, true);
      const assetAmount = usdValue / price;

      // React 19: Show optimistic update immediately
      setOptimisticBalance(availableBalance - usdValue);

      // Use Server Action with transition
      startTransition(async () => {
        const result = await buyCryptoAction(buyData.asset, assetAmount, price);

        if (result.success && result.data) {
          // Add to local transaction list
          addTransaction({
            type: "buy" as const,
            asset: buyData.asset,
            amount: assetAmount,
            value: usdValue,
            timestamp: new Date().toLocaleString(),
            status: "completed" as const,
            fee: usdValue * 0.015,
            method: `${preferredCurrency} Balance`,
            description: `Market buy order for ${buyData.asset}`,
            rate: price,
          });

          setSuccessData({
            asset: buyData.asset,
            amount: assetAmount,
            value: usdValue,
          });
          setStep(4);
        } else {
          throw new Error(result.error || "Failed to process purchase");
        }
      });
    } catch (error) {
      setErrors({
        amount: error instanceof Error ? error.message : "Purchase failed",
      });
      setStep(2);
    }
  };

  const handleDone = () => {
    setBuyData({ asset: "BTC", amount: "" });
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
          key="buy-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #052e16 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background elements - GREEN theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />
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
                        "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)",
                      boxShadow: "0 8px 20px -5px rgba(34, 197, 94, 0.5)",
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
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Buy Crypto</h2>
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
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30"
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
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
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
                          Available Balance:
                        </span>
                        <span className="text-lg font-bold text-white">
                          {formatBalanceDisplay(availableBalance)}
                        </span>
                      </div>
                    </div>

                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Select Cryptocurrency
                    </label>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {cryptoSymbols.map((symbol) => {
                        const price = cryptoPrices[symbol]?.price || 0;
                        return (
                          <button
                            key={symbol}
                            type="button"
                            onClick={() =>
                              setBuyData((prev) => ({ ...prev, asset: symbol }))
                            }
                            className="w-full text-left transition-all duration-300 rounded-xl p-3"
                            style={{
                              background:
                                buyData.asset === symbol
                                  ? "linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)"
                                  : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                              boxShadow:
                                "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                              border:
                                buyData.asset === symbol
                                  ? "1px solid rgba(34, 197, 94, 0.3)"
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
                                    {formatAmount(price, 2)}
                                  </div>
                                </div>
                              </div>
                              {buyData.asset === symbol && (
                                <svg
                                  className="w-5 h-5 text-green-400"
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
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleContinue}
                      className="w-full py-3 text-white rounded-xl font-bold transition-all text-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Continue
                    </button>
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
                          "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            cryptoGradients[buyData.asset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        }}
                      >
                        <CryptoIcon
                          symbol={buyData.asset}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Buying {buyData.asset}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Price: {formatAmount(getCurrentPrice(), 2)}
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        Amount ({preferredCurrency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={buyData.amount}
                          onChange={(e) =>
                            setBuyData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl px-4 py-3 pl-8 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50"
                          style={inputStyle}
                          placeholder="0.00"
                        />
                      </div>
                      {/* Quick amounts */}
                      <div className="flex gap-2 mt-2">
                        {[50, 100, 250, 500].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              setBuyData((prev) => ({
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
                    </div>

                    {/* You will receive */}
                    {buyData.amount && (
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">
                            You will receive:
                          </span>
                          <span className="text-green-400 font-bold">
                            {getEstimatedCrypto().toFixed(8)} {buyData.asset}
                          </span>
                        </div>
                      </div>
                    )}

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
                          Available Balance:
                        </span>
                        <span className="text-lg font-bold text-white">
                          {formatBalanceDisplay(availableBalance)}
                        </span>
                      </div>
                    </div>

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
                        disabled={!buyData.amount}
                        className="flex-1 py-3 px-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
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
                            cryptoGradients[buyData.asset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        <CryptoIcon
                          symbol={buyData.asset}
                          className="w-8 h-8 text-white"
                        />
                      </div>
                      <p className="text-gray-400 text-xs mb-1">
                        You&apos;re buying
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {getEstimatedCrypto().toFixed(8)}
                      </p>
                      <p className="text-green-400 font-semibold">
                        {buyData.asset}
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
                          Price per {buyData.asset}:
                        </span>
                        <span className="text-white font-medium">
                          {formatAmount(getCurrentPrice(), 2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-medium">
                          {currencySymbol}
                          {parseFloat(buyData.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Fee (1.5%):</span>
                        <span className="text-white font-medium">
                          {currencySymbol}
                          {(parseFloat(buyData.amount) * 0.015).toFixed(2)}
                        </span>
                      </div>
                      <hr className="border-gray-700" />
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-300">Total Cost:</span>
                        <span className="text-green-400">
                          {currencySymbol}
                          {(parseFloat(buyData.amount) * 1.015).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        disabled={isPending}
                        className="flex-1 py-3 px-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmBuy}
                        disabled={isPending}
                        className="flex-1 py-3 px-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
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
                          "Confirm Purchase"
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
                            "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)",
                          boxShadow: "0 10px 40px -10px rgba(34, 197, 94, 0.6)",
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
                      Purchase Successful!
                    </h3>
                    <p className="text-gray-400 text-sm text-center">
                      Your order has been completed
                    </p>

                    <div
                      className="rounded-xl p-4 space-y-2"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Asset:</span>
                        <span className="text-white font-semibold">
                          {successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount Received:</span>
                        <span className="text-white font-semibold">
                          {successData.amount.toFixed(8)} {successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Paid:</span>
                        <span className="text-green-400 font-bold">
                          {formatAmount(successData.value * 1.015, 2)}
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
                          "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
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
