"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

// Enhanced crypto price interface
export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  timestamp: number;
  high24h?: number;
  low24h?: number;
}

// Market tick interface for compatibility
export interface MarketTick {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  spread?: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp: number;
  high?: number;
  low?: number;
}

interface CryptoMarketContextType {
  // Crypto specific data
  cryptoPrices: Record<string, CryptoPrice>;
  getCryptoPrice: (symbol: string) => CryptoPrice | null;

  // Market tick compatibility for existing components
  marketTicks: Record<string, MarketTick>;
  getMarketTick: (symbol: string) => MarketTick | null;

  // Subscriptions and updates
  subscribeToCrypto: (
    symbols: string[],
    onUpdate: (price: CryptoPrice) => void
  ) => string;
  unsubscribeFromCrypto: (subscriptionId: string) => void;
  refreshPrices: () => Promise<void>;

  // Connection status
  isConnected: boolean;
  lastUpdate: number;
  error: string | null;

  // Market status
  supportedCryptos: string[];
}

const CryptoMarketContext = createContext<CryptoMarketContextType | null>(null);

interface CryptoMarketProviderProps {
  children: React.ReactNode;
  updateInterval?: number; // in milliseconds
  autoStart?: boolean;
}

export const CryptoMarketProvider: React.FC<CryptoMarketProviderProps> = ({
  children,
  updateInterval = 30000, // 30 seconds default
  autoStart = true,
}) => {
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, CryptoPrice>>(
    {}
  );
  const [marketTicks, setMarketTicks] = useState<Record<string, MarketTick>>(
    {}
  );
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const subscriptionsRef = useRef<
    Map<
      string,
      {
        symbols: string[];
        onUpdate: (price: CryptoPrice) => void;
      }
    >
  >(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  // Supported cryptocurrencies
  const supportedCryptos = [
    "BTC",
    "ETH",
    "ADA",
    "DOT",
    "LINK",
    "LTC",
    "BCH",
    "XLM",
    "DOGE",
    "XRP",
  ];

  // Convert crypto price to market tick for compatibility
  const convertToMarketTick = useCallback(
    (crypto: CryptoPrice): MarketTick => ({
      symbol: crypto.symbol,
      price: crypto.price,
      change: crypto.change24h,
      changePercent: crypto.changePercent24h,
      volume: crypto.volume24h,
      timestamp: crypto.timestamp,
      high: crypto.high24h,
      low: crypto.low24h,
    }),
    []
  );

  // Fetch crypto prices from our API
  const fetchCryptoPrices = useCallback(
    async (symbols?: string[]) => {
      if (isUpdatingRef.current) return;

      try {
        isUpdatingRef.current = true;
        setError(null);

        const symbolsParam = symbols?.join(",") || supportedCryptos.join(",");
        const response = await fetch(
          `/api/crypto/prices?symbols=${symbolsParam}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const newCryptoPrices: Record<string, CryptoPrice> = {};
        const newMarketTicks: Record<string, MarketTick> = {};

        data.prices.forEach((price: CryptoPrice) => {
          newCryptoPrices[price.symbol] = price;
          newMarketTicks[price.symbol] = convertToMarketTick(price);
        });

        setCryptoPrices((prev) => ({ ...prev, ...newCryptoPrices }));
        setMarketTicks((prev) => ({ ...prev, ...newMarketTicks }));
        setLastUpdate(Date.now());
        setIsConnected(true);

        // Notify subscribers
        subscriptionsRef.current.forEach((subscription) => {
          subscription.symbols.forEach((symbol) => {
            const updatedPrice = newCryptoPrices[symbol];
            if (updatedPrice) {
              subscription.onUpdate(updatedPrice);
            }
          });
        });

        console.log(
          `Updated ${data.prices.length} crypto prices (cached: ${data.cached})`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setIsConnected(false);
        console.error("Failed to fetch crypto prices:", errorMessage);
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [supportedCryptos, convertToMarketTick]
  );

  // Start automatic price updates
  const startUpdates = useCallback(() => {
    if (intervalRef.current) return;

    // Initial fetch
    fetchCryptoPrices();

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchCryptoPrices();
    }, updateInterval);

    console.log(
      `Started crypto price updates every ${updateInterval / 1000} seconds`
    );
  }, [fetchCryptoPrices, updateInterval]);

  // Stop automatic price updates
  const stopUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsConnected(false);
      console.log("Stopped crypto price updates");
    }
  }, []);

  // Subscription management
  const subscribeToCrypto = useCallback(
    (symbols: string[], onUpdate: (price: CryptoPrice) => void): string => {
      const subscriptionId = `crypto_sub_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      subscriptionsRef.current.set(subscriptionId, {
        symbols,
        onUpdate,
      });

      // If we don't have prices for these symbols, fetch them
      const missingSymbols = symbols.filter((symbol) => !cryptoPrices[symbol]);
      if (missingSymbols.length > 0) {
        fetchCryptoPrices(missingSymbols);
      }

      console.log(`Subscribed to crypto prices: ${symbols.join(", ")}`);
      return subscriptionId;
    },
    [cryptoPrices, fetchCryptoPrices]
  );

  const unsubscribeFromCrypto = useCallback((subscriptionId: string) => {
    if (subscriptionsRef.current.has(subscriptionId)) {
      subscriptionsRef.current.delete(subscriptionId);
      console.log(`Unsubscribed from crypto prices: ${subscriptionId}`);
    }
  }, []);

  // Get individual prices
  const getCryptoPrice = useCallback(
    (symbol: string): CryptoPrice | null => {
      return cryptoPrices[symbol] || null;
    },
    [cryptoPrices]
  );

  const getMarketTick = useCallback(
    (symbol: string): MarketTick | null => {
      return marketTicks[symbol] || null;
    },
    [marketTicks]
  );

  // Manual refresh
  const refreshPrices = useCallback(async () => {
    await fetchCryptoPrices();
  }, [fetchCryptoPrices]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      startUpdates();
    }

    return () => {
      stopUpdates();
    };
  }, [autoStart, startUpdates, stopUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopUpdates();
      subscriptionsRef.current.clear();
    };
  }, [stopUpdates]);

  const contextValue: CryptoMarketContextType = {
    cryptoPrices,
    getCryptoPrice,
    marketTicks,
    getMarketTick,
    subscribeToCrypto,
    unsubscribeFromCrypto,
    refreshPrices,
    isConnected,
    lastUpdate,
    error,
    supportedCryptos,
  };

  return (
    <CryptoMarketContext.Provider value={contextValue}>
      {children}
    </CryptoMarketContext.Provider>
  );
};

export const useCryptoMarket = () => {
  const context = useContext(CryptoMarketContext);
  if (!context) {
    throw new Error(
      "useCryptoMarket must be used within a CryptoMarketProvider"
    );
  }
  return context;
};

// Custom hooks for specific crypto assets
export const useBitcoinPrice = () => {
  const { getCryptoPrice, subscribeToCrypto, unsubscribeFromCrypto } =
    useCryptoMarket();
  const [btcPrice, setBtcPrice] = useState<CryptoPrice | null>(
    getCryptoPrice("BTC")
  );

  useEffect(() => {
    const subscriptionId = subscribeToCrypto(["BTC"], (price) => {
      if (price.symbol === "BTC") {
        setBtcPrice(price);
      }
    });

    return () => unsubscribeFromCrypto(subscriptionId);
  }, [subscribeToCrypto, unsubscribeFromCrypto]);

  return btcPrice;
};

export const useCryptoPrices = (symbols: string[]) => {
  const { subscribeToCrypto, unsubscribeFromCrypto } = useCryptoMarket();
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});

  useEffect(() => {
    const subscriptionId = subscribeToCrypto(symbols, (price) => {
      setPrices((prev) => ({
        ...prev,
        [price.symbol]: price,
      }));
    });

    return () => unsubscribeFromCrypto(subscriptionId);
  }, [symbols, subscribeToCrypto, unsubscribeFromCrypto]);

  return prices;
};

// Hook for market ticks (compatibility with existing components)
export const useCryptoMarketTicks = (symbols: string[]) => {
  const { marketTicks, subscribeToCrypto, unsubscribeFromCrypto } =
    useCryptoMarket();
  const [ticks, setTicks] = useState<Record<string, MarketTick>>({});

  useEffect(() => {
    const subscriptionId = subscribeToCrypto(symbols, (price) => {
      const tick: MarketTick = {
        symbol: price.symbol,
        price: price.price,
        change: price.change24h,
        changePercent: price.changePercent24h,
        volume: price.volume24h,
        timestamp: price.timestamp,
      };

      setTicks((prev) => ({
        ...prev,
        [price.symbol]: tick,
      }));
    });

    return () => unsubscribeFromCrypto(subscriptionId);
  }, [symbols, subscribeToCrypto, unsubscribeFromCrypto, marketTicks]);

  return ticks;
};

export default CryptoMarketProvider;
