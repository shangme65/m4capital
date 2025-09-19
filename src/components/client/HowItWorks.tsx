"use client";
import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "1. Create an Account",
    description:
      "Sign up in minutes with our simple and secure registration process.",
  },
  {
    title: "2. Fund Your Account",
    description: "Deposit funds using a variety of secure payment methods.",
  },
  {
    title: "3. Start Trading",
    description:
      "Access global markets and start trading your favorite assets.",
  },
];

const HowItWorks = () => {
  return (
    <div className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get Started in 3 Simple Steps
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our streamlined process makes it easy for you to start trading in no
            time.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="flex flex-col p-8 bg-gray-800 rounded-lg shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <dt className="text-2xl font-semibold leading-7 text-white">
                  {step.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{step.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
