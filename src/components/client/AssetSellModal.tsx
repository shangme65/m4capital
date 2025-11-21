"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingDown, AlertCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import SuccessModal from "@/components/client/SuccessModal";

interface AssetSellModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    amount: number;
    price: number;
  };
}

export default function AssetSellModal({
  isOpen,
  onClose,
  asset,
}: AssetSellModalProps) {
  const [sellAmount, setSellAmount] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();
  const { preferredCurrency, convertAmount } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSellAmount("");
      setErrors({});
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const calculateUSDValue = () => {
    if (!sellAmount) return 0;
    return parseFloat(sellAmount) * asset.price;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      newErrors.sellAmount = "Please enter a valid amount";
    }

    if (parseFloat(sellAmount) > asset.amount) {
      newErrors.sellAmount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSell = async () => {
    if (validateForm()) {
      try {
        const amount = parseFloat(sellAmount);
        const value = calculateUSDValue();

        const transaction = {
          id: `sell_${Date.now()}`,
          type: "sell" as const,
          asset: asset.symbol,
          amount: amount,
          value: value,
          timestamp: new Date().toLocaleString(),
          status: "pending" as const,
          fee: 0,
          method: "Instant Sale",
          description: `Sold ${amount.toFixed(8)} ${
            asset.symbol
          } for $${value.toFixed(2)}`,
        };

        addTransaction(transaction);

        const notificationTitle = `${asset.symbol} Sold`;
        const notificationMessage = `Successfully sold ${amount.toFixed(8)} ${
          asset.symbol
        } for $${value.toFixed(2)}`;

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
            type: "crypto_sale",
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
            type: "crypto_sale",
            title: notificationTitle,
            message: notificationMessage,
            amount: value,
            asset: asset.symbol,
          }),
        });

        setSuccessData({
          asset: asset.symbol,
          amount: amount,
          value: value,
        });
        setShowSuccessModal(true);

        setSellAmount("");
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing sale:", error);
      }
    }
  };

  if (!isOpen) return null;

  const usdValue = calculateUSDValue();

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
              className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Sell {asset.symbol}
                      </h2>
                      <p className="text-rose-100 text-sm">
                        Convert to USD balance
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
                {/* Available Balance */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={asset.symbol} size="sm" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Available Balance
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {asset.amount.toFixed(8)} {asset.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Price</p>
                      <p className="text-lg font-bold text-rose-600">
                        {preferredCurrency === "USD"
                          ? "$"
                          : preferredCurrency === "EUR"
                          ? "€"
                          : preferredCurrency === "GBP"
                          ? "£"
                          : preferredCurrency}
                        {convertAmount(asset.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount to Sell
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.00000001"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      placeholder="0.00000000"
                      className="w-full px-4 py-3 pr-20 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {asset.symbol}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => setSellAmount(asset.amount.toString())}
                      className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Sell All
                    </button>

                    {sellAmount && parseFloat(sellAmount) > 0 && (
                      <p className="text-sm text-gray-600">
                        ≈{" "}
                        {preferredCurrency === "USD"
                          ? "$"
                          : preferredCurrency === "EUR"
                          ? "€"
                          : preferredCurrency === "GBP"
                          ? "£"
                          : preferredCurrency}
                        {convertAmount(usdValue).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {errors.sellAmount && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.sellAmount}
                    </p>
                  )}
                </div>

                {/* Preview */}
                {sellAmount &&
                  parseFloat(sellAmount) > 0 &&
                  !errors.sellAmount && (
                    <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-4 border border-rose-200">
                      <p className="text-sm text-gray-700 mb-3 font-medium">
                        Sale Preview
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">You're selling</span>
                          <span className="font-bold text-gray-900">
                            {parseFloat(sellAmount).toFixed(8)} {asset.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Exchange rate</span>
                          <span className="font-medium text-gray-900">
                            1 {asset.symbol} = ${asset.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-px bg-rose-200 my-2"></div>
                        <div className="flex justify-between text-base">
                          <span className="font-semibold text-gray-700">
                            You'll receive
                          </span>
                          <span className="font-bold text-rose-600 text-lg">
                            ${usdValue.toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Sell Button */}
                <button
                  onClick={handleSell}
                  disabled={!sellAmount || parseFloat(sellAmount) <= 0}
                  className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                >
                  Sell {asset.symbol}
                </button>

                <p className="text-xs text-center text-gray-500">
                  No fees • Instant settlement to USD balance
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="sell"
        asset={successData?.asset || ""}
        amount={successData?.amount.toString() || "0"}
        value={successData?.value.toString() || "0"}
      />
    </>
  );
}
