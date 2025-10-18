import { NextRequest, NextResponse } from "next/server";

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

interface CryptoPriceResponse {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  timestamp: number;
}

// Cache for storing prices to avoid rate limiting
let priceCache: Map<
  string,
  { data: CryptoPriceResponse[]; timestamp: number }
> = new Map();
const CACHE_DURATION = 30000; // 30 seconds cache

const SUPPORTED_CRYPTOS = {
  bitcoin: { symbol: "BTC", name: "Bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum" },
  cardano: { symbol: "ADA", name: "Cardano" },
  polkadot: { symbol: "DOT", name: "Polkadot" },
  chainlink: { symbol: "LINK", name: "Chainlink" },
  litecoin: { symbol: "LTC", name: "Litecoin" },
  "bitcoin-cash": { symbol: "BCH", name: "Bitcoin Cash" },
  stellar: { symbol: "XLM", name: "Stellar" },
  dogecoin: { symbol: "DOGE", name: "Dogecoin" },
  ripple: { symbol: "XRP", name: "XRP" },
};

async function fetchCryptoPrices(
  cryptoIds: string[]
): Promise<CryptoPriceResponse[]> {
  try {
    const idsString = cryptoIds.join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

    console.log("Fetching crypto prices from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "M4Capital/1.0",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      );
    }

    const data: CoinGeckoPrice = await response.json();

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("CoinGecko response:", data);
    }

    const prices: CryptoPriceResponse[] = [];

    for (const [coinId, priceData] of Object.entries(data)) {
      const cryptoInfo =
        SUPPORTED_CRYPTOS[coinId as keyof typeof SUPPORTED_CRYPTOS];
      if (cryptoInfo && priceData.usd) {
        prices.push({
          symbol: cryptoInfo.symbol,
          name: cryptoInfo.name,
          price: priceData.usd,
          change24h: priceData.usd_24h_change || 0,
          changePercent24h: priceData.usd_24h_change || 0,
          marketCap: priceData.usd_market_cap,
          volume24h: priceData.usd_24h_vol,
          timestamp: Date.now(),
        });
      }
    }

    return prices;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols");

    // Default to Bitcoin if no symbols specified
    const requestedSymbols = symbols ? symbols.split(",") : ["BTC"];

    // Convert symbols to CoinGecko IDs
    const cryptoIds = requestedSymbols
      .map((symbol) => {
        const entry = Object.entries(SUPPORTED_CRYPTOS).find(
          ([_, info]) => info.symbol === symbol
        );
        return entry ? entry[0] : null;
      })
      .filter(Boolean) as string[];

    if (cryptoIds.length === 0) {
      return NextResponse.json(
        { error: "No valid crypto symbols provided" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = cryptoIds.sort().join(",");
    const cached = priceCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Returning cached crypto prices");
      return NextResponse.json({
        prices: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });
    }

    // Fetch fresh data
    const prices = await fetchCryptoPrices(cryptoIds);

    // Update cache
    priceCache.set(cacheKey, {
      data: prices,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      prices,
      cached: false,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Crypto prices API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch crypto prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
