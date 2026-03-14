"use client";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { User as PrismaUser } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
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
import ManualProfitModal from "@/components/client/ManualProfitModal";

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
  adminViewPassword?: string | null;
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
const TransactionHistoryView = ({ setActiveTab, isDark }: { setActiveTab: (tab: string) => void; isDark: boolean }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTrades: 0,
    manualTransactions: 0,
  });
  const [filter, setFilter] = useState<
    "all" | "deposit" | "withdraw" | "buy" | "sell" | "trade_earned"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

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
        return isDark
          ? "text-green-400 bg-green-500/10 border-green-500/30"
          : "text-green-700 bg-green-100 border-green-400";
      case "withdraw":
        return isDark
          ? "text-red-400 bg-red-500/10 border-red-500/30"
          : "text-red-700 bg-red-100 border-red-400";
      case "buy":
        return isDark
          ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
          : "text-blue-700 bg-blue-100 border-blue-400";
      case "sell":
        return isDark
          ? "text-orange-400 bg-orange-500/10 border-orange-500/30"
          : "text-orange-700 bg-orange-100 border-orange-400";
      case "trade_earned":
        return isDark
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
          : "text-emerald-700 bg-emerald-100 border-emerald-400";
      default:
        return isDark
          ? "text-gray-400 bg-gray-500/10 border-gray-500/30"
          : "text-gray-700 bg-gray-100 border-gray-400";
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
      {/* Back Button */}
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`border rounded-lg p-3 ${
          isDark ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-400"
        }`}>
          <p className={`text-xs mb-1 ${
            isDark ? "text-green-400" : "text-green-700"
          }`}>Total Deposits</p>
          <p className={`text-xl font-bold ${
            isDark ? "text-green-400" : "text-green-700"
          }`}>
            {stats.totalDeposits}
          </p>
        </div>
        <div className={`border rounded-lg p-3 ${
          isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-400"
        }`}>
          <p className={`text-xs mb-1 ${
            isDark ? "text-red-400" : "text-red-700"
          }`}>Total Withdrawals</p>
          <p className={`text-xl font-bold ${
            isDark ? "text-red-400" : "text-red-700"
          }`}>
            {stats.totalWithdrawals}
          </p>
        </div>
        <div className={`border rounded-lg p-3 ${
          isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-400"
        }`}>
          <p className={`text-xs mb-1 ${
            isDark ? "text-blue-400" : "text-blue-700"
          }`}>Total Trades</p>
          <p className={`text-xl font-bold ${
            isDark ? "text-blue-400" : "text-blue-700"
          }`}>{stats.totalTrades}</p>
        </div>
        <div className={`border rounded-lg p-3 ${
          isDark ? "bg-purple-500/10 border-purple-500/30" : "bg-purple-50 border-purple-400"
        }`}>
          <p className={`text-xs mb-1 ${
            isDark ? "text-purple-400" : "text-purple-700"
          }`}>Manual Payments</p>
          <p className={`text-xl font-bold ${
            isDark ? "text-purple-400" : "text-purple-700"
          }`}>
            {stats.manualTransactions}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={`border rounded-lg p-4 ${
        isDark
          ? "bg-gray-800/50 border-gray-700/50"
          : "bg-white border-gray-200"
      }`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by user name, email, asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDark
                ? "bg-gray-700/50 border-gray-600/50 text-white"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
          />
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {["all", "deposit", "withdraw", "buy", "sell", "trade_earned"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  filter === type
                    ? "bg-blue-500 text-white"
                    : isDark
                    ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type === "trade_earned" ? "Trade Earned" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={`border rounded-lg overflow-hidden ${
        isDark
          ? "bg-gray-800/50 border-gray-700/50"
          : "bg-white border-gray-200"
      }`}>
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className={`border-b ${
                isDark
                  ? "bg-gray-700/50 border-gray-600"
                  : "bg-gray-200 border-gray-300"
              }`}>
                <tr>
                  <th className={`text-left p-3 text-xs font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Date
                  </th>
                  <th className={`text-left p-3 text-xs font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    User
                  </th>
                  <th className={`text-left p-3 text-xs font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr
                    key={tx.id || index}
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setShowTransactionModal(true);
                    }}
                    className={`border-b transition-colors cursor-pointer ${
                      isDark
                        ? "border-gray-700/50 hover:bg-gray-700/30"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <td className={`p-3 text-xs ${
                      isDark ? "text-gray-400" : "text-gray-700"
                    }`}>
                      {new Date(tx.timestamp).toLocaleDateString()}
                      <br />
                      <span className={`text-[10px] ${
                        isDark ? "text-gray-500" : "text-gray-600"
                      }`}>
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-xs">
                        <p className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {tx.userName || "Unknown"}
                        </p>
                        <p className={`text-[10px] ${
                          isDark ? "text-gray-500" : "text-gray-600"
                        }`}>
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
                        {tx.type === "trade_earned" ? "TRADE EARNED" : tx.type.toUpperCase()}
                        {tx.isManual && tx.type !== "deposit" && tx.type !== "trade_earned" && <span className="ml-1">🔧</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction Count */}
      <div className={`text-center text-sm ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}>
        Showing {filteredTransactions.length} of {transactions.length}{" "}
        transactions
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[100] overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
          {/* Spacer for dashboard header */}
          <div className="h-14 sm:h-[72px]" />

          {/* Back button */}
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
            <button
              onClick={() => {
                setShowTransactionModal(false);
                setSelectedTransaction(null);
              }}
              className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Card */}
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <div className={`border rounded-xl shadow-2xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
              {/* Header */}
              <div className={`border-b p-4 flex items-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  <FileText size={20} className="text-blue-400" />
                  Transaction Details
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Transaction Type */}
                <div className={`p-4 ${isDark ? "bg-gray-700/30" : "bg-gray-100"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Transaction Type</span>
                    <span
                      className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getTypeColor(
                        selectedTransaction.type
                      )}`}
                    >
                      {selectedTransaction.type === "trade_earned" ? "TRADE EARNED" : selectedTransaction.type.toUpperCase()}
                      {selectedTransaction.isManual && selectedTransaction.type !== "deposit" && selectedTransaction.type !== "trade_earned" && <span className="ml-1">🔧</span>}
                    </span>
                  </div>
                </div>

                {/* User Information */}
                <div className={`p-4 ${isDark ? "bg-gray-700/30" : "bg-gray-100"}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>User Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Name:</span>
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {selectedTransaction.userName || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Email:</span>
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {selectedTransaction.userEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className={`p-4 ${isDark ? "bg-gray-700/30" : "bg-gray-100"}`}>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Transaction Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Asset:</span>
                      <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {selectedTransaction.asset}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Amount:</span>
                      <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'ETC', 'TRX', 'TON', 'USDT', 'USDC'].includes(selectedTransaction.asset)
                          ? selectedTransaction.amount.toFixed(8)
                          : selectedTransaction.amount.toFixed(2)}
                      </span>
                    </div>
                    {selectedTransaction.fee > 0 && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Fee:</span>
                        <span className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'ETC', 'TRX', 'TON', 'USDT', 'USDC'].includes(selectedTransaction.asset)
                            ? selectedTransaction.fee.toFixed(8)
                            : selectedTransaction.fee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Method:</span>
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {selectedTransaction.method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Status:</span>
                      <span className={`text-sm font-semibold ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status?.toUpperCase() || "N/A"}
                      </span>
                    </div>
                    {selectedTransaction.confirmations !== undefined && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Confirmations:</span>
                        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {selectedTransaction.confirmations}/{selectedTransaction.maxConfirmations}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Date:</span>
                      <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {new Date(selectedTransaction.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction ID */}
                {selectedTransaction.id && (
                  <div className={`p-4 ${isDark ? "bg-gray-700/30" : "bg-gray-100"}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Transaction ID</h3>
                    <code className={`text-xs px-3 py-2 rounded block break-all ${isDark ? "text-gray-300 bg-gray-900/50" : "text-gray-700 bg-gray-200"}`}>
                      {selectedTransaction.id}
                    </code>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`p-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedTransaction(null);
                  }}
                  className={`w-full py-2.5 px-4 rounded-lg transition-all font-semibold text-sm ${isDark ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? resolvedTheme === "dark" : false;
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
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [globalSignalStrength, setGlobalSignalStrength] = useState(84);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isStrongMode, setIsStrongMode] = useState(false);
  const [isModerateMode, setIsModerateMode] = useState(false);
  const [isWeakMode, setIsWeakMode] = useState(false);
  const [showManualProfitModal, setShowManualProfitModal] = useState(false);

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
    fiatAmount?: string;
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

  // Handle browser/mobile back button to close modals
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (showPaymentModal) {
        e.preventDefault();
        setShowPaymentModal(false);
        setSelectedUser(null);
      } else if (showSignalModal) {
        e.preventDefault();
        setShowSignalModal(false);
      } else if (showUserStatsModal) {
        e.preventDefault();
        setShowUserStatsModal(null);
      }
    };

    // Add state to history when modal opens
    if (
      showPaymentModal ||
      showSignalModal ||
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
    showSignalModal,
    showUserStatsModal,
  ]);

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
      } else if (showSignalModal) {
        setShowSignalModal(false);
      }
    };

    // Push state when modal opens
    if (
      showPaymentModal ||
      editingUser ||
      showAssetWarning ||
      showUserStatsModal ||
      showSignalModal
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
    showSignalModal,
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

  const fetchSignalStrength = async () => {
    try {
      const res = await fetch("/api/admin/signal-strength");
      if (res.ok) {
        const data = await res.json();
        setGlobalSignalStrength(data.signalStrength);
        // Set mode from server
        setIsAutoMode(data.activeMode === "auto");
        setIsStrongMode(data.activeMode === "strong");
        setIsModerateMode(data.activeMode === "moderate");
        setIsWeakMode(data.activeMode === "weak");
      }
    } catch (error) {
      console.error("Failed to fetch signal strength:", error);
    }
  };

  const updateSignalStrength = async (strength: number, mode: "none" | "auto" | "strong" | "moderate" | "weak" = "none") => {
    try {
      const res = await fetch("/api/admin/signal-strength", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalStrength: strength, mode }),
      });
      
      if (res.ok) {
        const modeLabel = mode === "none" ? "Manual" : mode.charAt(0).toUpperCase() + mode.slice(1);
        showPopupNotification(
          `Signal set to ${strength}% (${modeLabel} mode)`,
          "success"
        );
        setShowSignalModal(false);
      } else {
        showPopupNotification("Failed to update signal strength", "error");
      }
    } catch (error) {
      console.error("Failed to update signal strength:", error);
      showPopupNotification("Error updating signal strength", "error");
    }
  };

  // Auto-fluctuation effect
  useEffect(() => {
    if (!isAutoMode && !isStrongMode && !isModerateMode && !isWeakMode) return;

    const fluctuateSignal = async () => {
      let min, max;
      
      if (isWeakMode) {
        min = 45;
        max = 68;
      } else if (isModerateMode) {
        min = 65;
        max = 78;
      } else if (isStrongMode) {
        min = 88;
        max = 95;
      } else {
        min = 78;
        max = 90;
      }
      
      const randomStrength = Math.floor(Math.random() * (max - min + 1)) + min;
      
      setGlobalSignalStrength(randomStrength);
      
      // Update via API
      try {
        await fetch("/api/admin/signal-strength", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalStrength: randomStrength }),
        });
      } catch (error) {
        console.error("Auto-mode update failed:", error);
      }
    };

    // Fluctuate every 5 seconds
    const interval = setInterval(fluctuateSignal, 5000);
    return () => clearInterval(interval);
  }, [isAutoMode, isStrongMode, isModerateMode, isWeakMode]);

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
      fetchSignalStrength();
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
        // Crypto deposit: Admin entered fiat amount in USER's preferred currency, convert to crypto
        const cryptoPrice = prices[cryptoAsset]?.price || 0;
        if (cryptoPrice > 0) {
          // The input is in user's preferred currency, convert to USD
          const userCurrency = selectedUser?.preferredCurrency || "USD";
          const userRate = exchangeRates[userCurrency] || 1;
          const amountInUSD = userCurrency === "USD" ? amountNum : amountNum / userRate;
          cryptoAmount = amountInUSD / cryptoPrice; // Convert USD to crypto
          finalAmount = amountInUSD;
          // amountInUserCurrency IS the input since admin entered it in user's currency
          amountInUserCurrency = Math.round(amountNum * 100) / 100;
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
          fiatAmount:
            depositType === "crypto"
              ? `${getCurrencySymbol(userCurr)}${amountInUserCurrency.toFixed(2)} ${userCurr}`
              : undefined,
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
    {
      id: "transactions",
      name: "Transaction History",
      icon: <History size={20} />,
    },
    { id: "analytics", name: "Analytics", icon: <TrendingUp size={20} /> },
    { id: "signal", name: "Signal Strength", icon: <Activity size={20} /> },
  ];

  return (
    <div className={`min-h-screen px-3 py-4 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white" : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}>
      {/* Popup Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
          <div
            className={`p-4 rounded-lg border shadow-lg ${
              notificationType === "success"
                ? isDark ? "bg-green-900/90 border-green-500/50 text-green-400" : "bg-green-50 border-green-500/50 text-green-600"
                : isDark ? "bg-red-900/90 border-red-500/50 text-red-400" : "bg-red-50 border-red-500/50 text-red-600"
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
        <div className="fixed top-4 right-4 z-[9998] animate-slide-in">
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
              <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
          <div className={`rounded-xl p-2 sm:p-3 border -mx-1 sm:mx-0 ${isDark ? "bg-gray-800/50 border-gray-700/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "bg-white border-gray-200 shadow-[0_0_20px_rgba(59,130,246,0.15)]"}`}>
            <div className="space-y-2">
              {/* Process Manual Payment */}
              <button
                onClick={() => {
                  setShowPaymentModal(true);
                  fetchUsers();
                }}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.25),0_0_30px_rgba(34,197,94,0.4)]"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Manual Payment
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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

              {/* Manual Trade Profit */}
              <button
                onClick={() => setShowManualProfitModal(true)}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.25),0_0_30px_rgba(251,191,36,0.4)]"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #fbbf2440, 0 2px 8px #fbbf2460, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <TrendingUp
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Manual Trade Profit
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Add profits to user accounts
                    </span>
                  </div>
                </div>
                <div className="text-amber-400">
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
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Manage Users
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Deleted Users Bin
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      KYC Verification
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Analytics Dashboard
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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

              {/* Withdrawals Management */}
              <button
                onClick={() => router.push("/admin/withdrawals")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(220,38,38,0.25),0_0_30px_rgba(220,38,38,0.4)]"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                    style={{
                      boxShadow:
                        "0 4px 16px #dc262640, 0 2px 8px #dc262660, inset 0 1px 2px rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <Wallet
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Withdrawals
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Approve user withdrawals
                    </span>
                  </div>
                </div>
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
              </button>

              {/* Transaction History */}
              <button
                onClick={() => setActiveTab("transactions")}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.25),0_0_30px_rgba(99,102,241,0.4)]"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Transaction History
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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

              {/* Signal Strength */}
              <button
                onClick={() => setShowSignalModal(true)}
                className="relative w-full flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.25),0_0_30px_rgba(34,197,94,0.4)]"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                    : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                  boxShadow: isDark
                    ? "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                    : "0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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
                    <Activity
                      className="relative z-10 drop-shadow-lg text-white"
                      size={20}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Signal Strength
                    </span>
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Control platform signal
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className={`border rounded-lg p-3 sm:p-6 ${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <BarChart3 className="text-blue-400" size={20} />
                <span>System Overview</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Server Status:</span>
                  <span className="text-green-400 font-medium">
                    {systemStats.serverStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Database:</span>
                  <span className="text-green-400 font-medium">
                    {systemStats.databaseStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Last Backup:</span>
                  <span className={isDark ? "text-gray-300" : "text-gray-900"}>
                    {systemStats.lastBackup}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Total Transactions:</span>
                  <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                    {systemStats.totalTransactions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Active Users:</span>
                  <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-900"}`}>
                    {systemStats.activeUsers}
                  </span>
                </div>
              </div>
            </div>

            <div className={`border rounded-lg p-3 sm:p-6 ${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <AlertTriangle className="text-yellow-400" size={20} />
                <span>Recent Alerts</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                {pendingKycCount > 0 && (
                  <div
                    className="text-orange-500 font-medium cursor-pointer hover:text-orange-400 transition-colors"
                    onClick={() => (window.location.href = "/admin/kyc")}
                  >
                    • Pending KYC verifications: {pendingKycCount}
                  </div>
                )}
                {systemStats.recentDeposits > 0 && (
                  <div className={`font-medium ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                    • Recent deposits: {systemStats.recentDeposits} (last hour)
                  </div>
                )}
                {systemStats.failedLogins > 0 && (
                  <div className={`font-medium ${isDark ? "text-red-400" : "text-red-600"}`}>
                    • Failed login attempts: {systemStats.failedLogins}
                  </div>
                )}
                {systemStats.newRegistrations > 0 && (
                  <div className={`font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    • New user registrations: {systemStats.newRegistrations}{" "}
                    (today)
                  </div>
                )}
                {systemStats.lastBackup !== "Loading..." && (
                  <div className={`font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
                    • System backup completed
                  </div>
                )}
                {pendingKycCount === 0 &&
                  systemStats.recentDeposits === 0 &&
                  systemStats.failedLogins === 0 &&
                  systemStats.newRegistrations === 0 && (
                    <div className={isDark ? "text-gray-400" : "text-gray-600"}>• No recent alerts</div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          {/* User Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setShowUserStatsModal("total")}
              className={`border rounded-xl p-4 transition-all text-left ${isDark ? "bg-gradient-to-b from-gray-700/60 to-gray-800/80 border-gray-600/50 hover:from-gray-700/80 hover:to-gray-800 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 hover:from-gray-50 hover:to-gray-100 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.1)]"} hover:translate-y-0.5 active:translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Total Users
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {totalUsers}
                  </p>
                </div>
                <Users className="text-blue-400" size={24} />
              </div>
            </button>

            <button
              onClick={() => setShowUserStatsModal("admin")}
              className={`border rounded-xl p-4 transition-all text-left ${isDark ? "bg-gradient-to-b from-gray-700/60 to-gray-800/80 border-gray-600/50 hover:from-gray-700/80 hover:to-gray-800 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 hover:from-gray-50 hover:to-gray-100 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.1)]"} hover:translate-y-0.5 active:translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
              className={`border rounded-xl p-4 transition-all text-left ${isDark ? "bg-gradient-to-b from-gray-700/60 to-gray-800/80 border-gray-600/50 hover:from-gray-700/80 hover:to-gray-800 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 hover:from-gray-50 hover:to-gray-100 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.1)]"} hover:translate-y-0.5 active:translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
              className={`border rounded-xl p-4 transition-all text-left ${isDark ? "bg-gradient-to-b from-gray-700/60 to-gray-800/80 border-gray-600/50 hover:from-gray-700/80 hover:to-gray-800 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 hover:from-gray-50 hover:to-gray-100 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.1)]"} hover:translate-y-0.5 active:translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
          {/* Back Button */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          {/* Bin Stats - Compact */}
          <div className={`border rounded-xl p-4 ${isDark ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
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
          <div className={`border rounded-xl p-2 ${isDark ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
            {deletedUsers.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 className={`mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-400"}`} size={36} />
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No deleted users in bin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deletedUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className={`rounded-xl p-2.5 transition-all border ${isDark ? "bg-gradient-to-b from-gray-700/40 to-gray-800/60 hover:from-gray-700/60 hover:to-gray-800/80 border-gray-600/40 shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_1px_0_0_#1f2937,0_2px_4px_rgba(0,0,0,0.25)]" : "bg-gradient-to-b from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border-gray-200 shadow-[0_3px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_1px_0_0_#e5e7eb,0_2px_4px_rgba(0,0,0,0.08)]"} hover:translate-y-0.5`}
                  >
                    {/* Row 1: Email + Delete */}
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.email}
                      </p>
                      <button
                        onClick={() =>
                          handlePermanentDelete(
                            user.id,
                            user.email || "Unknown"
                          )
                        }
                        disabled={loading}
                        className="bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white disabled:opacity-50 flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded shadow-[0_1px_0_0_#991b1b] hover:shadow-[0_0.5px_0_0_#991b1b] active:shadow-none active:translate-y-0.5 transition-all font-medium"
                        title="Delete Forever"
                      >
                        <Trash2 size={8} />
                        Delete
                      </button>
                    </div>
                    {/* Row 2: Name + Role + Restore */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {user.name || "No name"}
                        </p>
                        <span
                          className={`px-1 rounded text-[8px] font-medium leading-tight ${
                            user.role === "ADMIN"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleRestoreUser(
                            user.id,
                            user.email || "Unknown"
                          )
                        }
                        disabled={loading}
                        className="bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white disabled:opacity-50 flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded shadow-[0_1px_0_0_#166534] hover:shadow-[0_0.5px_0_0_#166534] active:shadow-none active:translate-y-0.5 transition-all font-medium"
                        title="Restore User"
                      >
                        <ArrowLeft size={8} />
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deletedUsers.length > 0 && (
              <div className="mt-3 p-2 bg-gradient-to-b from-yellow-500/15 to-yellow-600/10 border border-yellow-500/40 rounded-xl text-xs shadow-[0_2px_0_0_#ca8a04,0_3px_6px_rgba(202,138,4,0.2)]">
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
        <div className={`fixed inset-0 z-50 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}>
          {/* Sticky Header Background */}
          <div className={`sticky top-0 z-10 border-b px-2 xs:px-3 sm:px-4 lg:px-6 py-3 pt-14 ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <h1 className="text-base xs:text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen"
          >
            {/* Modal Content */}
            <div className="w-full px-2 xs:px-3 sm:px-4 lg:px-6 mt-6 sm:mt-8">
              {/* Admin Header */}
              <div className="mb-2 xs:mb-3 sm:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div>
                      <h1 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        Manual Payment
                      </h1>
                      <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Complete administrative dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedUser(null);
                  }}
                  className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </button>

                {/* User Selection */}
                {!selectedUser && (
                  <div className={`border rounded-xl p-3 sm:p-4 mb-2 ${isDark ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                      <Users className="text-blue-400" size={24} />
                      <span>Select User</span>
                    </h3>
                  <div className="max-h-96 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2">
                    {users.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        No users available
                      </p>
                    ) : (
                      users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={`w-full p-3 sm:p-4 rounded-xl border transition-all text-left hover:translate-y-0.5 active:translate-y-1 ${isDark ? "bg-gradient-to-b from-gray-700/40 to-gray-800/60 border-gray-600/40 hover:from-gray-700/60 hover:to-gray-800/80 hover:border-orange-500/50 shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_1px_0_0_#1f2937,0_2px_4px_rgba(0,0,0,0.25)] active:shadow-none" : "bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200 hover:from-white hover:to-gray-50 hover:border-orange-500/50 shadow-[0_3px_0_0_#e5e7eb,0_4px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_1px_0_0_#e5e7eb,0_2px_4px_rgba(0,0,0,0.08)] active:shadow-none"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm sm:text-base truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                {user.email}
                              </p>
                              <p className={`text-xs sm:text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {user.name || "No name"}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                                user.role === "ADMIN"
                                  ? "bg-green-500/20 text-green-400"
                                  : user.role === "STAFF_ADMIN"
                                  ? "bg-green-500/20 text-green-400"
                                  : isDark ? "bg-gray-500/20 text-gray-400" : "bg-gray-200 text-gray-600"
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
                  <>
                    {/* Back to User Selection Button */}
                    <button
                      onClick={() => setSelectedUser(null)}
                      className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                    >
                      <ArrowLeft size={20} />
                      <span className="text-sm font-medium">Back to User Selection</span>
                    </button>

                    {/* Manual Top-up Section */}
                    <div className={`border rounded-xl p-4 ${isDark ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]" : "bg-gradient-to-b from-white to-gray-50 border-gray-200 shadow-[0_4px_0_0_#e5e7eb,0_6px_12px_rgba(0,0,0,0.1)]"}`}>
                      <h3 className={`text-base xs:text-lg font-bold mb-4 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        <Wallet className="text-green-400" size={20} />
                        <span>Manual Payment Processing</span>
                      </h3>

                    {/* Main Deposit Type Selection */}
                    <div className="mb-3 xs:mb-4">
                      <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Deposit Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setDepositType("fiat");
                            setPaymentMethodType("traditional");
                          }}
                          className={`p-2.5 xs:p-3 rounded-xl border-2 transition-all ${
                            depositType === "fiat"
                              ? "bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500 shadow-[0_3px_0_0_#166534,0_4px_8px_rgba(34,197,94,0.3)] active:shadow-none active:translate-y-1"
                              : isDark
                              ? "bg-gradient-to-b from-gray-700/40 to-gray-800/60 border-gray-600/50 hover:border-gray-500 shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_1px_0_0_#1f2937,0_2px_4px_rgba(0,0,0,0.2)] hover:translate-y-0.5 active:shadow-none active:translate-y-1"
                              : "bg-gray-100 border-gray-300 hover:border-gray-400 shadow-[0_3px_0_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.1)] hover:translate-y-0.5 active:shadow-none active:translate-y-1"
                          }`}
                        >
                          <DollarSign
                            className={`w-5 h-5 xs:w-6 xs:h-6 mx-auto mb-1 ${
                              depositType === "fiat"
                                ? "text-green-400"
                                : isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-xs xs:text-sm font-bold block ${
                              depositType === "fiat"
                                ? "text-green-400"
                                : isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Deposit Fiat
                          </span>
                        </button>
                        <button
                          onClick={() => setDepositType("crypto")}
                          className={`p-2.5 xs:p-3 rounded-xl border-2 transition-all ${
                            depositType === "crypto"
                              ? "bg-gradient-to-br from-orange-500/20 to-purple-500/20 border-orange-500 shadow-[0_3px_0_0_#c2410c,0_4px_8px_rgba(249,115,22,0.3)] active:shadow-none active:translate-y-1"
                              : isDark
                              ? "bg-gradient-to-b from-gray-700/40 to-gray-800/60 border-gray-600/50 hover:border-gray-500 shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_1px_0_0_#1f2937,0_2px_4px_rgba(0,0,0,0.2)] hover:translate-y-0.5 active:shadow-none active:translate-y-1"
                              : "bg-gray-100 border-gray-300 hover:border-gray-400 shadow-[0_3px_0_0_#d1d5db,0_4px_8px_rgba(0,0,0,0.1)] hover:translate-y-0.5 active:shadow-none active:translate-y-1"
                          }`}
                        >
                          <Wallet
                            className={`w-5 h-5 xs:w-6 xs:h-6 mx-auto mb-1 ${
                              depositType === "crypto"
                                ? "text-orange-400"
                                : isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-xs xs:text-sm font-bold block ${
                              depositType === "crypto"
                                ? "text-orange-400"
                                : isDark ? "text-gray-400" : "text-gray-500"
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
                          <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Selected User:
                          </p>
                          <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                            {selectedUser.email}
                          </p>
                        </div>

                        {/* Fiat Deposit Options */}
                        {depositType === "fiat" && (
                          <>
                            <div>
                              <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                                      : isDark ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  }`}
                                >
                                  Traditional
                                </button>
                                <button
                                  onClick={() => setPaymentMethodType("crypto")}
                                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                    paymentMethodType === "crypto"
                                      ? "bg-blue-500 text-white"
                                      : isDark ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
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
                                      className={`w-full p-2.5 border rounded-lg transition-all text-left flex items-center gap-2.5 ${isDark ? "bg-gray-700/30 hover:bg-gray-700/50 border-gray-600/30 hover:border-blue-500/50" : "bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-400"}`}
                                    >
                                      <span className="text-lg">
                                        {method.icon}
                                      </span>
                                      <span className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {method.name}
                                      </span>
                                    </button>
                                  ))
                                ) : (
                                  <div className="relative">
                                    <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                      Select Cryptocurrency
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowCryptoDropdown(
                                          !showCryptoDropdown
                                        )
                                      }
                                      className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex items-center justify-between transition-all ${isDark ? "bg-gray-700/50 border-gray-600/50 hover:border-orange-500/50 text-white" : "bg-gray-100 border-gray-300 hover:border-orange-400 text-gray-900"}`}
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
                                            {convertCurrency(
                                              prices[cryptoAsset]?.price || 0,
                                              selectedUser?.preferredCurrency || "USD",
                                              exchangeRates
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
                                      <div className={`absolute top-full left-0 right-0 mt-2 border rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                                        isDark
                                          ? "bg-gray-800 border-gray-700"
                                          : "bg-white border-gray-300"
                                      }`}>
                                        {cryptoPaymentMethods.map((method) => {
                                          const cryptoPrice =
                                            prices[method.name];
                                          const priceUSD = cryptoPrice?.price || 0;
                                          const price = convertCurrency(
                                            priceUSD,
                                            selectedUser?.preferredCurrency || "USD",
                                            exchangeRates
                                          );
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
                                                  <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
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
                                                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
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
                            <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              Select Cryptocurrency
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setShowCryptoDropdown(!showCryptoDropdown)
                              }
                              className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex items-center justify-between transition-all ${isDark ? "bg-gray-700/50 border-gray-600/50 hover:border-orange-500/50 text-white" : "bg-gray-100 border-gray-300 hover:border-orange-400 text-gray-900"}`}
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
                                    {convertCurrency(
                                      prices[cryptoAsset]?.price || 0,
                                      selectedUser?.preferredCurrency || "USD",
                                      exchangeRates
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
                                className={`absolute top-full left-0 right-0 mt-2 backdrop-blur-sm border rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 py-4 pb-6 ${
                                  isDark
                                    ? "bg-gray-900/95 border-gray-700/50"
                                    : "bg-white/95 border-gray-300/50"
                                }`}
                                style={{ perspective: "1000px" }}
                              >
                                {cryptoAssets.map((asset, index) => {
                                  const cryptoPrice = prices[asset.symbol];
                                  const priceUSD = cryptoPrice?.price || 0;
                                  const price = convertCurrency(
                                    priceUSD,
                                    selectedUser?.preferredCurrency || "USD",
                                    exchangeRates
                                  );
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
                                        scale: 1.05,
                                        z: 50,
                                        rotateY: 2,
                                        zIndex: 999,
                                        transition: { duration: 0.2 },
                                      }}
                                      onClick={() => {
                                        setCryptoAsset(asset.symbol);
                                        setShowCryptoDropdown(false);
                                      }}
                                      className={`w-full p-2.5 mb-2.5 flex items-center gap-2.5 rounded-xl transition-all relative group overflow-hidden ${
                                        isSelected
                                          ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-2 border-orange-500/60 shadow-lg shadow-orange-500/20"
                                          : isDark
                                          ? "bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700/50 hover:border-gray-600 hover:shadow-xl"
                                          : "bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md"
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
                                            : isDark ? "bg-gradient-to-br from-gray-700/20 to-transparent group-hover:from-gray-600/30" : "bg-gradient-to-br from-gray-200/30 to-transparent"
                                        }`}
                                        style={{
                                          transform: "translateZ(-10px)",
                                        }}
                                      />

                                      {/* Shine Effect */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                      <div
                                        className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center ${
                                          isSelected
                                            ? "bg-orange-500/20 shadow-lg shadow-orange-500/20"
                                            : isDark ? "bg-gray-700/50 group-hover:bg-gray-600/50" : "bg-gray-200/80 group-hover:bg-gray-300/80"
                                        }`}
                                        style={{
                                          transform: "translateZ(15px)",
                                        }}
                                      >
                                        <CryptoIcon
                                          symbol={asset.symbol}
                                          className="w-5 h-5"
                                        />
                                      </div>

                                      <div
                                        className="flex-1 text-left relative z-10"
                                        style={{
                                          transform: "translateZ(10px)",
                                        }}
                                      >
                                        <div className="flex items-center justify-between mb-0.5">
                                          <div className="flex items-center gap-2">
                                            <p className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                                              {asset.symbol}
                                            </p>
                                            <span
                                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
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
                                              className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
                                              style={{
                                                transform: "translateZ(20px)",
                                              }}
                                            >
                                              <Check className="w-3 h-3 text-white" />
                                            </motion.div>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <p className={`text-[10px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {asset.name}
                                          </p>
                                          <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
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
                                            : isDark ? "bg-gradient-to-r from-gray-700/40 via-gray-600/40 to-gray-700/40" : "bg-gradient-to-r from-gray-200/60 via-gray-300/60 to-gray-200/60"
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
                        <div className="mt-6">
                          <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                                      : isDark ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                  }`}
                                >
                                  {selectedUser?.preferredCurrency || "USD"}
                                </button>
                                <button
                                  onClick={() => setAmountInputType("crypto")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    amountInputType === "crypto"
                                      ? "bg-green-500 text-white"
                                      : isDark ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
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
                                    : isDark ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                }`}
                              >
                                {selectedUser?.preferredCurrency || "USD"} Value
                              </button>
                              <button
                                onClick={() => setAmountInputType("crypto")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  amountInputType === "crypto"
                                    ? "bg-orange-500 text-white"
                                    : isDark ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
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
                            className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${isDark ? "bg-gray-700/50 border-gray-600/50 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
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
                        <div className="mt-4">
                          <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Notification Message
                          </label>
                          <textarea
                            value={notificationMessage}
                            onChange={(e) =>
                              setNotificationMessage(e.target.value)
                            }
                            className={`w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] ${isDark ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40 text-white" : "bg-gray-100 border-gray-300 text-gray-900"}`}
                            placeholder="Optional note for the user..."
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className={`p-3 rounded-xl border shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)] ${isDark ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40" : "bg-gray-100 border-gray-300"}`}>
                          <h4 className={`font-semibold mb-2 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                            Transaction Summary
                          </h4>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className={isDark ? "text-gray-400" : "text-gray-500"}>Type:</span>
                              <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                {depositType === "fiat"
                                  ? "Fiat Deposit"
                                  : "Crypto Deposit"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDark ? "text-gray-400" : "text-gray-500"}>Method:</span>
                              <span className={`capitalize ${isDark ? "text-white" : "text-gray-900"}`}>
                                {depositType === "fiat"
                                  ? paymentMethodType === "crypto"
                                    ? `${cryptoAsset} (→ Fiat)`
                                    : "Traditional"
                                  : `${cryptoAsset} Asset`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDark ? "text-gray-400" : "text-gray-500"}>Amount:</span>
                              <span className="font-semibold text-green-400">
                                {depositType === "fiat"
                                  ? `${amount || "0"} ${
                                      selectedUser?.preferredCurrency || "USD"
                                    }`
                                  : amountInputType === "usd"
                                  ? `${amount || "0"} ${selectedUser?.preferredCurrency || "USD"}`
                                  : `${amount || "0"} ${cryptoAsset}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDark ? "text-gray-400" : "text-gray-500"}>User:</span>
                              <span className={`truncate max-w-[180px] ${isDark ? "text-white" : "text-gray-900"}`}>
                                {selectedUser.email}
                              </span>
                            </div>
                            <div className={`flex justify-between pt-2 mt-2 border-t ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
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
                              ? isDark ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-400"
                              : isDark ? "bg-orange-900/20 border-orange-700" : "bg-orange-50 border-orange-400"
                          }`}
                        >
                          <p
                            className={`text-[10px] leading-relaxed ${
                              depositType === "fiat"
                                ? isDark ? "text-green-300" : "text-green-700"
                                : isDark ? "text-orange-300" : "text-orange-700"
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
                      <div className={`rounded-lg p-6 max-w-md w-full border border-yellow-500/30 ${
                        isDark ? "bg-gray-800" : "bg-white"
                      }`}>
                        <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                          <AlertCircle size={24} />
                          Asset Not Found
                        </h3>
                        <p className={`mb-4 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}>
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
                </>
              )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === "transactions" && <TransactionHistoryView setActiveTab={setActiveTab} isDark={isDark} />}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className={`border rounded-lg p-6 ${
            isDark
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center space-x-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <BarChart3 className="text-blue-400" />
              <span>Platform Analytics</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-lg p-4 ${
                isDark ? "bg-gray-700/30" : "bg-gray-100"
              }`}>
                <h4 className="text-lg font-semibold text-blue-400 mb-2">
                  User Growth
                </h4>
                <p className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>+24%</p>
                <p className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>This month</p>
              </div>
              <div className={`rounded-lg p-4 ${
                isDark ? "bg-gray-700/30" : "bg-gray-100"
              }`}>
                <h4 className="text-lg font-semibold text-green-400 mb-2">
                  Trading Volume
                </h4>
                <p className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>$2.4M</p>
                <p className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>Last 30 days</p>
              </div>
              <div className={`rounded-lg p-4 ${
                isDark ? "bg-gray-700/30" : "bg-gray-100"
              }`}>
                <h4 className="text-lg font-semibold text-purple-400 mb-2">
                  Revenue
                </h4>
                <p className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>$48.2K</p>
                <p className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>Monthly</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Tab */}

      {/* Notifications Tab */}
      {/* Edit User Role Modal - Responsive Web UI */}
      {editingUser && mounted && ReactDOM.createPortal(
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[300] overflow-y-auto min-h-screen w-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
          {/* Spacer for dashboard header */}
          <div className="h-14 sm:h-[72px]" />

          {/* Back button */}
          <div className="max-w-md mx-auto px-4 pt-4 pb-2">
            <button
              onClick={() => setEditingUser(null)}
              className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Card */}
          <div className="max-w-md mx-auto px-4 pb-8">
            <div className={`rounded-2xl shadow-2xl w-full overflow-hidden border ${
              isDark
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}>
              {/* Modal Header */}
              <div className={`bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-b px-4 py-3 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <Settings className="w-5 h-5 text-orange-400" />
                  Edit User Role
                </h3>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                {/* User Info */}
                <div className={`rounded-lg p-3 border ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-gray-100 border-gray-200"
                }`}>
                  <p className={`text-xs mb-0.5 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>User</p>
                  <p className={`font-semibold text-sm truncate ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {editingUser.email}
                  </p>
                  {editingUser.name && (
                    <p className={`text-xs ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {editingUser.name}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Select Role
                  </label>
                  <div className="space-y-1.5">
                    {/* USER Role */}
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:border-orange-500/50 group ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            newRole === "USER"
                              ? "border-orange-500 bg-orange-500"
                              : isDark
                              ? "border-gray-600 group-hover:border-orange-500/50"
                              : "border-gray-400 group-hover:border-orange-500/50"
                          }`}
                        >
                          {newRole === "USER" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>User</p>
                          <p className={`text-[10px] ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
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
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:border-orange-500/50 group ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            newRole === "ADMIN"
                              ? "border-orange-500 bg-orange-500"
                              : isDark
                              ? "border-gray-600 group-hover:border-orange-500/50"
                              : "border-gray-400 group-hover:border-orange-500/50"
                          }`}
                        >
                          {newRole === "ADMIN" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>Admin</p>
                          <p className={`text-[10px] ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
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
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:border-orange-500/50 group ${
                      isDark
                        ? "bg-gray-800/50 hover:bg-gray-800 border-gray-700"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            newRole === "STAFF_ADMIN"
                              ? "border-orange-500 bg-orange-500"
                              : isDark
                              ? "border-gray-600 group-hover:border-orange-500/50"
                              : "border-gray-400 group-hover:border-orange-500/50"
                          }`}
                        >
                          {newRole === "STAFF_ADMIN" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}>Staff Admin</p>
                          <p className={`text-[10px] ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
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
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handleUpdateUserRole(editingUser.id, newRole)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Update Role
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    disabled={loading}
                    className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Stats Modal */}
      {showUserStatsModal && (
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[100] overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
          {/* Spacer for dashboard header */}
          <div className="h-14 sm:h-[72px]" />

          {/* Back button */}
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
            <button
              onClick={() => setShowUserStatsModal(null)}
              className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Users List */}
          <div className="max-w-4xl mx-auto px-4 pb-8">
            <h2 className={`text-lg font-bold flex items-center gap-2 mb-4 px-1 ${isDark ? "text-white" : "text-gray-900"}`}>
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
                        className={`border rounded-xl p-3 transition-all ${
                          selectedUser?.id === user.id
                            ? isDark
                              ? "bg-gradient-to-b from-orange-500/30 to-orange-600/20 border-orange-500/50 shadow-[0_3px_0_0_#c2410c,0_4px_8px_rgba(0,0,0,0.3)]"
                              : "bg-orange-50 border-orange-400 shadow-sm"
                            : isDark
                            ? "bg-gradient-to-b from-gray-700/50 to-gray-800/70 border-gray-600/40 hover:from-gray-700/70 hover:to-gray-800/90 shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_1px_0_0_#1f2937,0_2px_4px_rgba(0,0,0,0.3)] hover:translate-y-0.5"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-sm"
                        } ${user.role === "USER" ? "cursor-pointer active:shadow-none active:translate-y-1" : ""}`}
                        onClick={() =>
                          user.role === "USER" &&
                          setSelectedUser(
                            selectedUser?.id === user.id ? null : user
                          )
                        }
                      >
                        {/* Top row: Badge and action buttons */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                              user.role === "ADMIN"
                                ? "bg-green-500 text-white"
                                : user.role === "STAFF_ADMIN"
                                ? "bg-blue-500 text-white"
                                : isDark
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {user.role}
                          </span>
                          {/* Admin action buttons - hide for origin admin */}
                          {!user.isOriginAdmin && (
                            <div className="flex items-center space-x-2">
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
                                className={`flex items-center gap-1 transition-colors text-[10px] font-medium ${isDark ? "text-gray-300 hover:text-orange-400" : "text-gray-600 hover:text-orange-500"}`}
                                title="Edit Role"
                              >
                                <Settings size={12} />
                                <span>Settings</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(
                                    user.id,
                                    user.email || "Unknown"
                                  );
                                }}
                                className={`flex items-center gap-1 transition-colors text-[10px] font-medium ${isDark ? "text-gray-300 hover:text-red-400" : "text-gray-600 hover:text-red-500"}`}
                                title="Delete User"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                        {/* User details */}
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                            {user.email}
                          </p>
                          <p className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {user.name || "No name"}
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Account: {user.accountType}
                          </p>
                          {user.adminViewPassword && (
                            <p className={`text-xs font-mono font-medium ${isDark ? "text-orange-300" : "text-orange-600"}`}>
                              Password: {user.adminViewPassword}
                            </p>
                          )}
                          {user.assignedStaffId && (
                            <p className={`text-xs font-medium mt-1 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                              Assigned to staff admin
                            </p>
                          )}
                        </div>
                        {/* Show Assign to Staff Admin when user is selected */}
                        {selectedUser?.id === user.id &&
                          user.role === "USER" &&
                          !user.isOriginAdmin && (
                            <div className={`mt-3 pt-3 border-t space-y-2 ${isDark ? "border-gray-600/50" : "border-gray-200"}`}>
                              <label className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
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
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                      No users found in this category
                    </p>
                  </div>
                )}
          </div>
        </div>
      )}

      {/* Signal Strength Control Modal */}
      {showSignalModal && mounted && (
        <div
          className={`fixed top-0 left-0 right-0 bottom-0 z-[100] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDark
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
              : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
          }`}
        >
          {/* Top spacer to clear the dashboard header */}
          <div className="h-14 sm:h-[72px]" />

          {/* Admin Control Panel title */}
          <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
            <div className="mb-1">
              <h1 className="text-base xs:text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Complete administrative dashboard
              </p>
              <button
                onClick={() => setShowSignalModal(false)}
                className={`flex items-center gap-2 transition-colors p-2 rounded-lg mt-1 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Platform Signal heading */}
          <div className="max-w-lg mx-auto px-4 pb-2">
            <h2 className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <Activity className="text-green-400" size={16} />
              Platform Signal
            </h2>
          </div>

          {/* Content */}
          <div className="max-w-lg mx-auto px-4 pb-6 space-y-4">
            {/* Current Signal Display */}
            <div className={`border rounded-xl p-4 ${
              isDark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Current Signal Strength
              </h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {globalSignalStrength >= 75 ? "Strong" : globalSignalStrength >= 50 ? "Moderate" : "Weak"}
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    {globalSignalStrength}%
                  </span>
                </div>
                <div className={`relative h-3 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      globalSignalStrength >= 75
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : globalSignalStrength >= 50
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                        : "bg-gradient-to-r from-red-500 to-red-600"
                    }`}
                    style={{ width: `${globalSignalStrength}%` }}
                  />
                </div>
              </div>
              <div className={`rounded-lg p-3 ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {globalSignalStrength >= 75
                    ? "🟢 Strong signal - Optimal trading conditions for all users"
                    : globalSignalStrength >= 50
                    ? "🟡 Moderate signal - Good trading conditions with some variations"
                    : "🔴 Weak signal - Conservative trading conditions"}
                </p>
              </div>
            </div>

            {/* Signal Control Slider */}
            <div className={`border rounded-xl p-4 ${
              isDark ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Adjust Signal Strength
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={globalSignalStrength}
                  onChange={(e) => {
                    setGlobalSignalStrength(Number(e.target.value));
                    setIsAutoMode(false);
                    setIsStrongMode(false);
                    setIsModerateMode(false);
                    setIsWeakMode(false);
                  }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, 
                      ${globalSignalStrength >= 75 ? "#22c55e" : globalSignalStrength >= 50 ? "#eab308" : "#ef4444"} 0%, 
                      ${globalSignalStrength >= 75 ? "#22c55e" : globalSignalStrength >= 50 ? "#eab308" : "#ef4444"} ${globalSignalStrength}%, 
                      ${isDark ? "#4b5563" : "#d1d5db"} ${globalSignalStrength}%, 
                      ${isDark ? "#4b5563" : "#d1d5db"} 100%)`
                  }}
                />
                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      const newWeakMode = !isWeakMode;
                      setIsAutoMode(false); setIsStrongMode(false); setIsModerateMode(false);
                      setIsWeakMode(newWeakMode);
                      if (newWeakMode) setGlobalSignalStrength(56);
                    }}
                    className={`border-2 py-2 px-1 rounded-lg transition-all font-semibold text-[10px] leading-tight ${
                      isWeakMode
                        ? isDark ? "bg-red-500/30 border-red-500/60 text-red-300" : "bg-red-200 border-red-500 text-red-700"
                        : isDark ? "bg-red-500/20 border-red-500/40 hover:bg-red-500/30 text-red-400" : "bg-red-100 border-red-400 hover:bg-red-200 text-red-700"
                    }`}
                  >
                    <div>{isWeakMode ? "Weak ✓" : "Weak"}</div>
                    <div className="text-[9px]">(45-68%)</div>
                  </button>
                  <button
                    onClick={() => {
                      const newModerateMode = !isModerateMode;
                      setIsAutoMode(false); setIsStrongMode(false); setIsWeakMode(false);
                      setIsModerateMode(newModerateMode);
                      if (newModerateMode) setGlobalSignalStrength(71);
                    }}
                    className={`border-2 py-2 px-1 rounded-lg transition-all font-semibold text-[10px] leading-tight ${
                      isModerateMode
                        ? isDark ? "bg-yellow-500/30 border-yellow-500/60 text-yellow-300" : "bg-yellow-200 border-yellow-500 text-yellow-800"
                        : isDark ? "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30 text-yellow-400" : "bg-yellow-100 border-yellow-400 hover:bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    <div>{isModerateMode ? "Moderate ✓" : "Moderate"}</div>
                    <div className="text-[9px]">(65-78%)</div>
                  </button>
                  <button
                    onClick={() => {
                      const newStrongMode = !isStrongMode;
                      setIsAutoMode(false); setIsModerateMode(false); setIsWeakMode(false);
                      setIsStrongMode(newStrongMode);
                      if (newStrongMode) setGlobalSignalStrength(91);
                    }}
                    className={`border-2 py-2 px-1 rounded-lg transition-all font-semibold text-[10px] leading-tight ${
                      isStrongMode
                        ? isDark ? "bg-green-500/30 border-green-500/60 text-green-300" : "bg-green-200 border-green-500 text-green-800"
                        : isDark ? "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-400" : "bg-green-100 border-green-400 hover:bg-green-200 text-green-800"
                    }`}
                  >
                    <div>{isStrongMode ? "Strong ✓" : "Strong"}</div>
                    <div className="text-[9px]">(88-95%)</div>
                  </button>
                  <button
                    onClick={() => {
                      const newAutoMode = !isAutoMode;
                      setIsStrongMode(false); setIsModerateMode(false); setIsWeakMode(false);
                      setIsAutoMode(newAutoMode);
                      if (newAutoMode) setGlobalSignalStrength(84);
                    }}
                    className={`border-2 py-2 px-1 rounded-lg transition-all font-semibold text-[10px] leading-tight ${
                      isAutoMode
                        ? isDark ? "bg-purple-500/30 border-purple-500/60 text-purple-300" : "bg-purple-200 border-purple-500 text-purple-800"
                        : isDark ? "bg-purple-500/20 border-purple-500/40 hover:bg-purple-500/30 text-purple-400" : "bg-purple-100 border-purple-400 hover:bg-purple-200 text-purple-800"
                    }`}
                  >
                    <div>{isAutoMode ? "Auto ✓" : "Auto"}</div>
                    <div className="text-[9px]">(78-90%)</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Impact Information */}
            <div className={`border rounded-xl p-3 ${
              isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-300"
            }`}>
              <div className="flex items-start space-x-2">
                <AlertCircle className={`flex-shrink-0 mt-0.5 ${isDark ? "text-blue-400" : "text-blue-600"}`} size={16} />
                <div className={`text-xs ${isDark ? "text-blue-300" : "text-blue-800"}`}>
                  <p className="font-semibold mb-1">Platform-wide Signal Control</p>
                  <p className={isDark ? "text-blue-200/80" : "text-blue-700"}>
                    Adjusting the signal strength affects all user dashboards and trading indicators.
                    Changes are applied immediately and synchronized across all active sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Apply / Cancel Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const mode = isWeakMode ? "weak" : isModerateMode ? "moderate" : isStrongMode ? "strong" : isAutoMode ? "auto" : "none";
                  updateSignalStrength(globalSignalStrength, mode);
                }}
                className={`flex-1 border-2 py-3 px-4 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 hover:border-green-500/60 text-green-400"
                    : "bg-green-100 border-green-400 hover:bg-green-200 text-green-700"
                }`}
              >
                <Check size={16} />
                Apply Changes
              </button>
              <button
                onClick={() => setShowSignalModal(false)}
                className={`py-3 px-6 rounded-xl transition-all font-semibold text-sm ${
                  isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-xl max-w-sm w-full shadow-2xl border border-green-500/30 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-2.5 sm:p-3 border-b sticky top-0 ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}>
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
              <div className={`rounded-lg p-2.5 sm:p-3 border ${
                isDark
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-300"
              }`}>
                <p className={`text-xs mb-0.5 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>Deposit Type</p>
                <p className={`text-sm sm:text-base font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {successDetails.type}
                </p>
              </div>

              {/* Amount */}
              <div className={`rounded-lg p-2.5 sm:p-3 border ${
                isDark
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-300"
              }`}>
                <p className={`text-xs mb-0.5 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>Amount</p>
                <p className="text-lg sm:text-xl font-bold text-green-400">
                  {successDetails.amount}
                </p>
                {successDetails.fiatAmount && (
                  <p className={`text-sm mt-0.5 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}>
                    ≈ {successDetails.fiatAmount}
                  </p>
                )}
              </div>

              {/* User */}
              <div className={`rounded-lg p-2.5 sm:p-3 border ${
                isDark
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-300"
              }`}>
                <p className={`text-xs mb-0.5 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>Credited To</p>
                <p className={`text-sm font-medium truncate ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {successDetails.userEmail}
                </p>
              </div>

              {/* Transaction Hash (if crypto) */}
              {successDetails.transactionHash && (
                <div className={`rounded-lg p-2.5 sm:p-3 border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-300"
                }`}>
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

      {/* Manual Profit Modal */}
      <ManualProfitModal
        isOpen={showManualProfitModal}
        onClose={() => setShowManualProfitModal(false)}
        onSuccess={() => {
          showPopupNotification("Manual profit added successfully", "success");
          fetchUsers();
        }}
      />
    </div>
  );
};

export default AdminDashboard;
