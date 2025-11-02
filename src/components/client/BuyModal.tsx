"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyModal({ isOpen, onClose }: BuyModalProps) {
  const [buyData, setBuyData] = useState({
    asset: "BTC",
    amount: "",
    paymentMethod: "balance",
  });
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const { portfolio } = usePortfolio();
  const availableBalance = portfolio?.portfolio?.balance
    ? parseFloat(portfolio.portfolio.balance.toString())
    : 0;
  const [assetPrices] = useState({
    BTC: 65000,
    ETH: 2500,
    ADA: 0.35,
    SOL: 150,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAmountInCrypto, setShowAmountInCrypto] = useState(false);
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
      : assetPrices[buyData.asset as keyof typeof assetPrices];
  };

  const getEstimatedAmount = () => {
    if (!buyData.amount) return 0;
    const usdAmount = parseFloat(buyData.amount);
    const price = getCurrentPrice();
    return usdAmount / price;
  };

  const toggleCurrency = () => {
    const currentAmount = parseFloat(buyData.amount) || 0;
    const price = getCurrentPrice();

    if (showAmountInCrypto) {
      // Convert from crypto to USD
      const usdAmount = currentAmount * price;
      setBuyData((prev) => ({
        ...prev,
        amount: usdAmount.toFixed(2),
      }));
    } else {
      // Convert from USD to crypto
      const cryptoAmount = currentAmount / price;
      setBuyData((prev) => ({
        ...prev,
        amount: cryptoAmount.toString(),
      }));
    }

    setShowAmountInCrypto(!showAmountInCrypto);
  };

  const getCurrentCurrencySymbol = () => {
    return showAmountInCrypto ? buyData.asset : "USD";
  };

  const getCurrentAmountLabel = () => {
    return showAmountInCrypto ? `Amount (${buyData.asset})` : "Amount (USD)";
  };

  const getAmountPlaceholder = () => {
    return showAmountInCrypto ? "0.00000000" : "0.00";
  };

  const getAmountStep = () => {
    return showAmountInCrypto ? "0.00000001" : "0.01";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!buyData.amount || parseFloat(buyData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    const totalCost = parseFloat(buyData.amount) * 1.015; // Include 1.5% fee
    if (totalCost > availableBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      newErrors.limitPrice = "Please enter a valid limit price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBuy = () => {
    if (validateForm()) {
      try {
        const price = getCurrentPrice();
        const usdAmount = parseFloat(buyData.amount);
        const assetAmount = usdAmount / price;
        const fee = usdAmount * 0.015; // 1.5% fee

        // Create transaction
        const transaction = {
          id: `buy_${Date.now()}`,
          type: "buy" as const,
          asset: buyData.asset,
          amount: assetAmount,
          value: usdAmount,
          timestamp: new Date().toLocaleString(),
          status:
            orderType === "market"
              ? ("completed" as const)
              : ("pending" as const),
          fee: fee,
          method: "USD Balance",
          description: `${
            orderType === "market" ? "Market" : "Limit"
          } buy order for ${buyData.asset}`,
          rate: price,
        };

        addTransaction(transaction);

        // Create notification
        addNotification({
          type: "transaction",
          title:
            orderType === "market" ? "Purchase Completed" : "Buy Order Placed",
          message: `Successfully ${
            orderType === "market" ? "purchased" : "placed buy order for"
          } ${assetAmount.toFixed(8)} ${buyData.asset}`,
        });

        // Reset form and close modal
        setBuyData({
          asset: "BTC",
          amount: "",
          paymentMethod: "balance",
        });
        setOrderType("market");
        setLimitPrice("");
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing buy order:", error);
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
            aria-label="Close buy modal"
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
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
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
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Buy Crypto</h2>
                <p className="text-gray-400">Purchase cryptocurrency</p>
              </div>
            </div>

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
                  Select Asset
                </label>
                <select
                  value={buyData.asset}
                  onChange={(e) =>
                    setBuyData((prev) => ({ ...prev, asset: e.target.value }))
                  }
                  className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none border-0"
                  aria-label="Select asset to buy"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="ADA">Cardano (ADA)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
              </div>

              {/* Current Price */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="text-white font-medium">
                    $
                    {assetPrices[
                      buyData.asset as keyof typeof assetPrices
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

              {/* Amount with Currency Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {getCurrentAmountLabel()}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={getAmountStep()}
                    value={buyData.amount}
                    onChange={(e) =>
                      setBuyData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-16 text-white focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={getAmountPlaceholder()}
                  />
                  <button
                    type="button"
                    onClick={toggleCurrency}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {getCurrentCurrencySymbol()}
                  </button>
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                )}

                <div className="flex space-x-2 mt-2">
                  {showAmountInCrypto
                    ? [0.001, 0.01, 0.1, 1].map((preset) => (
                        <button
                          key={preset}
                          onClick={() =>
                            setBuyData((prev) => ({
                              ...prev,
                              amount: preset.toString(),
                            }))
                          }
                          className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
                        >
                          {preset} {buyData.asset}
                        </button>
                      ))
                    : [100, 250, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          onClick={() =>
                            setBuyData((prev) => ({
                              ...prev,
                              amount: preset.toString(),
                            }))
                          }
                          className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
                        >
                          ${preset}
                        </button>
                      ))}
                </div>
              </div>

              {/* Estimated Amount */}
              {buyData.amount && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">You will receive:</span>
                    <span className="text-white font-medium">
                      {getEstimatedAmount().toFixed(8)} {buyData.asset}
                    </span>
                  </div>
                </div>
              )}

              {/* Available Balance */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-white font-medium">
                    $
                    {availableBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Fee Information */}
              {buyData.amount && (
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      ${parseFloat(buyData.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fee (1.5%):</span>
                    <span className="text-white">
                      ${(parseFloat(buyData.amount) * 0.015).toFixed(2)}
                    </span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white">
                      ${(parseFloat(buyData.amount) * 1.015).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBuy}
                disabled={!buyData.amount}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {orderType === "market" ? "Buy Now" : "Place Buy Order"}
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
