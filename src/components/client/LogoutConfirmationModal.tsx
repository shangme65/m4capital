"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmationModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 z-[150]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[151] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border ${
                isDark 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <motion.div
                  className="bg-orange-500/10 rounded-full p-4"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  <AlertTriangle className="text-orange-500" size={32} />
                </motion.div>
              </div>

              {/* Title */}
              <h2 className={`text-xl sm:text-2xl font-bold text-center mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Confirm Logout
              </h2>

              {/* Message */}
              <p className={`text-center mb-6 sm:mb-8 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Are you sure you want to logout?
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* No Button */}
                <motion.button
                  onClick={onClose}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border ${
                    isDark 
                      ? "bg-gray-700 hover:bg-gray-600 text-white border-gray-600" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  No
                </motion.button>

                {/* Yes Button */}
                <motion.button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
