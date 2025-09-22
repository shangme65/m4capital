"use client";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", amount: 0.5, value: 35000, change: 2.5 },
  { symbol: "ETH", name: "Ethereum", amount: 10, value: 22000, change: -1.2 },
  { symbol: "ADA", name: "Cardano", amount: 5000, value: 1500, change: 5.8 },
  { symbol: "SOL", name: "Solana", amount: 100, value: 4500, change: 10.1 },
];

const PortfolioDistribution = () => {
  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold text-white mb-4">
        Portfolio Distribution
      </h2>
      <ul className="space-y-4">
        {assets.map((asset) => (
          <li key={asset.symbol} className="flex items-center">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-4">
              <span className="font-bold text-white">{asset.symbol}</span>
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-white">{asset.name}</p>
              <p className="text-sm text-gray-400">
                {asset.amount} {asset.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">
                ${asset.value.toLocaleString()}
              </p>
              <p
                className={`text-sm ${
                  asset.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {asset.change >= 0 ? "+" : ""}
                {asset.change}%
              </p>
            </div>
            <button
              className="ml-4 text-gray-400 hover:text-white"
              title="More options"
            >
              <MoreVertical size={20} />
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default PortfolioDistribution;
