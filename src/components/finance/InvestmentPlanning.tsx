"use client";

import React from "react";
import { Calendar, Target } from "lucide-react";

export default function InvestmentPlanning() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Investment Planning</h3>
          <div className="text-sm text-gray-400">Projected goals</div>
        </div>
        <p className="text-gray-300 text-sm mt-2">
          Simple calculators and projection summaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="text-xs text-gray-400">Retirement Target</div>
            <div className="text-white font-medium text-lg">$1,200,000</div>
            <div className="text-sm text-gray-400">Projected by age 65</div>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="text-xs text-gray-400">Monthly Savings Needed</div>
            <div className="text-white font-medium text-lg">$1,200</div>
            <div className="text-sm text-gray-400">Based on target above</div>
          </div>
        </div>
      </div>
    </div>
  );
}
