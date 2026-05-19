"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { Search, X, ChevronDown } from "lucide-react";
import { VscVerifiedFilled } from "react-icons/vsc";
import { useTheme } from "@/contexts/ThemeContext";

interface Trader {
  name: string;
  winRate: string;
  profitShare: string;
  image: string;
}

/** Returns a deterministic daily earnings figure seeded by trader name + UTC date.
 * Changes every 24h at UTC midnight; higher win rate = higher range. */
function get24hEarnings(name: string, winRate: string): number {
  const rate = parseFloat(winRate);
  const d = new Date();
  const dateSeed =
    d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  let hash = dateSeed;
  for (let i = 0; i < name.length; i++) {
    hash = (Math.imul(31, hash) + name.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);
  // Scale: 70% WR ~$450–$2 700 | 85% WR ~$2 700–$10 500 | 99% WR ~$12 000–$36 000
  const t = Math.min(Math.max((rate - 70) / 29, 0), 1);
  const rangeMin = Math.round(450 + t * 11550);
  const rangeMax = Math.round(2700 + t * 33300);
  return rangeMin + (hash % (rangeMax - rangeMin + 1));
}

function getMinimumAmount(name: string, winRate: string): number {
  const rate = parseFloat(winRate);
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (Math.imul(31, hash) + name.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);
  if (rate >= 90) {
    return 6100 + (hash % 1001);
  } else if (rate >= 80) {
    const base = Math.round(500 + ((rate - 80) / 9) * 4500);
    return Math.max(500, Math.min(5000, base + (hash % 201) - 100));
  } else {
    return 2565 + (hash % 500);
  }
}

const traders: Trader[] = [
  {
    name: "Kpak",
    winRate: "87.45%",
    profitShare: "8%",
    image: "/copytrading/kpak.jpeg",
  },
  {
    name: "Mark Minervini",
    winRate: "93.2%",
    profitShare: "10%",
    image: "/copytrading/mark-minervini.jpeg",
  },
  {
    name: "Asad Rizvi",
    winRate: "95.97%",
    profitShare: "5%",
    image: "/copytrading/asad-rizvi.jpeg",
  },
  {
    name: "Vulture Trades",
    winRate: "97.3%",
    profitShare: "10%",
    image: "/copytrading/vulture-trades.jpeg",
  },
  {
    name: "Coach JV",
    winRate: "78.9%",
    profitShare: "6%",
    image: "/copytrading/coach-jv.jpeg",
  },
  {
    name: "JackTheRippler",
    winRate: "98.8%",
    profitShare: "10%",
    image: "/copytrading/jack-the-rippler.jpeg",
  },
  {
    name: "John Squire",
    winRate: "97.46%",
    profitShare: "8%",
    image: "/copytrading/john-squire.jpeg",
  },
  {
    name: "Timothy Sykes",
    winRate: "99.2%",
    profitShare: "10%",
    image: "/copytrading/timothy-sykes.jpeg",
  },
  {
    name: "Roland Wolf",
    winRate: "93.97%",
    profitShare: "8%",
    image: "/copytrading/roland-wolf.jpeg",
  },
  {
    name: "Colin",
    winRate: "95.96%",
    profitShare: "10%",
    image: "/copytrading/colin.jpeg",
  },
  {
    name: "Lyn Alden",
    winRate: "96.99%",
    profitShare: "10%",
    image: "/copytrading/lyn-alden.jpeg",
  },
  {
    name: "Anya Trades",
    winRate: "98.8%",
    profitShare: "10%",
    image: "/copytrading/anya-trades.jpeg",
  },
  {
    name: "Michael Maloney",
    winRate: "89%",
    profitShare: "5%",
    image: "/copytrading/michael-maloney.jpeg",
  },
  {
    name: "Michael J. Kramer",
    winRate: "92.56%",
    profitShare: "8%",
    image: "/copytrading/michael-j-kramer.jpeg",
  },
  {
    name: "PB Investing",
    winRate: "95.5%",
    profitShare: "8%",
    image: "/copytrading/pb-investing.jpeg",
  },
  {
    name: "Mini Trades",
    winRate: "95.79%",
    profitShare: "8%",
    image: "/copytrading/mini-trades.jpeg",
  },
  {
    name: "Tara Bull",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/tara-bull.jpeg",
  },
  {
    name: "Vivi (Biotech Queen)",
    winRate: "97.23%",
    profitShare: "10%",
    image: "/copytrading/vivi-biotech-queen.jpeg",
  },
  {
    name: "Lia",
    winRate: "93.72%",
    profitShare: "10%",
    image: "/copytrading/lia.jpeg",
  },
  {
    name: "TW - The Wealthy Trader",
    winRate: "95.67%",
    profitShare: "10%",
    image: "/copytrading/tw-the-wealthy-trader.jpeg",
  },
  {
    name: "stevenmarkryan",
    winRate: "97%",
    profitShare: "8%",
    image: "/copytrading/stevenmarkryan.jpeg",
  },
  {
    name: "Maneco64",
    winRate: "94.3%",
    profitShare: "10%",
    image: "/copytrading/maneco64.jpeg",
  },
  {
    name: "Sniper Alert",
    winRate: "92.6%",
    profitShare: "8%",
    image: "/copytrading/sniper-alert.jpeg",
  },
  {
    name: "Teslaconomics",
    winRate: "93.5%",
    profitShare: "7%",
    image: "/copytrading/teslaconomics.jpeg",
  },
  {
    name: "Matt Smith",
    winRate: "95.68%",
    profitShare: "10%",
    image: "/copytrading/matt-smith.jpeg",
  },
  {
    name: "Hailey LUNC",
    winRate: "95.2%",
    profitShare: "10%",
    image: "/copytrading/hailey-lunc.jpeg",
  },
  {
    name: "XRP CAPTAIN",
    winRate: "98.6%",
    profitShare: "8%",
    image: "/copytrading/xrp-captain.jpeg",
  },
  {
    name: "Lyndsey",
    winRate: "94.67%",
    profitShare: "10%",
    image: "/copytrading/lyndsey.jpeg",
  },
  {
    name: "Gold Telegraph",
    winRate: "97.54%",
    profitShare: "10%",
    image: "/copytrading/gold-telegraph.jpeg",
  },
  {
    name: "Alasdair Macleod",
    winRate: "98.7%",
    profitShare: "8%",
    image: "/copytrading/alasdair-macleod.jpeg",
  },
  {
    name: "Ash Crypto",
    winRate: "97.4%",
    profitShare: "10%",
    image: "/copytrading/ash-crypto.jpeg",
  },
  {
    name: "TrendSpider",
    winRate: "98.3%",
    profitShare: "15%",
    image: "/copytrading/trendspider.jpeg",
  },
  {
    name: "Jake Wujastyk",
    winRate: "94.3%",
    profitShare: "10%",
    image: "/copytrading/jake-wujastyk.jpeg",
  },
  {
    name: "EliteOptionsTrader",
    winRate: "95.4%",
    profitShare: "10%",
    image: "/copytrading/elite-options-trader.jpeg",
  },
  {
    name: "Scott Redler",
    winRate: "95.4%",
    profitShare: "10%",
    image: "/copytrading/scott-redler.jpeg",
  },
  {
    name: "Traderstewie",
    winRate: "88.5%",
    profitShare: "8%",
    image: "/copytrading/traderstewie.jpeg",
  },
  {
    name: "tic toc",
    winRate: "95.5%",
    profitShare: "10%",
    image: "/copytrading/tic-toc.jpeg",
  },
  {
    name: "THE SHORT BEAR",
    winRate: "90.5%",
    profitShare: "10%",
    image: "/copytrading/the-short-bear.jpeg",
  },
  {
    name: "Liz Ann Sonders",
    winRate: "95.5%",
    profitShare: "10%",
    image: "/copytrading/liz-ann-sonders.jpeg",
  },
  {
    name: "Jim Bianco",
    winRate: "97.52%",
    profitShare: "10%",
    image: "/copytrading/jim-bianco.jpeg",
  },
  {
    name: "James Rule XRP",
    winRate: "96.8%",
    profitShare: "10%",
    image: "/copytrading/james-rule-xrp.jpeg",
  },
  {
    name: "DustyBC Crypto",
    winRate: "95.6%",
    profitShare: "10%",
    image: "/copytrading/dustybc-crypto.jpeg",
  },
  {
    name: "Zach Rector",
    winRate: "97.5%",
    profitShare: "10%",
    image: "/copytrading/zach-rector.jpeg",
  },
  {
    name: "TheSonOfWalkley",
    winRate: "95.6%",
    profitShare: "10%",
    image: "/copytrading/thesonofwalkley.jpeg",
  },
  {
    name: "StockWhale",
    winRate: "96.46%",
    profitShare: "8%",
    image: "/copytrading/stockwhale.jpeg",
  },
  {
    name: "Sawyer Merritt",
    winRate: "97.3%",
    profitShare: "10%",
    image: "/copytrading/sawyer-merritt.jpeg",
  },
  {
    name: "Mike Investing",
    winRate: "94.4%",
    profitShare: "10%",
    image: "/copytrading/mike-investing.jpeg",
  },
  {
    name: "John @ The Rock Trading Co.",
    winRate: "98.8%",
    profitShare: "8%",
    image: "/copytrading/john-rock-trading.jpeg",
  },
  {
    name: "Remz",
    winRate: "96.6%",
    profitShare: "9%",
    image: "/copytrading/remz.jpeg",
  },
  {
    name: "Thomas (Tom) Lee",
    winRate: "95.5%",
    profitShare: "10%",
    image: "/copytrading/thomas-tom-lee.jpeg",
  },

  {
    name: "Forever Laura",
    winRate: "93.4%",
    profitShare: "10%",
    image: "/copytrading/forever-laura.jpeg",
  },
  {
    name: "EDO FARINA XRP",
    winRate: "96.9%",
    profitShare: "8%",
    image: "/copytrading/edo-farina-xrp.jpeg",
  },
  {
    name: "Fabio Zuccara",
    winRate: "97.9%",
    profitShare: "10%",
    image: "/copytrading/fabio-zuccara.jpeg",
  },
  {
    name: "Adam H. Shazly",
    winRate: "97.6%",
    profitShare: "10%",
    image: "/copytrading/adam-h-shazly.jpeg",
  },
  {
    name: "Jade",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/jade.jpeg",
  },
  {
    name: "Kispestikifli",
    winRate: "96.8%",
    profitShare: "10%",
    image: "/copytrading/kispestikifli.jpeg",
  },
  {
    name: "GURGAVIN",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/gurgavin.jpeg",
  },
  {
    name: "philakones",
    winRate: "97%",
    profitShare: "10%",
    image: "/copytrading/philakones.jpeg",
  },
  {
    name: "Dalton Brewer",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/dalton-brewer.jpeg",
  },
  {
    name: "STEPH IS CRYPTO",
    winRate: "98%",
    profitShare: "10%",
    image: "/copytrading/steph-is-crypto.jpeg",
  },
  {
    name: "Merlijn The Trader",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/merlijn-the-trader.jpeg",
  },
  {
    name: "j trader",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/j-trader.jpeg",
  },

  {
    name: "LumiTrader",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/lumitrader.jpeg",
  },
  {
    name: "Rashad Hajiyev",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/rashad-hajiyev.jpeg",
  },
  {
    name: "XRP Avengers",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/xrp-avengers.jpeg",
  },
  {
    name: "THEXRPGUY",
    winRate: "99%",
    profitShare: "10%",
    image: "/copytrading/thexrpguy.jpeg",
  },
  {
    name: "Tiger line trading",
    winRate: "93%",
    profitShare: "10%",
    image: "/copytrading/tiger-line-trading.jpeg",
  },
  {
    name: "SniperAlert",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/sniperalert.jpeg",
  },
  {
    name: "cryptosage26 (SAGE MODE)",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/cryptosage26.jpeg",
  },
  {
    name: "Bald Guy Money",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/bald-guy-money.jpeg",
  },
  {
    name: "The King Of All Charts",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/the-king-of-all-charts.jpeg",
  },
  {
    name: "Urkel",
    winRate: "97%",
    profitShare: "10%",
    image: "/copytrading/urkel.jpeg",
  },
  {
    name: "Crypto Bitlord",
    winRate: "97.5%",
    profitShare: "10%",
    image: "/copytrading/crypto-bitlord.jpeg",
  },
  {
    name: "Ann",
    winRate: "96%",
    profitShare: "8%",
    image: "/copytrading/ann.jpeg",
  },
  {
    name: "Tiger",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/tiger.jpeg",
  },
  {
    name: "RoseXRP",
    winRate: "95.5%",
    profitShare: "10%",
    image: "/copytrading/rosexp.jpeg",
  },
  {
    name: "Austin Hilton",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/austin-hilton.png",
  },
  {
    name: "J. Thorne",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/j-thorne.jpeg",
  },
  {
    name: "Moon Market",
    winRate: "98%",
    profitShare: "10%",
    image: "/copytrading/moon-market.jpeg",
  },
  {
    name: "Mini Tradez",
    winRate: "95%",
    profitShare: "10%",
    image: "/copytrading/mini-tradez.jpeg",
  },
  {
    name: "Cobra",
    winRate: "93%",
    profitShare: "10%",
    image: "/copytrading/cobra.jpeg",
  },
  {
    name: "Edward Johnson",
    winRate: "93%",
    profitShare: "10%",
    image: "/copytrading/edward-johnson.jpeg",
  },
  {
    name: "Gary Black",
    winRate: "96%",
    profitShare: "10%",
    image: "/copytrading/gary-black.jpeg",
  },
  {
    name: "Alejandra Reyes",
    winRate: "92%",
    profitShare: "10%",
    image: "/copytrading/alejandra-reyes.jpeg",
  },
];

export default function CopyTradingPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTrader, setCopiedTrader] = useState<string | null>(null);
  const [confirmTrader, setConfirmTrader] = useState<Trader | null>(null);
  const [dialogStep, setDialogStep] = useState<
    "confirm" | "select-crypto" | "payment"
  >("confirm");
  const [selectedCrypto, setSelectedCrypto] = useState<{
    id: string;
    symbol: string;
    name: string;
    network: string;
  } | null>(null);
  const [paymentData, setPaymentData] = useState<{
    address: string;
    payAmount: number;
    currency: string;
    minUsd: number;
  } | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  type SortOption =
    | "winRate_desc"
    | "winRate_asc"
    | "profitShare_desc"
    | "profitShare_asc"
    | "minDeposit_asc"
    | "minDeposit_desc"
    | "name_asc";
  const [sortBy, setSortBy] = useState<SortOption>("winRate_desc");

  const filteredTraders = traders
    .filter((trader) =>
      trader.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "winRate_desc":
          return parseFloat(b.winRate) - parseFloat(a.winRate);
        case "winRate_asc":
          return parseFloat(a.winRate) - parseFloat(b.winRate);
        case "profitShare_desc":
          return parseFloat(b.profitShare) - parseFloat(a.profitShare);
        case "profitShare_asc":
          return parseFloat(a.profitShare) - parseFloat(b.profitShare);
        case "minDeposit_asc":
          return (
            getMinimumAmount(a.name, a.winRate) -
            getMinimumAmount(b.name, b.winRate)
          );
        case "minDeposit_desc":
          return (
            getMinimumAmount(b.name, b.winRate) -
            getMinimumAmount(a.name, a.winRate)
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleCopyClick = (trader: Trader) => {
    setConfirmTrader(trader);
  };

  const handleCloseDialog = () => {
    setConfirmTrader(null);
    setDialogStep("confirm");
    setPaymentData(null);
    setPaymentError(null);
    setIsLoadingPayment(false);
    setAddressCopied(false);
    setSelectedCrypto(null);
  };

  const handleConfirmCopy = async (crypto: {
    id: string;
    symbol: string;
    name: string;
    network: string;
  }) => {
    if (!confirmTrader) return;
    setSelectedCrypto(crypto);
    const minUsd = getMinimumAmount(confirmTrader.name, confirmTrader.winRate);
    setIsLoadingPayment(true);
    setPaymentError(null);
    setDialogStep("payment");
    try {
      const res = await fetch("/api/payment/create-crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: minUsd,
          currency: "USD",
          cryptoCurrency: crypto.id,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.deposit?.paymentAddress) {
        throw new Error(json.message || "Failed to generate payment address");
      }
      const deposit = json.data.deposit;
      setPaymentData({
        address: deposit.paymentAddress,
        payAmount: deposit.cryptoAmount,
        currency: deposit.cryptoCurrency,
        minUsd,
      });
    } catch (err: any) {
      setPaymentError(err.message || "Something went wrong");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handleCopyAddress = () => {
    if (!paymentData) return;
    navigator.clipboard.writeText(paymentData.address).then(() => {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    });
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0f1a]" : "bg-gray-100"}`}>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1
            className={`text-2xl sm:text-3xl font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Copy Trades
          </h1>
          <p
            className={`text-sm leading-relaxed max-w-2xl ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Copy trading lets you automatically mirror the live trades of
            experienced investors. Select a trader, meet the minimum deposit,
            and every position they open or close is instantly replicated in
            your account — so you earn when they earn, with no manual trading
            required.
          </p>
        </div>

        {/* Search + Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors ${
                isDark
                  ? "bg-[#131d2e] border border-[#1e2d42] text-white placeholder-gray-500 focus:border-blue-500"
                  : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                title="Clear search"
                aria-label="Clear search"
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <ChevronDown
              size={14}
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? "text-gray-400" : "text-gray-400"
              }`}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`appearance-none pl-3 pr-8 py-2.5 rounded-lg text-sm outline-none cursor-pointer transition-colors ${
                isDark
                  ? "bg-[#131d2e] border border-[#1e2d42] text-white focus:border-blue-500"
                  : "bg-white border border-gray-200 text-gray-900 focus:border-blue-400"
              }`}
            >
              <option value="winRate_desc">Win Rate: High to Low</option>
              <option value="winRate_asc">Win Rate: Low to High</option>
              <option value="profitShare_desc">
                Profit Share: High to Low
              </option>
              <option value="profitShare_asc">Profit Share: Low to High</option>
              <option value="minDeposit_asc">Min. Deposit: Low to High</option>
              <option value="minDeposit_desc">Min. Deposit: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Trader Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredTraders.map((trader) => (
            <TraderCard
              key={trader.name}
              trader={trader}
              isDark={isDark}
              isCopied={copiedTrader === trader.name}
              onCopy={() => handleCopyClick(trader)}
            />
          ))}
        </div>

        {filteredTraders.length === 0 && (
          <div
            className={`text-center py-16 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <p className="text-lg">
              No traders found for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Copy Confirmation Toast */}
        {copiedTrader && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
              ✓ Now copying {copiedTrader}
            </div>
          </div>
        )}
      </div>

      {/* Copy Confirmation Dialog */}
      {confirmTrader &&
        ReactDOM.createPortal(
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleCloseDialog}
          >
            <div
              className={`rounded-2xl shadow-2xl w-[340px] mx-4 overflow-hidden ${
                isDark
                  ? "bg-[#111827] border border-[#1f2d42]"
                  : "bg-white border border-gray-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b ${
                  isDark ? "border-[#1f2d42]" : "border-gray-100"
                }`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {dialogStep === "confirm"
                    ? "Copy Trader"
                    : "Deposit Required"}
                </span>
                <button
                  onClick={handleCloseDialog}
                  title="Close"
                  aria-label="Close dialog"
                  className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    isDark
                      ? "hover:bg-white/10 text-gray-400"
                      : "hover:bg-gray-100 text-gray-400"
                  }`}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Step 1 — Compact Confirm */}
              {dialogStep === "confirm" && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={confirmTrader.image}
                        alt={confirmTrader.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {confirmTrader.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {confirmTrader.winRate} win rate
                      </p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-green-400">
                      $
                      {getMinimumAmount(
                        confirmTrader.name,
                        confirmTrader.winRate,
                      ).toLocaleString()}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed mb-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    A minimum deposit of{" "}
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      $
                      {getMinimumAmount(
                        confirmTrader.name,
                        confirmTrader.winRate,
                      ).toLocaleString()}
                    </span>{" "}
                    is required to copy this trader. Select a crypto to generate
                    a deposit address.
                  </p>

                  {paymentError && (
                    <p className="text-xs text-red-400 mb-3 text-center">
                      {paymentError}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleCloseDialog}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                        isDark
                          ? "bg-[#1a2535] text-gray-300 hover:bg-[#1e2d42]"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => setDialogStep("select-crypto")}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                    >
                      COPY
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — Select Crypto */}
              {dialogStep === "select-crypto" && (
                <div className="px-4 py-4">
                  <p
                    className={`text-xs mb-3 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Select a cryptocurrency to deposit:
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(
                      [
                        {
                          id: "btc",
                          symbol: "BTC",
                          name: "Bitcoin",
                          network: "Bitcoin",
                        },
                        {
                          id: "eth",
                          symbol: "ETH",
                          name: "Ethereum",
                          network: "ERC-20",
                        },
                        {
                          id: "usdterc20",
                          symbol: "USDT",
                          name: "Tether",
                          network: "ERC-20",
                        },
                        {
                          id: "usdcerc20",
                          symbol: "USDC",
                          name: "USD Coin",
                          network: "ERC-20",
                        },
                        {
                          id: "sol",
                          symbol: "SOL",
                          name: "Solana",
                          network: "Solana",
                        },
                        {
                          id: "xrp",
                          symbol: "XRP",
                          name: "Ripple",
                          network: "XRP Ledger",
                        },
                        {
                          id: "bnb",
                          symbol: "BNB",
                          name: "BNB",
                          network: "BSC",
                        },
                        {
                          id: "ltc",
                          symbol: "LTC",
                          name: "Litecoin",
                          network: "Litecoin",
                        },
                        {
                          id: "trx",
                          symbol: "TRX",
                          name: "Tron",
                          network: "TRC-20",
                        },
                        {
                          id: "ton",
                          symbol: "TON",
                          name: "Toncoin",
                          network: "TON",
                        },
                        {
                          id: "doge",
                          symbol: "DOGE",
                          name: "Dogecoin",
                          network: "Dogecoin",
                        },
                        {
                          id: "bch",
                          symbol: "BCH",
                          name: "Bitcoin Cash",
                          network: "Bitcoin Cash",
                        },
                      ] as {
                        id: string;
                        symbol: string;
                        name: string;
                        network: string;
                      }[]
                    ).map((crypto) => (
                      <button
                        key={crypto.id}
                        onClick={() => handleConfirmCopy(crypto)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-colors ${
                          isDark
                            ? "bg-[#0a0f1a] border-[#1a2535] hover:border-blue-500 hover:bg-[#0f1923]"
                            : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        <img
                          src={`/crypto/${crypto.symbol.toLowerCase()}.svg`}
                          alt={crypto.symbol}
                          width={28}
                          height={28}
                          className="w-7 h-7"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/generic.svg";
                          }}
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {crypto.symbol}
                        </span>
                        <span
                          className={`text-[9px] leading-tight text-center ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {crypto.network}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setDialogStep("confirm")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      isDark
                        ? "bg-[#1a2535] text-gray-300 hover:bg-[#1e2d42]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    BACK
                  </button>
                </div>
              )}

              {/* Step 3 — Payment Address */}
              {dialogStep === "payment" && (
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 shrink-0">
                      <img
                        src={`/crypto/${(selectedCrypto?.symbol ?? paymentData?.currency ?? "btc").toLowerCase()}.svg`}
                        alt={selectedCrypto?.name ?? "Crypto"}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/generic.svg";
                        }}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {selectedCrypto?.name ?? "Crypto"} Deposit
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {isLoadingPayment
                          ? "Generating address…"
                          : "Send exactly this amount to continue"}
                      </p>
                    </div>
                  </div>

                  {isLoadingPayment && (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Generating your {selectedCrypto?.symbol} address…
                      </p>
                    </div>
                  )}

                  {paymentError && !isLoadingPayment && (
                    <div className="py-4 text-center">
                      <p className="text-xs text-red-400 mb-3">
                        {paymentError}
                      </p>
                      <button
                        onClick={() => setDialogStep("select-crypto")}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                          isDark
                            ? "bg-[#1a2535] text-gray-300 hover:bg-[#1e2d42]"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        TRY ANOTHER COIN
                      </button>
                    </div>
                  )}

                  {!isLoadingPayment && !paymentError && paymentData && (
                    <>
                      {/* Amount badge */}
                      <div
                        className={`rounded-xl px-3 py-2 mb-3 flex items-center justify-between ${
                          isDark
                            ? "bg-[#0a0f1a] border border-[#1a2535]"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Amount
                        </span>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {paymentData.payAmount.toFixed(8)}{" "}
                            {paymentData.currency}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            ≈ ${paymentData.minUsd.toLocaleString()} USD
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      <p
                        className={`text-xs mb-1 ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Deposit Address
                      </p>
                      <div
                        className={`rounded-xl px-3 py-2.5 mb-3 ${
                          isDark
                            ? "bg-[#0a0f1a] border border-[#1a2535]"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <p
                          className={`text-xs font-mono break-all leading-relaxed ${
                            isDark ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {paymentData.address}
                        </p>
                      </div>

                      <button
                        onClick={handleCopyAddress}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors ${
                          addressCopied
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-500"
                        }`}
                      >
                        {addressCopied ? "✓ Address Copied!" : "Copy Address"}
                      </button>

                      <p
                        className={`text-center text-xs mt-3 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Once confirmed, your copy trading will be activated
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

interface TraderCardProps {
  trader: Trader;
  isDark: boolean;
  isCopied: boolean;
  onCopy: () => void;
}

function TraderCard({ trader, isDark, isCopied, onCopy }: TraderCardProps) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] ${
        isDark
          ? "bg-[#0f1923] border border-[#1a2535]"
          : "bg-white border border-gray-200 shadow-sm"
      }`}
    >
      {/* Round avatar pinned to top-left corner */}
      <div className="absolute top-3 left-3 z-10 w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/70 shadow-lg">
        <Image
          src={trader.image}
          alt={trader.name}
          fill
          className="object-cover object-top"
          sizes="48px"
        />
      </div>

      {/* Avatar Section — full width image fading into card */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          src={trader.image}
          alt={trader.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        {/* Gradient overlay fading image into card bottom */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-t from-[#0f1923] via-[#0f1923]/40 to-transparent"
              : "bg-gradient-to-t from-white via-white/30 to-transparent"
          }`}
        />
        {/* Trader name overlaid at bottom of image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3
            className={`text-lg font-bold leading-tight flex items-center gap-1.5 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {trader.name}
            <VscVerifiedFilled
              className="text-green-500 flex-shrink-0"
              size={15}
            />
          </h3>
        </div>
      </div>

      {/* Stats + Copy Button */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-3 mb-4">
          {/* Win Rate */}
          <div className="flex-1">
            <p
              className={`text-xs mb-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Win Rate
            </p>
            <div
              className={`px-3 py-1.5 rounded-lg text-center ${
                isDark ? "bg-[#1a2535]" : "bg-gray-100"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {trader.winRate}
              </span>
            </div>
          </div>

          {/* Profit Share */}
          <div className="flex-1">
            <p
              className={`text-xs mb-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Profit Share
            </p>
            <div
              className={`px-3 py-1.5 rounded-lg text-center ${
                isDark ? "bg-[#1a2535]" : "bg-gray-100"
              }`}
            >
              <span
                className={`text-sm font-semibold ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
              >
                {trader.profitShare}
              </span>
            </div>
          </div>
        </div>

        {/* 24h Earnings */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 ${
            isDark
              ? "bg-green-900/20 border border-green-800/30"
              : "bg-green-50 border border-green-100"
          }`}
        >
          <span
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            24h Earned
          </span>
          <span className="text-xs font-bold text-green-400">
            +${get24hEarnings(trader.name, trader.winRate).toLocaleString()}
          </span>
        </div>

        {/* Copy Button */}
        <button
          onClick={onCopy}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isCopied
              ? "bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {isCopied ? "✓ Copying" : "Copy"}
        </button>
      </div>
    </div>
  );
}
