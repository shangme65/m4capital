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

export default function BitcoinWallet({
  amount,
  onBack,
  onComplete,
}: BitcoinWalletProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const { addNotification, addTransaction } = useNotifications();

  // Bitcoin wallet address (in real app, this would be generated for each transaction)
  const walletAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:${walletAddress}?amount=${
    parseFloat(amount) / 45000
  }`; // Assuming 1 BTC = $45,000

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

  const btcAmount = (parseFloat(amount) / 45000).toFixed(8); // Convert USD to BTC

  const handlePaymentComplete = () => {
    // Create a new transaction
    addTransaction({
      type: "deposit",
      asset: "BTC",
      amount: parseFloat(btcAmount),
      value: parseFloat(amount),
      timestamp: new Date().toLocaleString(),
      status: "pending",
      description: `Bitcoin deposit of ${btcAmount} BTC`,
      method: "Bitcoin",
    });

    // Create a notification
    addNotification({
      type: "deposit",
      title: "Bitcoin Deposit Submitted",
      message: `Your Bitcoin deposit of $${amount} has been submitted and is pending confirmation. You will be notified once the transaction is confirmed on the blockchain.`,
    });

    // Call the original onComplete callback
    onComplete();
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
        <p className="text-gray-400">
          Send exactly{" "}
          <span className="text-orange-500 font-bold">{btcAmount} BTC</span> to
          complete your deposit
        </p>
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
          <span className="text-orange-500 font-medium">{btcAmount} BTC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network Fee</span>
          <span className="text-green-500 font-medium">Free</span>
        </div>
        <hr className="border-gray-600" />
        <div className="flex justify-between">
          <span className="text-white font-medium">Total to Send</span>
          <span className="text-orange-500 font-bold">{btcAmount} BTC</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-4">
          <img src={qrCodeUrl} alt="Bitcoin QR Code" className="w-48 h-48" />
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
            {walletAddress}
          </div>
          <button
            onClick={copyToClipboard}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors"
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
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <p className="text-red-400 font-medium text-sm mb-2">
              Important Instructions:
            </p>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Send exactly {btcAmount} BTC to this address</li>
              <li>
                • Only send Bitcoin (BTC) - other cryptocurrencies will be lost
              </li>
              <li>• Payment must be received within 30 minutes</li>
              <li>• Minimum 1 confirmation required</li>
              <li>• Do not send from an exchange wallet</li>
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
          Back to Deposit
        </button>
        <button
          onClick={handlePaymentComplete}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          I've Sent Payment
        </button>
      </div>

      {/* Status Check */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">
          Waiting for payment confirmation...
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-gray-500 text-xs">
            Monitoring blockchain for transactions
          </span>
        </div>
      </div>
    </div>
  );
}
