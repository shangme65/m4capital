"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is the minimum deposit?",
    answer:
      "The minimum deposit is $100 for a standard account. This may vary for different account types.",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    question: "How secure are my funds?",
    answer:
      "Your funds are held in segregated accounts with top-tier banks. We also use advanced encryption to protect your data.",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    question: "What are the trading fees?",
    answer:
      "We offer competitive spreads and low to zero commissions, depending on the account type and asset traded.",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    question: "How do I withdraw my money?",
    answer:
      "You can withdraw your funds at any time through the client portal. Withdrawals are typically processed within 24 hours.",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
];

const FAQItem = ({
  faq,
  index,
  isActive,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isActive: boolean;
  onToggle: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div
        className="relative rounded-xl p-[1px] overflow-hidden transition-all duration-300"
        style={{
          background:
            isHovered || isActive
              ? "linear-gradient(135deg, rgba(99, 102, 241, 0.3), transparent 50%, rgba(168, 85, 247, 0.3))"
              : "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 50%, rgba(255,255,255,0.03))",
        }}
      >
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1a1f35 100%)",
            boxShadow:
              isHovered || isActive
                ? "0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 0 20px -5px rgba(99, 102, 241, 0.2)"
                : "0 8px 20px -8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {/* Light reflection */}
          <div
            className="absolute top-0 left-0 right-0 h-12 opacity-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
            }}
          />

          {/* Question button */}
          <button
            onClick={onToggle}
            className="flex items-center gap-3 w-full text-left p-4 relative z-10"
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                  : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-700"
              }`}
              style={{
                boxShadow: isActive
                  ? "0 4px 12px -2px rgba(99, 102, 241, 0.4)"
                  : "none",
              }}
            >
              {faq.icon}
            </div>

            {/* Question text */}
            <span className="flex-1 text-sm font-medium text-white">
              {faq.question}
            </span>

            {/* Arrow */}
            <motion.div
              animate={{ rotate: isActive ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-gray-700/50 text-gray-400"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </button>

          {/* Answer */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0">
                  <div className="pl-11 text-gray-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 transform transition-transform duration-500 ${
                isActive ? "translate-x-0" : "-translate-x-full"
              }`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="relative bg-gray-100 dark:bg-gray-900 py-12 sm:py-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <svg
              className="w-3.5 h-3.5 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium text-indigo-400">FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Find answers to common questions about our platform
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isActive={activeIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
