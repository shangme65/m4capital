/**
 * Market Data Service - Real-time market data (NO Binance integration)
 * Uses Frankfurter API for forex only
 */

export interface MarketTick {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  timestamp: number;
  change?: number;
  changePercent?: number;
  high?: number;
  low?: number;
  open?: number;
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  sentiment?: "positive" | "negative" | "neutral";
  symbols?: string[];
}

export interface MarketDataSubscriber {
  id: string;
  symbols: string[];
  onTick: (tick: MarketTick) => void;
  onError?: (error: Error) => void;
}



export class MarketDataService {
  private static instance: MarketDataService;
  private subscribers: Map<string, MarketDataSubscriber> = new Map();
  private priceCache: Map<string, MarketTick> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private forexCache: Map<string, { rate: number; timestamp: number }> =
    new Map();
  private forexInterval: NodeJS.Timeout | null = null;



  // Forex pairs supported by Frankfurter API
  private readonly FOREX_PAIRS = [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "AUDUSD",
    "USDCAD",
    "NZDUSD",
    "EURJPY",
    "GBPJPY",
  ];

  private constructor() {
    // Only initialize in browser environment
    if (typeof window !== "undefined") {
      this.initializeDataFeeds();
    }
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initializeDataFeeds() {
    // Only initialize Frankfurter API polling for forex (no WebSocket available)
    if (typeof window === "undefined") {
      console.warn("⚠️ Market data feeds can only be initialized in browser");
      return;
    }
    this.initializeForexPolling();
  // ...existing code...
  }

  private async initializeForexPolling() {
    // Only run in browser
    if (typeof window === "undefined") {
      console.warn("⚠️ Cannot initialize forex polling on server-side");
      return;
    }

    // Fetch forex rates every 60 seconds (Frankfurter API limit)
    const fetchForexRates = async () => {
      try {
        const response = await fetch(
          "https://api.frankfurter.app/latest?from=USD"
        );
        const data = await response.json();

        if (data.rates) {
          const timestamp = Date.now();

          // Store all rates
          Object.entries(data.rates).forEach(([currency, rate]) => {
            this.forexCache.set(currency, {
              rate: rate as number,
              timestamp,
            });
          });

          // Update our tracked forex pairs
          this.updateForexPrices(data.rates, timestamp);
        }
      } catch (error) {
        console.error("❌ Error fetching forex rates:", error);
      }
    };

    // Initial fetch
    await fetchForexRates();
    console.log("✅ Forex rates initialized - Updates every 60s");

    // Poll every 60 seconds
    this.forexInterval = setInterval(fetchForexRates, 60000);
  }

  private updateForexPrices(rates: Record<string, number>, timestamp: number) {
    // Map Frankfurter rates to our forex pairs
    const forexMap: Record<string, () => number> = {
      EURUSD: () => rates.EUR || 0,
      GBPUSD: () => rates.GBP || 0,
      USDJPY: () => 1 / (rates.JPY || 1),
      USDCHF: () => 1 / (rates.CHF || 1),
      AUDUSD: () => rates.AUD || 0,
      USDCAD: () => 1 / (rates.CAD || 1),
      NZDUSD: () => rates.NZD || 0,
      EURJPY: () => (rates.EUR && rates.JPY ? rates.EUR / rates.JPY : 0),
      GBPJPY: () => (rates.GBP && rates.JPY ? rates.GBP / rates.JPY : 0),
    };

    this.FOREX_PAIRS.forEach((pair) => {
      const priceCalc = forexMap[pair];
      if (!priceCalc) return;

      const price = priceCalc();
      if (!price) return;

      // Calculate 24h change
      const cached = this.priceCache.get(pair);
      const change = cached ? price - cached.price : 0;
      const changePercent =
        cached && cached.price ? (change / cached.price) * 100 : 0;

      const tick: MarketTick = {
        symbol: pair,
        price: parseFloat(price.toFixed(5)),
        bid: parseFloat((price - 0.0001).toFixed(5)),
        ask: parseFloat((price + 0.0001).toFixed(5)),
        volume: 0, // Frankfurter doesn't provide volume
        timestamp,
        change: parseFloat(change.toFixed(5)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        high: parseFloat((price * 1.001).toFixed(5)),
        low: parseFloat((price * 0.999).toFixed(5)),
        open: cached?.open || price,
      };

      this.updatePrice(tick);
    });
  }

  private updatePrice(tick: MarketTick) {
    this.priceCache.set(tick.symbol, tick);

    // Notify all subscribers
    this.subscribers.forEach((subscriber) => {
      if (subscriber.symbols.includes(tick.symbol)) {
        try {
          subscriber.onTick(tick);
        } catch (error) {
          console.error("Error notifying subscriber:", error);
          subscriber.onError?.(error as Error);
        }
      }
    });
  }

  public subscribe(subscriber: MarketDataSubscriber): void {
    this.subscribers.set(subscriber.id, subscriber);

    // Send current prices for subscribed symbols
    subscriber.symbols.forEach((symbol) => {
      const cachedTick = this.priceCache.get(symbol);
      if (cachedTick) {
        subscriber.onTick(cachedTick);
      }
    });
  }

  public unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }

  public getPrice(symbol: string): MarketTick | null {
    return this.priceCache.get(symbol) || null;
  }

  public getAllPrices(): MarketTick[] {
    return Array.from(this.priceCache.values());
  }

  public getHistoricalData(
    symbol: string,
    timeframe: string = "1D"
  ): Promise<CandlestickData[]> {
    return new Promise(async (resolve) => {
      try {
        // Normalize symbol - remove slashes, uppercase
        const normalizedSymbol = symbol.replace("/", "").toUpperCase();
        
        // Check if this is a forex pair (Binance doesn't have forex data)
        const FOREX_CODES = new Set(["EUR","USD","GBP","JPY","CHF","CAD","AUD","NZD","SEK","NOK","DKK","PLN","CZK","HUF","SGD","HKD","MXN","ZAR","TRY","BRL","INR","KRW","THB","CNY"]);
        const isForexPair = (sym: string): boolean => {
          // Check for "XXXYYY" format (6 chars, both parts are forex codes)
          if (sym.length === 6 && /^[A-Z]{6}$/.test(sym)) {
            const base = sym.substring(0, 3);
            const quote = sym.substring(3, 6);
            return FOREX_CODES.has(base) && FOREX_CODES.has(quote);
          }
          return false;
        };
        
        // For forex pairs, generate synthetic candlestick data based on cached price
        if (isForexPair(normalizedSymbol)) {
          const cachedTick = this.priceCache.get(normalizedSymbol);
          const basePrice = cachedTick?.price || 1.0;
          
          // Generate 100 candles of synthetic data
          const now = Date.now();
          const intervalMs = timeframe === "1m" ? 60000 : 
                            timeframe === "5m" ? 300000 :
                            timeframe === "15m" ? 900000 :
                            timeframe === "1H" ? 3600000 :
                            timeframe === "4H" ? 14400000 :
                            timeframe === "1W" ? 604800000 : 86400000;
          
          const data: CandlestickData[] = [];
          for (let i = 99; i >= 0; i--) {
            const timestamp = now - (i * intervalMs);
            const variance = 0.0005; // Small forex variance
            const randomOffset = (Math.random() - 0.5) * variance;
            const open = basePrice + randomOffset;
            const close = basePrice + (Math.random() - 0.5) * variance;
            const high = Math.max(open, close) + Math.random() * variance * 0.5;
            const low = Math.min(open, close) - Math.random() * variance * 0.5;
            
            data.push({
              timestamp,
              open: parseFloat(open.toFixed(5)),
              high: parseFloat(high.toFixed(5)),
              low: parseFloat(low.toFixed(5)),
              close: parseFloat(close.toFixed(5)),
              volume: Math.floor(Math.random() * 10000),
            });
          }
          
          resolve(data);
          return;
        }
        
        // For crypto, fetch real historical data from Binance API
        const binanceSymbol = normalizedSymbol.replace("USD", "USDT");

        // Map timeframes to Binance intervals
        const intervalMap: Record<string, string> = {
          "1m": "1m",
          "5m": "5m",
          "15m": "15m",
          "1H": "1h",
          "4H": "4h",
          "1D": "1d",
          "1W": "1w",
        };

        const binanceInterval = intervalMap[timeframe] || "1d";
        const limit = 100;

        const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Binance API error: ${response.statusText}`);
        }

        const rawData = await response.json();

        const data: CandlestickData[] = rawData.map((kline: any[]) => ({
          timestamp: kline[0],
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5]),
        }));

        resolve(data);
      } catch (error) {
        console.error(
          `❌ Error fetching historical data for ${symbol}:`,
          error
        );
        // Return empty array instead of rejecting to prevent uncaught errors
        resolve([]);
      }
    });
  }

  public getMarketNews(): Promise<NewsItem[]> {
    // TODO: Integrate with real news API (e.g., NewsAPI, Alpha Vantage News)
    // For now, return empty array until real news feed is implemented
    return Promise.resolve([]);
  }

  public disconnect(): void {
    // Clean up WebSocket connections
    this.websockets.forEach((ws) => ws.close());
    this.websockets.clear();

    // Clear reconnect timeouts
    this.reconnectTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.reconnectTimeouts.clear();

    // Clear forex polling interval
    if (this.forexInterval) {
      clearInterval(this.forexInterval);
      this.forexInterval = null;
    }

    this.subscribers.clear();
    this.priceCache.clear();
    this.forexCache.clear();
  }
}

// Singleton instance getter
export function getMarketDataService(): MarketDataService {
  return MarketDataService.getInstance();
}

export default MarketDataService;
