"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeeBreakdown {
  processingFee: number;
  networkFee: number;
  serviceFee: number;
  complianceFee: number;
  totalFees: number;
  breakdown: string[];
}

// 3D Card styling constants
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

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    currency: "USD",
    withdrawalMethod: "CRYPTO_BTC",
    address: "",
    memo: "",
  });
  const { portfolio, refetch } = usePortfolio();
  const [fees, setFees] = useState<FeeBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addNotification } = useNotifications();

  const availableBalance = portfolio?.portfolio?.balance || 0;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset on close
      setStep(1);
      setWithdrawData({
        amount: "",
        currency: "USD",
        withdrawalMethod: "CRYPTO_BTC",
        address: "",
        memo: "",
      });
      setFees(null);
      setWithdrawalId(null);
      setErrors({});
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Calculate fees when amount or method changes
  useEffect(() => {
    const calculateFees = async () => {
      if (withdrawData.amount && parseFloat(withdrawData.amount) > 0) {
        try {
          const response = await fetch(
            `/api/payment/create-withdrawal?amount=${withdrawData.amount}&method=${withdrawData.withdrawalMethod}`
          );
          const data = await response.json();
          if (response.ok) {
            setFees(data.fees);
          }
        } catch (error) {
          console.error("Error calculating fees:", error);
        }
      } else {
        setFees(null);
      }
    };

    const debounce = setTimeout(calculateFees, 500);
    return () => clearTimeout(debounce);
  }, [withdrawData.amount, withdrawData.withdrawalMethod]);

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
        newErrors.amount = "Please enter a valid amount";
      } else if (parseFloat(withdrawData.amount) > availableBalance) {
        newErrors.amount = "Insufficient balance";
      }

      if (
        withdrawData.withdrawalMethod.startsWith("CRYPTO") &&
        !withdrawData.address.trim()
      ) {
        newErrors.address = "Wallet address is required for crypto withdrawals";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      await createWithdrawal();
    }
  };

  const createWithdrawal = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment/create-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawData.amount),
          currency: withdrawData.currency,
          withdrawalMethod: withdrawData.withdrawalMethod,
          address: withdrawData.address,
          memo: withdrawData.memo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create withdrawal");
      }

      setWithdrawalId(data.withdrawal.id);
      setStep(3); // Move to fee payment step

      addNotification({
        type: "info",
        title: "Withdrawal Request Created",
        message: "Please review and pay the required fees to proceed.",
      });
    } catch (error: any) {
      addNotification({
        type: "warning",
        title: "Withdrawal Failed",
        message: error.message || "Failed to create withdrawal request",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeePayment = async () => {
    if (!withdrawalId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/payment/pay-withdrawal-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId,
          paymentMethod: "BALANCE_DEDUCTION",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process fee payment");
      }

      addNotification({
        type: "success",
        title: "Withdrawal Processing",
        message: `Your withdrawal of $${withdrawData.amount} is being processed. Estimated completion: 1-3 business days.`,
      });

      // Refresh portfolio
      refetch();

      // Close modal
      onClose();
    } catch (error: any) {
      addNotification({
        type: "warning",
        title: "Fee Payment Failed",
        message: error.message || "Failed to process fee payment",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalRequired = fees
    ? parseFloat(withdrawData.amount) + fees.totalFees
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="withdraw-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          {/* Close button - top right */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white rounded-2xl transition-all z-50"
            style={card3DStyle}
            aria-label="Close"
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
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Main content container */}
          <div className="h-full w-full overflow-y-auto py-8 px-4 md:px-8">
            <div className="max-w-2xl mx-auto relative z-10">
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl p-8 mb-6"
                style={card3DStyle}
              >
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(145deg, #dc2626 0%, #ea580c 100%)",
                      boxShadow: "0 10px 30px -5px rgba(220, 38, 38, 0.5)",
                    }}
                  >
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-4xl font-bold text-white mb-3 text-center">
                  Withdraw Funds
                </h2>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                          step >= s
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30"
                            : "bg-gray-800/50 text-gray-500"
                        }`}
                        style={step >= s ? {} : inputStyle}
                      >
                        {step > s ? (
                          <svg
                            className="w-5 h-5"
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
                      {s < 3 && (
                        <div
                          className={`w-12 h-1 rounded-full ${
                            step > s
                              ? "bg-gradient-to-r from-red-500 to-orange-500"
                              : "bg-gray-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-3">
                  <span className="text-gray-400 text-sm">
                    {step === 1 && "Enter Details"}
                    {step === 2 && "Review"}
                    {step === 3 && "Fee Payment"}
                  </span>
                </div>
              </motion.div>

              {/* Form Content Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl p-8"
                style={card3DStyle}
              >
                {/* Step 1: Withdrawal Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Available Balance - 3D Card */}
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">
                          Available Balance:
                        </span>
                        <span className="text-2xl font-bold text-white">
                          ${availableBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Withdrawal Method */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Withdrawal Method
                      </label>
                      <select
                        value={withdrawData.withdrawalMethod}
                        onChange={(e) =>
                          setWithdrawData((prev) => ({
                            ...prev,
                            withdrawalMethod: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl px-5 py-4 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                        style={inputStyle}
                      >
                        <option value="CRYPTO_BTC">Bitcoin (BTC)</option>
                        <option value="CRYPTO_ETH">Ethereum (ETH)</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="WIRE_TRANSFER">Wire Transfer</option>
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={withdrawData.amount}
                          onChange={(e) =>
                            setWithdrawData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className="w-full rounded-2xl px-5 py-4 pl-10 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                          style={inputStyle}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.amount}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          setWithdrawData((prev) => ({
                            ...prev,
                            amount: availableBalance.toString(),
                          }))
                        }
                        className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors font-semibold"
                      >
                        Withdraw All
                      </button>
                    </div>

                    {/* Wallet Address (for crypto) */}
                    {withdrawData.withdrawalMethod.startsWith("CRYPTO") && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Destination Wallet Address
                          </label>
                          <input
                            type="text"
                            value={withdrawData.address}
                            onChange={(e) =>
                              setWithdrawData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            className="w-full rounded-2xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                            style={inputStyle}
                            placeholder="Enter wallet address"
                          />
                          {errors.address && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Memo/Tag (Optional)
                          </label>
                          <input
                            type="text"
                            value={withdrawData.memo}
                            onChange={(e) =>
                              setWithdrawData((prev) => ({
                                ...prev,
                                memo: e.target.value,
                              }))
                            }
                            className="w-full rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                            style={inputStyle}
                            placeholder="Optional"
                          />
                        </div>
                      </>
                    )}

                    {/* Fee Preview - 3D Card */}
                    {fees && (
                      <div
                        className="rounded-2xl p-5"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <h4 className="text-blue-300 font-medium mb-3">
                          Estimated Fees
                        </h4>
                        <div className="space-y-1 text-sm">
                          {fees.breakdown.map((item, index) => (
                            <div key={index} className="text-blue-200">
                              {item}
                            </div>
                          ))}
                          <div className="border-t border-blue-500/30 mt-2 pt-2">
                            <div className="flex justify-between font-medium text-blue-100">
                              <span>Total Fees:</span>
                              <span>${fees.totalFees.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleNext}
                      disabled={!fees || loading}
                      className="w-full py-4 text-white rounded-2xl font-bold transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && fees && (
                  <div className="space-y-6">
                    {/* Withdrawal Summary - 3D Card */}
                    <div
                      className="rounded-2xl p-6 space-y-4"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <h3 className="text-white font-semibold text-lg mb-4">
                        Withdrawal Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method:</span>
                          <span className="text-white">
                            {withdrawData.withdrawalMethod.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white font-medium">
                            ${parseFloat(withdrawData.amount).toFixed(2)}
                          </span>
                        </div>
                        {withdrawData.address && (
                          <div className="flex justify-between items-start">
                            <span className="text-gray-400">Destination:</span>
                            <span className="text-white font-mono text-xs break-all max-w-[60%] text-right">
                              {withdrawData.address.substring(0, 20)}...
                            </span>
                          </div>
                        )}
                        <hr className="border-gray-700 my-3" />
                        <div className="flex justify-between text-yellow-400">
                          <span>Total Fees:</span>
                          <span className="font-medium">
                            ${fees.totalFees.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-3 mt-2">
                          <span>Total Deduction:</span>
                          <span>${totalRequired.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Warning - 3D Card */}
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, rgba(161, 98, 7, 0.1) 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(234, 179, 8, 0.2)",
                      }}
                    >
                      <div className="flex">
                        <svg
                          className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div>
                          <p className="text-yellow-400 text-sm font-medium">
                            Important Notice
                          </p>
                          <p className="text-yellow-300/80 text-sm mt-1">
                            Please verify all details carefully. Withdrawals are
                            subject to processing times and may be irreversible.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="flex-1 py-4 px-4 rounded-2xl font-semibold transition-all text-white disabled:opacity-50"
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex-1 py-4 px-4 rounded-2xl font-bold transition-all text-white disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {loading ? "Processing..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Fee Payment */}
                {step === 3 && fees && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                          background:
                            "linear-gradient(145deg, #2563eb 0%, #4f46e5 100%)",
                          boxShadow:
                            "0 15px 40px -5px rgba(37, 99, 235, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Fee Payment Required
                      </h3>
                      <p className="text-gray-400">
                        To process your withdrawal, please review and authorize
                        the fee deduction
                      </p>
                    </div>

                    {/* Fee Breakdown - 3D Card */}
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <h4 className="text-white font-semibold mb-4">
                        Fee Breakdown
                      </h4>
                      <div className="space-y-3">
                        {fees.breakdown.map((item, index) => {
                          const [label, amount] = item.split(": $");
                          return (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-300 text-sm">
                                {label}
                              </span>
                              <span className="text-white font-medium">
                                ${amount}
                              </span>
                            </div>
                          );
                        })}
                        <hr className="border-gray-700 my-2" />
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-200 font-semibold">
                            Total Fees
                          </span>
                          <span className="text-orange-400 font-bold">
                            ${fees.totalFees.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Total Summary - 3D Card */}
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-blue-300 text-sm">
                            Total Amount to be Deducted
                          </p>
                          <p className="text-blue-200 text-xs mt-1">
                            (Withdrawal + Fees)
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-white">
                          ${totalRequired.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Legal Notice - 3D Card */}
                    <div
                      className="rounded-2xl p-5 text-sm text-gray-400 space-y-3"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <p className="font-medium text-gray-300">
                        By proceeding, you agree to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>
                          The deduction of ${totalRequired.toFixed(2)} from your
                          account balance
                        </li>
                        <li>
                          Processing fees as outlined above for regulatory
                          compliance
                        </li>
                        <li>
                          A processing time of 1-3 business days for your
                          withdrawal
                        </li>
                        <li>
                          That withdrawals may be subject to additional
                          verification
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="flex-1 py-4 px-4 rounded-2xl font-semibold transition-all text-white disabled:opacity-50"
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleFeePayment}
                        disabled={loading}
                        className="flex-1 py-4 px-4 rounded-2xl font-bold transition-all text-white disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {loading ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Authorize & Pay
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
