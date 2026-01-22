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
  ArrowLeft,
  CreditCard,
  TrendingUp,
  FileCheck,
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Custom Header for Staff Admin */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Staff Admin Dashboard</h1>
                <p className="text-sm text-gray-400">
                  Manage your assigned users
                </p>
              </div>
            </div>
            {/* KYC Verification Link */}
            <Link
              href="/admin/kyc"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all font-semibold text-sm"
            >
              <FileCheck className="w-5 h-5" />
              KYC Verification
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Assigned Users</p>
                <p className="text-2xl font-bold">{assignedUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold">
                  $
                  {assignedUsers
                    .reduce((sum, u) => sum + u.balance, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active Today</p>
                <p className="text-2xl font-bold">{assignedUsers.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Notification */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`max-w-7xl mx-auto mb-4 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/20 border-green-500/50 text-green-400"
              : "bg-red-500/20 border-red-500/50 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{message.text}</p>
          </div>
        </motion.div>
      )}

      {/* Users List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Account Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {assignedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-400"
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
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{user.name || "N/A"}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {user.accountType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-green-400">
                          {getCurrencySymbol(user.preferredCurrency || "USD")}
                          {user.balance.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm font-semibold"
                        >
                          <CreditCard className="w-4 h-4" />
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
      </div>

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
