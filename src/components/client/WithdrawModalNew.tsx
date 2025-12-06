"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CURRENCIES } from "@/lib/currencies";
import Image from "next/image";

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
    currency: "USD",
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
  const { addNotification } = useNotifications();
  const { formatAmount, preferredCurrency } = useCurrency();
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});

  // Get currency symbol for preferred currency
  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";

  const availableBalance = portfolio?.portfolio?.balance || 0;
  const balanceCurrency = portfolio?.portfolio?.balanceCurrency || "USD";

  // Format balance display - only convert if currencies don't match
  const formatBalanceDisplay = (balance: number): string => {
    if (balanceCurrency === preferredCurrency) {
      // Same currency - show directly without conversion
      return `${currencySymbol}${balance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    // Different currencies - convert using formatAmount (USD to preferred)
    return formatAmount(balance, 2);
  };

  // Get crypto assets from portfolio
  const cryptoAssets = portfolio?.portfolio?.assets || [];

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
  };

  // Crypto gradient colors
  const cryptoGradients: Record<string, string> = {
    BTC: "linear-gradient(145deg, #f7931a 0%, #c77800 100%)",
    ETH: "linear-gradient(145deg, #627eea 0%, #3c4f9a 100%)",
    USDT: "linear-gradient(145deg, #26a17b 0%, #1a7555 100%)",
    LTC: "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
    XRP: "linear-gradient(145deg, #23292f 0%, #1a1e23 100%)",
    SOL: "linear-gradient(145deg, #9945ff 0%, #14f195 100%)",
    DOGE: "linear-gradient(145deg, #c2a633 0%, #8b7724 100%)",
    ADA: "linear-gradient(145deg, #0033ad 0%, #002280 100%)",
    DOT: "linear-gradient(145deg, #e6007a 0%, #b30060 100%)",
    MATIC: "linear-gradient(145deg, #8247e5 0%, #5a2fa0 100%)",
    TRX: "linear-gradient(145deg, #ff0013 0%, #b3000d 100%)",
    TON: "linear-gradient(145deg, #0098ea 0%, #006bb3 100%)",
    BCH: "linear-gradient(145deg, #8dc351 0%, #5a8033 100%)",
    ETC: "linear-gradient(145deg, #328332 0%, #1f511f 100%)",
    USDC: "linear-gradient(145deg, #2775ca 0%, #1a4d8a 100%)",
    BNB: "linear-gradient(145deg, #f3ba2f 0%, #c99520 100%)",
    AVAX: "linear-gradient(145deg, #e84142 0%, #b33333 100%)",
    LINK: "linear-gradient(145deg, #2a5ada 0%, #1c3d99 100%)",
    SHIB: "linear-gradient(145deg, #ffa409 0%, #cc8307 100%)",
  };

  // Available cryptos for withdrawal (only those with balance from user's portfolio)
  // Get all cryptos from portfolio that have balance > 0
  const availableCryptos = cryptoAssets
    .filter((asset: { symbol: string; amount: number }) => asset.amount > 0)
    .map((asset: { symbol: string; amount: number }) => asset.symbol);

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
        currency: "USD",
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
      } else if (parseFloat(withdrawData.amount) > availableBalance) {
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
    setLoading(true);
    try {
      const response = await fetch("/api/payment/create-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(withdrawData.amount),
          currency: withdrawData.currency,
          withdrawalMethod: withdrawData.withdrawalMethod,
          address: withdrawData.address,
          memo: withdrawData.memo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create withdrawal");
      }

      setWithdrawalId(data.withdrawal.id);
      setStep(3); // Move to fee payment step

      addNotification({
        type: "info",
        title: "Withdrawal Request Created",
        message: "Please review and pay the required fees to proceed.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create withdrawal request";
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
      const response = await fetch("/api/payment/pay-withdrawal-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId,
          paymentMethod: "BALANCE_DEDUCTION",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process fee payment");
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
    // Refresh page to show updated balance and transaction history
    window.location.reload();
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
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
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
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all z-50"
              style={card3DStyle}
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
                  style={card3DStyle}
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
                    <h2 className="text-2xl font-bold text-white">
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
                              : "bg-gray-800/50 text-gray-500"
                          }`}
                          style={step >= s ? {} : inputStyle}
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
                                : "bg-gray-700"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-gray-400 text-xs">
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
                  style={card3DStyle}
                >
                  {/* Step 1: Withdrawal Details */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Available Balance - 3D Card */}
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                          boxShadow:
                            "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs font-medium">
                            Available Balance:
                          </span>
                          <span className="text-lg font-bold text-white">
                            {formatBalanceDisplay(availableBalance)}
                          </span>
                        </div>
                      </div>

                      {/* Withdrawal Method */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Withdrawal Method
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowMethodDropdown(!showMethodDropdown)
                            }
                            className="w-full px-4 py-3 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all flex items-center justify-between"
                            style={{
                              background:
                                "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                              boxShadow:
                                "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
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
                              className={`w-4 h-4 text-gray-400 transition-transform ${
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
                                style={{
                                  background:
                                    "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
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
                                    style={{
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
                                    }}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <div className="flex flex-col gap-1.5 w-full">
                                        <div className="flex items-center justify-between">
                                          <div className="text-sm font-semibold text-white flex items-center gap-1.5">
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
                                        <p className="text-[10px] text-gray-400">
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
                                    style={{
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
                                    }}
                                  >
                                    <div className="flex flex-col gap-1 w-full">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
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
                                      <p className="text-[10px] text-gray-400">
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
                          <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Select Crypto Network
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowCryptoDropdown(!showCryptoDropdown)
                              }
                              className="w-full px-4 py-3 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all flex items-center justify-between"
                              style={{
                                background:
                                  "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                boxShadow:
                                  "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                              }}
                            >
                              <span className="flex items-center gap-3">
                                {/* 3D Crypto Logo */}
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{
                                    background:
                                      selectedCrypto === "BTC"
                                        ? "linear-gradient(145deg, #f7931a 0%, #c77800 100%)"
                                        : selectedCrypto === "ETH"
                                        ? "linear-gradient(145deg, #627eea 0%, #3c4f9a 100%)"
                                        : selectedCrypto === "USDT"
                                        ? "linear-gradient(145deg, #26a17b 0%, #1a7555 100%)"
                                        : "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                    boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)`,
                                  }}
                                >
                                  <Image
                                    src={`/crypto/${selectedCrypto.toLowerCase()}.svg`}
                                    alt={selectedCrypto}
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
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
                                  <span className="text-[10px] text-gray-400 block">
                                    Withdrawal Network
                                  </span>
                                </div>
                              </span>
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${
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
                                  style={{
                                    background:
                                      "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <div className="py-2 px-2 space-y-1">
                                    {availableCryptos.map((crypto) => {
                                      const balance = getCryptoBalance(crypto);
                                      const valueInUSD =
                                        balance * (cryptoPrices[crypto] || 0);
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
                                          className="w-full text-left transition-all duration-300 rounded-xl p-3"
                                          style={{
                                            background:
                                              selectedCrypto === crypto
                                                ? "linear-gradient(145deg, rgba(239, 68, 68, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)"
                                                : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                                            boxShadow:
                                              "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                                            border:
                                              selectedCrypto === crypto
                                                ? "1px solid rgba(239, 68, 68, 0.3)"
                                                : "1px solid rgba(255, 255, 255, 0.05)",
                                          }}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              {/* 3D Crypto Logo */}
                                              <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{
                                                  background:
                                                    cryptoGradients[crypto] ||
                                                    "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                                  boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)`,
                                                }}
                                              >
                                                <Image
                                                  src={`/crypto/${crypto.toLowerCase()}.svg`}
                                                  alt={crypto}
                                                  width={24}
                                                  height={24}
                                                  className="w-6 h-6"
                                                />
                                              </div>
                                              <div>
                                                <div className="text-sm font-semibold text-white">
                                                  {cryptoNames[crypto] ||
                                                    crypto}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                  {crypto}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="text-right">
                                                <div className="text-sm font-semibold text-white">
                                                  {balance.toFixed(
                                                    balance < 0.01 ? 6 : 4
                                                  )}{" "}
                                                  {crypto}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                  {formatAmount(valueInUSD, 2)}
                                                </div>
                                              </div>
                                              {selectedCrypto === crypto && (
                                                <svg
                                                  className="w-5 h-5 text-green-400"
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
                        <label className="block text-xs font-semibold text-gray-300 mb-2">
                          Amount ({preferredCurrency})
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
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
                            className="w-full rounded-xl px-4 py-3 pl-8 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                            style={inputStyle}
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
                            // Withdrawals always come from fiat balance
                            // Crypto selection is just for the withdrawal network
                            const maxAmount = availableBalance;

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
                            <label className="block text-xs font-semibold text-gray-300 mb-2">
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
                              className="w-full rounded-xl px-4 py-3 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                              style={inputStyle}
                              placeholder="Enter wallet address"
                            />
                            {errors.address && (
                              <p className="text-red-400 text-sm mt-1">
                                {errors.address}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-2">
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
                              className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
                              style={inputStyle}
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
                            background:
                              "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <h4 className="text-blue-300 text-sm font-medium mb-2">
                            Estimated Fees
                          </h4>
                          <div className="space-y-1 text-xs">
                            {fees.breakdown.map((item, index) => (
                              <div key={index} className="text-blue-200">
                                {item.replace(/\$/g, currencySymbol)}
                              </div>
                            ))}
                            <div className="border-t border-blue-500/30 mt-2 pt-2">
                              <div className="flex justify-between font-medium text-blue-100 text-xs">
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
                      {/* Withdrawal Summary - 3D Card */}
                      <div
                        className="rounded-xl p-4 space-y-3"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <h3 className="text-white font-semibold text-sm mb-2">
                          Withdrawal Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Method:</span>
                            <span className="text-white">
                              {withdrawData.withdrawalMethod.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount:</span>
                            <span className="text-white font-medium">
                              {currencySymbol}
                              {parseFloat(withdrawData.amount).toFixed(2)}
                            </span>
                          </div>
                          {withdrawData.address && (
                            <div className="flex justify-between items-start">
                              <span className="text-gray-400">
                                Destination:
                              </span>
                              <span className="text-white font-mono text-xs break-all max-w-[60%] text-right">
                                {withdrawData.address.substring(0, 20)}...
                              </span>
                            </div>
                          )}
                          <hr className="border-gray-700 my-2" />
                          <div className="flex justify-between text-yellow-400 text-sm">
                            <span>Total Fees:</span>
                            <span className="font-medium">
                              {currencySymbol}
                              {fees.totalFees.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-white border-t border-gray-600 pt-2 mt-2">
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
                          background:
                            "linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, rgba(161, 98, 7, 0.1) 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(234, 179, 8, 0.2)",
                        }}
                      >
                        <div className="flex">
                          <svg
                            className="w-4 h-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
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
                          <div>
                            <p className="text-yellow-400 text-xs font-medium">
                              Important Notice
                            </p>
                            <p className="text-yellow-300/80 text-xs mt-0.5">
                              Verify all details carefully. Withdrawals may be
                              irreversible.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setStep(1)}
                          disabled={loading}
                          className="flex-1 py-3 px-3 rounded-xl font-semibold transition-all text-white text-sm disabled:opacity-50"
                          style={card3DStyle}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={loading}
                          className="flex-1 py-3 px-3 rounded-xl font-bold transition-all text-white text-sm disabled:opacity-50"
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
                        <h3 className="text-lg font-bold text-white mb-1">
                          Fee Payment Required
                        </h3>
                        <p className="text-gray-400 text-xs">
                          Review and authorize the fee deduction
                        </p>
                      </div>

                      {/* Fee Breakdown - 3D Card */}
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                      >
                        <h4 className="text-white text-sm font-semibold mb-3">
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
                                <span className="text-gray-300">{label}</span>
                                <span className="text-white font-medium">
                                  {currencySymbol}
                                  {amount}
                                </span>
                              </div>
                            );
                          })}
                          <hr className="border-gray-700 my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-200 font-semibold">
                              Total Fees
                            </span>
                            <span className="text-orange-400 font-bold">
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
                          background:
                            "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(59, 130, 246, 0.2)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-blue-300 text-xs">
                              Total Amount to be Deducted
                            </p>
                            <p className="text-blue-200 text-[10px] mt-0.5">
                              (Withdrawal + Fees)
                            </p>
                          </div>
                          <p className="text-xl font-bold text-white">
                            {currencySymbol}
                            {totalRequired.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Legal Notice - 3D Card */}
                      <div
                        className="rounded-xl p-3 text-xs text-gray-400 space-y-2"
                        style={{
                          background:
                            "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <p className="font-medium text-gray-300 text-xs">
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
                          className="flex-1 py-3 px-3 rounded-xl font-semibold transition-all text-white text-sm disabled:opacity-50"
                          style={card3DStyle}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleFeePayment}
                          disabled={loading}
                          className="flex-1 py-3 px-3 rounded-xl font-bold transition-all text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                          style={{
                            background:
                              "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #22c55e 100%)",
                            boxShadow:
                              "0 8px 20px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin h-5 w-5"
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
                                className="w-5 h-5"
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
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-full max-w-sm rounded-2xl p-6"
                  style={{
                    background:
                      "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    Withdrawal Submitted!
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm text-center mb-4">
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
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-semibold">
                          {currencySymbol}
                          {parseFloat(withdrawData.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Method:</span>
                        <span className="text-white">
                          {withdrawData.withdrawalMethod.replace("CRYPTO_", "")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 font-medium">
                          Processing
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. Time:</span>
                        <span className="text-white">1-3 business days</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <p className="text-gray-500 text-xs text-center mb-4">
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
