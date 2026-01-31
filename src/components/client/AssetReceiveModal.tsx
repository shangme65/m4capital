"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

interface AssetReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    amount: number;
    price: number;
  };
}

export default function AssetReceiveModal({
  isOpen,
  onClose,
  asset,
}: AssetReceiveModalProps) {
  const [step, setStep] = useState<"amount" | "deposit">("amount");
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    payAddress: string;
    payAmount: number;
    payCurrency: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { preferredCurrency, convertAmount } = useCurrency();

  // Handle close with optional refresh if deposit was initiated
  const handleClose = () => {
    // If user generated a deposit address, refresh to check for any incoming deposits
    if (paymentData) {
      onClose();
      window.location.reload();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setStep("amount");
      setDepositAmount("");
      setPaymentData(null);
      setError("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const createDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const amountUSD = parseFloat(depositAmount) * asset.price;

      const res = await fetch("/api/nowpayments/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountUSD,
          currency: asset.symbol,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create deposit");
      }

      setPaymentData({
        paymentId: data.paymentId,
        payAddress: data.payAddress,
        payAmount: data.payAmount,
        payCurrency: data.payCurrency,
      });
      setStep("deposit");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create deposit");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (paymentData?.payAddress) {
      navigator.clipboard.writeText(paymentData.payAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
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
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Mobile back button */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all z-50 md:hidden"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
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

          {/* Close button - desktop */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 hidden md:flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all z-50"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="h-full overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-start py-16 px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-md"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background:
                        "linear-gradient(145deg, #14b8a6 0%, #06b6d4 100%)",
                      boxShadow:
                        "0 10px 30px -5px rgba(20, 184, 166, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Receive {asset.symbol}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Receive from external wallet
                  </p>
                </div>

                {/* Main Card */}
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                    boxShadow:
                      "0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {step === "amount" && (
                    <div className="space-y-5">
                      {/* Current Balance */}
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
                          border: "1px solid rgba(20, 184, 166, 0.2)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CryptoIcon symbol={asset.symbol} size="sm" />
                            <div>
                              <p className="text-xs text-gray-400">
                                Current Balance
                              </p>
                              <p className="text-lg font-bold text-white">
                                {asset.amount.toFixed(8)} {asset.symbol}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {convertAmount(
                                asset.amount * asset.price
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Amount to Deposit
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.00000001"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="0.00000000"
                            className="w-full px-4 py-3 pr-16 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                            style={{
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                            {asset.symbol}
                          </span>
                        </div>
                        {depositAmount && parseFloat(depositAmount) > 0 && (
                          <p className="text-sm text-gray-400 mt-2">
                            ≈{" "}
                            {preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency}
                            {convertAmount(
                              parseFloat(depositAmount) * asset.price
                            ).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {error && (
                        <div
                          className="rounded-xl p-4 flex items-start gap-3"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                          }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                      )}

                      {/* Create Deposit Button */}
                      <button
                        onClick={createDeposit}
                        disabled={
                          !depositAmount ||
                          parseFloat(depositAmount) <= 0 ||
                          loading
                        }
                        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background:
                            "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #14b8a6 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {loading
                          ? "Creating Deposit..."
                          : "Create Deposit Address"}
                      </button>
                    </div>
                  )}

                  {step === "deposit" && paymentData && (
                    <div className="space-y-5">
                      {/* Success Message */}
                      <div
                        className="rounded-xl p-4 flex items-start gap-3"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-400">
                            Deposit Address Created
                          </p>
                          <p className="text-xs text-green-400/80 mt-1">
                            Send exactly {paymentData.payAmount.toFixed(8)}{" "}
                            {paymentData.payCurrency} to the address below
                          </p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Payment ID
                          </p>
                          <p className="text-sm font-mono text-white break-all">
                            {paymentData.paymentId}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Amount to Send
                          </p>
                          <p className="text-lg font-bold text-teal-400">
                            {paymentData.payAmount.toFixed(8)}{" "}
                            {paymentData.payCurrency}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 mb-2">
                            Deposit Address
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={paymentData.payAddress}
                              readOnly
                              className="flex-1 px-3 py-2 rounded-lg text-sm font-mono text-white"
                              style={{
                                background:
                                  "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                            />
                            <button
                              onClick={copyAddress}
                              className="p-2 rounded-lg text-white transition-colors"
                              style={{
                                background:
                                  "linear-gradient(145deg, #14b8a6 0%, #06b6d4 100%)",
                              }}
                            >
                              {copied ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          {copied && (
                            <p className="text-xs text-green-400 mt-1">
                              Address copied!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Warning */}
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.1) 100%)",
                          border: "1px solid rgba(234, 179, 8, 0.2)",
                        }}
                      >
                        <p className="text-xs text-yellow-400">
                          <strong>Important:</strong> Only send{" "}
                          {paymentData.payCurrency} to this address. Sending any
                          other currency will result in loss of funds.
                        </p>
                      </div>

                      {/* Done Button */}
                      <button
                        onClick={handleClose}
                        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all"
                        style={{
                          background:
                            "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #14b8a6 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
