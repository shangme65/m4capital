"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const [transferData, setTransferData] = useState({
    asset: "BTC",
    amount: "",
    walletAddress: "",
    memo: "",
  });
  const { portfolio } = usePortfolio();
  const [recentAddresses, setRecentAddresses] = useState<
    Array<{
      id: number;
      address: string;
      asset: string;
      lastUsed: string;
    }>
  >([]);
  const [transferFee] = useState(0.0001);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();

  // Calculate available balances from portfolio assets
  const availableBalances =
    portfolio?.portfolio?.assets?.reduce((acc: any, asset: any) => {
      acc[asset.symbol] = asset.amount || 0;
      return acc;
    }, {} as Record<string, number>) || {};

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!transferData.amount || parseFloat(transferData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (
      parseFloat(transferData.amount) >
      availableBalances[transferData.asset as keyof typeof availableBalances]
    ) {
      newErrors.amount = "Insufficient balance";
    }

    if (!transferData.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    }

    // Basic wallet address validation (check for minimum length and alphanumeric characters)
    if (transferData.walletAddress && transferData.walletAddress.length < 26) {
      newErrors.walletAddress = "Please enter a valid wallet address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransfer = () => {
    if (validateForm()) {
      try {
        const amount = parseFloat(transferData.amount);
        const totalDeducted = amount + transferFee;

        // Add to recent addresses after successful transfer
        const newAddress = {
          id: Date.now(),
          address: transferData.walletAddress,
          asset: transferData.asset,
          lastUsed: new Date().toLocaleDateString(),
        };

        setRecentAddresses((prev) => {
          const filtered = prev.filter(
            (addr) => addr.address !== transferData.walletAddress
          );
          return [newAddress, ...filtered].slice(0, 3); // Keep only 3 most recent
        });

        // Create transaction
        const transaction = {
          id: `transfer_${Date.now()}`,
          type: "transfer" as const,
          asset: transferData.asset,
          amount: amount,
          value:
            amount *
            (transferData.asset === "BTC"
              ? 65000
              : transferData.asset === "ETH"
              ? 2500
              : 0.5),
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: transferFee,
          method: "External Transfer",
          description: `Transfer ${amount} ${
            transferData.asset
          } to ${transferData.walletAddress.slice(
            0,
            6
          )}...${transferData.walletAddress.slice(-4)}`,
          memo: transferData.memo,
        };

        addTransaction(transaction);

        // Create notification
        addNotification({
          type: "transaction",
          title: "Transfer Initiated",
          message: `Transfer of ${amount} ${transferData.asset} to wallet address is being processed`,
        });

        // Reset form and close modal
        setTransferData({
          asset: "BTC",
          amount: "",
          walletAddress: "",
          memo: "",
        });
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing transfer:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
        style={{ touchAction: "none" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "auto" }}
      >
        <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Close transfer modal"
            title="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Transfer Crypto
                </h2>
                <p className="text-gray-400">Send to external wallet</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Asset
                </label>
                <select
                  value={transferData.asset}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      asset: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none border-0"
                  aria-label="Select asset to transfer"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="ADA">Cardano (ADA)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>

              {/* Available Balance */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-white font-medium">
                    {
                      availableBalances[
                        transferData.asset as keyof typeof availableBalances
                      ]
                    }{" "}
                    {transferData.asset}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.00000001"
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-16 text-white focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {transferData.asset}
                  </span>
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                )}

                <button
                  onClick={() =>
                    setTransferData((prev) => ({
                      ...prev,
                      amount: (
                        availableBalances[
                          transferData.asset as keyof typeof availableBalances
                        ] - transferFee
                      ).toString(),
                    }))
                  }
                  className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors"
                >
                  Use Max
                </button>
              </div>

              {/* Destination Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destination Wallet Address
                </label>
                <input
                  type="text"
                  value={transferData.walletAddress}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      walletAddress: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none border-0"
                  placeholder="Enter destination wallet address"
                />
                {errors.walletAddress && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.walletAddress}
                  </p>
                )}
              </div>

              {/* Recent Addresses */}
              {recentAddresses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recent Addresses
                  </label>
                  <div className="space-y-2">
                    {recentAddresses.map((addressData) => (
                      <button
                        key={addressData.id}
                        onClick={() =>
                          setTransferData((prev) => ({
                            ...prev,
                            walletAddress: addressData.address,
                          }))
                        }
                        className="w-full text-left bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium text-sm">
                              {addressData.address.slice(0, 8)}...
                              {addressData.address.slice(-6)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {addressData.asset} - Last used:{" "}
                              {addressData.lastUsed}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Memo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none resize-none border-0"
                  placeholder="Add a note for this transfer"
                  rows={3}
                />
              </div>

              {/* Fee Information */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Transfer Fee:</span>
                  <span className="text-white">
                    {transferFee} {transferData.asset}
                  </span>
                </div>
                {transferData.amount && (
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-300">Total Deducted:</span>
                    <span className="text-white">
                      {(parseFloat(transferData.amount) + transferFee).toFixed(
                        8
                      )}{" "}
                      {transferData.asset}
                    </span>
                  </div>
                )}
              </div>

              {/* Transfer Summary */}
              {transferData.amount && transferData.walletAddress && (
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h3 className="text-orange-400 font-medium mb-2">
                    Transfer Summary
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">To:</span>
                      <span className="text-white">
                        {transferData.walletAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">
                        {transferData.amount} {transferData.asset}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fee:</span>
                      <span className="text-white">
                        {transferFee} {transferData.asset}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleTransfer}
                disabled={!transferData.amount || !transferData.walletAddress}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Send Transfer
              </button>

              {/* Info Notice */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-0.5 mr-3"
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
                    <p className="text-blue-400 text-sm font-medium">
                      External Transfer
                    </p>
                    <p className="text-blue-300 text-sm mt-1">
                      Transfers to external wallets are processed securely with
                      network fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
