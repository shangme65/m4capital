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
        // Show Bitcoin wallet instead of success message
        setShowBitcoinWallet(true);
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
    setError("");
    setSuccess("");
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
            <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                aria-label="Close deposit modal"
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
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/m4capitallogo2.png"
                    alt="Capital Logo"
                    width={32}
                    height={32}
                  />
                  <span className="ml-2 text-orange-500 font-medium text-xl">
                    Capital
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">
                  Deposit Funds
                </h2>
                <p className="text-gray-400 text-center mb-8">
                  Add funds to your trading account
                </p>

                {showBitcoinWallet ? (
                  <BitcoinWallet
                    amount={amount}
                    onBack={handleBitcoinWalletBack}
                    onComplete={handleBitcoinPaymentComplete}
                  />
                ) : success ? (
                  <div className="text-center">
                    <div className="text-green-500 text-lg mb-4">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-green-500"
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
                      {success}
                    </div>
                    <p className="text-gray-400 text-sm">
                      This window will close automatically...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    {/* Amount */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Deposit Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          $
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-8 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-gray-700 transition-all"
                          min="10"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum deposit: $10
                      </p>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Quick Select
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {quickAmounts.map((quickAmount) => (
                          <button
                            key={quickAmount}
                            type="button"
                            onClick={() => setAmount(quickAmount.toString())}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-orange-500 text-white py-2 px-3 rounded-lg text-sm transition-all"
                          >
                            ${quickAmount}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        title="Select payment method"
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-gray-700 transition-all"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="crypto">Cryptocurrency</option>
                      </select>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex items-start space-x-3">
                        <svg
                          className="w-5 h-5 text-blue-400 mt-0.5"
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
                          <p className="text-white text-sm font-medium mb-1">
                            Processing Information
                          </p>
                          <p className="text-gray-400 text-xs">
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
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
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
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </div>
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
