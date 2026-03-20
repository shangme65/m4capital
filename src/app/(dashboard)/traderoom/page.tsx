"use client";

import { useEffect, useState, Suspense, useTransition, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CryptoPricesListSkeleton,
  ChartSkeleton,
  TransactionHistorySkeleton,
} from "@/components/ui/LoadingSkeletons";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  RefreshCw,
  Plus,
  Bell,
  Settings,
  Search,
  Star,
  ChevronDown,
  Activity,
  Zap,
  Briefcase,
  History,
  MessageCircle,
  MessagesSquare,
  Gift,
  Handshake,
  BookOpen,
  MoreHorizontal,
  PieChart,
  TrendingUpIcon,
  Target,
  Users,
  Headphones,
  Grid3X3,
  Grid2X2,
  Info,
  CircleHelp,
  Calculator,
  Crown,
  Camera,
  User,
  ShieldCheck,
  Wallet,
  ArrowDownCircle,
  HelpCircle,
  FileText,
  LogOut,
} from "lucide-react";
import {
  TradingProvider,
  useTradingContext,
} from "@/components/client/EnhancedTradingProvider";
import {
  CryptoMarketProvider,
  useCryptoMarket,
} from "@/components/client/CryptoMarketProvider";
import {
  BitcoinPriceWidget,
  CryptoPriceTicker,
} from "@/components/client/CryptoPriceTicker";
import TradingCalculators from "@/components/client/TradingCalculators";
import RealTimeTradingChart from "@/components/client/RealTimeTradingChart";
import ChartGrid from "@/components/client/ChartGrid";
import ErrorBoundary from "@/components/client/ErrorBoundary";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  fundTraderoomAction,
  fundTraderoomCryptoAction,
  withdrawFromTraderoomAction,
} from "@/actions/traderoom-actions";
import { getCurrencySymbol, formatCurrency } from "@/lib/currencies";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

// Helper to render asset icon - SVG for forex currencies, fallback for others
const AssetFlag = ({ flag, symbol, size = 20 }: { flag: string; symbol: string; size?: number }) => {
  // For forex pairs like "EUR,USD" - render two currency SVG icons
  if (flag.includes(",")) {
    const [first, second] = flag.split(",");
    return (
      <span className="inline-flex items-center -space-x-1">
        <CryptoIcon symbol={first} size="xs" />
        <CryptoIcon symbol={second} size="xs" />
      </span>
    );
  }
  // For single currency/crypto codes (2-8 uppercase letters), use CryptoIcon
  if (/^[A-Z]{2,8}$/.test(flag)) {
    return <CryptoIcon symbol={flag} size="xs" />;
  }
  // For crypto/stocks/other, show text/emoji as-is
  return <span>{flag}</span>;
};

// Active trade interface for binary options
interface ActiveTrade {
  id: string;
  symbol: string;
  direction: "higher" | "lower";
  amount: number;
  entryPrice: number;
  entryTime: number;
  expirationTime: number;
  expirationSeconds: number;
  status: "active" | "won" | "lost" | "pending";
  result?: number;
}

function TradingInterface() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatAmount, preferredCurrency, exchangeRates, convertAmount } = useCurrency();
  const [amount, setAmount] = useState(10000);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("USD/CAD");
  const [expirationSeconds, setExpirationSeconds] = useState(30);
  const [countdown, setCountdown] = useState(expirationSeconds);
  const [isExecutingTrade, setIsExecutingTrade] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<
    "higher" | "lower" | null
  >(null);
  const [showQuickAmounts, setShowQuickAmounts] = useState(false);
  const [tradingMode, setTradingMode] = useState<"binary" | "forex" | "crypto">(
    "binary"
  );
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [addAssetSideTab, setAddAssetSideTab] = useState<"trending" | "options" | "margin" | "watchlist">("trending");
  const [addAssetOptionsSubTab, setAddAssetOptionsSubTab] = useState<"blitz" | "binary" | "digital">("blitz");
  const [addAssetSearch, setAddAssetSearch] = useState("");
  const [addAssetGeoTab, setAddAssetGeoTab] = useState<"worldwide" | "local">("worldwide");
  const [watchlistedSymbols, setWatchlistedSymbols] = useState<string[]>([]);
  const [openTabs, setOpenTabs] = useState([
    { symbol: "USD/CAD", type: "Binary" },
    { symbol: "EUR/USD", type: "Binary" },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showChartGrids, setShowChartGrids] = useState(false);
  const [selectedChartGrid, setSelectedChartGrid] = useState(1);
  const [showTradingHistory, setShowTradingHistory] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [historyFilter, setHistoryFilter] = useState("All Positions");
  const [showMoreItems, setShowMoreItems] = useState(false);
  const [showCalculators, setShowCalculators] = useState(false);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationDropdownPos, setExpirationDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const expirationButtonRef = useRef<HTMLDivElement>(null);
  const [isBalanceDropdownOpen, setIsBalanceDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState<
    "real" | "practice"
  >("real"); // Default to real account
  const [realAccountBalance, setRealAccountBalance] = useState(0); // In user's currency
  const [realAccountBalanceUSD, setRealAccountBalanceUSD] = useState(0); // Converted to USD
  const [balanceCurrency, setBalanceCurrency] = useState("USD"); // User's balance currency
  const [traderoomBalance, setTraderoomBalance] = useState(0); // Always in USD
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundMethod, setFundMethod] = useState<"fiat" | "crypto">("fiat");
  const [fundAmount, setFundAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [isFunding, setIsFunding] = useState(false);
  const [fundingError, setFundingError] = useState("");
  const [cryptoPaymentInfo, setCryptoPaymentInfo] = useState<any>(null);
  const [fundingSuccessMessage, setFundingSuccessMessage] = useState<string | null>(null);
  const practiceAccountBalance = 10000.0; // Practice account default balance
  const [forexRates, setForexRates] = useState<any>({});
  const [showPortfolioPanel, setShowPortfolioPanel] = useState(false);
  const isLoggedIn = status === "authenticated" && session?.user;

  // Hover state for HIGHER/LOWER buttons (IQ Option style overlay)
  const [hoveredButton, setHoveredButton] = useState<"higher" | "lower" | null>(
    null
  );

  // Active trades state for chart markers
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Get trading context for history data
  const { tradeHistory, openPositions } = useTradingContext();

  // Get crypto market data
  const {
    cryptoPrices,
    getCryptoPrice,
    isConnected: cryptoConnected,
  } = useCryptoMarket();

  // Helper function to get forex rate
  const getForexRate = (pair: string) => {
    return forexRates[pair] || null;
  };

  const symbols = [
    // ===== CURRENCY INDICES (NEW) =====
    { symbol: "AUD Index", displayName: "Australian Dollar In.", price: "71.40563", change: "+0.123", percentage: "+0.17%", flag: "AUD", category: "Index" },
    { symbol: "GBP Index", displayName: "Pound Index", price: "134.8180", change: "+0.234", percentage: "+0.17%", flag: "GBP", category: "Index" },
    { symbol: "CAD Index", displayName: "Canadian Dollar Ind.", price: "73.87260", change: "-0.145", percentage: "-0.20%", flag: "CAD", category: "Index" },
    { symbol: "EUR Index", displayName: "Euro Index", price: "116.8683", change: "+0.543", percentage: "+0.47%", flag: "EUR", category: "Index" },
    { symbol: "Dollar Index", price: "99.62505", change: "-0.234", percentage: "-0.23%", flag: "USD", category: "Index" },
    { symbol: "Yen Index", price: "63.44698", change: "+0.123", percentage: "+0.19%", flag: "JPY", category: "Index" },
    // ===== MARKET INDICES =====
    { symbol: "Magnificent 7", price: "2264.468", change: "+45.23", percentage: "+2.04%", flag: "✦", category: "Index" },
    { symbol: "AUS 200", price: "8641.562", change: "+23.45", percentage: "+0.27%", flag: "AUD", category: "Index" },
    { symbol: "EU 50", price: "5661.541", change: "+12.34", percentage: "+0.22%", flag: "EUR", category: "Index" },
    { symbol: "FR 40", price: "7956.030", change: "-34.56", percentage: "-0.43%", flag: "EUR", category: "Index" },
    { symbol: "GER 30", price: "23751.42", change: "+156.23", percentage: "+0.66%", flag: "EUR", category: "Index" },
    // ===== SECTOR INDICES =====
    { symbol: "Airlines", price: "2978.252", change: "+12.34", percentage: "+0.42%", flag: "✈️", category: "Index" },
    { symbol: "Cannabis", price: "1556.239", change: "-5.67", percentage: "-0.36%", flag: "🌿", category: "Index" },
    { symbol: "Casino", price: "2465.190", change: "+34.56", percentage: "+1.42%", flag: "🎰", category: "Index" },
    // ===== FOREX PAIRS =====
    { symbol: "EUR/USD", price: getForexRate("EUR")?.price || "1.08532", change: getForexRate("EUR")?.change || "-0.0023", percentage: `${getForexRate("EUR")?.changePercent >= 0 ? "+" : ""}${getForexRate("EUR")?.changePercent || "-0.21"}%`, flag: "EUR,USD", category: "Forex" },
    { symbol: "GBP/USD", price: getForexRate("GBP")?.price || "1.32165", change: getForexRate("GBP")?.change || "+0.0045", percentage: `${getForexRate("GBP")?.changePercent >= 0 ? "+" : ""}${getForexRate("GBP")?.changePercent || "0.35"}%`, flag: "GBP,USD", category: "Forex" },
    { symbol: "USD/JPY", price: getForexRate("JPY")?.price || "149.235", change: getForexRate("JPY")?.change || "+0.125", percentage: `${getForexRate("JPY")?.changePercent >= 0 ? "+" : ""}${getForexRate("JPY")?.changePercent || "0.08"}%`, flag: "USD,JPY", category: "Forex" },
    { symbol: "USD/CAD", price: getForexRate("CAD")?.price || "1.35742", change: getForexRate("CAD")?.change || "+0.0015", percentage: `${getForexRate("CAD")?.changePercent >= 0 ? "+" : ""}${getForexRate("CAD")?.changePercent || "0.11"}%`, flag: "USD,CAD", category: "Forex" },
    { symbol: "AUD/USD", price: getForexRate("AUD")?.price || "0.67321", change: getForexRate("AUD")?.change || "-0.0012", percentage: `${getForexRate("AUD")?.changePercent >= 0 ? "+" : ""}${getForexRate("AUD")?.changePercent || "-0.18"}%`, flag: "AUD,USD", category: "Forex" },
    { symbol: "AUD/CAD", price: "0.91250", change: "+0.0008", percentage: "+0.09%", flag: "AUD,CAD", category: "Forex" },
    { symbol: "AUD/CHF", price: "0.55839", change: "-0.0012", percentage: "-0.21%", flag: "AUD,CHF", category: "Forex" },
    { symbol: "AUD/JPY", price: "113.0758", change: "+0.345", percentage: "+0.31%", flag: "AUD,JPY", category: "Forex" },
    { symbol: "AUD/NZD", price: "1.18783", change: "+0.0023", percentage: "+0.19%", flag: "AUD,NZD", category: "Forex" },
    { symbol: "CAD/CHF", price: "0.57409", change: "-0.0018", percentage: "-0.31%", flag: "CAD,CHF", category: "Forex" },
    { symbol: "CAD/JPY", price: "116.7675", change: "+0.234", percentage: "+0.20%", flag: "CAD,JPY", category: "Forex" },
    { symbol: "CHF/JPY", price: "201.627", change: "+0.567", percentage: "+0.28%", flag: "CHF,JPY", category: "Forex" },
    { symbol: "EUR/AUD", price: "1.62874", change: "+0.0034", percentage: "+0.21%", flag: "EUR,AUD", category: "Forex" },
    { symbol: "EUR/CAD", price: "1.58147", change: "+0.0021", percentage: "+0.13%", flag: "EUR,CAD", category: "Forex" },
    { symbol: "EUR/CHF", price: "0.90397", change: "-0.0015", percentage: "-0.17%", flag: "EUR,CHF", category: "Forex" },
    { symbol: "EUR/GBP", price: "0.86266", change: "+0.0012", percentage: "+0.14%", flag: "EUR,GBP", category: "Forex" },
    { symbol: "EUR/JPY", price: "182.818", change: "+0.456", percentage: "+0.25%", flag: "EUR,JPY", category: "Forex" },
    { symbol: "EUR/NZD", price: "1.95006", change: "+0.0045", percentage: "+0.23%", flag: "EUR,NZD", category: "Forex" },
    { symbol: "EUR/THB", price: "36.2385", change: "+0.123", percentage: "+0.34%", flag: "EUR,THB", category: "Forex" },
    { symbol: "GBP/AUD", price: "1.88020", change: "+0.0034", percentage: "+0.18%", flag: "GBP,AUD", category: "Forex" },
    { symbol: "GBP/CAD", price: "1.81737", change: "+0.0056", percentage: "+0.31%", flag: "GBP,CAD", category: "Forex" },
    { symbol: "GBP/CHF", price: "1.05276", change: "-0.0023", percentage: "-0.22%", flag: "GBP,CHF", category: "Forex" },
    { symbol: "GBP/JPY", price: "211.890", change: "+0.678", percentage: "+0.32%", flag: "GBP,JPY", category: "Forex" },
    { symbol: "GBP/NZD", price: "2.26695", change: "+0.0089", percentage: "+0.39%", flag: "GBP,NZD", category: "Forex" },
    { symbol: "USD/BRL", price: "4.84483", change: "+0.0234", percentage: "+0.49%", flag: "USD,BRL", category: "Forex" },
    { symbol: "USD/MXN", price: "17.7583", change: "-0.0456", percentage: "-0.26%", flag: "USD,MXN", category: "Forex" },
    // ===== CRYPTO =====
    { symbol: "BTC/USD", price: getCryptoPrice("BTC")?.price?.toLocaleString("en-US", { maximumFractionDigits: 2 }) || "67890.45", change: getCryptoPrice("BTC")?.change24h?.toFixed(2) || "+1234.56", percentage: `${(getCryptoPrice("BTC")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("BTC")?.changePercent24h?.toFixed(2) || "1.85"}%`, flag: "BTC", category: "Crypto" },
    { symbol: "ETH/USD", price: getCryptoPrice("ETH")?.price?.toLocaleString("en-US", { maximumFractionDigits: 2 }) || "2342.043", change: getCryptoPrice("ETH")?.change24h?.toFixed(2) || "-23.45", percentage: `${(getCryptoPrice("ETH")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("ETH")?.changePercent24h?.toFixed(2) || "0.95"}%`, flag: "ETH", category: "Crypto" },
    { symbol: "XRP/USD", price: getCryptoPrice("XRP")?.price?.toLocaleString("en-US", { maximumFractionDigits: 4 }) || "0.6234", change: getCryptoPrice("XRP")?.change24h?.toFixed(4) || "+0.0234", percentage: `${(getCryptoPrice("XRP")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("XRP")?.changePercent24h?.toFixed(2) || "3.89"}%`, flag: "XRP", category: "Crypto" },
    { symbol: "ADA/USD", displayName: "Cardano", price: getCryptoPrice("ADA")?.price?.toFixed(6) || "0.367185", change: getCryptoPrice("ADA")?.change24h?.toFixed(4) || "+0.0089", percentage: `${(getCryptoPrice("ADA")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("ADA")?.changePercent24h?.toFixed(2) || "2.49"}%`, flag: "ADA", category: "Crypto" },
    { symbol: "DOGE/USD", displayName: "Dogecoin", price: getCryptoPrice("DOGE")?.price?.toFixed(6) || "0.106155", change: getCryptoPrice("DOGE")?.change24h?.toFixed(4) || "-0.0023", percentage: `${(getCryptoPrice("DOGE")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("DOGE")?.changePercent24h?.toFixed(2) || "-2.12"}%`, flag: "DOGE", category: "Crypto" },
    { symbol: "DOT/USD", displayName: "Polkadot", price: getCryptoPrice("DOT")?.price?.toFixed(6) || "1.754805", change: getCryptoPrice("DOT")?.change24h?.toFixed(4) || "+0.0345", percentage: `${(getCryptoPrice("DOT")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("DOT")?.changePercent24h?.toFixed(2) || "2.00"}%`, flag: "DOT", category: "Crypto" },
    { symbol: "BCH/USD", displayName: "Bitcoin Cash", price: getCryptoPrice("BCH")?.price?.toFixed(4) || "490.9216", change: getCryptoPrice("BCH")?.change24h?.toFixed(2) || "+8.45", percentage: `${(getCryptoPrice("BCH")?.changePercent24h || 0) >= 0 ? "+" : ""}${getCryptoPrice("BCH")?.changePercent24h?.toFixed(2) || "1.75"}%`, flag: "BCH", category: "Crypto" },
    { symbol: "ARB/USD", displayName: "Arbitrum", price: "0.133475", change: "+0.0023", percentage: "+1.75%", flag: "ARB", category: "Crypto" },
    { symbol: "ATOM/USD", displayName: "Cosmos", price: "1.897285", change: "+0.0345", percentage: "+1.85%", flag: "ATOM", category: "Crypto" },
    { symbol: "EOS/USD", displayName: "Vaulta", price: "0.083095", change: "-0.0012", percentage: "-1.42%", flag: "EOS", category: "Crypto" },
    { symbol: "FET/USD", displayName: "FET", price: "0.274395", change: "+0.0078", percentage: "+2.93%", flag: "FET", category: "Crypto" },
    { symbol: "FLOKI/USD", displayName: "Floki", price: "0.031385", change: "-0.0008", percentage: "-2.49%", flag: "FLOKI", category: "Crypto" },
    { symbol: "FARTCOIN", displayName: "Fartcoin", price: "0.239575", change: "+0.0123", percentage: "+5.42%", flag: "💨", category: "Crypto" },
    // ===== STOCKS =====
    { symbol: "AAPL", displayName: "Apple", price: "246.168", change: "+2.15", percentage: "+0.88%", flag: "🍎", category: "Stocks" },
    { symbol: "TSLA", displayName: "Tesla", price: "247.50", change: "+5.20", percentage: "+2.14%", flag: "🚗", category: "Stocks" },
    { symbol: "NVDA", displayName: "Nvidia", price: "875.30", change: "+12.45", percentage: "+1.44%", flag: "🎮", category: "Stocks" },
    { symbol: "GOOGL", displayName: "Google", price: "142.65", change: "-1.25", percentage: "-0.87%", flag: "🔍", category: "Stocks" },
    { symbol: "MSFT", displayName: "Microsoft", price: "378.90", change: "+3.50", percentage: "+0.93%", flag: "🪟", category: "Stocks" },
    { symbol: "AMZN", displayName: "Amazon", price: "222.17", change: "+2.30", percentage: "+1.05%", flag: "📦", category: "Stocks" },
    { symbol: "META", displayName: "Meta", price: "677.685", change: "+4.20", percentage: "+0.62%", flag: "👤", category: "Stocks" },
    { symbol: "NFLX", displayName: "Netflix", price: "512.40", change: "+8.90", percentage: "+1.77%", flag: "🎬", category: "Stocks" },
    { symbol: "AIG", displayName: "AIG", price: "77.3995", change: "-0.345", percentage: "-0.44%", flag: "🏛️", category: "Stocks" },
    { symbol: "BABA", displayName: "Alibaba Group", price: "144.798", change: "+1.234", percentage: "+0.86%", flag: "🛒", category: "Stocks" },
    { symbol: "BIDU", displayName: "Baidu, Inc. ADR", price: "124.663", change: "-0.567", percentage: "-0.45%", flag: "🔎", category: "Stocks" },
    { symbol: "C", displayName: "Citigroup, Inc", price: "108.063", change: "+0.789", percentage: "+0.74%", flag: "🏦", category: "Stocks" },
    { symbol: "KO", displayName: "Coca-Cola Company", price: "80.0905", change: "+0.345", percentage: "+0.43%", flag: "🥤", category: "Stocks" },
    { symbol: "FONE", displayName: "Formula One Group", price: "48.7250", change: "+0.234", percentage: "+0.48%", flag: "🏎️", category: "Stocks" },
    { symbol: "AMZN/BABA", displayName: "Amazon/Alibaba", price: "1.584555", change: "+0.0023", percentage: "+0.15%", flag: "📦", category: "Stocks" },
    { symbol: "AMZN/EBAY", displayName: "Amazon/Ebay", price: "2.199395", change: "+0.0056", percentage: "+0.26%", flag: "📦", category: "Stocks" },
    { symbol: "Palladium", price: "1345.447", change: "+12.34", percentage: "+0.92%", flag: "🥈", category: "Stocks" },
    { symbol: "Platinum", price: "2162.622", change: "+23.45", percentage: "+1.10%", flag: "⬜", category: "Stocks" },
    // ===== ADDITIONAL MARKET INDICES =====
    { symbol: "GER30/UK100", displayName: "GER30/UK100", price: "2.214715", change: "+0.0045", percentage: "+0.21%", flag: "EUR,GBP", category: "Index" },
    { symbol: "HK 33", displayName: "HK 33", price: "27173.79", change: "+123.45", percentage: "+0.46%", flag: "HKD", category: "Index" },
    { symbol: "UK 100", displayName: "UK 100", price: "10397.57", change: "+45.67", percentage: "+0.44%", flag: "GBP", category: "Index" },
    { symbol: "US100/JP225", displayName: "US100/JP225", price: "73.98650", change: "+0.567", percentage: "+0.77%", flag: "USD,JPY", category: "Index" },
    { symbol: "US2000", price: "2586.985", change: "+12.34", percentage: "+0.48%", flag: "USD", category: "Index" },
    { symbol: "US 30", price: "45938.51", change: "+234.56", percentage: "+0.51%", flag: "USD", category: "Index" },
    { symbol: "US30/JP225", displayName: "US30/JP225", price: "143.4738", change: "+0.678", percentage: "+0.47%", flag: "USD,JPY", category: "Index" },
    { symbol: "US 500", price: "6625.189", change: "+23.45", percentage: "+0.36%", flag: "USD", category: "Index" },
    { symbol: "US 100", price: "24862.53", change: "+156.78", percentage: "+0.63%", flag: "USD", category: "Index" },
    { symbol: "SP 35", displayName: "SP 35", price: "17303.30", change: "+78.90", percentage: "+0.46%", flag: "EUR", category: "Index" },
    // ===== ADDITIONAL FOREX PAIRS =====
    { symbol: "NZD/CAD", price: "0.798095", change: "+0.0012", percentage: "+0.15%", flag: "NZD,CAD", category: "Forex" },
    { symbol: "NZD/JPY", price: "92.09785", change: "+0.234", percentage: "+0.25%", flag: "NZD,JPY", category: "Forex" },
    { symbol: "NZD/USD", price: "0.584945", change: "-0.0008", percentage: "-0.14%", flag: "NZD,USD", category: "Forex" },
    { symbol: "USD/CHF", price: "0.789325", change: "+0.0015", percentage: "+0.19%", flag: "USD,CHF", category: "Forex" },
    { symbol: "USD/HKD", price: "7.851635", change: "+0.0023", percentage: "+0.03%", flag: "USD,HKD", category: "Forex" },
    { symbol: "USD/NOK", price: "9.625115", change: "+0.0234", percentage: "+0.24%", flag: "USD,NOK", category: "Forex" },
    { symbol: "USD/PLN", price: "3.681655", change: "-0.0045", percentage: "-0.12%", flag: "USD,PLN", category: "Forex" },
    { symbol: "USD/SEK", price: "9.482325", change: "+0.0178", percentage: "+0.19%", flag: "USD,SEK", category: "Forex" },
    { symbol: "USD/SGD", price: "1.274865", change: "+0.0012", percentage: "+0.09%", flag: "USD,SGD", category: "Forex" },
    { symbol: "USD/THB", price: "32.40686", change: "+0.0678", percentage: "+0.21%", flag: "USD,THB", category: "Forex" },
    { symbol: "USD/TRY", price: "44.22107", change: "+0.1234", percentage: "+0.28%", flag: "USD,TRY", category: "Forex" },
    { symbol: "USD/ZAR", price: "16.62457", change: "+0.0456", percentage: "+0.27%", flag: "USD,ZAR", category: "Forex" },
    { symbol: "USD/COP", price: "3954.023", change: "+12.34", percentage: "+0.31%", flag: "USD,COP", category: "Forex" },
    // ===== ADDITIONAL CRYPTO =====
    { symbol: "SOL/USD", displayName: "Solana", price: "94.54191", change: "+1.234", percentage: "+1.32%", flag: "SOL", category: "Crypto" },
    { symbol: "LINK/USD", displayName: "Chainlink", price: "9.221925", change: "+0.123", percentage: "+1.35%", flag: "LINK", category: "Crypto" },
    { symbol: "LTC/USD", displayName: "Litecoin", price: "62.06647", change: "+0.567", percentage: "+0.92%", flag: "LTC", category: "Crypto" },
    { symbol: "HBAR/USD", displayName: "Hedera", price: "0.096285", change: "+0.0012", percentage: "+1.26%", flag: "HBAR", category: "Crypto" },
    { symbol: "ICP/USD", displayName: "Internet Computer", price: "2.898925", change: "-0.0345", percentage: "-1.18%", flag: "ICP", category: "Crypto" },
    { symbol: "IMX/USD", displayName: "Immutable", price: "0.184235", change: "+0.0023", percentage: "+1.27%", flag: "IMX", category: "Crypto" },
    { symbol: "IOTA/USD", displayName: "IOTA", price: "0.059485", change: "-0.0008", percentage: "-1.33%", flag: "IOTA", category: "Crypto" },
    { symbol: "MANA/USD", displayName: "Decentraland", price: "0.098465", change: "+0.0012", percentage: "+1.23%", flag: "MANA", category: "Crypto" },
    { symbol: "MATIC/USD", displayName: "Polygon", price: "0.104525", change: "+0.0015", percentage: "+1.46%", flag: "MATIC", category: "Crypto" },
    { symbol: "MELANIA/USD", displayName: "MELANIA Coin", price: "0.129825", change: "-0.0034", percentage: "-2.55%", flag: "MELANIA", category: "Crypto" },
    { symbol: "GRT/USD", displayName: "The Graph", price: "0.030315", change: "+0.0005", percentage: "+1.68%", flag: "GRT", category: "Crypto" },
    { symbol: "ORDI/USD", displayName: "ORDI", price: "2.737535", change: "+0.0456", percentage: "+1.69%", flag: "ORDI", category: "Crypto" },
    { symbol: "PENGU/USD", displayName: "Pudgy Penguins", price: "9.906975", change: "+0.1234", percentage: "+1.26%", flag: "PENGU", category: "Crypto" },
    { symbol: "PEPE/USD", displayName: "Pepe", price: "0.675045", change: "+0.0089", percentage: "+1.34%", flag: "PEPE", category: "Crypto" },
    { symbol: "PYTH/USD", displayName: "Pyth", price: "0.047515", change: "-0.0008", percentage: "-1.65%", flag: "PYTH", category: "Crypto" },
    { symbol: "RAY/USD", displayName: "Raydium", price: "0.673945", change: "+0.0089", percentage: "+1.34%", flag: "RAY", category: "Crypto" },
    { symbol: "RNDR/USD", displayName: "Render", price: "1.665075", change: "+0.0234", percentage: "+1.43%", flag: "RNDR", category: "Crypto" },
    { symbol: "RON/USD", displayName: "Ronin", price: "0.112645", change: "+0.0015", percentage: "+1.35%", flag: "RON", category: "Crypto" },
    { symbol: "SAND/USD", displayName: "Sandbox", price: "0.098665", change: "+0.0012", percentage: "+1.23%", flag: "SAND", category: "Crypto" },
    { symbol: "1000SATS/USD", displayName: "1000Sats", price: "0.008785", change: "+0.0001", percentage: "+1.15%", flag: "BTC", category: "Crypto" },
    { symbol: "SEI/USD", displayName: "Sei", price: "0.074345", change: "+0.0009", percentage: "+1.23%", flag: "SEI", category: "Crypto" },
    { symbol: "STX/USD", displayName: "Stacks", price: "0.187625", change: "+0.0023", percentage: "+1.24%", flag: "STX", category: "Crypto" },
    { symbol: "SUI/USD", displayName: "Sui", price: "1.117935", change: "+0.0145", percentage: "+1.31%", flag: "SUI", category: "Crypto" },
    { symbol: "TAO/USD", displayName: "Bittensor", price: "296.4252", change: "+3.456", percentage: "+1.18%", flag: "TAO", category: "Crypto" },
    { symbol: "TIA/USD", displayName: "Celestia", price: "0.338965", change: "+0.0045", percentage: "+1.35%", flag: "TIA", category: "Crypto" },
    { symbol: "TON/USD", displayName: "Toncoin", price: "1.384595", change: "+0.0178", percentage: "+1.30%", flag: "TON", category: "Crypto" },
    { symbol: "TRUMP/USD", displayName: "TRUMP Coin", price: "13.18692", change: "+0.1678", percentage: "+1.29%", flag: "TRUMP", category: "Crypto" },
    { symbol: "WLD/USD", displayName: "Worldcoin", price: "0.488035", change: "+0.0067", percentage: "+1.39%", flag: "WLD", category: "Crypto" },
    { symbol: "DYDX/USD", displayName: "DYDX", price: "0.130205", change: "-0.0023", percentage: "-1.74%", flag: "DYDX", category: "Crypto" },
    { symbol: "WIF/USD", displayName: "Dogwifhat", price: "0.220755", change: "+0.0034", percentage: "+1.56%", flag: "WIF", category: "Crypto" },
    { symbol: "LABUBU/USD", displayName: "Labubu", price: "1.091795", change: "+0.0145", percentage: "+1.35%", flag: "LABUBU", category: "Crypto" },
    // ===== ADDITIONAL STOCKS & PAIRS =====
    { symbol: "GOOGL/MSFT", displayName: "Alphabet/Microsoft", price: "0.903765", change: "+0.0023", percentage: "+0.25%", flag: "🔍", category: "Stocks" },
    { symbol: "GS", displayName: "Goldman Sachs Gr.", price: "807.9605", change: "+4.567", percentage: "+0.57%", flag: "🏛️", category: "Stocks" },
    { symbol: "INTC", displayName: "Intel Corporation", price: "43.12950", change: "-0.345", percentage: "-0.79%", flag: "💻", category: "Stocks" },
    { symbol: "INTC/IBM", displayName: "Intel/IBM", price: "0.180875", change: "+0.0012", percentage: "+0.67%", flag: "💻", category: "Stocks" },
    { symbol: "KLARNA", displayName: "Klarna Group plc", price: "13.26850", change: "+0.1234", percentage: "+0.94%", flag: "🛍️", category: "Stocks" },
    { symbol: "MCD", displayName: "McDonald's Corpo.", price: "320.2750", change: "+2.345", percentage: "+0.74%", flag: "🍔", category: "Stocks" },
    { symbol: "META/GOOGL", displayName: "Meta/Alphabet", price: "2.638075", change: "+0.0345", percentage: "+1.32%", flag: "👤", category: "Stocks" },
    { symbol: "MS", displayName: "Morgan Stanley", price: "158.3735", change: "+0.789", percentage: "+0.50%", flag: "🏦", category: "Stocks" },
    { symbol: "MSFT/AAPL", displayName: "Microsoft/Apple", price: "1.391175", change: "+0.0123", percentage: "+0.89%", flag: "🪟", category: "Stocks" },
    { symbol: "NFLX/AMZN", displayName: "Netflix/Amazon", price: "0.507325", change: "+0.0067", percentage: "+1.34%", flag: "🎬", category: "Stocks" },
    { symbol: "NKE", displayName: "Nike, Inc.", price: "58.72250", change: "+0.345", percentage: "+0.59%", flag: "👟", category: "Stocks" },
    { symbol: "PLTR", displayName: "Palantir Technolog.", price: "101.8525", change: "+1.234", percentage: "+1.23%", flag: "🎯", category: "Stocks" },
    { symbol: "TSLA/F", displayName: "Tesla/Ford", price: "32.87720", change: "+0.234", percentage: "+0.72%", flag: "🚗", category: "Stocks" },
    // ===== COMMODITIES =====
    { symbol: "XAGUSD", displayName: "Silver", price: "64.57717", change: "+0.567", percentage: "+0.88%", flag: "🥈", category: "Stocks" },
    { symbol: "XAUUSD", displayName: "Gold", price: "4980.765", change: "+23.45", percentage: "+0.47%", flag: "🥇", category: "Stocks" },
    { symbol: "Gold/Silver", price: "63.17810", change: "+0.456", percentage: "+0.73%", flag: "🥇", category: "Stocks" },
    { symbol: "Natural Gas", price: "2.032750", change: "-0.0234", percentage: "-1.14%", flag: "⛽", category: "Stocks" },
    { symbol: "UKOUSD", displayName: "UK Crude Oil", price: "82.83250", change: "+0.678", percentage: "+0.82%", flag: "🛢️", category: "Stocks" },
    { symbol: "USOUSD", displayName: "US Crude Oil", price: "92.78519", change: "+0.789", percentage: "+0.86%", flag: "🛢️", category: "Stocks" },
  ];

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const tradingHistory = [
    {
      id: 1,
      time: "19:06",
      date: "17 Oct",
      symbol: "USD/CAD",
      type: "Binary",
      direction: "higher",
      amount: 10000,
      result: "win",
      profit: 8600,
      percentage: "+86.00%",
      flag: "USD,CAD",
      closePrice: "1.385575",
      openPrice: "1.383925",
    },
    {
      id: 2,
      time: "02:38",
      date: "6 Oct",
      symbol: "USD/CAD",
      type: "Binary",
      direction: "higher",
      amount: 10000,
      result: "loss",
      profit: -10000,
      percentage: "-100%",
      flag: "USD,CAD",
      closePrice: "1.383925",
      openPrice: "1.385575",
    },
    {
      id: 3,
      time: "21:51",
      date: "11 Sep",
      symbol: "USD/CAD",
      type: "10 Binary",
      direction: "higher",
      amount: 100000,
      result: "loss",
      profit: -98140,
      percentage: "-98.14%",
      flag: "USD,CAD",
      closePrice: "1.385575",
      openPrice: "1.390000",
    },
    {
      id: 4,
      time: "21:50",
      date: "11 Sep",
      symbol: "USD/CAD",
      type: "10 Binary",
      direction: "lower",
      amount: 100000,
      result: "win",
      profit: 86000,
      percentage: "+86.00%",
      flag: "USD,CAD",
      closePrice: "1.383925",
      openPrice: "1.385575",
    },
    {
      id: 5,
      time: "21:35",
      date: "11 Sep",
      symbol: "USD/CAD",
      type: "8 Binary",
      direction: "lower",
      amount: 80000,
      result: "loss",
      profit: -65120,
      percentage: "-81.40%",
      flag: "USD,CAD",
      closePrice: "1.385575",
      openPrice: "1.383925",
    },
  ];

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Countdown timer for expiration
    setCountdown(expirationSeconds);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return expirationSeconds; // Reset when reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    // Fetch user balance
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/user/balance");
        if (response.ok) {
          const data = await response.json();
          const userBalanceCurrency = data.balanceCurrency || "USD";
          setRealAccountBalance(data.realBalance);
          setBalanceCurrency(userBalanceCurrency);
          setTraderoomBalance(data.traderoomBalance || 0);
          console.log(
            `✅ User balance loaded: Real=${data.realBalance} ${userBalanceCurrency}, Traderoom=$${data.traderoomBalance}, Practice=$${data.practiceBalance}`
          );
        }
      } catch (error) {
        console.error("Failed to fetch user balance:", error);
      }
    };

    // Fetch forex rates
    const fetchForexRates = async () => {
      try {
        const response = await fetch(
          "/api/forex/rates?symbols=CAD,EUR,GBP,JPY,AUD,CHF,NZD"
        );
        if (response.ok) {
          const data = await response.json();
          setForexRates(data);
          console.log(
            `✅ Forex rates loaded:`,
            Object.keys(data).length,
            "pairs"
          );
        }
      } catch (error) {
        console.error("Failed to fetch forex rates:", error);
      }
    };

    fetchBalance();
    fetchForexRates();

    // Refresh forex rates every 60 seconds
    const forexInterval = setInterval(fetchForexRates, 60000);

    // Wait for auth status to be determined before setting account type
    if (status === "loading") {
      // Don't change account type while loading - keep default (real)
      return () => {
        clearInterval(timer);
        clearInterval(forexInterval);
        clearInterval(countdownInterval);
      };
    }

    // If not logged in (unauthenticated), force practice mode
    if (status === "unauthenticated") {
      setSelectedAccountType("practice");
      localStorage.setItem("selectedAccountType", "practice");
    } else if (status === "authenticated") {
      // Logged in users: always default to real account
      setSelectedAccountType("real");
      localStorage.setItem("selectedAccountType", "real");
    }

    return () => {
      clearInterval(timer);
      clearInterval(forexInterval);
      clearInterval(countdownInterval);
    };
  }, [status, expirationSeconds]);

  // Convert balance to USD when balance or exchange rates change
  useEffect(() => {
    if (balanceCurrency === "USD") {
      setRealAccountBalanceUSD(realAccountBalance);
    } else {
      // Convert from user's currency to USD
      const rate = exchangeRates[balanceCurrency] || 1;
      const usdValue = realAccountBalance / rate;
      setRealAccountBalanceUSD(usdValue);
    }
  }, [realAccountBalance, balanceCurrency, exchangeRates]);

  // Close balance dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isBalanceDropdownOpen && !target.closest(".relative")) {
        setIsBalanceDropdownOpen(false);
      }
    };

    if (isBalanceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isBalanceDropdownOpen]);

  // Handle funding from fiat balance
  const handleFundFromFiat = async () => {
    const amountUSD = parseFloat(fundAmount);
    if (isNaN(amountUSD) || amountUSD <= 0) {
      setFundingError("Please enter a valid amount");
      return;
    }
    
    // Convert USD amount to user's currency for comparison
    // Check against the USD-equivalent balance
    if (amountUSD > realAccountBalanceUSD) {
      setFundingError(
        `Insufficient balance. You have $${realAccountBalanceUSD.toFixed(2)} USD available.`
      );
      return;
    }
    
    // Convert USD to user's currency for the actual deduction
    const rate = exchangeRates[balanceCurrency] || 1;
    const amountInUserCurrency = balanceCurrency === "USD" ? amountUSD : amountUSD * rate;

    setIsFunding(true);
    setFundingError("");

    try {
      // Pass the amount in user's currency to be deducted from their balance
      // Also pass the USD amount for traderoom credit
      const result = await fundTraderoomAction(amountInUserCurrency, amountUSD);

      if (result.success && result.data) {
        setRealAccountBalance(result.data.newFiatBalance);
        setTraderoomBalance(result.data.newTraderoomBalance);
        setFundAmount("");
        setShowFundModal(false);
        setFundingSuccessMessage(
          `Successfully transferred $${amountUSD.toFixed(2)} to your Traderoom balance!`
        );
      } else {
        setFundingError(result.error || "Failed to transfer funds");
      }
    } catch (error) {
      setFundingError("Network error. Please try again.");
    } finally {
      setIsFunding(false);
    }
  };

  // Handle funding via crypto
  const handleFundWithCrypto = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount < 10) {
      setFundingError("Minimum deposit is $10");
      return;
    }

    setIsFunding(true);
    setFundingError("");

    try {
      const response = await fetch("/api/traderoom/fund-crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "USD",
          cryptoCurrency: selectedCrypto,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data?.deposit) {
        setCryptoPaymentInfo(data.data.deposit);
      } else {
        setFundingError(data.message || "Failed to create payment");
      }
    } catch (error) {
      setFundingError("Network error. Please try again.");
    } finally {
      setIsFunding(false);
    }
  };

  const supportedCryptos = [
    { code: "btc", name: "Bitcoin", icon: "₿" },
    { code: "eth", name: "Ethereum", icon: "⟠" },
    { code: "usdt", name: "USDT", icon: "₮" },
    { code: "usdc", name: "USDC", icon: "$" },
    { code: "ltc", name: "Litecoin", icon: "Ł" },
    { code: "sol", name: "Solana", icon: "◎" },
  ];

  const executeTrade = async (direction: "higher" | "lower") => {
    if (isExecutingTrade) return;

    // Check balance
    const currentBalance =
      selectedAccountType === "real"
        ? traderoomBalance
        : practiceAccountBalance;
    if (amount > currentBalance) {
      alert("Insufficient balance for this trade");
      return;
    }

    setIsExecutingTrade(true);
    setTradeDirection(direction);

    // Generate trade ID
    const tradeId = `trade_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const entryTime = Date.now();
    const expirationTime = entryTime + expirationSeconds * 1000;

    // Get current entry price (you'd get this from the chart in production)
    const entryPrice = currentPrice || 1.35742; // Default to USDCAD base price if not set

    // Create new active trade
    const newTrade: ActiveTrade = {
      id: tradeId,
      symbol: selectedSymbol,
      direction,
      amount,
      entryPrice,
      entryTime,
      expirationTime,
      expirationSeconds,
      status: "active",
    };

    setActiveTrades((prev) => [...prev, newTrade]);

    // Deduct from balance (for real account)
    if (selectedAccountType === "real") {
      setTraderoomBalance((prev) => prev - amount);
    }

    // Reset execution state after brief animation
    setTimeout(() => {
      setIsExecutingTrade(false);
      setTradeDirection(null);
    }, 500);
  };

  // Process trade expiration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setActiveTrades((prev) =>
        prev.map((trade) => {
          if (trade.status !== "active") return trade;

          // Check if trade has expired
          if (now >= trade.expirationTime) {
            // Determine win/loss based on price movement
            const priceChange = currentPrice - trade.entryPrice;
            const won =
              (trade.direction === "higher" && priceChange > 0) ||
              (trade.direction === "lower" && priceChange < 0);

            const payout = won ? trade.amount * 1.85 : 0; // 85% profit + original amount

            // Update balance
            if (selectedAccountType === "real" && won) {
              setTraderoomBalance((prev) => prev + payout);
            }

            return {
              ...trade,
              status: won ? "won" : "lost",
              result: won ? payout - trade.amount : -trade.amount,
            };
          }

          return trade;
        })
      );

      // Remove completed trades after 5 seconds
      setActiveTrades((prev) =>
        prev.filter((trade) => {
          if (trade.status === "won" || trade.status === "lost") {
            const completedTime = trade.expirationTime;
            return now - completedTime < 5000; // Keep for 5 seconds after completion
          }
          return true;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [currentPrice, selectedAccountType]);

  if (!mounted) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: "#070c15", color: "#eef2f7" }}
      >
        <div className="text-center space-y-6">
          {/* Logo */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-8"
          >
            <Image
              src="/m4capitallogo2.png"
              alt="M4Capital"
              width={120}
              height={120}
              className="mx-auto object-contain"
            />
          </motion.div>

          {/* Loading Bar */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: "#ff8516" }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-lg font-medium"
            style={{ color: "#ff8516" }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Preparing Your Trading Experience...
          </motion.p>

          {/* Subtext */}
          <p className="text-sm" style={{ color: "#4a6080" }}>
            Setting up markets, charts, and real-time data
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Funding Success Popup */}
      {fundingSuccessMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Transfer Successful!</h3>
            </div>
            {/* Message */}
            <div className="p-6">
              <p className="text-gray-300 text-center text-lg">{fundingSuccessMessage}</p>
            </div>
            {/* Button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setFundingSuccessMessage(null)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        html,
        body {
          overflow: hidden !important;
          height: 100%;
          width: 100%;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div
        className="h-screen w-screen m-0 p-0"
        style={{
          backgroundColor: "#070c15",
          color: "#eef2f7",
          fontFamily: '"Inter", Arial, sans-serif',
          margin: 0,
          padding: 0,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {/* M4Capital Header */}
        <header
          style={{
            backgroundColor: "#0a1020",
            borderBottom: "1px solid #1a2d45",
          }}
        >
          <div className="flex items-center justify-between h-32 md:h-14 px-4">
            {/* Left: Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                {/* Desktop: logo1, Mobile: logo2 */}
                <div className="hidden md:block">
                  <Image
                    src="/m4capitallogo1.png"
                    alt="M4Capital"
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="block md:hidden w-14 h-14 relative">
                  <Image
                    src="/m4capitallogo2.png"
                    alt="M4Capital"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Chart Grid Icon */}
              <button
                onClick={() => setShowChartGrids(!showChartGrids)}
                className="rounded transition-all duration-200 hover:opacity-80"
                style={{
                  backgroundColor: "transparent",
                  padding: "6px",
                  border: "1px solid rgba(139, 133, 131, 0.3)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top-left box */}
                  <rect
                    x="4"
                    y="4"
                    width="7"
                    height="7"
                    fill="#8b8583"
                    rx="1"
                  />
                  {/* Top-right box */}
                  <rect
                    x="13"
                    y="4"
                    width="7"
                    height="7"
                    fill="#8b8583"
                    rx="1"
                  />
                  {/* Bottom-left box */}
                  <rect
                    x="4"
                    y="13"
                    width="7"
                    height="7"
                    fill="#8b8583"
                    rx="1"
                  />
                  {/* Bottom-right box */}
                  <rect
                    x="13"
                    y="13"
                    width="7"
                    height="7"
                    fill="#8b8583"
                    rx="1"
                  />
                </svg>
              </button>

              {/* Trading Pair Tabs */}
              <div className="flex items-center space-x-1">
                {openTabs.map((tab, index) => (
                  <button
                    key={`header-tab-${index}-${tab.symbol}`}
                    onClick={() => {
                      setActiveTab(index);
                      setSelectedSymbol(tab.symbol);
                    }}
                    className="flex items-center space-x-1 px-1.5 rounded-md transition-all duration-200 relative"
                    style={{
                      backgroundColor:
                        activeTab === index ? "#ff8516" : "#2c2826",
                      color: activeTab === index ? "#ffffff" : "#999999",
                      borderBottom:
                        activeTab === index
                          ? "2px solid #ff8516"
                          : "2px solid transparent",
                      height: "44px",
                    }}
                  >
                    <span className="text-xs">
                      <AssetFlag flag={symbols.find((s) => s.symbol === tab.symbol)?.flag || ""} symbol={tab.symbol} size={16} />
                    </span>
                    <span className="text-xs font-medium">{tab.symbol}</span>
                    <span
                      className="text-[10px]"
                      style={{
                        color: activeTab === index ? "#ffffff" : "#666666",
                      }}
                    >
                      ({tab.symbol.includes("USD") ? "OTC" : "Binary"})
                    </span>
                    {openTabs.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          const newTabs = openTabs.filter(
                            (_, i) => i !== index
                          );
                          setOpenTabs(newTabs);
                          if (activeTab === index && newTabs.length > 0) {
                            setActiveTab(0);
                            setSelectedSymbol(newTabs[0].symbol);
                          }
                        }}
                        className="ml-2 hover:bg-black/20 rounded transition-all w-4 h-4 flex items-center justify-center cursor-pointer"
                        style={{
                          color: activeTab === index ? "#ffffff" : "#666666",
                          fontSize: "14px",
                        }}
                      >
                        ×
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => { setAddAssetSideTab("trending"); setAddAssetSearch(""); setShowAddAssetModal(true); }}
                  className="rounded-md hover:opacity-75 transition-all duration-200"
                  style={{
                    backgroundColor: "#2c2826",
                    color: "#999999",
                    height: "44px",
                    width: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Profile Avatar, Balance and Deposit */}
            <div className="flex items-center space-x-3">
              {/* Profile Avatar with verified badge and dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="relative cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
                    <Image
                      src={session?.user?.image || "/avatars/default.png"}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  {/* Green verified checkmark badge */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#5ddf38] rounded-full flex items-center justify-center border-2 border-[#1b1817]">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 ml-0.5" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div
                      className="absolute top-full right-0 mt-2 z-50 rounded-lg shadow-2xl overflow-hidden flex"
                      style={{
                        backgroundColor: "#0a1020",
                        border: "1px solid #3d3c4f",
                        minWidth: "520px",
                      }}
                    >
                      {/* Left Panel - User Info */}
                      <div
                        className="p-4 w-[240px]"
                        style={{
                          backgroundColor: "#070c15",
                          borderRight: "1px solid #3d3c4f",
                        }}
                      >
                        {/* User Avatar and Name */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0">
                            <Image
                              src={session?.user?.image || "/avatars/default.png"}
                              alt="Profile"
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-white font-semibold text-sm truncate max-w-[130px]">
                                {session?.user?.name || "User"}
                              </span>
                              <svg className="w-4 h-4 text-[#5ddf38] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {session?.user?.email || ""}
                            </div>
                          </div>
                        </div>

                        {/* Currency */}
                        <div className="flex items-center gap-2 mb-4">
                          <CryptoIcon symbol={preferredCurrency} size="sm" />
                          <span className="text-sm text-[#5ddf38]">{preferredCurrency}</span>
                        </div>

                        {/* Date and User ID */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Date registered</div>
                            <div className="text-sm text-white">
                              {(session?.user as any)?.createdAt 
                                ? new Date((session?.user as any).createdAt as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                : "17 Apr 2025"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">User ID</div>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-white">
                                {(session?.user as any)?.accountNumber || "177863954"}
                              </span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText((session?.user as any)?.accountNumber || "177863954");
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Panel - Menu Items */}
                      <div className="flex-1 py-2">
                        {/* VIP Program - Highlighted */}
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            router.push("/dashboard?tab=vip");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{ backgroundColor: "#5ddf38" }}
                        >
                          <Crown className="w-5 h-5 text-[#1b1817]" />
                          <span className="text-sm font-medium text-[#1b1817]">VIP program</span>
                        </button>

                        {/* Menu Items */}
                        {[
                          { icon: Camera, label: "Change Photo", action: () => router.push("/settings?tab=profile") },
                          { icon: User, label: "Personal Data", action: () => router.push("/settings?tab=profile") },
                          { icon: ShieldCheck, label: "Verify Account", action: () => router.push("/settings?tab=kyc") },
                          { icon: Wallet, label: "Deposit Funds", action: () => { setIsProfileDropdownOpen(false); setShowFundModal(true); } },
                          { icon: ArrowDownCircle, label: "Withdraw Funds", action: () => { setIsProfileDropdownOpen(false); setShowWithdrawModal(true); } },
                          { icon: HelpCircle, label: "Contact Support", action: () => router.push("/help") },
                          { icon: FileText, label: "Balance History", action: () => router.push("/dashboard?tab=history") },
                          { icon: History, label: "Trading History", action: () => setShowTradingHistory(true) },
                          { icon: Settings, label: "Settings", action: () => router.push("/settings") },
                        ].map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              item.action();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                          >
                            <item.icon className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-white">{item.label}</span>
                          </button>
                        ))}

                        {/* Divider */}
                        <div className="my-2 border-t" style={{ borderColor: "#1a2d45" }} />

                        {/* Log Out */}
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-white">Log Out</span>
                        </button>

                        {/* Version */}
                        <div className="px-4 py-2 text-right">
                          <span className="text-xs text-gray-500">Version: 3835.4.4938</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Balance Dropdown */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsBalanceDropdownOpen(!isBalanceDropdownOpen)
                  }
                  className="flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
                >
                  <span
                    style={{
                      color: selectedAccountType === "practice" ? "#ff8516" : "#5ddf38",
                      fontSize: "20px",
                      fontWeight: "600",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    $ {(selectedAccountType === "real"
                      ? traderoomBalance
                      : practiceAccountBalance
                    ).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <ChevronDown
                    className="w-4 h-4"
                    style={{ color: selectedAccountType === "practice" ? "#ff8516" : "#5ddf38" }}
                  />
                </button>

                {/* Balance Dropdown */}
                {isBalanceDropdownOpen && (
                  <div
                    className="absolute top-full right-0 mt-1 rounded-md shadow-2xl z-50 flex overflow-hidden"
                    style={{
                      backgroundColor: "#0a1020",
                      border: "1px solid #1a2d45",
                    }}
                  >
                    {/* Left Panel - Available/Investment Info (IQ Option style with dotted leaders) */}
                    <div
                      className="px-5 py-5 w-[220px]"
                      style={{
                        backgroundColor: "#070c15",
                        borderRight: "1px solid #1a2d45",
                      }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm whitespace-nowrap" style={{ color: "#8b9ab8" }}>Available</span>
                          <span className="flex-1 border-b border-dotted" style={{ borderColor: "#2a3a50", marginBottom: "3px" }}></span>
                          <span className="text-sm font-semibold text-white whitespace-nowrap">
                            $ {(selectedAccountType === "real" ? traderoomBalance : practiceAccountBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm whitespace-nowrap" style={{ color: "#8b9ab8" }}>Investment</span>
                          <span className="flex-1 border-b border-dotted" style={{ borderColor: "#2a3a50", marginBottom: "3px" }}></span>
                          <span className="text-sm font-semibold text-white whitespace-nowrap">
                            $ 0.00
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 pt-3">
                        <button className="flex items-center gap-1.5 text-sm" style={{ color: "#8b9ab8" }}>
                          <CircleHelp className="w-4 h-4" />
                          <span>What is this?</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Panel - Account Selection */}
                    <div className="flex flex-col">
                      {/* Real Account Row */}
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            alert("Please log in to access your real account");
                            return;
                          }
                          setSelectedAccountType("real");
                          setIsBalanceDropdownOpen(false);
                          localStorage.setItem("selectedAccountType", "real");
                        }}
                        disabled={!isLoggedIn}
                        className={`flex items-center justify-between px-5 py-4 w-[360px] transition-all ${
                          selectedAccountType === "real" ? "bg-white/5" : "hover:bg-white/5"
                        } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        style={{ borderBottom: "1px solid #1a2d45" }}
                      >
                        <div className="text-left">
                          <div className="text-sm uppercase tracking-wider font-bold mb-1 text-white whitespace-nowrap">
                            REAL ACCOUNT
                          </div>
                          <div className="text-lg font-semibold" style={{ color: "#5ddf38" }}>
                            $ {traderoomBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: "#1a2d45" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b9ab8" strokeWidth="2">
                              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsBalanceDropdownOpen(false);
                              setShowFundModal(true);
                            }}
                            className="px-5 py-2 rounded text-sm font-medium transition-all hover:opacity-80"
                            style={{ backgroundColor: "#1a2d45", color: "#ffffff" }}
                          >
                            Deposit
                          </button>
                        </div>
                      </button>

                      {/* Practice Account Row */}
                      <button
                        onClick={() => {
                          setSelectedAccountType("practice");
                          setIsBalanceDropdownOpen(false);
                          localStorage.setItem("selectedAccountType", "practice");
                        }}
                        className={`flex items-center justify-between px-5 py-4 w-[360px] transition-all ${
                          selectedAccountType === "practice" ? "bg-white/5" : "hover:bg-white/5"
                        } cursor-pointer`}
                      >
                        <div className="text-left">
                          <div className="text-sm uppercase tracking-wider font-bold mb-1 text-white whitespace-nowrap">
                            PRACTICE ACCOUNT
                          </div>
                          <div className="text-lg font-semibold" style={{ color: "#ff8516" }}>
                            $ {practiceAccountBalance.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: "#1a2d45" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b9ab8" strokeWidth="2">
                              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle practice account top up
                            }}
                            className="px-5 py-2 rounded text-sm font-medium transition-all hover:opacity-80"
                            style={{ backgroundColor: "#1a2d45", color: "#ffffff" }}
                          >
                            Top Up
                          </button>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Deposit Button - IQ Option style green outline with $ icon */}
              <button
                onClick={() => setShowFundModal(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-md text-base font-semibold transition-all duration-200 hover:bg-[#5ddf38]/10"
                style={{ 
                  backgroundColor: "transparent", 
                  color: "#5ddf38",
                  border: "2px solid #5ddf38"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5ddf38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v12M9 9.5c0-.83.672-1.5 1.5-1.5h1.5c1.105 0 2 .895 2 2s-.895 2-2 2h-2c-1.105 0-2 .895-2 2s.895 2 2 2h1.5c.828 0 1.5-.672 1.5-1.5"/>
                </svg>
                Deposit
              </button>
            </div>
          </div>
        </header>

        {/* Main Trading Interface */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* IQ Option Style Sidebar */}
          <div
            className="flex-col border-r flex"
            style={{
              backgroundColor: "#070c15",
              borderColor: "#1a2d45",
              width: "76px",
            }}
          >
            {/* Sidebar Icons */}
            <div className="flex flex-col items-center py-4 space-y-6">
              {/* Total Portfolio */}
              <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                  <Briefcase
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    TOTAL
                  </div>
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    PORTFOLIO
                  </div>
                </div>
              </div>

              {/* Trading History */}
              <div
                className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300"
                onClick={() => setShowTradingHistory(!showTradingHistory)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: showTradingHistory
                      ? "#1a2d45"
                      : "transparent",
                  }}
                >
                  <History
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showTradingHistory ? "#ffffff" : "#4a6080",
                    }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showTradingHistory ? "#1a2d45" : "#4a6080",
                    }}
                  >
                    TRADING
                  </div>
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showTradingHistory ? "#1a2d45" : "#4a6080",
                    }}
                  >
                    HISTORY
                  </div>
                </div>
              </div>

              {/* Chats & Support */}
              <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                  <MessageCircle
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    CHATS &
                  </div>
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    SUPPORT
                  </div>
                </div>
              </div>

              {/* Promo */}
              <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                  <Gift
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    PROMO
                  </div>
                </div>
              </div>

              {/* Market Analysis */}
              <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                  <BarChart3
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    MARKET
                  </div>
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    ANALYSIS
                  </div>
                </div>
              </div>

              {/* Calculators */}
              <div
                className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300"
                onClick={() => setShowCalculators(!showCalculators)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: showCalculators
                      ? "#1a2d45"
                      : "transparent",
                  }}
                >
                  <Calculator
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showCalculators ? "#ffffff" : "#4a6080",
                    }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showCalculators ? "#1a2d45" : "#4a6080",
                    }}
                  >
                    CALCULATORS
                  </div>
                </div>
              </div>

              {/* Tutorials */}
              <div className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200">
                  <BookOpen
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{ color: "#4a6080" }}
                  >
                    TUTORIALS
                  </div>
                </div>
              </div>

              {/* More */}
              <div
                className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-all duration-300"
                onClick={() => setShowMoreItems(!showMoreItems)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: showMoreItems ? "#1a2d45" : "transparent",
                  }}
                >
                  <MoreHorizontal
                    className="w-7 h-7 transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showMoreItems ? "#ffffff" : "#4a6080",
                    }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <div
                    className="text-[10px] leading-tight transition-all duration-200 group-hover:text-orange-500"
                    style={{
                      color: showMoreItems ? "#1a2d45" : "#4a6080",
                    }}
                  >
                    MORE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* More Items Popup Panel */}
          <AnimatePresence>
            {showMoreItems && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-64 flex-col border-r z-10"
                style={{ backgroundColor: "#0d1626", borderColor: "#1a2d45" }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between p-4 border-b"
                  style={{ borderColor: "#1a2d45" }}
                >
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "#eef2f7" }}
                  >
                    More Items
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: "#8b9ab8" }}
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowMoreItems(false)}
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: "#8b9ab8", fontSize: "20px" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* More Items List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Leaderboard */}
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1a2d45")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#1a2d45" }}
                      >
                        <Target
                          className="w-4 h-4"
                          style={{ color: "#8b9ab8" }}
                        />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#eef2f7" }}
                      >
                        LEADERBOARD
                      </span>
                    </div>

                    {/* Partnership */}
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1a2d45")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#1a2d45" }}
                      >
                        <Handshake
                          className="w-4 h-4"
                          style={{ color: "#8b9ab8" }}
                        />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#eef2f7" }}
                      >
                        PARTNERSHIP
                      </span>
                    </div>

                    {/* Tournaments */}
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1a2d45")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#1a2d45" }}
                      >
                        <Target
                          className="w-4 h-4"
                          style={{ color: "#8b9ab8" }}
                        />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#eef2f7" }}
                      >
                        TOURNAMENTS
                      </span>
                    </div>

                    {/* Help */}
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1a2d45")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#1a2d45" }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#8b9ab8" }}
                        >
                          ?
                        </span>
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#eef2f7" }}
                      >
                        HELP
                      </span>
                    </div>

                    {/* Alerts */}
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1a2d45")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#1a2d45" }}
                      >
                        <Bell
                          className="w-4 h-4"
                          style={{ color: "#8b9ab8" }}
                        />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#eef2f7" }}
                      >
                        ALERTS
                      </span>
                    </div>

                    {/* Tutorials */}
                    <div
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1a2d45")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#1a2d45" }}
                      >
                        <BookOpen
                          className="w-4 h-4"
                          style={{ color: "#8b9ab8" }}
                        />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#eef2f7" }}
                      >
                        TUTORIALS
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Calculators Panel */}
          <AnimatePresence>
            {showCalculators && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-96 flex-col border-r z-10 overflow-hidden relative"
                style={{ backgroundColor: "#0d1626", borderColor: "#1a2d45" }}
              >
                {/* Close Button - Top Right */}
                <button
                  onClick={() => setShowCalculators(false)}
                  className="absolute top-4 right-4 z-20 hover:opacity-75 transition-opacity bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
                  style={{ color: "#8b9ab8" }}
                >
                  ✕
                </button>

                {/* Calculators Content */}
                <div className="flex-1 overflow-y-auto">
                  <TradingCalculators />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center: Chart and Controls */}
          <div className="flex-1 flex flex-col">
            {/* Chart Header 
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: "#1a2d45" }}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">
                  <AssetFlag flag={symbols.find((s) => s.symbol === selectedSymbol)?.flag || ""} symbol={selectedSymbol} size={24} />
                </span>
                <h2 className="text-2xl font-bold" style={{ color: "#eef2f7" }}>
                  {selectedSymbol}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#5ddf38" }}
                >
                  {symbols.find((s) => s.symbol === selectedSymbol)?.price ||
                    "1.35742"}
                </span>
                <div className="flex items-center" style={{ color: "#5ddf38" }}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {symbols.find((s) => s.symbol === selectedSymbol)?.change ||
                      "+0.0015"}{" "}
                    (
                    {symbols.find((s) => s.symbol === selectedSymbol)
                      ?.percentage || "+0.11%"}
                    )
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {["1M", "5M", "15M", "1H", "1D"].map((timeframe) => (
                <button
                  key={timeframe}
                  className="px-3 py-1 rounded-lg text-sm transition-all duration-200"
                  style={{
                    backgroundColor: timeframe === "5M" ? "#ff8516" : "#1a2d45",
                    color: timeframe === "5M" ? "#ffffff" : "#8b9ab8",
                  }}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div> */}

            {/* Chart Grids Panel */}
            <AnimatePresence>
              {showChartGrids && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b overflow-hidden"
                  style={{ backgroundColor: "#0d1626", borderColor: "#1a2d45" }}
                >
                  <div className="p-4">
                    <h3
                      className="text-sm font-semibold mb-4"
                      style={{ color: "#eef2f7" }}
                    >
                      CHART GRIDS
                    </h3>

                    {/* 1 Chart */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: "#8b9ab8" }}>
                          1 chart
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedChartGrid(1)}
                        className="p-2 rounded transition-all duration-200"
                        style={{
                          backgroundColor:
                            selectedChartGrid === 1 ? "#ff8516" : "#1a2d45",
                          border: `1px solid ${
                            selectedChartGrid === 1 ? "#ff8516" : "#1a2d45"
                          }`,
                        }}
                      >
                        <div
                          className="w-8 h-6 rounded-sm"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 1 ? "#ffffff" : "#4a6080",
                          }}
                        />
                      </button>
                    </div>

                    {/* 2 Charts */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: "#8b9ab8" }}>
                          2 charts
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedChartGrid(2)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 2 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 2 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="flex space-x-1">
                            <div
                              className="w-4 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 2
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-4 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 2
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(22)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 22 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 22 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="flex flex-col space-y-1">
                            <div
                              className="w-8 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 22
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-8 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 22
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* 3 Charts */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: "#8b9ab8" }}>
                          3 charts
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedChartGrid(3)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 3 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 3 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 3
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 3
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 3
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(32)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 32 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 32 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-1">
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 32
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 32
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-6 h-2 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 32
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(33)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 33 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 33 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-1">
                            <div
                              className="w-6 h-2 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 33
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 33
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 33
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(34)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 34 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 34 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-1">
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 34
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm row-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 34
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 34
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(35)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 35 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 35 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-1">
                            <div
                              className="w-2 h-4 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 35
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-4 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 35
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-4 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 35
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* 4 Charts */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: "#8b9ab8" }}>
                          4 charts
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedChartGrid(4)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 4 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 4 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-1">
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 4
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 4
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 4
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 4
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(42)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 42 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 42 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="flex space-x-1">
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 42
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 42
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 42
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-6 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 42
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(43)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 43 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 43 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-1">
                            <div
                              className="w-2 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 43
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 43
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 43
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-6 h-2 rounded-sm col-span-3"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 43
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(44)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 44 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 44 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-1">
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 44
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-2 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 44
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-6 h-2 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 44
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-6 h-2 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 44
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(45)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 45 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 45 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="flex flex-col space-y-1">
                            <div
                              className="w-8 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 45
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-8 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 45
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-8 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 45
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-8 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 45
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* More Grids */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: "#8b9ab8" }}>
                          More grids
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {/* Row 1 */}
                        <button
                          onClick={() => setSelectedChartGrid(51)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 51 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 51 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-px">
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 51
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 51
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 51
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 51
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 51
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 51
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(52)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 52 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 52 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-px">
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 52
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 52
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 52
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 52
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 52
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 52
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(53)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 53 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 53 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-px">
                            <div
                              className="w-4 h-1 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 53
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 53
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 53
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 53
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 53
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(54)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 54 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 54 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-px">
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 54
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 54
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 54
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-1 rounded-sm col-span-3"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 54
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-3 h-1 rounded-sm col-span-3"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 54
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(55)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 55 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 55 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-px">
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 55
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 55
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 55
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 55
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 55
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 55
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>

                        {/* Row 2 */}
                        <button
                          onClick={() => setSelectedChartGrid(56)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 56 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 56 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-px">
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 56
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 56
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 56
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 56
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-4 h-1 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 56
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(57)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 57 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 57 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-2 gap-px">
                            <div
                              className="w-4 h-1 rounded-sm col-span-2"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 57
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 57
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 57
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 57
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-2 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 57
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(58)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 58 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 58 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-px">
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 58
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 58
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 58
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 58
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 58
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 58
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(59)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 59 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 59 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-px">
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 59
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 59
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 59
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 59
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 59
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 59
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedChartGrid(60)}
                          className="p-2 rounded transition-all duration-200"
                          style={{
                            backgroundColor:
                              selectedChartGrid === 60 ? "#ff8516" : "#1a2d45",
                            border: `1px solid ${
                              selectedChartGrid === 60 ? "#ff8516" : "#1a2d45"
                            }`,
                          }}
                        >
                          <div className="grid grid-cols-3 gap-px">
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 60
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 60
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 60
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 60
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 60
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                            <div
                              className="w-1 h-1 rounded-sm"
                              style={{
                                backgroundColor:
                                  selectedChartGrid === 60
                                    ? "#ffffff"
                                    : "#4a6080",
                              }}
                            />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Remember checkbox */}
                    <div
                      className="flex items-center space-x-2 pt-2 border-t"
                      style={{ borderColor: "#1a2d45" }}
                    >
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#ff8516" }}
                      />
                      <label
                        htmlFor="remember"
                        className="text-xs"
                        style={{ color: "#8b9ab8" }}
                      >
                        Remember the number of charts (the first chart will be
                        active)
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chart Area with World Map Background */}
            <div
              className="flex-1 relative overflow-hidden"
              style={{
                backgroundColor: "#070c15",
                backgroundImage:
                  'url("/traderoom/backgrounds/worldmapbackground.svg")',
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* IQ Option Style - Top Left Symbol Header */}
              <div className="absolute top-3 left-3 z-40 flex flex-col gap-2">
                {/* Symbol Badge with Flag */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#2a2522] flex items-center justify-center overflow-hidden border border-[#38312e]">
                    <CryptoIcon
                      symbol={selectedSymbol.split("/")[0]}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-semibold text-sm">
                        {selectedSymbol.replace("/", "/")} (OTC)
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-gray-400 text-xs">Binary</span>
                  </div>
                </div>

                {/* Info, Bell, Star buttons - below asset info */}
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1a2d45]/80 text-white text-xs font-medium hover:bg-[#1a2d45] transition-colors backdrop-blur-sm">
                    <Info className="w-3.5 h-3.5" />
                    <span>Info</span>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#1a2d45]/80 flex items-center justify-center hover:bg-[#1a2d45] transition-colors backdrop-blur-sm">
                    <Bell className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#1a2d45]/80 flex items-center justify-center hover:bg-[#1a2d45] transition-colors backdrop-blur-sm">
                    <Star className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* IQ Option Style HIGHER/LOWER Indicators + Tools on Left Side */}
              <div className="absolute left-0 top-16 bottom-0 z-30 flex flex-col justify-between py-4 w-16">
                {/* HIGHER Indicator - Top */}
                <div className="flex flex-col items-start">
                  <div className="text-[#22c55e] text-xs font-bold tracking-wider mb-0.5 ml-2">
                    HIGHER
                  </div>
                  <div className="text-[#22c55e] text-lg font-bold ml-2">
                    90%
                  </div>
                  {/* Green gradient bar */}
                  <div
                    className="w-4 mt-1 ml-2"
                    style={{
                      height: "80px",
                      background:
                        "linear-gradient(to bottom, #22c55e 0%, transparent 100%)",
                      opacity: 0.8,
                    }}
                  />
                </div>

                {/* LOWER Indicator - Middle */}
                <div className="flex flex-col items-start">
                  {/* Red gradient bar */}
                  <div
                    className="w-4 mb-1 ml-2"
                    style={{
                      height: "80px",
                      background:
                        "linear-gradient(to top, #ef4444 0%, transparent 100%)",
                      opacity: 0.8,
                    }}
                  />
                  <div className="text-[#ef4444] text-xs font-bold tracking-wider mb-0.5 ml-2">
                    LOWER
                  </div>
                  <div className="text-[#ef4444] text-lg font-bold ml-2">
                    10%
                  </div>
                </div>

                {/* Tool Buttons - Bottom */}
                <div className="flex flex-col items-center gap-1 mt-auto">
                  {/* Drawing Tool */}
                  <button className="w-9 h-9 rounded bg-[#2a2522] flex items-center justify-center hover:bg-[#38312e] transition-colors border border-[#38312e]">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </button>

                  {/* Expiration Time Selector */}
                  <button className="w-9 h-9 rounded bg-[#2a2522] flex items-center justify-center hover:bg-[#38312e] transition-colors border border-[#38312e] text-white text-xs font-bold">
                    {expirationSeconds}s
                  </button>

                  {/* Sound Toggle */}
                  <button className="w-9 h-9 rounded bg-[#2a2522] flex items-center justify-center hover:bg-[#38312e] transition-colors border border-[#38312e]">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </button>

                  {/* Pencil/Draw */}
                  <button className="w-9 h-9 rounded bg-[#2a2522] flex items-center justify-center hover:bg-[#38312e] transition-colors border border-[#38312e]">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>

                  {/* Wave/Indicators */}
                  <button className="w-9 h-9 rounded bg-[#2a2522] flex items-center justify-center hover:bg-[#38312e] transition-colors border border-[#38312e]">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 12c2-3 4-5 6-5s4 5 6 5 4-5 6-5 2 2 2 5" />
                    </svg>
                  </button>

                  {/* Candle Timeframe */}
                  <button className="w-9 h-9 rounded bg-[#2a2522] flex items-center justify-center hover:bg-[#38312e] transition-colors border border-[#38312e] text-white text-xs font-bold">
                    15m
                  </button>
                </div>
              </div>

              {/* Purchase Time Countdown - IQ Option Style */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[10px] text-[#9e9aa7] font-medium tracking-wider">
                    PURCHASE TIME
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                    {String(countdown % 60).padStart(2, "0")}
                  </div>
                </div>
              </div>

              {/* Purchase Time Countdown - IQ Option Style */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-[10px] text-[#9e9aa7] font-medium tracking-wider">
                    PURCHASE TIME
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                    {String(countdown % 60).padStart(2, "0")}
                  </div>
                </div>
              </div>

              <ChartGrid
                gridType={selectedChartGrid}
                defaultSymbol={selectedSymbol}
                availableSymbols={[
                  "BTC",
                  "ETH",
                  "BNB",
                  "SOL",
                  "ADA",
                  "DOGE",
                  "XRP",
                  "DOT",
                  "MATIC",
                  "LINK",
                ]}
              />

              {/* Active Trades Overlay - IQ Option Style */}
              <AnimatePresence>
                {activeTrades
                  .filter((t) => t.symbol === selectedSymbol)
                  .map((trade) => {
                    const now = Date.now();
                    const elapsed = now - trade.entryTime;
                    const remaining = Math.max(0, trade.expirationTime - now);
                    const remainingSeconds = Math.ceil(remaining / 1000);
                    const progress = Math.min(
                      1,
                      elapsed / (trade.expirationSeconds * 1000)
                    );

                    return (
                      <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute right-24 z-20"
                        style={{
                          top: trade.direction === "higher" ? "30%" : "50%",
                        }}
                      >
                        {/* Trade Marker Line */}
                        <div
                          className="absolute right-0 w-40 h-[2px]"
                          style={{
                            backgroundColor:
                              trade.direction === "higher"
                                ? "#22c55e"
                                : "#ef4444",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />

                        {/* Trade Info Box */}
                        <motion.div
                          className="relative flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg"
                          style={{
                            backgroundColor:
                              trade.direction === "higher"
                                ? "#22c55e"
                                : "#ef4444",
                            boxShadow:
                              trade.direction === "higher"
                                ? "0 0 20px rgba(34, 197, 94, 0.4)"
                                : "0 0 20px rgba(239, 68, 68, 0.4)",
                          }}
                          animate={{
                            scale: trade.status === "active" ? [1, 1.02, 1] : 1,
                          }}
                          transition={{
                            duration: 1,
                            repeat: trade.status === "active" ? Infinity : 0,
                          }}
                        >
                          {/* Amount */}
                          <span className="text-white font-bold text-sm">
                            $ {trade.amount.toLocaleString()}
                          </span>

                          {/* Countdown or Result */}
                          {trade.status === "active" ? (
                            <div className="flex items-center gap-1">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                                style={{
                                  background: `conic-gradient(white ${
                                    progress * 360
                                  }deg, transparent ${progress * 360}deg)`,
                                }}
                              >
                                <span
                                  className="bg-current rounded-full w-4 h-4 flex items-center justify-center"
                                  style={{
                                    backgroundColor:
                                      trade.direction === "higher"
                                        ? "#22c55e"
                                        : "#ef4444",
                                  }}
                                >
                                  {remainingSeconds}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-xs font-bold ${
                                  trade.status === "won"
                                    ? "text-white"
                                    : "text-white"
                                }`}
                              >
                                {trade.status === "won" ? "✓ WON" : "✗ LOST"}
                              </span>
                              <span className="text-white text-xs">
                                {trade.result && trade.result > 0
                                  ? `+$${trade.result.toFixed(2)}`
                                  : `$${trade.result?.toFixed(2)}`}
                              </span>
                            </div>
                          )}

                          {/* Direction Arrow */}
                          <div className="ml-1">
                            {trade.direction === "higher" ? (
                              <TrendingUp className="w-4 h-4 text-white" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </motion.div>

                        {/* Entry Price Line Indicator */}
                        <div
                          className="absolute left-full ml-2 flex items-center"
                          style={{ top: "50%", transform: "translateY(-50%)" }}
                        >
                          <div
                            className="text-xs font-mono px-2 py-0.5 rounded"
                            style={{
                              backgroundColor:
                                trade.direction === "higher"
                                  ? "#22c55e"
                                  : "#ef4444",
                              color: "white",
                            }}
                          >
                            {trade.entryPrice.toFixed(5)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {/* Hover Effect Overlay for HIGHER */}
              <AnimatePresence>
                {hoveredButton === "higher" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(34, 197, 94, 0.15) 0%, transparent 50%)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Hover Effect Overlay for LOWER */}
              <AnimatePresence>
                {hoveredButton === "lower" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Trade Details Panel */}
          {selectedTrade && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-col border-l border-r overflow-hidden"
              style={{ backgroundColor: "#0d1626", borderColor: "#1a2d45" }}
            >
              {/* Trade Details Header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: "#1a2d45" }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg"><AssetFlag flag={selectedTrade.flag} symbol={selectedTrade.symbol} size={20} /></span>
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "#eef2f7" }}
                  >
                    {selectedTrade.symbol} ({selectedTrade.type})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTrade(null)}
                  className="hover:opacity-75 transition-opacity"
                  style={{ color: "#8b9ab8", fontSize: "18px" }}
                >
                  ✕
                </button>
              </div>

              {/* Chart Area - Simplified */}
              <div
                className="h-48 border-b flex items-center justify-center relative"
                style={{
                  backgroundColor: "#070c15",
                  borderColor: "#1a2d45",
                }}
              >
                {/* Background overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: "#070c15",
                    opacity: 0.95,
                  }}
                />
                <div className="text-center relative z-10">
                  <div className="mb-4 relative">
                    {/* Simple price line visualization */}
                    <div
                      className="w-64 h-1 rounded"
                      style={{ backgroundColor: "#1a2d45" }}
                    >
                      <div
                        className="h-1 rounded transition-all duration-1000"
                        style={{
                          width: "70%",
                          backgroundColor:
                            selectedTrade.result === "win"
                              ? "#5ddf38"
                              : "#ff4747",
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-0 text-right">
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#eef2f7" }}
                      >
                        {selectedTrade.closePrice}
                      </div>
                    </div>
                    <div className="absolute top-2 left-0">
                      <div className="text-sm" style={{ color: "#4a6080" }}>
                        {selectedTrade.openPrice}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: "#4a6080" }}>
                    Trade executed based on tick-by-tick quotes
                  </div>
                  <div
                    className="text-xs font-semibold mt-1"
                    style={{ color: "#ff8516" }}
                  >
                    Historical Quotes
                  </div>
                </div>
              </div>

              {/* Trade Summary */}
              <div className="p-4 space-y-4">
                {/* Net P/L */}
                <div>
                  <div className="text-sm mb-2" style={{ color: "#4a6080" }}>
                    NET P/L
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color:
                          selectedTrade.result === "win"
                            ? "#5ddf38"
                            : "#ff4747",
                      }}
                    >
                      {selectedTrade.result === "win" ? "+" : ""}$
                      {Math.abs(selectedTrade.profit).toLocaleString()} (
                      {selectedTrade.percentage})
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{ color: "#4a6080" }}>
                        INVEST
                      </div>
                      <div
                        className="text-lg font-semibold"
                        style={{ color: "#eef2f7" }}
                      >
                        ${selectedTrade.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position Status */}
                <div className="text-center py-2">
                  <div className="text-sm mb-1" style={{ color: "#4a6080" }}>
                    Position closed automatically
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="w-4 h-4" style={{ color: "#4a6080" }} />
                    <span className="text-xs" style={{ color: "#4a6080" }}>
                      {selectedTrade.date} {selectedTrade.time}
                    </span>
                  </div>
                </div>

                {/* Trade Details Table */}
                <div
                  className="border-t pt-4"
                  style={{ borderColor: "#1a2d45" }}
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span style={{ color: "#4a6080" }}>Time</span>
                    <span style={{ color: "#4a6080" }}>Value</span>
                    <span style={{ color: "#4a6080" }}>Amount</span>
                    <span style={{ color: "#4a6080" }}>Result (P/L)</span>
                  </div>

                  {/* Trade Entry */}
                  <div
                    className="flex items-center justify-between text-sm py-2 border-b"
                    style={{ borderColor: "#1a2d45" }}
                  >
                    <span style={{ color: "#eef2f7" }}>
                      {selectedTrade.date}
                    </span>
                    <div className="flex items-center space-x-1">
                      {selectedTrade.direction === "higher" ? (
                        <TrendingUp
                          className="w-3 h-3"
                          style={{ color: "#5ddf38" }}
                        />
                      ) : (
                        <TrendingDown
                          className="w-3 h-3"
                          style={{ color: "#ff4747" }}
                        />
                      )}
                      <span style={{ color: "#eef2f7" }}>
                        {selectedTrade.openPrice}
                      </span>
                    </div>
                    <span style={{ color: "#eef2f7" }}>
                      ${selectedTrade.amount.toFixed(2)}
                    </span>
                    <span
                      style={{
                        color:
                          selectedTrade.result === "win"
                            ? "#5ddf38"
                            : "#ff4747",
                      }}
                    >
                      {selectedTrade.result === "win" ? "+" : ""}$
                      {Math.abs(selectedTrade.profit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Right Panel: M4Capital Trading Panel */}
          <div
            className="flex-col flex"
            style={{
              backgroundColor: "#0a1020",
              borderLeft: "1px solid #1a2d45",
              overflow: "hidden",
              width: "130px",
              minWidth: "130px",
            }}
          >
            <div className="p-2 h-full overflow-y-auto flex flex-col gap-1.5">
              {/* Invest Section */}
              <div className="rounded overflow-hidden" style={{ backgroundColor: "#0f1a2a", border: "1px solid #1a2d45" }}>
                <div className="flex items-center justify-between px-2 py-1" style={{ borderBottom: "1px solid #1a2d45" }}>
                  <span className="text-[11px] font-medium" style={{ color: "#8b9ab8" }}>Invest</span>
                  <button className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: "#1a2d45", color: "#4a6080" }}>?</button>
                </div>
                <div className="flex items-stretch">
                  <div className="flex-1 px-2 py-1.5 flex items-center gap-0.5">
                    <span className="font-semibold" style={{ color: "#4a6080", fontSize: "12px" }}>$</span>
                    <input
                      type="text"
                      value={amount.toLocaleString()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(val)) setAmount(Math.min(Math.max(val, 1), 1000000));
                      }}
                      className="bg-transparent border-none outline-none font-bold w-full"
                      style={{ color: "#eef2f7", fontSize: "14px" }}
                    />
                  </div>
                  <div className="flex flex-col" style={{ borderLeft: "1px solid #1a2d45", width: "22px" }}>
                    <button onClick={() => setAmount(Math.min(amount + 1000, 1000000))} className="flex-1 flex items-center justify-center transition-colors text-sm font-bold" style={{ color: "#4a6080", borderBottom: "1px solid #1a2d45" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor="#1a2d45", e.currentTarget.style.color="#eef2f7")} onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent", e.currentTarget.style.color="#4a6080")}>+</button>
                    <button onClick={() => setAmount(Math.max(amount - 1000, 1))} className="flex-1 flex items-center justify-center transition-colors text-sm font-bold" style={{ color: "#4a6080" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor="#1a2d45", e.currentTarget.style.color="#eef2f7")} onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent", e.currentTarget.style.color="#4a6080")}>-</button>
                  </div>
                </div>
              </div>

              {/* Expiration Section */}
              <div className="relative" ref={expirationButtonRef}>
                <div
                  className="rounded overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#0f1a2a", border: "1px solid #1a2d45" }}
                  onClick={() => {
                    if (!showExpirationModal && expirationButtonRef.current) {
                      const rect = expirationButtonRef.current.getBoundingClientRect();
                      setExpirationDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                    }
                    setShowExpirationModal(!showExpirationModal);
                  }}
                >
                  <div className="flex items-stretch flex-1">
                    <div className="flex-1">
                      <div className="flex items-center justify-between px-2 py-1" style={{ borderBottom: "1px solid #1a2d45" }}>
                        <span className="text-[11px] font-medium" style={{ color: "#8b9ab8" }}>Expiration</span>
                        <button className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ backgroundColor: "#1a2d45", color: "#4a6080" }} onClick={e => e.stopPropagation()}>?</button>
                      </div>
                      <div className="px-2 py-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" style={{ color: "#8b9ab8" }} />
                        <span className="font-bold" style={{ color: "#eef2f7", fontSize: "14px" }}>
                          {(() => {
                            const now = new Date();
                            const expTime = new Date(now.getTime() + expirationSeconds * 1000);
                            return `${String(expTime.getHours()).padStart(2, '0')}:${String(expTime.getMinutes()).padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col" style={{ borderLeft: "1px solid #1a2d45", width: "22px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const options = [30, 60, 120, 180, 240, 300, 600, 900, 1800, 3600];
                          const currentIndex = options.indexOf(expirationSeconds);
                          if (currentIndex < options.length - 1) setExpirationSeconds(options[currentIndex + 1]);
                        }}
                        className="flex-1 flex items-center justify-center transition-colors text-sm font-bold"
                        style={{ color: "#4a6080", borderBottom: "1px solid #1a2d45" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor="#1a2d45", e.currentTarget.style.color="#eef2f7")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent", e.currentTarget.style.color="#4a6080")}
                      >+</button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const options = [30, 60, 120, 180, 240, 300, 600, 900, 1800, 3600];
                          const currentIndex = options.indexOf(expirationSeconds);
                          if (currentIndex > 0) setExpirationSeconds(options[currentIndex - 1]);
                        }}
                        className="flex-1 flex items-center justify-center transition-colors text-sm font-bold"
                        style={{ color: "#4a6080" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor="#1a2d45", e.currentTarget.style.color="#eef2f7")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor="transparent", e.currentTarget.style.color="#4a6080")}
                      >-</button>
                    </div>
                  </div>
                </div>

                {/* Expiration Time Dropdown */}
                {showExpirationModal && expirationDropdownPos && (
                  <>
                    <div className="fixed inset-0 z-[200]" onClick={() => setShowExpirationModal(false)} />
                    <div
                      className="fixed z-[201] rounded-lg shadow-2xl overflow-hidden"
                      style={{ backgroundColor: "#0f1a2a", border: "1px solid #1a2d45", width: "280px", top: expirationDropdownPos.top, right: expirationDropdownPos.right }}
                    >
                      <div className="p-2">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1 px-1">
                              <span className="text-[10px] font-medium" style={{ color: "#8b9ab8" }}>Profit</span>
                              <span className="px-1 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: "#00c087", color: "white" }}>85%</span>
                            </div>
                            {[
                              { seconds: 30, label: "30s" },
                              { seconds: 60, label: "1 min" },
                              { seconds: 120, label: "2 min" },
                              { seconds: 180, label: "3 min" },
                              { seconds: 300, label: "5 min" },
                            ].map((option) => {
                              const now = new Date();
                              const expTime = new Date(now.getTime() + option.seconds * 1000);
                              const timeStr = `${String(expTime.getHours()).padStart(2, '0')}:${String(expTime.getMinutes()).padStart(2, '0')}`;
                              const isSelected = expirationSeconds === option.seconds;
                              return (
                                <button
                                  key={option.seconds}
                                  onClick={() => { setExpirationSeconds(option.seconds); setShowExpirationModal(false); }}
                                  className={`w-full flex items-center justify-between py-1 px-1.5 rounded text-[10px] transition-all ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                >
                                  <span style={{ color: isSelected ? '#ffffff' : '#8b9ab8' }}>{timeStr}</span>
                                  <span className="flex items-center gap-0.5" style={{ color: "#4a6080" }}>
                                    <Clock className="w-2 h-2" />
                                    {option.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="w-px" style={{ backgroundColor: "#1a2d45" }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1 px-1">
                              <span className="text-[10px] font-medium" style={{ color: "#8b9ab8" }}>Profit</span>
                              <span className="px-1 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: "#00c087", color: "white" }}>84%</span>
                            </div>
                            {[
                              { seconds: 600, label: "10 min" },
                              { seconds: 900, label: "15 min" },
                              { seconds: 1800, label: "30 min" },
                              { seconds: 2700, label: "45 min" },
                              { seconds: 3600, label: "1 hour" },
                            ].map((option) => {
                              const now = new Date();
                              const expTime = new Date(now.getTime() + option.seconds * 1000);
                              const timeStr = `${String(expTime.getHours()).padStart(2, '0')}:${String(expTime.getMinutes()).padStart(2, '0')}`;
                              const isSelected = expirationSeconds === option.seconds;
                              return (
                                <button
                                  key={option.seconds}
                                  onClick={() => { setExpirationSeconds(option.seconds); setShowExpirationModal(false); }}
                                  className={`w-full flex items-center justify-between py-1 px-1.5 rounded text-[10px] transition-all ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                >
                                  <span style={{ color: isSelected ? '#ffffff' : '#8b9ab8' }}>{timeStr}</span>
                                  <span className="flex items-center gap-0.5" style={{ color: "#4a6080" }}>
                                    <Clock className="w-2 h-2" />
                                    {option.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profit Display */}
              <div className="py-2.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  <span className="text-[10px] font-medium" style={{ color: "#8b9ab8" }}>Profit</span>
                  <div className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold cursor-pointer" style={{ backgroundColor: "#1a2d45", color: "#4a6080" }}>?</div>
                </div>
                <div className="font-normal" style={{ color: "#00c087", fontSize: "40px", lineHeight: 1.6, fontWeight: 400 }}>+85%</div>
                <div className="font-normal mt-1.5" style={{ color: "#00c087", fontSize: "20px", lineHeight: 1.6, fontWeight: 400 }}>
                  +$ {(amount * 0.85).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
              </div>

              {/* HIGHER Button */}
              <motion.button
                onClick={() => executeTrade("higher")}
                onMouseEnter={() => setHoveredButton("higher")}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={isExecutingTrade}
                className="w-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 cursor-pointer bg-transparent border-0 p-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <img src="/traderoom/icons/higher-button.png" alt="Higher" className="w-full object-contain" style={{ maxHeight: "96px" }} />
              </motion.button>

              {/* LOWER Button */}
              <motion.button
                onClick={() => executeTrade("lower")}
                onMouseEnter={() => setHoveredButton("lower")}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={isExecutingTrade}
                className="w-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 cursor-pointer bg-transparent border-0 p-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <img src="/traderoom/icons/lower-button.png" alt="Lower" className="w-full object-contain" style={{ maxHeight: "96px" }} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Total Portfolio Section - IQ Option Style */}
        <div
          className="border-t"
          style={{ backgroundColor: "#070c15", borderColor: "#1a2d45" }}
        >
          {/* Portfolio Header Bar - Always Visible */}
          <button
            onClick={() => setShowPortfolioPanel(!showPortfolioPanel)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#111d30] transition-colors"
          >
            <span className="text-sm font-medium" style={{ color: "#eef2f7" }}>
              Total portfolio
            </span>
            <span
              className="text-sm flex items-center gap-1"
              style={{ color: "#ff8516" }}
            >
              {showPortfolioPanel ? "Hide positions" : "Show positions"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showPortfolioPanel ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {/* Expanded Portfolio Panel */}
          <AnimatePresence>
            {showPortfolioPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t"
                style={{ borderColor: "#1a2d45" }}
              >
                <div
                  className="p-8 flex flex-col items-center justify-center"
                  style={{ backgroundColor: "#070c15", minHeight: "150px" }}
                >
                  {activeTrades.filter((t) => t.status === "active").length ===
                  0 ? (
                    <>
                      <p className="text-sm mb-3" style={{ color: "#8b9ab8" }}>
                        You have no open positions yet
                      </p>
                      <button
                        onClick={() => { setAddAssetSideTab("trending"); setAddAssetSearch(""); setShowAddAssetModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border transition-colors hover:bg-[#111d30]"
                        style={{ borderColor: "#1a2d45", color: "#8b9ab8" }}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Select asset</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      {/* Active Positions List */}
                      <div className="space-y-2">
                        {activeTrades
                          .filter((t) => t.status === "active")
                          .map((trade) => {
                            const remaining = Math.max(
                              0,
                              trade.expirationTime - Date.now()
                            );
                            const remainingSeconds = Math.ceil(
                              remaining / 1000
                            );
                            return (
                              <div
                                key={trade.id}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ backgroundColor: "#0d1626" }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      trade.direction === "higher"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  <div>
                                    <div
                                      className="font-medium text-sm"
                                      style={{ color: "#eef2f7" }}
                                    >
                                      {trade.symbol}
                                    </div>
                                    <div
                                      className="text-xs"
                                      style={{ color: "#8b9ab8" }}
                                    >
                                      {trade.direction.toUpperCase()} •{" "}
                                      {remainingSeconds}s
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div
                                    className="font-bold text-sm"
                                    style={{ color: "#eef2f7" }}
                                  >
                                    ${trade.amount.toLocaleString()}
                                  </div>
                                  <div
                                    className="text-xs"
                                    style={{ color: "#8b9ab8" }}
                                  >
                                    Entry: {trade.entryPrice.toFixed(5)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - IQ Option Style */}
        <footer
          className="flex items-center justify-between px-4 py-2 border-t"
          style={{ backgroundColor: "#131211", borderColor: "#1a2d45" }}
        >
          {/* Left: Support */}
          <div className="flex items-center gap-4">
            <button
              className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
              style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
            >
              <Headphones className="w-3.5 h-3.5" />
              SUPPORT
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#8b9ab8" }}>
                @
              </span>
              <span className="text-xs" style={{ color: "#8b9ab8" }}>
                support@m4capital.online
              </span>
            </div>
            <span className="text-xs" style={{ color: "#8b9ab8" }}>
              EVERY DAY, AROUND THE CLOCK
            </span>
          </div>

          {/* Center: Powered By */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#8b9ab8" }}>
              Powered by
            </span>
            <Image
              src="/m4capitallogo2.png"
              alt="M4Capital"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>

          {/* Right: Time and Controls */}
          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <button className="p-1.5 rounded hover:bg-[#111d30] transition-colors">
              <svg
                className="w-4 h-4"
                style={{ color: "#8b9ab8" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>

            {/* Settings */}
            <button className="p-1.5 rounded hover:bg-[#111d30] transition-colors">
              <Settings className="w-4 h-4" style={{ color: "#8b9ab8" }} />
            </button>

            {/* Notifications */}
            <button className="p-1.5 rounded hover:bg-[#111d30] transition-colors">
              <Bell className="w-4 h-4" style={{ color: "#8b9ab8" }} />
            </button>

            {/* Current Time */}
            <div className="text-xs" style={{ color: "#8b9ab8" }}>
              CURRENT TIME:{" "}
              <span style={{ color: "#eef2f7" }}>
                {currentTime
                  ? currentTime.toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : ""}{" "}
                AT{" "}
                {currentTime
                  ? currentTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                  : ""}{" "}
                (UTC+1)
              </span>
            </div>

            {/* Fullscreen */}
            <button className="p-1.5 rounded hover:bg-[#111d30] transition-colors">
              <svg
                className="w-4 h-4"
                style={{ color: "#8b9ab8" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </footer>

        {/* Add Asset Modal - IQ Option Style */}
        <AnimatePresence>
          {showAddAssetModal && (() => {
            const profitPctMap: Record<string, number> = {
              "EUR/USD": 86, "GBP/USD": 85, "USD/JPY": 84, "USD/CAD": 83,
              "AUD/USD": 82, "USD/BRL": 88, "AUD/CHF": 88,
              "BTC/USD": 87, "ETH/USD": 85, "XRP/USD": 84,
              "TSLA": 87, "AAPL": 89, "NVDA": 88, "GOOGL": 86,
              "MSFT": 85, "AMZN": 86, "META": 87, "NFLX": 83,
            };
            const popularityMap: Record<string, number> = {
              "EUR/USD": 3, "GBP/USD": 3, "USD/JPY": 2, "USD/CAD": 2,
              "AUD/USD": 2, "BTC/USD": 3, "ETH/USD": 3, "XRP/USD": 2,
              "TSLA": 3, "AAPL": 3, "NVDA": 3, "GOOGL": 2,
              "MSFT": 2, "AMZN": 2, "META": 2, "NFLX": 2,
            };
            const volatilityMap: Record<string, number> = {
              "EUR/USD": 2, "GBP/USD": 2, "USD/JPY": 2, "USD/CAD": 1,
              "AUD/USD": 2, "BTC/USD": 3, "ETH/USD": 3, "XRP/USD": 3,
              "TSLA": 2, "AAPL": 1, "NVDA": 2, "GOOGL": 1,
              "MSFT": 1, "AMZN": 2, "META": 2, "NFLX": 2,
            };
            const newBadgeSymbols = new Set(["AUD Index", "GBP Index", "CAD Index", "EUR Index"]);

            const blitzCount = symbols.length;
            const binaryCount = symbols.filter(s => s.category === "Forex").length;
            const digitalCount = symbols.filter(s => s.category === "Stocks" || s.category === "Index").length;
            const marginCount = symbols.filter(s => s.category === "Crypto").length;

            const getDisplaySymbols = () => {
              let filtered = [...symbols];
              if (addAssetSideTab === "options") {
                if (addAssetOptionsSubTab === "blitz") filtered = [...symbols]; // all assets
                else if (addAssetOptionsSubTab === "binary") filtered = symbols.filter(s => s.category === "Forex");
                else if (addAssetOptionsSubTab === "digital") filtered = symbols.filter(s => s.category === "Stocks" || s.category === "Index");
              } else if (addAssetSideTab === "margin") {
                filtered = symbols.filter(s => s.category === "Crypto");
              } else if (addAssetSideTab === "watchlist") {
                filtered = symbols.filter(s => watchlistedSymbols.includes(s.symbol));
              }
              if (addAssetSearch.trim()) {
                const q = addAssetSearch.toLowerCase();
                filtered = filtered.filter(s => s.symbol.toLowerCase().includes(q));
              }
              return filtered;
            };

            const displaySymbols = getDisplaySymbols();

            const handleSelectSymbol = (sym: typeof symbols[0]) => {
              if (!openTabs.some(t => t.symbol === sym.symbol)) {
                setOpenTabs([...openTabs, { symbol: sym.symbol, type: "Binary" }]);
                setActiveTab(openTabs.length);
              } else {
                setActiveTab(openTabs.findIndex(t => t.symbol === sym.symbol));
              }
              setSelectedSymbol(sym.symbol);
              setShowAddAssetModal(false);
            };

            const toggleWatchlist = (e: React.MouseEvent, symName: string) => {
              e.stopPropagation();
              setWatchlistedSymbols(prev =>
                prev.includes(symName) ? prev.filter(s => s !== symName) : [...prev, symName]
              );
            };

            const FlameIcons = ({ count }: { count: number }) => (
              <div className="flex items-center gap-0.5">
                {[1,2,3].map(i => (
                  <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"
                    style={{ color: i <= count ? "#e8690a" : "#1e2f44" }}>
                    <path d="M12 2c0 0-5 5-5 10a5 5 0 0010 0c0-5-5-10-5-10zm0 14a3 3 0 110-6 3 3 0 010 6z"/>
                  </svg>
                ))}
              </div>
            );

            const VolatilityBars = ({ count }: { count: number }) => (
              <div className="flex items-end gap-0.5 h-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-1.5 rounded-sm"
                    style={{
                      height: i === 1 ? "5px" : i === 2 ? "9px" : "14px",
                      backgroundColor: i <= count ? "#e8690a" : "#1e2f44",
                    }}
                  />
                ))}
              </div>
            );

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100]"
                style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                onClick={() => setShowAddAssetModal(false)}
              >
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -30, opacity: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 340 }}
                  className="flex h-full shadow-2xl"
                  style={{ width: "680px", maxWidth: "100vw" }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* ── Left Sidebar ── */}
                  <div className="flex flex-col flex-shrink-0 overflow-y-auto"
                    style={{ width: "196px", backgroundColor: "#131c2e", borderRight: "1px solid #1d2d45" }}>

                    {/* Trending */}
                    <button
                      onClick={() => setAddAssetSideTab("trending")}
                      className="flex items-center gap-3 px-4 py-4 transition-colors"
                      style={{
                        backgroundColor: addAssetSideTab === "trending" ? "#1a2840" : "transparent",
                        color: addAssetSideTab === "trending" ? "#fff" : "#6b82a0",
                        borderLeft: addAssetSideTab === "trending" ? "3px solid #4c8dff" : "3px solid transparent",
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#162032" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M12 20V10M18 20V4M6 20v-4"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Trending</span>
                    </button>

                    {/* Options parent + sub-items */}
                    <div>
                      <button
                        onClick={() => { setAddAssetSideTab("options"); }}
                        className="w-full flex items-center gap-3 px-4 py-4 transition-colors"
                        style={{
                          backgroundColor: addAssetSideTab === "options" ? "#1a2840" : "transparent",
                          color: addAssetSideTab === "options" ? "#fff" : "#6b82a0",
                          borderLeft: addAssetSideTab === "options" ? "3px solid #4c8dff" : "3px solid transparent",
                        }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#162032" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium flex-1 text-left">Options</span>
                      </button>

                      {/* Blitz / Binary / Digital sub-items */}
                      <div style={{ backgroundColor: "#0c1622" }}>
                        {([
                          { id: "blitz" as const, label: "Blitz", count: blitzCount },
                          { id: "binary" as const, label: "Binary", count: binaryCount },
                          { id: "digital" as const, label: "Digital", count: digitalCount },
                        ]).map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => { setAddAssetSideTab("options"); setAddAssetOptionsSubTab(sub.id); }}
                            className="w-full flex items-center justify-between py-2.5 pr-3 transition-colors"
                            style={{
                              paddingLeft: "52px",
                              backgroundColor: addAssetSideTab === "options" && addAssetOptionsSubTab === sub.id ? "#162234" : "transparent",
                              color: addAssetSideTab === "options" && addAssetOptionsSubTab === sub.id ? "#fff" : "#6b82a0",
                            }}
                          >
                            <span className="text-sm">{sub.label}</span>
                            <span className="text-xs font-bold rounded-full px-2 py-0.5"
                              style={{ backgroundColor: "#e8690a", color: "#fff", minWidth: "30px", textAlign: "center" }}>
                              {sub.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margin */}
                    <button
                      onClick={() => setAddAssetSideTab("margin")}
                      className="flex items-center gap-3 px-4 py-4 transition-colors"
                      style={{
                        backgroundColor: addAssetSideTab === "margin" ? "#1a2840" : "transparent",
                        color: addAssetSideTab === "margin" ? "#fff" : "#6b82a0",
                        borderLeft: addAssetSideTab === "margin" ? "3px solid #4c8dff" : "3px solid transparent",
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#162032" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">Margin</span>
                      <span className="text-xs font-bold rounded-full px-2 py-0.5"
                        style={{ backgroundColor: "#e8690a", color: "#fff", minWidth: "30px", textAlign: "center" }}>
                        {marginCount}
                      </span>
                    </button>

                    {/* Watchlist */}
                    <button
                      onClick={() => setAddAssetSideTab("watchlist")}
                      className="flex items-center gap-3 px-4 py-4 transition-colors"
                      style={{
                        backgroundColor: addAssetSideTab === "watchlist" ? "#1a2840" : "transparent",
                        color: addAssetSideTab === "watchlist" ? "#fff" : "#6b82a0",
                        borderLeft: addAssetSideTab === "watchlist" ? "3px solid #4c8dff" : "3px solid transparent",
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#162032" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">Watchlist</span>
                      <span className="text-xs font-bold rounded-full px-2 py-0.5"
                        style={{ backgroundColor: "#162032", color: "#6b82a0", minWidth: "30px", textAlign: "center" }}>
                        {watchlistedSymbols.length}
                      </span>
                    </button>
                  </div>

                  {/* ── Main Content Panel ── */}
                  <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: "#0f1a2a" }}>

                    {/* Search bar */}
                    <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid #1a2d45" }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#3d5470" }} />
                        <input
                          type="text"
                          placeholder="Search by name or ticker"
                          value={addAssetSearch}
                          onChange={e => setAddAssetSearch(e.target.value)}
                          autoFocus
                          className="w-full rounded-full pl-9 pr-4 py-2 text-sm outline-none"
                          style={{
                            backgroundColor: "#152030",
                            border: "1px solid #1d3050",
                            color: "#ffffff",
                          }}
                        />
                      </div>
                    </div>

                    {/* Table header */}
                    {addAssetSideTab !== "watchlist" && (
                      <div className="flex items-center px-4 py-2 flex-shrink-0 text-xs select-none"
                        style={{ borderBottom: "1px solid #1a2d45", color: "#3d5470" }}>
                        <div className="flex-1 font-medium">Asset</div>
                        <div className="w-20 text-right pr-3 font-medium flex items-center justify-end gap-1">
                          Profit
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 flex-shrink-0">
                            <path d="M18 15l-6-6-6 6"/>
                          </svg>
                        </div>
                        <div className="w-20 text-center font-medium">Popular</div>
                        <div className="w-20 text-center font-medium">Volatility</div>
                        <div className="w-14 text-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 mx-auto">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Asset rows */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {addAssetSideTab === "watchlist" && displaySymbols.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-52 gap-3 pt-8">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14" style={{ color: "#1a2d45" }}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          <p className="font-medium text-sm" style={{ color: "#3d5470" }}>Your watchlist is empty</p>
                          <p className="text-xs text-center max-w-[200px]" style={{ color: "#233344" }}>
                            Click ☆ on any asset to add it here
                          </p>
                        </div>
                      ) : displaySymbols.length === 0 ? (
                        <p className="text-center py-12 text-sm" style={{ color: "#3d5470" }}>No assets found</p>
                      ) : (
                        displaySymbols.map(sym => {
                          const profit = profitPctMap[sym.symbol] ?? 87;
                          const popularity = popularityMap[sym.symbol] ?? 2;
                          const volatility = volatilityMap[sym.symbol] ?? 2;
                          const isWatchlisted = watchlistedSymbols.includes(sym.symbol);
                          const isActive = openTabs.some(t => t.symbol === sym.symbol);
                          const isNew = newBadgeSymbols.has(sym.symbol);

                          return (
                            <button
                              key={sym.symbol}
                              onClick={() => handleSelectSymbol(sym)}
                              className="w-full flex items-center px-4 py-2 text-left transition-colors"
                              style={{
                                backgroundColor: isActive ? "#132030" : "transparent",
                                borderBottom: "1px solid #0e1d2d",
                              }}
                              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "#111d2f"; }}
                              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                            >
                              {/* Icon + Name */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: "#172840", border: "2px solid #1e3654" }}>
                                    <AssetFlag flag={sym.flag} symbol={sym.symbol} size={18} />
                                  </div>
                                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "#e8690a", width: "14px", height: "14px", fontSize: "4.5px", color: "#fff", fontWeight: 900, lineHeight: 1 }}>
                                    OTC
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-sm font-semibold text-white truncate">
                                      {(sym as any).displayName ?? sym.symbol} (OTC)
                                    </span>
                                    {isNew && (
                                      <span className="text-white px-1 rounded flex-shrink-0 font-bold"
                                        style={{ backgroundColor: "#1a5080", fontSize: "9px" }}>
                                        NEW
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs block" style={{ color: "#3d5470" }}>{sym.price}</span>
                                </div>
                              </div>

                              {/* Profit */}
                              <div className="w-20 text-right pr-3 flex-shrink-0">
                                <span className="text-sm font-bold" style={{ color: "#22c55e" }}>{profit}%</span>
                              </div>

                              {/* Popular */}
                              <div className="w-20 flex justify-center flex-shrink-0">
                                <FlameIcons count={popularity} />
                              </div>

                              {/* Volatility */}
                              <div className="w-20 flex justify-center flex-shrink-0">
                                <VolatilityBars count={volatility} />
                              </div>

                              {/* Star + Info */}
                              <div className="w-14 flex items-center justify-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={e => toggleWatchlist(e, sym.symbol)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: isWatchlisted ? "#f59e0b" : "#2a3e56" }}
                                  onMouseEnter={e => { if (!isWatchlisted) (e.currentTarget as HTMLElement).style.color = "#6b82a0"; }}
                                  onMouseLeave={e => { if (!isWatchlisted) (e.currentTarget as HTMLElement).style.color = "#2a3e56"; }}
                                >
                                  <svg viewBox="0 0 24 24" className="w-4 h-4"
                                    fill={isWatchlisted ? "currentColor" : "none"}
                                    stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={e => e.stopPropagation()}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: "#2a3e56" }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6b82a0"; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#2a3e56"; }}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                  </svg>
                                </button>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Trading History Modal */}
        <AnimatePresence>
          {showTradingHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTradingHistory(false)}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[80vh] rounded-lg overflow-hidden"
                style={{ backgroundColor: "#070c15" }}
              >
                {/* Header */}
                <div
                  className="p-4 border-b flex items-center justify-between"
                  style={{ borderColor: "#1a2d45" }}
                >
                  <div className="flex items-center space-x-3">
                    <History className="w-6 h-6" style={{ color: "#ff8516" }} />
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: "#ffffff" }}
                    >
                      Trading History
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowTradingHistory(false)}
                    className="p-2 hover:opacity-75 transition-opacity"
                    style={{ color: "#8b9ab8" }}
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>

                {/* Filter Bar */}
                <div
                  className="p-4 border-b flex items-center justify-between"
                  style={{ borderColor: "#1a2d45" }}
                >
                  <div className="flex items-center space-x-4">
                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm border"
                      style={{
                        backgroundColor: "#1a2d45",
                        borderColor: "#4a4540",
                        color: "#8b9ab8",
                      }}
                    >
                      <option value="All Positions">All Positions</option>
                      <option value="Win">Wins Only</option>
                      <option value="Loss">Losses Only</option>
                      <option value="Open">Open Positions</option>
                    </select>
                  </div>
                  <div className="text-sm" style={{ color: "#8b9ab8" }}>
                    Total Trades: {tradeHistory.length + openPositions.length}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-96">
                  {/* Open Positions */}
                  {openPositions.length > 0 && (
                    <div className="mb-6">
                      <h3
                        className="text-lg font-medium mb-3"
                        style={{ color: "#ff8516" }}
                      >
                        Open Positions ({openPositions.length})
                      </h3>
                      <div className="space-y-2">
                        {openPositions.map((position) => (
                          <div
                            key={position.id}
                            className="p-3 rounded-lg border flex items-center justify-between"
                            style={{
                              backgroundColor: "#252320",
                              borderColor: "#1a2d45",
                            }}
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className="font-medium"
                                  style={{ color: "#ffffff" }}
                                >
                                  {position.symbol}
                                </span>
                                <span
                                  className="px-2 py-1 rounded text-xs"
                                  style={{
                                    backgroundColor:
                                      position.direction === "HIGHER"
                                        ? "#5ddf38"
                                        : "#ff4747",
                                    color: "#ffffff",
                                  }}
                                >
                                  {position.direction}
                                </span>
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#8b9ab8" }}
                              >
                                Amount: ${position.amount} • Entry: $
                                {position.entryPrice}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-sm"
                                style={{ color: "#8b9ab8" }}
                              >
                                {new Date(
                                  position.entryTime
                                ).toLocaleTimeString()}
                              </div>
                              <div
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: "#ffa500",
                                  color: "#ffffff",
                                }}
                              >
                                ACTIVE
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trade History */}
                  {tradeHistory.length > 0 ? (
                    <div>
                      <h3
                        className="text-lg font-medium mb-3"
                        style={{ color: "#ff8516" }}
                      >
                        Completed Trades ({tradeHistory.length})
                      </h3>
                      <div className="space-y-2">
                        {tradeHistory
                          .filter((trade) => {
                            if (historyFilter === "All Positions") return true;
                            if (historyFilter === "Win")
                              return trade.status === "WIN";
                            if (historyFilter === "Loss")
                              return trade.status === "LOSS";
                            return false;
                          })
                          .map((trade) => (
                            <div
                              key={trade.id}
                              className="p-3 rounded-lg border flex items-center justify-between"
                              style={{
                                backgroundColor: "#252320",
                                borderColor: "#1a2d45",
                              }}
                            >
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="font-medium"
                                    style={{ color: "#ffffff" }}
                                  >
                                    {trade.symbol}
                                  </span>
                                  <span
                                    className="px-2 py-1 rounded text-xs"
                                    style={{
                                      backgroundColor:
                                        trade.direction === "HIGHER"
                                          ? "#5ddf38"
                                          : "#ff4747",
                                      color: "#ffffff",
                                    }}
                                  >
                                    {trade.direction}
                                  </span>
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "#8b9ab8" }}
                                >
                                  Amount: {formatAmount(trade.amount, 2)} •
                                  Entry: ${trade.entryPrice}
                                  {trade.exitPrice &&
                                    ` • Exit: $${trade.exitPrice}`}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-medium ${
                                    trade.profit >= 0
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {trade.profit >= 0 ? "+" : ""}
                                  {formatAmount(trade.profit, 2)}
                                </div>
                                <div
                                  className="text-sm"
                                  style={{ color: "#8b9ab8" }}
                                >
                                  {new Date(trade.entryTime).toLocaleString()}
                                </div>
                                <div
                                  className={`text-xs px-2 py-1 rounded ${
                                    trade.status === "WIN"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {trade.status}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        style={{ color: "#4a6080" }}
                      />
                      <p
                        className="text-lg font-medium mb-2"
                        style={{ color: "#8b9ab8" }}
                      >
                        No Trading History
                      </p>
                      <p className="text-sm" style={{ color: "#4a6080" }}>
                        Execute some trades to see your history here
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trade Execution Indicator */}
        <AnimatePresence>
          {isExecutingTrade && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 p-4 rounded-lg shadow-lg"
              style={{
                backgroundColor:
                  tradeDirection === "higher" ? "#5ddf38" : "#ff4747",
                color: "#ffffff",
              }}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Executing {tradeDirection} trade...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer
          className="fixed bottom-0 left-0 right-0 flex items-center justify-between text-xs z-50"
          style={{
            backgroundColor: "#0a1020",
            borderTop: "1px solid #1a2d45",
            color: "#4a6080",
            height: "40px",
          }}
        >
          <div className="flex items-center pl-3 space-x-3">
            {/* Double-round support button: outer ring + inner red button with icon and text */}
            <div className="relative flex items-center justify-center">
              <div
                className="w-[80px] h-[32px] rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <button
                  className="h-[28px] px-3 rounded-md flex items-center space-x-1.5 transition-opacity duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: "#e74c3c",
                    color: "#ffffff",
                  }}
                >
                  <MessagesSquare className="w-3.5 h-3.5" />
                  <span className="font-semibold text-[10px] tracking-wide">
                    SUPPORT
                  </span>
                </button>
              </div>
            </div>

            <CircleHelp className="w-4 h-4" style={{ color: "#95a5a6" }} />

            <a
              href="mailto:support@m4capital.online"
              className="text-[13px] hover:text-orange-500 transition-colors duration-150"
              style={{ color: "#ffffff" }}
            >
              support@m4capital.online
            </a>

            <div className="text-[12px] font-bold text-gray-400 ml-2">
              EVERY DAY, AROUND THE CLOCK
            </div>
          </div>

          {/* Centered Powered by */}
          <div
            className="absolute left-1/2 flex items-center space-x-2"
            style={{ transform: "translateX(calc(-50% + 216px))" }}
          >
            <span className="text-sm">Powered by</span>
            <Image
              src="/m4capitallogo2.png"
              alt="M4Capital"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>

          <div className="flex items-center space-x-6 pr-3">
            <button className="hover:text-orange-500 transition-colors duration-200">
              <Settings className="w-4 h-4" />
            </button>
            <button className="hover:text-orange-500 transition-colors duration-200">
              <Bell className="w-4 h-4" />
            </button>
            {currentTime && (
              <span className="font-mono">
                CURRENT TIME:{" "}
                {currentTime
                  .toLocaleString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })
                  .toUpperCase()
                  .replace(",", ",")}{" "}
                (UTC+1)
              </span>
            )}
          </div>
        </footer>
      </div>

      {/* Funding Modal */}
      <AnimatePresence>
        {showFundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
            onClick={() => {
              setShowFundModal(false);
              setCryptoPaymentInfo(null);
              setFundingError("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-xl overflow-hidden"
              style={{
                backgroundColor: "#2a2624",
                border: "1px solid #38312e",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b" style={{ borderColor: "#1a2d45" }}>
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: "#eef2f7" }}
                  >
                    Fund Traderoom
                  </h2>
                  <button
                    onClick={() => {
                      setShowFundModal(false);
                      setCryptoPaymentInfo(null);
                      setFundingError("");
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: "#8b9ab8" }}
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm mt-1" style={{ color: "#8b9ab8" }}>
                  Choose how you want to fund your Traderoom balance
                </p>
              </div>

              {/* Content */}
              {!cryptoPaymentInfo ? (
                <div className="p-4 space-y-4">
                  {/* Method Selection */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFundMethod("fiat")}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        fundMethod === "fiat"
                          ? "bg-green-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      From Fiat Balance
                    </button>
                    <button
                      onClick={() => setFundMethod("crypto")}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                        fundMethod === "crypto"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Crypto Deposit
                    </button>
                  </div>

                  {/* Current Balances */}
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: "#070c15" }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{ color: "#8b9ab8" }}>
                        Fiat Balance
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "#ffffff" }}
                      >
                        ${realAccountBalanceUSD.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: "#8b9ab8" }}>
                        Traderoom Balance
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "#5ddf38" }}
                      >
                        ${traderoomBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {fundMethod === "fiat" ? (
                    <>
                      {/* Amount Input for Fiat */}
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{ color: "#8b9ab8" }}
                        >
                          Amount to Transfer
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-green-500 focus:outline-none"
                          />
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#8b9ab8" }}
                        >
                          Max: ${realAccountBalanceUSD.toFixed(2)}
                        </p>
                      </div>

                      {/* Quick amounts */}
                      <div className="flex flex-wrap gap-2">
                        {[50, 100, 250, 500, 1000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() =>
                              setFundAmount(
                                Math.min(amt, realAccountBalanceUSD).toString()
                              )
                            }
                            disabled={realAccountBalanceUSD < amt}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                            style={{
                              backgroundColor: "#1a2d45",
                              color: "#eef2f7",
                            }}
                          >
                            ${amt}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setFundAmount(realAccountBalanceUSD.toString())
                          }
                          disabled={realAccountBalanceUSD <= 0}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                          style={{
                            backgroundColor: "#1a2d45",
                            color: "#5ddf38",
                          }}
                        >
                          MAX
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Crypto Selection */}
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{ color: "#8b9ab8" }}
                        >
                          Select Cryptocurrency
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {supportedCryptos.map((crypto) => (
                            <button
                              key={crypto.code}
                              onClick={() => setSelectedCrypto(crypto.code)}
                              className={`p-3 rounded-lg text-center transition-all ${
                                selectedCrypto === crypto.code
                                  ? "bg-orange-500/20 border-orange-500"
                                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
                              } border`}
                            >
                              <div className="text-xl mb-1">{crypto.icon}</div>
                              <div
                                className="text-xs"
                                style={{ color: "#eef2f7" }}
                              >
                                {crypto.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Amount Input for Crypto */}
                      <div>
                        <label
                          className="block text-sm mb-2"
                          style={{ color: "#8b9ab8" }}
                        >
                          Amount (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            placeholder="100.00"
                            min="10"
                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#8b9ab8" }}
                        >
                          Min: $10.00
                        </p>
                      </div>
                    </>
                  )}

                  {/* Error */}
                  {fundingError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {fundingError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={
                      fundMethod === "fiat"
                        ? handleFundFromFiat
                        : handleFundWithCrypto
                    }
                    disabled={isFunding || !fundAmount}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50 ${
                      fundMethod === "fiat"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {isFunding
                      ? "Processing..."
                      : fundMethod === "fiat"
                      ? "Transfer to Traderoom"
                      : "Generate Payment Address"}
                  </button>
                </div>
              ) : (
                /* Crypto Payment Info */
                <div className="p-4 space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">
                      {supportedCryptos.find((c) => c.code === selectedCrypto)
                        ?.icon || "₿"}
                    </div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: "#eef2f7" }}
                    >
                      Send {cryptoPaymentInfo.cryptoCurrency} Payment
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "#070c15" }}
                    >
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#8b9ab8" }}
                      >
                        Amount to Send
                      </div>
                      <div
                        className="font-mono font-bold text-lg"
                        style={{ color: "#ff8516" }}
                      >
                        {cryptoPaymentInfo.cryptoAmount ||
                          cryptoPaymentInfo.paymentAmount}{" "}
                        {cryptoPaymentInfo.cryptoCurrency}
                      </div>
                      <div className="text-sm" style={{ color: "#8b9ab8" }}>
                        ≈ ${cryptoPaymentInfo.amount}
                      </div>
                    </div>

                    {cryptoPaymentInfo.paymentAddress && (
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: "#070c15" }}
                      >
                        <div
                          className="text-xs mb-1"
                          style={{ color: "#8b9ab8" }}
                        >
                          Payment Address
                        </div>
                        <div
                          className="font-mono text-xs break-all"
                          style={{ color: "#eef2f7" }}
                        >
                          {cryptoPaymentInfo.paymentAddress}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              cryptoPaymentInfo.paymentAddress
                            );
                            alert("Address copied!");
                          }}
                          className="mt-2 text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                          style={{ color: "#8b9ab8" }}
                        >
                          Copy Address
                        </button>
                      </div>
                    )}

                    {cryptoPaymentInfo.invoiceUrl && (
                      <a
                        href={cryptoPaymentInfo.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 rounded-lg font-bold text-center bg-orange-500 hover:bg-orange-600 text-white transition-all"
                      >
                        Open Payment Page
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-xs" style={{ color: "#ffc107" }}>
                      ⚠️ Send exactly the amount shown above. Your balance will
                      be credited automatically after blockchain confirmation
                      (usually 10-30 minutes).
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCryptoPaymentInfo(null);
                      setFundAmount("");
                    }}
                    className="w-full py-2 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
                    style={{ color: "#8b9ab8" }}
                  >
                    Create New Payment
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => {
              setShowWithdrawModal(false);
              setWithdrawAmount("");
              setWithdrawError("");
              setWithdrawSuccess("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl overflow-hidden"
              style={{
                backgroundColor: "#0a1020",
                border: "1px solid #3d3c4f",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: "#1a2d45" }}
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-[#5ddf38]" />
                  Withdraw to Main Balance
                </h3>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawAmount("");
                    setWithdrawError("");
                    setWithdrawSuccess("");
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {withdrawSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Withdrawal Successful!</h4>
                    <p className="text-gray-400 text-sm">{withdrawSuccess}</p>
                    <button
                      onClick={() => {
                        setShowWithdrawModal(false);
                        setWithdrawAmount("");
                        setWithdrawSuccess("");
                      }}
                      className="mt-4 px-6 py-2 rounded-lg font-medium transition-all"
                      style={{ backgroundColor: "#5ddf38", color: "#070c15" }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Balance Info */}
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: "#070c15" }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          Traderoom Balance
                        </span>
                        <span className="font-medium text-[#5ddf38]">
                          ${traderoomBalance.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          Current Fiat Balance
                        </span>
                        <span className="font-medium text-white">
                          ${realAccountBalanceUSD.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm mb-2 text-gray-400">
                        Amount to Withdraw
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          $
                        </span>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => {
                            setWithdrawAmount(e.target.value);
                            setWithdrawError("");
                          }}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#5ddf38] focus:outline-none"
                        />
                      </div>
                      <p className="text-xs mt-1 text-gray-500">
                        Max: ${traderoomBalance.toFixed(2)}
                      </p>
                    </div>

                    {/* Quick amounts */}
                    <div className="flex flex-wrap gap-2">
                      {[50, 100, 250, 500, 1000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() =>
                            setWithdrawAmount(
                              Math.min(amt, traderoomBalance).toString()
                            )
                          }
                          disabled={traderoomBalance < amt}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                          style={{
                            backgroundColor: "#1a2d45",
                            color: "#eef2f7",
                          }}
                        >
                          ${amt}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setWithdrawAmount(traderoomBalance.toString())
                        }
                        disabled={traderoomBalance <= 0}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                        style={{
                          backgroundColor: "#1a2d45",
                          color: "#5ddf38",
                        }}
                      >
                        MAX
                      </button>
                    </div>

                    {/* Error Message */}
                    {withdrawError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400">{withdrawError}</p>
                      </div>
                    )}

                    {/* Info Note */}
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-xs text-blue-400">
                        💡 Funds will be transferred instantly to your main dashboard balance.
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={async () => {
                        const amount = parseFloat(withdrawAmount);
                        if (!amount || amount <= 0) {
                          setWithdrawError("Please enter a valid amount");
                          return;
                        }
                        if (amount > traderoomBalance) {
                          setWithdrawError("Insufficient traderoom balance");
                          return;
                        }

                        setIsWithdrawing(true);
                        setWithdrawError("");

                        try {
                          const result = await withdrawFromTraderoomAction(amount);
                          if (result.success) {
                            setTraderoomBalance(result.data.newTraderoomBalance);
                            setRealAccountBalanceUSD(result.data.newFiatBalance);
                            setWithdrawSuccess(
                              `$${amount.toFixed(2)} has been transferred to your main balance.`
                            );
                          } else {
                            setWithdrawError(result.error || "Withdrawal failed");
                          }
                        } catch (error) {
                          setWithdrawError("An error occurred. Please try again.");
                        } finally {
                          setIsWithdrawing(false);
                        }
                      }}
                      disabled={
                        isWithdrawing ||
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0 ||
                        parseFloat(withdrawAmount) > traderoomBalance
                      }
                      className="w-full py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#5ddf38", color: "#070c15" }}
                    >
                      {isWithdrawing ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Withdraw"
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function TraderoomPage() {
  return (
    <ErrorBoundary>
      <CryptoMarketProvider>
        <TradingProvider>
          <TradingInterface />
        </TradingProvider>
      </CryptoMarketProvider>
    </ErrorBoundary>
  );
}
