"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Copy, CheckCircle, AlertCircle, ArrowUpDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("crypto");
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", BRL: "R$", NGN: "₦", JPY: "¥", KRW: "₩", INR: "₹", ZAR: "R", CHF: "CHF", CAD: "C$", AUD: "A$" };
    return symbols[currency] || currency + " ";
  };

  // Get the crypto amount regardless of input mode
  const getCryptoAmount = (): number => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return 0;
    if (inputMode === "fiat") {
      // Convert fiat (in preferred currency) to USD, then to crypto
      const usdValue = convertAmount(val, true);
      return usdValue / asset.price;
    }
    return val;
  };

  // Handle close with optional refresh if deposit was initiated
  const handleClose = () => {
    // If user generated a deposit address, refresh to check for any incoming deposits
    if (paymentData) {
      onClose();
      window.location.href = "/dashboard";
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
      setInputMode("crypto");
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
      const cryptoAmount = getCryptoAmount();
      const amountUSD = cryptoAmount * asset.price;

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
          style={isDark ? {
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)",
          } : {
            background:
              "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 25%, #ddd6fe 50%, #e0f2fe 75%, #f8fafc 100%)",
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
              isDark ? "bg-teal-500/10" : "bg-teal-500/20"
            }`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
              isDark ? "bg-cyan-500/10" : "bg-cyan-500/20"
            }`} />
          </div>

          {/* Mobile back button */}
          <button
            onClick={handleClose}
            className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-xl transition-all z-50 md:hidden ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
            style={isDark ? {
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            } : {
              background:
                "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
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
            className={`absolute top-4 right-4 w-10 h-10 hidden md:flex items-center justify-center rounded-xl transition-all z-50 ${
              isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
            }`}
            style={isDark ? {
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            } : {
              background:
                "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
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
                  <h2 className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Receive {asset.symbol}
                  </h2>
                  <p className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Receive from external wallet
                  </p>
                </div>

                {/* Main Card */}
                <div
                  className="rounded-2xl p-5"
                  style={isDark ? {
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                    boxShadow:
                      "0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  } : {
                    background:
                      "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                    boxShadow:
                      "0 20px 50px -10px rgba(0, 0, 0, 0.25), inset 0 2px 0 rgba(255, 255, 255, 1)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {step === "amount" && (
                    <div className="space-y-5">
                      {/* Current Balance */}
                      <div
                        className="rounded-xl p-4"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
                          border: "1px solid rgba(20, 184, 166, 0.2)",
                        } : {
                          background:
                            "linear-gradient(145deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
                          border: "1px solid rgba(20, 184, 166, 0.3)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CryptoIcon symbol={asset.symbol} size="sm" />
                            <div>
                              <p className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}>
                                Current Balance
                              </p>
                              <p className={`text-lg font-bold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}>
                                {asset.amount.toFixed(8)} {asset.symbol}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}>
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
                        <label className={`block text-xs font-semibold mb-2 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Amount to Deposit
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step={inputMode === "crypto" ? "0.00000001" : "0.01"}
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder={inputMode === "crypto" ? "0.00000000" : "0.00"}
                            className={`w-full px-4 py-3 pr-24 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                            style={isDark ? {
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            } : {
                              background:
                                "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = parseFloat(depositAmount);
                              if (!isNaN(val) && val > 0) {
                                if (inputMode === "crypto") {
                                  // Convert crypto to fiat
                                  const fiatValue = convertAmount(val * asset.price);
                                  setDepositAmount(fiatValue.toFixed(2));
                                } else {
                                  // Convert fiat to crypto
                                  const usdValue = convertAmount(val, true);
                                  const cryptoValue = usdValue / asset.price;
                                  setDepositAmount(cryptoValue.toFixed(8));
                                }
                              }
                              setInputMode(inputMode === "crypto" ? "fiat" : "crypto");
                            }}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm font-medium transition-colors ${
                              isDark ? "text-gray-400 hover:text-teal-400" : "text-gray-600 hover:text-teal-600"
                            }`}>
                            <span>{inputMode === "crypto" ? asset.symbol : preferredCurrency}</span>
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {depositAmount && parseFloat(depositAmount) > 0 && (
                          <p className={`text-sm mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {inputMode === "crypto" ? (
                              <>≈ {getCurrencySymbol(preferredCurrency)}{convertAmount(parseFloat(depositAmount) * asset.price).toFixed(2)}</>
                            ) : (
                              <>≈ {getCryptoAmount().toFixed(8)} {asset.symbol}</>
                            )}
                          </p>
                        )}
                      </div>

                      {error && (
                        <div
                          className="rounded-xl p-4 flex items-start gap-3"
                          style={isDark ? {
                            background:
                              "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                          } : {
                            background:
                              "linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                          }}
                        >
                          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            isDark ? "text-red-400" : "text-red-600"
                          }`} />
                          <p className={`text-sm ${
                            isDark ? "text-red-400" : "text-red-600"
                          }`}>{error}</p>
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
                        style={isDark ? {
                          background:
                            "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #14b8a6 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        } : {
                          background:
                            "linear-gradient(135deg, #5eead4 0%, #22d3ee 50%, #5eead4 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(20, 184, 166, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
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
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        } : {
                          background:
                            "linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                        }}
                      >
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`} />
                        <div>
                          <p className={`text-sm font-semibold ${
                            isDark ? "text-green-400" : "text-green-600"
                          }`}>
                            Deposit Address Created
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDark ? "text-green-400/80" : "text-green-600/80"
                          }`}>
                            Send exactly {paymentData.payAmount.toFixed(8)}{" "}
                            {paymentData.payCurrency} to the address below
                          </p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-3">
                        <div>
                          <p className={`text-xs mb-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Payment ID
                          </p>
                          <p className={`text-sm font-mono break-all ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {paymentData.paymentId}
                          </p>
                        </div>

                        <div>
                          <p className={`text-xs mb-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Amount to Send
                          </p>
                          <p className={`text-lg font-bold ${
                            isDark ? "text-teal-400" : "text-teal-600"
                          }`}>
                            {paymentData.payAmount.toFixed(8)}{" "}
                            {paymentData.payCurrency}
                          </p>
                        </div>

                        <div>
                          <p className={`text-xs mb-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Deposit Address
                          </p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={paymentData.payAddress}
                              readOnly
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-mono ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                              style={isDark ? {
                                background:
                                  "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                              } : {
                                background:
                                  "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                                border: "1px solid rgba(0, 0, 0, 0.1)",
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
                            <p className={`text-xs mt-1 ${
                              isDark ? "text-green-400" : "text-green-600"
                            }`}>
                              Address copied!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Warning */}
                      <div
                        className="rounded-xl p-4"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.1) 100%)",
                          border: "1px solid rgba(234, 179, 8, 0.2)",
                        } : {
                          background:
                            "linear-gradient(145deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.15) 100%)",
                          border: "1px solid rgba(234, 179, 8, 0.3)",
                        }}
                      >
                        <p className={`text-xs ${
                          isDark ? "text-yellow-400" : "text-yellow-700"
                        }`}>
                          <strong>Important:</strong> Only send{" "}
                          {paymentData.payCurrency} to this address. Sending any
                          other currency will result in loss of funds.
                        </p>
                      </div>

                      {/* Done Button */}
                      <button
                        onClick={handleClose}
                        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all"
                        style={isDark ? {
                          background:
                            "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #14b8a6 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        } : {
                          background:
                            "linear-gradient(135deg, #5eead4 0%, #22d3ee 50%, #5eead4 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(20, 184, 166, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
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
