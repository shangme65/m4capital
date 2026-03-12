"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-2xl p-8 text-center ${isDark ? "bg-gray-800" : "bg-white shadow-lg border border-gray-200"}`}>
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Dashboard Error</h1>

        <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          We couldn&apos;t load your dashboard. This might be a temporary issue.
        </p>

        {error.digest && (
          <p className={`text-xs mb-6 font-mono ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>

          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Reload
          </Link>
        </div>
      </div>
    </div>
  );
}
