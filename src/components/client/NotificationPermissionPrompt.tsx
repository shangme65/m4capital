"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function NotificationPermissionPrompt() {
  const { requestNotificationPermission, notificationPermission } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // Don't show if already granted or denied
    if (
      notificationPermission === "granted" ||
      notificationPermission === "denied"
    ) {
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("notification-prompt-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = Math.floor(
        (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notificationPermission]);

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        // Send a test notification
        new Notification("🔔 Notifications Enabled!", {
          body: "You'll now receive important updates from M4Capital.",
          icon: "/icons/icon-192x192.png",
        });
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    } finally {
      setIsRequesting(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(
      "notification-prompt-dismissed",
      new Date().toISOString()
    );
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[9999]"
      >
        <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.3)] border border-gray-700/50">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,0.5)]">
              <Bell className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-1">
                Enable Notifications
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Get instant alerts for deposits, withdrawals, and important
                account updates.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleEnable}
                  disabled={isRequesting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequesting ? "Enabling..." : "Enable"}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 font-medium rounded-lg hover:bg-gray-600/50 transition-all border border-gray-600/50"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
