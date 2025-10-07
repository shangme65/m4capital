"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useMarketData,
  usePrice,
  MarketDataProvider,
} from "./MarketDataProvider";
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

export const TradingProvider: React.FC<TradingProviderProps> = ({
  children,
}) => {
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [candlestickData, setCandlestickData] = useState<
    Record<string, CandlestickData[]>
  >({});
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedSymbols, setSubscribedSymbols] = useState<Set<string>>(
    new Set()
  );
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  // Initialize default symbols
  useEffect(() => {
    const defaultSymbols = [
      "USD/CAD",
      "EUR/USD",
      "GBP/USD",
      "USD/JPY",
      "BTC/USD",
      "ETH/USD",
    ];

    // Initialize market data
    const initialMarketData: Record<string, MarketData> = {};
    const initialCandlestickData: Record<string, CandlestickData[]> = {};

    defaultSymbols.forEach((symbol) => {
      const basePrice = Math.random() * 100 + 1;
      initialMarketData[symbol] = {
        symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * 2,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000,
        high24h: basePrice * 1.05,
        low24h: basePrice * 0.95,
        bid: basePrice - 0.001,
        ask: basePrice + 0.001,
        lastUpdate: new Date(),
      };

      // Initialize candlestick data (last 100 candles)
      const candles: CandlestickData[] = [];
      let currentPrice = basePrice;
      const now = Date.now();

      for (let i = 99; i >= 0; i--) {
        const timestamp = now - i * 60000; // 1 minute intervals
        const open = currentPrice;
        const changeRange = currentPrice * 0.002; // 0.2% max change per candle
        const change = (Math.random() - 0.5) * changeRange;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * changeRange * 0.5;
        const low = Math.min(open, close) - Math.random() * changeRange * 0.5;
        const volume = Math.random() * 1000;

        candles.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
        });

        currentPrice = close;
      }

      initialCandlestickData[symbol] = candles;
    });

    setMarketData(initialMarketData);
    setCandlestickData(initialCandlestickData);
    setIsConnected(true);
  }, []);

  // Simulate real-time market updates
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setMarketData((prevData) => {
        const newData = { ...prevData };

        Object.keys(newData).forEach((symbol) => {
          if (
            subscribedSymbols.has(symbol) ||
            Object.keys(prevData).includes(symbol)
          ) {
            const current = newData[symbol];
            const changeRange = current.price * 0.001; // 0.1% max change
            const priceChange = (Math.random() - 0.5) * changeRange;
            const newPrice = Math.max(0.01, current.price + priceChange);

            newData[symbol] = {
              ...current,
              price: newPrice,
              change: newPrice - current.price,
              changePercent: ((newPrice - current.price) / current.price) * 100,
              bid: newPrice - 0.001,
              ask: newPrice + 0.001,
              lastUpdate: new Date(),
            };
          }
        });

        return newData;
      });

      // Update candlestick data
      setCandlestickData((prevData) => {
        const newData = { ...prevData };

        Object.keys(newData).forEach((symbol) => {
          const currentPrice = marketData[symbol]?.price;
          if (!currentPrice) return;

          const candles = [...newData[symbol]];
          const lastCandle = candles[candles.length - 1];
          const now = Date.now();

          // Check if we need a new candle (every minute)
          if (now - lastCandle.timestamp >= 60000) {
            const changeRange = currentPrice * 0.002;
            const change = (Math.random() - 0.5) * changeRange;
            const newClose = currentPrice + change;
            const newHigh =
              Math.max(currentPrice, newClose) +
              Math.random() * changeRange * 0.5;
            const newLow =
              Math.min(currentPrice, newClose) -
              Math.random() * changeRange * 0.5;

            candles.push({
              timestamp: now,
              open: currentPrice,
              high: newHigh,
              low: newLow,
              close: newClose,
              volume: Math.random() * 1000,
            });

            // Keep only last 100 candles
            if (candles.length > 100) {
              candles.shift();
            }

            newData[symbol] = candles;
          } else {
            // Update current candle
            const changeRange = currentPrice * 0.002;
            const change = (Math.random() - 0.5) * changeRange;
            const newClose = currentPrice + change;

            candles[candles.length - 1] = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newClose),
              low: Math.min(lastCandle.low, newClose),
              close: newClose,
              volume: lastCandle.volume + Math.random() * 10,
            };

            newData[symbol] = candles;
          }
        });

        return newData;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isConnected, subscribedSymbols, marketData]);

  const subscribeToSymbol = (symbol: string) => {
    setSubscribedSymbols((prev) => new Set([...prev, symbol]));
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
      const currentPrice = marketData[symbol]?.price;
      if (!currentPrice) return false;

      const trade = {
        id: Date.now().toString(),
        symbol,
        direction,
        amount,
        entryPrice: currentPrice,
        expiration,
        timestamp: Date.now(),
        status: "OPEN",
      };

      setOpenPositions((prev) => [...prev, trade]);

      // Simulate trade execution delay
      setTimeout(() => {
        setOpenPositions((prev) => prev.filter((t) => t.id !== trade.id));

        // Simulate random win/loss for demo
        const isWin = Math.random() > 0.5;
        const result = {
          ...trade,
          status: isWin ? "WIN" : "LOSS",
          exitPrice: marketData[symbol]?.price || currentPrice,
          profit: isWin ? amount * 0.85 : -amount, // 85% payout
          closeTime: Date.now(),
        };

        setTradeHistory((prev) => [result, ...prev].slice(0, 50)); // Keep last 50 trades
      }, expiration * 1000);

      return true;
    } catch (error) {
      console.error("Trade execution failed:", error);
      return false;
    }
  };

  return (
    <TradingContext.Provider
      value={{
        marketData,
        candlestickData,
        isConnected,
        subscribeToSymbol,
        unsubscribeFromSymbol,
        executeTrade,
        openPositions,
        tradeHistory,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};
