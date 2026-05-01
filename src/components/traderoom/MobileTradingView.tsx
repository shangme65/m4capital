"use client";

import { useState, useCallback, useRef } from "react";
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
  const sym = symbols.find((s) => s.symbol === selectedSymbol);
  const change = sym?.change || "+0.00";
  const pct = sym?.percentage || "0.00%";
  const isPositive = !change.startsWith("-");
  const flag = sym?.flag || "";

  return (
    <div
      className="flex-shrink-0 select-none"
      style={{ backgroundColor: C.base }}
    >
      {/* Asset info bar */}
      <div
        className="flex items-center gap-3 px-4 py-2"
        style={{ borderBottom: `1.2px solid ${C.strokeTertiary}` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AssetFlag flag={flag} symbol={selectedSymbol} size={24} />
          <div className="min-w-0">
            <div
              className="text-sm font-medium truncate"
              style={{ color: C.textPrimary }}
            >
              {sym?.displayName || selectedSymbol}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium tabular-nums"
                style={{
                  color:
                    priceDirection === "up"
                      ? C.greenText
                      : priceDirection === "down"
                        ? C.redText
                        : C.textPrimary,
                }}
              >
                {currentPrice > 0 ? currentPrice.toFixed(5) : "—"}
              </span>
              <span
                className="text-[10px] tabular-nums"
                style={{ color: isPositive ? C.greenText : C.redText }}
              >
                {pct}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable asset tabs */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          borderBottom: `1.2px solid ${C.strokeTertiary}`,
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
  const currentBalance =
    selectedAccountType === "real" ? traderoomBalance : practiceAccountBalance;
  const activeOnSymbol = activeTrades.filter(
    (t) => t.symbol === selectedSymbol && t.status === "active",
  );

  const formatExpiration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
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

  const adjustExpiration = (delta: number) => {
    const steps = [5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    const currentIdx = steps.indexOf(expirationSeconds);
    if (currentIdx === -1) {
      onExpirationChange(30);
      return;
    }
    const newIdx = Math.max(0, Math.min(steps.length - 1, currentIdx + delta));
    onExpirationChange(steps[newIdx]);
  };

  const amountPresets = [1, 2, 5, 10, 25, 50, 100, 500];

  return (
    <div
      className="flex-shrink-0 select-none"
      style={{
        backgroundColor: C.base,
        borderTop: `1.2px solid ${C.strokeTertiary}`,
      }}
    >
      {/* Trading controls grid — IQ Option mobile layout */}
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

        {/* Expiration control */}
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
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{
              backgroundColor: C.quaternary,
              height: "40px",
            }}
          >
            <button
              onClick={() => adjustExpiration(-1)}
              className="flex items-center justify-center w-9 h-full transition-colors active:opacity-70"
              style={{ color: C.textSecondary }}
            >
              <Minus size={14} />
            </button>
            <div
              className="flex-1 text-center text-sm font-medium tabular-nums"
              style={{ color: C.textPrimary }}
            >
              {formatExpiration(expirationSeconds)}
            </div>
            <button
              onClick={() => adjustExpiration(1)}
              className="flex items-center justify-center w-9 h-full transition-colors active:opacity-70"
              style={{ color: C.textSecondary }}
            >
              <Plus size={14} />
            </button>
          </div>
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
        <div
          className="grid grid-cols-4 gap-1.5 px-4 pb-3"
          style={{ borderTop: `1px solid ${C.strokeTertiary}` }}
        >
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
      id: "deals",
      label: "Deals",
      icon: BarChart3,
      badge: activeCount > 0 ? activeCount : undefined,
      onClick: () => {
        onItemChange("deals");
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
        borderTop: `1.2px solid ${C.strokeTertiary}`,
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
          borderBottom: `1.2px solid ${C.strokeTertiary}`,
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

export default function MobileTradingView(props: MobileTradingViewProps) {
  const [activeNavItem, setActiveNavItem] = useState("trade");
  // Track where the current price sits on the chart (0-100% from top)
  const [priceYPercent, setPriceYPercent] = useState<number>(50);
  const priceYPercentRef = useRef(50);

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

      {/* Asset header with tabs */}
      <MobileAssetHeader
        selectedSymbol={props.selectedSymbol}
        currentPrice={props.currentPrice}
        priceDirection={props.priceDirection}
        openTabs={props.openTabs}
        activeTab={props.activeTab}
        activeTrades={props.activeTrades}
        onTabChange={props.onTabChange}
        onCloseTab={props.onCloseTab}
        onAddAsset={props.onShowAddAsset}
        AssetFlag={props.AssetFlag}
        symbols={props.symbols}
      />

      {/* Chart area — fills remaining space (IQ Option: grid-template-rows: minmax(140px,1fr) auto) */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: "140px" }}
      >
        {/* Full-bleed chart */}
        <div className="absolute inset-0">
          <ChartGrid
            key={props.selectedSymbol}
            gridType={props.selectedChartGrid}
            defaultSymbol={props.selectedSymbol}
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
            onPriceYPosition={handlePriceYPosition}
            onLivePriceUpdate={props.onLivePriceUpdate}
            onPriceToYConverter={props.onPriceToYConverter}
            onTimeToXConverter={props.onTimeToXConverter}
            expirationSeconds={props.expirationSeconds}
            expirationCountdown={props.countdown}
            hasActiveTrades={
              props.activeTrades.filter((t) => t.status === "active").length > 0
            }
            candleInterval={props.candleInterval}
            hoveredButton={props.hoveredButton}
            onLastCandleTimestamp={props.onLastCandleTimestamp}
            activeTradeExpirationTime={props.activeTradeExpirationTime}
            activeTradeEntryTime={props.activeTradeEntryTime}
          />
        </div>

        {/* ── Current price dashed line + badge (IQ Option style) ── */}
        {props.currentPrice > 0 && (
          <>
            {/* Horizontal dashed price line spanning chart width (stops before badge) */}
            <div
              className="absolute left-0 pointer-events-none"
              style={{
                top: `${priceYPercent}%`,
                right: "60px",
                height: "1px",
                backgroundImage: `repeating-linear-gradient(to right, ${
                  props.priceDirection === "up"
                    ? C.green
                    : props.priceDirection === "down"
                      ? C.red
                      : C.textTertiary
                } 0, ${
                  props.priceDirection === "up"
                    ? C.green
                    : props.priceDirection === "down"
                      ? C.red
                      : C.textTertiary
                } 4px, transparent 4px, transparent 8px)`,
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
                className="px-2 py-0.5 rounded-sm text-[11px] font-bold tabular-nums whitespace-nowrap"
                style={{
                  backgroundColor:
                    props.priceDirection === "up"
                      ? C.green
                      : props.priceDirection === "down"
                        ? C.red
                        : C.strokeSecondary,
                  color: C.white,
                  minWidth: "58px",
                  textAlign: "center",
                }}
              >
                {props.currentPrice.toFixed(5)}
              </div>
            </div>
          </>
        )}

        {/* Horizontal sentiment bar overlay at bottom of chart */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <HorizontalSentiment />
        </div>
      </div>

      {/* Trading Panel — fixed height like IQ (168px area) */}
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

      {/* Bottom Navigation */}
      <MobileBottomNav
        activeItem={activeNavItem}
        onItemChange={setActiveNavItem}
        onShowHistory={props.onShowHistory}
        onShowPortfolio={props.onShowPortfolio}
        activeTrades={props.activeTrades}
      />
    </div>
  );
}
