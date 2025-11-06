/**
 * Binance API utilities for fetching historical kline/candlestick data
 */

export interface KlineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type BinanceInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

/**
 * Fetch historical kline data from Binance
 * @param symbol Trading pair (e.g., "BTCUSDT")
 * @param interval Timeframe (e.g., "1m", "5m", "15m", "1h", "4h", "1d")
 * @param limit Number of candles to fetch (default: 100, max: 1000)
 */
export async function fetchKlineData(
  symbol: string,
  interval: BinanceInterval = "1m",
  limit: number = 100
): Promise<KlineData[]> {
  try {
    // Normalize symbol format (BTCUSDT, ETHUSDT, etc.)
    const normalizedSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, "");

    // Binance API endpoint for klines
    const url = `https://api.binance.com/api/v3/klines?symbol=${normalizedSymbol}&interval=${interval}&limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Binance API error: ${response.status} ${response.statusText}`
      );
    }

    const rawData = await response.json();

    // Transform Binance kline format to our KlineData format
    // Binance format: [timestamp, open, high, low, close, volume, closeTime, ...]
    return rawData.map((candle: any[]) => ({
      timestamp: candle[0], // Open time
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
    }));
  } catch (error) {
    console.error(`Failed to fetch kline data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Convert interval string to Binance format
 */
export function normalizeInterval(interval: string): BinanceInterval {
  const map: Record<string, BinanceInterval> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1D": "1d",
  };

  return map[interval] || "1m";
}

/**
 * Subscribe to real-time kline updates via WebSocket
 * @param symbol Trading pair
 * @param interval Timeframe
 * @param onUpdate Callback when new kline data arrives
 */
export function subscribeToKlineUpdates(
  symbol: string,
  interval: BinanceInterval,
  onUpdate: (kline: KlineData) => void
): () => void {
  const normalizedSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, "");
  const stream = `${normalizedSymbol.toLowerCase()}@kline_${interval}`;
  const wsUrl = `wss://stream.binance.com:9443/ws/${stream}`;

  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const kline = data.k;

      if (kline) {
        onUpdate({
          timestamp: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
        });
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
  };

  // Return cleanup function
  return () => {
    ws.close();
  };
}
