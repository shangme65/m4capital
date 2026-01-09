"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const cryptos = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "BNB" },
];

export default function LiveMarketPulse() {
  const [prices, setPrices] = useState<{ [key: string]: { price: number; change: number } }>({});

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/bnbusdt@ticker");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.data) {
        const symbol = data.data.s.replace("USDT", "");
        const price = parseFloat(data.data.c);
        const change = parseFloat(data.data.P);
        
        setPrices((prev) => ({
          ...prev,
          [symbol]: { price, change },
        }));
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[7] flex gap-2 sm:gap-4 flex-wrap justify-center px-2 hidden sm:flex">
      {cryptos.map((crypto) => {
        const data = prices[crypto.symbol];
        if (!data) return null;
        
        const isPositive = data.change >= 0;
        
        return (
          <motion.div
            key={crypto.symbol}
            animate={{
              boxShadow: isPositive
                ? ["0 0 0px rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.6)", "0 0 0px rgba(34,197,94,0)"]
                : ["0 0 0px rgba(239,68,68,0)", "0 0 20px rgba(239,68,68,0.6)", "0 0 0px rgba(239,68,68,0)"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 min-w-[140px]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-semibold">{crypto.symbol}</p>
                <p className="text-white text-sm">${data.price.toLocaleString()}</p>
              </div>
              <div className={`flex items-center gap-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-xs font-bold">{Math.abs(data.change).toFixed(2)}%</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
