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
    ada: { code: "ada", name: "Cardano" },
    avax: { code: "avaxc", name: "Avalanche" },
    dot: { code: "dot", name: "Polkadot" },
    matic: { code: "maticpoly", name: "Polygon" },
    link: { code: "link", name: "Chainlink" },
    uni: { code: "uni", name: "Uniswap" },
    atom: { code: "atom", name: "Cosmos" },
    shib: { code: "shib", name: "Shiba Inu" },
    near: { code: "near", name: "NEAR Protocol" },
    apt: { code: "apt", name: "Aptos" },
    arb: { code: "arb", name: "Arbitrum" },
    op: { code: "op", name: "Optimism" },
    fil: { code: "fil", name: "Filecoin" },
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
  AVAX: {
    name: "Avalanche",
    icon: "A",
    color: "#E84142",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(232, 65, 66, 0.1)",
    imagePath: "/crypto/avax.svg",
  },
  DOT: {
    name: "Polkadot",
    icon: "●",
    color: "#E6007A",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(230, 0, 122, 0.1)",
    imagePath: "/crypto/dot.svg",
  },
  MATIC: {
    name: "Polygon",
    icon: "M",
    color: "#8247E5",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(130, 71, 229, 0.1)",
    imagePath: "/crypto/matic.svg",
  },
  LINK: {
    name: "Chainlink",
    icon: "⬡",
    color: "#2A5ADA",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(42, 90, 218, 0.1)",
    imagePath: "/crypto/link.svg",
  },
  SHIB: {
    name: "Shiba Inu",
    icon: "S",
    color: "#FFA409",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(255, 164, 9, 0.1)",
    imagePath: "/crypto/shib.svg",
  },
  UNI: {
    name: "Uniswap",
    icon: "🦄",
    color: "#FF007A",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(255, 0, 122, 0.1)",
    imagePath: "/crypto/uni.svg",
  },
  ATOM: {
    name: "Cosmos",
    icon: "⚛",
    color: "#2E3148",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(46, 49, 72, 0.1)",
    imagePath: "/crypto/atom.svg",
  },
  FIL: {
    name: "Filecoin",
    icon: "⨎",
    color: "#0090FF",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(0, 144, 255, 0.1)",
    imagePath: "/crypto/fil.svg",
  },
  APT: {
    name: "Aptos",
    icon: "A",
    color: "#000000",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(0, 0, 0, 0.1)",
    imagePath: "/crypto/apt.svg",
  },
  ARB: {
    name: "Arbitrum",
    icon: "A",
    color: "#28A0F0",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(40, 160, 240, 0.1)",
    imagePath: "/crypto/arb.svg",
  },
  OP: {
    name: "Optimism",
    icon: "O",
    color: "#FF0420",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(255, 4, 32, 0.1)",
    imagePath: "/crypto/op.svg",
  },
  NEAR: {
    name: "NEAR Protocol",
    icon: "N",
    color: "#000000",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(0, 0, 0, 0.1)",
    imagePath: "/crypto/near.svg",
  },
  AAVE: {
    name: "Aave",
    icon: "A",
    color: "#B6509E",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(182, 80, 158, 0.1)",
    imagePath: "/crypto/aave.svg",
  },
  MKR: {
    name: "Maker",
    icon: "M",
    color: "#1AAB9B",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(26, 171, 155, 0.1)",
    imagePath: "/crypto/mkr.svg",
  },
  INJ: {
    name: "Injective",
    icon: "I",
    color: "#0082FF",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(0, 130, 255, 0.1)",
    imagePath: "/crypto/inj.svg",
  },
  SUI: {
    name: "Sui",
    icon: "S",
    color: "#4DA2FF",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(77, 162, 255, 0.1)",
    imagePath: "/crypto/sui.svg",
  },
  SEI: {
    name: "Sei",
    icon: "S",
    color: "#9B1C2E",
    gradient: "from-slate-800 to-slate-900",
    iconBg: "#1e293b",
    bgColor: "rgba(155, 28, 46, 0.1)",
    imagePath: "/crypto/sei.svg",
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
