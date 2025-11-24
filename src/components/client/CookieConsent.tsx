"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("m4capital-cookie-consent");
    if (!cookieConsent) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("m4capital-cookie-consent", "accepted");
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={acceptCookies}
          />

          {/* Cookie consent popup */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-2xl"
          >
            <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 p-6 sm:p-8">
              {/* Decorative gradient orbs */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/30 rounded-full blur-3xl"></div>

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-10 rounded-2xl"
                style={{
                  backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              ></div>

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Cookie icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="flex-shrink-0"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Cookie className="w-8 h-8 text-white" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    We Value Your{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                      Privacy
                    </span>
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    We use cookies to enhance your browsing experience, serve
                    personalized content, and analyze our traffic. By clicking
                    "OK", you consent to our use of cookies.
                  </p>
                  <a
                    href="/privacy"
                    className="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-2 transition-colors inline-block"
                  >
                    Learn more about our privacy policy
                  </a>
                </div>

                {/* OK Button */}
                <motion.button
                  onClick={acceptCookies}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group flex-shrink-0 w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <span className="text-lg">OK</span>
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    >
                      →
                    </motion.div>
                  </div>
                </motion.button>
              </div>

              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl border border-purple-500/50 pointer-events-none">
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(168, 85, 247, 0.3)",
                      "0 0 40px rgba(168, 85, 247, 0.5)",
                      "0 0 20px rgba(168, 85, 247, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
