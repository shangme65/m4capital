"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const { notifications, unreadCount, markNotificationAsRead } =
    useNotifications();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const getNotificationIcon = (notification: Notification) => {
    // Enhanced icons with gradient backgrounds
    if (notification.title?.includes("You've bought")) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl blur-md opacity-50"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ArrowUpRight className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }
    if (notification.title?.includes("You've sold")) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl blur-md opacity-50"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ArrowDownRight className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }
    if (
      notification.title?.includes("USD Deposit") ||
      notification.title?.includes("Incoming USD") ||
      notification.title?.includes("Purchase Completed")
    ) {
      return (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl blur-md opacity-50"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
      );
    }

    // Default icons
    const iconConfig: Record<
      string,
      { icon: any; gradient: string; color: string }
    > = {
      deposit: {
        icon: DollarSign,
        gradient: "from-green-400 to-emerald-600",
        color: "text-white",
      },
      withdraw: {
        icon: DollarSign,
        gradient: "from-red-400 to-rose-600",
        color: "text-white",
      },
      trade: {
        icon: TrendingUp,
        gradient: "from-purple-400 to-indigo-600",
        color: "text-white",
      },
      transaction: {
        icon: TrendingUp,
        gradient: "from-blue-400 to-cyan-600",
        color: "text-white",
      },
      success: {
        icon: CheckCircle,
        gradient: "from-green-400 to-emerald-600",
        color: "text-white",
      },
      warning: {
        icon: AlertTriangle,
        gradient: "from-yellow-400 to-orange-600",
        color: "text-white",
      },
    };

    const config = iconConfig[notification.type] || iconConfig.transaction;
    const IconComponent = config.icon;

    return (
      <div className="relative">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-2xl blur-md opacity-50`}
        ></div>
        <div
          className={`relative w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          <IconComponent
            className={`w-6 h-6 ${config.color}`}
            strokeWidth={2.5}
          />
        </div>
      </div>
    );
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Enhanced Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.9 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-l border-gray-700/50 z-50 flex flex-col shadow-2xl"
          >
            {/* Enhanced Header with gradient */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10"></div>
              <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-orange-500" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <span className="text-white text-[10px] font-bold">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Notifications
                    </h2>
                    <p className="text-xs text-gray-400">
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
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="relative flex items-center space-x-2 px-6 py-3 bg-gray-800/50">
                <button
                  onClick={() => setFilter("all")}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                  <span className="relative flex items-center space-x-2">
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
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
                <div className="p-4 space-y-3">
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
                          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
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

                          <div className="relative p-4">
                            <div className="flex items-start space-x-4">
                              {/* Enhanced Icon */}
                              <div className="flex-shrink-0">
                                {getNotificationIcon(notification)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h3
                                    className={`text-base font-bold ${
                                      !notification.read
                                        ? "text-white"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                  <div className="flex items-center space-x-2 ml-2">
                                    <span className="text-xs text-gray-500 flex-shrink-0 font-medium">
                                      {formatTimeAgo(notification.timestamp)}
                                    </span>
                                    <motion.div
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
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
                                        <p className="text-sm text-gray-400 leading-relaxed mb-3 mt-2">
                                          {notification.message}
                                        </p>
                                      )}

                                      {/* Amount Display with User's Currency */}
                                      {notification.amount &&
                                        notification.asset && (
                                          <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 mb-3">
                                            <span className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                              +
                                              {formatAmount(
                                                notification.amount,
                                                2
                                              )}
                                            </span>
                                            <span className="text-sm font-bold text-green-400">
                                              {notification.asset}
                                            </span>
                                          </div>
                                        )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Status Indicator */}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-2">
                                    {!notification.read ? (
                                      <div className="flex items-center space-x-1.5">
                                        <Circle className="w-2 h-2 text-orange-500 fill-orange-500 animate-pulse" />
                                        <span className="text-xs text-orange-400 font-medium">
                                          Unread
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1.5">
                                        <MailOpen className="w-3.5 h-3.5 text-gray-500" />
                                        <span className="text-xs text-gray-500">
                                          Read
                                        </span>
                                      </div>
                                    )}
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
        </>
      )}
    </AnimatePresence>
  );
}
