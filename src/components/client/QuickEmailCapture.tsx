"use client";

import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function QuickEmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Send to API
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-[19.75rem] left-1/2 -translate-x-1/2 z-[7] w-full max-w-md px-4 hidden md:block"
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 pr-3">
            <Mail className="w-5 h-5 text-white/60 ml-3" />
            <input
              type="email"
              placeholder="Get market alerts..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
              required
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-2 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-green-500/20 backdrop-blur-md border border-green-500/40 rounded-full px-6 py-3 text-center"
        >
          <p className="text-green-400 text-sm font-semibold">✓ Subscribed! Check your email.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
