"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

          return (
            <button
              key={`${tab.symbol}-${i}`}
              onClick={() => onTabChange(i)}
              className="flex items-center gap-1.5 flex-shrink-0 rounded-lg px-2.5 py-1.5 transition-all duration-200"
              style={{
                backgroundColor: isActive ? C.secondary : C.quaternary,
                minHeight: "36px",
              }}
            >
              <AssetFlag flag={tabFlag} symbol={tab.symbol} size={16} />
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{
                  color: isActive ? C.textPrimary : C.textSecondary,
                }}
              >
                {tab.symbol}
              </span>
              {tabTrades.length > 0 && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: C.green }}
                />
              )}
              {tab.lastResult && (
                <span
                  className="text-[10px] font-bold tabular-nums"
                  style={{
                    color:
                      tab.lastResult.status === "won" ? C.greenText : C.redText,
                  }}
                >
                  {tab.lastResult.status === "won" ? "+" : "-"}$
                  {Math.abs(tab.lastResult.amount).toFixed(0)}
                </span>
              )}
              {openTabs.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Close ${tab.symbol}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onCloseTab(i);
                    }
                  }}
                  className="ml-0.5 opacity-40 hover:opacity-100 transition-opacity inline-flex"
                >
                  <X size={10} style={{ color: C.textSecondary }} />
                </span>
              )}
            </button>
          );
        })}

        {/* Add asset button */}
        <button
          onClick={onAddAsset}
          className="flex items-center justify-center flex-shrink-0 rounded-lg transition-colors"
          style={{
            backgroundColor: C.quaternary,
            width: "36px",
            height: "36px",
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
            className="text-[10px] font-medium uppercase tracking-wider mb-1"
            style={{ color: C.textTertiary }}
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
            <div
              className="flex-1 text-center text-sm font-medium tabular-nums cursor-pointer"
              style={{ color: C.textPrimary }}
              onClick={() => setShowAmountPresets(!showAmountPresets)}
            >
              ${amount}
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
          <span
            className="text-[10px] tabular-nums opacity-80"
            style={{ color: C.white }}
          >
            +85%
          </span>
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
          <span
            className="text-[10px] tabular-nums opacity-80"
            style={{ color: C.white }}
          >
            +85%
          </span>
        </button>

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
                          <span
                            className="text-base font-medium"
                            style={{ color: C.greenText }}
                          >
                            +85%
                          </span>
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

function HorizontalSentiment() {
  // Static sentiment display - in production this would use real data
  const buyPercent = 67;
  const sellPercent = 33;

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
        onShowHistory();
      },
    },
    {
      id: "more",
      label: "More",
      icon: MoreHorizontal,
      onClick: () => onItemChange("more"),
    },
  ];

  return (
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
  );
}

// ─── Balance Display ─────────────────────────────────────────────────────────

function MobileBalanceBar({
  selectedAccountType,
  traderoomBalance,
  practiceAccountBalance,
  onAccountTypeChange,
  onDeposit,
}: {
  selectedAccountType: "real" | "practice";
  traderoomBalance: number;
  practiceAccountBalance: number;
  onAccountTypeChange: (type: "real" | "practice") => void;
  onDeposit: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const balance =
    selectedAccountType === "real" ? traderoomBalance : practiceAccountBalance;

  return (
    <div className="relative">
      <div
        className="flex items-center justify-between px-4 py-1.5"
        style={{
          backgroundColor: C.base,
        }}
      >
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                selectedAccountType === "real" ? C.green : C.orange,
            }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: C.textSecondary }}
          >
            {selectedAccountType === "real" ? "Real" : "Practice"}
          </span>
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: C.textPrimary }}
          >
            $
            {balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <ChevronDown
            size={12}
            style={{
              color: C.textSecondary,
              transform: showDropdown ? "scaleY(-1)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>
        <button
          onClick={onDeposit}
          className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors active:opacity-80"
          style={{
            backgroundColor: C.green,
            color: C.white,
          }}
        >
          Deposit
        </button>
      </div>

      {/* Account type dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 z-50 p-2"
          style={{ backgroundColor: C.quaternary }}
        >
          <button
            onClick={() => {
              onAccountTypeChange("real");
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor:
                selectedAccountType === "real" ? C.secondary : "transparent",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: C.green }}
            />
            <div className="flex-1 text-left">
              <div
                className="text-sm font-medium"
                style={{ color: C.textPrimary }}
              >
                Real Account
              </div>
              <div
                className="text-xs tabular-nums"
                style={{ color: C.textSecondary }}
              >
                $
                {traderoomBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              onAccountTypeChange("practice");
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            style={{
              backgroundColor:
                selectedAccountType === "practice"
                  ? C.secondary
                  : "transparent",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: C.orange }}
            />
            <div className="flex-1 text-left">
              <div
                className="text-sm font-medium"
                style={{ color: C.textPrimary }}
              >
                Practice Account
              </div>
              <div
                className="text-xs tabular-nums"
                style={{ color: C.textSecondary }}
              >
                $
                {practiceAccountBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
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
        };
        setPopups((p) => [...p.slice(-2), popup]);
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
      />

      {/* Asset header with tabs - hidden when portfolio tab is active */}
      {activeNavItem !== "portfolio" && (
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

      {/* Chart area - fills remaining space (IQ Option: grid-template-rows: minmax(140px,1fr) auto) */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          minHeight: "140px",
          display: activeNavItem === "portfolio" ? "none" : undefined,
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
      {activeNavItem !== "portfolio" && (
        <div
          style={{
            backgroundColor: C.base,
          }}
        >
          <HorizontalSentiment />
        </div>
      )}

      {/* Trading Panel - hidden when portfolio tab is active */}
      {activeNavItem !== "portfolio" && (
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
    </div>
  );
}
