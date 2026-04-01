"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeAgo } from "@/lib/crypto-constants";
import { getCryptoMetadata, CRYPTO_METADATA } from "@/lib/crypto-constants";
import { getCurrencyFlagUrl } from "@/lib/currency-flags";
import {
  formatCurrency as formatCurrencyUtil,
  getCurrencySymbol,
} from "@/lib/currencies";
import {
  X,
  Bell,
  DollarSign,
  TrendingUp,
  Info,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Trash2,
  MailOpen,
  Circle,
  ChevronDown,
  Archive,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ScanFace,
} from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

// Common fiat currency codes
const FIAT_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "BRL",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "MXN",
  "KRW",
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

const FOREX_CODES = new Set([
  "EUR",
  "USD",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "SGD",
  "HKD",
  "MXN",
  "ZAR",
  "TRY",
  "BRL",
  "INR",
  "KRW",
  "THB",
  "CNY",
]);

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
  } = useNotifications();
  const { formatAmount } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const findCryptoSymbolInText = (text?: string): string | null => {
    if (!text) return null;

    const matches = text.toUpperCase().match(/[A-Z0-9]{2,10}/g) || [];
    for (const token of matches) {
      if (token in CRYPTO_METADATA) {
        return token;
      }
    }

    return null;
  };

  const parsePairFromText = (
    text?: string
  ): { base: string; quote: string } | null => {
    if (!text) return null;

    // Try slash pairs first, e.g. BTC/USD or EUR/USD
    const slashPair = text.toUpperCase().match(/([A-Z0-9]{2,10})\s*\/\s*([A-Z0-9]{2,10})/);
    if (slashPair) {
      return { base: slashPair[1], quote: slashPair[2] };
    }

    // Try compact forex pair, e.g. EURUSD
    const compactForex = text.toUpperCase().match(/\b([A-Z]{6})\b/);
    if (compactForex) {
      const value = compactForex[1];
      const base = value.substring(0, 3);
      const quote = value.substring(3, 6);
      if (FOREX_CODES.has(base) && FOREX_CODES.has(quote)) {
        return { base, quote };
      }
    }

    return null;
  };

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "archived") return n.archived;
    if (filter === "unread") return !n.read && !n.archived;
    return !n.archived; // "all" shows non-archived
  });

  const getNotificationIcon = (notification: Notification) => {
    const asset = notification.asset?.toUpperCase() || "";
    const titleLower = notification.title?.toLowerCase() || "";
    const isTradeEarned =
      notification.type?.toLowerCase() === "trade_earned" ||
      titleLower.includes("trade earned") ||
      notification.message?.toLowerCase().includes("trade earned");
    const isTradeWon = titleLower.includes("trade won");
    const isTradeLost = titleLower.includes("trade lost");
    const isTradeResult = isTradeEarned || isTradeWon || isTradeLost;
    const pair =
      parsePairFromText(asset) ||
      parsePairFromText(notification.title) ||
      parsePairFromText(notification.message);

    // Show trade pair icons for trade earned/won/lost notifications
    if (isTradeResult && pair) {
      const baseIsForex = FOREX_CODES.has(pair.base);
      const quoteIsForex = FOREX_CODES.has(pair.quote);
      // Green for won/earned, red for lost
      const indicatorColor = isTradeLost ? "bg-red-500" : "bg-green-500";

      return (
        <div className="relative flex-shrink-0" style={{ width: "38px", height: "28px" }}>
          {/* Base currency - left side */}
          <div className="absolute left-0 top-0">
            {baseIsForex ? (
              <Image
                src={getCurrencyFlagUrl(pair.base)}
                alt={pair.base}
                width={24}
                height={24}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <CryptoIcon symbol={pair.base} size="sm" />
            )}
          </div>
          
          {/* Quote currency - right side, overlapping */}
          <div className="absolute right-0 top-0">
            {quoteIsForex ? (
              <Image
                src={getCurrencyFlagUrl(pair.quote)}
                alt={pair.quote}
                width={24}
                height={24}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <CryptoIcon symbol={pair.quote} size="sm" />
            )}
          </div>
          
          {/* Status indicator - centered between the two flags */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${indicatorColor} border-2 border-white/60`}
            style={{ zIndex: 10 }}
          />
        </div>
      );
    }

    const detectedCryptoSymbol =
      findCryptoSymbolInText(notification.title) ||
      findCryptoSymbolInText(notification.message);
    const iconAsset = asset in CRYPTO_METADATA ? asset : detectedCryptoSymbol || asset;
    const isCrypto = iconAsset in CRYPTO_METADATA;
    const isFiat = FIAT_CURRENCIES.has(asset);

    // Show real crypto logo
    if (isCrypto) {
      const meta = getCryptoMetadata(iconAsset);
      
      // Determine transfer direction
      const isTransferSent = titleLower.includes("transfer sent") || (titleLower.includes("transfer") && (notification.amount || 0) < 0);
      const isTransferReceived = titleLower.includes("transfer received") || titleLower.includes("received");
      const isSold = titleLower.includes("sold");
      const isWithdraw = titleLower.includes("withdraw");
      const isPurchase = titleLower.includes("purchase");
      const isTradeEarned2 = titleLower.includes("trade earned");
      
      // Determine badge color and arrow direction
      let badgeColor = "bg-green-500";
      let showUpArrow = true;
      
      if (isTransferSent) {
        badgeColor = "bg-red-500";
        showUpArrow = true; // Sent = red arrow UP
      } else if (isPurchase || isTransferReceived || isTradeEarned2) {
        badgeColor = "bg-green-500";
        showUpArrow = false; // Purchase/Received/Trade Earned = green arrow DOWN
      } else if (isSold || isWithdraw) {
        badgeColor = "bg-red-500";
        showUpArrow = true; // Sold/Withdraw = red arrow UP
      }
      
      return (
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
            style={{ backgroundColor: `${meta.bgColor}`, border: `1.5px solid ${meta.color}40` }}
          >
            <Image
              src={meta.imagePath}
              alt={iconAsset}
              width={28}
              height={28}
              className="object-contain"
              unoptimized
            />
          </div>
          {/* Direction badge */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-md ${badgeColor}`}>
            {showUpArrow ? (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            ) : (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            )}
          </div>
        </div>
      );
    }

    // Show real currency flag
    if (isFiat) {
      const titleLower = notification.title?.toLowerCase() || "";
      
      // Determine transfer direction: sent = red up, received = green down
      const isTransferSent = titleLower.includes("transfer sent") || (titleLower.includes("transfer") && (notification.amount || 0) < 0);
      const isTransferReceived = titleLower.includes("transfer received") || titleLower.includes("received");
      const isWithdraw = titleLower.includes("withdraw");
      
      // Determine badge color and arrow direction
      let badgeColor = "bg-green-500";
      let showUpArrow = true;
      
      if (isTransferSent) {
        badgeColor = "bg-red-500";
        showUpArrow = true; // Sent = red arrow UP
      } else if (isTransferReceived) {
        badgeColor = "bg-green-500";
        showUpArrow = false; // Received = green arrow DOWN
      } else if (isWithdraw) {
        badgeColor = "bg-red-500";
        showUpArrow = false; // Withdraw = red arrow down
      }
      
      return (
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg border border-gray-200/20">
            <Image
              src={getCurrencyFlagUrl(asset)}
              alt={asset}
              width={36}
              height={36}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          {/* Direction badge */}
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-md ${badgeColor}`}>
            {showUpArrow ? (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
            ) : (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            )}
          </div>
        </div>
      );
    }

    // KYC / identity verification notifications
    const isKycNotification =
      notification.title?.toLowerCase().includes("kyc") ||
      notification.title?.toLowerCase().includes("verification") ||
      notification.message?.toLowerCase().includes("kyc") ||
      notification.message?.toLowerCase().includes("identity verification");

    if (isKycNotification) {
      const titleLower = notification.title?.toLowerCase() || "";
      const isApproved = titleLower.includes("approved");
      const isRejected =
        titleLower.includes("rejected") ||
        titleLower.includes("requires attention") ||
        titleLower.includes("action required");
      const isUnderReview =
        titleLower.includes("under review") ||
        titleLower.includes("reviewing");

      const kycGradient = isApproved
        ? "from-green-400 to-emerald-600"
        : isRejected
        ? "from-red-400 to-rose-600"
        : isUnderReview
        ? "from-blue-400 to-cyan-600"
        : "from-indigo-400 to-purple-600";

      const KycIcon = isApproved
        ? ShieldCheck
        : isRejected
        ? ShieldX
        : isUnderReview
        ? ShieldAlert
        : ScanFace;

      return (
        <div className="relative flex-shrink-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${kycGradient} rounded-lg blur-sm opacity-50`} />
          <div className={`relative w-9 h-9 bg-gradient-to-br ${kycGradient} rounded-lg flex items-center justify-center shadow-md`}>
            <KycIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    // Fallback: gradient icon based on type
    const typeGradients: Record<string, string> = {
      DEPOSIT: "from-blue-400 to-cyan-600",
      WITHDRAW: "from-orange-400 to-red-600",
      TRADE: "from-purple-400 to-indigo-600",
      TRANSACTION: "from-purple-400 to-indigo-600",
      SUCCESS: "from-green-400 to-emerald-600",
      WARNING: "from-yellow-400 to-orange-600",
    };
    const gradient = typeGradients[notification.type?.toUpperCase() || ""] || "from-purple-400 to-indigo-600";
    return (
      <div className="relative flex-shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-lg blur-sm opacity-50`}></div>
        <div className={`relative w-9 h-9 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-md`}>
          <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
      </div>
    );
  };

  // Don't render on server
  if (!mounted) return null;

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999]"
          style={{
            isolation: "isolate",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          {/* Solid backdrop layer to block everything - fully opaque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            style={{ zIndex: 1 }}
          />

          {/* Backdrop with blur - clickable to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 backdrop-blur-md"
            style={{ zIndex: 2 }}
          />

          {/* Enhanced Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`absolute right-0 top-0 h-full w-full sm:w-[480px] border-l flex flex-col shadow-2xl ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700/50" : "bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200"}`}
            style={{ zIndex: 3 }}
          >
            {/* Smaller Header */}
            <div className="relative overflow-hidden">
              <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10" : "bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5"}`}></div>
              <div className={`relative flex items-center justify-between p-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-orange-500" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <span className="text-white text-[9px] font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Notifications
                    </h2>
                    <p className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {notifications.length} total
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`transition-all hover:rotate-90 duration-300 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
                  aria-label="Close notifications panel"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Smaller Filter Tabs */}
              <div className={`relative flex items-center space-x-2 px-4 py-2 ${isDark ? "bg-gray-800/50" : "bg-gray-100/50"}`}>
                <button
                  onClick={() => setFilter("all")}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === "all"
                      ? isDark ? "text-white" : "text-gray-900"
                      : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {filter === "all" && (
                    <motion.div
                      layoutId="filterBg"
                      className={`absolute inset-0 rounded-lg border ${isDark ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-orange-500/30" : "bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20"}`}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                    />
                  )}
                  <span className="relative">All</span>
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === "unread"
                      ? isDark ? "text-white" : "text-gray-900"
                      : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {filter === "unread" && (
                    <motion.div
                      layoutId="filterBg"
                      className={`absolute inset-0 rounded-lg border ${isDark ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-orange-500/30" : "bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20"}`}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                    />
                  )}
                  <span className="relative flex items-center space-x-1.5">
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setFilter("archived")}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === "archived"
                      ? isDark ? "text-white" : "text-gray-900"
                      : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {filter === "archived" && (
                    <motion.div
                      layoutId="filterBg"
                      className={`absolute inset-0 rounded-lg border ${isDark ? "bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-orange-500/30" : "bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20"}`}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                    />
                  )}
                  <span className="relative flex items-center space-x-1.5">
                    <Archive className="w-3 h-3" />
                    <span>Archived</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Enhanced Notifications List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col items-center justify-center h-full p-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 rounded-full blur-xl ${isDark ? "bg-gradient-to-br from-orange-500/20 to-purple-500/20" : "bg-gradient-to-br from-orange-500/10 to-purple-500/10"}`}></div>
                    <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border ${isDark ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600/50" : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300/50"}`}>
                      <Bell className={`w-12 h-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                    </div>
                  </div>
                  <p className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {filter === "unread"
                      ? "All caught up!"
                      : "No notifications"}
                  </p>
                  <p className={`text-sm text-center max-w-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {filter === "unread"
                      ? "You've read all your notifications. Great job staying on top of things!"
                      : "You're all caught up! New notifications will appear here."}
                  </p>
                </motion.div>
              ) : (
                <div className="p-2 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map((notification, index) => {
                      const isExpanded = expandedId === notification.id;

                      return (
                        <motion.div
                          key={notification.id}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -100, scale: 0.8 }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            delay: index * 0.03,
                          }}
                          onClick={() => {
                            // Toggle expansion - only one can be open at a time
                            if (isExpanded) {
                              setExpandedId(null);
                            } else {
                              setExpandedId(notification.id);
                              if (!notification.read) {
                                markNotificationAsRead(notification.id);
                              }
                            }
                          }}
                          className={`group relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer ${
                            (() => {
                              const titleLow = notification.title?.toLowerCase() || "";
                              const isWon = titleLow.includes("trade won") || titleLow.includes("trade earned");
                              const isLost = titleLow.includes("trade lost");
                              if (!notification.read) {
                                if (isWon) {
                                  return isDark
                                    ? "bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-green-500/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                                    : "bg-gradient-to-br from-green-50 to-emerald-50/50 border-green-300/50 shadow-lg shadow-green-200/30 hover:shadow-green-300/40";
                                }
                                if (isLost) {
                                  return isDark
                                    ? "bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-red-500/30 shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                                    : "bg-gradient-to-br from-red-50 to-rose-50/50 border-red-300/50 shadow-lg shadow-red-200/30 hover:shadow-red-300/40";
                                }
                                return isDark
                                  ? "bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-orange-500/30 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
                                  : "bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-300/50 shadow-lg shadow-orange-200/30 hover:shadow-orange-300/40";
                              }
                              return isDark
                                ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                                : "bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/70";
                            })()
                          }`}
                        >
                          {/* Gradient overlay for unread */}
                          {!notification.read && (
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              (() => {
                                const titleLow = notification.title?.toLowerCase() || "";
                                if (titleLow.includes("trade won") || titleLow.includes("trade earned")) return "bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5";
                                if (titleLow.includes("trade lost")) return "bg-gradient-to-r from-red-500/5 via-rose-500/5 to-red-500/5";
                                return "bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5";
                              })()
                            }`}></div>
                          )}

                          {/* Unread indicator line */}
                          {!notification.read && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                              (() => {
                                const titleLow = notification.title?.toLowerCase() || "";
                                if (titleLow.includes("trade won") || titleLow.includes("trade earned")) return "bg-gradient-to-b from-green-400 via-emerald-500 to-green-600";
                                if (titleLow.includes("trade lost")) return "bg-gradient-to-b from-red-400 via-rose-500 to-red-600";
                                return "bg-gradient-to-b from-orange-500 via-purple-500 to-blue-500";
                              })()
                            }`}></div>
                          )}

                          <div className="relative p-2.5">
                            <div className="flex items-start space-x-2.5">
                              {/* Enhanced Icon */}
                              <div className="flex-shrink-0">
                                {getNotificationIcon(notification)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h3
                                    className={`text-sm font-bold ${
                                      !notification.read
                                        ? isDark ? "text-white" : "text-gray-900"
                                        : isDark ? "text-gray-300" : "text-gray-600"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                  <div className="flex items-center space-x-1.5 ml-2">
                                    <span className={`text-[10px] flex-shrink-0 font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                      {formatTimeAgo(notification.timestamp)}
                                    </span>
                                    <motion.div
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronDown className={`w-3.5 h-3.5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                    </motion.div>
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {/* Message */}
                                      {notification.message && (
                                        <p className={`text-xs leading-relaxed mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                          {notification.message}
                                        </p>
                                      )}

                                      {/* Amount Display with User's Currency */}
                                      {notification.amount &&
                                        notification.asset && (() => {
                                          // Check if this is a manual profit notification (TRADE type with non-fiat asset)
                                          const isFiatAsset = FIAT_CURRENCIES.has(notification.asset?.toUpperCase() || "");
                                          const isTradeProfit = notification.type?.toUpperCase() === "TRADE" && !isFiatAsset;
                                          
                                          // For trade profits, amount is in USD - use formatAmount to convert to user's preferred currency
                                          // For fiat notifications (deposits/withdrawals), amount is already in user's currency
                                          const displayAmount = isTradeProfit
                                            ? formatAmount(Math.abs(notification.amount), 2)
                                            : isFiatAsset
                                              ? formatCurrencyUtil(Math.abs(notification.amount), notification.asset || "USD", 2)
                                              : Math.abs(notification.amount).toLocaleString("en-US", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 8,
                                                });
                                          
                                          // For trade profits, don't show asset symbol since formatAmount includes currency symbol
                                          const showAssetSymbol = !isTradeProfit;
                                          
                                          const isPositive = notification.amount >= 0;
                                          const colorClass = isPositive
                                            ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                                            : "bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20";
                                          const textGradient = isPositive
                                            ? "bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                                            : "bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent";
                                          const mutedTextClass = isPositive ? "text-green-500" : "text-red-500";

                                          return (
                                            <div className={`inline-flex flex-col px-2 py-1.5 rounded-lg ${colorClass} mb-2`}>
                                              {isTradeProfit ? (
                                                // Show USD → user currency conversion
                                                <div className="flex items-center gap-1.5">
                                                  <span className={`text-xs font-semibold ${mutedTextClass} opacity-70`}>
                                                    {isPositive ? "+" : "-"}${Math.abs(notification.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                  </span>
                                                  <ArrowRight size={11} className={mutedTextClass} />
                                                  <span className={`text-base font-black ${textGradient}`}>
                                                    {isPositive ? "+" : "-"}{displayAmount}
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="inline-flex items-center space-x-1.5">
                                                  <span className={`text-base font-black ${textGradient}`}>
                                                    {isPositive ? "+" : "-"}{displayAmount}
                                                  </span>
                                                  {showAssetSymbol && (
                                                    <span className={`text-xs font-bold ${mutedTextClass}`}>
                                                      {notification.asset}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Status Indicator and Actions */}
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center space-x-1.5">
                                    {!notification.read ? (
                                      <div className="flex items-center space-x-1">
                                        <Circle className="w-1.5 h-1.5 text-orange-500 fill-orange-500 animate-pulse" />
                                        <span className="text-[10px] text-orange-400 font-medium">
                                          Unread
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1">
                                        <MailOpen className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                        <span className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                          Read
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Archive/Unarchive and Delete Actions */}
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {notification.archived ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          unarchiveNotification(notification.id);
                                        }}
                                        className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-gray-700/50 text-gray-400" : "hover:bg-gray-200/70 text-gray-500"} hover:text-green-400`}
                                        title="Unarchive"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          archiveNotification(notification.id);
                                        }}
                                        className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-gray-700/50 text-gray-400" : "hover:bg-gray-200/70 text-gray-500"} hover:text-yellow-400`}
                                        title="Archive"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(notification.id);
                                      }}
                                      className={`p-1.5 rounded-md transition-colors ${isDark ? "hover:bg-gray-700/50 text-gray-400" : "hover:bg-gray-200/70 text-gray-500"} hover:text-red-400`}
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Delete Confirmation Dialog */}
          <AnimatePresence>
            {deleteConfirmId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 10 }}
                onClick={() => setDeleteConfirmId(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className={`rounded-xl p-5 shadow-2xl max-w-xs w-full mx-4 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Delete Notification</h3>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>This action cannot be undone</p>
                    </div>
                  </div>
                  <p className={`text-sm mb-5 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Are you sure you want to permanently delete this notification?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteNotification(deleteConfirmId);
                        setDeleteConfirmId(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Scrollbar Styles */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(31, 41, 55, 0.5);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(
                to bottom,
                rgb(249, 115, 22),
                rgb(168, 85, 247)
              );
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(
                to bottom,
                rgb(234, 88, 12),
                rgb(147, 51, 234)
              );
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render outside of normal DOM hierarchy
  return createPortal(panelContent, document.body);
}
