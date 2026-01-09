"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onBlock: () => void;
}

export default function NotificationPermissionModal({
  isOpen,
  onAllow,
  onBlock,
}: NotificationPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onBlock}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                <button
                  onClick={onBlock}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Bell className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Enable Notifications</h2>
                    <p className="text-white/80 text-sm">Stay updated with M4Capital</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                <p className="text-gray-300 text-base leading-relaxed">
                  Get instant alerts for important trading updates, market movements, and account activities.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Real-time Trading Alerts</p>
                      <p className="text-gray-400 text-xs">Get notified when your trades execute</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Market Updates</p>
                      <p className="text-gray-400 text-xs">Stay informed about price changes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Account Security</p>
                      <p className="text-gray-400 text-xs">Instant alerts for important account events</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  onClick={onAllow}
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Allow Notifications
                </Button>
                <Button
                  onClick={onBlock}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
