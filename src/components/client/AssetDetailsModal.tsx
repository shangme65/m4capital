"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star } from "lucide-react";
import LightweightChart from "@/components/client/LightweightChart";
import BuyCryptoModal from "./BuyCryptoModal";
import AssetSendModal from "./AssetSendModal";
import AssetReceiveModal from "./AssetReceiveModal";
import AssetSwapModal from "./AssetSwapModal";
import AssetSellModal from "./AssetSellModal";
import TransactionDetailsModal, {
  DetailedTransaction,
} from "./TransactionDetailsModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { formatCurrency as formatCurrencyUtil } from "@/lib/currencies";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
  icon: string;
}

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  userBalance: number;
  balanceCurrency?: string;
  allAssets?: Asset[];
}

interface AssetInfo {
  [key: string]: {
    price: number;
    marketCap: string;
    circulatingSupply: string;
    totalSupply: string;
    description: string;
    links: {
      website?: string;
      explorer?: string;
      github?: string;
      twitter?: string;
    };
  };
}

// Asset info is fetched live where possible. Keep a small fallback info map for descriptions/links.
const assetInfo: AssetInfo = {
  BTC: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Bitcoin (BTC) is the world's first and most valuable cryptocurrency, created by the pseudonymous Satoshi Nakamoto in 2009. It operates on a decentralized peer-to-peer network secured by proof-of-work consensus. Bitcoin serves as a digital store of value and medium of exchange, with a fixed supply cap of 21 million coins, making it inherently deflationary.",
    links: {
      website: "https://bitcoin.org",
    },
  },
  ETH: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Ethereum (ETH) is the leading smart contract platform, enabling developers to build decentralized applications (dApps), DeFi protocols, and NFTs. Founded by Vitalik Buterin in 2015, Ethereum transitioned to proof-of-stake consensus in 2022, significantly reducing energy consumption. ETH powers the network's gas fees and serves as the backbone of Web3 innovation.",
    links: {
      website: "https://ethereum.org",
    },
  },
  XRP: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "XRP is the native cryptocurrency of the XRP Ledger, designed for fast, low-cost cross-border payments. Created by Ripple Labs, XRP enables financial institutions to transfer value globally in 3-5 seconds with minimal fees. The XRP Ledger uses a unique consensus protocol that doesn't require mining, making it highly energy-efficient.",
    links: {
      website: "https://xrpl.org",
    },
  },
  TRX: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "TRON (TRX) is a blockchain platform focused on decentralizing the entertainment industry and enabling content creators to monetize directly with audiences. Founded by Justin Sun in 2017, TRON supports high-throughput smart contracts, DeFi applications, and is one of the largest stablecoin (USDT) hosting networks.",
    links: {
      website: "https://tron.network",
    },
  },
  TON: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Toncoin (TON) powers The Open Network, originally developed by Telegram and now maintained by the TON Foundation. Known for exceptional speed and scalability, TON supports millions of transactions per second through its multi-blockchain architecture. Deeply integrated with Telegram's ecosystem, TON enables seamless crypto payments for over 800 million users.",
    links: {
      website: "https://ton.org",
    },
  },
  LTC: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Litecoin (LTC) is a peer-to-peer cryptocurrency created by Charlie Lee in 2011 as the 'silver to Bitcoin's gold.' With faster block times (2.5 minutes) and lower fees, Litecoin is optimized for everyday transactions. It was among the first to implement SegWit and Lightning Network, serving as a testing ground for Bitcoin upgrades.",
    links: {
      website: "https://litecoin.org",
    },
  },
  BCH: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Bitcoin Cash (BCH) emerged in 2017 as a fork of Bitcoin, increasing block size to 32MB to enable more transactions per block. BCH focuses on being a practical peer-to-peer electronic cash system with low fees and fast confirmations, making it suitable for everyday retail payments and remittances.",
    links: {
      website: "https://bitcoincash.org",
    },
  },
  ETC: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Ethereum Classic (ETC) is the original Ethereum blockchain that continued after the 2016 DAO hack dispute. ETC maintains the principle of 'code is law' and immutability. Unlike Ethereum, it continues to use proof-of-work consensus and has a capped supply of approximately 210 million coins.",
    links: {
      website: "https://ethereumclassic.org",
    },
  },
  USDC: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "USD Coin (USDC) is a fully-backed stablecoin pegged 1:1 to the US dollar, issued by Circle and Coinbase. Each USDC is backed by cash and short-term US Treasury bonds held in regulated financial institutions, with regular attestations by major accounting firms. USDC is widely used in DeFi, trading, and cross-border payments.",
    links: {
      website: "https://www.circle.com/usdc",
    },
  },
  USDT: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Tether (USDT) is the world's largest stablecoin by market cap, pegged to the US dollar. Issued by Tether Limited, USDT provides a stable digital currency for trading, transfers, and DeFi applications. Available on multiple blockchains including Ethereum, Tron, and Solana, it facilitates trillions in annual trading volume.",
    links: {
      website: "https://tether.to",
    },
  },
  SOL: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Solana (SOL) is a high-performance blockchain supporting 65,000+ transactions per second with sub-second finality. Using its innovative Proof of History consensus combined with Proof of Stake, Solana offers extremely low fees, making it popular for DeFi, NFTs, and Web3 gaming applications.",
    links: {
      website: "https://solana.com",
    },
  },
  BNB: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "BNB is the native cryptocurrency of the BNB Chain ecosystem, originally created by Binance. BNB is used for trading fee discounts, transaction fees on BNB Chain, participation in token sales, and various DeFi applications. Regular token burns reduce supply over time.",
    links: {
      website: "https://www.bnbchain.org",
    },
  },
  DOGE: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Dogecoin (DOGE) started as a meme cryptocurrency in 2013 featuring the Shiba Inu dog. Despite its humorous origins, DOGE has become a legitimate payment method accepted by numerous merchants. With its active community and low transaction fees, Dogecoin is used for tipping, donations, and micropayments.",
    links: {
      website: "https://dogecoin.com",
    },
  },
  ADA: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Cardano (ADA) is a third-generation blockchain platform founded by Ethereum co-founder Charles Hoskinson. Built on peer-reviewed research and formal verification methods, Cardano uses the energy-efficient Ouroboros proof-of-stake protocol. It supports smart contracts, DeFi, and aims to provide financial services to the unbanked.",
    links: {
      website: "https://cardano.org",
    },
  },
  MATIC: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Polygon (MATIC) is a Layer 2 scaling solution for Ethereum, providing faster and cheaper transactions while inheriting Ethereum's security. The ecosystem includes multiple scaling technologies including Polygon PoS, zkEVM, and Supernets, making it a leading platform for DeFi, gaming, and enterprise blockchain applications.",
    links: {
      website: "https://polygon.technology",
    },
  },
  AVAX: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Avalanche (AVAX) is a high-speed smart contracts platform that processes 4,500+ transactions per second with instant finality. Its unique three-chain architecture (X-Chain, C-Chain, P-Chain) enables both decentralized applications and custom blockchain networks called Subnets, popular for gaming and institutional DeFi.",
    links: {
      website: "https://www.avax.network",
    },
  },
  DOT: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Polkadot (DOT) enables cross-blockchain transfers of any type of data or asset. Created by Ethereum co-founder Gavin Wood, Polkadot connects multiple specialized blockchains (parachains) into one unified network, allowing them to operate seamlessly together while maintaining their unique features and governance.",
    links: {
      website: "https://polkadot.network",
    },
  },
  LINK: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Chainlink (LINK) is the industry-standard decentralized oracle network, providing real-world data to smart contracts on any blockchain. Chainlink enables hybrid smart contracts that can access off-chain data feeds, APIs, and payment systems, securing billions of dollars across DeFi, insurance, and gaming.",
    links: {
      website: "https://chain.link",
    },
  },
};

export default function AssetDetailsModal({
  isOpen,
  onClose,
  asset,
  userBalance,
  balanceCurrency = "USD",
  allAssets = [],
}: AssetDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"holdings" | "history" | "about">(
    "holdings"
  );
  const [isStarred, setIsStarred] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<DetailedTransaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Currency context for user's preferred currency
  const { preferredCurrency, formatAmount } = useCurrency();

  // Helper to format user balance - show directly if currencies match
  const formatUserBalance = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      const symbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        NGN: "₦",
        ZAR: "R",
        KES: "KSh",
        GHS: "₵",
      };
      const symbol = symbols[preferredCurrency] || "$";
      return `${symbol}${balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Different currency - formatAmount converts from USD to preferred
    return formatAmount(balance, 2);
  };

  // Prevent body scroll when modal is open
  // Note: Browser back button is handled by the parent component via URL params
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    }
  }, [isOpen]);

  // Action handlers - use asset-specific modals for the selected crypto
  const handleSend = () => {
    setShowSendModal(true);
    console.log(`Opening send modal for ${asset?.symbol}`);
  };

  const handleReceive = () => {
    setShowReceiveModal(true);
    console.log(`Opening receive modal for ${asset?.symbol}`);
  };

  const handleSwap = () => {
    setShowSwapModal(true);
    console.log(`Opening swap modal for ${asset?.symbol}`);
  };

  const handleBuy = () => {
    setShowBuyModal(true);
    console.log(`Opening buy modal for ${asset?.symbol}`);
  };

  const handleSell = () => {
    setShowSellModal(true);
    console.log(`Opening sell modal for ${asset?.symbol}`);
  };

  const closeAllActionModals = () => {
    setShowSendModal(false);
    setShowReceiveModal(false);
    setShowSwapModal(false);
    setShowBuyModal(false);
    setShowSellModal(false);
  };

  // Live price and history state
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveChangePercent, setLiveChangePercent] = useState<number | null>(
    null
  );
  const [txHistory, setTxHistory] = useState<any[]>([]);
  // Live market data (market cap, supply, etc.)
  const [marketData, setMarketData] = useState<{
    marketCap: string;
    circulatingSupply: string;
    totalSupply: string;
  } | null>(null);
  // Chart period state (UI: 1D,1W,1M,1Y)
  const [selectedPeriod, setSelectedPeriod] = useState<
    "1D" | "1W" | "1M" | "1Y"
  >("1D");
  // Buy amount state
  const [selectedBuyAmount, setSelectedBuyAmount] = useState<number>(30);

  // Fetch live price for asset.symbol from our prices API
  // ONLY poll when modal is actually open to prevent continuous API calls
  useEffect(() => {
    if (!isOpen || !asset?.symbol) return;

    let mounted = true;
    let interval: any = null;
    const fetchPrice = async () => {
      if (!asset?.symbol) return;
      try {
        const res = await fetch(`/api/crypto/prices?symbols=${asset.symbol}`);
        const data = await res.json();
        const priceObj = Array.isArray(data.prices) ? data.prices[0] : null;
        if (mounted && priceObj) {
          setLivePrice(priceObj.price ?? null);
          setLiveChangePercent(priceObj.changePercent24h ?? null);
        }
      } catch (e) {
        console.error("Failed to fetch live price", e);
      }
    };

    // initial fetch
    fetchPrice();
    // poll every 30s (only while modal is open)
    interval = setInterval(fetchPrice, 30000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, [asset?.symbol, isOpen]);

  // Fetch transaction history for this asset (deposits/trades/withdrawals)
  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      if (!asset?.symbol) return;
      try {
        const res = await fetch(
          `/api/transactions/by-symbol?symbol=${asset.symbol}`
        );
        const data = await res.json();
        if (mounted)
          setTxHistory(Array.isArray(data.history) ? data.history : []);
      } catch (e) {
        console.error("Failed to fetch history", e);
        if (mounted) setTxHistory([]);
      }
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [asset?.symbol]);

  // Set market data from static reference (CoinGecko API is unreliable)
  useEffect(() => {
    if (!isOpen || !asset?.symbol) return;

    // Static market data - updated periodically, doesn't need real-time fetch
    const staticMarketData: Record<string, { marketCap: string; circulatingSupply: string; totalSupply: string }> = {
      BTC: { marketCap: "$2.1T", circulatingSupply: "19.8M BTC", totalSupply: "21M BTC" },
      ETH: { marketCap: "$420B", circulatingSupply: "120.4M ETH", totalSupply: "∞" },
      XRP: { marketCap: "$140B", circulatingSupply: "57.5B XRP", totalSupply: "100B XRP" },
      TRX: { marketCap: "$22B", circulatingSupply: "86.2B TRX", totalSupply: "∞" },
      TON: { marketCap: "$14B", circulatingSupply: "5.1B TON", totalSupply: "5.1B TON" },
      LTC: { marketCap: "$8.5B", circulatingSupply: "75M LTC", totalSupply: "84M LTC" },
      BCH: { marketCap: "$9B", circulatingSupply: "19.8M BCH", totalSupply: "21M BCH" },
      ETC: { marketCap: "$4B", circulatingSupply: "149M ETC", totalSupply: "210.7M ETC" },
      USDC: { marketCap: "$45B", circulatingSupply: "45B USDC", totalSupply: "∞" },
      USDT: { marketCap: "$140B", circulatingSupply: "140B USDT", totalSupply: "∞" },
      SOL: { marketCap: "$120B", circulatingSupply: "490M SOL", totalSupply: "∞" },
      ADA: { marketCap: "$35B", circulatingSupply: "35.5B ADA", totalSupply: "45B ADA" },
      DOGE: { marketCap: "$55B", circulatingSupply: "147B DOGE", totalSupply: "∞" },
      DOT: { marketCap: "$12B", circulatingSupply: "1.5B DOT", totalSupply: "∞" },
      MATIC: { marketCap: "$5B", circulatingSupply: "10B MATIC", totalSupply: "10B MATIC" },
      AVAX: { marketCap: "$18B", circulatingSupply: "410M AVAX", totalSupply: "720M AVAX" },
      LINK: { marketCap: "$12B", circulatingSupply: "626M LINK", totalSupply: "1B LINK" },
      UNI: { marketCap: "$8B", circulatingSupply: "600M UNI", totalSupply: "1B UNI" },
      SHIB: { marketCap: "$15B", circulatingSupply: "589T SHIB", totalSupply: "∞" },
      ATOM: { marketCap: "$4B", circulatingSupply: "390M ATOM", totalSupply: "∞" },
      BNB: { marketCap: "$100B", circulatingSupply: "145M BNB", totalSupply: "200M BNB" },
    };

    const data = staticMarketData[asset.symbol.toUpperCase()];
    setMarketData(data || null);
  }, [asset?.symbol, isOpen]);

  if (!isOpen || !asset) return null;

  const info = assetInfo[asset.symbol] || null;
  // Use only real transaction history from API - no mock/simulated data
  const history = txHistory;
  const currentPrice = livePrice ?? info?.price ?? 0;
  const priceChange = liveChangePercent ?? asset.change ?? 0;

  const quickBuyAmounts = [15, 25, 50, 100]; // USD amounts

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="asset-details-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 backdrop-blur-sm z-[9998] overflow-hidden"
            style={{ touchAction: "none", margin: 0, padding: 0 }}
          />
          <motion.div
            key="asset-details-content"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.1 }}
            className="fixed top-0 left-0 right-0 bottom-0 z-[9998] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: "auto", margin: 0, padding: 0 }}
          >
            <div
              className="bg-gray-900 w-full h-full overflow-y-auto"
              style={{ minHeight: "100vh", height: "100%" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white">
                    {asset.symbol}
                  </h1>
                  <p className="text-sm text-gray-400">COIN | {asset.name}</p>
                </div>
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`transition-colors ${
                    isStarred ? "text-yellow-500" : "text-gray-500"
                  }`}
                  aria-label="Add to favorites"
                >
                  <Star size={24} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Price Section */}
              <div className="p-4 bg-gray-900">
                {/* Network Fee Indicator - Shows estimated transfer fee for this asset */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-400 text-sm">⛽</span>
                  <span className="text-gray-400 text-sm">
                    {(() => {
                      // Estimated network fees per asset (in USD equivalent)
                      const networkFees: { [key: string]: number } = {
                        BTC: 2.5, // Bitcoin average fee
                        ETH: 3.0, // Ethereum gas fee
                        LTC: 0.05, // Litecoin low fee
                        BCH: 0.01, // Bitcoin Cash low fee
                        XRP: 0.001, // Ripple very low
                        TRX: 0.001, // Tron very low
                        TON: 0.01, // Toncoin low
                        SOL: 0.001, // Solana very low
                        DOGE: 0.5, // Dogecoin
                        ADA: 0.2, // Cardano
                        DOT: 0.1, // Polkadot
                        USDT: 1.0, // Tether (depends on network)
                        USDC: 1.0, // USD Coin
                        ETC: 0.1, // Ethereum Classic
                      };
                      const fee = networkFees[asset.symbol] || 0.5; // Default $0.50
                      return formatAmount(fee, 2);
                    })()}
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {formatAmount(currentPrice, 2)}
                  </div>
                  <div
                    className={`flex items-center justify-center gap-1 ${
                      priceChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <span className="text-lg">
                      {priceChange >= 0 ? "↑" : "↓"}
                    </span>
                    <span className="text-lg font-medium">
                      {formatAmount(
                        Math.abs((currentPrice * priceChange) / 100),
                        2
                      )}{" "}
                      ({priceChange >= 0 ? "+" : ""}
                      {priceChange.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Lightweight Chart */}
                <div
                  className="mb-4 rounded-xl overflow-hidden"
                  style={{
                    boxShadow:
                      "0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 10px 20px -5px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <LightweightChart
                    symbol={asset.symbol}
                    interval={selectedPeriod}
                    height={320}
                  />
                </div>

                {/* Time Period Buttons */}
                <div className="flex justify-around mb-6">
                  {[
                    { label: "1D", key: "1D" },
                    { label: "1W", key: "1W" },
                    { label: "1M", key: "1M" },
                    { label: "1Y", key: "1Y" },
                  ].map((period) => (
                    <button
                      key={period.key}
                      onClick={() => setSelectedPeriod(period.key as any)}
                      className={`px-3 py-1 text-sm transition-colors rounded ${
                        selectedPeriod === period.key
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* Buy Now Section - 3D Card Style */}
                <div
                  className="rounded-xl p-4 mb-6"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                    boxShadow:
                      "0 15px 30px -8px rgba(0, 0, 0, 0.6), 0 8px 16px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  {/* Header row with amount and Buy button */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Buy now
                      </h3>
                      <div className="text-2xl font-bold text-white">
                        {formatAmount(selectedBuyAmount, 2)}{" "}
                        <span className="text-gray-400 text-lg font-medium">
                          {preferredCurrency}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleBuy}
                      className="text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(145deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
                        boxShadow:
                          "0 8px 20px -4px rgba(37, 99, 235, 0.6), 0 4px 10px -2px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(59, 130, 246, 0.5)",
                      }}
                    >
                      Buy
                    </button>
                  </div>
                  {/* Quick amount buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickBuyAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedBuyAmount(amount)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedBuyAmount === amount
                            ? "text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                        style={
                          selectedBuyAmount === amount
                            ? {
                                background:
                                  "linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)",
                                boxShadow:
                                  "0 4px 12px -2px rgba(37, 99, 235, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                border: "1px solid rgba(59, 130, 246, 0.4)",
                              }
                            : {
                                background:
                                  "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                                boxShadow:
                                  "0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                              }
                        }
                      >
                        {formatAmount(amount, 0)}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    Buying {(selectedBuyAmount / currentPrice).toFixed(5)}{" "}
                    {asset.symbol} from available balance:{" "}
                    <span
                      className="font-bold bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent"
                      style={{
                        textShadow:
                          "0 0 15px rgba(59,130,246,0.1), 0 2px 4px rgba(0,0,0,0.8)",
                        WebkitTextStroke: "0.3px rgba(255,255,255,0.1)",
                      }}
                    >
                      {formatUserBalance(userBalance)}
                    </span>
                  </p>
                </div>
              </div>

              {/* 3D Tabs Card */}
              <div
                className="mx-4 rounded-xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 6px 12px -3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="flex">
                  {[
                    { key: "holdings", label: "Holdings" },
                    { key: "history", label: "History" },
                    { key: "about", label: "About" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                        activeTab === tab.key
                          ? "text-blue-400 border-b-2 border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 pb-40">
                {activeTab === "holdings" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      My Balance
                    </h3>
                    {/* 3D Card with depth effect */}
                    <div
                      className="relative rounded-xl p-3 flex items-center justify-between overflow-hidden"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 15px 30px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {/* Subtle glow effect */}
                      <div
                        className="absolute inset-0 opacity-20 rounded-xl"
                        style={{
                          background:
                            "radial-gradient(ellipse at 30% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                        }}
                      />

                      <div className="flex items-center gap-3 relative z-10">
                        {/* 3D Logo matching dashboard style */}
                        <div
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                          style={{
                            boxShadow: `0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255,255,255,0.2)`,
                          }}
                        >
                          {/* Inner glow */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                          <CryptoIcon
                            symbol={asset.symbol}
                            size="md"
                            showNetwork={true}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">
                            {asset.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {asset.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <div className="font-bold text-white text-xl">
                          {formatAmount(asset.value, 2)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {asset.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </div>
                      </div>
                    </div>
                    {/* Bottom margin spacer */}
                    <div className="mb-16"></div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recent Transactions
                    </h3>
                    {history.length > 0 ? (
                      <div className="space-y-4">
                        {history.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => {
                              // Convert to DetailedTransaction format
                              // Use fiatValue from API (deposit-time value) NOT current price
                              const txAmount =
                                typeof tx.amount === "number"
                                  ? tx.amount
                                  : parseFloat(tx.amount) || 0;
                              // fiatValue is the stored deposit value in user's currency
                              // Only fall back to calculation if fiatValue is truly not available
                              const txValue =
                                tx.fiatValue != null &&
                                tx.fiatValue !== undefined
                                  ? tx.fiatValue
                                  : tx.price
                                  ? tx.price * txAmount
                                  : 0;

                              const detailedTx: DetailedTransaction = {
                                id:
                                  tx.id?.toString() ||
                                  tx.paymentId ||
                                  `tx-${Date.now()}`,
                                type: tx.type as
                                  | "buy"
                                  | "sell"
                                  | "deposit"
                                  | "withdraw"
                                  | "convert"
                                  | "transfer"
                                  | "send"
                                  | "receive"
                                  | "swap",
                                asset:
                                  tx.type === "swap"
                                    ? tx.isFromAssetView
                                      ? tx.fromAsset
                                      : tx.toAsset
                                    : tx.cryptoCurrency || asset.symbol,
                                amount:
                                  tx.type === "swap"
                                    ? tx.isFromAssetView
                                      ? tx.fromAmount
                                      : tx.toAmount
                                    : txAmount,
                                value:
                                  tx.type === "swap"
                                    ? tx.isFromAssetView
                                      ? tx.fromValueUSD
                                      : tx.toValueUSD
                                    : txValue,
                                timestamp: new Date(tx.date).toLocaleString(),
                                status: (tx.status?.toLowerCase() ===
                                  "completed" ||
                                tx.status?.toLowerCase() === "closed"
                                  ? "completed"
                                  : tx.status?.toLowerCase() === "pending" ||
                                    tx.status?.toLowerCase() === "confirming"
                                  ? "pending"
                                  : "failed") as
                                  | "completed"
                                  | "pending"
                                  | "failed",
                                fee: tx.fee || undefined,
                                method:
                                  tx.method || tx.paymentMethod || undefined,
                                date: new Date(tx.date),
                                currency: tx.currency || preferredCurrency,
                                valueCurrency: tx.fiatCurrency || undefined,
                                rate: tx.price || undefined,
                                hash: tx.hash || tx.txHash || undefined,
                                network: tx.network || undefined,
                                address:
                                  tx.address || tx.payAddress || undefined,
                                confirmations: tx.confirmations,
                                maxConfirmations: tx.maxConfirmations || 6,
                                // Swap-specific fields
                                ...(tx.type === "swap" && {
                                  fromAsset: tx.fromAsset,
                                  toAsset: tx.toAsset,
                                  fromAmount: tx.fromAmount,
                                  toAmount: tx.toAmount,
                                  fromPriceUSD: tx.fromPriceUSD,
                                  toPriceUSD: tx.toPriceUSD,
                                  fromValueUSD: tx.fromValueUSD,
                                  toValueUSD: tx.toValueUSD,
                                  swapRate: tx.swapRate,
                                }),
                              };
                              setSelectedTransaction(detailedTx);
                              setShowTransactionDetails(true);
                            }}
                            className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer active:scale-[0.99]"
                            style={{
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 6px 12px -3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    tx.type === "buy" ||
                                    tx.type === "deposit" ||
                                    tx.type === "receive" ||
                                    (tx.type === "swap" && !tx.isFromAssetView)
                                      ? "bg-green-500/20"
                                      : tx.type === "sell" ||
                                        tx.type === "send" ||
                                        (tx.type === "swap" &&
                                          tx.isFromAssetView)
                                      ? "bg-red-500/20"
                                      : "bg-blue-500/20"
                                  }`}
                                >
                                  <span
                                    className={`text-lg ${
                                      tx.type === "buy" ||
                                      tx.type === "deposit" ||
                                      tx.type === "receive" ||
                                      (tx.type === "swap" &&
                                        !tx.isFromAssetView)
                                        ? "text-green-400"
                                        : tx.type === "sell" ||
                                          tx.type === "send" ||
                                          (tx.type === "swap" &&
                                            tx.isFromAssetView)
                                        ? "text-red-400"
                                        : "text-blue-400"
                                    }`}
                                  >
                                    {tx.type === "buy" ||
                                    tx.type === "deposit" ||
                                    tx.type === "receive"
                                      ? "↓"
                                      : tx.type === "sell" || tx.type === "send"
                                      ? "↑"
                                      : tx.type === "swap"
                                      ? "⇄"
                                      : "↔"}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-white capitalize text-base">
                                    {tx.type === "swap"
                                      ? `Swapped ${tx.fromAsset} → ${tx.toAsset}`
                                      : `${tx.type} ${
                                          tx.cryptoCurrency || asset.symbol
                                        }`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(tx.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tx.status?.toLowerCase() === "completed" ||
                                    tx.status?.toLowerCase() === "closed"
                                      ? "bg-green-500/20 text-green-400"
                                      : tx.status?.toLowerCase() ===
                                          "pending" ||
                                        tx.status?.toLowerCase() ===
                                          "confirming"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {tx.status || "completed"}
                                </div>
                                {/* Chevron indicator for clickable */}
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>

                            <div className="flex items-end justify-between pt-2 border-t border-gray-700/50">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {tx.type === "swap"
                                    ? tx.isFromAssetView
                                      ? "Sent"
                                      : "Received"
                                    : "Amount"}
                                </div>
                                <div
                                  className={`font-bold text-lg ${
                                    tx.type === "buy" ||
                                    tx.type === "deposit" ||
                                    tx.type === "receive" ||
                                    (tx.type === "swap" && !tx.isFromAssetView)
                                      ? "text-green-400"
                                      : tx.type === "sell" ||
                                        tx.type === "send" ||
                                        (tx.type === "swap" &&
                                          tx.isFromAssetView)
                                      ? "text-red-400"
                                      : "text-white"
                                  }`}
                                >
                                  {tx.type === "swap" ? (
                                    tx.isFromAssetView ? (
                                      <>
                                        -
                                        {Number(tx.fromAmount).toLocaleString(
                                          undefined,
                                          { maximumFractionDigits: 8 }
                                        )}{" "}
                                        {tx.fromAsset}
                                      </>
                                    ) : (
                                      <>
                                        +
                                        {Number(tx.toAmount).toLocaleString(
                                          undefined,
                                          { maximumFractionDigits: 8 }
                                        )}{" "}
                                        {tx.toAsset}
                                      </>
                                    )
                                  ) : (
                                    <>
                                      {tx.type === "buy" ||
                                      tx.type === "deposit" ||
                                      tx.type === "receive"
                                        ? "+"
                                        : tx.type === "sell" ||
                                          tx.type === "send"
                                        ? "-"
                                        : ""}
                                      {typeof tx.amount === "number"
                                        ? tx.amount.toLocaleString(undefined, {
                                            maximumFractionDigits: 8,
                                          })
                                        : tx.amount}{" "}
                                      {tx.cryptoCurrency || asset.symbol}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500 mb-1">
                                  {tx.type === "swap"
                                    ? "Exchange Rate"
                                    : "Value"}
                                </div>
                                <div className="font-semibold text-white">
                                  {/* For swaps, show the exchange rate */}
                                  {tx.type === "swap" ? (
                                    <>
                                      1 {tx.fromAsset} ={" "}
                                      {Number(tx.swapRate).toLocaleString(
                                        undefined,
                                        { maximumFractionDigits: 6 }
                                      )}{" "}
                                      {tx.toAsset}
                                    </>
                                  ) : /* For deposits/transfers with fiatCurrency, show in that currency without conversion */
                                  /* For trades (no fiatCurrency), price is in USD so use formatAmount to convert */
                                  tx.fiatCurrency && tx.fiatValue ? (
                                    tx.fiatCurrency === preferredCurrency ? (
                                      formatCurrencyUtil(
                                        tx.fiatValue,
                                        tx.fiatCurrency,
                                        2
                                      )
                                    ) : tx.fiatValueUSD ? (
                                      formatAmount(tx.fiatValueUSD, 2)
                                    ) : (
                                      formatCurrencyUtil(
                                        tx.fiatValue,
                                        tx.fiatCurrency,
                                        2
                                      )
                                    )
                                  ) : (
                                    formatAmount(
                                      tx.price *
                                        (typeof tx.amount === "number"
                                          ? tx.amount
                                          : parseFloat(tx.amount)),
                                      2
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center border border-slate-600/30">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <h4 className="text-white font-medium mb-2">
                          No {asset.symbol} Transactions Yet
                        </h4>
                        <p className="text-gray-400 text-sm mb-1">
                          Your {asset.name} transaction history will appear here
                        </p>
                        <p className="text-gray-500 text-xs mb-6">
                          Start trading to see your buy, sell, send, and receive
                          activity
                        </p>
                        <button
                          onClick={handleBuy}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/25"
                        >
                          Buy {asset.symbol}
                        </button>
                        <p className="text-gray-500 text-xs mt-4">
                          Looking for a specific transaction?{" "}
                          <a
                            href={`https://blockchain.com/explorer/search?search=${asset.symbol}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            Check blockchain explorer
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "about" && info && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        About {asset.symbol}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {info.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Stats
                      </h3>
                      <div className="space-y-4">
                        {/* Market Cap - 3D Card */}
                        <div
                          className="relative rounded-xl p-4 flex justify-between items-center overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow:
                              "0 15px 30px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        >
                          {/* Subtle glow effect */}
                          <div
                            className="absolute inset-0 opacity-20 rounded-xl pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(ellipse at 30% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                            }}
                          />
                          <span className="text-gray-400 relative z-10">
                            Market cap
                          </span>
                          <span className="font-semibold text-white relative z-10">
                            {marketData?.marketCap || info?.marketCap || "—"}
                          </span>
                        </div>

                        {/* Circulating Supply - 3D Card */}
                        <div
                          className="relative rounded-xl p-4 flex justify-between items-center overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow:
                              "0 15px 30px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        >
                          {/* Subtle glow effect */}
                          <div
                            className="absolute inset-0 opacity-20 rounded-xl pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
                            }}
                          />
                          <span className="text-gray-400 relative z-10">
                            Circulating Supply
                          </span>
                          <span className="font-semibold text-white relative z-10">
                            {marketData?.circulatingSupply ||
                              info?.circulatingSupply ||
                              "—"}
                          </span>
                        </div>

                        {/* Total Supply - 3D Card */}
                        <div
                          className="relative rounded-xl p-4 flex justify-between items-center overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow:
                              "0 15px 30px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                          }}
                        >
                          {/* Subtle glow effect */}
                          <div
                            className="absolute inset-0 opacity-20 rounded-xl pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(ellipse at 70% 0%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)",
                            }}
                          />
                          <span className="text-gray-400 relative z-10">
                            Total Supply
                          </span>
                          <span className="font-semibold text-white relative z-10">
                            {marketData?.totalSupply ||
                              info?.totalSupply ||
                              "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Links
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {info.links.website && (
                          <a
                            href={info.links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 group overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow:
                                "0 8px 20px -4px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                            }}
                          >
                            {/* Hover glow effect */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"
                              style={{
                                background:
                                  "radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
                              }}
                            />
                            <svg
                              className="w-5 h-5 text-blue-400 relative z-10"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                            <span className="relative z-10">
                              Official Website
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors relative z-10"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar - Unique Branded Design */}
              <div
                className="fixed bottom-0 left-0 right-0 z-[9999] p-2"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 -10px 40px -10px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="flex justify-center gap-2 max-w-lg mx-auto">
                  {/* Send Button - Purple */}
                  <button
                    onClick={handleSend}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #8b5cf6 0%, #6d28d9 100%)",
                        boxShadow:
                          "0 4px 12px -2px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 group-hover:text-purple-400 transition-colors">
                      Send
                    </span>
                  </button>

                  {/* Receive Button - Teal */}
                  <button
                    onClick={handleReceive}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(20, 184, 166, 0.3)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #14b8a6 0%, #0d9488 100%)",
                        boxShadow:
                          "0 4px 12px -2px rgba(20, 184, 166, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 group-hover:text-teal-400 transition-colors">
                      Receive
                    </span>
                  </button>

                  {/* Swap Button - Cyan */}
                  <button
                    onClick={handleSwap}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)",
                        boxShadow:
                          "0 4px 12px -2px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 group-hover:text-cyan-400 transition-colors">
                      Swap
                    </span>
                  </button>

                  {/* Buy Button - Green */}
                  <button
                    onClick={handleBuy}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)",
                        boxShadow:
                          "0 4px 12px -2px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 group-hover:text-green-400 transition-colors">
                      Buy
                    </span>
                  </button>

                  {/* Sell Button - Orange/Red */}
                  <button
                    onClick={handleSell}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow:
                        "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #f97316 0%, #ea580c 100%)",
                        boxShadow:
                          "0 4px 12px -2px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-300 group-hover:text-orange-400 transition-colors">
                      Sell
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Asset-Specific Action Modals */}
          <AssetSendModal
            isOpen={showSendModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
          />

          <AssetReceiveModal
            isOpen={showReceiveModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
          />

          <AssetSwapModal
            isOpen={showSwapModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
            availableAssets={allAssets.map((a) => ({
              symbol: a.symbol,
              name: a.name,
              amount: a.amount,
              price: a.value / a.amount || 0,
            }))}
          />

          <BuyCryptoModal
            isOpen={showBuyModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              price: currentPrice,
            }}
            userBalance={userBalance}
            balanceCurrency={balanceCurrency}
            defaultAmount={selectedBuyAmount}
          />

          <AssetSellModal
            isOpen={showSellModal}
            onClose={closeAllActionModals}
            asset={{
              symbol: asset?.symbol || "",
              name: asset?.name || "",
              amount: asset?.amount || 0,
              price: currentPrice,
            }}
          />

          {/* Transaction Details Modal */}
          <TransactionDetailsModal
            isOpen={showTransactionDetails}
            onClose={() => {
              setShowTransactionDetails(false);
              setSelectedTransaction(null);
            }}
            transaction={selectedTransaction}
          />
        </>
      )}
    </AnimatePresence>
  );
}
