"use client";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

const ForTradersDropdown = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  const sectionHeaderClass = isDark
    ? "text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em]"
    : "text-[11px] font-medium text-gray-400 uppercase tracking-[0.1em]";

  const primaryLinkClass = isDark
    ? "block text-[15px] font-medium text-white/90 hover:text-[#ff8516] transition-colors"
    : "block text-[15px] font-medium text-gray-800 hover:text-[#ff660f] transition-colors";

  const secondaryLinkClass = isDark
    ? "block text-[14px] text-white/80 hover:text-[#ff8516] transition-colors"
    : "block text-[14px] text-gray-600 hover:text-[#ff660f] transition-colors";

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max">
      <div
        className={`backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden ${
          isDark
            ? "bg-[#1a1a1a]/95 text-white border border-white/[0.06]"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <div
          className={`flex p-6 gap-0 ${
            isDark ? "divide-x divide-white/[0.06]" : "divide-x divide-gray-200"
          }`}
        >
          {/* Markets & Assets */}
          <div className="pr-8">
            <h3 className={`${sectionHeaderClass} mb-4`}>Markets & Assets</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/crypto" className={primaryLinkClass}>
                  Crypto
                </Link>
              </li>
              <li>
                <Link href="/etfs" className={primaryLinkClass}>
                  ETFs
                </Link>
              </li>
              <li>
                <Link href="/commodities" className={primaryLinkClass}>
                  Commodities
                </Link>
              </li>
              <li>
                <Link href="/forex" className={primaryLinkClass}>
                  Forex
                </Link>
              </li>
              <li>
                <Link href="/indices" className={primaryLinkClass}>
                  Indices
                </Link>
              </li>
              <li>
                <Link href="/stocks" className={primaryLinkClass}>
                  Stocks
                </Link>
              </li>
            </ul>
          </div>

          {/* Analytics */}
          <div className="px-8">
            <h3 className={`${sectionHeaderClass} mb-4`}>Analytics</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/historical-quotes" className={secondaryLinkClass}>
                  Historical Quotes
                </Link>
              </li>
              <li>
                <Link href="/calendars" className={secondaryLinkClass}>
                  Calendars
                </Link>
              </li>
              <li>
                <Link
                  href="/trading-specifications"
                  className={secondaryLinkClass}
                >
                  Trading specifications
                </Link>
              </li>
            </ul>

            <h3 className={`${sectionHeaderClass} mt-6 mb-4`}>Education</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/video-tutorials" className={secondaryLinkClass}>
                  Video tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/margin-trading-basics"
                  className={secondaryLinkClass}
                >
                  The basics of margin trading
                </Link>
              </li>
              <li>
                <Link href="/demo-trading" className={secondaryLinkClass}>
                  Demo trading
                </Link>
              </li>
            </ul>
          </div>

          {/* Community + Services */}
          <div className="pl-8">
            <h3 className={`${sectionHeaderClass} mb-4`}>Community</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/tournaments" className={secondaryLinkClass}>
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/blog" className={secondaryLinkClass}>
                  Our blog
                </Link>
              </li>
            </ul>

            <h3 className={`${sectionHeaderClass} mt-6 mb-4`}>Services</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/help" className={secondaryLinkClass}>
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="/deposits-withdrawals"
                  className={secondaryLinkClass}
                >
                  Deposits & withdrawals
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForTradersDropdown;
