"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeAgo } from "@/lib/crypto-constants";
import {
  formatCurrency as formatCurrencyUtil,
  getCurrencySymbol,
} from "@/lib/currencies";
import {
  X,
  Bell,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  MailOpen,
  Circle,
  ChevronDown,
  Archive,
} from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";

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
    deleteNotification,
  } = useNotifications();
  const { formatAmount } = useCurrency();

  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
    // New gradient style for all notifications

    // Crypto Purchase (buy)
    if (
      notification.title?.includes("You've bought") ||
      notification.title?.includes("Crypto Purchase")
    ) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg blur-sm opacity-50"></div>
          <div className="relative w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    // Crypto Sell
    if (notification.title?.includes("You've sold")) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-600 rounded-lg blur-sm opacity-50"></div>
          <div className="relative w-8 h-8 bg-gradient-to-br from-red-400 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
            <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    // Deposits (BRL, USD, EUR, crypto, etc.)
    if (
      notification.title?.includes("Deposit Completed") ||
      notification.title?.includes("Deposit") ||
      notification.type?.toUpperCase() === "SUCCESS"
    ) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg blur-sm opacity-50"></div>
          <div className="relative w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    // Withdrawals
    if (
      notification.title?.includes("Withdraw") ||
      notification.title?.includes("Withdrawal")
    ) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg blur-sm opacity-50"></div>
          <div className="relative w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    // Default icons with new gradient style
    const iconConfig: Record<
      string,
      { icon: any; gradient: string; color: string }
    > = {
      DEPOSIT: {
        icon: TrendingUp,
        gradient: "from-blue-400 to-cyan-600",
        color: "text-white",
      },
      WITHDRAW: {
        icon: TrendingDown,
        gradient: "from-orange-400 to-red-600",
        color: "text-white",
      },
      TRADE: {
        icon: TrendingUp,
        gradient: "from-purple-400 to-indigo-600",
        color: "text-white",
      },
      TRANSACTION: {
        icon: TrendingUp,
        gradient: "from-purple-400 to-indigo-600",
        color: "text-white",
      },
      SUCCESS: {
        icon: TrendingUp,
        gradient: "from-green-400 to-emerald-600",
        color: "text-white",
      },
      WARNING: {
        icon: AlertTriangle,
        gradient: "from-yellow-400 to-orange-600",
        color: "text-white",
      },
    };

    const config =
      iconConfig[notification.type?.toUpperCase()] || iconConfig.TRANSACTION;
    const IconComponent = config.icon;

    return (
      <div className="relative">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-lg blur-sm opacity-50`}
        ></div>
        <div
          className={`relative w-8 h-8 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shadow-md`}
        >
          <IconComponent
            className={`w-4 h-4 ${config.color}`}
            strokeWidth={2.5}
          />
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
            className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-l border-gray-700/50 flex flex-col shadow-2xl"
            style={{ zIndex: 3 }}
          >
            {/* Smaller Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10"></div>
              <div className="relative flex items-center justify-between p-4 border-b border-gray-700/50">
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
                    <h2 className="text-lg font-bold text-white">
                      Notifications
                    </h2>
                    <p className="text-[10px] text-gray-400">
                      {notifications.length} total
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-all hover:rotate-90 duration-300"
                  aria-label="Close notifications panel"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Smaller Filter Tabs */}
              <div className="relative flex items-center space-x-2 px-4 py-2 bg-gray-800/50">
                <button
                  onClick={() => setFilter("all")}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === "all"
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filter === "all" && (
                    <motion.div
                      layoutId="filterBg"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-lg border border-orange-500/30"
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
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filter === "unread" && (
                    <motion.div
                      layoutId="filterBg"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-lg border border-orange-500/30"
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
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filter === "archived" && (
                    <motion.div
                      layoutId="filterBg"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-lg border border-orange-500/30"
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
                  className="flex flex-col items-center justify-center h-full text-gray-500 p-8"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center border border-gray-600/50">
                      <Bell className="w-12 h-12 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white mb-2">
                    {filter === "unread"
                      ? "All caught up!"
                      : "No notifications"}
                  </p>
                  <p className="text-sm text-center text-gray-400 max-w-xs">
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
                            !notification.read
                              ? "bg-gradient-to-br from-gray-800/90 to-gray-800/50 border-orange-500/30 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
                              : "bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                          }`}
                        >
                          {/* Gradient overlay for unread */}
                          {!notification.read && (
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          )}

                          {/* Unread indicator line */}
                          {!notification.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-purple-500 to-blue-500"></div>
                          )}

                          <div className="relative p-2.5">
                            <div className="flex items-start space-x-2.5">
                              {/* Enhanced Icon */}
                              <div className="flex-shrink-0">
                                {getNotificationIcon(notification)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-0.5">
                                  <h3
                                    className={`text-xs font-bold ${
                                      !notification.read
                                        ? "text-white"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                  <div className="flex items-center space-x-1.5 ml-2">
                                    <span className="text-[10px] text-gray-500 flex-shrink-0 font-medium">
                                      {formatTimeAgo(notification.timestamp)}
                                    </span>
                                    <motion.div
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
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
                                        <p className="text-xs text-gray-400 leading-relaxed mb-2 mt-1">
                                          {notification.message}
                                        </p>
                                      )}

                                      {/* Amount Display with User's Currency */}
                                      {notification.amount &&
                                        notification.asset && (
                                          <div
                                            className={`inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg ${
                                              notification.amount < 0
                                                ? "bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20"
                                                : "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                                            } mb-2`}
                                          >
                                            <span
                                              className={`text-base font-black ${
                                                notification.amount < 0
                                                  ? "bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent"
                                                  : "bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                                              }`}
                                            >
                                              {notification.amount < 0
                                                ? "-"
                                                : "+"}
                                              {/* For fiat currencies, display as-is without conversion */}
                                              {/* For crypto, amount is the crypto quantity - display directly */}
                                              {FIAT_CURRENCIES.has(
                                                notification.asset?.toUpperCase() ||
                                                  ""
                                              )
                                                ? formatCurrencyUtil(
                                                    Math.abs(
                                                      notification.amount
                                                    ),
                                                    notification.asset || "USD",
                                                    2
                                                  )
                                                : Math.abs(
                                                    notification.amount
                                                  ).toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 8,
                                                  })}
                                            </span>
                                            <span
                                              className={`text-xs font-bold ${
                                                notification.amount < 0
                                                  ? "text-red-400"
                                                  : "text-green-400"
                                              }`}
                                            >
                                              {notification.asset}
                                            </span>
                                          </div>
                                        )}
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
                                        <MailOpen className="w-3 h-3 text-gray-500" />
                                        <span className="text-[10px] text-gray-500">
                                          Read
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Archive and Delete Actions */}
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {!notification.archived && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          archiveNotification(notification.id);
                                        }}
                                        className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-yellow-400 transition-colors"
                                        title="Archive"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="p-1.5 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-colors"
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
