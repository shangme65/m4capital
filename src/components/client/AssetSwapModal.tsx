"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ArrowDownUp,
  ArrowUpDown,
  Info,
  Search,
  TrendingUp,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fromAmount, setFromAmount] = useState("");
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("crypto");
  const [toAsset, setToAsset] = useState("");
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [successData, setSuccessData] = useState<{
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    toAmount: number;
    value: number;
    toValue: number;
    timestamp?: Date;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { addTransaction, addNotification, refetchTransactions } =
    useNotifications();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const [conversionFee] = useState(0.5); // 0.5% fee
  const [userCountry, setUserCountry] = useState<string>("US");

  const toAssetData = availableAssets.find((a) => a.symbol === toAsset);

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
    if (!fromAmount) return "";
    const value = parseFloat(fromAmount);
    if (isNaN(value)) return "";

    if (inputMode === "crypto") {
      return fromAmount;
    } else {
      // Convert fiat to USD then to crypto
      const usdValue = convertAmount(value, true);
      const cryptoAmount = usdValue / asset.price;
      return cryptoAmount.toString();
    }
  };

  // 3D card styling - Cyan theme
  const card3DStyle = {
    background:
      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
    boxShadow:
      "0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 15px 30px -8px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  };

  const inputStyle = {
    background:
      "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    boxShadow:
      "inset 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(6, 182, 212, 0.2)",
  };

  // Filter assets based on search
  const filteredAssets = availableAssets.filter(
    (a) =>
      a.symbol !== asset.symbol &&
      (a.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
        a.name.toLowerCase().includes(assetSearch.toLowerCase()))
  );

  // Handle back navigation
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 1) {
      onClose();
    }
  };

  // Android back button support
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (step === 4) {
        handleDone();
      } else {
        handleBack();
      }
    };

    window.history.pushState({ modal: "swap" }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, step, handleBack]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
      setStep(1);
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      setFromAmount("");
      setInputMode("crypto");
      setToAsset("");
      setErrors({});
      setShowToDropdown(false);
      setAssetSearch("");
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  // Fetch user country for date/time localization
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          const countryMap: { [key: string]: string } = {
            "United States": "US",
            "United Kingdom": "GB",
            Germany: "DE",
            France: "FR",
            Spain: "ES",
            Italy: "IT",
            Canada: "CA",
            Australia: "AU",
            Netherlands: "NL",
            Belgium: "BE",
            Portugal: "PT",
            Ireland: "IE",
          };
          setUserCountry(countryMap[data.country] || "US");
        }
      } catch (error) {
        console.error("Error fetching user country:", error);
      }
    };
    fetchUserCountry();
  }, []);

  const getLocalizedDateTime = (date: Date) => {
    const locale =
      userCountry === "GB"
        ? "en-GB"
        : userCountry === "DE"
        ? "de-DE"
        : userCountry === "FR"
        ? "fr-FR"
        : "en-US";
    const dateStr = date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: userCountry === "US",
    });
    return { date: dateStr, time: timeStr };
  };

  const getConversionRate = () => {
    if (!toAssetData) return 0;
    if (asset.symbol === toAsset) return 1;
    return asset.price / toAssetData.price;
  };

  const getEstimatedReceiveAmount = () => {
    if (!fromAmount || !toAssetData) return 0;
    const cryptoAmount = parseFloat(getCryptoAmount());
    const rate = getConversionRate();
    const gross = cryptoAmount * rate;
    const fee = gross * (conversionFee / 100);
    return gross - fee;
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!toAsset) {
      newErrors.toAsset = "Please select an asset to swap to";
    }

    if (toAsset === asset.symbol) {
      newErrors.toAsset = "Cannot swap to the same asset";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      newErrors.fromAmount = "Please enter a valid amount";
    }

    const cryptoAmount = parseFloat(getCryptoAmount());
    if (cryptoAmount > asset.amount) {
      newErrors.fromAmount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleContinueStep2 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const confirmSwap = async () => {
    setIsProcessing(true);
    try {
      const fromAmt = parseFloat(getCryptoAmount());
      const toAmt = getEstimatedReceiveAmount();
      const value = fromAmt * asset.price;
      const rate = getConversionRate();
      const feeAmount = fromAmt * rate * (conversionFee / 100);
      const fromPriceUSD = asset.price;
      const toPriceUSD = toAssetData?.price || 0;

      // Call API to process swap
      const portfolioResponse = await fetch("/api/crypto/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset: asset.symbol,
          toAsset: toAsset,
          amount: fromAmt,
          rate: rate,
          fromPriceUSD,
          toPriceUSD,
        }),
      });

      if (!portfolioResponse.ok) {
        const errorData = await portfolioResponse.json();
        throw new Error(errorData.error || "Failed to swap assets");
      }

      const transaction = {
        id: `swap_${Date.now()}`,
        type: "convert" as const,
        asset: `${asset.symbol} → ${toAsset}`,
        amount: fromAmt,
        value: value,
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: feeAmount,
        method: "Instant Swap",
        description: `Swap ${fromAmt.toFixed(8)} ${
          asset.symbol
        } to ${toAmt.toFixed(8)} ${toAsset}`,
        fromAsset: asset.symbol,
        toAsset: toAsset,
        rate: rate,
      };

      addTransaction(transaction);

      const notificationTitle = "Swap Completed";
      const notificationMessage = `Successfully swapped ${fromAmt.toFixed(8)} ${
        asset.symbol
      } to ${toAmt.toFixed(8)} ${toAsset}`;

      // Convert USD value to user's preferred currency for notification display
      const displayAmount = convertAmount(value);

      addNotification({
        type: "transaction",
        title: notificationTitle,
        message: notificationMessage,
        amount: Math.round(displayAmount * 100) / 100,
        asset: preferredCurrency,
      });

      setSuccessData({
        fromAsset: asset.symbol,
        toAsset: toAsset,
        fromAmount: fromAmt,
        toAmount: toAmt,
        value: value,
        toValue: toAmt * (toAssetData?.price || 0),
        timestamp: new Date(),
      });
      setStep(4);
    } catch (error) {
      console.error("Error processing swap:", error);
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

  const handleDone = () => {
    setFromAmount("");
    setToAsset("");
    setErrors({});
    setStep(1);
    onClose();
    refetchTransactions();
    // Reload page to show updated balance and transaction history
    window.location.reload();
  };

  const setMaxAmount = () => {
    if (inputMode === "crypto") {
      setFromAmount(asset.amount.toFixed(8));
    } else {
      // Convert max crypto to fiat
      const usdValue = asset.amount * asset.price;
      const fiatValue = convertAmount(usdValue);
      setFromAmount(fiatValue.toFixed(2));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="asset-swap-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={step === 4 ? handleDone : onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {step !== 4 && (
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  background: "rgba(30, 41, 59, 0.5)",
                }}
              >
                <button
                  onClick={handleBack}
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
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span className="text-lg font-bold text-white">
                    Swap {asset.symbol}
                  </span>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{
                        backgroundColor:
                          step >= s
                            ? "rgb(6, 182, 212)"
                            : "rgba(6, 182, 212, 0.3)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Step 1: Select To Asset */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {/* Header - Compact */}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-3">
                      Select asset to receive
                    </p>
                  </div>

                  {errors.toAsset && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs text-center">
                        {errors.toAsset}
                      </p>
                    </div>
                  )}

                  {/* From Asset Display - Compact */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      From
                    </label>
                    <div
                      className="rounded-lg p-3"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={asset.symbol} size="xs" />
                        <div className="text-left flex-1">
                          <div className="text-white text-sm font-medium">
                            {asset.name} <span className="text-gray-400 text-xs">({asset.symbol})</span>
                          </div>
                          <div className="text-gray-400 text-xs">
                            Balance: {asset.amount.toFixed(8)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swap Icon - Compact */}
                  <div className="flex justify-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(6, 182, 212, 0.2)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                      }}
                    >
                      <ArrowDownUp className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

                  {/* To Asset Selection - Compact */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      To
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="w-full rounded-lg p-3 flex items-center justify-between transition-all"
                        style={{
                          background: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(6, 182, 212, 0.2)",
                        }}
                      >
                        {toAsset ? (
                          <div className="flex items-center gap-2">
                            <CryptoIcon symbol={toAsset} size="xs" />
                            <div className="text-left">
                              <div className="text-white text-sm font-medium">
                                {availableAssets.find((a) => a.symbol === toAsset)?.name}{" "}
                                <span className="text-gray-400 text-xs">({toAsset})</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Select asset...</span>
                        )}
                        <ChevronDown
                          className={`text-gray-400 transition-transform w-4 h-4 ${
                            showToDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {showToDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-cyan-500/20 shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto"
                          >
                            <div className="p-2 border-b border-slate-700">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                  type="text"
                                  placeholder="Search assets..."
                                  value={assetSearch}
                                  onChange={(e) =>
                                    setAssetSearch(e.target.value)
                                  }
                                  className="w-full bg-slate-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                              </div>
                            </div>
                            {filteredAssets.map((a) => (
                              <button
                                key={a.symbol}
                                onClick={() => {
                                  setToAsset(a.symbol);
                                  setShowToDropdown(false);
                                  setAssetSearch("");
                                }}
                                className={`w-full p-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${
                                  toAsset === a.symbol ? "bg-cyan-500/20" : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                                  <CryptoIcon symbol={a.symbol} size="sm" />
                                </div>
                                <div className="text-left flex-1">
                                  <div className="text-white text-sm font-medium">
                                    {a.name}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {a.symbol}
                                  </div>
                                </div>
                                {toAsset === a.symbol && (
                                  <Check className="w-4 h-4 text-cyan-400" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Exchange Rate Preview - Compact */}
                  {toAsset && (
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">Rate</span>
                        <span className="text-white text-xs font-medium">
                          1 {asset.symbol} = {getConversionRate().toFixed(8)} {toAsset}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Bottom Action for Step 1 */}
              {step === 1 && (
                <div
                  className="px-4 py-3 border-t"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    background: "rgba(15, 23, 42, 0.9)",
                  }}
                >
                  <button
                    onClick={handleContinueStep1}
                    disabled={!toAsset}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
                      boxShadow: "0 4px 12px -2px rgba(6, 182, 212, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Enter Amount - Compact */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {/* Header - Compact */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CryptoIcon symbol={asset.symbol} size="xs" />
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                      <CryptoIcon symbol={toAsset} size="xs" />
                    </div>
                    <p className="text-gray-400 text-xs">
                      How much {asset.symbol} to swap?
                    </p>
                  </div>

                  {/* Amount Input - Compact */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-gray-400">
                        Amount
                      </label>
                      <button
                        onClick={setMaxAmount}
                        className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors font-medium"
                      >
                        Max
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step={inputMode === "crypto" ? "0.00000001" : "0.01"}
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        className="w-full rounded-lg px-3 py-3 pr-20 text-white text-lg font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{
                          background: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(6, 182, 212, 0.2)",
                        }}
                        placeholder={
                          inputMode === "crypto"
                            ? "0.00000000"
                            : `${getCurrencySymbol()}0.00`
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentValue = parseFloat(fromAmount);
                          if (!isNaN(currentValue) && currentValue > 0) {
                            if (inputMode === "crypto") {
                              // Convert crypto to fiat
                              const usdValue = currentValue * asset.price;
                              const fiatValue = convertAmount(usdValue);
                              setFromAmount(fiatValue.toFixed(2));
                            } else {
                              // Convert fiat to crypto
                              const usdValue = convertAmount(currentValue, true);
                              const cryptoValue = usdValue / asset.price;
                              setFromAmount(cryptoValue.toFixed(8));
                            }
                          }
                          setInputMode(inputMode === "crypto" ? "fiat" : "crypto");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-medium transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>{inputMode === "crypto" ? asset.symbol : preferredCurrency}</span>
                      </button>
                    </div>
                    {errors.fromAmount && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {errors.fromAmount}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-gray-500 text-xs">
                        Available: {asset.amount.toFixed(8)} {asset.symbol}
                      </p>
                      {fromAmount && parseFloat(fromAmount) > 0 && (
                        <p className="text-cyan-400 text-xs">
                          {inputMode === "crypto"
                            ? `≈ ${formatAmount(parseFloat(fromAmount) * asset.price, 2)}`
                            : `≈ ${(parseFloat(getCryptoAmount())).toFixed(8)} ${asset.symbol}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* You Will Receive */}
                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <div
                      className="mb-6 p-4 rounded-xl"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      <div className="text-gray-400 text-sm mb-2">
                        You will receive
                      </div>
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={toAsset} size="md" />
                        <span className="text-2xl font-bold text-cyan-400">
                          {getEstimatedReceiveAmount().toFixed(8)}
                        </span>
                        <span className="text-gray-400">{toAsset}</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Summary */}
                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <div
                      className="mb-6 p-4 rounded-xl"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-300 text-sm font-medium">
                          Swap Summary
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Exchange Rate</span>
                          <span className="text-white">
                            1 {asset.symbol} = {getConversionRate().toFixed(8)}{" "}
                            {toAsset}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Fee ({conversionFee}%)
                          </span>
                          <span className="text-white">
                            {(
                              parseFloat(getCryptoAmount() || "0") *
                              getConversionRate() *
                              (conversionFee / 100)
                            ).toFixed(8)}{" "}
                            {toAsset}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueStep2}
                    disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.button>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <div
                      className="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                      }}
                    >
                      <RefreshCw className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-base font-bold text-white mb-0.5">
                      Confirm Swap
                    </h2>
                    <p className="text-gray-400 text-xs">
                      Review your conversion
                    </p>
                  </div>

                  {/* Swap Display */}
                  <div
                    className="text-center py-2 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    }}
                  >
                    <div className="text-gray-400 text-xs mb-1">
                      You&apos;re swapping
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <CryptoIcon symbol={asset.symbol} size="sm" />
                      <div className="text-base font-bold text-white">
                        {parseFloat(getCryptoAmount() || "0").toFixed(8)}
                      </div>
                      <span className="text-gray-400 text-xs">
                        {asset.symbol}
                      </span>
                    </div>
                    <div className="text-cyan-400 text-sm my-0.5">↓</div>
                    <div className="flex items-center justify-center gap-1.5">
                      <CryptoIcon symbol={toAsset} size="sm" />
                      <div className="text-base font-bold text-cyan-400">
                        {getEstimatedReceiveAmount().toFixed(8)}
                      </div>
                      <span className="text-gray-400 text-xs">{toAsset}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <span className="text-gray-400">Exchange Rate</span>
                      <span className="text-white font-medium">
                        1 {asset.symbol} = {getConversionRate().toFixed(8)}{" "}
                        {toAsset}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <span className="text-gray-400">You Send</span>
                      <span className="text-white font-medium">
                        {parseFloat(getCryptoAmount() || "0").toFixed(8)}{" "}
                        {asset.symbol}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <span className="text-gray-400">
                        Fee ({conversionFee}%)
                      </span>
                      <span className="text-white font-medium">
                        {(
                          parseFloat(getCryptoAmount() || "0") *
                          getConversionRate() *
                          (conversionFee / 100)
                        ).toFixed(8)}{" "}
                        {toAsset}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      <span className="text-gray-300 font-medium">
                        You Receive
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {getEstimatedReceiveAmount().toFixed(8)} {toAsset}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-colors"
                      style={{
                        background:
                          "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
                        boxShadow:
                          "0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmSwap}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                        boxShadow:
                          "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                      }}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Confirm Swap"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && successData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #22c55e 100%)",
                        boxShadow:
                          "0 10px 40px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <Check className="w-6 h-6 text-white" />
                      </motion.div>
                    </motion.div>
                    <h2 className="text-lg font-bold text-white mb-0.5">
                      Swap Successful!
                    </h2>
                    <p className="text-gray-400 text-xs">Your conversion is complete</p>
                  </div>

                  {/* Swap Result */}
                  <div
                    className="text-center py-3 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <CryptoIcon symbol={successData.fromAsset} size="sm" />
                      <span className="text-white text-base font-medium">
                        {successData.fromAmount.toFixed(8)}{" "}
                        {successData.fromAsset}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mb-1.5">
                      ≈ {formatAmount(successData.value, 2)}
                    </div>
                    <div className="text-cyan-400 text-base my-1">↓</div>
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <CryptoIcon symbol={successData.toAsset} size="sm" />
                      <span className="text-cyan-400 text-base font-bold">
                        {successData.toAmount.toFixed(8)} {successData.toAsset}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      ≈ {formatAmount(successData.toValue, 2)}
                    </div>
                  </div>

                  {/* Success Details */}
                  <div className="space-y-1.5">
                    {successData.timestamp &&
                      (() => {
                        const { date, time } = getLocalizedDateTime(
                          successData.timestamp
                        );
                        return (
                          <>
                            <div
                              className="flex justify-between p-1.5 rounded-lg text-xs"
                              style={{ background: "rgba(15, 23, 42, 0.6)" }}
                            >
                              <span className="text-gray-400">Date</span>
                              <span className="text-white font-medium">
                                {date}
                              </span>
                            </div>
                            <div
                              className="flex justify-between p-1.5 rounded-lg text-xs"
                              style={{ background: "rgba(15, 23, 42, 0.6)" }}
                            >
                              <span className="text-gray-400">Time</span>
                              <span className="text-white font-medium">
                                {time}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                  </div>

                  {/* Status */}
                  <div
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400 text-xs font-medium">
                      Swap completed successfully
                    </span>
                  </div>

                  {/* Done Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDone}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    }}
                  >
                    Done
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
