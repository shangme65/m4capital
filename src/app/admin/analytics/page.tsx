"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Eye,
  MousePointer,
  MessageSquare,
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

  // Auto-reload if stuck on loading screen
  useEffect(() => {
    if (status === "loading" || loading) {
      const reloadTimer = setTimeout(() => {
        console.log("Analytics loading timeout - auto-reloading page");
        window.location.reload();
      }, 5000);
      return () => clearTimeout(reloadTimer);
    }
  }, [status, loading]);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Image
            src="/m4capitallogo1.png"
            alt="M4 Capital"
            width={120}
            height={40}
            className="mx-auto mb-6"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header with Branding */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/m4capitallogo1.png"
              alt="M4 Capital"
              width={100}
              height={35}
              className="object-contain"
            />
            <div className="h-8 w-px bg-gray-700"></div>
            <div>
              <h1 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-[10px] xs:text-xs text-gray-400">
                Complete administrative dashboard
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800/50 rounded-lg -ml-2 mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.4)]">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
              <p className="text-sm text-gray-400">Monitor user activities and platform interactions</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 mb-6 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "24h", label: "24 Hours" },
                { value: "7d", label: "7 Days" },
                { value: "30d", label: "30 Days" },
                { value: "90d", label: "90 Days" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    timeRange === range.value
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_3px_0_0_#c2410c,0_4px_8px_rgba(249,115,22,0.3)]"
                      : "bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:border-orange-500/50 shadow-[0_3px_0_0_#1f2937,0_4px_8px_rgba(0,0,0,0.2)]"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-[0_3px_0_0_#c2410c,0_4px_8px_rgba(249,115,22,0.3)] hover:shadow-[0_1px_0_0_#c2410c,0_2px_4px_rgba(249,115,22,0.3)] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {analyticsData && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {analyticsData.summary.totalActivities.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-400">Total Activities</h3>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {analyticsData.summary.uniqueUsers.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-400">Unique Users</h3>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {(analyticsData.summary.activityCounts.find(
                      (a) => a.type === "PAGE_VIEW"
                    )?.count || 0).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-400">Page Views</h3>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {(analyticsData.summary.activityCounts.find(
                      (a) => a.type === "BUTTON_CLICK"
                    )?.count || 0).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-400">Interactions</h3>
              </div>
            </div>

            {/* Activity Types */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-6 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
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
                    className={`p-4 rounded-xl text-left transition-all bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700 ${
                      selectedType === activity.type
                        ? "ring-2 ring-orange-500 bg-gray-700"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-full h-1.5 rounded-full mb-3 ${
                        activityTypeColors[activity.type] || "bg-gray-500"
                      }`}
                    ></div>
                    <div className="text-xl font-bold text-white">
                      {activity.count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {activity.type.replace(/_/g, " ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Pages & Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Top Pages
                </h2>
                <div className="space-y-2">
                  {analyticsData.summary.topPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/40 rounded-lg border border-gray-600/30 hover:bg-gray-700/60 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-300 truncate flex-1">
                        {page.page || "Unknown"}
                      </span>
                      <span className="ml-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold border border-blue-500/30">
                        {page.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Actions */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  Top Actions
                </h2>
                <div className="space-y-2">
                  {analyticsData.summary.topActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-700/40 rounded-lg border border-gray-600/30 hover:bg-gray-700/60 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-300 truncate flex-1">
                        {action.action || "Unknown"}
                      </span>
                      <span className="ml-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-bold border border-orange-500/30">
                        {action.count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-[0_4px_0_0_#1f2937,0_6px_12px_rgba(0,0,0,0.3)]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Recent Activities
              </h2>
              <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full">
                  <thead className="bg-gray-700/50 border-b border-gray-600/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {analyticsData.activities.slice(0, 50).map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {activity.user?.name ||
                            activity.user?.email ||
                            "Anonymous"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2.5 py-1 rounded-full text-white text-xs font-medium ${
                              activityTypeColors[activity.activityType] ||
                              "bg-gray-500"
                            }`}
                          >
                            {activity.activityType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {activity.page || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
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
