import { NextRequest, NextResponse } from "next/server";

interface CoinMarketCapQuote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  last_updated: string;
}

interface CoinMarketCapData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  quote: { USD: CoinMarketCapQuote };
}

interface CoinMarketCapResponse {
  data: { [key: string]: CoinMarketCapData };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
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

let priceCache: Map<
  string,
  { data: CryptoPriceResponse[]; timestamp: number }
> = new Map();
const CACHE_DURATION = 60000;

const CRYPTO_SYMBOL_MAP: Record<string, string> = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  XRP: "XRP",
  BNB: "BNB",
  ADA: "ADA",
  DOGE: "DOGE",
  AVAX: "AVAX",
  TRX: "TRX",
  DOT: "DOT",
  LINK: "LINK",
  TON: "TON",
  SHIB: "SHIB",
  LTC: "LTC",
  UNI: "UNI",
  MATIC: "MATIC",
  ATOM: "ATOM",
  NEAR: "NEAR",
  FIL: "FIL",
  APT: "APT",
  ARB: "ARB",
  OP: "OP",
  AAVE: "AAVE",
  MKR: "MKR",
  INJ: "INJ",
  SUI: "SUI",
  SEI: "SEI",
  BCH: "BCH",
  ETC: "ETC",
  USDC: "USDC",
  USDT: "USDT",
};
const CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  XRP: "Ripple",
  BNB: "BNB",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  AVAX: "Avalanche",
  TRX: "Tron",
  DOT: "Polkadot",
  LINK: "Chainlink",
  TON: "Toncoin",
  SHIB: "Shiba Inu",
  LTC: "Litecoin",
  UNI: "Uniswap",
  MATIC: "Polygon",
  ATOM: "Cosmos",
  NEAR: "NEAR Protocol",
  FIL: "Filecoin",
  APT: "Aptos",
  ARB: "Arbitrum",
  OP: "Optimism",
  AAVE: "Aave",
  MKR: "Maker",
  INJ: "Injective",
  SUI: "Sui",
  SEI: "Sei",
  BCH: "Bitcoin Cash",
  ETC: "Ethereum Classic",
  USDC: "USD Coin",
  USDT: "Tether",
};

async function fetchCryptoPrices(
  symbols: string[]
): Promise<CryptoPriceResponse[]> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ COINMARKETCAP_API_KEY not configured, using fallback prices");
    // Return fallback prices instead of throwing error
    return symbols.map((symbol) => ({
      symbol,
      name: CRYPTO_NAMES[symbol] || symbol,
      price: getFallbackPrice(symbol),
      change24h: 0,
      changePercent24h: 0,
      volume24h: 0,
      marketCap: 0,
      timestamp: Date.now(),
    }));
  }
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(
    ","
  )}&convert=USD`;
  const response = await fetch(url, {
    headers: { "X-CMC_PRO_API_KEY": apiKey },
  });
  if (!response.ok) {
    console.error(`CoinMarketCap API error: ${response.status}`);
    // Return fallback on API error
    return symbols.map((symbol) => ({
      symbol,
      name: CRYPTO_NAMES[symbol] || symbol,
      price: getFallbackPrice(symbol),
      change24h: 0,
      changePercent24h: 0,
      volume24h: 0,
      marketCap: 0,
      timestamp: Date.now(),
    }));
  }
  const data: CoinMarketCapResponse = await response.json();
  if (data.status.error_code !== 0) {
    console.error(`CoinMarketCap error: ${data.status.error_message}`);
    // Return fallback on API error
    return symbols.map((symbol) => ({
      symbol,
      name: CRYPTO_NAMES[symbol] || symbol,
      price: getFallbackPrice(symbol),
      change24h: 0,
      changePercent24h: 0,
      volume24h: 0,
      marketCap: 0,
      timestamp: Date.now(),
    }));
  }
  return symbols
    .map((symbol) => {
      const coinData = data.data[symbol];
      if (!coinData) return null;
      const quote = coinData.quote.USD;
      return {
        symbol,
        name: CRYPTO_NAMES[symbol] || coinData.name,
        price: quote.price,
        change24h: (quote.price * quote.percent_change_24h) / 100,
        changePercent24h: quote.percent_change_24h,
        volume24h: quote.volume_24h,
        marketCap: quote.market_cap,
        timestamp: Date.now(),
      };
    })
    .filter(Boolean) as CryptoPriceResponse[];
}

// Fallback prices when API is unavailable
function getFallbackPrice(symbol: string): number {
  const fallbackPrices: Record<string, number> = {
    BTC: 50000,
    ETH: 3000,
    SOL: 150,
    XRP: 0.6,
    BNB: 600,
    ADA: 0.5,
    DOGE: 0.15,
    AVAX: 35,
    TRX: 0.12,
    DOT: 7,
    LINK: 15,
    TON: 2.5,
    SHIB: 0.00001,
    LTC: 85,
    UNI: 10,
    MATIC: 0.8,
    ATOM: 10,
    NEAR: 5,
    FIL: 5,
    APT: 8,
    ARB: 1.2,
    OP: 2,
    AAVE: 100,
    MKR: 1500,
    INJ: 25,
    SUI: 1.5,
    SEI: 0.5,
    BCH: 300,
    ETC: 25,
    USDC: 1,
    USDT: 1,
  };
  return fallbackPrices[symbol] || 100;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    const requestedSymbols = symbolsParam
      ? symbolsParam.split(",").map((s) => s.trim().toUpperCase())
      : Object.keys(CRYPTO_SYMBOL_MAP);
    const validSymbols = requestedSymbols.filter((s) => CRYPTO_SYMBOL_MAP[s]);
    if (validSymbols.length === 0)
      return NextResponse.json({ error: "No valid symbols" }, { status: 400 });
    const cacheKey = validSymbols.sort().join(",");
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION)
      return NextResponse.json({
        prices: cached.data,
        cached: true,
        timestamp: cached.timestamp,
      });
    const prices = await fetchCryptoPrices(validSymbols);
    priceCache.set(cacheKey, { data: prices, timestamp: Date.now() });
    return NextResponse.json({ prices, cached: false, timestamp: Date.now() });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch prices",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
