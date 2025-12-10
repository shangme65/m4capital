"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
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
} from "lucide-react";

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: `By accessing or using M4 Capital's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

These Terms constitute a legally binding agreement between you and SKY LADDER LLC ("M4 Capital", "we", "us", or "our"). We reserve the right to modify these terms at any time, and your continued use of our services constitutes acceptance of any changes.`,
  },
  {
    id: "eligibility",
    icon: Users,
    title: "2. Eligibility Requirements",
    content: `To use M4 Capital's services, you must:

• Be at least 18 years of age or the legal age of majority in your jurisdiction
• Have the legal capacity to enter into binding contracts
• Not be a resident of a restricted jurisdiction where our services are prohibited
• Provide accurate and complete registration information
• Maintain the security of your account credentials

We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.`,
  },
  {
    id: "services",
    icon: Globe,
    title: "3. Description of Services",
    content: `M4 Capital provides a digital platform for:

• Cryptocurrency trading and investment services
• Portfolio management and tracking tools
• Market data, charts, and analytical tools
• Educational resources and market insights
• Peer-to-peer transfer capabilities within the platform

Our services are provided "as is" and "as available" without any warranties of any kind, either express or implied.`,
  },
  {
    id: "accounts",
    icon: Lock,
    title: "4. Account Security",
    content: `You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Immediately notifying us of any unauthorized access or security breaches
• Using strong passwords and enabling two-factor authentication when available

M4 Capital will never ask for your password via email, phone, or any other means. We employ industry-standard security measures but cannot guarantee absolute security.`,
  },
  {
    id: "financial",
    icon: CreditCard,
    title: "5. Financial Terms",
    content: `Deposits and Withdrawals:
• All deposits and withdrawals are subject to verification procedures
• Processing times may vary based on payment method and verification status
• Minimum and maximum limits apply to all transactions
• We reserve the right to charge fees for certain services

Trading:
• All trades are final once executed
• Prices are determined by real-time market data
• Spreads and fees vary based on market conditions and asset type
• Leverage trading carries significant risk of loss`,
  },
  {
    id: "risks",
    icon: AlertTriangle,
    title: "6. Risk Disclosure",
    content: `IMPORTANT: Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors.

• The value of cryptocurrencies can be highly volatile
• You may lose some or all of your invested capital
• Past performance is not indicative of future results
• You should only invest money you can afford to lose
• We strongly recommend seeking independent financial advice

By using our services, you acknowledge that you understand and accept these risks.`,
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "7. Prohibited Activities",
    content: `You agree not to:

• Use our services for any illegal or unauthorized purpose
• Engage in market manipulation, fraud, or deceptive practices
• Attempt to gain unauthorized access to our systems or other users' accounts
• Interfere with or disrupt our services or servers
• Use automated systems, bots, or scripts without authorization
• Violate any applicable laws, regulations, or third-party rights
• Engage in money laundering or terrorist financing activities
• Create multiple accounts or provide false information`,
  },
  {
    id: "intellectual",
    icon: Shield,
    title: "8. Intellectual Property",
    content: `All content, features, and functionality on M4 Capital, including but not limited to:

• Logos, trademarks, and service marks
• Software, algorithms, and source code
• Text, graphics, images, and videos
• User interface design and layout

Are owned by SKY LADDER LLC or its licensors and are protected by international copyright, trademark, and other intellectual property laws. Unauthorized use is strictly prohibited.`,
  },
  {
    id: "termination",
    icon: RefreshCw,
    title: "9. Termination",
    content: `We may suspend or terminate your account at any time if:

• You violate these Terms of Service
• We suspect fraudulent, illegal, or suspicious activity
• Required by law or regulatory authority
• You provide false or misleading information
• Your account remains inactive for an extended period

Upon termination, you remain liable for all outstanding obligations. We may retain certain information as required by law or for legitimate business purposes.`,
  },
  {
    id: "liability",
    icon: Scale,
    title: "10. Limitation of Liability",
    content: `To the maximum extent permitted by law:

• M4 Capital shall not be liable for any indirect, incidental, special, consequential, or punitive damages
• Our total liability shall not exceed the amount of fees paid by you in the 12 months preceding the claim
• We are not responsible for losses due to market volatility, system failures, or force majeure events
• We make no guarantees regarding the accuracy of market data or third-party information

Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of the above may not apply to you.`,
  },
  {
    id: "disputes",
    icon: Gavel,
    title: "11. Dispute Resolution",
    content: `Any disputes arising from these Terms or your use of our services shall be:

• First attempted to be resolved through good-faith negotiation
• Subject to binding arbitration if negotiation fails
• Governed by the laws of Antigua and Barbuda
• Brought in the courts of Saint John's, Antigua and Barbuda

You agree to waive any right to a jury trial or to participate in a class action lawsuit.`,
  },
  {
    id: "contact",
    icon: MessageSquare,
    title: "12. Contact Information",
    content: `For questions about these Terms of Service, please contact us:

SKY LADDER LLC
The Colony House, 41 Nevis Street
Saint John's, Antigua and Barbuda

Email: support@m4capital.com

Payment transactions are managed by:
FIDELES LIMITED
Registration No. HE 406368
Kyriakou Matsi & Anexartisias 3, ROUSSOS LIMASSOL TOWER
4th Floor, 3040 Limassol, Cyprus`,
  },
];

const TermsOfServicePage = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 pt-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Terms of{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Service
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Please read these terms carefully before using M4 Capital's
                services. Your access to and use of our platform is conditioned
                on your acceptance of these terms.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Last updated: December 10, 2025
              </p>
            </motion.div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="sticky top-16 z-40 bg-gray-900/80 backdrop-blur-xl border-y border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              {sections.slice(0, 6).map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-orange-400 bg-gray-800/50 hover:bg-gray-800 rounded-full transition-all"
                >
                  {section.title.split(". ")[1]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative p-6 sm:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center border border-orange-500/20">
                          <Icon className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                            {section.title}
                          </h2>
                          <div className="prose prose-invert prose-gray max-w-none">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                              {section.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Agreement Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
              <div>
                <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Your Agreement
                </h3>
                <p className="text-gray-400 max-w-md">
                  By using M4 Capital, you confirm that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfServicePage;
