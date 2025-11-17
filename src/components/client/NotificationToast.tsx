"use client";

import { useEffect } from "react";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationToastProps {
  message: string;
  type?: NotificationType;
  onClose: () => void;
  duration?: number;
}

export default function NotificationToast({
  message,
  type = "info",
  onClose,
  duration = 5000,
}: NotificationToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-green-50 border-green-500",
      icon: <FiCheckCircle className="text-green-500" size={24} />,
      text: "text-green-800",
    },
    error: {
      bg: "bg-red-50 border-red-500",
      icon: <FiAlertCircle className="text-red-500" size={24} />,
      text: "text-red-800",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-500",
      icon: <FiAlertTriangle className="text-yellow-500" size={24} />,
      text: "text-yellow-800",
    },
    info: {
      bg: "bg-blue-50 border-blue-500",
      icon: <FiInfo className="text-blue-500" size={24} />,
      text: "text-blue-800",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] max-w-md w-full ${style.bg} border-l-4 rounded-lg shadow-2xl animate-slide-in-right`}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className={`flex-1 ${style.text}`}>
          <p className="text-sm font-medium whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
        >
          <FiX size={20} />
        </button>
      </div>
    </div>
  );
}
