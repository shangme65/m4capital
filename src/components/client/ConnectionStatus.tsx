"use client";

import { useTradingContext } from "./EnhancedTradingProvider";

export default function ConnectionStatus() {
  const { isConnected, marketData } = useTradingContext();

  const symbolCount = Object.keys(marketData).length;
  const lastUpdate = Object.values(marketData)[0]?.lastUpdate;
  const timeSinceUpdate = lastUpdate ? Date.now() - lastUpdate.getTime() : 0;

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected && timeSinceUpdate < 5000
            ? "bg-green-400 animate-pulse"
            : "bg-red-400"
        }`}
      ></div>
      <span className={`${isConnected ? "text-green-400" : "text-red-400"}`}>
        {isConnected ? `LIVE • ${symbolCount} markets` : "DISCONNECTED"}
      </span>
      {isConnected && (
        <span className="text-gray-500">
          • {Math.floor(timeSinceUpdate / 1000)}s ago
        </span>
      )}
    </div>
  );
}
