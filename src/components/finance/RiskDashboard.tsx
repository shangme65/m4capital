"use client";

import React from "react";
import { AlertTriangle, PieChart, Zap } from "lucide-react";

export default function RiskDashboard() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Risk Management</h3>
          <div className="text-sm text-gray-400">Last updated: today</div>
        </div>
        <p className="text-gray-300 text-sm mt-2">
          Quick overview of portfolio risk metrics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-xs text-gray-400">Max Drawdown</div>
                <div className="text-white font-medium">-12.4%</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs text-gray-400">Volatility</div>
                <div className="text-white font-medium">8.6%</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Zap className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-xs text-gray-400">Beta</div>
                <div className="text-white font-medium">0.92</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
