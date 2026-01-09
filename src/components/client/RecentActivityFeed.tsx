"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

const activities = [
  { user: "User_8472", action: "deposited", amount: "$1,250", type: "deposit" },
  { user: "Trader_1234", action: "bought", amount: "0.05 BTC", type: "buy" },
  { user: "Investor_9876", action: "sold", amount: "2.5 ETH", type: "sell" },
  { user: "User_5521", action: "deposited", amount: "$850", type: "deposit" },
  { user: "Pro_3309", action: "bought", amount: "10 BNB", type: "buy" },
  { user: "User_7788", action: "withdrew", amount: "$2,100", type: "withdraw" },
];

export default function RecentActivityFeed() {
  return (
    <div className="absolute bottom-32 left-4 z-[7] w-72 max-h-48 overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 hidden lg:block">
      <p className="text-white text-xs font-semibold mb-2">Recent Activity</p>
      <motion.div
        animate={{ y: [0, -300] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="space-y-2"
      >
        {[...activities, ...activities].map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5"
          >
            <div className="flex items-center gap-2">
              {activity.type === "buy" || activity.type === "deposit" ? (
                <ArrowUp className="w-3 h-3 text-green-400" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-400" />
              )}
              <span className="text-white/80">{activity.user}</span>
            </div>
            <div className="text-right">
              <p className="text-white/60">{activity.action}</p>
              <p className="text-white font-semibold">{activity.amount}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
