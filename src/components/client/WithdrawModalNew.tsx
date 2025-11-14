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
        <>
          <motion.div
            key="withdraw-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
          />
          <motion.div
            key="withdraw-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
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
                        d="M17 13l-5 5m0 0l-5-5m5 5V6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Withdraw Funds
                    </h2>
                    <p className="text-gray-400">Step {step} of 3</p>
                  </div>
                </div>

                {/* Step 1: Withdrawal Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Available Balance */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600/30">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">
                          Available Balance:
                        </span>
                        <span className="text-2xl font-bold text-white">
                          ${availableBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Withdrawal Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="CRYPTO_BTC">Bitcoin (BTC)</option>
                        <option value="CRYPTO_ETH">Ethereum (ETH)</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="WIRE_TRANSFER">Wire Transfer</option>
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pl-8 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors"
                      >
                        Withdraw All
                      </button>
                    </div>

                    {/* Wallet Address (for crypto) */}
                    {withdrawData.withdrawalMethod.startsWith("CRYPTO") && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Enter wallet address"
                          />
                          {errors.address && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Optional"
                          />
                        </div>
                      </>
                    )}

                    {/* Fee Preview */}
                    {fees && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-medium mb-2">
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
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && fees && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-5 space-y-3">
                      <h3 className="text-white font-semibold text-lg mb-4">
                        Withdrawal Summary
                      </h3>
                      <div className="space-y-2">
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
                          <div className="flex justify-between">
                            <span className="text-gray-400">Destination:</span>
                            <span className="text-white font-mono text-xs break-all">
                              {withdrawData.address.substring(0, 20)}...
                            </span>
                          </div>
                        )}
                        <hr className="border-gray-600 my-3" />
                        <div className="flex justify-between text-yellow-400">
                          <span>Total Fees:</span>
                          <span className="font-medium">
                            ${fees.totalFees.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-white border-t border-gray-600 pt-2 mt-2">
                          <span>Total Deduction:</span>
                          <span>${totalRequired.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
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
                          <p className="text-yellow-300 text-sm mt-1">
                            Please verify all details carefully. Withdrawals are
                            subject to processing times and may be irreversible.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50"
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
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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

                    {/* Fee Breakdown */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
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

                    {/* Total Summary */}
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
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

                    {/* Legal Notice */}
                    <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400 space-y-2">
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

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setStep(2)}
                        disabled={loading}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleFeePayment}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
