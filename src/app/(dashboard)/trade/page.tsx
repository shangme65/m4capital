"use client";

import { useEffect, useState } from "react";
import EmscriptenDemo from "@/components/client/EmscriptenDemo";
import AdvancedTradingChart from "@/components/client/AdvancedTradingChart";
import RealTimeProfitLoss from "@/components/client/RealTimeProfitLoss";
import ExpirationTimer from "@/components/client/ExpirationTimer";
import TradingAppLoader from "@/components/client/TradingAppLoader";
import LivePositions from "@/components/client/LivePositions";
import ConnectionStatus from "@/components/client/ConnectionStatus";
import WebAssemblyTradingEngine from "@/components/client/WebAssemblyTradingEngine";
import {
  TradingProvider,
  useTradingContext,
} from "@/components/client/EnhancedTradingProvider";
import MarketNews from "@/components/client/MarketNews";
import PriceTicker from "@/components/client/PriceTicker";

function TradingInterface() {
  const [amount, setAmount] = useState(10000);
  const [expiration, setExpiration] = useState("08:54");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSymbol, setSelectedSymbol] = useState("USD/CAD");
  const [expirationSeconds, setExpirationSeconds] = useState(30);
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<
    "higher" | "lower" | null
  >(null);

  const { marketData, isConnected, executeTrade, openPositions, tradeHistory } =
    useTradingContext();

  const currentMarketData = marketData[selectedSymbol];
  const currentPrice = currentMarketData?.price || 1.39735;
  const entryPrice = 1.3969; // This would be set when a trade is opened

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTrade = async (direction: "HIGHER" | "LOWER") => {
    if (isExecutingTrade || !isConnected) return;

    setIsExecutingTrade(true);
    setTradeDirection(direction.toLowerCase() as "higher" | "lower");
    try {
      const success = await executeTrade(
        selectedSymbol,
        direction,
        amount,
        expirationSeconds
      );
      if (success) {
        console.log(`Trade executed: ${direction} ${amount} ${selectedSymbol}`);
      }
    } catch (error) {
      console.error("Trade execution failed:", error);
    } finally {
      setIsExecutingTrade(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white overflow-hidden flex z-50">
      {/* Left Sidebar */}
      <div className="w-16 bg-gray-800 flex flex-col items-center py-4 space-y-6">
        {/* Logo */}
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-sm"></div>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4">
          {/* Dashboard */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
            </div>
          </div>

          {/* Close/X */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <span className="text-gray-400 text-lg">×</span>
          </div>

          {/* Settings/Gear */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-400 rounded-full relative">
              <div className="absolute inset-1 border border-gray-400 rounded-full"></div>
            </div>
          </div>

          {/* Clock/History */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-400 rounded-full relative">
              <div className="absolute top-1 left-2 w-1 h-2 bg-gray-400"></div>
            </div>
          </div>

          {/* Chat/Messages */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer relative">
            <div className="w-5 h-4 bg-gray-700 border-2 border-gray-400 rounded-sm"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">1</span>
            </div>
          </div>

          {/* Charts */}
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-gray-400"></div>
              <div className="w-1 h-3 bg-gray-400"></div>
              <div className="w-1 h-5 bg-gray-400"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex-1 flex flex-col justify-end space-y-4">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <span className="text-gray-400">👤</span>
          </div>
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer">
            <span className="text-gray-400">●●●</span>
          </div>
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        {/* Total Portfolio */}
        <div className="p-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-1">TOTAL</div>
          <div className="text-xs text-gray-400 mb-1">PORTFOLIO</div>
          <div className="text-2xl font-bold text-white">50%</div>
        </div>

        {/* Trading History */}
        <div className="p-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2">TRADING</div>
          <div className="text-xs text-gray-400 mb-2">HISTORY</div>
        </div>

        {/* Live Positions */}
        <div className="p-4 border-b border-gray-700">
          <LivePositions />
        </div>

        {/* Chats & Support */}
        <div className="p-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2">CHATS &</div>
          <div className="text-xs text-gray-400 mb-2">SUPPORT</div>
        </div>

        {/* Market Analysis */}
        <div className="p-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2">MARKET</div>
          <div className="text-xs text-gray-400 mb-4">ANALYSIS</div>
          <MarketNews />
        </div>

        {/* Promo */}
        <div className="p-4 border-b border-gray-700">
          <div className="w-10 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">NEW</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">PROMO</div>
        </div>

        {/* Partnership */}
        <div className="p-4">
          <div className="text-xs text-gray-400 mb-2">PARTNERSHIP</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Price Ticker */}
        <div className="bg-gray-900 border-b border-gray-700">
          <PriceTicker />
        </div>

        {/* Trading Tabs */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((tab) => (
              <div
                key={tab}
                className="bg-orange-500 text-white px-4 py-2 rounded-t-lg text-sm flex items-center space-x-2"
              >
                <span>USD/CAD (OTC)</span>
                <span className="text-xs">Binary</span>
                <button className="text-white/70 hover:text-white">×</button>
              </div>
            ))}
            <button className="bg-gray-700 text-gray-300 px-3 py-2 rounded-t-lg text-lg">
              +
            </button>
          </div>
        </div>

        {/* Advanced Chart Area */}
        <div className="flex-1 bg-gray-900 relative">
          <AdvancedTradingChart />
        </div>
      </div>

      {/* Right Trading Panel */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        {/* Connection Status */}
        <div className="mb-4 p-2 bg-gray-700 rounded">
          <ConnectionStatus />
        </div>

        {/* Amount Section */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-white text-lg font-semibold"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button className="text-gray-400 hover:text-white">+</button>
              <button className="text-gray-400 hover:text-white">-</button>
            </div>
          </div>
        </div>

        {/* Expiration Timer */}
        <ExpirationTimer
          expirationTime={expirationSeconds}
          onExpire={() => {
            console.log("Trade expired!");
            // Handle trade expiration logic
          }}
        />

        {/* Real-time Profit Loss Display */}
        <RealTimeProfitLoss
          entryPrice={entryPrice}
          currentPrice={currentPrice}
          direction={tradeDirection || "higher"}
          initialAmount={amount}
        />

        {/* Support Section */}
        <div className="mt-8 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm">💬</span>
            <span className="text-sm text-gray-300">SUPPORT</span>
          </div>
          <div className="text-xs text-blue-400">support@iqoption.com</div>
          <div className="text-xs text-gray-400">
            EVERY DAY, AROUND THE CLOCK
          </div>
        </div>

        {/* Trading Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={() => handleTrade("HIGHER")}
            disabled={isExecutingTrade || !isConnected}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isExecutingTrade ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>EXECUTING...</span>
              </>
            ) : (
              <>
                <span>📈</span>
                <span>HIGHER</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleTrade("LOWER")}
            disabled={isExecutingTrade || !isConnected}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isExecutingTrade ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>EXECUTING...</span>
              </>
            ) : (
              <>
                <span>📉</span>
                <span>LOWER</span>
              </>
            )}
          </button>
        </div>

        {/* Emscripten WebAssembly Demo */}
        <div className="mt-4">
          <EmscriptenDemo />
        </div>

        {/* WebAssembly Trading Engine */}
        <div className="mt-4">
          <WebAssemblyTradingEngine />
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const handleAppLoaded = () => {
    setIsAppLoaded(true);
  };

  return (
    <TradingProvider>
      {!isAppLoaded ? (
        <TradingAppLoader onComplete={handleAppLoaded} />
      ) : (
        <TradingInterface />
      )}
    </TradingProvider>
  );
}
