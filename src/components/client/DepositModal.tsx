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

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
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
      name: "USD Coin",
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
      name: "Tether",
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
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setPaymentMethod("bank_transfer");
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

      // Simulate API call for other payment methods
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get payment method name for display
      const methodNames = {
        bank_transfer: "Bank Transfer",
        credit_card: "Credit Card",
        debit_card: "Debit Card",
        paypal: "PayPal",
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
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
            style={{ touchAction: "none" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto" }}
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden border border-gray-700/50 max-h-[95vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10 backdrop-blur-sm"
                aria-label="Close deposit modal"
                title="Close"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Header with Gradient Background */}
              <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-orange-600/20 p-8 pb-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <Image
                      src="/m4capitallogo1.png"
                      alt="M4Capital Logo"
                      width={48}
                      height={48}
                      className="drop-shadow-lg"
                    />
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    Deposit Funds
                  </h2>
                  <p className="text-gray-300 text-center text-sm">
                    Add funds to your trading account
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-8 pb-6 sm:pb-8 -mt-2">
                {showBitcoinWallet ? (
                  <BitcoinWallet
                    amount={amount}
                    onBack={handleBitcoinWalletBack}
                    onComplete={handleBitcoinPaymentComplete}
                  />
                ) : showCryptoSelection ? (
                  <div className="space-y-6">
                    {error && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                        Select Cryptocurrency
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                        Choose which cryptocurrency you want to use for your
                        deposit of{" "}
                        <span className="text-white font-semibold">
                          {getCurrencySymbol(preferredCurrency)}
                          {amount}
                        </span>
                      </p>

                      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[500px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50">
                        {supportedCryptos.map((crypto) => {
                          const priceData = cryptoPrices[crypto.symbol];
                          const currentPrice = priceData?.price || 0;
                          const change24h = priceData?.changePercent24h || 0;

                          return (
                            <motion.div
                              key={crypto.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              onClick={() =>
                                crypto.enabled && setSelectedCrypto(crypto.id)
                              }
                              className={`group p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all ${
                                !crypto.enabled
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                              } ${
                                selectedCrypto === crypto.id
                                  ? `${crypto.borderColor} bg-gradient-to-r ${crypto.gradient} bg-opacity-10 shadow-lg`
                                  : "border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/60 hover:border-gray-600/50"
                              }`}
                            >
                              <div className="flex items-start sm:items-center justify-between gap-2">
                                <div className="flex items-center space-x-2.5 sm:space-x-4 flex-1 min-w-0">
                                  {/* Crypto Icon */}
                                  <div
                                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                      selectedCrypto === crypto.id
                                        ? `bg-gradient-to-br ${crypto.gradient} shadow-md`
                                        : `${crypto.bgColor} group-hover:opacity-80`
                                    }`}
                                  >
                                    <CryptoIcon
                                      symbol={crypto.symbol}
                                      size="lg"
                                      className={
                                        selectedCrypto === crypto.id
                                          ? "brightness-0 invert"
                                          : ""
                                      }
                                    />
                                  </div>

                                  {/* Crypto Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <p className="text-white font-semibold text-sm sm:text-lg truncate">
                                        {crypto.name}
                                      </p>
                                      {selectedCrypto === crypto.id && (
                                        <svg
                                          className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0"
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
                                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                      <p className="text-gray-400 text-xs sm:text-sm font-medium">
                                        {crypto.symbol}
                                      </p>
                                      <span className="text-gray-600 text-xs">
                                        •
                                      </span>
                                      <p className="text-gray-500 text-[10px] sm:text-xs truncate">
                                        {crypto.network}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Price Info */}
                                <div className="text-right flex-shrink-0">
                                  {currentPrice > 0 ? (
                                    <>
                                      <p className="text-white text-sm sm:text-base font-bold whitespace-nowrap">
                                        {getCurrencySymbol(preferredCurrency)}
                                        {(
                                          currentPrice *
                                          (preferredCurrency !== "USD" ? 1 : 1)
                                        ).toLocaleString(undefined, {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 2,
                                        })}
                                      </p>
                                      <div
                                        className={`flex items-center justify-end gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${
                                          change24h >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }`}
                                      >
                                        <svg
                                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                                            change24h < 0 ? "rotate-180" : ""
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {Math.abs(change24h).toFixed(2)}%
                                      </div>
                                    </>
                                  ) : (
                                    <div className="animate-pulse">
                                      <div className="h-3.5 sm:h-4 bg-gray-700 rounded w-16 sm:w-20 mb-1"></div>
                                      <div className="h-2.5 sm:h-3 bg-gray-700 rounded w-12 sm:w-16"></div>
                                    </div>
                                  )}
                                  <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1 whitespace-nowrap">
                                    Min: {crypto.minAmount} {crypto.symbol}
                                  </p>
                                </div>
                              </div>

                              {/* Coming Soon Badge */}
                              {!crypto.enabled && (
                                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700/50 text-yellow-400 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5">
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Coming soon
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="text-red-400 text-sm text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/30 backdrop-blur-sm">
                        {error}
                      </div>
                    )}

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Deposit Amount ({preferredCurrency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                          {getCurrencySymbol(preferredCurrency)}
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-5 py-3 sm:py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-base sm:text-lg font-medium backdrop-blur-sm"
                          min="10"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
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

                    {/* Quick Amount Buttons */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Quick Select
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {quickAmounts.map((quickAmount) => (
                          <button
                            key={quickAmount}
                            type="button"
                            onClick={() => setAmount(quickAmount.toString())}
                            className={`py-2.5 sm:py-3.5 px-2 sm:px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                              amount === quickAmount.toString()
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30"
                                : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/50"
                            }`}
                          >
                            {getCurrencySymbol(preferredCurrency)}
                            {quickAmount}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Payment Method
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowPaymentDropdown(!showPaymentDropdown)
                          }
                          className="w-full px-5 py-4 bg-gradient-to-r from-gray-800/80 to-gray-800/60 border border-blue-500/30 rounded-2xl text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm shadow-lg shadow-blue-500/10 hover:border-blue-500/50 flex items-center justify-between"
                        >
                          <span>
                            {paymentMethod === "bank_transfer" &&
                              "Bank Transfer"}
                            {paymentMethod === "credit_card" && "Credit Card"}
                            {paymentMethod === "debit_card" && "Debit Card"}
                            {paymentMethod === "paypal" && "PayPal"}
                            {paymentMethod === "crypto" && "Cryptocurrency"}
                          </span>
                          <svg
                            className={`w-5 h-5 text-blue-400 transition-transform ${
                              showPaymentDropdown ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
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
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
                            >
                              <div className="py-2">
                                {[
                                  {
                                    value: "bank_transfer",
                                    label: "Bank Transfer",
                                    icon: "🏦",
                                  },
                                  {
                                    value: "credit_card",
                                    label: "Credit Card",
                                    icon: "💳",
                                  },
                                  {
                                    value: "debit_card",
                                    label: "Debit Card",
                                    icon: "💳",
                                  },
                                  {
                                    value: "paypal",
                                    label: "PayPal",
                                    icon: "💰",
                                  },
                                  {
                                    value: "crypto",
                                    label: "Cryptocurrency",
                                    icon: "₿",
                                  },
                                ].map((method) => (
                                  <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => {
                                      setPaymentMethod(method.value);
                                      setShowPaymentDropdown(false);
                                    }}
                                    className={`w-full px-5 py-4 text-left flex items-center gap-3 transition-all ${
                                      paymentMethod === method.value
                                        ? "bg-blue-600/20 text-white border-l-4 border-blue-500"
                                        : "text-gray-300 hover:bg-gray-700/50 border-l-4 border-transparent"
                                    }`}
                                  >
                                    <span className="text-2xl">
                                      {method.icon}
                                    </span>
                                    <span className="font-semibold text-lg">
                                      {method.label}
                                    </span>
                                    {paymentMethod === method.value && (
                                      <svg
                                        className="w-5 h-5 text-blue-400 ml-auto"
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
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-2xl p-5 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
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
                          <p className="text-blue-300 text-sm font-medium mb-1">
                            Processing Information
                          </p>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            Deposits typically process within 1-3 business days.
                            You'll receive an email confirmation once your
                            deposit is complete.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !amount}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 text-lg"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
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
                        </span>
                      ) : (
                        `Deposit ${
                          amount ? formatAmount(parseFloat(amount), 2) : "Funds"
                        }`
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
