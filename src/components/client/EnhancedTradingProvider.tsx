"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useMarketData, MarketDataProvider } from "./MarketDataProvider";
import { MarketTick } from "@/lib/marketData";

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  bid: number;
  ask: number;
  lastUpdate: Date;
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  id: string;
  symbol: string;
  direction: "HIGHER" | "LOWER";
  amount: number;
  entryPrice: number;
  currentPrice?: number;
  entryTime: Date;
  expirationTime: Date;
  status: "OPEN" | "WIN" | "LOSS" | "EXPIRED";
  pnl?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  direction: "HIGHER" | "LOWER";
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  entryTime: Date;
  exitTime?: Date;
  status: "WIN" | "LOSS";
  profit: number;
}

export interface TradingContextType {
  marketData: Record<string, MarketData>;
  candlestickData: Record<string, CandlestickData[]>;
  isConnected: boolean;
  subscribeToSymbol: (symbol: string) => void;
  unsubscribeFromSymbol: (symbol: string) => void;
  executeTrade: (
    symbol: string,
    direction: "HIGHER" | "LOWER",
    amount: number,
    expiration: number
  ) => Promise<boolean>;
  openPositions: Position[];
  tradeHistory: Trade[];
}

const TradingContext = createContext<TradingContextType | null>(null);

// Helper function to record trade to server
async function recordTradeToServer(tradeData: {
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  commission?: number;
  leverage?: number;
  closedAt?: string;
}) {
  const response = await fetch("/api/trades/record", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tradeData),
  });

  if (!response.ok) {
    throw new Error(`Failed to record trade: ${response.statusText}`);
  }

  return response.json();
}

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error("useTradingContext must be used within a TradingProvider");
  }
  return context;
};

interface TradingProviderProps {
  children: ReactNode;
}

// Internal TradingProvider that uses market data
const InternalTradingProvider: React.FC<TradingProviderProps> = ({
  children,
}) => {
  const marketDataContext = useMarketData();
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<Set<string>>(
    new Set()
  );
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [candlestickData, setCandlestickData] = useState<
    Record<string, CandlestickData[]>
  >({});

  // Initialize with default symbols
  useEffect(() => {
    const defaultSymbols = [
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "USDCAD",
      "BTCUSD",
      "ETHUSD",
    ];
    defaultSymbols.forEach((symbol) => subscribeToSymbol(symbol));
  }, []);

  // Convert MarketTick to MarketData format
  const convertTickToMarketData = (tick: MarketTick): MarketData => ({
    symbol: tick.symbol,
    price: tick.price,
    change: tick.change || 0,
    changePercent: tick.changePercent || 0,
    volume: tick.volume || 0,
    high24h: tick.high || tick.price,
    low24h: tick.low || tick.price,
    bid: tick.bid || tick.price,
    ask: tick.ask || tick.price,
    lastUpdate: new Date(tick.timestamp),
  });

  // Subscribe to market data updates
  useEffect(() => {
    if (subscribedSymbols.size > 0) {
      const subscriptionId = marketDataContext.subscribe(
        Array.from(subscribedSymbols),
        (tick: MarketTick) => {
          const marketDataUpdate = convertTickToMarketData(tick);
          setMarketData((prev) => ({
            ...prev,
            [tick.symbol]: marketDataUpdate,
          }));

          // Update open positions with current prices
          setOpenPositions((prev) =>
            prev.map((position) => ({
              ...position,
              currentPrice:
                tick.symbol === position.symbol
                  ? tick.price
                  : position.currentPrice,
              pnl:
                tick.symbol === position.symbol
                  ? calculatePnL(position, tick.price)
                  : position.pnl,
            }))
          );
        }
      );

      return () => marketDataContext.unsubscribe(subscriptionId);
    }
  }, [subscribedSymbols, marketDataContext]);

  // Load historical data for subscribed symbols
  useEffect(() => {
    subscribedSymbols.forEach(async (symbol) => {
      try {
        const historicalData = await marketDataContext.getHistoricalData(
          symbol,
          "1m"
        );
        setCandlestickData((prev) => ({
          ...prev,
          [symbol]: historicalData,
        }));
      } catch (error) {
        console.error(`Failed to load historical data for ${symbol}:`, error);
      }
    });
  }, [subscribedSymbols, marketDataContext]);

  const calculatePnL = (position: Position, currentPrice: number): number => {
    const priceDiff = currentPrice - position.entryPrice;
    const direction = position.direction === "HIGHER" ? 1 : -1;
    return direction * priceDiff * (position.amount / position.entryPrice);
  };

  const subscribeToSymbol = (symbol: string) => {
    setSubscribedSymbols((prev) => new Set(prev).add(symbol));
  };

  const unsubscribeFromSymbol = (symbol: string) => {
    setSubscribedSymbols((prev) => {
      const newSet = new Set(prev);
      newSet.delete(symbol);
      return newSet;
    });
  };

  const executeTrade = async (
    symbol: string,
    direction: "HIGHER" | "LOWER",
    amount: number,
    expiration: number
  ): Promise<boolean> => {
    try {
      const currentPrice = marketDataContext.getPrice(symbol);
      if (!currentPrice) {
        console.error(`No price data available for ${symbol}`);
        return false;
      }

      const newPosition: Position = {
        id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        direction,
        amount,
        entryPrice: currentPrice.price,
        currentPrice: currentPrice.price,
        entryTime: new Date(),
        expirationTime: new Date(Date.now() + expiration * 1000),
        status: "OPEN",
        pnl: 0,
      };

      setOpenPositions((prev) => [...prev, newPosition]);

      // Automatically close position after expiration
      setTimeout(() => {
        closePosition(newPosition.id);
      }, expiration * 1000);

      return true;
    } catch (error) {
      console.error("Trade execution failed:", error);
      return false;
    }
  };

  const closePosition = (positionId: string) => {
    setOpenPositions((prev) => {
      const position = prev.find((p) => p.id === positionId);
      if (!position) return prev;

      const currentPrice = marketDataContext.getPrice(position.symbol);
      if (!currentPrice) return prev;

      const exitPrice = currentPrice.price;
      const priceDiff = exitPrice - position.entryPrice;
      const isWin =
        position.direction === "HIGHER" ? priceDiff > 0 : priceDiff < 0;
      const profit = isWin ? position.amount * 0.8 : -position.amount; // 80% payout for wins

      const trade: Trade = {
        id: `trade_${Date.now()}`,
        symbol: position.symbol,
        direction: position.direction,
        amount: position.amount,
        entryPrice: position.entryPrice,
        exitPrice,
        entryTime: position.entryTime,
        exitTime: new Date(),
        status: isWin ? "WIN" : "LOSS",
        profit,
      };

      setTradeHistory((prev) => [trade, ...prev]);

      // Record trade to server for persistence and portfolio balance update
      recordTradeToServer({
        symbol: position.symbol,
        side: position.direction === "HIGHER" ? "BUY" : "SELL",
        entryPrice: position.entryPrice,
        exitPrice,
        quantity: position.amount,
        commission: 0,
        leverage: 1,
        closedAt: new Date().toISOString(),
      }).catch((error) => {
        console.error("Failed to record trade to server:", error);
        // Trade still recorded locally; server sync failed
      });

      return prev.filter((p) => p.id !== positionId);
    });
  };

  const contextValue: TradingContextType = {
    marketData,
    candlestickData,
    isConnected: marketDataContext.isConnected,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    executeTrade,
    openPositions,
    tradeHistory,
  };

  return (
    <TradingContext.Provider value={contextValue}>
      {children}
    </TradingContext.Provider>
  );
};

// Main TradingProvider that wraps with MarketDataProvider
export const TradingProvider: React.FC<TradingProviderProps> = ({
  children,
}) => {
  return (
    <MarketDataProvider autoConnect={true} enableNews={true}>
      <InternalTradingProvider>{children}</InternalTradingProvider>
    </MarketDataProvider>
  );
};
