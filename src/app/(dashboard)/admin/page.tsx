"use client";
import { useState, useEffect } from "react";
import { User as PrismaUser } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Trash2,
  AlertCircle,
} from "lucide-react";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Extend Prisma User type with frontend-specific fields
type User = Pick<
  PrismaUser,
  "id" | "email" | "name" | "role" | "accountType" | "country" | "isOriginAdmin"
> & {
  balance?: number;
  kycVerification?: { status: string } | null;
  deletedAt?: Date;
};

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
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<string>(""); // Changed to string for placeholder
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
  const [pendingKycCount, setPendingKycCount] = useState(0);

  // New states for deposit type selection
  const [depositType, setDepositType] = useState<"balance" | "crypto">(
    "balance"
  );
  const [cryptoAsset, setCryptoAsset] = useState<string>("BTC");
  const [showAssetWarning, setShowAssetWarning] = useState(false);
  const [assetWarningMessage, setAssetWarningMessage] = useState("");
  const [amountInputType, setAmountInputType] = useState<"usd" | "crypto">(
    "usd"
  );

  const cryptoAssets = ["BTC", "ETH", "USDT", "SOL", "XRP"];
  const depositTypes = [
    "Bank Transfer",
    "Credit/Debit Card",
    "PayPal",
    "Wire Transfer",
  ];

  // Show popup notification
  const showPopupNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotificationMessage(message);

    // Auto-hide admin mode notification after 3 seconds
    useEffect(() => {
      if (showAdminMode) {
        const timer = setTimeout(() => {
          setShowAdminMode(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [showAdminMode]);
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
    // Fetch KYC pending count
    const fetchKycCount = async () => {
      try {
        const res = await fetch("/api/admin/kyc/list?status=PENDING");
        if (res.ok) {
          const data = await res.json();
          setPendingKycCount(data.submissions?.length || 0);
        }
      } catch (error) {
        console.error("Failed to fetch KYC count:", error);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchKycCount();
      // Also fetch deleted users count for the quick action badge
      fetchDeletedUsers();
    }
  }, [session]);

  useEffect(() => {
    // Only run in browser environment, not during build
    if (activeTab === "users" && typeof window !== "undefined") {
      fetchUsers();
    } else if (activeTab === "bin" && typeof window !== "undefined") {
      fetchDeletedUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchDeletedUsers = async () => {
    try {
      const res = await fetch("/api/admin/users/bin");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDeletedUsers(data.users);
        }
      }
    } catch (error) {
      console.error("Failed to fetch deleted users:", error);
    }
  };

  const handleTopUp = async () => {
    const amountNum = parseFloat(amount);

    if (!selectedUser || !amount || amountNum <= 0 || isNaN(amountNum)) {
      showPopupNotification(
        "Please select a user and enter a valid amount.",
        "error"
      );
      return;
    }

    // For Bitcoin crypto deposits, check if user has BTC asset
    if (depositType === "crypto" && cryptoAsset === "BTC") {
      try {
        // Fetch user's portfolio to check for BTC asset
        const portfolioRes = await fetch(
          `/api/admin/check-user-asset?userId=${selectedUser.id}&asset=BTC`
        );
        const portfolioData = await portfolioRes.json();

        if (!portfolioData.hasAsset) {
          setAssetWarningMessage(
            `⚠️ User doesn't have Bitcoin (BTC) in their portfolio yet.\n\nIf you continue, we will:\n• Create a pending deposit transaction\n• Generate transaction hash and calculate fees automatically\n• Send user a notification about incoming deposit\n• Start confirmation process (0/6 → 6/6 over 20 minutes)\n• Credit their account when confirmations complete\n\nContinue?`
          );
          setShowAssetWarning(true);
          return;
        }
      } catch (error) {
        console.error("Error checking user asset:", error);
        showPopupNotification(
          "Failed to verify user's assets. Please try again.",
          "error"
        );
        return;
      }
    }

    await processTopUp();
  };

  const processTopUp = async () => {
    const amountNum = parseFloat(amount);
    setLoading(true);
    setShowAssetWarning(false);

    try {
      // For Bitcoin payments, generate transaction hash and fee automatically
      let generatedHash = "";
      let calculatedFee = 0;

      if (
        selectedPaymentMethod.id === "crypto_bitcoin" &&
        depositType === "crypto"
      ) {
        // Generate realistic-looking Bitcoin transaction hash
        generatedHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

        // Calculate fee (typical Bitcoin fee is 0.0001 to 0.001 BTC)
        calculatedFee = 0.0001 + Math.random() * 0.0009;
      }

      // Prepare the payment details for the transaction
      const transactionData = {
        userId: selectedUser!.id,
        amount: amountNum,
        paymentMethod: selectedPaymentMethod.name,
        paymentDetails: {
          ...paymentDetails,
          transactionHash: generatedHash || paymentDetails["Transaction Hash"],
          networkFee: calculatedFee || paymentDetails["Network Fee"],
        },
        adminNote:
          notificationMessage ||
          `Manual ${
            depositType === "crypto" ? `${cryptoAsset} crypto` : "balance"
          } deposit via ${selectedPaymentMethod.name}`,
        processedBy: session?.user?.email,
        depositType,
        cryptoAsset: depositType === "crypto" ? cryptoAsset : null,
        isAdminManual: true, // Flag to indicate this is admin manual payment
      };

      const res = await fetch("/api/admin/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (res.ok) {
        const data = await res.json();
        showPopupNotification(
          `✅ Successfully initiated ${
            depositType === "crypto"
              ? `${amountNum} ${cryptoAsset}`
              : `$${amountNum}`
          } deposit for ${selectedUser!.email}.\n\n` +
            `📊 Status: PENDING\n` +
            `⏱️ Confirmations: 0/6 (≈20 minutes)\n` +
            `🔗 Hash: ${generatedHash.substring(
              0,
              16
            )}...${generatedHash.substring(48)}\n` +
            `💰 Fee: ${calculatedFee.toFixed(8)} BTC\n\n` +
            `User will receive:\n` +
            `• Email notification about incoming deposit\n` +
            `• Push notification (if enabled)\n` +
            `• Real-time confirmation updates\n` +
            `• Success notification when complete`,
          "success"
        );
        setAmount("");
        setPaymentDetails({});
        setNotificationMessage("");

        // Send immediate notification to user about incoming deposit
        await sendUserNotification(selectedUser!.id, {
          type: "deposit_pending",
          title: `Incoming ${
            depositType === "crypto" ? cryptoAsset : "USD"
          } Deposit`,
          message: `Your deposit of ${
            depositType === "crypto"
              ? `${amountNum} ${cryptoAsset}`
              : `$${amountNum}`
          } is being processed. Confirmations: 0/6 (≈20 minutes remaining)`,
          amount: amountNum,
          asset: depositType === "crypto" ? cryptoAsset : "USD",
          transactionHash: generatedHash,
          confirmations: 0,
          maxConfirmations: 6,
        });
      } else {
        const error = await res.json();
        showPopupNotification(
          `Failed to process deposit: ${error.error}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Top-up error:", error);
      showPopupNotification(
        "Failed to process deposit. Please try again.",
        "error"
      );
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
    try {
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
    } catch (error) {
      console.error("Update user role error:", error);
      showPopupNotification(
        "Failed to update user role. Please try again.",
        "error"
      );
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to move ${userEmail} to the bin?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/delete/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        showPopupNotification("User moved to bin successfully", "success");
        fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        showPopupNotification(`Failed to delete user: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showPopupNotification(
        "Failed to delete user. Please try again.",
        "error"
      );
    }
    setLoading(false);
  };

  const handleRestoreUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to restore ${userEmail}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/restore/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        showPopupNotification("User restored successfully", "success");
        fetchDeletedUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        showPopupNotification(`Failed to restore user: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Restore user error:", error);
      showPopupNotification(
        "Failed to restore user. Please try again.",
        "error"
      );
    }
    setLoading(false);
  };

  const handlePermanentDelete = async (userId: string, userEmail: string) => {
    const confirmation = prompt(
      `⚠️ PERMANENT DELETE - This action is IRREVERSIBLE!\n\n` +
        `This will completely remove the user and all their data from the database.\n` +
        `The email "${userEmail}" will be freed for reuse.\n\n` +
        `Type "DELETE FOREVER" to confirm:`
    );

    if (confirmation !== "DELETE FOREVER") {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/permanent-delete/${userId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        showPopupNotification(
          data.message || "User permanently deleted",
          "success"
        );
        fetchDeletedUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        showPopupNotification(
          `Failed to permanently delete user: ${data.error}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Permanent delete error:", error);
      showPopupNotification(
        "Failed to permanently delete user. Please try again.",
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
  const deletedUsersCount = deletedUsers.length;

  const adminTabs = [
    { id: "dashboard", name: "Dashboard", icon: <BarChart3 size={20} /> },
    { id: "users", name: "User Management", icon: <Users size={20} /> },
    { id: "bin", name: "Deleted Users", icon: <Trash2 size={20} /> },
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
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Shield className="text-green-400" size={16} />
              <div className="text-xs">
                <p className="text-green-400 font-medium">Admin Mode Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Admin Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Complete administrative dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                activeTab === tab.id
                  ? "bg-orange-500/20 border border-orange-500/50 text-orange-400"
                  : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5">{tab.icon}</div>
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-4 sm:space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2">
                <CreditCard className="text-green-400" size={20} />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => setActiveTab("payments")}
                  className="w-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 text-green-400 py-2 px-3 sm:px-4 rounded-lg transition-colors text-left text-xs sm:text-sm"
                >
                  Process Manual Payment
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 py-2 px-3 sm:px-4 rounded-lg transition-colors text-left text-xs sm:text-sm"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab("bin")}
                  className="w-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 py-2 px-3 sm:px-4 rounded-lg transition-colors text-left text-xs sm:text-sm flex items-center justify-between"
                >
                  <span>Deleted Users Bin</span>
                  {deletedUsersCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {deletedUsersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => (window.location.href = "/admin/kyc")}
                  className="w-full bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 text-orange-400 py-2 px-3 sm:px-4 rounded-lg transition-colors text-left text-xs sm:text-sm"
                >
                  KYC Verification
                </button>
                <button
                  onClick={() => router.push("/admin/analytics")}
                  className="w-full bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 text-cyan-400 py-2 px-3 sm:px-4 rounded-lg transition-colors text-left text-xs sm:text-sm flex items-center space-x-2"
                >
                  <BarChart3 size={16} />
                  <span>Analytics Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className="w-full bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-400 py-2 px-3 sm:px-4 rounded-lg transition-colors text-left text-xs sm:text-sm"
                >
                  Send Notifications
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2">
                <BarChart3 className="text-blue-400" size={20} />
                <span>System Overview</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
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

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2">
                <AlertTriangle className="text-yellow-400" size={20} />
                <span>Recent Alerts</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                {pendingKycCount > 0 && (
                  <div
                    className="text-orange-400 cursor-pointer hover:text-orange-300 transition-colors"
                    onClick={() => (window.location.href = "/admin/kyc")}
                  >
                    • Pending KYC verifications: {pendingKycCount}
                  </div>
                )}
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
        <div className="space-y-6">
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Total Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {totalUsers}
                  </p>
                </div>
                <Users className="text-blue-400" size={24} />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Admin Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-400">
                    {adminUsers}
                  </p>
                </div>
                <UserCheck className="text-orange-400" size={24} />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Regular Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {regularUsers}
                  </p>
                </div>
                <UserX className="text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Active Sessions
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-400">
                    24
                  </p>
                </div>
                <Activity className="text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="xl:col-span-2">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="text-orange-400" size={20} />
                  <h2 className="text-xl sm:text-2xl font-bold">
                    User Management
                  </h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedUser?.id === user.id
                            ? "bg-orange-500/20 border-orange-500/50"
                            : "bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm sm:text-base truncate">
                              {user.email}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400">
                              {user.name || "No name"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Account: {user.accountType}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "ADMIN"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {user.role}
                            </span>
                            {/* Hide settings and delete buttons for origin admin */}
                            {!user.isOriginAdmin && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingUser(user);
                                    setNewRole(user.role as "USER" | "ADMIN");
                                  }}
                                  className="text-gray-400 hover:text-orange-400 transition-colors"
                                  title="Edit Role"
                                >
                                  <Settings size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(
                                      user.id,
                                      user.email || "Unknown"
                                    );
                                  }}
                                  className="text-gray-400 hover:text-red-400 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
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

      {/* Bin Tab - Deleted Users */}
      {activeTab === "bin" && (
        <div className="space-y-4">
          {/* Bin Stats - Compact */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trash2 className="text-red-400" size={20} />
                <div>
                  <h2 className="text-lg font-bold">Deleted Users Bin</h2>
                  <p className="text-xs text-gray-400">
                    Restore or permanently delete users
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-2xl font-bold text-red-400">
                  {deletedUsersCount}
                </p>
              </div>
            </div>
          </div>

          {/* Deleted Users List - Compact */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            {deletedUsers.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 className="mx-auto mb-3 text-gray-600" size={36} />
                <p className="text-gray-400 text-sm">No deleted users in bin</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Role
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Type
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase">
                        Deleted At
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {deletedUsers.map((user: any) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <div>
                            <p className="font-medium text-white text-sm">
                              {user.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.name || "No name"}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "ADMIN"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-300">
                          {user.accountType}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-400">
                          {user.deletedAt
                            ? new Date(user.deletedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleRestoreUser(
                                  user.id,
                                  user.email || "Unknown"
                                )
                              }
                              disabled={loading}
                              className="text-green-400 hover:text-green-300 disabled:opacity-50"
                              title="Restore User"
                            >
                              <ArrowLeft size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handlePermanentDelete(
                                  user.id,
                                  user.email || "Unknown"
                                )
                              }
                              disabled={loading}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                              title="Delete Forever"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {deletedUsers.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="text-yellow-400 flex-shrink-0"
                    size={14}
                  />
                  <p className="text-gray-300">
                    <strong className="text-yellow-400">Note:</strong> Restore
                    moves user back to active. Delete Forever is permanent &
                    irreversible.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Deposit Types */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <CreditCard className="text-green-400" size={24} />
                <span>Available Deposit Types</span>
              </h3>
              <div className="space-y-3">
                {depositTypes.map((type) => (
                  <div
                    key={type}
                    className="p-3 rounded-lg border bg-gray-700/30 border-gray-600/30"
                  >
                    <div className="flex items-center space-x-3">
                      {type === "Bank Transfer" && (
                        <Building2 className="text-green-400" size={20} />
                      )}
                      {type === "Credit/Debit Card" && (
                        <CreditCard className="text-purple-400" size={20} />
                      )}
                      {type === "PayPal" && (
                        <Smartphone className="text-blue-500" size={20} />
                      )}
                      {type === "Wire Transfer" && (
                        <Globe className="text-red-400" size={20} />
                      )}
                      <span className="font-medium">{type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crypto Assets */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Bitcoin className="text-orange-400" size={24} />
                <span>Crypto Assets</span>
              </h3>
              <div className="space-y-3">
                {paymentMethods
                  .filter((m) => m.id.startsWith("crypto_"))
                  .map((method) => (
                    <div
                      key={method.id}
                      className="p-3 rounded-lg border bg-gray-700/30 border-gray-600/30"
                    >
                      <div className="flex items-center space-x-3">
                        {method.icon}
                        <span className="font-medium">{method.name}</span>
                      </div>
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
                <span>Manual Payment Processing</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Selected User:</p>
                    <p className="font-semibold text-white">
                      {selectedUser.email}
                    </p>
                  </div>

                  {/* Deposit Type Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Deposit Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDepositType("balance")}
                        className={`p-3 rounded-lg border transition-all ${
                          depositType === "balance"
                            ? "bg-orange-500/20 border-orange-500 text-orange-400"
                            : "bg-gray-700/50 border-gray-600/50 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <DollarSign className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs block">Available Balance</span>
                      </button>
                      <button
                        onClick={() => setDepositType("crypto")}
                        className={`p-3 rounded-lg border transition-all ${
                          depositType === "crypto"
                            ? "bg-orange-500/20 border-orange-500 text-orange-400"
                            : "bg-gray-700/50 border-gray-600/50 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        <Wallet className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs block">Crypto Asset</span>
                      </button>
                    </div>
                  </div>

                  {/* Crypto Asset Selection */}
                  {depositType === "crypto" && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Cryptocurrency
                      </label>
                      <select
                        value={cryptoAsset}
                        onChange={(e) => setCryptoAsset(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      >
                        {cryptoAssets.map((asset) => (
                          <option key={asset} value={asset}>
                            {asset}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Amount
                    </label>
                    {depositType === "crypto" && (
                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => setAmountInputType("usd")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            amountInputType === "usd"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          USD
                        </button>
                        <button
                          onClick={() => setAmountInputType("crypto")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            amountInputType === "crypto"
                              ? "bg-orange-500 text-white"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                          }`}
                        >
                          {cryptoAsset}
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder={
                        depositType === "crypto"
                          ? amountInputType === "usd"
                            ? "0.00 USD"
                            : `0.00000000 ${cryptoAsset}`
                          : "0.00 USD"
                      }
                      disabled={loading}
                    />
                    {depositType === "crypto" && amountInputType === "usd" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Equivalent crypto amount will be calculated
                        automatically
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Notification Message
                    </label>
                    <textarea
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      placeholder="Optional note for the user..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Transaction Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="capitalize">
                          {depositType === "crypto"
                            ? `Crypto Asset (${cryptoAsset})`
                            : "USD Balance"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="font-semibold">
                          {depositType === "crypto"
                            ? amountInputType === "usd"
                              ? `$${amount || "0"} USD`
                              : `${amount || "0"} ${cryptoAsset}`
                            : `$${amount || "0"} USD`}
                        </span>
                      </div>
                      {depositType === "crypto" &&
                        amount &&
                        parseFloat(amount) > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Details:</span>
                              <span className="text-green-400 text-xs">
                                Auto-generated
                              </span>
                            </div>
                          </>
                        )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">User:</span>
                        <span className="truncate max-w-[180px]">
                          {selectedUser.email}
                        </span>
                      </div>
                      {depositType === "crypto" && (
                        <div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-600">
                          <span className="text-gray-500">Status:</span>
                          <span className="text-green-400">
                            Ready to process
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      ℹ️{" "}
                      {depositType === "crypto" &&
                      selectedPaymentMethod.id === "crypto_bitcoin"
                        ? `This will create a pending Bitcoin deposit with auto-generated transaction hash and fee. User will receive notifications and see confirmation progress (1/6 → 6/6 over 20 minutes).`
                        : depositType === "crypto"
                        ? `This will add ${cryptoAsset} to the user's crypto portfolio. Network fees and transaction hash will be auto-generated.`
                        : "This will add funds to the user's available USD balance for trading immediately."}
                    </p>
                  </div>

                  <button
                    onClick={handleTopUp}
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <DollarSign size={20} />
                    <span>{loading ? "Processing..." : "Process Payment"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Asset Warning Modal */}
          {showAssetWarning && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={24} />
                  Asset Not Found
                </h3>
                <p className="text-gray-300 mb-4">{assetWarningMessage}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAssetWarning(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processTopUp}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Continue
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
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2">
              <Settings className="text-gray-400" size={20} />
              <span>System Configuration</span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">
                    Maintenance Mode
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Temporarily disable user access
                  </p>
                </div>
                <button className="bg-red-500/20 text-red-400 px-2 sm:px-3 py-1 rounded border border-red-500/30 text-xs sm:text-sm whitespace-nowrap ml-2">
                  Disabled
                </button>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">
                    Auto Backups
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Daily database backups
                  </p>
                </div>
                <button className="bg-green-500/20 text-green-400 px-2 sm:px-3 py-1 rounded border border-green-500/30 text-xs sm:text-sm whitespace-nowrap ml-2">
                  Enabled
                </button>
              </div>
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">
                    Email Notifications
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    System alerts and updates
                  </p>
                </div>
                <button className="bg-green-500/20 text-green-400 px-2 sm:px-3 py-1 rounded border border-green-500/30 text-xs sm:text-sm whitespace-nowrap ml-2">
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
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2">
              <Database className="text-green-400" size={20} />
              <span>Database Management</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-700/30 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Database Size
                  </h4>
                  <p className="text-lg sm:text-2xl font-bold text-green-400">
                    2.3 GB
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Total Records
                  </h4>
                  <p className="text-lg sm:text-2xl font-bold text-blue-400">
                    15,432
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                    Last Backup
                  </h4>
                  <p className="text-lg sm:text-2xl font-bold text-purple-400">
                    2h ago
                  </p>
                </div>
              </div>
              <div className="flex flex-row space-x-2 sm:space-x-4">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-base">
                  Create Backup
                </button>
                <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-base">
                  Optimize DB
                </button>
                <button className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-base">
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
                  user: "admin@example.com",
                  time: "2 mins ago",
                  type: "success",
                },
                {
                  action: "Balance updated",
                  user: "user@example.com",
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
