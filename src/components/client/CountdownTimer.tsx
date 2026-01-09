"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target date to 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      className="absolute bottom-20 left-4 md:bottom-20 md:left-4 z-[7] bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md border border-orange-500/40 rounded-lg p-3 min-w-[260px] hidden lg:block"
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-orange-400" />
        <p className="text-white text-xs font-bold">Limited Time Offer</p>
      </div>
      <p className="text-white/80 text-xs mb-3 font-bold">50% Deposit Bonus Ends In:</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="bg-white/10 rounded px-2 py-1 mb-1">
              <p className="text-white text-lg font-bold">{item.value.toString().padStart(2, "0")}</p>
            </div>
            <p className="text-white/60 text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
