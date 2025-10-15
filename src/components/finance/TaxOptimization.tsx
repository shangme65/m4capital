"use client";

import React from "react";
import { FileText, CreditCard } from "lucide-react";

export default function TaxOptimization() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Tax Optimization</h3>
          <div className="text-sm text-gray-400">Tax tools</div>
        </div>
        <p className="text-gray-300 text-sm mt-2">
          Tools to help with tax-loss harvesting and reporting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="text-xs text-gray-400">Potential Harvest</div>
            <div className="text-white font-medium">$1,240</div>
            <div className="text-sm text-gray-400">
              Opportunities identified
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="text-xs text-gray-400">Estimated Tax Savings</div>
            <div className="text-white font-medium">$320</div>
            <div className="text-sm text-gray-400">
              Based on current strategy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
