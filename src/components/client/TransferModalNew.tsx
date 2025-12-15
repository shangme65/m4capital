"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { useCryptoPrices } from "@/components/client/CryptoMarketProvider";
import { CURRENCIES } from "@/lib/currencies";
import { transferCryptoAction } from "@/actions/transfer-actions";

interface TransferModalNewProps {
  isOpen: boolean;
  onClose: () => void;
}

// 3D Card styling constants - PURPLE theme for Transfer
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

// Crypto gradient colors
const cryptoGradients: Record<string, string> = {
  USD: "linear-gradient(145deg, #a855f7 0%, #7c3aed 100%)",
  BTC: "linear-gradient(145deg, #f7931a 0%, #c77800 100%)",
  ETH: "linear-gradient(145deg, #627eea 0%, #3c4f9a 100%)",
  USDT: "linear-gradient(145deg, #26a17b 0%, #1a7555 100%)",
  LTC: "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
  XRP: "linear-gradient(145deg, #23292f 0%, #1a1e23 100%)",
  TRX: "linear-gradient(145deg, #ff0013 0%, #b3000d 100%)",
  TON: "linear-gradient(145deg, #0098ea 0%, #006bb3 100%)",
  BCH: "linear-gradient(145deg, #8dc351 0%, #5a8033 100%)",
  ETC: "linear-gradient(145deg, #328332 0%, #1f511f 100%)",
  USDC: "linear-gradient(145deg, #2775ca 0%, #1a4d8a 100%)",
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
  const [lookupLoading, setLookupLoading] = useState(false);

  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount, formatAmount } = useCurrency();
  const { addTransaction, addNotification } = useNotifications();

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
    // Different currencies - convert using formatAmount (USD to preferred)
    return formatAmount(balance, 2);
  };

  // Fetch real-time crypto prices
  const cryptoSymbols = [
    "BTC",
    "ETH",
    "XRP",
    "TRX",
    "TON",
    "LTC",
    "BCH",
    "ETC",
    "USDC",
    "USDT",
  ];
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
      .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
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
      } else {
        setReceiverName(null);
      }
    } catch (error) {
      console.error("Error looking up receiver:", error);
      setReceiverName(null);
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
        transferData.memo
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
        message: `Transferred ${currencySymbol}${inputAmount.toFixed(2)} to ${
          receiverName || transferData.destination
        }`,
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
    setStep(1);
    onClose();
    refetch();
    window.location.reload();
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
            background:
              "linear-gradient(135deg, #0a0a0f 0%, #0f172a 25%, #2e1065 50%, #0f172a 75%, #0a0a0f 100%)",
          }}
        >
          {/* Animated background elements - PURPLE theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          {/* Back button - top left (hidden on success) */}
          {step !== 4 && (
            <button
              onClick={handleBack}
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
              {/* Header Card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl p-4 mb-4"
                style={card3DStyle}
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(145deg, #a855f7 0%, #7c3aed 100%)",
                      boxShadow: "0 8px 20px -5px rgba(168, 85, 247, 0.5)",
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
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Transfer</h2>
                </div>

                {/* Progress Steps */}
                {step < 4 && (
                  <>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                              step >= s
                                ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md shadow-purple-500/30"
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
                                  ? "bg-gradient-to-r from-purple-500 to-violet-500"
                                  : "bg-gray-700"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-2">
                      <span className="text-gray-400 text-xs">
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
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Select Asset to Send
                    </label>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {supportedAssets.map((asset: any) => {
                        // For fiat, use formatBalanceDisplay; for crypto, calculate USD value
                        const isFiat = asset.isFiat || asset.symbol === "FIAT";
                        const price = isFiat
                          ? 1
                          : cryptoPrices[asset.symbol]?.price || 0;
                        const cryptoValue = isFiat ? 0 : asset.amount * price;

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
                            className="w-full text-left transition-all duration-300 rounded-xl p-3"
                            style={{
                              background:
                                transferData.asset === asset.symbol
                                  ? "linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)"
                                  : "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
                              boxShadow:
                                "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                              border:
                                transferData.asset === asset.symbol
                                  ? "1px solid rgba(168, 85, 247, 0.3)"
                                  : "1px solid rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{
                                    background: isFiat
                                      ? cryptoGradients["USD"] ||
                                        "linear-gradient(145deg, #a855f7 0%, #7c3aed 100%)"
                                      : cryptoGradients[asset.symbol] ||
                                        "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                                    boxShadow:
                                      "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {isFiat ? (
                                    <span className="text-white font-bold text-sm">
                                      {currencySymbol}
                                    </span>
                                  ) : (
                                    <CryptoIcon
                                      symbol={asset.symbol}
                                      className="w-6 h-6 text-white"
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-white">
                                    {isFiat
                                      ? `${preferredCurrency} Balance`
                                      : asset.symbol}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    {isFiat
                                      ? formatBalanceDisplay(asset.amount)
                                      : formatAmount(cryptoValue, 2)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-white">
                                    {isFiat
                                      ? formatBalanceDisplay(asset.amount)
                                      : formatAmount(cryptoValue, 2)}
                                  </div>
                                </div>
                                {transferData.asset === asset.symbol && (
                                  <svg
                                    className="w-5 h-5 text-purple-400"
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

                    <button
                      onClick={handleContinue}
                      disabled={!transferData.asset}
                      className="w-full py-3 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-50"
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
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            cryptoGradients[transferData.asset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        }}
                      >
                        {transferData.asset === "FIAT" ? (
                          <span className="text-white font-bold text-sm">
                            {currencySymbol}
                          </span>
                        ) : (
                          <CryptoIcon
                            symbol={transferData.asset}
                            className="w-6 h-6 text-white"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Sending{" "}
                          {transferData.asset === "FIAT"
                            ? preferredCurrency
                            : transferData.asset}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Balance:{" "}
                          {transferData.asset === "FIAT"
                            ? formatBalanceDisplay(currentBalance)
                            : formatAmount(currentBalance * currentPrice, 2)}
                        </div>
                      </div>
                    </div>

                    {/* Recipient Input */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
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
                        className="w-full rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                          className="mt-2 rounded-xl p-3 flex items-center gap-3"
                          style={{
                            background:
                              "linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            boxShadow:
                              "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)",
                              boxShadow:
                                "0 4px 12px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="text-green-400 text-sm font-semibold">
                              Found: {receiverName}
                            </div>
                            <div className="text-gray-400 text-[10px]">
                              Ready to receive transfer
                            </div>
                          </div>
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
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
                        Amount ({preferredCurrency})
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
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
                          className="w-full rounded-xl pl-8 pr-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          style={inputStyle}
                          placeholder="0.00"
                        />
                      </div>
                      {/* Preset amounts */}
                      <div className="flex gap-2 mt-2">
                        {[50, 100, 250, 500].map((amount) => (
                          <button
                            key={amount}
                            onClick={() =>
                              setTransferData((prev) => ({
                                ...prev,
                                amount: amount.toString(),
                              }))
                            }
                            className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-300 hover:text-white transition-all"
                            style={{
                              background:
                                "linear-gradient(145deg, #374151 0%, #1f2937 100%)",
                              boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
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
                      <label className="block text-xs font-semibold text-gray-300 mb-2">
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
                        className="w-full rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
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
                          <span className="text-gray-400 text-xs">Amount:</span>
                          <span className="text-white font-medium text-sm">
                            {currencySymbol}
                            {parseFloat(transferData.amount).toFixed(2)}
                          </span>
                        </div>
                        {transferData.asset !== "FIAT" && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-xs">
                              You send:
                            </span>
                            <span className="text-white font-medium text-sm">
                              {getAssetAmount(
                                parseFloat(transferData.amount)
                              ).toFixed(8)}{" "}
                              {transferData.asset}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">To:</span>
                          <span className="text-purple-400 font-bold">
                            {receiverName || transferData.destination}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleBack}
                        className="flex-1 py-3 px-3 rounded-xl font-semibold text-white text-sm"
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
                        className="flex-1 py-3 px-3 rounded-xl font-bold text-white text-sm disabled:opacity-50"
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
                        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{
                          background:
                            cryptoGradients[transferData.asset] ||
                            "linear-gradient(145deg, #345d9d 0%, #1e3a5f 100%)",
                          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.5)",
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
                      <p className="text-gray-400 text-xs mb-1">
                        You&apos;re sending
                      </p>
                      <p className="text-2xl font-bold text-white">
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
                      <p className="text-gray-400 text-xs mt-2">
                        To: {receiverName || transferData.destination}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={{
                        background:
                          "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                        boxShadow:
                          "0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Recipient:</span>
                        <span className="text-white font-medium">
                          {receiverName || transferData.destination}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-medium">
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
                        <span className="text-gray-400">Network Fee:</span>
                        <span className="text-white font-medium">
                          {formatAmount(transferFee, 4)}
                        </span>
                      </div>
                      {transferData.memo && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Memo:</span>
                          <span className="text-white font-medium truncate max-w-[150px]">
                            {transferData.memo}
                          </span>
                        </div>
                      )}
                      <hr className="border-gray-700" />
                      <div className="flex justify-between font-bold">
                        <span className="text-gray-300">Total:</span>
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
                        className="flex-1 py-3 px-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
                        style={card3DStyle}
                      >
                        Back
                      </button>
                      <button
                        onClick={confirmTransfer}
                        disabled={isPending}
                        className="flex-1 py-3 px-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
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

                    <h3 className="text-xl font-bold text-white text-center">
                      Transfer Successful!
                    </h3>
                    <p className="text-gray-400 text-sm text-center">
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
                        <span className="text-gray-400">Sent To:</span>
                        <span className="text-white font-semibold">
                          {successData.recipientName || successData.recipient}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Asset:</span>
                        <span className="text-white font-semibold">
                          {successData.asset === "FIAT"
                            ? preferredCurrency
                            : successData.asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Amount Sent:</span>
                        <span className="text-purple-400 font-bold">
                          {currencySymbol}
                          {parseFloat(transferData.amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white font-semibold">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white font-semibold">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDone}
                      className="w-full py-3 rounded-xl font-bold text-white"
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
