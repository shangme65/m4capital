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
    gradient: "from-orange-500 to-yellow-600",
    iconBg: "#f97316",
    bgColor: "rgba(247, 147, 26, 0.1)",
    imagePath: "/crypto/btc.svg",
  },
  ETH: {
    name: "Ethereum",
    icon: "Ξ",
    color: "#627EEA",
    gradient: "from-blue-500 to-cyan-600",
    iconBg: "#3b82f6",
    bgColor: "rgba(98, 126, 234, 0.1)",
    imagePath: "/crypto/eth.svg",
  },
  USDT: {
    name: "Tether",
    icon: "₮",
    color: "#26A17B",
    gradient: "from-green-500 to-teal-600",
    iconBg: "#22c55e",
    bgColor: "rgba(38, 161, 123, 0.1)",
    imagePath: "/crypto/usdt.svg",
    network: "Ethereum",
  },
  BNB: {
    name: "BNB",
    icon: "B",
    color: "#F3BA2F",
    gradient: "from-yellow-400 to-yellow-600",
    iconBg: "#F3BA2F",
    bgColor: "rgba(243, 186, 47, 0.1)",
    imagePath: "/crypto/bnb.svg",
  },
  SOL: {
    name: "Solana",
    icon: "◎",
    color: "#9945FF",
    gradient: "from-purple-500 to-indigo-600",
    iconBg: "#9945FF",
    bgColor: "rgba(153, 69, 255, 0.1)",
    imagePath: "/crypto/sol.svg",
  },
  XRP: {
    name: "Ripple",
    icon: "✕",
    color: "#23292F",
    gradient: "from-blue-600 to-indigo-600",
    iconBg: "#2563eb",
    bgColor: "rgba(35, 41, 47, 0.1)",
    imagePath: "/crypto/xrp.svg",
  },
  DOGE: {
    name: "Dogecoin",
    icon: "Ð",
    color: "#C2A633",
    gradient: "from-yellow-400 to-yellow-600",
    iconBg: "#C2A633",
    bgColor: "rgba(194, 166, 51, 0.1)",
    imagePath: "/crypto/doge.svg",
  },
  ADA: {
    name: "Cardano",
    icon: "₳",
    color: "#0033AD",
    gradient: "from-blue-600 to-blue-800",
    iconBg: "#0033AD",
    bgColor: "rgba(0, 51, 173, 0.1)",
    imagePath: "/crypto/ada.svg",
  },
  TRX: {
    name: "Tron",
    icon: "T",
    color: "#FF0013",
    gradient: "from-red-500 to-red-600",
    iconBg: "#ef4444",
    bgColor: "rgba(255, 0, 19, 0.1)",
    imagePath: "/crypto/trx.svg",
  },
  LTC: {
    name: "Litecoin",
    icon: "Ł",
    color: "#345D9D",
    gradient: "from-gray-400 to-gray-600",
    iconBg: "#9ca3af",
    bgColor: "rgba(52, 93, 157, 0.1)",
    imagePath: "/crypto/ltc.svg",
  },
  USDC: {
    name: "USD Coin",
    icon: "$",
    color: "#2775CA",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "#3b82f6",
    bgColor: "rgba(39, 117, 202, 0.1)",
    imagePath: "/crypto/usdc.svg",
  },
  BCH: {
    name: "Bitcoin Cash",
    icon: "₿",
    color: "#8DC351",
    gradient: "from-green-500 to-green-600",
    iconBg: "#22c55e",
    bgColor: "rgba(141, 195, 81, 0.1)",
    imagePath: "/crypto/bch.svg",
  },
  ETC: {
    name: "Ethereum Classic",
    icon: "ᗐ",
    color: "#3AB83A",
    gradient: "from-green-600 to-emerald-600",
    iconBg: "#059669",
    bgColor: "rgba(58, 184, 58, 0.1)",
    imagePath: "/crypto/etc.svg",
  },
  TON: {
    name: "Toncoin",
    icon: "💎",
    color: "#0098EA",
    gradient: "from-blue-500 to-cyan-600",
    iconBg: "#3b82f6",
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
