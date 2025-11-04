"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useNotifications } from "@/contexts/NotificationContext";

interface BitcoinWalletProps {
  amount: string;
  onBack: () => void;
  onComplete: () => void;
}

interface PaymentData {
  paymentAddress: string;
  paymentAmount: number;
  depositId: string;
  paymentId: string;
  expiresAt?: string;
}

export default function BitcoinWallet({
  amount,
  onBack,
  onComplete,
}: BitcoinWalletProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");

  const { addNotification, addTransaction } = useNotifications();

  // Create payment on mount
  useEffect(() => {
    createPayment();
  }, [amount]);

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

      const response = await fetch("/api/payment/create-bitcoin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: "USD",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      if (!data.success || !data.deposit) {
        throw new Error("Invalid payment response");
      }

      setPaymentData({
        paymentAddress: data.deposit.paymentAddress,
        paymentAmount: data.deposit.paymentAmount,
        depositId: data.deposit.id,
        paymentId: data.deposit.paymentId,
        expiresAt: data.deposit.expiresAt,
      });

      // Create transaction notification
      addTransaction({
        type: "deposit",
        asset: "BTC",
        amount: data.deposit.paymentAmount,
        value: parseFloat(amount),
        timestamp: new Date().toLocaleString(),
        status: "pending",
        description: `Bitcoin deposit of ${data.deposit.paymentAmount} BTC`,
        method: "Bitcoin (NOWPayments)",
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
            title: "Bitcoin Deposit Confirmed!",
            message: `Your Bitcoin deposit of $${amount} has been confirmed and credited to your account.`,
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
  const btcAmount = paymentData?.paymentAmount || 0;
  const qrCodeUrl = walletAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${walletAddress}?amount=${btcAmount}`
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/m4capitallogo1.png"
            alt="Capital Logo"
            width={32}
            height={32}
          />
          <span className="ml-2 text-orange-500 font-medium text-xl">
            Capital
          </span>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-400">Creating your Bitcoin payment...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/m4capitallogo1.png"
            alt="Capital Logo"
            width={32}
            height={32}
          />
          <span className="ml-2 text-orange-500 font-medium text-xl">
            Capital
          </span>
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
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Go Back
        </button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/m4capitallogo1.png"
            alt="Capital Logo"
            width={32}
            height={32}
          />
          <span className="ml-2 text-orange-500 font-medium text-xl">
            Capital
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bitcoin Deposit</h2>
        <p className="text-gray-400 mb-3">
          Send exactly{" "}
          <span className="text-orange-500 font-bold">
            {btcAmount.toFixed(8)} BTC
          </span>{" "}
          to complete your deposit
        </p>
        {getStatusBadge()}
      </div>

      {/* Timer */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
        <div className="text-orange-500 text-sm font-medium mb-1">
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
          <span className="text-gray-400">Deposit Amount (USD)</span>
          <span className="text-white font-medium">${amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Bitcoin Amount</span>
          <span className="text-orange-500 font-medium">
            {btcAmount.toFixed(8)} BTC
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network Fee</span>
          <span className="text-green-500 font-medium">Included</span>
        </div>
        <hr className="border-gray-600" />
        <div className="flex justify-between">
          <span className="text-white font-medium">Total to Send</span>
          <span className="text-orange-500 font-bold">
            {btcAmount.toFixed(8)} BTC
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Bitcoin QR Code" className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 bg-gray-200 animate-pulse"></div>
          )}
        </div>
        <p className="text-gray-400 text-sm">
          Scan QR code with your Bitcoin wallet
        </p>
      </div>

      {/* Wallet Address */}
      <div>
        <label className="block text-gray-400 text-sm mb-2">
          Bitcoin Wallet Address
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-3 text-white font-mono text-sm break-all">
            {walletAddress || "Loading..."}
          </div>
          <button
            onClick={copyToClipboard}
            disabled={!walletAddress}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <li>• Send exactly {btcAmount.toFixed(8)} BTC to the address above</li>
              <li>
                • Only send Bitcoin (BTC) - other cryptocurrencies will be lost
              </li>
              <li>• Payment will be auto-detected when received</li>
              <li>• Your balance will be credited automatically</li>
              <li>• Keep this window open to monitor status</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          ← Back
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
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-gray-500 text-xs">
            Auto-checking every 10 seconds
          </span>
        </div>
      </div>
    </div>
  );
}
