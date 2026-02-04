"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ManualProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Asset {
  symbol: string;
  name: string;
  category: string;
}

const TRADING_ASSETS: Asset[] = [
  // Cryptocurrencies
  { symbol: "BTC", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH", name: "Ethereum", category: "Crypto" },
  { symbol: "XRP", name: "Ripple", category: "Crypto" },
  { symbol: "SOL", name: "Solana", category: "Crypto" },
  { symbol: "ADA", name: "Cardano", category: "Crypto" },
  { symbol: "DOGE", name: "Dogecoin", category: "Crypto" },
  { symbol: "DOT", name: "Polkadot", category: "Crypto" },
  { symbol: "MATIC", name: "Polygon", category: "Crypto" },
  { symbol: "SHIB", name: "Shiba Inu", category: "Crypto" },
  { symbol: "AVAX", name: "Avalanche", category: "Crypto" },
  { symbol: "LTC", name: "Litecoin", category: "Crypto" },
  { symbol: "TRX", name: "Tron", category: "Crypto" },
  { symbol: "LINK", name: "Chainlink", category: "Crypto" },
  { symbol: "UNI", name: "Uniswap", category: "Crypto" },
  { symbol: "TON", name: "Toncoin", category: "Crypto" },
  
  // US Stocks
  { symbol: "NVDA", name: "NVIDIA Corporation", category: "US Stocks" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "US Stocks" },
  { symbol: "AAPL", name: "Apple Inc.", category: "US Stocks" },
  { symbol: "MSFT", name: "Microsoft Corporation", category: "US Stocks" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Google)", category: "US Stocks" },
  { symbol: "AMZN", name: "Amazon.com Inc.", category: "US Stocks" },
  { symbol: "META", name: "Meta Platforms Inc.", category: "US Stocks" },
  { symbol: "NFLX", name: "Netflix Inc.", category: "US Stocks" },
  { symbol: "AMD", name: "Advanced Micro Devices", category: "US Stocks" },
  { symbol: "INTC", name: "Intel Corporation", category: "US Stocks" },
  { symbol: "BABA", name: "Alibaba Group", category: "US Stocks" },
  { symbol: "DIS", name: "Walt Disney Company", category: "US Stocks" },
  { symbol: "BA", name: "Boeing Company", category: "US Stocks" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", category: "US Stocks" },
  { symbol: "V", name: "Visa Inc.", category: "US Stocks" },
  { symbol: "PYPL", name: "PayPal Holdings", category: "US Stocks" },
  { symbol: "NKE", name: "Nike Inc.", category: "US Stocks" },
  { symbol: "KO", name: "Coca-Cola Company", category: "US Stocks" },
  { symbol: "PFE", name: "Pfizer Inc.", category: "US Stocks" },
  { symbol: "UBER", name: "Uber Technologies", category: "US Stocks" },
  
  // Commodities
  { symbol: "XAUUSD", name: "Gold", category: "Commodities" },
  { symbol: "XAGUSD", name: "Silver", category: "Commodities" },
  { symbol: "XPTUSD", name: "Platinum", category: "Commodities" },
  { symbol: "XPDUSD", name: "Palladium", category: "Commodities" },
  { symbol: "USOIL", name: "Crude Oil (WTI)", category: "Commodities" },
  { symbol: "UKOIL", name: "Brent Crude Oil", category: "Commodities" },
  { symbol: "NATGAS", name: "Natural Gas", category: "Commodities" },
  { symbol: "COPPER", name: "Copper", category: "Commodities" },
  
  // Forex Pairs
  { symbol: "EURUSD", name: "EUR/USD", category: "Forex" },
  { symbol: "GBPUSD", name: "GBP/USD", category: "Forex" },
  { symbol: "USDJPY", name: "USD/JPY", category: "Forex" },
  { symbol: "AUDUSD", name: "AUD/USD", category: "Forex" },
  { symbol: "USDCAD", name: "USD/CAD", category: "Forex" },
  { symbol: "USDCHF", name: "USD/CHF", category: "Forex" },
  { symbol: "NZDUSD", name: "NZD/USD", category: "Forex" },
  { symbol: "EURGBP", name: "EUR/GBP", category: "Forex" },
  { symbol: "EURJPY", name: "EUR/JPY", category: "Forex" },
  { symbol: "GBPJPY", name: "GBP/JPY", category: "Forex" },
  { symbol: "EURCHF", name: "EUR/CHF", category: "Forex" },
  { symbol: "AUDJPY", name: "AUD/JPY", category: "Forex" },
  
  // Indices
  { symbol: "US30", name: "Dow Jones Industrial Average", category: "Indices" },
  { symbol: "US100", name: "NASDAQ 100", category: "Indices" },
  { symbol: "SPX500", name: "S&P 500", category: "Indices" },
  { symbol: "UK100", name: "FTSE 100", category: "Indices" },
  { symbol: "GER40", name: "DAX 40", category: "Indices" },
  { symbol: "JPN225", name: "Nikkei 225", category: "Indices" },
  { symbol: "FRA40", name: "CAC 40", category: "Indices" },
  { symbol: "AUS200", name: "ASX 200", category: "Indices" },
];

export default function ManualProfitModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualProfitModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [profitAmount, setProfitAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(TRADING_ASSETS.map(a => a.category)))];

  // Filter assets based on category and search
  const filteredAssets = TRADING_ASSETS.filter(asset => {
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data || []); // API returns array directly, not { users: [] }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId || !selectedAsset || !profitAmount) {
      setError("Please fill in all fields");
      return;
    }

    const profit = parseFloat(profitAmount);
    if (isNaN(profit) || profit <= 0) {
      setError("Profit amount must be a positive number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/add-manual-profit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          asset: selectedAsset,
          profitAmount: profit,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add manual profit");
      }

      const data = await response.json();

      // Reset form
      setSelectedUserId("");
      setSelectedAsset("");
      setProfitAmount("");

      // Call success callback
      onSuccess();

      // Close modal
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add manual profit");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getAssetIcon = (category: string) => {
    switch (category) {
      case "Crypto": return "₿";
      case "US Stocks": return "📈";
      case "Commodities": return "🥇";
      case "Forex": return "💱";
      case "Indices": return "📊";
      default: return "💰";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Crypto": return { from: "#f97316", to: "#ea580c", shadow: "#f9731640" };
      case "US Stocks": return { from: "#3b82f6", to: "#2563eb", shadow: "#3b82f640" };
      case "Commodities": return { from: "#eab308", to: "#ca8a04", shadow: "#eab30840" };
      case "Forex": return { from: "#10b981", to: "#059669", shadow: "#10b98140" };
      case "Indices": return { from: "#8b5cf6", to: "#7c3aed", shadow: "#8b5cf640" };
      default: return { from: "#6b7280", to: "#4b5563", shadow: "#6b728040" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Trade Profit</h2>
            <p className="text-gray-400 text-xs">Record profits for user trading activities</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Select User</label>
              {loadingUsers ? (
                <div className="text-gray-400 text-center py-3 text-sm">Loading users...</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`relative px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                        selectedUserId === user.id
                          ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500"
                          : "bg-gray-700/50 border border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">{user.name || "Unknown"}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase text-[10px]">
                            {user.role}
                          </span>
                          {selectedUserId === user.id && (
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Asset Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedAsset("");
                        setSearchTerm("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {category === "all" ? "All Assets" : category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search bar */}
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search asset..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            {/* Asset selection - Compact 3D Cards */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Select Asset
                <span className="text-xs font-normal text-gray-400 ml-2">({filteredAssets.length})</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset === asset.symbol;
                  const colors = getCategoryColor(asset.category);
                  
                  return (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => setSelectedAsset(asset.symbol)}
                      className={`relative p-2.5 rounded-lg transition-all duration-200 text-left ${
                        isSelected ? "ring-2 ring-orange-500" : ""
                      }`}
                      style={{
                        background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
                        boxShadow: isSelected
                          ? `0 4px 12px rgba(0,0,0,0.4), 0 0 12px ${colors.shadow}`
                          : "0 2px 8px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {/* Icon and checkmark */}
                      <div className="flex items-start justify-between mb-1.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`,
                            boxShadow: `0 2px 8px ${colors.shadow}`,
                          }}
                        >
                          <span className="text-sm">{getAssetIcon(asset.category)}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Symbol */}
                      <p className="font-bold text-white text-sm mb-0.5">{asset.symbol}</p>

                      {/* Name */}
                      <p className="text-[10px] text-gray-400 line-clamp-1 mb-1.5">{asset.name}</p>

                      {/* Category badge */}
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium inline-block"
                        style={{
                          background: `${colors.from}20`,
                          color: colors.from,
                          border: `1px solid ${colors.from}40`,
                        }}
                      >
                        {asset.category}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filteredAssets.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">No assets found</div>
              )}
            </div>

            {/* Profit amount */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Profit Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={profitAmount}
                onChange={(e) => setProfitAmount(e.target.value)}
                placeholder="Enter profit amount"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-2.5 text-xs">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer with Submit */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedUserId || !selectedAsset || !profitAmount}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding Profit..." : "Add Manual Profit"}
          </button>
        </div>
      </div>
    </div>
  );
}
