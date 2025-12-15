"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TraderoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Traderoom error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">
          Trading Room Error
        </h1>

        <p className="text-gray-400 mb-6">
          Failed to load trading data. Market data connection may have been
          interrupted.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-500 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reconnect
          </button>

          <Link
            href="/traderoom"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Reload Traderoom
          </Link>
        </div>
      </div>
    </div>
  );
}
