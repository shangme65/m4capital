"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VscVerifiedFilled } from "react-icons/vsc";
import Image from "next/image";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { getCurrencyFlagUrl } from "@/lib/currency-flags";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CURRENCIES } from "@/lib/currencies";
import { transferCryptoAction } from "@/actions/transfer-actions";

interface TransferModalNewProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling functions - PURPLE theme for Transfer
const getCard3DStyle = (isDark: boolean) => ({
  background: isDark
    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
    : "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
  boxShadow: isDark
    ? "0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.4)"
    : "0 8px 30px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
});

const getInputStyle = (isDark: boolean) => ({
  background: isDark
    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)"
    : "linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)",
  boxShadow: isDark
    ? "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.05)"
    : "inset 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 1)",
  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
});

// Crypto gradient colors
const cryptoGradients: Record<string, string> = {
  USD: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  BTC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  ETH: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  USDT: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  LTC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  XRP: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  TRX: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  TON: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  BCH: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  ETC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
  USDC: "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
};

export default function TransferModalNew({
  isOpen,
  onClose,
}: TransferModalNewProps) {
  const [step, setStep] = useState(1); // 1 = select asset, 2 = enter details, 3 = confirm, 4 = success
  const [transferData, setTransferData] = useState({
    asset: "FIAT",
    amount: "",
    destination: "",
    memo: "",
  });
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    recipient: string;
    recipientName?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [receiverVerified, setReceiverVerified] = useState<boolean>(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount, formatAmount, exchangeRates } = useCurrency();
  const { addTransaction, addNotification } = useNotifications();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const card3DStyle = getCard3DStyle(isDark);
  const inputStyle = getInputStyle(isDark);

  const currencySymbol =
    CURRENCIES.find((c) => c.code === preferredCurrency)?.symbol || "$";

  // Get balance and its stored currency
  const availableBalance = portfolio?.portfolio?.balance
    ? parseFloat(portfolio.portfolio.balance.toString())
    : 0;
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

  // Fetch real-time crypto prices for all assets in the user's portfolio
  const cryptoSymbols = useMemo(
    () =>
      (portfolio?.portfolio?.assets || [])
        .map((a: any) => a.symbol)
        .filter(Boolean) as string[],
    [portfolio]
  );
  const cryptoPrices = useCryptoPrices(cryptoSymbols);

  // Get supported assets - Fiat balance first, then crypto assets sorted by amount
  const supportedAssets = (() => {
    const assets = [
      {
        symbol: "FIAT", // Use FIAT to distinguish from crypto
        name: `${preferredCurrency} Balance`,
        amount: availableBalance,
        isFiat: true,
      },
    ];

    const cryptoAssets = (portfolio?.portfolio?.assets || [])
      .filter((a: any) => (a.amount || 0) > 0)
      .sort((a: any, b: any) => {
        const aFiat = (a.amount || 0) * (cryptoPrices[a.symbol]?.price || 0);
        const bFiat = (b.amount || 0) * (cryptoPrices[b.symbol]?.price || 0);
        return bFiat - aFiat;
      })
      .map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.symbol,
        amount: asset.amount || 0,
        isFiat: false,
      }));

    return [...assets, ...cryptoAssets];
  })();

  const currentAsset = supportedAssets.find(
    (a) => a.symbol === transferData.asset
  );
  const currentBalance = currentAsset?.amount || 0;
  const currentPrice =
    transferData.asset === "FIAT"
      ? 1
      : cryptoPrices[transferData.asset]?.price || 0;

  const transferFee = 0.0001;

  // Handle back button navigation
  const handleBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

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
      setTransferData({
        asset: "FIAT",
        amount: "",
        destination: "",
        memo: "",
      });
      setSuccessData(null);
      setErrors({});
      setReceiverName(null);
      setReceiverVerified(false);
    }

    // Add mobile back button handler
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      if (step === 4) {
        handleDone();
      } else if (step > 1) {
        setStep((prev) => prev - 1);
        window.history.pushState({ modal: true }, "");
      } else {
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
  }, [isOpen, onClose, step]);

  // Lookup receiver by email or account number
  const lookupReceiver = async (identifier: string) => {
    if (!identifier.trim()) {
      setReceiverName(null);
      setReceiverVerified(false);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch(
        `/api/p2p-transfer/lookup-receiver?identifier=${encodeURIComponent(
          identifier
        )}`
      );
      const data = await res.json();
      if (res.ok && data.receiver) {
        setReceiverName(data.receiver.name);
        setReceiverVerified(data.receiver.isVerified || false);
      } else {
        setReceiverName(null);
        setReceiverVerified(false);
      }
    } catch (error) {
      console.error("Error looking up receiver:", error);
      setReceiverName(null);
      setReceiverVerified(false);
    } finally {
      setLookupLoading(false);
    }
  };

  // Convert amount from preferred currency to asset amount
  const getAssetAmount = (preferredCurrencyAmount: number) => {
    // Convert from preferred currency to USD first
    const usdAmount = convertAmount(preferredCurrencyAmount, true);
    // Then convert USD to asset amount
    if (transferData.asset === "FIAT") {
      return usdAmount;
    }
    return currentPrice > 0 ? usdAmount / currentPrice : 0;
  };

  // Get the equivalent amount in preferred currency for display
  const getPreferredCurrencyAmount = (assetAmount: number) => {
    const usdAmount =
      transferData.asset === "FIAT" ? assetAmount : assetAmount * currentPrice;
    return convertAmount(usdAmount);
  };

  const validateDetails = () => {
    const newErrors: { [key: string]: string } = {};
    const inputAmount = parseFloat(transferData.amount);
    const assetAmount = getAssetAmount(inputAmount);

    if (!transferData.amount || inputAmount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (assetAmount > currentBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (!transferData.destination.trim()) {
      newErrors.destination = "Recipient is required";
    }

    const dest = transferData.destination.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest);
    const isAccountNumber = /^\d{8,}$/.test(dest);

    if (!isEmail && !isAccountNumber) {
      newErrors.destination = "Enter a valid email or account number";
    }

    if (!receiverName && !lookupLoading) {
      newErrors.destination = "User not found";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateDetails()) {
        setStep(3);
      }
    }
  };

  const confirmTransfer = () => {
    const inputAmount = parseFloat(transferData.amount);
    // Convert from preferred currency to asset amount
    const assetAmount = getAssetAmount(inputAmount);
    // Get USD value for records
    const usdValue = convertAmount(inputAmount, true);

    startTransition(async () => {
      const result = await transferCryptoAction(
        transferData.asset,
        assetAmount,
        transferData.destination,
        transferData.memo,
        inputAmount // Pass original input amount for history display
      );

      if (!result.success) {
        setErrors({
          amount: result.error || "Transfer failed",
        });
        setStep(2);
        return;
      }

      addTransaction({
        type: "transfer" as const,
        asset: transferData.asset,
        amount: assetAmount,
        value: usdValue,
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: transferFee,
        method: "P2P Transfer",
        description: `Transfer to ${receiverName || transferData.destination}`,
      });

      addNotification({
        type: "transaction",
        title: "Transfer Sent",
        message: `Your transfer of ${currencySymbol}${inputAmount.toFixed(2)} to ${
          receiverName || transferData.destination
        } has been sent successfully`,
      });

      setSuccessData({
        asset: transferData.asset,
        amount: assetAmount,
        value: usdValue,
        recipient: transferData.destination,
        recipientName: result.data?.recipientName || receiverName || undefined,
      });
      setStep(4);
    });
  };

  const handleDone = () => {
    setTransferData({
      asset: "FIAT",
      amount: "",
      destination: "",
      memo: "",
    });
    setErrors({});
    setReceiverName(null);
    setReceiverVerified(false);
    setStep(1);
    onClose();
    refetch();
    window.location.href = "/dashboard";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="transfer-modal-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] overflow-hidden"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #2e1065 50%, #0f172a 75%, #0a0a0f 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #ffffff 25%, #f5f3ff 50%, #ffffff 75%, #f8fafc 100%)",
          }}
        >
          {/* Animated background elements - PURPLE theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? "bg-purple-500/10" : "bg-purple-200/30"} rounded-full blur-3xl animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? "bg-violet-500/10" : "bg-violet-200/30"} rounded-full blur-3xl animate-pulse delay-1000`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? "bg-purple-500/5" : "bg-purple-100/40"} rounded-full blur-3xl`} />
          </div>

          {/* Back button - top left (hidden on success) */}
          {step !== 4 && (
            <button
              onClick={handleBack}
              className={`absolute top-4 left-4 w-10 h-10 flex items-center justify-center ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"} rounded-xl transition-all z-50`}
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
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-3 mb-3"
                style={card3DStyle}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(145deg, #a855f7 0%, #7c3aed 100%)",
                      boxShadow: "0 6px 15px -4px rgba(168, 85, 247, 0.5)",
                    }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Transfer</h2>
                </div>

                {/* Progress Steps */}
                {step < 4 && (
                  <>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] transition-all ${
                              step >= s
                                ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm shadow-purple-500/30"
                                : isDark
                                ? "bg-gray-800/50 text-gray-500"
                                : "bg-gray-100 text-gray-400"
                            }`}
                            style={step >= s ? {} : inputStyle}
                          >
                            {step > s ? (
                              <svg
                                className="w-3 h-3"
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
                              className={`w-6 h-0.5 rounded-full ${
                                step > s
                                  ? "bg-gradient-to-r from-purple-500 to-violet-500"
                                  : isDark ? "bg-gray-700" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-1">
                      <span className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {step === 1 && "Select Asset"}
                        {step === 2 && "Enter Details"}
                        {step === 3 && "Confirm"}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Form Content Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-4"
                style={card3DStyle}
              >
                {/* Step 1: Select Asset */}
                {step === 1 && (
                  <div className="space-y-4">
                    {/* Balance Card */}
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: isDark
                          ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                          : "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                        boxShadow: isDark
                          ? "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                          : "0 4px 12px -2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
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

                    <div className="mb-3">
                      <label className={`block text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Select Asset to Send
                      </label>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Choose from your available fiat or crypto balance. Only assets with a positive balance are shown.
                      </p>
                    </div>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {supportedAssets.filter((asset: any) => asset.amount > 0).map((asset: any) => {
                        const isFiat = asset.isFiat || asset.symbol === "FIAT";
                        const price = isFiat ? 1 : cryptoPrices[asset.symbol]?.price || 0;
                        const cryptoValue = isFiat ? 0 : asset.amount * price;
                        const changePercent = isFiat ? undefined : cryptoPrices[asset.symbol]?.changePercent24h;
                        const isSelected = transferData.asset === asset.symbol;

                        return (
                          <button
                            key={asset.symbol}
                            type="button"
                            onClick={() =>
                              setTransferData((prev) => ({
                                ...prev,
                                asset: asset.symbol,
                              }))
                            }
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
                                  background: isFiat
                                    ? "transparent"
                                    : isDark
                                      ? cryptoGradients[asset.symbol] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                                      : "#ffffff",
                                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {isFiat ? (
                                  <img
                                    src={getCurrencyFlagUrl(preferredCurrency)}
                                    alt={preferredCurrency}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 object-cover"
                                  />
                                ) : (
                                  <img
                                    src={`/crypto/${asset.symbol.toLowerCase()}.svg`}
                                    alt={asset.symbol}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                  />
                                )}
                              </div>

                              {/* Left text: amount on top, symbol + % on bottom */}
                              <div className="flex-1 min-w-0 flex flex-col">
                                {/* Top: crypto amount (or fiat balance) */}
                                <div className={`text-base font-bold leading-none ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                  {isFiat
                                    ? formatBalanceDisplay(asset.amount)
                                    : asset.amount.toFixed(8)}
                                </div>
                                {/* Bottom: symbol + % change */}
                                <div className="flex items-baseline gap-1 leading-none mt-0.5">
                                  <span className={`text-xs font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                    {isFiat ? preferredCurrency : asset.symbol}
                                  </span>
                                  {changePercent !== undefined && (
                                    <span className={`text-xs font-semibold ${changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                      {changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right: tick on top (when selected), fiat value on bottom */}
                              <div className="flex flex-col items-end justify-between flex-shrink-0" style={{ minHeight: '2.5rem' }}>
                                <div className="h-4 flex items-center">
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                {!isFiat && (
                                  <div className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    {formatAmount(cryptoValue, 2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleContinue}
                      disabled={!transferData.asset}
                      className="w-full py-2 text-white rounded-xl font-bold transition-all text-xs disabled:opacity-50"
                      style={{
                        background:
                          "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #a855f7 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 2: Enter Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    {errors.amount && (
                      <div
                        className="rounded-xl p-3 text-red-400 text-sm"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        {errors.amount}
                      </div>
                    )}

                    {/* Balance Card */}
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: isDark
                          ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                          : "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                        boxShadow: isDark
                          ? "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                          : "0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1)",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
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

                    {/* Selected Asset Display */}
                    <div
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: isDark
                            ? cryptoGradients[transferData.asset] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                            : transferData.asset === "FIAT"
                              ? "transparent"
                              : "#ffffff",
                          boxShadow: isDark
                            ? "0 4px 12px rgba(0,0,0,0.4)"
                            : "0 3px 10px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                      >
                        {transferData.asset === "FIAT" ? (
                          <img
                            src={getCurrencyFlagUrl(preferredCurrency)}
                            alt={preferredCurrency}
                            className="w-10 h-10 object-cover"
                            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))" }}
                          />
                        ) : (
                          <img
                            src={`/crypto/${transferData.asset.toLowerCase()}.svg`}
                            alt={transferData.asset}
                            className="w-10 h-10 object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          Sending{" "}
                          {transferData.asset === "FIAT"
                            ? preferredCurrency
                            : transferData.asset}
                        </div>

                      </div>
                    </div>

                    {/* Recipient Input */}
                    <div>
                      <label className={`block text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>
                        Recipient (Email or Account Number)
                      </label>
                      <input
                        type="text"
                        value={transferData.destination}
                        onChange={(e) => {
                          setTransferData((prev) => ({
                            ...prev,
                            destination: e.target.value,
                          }));
                          lookupReceiver(e.target.value);
                        }}
                        className={`w-full rounded-xl px-4 py-3 ${isDark ? "text-white" : "text-gray-900"} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                        style={inputStyle}
                        placeholder="user@example.com or 12345678"
                      />
                      {lookupLoading && (
                        <div
                          className="mt-2 rounded-xl p-3 flex items-center gap-2"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
                            border: "1px solid rgba(168, 85, 247, 0.2)",
                            boxShadow:
                              "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                        >
                          <span className="animate-spin text-purple-400">
                            ⏳
                          </span>
                          <span className="text-purple-400 text-sm">
                            Looking up user...
                          </span>
                        </div>
                      )}
                      {receiverName && !lookupLoading && (
                        <div
                          className="mt-3 rounded-xl p-3"
                          style={{
                            background: isDark
                              ? "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
                              : "linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)",
                            boxShadow: isDark
                              ? "0 8px 20px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.3)"
                              : "0 4px 12px -2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
                            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${receiverVerified ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-gray-500 to-gray-600"}`}>
                              {receiverName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {receiverName}
                                </span>
                                {receiverVerified && (
                                  <VscVerifiedFilled className="text-green-500 flex-shrink-0" size={16} />
                                )}
                              </div>
                              <p className={`text-xs ${receiverVerified ? "text-green-500" : "text-yellow-500"}`}>
                                {receiverVerified ? "✓ Verified Account" : "⚠ Unverified Account"}
                              </p>
                            </div>
                          </div>
                          {!receiverVerified && (
                            <div className={`mt-2 p-2 rounded-lg text-xs ${isDark ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300" : "bg-yellow-50 border border-yellow-200 text-yellow-700"}`}>
                              ⚠️ This recipient&apos;s account is not verified. Please ensure you know this person before sending funds.
                            </div>
                          )}
                        </div>
                      )}
                      {errors.destination && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.destination}
                        </p>
                      )}
                    </div>

                    {/* Amount Input - Always in preferred currency */}
                    <div>
                      <label className={`block text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>
                        Amount ({preferredCurrency})
                      </label>
                      <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"} font-medium text-sm`}>
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={transferData.amount}
                          onChange={(e) =>
                            setTransferData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className={`w-full rounded-xl pl-10 pr-4 py-3 ${isDark ? "text-white" : "text-gray-900"} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                          style={inputStyle}
                          placeholder="0.00"
                        />
                      </div>
                      {/* Preset amounts */}
                      <div className="flex gap-1.5 mt-2">
                        {[50, 100, 250, 500].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              setTransferData((prev) => ({
                                ...prev,
                                amount: amount.toString(),
                              }))
                            }
                            className={`px-2 py-1 rounded-full text-[10px] font-medium ${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-all`}
                            style={{
                              background: isDark
                                ? "linear-gradient(145deg, #374151 0%, #1f2937 100%)"
                                : "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                              boxShadow: isDark ? "0 2px 8px -2px rgba(0, 0, 0, 0.4)" : "0 2px 6px -2px rgba(0, 0, 0, 0.1)",
                              border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.08)",
                            }}
                          >
                            {currencySymbol}
                            {amount}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          // For FIAT, use balance directly (it's already in user's currency)
                          // For crypto, convert to preferred currency via USD
                          if (transferData.asset === "FIAT") {
                            const maxAmount = Math.max(
                              0,
                              currentBalance - 0.01
                            ); // Small fee buffer
                            setTransferData((prev) => ({
                              ...prev,
                              amount: maxAmount.toFixed(2),
                            }));
                          } else {
                            const maxInUSD = Math.max(
                              0,
                              (currentBalance - transferFee) * currentPrice
                            );
                            const maxInPreferred = convertAmount(maxInUSD);
                            setTransferData((prev) => ({
                              ...prev,
                              amount: maxInPreferred.toFixed(2),
                            }));
                          }
                        }}
                        className="text-purple-400 text-sm mt-2 hover:text-purple-300 font-semibold"
                      >
                        Send Max (
                        {transferData.asset === "FIAT"
                          ? formatBalanceDisplay(currentBalance)
                          : formatAmount(currentBalance * currentPrice, 2)}
                        )
                      </button>
                    </div>

                    {/* Memo Input */}
                    <div>
                      <label className={`block text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}>
                        Memo (Optional)
                      </label>
                      <textarea
                        value={transferData.memo}
                        onChange={(e) =>
                          setTransferData((prev) => ({
                            ...prev,
                            memo: e.target.value,
                          }))
                        }
                        className={`w-full rounded-xl px-4 py-3 ${isDark ? "text-white" : "text-gray-900"} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none`}
                        style={inputStyle}
                        placeholder="Add a note..."
                        rows={2}
                      />
                    </div>

                    {/* Transfer Summary */}
                    {transferData.amount && (
                      <div
                        className="rounded-xl p-3"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
                          border: "1px solid rgba(168, 85, 247, 0.2)",
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Amount:</span>
                          <span className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                            {currencySymbol}
                            {parseFloat(transferData.amount).toFixed(2)}
                          </span>
                        </div>
                        {transferData.asset !== "FIAT" && (
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              You send:
                            </span>
                            <span className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                              {getAssetAmount(
                                parseFloat(transferData.amount)
                              ).toFixed(8)}{" "}
                              {transferData.asset}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>To:</span>
                          <span className="text-purple-400 font-bold">
                            {receiverName || transferData.destination}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold ${isDark ? "text-white" : "text-gray-900"} text-xs`}
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleContinue}
                        disabled={
                          !transferData.amount ||
                          !transferData.destination ||
                          !receiverName
                        }
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-white text-xs disabled:opacity-50"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #a855f7 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{
                          background: isDark
                            ? cryptoGradients[transferData.asset] || "linear-gradient(145deg, #334155 0%, #1e293b 100%)"
                            : transferData.asset === "FIAT"
                              ? "linear-gradient(145deg, #a855f7 0%, #7c3aed 100%)"
                              : "#ffffff",
                          boxShadow: isDark
                            ? "0 10px 30px -5px rgba(0, 0, 0, 0.5)"
                            : transferData.asset === "FIAT"
                              ? "0 6px 18px rgba(168,85,247,0.3), inset 0 2px 0 rgba(255,255,255,0.25)"
                              : "0 6px 18px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
                        }}
                      >
                        {transferData.asset === "FIAT" ? (
                          <span className="text-white font-bold text-xl">
                            {currencySymbol}
                          </span>
                        ) : (
                          <CryptoIcon
                            symbol={transferData.asset}
                            className="w-8 h-8 text-white"
                          />
                        )}
                      </div>
                      <p className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        You&apos;re sending
                      </p>
                      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {transferData.asset === "FIAT"
                          ? `${currencySymbol}${parseFloat(
                              transferData.amount
                            ).toFixed(2)}`
                          : getAssetAmount(
                              parseFloat(transferData.amount)
                            ).toFixed(8)}
                      </p>
                      <p className="text-purple-400 font-semibold">
                        {transferData.asset === "FIAT"
                          ? preferredCurrency
                          : transferData.asset}
                      </p>
                      <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        To: {receiverName || transferData.destination}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={getCard3DStyle(isDark)}
                    >
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Recipient:</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {receiverName || transferData.destination}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Amount:</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {transferData.asset === "FIAT"
                            ? `${currencySymbol}${parseFloat(
                                transferData.amount
                              ).toFixed(2)}`
                            : `${getAssetAmount(
                                parseFloat(transferData.amount)
                              ).toFixed(8)} ${transferData.asset}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Network Fee:</span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {formatAmount(transferFee, 4)}
                        </span>
                      </div>
                      {transferData.memo && (
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? "text-gray-400" : "text-gray-500"}>Memo:</span>
                          <span className={`font-medium truncate max-w-[150px] ${isDark ? "text-white" : "text-gray-900"}`}>
                            {transferData.memo}
                          </span>
                        </div>
                      )}
                      <hr className={isDark ? "border-gray-700" : "border-gray-200"} />
                      <div className="flex justify-between font-bold">
                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>Total:</span>
                        <span className="text-purple-400">
                          {transferData.asset === "FIAT"
                            ? `${currencySymbol}${parseFloat(
                                transferData.amount
                              ).toFixed(2)}`
                            : `${getAssetAmount(
                                parseFloat(transferData.amount)
                              ).toFixed(8)} ${transferData.asset}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        disabled={isPending}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold ${isDark ? "text-white" : "text-gray-900"} text-xs disabled:opacity-50`}
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmTransfer}
                        disabled={isPending}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-white text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #a855f7 100%)",
                          boxShadow:
                            "0 8px 20px -5px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {isPending ? (
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
                          "Confirm Transfer"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && successData && (
                  <div className="space-y-4">
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
                            "linear-gradient(145deg, #a855f7 0%, #7c3aed 100%)",
                          boxShadow:
                            "0 10px 40px -10px rgba(168, 85, 247, 0.6)",
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

                    <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} text-center`}>
                      Transfer Successful!
                    </h3>
                    <p className={`text-sm text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Your transfer has been sent
                    </p>

                    <div
                      className="rounded-xl p-4 space-y-2"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Sent To:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {successData.recipientName || successData.recipient}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Asset:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {successData.asset === "FIAT"
                            ? preferredCurrency
                            : successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Amount Sent:</span>
                        <span className="text-purple-400 font-bold">
                          {currencySymbol}
                          {parseFloat(transferData.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Date:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Time:</span>
                        <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDone}
                      className="w-full py-2 text-xs rounded-xl font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #a855f7 100%)",
                        boxShadow:
                          "0 8px 20px -5px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
