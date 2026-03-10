"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    // Log error to console in development
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      <div
        className="max-w-sm w-full rounded-lg p-4 text-center"
        style={{
          background: isDark
            ? "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: isDark
            ? "0 10px 30px -5px rgba(0, 0, 0, 0.5)"
            : "0 8px 30px -4px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1)",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        <h1 className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          Something went wrong
        </h1>

        <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>

        {error.digest && (
          <p className={`text-xs mb-4 font-mono ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
