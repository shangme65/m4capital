"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellModal({ isOpen, onClose }: SellModalProps) {
  const [sellData, setSellData] = useState({
    asset: "BTC",
    amount: "",
    sellType: "all", // "all" or "partial"
  });
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [availableBalances] = useState({
    BTC: 0.8542,
    ETH: 12.67,
    ADA: 8420.15,
    SOL: 45.23,
  });
  const [assetPrices] = useState({
    BTC: 65000,
    ETH: 2500,
    ADA: 0.35,
    SOL: 150,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { addTransaction, addNotification } = useNotifications();

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

  const getCurrentPrice = () => {
    return orderType === "limit" && limitPrice
      ? parseFloat(limitPrice)
      : assetPrices[sellData.asset as keyof typeof assetPrices];
  };

  const getAmountToSell = () => {
    if (sellData.sellType === "all") {
      return availableBalances[
        sellData.asset as keyof typeof availableBalances
      ];
    }
    return parseFloat(sellData.amount) || 0;
  };

  const getEstimatedValue = () => {
    const amount = getAmountToSell();
    const price = getCurrentPrice();
    return amount * price;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (sellData.sellType === "partial") {
      if (!sellData.amount || parseFloat(sellData.amount) <= 0) {
        newErrors.amount = "Please enter a valid amount";
      }

      if (
        parseFloat(sellData.amount) >
        availableBalances[sellData.asset as keyof typeof availableBalances]
      ) {
        newErrors.amount = "Insufficient balance";
      }
    }

    const balance =
      availableBalances[sellData.asset as keyof typeof availableBalances];
    if (balance <= 0) {
      newErrors.general = "You don't have any " + sellData.asset + " to sell";
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      newErrors.limitPrice = "Please enter a valid limit price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSell = () => {
    if (validateForm()) {
      try {
        const price = getCurrentPrice();
        const assetAmount = getAmountToSell();
        const usdValue = assetAmount * price;
        const fee = usdValue * 0.015; // 1.5% fee
        const netReceived = usdValue - fee;

        // Create transaction
        const transaction = {
          type: "sell" as const,
          asset: sellData.asset,
          amount: assetAmount,
          value: usdValue,
          timestamp: new Date().toLocaleString(),
          status:
            orderType === "market"
              ? ("completed" as const)
              : ("pending" as const),
          fee: fee,
          method: "USD Balance",
          description: `${
            orderType === "market" ? "Market" : "Limit"
          } sell order for ${sellData.asset}`,
          rate: price,
        };

        addTransaction(transaction);

        // Create notification
        addNotification({
          type: "transaction",
          title:
            orderType === "market" ? "Sale Completed" : "Sell Order Placed",
          message: `Successfully ${
            orderType === "market" ? "sold" : "placed sell order for"
          } ${assetAmount.toFixed(8)} ${
            sellData.asset
          } for $${netReceived.toFixed(2)}`,
        });

        // Reset form and close modal
        setSellData({
          asset: "BTC",
          amount: "",
          sellType: "all",
        });
        setOrderType("market");
        setLimitPrice("");
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing sell order:", error);
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
            aria-label="Close sell modal"
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
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
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
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sell Crypto</h2>
                <p className="text-gray-400">Convert cryptocurrency to USD</p>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setOrderType("market")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      orderType === "market"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Market
                  </button>
                  <button
                    onClick={() => setOrderType("limit")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      orderType === "limit"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Asset to Sell
                </label>
                <select
                  value={sellData.asset}
                  onChange={(e) =>
                    setSellData((prev) => ({ ...prev, asset: e.target.value }))
                  }
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  aria-label="Select asset to sell"
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
                        sellData.asset as keyof typeof availableBalances
                      ]
                    }{" "}
                    {sellData.asset}
                  </span>
                </div>
              </div>

              {/* Current Price */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-white font-medium">
                    $
                    {assetPrices[
                      sellData.asset as keyof typeof assetPrices
                    ].toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Limit Price (if limit order) */}
              {orderType === "limit" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Limit Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter limit price"
                  />
                  {errors.limitPrice && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.limitPrice}
                    </p>
                  )}
                </div>
              )}

              {/* Sell Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount to Sell
                </label>
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() =>
                      setSellData((prev) => ({
                        ...prev,
                        sellType: "all",
                        amount: "",
                      }))
                    }
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      sellData.sellType === "all"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Sell All
                  </button>
                  <button
                    onClick={() =>
                      setSellData((prev) => ({ ...prev, sellType: "partial" }))
                    }
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      sellData.sellType === "partial"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Partial Sale
                  </button>
                </div>

                {sellData.sellType === "partial" && (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.00000001"
                      value={sellData.amount}
                      onChange={(e) =>
                        setSellData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 pr-16 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {sellData.asset}
                    </span>
                  </div>
                )}
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Estimated Value */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">You will sell:</span>
                  <span className="text-white font-medium">
                    {getAmountToSell().toFixed(8)} {sellData.asset}
                  </span>
                </div>
              </div>

              {/* Fee Information */}
              {getAmountToSell() > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Gross Value:</span>
                    <span className="text-white">
                      ${getEstimatedValue().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fee (1.5%):</span>
                    <span className="text-white">
                      ${(getEstimatedValue() * 0.015).toFixed(2)}
                    </span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-300">You will receive:</span>
                    <span className="text-white">
                      ${(getEstimatedValue() * 0.985).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSell}
                disabled={getAmountToSell() <= 0}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {orderType === "market" ? "Sell Now" : "Place Sell Order"}
              </button>

              {orderType === "limit" && (
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
                        Limit Order
                      </p>
                      <p className="text-blue-300 text-sm mt-1">
                        Your order will execute when the price reaches your
                        specified limit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
