"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePortfolio } from "@/lib/usePortfolio";
import SuccessModal from "@/components/client/SuccessModal";
import CryptoDropdown from "@/components/client/CryptoDropdown";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConvertModal({ isOpen, onClose }: ConvertModalProps) {
  const [convertData, setConvertData] = useState({
    fromAsset: "BTC",
    toAsset: "ETH",
    amount: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    asset: string;
    amount: number;
    value: number;
    toAsset: string;
    toAmount: number;
  } | null>(null);
  const { portfolio } = usePortfolio();
  const [exchangeRates] = useState({
    BTC: { ETH: 26, ADA: 185714, SOL: 433 },
    ETH: { BTC: 0.038, ADA: 7143, SOL: 16.7 },
    ADA: { BTC: 0.0000054, ETH: 0.00014, SOL: 0.0023 },
    SOL: { BTC: 0.0023, ETH: 0.06, ADA: 429 },
  });
  const [conversionFee] = useState(0.5); // 0.5% fee
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

  const getConversionRate = () => {
    if (convertData.fromAsset === convertData.toAsset) return 1;

    type AssetKey = keyof typeof exchangeRates;
    const fromAsset = convertData.fromAsset as AssetKey;
    const toAsset = convertData.toAsset as AssetKey;

    const fromRates = exchangeRates[fromAsset];
    if (fromRates && toAsset in fromRates) {
      return fromRates[toAsset as keyof typeof fromRates];
    }

    return 0;
  };

  const getEstimatedReceiveAmount = () => {
    if (!convertData.amount) return 0;
    const amount = parseFloat(convertData.amount);
    const rate = getConversionRate();
    const gross = amount * rate;
    const fee = gross * (conversionFee / 100);
    return gross - fee;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!convertData.amount || parseFloat(convertData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (
      parseFloat(convertData.amount) >
      availableBalances[convertData.fromAsset as keyof typeof availableBalances]
    ) {
      newErrors.amount = "Insufficient balance";
    }

    if (convertData.fromAsset === convertData.toAsset) {
      newErrors.general = "Please select different assets to convert";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSwapAssets = () => {
    setConvertData((prev) => ({
      ...prev,
      fromAsset: prev.toAsset,
      toAsset: prev.fromAsset,
      amount: "",
    }));
    setErrors({});
  };

  const handleConvert = () => {
    if (validateForm()) {
      try {
        const amount = parseFloat(convertData.amount);
        const rate = getConversionRate();
        const receiveAmount = getEstimatedReceiveAmount();
        const feeAmount = amount * rate * (conversionFee / 100);

        // Create transaction
        const transaction = {
          id: `convert_${Date.now()}`,
          type: "convert" as const,
          asset: `${convertData.fromAsset} → ${convertData.toAsset}`,
          amount: amount,
          value:
            amount *
            (convertData.fromAsset === "BTC"
              ? 65000
              : convertData.fromAsset === "ETH"
              ? 2500
              : 0.5),
          timestamp: new Date().toLocaleString(),
          status: "completed" as const,
          fee: feeAmount,
          method: "Instant Convert",
          description: `Convert ${amount} ${
            convertData.fromAsset
          } to ${receiveAmount.toFixed(8)} ${convertData.toAsset}`,
          fromAsset: convertData.fromAsset,
          toAsset: convertData.toAsset,
          rate: rate,
        };

        addTransaction(transaction);

        // Create notification
        addNotification({
          type: "transaction",
          title: "Conversion Completed",
          message: `Successfully converted ${amount} ${
            convertData.fromAsset
          } to ${receiveAmount.toFixed(8)} ${convertData.toAsset}`,
        });

        // Show success modal
        setSuccessData({
          asset: convertData.fromAsset,
          amount: amount,
          value:
            amount *
            (convertData.fromAsset === "BTC"
              ? 65000
              : convertData.fromAsset === "ETH"
              ? 2500
              : 0.5),
          toAsset: convertData.toAsset,
          toAmount: receiveAmount,
        });
        setShowSuccessModal(true);

        // Reset form
        setConvertData({
          fromAsset: "BTC",
          toAsset: "ETH",
          amount: "",
        });
        setErrors({});
        onClose();
      } catch (error) {
        console.error("Error processing conversion:", error);
      }
    }
  };

  if (!isOpen) return null;

  const assets = [
    "BTC",
    "ETH",
    "XRP",
    "TRX",
    "TON",
    "LTC",
    "BCH",
    "ETC",
    "USDC",
    "USDT",
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="convert-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 overflow-hidden"
              style={{ touchAction: "none" }}
            />
            <motion.div
              key="convert-modal-content"
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
                  aria-label="Close convert modal"
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
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
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
                        Convert Crypto
                      </h2>
                      <p className="text-gray-400">
                        Exchange one cryptocurrency for another
                      </p>
                    </div>
                  </div>

                  {errors.general && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                      <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* From Asset */}
                    <div>
                      <CryptoDropdown
                        label="From"
                        value={convertData.fromAsset}
                        onChange={(value) =>
                          setConvertData((prev) => ({ ...prev, fromAsset: value }))
                        }
                        options={assets.map((asset) => ({
                          symbol: asset,
                          name:
                            asset === "BTC" ? "Bitcoin (BTC)" :
                            asset === "ETH" ? "Ethereum (ETH)" :
                            asset === "XRP" ? "Ripple (XRP)" :
                            asset === "TRX" ? "Tron (TRX)" :
                            asset === "TON" ? "Toncoin (TON)" :
                            asset === "LTC" ? "Litecoin (LTC)" :
                            asset === "BCH" ? "Bitcoin Cash (BCH)" :
                            asset === "ETC" ? "Ethereum Classic (ETC)" :
                            asset === "USDC" ? "USD Coin (USDC)" :
                            "Tether (USDT)"
                        }))}
                      />
                      <div className="mt-2 text-sm text-gray-400">
                        Available:{" "}
                        {
                          availableBalances[
                            convertData.fromAsset as keyof typeof availableBalances
                          ]
                        }{" "}
                        {convertData.fromAsset}
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
                          value={convertData.amount}
                          onChange={(e) =>
                            setConvertData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-16 text-white focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          {convertData.fromAsset}
                        </span>
                      </div>
                      {errors.amount && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.amount}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          setConvertData((prev) => ({
                            ...prev,
                            amount:
                              availableBalances[
                                convertData.fromAsset as keyof typeof availableBalances
                              ].toString(),
                          }))
                        }
                        className="text-orange-400 text-sm mt-2 hover:text-orange-300 transition-colors"
                      >
                        Use Max
                      </button>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleSwapAssets}
                        className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Swap assets"
                        title="Swap assets"
                      >
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
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* To Asset */}
                    <div>
                      <CryptoDropdown
                        label="To"
                        value={convertData.toAsset}
                        onChange={(value) =>
                          setConvertData((prev) => ({ ...prev, toAsset: value }))
                        }
                        options={assets.map((asset) => ({
                          symbol: asset,
                          name:
                            asset === "BTC" ? "Bitcoin (BTC)" :
                            asset === "ETH" ? "Ethereum (ETH)" :
                            asset === "XRP" ? "Ripple (XRP)" :
                            asset === "TRX" ? "Tron (TRX)" :
                            asset === "TON" ? "Toncoin (TON)" :
                            asset === "LTC" ? "Litecoin (LTC)" :
                            asset === "BCH" ? "Bitcoin Cash (BCH)" :
                            asset === "ETC" ? "Ethereum Classic (ETC)" :
                            asset === "USDC" ? "USD Coin (USDC)" :
                            "Tether (USDT)"
                        }))}
                      />
                    </div>

                    {/* Exchange Rate */}
                    {convertData.fromAsset !== convertData.toAsset && (
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Exchange Rate:</span>
                          <span className="text-white font-medium">
                            1 {convertData.fromAsset} ={" "}
                            {getConversionRate().toLocaleString()}{" "}
                            {convertData.toAsset}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Conversion Summary */}
                    {convertData.amount &&
                      convertData.fromAsset !== convertData.toAsset && (
                        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                          <h3 className="text-white font-medium">
                            Conversion Summary
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">You pay:</span>
                              <span className="text-white">
                                {convertData.amount} {convertData.fromAsset}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Gross amount:
                              </span>
                              <span className="text-white">
                                {(
                                  parseFloat(convertData.amount) *
                                  getConversionRate()
                                ).toFixed(8)}{" "}
                                {convertData.toAsset}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Fee ({conversionFee}%):
                              </span>
                              <span className="text-white">
                                {(
                                  parseFloat(convertData.amount) *
                                  getConversionRate() *
                                  (conversionFee / 100)
                                ).toFixed(8)}{" "}
                                {convertData.toAsset}
                              </span>
                            </div>
                            <hr className="border-gray-600" />
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-300">
                                You receive:
                              </span>
                              <span className="text-white">
                                {getEstimatedReceiveAmount().toFixed(8)}{" "}
                                {convertData.toAsset}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    <button
                      onClick={handleConvert}
                      disabled={
                        !convertData.amount ||
                        convertData.fromAsset === convertData.toAsset
                      }
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Convert Now
                    </button>

                    {/* Info Notice */}
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex">
                        <svg
                          className="w-5 h-5 text-purple-400 mt-0.5 mr-3"
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
                          <p className="text-purple-400 text-sm font-medium">
                            Instant Conversion
                          </p>
                          <p className="text-purple-300 text-sm mt-1">
                            Conversions are processed instantly at current
                            market rates with a {conversionFee}% fee.
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
          type="swap"
          asset={successData?.asset || "BTC"}
          amount={successData?.amount.toString() || "0"}
          value={successData?.value.toString() || "0"}
          toAsset={successData?.toAsset}
          toAmount={successData?.toAmount?.toString()}
        />
      )}
    </>
  );
}
