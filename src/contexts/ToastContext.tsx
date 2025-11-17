"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import NotificationToast, {
  NotificationType,
} from "../components/client/NotificationToast";

interface ToastNotification {
  id: string;
  message: string;
  type: NotificationType;
}

interface ToastContextType {
  showToast: (message: string, type?: NotificationType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback(
    (message: string, type: NotificationType = "info") => {
      const id = Math.random().toString(36).substring(7) + Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast(message, "warning");
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
