"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import VerifyEmailModal from "./VerifyEmailModal";
import CountrySelector from "./CountrySelector";

interface EmailSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onSwitchToLogin: () => void;
}

export default function EmailSignupModal({
  isOpen,
  onClose,
  onGoBack,
  onSwitchToLogin,
}: EmailSignupModalProps) {
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("INVESTOR");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          accountType,
          country,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show verification modal
        setRegisteredEmail(email.toLowerCase().trim());
        setShowVerification(true);
      } else {
        setError(data.message || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    onClose();
    // Show success message and redirect to login
    onSwitchToLogin();
  };

  const handleCloseVerification = () => {
    setShowVerification(false);
    // User can stay on signup form
  };

  return (
    <>
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
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={onGoBack}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-orange-500/50 text-orange-500 hover:text-orange-400 transition-all duration-200 group text-sm"
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

                <div className="px-4 pb-8">
                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-8 whitespace-nowrap">
                    Create an account with email
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {error}
                      </div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
                        required
                      />
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Registering As
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="accountType"
                            value="INVESTOR"
                            checked={accountType === "INVESTOR"}
                            onChange={(e) => setAccountType(e.target.value)}
                            className="text-orange-500 focus:ring-orange-500 focus:outline-none"
                          />
                          <span className="text-white">Investor</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                          <input
                            type="radio"
                            name="accountType"
                            value="TRADER"
                            checked={accountType === "TRADER"}
                            onChange={(e) => setAccountType(e.target.value)}
                            className="text-orange-500 focus:ring-orange-500 focus:outline-none"
                          />
                          <span className="text-white">Trader</span>
                        </label>
                      </div>
                    </div>

                    {/* Country of residence */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Country of residence
                      </label>
                      <CountrySelector value={country} onChange={setCountry} />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-orange-500 transition-colors"
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
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
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <path d="M1 1l22 22" />
                            </svg>
                          ) : (
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
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Create account button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-b from-orange-600 to-orange-800 shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(80,20,3,1),0_10px_8px_-2px_rgba(0,0,0,0.5),0_15px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(251,146,60,0.8),0_10px_8px_-2px_rgba(251,146,60,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(251,146,60,0.5)] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all"
                    >
                      {isLoading ? "Creating account..." : "Create an account"}
                    </button>

                    {/* Already have account */}
                    <div className="text-center text-sm">
                      <span className="text-gray-400">
                        Already have an account?{" "}
                      </span>
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        Log in
                      </button>
                    </div>
                  </form>

                  {/* Terms text */}
                  <div className="mt-6 text-xs text-gray-500 text-center">
                    By creating an account, you agree to and accept our{" "}
                    <a 
                      href="/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 underline cursor-pointer hover:text-white transition-colors"
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a 
                      href="/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 underline cursor-pointer hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <VerifyEmailModal
        isOpen={showVerification}
        email={registeredEmail}
        onVerified={handleVerificationComplete}
        onClose={handleCloseVerification}
      />
    </>
  );
}
