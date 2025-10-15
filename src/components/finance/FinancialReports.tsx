"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PieChart,
  BarChart3,
  Printer,
  Mail,
  Share2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Settings,
  Bookmark,
  Star,
  Archive,
  ExternalLink,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: "monthly" | "quarterly" | "annual" | "tax" | "custom";
  date: string;
  status: "ready" | "processing" | "scheduled";
  size: string;
  description: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  downloadCount: number;
  isFavorite: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  frequency: string;
  estimatedTime: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    title: "2024 Annual Portfolio Report",
    type: "annual",
    date: "2024-12-31",
    status: "ready",
    size: "2.4 MB",
    description:
      "Comprehensive annual performance analysis and portfolio review",
    category: "Performance",
    tags: ["Annual", "Performance", "Summary"],
    lastUpdated: "2024-01-15",
    downloadCount: 12,
    isFavorite: true,
  },
  {
    id: "2",
    title: "Q4 2024 Quarterly Report",
    type: "quarterly",
    date: "2024-12-31",
    status: "ready",
    size: "1.8 MB",
    description: "Quarterly performance metrics and market analysis",
    category: "Performance",
    tags: ["Quarterly", "Q4", "Analysis"],
    lastUpdated: "2024-01-08",
    downloadCount: 8,
    isFavorite: false,
  },
  {
    id: "3",
    title: "2024 Tax Statement",
    type: "tax",
    date: "2024-12-31",
    status: "processing",
    size: "Processing...",
    description:
      "Annual tax statement with capital gains and dividend information",
    category: "Tax",
    tags: ["Tax", "1099", "Capital Gains"],
    lastUpdated: "2024-01-15",
    downloadCount: 0,
    isFavorite: true,
  },
  {
    id: "4",
    title: "December 2024 Monthly Report",
    type: "monthly",
    date: "2024-12-31",
    status: "ready",
    size: "1.2 MB",
    description: "Monthly portfolio performance and transaction summary",
    category: "Performance",
    tags: ["Monthly", "December", "Transactions"],
    lastUpdated: "2024-01-05",
    downloadCount: 15,
    isFavorite: false,
  },
  {
    id: "5",
    title: "Risk Assessment Report",
    type: "custom",
    date: "2024-01-15",
    status: "scheduled",
    size: "Scheduled",
    description: "Comprehensive risk analysis and stress testing results",
    category: "Risk",
    tags: ["Risk", "Stress Test", "Analysis"],
    lastUpdated: "2024-01-14",
    downloadCount: 0,
    isFavorite: false,
  },
];

const reportTemplates: ReportTemplate[] = [
  {
    id: "performance-summary",
    name: "Performance Summary",
    description: "Overview of portfolio performance metrics",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "Performance",
    frequency: "Monthly/Quarterly",
    estimatedTime: "2-3 minutes",
  },
  {
    id: "tax-statement",
    name: "Tax Statement",
    description: "Complete tax documentation for filing",
    icon: <Receipt className="w-5 h-5" />,
    category: "Tax",
    frequency: "Annual",
    estimatedTime: "5-10 minutes",
  },
  {
    id: "holdings-detail",
    name: "Holdings Detail",
    description: "Comprehensive breakdown of all holdings",
    icon: <PieChart className="w-5 h-5" />,
    category: "Holdings",
    frequency: "On-demand",
    estimatedTime: "1-2 minutes",
  },
  {
    id: "transaction-history",
    name: "Transaction History",
    description: "Detailed transaction log with filters",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "Transactions",
    frequency: "On-demand",
    estimatedTime: "1-2 minutes",
  },
  {
    id: "dividend-report",
    name: "Dividend Report",
    description: "Analysis of dividend income and projections",
    icon: <DollarSign className="w-5 h-5" />,
    category: "Income",
    frequency: "Quarterly",
    estimatedTime: "2-3 minutes",
  },
  {
    id: "risk-analysis",
    name: "Risk Analysis",
    description: "Portfolio risk metrics and stress testing",
    icon: <AlertTriangle className="w-5 h-5" />,
    category: "Risk",
    frequency: "Monthly",
    estimatedTime: "3-5 minutes",
  },
];

export function FinancialReports() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const reportTypes = [
    { value: "all", label: "All Reports", count: mockReports.length },
    {
      value: "monthly",
      label: "Monthly",
      count: mockReports.filter((r) => r.type === "monthly").length,
    },
    {
      value: "quarterly",
      label: "Quarterly",
      count: mockReports.filter((r) => r.type === "quarterly").length,
    },
    {
      value: "annual",
      label: "Annual",
      count: mockReports.filter((r) => r.type === "annual").length,
    },
    {
      value: "tax",
      label: "Tax",
      count: mockReports.filter((r) => r.type === "tax").length,
    },
    {
      value: "custom",
      label: "Custom",
      count: mockReports.filter((r) => r.type === "custom").length,
    },
  ];

  const filteredReports = mockReports
    .filter((report) => selectedType === "all" || report.type === selectedType)
    .filter(
      (report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) => {
      const multiplier = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "date")
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier
        );
      if (sortBy === "title")
        return a.title.localeCompare(b.title) * multiplier;
      if (sortBy === "size")
        return (parseFloat(a.size) - parseFloat(b.size)) * multiplier;
      return 0;
    });

  const handleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReports(
      selectedReports.length === filteredReports.length
        ? []
        : filteredReports.map((r) => r.id)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />;
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "quarterly":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "monthly":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "tax":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "custom":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Financial Reports
            </h2>
            <p className="text-gray-400">
              Generate, manage, and download your financial reports
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">
                  Generate New Report
                </h3>
                <p className="text-gray-400 mt-1">
                  Choose a report template to get started
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-orange-500/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                          {template.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {template.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {template.category}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{template.frequency}</span>
                        <span>{template.estimatedTime}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Report Type Filter */}
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === type.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="size">Sort by Size</option>
            </select>
            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              {sortOrder === "desc" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-orange-400 font-medium">
              {selectedReports.length} report
              {selectedReports.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>Download All</span>
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center space-x-1">
                <Archive className="w-3 h-3" />
                <span>Archive</span>
              </button>
              <button
                onClick={() => setSelectedReports([])}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={
                  selectedReports.length === filteredReports.length &&
                  filteredReports.length > 0
                }
                onChange={handleSelectAll}
                className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
              />
              <span className="text-gray-300 font-medium">
                {filteredReports.length} report
                {filteredReports.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedReports.includes(report.id)}
                  onChange={() => handleSelectReport(report.id)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 mt-1"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-medium">
                          {report.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getTypeColor(
                            report.type
                          )}`}
                        >
                          {report.type.charAt(0).toUpperCase() +
                            report.type.slice(1)}
                        </span>
                        {report.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {report.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Generated:{" "}
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                        <span>Size: {report.size}</span>
                        <span>Downloads: {report.downloadCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <span className="text-sm text-gray-400 capitalize">
                        {report.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {report.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Star
                          className={`w-4 h-4 ${
                            report.isFavorite
                              ? "fill-current text-yellow-400"
                              : ""
                          }`}
                        />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-orange-400 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                        disabled={report.status !== "ready"}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No reports found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Generate your first report to get started"}
            </p>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
