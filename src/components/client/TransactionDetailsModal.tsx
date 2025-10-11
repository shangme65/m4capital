"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export interface DetailedTransaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw" | "convert" | "transfer";
  asset: string;
  amount: number;
  value: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  fee?: number;
  method?: string;
  description?: string;
  date?: Date;
  currency?: string;
  fromAsset?: string;
  toAsset?: string;
  rate?: number;
  confirmations?: number;
  maxConfirmations?: number;
  hash?: string;
  network?: string;
  address?: string;
  memo?: string;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: DetailedTransaction | null;
}

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
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

  if (!transaction) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-900/30 border-green-400/30";
      case "pending":
        return "text-yellow-400 bg-yellow-900/30 border-yellow-400/30";
      case "failed":
        return "text-red-400 bg-red-900/30 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-900/30 border-gray-400/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return (
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
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
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        );
      case "sell":
        return (
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
        );
      case "deposit":
        return (
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        );
      case "withdraw":
        return (
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
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
                d="M18 12H6"
              />
            </svg>
          </div>
        );
      case "convert":
        return (
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date() : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                aria-label="Close transaction details"
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
                <div className="flex items-center gap-4 mb-8">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <h2 className="text-2xl font-bold text-white capitalize">
                      {transaction.type} {transaction.asset}
                    </h2>
                    <p className="text-gray-400">
                      Transaction ID: {transaction.id}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-8">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-lg border ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        transaction.status === "completed"
                          ? "bg-green-400"
                          : transaction.status === "pending"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <span className="font-medium capitalize">
                      {transaction.status}
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Amount
                      </label>
                      <div className="text-white text-lg font-semibold">
                        {transaction.type === "deposit" ||
                        transaction.type === "withdraw"
                          ? `$${transaction.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : `${transaction.amount} ${transaction.asset}`}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Value
                      </label>
                      <div className="text-white text-lg font-semibold">
                        $
                        {transaction.value.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {transaction.fee && (
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">
                          Fee
                        </label>
                        <div className="text-white text-lg font-semibold">
                          ${transaction.fee.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Date & Time
                      </label>
                      <div className="text-white text-lg font-semibold">
                        {transaction.date
                          ? formatDate(transaction.date)
                          : transaction.timestamp}
                      </div>
                    </div>

                    {transaction.method && (
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">
                          Payment Method
                        </label>
                        <div className="text-white text-lg font-semibold">
                          {transaction.method}
                        </div>
                      </div>
                    )}

                    {transaction.rate && (
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">
                          Exchange Rate
                        </label>
                        <div className="text-white text-lg font-semibold">
                          $
                          {transaction.rate.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {(transaction.hash ||
                  transaction.address ||
                  transaction.network) && (
                  <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                    <h3 className="text-white font-semibold mb-4">
                      Network Information
                    </h3>
                    <div className="space-y-3">
                      {transaction.hash && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Transaction Hash
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm break-all">
                              {transaction.hash}
                            </div>
                            <button
                              onClick={() => copyToClipboard(transaction.hash!)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition-colors"
                              aria-label="Copy transaction hash"
                              title="Copy to clipboard"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {transaction.address && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Address
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm break-all">
                              {transaction.address}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(transaction.address!)
                              }
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg transition-colors"
                              aria-label="Copy wallet address"
                              title="Copy to clipboard"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {transaction.network && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Network
                          </label>
                          <div className="text-white font-medium">
                            {transaction.network}
                          </div>
                        </div>
                      )}

                      {transaction.confirmations !== undefined && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Confirmations
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="text-white font-medium">
                              {transaction.confirmations}/
                              {transaction.maxConfirmations || 6}
                            </div>
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                style={
                                  {
                                    width: `${Math.min(
                                      100,
                                      (transaction.confirmations /
                                        (transaction.maxConfirmations || 6)) *
                                        100
                                    )}%`,
                                  } as React.CSSProperties
                                }
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {transaction.description && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <h3 className="text-white font-semibold mb-2">
                      Description
                    </h3>
                    <p className="text-gray-300">{transaction.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                  {transaction.hash && (
                    <button
                      onClick={() =>
                        window.open(
                          `https://blockchain.info/tx/${transaction.hash}`,
                          "_blank"
                        )
                      }
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      View on Blockchain
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
