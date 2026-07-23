"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Activity,
  Cpu,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Users,
  BarChart2,
  Wallet,
  LogOut,
  FileText,
  Star,
  Shield,
  ChevronRight,
  Plus,
  X,
  Calculator,
  Server,
  Home,
  Gift,
  Menu,
  HelpCircle,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Download,
  ArrowRight,
  Info,
  Zap,
  CreditCard,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MiningContract {
  id: string;
  planName: string;
  coin: string;
  algorithm: string;
  hashrate: string;
  hashrateValue: number;
  hashrateUnit: string;
  price: number;
  currency: string;
  duration: number;
  status: string;
  startDate: string;
  endDate?: string;
  totalEarned: number;
}

interface MiningEarning {
  id: string;
  amount: number;
  currency: string;
  amountUsd?: number;
  date: string;
  status: string;
  MiningContract?: { planName: string; coin: string } | null;
}

interface MiningWithdrawal {
  id: string;
  amount: number;
  currency: string;
  amountUsd?: number;
  walletAddress?: string;
  destinationType: string;
  status: string;
  txHash?: string;
  createdAt: string;
}

interface MiningWallet {
  id: string;
  label: string;
  address: string;
  currency: string;
  isDefault: boolean;
}

interface DashboardData {
  activeContracts: number;
  totalHashrate: number;
  hashrateUnit: string;
  totalEarned: number;
  totalEarnedUsd: number;
  todayEarned: number;
  todayEarnedUsd: number;
  monthEarned: number;
  monthEarnedUsd: number;
  pendingWithdrawalAmount: number;
  pendingWithdrawalCount: number;
  contracts: MiningContract[];
  recentEarnings: MiningEarning[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  USDT: "#26A17B",
  LTC: "#9CA3AF",
  BNB: "#F3BA2F",
  XRP: "#00AAE4",
  SOL: "#9945FF",
  TRX: "#FF0013",
  TON: "#0098EA",
  BCH: "#8DC351",
  ETC: "#328332",
  USDC: "#2775CA",
  DOGE: "#C2A633",
  ADA: "#0033AD",
  AVAX: "#E84142",
  DOT: "#E6007A",
  MATIC: "#8247E5",
  LINK: "#2A5ADA",
};

const COIN_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  USDT: "₮",
  LTC: "Ł",
  BNB: "B",
  XRP: "✕",
  SOL: "◎",
  TRX: "T",
  TON: "💎",
  BCH: "₿",
  ETC: "Ξ",
  USDC: "$",
  DOGE: "Ð",
  ADA: "₳",
  AVAX: "A",
  DOT: "●",
  MATIC: "M",
  LINK: "⬡",
};

type TabId =
  | "dashboard"
  | "plans"
  | "earnings"
  | "overview"
  | "contracts"
  | "workers"
  | "statistics"
  | "withdraw"
  | "transactions"
  | "wallets"
  | "referral"
  | "security"
  | "account";

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Mining", icon: <Activity size={14} /> },
  { id: "earnings", label: "Earnings", icon: <DollarSign size={14} /> },
  { id: "overview", label: "Overview", icon: <BarChart2 size={14} /> },
  { id: "plans", label: "Buy Hashrate", icon: <Zap size={14} /> },
  { id: "contracts", label: "Contracts", icon: <FileText size={14} /> },
  { id: "workers", label: "Workers", icon: <Users size={14} /> },
  { id: "statistics", label: "Statistics", icon: <TrendingUp size={14} /> },
  { id: "withdraw", label: "Withdraw", icon: <Wallet size={14} /> },
  { id: "transactions", label: "Transactions", icon: <RefreshCw size={14} /> },
  { id: "wallets", label: "Wallets", icon: <Star size={14} /> },
  { id: "referral", label: "Referral", icon: <Gift size={14} /> },
  { id: "security", label: "Security", icon: <Shield size={14} /> },
  { id: "account", label: "Account", icon: <Settings size={14} /> },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function Sparkline({
  data,
  color = "#22C55E",
}: {
  data: number[];
  color?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 48},${18 - ((v - min) / range) * 14}`,
    )
    .join(" ");
  return (
    <svg width="48" height="18" viewBox="0 0 48 18">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  sub,
  change,
  positive,
  icon,
  iconBg,
  isDark,
  sparkData,
}: {
  title: string;
  value: string;
  sub: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  isDark: boolean;
  sparkData?: number[];
}) {
  return (
    <div
      className={`rounded-xl p-3 sm:p-4 border transition-all ${isDark ? "bg-gray-800 border-gray-700/60 hover:border-orange-500/30" : "bg-white border-gray-200 hover:border-orange-300"} shadow-sm`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 mr-2">
          <p
            className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {title}
          </p>
          <p
            className={`text-base sm:text-xl font-bold leading-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>
          <p
            className={`text-[10px] sm:text-xs mt-0.5 truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            ≈ {sub}
          </p>
        </div>
        <div className={`p-2 rounded-xl flex-shrink-0 ${iconBg}`}>{icon}</div>
      </div>
      <div className="flex items-center gap-1">
        {positive ? (
          <ArrowUpRight size={11} className="text-green-500 flex-shrink-0" />
        ) : (
          <ArrowDownRight size={11} className="text-red-500 flex-shrink-0" />
        )}
        <span
          className={`text-[10px] sm:text-xs font-semibold ${positive ? "text-green-500" : "text-red-500"}`}
        >
          {change}
        </span>
        <span
          className={`text-[10px] sm:text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          vs yesterday
        </span>
        {sparkData && (
          <span className="ml-auto">
            <Sparkline
              data={sparkData}
              color={positive ? "#22C55E" : "#EF4444"}
            />
          </span>
        )}
      </div>
    </div>
  );
}

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 9,
  color = "#22C55E",
  isDark,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  isDark: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isDark ? "#374151" : "#E5E7EB"}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

function CountdownTimer({ isDark }: { isDark: boolean }) {
  const [time, setTime] = useState({ h: 7, m: 45, s: 12 });
  useEffect(() => {
    const iv = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) {
          s = 59;
          m--;
        }
        if (m < 0) {
          m = 59;
          h--;
        }
        if (h < 0) {
          h = 23;
          m = 59;
          s = 59;
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  const padN = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1">
      {[padN(time.h), padN(time.m), padN(time.s)].map((val, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`text-center rounded px-1.5 py-0.5 min-w-[28px] ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
          >
            <span className="text-xs font-bold tabular-nums">{val}</span>
          </div>
          {i < 2 && (
            <span
              className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded text-gray-400 hover:text-orange-500 transition-colors"
    >
      {copied ? (
        <Check size={12} className="text-green-500" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
    INACTIVE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    PAUSED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    EXPIRED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    PAID: "bg-green-500/10 text-green-500 border-green-500/20",
    online: "bg-green-500/10 text-green-500 border-green-500/20",
    offline: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const cls = map[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20";
  return (
    <span
      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}
    >
      {status}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  isDark,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isDark: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
      >
        {icon}
      </div>
      <p
        className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </p>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {desc}
      </p>
    </div>
  );
}

// ─── Plan Definitions (mirrors API) ──────────────────────────────────────────

const MINING_PLANS_UI = [
  {
    id: "starter",
    name: "Starter",
    hashrate: "50 TH/s",
    price: 14999,
    duration: 30,
    dailyProfit: "0.03856 BTC (~$2,313)",
    popular: false,
    color: "#6B7280",
  },
  {
    id: "basic",
    name: "Basic",
    hashrate: "150 TH/s",
    price: 29999,
    duration: 60,
    dailyProfit: "0.04241 BTC (~$2,545)",
    popular: false,
    color: "#3B82F6",
  },
  {
    id: "standard",
    name: "Standard",
    hashrate: "500 TH/s",
    price: 49999,
    duration: 90,
    dailyProfit: "0.04665 BTC (~$2,799)",
    popular: false,
    color: "#8B5CF6",
  },
  {
    id: "professional",
    name: "Professional",
    hashrate: "1.5 PH/s",
    price: 99999,
    duration: 120,
    dailyProfit: "0.05132 BTC (~$3,079)",
    popular: true,
    color: "#F97316",
  },
  {
    id: "advanced",
    name: "Advanced",
    hashrate: "5 PH/s",
    price: 199999,
    duration: 180,
    dailyProfit: "0.05645 BTC (~$3,387)",
    popular: false,
    color: "#EF4444",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    hashrate: "15 PH/s",
    price: 499999,
    duration: 365,
    dailyProfit: "0.07903 BTC (~$4,742)",
    popular: false,
    color: "#F59E0B",
  },
];

const PURCHASE_CRYPTOS = [
  {
    id: "btc",
    label: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin",
  },
  {
    id: "eth",
    label: "Ethereum",
    symbol: "ETH",
    network: "Ethereum (ERC-20)",
  },
  {
    id: "etc",
    label: "Ethereum Classic",
    symbol: "ETC",
    network: "Ethereum Classic",
  },
  {
    id: "ltc",
    label: "Litecoin",
    symbol: "LTC",
    network: "Litecoin",
  },
  {
    id: "xrp",
    label: "Ripple",
    symbol: "XRP",
    network: "XRP Ledger",
  },
  {
    id: "usdcerc20",
    label: "USD Coin",
    symbol: "USDC",
    network: "Ethereum (ERC-20)",
  },
  {
    id: "ton",
    label: "Toncoin",
    symbol: "TON",
    network: "TON Network",
  },
  {
    id: "trx",
    label: "Tron",
    symbol: "TRX",
    network: "Tron (TRC-20)",
  },
  {
    id: "usdterc20",
    label: "Tether",
    symbol: "USDT",
    network: "Ethereum (ERC-20)",
  },
  {
    id: "bch",
    label: "Bitcoin Cash",
    symbol: "BCH",
    network: "Bitcoin Cash",
  },
];

// ─── Purchase Modal ───────────────────────────────────────────────────────────

interface PurchaseModalProps {
  plan: (typeof MINING_PLANS_UI)[0] | null;
  userBalance: number;
  balanceCurrency?: string;
  isDark: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

function PurchaseModal({
  plan,
  userBalance,
  balanceCurrency = "USD",
  isDark,
  onClose,
  onSuccess,
}: PurchaseModalProps) {
  const { formatAmount, preferredCurrency, exchangeRates } = useCurrency();

  // Format balance in the user's preferred currency
  const formatBalanceDisplay = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      return formatAmount(balance, 2);
    }
    // Convert from balanceCurrency to USD, then formatAmount converts to preferredCurrency
    if (balanceCurrency === "USD") {
      return formatAmount(balance, 2);
    }
    const rate = exchangeRates?.[balanceCurrency] ?? 1;
    const balanceInUSD = rate > 0 ? balance / rate : balance;
    return formatAmount(balanceInUSD, 2);
  };
  const [step, setStep] = useState<
    "method" | "crypto-select" | "waiting" | "done"
  >("method");
  const [paymentMethod, setPaymentMethod] = useState<"FIAT" | "CRYPTO">("FIAT");
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Crypto payment state
  const [payAddress, setPayAddress] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [payCurrency, setPayCurrency] = useState("");
  const [contractId, setContractId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (!plan) return null;

  const hasBalance = userBalance >= plan.price;

  const handleFiatPurchase = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mining/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, paymentMethod: "FIAT" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Purchase failed");
      setStep("done");
      onSuccess(`${plan.name} plan activated! Mining starts now.`);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleCryptoPurchase = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mining/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod: "CRYPTO",
          cryptoCurrency: selectedCrypto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment creation failed");

      if (data.paymentType === "INVOICE" && data.invoiceUrl) {
        setInvoiceUrl(data.invoiceUrl);
        setContractId(data.contractId);
        setStep("waiting");
      } else if (data.payAddress) {
        setPayAddress(data.payAddress);
        setPayAmount(data.payAmount);
        setPayCurrency(
          data.payCurrency?.toUpperCase() ?? selectedCrypto.toUpperCase(),
        );
        setContractId(data.contractId);
        setPaymentId(data.paymentId);
        setStep("waiting");

        // Poll for payment confirmation every 15 seconds
        pollRef.current = setInterval(async () => {
          const pollRes = await fetch(
            `/api/mining/purchase/status?contractId=${data.contractId}&paymentId=${data.paymentId}`,
          );
          const pollData = await pollRes.json();
          if (pollData.status === "ACTIVE") {
            clearInterval(pollRef.current!);
            setStep("done");
            onSuccess(`${plan.name} plan activated! Payment confirmed.`);
          } else if (pollData.status === "FAILED") {
            clearInterval(pollRef.current!);
            setError("Payment failed or expired. Please try again.");
            setStep("crypto-select");
          }
        }, 15000);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bg = isDark ? "bg-gray-900" : "bg-white";
  const cardBg = isDark
    ? "bg-gray-800 border-gray-700/60"
    : "bg-gray-50 border-gray-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-md rounded-2xl border shadow-2xl ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <div>
            <h2
              className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Purchase {plan.name} Plan
            </h2>
            <p
              className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {plan.hashrate} · {plan.duration} Days · {plan.dailyProfit}/day
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {/* Price Banner */}
          <div
            className={`rounded-xl p-3 mb-4 border ${isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200"}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Total Investment
              </span>
              <span className="text-xl font-bold text-orange-500">
                ${plan.price.toLocaleString()}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2">
              <AlertTriangle
                size={13}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Step: Choose Method */}
          {step === "method" && (
            <div className="space-y-3">
              <p
                className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Choose Payment Method
              </p>

              {/* Fiat Option */}
              <button
                onClick={() => setPaymentMethod("FIAT")}
                className={`w-full p-3.5 rounded-xl border transition-all text-left ${paymentMethod === "FIAT" ? "border-orange-500 bg-orange-500/5" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${paymentMethod === "FIAT" ? "bg-orange-500/20" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <CreditCard
                      size={16}
                      className={
                        paymentMethod === "FIAT"
                          ? "text-orange-500"
                          : isDark
                            ? "text-gray-300"
                            : "text-gray-600"
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${paymentMethod === "FIAT" ? "text-orange-500" : isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Account Balance
                    </p>
                    <p
                      className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Available:{" "}
                      <span
                        className={
                          hasBalance
                            ? "text-green-500 font-medium"
                            : "text-red-400 font-medium"
                        }
                      >
                        {formatBalanceDisplay(userBalance)}
                      </span>
                      {!hasBalance && (
                        <span className="text-red-400"> · Insufficient</span>
                      )}
                    </p>
                  </div>
                  {paymentMethod === "FIAT" && (
                    <CheckCircle
                      size={14}
                      className="text-orange-500 flex-shrink-0"
                    />
                  )}
                </div>
              </button>

              {/* Crypto Option */}
              <button
                onClick={() => setPaymentMethod("CRYPTO")}
                className={`w-full p-3.5 rounded-xl border transition-all text-left ${paymentMethod === "CRYPTO" ? "border-orange-500 bg-orange-500/5" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${paymentMethod === "CRYPTO" ? "bg-orange-500/20" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
                  >
                    <Zap
                      size={16}
                      className={
                        paymentMethod === "CRYPTO"
                          ? "text-orange-500"
                          : isDark
                            ? "text-gray-300"
                            : "text-gray-600"
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${paymentMethod === "CRYPTO" ? "text-orange-500" : isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Crypto Deposit
                    </p>
                    <p
                      className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Pay with{" "}
                      {PURCHASE_CRYPTOS.map((c) => c.symbol)
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .join(", ")}{" "}
                      — instant activation
                    </p>
                  </div>
                  {paymentMethod === "CRYPTO" && (
                    <CheckCircle
                      size={14}
                      className="text-orange-500 flex-shrink-0"
                    />
                  )}
                </div>
              </button>

              <button
                onClick={() => {
                  if (paymentMethod === "FIAT") {
                    if (hasBalance) handleFiatPurchase();
                  } else setStep("crypto-select");
                }}
                disabled={loading || (paymentMethod === "FIAT" && !hasBalance)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {loading
                  ? "Processing..."
                  : paymentMethod === "FIAT"
                    ? "Confirm Purchase"
                    : "Continue with Crypto →"}
              </button>
            </div>
          )}

          {/* Step: Select Crypto */}
          {step === "crypto-select" && (
            <div className="space-y-3">
              <button
                onClick={() => setStep("method")}
                className={`text-xs flex items-center gap-1 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
              >
                ← Back
              </button>
              <p
                className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Select Cryptocurrency
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden pr-0.5">
                {PURCHASE_CRYPTOS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrypto(c.id)}
                    className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${selectedCrypto === c.id ? "border-orange-500 bg-orange-500/5" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      <CryptoIcon symbol={c.symbol} size="sm" />
                    </div>
                    <div className="text-left min-w-0">
                      <p
                        className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {c.symbol}
                      </p>
                      <p
                        className={`text-[9px] truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {c.network ?? c.label}
                      </p>
                    </div>
                    {selectedCrypto === c.id && (
                      <CheckCircle
                        size={12}
                        className="text-orange-500 ml-auto flex-shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div
                className={`p-3 rounded-xl border ${isDark ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-200"} flex items-start gap-2`}
              >
                <Info
                  size={13}
                  className="text-blue-400 flex-shrink-0 mt-0.5"
                />
                <p
                  className={`text-[10px] ${isDark ? "text-blue-300" : "text-blue-600"}`}
                >
                  A deposit address will be generated for you. Send exactly the
                  required amount to activate your contract.
                </p>
              </div>
              <button
                onClick={handleCryptoPurchase}
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {loading ? "Generating Address..." : "Generate Deposit Address"}
              </button>
            </div>
          )}

          {/* Step: Waiting for payment */}
          {step === "waiting" && (
            <div className="space-y-3">
              {invoiceUrl ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
                    <ExternalLink size={20} className="text-orange-500" />
                  </div>
                  <p
                    className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Complete Payment
                  </p>
                  <p
                    className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    You will be redirected to the payment page.
                  </p>
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    <ExternalLink size={14} /> Open Payment Page
                  </a>
                </div>
              ) : (
                <>
                  <div
                    className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-gray-50 border-gray-200"}`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Send exactly
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xl font-bold text-orange-500`}>
                        {payAmount} {payCurrency}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      To this {payCurrency} address
                    </p>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}
                    >
                      <code
                        className={`flex-1 text-[10px] font-mono break-all ${isDark ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {payAddress}
                      </code>
                      <button
                        onClick={() => handleCopy(payAddress)}
                        className="flex-shrink-0 p-1.5 rounded text-gray-400 hover:text-orange-500"
                      >
                        {copied ? (
                          <Check size={13} className="text-green-500" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl border ${isDark ? "bg-yellow-500/5 border-yellow-500/20" : "bg-yellow-50 border-yellow-200"}`}
                  >
                    <Loader2
                      size={14}
                      className="animate-spin text-yellow-500 flex-shrink-0"
                    />
                    <p
                      className={`text-[10px] ${isDark ? "text-yellow-300" : "text-yellow-700"}`}
                    >
                      Waiting for payment confirmation… Your contract activates
                      automatically once the transaction is confirmed.
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl border border-orange-500/20 bg-orange-500/5`}
                  >
                    <AlertTriangle
                      size={13}
                      className="text-orange-400 flex-shrink-0"
                    />
                    <p
                      className={`text-[10px] ${isDark ? "text-orange-300" : "text-orange-700"}`}
                    >
                      Send only {payCurrency} to this address. Send only the
                      exact amount shown.
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={onClose}
                className={`w-full py-2 text-xs font-semibold rounded-xl border transition-colors ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                Close (payment continues in background)
              </button>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p
                className={`text-base font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Contract Activated!
              </p>
              <p
                className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Your {plan.name} mining plan is now active. You will start
                earning BTC shortly.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors"
              >
                View Dashboard
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function F2PoolMiningPage() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const {
    formatAmount: formatCurrency,
    preferredCurrency: prefCurrency,
    exchangeRates: exRates,
  } = useCurrency();

  const formatUserBalance = (
    balance: number,
    balanceCurrency: string,
  ): string => {
    if (balanceCurrency === prefCurrency) return formatCurrency(balance, 2);
    if (balanceCurrency === "USD") return formatCurrency(balance, 2);
    const rate = exRates?.[balanceCurrency] ?? 1;
    return formatCurrency(rate > 0 ? balance / rate : balance, 2);
  };

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calcHashrate, setCalcHashrate] = useState("100");
  const [calcDuration, setCalcDuration] = useState("30");

  // ── Portfolio balance (same source as dashboard) ──
  const { portfolio: portfolioData } = usePortfolio();
  const userBalance = portfolioData?.portfolio?.balance
    ? parseFloat(portfolioData.portfolio.balance.toString())
    : 0;
  const userBalanceCurrency =
    portfolioData?.portfolio?.balanceCurrency ?? "USD";

  // Data state
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [contracts, setContracts] = useState<MiningContract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [earnings, setEarnings] = useState<MiningEarning[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsRange, setEarningsRange] = useState("30");
  const [workers, setWorkers] = useState<any[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workerOnline, setWorkerOnline] = useState(0);
  const [workerOffline, setWorkerOffline] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<MiningWithdrawal[]>([]);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [wallets, setWallets] = useState<MiningWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState("BTC");
  const [withdrawDest, setWithdrawDest] = useState<"EXTERNAL" | "INTERNAL">(
    "EXTERNAL",
  );
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  // Wallet form
  const [newWalletLabel, setNewWalletLabel] = useState("");
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [newWalletCurrency, setNewWalletCurrency] = useState("BTC");
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletSuccess, setWalletSuccess] = useState("");

  // Plans + purchase modal
  const [planSuccess, setPlanSuccess] = useState("");
  const [planError, setPlanError] = useState("");
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<
    (typeof MINING_PLANS_UI)[0] | null
  >(null);

  // Transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  // ── Fetch helpers ──

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await fetch("/api/mining/dashboard");
      if (res.ok) setDashData(await res.json());
    } catch {}
    setDashLoading(false);
  }, []);

  const loadContracts = useCallback(async () => {
    setContractsLoading(true);
    try {
      const res = await fetch("/api/mining/contracts");
      if (res.ok) {
        const d = await res.json();
        setContracts(d.contracts ?? []);
      }
    } catch {}
    setContractsLoading(false);
  }, []);

  const loadEarnings = useCallback(
    async (range = earningsRange) => {
      setEarningsLoading(true);
      try {
        const res = await fetch(`/api/mining/earnings?range=${range}`);
        if (res.ok) {
          const d = await res.json();
          setEarnings(d.earnings ?? []);
        }
      } catch {}
      setEarningsLoading(false);
    },
    [earningsRange],
  );

  const loadWorkers = useCallback(async () => {
    setWorkersLoading(true);
    try {
      const res = await fetch("/api/mining/workers");
      if (res.ok) {
        const d = await res.json();
        setWorkers(d.workers ?? []);
        setWorkerOnline(d.online ?? 0);
        setWorkerOffline(d.offline ?? 0);
      }
    } catch {}
    setWorkersLoading(false);
  }, []);

  const loadStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/mining/statistics");
      if (res.ok) setStats(await res.json());
    } catch {}
    setStatsLoading(false);
  }, []);

  const loadWithdrawals = useCallback(async () => {
    setWithdrawLoading(true);
    try {
      const res = await fetch("/api/mining/withdraw");
      if (res.ok) {
        const d = await res.json();
        setWithdrawals(d.withdrawals ?? []);
      }
    } catch {}
    setWithdrawLoading(false);
  }, []);

  const loadWallets = useCallback(async () => {
    setWalletsLoading(true);
    try {
      const res = await fetch("/api/mining/wallets");
      if (res.ok) {
        const d = await res.json();
        setWallets(d.wallets ?? []);
      }
    } catch {}
    setWalletsLoading(false);
  }, []);

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await fetch("/api/mining/transactions");
      if (res.ok) {
        const d = await res.json();
        setTransactions(d.transactions ?? []);
      }
    } catch {}
    setTxLoading(false);
  }, []);

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load tab data when switching
  useEffect(() => {
    if (activeTab === "contracts") loadContracts();
    if (activeTab === "earnings" || activeTab === "overview") loadEarnings();
    if (activeTab === "workers") loadWorkers();
    if (activeTab === "statistics") loadStatistics();
    if (activeTab === "withdraw") loadWithdrawals();
    if (activeTab === "transactions") loadTransactions();
    if (activeTab === "wallets") loadWallets();
  }, [
    activeTab,
    loadContracts,
    loadEarnings,
    loadWorkers,
    loadStatistics,
    loadWithdrawals,
    loadTransactions,
    loadWallets,
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    if (activeTab === "contracts") await loadContracts();
    if (activeTab === "earnings") await loadEarnings();
    if (activeTab === "workers") await loadWorkers();
    if (activeTab === "statistics") await loadStatistics();
    if (activeTab === "withdraw") await loadWithdrawals();
    if (activeTab === "transactions") await loadTransactions();
    if (activeTab === "wallets") await loadWallets();
    setIsRefreshing(false);
  };

  const openPurchaseModal = (planId: string) => {
    const plan = MINING_PLANS_UI.find((p) => p.id === planId);
    if (plan) {
      setPlanSuccess("");
      setPlanError("");
      setSelectedPlanForPurchase(plan);
    }
  };

  const closePurchaseModal = () => {
    setSelectedPlanForPurchase(null);
  };

  const onPurchaseSuccess = async (msg: string) => {
    setPlanSuccess(msg);
    setSelectedPlanForPurchase(null);
    await loadDashboard();
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");
    setWithdrawSubmitting(true);
    try {
      const res = await fetch("/api/mining/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          currency: withdrawCurrency,
          destinationType: withdrawDest,
          walletAddress: withdrawAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Withdrawal failed");
      setWithdrawSuccess(
        withdrawDest === "INTERNAL"
          ? "Successfully transferred to your trading wallet!"
          : "Withdrawal request submitted. Processing in 1-3 business days.",
      );
      setWithdrawAmount("");
      setWithdrawAddress("");
      await loadWithdrawals();
      await loadDashboard();
    } catch (e: any) {
      setWithdrawError(e.message);
    }
    setWithdrawSubmitting(false);
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletError("");
    setWalletSuccess("");
    setWalletSaving(true);
    try {
      const res = await fetch("/api/mining/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newWalletLabel,
          address: newWalletAddress,
          currency: newWalletCurrency,
          isDefault: wallets.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save wallet");
      setWalletSuccess("Wallet address saved!");
      setNewWalletLabel("");
      setNewWalletAddress("");
      await loadWallets();
    } catch (e: any) {
      setWalletError(e.message);
    }
    setWalletSaving(false);
  };

  const handleDeleteWallet = async (id: string) => {
    try {
      await fetch(`/api/mining/wallets?id=${id}`, { method: "DELETE" });
      await loadWallets();
    } catch {}
  };

  const estimatedEarnings = (
    (parseFloat(calcHashrate) || 0) *
    0.00116457 *
    (parseInt(calcDuration) / 30)
  ).toFixed(8);

  const navigate = (tab: TabId) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // ── Render ──

  return (
    <div
      className={`flex min-h-screen relative ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Purchase Modal */}
      <AnimatePresence>
        {selectedPlanForPurchase && (
          <PurchaseModal
            plan={selectedPlanForPurchase}
            userBalance={userBalance}
            balanceCurrency={userBalanceCurrency}
            isDark={isDark}
            onClose={closePurchaseModal}
            onSuccess={onPurchaseSuccess}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ══ LEFT SIDEBAR ══ */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-52 z-30 flex flex-col bg-[#0A1628] border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0 lg:top-0 lg:h-full`}
      >
        {/* Logo */}
        <div className="px-3 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xs">F2</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-[11px] leading-tight tracking-wide truncate">
                F2 POOL MINING
              </p>
              <p className="text-gray-500 text-[9px] mt-0.5">
                Mine Today, Secure Tomorrow
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
          <p className="text-gray-500 text-[8px] uppercase tracking-widest font-medium mb-1.5">
            MINING WALLET
          </p>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[10px]">₿</span>
            </div>
            <span className="text-white font-bold text-xs tabular-nums truncate">
              {dashData
                ? Number(dashData.totalEarned).toFixed(8)
                : "0.00000000"}{" "}
              BTC
            </span>
          </div>
          <p className="text-gray-500 text-[10px] mb-2">
            ≈ $
            {dashData
              ? Number(dashData.totalEarnedUsd).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })
              : "0.00"}{" "}
            USD
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => navigate("plans")}
              className="flex-1 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-md transition-colors"
            >
              Buy
            </button>
            <button
              onClick={() => navigate("withdraw")}
              className="flex-1 py-1 border border-gray-600 hover:bg-white/5 text-white text-[10px] font-bold rounded-md transition-colors"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-1.5 px-1.5 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-[11px] group w-full"
          >
            <Home
              size={13}
              className="flex-shrink-0 text-gray-500 group-hover:text-gray-300"
            />
            Dashboard
          </Link>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-[11px] ${isActive ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
              >
                <span
                  className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-[11px] mt-1"
          >
            <LogOut size={13} className="flex-shrink-0" />
            Logout
          </button>
        </nav>

        {/* Help */}
        <div className="p-2 flex-shrink-0 border-t border-white/5">
          <div className="bg-[#112040] rounded-lg p-2.5 border border-white/5 text-center">
            <div className="w-7 h-7 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-1.5">
              <HelpCircle size={13} className="text-orange-400" />
            </div>
            <p className="text-white text-[10px] font-bold mb-0.5">
              Need Help?
            </p>
            <p className="text-gray-500 text-[9px] mb-1.5">Support 24/7</p>
            <button className="w-full py-1 rounded-md border border-orange-500/40 text-orange-400 text-[9px] font-semibold hover:bg-orange-500/10 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 px-3 sm:px-5 py-2.5 border-b flex items-center justify-between ${isDark ? "bg-gray-900 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <Menu size={16} />
            </button>
            <div>
              <h1
                className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Mining Dashboard
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  Dashboard
                </span>
                <ChevronRight
                  size={9}
                  className={isDark ? "text-gray-600" : "text-gray-400"}
                />
                <span className="text-[10px] text-orange-500">
                  {NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "Mining"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-1.5 rounded-lg transition-all ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={() => navigate("plans")}
              className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm hidden sm:block"
            >
              Manage Mining
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 flex-1">
          <AnimatePresence mode="wait">
            {/* ══ DASHBOARD ══ */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
                  <StatCard
                    title="Active Hashrate"
                    value={
                      dashLoading
                        ? "—"
                        : dashData?.activeContracts
                          ? `${dashData.totalHashrate} ${dashData.hashrateUnit}`
                          : "0 TH/s"
                    }
                    sub={
                      dashData
                        ? `$${Number(dashData.todayEarnedUsd).toFixed(2)} / day`
                        : "$0.00 / day"
                    }
                    change={dashData?.activeContracts ? "+Active" : "No plans"}
                    positive={!!dashData?.activeContracts}
                    icon={<Activity size={16} className="text-orange-500" />}
                    iconBg="bg-orange-500/10"
                    isDark={isDark}
                    sparkData={[60, 70, 65, 80, 95, 110, 125]}
                  />
                  <StatCard
                    title="Active Contracts"
                    value={
                      dashLoading ? "—" : String(dashData?.activeContracts ?? 0)
                    }
                    sub={
                      dashData?.activeContracts
                        ? `${dashData.activeContracts} plan(s) running`
                        : "No active plans"
                    }
                    change={
                      dashData?.activeContracts
                        ? `${dashData.activeContracts} active`
                        : "Buy a plan"
                    }
                    positive={!!dashData?.activeContracts}
                    icon={<Server size={16} className="text-green-500" />}
                    iconBg="bg-green-500/10"
                    isDark={isDark}
                  />
                  <StatCard
                    title="Today's Earnings"
                    value={
                      dashLoading
                        ? "—"
                        : `${Number(dashData?.todayEarned ?? 0).toFixed(8)} BTC`
                    }
                    sub={`$${Number(dashData?.todayEarnedUsd ?? 0).toFixed(2)}`}
                    change={dashData?.todayEarned ? "+Today" : "No earnings"}
                    positive={Number(dashData?.todayEarned ?? 0) > 0}
                    icon={<DollarSign size={16} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                    isDark={isDark}
                    sparkData={[240, 255, 260, 270, 275, 285, 291]}
                  />
                  <StatCard
                    title="Monthly Earnings"
                    value={
                      dashLoading
                        ? "—"
                        : `${Number(dashData?.monthEarned ?? 0).toFixed(8)} BTC`
                    }
                    sub={`$${Number(dashData?.monthEarnedUsd ?? 0).toFixed(2)}`}
                    change={
                      dashData?.monthEarned ? "+This month" : "No earnings"
                    }
                    positive={Number(dashData?.monthEarned ?? 0) > 0}
                    icon={<TrendingUp size={16} className="text-purple-500" />}
                    iconBg="bg-purple-500/10"
                    isDark={isDark}
                    sparkData={[7000, 7400, 7600, 7900, 8100, 8500, 8789]}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
                  {/* Mining Status */}
                  <div
                    className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                  >
                    <h3
                      className={`font-semibold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Mining Status
                    </h3>
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative">
                        <CircularProgress
                          value={dashData?.activeContracts ? 97 : 0}
                          size={110}
                          strokeWidth={9}
                          color="#22C55E"
                          isDark={isDark}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {dashData?.activeContracts ? "97%" : "0%"}
                          </span>
                          <span
                            className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            Uptime
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          label: "Status",
                          value: dashData?.activeContracts
                            ? "ACTIVE"
                            : "INACTIVE",
                          badge: true,
                        },
                        { label: "Pool", value: "F2 Pool" },
                        { label: "Algorithm", value: "SHA-256" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className={`flex items-center justify-between py-1 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                        >
                          <span
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {row.label}
                          </span>
                          {row.badge ? (
                            <StatusBadge
                              status={
                                dashData?.activeContracts
                                  ? "ACTIVE"
                                  : "INACTIVE"
                              }
                            />
                          ) : (
                            <span
                              className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                            >
                              {row.value}
                            </span>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-0.5">
                        <span
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Next Payout
                        </span>
                        <CountdownTimer isDark={isDark} />
                      </div>
                    </div>
                  </div>

                  {/* Active Contracts Preview */}
                  <div
                    className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Active Contracts
                      </h3>
                      <button
                        onClick={() => navigate("contracts")}
                        className="text-orange-500 hover:text-orange-400 text-xs font-semibold"
                      >
                        View All
                      </button>
                    </div>
                    {dashData?.contracts?.length ? (
                      <div className="space-y-2">
                        {dashData.contracts.slice(0, 3).map((c) => (
                          <div
                            key={c.id}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border ${isDark ? "bg-gray-700/50 border-gray-600/50" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                              style={{
                                backgroundColor:
                                  COIN_COLORS[c.coin] ?? "#F97316",
                              }}
                            >
                              {COIN_ICONS[c.coin] ?? "₿"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                              >
                                {c.planName}
                              </p>
                              <p
                                className={`text-[10px] truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {c.hashrate}
                              </p>
                            </div>
                            <StatusBadge status={c.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center">
                        <Cpu
                          size={24}
                          className={`mb-2 ${isDark ? "text-gray-600" : "text-gray-300"}`}
                        />
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          No active contracts
                        </p>
                        <button
                          onClick={() => navigate("plans")}
                          className="mt-2 text-xs text-orange-500 hover:text-orange-400 font-semibold flex items-center gap-1"
                        >
                          Buy a plan <ArrowRight size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Profit Calculator */}
                  <div
                    className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator size={14} className="text-orange-500" />
                      <h3
                        className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Profit Calculator
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label
                          className={`text-[10px] font-medium block mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Hashrate (TH/s)
                        </label>
                        <input
                          type="number"
                          value={calcHashrate}
                          onChange={(e) => setCalcHashrate(e.target.value)}
                          className={`w-full rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label
                          className={`text-[10px] font-medium block mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Duration
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {["30", "90", "180"].map((d) => (
                            <button
                              key={d}
                              onClick={() => setCalcDuration(d)}
                              className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all ${calcDuration === d ? "bg-orange-500 text-white" : isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                              {d}D
                            </button>
                          ))}
                        </div>
                      </div>
                      <div
                        className={`rounded-lg p-3 ${isDark ? "bg-gray-700/60" : "bg-orange-50"}`}
                      >
                        <p
                          className={`text-[10px] mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Estimated Earnings
                        </p>
                        <p className="text-lg font-bold text-orange-500">
                          {estimatedEarnings} BTC
                        </p>
                        <p
                          className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          ≈ $
                          {(
                            parseFloat(estimatedEarnings) * 60000
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          USD
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("plans")}
                        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Start Mining
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Earnings */}
                <div
                  className={`rounded-xl border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <div
                    className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                  >
                    <h3
                      className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Recent Earnings
                    </h3>
                    <button
                      onClick={() => navigate("earnings")}
                      className="text-orange-500 hover:text-orange-400 text-xs font-semibold"
                    >
                      View All
                    </button>
                  </div>
                  {dashData?.recentEarnings?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className={`text-[10px] font-medium ${isDark ? "text-gray-400 bg-gray-700/30" : "text-gray-500 bg-gray-50"}`}
                          >
                            {["Date", "Amount", "USD Value", "Status"].map(
                              (h) => (
                                <th key={h} className="px-3 py-2 text-left">
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {dashData.recentEarnings.slice(0, 5).map((e) => (
                            <tr
                              key={e.id}
                              className={`border-t text-xs ${isDark ? "border-gray-700/40 hover:bg-gray-700/30" : "border-gray-100 hover:bg-gray-50"}`}
                            >
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {new Date(e.date).toLocaleDateString()}
                              </td>
                              <td
                                className={`px-3 py-2 font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                              >
                                {Number(e.amount).toFixed(8)} {e.currency}
                              </td>
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                              >
                                ${Number(e.amountUsd ?? 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge status={e.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <DollarSign
                          size={22}
                          className={isDark ? "text-gray-500" : "text-gray-400"}
                        />
                      }
                      title="No earnings yet"
                      desc="Purchase a mining plan to start earning BTC"
                      isDark={isDark}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ PLANS ══ */}
            {activeTab === "plans" && (
              <motion.div
                key="plans"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-5">
                  <h2
                    className={`text-xl sm:text-2xl font-bold mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Choose Your Mining Plan
                  </h2>
                  <p
                    className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Select a hashrate plan and start earning Bitcoin daily
                  </p>
                  <p
                    className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Your balance:{" "}
                    <span
                      className={`font-bold ${userBalance > 0 ? "text-green-500" : isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {formatUserBalance(userBalance, userBalanceCurrency)}
                    </span>
                  </p>
                </div>

                {planSuccess && (
                  <div className="mb-4 p-3 rounded-xl border border-green-500/30 bg-green-500/10 flex items-start gap-2">
                    <CheckCircle
                      size={14}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-green-500">{planSuccess}</p>
                  </div>
                )}
                {planError && (
                  <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2">
                    <AlertTriangle
                      size={14}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-red-400">{planError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MINING_PLANS_UI.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07 }}
                      className={`relative rounded-2xl p-5 border transition-all ${
                        plan.popular
                          ? "border-orange-500 shadow-lg shadow-orange-500/10"
                          : isDark
                            ? "border-gray-700/60 bg-gray-800"
                            : "border-gray-200 bg-white"
                      } ${plan.popular ? (isDark ? "bg-gray-800" : "bg-white") : ""}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="text-center mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center`}
                          style={{ backgroundColor: plan.color + "22" }}
                        >
                          <Cpu size={18} style={{ color: plan.color }} />
                        </div>
                        <h3
                          className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {plan.name}
                        </h3>
                        <p className="text-xl font-bold text-orange-500 mt-1">
                          ${plan.price.toLocaleString()}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {plan.duration} Days
                        </p>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        {[
                          { label: "Hashrate", value: plan.hashrate },
                          { label: "Daily Profit", value: plan.dailyProfit },
                          { label: "Duration", value: `${plan.duration} days` },
                          { label: "Algorithm", value: "SHA-256" },
                          { label: "Pool Fee", value: "0.0%" },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className={`flex justify-between text-xs border-b pb-1 ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                          >
                            <span
                              className={
                                isDark ? "text-gray-400" : "text-gray-500"
                              }
                            >
                              {row.label}
                            </span>
                            <span
                              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => openPurchaseModal(plan.id)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                          plan.popular
                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                            : isDark
                              ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200"
                        }`}
                      >
                        Buy {plan.name} Plan
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ EARNINGS ══ */}
            {activeTab === "earnings" && (
              <motion.div
                key="earnings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2
                    className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Earnings History
                  </h2>
                  <div
                    className={`flex p-0.5 rounded-lg w-fit ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}
                  >
                    {["7", "30", "90"].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setEarningsRange(r);
                          loadEarnings(r);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${earningsRange === r ? "bg-orange-500 text-white shadow-sm" : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {r}D
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                  {[
                    {
                      label: "Total Earned",
                      value: `${Number(dashData?.totalEarned ?? 0).toFixed(8)} BTC`,
                      sub: `$${Number(dashData?.totalEarnedUsd ?? 0).toFixed(2)}`,
                    },
                    {
                      label: "This Month",
                      value: `${Number(dashData?.monthEarned ?? 0).toFixed(8)} BTC`,
                      sub: `$${Number(dashData?.monthEarnedUsd ?? 0).toFixed(2)}`,
                    },
                    {
                      label: "Today",
                      value: `${Number(dashData?.todayEarned ?? 0).toFixed(8)} BTC`,
                      sub: `$${Number(dashData?.todayEarnedUsd ?? 0).toFixed(2)}`,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-3 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                    >
                      <p
                        className={`text-[10px] uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {item.value}
                      </p>
                      <p
                        className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className={`rounded-xl border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <div
                    className={`px-4 py-3 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                  >
                    <h3
                      className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Earnings Records
                    </h3>
                  </div>
                  {earningsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <RefreshCw
                        size={18}
                        className="animate-spin text-orange-500"
                      />
                    </div>
                  ) : earnings.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className={`text-[10px] font-medium ${isDark ? "text-gray-400 bg-gray-700/30" : "text-gray-500 bg-gray-50"}`}
                          >
                            {[
                              "Date",
                              "Plan",
                              "Amount",
                              "USD Value",
                              "Status",
                            ].map((h) => (
                              <th key={h} className="px-3 py-2 text-left">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {earnings.map((e) => (
                            <tr
                              key={e.id}
                              className={`border-t text-xs ${isDark ? "border-gray-700/40 hover:bg-gray-700/30" : "border-gray-100 hover:bg-gray-50"}`}
                            >
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {new Date(e.date).toLocaleDateString()}
                              </td>
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {e.MiningContract?.planName ?? "—"}
                              </td>
                              <td
                                className={`px-3 py-2 font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                              >
                                {Number(e.amount).toFixed(8)} {e.currency}
                              </td>
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                              >
                                ${Number(e.amountUsd ?? 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge status={e.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <DollarSign
                          size={22}
                          className={isDark ? "text-gray-500" : "text-gray-400"}
                        />
                      }
                      title="No earnings records"
                      desc="Start mining to see your earnings history here"
                      isDark={isDark}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ OVERVIEW ══ */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Mining Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    {
                      label: "Total Contracts",
                      value: dashData
                        ? `${dashData.activeContracts} active`
                        : "0 active",
                      icon: <FileText size={16} className="text-blue-400" />,
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Total Hashrate",
                      value: dashData
                        ? `${dashData.totalHashrate} ${dashData.hashrateUnit}`
                        : "0 TH/s",
                      icon: <Zap size={16} className="text-yellow-400" />,
                      bg: "bg-yellow-500/10",
                    },
                    {
                      label: "All-Time Earnings",
                      value: `${Number(dashData?.totalEarned ?? 0).toFixed(6)} BTC`,
                      icon: <TrendingUp size={16} className="text-green-400" />,
                      bg: "bg-green-500/10",
                    },
                    {
                      label: "Pending Withdrawals",
                      value: `${Number(dashData?.pendingWithdrawalAmount ?? 0).toFixed(6)} BTC`,
                      icon: <Clock size={16} className="text-orange-400" />,
                      bg: "bg-orange-500/10",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                          {item.icon}
                        </div>
                        <p
                          className={`text-[10px] uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {item.label}
                        </p>
                      </div>
                      <p
                        className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div
                    className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                  >
                    <h3
                      className={`font-semibold text-sm mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Mining Rig Details
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { label: "Rig Name", value: "F2-MINER-01" },
                        {
                          label: "Total Hashrate",
                          value: dashData
                            ? `${dashData.totalHashrate} ${dashData.hashrateUnit}`
                            : "0 TH/s",
                        },
                        { label: "Power Usage", value: "3.25 kW" },
                        { label: "Efficiency", value: "38.6 J/TH" },
                        { label: "Temperature", value: "42°C — Normal" },
                        { label: "Location", value: "USA 🇺🇸" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className={`flex items-center justify-between py-1.5 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                        >
                          <span
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {row.label}
                          </span>
                          <span
                            className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                  >
                    <h3
                      className={`font-semibold text-sm mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Recent Payouts
                    </h3>
                    {earnings.length ? (
                      <div className="space-y-2">
                        {earnings.slice(0, 8).map((e) => (
                          <div
                            key={e.id}
                            className={`flex items-center justify-between py-1.5 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                              <span
                                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {new Date(e.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {Number(e.amount).toFixed(8)} BTC
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={
                          <BarChart2
                            size={22}
                            className={
                              isDark ? "text-gray-500" : "text-gray-400"
                            }
                          />
                        }
                        title="No data yet"
                        desc="Start a mining contract to see payout data"
                        isDark={isDark}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ CONTRACTS ══ */}
            {activeTab === "contracts" && (
              <motion.div
                key="contracts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2
                      className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Mining Contracts
                    </h2>
                    <p
                      className={`text-[11px] mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {contracts.length} contract
                      {contracts.length !== 1 ? "s" : ""} total
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("plans")}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-orange-500/20"
                  >
                    <Plus size={13} /> New Contract
                  </button>
                </div>

                {contractsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                  </div>
                ) : contracts.length ? (
                  <div className="space-y-4">
                    {contracts.map((c) => {
                      const start = new Date(c.startDate).getTime();
                      const end = c.endDate
                        ? new Date(c.endDate).getTime()
                        : start + c.duration * 86400000;
                      const now = Date.now();
                      const progress = Math.min(
                        100,
                        Math.max(0, ((now - start) / (end - start)) * 100),
                      );
                      const daysLeft = Math.max(
                        0,
                        Math.ceil((end - now) / 86400000),
                      );
                      const totalEarned = Number(c.totalEarned);
                      const earnedUsd = totalEarned * 60000;
                      const isActive = c.status === "ACTIVE";

                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`rounded-2xl border overflow-hidden shadow-sm ${
                            isDark
                              ? "bg-gray-800 border-gray-700/60"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          {/* Top accent bar */}
                          <div
                            className="h-1 w-full"
                            style={{
                              background: isActive
                                ? "linear-gradient(90deg, #F97316, #FBBF24)"
                                : isDark
                                  ? "#374151"
                                  : "#E5E7EB",
                            }}
                          />

                          <div className="p-4">
                            {/* Row 1 — coin icon + plan name + status */}
                            <div className="flex items-center gap-3 mb-4">
                              {/* Real BTC logo */}
                              <div className="relative flex-shrink-0">
                                <div
                                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                  style={{
                                    backgroundColor:
                                      COIN_COLORS[c.coin] ?? "#F97316",
                                  }}
                                >
                                  <img
                                    src={`/crypto/${c.coin.toLowerCase()}.svg`}
                                    alt={c.coin}
                                    className="w-7 h-7"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLImageElement
                                      ).style.display = "none";
                                      (
                                        e.currentTarget
                                          .nextSibling as HTMLElement
                                      ).style.display = "flex";
                                    }}
                                  />
                                  <span className="text-white font-bold text-base hidden items-center justify-center w-7 h-7">
                                    {COIN_ICONS[c.coin] ?? "₿"}
                                  </span>
                                </div>
                                {isActive && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-gray-800 shadow" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p
                                    className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                                  >
                                    {c.planName}
                                  </p>
                                  <StatusBadge status={c.status} />
                                </div>
                                <p
                                  className={`text-[11px] mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  {c.algorithm} · {c.hashrate}
                                </p>
                              </div>

                              {/* Days left pill */}
                              {isActive && (
                                <div
                                  className={`flex-shrink-0 text-center px-2.5 py-1.5 rounded-xl ${isDark ? "bg-orange-500/10 border border-orange-500/20" : "bg-orange-50 border border-orange-200"}`}
                                >
                                  <p className="text-orange-500 font-bold text-sm leading-none">
                                    {daysLeft}
                                  </p>
                                  <p
                                    className={`text-[9px] uppercase tracking-wide mt-0.5 ${isDark ? "text-orange-400/70" : "text-orange-400"}`}
                                  >
                                    days left
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Progress bar */}
                            {isActive && (
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span
                                    className={`text-[10px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                  >
                                    Contract Progress
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                  >
                                    {progress.toFixed(1)}%
                                  </span>
                                </div>
                                <div
                                  className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{
                                      duration: 1,
                                      ease: "easeOut",
                                    }}
                                    className="h-full rounded-full"
                                    style={{
                                      background:
                                        "linear-gradient(90deg, #F97316, #FBBF24)",
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span
                                    className={`text-[9px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                  >
                                    {new Date(c.startDate).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric" },
                                    )}
                                  </span>
                                  <span
                                    className={`text-[9px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                  >
                                    {c.endDate
                                      ? new Date(c.endDate).toLocaleDateString(
                                          "en-US",
                                          {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          },
                                        )
                                      : "—"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Stats grid */}
                            <div
                              className={`grid grid-cols-3 gap-2 pt-3 border-t ${isDark ? "border-gray-700/50" : "border-gray-100"}`}
                            >
                              <div
                                className={`rounded-xl p-2.5 text-center ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                              >
                                <p
                                  className={`text-[9px] uppercase tracking-wide mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  Hashrate
                                </p>
                                <p
                                  className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                  {c.hashrate}
                                </p>
                              </div>
                              <div
                                className={`rounded-xl p-2.5 text-center ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                              >
                                <p
                                  className={`text-[9px] uppercase tracking-wide mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  Duration
                                </p>
                                <p
                                  className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                  {c.duration}d
                                </p>
                              </div>
                              <div
                                className={`rounded-xl p-2.5 text-center ${isDark ? "bg-green-900/20 border border-green-500/10" : "bg-green-50 border border-green-100"}`}
                              >
                                <p
                                  className={`text-[9px] uppercase tracking-wide mb-1 ${isDark ? "text-green-400/70" : "text-green-600/70"}`}
                                >
                                  Earned
                                </p>
                                <p
                                  className={`text-xs font-bold ${totalEarned > 0 ? "text-green-500" : isDark ? "text-white" : "text-gray-900"}`}
                                >
                                  {totalEarned > 0
                                    ? `${totalEarned.toFixed(5)} ₿`
                                    : "0.00000 ₿"}
                                </p>
                              </div>
                            </div>

                            {/* USD equivalent if earned */}
                            {totalEarned > 0 && (
                              <p
                                className={`text-center text-[10px] mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                              >
                                ≈ $
                                {earnedUsd.toLocaleString("en-US", {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                USD
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <FileText
                        size={22}
                        className={isDark ? "text-gray-500" : "text-gray-400"}
                      />
                    }
                    title="No contracts yet"
                    desc="Purchase a mining plan to get your first contract"
                    isDark={isDark}
                  />
                )}
              </motion.div>
            )}

            {/* ══ WORKERS ══ */}
            {activeTab === "workers" && (
              <motion.div
                key="workers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2
                    className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Mining Workers
                  </h2>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span
                        className={isDark ? "text-gray-300" : "text-gray-600"}
                      >
                        {workerOnline} Online
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span
                        className={isDark ? "text-gray-300" : "text-gray-600"}
                      >
                        {workerOffline} Offline
                      </span>
                    </span>
                  </div>
                </div>
                {workersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                  </div>
                ) : workers.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workers.map((w) => (
                      <div
                        key={w.id}
                        className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${w.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
                            />
                            <span
                              className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {w.name}
                            </span>
                          </div>
                          <StatusBadge status={w.status} />
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { label: "Hashrate", value: w.hashrate },
                            {
                              label: "Temperature",
                              value: `${w.temperature}°C`,
                            },
                            { label: "Efficiency", value: w.efficiency },
                            { label: "Uptime", value: w.uptime },
                            { label: "Last Seen", value: w.lastSeen },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className="flex items-center justify-between"
                            >
                              <span
                                className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {row.label}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
                              >
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <Server
                        size={22}
                        className={isDark ? "text-gray-500" : "text-gray-400"}
                      />
                    }
                    title="No workers yet"
                    desc="Workers appear after you purchase a mining plan"
                    isDark={isDark}
                  />
                )}
              </motion.div>
            )}

            {/* ══ STATISTICS ══ */}
            {activeTab === "statistics" && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Mining Statistics
                </h2>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: "All-time Earned",
                          value: `${Number(stats?.allTimeTotals?.amount ?? 0).toFixed(8)} BTC`,
                        },
                        {
                          label: "All-time USD",
                          value: `$${Number(stats?.allTimeTotals?.amountUsd ?? 0).toFixed(2)}`,
                        },
                        {
                          label: "Total Payouts",
                          value: String(stats?.allTimeTotals?.count ?? 0),
                        },
                        {
                          label: "Best Day",
                          value: stats?.bestDay
                            ? `${Number(stats.bestDay.amount).toFixed(8)} BTC`
                            : "—",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-xl p-3 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                        >
                          <p
                            className={`text-[9px] uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {item.label}
                          </p>
                          <p
                            className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {stats?.earningsByCoin?.length ? (
                      <div
                        className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                      >
                        <h3
                          className={`font-semibold text-sm mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          Earnings by Coin
                        </h3>
                        <div className="space-y-2">
                          {stats.earningsByCoin.map((item: any) => (
                            <div
                              key={item.currency}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{
                                    backgroundColor:
                                      COIN_COLORS[item.currency] ?? "#F97316",
                                  }}
                                >
                                  {COIN_ICONS[item.currency] ??
                                    item.currency[0]}
                                </div>
                                <span
                                  className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                  {item.currency}
                                </span>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-xs font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                  {Number(item._sum.amount ?? 0).toFixed(8)}
                                </p>
                                <p
                                  className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  ${Number(item._sum.amountUsd ?? 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                      >
                        <EmptyState
                          icon={
                            <BarChart2
                              size={22}
                              className={
                                isDark ? "text-gray-500" : "text-gray-400"
                              }
                            />
                          }
                          title="No statistics available"
                          desc="Start mining to generate statistics"
                          isDark={isDark}
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ WITHDRAW ══ */}
            {activeTab === "withdraw" && (
              <motion.div
                key="withdraw"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Withdraw Mining Earnings
                </h2>

                {/* Balance Banner */}
                <div
                  className={`rounded-xl p-4 mb-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-base">₿</span>
                    </div>
                    <div>
                      <p
                        className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Available Mining Balance
                      </p>
                      <p
                        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {Number(dashData?.totalEarned ?? 0).toFixed(8)} BTC
                      </p>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        ≈ ${Number(dashData?.totalEarnedUsd ?? 0).toFixed(2)}{" "}
                        USD
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("plans")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Buy More Hashrate
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                  {/* Withdrawal Form */}
                  <div
                    className={`lg:col-span-3 rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                  >
                    <h3
                      className={`font-semibold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      New Withdrawal Request
                    </h3>
                    {withdrawSuccess && (
                      <div className="mb-3 p-3 rounded-xl border border-green-500/30 bg-green-500/10 flex items-start gap-2">
                        <CheckCircle
                          size={13}
                          className="text-green-500 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-green-500">
                          {withdrawSuccess}
                        </p>
                      </div>
                    )}
                    {withdrawError && (
                      <div className="mb-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2">
                        <AlertTriangle
                          size={13}
                          className="text-red-400 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-red-400">{withdrawError}</p>
                      </div>
                    )}
                    <form onSubmit={handleWithdraw} className="space-y-3">
                      {/* Destination */}
                      <div>
                        <label
                          className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Destination
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              id: "EXTERNAL" as const,
                              label: "External Wallet",
                              desc: "Send to your crypto address",
                              icon: <ExternalLink size={13} />,
                            },
                            {
                              id: "INTERNAL" as const,
                              label: "Trading Wallet",
                              desc: "Transfer to your account",
                              icon: <Wallet size={13} />,
                            },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setWithdrawDest(opt.id)}
                              className={`p-3 rounded-xl border transition-all text-left ${withdrawDest === opt.id ? "border-orange-500 bg-orange-500/5" : isDark ? "border-gray-700/60 bg-gray-700/30 hover:border-gray-600" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  className={
                                    withdrawDest === opt.id
                                      ? "text-orange-500"
                                      : isDark
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                  }
                                >
                                  {opt.icon}
                                </span>
                                <span
                                  className={`text-xs font-semibold ${withdrawDest === opt.id ? "text-orange-500" : isDark ? "text-white" : "text-gray-900"}`}
                                >
                                  {opt.label}
                                </span>
                                {withdrawDest === opt.id && (
                                  <CheckCircle
                                    size={11}
                                    className="text-orange-500 ml-auto"
                                  />
                                )}
                              </div>
                              <p
                                className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {opt.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Currency */}
                      <div>
                        <label
                          className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Currency
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {PURCHASE_CRYPTOS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setWithdrawCurrency(c.symbol)}
                              className={`py-1 px-2 rounded-lg border transition-all flex items-center gap-1 text-xs font-semibold ${withdrawCurrency === c.symbol ? "border-orange-500 bg-orange-500/5 text-orange-500" : isDark ? "border-gray-700/60 text-gray-300 hover:border-gray-600" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                            >
                              <CryptoIcon symbol={c.symbol} size="xs" />
                              {c.symbol}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <label
                          className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.00000001"
                            min="0"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs border focus:outline-none focus:border-orange-500 transition-colors ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                            placeholder="0.00000000"
                            required
                          />
                          <span
                            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center ${isDark ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-300 text-gray-600"}`}
                          >
                            {withdrawCurrency}
                          </span>
                        </div>
                        {dashData && (
                          <button
                            type="button"
                            onClick={() =>
                              setWithdrawAmount(
                                Number(dashData.totalEarned).toFixed(8),
                              )
                            }
                            className="text-[10px] text-orange-500 hover:text-orange-400 mt-1"
                          >
                            Use max: {Number(dashData.totalEarned).toFixed(8)}{" "}
                            BTC
                          </button>
                        )}
                      </div>

                      {/* Wallet Address (External only) */}
                      {withdrawDest === "EXTERNAL" && (
                        <div>
                          <label
                            className={`text-xs font-medium block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {withdrawCurrency} Wallet Address
                          </label>
                          <input
                            type="text"
                            value={withdrawAddress}
                            onChange={(e) => setWithdrawAddress(e.target.value)}
                            className={`w-full rounded-lg px-3 py-2 text-xs border focus:outline-none focus:border-orange-500 transition-colors font-mono ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                            placeholder={`Enter your ${withdrawCurrency} wallet address`}
                            required={withdrawDest === "EXTERNAL"}
                          />
                          {wallets.filter(
                            (w) => w.currency === withdrawCurrency,
                          ).length > 0 && (
                            <div className="mt-1.5">
                              <p
                                className={`text-[10px] mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                              >
                                Saved addresses:
                              </p>
                              <div className="space-y-1">
                                {wallets
                                  .filter(
                                    (w) => w.currency === withdrawCurrency,
                                  )
                                  .map((w) => (
                                    <button
                                      key={w.id}
                                      type="button"
                                      onClick={() =>
                                        setWithdrawAddress(w.address)
                                      }
                                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-left transition-all text-[10px] ${withdrawAddress === w.address ? "border-orange-500 bg-orange-500/5" : isDark ? "border-gray-700 hover:border-gray-600" : "border-gray-200 hover:border-gray-300"}`}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <span
                                          className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                                        >
                                          {w.label}
                                        </span>
                                        <span
                                          className={`ml-1 font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}
                                        >
                                          {w.address.slice(0, 12)}...
                                          {w.address.slice(-6)}
                                        </span>
                                      </div>
                                      {w.isDefault && (
                                        <span className="text-orange-500 text-[9px] font-bold">
                                          DEFAULT
                                        </span>
                                      )}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Internal transfer info */}
                      {withdrawDest === "INTERNAL" && (
                        <div
                          className={`rounded-lg p-3 border ${isDark ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-50 border-blue-200"} flex items-start gap-2`}
                        >
                          <Info
                            size={13}
                            className="text-blue-400 flex-shrink-0 mt-0.5"
                          />
                          <p
                            className={`text-[10px] ${isDark ? "text-blue-400" : "text-blue-600"}`}
                          >
                            This will instantly transfer your mining earnings to
                            your M4Capital trading wallet. No external address
                            needed.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={withdrawSubmitting}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-60"
                      >
                        {withdrawSubmitting
                          ? "Processing..."
                          : withdrawDest === "INTERNAL"
                            ? "Transfer to Trading Wallet"
                            : `Withdraw ${withdrawCurrency}`}
                      </button>
                    </form>
                  </div>

                  {/* Info Panel */}
                  <div className="lg:col-span-2 space-y-3">
                    <div
                      className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                    >
                      <h4
                        className={`font-semibold text-xs mb-2.5 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Withdrawal Info
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            label: "Processing Time",
                            value:
                              withdrawDest === "INTERNAL"
                                ? "Instant"
                                : "1-3 business days",
                          },
                          { label: "Min. Amount", value: "0.001 BTC" },
                          { label: "Network Fee", value: "Included" },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between text-xs"
                          >
                            <span
                              className={
                                isDark ? "text-gray-400" : "text-gray-500"
                              }
                            >
                              {row.label}
                            </span>
                            <span
                              className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl p-3 border border-orange-500/20 bg-orange-500/5 flex items-start gap-2">
                      <Shield
                        size={13}
                        className="text-orange-400 flex-shrink-0 mt-0.5"
                      />
                      <p
                        className={`text-[10px] ${isDark ? "text-gray-300" : "text-gray-600"}`}
                      >
                        Always verify your wallet address before submitting.
                        Transactions are irreversible.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Withdrawal History */}
                <div
                  className={`rounded-xl border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <div
                    className={`px-4 py-3 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                  >
                    <h3
                      className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Withdrawal History
                    </h3>
                  </div>
                  {withdrawLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <RefreshCw
                        size={18}
                        className="animate-spin text-orange-500"
                      />
                    </div>
                  ) : withdrawals.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className={`text-[10px] font-medium ${isDark ? "text-gray-400 bg-gray-700/30" : "text-gray-500 bg-gray-50"}`}
                          >
                            {[
                              "Date",
                              "Currency",
                              "Amount",
                              "Destination",
                              "Address",
                              "Status",
                            ].map((h) => (
                              <th key={h} className="px-3 py-2 text-left">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.map((w) => (
                            <tr
                              key={w.id}
                              className={`border-t text-xs ${isDark ? "border-gray-700/40 hover:bg-gray-700/30" : "border-gray-100 hover:bg-gray-50"}`}
                            >
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {new Date(w.createdAt).toLocaleDateString()}
                              </td>
                              <td
                                className={`px-3 py-2 font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                              >
                                {w.currency}
                              </td>
                              <td
                                className={`px-3 py-2 font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                              >
                                {Number(w.amount).toFixed(8)}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${w.destinationType === "INTERNAL" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}
                                >
                                  {w.destinationType === "INTERNAL"
                                    ? "Internal"
                                    : "External"}
                                </span>
                              </td>
                              <td
                                className={`px-3 py-2 font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {w.walletAddress
                                  ? `${w.walletAddress.slice(0, 10)}...`
                                  : "Trading Wallet"}
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge status={w.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <Download
                          size={22}
                          className={isDark ? "text-gray-500" : "text-gray-400"}
                        />
                      }
                      title="No withdrawals yet"
                      desc="Your withdrawal history will appear here"
                      isDark={isDark}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ TRANSACTIONS ══ */}
            {/* ══ TRANSACTIONS ══ */}
            {activeTab === "transactions" && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Transaction History
                  </h2>
                  <span
                    className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {transactions.length} records
                  </span>
                </div>
                {/* Type filters */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    {
                      type: "EARNING",
                      label: "Earnings",
                      color: "text-green-500",
                      bg: "bg-green-500/10",
                    },
                    {
                      type: "PURCHASE",
                      label: "Purchases",
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                    },
                    {
                      type: "WITHDRAWAL",
                      label: "Withdrawals",
                      color: "text-red-400",
                      bg: "bg-red-500/10",
                    },
                  ].map((t) => {
                    const count = transactions.filter(
                      (tx) => tx.type === t.type,
                    ).length;
                    return (
                      <div
                        key={t.type}
                        className={`rounded-xl p-3 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                      >
                        <p
                          className={`text-[9px] uppercase tracking-wide mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {t.label}
                        </p>
                        <p
                          className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {count}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div
                  className={`rounded-xl border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  {txLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <RefreshCw
                        size={18}
                        className="animate-spin text-orange-500"
                      />
                    </div>
                  ) : transactions.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className={`text-[10px] font-medium ${isDark ? "text-gray-400 bg-gray-700/30" : "text-gray-500 bg-gray-50"}`}
                          >
                            {[
                              "Date",
                              "Type",
                              "Description",
                              "Amount",
                              "Currency",
                              "Status",
                            ].map((h) => (
                              <th key={h} className="px-3 py-2 text-left">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr
                              key={tx.id}
                              className={`border-t text-xs ${isDark ? "border-gray-700/40 hover:bg-gray-700/30" : "border-gray-100 hover:bg-gray-50"}`}
                            >
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                              >
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    tx.type === "EARNING"
                                      ? "bg-green-500/10 text-green-500"
                                      : tx.type === "PURCHASE"
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "bg-red-500/10 text-red-400"
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td
                                className={`px-3 py-2 max-w-[140px] truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {tx.description}
                              </td>
                              <td
                                className={`px-3 py-2 font-mono font-medium ${tx.direction === "IN" ? "text-green-500" : "text-red-400"}`}
                              >
                                {tx.direction === "IN" ? "+" : "-"}
                                {tx.type === "EARNING"
                                  ? Number(tx.amount).toFixed(8)
                                  : `$${Number(tx.amount).toLocaleString()}`}
                              </td>
                              <td
                                className={`px-3 py-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {tx.currency}
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge status={tx.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        <RefreshCw
                          size={22}
                          className={isDark ? "text-gray-500" : "text-gray-400"}
                        />
                      }
                      title="No transactions yet"
                      desc="Your mining transactions will appear here"
                      isDark={isDark}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ WALLETS ══ */}
            {activeTab === "wallets" && (
              <motion.div
                key="wallets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Saved Wallet Addresses
                </h2>
                <div
                  className={`rounded-xl p-4 border mb-4 ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <h3
                    className={`font-semibold text-sm mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Add Wallet Address
                  </h3>
                  {walletSuccess && (
                    <div className="mb-3 p-3 rounded-xl border border-green-500/30 bg-green-500/10 flex items-start gap-2">
                      <CheckCircle
                        size={13}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-green-500">{walletSuccess}</p>
                    </div>
                  )}
                  {walletError && (
                    <div className="mb-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2">
                      <AlertTriangle
                        size={13}
                        className="text-red-400 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-red-400">{walletError}</p>
                    </div>
                  )}
                  <form
                    onSubmit={handleSaveWallet}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                  >
                    <div>
                      <label
                        className={`text-[10px] font-medium block mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Label
                      </label>
                      <input
                        type="text"
                        value={newWalletLabel}
                        onChange={(e) => setNewWalletLabel(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-2 text-xs border focus:outline-none focus:border-orange-500 ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                        placeholder="My BTC Wallet"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        className={`text-[10px] font-medium block mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        className={`w-full rounded-lg px-2.5 py-2 text-xs border focus:outline-none focus:border-orange-500 font-mono ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`}
                        placeholder="1A1zP1eP5QGe..."
                        required
                      />
                    </div>
                    <div>
                      <label
                        className={`text-[10px] font-medium block mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Currency
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={newWalletCurrency}
                          onChange={(e) => setNewWalletCurrency(e.target.value)}
                          className={`flex-1 rounded-lg px-2.5 py-2 text-xs border focus:outline-none focus:border-orange-500 ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                        >
                          {PURCHASE_CRYPTOS.map((c) => (
                            <option key={c.id} value={c.symbol}>
                              {c.symbol} — {c.network ?? c.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={walletSaving}
                          className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-60"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                {walletsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                  </div>
                ) : wallets.length ? (
                  <div className="space-y-2">
                    {wallets.map((w) => (
                      <div
                        key={w.id}
                        className={`rounded-xl p-3.5 border flex items-center gap-3 ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{
                            backgroundColor:
                              COIN_COLORS[w.currency] ?? "#F97316",
                          }}
                        >
                          {COIN_ICONS[w.currency] ?? w.currency[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {w.label}
                            </p>
                            {w.isDefault && (
                              <span className="text-[9px] font-bold bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[10px] font-mono truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {w.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <CopyButton text={w.address} />
                          <button
                            onClick={() => handleDeleteWallet(w.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={
                      <Wallet
                        size={22}
                        className={isDark ? "text-gray-500" : "text-gray-400"}
                      />
                    }
                    title="No saved wallets"
                    desc="Save your crypto wallet addresses for quick withdrawals"
                    isDark={isDark}
                  />
                )}
              </motion.div>
            )}

            {/* ══ REFERRAL ══ */}
            {activeTab === "referral" && (
              <motion.div
                key="referral"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Referral Program
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    {
                      label: "Your Referrals",
                      value: "0",
                      icon: <Users size={16} className="text-blue-400" />,
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Referral Earnings",
                      value: "0.00 BTC",
                      icon: <DollarSign size={16} className="text-green-400" />,
                      bg: "bg-green-500/10",
                    },
                    {
                      label: "Commission Rate",
                      value: "5%",
                      icon: (
                        <TrendingUp size={16} className="text-orange-400" />
                      ),
                      bg: "bg-orange-500/10",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                    >
                      <div className={`p-2 rounded-lg w-fit mb-2 ${item.bg}`}>
                        {item.icon}
                      </div>
                      <p
                        className={`text-[10px] uppercase tracking-wide mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className={`rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <h3
                    className={`font-semibold text-sm mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Your Referral Link
                  </h3>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg border ${isDark ? "bg-gray-700/60 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                  >
                    <input
                      readOnly
                      value={`https://m4capital.com/ref/${session?.user?.id?.slice(0, 8) ?? "xxxxxx"}`}
                      className={`flex-1 text-xs font-mono bg-transparent focus:outline-none ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    />
                    <CopyButton
                      text={`https://m4capital.com/ref/${session?.user?.id?.slice(0, 8) ?? "xxxxxx"}`}
                    />
                  </div>
                  <p
                    className={`text-[10px] mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Earn 5% commission on all mining earnings of your referred
                    users.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ══ SECURITY ══ */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Security Settings
                </h2>
                <div className="space-y-3 max-w-lg">
                  {[
                    {
                      label: "Two-Factor Authentication",
                      desc: "Add an extra layer of security",
                      enabled: false,
                    },
                    {
                      label: "Email Notifications",
                      desc: "Get alerts for withdrawals",
                      enabled: true,
                    },
                    {
                      label: "IP Whitelist",
                      desc: "Restrict access to trusted IPs",
                      enabled: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-4 border flex items-center justify-between ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                    >
                      <div>
                        <p
                          className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {item.desc}
                        </p>
                      </div>
                      <div
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.enabled ? "bg-orange-500" : isDark ? "bg-gray-600" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.enabled ? "translate-x-[18px]" : "translate-x-[2px]"}`}
                        />
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/settings"
                    className={`flex items-center justify-between rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60 hover:border-orange-500/30" : "bg-white border-gray-200 hover:border-orange-300"} shadow-sm transition-all`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Full Security Settings
                      </p>
                      <p
                        className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Manage all security options in Account Settings
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={isDark ? "text-gray-400" : "text-gray-500"}
                    />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ══ ACCOUNT ══ */}
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2
                  className={`text-base font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Account Settings
                </h2>
                <div
                  className={`rounded-xl p-4 border mb-3 ${isDark ? "bg-gray-800 border-gray-700/60" : "bg-white border-gray-200"} shadow-sm`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {(session?.user?.name ??
                          session?.user?.email ??
                          "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {session?.user?.name ?? "User"}
                      </p>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Account ID",
                        value: (session?.user?.id?.slice(0, 12) ?? "—") + "...",
                      },
                      { label: "Role", value: session?.user?.role ?? "USER" },
                      {
                        label: "Mining Status",
                        value: dashData?.activeContracts
                          ? "Active Miner"
                          : "Not Mining",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between py-1.5 border-b ${isDark ? "border-gray-700/60" : "border-gray-100"}`}
                      >
                        <span
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {row.label}
                        </span>
                        <span
                          className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href="/settings"
                  className={`flex items-center justify-between rounded-xl p-4 border ${isDark ? "bg-gray-800 border-gray-700/60 hover:border-orange-500/30" : "bg-white border-gray-200 hover:border-orange-300"} shadow-sm transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={16} className="text-orange-500" />
                    <div>
                      <p
                        className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        Full Account Settings
                      </p>
                      <p
                        className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Profile, notifications, KYC, and more
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={isDark ? "text-gray-400" : "text-gray-500"}
                  />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className={`text-center py-3 text-[10px] border-t ${isDark ? "border-gray-700/60 text-gray-600" : "border-gray-200 text-gray-400"}`}
        >
          © 2025 F2 Pool Mining. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
