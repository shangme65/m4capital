"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onSwitchToSignup: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onGoBack,
  onSwitchToSignup,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(
          data.message ||
            "Password reset instructions have been sent to your email. Please check your inbox."
        );
        setIsSuccess(true);
      } else {
        setMessage(
          data.message || "Failed to send reset instructions. Please try again."
        );
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
              {/* Header with back button and close button */}
              <div className="flex items-center justify-between p-4 sticky top-0 bg-[#1f1f1f] z-10">
                <button
                  onClick={onGoBack}
                  className="text-orange-500 hover:text-orange-400 transition-colors flex items-center"
                >
                  ← Go back
                </button>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-600/30 hover:bg-gray-500/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                  title="Close"
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m18 6-12 12" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-8 pb-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/m4capitallogo1.png"
                    alt="Capital Logo"
                    width={96}
                    height={96}
                  />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-4">
                  Password recovery
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {message && (
                    <div
                      className={`text-sm text-center p-3 rounded-lg border ${
                        isSuccess
                          ? "text-green-500 bg-green-500/10 border-green-500/20"
                          : "text-red-500 bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  {/* Email field */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Continue button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    {isLoading ? "Sending..." : "Continue"}
                  </button>

                  {/* Don't have account */}
                  <div className="text-center text-sm">
                    <span className="text-gray-400">
                      Don't have an account?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={onSwitchToSignup}
                      className="text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
