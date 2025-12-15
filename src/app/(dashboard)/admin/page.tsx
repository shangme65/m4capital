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
  Check,
  CheckCircle,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import {
  getCurrencySymbol,
  convertCurrency,
  getExchangeRates,
} from "@/lib/currencies";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  assignedStaffId?: string | null;
  preferredCurrency?: string;
};

type StaffAdmin = {
  id: string;
  name: string | null;
  email: string;
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
  {
    id: "pix",
    name: "PIX (Brazil)",
    icon: <Banknote className="text-green-500" size={20} />,
    fields: [
      {
        label: "PIX Key Type",
        type: "text",
        required: true,
        placeholder: "CPF, CNPJ, Email, Phone, or Random",
      },
      {
        label: "PIX Key",
        type: "text",
        required: true,
        placeholder: "123.456.789-00 or email@example.com",
      },
      {
        label: "Transaction ID (TxID)",
        type: "text",
        required: true,
        placeholder: "E123456789202301011200000000000",
      },
      {
        label: "Payer Name",
        type: "text",
        required: true,
        placeholder: "Nome do Pagador",
      },
      {
        label: "Payer Document",
        type: "text",
        required: false,
        placeholder: "CPF/CNPJ do Pagador",
      },
      {
        label: "End to End ID (E2E)",
        type: "text",
        required: false,
        placeholder: "E12345678202301011200Ab1C2d3E4",
      },
    ],
  },
];

// Transaction History Component
const TransactionHistoryView = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTrades: 0,
    manualTransactions: 0,
  });
  const [filter, setFilter] = useState<
    "all" | "deposit" | "withdraw" | "buy" | "sell"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/all-transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
      setStats(
        data.stats || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalTrades: 0,
          manualTransactions: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || tx.type === filter;
    const matchesSearch =
      tx.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.asset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.method?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "withdraw":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "buy":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "sell":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs text-green-400 mb-1">Total Deposits</p>
          <p className="text-xl font-bold text-green-400">
            {stats.totalDeposits}
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-400 mb-1">Total Withdrawals</p>
          <p className="text-xl font-bold text-red-400">
            {stats.totalWithdrawals}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-400 mb-1">Total Trades</p>
          <p className="text-xl font-bold text-blue-400">{stats.totalTrades}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <p className="text-xs text-purple-400 mb-1">Manual Payments</p>
          <p className="text-xl font-bold text-purple-400">
            {stats.manualTransactions}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by user name, email, asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <div className="flex gap-2 overflow-x-auto">
            {["all", "deposit", "withdraw", "buy", "sell"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filter === type
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50 border-b border-gray-600">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-gray-300">
                    Date
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-300">
                    User
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-300">
                    Type
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-300">
                    Asset
                  </th>
                  <th className="text-right p-3 text-xs font-semibold text-gray-300">
                    Amount
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-300">
                    Method
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr
                    key={tx.id || index}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 text-xs text-gray-400">
                      {new Date(tx.timestamp).toLocaleDateString()}
                      <br />
                      <span className="text-[10px]">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-xs">
                        <p className="font-semibold text-white">
                          {tx.userName || "Unknown"}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {tx.userEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[10px] font-medium border ${getTypeColor(
                          tx.type
                        )}`}
                      >
                        {tx.type.toUpperCase()}
                        {tx.isManual && <span className="ml-1">🔧</span>}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-semibold text-white">
                      {tx.asset}
                    </td>
                    <td className="p-3 text-right">
                      <p className="text-xs font-bold text-white">
                        {tx.amount.toFixed(8)}
                      </p>
                      {tx.fee > 0 && (
                        <p className="text-[10px] text-gray-500">
                          Fee: {tx.fee.toFixed(8)}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-400">{tx.method}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-xs font-semibold ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {tx.status?.toUpperCase() || "N/A"}
                      </span>
                      {tx.confirmations !== undefined &&
                        tx.status === "pending" && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            {tx.confirmations}/{tx.maxConfirmations}
                          </p>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction Count */}
      <div className="text-center text-sm text-gray-400">
        Showing {filteredTransactions.length} of {transactions.length}{" "}
        transactions
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    convertAmount,
    formatAmount,
    exchangeRates,
    preferredCurrency: adminCurrency,
  } = useCurrency();
  const [users, setUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<string>(""); // Changed to string for placeholder
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"USER" | "ADMIN" | "STAFF_ADMIN">(
    "USER"
  );
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
  const [staffAdmins, setStaffAdmins] = useState<StaffAdmin[]>([]);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUserStatsModal, setShowUserStatsModal] = useState<
    "total" | "admin" | "staff" | "regular" | "sessions" | null
  >(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [databaseStats, setDatabaseStats] = useState({
    size: "Loading...",
    totalRecords: 0,
    lastBackup: "Loading...",
  });

  // New states for deposit type selection
  const [depositType, setDepositType] = useState<"fiat" | "crypto">("fiat");
  const [paymentMethodType, setPaymentMethodType] = useState<
    "traditional" | "crypto"
  >("traditional");
  const [cryptoAsset, setCryptoAsset] = useState<string>("BTC");
  const [showAssetWarning, setShowAssetWarning] = useState(false);
  const [assetWarningMessage, setAssetWarningMessage] = useState("");
  const [amountInputType, setAmountInputType] = useState<"usd" | "crypto">(
    "usd"
  );
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    amount: string;
    currency: string;
    userEmail: string;
    transactionHash?: string;
    type: string;
  } | null>(null);

  // System stats state
  const [systemStats, setSystemStats] = useState({
    serverStatus: "Online",
    databaseStatus: "Connected",
    lastBackup: "Loading...",
    totalTransactions: 0,
    activeUsers: 0,
    recentDeposits: 0,
    failedLogins: 0,
    newRegistrations: 0,
  });

  const cryptoAssets = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "XRP", name: "Ripple" },
    { symbol: "TRX", name: "Tron" },
    { symbol: "TON", name: "Toncoin" },
    { symbol: "LTC", name: "Litecoin" },
    { symbol: "BCH", name: "Bitcoin Cash" },
    { symbol: "ETC", name: "Ethereum Classic" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "USDT", name: "Tether" },
  ];

  const cryptoPaymentMethods = cryptoAssets.map((asset) => ({
    id: asset.symbol.toLowerCase(),
    name: asset.symbol,
    fullName: asset.name,
  }));

  const prices = useCryptoPrices(cryptoAssets.map((asset) => asset.symbol)); // Add crypto prices hook

  const traditionalPaymentMethods = [
    { id: "pix", name: "PIX", icon: "🇧🇷" },
    { id: "bank_transfer", name: "Bank Transfer", icon: "🏦" },
    { id: "credit_card", name: "Credit/Debit Card", icon: "💳" },
    { id: "paypal", name: "PayPal", icon: "💰" },
    { id: "wire_transfer", name: "Wire Transfer", icon: "📤" },
  ];

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

  // Fetch activity logs on mount and when modal opens
  useEffect(() => {
    if (showActivityModal) {
      const fetchActivityLogs = async () => {
        try {
          const response = await fetch("/api/admin/activity-logs");
          const data = await response.json();
          setActivityLogs(data.activities || []);
        } catch (error) {
          console.error("Error fetching activity logs:", error);
        }
      };

      fetchActivityLogs();
      // Refresh every 10 seconds for real-time updates
      const interval = setInterval(fetchActivityLogs, 10000);
      return () => clearInterval(interval);
    }
  }, [showActivityModal]);

  // Handle browser/mobile back button to close modals
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (showPaymentModal) {
        e.preventDefault();
        setShowPaymentModal(false);
        setSelectedUser(null);
      } else if (showActivityModal) {
        e.preventDefault();
        setShowActivityModal(false);
      } else if (showDatabaseModal) {
        e.preventDefault();
        setShowDatabaseModal(false);
      } else if (showUserStatsModal) {
        e.preventDefault();
        setShowUserStatsModal(null);
      }
    };

    // Add state to history when modal opens
    if (
      showPaymentModal ||
      showActivityModal ||
      showDatabaseModal ||
      showUserStatsModal
    ) {
      window.history.pushState({ modalOpen: true }, "");
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    showPaymentModal,
    showActivityModal,
    showDatabaseModal,
    showUserStatsModal,
  ]);

  // Fetch database stats on mount and when modal opens
  useEffect(() => {
    if (showDatabaseModal) {
      const fetchDatabaseStats = async () => {
        try {
          const response = await fetch("/api/admin/database-stats");
          const data = await response.json();
          setDatabaseStats({
            size: data.size || "0 KB",
            totalRecords: data.totalRecords || 0,
            lastBackup: data.lastBackup || "Not available",
          });
        } catch (error) {
          console.error("Error fetching database stats:", error);
        }
      };

      fetchDatabaseStats();
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchDatabaseStats, 30000);
      return () => clearInterval(interval);
    }
  }, [showDatabaseModal]);

  // Handle back button for mobile (closes modals)
  useEffect(() => {
    const handlePopState = () => {
      if (showPaymentModal) {
        setShowPaymentModal(false);
        setSelectedUser(null);
      } else if (editingUser) {
        setEditingUser(null);
      } else if (showAssetWarning) {
        setShowAssetWarning(false);
      } else if (showUserStatsModal) {
        setShowUserStatsModal(null);
      } else if (showActivityModal) {
        setShowActivityModal(false);
      } else if (showDatabaseModal) {
        setShowDatabaseModal(false);
      }
    };

    // Push state when modal opens
    if (
      showPaymentModal ||
      editingUser ||
      showAssetWarning ||
      showUserStatsModal ||
      showActivityModal ||
      showDatabaseModal
    ) {
      window.history.pushState({ modal: true }, "");
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    showPaymentModal,
    editingUser,
    showAssetWarning,
    showUserStatsModal,
    showActivityModal,
    showDatabaseModal,
  ]);

  // Auto-hide admin mode notification after 2 seconds
  useEffect(() => {
    if (session?.user?.role === "ADMIN" && showAdminMode) {
      const timer = setTimeout(() => {
        setShowAdminMode(false);
      }, 2000); // Hide after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [session, showAdminMode]);

  const fetchSystemStats = async () => {
    try {
      const res = await fetch("/api/admin/system-stats");
      if (res.ok) {
        const data = await res.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
    }
  };

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
      fetchSystemStats();
      // Also fetch deleted users count for the quick action badge
      fetchDeletedUsers();

      // Refresh stats every 30 seconds
      const interval = setInterval(() => {
        fetchSystemStats();
        fetchKycCount();
      }, 30000);

      return () => clearInterval(interval);
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
        // Also update staff admins list
        const staffList = data
          .filter((u: User) => u.role === "STAFF_ADMIN")
          .map((u: User) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          }));
        setStaffAdmins(staffList);
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

  const fetchStaffAdmins = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        const staffList = data
          .filter((u: User) => u.role === "STAFF_ADMIN")
          .map((u: User) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          }));
        setStaffAdmins(staffList);
      }
    } catch (error) {
      console.error("Failed to fetch staff admins:", error);
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
      // Determine the payment method name based on deposit type
      let paymentMethodName = "";
      if (depositType === "crypto") {
        paymentMethodName = `${cryptoAsset} Cryptocurrency`;
      } else if (depositType === "fiat") {
        if (paymentMethodType === "crypto") {
          paymentMethodName = `${cryptoAsset} (Convert to Fiat)`;
        } else {
          paymentMethodName = "Traditional Payment";
        }
      }

      // For crypto payments, generate transaction hash and fee automatically
      let generatedHash = "";
      let calculatedFee = 0;

      if (
        depositType === "crypto" ||
        (depositType === "fiat" && paymentMethodType === "crypto")
      ) {
        // Generate realistic-looking transaction hash based on crypto type
        generatedHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

        // Calculate fee based on crypto type
        if (cryptoAsset === "BTC") {
          calculatedFee = 0.0001 + Math.random() * 0.0009; // Bitcoin fee
        } else if (cryptoAsset === "ETH") {
          calculatedFee = 0.001 + Math.random() * 0.005; // Ethereum fee
        } else {
          calculatedFee = 0.00001 + Math.random() * 0.0001; // Other crypto fees
        }
      }

      // Calculate the actual amount based on input type
      let finalAmount = amountNum;
      let cryptoAmount = 0;
      let amountInUserCurrency = amountNum;

      if (
        amountInputType === "crypto" &&
        (depositType === "crypto" || paymentMethodType === "crypto")
      ) {
        // User entered crypto amount, calculate fiat value
        const cryptoPrice = prices[cryptoAsset]?.price || 0;
        if (cryptoPrice > 0) {
          finalAmount = amountNum * cryptoPrice; // Convert to USD
          cryptoAmount = amountNum;
          // Convert from USD to user's preferred currency
          amountInUserCurrency = convertCurrency(
            finalAmount,
            selectedUser?.preferredCurrency || "USD",
            exchangeRates
          );
        }
      } else if (amountInputType === "usd" && depositType === "crypto") {
        // Crypto deposit: User entered fiat amount, convert to crypto
        const cryptoPrice = prices[cryptoAsset]?.price || 0;
        if (cryptoPrice > 0) {
          // First convert admin currency to USD
          const amountInUSD = convertAmount(amountNum, true);
          cryptoAmount = amountInUSD / cryptoPrice; // Convert USD to crypto
          finalAmount = amountInUSD;
          // Convert from USD to user's preferred currency
          amountInUserCurrency = convertCurrency(
            finalAmount,
            selectedUser?.preferredCurrency || "USD",
            exchangeRates
          );
        } else {
          // If crypto price is not available, show error
          showPopupNotification(
            `Failed to get ${cryptoAsset} price. Please try again.`,
            "error"
          );
          setLoading(false);
          return;
        }
      } else if (depositType === "fiat" && amountInputType === "usd") {
        // Fiat deposit: the admin enters the amount directly in user's preferred currency
        // No conversion needed - the input IS the amount in user's currency
        amountInUserCurrency = Math.round(amountNum * 100) / 100;
        // Convert to USD for backend reference (finalAmount)
        const userCurrency = selectedUser?.preferredCurrency || "USD";
        if (userCurrency === "USD") {
          finalAmount = amountNum;
        } else {
          // Convert from user's currency to USD for reference
          const rate = exchangeRates[userCurrency] || 1;
          finalAmount = amountNum / rate;
        }
      }

      // Prepare the payment details for the transaction
      const cryptoPriceUSD = prices[cryptoAsset]?.price || 0;
      const transactionData = {
        userId: selectedUser!.id,
        amount:
          depositType === "crypto"
            ? cryptoAmount > 0
              ? cryptoAmount
              : amountNum
            : amountInUserCurrency,
        // For crypto deposits, fiatAmount should be USD value for proper conversion in history
        // For fiat deposits, fiatAmount is in user's currency
        fiatAmount:
          depositType === "crypto" ? finalAmount : amountInUserCurrency,
        // For crypto deposits, also send the user's currency value for display
        fiatAmountUserCurrency:
          depositType === "crypto" ? amountInUserCurrency : undefined,
        cryptoAmount: cryptoAmount > 0 ? cryptoAmount : undefined,
        cryptoPrice: depositType === "crypto" ? cryptoPriceUSD : undefined, // Send current crypto price
        paymentMethod: paymentMethodName,
        paymentDetails: {
          transactionHash: generatedHash || undefined,
          networkFee: calculatedFee || undefined,
        },
        adminNote:
          notificationMessage ||
          `Manual ${
            depositType === "crypto" ? `${cryptoAsset} crypto` : "balance"
          } deposit via ${paymentMethodName}`,
        processedBy: session?.user?.email,
        depositType,
        cryptoAsset:
          depositType === "crypto" || paymentMethodType === "crypto"
            ? cryptoAsset
            : null,
        isAdminManual: true, // Flag to indicate this is admin manual payment
        preferredCurrency: selectedUser?.preferredCurrency || "USD",
        adminCurrency: adminCurrency || "USD",
        adminInputAmount: amountNum,
      };

      console.log("Transaction Data:", transactionData);
      console.log("Crypto Amount:", cryptoAmount);
      console.log("Final Amount:", finalAmount);
      console.log("Amount in User Currency:", amountInUserCurrency);

      const res = await fetch("/api/admin/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (res.ok) {
        const data = await res.json();
        const currencySymbol = getCurrencySymbol(adminCurrency || "USD");
        const userCurrencySymbol = getCurrencySymbol(
          selectedUser?.preferredCurrency || "USD"
        );

        // Set success modal data
        const userCurr = selectedUser?.preferredCurrency || "USD";
        setSuccessDetails({
          amount:
            depositType === "crypto"
              ? `${cryptoAmount.toFixed(8)} ${cryptoAsset}`
              : `${getCurrencySymbol(userCurr)}${amountInUserCurrency.toFixed(
                  2
                )}`,
          currency: depositType === "crypto" ? cryptoAsset : userCurr,
          userEmail: selectedUser!.email || "",
          transactionHash: generatedHash,
          type: depositType === "crypto" ? "Crypto Deposit" : "Fiat Deposit",
        });
        setShowSuccessModal(true);

        // Refresh user data to show updated balance and transaction history
        fetchUsers();

        // Clear form
        setAmount("");
        setPaymentDetails({});
        setNotificationMessage("");
        setSelectedUser(null);

        // Send immediate notification to user about incoming deposit
        if (generatedHash) {
          await sendUserNotification(selectedUser!.id, {
            type: "deposit_pending",
            title: `Incoming ${
              depositType === "crypto"
                ? cryptoAsset
                : selectedUser?.preferredCurrency || "USD"
            } Deposit`,
            message: `Your deposit of ${
              depositType === "crypto"
                ? `${cryptoAmount.toFixed(8)} ${cryptoAsset}`
                : `${userCurrencySymbol}${amountInUserCurrency.toFixed(2)}`
            } is being processed. Confirmations: 0/6 (≈20 minutes remaining)`,
            amount:
              depositType === "crypto" ? cryptoAmount : amountInUserCurrency,
            asset:
              depositType === "crypto"
                ? cryptoAsset
                : selectedUser?.preferredCurrency || "USD",
            transactionHash: generatedHash,
            confirmations: 0,
            maxConfirmations: 6,
          });
        }
      } else {
        const error = await res.json();
        console.error("API Error Response:", error);
        showPopupNotification(
          `Failed to process deposit: ${error.error || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Top-up error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showPopupNotification(
        `Failed to process deposit: ${errorMessage}`,
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
    newRole: "USER" | "ADMIN" | "STAFF_ADMIN"
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        const data = await res.json();
        showPopupNotification(
          `✅ User role updated to ${newRole}.\n\n🔄 The user's session will automatically refresh within 5 seconds. They will see their new role without needing to log out.`,
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

  const handleAssignStaff = async (
    userId: string,
    staffAdminId: string | null
  ) => {
    setAssigningStaff(true);
    try {
      const res = await fetch("/api/admin/assign-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, staffAdminId }),
      });

      const data = await res.json();

      if (data.success) {
        showPopupNotification(
          staffAdminId
            ? `✅ User assigned to staff admin successfully`
            : `✅ User unassigned from staff admin`,
          "success"
        );
        fetchUsers();
        // Update selected user
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) =>
            prev ? { ...prev, assignedStaffId: staffAdminId } : null
          );
        }
      } else {
        showPopupNotification(`Failed to assign user: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Assign staff error:", error);
      showPopupNotification("Failed to assign user to staff admin", "error");
    }
    setAssigningStaff(false);
  };

  const handlePaymentDetailChange = (field: string, value: string) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const staffAdminUsers = users.filter(
    (user) => user.role === "STAFF_ADMIN"
  ).length;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-3 py-4 sm:p-6">
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
      <div className="mb-2 xs:mb-3 sm:mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div>
              <h1 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-[10px] xs:text-xs text-gray-400">
                Complete administrative dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-3 sm:space-y-8">
          {/* Quick Actions - 3D Crypto Card Style */}
          <div className="bg-gray-800/50 rounded-2xl p-3 border border-gray-700/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <div className="space-y-2.5">
              {/* Process Manual Payment */}
              <button
                onClick={() => {
                  setShowPaymentModal(true);
                  fetchUsers();
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
                  <div className="flex flex-col">
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
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Manage Users
                    </span>
                    <span className="text-gray-400 text-xs">
                      View and edit user accounts
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

              {/* Deleted Users Bin */}
              <button
                onClick={() => setActiveTab("bin")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(239,68,68,0.25),0_0_30px_rgba(239,68,68,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #ef444440, 0 2px 8px #ef444460, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Trash2
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Deleted Users Bin
                    </span>
                    <span className="text-gray-400 text-xs">
                      Restore or permanently delete
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deletedUsersCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold shadow-lg">
                      {deletedUsersCount}
                    </span>
                  )}
                  <div className="text-red-400">
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
                </div>
              </button>

              {/* KYC Verification */}
              <button
                onClick={() => (window.location.href = "/admin/kyc")}
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
                    <Shield
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      KYC Verification
                    </span>
                    <span className="text-gray-400 text-xs">
                      Review identity documents
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pendingKycCount > 0 && (
                    <span className="bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs font-bold shadow-lg">
                      {pendingKycCount}
                    </span>
                  )}
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
                </div>
              </button>

              {/* Analytics Dashboard */}
              <button
                onClick={() => router.push("/admin/analytics")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.25),0_0_30px_rgba(6,182,212,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #06b6d440, 0 2px 8px #06b6d460, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <BarChart3
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Analytics Dashboard
                    </span>
                    <span className="text-gray-400 text-xs">
                      View platform statistics
                    </span>
                  </div>
                </div>
                <div className="text-cyan-400">
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

              {/* Send Notifications */}
              <button
                onClick={() => setActiveTab("notifications")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.25),0_0_30px_rgba(168,85,247,0.4)]"
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
                        "0 4px 16px #a855f740, 0 2px 8px #a855f760, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Bell
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Send Notifications
                    </span>
                    <span className="text-gray-400 text-xs">
                      Broadcast to users
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
              </button>

              {/* Transaction History */}
              <button
                onClick={() => setActiveTab("transactions")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.25),0_0_30px_rgba(99,102,241,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #6366f140, 0 2px 8px #6366f160, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <History
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Transaction History
                    </span>
                    <span className="text-gray-400 text-xs">
                      View all transactions
                    </span>
                  </div>
                </div>
                <div className="text-indigo-400">
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

              {/* System Settings */}
              <button
                onClick={() => setActiveTab("system")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(107,114,128,0.25),0_0_30px_rgba(107,114,128,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #6b728040, 0 2px 8px #6b728060, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Settings
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      System Settings
                    </span>
                    <span className="text-gray-400 text-xs">
                      Configure platform
                    </span>
                  </div>
                </div>
                <div className="text-gray-400">
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

              {/* Reports */}
              <button
                onClick={() => setActiveTab("reports")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(234,179,8,0.25),0_0_30px_rgba(234,179,8,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #eab30840, 0 2px 8px #eab30860, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <FileText
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Reports
                    </span>
                    <span className="text-gray-400 text-xs">
                      Generate reports
                    </span>
                  </div>
                </div>
                <div className="text-yellow-400">
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

              {/* Database */}
              <button
                onClick={() => setShowDatabaseModal(true)}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(236,72,153,0.25),0_0_30px_rgba(236,72,153,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #ec489940, 0 2px 8px #ec489960, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Database
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Database
                    </span>
                    <span className="text-gray-400 text-xs">
                      Manage database
                    </span>
                  </div>
                </div>
                <div className="text-pink-400">
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

              {/* Activity Logs */}
              <button
                onClick={() => setShowActivityModal(true)}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(20,184,166,0.25),0_0_30px_rgba(20,184,166,0.4)]"
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
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #14b8a640, 0 2px 8px #14b8a660, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Activity
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">
                      Activity Logs
                    </span>
                    <span className="text-gray-400 text-xs">
                      View system activity
                    </span>
                  </div>
                </div>
                <div className="text-teal-400">
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2">
                <BarChart3 className="text-blue-400" size={20} />
                <span>System Overview</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Status:</span>
                  <span className="text-green-400">
                    {systemStats.serverStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Database:</span>
                  <span className="text-green-400">
                    {systemStats.databaseStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Backup:</span>
                  <span className="text-gray-300">
                    {systemStats.lastBackup}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Transactions:</span>
                  <span className="text-gray-300">
                    {systemStats.totalTransactions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Users:</span>
                  <span className="text-gray-300">
                    {systemStats.activeUsers}
                  </span>
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
                {systemStats.recentDeposits > 0 && (
                  <div className="text-yellow-400">
                    • Recent deposits: {systemStats.recentDeposits} (last hour)
                  </div>
                )}
                {systemStats.failedLogins > 0 && (
                  <div className="text-red-400">
                    • Failed login attempts: {systemStats.failedLogins}
                  </div>
                )}
                {systemStats.newRegistrations > 0 && (
                  <div className="text-blue-400">
                    • New user registrations: {systemStats.newRegistrations}{" "}
                    (today)
                  </div>
                )}
                {systemStats.lastBackup !== "Loading..." && (
                  <div className="text-green-400">
                    • System backup completed
                  </div>
                )}
                {pendingKycCount === 0 &&
                  systemStats.recentDeposits === 0 &&
                  systemStats.failedLogins === 0 &&
                  systemStats.newRegistrations === 0 && (
                    <div className="text-gray-400">• No recent alerts</div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setShowUserStatsModal("total")}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors text-left"
            >
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
            </button>

            <button
              onClick={() => setShowUserStatsModal("admin")}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Admin Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {adminUsers}
                  </p>
                </div>
                <UserCheck className="text-green-400" size={24} />
              </div>
            </button>

            <button
              onClick={() => setShowUserStatsModal("staff")}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Staff Admin Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {staffAdminUsers}
                  </p>
                </div>
                <Shield className="text-green-400" size={24} />
              </div>
            </button>

            <button
              onClick={() => setShowUserStatsModal("regular")}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Regular Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">
                    {regularUsers}
                  </p>
                </div>
                <UserX className="text-blue-400" size={24} />
              </div>
            </button>
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

      {/* Payment Modal - Fullscreen */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen"
          >
            {/* Modal Header with Close Button */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-3 xs:p-4 sm:p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {selectedUser && (
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="Back to user selection"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="text-xs sm:text-sm font-medium text-gray-300 truncate max-w-[200px] sm:max-w-none">
                  {selectedUser
                    ? `Payment for ${selectedUser.email}`
                    : "Manual Payment"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-w-7xl mx-auto p-3 xs:p-4 sm:p-6 lg:p-8">
              {/* User Selection */}
              {!selectedUser && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                    <Users className="text-blue-400" size={24} />
                    <span>Select User</span>
                  </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {users.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        No users available
                      </p>
                    ) : (
                      users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="w-full p-4 rounded-lg border bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50 hover:border-orange-500/50 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm sm:text-base truncate">
                                {user.email}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-400 truncate">
                                {user.name || "No name"}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                                user.role === "ADMIN"
                                  ? "bg-green-500/20 text-green-400"
                                  : user.role === "STAFF_ADMIN"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Payment Form */}
              {selectedUser && (
                <div className="space-y-6">
                  {/* Manual Top-up Section */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <h3 className="text-base xs:text-lg font-bold mb-4 flex items-center space-x-2">
                      <Wallet className="text-green-400" size={20} />
                      <span>Manual Payment Processing</span>
                    </h3>

                    {/* Main Deposit Type Selection */}
                    <div className="mb-3 xs:mb-4">
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        Deposit Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setDepositType("fiat");
                            setPaymentMethodType("traditional");
                          }}
                          className={`p-2.5 xs:p-3 rounded-lg border-2 transition-all ${
                            depositType === "fiat"
                              ? "bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500 shadow-lg shadow-green-500/20"
                              : "bg-gray-700/30 border-gray-600/50 hover:border-gray-500"
                          }`}
                        >
                          <DollarSign
                            className={`w-5 h-5 xs:w-6 xs:h-6 mx-auto mb-1 ${
                              depositType === "fiat"
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-xs xs:text-sm font-bold block ${
                              depositType === "fiat"
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          >
                            Deposit Fiat
                          </span>
                        </button>
                        <button
                          onClick={() => setDepositType("crypto")}
                          className={`p-2.5 xs:p-3 rounded-lg border-2 transition-all ${
                            depositType === "crypto"
                              ? "bg-gradient-to-br from-orange-500/20 to-purple-500/20 border-orange-500 shadow-lg shadow-orange-500/20"
                              : "bg-gray-700/30 border-gray-600/50 hover:border-gray-500"
                          }`}
                        >
                          <Wallet
                            className={`w-5 h-5 xs:w-6 xs:h-6 mx-auto mb-1 ${
                              depositType === "crypto"
                                ? "text-orange-400"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-xs xs:text-sm font-bold block ${
                              depositType === "crypto"
                                ? "text-orange-400"
                                : "text-gray-400"
                            }`}
                          >
                            Cryptocurrency
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Selected User:
                          </p>
                          <p className="font-semibold text-white text-sm">
                            {selectedUser.email}
                          </p>
                        </div>

                        {/* Fiat Deposit Options */}
                        {depositType === "fiat" && (
                          <>
                            <div>
                              <label className="block text-xs font-semibold text-gray-300 mb-2">
                                Payment Method
                              </label>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                  onClick={() =>
                                    setPaymentMethodType("traditional")
                                  }
                                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    paymentMethodType === "traditional"
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                                  }`}
                                >
                                  Traditional
                                </button>
                                <button
                                  onClick={() => setPaymentMethodType("crypto")}
                                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    paymentMethodType === "crypto"
                                      ? "bg-blue-500 text-white"
                                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                                  }`}
                                >
                                  Cryptocurrency
                                </button>
                              </div>

                              <div className="space-y-2">
                                {paymentMethodType === "traditional" ? (
                                  traditionalPaymentMethods.map((method) => (
                                    <button
                                      key={method.id}
                                      className="w-full p-2.5 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-blue-500/50 rounded-lg transition-all text-left flex items-center gap-2.5"
                                    >
                                      <span className="text-lg">
                                        {method.icon}
                                      </span>
                                      <span className="font-medium text-white text-sm">
                                        {method.name}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="relative">
                                    <label className="block text-xs font-semibold text-gray-300 mb-2">
                                      Select Cryptocurrency
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowCryptoDropdown(
                                          !showCryptoDropdown
                                        )
                                      }
                                      className="w-full bg-gray-700/50 border border-gray-600/50 hover:border-orange-500/50 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex items-center justify-between transition-all"
                                    >
                                      <div className="flex items-center gap-3">
                                        <CryptoIcon
                                          symbol={cryptoAsset}
                                          className="w-6 h-6"
                                        />
                                        <div className="text-left">
                                          <p className="font-semibold">
                                            {cryptoAsset} -{" "}
                                            {
                                              cryptoAssets.find(
                                                (a) => a.symbol === cryptoAsset
                                              )?.name
                                            }
                                          </p>
                                          <p className="text-xs text-gray-400">
                                            {getCurrencySymbol(
                                              selectedUser?.preferredCurrency ||
                                                "USD"
                                            )}
                                            {(
                                              prices[cryptoAsset]?.price || 0
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                      <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${
                                          showCryptoDropdown ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    </button>

                                    {showCryptoDropdown && (
                                      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                                        {cryptoPaymentMethods.map((method) => {
                                          const cryptoPrice =
                                            prices[method.name];
                                          const price = cryptoPrice?.price || 0;
                                          const change =
                                            cryptoPrice?.change24h || 0;
                                          const currencySymbol =
                                            getCurrencySymbol(
                                              selectedUser?.preferredCurrency ||
                                                "USD"
                                            );
                                          const isSelected =
                                            cryptoAsset === method.name;

                                          return (
                                            <button
                                              key={method.id}
                                              type="button"
                                              onClick={() => {
                                                setCryptoAsset(method.name);
                                                setShowCryptoDropdown(false);
                                              }}
                                              className={`w-full p-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                                                isSelected
                                                  ? "bg-orange-500/10 border-l-4 border-orange-500"
                                                  : ""
                                              }`}
                                            >
                                              <CryptoIcon
                                                symbol={method.name}
                                                className="w-8 h-8 flex-shrink-0"
                                              />
                                              <div className="flex-1 text-left">
                                                <div className="flex items-center justify-between">
                                                  <p className="font-semibold text-white">
                                                    {method.name}
                                                  </p>
                                                  <span
                                                    className={`text-xs font-medium ${
                                                      change >= 0
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                    }`}
                                                  >
                                                    {change >= 0 ? "+" : ""}
                                                    {change.toFixed(2)}%
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                  <p className="text-xs text-gray-400">
                                                    {method.fullName}
                                                  </p>
                                                  <p className="text-sm font-medium text-white">
                                                    {currencySymbol}
                                                    {price.toLocaleString()}
                                                  </p>
                                                </div>
                                              </div>
                                              {isSelected && (
                                                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Crypto Deposit Options */}
                        {/* Crypto Deposit Options */}
                        {depositType === "crypto" && (
                          <div className="relative">
                            <label className="block text-xs font-semibold text-gray-300 mb-2">
                              Select Cryptocurrency
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setShowCryptoDropdown(!showCryptoDropdown)
                              }
                              className="w-full bg-gray-700/50 border border-gray-600/50 hover:border-orange-500/50 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex items-center justify-between transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <CryptoIcon
                                  symbol={cryptoAsset}
                                  className="w-6 h-6"
                                />
                                <div className="text-left">
                                  <p className="font-semibold">
                                    {cryptoAsset} -{" "}
                                    {
                                      cryptoAssets.find(
                                        (a) => a.symbol === cryptoAsset
                                      )?.name
                                    }
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {getCurrencySymbol(
                                      selectedUser?.preferredCurrency || "USD"
                                    )}
                                    {(
                                      prices[cryptoAsset]?.price || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                  showCryptoDropdown ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            {showCryptoDropdown && (
                              <div
                                className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto p-2"
                                style={{ perspective: "1000px" }}
                              >
                                {cryptoAssets.map((asset, index) => {
                                  const cryptoPrice = prices[asset.symbol];
                                  const price = cryptoPrice?.price || 0;
                                  const change = cryptoPrice?.change24h || 0;
                                  const currencySymbol = getCurrencySymbol(
                                    selectedUser?.preferredCurrency || "USD"
                                  );
                                  const isSelected =
                                    cryptoAsset === asset.symbol;

                                  return (
                                    <motion.button
                                      key={asset.symbol}
                                      type="button"
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      whileHover={{
                                        scale: 1.02,
                                        z: 50,
                                        rotateY: 2,
                                        transition: { duration: 0.2 },
                                      }}
                                      onClick={() => {
                                        setCryptoAsset(asset.symbol);
                                        setShowCryptoDropdown(false);
                                      }}
                                      className={`w-full p-4 mb-2 flex items-center gap-3 rounded-xl transition-all relative group overflow-hidden ${
                                        isSelected
                                          ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-2 border-orange-500/60 shadow-lg shadow-orange-500/20"
                                          : "bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700/50 hover:border-gray-600 hover:shadow-xl"
                                      }`}
                                      style={{
                                        transformStyle: "preserve-3d",
                                        transform: isSelected
                                          ? "translateZ(20px)"
                                          : "translateZ(0px)",
                                      }}
                                    >
                                      {/* 3D Depth Background Layer */}
                                      <div
                                        className={`absolute inset-0 rounded-xl opacity-50 ${
                                          isSelected
                                            ? "bg-gradient-to-br from-orange-500/10 to-transparent"
                                            : "bg-gradient-to-br from-gray-700/20 to-transparent group-hover:from-gray-600/30"
                                        }`}
                                        style={{
                                          transform: "translateZ(-10px)",
                                        }}
                                      />

                                      {/* Shine Effect */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                      <div
                                        className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center ${
                                          isSelected
                                            ? "bg-orange-500/20 shadow-lg shadow-orange-500/20"
                                            : "bg-gray-700/50 group-hover:bg-gray-600/50"
                                        }`}
                                        style={{
                                          transform: "translateZ(15px)",
                                        }}
                                      >
                                        <CryptoIcon
                                          symbol={asset.symbol}
                                          className="w-6 h-6"
                                        />
                                      </div>

                                      <div
                                        className="flex-1 text-left relative z-10"
                                        style={{
                                          transform: "translateZ(10px)",
                                        }}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-base">
                                              {asset.symbol}
                                            </p>
                                            <span
                                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                change >= 0
                                                  ? "bg-green-500/20 text-green-400"
                                                  : "bg-red-500/20 text-red-400"
                                              }`}
                                            >
                                              {change >= 0 ? "+" : ""}
                                              {change.toFixed(2)}%
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
                                              style={{
                                                transform: "translateZ(20px)",
                                              }}
                                            >
                                              <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs text-gray-400 font-medium">
                                            {asset.name}
                                          </p>
                                          <p className="text-sm font-bold text-white">
                                            {currencySymbol}
                                            {price.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Bottom Depth Edge */}
                                      <div
                                        className={`absolute bottom-0 left-0 right-0 h-1 ${
                                          isSelected
                                            ? "bg-gradient-to-r from-orange-500/40 via-orange-600/60 to-orange-500/40"
                                            : "bg-gradient-to-r from-gray-700/40 via-gray-600/40 to-gray-700/40"
                                        }`}
                                        style={{
                                          transform: "translateZ(-5px)",
                                        }}
                                      />
                                    </motion.button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2">
                            Amount
                          </label>
                          {depositType === "fiat" &&
                            paymentMethodType === "crypto" && (
                              <div className="flex items-center space-x-2 mb-2">
                                <button
                                  onClick={() => setAmountInputType("usd")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    amountInputType === "usd"
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                                  }`}
                                >
                                  {adminCurrency || "USD"}
                                </button>
                                <button
                                  onClick={() => setAmountInputType("crypto")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    amountInputType === "crypto"
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                                  }`}
                                >
                                  {cryptoAsset}
                                </button>
                              </div>
                            )}
                          {depositType === "crypto" && (
                            <div className="flex items-center space-x-2 mb-2">
                              <button
                                onClick={() => setAmountInputType("usd")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  amountInputType === "usd"
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                                }`}
                              >
                                {adminCurrency || "USD"} Value
                              </button>
                              <button
                                onClick={() => setAmountInputType("crypto")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            placeholder={
                              amountInputType === "usd"
                                ? depositType === "fiat"
                                  ? "0.00"
                                  : "0.00"
                                : "0.00000000"
                            }
                            disabled={loading}
                          />
                          {depositType === "fiat" &&
                            amountInputType === "usd" &&
                            selectedUser && (
                              <p className="text-[10px] text-blue-400 mt-1">
                                💰 Enter the amount in{" "}
                                {selectedUser.preferredCurrency || "USD"} (
                                {getCurrencySymbol(
                                  selectedUser.preferredCurrency || "USD"
                                )}
                                ) - user&apos;s preferred currency
                              </p>
                            )}
                          {amountInputType === "usd" &&
                            (depositType === "crypto" ||
                              (depositType === "fiat" &&
                                paymentMethodType === "crypto")) && (
                              <p className="text-[10px] text-gray-500 mt-1">
                                Equivalent crypto amount will be calculated
                                automatically
                              </p>
                            )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-300 mb-2">
                            Notification Message
                          </label>
                          <textarea
                            value={notificationMessage}
                            onChange={(e) =>
                              setNotificationMessage(e.target.value)
                            }
                            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            placeholder="Optional note for the user..."
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/30">
                          <h4 className="font-semibold mb-2 text-sm">
                            Transaction Summary
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Type:</span>
                              <span className="font-semibold">
                                {depositType === "fiat"
                                  ? "Fiat Deposit"
                                  : "Crypto Deposit"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Method:</span>
                              <span className="capitalize">
                                {depositType === "fiat"
                                  ? paymentMethodType === "crypto"
                                    ? `${cryptoAsset} (→ Fiat)`
                                    : "Traditional"
                                  : `${cryptoAsset} Asset`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Amount:</span>
                              <span className="font-semibold text-green-400">
                                {depositType === "fiat"
                                  ? `${amount || "0"} ${
                                      selectedUser?.preferredCurrency || "USD"
                                    }`
                                  : amountInputType === "usd"
                                  ? `${amount || "0"} ${adminCurrency || "USD"}`
                                  : `${amount || "0"} ${cryptoAsset}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">User:</span>
                              <span className="truncate max-w-[180px]">
                                {selectedUser.email}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 mt-2 border-t border-gray-600">
                              <span className="text-gray-400">
                                Will be added to:
                              </span>
                              <span className="text-blue-400 font-semibold">
                                {depositType === "fiat"
                                  ? `Fiat Balance`
                                  : `${cryptoAsset} Holdings`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-2.5 ${
                            depositType === "fiat"
                              ? "bg-green-900/20 border-green-700"
                              : "bg-orange-900/20 border-orange-700"
                          }`}
                        >
                          <p
                            className={`text-[10px] leading-relaxed ${
                              depositType === "fiat"
                                ? "text-green-300"
                                : "text-orange-300"
                            }`}
                          >
                            ℹ️{" "}
                            {depositType === "fiat"
                              ? paymentMethodType === "crypto"
                                ? `This ${cryptoAsset} deposit will be converted to ${
                                    selectedUser?.preferredCurrency || "USD"
                                  } and added to the user's fiat balance.`
                                : `This will add funds to the user's fiat balance in their preferred currency.`
                              : `This will add ${cryptoAsset} directly to the user's cryptocurrency portfolio, not their fiat balance.`}
                          </p>
                        </div>

                        <button
                          onClick={handleTopUp}
                          disabled={
                            loading || !amount || parseFloat(amount) <= 0
                          }
                          className={`w-full font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg ${
                            depositType === "fiat"
                              ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700"
                              : "bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700"
                          } disabled:cursor-not-allowed text-white`}
                        >
                          {depositType === "fiat" ? (
                            <DollarSign size={20} />
                          ) : (
                            <Wallet size={20} />
                          )}
                          <span className="text-sm">
                            {loading
                              ? "Processing..."
                              : `Process ${
                                  depositType === "fiat" ? "Fiat" : "Crypto"
                                } Deposit`}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Asset Warning Modal */}
                  {showAssetWarning && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-yellow-500/30">
                        <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                          <AlertCircle size={24} />
                          Asset Not Found
                        </h3>
                        <p className="text-gray-300 mb-4">
                          {assetWarningMessage}
                        </p>
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
            </div>
          </motion.div>
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === "transactions" && <TransactionHistoryView />}

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

      {/* Edit User Role Modal - Responsive Web UI */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b border-gray-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-orange-400" />
                Edit User Role
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">User</p>
                <p className="font-semibold text-white truncate">
                  {editingUser.email}
                </p>
                {editingUser.name && (
                  <p className="text-sm text-gray-300 mt-1">
                    {editingUser.name}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Role
                </label>
                <div className="space-y-2">
                  {/* USER Role */}
                  <label className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl cursor-pointer transition-all hover:border-orange-500/50 group">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          newRole === "USER"
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-600 group-hover:border-orange-500/50"
                        }`}
                      >
                        {newRole === "USER" && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">User</p>
                        <p className="text-xs text-gray-400">
                          Standard user account
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value="USER"
                      checked={newRole === "USER"}
                      onChange={(e) =>
                        setNewRole(
                          e.target.value as "USER" | "ADMIN" | "STAFF_ADMIN"
                        )
                      }
                      className="sr-only"
                    />
                  </label>

                  {/* ADMIN Role */}
                  <label className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl cursor-pointer transition-all hover:border-orange-500/50 group">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          newRole === "ADMIN"
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-600 group-hover:border-orange-500/50"
                        }`}
                      >
                        {newRole === "ADMIN" && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">Admin</p>
                        <p className="text-xs text-gray-400">
                          Full system access
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={newRole === "ADMIN"}
                      onChange={(e) =>
                        setNewRole(
                          e.target.value as "USER" | "ADMIN" | "STAFF_ADMIN"
                        )
                      }
                      className="sr-only"
                    />
                  </label>

                  {/* STAFF_ADMIN Role */}
                  <label className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl cursor-pointer transition-all hover:border-orange-500/50 group">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          newRole === "STAFF_ADMIN"
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-600 group-hover:border-orange-500/50"
                        }`}
                      >
                        {newRole === "STAFF_ADMIN" && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">Staff Admin</p>
                        <p className="text-xs text-gray-400">
                          Manage assigned users only
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value="STAFF_ADMIN"
                      checked={newRole === "STAFF_ADMIN"}
                      onChange={(e) =>
                        setNewRole(
                          e.target.value as "USER" | "ADMIN" | "STAFF_ADMIN"
                        )
                      }
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleUpdateUserRole(editingUser.id, newRole)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Update Role
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  disabled={loading}
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

      {/* User Stats Modal */}
      {showUserStatsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUserStatsModal(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {showUserStatsModal === "total" && (
                    <>
                      <Users className="text-blue-400" size={20} />
                      All Users ({totalUsers})
                    </>
                  )}
                  {showUserStatsModal === "admin" && (
                    <>
                      <UserCheck className="text-green-400" size={20} />
                      Admin Users ({adminUsers})
                    </>
                  )}
                  {showUserStatsModal === "staff" && (
                    <>
                      <Shield className="text-green-400" size={20} />
                      Staff Admin Users ({staffAdminUsers})
                    </>
                  )}
                  {showUserStatsModal === "regular" && (
                    <>
                      <UserX className="text-blue-400" size={20} />
                      Regular Users ({regularUsers})
                    </>
                  )}
                </h2>
              </div>
              <button
                onClick={() => setShowUserStatsModal(null)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-2">
                {users
                  .filter((user) => {
                    if (showUserStatsModal === "total") return true;
                    if (showUserStatsModal === "admin")
                      return user.role === "ADMIN";
                    if (showUserStatsModal === "staff")
                      return user.role === "STAFF_ADMIN";
                    if (showUserStatsModal === "regular")
                      return user.role === "USER";
                    return false;
                  })
                  .map((user) => (
                    <div
                      key={user.id}
                      className={`bg-gray-700/30 border rounded-lg p-3 transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-orange-500/20 border-orange-500/50"
                          : "border-gray-600/30 hover:bg-gray-700/50"
                      } ${user.role === "USER" ? "cursor-pointer" : ""}`}
                      onClick={() =>
                        user.role === "USER" &&
                        setSelectedUser(
                          selectedUser?.id === user.id ? null : user
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {user.name || "No name"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Account: {user.accountType}
                          </p>
                          {user.assignedStaffId && (
                            <p className="text-xs text-blue-400 mt-1">
                              📋 Assigned to staff admin
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "ADMIN"
                                ? "bg-green-500/20 text-green-400"
                                : user.role === "STAFF_ADMIN"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {user.role}
                          </span>
                          {/* Admin action buttons - hide for origin admin */}
                          {!user.isOriginAdmin && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingUser(user);
                                  setNewRole(
                                    user.role as
                                      | "USER"
                                      | "ADMIN"
                                      | "STAFF_ADMIN"
                                  );
                                }}
                                className="text-gray-400 hover:text-orange-400 transition-colors p-1"
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
                                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Show Assign to Staff Admin when user is selected */}
                      {selectedUser?.id === user.id &&
                        user.role === "USER" &&
                        !user.isOriginAdmin && (
                          <div className="mt-3 pt-3 border-t border-gray-600/50 space-y-2">
                            <label className="text-xs text-gray-300 font-semibold">
                              Assign to Staff Admin:
                            </label>
                            <select
                              value={user.assignedStaffId || ""}
                              onChange={(e) =>
                                handleAssignStaff(
                                  user.id,
                                  e.target.value || null
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              disabled={
                                assigningStaff || staffAdmins.length === 0
                              }
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">
                                {staffAdmins.length === 0
                                  ? "No staff admins available"
                                  : "Unassigned"}
                              </option>
                              {staffAdmins.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                  {staff.name || staff.email}
                                </option>
                              ))}
                            </select>
                            {user.assignedStaffId && (
                              <p className="text-xs text-green-400">
                                ✓ Assigned to staff admin
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  ))}
              </div>

              {users.filter((user) => {
                if (showUserStatsModal === "total") return true;
                if (showUserStatsModal === "admin")
                  return user.role === "ADMIN";
                if (showUserStatsModal === "staff")
                  return user.role === "STAFF_ADMIN";
                if (showUserStatsModal === "regular")
                  return user.role === "USER";
                return false;
              }).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">
                    No users found in this category
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="text-teal-400" size={24} />
                Recent Activity Logs
              </h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {activityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm sm:text-base">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.timeAgo}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                            activity.color === "green"
                              ? "bg-green-500/20 text-green-400"
                              : activity.color === "blue"
                              ? "bg-blue-500/20 text-blue-400"
                              : activity.color === "orange"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center text-xs text-gray-500">
                Auto-refreshes every 10 seconds
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Database Management Modal */}
      {showDatabaseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="text-pink-400" size={24} />
                Database Management
              </h2>
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Database Stats */}
              <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Database Statistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Database Size</p>
                    <p className="text-xl font-bold text-white">
                      {databaseStats.size}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Total Records</p>
                    <p className="text-xl font-bold text-white">
                      {databaseStats.totalRecords.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Last Backup</p>
                    <p className="text-sm font-medium text-white">
                      {databaseStats.lastBackup}
                    </p>
                  </div>
                </div>
              </div>

              {/* Database Actions */}
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/admin/database-backup",
                        {
                          method: "POST",
                        }
                      );
                      const data = await response.json();
                      if (data.success) {
                        showPopupNotification(
                          "Database backup initiated successfully",
                          "success"
                        );
                      } else {
                        showPopupNotification(
                          "Failed to create backup",
                          "error"
                        );
                      }
                    } catch (error) {
                      showPopupNotification("Error creating backup", "error");
                    }
                  }}
                  className="w-full bg-blue-500/20 border-2 border-blue-500/40 hover:bg-blue-500/30 hover:border-blue-500/60 text-blue-400 py-4 px-4 rounded-xl transition-all font-semibold flex items-center justify-center space-x-3"
                >
                  <Database size={20} />
                  <span>Create Database Backup</span>
                </button>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/admin/database-optimize",
                        {
                          method: "POST",
                        }
                      );
                      const data = await response.json();
                      if (data.success) {
                        showPopupNotification(
                          "Database optimized successfully",
                          "success"
                        );
                      } else {
                        showPopupNotification(
                          "Failed to optimize database",
                          "error"
                        );
                      }
                    } catch (error) {
                      showPopupNotification(
                        "Error optimizing database",
                        "error"
                      );
                    }
                  }}
                  className="w-full bg-green-500/20 border-2 border-green-500/40 hover:bg-green-500/30 hover:border-green-500/60 text-green-400 py-4 px-4 rounded-xl transition-all font-semibold flex items-center justify-center space-x-3"
                >
                  <Activity size={20} />
                  <span>Optimize Database</span>
                </button>

                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "Are you sure you want to clear old logs? This will delete transaction logs older than 90 days and failed deposits older than 30 days."
                      )
                    ) {
                      return;
                    }
                    try {
                      const response = await fetch(
                        "/api/admin/database-clear-logs",
                        {
                          method: "POST",
                        }
                      );
                      const data = await response.json();
                      if (data.success) {
                        showPopupNotification(
                          `Cleared ${data.deleted.transactions} old transactions and ${data.deleted.deposits} failed deposits`,
                          "success"
                        );
                      } else {
                        showPopupNotification("Failed to clear logs", "error");
                      }
                    } catch (error) {
                      showPopupNotification("Error clearing logs", "error");
                    }
                  }}
                  className="w-full bg-red-500/20 border-2 border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 text-red-400 py-4 px-4 rounded-xl transition-all font-semibold flex items-center justify-center space-x-3"
                >
                  <X size={20} />
                  <span>Clear Old Logs</span>
                </button>
              </div>

              <div className="mt-6 text-center text-xs text-gray-500">
                Stats auto-refresh every 30 seconds
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-xl max-w-sm w-full shadow-2xl border border-green-500/30 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-2.5 sm:p-3 border-b border-gray-700 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-green-400" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Deposit Successful!
                    </h3>
                    <p className="text-xs text-gray-400">
                      Transaction completed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessDetails(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {/* Deposit Type */}
              <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-0.5">Deposit Type</p>
                <p className="text-sm sm:text-base font-semibold text-white">
                  {successDetails.type}
                </p>
              </div>

              {/* Amount */}
              <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">
                  {successDetails.amount}
                </p>
              </div>

              {/* User */}
              <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-0.5">Credited To</p>
                <p className="text-sm font-medium text-white truncate">
                  {successDetails.userEmail}
                </p>
              </div>

              {/* Transaction Hash (if crypto) */}
              {successDetails.transactionHash && (
                <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 border border-gray-700">
                  <p className="text-xs text-gray-400 mb-0.5">
                    Transaction Hash
                  </p>
                  <p className="text-xs font-mono text-gray-300 break-all">
                    {successDetails.transactionHash}
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    ⏱️ Awaiting confirmations (0/6)
                  </p>
                </div>
              )}

              {/* Notifications Sent */}
              <div className="bg-blue-500/10 rounded-lg p-2.5 sm:p-3 border border-blue-500/30">
                <p className="text-xs font-medium text-blue-400 mb-1">
                  📬 Notifications Sent
                </p>
                <ul className="text-xs text-gray-300 space-y-0.5">
                  <li>✓ Email notification</li>
                  <li>✓ Push notification (if enabled)</li>
                  {successDetails.transactionHash && (
                    <li>✓ Real-time confirmation tracking</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-700 flex space-x-2 sm:space-x-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSuccessDetails(null);
                  setShowPaymentModal(true);
                }}
                className="flex-1 bg-blue-500/20 border border-blue-500/40 hover:bg-blue-500/30 hover:border-blue-500/60 text-blue-400 py-2 sm:py-2.5 px-3 rounded-lg transition-all font-semibold text-sm"
              >
                Process Another
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSuccessDetails(null);
                }}
                className="flex-1 bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 hover:border-green-500/60 text-green-400 py-2 sm:py-2.5 px-3 rounded-lg transition-all font-semibold text-sm"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
