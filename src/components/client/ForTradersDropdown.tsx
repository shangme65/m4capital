"use client";
import Link from "next/link";

const ForTradersDropdown = () => {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max">
      <div className="bg-gray-800 text-white p-8 grid grid-cols-3 gap-x-16 rounded-lg shadow-2xl">
        <div>
          <h3 className="font-bold text-sm text-gray-400 mb-4 tracking-widest">
            MARKETS & ASSETS
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href="/crypto"
                className="hover:text-orange-500 font-semibold"
              >
                Crypto
              </Link>
            </li>
            <li>
              <Link
                href="/etfs"
                className="hover:text-orange-500 font-semibold"
              >
                ETFs
              </Link>
            </li>
            <li>
              <Link
                href="/commodities"
                className="hover:text-orange-500 font-semibold"
              >
                Commodities
              </Link>
            </li>
            <li>
              <Link
                href="/forex"
                className="hover:text-orange-500 font-semibold"
              >
                Forex
              </Link>
            </li>
            <li>
              <Link
                href="/indices"
                className="hover:text-orange-500 font-semibold"
              >
                Indices
              </Link>
            </li>
            <li>
              <Link
                href="/stocks"
                className="hover:text-orange-500 font-semibold"
              >
                Stocks
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-400 mb-4 tracking-widest">
            ANALYTICS
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/historical-quotes" className="hover:text-orange-500">
                Historical Quotes
              </Link>
            </li>
            <li>
              <Link href="/calendars" className="hover:text-orange-500">
                Calendars
              </Link>
            </li>
            <li>
              <Link
                href="/trading-specifications"
                className="hover:text-orange-500"
              >
                Trading specifications
              </Link>
            </li>
          </ul>
          <h3 className="font-bold text-sm text-gray-400 mt-6 mb-4 tracking-widest">
            EDUCATION
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/video-tutorials" className="hover:text-orange-500">
                Video tutorials
              </Link>
            </li>
            <li>
              <Link
                href="/margin-trading-basics"
                className="hover:text-orange-500"
              >
                The basics of margin trading
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-400 mb-4 tracking-widest">
            COMMUNITY
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/tournaments" className="hover:text-orange-500">
                Tournaments
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-orange-500">
                Our blog
              </Link>
            </li>
          </ul>
          <h3 className="font-bold text-sm text-gray-400 mt-6 mb-4 tracking-widest">
            SERVICES
          </h3>
          <ul className="space-y-3">
            <li>
              <Link href="/help" className="hover:text-orange-500">
                Help
              </Link>
            </li>
            <li>
              <Link
                href="/deposits-withdrawals"
                className="hover:text-orange-500"
              >
                Deposits & withdrawals
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForTradersDropdown;
