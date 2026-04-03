"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(!existingPayment);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(
    existingPayment || null
  );
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const router = useRouter();
  const { addNotification, addTransaction } = useNotifications();
  const { preferredCurrency, formatAmount, convertAmount } = useCurrency();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cryptoConfig =
    CRYPTO_CONFIG[cryptoSymbol.toUpperCase()] || CRYPTO_CONFIG.BTC;

  // Create payment on mount only if no existing payment
  useEffect(() => {
    if (!existingPayment) {
      createPayment();
    }
  }, [amount, cryptoCurrency, existingPayment]);

  // Poll payment status every 30 seconds (reduced frequency to avoid premature expiration)
  useEffect(() => {
    if (!paymentData?.depositId) return;

    const statusInterval = setInterval(async () => {
      await checkPaymentStatus();
    }, 30000); // Check every 30 seconds

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

  // Calculate and update timer based on expiresAt
  useEffect(() => {
    if (!paymentData?.expiresAt) return;

    const calculateTimeLeft = () => {
      const expiryTime = new Date(paymentData.expiresAt!).getTime();
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
      return secondsLeft;
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        setError("Payment expired. Please create a new deposit.");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData?.expiresAt]);

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
      <div className={`space-y-5 text-center py-6 px-6 rounded-2xl ${isDark ? "bg-gray-900/90 border border-gray-700" : "bg-white border border-gray-200 shadow-xl"}`}>
        <div className="flex items-center justify-center mb-3">
          <CryptoIcon symbol={cryptoSymbol} size="lg" />
        </div>
        <div className="mb-3">
          <svg
            className="w-14 h-14 mx-auto mb-3 text-red-500"
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
          <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-red-500" : "text-red-600"}`}>Payment Creation Failed</h3>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{error}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-300 hover:bg-gray-400 text-gray-800"}`}
          >
            Go Back
          </button>
          <button
            onClick={createPayment}
            className={`${cryptoConfig.bgColor} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
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
    <div className={`space-y-6 p-6 rounded-2xl ${isDark ? "bg-gray-900/90 border border-gray-700" : "bg-white border border-gray-200 shadow-xl"}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CryptoIcon symbol={cryptoSymbol} size="lg" />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          {cryptoName} Deposit
        </h2>
        <p className={`mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
        <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {formatTime(timeLeft)}
        </div>
        <div className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Payment will expire after this time
        </div>
      </div>

      {/* Amount Summary */}
      <div className={`rounded-lg p-3 space-y-1.5 text-sm ${isDark ? "bg-gray-800/50" : "bg-gray-50 border border-gray-200"}`}>
        <div className="flex justify-between">
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            Deposit Amount ({preferredCurrency})
          </span>
          <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {formatAmount(parseFloat(amount), 2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>{cryptoName} Amount</span>
          <span className={`text-${cryptoConfig.color} font-medium`}>
            {formatCryptoAmount(cryptoAmount)} {cryptoSymbol.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>Network Fee</span>
          <span className="text-green-500 font-medium">Included</span>
        </div>
        <hr className={isDark ? "border-gray-600" : "border-gray-200"} />
        <div className="flex justify-between">
          <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Total to Send</span>
          <span className={`text-${cryptoConfig.color} font-bold`}>
            {formatCryptoAmount(cryptoAmount)} {cryptoSymbol.toUpperCase()}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <div className={`p-3 rounded-lg inline-block mb-2 ${isDark ? "bg-white" : "bg-white border border-gray-200 shadow-sm"}`}>
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`${cryptoName} QR Code`}
              className="w-36 h-36"
            />
          ) : (
            <div className="w-36 h-36 bg-gray-200 animate-pulse"></div>
          )}
        </div>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Scan QR code with your {cryptoName} wallet
        </p>
      </div>

      {/* Wallet Address */}
      <div>
        <label className={`block text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {cryptoName} Wallet Address
        </label>
        <div className="flex items-center space-x-2">
          <div className={`flex-1 rounded-lg px-2 py-2 font-mono text-xs break-all ${isDark ? "bg-gray-800 border border-gray-600 text-white" : "bg-gray-50 border border-gray-200 text-gray-900"}`}>
            {walletAddress || "Loading..."}
          </div>
          <button
            onClick={copyToClipboard}
            disabled={!walletAddress}
            className={`${cryptoConfig.bgColor} hover:opacity-90 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {copied ? (
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
            ) : (
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
      <div className={`rounded-lg p-4 ${isDark ? "bg-blue-500/10 border border-blue-500/30" : "bg-blue-50 border border-blue-200"}`}>
        <div className="flex items-center gap-2 mb-2">
          <svg
            className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-blue-400" : "text-blue-500"}`}
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
          <p className="font-medium text-sm text-blue-500">
            Important Instructions:
          </p>
        </div>
        <ul className={`text-xs space-y-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
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

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-xl p-5 max-w-md w-full ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200 shadow-xl"}`}
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-7 h-7 text-red-500"
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
              <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Cancel Payment?
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Are you sure you want to cancel this payment? If you've already
                sent {cryptoName}, it may be lost.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Keep Payment
              </button>
              <button
                onClick={handleCancelPayment}
                disabled={isCancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Done Button */}
      <div className="flex">
        <button
          onClick={() => router.push("/dashboard")}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${cryptoConfig.bgColor} hover:opacity-90 text-white`}
        >
          Done
        </button>
      </div>

      {/* Status Check */}
      <div className="text-center">
        <p className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Auto-checking every 10 seconds
          </span>
        </div>
      </div>
    </div>
  );
}
