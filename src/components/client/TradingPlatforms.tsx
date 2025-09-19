"use client";
import React from "react";
import { motion } from "framer-motion";
import AnimatedButton from "./AnimatedButton";

const platforms = [
  {
    name: "Web Trader",
    description:
      "Our powerful web-based platform with advanced charting and one-click trading.",
    icon: "🌐",
    link: "/login",
  },
  {
    name: "Mobile App",
    description:
      "Trade on the go with our full-featured mobile app for iOS and Android.",
    icon: "📱",
    link: "/download",
  },
  {
    name: "Desktop App",
    description:
      "The ultimate trading experience with our downloadable desktop platform.",
    icon: "💻",
    link: "/download",
  },
];

const TradingPlatforms = () => {
  return (
    <div className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            Our Platforms
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trade Anytime, Anywhere
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Access the markets with our suite of powerful and intuitive trading
            platforms.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              className="flex flex-col items-center text-center p-8 bg-gray-900 rounded-lg shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="text-5xl mb-4">{platform.icon}</div>
              <h3 className="text-2xl font-semibold text-white">
                {platform.name}
              </h3>
              <p className="mt-4 text-gray-300 flex-grow">
                {platform.description}
              </p>
              <div className="mt-8">
                <AnimatedButton href={platform.link} text="Launch" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingPlatforms;
