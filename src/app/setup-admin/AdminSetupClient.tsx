"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/client/ConfirmDialog";

interface AdminSetupClientProps {
  adminExists: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export default function AdminSetupClient({
  adminExists,
  isAuthenticated,
  isAdmin,
}: AdminSetupClientProps) {
  const [initLoading, setInitLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const initializeAdmin = async () => {
    setInitLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/init-admin");
      const data = await response.json();

      if (data.success) {
        setResult(data);

        // After successful initialization, auto-login with credentials
        if (
          (data.action === "created" || data.action === "updated") &&
          data.tempPassword
        ) {
          // Use NextAuth signIn to authenticate
          const loginResult = await signIn("credentials", {
            email: data.admin.email,
            password: data.tempPassword,
            redirect: false,
            callbackUrl: "/dashboard",
          });

          if (loginResult?.ok) {
            // Successfully logged in - redirect to dashboard
            window.location.href = "/dashboard";
          } else {
            setError(
              loginResult?.error ||
                "Admin created but auto-login failed. Please login manually."
            );
          }
        }
      } else {
        setError(data.error || "Failed to initialize admin");
      }
    } catch (err) {
      setError(
        "Network error: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setInitLoading(false);
    }
  };

  const removeOtherAdmins = async () => {
    setRemoveLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/remove-other-admins", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to remove origin admin");
      }
    } catch (err) {
      setError(
        "Network error: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
          {isAuthenticated && isAdmin && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
              Authenticated
            </span>
          )}
          {adminExists && !isAuthenticated && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
              Not Logged In
            </span>
          )}
        </div>

        {!adminExists && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>First-time setup detected:</strong> No admin account
              exists yet. This page is publicly accessible for initial setup.
              After creating an admin, this page will require admin
              authentication.
            </p>
          </div>
        )}

        {adminExists && !isAuthenticated && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Admin already exists:</strong> An admin account exists in
              the database. You can still use this page to reinitialize or
              update the origin admin account from your .env file. For security
              operations, please{" "}
              <a href="/?login=true" className="underline font-semibold">
                login as admin
              </a>
              .
            </p>
          </div>
        )}

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
              disabled={initLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {initLoading ? "Initializing..." : "Initialize Admin"}
            </button>
          </div>

          {/* Remove Other Admins Section */}
          <div className="border border-red-200 rounded-lg p-6 bg-red-50">
            <h2 className="text-xl font-semibold text-red-800 mb-3">
              2. Remove Origin Admin (Optional)
            </h2>
            <p className="text-red-600 mb-4">
              Remove the origin admin account. This helps clean up the admin if
              you want to start fresh.
              <br />
              <span className="text-sm text-red-500">
                ⚠️ This will soft-delete the admin set in ORIGIN_ADMIN_EMAIL
              </span>
            </p>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={removeLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {removeLoading ? "Processing..." : "Remove Origin Admin"}
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
                    onClick={() => router.push("/?login=true")}
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
                (Optional) Use "Remove Origin Admin" to clean up the admin
                account
              </li>
            </ol>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <ConfirmDialog
          title="Remove Origin Admin"
          message="This will remove the origin admin account. Continue?"
          confirmText="Remove Admin"
          cancelText="Cancel"
          variant="danger"
          onConfirm={removeOtherAdmins}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
}
