"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileText,
  Scale,
  AlertTriangle,
  Lock,
  Users,
  Globe,
  CreditCard,
  Ban,
  RefreshCw,
  MessageSquare,
  Gavel,
  ChevronDown,
  Cookie,
  TrendingUp,
  Wallet,
  UserCheck,
  Gamepad2,
  Moon,
  MessageCircle,
  Bug,
  Ticket,
} from "lucide-react";

// Policy categories similar to IQ Option
const policyCategories = [
  { id: "terms", label: "Terms & Conditions", icon: FileText },
  { id: "privacy", label: "Privacy Policy", icon: Lock },
  { id: "fees", label: "General Fees", icon: CreditCard },
  { id: "withdrawal", label: "Withdrawal Policy", icon: Wallet },
  { id: "payment", label: "Payment Policy", icon: TrendingUp },
  { id: "aml", label: "AML & KYC Policy", icon: UserCheck },
  { id: "demo", label: "Demo & Tournament Accounts", icon: Gamepad2 },
  { id: "islamic", label: "Islamic (Swap-free) Account", icon: Moon },
  { id: "chat", label: "Chat Rules", icon: MessageCircle },
  { id: "risk", label: "Risk Disclosure", icon: AlertTriangle },
  { id: "order", label: "Order Execution Policy", icon: Scale },
  { id: "cookie", label: "Cookie Policy", icon: Cookie },
  { id: "margin", label: "Margin Trading Terms", icon: TrendingUp },
  { id: "vulnerability", label: "Vulnerability Disclosure", icon: Bug },
  { id: "promo", label: "Promo Code Policy", icon: Ticket },
];

// Content for each policy
const policyContent: Record<
  string,
  {
    title: string;
    sections: { title: string; content: string; icon: React.ElementType }[];
  }
> = {
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        title: "1. Acceptance of Terms",
        icon: FileText,
        content: `By accessing or using M4 Capital's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.

These Terms constitute a legally binding agreement between you and SKY LADDER LLC ("M4 Capital", "we", "us", or "our"). We reserve the right to modify these terms at any time.`,
      },
      {
        title: "2. Eligibility Requirements",
        icon: Users,
        content: `To use M4 Capital's services, you must:

• Be at least 18 years of age
• Have the legal capacity to enter into contracts
• Not be a resident of a restricted jurisdiction
• Provide accurate registration information
• Maintain the security of your account`,
      },
      {
        title: "3. Description of Services",
        icon: Globe,
        content: `M4 Capital provides:

• Cryptocurrency trading and investment services
• Portfolio management and tracking tools
• Market data, charts, and analytical tools
• Educational resources and market insights
• Peer-to-peer transfer capabilities`,
      },
      {
        title: "4. Account Security",
        icon: Lock,
        content: `You are responsible for:

• Maintaining credential confidentiality
• All activities under your account
• Notifying us of unauthorized access
• Using strong passwords and 2FA`,
      },
      {
        title: "5. Financial Terms",
        icon: CreditCard,
        content: `Deposits and Withdrawals:
• Subject to verification procedures
• Processing times vary by method
• Minimum and maximum limits apply

Trading:
• All trades are final once executed
• Prices are determined by real-time market data`,
      },
      {
        title: "6. Prohibited Activities",
        icon: Ban,
        content: `You agree not to:

• Use services for illegal purposes
• Engage in market manipulation or fraud
• Attempt unauthorized system access
• Use automated systems without authorization
• Engage in money laundering activities`,
      },
      {
        title: "7. Intellectual Property",
        icon: Shield,
        content: `All content on M4 Capital including logos, trademarks, software, and design are owned by SKY LADDER LLC and protected by international intellectual property laws.`,
      },
      {
        title: "8. Termination",
        icon: RefreshCw,
        content: `We may suspend or terminate your account if:

• You violate these Terms
• We suspect fraudulent activity
• Required by law
• Your account remains inactive`,
      },
      {
        title: "9. Limitation of Liability",
        icon: Scale,
        content: `M4 Capital shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed fees paid in the 12 months preceding the claim.`,
      },
      {
        title: "10. Dispute Resolution",
        icon: Gavel,
        content: `Disputes shall be resolved through good-faith negotiation, then binding arbitration. Governed by the laws of Antigua and Barbuda.`,
      },
      {
        title: "11. Contact Information",
        icon: MessageSquare,
        content: `SKY LADDER LLC
The Colony House, 41 Nevis Street
Saint John's, Antigua and Barbuda
Email: support@m4capital.com`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        title: "1. Information Collection",
        icon: Users,
        content: `We collect information you provide directly:

• Personal identification (name, email, phone)
• Financial information for transactions
• Identity verification documents
• Communication preferences`,
      },
      {
        title: "2. How We Use Information",
        icon: Globe,
        content: `Your information is used to:

• Provide and improve our services
• Process transactions and verify identity
• Communicate important updates
• Comply with legal obligations
• Prevent fraud and ensure security`,
      },
      {
        title: "3. Data Protection",
        icon: Shield,
        content: `We implement industry-standard security measures:

• Encryption of sensitive data
• Secure server infrastructure
• Regular security audits
• Access controls and monitoring`,
      },
      {
        title: "4. Your Rights",
        icon: Lock,
        content: `You have the right to:

• Access your personal data
• Request data correction or deletion
• Opt-out of marketing communications
• Request data portability`,
      },
    ],
  },
  fees: {
    title: "General Fees",
    sections: [
      {
        title: "1. Trading Fees",
        icon: TrendingUp,
        content: `• Spot trading: 0.1% - 0.5% per trade
• Crypto purchases: Variable based on payment method
• P2P transfers: Free within platform`,
      },
      {
        title: "2. Deposit Fees",
        icon: CreditCard,
        content: `• Bank transfer: Free
• Credit/Debit card: 2.5% - 3.5%
• Cryptocurrency: Network fees only
• PIX (Brazil): Free`,
      },
      {
        title: "3. Withdrawal Fees",
        icon: Wallet,
        content: `• Bank withdrawal: Varies by region
• Crypto withdrawal: Network fees apply
• Minimum withdrawal amounts apply
• Processing time: 1-5 business days`,
      },
    ],
  },
  withdrawal: {
    title: "Withdrawal Policy",
    sections: [
      {
        title: "1. Withdrawal Requirements",
        icon: UserCheck,
        content: `• Complete identity verification (KYC)
• Verify withdrawal address/account
• Meet minimum withdrawal amounts
• Ensure sufficient available balance`,
      },
      {
        title: "2. Processing Times",
        icon: RefreshCw,
        content: `• Cryptocurrency: 1-24 hours
• Bank transfer: 1-5 business days
• PIX (Brazil): Instant to 1 hour
• Review may extend processing time`,
      },
      {
        title: "3. Limits & Restrictions",
        icon: AlertTriangle,
        content: `• Daily/monthly limits based on verification level
• Higher limits available with enhanced verification
• Suspicious activity may trigger review
• We reserve the right to delay withdrawals for security`,
      },
    ],
  },
  payment: {
    title: "Payment Policy",
    sections: [
      {
        title: "1. Accepted Payment Methods",
        icon: CreditCard,
        content: `• Bank transfers (local and international)
• Credit/Debit cards (Visa, Mastercard)
• Cryptocurrency deposits
• PIX (Brazil)
• Other regional payment methods`,
      },
      {
        title: "2. Payment Processing",
        icon: RefreshCw,
        content: `• Payments processed by FIDELES LIMITED
• All transactions are encrypted
• Multi-currency support available
• Real-time exchange rates applied`,
      },
      {
        title: "3. Refund Policy",
        icon: Wallet,
        content: `• Crypto purchases are non-refundable
• Deposit errors reviewed case-by-case
• Refunds processed to original payment method
• Processing time varies by payment type`,
      },
    ],
  },
  aml: {
    title: "AML & KYC Policy",
    sections: [
      {
        title: "1. Know Your Customer (KYC)",
        icon: UserCheck,
        content: `Required documentation:

• Government-issued ID (passport, driver's license)
• Proof of address (utility bill, bank statement)
• Selfie verification
• Source of funds declaration (for large transactions)`,
      },
      {
        title: "2. Anti-Money Laundering",
        icon: Shield,
        content: `We implement strict AML procedures:

• Transaction monitoring
• Suspicious activity reporting
• PEP and sanctions screening
• Risk-based customer assessment`,
      },
      {
        title: "3. Compliance",
        icon: Scale,
        content: `• We comply with international AML regulations
• Cooperation with law enforcement when required
• Regular policy reviews and updates
• Staff training on AML procedures`,
      },
    ],
  },
  demo: {
    title: "Demo & Tournament Accounts",
    sections: [
      {
        title: "1. Demo Account",
        icon: Gamepad2,
        content: `• Virtual funds for practice trading
• Real market conditions simulated
• No real money at risk
• Available to all registered users`,
      },
      {
        title: "2. Trading Tournaments",
        icon: TrendingUp,
        content: `• Competitive trading events
• Prize pools for top performers
• Entry requirements may apply
• Results based on percentage gains`,
      },
      {
        title: "3. Terms of Use",
        icon: FileText,
        content: `• Demo accounts may be reset periodically
• Tournament rules vary by event
• Prizes subject to verification
• Abuse or manipulation prohibited`,
      },
    ],
  },
  islamic: {
    title: "Islamic (Swap-free) Account",
    sections: [
      {
        title: "1. Overview",
        icon: Moon,
        content: `Islamic accounts are designed to comply with Sharia law by:

• No overnight interest (swap) charges
• No interest on leveraged positions
• Halal trading environment`,
      },
      {
        title: "2. Eligibility",
        icon: UserCheck,
        content: `• Available upon request
• Verification of Islamic account need
• Subject to approval
• May have different fee structure`,
      },
      {
        title: "3. Terms",
        icon: FileText,
        content: `• Some instruments may not be available
• Account may revert if misused
• Regular review of account status
• Compliance monitoring`,
      },
    ],
  },
  chat: {
    title: "Chat Rules",
    sections: [
      {
        title: "1. Community Guidelines",
        icon: MessageCircle,
        content: `• Be respectful to all users
• No spam or promotional content
• No harassment or hate speech
• Keep discussions relevant`,
      },
      {
        title: "2. Prohibited Content",
        icon: Ban,
        content: `• Financial advice or guarantees
• Misleading information
• Personal attacks
• Illegal activity promotion`,
      },
      {
        title: "3. Moderation",
        icon: Shield,
        content: `• Messages may be monitored
• Violations result in warnings or bans
• Appeals can be submitted to support
• Repeated violations lead to account action`,
      },
    ],
  },
  risk: {
    title: "Risk Disclosure",
    sections: [
      {
        title: "1. Trading Risks",
        icon: AlertTriangle,
        content: `IMPORTANT: Trading cryptocurrencies involves substantial risk:

• High volatility can result in significant losses
• You may lose your entire investment
• Past performance doesn't guarantee future results
• Only invest what you can afford to lose`,
      },
      {
        title: "2. Market Risks",
        icon: TrendingUp,
        content: `• Market manipulation can occur
• Liquidity may vary by asset
• Regulatory changes may affect trading
• Technical issues can impact execution`,
      },
      {
        title: "3. Your Responsibility",
        icon: Users,
        content: `• Seek independent financial advice
• Understand products before trading
• Monitor your positions regularly
• Use risk management tools`,
      },
    ],
  },
  order: {
    title: "Order Execution Policy",
    sections: [
      {
        title: "1. Execution Principles",
        icon: Scale,
        content: `• Best execution for client orders
• Fair and transparent pricing
• Timely order execution
• Clear order confirmation`,
      },
      {
        title: "2. Order Types",
        icon: TrendingUp,
        content: `• Market orders: Execute at current price
• Limit orders: Execute at specified price or better
• Stop orders: Trigger at specified price
• All orders subject to available liquidity`,
      },
      {
        title: "3. Execution Venue",
        icon: Globe,
        content: `• Orders executed on connected exchanges
• Best available price sought
• Slippage may occur in volatile markets
• Order routing optimized for execution`,
      },
    ],
  },
  cookie: {
    title: "Cookie Policy",
    sections: [
      {
        title: "1. What Are Cookies",
        icon: Cookie,
        content: `Cookies are small text files stored on your device that help us:

• Remember your preferences
• Understand how you use our site
• Improve your experience
• Provide security features`,
      },
      {
        title: "2. Types of Cookies",
        icon: FileText,
        content: `• Essential: Required for site function
• Analytics: Help us understand usage
• Functional: Remember your preferences
• Marketing: Used for relevant ads`,
      },
      {
        title: "3. Managing Cookies",
        icon: Lock,
        content: `• Control cookies in browser settings
• Essential cookies cannot be disabled
• Disabling cookies may affect functionality
• Third-party cookie policies apply`,
      },
    ],
  },
  margin: {
    title: "Margin Trading Terms",
    sections: [
      {
        title: "1. Margin Trading Overview",
        icon: TrendingUp,
        content: `Margin trading allows you to:

• Trade with borrowed funds
• Amplify potential gains and losses
• Access leverage up to specified limits
• Maintain minimum margin requirements`,
      },
      {
        title: "2. Risks of Margin Trading",
        icon: AlertTriangle,
        content: `• Losses can exceed your deposit
• Margin calls may require immediate action
• Positions may be liquidated automatically
• Not suitable for all investors`,
      },
      {
        title: "3. Margin Requirements",
        icon: Scale,
        content: `• Initial margin required to open position
• Maintenance margin must be maintained
• Margin levels vary by asset
• Changes may occur based on volatility`,
      },
    ],
  },
  vulnerability: {
    title: "Vulnerability Disclosure Policy",
    sections: [
      {
        title: "1. Reporting Security Issues",
        icon: Bug,
        content: `If you discover a security vulnerability:

• Report to security@m4capital.com
• Include detailed description
• Do not exploit the vulnerability
• Allow reasonable time for resolution`,
      },
      {
        title: "2. Our Commitment",
        icon: Shield,
        content: `• We take all reports seriously
• Investigate promptly and thoroughly
• Keep reporters informed
• Credit researchers (if desired)`,
      },
      {
        title: "3. Safe Harbor",
        icon: Scale,
        content: `• Good faith researchers protected
• No legal action for responsible disclosure
• Cooperation appreciated and recognized
• Bug bounty program may apply`,
      },
    ],
  },
  promo: {
    title: "Promo Code Policy",
    sections: [
      {
        title: "1. Using Promo Codes",
        icon: Ticket,
        content: `• Enter code during signup or deposit
• One code per account/transaction
• Codes may have expiration dates
• Cannot be combined with other offers`,
      },
      {
        title: "2. Bonus Terms",
        icon: CreditCard,
        content: `• Bonuses may have trading requirements
• Withdrawal conditions apply
• Abuse results in bonus cancellation
• Terms vary by promotion`,
      },
      {
        title: "3. Restrictions",
        icon: Ban,
        content: `• Codes non-transferable
• Duplicate accounts prohibited
• We reserve right to modify terms
• Decisions on eligibility are final`,
      },
    ],
  },
};

const TermsOfServicePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("terms");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const currentPolicy = policyContent[selectedCategory];
  const currentCategoryInfo = policyCategories.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 pt-16">
        {/* Compact Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />

          <div className="relative max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                Terms of{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Service
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto px-2">
                Please read these terms carefully before using M4 Capital's
                services.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Last updated: December 10, 2025
              </p>
            </motion.div>
          </div>
        </div>

        {/* Policy Category Selector - Dropdown Style */}
        <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-6">
          {/* Category Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2.5">
                {currentCategoryInfo && (
                  <currentCategoryInfo.icon className="w-4 h-4 text-orange-400" />
                )}
                <span className="text-sm sm:text-base font-medium text-white">
                  {currentCategoryInfo?.label || "Select Policy"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto"
                >
                  {policyCategories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowCategoryDropdown(false);
                          setExpandedSection(null);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors border-b border-gray-700/50 last:border-0 ${
                          isSelected
                            ? "bg-orange-500/10 text-orange-400"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {category.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content Sections - Accordion Style */}
        <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-12">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {currentPolicy?.sections.map((section, index) => {
              const Icon = section.icon;
              const isExpanded =
                expandedSection === `${selectedCategory}-${index}`;
              const sectionId = `${selectedCategory}-${index}`;

              return (
                <motion.div
                  key={sectionId}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="bg-gray-800/60 border border-gray-700/50 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedSection(isExpanded ? null : sectionId)
                    }
                    className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-orange-500/10 flex items-center justify-center">
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-white">
                        {section.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                          <div className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Agreement Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-3 sm:p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg"
          >
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-white mb-1">
                  Your Agreement
                </p>
                <p className="text-xs text-gray-400">
                  By using M4 Capital, you confirm that you have read,
                  understood, and agree to be bound by these Terms of Service
                  and all applicable policies.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  );
};

export default TermsOfServicePage;
