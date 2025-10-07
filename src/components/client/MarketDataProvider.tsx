"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import MarketDataService, {
  MarketTick,
  CandlestickData,
  NewsItem,
  MarketDataSubscriber,
} from "@/lib/marketData";

interface MarketDataContextType {
  // Price data
  prices: Record<string, MarketTick>;
  getPrice: (symbol: string) => MarketTick | null;

  // Subscriptions
  subscribe: (symbols: string[], onTick: (tick: MarketTick) => void) => string;
  unsubscribe: (subscriptionId: string) => void;

  // Historical data
  getHistoricalData: (
    symbol: string,
    timeframe?: string
  ) => Promise<CandlestickData[]>;

  // News
  news: NewsItem[];
  refreshNews: () => Promise<void>;

  // Connection status
  isConnected: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";

  // Market hours
  isMarketOpen: boolean;
  nextMarketOpen: Date | null;

  // Statistics
  totalSymbols: number;
  updatesPerSecond: number;
}

const MarketDataContext = createContext<MarketDataContextType | null>(null);

interface MarketDataProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  enableNews?: boolean;
}

export const MarketDataProvider: React.FC<MarketDataProviderProps> = ({
  children,
  autoConnect = true,
  enableNews = true,
}) => {
  const [prices, setPrices] = useState<Record<string, MarketTick>>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<
    "excellent" | "good" | "poor" | "disconnected"
  >("disconnected");
  const [isMarketOpen, setIsMarketOpen] = useState(true); // Simplified for demo
  const [nextMarketOpen, setNextMarketOpen] = useState<Date | null>(null);
  const [totalSymbols, setTotalSymbols] = useState(0);
  const [updatesPerSecond, setUpdatesPerSecond] = useState(0);

  const marketDataService = useRef<MarketDataService>();
  const subscriptionsRef = useRef<Map<string, string>>(new Map());
  const updateCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(Date.now());

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Monitor updates per second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdateTimeRef.current) / 1000;
      if (elapsed > 0) {
        setUpdatesPerSecond(Math.round(updateCountRef.current / elapsed));
        updateCountRef.current = 0;
        lastUpdateTimeRef.current = now;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(() => {
    if (!marketDataService.current) {
      marketDataService.current = MarketDataService.getInstance();
      setIsConnected(true);
      setConnectionQuality("excellent");

      // Load initial prices
      const initialPrices = marketDataService.current.getAllPrices();
      const pricesMap: Record<string, MarketTick> = {};
      initialPrices.forEach((tick) => {
        pricesMap[tick.symbol] = tick;
      });
      setPrices(pricesMap);
      setTotalSymbols(initialPrices.length);

      // Load news if enabled
      if (enableNews) {
        loadNews();
      }
    }
  }, [enableNews]);

  const disconnect = useCallback(() => {
    if (marketDataService.current) {
      marketDataService.current.disconnect();
      marketDataService.current = undefined;
      setIsConnected(false);
      setConnectionQuality("disconnected");
      setPrices({});
      subscriptionsRef.current.clear();
    }
  }, []);

  const loadNews = useCallback(async () => {
    if (marketDataService.current) {
      try {
        const newsItems = await marketDataService.current.getMarketNews();
        setNews(newsItems);
      } catch (error) {
        console.error("Failed to load news:", error);
      }
    }
  }, []);

  const subscribe = useCallback(
    (symbols: string[], onTick: (tick: MarketTick) => void): string => {
      if (!marketDataService.current) {
        console.warn("Market data service not connected");
        return "";
      }

      const subscriptionId = `sub_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const subscriber: MarketDataSubscriber = {
        id: subscriptionId,
        symbols,
        onTick: (tick: MarketTick) => {
          // Update global prices state
          setPrices((prev) => ({
            ...prev,
            [tick.symbol]: tick,
          }));

          // Track updates
          updateCountRef.current++;

          // Call subscriber callback
          onTick(tick);
        },
        onError: (error: Error) => {
          console.error("Market data subscription error:", error);
          setConnectionQuality("poor");
        },
      };

      marketDataService.current.subscribe(subscriber);
      subscriptionsRef.current.set(subscriptionId, subscriptionId);

      return subscriptionId;
    },
    []
  );

  const unsubscribe = useCallback((subscriptionId: string) => {
    if (
      marketDataService.current &&
      subscriptionsRef.current.has(subscriptionId)
    ) {
      marketDataService.current.unsubscribe(subscriptionId);
      subscriptionsRef.current.delete(subscriptionId);
    }
  }, []);

  const getPrice = useCallback(
    (symbol: string): MarketTick | null => {
      return prices[symbol] || null;
    },
    [prices]
  );

  const getHistoricalData = useCallback(
    async (
      symbol: string,
      timeframe: string = "1D"
    ): Promise<CandlestickData[]> => {
      if (!marketDataService.current) {
        throw new Error("Market data service not connected");
      }

      return marketDataService.current.getHistoricalData(symbol, timeframe);
    },
    []
  );

  const refreshNews = useCallback(async () => {
    await loadNews();
  }, [loadNews]);

  const contextValue: MarketDataContextType = {
    prices,
    getPrice,
    subscribe,
    unsubscribe,
    getHistoricalData,
    news,
    refreshNews,
    isConnected,
    connectionQuality,
    isMarketOpen,
    nextMarketOpen,
    totalSymbols,
    updatesPerSecond,
  };

  return (
    <MarketDataContext.Provider value={contextValue}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error("useMarketData must be used within a MarketDataProvider");
  }
  return context;
};

// Custom hooks for specific use cases
export const usePrice = (symbol: string) => {
  const { prices, subscribe, unsubscribe } = useMarketData();
  const [price, setPrice] = useState<MarketTick | null>(prices[symbol] || null);

  useEffect(() => {
    const subscriptionId = subscribe([symbol], (tick) => {
      if (tick.symbol === symbol) {
        setPrice(tick);
      }
    });

    return () => unsubscribe(subscriptionId);
  }, [symbol, subscribe, unsubscribe]);

  return price;
};

export const usePrices = (symbols: string[]) => {
  const { prices, subscribe, unsubscribe } = useMarketData();
  const [subscribedPrices, setSubscribedPrices] = useState<
    Record<string, MarketTick>
  >({});

  useEffect(() => {
    const subscriptionId = subscribe(symbols, (tick) => {
      setSubscribedPrices((prev) => ({
        ...prev,
        [tick.symbol]: tick,
      }));
    });

    return () => unsubscribe(subscriptionId);
  }, [symbols, subscribe, unsubscribe]);

  return subscribedPrices;
};

export const useMarketNews = () => {
  const { news, refreshNews } = useMarketData();
  return { news, refreshNews };
};

export const useConnectionStatus = () => {
  const { isConnected, connectionQuality, updatesPerSecond } = useMarketData();
  return { isConnected, connectionQuality, updatesPerSecond };
};

export default MarketDataProvider;
