import React from "react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: January 9, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <p className="text-gray-300 leading-relaxed text-lg">
            This Privacy Policy explains how M4Capital collects, uses, and protects
            your information when you use our platform. We are committed to maintaining
            the privacy and security of your personal information.
          </p>
        </div>

        {/* Section: Information We Collect */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            Information We Collect
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                <strong className="text-white">Personal Information:</strong> Email address, name, and profile information (when you sign up or log in)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                <strong className="text-white">Usage Data:</strong> Analytics and interaction data to improve our services
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                <strong className="text-white">Financial Data:</strong> Transaction history and portfolio information
              </span>
            </li>
          </ul>
        </div>

        {/* Section: How We Use Your Information */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            How We Use Your Information
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                To provide and improve our services and platform features
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                To authenticate users and secure accounts from unauthorized access
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                To process transactions and maintain accurate financial records
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">
                To comply with legal obligations and regulatory requirements
              </span>
            </li>
          </ul>
        </div>

        {/* Section: Data Protection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            Data Protection
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            We use industry-standard security measures to protect your data, including
            encryption, secure servers, and regular security audits.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg">
            <strong className="text-white">We do not sell</strong> your personal information to third parties.
            Your data is used solely for the purposes outlined in this policy.
          </p>
        </div>

        {/* Section: Your Rights */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            Your Rights
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            You have the right to:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">Access your personal data</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">Request correction of inaccurate data</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">Request deletion of your personal data</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg">Object to processing of your data</span>
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed text-lg">
            See our{" "}
            <a href="/data-deletion" className="text-orange-500 hover:text-orange-400 underline transition-colors font-semibold">
              Data Deletion page
            </a>{" "}
            for detailed instructions on exercising your rights.
          </p>
        </div>

        {/* Section: Contact */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            Contact Us
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            If you have any questions about this Privacy Policy or wish to exercise your rights,
            please contact us:
          </p>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <a
              href="mailto:support@m4capital.online"
              className="text-orange-500 hover:text-orange-400 text-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@m4capital.online
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
