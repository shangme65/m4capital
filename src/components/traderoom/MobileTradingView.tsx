"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactDOM from "react-dom";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  X,
  Clock,
  BarChart3,
  History,
  MoreHorizontal,
  Wallet,
  TrendingUp,
  Activity,
  Search,
  Copy,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import ChartGrid from "@/components/client/ChartGrid";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveTrade {
  id: string;
  symbol: string;
  direction: "higher" | "lower";
  amount: number;
  entryPrice: number;
  entryYPosition: number;
  entryTime: number;
  expirationTime: number;
  expirationSeconds: number;
  status: "active" | "won" | "lost" | "pending";
  result?: number;
  exitPrice?: number;
}

interface OpenTab {
  symbol: string;
  type: string;
  lastResult?: { amount: number; status: "won" | "lost" };
}

export interface MobileTradingViewProps {
  // Symbol & Price
  selectedSymbol: string;
  currentPrice: number;
  priceDirection: "up" | "down" | "none";
  onSymbolChange: (symbol: string) => void;

  // Asset flag helper
  AssetFlag: React.ComponentType<{
    flag: string;
    symbol: string;
    size?: number;
    className?: string;
  }>;

  // Symbols list
  symbols: Array<{
    symbol: string;
    displayName?: string;
    price: string;
    change: string;
    percentage: string;
    flag: string;
    category: string;
  }>;

  // Open Tabs
  openTabs: OpenTab[];
  activeTab: number;
  onTabChange: (index: number) => void;
  onCloseTab: (index: number) => void;
  onAddAsset: () => void;

  // Trading
  amount: number;
  amountInput: string;
  onAmountChange: (amount: number) => void;
  onAmountInputChange: (input: string) => void;
  expirationSeconds: number;
  countdown: number;
  onExpirationChange: (seconds: number) => void;
  onExecuteTrade: (direction: "higher" | "lower") => void;
  isExecutingTrade: boolean;
  tradeDirection: "higher" | "lower" | null;

  // Balance
  selectedAccountType: "real" | "practice";
  traderoomBalance: number;
  practiceAccountBalance: number;
  onAccountTypeChange: (type: "real" | "practice") => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onReplenishPractice: (amount: number) => void;

  // Active trades
  activeTrades: ActiveTrade[];

  // Chart props
  selectedChartGrid: number;
  candleInterval: string;
  hoveredButton: "higher" | "lower" | null;
  onHoveredButton: (btn: "higher" | "lower" | null) => void;
  onPriceYPosition: (y: number) => void;
  onLivePriceUpdate: (price: number) => void;
  onPriceToYConverter: (converter: (price: number) => number) => void;
  onTimeToXConverter: (converter: (timestamp: number) => number) => void;
  onLastCandleTimestamp: (timestamp: number) => void;
  activeTradeExpirationTime?: number;
  activeTradeEntryTime?: number;

  // Trade history (for history tab)
  tradeHistory?: Array<{
    id: string;
    symbol: string;
    direction: "HIGHER" | "LOWER";
    amount: number;
    entryPrice?: number;
    exitPrice?: number;
    entryTime: Date | string | number;
    exitTime?: Date | string | number | null;
    expirationTime?: Date | string | number | null;
    status: "WIN" | "LOSS";
    profit: number;
  }>;

  // User profile image
  userImage?: string;

  // Navigation callbacks
  onShowHistory: () => void;
  onShowPortfolio: () => void;
  onShowAddAsset: () => void;
  // Called when user picks a new symbol from the mobile asset picker
  onAddTab: (symbol: string) => void;
}

// ─── IQ Option Color Tokens ──────────────────────────────────────────────────

const C = {
  base: "#0B1327",
  secondary: "#253356",
  tertiary: "#1E2B4D",
  quaternary: "#182443",
  quinary: "#131B30",
  textPrimary: "#eef7ff",
  textSecondary: "#A5B8E3",
  textTertiary: "#54648B",
  strokeTertiary: "#2E3C60",
  strokeSecondary: "#3B4A6F",
  green: "#30A46C",
  greenText: "#64D297",
  greenSurface: "#1B4931",
  red: "#E5484D",
  redText: "#FF918D",
  redSurface: "#62181B",
  orange: "#F76B15",
  orangeText: "#FF9F6E",
  blue: "#0090FF",
  white: "#FFFFFF",
} as const;

// ─── Mobile Asset Header ─────────────────────────────────────────────────────

function MobileAssetHeader({
  selectedSymbol,
  currentPrice,
  priceDirection,
  openTabs,
  activeTab,
  activeTrades,
  onTabChange,
  onCloseTab,
  onAddAsset,
  AssetFlag,
  symbols,
}: {
  selectedSymbol: string;
  currentPrice: number;
  priceDirection: "up" | "down" | "none";
  openTabs: OpenTab[];
  activeTab: number;
  activeTrades: ActiveTrade[];
  onTabChange: (index: number) => void;
  onCloseTab: (index: number) => void;
  onAddAsset: () => void;
  AssetFlag: MobileTradingViewProps["AssetFlag"];
  symbols: MobileTradingViewProps["symbols"];
}) {
  return (
    <div
      className="flex-shrink-0 select-none"
      style={{ backgroundColor: C.base }}
    >
      {/* Scrollable asset tabs */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {openTabs.map((tab, i) => {
          const isActive = i === activeTab;
          const tabTrades = activeTrades.filter(
            (t) => t.symbol === tab.symbol && t.status === "active",
          );
          const tabSym = symbols.find((s) => s.symbol === tab.symbol);
          const tabFlag = tabSym?.flag || "";
          const hasActiveTrades = tabTrades.length > 0;
          const hasFinishedResult = !hasActiveTrades && !!tab.lastResult;

          // Countdown for earliest active trade
          let tradeCountdownSec = 0;
          if (hasActiveTrades) {
            const earliest = tabTrades.reduce((a, b) =>
              a.expirationTime < b.expirationTime ? a : b,
            );
            tradeCountdownSec = Math.max(
              0,
              Math.ceil((earliest.expirationTime - Date.now()) / 1000),
            );
          }
          const countdownMin = Math.floor(tradeCountdownSec / 60);
          const countdownSecDisplay = tradeCountdownSec % 60;
          const countdownText =
            countdownMin > 0
              ? `${countdownMin}:${countdownSecDisplay.toString().padStart(2, "0")}`
              : `:${countdownSecDisplay.toString().padStart(2, "0")}`;

          // Circular timer
          const totalDuration = hasActiveTrades
            ? tabTrades.reduce((a, b) =>
                a.expirationTime < b.expirationTime ? a : b,
              ).expirationSeconds
            : 0;
          const progress =
            totalDuration > 0 ? 1 - tradeCountdownSec / totalDuration : 0;
          const radius = 11;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference * (1 - progress);

          // P/L for active trades
          const totalPL = tabTrades.reduce((sum, trade) => {
            const isWinning =
              trade.result !== undefined ? trade.result > 0 : false;
            return sum + (isWinning ? trade.amount * 0.85 : -trade.amount);
          }, 0);

          return (
            <div
              key={`${tab.symbol}-${i}`}
              onClick={() => onTabChange(i)}
              className="relative group flex-shrink-0 cursor-pointer rounded-lg transition-all duration-200 overflow-hidden"
              style={{
                backgroundColor: isActive
                  ? "rgba(255, 193, 7, 0.12)"
                  : C.quaternary,
                border: isActive
                  ? "2px solid rgba(255, 193, 7, 0.35)"
                  : "2px solid #3B4A6F",
                boxShadow: isActive
                  ? "0 0 16px rgba(255, 193, 7, 0.18), inset 0 0 12px rgba(255, 193, 7, 0.07)"
                  : "none",
                minHeight: "52px",
                paddingLeft: "12px",
                paddingRight: openTabs.length > 1 ? "10px" : "12px",
                paddingTop: "6px",
                paddingBottom: "6px",
              }}
            >
              {/* Gold bottom glow bar */}
              {isActive && (
                <>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[3px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #ffc107 20%, #ffeb3b 50%, #ffc107 80%, transparent)",
                      boxShadow:
                        "0 0 10px #ffc107, 0 -1px 8px rgba(255,193,7,0.5)",
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] blur-[2px]"
                    style={{ backgroundColor: "#ffeb3b", opacity: 0.7 }}
                  />
                </>
              )}

              {/* Close × top-left */}
              {openTabs.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(i);
                  }}
                  className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 bg-gray-700 hover:bg-gray-600 rounded-full transition-all w-4 h-4 flex items-center justify-center z-10 cursor-pointer"
                  style={{ color: "#fff", fontSize: "10px", lineHeight: 1 }}
                >
                  ×
                </span>
              )}

              <div className="flex items-center gap-2 h-full">
                {/* Icon: countdown circle or asset flag */}
                {hasActiveTrades ? (
                  <div
                    className="relative flex items-center justify-center flex-shrink-0"
                    style={{ width: 26, height: 26 }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 26 26"
                      className="absolute"
                    >
                      <circle
                        cx="13"
                        cy="13"
                        r={radius}
                        fill="none"
                        stroke="#3a3a3a"
                        strokeWidth="2"
                      />
                      <circle
                        cx="13"
                        cy="13"
                        r={radius}
                        fill="none"
                        stroke="#ff8516"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transform: "rotate(-90deg)",
                          transformOrigin: "center",
                          transition: "stroke-dashoffset 1s linear",
                        }}
                      />
                    </svg>
                    <span className="text-[8px] font-bold text-white z-10">
                      {countdownText}
                    </span>
                  </div>
                ) : (
                  <AssetFlag
                    flag={tabFlag}
                    symbol={tab.symbol}
                    size={22}
                    className="flex-shrink-0"
                  />
                )}

                {/* Text column */}
                <div className="flex flex-col items-start">
                  <span
                    className="text-sm font-semibold whitespace-nowrap leading-tight"
                    style={{
                      color: isActive ? C.textPrimary : C.textSecondary,
                    }}
                  >
                    {tab.symbol}
                  </span>

                  {hasActiveTrades ? (
                    <span
                      className="text-[10px] font-medium leading-tight"
                      style={{ color: totalPL >= 0 ? C.greenText : C.redText }}
                    >
                      {totalPL >= 0 ? "+" : ""}${Math.abs(totalPL).toFixed(2)}
                    </span>
                  ) : hasFinishedResult && tab.lastResult ? (
                    <span
                      className="text-[10px] font-medium leading-tight"
                      style={{
                        color:
                          tab.lastResult.status === "won"
                            ? C.greenText
                            : C.redText,
                      }}
                    >
                      {tab.lastResult.status === "won" ? "+$" : "-$"}
                      {Math.abs(tab.lastResult.amount).toFixed(0)}
                    </span>
                  ) : (
                    <span
                      className="text-[10px] leading-tight"
                      style={{ color: isActive ? "#ffc107" : C.textTertiary }}
                    >
                      {tab.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add asset button */}
        <button
          onClick={onAddAsset}
          className="flex items-center justify-center flex-shrink-0 rounded-lg transition-colors"
          style={{
            backgroundColor: C.quaternary,
            width: "48px",
            height: "48px",
          }}
        >
          <Plus size={16} style={{ color: C.textSecondary }} />
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Trading Panel ────────────────────────────────────────────────────

function MobileTradingPanel({
  amount,
  amountInput,
  onAmountChange,
  onAmountInputChange,
  expirationSeconds,
  countdown,
  onExpirationChange,
  onExecuteTrade,
  isExecutingTrade,
  tradeDirection,
  selectedAccountType,
  traderoomBalance,
  practiceAccountBalance,
  activeTrades,
  selectedSymbol,
  hoveredButton,
  onHoveredButton,
}: {
  amount: number;
  amountInput: string;
  onAmountChange: (amount: number) => void;
  onAmountInputChange: (input: string) => void;
  expirationSeconds: number;
  countdown: number;
  onExpirationChange: (seconds: number) => void;
  onExecuteTrade: (direction: "higher" | "lower") => void;
  isExecutingTrade: boolean;
  tradeDirection: "higher" | "lower" | null;
  selectedAccountType: "real" | "practice";
  traderoomBalance: number;
  practiceAccountBalance: number;
  activeTrades: ActiveTrade[];
  selectedSymbol: string;
  hoveredButton: "higher" | "lower" | null;
  onHoveredButton: (btn: "higher" | "lower" | null) => void;
}) {
  const [showAmountPresets, setShowAmountPresets] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  const currentBalance =
    selectedAccountType === "real" ? traderoomBalance : practiceAccountBalance;
  const activeOnSymbol = activeTrades.filter(
    (t) => t.symbol === selectedSymbol && t.status === "active",
  );

  // Generate close-at time label from seconds
  const getCloseAtLabel = (seconds: number) => {
    const t = new Date(Date.now() + seconds * 1000);
    return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  };

  // Generate list of selectable expiration options (close-at times)
  const getExpirationOptions = () => {
    const now = Date.now();
    const options: { seconds: number; label: string }[] = [];
    // Per-minute options for next 20 minutes
    for (let m = 1; m <= 20; m++) {
      const secs = m * 60;
      const t = new Date(now + secs * 1000);
      // Snap to the next whole minute at that offset
      const snapped = new Date(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        t.getHours(),
        t.getMinutes(),
        0,
      );
      const actualSecs = Math.round((snapped.getTime() - now) / 1000);
      if (actualSecs > 0) {
        options.push({
          seconds: actualSecs,
          label: `${String(snapped.getHours()).padStart(2, "0")}:${String(snapped.getMinutes()).padStart(2, "0")}`,
        });
      }
    }
    // Quarter-hour options: :15, :30, :45, :00 of next hour etc.
    [30, 45, 60, 90, 120].forEach((mins) => {
      const secs = mins * 60;
      const t = new Date(now + secs * 1000);
      const snapped = new Date(
        t.getFullYear(),
        t.getMonth(),
        t.getDate(),
        t.getHours(),
        t.getMinutes(),
        0,
      );
      const actualSecs = Math.round((snapped.getTime() - now) / 1000);
      if (
        actualSecs > 0 &&
        !options.find(
          (o) =>
            o.label ===
            `${String(snapped.getHours()).padStart(2, "0")}:${String(snapped.getMinutes()).padStart(2, "0")}`,
        )
      ) {
        options.push({
          seconds: actualSecs,
          label: `${String(snapped.getHours()).padStart(2, "0")}:${String(snapped.getMinutes()).padStart(2, "0")}`,
        });
      }
    });
    return options.sort((a, b) => a.seconds - b.seconds);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(1, amount + delta);
    onAmountChange(newAmount);
    onAmountInputChange(newAmount.toLocaleString());
  };

  const amountPresets = [1, 2, 5, 10, 25, 50, 100, 500];

  return (
    <div
      className="flex-shrink-0 select-none"
      style={{
        backgroundColor: C.base,
      }}
    >
      {/* Trading controls grid - IQ Option mobile layout */}
      <div
        className="grid grid-cols-2 gap-y-2 gap-x-3 px-4 pt-3 pb-2"
        style={{ minHeight: "120px" }}
      >
        {/* Amount control */}
        <div>
          <div
            className="text-[10px] font-medium uppercase tracking-wider mb-1 cursor-pointer"
            style={{ color: C.textTertiary }}
            onClick={() => setShowAmountPresets(!showAmountPresets)}
          >
            Amount
          </div>
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              backgroundColor: C.quaternary,
              height: "40px",
            }}
          >
            <button
              onClick={() => adjustAmount(-1)}
              className="flex items-center justify-center w-9 h-full transition-colors active:opacity-70"
              style={{ color: C.textSecondary }}
            >
              <Minus size={14} />
            </button>
            <div className="flex-1 flex items-center justify-center gap-0.5">
              <span
                className="text-sm font-medium"
                style={{ color: C.textSecondary }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                  onAmountInputChange(raw);
                  const num = parseFloat(raw);
                  if (!isNaN(num) && num > 0) {
                    onAmountChange(Math.floor(num));
                  }
                }}
                onBlur={() => {
                  const num = parseFloat(amountInput);
                  const clamped = isNaN(num) || num < 1 ? 1 : Math.floor(num);
                  onAmountChange(clamped);
                  onAmountInputChange(String(clamped));
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="bg-transparent outline-none text-center text-sm font-medium tabular-nums"
                style={{
                  color: C.textPrimary,
                  width: "52px",
                  caretColor: C.textPrimary,
                }}
              />
            </div>
            <button
              onClick={() => adjustAmount(1)}
              className="flex items-center justify-center w-9 h-full transition-colors active:opacity-70"
              style={{ color: C.textSecondary }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Expiration control — shows close-at time, opens picker on tap */}
        <div>
          <div
            className="text-[10px] font-medium uppercase tracking-wider mb-1"
            style={{ color: C.textTertiary }}
          >
            <Clock
              size={10}
              className="inline mr-1"
              style={{ color: C.textTertiary }}
            />
            Expiration
          </div>
          <button
            className="w-full flex items-center justify-between rounded-xl px-3 transition-colors active:opacity-70"
            style={{
              backgroundColor: C.quaternary,
              height: "40px",
            }}
            onClick={() => setShowExpirationPicker(true)}
          >
            <span
              className="text-sm font-medium tabular-nums"
              style={{ color: C.textPrimary }}
            >
              {getCloseAtLabel(expirationSeconds)}
            </span>
            <ChevronDown size={13} style={{ color: C.textSecondary }} />
          </button>
        </div>

        {/* Higher button */}
        <button
          onClick={() => onExecuteTrade("higher")}
          onTouchStart={() => onHoveredButton("higher")}
          onTouchEnd={() => onHoveredButton(null)}
          disabled={isExecutingTrade || amount > currentBalance}
          className="flex flex-col items-center justify-center rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
          style={{
            backgroundColor: C.green,
            height: "56px",
            minHeight: "48px",
            maxHeight: "96px",
          }}
        >
          <div className="flex items-center gap-1">
            <ChevronUp size={14} color={C.white} strokeWidth={3} />
            <span className="text-sm font-semibold" style={{ color: C.white }}>
              Higher
            </span>
          </div>
        </button>

        {/* Lower button */}
        <button
          onClick={() => onExecuteTrade("lower")}
          onTouchStart={() => onHoveredButton("lower")}
          onTouchEnd={() => onHoveredButton(null)}
          disabled={isExecutingTrade || amount > currentBalance}
          className="flex flex-col items-center justify-center rounded-xl transition-all active:scale-[0.97] disabled:opacity-40"
          style={{
            backgroundColor: C.red,
            height: "56px",
            minHeight: "48px",
            maxHeight: "96px",
          }}
        >
          <div className="flex items-center gap-1">
            <ChevronDown size={14} color={C.white} strokeWidth={3} />
            <span className="text-sm font-semibold" style={{ color: C.white }}>
              Lower
            </span>
          </div>
        </button>

        {/* Expected return display */}
        <div className="col-span-2 flex items-center justify-center py-2">
          <span className="text-sm font-medium" style={{ color: C.white }}>
            Expected return{" "}
            <span style={{ color: C.green }}>
              +${(amount * 1.85).toFixed(2)}
            </span>{" "}
            <span style={{ color: C.textSecondary }}>+85%</span>
          </span>
        </div>

        {/* Open positions indicator (spans full width) */}
        {activeOnSymbol.length > 0 && (
          <div
            className="col-span-2 grid grid-cols-2 gap-x-3"
            style={{ paddingBlock: "1px" }}
          >
            <div
              className="flex items-center justify-center gap-2 rounded-xl py-2"
              style={{ backgroundColor: C.quaternary }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: C.green }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: C.textSecondary }}
              >
                {activeOnSymbol.length} open position
                {activeOnSymbol.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div
              className="flex items-center justify-center rounded-xl py-2"
              style={{ backgroundColor: C.quaternary }}
            >
              <span
                className="text-xs tabular-nums font-medium"
                style={{ color: C.textSecondary }}
              >
                Exp: {formatCountdown(countdown)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Amount presets dropdown */}
      {showAmountPresets && (
        <div className="grid grid-cols-4 gap-1.5 px-4 pb-3">
          {amountPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                onAmountChange(preset);
                onAmountInputChange(preset.toLocaleString());
                setShowAmountPresets(false);
              }}
              className="py-2 rounded-lg text-xs font-medium transition-colors active:scale-[0.97]"
              style={{
                backgroundColor: amount === preset ? C.secondary : C.quaternary,
                color: amount === preset ? C.textPrimary : C.textSecondary,
              }}
            >
              ${preset}
            </button>
          ))}
        </div>
      )}

      {/* Expiration Picker Sheet */}
      {showExpirationPicker &&
        typeof document !== "undefined" &&
        (() => {
          const options = getExpirationOptions();
          const selectedLabel = getCloseAtLabel(expirationSeconds);
          return ReactDOM.createPortal(
            <div
              className="fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-end"
              style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 10001 }}
              onClick={() => setShowExpirationPicker(false)}
            >
              <div
                className="rounded-t-2xl overflow-hidden"
                style={{ backgroundColor: "#0f1822", maxHeight: "70vh" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <span
                    className="text-base font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    Trade will close at
                  </span>
                  <button
                    onClick={() => setShowExpirationPicker(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  >
                    <X size={14} style={{ color: C.textSecondary }} />
                  </button>
                </div>

                {/* Options list */}
                <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
                  {options.map((opt) => {
                    const isSelected = opt.label === selectedLabel;
                    return (
                      <button
                        key={opt.label}
                        className="w-full flex items-center justify-between px-5 py-4"
                        style={{
                          backgroundColor: isSelected
                            ? "rgba(255,255,255,0.06)"
                            : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                        onClick={() => {
                          onExpirationChange(opt.seconds);
                          setShowExpirationPicker(false);
                        }}
                      >
                        <span
                          className="text-base font-medium tabular-nums"
                          style={{ color: C.textPrimary }}
                        >
                          {opt.label}
                        </span>
                        <div className="flex items-center gap-3">
                          {isSelected && (
                            <span style={{ color: C.greenText }}>✓</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body,
          );
        })()}
    </div>
  );
}

// ─── Sentiment Bars (Horizontal) ─────────────────────────────────────────────

/** Deterministic buy% for a symbol — recalculates on every 5-minute bucket */
function computeSentiment(symbol: string): number {
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const str = symbol + bucket;
  let hash = bucket;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);
  // Realistic range: 42–72% buy
  return 42 + (hash % 31);
}

function HorizontalSentiment({ selectedSymbol }: { selectedSymbol: string }) {
  const [buyPercent, setBuyPercent] = useState(() =>
    computeSentiment(selectedSymbol),
  );

  useEffect(() => {
    setBuyPercent(computeSentiment(selectedSymbol));
    const id = setInterval(
      () => setBuyPercent(computeSentiment(selectedSymbol)),
      30_000,
    );
    return () => clearInterval(id);
  }, [selectedSymbol]);

  const sellPercent = 100 - buyPercent;

  return (
    <div
      className="grid items-center gap-1 px-1.5 py-1"
      style={{
        gridTemplateColumns: "auto minmax(0,1fr) auto",
        fontSize: "10px",
      }}
    >
      <span className="tabular-nums font-medium" style={{ color: C.greenText }}>
        {buyPercent}%
      </span>
      <div className="flex items-center gap-[1px]">
        <div
          className="h-1.5 rounded-r-none rounded-sm transition-all duration-500"
          style={{
            width: `${buyPercent}%`,
            background: `linear-gradient(270deg, ${C.green} 0%, ${C.greenSurface} 100%)`,
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
          }}
        />
        <div
          className="h-1.5 rounded-l-none rounded-sm transition-all duration-500"
          style={{
            width: `${sellPercent}%`,
            background: `linear-gradient(270deg, ${C.redSurface} 0%, ${C.red} 100%)`,
            borderTopRightRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
        />
      </div>
      <span className="tabular-nums font-medium" style={{ color: C.redText }}>
        {sellPercent}%
      </span>
    </div>
  );
}

// ─── Mobile Portfolio View ───────────────────────────────────────────────────

function MobilePortfolioView({
  activeTrades,
  currentPrice,
  traderoomBalance,
  practiceAccountBalance,
  selectedAccountType,
  countdown,
  symbols,
  AssetFlag,
}: {
  activeTrades: ActiveTrade[];
  currentPrice: number;
  traderoomBalance: number;
  practiceAccountBalance: number;
  selectedAccountType: "real" | "practice";
  countdown: number;
  symbols: Array<{
    symbol: string;
    displayName?: string;
    price: string;
    change: string;
    percentage: string;
    flag: string;
    category: string;
  }>;
  AssetFlag: React.ComponentType<{
    flag: string;
    symbol: string;
    size?: number;
    className?: string;
  }>;
}) {
  const active = activeTrades.filter((t) => t.status === "active");
  const closed = activeTrades.filter(
    (t) => t.status === "won" || t.status === "lost",
  );

  // Total investment across active trades
  const totalInvestment = active.reduce((sum, t) => sum + t.amount, 0);
  const totalPnl = active.reduce((sum, t) => {
    // Estimate P&L: if direction is higher and current price > entry → winning
    const pnl =
      t.direction === "higher"
        ? currentPrice > t.entryPrice
          ? t.amount * 0.85
          : -t.amount
        : currentPrice < t.entryPrice
          ? t.amount * 0.85
          : -t.amount;
    return sum + pnl;
  }, 0);
  const pnlPercent =
    totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getSymbolDisplay = (sym: string) => {
    const found = symbols.find((s) => s.symbol === sym);
    return {
      displayName: found?.displayName || sym,
      flag: found?.flag || sym.slice(0, 3),
      price: found?.price || "0",
    };
  };

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: C.base, paddingBottom: "4px" }}
    >
      {/* ── Portfolio header ── */}
      <div className="px-4 pt-3 pb-1">
        <span
          className="text-[26px] font-bold"
          style={{ color: C.textPrimary }}
        >
          Portfolio
        </span>
      </div>

      {/* ── Portfolio summary card ── */}
      <div className="px-4 pt-4 pb-2">
        <div
          className="rounded-2xl px-4 py-3"
          style={{ backgroundColor: C.quaternary }}
        >
          <div
            className="text-[11px] font-medium mb-1"
            style={{ color: C.textTertiary }}
          >
            Total investment{" "}
            <span
              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border text-[8px] ml-0.5"
              style={{
                borderColor: C.textTertiary,
                color: C.textTertiary,
              }}
            >
              i
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: C.textPrimary }}
            >
              ${totalInvestment.toFixed(2)}
            </span>
            {totalInvestment > 0 && (
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    totalPnl >= 0 ? C.greenSurface : C.redSurface,
                  color: totalPnl >= 0 ? C.greenText : C.redText,
                }}
              >
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)} (
                {totalPnl >= 0 ? "+" : ""}
                {pnlPercent.toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Active section ── */}
      <div className="px-4 pt-2 pb-1">
        <div
          className="text-base font-bold mb-2"
          style={{ color: C.textPrimary }}
        >
          Active
        </div>

        {active.length === 0 ? (
          <div
            className="rounded-2xl flex flex-col items-center justify-center py-8 gap-2"
            style={{ backgroundColor: C.quaternary }}
          >
            <div style={{ color: C.textTertiary }}>
              {/* bar chart icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="10" width="4" height="12" rx="1" />
                <rect x="9" y="6" width="4" height="16" rx="1" />
                <rect x="16" y="13" width="4" height="9" rx="1" />
              </svg>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: C.textTertiary }}
            >
              No active trades
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((trade) => {
              const sym = getSymbolDisplay(trade.symbol);
              const isWinning =
                trade.direction === "higher"
                  ? currentPrice > trade.entryPrice
                  : currentPrice < trade.entryPrice;
              const pnl = isWinning ? trade.amount * 0.85 : -trade.amount;

              return (
                <div
                  key={trade.id}
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: C.quaternary }}
                >
                  {/* Row 1: asset info + P&L */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AssetFlag
                        flag={sym.flag}
                        symbol={trade.symbol}
                        size={28}
                      />
                      <div>
                        <div
                          className="text-[13px] font-semibold leading-tight"
                          style={{ color: C.textPrimary }}
                        >
                          {sym.displayName}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={9} style={{ color: C.textTertiary }} />
                          <span
                            className="text-[11px] font-mono"
                            style={{ color: C.textTertiary }}
                          >
                            {formatCountdown(countdown)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-[13px] font-bold tabular-nums"
                        style={{ color: isWinning ? C.greenText : C.redText }}
                      >
                        {isWinning ? "+" : ""}${pnl.toFixed(2)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span
                          className="text-[11px] tabular-nums"
                          style={{ color: C.textSecondary }}
                        >
                          ${trade.amount}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              trade.direction === "higher" ? C.green : C.red,
                          }}
                        >
                          {trade.direction === "higher" ? (
                            <ChevronUp
                              size={11}
                              color={C.white}
                              strokeWidth={3}
                            />
                          ) : (
                            <ChevronDown
                              size={11}
                              color={C.white}
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    className="w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 active:opacity-70"
                    style={{
                      backgroundColor: C.tertiary,
                      border: `1px solid ${C.strokeSecondary}`,
                      color: C.textPrimary,
                    }}
                  >
                    <span>Close</span>
                    <span
                      style={{ color: isWinning ? C.greenText : C.redText }}
                    >
                      {isWinning ? "+" : ""}${pnl.toFixed(2)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Closed section ── */}
      {closed.length > 0 && (
        <div className="px-4 pt-3 pb-2">
          <div
            className="text-base font-bold mb-1"
            style={{ color: C.textPrimary }}
          >
            Closed
          </div>
          <div
            className="text-[11px] font-medium mb-2"
            style={{ color: C.textTertiary }}
          >
            Today
          </div>

          <div className="flex flex-col gap-2">
            {closed.map((trade) => {
              const sym = getSymbolDisplay(trade.symbol);
              const won = trade.status === "won";
              const pnl = won
                ? (trade.result ?? trade.amount * 0.85)
                : -trade.amount;

              return (
                <div
                  key={trade.id}
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: C.quaternary }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AssetFlag
                        flag={sym.flag}
                        symbol={trade.symbol}
                        size={28}
                      />
                      <div>
                        <div
                          className="text-[13px] font-semibold leading-tight"
                          style={{ color: C.textPrimary }}
                        >
                          {sym.displayName}
                        </div>
                        <div
                          className="text-[11px] mt-0.5"
                          style={{ color: C.textTertiary }}
                        >
                          Binary
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-[13px] font-bold tabular-nums"
                        style={{ color: won ? C.greenText : C.redText }}
                      >
                        {won ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span
                          className="text-[11px] tabular-nums"
                          style={{ color: C.textSecondary }}
                        >
                          ${trade.amount}
                        </span>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              trade.direction === "higher" ? C.green : C.red,
                          }}
                        >
                          {trade.direction === "higher" ? (
                            <ChevronUp
                              size={11}
                              color={C.white}
                              strokeWidth={3}
                            />
                          ) : (
                            <ChevronDown
                              size={11}
                              color={C.white}
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile History View ─────────────────────────────────────────────────────

function MobileHistoryView({
  tradeHistory,
  symbols,
  AssetFlag,
}: {
  tradeHistory: MobileTradingViewProps["tradeHistory"];
  symbols: MobileTradingViewProps["symbols"];
  AssetFlag: MobileTradingViewProps["AssetFlag"];
}) {
  const history = tradeHistory ?? [];
  const [selectedTrade, setSelectedTrade] = useState<
    NonNullable<MobileTradingViewProps["tradeHistory"]>[0] | null
  >(null);
  const [copied, setCopied] = useState(false);

  const getSymbolInfo = (sym: string) => {
    const found = symbols.find((s) => s.symbol === sym);
    return {
      displayName: found?.displayName || sym,
      flag: found?.flag || sym.slice(0, 3),
    };
  };

  const fmtDateTime = (d: Date | string | number | null | undefined) => {
    if (!d) return "—";
    const date = new Date(d as string | number | Date);
    if (isNaN(date.getTime())) return "—";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy}, ${hh}:${mm}:${ss}`;
  };

  const fmtTimeOnly = (d: Date | string | number | null | undefined) => {
    if (!d) return "—";
    const date = new Date(d as string | number | Date);
    if (isNaN(date.getTime())) return "—";
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${min}:${ss}`;
  };

  // ── Detail view ──────────────────────────────────────────────────────────
  if (selectedTrade) {
    const t = selectedTrade;
    const info = getSymbolInfo(t.symbol);
    const isWin = t.status === "WIN";
    const totalReturn = isWin ? t.amount + t.profit : 0;
    const returnSign = isWin ? "+" : "";
    const profitability =
      t.amount > 0 ? Math.round((t.profit / t.amount) * 100) : 0;
    const isOTC = info.displayName.includes("OTC") || t.symbol.includes("OTC");

    const detailRows: Array<{ label: string; value: React.ReactNode }> = [
      {
        label: "Position type",
        value: (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold" style={{ color: C.textPrimary }}>
              {t.direction === "HIGHER" ? "Higher" : "Lower"}
            </span>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: t.direction === "HIGHER" ? C.green : C.red,
              }}
            >
              {t.direction === "HIGHER" ? (
                <ChevronUp size={11} color={C.white} strokeWidth={3} />
              ) : (
                <ChevronDown size={11} color={C.white} strokeWidth={3} />
              )}
            </div>
          </div>
        ),
      },
      {
        label: "Profitability",
        value: (
          <span className="font-semibold" style={{ color: C.greenText }}>
            {profitability}%
          </span>
        ),
      },
      {
        label: "Position ID",
        value: (
          <div className="flex items-center gap-1.5">
            <span
              className="tabular-nums text-sm"
              style={{ color: C.textPrimary }}
            >
              {t.id.length > 12 ? t.id.slice(-12) : t.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(t.id).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="active:opacity-60"
            >
              <Copy
                size={14}
                style={{ color: copied ? C.greenText : C.textSecondary }}
              />
            </button>
          </div>
        ),
      },
      {
        label: "Opening time",
        value: (
          <span
            className="tabular-nums text-sm"
            style={{ color: C.textPrimary }}
          >
            {fmtDateTime(t.entryTime)}
          </span>
        ),
      },
      {
        label: "Expiration time",
        value: (
          <span
            className="tabular-nums text-sm"
            style={{ color: C.textPrimary }}
          >
            {fmtDateTime(t.expirationTime ?? t.exitTime)}
          </span>
        ),
      },
      {
        label: "Closing time",
        value: (
          <span
            className="tabular-nums text-sm"
            style={{ color: C.textPrimary }}
          >
            {fmtDateTime(t.exitTime ?? t.expirationTime)}
          </span>
        ),
      },
      {
        label: "Opening price",
        value: (
          <span
            className="tabular-nums text-sm font-medium"
            style={{ color: C.textPrimary }}
          >
            {t.entryPrice != null ? t.entryPrice.toString() : "—"}
          </span>
        ),
      },
      {
        label: "Closing price",
        value: (
          <span
            className="tabular-nums text-sm font-medium"
            style={{ color: C.textPrimary }}
          >
            {t.exitPrice != null ? t.exitPrice.toString() : "—"}
          </span>
        ),
      },
      {
        label: "Closing method",
        value: (
          <span
            className="text-sm font-semibold"
            style={{ color: C.textPrimary }}
          >
            Automatically (Expired)
          </span>
        ),
      },
    ];

    return (
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: C.base }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: C.base }}
        >
          <button
            onClick={() => setSelectedTrade(null)}
            className="active:opacity-70 p-1 -ml-1"
          >
            <ArrowLeft size={22} style={{ color: C.textPrimary }} />
          </button>
          <div className="relative flex-shrink-0">
            <AssetFlag flag={info.flag} symbol={t.symbol} size={32} />
            {isOTC && (
              <span
                className="absolute -bottom-1 -right-2 rounded-sm text-[7px] font-bold px-0.5"
                style={{
                  backgroundColor: C.orange,
                  color: C.white,
                  lineHeight: "11px",
                }}
              >
                OTC
              </span>
            )}
          </div>
          <div>
            <div
              className="text-base font-semibold"
              style={{ color: C.textPrimary }}
            >
              {info.displayName}
            </div>
            <div className="text-xs" style={{ color: C.textSecondary }}>
              Binary
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Return */}
          <div className="mb-4">
            <div className="text-sm mb-1" style={{ color: C.textSecondary }}>
              Return
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: isWin ? C.greenText : C.redText }}
              >
                {returnSign}${totalReturn.toFixed(2)}
              </span>
              {isWin && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: C.greenSurface,
                    color: C.greenText,
                  }}
                >
                  +{profitability + 100}%
                </span>
              )}
            </div>
          </div>

          {/* Investment + Expiration time row */}
          <div className="flex gap-6 mb-5">
            <div>
              <div
                className="text-xs mb-0.5"
                style={{ color: C.textSecondary }}
              >
                Investment
              </div>
              <div
                className="text-base font-semibold tabular-nums"
                style={{ color: C.textPrimary }}
              >
                ${t.amount.toFixed(0)}
              </div>
            </div>
            <div>
              <div
                className="text-xs mb-0.5"
                style={{ color: C.textSecondary }}
              >
                Expiration time
              </div>
              <div
                className="text-base font-semibold tabular-nums"
                style={{ color: C.textPrimary }}
              >
                {fmtTimeOnly(t.expirationTime ?? t.exitTime)}
              </div>
            </div>
          </div>

          {/* Details card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: C.quaternary }}
          >
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-2"
              >
                <span className="text-sm" style={{ color: C.textSecondary }}>
                  {row.label}
                </span>
                {row.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────

  // Group trades by date
  const today = new Date();
  const grouped: Array<{
    label: string;
    dateKey: string;
    trades: NonNullable<MobileTradingViewProps["tradeHistory"]>;
  }> = [];
  const seen: Record<string, number> = {};
  history.forEach((trade) => {
    const date = new Date(trade.entryTime as string | number | Date);
    const isToday = date.toDateString() === today.toDateString();
    const label = isToday
      ? "Today"
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
    const key = date.toDateString();
    if (seen[key] === undefined) {
      seen[key] = grouped.length;
      grouped.push({ label, dateKey: key, trades: [] });
    }
    grouped[seen[key]].trades.push(trade);
  });

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: C.base, paddingBottom: "4px" }}
    >
      {/* Heading */}
      <div className="px-4 pt-3 pb-1">
        <span
          className="text-[26px] font-bold"
          style={{ color: C.textPrimary }}
        >
          Closed
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <History
            size={48}
            strokeWidth={1.2}
            style={{ color: C.textTertiary, marginBottom: 12 }}
          />
          <p className="text-sm" style={{ color: C.textSecondary }}>
            No trading history yet
          </p>
          <p className="text-xs mt-1" style={{ color: C.textTertiary }}>
            Execute some trades to see your history here
          </p>
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.dateKey} className="px-4 pt-3 pb-2">
            <div
              className="text-[11px] font-medium mb-2"
              style={{ color: C.textTertiary }}
            >
              {group.label}
            </div>
            <div className="flex flex-col gap-2">
              {group.trades.map((trade) => {
                const info = getSymbolInfo(trade.symbol);
                const isWin = trade.status === "WIN";
                const isOTC =
                  info.displayName.includes("OTC") ||
                  trade.symbol.includes("OTC");
                const totalReturn = isWin ? trade.amount + trade.profit : 0;

                return (
                  <button
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    className="rounded-2xl px-4 py-3 text-left w-full active:opacity-80"
                    style={{ backgroundColor: C.quaternary }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: flag + asset name */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0">
                          <AssetFlag
                            flag={info.flag}
                            symbol={trade.symbol}
                            size={28}
                          />
                          {isOTC && (
                            <span
                              className="absolute -bottom-1 -right-2 rounded-sm text-[7px] font-bold px-0.5"
                              style={{
                                backgroundColor: C.orange,
                                color: C.white,
                                lineHeight: "11px",
                              }}
                            >
                              OTC
                            </span>
                          )}
                        </div>
                        <div>
                          <div
                            className="text-[13px] font-semibold leading-tight"
                            style={{ color: C.textPrimary }}
                          >
                            {info.displayName}
                          </div>
                          <div
                            className="text-[11px] mt-0.5"
                            style={{ color: C.textTertiary }}
                          >
                            Binary
                          </div>
                        </div>
                      </div>
                      {/* Right: P/L + investment + direction */}
                      <div className="text-right">
                        <div
                          className="text-[13px] font-bold tabular-nums"
                          style={{
                            color: isWin ? C.greenText : C.textSecondary,
                          }}
                        >
                          {isWin ? "+" : ""}${totalReturn.toFixed(2)}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span
                            className="text-[11px] tabular-nums"
                            style={{ color: C.textSecondary }}
                          >
                            ${trade.amount.toFixed(2)}
                          </span>
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor:
                                trade.direction === "HIGHER" ? C.green : C.red,
                            }}
                          >
                            {trade.direction === "HIGHER" ? (
                              <ChevronUp
                                size={11}
                                color={C.white}
                                strokeWidth={3}
                              />
                            ) : (
                              <ChevronDown
                                size={11}
                                color={C.white}
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Mobile Bottom Navigation ────────────────────────────────────────────────

function MobileBottomNav({
  activeItem,
  onItemChange,
  onShowHistory,
  onShowPortfolio,
  activeTrades,
}: {
  activeItem: string;
  onItemChange: (item: string) => void;
  onShowHistory: () => void;
  onShowPortfolio: () => void;
  activeTrades: ActiveTrade[];
}) {
  const router = useRouter();
  const [showDashboardConfirm, setShowDashboardConfirm] = useState(false);
  const activeCount = activeTrades.filter((t) => t.status === "active").length;

  const items = [
    {
      id: "trade",
      label: "Trade",
      icon: Activity,
      onClick: () => onItemChange("trade"),
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: BarChart3,
      badge: activeCount > 0 ? activeCount : undefined,
      onClick: () => {
        onItemChange("portfolio");
        onShowPortfolio();
      },
    },
    {
      id: "history",
      label: "History",
      icon: History,
      onClick: () => {
        onItemChange("history");
      },
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => setShowDashboardConfirm(true),
    },
  ];

  return (
    <>
      {/* Dashboard confirmation dialog */}
      {showDashboardConfirm &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center px-6"
            style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 100000 }}
            onClick={() => setShowDashboardConfirm(false)}
          >
            <div
              className="w-full max-w-xs rounded-2xl overflow-hidden"
              style={{ backgroundColor: C.secondary }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4">
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: C.textPrimary }}
                >
                  Leave Trade Room?
                </h3>
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  Any active trades will continue running. You can return to the
                  trade room at any time.
                </p>
              </div>
              <div
                className="flex"
                style={{ borderTop: `1px solid ${C.strokeTertiary}` }}
              >
                <button
                  className="flex-1 py-3.5 text-sm font-medium active:opacity-70"
                  style={{
                    color: C.textSecondary,
                    borderRight: `1px solid ${C.strokeTertiary}`,
                  }}
                  onClick={() => setShowDashboardConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3.5 text-sm font-semibold active:opacity-70"
                  style={{ color: C.blue }}
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      <nav
        className="flex-shrink-0 select-none"
        style={{
          backgroundColor: C.base,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex items-stretch">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors duration-200 relative"
              >
                <div className="relative">
                  <Icon
                    size={22}
                    style={{
                      color: isActive ? C.textPrimary : C.textSecondary,
                    }}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {item.badge && (
                    <span
                      className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1"
                      style={{
                        backgroundColor: C.orange,
                        color: C.white,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isActive ? C.textPrimary : C.textTertiary,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// ─── Balance Display ─────────────────────────────────────────────────────────

function MobileBalanceBar({
  selectedAccountType,
  traderoomBalance,
  practiceAccountBalance,
  onAccountTypeChange,
  onDeposit,
  onWithdraw,
  onReplenishPractice,
  userImage,
}: {
  selectedAccountType: "real" | "practice";
  traderoomBalance: number;
  practiceAccountBalance: number;
  onAccountTypeChange: (type: "real" | "practice") => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onReplenishPractice: (amount: number) => void;
  userImage?: string;
}) {
  const [showSheet, setShowSheet] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [customizeAmount, setCustomizeAmount] = useState(10000);

  const balance =
    selectedAccountType === "real" ? traderoomBalance : practiceAccountBalance;
  const accountLabel =
    selectedAccountType === "real" ? "Real account" : "Demo account";

  const QUICK_AMOUNTS = [100, 1000, 5000, 10000];

  const closeSheet = () => {
    setShowSheet(false);
    setShowCustomize(false);
  };

  return (
    <>
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-4"
        style={{ backgroundColor: C.base, minHeight: "56px" }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: C.quaternary }}
        >
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.textSecondary}
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>

        {/* Balance + account type — tappable */}
        <button
          className="flex flex-col items-center gap-0"
          onClick={() => setShowSheet(true)}
        >
          <span
            className="text-xl font-bold tabular-nums"
            style={{
              color: selectedAccountType === "practice" ? C.orange : C.green,
            }}
          >
            $
            {balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: C.textSecondary }}>
              {accountLabel}
            </span>
            <ChevronDown size={12} style={{ color: C.textSecondary }} />
          </div>
        </button>

        {/* Wallet / deposit button */}
        <button
          onClick={onDeposit}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 active:opacity-75"
          style={{ backgroundColor: C.orange }}
        >
          <Wallet size={20} style={{ color: C.white }} />
        </button>
      </div>

      {/* ── Bottom sheet portal ── */}
      {showSheet &&
        ReactDOM.createPortal(
          <div className="fixed inset-0" style={{ zIndex: 99999 }}>
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
              onClick={closeSheet}
            />

            {/* Sheet */}
            <div
              className="absolute left-0 right-0 bottom-0 rounded-t-3xl"
              style={{ backgroundColor: C.quaternary }}
            >
              {showCustomize ? (
                /* ── Customize / Amount picker screen ── */
                <div className="px-5 pt-5 pb-10">
                  {/* Back + title */}
                  <div className="flex items-center mb-6">
                    <button
                      onClick={() => setShowCustomize(false)}
                      className="active:opacity-70"
                    >
                      <ChevronDown
                        size={22}
                        style={{
                          color: C.textPrimary,
                          transform: "rotate(90deg)",
                        }}
                      />
                    </button>
                    <span
                      className="ml-3 text-base font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      Amount
                    </span>
                  </div>

                  {/* Selected amount */}
                  <div className="flex flex-col items-center mb-4">
                    <span
                      className="text-4xl font-bold tabular-nums"
                      style={{ color: C.textPrimary }}
                    >
                      ${customizeAmount.toLocaleString("en-US")}
                    </span>
                    <span
                      className="text-xs mt-2"
                      style={{ color: C.textSecondary }}
                    >
                      Any amount from $10 to $10,000
                    </span>
                  </div>

                  {/* Quick amount grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCustomizeAmount(amt)}
                        className="py-4 rounded-xl text-sm font-semibold active:opacity-75"
                        style={{
                          backgroundColor:
                            customizeAmount === amt ? C.secondary : C.quinary,
                          color: C.textPrimary,
                          border: `1px solid ${customizeAmount === amt ? C.strokeSecondary : C.strokeTertiary}`,
                        }}
                      >
                        ${amt.toLocaleString("en-US")}
                      </button>
                    ))}
                  </div>

                  {/* Helper text */}
                  <p
                    className="text-xs text-center mb-6"
                    style={{ color: C.textSecondary }}
                  >
                    After applying, your demo balance will be topped up
                    <br />
                    to the set amount
                  </p>

                  {/* Confirm */}
                  <button
                    onClick={() => {
                      onReplenishPractice(customizeAmount);
                      closeSheet();
                    }}
                    className="w-full py-4 rounded-2xl text-base font-semibold active:opacity-80"
                    style={{ backgroundColor: C.orange, color: C.white }}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                /* ── Account list ── */
                <div className="px-5 pt-5 pb-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-base font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      Your accounts
                    </span>
                    <button onClick={closeSheet} className="active:opacity-70">
                      <X size={20} style={{ color: C.textSecondary }} />
                    </button>
                  </div>

                  {/* Real account card */}
                  <div
                    className="rounded-2xl p-4 mb-3"
                    style={{ backgroundColor: C.secondary }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div
                          className="text-sm font-medium mb-0.5"
                          style={{ color: C.textSecondary }}
                        >
                          Real account
                        </div>
                        <div
                          className="text-2xl font-bold tabular-nums"
                          style={{ color: C.textPrimary }}
                        >
                          $
                          {traderoomBalance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      {/* Radio */}
                      <button
                        onClick={() => onAccountTypeChange("real")}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: `2px solid ${selectedAccountType === "real" ? C.orange : C.textTertiary}`,
                          backgroundColor:
                            selectedAccountType === "real"
                              ? C.orange
                              : "transparent",
                        }}
                      >
                        {selectedAccountType === "real" && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: C.white }}
                          />
                        )}
                      </button>
                    </div>
                    {selectedAccountType === "real" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            closeSheet();
                            onWithdraw();
                          }}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold active:opacity-75"
                          style={{
                            backgroundColor: C.tertiary,
                            color: C.textPrimary,
                          }}
                        >
                          Withdraw
                        </button>
                        <button
                          onClick={() => {
                            closeSheet();
                            onDeposit();
                          }}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold active:opacity-75"
                          style={{ backgroundColor: C.orange, color: C.white }}
                        >
                          Deposit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Demo / Practice account card */}
                  <div
                    className="rounded-2xl p-4"
                    style={{ backgroundColor: C.secondary }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div
                          className="text-sm font-medium mb-0.5"
                          style={{ color: C.textSecondary }}
                        >
                          Demo account
                        </div>
                        <div
                          className="text-2xl font-bold tabular-nums"
                          style={{ color: C.textPrimary }}
                        >
                          $
                          {practiceAccountBalance.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      {/* Radio */}
                      <button
                        onClick={() => onAccountTypeChange("practice")}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          border: `2px solid ${selectedAccountType === "practice" ? C.orange : C.textTertiary}`,
                          backgroundColor:
                            selectedAccountType === "practice"
                              ? C.orange
                              : "transparent",
                        }}
                      >
                        {selectedAccountType === "practice" && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: C.white }}
                          />
                        )}
                      </button>
                    </div>
                    {selectedAccountType === "practice" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCustomize(true)}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold active:opacity-75"
                          style={{
                            backgroundColor: C.tertiary,
                            color: C.textPrimary,
                          }}
                        >
                          Customize
                        </button>
                        <button
                          onClick={() => {
                            onReplenishPractice(10000);
                            closeSheet();
                          }}
                          className="flex-1 py-3 rounded-xl text-sm font-semibold active:opacity-75"
                          style={{
                            backgroundColor: "#7B3810",
                            color: C.white,
                          }}
                        >
                          Top up
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// ─── Main Mobile Trading View ────────────────────────────────────────────────

// ─── Trade Notification Popups ────────────────────────────────────────────────

interface TradePopup {
  id: string;
  type: "entry" | "result";
  direction?: "higher" | "lower";
  entryPrice?: number;
  resultStatus?: "won" | "lost";
  resultAmount?: number;
  exitPrice?: number;
  symbol?: string;
  symbolFlag?: string;
  symbolDisplayName?: string;
}

export default function MobileTradingView(props: MobileTradingViewProps) {
  const [activeNavItem, setActiveNavItem] = useState("trade");
  // Track where the current price sits on the chart (0-100% from top)
  const [priceYPercent, setPriceYPercent] = useState<number>(50);
  const priceYPercentRef = useRef(50);

  // Asset picker bottom sheet
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [assetCategory, setAssetCategory] = useState<string>("All");

  // Trade notification popups
  const [popups, setPopups] = useState<TradePopup[]>([]);
  const prevTradesRef = useRef<ActiveTrade[]>([]);

  const dismissPopup = useCallback((id: string) => {
    setPopups((p) => p.filter((x) => x.id !== id));
  }, []);

  // Detect new trades (entry popup) and resolved trades (result popup)
  useEffect(() => {
    const prev = prevTradesRef.current;
    const curr = props.activeTrades;

    // New active trades → entry popup
    curr.forEach((trade) => {
      const wasPresent = prev.find((p) => p.id === trade.id);
      if (!wasPresent && trade.status === "active") {
        const popup: TradePopup = {
          id: `entry-${trade.id}`,
          type: "entry",
          direction: trade.direction,
          entryPrice: trade.entryPrice,
        };
        setPopups((p) => [...p.slice(-2), popup]);
        setTimeout(() => dismissPopup(`entry-${trade.id}`), 4000);
      }
    });

    // Resolved trades → result popup
    curr.forEach((trade) => {
      const prevTrade = prev.find((p) => p.id === trade.id);
      if (
        prevTrade &&
        prevTrade.status === "active" &&
        (trade.status === "won" || trade.status === "lost")
      ) {
        const popup: TradePopup = {
          id: `result-${trade.id}`,
          type: "result",
          direction: trade.direction,
          resultStatus: trade.status as "won" | "lost",
          resultAmount: trade.result,
          exitPrice: trade.exitPrice,
          symbol: trade.symbol,
          symbolFlag:
            props.symbols.find((s) => s.symbol === trade.symbol)?.flag ??
            trade.symbol,
          symbolDisplayName:
            props.symbols.find((s) => s.symbol === trade.symbol)?.displayName ??
            trade.symbol,
        };
        // No cap here — result popups are grouped by symbol so all must be kept
        setPopups((p) => [...p, popup]);
        setTimeout(() => dismissPopup(`result-${trade.id}`), 5000);
      }
    });

    prevTradesRef.current = curr;
  }, [props.activeTrades, dismissPopup]);

  // Combined onPriceYPosition: update local state AND forward to parent
  const handlePriceYPosition = useCallback(
    (y: number) => {
      // Throttle state updates to avoid too many re-renders (only update when moved >0.5%)
      if (Math.abs(y - priceYPercentRef.current) > 0.5) {
        priceYPercentRef.current = y;
        setPriceYPercent(y);
      }
      props.onPriceYPosition(y);
    },
    [props.onPriceYPosition],
  );

  return (
    <div
      className="flex flex-col"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: C.base,
        fontFamily: '"Inter", sans-serif',
        touchAction: "none",
        overflow: "hidden",
      }}
    >
      {/* Balance bar */}
      <MobileBalanceBar
        selectedAccountType={props.selectedAccountType}
        traderoomBalance={props.traderoomBalance}
        practiceAccountBalance={props.practiceAccountBalance}
        onAccountTypeChange={props.onAccountTypeChange}
        onDeposit={props.onDeposit}
        onWithdraw={props.onWithdraw}
        onReplenishPractice={props.onReplenishPractice}
        userImage={props.userImage}
      />

      {/* Asset header with tabs - hidden when portfolio or history tab is active */}
      {activeNavItem !== "portfolio" && activeNavItem !== "history" && (
        <MobileAssetHeader
          selectedSymbol={props.selectedSymbol}
          currentPrice={props.currentPrice}
          priceDirection={props.priceDirection}
          openTabs={props.openTabs}
          activeTab={props.activeTab}
          activeTrades={props.activeTrades}
          onTabChange={props.onTabChange}
          onCloseTab={props.onCloseTab}
          onAddAsset={() => setShowAssetPicker(true)}
          AssetFlag={props.AssetFlag}
          symbols={props.symbols}
        />
      )}

      {/* Portfolio View - replaces chart when portfolio tab is active */}
      {activeNavItem === "portfolio" && (
        <MobilePortfolioView
          activeTrades={props.activeTrades}
          currentPrice={props.currentPrice}
          traderoomBalance={props.traderoomBalance}
          practiceAccountBalance={props.practiceAccountBalance}
          selectedAccountType={props.selectedAccountType}
          countdown={props.countdown}
          symbols={props.symbols}
          AssetFlag={props.AssetFlag}
        />
      )}

      {/* History View - replaces chart when history tab is active */}
      {activeNavItem === "history" && (
        <MobileHistoryView
          tradeHistory={props.tradeHistory}
          symbols={props.symbols}
          AssetFlag={props.AssetFlag}
        />
      )}

      {/* Chart area - fills remaining space (IQ Option: grid-template-rows: minmax(140px,1fr) auto) */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          minHeight: "140px",
          display:
            activeNavItem === "portfolio" || activeNavItem === "history"
              ? "none"
              : undefined,
        }}
      >
        {/* World map background */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ zIndex: 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/traderoom/backgrounds/worldmapbackground.svg"
            alt=""
            className="w-full h-full"
            style={{ objectFit: "cover", opacity: 0.06 }}
            aria-hidden="true"
          />
        </div>

        {/* Full-bleed chart — one instance per open tab, show/hide with visibility */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {props.openTabs.map((tab, tabIndex) => {
            const isActive = tabIndex === props.activeTab;
            const tabActiveTrades = props.activeTrades.filter(
              (t) => t.status === "active" && t.symbol === tab.symbol,
            );
            const earliestActive =
              tabActiveTrades.length > 0
                ? tabActiveTrades.reduce((e, t) =>
                    t.expirationTime < e.expirationTime ? t : e,
                  )
                : null;
            return (
              <div
                key={`chart-${tab.symbol}`}
                className="absolute inset-0"
                style={{
                  visibility: isActive ? "visible" : "hidden",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <ChartGrid
                  gridType={props.selectedChartGrid}
                  defaultSymbol={tab.symbol}
                  availableSymbols={[
                    "BTC",
                    "ETH",
                    "BNB",
                    "SOL",
                    "ADA",
                    "DOGE",
                    "XRP",
                    "DOT",
                    "MATIC",
                    "LINK",
                  ]}
                  onPriceYPosition={isActive ? handlePriceYPosition : undefined}
                  onLivePriceUpdate={
                    isActive ? props.onLivePriceUpdate : undefined
                  }
                  onPriceToYConverter={
                    isActive ? props.onPriceToYConverter : undefined
                  }
                  onTimeToXConverter={
                    isActive ? props.onTimeToXConverter : undefined
                  }
                  expirationSeconds={
                    isActive ? props.expirationSeconds : undefined
                  }
                  expirationCountdown={isActive ? props.countdown : undefined}
                  hasActiveTrades={isActive && tabActiveTrades.length > 0}
                  candleInterval={props.candleInterval}
                  hoveredButton={isActive ? props.hoveredButton : null}
                  onLastCandleTimestamp={
                    isActive ? props.onLastCandleTimestamp : undefined
                  }
                  hideTradeOverlay={true}
                  disableCrosshair={true}
                  activeTradeExpirationTime={
                    isActive ? props.activeTradeExpirationTime : undefined
                  }
                  activeTradeEntryTime={
                    isActive ? props.activeTradeEntryTime : undefined
                  }
                  activeTradesForChart={
                    isActive
                      ? tabActiveTrades.map((t) => ({
                          id: t.id,
                          symbol: t.symbol,
                          direction: t.direction,
                          amount: t.amount,
                          entryPrice: t.entryPrice,
                          status: t.status,
                        }))
                      : []
                  }
                />
              </div>
            );
          })}
        </div>

        {/* ── Current price dashed line + badge (IQ Option style) ── */}
        {props.currentPrice > 0 && (
          <>
            {/* Horizontal dashed price line spanning chart width (stops before badge) */}
            <div
              className="absolute left-0 pointer-events-none"
              style={{
                top: `${priceYPercent}%`,
                right: "46px",
                height: "1px",
                backgroundImage: `repeating-linear-gradient(to right, ${C.textTertiary} 0, ${C.textTertiary} 4px, transparent 4px, transparent 8px)`,
                zIndex: 20,
                transform: "translateY(-0.5px)",
                opacity: 0.85,
              }}
            />

            {/* Price badge on the right edge */}
            <div
              className="absolute right-0 pointer-events-none"
              style={{
                top: `${priceYPercent}%`,
                transform: "translateY(-50%)",
                zIndex: 21,
              }}
            >
              <div
                className="px-1 py-px rounded-md text-[8px] font-bold tabular-nums whitespace-nowrap"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  minWidth: "44px",
                  textAlign: "center",
                }}
              >
                {(() => {
                  const priceStr = props.currentPrice.toFixed(5);
                  const head = priceStr.slice(0, -3);
                  const tail = priceStr.slice(-3);
                  const tailColor =
                    props.priceDirection === "up"
                      ? C.green
                      : props.priceDirection === "down"
                        ? C.red
                        : "#000000";
                  return (
                    <>
                      <span>{head}</span>
                      <span style={{ color: tailColor }}>{tail}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Horizontal sentiment bar - below chart, above trading panel */}
      {activeNavItem !== "portfolio" && activeNavItem !== "history" && (
        <div
          style={{
            backgroundColor: C.base,
          }}
        >
          <HorizontalSentiment selectedSymbol={props.selectedSymbol} />
        </div>
      )}

      {/* Trading Panel - hidden when portfolio or history tab is active */}
      {activeNavItem !== "portfolio" && activeNavItem !== "history" && (
        <MobileTradingPanel
          amount={props.amount}
          amountInput={props.amountInput}
          onAmountChange={props.onAmountChange}
          onAmountInputChange={props.onAmountInputChange}
          expirationSeconds={props.expirationSeconds}
          countdown={props.countdown}
          onExpirationChange={props.onExpirationChange}
          onExecuteTrade={props.onExecuteTrade}
          isExecutingTrade={props.isExecutingTrade}
          tradeDirection={props.tradeDirection}
          selectedAccountType={props.selectedAccountType}
          traderoomBalance={props.traderoomBalance}
          practiceAccountBalance={props.practiceAccountBalance}
          activeTrades={props.activeTrades}
          selectedSymbol={props.selectedSymbol}
          hoveredButton={props.hoveredButton}
          onHoveredButton={props.onHoveredButton}
        />
      )}

      {/* Bottom Navigation */}
      <MobileBottomNav
        activeItem={activeNavItem}
        onItemChange={setActiveNavItem}
        onShowHistory={props.onShowHistory}
        onShowPortfolio={props.onShowPortfolio}
        activeTrades={props.activeTrades}
      />

      {/* ─── Mobile Asset Picker (bottom sheet) ─────────────────────────────── */}
      {showAssetPicker &&
        (() => {
          const categories = [
            "All",
            "Forex",
            "Crypto",
            "Stocks",
            "Commodities",
          ];
          const filtered = props.symbols.filter((s) => {
            const matchCat =
              assetCategory === "All" || s.category === assetCategory;
            const matchQ =
              assetSearch === "" ||
              s.symbol.toLowerCase().includes(assetSearch.toLowerCase()) ||
              (s.displayName || "")
                .toLowerCase()
                .includes(assetSearch.toLowerCase());
            return matchCat && matchQ;
          });

          const handleSelect = (sym: (typeof props.symbols)[0]) => {
            props.onAddTab(sym.symbol);
            setShowAssetPicker(false);
            setAssetSearch("");
          };

          return (
            <div
              className="absolute inset-0 flex flex-col"
              style={{ zIndex: 10000, backgroundColor: C.base }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
                style={{ borderBottom: `1px solid ${C.strokeTertiary}` }}
              >
                <button
                  onClick={() => {
                    setShowAssetPicker(false);
                    setAssetSearch("");
                  }}
                  className="flex-shrink-0 p-1 rounded-lg transition-colors"
                  style={{ color: C.textSecondary }}
                >
                  <X size={20} />
                </button>
                <span
                  className="text-base font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  Select Asset
                </span>
              </div>

              {/* Search bar */}
              <div
                className="px-4 py-2 flex-shrink-0"
                style={{ borderBottom: `1px solid ${C.strokeTertiary}` }}
              >
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ backgroundColor: C.tertiary }}
                >
                  <Search size={14} style={{ color: C.textTertiary }} />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search assets…"
                    autoFocus
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: C.textPrimary }}
                  />
                  {assetSearch && (
                    <button
                      onClick={() => setAssetSearch("")}
                      style={{ color: C.textTertiary }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category tabs */}
              <div
                className="flex items-center gap-1 px-3 py-2 overflow-x-auto flex-shrink-0"
                style={{
                  scrollbarWidth: "none",
                  borderBottom: `1px solid ${C.strokeTertiary}`,
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAssetCategory(cat)}
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    style={{
                      backgroundColor:
                        assetCategory === cat ? C.blue : C.quaternary,
                      color: assetCategory === cat ? C.white : C.textSecondary,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Symbol list */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <span className="text-sm" style={{ color: C.textTertiary }}>
                      No assets found
                    </span>
                  </div>
                ) : (
                  filtered.map((sym) => {
                    const isOpen = props.openTabs.some(
                      (t) => t.symbol === sym.symbol,
                    );
                    const isPositive = !sym.change.startsWith("-");
                    return (
                      <button
                        key={sym.symbol}
                        onClick={() => handleSelect(sym)}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-colors active:opacity-70"
                        style={{
                          borderBottom: `1px solid ${C.strokeTertiary}`,
                          backgroundColor: isOpen
                            ? C.quaternary
                            : "transparent",
                        }}
                      >
                        <props.AssetFlag
                          flag={sym.flag}
                          symbol={sym.symbol}
                          size={28}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: C.textPrimary }}
                            >
                              {sym.displayName || sym.symbol}
                            </span>
                            {isOpen && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: C.blue + "33",
                                  color: C.blue,
                                }}
                              >
                                Open
                              </span>
                            )}
                          </div>
                          <div
                            className="text-[11px] mt-0.5"
                            style={{ color: C.textTertiary }}
                          >
                            {sym.category}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-sm font-mono tabular-nums"
                            style={{ color: C.textPrimary }}
                          >
                            {sym.price}
                          </div>
                          <div
                            className="text-[11px] tabular-nums"
                            style={{
                              color: isPositive ? C.greenText : C.redText,
                            }}
                          >
                            {sym.percentage}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

      {/* Trade Result Popups — slide in from top, grouped by symbol */}
      {typeof document !== "undefined" &&
        popups.filter((p) => p.type === "result").length > 0 &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 99999,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 6,
              padding: "10px 10px 0",
              pointerEvents: "none",
            }}
          >
            {(() => {
              // Group result popups by symbol so multiple trades on same asset collapse
              const resultPopups = popups.filter((p) => p.type === "result");
              const groups: Record<string, typeof resultPopups> = {};
              for (const p of resultPopups) {
                const key = p.symbol ?? p.id;
                if (!groups[key]) groups[key] = [];
                groups[key].push(p);
              }
              return Object.entries(groups).map(([key, group]) => {
                const first = group[0];
                const totalAmount = group.reduce(
                  (sum, p) => sum + (p.resultAmount ?? 0),
                  0,
                );
                const isWon = totalAmount >= 0;
                const amountColor = isWon ? C.greenText : C.redText;
                const amountSign = isWon ? "+" : "−";
                const count = group.length;
                const posLabel =
                  count === 1 ? "1 position" : `${count} positions`;
                const displayName =
                  first.symbolDisplayName ?? first.symbol ?? key;
                const title = `${displayName}: ${posLabel}`;
                const dismissAll = () =>
                  group.forEach((p) => dismissPopup(p.id));

                return (
                  <div
                    key={key}
                    style={{
                      pointerEvents: "auto",
                      animation:
                        "slideDownFromTop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                      backgroundColor: C.tertiary,
                      border: `1px solid ${C.strokeTertiary}`,
                      borderRadius: 14,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    }}
                  >
                    {/* Asset icon + OTC badge */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {first.symbolFlag && first.symbol ? (
                          <props.AssetFlag
                            flag={first.symbolFlag}
                            symbol={first.symbol}
                            size={32}
                          />
                        ) : (
                          <span
                            style={{ fontSize: 18, color: C.textSecondary }}
                          >
                            ?
                          </span>
                        )}
                      </div>
                      {displayName.includes("OTC") && (
                        <span
                          style={{
                            fontSize: 8,
                            fontWeight: 700,
                            color: C.textTertiary,
                            letterSpacing: 0.3,
                            lineHeight: 1,
                          }}
                        >
                          OTC
                        </span>
                      )}
                    </div>

                    {/* Text block */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: C.textPrimary,
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          color: amountColor,
                          fontSize: 13,
                          fontWeight: 700,
                          marginTop: 2,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {amountSign}${Math.abs(totalAmount).toFixed(2)}
                      </div>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={dismissAll}
                      style={{
                        color: C.textTertiary,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              });
            })()}
          </div>,
          document.body,
        )}
    </div>
  );
}
