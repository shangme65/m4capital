"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CryptoIcon, CRYPTO_CURRENCIES } from "@/components/icons/CryptoIcon";
import { getCurrencyFlagUrl } from "@/lib/currency-flags";
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
  "MXN",
  "SGD",
  "HKD",
  "NOK",
  "SEK",
  "DKK",
  "NZD",
  "ZAR",
  "RUB",
  "TRY",
  "PLN",
  "THB",
  "IDR",
  "MYR",
  "PHP",
  "VND",
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
    | "receive"
    | "swap"
    | "trade_earned";
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
  valueCurrency?: string; // The currency that 'value' is stored in (e.g., BRL, USD)
  fromAsset?: string;
  toAsset?: string;
  fromAmount?: number;
  toAmount?: number;
  fromPriceUSD?: number;
  toPriceUSD?: number;
  fromValueUSD?: number;
  toValueUSD?: number;
  swapRate?: number;
  rate?: number;
  confirmations?: number;
  maxConfirmations?: number;
  hash?: string;
  network?: string;
  address?: string;
  memo?: string;
  receiverName?: string;
  receiverEmail?: string;
  senderName?: string;
  senderEmail?: string;
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
  const { formatAmount, preferredCurrency, exchangeRates } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const getCurrencyAccentColor = (currency: string): { primary: string; glow: string } => {
    const colors: Record<string, { primary: string; glow: string }> = {
      BRL: { primary: "#009C3B", glow: "rgba(0,156,59,0.4)" },
      USD: { primary: "#3C3B6E", glow: "rgba(178,34,52,0.4)" },
      EUR: { primary: "#003399", glow: "rgba(0,51,153,0.4)" },
      GBP: { primary: "#CF142B", glow: "rgba(207,20,43,0.4)" },
      NGN: { primary: "#008751", glow: "rgba(0,135,81,0.4)" },
      ZAR: { primary: "#007A4D", glow: "rgba(0,122,77,0.4)" },
      KES: { primary: "#BB0000", glow: "rgba(187,0,0,0.4)" },
      GHS: { primary: "#006B3F", glow: "rgba(0,107,63,0.4)" },
      JPY: { primary: "#BC002D", glow: "rgba(188,0,45,0.4)" },
      CAD: { primary: "#FF0000", glow: "rgba(255,0,0,0.4)" },
      AUD: { primary: "#00008B", glow: "rgba(0,0,139,0.4)" },
      CHF: { primary: "#FF0000", glow: "rgba(255,0,0,0.4)" },
      CNY: { primary: "#DE2910", glow: "rgba(222,41,16,0.4)" },
      INR: { primary: "#FF9933", glow: "rgba(255,153,51,0.4)" },
      MXN: { primary: "#006847", glow: "rgba(0,104,71,0.4)" },
      TRY: { primary: "#E30A17", glow: "rgba(227,10,23,0.4)" },
      SAR: { primary: "#006C35", glow: "rgba(0,108,53,0.4)" },
      AED: { primary: "#00732F", glow: "rgba(0,115,47,0.4)" },
      SGD: { primary: "#EF3340", glow: "rgba(239,51,64,0.4)" },
      KGS: { primary: "#E8112D", glow: "rgba(232,17,45,0.4)" },
      KZT: { primary: "#00AFCA", glow: "rgba(0,175,202,0.4)" },
      UZS: { primary: "#1EB53A", glow: "rgba(30,181,58,0.4)" },
      PKR: { primary: "#01411C", glow: "rgba(1,65,28,0.4)" },
      BDT: { primary: "#006A4E", glow: "rgba(0,106,78,0.4)" },
      EGP: { primary: "#CE1126", glow: "rgba(206,17,38,0.4)" },
      MAD: { primary: "#C1272D", glow: "rgba(193,39,45,0.4)" },
      DZD: { primary: "#006233", glow: "rgba(0,98,51,0.4)" },
      KWD: { primary: "#007A3D", glow: "rgba(0,122,61,0.4)" },
      QAR: { primary: "#8D1B3D", glow: "rgba(141,27,61,0.4)" },
      THB: { primary: "#A51931", glow: "rgba(165,25,49,0.4)" },
      IDR: { primary: "#CE1126", glow: "rgba(206,17,38,0.4)" },
      MYR: { primary: "#CC0001", glow: "rgba(204,0,1,0.4)" },
      VND: { primary: "#DA251D", glow: "rgba(218,37,29,0.4)" },
      TWD: { primary: "#FE0000", glow: "rgba(254,0,0,0.4)" },
      HKD: { primary: "#DE2910", glow: "rgba(222,41,16,0.4)" },
      KRW: { primary: "#CD2E3A", glow: "rgba(205,46,58,0.4)" },
      CZK: { primary: "#D7141A", glow: "rgba(215,20,26,0.4)" },
      PLN: { primary: "#DC143C", glow: "rgba(220,20,60,0.4)" },
      HUF: { primary: "#CE2939", glow: "rgba(206,41,57,0.4)" },
      RON: { primary: "#002B7F", glow: "rgba(0,43,127,0.4)" },
      CLP: { primary: "#D52B1E", glow: "rgba(213,43,30,0.4)" },
      COP: { primary: "#FCD116", glow: "rgba(252,209,22,0.4)" },
      ARS: { primary: "#74ACDF", glow: "rgba(116,172,223,0.4)" },
      PEN: { primary: "#D91023", glow: "rgba(217,16,35,0.4)" },
    };
    return colors[currency] || { primary: "#6366f1", glow: "rgba(99,102,241,0.4)" };
  };

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
    // For swaps, show custom title without "Swapped" prefix
    if (
      (transaction.type === "swap" || transaction.type === "convert") &&
      transaction.fromAsset &&
      transaction.toAsset
    ) {
      return `${getCryptoFullName(transaction.fromAsset).name} → ${
        getCryptoFullName(transaction.toAsset).name
      }`;
    }

    const crypto = getCryptoFullName(transaction.asset);
    const assetSymbol = transaction.asset?.split(" ")[0] || "";
    
    // Check if it's a forex pair
    const FOREX_CODES = new Set(["EUR","USD","GBP","JPY","CHF","CAD","AUD","NZD","SEK","NOK","DKK","PLN","CZK","HUF","SGD","HKD","MXN","ZAR","TRY","BRL","INR","KRW","THB","CNY"]);
    const checkIsForexPair = (sym: string) => {
      if (sym.includes("/")) {
        const [base, quote] = sym.split("/");
        return FOREX_CODES.has(base) && FOREX_CODES.has(quote);
      }
      if (sym.length === 6 && /^[A-Z]{6}$/.test(sym)) {
        const base = sym.substring(0, 3);
        const quote = sym.substring(3, 6);
        return FOREX_CODES.has(base) && FOREX_CODES.has(quote);
      }
      return false;
    };
    
    // For trade_earned, or buy/sell forex pairs - show "Closed Trade (PAIR)"
    const isClosedTrade = transaction.type === "trade_earned" ||
      ((transaction.type === "buy" || transaction.type === "sell") && checkIsForexPair(assetSymbol));
    
    if (isClosedTrade) {
      return `Closed Trade (${assetSymbol})`;
    }
    
    const typeMap: Record<string, string> = {
      buy: "Bought",
      sell: "Sold",
      deposit: "Deposited",
      withdraw: "Withdrew",
      convert: "Converted",
      transfer: "Transferred",
      send: "Sent",
      receive: "Received",
      swap: "Swapped",
      trade_earned: "Trade Earned",
    };
    return `${typeMap[transaction.type] || transaction.type} ${transaction.type === "trade_earned" ? `(${transaction.asset})` : crypto.name}`;
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
      case "swap":
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
      case "trade_earned":
        return (
          <div
            className={`${baseClasses} bg-gradient-to-br from-emerald-500 to-green-600`}
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
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .transaction-details-modal,
              .transaction-details-modal * {
                visibility: visible;
              }
              .transaction-details-modal {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                background: white !important;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                max-height: none !important;
              }
              .transaction-details-modal button {
                display: none !important;
              }
              .transaction-details-modal,
              .transaction-details-modal div,
              .transaction-details-modal span,
              .transaction-details-modal p,
              .transaction-details-modal label {
                color: black !important;
                background: white !important;
                border-color: #e5e7eb !important;
              }
              .transaction-details-modal {
                page-break-inside: avoid;
              }
            }
          `}} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md z-[9998] overflow-hidden ${
              isDark ? "bg-black/80" : "bg-black/40"
            }`}
            style={{ touchAction: "none", margin: 0, padding: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="transaction-details-modal fixed top-0 left-0 right-0 bottom-0 z-[9998] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto", margin: 0, padding: 0 }}
            data-print-date={new Date().toLocaleString()}
          >
            <div
              className={`w-full flex-1 overflow-y-auto ${
                isDark ? "bg-gray-900" : "bg-white"
              }`}
              style={{ minHeight: 0 }}
            >
              {/* Mobile Header with Back Button */}
              <div className={`flex items-center justify-between px-3 py-2 sticky top-0 backdrop-blur-sm z-20 ${
                isDark ? "border-b border-gray-700 bg-gray-900/95" : "border-b border-gray-200 bg-white/95"
              }`}>
                <button
                  onClick={onClose}
                  className={`transition-colors flex items-center gap-1.5 ${
                    isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
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
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-xs font-medium">Back</span>
                </button>
                <h1 className={`text-base font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Transaction Details
                </h1>
                <div className="w-14"></div> {/* Spacer for centering */}
              </div>

              {/* Header Section with Gradient Background */}
              <div className={`relative p-3 pb-6 ${
                isDark ? "bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" : "bg-gradient-to-r from-blue-100 via-purple-50 to-pink-50"
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${
                  isDark ? "to-gray-900/50" : "to-white/50"
                }`}></div>
                <div className="relative z-[5]">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex-shrink-0">
                      {/* For swap/convert transactions, show overlapping asset icons */}
                      {(transaction.type === "convert" ||
                        transaction.type === "swap") &&
                      transaction.fromAsset &&
                      transaction.toAsset ? (
                        <div className="relative w-14 h-10">
                          <div className="absolute left-0 top-0">
                            <CryptoIcon
                              symbol={transaction.fromAsset}
                              size="md"
                            />
                          </div>
                          <div className="absolute left-5 top-0">
                            <CryptoIcon
                              symbol={transaction.toAsset}
                              size="md"
                            />
                          </div>
                        </div>
                      ) : (() => {
                        const assetSymbol = transaction.asset?.split(" ")[0] || "";
                        const FOREX_CODES = new Set(["EUR","USD","GBP","JPY","CHF","CAD","AUD","NZD","SEK","NOK","DKK","PLN","CZK","HUF","SGD","HKD","MXN","ZAR","TRY","BRL","INR","KRW","THB","CNY"]);
                        
                        // Check if it's a forex pair (both EURGBP and EUR/GBP formats)
                        let base = "", quote = "";
                        if (assetSymbol.includes("/")) {
                          [base, quote] = assetSymbol.split("/");
                        } else if (assetSymbol.length === 6 && /^[A-Z]{6}$/.test(assetSymbol)) {
                          base = assetSymbol.substring(0, 3);
                          quote = assetSymbol.substring(3, 6);
                        }
                        
                        // Show overlapping logos for forex pairs (for all types: trade_earned, buy, sell, TRADE)
                        if (base && quote && FOREX_CODES.has(base) && FOREX_CODES.has(quote)) {
                          return (
                            <div className="relative w-14 h-12">
                              <div className="absolute left-0 top-0">
                                <Image src={getCurrencyFlagUrl(base)} alt={base} width={32} height={32} className={`rounded-full object-cover border-2 ${isDark ? "border-gray-800" : "border-white"}`} unoptimized />
                              </div>
                              <div className="absolute left-5 top-0">
                                <Image src={getCurrencyFlagUrl(quote)} alt={quote} width={32} height={32} className={`rounded-full object-cover border-2 ${isDark ? "border-gray-800" : "border-white"}`} unoptimized />
                              </div>
                            </div>
                          );
                        }
                        
                        // Crypto pair (e.g. BTC/ETH)
                        if (assetSymbol.includes("/")) {
                          const [cryptoBase, cryptoQuote] = assetSymbol.split("/");
                          return (
                            <div className="relative w-14 h-12">
                              <div className="absolute left-0 top-0">
                                <CryptoIcon symbol={cryptoBase} size="md" />
                              </div>
                              <div className="absolute left-5 top-0">
                                <CryptoIcon symbol={cryptoQuote} size="md" />
                              </div>
                            </div>
                          );
                        }
                        
                        // Single asset
                        return <CryptoIcon symbol={assetSymbol} size="lg" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-lg font-bold mb-1.5 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {getTransactionTitle()}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold text-[10px] uppercase tracking-wide ${
                            transaction.status === "completed"
                              ? isDark 
                                ? "bg-green-500/20 text-green-400 border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                : "bg-green-100 text-green-700 border-green-300"
                              : transaction.status === "pending"
                              ? isDark
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : isDark
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-red-100 text-red-700 border-red-300"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              transaction.status === "completed"
                                ? isDark ? "bg-green-400" : "bg-green-600"
                                : transaction.status === "pending"
                                ? isDark ? "bg-yellow-400 animate-pulse" : "bg-yellow-600 animate-pulse"
                                : isDark ? "bg-red-400" : "bg-red-600"
                            }`}
                          ></div>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div
                    className="rounded-xl p-2.5"
                    style={isDark ? {
                      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    } : {
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: "0 10px 35px -8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,1)",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <label className={`block text-[10px] font-medium mb-1.5 uppercase tracking-wider ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Transaction ID
                    </label>
                    <div className="flex items-center gap-2">
                      <code className={`flex-1 font-mono text-xs break-all ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}>
                        {transaction.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(transaction.id)}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all active:scale-95"
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

              <div className="p-3 pt-2">
                {/* Main Transaction Details */}
                <div className="space-y-2 mb-3">
                  {/* For Convert/Swap transactions, show FROM and TO cards separately */}
                  {(transaction.type === "convert" ||
                    transaction.type === "swap") &&
                  transaction.fromAsset &&
                  transaction.toAsset ? (
                    <>
                      {/* FROM Card */}
                      <div
                        className="rounded-xl p-3"
                        style={isDark ? {
                          background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        } : {
                          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                          boxShadow: "0 10px 35px -8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,1)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
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
                            <div className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}>
                              {(
                                transaction.fromAmount ||
                                transaction.amount ||
                                0
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                              <span className={`text-base ml-2 ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}>
                                {transaction.fromAsset}
                              </span>
                            </div>
                            <div className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}>
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
                        style={isDark ? {
                          background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        } : {
                          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                          boxShadow: "0 10px 35px -8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,1)",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
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
                            <div className={`text-lg font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}>
                              {(transaction.toAmount || 0).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 8,
                                }
                              )}
                              <span className={`text-base ml-2 ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}>
                                {transaction.toAsset}
                              </span>
                            </div>
                            <div className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}>
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
                        className="rounded-xl p-3"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow:
                            "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                          border: "none",
                        } : {
                          background:
                            "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                          boxShadow:
                            "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                          border: "none",
                        }}
                      >
                        <label className={`block text-[10px] font-semibold mb-1 uppercase tracking-wider ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}>
                          Amount
                        </label>
                        <div className={`text-lg font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {/* For trade_earned, amount is investment in USD — show formatted amount */}
                          {/* For fiat currencies, show 2 decimals; for crypto, show up to 8 */}
                          {transaction.type === "trade_earned"
                            ? transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : FIAT_CURRENCIES.has(
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
                          {/* For trade_earned show the trading pair with slash formatting; for other types show asset */}
                          {transaction.type === "trade_earned" ? (
                            <span className={`text-base ml-2 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {transaction.asset?.includes("/") 
                                ? transaction.asset 
                                : transaction.asset?.length === 6 
                                  ? `${transaction.asset.substring(0, 3)}/${transaction.asset.substring(3, 6)}`
                                  : transaction.asset}
                            </span>
                          ) : (
                            <span className={`text-base ml-2 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {transaction.asset}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Value Card (for non-convert transactions) */}
                      <div
                        className="rounded-xl p-3"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow:
                            "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                          border: "none",
                        } : {
                          background:
                            "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                          boxShadow:
                            "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                          border: "none",
                        }}
                      >
                        <label className={`block text-[10px] font-semibold mb-1 uppercase tracking-wider ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        }`}>
                          Value
                        </label>
                        <div
                          className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {/* trade_earned: amount is in USD, convert to preferred currency */}
                          {/* Fiat same currency: show directly */}
                          {/* Fiat different currency: convert original amount → USD via live rates → preferred currency */}
                          {/* Crypto: value is already in USD, convert to preferred currency */}
                          {transaction.type === "trade_earned"
                            ? formatAmount(transaction.amount, 2)
                            : FIAT_CURRENCIES.has(
                                transaction.asset?.toUpperCase() || ""
                              ) &&
                              transaction.asset?.toUpperCase() === preferredCurrency
                            ? formatCurrencyUtil(
                                transaction.amount,
                                transaction.asset?.toUpperCase() || "USD",
                                2
                              )
                            : FIAT_CURRENCIES.has(
                                transaction.asset?.toUpperCase() || ""
                              )
                            ? // Convert original fiat amount → USD (via live rates) → preferred currency
                              formatAmount(
                                transaction.asset?.toUpperCase() === "USD"
                                  ? transaction.amount
                                  : transaction.amount / (exchangeRates[transaction.asset?.toUpperCase() || "USD"] || 1),
                                2
                              )
                            : transaction.valueCurrency &&
                              transaction.valueCurrency === preferredCurrency
                            ? formatCurrencyUtil(
                                transaction.value,
                                transaction.valueCurrency,
                                2
                              )
                            : formatAmount(transaction.value, 2)}
                          <span className={`text-base ml-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {FIAT_CURRENCIES.has(
                              transaction.asset?.toUpperCase() || ""
                            ) &&
                            transaction.asset?.toUpperCase() === preferredCurrency
                              ? transaction.asset?.toUpperCase()
                              : preferredCurrency}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Details Grid */}
                <div className="space-y-2 mb-3">
                  {/* Date & Time */}
                  <div
                    className="rounded-xl p-3 flex items-center justify-between"
                    style={isDark ? {
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                      border: "none",
                    } : {
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow:
                        "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                      border: "none",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? "bg-gray-700/50" : "bg-gray-200/80"
                      }`}>
                        <svg
                          className={`w-4 h-4 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
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
                        <label className={`text-[10px] font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-500" : "text-gray-600"
                        }`}>
                          Date & Time
                        </label>
                        <div className={`font-medium text-sm ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
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
                      className="rounded-xl p-3 flex items-center justify-between"
                      style={isDark ? {
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow:
                          "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                        border: "none",
                      } : {
                        background:
                          "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                        boxShadow:
                          "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                        border: "none",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-orange-500/20" : "bg-orange-100"
                        }`}>
                          <svg
                            className={`w-4 h-4 ${
                              isDark ? "text-orange-400" : "text-orange-600"
                            }`}
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
                          <label className={`text-[10px] font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Network Fee
                          </label>
                          <div className={`font-medium text-sm ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {formatAmount(transaction.fee, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {transaction.method && (
                    <div
                      className="rounded-xl p-3 flex items-center justify-between"
                      style={isDark ? {
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow:
                          "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                        border: "none",
                      } : {
                        background:
                          "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                        boxShadow:
                          "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                        border: "none",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-green-500/20" : "bg-green-100"
                        }`}>
                          <svg
                            className={`w-4 h-4 ${
                              isDark ? "text-green-400" : "text-green-600"
                            }`}
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
                          <label className={`text-[10px] font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Payment Method
                          </label>
                          <div className={`font-medium text-sm capitalize ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {transaction.method}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exchange Rate */}
                  {transaction.rate && (
                    <div
                      className="rounded-xl p-3 flex items-center justify-between"
                      style={isDark ? {
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow:
                          "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                        border: "none",
                      } : {
                        background:
                          "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                        boxShadow:
                          "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                        border: "none",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDark ? "bg-cyan-500/20" : "bg-cyan-100"
                        }`}>
                          <svg
                            className={`w-4 h-4 ${
                              isDark ? "text-cyan-400" : "text-cyan-600"
                            }`}
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
                          <label className={`text-[10px] font-medium uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Exchange Rate
                          </label>
                          <div className={`font-medium text-xs ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>
                            {(transaction.type === "convert" ||
                              transaction.type === "swap") &&
                            transaction.fromAsset &&
                            transaction.toAsset ? (
                              <>
                                1 {transaction.fromAsset} ={" "}
                                {(
                                  transaction.swapRate ||
                                  transaction.rate ||
                                  0
                                ).toFixed(8)}{" "}
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

                {/* Transfer Information - Receiver/Sender */}
                {(transaction.type === "transfer" || transaction.type === "send" || transaction.type === "receive") &&
                  (transaction.receiverName || transaction.receiverEmail || transaction.senderName || transaction.senderEmail) && (
                  <div
                    className="rounded-xl p-3 mb-3"
                    style={isDark ? {
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                      border: "none",
                    } : {
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow:
                        "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                      border: "none",
                    }}
                  >
                    <h3 className={`font-bold text-sm mb-3 flex items-center gap-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDark ? "bg-purple-500/20" : "bg-purple-100"
                      }`}>
                        <svg
                          className={`w-3 h-3 ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      Transfer Details
                    </h3>
                    <div className="space-y-2">
                      {transaction.receiverName && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Recipient Name
                          </label>
                          <div className={`rounded-lg px-2.5 py-1.5 text-xs ${
                            isDark
                              ? "bg-black/40 border border-gray-600/30 text-white"
                              : "bg-gray-100 border border-gray-300 text-gray-900"
                          }`}>
                            {transaction.receiverName}
                          </div>
                        </div>
                      )}
                      {transaction.receiverEmail && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Recipient Email
                          </label>
                          <div className={`rounded-lg px-2.5 py-1.5 text-xs break-all ${
                            isDark
                              ? "bg-black/40 border border-gray-600/30 text-white"
                              : "bg-gray-100 border border-gray-300 text-gray-900"
                          }`}>
                            {transaction.receiverEmail}
                          </div>
                        </div>
                      )}
                      {transaction.senderName && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Sender Name
                          </label>
                          <div className={`rounded-lg px-2.5 py-1.5 text-xs ${
                            isDark
                              ? "bg-black/40 border border-gray-600/30 text-white"
                              : "bg-gray-100 border border-gray-300 text-gray-900"
                          }`}>
                            {transaction.senderName}
                          </div>
                        </div>
                      )}
                      {transaction.senderEmail && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Sender Email
                          </label>
                          <div className={`rounded-lg px-2.5 py-1.5 text-xs break-all ${
                            isDark
                              ? "bg-black/40 border border-gray-600/30 text-white"
                              : "bg-gray-100 border border-gray-300 text-gray-900"
                          }`}>
                            {transaction.senderEmail}
                          </div>
                        </div>
                      )}
                      {transaction.memo && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Memo
                          </label>
                          <div className={`rounded-lg px-2.5 py-1.5 text-xs ${
                            isDark
                              ? "bg-black/40 border border-gray-600/30 text-white"
                              : "bg-gray-100 border border-gray-300 text-gray-900"
                          }`}>
                            {transaction.memo}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Network Information */}
                {(transaction.hash ||
                  transaction.address ||
                  transaction.network ||
                  transaction.confirmations !== undefined) && (
                  <div
                    className="rounded-xl p-3 mb-3"
                    style={isDark ? {
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                      border: "none",
                    } : {
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow:
                        "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                      border: "none",
                    }}
                  >
                    <h3 className={`font-bold text-sm mb-3 flex items-center gap-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDark ? "bg-blue-500/20" : "bg-blue-100"
                      }`}>
                        <svg
                          className={`w-3 h-3 ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
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
                    <div className="space-y-2">
                      {transaction.hash && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Transaction Hash
                          </label>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 rounded-lg px-2.5 py-1.5 font-mono text-xs break-all ${
                              isDark
                                ? "bg-black/40 border border-gray-600/30 text-white"
                                : "bg-gray-100 border border-gray-300 text-gray-900"
                            }`}>
                              {transaction.hash}
                            </div>
                            <button
                              onClick={() => copyToClipboard(transaction.hash!)}
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg hover:shadow-orange-500/50 active:scale-95"
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
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Wallet Address
                          </label>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 rounded-lg px-2.5 py-1.5 font-mono text-xs break-all ${
                              isDark
                                ? "bg-black/40 border border-gray-600/30 text-white"
                                : "bg-gray-100 border border-gray-300 text-gray-900"
                            }`}>
                              {transaction.address}
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(transaction.address!)
                              }
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg hover:shadow-orange-500/50 active:scale-95"
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
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Network
                          </label>
                          <div className={`font-semibold text-xs rounded-lg px-2.5 py-1.5 ${
                            isDark
                              ? "bg-black/40 border border-gray-600/30 text-white"
                              : "bg-gray-100 border border-gray-300 text-gray-900"
                          }`}>
                            {transaction.network}
                          </div>
                        </div>
                      )}

                      {transaction.confirmations !== undefined && (
                        <div>
                          <label className={`block text-[10px] font-medium mb-1 uppercase tracking-wider ${
                            isDark ? "text-gray-500" : "text-gray-600"
                          }`}>
                            Confirmations
                          </label>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 rounded-full h-2 overflow-hidden border ${
                              isDark
                                ? "bg-gray-700/50 border-gray-600/30"
                                : "bg-gray-200 border-gray-300"
                            }`}>
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
                            <div className={`flex-shrink-0 font-bold text-xs rounded-lg px-2 py-0.5 border ${
                              isDark
                                ? "bg-gray-700/50 border-gray-600/30 text-white"
                                : "bg-gray-100 border-gray-300 text-gray-900"
                            }`}>
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
                    className="rounded-xl p-3 mb-3"
                    style={isDark ? {
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6)",
                      border: "none",
                    } : {
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow:
                        "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                      border: "none",
                    }}
                  >
                    <h3 className={`font-semibold text-xs mb-1.5 flex items-center gap-1.5 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      <svg
                        className={`w-3 h-3 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
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
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {transaction.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className={`flex-shrink-0 p-3 ${
              isDark
                ? "bg-gray-900 border-t border-gray-700/50"
                : "bg-white border-t border-gray-300"
            }`}>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all active:scale-95 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  style={isDark ? {
                    background:
                      "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                    boxShadow:
                      "0 2px 8px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  } : {
                    background:
                      "linear-gradient(145deg, #f3f4f6 0%, #e5e7eb 100%)",
                    boxShadow:
                      "0 2px 8px -2px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-3 rounded-lg font-medium text-xs transition-all active:scale-95 shadow-sm hover:shadow-orange-500/40 flex items-center justify-center gap-1"
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Receipt
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
