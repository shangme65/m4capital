"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VerifyEmailModalProps {
  isOpen: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
}

export default function VerifyEmailModal({
  isOpen,
  email,
  onVerified,
  onClose,
}: VerifyEmailModalProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last digit
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      setError("");
      inputRefs.current[5]?.focus();

      // Auto-verify after paste
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const fullCode = verificationCode || code.join("");

    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (data.success) {
        onVerified();
      } else {
        setError(data.error || "Invalid verification code");
        // Clear the code on error
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendSuccess(true);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();

        // Clear success message after 3 seconds
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Advanced 3D Card with depth shadows */}
            <div
              className="relative w-full max-w-md"
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Outer glow layer */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-3xl blur-lg opacity-40 dark:opacity-50 animate-pulse" />

              {/* Deep shadow layers for 3D effect */}
              <div className="absolute inset-0 bg-black/20 dark:bg-black/40 rounded-3xl translate-y-4 blur-xl" />
              <div className="absolute inset-0 bg-purple-900/20 dark:bg-purple-900/30 rounded-3xl translate-y-2 blur-md" />

              {/* Main card */}
              <div
                className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(139, 92, 246, 0.1),
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 10px 15px -3px rgba(0, 0, 0, 0.1),
                    0 20px 25px -5px rgba(139, 92, 246, 0.15),
                    0 25px 50px -12px rgba(59, 130, 246, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                {/* Gradient overlay at top */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent dark:from-purple-500/20 dark:via-blue-500/10 pointer-events-none" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

                {/* Header */}
                <div className="px-8 pt-8 pb-6 text-center relative">
                  {/* Icon with 3D effect */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-md opacity-50 scale-110" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {email}
                  </p>
                </div>

                {/* Code Input */}
                <div className="px-8 pb-8">
                  <div
                    className="flex justify-center gap-2 mb-6"
                    onPaste={handlePaste}
                  >
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all shadow-inner"
                        disabled={isLoading}
                        aria-label={`Verification code digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {resendSuccess && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm text-center">
                      Verification code sent! Check your email.
                    </div>
                  )}

                  {/* Verify Button - 3D style */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-200" />
                    <button
                      onClick={() => handleVerify()}
                      disabled={isLoading || code.join("").length !== 6}
                      className="relative w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify Email"
                      )}
                    </button>
                  </div>

                  {/* Resend Code */}
                  <div className="text-center text-sm mt-4">
                    <span className="text-gray-500 dark:text-gray-400">
                      Didn&apos;t receive the code?{" "}
                    </span>
                    <button
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? "Sending..." : "Resend"}
                    </button>
                  </div>

                  {/* Info */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                    The code expires in 15 minutes
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
