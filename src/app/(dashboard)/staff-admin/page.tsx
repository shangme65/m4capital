"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Wallet,
  AlertCircle,
  Check,
  X,
  CreditCard,
  TrendingUp,
  FileCheck,
  Shield,
  AlertTriangle,
  History,
} from "lucide-react";
import { motion } from "framer-motion";
import { getCurrencySymbol } from "@/lib/currencies";

interface AssignedUser {
  id: string;
  email: string;
  name: string | null;
  accountType: string;
  balance: number;
  createdAt: string;
  preferredCurrency?: string;
}

export default function StaffAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupDescription, setTopupDescription] = useState("");
  const [processingTopup, setProcessingTopup] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"users" | "transactions">("users");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Check if user is staff admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "STAFF_ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  // Fetch assigned users
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "STAFF_ADMIN") {
      fetchAssignedUsers();
    }
  }, [status, session]);

  const fetchAssignedUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/staff-users");
      const data = await response.json();

      if (data.success) {
        setAssignedUsers(data.users);
      } else {
        showMessage(data.error || "Failed to fetch users", "error");
      }
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      showMessage("Failed to load assigned users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!selectedUser || !topupAmount || parseFloat(topupAmount) <= 0) {
      showMessage("Please enter a valid amount", "error");
      return;
    }

    setProcessingTopup(true);
    try {
      const response = await fetch("/api/admin/staff-topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(topupAmount),
          currency: selectedUser.preferredCurrency || "USD",
          description: topupDescription || "Manual top-up by staff admin",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const currencySymbol = getCurrencySymbol(
          selectedUser.preferredCurrency || "USD"
        );
        showMessage(
          `Successfully credited ${currencySymbol}${topupAmount} to ${selectedUser.email}`,
          "success"
        );
        setSelectedUser(null);
        setTopupAmount("");
        setTopupDescription("");
        fetchAssignedUsers(); // Refresh the list
      } else {
        showMessage(data.error || "Failed to process top-up", "error");
      }
    } catch (error) {
      console.error("Error processing top-up:", error);
      showMessage("Failed to process top-up", "error");
    } finally {
      setProcessingTopup(false);
    }
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      // Fetch transactions for all assigned users
      const userIds = assignedUsers.map(u => u.id);
      const response = await fetch("/api/admin/staff-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Fetch transactions when switching to transactions tab
  useEffect(() => {
    if (activeTab === "transactions" && assignedUsers.length > 0) {
      fetchTransactions();
    }
  }, [activeTab, assignedUsers]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading staff admin...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "STAFF_ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-3 py-4 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Message Notification */}
      {message && (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
          <div
            className={`p-4 rounded-lg border shadow-lg ${
              message.type === "success"
                ? "bg-green-900/90 border-green-500/50 text-green-400"
                : "bg-red-900/90 border-red-500/50 text-red-400"
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === "success" ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <p>{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Admin Header */}
      <div className="mb-2 xs:mb-3 sm:mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div>
              <h1 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Staff Admin Panel
              </h1>
              <p className="text-[10px] xs:text-xs text-gray-400">
                Manage your assigned users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - 3D Crypto Card Style */}
      <div className="bg-gray-800/50 rounded-xl p-2 sm:p-3 border border-gray-700/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] -mx-1 sm:mx-0 mb-4">
        <div className="space-y-2">
          {/* Manual Payment */}
          <button
            onClick={() => {
              setActiveTab("users");
              // Scroll to users table or open payment modal
            }}
            className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.25),0_0_30px_rgba(34,197,94,0.4)]"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                style={{
                  boxShadow:
                    "0 4px 16px #22c55e40, 0 2px 8px #22c55e60, inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <CreditCard
                  className="relative z-10 drop-shadow-lg text-white"
                  size={20}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-sm">
                  Manual Payment
                </span>
                <span className="text-gray-400 text-xs">
                  Process user deposits
                </span>
              </div>
            </div>
            <div className="text-green-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* Manage Users */}
          <button
            onClick={() => setActiveTab("users")}
            className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.25),0_0_30px_rgba(59,130,246,0.4)]"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                style={{
                  boxShadow:
                    "0 4px 16px #3b82f640, 0 2px 8px #3b82f660, inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <Users
                  className="relative z-10 drop-shadow-lg text-white"
                  size={20}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-sm">
                  Manage Users
                </span>
                <span className="text-gray-400 text-xs">
                  View and manage assigned users
                </span>
              </div>
            </div>
            <div className="text-blue-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* Transaction History */}
          <button
            onClick={() => setActiveTab("transactions")}
            className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(249,115,22,0.25),0_0_30px_rgba(249,115,22,0.4)]"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                style={{
                  boxShadow:
                    "0 4px 16px #f9731640, 0 2px 8px #f9731660, inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <History
                  className="relative z-10 drop-shadow-lg text-white"
                  size={20}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-sm">
                  Transaction History
                </span>
                <span className="text-gray-400 text-xs">
                  View all user transactions
                </span>
              </div>
            </div>
            <div className="text-orange-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          {/* KYC Verification */}
          <Link
            href="/admin/kyc"
            className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(139,92,246,0.25),0_0_30px_rgba(139,92,246,0.4)]"
            style={{
              background:
                "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
              boxShadow:
                "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                style={{
                  boxShadow:
                    "0 4px 16px #8b5cf640, 0 2px 8px #8b5cf660, inset 0 1px 2px rgba(255,255,255,0.2)",
                }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <FileCheck
                  className="relative z-10 drop-shadow-lg text-white"
                  size={20}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-sm">
                  KYC Verification
                </span>
                <span className="text-gray-400 text-xs">
                  Review user verification documents
                </span>
              </div>
            </div>
            <div className="text-purple-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="relative rounded-xl p-4 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
            boxShadow:
              "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(249, 115, 22, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0"
              style={{
                boxShadow:
                  "0 4px 16px #f9731640, 0 2px 8px #f9731660, inset 0 1px 2px rgba(255,255,255,0.2)",
              }}
            >
              <Users className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Assigned Users</p>
              <p className="text-xl font-bold text-white">{assignedUsers.length}</p>
            </div>
          </div>
        </div>

        <div
          className="relative rounded-xl p-4 overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
            boxShadow:
              "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0"
              style={{
                boxShadow:
                  "0 4px 16px #22c55e40, 0 2px 8px #22c55e60, inset 0 1px 2px rgba(255,255,255,0.2)",
              }}
            >
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Active Today</p>
              <p className="text-xl font-bold text-white">{assignedUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && (
        <>
          {/* Users Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
          boxShadow:
            "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Account Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {assignedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users assigned to you yet</p>
                  </td>
                </tr>
              ) : (
                assignedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-white text-sm">{user.name || "N/A"}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-green-400 text-sm">
                        {getCurrencySymbol(user.preferredCurrency || "USD")}
                        {user.balance.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-colors text-xs font-semibold shadow-lg"
                        style={{
                          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                        }}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Top Up
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Transactions Tab Content */}
      {activeTab === "transactions" && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
            boxShadow:
              "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              Transaction History
            </h3>
            <p className="text-xs text-gray-400 mt-1">All transactions from assigned users</p>
          </div>
          <div className="overflow-x-auto">
            {loadingTransactions ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {transactions.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-400">
                          {new Date(tx.timestamp || tx.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(tx.timestamp || tx.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-white text-sm">{tx.userName || "N/A"}</p>
                          <p className="text-xs text-gray-400">{tx.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.type === "deposit" || tx.type === "buy"
                            ? "bg-green-500/20 text-green-400"
                            : tx.type === "withdraw" || tx.type === "sell"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {tx.type?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{tx.asset || "USD"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`font-semibold text-sm ${
                          tx.type === "deposit" || tx.type === "buy"
                            ? "text-green-400"
                            : tx.type === "withdraw" || tx.type === "sell"
                            ? "text-red-400"
                            : "text-white"
                        }`}>
                          {tx.type === "deposit" || tx.type === "buy" ? "+" : tx.type === "withdraw" || tx.type === "sell" ? "-" : ""}
                          {typeof tx.amount === "number" ? tx.amount.toLocaleString(undefined, { maximumFractionDigits: 8 }) : tx.amount}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === "completed" || tx.status === "closed"
                            ? "bg-green-500/20 text-green-400"
                            : tx.status === "pending" || tx.status === "confirming"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {tx.status || "completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b border-gray-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-orange-400" />
                Manual Top-Up
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">User</p>
                <p className="font-semibold text-white">{selectedUser.email}</p>
                {selectedUser.name && (
                  <p className="text-sm text-gray-300 mt-1">
                    {selectedUser.name}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Current Balance:{" "}
                  <span className="text-green-400 font-semibold">
                    {getCurrencySymbol(selectedUser.preferredCurrency || "USD")}
                    {selectedUser.balance.toLocaleString()}
                  </span>
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({selectedUser.preferredCurrency || "USD"})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    {getCurrencySymbol(selectedUser.preferredCurrency || "USD")}
                  </span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={topupDescription}
                  onChange={(e) => setTopupDescription(e.target.value)}
                  placeholder="Add a note about this top-up..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleTopup}
                  disabled={
                    processingTopup ||
                    !topupAmount ||
                    parseFloat(topupAmount) <= 0
                  }
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {processingTopup ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirm Top-Up
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setTopupAmount("");
                    setTopupDescription("");
                  }}
                  disabled={processingTopup}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
