"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [withdrawData, setWithdrawData] = useState({
    asset: "BTC",
    amount: "",
    address: "",
    memo: "",
    twoFACode: "",
  });
  const [availableBalances] = useState({
    BTC: 0.8542,
    ETH: 12.67,
    ADA: 8420.15,
    SOL: 45.23,
  });
  const [estimatedFee, setEstimatedFee] = useState(0.0005);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();

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

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
        newErrors.amount = "Please enter a valid amount";
      }
      if (
        parseFloat(withdrawData.amount) >
        availableBalances[withdrawData.asset as keyof typeof availableBalances]
      ) {
        newErrors.amount = "Insufficient balance";
      }
      if (!withdrawData.address.trim()) {
        newErrors.address = "Wallet address is required";
      }
    }

    if (currentStep === 2) {
      if (!withdrawData.twoFACode.trim()) {
        newErrors.twoFACode = "2FA code is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleWithdraw = () => {
    if (validateStep(step)) {
      try {
        // Create transaction
        const transaction = {
          id: `withdraw_${Date.now()}`,
          type: "withdraw" as const,
          asset: withdrawData.asset,
          amount: parseFloat(withdrawData.amount),
          value:
            parseFloat(withdrawData.amount) *
            (withdrawData.asset === "BTC"
              ? 65000
              : withdrawData.asset === "ETH"
              ? 2500
              : 0.5),
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: estimatedFee,
          method: "Cryptocurrency",
          description: `Withdraw ${withdrawData.amount} ${withdrawData.asset} to external wallet`,
          address: withdrawData.address,
          network:
            withdrawData.asset === "BTC"
              ? "Bitcoin Network"
              : "Ethereum Network",
        };

        addTransaction(transaction);

        // Create notification
        addNotification({
          type: "transaction",
          title: "Withdrawal Initiated",
          message: `Your withdrawal of ${withdrawData.amount} ${withdrawData.asset} is being processed`,
        });

        // Reset form and close modal
        setWithdrawData({
          asset: "BTC",
          amount: "",
          address: "",
          memo: "",
          twoFACode: "",
        });
        setStep(1);
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing withdrawal:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
        <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Close withdraw modal"
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
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
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
                  Withdraw Crypto
                </h2>
                <p className="text-gray-400">Step {step} of 2</p>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                {/* Asset Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Asset
                  </label>
                  <select
                    value={withdrawData.asset}
                    onChange={(e) =>
                      setWithdrawData((prev) => ({
                        ...prev,
                        asset: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    aria-label="Select asset to withdraw"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="ADA">Cardano (ADA)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </select>
                </div>

                {/* Available Balance */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Available Balance:</span>
                    <span className="text-white font-medium">
                      {
                        availableBalances[
                          withdrawData.asset as keyof typeof availableBalances
                        ]
                      }{" "}
                      {withdrawData.asset}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.00000001"
                      value={withdrawData.amount}
                      onChange={(e) =>
                        setWithdrawData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pr-16 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {withdrawData.asset}
                    </span>
                  </div>
                  {errors.amount && (
                    <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                  )}

                  <button
                    onClick={() =>
                      setWithdrawData((prev) => ({
                        ...prev,
                        amount: (
                          availableBalances[
                            withdrawData.asset as keyof typeof availableBalances
                          ] - estimatedFee
                        ).toString(),
                      }))
                    }
                    className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors"
                  >
                    Use Max
                  </button>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wallet Address
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
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter destination wallet address"
                  />
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Memo (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Memo (Optional)
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
                    placeholder="Enter memo if required"
                  />
                </div>

                {/* Fee Information */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Network Fee:</span>
                    <span className="text-white">
                      {estimatedFee} {withdrawData.asset}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-300">You will receive:</span>
                    <span className="text-white">
                      {withdrawData.amount
                        ? (
                            parseFloat(withdrawData.amount) - estimatedFee
                          ).toFixed(8)
                        : "0.00"}{" "}
                      {withdrawData.asset}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Confirmation Details */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <h3 className="text-white font-medium mb-3">
                    Withdrawal Summary
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Asset:</span>
                    <span className="text-white">{withdrawData.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {withdrawData.amount} {withdrawData.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee:</span>
                    <span className="text-white">
                      {estimatedFee} {withdrawData.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Destination:</span>
                    <span className="text-white font-mono text-sm break-all">
                      {withdrawData.address}
                    </span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-300">Total Deducted:</span>
                    <span className="text-white">
                      {(parseFloat(withdrawData.amount) + estimatedFee).toFixed(
                        8
                      )}{" "}
                      {withdrawData.asset}
                    </span>
                  </div>
                </div>

                {/* 2FA Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Two-Factor Authentication Code
                  </label>
                  <input
                    type="text"
                    value={withdrawData.twoFACode}
                    onChange={(e) =>
                      setWithdrawData((prev) => ({
                        ...prev,
                        twoFACode: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  {errors.twoFACode && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.twoFACode}
                    </p>
                  )}
                </div>

                {/* Warning */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex">
                    <svg
                      className="w-5 h-5 text-yellow-400 mt-0.5 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">
                        Important Notice
                      </p>
                      <p className="text-yellow-300 text-sm mt-1">
                        Please verify the destination address carefully.
                        Cryptocurrency transactions are irreversible.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
