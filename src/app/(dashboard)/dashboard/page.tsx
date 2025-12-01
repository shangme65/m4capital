"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";
import { useNotifications, Transaction } from "@/contexts/NotificationContext";
import { useToast } from "@/contexts/ToastContext";
import {
  CryptoMarketProvider,
  useCryptoPrices,
} from "@/components/client/CryptoMarketProvider";
import { usePortfolio } from "@/lib/usePortfolio";
import TransactionDetailsModal from "@/components/client/TransactionDetailsModal";
import AssetDetailsModal from "@/components/client/AssetDetailsModal";
import AddCryptoModal from "@/components/client/AddCryptoModal";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getCurrencySymbol } from "@/lib/currencies";
import { useVerificationGate } from "@/hooks/useVerificationGate";
import VerificationRequiredModal from "@/components/client/VerificationRequiredModal";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

// Dashboard content component with crypto integration
function DashboardContent() {
  const { data: session, status } = useSession();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get portfolio first to know which symbols to fetch
  const {
    portfolio,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch,
  } = usePortfolio("all");

  // Memoize portfolio symbols to prevent unnecessary re-subscriptions
  const portfolioSymbols = useMemo(
    () => portfolio?.portfolio?.assets?.map((a: any) => a.symbol) || [],
    [portfolio?.portfolio?.assets]
  );

  // Re-enabled: Fetch real-time crypto prices for portfolio assets
  const cryptoPrices = useCryptoPrices(portfolioSymbols);

  const {
    openDepositModal,
    openWithdrawModal,
    openBuyModal,
    openTransferModal,
    openConvertModal,
    openSellModal,
  } = useModal();
  const { recentActivity } = useNotifications();
  const { showSuccess, showError } = useToast();
  const {
    requireVerification,
    showVerificationModal,
    setShowVerificationModal,
    pendingAction,
    kycStatus,
  } = useVerificationGate();
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const isClosingModalRef = useRef(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activeView, setActiveView] = useState<"crypto" | "history">("crypto");
  const [showAddCryptoModal, setShowAddCryptoModal] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [traderoomBalance, setTraderoomBalance] = useState<number>(0);

  // Check URL for asset parameter on mount to restore modal state after refresh
  const urlAssetSymbol = searchParams.get("asset");

  // Load activeView and showBalances from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const savedView = localStorage.getItem("dashboardActiveView") as
      | "crypto"
      | "history";
    if (savedView) {
      setActiveView(savedView);
    }

    const savedShowBalances = localStorage.getItem("showBalances");
    if (savedShowBalances !== null) {
      setShowBalances(savedShowBalances === "true");
    }
  }, []);

  // Persist activeView to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardActiveView", activeView);
    }
  }, [activeView]);

  // Persist showBalances to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showBalances", showBalances.toString());
    }
  }, [showBalances]);

  // Fetch traderoom balance from API
  useEffect(() => {
    const fetchTraderoomBalance = async () => {
      try {
        const response = await fetch("/api/user/balance");
        if (response.ok) {
          const data = await response.json();
          // Use the dedicated traderoomBalance field (not realBalance)
          setTraderoomBalance(data.traderoomBalance || 0);
        }
      } catch (error) {
        console.error("Failed to fetch traderoom balance:", error);
      }
    };
    fetchTraderoomBalance();
  }, []);

  // Auto-reload if stuck on loading screen
  useEffect(() => {
    if (status === "loading" || !session) {
      // Set a timeout to reload the page if loading takes too long
      const reloadTimer = setTimeout(() => {
        console.log("Dashboard loading timeout - auto-reloading page");
        window.location.reload();
      }, 5000); // Reload after 5 seconds

      // Clear timeout if component unmounts or loading completes
      return () => clearTimeout(reloadTimer);
    }
  }, [status, session]);

  // Restore asset modal from URL on page load/refresh
  // This needs to be before any early returns to maintain hooks order
  useEffect(() => {
    // Skip if we're intentionally closing the modal
    if (isClosingModalRef.current) {
      isClosingModalRef.current = false;
      return;
    }
    if (
      urlAssetSymbol &&
      (portfolio?.portfolio?.assets?.length ?? 0) > 0 &&
      !selectedAsset
    ) {
      const portfolioAssets = portfolio!.portfolio!.assets!;
      const assetFromUrl = portfolioAssets.find(
        (a: any) => a.symbol.toUpperCase() === urlAssetSymbol.toUpperCase()
      );
      if (assetFromUrl) {
        // Get metadata for the asset
        const getCryptoMeta = (symbol: string) => {
          const cryptoData: Record<
            string,
            { name: string; color: string; iconBg: string }
          > = {
            BTC: {
              name: "Bitcoin",
              color: "from-orange-500 to-orange-600",
              iconBg: "#f97316",
            },
            ETH: {
              name: "Ethereum",
              color: "from-blue-500 to-purple-600",
              iconBg: "#3b82f6",
            },
            XRP: {
              name: "Ripple",
              color: "from-blue-600 to-blue-700",
              iconBg: "#2563eb",
            },
            TRX: {
              name: "Tron",
              color: "from-gray-800 to-gray-900",
              iconBg: "#1c1c1c",
            },
            TON: {
              name: "Toncoin",
              color: "from-blue-500 to-cyan-600",
              iconBg: "#3b82f6",
            },
            LTC: {
              name: "Litecoin",
              color: "from-gray-400 to-gray-500",
              iconBg: "#9ca3af",
            },
            BCH: {
              name: "Bitcoin Cash",
              color: "from-green-500 to-green-600",
              iconBg: "#22c55e",
            },
            ETC: {
              name: "Ethereum Classic",
              color: "from-green-600 to-teal-700",
              iconBg: "#059669",
            },
            USDC: {
              name: "USD Coin",
              color: "from-blue-500 to-blue-600",
              iconBg: "#3b82f6",
            },
            USDT: {
              name: "Tether",
              color: "from-green-500 to-teal-600",
              iconBg: "#22c55e",
            },
          };
          return (
            cryptoData[symbol] || {
              name: symbol,
              color: "from-gray-600 to-gray-700",
              iconBg: "#6b7280",
            }
          );
        };
        const meta = getCryptoMeta(assetFromUrl.symbol);
        // Build asset object matching what handleAssetClick expects
        const restoredAsset = {
          symbol: assetFromUrl.symbol,
          name: meta.name,
          amount: assetFromUrl.amount,
          currentPrice: assetFromUrl.averagePrice || 0,
          value: (assetFromUrl.averagePrice || 0) * assetFromUrl.amount,
          change: 0,
          icon: "",
          color: meta.color,
          metadata: { iconBg: meta.iconBg },
        };
        setSelectedAsset(restoredAsset);
        setShowAssetDetails(true);
      }
    }
  }, [urlAssetSymbol, portfolio?.portfolio?.assets, selectedAsset]);

  // Handle browser back button - close modal if open
  useEffect(() => {
    const handlePopState = () => {
      // Check current URL - if no asset param, close modal
      const currentUrl = new URL(window.location.href);
      if (!currentUrl.searchParams.get("asset") && showAssetDetails) {
        setShowAssetDetails(false);
        setSelectedAsset(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showAssetDetails]);

  // Removed "Just now" timer to prevent unnecessary re-renders

  // Wait for session to fully load before rendering dashboard
  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  const handleTransactionClick = (activity: Transaction) => {
    // Generate realistic crypto transaction hash based on asset type
    const generateCryptoHash = (asset: string, id: string) => {
      // Create deterministic hash from transaction ID for consistency
      const seed = id + asset;
      let hash = "";
      for (let i = 0; i < seed.length; i++) {
        hash += seed.charCodeAt(i).toString(16);
      }

      // Bitcoin and Bitcoin-based coins use base58 format (no 0, O, I, l)
      if (["BTC", "LTC", "BCH"].includes(asset)) {
        const base58Chars =
          "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let btcHash = "";
        for (let i = 0; i < 64; i++) {
          const index =
            parseInt(hash.substr(i * 2, 2) || "00", 16) % base58Chars.length;
          btcHash += base58Chars[index];
        }
        return btcHash;
      }

      // Ethereum and ERC-20 tokens use 0x + 64 hex chars
      if (["ETH", "USDT", "USDC", "ETC"].includes(asset)) {
        const hexHash =
          "0x" + (hash + hash + hash).substr(0, 64).padEnd(64, "0");
        return hexHash;
      }

      // XRP uses uppercase hex
      if (asset === "XRP") {
        return (hash + hash).substr(0, 64).toUpperCase().padEnd(64, "0");
      }

      // TRX (Tron) uses base58 similar to Bitcoin
      if (asset === "TRX") {
        const base58Chars =
          "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let trxHash = "";
        for (let i = 0; i < 64; i++) {
          const index =
            parseInt(hash.substr(i * 2, 2) || "00", 16) % base58Chars.length;
          trxHash += base58Chars[index];
        }
        return trxHash;
      }

      // Default: hex format
      return "0x" + (hash + hash + hash).substr(0, 64).padEnd(64, "0");
    };

    // Helper to get crypto name from symbol
    const getCryptoName = (symbol: string): string => {
      const cryptoNames: Record<string, string> = {
        BTC: "Bitcoin",
        ETH: "Ethereum",
        ETC: "Ethereum Classic",
        LTC: "Litecoin",
        XRP: "Ripple",
        USDC: "USD Coin",
        USDT: "Tether",
        SOL: "Solana",
        DOGE: "Dogecoin",
        BNB: "BNB",
        TRX: "Tron",
        BCH: "Bitcoin Cash",
        TON: "Toncoin",
      };
      return cryptoNames[symbol] || symbol;
    };

    // Helper to get network name from asset
    const getNetworkName = (symbol: string): string => {
      const networks: Record<string, string> = {
        BTC: "Bitcoin Network",
        ETH: "Ethereum Network",
        ETC: "Ethereum Classic Network",
        LTC: "Litecoin Network",
        XRP: "XRP Ledger",
        USDC: "Ethereum Network (ERC-20)",
        USDT: "Ethereum Network (ERC-20)",
        USDTERC20: "Ethereum Network (ERC-20)",
        USDTTRC20: "Tron Network (TRC-20)",
        SOL: "Solana Network",
        DOGE: "Dogecoin Network",
        BNB: "BNB Smart Chain",
        TRX: "Tron Network",
        BCH: "Bitcoin Cash Network",
        TON: "TON Network",
      };
      return networks[symbol] || `${symbol} Network`;
    };

    // Get proper payment method display from method field
    const getPaymentMethodDisplay = (
      method: string | undefined,
      asset: string
    ): string => {
      if (!method) return `${getCryptoName(asset)} (${asset})`;

      // Parse NOWPAYMENTS_XXX format
      if (method.startsWith("NOWPAYMENTS_")) {
        const cryptoCode = method
          .replace("NOWPAYMENTS_", "")
          .replace("_INVOICE", "");
        return `${getCryptoName(cryptoCode)} (${cryptoCode})`;
      }

      return method;
    };

    // Get the asset symbol from the activity
    const assetSymbol = activity.asset?.split(" ")[0] || "BTC";

    // Enhance transaction with additional details for the modal
    const enhancedTransaction = {
      ...activity,
      date: new Date(),
      fee: activity.type === "deposit" ? activity.value * 0.02 : undefined,
      method:
        activity.type === "deposit"
          ? getPaymentMethodDisplay(activity.method, assetSymbol)
          : undefined,
      description: `${activity.type} transaction for ${activity.asset}`,
      confirmations:
        activity.status === "pending" ? activity.confirmations || 0 : 6,
      maxConfirmations: 6,
      hash:
        activity.status !== "failed"
          ? generateCryptoHash(assetSymbol, activity.id)
          : undefined,
      network: getNetworkName(assetSymbol),
      address:
        activity.type === "deposit"
          ? `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
          : undefined,
    };

    setSelectedTransaction(enhancedTransaction);
    setShowTransactionDetails(true);
  };

  // Cryptocurrency metadata helper
  const getCryptoMetadata = (symbol: string) => {
    const cryptoData: Record<
      string,
      {
        name: string;
        icon: string;
        color: string;
        gradient: string;
        iconBg: string;
        network?: string;
      }
    > = {
      BTC: {
        name: "Bitcoin",
        icon: "₿",
        color: "from-orange-500 to-orange-600",
        gradient: "from-orange-500 to-yellow-600",
        iconBg: "#f97316",
      },
      ETH: {
        name: "Ethereum",
        icon: "Ξ",
        color: "from-blue-500 to-purple-600",
        gradient: "from-blue-500 to-cyan-600",
        iconBg: "#3b82f6",
      },
      XRP: {
        name: "Ripple",
        icon: "✕",
        color: "from-blue-600 to-blue-700",
        gradient: "from-blue-600 to-indigo-600",
        iconBg: "#2563eb",
      },
      TRX: {
        name: "Tron",
        icon: "T",
        color: "from-gray-800 to-gray-900",
        gradient: "from-gray-800 to-gray-900",
        iconBg: "#1c1c1c",
      },
      TON: {
        name: "Toncoin",
        icon: "💎",
        color: "from-blue-500 to-cyan-600",
        gradient: "from-blue-500 to-cyan-600",
        iconBg: "#3b82f6",
      },
      LTC: {
        name: "Litecoin",
        icon: "Ł",
        color: "from-gray-400 to-gray-500",
        gradient: "from-gray-400 to-gray-600",
        iconBg: "#9ca3af",
      },
      BCH: {
        name: "Bitcoin Cash",
        icon: "₿",
        color: "from-green-500 to-green-600",
        gradient: "from-green-500 to-green-600",
        iconBg: "#22c55e",
      },
      ETC: {
        name: "Ethereum Classic",
        icon: "ᗐ",
        color: "from-green-600 to-teal-700",
        gradient: "from-green-600 to-emerald-600",
        iconBg: "#059669",
      },
      USDC: {
        name: "Ethereum",
        icon: "$",
        color: "from-blue-500 to-blue-600",
        gradient: "from-blue-500 to-blue-600",
        iconBg: "#3b82f6",
      },
      USDT: {
        name: "Ethereum",
        icon: "₮",
        color: "from-green-500 to-teal-600",
        gradient: "from-green-500 to-teal-600",
        iconBg: "#22c55e",
        network: "Ethereum",
      },
    };
    return (
      cryptoData[symbol] || {
        name: symbol,
        icon: "○",
        color: "from-gray-600 to-gray-700",
        gradient: "from-gray-600 to-gray-700",
        iconBg: "#6b7280",
      }
    );
  };

  // Dynamic user assets with real-time prices for ALL cryptocurrencies
  // Only show actual portfolio assets - no mock/default data
  const userAssets =
    portfolio?.portfolio.assets && portfolio.portfolio.assets.length > 0
      ? portfolio.portfolio.assets
          .map((asset: any) => {
            const metadata = getCryptoMetadata(asset.symbol);

            // Get real-time price from CryptoMarketProvider
            const realtimePrice = cryptoPrices[asset.symbol];
            const currentPrice =
              realtimePrice?.price || asset.averagePrice || 0;
            const priceChange = realtimePrice?.changePercent24h || 0;

            return {
              symbol: asset.symbol,
              name: metadata.name,
              network: metadata.network,
              amount: asset.amount,
              currentPrice: currentPrice,
              value: currentPrice * asset.amount,
              change: priceChange,
              icon: metadata.icon,
              color: metadata.color,
              metadata: metadata,
            };
          })
          .sort((a: any, b: any) => b.value - a.value) // Sort by asset value highest first
      : [];

  // Calculate dynamic portfolio value based on real-time prices
  // Include both crypto assets AND available balance
  const cryptoAssetsValue = portfolioLoading
    ? 0
    : userAssets.reduce((total, asset) => total + asset.value, 0);

  // Get the raw balance and its stored currency
  const availableBalance = portfolio?.portfolio?.balance
    ? parseFloat(portfolio.portfolio.balance.toString())
    : 0;
  const balanceCurrency = portfolio?.portfolio?.balanceCurrency || "USD";

  const portfolioValue = cryptoAssetsValue + availableBalance;

  // Helper function to format balance correctly
  // If stored currency matches preferred currency, show directly (no conversion)
  // Otherwise, convert from stored currency to preferred currency
  const formatBalanceDisplay = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      return `${getCurrencySymbol(preferredCurrency)}${balance.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }
    // Different currency - formatAmount will convert from USD to preferred
    // Note: If balanceCurrency is not USD, this may need additional conversion logic
    return formatAmount(balance, 2);
  };

  // Income percent: measure change of user's money (deposits + received + earnings)
  // Use server-provided periodIncomePercent when available for selected period
  const incomePercent =
    portfolio &&
    portfolio.portfolio &&
    typeof portfolio.portfolio.periodIncomePercent === "number"
      ? portfolio.portfolio.periodIncomePercent
      : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdated("Just now");
      showSuccess("Portfolio data refreshed");
    } catch (error) {
      showError("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeposit = () => {
    if (!requireVerification("deposit")) return;
    openDepositModal();
  };

  const handleWithdraw = () => {
    if (!requireVerification("withdraw")) return;
    openWithdrawModal();
  };

  const handleBuy = () => {
    if (!requireVerification("buy")) return;
    openBuyModal();
  };

  const handleSell = () => {
    if (!requireVerification("sell")) return;
    openSellModal();
  };

  const handleTransfer = () => {
    if (!requireVerification("transfer")) return;
    openTransferModal();
  };

  const handleConvert = () => {
    if (!requireVerification("swap")) return;
    openConvertModal();
  };

  const handleAssetClick = (asset: any) => {
    setSelectedAsset(asset);
    setShowAssetDetails(true);
    // Update URL with asset symbol for persistence on refresh
    // Use replace to avoid adding to history stack
    window.history.replaceState(null, "", `/dashboard?asset=${asset.symbol}`);
  };

  // Close asset details and clear URL parameter
  const handleCloseAssetDetails = () => {
    isClosingModalRef.current = true;
    setShowAssetDetails(false);
    setSelectedAsset(null);
    // Remove asset param from URL using replace (no history entry)
    window.history.replaceState(null, "", "/dashboard");
  };

  const handleViewAllAssets = () => {
    setShowAllAssets(true);
  };

  const handleAddCrypto = () => {
    setShowAddCryptoModal(true);
  };

  const handleAddCryptoAsset = async (symbol: string, name: string) => {
    try {
      const response = await fetch("/api/portfolio/add-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to add cryptocurrency");
        return;
      }

      // Refresh portfolio data
      await refetch();

      // Keep modal open - don't close
      // setShowAddCryptoModal(false);

      // Show success message
      showSuccess(`${name} (${symbol}) added successfully!`);
    } catch (error) {
      console.error("Error adding crypto:", error);
      showError("Failed to add cryptocurrency. Please try again.");
    }
  };

  const handleRemoveCryptoAsset = async (symbol: string) => {
    try {
      const response = await fetch("/api/portfolio/remove-asset", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to remove cryptocurrency");
        return;
      }

      // Refresh portfolio data
      await refetch();

      // Show success message
      showSuccess(`${symbol} removed successfully!`);
    } catch (error) {
      console.error("Error removing crypto:", error);
      showError("Failed to remove cryptocurrency. Please try again.");
    }
  };

  const handleViewAllActivity = () => {
    setShowAllActivity(true);
  };

  const getActivityIconData = (type: string) => {
    switch (type) {
      case "buy":
        return {
          bgColor: "bg-green-600",
          path: "M7 11l5-5m0 0l5 5m-5-5v12",
        };
      case "sell":
        return {
          bgColor: "bg-red-600",
          path: "M17 13l-5 5m0 0l-5-5m5 5V6",
        };
      case "deposit":
        return {
          bgColor: "bg-blue-600",
          path: "M12 6v6m0 0v6m0-6h6m-6 0H6",
        };
      case "withdraw":
        return {
          bgColor: "bg-gray-600",
          path: "M18 12H6",
        };
      case "convert":
        return {
          bgColor: "bg-orange-600",
          path: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        };
      default:
        return {
          bgColor: "bg-gray-600",
          path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "buy":
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
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
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        );
      case "sell":
        return (
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
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
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
        );
      case "deposit":
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        );
      case "withdraw":
        return (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
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
                d="M18 12H6"
              />
            </svg>
          </div>
        );
      case "convert":
        return (
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Portfolio Section - Single 3D Card */}
      <div
        data-tutorial="portfolio-balance"
        className="relative rounded-2xl p-4 sm:p-6 overflow-hidden transition-all duration-300"
        style={{
          background:
            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
          boxShadow:
            "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Ambient glow effect */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
          }}
        />

        {/* Portfolio Value Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Portfolio Value
            </h1>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div
                className="text-3xl sm:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(59,130,246,0.2)] [text-shadow:_0_0_20px_rgba(59,130,246,0.1),_0_2px_4px_rgba(0,0,0,0.8)]"
                style={{ WebkitTextStroke: "0.5px rgba(255,255,255,0.1)" }}
              >
                {portfolioLoading ? (
                  <div className="animate-pulse bg-gray-700 h-12 w-48 rounded"></div>
                ) : showBalances ? (
                  formatAmount(portfolioValue || 0, 2)
                ) : (
                  "••••••"
                )}
              </div>
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="text-gray-400 hover:opacity-70 transition-opacity p-2 mb-2"
                aria-label={showBalances ? "Hide balances" : "Show balances"}
              >
                {showBalances ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {portfolioLoading ? (
                <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
              ) : (
                <>
                  <span
                    className={`text-base sm:text-lg font-medium ${
                      incomePercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {incomePercent >= 0 ? "+" : ""}
                    {incomePercent.toFixed(2)}%
                  </span>
                  <span className="text-gray-400 text-sm sm:text-base">
                    24hrs
                  </span>
                  {/* Info icon for tooltip */}
                  <div className="group relative">
                    <svg
                      className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 border border-gray-700">
                      <div className="text-center">
                        This percentage measures changes to your account balance
                        from deposits, withdrawals and trading results (not
                        market price movement).
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {portfolioError && (
              <div className="text-red-400 text-sm mt-2">
                Failed to load portfolio data: {portfolioError}
                <button
                  onClick={() => refetch()}
                  className="ml-2 underline hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Deposit & Withdraw Buttons */}
          <div className="flex gap-2 sm:gap-3 mb-6">
            <button
              data-tutorial="deposit-button"
              onClick={handleDeposit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30"
              style={{
                boxShadow:
                  "0 4px 15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Deposit
            </button>
            <button
              data-tutorial="withdraw-button"
              onClick={handleWithdraw}
              className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold border border-gray-600/50 transition-all text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg"
              style={{
                boxShadow:
                  "0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 12H6"
                />
              </svg>
              Withdraw
            </button>
          </div>

          {/* Balance Cards - Full Width */}
          <div className="space-y-2">
            {/* USD Balance Card */}
            <div
              data-tutorial="available-balance"
              className="relative w-full p-3 rounded-xl transition-all duration-300 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              {/* Blue glow effect */}
              <div
                className="absolute inset-0 opacity-20 rounded-xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 0%, rgba(59, 130, 246, 0.4) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0"
                      style={{
                        boxShadow:
                          "0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
                      }}
                    >
                      <span className="text-white font-bold text-xs relative z-10">
                        $
                      </span>
                    </div>
                    <span className="text-gray-300 text-xs font-semibold">
                      {preferredCurrency} Balance
                    </span>
                  </div>
                  <span
                    className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.2)] [text-shadow:_0_0_15px_rgba(59,130,246,0.1),_0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ WebkitTextStroke: "0.3px rgba(255,255,255,0.1)" }}
                  >
                    {portfolioLoading ? (
                      <div className="animate-pulse bg-gray-700 h-4 w-16 rounded"></div>
                    ) : showBalances ? (
                      formatBalanceDisplay(availableBalance || 0)
                    ) : (
                      "••••••"
                    )}
                  </span>
                </div>
                {/* Balance Progress bar - Blue */}
                <div className="mt-2">
                  <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                      style={{
                        width: `${Math.min(
                          Math.max((availableBalance / 10000) * 100, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Traderoom Balance Card */}
            <div
              className="relative w-full p-3 rounded-xl transition-all duration-300 overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                boxShadow:
                  "inset 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              {/* Green glow effect */}
              <div
                className="absolute inset-0 opacity-20 rounded-xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 30% 0%, rgba(34, 197, 94, 0.4) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0"
                      style={{
                        boxShadow:
                          "0 2px 8px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
                      }}
                    >
                      <svg
                        className="w-3 h-3 text-white relative z-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-xs font-semibold">
                      Traderoom Balance
                    </span>
                  </div>
                  <span
                    className="text-sm sm:text-base font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(34,197,94,0.2)] [text-shadow:_0_0_15px_rgba(34,197,94,0.1),_0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ WebkitTextStroke: "0.3px rgba(255,255,255,0.1)" }}
                  >
                    {portfolioLoading ? (
                      <div className="animate-pulse bg-gray-700 h-4 w-16 rounded"></div>
                    ) : showBalances ? (
                      formatAmount(traderoomBalance || 0, 2)
                    ) : (
                      "••••••"
                    )}
                  </span>
                </div>
                {/* Traderoom Progress bar - Green */}
                <div className="mt-2">
                  <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                      style={{
                        width: `${Math.min(
                          Math.max((traderoomBalance / 1000000) * 100, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Actions */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={handleBuy}
          className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white p-1 sm:p-2 rounded-2xl font-semibold text-[10px] sm:text-xs transition-all flex flex-col items-center gap-0.5 sm:gap-1 shadow-lg hover:shadow-xl hover:shadow-green-500/30 border border-green-400/20 hover:scale-105 active:scale-95"
        >
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-full shadow-inner">
            <svg
              className="w-3 h-3 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
          Buy
        </button>

        <button
          onClick={handleSell}
          className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white p-1 sm:p-2 rounded-2xl font-semibold text-[10px] sm:text-xs transition-all flex flex-col items-center gap-0.5 sm:gap-1 shadow-lg hover:shadow-xl hover:shadow-red-500/30 border border-red-400/20 hover:scale-105 active:scale-95"
        >
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-full shadow-inner">
            <svg
              className="w-3 h-3 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
          Sell
        </button>

        <button
          data-tutorial="transfer-button"
          onClick={handleTransfer}
          className="bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white p-1 sm:p-2 rounded-2xl font-semibold text-[10px] sm:text-xs transition-all flex flex-col items-center gap-0.5 sm:gap-1 shadow-lg hover:shadow-xl hover:shadow-purple-500/30 border border-purple-400/20 hover:scale-105 active:scale-95"
        >
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-full shadow-inner">
            <svg
              className="w-3 h-3 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          Transfer
        </button>

        <button
          onClick={handleConvert}
          className="bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white p-1 sm:p-2 rounded-2xl font-semibold text-[10px] sm:text-xs transition-all flex flex-col items-center gap-0.5 sm:gap-1 shadow-lg hover:shadow-xl hover:shadow-orange-500/30 border border-orange-400/20 hover:scale-105 active:scale-95"
        >
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-full shadow-inner">
            <svg
              className="w-3 h-3 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v6a2 2 0 002 2h2m2-6h10m0 0l-4-4m4 4l-4 4m0 0v-5m0 5h2a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              />
            </svg>
          </div>
          Swap
        </button>
      </div>

      {/* Crypto and History Toggle View */}
      <div className="grid grid-cols-1" data-tutorial="crypto-assets">
        <div className="bg-gray-800/50 rounded-2xl p-1.5 sm:p-3 border border-gray-700/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          {/* Header with Toggle and Add Button */}
          <div className="flex items-center justify-between gap-1.5 mb-4">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* Crypto Tab */}
              <button
                onClick={() => setActiveView("crypto")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap text-xs ${
                  activeView === "crypto"
                    ? "text-white border-b-2 border-blue-500 shadow-[0_4px_12px_-4px_rgba(59,130,246,0.6)]"
                    : "text-gray-400 hover:text-white hover:shadow-[0_4px_12px_-4px_rgba(59,130,246,0.4)]"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Crypto
              </button>

              {/* History Tab */}
              <button
                onClick={() => setActiveView("history")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap text-xs ${
                  activeView === "history"
                    ? "text-white border-b-2 border-blue-500 shadow-[0_4px_12px_-4px_rgba(59,130,246,0.6)]"
                    : "text-gray-400 hover:text-white hover:shadow-[0_4px_12px_-4px_rgba(59,130,246,0.4)]"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                History
              </button>
            </div>

            {/* Add Crypto Button */}
            <button
              onClick={handleAddCrypto}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs whitespace-nowrap flex-shrink-0"
            >
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Crypto
            </button>
          </div>

          {/* Crypto View */}
          {activeView === "crypto" && (
            <div className="space-y-4 pb-4">
              {userAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-4">No crypto assets yet</p>
                  <button
                    onClick={handleAddCrypto}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Add your first crypto →
                  </button>
                </div>
              ) : (
                userAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => handleAssetClick(asset)}
                    className="relative flex items-center justify-between p-3.5 cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.25),0_0_30px_rgba(59,130,246,0.4)]"
                    style={{
                      background:
                        "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                      boxShadow:
                        "0 12px 28px -6px rgba(0, 0, 0, 0.6), 0 6px 14px -3px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {/* Left side: Icon and Info */}
                    <div className="flex items-center gap-3">
                      {/* 3D Crypto Icon Container */}
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${asset.color} flex items-center justify-center flex-shrink-0 transition-all duration-300 relative overflow-visible`}
                        style={{
                          boxShadow: `0 4px 16px ${
                            asset.metadata?.iconBg || "#6b7280"
                          }40, 0 2px 8px ${
                            asset.metadata?.iconBg || "#6b7280"
                          }60, inset 0 1px 2px rgba(255,255,255,0.2)`,
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
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold text-sm">
                            {asset.symbol}
                          </span>
                          <span className="text-gray-300 text-[10px] bg-gray-700/50 px-1 py-[1px] rounded-md leading-tight border border-blue-400/30 shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                            {asset.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-white font-medium text-xs">
                            {formatAmount(asset.currentPrice || 0, 2)}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              asset.change >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {asset.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Holdings */}
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">
                        {(asset.amount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 8,
                        })}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {formatAmount(asset.value || 0, 2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History View */}
          {activeView === "history" && (
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg font-medium">
                    No transaction history yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Your transactions will appear here
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => {
                  // Format transaction type text
                  const getTransactionText = () => {
                    const assetSymbol = activity.asset?.split(" ")[0] || "";
                    const assetMetadata = getCryptoMetadata(assetSymbol);
                    const fullName = assetMetadata.name;

                    if (activity.type === "buy") return `${fullName} Bought`;
                    if (activity.type === "sell") return `${fullName} Sold`;
                    if (activity.type === "transfer")
                      return `${fullName} Transferred`;
                    if (activity.type === "convert")
                      return `${fullName} Swapped`;
                    if (activity.type === "deposit")
                      return `Deposit ${fullName}`;
                    if (activity.type === "withdraw")
                      return `Withdraw ${fullName}`;
                    // Fallback for any other type
                    return `${String(activity.type)
                      .charAt(0)
                      .toUpperCase()}${String(activity.type).slice(
                      1
                    )} ${fullName}`;
                  };

                  // Get transaction type icon and color
                  const getTransactionIcon = () => {
                    const assetSymbol = activity.asset?.split(" ")[0] || "";
                    return (
                      <div className="relative">
                        <CryptoIcon
                          symbol={assetSymbol}
                          size="sm"
                          showNetwork={true}
                        />
                      </div>
                    );
                  };

                  // Format amount with 8 decimals for crypto
                  const formatCryptoAmount = (
                    amount: number,
                    asset: string
                  ) => {
                    if (
                      activity.type === "deposit" ||
                      activity.type === "withdraw"
                    ) {
                      return `${amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                    }
                    return amount.toLocaleString("en-US", {
                      minimumFractionDigits: 8,
                      maximumFractionDigits: 8,
                    });
                  };

                  // Get crypto price and calculate fiat value
                  const getCryptoPrice = () => {
                    const assetSymbol = activity.asset?.split(" ")[0];
                    return cryptoPrices[assetSymbol]?.price || 0;
                  };

                  const getFiatValue = () => {
                    if (
                      activity.type === "deposit" ||
                      activity.type === "withdraw"
                    ) {
                      // Use activity.value which is the USD amount for deposits/withdrawals
                      return convertAmount(
                        activity.value || activity.amount || 0
                      );
                    }
                    const price = getCryptoPrice();
                    const usdValue = (activity.amount || 0) * price;
                    return convertAmount(usdValue);
                  };

                  // Format date and time
                  const formatDateTime = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return "Just now";
                      if (diffMins < 60) return `${diffMins}m ago`;
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays < 7) return `${diffDays}d ago`;

                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    } catch {
                      return timestamp;
                    }
                  };

                  const formatFullDateTime = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      return date.toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {
                      return timestamp;
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      onClick={() => handleTransactionClick(activity)}
                      className="group relative p-2.5 bg-gradient-to-br from-gray-800/60 to-gray-900/80 rounded-xl border border-gray-700/60 hover:border-blue-500/50 cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.2)] backdrop-blur-sm hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-2">
                        {/* Transaction Icon */}
                        {getTransactionIcon()}

                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header Row with Title, Date and Status */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-sm sm:text-base mb-0.5 truncate">
                                {getTransactionText()}
                              </h3>
                              <p className="text-gray-400 text-[10px] truncate">
                                {formatFullDateTime(activity.timestamp)}
                              </p>
                            </div>
                            <div
                              className={`px-1 py-[2px] rounded-md text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                                activity.status === "completed"
                                  ? "bg-gradient-to-r from-gray-700 to-gray-800 text-green-400 border border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] animate-pulse-glow"
                                  : activity.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {activity.status}
                            </div>
                          </div>

                          {/* Amount Row - Crypto and Fiat on same line */}
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-1 px-2 py-0.5 rounded-md bg-gray-700/50">
                              <span className="font-medium text-xs text-white">
                                {formatCryptoAmount(
                                  activity.amount || 0,
                                  activity.asset?.split(" ")[0] || ""
                                )}
                              </span>
                              <span className="font-medium text-[10px] text-gray-300">
                                {activity.asset?.split(" ")[0]}
                              </span>
                            </div>
                            <span className="font-medium text-xs text-white px-2 py-0.5 rounded-md bg-gray-700/50">
                              {formatAmount(getFiatValue(), 2)}
                            </span>
                          </div>

                          {/* Show confirmation progress for pending deposits */}
                          {activity.status === "pending" &&
                            activity.type === "deposit" &&
                            activity.confirmations !== undefined && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/50">
                                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (activity.confirmations /
                                          (activity.maxConfirmations || 6)) *
                                          100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                                  {activity.confirmations}/
                                  {activity.maxConfirmations || 6} confirmations
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => setShowTransactionDetails(false)}
        transaction={selectedTransaction}
      />

      {/* Asset Details Modal */}
      <AssetDetailsModal
        isOpen={showAssetDetails}
        onClose={handleCloseAssetDetails}
        asset={selectedAsset}
        userBalance={
          portfolio?.portfolio?.balance
            ? parseFloat(portfolio.portfolio.balance.toString())
            : 0
        }
        balanceCurrency={balanceCurrency}
        allAssets={userAssets}
      />

      {/* Verification Required Modal */}
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        action={pendingAction}
        kycStatus={kycStatus}
      />

      {/* Add Crypto Modal */}
      <AddCryptoModal
        isOpen={showAddCryptoModal}
        onClose={() => setShowAddCryptoModal(false)}
        onAdd={handleAddCryptoAsset}
        onRemove={handleRemoveCryptoAsset}
        existingAssets={userAssets.map((asset) => ({
          symbol: asset.symbol,
          amount: asset.amount,
        }))}
      />

      {/* All Assets Modal */}
      <AnimatePresence>
        {showAllAssets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAllAssets(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">All Assets</h2>
                <button
                  onClick={() => setShowAllAssets(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setShowAllAssets(false);
                      handleAssetClick(asset);
                    }}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700/30 cursor-pointer hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <CryptoIcon
                        symbol={asset.symbol}
                        size="lg"
                        showNetwork={true}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {asset.symbol}
                          </span>
                          <span
                            className={`text-sm ${
                              asset.change >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {asset.change >= 0 ? "+" : ""}
                            {asset.change.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {formatAmount(asset.value || 0, 2)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {(asset.amount || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                        })}{" "}
                        {asset.symbol}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Activity Modal */}
      <AnimatePresence>
        {showAllActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAllActivity(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Transaction History
                </h2>
                <button
                  onClick={() => setShowAllActivity(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  // Format transaction type text
                  const getTransactionText = () => {
                    if (activity.type === "buy")
                      return `${activity.asset} Bought`;
                    if (activity.type === "sell")
                      return `${activity.asset} Sold`;
                    if (activity.type === "transfer")
                      return `${activity.asset} Transferred`;
                    if (activity.type === "convert")
                      return `${activity.asset} Swapped`;
                    if (activity.type === "deposit")
                      return `Deposit ${activity.asset}`;
                    if (activity.type === "withdraw")
                      return `Withdraw ${activity.asset}`;
                    // Fallback for any other type
                    return `${String(activity.type)
                      .charAt(0)
                      .toUpperCase()}${String(activity.type).slice(1)} ${
                      activity.asset
                    }`;
                  };

                  // Format amount with 8 decimals for crypto
                  const formatCryptoAmount = (
                    amount: number,
                    asset: string
                  ) => {
                    if (
                      activity.type === "deposit" ||
                      activity.type === "withdraw"
                    ) {
                      return `$${amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                    }
                    return `${amount.toFixed(8)} ${asset}`;
                  };

                  // Format date and time
                  const formatDateTime = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
                      const timeStr = date.toTimeString().split(" ")[0]; // HH:MM:SS
                      return `${dateStr} ${timeStr}`;
                    } catch {
                      return timestamp;
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      onClick={() => {
                        setShowAllActivity(false);
                        handleTransactionClick(activity);
                      }}
                      className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 hover:border-orange-500/30"
                    >
                      <CryptoIcon symbol={activity.asset} size="lg" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">
                            {getTransactionText()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs ${
                              activity.status === "completed"
                                ? "bg-green-900/30 text-green-400"
                                : activity.status === "pending"
                                ? "bg-orange-900/30 text-orange-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {activity.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-gray-400 text-sm">
                            {formatCryptoAmount(
                              activity.amount,
                              activity.asset
                            )}{" "}
                            (${formatAmount(activity.value || 0, 2)})
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDateTime(activity.timestamp)}
                          </span>
                        </div>

                        {/* Show confirmation progress for pending deposits */}
                        {activity.status === "pending" &&
                          activity.type === "deposit" &&
                          activity.confirmations !== undefined && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                                <div
                                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (activity.confirmations /
                                        (activity.maxConfirmations || 6)) *
                                        100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {activity.confirmations}/
                                {activity.maxConfirmations || 6}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Dashboard component with real-time crypto prices
export default function DashboardPage() {
  return (
    <CryptoMarketProvider>
      <Suspense fallback={<DashboardLoadingFallback />}>
        <DashboardContent />
      </Suspense>
    </CryptoMarketProvider>
  );
}

// Loading fallback for Suspense boundary
function DashboardLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
}
