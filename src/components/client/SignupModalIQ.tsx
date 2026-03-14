"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

interface SignupModalIQProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithEmail: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModalIQ({
  isOpen,
  onClose,
  onProceedWithEmail,
  onSwitchToLogin,
}: SignupModalIQProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    setMounted(true);
  }, []);

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

              <div className="px-4 pt-12 pb-8">
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src={isDark ? "/m4capitallogo1.png" : "/M4LightLogo.png"}
                    alt="Capital Logo"
                    width={120}
                    height={40}
                  />
                </div>

                {/* Subtitle */}
                <div className={`text-sm mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>
                  Get started now
                </div>

                {/* Title */}
                <h2 className={`text-3xl sm:text-4xl font-bold mb-8 whitespace-nowrap ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  Create an account
                </h2>

                {/* Continue with section */}
                <div className="space-y-6">
                  <div>
                    <div className={`text-sm mb-4 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      Continue with
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        className={`py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 group hover:scale-105 active:scale-95 transform bounce-5s ${
                          isDark
                            ? "bg-[#2a2a2a] hover:bg-[#333] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
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
                        <span className={`transition-all duration-300 group-hover:font-semibold group-hover:translate-x-1 ${
                          isDark ? "group-hover:text-gray-200" : "group-hover:text-black"
                        }`}>
                          Google
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 group hover:scale-105 active:scale-95 transform bounce-5s ${
                          isDark
                            ? "bg-[#2a2a2a] hover:bg-[#333] text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
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
                        <span className={`transition-all duration-300 group-hover:font-semibold group-hover:translate-x-1 ${
                          isDark ? "group-hover:text-gray-200" : "group-hover:text-black"
                        }`}>
                          Facebook
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${
                        isDark ? "border-gray-700" : "border-gray-300"
                      }`}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className={`px-4 ${
                        isDark ? "bg-[#1f1f1f] text-gray-400" : "bg-white text-gray-600"
                      }`}>
                        or
                      </span>
                    </div>
                  </div>

                  {/* Proceed with email button */}
                  <button
                    onClick={onProceedWithEmail}
                    className="w-full bg-gradient-to-b from-orange-600 to-orange-800 shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(80,20,3,1),0_10px_8px_-2px_rgba(0,0,0,0.5),0_15px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_-2px_4px_0_rgba(0,0,0,0.2),0_8px_0_0_rgba(251,146,60,0.8),0_10px_8px_-2px_rgba(251,146,60,0.6),0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_50px_rgba(251,146,60,0.5)] hover:translate-y-[2px] text-white py-2 px-4 rounded-lg font-semibold transition-all"
                  >
                    Proceed with email
                  </button>

                  {/* Already have account */}
                  <div className="text-center text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Already have an account?{" "}
                    </span>
                    <button
                      onClick={onSwitchToLogin}
                      className="text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      Log in
                    </button>
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
