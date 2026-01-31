"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimeAgo } from "@/lib/crypto-constants";

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
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");
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

  const card3DStyle = {
    background:
      "linear-gradient(145deg, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.7))",
    boxShadow:
      "0 10px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Withdrawal Management
          </h1>
          <p className="text-gray-400">
            Review and manage user withdrawal requests
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {["PENDING", "PROCESSING", "COMPLETED", "REJECTED", "ALL"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            )
          )}
        </motion.div>

        {/* Withdrawals List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-4">Loading withdrawals...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-2xl"
            style={card3DStyle}
          >
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
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
            <p className="text-gray-400 text-lg">No withdrawals found</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {withdrawals.map((withdrawal, index) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl p-4 md:p-6"
                  style={card3DStyle}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: User & Withdrawal Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {withdrawal.User?.name?.[0] ||
                              withdrawal.User?.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {withdrawal.User?.name || "Unknown User"}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {withdrawal.User?.email}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="text-white font-semibold">
                            {Number(withdrawal.amount).toLocaleString()}{" "}
                            {withdrawal.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Method</p>
                          <p className="text-white">
                            {withdrawal.type?.replace("CRYPTO_", "") || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fees</p>
                          <p className="text-white">
                            {withdrawal.metadata?.fees?.totalFees?.toFixed(2) ||
                              "0.00"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Created</p>
                          <p className="text-white">
                            {formatTimeAgo(withdrawal.createdAt)}
                          </p>
                        </div>
                      </div>

                      {withdrawal.metadata?.address && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-sm">
                            Withdrawal Address
                          </p>
                          <p className="text-white text-sm font-mono bg-gray-900/50 px-3 py-2 rounded-lg mt-1 break-all">
                            {withdrawal.metadata.address}
                          </p>
                        </div>
                      )}

                      {withdrawal.status === "PROCESSING" && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-sm">Confirmations</p>
                          <p className="text-white">
                            {withdrawal.metadata?.confirmations || 0} /{" "}
                            {withdrawal.metadata?.requiredConfirmations || 0}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(withdrawal.status)}`}
                      >
                        {withdrawal.status}
                      </span>

                      {withdrawal.status === "PENDING" && (
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          <div className="flex items-center gap-2">
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
                              className="w-32 px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none text-sm"
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
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {actionLoading === withdrawal.id
                                ? "Processing..."
                                : "Approve"}
                            </button>
                          </div>
                          <button
                            onClick={() => handleAction(withdrawal.id, "reject")}
                            disabled={actionLoading === withdrawal.id}
                            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      )}

                      {withdrawal.status === "PROCESSING" && (
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          <div className="flex items-center gap-2">
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
                              className="w-32 px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none text-sm"
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
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {actionLoading === withdrawal.id
                                ? "Updating..."
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
