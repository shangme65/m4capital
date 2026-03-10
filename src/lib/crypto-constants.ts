/**
 * Shared cryptocurrency constants and metadata
 * Used across payment routes, deposit modals, and traderoom
 */

/**
 * Mapping of supported cryptocurrencies to their NowPayments codes
 * This is the canonical source for supported cryptocurrencies
 */
export const SUPPORTED_CRYPTOS: Record<string, { code: string; name: string }> =
  {
    btc: { code: "btc", name: "Bitcoin" },
    eth: { code: "eth", name: "Ethereum" },
    etc: { code: "etc", name: "Ethereum Classic" },
    ltc: { code: "ltc", name: "Litecoin" },
    xrp: { code: "xrp", name: "Ripple" },
    usdc: { code: "usdcerc20", name: "USDC (ERC-20)" },
    usdcerc20: { code: "usdcerc20", name: "USDC (ERC-20)" },
    sol: { code: "sol", name: "Solana" },
    doge: { code: "doge", name: "Dogecoin" },
    bnb: { code: "bnbbsc", name: "BNB (BSC)" },
    trx: { code: "trx", name: "Tron" },
    usdt: { code: "usdterc20", name: "USDT (ERC-20)" },
    usdterc20: { code: "usdterc20", name: "USDT (ERC-20)" },
    usdttrc20: { code: "usdttrc20", name: "USDT (TRC-20)" },
    bch: { code: "bch", name: "Bitcoin Cash" },
    ton: { code: "ton", name: "Toncoin" },
  };

/**
 * Crypto metadata for display purposes
 * Contains colors, full names, icons, and gradient styling for each cryptocurrency
 */
export interface CryptoMetadata {
  name: string;
  icon: string;
  color: string;
  gradient: string;
  iconBg: string;
  bgColor: string;
  imagePath: string;
  network?: string;
}

export const CRYPTO_METADATA: Record<string, CryptoMetadata> = {
  BTC: {
    name: "Bitcoin",
    icon: "₿",
    color: "#F7931A",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(247, 147, 26, 0.1)",
    imagePath: "/crypto/btc.svg",
  },
  ETH: {
    name: "Ethereum",
    icon: "Ξ",
    color: "#627EEA",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(98, 126, 234, 0.1)",
    imagePath: "/crypto/eth.svg",
  },
  USDT: {
    name: "Tether",
    icon: "₮",
    color: "#26A17B",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(38, 161, 123, 0.1)",
    imagePath: "/crypto/usdt.svg",
    network: "Ethereum",
  },
  BNB: {
    name: "BNB",
    icon: "B",
    color: "#F3BA2F",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(243, 186, 47, 0.1)",
    imagePath: "/crypto/bnb.svg",
  },
  SOL: {
    name: "Solana",
    icon: "◎",
    color: "#9945FF",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(153, 69, 255, 0.1)",
    imagePath: "/crypto/sol.svg",
  },
  XRP: {
    name: "Ripple",
    icon: "✕",
    color: "#23292F",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(35, 41, 47, 0.1)",
    imagePath: "/crypto/xrp.svg",
  },
  DOGE: {
    name: "Dogecoin",
    icon: "Ð",
    color: "#C2A633",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(194, 166, 51, 0.1)",
    imagePath: "/crypto/doge.svg",
  },
  ADA: {
    name: "Cardano",
    icon: "₳",
    color: "#0033AD",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(0, 51, 173, 0.1)",
    imagePath: "/crypto/ada.svg",
  },
  TRX: {
    name: "Tron",
    icon: "T",
    color: "#FF0013",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(255, 0, 19, 0.1)",
    imagePath: "/crypto/trx.svg",
  },
  LTC: {
    name: "Litecoin",
    icon: "Ł",
    color: "#345D9D",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(52, 93, 157, 0.1)",
    imagePath: "/crypto/ltc.svg",
  },
  USDC: {
    name: "USD Coin",
    icon: "$",
    color: "#2775CA",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(39, 117, 202, 0.1)",
    imagePath: "/crypto/usdc.svg",
  },
  BCH: {
    name: "Bitcoin Cash",
    icon: "₿",
    color: "#8DC351",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(141, 195, 81, 0.1)",
    imagePath: "/crypto/bch.svg",
  },
  ETC: {
    name: "Ethereum Classic",
    icon: "ᗐ",
    color: "#3AB83A",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(58, 184, 58, 0.1)",
    imagePath: "/crypto/etc.svg",
  },
  TON: {
    name: "Toncoin",
    icon: "💎",
    color: "#0098EA",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(0, 152, 234, 0.1)",
    imagePath: "/crypto/ton.svg",
  },
};

/**
 * Get crypto metadata with fallback for unknown coins
 */
export function getCryptoMetadata(symbol: string): CryptoMetadata {
  const upperSymbol = symbol.toUpperCase();
  return (
    CRYPTO_METADATA[upperSymbol] || {
      name: symbol,
      icon: "○",
      color: "#6B7280",
      gradient: "from-gray-600 to-gray-700",
      iconBg: "#6b7280",
      bgColor: "rgba(107, 114, 128, 0.1)",
      imagePath: "/crypto/generic.svg",
    }
  );
}

/**
 * Format time ago from a date
 * @param date - Date object, timestamp, or ISO string
 * @returns Human-readable time ago string
 */
export function formatTimeAgo(date: Date | number | string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return past.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
