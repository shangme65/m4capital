"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { formatCurrency as formatCurrencyUtil } from "@/lib/currencies";

// Fiat currencies that should NOT be converted (already in user's currency)
const FIAT_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "BRL",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "INR",
  "CNY",
  "KRW",
  "NGN",
]);

export interface DetailedTransaction {
  id: string;
  type:
    | "buy"
    | "sell"
    | "deposit"
    | "withdraw"
    | "convert"
    | "transfer"
    | "send"
    | "receive";
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
  fromAmount?: number;
  toAmount?: number;
  fromPriceUSD?: number;
  toPriceUSD?: number;
  fromValueUSD?: number;
  toValueUSD?: number;
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

  // Handle mobile hardware back button to close modal
  useEffect(() => {
    if (!isOpen) return;

    // Push a new state when modal opens
    window.history.pushState({ transactionModal: true }, "");

    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      onClose();
    };

    window.addEventListener("popstate", handleBackButton);

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
      send: "Sent",
      receive: "Received",
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
      case "send":
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        );
      case "receive":
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
                d="M12 4v16m0 0l-4-4m4 4l4-4"
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
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-md z-[9998] overflow-hidden"
            style={{ touchAction: "none", margin: 0, padding: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="fixed top-0 left-0 right-0 bottom-0 z-[9998] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto", margin: 0, padding: 0 }}
          >
            <div
              className="bg-gray-900 w-full flex-1 overflow-y-auto"
              style={{ minHeight: 0 }}
            >
              {/* Mobile Header with Back Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-20">
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-sm font-medium">Back</span>
                </button>
                <h1 className="text-lg font-bold text-white">
                  Transaction Details
                </h1>
                <div className="w-16"></div> {/* Spacer for centering */}
              </div>

              {/* Header Section with Gradient Background */}
              <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-4 pb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
                <div className="relative z-[5]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0">
                      {/* For swap/convert transactions, show overlapping asset icons */}
                      {transaction.type === "convert" &&
                      transaction.fromAsset &&
                      transaction.toAsset ? (
                        <div className="relative w-14 h-10">
                          <div className="absolute left-0 top-0">
                            <CryptoIcon
                              symbol={transaction.fromAsset}
                              size="md"
                              showNetwork={false}
                            />
                          </div>
                          <div className="absolute left-5 top-0">
                            <CryptoIcon
                              symbol={transaction.toAsset}
                              size="md"
                              showNetwork={false}
                            />
                          </div>
                        </div>
                      ) : (
                        <CryptoIcon
                          symbol={transaction.asset}
                          size="lg"
                          showNetwork={
                            transaction.asset === "USDT" ||
                            transaction.asset === "USDC"
                          }
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2">
                        {getTransactionTitle()}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold text-xs uppercase tracking-wide ${
                            transaction.status === "completed"
                              ? "bg-green-500/20 text-green-400 border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                              : transaction.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              transaction.status === "completed"
                                ? "bg-green-400"
                                : transaction.status === "pending"
                                ? "bg-yellow-400 animate-pulse"
                                : "bg-red-400"
                            }`}
                          ></div>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">
                      Transaction ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-white font-mono text-sm break-all">
                        {transaction.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(transaction.id)}
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all active:scale-95"
                        aria-label="Copy transaction ID"
                      >
                        {copied ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
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

              <div className="p-4 pt-0">
                {/* Main Transaction Details */}
                <div className="space-y-3 mb-4 -mt-4">
                  {/* For Convert/Swap transactions, show FROM and TO cards separately */}
                  {transaction.type === "convert" &&
                  transaction.fromAsset &&
                  transaction.toAsset ? (
                    <>
                      {/* FROM Card */}
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg
                              className="w-3.5 h-3.5 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                              />
                            </svg>
                          </div>
                          <label className="text-red-400 text-xs font-semibold uppercase tracking-wider">
                            From
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <CryptoIcon
                            symbol={transaction.fromAsset}
                            size="sm"
                          />
                          <div>
                            <div className="text-white text-lg font-bold">
                              {(
                                transaction.fromAmount ||
                                transaction.amount ||
                                0
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                              <span className="text-gray-400 text-base ml-2">
                                {transaction.fromAsset}
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              ≈{" "}
                              {formatAmount(
                                transaction.fromValueUSD ||
                                  transaction.value ||
                                  0,
                                2
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex justify-center -my-1">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* TO Card */}
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg
                              className="w-3.5 h-3.5 text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </div>
                          <label className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                            To
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <CryptoIcon symbol={transaction.toAsset} size="sm" />
                          <div>
                            <div className="text-white text-lg font-bold">
                              {(transaction.toAmount || 0).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 8,
                                }
                              )}
                              <span className="text-gray-400 text-base ml-2">
                                {transaction.toAsset}
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              ≈ {formatAmount(transaction.toValueUSD || 0, 2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Amount Card (for non-convert transactions) */}
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <label className="block text-blue-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Amount
                        </label>
                        <div className="text-white text-xl font-bold">
                          {/* For fiat currencies, show 2 decimals; for crypto, show up to 8 */}
                          {FIAT_CURRENCIES.has(
                            transaction.asset?.toUpperCase() || ""
                          )
                            ? transaction.amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : transaction.amount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                          <span className="text-gray-400 text-base ml-2">
                            {transaction.asset}
                          </span>
                        </div>
                      </div>

                      {/* Value Card (for non-convert transactions) */}
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(168, 85, 247, 0.2)",
                        }}
                      >
                        <label className="block text-purple-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Value
                        </label>
                        <div className="text-white text-xl font-bold">
                          {/* For fiat deposits, value is already in user's currency - don't convert */}
                          {FIAT_CURRENCIES.has(
                            transaction.asset?.toUpperCase() || ""
                          )
                            ? formatCurrencyUtil(
                                transaction.value,
                                transaction.asset?.toUpperCase() || "BRL",
                                2
                              )
                            : formatAmount(transaction.value, 2)}
                          <span className="text-gray-400 text-base ml-2">
                            {FIAT_CURRENCIES.has(
                              transaction.asset?.toUpperCase() || ""
                            )
                              ? transaction.asset?.toUpperCase()
                              : preferredCurrency}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Details Grid */}
                <div className="space-y-3 mb-4">
                  {/* Date & Time */}
                  <div
                    className="rounded-xl p-4 flex items-center justify-between"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                          Date & Time
                        </label>
                        <div className="text-white font-medium">
                          {transaction.date
                            ? formatDate(transaction.date)
                            : transaction.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee */}
                  {transaction.fee !== undefined && transaction.fee > 0 && (
                    <div
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-orange-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                            Network Fee
                          </label>
                          <div className="text-white font-medium">
                            {formatAmount(transaction.fee, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {transaction.method && (
                    <div
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                            Payment Method
                          </label>
                          <div className="text-white font-medium capitalize">
                            {transaction.method}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exchange Rate */}
                  {transaction.rate && (
                    <div
                      className="rounded-xl p-4 flex items-center justify-between"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </div>
                        <div>
                          <label className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                            Exchange Rate
                          </label>
                          <div className="text-white font-medium text-sm">
                            {transaction.type === "convert" &&
                            transaction.fromAsset &&
                            transaction.toAsset ? (
                              <>
                                1 {transaction.fromAsset} ={" "}
                                {transaction.rate.toFixed(8)}{" "}
                                {transaction.toAsset}
                              </>
                            ) : (
                              <>
                                {formatAmount(transaction.rate, 2)} per{" "}
                                {transaction.asset}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Network Information */}
                {(transaction.hash ||
                  transaction.address ||
                  transaction.network ||
                  transaction.confirmations !== undefined) && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-400"
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
                      </div>
                      Network Information
                    </h3>
                    <div className="space-y-3">
                      {transaction.hash && (
                        <div>
                          <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
                            Transaction Hash
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/40 border border-gray-600/30 rounded-lg px-3 py-2 text-white font-mono text-sm break-all">
                              {transaction.hash}
                            </div>
                            <button
                              onClick={() => copyToClipboard(transaction.hash!)}
                              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 active:scale-95"
                              aria-label="Copy transaction hash"
                            >
                              {copied ? (
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
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
                          <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
                            Wallet Address
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/40 border border-gray-600/30 rounded-lg px-3 py-2 text-white font-mono text-sm break-all">
                              {transaction.address}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(transaction.address!)
                              }
                              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg hover:shadow-orange-500/50 active:scale-95"
                              aria-label="Copy wallet address"
                            >
                              {copied ? (
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5"
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
                          <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
                            Network
                          </label>
                          <div className="text-white font-semibold bg-black/40 border border-gray-600/30 rounded-lg px-3 py-2">
                            {transaction.network}
                          </div>
                        </div>
                      )}

                      {transaction.confirmations !== undefined && (
                        <div>
                          <label className="block text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">
                            Confirmations
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-700/50 rounded-full h-3 overflow-hidden border border-gray-600/30">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500 shadow-lg"
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
                            <div className="flex-shrink-0 text-white font-bold text-sm bg-gray-700/50 border border-gray-600/30 rounded-lg px-3 py-1">
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
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {transaction.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 bg-gray-900 border-t border-gray-700/50 p-3">
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all active:scale-95 text-white"
                  style={{
                    background:
                      "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                    boxShadow:
                      "0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
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
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-3 rounded-lg font-medium text-xs transition-all active:scale-95 shadow-sm hover:shadow-blue-500/40 flex items-center justify-center gap-1"
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
                    View on Explorer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
