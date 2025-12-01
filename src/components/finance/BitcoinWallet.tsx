"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin,
  Copy,
  CheckCircle,
  Upload,
  ArrowDown,
  ArrowUp,
  Wallet,
} from "lucide-react";

interface BitcoinDeposit {
  id: string;
  amount: number;
  txHash: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export default function BitcoinWallet() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0); // Start with 0, updated from real deposits
  const [copied, setCopied] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [deposits, setDeposits] = useState<BitcoinDeposit[]>([]);
  // No demo deposits - will be populated from actual transactions

  useEffect(() => {
    // TODO: REPLACE WITH REAL WALLET SERVICE INTEGRATION
    // This mock address needs to be replaced with:
    // - Real Bitcoin address generation from wallet service
    // - Integration with NowPayments or similar crypto payment gateway
    // - Proper wallet management and security
    // - NEVER use this hardcoded address in production
    setWalletAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address");
    }
  };

  // UUID fallback for browsers that don't support crypto.randomUUID
  const generateUUID = (): string => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const handleDeposit = async (amount: number) => {
    // In production, this would integrate with a real Bitcoin payment processor
    const newDeposit: BitcoinDeposit = {
      id: generateUUID(),
      amount,
      txHash: "", // Will be populated by real payment processor
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setDeposits((prev) => [newDeposit, ...prev]);
    setShowDepositModal(false);

    // TODO: Replace with real NowPayments integration
    // Simulate confirmation after 3 seconds
    setTimeout(() => {
      setDeposits((prev) =>
        prev.map((d) =>
          d.id === newDeposit.id ? { ...d, status: "COMPLETED" as const } : d
        )
      );
      setBalance((prev) => prev + amount);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      {/* Bitcoin Balance Card */}
      <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bitcoin className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-bold text-white">Bitcoin Wallet</h3>
          </div>
          <div className="text-sm text-orange-300">BTC</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-white">
              {balance.toFixed(8)} BTC
            </p>
            <p className="text-sm text-orange-300">
              ≈ ${(balance * 65000).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <ArrowUp className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Your Bitcoin Address</h4>
        <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg">
          <div className="flex-1 font-mono text-sm text-gray-300 break-all">
            {walletAddress}
          </div>
          <button
            onClick={copyAddress}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Send Bitcoin to this address to deposit funds into your account
        </p>
      </div>

      {/* Recent Deposits */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Recent Deposits</h4>
        <div className="space-y-2">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    deposit.status === "COMPLETED"
                      ? "bg-green-400"
                      : deposit.status === "PENDING"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                />
                <div>
                  <p className="text-white font-medium">{deposit.amount} BTC</p>
                  <p className="text-xs text-gray-400">{deposit.txHash}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    deposit.status === "COMPLETED"
                      ? "text-green-400"
                      : deposit.status === "PENDING"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {deposit.status}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(deposit.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Deposit Bitcoin
            </h3>
            <p className="text-gray-300 mb-6">
              Choose an amount to deposit (demo only):
            </p>

            <div className="space-y-3 mb-6">
              {[0.01, 0.05, 0.1, 0.25].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleDeposit(amount)}
                  className="w-full p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-colors"
                >
                  Deposit {amount} BTC (≈ ${(amount * 65000).toLocaleString()})
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
