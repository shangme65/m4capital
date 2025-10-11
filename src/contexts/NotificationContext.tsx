"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "Welcome to M4Capital",
      message: "Your account has been successfully created. Start trading now!",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Account Verified",
      message:
        "Your account has been successfully verified. You can now access all features.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<Transaction[]>([
    {
      id: "1",
      type: "buy",
      asset: "BTC",
      amount: 0.1234,
      value: 7856.32,
      timestamp: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      type: "sell",
      asset: "ETH",
      amount: 2.5,
      value: 6234.78,
      timestamp: "5 hours ago",
      status: "completed",
    },
    {
      id: "3",
      type: "deposit",
      asset: "USD",
      amount: 10000,
      value: 10000,
      timestamp: "1 day ago",
      status: "completed",
    },
    {
      id: "4",
      type: "convert",
      asset: "ADA → SOL",
      amount: 1000,
      value: 425.67,
      timestamp: "2 days ago",
      status: "completed",
    },
    {
      id: "5",
      type: "withdraw",
      asset: "USD",
      amount: 2500,
      value: 2500,
      timestamp: "3 days ago",
      status: "pending",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (
    notificationData: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const addTransaction = (transactionData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    setRecentActivity((prev) => [newTransaction, ...prev.slice(0, 9)]); // Keep only last 10 transactions
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
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
