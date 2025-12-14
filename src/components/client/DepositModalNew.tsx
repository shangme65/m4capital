"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import CryptoWallet from "./CryptoWallet";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCIES } from "@/lib/currencies";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling constants - matching WithdrawModalNew
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
  SOL: "linear-gradient(145deg, #9945ff 0%, #14f195 100%)",
  TRX: "linear-gradient(145deg, #ff0013 0%, #b3000d 100%)",
  TON: "linear-gradient(145deg, #0098ea 0%, #006bb3 100%)",
  BCH: "linear-gradient(145deg, #8dc351 0%, #5a8033 100%)",
  ETC: "linear-gradient(145deg, #328332 0%, #1f511f 100%)",
  USDC: "linear-gradient(145deg, #2775ca 0%, #1a4d8a 100%)",
};

function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [step, setStep] = useState(1); // 1 = amount/method, 2 = crypto selection, 3 = wallet
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCryptoWallet, setShowCryptoWallet] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [selectedCryptoInfo, setSelectedCryptoInfo] = useState<{
    symbol: string;
    name: string;
  } | null>(null);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Supported cryptocurrencies from NowPayments
  // All crypto minimum deposit: $20 USD (matches Bitcoin's NowPayments minimum)
  const supportedCryptos = [
    {
      id: "btc",
      symbol: "BTC",
      name: "Bitcoin",
      minAmount: 0.0002,
      minUSD: 20,
      network: "Bitcoin",
    },
    {
      id: "eth",
      symbol: "ETH",
      name: "Ethereum",
      minAmount: 0.001,
      minUSD: 20,
      network: "Ethereum (ERC-20)",
    },
    {
      id: "etc",
      symbol: "ETC",
      name: "Ethereum Classic",
      minAmount: 0.1,
      minUSD: 20,
      network: "Ethereum Classic",
    },
    {
      id: "ltc",
      symbol: "LTC",
      name: "Litecoin",
      minAmount: 0.01,
      minUSD: 20,
      network: "Litecoin",
    },
    {
      id: "xrp",
      symbol: "XRP",
      name: "Ripple",
      minAmount: 10,
      minUSD: 20,
      network: "XRP Ledger",
    },
    {
      id: "usdcerc20",
      symbol: "USDC",
      name: "USD Coin",
      minAmount: 1,
      minUSD: 20,
      network: "Ethereum (ERC-20)",
    },
    {
      id: "ton",
      symbol: "TON",
      name: "Toncoin",
      minAmount: 1,
      minUSD: 20,
      network: "TON Network",
    },
    {
      id: "trx",
      symbol: "TRX",
      name: "Tron",
      minAmount: 10,
      minUSD: 20,
      network: "Tron (TRC-20)",
    },
    {
      id: "usdterc20",
      symbol: "USDT",
      name: "Tether",
      minAmount: 1,
      minUSD: 20,
      network: "Ethereum (ERC-20)",
    },
    {
      id: "bch",
      symbol: "BCH",
      name: "Bitcoin Cash",
      minAmount: 0.001,
      minUSD: 20,
      network: "Bitcoin Cash",
    },
  ];

  // Use notification context if available
  let addNotification:
    | ((notification: {
        type:
          | "info"
          | "deposit"
          | "trade"
          | "withdraw"
          | "success"
          | "warning"
          | "transaction";
        title: string;
        message: string;
      }) => void)
    | null = null;

  try {
    const notifications = useNotifications();
    addNotification = notifications.addNotification;
  } catch {
    console.log("Notifications not available");
  }

  // Use currency context
  let formatAmount = (amount: number, decimals: number = 2) =>
    `$${amount.toFixed(decimals)}`;
  let convertAmount = (amount: number, toUSD: boolean = false) => amount;
  let preferredCurrency = "USD";

  try {
    const currency = useCurrency();
    formatAmount = currency.formatAmount;
    convertAmount = currency.convertAmount;
    preferredCurrency = currency.preferredCurrency;
  } catch {
    console.log("Currency context not available");
  }

  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";

  // Fixed minimum deposit for all payment methods: $20 USD (matches NowPayments Bitcoin minimum)
  const MINIMUM_DEPOSIT_USD = 20;
  const minDepositFormatted = formatAmount(MINIMUM_DEPOSIT_USD, 2);
  const minDepositAmount = parseFloat(
    minDepositFormatted.replace(/[^0-9.]/g, "")
  );

  // Handle back button navigation
  const handleBack = () => {
    if (showCryptoWallet) {
      setShowCryptoWallet(false);
      setSelectedCryptoInfo(null);
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setSelectedCrypto("");
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
      setAmount("");
      setPaymentMethod("crypto");
      setError("");
      setShowCryptoWallet(false);
      setSelectedCrypto("");
      setSelectedCryptoInfo(null);
      setShowPaymentDropdown(false);
    }

    // Add mobile back button handler - goes back one step
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      if (showCryptoWallet) {
        setShowCryptoWallet(false);
        setSelectedCryptoInfo(null);
        setStep(2);
        window.history.pushState({ modal: true }, "");
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
  }, [isOpen, onClose, step, showCryptoWallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const numAmount = parseFloat(amount);
    console.log("Form submission validation:", {
      amount,
      numAmount,
      minDepositAmount,
      isValid: numAmount >= minDepositAmount,
    });

    if (!amount || numAmount <= 0 || isNaN(numAmount)) {
      setError("Please enter a valid amount");
      setIsLoading(false);
      return;
    }

    if (numAmount < minDepositAmount) {
      setError(
        `Minimum deposit amount is ${currencySymbol}${minDepositAmount.toFixed(
          2
        )} (equivalent to $20 USD)`
      );
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "crypto") {
      setStep(2);
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

        if (addNotification) {
          addNotification({
            type: "info",
            title: "PIX Payment Created",
            message: "Scan the QR code to complete payment.",
          });
        }
        setIsLoading(false);
        return;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create PIX payment";
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
  };

  const handleProceedToPayment = () => {
    if (!selectedCrypto) {
      setError("Please select a cryptocurrency");
      return;
    }

    const crypto = supportedCryptos.find((c) => c.id === selectedCrypto);
    if (!crypto) {
      setError("Invalid cryptocurrency selected");
      return;
    }

    setSelectedCryptoInfo({
      symbol: crypto.symbol,
      name: crypto.name,
    });

    setShowCryptoWallet(true);
    setStep(3);
    setError("");
  };

  const handleCryptoPaymentComplete = () => {
    setShowCryptoWallet(false);
    setSelectedCryptoInfo(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="deposit-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          {/* Back button - top left */}
          {!showCryptoWallet && (
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
              {/* Show CryptoWallet when in wallet step */}
              {showCryptoWallet && selectedCryptoInfo ? (
                <CryptoWallet
                  amount={convertAmount(parseFloat(amount), true).toFixed(2)}
                  cryptoCurrency={selectedCrypto}
                  cryptoSymbol={selectedCryptoInfo.symbol}
                  cryptoName={selectedCryptoInfo.name}
                  onBack={handleBack}
                  onComplete={handleCryptoPaymentComplete}
                />
              ) : (
                <>
                  {/* Header Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-4 mb-4"
                    style={card3DStyle}
                  >
                    {/* Icon and Title in same row */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(145deg, #2563eb 0%, #7c3aed 100%)",
                          boxShadow: "0 8px 20px -5px rgba(37, 99, 235, 0.5)",
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Deposit Funds
                      </h2>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                              step >= s
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/30"
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
                          {s < 2 && (
                            <div
                              className={`w-8 h-0.5 rounded-full ${
                                step > s
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                  : "bg-gray-700"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-2">
                      <span className="text-gray-400 text-xs">
                        {step === 1 && "Enter Details"}
                        {step === 2 && "Select Crypto"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Form Content Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl p-4"
                    style={card3DStyle}
                  >
                    {/* Step 1: Amount and Method */}
                    {step === 1 && (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div
                            className="rounded-xl p-3 text-red-400 text-sm"
                            style={{
                              background:
                                "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            {error}
                          </div>
                        )}

                        {/* Amount Input */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2">
                            Deposit Amount ({preferredCurrency})
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full rounded-xl px-4 py-3 pl-8 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                              style={inputStyle}
                              placeholder="0.00"
                              min={minDepositAmount.toString()}
                              required
                            />
                          </div>
                          <p className="mt-1.5 text-[10px] text-gray-400 flex items-center gap-1.5">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Minimum deposit: {currencySymbol}
                            {minDepositAmount.toFixed(2)}
                          </p>
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
                              className="w-full px-4 py-3 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all flex items-center justify-between"
                              style={{
                                background:
                                  "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                              }}
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
                                    </div>
                                    <span>Deposit via Crypto</span>
                                  </>
                                ) : paymentMethod === "pix" ? (
                                  <>
                                    <Image
                                      src="/payments/pix-logo.svg"
                                      alt="PIX"
                                      width={60}
                                      height={24}
                                      className="w-15 h-6 object-contain"
                                    />
                                    <span>Deposit via PIX</span>
                                  </>
                                ) : (
                                  <>
                                    <span>🏦</span>
                                    <span>Bank Transfer</span>
                                  </>
                                )}
                              </span>
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${
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
                                  className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-20 overflow-hidden"
                                  style={{
                                    background:
                                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <div className="py-2 px-2 space-y-2">
                                    {/* Crypto Option */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaymentMethod("crypto");
                                        setShowPaymentDropdown(false);
                                      }}
                                      className="w-full text-left transition-all duration-300 rounded-xl p-3"
                                      style={{
                                        background:
                                          paymentMethod === "crypto"
                                            ? "linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)"
                                            : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                        boxShadow:
                                          "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                        border:
                                          paymentMethod === "crypto"
                                            ? "1px solid rgba(59, 130, 246, 0.3)"
                                            : "1px solid rgba(255, 255, 255, 0.05)",
                                      }}
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className="flex flex-col gap-1.5 w-full">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                                              Deposit via Crypto
                                              {paymentMethod === "crypto" && (
                                                <svg
                                                  className="w-4 h-4 text-green-400"
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
                                            <div className="flex items-center -space-x-3">
                                              <Image
                                                src="/crypto/btc.svg"
                                                alt="BTC"
                                                width={28}
                                                height={28}
                                                className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-10"
                                              />
                                              <Image
                                                src="/crypto/eth.svg"
                                                alt="ETH"
                                                width={28}
                                                height={28}
                                                className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-20"
                                              />
                                              <Image
                                                src="/crypto/usdt.svg"
                                                alt="USDT"
                                                width={28}
                                                height={28}
                                                className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-30"
                                              />
                                              <Image
                                                src="/crypto/ltc.svg"
                                                alt="LTC"
                                                width={28}
                                                height={28}
                                                className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-40"
                                              />
                                            </div>
                                          </div>
                                          <p className="text-[10px] text-gray-400">
                                            Fast deposits with BTC, ETH, USDT,
                                            LTC and more. Confirmed after
                                            blockchain verification.
                                          </p>
                                        </div>
                                      </div>
                                    </button>

                                    {/* PIX Option */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPaymentMethod("pix");
                                        setShowPaymentDropdown(false);
                                      }}
                                      className="w-full text-left transition-all duration-300 rounded-xl p-3"
                                      style={{
                                        background:
                                          paymentMethod === "pix"
                                            ? "linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)"
                                            : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                        boxShadow:
                                          "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                        border:
                                          paymentMethod === "pix"
                                            ? "1px solid rgba(59, 130, 246, 0.3)"
                                            : "1px solid rgba(255, 255, 255, 0.05)",
                                      }}
                                    >
                                      <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center justify-between">
                                          <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                                            Deposit via PIX
                                            {paymentMethod === "pix" && (
                                              <svg
                                                className="w-4 h-4 text-green-400"
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
                                            src="/payments/pix-logo.svg"
                                            alt="PIX"
                                            width={100}
                                            height={40}
                                            className="w-25 h-10 object-contain"
                                          />
                                        </div>
                                        <p className="text-[10px] text-gray-400">
                                          Instant payment for Brazilian
                                          customers. Available 24/7.
                                        </p>
                                      </div>
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Info Card */}
                        <div
                          className="rounded-xl p-3"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-[10px] text-blue-200 leading-relaxed">
                              {paymentMethod === "crypto"
                                ? "You will be redirected to select your preferred cryptocurrency. Deposits are processed instantly after blockchain confirmation."
                                : "PIX payments are processed instantly 24/7. Perfect for Brazilian customers."}
                            </p>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isLoading || !amount}
                          className="w-full py-3 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background:
                              "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #2563eb 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(37, 99, 235, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
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
                            `Deposit Funds`
                          )}
                        </button>
                      </form>
                    )}

                    {/* Step 2: Crypto Selection */}
                    {step === 2 && (
                      <div className="space-y-4">
                        {error && (
                          <div
                            className="rounded-xl p-3 text-red-400 text-sm"
                            style={{
                              background:
                                "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            {error}
                          </div>
                        )}

                        {/* Deposit Amount Summary */}
                        <div
                          className="rounded-xl p-3"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow:
                              "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs font-medium">
                              Deposit Amount:
                            </span>
                            <span className="text-lg font-bold text-white">
                              {currencySymbol}
                              {parseFloat(amount).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Crypto Grid */}
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                          {supportedCryptos.map((crypto) => (
                            <button
                              key={crypto.id}
                              type="button"
                              onClick={() => setSelectedCrypto(crypto.id)}
                              className="w-full text-left transition-all duration-300 rounded-xl p-3"
                              style={{
                                background:
                                  selectedCrypto === crypto.id
                                    ? "linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)"
                                    : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                border:
                                  selectedCrypto === crypto.id
                                    ? "1px solid rgba(59, 130, 246, 0.3)"
                                    : "1px solid rgba(255, 255, 255, 0.05)",
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* 3D Crypto Logo */}
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                      background:
                                        cryptoGradients[crypto.symbol] ||
                                        "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                      boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                                    }}
                                  >
                                    <CryptoIcon
                                      symbol={crypto.symbol}
                                      className="w-6 h-6 text-white"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-white">
                                      {crypto.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {crypto.network}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="text-xs font-semibold text-white">
                                      {crypto.symbol}
                                    </div>
                                    <div className="text-[10px] text-yellow-400">
                                      Min: {formatAmount(crypto.minUSD, 0)}
                                    </div>
                                  </div>
                                  {selectedCrypto === crypto.id && (
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
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-3 px-3 rounded-xl font-semibold transition-all text-white text-sm"
                            style={card3DStyle}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleProceedToPayment}
                            disabled={!selectedCrypto}
                            className="flex-1 py-3 px-3 rounded-xl font-bold transition-all text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                              boxShadow:
                                "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            }}
                          >
                            Proceed to Payment
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DepositModal;
