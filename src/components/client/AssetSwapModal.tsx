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
import { useTheme } from "@/contexts/ThemeContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CRYPTO_METADATA } from "@/lib/crypto-constants";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [conversionFee] = useState(0.5); // 0.5% fee
  const [userCountry, setUserCountry] = useState<string>("US");

  // Get all supported crypto symbols for price fetching
  const allCryptoSymbols = Object.keys(CRYPTO_METADATA);
  const cryptoPrices = useCryptoPrices(allCryptoSymbols);

  // Get real price for a symbol from live prices
  const getRealPrice = (symbol: string): number => {
    const priceData = cryptoPrices[symbol];
    return priceData?.price || 0;
  };

  // Get current asset price from live prices
  const currentAssetPrice = getRealPrice(asset.symbol) || asset.price;

  // Build available assets with real prices
  const availableAssetsWithPrices = allCryptoSymbols
    .filter((symbol) => symbol !== asset.symbol)
    .map((symbol) => {
      const meta = CRYPTO_METADATA[symbol];
      const existingAsset = availableAssets.find((a) => a.symbol === symbol);
      return {
        symbol,
        name: meta?.name || symbol,
        amount: existingAsset?.amount || 0,
        price: getRealPrice(symbol),
      };
    })
    .filter((a) => a.price > 0); // Only show assets with valid prices

  const toAssetData = availableAssetsWithPrices.find((a) => a.symbol === toAsset);

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
      const price = currentAssetPrice;
      if (price <= 0) return "0";
      const cryptoAmount = usdValue / price;
      return cryptoAmount.toString();
    }
  };

  // 3D card styling - Cyan theme
  const card3DStyle = isDark ? {
    background:
      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
    boxShadow:
      "0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 15px 30px -8px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  } : {
    background:
      "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
    boxShadow:
      "0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 15px 30px -8px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 1), inset 0 -2px 0 rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
  };

  const inputStyle = isDark ? {
    background:
      "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    boxShadow:
      "inset 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(6, 182, 212, 0.2)",
  } : {
    background:
      "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
    boxShadow:
      "inset 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 0 rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
  };

  // Filter assets based on search
  const filteredAssets = availableAssetsWithPrices.filter(
    (a) =>
      a.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(assetSearch.toLowerCase())
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
    if (!toAssetData || toAssetData.price <= 0) return 0;
    if (asset.symbol === toAsset) return 1;
    // Use live prices for accurate conversion
    const fromPrice = currentAssetPrice;
    const toPrice = toAssetData.price;
    if (fromPrice <= 0 || toPrice <= 0) return 0;
    return fromPrice / toPrice;
  };

  // Safely format the conversion rate for display
  const formatRate = () => {
    const rate = getConversionRate();
    if (!rate || !isFinite(rate) || isNaN(rate) || rate <= 0) {
      return "Loading...";
    }
    return rate.toFixed(8);
  };

  // Safely format the estimated receive amount for display
  const formatReceiveAmount = () => {
    const amount = getEstimatedReceiveAmount();
    if (!amount || !isFinite(amount) || isNaN(amount) || amount <= 0) {
      return "0.00000000";
    }
    return amount.toFixed(8);
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
      const value = fromAmt * currentAssetPrice;
      const rate = getConversionRate();
      const feeAmount = fromAmt * rate * (conversionFee / 100);
      const fromPriceUSD = currentAssetPrice;
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
    // Redirect to dashboard to show updated balance and transaction history
    window.location.href = "/dashboard";
  };

  const setMaxAmount = () => {
    if (inputMode === "crypto") {
      setFromAmount(asset.amount.toFixed(8));
    } else {
      // Convert max crypto to fiat
      const usdValue = asset.amount * currentAssetPrice;
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
          style={isDark ? {
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          } : {
            background: "rgba(0, 0, 0, 0.4)",
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
            style={isDark ? {
              background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            } : {
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {step !== 4 && (
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={isDark ? {
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  background: "rgba(30, 41, 59, 0.5)",
                } : {
                  borderColor: "rgba(0, 0, 0, 0.08)",
                  background: "rgba(255, 255, 255, 0.5)",
                }}
              >
                <button
                  onClick={handleBack}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                  style={isDark ? {
                    background:
                      "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                    boxShadow:
                      "0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  } : {
                    background:
                      "linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)",
                    boxShadow:
                      "0 2px 8px -2px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                  <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
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
                            ? (isDark ? "rgb(6, 182, 212)" : "rgb(8, 145, 178)")
                            : (isDark ? "rgba(6, 182, 212, 0.3)" : "rgba(8, 145, 178, 0.3)"),
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
                    <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Select asset to receive
                    </p>
                  </div>

                  {errors.toAsset && (
                    <div className="p-2 rounded-lg" style={isDark ? {
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                    } : {
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                    }}>
                      <p className={`text-xs text-center ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {errors.toAsset}
                      </p>
                    </div>
                  )}

                  {/* From Asset Display - Compact */}
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      From
                    </label>
                    <div
                      className="rounded-lg p-3"
                      style={isDark ? {
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      } : {
                        background: "rgba(6, 182, 212, 0.08)",
                        border: "1px solid rgba(6, 182, 212, 0.15)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={asset.symbol} size="xs" />
                        <div className="text-left flex-1">
                          <div className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                            {asset.name} <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>({asset.symbol})</span>
                          </div>
                          <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
                      style={isDark ? {
                        background: "rgba(6, 182, 212, 0.2)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                      } : {
                        background: "rgba(6, 182, 212, 0.15)",
                        border: "1px solid rgba(6, 182, 212, 0.25)",
                      }}
                    >
                      <ArrowDownUp className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                    </div>
                  </div>

                  {/* To Asset Selection - Compact */}
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      To
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setShowToDropdown(!showToDropdown)}
                        className="w-full rounded-lg p-3 flex items-center justify-between transition-all"
                        style={isDark ? {
                          background: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(6, 182, 212, 0.2)",
                        } : {
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(6, 182, 212, 0.25)",
                        }}
                      >
                        {toAsset ? (
                          <div className="flex items-center gap-2">
                            <CryptoIcon symbol={toAsset} size="xs" />
                            <div className="text-left">
                              <div className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {availableAssets.find((a) => a.symbol === toAsset)?.name}{" "}
                                <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>({toAsset})</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Select asset...</span>
                        )}
                        <ChevronDown
                          className={`transition-transform w-4 h-4 ${
                            showToDropdown ? "rotate-180" : ""
                          } ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        />
                      </button>

                      <AnimatePresence>
                        {showToDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto ${isDark ? "bg-slate-800 border-cyan-500/20" : "bg-white border-cyan-500/30"}`}
                            style={{
                              border: `1px solid`,
                            }}
                          >
                            <div className={`p-2 border-b ${isDark ? "border-slate-700" : "border-gray-200"}`}>
                              <div className="relative">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                <input
                                  type="text"
                                  placeholder="Search assets..."
                                  value={assetSearch}
                                  onChange={(e) =>
                                    setAssetSearch(e.target.value)
                                  }
                                  className={`w-full rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 ${isDark ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-900"}`}
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
                                className={`w-full p-3 flex items-center gap-3 transition-colors ${
                                  toAsset === a.symbol 
                                    ? (isDark ? "bg-cyan-500/20" : "bg-cyan-500/15")
                                    : (isDark ? "hover:bg-slate-700/50" : "hover:bg-gray-100/80")
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gradient-to-br from-cyan-500/20 to-teal-500/20" : "bg-gradient-to-br from-cyan-500/15 to-teal-500/15"}`}>
                                  <CryptoIcon symbol={a.symbol} size="sm" />
                                </div>
                                <div className="text-left flex-1">
                                  <div className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {a.name}
                                  </div>
                                  <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                    {a.symbol}
                                  </div>
                                </div>
                                {toAsset === a.symbol && (
                                  <Check className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
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
                      style={isDark ? {
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      } : {
                        background: "rgba(6, 182, 212, 0.08)",
                        border: "1px solid rgba(6, 182, 212, 0.15)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Rate</span>
                        <span className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          1 {asset.symbol} = {formatRate()} {toAsset}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Bottom Action for Step 1 */}
              {step === 1 && (
                <div
                  className="px-4 py-2.5 border-t"
                  style={isDark ? {
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    background: "rgba(15, 23, 42, 0.9)",
                  } : {
                    borderColor: "rgba(0, 0, 0, 0.08)",
                    background: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <button
                    onClick={handleContinueStep1}
                    disabled={!toAsset}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={isDark ? {
                      background: "linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)",
                      boxShadow: "0 4px 12px -2px rgba(6, 182, 212, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    } : {
                      background: "linear-gradient(135deg, #0e7490 0%, #0891b2 100%)",
                      boxShadow: "0 4px 12px -2px rgba(14, 116, 144, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
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
                      <ArrowRight className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                      <CryptoIcon symbol={toAsset} size="xs" />
                    </div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      How much {asset.symbol} to swap?
                    </p>
                  </div>

                  {/* Amount Input - Compact */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Amount
                      </label>
                      <button
                        onClick={setMaxAmount}
                        className={`text-xs font-medium transition-colors ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"}`}
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
                        className={`w-full rounded-lg px-3 py-3 pr-20 text-lg font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isDark ? "text-white" : "text-gray-900"}`}
                        style={isDark ? {
                          background: "rgba(15, 23, 42, 0.8)",
                          border: "1px solid rgba(6, 182, 212, 0.2)",
                        } : {
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(6, 182, 212, 0.25)",
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
                              const usdValue = currentValue * currentAssetPrice;
                              const fiatValue = convertAmount(usdValue);
                              setFromAmount(fiatValue.toFixed(2));
                            } else {
                              // Convert fiat to crypto
                              const usdValue = convertAmount(currentValue, true);
                              const cryptoValue = usdValue / currentAssetPrice;
                              setFromAmount(cryptoValue.toFixed(8));
                            }
                          }
                          setInputMode(inputMode === "crypto" ? "fiat" : "crypto");
                        }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-medium transition-colors ${isDark ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700"}`}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>{inputMode === "crypto" ? asset.symbol : preferredCurrency}</span>
                      </button>
                    </div>
                    {errors.fromAmount && (
                      <p className={`text-xs mt-1.5 ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {errors.fromAmount}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                        Available: {asset.amount.toFixed(8)} {asset.symbol}
                      </p>
                      {fromAmount && parseFloat(fromAmount) > 0 && (
                        <p className={`text-xs ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                          {inputMode === "crypto"
                            ? `≈ ${formatAmount(parseFloat(fromAmount) * currentAssetPrice, 2)}`
                            : `≈ ${(parseFloat(getCryptoAmount())).toFixed(8)} ${asset.symbol}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* You Will Receive */}
                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <div
                      className="mb-3 p-3 rounded-xl"
                      style={isDark ? {
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      } : {
                        background: "rgba(6, 182, 212, 0.08)",
                        border: "1px solid rgba(6, 182, 212, 0.15)",
                      }}
                    >
                      <div className={`text-xs mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        You will receive
                      </div>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={toAsset} size="sm" />
                        <span className={`text-xl font-bold ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                          {formatReceiveAmount()}
                        </span>
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{toAsset}</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Summary */}
                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <div
                      className="mb-3 p-3 rounded-xl"
                      style={isDark ? {
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      } : {
                        background: "rgba(248, 250, 252, 0.6)",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Info className={`w-3.5 h-3.5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                        <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Swap Summary
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className={isDark ? "text-gray-400" : "text-gray-600"}>Exchange Rate</span>
                          <span className={isDark ? "text-white" : "text-gray-900"}>
                            1 {asset.symbol} = {formatRate()}{" "}
                            {toAsset}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                            Fee ({conversionFee}%)
                          </span>
                          <span className={isDark ? "text-white" : "text-gray-900"}>
                            {(() => {
                              const rate = getConversionRate();
                              const cryptoAmt = parseFloat(getCryptoAmount() || "0");
                              const fee = cryptoAmt * rate * (conversionFee / 100);
                              return isFinite(fee) && !isNaN(fee) ? fee.toFixed(8) : "0.00000000";
                            })()}{" "}
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
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={isDark ? {
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    } : {
                      background:
                        "linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0e7490 100%)",
                      boxShadow:
                        "0 10px 40px rgba(14, 116, 144, 0.3), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.1)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="w-3.5 h-3.5" />
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
                      style={isDark ? {
                        background:
                          "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                      } : {
                        background:
                          "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)",
                      }}
                    >
                      <RefreshCw className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                    </div>
                    <h2 className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Confirm Swap
                    </h2>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Review your conversion
                    </p>
                  </div>

                  {/* Swap Display */}
                  <div
                    className="text-center py-2 rounded-xl"
                    style={isDark ? {
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    } : {
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.15)",
                    }}
                  >
                    <div className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      You&apos;re swapping
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <CryptoIcon symbol={asset.symbol} size="sm" />
                      <div className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {parseFloat(getCryptoAmount() || "0").toFixed(8)}
                      </div>
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {asset.symbol}
                      </span>
                    </div>
                    <div className={`text-sm my-0.5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>↓</div>
                    <div className="flex items-center justify-center gap-1.5">
                      <CryptoIcon symbol={toAsset} size="sm" />
                      <div className={`text-base font-bold ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                        {getEstimatedReceiveAmount().toFixed(8)}
                      </div>
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{toAsset}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={isDark ? { background: "rgba(15, 23, 42, 0.6)" } : { background: "rgba(248, 250, 252, 0.6)" }}
                    >
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>Exchange Rate</span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        1 {asset.symbol} = {getConversionRate().toFixed(8)}{" "}
                        {toAsset}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={isDark ? { background: "rgba(15, 23, 42, 0.6)" } : { background: "rgba(248, 250, 252, 0.6)" }}
                    >
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>You Send</span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {parseFloat(getCryptoAmount() || "0").toFixed(8)}{" "}
                        {asset.symbol}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-1.5 rounded-lg text-xs"
                      style={isDark ? { background: "rgba(15, 23, 42, 0.6)" } : { background: "rgba(248, 250, 252, 0.6)" }}
                    >
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        Fee ({conversionFee}%)
                      </span>
                      <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
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
                      style={isDark ? {
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      } : {
                        background: "rgba(6, 182, 212, 0.08)",
                        border: "1px solid rgba(6, 182, 212, 0.15)",
                      }}
                    >
                      <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        You Receive
                      </span>
                      <span className={`font-bold ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
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
                      style={isDark ? {
                        background:
                          "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
                        boxShadow:
                          "0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      } : {
                        background:
                          "linear-gradient(145deg, #cbd5e1 0%, #94a3b8 100%)",
                        boxShadow:
                          "0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
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
                      style={isDark ? {
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                        boxShadow:
                          "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                      } : {
                        background:
                          "linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0e7490 100%)",
                        boxShadow:
                          "0 10px 40px rgba(14, 116, 144, 0.3), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.1)",
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
                      style={isDark ? {
                        background:
                          "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #22c55e 100%)",
                        boxShadow:
                          "0 10px 40px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
                      } : {
                        background:
                          "linear-gradient(135deg, #16a34a 0%, #059669 50%, #16a34a 100%)",
                        boxShadow:
                          "0 10px 40px rgba(22, 163, 74, 0.3), inset 0 2px 0 rgba(255,255,255,0.4)",
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
                    <h2 className={`text-lg font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Swap Successful!
                    </h2>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Your conversion is complete</p>
                  </div>

                  {/* Swap Result */}
                  <div
                    className="text-center py-3 rounded-xl"
                    style={isDark ? {
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    } : {
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <CryptoIcon symbol={successData.fromAsset} size="sm" />
                      <span className={`text-base font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {successData.fromAmount.toFixed(8)}{" "}
                        {successData.fromAsset}
                      </span>
                    </div>
                    <div className={`text-xs mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      ≈ {formatAmount(successData.value, 2)}
                    </div>
                    <div className={`text-base my-1 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>↓</div>
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <CryptoIcon symbol={successData.toAsset} size="sm" />
                      <span className={`text-base font-bold ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                        {successData.toAmount.toFixed(8)} {successData.toAsset}
                      </span>
                    </div>
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
                              style={isDark ? { background: "rgba(15, 23, 42, 0.6)" } : { background: "rgba(248, 250, 252, 0.6)" }}
                            >
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>Date</span>
                              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {date}
                              </span>
                            </div>
                            <div
                              className="flex justify-between p-1.5 rounded-lg text-xs"
                              style={isDark ? { background: "rgba(15, 23, 42, 0.6)" } : { background: "rgba(248, 250, 252, 0.6)" }}
                            >
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>Time</span>
                              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
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
                    style={isDark ? {
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    } : {
                      background: "rgba(34, 197, 94, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.15)",
                    }}
                  >
                    <Check className={`w-3.5 h-3.5 ${isDark ? "text-green-400" : "text-green-600"}`} />
                    <span className={`text-xs font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
                      Swap completed successfully
                    </span>
                  </div>

                  {/* Done Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDone}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all"
                    style={isDark ? {
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                    } : {
                      background:
                        "linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0e7490 100%)",
                      boxShadow:
                        "0 10px 40px rgba(14, 116, 144, 0.3), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.1)",
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
