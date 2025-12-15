"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Bitcoin,
  Banknote,
  Globe,
  HelpCircle,
} from "lucide-react";

const depositMethods = [
  {
    name: "Cryptocurrency",
    icon: <Bitcoin className="w-6 h-6" />,
    minDeposit: "$10",
    processingTime: "10-60 minutes",
    fees: "Network fees only",
    supported: [
      "Bitcoin (BTC)",
      "Ethereum (ETH)",
      "USDT",
      "USDC",
      "And more...",
    ],
  },
  {
    name: "PIX (Brazil)",
    icon: <Banknote className="w-6 h-6" />,
    minDeposit: "R$50",
    processingTime: "Instant",
    fees: "Free",
    supported: ["Brazilian Real (BRL)"],
  },
  {
    name: "Bank Transfer",
    icon: <CreditCard className="w-6 h-6" />,
    minDeposit: "$100",
    processingTime: "1-3 business days",
    fees: "Varies by bank",
    supported: ["USD", "EUR", "GBP", "And more..."],
  },
];

const withdrawalMethods = [
  {
    name: "Cryptocurrency",
    icon: <Bitcoin className="w-6 h-6" />,
    minWithdrawal: "$20",
    processingTime: "Within 24 hours",
    fees: "Network fees + small processing fee",
  },
  {
    name: "PIX (Brazil)",
    icon: <Banknote className="w-6 h-6" />,
    minWithdrawal: "R$100",
    processingTime: "Instant to 24 hours",
    fees: "Free for verified accounts",
  },
  {
    name: "Bank Transfer",
    icon: <CreditCard className="w-6 h-6" />,
    minWithdrawal: "$200",
    processingTime: "3-5 business days",
    fees: "Varies by destination",
  },
];

const faqs = [
  {
    question: "How long do deposits take?",
    answer:
      "Cryptocurrency deposits are typically confirmed within 10-60 minutes depending on network congestion. PIX deposits are instant. Bank transfers may take 1-3 business days.",
  },
  {
    question: "What are the deposit limits?",
    answer:
      "Deposit limits vary based on your account verification level. Basic accounts have daily limits while fully verified accounts enjoy higher limits. Check your account settings for your specific limits.",
  },
  {
    question: "How do I withdraw funds?",
    answer:
      "Navigate to Finance > Withdraw in your dashboard. Select your preferred withdrawal method, enter the amount, and confirm. For security, withdrawals may require email or 2FA verification.",
  },
  {
    question: "Are there any fees?",
    answer:
      "Deposit fees vary by method - crypto deposits only incur network fees. Withdrawals may have small processing fees depending on the method and amount. All fees are clearly displayed before confirming any transaction.",
  },
  {
    question: "What if my deposit doesn't arrive?",
    answer:
      "If your deposit hasn't arrived within the expected timeframe, please contact our support team with your transaction details. For crypto deposits, ensure you sent to the correct address and the transaction has sufficient confirmations.",
  },
];

export default function DepositsWithdrawalsPage() {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">(
    "deposits"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Deposits & Withdrawals
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Multiple secure payment methods to fund your account and withdraw
            your profits. Fast, reliable, and transparent.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        {/* Tab Buttons */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-800/50 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab("deposits")}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "deposits"
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Deposits
            </button>
            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "withdrawals"
                  ? "bg-orange-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Withdrawals
            </button>
          </div>
        </div>

        {/* Deposits Section */}
        {activeTab === "deposits" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {depositMethods.map((method) => (
                <div
                  key={method.name}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                      {method.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {method.name}
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Minimum:</span>
                      <span className="text-white font-medium">
                        {method.minDeposit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Processing:</span>
                      <span className="text-white font-medium">
                        {method.processingTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fees:</span>
                      <span className="text-green-400 font-medium">
                        {method.fees}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <span className="text-gray-400 text-xs">Supported:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {method.supported.map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Important Notes */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Important Information
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  Always double-check the deposit address before sending
                  cryptocurrency
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  Deposits are credited after network confirmations are complete
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  Verify your account to unlock higher deposit limits
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Withdrawals Section */}
        {activeTab === "withdrawals" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {withdrawalMethods.map((method) => (
                <div
                  key={method.name}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                      {method.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {method.name}
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Minimum:</span>
                      <span className="text-white font-medium">
                        {method.minWithdrawal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Processing:</span>
                      <span className="text-white font-medium">
                        {method.processingTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fees:</span>
                      <span className="text-orange-400 font-medium">
                        {method.fees}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Withdrawal Requirements */}
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Withdrawal Requirements
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  Email verification and 2FA may be required for withdrawals
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  KYC verification required for withdrawals above certain limits
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                  Withdrawal requests are processed within 24 hours (business
                  days)
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-white hover:bg-gray-700/30 transition-colors"
                >
                  <span className="font-medium">{faq.question}</span>
                  <HelpCircle
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-400 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Ready to get started?</p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            <Wallet className="w-5 h-5" />
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
