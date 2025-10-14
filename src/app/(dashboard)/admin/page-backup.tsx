"use client";
import { useState, useEffect } from "react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  UserCheck,
  UserX,
  Wallet,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

const AdminDashboard = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const handleTopUp = async () => {
    if (!selectedUser || amount <= 0) {
      setMessage("Please select a user and enter a valid amount.");
      return;
    }

    setLoading(true);
    setMessage("Processing...");
    const res = await fetch("/api/admin/top-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, amount }),
    });

    if (res.ok) {
      setMessage(
        `Successfully topped up ${selectedUser.email} with $${amount}.`
      );
      setAmount(0);
    } else {
      const error = await res.json();
      setMessage(`Failed to top up: ${error.error}`);
    }
    setLoading(false);
  };

  const handleUpdateUserRole = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    setLoading(true);
    const res = await fetch("/api/admin/update-user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (res.ok) {
      setMessage(`User role updated successfully to ${newRole}`);
      // Refresh users list
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
      setEditingUser(null);
    } else {
      const error = await res.json();
      setMessage(`Failed to update user role: ${error.error}`);
    }
    setLoading(false);
  };

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const regularUsers = users.filter((user) => user.role === "USER").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Admin Header with Session Info */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, Administrator</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="text-orange-400" size={20} />
              <div>
                <p className="text-sm text-gray-300">Logged in as:</p>
                <p className="font-semibold text-orange-400">
                  {session?.user?.email}
                </p>
                <p className="text-xs text-gray-400">
                  Role: {session?.user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.includes("Failed")
              ? "bg-red-900/20 border-red-500/30 text-red-400"
              : "bg-green-900/20 border-green-500/30 text-green-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} />
            <p>{message}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
            <Users className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Admin Users</p>
              <p className="text-2xl font-bold text-orange-400">{adminUsers}</p>
            </div>
            <UserCheck className="text-orange-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Regular Users</p>
              <p className="text-2xl font-bold text-green-400">
                {regularUsers}
              </p>
            </div>
            <UserX className="text-green-400" size={32} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="xl:col-span-2">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="text-orange-400" size={24} />
              <h2 className="text-2xl font-bold">User Management</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      selectedUser?.id === user.id
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{user.email}</p>
                        <p className="text-sm text-gray-400">
                          {user.name || "No name"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Account: {user.accountType}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {user.role}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUser(user);
                            setNewRole(user.role as "USER" | "ADMIN");
                          }}
                          className="text-gray-400 hover:text-orange-400 transition-colors"
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-6">
          {/* Balance Top-up */}
          {selectedUser && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Wallet className="text-green-400" size={24} />
                <h3 className="text-xl font-bold">Top Up Balance</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Selected User:</p>
                  <p className="font-semibold text-white">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Enter amount"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleTopUp}
                  disabled={loading || amount <= 0}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <DollarSign size={20} />
                  <span>{loading ? "Processing..." : "Top Up Balance"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-blue-400" size={24} />
              <h3 className="text-xl font-bold">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 py-2 px-4 rounded-lg transition-colors text-left">
                <div className="flex items-center space-x-2">
                  <BarChart3 size={16} />
                  <span>View Analytics</span>
                </div>
              </button>
              <button className="w-full bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-400 py-2 px-4 rounded-lg transition-colors text-left">
                <div className="flex items-center space-x-2">
                  <Settings size={16} />
                  <span>System Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit User Role</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">User:</p>
                <p className="font-semibold">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as "USER" | "ADMIN")
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpdateUserRole(editingUser.id, newRole)}
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? "Updating..." : "Update Role"}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
