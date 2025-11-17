"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Copy, CheckCircle, Loader, QrCode } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import QRCode from "qrcode";

interface CustomWalletDepositProps {
  isOpen: boolean;
  onClose: () => void;
  asset: string;
  amount: number;
  usdValue: number;
}

export default function CustomWalletDeposit({
  isOpen,
  onClose,
  asset,
  amount,
  usdValue,
}: CustomWalletDepositProps) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [depositId, setDepositId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [txStatus, setTxStatus] = useState<any>(null);
  const { showSuccess, showError, showInfo } = useToast();

  // Generate wallet address when modal opens
  useEffect(() => {
    if (isOpen && !walletAddress) {
      generateWalletAddress();
    }
  }, [isOpen]);

  // Auto-check transaction status every 30 seconds
  useEffect(() => {
    if (!walletAddress) return;

    const interval = setInterval(() => {
      checkTransactionStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [walletAddress]);

  const generateWalletAddress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/payment/create-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate wallet address");
      }

      setWalletAddress(data.address);
      setDepositId(data.depositId);

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(
        `bitcoin:${data.address}?amount=${amount}`
      );
      setQrCodeUrl(qrUrl);

      showInfo(data.message || "Wallet address generated");
    } catch (error) {
      console.error("Wallet generation error:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Failed to generate wallet address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkTransactionStatus = async () => {
    if (!walletAddress || isChecking) return;

    setIsChecking(true);
    try {
      const response = await fetch("/api/payment/check-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: walletAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check transaction");
      }

      setTxStatus(data);

      if (data.confirmed) {
        showSuccess("Payment confirmed! Your account has been credited.");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else if (data.confirmations > 0) {
        showInfo(data.message || `${data.confirmations}/3 confirmations`);
      }
    } catch (error) {
      console.error("Transaction check error:", error);
      // Don't show error toast for auto-checks
    } finally {
      setIsChecking(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      showSuccess("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showError("Failed to copy address");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Bitcoin Deposit</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-80">You're buying</span>
              <span className="text-lg font-bold">
                {amount} {asset}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Total Amount</span>
              <span className="text-xl font-bold">
                ${usdValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-400">Generating wallet address...</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={qrCodeUrl}
                      alt="Bitcoin Address QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <label className="text-sm text-gray-400 mb-2 block">
                  Send Bitcoin to this address:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={walletAddress}
                    readOnly
                    className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={copyAddress}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Amount in BTC */}
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <label className="text-sm text-gray-400 mb-2 block">
                  Amount to send (approximately):
                </label>
                <p className="text-2xl font-bold text-white">{amount} BTC</p>
                <p className="text-sm text-gray-400 mt-1">
                  ≈ ${usdValue.toLocaleString()} USD
                </p>
              </div>

              {/* Transaction Status */}
              {txStatus && (
                <div
                  className={`rounded-xl p-4 border ${
                    txStatus.confirmed
                      ? "bg-green-900/20 border-green-500"
                      : "bg-yellow-900/20 border-yellow-500"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {txStatus.confirmed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
                    )}
                    <span
                      className={`font-semibold ${
                        txStatus.confirmed
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {txStatus.message}
                    </span>
                  </div>
                  {txStatus.confirmations > 0 && (
                    <p className="text-sm text-gray-400">
                      Confirmations: {txStatus.confirmations}/3
                    </p>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-900/20 border border-blue-500 rounded-xl p-4">
                <h3 className="text-blue-400 font-semibold mb-2">
                  Important Instructions:
                </h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Send exactly {amount} BTC to the address above</li>
                  <li>• Your account will be credited after 3 confirmations</li>
                  <li>• This usually takes 15-30 minutes</li>
                  <li>• We'll check automatically every 30 seconds</li>
                  <li>• Do not close this window until confirmed</li>
                </ul>
              </div>

              {/* Check Status Button */}
              <button
                onClick={checkTransactionStatus}
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2"
              >
                {isChecking ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Check Transaction Status</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
