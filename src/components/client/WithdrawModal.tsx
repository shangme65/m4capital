"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { useCurrency } from "@/contexts/CurrencyContext";
import Image from "next/image";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    asset: "BTC",
    amount: "",
    address: "",
    memo: "",
    twoFACode: "",
  });
  const { portfolio } = usePortfolio();
  const [estimatedFee, setEstimatedFee] = useState(0.0005);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();
  const { formatAmount, preferredCurrency } = useCurrency();

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
            style={{
              ...card3DStyle,
            }}
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
                    {step === 2 && "Security Check"}
                    {step === 3 && "Confirm"}
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
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Withdrawal Method */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Withdrawal Method
                      </label>
                      <select
                        value={withdrawData.asset}
                        onChange={(e) =>
                          setWithdrawData((prev) => ({
                            ...prev,
                            asset: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl px-5 py-4 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                        style={inputStyle}
                        aria-label="Select asset to withdraw"
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="ADA">Cardano (ADA)</option>
                        <option value="SOL">Solana (SOL)</option>
                      </select>
                    </div>

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
                        <div className="text-right">
                          <span className="text-white font-semibold text-lg block">
                            {
                              availableBalances[
                                withdrawData.asset as keyof typeof availableBalances
                              ]
                            }{" "}
                            {withdrawData.asset}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatAmount(
                              (availableBalances[
                                withdrawData.asset as keyof typeof availableBalances
                              ] || 0) *
                                (withdrawData.asset === "BTC"
                                  ? 95000
                                  : withdrawData.asset === "ETH"
                                  ? 3500
                                  : withdrawData.asset === "SOL"
                                  ? 200
                                  : 0.5),
                              2
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Amount ({withdrawData.asset})
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
                          className="w-full rounded-2xl px-5 py-4 pr-20 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                          style={inputStyle}
                          placeholder="0.00"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                          {withdrawData.asset}
                        </span>
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
                            amount: (
                              availableBalances[
                                withdrawData.asset as keyof typeof availableBalances
                              ] - estimatedFee
                            ).toString(),
                          }))
                        }
                        className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors font-semibold"
                      >
                        Withdraw All
                      </button>
                    </div>

                    {/* Destination Wallet Address */}
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
                        className="w-full rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                        style={inputStyle}
                        placeholder="Enter wallet address"
                      />
                      {errors.address && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    {/* Memo/Tag (Optional) */}
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
                        className="w-full rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                        style={inputStyle}
                        placeholder="Optional"
                      />
                    </div>

                    {/* Processing Information - 3D Card */}
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
                            Withdrawals typically process within 10-30 minutes
                            depending on network congestion.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleNext}
                      className="w-full py-4 text-white rounded-2xl font-bold transition-all text-lg"
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

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="text-center mb-6">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{
                          background:
                            "linear-gradient(145deg, #dc2626 0%, #ea580c 100%)",
                          boxShadow:
                            "0 15px 40px -5px rgba(220, 38, 38, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Security Verification
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Enter your 2FA code to continue
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
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
                        className="w-full rounded-2xl px-5 py-4 text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                        style={inputStyle}
                        placeholder="000000"
                        maxLength={6}
                      />
                      {errors.twoFACode && (
                        <p className="text-red-400 text-sm mt-2 text-center">
                          {errors.twoFACode}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 px-4 rounded-2xl font-semibold transition-all text-white"
                        style={{
                          ...card3DStyle,
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-4 px-4 rounded-2xl font-bold transition-all text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Verify & Continue
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    {/* Confirmation Details - 3D Card */}
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
                      <div className="flex justify-between">
                        <span className="text-gray-400">Asset:</span>
                        <span className="text-white">{withdrawData.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <div className="text-right">
                          <span className="text-white font-semibold block">
                            {withdrawData.amount} {withdrawData.asset}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatAmount(
                              parseFloat(withdrawData.amount) *
                                (withdrawData.asset === "BTC"
                                  ? 95000
                                  : withdrawData.asset === "ETH"
                                  ? 3500
                                  : withdrawData.asset === "SOL"
                                  ? 200
                                  : 0.5),
                              2
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Network Fee:</span>
                        <div className="text-right">
                          <span className="text-white block">
                            {estimatedFee} {withdrawData.asset}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatAmount(
                              estimatedFee *
                                (withdrawData.asset === "BTC"
                                  ? 95000
                                  : withdrawData.asset === "ETH"
                                  ? 3500
                                  : withdrawData.asset === "SOL"
                                  ? 200
                                  : 0.5),
                              2
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-gray-400">Destination:</span>
                        <span className="text-white font-mono text-sm break-all max-w-[60%] text-right">
                          {withdrawData.address}
                        </span>
                      </div>
                      <hr className="border-gray-700" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-300 text-lg">
                          Total Deducted:
                        </span>
                        <div className="text-right">
                          <span className="text-white text-lg block">
                            {(
                              parseFloat(withdrawData.amount) + estimatedFee
                            ).toFixed(8)}{" "}
                            {withdrawData.asset}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatAmount(
                              (parseFloat(withdrawData.amount) + estimatedFee) *
                                (withdrawData.asset === "BTC"
                                  ? 95000
                                  : withdrawData.asset === "ETH"
                                  ? 3500
                                  : withdrawData.asset === "SOL"
                                  ? 200
                                  : 0.5),
                              2
                            )}
                          </span>
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <p className="text-yellow-400 text-sm font-medium">
                            Important Notice
                          </p>
                          <p className="text-yellow-300/80 text-sm mt-1">
                            Please verify the destination address carefully.
                            Cryptocurrency transactions are irreversible.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 py-4 px-4 rounded-2xl font-semibold transition-all text-white"
                        style={{
                          ...card3DStyle,
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleWithdraw}
                        className="flex-1 py-4 px-4 rounded-2xl font-bold transition-all text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Confirm Withdrawal
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
