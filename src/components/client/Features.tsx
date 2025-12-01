"use client";
import {
  FaShieldAlt,
  FaTachometerAlt,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
  {
    name: "Secure Transactions",
    description:
      "Your funds and data are protected by industry-leading security protocols.",
    icon: FaShieldAlt,
    gradient: "from-indigo-600 to-purple-600",
  },
  {
    name: "Real-Time Analytics",
    description:
      "Access up-to-the-minute market data and powerful analytics tools.",
    icon: FaChartLine,
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Blazing-Fast Execution",
    description:
      "Execute trades in milliseconds with our high-performance infrastructure.",
    icon: FaTachometerAlt,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    name: "Community Driven",
    description:
      "Join a thriving community of traders and share insights and strategies.",
    icon: FaUsers,
    gradient: "from-blue-500 to-cyan-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
    },
  },
};

export default function Features() {
  return (
    <motion.div
      className="bg-white dark:bg-gray-900 py-10 sm:py-14"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-8"
          variants={itemVariants}
        >
          <h2 className="text-sm font-semibold leading-6 text-orange-500">
            Trade Smarter
          </h2>
          <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Everything you need to succeed in the market
          </p>
          <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
            Our platform is designed from the ground up to provide you with the
            tools, speed, and security required for modern Forex trading.
          </p>
        </motion.div>
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                className="group relative rounded-xl p-5 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)",
                  boxShadow:
                    "0 10px 40px -10px rgba(0, 0, 0, 0.7), 0 4px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow:
                    "0 20px 60px -15px rgba(249, 115, 22, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* 3D Shine Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Glow Border on Hover */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(249, 115, 22, 0.2) 0%, transparent 50%, rgba(249, 115, 22, 0.1) 100%)",
                  }}
                />

                {/* Content - Icon and Title on same row */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:scale-110 transition-all duration-300`}
                      style={{
                        boxShadow:
                          "0 8px 20px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <feature.icon
                        className="h-6 w-6 text-white drop-shadow-lg"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                      {feature.name}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-400 group-hover:text-gray-300 transition-colors duration-300 pl-16">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
