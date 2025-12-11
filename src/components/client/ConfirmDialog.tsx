"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onCancel]);

  const variantStyles = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-yellow-500",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 p-3 sm:p-4">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl max-w-sm w-full mx-2 shadow-2xl border border-gray-700 animate-slide-in-right">
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className={`flex-shrink-0 ${style.icon}`}>
              <FiAlertTriangle size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-0.5"
            >
              <FiX size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 px-3 py-2 sm:px-4 sm:py-2.5 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
