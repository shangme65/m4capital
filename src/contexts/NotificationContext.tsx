"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface Notification {
  id: string;
  type:
    | "deposit"
    | "withdraw"
    | "trade"
    | "info"
    | "warning"
    | "success"
    | "transaction";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  amount?: number;
  asset?: string;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw" | "convert" | "transfer";
  asset: string;
  amount: number;
  value: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  fee?: number;
  method?: string;
  description?: string;
  date?: Date;
  currency?: string;
  fromAsset?: string;
  toAsset?: string;
  rate?: number;
  confirmations?: number;
  maxConfirmations?: number;
  hash?: string;
  network?: string;
  address?: string;
  memo?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  recentActivity: Transaction[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.notifications.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session?.user?.id, status]);

  const addNotification = (
    notificationData: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const addTransaction = (transactionData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    };

    setRecentActivity((prev) => [newTransaction, ...prev.slice(0, 9)]); // Keep only last 10 transactions
  };

  const markNotificationAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Update on server
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );

    // Update on server
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const clearNotifications = async () => {
    // Optimistically update UI
    setNotifications([]);

    // Delete on server
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        recentActivity,
        unreadCount,
        addNotification,
        addTransaction,
        markNotificationAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
