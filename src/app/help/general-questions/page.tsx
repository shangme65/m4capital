"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function GeneralQuestionsPage() {
  const [expandedSection, setExpandedSection] = useState<string>("general");

  const faqItems = [
    {
      question: "What are electronic wallets and how do I use them?",
      answer:
        "Electronic wallets are intermediaries through which you can withdraw your funds to a bank account. They are very fast, safe, efficient, and simple to use systems. Their use is similar, since they perform the same service for several countries. Currently, we work with NowPayments for crypto deposits, PIX for Brazilian Real, and various payment gateways. Their sites can be easily found through a quick Google search.",
    },
    {
      question: "Why do my friends have a bigger payout than me?",
      answer:
        "The circumstances of trading change depending on the period and the internal risk assessment and/or practices of the Company. As such, the Company reserves the right to decide and/or change the profitability percentage given to clients at any given time, depending on the business practice set by the Company.",
    },
    {
      question: "What is M4Capital?",
      answer:
        "M4Capital is a comprehensive trading platform that helps you start your journey as a trader. We offer a wide range of investment opportunities including stocks, cryptocurrencies, forex, commodities, and more. Our platform features advanced AI-powered analytics, real-time market data, and educational resources to help you make informed trading decisions.",
    },
    {
      question: "How much money can I make on the practice account?",
      answer:
        "You cannot profit from the trades you make on a practice account. On a practice account, you receive virtual funds and make virtual trades. It is designed for training purposes only. To trade with real money, you need to deposit funds into a real account.",
    },
    {
      question: "How much money can I make?",
      answer:
        "Your success depends on your skills and patience, the trading strategy you choose, and the amount you can invest. We recommend watching our training videos first, so you can make more thoughtful trades. Beginner traders can try out their skills and practice on a practice account.",
    },
    {
      question: "How do I switch between practice account and real account?",
      answer:
        "To switch between accounts, click on your balance in the upper-right corner of the dashboard. Make sure that you are in the trading room. The panel that opens displays all of your accounts: your real account and your practice account. Click on the account to make it active. Now you can use it to trade.",
    },
    {
      question: "How do I top up my practice account?",
      answer:
        "You can always top up your practice account for free if your balance drops below $10,000. You must first select this account. Then navigate to your account settings where you can reset your practice balance. A confirmation window will appear where you can restore your practice account balance.",
    },
    {
      question: "Do you have apps for PC, iOS or Android?",
      answer:
        "Sure, we do! Our platform is fully responsive and works seamlessly on all devices. For the best experience, you can access M4Capital through your web browser on any device. We also offer a Progressive Web App (PWA) that you can install on your mobile device for quick access. Simply visit our website and look for the install prompt on your browser.",
    },
    {
      question: "What is volatility?",
      answer:
        "To put it simply, volatility is how much the price changes. When volatility is low, there is little change on the chart and the asset may expire at the same level at which you opened the position. But when the chart shows high volatility, the level of the asset fluctuates rapidly.",
    },
    {
      question: "Do you provide trading loans?",
      answer:
        "No, we don't provide loans for trading. Thank you for your understanding!",
    },
    {
      question: "What is the minimum and maximum investment per trade?",
      answer:
        "The minimum investment amount can be found on our trading platform/website, subject to current trading conditions. The maximum amount you can invest varies depending on the asset and market conditions. For specific limits, please refer to our trading specifications or contact our support team.",
    },
    {
      question: "How do I verify my account?",
      answer:
        "Account verification is a simple process. Navigate to your account settings and click on the KYC verification section. You'll need to provide a government-issued ID and proof of address. Our team typically processes verification requests within 24-48 hours.",
    },
    {
      question: "What currencies does M4Capital support?",
      answer:
        "M4Capital supports multiple currencies including USD, EUR, GBP, BRL, and more. You can set your preferred currency in your account settings. All portfolio values and trading amounts will be displayed in your chosen currency with real-time conversion rates.",
    },
    {
      question: "Is my money safe with M4Capital?",
      answer:
        "Yes, we take security very seriously. We use industry-standard encryption, secure payment gateways, and follow best practices for data protection. Your funds are stored securely, and we implement multiple layers of security including two-factor authentication (2FA) to protect your account.",
    },
    {
      question: "Can I use M4Capital from any country?",
      answer:
        "M4Capital is available in most countries worldwide. However, due to regulatory requirements, some services may be restricted in certain jurisdictions. Please check our terms of service or contact our support team to confirm availability in your region.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/help"
            className="inline-flex items-center text-orange-500 hover:text-orange-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">M4</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">M4Capital</div>
                <div className="text-xs text-gray-400">
                  Ultimate trading experience
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/help"
              className="text-gray-400 hover:text-orange-500 transition-colors"
            >
              ← Back to Help
            </Link>
          </div>

          {/* General Questions Section */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {/* Section Header */}
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "general" ? "" : "general"
                )
              }
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <h1 className="text-xl font-semibold text-gray-700">
                General Questions
              </h1>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${
                  expandedSection === "general" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* FAQ Items */}
            {expandedSection === "general" && (
              <div className="px-6 py-6 space-y-8">
                {faqItems.map((item, index) => (
                  <div key={index}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      {item.question}
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {item.answer}
                    </p>
                    {index < faqItems.length - 1 && (
                      <div className="border-b-2 border-orange-500 w-24 mt-6"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Footer */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Found no answer?
            </h2>
            <p className="text-gray-300 mb-4">
              Log in to ask for support.
              <Link
                href="/dashboard"
                className="text-orange-500 hover:text-orange-400 ml-2 font-semibold"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
