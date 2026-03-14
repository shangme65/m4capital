"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <div className={`rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden border max-h-[90vh] overflow-y-auto ${
              isDark
                ? "bg-[#1f1f1f] border-gray-600/50"
                : "bg-white border-gray-300"
            }`}>
              {/* Header with back button and close button */}
              <div className={`flex items-center justify-between p-4 sticky top-0 z-10 ${
                isDark ? "bg-[#1f1f1f]" : "bg-white"
              }`}>
                <button
                  onClick={onGoBack}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 group text-sm ${
                    isDark
                      ? "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 hover:border-orange-500/50 text-orange-500 hover:text-orange-400"
                      : "bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-orange-500 text-orange-600 hover:text-orange-500"
                  }`}
                >
                  <svg 
                    className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium">Go back</span>
                </button>
                <button
                  onClick={onClose}
                  className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isDark
                      ? "bg-gray-600/30 hover:bg-gray-500/50 text-gray-300 hover:text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900"
                  }`}
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

              <div className="px-4 pb-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src={isDark ? "/m4capitallogo1.png" : "/M4LightLogo.png"}
                    alt="Capital Logo"
                    width={120}
                    height={40}
                  />
                </div>

                {/* Title */}
                <h2 className={`text-3xl font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Password recovery
                </h2>

                {/* Description */}
                <p className={`text-sm mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
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
                    <label className={`block text-sm mb-2 ${
                      isDark ? "text-gray-400" : "text-gray-700"
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-orange-400 ${
                        isDark
                          ? "bg-[#2a2a2a] border-gray-600 text-white placeholder-gray-500"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                      }`}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Continue button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-b from-orange-600 to-orange-800 shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(80,20,3,1),0_10px_8px_-2px_rgba(0,0,0,0.5),0_15px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(251,146,60,0.8),0_10px_8px_-2px_rgba(251,146,60,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(251,146,60,0.5)] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-all"
                  >
                    {isLoading ? "Sending..." : "Continue"}
                  </button>

                  {/* Don't have account */}
                  <div className="text-center text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>
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
