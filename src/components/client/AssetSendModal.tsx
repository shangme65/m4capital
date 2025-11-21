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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Send {asset.symbol}
                      </h2>
                      <p className="text-blue-100 text-sm">
                        Transfer to another user
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

              <div className="p-6 space-y-5">
                {/* Available Balance */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={asset.symbol} size="sm" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Available Balance
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

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient (Email or Account Number)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  {lookupLoading && (
                    <p className="text-sm text-blue-600 mt-1">
                      Looking up user...
                    </p>
                  )}
                  {receiverName && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {receiverName}
                    </p>
                  )}
                  {errors.destination && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.destination}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 pr-20 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    Use Max
                  </button>
                  {errors.amount && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Memo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Memo (Optional)
                  </label>
                  <textarea
                    value={sendData.memo}
                    onChange={(e) =>
                      setSendData((prev) => ({ ...prev, memo: e.target.value }))
                    }
                    placeholder="Add a note for this transfer"
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={
                    !sendData.amount || !sendData.destination || !receiverName
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                >
                  Send {asset.symbol}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Transaction fee: {transferFee} {asset.symbol}
                </p>
              </div>
            </motion.div>
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
