"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
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
  children: ReactNode;
  autoConnect?: boolean;
  enableNews?: boolean;
}

export function MarketDataProvider({
  children,
  autoConnect = true, // Re-enabled with CoinGecko
  enableNews = false,
}: MarketDataProviderProps) {
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

  const connect = () => {
    // Using CoinGecko API instead of Binance WebSocket
    console.log("🚀 Connecting to CoinGecko market data service...");
    setIsConnected(true);
    setConnectionQuality("excellent");

    // Fallback prices if API fails
    const fallbackPrices: Record<string, MarketTick> = {
      BTCUSD: { symbol: "BTCUSD", price: 67500, timestamp: Date.now(), changePercent: 2.5 },
      ETHUSD: { symbol: "ETHUSD", price: 3450, timestamp: Date.now(), changePercent: 1.8 },
      BNBUSD: { symbol: "BNBUSD", price: 580, timestamp: Date.now(), changePercent: 0.9 },
      SOLUSD: { symbol: "SOLUSD", price: 145, timestamp: Date.now(), changePercent: 3.2 },
      ADAUSD: { symbol: "ADAUSD", price: 0.65, timestamp: Date.now(), changePercent: -1.2 },
      XRPUSD: { symbol: "XRPUSD", price: 0.52, timestamp: Date.now(), changePercent: 0.5 },
      DOGEUSD: { symbol: "DOGEUSD", price: 0.12, timestamp: Date.now(), changePercent: 4.1 },
      DOTUSD: { symbol: "DOTUSD", price: 7.2, timestamp: Date.now(), changePercent: -0.8 },
      MATICUSD: { symbol: "MATICUSD", price: 0.78, timestamp: Date.now(), changePercent: 1.5 },
      LINKUSD: { symbol: "LINKUSD", price: 14.5, timestamp: Date.now(), changePercent: 2.1 },
      AVAXUSD: { symbol: "AVAXUSD", price: 35, timestamp: Date.now(), changePercent: 1.9 },
      UNIUSD: { symbol: "UNIUSD", price: 9.8, timestamp: Date.now(), changePercent: 0.3 },
      ATOMUSD: { symbol: "ATOMUSD", price: 8.5, timestamp: Date.now(), changePercent: -0.5 },
      LTCUSD: { symbol: "LTCUSD", price: 85, timestamp: Date.now(), changePercent: 1.2 },
      ETCUSD: { symbol: "ETCUSD", price: 28, timestamp: Date.now(), changePercent: 0.7 },
    };

    // Fetch initial prices from CoinGecko
    const fetchCoinGeckoPrices = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple,dogecoin,polkadot,polygon,chainlink,avalanche-2,uniswap,cosmos,litecoin,ethereum-classic&vs_currencies=usd&include_24hr_change=true",
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();

        const pricesMap: Record<string, MarketTick> = {};
        const symbolMap: Record<string, string> = {
          bitcoin: "BTCUSD",
          ethereum: "ETHUSD",
          binancecoin: "BNBUSD",
          solana: "SOLUSD",
          cardano: "ADAUSD",
          ripple: "XRPUSD",
          dogecoin: "DOGEUSD",
          polkadot: "DOTUSD",
          polygon: "MATICUSD",
          chainlink: "LINKUSD",
          "avalanche-2": "AVAXUSD",
          uniswap: "UNIUSD",
          cosmos: "ATOMUSD",
          litecoin: "LTCUSD",
          "ethereum-classic": "ETCUSD",
        };

        Object.entries(data).forEach(([coinId, priceData]: [string, any]) => {
          const symbol = symbolMap[coinId];
          if (symbol) {
            pricesMap[symbol] = {
              symbol,
              price: priceData.usd,
              timestamp: Date.now(),
              changePercent: priceData.usd_24h_change || 0,
            };
          }
        });

        setPrices(pricesMap);
        setTotalSymbols(Object.keys(pricesMap).length);
        console.log(
          `✅ Loaded ${
            Object.keys(pricesMap).length
          } crypto prices from CoinGecko`
        );
      } catch (error) {
        console.warn("⚠️ CoinGecko API unavailable, using fallback prices:", error);
        // Use fallback prices when API fails
        setPrices((prev) => Object.keys(prev).length > 0 ? prev : fallbackPrices);
        setTotalSymbols(Object.keys(fallbackPrices).length);
        setConnectionQuality("good");
      }
    };

    fetchCoinGeckoPrices();

    // Poll CoinGecko API every 30 seconds (free tier limit)
    const intervalId = setInterval(fetchCoinGeckoPrices, 30000);

    // Store interval ID for cleanup
    (window as any).__coinGeckoInterval = intervalId;
  };

  const disconnect = () => {
    // Clear CoinGecko polling interval
    if ((window as any).__coinGeckoInterval) {
      clearInterval((window as any).__coinGeckoInterval);
      (window as any).__coinGeckoInterval = null;
    }

    setIsConnected(false);
    setConnectionQuality("disconnected");
    setPrices({});
    subscriptionsRef.current.clear();
    console.log("🔌 Disconnected from CoinGecko market data");
  };

  const loadNews = async () => {
    if (marketDataService.current) {
      try {
        const newsItems = await marketDataService.current.getMarketNews();
        setNews(newsItems);
      } catch (error) {
        console.error("Failed to load news:", error);
      }
    }
  };

  const subscribe = (
    symbols: string[],
    onTick: (tick: MarketTick) => void
  ): string => {
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
        // Update global prices state using a ref check to prevent excessive updates
        setPrices((prev) => {
          // Only update if price actually changed
          if (prev[tick.symbol]?.price === tick.price) {
            return prev;
          }
          return {
            ...prev,
            [tick.symbol]: tick,
          };
        });

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
  };

  const unsubscribe = (subscriptionId: string) => {
    if (
      marketDataService.current &&
      subscriptionsRef.current.has(subscriptionId)
    ) {
      marketDataService.current.unsubscribe(subscriptionId);
      subscriptionsRef.current.delete(subscriptionId);
    }
  };

  const getPrice = (symbol: string): MarketTick | null => {
    return prices[symbol] || null;
  };

  const getHistoricalData = async (
    symbol: string,
    timeframe: string = "1D"
  ): Promise<CandlestickData[]> => {
    if (!marketDataService.current) {
      throw new Error("Market data service not connected");
    }

    return marketDataService.current.getHistoricalData(symbol, timeframe);
  };

  const refreshNews = async () => {
    await loadNews();
  };

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
}

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
