"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

// Binance WebSocket ticker data structure
interface BinanceTickerData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol (e.g., "BTCUSDT")
  c: string; // Current price
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // Previous close price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  o: string; // Open price
  O: number; // Statistics open time
  C: number; // Statistics close time
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
}

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
  autoStart?: boolean;
}

export const CryptoMarketProvider: React.FC<CryptoMarketProviderProps> = ({
  children,
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Crypto symbol mapping (our format -> Binance format)
  const cryptoSymbolMap: Record<string, string> = {
    BTC: "btcusdt",
    ETH: "ethusdt",
    BNB: "bnbusdt",
    SOL: "solusdt",
    ADA: "adausdt",
    XRP: "xrpusdt",
    DOGE: "dogeusdt",
    DOT: "dotusdt",
    MATIC: "maticusdt",
    LINK: "linkusdt",
    AVAX: "avaxusdt",
    UNI: "uniusdt",
    ATOM: "atomusdt",
    LTC: "ltcusdt",
    ETC: "etcusdt",
  };

  // Supported cryptocurrencies
  const supportedCryptos = Object.keys(cryptoSymbolMap);

  // Crypto name mapping
  const cryptoNames: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "Binance Coin",
    SOL: "Solana",
    ADA: "Cardano",
    XRP: "Ripple",
    DOGE: "Dogecoin",
    DOT: "Polkadot",
    MATIC: "Polygon",
    LINK: "Chainlink",
    AVAX: "Avalanche",
    UNI: "Uniswap",
    ATOM: "Cosmos",
    LTC: "Litecoin",
    ETC: "Ethereum Classic",
  };

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

  // Handle Binance ticker update
  const handleBinanceTicker = useCallback(
    (data: BinanceTickerData) => {
      // Convert Binance symbol (BTCUSDT) to our format (BTC)
      const binanceSymbol = data.s.toLowerCase();
      const ourSymbol = Object.keys(cryptoSymbolMap).find(
        (key) => cryptoSymbolMap[key] === binanceSymbol
      );

      if (!ourSymbol) return;

      const price = parseFloat(data.c);
      const change24h = parseFloat(data.p);
      const changePercent24h = parseFloat(data.P);
      const high24h = parseFloat(data.h);
      const low24h = parseFloat(data.l);
      const volume24h = parseFloat(data.v);

      const cryptoPrice: CryptoPrice = {
        symbol: ourSymbol,
        name: cryptoNames[ourSymbol] || ourSymbol,
        price,
        change24h,
        changePercent24h,
        volume24h,
        timestamp: data.E,
        high24h,
        low24h,
      };

      const marketTick = convertToMarketTick(cryptoPrice);

      setCryptoPrices((prev) => ({
        ...prev,
        [ourSymbol]: cryptoPrice,
      }));

      setMarketTicks((prev) => ({
        ...prev,
        [ourSymbol]: marketTick,
      }));

      setLastUpdate(data.E);

      // Notify subscribers
      subscriptionsRef.current.forEach((subscription) => {
        if (subscription.symbols.includes(ourSymbol)) {
          subscription.onUpdate(cryptoPrice);
        }
      });
    },
    [convertToMarketTick, cryptoSymbolMap, cryptoNames]
  );

  // REST API fallback for crypto prices
  const fetchCryptoPricesREST = useCallback(async () => {
    try {
      console.log("🔄 Fetching crypto prices via REST API fallback...");
      const symbols = Object.keys(cryptoSymbolMap).join(",");
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=["${Object.values(
          cryptoSymbolMap
        )
          .map((s) => s.toUpperCase())
          .join('","')}"]`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const now = Date.now();

      // Process each ticker
      data.forEach((ticker: any) => {
        const binanceSymbol = ticker.symbol.toLowerCase();
        const ourSymbol = Object.entries(cryptoSymbolMap).find(
          ([_, value]) => value === binanceSymbol
        )?.[0];

        if (ourSymbol) {
          const price = parseFloat(ticker.lastPrice);
          const priceChange = parseFloat(ticker.priceChange);

          const cryptoPrice: CryptoPrice = {
            symbol: ourSymbol,
            name: cryptoNames[ourSymbol] || ourSymbol,
            price: price,
            change24h: priceChange,
            changePercent24h: parseFloat(ticker.priceChangePercent),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            volume24h: parseFloat(ticker.volume),
            timestamp: now,
          };

          setCryptoPrices((prev) => ({
            ...prev,
            [ourSymbol]: cryptoPrice,
          }));

          // Also update market ticks
          const marketTick = convertToMarketTick(cryptoPrice);
          setMarketTicks((prev) => ({
            ...prev,
            [ourSymbol]: marketTick,
          }));
        }
      });

      setLastUpdate(now);
      console.log("✅ Crypto prices fetched via REST API");
      setError(null);
    } catch (error) {
      console.error("❌ REST API fallback failed:", error);
      setError("Failed to fetch crypto prices");
    }
  }, [cryptoSymbolMap, cryptoNames, convertToMarketTick]);

  // Connect to Binance WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Create combined stream for all crypto pairs
      const streams = Object.values(cryptoSymbolMap)
        .map((symbol) => `${symbol}@ticker`)
        .join("/");

      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

      console.log("🚀 Connecting to Binance WebSocket...");
      console.log("📡 WebSocket URL:", wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ Binance WebSocket connected - Real-time crypto data");
        setIsConnected(true);
        setError(null);
        wsRef.current = ws;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.data) {
            handleBinanceTicker(message.data);
          }
        } catch (error) {
          console.error("❌ Error parsing Binance message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Binance WebSocket error:", error);
        console.error("❌ Error type:", error.type);
        console.error("❌ WebSocket state:", ws.readyState);
        setError("WebSocket connection error - using REST API");
        setIsConnected(false);

        // Fallback to REST API immediately
        fetchCryptoPricesREST();
      };

      ws.onclose = (event) => {
        console.log("🔌 Binance WebSocket closed:");
        console.log("  - Code:", event.code);
        console.log("  - Reason:", event.reason || "No reason provided");
        console.log("  - Clean:", event.wasClean);
        setIsConnected(false);
        wsRef.current = null;

        // If WebSocket failed, use REST API fallback
        if (!event.wasClean) {
          console.log("⚠️ Unclean close - using REST API fallback");
          fetchCryptoPricesREST();

          // Set up polling every 10 seconds
          reconnectTimeoutRef.current = setInterval(() => {
            fetchCryptoPricesREST();
          }, 10000);
        } else {
          // Attempt to reconnect after 5 seconds for clean closes
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };
    } catch (error) {
      console.error("❌ Failed to create Binance WebSocket:", error);
      setError("Failed to connect to WebSocket - using REST API");
      setIsConnected(false);

      // Fallback to REST API
      fetchCryptoPricesREST();

      // Set up polling every 10 seconds
      reconnectTimeoutRef.current = setInterval(() => {
        fetchCryptoPricesREST();
      }, 10000);
    }
  }, [handleBinanceTicker, cryptoSymbolMap, fetchCryptoPricesREST]);

  // Fetch crypto prices (fallback REST API method)
  const fetchCryptoPrices = useCallback(
    async (symbols?: string[]) => {
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
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setIsConnected(false);

        // Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch crypto prices:", errorMessage);
        }
      }
    },
    [supportedCryptos, convertToMarketTick]
  );

  // Initialize WebSocket connection on mount
  useEffect(() => {
    if (autoStart) {
      // Immediately fetch prices via REST API for instant display
      fetchCryptoPricesREST();

      // Then attempt WebSocket connection for real-time updates
      connectWebSocket();
    }

    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [autoStart, connectWebSocket]);

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
    },
    [cryptoPrices, fetchCryptoPrices]
  );

  const unsubscribeFromCrypto = useCallback((subscriptionId: string) => {
    subscriptionsRef.current.delete(subscriptionId);

    // Only log in development
    if (process.env.NODE_ENV === "development") {
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

  // Manual refresh (uses REST API as fallback)
  const refreshPrices = useCallback(async () => {
    await fetchCryptoPrices();
  }, [fetchCryptoPrices]);

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
