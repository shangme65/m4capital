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
  RefreshCw,
  ArrowLeft,
  Clock,
  Globe,
  Zap,
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
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
    <div className="text-white">
      {/* Page Header */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800/50 rounded-lg -ml-1.5 mb-3"
        >
          <ArrowLeft size={16} />
          <span className="text-xs font-medium">Back</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.4)]">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Analytics Dashboard</h2>
            <p className="text-[10px] text-gray-400">Monitor user activities</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 mb-3 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap gap-1.5 items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {[
              { value: "24h", label: "24h" },
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  timeRange === range.value
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_2px_0_0_#c2410c]"
                    : "bg-gray-700/50 text-gray-300 border border-gray-600/50"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-xs shadow-[0_2px_0_0_#c2410c] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {analyticsData && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  {analyticsData.summary.totalActivities.toLocaleString()}
                </span>
              </div>
              <h3 className="text-[10px] font-medium text-gray-400">Total Activities</h3>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  {analyticsData.summary.uniqueUsers.toLocaleString()}
                </span>
              </div>
              <h3 className="text-[10px] font-medium text-gray-400">Unique Users</h3>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Eye className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  {(analyticsData.summary.activityCounts.find(
                    (a) => a.type === "PAGE_VIEW"
                  )?.count || 0).toLocaleString()}
                </span>
              </div>
              <h3 className="text-[10px] font-medium text-gray-400">Page Views</h3>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-base font-bold text-white">
                  {(analyticsData.summary.activityCounts.find(
                    (a) => a.type === "BUTTON_CLICK"
                  )?.count || 0).toLocaleString()}
                </span>
              </div>
              <h3 className="text-[10px] font-medium text-gray-400">Interactions</h3>
            </div>
          </div>

          {/* Activity Types */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 mb-3 shadow-[0_3px_0_0_#1f2937]">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
              Activity by Type
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5">
              {analyticsData.summary.activityCounts.map((activity) => (
                <button
                  key={activity.type}
                  onClick={() =>
                    setSelectedType(
                      selectedType === activity.type ? null : activity.type
                    )
                  }
                  className={`p-2 rounded-lg text-left transition-all bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700 ${
                    selectedType === activity.type
                      ? "ring-2 ring-orange-500 bg-gray-700"
                      : ""
                  }`}
                >
                  <div
                    className={`w-full h-1 rounded-full mb-1.5 ${
                      activityTypeColors[activity.type] || "bg-gray-500"
                    }`}
                  ></div>
                  <div className="text-sm font-bold text-white">
                    {activity.count.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-400 truncate">
                    {activity.type.replace(/_/g, " ")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Pages & Actions */}
          <div className="grid md:grid-cols-2 gap-2 mb-3">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
              <h2 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Top Pages
              </h2>
              <div className="space-y-1">
                {analyticsData.summary.topPages.slice(0, 5).map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 bg-gray-700/40 rounded-md border border-gray-600/30"
                  >
                    <span className="text-[10px] font-medium text-gray-300 truncate flex-1">
                      {page.page || "Unknown"}
                    </span>
                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold">
                      {page.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
              <h2 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                Top Actions
              </h2>
              <div className="space-y-1">
                {analyticsData.summary.topActions.slice(0, 5).map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 bg-gray-700/40 rounded-md border border-gray-600/30"
                  >
                    <span className="text-[10px] font-medium text-gray-300 truncate flex-1">
                      {action.action || "Unknown"}
                    </span>
                    <span className="ml-1.5 px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold">
                      {action.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2.5 shadow-[0_3px_0_0_#1f2937]">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Recent Activities
            </h2>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-[10px]">
                <thead className="bg-gray-700/50 border-b border-gray-600/50">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-400 uppercase">
                      Time
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-400 uppercase">
                      User
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-400 uppercase">
                      Type
                    </th>
                    <th className="px-2 py-1.5 text-left font-medium text-gray-400 uppercase">
                      Page
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {analyticsData.activities.slice(0, 20).map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-2 py-1.5 text-gray-300 whitespace-nowrap">
                        {new Date(activity.createdAt).toLocaleString()}
                      </td>
                      <td className="px-2 py-1.5 text-gray-300">
                        {activity.user?.name ||
                          activity.user?.email?.split('@')[0] ||
                          "Anon"}
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-white text-[9px] font-medium ${
                            activityTypeColors[activity.activityType] ||
                            "bg-gray-500"
                          }`}
                        >
                          {activity.activityType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-gray-300 truncate max-w-[100px]">
                        {activity.page || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loading && !analyticsData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
            <p className="text-gray-400 text-xs">Loading data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
