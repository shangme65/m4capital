"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { formatTimeAgo } from "@/lib/crypto-constants";
import { useTheme } from "@/contexts/ThemeContext";

interface Withdrawal {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  createdAt: string;
  metadata?: {
    address?: string;
    fees?: { totalFees: number };
    confirmations?: number;
    requiredConfirmations?: number;
  };
  User?: {
    id: string;
    name: string | null;
    email: string;
    preferredCurrency: string | null;
  };
}

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationsInput, setConfirmationsInput] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const url =
        filter === "ALL"
          ? "/api/admin/withdrawals"
          : `/api/admin/withdrawals?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setWithdrawals(data.withdrawals);
      } else {
        console.error("Failed to fetch withdrawals:", data.error);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    withdrawalId: string,
    action: string,
    confirmations?: number
  ) => {
    try {
      setActionLoading(withdrawalId);
      const response = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, action, confirmations }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the list
        await fetchWithdrawals();
        // Clear confirmations input for this withdrawal
        setConfirmationsInput((prev) => {
          const updated = { ...prev };
          delete updated[withdrawalId];
          return updated;
        });
      } else {
        alert(data.error || "Failed to process action");
      }
    } catch (error) {
      console.error("Error processing action:", error);
      alert("Failed to process action");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10";
      case "PROCESSING":
        return "text-blue-400 bg-blue-400/10";
      case "COMPLETED":
        return "text-green-400 bg-green-400/10";
      case "REJECTED":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const card3DStyle = isDark ? {
    background:
      "linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.7))",
    boxShadow:
      "0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  } : {
    background:
      "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.7))",
    boxShadow:
      "0 10px 40px -10px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="mb-2 xs:mb-3 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div>
                <h1 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Admin Control Panel
                </h1>
                <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Complete administrative dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/admin")}
          className={`flex items-center gap-2 transition-colors p-2 rounded-lg mb-4 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-3">
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Withdrawal Management
          </h2>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Review and manage user withdrawal requests
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none cursor-pointer ${isDark ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}
          >
            <option value="ALL">ALL</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Withdrawals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading withdrawals...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-2xl"
            style={card3DStyle}
          >
            <svg
              className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>No withdrawals found</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {withdrawals.map((withdrawal, index) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl p-3"
                  style={card3DStyle}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    {/* Left: User & Withdrawal Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {withdrawal.User?.name?.[0] ||
                              withdrawal.User?.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                            {withdrawal.User?.name || "Unknown User"}
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {withdrawal.User?.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-2">
                        <div>
                          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Amount</p>
                          <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                            {Number(withdrawal.amount).toLocaleString()}{" "}
                            {withdrawal.currency}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Method</p>
                          <p className={isDark ? "text-white" : "text-gray-900"}>
                            {withdrawal.type?.replace("CRYPTO_", "") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Fees</p>
                          <p className={isDark ? "text-white" : "text-gray-900"}>
                            {withdrawal.metadata?.fees?.totalFees?.toFixed(2) ||
                              "0.00"}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Created</p>
                          <p className={isDark ? "text-white" : "text-gray-900"}>
                            {formatTimeAgo(withdrawal.createdAt)}
                          </p>
                        </div>
                      </div>

                      {withdrawal.metadata?.address && (
                        <div className="mt-2">
                          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Withdrawal Address
                          </p>
                          <p className={`text-xs font-mono px-2 py-1.5 rounded-lg mt-1 break-all ${isDark ? "text-white bg-gray-900/50" : "text-gray-900 bg-gray-100"}`}>
                            {withdrawal.metadata.address}
                          </p>
                        </div>
                      )}

                      {withdrawal.status === "PROCESSING" && (
                        <div className="mt-2">
                          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Confirmations</p>
                          <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                            {withdrawal.metadata?.confirmations || 0} /{" "}
                            {withdrawal.metadata?.requiredConfirmations || 0}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}
                      >
                        {withdrawal.status}
                      </span>

                      {withdrawal.status === "PENDING" && (
                        <div className="flex flex-col gap-1.5 w-full md:w-auto">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              placeholder="Confirmations"
                              value={confirmationsInput[withdrawal.id] || ""}
                              onChange={(e) =>
                                setConfirmationsInput((prev) => ({
                                  ...prev,
                                  [withdrawal.id]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className={`w-24 px-2 py-1.5 rounded-lg border focus:border-red-500 focus:outline-none text-xs ${isDark ? "bg-gray-900 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
                            />
                            <button
                              onClick={() =>
                                handleAction(
                                  withdrawal.id,
                                  "approve",
                                  confirmationsInput[withdrawal.id] || 0
                                )
                              }
                              disabled={actionLoading === withdrawal.id}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {actionLoading === withdrawal.id
                                ? "..."
                                : "Approve"}
                            </button>
                          </div>
                          <button
                            onClick={() => handleAction(withdrawal.id, "reject")}
                            disabled={actionLoading === withdrawal.id}
                            className="w-full px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      )}

                      {withdrawal.status === "PROCESSING" && (
                        <div className="flex flex-col gap-1.5 w-full md:w-auto">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              placeholder="New count"
                              value={confirmationsInput[withdrawal.id] || ""}
                              onChange={(e) =>
                                setConfirmationsInput((prev) => ({
                                  ...prev,
                                  [withdrawal.id]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className={`w-24 px-2 py-1.5 rounded-lg border focus:border-red-500 focus:outline-none text-xs ${isDark ? "bg-gray-900 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
                            />
                            <button
                              onClick={() =>
                                handleAction(
                                  withdrawal.id,
                                  "update_confirmations",
                                  confirmationsInput[withdrawal.id]
                                )
                              }
                              disabled={actionLoading === withdrawal.id}
                              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {actionLoading === withdrawal.id
                                ? "..."
                                : "Update"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
