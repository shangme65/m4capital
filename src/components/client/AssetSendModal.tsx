"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, AlertCircle, ArrowUpDown, CheckCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  const [lookupLoading, setLookupLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"crypto" | "fiat">("crypto");
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount } = useCurrency();

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
      } else {
        setReceiverName(null);
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
            style={{
              background:
                "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)",
            }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Mobile back button */}
            <button
              onClick={onClose}
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
              onClick={onClose}
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
                          "linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(59, 130, 246, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Send {asset.symbol}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Transfer to another user
                    </p>
                  </div>

                  {/* Main Card */}
                  <div
                    className="rounded-2xl p-5 space-y-5"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {/* Available Balance */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CryptoIcon symbol={asset.symbol} size="sm" />
                          <div>
                            <p className="text-xs text-gray-400">
                              Available Balance
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
                            {convertAmount(asset.amount * asset.price).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        Recipient (Email or Account Number)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        />
                      </div>
                      {lookupLoading && (
                        <p className="text-sm text-blue-400 mt-1">
                          Looking up user...
                        </p>
                      )}
                      {receiverName && (
                        <div className="mt-2 flex flex-row items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 w-fit">
                          <span className="text-sm font-medium text-white whitespace-nowrap leading-none">{receiverName}</span>
                          <svg className="w-5 h-5 flex-shrink-0 self-center" viewBox="0 0 24 24" fill="none">
                            <path d="M12 1l2.09 3.36L18 3.27l-.91 3.87L20.18 10l-3.36 2.09.09 4.73-3.87-.91L10 18.18l-2.09-3.36L4 15.73l.91-3.87L1.82 10l3.36-2.09L5.09 3.18l3.87.91L12 1z" fill="#25D366" />
                            <path d="M8.5 10.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      {errors.destination && (
                        <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.destination}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
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
                          className="w-full px-4 py-3 pr-24 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
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
                        <p className="text-xs text-gray-500 mt-1">
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
                        <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.amount}
                        </p>
                      )}
                    </div>

                    {/* Memo */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
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
                        className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
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
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Send {asset.symbol}
                    </button>

                    <p className="text-xs text-center text-gray-500">
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
          window.location.reload();
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
