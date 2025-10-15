"use client";

import React from "react";
import { BookOpen, BarChart3 } from "lucide-react";

export default function TradingJournal() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Trading Journal</h3>
          <div className="text-sm text-gray-400">Recent trades</div>
        </div>
        <p className="text-gray-300 text-sm mt-2">
          Log trades and analyze performance over time.
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-medium">AAPL</div>
              <div className="text-xs text-gray-400">Bought 10 @ $150</div>
            </div>
            <div className="text-white font-medium">$1,500</div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-medium">TSLA</div>
              <div className="text-xs text-gray-400">Sold 3 @ $320</div>
            </div>
            <div className="text-white font-medium">$960</div>
          </div>
        </div>
      </div>
    </div>
  );
}
