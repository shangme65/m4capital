"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Activity,
  Cpu,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Thermometer,
  MapPin,
  ChevronDown,
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
  ExternalLink,
  X,
  Calculator,
  Server,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Demo data ────────────────────────────────────────────────────────────────

const HASHRATE_DATA = [
  { label: "May 02", value: 68 },
  { label: "May 03", value: 72 },
  { label: "May 04", value: 65 },
  { label: "May 05", value: 88 },
  { label: "May 06", value: 95 },
  { label: "May 07", value: 110 },
  { label: "May 08", value: 125.5 },
];

const CONTRACTS = [
  {
    id: 1,
    coin: "BTC",
    name: "Bitcoin",
    algorithm: "SHA-256",
    hashrate: "100 PH/s",
    startDate: "May 02, 2025",
    status: "ACTIVE",
    color: "#F97316",
    icon: "₿",
  },
  {
    id: 2,
    coin: "ETH",
    name: "Ethereum",
    algorithm: "Ethash",
    hashrate: "15.50 GH/s",
    startDate: "Apr 28, 2025",
    status: "ACTIVE",
    color: "#627EEA",
    icon: "Ξ",
  },
  {
    id: 3,
    coin: "USDT",
    name: "USDT (TRC20)",
    algorithm: "SHA-256",
    hashrate: "10 PH/s",
    startDate: "Apr 25, 2025",
    status: "ACTIVE",
    color: "#26A17B",
    icon: "₮",
  },
];

const ACTIVITY = [
  {
    id: 1,
    date: "May 08, 2025, 02:15:33 PM",
    type: "Hashrate Update",
    details: "Increased hashrate",
    hashrate: "125.50 PH/s",
    status: "Success",
  },
  {
    id: 2,
    date: "May 08, 2025, 01:10:12 PM",
    type: "Payout",
    details: "Daily mining payout",
    hashrate: "0.00485234 BTC",
    status: "Completed",
  },
  {
    id: 3,
    date: "May 07, 2025, 11:45:51 AM",
    type: "Maintenance",
    details: "System optimization",
    hashrate: "—",
    status: "Completed",
  },
  {
    id: 4,
    date: "May 07, 2025, 09:20:43 AM",
    type: "Worker Online",
    details: "Worker #12 online",
    hashrate: "125.50 PH/s",
    status: "Success",
  },
  {
    id: 5,
    date: "May 06, 2025, 06:33:22 PM",
    type: "Contract Started",
    details: "Bitcoin mining contract",
    hashrate: "100 PH/s",
    status: "Success",
  },
];

const MINING_PLANS = [
  {
    id: 1,
    name: "Starter",
    hashrate: "50 TH/s",
    price: "$299",
    duration: "30 Days",
    dailyProfit: "0.00042 BTC",
    popular: false,
  },
  {
    id: 2,
    name: "Professional",
    hashrate: "500 TH/s",
    price: "$2,499",
    duration: "90 Days",
    dailyProfit: "0.0042 BTC",
    popular: true,
  },
  {
    id: 3,
    name: "Enterprise",
    hashrate: "5 PH/s",
    price: "$18,999",
    duration: "180 Days",
    dailyProfit: "0.042 BTC",
    popular: false,
  },
];

// ─── Circular Progress ────────────────────────────────────────────────────────

function CircularProgress({
  value,
  size = 140,
  strokeWidth = 10,
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

// ─── Hashrate SVG Chart ───────────────────────────────────────────────────────

function HashrateChart({ isDark }: { isDark: boolean }) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState("7 Days");
  const W = 500;
  const H = 160;
  const pad = { top: 16, right: 20, bottom: 32, left: 44 };

  const data = HASHRATE_DATA;
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.15;
  const minVal = 0;

  const toX = (i: number) =>
    pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const toY = (v: number) =>
    pad.top + ((maxVal - v) / (maxVal - minVal)) * (H - pad.top - pad.bottom);

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.value)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${toX(data.length - 1)} ${H - pad.bottom} L ${toX(0)} ${H - pad.bottom} Z`;

  const gridLines = [0, 40, 80, 120, 160].filter((v) => v <= maxVal);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Hashrate Chart
        </h3>
        <div className="flex gap-2">
          {["24H", "7 Days", "30 Days"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                timeRange === r
                  ? "bg-orange-500 text-white"
                  : isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full" style={{ paddingTop: "35%" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => {
            const y = pad.top + frac * (H - pad.top - pad.bottom);
            const val = Math.round(maxVal * (1 - frac));
            return (
              <g key={frac}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={W - pad.right}
                  y2={y}
                  stroke={isDark ? "#374151" : "#E5E7EB"}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  fill={isDark ? "#6B7280" : "#9CA3AF"}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={toX(i)}
                cy={toY(d.value)}
                r="5"
                fill={activePoint === i ? "#F97316" : "white"}
                stroke="#F97316"
                strokeWidth="2.5"
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(i)}
                onMouseLeave={() => setActivePoint(null)}
              />
              {/* X-axis label */}
              <text
                x={toX(i)}
                y={H - 4}
                textAnchor="middle"
                fontSize="9"
                fill={isDark ? "#6B7280" : "#9CA3AF"}
              >
                {d.label}
              </text>
              {/* Tooltip */}
              {activePoint === i && (
                <g>
                  <rect
                    x={toX(i) - 42}
                    y={toY(d.value) - 30}
                    width="84"
                    height="24"
                    rx="4"
                    fill={isDark ? "#1F2937" : "#111827"}
                  />
                  <text
                    x={toX(i)}
                    y={toY(d.value) - 14}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="600"
                  >
                    {d.label}: {d.value} PH/s
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function CountdownTimer({ isDark }: { isDark: boolean }) {
  const [time, setTime] = useState({ h: 7, m: 45, s: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
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
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className={`text-center rounded-md px-2 py-1 min-w-[36px] ${
              isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            <span className="text-sm font-bold tabular-nums">{val}</span>
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  change,
  positive,
  icon,
  iconBg,
  isDark,
  trend,
}: {
  title: string;
  value: string;
  sub: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  isDark: boolean;
  trend?: number[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border transition-all ${
        isDark
          ? "bg-gray-800 border-gray-700/60 hover:border-orange-500/40"
          : "bg-white border-gray-200 hover:border-orange-300"
      } shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className={`text-xs font-medium uppercase tracking-wide mb-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>
          <p
            className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            ≈ {sub}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <div className="flex items-center gap-1.5">
        {positive ? (
          <ArrowUpRight size={13} className="text-green-500" />
        ) : (
          <ArrowDownRight size={13} className="text-red-500" />
        )}
        <span
          className={`text-xs font-semibold ${positive ? "text-green-500" : "text-red-500"}`}
        >
          {change}
        </span>
        <span
          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          vs yesterday
        </span>
        {/* Mini sparkline */}
        {trend && (
          <svg width="48" height="18" viewBox="0 0 48 18" className="ml-auto">
            <polyline
              points={trend
                .map(
                  (v, i) =>
                    `${(i / (trend.length - 1)) * 48},${18 - (v / Math.max(...trend)) * 14}`,
                )
                .join(" ")}
              fill="none"
              stroke={positive ? "#22C55E" : "#EF4444"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function F2PoolMiningPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "withdraw" | "plans"
  >("dashboard");
  const [calcHashrate, setCalcHashrate] = useState("100");
  const [calcDuration, setCalcDuration] = useState("30");
  const [withdrawMethod, setWithdrawMethod] = useState("BTC");
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const estimatedEarnings = (
    (parseFloat(calcHashrate) || 0) *
    0.00116457 *
    (parseInt(calcDuration) / 30)
  ).toFixed(8);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const WITHDRAWAL_METHODS = [
    {
      id: "BTC",
      name: "Bitcoin (BTC)",
      time: "1-3 business days",
      color: "#F97316",
      icon: "₿",
    },
    {
      id: "USDT",
      name: "USDT (TRC20)",
      time: "1-3 business days",
      color: "#26A17B",
      icon: "₮",
    },
    {
      id: "ETH",
      name: "Ethereum (ETH)",
      time: "1-3 business days",
      color: "#627EEA",
      icon: "Ξ",
    },
    {
      id: "LTC",
      name: "Litecoin (LTC)",
      time: "1-3 business days",
      color: "#9CA3AF",
      icon: "Ł",
    },
    {
      id: "BNB",
      name: "BNB (BEP20)",
      time: "1-3 business days",
      color: "#F3BA2F",
      icon: "B",
    },
  ];

  const WITHDRAWAL_HISTORY = [
    {
      date: "May 08, 2025, 14:28:35",
      method: "BTC",
      amount: "6.00000000 BTC",
      usd: "$6,000,000.00",
      fee: "0.00850000 BTC",
      feeUsd: "$8,500.00",
      status: "Pending",
      txid: null,
    },
    {
      date: "May 04, 2025, 10:15:20",
      method: "USDT",
      amount: "12,500 USDT",
      usd: "$12,500",
      fee: "Free",
      feeUsd: "",
      status: "Completed",
      txid: "7f3a...8d2e9",
    },
    {
      date: "Apr 30, 2025, 09:42:11",
      method: "LTC",
      amount: "8.25000000 LTC",
      usd: "$1,120.50",
      fee: "Free",
      feeUsd: "",
      status: "Completed",
      txid: "a1b2...4c5d6",
    },
    {
      date: "Apr 25, 2025, 16:30:45",
      method: "BTC",
      amount: "0.00125000 BTC",
      usd: "$46,875.00",
      fee: "Free",
      feeUsd: "",
      status: "Completed",
      txid: "3e4f...9a0b1",
    },
    {
      date: "Apr 20, 2025, 11:05:33",
      method: "BNB",
      amount: "3.50000000 BNB",
      usd: "$2,100.00",
      fee: "Free",
      feeUsd: "",
      status: "Completed",
      txid: "0c1d...2e3f4",
    },
  ];

  return (
    <div
      className={`min-h-full transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* ── Top Header Bar ──────────────────────────────────────────── */}
      <div
        className={`sticky top-0 z-10 px-4 sm:px-6 py-3 border-b flex items-center justify-between ${
          isDark ? "bg-gray-900 border-gray-700/60" : "bg-white border-gray-200"
        } shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F2</span>
            </div>
            <div>
              <p
                className={`text-sm font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}
              >
                F2 Pool Mining
              </p>
              <p
                className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Mine Today, Secure Tomorrow
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-1 rounded-xl p-1 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          {(
            [
              {
                id: "dashboard",
                label: "Dashboard",
                icon: <BarChart2 size={13} />,
              },
              { id: "plans", label: "Mining Plans", icon: <Star size={13} /> },
              { id: "withdraw", label: "Withdraw", icon: <Wallet size={13} /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Switch */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Auto Switch
            </span>
            <button
              onClick={() => setAutoSwitch(!autoSwitch)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                autoSwitch
                  ? "bg-orange-500"
                  : isDark
                    ? "bg-gray-600"
                    : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  autoSwitch ? "translate-x-[18px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Start Mining
          </motion.button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════════
              DASHBOARD TAB
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 mb-5 text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Dashboard
                </span>
                <ChevronRight
                  size={12}
                  className={isDark ? "text-gray-600" : "text-gray-400"}
                />
                <span className="text-orange-500 font-medium">Mining</span>
              </div>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <StatCard
                  title="Active Hashrate"
                  value="125.50 PH/s"
                  sub="$8,974.25 / day"
                  change="+12.5%"
                  positive
                  icon={<Activity size={18} className="text-orange-500" />}
                  iconBg="bg-orange-500/10"
                  isDark={isDark}
                  trend={[60, 70, 65, 80, 95, 110, 125]}
                />
                <StatCard
                  title="Active Miners"
                  value="348"
                  sub="Online: 336 / Offline: 12"
                  change="+4 workers"
                  positive
                  icon={<Server size={18} className="text-green-500" />}
                  iconBg="bg-green-500/10"
                  isDark={isDark}
                  trend={[300, 310, 320, 330, 336, 342, 348]}
                />
                <StatCard
                  title="Daily Earnings"
                  value="0.00485234 BTC"
                  sub="$291.45"
                  change="+8.21%"
                  positive
                  icon={<DollarSign size={18} className="text-blue-500" />}
                  iconBg="bg-blue-500/10"
                  isDark={isDark}
                  trend={[240, 255, 260, 270, 275, 285, 291]}
                />
                <StatCard
                  title="Monthly Earnings"
                  value="0.14651243 BTC"
                  sub="$8,789.12"
                  change="+15.48%"
                  positive
                  icon={<TrendingUp size={18} className="text-purple-500" />}
                  iconBg="bg-purple-500/10"
                  isDark={isDark}
                  trend={[7000, 7400, 7600, 7900, 8100, 8500, 8789]}
                />
              </div>

              {/* ── Chart + Mining Status ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Hashrate Chart */}
                <div
                  className={`lg:col-span-2 rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <HashrateChart isDark={isDark} />
                </div>

                {/* Mining Status */}
                <div
                  className={`rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <h3
                    className={`font-semibold text-base mb-5 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Mining Status
                  </h3>

                  <div className="flex flex-col items-center mb-5">
                    <div className="relative">
                      <CircularProgress
                        value={97}
                        size={130}
                        strokeWidth={10}
                        color="#22C55E"
                        isDark={isDark}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          97%
                        </span>
                        <span
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Uptime
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Status",
                        value: "ACTIVE",
                        badge: true,
                        color: "green",
                      },
                      { label: "Started", value: "May 02, 2025 10:15 AM" },
                      { label: "Algorithm", value: "SHA-256" },
                      { label: "Pool", value: "F2 Pool" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between py-1.5 border-b ${
                          isDark ? "border-gray-700/60" : "border-gray-100"
                        }`}
                      >
                        <span
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {row.label}
                        </span>
                        {row.badge ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                            {row.value}
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-medium ${
                              isDark ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {row.value}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Next Payout Countdown */}
                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Next Payout
                      </span>
                      <CountdownTimer isDark={isDark} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Mining Rig + Contracts ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Your Mining Rig */}
                <div
                  className={`rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Your Mining Rig
                    </h3>
                    <button
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark
                          ? "hover:bg-gray-700 text-gray-400"
                          : "hover:bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Settings size={14} />
                    </button>
                  </div>

                  <div className="flex gap-4">
                    {/* Rig visual */}
                    <div
                      className={`w-28 h-28 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        isDark ? "bg-gray-700/60" : "bg-gray-100"
                      }`}
                    >
                      <div className="relative">
                        <Server
                          size={48}
                          className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                        />
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      {[
                        {
                          label: "Rig Name",
                          value: "F2-MINER-01",
                          editable: true,
                        },
                        { label: "Total Hashrate", value: "125.50 PH/s" },
                        { label: "Power Usage", value: "3.25 kW" },
                        { label: "Efficiency", value: "38.6 J/TH" },
                        {
                          label: "Temperature",
                          value: "42°C",
                          badge: "Normal",
                          badgeColor: "green",
                        },
                        { label: "Location", value: "USA 🇺🇸" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between"
                        >
                          <span
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {row.label}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-medium ${
                                isDark ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {row.value}
                            </span>
                            {row.badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  row.badgeColor === "green"
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {row.badge}
                              </span>
                            )}
                            {row.editable && (
                              <button
                                className={`p-0.5 rounded transition-colors ${
                                  isDark
                                    ? "hover:bg-gray-600 text-gray-500"
                                    : "hover:bg-gray-100 text-gray-400"
                                }`}
                              >
                                <Settings size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mining Contracts */}
                <div
                  className={`rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Mining Contracts
                    </h3>
                    <button
                      onClick={() => setActiveTab("plans")}
                      className="text-orange-500 hover:text-orange-400 text-xs font-semibold transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {CONTRACTS.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          isDark
                            ? "bg-gray-700/50 border-gray-600/50"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: c.color }}
                          >
                            {c.icon}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {c.name}
                            </p>
                            <p
                              className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {c.algorithm}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {c.hashrate}
                          </p>
                          <p
                            className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {c.startDate}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 ml-2">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Recent Activity + Profit Calculator ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Mining Activity */}
                <div
                  className={`lg:col-span-2 rounded-xl border overflow-hidden ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <div
                    className={`flex items-center justify-between px-5 py-4 border-b ${
                      isDark ? "border-gray-700/60" : "border-gray-100"
                    }`}
                  >
                    <h3
                      className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Recent Mining Activity
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className={`text-xs font-medium ${
                            isDark
                              ? "text-gray-400 bg-gray-700/30"
                              : "text-gray-500 bg-gray-50"
                          }`}
                        >
                          {[
                            "Date",
                            "Type",
                            "Details",
                            "Hashrate",
                            "Status",
                          ].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ACTIVITY.map((a, idx) => (
                          <tr
                            key={a.id}
                            className={`border-t text-xs transition-colors ${
                              isDark
                                ? "border-gray-700/40 hover:bg-gray-700/30"
                                : "border-gray-100 hover:bg-gray-50"
                            }`}
                          >
                            <td
                              className={`px-4 py-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {a.date}
                            </td>
                            <td
                              className={`px-4 py-3 font-medium ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {a.type}
                            </td>
                            <td
                              className={`px-4 py-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                            >
                              {a.details}
                            </td>
                            <td
                              className={`px-4 py-3 font-mono text-xs ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {a.hashrate}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  a.status === "Success"
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : a.status === "Completed"
                                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                      : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                }`}
                              >
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Profit Calculator */}
                <div
                  className={`rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator size={16} className="text-orange-500" />
                    <h3
                      className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Profit Calculator
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        className={`text-xs font-medium block mb-1.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Hashrate
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={calcHashrate}
                          onChange={(e) => setCalcHashrate(e.target.value)}
                          className={`flex-1 rounded-lg px-3 py-2 text-sm border focus:outline-none focus:border-orange-500 transition-colors ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          }`}
                          placeholder="100"
                        />
                        <div
                          className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center ${
                            isDark
                              ? "bg-gray-700 border-gray-600 text-gray-300"
                              : "bg-gray-50 border-gray-300 text-gray-600"
                          }`}
                        >
                          PH/s
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        className={`text-xs font-medium block mb-1.5 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Duration (Days)
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["30", "90", "180"].map((d) => (
                          <button
                            key={d}
                            onClick={() => setCalcDuration(d)}
                            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                              calcDuration === d
                                ? "bg-orange-500 text-white"
                                : isDark
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {d}D
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`rounded-xl p-4 ${
                        isDark ? "bg-gray-700/60" : "bg-orange-50"
                      }`}
                    >
                      <p
                        className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Estimated Earnings
                      </p>
                      <p className="text-xl font-bold text-orange-500">
                        {estimatedEarnings} BTC
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        ≈ $
                        {(parseFloat(estimatedEarnings) * 60000).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 },
                        )}{" "}
                        USD
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                    >
                      Calculate Profit
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              MINING PLANS TAB
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "plans" && (
            <motion.div
              key="plans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-1.5 mb-5 text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Dashboard
                </span>
                <ChevronRight
                  size={12}
                  className={isDark ? "text-gray-600" : "text-gray-400"}
                />
                <span className="text-orange-500 font-medium">
                  Mining Plans
                </span>
              </div>

              <div className="text-center mb-8">
                <h2
                  className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Choose Your Mining Plan
                </h2>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Select the perfect hashrate plan for your mining goals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                {MINING_PLANS.map((plan, idx) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative rounded-2xl p-6 border transition-all ${
                      plan.popular
                        ? "border-orange-500 shadow-lg shadow-orange-500/10"
                        : isDark
                          ? "border-gray-700/60 bg-gray-800"
                          : "border-gray-200 bg-white"
                    } ${plan.popular ? (isDark ? "bg-gray-800" : "bg-white") : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-5">
                      <div
                        className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                          plan.popular
                            ? "bg-orange-500"
                            : isDark
                              ? "bg-gray-700"
                              : "bg-gray-100"
                        }`}
                      >
                        <Cpu
                          size={24}
                          className={
                            plan.popular
                              ? "text-white"
                              : isDark
                                ? "text-gray-300"
                                : "text-gray-600"
                          }
                        />
                      </div>
                      <h3
                        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {plan.name}
                      </h3>
                      <p className="text-3xl font-bold text-orange-500 mt-2">
                        {plan.price}
                      </p>
                      <p
                        className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {plan.duration}
                      </p>
                    </div>

                    <div className="space-y-3 mb-5">
                      {[
                        { label: "Hashrate", value: plan.hashrate },
                        { label: "Daily Profit", value: plan.dailyProfit },
                        { label: "Contract Duration", value: plan.duration },
                        { label: "Algorithm", value: "SHA-256" },
                        { label: "Pool Fee", value: "0.0%" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className={`flex justify-between text-sm border-b pb-2 ${
                            isDark ? "border-gray-700/60" : "border-gray-100"
                          }`}
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

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        plan.popular
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                          : isDark
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                    >
                      Buy Hashrate
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              WITHDRAW TAB
          ══════════════════════════════════════════════════════════ */}
          {activeTab === "withdraw" && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-1.5 mb-5 text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Dashboard
                </span>
                <ChevronRight
                  size={12}
                  className={isDark ? "text-gray-600" : "text-gray-400"}
                />
                <span className="text-orange-500 font-medium">Withdraw</span>
              </div>

              {/* Mining Wallet Banner */}
              <div
                className={`rounded-2xl p-5 mb-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDark
                    ? "bg-gray-800 border-gray-700/60"
                    : "bg-white border-gray-200"
                } shadow-sm`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">₿</span>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Mining Wallet Balance
                    </p>
                    <p
                      className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      0.15263847 BTC
                    </p>
                    <p
                      className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      ≈ $9,125,842.68 USD
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Deposit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${
                      isDark
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Buy Hashrate
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
                {/* Withdrawal Methods */}
                <div
                  className={`lg:col-span-2 rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <h3
                    className={`font-semibold text-sm uppercase tracking-wide mb-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Select Withdrawal Method
                  </h3>
                  <div className="space-y-2">
                    {WITHDRAWAL_METHODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setWithdrawMethod(m.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          withdrawMethod === m.id
                            ? "border-orange-500 bg-orange-500/5"
                            : isDark
                              ? "border-gray-700/60 bg-gray-700/30 hover:border-gray-600"
                              : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: m.color }}
                          >
                            {m.icon}
                          </div>
                          <div className="text-left">
                            <p
                              className={`text-sm font-semibold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {m.name}
                            </p>
                            <p
                              className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {m.time}
                            </p>
                          </div>
                        </div>
                        {withdrawMethod === m.id && (
                          <CheckCircle
                            size={16}
                            className="text-orange-500 flex-shrink-0"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Withdrawal Details */}
                <div
                  className={`lg:col-span-3 rounded-xl p-5 border ${
                    isDark
                      ? "bg-gray-800 border-gray-700/60"
                      : "bg-white border-gray-200"
                  } shadow-sm`}
                >
                  <div className="text-center mb-5">
                    <div
                      className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl"
                      style={{
                        backgroundColor:
                          WITHDRAWAL_METHODS.find(
                            (m) => m.id === withdrawMethod,
                          )?.color || "#F97316",
                      }}
                    >
                      {
                        WITHDRAWAL_METHODS.find((m) => m.id === withdrawMethod)
                          ?.icon
                      }
                    </div>
                    <h3
                      className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {WITHDRAWAL_METHODS.find(
                        (m) => m.id === withdrawMethod,
                      )?.name.toUpperCase()}
                    </h3>
                    <p
                      className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      To withdraw amounts higher than $150,000 USD, an
                      activation fee is required.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-4 mb-4 border ${
                      isDark
                        ? "bg-gray-700/50 border-gray-600/50"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between mb-3">
                      <span
                        className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Withdrawal Amount
                      </span>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          6.00000000 BTC
                        </p>
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          ≈ $6,000,000.00 USD
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Activation Fee (One-time)
                      </span>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          0.00850000 BTC
                        </p>
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          ≈ $8,500.00 USD
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activation Fee Alert */}
                  <div className="rounded-xl p-4 mb-4 border border-orange-500/40 bg-orange-500/5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle
                        size={16}
                        className="text-orange-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-orange-500 text-sm font-semibold">
                          Activation Fee Required
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          Your withdrawal request is pending activation. Please
                          pay the activation fee to proceed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors shadow-sm mb-2"
                  >
                    Pay Activation Fee (0.00850000 BTC)
                  </motion.button>
                  <p
                    className={`text-center text-[11px] flex items-center justify-center gap-1 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <Shield size={11} />
                    Secure &amp; Encrypted Payment
                  </p>
                </div>
              </div>

              {/* Withdrawal History Table */}
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDark
                    ? "bg-gray-800 border-gray-700/60"
                    : "bg-white border-gray-200"
                } shadow-sm`}
              >
                <div
                  className={`flex items-center justify-between px-5 py-4 border-b ${
                    isDark ? "border-gray-700/60" : "border-gray-100"
                  }`}
                >
                  <h3
                    className={`font-semibold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Withdrawal Requests
                  </h3>
                  <select
                    className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-gray-300"
                        : "bg-white border-gray-300 text-gray-600"
                    }`}
                  >
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        className={`text-xs font-medium ${
                          isDark
                            ? "text-gray-400 bg-gray-700/30"
                            : "text-gray-500 bg-gray-50"
                        }`}
                      >
                        {[
                          "Date",
                          "Method",
                          "Amount",
                          "Activation Fee",
                          "Status",
                          "TXID / Details",
                          "Action",
                        ].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {WITHDRAWAL_HISTORY.map((w, idx) => (
                        <tr
                          key={idx}
                          className={`border-t text-xs transition-colors ${
                            isDark
                              ? "border-gray-700/40 hover:bg-gray-700/30"
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <td
                            className={`px-4 py-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                          >
                            {w.date}
                          </td>
                          <td
                            className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {w.method}
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className={`font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                              {w.amount}
                            </p>
                            <p
                              className={`${isDark ? "text-gray-500" : "text-gray-400"}`}
                            >
                              {w.usd}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className={
                                isDark ? "text-gray-300" : "text-gray-700"
                              }
                            >
                              {w.fee}
                            </p>
                            {w.feeUsd && (
                              <p
                                className={`${isDark ? "text-gray-500" : "text-gray-400"}`}
                              >
                                {w.feeUsd}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  w.status === "Completed"
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : w.status === "Pending"
                                      ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                      : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                                }`}
                              >
                                {w.status}
                              </span>
                              {w.status === "Pending" && (
                                <p
                                  className={`mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  Activation Fee Required
                                </p>
                              )}
                              {w.status === "Completed" && (
                                <p
                                  className={`mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                >
                                  Funds Sent
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {w.txid ? (
                              <span className="text-orange-500 font-mono">
                                {w.txid}
                              </span>
                            ) : (
                              <span
                                className={
                                  isDark ? "text-gray-600" : "text-gray-300"
                                }
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {w.status === "Pending" ? (
                              <button className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition-colors">
                                Pay Fee
                              </button>
                            ) : (
                              <button
                                className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                                  isDark
                                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        className={`text-center py-4 text-xs border-t ${
          isDark
            ? "border-gray-700/60 text-gray-600"
            : "border-gray-200 text-gray-400"
        }`}
      >
        © 2025 F2 Pool Mining. All Rights Reserved.{" "}
        <span className="text-orange-500 font-medium">
          CONCEPT DEMO – NOT A REAL PLATFORM
        </span>
      </div>
    </div>
  );
}
