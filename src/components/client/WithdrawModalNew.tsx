"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CURRENCIES } from "@/lib/currencies";
import { getCurrencyFlagUrl } from "@/lib/currency-flags";
import Image from "next/image";
import {
  createWithdrawalAction,
  payWithdrawalFeeAction,
} from "@/actions/payment-actions";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { formatCryptoAmount } from "@/lib/format-crypto-amount";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeeBreakdown {
  processingFee: number;
  networkFee: number;
  serviceFee: number;
  complianceFee: number;
  totalFees: number;
  breakdown: string[];
}

// 3D Card styling constants
const card3DStyle = {
  background: "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
  boxShadow:
    "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const inputStyle = {
  background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
  boxShadow:
    "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    currency: "", // Will be set from balanceCurrency when portfolio loads
    withdrawalMethod: "CRYPTO_BTC",
    address: "",
    memo: "",
  });
  const { portfolio, refetch } = usePortfolio();
  const [fees, setFees] = useState<FeeBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { addNotification } = useNotifications();
  const { formatAmount, preferredCurrency, exchangeRates } = useCurrency();
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get currency symbol for preferred currency
  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";

  const availableBalance = portfolio?.portfolio?.balance || 0;
  const balanceCurrency = portfolio?.portfolio?.balanceCurrency || "USD";

  // Get balance converted to preferred currency (numeric value)
  const getBalanceInPreferredCurrency = (balance: number): number => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - return directly
      return balance;
    }
    // Different currency - need to convert from balanceCurrency to preferredCurrency
    // First convert from balanceCurrency to USD, then to preferredCurrency
    let balanceInUSD = balance;
    if (balanceCurrency !== "USD") {
      // Convert from balanceCurrency to USD
      const rateFrom = exchangeRates?.[balanceCurrency] ?? 1;
      balanceInUSD = rateFrom > 0 ? balance / rateFrom : balance;
    }
    // Now convert from USD to preferredCurrency
    const rateTo = exchangeRates?.[preferredCurrency] ?? 1;
    return balanceInUSD * rateTo;
  };

  // Available balance in user's preferred currency for validation and display
  const availableBalanceInPreferredCurrency = getBalanceInPreferredCurrency(availableBalance);

  // Convert amount from preferred currency to balance currency for server
  const convertToBalanceCurrency = (amountInPreferred: number): number => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - return directly
      return amountInPreferred;
    }
    // Different currency - need to convert from preferredCurrency to balanceCurrency
    // First convert from preferredCurrency to USD, then to balanceCurrency
    let amountInUSD = amountInPreferred;
    if (preferredCurrency !== "USD") {
      // Convert from preferredCurrency to USD
      const rateFrom = exchangeRates?.[preferredCurrency] ?? 1;
      amountInUSD = rateFrom > 0 ? amountInPreferred / rateFrom : amountInPreferred;
    }
    // Now convert from USD to balanceCurrency
    if (balanceCurrency === "USD") {
      return amountInUSD;
    }
    const rateTo = exchangeRates?.[balanceCurrency] ?? 1;
    return amountInUSD * rateTo;
  };

  // Format balance display - only convert if currencies don't match
  const formatBalanceDisplay = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      return `${currencySymbol}${balance.toLocaleString("en-US", {
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

  // Get crypto assets from portfolio
  const cryptoAssets = portfolio?.portfolio?.assets || [];

  // Set currency from balanceCurrency when portfolio loads
  useEffect(() => {
    if (balanceCurrency && !withdrawData.currency) {
      setWithdrawData((prev) => ({
        ...prev,
        currency: balanceCurrency,
      }));
    }
  }, [balanceCurrency, withdrawData.currency]);

  // Helper to get crypto balance
  const getCryptoBalance = (symbol: string) => {
    const asset = cryptoAssets.find(
      (a: { symbol: string; amount: number }) => a.symbol === symbol
    );
    return asset?.amount || 0;
  };

  // Fetch real crypto prices from API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = cryptoAssets
          .filter((a: { symbol: string; amount: number }) => a.amount > 0)
          .map((a: { symbol: string }) => a.symbol)
          .join(",");

        if (!symbols) return;

        const response = await fetch(`/api/crypto/prices?symbols=${symbols}`);
        if (response.ok) {
          const data = await response.json();
          const priceMap: Record<string, number> = {};
          data.prices?.forEach((p: { symbol: string; price: number }) => {
            priceMap[p.symbol] = p.price;
          });
          setCryptoPrices(priceMap);
        }
      } catch (error) {
        console.error("Failed to fetch crypto prices:", error);
      }
    };

    if (isOpen && cryptoAssets.length > 0) {
      fetchPrices();
    }
  }, [isOpen, cryptoAssets]);

  // Crypto names mapping
  const cryptoNames: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    USDT: "Tether",
    LTC: "Litecoin",
    XRP: "Ripple",
    SOL: "Solana",
    DOGE: "Dogecoin",
    ADA: "Cardano",
    DOT: "Polkadot",
    MATIC: "Polygon",
    TRX: "Tron",
    TON: "Toncoin",
    BCH: "Bitcoin Cash",
    ETC: "Ethereum Classic",
    USDC: "USD Coin",
    BNB: "Binance Coin",
    AVAX: "Avalanche",
    LINK: "Chainlink",
    SHIB: "Shiba Inu",
    UNI: "Uniswap",
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
  };

  // Crypto gradient colors
  const cryptoGradients: Record<string, string> = {
    BTC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    ETH: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    USDT: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    LTC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    XRP: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    SOL: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    DOGE: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    ADA: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    DOT: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    MATIC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    TRX: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    TON: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    BCH: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    ETC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    USDC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    BNB: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    AVAX: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    LINK: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    SHIB: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    UNI: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    ATOM: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    NEAR: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    FIL: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    APT: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    ARB: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    OP: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    AAVE: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    MKR: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    INJ: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    SUI: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
    SEI: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  };

  // Fetch prices for all portfolio cryptos to enable fiat-value sorting
  const withdrawCryptoSymbols = useMemo(
    () =>
      (cryptoAssets as { symbol: string; amount: number }[])
        .filter((a) => a.amount > 0)
        .map((a) => a.symbol)
        .filter(Boolean),
    [cryptoAssets]
  );
  const withdrawCryptoPrices = useCryptoPrices(withdrawCryptoSymbols);

  // Available cryptos for withdrawal, sorted by fiat value (highest first)
  const availableCryptos = (cryptoAssets as { symbol: string; amount: number }[])
    .filter((asset) => asset.amount > 0)
    .sort((a, b) => {
      const aFiat = a.amount * (withdrawCryptoPrices[a.symbol]?.price || 0);
      const bFiat = b.amount * (withdrawCryptoPrices[b.symbol]?.price || 0);
      return bFiat - aFiat;
    })
    .map((asset) => asset.symbol);

  // Auto-select first crypto with balance
  useEffect(() => {
    if (
      isOpen &&
      availableCryptos.length > 0 &&
      !availableCryptos.includes(selectedCrypto)
    ) {
      setSelectedCrypto(availableCryptos[0]);
      setWithdrawData((prev) => ({
        ...prev,
        withdrawalMethod: `CRYPTO_${availableCryptos[0]}`,
      }));
    }
  }, [isOpen, availableCryptos, selectedCrypto]);

  // Refetch portfolio when modal opens to get latest balance
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset on close
      setStep(1);
      setWithdrawData({
        amount: "",
        currency: "", // Will be reset from balanceCurrency when re-opened
        withdrawalMethod: "CRYPTO_BTC",
        address: "",
        memo: "",
      });
      setFees(null);
      setWithdrawalId(null);
      setErrors({});
      setShowMethodDropdown(false);
      setShowCryptoDropdown(false);
      setSelectedCrypto("BTC");
    }

    // Add mobile back button handler - goes back one step
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      if (showSuccessModal) {
        // If success modal is shown, close everything
        setShowSuccessModal(false);
        onClose();
      } else if (step > 1) {
        // Go back one step
        setStep((prev) => prev - 1);
        // Push state again to maintain browser history
        window.history.pushState({ modal: true }, "");
      } else {
        // On step 1, close the modal
        onClose();
      }
    };

    if (isOpen) {
      window.history.pushState({ modal: true }, "");
      window.addEventListener("popstate", handleBackButton);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isOpen, onClose]);

  // Calculate fees when amount or method changes
  useEffect(() => {
    const calculateFees = async () => {
      if (withdrawData.amount && parseFloat(withdrawData.amount) > 0) {
        try {
          const response = await fetch(
            `/api/payment/create-withdrawal?amount=${withdrawData.amount}&method=${withdrawData.withdrawalMethod}`
          );
          const data = await response.json();
          if (response.ok) {
            setFees(data.fees);
          }
        } catch (error) {
          console.error("Error calculating fees:", error);
        }
      } else {
        setFees(null);
      }
    };

    const debounce = setTimeout(calculateFees, 500);
    return () => clearTimeout(debounce);
  }, [withdrawData.amount, withdrawData.withdrawalMethod]);

  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!withdrawData.amount || parseFloat(withdrawData.amount) <= 0) {
        newErrors.amount = "Please enter a valid amount";
      } else if (parseFloat(withdrawData.amount) > availableBalanceInPreferredCurrency) {
        newErrors.amount = "Insufficient balance";
      }

      if (
        withdrawData.withdrawalMethod.startsWith("CRYPTO") &&
        !withdrawData.address.trim()
      ) {
        newErrors.address = "Wallet address is required for crypto withdrawals";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      await createWithdrawal();
    }
  };

  const createWithdrawal = async () => {
    // Re-validate to prevent bypass
    if (!validateStep(2)) {
      setStep(2);
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      // Ensure exchange rates are loaded for conversion
      if (balanceCurrency !== preferredCurrency && (!exchangeRates || Object.keys(exchangeRates).length === 0)) {
        setApiError("Exchange rates not loaded yet. Please wait and try again.");
        setLoading(false);
        return;
      }
      
      // Convert user's input from preferred currency to balance currency for server
      const amountInBalanceCurrency = convertToBalanceCurrency(parseFloat(withdrawData.amount));
      
      // Ensure currency is set
      const currency = withdrawData.currency || balanceCurrency || "USD";
      
      console.log("[Withdrawal] Creating withdrawal:", {
        originalAmount: withdrawData.amount,
        convertedAmount: amountInBalanceCurrency,
        currency,
        balanceCurrency,
        preferredCurrency,
        exchangeRates,
        method: withdrawData.withdrawalMethod,
      });
      
      const result = await createWithdrawalAction({
        amount: amountInBalanceCurrency,
        currency: currency,
        withdrawalMethod: withdrawData.withdrawalMethod,
        address: withdrawData.address,
        memo: withdrawData.memo,
      });

      console.log("[Withdrawal] Result:", result);

      if (!result.success) {
        // Show detailed error with balance info if available
        let errorMsg = result.error || "Failed to create withdrawal";
        if (result.data?.currentBalance !== undefined) {
          errorMsg += ` (Balance: ${result.data.currentBalance.toFixed(2)}, Required: ${result.data.totalRequired?.toFixed(2)})`;
        }
        setApiError(errorMsg);
        return; // Don't throw, just return to keep UI in current state
      }

      setWithdrawalId(result.data.id);
      setStep(3); // Move to fee payment step

      addNotification({
        type: "info",
        title: "Withdrawal Request Created",
        message: "Please review and pay the required fees to proceed.",
      });
    } catch (error: unknown) {
      console.error("[Withdrawal] Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create withdrawal request";
      setApiError(errorMessage);
      addNotification({
        type: "warning",
        title: "Withdrawal Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeePayment = async () => {
    if (!withdrawalId) return;

    setLoading(true);
    try {
      const result = await payWithdrawalFeeAction({
        withdrawalId,
        paymentMethod: "BALANCE_DEDUCTION",
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to process fee payment");
      }

      // Refresh portfolio
      refetch();

      // Show success modal instead of closing immediately
      setShowSuccessModal(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process fee payment";
      addNotification({
        type: "warning",
        title: "Fee Payment Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onClose();
    // Redirect to dashboard to show updated balance and transaction history
    window.location.href = "/dashboard";
  };

  if (!isOpen) return null;

  const totalRequired = fees
    ? parseFloat(withdrawData.amount) + fees.totalFees
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="withdraw-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] overflow-hidden"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)",
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${isDark ? "bg-red-500/10" : "bg-red-500/5"}`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 ${isDark ? "bg-orange-500/10" : "bg-orange-500/5"}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? "bg-purple-500/5" : "bg-purple-500/3"}`} />
          </div>

          {/* Back button - top left (hidden on success modal) */}
          {!showSuccessModal && (
            <button
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  onClose();
                }
              }}
              className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-xl transition-all z-50 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900 bg-white/80 shadow-md"}`}
              style={isDark ? card3DStyle : undefined}
              aria-label="Back"
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
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Main content container */}
          <div className="h-full w-full overflow-y-auto py-4 px-3 md:px-6">
            <div className="max-w-lg mx-auto relative z-10">
              {/* Header Card - Hidden when success modal is shown */}
              {!showSuccessModal && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl p-4 mb-4"
                  style={isDark ? card3DStyle : {
                    background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {/* Icon and Title in same row */}
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(145deg, #dc2626 0%, #ea580c 100%)",
                        boxShadow: "0 8px 20px -5px rgba(220, 38, 38, 0.5)",
                      }}
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Withdraw Funds
                    </h2>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                            step >= s
                              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/30"
                              : isDark ? "bg-gray-800/50 text-gray-400" : "bg-gray-200 text-gray-600"
                          }`}
                          style={step >= s ? {} : isDark ? inputStyle : {
                            background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.06)",
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {step > s ? (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            s
                          )}
                        </div>
                        {s < 3 && (
                          <div
                            className={`w-8 h-0.5 rounded-full ${
                              step > s
                                ? "bg-gradient-to-r from-red-500 to-orange-500"
                                : isDark ? "bg-gray-700" : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {step === 1 && "Enter Details"}
                      {step === 2 && "Review"}
                      {step === 3 && "Fee Payment"}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Form Content Card - Hidden when success modal is shown */}
              {!showSuccessModal && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl p-4"
                  style={isDark ? card3DStyle : {
                    background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 50%, #ffffff 100%)",
                    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {/* Step 1: Withdrawal Details */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Balance Card */}
                      <div
                        className="rounded-xl p-3"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        } : {
                          background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                          boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                          border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Image
                              src={getCurrencyFlagUrl(preferredCurrency)}
                              alt={preferredCurrency}
                              width={28}
                              height={28}
                              className="rounded-full object-cover"
                              style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))" }}
                              unoptimized
                            />
                            <span className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              {preferredCurrency}
                            </span>
                          </div>
                          <span className={`text-lg font-bold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            {formatBalanceDisplay(availableBalance)}
                          </span>
                        </div>
                      </div>

                      {/* Withdrawal Method */}
                      <div>
                        <label className={`block text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Withdrawal Method
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowMethodDropdown(!showMethodDropdown)
                            }
                            className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all flex items-center justify-between ${isDark ? "text-white" : "text-gray-900"}`}
                            style={isDark ? {
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow:
                                "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            } : {
                              background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                              border: "1px solid rgba(0, 0, 0, 0.15)",
                            }}
                          >
                            <span className="flex items-center gap-2">
                              {withdrawData.withdrawalMethod.startsWith(
                                "CRYPTO"
                              ) ? (
                                <>
                                  <div className="flex items-center -space-x-2">
                                    <Image
                                      src="/crypto/btc.svg"
                                      alt="BTC"
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-10"
                                    />
                                    <Image
                                      src="/crypto/eth.svg"
                                      alt="ETH"
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-20"
                                    />
                                    <Image
                                      src="/crypto/usdt.svg"
                                      alt="USDT"
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-30"
                                    />
                                    <Image
                                      src="/crypto/ltc.svg"
                                      alt="LTC"
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full border-2 border-gray-800 relative z-40"
                                    />
                                  </div>
                                  <span>Withdraw via Crypto</span>
                                </>
                              ) : withdrawData.withdrawalMethod === "PIX" ? (
                                <>
                                  <Image
                                    src="/payments/pix-logo.svg"
                                    alt="PIX"
                                    width={60}
                                    height={24}
                                    className="w-15 h-6 object-contain"
                                  />
                                  <span>Withdraw via PIX</span>
                                </>
                              ) : (
                                <>
                                  <span>🏦</span>
                                  <span>Bank Transfer</span>
                                </>
                              )}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${isDark ? "text-gray-400" : "text-gray-500"} ${
                                showMethodDropdown ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          <AnimatePresence>
                            {showMethodDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-20 overflow-hidden"
                                style={isDark ? {
                                  background:
                                    "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                } : {
                                  background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
                                  border: "1px solid rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                <div className="py-2 px-2 space-y-2">
                                  {/* Crypto Option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWithdrawData((prev) => ({
                                        ...prev,
                                        withdrawalMethod: "CRYPTO_BTC",
                                      }));
                                      setShowMethodDropdown(false);
                                    }}
                                    className="w-full text-left transition-all duration-300 rounded-xl p-3"
                                    style={isDark ? {
                                      background:
                                        withdrawData.withdrawalMethod.startsWith(
                                          "CRYPTO"
                                        )
                                          ? "linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)"
                                          : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                      boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                      border:
                                        withdrawData.withdrawalMethod.startsWith(
                                          "CRYPTO"
                                        )
                                          ? "1px solid rgba(239, 68, 68, 0.3)"
                                          : "1px solid rgba(255, 255, 255, 0.05)",
                                    } : {
                                      background:
                                        withdrawData.withdrawalMethod.startsWith(
                                          "CRYPTO"
                                        )
                                          ? "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)"
                                          : "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                                      border:
                                        withdrawData.withdrawalMethod.startsWith(
                                          "CRYPTO"
                                        )
                                          ? "1px solid rgba(239, 68, 68, 0.3)"
                                          : "1px solid rgba(0, 0, 0, 0.06)",
                                    }}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <div className="flex flex-col gap-1.5 w-full">
                                        <div className="flex items-center justify-between">
                                          <div className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                                            Withdraw via Crypto
                                            {withdrawData.withdrawalMethod.startsWith(
                                              "CRYPTO"
                                            ) && (
                                              <svg
                                                className="w-4 h-4 text-green-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                          <div className="flex items-center -space-x-3">
                                            <Image
                                              src="/crypto/btc.svg"
                                              alt="BTC"
                                              width={28}
                                              height={28}
                                              className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-10"
                                            />
                                            <Image
                                              src="/crypto/eth.svg"
                                              alt="ETH"
                                              width={28}
                                              height={28}
                                              className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-20"
                                            />
                                            <Image
                                              src="/crypto/usdt.svg"
                                              alt="USDT"
                                              width={28}
                                              height={28}
                                              className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-30"
                                            />
                                            <Image
                                              src="/crypto/ltc.svg"
                                              alt="LTC"
                                              width={28}
                                              height={28}
                                              className="w-7 h-7 rounded-full border-2 border-gray-800 relative z-40"
                                            />
                                          </div>
                                        </div>
                                        <p className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                          Fast withdrawals to BTC, ETH, USDT,
                                          LTC wallets. Network fees apply.
                                        </p>
                                      </div>
                                    </div>
                                  </button>

                                  {/* PIX Option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWithdrawData((prev) => ({
                                        ...prev,
                                        withdrawalMethod: "PIX",
                                      }));
                                      setShowMethodDropdown(false);
                                    }}
                                    className="w-full text-left transition-all duration-300 rounded-xl p-3"
                                    style={isDark ? {
                                      background:
                                        withdrawData.withdrawalMethod === "PIX"
                                          ? "linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)"
                                          : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                      boxShadow:
                                        "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                      border:
                                        withdrawData.withdrawalMethod === "PIX"
                                          ? "1px solid rgba(239, 68, 68, 0.3)"
                                          : "1px solid rgba(255, 255, 255, 0.05)",
                                    } : {
                                      background:
                                        withdrawData.withdrawalMethod === "PIX"
                                          ? "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(234, 88, 12, 0.1) 100%)"
                                          : "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                                      border:
                                        withdrawData.withdrawalMethod === "PIX"
                                          ? "1px solid rgba(239, 68, 68, 0.3)"
                                          : "1px solid rgba(0, 0, 0, 0.06)",
                                    }}
                                  >
                                    <div className="flex flex-col gap-1 w-full">
                                      <div className="flex items-center justify-between">
                                        <div className={`text-sm font-semibold flex items-center gap-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                                          Withdraw via PIX
                                          {withdrawData.withdrawalMethod ===
                                            "PIX" && (
                                            <svg
                                              className="w-4 h-4 text-green-400"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                        <Image
                                          src="/payments/pix-logo.svg"
                                          alt="PIX"
                                          width={100}
                                          height={40}
                                          className="w-25 h-10 object-contain"
                                        />
                                      </div>
                                      <p className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        Instant withdrawal for Brazilian
                                        customers. Available 24/7.
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Select Crypto Network - Only show when crypto is selected */}
                      {withdrawData.withdrawalMethod.startsWith("CRYPTO") && (
                        <div>
                          <label className={`block text-sm font-semibold mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Select Crypto Network
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowCryptoDropdown(!showCryptoDropdown)
                              }
                              className={`w-full px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all flex items-center justify-between ${isDark ? "text-white" : "text-gray-900"}`}
                              style={isDark ? {
                                background:
                                  "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                              } : {
                                background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                                border: "1px solid rgba(0, 0, 0, 0.15)",
                              }}
                            >
                              <span className="flex items-center gap-3">
                                {/* 3D Crypto Logo */}
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                                  style={{
                                    background: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
                                    boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)`,
                                  }}
                                >
                                  <Image
                                    src={`/crypto/${selectedCrypto.toLowerCase()}.svg`}
                                    alt={selectedCrypto}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                  />
                                </div>
                                <div className="text-left">
                                  <span className="block">
                                    {selectedCrypto === "BTC" &&
                                      "Bitcoin (BTC)"}
                                    {selectedCrypto === "ETH" &&
                                      "Ethereum (ETH)"}
                                    {selectedCrypto === "USDT" &&
                                      "Tether (USDT)"}
                                    {selectedCrypto === "LTC" &&
                                      "Litecoin (LTC)"}
                                  </span>
                                  <span className={`text-[10px] block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    Withdrawal Network
                                  </span>
                                </div>
                              </span>
                              <svg
                                className={`w-4 h-4 transition-transform ${isDark ? "text-gray-400" : "text-gray-500"} ${
                                  showCryptoDropdown ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            <AnimatePresence>
                              {showCryptoDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-20 overflow-hidden"
                                  style={isDark ? {
                                    background:
                                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                  } : {
                                    background: "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
                                    border: "1px solid rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <div className="py-2 px-2 space-y-1">
                                    {availableCryptos.length === 0 && (
                                      <div className={`px-4 py-5 text-center rounded-xl ${isDark ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"}`}>
                                        <div className="text-2xl mb-2">📭</div>
                                        <p className={`text-sm font-semibold mb-1 ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>
                                          No crypto assets found
                                        </p>
                                        <p className={`text-xs ${isDark ? "text-yellow-500/80" : "text-yellow-600"}`}>
                                          You don&apos;t have any cryptocurrency in your portfolio. Deposit or purchase crypto first to withdraw.
                                        </p>
                                      </div>
                                    )}
                                    {availableCryptos.map((crypto) => {
                                      const balance = getCryptoBalance(crypto);
                                      const price = withdrawCryptoPrices[crypto]?.price || 0;
                                      const valueInUSD = balance * price;
                                      const changePercent = withdrawCryptoPrices[crypto]?.changePercent24h;
                                      const isSelected = selectedCrypto === crypto;
                                      return (
                                        <button
                                          key={crypto}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCrypto(crypto);
                                            setWithdrawData((prev) => ({
                                              ...prev,
                                              withdrawalMethod: `CRYPTO_${crypto}`,
                                            }));
                                            setShowCryptoDropdown(false);
                                          }}
                                          className="w-full text-left transition-all duration-300 rounded-xl px-3 py-1"
                                          style={{
                                            background: isSelected
                                              ? isDark
                                                ? "linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)"
                                                : "linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)"
                                              : isDark
                                                ? "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)"
                                                : "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                                            boxShadow: isDark
                                              ? "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                                              : "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                                            border: isSelected
                                              ? "1px solid rgba(168, 85, 247, 0.3)"
                                              : isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.08)",
                                          }}
                                        >
                                          <div className="flex items-center gap-3">
                                            {/* Logo */}
                                            <div
                                              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                                              style={{
                                                background: isDark
                                                  ? cryptoGradients[crypto] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                                                  : "#ffffff",
                                                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                                              }}
                                            >
                                              <Image
                                                src={`/crypto/${crypto.toLowerCase()}.svg`}
                                                alt={crypto}
                                                width={32}
                                                height={32}
                                                className="w-8 h-8"
                                              />
                                            </div>
                                            {/* Left: amount top, symbol+% bottom */}
                                            <div className="flex-1 min-w-0 flex flex-col">
                                              <div className={`text-base font-bold leading-none ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                                {balance.toFixed(8)}
                                              </div>
                                              <div className="flex items-baseline gap-1 leading-none mt-0.5">
                                                <span className={`text-xs font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                  {crypto}
                                                </span>
                                                {changePercent !== undefined && (
                                                  <span className={`text-xs font-semibold ${changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                    {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            {/* Right: tick top, fiat value bottom */}
                                            <div className="flex flex-col items-end justify-between flex-shrink-0" style={{ minHeight: '2.5rem' }}>
                                              <div className="h-4 flex items-center">
                                                {isSelected && (
                                                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                  </svg>
                                                )}
                                              </div>
                                              <div className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                                {formatAmount(valueInUSD, 2)}
                                              </div>
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Amount */}
                      <div>
                        <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Amount ({preferredCurrency})
                        </label>
                        <div 
                          className="flex items-center rounded-xl px-4 py-3 gap-1"
                          style={isDark ? inputStyle : {
                            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                            border: "1px solid rgba(0, 0, 0, 0.15)",
                          }}
                        >
                          <span className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            value={withdrawData.amount}
                            onChange={(e) =>
                              setWithdrawData((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            className={`flex-1 bg-transparent text-sm font-medium focus:outline-none ${isDark ? "text-white" : "text-gray-900"}`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.amount && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.amount}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            // Withdrawals always come from fiat balance in user's preferred currency
                            // Crypto selection is just for the withdrawal network
                            const maxAmount = availableBalanceInPreferredCurrency;

                            setWithdrawData((prev) => ({
                              ...prev,
                              amount: maxAmount.toFixed(2),
                            }));
                          }}
                          className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors font-semibold"
                        >
                          Withdraw All
                        </button>
                      </div>

                      {/* Wallet Address (for crypto) */}
                      {withdrawData.withdrawalMethod.startsWith("CRYPTO") && (
                        <>
                          <div>
                            <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              Destination Wallet Address
                            </label>
                            <input
                              type="text"
                              value={withdrawData.address}
                              onChange={(e) =>
                                setWithdrawData((prev) => ({
                                  ...prev,
                                  address: e.target.value,
                                }))
                              }
                              className={`w-full rounded-xl px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all ${isDark ? "text-white" : "text-gray-900"}`}
                              style={isDark ? inputStyle : {
                                background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                                border: "1px solid rgba(0, 0, 0, 0.15)",
                              }}
                              placeholder="Enter wallet address"
                            />
                            {errors.address && (
                              <p className="text-red-400 text-sm mt-1">
                                {errors.address}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className={`block text-xs font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              Memo/Tag (Optional)
                            </label>
                            <input
                              type="text"
                              value={withdrawData.memo}
                              onChange={(e) =>
                                setWithdrawData((prev) => ({
                                  ...prev,
                                  memo: e.target.value,
                                }))
                              }
                              className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all ${isDark ? "text-white" : "text-gray-900"}`}
                              style={isDark ? inputStyle : {
                                background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
                                border: "1px solid rgba(0, 0, 0, 0.15)",
                              }}
                              placeholder="Optional"
                            />
                          </div>
                        </>
                      )}

                      {/* Fee Preview - 3D Card */}
                      {fees && (
                        <div
                          className="rounded-xl p-3"
                          style={{
                            background: isDark
                              ? "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                              : "linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <h4 className={`text-sm font-medium mb-2 ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                            Estimated Fees
                          </h4>
                          <div className="space-y-1 text-xs">
                            {fees.breakdown.map((item, index) => (
                              <div key={index} className={isDark ? "text-blue-200" : "text-blue-700"}>
                                {item.replace(/\$/g, currencySymbol)}
                              </div>
                            ))}
                            <div className="border-t border-blue-500/30 mt-2 pt-2">
                              <div className={`flex justify-between font-medium text-xs ${isDark ? "text-blue-100" : "text-blue-800"}`}>
                                <span>Total Fees:</span>
                                <span>
                                  {currencySymbol}
                                  {fees.totalFees.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleNext}
                        disabled={!fees || loading}
                        className="w-full py-3 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {/* Step 2: Review */}
                  {step === 2 && fees && (
                    <div className="space-y-4">
                      {/* API Error Display */}
                      {apiError && (
                        <div
                          className="rounded-xl p-3 text-red-400 text-sm"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{apiError}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Withdrawal Summary - 3D Card */}
                      <div
                        className="rounded-xl p-4 space-y-3"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        } : {
                          background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)",
                          boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <h3 className={`font-semibold text-sm mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          Withdrawal Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Method:</span>
                            <span className={isDark ? "text-white" : "text-gray-900"}>
                              {withdrawData.withdrawalMethod.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? "text-gray-400" : "text-gray-600"}>Amount:</span>
                            <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {currencySymbol}
                              {parseFloat(withdrawData.amount).toFixed(2)}
                            </span>
                          </div>
                          {withdrawData.address && (
                            <div className="flex justify-between items-start">
                              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                Destination:
                              </span>
                              <span className={`font-mono text-xs break-all max-w-[60%] text-right ${isDark ? "text-white" : "text-gray-900"}`}>
                                {withdrawData.address.substring(0, 20)}...
                              </span>
                            </div>
                          )}
                          <hr className={`my-2 ${isDark ? "border-gray-700" : "border-gray-300"}`} />
                          <div className="flex justify-between text-yellow-500 text-sm">
                            <span>Total Fees:</span>
                            <span className="font-medium">
                              {currencySymbol}
                              {fees.totalFees.toFixed(2)}
                            </span>
                          </div>
                          <div className={`flex justify-between text-base font-bold border-t pt-2 mt-2 ${isDark ? "text-white border-gray-600" : "text-gray-900 border-gray-300"}`}>
                            <span>Total Deduction:</span>
                            <span>
                              {currencySymbol}
                              {totalRequired.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Warning - 3D Card */}
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: isDark
                            ? "linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, rgba(161, 98, 7, 0.1) 100%)"
                            : "linear-gradient(145deg, rgba(234, 179, 8, 0.15) 0%, rgba(161, 98, 7, 0.1) 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(234, 179, 8, 0.3)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            className="w-4 h-4 text-yellow-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <p className={`text-xs font-medium ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>
                            Important Notice
                          </p>
                        </div>
                        <p className={`text-xs ${isDark ? "text-yellow-300/80" : "text-yellow-800/80"}`}>
                          Verify all details carefully. Withdrawals may be
                          irreversible.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep(1)}
                          disabled={loading}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-semibold transition-all text-sm disabled:opacity-50 ${isDark ? "text-white" : "text-gray-900"}`}
                          style={isDark ? card3DStyle : {
                            background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={loading}
                          className="flex-1 py-2.5 px-3 rounded-xl font-bold transition-all text-white text-sm disabled:opacity-50 pointer-events-auto"
                          style={{
                            background:
                              "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #dc2626 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(220, 38, 38, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          {loading ? "Processing..." : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Fee Payment */}
                  {step === 3 && fees && !showSuccessModal && (
                    <div className="space-y-4">
                      <div className="text-center py-2">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{
                            background:
                              "linear-gradient(145deg, #2563eb 0%, #4f46e5 100%)",
                            boxShadow:
                              "0 10px 30px -5px rgba(37, 99, 235, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <svg
                            className="w-7 h-7 text-white"
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
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                          Fee Payment Required
                        </h3>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Review and authorize the fee deduction
                        </p>
                      </div>

                      {/* Fee Breakdown - 3D Card */}
                      <div
                        className="rounded-xl p-4"
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        } : {
                          background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)",
                          boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <h4 className={`text-sm font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                          Fee Breakdown
                        </h4>
                        <div className="space-y-2">
                          {fees.breakdown.map((item, index) => {
                            const [label, amount] = item.split(": $");
                            return (
                              <div
                                key={index}
                                className="flex justify-between text-xs"
                              >
                                <span className={isDark ? "text-gray-300" : "text-gray-600"}>{label}</span>
                                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {currencySymbol}
                                  {amount}
                                </span>
                              </div>
                            );
                          })}
                          <hr className={`my-2 ${isDark ? "border-gray-700" : "border-gray-300"}`} />
                          <div className="flex justify-between text-sm">
                            <span className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                              Total Fees
                            </span>
                            <span className="text-orange-500 font-bold">
                              {currencySymbol}
                              {fees.totalFees.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Total Summary - 3D Card */}
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background: isDark
                            ? "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                            : "linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                              Total Amount to be Deducted
                            </p>
                            <p className={`text-[10px] mt-0.5 ${isDark ? "text-blue-200" : "text-blue-500"}`}>
                              (Withdrawal + Fees)
                            </p>
                          </div>
                          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {currencySymbol}
                            {totalRequired.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Legal Notice - 3D Card */}
                      <div
                        className={`rounded-xl p-3 text-xs space-y-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        style={isDark ? {
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        } : {
                          background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.06)",
                          border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        <p className={`font-medium text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          By proceeding, you agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10px]">
                          <li>
                            Deduction of {currencySymbol}
                            {totalRequired.toFixed(2)} from balance
                          </li>
                          <li>Processing fees for regulatory compliance</li>
                          <li>1-3 business days processing time</li>
                          <li>Additional verification may be required</li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setStep(2)}
                          disabled={loading}
                          className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all text-xs disabled:opacity-50 ${isDark ? "text-white" : "text-gray-900"}`}
                          style={isDark ? card3DStyle : {
                            background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                            border: "1px solid rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleFeePayment}
                          disabled={loading}
                          className="flex-1 py-2 px-2 rounded-lg font-semibold transition-all text-white text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                          style={{
                            background:
                              "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                            boxShadow:
                              "0 4px 12px -3px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Authorize & Pay
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-60 flex items-center justify-center p-4"
                style={{
                  background: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-full max-w-sm rounded-2xl p-6"
                  style={isDark ? {
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  } : {
                    background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  {/* Success Icon */}
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)",
                        boxShadow:
                          "0 10px 40px -10px rgba(34, 197, 94, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold text-center mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Withdrawal Submitted!
                  </h3>

                  {/* Description */}
                  <p className={`text-sm text-center mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Your withdrawal request has been successfully submitted and
                    is being processed.
                  </p>

                  {/* Details Card */}
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                      border: "1px solid rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>Amount:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {currencySymbol}
                          {parseFloat(withdrawData.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>Method:</span>
                        <span className={isDark ? "text-white" : "text-gray-900"}>
                          {withdrawData.withdrawalMethod.replace("CRYPTO_", "")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>Status:</span>
                        <span className="text-green-500 font-medium">
                          Processing
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>Est. Time:</span>
                        <span className={isDark ? "text-white" : "text-gray-900"}>1-3 business days</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <p className={`text-xs text-center mb-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    You will receive a notification once your withdrawal is
                    completed.
                  </p>

                  {/* Close Button */}
                  <button
                    onClick={handleCloseSuccessModal}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                      boxShadow:
                        "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    Done
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
