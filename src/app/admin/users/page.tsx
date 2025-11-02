"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  accountType: string;
  country: string | null;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  _count?: {
    sessions: number;
  };
  kycVerification?: {
    status: string;
  } | null;
  portfolio?: {
    balance: number;
  } | null;
}

type TabType = "active" | "bin";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session?.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "active"
          ? "/api/admin/users/list"
          : "/api/admin/users/bin";

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to move this user to the bin?")) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/delete/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
    setActionLoading(null);
  }

  async function handleRestoreUser(userId: string) {
    if (!confirm("Are you sure you want to restore this user?")) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/restore/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.error || "Failed to restore user");
      }
    } catch (error) {
      console.error("Error restoring user:", error);
      alert("Failed to restore user");
    }
    setActionLoading(null);
  }

  async function handlePermanentDelete(userId: string, userEmail: string) {
    const confirmation = prompt(
      `⚠️ PERMANENT DELETE - This action is IRREVERSIBLE!\n\n` +
        `This will completely remove the user and all their data from the database.\n` +
        `The email "${userEmail}" will be freed for reuse.\n\n` +
        `Type "DELETE FOREVER" to confirm:`
    );

    if (confirmation !== "DELETE FOREVER") return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/permanent-delete/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message || "User permanently deleted");
        await fetchUsers();
      } else {
        alert(data.error || "Failed to permanently delete user");
      }
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      alert("Failed to permanently delete user");
    }
    setActionLoading(null);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (session?.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "active"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Active Users ({activeTab === "active" ? users.length : "..."})
          </button>
          <button
            onClick={() => setActiveTab("bin")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "bin"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Bin ({activeTab === "bin" ? users.length : "..."})
          </button>
        </div>

        {/* Users List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {activeTab === "active"
                ? "No active users found"
                : "No deleted users in bin"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      KYC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {activeTab === "active" ? "Created" : "Deleted"}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">
                            {user.name || "No name"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                          {user.country && (
                            <div className="text-xs text-gray-500">
                              {user.country}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-900 text-purple-200"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.accountType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.kycVerification ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.kycVerification.status === "APPROVED"
                                ? "bg-green-900 text-green-200"
                                : user.kycVerification.status === "REJECTED"
                                ? "bg-red-900 text-red-200"
                                : "bg-yellow-900 text-yellow-200"
                            }`}
                          >
                            {user.kycVerification.status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.portfolio
                          ? `$${Number(
                              user.portfolio.balance
                            ).toLocaleString()}`
                          : "$0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(
                          activeTab === "active"
                            ? user.createdAt
                            : user.deletedAt || user.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {activeTab === "active" ? (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            {actionLoading === user.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleRestoreUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="text-green-400 hover:text-green-300 disabled:opacity-50"
                            >
                              {actionLoading === user.id
                                ? "Restoring..."
                                : "Restore"}
                            </button>
                            <button
                              onClick={() =>
                                handlePermanentDelete(
                                  user.id,
                                  user.email || "Unknown"
                                )
                              }
                              disabled={actionLoading === user.id}
                              className="text-red-600 hover:text-red-500 disabled:opacity-50 font-semibold"
                            >
                              {actionLoading === user.id
                                ? "Deleting..."
                                : "Delete Forever"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>
            <strong>Note:</strong> Deleted users are moved to the bin and can be
            restored. Use{" "}
            <span className="text-red-500 font-semibold">"Delete Forever"</span>{" "}
            in the Bin tab to permanently remove users and free up their email
            addresses for reuse. Permanent deletion is irreversible.
          </p>
        </div>
      </div>
    </div>
  );
}
