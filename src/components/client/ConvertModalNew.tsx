"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ArrowLeft,
  RefreshCw,
  X,
  ArrowDownUp,
  Info,
  Search,
  TrendingUp,
} from "lucide-react";

interface ConvertModalNewProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [userCountry, setUserCountry] = useState<string>("US");
  const [showAmountInCrypto, setShowAmountInCrypto] = useState(true);
  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const [conversionFee] = useState(0.5); // 0.5% fee
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Calculate available balances from portfolio assets
  const availableBalances =
    portfolio?.portfolio?.assets?.reduce((acc: any, asset: any) => {
      acc[asset.symbol] = asset.amount || 0;
      return acc;
    }, {} as Record<string, number>) || {};

  // Filter assets based on search
  const filteredAssets = cryptoSymbols.filter(
    (symbol) =>
      symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
      cryptoNames[symbol]?.toLowerCase().includes(assetSearch.toLowerCase())
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 1) {
      onClose();
    }
  }, [step, onClose]);

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

    window.history.pushState({ modal: "convert" }, "");
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
      // Reset state when modal closes
      setConvertData({
        fromAsset: "BTC",
        toAsset: "ETH",
        amount: "",
      });
      setErrors({});
      setShowFromDropdown(false);
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

  const toggleCurrency = () => {
    const currentAmount = parseFloat(convertData.amount) || 0;
    const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;

    if (fromPrice === 0) {
      return;
    }

    if (showAmountInCrypto) {
      const usdAmount = currentAmount * fromPrice;
      const fiatAmount = convertAmount(usdAmount);
      setConvertData((prev) => ({
        ...prev,
        amount: fiatAmount.toFixed(2),
      }));
    } else {
      const usdAmount = convertAmount(currentAmount, true);
      const cryptoAmount = usdAmount / fromPrice;
      setConvertData((prev) => ({
        ...prev,
        amount: cryptoAmount.toFixed(8),
      }));
    }

    setShowAmountInCrypto(!showAmountInCrypto);
  };

  const getCurrentCurrencySymbol = () => {
    return showAmountInCrypto ? convertData.fromAsset : preferredCurrency;
  };

  const getAmountPlaceholder = () => {
    return showAmountInCrypto ? "0.00000000" : "0.00";
  };

  const getAmountStep = () => {
    return showAmountInCrypto ? "0.00000001" : "0.01";
  };

  const getConversionRate = () => {
    if (convertData.fromAsset === convertData.toAsset) return 1;

    const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
    const toPrice = cryptoPrices[convertData.toAsset]?.price || 0;

    if (fromPrice === 0 || toPrice === 0) return 0;

    return fromPrice / toPrice;
  };

  const getEstimatedReceiveAmount = () => {
    if (!convertData.amount) return 0;
    const inputAmount = parseFloat(convertData.amount);

    let cryptoAmount: number;

    if (showAmountInCrypto) {
      cryptoAmount = inputAmount;
    } else {
      const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
      if (fromPrice === 0) return 0;
      const usdAmount = convertAmount(inputAmount, true);
      cryptoAmount = usdAmount / fromPrice;
    }

    const rate = getConversionRate();
    const gross = cryptoAmount * rate;
    const fee = gross * (conversionFee / 100);
    return gross - fee;
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (convertData.fromAsset === convertData.toAsset) {
      newErrors.general = "Please select different assets to convert";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!convertData.amount || parseFloat(convertData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    const inputAmount = parseFloat(convertData.amount);
    let cryptoAmount: number = 0;

    if (showAmountInCrypto) {
      cryptoAmount = inputAmount;
    } else {
      const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
      if (fromPrice === 0) {
        newErrors.amount = "Price not available";
      } else {
        const usdAmount = convertAmount(inputAmount, true);
        cryptoAmount = usdAmount / fromPrice;
      }
    }

    if (
      cryptoAmount >
      availableBalances[convertData.fromAsset as keyof typeof availableBalances]
    ) {
      newErrors.amount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSwapAssets = () => {
    setConvertData((prev) => ({
      ...prev,
      fromAsset: prev.toAsset,
      toAsset: prev.fromAsset,
      amount: "",
    }));
    setErrors({});
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

  const confirmConvert = async () => {
    setIsProcessing(true);
    try {
      const inputAmount = parseFloat(convertData.amount);
      let cryptoAmount: number;

      if (showAmountInCrypto) {
        cryptoAmount = inputAmount;
      } else {
        const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
        const usdAmount = convertAmount(inputAmount, true);
        cryptoAmount = usdAmount / fromPrice;
      }

      const rate = getConversionRate();
      const receiveAmount = getEstimatedReceiveAmount();
      const feeAmount = cryptoAmount * rate * (conversionFee / 100);

      const fromPrice = cryptoPrices[convertData.fromAsset]?.price || 0;
      const usdValue = cryptoAmount * fromPrice;

      const portfolioResponse = await fetch("/api/crypto/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset: convertData.fromAsset,
          toAsset: convertData.toAsset,
          amount: cryptoAmount,
          rate: rate,
        }),
      });

      if (!portfolioResponse.ok) {
        const errorData = await portfolioResponse.json();
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

      const notificationTitle = "Swap Completed";
      const notificationMessage = `Successfully swapped ${cryptoAmount.toFixed(
        8
      )} ${convertData.fromAsset} to ${receiveAmount.toFixed(8)} ${
        convertData.toAsset
      }`;

      addNotification({
        type: "transaction",
        title: notificationTitle,
        message: notificationMessage,
        amount: transaction.value,
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

  const handleDone = () => {
    setConvertData({
      fromAsset: "BTC",
      toAsset: "ETH",
      amount: "",
    });
    setErrors({});
    setStep(1);
    onClose();
    refetch();
  };

  const setMaxAmount = () => {
    const maxAvailable =
      availableBalances[
        convertData.fromAsset as keyof typeof availableBalances
      ] || 0;
    setConvertData((prev) => ({
      ...prev,
      amount: maxAvailable.toFixed(8),
    }));
    setShowAmountInCrypto(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="convert-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #164e63 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
          </div>

          {/* Header */}
          {step !== 4 && (
            <div className="absolute top-0 left-0 right-0 z-10 px-4 py-4 flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <ArrowLeft size="sm" />
                <span className="text-sm font-medium">Back</span>
              </motion.button>

              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: step >= s ? 1 : 0.8,
                      backgroundColor:
                        step >= s
                          ? "rgb(6, 182, 212)"
                          : "rgba(6, 182, 212, 0.3)",
                    }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-full backdrop-blur-sm"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <X size="sm" />
              </motion.button>
            </div>
          )}

          {/* Main Content */}
          <div className="h-full flex items-center justify-center p-4 pt-20 pb-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={card3DStyle}
            >
              {/* Step 1: Select Assets */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                        boxShadow:
                          "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <RefreshCw size="md" className="text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Swap Crypto
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Select assets to exchange
                    </p>
                  </div>

                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                      <p className="text-red-400 text-sm text-center">
                        {errors.general}
                      </p>
                    </motion.div>
                  )}

                  {/* From Asset */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowFromDropdown(!showFromDropdown);
                          setShowToDropdown(false);
                        }}
                        className="w-full rounded-xl p-4 flex items-center justify-between transition-all hover:border-cyan-400/40"
                        style={inputStyle}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                            }}
                          >
                            <CryptoIcon
                              symbol={convertData.fromAsset}
                              size="md"
                            />
                          </div>
                          <div className="text-left">
                            <div className="text-white font-medium">
                              {cryptoNames[convertData.fromAsset]}{" "}
                              <span className="text-gray-400">
                                ({convertData.fromAsset})
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              Balance:{" "}
                              {(
                                availableBalances[convertData.fromAsset] || 0
                              ).toFixed(8)}
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          size="sm"
                          className={`text-gray-400 transition-transform ${
                            showFromDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {showFromDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-cyan-500/20 shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto"
                          >
                            <div className="p-2 border-b border-slate-700">
                              <div className="relative">
                                <Search
                                  size="sm"
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
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
                            {filteredAssets.map((symbol) => (
                              <button
                                key={symbol}
                                onClick={() => {
                                  setConvertData((prev) => ({
                                    ...prev,
                                    fromAsset: symbol,
                                    amount: "",
                                  }));
                                  setShowFromDropdown(false);
                                  setAssetSearch("");
                                }}
                                className={`w-full p-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${
                                  convertData.fromAsset === symbol
                                    ? "bg-cyan-500/20"
                                    : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                                  <CryptoIcon symbol={symbol} size="sm" />
                                </div>
                                <div className="text-left flex-1">
                                  <div className="text-white text-sm font-medium">
                                    {cryptoNames[symbol]}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {(availableBalances[symbol] || 0).toFixed(
                                      8
                                    )}{" "}
                                    {symbol}
                                  </div>
                                </div>
                                {convertData.fromAsset === symbol && (
                                  <Check size="sm" className="text-cyan-400" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center my-3">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSwapAssets}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                        boxShadow:
                          "0 4px 15px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                      }}
                    >
                      <ArrowDownUp size="sm" className="text-cyan-400" />
                    </motion.button>
                  </div>

                  {/* To Asset */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      To
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowToDropdown(!showToDropdown);
                          setShowFromDropdown(false);
                        }}
                        className="w-full rounded-xl p-4 flex items-center justify-between transition-all hover:border-cyan-400/40"
                        style={inputStyle}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                            }}
                          >
                            <CryptoIcon
                              symbol={convertData.toAsset}
                              size="md"
                            />
                          </div>
                          <div className="text-left">
                            <div className="text-white font-medium">
                              {cryptoNames[convertData.toAsset]}{" "}
                              <span className="text-gray-400">
                                ({convertData.toAsset})
                              </span>
                            </div>
                            <div className="text-cyan-400 text-sm font-medium">
                              You will receive this asset
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          size="sm"
                          className={`text-gray-400 transition-transform ${
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
                                <Search
                                  size="sm"
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
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
                            {filteredAssets.map((symbol) => (
                              <button
                                key={symbol}
                                onClick={() => {
                                  setConvertData((prev) => ({
                                    ...prev,
                                    toAsset: symbol,
                                  }));
                                  setShowToDropdown(false);
                                  setAssetSearch("");
                                }}
                                className={`w-full p-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${
                                  convertData.toAsset === symbol
                                    ? "bg-cyan-500/20"
                                    : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                                  <CryptoIcon symbol={symbol} size="sm" />
                                </div>
                                <div className="text-left flex-1">
                                  <div className="text-white text-sm font-medium">
                                    {cryptoNames[symbol]}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {symbol}
                                  </div>
                                </div>
                                {convertData.toAsset === symbol && (
                                  <Check size="sm" className="text-cyan-400" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Exchange Rate Preview */}
                  {convertData.fromAsset !== convertData.toAsset && (
                    <div
                      className="mb-6 p-4 rounded-xl"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp size="sm" className="text-cyan-400" />
                          <span className="text-gray-400 text-sm">
                            Exchange Rate
                          </span>
                        </div>
                        <span className="text-white font-medium text-sm">
                          1 {convertData.fromAsset} ={" "}
                          {getConversionRate().toFixed(8)} {convertData.toAsset}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueStep1}
                    disabled={convertData.fromAsset === convertData.toAsset}
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
                      <ArrowRight size="sm" />
                    </span>
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Enter Amount */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                        }}
                      >
                        <CryptoIcon symbol={convertData.fromAsset} size="md" />
                      </div>
                      <ArrowRight size="sm" className="text-cyan-400" />
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                        }}
                      >
                        <CryptoIcon symbol={convertData.toAsset} size="md" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Enter Amount
                    </h2>
                    <p className="text-gray-400 text-sm">
                      How much {convertData.fromAsset} to swap?
                    </p>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">
                        Amount
                      </label>
                      <button
                        onClick={setMaxAmount}
                        className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors font-medium"
                      >
                        Max
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step={getAmountStep()}
                        value={convertData.amount}
                        onChange={(e) =>
                          setConvertData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl px-4 py-4 pr-24 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={inputStyle}
                        placeholder={getAmountPlaceholder()}
                      />
                      <button
                        onClick={toggleCurrency}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-cyan-300 text-sm font-medium transition-colors"
                        style={{
                          background: "rgba(6, 182, 212, 0.2)",
                        }}
                      >
                        {getCurrentCurrencySymbol()}
                      </button>
                    </div>
                    {errors.amount && (
                      <p className="text-red-400 text-sm mt-2">
                        {errors.amount}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Available:{" "}
                      {(availableBalances[convertData.fromAsset] || 0).toFixed(
                        8
                      )}{" "}
                      {convertData.fromAsset}
                    </p>
                  </div>

                  {/* You Will Receive */}
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
                      <CryptoIcon symbol={convertData.toAsset} size="md" />
                      <span className="text-2xl font-bold text-cyan-400">
                        {getEstimatedReceiveAmount().toFixed(8)}
                      </span>
                      <span className="text-gray-400">
                        {convertData.toAsset}
                      </span>
                    </div>
                  </div>

                  {/* Swap Summary */}
                  {convertData.amount && (
                    <div
                      className="mb-6 p-4 rounded-xl"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Info size="sm" className="text-cyan-400" />
                        <span className="text-gray-300 text-sm font-medium">
                          Swap Summary
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Exchange Rate</span>
                          <span className="text-white">
                            1 {convertData.fromAsset} ={" "}
                            {getConversionRate().toFixed(8)}{" "}
                            {convertData.toAsset}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Fee ({conversionFee}%)
                          </span>
                          <span className="text-white">
                            {(
                              parseFloat(convertData.amount || "0") *
                              getConversionRate() *
                              (conversionFee / 100)
                            ).toFixed(8)}{" "}
                            {convertData.toAsset}
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
                    disabled={
                      !convertData.amount || parseFloat(convertData.amount) <= 0
                    }
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
                      <ArrowRight size="sm" />
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
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)",
                      }}
                    >
                      <RefreshCw size="md" className="text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Confirm Swap
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Review your conversion
                    </p>
                  </div>

                  {/* Swap Display */}
                  <div
                    className="text-center py-6 mb-6 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    }}
                  >
                    <div className="text-gray-400 text-sm mb-2">
                      You&apos;re swapping
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <CryptoIcon symbol={convertData.fromAsset} size="lg" />
                      <div className="text-3xl font-bold text-white">
                        {parseFloat(convertData.amount || "0").toFixed(8)}
                      </div>
                      <span className="text-gray-400 text-lg">
                        {convertData.fromAsset}
                      </span>
                    </div>
                    <div className="text-cyan-400 text-2xl my-2">↓</div>
                    <div className="flex items-center justify-center gap-3">
                      <CryptoIcon symbol={convertData.toAsset} size="lg" />
                      <div className="text-3xl font-bold text-cyan-400">
                        {getEstimatedReceiveAmount().toFixed(8)}
                      </div>
                      <span className="text-gray-400 text-lg">
                        {convertData.toAsset}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div
                      className="flex justify-between p-3 rounded-lg"
                      style={{ background: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <span className="text-gray-400">Exchange Rate</span>
                      <span className="text-white font-medium">
                        1 {convertData.fromAsset} ={" "}
                        {getConversionRate().toFixed(8)} {convertData.toAsset}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-3 rounded-lg"
                      style={{ background: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <span className="text-gray-400">You Send</span>
                      <span className="text-white font-medium">
                        {parseFloat(convertData.amount || "0").toFixed(8)}{" "}
                        {convertData.fromAsset}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-3 rounded-lg"
                      style={{ background: "rgba(15, 23, 42, 0.6)" }}
                    >
                      <span className="text-gray-400">
                        Fee ({conversionFee}%)
                      </span>
                      <span className="text-white font-medium">
                        {(
                          parseFloat(convertData.amount || "0") *
                          getConversionRate() *
                          (conversionFee / 100)
                        ).toFixed(8)}{" "}
                        {convertData.toAsset}
                      </span>
                    </div>
                    <div
                      className="flex justify-between p-4 rounded-lg"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "1px solid rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      <span className="text-gray-300 font-medium">
                        You Receive
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {getEstimatedReceiveAmount().toFixed(8)}{" "}
                        {convertData.toAsset}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 rounded-xl font-bold text-white transition-colors"
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
                      onClick={confirmConvert}
                      disabled={isProcessing}
                      className="flex-1 py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #06b6d4 100%)",
                        boxShadow:
                          "0 10px 40px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                      }}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  className="p-6"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
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
                        <Check size={40} className="text-white" />
                      </motion.div>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Swap Successful!
                    </h2>
                    <p className="text-gray-400">Your conversion is complete</p>
                  </div>

                  {/* Swap Result */}
                  <div
                    className="text-center py-6 mb-6 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <CryptoIcon symbol={successData.asset} size="md" />
                      <span className="text-white text-xl font-medium">
                        {successData.amount.toFixed(8)} {successData.asset}
                      </span>
                    </div>
                    <div className="text-cyan-400 text-2xl my-2">↓</div>
                    <div className="flex items-center justify-center gap-3">
                      <CryptoIcon symbol={successData.toAsset} size="md" />
                      <span className="text-cyan-400 text-xl font-bold">
                        {successData.toAmount.toFixed(8)} {successData.toAsset}
                      </span>
                    </div>
                  </div>

                  {/* Success Details */}
                  <div className="space-y-3 mb-6">
                    {successData.timestamp &&
                      (() => {
                        const { date, time } = getLocalizedDateTime(
                          successData.timestamp
                        );
                        return (
                          <>
                            <div
                              className="flex justify-between p-3 rounded-lg"
                              style={{ background: "rgba(15, 23, 42, 0.6)" }}
                            >
                              <span className="text-gray-400">Date</span>
                              <span className="text-white font-medium">
                                {date}
                              </span>
                            </div>
                            <div
                              className="flex justify-between p-3 rounded-lg"
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
                    className="flex items-center justify-center gap-2 p-3 rounded-xl mb-6"
                    style={{
                      background: "rgba(34, 197, 94, 0.1)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <Check size="sm" className="text-green-400" />
                    <span className="text-green-400 text-sm font-medium">
                      Swap completed successfully
                    </span>
                  </div>

                  {/* Done Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDone}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all"
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
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
