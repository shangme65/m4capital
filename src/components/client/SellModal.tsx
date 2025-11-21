"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { usePortfolio } from "@/lib/usePortfolio";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { Check } from "lucide-react";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellModal({ isOpen, onClose }: SellModalProps) {
  const { portfolio, refetch } = usePortfolio();
  const { preferredCurrency, convertAmount } = useCurrency();
  const { addTransaction, addNotification } = useNotifications();
  const [sellData, setSellData] = useState({
    asset: "",
    amount: "",
  });
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
  } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [assetPrices, setAssetPrices] = useState<
    Record<string, { price: number }>
  >({});

  // Get list of assets user actually owns
  const userAssets = portfolio?.portfolio?.assets || [];
  const availableAssets = userAssets.filter((a: any) => (a.amount || 0) > 0);

  // Initialize first asset on load
  useEffect(() => {
    if (availableAssets.length > 0 && !sellData.asset) {
      setSellData((prev) => ({
        ...prev,
        asset: availableAssets[0].symbol,
      }));
    }
  }, [availableAssets, sellData.asset]);

  // Fetch real-time prices - ONLY when modal is open
  useEffect(() => {
    if (!isOpen || availableAssets.length === 0) return;

    const fetchPrices = async () => {
      try {
        const symbols = availableAssets.map((a: any) => a.symbol).join(",");
        const response = await fetch(`/api/crypto/prices?symbols=${symbols}`);
        const data = await response.json();
        const priceMap: Record<string, { price: number }> = {};
        if (data.prices && Array.isArray(data.prices)) {
          data.prices.forEach((priceData: any) => {
            priceMap[priceData.symbol] = { price: priceData.price };
          });
        }
        setAssetPrices(priceMap);
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000); // Update every 5 seconds (only while modal open)

    return () => clearInterval(interval);
  }, [availableAssets, isOpen]);

  // Get current asset data
  const currentAsset = availableAssets.find(
    (a: any) => a.symbol === sellData.asset
  );
  const currentPrice = assetPrices[sellData.asset]?.price || 0;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep("form");
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getAmountToSell = () => {
    const amount = parseFloat(sellData.amount) || 0;
    return amount > 0 ? amount : currentAsset?.amount || 0;
  };

  const getEstimatedValue = () => {
    return getAmountToSell() * currentPrice;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!sellData.asset) {
      newErrors.asset = "Please select an asset to sell";
    }

    if (sellData.amount) {
      const amount = parseFloat(sellData.amount);
      if (amount <= 0) {
        newErrors.amount = "Please enter a valid amount";
      }

      if (amount > (currentAsset?.amount || 0)) {
        newErrors.amount = "Insufficient balance";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendNotificationEmail = async (
    title: string,
    message: string,
    amount: number,
    asset: string
  ) => {
    try {
      await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crypto_sale",
          title,
          message,
          amount,
          asset,
        }),
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  };

  const sendPushNotification = async (
    title: string,
    message: string,
    amount: number,
    asset: string
  ) => {
    try {
      await fetch("/api/notifications/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crypto_sale",
          title,
          message,
          amount,
          asset,
        }),
      });
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  };

  const handleSell = () => {
    if (validateForm()) {
      setStep("confirm");
    }
  };

  const confirmSell = async () => {
    try {
      const assetAmount = getAmountToSell();
      const usdValue = assetAmount * currentPrice;
      const fee = usdValue * 0.015;
      const netReceived = usdValue - fee;
      const netReceivedConverted = convertAmount(netReceived);

      // Create transaction in database
      const transactionResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sell",
          asset: sellData.asset,
          amount: assetAmount,
          value: usdValue,
          status: "completed",
          fee: fee,
          method: `${preferredCurrency} Balance`,
          description: `Sold ${assetAmount.toFixed(8)} ${
            sellData.asset
          } for ${preferredCurrency}`,
          rate: currentPrice,
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error("Failed to create transaction");
      }

      // Create transaction for UI
      const transaction = {
        id: `sell_${Date.now()}`,
        type: "sell" as const,
        asset: sellData.asset,
        amount: assetAmount,
        value: usdValue,
        timestamp: new Date().toLocaleString(),
        status: "completed" as const,
        fee: fee,
        method: `${preferredCurrency} Balance`,
        description: `Sold ${assetAmount.toFixed(8)} ${
          sellData.asset
        } for ${preferredCurrency}`,
        rate: currentPrice,
      };

      addTransaction(transaction);

      // Create notification
      const assetName =
        sellData.asset === "BTC"
          ? "Bitcoin"
          : sellData.asset === "ETH"
          ? "Ethereum"
          : sellData.asset === "XRP"
          ? "Ripple"
          : sellData.asset === "LTC"
          ? "Litecoin"
          : sellData.asset === "BCH"
          ? "Bitcoin Cash"
          : sellData.asset === "ETC"
          ? "Ethereum Classic"
          : sellData.asset === "TRX"
          ? "Tron"
          : sellData.asset === "TON"
          ? "Toncoin"
          : sellData.asset === "USDC"
          ? "USD Coin"
          : sellData.asset === "USDT"
          ? "Tether"
          : sellData.asset;
      const notificationTitle = `You've sold ${assetName}`;
      const notificationMessage = `Successfully sold ${assetAmount.toFixed(
        8
      )} ${
        sellData.asset
      } for ${preferredCurrency} ${netReceivedConverted.toFixed(2)}`;

      addNotification({
        type: "transaction",
        title: notificationTitle,
        message: notificationMessage,
        amount: usdValue,
        asset: sellData.asset,
      });

      // Send email notification
      sendNotificationEmail(
        notificationTitle,
        notificationMessage,
        usdValue,
        sellData.asset
      );

      // Send push notification
      sendPushNotification(
        notificationTitle,
        notificationMessage,
        usdValue,
        sellData.asset
      );

      // Show success step
      setSuccessData({
        asset: sellData.asset,
        amount: assetAmount,
        value: usdValue,
      });
      setStep("success");
    } catch (error) {
      console.error("Error processing sell order:", error);
      setStep("form");
    }
  };

  const handleDone = () => {
    // Reset form
    setSellData({
      asset: "",
      amount: "",
    });
    setErrors({});
    setStep("form");

    // Close modal and refresh
    onClose();
    refetch();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="sell-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
              style={{ touchAction: "none" }}
            />
            <motion.div
              key="sell-modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: "auto" }}
            >
              <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
                {step === "form" && (
                  <>
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
                          <h2 className="text-2xl font-bold text-white">
                            Sell Crypto
                          </h2>
                          <p className="text-gray-400">
                            Convert cryptocurrency to {preferredCurrency}
                          </p>
                        </div>
                      </div>

                      {errors.general && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                          <p className="text-red-400 text-sm">
                            {errors.general}
                          </p>
                        </div>
                      )}

                      <div className="space-y-6">
                        {/* Asset Selection - Web UI Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Select Asset to Sell
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {availableAssets.length === 0 ? (
                              <div className="text-center py-6">
                                <p className="text-gray-400">
                                  No assets to sell
                                </p>
                              </div>
                            ) : (
                              availableAssets.map((asset: any) => (
                                <button
                                  key={asset.symbol}
                                  onClick={() =>
                                    setSellData((prev) => ({
                                      ...prev,
                                      asset: asset.symbol,
                                    }))
                                  }
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    sellData.asset === asset.symbol
                                      ? "bg-orange-500/20 border border-orange-500/50"
                                      : "bg-gray-800/50 border border-gray-700/50 hover:border-gray-600"
                                  }`}
                                >
                                  <CryptoIcon symbol={asset.symbol} size="sm" />
                                  <div className="flex-1 text-left">
                                    <div className="text-white font-medium">
                                      {asset.symbol}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                      {(asset.amount || 0).toFixed(8)} available
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white font-medium">
                                      {preferredCurrency === "USD"
                                        ? "$"
                                        : preferredCurrency === "EUR"
                                        ? "€"
                                        : preferredCurrency === "GBP"
                                        ? "£"
                                        : preferredCurrency}
                                      {(
                                        convertAmount(
                                          (asset.amount || 0) *
                                            (assetPrices[asset.symbol]?.price ||
                                              0)
                                        ) || 0
                                      ).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                          {errors.asset && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors.asset}
                            </p>
                          )}
                        </div>

                        {currentAsset && (
                          <>
                            {/* Current Price - Real-time */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">
                                  Current Price:
                                </span>
                                <span className="text-white font-medium">
                                  {preferredCurrency === "USD"
                                    ? "$"
                                    : preferredCurrency === "EUR"
                                    ? "€"
                                    : preferredCurrency === "GBP"
                                    ? "£"
                                    : preferredCurrency}
                                  {convertAmount(currentPrice).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Amount to Sell */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Amount to Sell ({sellData.asset})
                              </label>
                              <input
                                type="number"
                                step="0.00000001"
                                max={currentAsset.amount}
                                value={sellData.amount}
                                onChange={(e) =>
                                  setSellData((prev) => ({
                                    ...prev,
                                    amount: e.target.value,
                                  }))
                                }
                                className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder={`Max: ${(
                                  currentAsset.amount || 0
                                ).toFixed(8)}`}
                              />
                              {errors.amount && (
                                <p className="text-red-400 text-sm mt-1">
                                  {errors.amount}
                                </p>
                              )}
                              <button
                                onClick={() =>
                                  setSellData((prev) => ({
                                    ...prev,
                                    amount: currentAsset.amount.toString(),
                                  }))
                                }
                                className="text-blue-400 hover:text-blue-300 text-xs font-medium mt-2"
                              >
                                Sell All
                              </button>
                            </div>

                            {/* Fee Information */}
                            {getAmountToSell() > 0 && (
                              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">
                                    Gross Value:
                                  </span>
                                  <span className="text-white">
                                    {preferredCurrency === "USD"
                                      ? "$"
                                      : preferredCurrency === "EUR"
                                      ? "€"
                                      : preferredCurrency === "GBP"
                                      ? "£"
                                      : preferredCurrency}
                                    {convertAmount(
                                      getEstimatedValue()
                                    ).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">
                                    Fee (1.5%):
                                  </span>
                                  <span className="text-white">
                                    {preferredCurrency === "USD"
                                      ? "$"
                                      : preferredCurrency === "EUR"
                                      ? "€"
                                      : preferredCurrency === "GBP"
                                      ? "£"
                                      : preferredCurrency}
                                    {convertAmount(
                                      getEstimatedValue() * 0.015
                                    ).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <hr className="border-gray-600" />
                                <div className="flex justify-between items-center font-medium">
                                  <span className="text-gray-300">
                                    You will receive:
                                  </span>
                                  <span className="text-white">
                                    {preferredCurrency === "USD"
                                      ? "$"
                                      : preferredCurrency === "EUR"
                                      ? "€"
                                      : preferredCurrency === "GBP"
                                      ? "£"
                                      : preferredCurrency}
                                    {convertAmount(
                                      getEstimatedValue() * 0.985
                                    ).toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}

                            <button
                              onClick={handleSell}
                              disabled={getAmountToSell() <= 0}
                              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
                            >
                              Sell Now
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {step === "confirm" && (
                  <>
                    <button
                      onClick={() => setStep("form")}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                      aria-label="Back to form"
                      title="Back"
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
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Confirm Sale
                          </h2>
                          <p className="text-gray-400">
                            Review your transaction
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-6 mb-6 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400 text-sm mb-2">
                          You&apos;re selling
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">
                          {getAmountToSell().toFixed(8)}
                        </div>
                        <div className="text-xl text-red-400">
                          {sellData.asset}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Price per {sellData.asset}:
                            </span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {convertAmount(currentPrice).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Value:</span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {convertAmount(
                                getEstimatedValue()
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Fee (1.5%):</span>
                            <span className="text-white font-medium">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {convertAmount(
                                getEstimatedValue() * 0.015
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <hr className="border-gray-600" />
                          <div className="flex justify-between items-center font-medium pt-2">
                            <span className="text-gray-300 text-lg">
                              You will receive:
                            </span>
                            <span className="text-red-400 font-bold text-xl">
                              {preferredCurrency === "USD"
                                ? "$"
                                : preferredCurrency === "EUR"
                                ? "€"
                                : preferredCurrency === "GBP"
                                ? "£"
                                : preferredCurrency}
                              {convertAmount(
                                getEstimatedValue() * 0.985
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setStep("form")}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmSell}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                          >
                            Confirm Sale
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === "success" && successData && (
                  <>
                    <div className="p-8">
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check size={40} className="text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Sale Successful!
                        </h2>
                        <p className="text-gray-400">
                          Your crypto has been sold
                        </p>
                      </div>

                      <div className="space-y-3 bg-gray-800/50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Asset Sold:</span>
                          <span className="text-white font-medium">
                            {successData.asset}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white font-medium">
                            {successData.amount.toFixed(8)} {successData.asset}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">You Received:</span>
                          <span className="text-red-400 font-bold">
                            {preferredCurrency === "USD"
                              ? "$"
                              : preferredCurrency === "EUR"
                              ? "€"
                              : preferredCurrency === "GBP"
                              ? "£"
                              : preferredCurrency}
                            {convertAmount(successData.value * 0.985).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleDone}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
