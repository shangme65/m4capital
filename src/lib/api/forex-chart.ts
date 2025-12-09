/**
 * Forex Chart Data Provider
 * Provides candlestick data for forex pairs using multiple sources
 */

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Base prices for forex pairs (approximate market rates)
const FOREX_BASE_PRICES: Record<string, number> = {
  USDCAD: 1.358,
  EURUSD: 1.052,
  GBPUSD: 1.268,
  USDJPY: 149.5,
  AUDUSD: 0.645,
  USDCHF: 0.882,
  NZDUSD: 0.592,
  EURJPY: 157.2,
  GBPJPY: 189.5,
  EURGBP: 0.83,
  AUDCAD: 0.875,
  EURCAD: 1.428,
  GBPCAD: 1.722,
  // Crypto pairs (fallback if Binance fails)
  BTCUSD: 97500,
  ETHUSD: 3850,
  XRPUSD: 2.35,
};

// Volatility factors for different pairs (pip movement per candle)
// Balanced values for visible but natural candlesticks
const VOLATILITY: Record<string, number> = {
  USDCAD: 0.002,
  EURUSD: 0.0015,
  GBPUSD: 0.002,
  USDJPY: 0.15,
  AUDUSD: 0.0015,
  USDCHF: 0.0015,
  NZDUSD: 0.0015,
  EURJPY: 0.2,
  GBPJPY: 0.25,
  EURGBP: 0.001,
  AUDCAD: 0.0015,
  EURCAD: 0.002,
  GBPCAD: 0.0025,
  BTCUSD: 300,
  ETHUSD: 15,
  XRPUSD: 0.02,
};

/**
 * Normalize symbol to standard format
 * "USD/CAD (OTC)" -> "USDCAD"
 * "EUR/USD" -> "EURUSD"
 */
export function normalizeForexSymbol(symbol: string): string {
  return symbol
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace("OTC", "");
}

/**
 * Get interval duration in milliseconds
 */
function getIntervalMs(interval: string): number {
  const intervals: Record<string, number> = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1D": 24 * 60 * 60 * 1000,
  };
  return intervals[interval] || 60 * 1000;
}

/**
 * Generate realistic candlestick data based on price action patterns
 * Uses random walk with trend and mean reversion
 */
export function generateRealisticCandles(
  symbol: string,
  interval: string = "1m",
  count: number = 100
): CandleData[] {
  const normalizedSymbol = normalizeForexSymbol(symbol);
  const basePrice = FOREX_BASE_PRICES[normalizedSymbol] || 1.0;
  const volatility = VOLATILITY[normalizedSymbol] || 0.0005;
  const intervalMs = getIntervalMs(interval);

  const candles: CandleData[] = [];
  const now = Date.now();
  let currentPrice = basePrice;

  // Trend parameters
  let trend = 0; // -1 to 1
  let trendStrength = 0.3;
  let momentum = 0;

  // Seed for deterministic but varied data based on symbol and time
  const seed = normalizedSymbol
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  const seededRandom = (i: number) => {
    const x = Math.sin(seed + i * 9999) * 10000;
    return x - Math.floor(x);
  };

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;

    // Update trend occasionally - creates alternating up/down patterns
    if (seededRandom(i * 7) > 0.9) {
      trend = (seededRandom(i * 13) - 0.5) * 2;
    }

    // Calculate price movement with trend and randomness (visible movements)
    const trendComponent = trend * volatility * trendStrength;
    const randomComponent = (seededRandom(i) - 0.5) * 2 * volatility;
    const meanReversion = (basePrice - currentPrice) * 0.008;

    momentum = momentum * 0.7 + (trendComponent + randomComponent) * 0.3;

    const priceChange = momentum + meanReversion;

    // Generate OHLC with realistic body sizes
    const open = currentPrice;
    const close = currentPrice + priceChange;

    // High and low based on volatility - add visible wicks
    const range =
      Math.abs(priceChange) + volatility * seededRandom(i * 3) * 0.8;
    const highOffset = range * (0.2 + seededRandom(i * 5) * 0.5);
    const lowOffset = range * (0.2 + seededRandom(i * 11) * 0.5);

    const high = Math.max(open, close) + highOffset;
    const low = Math.min(open, close) - lowOffset;

    // Volume varies with price movement
    const baseVolume = 1000000;
    const volumeMultiplier =
      0.5 + seededRandom(i * 17) + Math.abs(priceChange / volatility) * 0.5;
    const volume = baseVolume * volumeMultiplier;

    candles.push({
      timestamp,
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
      volume: Math.round(volume),
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Try to fetch from free forex API, fall back to generated data
 */
export async function fetchForexCandles(
  symbol: string,
  interval: string = "1m",
  count: number = 100
): Promise<CandleData[]> {
  const normalizedSymbol = normalizeForexSymbol(symbol);

  // Try Twelve Data free tier (limited requests)
  try {
    const pair = `${normalizedSymbol.slice(0, 3)}/${normalizedSymbol.slice(3)}`;
    const twelveDataInterval = interval === "1D" ? "1day" : interval;

    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${pair}&interval=${twelveDataInterval}&outputsize=${count}&apikey=demo`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.values && Array.isArray(data.values)) {
        return data.values.reverse().map((v: any) => ({
          timestamp: new Date(v.datetime).getTime(),
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
          close: parseFloat(v.close),
          volume: parseFloat(v.volume) || 1000000,
        }));
      }
    }
  } catch (error) {
    console.log("Twelve Data API unavailable, using generated data");
  }

  // Fallback to realistic generated data
  console.log(`Generating realistic candle data for ${normalizedSymbol}`);
  return generateRealisticCandles(symbol, interval, count);
}

/**
 * Create a real-time update stream for forex data
 * Simulates live market data updates with fast tick rate like IQ Option
 */
export function subscribeToForexUpdates(
  symbol: string,
  interval: string,
  onUpdate: (candle: CandleData) => void,
  onTick?: (price: number, direction: "up" | "down" | "neutral") => void
): () => void {
  const normalizedSymbol = normalizeForexSymbol(symbol);
  const basePrice = FOREX_BASE_PRICES[normalizedSymbol] || 1.0;
  const volatility = VOLATILITY[normalizedSymbol] || 0.0005;
  const intervalMs = getIntervalMs(interval);

  let currentPrice = basePrice + (Math.random() - 0.5) * volatility * 5; // Start near base with small variance
  let lastCandle: CandleData | null = null;
  let tickCount = 0;
  let momentum = 0;
  let trend = (Math.random() - 0.5) * 0.3; // Initial trend (smaller)
  let lastPrice = currentPrice;

  // Update every 100ms for smooth real-time feel like IQ Option
  const tickInterval = setInterval(() => {
    tickCount++;
    const now = Date.now();
    const candleStart = Math.floor(now / intervalMs) * intervalMs;

    // Change trend occasionally (creates waves)
    if (Math.random() > 0.92) {
      trend = (Math.random() - 0.5) * 2;
    }

    // More visible momentum for natural price action like IQ Option
    const trendPush = trend * volatility * 0.15;
    const noise = (Math.random() - 0.5) * volatility * 0.6;
    const meanReversion = (basePrice - currentPrice) * 0.002;

    momentum = momentum * 0.7 + (trendPush + noise + meanReversion) * 0.3;

    lastPrice = currentPrice;
    currentPrice += momentum;

    // Keep price in reasonable range (5% of base for visible swings)
    currentPrice = Math.max(
      basePrice * 0.95,
      Math.min(basePrice * 1.05, currentPrice)
    );

    // Determine direction for tick callback
    const direction: "up" | "down" | "neutral" =
      currentPrice > lastPrice
        ? "up"
        : currentPrice < lastPrice
        ? "down"
        : "neutral";

    // Call tick callback for live price display
    if (onTick) {
      onTick(currentPrice, direction);
    }

    if (!lastCandle || lastCandle.timestamp !== candleStart) {
      // New candle starting
      lastCandle = {
        timestamp: candleStart,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
        volume: Math.round(100000 + Math.random() * 500000),
      };
    } else {
      // Update current candle
      lastCandle.close = currentPrice;
      lastCandle.high = Math.max(lastCandle.high, currentPrice);
      lastCandle.low = Math.min(lastCandle.low, currentPrice);
      lastCandle.volume += Math.round(500 + Math.random() * 2000);
    }

    onUpdate({ ...lastCandle });
  }, 100); // 100ms for smooth real-time feel

  // Return cleanup function
  return () => {
    clearInterval(tickInterval);
  };
}

// Store current prices for external access
const currentPrices: Record<
  string,
  { price: number; direction: "up" | "down" | "neutral" }
> = {};

export function getCurrentPrice(
  symbol: string
): { price: number; direction: "up" | "down" | "neutral" } | null {
  const normalized = normalizeForexSymbol(symbol);
  return currentPrices[normalized] || null;
}

export function setCurrentPrice(
  symbol: string,
  price: number,
  direction: "up" | "down" | "neutral"
): void {
  const normalized = normalizeForexSymbol(symbol);
  currentPrices[normalized] = { price, direction };
}
