"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";
import CryptoDropdown from "@/components/client/CryptoDropdown";
import { Check } from "lucide-react";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertModal({ isOpen, onClose }: ConvertModalProps) {
  const [convertData, setConvertData] = useState({
    fromAsset: "BTC",
    toAsset: "ETH",
    amount: "",
  });
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    toAsset: string;
    toAmount: number;
    timestamp?: Date;
  } | null>(null);
  const [userCountry, setUserCountry] = useState<string>("US");
  const [showAmountInCrypto, setShowAmountInCrypto] = useState(true);
  const { portfolio, refetch } = usePortfolio();
  const [exchangeRates] = useState({
    BTC: { ETH: 26, ADA: 185714, SOL: 433 },
    ETH: { BTC: 0.038, ADA: 7143, SOL: 16.7 },
    ADA: { BTC: 0.0000054, ETH: 0.00014, SOL: 0.0023 },
    SOL: { BTC: 0.0023, ETH: 0.06, ADA: 429 },
  });
  const [conversionFee] = useState(0.5); // 0.5% fee
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();

  // Calculate available balances from portfolio assets
  const availableBalances =
    portfolio?.portfolio?.assets?.reduce((acc: any, asset: any) => {
      acc[asset.symbol] = asset.amount || 0;
      return acc;
    }, {} as Record<string, number>) || {};

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
      setStep("form");
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
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
    const rate = getConversionRate();

    if (showAmountInCrypto) {
      // Convert to fiat equivalent (using BTC price as reference)
      const btcPrice = 65000; // Reference price
      const fiatAmount = currentAmount * btcPrice;
      setConvertData((prev) => ({
        ...prev,
        amount: fiatAmount.toFixed(2),
      }));
    } else {
      // Convert back to crypto
      const btcPrice = 65000;
      const cryptoAmount = currentAmount / btcPrice;
      setConvertData((prev) => ({
        ...prev,
        amount: cryptoAmount.toString(),
      }));
    }

    setShowAmountInCrypto(!showAmountInCrypto);
  };

  const getCurrentCurrencySymbol = () => {
    return showAmountInCrypto ? convertData.fromAsset : "USD";
  };

  const getCurrentAmountLabel = () => {
    return showAmountInCrypto
      ? `Amount (${convertData.fromAsset})`
      : "Amount (USD)";
  };

  const getAmountPlaceholder = () => {
    return showAmountInCrypto ? "0.00000000" : "0.00";
  };

  const getAmountStep = () => {
    return showAmountInCrypto ? "0.00000001" : "0.01";
  };

  const getConversionRate = () => {
    if (convertData.fromAsset === convertData.toAsset) return 1;

    type AssetKey = keyof typeof exchangeRates;
    const fromAsset = convertData.fromAsset as AssetKey;
    const toAsset = convertData.toAsset as AssetKey;

    const fromRates = exchangeRates[fromAsset];
    if (fromRates && toAsset in fromRates) {
      return fromRates[toAsset as keyof typeof fromRates];
    }

    return 0;
  };

  const getEstimatedReceiveAmount = () => {
    if (!convertData.amount) return 0;
    const amount = parseFloat(convertData.amount);
    const rate = getConversionRate();
    const gross = amount * rate;
    const fee = gross * (conversionFee / 100);
    return gross - fee;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!convertData.amount || parseFloat(convertData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (
      parseFloat(convertData.amount) >
      availableBalances[convertData.fromAsset as keyof typeof availableBalances]
    ) {
      newErrors.amount = "Insufficient balance";
    }

    if (convertData.fromAsset === convertData.toAsset) {
      newErrors.general = "Please select different assets to convert";
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

  const sendNotificationEmail = async (
    title: string,
    message: string,
    amount: number,
    fromAsset: string,
    toAsset: string
  ) => {
    try {
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crypto_conversion",
          title,
          message,
          amount,
          asset: fromAsset,
          toAsset,
          currency: "USD",
        }),
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  };

  const sendPushNotification = async (
    title: string,
    message: string,
    amount: number,
    fromAsset: string,
    toAsset: string
  ) => {
    try {
      // Send via API endpoint
      await fetch("/api/notifications/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crypto_conversion",
          title,
          message,
          amount,
          asset: fromAsset,
          toAsset,
        }),
      });

      // Also attempt browser push notification if service worker is registered
      if ("serviceWorker" in navigator && "Notification" in window) {
        if (Notification.permission === "granted") {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification(title, {
            body: message,
            icon: "/icons/crypto.png",
            badge: "/icons/badge.png",
            tag: "crypto-conversion",
            requireInteraction: false,
          });
        }
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  };

  const handleConvert = () => {
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const confirmConvert = async () => {
    try {
      const amount = parseFloat(convertData.amount);
      const rate = getConversionRate();
      const receiveAmount = getEstimatedReceiveAmount();
      const feeAmount = amount * rate * (conversionFee / 100);
      const fromAssetPrice =
        convertData.fromAsset === "BTC"
          ? 65000
          : convertData.fromAsset === "ETH"
          ? 2500
          : 0.5;
      const usdValue = amount * fromAssetPrice;

      // Update portfolio via API
      const portfolioResponse = await fetch("/api/crypto/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAsset: convertData.fromAsset,
          toAsset: convertData.toAsset,
          amount: amount,
          rate: rate,
        }),
      });

      if (!portfolioResponse.ok) {
        const errorData = await portfolioResponse.json();
        throw new Error(errorData.error || "Failed to convert assets");
      }

      // Create transaction for UI
      const transaction = {
        id: `convert_${Date.now()}`,
        type: "convert" as const,
        asset: `${convertData.fromAsset} → ${convertData.toAsset}`,
        amount: amount,
        value: usdValue,
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: feeAmount,
        method: "Instant Convert",
        description: `Convert ${amount} ${
          convertData.fromAsset
        } to ${receiveAmount.toFixed(8)} ${convertData.toAsset}`,
        fromAsset: convertData.fromAsset,
        toAsset: convertData.toAsset,
        rate: rate,
      };

      addTransaction(transaction);

      // Create notification
      const notificationTitle = "Conversion Completed";
      const notificationMessage = `Successfully converted ${amount} ${
        convertData.fromAsset
      } to ${receiveAmount.toFixed(8)} ${convertData.toAsset}`;

      addNotification({
        type: "transaction",
        title: notificationTitle,
        message: notificationMessage,
        amount: transaction.value,
        asset: convertData.fromAsset,
      });

      // Send email notification
      sendNotificationEmail(
        notificationTitle,
        notificationMessage,
        amount,
        convertData.fromAsset,
        convertData.toAsset
      );

      // Send push notification
      sendPushNotification(
        notificationTitle,
        notificationMessage,
        amount,
        convertData.fromAsset,
        convertData.toAsset
      );

      // Show success step
      setSuccessData({
        asset: convertData.fromAsset,
        amount: amount,
        value:
          amount *
          (convertData.fromAsset === "BTC"
            ? 65000
            : convertData.fromAsset === "ETH"
            ? 2500
            : 0.5),
        toAsset: convertData.toAsset,
        toAmount: receiveAmount,
        timestamp: new Date(),
      });
      setStep("success");
    } catch (error) {
      console.error("Error processing conversion:", error);
      setStep("form");
    }
  };

  const handleDone = () => {
    // Reset form
    setConvertData({
      fromAsset: "BTC",
      toAsset: "ETH",
      amount: "",
    });
    setErrors({});
    setStep("form");

    // Close modal and refresh
    onClose();
    refetch();
    window.location.reload();
  };

  if (!isOpen) return null;

  const assets = [
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="convert-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
              style={{ touchAction: "none" }}
            />
            <motion.div
              key="convert-modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: "auto" }}
            >
              <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
                {step === "form" && (
                  <>
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                      aria-label="Close convert modal"
                      title="Close"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="p-8">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
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
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Convert Crypto
                          </h2>
                          <p className="text-gray-400">
                            Exchange one cryptocurrency for another
                          </p>
                        </div>
                      </div>

                      {errors.general && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                          <p className="text-red-400 text-sm">
                            {errors.general}
                          </p>
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* From Asset */}
                        <div>
                          <CryptoDropdown
                            label="From"
                            value={convertData.fromAsset}
                            onChange={(value) =>
                              setConvertData((prev) => ({
                                ...prev,
                                fromAsset: value,
                              }))
                            }
                            options={assets.map((asset) => ({
                              symbol: asset,
                              name:
                                asset === "BTC"
                                  ? "Bitcoin (BTC)"
                                  : asset === "ETH"
                                  ? "Ethereum (ETH)"
                                  : asset === "XRP"
                                  ? "Ripple (XRP)"
                                  : asset === "TRX"
                                  ? "Tron (TRX)"
                                  : asset === "TON"
                                  ? "Toncoin (TON)"
                                  : asset === "LTC"
                                  ? "Litecoin (LTC)"
                                  : asset === "BCH"
                                  ? "Bitcoin Cash (BCH)"
                                  : asset === "ETC"
                                  ? "Ethereum Classic (ETC)"
                                  : asset === "USDC"
                                  ? "USD Coin (USDC)"
                                  : "Tether (USDT)",
                            }))}
                          />
                          <div className="mt-2 text-sm text-gray-400">
                            Available:{" "}
                            {
                              availableBalances[
                                convertData.fromAsset as keyof typeof availableBalances
                              ]
                            }{" "}
                            {convertData.fromAsset}
                          </div>
                        </div>

                        {/* Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {getCurrentAmountLabel()}
                          </label>
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
                              className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-24 text-white focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder={getAmountPlaceholder()}
                            />
                            <button
                              type="button"
                              onClick={toggleCurrency}
                              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-xs font-medium text-gray-300 transition-colors"
                            >
                              {getCurrentCurrencySymbol()}
                            </button>
                          </div>
                          {errors.amount && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.amount}
                            </p>
                          )}

                          <button
                            onClick={() =>
                              setConvertData((prev) => ({
                                ...prev,
                                amount:
                                  availableBalances[
                                    convertData.fromAsset as keyof typeof availableBalances
                                  ].toString(),
                              }))
                            }
                            className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors"
                          >
                            Use Max
                          </button>
                        </div>

                        {/* Swap Button */}
                        <div className="flex justify-center">
                          <button
                            onClick={handleSwapAssets}
                            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Swap assets"
                            title="Swap assets"
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

                        {/* To Asset */}
                        <div>
                          <CryptoDropdown
                            label="To"
                            value={convertData.toAsset}
                            onChange={(value) =>
                              setConvertData((prev) => ({
                                ...prev,
                                toAsset: value,
                              }))
                            }
                            options={assets.map((asset) => ({
                              symbol: asset,
                              name:
                                asset === "BTC"
                                  ? "Bitcoin (BTC)"
                                  : asset === "ETH"
                                  ? "Ethereum (ETH)"
                                  : asset === "XRP"
                                  ? "Ripple (XRP)"
                                  : asset === "TRX"
                                  ? "Tron (TRX)"
                                  : asset === "TON"
                                  ? "Toncoin (TON)"
                                  : asset === "LTC"
                                  ? "Litecoin (LTC)"
                                  : asset === "BCH"
                                  ? "Bitcoin Cash (BCH)"
                                  : asset === "ETC"
                                  ? "Ethereum Classic (ETC)"
                                  : asset === "USDC"
                                  ? "USD Coin (USDC)"
                                  : "Tether (USDT)",
                            }))}
                          />
                        </div>

                        {/* Exchange Rate */}
                        {convertData.fromAsset !== convertData.toAsset && (
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">
                                Exchange Rate:
                              </span>
                              <span className="text-white font-medium">
                                1 {convertData.fromAsset} ={" "}
                                {getConversionRate().toLocaleString()}{" "}
                                {convertData.toAsset}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Conversion Summary */}
                        {convertData.amount &&
                          convertData.fromAsset !== convertData.toAsset && (
                            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                              <h3 className="text-white font-medium">
                                Conversion Summary
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    You pay:
                                  </span>
                                  <span className="text-white">
                                    {convertData.amount} {convertData.fromAsset}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Gross amount:
                                  </span>
                                  <span className="text-white">
                                    {(
                                      parseFloat(convertData.amount) *
                                      getConversionRate()
                                    ).toFixed(8)}{" "}
                                    {convertData.toAsset}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Fee ({conversionFee}%):
                                  </span>
                                  <span className="text-white">
                                    {(
                                      parseFloat(convertData.amount) *
                                      getConversionRate() *
                                      (conversionFee / 100)
                                    ).toFixed(8)}{" "}
                                    {convertData.toAsset}
                                  </span>
                                </div>
                                <hr className="border-gray-600" />
                                <div className="flex justify-between font-medium">
                                  <span className="text-gray-300">
                                    You receive:
                                  </span>
                                  <span className="text-white">
                                    {getEstimatedReceiveAmount().toFixed(8)}{" "}
                                    {convertData.toAsset}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                        <button
                          onClick={handleConvert}
                          disabled={
                            !convertData.amount ||
                            convertData.fromAsset === convertData.toAsset
                          }
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
                        >
                          Convert Now
                        </button>

                        {/* Info Notice */}
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                          <div className="flex">
                            <svg
                              className="w-5 h-5 text-purple-400 mt-0.5 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <p className="text-purple-400 text-sm font-medium">
                                Instant Conversion
                              </p>
                              <p className="text-purple-300 text-sm mt-1">
                                Conversions are processed instantly at current
                                market rates with a {conversionFee}% fee.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === "confirm" && (
                  <>
                    <button
                      onClick={() => setStep("form")}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                      aria-label="Back to form"
                      title="Back"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Confirm Swap
                          </h2>
                          <p className="text-gray-400">
                            Review your conversion
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-6 mb-6 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-sm mb-2">
                          You&apos;re swapping
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          {parseFloat(convertData.amount || "0").toFixed(8)}{" "}
                          {convertData.fromAsset}
                        </div>
                        <div className="text-2xl text-purple-400 my-2">↓</div>
                        <div className="text-3xl font-bold text-green-400">
                          {getEstimatedReceiveAmount().toFixed(8)}{" "}
                          {convertData.toAsset}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Conversion Rate:
                            </span>
                            <span className="text-white font-medium">
                              1 {convertData.fromAsset} ={" "}
                              {getConversionRate().toFixed(8)}{" "}
                              {convertData.toAsset}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">You Send:</span>
                            <span className="text-white font-medium">
                              {parseFloat(convertData.amount || "0").toFixed(8)}{" "}
                              {convertData.fromAsset}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Fee ({conversionFee}%):
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
                          <hr className="border-gray-600" />
                          <div className="flex justify-between items-center font-medium pt-2">
                            <span className="text-gray-300 text-lg">
                              You Receive:
                            </span>
                            <span className="text-purple-400 font-bold text-xl">
                              {getEstimatedReceiveAmount().toFixed(8)}{" "}
                              {convertData.toAsset}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep("form")}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmConvert}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                          >
                            Confirm Swap
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === "success" && successData && (
                  <>
                    <div className="p-8">
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check size={40} className="text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Swap Successful!
                        </h2>
                        <p className="text-gray-400">
                          Your conversion is complete
                        </p>
                      </div>

                      <div className="space-y-3 bg-gray-800/50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Sent:</span>
                          <span className="text-white font-medium">
                            {successData.amount.toFixed(8)} {successData.asset}
                          </span>
                        </div>
                        <div className="text-center py-2">
                          <div className="text-purple-400 text-2xl">↓</div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Received:</span>
                          <span className="text-purple-400 font-bold">
                            {successData.toAmount.toFixed(8)}{" "}
                            {successData.toAsset}
                          </span>
                        </div>
                        {successData.timestamp &&
                          (() => {
                            const { date, time } = getLocalizedDateTime(
                              successData.timestamp
                            );
                            return (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Date:</span>
                                  <span className="text-white font-medium">
                                    {date}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Time:</span>
                                  <span className="text-white font-medium">
                                    {time}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                      </div>

                      <button
                        onClick={handleDone}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
