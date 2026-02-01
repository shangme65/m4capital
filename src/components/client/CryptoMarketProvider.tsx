"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
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
  children: ReactNode;
  autoStart?: boolean;
}

export function CryptoMarketProvider({
  children,
  autoStart = true,
}: CryptoMarketProviderProps) {
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
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Crypto symbol mapping (our format -> CoinMarketCap format)
  const cryptoSymbolMap: Record<string, string> = {
    BTC: "btcusdt",
    ETH: "ethusdt",
    XRP: "xrpusdt",
    TRX: "trxusdt",
    TON: "tonusdt",
    LTC: "ltcusdt",
    BCH: "bchusdt",
    ETC: "etcusdt",
    USDC: "usdcusdt",
    USDT: "usdtusdt",
  };

  // Supported cryptocurrencies
  const supportedCryptos = Object.keys(cryptoSymbolMap);

  // Crypto name mapping
  const cryptoNames: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    XRP: "Ripple",
    TRX: "Tron",
    TON: "Toncoin",
    LTC: "Litecoin",
    BCH: "Bitcoin Cash",
    ETC: "Ethereum Classic",
    USDC: "USD Coin",
    USDT: "Tether",
  };

  // Convert crypto price to market tick for compatibility
  const convertToMarketTick = (crypto: CryptoPrice): MarketTick => ({
    symbol: crypto.symbol,
    price: crypto.price,
    change: crypto.change24h,
    changePercent: crypto.changePercent24h,
    volume: crypto.volume24h,
    timestamp: crypto.timestamp,
    high: crypto.high24h,
    low: crypto.low24h,
  });

  // REST API for crypto prices (using our internal API with CoinMarketCap)
  const fetchCryptoPricesREST = async () => {
    try {
      console.log("🔄 Fetching crypto prices via CoinMarketCap API...");

      // Use our internal API endpoint which calls CoinMarketCap server-side
      const symbols = Object.keys(cryptoSymbolMap).join(",");
      const response = await fetch(`/api/crypto/prices?symbols=${symbols}`);

      if (!response.ok) {
        console.warn(`⚠️ Crypto prices API returned ${response.status}, using cached/fallback data`);
        return; // Silently fail and keep existing prices
      }

      const data = await response.json();

      if (data.error) {
        console.warn("⚠️ Crypto prices API error:", data.error);
        return; // Silently fail and keep existing prices
      }

      const now = Date.now();
      let processedCount = 0;

      // Process each price from our API
      data.prices.forEach((cryptoPrice: CryptoPrice) => {
        setCryptoPrices((prev) => ({
          ...prev,
          [cryptoPrice.symbol]: cryptoPrice,
        }));

        // Also update market ticks
        const marketTick = convertToMarketTick(cryptoPrice);
        setMarketTicks((prev) => ({
          ...prev,
          [cryptoPrice.symbol]: marketTick,
        }));

        // Notify subscribers
        subscriptionsRef.current.forEach((subscription) => {
          if (subscription.symbols.includes(cryptoPrice.symbol)) {
            subscription.onUpdate(cryptoPrice);
          }
        });

        processedCount++;
      });

      setLastUpdate(now);
      setIsConnected(true);
      console.log(
        `✅ Crypto prices fetched via API (${processedCount} symbols, cached: ${data.cached})`
      );
      setError(null);
    } catch (error) {
      console.error("❌ API request failed:", error);
      setError("Failed to fetch crypto prices");
      setIsConnected(false);
    }
  };

  // Fetch crypto prices (REST API method)
  const fetchCryptoPrices = async (symbols?: string[]) => {
    try {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

      // Notify subscribers
      subscriptionsRef.current.forEach((subscription) => {
        subscription.symbols.forEach((symbol) => {
          const updatedPrice = newCryptoPrices[symbol];
          if (updatedPrice) {
            subscription.onUpdate(updatedPrice);
          }
        });
      });

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Updated ${data.prices.length} crypto prices (cached: ${data.cached})`
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsConnected(false);

      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch crypto prices:", errorMessage);
      }
    }
  };

  // Initialize crypto price fetching on mount
  useEffect(() => {
    if (autoStart) {
      // Fetch prices immediately via REST API
      fetchCryptoPricesREST();

      // Polling disabled to prevent continuous re-renders
      // Prices will be fetched once on mount
      pollIntervalRef.current = null;

      return () => {
        // Cleanup on unmount
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Subscription management
  const subscribeToCrypto = (
    symbols: string[],
    onUpdate: (price: CryptoPrice) => void
  ): string => {
    const subscriptionId = `crypto_sub_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    subscriptionsRef.current.set(subscriptionId, {
      symbols,
      onUpdate,
    });

    // Send current prices if available
    symbols.forEach((symbol) => {
      const currentPrice = cryptoPrices[symbol];
      if (currentPrice) {
        onUpdate(currentPrice);
      }
    });

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Subscribed to crypto prices: ${symbols.join(", ")}`);
    }
    return subscriptionId;
  };

  const unsubscribeFromCrypto = (subscriptionId: string) => {
    subscriptionsRef.current.delete(subscriptionId);

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`Unsubscribed from crypto prices: ${subscriptionId}`);
    }
  };

  // Get individual prices
  const getCryptoPrice = (symbol: string): CryptoPrice | null => {
    return cryptoPrices[symbol] || null;
  };

  const getMarketTick = (symbol: string): MarketTick | null => {
    return marketTicks[symbol] || null;
  };

  // Manual refresh (uses REST API as fallback)
  const refreshPrices = async () => {
    await fetchCryptoPrices();
  };

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
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

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
