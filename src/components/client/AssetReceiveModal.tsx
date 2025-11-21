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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Receive {asset.symbol}
                    </h2>
                    <p className="text-teal-100 text-sm">
                      Deposit via NowPayments
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {step === "amount" && (
                <div className="space-y-5">
                  {/* Current Balance */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-teal-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={asset.symbol} size="sm" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Current Balance
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {asset.amount.toFixed(8)} {asset.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {preferredCurrency === "USD"
                            ? "$"
                            : preferredCurrency === "EUR"
                            ? "€"
                            : preferredCurrency === "GBP"
                            ? "£"
                            : preferredCurrency}
                          {convertAmount(asset.amount * asset.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount to Deposit
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.00000001"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00000000"
                        className="w-full px-4 py-3 pr-20 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        {asset.symbol}
                      </span>
                    </div>
                    {depositAmount && parseFloat(depositAmount) > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
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
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
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
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                  >
                    {loading ? "Creating Deposit..." : "Create Deposit Address"}
                  </button>
                </div>
              )}

              {step === "deposit" && paymentData && (
                <div className="space-y-5">
                  {/* Success Message */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Deposit Address Created
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Send exactly {paymentData.payAmount.toFixed(8)}{" "}
                        {paymentData.payCurrency} to the address below
                      </p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-teal-100 space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Payment ID</p>
                      <p className="text-sm font-mono text-gray-900 break-all">
                        {paymentData.paymentId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Amount to Send
                      </p>
                      <p className="text-lg font-bold text-teal-600">
                        {paymentData.payAmount.toFixed(8)}{" "}
                        {paymentData.payCurrency}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-2">
                        Deposit Address
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={paymentData.payAddress}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-900"
                        />
                        <button
                          onClick={copyAddress}
                          className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                        >
                          {copied ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {copied && (
                        <p className="text-xs text-green-600 mt-1">
                          Address copied!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Important:</strong> Only send{" "}
                      {paymentData.payCurrency} to this address. Sending any
                      other currency will result in loss of funds.
                    </p>
                  </div>

                  {/* Done Button */}
                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
