"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import SuccessModal from "@/components/client/SuccessModal";
import CryptoDropdown from "@/components/client/CryptoDropdown";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const [transferData, setTransferData] = useState({
    asset: "USD",
    amount: "",
    destination: "",
    memo: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    recipient: string;
  } | null>(null);
  const { portfolio } = usePortfolio();
  const { preferredCurrency, convertAmount } = useCurrency();
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
  const [receiverName, setReceiverName] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const { addTransaction, addNotification } = useNotifications();

  // Get supported assets - USD balance first, then crypto assets sorted by amount
  const supportedAssets = (() => {
    const assets = [
      {
        symbol: "USD",
        name: "USD Balance",
        amount: portfolio?.portfolio?.balance || 0,
      },
    ];

    const cryptoAssets = (portfolio?.portfolio?.assets || [])
      .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
      .map((asset: any) => ({
        symbol: asset.symbol,
        name: asset.symbol,
        amount: asset.amount || 0,
      }));

    return [...assets, ...cryptoAssets];
  })();

  // Calculate available balances from portfolio assets
  const availableBalances =
    supportedAssets.reduce((acc: any, asset: any) => {
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
      // Reset state when modal closes
      setTransferData({
        asset: "USD",
        amount: "",
        destination: "",
        memo: "",
      });
      setReceiverName(null);
      setErrors({});
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

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

    if (!transferData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    // Validate destination - accept email or account number only
    const dest = transferData.destination.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dest);
    const isAccountNumber = /^\d{8,}$/.test(dest); // 8+ digits

    if (!isEmail && !isAccountNumber) {
      newErrors.destination = "Enter a valid email or account number";
    }

    if (!receiverName) {
      newErrors.destination = "User not found";
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
          address: transferData.destination,
          asset: transferData.asset,
          lastUsed: new Date().toLocaleDateString(),
        };

        setRecentAddresses((prev) => {
          const filtered = prev.filter(
            (addr) => addr.address !== transferData.destination
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
          } to ${transferData.destination.slice(
            0,
            6
          )}...${transferData.destination.slice(-4)}`,
          memo: transferData.memo,
        };

        addTransaction(transaction);

        // Create notification
        addNotification({
          type: "transaction",
          title: "Transfer Initiated",
          message: `Transfer of ${amount} ${transferData.asset} to wallet address is being processed`,
        });

        // Show success modal
        setSuccessData({
          asset: transferData.asset,
          amount: amount,
          value:
            amount *
            (transferData.asset === "BTC"
              ? 65000
              : transferData.asset === "ETH"
              ? 2500
              : 0.5),
          recipient: transferData.destination,
        });
        setShowSuccessModal(true);

        // Reset form
        setTransferData({
          asset: "USD",
          amount: "",
          destination: "",
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
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="transfer-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
              style={{ touchAction: "none" }}
            />
            <motion.div
              key="transfer-modal-content"
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
                        Transfer to M4 User
                      </h2>
                      <p className="text-gray-400">
                        Send to another M4Capital user
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Asset Selection */}
                    <CryptoDropdown
                      label="Send From"
                      value={transferData.asset}
                      onChange={(value) =>
                        setTransferData((prev) => ({ ...prev, asset: value }))
                      }
                      options={supportedAssets.map((asset) => ({
                        symbol: asset.symbol,
                        name: `${asset.name} (${asset.symbol})`,
                      }))}
                    />

                    {/* Available Balance */}
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">
                          Available Balance:
                        </span>
                        <span className="text-white font-medium">
                          {transferData.asset === "USD"
                            ? preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency
                            : ""}
                          {(transferData.asset === "USD"
                            ? convertAmount(
                                availableBalances[
                                  transferData.asset as keyof typeof availableBalances
                                ] || 0
                              )
                            : availableBalances[
                                transferData.asset as keyof typeof availableBalances
                              ] || 0
                          ).toFixed(transferData.asset === "USD" ? 2 : 8)}{" "}
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
                        <p className="text-red-400 text-sm mt-1">
                          {errors.amount}
                        </p>
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

                    {/* Destination */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none border-0"
                        placeholder="user@example.com or 12345678"
                      />
                      {lookupLoading && (
                        <p className="text-blue-400 text-sm mt-1">
                          Looking up user...
                        </p>
                      )}
                      {receiverName && !lookupLoading && (
                        <p className="text-green-400 text-sm mt-1">
                          ✓ Found: {receiverName}
                        </p>
                      )}
                      {errors.destination && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.destination}
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
                                  destination: addressData.address,
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
                            {(
                              parseFloat(transferData.amount) + transferFee
                            ).toFixed(8)}{" "}
                            {transferData.asset}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Transfer Summary */}
                    {transferData.amount && transferData.destination && (
                      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                        <h3 className="text-orange-400 font-medium mb-2">
                          Transfer Summary
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">To:</span>
                            <span className="text-white">
                              {receiverName || transferData.destination}
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
                      disabled={
                        !transferData.amount ||
                        !transferData.destination ||
                        !receiverName
                      }
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
                            Transfers to external wallets are processed securely
                            with network fees.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      {isOpen && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          type="transfer"
          asset={successData?.asset || "BTC"}
          amount={successData?.amount.toString() || "0"}
          value={successData?.value.toString() || "0"}
          recipient={successData?.recipient}
        />
      )}
    </>
  );
}
