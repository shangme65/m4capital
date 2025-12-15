"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import ReactDOM from "react-dom";
import { useEffect, useState } from "react";

/**
 * Intercepted Deposit Modal
 *
 * This modal intercepts /deposit route when navigating from dashboard
 * but shows as full page when accessed directly.
 *
 * URL: /deposit (shows as modal when intercepted, full page when direct)
 */
export default function DepositModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-400 mb-6">
              Choose a deposit method to add funds to your account.
            </p>

            <div className="space-y-3">
              {/* Crypto Deposit */}
              <button
                onClick={() => {
                  handleClose();
                  // Open crypto deposit modal
                  window.dispatchEvent(
                    new CustomEvent("openDepositModal", { detail: "crypto" })
                  );
                }}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">₿</span>
                </div>
                <div>
                  <p className="font-medium text-white">Cryptocurrency</p>
                  <p className="text-sm text-gray-400">
                    Bitcoin, Ethereum, USDT, and more
                  </p>
                </div>
              </button>

              {/* Bank Transfer */}
              <button
                onClick={() => {
                  handleClose();
                  window.dispatchEvent(
                    new CustomEvent("openDepositModal", { detail: "bank" })
                  );
                }}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏦</span>
                </div>
                <div>
                  <p className="font-medium text-white">Bank Transfer</p>
                  <p className="text-sm text-gray-400">
                    Wire transfer or local bank
                  </p>
                </div>
              </button>

              {/* PIX (Brazil) */}
              <button
                onClick={() => {
                  handleClose();
                  window.dispatchEvent(
                    new CustomEvent("openDepositModal", { detail: "pix" })
                  );
                }}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <p className="font-medium text-white">PIX</p>
                  <p className="text-sm text-gray-400">
                    Instant payment for Brazil
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
