import { NextResponse } from "next/server";

// Cache forex rates for 1 minute
let forexCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 1000; // 1 minute

// Using Frankfurter API - completely free, no API key needed, maintained by ECB
const BASE_CURRENCY = "USD";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols")?.split(",") || [
      "CAD",
      "EUR",
      "GBP",
      "JPY",
      "AUD",
      "CHF",
      "NZD",
      "CNY",
    ];

    // Check cache
    const now = Date.now();
    if (forexCache && now - forexCache.timestamp < CACHE_DURATION) {
      console.log(
        `✅ Forex rates from cache (${now - forexCache.timestamp}ms old)`
      );
      return NextResponse.json(forexCache.data);
    }

    // Fetch fresh data from Frankfurter API (free, no key needed, ECB data)
    const symbolsParam = symbols.join(",");
    const apiUrl = `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${symbolsParam}`;

    console.log(`🌐 Fetching forex rates from Frankfurter API...`);
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`Forex API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.rates) {
      throw new Error("Failed to fetch forex rates");
    }

    // Fetch yesterday's data for real historical comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const historicalUrl = `https://api.frankfurter.app/${yesterdayStr}?from=${BASE_CURRENCY}&to=${symbolsParam}`;

    let previousData: any = null;
    try {
      const historicalResponse = await fetch(historicalUrl, {
        next: { revalidate: 86400 }, // Cache for 24 hours
      });
      if (historicalResponse.ok) {
        previousData = await historicalResponse.json();
      }
    } catch (error) {
      console.warn("Failed to fetch historical forex data:", error);
    }

    // Format the response with real historical data
    const rates: any = {};
    const timestamp = new Date(data.date).getTime();

    symbols.forEach((symbol) => {
      const rate = data.rates[symbol];
      if (rate) {
        const previousRate = previousData?.rates?.[symbol] || rate; // Use real previous rate if available
        const change = rate - previousRate;
        const changePercent =
          previousRate !== 0 ? (change / previousRate) * 100 : 0;

        rates[symbol] = {
          symbol: `USD/${symbol}`,
          price: rate.toFixed(5),
          previousPrice: previousRate.toFixed(5),
          change: change.toFixed(5),
          changePercent: changePercent.toFixed(2),
          timestamp: timestamp,
        };
      }
    });

    // Also add inverse pairs (e.g., EUR/USD) with real historical data
    const inversePairs: any = {};
    symbols.forEach((symbol) => {
      const rate = data.rates[symbol];
      if (rate) {
        const inverseRate = 1 / rate;
        const previousRate = previousData?.rates?.[symbol] || rate;
        const previousInverseRate = 1 / previousRate;
        const change = inverseRate - previousInverseRate;
        const changePercent =
          previousInverseRate !== 0 ? (change / previousInverseRate) * 100 : 0;

        inversePairs[symbol] = {
          symbol: `${symbol}/USD`,
          price: inverseRate.toFixed(5),
          previousPrice: previousInverseRate.toFixed(5),
          change: change.toFixed(5),
          changePercent: changePercent.toFixed(2),
          timestamp: timestamp,
        };
      }
    });

    const result = {
      ...rates,
      ...inversePairs,
      lastUpdate: timestamp,
      nextUpdate: timestamp + 86400000, // ECB updates daily
    };

    // Update cache
    forexCache = {
      data: result,
      timestamp: now,
    };

    console.log(
      `✅ Forex rates fetched successfully (${Object.keys(rates).length} pairs)`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching forex rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch forex rates. Please try again later." },
      { status: 500 }
    );
  }
}
