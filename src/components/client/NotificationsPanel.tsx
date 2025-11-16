"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  CheckCheck,
  Trash2,
  Bell,
  DollarSign,
  TrendingUp,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";

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
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const [expandedNotifications, setExpandedNotifications] = useState<
    Set<string>
  >(new Set());

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "deposit":
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case "withdraw":
        return <DollarSign className="w-5 h-5 text-red-500" />;
      case "trade":
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case "success":
        return <Check className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close notifications panel"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center space-x-2 text-sm text-orange-500 hover:text-orange-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
                <button
                  onClick={clearNotifications}
                  className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Bell className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No notifications</p>
                  <p className="text-sm text-center">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    const isExpanded = expandedNotifications.has(
                      notification.id
                    );
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          toggleExpanded(notification.id);
                          if (!notification.read) {
                            markNotificationAsRead(notification.id);
                          }
                        }}
                        className={`p-4 border-b border-gray-800 transition-colors hover:bg-gray-800 cursor-pointer ${
                          !notification.read
                            ? "bg-gray-800/50 border-l-4 border-l-orange-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p
                                className={`text-sm font-medium ${
                                  !notification.read
                                    ? "text-white"
                                    : "text-gray-300"
                                }`}
                              >
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>

                            {/* Expandable Message - Click anywhere to expand */}
                            {notification.message && (
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm text-gray-400 mt-2 overflow-hidden"
                                  >
                                    {notification.message}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            )}

                            {notification.amount && notification.asset && (
                              <div className="mt-2 text-xs text-green-500 font-medium">
                                +${notification.amount.toLocaleString()}{" "}
                                {notification.asset}
                              </div>
                            )}
                            {!notification.read && (
                              <div className="mt-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
