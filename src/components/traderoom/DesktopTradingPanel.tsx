"use client";

import { useRef } from "react";
import { Clock, Plus } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface LastFinishedTrade {
  symbol: string;
  direction: "higher" | "lower";
  amount: number;
  result: number;
  status: "won" | "lost";
}

export interface DesktopTradingPanelProps {
  amount: number;
  amountInput: string;
  onAmountChange: (amount: number) => void;
  onAmountInputChange: (input: string) => void;
  expirationSeconds: number;
  onExpirationChange: (seconds: number) => void;
  showExpirationModal: boolean;
  onToggleExpirationModal: () => void;
  onCloseExpirationModal: () => void;
  currentTime: Date | null;
  onExecuteTrade: (direction: "higher" | "lower") => void;
  isExecutingTrade: boolean;
  activeTrades: ActiveTrade[];
  selectedSymbol: string;
  lastFinishedTrade: LastFinishedTrade | null;
  onNewOption: () => void;
  hoveredButton: "higher" | "lower" | null;
  onHoveredButton: (button: "higher" | "lower" | null) => void;
}

// ─── Main Desktop Trading Panel ──────────────────────────────────────────────

export default function DesktopTradingPanel({
  amount,
  amountInput,
  onAmountChange,
  onAmountInputChange,
  expirationSeconds,
  onExpirationChange,
  showExpirationModal,
  onToggleExpirationModal,
  onCloseExpirationModal,
  currentTime,
  onExecuteTrade,
  isExecutingTrade,
  activeTrades,
  selectedSymbol,
  lastFinishedTrade,
  onNewOption,
  hoveredButton,
  onHoveredButton,
}: DesktopTradingPanelProps) {
  const expirationButtonRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="flex-col flex"
      style={{
        overflow: "hidden",
        width: "130px",
        minWidth: "130px",
      }}
    >
      <div className="p-1.5 h-full overflow-y-auto flex flex-col gap-2.5">
        {/* Invest Section */}
        <div
          className="rounded overflow-hidden"
          style={{
            backgroundColor: "#0f1a2a",
            border: "1px solid #1a2d45",
          }}
        >
          <div className="flex items-stretch flex-1">
            <div className="flex-1">
              <div className="flex items-center justify-between px-2 py-0.5">
                <span
                  className="text-[11px] font-medium"
                  style={{ color: "#8b9ab8" }}
                >
                  Invest
                </span>
                <button
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
                  style={{ backgroundColor: "#d0d5dc", color: "#000000" }}
                >
                  ?
                </button>
              </div>
              <div className="px-2 py-1 flex items-center gap-0.5">
                <span
                  className="font-medium"
                  style={{
                    color: "#4a6080",
                    fontSize: "12px",
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  $
                </span>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    if (raw === "") {
                      onAmountInputChange("");
                      return;
                    }
                    const val = parseInt(raw, 10);
                    if (!isNaN(val)) {
                      const clamped = Math.min(val, 1000000);
                      onAmountInputChange(clamped.toLocaleString());
                      onAmountChange(Math.max(clamped, 1));
                    }
                  }}
                  onBlur={() => {
                    if (
                      amountInput === "" ||
                      parseInt(amountInput.replace(/[^0-9]/g, ""), 10) < 1
                    ) {
                      onAmountChange(1);
                      onAmountInputChange("1");
                    }
                  }}
                  className="bg-transparent border-none outline-none font-medium w-full"
                  style={{
                    color: "#eef2f7",
                    fontSize: "14px",
                    fontFamily: "Roboto, sans-serif",
                  }}
                />
              </div>
            </div>
            <div
              className="flex flex-col"
              style={{
                borderLeft: "1px solid #1a2d45",
                width: "18px",
                backgroundColor: "#3a4a5e",
              }}
            >
              <button
                onClick={() => {
                  const v = Math.min(amount + 1, 1000000);
                  onAmountChange(v);
                  onAmountInputChange(v.toLocaleString());
                }}
                className="flex-1 flex items-center justify-center transition-colors text-sm font-bold"
                style={{
                  color: "#ffffff",
                  borderBottom: "1px solid #1a2d45",
                }}
                onMouseEnter={(e) => (
                  (e.currentTarget.style.backgroundColor = "#1a2d45"),
                  (e.currentTarget.style.color = "#eef2f7")
                )}
                onMouseLeave={(e) => (
                  (e.currentTarget.style.backgroundColor = "transparent"),
                  (e.currentTarget.style.color = "#ffffff")
                )}
              >
                +
              </button>
              <button
                onClick={() => {
                  const v = Math.max(amount - 1, 1);
                  onAmountChange(v);
                  onAmountInputChange(v.toLocaleString());
                }}
                className="flex-1 flex items-center justify-center transition-colors text-sm font-bold"
                style={{ color: "#ffffff" }}
                onMouseEnter={(e) => (
                  (e.currentTarget.style.backgroundColor = "#1a2d45"),
                  (e.currentTarget.style.color = "#eef2f7")
                )}
                onMouseLeave={(e) => (
                  (e.currentTarget.style.backgroundColor = "transparent"),
                  (e.currentTarget.style.color = "#ffffff")
                )}
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Expiration Section */}
        <div className="relative" ref={expirationButtonRef}>
          <div
            className="rounded overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#3a4a5e",
              border: "1px solid #3a4a5e",
            }}
            onClick={onToggleExpirationModal}
          >
            <div className="flex items-stretch flex-1">
              <div className="flex-1">
                <div className="flex items-center justify-between px-2 py-0.5">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "#8b9ab8" }}
                  >
                    Expiration
                  </span>
                  <button
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
                    style={{
                      backgroundColor: "#d0d5dc",
                      color: "#000000",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ?
                  </button>
                </div>
                <div className="px-2 py-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: "#8b9ab8" }} />
                  <span
                    className="font-medium"
                    style={{
                      color: "#eef2f7",
                      fontSize: "14px",
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    {(() => {
                      const now = currentTime || new Date();
                      const expirationTime = new Date(
                        now.getTime() + expirationSeconds * 1000,
                      );
                      return `${String(expirationTime.getHours()).padStart(2, "0")}:${String(expirationTime.getMinutes()).padStart(2, "0")}`;
                    })()}
                  </span>
                </div>
              </div>
              <div
                className="flex flex-col"
                style={{
                  borderLeft: "1px solid #0a1220",
                  width: "18px",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const options = [
                      30, 60, 120, 180, 240, 300, 600, 900, 1800, 3600,
                    ];
                    const currentIndex = options.indexOf(expirationSeconds);
                    if (currentIndex < options.length - 1)
                      onExpirationChange(options[currentIndex + 1]);
                  }}
                  className="flex-1 flex items-center justify-center transition-colors text-sm font-bold"
                  style={{
                    color: "#ffffff",
                    borderBottom: "1px solid #0a1220",
                  }}
                  onMouseEnter={(e) => (
                    (e.currentTarget.style.backgroundColor = "#1a2d45"),
                    (e.currentTarget.style.color = "#eef2f7")
                  )}
                  onMouseLeave={(e) => (
                    (e.currentTarget.style.backgroundColor = "transparent"),
                    (e.currentTarget.style.color = "#ffffff")
                  )}
                >
                  +
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const options = [
                      30, 60, 120, 180, 240, 300, 600, 900, 1800, 3600,
                    ];
                    const currentIndex = options.indexOf(expirationSeconds);
                    if (currentIndex > 0)
                      onExpirationChange(options[currentIndex - 1]);
                  }}
                  className="flex-1 flex items-center justify-center transition-colors text-sm font-bold"
                  style={{ color: "#ffffff" }}
                  onMouseEnter={(e) => (
                    (e.currentTarget.style.backgroundColor = "#1a2d45"),
                    (e.currentTarget.style.color = "#eef2f7")
                  )}
                  onMouseLeave={(e) => (
                    (e.currentTarget.style.backgroundColor = "transparent"),
                    (e.currentTarget.style.color = "#ffffff")
                  )}
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Expiration Time Panel - beside right sidebar */}
          {showExpirationModal && (
            <>
              <div
                className="fixed inset-0 z-[200]"
                onClick={onCloseExpirationModal}
              />
              <div
                className="fixed z-[201] rounded-l-xl shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: "#1c2127",
                  border: "1px solid #2a2e35",
                  borderRight: "none",
                  width: "420px",
                  right: "170px",
                  top: "60px",
                  maxHeight: "calc(100vh - 120px)",
                }}
              >
                {/* Header */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "#2a2e35" }}
                >
                  <h3
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: "#eef2f7" }}
                  >
                    EXPIRATION TIME
                  </h3>
                </div>

                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Left Column - Short Expirations (1-5 minutes) */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#8b9ab8" }}
                        >
                          Profit
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: "#00c087",
                            color: "white",
                          }}
                        >
                          85%
                        </span>
                      </div>

                      {/* Column Headers */}
                      <div className="flex items-center justify-between mb-2 px-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#4a6080" }}
                        >
                          Time
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#4a6080" }}
                        >
                          Remaining
                        </span>
                      </div>

                      {/* Options - Minute aligned */}
                      <div className="space-y-1">
                        {[1, 2, 3, 4, 5].map((minuteOffset) => {
                          const now = currentTime || new Date();
                          const nextMinute = new Date(now);
                          nextMinute.setSeconds(0, 0);
                          nextMinute.setMinutes(
                            nextMinute.getMinutes() + minuteOffset,
                          );

                          const timeStr = `${String(nextMinute.getHours()).padStart(2, "0")}:${String(nextMinute.getMinutes()).padStart(2, "0")}`;
                          const remainingMs =
                            nextMinute.getTime() - now.getTime();
                          const remainingTotalSecs = Math.max(
                            0,
                            Math.ceil(remainingMs / 1000),
                          );
                          const remainingMins = Math.floor(
                            remainingTotalSecs / 60,
                          );
                          const remainingSecs = remainingTotalSecs % 60;
                          const remainingLabel = `${String(remainingMins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;

                          const minSecs = (minuteOffset - 1) * 60 + 1;
                          const maxSecs = minuteOffset * 60;
                          const isSelected =
                            expirationSeconds >= minSecs &&
                            expirationSeconds <= maxSecs;

                          return (
                            <button
                              key={minuteOffset}
                              onClick={() => {
                                onExpirationChange(remainingTotalSecs);
                                onCloseExpirationModal();
                              }}
                              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-all ${isSelected ? "" : "hover:bg-white/5"}`}
                              style={{
                                backgroundColor: isSelected
                                  ? "#00c087"
                                  : "transparent",
                              }}
                            >
                              <span
                                className="text-sm font-medium"
                                style={{
                                  color: isSelected ? "#ffffff" : "#eef2f7",
                                }}
                              >
                                {timeStr}
                              </span>
                              <span
                                className="flex items-center gap-1.5 text-sm"
                                style={{
                                  color: isSelected ? "#ffffff" : "#8b9ab8",
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {remainingLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      className="w-px"
                      style={{ backgroundColor: "#2a2e35" }}
                    />

                    {/* Right Column - Long Expirations (15-60 minutes) */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#8b9ab8" }}
                        >
                          Profit
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: "#00c087",
                            color: "white",
                          }}
                        >
                          84%
                        </span>
                      </div>

                      {/* Column Headers */}
                      <div className="flex items-center justify-between mb-2 px-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#4a6080" }}
                        >
                          Time
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: "#4a6080" }}
                        >
                          Remaining
                        </span>
                      </div>

                      {/* Options - Minute aligned */}
                      <div className="space-y-1">
                        {[15, 30, 45, 60, 120].map((minuteOffset, idx, arr) => {
                          const now = currentTime || new Date();
                          const targetTime = new Date(now);
                          targetTime.setSeconds(0, 0);
                          targetTime.setMinutes(
                            targetTime.getMinutes() + minuteOffset,
                          );

                          const timeStr = `${String(targetTime.getHours()).padStart(2, "0")}:${String(targetTime.getMinutes()).padStart(2, "0")}`;
                          const remainingMs =
                            targetTime.getTime() - now.getTime();
                          const remainingTotalSecs = Math.max(
                            0,
                            Math.ceil(remainingMs / 1000),
                          );
                          const remainingMins = Math.floor(
                            remainingTotalSecs / 60,
                          );
                          const remainingSecs = remainingTotalSecs % 60;
                          const remainingLabel = `${String(remainingMins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;

                          const prevOffset = idx > 0 ? arr[idx - 1] : 5;
                          const minSecs = prevOffset * 60 + 1;
                          const maxSecs = minuteOffset * 60;
                          const isSelected =
                            expirationSeconds >= minSecs &&
                            expirationSeconds <= maxSecs;

                          return (
                            <button
                              key={minuteOffset}
                              onClick={() => {
                                onExpirationChange(remainingTotalSecs);
                                onCloseExpirationModal();
                              }}
                              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg transition-all ${isSelected ? "" : "hover:bg-white/5"}`}
                              style={{
                                backgroundColor: isSelected
                                  ? "#00c087"
                                  : "transparent",
                              }}
                            >
                              <span
                                className="text-sm font-medium"
                                style={{
                                  color: isSelected ? "#ffffff" : "#eef2f7",
                                }}
                              >
                                {timeStr}
                              </span>
                              <span
                                className="flex items-center gap-1.5 text-sm"
                                style={{
                                  color: isSelected ? "#ffffff" : "#8b9ab8",
                                }}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {remainingLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profit Display */}
        <div className="py-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1.5">
            <span
              className="text-[10px] font-medium"
              style={{ color: "#8b9ab8" }}
            >
              Profit
            </span>
            <div
              className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer"
              style={{ backgroundColor: "#1a2d45", color: "#4a6080" }}
            >
              ?
            </div>
          </div>
          <div
            className="font-normal"
            style={{
              color: "#00c087",
              fontSize: "40px",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            +85%
          </div>
          <div
            className="font-normal mt-1.5"
            style={{
              color: "#00c087",
              fontSize: "20px",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            +${" "}
            {(amount * 0.85).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>

        {/* Conditional: NEW OPTION or HIGHER/LOWER buttons */}
        {lastFinishedTrade &&
        lastFinishedTrade.symbol === selectedSymbol &&
        activeTrades.filter(
          (t) => t.symbol === selectedSymbol && t.status === "active",
        ).length === 0 ? (
          <motion.button
            onClick={onNewOption}
            className="w-full flex flex-col items-center justify-center py-6 rounded-lg transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: "#ff6b00",
              boxShadow: "0 0 30px rgba(255, 107, 0, 0.4)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <Plus className="w-10 h-10 text-white mb-1" strokeWidth={2.5} />
            <span className="text-white text-sm font-bold tracking-wide">
              NEW
            </span>
            <span className="text-white text-sm font-bold tracking-wide">
              OPTION
            </span>
          </motion.button>
        ) : (
          <>
            {/* HIGHER Button */}
            <button
              onClick={() => onExecuteTrade("higher")}
              onMouseEnter={() => onHoveredButton("higher")}
              onMouseLeave={() => onHoveredButton(null)}
              disabled={isExecutingTrade}
              className="w-full flex items-center justify-center disabled:opacity-50 cursor-pointer bg-transparent border-0 p-0 select-none hover:brightness-75 transition-[filter] duration-200"
            >
              <img
                src="/traderoom/icons/higher-button.png"
                alt="Higher"
                className="w-full object-contain pointer-events-none select-none"
                style={{ maxHeight: "96px" }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>

            {/* LOWER Button */}
            <button
              onClick={() => onExecuteTrade("lower")}
              onMouseEnter={() => onHoveredButton("lower")}
              onMouseLeave={() => onHoveredButton(null)}
              disabled={isExecutingTrade}
              className="w-full flex items-center justify-center disabled:opacity-50 cursor-pointer bg-transparent border-0 p-0 select-none hover:brightness-75 transition-[filter] duration-200"
            >
              <img
                src="/traderoom/icons/lower-button.png"
                alt="Lower"
                className="w-full object-contain pointer-events-none select-none"
                style={{ maxHeight: "96px" }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
