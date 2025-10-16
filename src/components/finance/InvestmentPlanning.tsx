"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Target,
  TrendingUp,
  Calculator,
  PieChart,
  DollarSign,
  Zap,
  Clock,
  BarChart3,
} from "lucide-react";

interface MonteCarloResult {
  percentile: number;
  value: number;
}

export default function InvestmentPlanning() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [retirementGoal, setRetirementGoal] = useState(1000000);

  const [monteCarloResults, setMonteCarloResults] = useState<
    MonteCarloResult[]
  >([]);
  const [projectedValue, setProjectedValue] = useState(0);
  const [successProbability, setSuccessProbability] = useState(0);

  // Calculate retirement projections
  useEffect(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyRate = expectedReturn / 100 / 12;

    // Future value of current savings
    const futureValueCurrent =
      currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement);

    // Future value of monthly contributions (annuity)
    const futureValueContributions =
      monthlyContribution *
      ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);

    const total = futureValueCurrent + futureValueContributions;
    setProjectedValue(total);

    // Mock Monte Carlo simulation
    const results: MonteCarloResult[] = [
      { percentile: 10, value: total * 0.6 },
      { percentile: 25, value: total * 0.8 },
      { percentile: 50, value: total },
      { percentile: 75, value: total * 1.2 },
      { percentile: 90, value: total * 1.5 },
    ];
    setMonteCarloResults(results);

    // Calculate success probability
    const success =
      total >= retirementGoal
        ? 85
        : Math.max(20, (total / retirementGoal) * 85);
    setSuccessProbability(success);
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    expectedReturn,
    retirementGoal,
  ]);

  const requiredMonthlyForGoal = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyRate = expectedReturn / 100 / 12;
    const futureValueCurrent =
      currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement);
    const remainingNeeded = retirementGoal - futureValueCurrent;

    if (remainingNeeded <= 0) return 0;

    return (
      remainingNeeded /
      ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate)
    );
  };

  const goals = [
    {
      name: "Emergency Fund",
      target: 50000,
      current: 35000,
      timeline: "6 months",
    },
    {
      name: "House Down Payment",
      target: 100000,
      current: 25000,
      timeline: "3 years",
    },
    {
      name: "Retirement",
      target: retirementGoal,
      current: projectedValue,
      timeline: `${retirementAge - currentAge} years`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Retirement Calculator */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">
          Retirement Calculator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Current Age
            </label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Retirement Age
            </label>
            <input
              type="number"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Expected Return (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Current Savings ($)
            </label>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Monthly Contribution ($)
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Retirement Goal ($)
            </label>
            <input
              type="number"
              value={retirementGoal}
              onChange={(e) => setRetirementGoal(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-400">Projected</span>
            </div>
            <p className="text-lg font-bold text-white">
              $
              {projectedValue.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-green-400">At retirement</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400">Success Rate</span>
            </div>
            <p className="text-lg font-bold text-white">
              {successProbability.toFixed(0)}%
            </p>
            <p className="text-xs text-blue-400">Goal achievement</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-purple-400">Required</span>
            </div>
            <p className="text-lg font-bold text-white">
              $
              {requiredMonthlyForGoal().toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-purple-400">Monthly for goal</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-orange-400">Years Left</span>
            </div>
            <p className="text-lg font-bold text-white">
              {retirementAge - currentAge}
            </p>
            <p className="text-xs text-orange-400">To retirement</p>
          </motion.div>
        </div>
      </div>

      {/* Monte Carlo Simulation */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">
          Monte Carlo Simulation (10,000 scenarios)
        </h4>
        <div className="space-y-2">
          {monteCarloResults.map((result) => (
            <div
              key={result.percentile}
              className="flex items-center justify-between p-2 bg-gray-900 rounded"
            >
              <div className="text-gray-300">
                {result.percentile}th percentile
              </div>
              <div className="text-white font-medium">
                $
                {result.value.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Tracking */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Goal Progress Tracking</h4>
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.name} className="p-3 bg-gray-900 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{goal.name}</div>
                  <div className="text-sm text-gray-400">{goal.timeline}</div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-300">
                    ${goal.current.toLocaleString()} / $
                    {goal.target.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-400">
                    {progress.toFixed(1)}%
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Allocation Recommendations */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">
          Recommended Asset Allocation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">60%</div>
            <div className="text-sm text-gray-300">Stocks</div>
            <div className="text-xs text-gray-400">Growth focused</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">30%</div>
            <div className="text-sm text-gray-300">Bonds</div>
            <div className="text-xs text-gray-400">Stability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">10%</div>
            <div className="text-sm text-gray-300">Alternatives</div>
            <div className="text-xs text-gray-400">Diversification</div>
          </div>
        </div>
      </div>
    </div>
  );
}
