"use client";
import React from "react";

const testimonials = [
  {
    quote:
      "This platform has completely changed the way I trade. The insights and tools are top-notch.",
    author: "John Doe",
    title: "Full-time Trader",
  },
  {
    quote:
      "An essential tool for any serious forex trader. The real-time data is incredibly accurate.",
    author: "Jane Smith",
    title: "Financial Analyst",
  },
  {
    quote:
      "I've seen a significant improvement in my trading performance since I started using this service.",
    author: "Samuel Green",
    title: "Hobbyist Investor",
  },
];

const Testimonials: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        What Our Users Say
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="text-lg italic mb-4">"{testimonial.quote}"</p>
            <p className="text-right font-bold">{testimonial.author}</p>
            <p className="text-right text-sm text-gray-400">
              {testimonial.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
