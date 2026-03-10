"use client";

import { useTheme } from "@/contexts/ThemeContext";

export default function DatabaseErrorPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" : "bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100"}`}>
      <div className={`max-w-md w-full rounded-lg shadow-2xl p-8 text-center ${isDark ? "bg-slate-800" : "bg-white"}`}>
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
          Database Connection Issue
        </h1>
        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Unable to connect to the database. This may be a temporary issue with
          serverless cold starts.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
