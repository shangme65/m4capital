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
  BNB: "BNB",
  SOL: "SOL",
  ADA: "ADA",
  XRP: "XRP",
  DOGE: "DOGE",
  DOT: "DOT",
  MATIC: "MATIC",
  LINK: "LINK",
  AVAX: "AVAX",
  UNI: "UNI",
  ATOM: "ATOM",
  LTC: "LTC",
  ETC: "ETC",
};
const CRYPTO_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
  SOL: "Solana",
  ADA: "Cardano",
  XRP: "XRP",
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

async function fetchCryptoPrices(
  symbols: string[]
): Promise<CryptoPriceResponse[]> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) throw new Error("COINMARKETCAP_API_KEY not configured");
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(
    ","
  )}&convert=USD`;
  const response = await fetch(url, {
    headers: { "X-CMC_PRO_API_KEY": apiKey },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data: CoinMarketCapResponse = await response.json();
  if (data.status.error_code !== 0)
    throw new Error(data.status.error_message || "API error");
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
