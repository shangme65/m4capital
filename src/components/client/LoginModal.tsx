"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}: LoginModalProps) {
  const [email, setEmail] = useState("victorgratidao.vg@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: email.toLowerCase().trim(),
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      onClose();
      router.push("/dashboard");
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
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                ×
              </button>
              <div className="px-8 pt-12 pb-8">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/m4capitallogo2.png"
                    alt="Capital Logo"
                    width={32}
                    height={32}
                  />
                  <span className="ml-2 text-orange-500 font-medium text-xl">
                    Capital
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Happy to see you
                </div>
                <h2 className="text-3xl font-bold text-white mb-8">
                  Welcome back
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {error}
                    </div>
                  )}
                  <div>
                    <div className="text-gray-400 text-sm mb-4">
                      Log in with
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        className="bg-[#2a2a2a] hover:bg-[#333] text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-gray-700"
                      >
                        <span>Google</span>
                      </button>
                      <button
                        type="button"
                        className="bg-[#2a2a2a] hover:bg-[#333] text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-gray-700"
                      >
                        <span>Facebook</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-[#1f1f1f] px-4 text-gray-400">
                        or
                      </span>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="victorgratidao.vg@gmail.com"
                    className="w-full px-4 py-3 bg-transparent border border-orange-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </button>
                  <div className="flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSwitchToForgotPassword?.();
                      }}
                      className="text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSwitchToSignup?.();
                      }}
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
