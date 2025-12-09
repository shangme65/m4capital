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
    "5s": 5 * 1000,
    "10s": 10 * 1000,
    "30s": 30 * 1000,
    "1m": 60 * 1000,
    "2m": 2 * 60 * 1000,
    "5m": 5 * 60 * 1000,
    "10m": 10 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "2h": 2 * 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "8h": 8 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1D": 24 * 60 * 60 * 1000,
    "1W": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
  };
  return intervals[interval] || 60 * 1000;
}

/**
 * Generate historical candlestick data with realistic price movements
 * Creates visible candles with proper OHLC variation
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

  const now = Date.now();
  // Align to interval boundary (same as live updates)
  const currentCandleStart = Math.floor(now / intervalMs) * intervalMs;

  // Use seeded random for consistency within a session
  // Seed changes every hour to keep data fresh but consistent within the hour
  const hourSeed = Math.floor(now / (60 * 60 * 1000));
  const symbolSeed = normalizedSymbol
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = symbolSeed + hourSeed;

  let seedState = seed;
  const seededRandom = () => {
    seedState = (seedState * 1103515245 + 12345) & 0x7fffffff;
    return seedState / 0x7fffffff;
  };

  // Initialize price simulation parameters
  let currentPrice = basePrice;
  let trend = (seededRandom() - 0.5) * 2; // -1 to 1

  const candles: CandleData[] = [];

  // Generate candles from oldest to newest
  for (let candleIndex = count - 1; candleIndex >= 0; candleIndex--) {
    const candleTimestamp = currentCandleStart - candleIndex * intervalMs;

    // Change trend occasionally (creates waves) - ~10% chance per candle
    if (seededRandom() > 0.9) {
      trend = (seededRandom() - 0.5) * 2;
    }

    // Calculate candle movement - more visible price action
    const trendMove = trend * volatility * 0.5;
    const randomMove = (seededRandom() - 0.5) * volatility * 1.5;
    const meanReversion = (basePrice - currentPrice) * 0.01;

    const priceChange = trendMove + randomMove + meanReversion;

    // Generate OHLC
    const open = currentPrice;
    const close = currentPrice + priceChange;

    // Create visible wicks - high and low extend beyond open/close
    const wickSize = volatility * seededRandom() * 0.8;
    const high =
      Math.max(open, close) + wickSize * (0.3 + seededRandom() * 0.7);
    const low = Math.min(open, close) - wickSize * (0.3 + seededRandom() * 0.7);

    // Keep price in reasonable range (5% of base)
    const clampedClose = Math.max(
      basePrice * 0.95,
      Math.min(basePrice * 1.05, close)
    );

    // Volume varies with price movement
    const baseVolume = 1000000;
    const volumeMultiplier =
      0.5 + seededRandom() + Math.abs(priceChange / volatility) * 0.3;
    const volume = Math.round(baseVolume * volumeMultiplier);

    candles.push({
      timestamp: candleTimestamp,
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(Math.max(high, Math.max(open, clampedClose)).toFixed(5)),
      low: parseFloat(Math.min(low, Math.min(open, clampedClose)).toFixed(5)),
      close: parseFloat(clampedClose.toFixed(5)),
      volume,
    });

    currentPrice = clampedClose;
  }

  // Store the final price AND simulation state so live updates continue exactly from this point
  setLastHistoricalClose(symbol, currentPrice);
  setSimulationState(symbol, 0, trend);

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
 * Continues from the last historical candle's close price AND simulation state for seamless continuity
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

  // Start from last historical close price if available, otherwise use base price
  const lastHistoricalClose = getLastHistoricalClose(symbol);
  let currentPrice =
    lastHistoricalClose !== null ? lastHistoricalClose : basePrice;

  // Get simulation state from historical generation for perfect continuity
  const savedState = getSimulationState(symbol);
  let momentum = savedState ? savedState.momentum : 0;
  let trend = savedState ? savedState.trend : (Math.random() - 0.5) * 0.3;

  let lastCandle: CandleData | null = null;
  let lastPrice = currentPrice;

  // Update every 100ms for smooth real-time feel like IQ Option
  const tickInterval = setInterval(() => {
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

// Store current prices and last candle close prices for external access
const currentPrices: Record<
  string,
  { price: number; direction: "up" | "down" | "neutral" }
> = {};

// Store the last close price from historical data to ensure live updates continue from it
const lastHistoricalCloses: Record<string, number> = {};

// Store simulation state (momentum, trend) so live updates continue exactly from historical
const simulationState: Record<string, { momentum: number; trend: number }> = {};

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

export function setLastHistoricalClose(
  symbol: string,
  closePrice: number
): void {
  const normalized = normalizeForexSymbol(symbol);
  lastHistoricalCloses[normalized] = closePrice;
}

export function getLastHistoricalClose(symbol: string): number | null {
  const normalized = normalizeForexSymbol(symbol);
  return lastHistoricalCloses[normalized] || null;
}

export function setSimulationState(
  symbol: string,
  momentum: number,
  trend: number
): void {
  const normalized = normalizeForexSymbol(symbol);
  simulationState[normalized] = { momentum, trend };
}

export function getSimulationState(
  symbol: string
): { momentum: number; trend: number } | null {
  const normalized = normalizeForexSymbol(symbol);
  return simulationState[normalized] || null;
}
