"use client";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { ArrowLeft, ChevronRight, User, BarChart2, Check, Search, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { CryptoIcon } from "@/components/icons/CryptoIcon";
import { getCurrencyFlagUrl } from "@/lib/currency-flags";
import { useSession } from "next-auth/react";
import { TRADING_ASSETS, formatAssetForAdmin, type TradingAsset as Asset } from "@/lib/trading-assets";

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

export default function ManualProfitModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualProfitModalProps) {
  const { resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("Binary");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [profitPercentage, setProfitPercentage] = useState("");
  const [direction, setDirection] = useState<"HIGHER" | "LOWER">("HIGHER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Market type options
  const marketCategories = ["Binary", "Digital", "Forex", "Crypto", "Stocks", "Commodities"];

  // Filter assets based on search only
  const filteredAssets = TRADING_ASSETS.filter(asset => {
    const matchesSearch = asset.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Fetch users when modal opens (re-run when session role becomes available)
  useEffect(() => {
    if (isOpen && session?.user?.role) {
      fetchUsers();
    }
  }, [isOpen, session?.user?.role]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const isStaffAdmin = session?.user?.role === "STAFF_ADMIN";
      const endpoint = isStaffAdmin ? "/api/admin/staff-users" : "/api/admin/users";
      const response = await fetch(endpoint);
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

    if (!selectedUserId || !selectedAsset || !investmentAmount || !profitPercentage) {
      setError("Please fill in all fields");
      return;
    }

    const investment = parseFloat(investmentAmount);
    if (isNaN(investment) || investment <= 0) {
      setError("Investment amount must be a positive number");
      return;
    }

    const percentage = parseFloat(profitPercentage);
    if (isNaN(percentage) || percentage <= 0) {
      setError("Profit percentage must be a positive number");
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
          market: selectedMarket,
          investmentAmount: investment,
          profitPercentage: percentage,
          direction: direction,
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
      setSelectedMarket("Binary");
      setInvestmentAmount("");
      setProfitPercentage("");

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

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedAssetData = TRADING_ASSETS.find((a) => a.symbol === selectedAsset);
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Known forex currency codes for pair detection
  const FOREX_CODES = new Set(["EUR","USD","GBP","JPY","CHF","CAD","AUD","NZD","SEK","NOK","DKK","PLN","CZK","HUF","SGD","HKD","MXN","ZAR","TRY","BRL","INR","KRW","THB","CNY"]);

  // Helper to render asset icon (handles single assets and pairs)
  const renderAssetIcon = (symbol: string, size: "sm" | "md" | "lg" = "md") => {
    const sizeMap = { sm: 20, md: 32, lg: 40 };
    const iconSize = sizeMap[size];
    
    // Check if it's a pair (e.g., EUR/USD, BTC/USD, BTC/ETH)
    if (symbol.includes("/")) {
      const [base, quote] = symbol.split("/");
      
      // For FOREX pairs (both base and quote are fiat), show both flags
      if (FOREX_CODES.has(base) && FOREX_CODES.has(quote)) {
        return (
          <div className="relative flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
            <div className="absolute left-0 top-0">
              <Image src={getCurrencyFlagUrl(base)} alt={base} width={size === "sm" ? 16 : size === "md" ? 20 : 24} height={size === "sm" ? 16 : size === "md" ? 20 : 24} className="rounded-full object-cover" unoptimized />
            </div>
            <div className="absolute right-0 bottom-0">
              <Image src={getCurrencyFlagUrl(quote)} alt={quote} width={size === "sm" ? 16 : size === "md" ? 20 : 24} height={size === "sm" ? 16 : size === "md" ? 20 : 24} className="rounded-full object-cover" unoptimized />
            </div>
          </div>
        );
      }
      
      // For crypto/USD pairs, only show the crypto icon
      if (quote === "USD" && !FOREX_CODES.has(base)) {
        return <CryptoIcon symbol={base} size={size === "sm" ? "sm" : size === "md" ? "md" : "lg"} />;
      }
      
      // For other pairs (e.g., BTC/ETH), show both icons
      return (
        <div className="relative flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
          <div className="absolute left-0 top-0">
            <CryptoIcon symbol={base} size={size === "sm" ? "xs" : size === "md" ? "sm" : "md"} />
          </div>
          <div className="absolute right-0 bottom-0">
            <CryptoIcon symbol={quote} size={size === "sm" ? "xs" : size === "md" ? "sm" : "md"} />
          </div>
        </div>
      );
    }
    
    // Check if it's a forex pair (6 letters and BOTH halves are valid forex codes)
    if (symbol.length === 6 && /^[A-Z]{6}$/.test(symbol)) {
      const base = symbol.substring(0, 3);
      const quote = symbol.substring(3, 6);
      if (FOREX_CODES.has(base) && FOREX_CODES.has(quote)) {
        return (
          <div className="relative flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
            <div className="absolute left-0 top-0">
              <Image src={getCurrencyFlagUrl(base)} alt={base} width={size === "sm" ? 16 : size === "md" ? 20 : 24} height={size === "sm" ? 16 : size === "md" ? 20 : 24} className="rounded-full object-cover" unoptimized />
            </div>
            <div className="absolute right-0 top-0">
              <Image src={getCurrencyFlagUrl(quote)} alt={quote} width={size === "sm" ? 16 : size === "md" ? 20 : 24} height={size === "sm" ? 16 : size === "md" ? 20 : 24} className="rounded-full object-cover" unoptimized />
            </div>
          </div>
        );
      }
    }
    
    // Single asset - use CryptoIcon (handles crypto with CDN fallback, fiat with flag CDN)
    return <CryptoIcon symbol={symbol} size={size === "sm" ? "sm" : size === "md" ? "md" : "lg"} />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Crypto": return { from: "#f97316", to: "#ea580c", shadow: "#f9731640" };
      case "Stocks": return { from: "#3b82f6", to: "#2563eb", shadow: "#3b82f640" };
      case "Commodities": return { from: "#eab308", to: "#ca8a04", shadow: "#eab30840" };
      case "Forex": return { from: "#10b981", to: "#059669", shadow: "#10b98140" };
      case "Index": return { from: "#8b5cf6", to: "#7c3aed", shadow: "#8b5cf640" };
      default: return { from: "#6b7280", to: "#4b5563", shadow: "#6b728040" };
    }
  };

  const getRoleBadgeClass = (role: string) => {
    if (role === "ADMIN") return "bg-green-500 text-white";
    if (role === "STAFF_ADMIN") return "bg-blue-500 text-white";
    return isDark ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-700";
  };

  return (
    <>
      {/* Main modal */}
      <div className={`fixed top-0 left-0 right-0 bottom-0 z-[100] overflow-y-auto min-h-screen w-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Spacer for dashboard header */}
        <div className="h-14 sm:h-[72px]" />

        {/* Back button + Admin header */}
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
          <div className="mb-1">
            <h1 className="text-base xs:text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Admin Control Panel
            </h1>
            <p className={`text-[10px] xs:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Complete administrative dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className={`flex items-center gap-2 transition-colors p-2 rounded-lg mt-1 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="mb-5 px-1">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Trade Profit</h2>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Record profits for user trading activities</p>
          </div>

          <div className="space-y-4">
            {/* Select User Card */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Select User</label>
              <button
                type="button"
                onClick={() => setShowUserPicker(true)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedUser
                    ? isDark
                      ? "bg-orange-500/10 border-orange-500/50"
                      : "bg-orange-50 border-orange-300"
                    : isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-500"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedUser ? "bg-orange-500" : isDark ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <User size={18} className={selectedUser ? "text-white" : isDark ? "text-gray-400" : "text-gray-500"} />
                  </div>
                  <div className="min-w-0 text-left">
                    {selectedUser ? (
                      <>
                        <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>{selectedUser.name || "Unknown"}</p>
                        <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{selectedUser.email}</p>
                      </>
                    ) : (
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tap to select a user</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {selectedUser && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadgeClass(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  )}
                  <ChevronRight size={18} className={isDark ? "text-gray-500" : "text-gray-400"} />
                </div>
              </button>
            </div>

            {/* Select Asset Card */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Select Asset</label>
              <button
                type="button"
                onClick={() => setShowAssetPicker(true)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedAssetData
                    ? isDark
                      ? "bg-orange-500/10 border-orange-500/50"
                      : "bg-orange-50 border-orange-300"
                    : isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-500"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {selectedAssetData ? (
                    <>
                      <div className="flex-shrink-0">
                        {renderAssetIcon(selectedAssetData.symbol, "lg")}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>{formatAssetForAdmin(selectedAssetData.symbol)}</p>
                        <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{selectedAssetData.displayName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                        <BarChart2 size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />
                      </div>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tap to select an asset</p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {selectedAssetData && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: `${getCategoryColor(selectedAssetData.category).from}25`,
                        color: getCategoryColor(selectedAssetData.category).from,
                      }}
                    >
                      {selectedAssetData.category}
                    </span>
                  )}
                  <ChevronRight size={18} className={isDark ? "text-gray-500" : "text-gray-400"} />
                </div>
              </button>
            </div>

            {/* Market Category */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Market</label>
              <div className="flex flex-wrap gap-2">
                {marketCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMarket(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedMarket === cat
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                        : isDark
                        ? "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-500"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Direction */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Trade Direction</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDirection("HIGHER")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    direction === "HIGHER"
                      ? "border-green-500 bg-green-500/10"
                      : isDark
                      ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={`text-2xl font-bold ${direction === "HIGHER" ? "text-green-500" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                      ↑
                    </div>
                    <span className={`font-semibold text-sm ${direction === "HIGHER" ? "text-green-500" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                      HIGHER
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("LOWER")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    direction === "LOWER"
                      ? "border-red-500 bg-red-500/10"
                      : isDark
                      ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={`text-2xl font-bold ${direction === "LOWER" ? "text-red-500" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                      ↓
                    </div>
                    <span className={`font-semibold text-sm ${direction === "LOWER" ? "text-red-500" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                      LOWER
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Investment amount */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Investment Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Enter investment amount"
                className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              />
            </div>

            {/* Profit percentage */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Profit Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={profitPercentage}
                onChange={(e) => setProfitPercentage(e.target.value)}
                placeholder="Enter profit percentage (e.g., 85 for +85%)"
                className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-2.5 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedUserId || !selectedAsset || !investmentAmount || !profitPercentage}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Adding Profit..." : "Add Manual Profit"}
            </button>
          </div>
        </div>
      </div>

      {/* User Picker Sub-Modal */}
      {showUserPicker && mounted && ReactDOM.createPortal(
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[200] min-h-screen w-screen overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="h-14 sm:h-[72px]" />
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
            <button
              onClick={() => { setShowUserPicker(false); setUserSearchTerm(""); }}
              className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <div className="mb-4 px-1">
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Select User</h2>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{users.length} users on the platform</p>
            </div>

            {/* Search */}
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 mb-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <Search size={16} className={isDark ? "text-gray-400" : "text-gray-400"} />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                autoFocus
                className={`flex-1 bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
              {userSearchTerm && (
                <button onClick={() => setUserSearchTerm("")}>
                  <X size={14} className={isDark ? "text-gray-400" : "text-gray-400"} />
                </button>
              )}
            </div>

            {loadingUsers ? (
              <div className={`text-center py-12 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading users...</div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => { setSelectedUserId(user.id); setShowUserPicker(false); setUserSearchTerm(""); }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? isDark
                            ? "bg-orange-500/15 border-orange-500/60"
                            : "bg-orange-50 border-orange-400"
                          : isDark
                          ? "bg-gray-800 border-gray-700 hover:border-gray-500"
                          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${isSelected ? "bg-orange-500 text-white" : isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                          {(user.name || user.email || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>{user.name || "Unknown"}</p>
                          <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadgeClass(user.role)}`}>{user.role}</span>
                        {isSelected && <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                      </div>
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className={`text-center py-12 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No users found</div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Asset Picker Sub-Modal */}
      {showAssetPicker && mounted && ReactDOM.createPortal(
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-[200] min-h-screen w-screen overflow-y-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="h-14 sm:h-[72px]" />
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
            <button
              onClick={() => { setShowAssetPicker(false); setSearchTerm(""); }}
              className={`flex items-center gap-2 transition-colors p-2 rounded-lg ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800/50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <div className="mb-4 px-1">
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Select Asset</h2>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{TRADING_ASSETS.length} available assets</p>
            </div>

            {/* Search */}
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 mb-4 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <Search size={16} className={isDark ? "text-gray-400" : "text-gray-400"} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets..."
                autoFocus
                className={`flex-1 bg-transparent text-sm focus:outline-none ${isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"}`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X size={14} className={isDark ? "text-gray-400" : "text-gray-400"} />
                </button>
              )}
            </div>

            {/* Asset grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAsset === asset.symbol;
                const colors = getCategoryColor(asset.category);
                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => { setSelectedAsset(asset.symbol); setShowAssetPicker(false); }}
                    className={`relative p-3 rounded-xl text-left transition-all ${isSelected ? "ring-2 ring-orange-500" : ""}`}
                    style={{
                      background: isDark ? "linear-gradient(145deg, #1e293b, #0f172a)" : "linear-gradient(145deg, #ffffff, #f3f4f6)",
                      border: isSelected ? `1px solid ${colors.from}` : isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                      boxShadow: isSelected ? `0 4px 12px rgba(0,0,0,0.2), 0 0 12px ${colors.shadow}` : isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center justify-center">
                        {renderAssetIcon(asset.symbol, "sm")}
                      </div>
                      {isSelected && <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center"><Check size={10} className="text-white" /></div>}
                    </div>
                    <p className={`font-bold text-sm mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{formatAssetForAdmin(asset.symbol)}</p>
                    <p className={`text-[10px] line-clamp-1 mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{asset.displayName}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${colors.from}20`, color: colors.from, border: `1px solid ${colors.from}40` }}>
                      {asset.category}
                    </span>
                  </button>
                );
              })}
              {filteredAssets.length === 0 && (
                <div className={`col-span-2 sm:col-span-3 text-center py-12 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>No assets found</div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
