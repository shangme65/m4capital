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
  },
  {
    name: "Real-Time Analytics",
    description:
      "Access up-to-the-minute market data and powerful analytics tools.",
    icon: FaChartLine,
  },
  {
    name: "Blazing-Fast Execution",
    description:
      "Execute trades in milliseconds with our high-performance infrastructure.",
    icon: FaTachometerAlt,
  },
  {
    name: "Community Driven",
    description:
      "Join a thriving community of traders and share insights and strategies.",
    icon: FaUsers,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  return (
    <motion.div
      className="bg-white dark:bg-gray-900 py-16 sm:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          variants={itemVariants}
        >
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
            Trade Smarter
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to succeed in the market
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Our platform is designed from the ground up to provide you with the
            tools, speed, and security required for modern Forex trading.
          </p>
        </motion.div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <motion.dl
            className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                className="relative pl-16"
                variants={itemVariants}
              >
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </motion.div>
  );
}
