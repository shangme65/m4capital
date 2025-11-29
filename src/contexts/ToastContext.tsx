"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  requestNotificationPermission: () => Promise<NotificationPermission>;
  notificationPermission: NotificationPermission | null;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Map toast type to notification icon and title prefix
const getNotificationDetails = (type: NotificationType) => {
  switch (type) {
    case "success":
      return { title: "✅ Success", icon: "/icons/icon-192x192.png" };
    case "error":
      return { title: "❌ Error", icon: "/icons/icon-192x192.png" };
    case "warning":
      return { title: "⚠️ Warning", icon: "/icons/icon-192x192.png" };
    case "info":
    default:
      return { title: "ℹ️ M4Capital", icon: "/icons/icon-192x192.png" };
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (typeof window === "undefined" || !("Notification" in window)) {
        return "denied";
      }

      if (Notification.permission === "granted") {
        setNotificationPermission("granted");
        return "granted";
      }

      if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
      }

      return Notification.permission;
    }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback(
    (message: string, type: NotificationType) => {
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      // Don't send browser notifications if the page is visible/focused
      // to avoid duplicate notifications
      if (document.visibilityState === "visible" && document.hasFocus()) {
        return;
      }

      const { title, icon } = getNotificationDetails(type);

      try {
        const notification = new Notification(title, {
          body: message,
          icon: icon,
          badge: "/icons/icon-72x72.png",
          tag: `m4capital-${type}-${Date.now()}`,
          requireInteraction: type === "error" || type === "warning",
          silent: false,
        });

        // Auto-close after 5 seconds for success/info
        if (type === "success" || type === "info") {
          setTimeout(() => notification.close(), 5000);
        }

        // Focus the window when notification is clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Failed to send browser notification:", error);
      }
    },
    []
  );

  const showToast = useCallback(
    (message: string, type: NotificationType = "info") => {
      const id = Math.random().toString(36).substring(7) + Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Also send browser notification
      sendBrowserNotification(message, type);
    },
    [sendBrowserNotification]
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
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        requestNotificationPermission,
        notificationPermission,
      }}
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
