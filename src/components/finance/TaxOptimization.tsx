"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CreditCard,
  Calculator,
  Download,
  TrendingDown,
  DollarSign,
  Calendar,
  Percent,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Target,
  Clock,
} from "lucide-react";

interface TaxLossOpportunity {
  id: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  costBasis: number;
  unrealizedLoss: number;
  holdingPeriod: number; // days
  taxSavings: number;
}

interface TaxDocument {
  id: string;
  type: string;
  year: number;
  status: "READY" | "PENDING" | "DRAFT";
  downloadUrl?: string;
}

export default function TaxOptimization() {
  const [selectedTaxYear, setSelectedTaxYear] = useState(2024);
  const [taxBracket, setTaxBracket] = useState(22); // 22% bracket
  const [showHarvestModal, setShowHarvestModal] = useState(false);

  const taxLossOpportunities: TaxLossOpportunity[] = [
    {
      id: "1",
      symbol: "NFLX",
      quantity: 5,
      currentPrice: 380.0,
      costBasis: 450.0,
      unrealizedLoss: -350.0,
      holdingPeriod: 45,
      taxSavings: 77.0,
    },
    {
      id: "2",
      symbol: "META",
      quantity: 8,
      currentPrice: 280.0,
      costBasis: 320.0,
      unrealizedLoss: -320.0,
      holdingPeriod: 120,
      taxSavings: 70.4,
    },
    {
      id: "3",
      symbol: "ZOOM",
      quantity: 15,
      currentPrice: 65.0,
      costBasis: 95.0,
      unrealizedLoss: -450.0,
      holdingPeriod: 280,
      taxSavings: 99.0,
    },
  ];

  const taxDocuments: TaxDocument[] = [
    { id: "1", type: "1099-B", year: 2024, status: "READY" },
    { id: "2", type: "Tax Summary", year: 2024, status: "READY" },
    { id: "3", type: "Dividend Report", year: 2024, status: "PENDING" },
    { id: "4", type: "Crypto Transactions", year: 2024, status: "DRAFT" },
  ];

  const totalHarvestable = taxLossOpportunities.reduce(
    (sum, opp) => sum + Math.abs(opp.unrealizedLoss),
    0
  );
  const totalTaxSavings = taxLossOpportunities.reduce(
    (sum, opp) => sum + opp.taxSavings,
    0
  );

  // TODO: REPLACE WITH REAL TAX DATA FROM USER TRANSACTIONS
  // These mock values need to be calculated from actual trading history:
  // - yearToDateGains: Sum of all realized gains from Prisma transactions
  // - yearToDateLosses: Sum of all realized losses from Prisma transactions
  // - Calculate from: await prisma.trade.findMany({ where: { userId, status: 'closed' } })
  // - NEVER use these hardcoded values in production
  const yearToDateGains = 12450.0; // Mock data
  const yearToDateLosses = 3200.0;
  const netTaxableGains = yearToDateGains - yearToDateLosses;

  const handleHarvestLoss = (opportunityId: string) => {
    // In production, this would execute the tax-loss harvesting
    console.log(`Harvesting loss for opportunity ${opportunityId}`);
    alert("Tax-loss harvesting executed successfully!");
  };

  const downloadDocument = (doc: TaxDocument) => {
    // Mock download functionality
    console.log(`Downloading ${doc.type} for ${doc.year}`);
    alert(`Downloading ${doc.type} for ${doc.year}`);
  };

  return (
    <div className="space-y-4">
      {/* Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-400">Harvestable</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${totalHarvestable.toLocaleString()}
          </p>
          <p className="text-xs text-red-400">Unrealized losses</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">Tax Savings</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${totalTaxSavings.toLocaleString()}
          </p>
          <p className="text-xs text-green-400">Potential savings</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-blue-400">YTD Gains</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${yearToDateGains.toLocaleString()}
          </p>
          <p className="text-xs text-blue-400">Realized</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400">Net Taxable</span>
          </div>
          <p className="text-lg font-bold text-white">
            ${netTaxableGains.toLocaleString()}
          </p>
          <p className="text-xs text-purple-400">After losses</p>
        </motion.div>
      </div>

      {/* Tax Settings */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Tax Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tax Year</label>
            <select
              value={selectedTaxYear}
              onChange={(e) => setSelectedTaxYear(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tax Bracket (%)
            </label>
            <select
              value={taxBracket}
              onChange={(e) => setTaxBracket(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value={10}>10%</option>
              <option value={12}>12%</option>
              <option value={22}>22%</option>
              <option value={24}>24%</option>
              <option value={32}>32%</option>
              <option value={35}>35%</option>
              <option value={37}>37%</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Capital Gains Rate (%)
            </label>
            <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
              <option value={0}>0%</option>
              <option value={15}>15%</option>
              <option value={20}>20%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tax-Loss Harvesting Opportunities */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">
            Tax-Loss Harvesting Opportunities
          </h4>
          <button
            onClick={() => setShowHarvestModal(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Harvest All
          </button>
        </div>

        <div className="space-y-2">
          {taxLossOpportunities.map((opportunity) => (
            <motion.div
              key={opportunity.id}
              whileHover={{ scale: 1.01 }}
              className="p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-white font-medium">
                    {opportunity.symbol}
                  </div>
                  <div className="text-sm text-gray-300">
                    {opportunity.quantity} shares @ ${opportunity.currentPrice}
                  </div>
                  <div className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                    Loss: $
                    {Math.abs(opportunity.unrealizedLoss).toLocaleString()}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      opportunity.holdingPeriod > 365
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {opportunity.holdingPeriod > 365
                      ? "Long-term"
                      : "Short-term"}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-green-400 font-medium">
                      ${opportunity.taxSavings} savings
                    </div>
                    <div className="text-xs text-gray-400">
                      {opportunity.holdingPeriod} days held
                    </div>
                  </div>

                  <button
                    onClick={() => handleHarvestLoss(opportunity.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Harvest
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">Tax Documents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {taxDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">{doc.type}</div>
                    <div className="text-sm text-gray-400">{doc.year}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      doc.status === "READY"
                        ? "bg-green-500/20 text-green-400"
                        : doc.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {doc.status}
                  </div>

                  {doc.status === "READY" && (
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Calendar */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">
          Tax Calendar & Deadlines
        </h4>
        <div className="space-y-2">
          {[
            {
              date: "Dec 31, 2024",
              event: "Tax-loss harvesting deadline",
              urgent: true,
            },
            {
              date: "Jan 31, 2025",
              event: "Receive 1099 forms",
              urgent: false,
            },
            {
              date: "Apr 15, 2025",
              event: "Tax filing deadline",
              urgent: true,
            },
            {
              date: "Oct 15, 2025",
              event: "Extension deadline",
              urgent: false,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-900 rounded"
            >
              <div className="flex items-center space-x-3">
                <Calendar
                  className={`w-4 h-4 ${
                    item.urgent ? "text-red-400" : "text-blue-400"
                  }`}
                />
                <div>
                  <div className="text-white font-medium">{item.event}</div>
                  <div className="text-sm text-gray-400">{item.date}</div>
                </div>
              </div>
              {item.urgent && (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Harvest Confirmation Modal */}
      {showHarvestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm Tax-Loss Harvesting
            </h3>
            <p className="text-gray-300 mb-6">
              This will harvest ${totalHarvestable.toLocaleString()} in tax
              losses, potentially saving you ${totalTaxSavings.toLocaleString()}{" "}
              in taxes.
            </p>

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-6">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-300">
                  <div className="font-medium mb-1">Important Notice:</div>
                  <div>
                    Be aware of wash sale rules. You cannot repurchase the same
                    or substantially identical securities within 30 days.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowHarvestModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Execute harvest logic here
                  alert("Tax-loss harvesting executed for all positions!");
                  setShowHarvestModal(false);
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Confirm Harvest
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
