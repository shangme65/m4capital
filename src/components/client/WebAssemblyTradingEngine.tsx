"use client";

import { useEffect, useState, useRef } from "react";

// Define the WebAssembly module interface
interface TradingEngineModule {
  ccall: (
    funcName: string,
    returnType: string,
    argTypes: string[],
    args: any[]
  ) => any;
  cwrap: (funcName: string, returnType: string, argTypes: string[]) => any;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  stringToUTF8: (str: string, ptr: number, maxLength: number) => void;
  UTF8ToString: (ptr: number) => string;
}

interface Position {
  id: number;
  symbol: string;
  size: number;
  price: number;
  type: "LONG" | "SHORT";
  pnl?: number;
}

interface PortfolioStats {
  totalValue: number;
  totalPnL: number;
  riskLevel: number;
  positionCount: number;
  balance: number;
}

export default function WebAssemblyTradingEngine() {
  const [module, setModule] = useState<TradingEngineModule | null>(null);
  const [enginePtr, setEnginePtr] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(
    null
  );
  const [currentPrice, setCurrentPrice] = useState(1.25);
  const [tradeAmount, setTradeAmount] = useState(1000);
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");

  // Function wrappers
  const createTradingEngine = useRef<any>(null);
  const deleteTradingEngine = useRef<any>(null);
  const addPosition = useRef<any>(null);
  const removePosition = useRef<any>(null);
  const updatePrice = useRef<any>(null);
  const calculatePortfolioValue = useRef<any>(null);
  const getPortfolioRisk = useRef<any>(null);
  const getTotalPnL = useRef<any>(null);
  const getPositionCount = useRef<any>(null);
  const getPositionInfo = useRef<any>(null);
  const getPortfolioStats = useRef<any>(null);

  useEffect(() => {
    // Load the WebAssembly module
    const loadModule = async () => {
      try {
        setIsLoading(true);

        // Create a script element to load the Emscripten-generated JavaScript
        const script = document.createElement("script");
        script.src = "/trading_engine.js";

        // Wait for the script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // The Module should now be available globally
        const Module = (window as any).Module;
        if (!Module) {
          throw new Error("WebAssembly module not loaded");
        }

        // Wait for the module to be ready
        await new Promise((resolve) => {
          if (Module.onRuntimeInitialized) {
            Module.onRuntimeInitialized = resolve;
          } else {
            resolve(undefined);
          }
        });

        setModule(Module);

        // Create function wrappers
        createTradingEngine.current = Module.cwrap(
          "createTradingEngine",
          "number",
          ["number"]
        );
        deleteTradingEngine.current = Module.cwrap(
          "deleteTradingEngine",
          "null",
          ["number"]
        );
        addPosition.current = Module.cwrap("addPosition", "number", [
          "number",
          "string",
          "number",
          "number",
          "string",
        ]);
        removePosition.current = Module.cwrap("removePosition", "number", [
          "number",
          "number",
        ]);
        updatePrice.current = Module.cwrap("updatePrice", "null", [
          "number",
          "number",
        ]);
        calculatePortfolioValue.current = Module.cwrap(
          "calculatePortfolioValue",
          "number",
          ["number"]
        );
        getPortfolioRisk.current = Module.cwrap("getPortfolioRisk", "number", [
          "number",
        ]);
        getTotalPnL.current = Module.cwrap("getTotalPnL", "number", ["number"]);
        getPositionCount.current = Module.cwrap("getPositionCount", "number", [
          "number",
        ]);
        getPositionInfo.current = Module.cwrap("getPositionInfo", "number", [
          "number",
          "number",
        ]);
        getPortfolioStats.current = Module.cwrap(
          "getPortfolioStats",
          "string",
          ["number"]
        );

        // Initialize trading engine with $10,000 balance
        const enginePointer = createTradingEngine.current(10000);
        setEnginePtr(enginePointer);

        console.log("WebAssembly Trading Engine loaded successfully");
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load WebAssembly module:", err);
        setError("Failed to load trading engine");
        setIsLoading(false);
      }
    };

    loadModule();

    // Cleanup function
    return () => {
      if (enginePtr && deleteTradingEngine.current) {
        deleteTradingEngine.current(enginePtr);
      }
    };
  }, []);

  useEffect(() => {
    // Update portfolio stats when engine changes
    if (enginePtr && module) {
      updatePortfolioStats();
    }
  }, [enginePtr, module, positions]);

  const updatePortfolioStats = () => {
    if (!enginePtr || !module) return;

    try {
      const totalValue = calculatePortfolioValue.current(enginePtr);
      const totalPnL = getTotalPnL.current(enginePtr);
      const riskLevel = getPortfolioRisk.current(enginePtr);
      const positionCount = getPositionCount.current(enginePtr);

      setPortfolioStats({
        totalValue,
        totalPnL,
        riskLevel,
        positionCount,
        balance: 10000, // Initial balance
      });
    } catch (err) {
      console.error("Error updating portfolio stats:", err);
    }
  };

  const handleAddPosition = (type: "LONG" | "SHORT") => {
    if (!enginePtr || !addPosition.current) return;

    try {
      const positionId = addPosition.current(
        enginePtr,
        selectedSymbol,
        tradeAmount,
        currentPrice,
        type
      );

      if (positionId >= 0) {
        const newPosition: Position = {
          id: positionId,
          symbol: selectedSymbol,
          size: tradeAmount,
          price: currentPrice,
          type: type,
        };

        setPositions((prev) => [...prev, newPosition]);
        console.log(`Added ${type} position:`, newPosition);
      }
    } catch (err) {
      console.error("Error adding position:", err);
    }
  };

  const handleRemovePosition = (positionId: number) => {
    if (!enginePtr || !removePosition.current) return;

    try {
      const success = removePosition.current(enginePtr, positionId);
      if (success) {
        setPositions((prev) => prev.filter((pos) => pos.id !== positionId));
        console.log(`Removed position ${positionId}`);
      }
    } catch (err) {
      console.error("Error removing position:", err);
    }
  };

  const handlePriceUpdate = (newPrice: number) => {
    setCurrentPrice(newPrice);
    if (enginePtr && updatePrice.current) {
      updatePrice.current(enginePtr, newPrice);
      updatePortfolioStats();
    }
  };

  const simulatePriceMovement = () => {
    // Simulate random price movement
    const change = (Math.random() - 0.5) * 0.01; // ±0.5% change
    const newPrice = currentPrice * (1 + change);
    handlePriceUpdate(Number(newPrice.toFixed(5)));
  };

  // Auto-simulate price movement every 2 seconds
  useEffect(() => {
    const interval = setInterval(simulatePriceMovement, 2000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-300">
          Loading WebAssembly Trading Engine...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <div className="text-red-400 font-semibold">Error</div>
        <div className="text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-white mb-2">
          WebAssembly Trading Engine
        </h2>
        <div className="text-sm text-gray-400">
          High-performance C++ trading engine compiled to WebAssembly
        </div>
      </div>

      {/* Portfolio Stats */}
      {portfolioStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-700 rounded p-3">
            <div className="text-xs text-gray-400">Portfolio Value</div>
            <div className="text-lg font-semibold text-white">
              ${portfolioStats.totalValue.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-xs text-gray-400">Total P&L</div>
            <div
              className={`text-lg font-semibold ${
                portfolioStats.totalPnL >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              ${portfolioStats.totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-xs text-gray-400">Risk Level</div>
            <div className="text-lg font-semibold text-orange-400">
              {portfolioStats.riskLevel.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-xs text-gray-400">Positions</div>
            <div className="text-lg font-semibold text-white">
              {portfolioStats.positionCount}
            </div>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="text-lg font-semibold text-white">
              ${portfolioStats.balance.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Current Price */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">
              Current Price ({selectedSymbol})
            </div>
            <div className="text-2xl font-bold text-white">
              {currentPrice.toFixed(5)}
            </div>
          </div>
          <button
            onClick={simulatePriceMovement}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Update Price
          </button>
        </div>
      </div>

      {/* Trading Controls */}
      <div className="bg-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white">Add Position</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Symbol</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
              title="Select trading symbol"
            >
              <option value="EURUSD">EUR/USD</option>
              <option value="GBPUSD">GBP/USD</option>
              <option value="USDJPY">USD/JPY</option>
              <option value="USDCHF">USD/CHF</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(Number(e.target.value))}
              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
              min="100"
              max="5000"
              step="100"
              title="Trade amount"
              placeholder="Enter trade amount"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleAddPosition("LONG")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              BUY
            </button>
            <button
              onClick={() => handleAddPosition("SHORT")}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
            >
              SELL
            </button>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      {positions.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Active Positions
          </h3>
          <div className="space-y-2">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex justify-between items-center bg-gray-600 rounded p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">
                      {position.symbol}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        position.type === "LONG"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {position.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Size: ${position.size} • Entry: {position.price.toFixed(5)}
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePosition(position.id)}
                  className="bg-gray-500 hover:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
