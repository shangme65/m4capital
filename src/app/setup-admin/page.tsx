"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initializeAdmin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/init-admin");
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to initialize admin");
      }
    } catch (err) {
      setError(
        "Network error: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const removeOtherAdmins = async () => {
    if (
      !confirm(
        "This will remove all admin accounts except the origin admin. Continue?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/remove-other-admins", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to remove other admins");
      }
    } catch (err) {
      setError(
        "Network error: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Setup</h1>

        <div className="space-y-6">
          {/* Initialize Admin Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              1. Initialize Origin Admin
            </h2>
            <p className="text-gray-600 mb-4">
              Create or update the super admin account using credentials from
              your .env file.
              <br />
              <span className="text-sm text-gray-500">
                (ORIGIN_ADMIN_EMAIL, ORIGIN_ADMIN_PASSWORD, ORIGIN_ADMIN_NAME)
              </span>
            </p>
            <button
              onClick={initializeAdmin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Initializing..." : "Initialize Admin"}
            </button>
          </div>

          {/* Remove Other Admins Section */}
          <div className="border border-red-200 rounded-lg p-6 bg-red-50">
            <h2 className="text-xl font-semibold text-red-800 mb-3">
              2. Remove Other Admins (Optional)
            </h2>
            <p className="text-red-600 mb-4">
              Remove all admin accounts except the origin admin. This helps
              clean up test/dev admins.
              <br />
              <span className="text-sm text-red-500">
                ⚠️ This will soft-delete all admins except the one set in
                ORIGIN_ADMIN_EMAIL
              </span>
            </p>
            <button
              onClick={removeOtherAdmins}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Processing..." : "Remove Other Admins"}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Success
              </h3>
              <p className="text-green-700 mb-3">{result.message}</p>
              <pre className="bg-white p-4 rounded border border-green-200 overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.action === "created" && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push("/api/auth/signin")}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ❌ Error
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              📋 Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>
                Make sure you've set ORIGIN_ADMIN_EMAIL and
                ORIGIN_ADMIN_PASSWORD in your .env file
              </li>
              <li>
                Click "Initialize Admin" to create/update the super admin
                account
              </li>
              <li>
                The admin will be automatically verified (no email verification
                needed)
              </li>
              <li>
                You can now login using the credentials from your .env file
              </li>
              <li>
                (Optional) Use "Remove Other Admins" to clean up test accounts
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
