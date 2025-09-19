"use client";
import React from "react";
import { motion } from "framer-motion";
import AnimatedButton from "./AnimatedButton";

const articles = [
  {
    title: "Market Analysis: The Week Ahead",
    date: "September 20, 2025",
    excerpt:
      "A look at the key economic events and market-moving news to watch for in the coming week.",
    link: "/blog/market-analysis-week-ahead",
  },
  {
    title: "Understanding Leverage in Forex Trading",
    date: "September 18, 2025",
    excerpt:
      "A deep dive into how leverage works and how to use it responsibly in your trading strategy.",
    link: "/blog/understanding-leverage",
  },
  {
    title: "Top 5 Technical Indicators for Day Trading",
    date: "September 15, 2025",
    excerpt:
      "Discover the most effective technical indicators that successful day traders use to make decisions.",
    link: "/blog/top-5-indicators",
  },
];

const MarketNews = () => {
  return (
    <div className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            Market Insights
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stay Ahead of the Curve
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            The latest news, analysis, and educational content from our team of
            experts.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.div
              key={article.title}
              className="flex flex-col p-8 bg-gray-900 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <h3 className="text-xl font-semibold text-white">
                {article.title}
              </h3>
              <p className="text-sm text-gray-400 mt-2">{article.date}</p>
              <p className="mt-4 text-gray-300 flex-grow">{article.excerpt}</p>
              <div className="mt-6">
                <a
                  href={article.link}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Read More &rarr;
                </a>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <AnimatedButton href="/blog" text="Visit Our Blog" />
        </div>
      </div>
    </div>
  );
};

export default MarketNews;
