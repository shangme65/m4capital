"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Star } from "lucide-react";

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
  icon: string;
}

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

interface AssetInfo {
  [key: string]: {
    price: number;
    marketCap: string;
    circulatingSupply: string;
    totalSupply: string;
    description: string;
    links: {
      website?: string;
      explorer?: string;
      github?: string;
      twitter?: string;
    };
  };
}

const assetInfo: AssetInfo = {
  BTC: {
    price: 111659.18,
    marketCap: "$2,225,678,960,743.18",
    circulatingSupply: "19,932,790 BTC",
    totalSupply: "19,932,790 BTC",
    description: "Bitcoin is a cryptocurrency and worldwide payment system. It is the first decentralized digital currency, as the system works without a central bank or single administrator.",
    links: {
      website: "https://bitcoin.org",
      explorer: "https://blockchair.com/bitcoin",
      github: "https://github.com/bitcoin/bitcoin"
    }
  },
  ETH: {
    price: 2468.45,
    marketCap: "$296,789,123,456.78",
    circulatingSupply: "120,280,790 ETH",
    totalSupply: "120,280,790 ETH",
    description: "Ethereum is a decentralized platform that runs smart contracts: applications that run exactly as programmed without any possibility of downtime, censorship, fraud or third-party interference.",
    links: {
      website: "https://ethereum.org",
      explorer: "https://etherscan.io",
      github: "https://github.com/ethereum/go-ethereum"
    }
  },
  ADA: {
    price: 0.338,
    marketCap: "$11,789,123,456.78",
    circulatingSupply: "35,045,020,830 ADA",
    totalSupply: "45,000,000,000 ADA",
    description: "Cardano is a proof-of-stake blockchain platform that aims to allow changemakers, innovators and visionaries to bring about positive global change.",
    links: {
      website: "https://cardano.org",
      explorer: "https://cardanoscan.io",
      github: "https://github.com/input-output-hk/cardano-node"
    }
  },
  SOL: {
    price: 150.12,
    marketCap: "$70,456,789,123.45",
    circulatingSupply: "469,320,000 SOL",
    totalSupply: "588,650,000 SOL",
    description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.",
    links: {
      website: "https://solana.com",
      explorer: "https://explorer.solana.com",
      github: "https://github.com/solana-labs/solana"
    }
  },
  USDT: {
    price: 1.00,
    marketCap: "$120,789,123,456.78",
    circulatingSupply: "120,789,123,456 USDT",
    totalSupply: "120,789,123,456 USDT",
    description: "Tether gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
    links: {
      website: "https://tether.to",
      explorer: "https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7"
    }
  }
};

// Mock transaction history for each asset
const mockTransactionHistory = {
  BTC: [
    { id: 1, type: "buy", amount: 0.5, price: 65000, date: "2024-10-10", status: "completed" },
    { id: 2, type: "buy", amount: 0.3542, price: 68500, date: "2024-10-05", status: "completed" },
    { id: 3, type: "sell", amount: 0.1, price: 70000, date: "2024-09-28", status: "completed" },
  ],
  ETH: [
    { id: 1, type: "buy", amount: 5, price: 2400, date: "2024-10-08", status: "completed" },
    { id: 2, type: "buy", amount: 7.67, price: 2350, date: "2024-09-30", status: "completed" },
  ],
  ADA: [
    { id: 1, type: "buy", amount: 5000, price: 0.32, date: "2024-10-07", status: "completed" },
    { id: 2, type: "buy", amount: 3420.15, price: 0.35, date: "2024-09-25", status: "completed" },
  ],
  SOL: [
    { id: 1, type: "buy", amount: 25, price: 145, date: "2024-10-06", status: "completed" },
    { id: 2, type: "buy", amount: 20.23, price: 155, date: "2024-09-28", status: "completed" },
  ],
  USDT: [
    { id: 1, type: "buy", amount: 2000, price: 1.00, date: "2024-10-05", status: "completed" },
    { id: 2, type: "buy", amount: 3420, price: 1.00, date: "2024-09-20", status: "completed" },
  ]
};

export default function AssetDetailsModal({ isOpen, onClose, asset }: AssetDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"holdings" | "history" | "about">("holdings");
  const [isStarred, setIsStarred] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const info = assetInfo[asset.symbol];
  const history = mockTransactionHistory[asset.symbol as keyof typeof mockTransactionHistory] || [];
  const currentPrice = info?.price || 0;
  const priceChange = asset.change;

  const quickBuyAmounts = [22000, 33000, 66000, 110000]; // NGN amounts

  return (
    <AnimatePresence>
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
        className="fixed inset-0 z-50 flex items-start justify-center p-0 overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "auto" }}
      >
        <div className="bg-white w-full h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">{asset.symbol}</h1>
              <p className="text-sm text-gray-500">COIN | {asset.name}</p>
            </div>
            <button
              onClick={() => setIsStarred(!isStarred)}
              className={`transition-colors ${isStarred ? "text-yellow-500" : "text-gray-400"}`}
              aria-label="Add to favorites"
            >
              <Star size={24} fill={isStarred ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Price Section */}
          <div className="p-4 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">₦</span>
              </div>
              <span className="text-gray-600">₦2.23</span>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center justify-center gap-1 ${priceChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                <span className="text-lg">↑</span>
                <span className="text-lg font-medium">
                  $775.38 ({priceChange >= 0 ? "+" : ""}{priceChange}%)
                </span>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-32 bg-gray-50 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-gray-400">Chart Placeholder</span>
            </div>

            {/* Time Period Buttons */}
            <div className="flex justify-around mb-6">
              {["1H", "1D", "1W", "1M", "1Y", "All"].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Buy Now Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buy now</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">43,900 <span className="text-gray-500">NGN</span></div>
                  <div className="flex gap-2 mt-2">
                    {quickBuyAmounts.map((amount) => (
                      <button
                        key={amount}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {amount/1000}K
                      </button>
                    ))}
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors">
                  Buy
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Buying {(43900 / currentPrice).toFixed(8)} {asset.symbol} • Bank transfer • Onramp Money
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { key: "holdings", label: "Holdings" },
                { key: "history", label: "History" },
                { key: "about", label: "About" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 pb-20">
            {activeTab === "holdings" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Balance</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{asset.icon}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{asset.name}</div>
                      <div className="text-gray-600">
                        {asset.amount.toLocaleString("en-US", { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 8 
                        })} {asset.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-gray-500">-</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((tx) => (
                      <div key={tx.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 capitalize">
                              {tx.type} {asset.symbol}
                            </div>
                            <div className="text-sm text-gray-600">{tx.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {tx.amount} {asset.symbol}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${tx.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">📱</div>
                    <p className="text-gray-600 mb-2">Transactions will appear here.</p>
                    <p className="text-gray-500 text-sm">
                      Cannot find your transaction?{" "}
                      <button className="text-blue-600 hover:underline">Check explorer</button>
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold mt-4 transition-colors">
                      Buy {asset.symbol}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "about" && info && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About {asset.symbol}</h3>
                  <p className="text-gray-600 leading-relaxed">{info.description}</p>
                  <button className="text-blue-600 hover:underline mt-2">Read more</button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                      <span className="text-gray-600">Market cap</span>
                      <span className="font-medium text-gray-900">{info.marketCap}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                      <span className="text-gray-600">Circulating Supply</span>
                      <span className="font-medium text-gray-900">{info.circulatingSupply}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                      <span className="text-gray-600">Total Supply</span>
                      <span className="font-medium text-gray-900">{info.totalSupply}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(info.links).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline capitalize"
                      >
                        {key === "website" ? "Official website" : key}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-around">
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center">↑</div>
                <span className="text-xs">Send</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center">↓</div>
                <span className="text-xs">Receive</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center">⇄</div>
                <span className="text-xs">Swap</span>
              </button>
              <button className="flex flex-col items-center gap-1 bg-blue-600 text-white rounded-full px-4 py-2">
                <div className="w-8 h-8 flex items-center justify-center">⚡</div>
                <span className="text-xs">Buy</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center">🏛</div>
                <span className="text-xs">Sell</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}