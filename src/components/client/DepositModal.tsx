"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import BitcoinWallet from "./BitcoinWallet";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCurrencySymbol } from "@/lib/currencies";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCryptoPrices } from "./CryptoMarketProvider";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBitcoinWallet, setShowBitcoinWallet] = useState(false);
  const [showCryptoSelection, setShowCryptoSelection] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Supported cryptocurrencies from NowPayments
  const supportedCryptos = [
    {
      id: "btc",
      symbol: "BTC",
      name: "Bitcoin",
      minAmount: 0.0002,
      minUSD: 20,
      network: "Bitcoin",
      enabled: true,
      gradient: "from-orange-500 to-yellow-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/50",
      iconBg: "bg-orange-500",
    },
    {
      id: "eth",
      symbol: "ETH",
      name: "Ethereum",
      minAmount: 0.001,
      minUSD: 3,
      network: "Ethereum (ERC-20)",
      enabled: true,
      gradient: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/50",
      iconBg: "bg-blue-500",
    },
    {
      id: "etc",
      symbol: "ETC",
      name: "Ethereum Classic",
      minAmount: 0.1,
      minUSD: 2,
      network: "Ethereum Classic",
      enabled: true,
      gradient: "from-green-600 to-emerald-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/50",
      iconBg: "bg-green-600",
    },
    {
      id: "ltc",
      symbol: "LTC",
      name: "Litecoin",
      minAmount: 0.01,
      minUSD: 1,
      network: "Litecoin",
      enabled: true,
      gradient: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-400/10",
      borderColor: "border-gray-400/50",
      iconBg: "bg-gray-500",
    },
    {
      id: "xrp",
      symbol: "XRP",
      name: "Ripple",
      minAmount: 10,
      minUSD: 5,
      network: "XRP Ledger",
      enabled: true,
      gradient: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-600/10",
      borderColor: "border-blue-600/50",
      iconBg: "bg-blue-600",
    },
    {
      id: "usdcerc20",
      symbol: "USDC",
      name: "Ethereum",
      minAmount: 1,
      minUSD: 1,
      network: "Ethereum (ERC-20)",
      enabled: true,
      gradient: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/50",
      iconBg: "bg-blue-600",
    },
    {
      id: "ton",
      symbol: "TON",
      name: "Toncoin",
      minAmount: 1,
      minUSD: 2,
      network: "TON Network",
      enabled: true,
      gradient: "from-cyan-500 to-blue-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/50",
      iconBg: "bg-cyan-600",
    },
    {
      id: "trx",
      symbol: "TRX",
      name: "Tron",
      minAmount: 10,
      minUSD: 2,
      network: "Tron (TRC-20)",
      enabled: true,
      gradient: "from-red-500 to-pink-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/50",
      iconBg: "bg-red-600",
    },
    {
      id: "usdterc20",
      symbol: "USDT",
      name: "Ethereum",
      minAmount: 1,
      minUSD: 1,
      network: "Ethereum (ERC-20)",
      enabled: true,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/50",
      iconBg: "bg-green-600",
    },
    {
      id: "bch",
      symbol: "BCH",
      name: "Bitcoin Cash",
      minAmount: 0.001,
      minUSD: 1,
      network: "Bitcoin Cash",
      enabled: true,
      gradient: "from-green-600 to-lime-600",
      bgColor: "bg-green-600/10",
      borderColor: "border-green-600/50",
      iconBg: "bg-green-700",
    },
  ];

  // Get real-time crypto prices
  const cryptoSymbols = supportedCryptos.map((c) => c.symbol);
  const cryptoPrices = useCryptoPrices(cryptoSymbols);

  // Use notification context if available (dashboard), otherwise use null
  let addNotification = null;
  let addTransaction = null;

  try {
    const notifications = useNotifications();
    addNotification = notifications.addNotification;
    addTransaction = notifications.addTransaction;
  } catch (error) {
    // NotificationProvider not available, notifications will be disabled
    console.log(
      "Notifications not available - this is expected for non-dashboard pages"
    );
  }

  // Use currency context if available
  let formatAmount = (amount: number, decimals: number = 2) =>
    `$${amount.toFixed(decimals)}`;
  let preferredCurrency = "USD";

  try {
    const currency = useCurrency();
    formatAmount = currency.formatAmount;
    preferredCurrency = currency.preferredCurrency;
  } catch (error) {
    // CurrencyProvider not available, will use USD
    console.log("Currency context not available - using USD");
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";

      // Add history entry for mobile back button
      window.history.pushState({ modalOpen: true }, "");

      // Handle mobile back button
      const handlePopState = (e: PopStateEvent) => {
        onClose();
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        document.body.style.overflow = "unset";
        document.body.style.paddingRight = "0px";
      };
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }
  }, [isOpen, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setPaymentMethod("crypto");
      setError("");
      setSuccess("");
      setShowBitcoinWallet(false);
      setShowCryptoSelection(false);
      setSelectedCrypto("");
      setShowPaymentDropdown(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Validation
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      setError("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    if (numAmount < 10) {
      setError("Minimum deposit amount is $10");
      setIsLoading(false);
      return;
    }

    try {
      // Check if cryptocurrency is selected
      if (paymentMethod === "crypto") {
        // Show cryptocurrency selection instead of immediately creating payment
        setShowCryptoSelection(true);
        setIsLoading(false);
        return;
      }

      // Handle PIX payment
      if (paymentMethod === "pix") {
        try {
          const response = await fetch("/api/deposits/pix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: numAmount }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to create PIX payment");
          }

          // PIX payment created successfully - data should contain QR code and payment info
          setSuccess(
            "PIX payment created! Scan the QR code to complete payment."
          );
          setIsLoading(false);
          return;
        } catch (err: any) {
          setError(err.message || "Failed to create PIX payment");
          setIsLoading(false);
          return;
        }
      }

      // Simulate API call for other payment methods
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get payment method name for display
      const methodNames = {
        bank_transfer: "Bank Transfer",
        credit_card: "Credit Card",
        paypal: "PayPal",
        pix: "PIX (Brazil)",
      };

      const methodName =
        methodNames[paymentMethod as keyof typeof methodNames] ||
        "Bank Transfer";

      // Create a new transaction if notifications are available
      if (addTransaction) {
        addTransaction({
          type: "deposit",
          asset: "USD",
          amount: numAmount,
          value: numAmount,
          timestamp: new Date().toLocaleString(),
          status: "completed",
          description: `Deposit via ${methodName}`,
          method: methodName,
        });
      }

      // Create a notification if notifications are available
      if (addNotification) {
        addNotification({
          type: "deposit",
          title: "Deposit Successful",
          message: `Your deposit of $${numAmount.toFixed(
            2
          )} via ${methodName} has been processed successfully.`,
        });
      }

      // For non-crypto payments, show success message
      setSuccess(
        `Deposit request of $${numAmount.toFixed(
          2
        )} has been submitted successfully!`
      );

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setError("Failed to process deposit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBitcoinWalletBack = () => {
    setShowBitcoinWallet(false);
    setShowCryptoSelection(true);
    setError("");
    setSuccess("");
  };

  const handleCryptoSelectionBack = () => {
    setShowCryptoSelection(false);
    setSelectedCrypto("");
    setError("");
  };

  const handleProceedToPayment = () => {
    if (!selectedCrypto) {
      setError("Please select a cryptocurrency");
      return;
    }
    // For now, only Bitcoin is implemented
    if (selectedCrypto === "btc") {
      setShowCryptoSelection(false);
      setShowBitcoinWallet(true);
    } else {
      setError(
        "This cryptocurrency is not yet supported. Please select Bitcoin."
      );
    }
  };

  const handleBitcoinPaymentComplete = () => {
    setShowBitcoinWallet(false);
    // Close modal immediately since notification is handled by BitcoinWallet
    onClose();
  };

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end mobile:items-start justify-center mobile:pt-0 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 w-full mobile:max-w-full max-w-md mobile:min-h-screen mobile:max-h-screen h-auto mobile:rounded-none rounded-t-3xl overflow-hidden flex flex-col">
              {/* Close Button */}
              <div className="absolute right-4 top-4 z-50">
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 rounded-full transition-all backdrop-blur-sm"
                >
                  <svg
                    className="w-4 h-4"
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
              </div>

              {/* Content */}
              <div className="flex-1 mobile:p-0 p-4 overflow-y-auto mobile:pb-0 pb-4">
                {showBitcoinWallet ? (
                  <BitcoinWallet
                    amount={amount}
                    onBack={handleBitcoinWalletBack}
                    onComplete={handleBitcoinPaymentComplete}
                  />
                ) : showCryptoSelection ? (
                  <div className="mobile:space-y-0 space-y-4 mobile:h-screen mobile:flex mobile:flex-col">
                    {error && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 mobile:p-2.5 p-4 mobile:rounded-none rounded-xl border-b border-red-500/30 backdrop-blur-sm mobile:mx-0 mx-4">
                        {error}
                      </div>
                    )}

                    <div className="mobile:px-4 mobile:pt-3 mobile:pb-1.5">
                      <p className="text-gray-400 text-xs mobile:text-center">
                        Deposit amount:{" "}
                        <span className="text-white font-semibold">
                          {formatAmount(parseFloat(amount) || 0, 2)}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 mobile:gap-0 gap-3 mobile:flex-1 mobile:overflow-y-auto max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50">
                      {supportedCryptos
                        .sort(
                          (a, b) => (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0)
                        )
                        .map((crypto) => (
                          <button
                            key={crypto.id}
                            onClick={() => setSelectedCrypto(crypto.id)}
                            className={`group relative mobile:p-2.5 p-4 mobile:rounded-none rounded-xl mobile:border-b-2 mobile:border-x-0 mobile:border-t-0 border-2 transition-all duration-300 transform mobile:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] ${
                              selectedCrypto === crypto.id
                                ? `bg-gradient-to-br ${crypto.bgColor} ${crypto.borderColor} shadow-xl hover:shadow-2xl shadow-${crypto.iconBg}/20`
                                : "bg-gradient-to-br from-gray-800/80 to-gray-900/80 mobile:border-gray-700/30 border-gray-700/50 hover:from-gray-800 hover:to-gray-900 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10"
                            }`}
                            style={{
                              transformStyle: "preserve-3d",
                              perspective: "1000px",
                            }}
                          >
                            {/* 3D Glow Effect on Hover */}
                            <div
                              className={`absolute inset-0 mobile:rounded-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                selectedCrypto === crypto.id
                                  ? "bg-gradient-to-br " + crypto.gradient
                                  : "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                              } blur-xl -z-10`}
                            />

                            <div className="flex items-center mobile:gap-2.5 gap-4">
                              {/* Enhanced 3D Crypto Icon */}
                              <div
                                className={`mobile:w-11 mobile:h-11 w-14 h-14 mobile:rounded-xl rounded-2xl ${
                                  selectedCrypto === crypto.id
                                    ? `bg-gradient-to-br ${crypto.gradient} shadow-lg`
                                    : "bg-gradient-to-br from-gray-700 to-gray-800"
                                } flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative`}
                                style={{
                                  boxShadow:
                                    selectedCrypto === crypto.id
                                      ? `0 8px 32px ${crypto.iconBg}40, 0 4px 16px ${crypto.iconBg}60, inset 0 1px 2px rgba(255,255,255,0.2)`
                                      : "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)",
                                }}
                              >
                                {/* Inner glow */}
                                <div className="absolute inset-0 mobile:rounded-xl rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                                <CryptoIcon
                                  symbol={crypto.symbol}
                                  className="mobile:w-5 mobile:h-5 w-8 h-8 text-white relative z-10 drop-shadow-lg"
                                />
                              </div>

                              {/* Enhanced Content */}
                              <div className="flex-1 text-left">
                                <div className="flex items-center justify-between mobile:mb-0.5 mb-1.5">
                                  <h3
                                    className={`mobile:text-sm text-lg font-bold transition-colors ${
                                      selectedCrypto === crypto.id
                                        ? "text-white"
                                        : "text-gray-200 group-hover:text-white"
                                    }`}
                                  >
                                    {crypto.name}
                                  </h3>
                                  <span
                                    className={`mobile:text-xs text-base font-bold px-2 py-0.5 rounded-lg transition-all ${
                                      selectedCrypto === crypto.id
                                        ? `${crypto.iconBg} text-white shadow-md`
                                        : "bg-gray-700/60 text-gray-300 group-hover:bg-blue-500/20 group-hover:text-blue-400"
                                    }`}
                                  >
                                    {crypto.symbol}
                                  </span>
                                </div>
                                <p className="mobile:text-[11px] text-sm text-gray-400 mobile:mb-1 mb-2 flex items-center gap-1.5">
                                  <svg
                                    className="w-3 h-3 mobile:w-2.5 mobile:h-2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                    />
                                  </svg>
                                  {crypto.network}
                                </p>
                                <div
                                  className={`inline-flex items-center gap-1 mobile:px-2 px-2.5 mobile:py-0.5 py-1 rounded-lg mobile:text-[10px] text-[11px] font-medium transition-all ${
                                    selectedCrypto === crypto.id
                                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  }`}
                                >
                                  <svg
                                    className="mobile:w-3 mobile:h-3 w-3.5 h-3.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>
                                    Min: {crypto.minAmount} {crypto.symbol} (~
                                    {formatAmount(crypto.minUSD, 0)})
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced Selection Indicator */}
                              {selectedCrypto === crypto.id && (
                                <div className="text-green-400 flex-shrink-0 animate-in fade-in zoom-in duration-300">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-green-400 rounded-full blur-lg opacity-50 animate-pulse" />
                                    <svg
                                      className="mobile:w-5 mobile:h-5 w-7 h-7 relative"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 mobile:p-4 pt-4 sm:pt-6">
                      <button
                        type="button"
                        onClick={handleCryptoSelectionBack}
                        className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        disabled={!selectedCrypto}
                        className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 sm:py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                ) : success ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-16 h-16 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-green-400 text-xl font-semibold mb-3">
                      {success}
                    </p>
                    <p className="text-gray-400 text-sm">
                      This window will close automatically...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mobile:space-y-4 space-y-6 mobile:h-screen mobile:flex mobile:flex-col">
                    {error && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 mobile:p-3 p-4 mobile:rounded-xl rounded-2xl border border-red-500/30">
                        {error}
                      </div>
                    )}

                    {/* Amount */}
                    <div className="mobile:flex-shrink-0">
                      <label className="block mobile:text-xs text-sm font-semibold text-white mobile:mb-1.5 mb-3">
                        Deposit Amount ({preferredCurrency})
                      </label>
                      <div className="relative">
                        <span className="absolute mobile:left-3 left-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold mobile:text-base text-lg">
                          {getCurrencySymbol(preferredCurrency)}
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full mobile:pl-8 pl-10 mobile:pr-3 pr-5 mobile:py-2.5 py-3 sm:py-4 bg-gray-800/60 border border-gray-700/50 mobile:rounded-xl rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all mobile:text-base text-base sm:text-lg font-medium"
                          min="10"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="mt-1.5 mobile:text-[10px] text-xs text-gray-400 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Minimum deposit: {formatAmount(10, 2)}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div className="mobile:flex-shrink-0">
                      <label className="block mobile:text-xs text-sm font-semibold text-gray-300 mobile:mb-1.5 mb-3">
                        Payment Method
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowPaymentDropdown(!showPaymentDropdown)
                          }
                          className="w-full mobile:px-3 px-5 mobile:py-3 py-4 bg-gradient-to-r from-gray-800/80 to-gray-800/60 border border-blue-500/30 mobile:rounded-xl rounded-2xl text-white mobile:text-sm text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-lg shadow-blue-500/10 hover:border-blue-500/50 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            {paymentMethod === "crypto" ? (
                              <>
                                <div className="flex items-center -space-x-2">
                                  <Image
                                    src="/crypto/btc.svg"
                                    alt="BTC"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-10"
                                  />
                                  <Image
                                    src="/crypto/eth.svg"
                                    alt="ETH"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-20"
                                  />
                                  <Image
                                    src="/crypto/usdt.svg"
                                    alt="USDT"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-30"
                                  />
                                  <Image
                                    src="/crypto/ltc.svg"
                                    alt="LTC"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-40"
                                  />
                                  <Image
                                    src="/crypto/usdc.svg"
                                    alt="USDC"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-50"
                                  />
                                  <Image
                                    src="/crypto/bch.svg"
                                    alt="BCH"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-60"
                                  />
                                </div>
                                <span>Deposit via Crypto</span>
                              </>
                            ) : paymentMethod === "bank_transfer" ? (
                              "🏦 Bank Transfer"
                            ) : paymentMethod === "credit_card" ? (
                              "💳 Credit Card"
                            ) : paymentMethod === "debit_card" ? (
                              "💳 Debit Card"
                            ) : paymentMethod === "paypal" ? (
                              "💰 PayPal"
                            ) : paymentMethod === "pix" ? (
                              <>
                                <Image
                                  src="/payments/pix-logo.svg"
                                  alt="PIX"
                                  width={80}
                                  height={32}
                                  className="w-20 h-8 object-contain"
                                />
                                <span>Deposit via PIX</span>
                              </>
                            ) : (
                              "🏦 Bank Transfer"
                            )}
                          </span>
                          <svg
                            className={`mobile:w-4 mobile:h-4 w-5 h-5 text-gray-400 transition-transform ${
                              showPaymentDropdown ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        <AnimatePresence>
                          {showPaymentDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700/50 mobile:rounded-xl rounded-2xl shadow-2xl z-20"
                            >
                              <div className="py-2 px-2 space-y-2">
                                {[
                                  {
                                    id: "crypto",
                                    name: "Deposit via Crypto",
                                    desc: "Fast & secure deposits with Bitcoin, Ethereum, USDT, and other cryptocurrencies. Transactions confirmed within minutes.",
                                    logo: null,
                                    enabled: true,
                                    isCrypto: true,
                                  },
                                  // {
                                  //   id: "bank_transfer",
                                  //   name: "🏦 Bank Transfer",
                                  //   desc: "Traditional bank deposit via wire transfer. Processing time: 1-3 business days.",
                                  //   logo: null,
                                  //   enabled: false,
                                  // },
                                  // {
                                  //   id: "credit_card",
                                  //   name: "💳 Credit Card",
                                  //   desc: "Instant deposits using Visa or Mastercard. Secure payment processing with 3D verification.",
                                  //   logo: [
                                  //     "/payments/visa.svg",
                                  //     "/payments/mastercard.svg",
                                  //   ],
                                  //   enabled: false,
                                  // },
                                  // {
                                  //   id: "paypal",
                                  //   name: "💰 PayPal",
                                  //   desc: "Quick and easy deposits using your PayPal account balance or linked payment methods.",
                                  //   logo: "/payments/paypal.svg",
                                  //   enabled: false,
                                  // },
                                  {
                                    id: "pix",
                                    name: "Deposit via PIX",
                                    desc: "Instant payment method for Brazilian customers. Processed 24/7 in real-time.",
                                    logo: "/payments/pix-logo.svg",
                                    enabled: true,
                                    isPixLogo: true,
                                  },
                                ].map((method) => (
                                  <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => {
                                      if (method.enabled) {
                                        setPaymentMethod(method.id);
                                        setShowPaymentDropdown(false);
                                      }
                                    }}
                                    disabled={!method.enabled}
                                    className={`w-full text-left transition-all duration-300 rounded-xl ${
                                      method.isPixLogo
                                        ? "mobile:px-3 mobile:py-1 px-4 py-1.5"
                                        : "mobile:p-3 p-4"
                                    } ${
                                      method.enabled
                                        ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 hover:from-gray-800/90 hover:to-gray-900/90 border border-gray-700/50 hover:border-blue-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                        : "bg-gray-900/40 border border-gray-800/50 opacity-40 cursor-not-allowed"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {method.isPixLogo ? (
                                        <div className="flex flex-col gap-1 w-full">
                                          <div className="flex items-center justify-between">
                                            <div className="mobile:text-sm text-base font-semibold text-white flex items-center gap-1">
                                              {method.name}
                                              {paymentMethod === method.id && (
                                                <svg
                                                  className="mobile:w-4 mobile:h-4 w-5 h-5 text-green-400"
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
                                            <Image
                                              src={method.logo as string}
                                              alt="PIX"
                                              width={140}
                                              height={64}
                                              className="w-35 h-16 object-contain m-0 p-0"
                                              style={{
                                                objectPosition: "center",
                                              }}
                                            />
                                          </div>
                                          <div className="mobile:text-[10px] text-xs text-gray-400">
                                            {method.desc}
                                          </div>
                                        </div>
                                      ) : method.isCrypto ? (
                                        <div className="flex flex-col gap-2 w-full">
                                          <div className="flex items-center justify-between">
                                            <div className="mobile:text-sm text-base font-semibold text-white flex items-center gap-1">
                                              {method.name}
                                              {paymentMethod === method.id && (
                                                <svg
                                                  className="mobile:w-4 mobile:h-4 w-5 h-5 text-green-400"
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
                                              {!method.enabled && (
                                                <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                                                  Coming Soon
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center -space-x-4">
                                              <Image
                                                src="/crypto/btc.svg"
                                                alt="BTC"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border-2 border-gray-800 relative z-10"
                                              />
                                              <Image
                                                src="/crypto/eth.svg"
                                                alt="ETH"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border-2 border-gray-800 relative z-20"
                                              />
                                              <Image
                                                src="/crypto/usdt.svg"
                                                alt="USDT"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border-2 border-gray-800 relative z-30"
                                              />
                                              <Image
                                                src="/crypto/ltc.svg"
                                                alt="LTC"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border-2 border-gray-800 relative z-40"
                                              />
                                              <Image
                                                src="/crypto/usdc.svg"
                                                alt="USDC"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border-2 border-gray-800 relative z-50"
                                              />
                                              <Image
                                                src="/crypto/bch.svg"
                                                alt="BCH"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full border-2 border-gray-800 relative z-60"
                                              />
                                            </div>
                                          </div>
                                          <div className="mobile:text-[10px] text-xs text-gray-400">
                                            {method.desc}
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div>
                                            <div className="mobile:text-sm text-base font-semibold text-white flex items-center gap-2">
                                              {method.name}
                                              {!method.enabled && (
                                                <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                                                  Coming Soon
                                                </span>
                                              )}
                                            </div>
                                            <div className="mobile:text-[10px] text-xs text-gray-400">
                                              {method.desc}
                                            </div>
                                          </div>
                                          {method.logo && (
                                            <div className="flex gap-1">
                                              {Array.isArray(method.logo) ? (
                                                method.logo.map(
                                                  (logoSrc, idx) => (
                                                    <Image
                                                      key={idx}
                                                      src={logoSrc}
                                                      alt="Payment logo"
                                                      width={24}
                                                      height={24}
                                                      className="w-6 h-6 object-contain"
                                                    />
                                                  )
                                                )
                                              ) : (
                                                <Image
                                                  src={method.logo}
                                                  alt="Payment logo"
                                                  width={24}
                                                  height={24}
                                                  className="w-6 h-6 object-contain"
                                                />
                                              )}
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mobile:flex-shrink-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 mobile:rounded-xl rounded-2xl mobile:p-3 p-5">
                      <div className="flex items-start mobile:gap-2 gap-3">
                        <svg
                          className="mobile:w-4 mobile:h-4 w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="mobile:text-[10px] text-sm text-blue-200 font-medium mobile:leading-relaxed leading-normal">
                            {paymentMethod === "crypto"
                              ? "You will be redirected to select your preferred cryptocurrency. Deposits are processed instantly after blockchain confirmation."
                              : paymentMethod === "bank_transfer"
                              ? "Bank transfers typically take 1-3 business days to process. You'll receive confirmation once the deposit is complete."
                              : paymentMethod === "pix"
                              ? "PIX payments are processed instantly 24/7. Perfect for Brazilian customers."
                              : "Your payment will be processed securely. You'll receive confirmation once the deposit is complete."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !amount}
                      className="w-full mobile:py-2.5 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white mobile:rounded-xl rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 mobile:text-base text-lg mobile:flex-shrink-0 mobile:mt-auto"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin mobile:h-4 mobile:w-4 h-5 w-5"
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
                        </span>
                      ) : (
                        <>
                          Deposit{" "}
                          {amount
                            ? `${getCurrencySymbol(
                                preferredCurrency
                              )}${parseFloat(amount).toFixed(2)}`
                            : "Funds"}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DepositModal;
