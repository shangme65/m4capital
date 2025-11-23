"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import BitcoinWallet from "./BitcoinWallet";
import { useNotifications } from "@/contexts/NotificationContext";

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
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-700/50 max-h-[95vh] overflow-y-auto">
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
                      alt="Capital Logo"
                      width={40}
                      height={40}
                      className="drop-shadow-lg"
                    />
                    <span className="ml-3 text-orange-500 font-bold text-2xl tracking-tight">
                      Capital
                    </span>
                  </div>

                  <h2 className="text-4xl font-bold text-white mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    Deposit Funds
                  </h2>
                  <p className="text-gray-300 text-center text-sm">
                    Add funds to your trading account
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 -mt-2">
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
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Select Cryptocurrency
                      </h3>
                      <p className="text-gray-400 text-sm mb-6">
                        Choose which cryptocurrency you want to use for your
                        deposit of{" "}
                        <span className="text-white font-semibold">
                          ${amount}
                        </span>
                      </p>

                      <div className="space-y-3">
                        {/* Bitcoin */}
                        <div
                          onClick={() => setSelectedCrypto("btc")}
                          className={`group p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedCrypto === "btc"
                              ? "border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 shadow-lg shadow-orange-500/20"
                              : "border-gray-700/50 bg-gray-800/40 hover:bg-gray-800/60 hover:border-gray-600/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                  selectedCrypto === "btc"
                                    ? "bg-gradient-to-br from-orange-500 to-yellow-500"
                                    : "bg-orange-500/20 group-hover:bg-orange-500/30"
                                }`}
                              >
                                <span
                                  className={`font-bold text-xl ${
                                    selectedCrypto === "btc"
                                      ? "text-white"
                                      : "text-orange-500"
                                  }`}
                                >
                                  ₿
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">
                                  Bitcoin
                                </p>
                                <p className="text-gray-400 text-sm">BTC</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white text-sm font-medium">
                                Min: 0.0002 BTC
                              </p>
                              <p className="text-gray-400 text-xs">~$20 USD</p>
                            </div>
                          </div>
                        </div>

                        {/* Ethereum */}
                        <div
                          onClick={() => setSelectedCrypto("eth")}
                          className={`group p-5 rounded-2xl border-2 cursor-not-allowed transition-all opacity-60 ${
                            selectedCrypto === "eth"
                              ? "border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                              : "border-gray-700/50 bg-gray-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <span className="text-blue-500 font-bold text-xl">
                                  Ξ
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">
                                  Ethereum
                                </p>
                                <p className="text-gray-400 text-sm">ETH</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white text-sm font-medium">
                                Min: 0.001 ETH
                              </p>
                              <p className="text-gray-400 text-xs">~$3 USD</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700/50 text-yellow-400 text-xs flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
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
                        </div>

                        {/* USDT (TRC20) */}
                        <div
                          onClick={() => setSelectedCrypto("usdttrc20")}
                          className={`group p-5 rounded-2xl border-2 cursor-not-allowed transition-all opacity-60 ${
                            selectedCrypto === "usdttrc20"
                              ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10"
                              : "border-gray-700/50 bg-gray-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <span className="text-green-500 font-bold text-lg">
                                  ₮
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">
                                  Tether (TRC20)
                                </p>
                                <p className="text-gray-400 text-sm">USDT</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white text-sm font-medium">
                                Min: 1 USDT
                              </p>
                              <p className="text-gray-400 text-xs">~$1 USD</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700/50 text-yellow-400 text-xs flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
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
                        </div>

                        {/* Litecoin */}
                        <div
                          onClick={() => setSelectedCrypto("ltc")}
                          className={`group p-5 rounded-2xl border-2 cursor-not-allowed transition-all opacity-60 ${
                            selectedCrypto === "ltc"
                              ? "border-gray-400/50 bg-gradient-to-r from-gray-400/10 to-gray-500/10"
                              : "border-gray-700/50 bg-gray-800/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-400/20 flex items-center justify-center">
                                <span className="text-gray-400 font-bold text-xl">
                                  Ł
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg">
                                  Litecoin
                                </p>
                                <p className="text-gray-400 text-sm">LTC</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white text-sm font-medium">
                                Min: 0.01 LTC
                              </p>
                              <p className="text-gray-400 text-xs">~$1 USD</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700/50 text-yellow-400 text-xs flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
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
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6">
                      <button
                        type="button"
                        onClick={handleCryptoSelectionBack}
                        className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-white py-4 px-4 rounded-2xl font-semibold transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleProceedToPayment}
                        disabled={!selectedCrypto}
                        className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
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
                        Deposit Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                          $
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-5 py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-lg font-medium backdrop-blur-sm"
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
                        Minimum deposit: $10.00
                      </p>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Quick Select
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {quickAmounts.map((quickAmount) => (
                          <button
                            key={quickAmount}
                            type="button"
                            onClick={() => setAmount(quickAmount.toString())}
                            className={`py-3.5 px-4 rounded-xl font-semibold transition-all ${
                              amount === quickAmount.toString()
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30"
                                : "bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 border border-gray-700/50"
                            }`}
                          >
                            ${quickAmount}
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
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          title="Select payment method"
                          className="w-full px-5 py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all appearance-none cursor-pointer backdrop-blur-sm font-medium"
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="paypal">PayPal</option>
                          <option value="crypto">Cryptocurrency</option>
                        </select>
                        <svg
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                          amount ? `$${parseFloat(amount).toFixed(2)}` : "Funds"
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
