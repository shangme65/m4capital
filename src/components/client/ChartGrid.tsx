"use client";

import { useState } from "react";
import RealTimeTradingChart from "./RealTimeTradingChart";

interface ChartGridProps {
  gridType: number;
  defaultSymbol: string;
  availableSymbols?: string[];
}

export default function ChartGrid({
  gridType,
  defaultSymbol,
  availableSymbols = [
    "BTC",
    "ETH",
    "XRP",
    "TRX",
    "TON",
    "LTC",
    "BCH",
    "ETC",
    "USDC",
    "USDT",
  ],
}: ChartGridProps) {
  // Initialize chart symbols based on grid type
  const getInitialSymbols = () => {
    switch (gridType) {
      case 1:
        return [defaultSymbol];
      case 2:
        return [defaultSymbol, availableSymbols[1] || "ETH"];
      case 22: // 2x2 grid
        return [
          defaultSymbol,
          availableSymbols[1] || "ETH",
          availableSymbols[2] || "XRP",
          availableSymbols[3] || "TRX",
        ];
      case 3:
        return [
          defaultSymbol,
          availableSymbols[1] || "ETH",
          availableSymbols[2] || "XRP",
        ];
      case 4:
        return [
          defaultSymbol,
          availableSymbols[1] || "ETH",
          availableSymbols[2] || "XRP",
          availableSymbols[3] || "TRX",
        ];
      case 6:
        return [
          defaultSymbol,
          availableSymbols[1] || "ETH",
          availableSymbols[2] || "XRP",
          availableSymbols[3] || "TRX",
          availableSymbols[4] || "TON",
          availableSymbols[5] || "LTC",
        ];
      default:
        return [defaultSymbol];
    }
  };

  const [chartSymbols, setChartSymbols] = useState<string[]>(
    getInitialSymbols()
  );

  // Update chart symbol for a specific index
  const updateChartSymbol = (index: number, symbol: string) => {
    const newSymbols = [...chartSymbols];
    newSymbols[index] = symbol;
    setChartSymbols(newSymbols);
  };

  // Render grid based on type
  const renderGrid = () => {
    switch (gridType) {
      case 1:
        // Single chart
        return (
          <div className="w-full h-full">
            <RealTimeTradingChart symbol={chartSymbols[0]} />
          </div>
        );

      case 2:
        // 2 horizontal charts
        return (
          <div className="w-full h-full flex gap-2">
            <div className="flex-1 relative">
              <ChartWithSelector
                symbol={chartSymbols[0]}
                index={0}
                updateSymbol={updateChartSymbol}
                availableSymbols={availableSymbols}
              />
            </div>
            <div className="flex-1 relative">
              <ChartWithSelector
                symbol={chartSymbols[1]}
                index={1}
                updateSymbol={updateChartSymbol}
                availableSymbols={availableSymbols}
              />
            </div>
          </div>
        );

      case 22:
        // 2x2 grid
        return (
          <div className="w-full h-full grid grid-cols-2 gap-2">
            {chartSymbols.slice(0, 4).map((symbol, index) => (
              <div key={index} className="relative">
                <ChartWithSelector
                  symbol={symbol}
                  index={index}
                  updateSymbol={updateChartSymbol}
                  availableSymbols={availableSymbols}
                />
              </div>
            ))}
          </div>
        );

      case 3:
        // 3 charts (1 on top, 2 on bottom)
        return (
          <div className="w-full h-full flex flex-col gap-2">
            <div className="flex-1 relative">
              <ChartWithSelector
                symbol={chartSymbols[0]}
                index={0}
                updateSymbol={updateChartSymbol}
                availableSymbols={availableSymbols}
              />
            </div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <ChartWithSelector
                  symbol={chartSymbols[1]}
                  index={1}
                  updateSymbol={updateChartSymbol}
                  availableSymbols={availableSymbols}
                />
              </div>
              <div className="flex-1 relative">
                <ChartWithSelector
                  symbol={chartSymbols[2]}
                  index={2}
                  updateSymbol={updateChartSymbol}
                  availableSymbols={availableSymbols}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        // 2x2 grid (alias for 22)
        return (
          <div className="w-full h-full grid grid-cols-2 gap-2">
            {chartSymbols.slice(0, 4).map((symbol, index) => (
              <div key={index} className="relative">
                <ChartWithSelector
                  symbol={symbol}
                  index={index}
                  updateSymbol={updateChartSymbol}
                  availableSymbols={availableSymbols}
                />
              </div>
            ))}
          </div>
        );

      case 6:
        // 3x2 grid
        return (
          <div className="w-full h-full grid grid-cols-3 gap-2">
            {chartSymbols.slice(0, 6).map((symbol, index) => (
              <div key={index} className="relative">
                <ChartWithSelector
                  symbol={symbol}
                  index={index}
                  updateSymbol={updateChartSymbol}
                  availableSymbols={availableSymbols}
                />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="w-full h-full">
            <RealTimeTradingChart symbol={chartSymbols[0]} />
          </div>
        );
    }
  };

  return <div className="w-full h-full">{renderGrid()}</div>;
}

// Chart with symbol selector dropdown
function ChartWithSelector({
  symbol,
  index,
  updateSymbol,
  availableSymbols,
}: {
  symbol: string;
  index: number;
  updateSymbol: (index: number, symbol: string) => void;
  availableSymbols: string[];
}) {
  const [showSymbolSelector, setShowSymbolSelector] = useState(false);

  return (
    <div className="w-full h-full relative group">
      <RealTimeTradingChart symbol={symbol} />

      {/* Symbol selector - shows on hover */}
      <div className="absolute top-2 left-2 z-10">
        <button
          onClick={() => setShowSymbolSelector(!showSymbolSelector)}
          className="px-2 py-1 bg-[#1b1817]/80 backdrop-blur-sm border border-[#38312e] rounded text-xs text-white hover:bg-[#2a2522] transition-colors opacity-70 group-hover:opacity-100"
        >
          {symbol} ▼
        </button>

        {showSymbolSelector && (
          <div className="absolute top-8 left-0 bg-[#1b1817] border border-[#38312e] rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[120px]">
            {availableSymbols.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  updateSymbol(index, sym);
                  setShowSymbolSelector(false);
                }}
                className={`block w-full text-left px-3 py-2 text-xs hover:bg-[#2a2522] transition-colors ${
                  sym === symbol
                    ? "text-orange-500 font-semibold"
                    : "text-[#9e9aa7]"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
