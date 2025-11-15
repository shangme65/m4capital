"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Eye,
  MousePointer,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface ActivityData {
  activities: any[];
  summary: {
    totalActivities: number;
    uniqueUsers: number;
    activityCounts: { type: string; count: number }[];
    hourlyActivity: { hour: string; count: number }[];
    topPages: { page: string; count: number }[];
    topActions: { action: string; count: number }[];
  };
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<ActivityData | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedType]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ timeRange });
      if (selectedType) params.append("activityType", selectedType);

      const response = await fetch(`/api/analytics/stats?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const activityTypeColors: { [key: string]: string } = {
    PAGE_VIEW: "bg-blue-500",
    BUTTON_CLICK: "bg-green-500",
    API_CALL: "bg-purple-500",
    TELEGRAM_COMMAND: "bg-cyan-500",
    TELEGRAM_MESSAGE: "bg-teal-500",
    LOGIN: "bg-yellow-500",
    LOGOUT: "bg-orange-500",
    SIGNUP: "bg-pink-500",
    DEPOSIT: "bg-emerald-500",
    WITHDRAWAL: "bg-red-500",
    TRADE: "bg-indigo-500",
    KYC_SUBMISSION: "bg-violet-500",
    SETTINGS_UPDATE: "bg-fuchsia-500",
    ERROR: "bg-rose-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor user activities and platform interactions
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("24h")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === "24h"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === "7d"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === "30d"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange("90d")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === "90d"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                90 Days
              </button>
            </div>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {analyticsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">
                    {analyticsData.summary.totalActivities}
                  </span>
                </div>
                <h3 className="text-sm font-medium opacity-90">
                  Total Activities
                </h3>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">
                    {analyticsData.summary.uniqueUsers}
                  </span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Unique Users</h3>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">
                    {analyticsData.summary.activityCounts.find(
                      (a) => a.type === "PAGE_VIEW"
                    )?.count || 0}
                  </span>
                </div>
                <h3 className="text-sm font-medium opacity-90">Page Views</h3>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">
                    {analyticsData.summary.activityCounts.find(
                      (a) => a.type === "BUTTON_CLICK"
                    )?.count || 0}
                  </span>
                </div>
                <h3 className="text-sm font-medium opacity-90">
                  Button Clicks
                </h3>
              </div>
            </div>

            {/* Activity Types */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Activity by Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {analyticsData.summary.activityCounts.map((activity) => (
                  <button
                    key={activity.type}
                    onClick={() =>
                      setSelectedType(
                        selectedType === activity.type ? null : activity.type
                      )
                    }
                    className={`p-4 rounded-lg text-left transition ${
                      selectedType === activity.type
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-full h-2 rounded mb-2 ${
                        activityTypeColors[activity.type] || "bg-gray-500"
                      }`}
                    ></div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activity.count}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {activity.type.replace(/_/g, " ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📄 Top Pages
                </h2>
                <div className="space-y-3">
                  {analyticsData.summary.topPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                        {page.page || "Unknown"}
                      </span>
                      <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-bold">
                        {page.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🎯 Top Actions
                </h2>
                <div className="space-y-3">
                  {analyticsData.summary.topActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                        {action.action || "Unknown"}
                      </span>
                      <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-bold">
                        {action.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📋 Recent Activities
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {analyticsData.activities.slice(0, 50).map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {activity.user?.name ||
                            activity.user?.email ||
                            "Anonymous"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-white text-xs ${
                              activityTypeColors[activity.activityType] ||
                              "bg-gray-500"
                            }`}
                          >
                            {activity.activityType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {activity.page || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                          {activity.action || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
