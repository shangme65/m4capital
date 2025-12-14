"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import CryptoWallet from "./CryptoWallet";
import { useCurrency } from "@/contexts/CurrencyContext";

interface PendingDeposit {
  id: string;
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  paymentId: string;
  paymentAddress: string;
  paymentAmount: number;
  invoiceUrl?: string;
  expiresAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PendingDepositsWidget() {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<PendingDeposit | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    fetchPendingDeposits();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingDeposits, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      const response = await fetch("/api/deposits/pending");
      const data = await response.json();
      if (data.success) {
        setPendingDeposits(data.data.deposits);
      }
    } catch (error) {
      console.error("Failed to fetch pending deposits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPayment = (deposit: PendingDeposit) => {
    setSelectedDeposit(deposit);
    setShowPaymentModal(true);
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    setSelectedDeposit(null);
    // Refresh deposits when closing
    fetchPendingDeposits();
  };

  if (isLoading) {
    return (
      <div
        className="rounded-2xl p-4 animate-pulse"
        style={{
          background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (pendingDeposits.length === 0) {
    return null; // Don't show widget if no pending deposits
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
          boxShadow:
            "0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            <h3 className="text-sm font-semibold text-white">
              Pending Deposits
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            {pendingDeposits.length} payment
            {pendingDeposits.length !== 1 ? "s" : ""} awaiting
          </span>
        </div>

        <div className="space-y-2">
          {pendingDeposits.map((deposit) => {
            const timeElapsed = Math.floor(
              (Date.now() - new Date(deposit.createdAt).getTime()) / 1000 / 60
            );

            return (
              <motion.button
                key={deposit.id}
                onClick={() => handleViewPayment(deposit)}
                className="w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(145deg, #334155 0%, #1e293b 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(145deg, #f7931a 0%, #c77800 100%)",
                      }}
                    >
                      <CryptoIcon symbol={deposit.cryptoCurrency} size="md" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {deposit.cryptoCurrency} Deposit
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatAmount(deposit.amount, 2)} • {timeElapsed}m ago
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-orange-400">
                      Awaiting Payment
                    </div>
                    <div className="text-xs text-gray-500">
                      {deposit.cryptoAmount || deposit.paymentAmount}{" "}
                      {deposit.cryptoCurrency}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Click any deposit to view payment details and QR code
          </p>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
            }}
            onClick={handleClosePayment}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{
                background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <CryptoWallet
                amount={selectedDeposit.amount.toString()}
                cryptoCurrency={selectedDeposit.cryptoCurrency.toLowerCase()}
                cryptoSymbol={selectedDeposit.cryptoCurrency}
                cryptoName={selectedDeposit.cryptoCurrency}
                onBack={handleClosePayment}
                onComplete={handleClosePayment}
                existingPayment={{
                  paymentAddress: selectedDeposit.paymentAddress,
                  paymentAmount:
                    selectedDeposit.paymentAmount ||
                    selectedDeposit.cryptoAmount,
                  depositId: selectedDeposit.id,
                  paymentId: selectedDeposit.paymentId,
                  invoiceUrl: selectedDeposit.invoiceUrl,
                  expiresAt: selectedDeposit.expiresAt,
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
