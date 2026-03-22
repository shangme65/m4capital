/**
 * Unified Trading Assets
 * This is the single source of truth for all tradable assets in the platform.
 * Used by both Traderoom and Admin Manual Trade Modal.
 */

export interface TradingAsset {
  symbol: string;
  displayName: string;
  category: "Index" | "Forex" | "Crypto" | "Stocks" | "Commodities";
  flag?: string;
}

export const TRADING_ASSETS: TradingAsset[] = [
  // ===== CURRENCY INDICES =====
  { symbol: "AUD Index", displayName: "Australian Dollar Index", category: "Index", flag: "AUD" },
  { symbol: "GBP Index", displayName: "British Pound Index", category: "Index", flag: "GBP" },
  { symbol: "CAD Index", displayName: "Canadian Dollar Index", category: "Index", flag: "CAD" },
  { symbol: "EUR Index", displayName: "Euro Index", category: "Index", flag: "EUR" },
  { symbol: "Dollar Index", displayName: "US Dollar Index", category: "Index", flag: "USD" },
  { symbol: "Yen Index", displayName: "Japanese Yen Index", category: "Index", flag: "JPY" },

  // ===== MARKET INDICES =====
  { symbol: "Magnificent 7", displayName: "Magnificent 7", category: "Index", flag: "📊" },
  { symbol: "AUS 200", displayName: "Australian 200", category: "Index", flag: "🇦🇺" },
  { symbol: "EU 50", displayName: "Euro 50", category: "Index", flag: "🇪🇺" },
  { symbol: "FR 40", displayName: "France 40", category: "Index", flag: "🇫🇷" },
  { symbol: "GER 30", displayName: "Germany 30", category: "Index", flag: "🇩🇪" },
  { symbol: "HK 50", displayName: "Hong Kong 50", category: "Index", flag: "🇭🇰" },
  { symbol: "IT 40", displayName: "Italy 40", category: "Index", flag: "🇮🇹" },
  { symbol: "JPN 225", displayName: "Japan 225", category: "Index", flag: "🇯🇵" },
  { symbol: "NL 25", displayName: "Netherlands 25", category: "Index", flag: "🇳🇱" },
  { symbol: "SA 40", displayName: "South Africa 40", category: "Index", flag: "🇿🇦" },
  { symbol: "ESP 35", displayName: "Spain 35", category: "Index", flag: "🇪🇸" },
  { symbol: "SWI 20", displayName: "Switzerland 20", category: "Index", flag: "🇨🇭" },
  { symbol: "UK 100", displayName: "UK 100", category: "Index", flag: "🇬🇧" },
  { symbol: "US 30", displayName: "US 30", category: "Index", flag: "🇺🇸" },
  { symbol: "US Tech 100", displayName: "US Tech 100", category: "Index", flag: "🇺🇸" },
  { symbol: "US 500", displayName: "US 500", category: "Index", flag: "🇺🇸" },
  { symbol: "VIX", displayName: "Volatility Index", category: "Index", flag: "📉" },

  // ===== SECTOR INDICES =====
  { symbol: "Airlines", displayName: "Airlines Index", category: "Index", flag: "✈️" },
  { symbol: "Cannabis", displayName: "Cannabis Index", category: "Index", flag: "🌿" },
  { symbol: "Casino", displayName: "Casino Index", category: "Index", flag: "🎰" },

  // ===== FOREX MAJORS =====
  { symbol: "EUR/USD", displayName: "Euro / US Dollar", category: "Forex", flag: "EUR,USD" },
  { symbol: "GBP/USD", displayName: "British Pound / US Dollar", category: "Forex", flag: "GBP,USD" },
  { symbol: "USD/JPY", displayName: "US Dollar / Japanese Yen", category: "Forex", flag: "USD,JPY" },
  { symbol: "USD/CAD", displayName: "US Dollar / Canadian Dollar", category: "Forex", flag: "USD,CAD" },
  { symbol: "AUD/USD", displayName: "Australian Dollar / US Dollar", category: "Forex", flag: "AUD,USD" },
  { symbol: "USD/CHF", displayName: "US Dollar / Swiss Franc", category: "Forex", flag: "USD,CHF" },
  { symbol: "NZD/USD", displayName: "New Zealand Dollar / US Dollar", category: "Forex", flag: "NZD,USD" },

  // ===== FOREX CROSSES =====
  { symbol: "EUR/GBP", displayName: "Euro / British Pound", category: "Forex", flag: "EUR,GBP" },
  { symbol: "EUR/JPY", displayName: "Euro / Japanese Yen", category: "Forex", flag: "EUR,JPY" },
  { symbol: "GBP/JPY", displayName: "British Pound / Japanese Yen", category: "Forex", flag: "GBP,JPY" },
  { symbol: "EUR/CHF", displayName: "Euro / Swiss Franc", category: "Forex", flag: "EUR,CHF" },
  { symbol: "AUD/JPY", displayName: "Australian Dollar / Japanese Yen", category: "Forex", flag: "AUD,JPY" },
  { symbol: "USD/TRY", displayName: "US Dollar / Turkish Lira", category: "Forex", flag: "USD,TRY" },
  { symbol: "EUR/AUD", displayName: "Euro / Australian Dollar", category: "Forex", flag: "EUR,AUD" },
  { symbol: "GBP/AUD", displayName: "British Pound / Australian Dollar", category: "Forex", flag: "GBP,AUD" },
  { symbol: "USD/CNY", displayName: "US Dollar / Chinese Yuan", category: "Forex", flag: "USD,CNY" },
  { symbol: "AUD/NZD", displayName: "Australian Dollar / New Zealand Dollar", category: "Forex", flag: "AUD,NZD" },
  { symbol: "EUR/CAD", displayName: "Euro / Canadian Dollar", category: "Forex", flag: "EUR,CAD" },
  { symbol: "AUD/CAD", displayName: "Australian Dollar / Canadian Dollar", category: "Forex", flag: "AUD,CAD" },
  { symbol: "GBP/CAD", displayName: "British Pound / Canadian Dollar", category: "Forex", flag: "GBP,CAD" },
  { symbol: "EUR/NZD", displayName: "Euro / New Zealand Dollar", category: "Forex", flag: "EUR,NZD" },
  { symbol: "GBP/NZD", displayName: "British Pound / New Zealand Dollar", category: "Forex", flag: "GBP,NZD" },
  { symbol: "NZD/JPY", displayName: "New Zealand Dollar / Japanese Yen", category: "Forex", flag: "NZD,JPY" },
  { symbol: "NZD/CAD", displayName: "New Zealand Dollar / Canadian Dollar", category: "Forex", flag: "NZD,CAD" },
  { symbol: "NZD/CHF", displayName: "New Zealand Dollar / Swiss Franc", category: "Forex", flag: "NZD,CHF" },
  { symbol: "CAD/JPY", displayName: "Canadian Dollar / Japanese Yen", category: "Forex", flag: "CAD,JPY" },
  { symbol: "CAD/CHF", displayName: "Canadian Dollar / Swiss Franc", category: "Forex", flag: "CAD,CHF" },
  { symbol: "CHF/JPY", displayName: "Swiss Franc / Japanese Yen", category: "Forex", flag: "CHF,JPY" },

  // ===== CRYPTOCURRENCIES (vs USD) =====
  { symbol: "BTC/USD", displayName: "Bitcoin", category: "Crypto", flag: "BTC" },
  { symbol: "ETH/USD", displayName: "Ethereum", category: "Crypto", flag: "ETH" },
  { symbol: "XRP/USD", displayName: "Ripple", category: "Crypto", flag: "XRP" },
  { symbol: "ADA/USD", displayName: "Cardano", category: "Crypto", flag: "ADA" },
  { symbol: "DOGE/USD", displayName: "Dogecoin", category: "Crypto", flag: "DOGE" },
  { symbol: "DOT/USD", displayName: "Polkadot", category: "Crypto", flag: "DOT" },
  { symbol: "MATIC/USD", displayName: "Polygon", category: "Crypto", flag: "MATIC" },
  { symbol: "AVAX/USD", displayName: "Avalanche", category: "Crypto", flag: "AVAX" },
  { symbol: "LTC/USD", displayName: "Litecoin", category: "Crypto", flag: "LTC" },
  { symbol: "LINK/USD", displayName: "Chainlink", category: "Crypto", flag: "LINK" },
  { symbol: "SHIB/USD", displayName: "Shiba Inu", category: "Crypto", flag: "SHIB" },
  { symbol: "UNI/USD", displayName: "Uniswap", category: "Crypto", flag: "UNI" },
  { symbol: "SOL/USD", displayName: "Solana", category: "Crypto", flag: "SOL" },
  { symbol: "TRX/USD", displayName: "Tron", category: "Crypto", flag: "TRX" },
  { symbol: "TON/USD", displayName: "Toncoin", category: "Crypto", flag: "TON" },
  { symbol: "ATOM/USD", displayName: "Cosmos", category: "Crypto", flag: "ATOM" },
  { symbol: "NEAR/USD", displayName: "NEAR Protocol", category: "Crypto", flag: "NEAR" },
  { symbol: "FIL/USD", displayName: "Filecoin", category: "Crypto", flag: "FIL" },
  { symbol: "APT/USD", displayName: "Aptos", category: "Crypto", flag: "APT" },
  { symbol: "ARB/USD", displayName: "Arbitrum", category: "Crypto", flag: "ARB" },
  { symbol: "OP/USD", displayName: "Optimism", category: "Crypto", flag: "OP" },
  { symbol: "AAVE/USD", displayName: "Aave", category: "Crypto", flag: "AAVE" },
  { symbol: "MKR/USD", displayName: "Maker", category: "Crypto", flag: "MKR" },
  { symbol: "INJ/USD", displayName: "Injective", category: "Crypto", flag: "INJ" },
  { symbol: "SUI/USD", displayName: "Sui", category: "Crypto", flag: "SUI" },
  { symbol: "SEI/USD", displayName: "Sei", category: "Crypto", flag: "SEI" },

  // ===== US STOCKS =====
  { symbol: "AAPL", displayName: "Apple Inc.", category: "Stocks", flag: "🍎" },
  { symbol: "MSFT", displayName: "Microsoft Corporation", category: "Stocks", flag: "🪟" },
  { symbol: "GOOGL", displayName: "Alphabet Inc. (Google)", category: "Stocks", flag: "🔍" },
  { symbol: "AMZN", displayName: "Amazon.com Inc.", category: "Stocks", flag: "📦" },
  { symbol: "NVDA", displayName: "NVIDIA Corporation", category: "Stocks", flag: "🎮" },
  { symbol: "TSLA", displayName: "Tesla Inc.", category: "Stocks", flag: "🚗" },
  { symbol: "META", displayName: "Meta Platforms Inc.", category: "Stocks", flag: "👤" },
  { symbol: "NFLX", displayName: "Netflix Inc.", category: "Stocks", flag: "🎬" },
  { symbol: "AMD", displayName: "Advanced Micro Devices", category: "Stocks", flag: "💻" },
  { symbol: "INTC", displayName: "Intel Corporation", category: "Stocks", flag: "🖥️" },
  { symbol: "BABA", displayName: "Alibaba Group", category: "Stocks", flag: "🛒" },
  { symbol: "DIS", displayName: "Walt Disney Company", category: "Stocks", flag: "🏰" },
  { symbol: "BA", displayName: "Boeing Company", category: "Stocks", flag: "✈️" },
  { symbol: "JPM", displayName: "JPMorgan Chase & Co.", category: "Stocks", flag: "🏦" },
  { symbol: "V", displayName: "Visa Inc.", category: "Stocks", flag: "💳" },
  { symbol: "PYPL", displayName: "PayPal Holdings", category: "Stocks", flag: "💰" },
  { symbol: "NKE", displayName: "Nike Inc.", category: "Stocks", flag: "👟" },
  { symbol: "KO", displayName: "Coca-Cola Company", category: "Stocks", flag: "🥤" },
  { symbol: "PFE", displayName: "Pfizer Inc.", category: "Stocks", flag: "💊" },
  { symbol: "UBER", displayName: "Uber Technologies", category: "Stocks", flag: "🚕" },
  { symbol: "COIN", displayName: "Coinbase Global, Inc.", category: "Stocks", flag: "₿" },
  { symbol: "PLTR", displayName: "Palantir Technologies", category: "Stocks", flag: "🎯" },
  { symbol: "MCD", displayName: "McDonald's Corporation", category: "Stocks", flag: "🍔" },
  { symbol: "MS", displayName: "Morgan Stanley", category: "Stocks", flag: "🏦" },
  { symbol: "KLARNA", displayName: "Klarna Group plc", category: "Stocks", flag: "🛍️" },

  // ===== STOCK PAIRS =====
  { symbol: "META/GOOGL", displayName: "Meta / Alphabet", category: "Stocks", flag: "👤" },
  { symbol: "MSFT/AAPL", displayName: "Microsoft / Apple", category: "Stocks", flag: "🪟" },
  { symbol: "NFLX/AMZN", displayName: "Netflix / Amazon", category: "Stocks", flag: "🎬" },
  { symbol: "TSLA/F", displayName: "Tesla / Ford", category: "Stocks", flag: "🚗" },

  // ===== COMMODITIES =====
  { symbol: "XAUUSD", displayName: "Gold", category: "Commodities", flag: "🥇" },
  { symbol: "XAGUSD", displayName: "Silver", category: "Commodities", flag: "🥈" },
  { symbol: "Gold/Silver", displayName: "Gold / Silver", category: "Commodities", flag: "🥇" },
  { symbol: "Natural Gas", displayName: "Natural Gas", category: "Commodities", flag: "⛽" },
  { symbol: "USOUSD", displayName: "US Crude Oil", category: "Commodities", flag: "🛢️" },
  { symbol: "UKOUSD", displayName: "UK Crude Oil", category: "Commodities", flag: "🛢️" },
];

/**
 * Get asset by symbol
 */
export function getAssetBySymbol(symbol: string): TradingAsset | undefined {
  return TRADING_ASSETS.find((asset) => asset.symbol === symbol);
}

/**
 * Get all assets by category
 */
export function getAssetsByCategory(
  category: TradingAsset["category"]
): TradingAsset[] {
  return TRADING_ASSETS.filter((asset) => asset.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): TradingAsset["category"][] {
  return Array.from(new Set(TRADING_ASSETS.map((asset) => asset.category)));
}

/**
 * Format asset for admin modal (simplified symbol for some assets)
 * Converts "BTC/USD" to "BTC" for display purposes
 */
export function formatAssetForAdmin(symbol: string): string {
  // For crypto assets ending with /USD, remove the /USD part
  if (symbol.endsWith("/USD") && !symbol.includes(" ")) {
    return symbol.replace("/USD", "");
  }
  return symbol;
}

/**
 * Convert admin modal format back to full symbol
 * Converts "BTC" to "BTC/USD" if it's a crypto
 */
export function parseAdminAssetSymbol(symbol: string): string {
  const asset = TRADING_ASSETS.find((a) => {
    const simplified = formatAssetForAdmin(a.symbol);
    return simplified === symbol || a.symbol === symbol;
  });
  return asset?.symbol || symbol;
}
