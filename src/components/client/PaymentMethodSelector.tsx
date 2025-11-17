"use client";

import { motion } from "framer-motion";
import { X, CreditCard, Wallet, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  asset: string;
  amount: number;
  usdValue: number;
  userBalance: number;
}

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  asset,
  amount,
  usdValue,
  userBalance,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: "usd-balance",
      name: "USD Balance",
      description: `Available: $${userBalance.toLocaleString()}`,
      icon: <Wallet className="w-6 h-6" />,
      enabled: userBalance >= usdValue,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard",
      icon: <CreditCard className="w-6 h-6" />,
      enabled: true,
    },
  ];

  const cryptoProviders = [
    {
      id: "moonpay",
      name: "MoonPay",
      fee: "0.0027 BTC",
      logo: "/providers/moonpay.png",
    },
    {
      id: "banxa",
      name: "Banxa",
      fee: "0.002624 BTC",
      logo: "/providers/banxa.png",
    },
    {
      id: "transak",
      name: "Transak",
      fee: "0.002594 BTC",
      logo: "/providers/transak.png",
    },
    {
      id: "alchemypay",
      name: "AlchemyPay",
      fee: "0.002522 BTC",
      logo: "/providers/alchemypay.png",
    },
    {
      id: "simplex",
      name: "Simplex",
      fee: "0.0026 BTC",
      logo: "/providers/simplex.png",
    },
    {
      id: "nowpayments",
      name: "NOWPayments",
      fee: "0.0025 BTC",
      logo: "/providers/nowpayments.png",
    },
  ];

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
            {selectedMethod && (
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setSelectedProvider(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-white flex-1 text-center">
              {selectedMethod === "card"
                ? "Select Provider"
                : selectedMethod === "usd-balance"
                ? "Confirm Purchase"
                : "Select Payment Method"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Purchase Summary */}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {!selectedMethod && (
            <div className="space-y-3">
              <h3 className="text-gray-400 text-sm font-medium mb-3">
                Payment method
              </h3>
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={!method.enabled}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    method.enabled
                      ? "border-gray-700 hover:border-purple-500 bg-gray-800 hover:bg-gray-750"
                      : "border-gray-800 bg-gray-900 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                        {method.icon}
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {method.name}
                        </div>
                        <div
                          className={`text-sm ${
                            method.enabled
                              ? method.id === "usd-balance" &&
                                userBalance < usdValue
                                ? "text-red-400"
                                : "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {method.description}
                        </div>
                      </div>
                    </div>
                    {method.enabled && (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedMethod === "card" && (
            <div className="space-y-3">
              <h3 className="text-gray-400 text-sm font-medium mb-3">
                Providers
              </h3>
              {cryptoProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedProvider === provider.id
                      ? "border-purple-500 bg-purple-900/20"
                      : "border-gray-700 hover:border-purple-500 bg-gray-800 hover:bg-gray-750"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-purple-600">
                          {provider.name[0]}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">
                          {provider.name}
                        </div>
                        <div className="text-sm text-green-400">
                          {provider.fee}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedProvider === provider.id
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedProvider === provider.id && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedMethod === "usd-balance" && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Confirm Purchase
                </h3>
                <p className="text-gray-400 mb-4">
                  ${usdValue.toLocaleString()} will be deducted from your USD
                  balance
                </p>
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Current Balance:</span>
                    <span className="text-white font-medium">
                      ${userBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Purchase Amount:</span>
                    <span className="text-red-400 font-medium">
                      -${usdValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Balance:</span>
                    <span className="text-green-400 font-bold">
                      ${(userBalance - usdValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        {selectedMethod && (
          <div className="p-6 border-t border-gray-800">
            <button
              onClick={() => {
                // Handle payment processing
                alert(
                  `Processing payment via ${
                    selectedMethod === "card"
                      ? selectedProvider
                      : selectedMethod
                  }`
                );
                onClose();
              }}
              disabled={selectedMethod === "card" && !selectedProvider}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all"
            >
              {selectedMethod === "card"
                ? selectedProvider
                  ? "Proceed to Payment"
                  : "Select a Provider"
                : "Confirm Purchase"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
