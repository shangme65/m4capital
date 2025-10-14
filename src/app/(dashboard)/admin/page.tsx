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
  CreditCard,
  Bitcoin,
  Banknote,
  Building2,
  Smartphone,
  Globe,
  Bell,
  History,
  Database,
  FileText,
  Activity,
  Mail,
  ArrowLeft,
} from "lucide-react";

type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactNode;
  fields: {
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
  }[];
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "crypto_bitcoin",
    name: "Bitcoin (BTC)",
    icon: <Bitcoin className="text-orange-400" size={20} />,
    fields: [
      {
        label: "Wallet Address",
        type: "text",
        required: true,
        placeholder: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      },
      {
        label: "Transaction Hash",
        type: "text",
        required: true,
        placeholder: "64-character hex string",
      },
      {
        label: "Network Fee",
        type: "number",
        required: false,
        placeholder: "0.0001",
      },
      {
        label: "Confirmations",
        type: "number",
        required: false,
        placeholder: "6",
      },
    ],
  },
  {
    id: "crypto_ethereum",
    name: "Ethereum (ETH)",
    icon: <Bitcoin className="text-blue-400" size={20} />,
    fields: [
      {
        label: "Wallet Address",
        type: "text",
        required: true,
        placeholder: "0x742d35Cc6632C0532925a3b8D...",
      },
      {
        label: "Transaction Hash",
        type: "text",
        required: true,
        placeholder: "0x...",
      },
      {
        label: "Gas Fee",
        type: "number",
        required: false,
        placeholder: "0.01",
      },
      {
        label: "Block Number",
        type: "number",
        required: false,
        placeholder: "18500000",
      },
    ],
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: <Building2 className="text-green-400" size={20} />,
    fields: [
      {
        label: "Bank Name",
        type: "text",
        required: true,
        placeholder: "JPMorgan Chase",
      },
      {
        label: "Account Number",
        type: "text",
        required: true,
        placeholder: "****1234",
      },
      {
        label: "Routing Number",
        type: "text",
        required: false,
        placeholder: "021000021",
      },
      {
        label: "Reference Number",
        type: "text",
        required: true,
        placeholder: "REF123456789",
      },
      {
        label: "Processing Time",
        type: "text",
        required: false,
        placeholder: "1-3 business days",
      },
    ],
  },
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    icon: <CreditCard className="text-purple-400" size={20} />,
    fields: [
      {
        label: "Card Last 4 Digits",
        type: "text",
        required: true,
        placeholder: "****1234",
      },
      {
        label: "Card Type",
        type: "text",
        required: true,
        placeholder: "Visa, MasterCard, etc.",
      },
      {
        label: "Authorization Code",
        type: "text",
        required: true,
        placeholder: "AUTH123456",
      },
      {
        label: "Processor",
        type: "text",
        required: false,
        placeholder: "Stripe, PayPal",
      },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: <Smartphone className="text-blue-500" size={20} />,
    fields: [
      {
        label: "PayPal Email",
        type: "email",
        required: true,
        placeholder: "user@example.com",
      },
      {
        label: "Transaction ID",
        type: "text",
        required: true,
        placeholder: "4X123456A7890123B",
      },
      {
        label: "PayPal Fee",
        type: "number",
        required: false,
        placeholder: "2.9",
      },
      {
        label: "Exchange Rate",
        type: "number",
        required: false,
        placeholder: "1.0",
      },
    ],
  },
  {
    id: "wire_transfer",
    name: "Wire Transfer",
    icon: <Globe className="text-red-400" size={20} />,
    fields: [
      {
        label: "SWIFT Code",
        type: "text",
        required: true,
        placeholder: "CHASUS33",
      },
      {
        label: "Beneficiary Bank",
        type: "text",
        required: true,
        placeholder: "Bank Name",
      },
      {
        label: "Wire Reference",
        type: "text",
        required: true,
        placeholder: "WIRE123456789",
      },
      {
        label: "Intermediary Bank",
        type: "text",
        required: false,
        placeholder: "Optional",
      },
      {
        label: "Wire Fee",
        type: "number",
        required: false,
        placeholder: "25.00",
      },
    ],
  },
];

const AdminDashboard = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">("USER");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(paymentMethods[0]);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>(
    {}
  );
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<"success" | "error">(
    "success"
  );
  const [showAdminMode, setShowAdminMode] = useState(true);

  // Show popup notification
  const showPopupNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000); // Hide after 3 seconds
  };

  // Auto-hide admin mode notification after 5 seconds
  useEffect(() => {
    if (session?.user?.role === "ADMIN" && showAdminMode) {
      const timer = setTimeout(() => {
        setShowAdminMode(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [session, showAdminMode]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const handleTopUp = async () => {
    if (!selectedUser || amount <= 0) {
      showPopupNotification(
        "Please select a user and enter a valid amount.",
        "error"
      );
      return;
    }

    setLoading(true);

    // Prepare the payment details for the transaction
    const transactionData = {
      userId: selectedUser.id,
      amount,
      paymentMethod: selectedPaymentMethod.name,
      paymentDetails,
      adminNote:
        notificationMessage ||
        `Manual top-up via ${selectedPaymentMethod.name}`,
      processedBy: session?.user?.email,
    };

    const res = await fetch("/api/admin/top-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });

    if (res.ok) {
      showPopupNotification(
        `Successfully topped up ${selectedUser.email} with $${amount} via ${selectedPaymentMethod.name}.`,
        "success"
      );
      setAmount(0);
      setPaymentDetails({});
      setNotificationMessage("");

      // Send notification to user
      await sendUserNotification(selectedUser.id, {
        type: "balance_update",
        title: "Balance Updated",
        message: `Your account has been credited with $${amount} via ${selectedPaymentMethod.name}`,
        amount,
        paymentMethod: selectedPaymentMethod.name,
      });
    } else {
      const error = await res.json();
      showPopupNotification(`Failed to top up: ${error.error}`, "error");
    }
    setLoading(false);
  };

  const sendUserNotification = async (userId: string, notification: any) => {
    try {
      await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, notification }),
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
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
      showPopupNotification(
        `User role updated successfully to ${newRole}`,
        "success"
      );
      fetchUsers();
      setEditingUser(null);
    } else {
      const error = await res.json();
      showPopupNotification(
        `Failed to update user role: ${error.error}`,
        "error"
      );
    }
    setLoading(false);
  };

  const handlePaymentDetailChange = (field: string, value: string) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const regularUsers = users.filter((user) => user.role === "USER").length;

  const adminTabs = [
    { id: "dashboard", name: "Dashboard", icon: <BarChart3 size={20} /> },
    { id: "users", name: "User Management", icon: <Users size={20} /> },
    { id: "payments", name: "Manual Payments", icon: <CreditCard size={20} /> },
    { id: "notifications", name: "Notifications", icon: <Bell size={20} /> },
    {
      id: "transactions",
      name: "Transaction History",
      icon: <History size={20} />,
    },
    { id: "analytics", name: "Analytics", icon: <TrendingUp size={20} /> },
    { id: "system", name: "System Settings", icon: <Settings size={20} /> },
    { id: "reports", name: "Reports", icon: <FileText size={20} /> },
    { id: "database", name: "Database", icon: <Database size={20} /> },
    { id: "activity", name: "Activity Logs", icon: <Activity size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      {/* Popup Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`p-4 rounded-lg border shadow-lg ${
              notificationType === "success"
                ? "bg-green-900/90 border-green-500/50 text-green-400"
                : "bg-red-900/90 border-red-500/50 text-red-400"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notificationType === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <AlertTriangle size={20} />
              )}
              <p>{notificationMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Move logged in notification to popup */}
      {session?.user?.role === "ADMIN" && showAdminMode && (
        <div className="fixed top-4 right-4 z-40 animate-slide-in">
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Shield className="text-orange-400" size={16} />
              <div className="text-xs">
                <p className="text-orange-400 font-medium">Admin Mode Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-gray-400">Complete administrative dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500/20 border border-orange-500/50 text-orange-400"
                  : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <CreditCard className="text-green-400" size={24} />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab("payments")}
                  className="w-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-400 py-2 px-4 rounded-lg transition-colors text-left"
                >
                  Process Manual Payment
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 py-2 px-4 rounded-lg transition-colors text-left"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className="w-full bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-400 py-2 px-4 rounded-lg transition-colors text-left"
                >
                  Send Notifications
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <BarChart3 className="text-blue-400" size={24} />
                <span>System Overview</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Status:</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Database:</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Backup:</span>
                  <span className="text-gray-300">2 hours ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Transactions:</span>
                  <span className="text-gray-300">1,247</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <AlertTriangle className="text-yellow-400" size={24} />
                <span>Recent Alerts</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-yellow-400">
                  • High volume deposits detected
                </div>
                <div className="text-red-400">• Failed login attempts: 3</div>
                <div className="text-blue-400">• New user registrations: 5</div>
                <div className="text-green-400">• System backup completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-8">
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <p className="text-2xl font-bold text-orange-400">
                    {adminUsers}
                  </p>
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

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Sessions</p>
                  <p className="text-2xl font-bold text-purple-400">24</p>
                </div>
                <Activity className="text-purple-400" size={32} />
              </div>
            </div>
          </div>

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

          {/* User Actions */}
          <div className="space-y-6">
            {selectedUser && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <UserCheck className="text-blue-400" size={24} />
                  <h3 className="text-xl font-bold">User Actions</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Selected User:</p>
                  <p className="font-semibold text-white">
                    {selectedUser.email}
                  </p>
                  <button
                    onClick={() => setActiveTab("payments")}
                    className="w-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-400 py-2 px-4 rounded-lg transition-colors"
                  >
                    Process Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method Selection */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <CreditCard className="text-green-400" size={24} />
                <span>Payment Method</span>
              </h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPaymentMethod.id === method.id
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {method.icon}
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <FileText className="text-blue-400" size={24} />
                <span>Payment Details</span>
              </h3>
              <div className="space-y-4">
                {selectedPaymentMethod.fields.map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm text-gray-400 mb-2">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    <input
                      type={field.type}
                      value={paymentDetails[field.label] || ""}
                      onChange={(e) =>
                        handlePaymentDetailChange(field.label, e.target.value)
                      }
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Top-up Section */}
          {selectedUser && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Wallet className="text-green-400" size={24} />
                <span>Manual Balance Top-up</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Notification Message
                    </label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder="Message to send to user..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Transaction Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Method:</span>
                        <span>{selectedPaymentMethod.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span>${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">User:</span>
                        <span>{selectedUser.email}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleTopUp}
                    disabled={loading || amount <= 0}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <DollarSign size={20} />
                    <span>{loading ? "Processing..." : "Process Payment"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <BarChart3 className="text-blue-400" />
              <span>Platform Analytics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">
                  User Growth
                </h4>
                <p className="text-3xl font-bold text-white">+24%</p>
                <p className="text-sm text-gray-400">This month</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-400 mb-2">
                  Trading Volume
                </h4>
                <p className="text-3xl font-bold text-white">$2.4M</p>
                <p className="text-sm text-gray-400">Last 30 days</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">
                  Revenue
                </h4>
                <p className="text-3xl font-bold text-white">$48.2K</p>
                <p className="text-sm text-gray-400">Monthly</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Settings className="text-gray-400" />
              <span>System Configuration</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-gray-400">
                    Temporarily disable user access
                  </p>
                </div>
                <button className="bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30">
                  Disabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium">Auto Backups</p>
                  <p className="text-sm text-gray-400">
                    Daily database backups
                  </p>
                </div>
                <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded border border-green-500/30">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-400">
                    System alerts and updates
                  </p>
                </div>
                <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded border border-green-500/30">
                  Enabled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <FileText className="text-blue-400" />
              <span>System Reports</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <DollarSign className="text-green-400" size={24} />
                  <div>
                    <p className="font-medium">Financial Report</p>
                    <p className="text-sm text-gray-400">
                      Revenue and transactions
                    </p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <Users className="text-blue-400" size={24} />
                  <div>
                    <p className="font-medium">User Activity</p>
                    <p className="text-sm text-gray-400">
                      Login and engagement
                    </p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <Shield className="text-orange-400" size={24} />
                  <div>
                    <p className="font-medium">Security Audit</p>
                    <p className="text-sm text-gray-400">
                      Access logs and alerts
                    </p>
                  </div>
                </div>
              </button>
              <button className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-purple-400" size={24} />
                  <div>
                    <p className="font-medium">Performance</p>
                    <p className="text-sm text-gray-400">System metrics</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === "database" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Database className="text-green-400" />
              <span>Database Management</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Database Size</h4>
                  <p className="text-2xl font-bold text-green-400">2.3 GB</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Total Records</h4>
                  <p className="text-2xl font-bold text-blue-400">15,432</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Last Backup</h4>
                  <p className="text-2xl font-bold text-purple-400">2h ago</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Create Backup
                </button>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Optimize DB
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Clear Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Activity className="text-yellow-400" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3">
              {[
                {
                  action: "User login",
                  user: "admin@m4capital.com",
                  time: "2 mins ago",
                  type: "success",
                },
                {
                  action: "Balance updated",
                  user: "user@m4capital.com",
                  time: "5 mins ago",
                  type: "info",
                },
                {
                  action: "User registration",
                  user: "newuser@email.com",
                  time: "10 mins ago",
                  type: "success",
                },
                {
                  action: "Failed login attempt",
                  user: "unknown@email.com",
                  time: "15 mins ago",
                  type: "warning",
                },
                {
                  action: "System backup",
                  user: "system",
                  time: "2 hours ago",
                  type: "info",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        log.type === "success"
                          ? "bg-green-400"
                          : log.type === "warning"
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-400">{log.user}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Bell className="text-yellow-400" />
              <span>Send Notifications</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notification Type
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipients
                </label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white">
                  <option value="all">All Users</option>
                  <option value="admins">Admin Users Only</option>
                  <option value="users">Regular Users Only</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white h-24 resize-none"
                  placeholder="Enter notification message..."
                />
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

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
