"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

interface PIXPaymentProps {
  amount: number; // Amount in BRL
  onBack: () => void;
  onComplete: () => void;
}

interface PIXPaymentData {
  depositId: string;
  paymentId: string;
  qrCode: string; // Base64 image or URL
  qrCodeText: string; // PIX copy-paste code
  pixKey?: string;
  expiresAt: string;
  status: string;
  amountBRL: number;
}

export default function PIXPayment({
  amount,
  onBack,
  onComplete,
}: PIXPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState<PIXPaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Create PIX payment
  const createPayment = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get user data from session
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (!session?.user) {
        throw new Error("Please log in to continue");
      }

      const response = await fetch("/api/payment/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: amount,
          payerName: session.user.name || "User",
          payerDocument: "00000000000", // Should get from user profile
          payerEmail: session.user.email,
          expirationMinutes: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create PIX payment"
        );
      }

      if (!data.success || !data.data?.deposit) {
        throw new Error("Invalid payment response");
      }

      setPaymentData({
        depositId: data.data.deposit.id,
        paymentId: data.data.deposit.paymentId,
        qrCode: data.data.deposit.qrCode,
        qrCodeText: data.data.deposit.qrCodeText,
        pixKey: data.data.deposit.pixKey,
        expiresAt: data.data.deposit.expiresAt,
        status: data.data.deposit.status,
        amountBRL: data.data.deposit.amountBRL,
      });

      // Start checking for payment
      startPaymentCheck(data.data.deposit.id);
    } catch (err) {
      console.error("PIX payment error:", err);
      setError(err instanceof Error ? err.message : "Failed to create payment");
    } finally {
      setIsLoading(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = async (depositId: string) => {
    try {
      setChecking(true);
      const response = await fetch(
        `/api/payment/create-pix?depositId=${depositId}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data?.status === "paid") {
        onComplete();
      }
    } catch (err) {
      console.error("Status check error:", err);
    } finally {
      setChecking(false);
    }
  };

  // Start periodic payment checking
  const startPaymentCheck = (depositId: string) => {
    const interval = setInterval(() => {
      checkPaymentStatus(depositId);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  };

  // Copy QR code text to clipboard
  const copyToClipboard = () => {
    if (paymentData?.qrCodeText) {
      navigator.clipboard.writeText(paymentData.qrCodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate time left
  useEffect(() => {
    if (!paymentData?.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(paymentData.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [paymentData]);

  // Auto-create payment on mount
  useEffect(() => {
    createPayment();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-gray-300 text-lg">Creating PIX payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Payment Error</h3>
        <p className="text-gray-300 text-center mb-6">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              setError("");
              createPayment();
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <QrCode className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">PIX Payment</h2>
          <p className="text-gray-400">
            Scan the QR code or copy the PIX code to complete your payment
          </p>
        </div>

        {/* Amount */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Amount to pay</p>
          <p className="text-3xl font-bold text-white">
            R${" "}
            {paymentData.amountBRL.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-6 mb-6 flex justify-center">
          {paymentData.qrCode.startsWith("data:") ||
          paymentData.qrCode.startsWith("http") ? (
            <Image
              src={paymentData.qrCode}
              alt="PIX QR Code"
              width={250}
              height={250}
              className="rounded-xl"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center px-4">
                QR Code will appear here
              </p>
            </div>
          )}
        </div>

        {/* PIX Code (Copy & Paste) */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-300 font-semibold">PIX Copy & Paste</p>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 break-all text-sm text-gray-300 font-mono">
            {paymentData.qrCodeText}
          </div>
        </div>

        {/* Timer */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <p className="text-orange-300 text-sm font-medium">
                Time remaining
              </p>
              <p className="text-orange-200 text-lg font-bold">{timeLeft}</p>
            </div>
            {checking && (
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm">
              📱
            </span>
            How to pay with PIX
          </h3>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              Open your bank's app or digital wallet
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              Go to the PIX section and choose "Pay with QR Code" or "Copy &
              Paste"
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              Scan the QR code above or paste the PIX code
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              Confirm the payment amount and complete the transaction
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">5.</span>
              Your account will be credited automatically within seconds
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => checkPaymentStatus(paymentData.depositId)}
            disabled={checking}
            className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Check Status
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
