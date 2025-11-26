"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

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
  // State must be declared at the top before any conditional returns
  const [copied, setCopied] = useState(false);
  const { formatAmount, preferredCurrency } = useCurrency();

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

  // Handle mobile back button to close modal
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      if (isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      // Push a new state when modal opens
      window.history.pushState({ modalOpen: true }, "");
      window.addEventListener("popstate", handleBackButton);
    }

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, onClose]);

  // Handle mobile back button to close modal
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      if (isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      // Push a new state when modal opens
      window.history.pushState({ modalOpen: true }, "");
      window.addEventListener("popstate", handleBackButton);
    }

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, onClose]);

  if (!transaction) return null;

  const getCryptoFullName = (symbol: string) => {
    const cryptoNames: Record<string, { name: string; network?: string }> = {
      BTC: { name: "Bitcoin" },
      ETH: { name: "Ethereum" },
      TON: { name: "Toncoin" },
      TRX: { name: "Tron" },
      XRP: { name: "Ripple" },
      USDT: { name: "Ethereum", network: "ETH" },
      USDC: { name: "Ethereum", network: "ETH" },
    };
    return cryptoNames[symbol] || { name: symbol };
  };

  const getTransactionTitle = () => {
    const crypto = getCryptoFullName(transaction.asset);
    const typeMap: Record<string, string> = {
      buy: "Bought",
      sell: "Sold",
      deposit: "Deposited",
      withdraw: "Withdrew",
      convert: "Converted",
      transfer: "Transferred",
    };
    return `${typeMap[transaction.type] || transaction.type} ${crypto.name}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    const baseClasses =
      "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg";
    switch (type) {
      case "buy":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-green-500 to-green-600`}
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
                strokeWidth={2.5}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        );
      case "sell":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-red-500 to-red-600`}
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
                strokeWidth={2.5}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
        );
      case "deposit":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-blue-500 to-blue-600`}
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
                strokeWidth={2.5}
                d="M12 4v16m0 0l-4-4m4 4l4-4"
              />
            </svg>
          </div>
        );
      case "withdraw":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-purple-500 to-purple-600`}
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
                strokeWidth={2.5}
                d="M12 20V4m0 0l4 4m-4-4l-4 4"
              />
            </svg>
          </div>
        );
      case "convert":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-orange-500 to-orange-600`}
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
                strokeWidth={2.5}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        );
      case "transfer":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-cyan-500 to-cyan-600`}
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
                strokeWidth={2.5}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-gray-500 to-gray-600`}
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
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-hidden"
            style={{ touchAction: "none" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto" }}
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-none sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl relative overflow-hidden border-0 sm:border border-gray-700/50 h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10 backdrop-blur-sm"
                aria-label="Close transaction details"
                title="Close"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Header Section with Gradient Background */}
              <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-3 sm:p-6 pb-6 sm:pb-10">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-5">
                    <div className="flex-shrink-0">
                      <CryptoIcon
                        symbol={transaction.asset}
                        size="lg"
                        showNetwork={
                          transaction.asset === "USDT" ||
                          transaction.asset === "USDC"
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">
                        {getTransactionTitle()}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border font-semibold text-[9px] sm:text-[10px] uppercase tracking-wide ${
                            transaction.status === "completed"
                              ? "bg-green-500/10 text-green-400 border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                              : transaction.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          <div
                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse ${
                              transaction.status === "completed"
                                ? "bg-green-400"
                                : transaction.status === "pending"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10">
                    <label className="block text-gray-400 text-[9px] sm:text-[10px] font-medium mb-1 sm:mb-1.5 uppercase tracking-wider">
                      Transaction ID
                    </label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <code className="flex-1 text-white font-mono text-[10px] sm:text-xs break-all">
                        {transaction.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(transaction.id)}
                        className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
                        aria-label="Copy transaction ID"
                      >
                        {copied ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
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
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-5 pt-0">
                {/* Main Transaction Details */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 -mt-3 sm:-mt-4">
                  {/* Amount Card */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur-sm">
                    <label className="block text-blue-400 text-[9px] sm:text-[10px] font-semibold mb-1 uppercase tracking-wider">
                      Amount
                    </label>
                    <div className="text-white text-[11px] sm:text-sm font-bold break-all">
                      <span className="text-white">
                        {transaction.type === "deposit" ||
                        transaction.type === "withdraw"
                          ? transaction.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : transaction.amount.toLocaleString("en-US", {
                              minimumFractionDigits: 8,
                              maximumFractionDigits: 8,
                            })}
                      </span>{" "}
                      <span className="text-white">{transaction.asset}</span>
                    </div>
                  </div>

                  {/* Value Card */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur-sm">
                    <label className="block text-purple-400 text-[9px] sm:text-[10px] font-semibold mb-1 uppercase tracking-wider">
                      Value
                    </label>
                    <div className="text-white text-[11px] sm:text-sm font-bold">
                      <span className="text-white">
                        {formatAmount(transaction.value, 2)}
                      </span>{" "}
                      <span className="text-white">{preferredCurrency}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  {/* Date & Time */}
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50 flex items-center justify-between">
                    <label className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                      Date & Time
                    </label>
                    <div className="text-white text-[11px] sm:text-sm font-medium text-right">
                      {transaction.date
                        ? formatDate(transaction.date)
                        : transaction.timestamp}
                    </div>
                  </div>

                  {/* Fee */}
                  {transaction.fee && (
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50 flex items-center justify-between">
                      <label className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                        Transaction Fee
                      </label>
                      <div className="text-white text-[11px] sm:text-sm font-medium">
                        {formatAmount(transaction.fee, 2)}
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {transaction.method && (
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50 flex items-center justify-between">
                      <label className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                        Payment Method
                      </label>
                      <div className="text-white text-[11px] sm:text-sm font-medium">
                        {transaction.method}
                      </div>
                    </div>
                  )}

                  {/* Exchange Rate */}
                  {transaction.rate && (
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 border border-gray-700/50 flex items-center justify-between">
                      <label className="text-gray-400 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider">
                        Exchange Rate
                      </label>
                      <div className="text-white text-[11px] sm:text-sm font-medium">
                        $
                        {transaction.rate.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Network Information */}
                {(transaction.hash ||
                  transaction.address ||
                  transaction.network ||
                  transaction.confirmations !== undefined) && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg sm:rounded-xl p-2 sm:p-4 mb-3 sm:mb-4 border border-gray-700/50 backdrop-blur-sm">
                    <h3 className="text-white font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      Network Information
                    </h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {transaction.hash && (
                        <div>
                          <label className="block text-gray-400 text-[9px] sm:text-[10px] font-semibold mb-1 uppercase tracking-wider">
                            Transaction Hash
                          </label>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="flex-1 bg-black/40 border border-gray-600/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-white font-mono text-[10px] sm:text-xs break-all">
                              {transaction.hash}
                            </div>
                            <button
                              onClick={() => copyToClipboard(transaction.hash!)}
                              className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg hover:shadow-orange-500/50"
                              aria-label="Copy transaction hash"
                            >
                              {copied ? (
                                <svg
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {transaction.address && (
                        <div>
                          <label className="block text-gray-400 text-[9px] sm:text-[10px] font-semibold mb-1 uppercase tracking-wider">
                            Wallet Address
                          </label>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="flex-1 bg-black/40 border border-gray-600/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-white font-mono text-[10px] sm:text-xs break-all">
                              {transaction.address}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(transaction.address!)
                              }
                              className="flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg hover:shadow-orange-500/50"
                              aria-label="Copy wallet address"
                            >
                              {copied ? (
                                <svg
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {transaction.network && (
                        <div>
                          <label className="block text-gray-400 text-[9px] sm:text-[10px] font-semibold mb-1 uppercase tracking-wider">
                            Network
                          </label>
                          <div className="text-white font-semibold text-[11px] sm:text-sm bg-black/40 border border-gray-600/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                            {transaction.network}
                          </div>
                        </div>
                      )}

                      {transaction.confirmations !== undefined && (
                        <div>
                          <label className="block text-gray-400 text-[9px] sm:text-[10px] font-semibold mb-1 uppercase tracking-wider">
                            Confirmations
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-700/50 rounded-full h-2 sm:h-2.5 overflow-hidden border border-gray-600/30">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-500 shadow-lg"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (transaction.confirmations /
                                      (transaction.maxConfirmations || 6)) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex-shrink-0 text-white font-bold text-[10px] sm:text-xs bg-gray-700/50 border border-gray-600/30 rounded-lg px-2 py-1">
                              {transaction.confirmations}/
                              {transaction.maxConfirmations || 6}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {transaction.description && (
                  <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-gray-700/50">
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Description
                    </h3>
                    <p className="text-gray-300 text-[10px] sm:text-xs leading-relaxed">
                      {transaction.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-xs sm:text-sm"
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
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold transition-all shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
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
