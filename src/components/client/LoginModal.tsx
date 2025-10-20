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
  const [email, setEmail] = useState("");
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

  const handleFacebookLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn("facebook", { redirect: false });
      if (result?.error) {
        setError("Facebook login failed. Please try again.");
      } else if (result?.ok) {
        onClose();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during Facebook login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.ok) {
        onClose();
        router.push("/dashboard");
      } else {
        setError("Google login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during Google login.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="px-8 pt-12 pb-8">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/m4capitallogo1.png"
                    alt="Capital Logo"
                    width={96}
                    height={96}
                  />
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
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="bg-[#2a2a2a] hover:bg-[#333] disabled:bg-[#1a1a1a] disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 group hover:scale-105 active:scale-95 transform bounce-5s"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] bounce-5s-icon"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        <span className="transition-all duration-300 group-hover:text-gray-200 group-hover:font-semibold group-hover:translate-x-1">
                          Google
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFacebookLogin}
                        disabled={isLoading}
                        className="bg-[#2a2a2a] hover:bg-[#333] disabled:bg-[#1a1a1a] disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 group hover:scale-105 active:scale-95 transform bounce-5s"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="#1877F2"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transform transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] bounce-5s-icon"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="transition-all duration-300 group-hover:text-gray-200 group-hover:font-semibold group-hover:translate-x-1">
                          Facebook
                        </span>
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
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-orange-500 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
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
