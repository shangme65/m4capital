"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { SiTrustpilot } from "react-icons/si";
import { VscVerifiedFilled } from "react-icons/vsc";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "This platform has completely changed the way I trade. The insights and tools are top-notch.",
    author: "Liam Johnson",
    title: "Full-time Trader",
    country: "USA",
    rating: 5,
    image: "/avatars/avatar-1.jpg",
  },
  {
    quote:
      "An essential tool for any serious forex trader. The real-time data is incredibly accurate.",
    author: "Sophie Müller",
    title: "Financial Analyst",
    country: "Germany",
    rating: 5,
    image: "/avatars/avatar-2.jpg",
  },
  {
    quote:
      "I've seen a significant improvement in my trading performance since I started using this service.",
    author: "Kenji Tanaka",
    title: "Hobbyist Investor",
    country: "Japan",
    rating: 4,
    image: "/avatars/avatar-3.jpg",
  },
  {
    quote:
      "The user interface is so intuitive. I was able to get started in minutes.",
    author: "Olivia Smith",
    title: "Beginner Trader",
    country: "United Kingdom",
    rating: 5,
    image: "/avatars/avatar-4.jpg",
  },
  {
    quote:
      "Customer support is fantastic. They are always quick to respond and very helpful.",
    author: "Lucas Costa",
    title: "Portfolio Manager",
    country: "Brazil",
    rating: 5,
    image: "/avatars/avatar-5.jpg",
  },
  {
    quote: "The low latency execution has saved me a lot of money on slippage.",
    author: "Noah Tremblay",
    title: "Day Trader",
    country: "Canada",
    rating: 5,
    image: "/avatars/avatar-6.jpg",
  },
  {
    quote:
      "I love the community features. It's great to be able to share strategies with other traders.",
    author: "Priya Sharma",
    title: "Social Trader",
    country: "India",
    rating: 4,
    image: "/avatars/avatar-7.jpg",
  },
  {
    quote:
      "The analytics are powerful yet easy to understand. A game-changer for my strategy.",
    author: "David Okoro",
    title: "Technical Analyst",
    country: "Nigeria",
    rating: 5,
    image: "/avatars/avatar-8.jpg",
  },
  {
    quote:
      "Secure, fast, and reliable. Everything I need in a trading platform.",
    author: "Chloe Williams",
    title: "Long-term Investor",
    country: "Australia",
    rating: 5,
    image: "/avatars/avatar-9.jpg",
  },
  {
    quote:
      "The mobile app is just as powerful as the desktop version. I can trade on the go.",
    author: "Mateo Garcia",
    title: "Remote Trader",
    country: "Mexico",
    rating: 4,
    image: "/avatars/avatar-10.jpg",
  },
  {
    quote: "Finally, a platform that puts the user first. Highly recommended.",
    author: "Léa Dubois",
    title: "Financial Advisor",
    country: "France",
    rating: 5,
    image: "/avatars/avatar-11.jpg",
  },
  {
    quote:
      "The educational resources helped me get up to speed with advanced trading concepts.",
    author: "Min-jun Kim",
    title: "New Investor",
    country: "South Korea",
    rating: 5,
    image: "/avatars/avatar-12.jpg",
  },
  {
    quote:
      "I've tried many platforms, and this is by far the best. The execution speed is unmatched.",
    author: "Sofia Rossi",
    title: "Scalper",
    country: "Italy",
    rating: 5,
    image: "/avatars/avatar-13.jpg",
  },
  {
    quote: "The variety of available currency pairs is impressive.",
    author: "Carlos Fernández",
    title: "Global Macro Trader",
    country: "Spain",
    rating: 4,
    image: "/avatars/avatar-14.jpg",
  },
  {
    quote: "A trustworthy platform with transparent pricing. No hidden fees.",
    author: "Thabo Zulu",
    title: "Retail Investor",
    country: "South Africa",
    rating: 5,
    image: "/avatars/avatar-15.jpg",
  },
  {
    quote: "The charting tools are incredibly advanced and customizable.",
    author: "Ivan Petrov",
    title: "Chartist",
    country: "Russia",
    rating: 5,
    image: "/avatars/avatar-16.jpg",
  },
  {
    quote:
      "This platform has given me the confidence to take my trading to the next level.",
    author: "Emma Johansson",
    title: "Growth Investor",
    country: "Sweden",
    rating: 5,
    image: "/avatars/avatar-17.jpg",
  },
  {
    quote:
      "The withdrawal process is fast and hassle-free. I got my funds in less than a day.",
    author: "Pablo Torres",
    title: "FX Trader",
    country: "Argentina",
    rating: 5,
    image: "/avatars/avatar-18.jpg",
  },
  {
    quote: "I appreciate the focus on security. I feel safe trading here.",
    author: "Anna de Vries",
    title: "Risk Manager",
    country: "Netherlands",
    rating: 5,
    image: "/avatars/avatar-19.jpg",
  },
  {
    quote:
      "The best platform for automated trading strategies. The API is robust and well-documented.",
    author: "Wei Chen",
    title: "Algo Trader",
    country: "China",
    rating: 5,
    image: "/avatars/avatar-20.jpg",
  },
];

const TrustpilotRating = () => (
  <div className="flex items-center justify-center gap-2 text-lg text-gray-300">
    <SiTrustpilot className="text-green-500" size={24} />
    <span className="font-bold">4.5</span>
    <FaStar className="text-gray-300" size={18} />
    <span>on Trustpilot</span>
  </div>
);

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 7000); // Change testimonial every 7 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-gray-900 text-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-12">
          What Our Traders Say
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <Image
              src={currentTestimonial.image}
              alt={currentTestimonial.author}
              width={100}
              height={100}
              className="rounded-full mb-4 border-4 border-indigo-500 shadow-lg"
            />
            <div className="mb-4">
              <TrustpilotRating />
            </div>
            <blockquote className="text-xl italic leading-8 mb-6">
              <p>"{currentTestimonial.quote}"</p>
            </blockquote>
            <figcaption className="text-lg font-semibold">
              <div className="flex items-center justify-center gap-x-2">
                <span>{currentTestimonial.author}</span>
                <VscVerifiedFilled className="text-blue-500" />
              </div>
              <span className="block text-base font-normal text-gray-400">
                {currentTestimonial.title}, {currentTestimonial.country}
              </span>
            </figcaption>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Testimonials;
