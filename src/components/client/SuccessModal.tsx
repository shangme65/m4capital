"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "buy" | "sell" | "transfer" | "swap";
  asset?: string;
  amount?: string;
  value?: string;
  toAsset?: string;
  toAmount?: string;
  recipient?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  type,
  asset = "",
  amount = "",
  value = "",
  toAsset = "",
  toAmount = "",
  recipient = "",
}: SuccessModalProps) {
  const getTitle = () => {
    switch (type) {
      case "buy":
        return "Purchase Successful!";
      case "sell":
        return "Sale Successful!";
      case "transfer":
        return "Transfer Successful!";
      case "swap":
        return "Swap Successful!";
      default:
        return "Transaction Successful!";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "buy":
        return `You have successfully purchased ${amount} ${asset}`;
      case "sell":
        return `You have successfully sold ${amount} ${asset}`;
      case "transfer":
        return `You have successfully transferred ${amount} ${asset}${
          recipient ? ` to ${recipient}` : ""
        }`;
      case "swap":
        return `You have successfully swapped ${amount} ${asset} for ${toAmount} ${toAsset}`;
      default:
        return "Your transaction has been completed successfully";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-green-600 to-emerald-600">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle size={64} className="text-white mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-300 text-lg">{getMessage()}</p>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-900/50 rounded-xl p-4 mb-6 space-y-3">
                {type !== "swap" && asset && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Asset</span>
                    <div className="flex items-center gap-2">
                      <CryptoIcon symbol={asset} size="sm" />
                      <span className="text-white font-semibold">{asset}</span>
                    </div>
                  </div>
                )}

                {type === "swap" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">From</span>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={asset} size="sm" />
                        <span className="text-white font-semibold">
                          {amount} {asset}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">To</span>
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={toAsset} size="sm" />
                        <span className="text-white font-semibold">
                          {toAmount} {toAsset}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {amount && type !== "swap" && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-white font-semibold">{amount}</span>
                  </div>
                )}

                {value && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Value</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                )}

                {recipient && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Recipient</span>
                    <span className="text-white font-semibold truncate max-w-[200px]">
                      {recipient}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 font-semibold">
                    Completed
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="text-white">
                    {new Date()
                      .toLocaleString("en-CA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })
                      .replace(",", "")}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
