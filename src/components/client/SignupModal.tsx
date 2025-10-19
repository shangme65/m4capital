"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const router = useRouter();

  const handleEmailSignup = () => {
    router.push("/signup");
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth
    console.log("Google signup clicked");
  };

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookSignup = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn("facebook", { redirect: false });
      if (result?.error) {
        if (result.error.includes("already exists")) {
          setError("An account with this Facebook profile already exists. Please log in instead.");
        } else {
          setError("Facebook signup failed. Please try again.");
        }
      } else if (result?.ok) {
        onClose();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during Facebook signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
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
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50"
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
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
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
              <div className="px-8 pt-8 pb-6">
                <div className="text-sm text-gray-400 mb-4">
                  Get started now
                </div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Create an account
                </h2>

                {/* Social login section */}
                <div className="mb-6">
                  <div className="text-gray-400 mb-4">Continue with</div>
                  <div className="space-y-3">
                    {/* Google button */}
                    <button
                      onClick={handleGoogleSignup}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    {/* Facebook button */}
                    <button
                      onClick={handleFacebookSignup}
                      disabled={isLoading}
                      className={`w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-3 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="#1877F2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>{isLoading ? "Signing up..." : "Facebook"}</span>
                {error && (
                  <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                )}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-900 px-4 text-gray-400">or</span>
                  </div>
                </div>

                {/* Email signup button */}
                <button
                  onClick={handleEmailSignup}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                >
                  Proceed with email
                </button>

                {/* Login link */}
                <div className="text-center mt-6">
                  <span className="text-gray-400">
                    Already have an account?{" "}
                  </span>
                  <button
                    onClick={handleLogin}
                    className="text-orange-500 hover:text-orange-400 font-medium"
                  >
                    Log in
                  </button>
                </div>
              </div>

              {/* McLaren Partnership Ad */}
              <div className="relative">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-black bg-opacity-20 px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-bold">
                          OFFICIAL RACING PARTNER
                        </span>
                      </div>
                    </div>
                    <div className="text-white">
                      <svg
                        className="w-8 h-8"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                      </svg>
                    </div>
                  </div>

                  {/* McLaren branding area */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-white">
                      <div className="text-lg font-bold">McLaren</div>
                      <div className="text-xs opacity-80">
                        Racing Partnership
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-20 px-3 py-1 rounded">
                      <span className="text-white text-sm font-bold">95</span>
                    </div>
                  </div>

                  {/* Racing car silhouette */}
                  <div className="absolute bottom-0 right-0 opacity-30">
                    <svg
                      className="w-32 h-16"
                      viewBox="0 0 200 80"
                      fill="currentColor"
                    >
                      <path
                        d="M10 40h20l10-10h30l20 10h100l10 10v10l-10 10H90l-20-10H40l-10 10H10V40z"
                        className="text-white"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
