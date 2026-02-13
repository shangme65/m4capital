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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sitemap</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Navigate through all the pages available on M4Capital. Find everything from trading tools 
              to educational resources and company information.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12">
          {/* Main Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-orange-500 rounded"></div>
              Main Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-200 transition-all duration-200"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 mb-2">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {page.description}
                  </p>
                  <div className="mt-3 text-orange-500 text-sm font-medium">
                    Visit page →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Authentication Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-500 rounded"></div>
              Authentication
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {page.description}
                  </p>
                  <div className="mt-3 text-blue-500 text-sm font-medium">
                    Visit page →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Dashboard Pages */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-green-500 rounded"></div>
              Dashboard & Trading
            </h2>
            <p className="text-gray-600 mb-6">
              Access requires authentication - sign in to use these features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-200 transition-all duration-200"
                >
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 mb-2">
                    {page.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {page.description}
                  </p>
                  <div className="mt-3 text-green-500 text-sm font-medium">
                    Visit page →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Footer */}
          <section className="border-t border-gray-200 pt-8">
            <div className="text-center text-gray-500">
              <p className="mb-2">
                Can't find what you're looking for?
              </p>
              <Link
                href="/help"
                className="text-orange-500 hover:text-orange-600 font-medium"
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