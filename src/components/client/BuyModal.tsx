"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import CryptoDropdown from "@/components/client/CryptoDropdown";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { Check } from "lucide-react";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const [buyData, setBuyData] = useState({
    asset: "BTC",
    amount: "",
    paymentMethod: "balance",
  });
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    timestamp?: Date;
  } | null>(null);
  const [userCountry, setUserCountry] = useState<string>("US");
  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount } = useCurrency();
  const availableBalance = portfolio?.portfolio?.balance
    ? parseFloat(portfolio.portfolio.balance.toString())
    : 0;

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAmountInCrypto, setShowAmountInCrypto] = useState(false);
  const { addTransaction, addNotification } = useNotifications();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
      setStep("form"); // Reset to form when modal opens
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
          // Map common countries to their locale codes
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

  const getCurrentPrice = () => {
    if (orderType === "limit" && limitPrice) {
      return parseFloat(limitPrice);
    }
    const cryptoPrice = cryptoPrices[buyData.asset];
    return cryptoPrice?.price || 0;
  };

  const getEstimatedAmount = () => {
    if (!buyData.amount) return 0;
    const usdAmount = parseFloat(buyData.amount);
    const price = getCurrentPrice();
    return usdAmount / price;
  };

  const toggleCurrency = () => {
    const currentAmount = parseFloat(buyData.amount) || 0;
    const price = getCurrentPrice();

    if (showAmountInCrypto) {
      // Convert from crypto to preferred currency
      const fiatAmount = currentAmount * price;
      setBuyData((prev) => ({
        ...prev,
        amount: fiatAmount.toFixed(2),
      }));
    } else {
      // Convert from preferred currency to crypto
      const cryptoAmount = currentAmount / price;
      setBuyData((prev) => ({
        ...prev,
        amount: cryptoAmount.toString(),
      }));
    }

    setShowAmountInCrypto(!showAmountInCrypto);
  };

  const getCurrentCurrencySymbol = () => {
    return showAmountInCrypto ? buyData.asset : preferredCurrency;
  };

  const getCurrentAmountLabel = () => {
    return showAmountInCrypto
      ? `Amount (${buyData.asset})`
      : `Amount (${preferredCurrency})`;
  };

  const getAmountPlaceholder = () => {
    return showAmountInCrypto ? "0.00000000" : "0.00";
  };

  const getAmountStep = () => {
    return showAmountInCrypto ? "0.00000001" : "0.01";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!buyData.amount || parseFloat(buyData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    const totalCost = parseFloat(buyData.amount) * 1.015; // Include 1.5% fee
    if (totalCost > availableBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      newErrors.limitPrice = "Please enter a valid limit price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBuy = () => {
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const confirmBuy = async () => {
    try {
      const price = getCurrentPrice();
      const fiatAmount = parseFloat(buyData.amount);
      const assetAmount = fiatAmount / price;
      const fee = fiatAmount * 0.015; // 1.5% fee
      const usdValue = showAmountInCrypto ? assetAmount * price : fiatAmount;

      // Update portfolio via API
      const portfolioResponse = await fetch("/api/crypto/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: buyData.asset,
          amount: assetAmount,
          price: price,
        }),
      });

      if (!portfolioResponse.ok) {
        throw new Error("Failed to update portfolio");
      }

      // Create transaction in database
      const transactionResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "buy",
          asset: buyData.asset,
          amount: assetAmount,
          value: usdValue,
          status: orderType === "market" ? "completed" : "pending",
          fee: fee,
          method: `${preferredCurrency} Balance`,
          description: `${
            orderType === "market" ? "Market" : "Limit"
          } buy order for ${buyData.asset}`,
          rate: price,
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      // Create transaction for UI
      const transaction = {
        id: `buy_${Date.now()}`,
        type: "buy" as const,
        asset: buyData.asset,
        amount: assetAmount,
        value: usdValue,
        timestamp: new Date().toLocaleString(),
        status:
          orderType === "market"
            ? ("completed" as const)
            : ("pending" as const),
        fee: fee,
        method: `${preferredCurrency} Balance`,
        description: `${
          orderType === "market" ? "Market" : "Limit"
        } buy order for ${buyData.asset}`,
        rate: price,
      };

      addTransaction(transaction);

      // Create notification with amount
      const notificationMessage = `Successfully ${
        orderType === "market" ? "purchased" : "placed buy order for"
      } ${assetAmount.toFixed(8)} ${buyData.asset}`;

      addNotification({
        type: "transaction",
        title:
          orderType === "market" ? "Purchase Completed" : "Buy Order Placed",
        message: notificationMessage,
        amount: fiatAmount,
        asset: buyData.asset,
      });

      // Send email notification
      await sendNotificationEmail(
        orderType === "market" ? "Purchase Completed" : "Buy Order Placed",
        notificationMessage,
        fiatAmount,
        buyData.asset
      );

      // Send push notification
      await sendPushNotification(
        orderType === "market" ? "Purchase Completed" : "Buy Order Placed",
        notificationMessage,
        fiatAmount,
        buyData.asset
      );

      // Show success screen
      setSuccessData({
        asset: buyData.asset,
        amount: assetAmount,
        value: fiatAmount,
        timestamp: new Date(),
      });
      setStep("success");
    } catch (error) {
      console.error("Error processing buy order:", error);
      setStep("form");
    }
  };

  const handleDone = () => {
    // Reset form
    setBuyData({
      asset: "BTC",
      amount: "",
      paymentMethod: "balance",
    });
    setOrderType("market");
    setLimitPrice("");
    setErrors({});
    setStep("form");

    // Close modal and refresh
    onClose();
    refetch();
    window.location.reload();
  };

  const sendNotificationEmail = async (
    title: string,
    message: string,
    amount: number,
    asset: string
  ) => {
    try {
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crypto_purchase",
          title,
          message,
          amount,
          asset,
          currency: preferredCurrency,
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
    asset: string
  ) => {
    try {
      // Send via API endpoint
      await fetch("/api/notifications/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crypto_purchase",
          title,
          message,
          amount,
          asset,
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
            tag: "crypto-purchase",
            requireInteraction: false,
          });
        }
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="buy-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
              style={{ touchAction: "none" }}
            />
            <motion.div
              key="buy-modal-content"
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
                      aria-label="Close buy modal"
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
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
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
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Buy Crypto
                          </h2>
                          <p className="text-gray-400">
                            Purchase cryptocurrency
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Order Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Order Type
                          </label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setOrderType("market")}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                orderType === "market"
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              Market
                            </button>
                            <button
                              onClick={() => setOrderType("limit")}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                orderType === "limit"
                                  ? "bg-orange-500 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              Limit
                            </button>
                          </div>
                        </div>

                        {/* Asset Selection */}
                        <CryptoDropdown
                          label="Select Asset"
                          value={buyData.asset}
                          onChange={(value) =>
                            setBuyData((prev) => ({ ...prev, asset: value }))
                          }
                          options={[
                            {
                              symbol: "BTC",
                              name: "Bitcoin (BTC)",
                              price: cryptoPrices.BTC?.price
                                ? convertAmount(cryptoPrices.BTC.price)
                                : undefined,
                            },
                            {
                              symbol: "ETH",
                              name: "Ethereum (ETH)",
                              price: cryptoPrices.ETH?.price
                                ? convertAmount(cryptoPrices.ETH.price)
                                : undefined,
                            },
                            {
                              symbol: "XRP",
                              name: "Ripple (XRP)",
                              price: cryptoPrices.XRP?.price
                                ? convertAmount(cryptoPrices.XRP.price)
                                : undefined,
                            },
                            {
                              symbol: "TRX",
                              name: "Tron (TRX)",
                              price: cryptoPrices.TRX?.price
                                ? convertAmount(cryptoPrices.TRX.price)
                                : undefined,
                            },
                            {
                              symbol: "TON",
                              name: "Toncoin (TON)",
                              price: cryptoPrices.TON?.price
                                ? convertAmount(cryptoPrices.TON.price)
                                : undefined,
                            },
                            {
                              symbol: "LTC",
                              name: "Litecoin (LTC)",
                              price: cryptoPrices.LTC?.price
                                ? convertAmount(cryptoPrices.LTC.price)
                                : undefined,
                            },
                            {
                              symbol: "BCH",
                              name: "Bitcoin Cash (BCH)",
                              price: cryptoPrices.BCH?.price
                                ? convertAmount(cryptoPrices.BCH.price)
                                : undefined,
                            },
                            {
                              symbol: "ETC",
                              name: "Ethereum Classic (ETC)",
                              price: cryptoPrices.ETC?.price
                                ? convertAmount(cryptoPrices.ETC.price)
                                : undefined,
                            },
                            {
                              symbol: "USDC",
                              name: "USD Coin (USDC)",
                              price: cryptoPrices.USDC?.price
                                ? convertAmount(cryptoPrices.USDC.price)
                                : undefined,
                            },
                            {
                              symbol: "USDT",
                              name: "Tether (USDT)",
                              price: cryptoPrices.USDT?.price
                                ? convertAmount(cryptoPrices.USDT.price)
                                : undefined,
                            },
                          ]}
                          showPrices={true}
                          currencySymbol={
                            preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency
                          }
                        />

                        {/* Current Price */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">
                              Current Price:
                            </span>
                            <span className="text-white font-medium">
                              {getCurrentPrice() > 0
                                ? `${
                                    preferredCurrency === "USD"
                                      ? "$"
                                      : preferredCurrency === "EUR"
                                      ? "€"
                                      : preferredCurrency === "GBP"
                                      ? "£"
                                      : preferredCurrency
                                  }${convertAmount(
                                    getCurrentPrice()
                                  ).toLocaleString()}`
                                : "Loading..."}
                            </span>
                          </div>
                        </div>

                        {/* Limit Price (if limit order) */}
                        {orderType === "limit" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Limit Price (USD)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={limitPrice}
                              onChange={(e) => setLimitPrice(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Enter limit price"
                            />
                            {errors.limitPrice && (
                              <p className="text-red-400 text-sm mt-1">
                                {errors.limitPrice}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Amount with Currency Toggle */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {getCurrentAmountLabel()}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step={getAmountStep()}
                              value={buyData.amount}
                              onChange={(e) =>
                                setBuyData((prev) => ({
                                  ...prev,
                                  amount: e.target.value,
                                }))
                              }
                              className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-16 text-white focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder={getAmountPlaceholder()}
                            />
                            <button
                              type="button"
                              onClick={toggleCurrency}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                              {getCurrentCurrencySymbol()}
                            </button>
                          </div>
                          {errors.amount && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.amount}
                            </p>
                          )}

                          <div className="flex space-x-2 mt-2">
                            {showAmountInCrypto
                              ? [0.001, 0.01, 0.1, 1].map((preset) => (
                                  <button
                                    key={preset}
                                    onClick={() =>
                                      setBuyData((prev) => ({
                                        ...prev,
                                        amount: preset.toString(),
                                      }))
                                    }
                                    className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
                                  >
                                    {preset} {buyData.asset}
                                  </button>
                                ))
                              : [100, 250, 500, 1000].map((preset) => (
                                  <button
                                    key={preset}
                                    onClick={() =>
                                      setBuyData((prev) => ({
                                        ...prev,
                                        amount: preset.toString(),
                                      }))
                                    }
                                    className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
                                  >
                                    {preferredCurrency === "USD"
                                      ? "$"
                                      : preferredCurrency === "EUR"
                                      ? "€"
                                      : preferredCurrency === "GBP"
                                      ? "£"
                                      : preferredCurrency}
                                    {preset}
                                  </button>
                                ))}
                          </div>
                        </div>

                        {/* Estimated Amount */}
                        {buyData.amount && (
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">
                                You will receive:
                              </span>
                              <span className="text-white font-medium">
                                {getEstimatedAmount().toFixed(8)}{" "}
                                {buyData.asset}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Available Balance */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">
                              Available Balance:
                            </span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {(
                                convertAmount(availableBalance) || 0
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Fee Information */}
                        {buyData.amount && (
                          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Amount:</span>
                              <span className="text-white">
                                {preferredCurrency === "USD"
                                  ? "$"
                                  : preferredCurrency === "EUR"
                                  ? "€"
                                  : preferredCurrency === "GBP"
                                  ? "£"
                                  : preferredCurrency}
                                {parseFloat(buyData.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Fee (1.5%):</span>
                              <span className="text-white">
                                {preferredCurrency === "USD"
                                  ? "$"
                                  : preferredCurrency === "EUR"
                                  ? "€"
                                  : preferredCurrency === "GBP"
                                  ? "£"
                                  : preferredCurrency}
                                {(parseFloat(buyData.amount) * 0.015).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                            <hr className="border-gray-600" />
                            <div className="flex justify-between items-center font-medium">
                              <span className="text-gray-300">Total:</span>
                              <span className="text-white">
                                {preferredCurrency === "USD"
                                  ? "$"
                                  : preferredCurrency === "EUR"
                                  ? "€"
                                  : preferredCurrency === "GBP"
                                  ? "£"
                                  : preferredCurrency}
                                {(parseFloat(buyData.amount) * 1.015).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleBuy}
                          disabled={!buyData.amount}
                          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
                        >
                          {orderType === "market"
                            ? "Buy Now"
                            : "Place Buy Order"}
                        </button>

                        {orderType === "limit" && (
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex">
                              <svg
                                className="w-5 h-5 text-blue-400 mt-0.5 mr-3"
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
                                <p className="text-blue-400 text-sm font-medium">
                                  Limit Order
                                </p>
                                <p className="text-blue-300 text-sm mt-1">
                                  Your order will execute when the price reaches
                                  your specified limit.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
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
                            Confirm Purchase
                          </h2>
                          <p className="text-gray-400">Review your order</p>
                        </div>
                      </div>

                      <div className="text-center py-6 mb-6 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-sm mb-2">
                          You&apos;re buying
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                          {(
                            parseFloat(buyData.amount) / getCurrentPrice()
                          ).toFixed(8)}
                        </div>
                        <div className="text-xl text-green-400">
                          {buyData.asset}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Order Type:</span>
                            <span className="text-white font-medium capitalize">
                              {orderType}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Price per {buyData.asset}:
                            </span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {convertAmount(getCurrentPrice()).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {parseFloat(buyData.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Fee (1.5%):</span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {(parseFloat(buyData.amount) * 0.015).toFixed(2)}
                            </span>
                          </div>
                          <hr className="border-gray-600" />
                          <div className="flex justify-between items-center font-medium pt-2">
                            <span className="text-gray-300 text-lg">
                              Total Cost:
                            </span>
                            <span className="text-green-400 font-bold text-xl">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {(parseFloat(buyData.amount) * 1.015).toFixed(2)}
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
                            onClick={confirmBuy}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                          >
                            Confirm Purchase
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
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check size={40} className="text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Purchase Successful!
                        </h2>
                        <p className="text-gray-400">
                          Your order has been completed
                        </p>
                      </div>

                      <div className="space-y-3 bg-gray-800/50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Asset:</span>
                          <span className="text-white font-medium">
                            {successData.asset}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Amount Received:
                          </span>
                          <span className="text-white font-medium">
                            {successData.amount.toFixed(8)} {successData.asset}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Paid:</span>
                          <span className="text-green-400 font-bold">
                            {preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency}
                            {successData.value.toFixed(2)}
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
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
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
