"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
            <div className="bg-[#1f1f1f] rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden border border-gray-600/50 max-h-[90vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                ×
              </button>

              <div className="px-8 pt-12 pb-8">
                {/* Logo */}
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

                {/* Subtitle */}
                <div className="text-sm text-gray-400 mb-2">
                  Get started now
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-8">
                  Create an account
                </h2>

                {/* Continue with section */}
                <div className="space-y-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-4">
                      Continue with
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

                  {/* Divider */}
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

                  {/* Proceed with email button */}
                  <button
                    onClick={onProceedWithEmail}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Proceed with email
                  </button>

                  {/* Already have account */}
                  <div className="text-center text-sm">
                    <span className="text-gray-400">
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
