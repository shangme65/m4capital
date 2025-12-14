"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";

interface PaymentData {
  paymentAddress: string;
  paymentAmount: number;
  depositId: string;
  paymentId: string;
  expiresAt?: string;
  invoiceUrl?: string;
  method?: string;
}

interface CryptoWalletProps {
  amount: string;
  cryptoCurrency: string;
  cryptoSymbol: string;
  cryptoName: string;
  onBack: () => void;
  onComplete: () => void;
  existingPayment?: PaymentData; // Optional: pass existing payment data to skip creation
}

// Crypto-specific styling and configuration
const CRYPTO_CONFIG: Record<
  string,
  { color: string; gradient: string; bgColor: string }
> = {
  BTC: {
    color: "orange-500",
    gradient: "from-orange-500 to-yellow-600",
    bgColor: "bg-orange-500",
  },
  ETH: {
    color: "blue-500",
    gradient: "from-blue-500 to-purple-600",
    bgColor: "bg-blue-500",
  },
  ETC: {
    color: "green-500",
    gradient: "from-green-500 to-teal-600",
    bgColor: "bg-green-500",
  },
  LTC: {
    color: "gray-400",
    gradient: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-500",
  },
  XRP: {
    color: "blue-400",
    gradient: "from-blue-400 to-cyan-600",
    bgColor: "bg-blue-400",
  },
  USDC: {
    color: "blue-500",
    gradient: "from-blue-500 to-blue-700",
    bgColor: "bg-blue-500",
  },
  USDT: {
    color: "green-500",
    gradient: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500",
  },
  SOL: {
    color: "purple-500",
    gradient: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500",
  },
  DOGE: {
    color: "yellow-500",
    gradient: "from-yellow-500 to-amber-600",
    bgColor: "bg-yellow-500",
  },
  BNB: {
    color: "yellow-400",
    gradient: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-400",
  },
  TRX: {
    color: "red-500",
    gradient: "from-red-500 to-pink-600",
    bgColor: "bg-red-500",
  },
  BCH: {
    color: "green-600",
    gradient: "from-green-600 to-lime-600",
    bgColor: "bg-green-600",
  },
  TON: {
    color: "cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500",
  },
};

export default function CryptoWallet({
  amount,
  cryptoCurrency,
  cryptoSymbol,
  cryptoName,
  onBack,
  onComplete,
  existingPayment,
}: CryptoWalletProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isLoading, setIsLoading] = useState(!existingPayment);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(
    existingPayment || null
  );
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { addNotification, addTransaction } = useNotifications();
  const { preferredCurrency, formatAmount, convertAmount } = useCurrency();

  const cryptoConfig =
    CRYPTO_CONFIG[cryptoSymbol.toUpperCase()] || CRYPTO_CONFIG.BTC;

  // Create payment on mount only if no existing payment
  useEffect(() => {
    if (!existingPayment) {
      createPayment();
    }
  }, [amount, cryptoCurrency, existingPayment]);

  // Poll payment status every 10 seconds
  useEffect(() => {
    if (!paymentData?.depositId) return;

    const statusInterval = setInterval(async () => {
      await checkPaymentStatus();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(statusInterval);
  }, [paymentData?.depositId]);

  const createPayment = async () => {
    try {
      setIsLoading(true);
      setError("");

      const amountValue = parseFloat(amount);
      console.log("Creating payment with:", {
        amount: amountValue,
        amountString: amount,
        currency: "USD",
        cryptoCurrency: cryptoCurrency,
        isValidAmount: !isNaN(amountValue) && amountValue > 0,
      });

      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Invalid amount");
      }

      const response = await fetch("/api/payment/create-crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: amountValue,
          currency: "USD",
          cryptoCurrency: cryptoCurrency,
        }),
      });

      const data = await response.json();
      console.log("Payment API response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Failed to create payment"
        );
      }

      // Handle both response formats: { success, data: { deposit } } or { success, deposit }
      const deposit = data.data?.deposit || data.deposit;

      if (!data.success || !deposit) {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid payment response");
      }

      setPaymentData({
        paymentAddress: deposit.paymentAddress,
        paymentAmount: deposit.cryptoAmount || deposit.paymentAmount,
        depositId: deposit.id,
        paymentId: deposit.paymentId || deposit.invoiceId,
        expiresAt: deposit.expiresAt,
        invoiceUrl: deposit.invoiceUrl,
        method: deposit.method,
      });

      // Create transaction notification (for immediate UI feedback)
      // The actual deposit is already saved in the database by the API
      const now = new Date();
      addTransaction({
        type: "deposit",
        asset: cryptoSymbol.toUpperCase(),
        amount: deposit.cryptoAmount || deposit.paymentAmount,
        value: parseFloat(amount),
        timestamp: now.toISOString(),
        status: "pending",
        description: `${cryptoName} deposit of ${
          deposit.cryptoAmount || deposit.paymentAmount
        } ${cryptoSymbol.toUpperCase()}`,
        method: `${cryptoName} (NOWPayments)`,
        date: now,
      });
    } catch (err: any) {
      console.error("Payment creation error:", err);
      setError(err.message || "Failed to create payment");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.depositId) return;

    try {
      const response = await fetch(
        `/api/payment/status/${paymentData.depositId}`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success && data.deposit) {
        const status = data.deposit.status;
        setPaymentStatus(status);

        // If payment is confirmed, notify user and close
        if (status === "COMPLETED") {
          addNotification({
            type: "deposit",
            title: `${cryptoName} Deposit Confirmed!`,
            message: `Your ${cryptoName} deposit of ${formatAmount(
              parseFloat(amount),
              2
            )} has been confirmed and credited to your account.`,
          });
          onComplete();
        } else if (status === "FAILED" || status === "EXPIRED") {
          setError(`Payment ${status.toLowerCase()}. Please try again.`);
        }
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  const walletAddress = paymentData?.paymentAddress || "";
  const cryptoAmount = paymentData?.paymentAmount || 0;
  const qrCodeUrl = walletAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        walletAddress
      )}`
    : "";

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentData?.depositId) return;

    try {
      setIsCancelling(true);
      const response = await fetch("/api/deposits/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId: paymentData.depositId,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          type: "info",
          title: "Payment Cancelled",
          message: `Your ${cryptoName} deposit has been cancelled.`,
        });
        onBack();
      } else {
        setError(data.error || "Failed to cancel payment");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Failed to cancel payment. Please try again.");
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <CryptoIcon symbol={cryptoSymbol} size="lg" />
        </div>
        <div
          className={`animate-spin rounded-full h-16 w-16 border-b-2 border-${cryptoConfig.color} mx-auto`}
        ></div>
        <p className="text-gray-400">Creating your {cryptoName} payment...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <CryptoIcon symbol={cryptoSymbol} size="lg" />
        </div>
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">Payment Creation Failed</h3>
          <p className="text-gray-400">{error}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={createPayment}
            className={`${cryptoConfig.bgColor} hover:opacity-90 text-white px-6 py-3 rounded-lg transition-colors`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get status badge
  const getStatusBadge = () => {
    switch (paymentStatus) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            ⏳ Waiting for Payment
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500 border border-blue-500/30">
            🔄 Processing...
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500 border border-green-500/30">
            ✓ Confirmed
          </span>
        );
      default:
        return null;
    }
  };

  // Format crypto amount based on the cryptocurrency
  const formatCryptoAmount = (amount: number | undefined | null) => {
    const numAmount = Number(amount) || 0;
    // Stablecoins and high-precision coins
    if (["USDC", "USDT"].includes(cryptoSymbol.toUpperCase())) {
      return numAmount.toFixed(2);
    }
    // Standard precision for most cryptos
    return numAmount.toFixed(8);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CryptoIcon symbol={cryptoSymbol} size="lg" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {cryptoName} Deposit
        </h2>
        <p className="text-gray-400 mb-3">
          Send exactly{" "}
          <span className={`text-${cryptoConfig.color} font-bold`}>
            {formatCryptoAmount(cryptoAmount)} {cryptoSymbol.toUpperCase()}
          </span>{" "}
          to complete your deposit
        </p>
        {getStatusBadge()}
      </div>

      {/* Timer */}
      <div
        className={`bg-${cryptoConfig.color}/10 border border-${cryptoConfig.color}/30 rounded-lg p-4 text-center`}
      >
        <div className={`text-${cryptoConfig.color} text-sm font-medium mb-1`}>
          Time remaining to send payment
        </div>
        <div className="text-white text-2xl font-bold">
          {formatTime(timeLeft)}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Payment will expire after this time
        </div>
      </div>

      {/* Amount Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">
            Deposit Amount ({preferredCurrency})
          </span>
          <span className="text-white font-medium">
            {formatAmount(parseFloat(amount), 2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{cryptoName} Amount</span>
          <span className={`text-${cryptoConfig.color} font-medium`}>
            {formatCryptoAmount(cryptoAmount)} {cryptoSymbol.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network Fee</span>
          <span className="text-green-500 font-medium">Included</span>
        </div>
        <hr className="border-gray-600" />
        <div className="flex justify-between">
          <span className="text-white font-medium">Total to Send</span>
          <span className={`text-${cryptoConfig.color} font-bold`}>
            {formatCryptoAmount(cryptoAmount)} {cryptoSymbol.toUpperCase()}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`${cryptoName} QR Code`}
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 animate-pulse"></div>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          Scan QR code with your {cryptoName} wallet
        </p>
      </div>

      {/* Wallet Address */}
      <div>
        <label className="block text-gray-400 text-sm mb-2">
          {cryptoName} Wallet Address
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white font-mono text-sm break-all">
            {walletAddress || "Loading..."}
          </div>
          <button
            onClick={copyToClipboard}
            disabled={!walletAddress}
            className={`${cryptoConfig.bgColor} hover:opacity-90 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {copied ? (
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
            ) : (
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-500 text-sm mt-2"
          >
            Address copied to clipboard!
          </motion.p>
        )}
      </div>

      {/* Invoice URL button (if available) */}
      {paymentData?.invoiceUrl && (
        <div className="text-center">
          <a
            href={paymentData.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 ${cryptoConfig.bgColor} hover:opacity-90 text-white px-6 py-3 rounded-lg transition-colors`}
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open Payment Page
          </a>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
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
          <div>
            <p className="text-blue-400 font-medium text-sm mb-2">
              Important Instructions:
            </p>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>
                • Send exactly {formatCryptoAmount(cryptoAmount)}{" "}
                {cryptoSymbol.toUpperCase()} to the address above
              </li>
              <li>
                • Only send {cryptoName} ({cryptoSymbol.toUpperCase()}) - other
                cryptocurrencies will be lost
              </li>
              <li>• Payment will be auto-detected when received</li>
              <li>• Your balance will be credited automatically</li>
              <li>• Keep this window open to monitor status</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Cancel Payment?
              </h3>
              <p className="text-gray-400 text-sm">
                Are you sure you want to cancel this payment? If you've already
                sent {cryptoName}, it may be lost.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Keep Payment
              </button>
              <button
                onClick={handleCancelPayment}
                disabled={isCancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={isCancelling || paymentStatus === "COMPLETED"}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 py-3 px-4 rounded-lg font-medium transition-colors border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCancelling ? "Cancelling..." : "Cancel Payment"}
        </button>
      </div>

      {/* Status Check */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">
          {paymentStatus === "PENDING"
            ? "Waiting for payment confirmation..."
            : paymentStatus === "PROCESSING"
            ? "Processing your payment..."
            : "Checking payment status..."}
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div
            className={`w-2 h-2 ${cryptoConfig.bgColor} rounded-full animate-pulse`}
          ></div>
          <span className="text-gray-500 text-xs">
            Auto-checking every 10 seconds
          </span>
        </div>
      </div>
    </div>
  );
}
