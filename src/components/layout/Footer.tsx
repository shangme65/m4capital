import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Markets & Assets */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              MARKETS & ASSETS
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/news-feed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  News feed
                </a>
              </li>
              <li>
                <a
                  href="/assets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Assets
                </a>
              </li>
              <li>
                <a
                  href="/stock-collections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Stock collections
                </a>
              </li>
              <li>
                <a
                  href="/industries"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Industries
                </a>
              </li>
            </ul>
          </div>

          {/* Analytics & Tools */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              ANALYTICS & TOOLS
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/historical-quotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Historical quotes
                </a>
              </li>
              <li>
                <a
                  href="/calendars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Calendars
                </a>
              </li>
              <li>
                <a
                  href="/trading-specifications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Trading specifications
                </a>
              </li>
            </ul>
          </div>

          {/* Education & Learning */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              EDUCATION & LEARNING
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/video-tutorials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Video tutorials
                </a>
              </li>
              <li>
                <a
                  href="/margin-trading-basics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  The basics of margin trading
                </a>
              </li>
            </ul>
          </div>

          {/* Events & Community */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              EVENTS & COMMUNITY
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Our blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* About Us */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              ABOUT US
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/in-numbers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  In Numbers
                </a>
              </li>
              <li>
                <a
                  href="/press"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  In the Press
                </a>
              </li>
              <li>
                <a
                  href="/awards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Awards
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/sitemap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Sitemap
                </a>
              </li>
              <li>
                <a
                  href="/licenses-and-safeguards"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Licenses and Safeguards
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Services */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
              SUPPORT & SERVICES
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Download app
                </a>
              </li>
              <li>
                <a
                  href="/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Help
                </a>
              </li>
              <li>
                <a
                  href="/deposits-withdrawals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Deposits & withdrawals
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-orange-500 font-medium text-sm"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
          <a
            href="https://instagram.com/m4capital"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://twitter.com/m4capital"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (ex. Twitter)</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://facebook.com/m4capital"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
          <a
            href="https://youtube.com/m4capital"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white hover:text-orange-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span>Youtube</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7v10"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Risk Warning & Legal Section */}
      <div className="py-6 px-4 mt-6">
        <div className="container mx-auto max-w-6xl">
          {/* AI Bot Help */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-400 text-sm">Got questions?</span>
            <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5">
              <span className="text-white text-sm font-medium">
                AI Bot will help
              </span>
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="space-y-3">
            <h4 className="text-orange-500 font-bold text-sm">Risk Warning</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              The Financial Products offered by the company include Contracts
              for Difference (&apos;CFDs&apos;) and other complex financial
              products. Trading CFDs carries a high level of risk since leverage
              can work both to your advantage and disadvantage. As a result,
              CFDs may not be suitable for all investors because it is possible
              to lose all of your invested capital. You should never invest
              money that you cannot afford to lose. Before trading in the
              complex financial products offered, please ensure to understand
              the risks involved.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              You are granted limited non-exclusive non-transferable rights to
              use the IP provided on this website for personal and
              non-commercial purposes in relation to the services offered on the
              Website only.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed">
              The information on this website is not directed at residents of
              certain jurisdictions, including, without limitation, EU/EEA
              member states, and is not intended for distribution to any person
              in any country or jurisdiction where such distribution or use
              would be contrary to local law or regulation.
            </p>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-gray-800 pt-4 mt-6 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} M4Capital. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
