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
import { useTheme } from "@/contexts/ThemeContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from "@/lib/currencies";
import { CRYPTO_METADATA } from "@/lib/crypto-constants";
import { formatCryptoAmount } from "@/lib/format-crypto-amount";

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
  SHIB: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Shiba Inu (SHIB) is a decentralized meme token that grew into a vibrant ecosystem including ShibaSwap DEX, NFTs, and the layer-2 Shibarium blockchain. With an enthusiastic community called the 'Shib Army', SHIB has expanded beyond memes to offer DeFi functionality and real-world utility.",
    links: {
      website: "https://shibatoken.com",
    },
  },
  UNI: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Uniswap (UNI) is the governance token of Uniswap, the largest decentralized exchange (DEX) on Ethereum. Uniswap pioneered automated market maker (AMM) technology, enabling permissionless token swaps. UNI holders can vote on protocol upgrades and treasury allocation.",
    links: {
      website: "https://uniswap.org",
    },
  },
  ATOM: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Cosmos (ATOM) is the 'Internet of Blockchains', enabling different blockchains to communicate through the Inter-Blockchain Communication (IBC) protocol. ATOM is used for staking, governance, and securing the Cosmos Hub. The Cosmos SDK powers some of the largest blockchain projects.",
    links: {
      website: "https://cosmos.network",
    },
  },
  NEAR: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "NEAR Protocol is a user-friendly, carbon-neutral blockchain featuring sharding technology for unlimited scalability. With its account-based model (similar to email addresses), NEAR makes blockchain accessible to mainstream users while offering lightning-fast transactions and low fees.",
    links: {
      website: "https://near.org",
    },
  },
  FIL: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Filecoin (FIL) is a decentralized storage network that turns cloud storage into an algorithmic market. Storage providers earn FIL by offering hard drive space, while users pay FIL to store and retrieve data. Filecoin aims to store humanity's most important information.",
    links: {
      website: "https://filecoin.io",
    },
  },
  APT: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Aptos (APT) is a Layer 1 blockchain developed by former Meta engineers, featuring the Move programming language originally created for Facebook's Diem project. With parallel transaction execution and sub-second finality, Aptos delivers exceptional performance and security for Web3 applications.",
    links: {
      website: "https://aptoslabs.com",
    },
  },
  ARB: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Arbitrum (ARB) is a leading Ethereum Layer 2 solution using Optimistic Rollup technology to provide faster and cheaper transactions while maintaining Ethereum's security. ARB is the governance token allowing holders to vote on protocol upgrades and treasury decisions.",
    links: {
      website: "https://arbitrum.io",
    },
  },
  OP: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Optimism (OP) is an Ethereum Layer 2 scaling solution built with Optimistic Rollup technology. OP token holders govern the Optimism Collective, a digital democratic system funding public goods. Optimism's vision is to scale Ethereum while maintaining its values of decentralization and security.",
    links: {
      website: "https://optimism.io",
    },
  },
  AAVE: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Aave (AAVE) is a leading decentralized lending protocol where users can lend, borrow, and earn interest on crypto assets. Innovations include flash loans, credit delegation, and rate switching. AAVE holders receive governance rights and protocol fee discounts.",
    links: {
      website: "https://aave.com",
    },
  },
  MKR: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Maker (MKR) is the governance token of MakerDAO, the decentralized organization behind DAI stablecoin. MKR holders vote on critical parameters like collateral types, stability fees, and risk management. MKR is burned when system fees are paid, creating deflationary pressure.",
    links: {
      website: "https://makerdao.com",
    },
  },
  INJ: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Injective (INJ) is a lightning-fast blockchain built specifically for finance. It offers decentralized spot and derivatives trading with zero gas fees, front-running resistance, and cross-chain compatibility. INJ is used for governance, staking, and protocol fee burning.",
    links: {
      website: "https://injective.com",
    },
  },
  SUI: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Sui (SUI) is a Layer 1 blockchain leveraging the Move programming language for enhanced security and parallel transaction execution. Designed by former Meta engineers, Sui delivers instant transaction finality and horizontal scaling, making it ideal for high-throughput applications and gaming.",
    links: {
      website: "https://sui.io",
    },
  },
  SEI: {
    price: 0,
    marketCap: "",
    circulatingSupply: "",
    totalSupply: "",
    description:
      "Sei (SEI) is the fastest Layer 1 blockchain, purpose-built for trading. With sub-second finality and 20,000+ TPS, Sei uses a novel consensus mechanism optimized for DeFi applications. SEI token is used for staking, governance, and transaction fees.",
    links: {
      website: "https://www.sei.io",
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
  const { preferredCurrency, formatAmount, convertAmount, exchangeRates } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const cryptoColor = CRYPTO_METADATA[asset?.symbol || ""]?.color || "#F7931A";

  // Currency accent colors based on dominant flag color
  const getCurrencyAccentColor = (currency: string): { primary: string; secondary: string; glow: string } => {
    const colors: Record<string, { primary: string; secondary: string; glow: string }> = {
      BRL: { primary: "#009C3B", secondary: "#FFDF00", glow: "rgba(0,156,59,0.4)" },
      USD: { primary: "#3C3B6E", secondary: "#B22234", glow: "rgba(178,34,52,0.4)" },
      EUR: { primary: "#003399", secondary: "#FFCC00", glow: "rgba(0,51,153,0.4)" },
      GBP: { primary: "#CF142B", secondary: "#00247D", glow: "rgba(207,20,43,0.4)" },
      NGN: { primary: "#008751", secondary: "#FFFFFF", glow: "rgba(0,135,81,0.4)" },
      ZAR: { primary: "#007A4D", secondary: "#FFB612", glow: "rgba(0,122,77,0.4)" },
      KES: { primary: "#BB0000", secondary: "#006600", glow: "rgba(187,0,0,0.4)" },
      GHS: { primary: "#006B3F", secondary: "#FCD116", glow: "rgba(0,107,63,0.4)" },
      JPY: { primary: "#BC002D", secondary: "#FFFFFF", glow: "rgba(188,0,45,0.4)" },
      CAD: { primary: "#FF0000", secondary: "#FFFFFF", glow: "rgba(255,0,0,0.4)" },
      AUD: { primary: "#00008B", secondary: "#FF0000", glow: "rgba(0,0,139,0.4)" },
      CHF: { primary: "#FF0000", secondary: "#FFFFFF", glow: "rgba(255,0,0,0.4)" },
      CNY: { primary: "#DE2910", secondary: "#FFDE00", glow: "rgba(222,41,16,0.4)" },
      INR: { primary: "#FF9933", secondary: "#138808", glow: "rgba(255,153,51,0.4)" },
      MXN: { primary: "#006847", secondary: "#CE1126", glow: "rgba(0,104,71,0.4)" },
      TRY: { primary: "#E30A17", secondary: "#FFFFFF", glow: "rgba(227,10,23,0.4)" },
      SAR: { primary: "#006C35", secondary: "#FFFFFF", glow: "rgba(0,108,53,0.4)" },
      AED: { primary: "#00732F", secondary: "#FF0000", glow: "rgba(0,115,47,0.4)" },
      SGD: { primary: "#EF3340", secondary: "#FFFFFF", glow: "rgba(239,51,64,0.4)" },
      KGS: { primary: "#E8112D", secondary: "#FFCC00", glow: "rgba(232,17,45,0.4)" },
      KZT: { primary: "#00AFCA", secondary: "#FFE800", glow: "rgba(0,175,202,0.4)" },
      UZS: { primary: "#1EB53A", secondary: "#0099B5", glow: "rgba(30,181,58,0.4)" },
      PKR: { primary: "#01411C", secondary: "#FFFFFF", glow: "rgba(1,65,28,0.4)" },
      BDT: { primary: "#006A4E", secondary: "#F42A41", glow: "rgba(0,106,78,0.4)" },
      EGP: { primary: "#CE1126", secondary: "#000000", glow: "rgba(206,17,38,0.4)" },
      MAD: { primary: "#C1272D", secondary: "#006233", glow: "rgba(193,39,45,0.4)" },
      DZD: { primary: "#006233", secondary: "#D21034", glow: "rgba(0,98,51,0.4)" },
      KWD: { primary: "#007A3D", secondary: "#CE1126", glow: "rgba(0,122,61,0.4)" },
      QAR: { primary: "#8D1B3D", secondary: "#FFFFFF", glow: "rgba(141,27,61,0.4)" },
      THB: { primary: "#A51931", secondary: "#2D2A4A", glow: "rgba(165,25,49,0.4)" },
      IDR: { primary: "#CE1126", secondary: "#FFFFFF", glow: "rgba(206,17,38,0.4)" },
      MYR: { primary: "#CC0001", secondary: "#010066", glow: "rgba(204,0,1,0.4)" },
      VND: { primary: "#DA251D", secondary: "#FFFF00", glow: "rgba(218,37,29,0.4)" },
      TWD: { primary: "#FE0000", secondary: "#000095", glow: "rgba(254,0,0,0.4)" },
      HKD: { primary: "#DE2910", secondary: "#FFDE00", glow: "rgba(222,41,16,0.4)" },
      KRW: { primary: "#CD2E3A", secondary: "#003478", glow: "rgba(205,46,58,0.4)" },
      CZK: { primary: "#D7141A", secondary: "#11457E", glow: "rgba(215,20,26,0.4)" },
      PLN: { primary: "#DC143C", secondary: "#FFFFFF", glow: "rgba(220,20,60,0.4)" },
      HUF: { primary: "#CE2939", secondary: "#477050", glow: "rgba(206,41,57,0.4)" },
      RON: { primary: "#002B7F", secondary: "#FCD116", glow: "rgba(0,43,127,0.4)" },
      CLP: { primary: "#D52B1E", secondary: "#003087", glow: "rgba(213,43,30,0.4)" },
      COP: { primary: "#FCD116", secondary: "#003087", glow: "rgba(252,209,22,0.4)" },
      ARS: { primary: "#74ACDF", secondary: "#FFFFFF", glow: "rgba(116,172,223,0.4)" },
      PEN: { primary: "#D91023", secondary: "#FFFFFF", glow: "rgba(217,16,35,0.4)" },
    };
    return colors[currency] || { primary: "#6366f1", secondary: "#818cf8", glow: "rgba(99,102,241,0.4)" };
  };

  // Helper to format user balance - always show in user's preferred currency
  const formatUserBalance = (balance: number): string => {
    // Use the shared getCurrencySymbol function which supports all currencies
    const symbol = getCurrencySymbol(preferredCurrency);
    
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      return `${symbol}${balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Different currency - need to convert from balanceCurrency to preferredCurrency
    // First convert from balanceCurrency to USD, then formatAmount converts USD to preferredCurrency
    if (balanceCurrency === "USD") {
      // Already in USD, just format to preferred currency
      return formatAmount(balance, 2);
    }
    // Convert from balanceCurrency to USD first
    // exchangeRates is { "BRL": 5.36, "EUR": 0.95, ... } (rate to convert 1 USD to that currency)
    const rate = exchangeRates?.[balanceCurrency] ?? 1;
    const balanceInUSD = rate > 0 ? balance / rate : balance;
    // Now convert from USD to preferredCurrency
    return formatAmount(balanceInUSD, 2);
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
  
  // Set initial buy amount when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialAmountUSD = 15; // First quick buy amount
      const convertedInitial = Math.round(convertAmount(initialAmountUSD));
      setSelectedBuyAmount(convertedInitial);
    }
  }, [isOpen, convertAmount]);

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
  // Buy amount state - will be set dynamically based on user's currency
  const [selectedBuyAmount, setSelectedBuyAmount] = useState<number>(0);

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
      NEAR: { marketCap: "$6B", circulatingSupply: "1.2B NEAR", totalSupply: "∞" },
      FIL: { marketCap: "$3B", circulatingSupply: "620M FIL", totalSupply: "2B FIL" },
      APT: { marketCap: "$4.5B", circulatingSupply: "540M APT", totalSupply: "1B APT" },
      ARB: { marketCap: "$7B", circulatingSupply: "4.3B ARB", totalSupply: "10B ARB" },
      OP: { marketCap: "$3.5B", circulatingSupply: "1.2B OP", totalSupply: "4.3B OP" },
      AAVE: { marketCap: "$2.5B", circulatingSupply: "15M AAVE", totalSupply: "16M AAVE" },
      MKR: { marketCap: "$2B", circulatingSupply: "1M MKR", totalSupply: "1M MKR" },
      INJ: { marketCap: "$3B", circulatingSupply: "110M INJ", totalSupply: "150M INJ" },
      SUI: { marketCap: "$5B", circulatingSupply: "2.9B SUI", totalSupply: "10B SUI" },
      SEI: { marketCap: "$2.5B", circulatingSupply: "3.8B SEI", totalSupply: "10B SEI" },
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

  // Quick buy amounts in USD - these get converted to user's preferred currency
  const quickBuyAmountsUSD = [15, 25, 50, 100];

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
              className={`${isDark ? "bg-gray-900" : "bg-gray-50"} w-full h-full overflow-y-auto`}
              style={{ minHeight: "100vh", height: "100%" }}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={onClose}
                  className={`${isDark ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                  <h1 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {asset.symbol}
                  </h1>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>COIN | {asset.name}</p>
                </div>
                <button
                  onClick={() => setIsStarred(!isStarred)}
                  className={`transition-colors ${
                    isStarred ? "text-yellow-500" : "text-gray-500"
                  }`}
                  aria-label="Add to favorites"
                >
                  <Star size={20} fill={isStarred ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Price Section */}
              <div className={`p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                {/* Network Fee Indicator - Shows estimated transfer fee for this asset */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>⛽</span>
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                  <div className={`text-4xl md:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>
                    {formatAmount(currentPrice, 2)}
                  </div>
                  <div
                    className={`flex items-center justify-center gap-1 ${
                      priceChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <span className="text-xs">
                      {priceChange >= 0 ? "↑" : "↓"}
                    </span>
                    <span className="text-xs font-medium">
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
                          : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {/* Buy Now Section - 3D Card Style */}
                <div
                  className="rounded-xl p-4 mb-6"
                  style={isDark ? {
                    background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                    boxShadow: "0 28px 70px -10px rgba(0, 0, 0, 0.95), 0 14px 32px -5px rgba(0, 0, 0, 0.80), 0 5px 14px -2px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4), inset 1px 0 0 rgba(255,255,255,0.05), inset -1px 0 0 rgba(0,0,0,0.2)",
                    border: "none",
                  } : {
                    background: "linear-gradient(160deg, #ffffff 0%, #f1f5f9 100%)",
                    boxShadow: "0 28px 80px -10px rgba(0,0,0,0.48), 0 14px 38px -5px rgba(0,0,0,0.32), 0 5px 16px -3px rgba(0,0,0,0.18)",
                    border: "none",
                  }}
                >
                  {/* Header row with amount and Buy button */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"} mb-1`}>
                        Buy now
                      </h3>
                      <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {getCurrencySymbol(preferredCurrency)}{selectedBuyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                        <span className={`${isDark ? "text-gray-400" : "text-gray-500"} text-lg font-medium`}>
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
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {quickBuyAmountsUSD.map((usdAmount) => {
                      // Convert USD amount to user's preferred currency for display and storage
                      const convertedAmount = Math.round(convertAmount(usdAmount));
                      return (
                        <button
                          key={usdAmount}
                          onClick={() => setSelectedBuyAmount(convertedAmount)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedBuyAmount === convertedAmount
                              ? "text-white"
                              : isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                          }`}
                          style={
                            selectedBuyAmount === convertedAmount
                              ? {
                                  background:
                                    "linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)",
                                  boxShadow:
                                    "0 4px 12px -2px rgba(37, 99, 235, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                                  border: "1px solid rgba(59, 130, 246, 0.4)",
                                }
                              : isDark ? {
                                  background: "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                                  boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                                  border: "1px solid rgba(255, 255, 255, 0.06)",
                                } : {
                                  background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                                  boxShadow: "0 2px 6px -1px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                                  border: "1px solid rgba(0,0,0,0.08)",
                                }
                          }
                        >
                          {getCurrencySymbol(preferredCurrency)}{convertedAmount}
                        </button>
                      );
                    })}
                  </div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Buying {(convertAmount(selectedBuyAmount, true) / currentPrice).toFixed(5)}{" "}
                    {asset.symbol} from available balance:{" "}
                    <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatUserBalance(userBalance)}
                    </span>
                  </p>
                </div>
              </div>

              {/* 3D Tabs Card */}
              <div
                className="mx-4 rounded-xl overflow-hidden"
                style={isDark ? {
                  background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                  boxShadow: "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                  border: "none",
                } : {
                  background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                  border: "none",
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
                          : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
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
                    <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>
                      My Balance
                    </h3>
                    {/* 3D Card with depth effect */}
                    <div
                      className="relative rounded-xl px-3 py-2 flex items-center justify-between overflow-hidden"
                      style={isDark ? {
                        background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow: "0 28px 70px -10px rgba(0, 0, 0, 0.95), 0 14px 32px -6px rgba(0, 0, 0, 0.80), 0 6px 14px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                        border: "none",
                      } : {
                        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                        boxShadow: "0 28px 80px -12px rgba(0,0,0,0.50), 0 14px 40px -6px rgba(0,0,0,0.35), 0 6px 16px -3px rgba(0,0,0,0.22)",
                        border: "none",
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

                      <div className="flex items-center gap-2 relative z-10">
                        {/* Logo */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 relative"
                          style={isDark ? {
                            background: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
                            boxShadow: `0 6px 20px rgba(0, 0, 0, 0.7), 0 0 16px ${cryptoColor}50, inset 0 1px 2px rgba(255,255,255,0.15)`,
                            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                          } : {
                            background: "#ffffff",
                            boxShadow: `0 6px 18px rgba(0,0,0,0.18), 0 0 14px ${cryptoColor}40, inset 0 1px 0 rgba(255,255,255,1)`,
                            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                          }}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                          <CryptoIcon
                            symbol={asset.symbol}
                            size="sm"
                            showNetwork={true}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <div>
                          <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"} text-sm`}>
                            {asset.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs`}>
                              {asset.symbol}
                            </div>
                            <div
                              className={`inline-flex items-center gap-px px-1 py-px rounded-full text-[10px] font-semibold ${
                                priceChange >= 0
                                  ? isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"
                                  : isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {priceChange >= 0 ? "▲" : "▼"}{" "}
                              {Math.abs(priceChange).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <div
                          className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {formatAmount(asset.value, 2)}
                        </div>
                        <div className={`${isDark ? "text-gray-300" : "text-gray-600"} text-xs`}>
                          {formatCryptoAmount(asset.amount, 18)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>
                      Recent Transactions
                    </h3>
                    {history.length > 0 ? (
                      <div className="space-y-2">
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
                            className="rounded-xl p-2 transition-all duration-200 hover:scale-[1.01] cursor-pointer active:scale-[0.99]"
                            style={isDark ? {
                              background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow: "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                              border: "none",
                            } : {
                              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                              boxShadow: "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                              border: "none",
                            }}
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
                                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
                                >
                                  <span
                                    className={`text-sm ${
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
                                  <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} capitalize text-sm`}>
                                    {tx.type === "swap"
                                      ? `${tx.fromAsset} → ${tx.toAsset}`
                                      : `${tx.type} ${
                                          tx.cryptoCurrency || asset.symbol
                                        }`}
                                  </div>
                                  <div className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {new Date(tx.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`px-1 py-[2px] rounded-md text-[9px] font-bold uppercase shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${
                                      tx.status?.toLowerCase() === "completed" ||
                                      tx.status?.toLowerCase() === "closed"
                                        ? isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600 border border-green-400"
                                        : tx.status?.toLowerCase() ===
                                            "pending" ||
                                          tx.status?.toLowerCase() ===
                                            "confirming"
                                        ? isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-50 text-yellow-600 border border-yellow-400"
                                        : isDark ? "bg-gray-500/20 text-gray-400" : "bg-red-50 text-red-500 border border-red-400"
                                    }`}
                                  >
                                    {tx.status || "completed"}
                                  </div>
                                  {/* Chevron indicator for clickable */}
                                  <svg
                                    className="w-3.5 h-3.5 text-gray-500"
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
                                <div className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"} mt-0.5`}>
                                  {new Date(tx.date).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className={`flex justify-between pt-1 border-t ${isDark ? "border-gray-700/50" : "border-gray-200"} mt-1`}>
                              <div className="flex flex-col">
                                <span className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"} font-medium`}>
                                  {tx.type === "swap"
                                    ? tx.isFromAssetView
                                      ? "Swapped:"
                                      : "Received:"
                                    : "Amount:"}
                                </span>
                                <span
                                  className={`font-bold text-[11px] px-1.5 py-0.5 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${isDark ? "bg-gray-800" : "bg-gray-200"} ${
                                    tx.type === "buy" ||
                                    tx.type === "deposit" ||
                                    tx.type === "receive" ||
                                    (tx.type === "swap" && !tx.isFromAssetView)
                                      ? isDark ? "text-green-500" : "text-green-600"
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
                                        {formatCryptoAmount(Number(tx.fromAmount), 14)}{" "}
                                        {tx.fromAsset}
                                      </>
                                    ) : (
                                      <>
                                        +
                                        {formatCryptoAmount(Number(tx.toAmount), 14)}{" "}
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
                                        ? formatCryptoAmount(tx.amount, 14)
                                        : tx.amount}{" "}
                                      {tx.cryptoCurrency || asset.symbol}
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-[11px] ${isDark ? "text-gray-400" : "text-gray-500"} font-medium`}>
                                  Value:
                                </span>
                                <span
                                  className={`font-semibold ${isDark ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"} text-[11px] px-1.5 py-0.5 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.5)]`}
                                >
                                  {/* For swaps, use fromValueUSD or toValueUSD depending on view */}
                                  {tx.type === "swap" ? (
                                    formatAmount(
                                      tx.isFromAssetView
                                        ? tx.fromValueUSD || 0
                                        : tx.toValueUSD || 0,
                                      2
                                    )
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
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${isDark ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/30" : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300/50"} flex items-center justify-center border`}>
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
                        <h4 className={`${isDark ? "text-white" : "text-gray-900"} font-medium mb-2`}>
                          No {asset.symbol} Transactions Yet
                        </h4>
                        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm mb-1`}>
                          Your {asset.name} transaction history will appear here
                        </p>
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs mb-6`}>
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
                      <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>
                        About {asset.symbol}
                      </h3>
                      <p className={`${isDark ? "text-gray-400" : "text-gray-600"} leading-relaxed`}>
                        {info.description}
                      </p>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>
                        Stats
                      </h3>
                      <div className="space-y-4">
                        {/* Market Cap - 3D Card */}
                        <div
                          className="relative rounded-xl p-4 flex justify-between items-center overflow-hidden"
                          style={isDark ? {
                            background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow: "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "none",
                          } : {
                            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                            boxShadow: "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                            border: "none",
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
                          <span className={`${isDark ? "text-gray-400" : "text-gray-500"} relative z-10`}>
                            Market cap
                          </span>
                          <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} relative z-10`}>
                            {marketData?.marketCap || info?.marketCap || "—"}
                          </span>
                        </div>

                        {/* Circulating Supply - 3D Card */}
                        <div
                          className="relative rounded-xl p-4 flex justify-between items-center overflow-hidden"
                          style={isDark ? {
                            background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow: "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "none",
                          } : {
                            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                            boxShadow: "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                            border: "none",
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
                          <span className={`${isDark ? "text-gray-400" : "text-gray-500"} relative z-10`}>
                            Circulating Supply
                          </span>
                          <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} relative z-10`}>
                            {marketData?.circulatingSupply ||
                              info?.circulatingSupply ||
                              "—"}
                          </span>
                        </div>

                        {/* Total Supply - 3D Card */}
                        <div
                          className="relative rounded-xl p-4 flex justify-between items-center overflow-hidden"
                          style={isDark ? {
                            background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                            boxShadow: "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                            border: "none",
                          } : {
                            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                            boxShadow: "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                            border: "none",
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
                          <span className={`${isDark ? "text-gray-400" : "text-gray-500"} relative z-10`}>
                            Total Supply
                          </span>
                          <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"} relative z-10`}>
                            {marketData?.totalSupply ||
                              info?.totalSupply ||
                              "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>
                        Links
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {info.links.website && (
                          <a
                            href={info.links.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl ${isDark ? "text-white" : "text-gray-900"} font-medium transition-all duration-200 hover:scale-105 active:scale-95 group overflow-hidden`}
                            style={isDark ? {
                              background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow: "0 24px 60px -8px rgba(0, 0, 0, 0.95), 0 12px 28px -5px rgba(0, 0, 0, 0.80), 0 5px 12px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                              border: "none",
                            } : {
                              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                              boxShadow: "0 24px 70px -10px rgba(0,0,0,0.48), 0 12px 32px -5px rgba(0,0,0,0.32), 0 5px 14px -3px rgba(0,0,0,0.18)",
                              border: "none",
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
                style={isDark ? {
                  background: "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 -10px 40px -10px rgba(0, 0, 0, 0.5)",
                } : {
                  background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 -4px 20px -4px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex justify-center gap-2 max-w-lg mx-auto">
                  {/* Send Button - Purple */}
                  <button
                    onClick={handleSend}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={isDark ? {
                      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                    } : {
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
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
                    <span className={`text-[10px] font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:text-purple-400 transition-colors`}>
                      Send
                    </span>
                  </button>

                  {/* Receive Button - Teal */}
                  <button
                    onClick={handleReceive}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={isDark ? {
                      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(20, 184, 166, 0.3)",
                    } : {
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
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
                    <span className={`text-[10px] font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:text-teal-400 transition-colors`}>
                      Receive
                    </span>
                  </button>

                  {/* Swap Button - Cyan */}
                  <button
                    onClick={handleSwap}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={isDark ? {
                      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                    } : {
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
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
                    <span className={`text-[10px] font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:text-cyan-400 transition-colors`}>
                      Swap
                    </span>
                  </button>

                  {/* Buy Button - Green */}
                  <button
                    onClick={handleBuy}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={isDark ? {
                      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                    } : {
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
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
                    <span className={`text-[10px] font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:text-green-400 transition-colors`}>
                      Buy
                    </span>
                  </button>

                  {/* Sell Button - Orange/Red */}
                  <button
                    onClick={handleSell}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    style={isDark ? {
                      background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                      boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                    } : {
                      background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                      boxShadow: "0 2px 8px -2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
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
                    <span className={`text-[10px] font-semibold ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:text-orange-400 transition-colors`}>
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
