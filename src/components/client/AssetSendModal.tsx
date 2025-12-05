"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, AlertCircle } from "lucide-react";
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
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount } = useCurrency();

  const transferFee = 0.0001;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSendData({ amount: "", destination: "", memo: "" });
      setReceiverName(null);
      setErrors({});
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

    if (!sendData.amount || parseFloat(sendData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (parseFloat(sendData.amount) > asset.amount) {
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
        const amount = parseFloat(sendData.amount);
        const value = amount * asset.price;

        const transaction = {
          id: `send_${Date.now()}`,
          type: "transfer" as const,
          asset: asset.symbol,
          amount: amount,
          value: value,
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: transferFee,
          method: "P2P Transfer",
          description: `Transfer ${amount.toFixed(8)} ${asset.symbol} to ${
            sendData.destination
          }`,
          memo: sendData.memo,
        };

        addTransaction(transaction);

        const notificationTitle = `Transfer Initiated`;
        const notificationMessage = `Transfer of ${amount.toFixed(8)} ${
          asset.symbol
        } to ${receiverName || sendData.destination} is being processed`;

        addNotification({
          type: "transaction",
          title: notificationTitle,
          message: notificationMessage,
          amount: value,
          asset: asset.symbol,
        });

        // Send email notification
        await fetch("/api/notifications/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "crypto_transfer",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        // Send push notification
        await fetch("/api/notifications/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "crypto_transfer",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        setSuccessData({
          asset: asset.symbol,
          amount: amount,
          value: value,
          recipient: sendData.destination,
        });
        setShowSuccessModal(true);

        setSendData({ amount: "", destination: "", memo: "" });
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing transfer:", error);
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
                        <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {receiverName}
                        </p>
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
                          step="0.00000001"
                          value={sendData.amount}
                          onChange={(e) =>
                            setSendData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="0.00000000"
                          className="w-full px-4 py-3 pr-16 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
                      <button
                        onClick={() =>
                          setSendData((prev) => ({
                            ...prev,
                            amount: asset.amount.toString(),
                          }))
                        }
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
        onClose={() => setShowSuccessModal(false)}
        type="transfer"
        asset={successData?.asset || ""}
        amount={successData?.amount.toString() || "0"}
        value={successData?.value.toString() || "0"}
        recipient={successData?.recipient}
      />
    </>
  );
}
