/**
 * Market Data Service - Real-time market data integration
 * Supports multiple data sources: Alpha Vantage, Finnhub, Polygon.io, and WebSocket feeds
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
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  // Free API keys - replace with your own for production
  private readonly API_KEYS = {
    alphaVantage: "demo", // Replace with real API key
    finnhub: "demo", // Replace with real API key
    polygon: "demo", // Replace with real API key
  };

  // Major trading symbols
  private readonly SYMBOLS = {
    forex: [
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "USDCHF",
      "AUDUSD",
      "USDCAD",
      "NZDUSD",
    ],
    crypto: ["BTCUSD", "ETHUSD", "ADAUSD", "DOTUSD", "LINKUSD", "SOLUSD"],
    stocks: ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META"],
    indices: ["SPX", "NDX", "DJI", "RUT", "VIX"],
  };

  private constructor() {
    this.initializeDataFeeds();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initializeDataFeeds() {
    // Initialize simulated real-time data for demo
    this.startSimulatedFeeds();

    // In production, you would initialize real data sources here
    // this.initializeAlphaVantage();
    // this.initializeFinnhub();
    // this.initializePolygon();
  }

  private startSimulatedFeeds() {
    // Simulate real-time price feeds for demonstration
    const allSymbols = [
      ...this.SYMBOLS.forex,
      ...this.SYMBOLS.crypto,
      ...this.SYMBOLS.stocks,
      ...this.SYMBOLS.indices,
    ];

    // Initialize base prices
    const basePrices: Record<string, number> = {
      // Forex
      EURUSD: 1.0851,
      GBPUSD: 1.2731,
      USDJPY: 149.25,
      USDCHF: 0.8987,
      AUDUSD: 0.6654,
      USDCAD: 1.3621,
      NZDUSD: 0.6101,

      // Crypto
      BTCUSD: 43250.0,
      ETHUSD: 2587.5,
      ADAUSD: 0.3821,
      DOTUSD: 4.123,
      LINKUSD: 11.47,
      SOLUSD: 98.76,

      // Stocks
      AAPL: 178.25,
      GOOGL: 138.45,
      MSFT: 378.91,
      AMZN: 144.78,
      TSLA: 251.82,
      NVDA: 456.12,
      META: 325.67,

      // Indices
      SPX: 4372.85,
      NDX: 15289.43,
      DJI: 33745.69,
      RUT: 1895.23,
      VIX: 18.45,
    };

    allSymbols.forEach((symbol) => {
      const basePrice = basePrices[symbol] || 100;
      let currentPrice = basePrice;
      let lastChange = 0;

      const interval = setInterval(() => {
        // Simulate realistic price movements
        const volatility = this.getVolatility(symbol);
        const randomChange = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice += randomChange;

        // Ensure price doesn't go negative
        currentPrice = Math.max(currentPrice, basePrice * 0.01);

        const change = currentPrice - basePrice;
        const changePercent = (change / basePrice) * 100;

        const tick: MarketTick = {
          symbol,
          price: parseFloat(
            currentPrice.toFixed(this.getDecimalPlaces(symbol))
          ),
          bid: parseFloat(
            (currentPrice - this.getSpread(symbol) / 2).toFixed(
              this.getDecimalPlaces(symbol)
            )
          ),
          ask: parseFloat(
            (currentPrice + this.getSpread(symbol) / 2).toFixed(
              this.getDecimalPlaces(symbol)
            )
          ),
          volume: Math.floor(Math.random() * 1000000),
          timestamp: Date.now(),
          change: parseFloat(change.toFixed(this.getDecimalPlaces(symbol))),
          changePercent: parseFloat(changePercent.toFixed(2)),
          high: parseFloat(
            (currentPrice * (1 + Math.random() * 0.02)).toFixed(
              this.getDecimalPlaces(symbol)
            )
          ),
          low: parseFloat(
            (currentPrice * (1 - Math.random() * 0.02)).toFixed(
              this.getDecimalPlaces(symbol)
            )
          ),
          open: basePrice,
        };

        this.updatePrice(tick);
        lastChange = change;
      }, this.getUpdateInterval(symbol));

      this.intervals.set(symbol, interval);
    });
  }

  private getVolatility(symbol: string): number {
    if (this.SYMBOLS.crypto.includes(symbol)) return 0.03; // 3% max change
    if (this.SYMBOLS.forex.includes(symbol)) return 0.005; // 0.5% max change
    if (this.SYMBOLS.stocks.includes(symbol)) return 0.02; // 2% max change
    if (this.SYMBOLS.indices.includes(symbol)) return 0.01; // 1% max change
    return 0.01;
  }

  private getSpread(symbol: string): number {
    if (this.SYMBOLS.crypto.includes(symbol)) return 0.01;
    if (this.SYMBOLS.forex.includes(symbol)) return 0.00005;
    if (this.SYMBOLS.stocks.includes(symbol)) return 0.01;
    if (this.SYMBOLS.indices.includes(symbol)) return 0.1;
    return 0.01;
  }

  private getDecimalPlaces(symbol: string): number {
    if (this.SYMBOLS.forex.includes(symbol)) return 5;
    if (this.SYMBOLS.crypto.includes(symbol)) return 2;
    if (this.SYMBOLS.stocks.includes(symbol)) return 2;
    if (this.SYMBOLS.indices.includes(symbol)) return 2;
    return 2;
  }

  private getUpdateInterval(symbol: string): number {
    if (this.SYMBOLS.crypto.includes(symbol)) return 1000; // 1 second
    if (this.SYMBOLS.forex.includes(symbol)) return 500; // 0.5 seconds
    if (this.SYMBOLS.stocks.includes(symbol)) return 2000; // 2 seconds
    return 1000;
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
    // Simulate historical data generation
    return new Promise((resolve) => {
      const data: CandlestickData[] = [];
      const now = Date.now();
      const interval = this.getTimeframeInterval(timeframe);
      const count = 100; // Generate 100 candles

      let currentPrice = this.priceCache.get(symbol)?.price || 100;

      for (let i = count; i >= 0; i--) {
        const timestamp = now - i * interval;
        const volatility = this.getVolatility(symbol);

        const open = currentPrice;
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        const close = open + change;
        const high =
          Math.max(open, close) +
          Math.random() * volatility * currentPrice * 0.5;
        const low =
          Math.min(open, close) -
          Math.random() * volatility * currentPrice * 0.5;

        data.push({
          timestamp,
          open: parseFloat(open.toFixed(this.getDecimalPlaces(symbol))),
          high: parseFloat(high.toFixed(this.getDecimalPlaces(symbol))),
          low: parseFloat(low.toFixed(this.getDecimalPlaces(symbol))),
          close: parseFloat(close.toFixed(this.getDecimalPlaces(symbol))),
          volume: Math.floor(Math.random() * 1000000),
        });

        currentPrice = close;
      }

      setTimeout(() => resolve(data), 100); // Simulate API delay
    });
  }

  private getTimeframeInterval(timeframe: string): number {
    const intervals: Record<string, number> = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1H": 60 * 60 * 1000,
      "4H": 4 * 60 * 60 * 1000,
      "1D": 24 * 60 * 60 * 1000,
      "1W": 7 * 24 * 60 * 60 * 1000,
    };
    return intervals[timeframe] || intervals["1D"];
  }

  public getMarketNews(): Promise<NewsItem[]> {
    // Simulate market news - in production, integrate with news APIs
    const newsItems: NewsItem[] = [
      {
        id: "1",
        title: "Fed Signals Potential Rate Cut in Next Meeting",
        summary:
          "Federal Reserve officials hint at monetary policy easing amid economic concerns",
        source: "Reuters",
        timestamp: Date.now() - 1800000, // 30 minutes ago
        sentiment: "positive",
        symbols: ["EURUSD", "GBPUSD", "SPX"],
      },
      {
        id: "2",
        title: "Bitcoin Reaches New Monthly High",
        summary:
          "Cryptocurrency markets surge as institutional adoption continues",
        source: "Bloomberg",
        timestamp: Date.now() - 3600000, // 1 hour ago
        sentiment: "positive",
        symbols: ["BTCUSD", "ETHUSD"],
      },
      {
        id: "3",
        title: "Tech Stocks Rally on AI Optimism",
        summary:
          "Major technology companies see gains as AI investments show promise",
        source: "CNBC",
        timestamp: Date.now() - 7200000, // 2 hours ago
        sentiment: "positive",
        symbols: ["AAPL", "GOOGL", "MSFT", "NVDA"],
      },
    ];

    return Promise.resolve(newsItems);
  }

  public disconnect(): void {
    // Clean up all intervals and websockets
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();

    this.websockets.forEach((ws) => ws.close());
    this.websockets.clear();

    this.subscribers.clear();
    this.priceCache.clear();
  }

  // Real API integration methods (for production use)
  private initializeAlphaVantage() {
    // Initialize Alpha Vantage WebSocket or polling
    // Implementation depends on their API structure
  }

  private initializeFinnhub() {
    // Initialize Finnhub WebSocket
    // const ws = new WebSocket(`wss://ws.finnhub.io?token=${this.API_KEYS.finnhub}`);
  }

  private initializePolygon() {
    // Initialize Polygon.io WebSocket
    // const ws = new WebSocket(`wss://socket.polygon.io/stocks`);
  }
}

export default MarketDataService;
