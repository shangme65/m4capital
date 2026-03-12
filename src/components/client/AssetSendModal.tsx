"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, AlertCircle, ArrowUpDown, CheckCircle } from "lucide-react";
import { VscVerifiedFilled } from "react-icons/vsc";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import SuccessModal from "@/components/client/SuccessModal";

interface AssetSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    amount: number;
    price: number;
  };
}

export default function AssetSendModal({
  isOpen,
  onClose,
  asset,
}: AssetSendModalProps) {
  const [sendData, setSendData] = useState({
    amount: "",
    destination: "",
    memo: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    recipient: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [receiverVerified, setReceiverVerified] = useState<boolean>(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("crypto");
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", BRL: "R$", NGN: "₦", JPY: "¥", KRW: "₩", INR: "₹", ZAR: "R", CHF: "CHF", CAD: "C$", AUD: "A$" };
    return symbols[currency] || currency + " ";
  };

  // Get the crypto amount regardless of input mode
  const getCryptoAmount = (): number => {
    const val = parseFloat(sendData.amount);
    if (isNaN(val) || val <= 0) return 0;
    if (inputMode === "fiat") {
      // Convert fiat (in preferred currency) to USD, then to crypto
      const usdValue = convertAmount(val, true);
      return usdValue / asset.price;
    }
    return val;
  };

  const transferFee = 0.0001;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSendData({ amount: "", destination: "", memo: "" });
      setReceiverName(null);
      setReceiverVerified(false);
      setErrors({});
      setInputMode("crypto");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const lookupReceiver = async (identifier: string) => {
    if (!identifier.trim()) {
      setReceiverName(null);
      setReceiverVerified(false);
      return;
    }
    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/p2p-transfer/lookup-receiver?identifier=${encodeURIComponent(
          identifier
        )}`
      );
      const data = await res.json();
      if (res.ok && data.receiver) {
        setReceiverName(data.receiver.name);
        setReceiverVerified(data.receiver.isVerified || false);
      } else {
        setReceiverName(null);
        setReceiverVerified(false);
      }
    } catch (error) {
      console.error("Error looking up receiver:", error);
      setReceiverName(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const cryptoAmount = getCryptoAmount();

    if (!sendData.amount || cryptoAmount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (cryptoAmount > asset.amount) {
      newErrors.amount = "Insufficient balance";
    }

    if (!sendData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    const dest = sendData.destination.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest);
    const isAccountNumber = /^\d{8,}$/.test(dest);

    if (!isEmail && !isAccountNumber) {
      newErrors.destination = "Enter a valid email or account number";
    }

    if (!receiverName) {
      newErrors.destination = "User not found";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (validateForm()) {
      try {
        const amount = getCryptoAmount();
        const value = amount * asset.price;

        // Call the API to process the transfer on the server
        const response = await fetch("/api/crypto/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset: asset.symbol,
            amount: amount,
            destination: sendData.destination,
            memo: sendData.memo,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Show error message
          setErrors({ destination: data.error || "Transfer failed" });
          return;
        }

        // Transfer successful - show success modal
        setSuccessData({
          asset: asset.symbol,
          amount: amount,
          value: value,
          recipient: data.recipientName || sendData.destination,
        });
        setShowSuccessModal(true);

        // Reset form
        setSendData({ amount: "", destination: "", memo: "" });
        setReceiverName(null);
        setErrors({});
      } catch (error) {
        console.error("Error processing transfer:", error);
        setErrors({ destination: "Network error. Please try again." });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
                "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 25%, #ddd6fe 50%, #e0e7ff 75%, #f8fafc 100%)",
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
                isDark ? "bg-blue-500/10" : "bg-blue-500/20"
              }`} />
              <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${
                isDark ? "bg-indigo-500/10" : "bg-indigo-500/20"
              }`} />
            </div>

            {/* Mobile back button */}
            <button
              onClick={onClose}
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
                border: "1px solid rgba(0, 0, 0, 0.08)",
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
              onClick={onClose}
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
                border: "1px solid rgba(0, 0, 0, 0.08)",
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
                          "linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(59, 130, 246, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h2 className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      Send {asset.symbol}
                    </h2>
                    <p className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Transfer to another user
                    </p>
                  </div>

                  {/* Main Card */}
                  <div
                    className="rounded-2xl p-5 space-y-5"
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
                        "0 20px 50px -10px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 1)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    {/* Available Balance */}
                    <div
                      className="rounded-xl p-4"
                      style={isDark ? {
                        background:
                          "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      } : {
                        background:
                          "linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={asset.symbol} size="sm" />
                        <div className="flex-1">
                          <p className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            Available Balance
                          </p>
                          <p className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {asset.amount < 0.0001 
                              ? asset.amount.toFixed(8) 
                              : asset.amount < 1 
                                ? asset.amount.toFixed(6)
                                : asset.amount < 100
                                  ? asset.amount.toFixed(4)
                                  : asset.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {asset.symbol}
                          </p>
                          <p className={`text-sm mt-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency}
                            {convertAmount(asset.amount * asset.price).toLocaleString(undefined, { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Recipient (Email or Account Number)
                      </label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`} />
                        <input
                          type="text"
                          value={sendData.destination}
                          onChange={(e) => {
                            setSendData((prev) => ({
                              ...prev,
                              destination: e.target.value,
                            }));
                            lookupReceiver(e.target.value);
                          }}
                          placeholder="user@example.com or 12345678"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
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
                      </div>
                      {lookupLoading && (
                        <p className={`text-sm mt-1 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}>
                          Looking up user...
                        </p>
                      )}
                      {receiverName && (
                        <div className="mt-3 space-y-2">
                          {/* 3D Recipient Card */}
                          <div
                            className="rounded-xl p-3"
                            style={isDark ? {
                              background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                              boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                            } : {
                              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                              boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)",
                              border: "1px solid rgba(0, 0, 0, 0.08)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)",
                                  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)",
                                }}
                              >
                                <span className="text-white font-bold text-sm">
                                  {receiverName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {/* Name and verification */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-semibold text-sm truncate ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}>
                                    {receiverName}
                                  </span>
                                  {receiverVerified && (
                                    <VscVerifiedFilled className="text-green-500 flex-shrink-0" size={16} />
                                  )}
                                </div>
                                <p className={`text-xs ${
                                  receiverVerified 
                                    ? (isDark ? "text-green-400" : "text-green-600")
                                    : (isDark ? "text-yellow-400" : "text-yellow-600")
                                }`}>
                                  {receiverVerified ? "✓ Verified Account" : "⚠ Unverified Account"}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Warning for unverified recipients */}
                          {!receiverVerified && (
                            <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                              isDark 
                                ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}>
                              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>This account is not verified. Please double-check the recipient before sending.</span>
                            </div>
                          )}
                        </div>
                      )}
                      {errors.destination && (
                        <p className={`text-sm mt-1 flex items-center gap-1 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}>
                          <AlertCircle className="w-4 h-4" />
                          {errors.destination}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Amount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={inputMode === "crypto" ? "0.00000001" : "0.01"}
                          value={sendData.amount}
                          onChange={(e) =>
                            setSendData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          placeholder={inputMode === "crypto" ? "0.00000000" : "0.00"}
                          className={`w-full px-4 py-3 pr-24 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
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
                            const val = parseFloat(sendData.amount);
                            if (!isNaN(val) && val > 0) {
                              if (inputMode === "crypto") {
                                // crypto → fiat
                                const usdValue = val * asset.price;
                                const fiatValue = convertAmount(usdValue);
                                setSendData((prev) => ({ ...prev, amount: fiatValue.toFixed(2) }));
                              } else {
                                // fiat → crypto
                                const usdValue = convertAmount(val, true);
                                const cryptoVal = usdValue / asset.price;
                                setSendData((prev) => ({ ...prev, amount: cryptoVal.toFixed(8) }));
                              }
                            }
                            setInputMode(inputMode === "crypto" ? "fiat" : "crypto");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-blue-500/10"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          {inputMode === "crypto" ? asset.symbol : preferredCurrency}
                        </button>
                      </div>
                      {/* Show equivalent in the other currency */}
                      {sendData.amount && parseFloat(sendData.amount) > 0 && (
                        <p className={`text-xs mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-600"
                        }`}>
                          ≈{" "}
                          {inputMode === "crypto"
                            ? `${getCurrencySymbol(preferredCurrency)}${convertAmount(parseFloat(sendData.amount) * asset.price).toFixed(2)} ${preferredCurrency}`
                            : `${getCryptoAmount().toFixed(8)} ${asset.symbol}`}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          if (inputMode === "crypto") {
                            setSendData((prev) => ({ ...prev, amount: asset.amount.toString() }));
                          } else {
                            const maxFiat = convertAmount(asset.amount * asset.price);
                            setSendData((prev) => ({ ...prev, amount: maxFiat.toFixed(2) }));
                          }
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium mt-2"
                      >
                        Use Max
                      </button>
                      {errors.amount && (
                        <p className={`text-sm mt-1 flex items-center gap-1 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}>
                          <AlertCircle className="w-4 h-4" />
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    {/* Memo */}
                    <div>
                      <label className={`block text-xs font-semibold mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Memo (Optional)
                      </label>
                      <textarea
                        value={sendData.memo}
                        onChange={(e) =>
                          setSendData((prev) => ({
                            ...prev,
                            memo: e.target.value,
                          }))
                        }
                        placeholder="Add a note for this transfer"
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none ${
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
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={
                        !sendData.amount ||
                        !sendData.destination ||
                        !receiverName
                      }
                      className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={isDark ? {
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      } : {
                        background:
                          "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #60a5fa 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      Send {asset.symbol}
                    </button>

                    <p className={`text-xs text-center ${
                      isDark ? "text-gray-500" : "text-gray-600"
                    }`}>
                      Transaction fee: {transferFee} {asset.symbol}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
          window.location.href = "/dashboard";
        }}
        type="transfer"
        asset={successData?.asset || ""}
        amount={successData?.amount.toString() || "0"}
        value={successData?.value.toString() || "0"}
        recipient={successData?.recipient}
      />
    </>
  );
}
