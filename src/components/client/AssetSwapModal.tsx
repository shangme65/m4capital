"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, AlertCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCryptoMarket } from "@/components/client/CryptoMarketProvider";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import CryptoDropdown from "@/components/client/CryptoDropdown";
import SuccessModal from "@/components/client/SuccessModal";

interface AssetSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    amount: number;
    price: number;
  };
  availableAssets: Array<{
    symbol: string;
    name: string;
    amount: number;
    price: number;
  }>;
}

export default function AssetSwapModal({
  isOpen,
  onClose,
  asset,
  availableAssets,
}: AssetSwapModalProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAsset, setToAsset] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    toAmount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount } = useCurrency();
  const { cryptoPrices } = useCryptoMarket();

  const toAssetData = availableAssets.find((a) => a.symbol === toAsset);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setFromAmount("");
      setToAsset("");
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateToAmount = () => {
    if (!fromAmount || !toAsset || !toAssetData) return 0;
    const amount = parseFloat(fromAmount);
    const fromValue = amount * asset.price;
    const toPrice = toAssetData.price;
    return fromValue / toPrice;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      newErrors.fromAmount = "Please enter a valid amount";
    }

    if (parseFloat(fromAmount) > asset.amount) {
      newErrors.fromAmount = "Insufficient balance";
    }

    if (!toAsset) {
      newErrors.toAsset = "Please select an asset to swap to";
    }

    if (toAsset === asset.symbol) {
      newErrors.toAsset = "Cannot swap to the same asset";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSwap = async () => {
    if (validateForm()) {
      try {
        const fromAmt = parseFloat(fromAmount);
        const toAmt = calculateToAmount();
        const value = fromAmt * asset.price;

        const transaction = {
          id: `swap_${Date.now()}`,
          type: "convert" as const,
          asset: asset.symbol,
          amount: fromAmt,
          value: value,
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: 0,
          method: "Crypto Swap",
          description: `Swap ${fromAmt.toFixed(8)} ${
            asset.symbol
          } to ${toAmt.toFixed(8)} ${toAsset}`,
          toAsset: toAsset,
          toAmount: toAmt,
        };

        addTransaction(transaction);

        const notificationTitle = `Swap Initiated`;
        const notificationMessage = `Swapping ${fromAmt.toFixed(8)} ${
          asset.symbol
        } to ${toAmt.toFixed(8)} ${toAsset} is being processed`;

        addNotification({
          type: "transaction",
          title: notificationTitle,
          message: notificationMessage,
          amount: value,
          asset: asset.symbol,
        });

        // Send email notification
        await fetch("/api/notifications/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "crypto_conversion",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        // Send push notification
        await fetch("/api/notifications/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "crypto_conversion",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        setSuccessData({
          fromAsset: asset.symbol,
          toAsset: toAsset,
          fromAmount: fromAmt,
          toAmount: toAmt,
          value: value,
        });
        setShowSuccessModal(true);

        setFromAmount("");
        setToAsset("");
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing swap:", error);
      }
    }
  };

  if (!isOpen) return null;

  const toAmount = calculateToAmount();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Swap Crypto</h2>
                      <p className="text-purple-100 text-sm">
                        Exchange between assets
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* From Asset */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From
                  </label>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CryptoIcon symbol={asset.symbol} size="sm" />
                        <div>
                          <p className="font-bold text-gray-900">
                            {asset.symbol}
                          </p>
                          <p className="text-xs text-gray-600">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Balance</p>
                        <p className="text-sm font-medium text-gray-900">
                          {asset.amount.toFixed(8)}
                        </p>
                      </div>
                    </div>

                    <input
                      type="number"
                      step="0.00000001"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      placeholder="0.00000000"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />

                    <button
                      onClick={() => setFromAmount(asset.amount.toString())}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                    >
                      Use Max
                    </button>

                    {fromAmount && parseFloat(fromAmount) > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        ≈{" "}
                        {preferredCurrency === "USD"
                          ? "$"
                          : preferredCurrency === "EUR"
                          ? "€"
                          : preferredCurrency === "GBP"
                          ? "£"
                          : preferredCurrency}
                        {convertAmount(
                          parseFloat(fromAmount) * asset.price
                        ).toFixed(2)}
                      </p>
                    )}

                    {errors.fromAmount && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.fromAmount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Swap Arrow */}
                <div className="flex justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* To Asset */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To
                  </label>
                  <CryptoDropdown
                    value={toAsset}
                    onChange={setToAsset}
                    options={availableAssets
                      .filter((a) => a.symbol !== asset.symbol)
                      .map((a) => ({
                        symbol: a.symbol,
                        name: a.name,
                        price: a.price,
                      }))}
                    showPrices={true}
                  />

                  {toAsset && toAmount > 0 && (
                    <div className="bg-white rounded-2xl p-4 mt-3 shadow-sm border border-purple-100">
                      <p className="text-sm text-gray-600 mb-1">
                        You will receive
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {toAmount.toFixed(8)} {toAsset}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        ≈{" "}
                        {preferredCurrency === "USD"
                          ? "$"
                          : preferredCurrency === "EUR"
                          ? "€"
                          : preferredCurrency === "GBP"
                          ? "£"
                          : preferredCurrency}
                        {convertAmount(
                          toAmount * (toAssetData?.price || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {errors.toAsset && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.toAsset}
                    </p>
                  )}
                </div>

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={!fromAmount || !toAsset}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                >
                  Swap Now
                </button>

                <p className="text-xs text-center text-gray-500">
                  No fees for crypto swaps
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="swap"
        asset={successData?.fromAsset || ""}
        amount={successData?.fromAmount.toString() || "0"}
        value={successData?.value.toString() || "0"}
        toAsset={successData?.toAsset}
        toAmount={successData?.toAmount.toString()}
      />
    </>
  );
}
