import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap | M4Capital",
  description: "Site navigation and page directory for M4Capital",
};

export default function SitemapPage() {
  const pages = [
    { href: "/", title: "Home", description: "Welcome to M4Capital" },
    { href: "/about", title: "About Us", description: "Learn about our company and mission" },
    { href: "/contact", title: "Contact", description: "Get in touch with our team" },
    { href: "/download", title: "Download App", description: "Download our trading application" },
    { href: "/help", title: "Help Center", description: "Find answers to common questions" },
    { href: "/blog", title: "Blog", description: "Latest news and insights" },
    { href: "/news-feed", title: "News Feed", description: "Real-time market news" },
    { href: "/awards", title: "Awards", description: "Our achievements and recognition" },
    { href: "/press", title: "Press", description: "Media coverage and press releases" },
    { href: "/in-numbers", title: "M4Capital in Numbers", description: "Company statistics and metrics" },
    { href: "/trading-specifications", title: "Trading Specifications", description: "Trading terms and conditions" },
    { href: "/video-tutorials", title: "Video Tutorials", description: "Learn how to use our platform" },
    { href: "/margin-trading-basics", title: "Margin Trading Basics", description: "Introduction to margin trading" },
    { href: "/licenses-and-safeguards", title: "Licenses & Safeguards", description: "Our regulatory compliance" },
    { href: "/calendars", title: "Economic Calendar", description: "Important economic events" },
  ];

  const authPages = [
    { href: "/auth/signin", title: "Sign In", description: "Log into your account" },
    { href: "/auth/signup", title: "Sign Up", description: "Create a new account" },
  ];

  const dashboardPages = [
    { href: "/dashboard", title: "Dashboard", description: "Your trading dashboard" },
    { href: "/dashboard/portfolio", title: "Portfolio", description: "View your investment portfolio" },
    { href: "/dashboard/trade", title: "Trade", description: "Execute trades" },
    { href: "/dashboard/history", title: "History", description: "Transaction history" },
    { href: "/dashboard/p2p", title: "P2P Transfer", description: "Peer-to-peer transfers" },
    { href: "/dashboard/deposit", title: "Deposit", description: "Fund your account" },
    { href: "/dashboard/withdraw", title: "Withdraw", description: "Withdraw funds" },
    { href: "/dashboard/profile", title: "Profile", description: "Account settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-700 via-orange-800 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Sitemap</h1>
            <p className="text-orange-100 max-w-2xl mx-auto text-sm">
              Navigate through all the pages available on M4Capital. Find everything from trading tools 
              to educational resources and company information.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8">
        <div className="grid gap-12">
          {/* Main Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg"></div>
              Main Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group relative bg-gradient-to-br from-white to-orange-50 rounded-xl p-4 shadow-lg hover:shadow-2xl border border-orange-100 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                  style={{ perspective: '1000px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-base">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-snug mt-1">
                    {page.description}
                  </p>
                  <div className="mt-2 text-orange-500 text-xs font-semibold flex items-center gap-1">
                    Visit page <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Authentication Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              Authentication
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group relative bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-lg hover:shadow-2xl border border-blue-100 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                  style={{ perspective: '1000px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-snug mt-1">
                    {page.description}
                  </p>
                  <div className="mt-2 text-blue-500 text-xs font-semibold flex items-center gap-1">
                    Visit page <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Dashboard Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-lg"></div>
              Dashboard & Trading
            </h2>
            <p className="text-gray-700 mb-6 text-sm font-medium bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              Access requires authentication - sign in to use these features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group relative bg-gradient-to-br from-white to-green-50 rounded-xl p-4 shadow-lg hover:shadow-2xl border border-green-100 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                  style={{ perspective: '1000px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors text-base">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-snug mt-1">
                    {page.description}
                  </p>
                  <div className="mt-2 text-green-500 text-xs font-semibold flex items-center gap-1">
                    Visit page <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Footer */}
          <section className="border-t border-gray-300 pt-8">
            <div className="text-center">
              <p className="text-gray-600 mb-3 text-sm">
                Can't find what you're looking for?
              </p>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Visit our Help Center →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}