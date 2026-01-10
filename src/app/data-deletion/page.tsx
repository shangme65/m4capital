import React from "react";

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Data Deletion Instructions
          </h1>
          <p className="text-gray-400 text-lg">
            Exercise your right to be forgotten
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <p className="text-gray-300 leading-relaxed text-lg">
            If you wish to delete your account and personal data from M4Capital,
            please follow the steps below. We are committed to respecting your privacy
            rights and will process your request promptly.
          </p>
        </div>

        {/* Steps Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            How to Request Account Deletion
          </h2>
          <ol className="space-y-6">
            <li className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                1
              </span>
              <div className="flex-1">
                <p className="text-gray-300 text-lg leading-relaxed">
                  Email your request to{" "}
                  <a
                    href="mailto:support@m4capital.online"
                    className="text-orange-500 hover:text-orange-400 underline transition-colors font-semibold"
                  >
                    support@m4capital.online
                  </a>{" "}
                  from the email address associated with your account.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                2
              </span>
              <div className="flex-1">
                <p className="text-gray-300 text-lg leading-relaxed">
                  We will verify your identity and process your request within 7
                  business days. You will receive a confirmation email once the process
                  is initiated.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                3
              </span>
              <div className="flex-1">
                <p className="text-gray-300 text-lg leading-relaxed">
                  All personal data associated with your account will be permanently
                  deleted from our servers. This action is irreversible.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Important Information */}
        <div className="bg-orange-500/10 backdrop-blur-sm rounded-2xl py-6 px-4 mb-8 border border-orange-500/30 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-orange-500">
            Important Information
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg leading-relaxed flex-1">
                Account deletion is permanent and cannot be undone
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg leading-relaxed flex-1">
                All your portfolio data, transaction history, and settings will be removed
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300 text-lg leading-relaxed flex-1">
                Some data may be retained for legal compliance purposes for a limited time
              </span>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl py-6 px-4 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold mb-6 text-orange-500">
            Need Help?
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-4">
            If you have questions about the data deletion process or need assistance,
            please contact our support team:
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
